import React, { useState, useEffect } from 'react';
import { Menu, X, Church, Home, Info, Heart, Flame, Phone, ChevronRight, CreditCard, Facebook, Youtube, Instagram, MapPin, Languages, Zap, Sparkles, Code } from 'lucide-react';
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
  { label: 'Valparai', view: ViewState.ABOUT_VALPARAI },
  { label: 'Ministries', view: ViewState.MINISTRIES },
  { label: 'Hebrew', view: ViewState.HEBREW },
  { label: 'Menorah', view: ViewState.MENORAH },
  { label: 'Baruch Hashem', view: ViewState.BARUCH_HASHEM },
  { label: 'AI Assistance', view: ViewState.AI },
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

  const isDarkBackground = currentView === ViewState.HOME || currentView === ViewState.HEBREW || currentView === ViewState.MENORAH;
  const useDarkText = isScrolled || !isDarkBackground;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuPanelVariants = {
    closed: { x: '100%', opacity: 0 },
    open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg py-3' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView(ViewState.HOME)}>
            <div className={`p-2 rounded-xl transition-all duration-300 border ${useDarkText ? 'bg-brand-600 text-white border-brand-500 shadow-lg' : 'bg-white/10 text-white border-white/20 backdrop-blur-md'}`}>
              <Church size={24} />
            </div>
            <div className="flex flex-col">
              <h1 className={`font-serif font-bold text-xl leading-none tracking-tight ${useDarkText ? 'text-brand-950' : 'text-white'}`}>City of Truth</h1>
              <p className={`text-[9px] font-bold uppercase tracking-[0.2em] mt-1 ${useDarkText ? 'text-brand-600' : 'text-accent-400'}`}>Ministries</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.label}
                  onClick={() => setView(item.view)}
                  className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all relative group ${useDarkText ? (isActive ? 'text-brand-700 bg-brand-50' : 'text-gray-500 hover:text-brand-900') : (isActive ? 'text-white bg-white/10' : 'text-white/70 hover:text-white')}`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div layoutId="navIndicator" className={`absolute inset-0 rounded-lg z-0 ${useDarkText ? 'bg-brand-100/50' : 'bg-white/10'}`} />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <Button
                variant={useDarkText ? "primary" : "outline"}
                onClick={() => setView(currentUser.role === 'Admin' ? ViewState.ADMIN_DASHBOARD : ViewState.USER_DASHBOARD)}
                className={`hidden md:flex !px-6 !py-2.5 !text-[10px] !uppercase !tracking-widest !rounded-full ${!useDarkText ? '!border-white !text-white hover:!bg-white hover:!text-brand-900' : ''}`}
              >
                {currentUser.role === 'Admin' ? 'Admin Panel' : 'My Dashboard'}
              </Button>
            ) : (
              <Button
                variant={useDarkText ? "primary" : "outline"}
                onClick={onLoginClick}
                className={`hidden md:flex !px-6 !py-2.5 !text-[10px] !uppercase !tracking-widest !rounded-full ${!useDarkText ? '!border-white !text-white hover:!bg-white hover:!text-brand-900' : ''}`}
              >
                Member Login
              </Button>
            )}

            <button
              className={`p-2.5 rounded-full transition-all active:scale-95 ${useDarkText ? 'bg-brand-50 text-brand-950 shadow-md' : 'bg-white/10 text-white backdrop-blur-md'}`}
              onClick={() => setMobileMenuOpen(true)}
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
              variants={menuPanelVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-sm bg-white/95 backdrop-blur-2xl shadow-2xl flex flex-col border-l border-brand-100"
            >
              <div className="p-8 flex items-center justify-between border-b border-brand-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-600 rounded-lg text-white shadow-lg"><Church size={20} /></div>
                  <h2 className="font-serif font-bold text-xl text-brand-950">Navigation</h2>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-brand-50 rounded-full transition-all text-brand-950"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { setView(item.view); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${currentView === item.view ? 'bg-brand-600 text-white border-brand-500 shadow-lg' : 'bg-transparent text-brand-900 border-transparent hover:bg-brand-50'}`}
                  >
                    <span className={currentView === item.view ? 'text-white' : 'text-brand-400'}>{getIcon(item.view)}</span>
                    <span className="font-bold tracking-wide uppercase text-xs">{item.label}</span>
                    {currentView === item.view && <Sparkles size={14} className="ml-auto text-accent-300" />}
                  </button>
                ))}
              </div>

              <div className="p-8 bg-brand-50 mt-auto">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-white p-2 rounded-xl shadow-sm"><Phone size={16} className="text-brand-600" /></div>
                  <div>
                    <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Prayer Line</p>
                    <p className="text-sm font-bold text-brand-900">+91 80562 5478</p>
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  <Youtube size={20} className="text-brand-400 hover:text-brand-600 cursor-pointer" />
                  <Facebook size={20} className="text-brand-400 hover:text-brand-600 cursor-pointer" />
                  <Instagram size={20} className="text-brand-400 hover:text-brand-600 cursor-pointer" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};