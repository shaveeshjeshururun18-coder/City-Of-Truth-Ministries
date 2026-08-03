import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Church, Home, Info, Heart, Flame, Phone, ChevronRight, CreditCard, Facebook, Youtube, Instagram, MapPin, Languages, Zap, Sparkles, Send, Globe, LogIn, CircleUser, LogOut, ChevronDown, Calendar, Clock, Hash, Star, BookOpen, ExternalLink, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewState, NavItem } from '../types';
import { Button } from './Button';
import { User as UserType } from '../types';
import { useLanguage, NAV_LABEL_TO_KEY } from './LanguageContext';
import { EditableText } from './EditableText';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onLoginClick: () => void;
  onLogoutClick?: () => void;
  currentUser?: UserType | null;
  navItems: NavItem[];
  isEditMode?: boolean;
  onUpdateNavItems?: (items: NavItem[]) => void;
}

const getIcon = (view: ViewState) => {
  switch (view) {
    case ViewState.HOME: return <Home size={18} />;
    case ViewState.ABOUT: return <Languages size={18} />;
    case ViewState.HEBREW_TOOLS: return <Zap size={18} />;
    case ViewState.HEBREW_CALENDAR: return <Calendar size={18} />;
    case ViewState.HEBREW_CLOCK: return <Clock size={18} />;
    case ViewState.HEBREW_NUMBERS: return <Hash size={18} />;
    case ViewState.HEBREW_FESTIVALS: return <Star size={18} />;
    case ViewState.HEBREW_REFERENCE: return <BookOpen size={18} />;
    case ViewState.HEBREW_GRAMMAR: return <BookOpen size={18} />;
    case ViewState.MINISTRIES: return <Heart size={18} />;
    case ViewState.HEBREW: return <Languages size={18} />;
    case ViewState.CONTACT: return <Phone size={18} />;
    case ViewState.ID_CARD: return <img src="/logo.png" alt="Card" className="w-[18px] h-[18px] object-contain" />;
    case ViewState.ABOUT_VALPARAI: return <MapPin size={18} />;
    case ViewState.MENORAH: return <Flame size={18} />;
    case ViewState.MENORAH_FLAG: return <Flame size={18} />;
    case ViewState.GOLDEN_MENORAH: return <Flame size={18} />;
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

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, onLoginClick, onLogoutClick, currentUser, navItems, isEditMode, onUpdateNavItems }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, index: number) => {
      if (!isEditMode) return;
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
      if (!isEditMode) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
      if (!isEditMode || draggedIndex === null || draggedIndex === dropIndex) return;
      e.preventDefault();

      const newItems = [...navItems];
      const [draggedItem] = newItems.splice(draggedIndex, 1);
      newItems.splice(dropIndex, 0, draggedItem);

      if (onUpdateNavItems) {
        onUpdateNavItems(newItems);
      }
      setDraggedIndex(null);
    };

    const handleDelete = (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      if (!isEditMode) return;
      const newItems = [...navItems];
      newItems[index] = { ...newItems[index], hidden: true };
      if (onUpdateNavItems) {
        onUpdateNavItems(newItems);
      }
    };

    const openNavItem = (item: NavItem) => {
        if (item.href) {
            navigate(item.href);
            return;
        }
        setView(item.view);
    };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState<string | null>(null);
  const [desktopHoverMenu, setDesktopHoverMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const { language, setLanguage, t } = useLanguage();
  const currentPathMatchedByHref = navItems.some(item =>
    item.href === location.pathname ||
    item.submenu?.filter(s => !s.hidden).some(s => s.href === location.pathname)
  );
  

  const translateLabel = (label: string) => {
    const key = NAV_LABEL_TO_KEY[label];
    if (!key) return label;
    if (language === 'ta') return t(key);
    return label;
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;
      setIsScrolled(currentScrollY > 20);

      if (currentView === ViewState.HOME) {
        setIsNavVisible(true);
      } else if (currentScrollY <= 12) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY + 6 && currentScrollY > 90) {
        setIsNavVisible(false);
        setDesktopHoverMenu(null);
        setMobileMenuOpen(false);
      } else if (currentScrollY < lastScrollY - 6) {
        setIsNavVisible(true);
      } else {
        return;
      }

      lastScrollYRef.current = Math.max(0, currentScrollY);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  const triggerTamilOnlyMode = () => {
    setLanguage('ta');
    const currentUrl = window.location.href;
    if (currentUrl.includes('translate.google.com/translate')) return;
    window.location.href = `https://translate.google.com/translate?sl=auto&tl=ta&u=${encodeURIComponent(currentUrl)}`;
  };

  const isTransparent = false;

  return (
    <>
      {/* Import Montserrat font directly for exactness */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
        .montserrat { font-family: 'Montserrat', sans-serif; }
        @keyframes logo-shine {
          0%, 58% { transform: translateX(0) rotate(12deg); opacity: 0; }
          68% { opacity: 0.85; }
          82%, 100% { transform: translateX(84px) rotate(12deg); opacity: 0; }
        }
      `}} />

      {/* Navigation bar */}
      <nav
        className={`fixed top-3 inset-x-3 md:inset-x-6 z-[60] flex items-center gap-4 transition-all duration-300 montserrat rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.7)] ${isScrolled ? 'px-3 md:px-5 py-1.5' : 'px-4 md:px-6 py-2.5'} ${!isNavVisible ? '-translate-y-[140%]' : 'translate-y-0'}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* LOGO STYLING */}
        <div
          id="nav-logo"
          className="group flex shrink-0 items-center gap-[10px] cursor-pointer"
          onClick={() => setView(ViewState.HOME)}
        >
          <div className={`${isScrolled ? 'w-9 h-9' : 'w-10 h-10'} relative rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300`}>
            <img src="/logo.png" alt="COT Logo" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
            <span className="absolute inset-y-0 -left-8 w-6 rotate-12 bg-white/70 blur-[2px] animate-[logo-shine_3.8s_ease-in-out_infinite]" />
          </div>
          <div className={`flex flex-col justify-center transition-all duration-300 ${isScrolled ? 'hidden sm:flex' : 'flex'}`}>
              <span className={`font-black text-[1.05rem] sm:text-[1.15rem] leading-[1.1] tracking-tight drop-shadow-sm ${isTransparent ? 'text-yellow-50' : 'text-[#1e3a8a]'}`}>City of Truth</span>
              <span className={`text-[0.62rem] sm:text-[0.65rem] font-extrabold tracking-[1px] uppercase ${isTransparent ? 'text-yellow-200/85' : 'text-blue-700'}`}>MINISTRIES</span>
          </div>
        </div>


        {/* MENU LINKS STYLING (Desktop Only) */}
        <div className="hidden xl:flex flex-1 min-w-0 mx-2 overflow-x-auto hide-scrollbar relative" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style dangerouslySetInnerHTML={{ __html: '.hide-scrollbar::-webkit-scrollbar { display: none; }' }} />
            <ul className="flex items-center justify-start 2xl:justify-center gap-1 list-none w-max min-w-full px-2 py-1">
          {navItems.map((item, originalIndex) => {
            if (item.hidden && !isEditMode) return null;
            const isActive = item.href
              ? location.pathname === item.href
              : !currentPathMatchedByHref && (currentView === item.view || item.submenu?.filter(s => !s.hidden).some(s => s.view === currentView));
            const hasSubmenu = item.submenu && item.submenu.filter(s => !s.hidden).length > 0;

            return (
              <li
                key={item.label}
                draggable={isEditMode}
                onDragStart={(e) => handleDragStart(e, originalIndex)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, originalIndex)}
                className={`relative group ${isEditMode ? 'border border-dashed border-transparent hover:border-blue-400' : ''} ${item.hidden ? 'opacity-50 grayscale' : ''}`}
                onMouseEnter={() => hasSubmenu && setDesktopHoverMenu(item.label)}
                onMouseLeave={() => hasSubmenu && setDesktopHoverMenu(null)}
              >
                {isEditMode && (
                  <button
                    onClick={(e) => handleDelete(e, originalIndex)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 hover:scale-110 transition-all z-10"
                  >
                    <X size={10} />
                  </button>
                )}
                <button
                  id={item.view === 'HEBREW' || item.label === 'Hebrew' ? 'nav-hebrew-btn' : undefined}
                  data-nav-view={item.view}
                  onClick={() => openNavItem(item)}
                  className={`text-[0.62rem] 2xl:text-[0.68rem] uppercase tracking-[0.2px] px-2 2xl:px-3 py-1.5 rounded-[20px] transition-all duration-200 no-underline whitespace-nowrap flex items-center gap-0.5 cursor-pointer ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200/80 font-black'
                      : 'text-slate-700 hover:text-brand-600 hover:bg-slate-100/80 font-bold'
                  }`}
                >
                  <EditableText id={'nav-' + item.label} defaultText={translateLabel(item.label)} />
                  {hasSubmenu && <ChevronDown size={10} className={`transition-transform duration-300 ${desktopHoverMenu === item.label ? 'rotate-180' : ''}`} />}
                </button>

                {/* Desktop Submenu */}
                {hasSubmenu && (
                  <AnimatePresence>
                    {desktopHoverMenu === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-2 min-w-[200px] z-[70]"
                      >
                        <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 py-2.5 overflow-hidden">
                          {item.submenu?.filter(s => !s.hidden).map((sub) => (
                            <button
                              key={sub.label}
                              onClick={() => {
                                openNavItem(sub);
                                setDesktopHoverMenu(null);
                              }}
                              className="w-full text-left px-4 py-2 text-[10px] font-bold text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-all uppercase tracking-wider flex items-center gap-2 group cursor-pointer"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-brand-500 transition-colors" />
                              {translateLabel(sub.label)}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </li>
            );
          })}
        </ul>
        </div>

        {/* RIGHT SIDE ACTIONS */}

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 ml-auto relative z-50">


          <div className="flex items-center gap-2 p-1 sm:p-1.5 rounded-2xl border border-brand-100 bg-white transition-all duration-300">
            {/* Profile Avatar / Register Button */}
            <div className="relative group p-[2px] rounded-2xl select-none shrink-0">
              {currentUser && (
                <>
                  {/* Animated Flowing Conic Border Ring ONLY for registered user */}
                  <div className="absolute inset-0 rounded-2xl p-[2px] bg-[conic-gradient(from_0deg,#00F2FE,#38BDF8,#4FACFE,#F0C040,#D4A547,#38BDF8,#00F2FE)] animate-[spin_5s_linear_infinite] shadow-md shadow-cyan-500/30" />

                  {/* Glowing Blur Border Aura */}
                  <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_0deg,#00F2FE,#38BDF8,#4FACFE,#F0C040,#D4A547,#38BDF8,#00F2FE)] blur-[2px] opacity-75 group-hover:opacity-100 animate-[spin_5s_linear_infinite] transition-opacity" />
                </>
              )}

              <button
                id={currentUser ? undefined : 'nav-register-btn'}
                onClick={() => currentUser ? setView(ViewState.USER_DASHBOARD) : setView(ViewState.ID_CARD)}
                className={`relative z-10 ${currentUser ? 'bg-gradient-to-b from-white to-slate-50 border border-brand-100 w-11 h-11 rounded-2xl shadow-[0_10px_18px_-12px_rgba(36,53,108,0.55)] hover:shadow-[0_16px_24px_-12px_rgba(36,53,108,0.65)]' : 'bg-[#1a2133] hover:bg-[#1a2133]/90 border-[1.5px] border-cyan-500/80 px-4 h-[38px] sm:h-10 rounded-full shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]'} cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 group overflow-hidden`}
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
                    <CircleUser size={16} className="text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider">Register</span>
                  </>
                )}
              </button>
            </div>

            <button
              id="nav-hamburger-btn"
              onClick={() => setMobileMenuOpen(true)}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl cursor-pointer flex items-center justify-center transition-all duration-300 border relative z-[70] block ${isTransparent ? 'border-yellow-200/25 bg-black/20 text-yellow-100 hover:bg-yellow-400/10' : 'border-slate-200 bg-white/80 text-slate-700 hover:text-brand-700 hover:border-brand-200 hover:bg-brand-50'} shadow-[0_12px_22px_-16px_rgba(15,23,42,0.75)]`}
              title="Open menu"
              aria-label="Open navigation menu"
            >
              <Menu size={18} strokeWidth={2.5} className="drop-shadow-sm" />
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


              
              <div className="p-5 pt-[max(1.25rem,env(safe-area-inset-top))] flex flex-col relative z-20">
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
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-full transition-all text-white bg-blue-700 hover:bg-blue-800 shadow-lg border-2 border-blue-400/80 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    title="Close menu"
                    aria-label="Close navigation menu"
                  >
                    <X size={20} strokeWidth={2.8} />
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
                        className="w-full p-2.5 rounded-xl border cursor-pointer transition-all bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 border-blue-300/60 shadow-md shadow-blue-600/30 hover:from-blue-700 hover:via-blue-600 hover:to-blue-800"
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full border-2 shadow-inner flex items-center justify-center overflow-hidden border-blue-300 bg-blue-600">
                                    {currentUser && currentUser.photo ? (
                                        <img src={currentUser.photo} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[12px] font-black tracking-wide text-white">
                                          {getInitials(currentUser?.name || DEFAULT_INITIALS)}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center bg-white">
                                    <Zap size={6} className="text-blue-600" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-[11px] truncate text-white">
                                    {currentUser ? currentUser.name : 'Join Our Community'}
                                </h3>
                                <p className="text-[7px] font-bold uppercase tracking-widest truncate text-blue-100">
                                    {currentUser ? (currentUser.id || 'Member') : 'Tap to Register Free'}
                                </p>
                            </div>
                            <div className="px-2 py-1 rounded-full text-[7px] font-bold uppercase tracking-widest border whitespace-nowrap bg-white text-blue-600 border-white/50">
                                {currentUser ? 'Dashboard' : 'Register'}
                            </div>
                        </div>
                    </div>

                </div>

              </div>{/* end header section */}


              <div className="flex-1 overflow-y-auto py-3 px-4 space-y-0.5">
                {currentUser && (
                  <button
                    id="nav-my-dashboard-btn"
                    onClick={() => {
                      setView(ViewState.USER_DASHBOARD);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${currentView === ViewState.USER_DASHBOARD
                      ? 'bg-[#EEF0FF] text-[#5D5FEF]'
                      : 'bg-transparent text-[#555] hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={currentView === ViewState.USER_DASHBOARD ? 'text-[#5D5FEF]' : 'text-gray-400'}>
                        <CircleUser size={18} />
                      </span>
                      <span className="font-bold tracking-wide uppercase text-[11px]">My Dashboard</span>
                    </div>
                    <ChevronRight size={14} />
                  </button>
                )}
                {navItems.filter(item => !item.hidden).map((item) => {
                  const hasSubmenu = item.submenu && item.submenu.filter(s => !s.hidden).length > 0;
                  const isSubmenuOpen = activeMobileSubmenu === item.label;
                  const isMobileActive = item.href
                    ? location.pathname === item.href
                    : !currentPathMatchedByHref && (currentView === item.view || item.submenu?.filter(s => !s.hidden).some(s => s.view === currentView));

                  return (
                    <div key={item.label} className="space-y-1">
                      <button
                        onClick={() => {
                          if (hasSubmenu) {
                            setActiveMobileSubmenu(isSubmenuOpen ? null : item.label);
                          } else {
                            openNavItem(item);
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
                          <span className="font-bold tracking-wide uppercase text-[11px]"><EditableText id={'nav-' + item.label} defaultText={translateLabel(item.label)} /></span>
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
                              {item.submenu?.filter(s => !s.hidden).map((sub) => (
                                <button
                                  key={sub.label}
                                  onClick={() => {
                                    openNavItem(sub);
                                    setMobileMenuOpen(false);
                                  }}
                                  className="w-full text-left p-2 text-[10px] font-bold text-gray-500 hover:text-brand-600 transition-colors uppercase tracking-wider"
                                >
                                  {translateLabel(sub.label)}
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
