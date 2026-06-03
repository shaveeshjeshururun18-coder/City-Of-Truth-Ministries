import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// PHONEME TARGETS — Mouth anatomy presets
// ==========================================
const PHONEME_TARGETS: Record<string, {
  open: number; width: number; tongueY: number; tongueX: number;
  teethGap: number; lowerLipBite: number; label: string; labelTa: string;
}> = {
  REST: { open: 0.0, width: 0.0, tongueY: 0.0, tongueX: 0.0, teethGap: 0.0, lowerLipBite: 0.0, label: "Resting Position", labelTa: "இதழ் மூடுதல்" },
  AH:   { open: 0.85, width: 0.15, tongueY: -0.6, tongueX: -0.1, teethGap: 0.8, lowerLipBite: 0.0, label: "Open Mouth Vowel", labelTa: "அ, ஆ" },
  EE:   { open: 0.22, width: 0.75, tongueY: 0.35, tongueX: 0.0, teethGap: 0.15, lowerLipBite: 0.0, label: "Smile Stretched Vowel", labelTa: "இ, ஈ" },
  OO:   { open: 0.32, width: -0.85, tongueY: -0.1, tongueX: -0.2, teethGap: 0.3, lowerLipBite: 0.0, label: "Pursed Rounded Lips", labelTa: "உ, ஊ" },
  F:    { open: 0.12, width: 0.2, tongueY: -0.2, tongueX: 0.0, teethGap: 0.1, lowerLipBite: 0.95, label: "Labiodental (Teeth on Lip)", labelTa: "ஃ" },
  TH:   { open: 0.25, width: 0.1, tongueY: 0.15, tongueX: 0.75, teethGap: 0.18, lowerLipBite: 0.0, label: "Dental Tongue Peek", labelTa: "த, Th" },
  L:    { open: 0.52, width: 0.25, tongueY: 0.9, tongueX: 0.15, teethGap: 0.45, lowerLipBite: 0.0, label: "Alveolar Tongue Contact", labelTa: "ல, ந, ட" },
  P:    { open: 0.0, width: -0.05, tongueY: -0.1, tongueX: 0.0, teethGap: 0.0, lowerLipBite: 0.0, label: "Bilabial (Closed Lips)", labelTa: "ப, ம" },
  K:    { open: 0.5, width: 0.15, tongueY: -0.2, tongueX: -0.5, teethGap: 0.4, lowerLipBite: 0.0, label: "Velar (Throat Action)", labelTa: "க" },
  ZH:   { open: 0.38, width: -0.25, tongueY: 0.72, tongueX: -0.8, teethGap: 0.35, lowerLipBite: 0.0, label: "Retroflex Curl", labelTa: "ழ" },
  SH:   { open: 0.28, width: 0.1, tongueY: 0.5, tongueX: 0.3, teethGap: 0.2, lowerLipBite: 0.0, label: "Palatal Fricative", labelTa: "ஷ" },
  R:    { open: 0.45, width: 0.2, tongueY: 0.6, tongueX: -0.3, teethGap: 0.35, lowerLipBite: 0.0, label: "Alveolar Trill", labelTa: "ர" },
  N:    { open: 0.35, width: 0.15, tongueY: 0.85, tongueX: 0.1, teethGap: 0.3, lowerLipBite: 0.0, label: "Nasal Contact", labelTa: "ந, ன" },
  H:    { open: 0.6, width: 0.1, tongueY: -0.3, tongueX: 0.0, teethGap: 0.55, lowerLipBite: 0.0, label: "Aspirated Open", labelTa: "ஹ" },
  V:    { open: 0.15, width: 0.18, tongueY: -0.1, tongueX: 0.0, teethGap: 0.1, lowerLipBite: 0.7, label: "Labiodental Voiced", labelTa: "வ" },
  S:    { open: 0.2, width: 0.3, tongueY: 0.4, tongueX: 0.2, teethGap: 0.12, lowerLipBite: 0.0, label: "Sibilant", labelTa: "ஸ" },
  TS:   { open: 0.25, width: 0.2, tongueY: 0.6, tongueX: 0.15, teethGap: 0.18, lowerLipBite: 0.0, label: "Affricate", labelTa: "ட்ஸ" },
};

