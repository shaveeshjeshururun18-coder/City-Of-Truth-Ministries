import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// PHONEME TARGETS — Mouth anatomy presets
// ==========================================
export const PHONEME_TARGETS: Record<string, {
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

const GOOGLE_VISEME_BASE = "https://ssl.gstatic.com/dictionary/static/pronunciation/20180801/desktop/";

export const PHONEME_VISEME_FILES: Record<string, string> = {
  REST: "sil.svg",
  AH: "e.svg",
  EE: "e.svg",
  OO: "w_oo_uu_u.svg",
  F: "w_oo_uu_u.svg",
  TH: "e.svg",
  L: "l-w_oo_uu_o_u.svg",
  P: "sil.svg",
  K: "e.svg",
  ZH: "o.svg",
  SH: "e.svg",
  R: "l-w_oo_uu_o_u.svg",
  N: "l-w_oo_uu_o_u.svg",
  H: "e.svg",
  V: "w_oo_uu_u.svg",
  S: "e.svg",
  TS: "e.svg",
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
    cavityFill: '#0a0600',
    tongueFill: '#D97706',
    teethFill: '#FEF3C7',
    teethStroke: '#111111',
    closedLineStroke: '#FBBF24',
    bgRadius: 24,
  },
  blue: {
    bgFill: '#D3E3FD',
    lipStroke: '#041E49',
    lipFill: '#D3E3FD',
    cavityFill: '#041E49',
    tongueFill: '#EF4444',
    teethFill: '#FFFFFF',
    teethStroke: '#041E49',
    closedLineStroke: '#041E49',
    bgRadius: 16,
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
  tamilSyllables?: string[];
  pronunciationGuide?: string;
  lang?: 'he' | 'en' | 'ta';
  theme?: 'gold' | 'blue';
  compact?: boolean;
  autoPlay?: boolean;
  showControls?: boolean;
  size?: number; // SVG container max-width in px
  externalPlayKey?: number;
  externalSlow?: boolean;
  externalMode?: 'hebrew' | 'tamil';
  isPlaying?: boolean;
  animationState?: string;
  className?: string;
  onPlayStateChange?: (playing: boolean) => void;
}

export const MouthPronunciationAnimator: React.FC<MouthAnimatorProps> = ({
  phonemeSequence,
  wordText,
  phonetic,
  tamilPhonetic,
  tamilSyllables,
  pronunciationGuide,
  lang = 'he',
  theme = 'gold',
  compact = false,
  autoPlay = false,
  showControls = true,
  size = 200,
  externalPlayKey = 0,
  externalSlow = false,
  externalMode = 'hebrew',
  onPlayStateChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePhonemeIdx, setActivePhonemeIdx] = useState(-1);
  const [activePhonemeName, setActivePhonemeName] = useState('REST');
  const [isSlow, setIsSlow] = useState(false);
  const [activeMode, setActiveMode] = useState<'hebrew' | 'tamil'>('hebrew');

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const mountedRef = useRef(true);

  const t = THEMES[theme];
  const isGold = theme === 'gold';

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const clearAllTimers = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    return () => { clearAllTimers(); };
  }, [clearAllTimers]);

  const stopAnimation = useCallback((cancelSpeech = true) => {
    clearAllTimers();
    setIsPlaying(false);
    setActivePhonemeIdx(-1);
    setActivePhonemeName('REST');
    onPlayStateChange?.(false);
    if (cancelSpeech && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }, [clearAllTimers, onPlayStateChange]);

  const runMouthAnimation = useCallback((options?: { speak?: boolean; slow?: boolean; mode?: 'hebrew' | 'tamil' }) => {
    clearAllTimers();
    setActivePhonemeIdx(-1);
    setActivePhonemeName('REST');
    setIsPlaying(true);
    setActiveMode(options?.mode ?? activeMode);
    onPlayStateChange?.(true);
    const shouldSpeak = options?.speak ?? true;
    const shouldSlow = options?.slow ?? isSlow;

    const startPhonemeTimers = () => {
      if (phonemeSequence.length === 0) {
        const emptyTimer = setTimeout(() => stopAnimation(false), 500);
        timeoutsRef.current.push(emptyTimer);
        return;
      }

      const speedFactor = shouldSlow ? 1.55 : 1.0;

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
    };

    if (shouldSpeak && 'speechSynthesis' in window && wordText) {
      window.speechSynthesis.cancel();
      const cleanToSpeak = wordText.split('(')[0].trim();
      const utterance = new SpeechSynthesisUtterance(cleanToSpeak);
      utterance.rate = shouldSlow ? 0.55 : 0.85;
      utterance.lang = lang === 'ta' ? 'ta-IN' : lang === 'he' ? 'he-IL' : 'en-IN';

      // PERFECT AUDIO-MOUTH SYNC: Trigger mouth animation when audio starts playing
      let hasStarted = false;
      utterance.onstart = () => {
        if (mountedRef.current && !hasStarted) {
          hasStarted = true;
          startPhonemeTimers();
        }
      };

      const fallbackTimer = setTimeout(() => {
        if (mountedRef.current && !hasStarted) {
          hasStarted = true;
          startPhonemeTimers();
        }
      }, 300);
      timeoutsRef.current.push(fallbackTimer);

      window.speechSynthesis.speak(utterance);
    } else {
      startPhonemeTimers();
    }
  }, [activeMode, clearAllTimers, isSlow, lang, onPlayStateChange, phonemeSequence, stopAnimation, wordText]);

  const triggerPronunciation = useCallback(() => {
    if (isPlaying) {
      stopAnimation(true);
      return;
    }

    runMouthAnimation({ speak: true, slow: isSlow, mode: activeMode });
  }, [isPlaying, isSlow, runMouthAnimation, stopAnimation, activeMode]);

  // Auto-play
  useEffect(() => {
    if (autoPlay && phonemeSequence.length > 0 && !isPlaying) {
      const t = setTimeout(() => runMouthAnimation({ speak: false, slow: false }), 300);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, phonemeSequence]);

  useEffect(() => {
    if (externalPlayKey > 0) {
      runMouthAnimation({ speak: false, slow: externalSlow, mode: externalMode });
    }
  }, [externalMode, externalPlayKey, externalSlow, runMouthAnimation]);

  const currentPhonemeData = PHONEME_TARGETS[activePhonemeName] || PHONEME_TARGETS.REST;
  const activeSyllable = activePhonemeIdx >= 0 ? phonemeSequence[activePhonemeIdx]?.syllable : null;

  const currentVisemeFile = PHONEME_VISEME_FILES[activePhonemeName] || PHONEME_VISEME_FILES.REST;

  // Get syllables from phoneme sequence
  const uniqueSyllables: string[] = [];
  phonemeSequence.forEach(s => {
    if (!uniqueSyllables.includes(s.syllable)) uniqueSyllables.push(s.syllable);
  });
  const activeSyllableIndex = activeSyllable ? uniqueSyllables.indexOf(activeSyllable) : -1;

  return (
    <div className={`flex ${compact ? 'flex-row items-center gap-4' : 'flex-col items-center gap-3'}`}>
      {/* Google dictionary viseme frame container */}
      <div
        className="relative rounded-[18px] overflow-hidden flex-shrink-0 cursor-pointer active:scale-[0.98] transition-transform"
        onClick={triggerPronunciation}
        role="button"
        tabIndex={0}
        title={isPlaying ? 'Stop pronunciation' : 'Play pronunciation'}
        aria-label={isPlaying ? 'Stop pronunciation' : 'Play pronunciation'}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            triggerPronunciation();
          }
        }}
        style={{
          width: size,
          height: size,
          background: theme === 'blue' ? '#eaf2ff' : t.bgFill,
          border: isGold ? '1px solid rgba(245, 158, 11, 0.25)' : 'none',
          boxShadow: isGold ? '0 0 30px rgba(245,158,11,0.08), inset 0 0 20px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <img
          key={currentVisemeFile}
          src={`${GOOGLE_VISEME_BASE}${currentVisemeFile}`}
          alt={`${activePhonemeName} mouth position`}
          className="h-full w-full select-none object-contain"
          draggable={false}
          onError={(event) => {
            event.currentTarget.src = `${GOOGLE_VISEME_BASE}${PHONEME_VISEME_FILES.REST}`;
          }}
        />

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
                {currentPhonemeData.label}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showControls && (
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={triggerPronunciation}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                isPlaying
                  ? 'bg-red-500 text-white shadow-red-500/20'
                  : isGold
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
              }`}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              {isPlaying ? 'Pause' : 'Pronounce'}
            </button>

            <button
              onClick={() => {
                const nextSlow = !isSlow;
                setIsSlow(nextSlow);
                if (isPlaying) {
                  stopAnimation(true);
                  setTimeout(() => runMouthAnimation({ speak: true, slow: nextSlow }), 100);
                }
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                isSlow
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              Slow 0.5x
            </button>
          </div>

          {/* Syllable indicators */}
          {uniqueSyllables.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              {uniqueSyllables.map((syl, i) => (
                <span
                  key={i}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-mono transition-all ${
                    activeSyllableIndex === i
                      ? 'bg-amber-500 text-black font-bold scale-110'
                      : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {syl}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MouthPronunciationAnimator;
