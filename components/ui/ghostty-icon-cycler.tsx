"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Volume2, VolumeX } from 'lucide-react';

export interface IconStyle {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  accentColor: string;
  renderIcon: () => React.ReactNode;
}

function playHapticPop(frequency = 520, duration = 0.08) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.4, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (_e) {}
}

export const GHOSTTY_ICON_STYLES: IconStyle[] = [
  {
    id: 'classic',
    name: 'Ghostty Classic',
    subtitle: 'Original macOS icon with violet glow',
    category: 'Default',
    accentColor: '#8b5cf6',
    renderIcon: () => (
      <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-[#1e1b4b] via-[#2e1065] to-[#0f172a] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.35),transparent_70%)]" />
        <svg viewBox="0 0 100 100" className="w-[62%] h-[62%] drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
          <defs>
            <linearGradient id="ghost-grad-classic" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#d8b4fe" />
            </linearGradient>
            <filter id="glow-classic">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#a855f7" floodOpacity="0.4" />
            </filter>
          </defs>
          <path
            d="M 50 15 C 32 15 22 29 22 47 L 22 75 C 22 81 27 85 32 80 C 37 75 42 80 47 84 C 50 86 54 86 57 83 C 62 79 67 84 72 80 C 77 76 82 81 82 75 L 82 47 C 82 29 70 15 50 15 Z"
            fill="url(#ghost-grad-classic)"
            filter="url(#glow-classic)"
          />
          <circle cx="40" cy="46" r="5" fill="#1e1b4b" />
          <circle cx="62" cy="46" r="5" fill="#1e1b4b" />
          <circle cx="41.5" cy="44.5" r="1.5" fill="#ffffff" />
          <circle cx="63.5" cy="44.5" r="1.5" fill="#ffffff" />
        </svg>
      </div>
    ),
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    subtitle: 'Glowing synthwave cyan & magenta wireframe',
    category: 'Vibrant',
    accentColor: '#06b6d4',
    renderIcon: () => (
      <div className="w-full h-full relative flex items-center justify-center bg-[#070913] overflow-hidden">
        <div className="absolute inset-0 opacity-25 bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#ec4899_1px,transparent_1px)] bg-[size:12px_12px]" />
        <svg viewBox="0 0 100 100" className="w-[62%] h-[62%] drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">
          <path
            d="M 50 15 C 32 15 22 29 22 47 L 22 75 C 22 81 27 85 32 80 C 37 75 42 80 47 84 C 50 86 54 86 57 83 C 62 79 67 84 72 80 C 77 76 82 81 82 75 L 82 47 C 82 29 70 15 50 15 Z"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="40" cy="46" r="4.5" fill="#f43f5e" />
          <circle cx="62" cy="46" r="4.5" fill="#f43f5e" />
          <circle cx="40" cy="46" r="1.5" fill="#ffffff" />
          <circle cx="62" cy="46" r="1.5" fill="#ffffff" />
        </svg>
      </div>
    ),
  },
  {
    id: 'sacred-gold',
    name: 'Sacred Gold',
    subtitle: 'Brushed metallic gold leaf and obsidian',
    category: 'Luxury',
    accentColor: '#f59e0b',
    renderIcon: () => (
      <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#09090b] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.25)_0%,transparent_75%)]" />
        <svg viewBox="0 0 100 100" className="w-[62%] h-[62%] drop-shadow-[0_12px_24px_rgba(245,158,11,0.3)]">
          <defs>
            <linearGradient id="gold-foil" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#eab308" />
              <stop offset="70%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
          </defs>
          <path
            d="M 50 15 C 32 15 22 29 22 47 L 22 75 C 22 81 27 85 32 80 C 37 75 42 80 47 84 C 50 86 54 86 57 83 C 62 79 67 84 72 80 C 77 76 82 81 82 75 L 82 47 C 82 29 70 15 50 15 Z"
            fill="url(#gold-foil)"
          />
          <circle cx="40" cy="46" r="4.5" fill="#451a03" />
          <circle cx="62" cy="46" r="4.5" fill="#451a03" />
          <circle cx="41.5" cy="44.5" r="1.5" fill="#fef08a" />
          <circle cx="63.5" cy="44.5" r="1.5" fill="#fef08a" />
        </svg>
      </div>
    ),
  },
  {
    id: 'pixel-retro',
    name: '8-Bit Phosphor',
    subtitle: 'Retro CRT monitor scanlines',
    category: 'Retro',
    accentColor: '#22c55e',
    renderIcon: () => (
      <div className="w-full h-full relative flex items-center justify-center bg-[#051c0d] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none opacity-40 z-10" />
        <svg viewBox="0 0 16 16" className="w-[62%] h-[62%] drop-shadow-[0_0_12px_rgba(34,197,94,0.6)]">
          <path
            d="M5 2h6v1h2v2h1v6h-1v2h-1v-1h-1v1h-1v-1h-1v1h-2v-1H7v1H6v-1H5v1H4v-2H3V5h1V3h1V2z"
            fill="#22c55e"
          />
          <rect x="5" y="5" width="2" height="2" fill="#051c0d" />
          <rect x="10" y="5" width="2" height="2" fill="#051c0d" />
          <rect x="5" y="5" width="1" height="1" fill="#ffffff" />
          <rect x="10" y="5" width="1" height="1" fill="#ffffff" />
        </svg>
      </div>
    ),
  }
];

export interface GhosttyIconCyclerProps {
  styles?: IconStyle[];
  defaultIndex?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  enableAudio?: boolean;
  onStyleChange?: (style: IconStyle, index: number) => void;
  className?: string;
}

export function GhosttyIconCycler({
  styles = GHOSTTY_ICON_STYLES,
  defaultIndex = 0,
  size = 'lg',
  enableAudio = true,
  onStyleChange,
  className = '',
}: GhosttyIconCyclerProps) {
  const [currentIndex, setCurrentIndex] = useState(defaultIndex);
  const [soundEnabled, setSoundEnabled] = useState(enableAudio);
  const [direction, setDirection] = useState(1);

  const currentStyle = styles[currentIndex] || styles[0];

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => {
      const nextIndex = (prev + 1) % styles.length;
      if (onStyleChange) onStyleChange(styles[nextIndex], nextIndex);
      return nextIndex;
    });

    if (soundEnabled) {
      const pitches = [520, 587, 659, 698, 784, 880, 987];
      playHapticPop(pitches[currentIndex % pitches.length], 0.08);
    }
  }, [styles, currentIndex, onStyleChange, soundEnabled]);

  const handleSelect = (index: number) => {
    setDirection(index >= currentIndex ? 1 : -1);
    setCurrentIndex(index);
    if (onStyleChange) onStyleChange(styles[index], index);
    if (soundEnabled) playHapticPop(600, 0.08);
  };

  const sizeClasses = {
    sm: 'w-20 h-20 rounded-[22px]',
    md: 'w-28 h-28 rounded-[28px]',
    lg: 'w-36 h-36 rounded-[36px]',
    xl: 'w-48 h-48 rounded-[44px]',
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="relative group cursor-pointer perspective-[1000px]">
        <motion.div
          animate={{
            backgroundColor: currentStyle.accentColor,
            opacity: 0.35,
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-3 rounded-[44px] blur-2xl -z-10 transition-colors duration-500 pointer-events-none"
        />

        <motion.button
          type="button"
          onClick={handleNext}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.93 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className={`relative ${sizeClasses[size]} overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.15)_inset] p-0 border-0 outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/50 bg-black cursor-pointer`}
          aria-label={`Cycle icon style. Currently: ${currentStyle.name}. Tap to cycle.`}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStyle.id}
              custom={direction}
              initial={{ rotateY: direction * 80, opacity: 0, scale: 0.85 }}
              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
              exit={{ rotateY: -direction * 80, opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 380, damping: 24, mass: 0.8 }}
              className="w-full h-full"
            >
              {currentStyle.renderIcon()}
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-white/25 via-white/5 to-transparent pointer-events-none" />
          <div className="absolute inset-0 rounded-[inherit] border border-white/20 pointer-events-none" />
        </motion.button>

        <div className="absolute -top-3 -right-3 z-20 pointer-events-none">
          <div className="px-2 py-0.5 rounded-full bg-slate-900/90 border border-white/20 shadow-lg text-[9px] font-mono font-bold text-white tracking-wider flex items-center gap-1 backdrop-blur-md">
            <Sparkles size={10} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            TAP
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentStyle.accentColor }} />
          <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            {currentStyle.name}
          </h3>
          <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            {currentStyle.category}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{currentStyle.subtitle}</p>
      </div>

      <div className="mt-4 flex items-center gap-2 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 p-1.5 rounded-full shadow-sm backdrop-blur-md">
        {styles.map((style, idx) => (
          <button
            key={style.id}
            onClick={() => handleSelect(idx)}
            className="p-1 rounded-full cursor-pointer focus:outline-none"
            title={`Switch to ${style.name}`}
          >
            <div className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-slate-900 dark:bg-white' : 'w-2 bg-slate-300 dark:bg-slate-700'}`} />
          </button>
        ))}
        <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />
        <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-1.5 text-slate-400 hover:text-slate-200 cursor-pointer">
          {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>
        <button onClick={handleNext} className="p-1.5 text-slate-400 hover:text-slate-200 cursor-pointer">
          <RefreshCw size={13} />
        </button>
      </div>
    </div>
  );
}

export default GhosttyIconCycler;
