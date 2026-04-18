import React, { useState, useEffect } from 'react';
import { Menu, X, Church, Home, Info, Heart, Flame, Phone, ChevronRight, CreditCard, Facebook, Youtube, Instagram, MapPin, Languages, Zap, Sparkles, Send, Globe, LogIn, CircleUser, LogOut, ChevronDown, Calendar, Hash, Star, BookOpen, ExternalLink, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewState, NavItem } from '../types';
import { Button } from './Button';
import { User as UserType } from '../types';

interface NavbarProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  onLoginClick: () => void;
  onLogoutClick?: () => void;
  currentUser?: UserType | null;
  navItems: NavItem[];
  activeProfileId?: string;
  onProfileSwitch?: (id: string) => void;
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

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onLoginClick,
  onLogoutClick,
  currentUser,
  navItems,
  activeProfileId,
  onProfileSwitch
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState<string | null>(null);
  const [desktopHoverMenu, setDesktopHoverMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Helper to get active profile name/photo
  const getDisplayProfile = () => {
    if (!currentUser) return null;
    if (activeProfileId === currentUser.id || !activeProfileId) {
      return { name: currentUser.name, photo: currentUser.photo, id: currentUser.id };
    }
    const sub = currentUser.linkedProfiles?.find(p => p.id === activeProfileId);
    if (sub) return { name: sub.name, photo: sub.photo, id: sub.id };
    return { name: currentUser.name, photo: currentUser.photo, id: currentUser.id };
  };

  const displayProfile = getDisplayProfile();

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
          onClick={() => setCurrentView(ViewState.HOME)}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <img src="/logo.png" alt="COT Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col justify-center">
            <span className={`font-bold text-[1.1rem] leading-[1.1] tracking-[-0.5px] ${isScrolled || currentView !== ViewState.HOME ? 'text-[#1a1a2e]' : 'text-brand-900'}`}>City of Truth</span>
            <span className={`text-[0.65rem] font-bold tracking-[1px] uppercase ${isScrolled || currentView !== ViewState.HOME ? 'text-brand-600' : 'text-brand-500'}`}>MINISTRIES</span>
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
                    if (item.label === 'HEBREW') setCurrentView(ViewState.ABOUT); // Parent link
                    else if (!hasSubmenu) setCurrentView(item.view);
                  }}
                  className={`text-[0.65rem] font-bold uppercase tracking-[0.5px] px-[12px] py-2 rounded-[20px] transition-all duration-300 no-underline whitespace-nowrap flex items-center gap-1 ${isActive
                    ? 'bg-brand-50 text-brand-600 shadow-sm border border-brand-100'
                    : (isScrolled || (currentView !== ViewState.HOME && currentView !== ViewState.ABOUT) ? 'text-brand-900/70 hover:text-brand-600' : (currentView === ViewState.ABOUT ? 'text-brand-950 hover:text-brand-600' : 'text-brand-950/60 hover:text-brand-700'))
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
                        className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 py-3 z-50 overflow-hidden"
                      >
                        {item.submenu?.map((sub) => (
                          <button
                            key={sub.label}
                            onClick={() => {
                              setCurrentView(sub.view);
                              setDesktopHoverMenu(null);
                            }}
                            className="w-full text-left px-5 py-2.5 text-[9px] font-black text-brand-900/50 hover:bg-brand-50 hover:text-brand-600 transition-all uppercase tracking-widest flex items-center gap-2 group"
                          >
                            <div className="w-1 h-1 rounded-full bg-brand-100 group-hover:bg-brand-400" />
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
              onClick={() => setCurrentView(ViewState.ID_CARD)}
              className="hidden lg:flex items-center relative bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white text-[0.75rem] font-bold px-6 py-3 rounded-[25px] uppercase transition-all duration-300 hover:from-[#22C55E] hover:to-[#16A34A] hover:scale-105 no-underline whitespace-nowrap shadow-lg shadow-green-500/40 overflow-hidden group"
            >
              <span className="absolute inset-0 rounded-[25px] ring-2 ring-green-400/60 animate-ping opacity-30 group-hover:opacity-50" />
              <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
              <span className="relative z-10">REGISTER</span>
            </button>
          )}

          {/* User Profile Pill / Auth Button */}
          <div className="flex items-center gap-3">
            {currentUser && displayProfile ? (
              <div className="relative">
                <div
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="hidden lg:flex items-center gap-3 bg-white border border-slate-200/80 pl-1.5 pr-4 py-1.5 rounded-full shadow-sm hover:shadow-lg hover:border-brand-200 transition-all cursor-pointer group active:scale-95"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-brand-100 overflow-hidden shadow-inner relative">
                    {displayProfile.photo ? (
                      <img src={displayProfile.photo} alt={displayProfile.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-brand-50 flex items-center justify-center text-brand-600">
                        <CircleUser size={20} />
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="flex flex-col text-left max-w-[120px]">
                    <span className="text-[11px] font-black text-brand-950 leading-none mb-1 tracking-tight truncate">{displayProfile.name.split(' ')[0]}</span>
                    <div className="flex items-center gap-1">
                      <Sparkles size={8} className="text-amber-400 fill-amber-400" />
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">Verified</span>
                    </div>
                  </div>
                  <div className={`ml-1 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={14} className="text-slate-400" />
                  </div>
                </div>

                {/* Profile Switcher Dropdown */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 py-3 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-slate-50 mb-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Switch Profile</span>
                      </div>

                      {/* Primary Profile */}
                      <button
                        onClick={() => {
                          onProfileSwitch?.(currentUser.id);
                          setIsProfileDropdownOpen(false);
                          setCurrentView(ViewState.USER_DASHBOARD);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all hover:bg-brand-50 group ${activeProfileId === currentUser.id ? 'bg-brand-50/50' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-full overflow-hidden border-2 ${activeProfileId === currentUser.id ? 'border-brand-500' : 'border-slate-100 group-hover:border-brand-200'}`}>
                          <img src={currentUser.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=5b47d0&color=fff&bold=true`} alt={currentUser.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left flex-1">
                          <p className={`text-[10px] font-bold ${activeProfileId === currentUser.id ? 'text-brand-700' : 'text-slate-700'}`}>{currentUser.name}</p>
                          <p className="text-[7px] text-slate-400 uppercase tracking-wider">Primary Account</p>
                        </div>
                        {activeProfileId === currentUser.id && <Zap size={10} className="text-brand-500 fill-brand-500" />}
                      </button>

                      {/* Linked Profiles */}
                      {currentUser.linkedProfiles?.map((pf) => (
                        <button
                          key={pf.id}
                          onClick={() => {
                            onProfileSwitch?.(pf.id);
                            setIsProfileDropdownOpen(false);
                            setCurrentView(ViewState.USER_DASHBOARD);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all hover:bg-brand-50 group ${activeProfileId === pf.id ? 'bg-brand-50/50' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full overflow-hidden border-2 ${activeProfileId === pf.id ? 'border-brand-500' : 'border-slate-100 group-hover:border-brand-200'}`}>
                            <img src={pf.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(pf.name)}&background=6366f1&color=fff&bold=true`} alt={pf.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="text-left flex-1">
                            <p className={`text-[10px] font-bold ${activeProfileId === pf.id ? 'text-brand-700' : 'text-slate-700'}`}>{pf.name}</p>
                            <p className="text-[7px] text-slate-400 uppercase tracking-wider">{pf.role}</p>
                          </div>
                          {activeProfileId === pf.id && <Zap size={10} className="text-brand-500 fill-brand-500" />}
                        </button>
                      ))}

                      <div className="mt-2 pt-2 border-t border-slate-50">
                        <button
                          onClick={() => {
                            onLogoutClick?.();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-5 py-3 text-red-500 hover:bg-red-50 transition-all"
                        >
                          <LogOut size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="hidden lg:flex items-center gap-2.5 px-6 py-2.5 bg-brand-950 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-black hover:scale-105 transition-all shadow-xl shadow-brand-950/20 active:scale-95"
              >
                <LogIn size={14} className="text-accent-400" /> Member Login
              </button>
            )}

            {/* Always show Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="w-11 h-11 rounded-full border border-slate-200 bg-white/50 backdrop-blur-md flex items-center justify-center text-brand-950 shadow-md hover:scale-110 active:scale-90 transition-all lg:ml-2"
            >
              <Menu size={18} strokeWidth={3} />
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
              className="fixed inset-0 z-[100] bg-brand-950/40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-[110] w-[85%] max-w-sm bg-white shadow-2xl flex flex-col montserrat"
            >



              <div className="p-8 flex flex-col relative z-20">
                <div className="flex justify-between items-center w-full mb-10">
                  <div className="flex items-center gap-4">
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

                {/* Profile + Family Switcher Section in Mobile Menu */}
                <div className="w-full space-y-3">
                  {/* Primary profile card */}
                  <div
                    onClick={() => {
                      if (onProfileSwitch && currentUser) onProfileSwitch(currentUser.id);
                      setCurrentView(ViewState.USER_DASHBOARD);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full p-3 rounded-xl border border-brand-100 shadow-sm cursor-pointer transition-all ${(!activeProfileId || activeProfileId === currentUser?.id) ? 'bg-brand-50/50 ring-1 ring-brand-200' : 'bg-white hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className={`w-11 h-11 rounded-full border-2 shadow-inner flex items-center justify-center bg-slate-50 overflow-hidden ${(!activeProfileId || activeProfileId === currentUser?.id) ? 'border-brand-500' : 'border-brand-100'}`}>
                          {currentUser && currentUser.photo ? (
                            <img src={currentUser.photo} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <CircleUser size={22} className="text-brand-300" />
                          )}
                        </div>
                        {(!activeProfileId || activeProfileId === currentUser?.id) && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-brand-600 rounded-full border-2 border-white flex items-center justify-center text-white">
                            <Zap size={6} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-brand-950 text-[12px] truncate">
                          {currentUser ? currentUser.name : 'Guest Community'}
                        </h3>
                        <p className="text-[8px] font-bold text-brand-500 uppercase tracking-widest truncate">
                          {currentUser ? (currentUser.id || 'Member') : 'Join Our Family'}
                        </p>
                      </div>
                      <div className="px-2 py-1 bg-brand-50 text-brand-700 rounded-full text-[7px] font-bold uppercase tracking-widest border border-brand-100 whitespace-nowrap">
                        {currentUser ? 'Dashboard' : 'Register'}
                      </div>
                    </div>
                  </div>

                  {/* Family Members quick switcher */}
                  {currentUser && currentUser.linkedProfiles && currentUser.linkedProfiles.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Family Members</p>
                      <div className="flex flex-wrap gap-2">
                        {currentUser.linkedProfiles.map((pf: any) => (
                          <button
                            key={pf.id}
                            onClick={() => {
                              onProfileSwitch?.(pf.id);
                              setCurrentView(ViewState.USER_DASHBOARD);
                              setMobileMenuOpen(false);
                            }}
                            className="flex flex-col items-center gap-1 group"
                            title={pf.name}
                          >
                            <div className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all bg-slate-100 ${activeProfileId === pf.id ? 'border-brand-500 scale-105 shadow-sm' : 'border-slate-200 group-hover:border-brand-400'}`}>
                              <img
                                src={pf.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(pf.name)}&background=5b47d0&color=fff&bold=true&size=80`}
                                alt={pf.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className={`text-[8px] font-bold max-w-[40px] truncate ${activeProfileId === pf.id ? 'text-brand-600' : 'text-slate-500'}`}>{pf.name.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>{/* end header section */}


              <div className="flex-1 overflow-y-auto py-4 px-6 space-y-1">
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
                            setCurrentView(item.view);
                            setMobileMenuOpen(false);
                          }
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${isMobileActive
                          ? 'bg-[#EEF0FF] text-[#5D5FEF]'
                          : 'bg-transparent text-[#555] hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={isMobileActive ? 'text-[#5D5FEF]' : 'text-gray-400'}>
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
                                    setCurrentView(sub.view);
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