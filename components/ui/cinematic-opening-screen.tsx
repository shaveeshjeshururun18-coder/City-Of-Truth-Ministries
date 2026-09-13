import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Sparkles, Flame } from 'lucide-react';

interface CinematicOpeningScreenProps {
  onComplete?: () => void;
}

/**
 * 4-Point Diamond Star Glint Component
 * Renders an ethereal, ultra-brilliant diamond sparkle with animated flare rays.
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
      {/* Radiant Halo Core */}
      <span
        className="absolute rounded-full bg-cyan-200/90 blur-[2px]"
        style={{ width: size * 0.45, height: size * 0.45 }}
      />
      {/* 4-Point Diamond Sparkle Star */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-full h-full text-white filter drop-shadow-[0_0_6px_#ffffff] drop-shadow-[0_0_12px_#7dd3fc] drop-shadow-[0_0_20px_#fbbf24]"
      >
        <path d="M12 0 L14 9.5 L24 12 L14 14.5 L12 24 L10 14.5 L0 12 L10 9.5 Z" />
      </svg>
    </motion.div>
  );
};

/**
 * CinematicOpeningScreen
 * 
 * Celestial Diamond Splendor Splash Screen:
 * - Diamond Shine on Logo (footer-logo.webp) with prismatic 115° beam sweep and diamond glints
 * - Diamond Shimmer on Typography ("சத்திய நகரம்" & "CITY OF TRUTH MINISTRIES")
 * - Ethereal rotating God Rays & Shekinah glory halo
 * - Accessible, responsive, and dismissible on click or smooth auto-transition
 */
