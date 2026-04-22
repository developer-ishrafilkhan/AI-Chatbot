/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Vendor } from './types';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Analytics from './pages/Analytics';
import WidgetPage from './pages/WidgetPage';
import Navbar from './components/Navbar';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Ensure vendor profile exists
        const vendorRef = doc(db, 'vendors', user.uid);
        const vendorSnap = await getDoc(vendorRef);
        
        if (!vendorSnap.exists()) {
          const newVendor: Vendor = {
            id: user.uid,
            email: user.email || '',
            plan: 'free',
            createdAt: new Date().toISOString()
          };
          await setDoc(vendorRef, newVendor);
          setVendor(newVendor);
        } else {
          setVendor(vendorSnap.data() as Vendor);
        }
      } else {
        setVendor(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Widget Route (No Navbar/Layout) */}
        <Route path="/widget/:id" element={<WidgetPage />} />

        {/* Platform Routes */}
        <Route 
          path="/*" 
          element={
            <div className="min-h-screen bg-gray-50">
              <Navbar user={user} />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Routes>
                  <Route path="/" element={<Home user={user} />} />
                  <Route 
                    path="/dashboard" 
                    element={user ? <Dashboard vendor={vendor} /> : <Navigate to="/" />} 
                  />
                  <Route 
                    path="/editor/:id" 
                    element={user ? <Editor vendor={vendor} /> : <Navigate to="/" />} 
                  />
                  <Route 
                    path="/analytics/:id" 
                    element={user ? <Analytics vendor={vendor} /> : <Navigate to="/" />} 
                  />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

