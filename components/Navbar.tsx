import React, { useState, useEffect } from 'react';
import { Menu, X, Church, Home, Info, Heart, Flame, Phone, ChevronRight, CreditCard, Facebook, Youtube, Instagram, MapPin, Languages, Zap, Sparkles, Send, Globe, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewState, NavItem } from '../types';
import { Button } from './Button';
import { User } from '../types';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onLoginClick: () => void;
  currentUser?: User | null;
}

const navItems: NavItem[] = [
  { label: 'HOME', view: ViewState.HOME },
  { label: 'ABOUT', view: ViewState.ABOUT },
  { label: 'VALPARAI', view: ViewState.ABOUT_VALPARAI },
  { label: 'MINISTRIES', view: ViewState.MINISTRIES },
  { label: 'HEBREW', view: ViewState.HEBREW },
  { label: 'MENORAH', view: ViewState.MENORAH },
  { label: 'BARUCH HASHEM', view: ViewState.BARUCH_HASHEM },
  { label: 'AI ASSISTANCE', view: ViewState.AI },
  { label: 'ENTRUST CARD', view: ViewState.ID_CARD },
  { label: 'CONTACT', view: ViewState.CONTACT },
];

const getIcon = (view: ViewState) => {
  switch (view) {
    case ViewState.HOME: return <Home size={18} />;
    case ViewState.ABOUT: return <Info size={18} />;
    case ViewState.MINISTRIES: return <Heart size={18} />;
    case ViewState.HEBREW: return <Languages size={18} />;
    case ViewState.CONTACT: return <Phone size={18} />;
    case ViewState.ID_CARD: return <CreditCard size={18} />;
    case ViewState.ABOUT_VALPARAI: return <MapPin size={18} />;
    case ViewState.MENORAH: return <Flame size={18} />;
    case ViewState.AI: return <Sparkles size={18} />;
    default: return <Church size={18} />;
  }
};

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, onLoginClick, currentUser }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItemsContainer = {
    closed: { opacity: 0 },
    open: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.1 }
    }
  };

  const menuItem = {
    closed: { x: 15, opacity: 0 },
    open: { x: 0, opacity: 1 }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 bg-brand-950/95 backdrop-blur-xl border-b border-white/5 py-4`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView(ViewState.HOME)}>
            <img src="/brand-logo.png" alt="COT Logo" className="w-12 h-12 object-contain group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="font-serif font-black text-xl tracking-tighter text-white">
                City of Truth
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-accent-400">Ministries</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden 2xl:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.label}
                  onClick={() => setView(item.view)}
                  className={`px-3 py-2 text-[10px] font-bold tracking-[0.15em] transition-all relative group ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navHeaderIndicator"
                      className="absolute inset-0 bg-white/10 rounded-lg -z-0"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={onLoginClick}
              className="hidden lg:flex items-center gap-2 px-6 py-2.5 border-2 border-white text-white font-bold text-[11px] tracking-widest uppercase rounded-full hover:bg-white hover:text-brand-950 transition-all duration-300"
            >
              <LogIn size={16} />
              {currentUser ? 'DASHBOARD' : 'MEMBER LOGIN'}
            </button>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-3 bg-white/5 text-white hover:bg-white/10 rounded-2xl border border-white/10 transition-all"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-[60] bg-brand-950/80 backdrop-blur-md" />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 35, stiffness: 400 }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-[320px] bg-brand-950 border-l border-white/5 flex flex-col shadow-2xl"
            >
              <header className="p-8 flex items-center justify-between border-b border-white/5">
                <div className="flex flex-col">
                  <h2 className="font-serif font-black text-xl text-white leading-tight underline decoration-accent-500 underline-offset-8">MENU</h2>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white border border-white/10"><X size={20} /></button>
              </header>

              <motion.div variants={menuItemsContainer} initial="closed" animate="open" className="flex-1 overflow-y-auto py-8 px-6 space-y-2">
                {navItems.map((item) => (
                  <motion.button
                    key={item.label}
                    variants={menuItem}
                    onClick={() => { setView(item.view); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${currentView === item.view ? 'bg-accent-600 text-white border-accent-500 shadow-lg shadow-accent-600/20' : 'bg-transparent text-white/70 border-white/5 hover:bg-white/5 hover:text-white'}`}
                  >
                    <div className={`${currentView === item.view ? 'text-white' : 'text-accent-400'}`}>
                      {getIcon(item.view)}
                    </div>
                    <span className="font-serif font-bold text-sm tracking-widest">{item.label}</span>
                    {currentView === item.view && <Sparkles size={14} className="ml-auto text-accent-200" />}
                  </motion.button>
                ))}
              </motion.div>

              <footer className="p-8 bg-black/40 border-t border-white/5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-brand-800/50 rounded-xl text-white border border-white/10 shadow-lg"><Phone size={18} className="text-accent-400" /></div>
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Prayer Support</p>
                    <p className="text-sm font-bold text-white">+91 80561 25478</p>
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  {[
                    { Icon: Youtube, color: 'hover:text-red-500' },
                    { Icon: Facebook, color: 'hover:text-blue-500' },
                    { Icon: Instagram, color: 'hover:text-pink-500' }
                  ].map(({ Icon, color }, i) => (
                    <a key={i} href="#" className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/60 transition-all border border-white/5 ${color} hover:scale-110 active:scale-90`}>
                      <Icon size={22} />
                    </a>
                  ))}
                </div>
              </footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};