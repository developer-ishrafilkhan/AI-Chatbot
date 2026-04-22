import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Vendor, Chatbot } from '../types';
import { Plus, MessageSquare, Trash2, Edit3, BarChart, ExternalLink, Key, Bot } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard({ vendor }: { vendor: Vendor | null }) {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [apiKey, setApiKey] = useState(vendor?.geminiApiKey || '');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!vendor) return;
    fetchChatbots();
    setApiKey(vendor.geminiApiKey || '');
  }, [vendor]);

  const handleUpgrade = async () => {
    if (!vendor) return;
    setIsUpgrading(true);
    try {
      await updateDoc(doc(db, 'vendors', vendor.id), { plan: 'premium' });
      alert('Welcome to OmniBot Premium!');
      window.location.reload(); // Simple way to refresh vendor state
    } catch (error) {
      console.error("Upgrade failed:", error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const fetchChatbots = async () => {
    if (!vendor) return;
    try {
      const q = query(collection(db, 'chatbots'), where('vendorId', '==', vendor.id));
      const querySnapshot = await getDocs(q);
      const bots: Chatbot[] = [];
      querySnapshot.forEach((doc) => {
        bots.push({ id: doc.id, ...doc.data() } as Chatbot);
      });
      setChatbots(bots);
    } catch (error) {
      console.error("Error fetching chatbots:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor || !newBotName.trim()) return;

    const newBot: Omit<Chatbot, 'id'> = {
      vendorId: vendor.id,
      name: newBotName,
      description: 'Your new AI assistant',
      systemPrompt: 'You are a helpful assistant.',
      theme: {
        primaryColor: '#4f46e5',
        welcomeMessage: 'Hello! How can I help you today?',
        avatarUrl: ''
      },
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'chatbots'), newBot);
      setChatbots([{ id: docRef.id, ...newBot } as Chatbot, ...chatbots]);
      setIsCreating(false);
      setNewBotName('');
    } catch (error) {
      console.error("Error creating bot:", error);
    }
  };

  const handleDeleteBot = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'chatbots', deletingId));
      setChatbots(chatbots.filter(b => b.id !== deletingId));
      setDeletingId(null);
    } catch (error) {
      console.error("Error deleting bot:", error);
      alert("Failed to delete chatbot. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!vendor) return;
    try {
      await updateDoc(doc(db, 'vendors', vendor.id), {
        geminiApiKey: apiKey
      });
      alert('API Key saved successfully!');
    } catch (error) {
      console.error("Error saving API Key:", error);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Chatbots</h1>
          <p className="text-gray-500">Manage and customize your AI assistants</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${vendor?.plan === 'premium' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {vendor?.plan || 'Free'} Plan
              </span>
              {vendor?.plan === 'free' && (
                <button 
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="text-xs font-bold text-indigo-600 hover:underline disabled:opacity-50"
                >
                  {isUpgrading ? 'Upgrading...' : 'Upgrade'}
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New Chatbot</span>
          </button>
        </div>
      </header>

      {/* API Key Management */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-indigo-600 font-semibold mb-2">
          <Key className="h-5 w-5" />
          <h2>Gemini API Configuration</h2>
        </div>
        <p className="text-sm text-gray-600">
          Your API key is stored securely and used only to process messages for your chatbots. Get one from the <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-indigo-600 hover:underline">Google AI Studio</a>.
        </p>
        <div className="flex space-x-2">
          <input 
            type="password"
            placeholder="Paste your Gemini API Key here"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button 
            onClick={handleSaveApiKey}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Save Key
          </button>
        </div>
      </section>

      {/* Chatbots Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {chatbots.map((bot) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={bot.id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <MessageSquare className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/analytics/${bot.id}`} title="Analytics">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <BarChart className="h-4 w-4" />
                    </button>
                  </Link>
                  <button 
                    onClick={() => setDeletingId(bot.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-1">{bot.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-6">{bot.description}</p>
              
              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                 <Link 
                  to={`/editor/${bot.id}`}
                  className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 space-x-1 group/link"
                 >
                   <span>Customize</span>
                   <Edit3 className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                 </Link>
                 <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Active</span>
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {chatbots.length === 0 && !isCreating && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl">
            <Bot className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No chatbots yet</h3>
            <p className="text-gray-500 mb-4">Create your first AI assistant to get started.</p>
            <button
               onClick={() => setIsCreating(true)}
               className="text-indigo-600 font-semibold hover:underline"
            >
              Click here to create one
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center"
          >
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Are you sure?</h2>
            <p className="text-gray-500 mb-8">
              This will permanently delete your chatbot and all associated data. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setDeletingId(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteBot}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Chatbot</h2>
            <form onSubmit={handleCreateBot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chatbot Name</label>
                <input 
                  autoFocus
                  type="text"
                  placeholder="e.g. Sales Support Assistant"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
