import React, { useState, useEffect } from 'react';
import { Menu, X, Church, Home, Info, Heart, Flame, Phone, ChevronRight, CreditCard, Facebook, Youtube, Instagram, MapPin, Languages, Zap, Sparkles, Send, Globe, LogIn, CircleUser, LogOut, ChevronDown, Calendar, Hash, Star, BookOpen, ExternalLink, Plus } from 'lucide-react';
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
  navItems: NavItem[];
}

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

const DEFAULT_INITIALS = 'CT';

const getInitials = (name?: string) => {
  const safeName = (name || '').trim();
  if (!safeName) return DEFAULT_INITIALS;
  const parts = safeName.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return safeName.slice(0, 2).toUpperCase();
};

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, onLoginClick, onLogoutClick, currentUser, navItems }) => {
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

      <nav className={`${currentView === ViewState.ABOUT ? 'absolute shadow-none' : 'fixed'} top-0 left-0 right-0 z-50 flex justify-between items-center transition-all duration-500 px-4 md:px-8 py-2.5 montserrat bg-white shadow-sm border-b border-gray-100`}>
        {/* LOGO STYLING */}
        <div
          className="flex items-center gap-[10px] cursor-pointer"
          onClick={() => setView(ViewState.HOME)}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <img src="/logo.png" alt="COT Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col justify-center">
              <span className="font-bold text-[1.1rem] leading-[1.1] tracking-[-0.5px] text-[#1a1a2e]">City of Truth</span>
              <span className="text-[0.65rem] font-bold tracking-[1px] uppercase text-[#5D5FEF]">MINISTRIES</span>
          </div>
        </div>


        {/* MENU LINKS STYLING (Restored for Desktop) */}
        <ul className="hidden xl:flex items-center gap-[6px] list-none">
          {navItems.map((item) => {
            const isActive = currentView === item.view || item.submenu?.some(s => s.view === currentView);
            const hasSubmenu = item.submenu && item.submenu.length > 0;

            return (
              <li
                key={item.label}
                className="relative group"
                onMouseEnter={() => hasSubmenu && setDesktopHoverMenu(item.label)}
                onMouseLeave={() => hasSubmenu && setDesktopHoverMenu(null)}
              >
                <button
                  onClick={() => {
                    if (item.label === 'HEBREW') setView(ViewState.ABOUT); // Parent link
                    else if (!hasSubmenu) setView(item.view);
                  }}
                  className={`text-[0.65rem] font-bold uppercase tracking-[0.5px] px-[12px] py-2 rounded-[20px] transition-all duration-300 no-underline whitespace-nowrap flex items-center gap-1 ${isActive
                    ? 'bg-brand-50 text-brand-600 shadow-sm border border-brand-100'
                    : 'text-slate-600 hover:text-brand-600'
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
                        className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 py-3 z-50 overflow-hidden"
                      >
                        {item.submenu?.map((sub) => (
                          <button
                            key={sub.label}
                            onClick={() => {
                              setView(sub.view);
                              setDesktopHoverMenu(null);
                            }}
                            className="w-full text-left px-5 py-2.5 text-[9px] font-black text-slate-500 hover:bg-brand-50 hover:text-brand-600 transition-all uppercase tracking-widest flex items-center gap-2 group"
                          >
                            <div className="w-1 h-1 rounded-full bg-slate-200 group-hover:bg-brand-400" />
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

        <div className="flex items-center gap-1.5 sm:gap-2 ml-1 sm:ml-2">
          {/* Show Register button only if NOT logged in */}
          {!currentUser && (
            <button
              onClick={() => setView(ViewState.ID_CARD)}
              className="hidden lg:flex items-center relative bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white text-[0.72rem] font-bold px-5 h-11 rounded-xl uppercase transition-all duration-300 hover:from-blue-700 hover:via-blue-600 hover:to-blue-800 hover:scale-[1.02] no-underline whitespace-nowrap shadow-[0_14px_30px_-14px_rgba(37,99,235,0.75)] overflow-hidden group border border-blue-200/40"
            >
              <span className="absolute inset-0 rounded-xl ring-2 ring-white/20 opacity-70 group-hover:opacity-90 transition-opacity" />
              <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
              <span className="relative z-10">REGISTER</span>
            </button>
          )}

          <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-brand-100/70">
            <button
              onClick={() => currentUser ? setView(ViewState.USER_DASHBOARD) : setView(ViewState.ID_CARD)}
              className={`${currentUser ? 'bg-gradient-to-b from-white to-slate-50 border border-brand-100 w-11 h-11 rounded-2xl shadow-[0_10px_18px_-12px_rgba(36,53,108,0.55)] hover:shadow-[0_16px_24px_-12px_rgba(36,53,108,0.65)]' : 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 border border-blue-300/50 px-3.5 h-10 rounded-2xl shadow-[0_14px_24px_-12px_rgba(37,99,235,0.7)] hover:shadow-[0_18px_28px_-12px_rgba(37,99,235,0.8)] hover:from-blue-700 hover:via-blue-600 hover:to-blue-800'} cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 group`}
              title={currentUser ? "My Account" : "Register"}
              aria-label={currentUser ? "Open my account dashboard" : "Register account"}
            >
              {currentUser && currentUser.photo ? (
                <img src={currentUser.photo} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
              ) : currentUser ? (
                <span className="w-full h-full rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white text-[13px] font-black tracking-wide flex items-center justify-center">
                  {getInitials(currentUser.name)}
                </span>
              ) : (
                <>
                  <CircleUser size={16} className="text-white shrink-0" />
                  <span className="text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wide">Register</span>
                </>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl cursor-pointer flex items-center justify-center transition-all duration-300 border border-blue-300/50 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white hover:from-blue-800 hover:via-blue-700 hover:to-blue-900 shadow-[0_12px_22px_-12px_rgba(37,99,235,0.75)] hover:shadow-[0_16px_26px_-12px_rgba(37,99,235,0.85)]"
              title="Open menu"
              aria-label="Open navigation menu"
            >
              <Menu size={18} strokeWidth={2.25} className="text-white" />
            </button>
          </div>
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
              className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-[110] w-[78%] max-w-[19rem] bg-white shadow-2xl flex flex-col montserrat"
            >


              
              <div className="p-5 flex flex-col relative z-20">
                <div className="flex justify-between items-center w-full mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center border border-brand-100">
                      <img src="/logo.png" alt="COT Logo" className="w-5 h-5 object-contain" />
                    </div>
                    <div className="text-left">
                      <h2 className="font-bold text-sm text-[#1a1a2e] leading-none">City of Truth</h2>
                      <span className="text-[9px] text-[#5D5FEF] font-bold uppercase tracking-widest mt-1">Ministries</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 hover:bg-white rounded-full transition-all text-[#333] shadow-sm border border-gray-100"
                  >
                    <X size={18} />
                  </button>


                </div>

                {/* Profile + Family Switcher Section in Mobile Menu */}
                <div className="w-full space-y-2">
                    {/* Primary profile card */}
                    <div
                        onClick={() => { 
                            if (currentUser) { setView(ViewState.USER_DASHBOARD); } 
                            else { setView(ViewState.ID_CARD); }
                            setMobileMenuOpen(false); 
                        }}
                        className={`w-full p-2.5 rounded-xl border cursor-pointer transition-all ${
                            currentUser 
                                ? 'bg-white border-brand-100 shadow-sm hover:bg-slate-50'
                                : 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 border-blue-300/60 shadow-md shadow-blue-600/30 hover:from-blue-700 hover:via-blue-600 hover:to-blue-800'
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="relative shrink-0">
                                <div className={`w-10 h-10 rounded-full border-2 shadow-inner flex items-center justify-center overflow-hidden ${currentUser ? 'border-brand-100 bg-slate-50' : 'border-blue-300 bg-blue-600'}`}>
                                    {currentUser && currentUser.photo ? (
                                        <img src={currentUser.photo} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className={`text-[12px] font-black tracking-wide ${currentUser ? "text-brand-700" : "text-white"}`}>
                                          {getInitials(currentUser?.name || DEFAULT_INITIALS)}
                                        </span>
                                    )}
                                </div>
                                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${currentUser ? 'bg-brand-600' : 'bg-white'}`}>
                                    <Zap size={6} className={currentUser ? 'text-white' : 'text-blue-600'} />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-bold text-[11px] truncate ${currentUser ? 'text-brand-950' : 'text-white'}`}>
                                    {currentUser ? currentUser.name : 'Join Our Community'}
                                </h3>
                                <p className={`text-[7px] font-bold uppercase tracking-widest truncate ${currentUser ? 'text-brand-500' : 'text-blue-100'}`}>
                                    {currentUser ? (currentUser.id || 'Member') : 'Tap to Register Free'}
                                </p>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-[7px] font-bold uppercase tracking-widest border whitespace-nowrap ${currentUser ? 'bg-brand-50 text-brand-700 border-brand-100' : 'bg-white text-blue-600 border-white/50'}`}>
                                {currentUser ? 'Dashboard' : 'Register'}
                            </div>
                        </div>
                    </div>

                </div>

              </div>{/* end header section */}


              <div className="flex-1 overflow-y-auto py-3 px-4 space-y-0.5">
                {navItems.map((item) => {
                  const hasSubmenu = item.submenu && item.submenu.length > 0;
                  const isSubmenuOpen = activeMobileSubmenu === item.label;
                  const isMobileActive = currentView === item.view || item.submenu?.some(s => s.view === currentView);

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
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${isMobileActive
                          ? 'bg-[#EEF0FF] text-[#5D5FEF]'
                          : 'bg-transparent text-[#555] hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={isMobileActive ? 'text-[#5D5FEF]' : 'text-gray-400'}>
                            {getIcon(item.view)}
                          </span>
                          <span className="font-bold tracking-wide uppercase text-[11px]">{item.label}</span>
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
                {currentUser && currentUser.linkedProfiles && currentUser.linkedProfiles.length > 0 ? (
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-2.5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Family Members</p>
                    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-0.5">
                      {currentUser.linkedProfiles.map((pf: any) => (
                        <button
                          key={pf.id}
                          onClick={() => { setView(ViewState.USER_DASHBOARD); setMobileMenuOpen(false); }}
                          className="shrink-0 flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full py-1.5 pr-2 pl-1.5 group"
                          title={pf.name}
                          aria-label={`Switch to ${pf.name}`}
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200 group-hover:border-brand-400 transition-all bg-slate-100">
                            {pf.photo ? (
                              <img
                                src={pf.photo}
                                alt={pf.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="w-full h-full flex items-center justify-center text-[9px] font-black tracking-wide text-white bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700">
                                {getInitials(pf.name)}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-bold text-slate-600 max-w-[68px] truncate">{pf.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
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
