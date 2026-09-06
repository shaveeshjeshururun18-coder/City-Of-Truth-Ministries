"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2 } from 'lucide-react';

export interface HebrewSymbolItem {
  id: string;
  hebrew: string;
  name: string;
  meaning: string;
  gematria: string;
  scripture: string;
  frequency: number;
  gradient: string;
  accentColor: string;
}

function playHarmonicTone(frequency: number, duration = 0.22) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (_e) {
    // Graceful fallback
  }
}

export const HEBREW_SANCTUARY_SYMBOLS: HebrewSymbolItem[] = [
  {
    id: 'aleph',
    hebrew: 'א',
    name: 'Aleph (אלף)',
    meaning: 'The First • Divine Oneness • Strength & Covenant',
    gematria: 'Value: 1',
    scripture: 'Isa 44:6 • "I am the First and I am the Last"',
    frequency: 528,
    gradient: 'from-[#1e1b4b] via-[#4338ca] to-[#312e81]',
    accentColor: '#818cf8',
  },
  {
    id: 'tav',
    hebrew: 'ת',
    name: 'Tav (תו)',
    meaning: 'The Final Seal • Truth (אמת Emet) • Completion',
    gematria: 'Value: 400',
    scripture: 'Rev 22:13 • "The Alpha and Omega, First and Last"',
    frequency: 432,
    gradient: 'from-[#18181b] via-[#27272a] to-[#09090b]',
    accentColor: '#f59e0b',
  },
  {
    id: 'shin',
    hebrew: 'ש',
    name: 'Shin (שין)',
    meaning: 'El Shaddai • Divine Fire • Shalom (שלום)',
    gematria: 'Value: 300',
    scripture: 'Deut 6:4 • The Shema & Shield of Peace',
    frequency: 639,
    gradient: 'from-[#450a0a] via-[#991b1b] to-[#1e1b4b]',
    accentColor: '#f87171',
  },
  {
    id: 'menorah',
    hebrew: 'מנורה',
    name: 'The Golden Menorah',
    meaning: 'Seven Spirits of God • Perpetual Light',
    gematria: 'Exod 25:31',
    scripture: 'Zech 4:6 • "Not by might nor power, but by My Spirit"',
    frequency: 741,
    gradient: 'from-[#451a03] via-[#b45309] to-[#78350f]',
    accentColor: '#fbbf24',
  },
  {
    id: 'lion',
    hebrew: 'אריה',
    name: 'Lion of Judah (Aryeh)',
    meaning: 'Tribe of Judah • Conquering King • Strength',
    gematria: 'Gen 49:9',
    scripture: 'Rev 5:5 • "The Lion of the tribe of Judah has prevailed"',
    frequency: 396,
    gradient: 'from-[#0f172a] via-[#1e293b] to-[#334155]',
    accentColor: '#38bdf8',
  }
];

export function HebrewSymbolCycler() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = HEBREW_SANCTUARY_SYMBOLS[currentIndex];

  const handleNext = useCallback(() => {
    const next = (currentIndex + 1) % HEBREW_SANCTUARY_SYMBOLS.length;
    setCurrentIndex(next);
    playHarmonicTone(HEBREW_SANCTUARY_SYMBOLS[next].frequency);
  }, [currentIndex]);

  return (
    <div className="flex flex-col items-center py-6 select-none">
      <motion.button
        type="button"
        onClick={handleNext}
        whileHover={{ scale: 1.05, y: -3 }}
        whileTap={{ scale: 0.93 }}
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-[32px] sm:rounded-[36px] bg-gradient-to-br ${current.gradient} border-2 border-amber-400/40 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-center justify-center p-0 overflow-hidden cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-300/30`}
        aria-label={`Cycle Hebrew symbol. Currently: ${current.name}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ rotateY: 80, opacity: 0, scale: 0.8 }}
            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
            exit={{ rotateY: -80, opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 360, damping: 22 }}
            className="flex flex-col items-center justify-center"
          >
            <span
              className="font-serif font-black text-5xl sm:text-6xl text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {current.hebrew}
            </span>
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 border border-white/20 text-[9px] font-mono font-bold text-amber-300 flex items-center gap-1">
          <Volume2 size={10} />
          {current.frequency}Hz
        </div>
      </motion.button>

      <div className="mt-4 text-center max-w-sm px-4">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <h3 className="text-lg font-serif font-bold text-white tracking-wide">
            {current.name}
          </h3>
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm">
            {current.gematria}
          </span>
        </div>
        <p className="text-xs font-medium text-slate-200 leading-relaxed mb-1">
          {current.meaning}
        </p>
        <p className="text-[11px] font-serif italic text-amber-300/90">
          {current.scripture}
        </p>

        <div className="flex items-center justify-center gap-1.5 mt-3">
          {HEBREW_SANCTUARY_SYMBOLS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentIndex(idx);
                playHarmonicTone(item.frequency);
              }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                  : 'w-2 bg-white/25 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default HebrewSymbolCycler;
