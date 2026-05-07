/**
 * CryptoService.js
 * Handles all End-to-End Encryption (E2EE) logic using the Web Crypto API.
 */

const RSA_PARAMS = {
  name: "RSA-OAEP",
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: "SHA-256",
};

const AES_PARAMS = {
  name: "AES-GCM",
  length: 256,
};

const KW_PARAMS = {
  name: "AES-KW",
  length: 256,
};

/**
 * Utility to convert Buffer to Base64
 */
const bufferToBase64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));

/**
 * Utility to convert Base64 to Buffer
 */
const base64ToBuffer = (base64) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export const cryptoService = {
  /**
   * Generates a new RSA-OAEP key pair for E2EE.
   */
  async generateKeyPair() {
    return await window.crypto.subtle.generateKey(RSA_PARAMS, true, ["encrypt", "decrypt"]);
  },

  /**
   * Exports a public key to SPKI base64 format for the server.
   */
  async exportPublicKey(publicKey) {
    const exported = await window.crypto.subtle.exportKey("spki", publicKey);
    return bufferToBase64(exported);
  },

  /**
   * Imports a public key from SPKI base64 format.
   */
  async importPublicKey(base64) {
    const buf = base64ToBuffer(base64);
    return await window.crypto.subtle.importKey("spki", buf, RSA_PARAMS, true, ["encrypt"]);
  },

  /**
   * Derives a 256-bit AES key from a password using PBKDF2.
   */
  async deriveKey(password, saltBase64 = null) {
    const encoder = new TextEncoder();
    const passwordBuf = encoder.encode(password);
    const salt = saltBase64 ? base64ToBuffer(saltBase64) : window.crypto.getRandomValues(new Uint8Array(16));

    const baseKey = await window.crypto.subtle.importKey(
      "raw",
      passwordBuf,
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      true,
      ["wrapKey", "unwrapKey"]
    );

    return { key: derivedKey, salt: bufferToBase64(salt) };
  },

  /**
   * Wraps (encrypts) a private key using a derived password key.
   */
  async wrapPrivateKey(privateKey, wrappingKey) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const wrapped = await window.crypto.subtle.wrapKey(
      "pkcs8",
      privateKey,
      wrappingKey,
      { name: "AES-GCM", iv }
    );
    
    // Prepend IV to the wrapped key
    const wrappedArray = new Uint8Array(wrapped);
    const combined = new Uint8Array(iv.length + wrappedArray.length);
    combined.set(iv);
    combined.set(wrappedArray, iv.length);
    
    return bufferToBase64(combined.buffer);
  },

  /**
   * Unwraps (decrypts) a private key using a derived password key.
   */
  async unwrapPrivateKey(wrappedKeyBase64, unwrappingKey) {
    const combinedBuf = base64ToBuffer(wrappedKeyBase64);
    const combined = new Uint8Array(combinedBuf);
    
    // Extract IV (first 12 bytes) and the wrapped key
    const iv = combined.slice(0, 12);
    const wrappedBuf = combined.slice(12).buffer;

    return await window.crypto.subtle.unwrapKey(
      "pkcs8",
      wrappedBuf,
      unwrappingKey,
      { name: "AES-GCM", iv },
      RSA_PARAMS,
      true,
      ["decrypt"]
    );
  },

  /**
   * Encrypts a message for a recipient and self.
   * Returns { encryptedKey, encryptedKeyForSelf, ciphertext, iv }
   */
  async encrypt(plaintext, recipientPublicKeyBase64, myPublicKeyBase64) {
    const recipientPublicKey = await this.importPublicKey(recipientPublicKeyBase64);
    const myPublicKey = await this.importPublicKey(myPublicKeyBase64);
    
    // 1. Generate random AES key for this message
    const aesKey = await window.crypto.subtle.generateKey(AES_PARAMS, true, ["encrypt", "decrypt"]);
    
    // 2. Encrypt plaintext with AES-GCM
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encryptedMessage = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      aesKey,
      encoder.encode(plaintext)
    );

    // 3. Encrypt AES key with Recipient's Public RSA Key
    const exportedAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
    const encryptedAesKey = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      recipientPublicKey,
      exportedAesKey
    );

    // 4. Encrypt AES key with Sender's Public RSA Key (for self)
    const encryptedAesKeyForSelf = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      myPublicKey,
      exportedAesKey
    );

    return {
      encryptedKey: bufferToBase64(encryptedAesKey),
      encryptedKeyForSelf: bufferToBase64(encryptedAesKeyForSelf),
      ciphertext: bufferToBase64(encryptedMessage),
      iv: bufferToBase64(iv),
    };
  },

  /**
   * Decrypts a message using the user's private key.
   */
  async decrypt(encryptedData, privateKey) {
    const { encryptedKey, encryptedKeyForSelf, ciphertext, iv, sender_id, my_id } = encryptedData;
    
    // Choose which encrypted key to use based on whether we are sender or recipient
    const keyToDecrypt = (sender_id === my_id) ? encryptedKeyForSelf : encryptedKey;

    if (!keyToDecrypt) throw new Error("No encrypted key available for decryption");

    // 1. Decrypt AES key with our Private RSA Key
    const aesKeyBuf = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      base64ToBuffer(keyToDecrypt)
    );

    const aesKey = await window.crypto.subtle.importKey(
      "raw",
      aesKeyBuf,
      "AES-GCM",
      true,
      ["decrypt"]
    );

    // 2. Decrypt message with AES-GCM
    const decryptedBuf = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBuffer(iv) },
      aesKey,
      base64ToBuffer(ciphertext)
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuf);
  }
};
