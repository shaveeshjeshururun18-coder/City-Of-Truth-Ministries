import React, { useState, useEffect } from 'react';
import { Menu, X, Church, Home, Info, Heart, Flame, Phone, ChevronRight, CreditCard, Facebook, Youtube, Instagram, MapPin, Languages, Zap, Sparkles, Send, Globe } from 'lucide-react';
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
  { label: 'Home', view: ViewState.HOME },
  { label: 'About', view: ViewState.ABOUT },
  { label: 'Holy Hills', view: ViewState.ABOUT_VALPARAI },
  { label: 'Baruch Hashem', view: ViewState.BARUCH_HASHEM },
  { label: 'Hebrew', view: ViewState.HEBREW },
  { label: 'Menorah', view: ViewState.MENORAH },
  { label: 'Spiritual AI', view: ViewState.AI },
  { label: 'Entrust Card', view: ViewState.ID_CARD },
  { label: 'Contact', view: ViewState.CONTACT },
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

  const isDarkBackground = [ViewState.HOME, ViewState.HEBREW, ViewState.MENORAH, ViewState.BARUCH_HASHEM, ViewState.AI].includes(currentView);
  const useDarkText = isScrolled || !isDarkBackground;

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
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled ? 'py-4' : 'py-6'}`}>
        <div className={`absolute inset-0 transition-all duration-700 ${isScrolled ? 'bg-white/80 backdrop-blur-2xl shadow-lg border-b border-slate-200/50' : 'bg-transparent'}`} />

        <div className="container mx-auto px-6 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView(ViewState.HOME)}>
            <div className={`p-2.5 rounded-2xl transition-all duration-500 border ${useDarkText ? 'bg-brand-600 shadow-lg text-white border-brand-500' : 'bg-white/10 text-white border-white/20 backdrop-blur-lg'}`}>
              <Church size={24} />
            </div>
            <div className="flex flex-col">
              <span className={`font-serif font-black text-xl tracking-tighter transition-colors duration-500 ${useDarkText ? 'text-brand-950' : 'text-white'}`}>
                City of Truth
              </span>
              <span className={`text-[9px] font-black uppercase tracking-[0.3em] transition-colors duration-500 ${useDarkText ? 'text-brand-600' : 'text-accent-400'}`}>Ministries</span>
            </div>
          </div>

          <nav className="hidden xl:flex items-center gap-1 bg-black/5 p-1 rounded-2xl border border-white/5">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.label}
                  onClick={() => setView(item.view)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all relative group ${useDarkText ? (isActive ? 'text-brand-700' : 'text-slate-500 hover:text-brand-950') : (isActive ? 'text-white' : 'text-white/60 hover:text-white')}`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div layoutId="navIndicator" className={`absolute inset-0 rounded-xl z-0 ${useDarkText ? 'bg-white shadow-sm' : 'bg-white/10'}`} />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`p-3 rounded-2xl transition-all ${useDarkText ? 'bg-brand-50 text-brand-950 hover:bg-brand-100 shadow-sm' : 'bg-white/10 text-white backdrop-blur-lg border border-white/20'}`}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-[60] bg-brand-950/40 backdrop-blur-sm" />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-[280px] bg-white shadow-2xl flex flex-col"
            >
              <header className="p-6 flex items-center justify-between border-b border-brand-50">
                <div className="flex flex-col">
                  <h2 className="font-serif font-black text-lg text-brand-950 leading-tight">Menu</h2>
                  <p className="text-[9px] font-bold text-brand-400 uppercase tracking-widest">Navigation</p>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-brand-50 rounded-full transition-all text-brand-950"><X size={20} /></button>
              </header>

              <motion.div variants={menuItemsContainer} initial="closed" animate="open" className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((item) => (
                  <motion.button
                    key={item.label}
                    variants={menuItem}
                    onClick={() => { setView(item.view); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all ${currentView === item.view ? 'bg-brand-600 text-white shadow-lg' : 'bg-transparent text-slate-700 hover:bg-brand-50'}`}
                  >
                    <div className={`${currentView === item.view ? 'text-white' : 'text-brand-400'}`}>
                      {getIcon(item.view)}
                    </div>
                    <span className="font-serif font-bold text-[13px] tracking-wide">{item.label}</span>
                  </motion.button>
                ))}
              </motion.div>

              <footer className="p-6 bg-white border-t border-brand-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-brand-50 rounded-lg text-brand-600"><Phone size={14} /></div>
                  <span className="text-[11px] font-black text-brand-900">+91 80561 25478</span>
                </div>
                <div className="flex gap-4">
                  <Youtube size={18} className="text-slate-400 hover:text-red-600 cursor-pointer" />
                  <Facebook size={18} className="text-slate-400 hover:text-blue-600 cursor-pointer" />
                  <Instagram size={18} className="text-slate-400 hover:text-pink-600 cursor-pointer" />
                </div>
              </footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};