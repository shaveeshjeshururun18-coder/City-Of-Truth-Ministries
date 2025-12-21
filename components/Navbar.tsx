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
  { label: 'Ministries', view: ViewState.MINISTRIES },
  { label: 'Baruch Hashem', view: ViewState.BARUCH_HASHEM },
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
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const menuItem = {
    closed: { x: 20, opacity: 0 },
    open: { x: 0, opacity: 1 }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled ? 'py-4' : 'py-8'}`}>
        <div className={`absolute inset-0 transition-all duration-700 ${isScrolled ? 'bg-white/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-b border-white/20' : 'bg-transparent'}`} />

        <div className="container mx-auto px-6 flex items-center justify-between relative z-10">
          {/* Logo Section */}
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView(ViewState.HOME)}>
            <div className={`p-2.5 rounded-2xl transition-all duration-500 border ${useDarkText ? 'bg-brand-600 shadow-[0_10px_20px_-5px_rgba(47,72,173,0.4)] text-white border-brand-500 hover:rotate-6' : 'bg-white/10 text-white border-white/20 backdrop-blur-lg hover:bg-white/20'}`}>
              <Church size={26} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className={`font-serif font-black text-2xl tracking-tighter transition-colors duration-500 ${useDarkText ? 'text-brand-950' : 'text-white'}`}>
                City of Truth
              </span>
              <div className="flex items-center gap-2">
                <span className={`h-1 w-4 rounded-full transition-colors duration-500 ${useDarkText ? 'bg-brand-600' : 'bg-accent-400'}`} />
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-500 ${useDarkText ? 'text-brand-600' : 'text-accent-300'}`}>Ministries</span>
              </div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 bg-black/5 p-1.5 rounded-2xl backdrop-blur-md border border-white/5">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.label}
                  onClick={() => setView(item.view)}
                  className={`px-5 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all relative group overflow-hidden ${useDarkText ? (isActive ? 'text-brand-700' : 'text-slate-500 hover:text-brand-950') : (isActive ? 'text-white' : 'text-white/60 hover:text-white')}`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive ? (
                    <motion.div layoutId="navGlow" className={`absolute inset-0 rounded-xl z-0 ${useDarkText ? 'bg-white shadow-sm' : 'bg-white/10'}`} />
                  ) : (
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Live Now</span>
            </div>

            {currentUser ? (
              <Button
                variant={useDarkText ? "primary" : "glass"}
                onClick={() => setView(currentUser.role === 'Admin' ? ViewState.ADMIN_DASHBOARD : ViewState.USER_DASHBOARD)}
                className="hidden md:flex !px-6 !py-3 !text-[11px] !uppercase !tracking-widest !rounded-2xl"
              >
                {currentUser.role === 'Admin' ? 'Admin Portal' : 'My Account'}
              </Button>
            ) : (
              <Button
                variant={useDarkText ? "primary" : "glass"}
                onClick={onLoginClick}
                className="hidden md:flex !px-6 !py-3 !text-[11px] !uppercase !tracking-widest !rounded-2xl"
              >
                Member Area
              </Button>
            )}

            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`p-3 rounded-2xl transition-all active:scale-90 ${useDarkText ? 'bg-brand-50 text-brand-950 hover:bg-brand-100 shadow-sm' : 'bg-white/10 text-white backdrop-blur-lg border border-white/20 hover:bg-white/20'}`}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-brand-950/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: '100%', skewX: 10 }}
              animate={{ x: 0, skewX: 0 }}
              exit={{ x: '100%', skewX: 5 }}
              transition={{ type: "spring", damping: 40, stiffness: 400 }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/5 rounded-full blur-[100px] -mr-64 -mt-64" />

              <header className="p-8 flex items-center justify-between border-b border-brand-50 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-brand-600 rounded-2xl text-white shadow-xl shadow-brand-600/20"><Church size={22} /></div>
                  <div>
                    <h2 className="font-serif font-black text-2xl text-brand-950 tracking-tighter">Ministry Hub</h2>
                    <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mt-0.5">Navigation Menu</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 bg-brand-50 hover:bg-brand-100 rounded-2xl transition-all text-brand-950"
                >
                  <X size={24} />
                </button>
              </header>

              <motion.div
                variants={menuItemsContainer}
                initial="closed"
                animate="open"
                className="flex-1 overflow-y-auto pt-8 px-6 space-y-3 relative z-10"
              >
                {navItems.map((item) => (
                  <motion.button
                    key={item.label}
                    variants={menuItem}
                    onClick={() => { setView(item.view); setMobileMenuOpen(false); }}
                    className={`w-full group flex items-center gap-5 p-5 rounded-3xl transition-all relative overflow-hidden ${currentView === item.view ? 'bg-brand-600 text-white shadow-2xl shadow-brand-600/30 translate-x-2' : 'bg-slate-50 text-slate-900 border border-slate-100 hover:bg-white hover:border-brand-200'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentView === item.view ? 'bg-white/20 text-white' : 'bg-white text-brand-400 shadow-sm group-hover:bg-brand-50'}`}>
                      {getIcon(item.view)}
                    </div>
                    <div className="text-left flex-1">
                      <span className="block font-black tracking-[0.1em] uppercase text-xs">{item.label}</span>
                      <span className={`text-[10px] font-bold tracking-wider opacity-60 uppercase transition-colors ${currentView === item.view ? 'text-white' : 'text-slate-400'}`}>Explore More</span>
                    </div>
                    <ChevronRight size={16} className={`transition-all ${currentView === item.view ? 'translate-x-0' : '-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                  </motion.button>
                ))}
              </motion.div>

              <footer className="p-8 bg-brand-950 text-white relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-400 mb-6 flex items-center gap-2">
                  <Globe size={14} /> Connect With Us
                </p>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { icon: Youtube, color: 'hover:text-red-500' },
                    { icon: Facebook, color: 'hover:text-blue-500' },
                    { icon: Instagram, color: 'hover:text-pink-500' }
                  ].map((Social, i) => (
                    <a key={i} href="#" className={`bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-center transition-all hover:bg-white/10 hover:-translate-y-1 ${Social.color}`}>
                      <Social.icon size={20} />
                    </a>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Support Line</span>
                    <span className="text-sm font-black text-white">+91 80561 25478</span>
                  </div>
                  <Button variant="accent" className="!px-4 !py-2 !text-[9px] !rounded-xl">Help Desk</Button>
                </div>
              </footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};