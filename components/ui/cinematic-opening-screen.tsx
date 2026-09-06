import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface CinematicOpeningScreenProps {
  onComplete?: () => void;
}

export const CinematicOpeningScreen: React.FC<CinematicOpeningScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(() => {
    try {
      return !sessionStorage.getItem('cot_opening_shown');
    } catch {
      return true;
    }
  });

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem('cot_opening_shown', 'true');
    } catch {}
    if (onComplete) onComplete();
  };

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      handleDismiss();
    }, 1800); // 1.8s luxury opening reveal

    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="cinematic-opening-curtain"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[99999] bg-[#020308] flex flex-col items-center justify-center cursor-pointer overflow-hidden select-none"
        >
          {/* Ambient Radiant Golden Sunburst Halo */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.22)_0%,rgba(180,83,9,0.1)_35%,transparent_70%)] blur-[80px] pointer-events-none" />

          {/* Sweeping Light Line Beam */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1.2, 1], opacity: [0, 1, 0.8] }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_15px_#fde047]"
          />

          {/* Center Sacred Emblem & Typography Container */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
            {/* Golden Menorah Crest */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative mb-6"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400/20 via-yellow-500/10 to-transparent border border-amber-400/40 backdrop-blur-xl flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.35)]">
                <img
                  src="/assets/golden_menorah.png"
                  alt="City of Truth Sacred Menorah"
                  className="w-14 h-14 object-contain filter drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                  onError={(e) => {
                    e.currentTarget.src = '/brand-logo.png';
                  }}
                />
              </div>

              {/* Glowing Pulse Ring */}
              <span className="absolute inset-0 rounded-full border border-amber-400/40 animate-ping opacity-30" />
            </motion.div>

            {/* Sacred Tamil Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="text-4xl sm:text-5xl font-serif font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-200 drop-shadow-[0_4px_25px_rgba(245,158,11,0.5)]"
            >
              சத்திய நகரம்
            </motion.h1>

            {/* English Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.35em] text-amber-200/90 mt-2"
            >
              City of Truth Ministries
            </motion.p>

            {/* Sanctuary Location & Foundation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="flex items-center gap-2 mt-4 text-[10px] sm:text-xs font-mono tracking-widest text-amber-400/80 uppercase"
            >
              <Sparkles size={11} className="text-amber-400" />
              <span>Valparai Sanctuary · 2,400m Heights</span>
              <Sparkles size={11} className="text-amber-400" />
            </motion.div>
          </div>

          {/* Discreet Skip Note at Bottom */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-8 text-[10px] text-white/40 tracking-wider uppercase font-mono hover:text-white/80 transition-colors"
          >
            Click anywhere to enter sanctuary
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CinematicOpeningScreen;
