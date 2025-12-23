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
    case ViewState.HOME: return <Home size={20} />;
    case ViewState.ABOUT: return <Info size={20} />;
    case ViewState.MINISTRIES: return <Heart size={20} />;
    case ViewState.HEBREW: return <Languages size={20} />;
    case ViewState.CONTACT: return <Phone size={20} />;
    case ViewState.ID_CARD: return <CreditCard size={20} />;
    case ViewState.ABOUT_VALPARAI: return <MapPin size={20} />;
    case ViewState.MENORAH: return <Flame size={20} />;
    case ViewState.AI: return <Sparkles size={20} />;
    default: return <Church size={20} />;
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
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const menuItem = {
    closed: { x: 30, opacity: 0 },
    open: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled ? 'py-4 bg-white/80 backdrop-blur-xl border-b border-black/5 shadow-sm' : 'py-8 bg-transparent'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">

          <div
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => setView(ViewState.HOME)}
          >
            <div className="relative">
              <img src="/brand-logo.png" alt="COT Logo" className="w-12 h-12 object-contain group-hover:scale-110 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-accent-400/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500"></div>
            </div>
            <div className="flex flex-col">
              <span className={`font-serif font-black text-2xl tracking-tighter whitespace-nowrap leading-none mb-1 transition-colors ${isScrolled ? 'text-brand-950' : 'text-white'}`}>
                City of Truth
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-500 leading-none">Ministries</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.slice(0, 6).map((item) => {
                const isActive = currentView === item.view;
                return (
                  <button
                    key={item.label}
                    onClick={() => setView(item.view)}
                    className={`px-4 py-2 text-[10px] font-black tracking-[0.2em] transition-all relative group whitespace-nowrap uppercase ${isActive ? (isScrolled ? 'text-brand-600' : 'text-white') : (isScrolled ? 'text-brand-950/40 hover:text-brand-950' : 'text-white/40 hover:text-white')}`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="navHeaderIndicator"
                        className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full -z-0 ${isScrolled ? 'bg-brand-600' : 'bg-white'}`}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            <button
              onClick={onLoginClick}
              className={`hidden md:flex items-center gap-3 px-6 py-3 border font-black text-[10px] tracking-widest uppercase rounded-full transition-all duration-500 active:scale-95 whitespace-nowrap ${isScrolled ? 'border-brand-950/20 text-brand-950 hover:bg-brand-950 hover:text-white' : 'border-white/40 text-white hover:bg-white hover:text-brand-950'}`}
            >
              <LogIn size={14} />
              {currentUser ? 'DASHBOARD' : 'LOGIN'}
            </button>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`p-4 rounded-[1.25rem] transition-all hover:scale-105 active:scale-90 flex items-center gap-2 group border ${isScrolled ? 'bg-brand-50 border-brand-100 text-brand-950' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">Explore</span>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[100] bg-brand-950/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-[110] w-[85%] md:w-[400px] bg-white/90 backdrop-blur-2xl shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col border-l border-white/20"
            >
              <header className="p-8 flex items-center justify-between border-b border-slate-100">
                <div className="flex flex-col">
                  <h2 className="font-serif font-black text-xl text-brand-950 leading-tight">Navigation</h2>
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-400">Divine Journey</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 bg-slate-100 text-brand-950 rounded-2xl hover:bg-brand-950 hover:text-white transition-all transform hover:rotate-90"
                >
                  <X size={20} />
                </button>
              </header>

              <motion.div
                variants={menuItemsContainer}
                initial="closed"
                animate="open"
                className="flex-1 overflow-y-auto py-10 px-6 space-y-2 custom-scrollbar"
              >
                {navItems.map((item) => (
                  <motion.button
                    key={item.label}
                    variants={menuItem}
                    whileHover={{ x: 10 }}
                    onClick={() => { setView(item.view); setMobileMenuOpen(false); }}
                    className={`w-full group text-left flex items-center gap-5 p-4 rounded-2xl transition-all ${currentView === item.view ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'hover:bg-brand-50 text-slate-600 hover:text-brand-950'}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${currentView === item.view ? 'bg-brand-950 text-accent-400' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-brand-600 group-hover:shadow-sm'}`}>
                      {React.cloneElement(getIcon(item.view) as React.ReactElement, { size: 22 })}
                    </div>
                    <div>
                      <span className="block font-serif font-bold text-lg tracking-tight leading-none mb-1 group-hover:tracking-wide transition-all">
                        {item.label}
                      </span>
                      <span className={`block text-[8px] font-black uppercase tracking-widest ${currentView === item.view ? 'text-white/60' : 'text-slate-400'}`}>Explore Section</span>
                    </div>
                    <ChevronRight size={16} className={`ml-auto transition-transform ${currentView === item.view ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                  </motion.button>
                ))}
              </motion.div>

              <footer className="p-10 bg-slate-50 border-t border-slate-100">
                <div className="flex flex-col items-center">
                  <div className="flex gap-8 mb-8">
                    {[
                      { Icon: Youtube, href: "https://youtube.com/@cotministries?si=A6179oNRuuJ9snjM" },
                      { Icon: Facebook, href: "https://facebook.com/cityoftruthministries" },
                      { Icon: Instagram, href: "https://instagram.com/cityoftruthministries" }
                    ].map(({ Icon, href }, i) => (
                      <a
                        key={i}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-600 hover:scale-110 active:scale-95 transition-all"
                      >
                        <Icon size={20} />
                      </a>
                    ))}
                  </div>
                  <p className="text-[10px] font-black text-brand-950/20 uppercase tracking-[0.4em] text-center italic">"Walking in Truth & Grace"</p>
                </div>
              </footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};