import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Chatbot, Vendor } from '../types';
import { Save, ArrowLeft, Layout, Palette, MessageSquare, Code, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Editor({ vendor }: { vendor: Vendor | null }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bot, setBot] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'appearance' | 'embed'>('config');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchBot();
  }, [id]);

  const fetchBot = async () => {
    const docSnap = await getDoc(doc(db, 'chatbots', id!));
    if (docSnap.exists()) {
      setBot({ id: docSnap.id, ...docSnap.data() } as Chatbot);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!bot) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'chatbots', bot.id), {
        name: bot.name,
        description: bot.description,
        systemPrompt: bot.systemPrompt,
        theme: bot.theme
      });
      alert('Changes saved!');
    } catch (error) {
      console.error("Error saving bot:", error);
    } finally {
      setSaving(false);
    }
  };

  const embedCode = `<script src="${window.location.origin}/widget.js" data-bot-id="${id}"></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (!bot) return <div>Bot not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm sticky top-20 z-30">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{bot.name} Settings</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid md:grid-cols-[240px_1fr] gap-8 mt-8">
        {/* Navigation Sidebar */}
        <aside className="space-y-2">
          {[
            { id: 'config', icon: <MessageSquare className="h-4 w-4" />, label: 'Core Configuration' },
            { id: 'appearance', icon: <Palette className="h-4 w-4" />, label: 'Widget UI' },
            { id: 'embed', icon: <Code className="h-4 w-4" />, label: 'Embed Script' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-white border border-transparent hover:border-gray-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {activeTab === 'config' && (
            <div className="p-8 space-y-6 animate-in slide-in-from-right-4 duration-300">
               <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
               <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={bot.name}
                      onChange={(e) => setBot({ ...bot, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                      value={bot.description}
                      onChange={(e) => setBot({ ...bot, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt (AI Instructions)</label>
                    <p className="text-xs text-gray-500 mb-2">Define how your AI should behave. Be specific about its role, tone, and knowledge boundaries.</p>
                    <textarea 
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-40 font-mono text-sm"
                      value={bot.systemPrompt}
                      onChange={(e) => setBot({ ...bot, systemPrompt: e.target.value })}
                    />
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-gray-900">Customization</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Brand Color</label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="color"
                        className="h-10 w-20 rounded p-1"
                        value={bot.theme.primaryColor}
                        onChange={(e) => setBot({ ...bot, theme: { ...bot.theme, primaryColor: e.target.value } })}
                      />
                      <input 
                        type="text"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-mono text-sm"
                        value={bot.theme.primaryColor}
                        onChange={(e) => setBot({ ...bot, theme: { ...bot.theme, primaryColor: e.target.value } })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                      value={bot.theme.welcomeMessage}
                      onChange={(e) => setBot({ ...bot, theme: { ...bot.theme, welcomeMessage: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL (Optional)</label>
                    <input 
                      type="text"
                      placeholder="https://example.com/avatar.png"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                      value={bot.theme.avatarUrl}
                      onChange={(e) => setBot({ ...bot, theme: { ...bot.theme, avatarUrl: e.target.value } })}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                   <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider">Preview</h3>
                   <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-[300px] mx-auto">
                      <div className="p-4 flex items-center space-x-3" style={{ backgroundColor: bot.theme.primaryColor }}>
                         <div className="h-8 w-8 rounded-full bg-white/20"></div>
                         <span className="text-white font-bold">{bot.name}</span>
                      </div>
                      <div className="p-4 h-48 space-y-3 bg-gray-50">
                         <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-xs border border-gray-100">
                           {bot.theme.welcomeMessage}
                         </div>
                         <div className="flex justify-end">
                            <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none shadow-sm text-xs" style={{ backgroundColor: bot.theme.primaryColor }}>
                              How can you help me?
                            </div>
                         </div>
                      </div>
                      <div className="p-3 border-t border-gray-100 bg-white">
                         <div className="bg-gray-100 h-8 rounded-full"></div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'embed' && (
            <div className="p-8 space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-gray-900">Integration</h2>
              <p className="text-gray-600 leading-relaxed">
                Copy and paste this script tag into your website's <code className="bg-gray-100 px-1 rounded">&lt;head&gt;</code> or just before the closing <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> tag to enable your AI chatbot.
              </p>
              <div className="relative group">
                <pre className="bg-gray-900 text-indigo-400 p-6 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed border-2 border-indigo-500/20">
                  {embedCode}
                </pre>
                <button 
                  onClick={copyToClipboard}
                  className="absolute top-4 right-4 bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
                >
                  {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex gap-4">
                 <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <Code className="h-5 w-5 text-blue-600" />
                 </div>
                 <div>
                    <h4 className="font-bold text-blue-900 mb-1">Production Ready</h4>
                    <p className="text-sm text-blue-700">This script automatically loads the conversational widget and connects securely to your pre-configured OmniBot instance.</p>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
