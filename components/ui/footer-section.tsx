'use client';

import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Youtube, 
  Facebook, 
  Instagram, 
  MessageCircle, 
  Github,
  ArrowRight, 
  Flame, 
  MapPin, 
  Sparkles,
  Crown
} from 'lucide-react';
import { ViewState } from '../../types';
import { VisitingCard3D } from '../VisitingCard3D';
import { EditableText } from '../EditableText';

export interface FooterProps {
  currentView?: ViewState;
  setCurrentView?: (view: ViewState) => void;
  navigate?: (path: string) => void;
  currentUser?: any;
  setShowLeaderMessage?: (show: boolean) => void;
  youtubeLink?: string;
}

const REJECTED_ACCESS_MESSAGE = 'Your account status is currently set to Rejected. You cannot access member features until an administrator reviews your account.';

export function Footer({
  currentView,
  setCurrentView,
  navigate,
  currentUser,
  setShowLeaderMessage,
  youtubeLink = "https://youtube.com/@cityoftruthministries"
}: FooterProps) {

  const handleNavigation = (item: { view?: ViewState; href?: string; action?: () => void }) => {
    if (item.action) {
      item.action();
      return;
    }
    if (item.href) {
      if (navigate) {
        navigate(item.href);
      } else {
        window.location.href = item.href;
      }
      return;
    }
    if (item.view && setCurrentView) {
      setCurrentView(item.view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const mainPages: Array<{ label: string; view?: ViewState; href?: string }> = [
    { label: 'Home', view: ViewState.HOME },
    { label: 'Baruch Hashem Praise', view: ViewState.BARUCH_HASHEM },
    { label: 'Hebrew Alphabet', href: '/hebrew-alphabet' },
    { label: 'Valparai Sanctuary', view: ViewState.ABOUT_VALPARAI },
    { label: 'Pastor Baruch', view: ViewState.PASTOR },
    { label: 'Ministries', view: ViewState.MINISTRIES },
    { label: 'Golden Menorah', view: ViewState.GOLDEN_MENORAH },
    { label: 'AI Assistance', view: ViewState.AI },
    { label: 'Entrust Card', view: ViewState.ID_CARD },
    { label: 'Contact', view: ViewState.CONTACT },
  ];

  const subPartPages = [
    { label: 'Login', action: () => handleNavigation({ href: '/auth?view=login' }), dotClass: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' },
    { label: 'Register', action: () => handleNavigation({ href: '/auth?view=register' }), dotClass: 'bg-yellow-300 shadow-[0_0_8px_rgba(253,224,71,0.8)]' },
    { label: 'Forgot Member ID', action: () => handleNavigation({ href: '/auth?view=forgot-id' }), dotClass: 'bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)]' },
    { label: 'Verify ID Route', action: () => handleNavigation({ href: '/verify-id' }), dotClass: 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]' },
  ];

  const hebrewContentPages: Array<{ label: string; view?: ViewState; href?: string }> = [
    { label: 'Hebrew Alphabet', href: '/hebrew-alphabet' },
    { label: 'Hebrew Content Hub', view: ViewState.ABOUT },
    { label: 'Festivals & Holy Days', view: ViewState.HEBREW_FESTIVALS },
    { label: 'Biblical Calendar', view: ViewState.HEBREW_CALENDAR },
    { label: 'Hebrew Clock', view: ViewState.HEBREW_CLOCK },
    { label: 'Month/Year Reference', view: ViewState.HEBREW_REFERENCE },
  ];

  const hebrewGrammarPages: Array<{ label: string; view: ViewState }> = [
    { label: 'Hebrew Grammar 3D', view: ViewState.HEBREW_GRAMMAR },
  ];

  const hebrewToolPages: Array<{ label: string; view: ViewState }> = [
    { label: 'Hebrew Tools Hub', view: ViewState.HEBREW_TOOLS },
    { label: 'Hebrew Words', view: ViewState.HEBREW_WORDS },
    { label: 'Letters Audio Lab', view: ViewState.HEBREW_LETTERS_AUDIO },
    { label: 'Hebrew Numbers', view: ViewState.HEBREW_NUMBERS },
    { label: 'Gematria Value', view: ViewState.HEBREW_GEMATRIA },
  ];

  const socialLinks = [
    { name: 'GitHub', Icon: Github, href: "https://github.com/shaveeshjeshurun18-coder/City-Of-Truth-Ministries" },
    { name: 'YouTube', Icon: Youtube, href: youtubeLink },
    { name: 'Facebook', Icon: Facebook, href: "https://facebook.com/cityoftruthministries" },
    { name: 'Instagram', Icon: Instagram, href: "https://instagram.com/cityoftruthministries" },
    { name: 'WhatsApp', Icon: MessageCircle, href: "https://wa.me/918056152478" }
  ];

  return (
    <div className="w-full bg-[#050403] pt-14 pb-6 px-3 sm:px-6">
      {/* Dark Gold Curved Container Footer */}
      <footer className="relative w-full max-w-7xl mx-auto rounded-t-[3rem] md:rounded-t-[4.5rem] bg-gradient-to-b from-[#0e0c08] via-[#090805] to-[#040302] text-amber-50 overflow-hidden pt-16 pb-14 px-6 lg:px-12 shadow-[0_-25px_60px_-10px_rgba(245,158,11,0.2)]">
        
        {/* Background Star Texture & Rich Radial Dark Gold Ambient Light */}
        <div className="absolute inset-0 bg-[radial-gradient(55%_220px_at_50%_0%,rgba(245,158,11,0.38),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-15 pointer-events-none" />
        
        {/* Luminous Top Gold Beam */}
        <div className="absolute top-0 right-1/2 left-1/2 h-[2px] w-2/5 -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-[1px] shadow-[0_0_20px_rgba(251,191,36,0.9)]" />

        <div className="relative z-10 mx-auto w-full">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-8 mb-14">
            
            {/* Column 1: Dark Gold Brand Identity */}
            <AnimatedContainer delay={0.1} className="space-y-6">
              <div className="flex items-center gap-4">
                <img 
                  src="/footer-logo.png" 
                  alt="City of Truth Ministries Logo" 
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-2xl drop-shadow-[0_0_22px_rgba(245,158,11,0.75)] hover:scale-105 transition-transform duration-300 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 leading-none">
                    <EditableText id="footer-logo" defaultText="City of Truth" />
                  </h3>
                  <p className="text-xs text-amber-400 font-black uppercase tracking-[0.25em] mt-1.5 drop-shadow-xs">
                    Ministries
                  </p>
                </div>
              </div>

              {/* Baruch Hashem Dark Gold Highlight Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3.5 py-1.5 text-xs font-bold text-amber-300 border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <Crown size={14} className="text-amber-400" />
                <span>בָּרוּךְ הַשֵּׁם • Baruch Hashem</span>
              </div>

              <p className="text-xs text-amber-100/75 leading-relaxed">
                Baruch Hashem — Blessed be His Holy Name Forever. Worship, wisdom, and witness for every generation.
              </p>

              <div className="flex items-center gap-2 text-xs text-amber-300/90 font-medium">
                <MapPin size={14} className="shrink-0 text-amber-400 drop-shadow-xs" />
                <span>Valparai Sanctuary, Tamil Nadu, India</span>
              </div>

              {/* Social Links with Metallic Gold Styling */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-400/90 mb-2.5">Connect & Source</p>
                <div className="flex flex-wrap gap-2.5">
                  {socialLinks.map(({ name, Icon, href }) => (
                    <a 
                      key={name}
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label={name}
                      title={name}
                      className="w-9 h-9 rounded-full bg-amber-500/10 hover:bg-gradient-to-r hover:from-amber-400 hover:to-amber-500 hover:text-slate-950 text-amber-300 transition-all duration-300 border border-amber-500/30 hover:border-amber-300 flex items-center justify-center cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.15)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                    >
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              </div>
            </AnimatedContainer>

            {/* Column 2: Site Map — Main & Sub Part Pages */}
            <AnimatedContainer delay={0.2} className="space-y-6">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-1.5 drop-shadow-xs">
                  <Sparkles size={14} className="text-amber-400" />
                  Site Map — Main Pages
                </h4>
                <ul className="space-y-2.5 text-xs text-amber-100/75">
                  {mainPages.map(item => (
                    <li key={item.label}>
                      <button
                        onClick={() => handleNavigation(item)}
                        className="hover:text-amber-300 hover:translate-x-0.5 transition-all flex items-center gap-2 text-left cursor-pointer group"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] group-hover:scale-125 transition-transform" />
                        <EditableText id={'footer-' + item.label} defaultText={item.label} />
                      </button>
                    </li>
                  ))}

                  {currentUser && (
                    <li>
                      <button
                        onClick={() => {
                          if (currentUser.status === 'Rejected') {
                            alert(REJECTED_ACCESS_MESSAGE);
                            return;
                          }
                          handleNavigation({ view: ViewState.USER_DASHBOARD });
                        }}
                        className="hover:text-amber-300 hover:translate-x-0.5 transition-all flex items-center gap-2 text-left cursor-pointer group"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)] group-hover:scale-125 transition-transform" />
                        User Dashboard
                      </button>
                    </li>
                  )}

                  <li>
                    <button
                      onClick={() => handleNavigation({ href: '/admin' })}
                      className="hover:text-amber-300 hover:translate-x-0.5 transition-all flex items-center gap-2 text-xs text-amber-100/75 cursor-pointer group"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] group-hover:scale-125 transition-transform" />
                      Admin Dashboard
                    </button>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-amber-500/20">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-3">Sub Part Pages</p>
                <ul className="space-y-2 text-xs text-amber-100/75">
                  {subPartPages.map((item) => (
                    <li key={item.label}>
                      <button
                        onClick={item.action}
                        className="hover:text-amber-300 hover:translate-x-0.5 transition-all flex items-center gap-2 text-left cursor-pointer group"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${item.dotClass} group-hover:scale-125 transition-transform`} />
                        <EditableText id={'footer-' + item.label} defaultText={item.label} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedContainer>

            {/* Column 3: Hebrew Site Map */}
            <AnimatedContainer delay={0.3} className="space-y-6">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 mb-4 drop-shadow-xs">Hebrew & Praise Site Map</h4>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/90 mb-2">Hebrew Content</p>
                  <ul className="space-y-2 text-xs text-amber-100/75">
                    {hebrewContentPages.map(item => (
                      <li key={item.label}>
                        <button
                          onClick={() => handleNavigation(item)}
                          className="hover:text-amber-300 hover:translate-x-0.5 transition-all flex items-center gap-2 text-left cursor-pointer group"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] group-hover:scale-125 transition-transform" />
                          <EditableText id={'footer-' + item.label} defaultText={item.label} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/90 mb-2">Hebrew Grammar</p>
                  <ul className="space-y-2 text-xs text-amber-100/75">
                    {hebrewGrammarPages.map(item => (
                      <li key={item.label}>
                        <button
                          onClick={() => handleNavigation(item)}
                          className="hover:text-amber-300 hover:translate-x-0.5 transition-all flex items-center gap-2 text-left cursor-pointer group"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)] group-hover:scale-125 transition-transform" />
                          <EditableText id={'footer-' + item.label} defaultText={item.label} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/90 mb-2">Hebrew Tools</p>
                  <ul className="space-y-2 text-xs text-amber-100/75">
                    {hebrewToolPages.map(item => (
                      <li key={item.label}>
                        <button
                          onClick={() => handleNavigation(item)}
                          className="hover:text-amber-300 hover:translate-x-0.5 transition-all flex items-center gap-2 text-left cursor-pointer group"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)] group-hover:scale-125 transition-transform" />
                          <EditableText id={'footer-' + item.label} defaultText={item.label} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedContainer>

            {/* Column 4: Stay Connected & 3D Visiting Card */}
            <AnimatedContainer delay={0.4} className="space-y-6">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 mb-2 drop-shadow-xs">Stay Connected</h4>
              <p className="text-xs text-amber-100/75 leading-relaxed">
                Join our Baruch Hashem mailing list for weekly inspiration, prayer updates & teachings.
              </p>

              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Your Email Address" 
                  className="bg-black/60 border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-amber-400 focus:bg-black/80 transition-colors w-full text-amber-100 placeholder-amber-200/40 focus:ring-1 focus:ring-amber-400/50" 
                  onFocus={() => setShowLeaderMessage?.(true)}
                  onChange={(e) => {
                    if (e.target.value.length > 0 && setShowLeaderMessage) {
                      setShowLeaderMessage(true);
                    }
                  }}
                />
                <button 
                  type="submit"
                  onClick={() => setShowLeaderMessage?.(true)}
                  className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl px-3.5 py-2.5 transition-all duration-300 cursor-pointer shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.7)] flex items-center justify-center"
                  aria-label="Subscribe"
                >
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Embedded 3D Visiting Card */}
              <div className="pt-2">
                <VisitingCard3D compact={true} />
              </div>
            </AnimatedContainer>

          </div>

          {/* Bottom Bar & Interactive Developer Credit Button */}
          <div className="border-t border-amber-500/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/60">
                © {new Date().getFullYear()} City of Truth Ministries • Valparai Sanctuary, Tamil Nadu • Baruch Hashem
              </p>

              {/* Developer Credit Button */}
              <div className="flex justify-center md:justify-start">
                <div className="developer-btn-container">
                  <div className="developer-btn-drawer developer-transition-top">Crafted with...</div>
                  <div className="developer-btn-drawer developer-transition-bottom">...Excellence</div>
                  <button className="developer-btn" type="button">
                    <span className="developer-btn-text">S.Shaveesh Jeshurun</span>
                  </button>
                  <style>{`
                    .developer-btn-container {
                      --timing-function: cubic-bezier(0.16, 1, 0.3, 1);
                      --duration: 250ms;
                      position: relative;
                      display: inline-flex;
                      align-items: center;
                      justify-content: center;
                      margin-top: 14px;
                      margin-bottom: 14px;
                    }
                    .developer-btn {
                      position: relative;
                      min-width: 220px;
                      min-height: 44px;
                      border-radius: 14px;
                      border: 1.5px solid rgba(251, 191, 36, 0.6);
                      padding: 0.6em 1.3em;
                      background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
                      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
                      transition: all var(--duration) var(--timing-function);
                      cursor: pointer;
                      z-index: 2;
                    }
                    .developer-btn-drawer {
                      position: absolute;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      min-height: 28px;
                      border-radius: 12px;
                      border: 1.5px solid rgba(251, 191, 36, 0.7);
                      padding: 0.25em 1em;
                      font-size: 0.78em;
                      font-weight: 800;
                      font-family: "Inter", sans-serif;
                      color: #0c0a06;
                      background: linear-gradient(135deg, #fef08a 0%, #fde047 50%, #eab308 100%);
                      opacity: 0;
                      transition: all var(--duration) var(--timing-function);
                      z-index: 1;
                      box-shadow: 0 6px 16px rgba(234, 179, 8, 0.5);
                      white-space: nowrap;
                    }
                    .developer-transition-top {
                      top: 0;
                      left: 50%;
                      transform: translateX(-50%) translateY(0) scale(0.9);
                    }
                    .developer-transition-bottom {
                      bottom: 0;
                      left: 50%;
                      transform: translateX(-50%) translateY(0) scale(0.9);
                    }
                    .developer-btn-text {
                      display: inline-block;
                      font-size: 0.95em;
                      font-family: "Inter", sans-serif;
                      font-weight: 800;
                      color: #ffffff;
                      letter-spacing: 0.02em;
                      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                      transition: all var(--duration) var(--timing-function);
                    }
                    .developer-btn-container:hover .developer-btn {
                      transform: scale(1.03);
                      box-shadow: 0 10px 28px rgba(245, 158, 11, 0.6);
                    }
                    .developer-btn-container:hover .developer-transition-top {
                      transform: translateX(-50%) translateY(-28px) scale(1);
                      opacity: 1;
                    }
                    .developer-btn-container:hover .developer-transition-bottom {
                      transform: translateX(-50%) translateY(28px) scale(1);
                      opacity: 1;
                    }
                    .developer-btn-container:hover .developer-btn-text {
                      color: #ffffff;
                    }
                  `}</style>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-amber-200/60">
              <button 
                onClick={() => handleNavigation({ view: ViewState.HOME })} 
                className="hover:text-amber-300 transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => handleNavigation({ view: ViewState.HOME })} 
                className="hover:text-amber-300 transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>['className'];
  children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
