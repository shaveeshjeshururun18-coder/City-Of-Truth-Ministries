import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export type HeavenlyAura = 'gold' | 'amber' | 'sapphire' | 'emerald' | 'amethyst' | 'crimson';

interface HeavenlySectionRevealProps {
  children: React.ReactNode;
  aura?: HeavenlyAura;
  className?: string;
  id?: string;
  delay?: number;
}

const AURA_CONFIGS: Record<HeavenlyAura, {
  beamGradient: string;
  glowColor: string;
  accentBorder: string;
}> = {
  gold: {
    beamGradient: 'from-transparent via-amber-300/40 via-yellow-200/50 to-transparent',
    glowColor: 'rgba(245, 158, 11, 0.12)',
    accentBorder: 'rgba(245, 158, 11, 0.20)',
  },
  amber: {
    beamGradient: 'from-transparent via-amber-400/40 via-orange-300/45 to-transparent',
    glowColor: 'rgba(217, 119, 6, 0.12)',
    accentBorder: 'rgba(245, 158, 11, 0.22)',
  },
  sapphire: {
    beamGradient: 'from-transparent via-sky-300/40 via-blue-200/50 to-transparent',
    glowColor: 'rgba(56, 189, 248, 0.12)',
    accentBorder: 'rgba(56, 189, 248, 0.22)',
  },
  emerald: {
    beamGradient: 'from-transparent via-emerald-300/40 via-teal-200/45 to-transparent',
    glowColor: 'rgba(52, 211, 153, 0.12)',
    accentBorder: 'rgba(16, 185, 129, 0.20)',
  },
  amethyst: {
    beamGradient: 'from-transparent via-fuchsia-300/40 via-purple-200/50 to-transparent',
    glowColor: 'rgba(192, 132, 252, 0.12)',
    accentBorder: 'rgba(168, 85, 247, 0.20)',
  },
  crimson: {
    beamGradient: 'from-transparent via-rose-300/40 via-pink-200/45 to-transparent',
    glowColor: 'rgba(244, 63, 94, 0.12)',
    accentBorder: 'rgba(244, 63, 94, 0.20)',
  },
};

/**
 * HeavenlySectionReveal
 * 
 * Provides an ultra-fast, ethereal, buttery-smooth reveal for landing page sections:
 * - Apple/Linear inspired cubic-bezier easing: [0.16, 1, 0.3, 1]
 * - Blur-to-focus celestial materialize effect: filter: blur(8px) -> blur(0px)
 * - Shekinah God Ray sweep across top horizon
 * - Hardware-accelerated with GPU transforms
 */
export const HeavenlySectionReveal: React.FC<HeavenlySectionRevealProps> = ({
  children,
  aura = 'gold',
  className = '',
  id,
  delay = 0,
}) => {
  const prefersReduced = useReducedMotion();
  const config = AURA_CONFIGS[aura] || AURA_CONFIGS.gold;

  if (prefersReduced) {
    return (
      <section id={id} className={`relative ${className}`}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      initial={{
        opacity: 0,
        y: 26,
        filter: 'blur(8px)',
        scale: 0.99,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        scale: 1,
      }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ willChange: 'transform, opacity, filter' }}
      className={`relative overflow-hidden content-auto ${className}`}
    >
      {/* ─── Heavenly Shekinah Light Beam Sweep at Horizon ─── */}
      <motion.div
        initial={{ x: '-100%', opacity: 0 }}
        whileInView={{ x: '100%', opacity: [0, 1, 0] }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{
          duration: 1.1,
          delay: delay + 0.08,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${config.beamGradient} pointer-events-none z-30`}
        style={{
          boxShadow: `0 0 16px ${config.glowColor}, 0 0 32px ${config.glowColor}`,
        }}
      />

      {/* ─── Soft Ethereal Radial Ambient Aura ─── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[350px] rounded-full blur-[130px] pointer-events-none opacity-40 mix-blend-screen -z-10"
        style={{ backgroundColor: config.glowColor }}
      />

      {children}
    </motion.section>
  );
};

export default HeavenlySectionReveal;
