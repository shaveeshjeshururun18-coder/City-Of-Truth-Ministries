import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, QrCode, ShieldCheck, Ticket, CheckCircle2 } from 'lucide-react';
import { ViewState } from '../../types';
import AdmitOneTicket, {
  TICKET_STYLE,
  TICKET_LAYOUT,
} from '../ui/admit-one-ticket';

interface SectionProps {
  setView: (view: ViewState) => void;
}

interface ThemePalette {
  id: string;
  name: string;
  colorBack: string;
  colorFront: string;
  colorHighlight: string;
  inkColor: string;
  watermarkColor: string;
  shape: string;
  ambientGlow: string;
  accentText: string;
  accentGradient: string;
  borderTone: string;
  bgGradient: string;
  swatchColor: string;
}

// Living Sapphire set as Default (first in array), cycling every 1 minute
const PALETTES: ThemePalette[] = [
  {
    id: 'living-sapphire',
    name: 'Living Sapphire',
    colorBack: '#0369a1',
    colorFront: '#bae6fd',
    colorHighlight: '#38bdf8',
    inkColor: '#06283d',
    watermarkColor: '#e0f2fe',
    shape: 'ripple',
    ambientGlow: 'rgba(56, 189, 248, 0.25)',
    accentText: 'text-sky-400',
    accentGradient: 'from-sky-300 via-sky-100 to-cyan-400',
    borderTone: 'border-sky-500/30',
    bgGradient: 'from-[#031526] via-[#06243f] to-[#020b14]',
    swatchColor: '#38bdf8',
  },
  {
    id: 'solar-amber',
    name: 'Sacred Amber',
    colorBack: '#cf4b08',
    colorFront: '#ffe3c2',
    colorHighlight: '#f59e0b',
    inkColor: '#3d1602',
    watermarkColor: '#fed7aa',
    shape: 'warp',
    ambientGlow: 'rgba(245, 158, 11, 0.22)',
    accentText: 'text-amber-400',
    accentGradient: 'from-amber-300 via-amber-100 to-yellow-400',
    borderTone: 'border-amber-500/30',
    bgGradient: 'from-[#170a02] via-[#241004] to-[#0c0501]',
    swatchColor: '#f59e0b',
  },
  {
    id: 'royal-amethyst',
    name: 'Royal Amethyst',
    colorBack: '#4c1d95',
    colorFront: '#f5d0fe',
    colorHighlight: '#c084fc',
    inkColor: '#240847',
    watermarkColor: '#fae8ff',
    shape: 'swirl',
    ambientGlow: 'rgba(192, 132, 252, 0.24)',
    accentText: 'text-fuchsia-400',
    accentGradient: 'from-fuchsia-300 via-purple-100 to-violet-400',
    borderTone: 'border-fuchsia-500/30',
    bgGradient: 'from-[#120726] via-[#1e0b3d] to-[#0a0314]',
    swatchColor: '#c084fc',
  },
  {
    id: 'eden-emerald',
    name: 'Eden Emerald',
    colorBack: '#047857',
    colorFront: '#a7f3d0',
    colorHighlight: '#34d399',
    inkColor: '#022418',
    watermarkColor: '#d1fae5',
    shape: 'wave',
    ambientGlow: 'rgba(52, 211, 153, 0.22)',
    accentText: 'text-emerald-400',
    accentGradient: 'from-emerald-300 via-teal-100 to-green-400',
    borderTone: 'border-emerald-500/30',
    bgGradient: 'from-[#021c14] via-[#042d20] to-[#010e0a]',
    swatchColor: '#34d399',
  },
  {
    id: 'covenant-crimson',
    name: 'Covenant Crimson',
    colorBack: '#9f1239',
    colorFront: '#fecdd3',
    colorHighlight: '#fb7185',
    inkColor: '#3b0413',
    watermarkColor: '#ffe4e6',
    shape: 'sphere',
    ambientGlow: 'rgba(251, 113, 133, 0.22)',
    accentText: 'text-rose-400',
    accentGradient: 'from-rose-300 via-rose-100 to-red-400',
    borderTone: 'border-rose-500/30',
    bgGradient: 'from-[#21040d] via-[#380818] to-[#120207]',
    swatchColor: '#fb7185',
  },
  {
    id: 'shekinah-gold',
    name: 'Shekinah Gold',
    colorBack: '#854d0e',
    colorFront: '#fef08a',
    colorHighlight: '#eab308',
    inkColor: '#3d1d02',
    watermarkColor: '#fef9c3',
    shape: 'dots',
    ambientGlow: 'rgba(234, 179, 8, 0.25)',
    accentText: 'text-yellow-400',
    accentGradient: 'from-amber-200 via-yellow-100 to-amber-400',
    borderTone: 'border-yellow-500/30',
    bgGradient: 'from-[#1c1202] via-[#2e1d03] to-[#0d0901]',
    swatchColor: '#eab308',
  },
];

