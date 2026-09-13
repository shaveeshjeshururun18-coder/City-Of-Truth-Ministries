import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  BookOpen,
  Globe,
  User as UserIcon,
  ChevronRight,
  ShieldCheck,
  Flame,
  ArrowRight,
  Bell,
  Compass,
  Mountain,
  Award,
  Heart,
  CheckCircle2,
  MapPin,
  Calendar
} from 'lucide-react';
import { ViewState } from '../../types';

interface HeroCinematicIntroProps {
  setCurrentView: (view: ViewState) => void;
  navigate: (path: string) => void;
  countdown: { days: number; hours: number; minutes: number };
  heroVerse: { text: string; ref: string };
  onSendMessage: (message: string) => void;
  currentUser?: any;
  memberNotifications?: any[];
  onOpenNotifications?: () => void;
}

/**
 * 4-Point Diamond Starburst Glint
 */
const DiamondStarGlint: React.FC<{
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  delay?: number;
  duration?: number;
}> = ({ className = '', style = {}, size = 20, delay = 0, duration = 2.4 }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: 0 }}
      animate={{
        scale: [0, 1.25, 0],
        opacity: [0, 1, 0],
        rotate: [0, 90, 180],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
      className={`absolute pointer-events-none z-20 flex items-center justify-center ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      <span
        className="absolute rounded-full bg-[#f0ca68]/80 blur-[2px]"
        style={{ width: size * 0.45, height: size * 0.45 }}
      />
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-full h-full text-white filter drop-shadow-[0_0_6px_#ffffff] drop-shadow-[0_0_12px_#f0ca68] drop-shadow-[0_0_20px_#2f8c4a]"
      >
        <path d="M12 0 L14 9.5 L24 12 L14 14.5 L12 24 L10 14.5 L0 12 L10 9.5 Z" />
      </svg>
    </motion.div>
  );
};

/**
 * Cosmic Heritage Hero & Landing Page Showcase
 */
export const HeroCinematicIntro: React.FC<HeroCinematicIntroProps> = ({
  setCurrentView,
  navigate,
  countdown,
  heroVerse,
  onSendMessage,
  currentUser,
  memberNotifications = [],
  onOpenNotifications
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSend = () => {
    if (!messageInput.trim()) return;
    onSendMessage(messageInput.trim());
    setMessageInput('');
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3500);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const userNotes = currentUser
    ? memberNotifications.filter(note => note.userId === currentUser.id && note.from === 'admin')
    : [];
  const unreadNotesCount = userNotes.filter(n => !n.read).length;

  return (
    <section className="cosmic-heritage-hero relative w-full overflow-hidden bg-[#030807] text-[#f8f5e9]">
      <style>{`
        /* Cosmic Heritage Base Background */
        .cosmic-radial-bg {
          background: radial-gradient(circle at 50% 45%, #17442a 0%, #07150e 38%, #020504 75%);
        }

        /* Fixed 75px Stardust Dot Grid */
        .cosmic-stardust-grid {
          background-image: radial-gradient(#ffffff 1px, transparent 1px);
          background-size: 75px 75px;
          transform: translateZ(0); /* Hardware acceleration */
        }

        /* Concentric Cosmic Triple Halos */
        .cosmic-halo-container {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -48%) translateZ(0);
          border-radius: 50%;
          border: 1px solid rgba(213, 189, 112, 0.28);
          box-shadow: 0 0 140px rgba(47, 140, 74, 0.25);
          pointer-events: none;
          will-change: transform;
        }
        .cosmic-halo-container::before {
          content: "";
          position: absolute;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          inset: clamp(30px, 8vw, 60px);
        }
        .cosmic-halo-container::after {
          content: "";
          position: absolute;
          border: 1px solid rgba(240, 202, 104, 0.16);
          border-radius: 50%;
          inset: clamp(65px, 16vw, 140px);
        }

        /* Diamond Shimmer Sweep */
        @keyframes cosmic-diamond-sweep {
          0% { transform: translateX(-160%) skewX(-25deg) translateZ(0); opacity: 0; }
          15% { opacity: 0.9; }
          50% { opacity: 1; }
          85% { opacity: 0.9; }
          100% { transform: translateX(200%) skewX(-25deg) translateZ(0); opacity: 0; }
        }
        .cosmic-diamond-beam {
          position: absolute;
          inset: -20% -60%;
          background: linear-gradient(
            105deg,
            transparent 15%,
            rgba(255, 255, 255, 0.0) 32%,
            rgba(255, 255, 255, 0.5) 42%,
            rgba(255, 255, 255, 0.95) 48%,
            rgba(186, 230, 253, 1) 50%,
            rgba(255, 255, 255, 0.95) 52%,
            rgba(240, 202, 104, 0.85) 56%,
            rgba(255, 255, 255, 0.3) 62%,
            transparent 85%
          );
          animation: cosmic-diamond-sweep 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          pointer-events: none;
          mix-blend-mode: screen;
          will-change: transform, opacity;
        }

        /* Diamond Text Flow Animation */
        @keyframes cosmic-diamond-text {
          0% { background-position: 220% 50%; }
          100% { background-position: -80% 50%; }
        }
        .cosmic-diamond-text-shine {
          background-image: linear-gradient(
            110deg,
            #dfb76c 0%,
            #fff5db 18%,
            #ffffff 28%,
            #a5f3fc 36%,
            #ffffff 44%,
            #f0ca68 56%,
            #ffffff 72%,
            #c49746 85%,
            #dfb76c 100%
          );
          background-size: 260% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: cosmic-diamond-text 3.2s linear infinite;
          will-change: background-position;
        }

        /* Floating Slow Breath */
        @keyframes cosmic-float {
          0%, 100% { transform: translateY(0) translateZ(0); }
          50% { transform: translateY(-7px) translateZ(0); }
        }
        .cosmic-float-anim {
          animation: cosmic-float 4.8s ease-in-out infinite;
          will-change: transform;
        }
      `}</style>

      {/* ─── 1. Cosmic Heritage Radial Canvas & Stardust Grid ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute inset-0 cosmic-radial-bg" />
        <div className="absolute inset-0 cosmic-stardust-grid opacity-20" />

        {/* Ambient Emerald & Gold Aurora Halo */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(47,140,74,0.3)_0%,rgba(240,202,104,0.18)_35%,transparent_75%)] blur-[95px] transform-gpu" />
        <div className="absolute top-1/3 -left-32 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(23,68,42,0.45)_0%,transparent_70%)] blur-[120px] transform-gpu" />
        <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(240,202,104,0.15)_0%,transparent_70%)] blur-[120px] transform-gpu" />

        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020504] via-transparent to-black/20 transform-gpu" />
      </div>

      {/* ─── 2. Main Cosmic Heritage Hero Stage ─── */}
      <div className="relative z-10 min-h-[92svh] flex flex-col items-center justify-center text-center px-5 sm:px-6 pt-24 sm:pt-28 pb-16">
        <div className="relative max-w-4xl mx-auto flex flex-col items-center w-full">
          
          {/* Concentric Triple Halos from 05_cosmic.html (with slow kinetic rotation) */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="cosmic-halo-container w-[85vw] h-[85vw] max-w-[620px] max-h-[620px] sm:w-[500px] sm:h-[500px] md:w-[620px] md:h-[620px]"
          />

          {/* Registration Live Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#f0ca68]/40 bg-[#0e281c]/70 backdrop-blur-xl mb-5 shadow-[0_0_20px_rgba(240,202,104,0.25)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f0ca68] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f0ca68]" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#f0ca68] flex items-center gap-1.5">
              <Flame size={12} className="text-[#f0ca68] fill-[#f0ca68]" />
              2026 Registration Active
            </span>
            <span className="h-3 w-px bg-white/20" />
            <span className="text-white/80 font-mono text-[9px] tracking-wider uppercase">
              Closes in {countdown.days}d {countdown.hours}h {countdown.minutes}m
            </span>
          </motion.div>

          {/* Center Diamond-Shining Logo Medallion */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-2 flex items-center justify-center"
          >
            <div className="relative rounded-full overflow-hidden p-2 flex items-center justify-center">
              {/* Diamond Light Sweep Beam */}
              <div className="cosmic-diamond-beam" />

              {/* Logo: /footer-logo.webp */}
              <img
                src="/footer-logo.webp"
                alt="City of Truth Ministries Sacred Emblem"
                draggable={false}
                className="cosmic-float-anim w-36 sm:w-44 md:w-52 h-auto object-contain relative z-10 filter drop-shadow-[0_0_28px_rgba(213,189,112,0.65)] drop-shadow-[0_0_60px_rgba(47,140,74,0.4)]"
                onError={(e) => {
                  e.currentTarget.src = '/footer-logo.png';
                }}
              />

              {/* 5 Diamond Star Glints */}
              <DiamondStarGlint size={22} delay={0.2} duration={2.2} style={{ top: '6%', left: '50%', transform: 'translateX(-50%)' }} />
              <DiamondStarGlint size={18} delay={0.7} duration={2.4} style={{ top: '22%', left: '16%' }} />
              <DiamondStarGlint size={18} delay={1.2} duration={2.4} style={{ top: '22%', right: '16%' }} />
              <DiamondStarGlint size={16} delay={1.6} duration={2.2} style={{ top: '48%', left: '52%' }} />
              <DiamondStarGlint size={20} delay={0.9} duration={2.5} style={{ bottom: '8%', left: '50%', transform: 'translateX(-50%)' }} />
            </div>
          </motion.div>

          {/* Kicker from 05_cosmic.html */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mt-4 text-[#f0ca68] font-black uppercase text-[11px] sm:text-xs tracking-[6px] drop-shadow-[0_0_12px_rgba(240,202,104,0.5)]"
          >
            CITY OF TRUTH MINISTRIES
          </motion.div>

          {/* Grand Bilingual Title from 05_cosmic.html */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="font-serif font-black text-white text-[clamp(36px,8vw,94px)] leading-[1.04] my-3 tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
          >
            சத்திய நகரம் ஊழியங்கள்<br />
            <span className="cosmic-diamond-text-shine text-[#f0ca68] drop-shadow-[0_0_25px_rgba(240,202,104,0.6)]">
              City of Truth
            </span>
          </motion.h1>

          {/* Subtitle from 05_cosmic.html */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22 }}
            className="text-xl sm:text-2xl md:text-3xl font-bold text-[#f8f5e9]"
          >
            Ministries <span className="text-[#f0ca68] font-serif font-semibold">· வால்பாறை</span>
          </motion.div>

          {/* Description from 05_cosmic.html */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.28 }}
            className="max-w-[640px] mx-auto text-sm sm:text-base md:text-lg text-[#b1beb5] leading-[1.8] mt-4 mb-7 px-4 sm:px-2 font-normal"
          >
            Discover a place where truth becomes a way of life — a ministry devoted to building disciples and serving people with purpose.
          </motion.p>

          {/* Action Buttons from 05_cosmic.html */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.34 }}
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto px-6 sm:px-0"
          >
            {/* Primary Button: Discover More */}
            <button
              type="button"
              onClick={() => scrollToSection('ministries-portal')}
              className="w-full sm:w-auto inline-block px-7 sm:px-8 py-3.5 rounded-[30px] bg-[#f0ca68] hover:bg-[#ffd97a] text-[#09100b] font-extrabold text-sm sm:text-base tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(240,202,104,0.45)] cursor-pointer"
            >
              Discover More
            </button>

            {/* Secondary Button: Contact Us */}
            <button
              type="button"
              onClick={() => scrollToSection('contact-prayer')}
              className="w-full sm:w-auto inline-block px-7 sm:px-8 py-3.5 rounded-[30px] border border-white/25 hover:border-white/60 bg-white/[0.04] hover:bg-white/[0.1] text-white font-extrabold text-sm sm:text-base tracking-wide backdrop-blur-md transition-all duration-300 active:scale-95 cursor-pointer"
            >
              Contact Us
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto mt-2 sm:mt-0">
              {/* Claim Entrust Pass */}
              <button
                type="button"
                onClick={() => setCurrentView(ViewState.ID_CARD)}
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-3.5 rounded-[30px] border border-[#f0ca68]/40 bg-[#0e281c]/90 hover:bg-[#143a29] text-[#f0ca68] font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 shadow-md cursor-pointer"
              >
                <Sparkles size={15} />
                <span>Claim Entrust Pass</span>
              </button>

              {/* Member Portal */}
              <button
                type="button"
                onClick={() => navigate('/auth?view=login')}
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-5 py-3.5 rounded-[30px] border border-white/15 bg-black/40 hover:bg-white/10 text-white/80 hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer"
              >
                <UserIcon size={14} />
                <span>Member Portal</span>
              </button>
            </div>
          </motion.div>

          {/* Anointed Scripture Carousel Ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-8 max-w-xl w-full p-3.5 rounded-2xl bg-[#07150e]/60 border border-[#f0ca68]/20 backdrop-blur-xl text-center"
          >
            <p className="text-xs sm:text-sm italic text-[#f8f5e9]/90 font-serif">
              "{heroVerse.text}"
            </p>
            <p className="text-[10px] font-mono font-bold text-[#f0ca68] uppercase tracking-widest mt-1">
              ✦ {heroVerse.ref} ✦
            </p>
          </motion.div>
        </div>
      </div>


      {/* ─── 4. ADDED CONTENT: Video Showcase & Ministries Portal (id="ministries-portal") ─── */}
      <div id="ministries-portal" className="relative z-10 py-16 px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Sanctuary Livestream Video Portal */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl p-3 sm:p-4 bg-black/50 border border-[#f0ca68]/35 backdrop-blur-2xl shadow-[0_0_50px_rgba(47,140,74,0.25)]">
              <div className="flex items-center justify-between px-3 pb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/90 font-mono">
                    COT SANCTUARY LIVESTREAM
                  </span>
                </div>
                <span className="text-[10px] text-[#f0ca68] font-black px-2.5 py-0.5 rounded-full bg-[#f0ca68]/15 border border-[#f0ca68]/30">
                  HD · Valparai Heights
                </span>
              </div>

              {/* Video Player */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-inner transform-gpu">
                <video
                  src="/சத்திய_நகரம்_City_of_Truth_Min.mp4"
                  poster="https://images.unsplash.com/photo-1510590337019-5ef2d39aa786?q=80&w=2670&auto=format&fit=crop"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Audio Toggle */}
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-black/70 hover:bg-black/90 border border-white/20 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer z-10"
                  title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-[#f0ca68]" />}
                </button>

                {/* Video Tag */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 pointer-events-none">
                  <span className="text-[10px] font-black uppercase tracking-wider text-white bg-black/60 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                    சத்திய நகரம் ஊழியங்கள்
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Ministry Action Cards */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="mb-2">
              <span className="text-xs font-mono font-bold text-[#f0ca68] uppercase tracking-widest">
                Explore Ministries
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-black text-white mt-1">
                Walk With Us in Truth
              </h3>
            </div>

            {[
              {
                icon: BookOpen,
                title: 'Hebrew Word Hub',
                desc: 'Ancient scripts, pronunciation tools, and Gematria calculation',
                action: () => navigate('/hebrew-alphabet')
              },
              {
                icon: Globe,
                title: 'Baruch Hashem Sacred Bible',
                desc: 'Bilingual Scriptures, Hebrew names of God & verse notes',
                action: () => setCurrentView(ViewState.BARUCH_HASHEM)
              },
              {
                icon: Compass,
                title: 'Pastor Baruch Prophetic Story',
                desc: 'The divine visitation in Valparai and vision for disciples',
                action: () => setCurrentView(ViewState.PASTOR)
              },
              {
                icon: Flame,
                title: 'Golden Menorah Revelation',
                desc: 'Interactive 3D Menorah symbolizing the 7 Spirits of God',
                action: () => setCurrentView(ViewState.GOLDEN_MENORAH)
              },
            ].map(({ icon: Icon, title, desc, action }) => (
              <button
                key={title}
                type="button"
                onClick={action}
                className="flex items-start gap-4 p-4 rounded-2xl bg-[#0e281c]/40 hover:bg-[#0e281c]/80 border border-white/10 hover:border-[#f0ca68]/50 backdrop-blur-xl transition-all duration-200 text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#f0ca68]/15 border border-[#f0ca68]/30 flex items-center justify-center text-[#f0ca68] shrink-0 group-hover:scale-110 transition-transform">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white group-hover:text-[#f0ca68] transition-colors">
                    {title}
                  </h4>
                  <p className="text-xs text-[#b1beb5] leading-relaxed mt-0.5">
                    {desc}
                  </p>
                </div>
                <ChevronRight size={16} className="text-white/40 group-hover:text-[#f0ca68] group-hover:translate-x-1 transition-all mt-1" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 5. ADDED CONTENT: Direct Sanctuary Prayer & Quick Contact (id="contact-prayer") ─── */}
      <div id="contact-prayer" className="relative z-10 py-16 px-5 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/10 text-center">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#f0ca68]/30 bg-[#0e281c] text-[#f0ca68] text-xs font-black uppercase tracking-widest mb-3">
          <Sparkles size={12} /> Direct Line to Valparai Altar
        </span>
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-white">
          Send Your Prayer Request or Question
        </h3>
        <p className="text-sm text-[#b1beb5] mt-2 max-w-xl mx-auto mb-6">
          Pastor Baruch and the intercessory team lift every message before the Lord at the sanctuary altar.
        </p>

        <div className="p-4 sm:p-5 rounded-3xl bg-[#07150e]/80 border border-[#f0ca68]/30 backdrop-blur-2xl shadow-2xl">
          {sentSuccess && (
            <div className="mb-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
              <CheckCircle2 size={16} />
              <span>Your message has been received in the sanctuary. Prayers are ascending!</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="Type your prayer request, praise report, or message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full flex-1 bg-black/60 border border-white/15 focus:border-[#f0ca68] rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-white/40 outline-none transition-all shadow-inner"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!messageInput.trim()}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#f0ca68] hover:bg-[#ffd97a] disabled:opacity-40 text-[#09100b] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0 shadow-lg"
            >
              <Send size={14} />
              <span>Send Prayer</span>
            </button>
          </div>
        </div>

        {/* Admin Notifications Banner (for logged in members) */}
        {currentUser && userNotes.length > 0 && (
          <button
            type="button"
            onClick={onOpenNotifications}
            className="mt-6 w-full p-4 rounded-2xl border border-[#f0ca68]/40 bg-[#0e281c]/70 backdrop-blur-xl text-left hover:bg-[#0e281c] transition-all flex items-center justify-between gap-3 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f0ca68]/20 border border-[#f0ca68]/40 flex items-center justify-center text-[#f0ca68] shrink-0">
                <Bell size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#f0ca68]">
                  Ministry Notifications
                </h4>
                <p className="text-xs text-white/80 truncate max-w-xs sm:max-w-md">
                  {userNotes[0]?.message}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#f0ca68] text-[#09100b] text-[10px] font-black shrink-0">
              {unreadNotesCount > 0 ? `${unreadNotesCount} New` : `${userNotes.length} Total`}
            </span>
          </button>
        )}
      </div>

      {/* ─── 6. Bottom Sacred Metrics Ribbon ─── */}
      <div className="relative z-10 py-8 px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: Mountain,
            value: '2,400m',
            label: 'Valparai Sanctuary',
            sub: 'Mountain Elevation',
            color: 'text-emerald-400',
          },
          {
            icon: ShieldCheck,
            value: '3,500+',
            label: 'Covenant Entrust',
            sub: 'Registered Disciples',
            color: 'text-[#f0ca68]',
          },
          {
            icon: Flame,
            value: '24 / 7',
            label: 'Altar Intercession',
            sub: 'Perpetual Prayer Fire',
            color: 'text-amber-400',
          },
          {
            icon: BookOpen,
            value: 'א - ת',
            label: 'Sacred Hebrew Hub',
            sub: 'Ancient Word Mysteries',
            color: 'text-cyan-300',
          },
        ].map(({ icon: Icon, value, label, sub, color }) => (
          <div
            key={label}
            className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex items-center gap-3.5 hover:border-white/20 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0">
               <p className={`text-lg sm:text-xl font-black font-mono tracking-tight ${color}`}>
                {value}
              </p>
              <p className="text-xs font-bold text-white/90 truncate">
                {label}
              </p>
              <p className="text-[9px] text-white/45 uppercase tracking-wider truncate">
                {sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroCinematicIntro;
