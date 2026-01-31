import React, { useState, useEffect } from 'react';
import { Menu, X, Church, Home, Info, Heart, Flame, Phone, ChevronRight, CreditCard, Facebook, Youtube, Instagram, MapPin, Languages, Zap, Sparkles, Send, Globe, LogIn, CircleUser, LogOut, ChevronDown, Calendar, Hash, Star, BookOpen, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewState, NavItem } from '../types';
import { Button } from './Button';
import { User as UserType } from '../types';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onLoginClick: () => void;
  onLogoutClick?: () => void;
  currentUser?: UserType | null;
}

const navItems: NavItem[] = [
  { label: 'HOME', view: ViewState.HOME },
  {
    label: 'HEBREW',
    view: ViewState.ABOUT,
    submenu: [
      { label: 'Biblical Calendar', view: ViewState.HEBREW_CALENDAR },
      { label: 'Hebrew Numbers', view: ViewState.HEBREW_NUMBERS },
      { label: 'Festivals & Holy Days', view: ViewState.HEBREW_FESTIVALS },
      { label: 'Month/Year Reference', view: ViewState.HEBREW_REFERENCE },
    ]
  },
  { label: 'ALPHABETS', view: ViewState.HEBREW },
  { label: 'VALPARAI', view: ViewState.ABOUT_VALPARAI },
  { label: 'MINISTRIES', view: ViewState.MINISTRIES },
  { label: 'MENORAH', view: ViewState.GOLDEN_MENORAH },
  { label: 'BARUCH HASHEM', view: ViewState.BARUCH_HASHEM },
  { label: 'AI ASSISTANCE', view: ViewState.AI },
  { label: 'ENTRUST CARD', view: ViewState.ID_CARD },
  { label: 'CONTACT', view: ViewState.CONTACT },
];

