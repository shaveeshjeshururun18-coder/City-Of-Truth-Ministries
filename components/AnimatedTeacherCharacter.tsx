import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Sparkles, X } from 'lucide-react';
import { MouthPronunciationAnimator, HEBREW_LETTER_PHONEMES, PhonemeStep } from './MouthPronunciationAnimator';

interface AnimatedTeacherCharacterProps {
  letterName?: string;
  hebrewLetter?: string;
  tamilText?: string;
  englishText?: string;
  tamilSyllables?: string[];
  phonemeSequence?: PhonemeStep[];
  isPlaying?: boolean;
  onPlayTamil?: () => void;
  onPlayHebrew?: () => void;
  onClose?: () => void;
  inline?: boolean;
  theme?: 'gold' | 'blue';
}

export const AnimatedTeacherCharacter: React.FC<AnimatedTeacherCharacterProps> = ({
  letterName = 'Aleph',
  hebrewLetter = 'א',
  tamilText = 'அலெஃப் — முதல் எபிரேய எழுத்து',
  englishText = 'Aleph — Silent master letter of divine unity',
  tamilSyllables = ['அ', 'லெ', 'ஃப்'],
  phonemeSequence,
  isPlaying = false,
  onPlayTamil,
  onPlayHebrew,
  onClose,
  inline = false,
  theme = 'gold',
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [activeSyllableIdx, setActiveSyllableIdx] = useState(0);
  const [mouthShape, setMouthShape] = useState<'REST' | 'AH' | 'EE' | 'OO' | 'L' | 'P'>('REST');

  // Random eye blink loop
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, Math.random() * 3000 + 2500);

    return () => clearInterval(blinkInterval);
  }, []);

  // Syllable & mouth movement loop when speaking
  useEffect(() => {
    if (!isPlaying) {
      setMouthShape('REST');
      setActiveSyllableIdx(-1);
      return;
    }

    const mouthCycle = ['AH', 'EE', 'OO', 'L', 'AH', 'REST'] as const;
    let step = 0;

    const interval = setInterval(() => {
      setMouthShape(mouthCycle[step % mouthCycle.length]);
      setActiveSyllableIdx(step % (tamilSyllables.length || 1));
      step++;
    }, 280);

    return () => {
      clearInterval(interval);
      setMouthShape('REST');
      setActiveSyllableIdx(-1);
    };
  }, [isPlaying, tamilSyllables]);

  return (
    <div className={`relative ${inline ? 'w-full' : 'fixed bottom-6 right-6 z-[99999] max-w-sm sm:max-w-md w-full p-4'} font-sans select-none`}>
      {/* Container Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-gradient-to-b from-[#0f172a]/95 via-[#090d16]/95 to-[#020617]/98 border border-[#F59E0B]/40 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(245,158,11,0.15)] backdrop-blur-xl overflow-hidden"
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b border-[#F59E0B]/20 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-ping" />
            <span className="text-xs font-black tracking-widest text-[#FDE047] uppercase font-cinzel">
              Interactive Tamil Teacher • ஆசிரியர்
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Character & Speech Bubble Row */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          
          {/* ANIMATED CHARACTER AVATAR (SVG) */}
          <div className="relative flex-shrink-0 w-28 h-32 flex items-center justify-center">
            {/* Golden Aura Glow */}
            <div className="absolute inset-0 bg-[#F59E0B]/20 rounded-full blur-xl animate-pulse" />

            {/* Float Wrapper */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="relative w-full h-full"
            >
              <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-2xl">
                <defs>
                  <linearGradient id="robeGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="50%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#020617" />
                  </linearGradient>
                  <linearGradient id="goldTrim" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="50%" stopColor="#FEF08A" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                  <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fed7aa" />
                    <stop offset="100%" stopColor="#fdba74" />
                  </linearGradient>
                </defs>

                {/* Golden Halo / Crown */}
                <circle cx="60" cy="40" r="34" fill="none" stroke="url(#goldTrim)" strokeWidth="2" opacity="0.6" strokeDasharray="4 2" />

                {/* Robe / Shoulders */}
                <path d="M 20 140 C 20 100, 100 100, 100 140 Z" fill="url(#robeGrad)" stroke="url(#goldTrim)" strokeWidth="1.5" />
                <path d="M 50 105 L 60 140 L 70 105 Z" fill="url(#goldTrim)" opacity="0.8" />

                {/* Beard */}
                <path d="M 38 65 C 38 100, 82 100, 82 65 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />

                {/* Face Head */}
                <ellipse cx="60" cy="50" rx="22" ry="24" fill="url(#skinGrad)" stroke="#f97316" strokeWidth="0.8" />

                {/* Eyebrows */}
                <motion.path
                  d="M 44 40 Q 50 36, 54 40"
                  stroke="#475569"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  animate={{ d: isPlaying ? "M 44 38 Q 50 34, 54 40" : "M 44 40 Q 50 36, 54 40" }}
                />
                <motion.path
                  d="M 66 40 Q 70 36, 76 40"
                  stroke="#475569"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  animate={{ d: isPlaying ? "M 66 38 Q 70 34, 76 40" : "M 66 40 Q 70 36, 76 40" }}
                />

                {/* Eyes (Blinking) */}
                {isBlinking ? (
                  <>
                    <line x1="45" y1="45" x2="53" y2="45" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="67" y1="45" x2="75" y2="45" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <circle cx="49" cy="45" r="3.5" fill="#0f172a" />
                    <circle cx="50.5" cy="44" r="1" fill="#ffffff" />
                    <circle cx="71" cy="45" r="3.5" fill="#0f172a" />
                    <circle cx="72.5" cy="44" r="1" fill="#ffffff" />
                  </>
                )}

                {/* Glasses Frame */}
                <circle cx="49" cy="45" r="7.5" fill="none" stroke="#D97706" strokeWidth="1.5" />
                <circle cx="71" cy="45" r="7.5" fill="none" stroke="#D97706" strokeWidth="1.5" />
                <line x1="56.5" y1="45" x2="63.5" y2="45" stroke="#D97706" strokeWidth="1.5" />

                {/* Nose */}
                <path d="M 60 45 L 58 54 L 62 54" fill="none" stroke="#ea580c" strokeWidth="1.2" strokeLinecap="round" />

                {/* DYNAMIC ANIMATED MOUTH */}
                {mouthShape === 'REST' && (
                  <path d="M 52 62 Q 60 64, 68 62" stroke="#991b1b" strokeWidth="2" strokeLinecap="round" fill="none" />
                )}
                {mouthShape === 'AH' && (
                  <ellipse cx="60" cy="64" rx="7" ry="6" fill="#7f1d1d" stroke="#991b1b" strokeWidth="1.5" />
                )}
                {mouthShape === 'EE' && (
                  <path d="M 49 63 Q 60 67, 71 63 Z" fill="#7f1d1d" stroke="#991b1b" strokeWidth="1.5" />
                )}
                {mouthShape === 'OO' && (
                  <circle cx="60" cy="64" r="4.5" fill="#7f1d1d" stroke="#991b1b" strokeWidth="1.5" />
                )}
                {mouthShape === 'L' && (
                  <g>
                    <ellipse cx="60" cy="64" rx="6" ry="5" fill="#7f1d1d" />
                    <path d="M 56 61 Q 60 59, 64 61" fill="#fecdd3" />
                  </g>
                )}
                {mouthShape === 'P' && (
                  <line x1="52" y1="63" x2="68" y2="63" stroke="#991b1b" strokeWidth="3" strokeLinecap="round" />
                )}

                {/* Raised Pointer Hand (When Speaking) */}
                {isPlaying && (
                  <motion.g
                    initial={{ rotate: -15 }}
                    animate={{ rotate: [ -15, 5, -15 ] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                  >
                    <path d="M 95 105 L 112 85 L 116 88 Z" fill="url(#skinGrad)" stroke="#f97316" strokeWidth="1" />
                    <circle cx="114" cy="84" r="3" fill="#F59E0B" />
                  </motion.g>
                )}
              </svg>
            </motion.div>
          </div>

          {/* SPEECH BUBBLE & SYLLABLE VISUALIZATION */}
          <div className="flex-1 w-full flex flex-col justify-between">
            <div className="relative bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-[#FBBF24] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} className="text-[#F59E0B] animate-spin" /> {letterName} ({hebrewLetter})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Tamil Phonetics</span>
              </div>

              {/* Tamil Text Display */}
              <p className="text-sm font-bold text-white leading-relaxed">
                {tamilText}
              </p>

              {/* Live Tamil Syllables Highlight Bar */}
              {tamilSyllables && tamilSyllables.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-white/10">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1">Syllables:</span>
                  {tamilSyllables.map((syl, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                        activeSyllableIdx === idx
                          ? 'bg-[#F59E0B] text-black scale-110 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                          : 'bg-white/10 text-slate-200'
                      }`}
                    >
                      {syl}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Play Buttons */}
            <div className="flex items-center gap-2">
              {onPlayTamil && (
                <button
                  onClick={onPlayTamil}
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Volume2 size={14} /> தமிழ் Audio Teaching
                </button>
              )}
              {onPlayHebrew && (
                <button
                  onClick={onPlayHebrew}
                  className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <Volume2 size={14} /> Hebrew Audio
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Viseme Anatomy Diagram Drawer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MouthPronunciationAnimator
              phonemeSequence={phonemeSequence || HEBREW_LETTER_PHONEMES[hebrewLetter] || []}
              wordText={letterName}
              compact={true}
              theme="gold"
              showControls={false}
              size={54}
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#FDE047] uppercase tracking-wide">
                Viseme Mouth Anatomy
              </span>
              <span className="text-[10px] text-slate-400">
                Lip & Tongue Realtime Sync
              </span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-full border border-[#F59E0B]/30">
            {isPlaying ? '🗣️ Speaking...' : '💤 Ready to Teach'}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnimatedTeacherCharacter;
