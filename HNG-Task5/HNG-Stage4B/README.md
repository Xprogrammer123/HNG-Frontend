# WhisperBox — End-to-End Encrypted Messaging

WhisperBox is a production-ready, secure messaging application built for **HNG Stage 4B**. It implements strict client-side End-to-End Encryption (E2EE), ensuring that the backend acts only as a blind message store and never sees the plaintext content of messages.

## 🔒 Security Architecture

The application uses the **Web Crypto API** for all cryptographic operations, ensuring high performance and hardware-backed security where available.

### 1. Key Management
- **Asymmetric Encryption**: RSA-OAEP (2048-bit) for secure key exchange.
- **Symmetric Encryption**: AES-GCM (256-bit) for bulk message data.
- **Key Protection**: The user's RSA private key is encrypted (wrapped) on the client before being sent to the server.
- **Key Derivation**: PBKDF2 with SHA-256 is used to derive a "Key Wrapping Key" from the user's password. The raw private key **never leaves the device in plaintext**.

### 2. Encryption Flow (E2EE)

```mermaid
sequenceDiagram
    participant Alice
    participant Backend
    participant Bob

    Note over Alice, Bob: Alice wants to send "Hello" to Bob

    Alice->>Backend: Get Bob's Public Key
    Backend-->>Alice: Bob's RSA-OAEP Public Key

    Note right of Alice: 1. Generate random AES-256 Key (K)
    Note right of Alice: 2. Encrypt "Hello" with K (AES-GCM)
    Note right of Alice: 3. Encrypt K with Bob's Public Key
    Note right of Alice: 4. Encrypt K with Alice's Public Key (for history)

    Alice->>Backend: POST /messages { encrypted_content, encrypted_keys }
    Backend->>Bob: WebSocket: incoming_message

    Note left of Bob: 1. Fetch wrapped Private Key
    Note left of Bob: 2. Unwrap Private Key using Alice's password
    Note left of Bob: 3. Decrypt K using Private Key (RSA-OAEP)
    Note left of Bob: 4. Decrypt "Hello" using K (AES-GCM)
```

## 🛠️ Tech Stack
- **Core**: React 18, Vite
- **Encryption**: Web Crypto API (Standard browser implementation)
- **Styling**: Tailwind CSS (Premium Dark Mode & Glassmorphism)
- **Communication**: Axios (REST API), Socket.io-client (Real-time)
- **State Management**: React Context API + React Query

## 🚀 Features
- **Zero-Knowledge Architecture**: The server cannot read your messages.
- **Secure Key Generation**: RSA keys are generated locally during registration.
- **Real-Time Delivery**: Instant message updates via WebSockets.
- **Persistent Decrypted Sessions**: Private keys stay in-memory (volatile) and are wiped on logout.
- **Modern UI**: Smooth animations, glass-morphic cards, and intuitive UX.

## 🛡️ Security Guarantees
- ✅ **Confidentiality**: Only the sender and recipient can read the message.
- ✅ **Integrity**: AES-GCM ensures that messages cannot be tampered with in transit.
- ✅ **No Plaintext Storage**: The backend only stores ciphertext and wrapped keys.
- ✅ **Memory Safety**: Decrypted private keys are never stored in `localStorage` or `sessionStorage`.

## 📦 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up `.env`:
   ```env
   VITE_API_BASE_URL=https://hng-stage4b-backend.example.com/api
   VITE_SOCKET_URL=https://hng-stage4b-backend.example.com
   ```
4. Run locally: `npm run dev`
