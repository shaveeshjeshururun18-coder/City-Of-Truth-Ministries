"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Fingerprint, Crown, Sparkles } from 'lucide-react';

export interface TrustSealTier {
  id: string;
  name: string;
  badge: string;
  description: string;
  scripture: string;
  accentColor: string;
  renderIcon: () => React.ReactNode;
}

function playSealHaptic(frequency = 520) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.45, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (_e) {
    // Graceful audio fallback
  }
}

export const TRUST_SEAL_TIERS: TrustSealTier[] = [
  {
    id: 'entrust',
    name: 'Entrust Digital Covenant',
    badge: 'Verified ID',
    description: 'Cryptographically signed digital identity card',
    scripture: '2 Tim 1:14 • Guard what was entrusted',
    accentColor: '#3b82f6',
    renderIcon: () => (
      <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#0284c7] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.4),transparent_70%)]" />
        <ShieldCheck size={44} className="text-white drop-shadow-[0_0_16px_rgba(59,130,246,0.8)]" />
      </div>
    ),
  },
  {
    id: 'biometric',
    name: 'Passkey & Biometric Auth',
    badge: 'Hardware Keystore',
    description: 'WebAuthn biometric sensor & secure enclave',
    scripture: 'Isa 49:16 • Engraved upon the palms',
    accentColor: '#10b981',
    renderIcon: () => (
      <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#0f172a] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.35),transparent_70%)]" />
        <Fingerprint size={44} className="text-emerald-300 drop-shadow-[0_0_16px_rgba(16,185,129,0.8)]" />
      </div>
    ),
  },
  {
    id: 'sacred-gold',
    name: 'Baruch Hashem Fellowship',
    badge: 'Full Member',
    description: 'Active worshipper in City of Truth global registry',
    scripture: 'Eph 2:19 • Fellow citizens with the saints',
    accentColor: '#f59e0b',
    renderIcon: () => (
      <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-[#1c1917] via-[#78350f] to-[#451a03] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.4),transparent_70%)]" />
        <span className="font-serif font-black text-3xl text-amber-300 drop-shadow-[0_0_14px_rgba(245,158,11,0.8)]">
          ב״ה
        </span>
      </div>
    ),
  },
  {
    id: 'apostolic',
    name: 'Apostolic Oversight Seal',
    badge: 'Covenant Seal',
    description: 'Authorized by Pastor Lazarus M.S. & Presbytery',
    scripture: '1 Cor 4:1 • Servants and stewards of mysteries',
    accentColor: '#ec4899',
    renderIcon: () => (
      <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-[#4c0519] via-[#831843] to-[#1e1b4b] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.35),transparent_70%)]" />
        <Crown size={42} className="text-amber-300 drop-shadow-[0_0_16px_rgba(251,191,36,0.7)]" />
      </div>
    ),
  }
];

export function CovenantTrustSeal() {
  const [index, setIndex] = useState(0);
  const current = TRUST_SEAL_TIERS[index];

  const handleCycle = useCallback(() => {
    setIndex((prev) => (prev + 1) % TRUST_SEAL_TIERS.length);
    const pitches = [520, 620, 740, 880];
    playSealHaptic(pitches[index % pitches.length]);
  }, [index]);

  return (
    <div className="flex flex-col items-center mb-6 select-none relative z-20">
      {/* 3D Interactive Squircle Seal */}
      <motion.button
        type="button"
        onClick={handleCycle}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.93 }}
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[26px] sm:rounded-[30px] p-0 border-2 border-white/30 shadow-[0_15px_35px_rgba(0,0,0,0.5)] overflow-hidden cursor-pointer bg-slate-950 focus:outline-none focus:ring-4 focus:ring-amber-300/30"
        aria-label={`Cycle covenant seal tier. Currently ${current.name}.`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ rotateY: 90, opacity: 0, scale: 0.85 }}
            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
            exit={{ rotateY: -90, opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="w-full h-full"
          >
            {current.renderIcon()}
          </motion.div>
        </AnimatePresence>

        {/* Mac OS Top Gloss Bevel */}
        <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/30 via-white/10 to-transparent pointer-events-none" />

        {/* Tap Badge */}
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[8px] font-mono font-bold text-amber-300 flex items-center gap-0.5 pointer-events-none">
          <Sparkles size={8} />
          TAP
        </div>
      </motion.button>

      {/* Dynamic Tier Title & Scripture */}
      <div className="mt-3 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: current.accentColor }}
          />
          <span className="text-xs font-black text-white uppercase tracking-wider">
            {current.name}
          </span>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/20 text-white/90">
            {current.badge}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-white/75 font-serif italic">
          {current.scripture}
        </p>
      </div>
    </div>
  );
}

export default CovenantTrustSeal;
