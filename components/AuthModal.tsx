import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight, Phone, Shield } from 'lucide-react';
import { Button } from './Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (identifier: string, pass: string) => void;
  onRegister: (data: any) => void;
  onFindID: (phone: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onRegister, onFindID }) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot-id'>('login');
  const [formData, setFormData] = useState({ identifier: '', password: '', phone: '', email: '', firstName: '', lastName: '' });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (view === 'login') {
      onLogin(formData.identifier, formData.password);
    } else if (view === 'register') {
      onRegister(formData);
    } else {
      onFindID(formData.phone);
      // setView('login'); // Let the parent handle the success/fail feedback or moving views if needed
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="h-36 bg-gradient-to-br from-brand-600 to-brand-800 relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-500/30 rounded-full blur-2xl"></div>

          <div className="z-10 text-center">
            <h2 className="text-3xl font-serif text-white font-bold tracking-tight">
              {view === 'login' ? 'Welcome Back' : view === 'register' ? 'Join the Family' : 'Find Account'}
            </h2>
            <p className="text-brand-100 text-sm mt-1">
              {view === 'forgot-id' ? 'Retrieve your Member ID' : 'City of Truth Ministries'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-1 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.div
                key="login"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Member ID or Phone</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="COT-XXXX or 98765..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                      value={formData.identifier}
                      onChange={e => setFormData({ ...formData, identifier: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Password / OTP</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <a href="#" onClick={() => setView('forgot-id')} className="text-brand-600 hover:text-brand-800 font-medium ml-auto">Forgot ID?</a>
                </div>

                <Button fullWidth onClick={handleSubmit} className="mt-4 shadow-brand-500/25">
                  Sign In <ArrowRight size={18} />
                </Button>
              </motion.div>
            )}

            {view === 'register' && (
              <motion.div
                key="register"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-4"
              >
                <p className="text-sm text-slate-500 text-center">New Member? Please proceed to the <strong>Entrust Card</strong> page to fill out your full registration.</p>

                <Button fullWidth onClick={() => { onClose(); window.location.hash = 'entrust-card'; }} className="mt-4 shadow-brand-500/25">
                  Go to Registration
                </Button>

                <div className="text-center pt-2">
                  <button onClick={() => setView('login')} className="text-sm font-bold text-brand-600">Back to Login</button>
                </div>
              </motion.div>
            )}

            {view === 'forgot-id' && (
              <motion.div
                key="forgot"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Registered Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="+91..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <Button fullWidth onClick={handleSubmit} className="mt-4">
                  Send ID via SMS
                </Button>
                <div className="text-center">
                  <button onClick={() => setView('login')} className="text-sm font-bold text-brand-600">Back to Login</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {view === 'login' && (
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Don't have an account?
                <button
                  onClick={() => {
                    // On register click, ideally we redirect them to the ID Card page for full reg
                    // But for now let's just show a prompt or move them
                    onClose();
                    // We will handle navigation in parent if needed, or just tell them
                    // For now let's just switch view
                    setView('register');
                  }}
                  className="ml-2 font-bold text-brand-600 hover:text-accent-500 transition-colors"
                >
                  Register Now
                </button>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