// Color rotates every 1 minute (60,000 ms)
const ROTATION_INTERVAL_MS = 60 * 1000;

export const EntrustCardPreview: React.FC<SectionProps> = ({ setView }) => {
  const [paletteIndex, setPaletteIndex] = useState(0);

  const currentPalette = PALETTES[paletteIndex];

  // Automatic 1-minute color rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setPaletteIndex((curr) => (curr + 1) % PALETTES.length);
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className={`py-24 relative overflow-hidden transition-colors duration-1000 bg-gradient-to-br ${currentPalette.bgGradient}`}
    >
      {/* Dynamic Theme Glow Background */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse 75% 60% at 75% 45%, ${currentPalette.ambientGlow} 0%, transparent 70%),
                       radial-gradient(ellipse 55% 45% at 20% 65%, ${currentPalette.ambientGlow} 0%, transparent 65%)`,
        }}
      />

      {/* Stardust Sacred Texture Overlay */}
      <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />

      {/* Top & Bottom Subtle Shimmer Border Dividers */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] opacity-40 transition-colors duration-1000"
        style={{
          background: `linear-gradient(90deg, transparent, ${currentPalette.swatchColor}, transparent)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px] opacity-30 transition-colors duration-1000"
        style={{
          background: `linear-gradient(90deg, transparent, ${currentPalette.swatchColor}, transparent)`,
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Heading, Badges, Features & CTAs */}
          <div className="lg:col-span-6 space-y-7">
            {/* Top Pill: Clean Sacred Identity */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[11px] font-black tracking-widest uppercase border backdrop-blur-md transition-all duration-700 bg-white/5"
              style={{
                borderColor: `${currentPalette.swatchColor}40`,
                color: '#fff',
              }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse transition-colors duration-500"
                style={{ backgroundColor: currentPalette.swatchColor }}
              />
              <span className="flex items-center gap-1.5 font-bold">
                <Ticket size={13} className="text-white/80" /> OFFICIAL ADMIT ENTRUST PASS
              </span>
              <span className="text-white/40">•</span>
              <span
                className="font-semibold transition-colors duration-500"
                style={{ color: currentPalette.swatchColor }}
              >
                SACRED COVENANT
              </span>
            </motion.div>

            {/* Main Headline with Harmonic Dynamic Gradient */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-white leading-[1.05] tracking-tight">
              Your Sacred{' '}
              <span
                className={`text-transparent bg-clip-text bg-gradient-to-r ${currentPalette.accentGradient} italic font-light drop-shadow-sm transition-all duration-700`}
              >
                Entrust Card
              </span>{' '}
              Awaits
            </h2>

            {/* Description */}
            <p className="text-lg text-white/80 font-light leading-relaxed max-w-xl">
              Receive your official City of Truth digital credential and admit-one sacred pass. Featuring an interactive
              procedural WebGL shader whose liturgical aura seamlessly harmonizes across sacred spectrums.
            </p>

            {/* Feature Badges: Official Value */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl">
              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                <ShieldCheck size={18} className="mb-1 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Valid Member</h4>
                <p className="text-[10px] text-white/60 leading-tight mt-0.5">Sanctuary & Valparai Verified</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                <Sparkles size={18} className="mb-1" style={{ color: currentPalette.swatchColor }} />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Shader Cloth</h4>
                <p className="text-[10px] text-white/60 leading-tight mt-0.5">Live WebGL Dithered Art</p>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                <QrCode size={18} className="mb-1 text-sky-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Instant QR</h4>
                <p className="text-[10px] text-white/60 leading-tight mt-0.5">Rapid Check-in & Audio</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => setView(ViewState.ID_CARD)}
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-sans font-bold text-sm tracking-wide text-white overflow-hidden transition-all duration-300 shadow-xl active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${currentPalette.colorHighlight}, ${currentPalette.colorBack})`,
                  boxShadow: `0 12px 32px -4px ${currentPalette.ambientGlow}`,
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles size={18} className="text-white shrink-0 animate-spin-slow" />
                  <span>Claim Your Entrust Card Now</span>
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>

              <button
                type="button"
                onClick={() => setView(ViewState.VERIFY_ID)}
                className="px-6 py-4 rounded-2xl font-bold text-sm text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 transition-all duration-200"
              >
                Verify Existing Card
              </button>
            </div>
          </div>

          {/* Right Column: Admit-One Ticket Interactive Showcase */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
            {/* Ambient Aura Orb behind the Ticket */}
            <div
              className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-[120px] pointer-events-none transition-all duration-1000 -z-0"
              style={{
                backgroundColor: currentPalette.swatchColor,
                opacity: 0.35,
              }}
            />

            {/* Subtle Guidance Pill */}
            <div className="flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[11px] text-white/80 font-medium">
              <Sparkles size={12} style={{ color: currentPalette.swatchColor }} />
              <span>Hover & move cursor to tilt card with 3D glare</span>
            </div>

            {/* Ticket Card Container with Responsive Scaler */}
            <div className="w-full flex justify-center items-center py-2 relative z-10">
              <div
                className="w-full flex justify-center overflow-visible"
                style={{
                  maxWidth: 620,
                }}
              >
                <div
                  className="origin-center transition-transform duration-300"
                  style={{
                    transform: 'scale(min(1, calc((100vw - 48px) / 640)))',
                  }}
                >
                  <AdmitOneTicket
                    name="SACRED ENTRUST PASS"
                    presenter="CITY OF TRUTH MINISTRIES PRESENTS"
                    event="OFFICIAL WORSHIPPER CREDENTIAL · SACRED COVENANT"
                    venue="SANCTUARY OF TRUTH · VALPARAI"
                    dates="SEASON 2026 · ADMIT TO ALL MINISTRIES"
                    stubText="ENTRUST · 2026"
                    watermark="COT"
                    width={600}
                    layout={{
                      ...TICKET_LAYOUT,
                      inkColor: currentPalette.inkColor,
                      watermarkColor: currentPalette.watermarkColor,
                    }}
                    texture={{
                      ...TICKET_STYLE.texture,
                      colorBack: currentPalette.colorBack,
                      colorFront: currentPalette.colorFront,
                      colorHighlight: currentPalette.colorHighlight,
                      shape: currentPalette.shape,
                      speed: 0.45,
                    }}
                    gradient={{
                      ...TICKET_STYLE.gradient,
                      colorLight: currentPalette.colorFront,
                      colorMid: currentPalette.colorHighlight,
                      colorDark: currentPalette.colorBack,
                    }}
                    tilt={{
                      maxTilt: 11,
                      glare: 0.24,
                      scale: 1.02,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Clean Minimal Badge under Ticket */}
            <div className="mt-5 flex items-center justify-between w-full max-w-[600px] px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-xs text-white/75">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span className="font-semibold text-white">Sanctuary of Truth · Valparai</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentPalette.swatchColor }} />
                <span className="text-[11px] font-mono text-white/60">COT-2026-VALP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};