// ==========================================
// Hebrew letter → phoneme sequence mapping
// ==========================================
export const HEBREW_LETTER_PHONEMES: Record<string, { phoneme: string; duration: number; syllable: string }[]> = {
  'א': [{ phoneme: "AH", duration: 400, syllable: "ah" }, { phoneme: "L", duration: 250, syllable: "lef" }, { phoneme: "EE", duration: 200, syllable: "lef" }, { phoneme: "F", duration: 350, syllable: "lef" }],
  'ב': [{ phoneme: "P", duration: 300, syllable: "bet" }, { phoneme: "EE", duration: 250, syllable: "bet" }, { phoneme: "TH", duration: 400, syllable: "bet" }],
  'ג': [{ phoneme: "K", duration: 300, syllable: "gee" }, { phoneme: "EE", duration: 350, syllable: "gee" }, { phoneme: "P", duration: 200, syllable: "mel" }, { phoneme: "EE", duration: 200, syllable: "mel" }, { phoneme: "L", duration: 350, syllable: "mel" }],
  'ד': [{ phoneme: "TH", duration: 300, syllable: "dah" }, { phoneme: "AH", duration: 350, syllable: "dah" }, { phoneme: "L", duration: 250, syllable: "let" }, { phoneme: "EE", duration: 200, syllable: "let" }, { phoneme: "TH", duration: 350, syllable: "let" }],
  'ה': [{ phoneme: "H", duration: 400, syllable: "heh" }, { phoneme: "EE", duration: 450, syllable: "heh" }],
  'ו': [{ phoneme: "V", duration: 350, syllable: "vav" }, { phoneme: "AH", duration: 300, syllable: "vav" }, { phoneme: "V", duration: 350, syllable: "vav" }],
  'ז': [{ phoneme: "S", duration: 300, syllable: "zah" }, { phoneme: "AH", duration: 350, syllable: "zah" }, { phoneme: "EE", duration: 200, syllable: "yin" }, { phoneme: "N", duration: 350, syllable: "yin" }],
  'ח': [{ phoneme: "K", duration: 400, syllable: "khet" }, { phoneme: "H", duration: 300, syllable: "khet" }, { phoneme: "EE", duration: 200, syllable: "khet" }, { phoneme: "TH", duration: 350, syllable: "khet" }],
  'ט': [{ phoneme: "TH", duration: 300, syllable: "tet" }, { phoneme: "EE", duration: 250, syllable: "tet" }, { phoneme: "TH", duration: 400, syllable: "tet" }],
  'י': [{ phoneme: "EE", duration: 300, syllable: "yod" }, { phoneme: "OO", duration: 350, syllable: "yod" }, { phoneme: "TH", duration: 350, syllable: "yod" }],
  'כ': [{ phoneme: "K", duration: 350, syllable: "kaf" }, { phoneme: "AH", duration: 300, syllable: "kaf" }, { phoneme: "F", duration: 400, syllable: "kaf" }],
  'ל': [{ phoneme: "L", duration: 300, syllable: "lah" }, { phoneme: "AH", duration: 350, syllable: "lah" }, { phoneme: "P", duration: 200, syllable: "med" }, { phoneme: "EE", duration: 200, syllable: "med" }, { phoneme: "TH", duration: 350, syllable: "med" }],
  'מ': [{ phoneme: "P", duration: 350, syllable: "mem" }, { phoneme: "EE", duration: 300, syllable: "mem" }, { phoneme: "P", duration: 400, syllable: "mem" }],
  'נ': [{ phoneme: "N", duration: 300, syllable: "noon" }, { phoneme: "OO", duration: 400, syllable: "noon" }, { phoneme: "N", duration: 350, syllable: "noon" }],
  'ס': [{ phoneme: "S", duration: 300, syllable: "sah" }, { phoneme: "AH", duration: 350, syllable: "sah" }, { phoneme: "P", duration: 200, syllable: "mekh" }, { phoneme: "EE", duration: 200, syllable: "mekh" }, { phoneme: "K", duration: 350, syllable: "mekh" }],
  'ע': [{ phoneme: "AH", duration: 400, syllable: "ah" }, { phoneme: "EE", duration: 300, syllable: "yin" }, { phoneme: "N", duration: 350, syllable: "yin" }],
  'פ': [{ phoneme: "P", duration: 350, syllable: "peh" }, { phoneme: "EE", duration: 400, syllable: "peh" }],
  'צ': [{ phoneme: "TS", duration: 350, syllable: "tsah" }, { phoneme: "AH", duration: 300, syllable: "tsah" }, { phoneme: "TH", duration: 250, syllable: "deh" }, { phoneme: "EE", duration: 350, syllable: "deh" }],
  'ק': [{ phoneme: "K", duration: 350, syllable: "qof" }, { phoneme: "OO", duration: 300, syllable: "qof" }, { phoneme: "F", duration: 400, syllable: "qof" }],
  'ר': [{ phoneme: "R", duration: 350, syllable: "resh" }, { phoneme: "EE", duration: 250, syllable: "resh" }, { phoneme: "SH", duration: 400, syllable: "resh" }],
  'ש': [{ phoneme: "SH", duration: 350, syllable: "sheen" }, { phoneme: "EE", duration: 350, syllable: "sheen" }, { phoneme: "N", duration: 350, syllable: "sheen" }],
  'ת': [{ phoneme: "TH", duration: 300, syllable: "tav" }, { phoneme: "AH", duration: 300, syllable: "tav" }, { phoneme: "V", duration: 400, syllable: "tav" }],
};

