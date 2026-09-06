"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Maximize2, X, Eye, BookOpen, Pause, Play } from 'lucide-react';

export interface LogoItem {
  id: string;
  title: string;
  tamilTitle: string;
  category: string;
  src: string;
  badgeColor: string;
  isBook?: boolean;
  desc: string;
}

export const EMBLEM_ITEMS: LogoItem[] = [
  {
    id: "cot-menorah-seal",
    title: "Sacred Menorah Seal",
    tamilTitle: "பரிசுத்த விளக்குத்தண்டு பிரதான முத்திரை",
    category: "Master Seal",
    src: "/logos/20250212_202819.png",
    badgeColor: "border-amber-400/40 text-amber-300 bg-amber-500/10",
    desc: "The official sacred Menorah emblem of City of Truth Ministries, symbolizing the sevenfold Spirit of Yahweh, divine apostolic authority, and eternal uncreated light.",
  },
  {
    id: "cot-crest",
    title: "City of Truth Apostolic Crest",
    tamilTitle: "சத்திய நகரின் அப்போஸ்தலிக்க சின்னம்",
    category: "Ministry Crest",
    src: "/logos/c058e7e1-e3bc-417c-8553-f86b4217c7bc.png",
    badgeColor: "border-blue-400/40 text-blue-300 bg-blue-500/10",
    desc: "Apostolic heraldic crest embodying the pillar and foundation of truth, the covenant, and righteousness declared across the nations.",
  },
  {
    id: "covenant-mark",
    title: "Celestial Covenant Mark",
    tamilTitle: "வானக உடன்படிக்கையின் ஜோதி",
    category: "Covenant Seal",
    src: "/logos/chatgpt-image-jan-22.png",
    badgeColor: "border-indigo-400/40 text-indigo-300 bg-indigo-500/10",
    desc: "The celestial signet representing heavenly alignment, divine priesthood order, and sacred devotion to Yahweh.",
  },
  {
    id: "cot-gold-signature",
    title: "City of Truth Gold Signature",
    tamilTitle: "பொன்மயமான ராஜ முத்திரை",
    category: "Master Brand",
    src: "/logos/file_00000000bee08211b89fc359d36cbf5c.png",
    badgeColor: "border-amber-500/50 text-amber-300 bg-amber-500/15",
    desc: "Embossed golden signature emblem adorning official pastoral convocations, solemn decrees, and ministerial letters.",
  },
  {
    id: "hebrew-crown",
    title: "Hebrew Crown of Righteousness",
    tamilTitle: "நீதியின் எபிரேய கிரீடம் (கெத்தெர்)",
    category: "Hebrew Wisdom",
    src: "/logos/file_00000000e60081fb99da2bd76c7f3ad7.png",
    badgeColor: "border-yellow-400/40 text-yellow-300 bg-yellow-500/10",
    desc: "Keter (Holy Crown) representing royal priesthood, sanctified wisdom, and the incorruptible crown of life promised to the faithful.",
  },
  {
    id: "truth-wings",
    title: "Wings of Truth & Refuge",
    tamilTitle: "சத்தியத்தின் தெய்வீகச் செட்டைகள்",
    category: "Apostolic Wings",
    src: "/logos/file_00000000f18481fab3d5fa14e5badfc0.png",
    badgeColor: "border-cyan-400/40 text-cyan-300 bg-cyan-500/10",
    desc: "Inspired by Psalm 91:4 — 'He will cover you with His feathers, and under His wings you will find refuge.' Symbol of divine sanctuary and peace.",
  },
  {
    id: "sacred-shield",
    title: "Shield of Faith & Defense",
    tamilTitle: "விசுவாசத்தின் பாதுகாப்பு கேடகம்",
    category: "Spiritual Armor",
    src: "/logos/file_0000000057d48211a3bd31f00dd037b8.png",
    badgeColor: "border-rose-400/40 text-rose-300 bg-rose-500/10",
    desc: "The steadfast shield of spiritual armor extinguishing every deceitful dart and standing immovable upon the rock of Truth.",
  },
  {
    id: "covenant-star",
    title: "Covenant Star of David",
    tamilTitle: "தாவீதின் உடன்படிக்கை நட்சத்திரம்",
    category: "Biblical Heritage",
    src: "/logos/file_00000000277082119d8a6446847f2630.png",
    badgeColor: "border-sky-400/40 text-sky-300 bg-sky-500/10",
    desc: "Sacred sign of the seed of David, the prophetic lineage, and covenant fulfillment in our Messiah.",
  },
  {
    id: "athuma-nanri-paligal-wrapper",
    title: "ஆத்தும நன்றி பலிகள்",
    tamilTitle: "Soul Thanksgiving Sacrifices (Book Wrapper)",
    category: "Sacred Publication",
    src: "/logos/wrapper.jpg",
    badgeColor: "border-amber-400/50 text-amber-200 bg-amber-500/20",
    isBook: true,
    desc: "The sacred publication wrapper for 'ஆத்தும நன்றி பலிகள்' (Soul Thanksgiving Sacrifices) — containing holy prayers, deep confessions of gratitude, biblical praises, and prophetic spiritual sacrifices.",
  },
];

