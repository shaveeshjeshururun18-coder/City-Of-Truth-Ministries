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



        {/* RIGHT SIDE ACTIONS */}
        <div className="flex items-center gap-[15px]">
          {/* Show Register button only if NOT logged in */}
          {!currentUser && (
            <button
              onClick={() => setView(ViewState.ID_CARD)}
              className="hidden lg:flex items-center bg-[#4C51F7] text-white text-[0.75rem] font-bold px-6 py-3 rounded-[25px] uppercase transition-all duration-300 hover:bg-[#3b3ed6] hover:scale-105 no-underline whitespace-nowrap shadow-lg shadow-indigo-500/20"
            >
              REGISTER
            </button>
          )}

          <button
            onClick={() => currentUser ? setView(ViewState.USER_DASHBOARD) : setView(ViewState.ID_CARD)}
            className="bg-white border border-[#ddd] w-12 h-12 rounded-full cursor-pointer text-[#333] text-base flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:border-brand-500 group"
            title={currentUser ? "My Account" : "Register"}
          >
            {currentUser && currentUser.photo ? (
              <img src={currentUser.photo} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              <CircleUser size={22} className="group-hover:text-brand-500" />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`w-12 h-12 rounded-full cursor-pointer flex items-center justify-center transition-all duration-300 shadow-xl border-2 ${isScrolled || (currentView !== ViewState.HOME && currentView !== ViewState.ABOUT) ? 'bg-brand-950 border-brand-900 text-white hover:bg-brand-900' : 'bg-white border-white text-brand-950 hover:scale-110'}`}
          >
            <Menu size={20} strokeWidth={2.5} />
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
              className="fixed inset-0 z-[100] bg-brand-950/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-[110] w-full md:w-[450px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.2)] flex flex-col montserrat overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full -mr-32 -mt-32 opacity-50" />
              
              <div className="p-8 flex flex-col relative z-20">
                <div className="flex justify-between items-center w-full mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-950 shadow-xl flex items-center justify-center border border-brand-900 border-b-4 translate-y-[-2px]">
                      <img src="/logo.png" alt="COT Logo" className="w-8 h-8 object-contain" />
                    </div>
                    <div className="text-left">
                      <h2 className="font-black text-xl text-brand-950 leading-none tracking-tight">City of Truth</h2>
                      <span className="text-[10px] text-brand-600 font-black uppercase tracking-[3px] mt-1.5 block">Ministries Global</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-brand-600 flex items-center justify-center border border-slate-100 shadow-sm"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Profile + Family Switcher Section */}
                <div className="w-full space-y-4">
                    <div
                        onClick={() => { setView(ViewState.USER_DASHBOARD); setMobileMenuOpen(false); }}
                        className="w-full bg-brand-950 p-5 rounded-[2rem] border border-brand-900 shadow-2xl cursor-pointer hover:bg-brand-900 transition-all relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="relative shrink-0">
                                <div className="w-14 h-14 rounded-2xl border-2 border-brand-800 shadow-inner flex items-center justify-center bg-brand-900 overflow-hidden">
                                    {currentUser && currentUser.photo ? (
                                        <img src={currentUser.photo} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <CircleUser size={28} className="text-brand-700" />
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-brand-950 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-black text-white text-base truncate">
                                    {currentUser ? currentUser.name : 'Join Fellowship'}
                                </h3>
                                <p className="text-[9px] font-black text-brand-400 uppercase tracking-widest truncate mt-0.5">
                                    {currentUser ? (currentUser.id || 'Member') : 'Explore Community'}
                                </p>
                            </div>
                            <ChevronRight size={20} className="text-brand-700 group-hover:text-brand-400 transition-colors" />
                        </div>
                    </div>

                    {currentUser && currentUser.linkedProfiles && currentUser.linkedProfiles.length > 0 && (
                        <div className="bg-slate-50 rounded-[2rem] border border-slate-100 p-5">
                            <p className="text-[9px] font-black uppercase tracking-[2px] text-slate-400 mb-4 ml-1">Family Circle</p>
                            <div className="flex flex-wrap gap-3">
                                {currentUser.linkedProfiles.map((pf: any) => (
                                    <button
                                        key={pf.id}
                                        onClick={() => { setView(ViewState.USER_DASHBOARD); setMobileMenuOpen(false); }}
                                        className="flex flex-col items-center gap-2 group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm group-hover:border-brand-500 transition-all bg-white relative">
                                            <img
                                                src={pf.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(pf.name)}&background=5b47d0&color=fff&bold=true&size=80`}
                                                alt={pf.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/10 transition-colors" />
                                        </div>
                                    </button>
                                ))}
                                <button className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-brand-300 hover:text-brand-500 transition-all bg-white">
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-8 space-y-2 relative z-20">
                <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-300 mb-6 ml-2">Navigation Menu</p>
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
                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${isMobileActive
                          ? 'bg-brand-50 text-brand-600 shadow-sm border border-brand-100'
                          : 'bg-transparent text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isMobileActive ? 'bg-brand-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:text-brand-500 group-hover:bg-white'}`}>
                            {getIcon(item.view)}
                          </div>
                          <span className={`font-black tracking-tight uppercase text-xs transition-colors ${isMobileActive ? 'text-brand-950' : 'text-slate-600 group-hover:text-brand-950'}`}>
                            {item.label}
                          </span>
                        </div>
                        {hasSubmenu && (
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-300 ${isSubmenuOpen ? 'rotate-180 text-brand-600' : 'text-slate-300'}`}
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
                              className="overflow-hidden pl-16 space-y-1"
                            >
                              {item.submenu?.map((sub) => (
                                <button
                                  key={sub.label}
                                  onClick={() => {
                                    setView(sub.view);
                                    setMobileMenuOpen(false);
                                  }}
                                  className="w-full text-left p-3 text-[10px] font-black text-slate-500 hover:text-brand-600 transition-colors uppercase tracking-widest flex items-center gap-3 group"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-brand-400" />
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

              <div className="p-8 bg-slate-50 border-t border-slate-100 mt-auto relative z-20">
                <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-2xl border border-slate-200/50 shadow-sm">
                  <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 shrink-0 shadow-inner">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Emergency Prayer Line</p>
                    <p className="text-sm font-black text-brand-950 tracking-tight">+91 80562 5478</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    {[Youtube, Facebook, Instagram].map((Icon, i) => (
                      <button key={i} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-600 hover:border-brand-200 hover:scale-110 transition-all shadow-sm">
                        <Icon size={18} />
                      </button>
                    ))}
                  </div>
                  
                  {currentUser && onLogoutClick && (
                    <button
                        onClick={() => {
                        onLogoutClick();
                        setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:text-rose-600 transition-colors px-4 py-2 hover:bg-rose-50 rounded-xl"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence >

    </>
  );
};