// ==========================================
// Theme presets
// ==========================================
const THEMES = {
  gold: {
    bgFill: '#111111',
    lipStroke: '#F59E0B',
    lipFill: '#111111',
    noseStroke: '#FBBF24',
    jawStroke: '#F59E0B',
    cavityFill: '#0a0600',
    tongueFill: '#D97706',
    teethFill: '#FEF3C7',
    teethStroke: '#F59E0B44',
    closedLineStroke: '#FBBF24',
    chinStroke: '#F59E0B55',
    bgRadius: 24,
  },
  blue: {
    bgFill: '#E8F0FE',
    lipStroke: '#4285F4',
    lipFill: '#E8F0FE',
    noseStroke: '#4285F4',
    jawStroke: '#4285F4',
    cavityFill: '#152C5B',
    tongueFill: '#FF8A9F',
    teethFill: '#FFFFFF',
    teethStroke: '#D2E3FC',
    closedLineStroke: '#202124',
    chinStroke: '#BDD7FE',
    bgRadius: 36,
  },
};

export interface PhonemeStep {
  phoneme: string;
  duration: number;
  syllable: string;
}

export interface MouthAnimatorProps {
  phonemeSequence: PhonemeStep[];
  wordText?: string;
  phonetic?: string;
  tamilPhonetic?: string;
  lang?: 'he' | 'en' | 'ta';
  theme?: 'gold' | 'blue';
  compact?: boolean;
  autoPlay?: boolean;
  showControls?: boolean;
  size?: number; // SVG container max-width in px
  onPlayStateChange?: (playing: boolean) => void;
}

