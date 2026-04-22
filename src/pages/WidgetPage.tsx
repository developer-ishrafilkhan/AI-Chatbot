import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Chatbot, Vendor } from '../types';
import ChatWidget from '../components/ChatWidget';

export default function WidgetPage() {
  const { id } = useParams();
  const [bot, setBot] = useState<Chatbot | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchBotData = async () => {
      const botSnap = await getDoc(doc(db, 'chatbots', id));
      if (botSnap.exists()) {
        const botData = { id: botSnap.id, ...botSnap.data() } as Chatbot;
        setBot(botData);
        
        // Fetch vendor for API key
        const vendorSnap = await getDoc(doc(db, 'vendors', botData.vendorId));
        if (vendorSnap.exists()) {
          setVendor(vendorSnap.data() as Vendor);
        }
      }
      setLoading(false);
    };
    fetchBotData();
  }, [id]);

  if (loading || !bot) return null;

  return (
    <div className="fixed inset-0 overflow-hidden bg-transparent">
      <ChatWidget chatbot={bot} apiKey={vendor?.geminiApiKey} />
    </div>
  );
}
