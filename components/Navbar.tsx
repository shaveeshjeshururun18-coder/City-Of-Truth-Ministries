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
    case ViewState.ID_CARD: return <img src="/logo.png" alt="Card" className="w-[18px] h-[18px] object-contain" />;
    case ViewState.ABOUT_VALPARAI: return <MapPin size={18} />;
    case ViewState.MENORAH: return <Flame size={18} />;
    case ViewState.BARUCH_HASHEM: return <Globe size={18} />;
    case ViewState.AI: return <Sparkles size={18} />;
    default: return <Church size={18} />;
  }
};

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, onLoginClick, currentUser }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Import Montserrat font directly for exactness */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
        .montserrat { font-family: 'Montserrat', sans-serif; }
      `}} />

      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center bg-white px-10 py-[15px] shadow-[0_2px_10px_rgba(0,0,0,0.05)] montserrat">
        {/* LOGO STYLING */}
        <div
          className="flex items-center gap-[10px] cursor-pointer"
          onClick={() => setView(ViewState.HOME)}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <img src="/logo.png" alt="COT Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[#1a1a2e] font-bold text-[1.1rem] leading-[1.1] tracking-[-0.5px]">City of Truth</span>
            <span className="text-[#5D5FEF] text-[0.65rem] font-bold tracking-[1px] uppercase">MINISTRIES</span>
          </div>
        </div>

        {/* MENU LINKS STYLING */}
        <ul className="hidden xl:flex items-center gap-[6px] list-none">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <li key={item.label}>
                <button
                  onClick={() => setView(item.view)}
                  className={`text-[0.65rem] font-bold uppercase tracking-[0.5px] px-[12px] py-2 rounded-[20px] transition-all duration-300 no-underline whitespace-nowrap ${isActive
                    ? 'bg-[#EEF0FF] text-[#5D5FEF]'
                    : 'text-[#555] hover:text-[#5D5FEF]'
                    }`}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>

        {/* RIGHT SIDE ACTIONS */}
        <div className="flex items-center gap-[15px]">
          <button
            onClick={onLoginClick}
            className="flex items-center bg-[#4C51F7] text-white text-[0.75rem] font-bold px-6 py-3 rounded-[25px] uppercase transition-colors duration-300 hover:bg-[#3b3ed6] no-underline whitespace-nowrap"
          >
            {currentUser ? 'DASHBOARD' : 'MEMBER LOGIN'}
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="bg-white border border-[#ddd] w-10 h-10 rounded-full cursor-pointer text-[#333] text-base flex items-center justify-center transition-all duration-300 hover:bg-[#f9f9f9] hover:text-[#5D5FEF]"
          >
            <Menu size={16} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-[110] w-[85%] max-w-sm bg-white shadow-2xl flex flex-col montserrat"
            >
              <div className="p-8 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                    <img src="/logo.png" alt="COT Logo" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-bold text-lg text-[#1a1a2e] leading-none">Navigation</h2>
                    <span className="text-[10px] text-[#5D5FEF] font-bold uppercase tracking-widest mt-1">Divine Menu</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all text-[#333]"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-6 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { setView(item.view); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${currentView === item.view
                      ? 'bg-[#EEF0FF] text-[#5D5FEF]'
                      : 'bg-transparent text-[#555] hover:bg-gray-50'
                      }`}
                  >
                    <span className={currentView === item.view ? 'text-[#5D5FEF]' : 'text-gray-400'}>
                      {getIcon(item.view)}
                    </span>
                    <span className="font-bold tracking-wide uppercase text-xs">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-4 mb-6 group cursor-default">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 transition-transform hover:scale-110"><Phone size={16} className="text-[#5D5FEF]" /></div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Prayer Line</p>
                    <p className="text-base font-bold text-[#1a1a2e]">+91 80562 5478</p>
                  </div>
                </div>
                <div className="flex gap-6 justify-center">
                  {[Youtube, Facebook, Instagram].map((Icon, i) => (
                    <Icon key={i} size={20} className="text-gray-400 hover:text-[#5D5FEF] cursor-pointer transition-all hover:scale-125" />
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};