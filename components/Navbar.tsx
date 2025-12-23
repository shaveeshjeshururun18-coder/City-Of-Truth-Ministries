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
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItemsContainer = {
    closed: { opacity: 0 },
    open: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const menuItem = {
    closed: { y: 20, opacity: 0 },
    open: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const currentLabel = navItems.find(item => item.view === currentView)?.label || "CITY OF TRUTH";

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled ? 'py-3 bg-brand-950/95 backdrop-blur-2xl border-b border-white/10' : 'py-8 bg-transparent'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">

          <motion.div
            animate={{
              opacity: isScrolled ? 0 : 1,
              x: isScrolled ? -20 : 0
            }}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => setView(ViewState.HOME)}
          >
            <img src="/brand-logo.png" alt="COT Logo" className="w-12 h-12 object-contain group-hover:scale-110 transition-transform shadow-2xl" />
            <div className="flex flex-col">
              <span className="font-serif font-black text-2xl tracking-tighter text-white whitespace-nowrap leading-none mb-1">
                City of Truth
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-400 leading-none">Ministries</span>
            </div>
          </motion.div>

          <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none overflow-hidden h-12 flex items-center">
            <AnimatePresence mode="wait">
              {isScrolled && (
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex flex-col items-center"
                >
                  <span className="font-serif font-black text-xl text-white tracking-widest uppercase">{currentLabel}</span>
                  <div className="w-12 h-0.5 bg-accent-500 rounded-full mt-1"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.slice(0, 5).map((item) => {
                const isActive = currentView === item.view;
                return (
                  <button
                    key={item.label}
                    onClick={() => setView(item.view)}
                    className={`px-4 py-2 text-[10px] font-black tracking-[0.2em] transition-all relative group whitespace-nowrap uppercase ${isActive ? 'text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="navHeaderIndicator"
                        className="absolute bottom-0 left-4 right-4 h-0.5 bg-accent-500 -z-0"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            <button
              onClick={onLoginClick}
              className="hidden 2xl:flex items-center gap-3 px-6 py-3 border border-white/40 text-white font-black text-[10px] tracking-widest uppercase rounded-full hover:bg-white hover:text-brand-950 transition-all duration-500 active:scale-95 shadow-xl hover:shadow-white/20"
            >
              <LogIn size={14} />
              {currentUser ? 'DASHBOARD' : 'MEMBER LOGIN'}
            </button>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-4 bg-white/5 text-white hover:bg-white/10 rounded-[1.25rem] border border-white/10 transition-all hover:scale-105 active:scale-90 flex items-center gap-2 group"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block opacity-60 group-hover:opacity-100 transition-opacity">Menu</span>
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
              className="fixed inset-0 z-[100] bg-brand-950/95 backdrop-blur-2xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-[110] flex flex-col items-center justify-center p-6 md:p-24 overflow-hidden"
            >
              <div className="absolute top-10 right-10">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-5 bg-white/5 text-white hover:bg-white/20 rounded-full transition-all hover:rotate-90"
                >
                  <X size={32} />
                </button>
              </div>

              <div className="absolute top-10 left-10 flex items-center gap-4">
                <img src="/brand-logo.png" alt="Logo" className="w-12 h-12" />
                <div className="hidden sm:block">
                  <h3 className="font-serif font-black text-xl text-white">City of Truth</h3>
                  <p className="text-[10px] text-accent-400 font-black uppercase tracking-widest">Ministries</p>
                </div>
              </div>

              <motion.nav
                variants={menuItemsContainer}
                initial="closed"
                animate="open"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-x-20 md:gap-y-8 max-w-7xl w-full"
              >
                {navItems.map((item) => (
                  <motion.button
                    key={item.label}
                    variants={menuItem}
                    onClick={() => { setView(item.view); setMobileMenuOpen(false); }}
                    className={`group text-left flex items-center gap-8 p-6 md:p-8 rounded-[2rem] transition-all border ${currentView === item.view ? 'bg-white text-brand-950 border-white shadow-2xl' : 'text-white hover:bg-white/5 border-white/5 hover:border-white/20'}`}
                  >
                    <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center transition-all ${currentView === item.view ? 'bg-brand-950 text-accent-400' : 'bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-accent-400 group-hover:scale-110'}`}>
                      {React.cloneElement(getIcon(item.view) as React.ReactElement, { size: 28 })}
                    </div>
                    <div>
                      <span className="block font-serif font-black text-2xl md:text-3xl tracking-tight mb-2 uppercase group-hover:tracking-wider transition-all duration-500">
                        {item.label}
                      </span>
                      <span className="block text-[10px] font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 group-hover:text-accent-400 transition-all">Explore Section</span>
                    </div>
                  </motion.button>
                ))}
              </motion.nav>

              <motion.footer
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-20 flex flex-col items-center"
              >
                <div className="flex gap-10 mb-8">
                  {[
                    { Icon: Youtube, href: "https://youtube.com/@cotministries?si=A6179oNRuuJ9snjM", label: "YouTube" },
                    { Icon: Facebook, href: "https://facebook.com/cityoftruthministries", label: "Facebook" },
                    { Icon: Instagram, href: "https://instagram.com/cityoftruthministries", label: "Instagram" }
                  ].map(({ Icon, href, label }, i) => (
                    <a
                      key={i}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center gap-3"
                    >
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 hover:text-accent-400 hover:bg-white/10 hover:scale-110 active:scale-95 transition-all border border-white/5">
                        <Icon size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors">{label}</span>
                    </a>
                  ))}
                </div>
                <div className="w-1 h-12 bg-gradient-to-b from-accent-500 to-transparent rounded-full mb-10 opacity-50"></div>
                <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">"Walking in Divine Light"</p>
              </motion.footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};