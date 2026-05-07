import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/apiService';
import { cryptoService } from '../services/cryptoService';
import { socketService } from '../services/socketService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [privateKey, setPrivateKey] = useState(null); // Keep in memory only
  const [loading, setLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      socketService.connect(token);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { access_token, user: userData, wrapped_private_key, salt } = response.data;

      // 1. Derive the unwrapping key from password
      const { key: unwrappingKey } = await cryptoService.deriveKey(password, salt);

      // 2. Unwrap the private key
      const decryptedPrivateKey = await cryptoService.unwrapPrivateKey(wrapped_private_key, unwrappingKey);

      // 3. Store session
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setPrivateKey(decryptedPrivateKey);
      
      // Connect socket
      socketService.connect(access_token);

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (username, password) => {
    try {
      // 1. Generate E2EE Keypair
      const keyPair = await cryptoService.generateKeyPair();
      const publicKeyBase64 = await cryptoService.exportPublicKey(keyPair.publicKey);

      // 2. Derive wrapping key from password
      const { key: wrappingKey, salt } = await cryptoService.deriveKey(password);

      // 3. Wrap (encrypt) the private key
      const wrappedPrivateKeyBase64 = await cryptoService.wrapPrivateKey(keyPair.privateKey, wrappingKey);

      // 4. Register with server
      await api.post('/auth/register', {
        username,
        password,
        public_key: publicKeyBase64,
        wrapped_private_key: wrappedPrivateKeyBase64,
        salt: salt
      });

      return await login(username, password);
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPrivateKey(null);
    socketService.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, privateKey, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
