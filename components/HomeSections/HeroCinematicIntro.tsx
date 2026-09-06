import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Play,
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
  Clock,
  Compass,
  Mountain,
  Sun,
  Activity,
  Award
} from 'lucide-react';
import { ViewState } from '../../types';

export interface HeroSacredTheme {
  id: string;
  name: string;
  subtitle: string;
  bgGradient: string;
  auroraGradient: string;
  ambientGlow: string;
  accentGlow: string;
  rayGoldPrimary: string;
  rayGoldSecondary: string;
  rayAzureLeft: string;
  raySoftEdge: string;
  accentText: string;
  pillBorder: string;
  pillBg: string;
  buttonGradient: string;
  buttonText: string;
  cardBorder: string;
  cardGlow: string;
  particleColors: string[];
}

// 6 Glorious Sacred Liturgical Themes matching the Entrust Card Preview
const HERO_SACRED_THEMES: HeroSacredTheme[] = [
  {
    id: 'living-sapphire',
    name: 'Midnight Sapphire',
    subtitle: 'Heavenly Throne Revelation',
    bgGradient: 'from-[#01030a] via-[#06172f] to-[#02040b]',
    auroraGradient: 'radial-gradient(ellipse at top, rgba(14,165,233,0.38) 0%, rgba(3,105,161,0.22) 30%, rgba(2,132,199,0.10) 55%, transparent 80%)',
    ambientGlow: 'rgba(56, 189, 248, 0.30)',
    accentGlow: 'rgba(14, 165, 233, 0.22)',
    rayGoldPrimary: '#22d3ee',
    rayGoldSecondary: '#d9f8ff',
    rayAzureLeft: '#0369a1',
    raySoftEdge: '#082f49',
    accentText: 'text-sky-300',
    pillBorder: 'border-sky-400/50',
    pillBg: 'bg-sky-500/15',
    buttonGradient: 'from-cyan-400 via-sky-500 to-blue-600',
    buttonText: 'text-slate-950',
    cardBorder: 'border-sky-500/30 hover:border-sky-400/60',
    cardGlow: 'rgba(56, 189, 248, 0.25)',
    particleColors: ['#e0f2fe', '#bae6fd', '#38bdf8', '#7dd3fc', '#0ea5e9']
  },
  {
    id: 'sacred-amber',
    name: 'Sacred Amber',
    subtitle: 'Solar Altar Flame',
    bgGradient: 'from-[#231003] via-[#3a1d06] to-[#0f0501]',
    auroraGradient: 'radial-gradient(ellipse at top, rgba(245,158,11,0.55) 0%, rgba(217,119,6,0.38) 30%, rgba(180,83,9,0.2) 55%, transparent 80%)',
    ambientGlow: 'rgba(245, 158, 11, 0.45)',
    accentGlow: 'rgba(239, 68, 68, 0.32)',
    rayGoldPrimary: '#fbbf24',
    rayGoldSecondary: '#fef08a',
    rayAzureLeft: '#d97706',
    raySoftEdge: '#b45309',
    accentText: 'text-amber-300',
    pillBorder: 'border-amber-400/50',
    pillBg: 'bg-amber-500/15',
    buttonGradient: 'from-amber-400 via-yellow-400 to-amber-600',
    buttonText: 'text-brand-950',
    cardBorder: 'border-amber-500/30 hover:border-amber-400/60',
    cardGlow: 'rgba(245, 158, 11, 0.25)',
    particleColors: ['#fef08a', '#fde047', '#fbbf24', '#f59e0b', '#d97706']
  },
  {
    id: 'royal-amethyst',
    name: 'Royal Amethyst',
    subtitle: 'Priesthood & Glory',
    bgGradient: 'from-[#1c0533] via-[#2f0c54] to-[#0e021a]',
    auroraGradient: 'radial-gradient(ellipse at top, rgba(168,85,247,0.55) 0%, rgba(147,51,234,0.38) 30%, rgba(126,34,206,0.2) 55%, transparent 80%)',
    ambientGlow: 'rgba(192, 132, 252, 0.45)',
    accentGlow: 'rgba(168, 85, 247, 0.35)',
    rayGoldPrimary: '#c084fc',
    rayGoldSecondary: '#f5d0fe',
    rayAzureLeft: '#9333ea',
    raySoftEdge: '#6b21a8',
    accentText: 'text-fuchsia-300',
    pillBorder: 'border-fuchsia-400/50',
    pillBg: 'bg-fuchsia-500/15',
    buttonGradient: 'from-fuchsia-400 via-purple-500 to-indigo-600',
    buttonText: 'text-slate-950',
    cardBorder: 'border-purple-500/30 hover:border-purple-400/60',
    cardGlow: 'rgba(192, 132, 252, 0.25)',
    particleColors: ['#fae8ff', '#f5d0fe', '#e879f9', '#c084fc', '#a855f7']
  },
  {
    id: 'eden-emerald',
    name: 'Eden Emerald',
    subtitle: 'Tree of Eternal Life',
    bgGradient: 'from-[#022419] via-[#053d2b] to-[#01120c]',
    auroraGradient: 'radial-gradient(ellipse at top, rgba(16,185,129,0.55) 0%, rgba(5,150,105,0.38) 30%, rgba(4,120,87,0.2) 55%, transparent 80%)',
    ambientGlow: 'rgba(52, 211, 153, 0.45)',
    accentGlow: 'rgba(16, 185, 129, 0.35)',
    rayGoldPrimary: '#34d399',
    rayGoldSecondary: '#d1fae5',
    rayAzureLeft: '#059669',
    raySoftEdge: '#047857',
    accentText: 'text-emerald-300',
    pillBorder: 'border-emerald-400/50',
    pillBg: 'bg-emerald-500/15',
    buttonGradient: 'from-emerald-400 via-teal-400 to-emerald-600',
    buttonText: 'text-emerald-950',
    cardBorder: 'border-emerald-500/30 hover:border-emerald-400/60',
    cardGlow: 'rgba(52, 211, 153, 0.25)',
    particleColors: ['#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399']
  },
  {
    id: 'covenant-crimson',
    name: 'Covenant Crimson',
    subtitle: 'Precious Covenant Atonement',
    bgGradient: 'from-[#280517] via-[#430925] to-[#14020b]',
    auroraGradient: 'radial-gradient(ellipse at top, rgba(244,63,94,0.55) 0%, rgba(225,29,72,0.38) 30%, rgba(190,18,60,0.2) 55%, transparent 80%)',
    ambientGlow: 'rgba(251, 113, 133, 0.45)',
    accentGlow: 'rgba(244, 63, 94, 0.35)',
    rayGoldPrimary: '#fb7185',
    rayGoldSecondary: '#ffe4e6',
    rayAzureLeft: '#e11d48',
    raySoftEdge: '#9f1239',
    accentText: 'text-rose-300',
    pillBorder: 'border-rose-400/50',
    pillBg: 'bg-rose-500/15',
    buttonGradient: 'from-rose-400 via-pink-500 to-red-600',
    buttonText: 'text-rose-950',
    cardBorder: 'border-rose-500/30 hover:border-rose-400/60',
    cardGlow: 'rgba(251, 113, 133, 0.25)',
    particleColors: ['#fff1f2', '#ffe4e6', '#fecdd3', '#fda4af', '#fb7185']
  },
  {
    id: 'shekinah-gold',
    name: 'Shekinah Gold',
    subtitle: 'Radiant Holy of Holies',
    bgGradient: 'from-[#271b03] via-[#433006] to-[#130d01]',
    auroraGradient: 'radial-gradient(ellipse at top, rgba(234,179,8,0.6) 0%, rgba(202,138,4,0.42) 30%, rgba(161,98,7,0.22) 55%, transparent 80%)',
    ambientGlow: 'rgba(253, 224, 71, 0.55)',
    accentGlow: 'rgba(245, 158, 11, 0.42)',
    rayGoldPrimary: '#fde047',
    rayGoldSecondary: '#fef9c3',
    rayAzureLeft: '#eab308',
    raySoftEdge: '#ca8a04',
    accentText: 'text-yellow-200',
    pillBorder: 'border-yellow-400/50',
    pillBg: 'bg-yellow-500/15',
    buttonGradient: 'from-amber-300 via-yellow-400 to-amber-500',
    buttonText: 'text-brand-950',
    cardBorder: 'border-yellow-500/30 hover:border-yellow-400/60',
    cardGlow: 'rgba(253, 224, 71, 0.3)',
    particleColors: ['#fefce8', '#fef9c3', '#fef08a', '#fde047', '#eab308']
  }
];

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
  const [themeIndex, setThemeIndex] = useState(0);
  const [isMobileViewport, setIsMobileViewport] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  ));
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ));
  const reduceHeroMotion = isMobileViewport || prefersReducedMotion;

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMediaPreferences = () => {
      setIsMobileViewport(mobileQuery.matches);
      setPrefersReducedMotion(reducedMotionQuery.matches);
    };

    syncMediaPreferences();
    mobileQuery.addEventListener('change', syncMediaPreferences);
    reducedMotionQuery.addEventListener('change', syncMediaPreferences);

    return () => {
      mobileQuery.removeEventListener('change', syncMediaPreferences);
      reducedMotionQuery.removeEventListener('change', syncMediaPreferences);
    };
  }, []);

  // Keep the palette stable on touch devices so the first viewport remains calm.
  useEffect(() => {
    if (reduceHeroMotion) return;
    const timer = setInterval(() => {
      setThemeIndex((prev) => (prev + 1) % HERO_SACRED_THEMES.length);
    }, 120000);
    return () => clearInterval(timer);
  }, [reduceHeroMotion]);

  const activeTheme = HERO_SACRED_THEMES[themeIndex];

  const handleSend = () => {
    if (!messageInput.trim()) return;
    onSendMessage(messageInput.trim());
    setMessageInput('');
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3500);
  };

  const userNotes = currentUser
    ? memberNotifications.filter(note => note.userId === currentUser.id && note.from === 'admin')
    : [];
  const unreadNotesCount = userNotes.filter(n => !n.read).length;

  return (
    <section className="hero-cinematic-intro relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-28 sm:pt-20 pb-20 md:py-24 bg-[#02040b]">
      {/* ─── Dynamic Multi-Themed Sacred Backdrop ─── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {reduceHeroMotion ? (
          <div className="absolute inset-0">
            <div className={`absolute inset-0 bg-gradient-to-b ${activeTheme.bgGradient}`} />
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 8%, ${activeTheme.ambientGlow} 0%, transparent 48%)`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#02040b] via-transparent to-black/10" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTheme.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
            {/* Dynamic Sacred Gradient Canvas */}
            <div className={`absolute inset-0 bg-gradient-to-b ${activeTheme.bgGradient}`} />

            {/* Radiant Celestial Aurora Shimmer Wave at top */}
            <motion.div
              animate={{ opacity: [0.65, 0.95, 0.65], scaleY: [1, 1.15, 1], scaleX: [1, 1.05, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-44 left-1/2 -translate-x-1/2 w-[1400px] h-[650px] pointer-events-none blur-[90px] mix-blend-screen"
              style={{ background: activeTheme.auroraGradient }}
            />

            {/* Central Divine Sunburst Apex at top center */}
            <div
              className="absolute -top-28 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] blur-[70px]"
              style={{
                background: `radial-gradient(ellipse at center, ${activeTheme.ambientGlow} 0%, ${activeTheme.accentGlow} 40%, transparent 80%)`
              }}
            />

            {/* High-Luminance Volumetric SVG God Rays Dynamic Lighting */}
            <motion.div
              animate={{ opacity: [0.75, 1, 0.75], scale: [1, 1.025, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[1440px] h-[900px] pointer-events-none mix-blend-screen overflow-hidden"
            >
              <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g opacity="0.95">
                  {/* Center Divine Pillar of Light */}
                  <polygon points="720,0 520,900 920,900" fill="url(#hero-ray-primary)" />
                  {/* Inner Divine Rays */}
                  <polygon points="720,0 320,900 480,900" fill="url(#hero-ray-secondary)" />
                  <polygon points="720,0 960,900 1120,900" fill="url(#hero-ray-secondary)" />
                  {/* Outer Sacred Rays */}
                  <polygon points="720,0 140,900 290,900" fill="url(#hero-ray-left)" />
                  <polygon points="720,0 1150,900 1300,900" fill="url(#hero-ray-left)" />
                  <polygon points="720,0 -60,900 90,900" fill="url(#hero-ray-edge)" />
                  <polygon points="720,0 1350,900 1500,900" fill="url(#hero-ray-edge)" />
                </g>
                <defs>
                  <linearGradient id="hero-ray-primary" x1="720" y1="0" x2="720" y2="900" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={activeTheme.rayGoldSecondary} stopOpacity="0.95" />
                    <stop offset="25%" stopColor={activeTheme.rayGoldPrimary} stopOpacity="0.70" />
                    <stop offset="65%" stopColor={activeTheme.rayAzureLeft} stopOpacity="0.30" />
                    <stop offset="100%" stopColor={activeTheme.raySoftEdge} stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="hero-ray-secondary" x1="720" y1="0" x2="500" y2="900" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={activeTheme.rayGoldSecondary} stopOpacity="0.85" />
                    <stop offset="35%" stopColor={activeTheme.rayGoldPrimary} stopOpacity="0.50" />
                    <stop offset="100%" stopColor={activeTheme.raySoftEdge} stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="hero-ray-left" x1="720" y1="0" x2="200" y2="900" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={activeTheme.rayGoldSecondary} stopOpacity="0.75" />
                    <stop offset="45%" stopColor={activeTheme.rayAzureLeft} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={activeTheme.raySoftEdge} stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="hero-ray-edge" x1="720" y1="0" x2="0" y2="900" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={activeTheme.rayGoldSecondary} stopOpacity="0.60" />
                    <stop offset="55%" stopColor={activeTheme.rayAzureLeft} stopOpacity="0.20" />
                    <stop offset="100%" stopColor={activeTheme.raySoftEdge} stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>

            {/* Luminous Ambient Glow Orbs in Theme Tone */}
            <div
              className="absolute top-1/4 -left-20 w-[550px] h-[550px] rounded-full blur-[140px] mix-blend-screen opacity-70"
              style={{ backgroundColor: activeTheme.ambientGlow }}
            />
            <div
              className="absolute top-1/3 -right-20 w-[550px] h-[550px] rounded-full blur-[140px] mix-blend-screen opacity-65"
              style={{ backgroundColor: activeTheme.accentGlow }}
            />
            <div
              className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-[160px] mix-blend-screen opacity-55"
              style={{ backgroundColor: activeTheme.ambientGlow }}
            />

            {/* High-Tech Perspective Matrix Grid */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)`,
                backgroundSize: '54px 54px',
                maskImage: 'radial-gradient(ellipse 70% 55% at 50% 65%, black 15%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(ellipse 70% 55% at 50% 65%, black 15%, transparent 80%)'
              }}
            />
            </motion.div>
          </AnimatePresence>
        )}

        {/* ─── Award-Winning Floating Kinetic Atmosphere (Celestial Orbit Rings & Seals in Empty Space) ─── */}
        <motion.div
          className="absolute right-[-80px] top-[20%] w-[520px] h-[520px] rounded-full border border-amber-400/[0.12] pointer-events-none hidden lg:block"
          animate={{ rotate: 360, scale: [1, 1.03, 1] }}
          transition={{ rotate: { duration: 65, repeat: Infinity, ease: 'linear' }, scale: { duration: 11, repeat: Infinity, ease: 'easeInOut' } }}
        />
        <motion.div
          className="absolute right-[-40px] top-[24%] w-[440px] h-[440px] rounded-full border border-dashed border-sky-400/[0.12] pointer-events-none hidden lg:block"
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute left-[-100px] top-[40%] w-[480px] h-[480px] rounded-full border border-amber-400/[0.08] pointer-events-none hidden xl:block"
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        />

        {/* Floating Hebrew Aleph Seal in Far-Left Empty Space with Theme Glow */}
        <motion.div
          animate={{ y: [0, -16, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-4 lg:left-8 top-[32%] z-10 hidden 2xl:flex flex-col items-center gap-2 p-3.5 rounded-3xl bg-black/55 border border-white/10 backdrop-blur-2xl shadow-2xl pointer-events-none transition-all duration-700"
          style={{ borderColor: `${activeTheme.rayGoldPrimary}30` }}
        >
          <div
            className="w-11 h-11 rounded-2xl border flex items-center justify-center font-serif font-black text-2xl transition-all duration-700"
            style={{
              backgroundColor: `${activeTheme.rayGoldPrimary}15`,
              borderColor: `${activeTheme.rayGoldPrimary}50`,
              color: activeTheme.rayGoldPrimary,
              boxShadow: `0 0 24px ${activeTheme.ambientGlow}`
            }}
          >
            א
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-[0.2em] [writing-mode:vertical-lr] text-center transition-colors duration-700 ${activeTheme.accentText}`}>
            Aleph · Truth
          </span>
        </motion.div>

        {/* Floating Hebrew Tav Seal in Far-Right Empty Space with Theme Glow */}
        <motion.div
          animate={{ y: [0, 16, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute right-4 lg:right-8 top-[38%] z-10 hidden 2xl:flex flex-col items-center gap-2 p-3.5 rounded-3xl bg-black/55 border border-white/10 backdrop-blur-2xl shadow-2xl pointer-events-none transition-all duration-700"
          style={{ borderColor: `${activeTheme.rayAzureLeft}30` }}
        >
          <div
            className="w-11 h-11 rounded-2xl border flex items-center justify-center font-serif font-black text-2xl transition-all duration-700"
            style={{
              backgroundColor: `${activeTheme.rayAzureLeft}15`,
              borderColor: `${activeTheme.rayAzureLeft}50`,
              color: activeTheme.rayGoldSecondary,
              boxShadow: `0 0 24px ${activeTheme.accentGlow}`
            }}
          >
            ת
          </div>
          <span className="text-[9px] font-bold text-slate-200 uppercase tracking-[0.2em] [writing-mode:vertical-lr] text-center">
            Tav · Covenant
          </span>
        </motion.div>

        {/* Floating Divine Shekinah Embers & Twinkling Stardust (24 Varied Embers) */}
        {!reduceHeroMotion && [...Array(24)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: `${(i % 4) * 2 + 2}px`,
              height: `${(i % 4) * 2 + 2}px`,
              left: `${3 + (i * 4.0)}%`,
              bottom: `${5 + ((i * 19) % 80)}%`,
              backgroundColor: activeTheme.particleColors[i % activeTheme.particleColors.length],
              boxShadow: `0 0 12px ${activeTheme.ambientGlow}`,
            }}
            animate={{
              y: [-15, -85 - (i * 3.5), -15],
              opacity: [0.2, 0.95, 0.2],
              scale: [0.7, 1.4, 0.7],
            }}
            transition={{
              duration: 3.8 + (i * 0.28),
              repeat: Infinity,
              delay: i * 0.18,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Smooth Vignette Frame */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#02040b] via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center pt-4 sm:pt-6">
          {/* ─── Left Column: Kinetic Typography, Badge, Verse, CTAs ─── */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            {/* Header Status Row with Safe Spacing (fills empty top area without touching navbar) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 w-full">
              {/* Live Registration & Covenant Status Pill */}
              <motion.div
                initial={{ opacity: 0, y: -15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6 }}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border ${activeTheme.pillBorder} ${activeTheme.pillBg} backdrop-blur-xl shadow-lg transition-colors duration-500`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)]" />
                </span>
                <span className={`font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5 ${activeTheme.accentText}`}>
                  <Flame size={12} className="text-amber-400 fill-amber-400" />
                  2026 REGISTRATION ACTIVE
                </span>
                <span className="hidden sm:inline-block h-3 w-px bg-white/20" />
                <span className="text-white/80 font-mono text-[9px] tracking-wider uppercase">
                  Closes in {countdown.days}d {countdown.hours}h
                </span>
              </motion.div>

              {/* Floating Element 1: Valparai Mountain Sanctuary Badge in Empty Top Area */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-md"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="text-[10px] font-bold text-slate-200">Valparai 2,400m</span>
                <div className="flex items-center gap-0.5 ml-1">
                  {[30, 60, 45, 75, 40].map((h, idx) => (
                    <motion.span
                      key={idx}
                      className="w-0.5 bg-emerald-400/80 rounded-full"
                      animate={{ height: [`${h * 0.2}px`, `${h * 0.1}px`, `${h * 0.2}px`] }}
                      transition={{ duration: 1.1 + idx * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ height: `${h * 0.16}px` }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Floating Element 2: Automatic 2-Min Sacred Theme Atmosphere Indicator (Clean, non-clickable) */}
              <motion.div
                key={activeTheme.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/15 backdrop-blur-xl shadow-md relative overflow-hidden"
              >
                {/* 2-Minute Subtle Atmosphere Progress Line */}
                <motion.div
                  key={themeIndex}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 120, ease: 'linear' }}
                  className="absolute bottom-0 left-0 right-0 h-[2px] origin-left opacity-70"
                  style={{ backgroundColor: activeTheme.rayGoldPrimary, boxShadow: `0 0 8px ${activeTheme.rayGoldPrimary}` }}
                />

                <span
                  className="w-2 h-2 rounded-full shrink-0 transition-colors duration-500"
                  style={{
                    backgroundColor: activeTheme.rayGoldPrimary,
                    boxShadow: `0 0 8px ${activeTheme.rayGoldPrimary}`
                  }}
                />
                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${activeTheme.accentText}`}>
                  {activeTheme.name}
                </span>
              </motion.div>

              {/* Floating Hebrew Sacred Glyph Micro-Badge */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl"
              >
                <span className="text-amber-400 text-xs font-serif font-bold">א-ת</span>
                <span className="text-[10px] font-bold text-amber-100/80 uppercase tracking-wider">Sacred Codex</span>
              </motion.div>
            </div>

            {/* Kinetic Grand Title */}
            <div className="space-y-1">
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.15 }}
              >
                <h1 className="pure-gold-text text-5xl sm:text-7xl lg:text-[5.4rem] font-serif font-black tracking-tight leading-[1.02] drop-shadow-[0_4px_30px_rgba(245,158,11,0.35)]">
                  சத்திய நகரம்
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 justify-center lg:justify-start"
              >
                <span className="text-2xl sm:text-3xl font-extrabold uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300">
                  City of Truth
                </span>
                <span className="hidden sm:inline text-amber-500/60 font-black">•</span>
                <span className="text-xl sm:text-2xl font-serif italic text-amber-300/90 tracking-widest">
                  Ministries · வால்பாறை
                </span>
              </motion.div>
            </div>

            {/* Anointed Scripture Ticker Carousel */}
            <div className="w-full max-w-xl min-h-[4rem] flex items-center justify-center lg:justify-start py-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={heroVerse.ref}
                  initial={reduceHeroMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceHeroMotion ? undefined : { opacity: 0, y: -12 }}
                  transition={{ duration: reduceHeroMotion ? 0 : 0.55 }}
                  className="rounded-2xl p-3.5 bg-white/[0.03] border border-white/10 backdrop-blur-md w-full text-left"
                >
                  <p className="text-sm sm:text-base font-light italic leading-relaxed text-amber-100/80">
                    "{heroVerse.text}"
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400/90 font-mono">
                      {heroVerse.ref}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Primary Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 w-full"
            >
              <button
                type="button"
                onClick={() => setCurrentView(ViewState.ID_CARD)}
                style={{ boxShadow: `0 0 38px ${activeTheme.ambientGlow}` }}
                className={`group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r ${activeTheme.buttonGradient} ${activeTheme.buttonText} font-black text-sm uppercase tracking-wider transition-all duration-500 hover:scale-105 active:scale-95 cursor-pointer overflow-hidden shadow-2xl`}
              >
                <Sparkles size={18} className="shrink-0 animate-spin-slow" />
                <span className="relative z-10 font-bold">Claim Entrust Pass</span>
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-white/30 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700 ease-out rotate-12" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/auth?view=login')}
                className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl border border-amber-400/40 bg-black/40 hover:bg-amber-500/10 text-amber-200 font-bold text-sm uppercase tracking-wider backdrop-blur-md transition-all duration-200 hover:border-amber-300 active:scale-95 cursor-pointer shadow-inner"
              >
                <UserIcon size={16} />
                <span>Member Portal</span>
              </button>
            </motion.div>

            {/* Quick-Access Floating Sanctuary Nav Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl pt-2"
            >
              {[
                { icon: BookOpen, label: 'Hebrew Hub', desc: 'Alphabet & Root', action: () => navigate('/hebrew-alphabet') },
                { icon: Globe, label: 'Baruch Hashem', desc: 'Sacred Bible', action: () => setCurrentView(ViewState.BARUCH_HASHEM) },
                { icon: Compass, label: 'Pastor Baruch', desc: 'Message & Story', action: () => setCurrentView(ViewState.PASTOR) },
              ].map(({ icon: Icon, label, desc, action }) => (
                <button
                  key={label}
                  type="button"
                  onClick={action}
                  className="group flex flex-col items-center lg:items-start p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-amber-500/10 hover:border-amber-400/40 backdrop-blur-md transition-all duration-200 active:scale-95 text-left cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300 mb-1.5 group-hover:scale-110 transition-transform">
                    <Icon size={16} />
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors">
                    {label}
                  </span>
                  <span className="text-[10px] text-white/50 hidden sm:block">{desc}</span>
                </button>
              ))}
            </motion.div>

            {/* Quick Direct Prayer / Message Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="w-full max-w-xl pt-1"
            >
              <div
                className="p-3.5 rounded-2xl bg-white/[0.03] border backdrop-blur-xl shadow-lg flex flex-col gap-2 transition-colors duration-500"
                style={{ borderColor: `${activeTheme.rayGoldPrimary}45` }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300/80 flex items-center gap-1.5">
                    <Sparkles size={11} className="text-amber-400" /> Direct Admin Line
                  </span>
                  {sentSuccess && (
                    <span className="text-xs font-bold text-emerald-400 animate-pulse">
                      ✓ Prayer received in sanctuary
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type your prayer request or message to Pastor..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 bg-black/40 border border-white/10 focus:border-amber-400/60 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/35 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!messageInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-brand-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    <Send size={13} />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Admin Notifications Banner (for logged in members) */}
            {currentUser && userNotes.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={onOpenNotifications}
                className="w-full max-w-xl p-3.5 rounded-2xl border border-amber-400/40 bg-amber-500/10 backdrop-blur-xl text-left hover:bg-amber-500/20 transition-all flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                    <Bell size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-200">
                      Ministry Notifications
                    </h4>
                    <p className="text-[11px] text-amber-100/80 truncate max-w-xs sm:max-w-md">
                      {userNotes[0]?.message}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-400 text-brand-950 text-[10px] font-black shrink-0">
                  {unreadNotesCount > 0 ? `${unreadNotesCount} New` : `${userNotes.length} Total`}
                </span>
              </motion.button>
            )}
          </div>

          {/* ─── Right Column: Interactive Video & Media Showcase Portal ─── */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Ambient Radial Halo behind the Video Portal */}
            <div
              className="absolute inset-0 blur-[110px] rounded-full pointer-events-none transition-all duration-1000"
              style={{
                background: `radial-gradient(circle, ${activeTheme.ambientGlow} 0%, ${activeTheme.accentGlow} 50%, transparent 80%)`
              }}
            />

            {/* Floating Element 2 (Top Right): Live Sabbath Broadcast Badge */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0.8, -0.8, 0.8] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              className="hidden sm:inline-flex absolute -top-5 -right-3 z-20 items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/60 border border-amber-400/35 backdrop-blur-2xl shadow-[0_10px_30px_rgba(245,158,11,0.25)]"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
                <Flame size={15} className="animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black uppercase tracking-wider text-amber-300">Live Sanctuary</p>
                <p className="text-[11px] font-bold text-white">Friday & Sabbath Broadcast</p>
              </div>
            </motion.div>

            {/* Floating Element 3 (Bottom Left): Covenant Word Seal Badge */}
            <motion.div
              animate={{ y: [0, 8, 0], x: [0, -4, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              className="hidden sm:inline-flex absolute -bottom-5 -left-4 z-20 items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-950/80 via-black/80 to-indigo-950/80 border border-amber-400/30 backdrop-blur-2xl shadow-xl"
            >
              <Award size={13} className="text-amber-400" />
              <span className="text-[10px] font-black tracking-wider text-amber-200">
                100% Anointed Word • Jeremiah 29:11
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="relative w-full max-w-md lg:max-w-none group"
            >
              {/* Outer Decorative Double Border with Dynamic Theme Halo */}
              <div
                className="relative rounded-[2.5rem] p-3 sm:p-4 bg-white/[0.04] border backdrop-blur-2xl transition-all duration-700"
                style={{
                  borderColor: `${activeTheme.rayGoldPrimary}40`,
                  boxShadow: `0 25px 60px -15px rgba(0,0,0,0.85), 0 0 45px ${activeTheme.ambientGlow}`
                }}
              >
                {/* Header Tag on Portal */}
                <div className="flex items-center justify-between px-3 pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 font-mono">
                      COT LIVESTREAM PORTAL
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-300 font-bold px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                    HD · Valparai
                  </span>
                </div>

                {/* Video Player Container */}
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
                  <video
                    src="/சத்திய_நகரம்_City_of_Truth_Min.mp4"
                    poster="https://images.unsplash.com/photo-1510590337019-5ef2d39aa786?q=80&w=2670&auto=format&fit=crop"
                    autoPlay={!reduceHeroMotion}
                    loop
                    muted={isMuted}
                    playsInline
                    preload={reduceHeroMotion ? 'none' : 'metadata'}
                    className="w-full h-full object-cover"
                  />

                  {/* Audio Toggle Floating Overlay */}
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 border border-white/20 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer z-10"
                    title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                  >
                    {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} className="text-amber-400" />}
                  </button>

                  {/* Gradient Overlay for Cinematic Depth */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Bottom Video Badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 pointer-events-none">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                      சத்திய நகரம் ஊழியங்கள்
                    </span>
                  </div>
                </div>

                {/* Video Portal Feature Strip */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-1 text-center">
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-xs font-bold text-amber-300 font-mono">100+ SERMONS</p>
                    <p className="text-[9px] uppercase tracking-wider text-white/50">Weekly Worship Broadcasts</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-xs font-bold text-sky-300 font-mono">HEBREW ROOTS</p>
                    <p className="text-[9px] uppercase tracking-wider text-white/50">Ancient Sacred Mysteries</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating Element: Intercession Altar Bridge Chip in Empty Gap */}
            <motion.div
              animate={{ y: [0, -8, 0], x: [0, 3, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              className="hidden xl:flex absolute -left-8 top-1/3 z-20 items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-amber-400/30 backdrop-blur-2xl shadow-xl pointer-events-none"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200">
                24/7 Altar Prayer
              </span>
            </motion.div>
          </div>
        </div>

        {/* ─── Floating Glassmorphic Sacred Metric Ribbon (Filling Lower Viewport) ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-14 sm:mt-16 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full"
        >
          {[
            {
              icon: Mountain,
              value: '2,400m',
              label: 'Valparai Sanctuary',
              sub: 'Apostolic Heights',
              color: 'text-emerald-400',
              border: 'hover:border-emerald-500/40',
            },
            {
              icon: ShieldCheck,
              value: '3,500+',
              label: 'Covenant Entrust',
              sub: 'Registered Members',
              color: 'text-amber-400',
              border: 'hover:border-amber-500/40',
            },
            {
              icon: Flame,
              value: '24 / 7',
              label: 'Divine Intercession',
              sub: 'Altar Fire Burning',
              color: 'text-rose-400',
              border: 'hover:border-rose-500/40',
            },
            {
              icon: BookOpen,
              value: 'א - ת',
              label: 'Sacred Hebrew Hub',
              sub: 'Ancient Scripture Roots',
              color: 'text-sky-400',
              border: 'hover:border-sky-500/40',
            },
          ].map(({ icon: Icon, value, label, sub, color, border }) => (
            <div
              key={label}
              className={`p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl transition-all duration-300 ${border} group flex items-center gap-3.5`}
            >
              <div className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 ${color} group-hover:scale-110 transition-transform shadow-inner`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className={`text-base sm:text-lg font-black font-mono tracking-tight ${color}`}>
                  {value}
                </p>
                <p className="text-[11px] font-bold text-white/90 truncate leading-snug">
                  {label}
                </p>
                <p className="text-[9px] font-medium text-white/45 uppercase tracking-wider truncate">
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroCinematicIntro;
