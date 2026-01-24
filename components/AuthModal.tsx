import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight, Phone, Shield, IdCard, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Button } from './Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (identifier: string) => void;
  onRegister: (data: any) => void;
  onFindID: (phone: string) => void;
  onNavigateToRegister: () => void;
  onAdminClick: () => void;
  initialView?: 'choice' | 'login' | 'register' | 'forgot-id';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onFindID,
  onNavigateToRegister,
  onAdminClick,
  initialView = 'choice'
}) => {
  const [view, setView] = useState<'choice' | 'login' | 'register' | 'forgot-id'>(initialView);

  // Reset view when modal opens/closes or initialView changes, but mainly we want to respect the prop when it opens.
  // actually, we might want to use useEffect to sync it if the prop changes while open, 
  // but usually it's set when opening. 
  // Let's just use a useEffect to reset/set view when isOpen becomes true.
  React.useEffect(() => {
    if (isOpen) {
      setView(initialView);
    }
  }, [isOpen, initialView]);
  const [formData, setFormData] = useState({ identifier: '', password: '', phone: '', email: '', firstName: '', lastName: '' });
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (view === 'login') {
      onLogin(formData.identifier);
    } else if (view === 'register') {
      onRegister(formData);
    } else {
      onFindID(formData.phone);
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
              {view === 'choice' ? 'Welcome' : view === 'login' ? 'Welcome Back' : view === 'register' ? 'Join the Family' : 'Find Account'}
            </h2>
            <p className="text-brand-100 text-sm mt-1">
              {view === 'choice' ? 'Choose your path' : view === 'forgot-id' ? 'Retrieve your Member ID' : 'City of Truth Ministries'}
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
            {view === 'choice' && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 gap-4"
              >
                <button
                  onClick={() => setView('login')}
                  className="group flex items-center justify-between w-full p-6 bg-white border-2 border-slate-100 hover:border-brand-500 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-brand-700">Member Login</h3>
                      <p className="text-xs text-slate-500 font-medium">Access your dashboard</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-brand-500 transform group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={onNavigateToRegister}
                  className="group flex items-center justify-between w-full p-6 bg-white border-2 border-slate-100 hover:border-accent-500 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent-50 flex items-center justify-center text-accent-600 group-hover:bg-accent-500 group-hover:text-white transition-colors">
                      <IdCard size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-accent-700">New Registration</h3>
                      <p className="text-xs text-slate-500 font-medium">Get your Entrust Card</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-accent-500 transform group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={onAdminClick}
                  className="group flex items-center justify-between w-full p-6 bg-white border-2 border-slate-100 hover:border-purple-500 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-purple-700">Admin Access</h3>
                      <p className="text-xs text-slate-500 font-medium">Dashboard Management</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-purple-500 transform group-hover:translate-x-1 transition-all" />
                </button>
              </motion.div>
            )}

            {view === 'login' && (
              <motion.div
                key="login"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="space-y-5"
              >
                {/* Promotional Banner */}
                <div className="bg-gradient-to-r from-brand-50 to-accent-50 rounded-2xl p-4 border border-brand-100 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-600 p-2 rounded-lg">
                      <IdCard className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-brand-900">Member Benefits</p>
                      <p className="text-[10px] text-brand-700">Digital ID Card • Dashboard Access • Exclusive Events</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Phone Number (10 digits)</label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                      value={formData.identifier}
                      onChange={e => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, identifier: value });
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 ml-1">Enter your 10-digit registered mobile number</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <a href="#" onClick={() => setView('forgot-id')} className="text-brand-600 hover:text-brand-800 font-medium ml-auto">Forgot ID?</a>
                </div>

                <Button fullWidth onClick={handleSubmit} className="mt-4 shadow-brand-500/25">
                  Sign In <ArrowRight size={18} />
                </Button>

                <div className="mt-6 text-center">
                  <button onClick={() => setView('choice')} className="text-xs font-bold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-wider">
                    ← Back to Options
                  </button>
                </div>
              </motion.div>
            )}

            {view === 'register' && (
              <motion.div
                key="register"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-4 text-center py-8"
              >
                <div className="w-20 h-20 bg-accent-50 text-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IdCard size={40} />
                </div>
                <h3 className="text-xl font-bold text-brand-950">Registration Required</h3>
                <p className="text-sm text-slate-500 px-4">
                  All new members must generate their <strong>Entrust Card</strong> to join the family.
                </p>

                <Button fullWidth onClick={onNavigateToRegister} className="mt-4 shadow-brand-500/25">
                  Proceed to Registration <ArrowRight size={18} />
                </Button>

                <div className="text-center pt-2">
                  <button onClick={() => setView('choice')} className="text-sm font-bold text-brand-600">Back to Menu</button>
                </div>
              </motion.div>
            )}

            {view === 'forgot-id' && (
              <motion.div
                key="forgot"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="space-y-5 text-center"
              >
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <div className="w-16 h-16 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="text-white" size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-brand-950 mb-2">Need Help with Login?</h3>
                  <p className="text-sm text-slate-600 mb-4">Contact the ministry office for assistance</p>

                  <a
                    href="tel:+918056125478"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Phone size={20} />
                    +91 80561 25478
                  </a>

                  <p className="text-xs text-slate-500 mt-4">Office hours: 9 AM - 6 PM</p>
                </div>

                <div className="text-center">
                  <button onClick={() => setView('login')} className="text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors">← Back to Login</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div >
    </div >
  );
};