const getIcon = (view: ViewState) => {
  switch (view) {
    case ViewState.HOME: return <Home size={18} />;
    case ViewState.ABOUT: return <Languages size={18} />;
    case ViewState.HEBREW_CALENDAR: return <Calendar size={18} />;
    case ViewState.HEBREW_NUMBERS: return <Hash size={18} />;
    case ViewState.HEBREW_FESTIVALS: return <Star size={18} />;
    case ViewState.HEBREW_REFERENCE: return <BookOpen size={18} />;
    case ViewState.MINISTRIES: return <Heart size={18} />;
    case ViewState.HEBREW: return <Languages size={18} />;
    case ViewState.CONTACT: return <Phone size={18} />;
    case ViewState.ID_CARD: return <img src="/logo.png" alt="Card" className="w-[18px] h-[18px] object-contain" />;
    case ViewState.ABOUT_VALPARAI: return <MapPin size={18} />;
    case ViewState.MENORAH: return <Flame size={18} />;
    case ViewState.MENORAH_FLAG: return <Flame size={18} />;
    case ViewState.BARUCH_HASHEM: return <Globe size={18} />;
    case ViewState.AI: return <Sparkles size={18} />;
    default: return <Church size={18} />;
  }
};

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, onLoginClick, onLogoutClick, currentUser }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState<string | null>(null);
  const [desktopHoverMenu, setDesktopHoverMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Import Montserrat font directly for exactness */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
        .montserrat { font-family: 'Montserrat', sans-serif; }
      `}} />

      <nav className={`${currentView === ViewState.ABOUT ? 'absolute shadow-none' : 'fixed'} top-0 left-0 right-0 z-50 flex justify-between items-center transition-all duration-500 px-6 md:px-10 py-[15px] montserrat ${isScrolled ? 'bg-white shadow-lg border-b border-gray-100' : (currentView !== ViewState.HOME && currentView !== ViewState.ABOUT ? 'bg-white shadow-sm border-b border-gray-50' : 'bg-transparent shadow-none')}`}>
        {/* LOGO STYLING */}
        <div
          className="flex items-center gap-[10px] cursor-pointer"
          onClick={() => setView(ViewState.HOME)}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <img src="/logo.png" alt="COT Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col justify-center">
            <span className={`font-bold text-[1.1rem] leading-[1.1] tracking-[-0.5px] ${isScrolled || currentView !== ViewState.HOME ? 'text-[#1a1a2e]' : 'text-white'}`}>City of Truth</span>
            <span className={`text-[0.65rem] font-bold tracking-[1px] uppercase ${isScrolled || currentView !== ViewState.HOME ? 'text-[#5D5FEF]' : 'text-accent-400'}`}>MINISTRIES</span>
          </div>
        </div>

        {/* MENU LINKS STYLING */}
        <ul className="hidden xl:flex items-center gap-[6px] list-none">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            const hasSubmenu = item.submenu && item.submenu.length > 0;

            return (
              <li
                key={item.label}
                className="relative group"
                onMouseEnter={() => hasSubmenu && setDesktopHoverMenu(item.label)}
                onMouseLeave={() => hasSubmenu && setDesktopHoverMenu(null)}
              >
                <button
                  onClick={() => !hasSubmenu && setView(item.view)}
                  className={`text-[0.65rem] font-bold uppercase tracking-[0.5px] px-[12px] py-2 rounded-[20px] transition-all duration-300 no-underline whitespace-nowrap flex items-center gap-1 ${isActive
                    ? 'bg-[#EEF0FF] text-[#5D5FEF]'
                    : (isScrolled || (currentView !== ViewState.HOME && currentView !== ViewState.ABOUT) ? 'text-[#555] hover:text-[#5D5FEF]' : (currentView === ViewState.ABOUT ? 'text-brand-950 hover:text-brand-600' : 'text-white/80 hover:text-white'))
                    }`}
                >
                  {item.label}
                  {hasSubmenu && <ChevronDown size={12} className={`transition-transform duration-300 ${desktopHoverMenu === item.label ? 'rotate-180' : ''}`} />}
                </button>

                {/* Desktop Submenu */}
                {hasSubmenu && (
                  <AnimatePresence>
                    {desktopHoverMenu === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden"
                      >
                        {item.submenu?.map((sub) => (
                          <button
                            key={sub.label}
                            onClick={() => {
                              setView(sub.view);
                              setDesktopHoverMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 text-[10px] font-bold text-gray-600 hover:bg-brand-50 hover:text-brand-600 transition-colors uppercase tracking-wider"
                          >
                            {sub.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </li>
            );
          })}
        </ul>

        {/* RIGHT SIDE ACTIONS */}
        <div className="flex items-center gap-[15px]">
          {/* Show Register button only if NOT logged in */}
          {!currentUser && (
            <button
              onClick={() => setView(ViewState.ID_CARD)}
              className="hidden md:flex items-center bg-[#4C51F7] text-white text-[0.75rem] font-bold px-6 py-3 rounded-[25px] uppercase transition-colors duration-300 hover:bg-[#3b3ed6] no-underline whitespace-nowrap"
            >
              REGISTER
            </button>
          )}

          <button
            onClick={() => currentUser ? setView(ViewState.USER_DASHBOARD) : setView(ViewState.ID_CARD)}
            className="bg-white border border-[#ddd] w-10 h-10 rounded-full cursor-pointer text-[#333] text-base flex items-center justify-center transition-all duration-300 hover:bg-[#f9f9f9] hover:text-[#5D5FEF]"
            title={currentUser ? "My Account" : "Register"}
          >
            {currentUser && currentUser.photo ? (
              <img src={currentUser.photo} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              <CircleUser size={18} />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`border w-10 h-10 rounded-full cursor-pointer text-base flex items-center justify-center transition-all duration-300 ${isScrolled || currentView !== ViewState.HOME ? 'bg-white border-[#ddd] text-[#333] hover:bg-[#f9f9f9] hover:text-[#5D5FEF]' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
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
              <div className="p-6 flex flex-col items-center text-center bg-gradient-to-b from-brand-50 to-white border-b border-brand-100/50">
                <div className="flex justify-between w-full mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-brand-100">
                      <img src="/logo.png" alt="COT Logo" className="w-6 h-6 object-contain" />
                    </div>
                    <div className="text-left">
                      <h2 className="font-bold text-sm text-[#1a1a2e] leading-none">City of Truth</h2>
                      <span className="text-[9px] text-[#5D5FEF] font-bold uppercase tracking-widest mt-1">Ministries</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-white rounded-full transition-all text-[#333] shadow-sm border border-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Profile Section in Mobile Menu */}
                <div
                  onClick={() => {
                    currentUser ? setView(ViewState.USER_DASHBOARD) : setView(ViewState.ID_CARD);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-white p-2.5 rounded-xl border border-brand-100 shadow-sm cursor-pointer hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full border-2 border-brand-50 shadow-inner flex items-center justify-center bg-slate-50 overflow-hidden">
                        {currentUser && currentUser.photo ? (
                          <img src={currentUser.photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <CircleUser size={20} className="text-brand-300" />
                        )}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-brand-600 rounded-full border-2 border-white flex items-center justify-center text-white">
                        {currentUser ? <Zap size={6} /> : <LogIn size={6} />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-brand-950 text-[11px] truncate">
                        {currentUser ? currentUser.name : 'Guest Community'}
                      </h3>
                      <p className="text-[7px] font-bold text-brand-500 uppercase tracking-widest truncate">
                        {currentUser ? (currentUser.role || 'Member') : 'Join Our Family'}
                      </p>
                    </div>
                    <div className="px-2 py-1 bg-brand-50 text-brand-700 rounded-full text-[7px] font-bold uppercase tracking-widest border border-brand-100 whitespace-nowrap">
                      {currentUser ? 'Dashboard' : 'Register'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-6 space-y-1">
                {navItems.map((item) => {
                  const hasSubmenu = item.submenu && item.submenu.length > 0;
                  const isSubmenuOpen = activeMobileSubmenu === item.label;

                  return (
                    <div key={item.label} className="space-y-1">
                      <button
                        onClick={() => {
                          if (hasSubmenu) {
                            setActiveMobileSubmenu(isSubmenuOpen ? null : item.label);
                          } else {
                            setView(item.view);
                            setMobileMenuOpen(false);
                          }
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${currentView === item.view
                          ? 'bg-[#EEF0FF] text-[#5D5FEF]'
                          : 'bg-transparent text-[#555] hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={currentView === item.view ? 'text-[#5D5FEF]' : 'text-gray-400'}>
                            {getIcon(item.view)}
                          </span>
                          <span className="font-bold tracking-wide uppercase text-xs">{item.label}</span>
                        </div>
                        {hasSubmenu && (
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-300 ${isSubmenuOpen ? 'rotate-180' : ''}`}
                          />
                        )}
                      </button>

                      {hasSubmenu && (
                        <AnimatePresence>
                          {isSubmenuOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden pl-12 space-y-1"
                            >
                              {item.submenu?.map((sub) => (
                                <button
                                  key={sub.label}
                                  onClick={() => {
                                    setView(sub.view);
                                    setMobileMenuOpen(false);
                                  }}
                                  className="w-full text-left p-2 text-[10px] font-bold text-gray-500 hover:text-brand-600 transition-colors uppercase tracking-wider"
                                >
                                  {sub.label}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-gray-50 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-3 mb-3 group cursor-default">
                  <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100 transition-transform hover:scale-110"><Phone size={12} className="text-[#5D5FEF]" /></div>
                  <div>
                    <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Prayer Line</p>
                    <p className="text-xs font-bold text-[#1a1a2e]">+91 80562 5478</p>
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  {[Youtube, Facebook, Instagram].map((Icon, i) => (
                    <Icon key={i} size={16} className="text-gray-400 hover:text-[#5D5FEF] cursor-pointer transition-all hover:scale-125" />
                  ))}
                </div>
              </div>

              {/* Logout Button in Mobile Menu */}
              {currentUser && onLogoutClick && (
                <div className="px-6 pb-6">
                  <button
                    onClick={() => {
                      onLogoutClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 p-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-red-100 transition-colors"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence >
    </>
  );
};