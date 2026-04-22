import { motion } from 'framer-motion';
import { Bot, Zap, Shield, BarChart3, Globe, Code } from 'lucide-react';
import { User } from 'firebase/auth';
import { signInWithGoogle } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function Home({ user }: { user: User | null }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-24 py-12">
      {/* Hero Section */}
      <section className="text-center space-y-8 max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-bold tracking-tight text-gray-900"
        >
          Create AI Chatbots That <span className="text-indigo-600">Actually Work</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-600 leading-relaxed"
        >
          The all-in-one platform for vendors to build, customize, and deploy AI chatbots using their own Gemini API keys. Privacy-focused, highly customizable, and easy to integrate.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center space-x-4"
        >
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
            >
              Start for Free
            </button>
          )}
          <button className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            View Live Demo
          </button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8 px-4">
        {[
          {
            icon: <Zap className="h-6 w-6 text-yellow-500" />,
            title: "Instant Setup",
            desc: "Add your Gemini API key and have a functional AI chatbot ready in minutes."
          },
          {
            icon: <Shield className="h-6 w-6 text-green-500" />,
            title: "Privacy First",
            desc: "User data is isolated and secure. You control your API keys and prompts."
          },
          {
            icon: <BarChart3 className="h-6 w-6 text-blue-500" />,
            title: "Deep Analytics",
            desc: "Monitor performance with detailed dashboards on message volume and engagement."
          },
          {
            icon: <Globe className="h-6 w-6 text-purple-500" />,
            title: "Custom Widgets",
            desc: "Design widgets that match your brand identity with our advanced customization tools."
          },
          {
            icon: <Code className="h-6 w-6 text-indigo-500" />,
            title: "Easy Embed",
            desc: "One-line script integration for any website, whether Shopify, Webflow, or custom."
          },
          {
            icon: <Bot className="h-6 w-6 text-red-500" />,
            title: "Multi-Model Support",
            desc: "Optimized for Gemini models to deliver fast and accurate AI responses."
          }
        ].map((feature, i) => (
          <motion.div 
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="p-3 bg-gray-50 rounded-xl w-fit group-hover:bg-indigo-50 transition-colors">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mt-6 mb-2 text-gray-900">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Pricing Section */}
      <section className="py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 mt-4">Choose the plan that's right for your business scale.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto px-4 text-left">
          {[
            {
              name: "Free",
              price: "$0",
              features: ["1 Chatbot", "1,000 Messages/Month", "Basic Customization", "Standard Analytics"],
              cta: "Current Plan",
              popular: false
            },
            {
              name: "Premium",
              price: "$29",
              features: ["Unlimited Chatbots", "Unlimited Messages", "Advanced Customization", "Remove OmniBot Branding", "Priority Support", "Advanced Analytics Dashboard"],
              cta: "Upgrade Now",
              popular: true
            }
          ].map((plan) => (
            <div key={plan.name} className={`p-8 rounded-3xl border-2 ${plan.popular ? 'border-indigo-600 bg-white shadow-xl relative' : 'border-gray-100 bg-gray-50'}`}>
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Most Popular</span>
              )}
              <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
              <div className="my-6">
                <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center space-x-3 text-gray-600">
                    <Zap className="h-5 w-5 text-indigo-600 fill-indigo-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button 
                className={`w-full py-4 rounded-xl font-bold transition-all ${plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'}`}
                onClick={() => user ? navigate('/dashboard') : signInWithGoogle()}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof / Call to Action */}
      <section className="bg-indigo-900 rounded-3xl p-16 text-center text-white relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold">Ready to empower your website with AI?</h2>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
            Join hundreds of vendors who are already transforming their customer interactions with OmniBot AI.
          </p>
          {!user && (
            <button
              onClick={() => signInWithGoogle()}
              className="px-8 py-4 bg-white text-indigo-900 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Create Your Free Account
            </button>
          )}
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </section>
    </div>
  );
}
