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
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 bg-brand-950/95 backdrop-blur-xl border-b border-white/5 py-2.5`}>
        <div className="container mx-auto px-4 flex items-center justify-between gap-4">
          {/* Logo Section */}
          <div className="flex items-center gap-2 cursor-pointer group shrink-0" onClick={() => setView(ViewState.HOME)}>
            <img src="/brand-logo.png" alt="COT Logo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="font-serif font-black text-lg tracking-tighter text-white whitespace-nowrap">
                City of Truth
              </span>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-accent-400">Ministries</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-px">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.label}
                  onClick={() => setView(item.view)}
                  className={`px-2 py-1 text-[8.5px] font-bold tracking-widest transition-all relative group whitespace-nowrap ${isActive ? 'text-white' : 'text-white/40 hover:text-white'}`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navHeaderIndicator"
                      className="absolute inset-0 bg-white/10 rounded-md -z-0"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onLoginClick}
              className="hidden xl:flex items-center gap-2 px-5 py-2 border border-white/40 text-white font-bold text-[9px] tracking-widest uppercase rounded-full hover:bg-white hover:text-brand-950 transition-all duration-300 whitespace-nowrap"
            >
              <LogIn size={12} />
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
              transition={{ type: "spring", damping: 40, stiffness: 400 }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-[260px] bg-brand-950/95 backdrop-blur-2xl border-l border-white/5 flex flex-col shadow-2xl"
            >
              <header className="p-6 flex items-center justify-between border-b border-white/5">
                <h2 className="font-serif font-black text-xs text-accent-400 uppercase tracking-[0.3em]">Navigation</h2>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-all text-white/50 hover:text-white"><X size={18} /></button>
              </header>

              <motion.div variants={menuItemsContainer} initial="closed" animate="open" className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                {navItems.map((item) => (
                  <motion.button
                    key={item.label}
                    variants={menuItem}
                    onClick={() => { setView(item.view); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentView === item.view ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  >
                    <div className={currentView === item.view ? 'text-accent-400' : 'text-white/20'}>
                      {React.cloneElement(getIcon(item.view) as React.ReactElement, { size: 16 })}
                    </div>
                    <span className="font-serif font-bold text-[11px] tracking-[0.2em] uppercase">{item.label}</span>
                  </motion.button>
                ))}
              </motion.div>

              <footer className="p-6 bg-black/20 border-t border-white/5 flex flex-col items-center">
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4">Support & Social</p>
                <div className="flex gap-4">
                  {[Youtube, Facebook, Instagram].map((Icon, i) => (
                    <a key={i} href="#" className="text-white/20 hover:text-accent-400 transition-colors">
                      <Icon size={18} />
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