import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, User, Bot, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chatbot, ChatMessage } from '../types';

export default function ChatWidget({ chatbot, apiKey }: { chatbot: Chatbot; apiKey?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'model',
        content: chatbot.theme.welcomeMessage,
        timestamp: new Date()
      }]);
    }
  }, [chatbot]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    window.parent.postMessage({ type: 'OMNIBOT_STATE', isOpen }, '*');
  }, [isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !apiKey) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          chatbotId: chatbot.id,
          systemPrompt: chatbot.systemPrompt,
          apiKey: apiKey,
          history: messages.slice(-10).map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
          }))
        })
      });

      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, {
          role: 'model',
          content: data.text,
          timestamp: new Date()
        }]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        content: "Sorry, I encountered an error. Please ensure the vendor's API key is valid.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      window.parent.postMessage('omnibot-open', '*');
    } else {
      window.parent.postMessage('omnibot-close', '*');
    }
  }, [isOpen]);

  const resetChat = () => {
    setMessages([{
      role: 'model',
      content: chatbot.theme.welcomeMessage,
      timestamp: new Date()
    }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="mb-4 w-[350px] md:w-[400px] h-[550px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <header className="p-4 flex items-center justify-between text-white shadow-lg" style={{ backgroundColor: chatbot.theme.primaryColor }}>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                   {chatbot.theme.avatarUrl ? (
                     <img src={chatbot.theme.avatarUrl} alt="Bot Avatar" className="h-full w-full object-cover" />
                   ) : (
                     <Bot className="h-6 w-6 text-white" />
                   )}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{chatbot.name}</h3>
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-[10px] text-white/80 uppercase font-bold tracking-wider">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={resetChat} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer" title="Reset Chat">
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </header>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}
                  style={msg.role === 'user' ? { backgroundColor: chatbot.theme.primaryColor } : {}}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm flex space-x-1 border border-gray-100">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="h-2 w-2 bg-gray-300 rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-2 w-2 bg-gray-300 rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-2 w-2 bg-gray-300 rounded-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Footer / Input */}
            <footer className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input 
                  type="text"
                  placeholder="Type a message..."
                  className="w-full bg-gray-100 px-6 py-3 rounded-full text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 pr-12"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={!apiKey}
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping || !apiKey}
                  className="absolute right-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md disabled:bg-gray-300 cursor-pointer"
                  style={input.trim() && !isTyping ? { backgroundColor: chatbot.theme.primaryColor } : {}}
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              {!apiKey && (
                <p className="text-[10px] text-red-500 mt-2 text-center font-medium uppercase tracking-tighter">Vendor setup incomplete: API Key missing</p>
              )}
              <div className="mt-3 flex justify-center items-center space-x-1 opacity-50 grayscale hover:grayscale-0 transition-all">
                 <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Powered by</span>
                 <Bot className="h-3 w-3 text-indigo-600" />
                 <span className="text-[9px] font-bold text-gray-900">OmniBot AI</span>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-16 w-16 rounded-full shadow-2xl flex items-center justify-center text-white transform hover:scale-110 active:scale-95 transition-all cursor-pointer relative group"
        style={{ backgroundColor: chatbot.theme.primaryColor }}
      >
        <MessageCircle className="h-8 w-8" />
        <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-lg">1</div>
      </button>
    </div>
  );
}
