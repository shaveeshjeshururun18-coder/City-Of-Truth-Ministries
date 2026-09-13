import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Globe, Compass, ExternalLink, Calendar } from 'lucide-react';
import { ViewState } from '../../types';

interface HeavensDeclarePreviewSectionProps {
  setView: (view: ViewState) => void;
}

export const HeavensDeclarePreviewSection: React.FC<HeavensDeclarePreviewSectionProps> = ({ setView }) => {
  return (
    <section className="py-20 md:py-28 bg-[#040d1a] text-white relative overflow-hidden border-t border-b border-cyan-500/20">
      {/* Ambient Celestial Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
          
          {/* Left Column: Text & Scriptures */}
          <div className="lg:col-span-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold uppercase tracking-[0.25em]"
            >
              <Sparkles size={13} className="text-cyan-400" />
              <span>Psalm 19:1 • Genesis 1:14</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight"
            >
              The Heavens Declare{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400">
                The Glory of God
              </span>
              <span className="block text-xl md:text-2xl mt-2 text-cyan-200/70 font-normal font-sans tracking-normal">
                வானங்கள் தேவனுடைய மகிமையை வெளிப்படுத்துகிறது
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="text-slate-300 text-sm md:text-base leading-relaxed"
            >
              Step into a cinematic planetary exploration of the solar realm and celestial order.
              From Earth’s life-giving sanctuary to the fiery clouds of Venus and the deserts of Mars,
              discover how every orbit serves as signs, appointed seasons (<em>Moedim</em>), and divine witness.
            </motion.p>

            {/* Quick Feature Bullets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="grid grid-cols-2 gap-4 pt-2"
            >
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
                <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Globe size={13} /> Earth & Planetary Realm
                </div>
                <div className="text-[12px] text-slate-400">
                  Interactive looping video orbits of Earth, Venus, and Mars.
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
                <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Calendar size={13} /> Sacred Time & Moedim
                </div>
                <div className="text-[12px] text-slate-400">
                  Grounding astronomical cycles into the Biblical Hebrew calendar.
                </div>
              </div>
            </motion.div>

            {/* Call to Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.25 }}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <button
                type="button"
                onClick={() => setView(ViewState.HEAVENS_DECLARE)}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(56,189,248,0.4)] hover:shadow-[0_0_35px_rgba(56,189,248,0.6)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>LAUNCH CELESTIAL EXPERIENCE</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => setView(ViewState.ABOUT)}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-cyan-200 text-xs font-semibold tracking-wider transition-all"
              >
                <Compass size={15} />
                <span>VIEW IN HEBREW RESOURCES</span>
              </button>
            </motion.div>
          </div>

          {/* Right Column: Interactive Live Preview Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-[2.5rem] p-2 bg-gradient-to-b from-cyan-500/30 via-slate-800/40 to-cyan-500/10 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] group overflow-hidden">
              
              {/* Preview Container */}
              <div className="relative w-full aspect-[16/10] rounded-[2rem] overflow-hidden bg-slate-950 flex flex-col justify-end p-6 cursor-pointer"
                   onClick={() => setView(ViewState.HEAVENS_DECLARE)}>
                
                {/* Background Earth Still / Video Poster */}
                <img
                  src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_508c64b8-a31e-4290-bdfc-1187df70e0a6.webp"
                  alt="Earth from Space"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Floating Preview Planets */}
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full opacity-90 group-hover:-translate-x-1 transition-transform">
                  <img
                    src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202012_640b239a-d08a-4200-adb2-741bbe129ac8.webp"
                    alt="Venus"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                  />
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] font-serif uppercase tracking-widest text-amber-200">Venus</span>
                </div>

                <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full opacity-90 group-hover:translate-x-1 transition-transform">
                  <img
                    src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202018_3d559490-f613-4ed7-a3bb-3b7e9fc90fb8.webp"
                    alt="Mars"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                  />
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] font-serif uppercase tracking-widest text-red-200">Mars</span>
                </div>

                {/* Overlay Badge & Title */}
                <div className="relative z-10 text-center">
                  <span className="inline-block text-[11px] font-serif uppercase tracking-[0.3em] text-cyan-300 font-bold mb-1">
                    Planet Realm
                  </span>
                  <h3 className="text-3xl md:text-4xl font-serif text-white tracking-wide font-normal mb-2 drop-shadow-lg">
                    EARTH • הָאָרֶץ
                  </h3>
                  <div className="w-16 h-0.5 bg-cyan-400 mx-auto mb-3 rounded-full" />
                  <p className="text-xs text-slate-300 max-w-sm mx-auto line-clamp-2">
                    "The earth is the LORD’s and the fullness thereof." — Psalm 24:1
                  </p>
                </div>

                {/* Hover Play Prompt */}
                <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium flex items-center gap-1.5 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                  <span>Interactive 3-Planet Switcher</span>
                  <ExternalLink size={12} />
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
