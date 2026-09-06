"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Maximize2, X, Eye, BookOpen, ShieldCheck } from "lucide-react";

export interface EmblemItem {
  id: string;
  title: string;
  tamilTitle?: string;
  category: string;
  src: string;
  badgeColor: string;
  isBook?: boolean;
  desc?: string;
}

export const SHOWCASE_EMBLEMS: EmblemItem[] = [
  {
    id: "menorah-seal",
    title: "Sacred Menorah Seal",
    tamilTitle: "பரிசுத்த விளக்குத்தண்டு",
    category: "Official Seal",
    src: "/showcase/logo-menorah-seal.png",
    badgeColor: "border-amber-400/40 text-amber-300 bg-amber-500/10",
    desc: "The sacred 7-branch Menorah emblem of City of Truth Ministries, symbolizing the sevenfold Spirit and eternal divine light.",
  },
  {
    id: "truth-crest",
    title: "City of Truth Crest",
    tamilTitle: "சத்திய நகரின் சின்னம்",
    category: "Ministry Crest",
    src: "/showcase/logo-truth-crest.png",
    badgeColor: "border-blue-400/40 text-blue-300 bg-blue-500/10",
    desc: "Apostolic heraldic crest embodying the pillar of truth, the covenant, and righteousness.",
  },
  {
    id: "sacred-emblem",
    title: "Divine Light Emblem",
    tamilTitle: "தெய்வீக ஜோதி",
    category: "Sanctuary Emblem",
    src: "/showcase/logo-sacred-emblem.png",
    badgeColor: "border-emerald-400/40 text-emerald-300 bg-emerald-500/10",
    desc: "Golden illumination representing the uncreated light of the Almighty shining into every heart.",
  },
  {
    id: "divine-light",
    title: "Celestial Covenant Mark",
    tamilTitle: "வானக உடன்படிக்கை",
    category: "Covenant Seal",
    src: "/showcase/logo-divine-light.png",
    badgeColor: "border-indigo-400/40 text-indigo-300 bg-indigo-500/10",
    desc: "The celestial signet representing divine order, holy worship, and faithful service.",
  },
  {
    id: "cot-gold",
    title: "City of Truth Gold Signature",
    tamilTitle: "பொன்மயமான முத்திரை",
    category: "Master Brand",
    src: "/showcase/logo-cot-gold.png",
    badgeColor: "border-amber-500/50 text-amber-300 bg-amber-500/15",
    desc: "Embossed golden emblem used on official pastoral publications, letters, and holy convocation banners.",
  },
  {
    id: "hebrew-crown",
    title: "Hebrew Crown of Righteousness",
    tamilTitle: "நீதியின் கிரீடம்",
    category: "Hebrew Wisdom",
    src: "/showcase/logo-hebrew-crown.png",
    badgeColor: "border-yellow-400/40 text-yellow-300 bg-yellow-500/10",
    desc: "Keter (Crown) motif representing holy royalty in Yahweh and the crown of everlasting life.",
  },
  {
    id: "truth-wings",
    title: "Wings of Truth & Refuge",
    tamilTitle: "சத்தியத்தின் செட்டைகள்",
    category: "Apostolic Wings",
    src: "/showcase/logo-truth-wings.png",
    badgeColor: "border-cyan-400/40 text-cyan-300 bg-cyan-500/10",
    desc: "Inspired by Psalm 91:4 — 'He will cover you with His feathers, and under His wings you will find refuge.'",
  },
  {
    id: "sacred-shield",
    title: "Shield of Faith & Defense",
    tamilTitle: "விசுவாசத்தின் கேடகம்",
    category: "Spiritual Armor",
    src: "/showcase/logo-sacred-shield.png",
    badgeColor: "border-rose-400/40 text-rose-300 bg-rose-500/10",
    desc: "The shield of spiritual protection standing steadfast against deception and declaring the victory of Truth.",
  },
  {
    id: "covenant-star",
    title: "Covenant Star of David",
    tamilTitle: "தாவீதின் நட்சத்திரம்",
    category: "Biblical Heritage",
    src: "/showcase/logo-covenant-star.png",
    badgeColor: "border-sky-400/40 text-sky-300 bg-sky-500/10",
    desc: "Ancient sign of the seed of David and the prophetic fulfillment in our Messiah.",
  },
  {
    id: "book-wrapper",
    title: "ஆத்தும நன்றி பலிகள்",
    tamilTitle: "Soul Thanksgiving Sacrifices",
    category: "Sacred Book Publication",
    src: "/showcase/book-athuma-nanri-paligal.jpg",
    badgeColor: "border-amber-400/50 text-amber-200 bg-amber-500/20",
    isBook: true,
    desc: "The official holy book wrapper for 'ஆத்தும நன்றி பலிகள்' (Soul Thanksgiving Sacrifices) containing sacred prayers, meditations, and thanksgiving confessions.",
  },
];

interface InfiniteEmblemMarqueeProps {
  className?: string;
}