export function InfiniteLogoScroll() {
  const [selectedItem, setSelectedItem] = useState<LogoItem | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Triple the items for a seamless continuous infinite scroll on all screen widths
  const scrollItems = [...EMBLEM_ITEMS, ...EMBLEM_ITEMS, ...EMBLEM_ITEMS];

  return (
    <section 
      aria-label="City of Truth Sacred Emblems and Publications"
      className="relative w-full py-12 md:py-16 overflow-hidden bg-gradient-to-b from-[#060812] via-[#090e24] to-[#04060e] border-t border-b border-amber-500/20 shadow-2xl select-none"
    >
      {/* Background Wrapper Texture */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay bg-cover bg-center filter blur-[1px]"
        style={{
          backgroundImage: `url('/logos/wrapper.jpg')`,
        }}
      />

      {/* Ambient Lighting Flares */}
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-300 text-xs font-mono tracking-widest uppercase mb-2">
              <Sparkles size={13} className="text-amber-400 animate-pulse" />
              <span>Official Heraldry & Publications</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-white tracking-tight">
              Covenant Emblems & Sacred Archive
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-light mt-1 max-w-xl">
              Continuous infinite showcase of City of Truth seals, apostolic crests, and holy publication wrappers.
            </p>
          </div>

          {/* Pause / Resume Controls */}
          <button
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? "Resume scroll" : "Pause scroll"}
            className="shrink-0 flex items-center gap-2 text-xs font-mono tracking-wider px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer shadow-sm"
          >
            {isPaused ? (
              <>
                <Play size={12} className="text-emerald-400 fill-emerald-400" />
                <span>Resume Scroll</span>
              </>
            ) : (
              <>
                <Pause size={12} className="text-amber-400 fill-amber-400" />
                <span>Pause Scroll</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Infinite Horizontal Marquee Container with Gradient Edge Fades */}
      <div 
        className="relative z-10 w-full overflow-hidden py-3"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className={`flex items-center gap-5 sm:gap-6 w-max ${
            isPaused ? "[animation-play-state:paused]" : ""
          }`}
          style={{
            animation: "cotInfiniteMarquee 42s linear infinite",
          }}
        >
          {scrollItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              onClick={() => setSelectedItem(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedItem(item);
                }
              }}
              className={`group relative shrink-0 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                item.isBook 
                  ? "w-[260px] sm:w-[300px] h-[120px]" 
                  : "w-[220px] sm:w-[250px] h-[120px]"
              }`}
            >
              {/* Glassmorphic Card Body */}
              <div 
                className={`relative w-full h-full rounded-2xl p-3 flex items-center gap-3.5 border bg-gradient-to-br from-[#0c1024]/95 via-[#070a18]/95 to-[#03050c]/98 backdrop-blur-xl shadow-lg transition-all duration-300 ${
                  item.isBook
                    ? "border-amber-400/40 group-hover:border-amber-400 group-hover:shadow-[0_0_30px_rgba(251,191,36,0.35)]"
                    : "border-white/10 group-hover:border-amber-400/50 group-hover:shadow-[0_0_25px_rgba(251,191,36,0.25)]"
                }`}
              >
                {/* Image Thumb Frame */}
                <div
                  className={`relative shrink-0 overflow-hidden rounded-xl bg-black/50 border border-white/10 p-1.5 flex items-center justify-center ${
                    item.isBook
                      ? "w-[68px] h-[92px] ring-2 ring-amber-400/40"
                      : "w-[76px] h-[76px]"
                  }`}
                >
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                    onError={(e) => {
                      // Fallback in case of path variation
                      const target = e.currentTarget;
                      if (!target.dataset.triedFallback) {
                        target.dataset.triedFallback = "true";
                        target.src = "/logo.png";
                      }
                    }}
                  />
                  {/* Subtle shine on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>

                {/* Text Metadata */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border truncate max-w-[125px] ${item.badgeColor}`}
                    >
                      {item.category}
                    </span>
                    {item.isBook && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-amber-500 text-black font-mono">
                        BOOK
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-[13px] font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                    {item.title}
                  </h4>

                  {item.tamilTitle && (
                    <p className="text-[11px] text-amber-400/90 font-medium truncate mt-0.5 font-sans">
                      {item.tamilTitle}
                    </p>
                  )}

                  <span className="text-[10px] text-slate-400 font-mono mt-1.5 flex items-center gap-1 group-hover:text-white transition-colors">
                    <Eye size={10} className="text-amber-400" />
                    <span>Click to inspect</span>
                  </span>
                </div>

                {/* Corner Expand Indicator */}
                <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400">
                  <Maximize2 size={12} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LIGHTBOX MODAL FOR FULL-RES VIEW & SPIRITUAL SIGNIFICANCE */}
      <AnimatePresence>
        {selectedItem && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 sm:p-6"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-2xl bg-gradient-to-b from-[#0e1329] to-[#050711] border-2 border-amber-400/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-white overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                aria-label="Close modal"
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all hover:scale-110 cursor-pointer z-20"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                {/* Large Image Frame */}
                <div
                  className={`relative shrink-0 rounded-2xl bg-black/60 border-2 border-amber-400/30 p-4 flex items-center justify-center shadow-2xl ${
                    selectedItem.isBook
                      ? "w-48 sm:w-56 h-64 sm:h-72 ring-2 ring-amber-400/40"
                      : "w-48 sm:w-56 h-48 sm:h-56"
                  }`}
                >
                  <img
                    src={selectedItem.src}
                    alt={selectedItem.title}
                    className="max-w-full max-h-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]"
                    onError={(e) => {
                      e.currentTarget.src = "/logo.png";
                    }}
                  />
                </div>

                {/* Info & Description */}
                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-amber-400/30 bg-amber-500/10 text-amber-300">
                    <Sparkles size={12} className="text-amber-400" />
                    <span>{selectedItem.category}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-serif font-black text-white leading-tight">
                    {selectedItem.title}
                  </h3>

                  {selectedItem.tamilTitle && (
                    <p className="text-base text-amber-400 font-semibold font-sans">
                      {selectedItem.tamilTitle}
                    </p>
                  )}

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                    {selectedItem.desc}
                  </p>

                  <div className="pt-3 flex items-center justify-center sm:justify-start gap-3">
                    <a
                      href={selectedItem.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black text-xs font-bold uppercase tracking-wider transition-transform hover:scale-105 shadow-lg shadow-amber-500/20 cursor-pointer"
                    >
                      <Maximize2 size={13} />
                      <span>Open Full Image</span>
                    </a>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-white font-medium transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global CSS for seamless infinite animation */}
      <style>{`
        @keyframes cotInfiniteMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }
      `}</style>
    </section>
  );
}

export default InfiniteLogoScroll;
