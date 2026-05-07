import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { cryptoService } from '../services/cryptoService';
import { socketService } from '../services/socketService';
import api from '../services/apiService';
import { 
  Send, Search, Shield, Settings, LogOut, MessageSquare, 
  User as UserIcon, ShieldCheck, Lock, MoreVertical, 
  Paperclip, Smile, Loader2, AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function ChatPage() {
  const { user, privateKey, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle incoming messages via WebSocket
  useEffect(() => {
    if (!privateKey) return;

    const handleNewMessage = async (msg) => {
      // Only process if it belongs to the current conversation OR it's from us
      if (msg.sender_id === selectedUser?.id || msg.sender_id === user.id) {
        try {
          const decryptedContent = await cryptoService.decrypt({
            ...msg.payload,
            sender_id: msg.sender_id,
            my_id: user.id
          }, privateKey);
          
          setMessages(prev => [...prev, { ...msg, content: decryptedContent }]);
        } catch (error) {
          console.error('Decryption failed for incoming message:', error);
          setMessages(prev => [...prev, { ...msg, content: '[Encrypted Content]', error: true }]);
        }
      }
    };

    socketService.on('message.receive', handleNewMessage);
    return () => socketService.off('message.receive');
  }, [selectedUser, privateKey, user.id]);

  // Search for users
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await api.get(`/users/search?q=${searchQuery}`);
        setUsers(response.data.users.filter(u => u.id !== user.id));
      } catch (error) {
        console.error('Search failed:', error);
      }
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, user.id]);

  // Fetch message history when a user is selected
  useEffect(() => {
    if (!selectedUser || !privateKey) return;

    const fetchHistory = async () => {
      try {
        const response = await api.get(`/conversations/${selectedUser.id}/messages`);
        
        const decryptedMessages = await Promise.all(
          response.data.messages.map(async (msg) => {
            try {
              const decryptedContent = await cryptoService.decrypt({
                ...msg.payload,
                sender_id: msg.sender_id,
                my_id: user.id
              }, privateKey);
              return { ...msg, content: decryptedContent };
            } catch (error) {
              return { ...msg, content: '[Decryption Failed]', error: true };
            }
          })
        );
        
        setMessages(decryptedMessages);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      }
    };

    fetchHistory();
  }, [selectedUser, privateKey, user.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || isSending) return;

    setIsSending(true);
    try {
      // 1. Get recipient's public key
      const pubKeyRes = await api.get(`/users/${selectedUser.id}/public-key`);
      const recipientPubKeyBase64 = pubKeyRes.data.public_key;

      // 2. Encrypt message locally for both recipient and self
      const encryptedPayload = await cryptoService.encrypt(
        newMessage, 
        recipientPubKeyBase64,
        user.public_key // Assuming user object has this
      );

      // 3. Emit via WebSocket
      socketService.emit('message.send', {
        recipient_id: selectedUser.id,
        payload: encryptedPayload
      });

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
    setIsSending(false);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Same as before but with better state handling */}
      <div className="w-80 flex flex-col bg-white border-r border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">WhisperBox</span>
          </div>
          <button onClick={logout} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
            {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
          {users.length > 0 ? (
            <div className="mb-4">
              <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Search</p>
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => { setSelectedUser(u); setSearchQuery(''); setUsers([]); }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-primary-50/50 rounded-2xl transition-all group"
                >
                  <div className="h-11 w-11 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border-2 border-transparent group-hover:border-primary-200 transition-all">
                    {u.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-slate-800 text-sm">{u.username}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Start secure session</p>
                  </div>
                </button>
              ))}
            </div>
          ) : null}

          <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Profile</p>
          <div className="p-4 bg-primary-600 rounded-3xl flex items-center gap-3 mb-4 mx-2 shadow-lg shadow-primary-200">
             <div className="h-10 w-10 bg-white/20 rounded-2xl flex items-center justify-center text-white font-bold backdrop-blur-sm">
                {user.username[0].toUpperCase()}
             </div>
             <div className="flex-1 overflow-hidden">
                <p className="font-bold text-white truncate text-sm">{user.username}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-primary-100 font-bold">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                  KEY ACTIVE
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <>
            <header className="h-20 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-slate-100 z-10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                  {selectedUser.username[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg leading-none mb-1">{selectedUser.username}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-green-600 font-bold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>E2E ENCRYPTED</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-primary-600 border border-transparent hover:border-slate-100">
                  <Search className="h-5 w-5" />
                </button>
                <button className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-primary-600 border border-transparent hover:border-slate-100">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                  <div className="h-20 w-20 bg-primary-50 rounded-[2rem] flex items-center justify-center text-primary-600 mb-6 rotate-12 shadow-inner">
                    <Lock className="h-10 w-10 -rotate-12" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-xl mb-3">Privacy First</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    This conversation is protected by End-to-End Encryption. Only you and <strong>{selectedUser.username}</strong> can read what is sent.
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={msg.id || i}
                    className={cn(
                      "flex flex-col max-w-[75%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                      msg.sender_id === user.id ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "px-5 py-3 rounded-[1.5rem] shadow-sm relative group transition-all",
                        msg.sender_id === user.id 
                          ? "bg-primary-600 text-white rounded-tr-none hover:shadow-primary-100" 
                          : "bg-white text-slate-700 rounded-tl-none border border-slate-100 hover:shadow-slate-100"
                      )}
                    >
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      {msg.error && (
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-red-500 bg-red-50 p-1 rounded-full border border-red-100 shadow-sm">
                           <AlertCircle className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 mt-2 px-2 uppercase tracking-tighter">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
              <form 
                onSubmit={handleSendMessage}
                className="flex items-center gap-4 bg-slate-50 rounded-[2rem] p-3 pl-6 border border-slate-200 focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-500/5 transition-all"
              >
                <button type="button" className="text-slate-400 hover:text-primary-500 transition-colors transform hover:scale-110 active:scale-90">
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  placeholder="Securely message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:outline-none text-slate-800 placeholder:text-slate-400 text-[15px] py-2"
                />
                <button type="button" className="text-slate-400 hover:text-primary-500 transition-colors transform hover:scale-110 active:scale-90">
                  <Smile className="h-5 w-5" />
                </button>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center transition-all shadow-lg",
                    !newMessage.trim() || isSending 
                      ? "bg-slate-200 text-slate-400 shadow-none" 
                      : "bg-primary-600 text-white hover:bg-primary-700 shadow-primary-200 active:scale-90"
                  )}
                >
                  {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50/30">
            <div className="relative mb-8">
               <div className="h-32 w-32 bg-primary-50 rounded-[3rem] flex items-center justify-center text-primary-600 shadow-inner">
                  <ShieldCheck className="h-16 w-16" />
               </div>
               <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-white rounded-2xl shadow-lg flex items-center justify-center text-green-500 border border-slate-100">
                  <Lock className="h-5 w-5" />
               </div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">WhisperBox Secure</h2>
            <p className="text-slate-500 max-w-sm mb-10 leading-relaxed">
              Your messages are encrypted before they even leave your computer. 
              Search for a contact to start your first secure session.
            </p>
            <div className="grid grid-cols-2 gap-6 max-w-2xl w-full">
               <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm text-left group hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                    <Lock className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-black text-slate-800 mb-2">RSA-2048 Auth</p>
                  <p className="text-xs text-slate-500 leading-normal">Military-grade asymmetric encryption ensures only the intended recipient can open the message key.</p>
               </div>
               <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm text-left group hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                    <Shield className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-black text-slate-800 mb-2">AES-GCM Payload</p>
                  <p className="text-xs text-slate-500 leading-normal">High-performance symmetric encryption secures the message content with unique nonces for every send.</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
