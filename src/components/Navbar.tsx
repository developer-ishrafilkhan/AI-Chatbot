import { Link } from 'react-router-dom';
import { User } from 'firebase/auth';
import { Bot, LogIn, LogOut, Settings, BarChart } from 'lucide-react';
import { signInWithGoogle, logout } from '../lib/firebase';

export default function Navbar({ user }: { user: User | null }) {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">OmniBot AI</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
                >
                  <Settings className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <div className="flex items-center space-x-2">
                  <img 
                    src={user.photoURL || ''} 
                    alt={user.displayName || ''} 
                    className="h-8 w-8 rounded-full border border-gray-200"
                  />
                  <button
                    onClick={() => logout()}
                    className="text-gray-600 hover:text-red-600 p-2 rounded-full cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors cursor-pointer"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
