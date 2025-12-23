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
    case ViewState.BARUCH_HASHEM: return <Globe size={18} />;
    case ViewState.AI: return <Sparkles size={18} />;
    default: return <Church size={18} />;
  }
};

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, onLoginClick, currentUser }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic theme based on view and scroll state
  const isDarkBackground = currentView === ViewState.HOME || currentView === ViewState.HEBREW || currentView === ViewState.MENORAH || currentView === ViewState.BARUCH_HASHEM;
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
    closed: { x: 40, opacity: 0 },
    open: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 400, damping: 30 }
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out ${isScrolled ? 'bg-white/80 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] py-4 border-b border-black/5' : 'bg-transparent py-8'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView(ViewState.HOME)}>
            <div className={`p-2.5 rounded-2xl transition-all duration-500 border ${useDarkText ? 'bg-brand-600 text-white border-brand-500 shadow-xl shadow-brand-600/20' : 'bg-white/10 text-white border-white/20 backdrop-blur-md'}`}>
              <Church size={26} className="group-hover:scale-110 group-hover:rotate-6 transition-transform" />
            </div>
            <div className="flex flex-col">
              <h1 className={`font-serif font-black text-2xl leading-none tracking-tighter ${useDarkText ? 'text-brand-950' : 'text-white'}`}>City of Truth</h1>
              <p className={`text-[10px] font-black uppercase tracking-[0.3em] mt-1.5 ${useDarkText ? 'text-brand-600' : 'text-accent-400'}`}>Ministries</p>
            </div>
          </div>

          <nav className="hidden xl:flex items-center gap-1.5">
            {navItems.slice(0, 8).map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.label}
                  onClick={() => setView(item.view)}
                  className={`px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all relative group overflow-hidden ${useDarkText ? (isActive ? 'text-white bg-brand-950 shadow-lg' : 'text-slate-500 hover:text-brand-950 hover:bg-slate-100/50') : (isActive ? 'text-white bg-white/20' : 'text-white/60 hover:text-white hover:bg-white/10')}`}
                >
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <Button
              variant={useDarkText ? "primary" : "outline"}
              onClick={onLoginClick}
              className={`hidden md:flex !px-8 !py-3 !text-[10px] !font-black !uppercase !tracking-[0.2em] !rounded-full transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl hover:shadow-brand-600/20 ${!useDarkText ? '!border-white/40 !text-white hover:!bg-white hover:!text-brand-950' : ''}`}
            >
              <LogIn size={14} className="mr-2" />
              {currentUser ? 'DASHBOARD' : 'MEMBER LOGIN'}
            </Button>

            <button
              className={`p-4 rounded-[1.25rem] transition-all hover:scale-105 active:scale-90 border hover:rotate-2 shadow-sm ${useDarkText ? 'bg-white border-slate-200 text-brand-950 shadow-md' : 'bg-white/10 text-white border-white/20 backdrop-blur-md'}`}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-[100] bg-brand-950/20 backdrop-blur-md" />
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: "spring", damping: 35, stiffness: 400 }}
              className="fixed top-0 right-0 bottom-0 z-[110] w-[90%] max-w-sm bg-white/95 backdrop-blur-3xl shadow-[-30px_0_80px_rgba(0,0,0,0.1)] flex flex-col border-l border-white/50"
            >
              <div className="p-8 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-600 rounded-2xl text-white shadow-2xl rotate-3"><Church size={24} /></div>
                  <div className="flex flex-col">
                    <h2 className="font-serif font-black text-2xl text-brand-950 leading-none">Holy Navigation</h2>
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-accent-600 mt-2">Divine Selection</span>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-3 bg-slate-100 hover:bg-brand-950 hover:text-white rounded-2xl transition-all transform hover:rotate-90 text-brand-950"><X size={24} /></button>
              </div>

              <motion.div
                variants={menuItemsContainer}
                initial="closed"
                animate="open"
                className="flex-1 overflow-y-auto py-10 px-6 space-y-3 custom-scrollbar"
              >
                {navItems.map((item) => (
                  <motion.button
                    key={item.label}
                    variants={menuItem}
                    whileHover={{
                      x: 12,
                      scale: 1.02,
                      backgroundColor: "rgba(241, 245, 249, 0.9)"
                    }}
                    onClick={() => { setView(item.view); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-6 p-5 rounded-[2rem] transition-all group ${currentView === item.view ? 'bg-brand-600 text-white border-brand-500 shadow-2xl' : 'bg-transparent text-slate-600 border border-transparent'}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${currentView === item.view ? 'bg-white/20 text-white rotate-12' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-brand-600 group-hover:rotate-6 group-hover:shadow-lg'}`}>
                      {getIcon(item.view)}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-serif font-black text-xl tracking-tight uppercase leading-none mb-1.5 group-hover:tracking-wider transition-all">{item.label}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${currentView === item.view ? 'text-white/60' : 'text-slate-400'}`}>Holy Section Entry</span>
                    </div>
                    {currentView === item.view ? <Sparkles size={18} className="ml-auto text-accent-300 animate-pulse" /> : <ChevronRight size={18} className="ml-auto opacity-0 group-hover:opacity-40 translate-x-4 group-hover:translate-x-0 transition-all duration-500" />}
                  </motion.button>
                ))}
              </motion.div>

              <div className="p-10 bg-slate-50/50 backdrop-blur-md border-t border-slate-100 mt-auto">
                <div className="flex items-center gap-5 mb-8 group cursor-default">
                  <div className="bg-white p-4 rounded-2xl shadow-xl border border-white group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500"><Phone size={20} className="text-brand-600" /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Divine Prayer Line</p>
                    <p className="text-xl font-black text-brand-950 tracking-tighter">+91 80562 5478</p>
                  </div>
                </div>
                <div className="flex gap-10 justify-center">
                  {[
                    { Icon: Youtube, href: "https://youtube.com/@cotministries" },
                    { Icon: Facebook, href: "https://facebook.com/cityoftruthministries" },
                    { Icon: Instagram, href: "https://instagram.com/cityoftruthministries" }
                  ].map(({ Icon, href }, i) => (
                    <a key={i} href={href} target="_blank" rel="noopener noreferrer">
                      <Icon size={26} className="text-slate-300 hover:text-brand-600 hover:scale-125 hover:rotate-12 transition-all duration-500 cursor-pointer" />
                    </a>
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <p className="text-[9px] font-black text-brand-950/20 uppercase tracking-[0.5em] italic">"The Sanctuary of Eternal Light"</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};