export const CinematicOpeningScreen: React.FC<CinematicOpeningScreenProps> = ({ onComplete }) => {
  const prefersReduced = useReducedMotion();
  const [isVisible, setIsVisible] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('splash') !== null) return true;
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

  // Allow replaying via custom event or global function
  useEffect(() => {
    const handleReplay = () => setIsVisible(true);
    window.addEventListener('cot:replay-splash', handleReplay);
    (window as unknown as { replaySplashScreen: () => void }).replaySplashScreen = () => setIsVisible(true);

    return () => {
      window.removeEventListener('cot:replay-splash', handleReplay);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    // Luxurious ~3.0s showcase timing to let diamond sweeps complete their cycle
    const timer = setTimeout(() => {
      handleDismiss();
    }, 3200);

    return () => clearTimeout(timer);
  }, [isVisible]);

  if (prefersReduced) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="cinematic-opening-curtain"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.05,
            filter: 'blur(16px)',
          }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[999999] bg-[#020308] flex flex-col items-center justify-center cursor-pointer overflow-hidden select-none"
        >
          {/* ─── Self-contained Diamond Shimmer & Shine Styles ─── */}
          <style>{`
            /* Diamond Beam Sweep across Logo */
            @keyframes cot-diamond-sweep {
              0% { transform: translateX(-160%) skewX(-25deg); opacity: 0; }
              15% { opacity: 0.9; }
              50% { opacity: 1; }
              85% { opacity: 0.9; }
              100% { transform: translateX(200%) skewX(-25deg); opacity: 0; }
            }
            .cot-diamond-shimmer-beam {
              position: absolute;
              inset: -20% -60%;
              background: linear-gradient(
                105deg,
                transparent 15%,
                rgba(255, 255, 255, 0.0) 32%,
                rgba(255, 255, 255, 0.45) 42%,
                rgba(255, 255, 255, 0.95) 48%,
                rgba(186, 230, 253, 1) 50%,
                rgba(255, 255, 255, 0.95) 52%,
                rgba(254, 240, 138, 0.8) 56%,
                rgba(255, 255, 255, 0.3) 62%,
                rgba(255, 255, 255, 0.0) 70%,
                transparent 85%
              );
              animation: cot-diamond-sweep 2.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
              pointer-events: none;
              mix-blend-mode: screen;
            }

            /* Animated Diamond Crystalline Text Shimmer */
            @keyframes cot-diamond-text-flow {
              0% { background-position: 220% 50%; }
              100% { background-position: -80% 50%; }
            }
            .cot-diamond-text-shine {
              background-image: linear-gradient(
                110deg,
                #dfb76c 0%,
                #fff5db 18%,
                #ffffff 28%,
                #a5f3fc 36%,
                #ffffff 44%,
                #ffffff 52%,
                #fde047 62%,
                #ffffff 72%,
                #c49746 85%,
                #dfb76c 100%
              );
              background-size: 260% 100%;
              -webkit-background-clip: text;
              background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: cot-diamond-text-flow 3.0s linear infinite;
            }

            /* Secondary diamond text shimmer for subtitle */
            .cot-diamond-subtext-shine {
              background-image: linear-gradient(
                105deg,
                #e2c275 0%,
                #ffffff 25%,
                #bae6fd 38%,
                #ffffff 50%,
                #fef08a 62%,
                #ffffff 75%,
                #e2c275 100%
              );
              background-size: 220% 100%;
              -webkit-background-clip: text;
              background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: cot-diamond-text-flow 2.8s linear infinite;
            }

            /* Celestial Rotating Diamond Rays */
            @keyframes cot-rays-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .cot-diamond-god-rays {
              animation: cot-rays-spin 40s linear infinite;
            }

            /* Diamond countdown progress line */
            @keyframes cot-splash-progress {
              from { transform: scaleX(0); }
              to { transform: scaleX(1); }
            }
            .cot-progress-bar {
              animation: cot-splash-progress 3.2s linear forwards;
              transform-origin: left center;
            }
          `}</style>

          {/* ─── Volumetric Heavenly Sunburst Halo & Aura ─── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.55, 0.9, 0.75], scale: [0.85, 1.14, 1] }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.38)_0%,rgba(125,211,252,0.18)_28%,rgba(217,119,6,0.12)_48%,transparent_75%)] blur-[95px] pointer-events-none"
          />

          {/* ─── Celestial Rotating Diamond God Rays ─── */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-30">
            <div
              className="cot-diamond-god-rays w-[900px] h-[900px] rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg 15deg, rgba(255,255,255,0.18) 20deg, transparent 25deg 40deg, rgba(186,230,253,0.2) 45deg, transparent 50deg 75deg, rgba(251,191,36,0.22) 80deg, transparent 85deg 110deg, rgba(255,255,255,0.16) 115deg, transparent 120deg 150deg, rgba(186,230,253,0.18) 155deg, transparent 160deg 195deg, rgba(251,191,36,0.22) 200deg, transparent 205deg 235deg, rgba(255,255,255,0.18) 240deg, transparent 245deg 280deg, rgba(186,230,253,0.2) 285deg, transparent 290deg 320deg, rgba(251,191,36,0.2) 325deg, transparent 330deg 360deg)',
                filter: 'blur(10px)',
              }}
            />
          </div>

          {/* ─── Ethereal Horizon Diamond Light Beam Ray ─── */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1.4, 1], opacity: [0, 1, 0.85] }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="absolute h-[2px] w-full max-w-4xl bg-gradient-to-r from-transparent via-cyan-200 via-amber-200 via-white to-transparent shadow-[0_0_28px_#ffffff,0_0_50px_#38bdf8]"
          />

          {/* ─── Sacred Starlight Embers Floating Upward ─── */}
          {[...Array(18)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full pointer-events-none bg-white"
              style={{
                width: `${(i % 3) * 2 + 2}px`,
                height: `${(i % 3) * 2 + 2}px`,
                left: `${10 + (i * 4.6)}%`,
                bottom: `${15 + ((i * 17) % 65)}%`,
                boxShadow: i % 2 === 0
                  ? '0 0 12px rgba(186, 230, 253, 0.9), 0 0 24px rgba(255, 255, 255, 0.8)'
                  : '0 0 12px rgba(251, 191, 36, 0.9), 0 0 24px rgba(245, 158, 11, 0.7)',
              }}
              animate={{
                y: [-10, -75, -10],
                opacity: [0, 0.95, 0],
                scale: [0.5, 1.4, 0.5],
              }}
              transition={{
                duration: 1.3 + (i * 0.09),
                repeat: Infinity,
                delay: i * 0.06,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* ─── Center Sacred Emblem & Typography Container ─── */}
          <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-2xl">
            
            {/* ─── Sacred Diamond-Shine Logo Medallion ─── */}
            <motion.div
              initial={{ scale: 0.78, opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ scale: 1, opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-4 sm:mb-6 flex items-center justify-center"
            >
              {/* Diamond Glow Aura Ring behind Logo */}
              <div className="absolute -inset-6 sm:-inset-8 rounded-full bg-gradient-to-tr from-amber-500/25 via-cyan-300/20 to-yellow-300/25 blur-2xl pointer-events-none" />

              {/* Pulsing Crystalline Diamond Halo */}
              <span className="absolute inset-0 rounded-full border border-cyan-200/50 animate-ping opacity-35 pointer-events-none" />
              <span className="absolute -inset-3 rounded-full border border-amber-300/40 blur-xs pointer-events-none" />

              {/* Logo Emblem Container with Diamond Sweep Mask */}
              <div className="relative rounded-full overflow-hidden p-2 sm:p-3 flex items-center justify-center">
                {/* Diamond Specular Light Beam sweeping diagonally across the logo */}
                <div className="cot-diamond-shimmer-beam" />

                {/* Requested Logo: D:\City-Of-Truth-Ministries\public\footer-logo.webp */}
                <motion.img
                  src="/footer-logo.webp"
                  alt="City of Truth Ministries Sacred Emblem"
                  draggable={false}
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 3.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-48 sm:w-60 md:w-72 h-36 sm:h-44 md:h-52 object-contain relative z-10 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.75)] drop-shadow-[0_0_40px_rgba(56,189,248,0.45)] drop-shadow-[0_0_65px_rgba(245,158,11,0.6)]"
                  onError={(e) => {
                    // Fallback to existing public logos if needed
                    e.currentTarget.src = '/brand_logo.webp';
                  }}
                />

                {/* ─── 5 Strategic Diamond Star Glints on Medallion Facets ─── */}
                {/* 1. Top Laurel Crest */}
                <DiamondStarGlint
                  size={24}
                  delay={0.2}
                  duration={2.2}
                  style={{ top: '6%', left: '50%', transform: 'translateX(-50%)' }}
                />
                {/* 2. Left Laurel Wing Tip */}
                <DiamondStarGlint
                  size={20}
                  delay={0.65}
                  duration={2.4}
                  style={{ top: '22%', left: '14%' }}
                />
                {/* 3. Right Laurel Wing Tip */}
                <DiamondStarGlint
                  size={20}
                  delay={1.1}
                  duration={2.4}
                  style={{ top: '22%', right: '14%' }}
                />
                {/* 4. Center Dove Glint */}
                <DiamondStarGlint
                  size={18}
                  delay={1.55}
                  duration={2.2}
                  style={{ top: '46%', left: '52%' }}
                />
                {/* 5. Bottom Golden Ribbon Knot */}
                <DiamondStarGlint
                  size={22}
                  delay={0.9}
                  duration={2.5}
                  style={{ bottom: '8%', left: '50%', transform: 'translateX(-50%)' }}
                />
              </div>
            </motion.div>

            {/* ─── Sacred Tamil Heading: Diamond Text Shine ─── */}
            <motion.div
              initial={{ opacity: 0, y: 16, filter: 'blur(10px)', scale: 0.95 }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
              transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex items-center justify-center"
            >
              {/* Diamond Glint on Tamil Heading Top */}
              <DiamondStarGlint
                size={22}
                delay={0.4}
                duration={2.0}
                style={{ top: '-10px', right: '18%' }}
              />

              <h1 className="cot-diamond-text-shine text-4xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-tight drop-shadow-[0_0_24px_rgba(255,255,255,0.7)] drop-shadow-[0_4px_35px_rgba(245,158,11,0.65)]">
                சத்திய நகரம்
              </h1>
            </motion.div>

            {/* ─── English Subtitle: Diamond Shine Typography ─── */}
            <motion.div
              initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-2.5 flex items-center justify-center gap-2 relative"
            >
              {/* Flanking Diamond Sparkles */}
              <Sparkles size={14} className="text-cyan-200 fill-cyan-200/50 animate-pulse drop-shadow-[0_0_8px_#38bdf8]" />

              <p className="cot-diamond-subtext-shine text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-[0.34em] sm:tracking-[0.4em] drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                City of Truth Ministries
              </p>

              <Sparkles size={14} className="text-amber-300 fill-amber-300/50 animate-pulse drop-shadow-[0_0_8px_#fbbf24]" />
            </motion.div>

            {/* ─── Building Discipleship Diamond Badge ─── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-300/40 bg-gradient-to-r from-amber-500/10 via-cyan-400/10 to-amber-500/10 backdrop-blur-md shadow-[0_0_18px_rgba(251,191,36,0.3)]"
            >
              <Flame size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-amber-200">
                Building Discipleship
              </span>
              <Flame size={12} className="text-amber-400 fill-amber-400" />
            </motion.div>

            {/* ─── Sanctuary Mountain Heights Location ─── */}
            <motion.div
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.38, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2 mt-3.5 text-[10px] sm:text-xs font-mono tracking-widest text-amber-300/80 uppercase"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#38bdf8]" />
              <span>Valparai Sanctuary · 2,400m Mountain Heights</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#fbbf24]" />
            </motion.div>
          </div>

          {/* ─── Bottom Diamond Countdown Bar & Skip Instruction ─── */}
          <div className="absolute bottom-6 sm:bottom-8 flex flex-col items-center gap-2 z-10">
            {/* Elegant Diamond Progress Line */}
            <div className="w-36 sm:w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
              <div className="cot-progress-bar h-full w-full bg-gradient-to-r from-amber-400 via-white via-cyan-300 to-amber-300 shadow-[0_0_8px_#ffffff]" />
            </div>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.4 }}
              className="text-[10px] sm:text-xs text-white/60 tracking-wider uppercase font-mono hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Click anywhere to enter sanctuary</span>
              <span className="text-cyan-300">✦</span>
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CinematicOpeningScreen;