export const MouthPronunciationAnimator: React.FC<MouthAnimatorProps> = ({
  phonemeSequence,
  wordText,
  phonetic,
  tamilPhonetic,
  lang = 'he',
  theme = 'gold',
  compact = false,
  autoPlay = false,
  showControls = true,
  size = 200,
  onPlayStateChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePhonemeIdx, setActivePhonemeIdx] = useState(-1);
  const [activePhonemeName, setActivePhonemeName] = useState('REST');
  const [isSlow, setIsSlow] = useState(false);

  const [animState, setAnimState] = useState({
    open: 0.0, width: 0.0, tongueY: 0.0, tongueX: 0.0, teethGap: 0.0, lowerLipBite: 0.0,
  });

  const animationFrameRef = useRef<number | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const mountedRef = useRef(true);

  const t = THEMES[theme];
  const isGold = theme === 'gold';

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Physics interpolation loop
  useEffect(() => {
    const update = () => {
      if (!mountedRef.current) return;
      setAnimState(prev => {
        const target = PHONEME_TARGETS[activePhonemeName] || PHONEME_TARGETS.REST;
        const ease = 0.16;
        return {
          open: prev.open + (target.open - prev.open) * ease,
          width: prev.width + (target.width - prev.width) * ease,
          tongueY: prev.tongueY + (target.tongueY - prev.tongueY) * ease,
          tongueX: prev.tongueX + (target.tongueX - prev.tongueX) * ease,
          teethGap: prev.teethGap + (target.teethGap - prev.teethGap) * ease,
          lowerLipBite: prev.lowerLipBite + (target.lowerLipBite - prev.lowerLipBite) * ease,
        };
      });
      animationFrameRef.current = requestAnimationFrame(update);
    };
    animationFrameRef.current = requestAnimationFrame(update);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [activePhonemeName]);

  const clearAllTimers = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    return () => { clearAllTimers(); };
  }, [clearAllTimers]);

  const triggerPronunciation = useCallback(() => {
    if (isPlaying) {
      clearAllTimers();
      setIsPlaying(false);
      setActivePhonemeIdx(-1);
      setActivePhonemeName('REST');
      onPlayStateChange?.(false);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      return;
    }

    setIsPlaying(true);
    onPlayStateChange?.(true);
    const speedFactor = isSlow ? 1.85 : 1.0;

    // Speech synthesis
    if ('speechSynthesis' in window && wordText) {
      window.speechSynthesis.cancel();
      const cleanToSpeak = wordText.split('(')[0].trim();
      const utterance = new SpeechSynthesisUtterance(cleanToSpeak);
      utterance.rate = isSlow ? 0.55 : 0.85;
      utterance.lang = lang === 'ta' ? 'ta-IN' : lang === 'he' ? 'he-IL' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }

    let elapsed = 0;
    phonemeSequence.forEach((step, idx) => {
      const stepDuration = step.duration * speedFactor;
      const timer = setTimeout(() => {
        if (!mountedRef.current) return;
        setActivePhonemeIdx(idx);
        setActivePhonemeName(step.phoneme);
        if (idx === phonemeSequence.length - 1) {
          const endTimer = setTimeout(() => {
            if (!mountedRef.current) return;
            setActivePhonemeName('REST');
            setIsPlaying(false);
            setActivePhonemeIdx(-1);
            onPlayStateChange?.(false);
          }, stepDuration);
          timeoutsRef.current.push(endTimer);
        }
      }, elapsed);
      timeoutsRef.current.push(timer);
      elapsed += stepDuration;
    });
  }, [isPlaying, isSlow, phonemeSequence, wordText, lang, clearAllTimers, onPlayStateChange]);

  // Auto-play
  useEffect(() => {
    if (autoPlay && phonemeSequence.length > 0 && !isPlaying) {
      const t = setTimeout(() => triggerPronunciation(), 300);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, phonemeSequence]);

  const currentPhonemeData = PHONEME_TARGETS[activePhonemeName] || PHONEME_TARGETS.REST;
  const activeSyllable = activePhonemeIdx >= 0 ? phonemeSequence[activePhonemeIdx]?.syllable : null;

  // ==========================================
  // SVG Mouth Render
  // ==========================================
  const renderMouthSVG = () => {
    const { open, width, tongueY, tongueX, teethGap, lowerLipBite } = animState;
    const cx = 150, cy = 160;
    const w = 55 + width * 22;
    const openingH = open * 38;
    const baseGap = 3.5;
    const hUpperInner = baseGap + (open * 14);
    const hLowerInner = baseGap + (open * 20) - (lowerLipBite * 10);
    const hUpperOuter = 15 + open * 4;
    const hLowerOuter = 17 + open * 14 - (lowerLipBite * 8);
    const safeLowerOuter = Math.max(hLowerOuter, hLowerInner + 6);
    const safeUpperOuter = Math.max(hUpperOuter, hUpperInner + 6);

    const cavityPath = `M ${cx - w} ${cy} Q ${cx} ${cy - hUpperInner - 3} ${cx + w} ${cy} Q ${cx} ${cy + hLowerInner + 3} ${cx - w} ${cy} Z`;
    const upperTeethHeight = 11, lowerTeethHeight = 9;
    const upperTeethY = cy - hUpperInner;
    const lowerTeethY = cy + hLowerInner + (teethGap * 4);
    const upperTeethPath = `M ${cx - w * 0.6} ${upperTeethY} L ${cx + w * 0.6} ${upperTeethY} L ${cx + w * 0.5} ${upperTeethY + upperTeethHeight} Q ${cx} ${upperTeethY + upperTeethHeight + 1.5} ${cx - w * 0.5} ${upperTeethY + upperTeethHeight} Z`;
    const lowerTeethPath = `M ${cx - w * 0.55} ${lowerTeethY} L ${cx + w * 0.55} ${lowerTeethY} L ${cx + w * 0.45} ${lowerTeethY - lowerTeethHeight} Q ${cx} ${lowerTeethY - lowerTeethHeight - 1} ${cx - w * 0.45} ${lowerTeethY - lowerTeethHeight} Z`;
    const tY = tongueY * 24, tX = tongueX * 18;
    const tonguePath = `M ${cx - w * 0.62} ${cy + hLowerInner + 2} Q ${cx + tX} ${cy + (openingH * 0.1) - tY} ${cx + w * 0.62} ${cy + hLowerInner + 2} Q ${cx + tX} ${cy + hLowerInner + 16} ${cx - w * 0.62} ${cy + hLowerInner + 2} Z`;
    const upperLipPath = `M ${cx - w} ${cy} Q ${cx} ${cy - safeUpperOuter} ${cx + w} ${cy} Q ${cx} ${cy - hUpperInner} ${cx - w} ${cy} Z`;
    const lowerLipPath = `M ${cx - w} ${cy} Q ${cx} ${cy + safeLowerOuter} ${cx + w} ${cy} Q ${cx} ${cy + hLowerInner} ${cx - w} ${cy} Z`;

    return (
      <svg viewBox="0 0 300 320" className="w-full h-full select-none">
        <rect width="300" height="320" rx={t.bgRadius} fill={t.bgFill} />
        {/* Nose */}
        <path d="M 112 42 C 132 88 168 88 188 42" stroke={t.noseStroke} strokeWidth="4.5" strokeLinecap="round" fill="none" vectorEffect="non-scaling-stroke" />
        {/* Cavity */}
        {open > 0.05 && <path d={cavityPath} fill={t.cavityFill} />}
        {/* Tongue */}
        {open > 0.05 && <path d={tonguePath} fill={t.tongueFill} />}
        {/* Upper Teeth */}
        {open > 0.1 && (
          <g>
            <path d={upperTeethPath} fill={t.teethFill} stroke={t.teethStroke} strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line x1={cx} y1={upperTeethY} x2={cx} y2={upperTeethY + upperTeethHeight + 0.5} stroke={t.teethStroke} strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line x1={cx - 15} y1={upperTeethY} x2={cx - 15} y2={upperTeethY + upperTeethHeight - 1} stroke={t.teethStroke} strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
            <line x1={cx + 15} y1={upperTeethY} x2={cx + 15} y2={upperTeethY + upperTeethHeight - 1} stroke={t.teethStroke} strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
          </g>
        )}
        {/* Lower Teeth */}
        {open > 0.22 && (
          <g>
            <path d={lowerTeethPath} fill={t.teethFill} stroke={t.teethStroke} strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line x1={cx} y1={lowerTeethY - lowerTeethHeight} x2={cx} y2={lowerTeethY} stroke={t.teethStroke} strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </g>
        )}
        {/* Upper Lip */}
        <path d={upperLipPath} fill={t.lipFill} stroke={t.lipStroke} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {/* Lower Lip */}
        <path d={lowerLipPath} fill={t.lipFill} stroke={t.lipStroke} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {/* Center line when closed */}
        <line x1={cx - w} y1={cy} x2={cx + w} y2={cy} stroke={t.closedLineStroke} strokeWidth="4" strokeLinecap="round" opacity={Math.max(0, 1 - open * 4)} vectorEffect="non-scaling-stroke" />
        {/* Jaw contour */}
        <path d="M 0,142 C 60,265 240,265 300,142" stroke={t.jawStroke} strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.6" vectorEffect="non-scaling-stroke" />
        {/* Chin */}
        <path d="M 132,238 Q 150,246 168,238" stroke={t.chinStroke} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.6" vectorEffect="non-scaling-stroke" />
        {/* Glow effect for gold theme */}
        {isGold && isPlaying && (
          <circle cx="150" cy="160" r="85" fill="none" stroke="#F59E0B" strokeWidth="1" opacity="0.15">
            <animate attributeName="r" values="80;90;80" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.15;0.05;0.15" dur="2s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>
    );
  };

  // Get syllables from phoneme sequence
  const uniqueSyllables: string[] = [];
  phonemeSequence.forEach(s => {
    if (!uniqueSyllables.includes(s.syllable)) uniqueSyllables.push(s.syllable);
  });

  return (
    <div className={`flex ${compact ? 'flex-row items-center gap-4' : 'flex-col items-center gap-3'}`}>
      {/* Mouth SVG Container */}
      <div
        className="relative rounded-2xl overflow-hidden flex-shrink-0"
        style={{
          width: size,
          height: size,
          background: isGold ? 'radial-gradient(circle at center, #1a1500 0%, #0a0800 100%)' : '#E8F0FE',
          border: isGold ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(66,133,244,0.2)',
          boxShadow: isGold ? '0 0 30px rgba(245,158,11,0.08), inset 0 0 20px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        {renderMouthSVG()}

        {/* Phoneme state tag */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-2 left-1/2 -translate-x-1/2"
            >
              <div className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm ${
                isGold
                  ? 'bg-black/70 text-[#FBBF24] border border-[#F59E0B]/30'
                  : 'bg-slate-900/80 text-white'
              }`}>
                {activePhonemeName}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info + Controls */}
      <div className={`flex flex-col ${compact ? 'gap-2 min-w-0' : 'items-center gap-3 w-full'}`}>
        {/* Phoneme description */}
        <AnimatePresence mode="wait">
          {isPlaying && activePhonemeName !== 'REST' && (
            <motion.div
              key={activePhonemeName}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className={`text-[10px] font-bold ${isGold ? 'text-[#FBBF24]' : 'text-[#1A73E8]'}`}>
                {currentPhonemeData.label}
              </div>
              <div className={`text-[10px] font-medium ${isGold ? 'text-[#F59E0B]/60' : 'text-slate-400'}`}>
                {currentPhonemeData.labelTa}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Syllable highlighting */}
        {phonetic && (
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {uniqueSyllables.map((syl, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className={`text-xs ${isGold ? 'text-[#F59E0B]/30' : 'text-slate-300'}`}>·</span>}
                <span className={`text-sm font-black transition-all duration-150 ${
                  activeSyllable === syl
                    ? isGold ? 'text-[#FBBF24] scale-110' : 'text-[#1A73E8] scale-110'
                    : isGold ? 'text-white/70' : 'text-slate-700'
                }`}>
                  {syl}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Tamil phonetic label */}
        {tamilPhonetic && (
          <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            isGold ? 'bg-[#F59E0B]/10 text-[#F59E0B]/70 border border-[#F59E0B]/20' : 'bg-indigo-50 text-indigo-600 border border-indigo-100/50'
          }`}>
            தமிழ்: {tamilPhonetic}
          </div>
        )}

        {/* Controls */}
        {showControls && (
          <div className="flex items-center gap-2">
            <button
              onClick={triggerPronunciation}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                isPlaying
                  ? isGold
                    ? 'bg-[#F59E0B] text-black shadow-lg shadow-[#F59E0B]/20'
                    : 'bg-[#1A73E8] text-white'
                  : isGold
                    ? 'bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30 hover:bg-[#F59E0B]/25'
                    : 'bg-[#E8F0FE] text-[#1A73E8] hover:bg-[#D2E3FC]'
              }`}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              {isPlaying ? 'Stop' : 'Play'}
            </button>

            <button
              onClick={() => setIsSlow(!isSlow)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                isSlow
                  ? isGold ? 'bg-[#F59E0B]/25 text-[#FBBF24] border border-[#F59E0B]/40' : 'bg-[#1A73E8]/15 text-[#1A73E8]'
                  : isGold ? 'bg-white/5 text-white/40 border border-white/10 hover:text-white/60' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {isSlow ? '🐢 Slow' : '🐇 Normal'}
            </button>

            {!isPlaying && (
              <button
                onClick={() => {
                  setActivePhonemeIdx(-1);
                  setActivePhonemeName('REST');
                }}
                className={`p-1.5 rounded-lg transition-all ${
                  isGold ? 'text-white/30 hover:text-white/60 hover:bg-white/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title="Reset"
              >
                <RotateCcw size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MouthPronunciationAnimator;
