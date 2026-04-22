import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Chatbot, Vendor } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { BarChart3, Users, MessageCircle, Clock, TrendingUp } from 'lucide-react';

const mockData = [
  { name: 'Mon', messages: 40, sessions: 24 },
  { name: 'Tue', messages: 65, sessions: 35 },
  { name: 'Wed', messages: 55, sessions: 30 },
  { name: 'Thu', messages: 90, sessions: 52 },
  { name: 'Fri', messages: 80, sessions: 48 },
  { name: 'Sat', messages: 35, sessions: 18 },
  { name: 'Sun', messages: 45, sessions: 21 },
];

export default function Analytics({ vendor }: { vendor: Vendor | null }) {
  const { id } = useParams();
  const [bot, setBot] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
       // In a real app, we would fetch actual analytics from the 'analytics' subcollection
       // For this demo, we'll use refined mock data if real data is missing.
       fetchBot();
    }
  }, [id]);

  const fetchBot = async () => {
    const { getDoc, doc } = await import('firebase/firestore');
    const docSnap = await getDoc(doc(db, 'chatbots', id!));
    if (docSnap.exists()) {
      setBot({ id: docSnap.id, ...docSnap.data() } as Chatbot);
    }
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center space-x-3">
        <BarChart3 className="h-8 w-8 text-indigo-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{bot?.name} Analytics</h1>
          <p className="text-gray-500">Performance metrics for the last 7 days</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: <MessageCircle className="text-blue-600" />, label: 'Total Messages', value: '410', trend: '+12%' },
          { icon: <Users className="text-purple-600" />, label: 'Active Sessions', value: '228', trend: '+18%' },
          { icon: <Clock className="text-green-600" />, label: 'Avg Session (m)', value: '4.2', trend: '-2%' },
          { icon: <TrendingUp className="text-orange-600" />, label: 'Lead Conv.', value: '8.4%', trend: '+5%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">{stat.icon}</div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Message Volume</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorMsg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="messages" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorMsg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">User Engagement</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                   type="monotone" 
                   dataKey="sessions" 
                   stroke="#9333ea" 
                   strokeWidth={3} 
                   dot={{ r: 4, fill: '#9333ea', strokeWidth: 2, stroke: '#fff' }}
                   activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
