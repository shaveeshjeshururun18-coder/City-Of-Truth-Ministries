import React from 'react';
import { motion } from 'framer-motion';
import {
  Youtube,
  BookOpen,
  Mountain,
  Flame,
  Bot,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  Play,
  Volume2
} from 'lucide-react';
import { ViewState } from '../../types';

interface MinistryBentoGridProps {
  setView: (view: ViewState) => void;
  navigate: (path: string) => void;
  youtubeLink?: string;
}

export const MinistryBentoGrid: React.FC<MinistryBentoGridProps> = ({
  setView,
  navigate,
  youtubeLink = 'https://www.youtube.com/@cityoftruthministries'
}) => {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#05040a] via-[#090614] to-[#05040a] text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-widest backdrop-blur-md"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>DIVINE PILLARS OF TRUTH</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-tight"
          >
            A Sanctuary of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500 italic font-light">
              Living Mysteries
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/70 text-base sm:text-lg font-light leading-relaxed"
          >
            Explore our anointed broadcast studio, deep ancient Hebrew word wisdom, the mountain prayer sanctuary in Valparai, and the prophetic Menorah.
          </motion.p>
        </div>

        {/* ─── Bento Grid Layout ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* Card 1: Broadcasting Hub (Wide 7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 group relative rounded-[2.5rem] p-8 sm:p-10 bg-gradient-to-br from-[#180909] via-[#100608] to-[#080204] border border-red-500/20 overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col justify-between"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/15 rounded-full blur-[90px] pointer-events-none group-hover:bg-red-600/25 transition-all duration-700" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-[11px] font-bold tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  YouTube Live Streaming
                </div>
                <span className="text-white/40 text-xs font-mono">BROADCAST · 2026</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif font-black text-white leading-tight">
                Experience Anointed Sermons <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-300">
                  Broadcast Direct from Sanctuary
                </span>
              </h3>

              <p className="text-white/70 text-sm leading-relaxed max-w-xl">
                Tune in to high-fidelity spiritual teachings, weekly Shabbat broadcasts, and Hebrew mystery revelations. Archived for your spiritual enlightenment and transformation.
              </p>
            </div>

            {/* Bottom Row: Stats & Action */}
            <div className="relative z-10 pt-8 mt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-black text-red-400 font-mono">100+</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/50">Recorded Messages</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <p className="text-2xl font-black text-amber-400 font-mono">Weekly</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/50">Live Sermons</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.open(youtubeLink, '_blank', 'noopener,noreferrer')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Youtube size={17} />
                <span>Watch on YouTube</span>
                <ArrowUpRight size={15} />
              </button>
            </div>
          </motion.div>

          {/* Card 2: Ancient Hebrew Alphabet & Word Hub (5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            onClick={() => navigate('/hebrew-alphabet')}
            className="lg:col-span-5 group relative rounded-[2.5rem] p-8 sm:p-10 bg-gradient-to-br from-[#0b1026] via-[#070b1a] to-[#04060e] border border-sky-500/25 overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col justify-between cursor-pointer hover:border-sky-400/50 transition-all duration-300"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-sky-500/15 rounded-full blur-[80px] pointer-events-none group-hover:bg-sky-500/25 transition-all duration-700" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-[11px] font-bold tracking-wider uppercase">
                  <BookOpen size={12} /> Ancient Torah Wisdom
                </span>
                <ArrowUpRight size={18} className="text-white/40 group-hover:text-sky-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>

              <h3 className="text-2xl font-serif font-black text-white leading-tight">
                Hebrew Alphabet & Roots
              </h3>

              <p className="text-white/70 text-sm leading-relaxed">
                Explore the 22 holy living letters from Aleph (א) to Tav (ת), accompanied by native pronunciation audio and Gematria insights.
              </p>
            </div>

            {/* Decorative Hebrew Glyph Matrix Display */}
            <div className="relative z-10 pt-6">
              <div className="grid grid-cols-4 gap-2 text-center">
                {['א', 'ב', 'ג', 'ת'].map((letter, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 group-hover:border-sky-400/30 group-hover:bg-sky-500/10 transition-all"
                  >
                    <span className="text-2xl font-serif font-bold text-sky-200">{letter}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-sky-300 font-bold">
                <span>Interactive Audio Studio</span>
                <span className="group-hover:translate-x-1 transition-transform">Explore Hub →</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Valparai Mountain Presence (4 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            onClick={() => setView(ViewState.ABOUT_VALPARAI)}
            className="lg:col-span-4 group relative rounded-[2.5rem] p-8 bg-gradient-to-br from-[#061e12] via-[#04140c] to-[#020b06] border border-emerald-500/25 overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col justify-between cursor-pointer hover:border-emerald-400/50 transition-all duration-300 min-h-[320px]"
          >
            {/* Background image preview with darkened gradient */}
            <img
              src="/valparai-grass-hills.jpg"
              alt="Valparai Hills"
              className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

            <div className="relative z-10 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold tracking-wider uppercase backdrop-blur-md">
                <Mountain size={12} /> Valparai Sanctuary
              </span>
              <h3 className="text-2xl font-serif font-black text-white leading-tight">
                3,500 Feet Above The Hills
              </h3>
              <p className="text-white/70 text-xs leading-relaxed">
                A serene prayer sanctuary nestled amidst the clouds and lush tea slopes of the Western Ghats.
              </p>
            </div>

            <div className="relative z-10 pt-4 flex items-center justify-between text-xs text-emerald-300 font-bold">
              <span>View Sanctuary Story</span>
              <span className="group-hover:translate-x-1 transition-transform">Explore →</span>
            </div>
          </motion.div>

          {/* Card 4: Prophetic Golden Menorah (4 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            onClick={() => setView(ViewState.GOLDEN_MENORAH)}
            className="lg:col-span-4 group relative rounded-[2.5rem] p-8 bg-gradient-to-br from-[#241503] via-[#170e02] to-[#0a0601] border border-amber-500/30 overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col justify-between cursor-pointer hover:border-amber-400/60 transition-all duration-300 min-h-[320px]"
          >
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-[70px] pointer-events-none group-hover:bg-amber-500/35 transition-all duration-500" />

            <div className="relative z-10 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold tracking-wider uppercase backdrop-blur-md">
                <Flame size={12} /> Seven Lamps of Fire
              </span>
              <h3 className="text-2xl font-serif font-black text-white leading-tight">
                Prophetic Menorah
              </h3>
              <p className="text-white/70 text-xs leading-relaxed">
                The golden 7-branch candlestick revelation, the eternal Shekinah light, and the covenant flag of COT.
              </p>
            </div>

            <div className="relative z-10 pt-4 flex items-center justify-between text-xs text-amber-300 font-bold">
              <span>Enter Menorah Chamber</span>
              <span className="group-hover:translate-x-1 transition-transform">Reveal →</span>
            </div>
          </motion.div>

          {/* Card 5: Divine Assistant AI Companion (4 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
            onClick={() => setView(ViewState.AI)}
            className="lg:col-span-4 group relative rounded-[2.5rem] p-8 bg-gradient-to-br from-[#160a2b] via-[#0e061c] to-[#06020c] border border-fuchsia-500/25 overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col justify-between cursor-pointer hover:border-fuchsia-400/50 transition-all duration-300 min-h-[320px]"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/15 rounded-full blur-[70px] pointer-events-none group-hover:bg-fuchsia-500/30 transition-all duration-500" />

            <div className="relative z-10 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-300 text-[11px] font-bold tracking-wider uppercase backdrop-blur-md">
                <Bot size={12} /> Divine AI Assistant
              </span>
              <h3 className="text-2xl font-serif font-black text-white leading-tight">
                Spiritual Intelligence
              </h3>
              <p className="text-white/70 text-xs leading-relaxed">
                Scriptural answers, study guidance, and personalized biblical questions answered with grounded sacred truth.
              </p>
            </div>

            <div className="relative z-10 pt-4 flex items-center justify-between text-xs text-fuchsia-300 font-bold">
              <span>Open Divine AI</span>
              <span className="group-hover:translate-x-1 transition-transform">Chat Now →</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MinistryBentoGrid;