export function InfiniteEmblemMarquee({ className = "" }: InfiniteEmblemMarqueeProps) {
  const [selectedEmblem, setSelectedEmblem] = useState<EmblemItem | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate items 3 times for a completely seamless infinite continuous track
  const marqueeItems = [...SHOWCASE_EMBLEMS, ...SHOWCASE_EMBLEMS, ...SHOWCASE_EMBLEMS];

  return (
    <div className={`relative w-full overflow-hidden select-none ${className}`}>
      {/* Top Header Strip */}
      <div className="flex items-center justify-between px-4 sm:px-6 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[11px] font-mono tracking-widest text-amber-400/90 uppercase font-semibold">
            Official Emblems & Publications
          </span>
          <span className="hidden sm:inline text-xs text-white/30">•</span>
          <span className="hidden sm:inline text-xs text-slate-400 font-light">
            Continuous Infinite Archive
          </span>
        </div>

        <button
          onClick={() => setIsPaused((prev) => !prev)}
          className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
        >
          {isPaused ? "▶ Resume Scroll" : "⏸ Pause Scroll"}
        </button>
      </div>

      {/* Marquee Track Container with Gradient Edge Fades */}
      <div
        className="relative w-full overflow-hidden py-2"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className={`flex items-center gap-4 w-max ${
            isPaused ? "[animation-play-state:paused]" : ""
          }`}
          style={{
            animation: "cotInfiniteMarquee 38s linear infinite",
          }}
        >
          {marqueeItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              onClick={() => setSelectedEmblem(item)}
              className={`group relative shrink-0 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${
                item.isBook
                  ? "w-[260px] sm:w-[290px] h-[110px]"
                  : "w-[210px] sm:w-[235px] h-[110px]"
              }`}
            >
              {/* Card Body */}
              <div
                className={`relative w-full h-full rounded-2xl p-3 flex items-center gap-3.5 border bg-gradient-to-br from-[#0c1024]/90 via-[#070a18]/90 to-[#03050c]/95 backdrop-blur-xl shadow-lg transition-all duration-300 ${
                  item.isBook
                    ? "border-amber-400/40 group-hover:border-amber-400 group-hover:shadow-[0_0_25px_rgba(251,191,36,0.35)]"
                    : "border-white/10 group-hover:border-amber-400/50 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.25)]"
                }`}
              >
                {/* Image Thumb Frame */}
                <div
                  className={`relative shrink-0 overflow-hidden rounded-xl bg-black/40 border border-white/10 p-1 flex items-center justify-center ${
                    item.isBook
                      ? "w-[68px] h-[86px] ring-1 ring-amber-400/30"
                      : "w-[72px] h-[72px]"
                  }`}
                >
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    className={`max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)]`}
                  />
                  {/* Subtle shine on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>

                {/* Text Metadata */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-1 mb-1">
                    <span
                      className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border truncate max-w-[120px] ${item.badgeColor}`}
                    >
                      {item.category}
                    </span>
                    {item.isBook && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500 text-black font-mono">
                        BOOK
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-[13px] font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                    {item.title}
                  </h4>

                  {item.tamilTitle && (
                    <p className="text-[11px] text-amber-400/85 font-medium truncate mt-0.5 font-sans">
                      {item.tamilTitle}
                    </p>
                  )}

                  <span className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1 group-hover:text-white transition-colors">
                    <Eye size={10} className="text-amber-400" />
                    <span>View Emblem</span>
                  </span>
                </div>

                {/* Top Right Click Icon */}
                <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400">
                  <Maximize2 size={12} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LIGHTBOX MODAL FOR DETAILED VIEW */}
      <AnimatePresence>
        {selectedEmblem && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 sm:p-6"
            onClick={() => setSelectedEmblem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-2xl bg-gradient-to-b from-[#0e1329] to-[#050711] border-2 border-amber-400/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] text-white overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setSelectedEmblem(null)}
                aria-label="Close modal"
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all hover:scale-110 cursor-pointer z-20"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                {/* Large Image Frame */}
                <div
                  className={`relative shrink-0 rounded-2xl bg-black/60 border-2 border-amber-400/30 p-4 flex items-center justify-center shadow-2xl ${
                    selectedEmblem.isBook
                      ? "w-48 sm:w-56 h-64 sm:h-72"
                      : "w-48 sm:w-56 h-48 sm:h-56"
                  }`}
                >
                  <img
                    src={selectedEmblem.src}
                    alt={selectedEmblem.title}
                    className="max-w-full max-h-full object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]"
                  />
                </div>

                {/* Info & Description */}
                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-amber-400/30 bg-amber-500/10 text-amber-300">
                    <Sparkles size={12} className="text-amber-400" />
                    <span>{selectedEmblem.category}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-serif font-black text-white">
                    {selectedEmblem.title}
                  </h3>

                  {selectedEmblem.tamilTitle && (
                    <p className="text-base text-amber-400 font-semibold font-sans">
                      {selectedEmblem.tamilTitle}
                    </p>
                  )}

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                    {selectedEmblem.desc}
                  </p>

                  <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
                    <a
                      href={selectedEmblem.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider transition-transform hover:scale-105 shadow-lg shadow-amber-500/20 cursor-pointer"
                    >
                      <Maximize2 size={13} />
                      <span>Open Full Image</span>
                    </a>
                    <button
                      onClick={() => setSelectedEmblem(null)}
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
    </div>
  );
}

export default InfiniteEmblemMarquee;
