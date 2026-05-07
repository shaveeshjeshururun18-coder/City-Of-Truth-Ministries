import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles, Book } from 'lucide-react';


import { InteractiveMenorah } from './InteractiveMenorah';



interface GoldenMenorahProps {
  onPreviewClick?: () => void;
}

export const GoldenMenorah: React.FC<GoldenMenorahProps> = ({ onPreviewClick }) => {
  const menorahVideoSrc = '/menorah/menorah-home.mp4';

  return (
    <section className="min-h-screen bg-brand-950 pt-32 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Column - Text Content & Button */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-amber-400 mb-4 lg:mb-8">
              <Sparkles size={16} />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] sm:tracking-widest">Spiritual Sanctuary</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4 lg:mb-8 leading-tight">
              Divine Shrine <br />
              <span className="block text-xl sm:text-3xl md:text-4xl mt-2 sm:mt-3 font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 drop-shadow-lg tracking-wide leading-snug sm:leading-relaxed py-1">தெய்வீக அருள்மிகு பொன் குத்துவிளக்கு திருத்தலம்</span>
            </h1>
            <p className="text-brand-100/70 text-base sm:text-lg leading-relaxed mb-3 lg:mb-4 max-w-xl">
              Symbolizing the eternal presence of God, the Menorah stands as a beacon of Truth. This Menorah Temple is going to be established in Valparai, serving as a sanctuary of light and grace for all nations.
            </p>
            <p className="text-amber-300 text-lg sm:text-xl md:text-2xl font-bold mb-4 lg:mb-10 block drop-shadow-md tracking-wide">
              இது வால்பாறையில் நிறுவப்பட உள்ளது
            </p>

            {/* Visit Menorah Page Button - Appears after image on mobile, before on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-start pt-2 lg:pt-6 order-2 lg:order-none"
            >
              <button
                onClick={onPreviewClick}
                className="group relative w-full sm:w-auto px-5 sm:px-8 py-3 sm:py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl overflow-hidden shadow-[0_20px_40px_-18px_rgba(249,115,22,0.65)] hover:shadow-[0_28px_48px_-16px_rgba(249,115,22,0.82)] border border-amber-200/40 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center gap-3 sm:gap-4 font-bold text-white tracking-[0.1em] sm:tracking-[0.15em] uppercase text-[11px] sm:text-sm md:text-base">
                  <span>Visit Golden Menorah Temple</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <Book size={14} className="text-white sm:w-4 sm:h-4" />
                  </div>
                </div>
              </button>
            </motion.div>
          </motion.div>

          {/* Right Column - Flag Image */}
          <div className="relative h-[400px] lg:h-[600px] flex items-center justify-center order-1 lg:order-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="w-full max-w-lg"
            >
              {/* Full Flag Image Display */}
              <div
                className="relative w-full aspect-[4/3] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-amber-500/20 cursor-pointer group"
                onClick={onPreviewClick}
              >
                <video
                  src={menorahVideoSrc}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  controls
                  controlsList="nodownload noplaybackrate"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="px-6 py-3 bg-amber-500 text-white rounded-full font-bold text-sm uppercase tracking-wider shadow-lg">
                        Visit Menorah Page
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
