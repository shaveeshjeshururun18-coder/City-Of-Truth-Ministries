"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { ViewState } from "../../types";
import { InfiniteEmblemMarquee } from "./infinite-emblem-marquee";

export interface CategoryCard {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  badgeColor: string;
  accentBorder: string;
  img: string;
  view?: ViewState;
  anchor?: string;
  countLabel: string;
}

export const CATEGORY_CARDS: CategoryCard[] = [
  {
    id: "youth",
    title: "Youth Ministry",
    subtitle: "Igniting Next-Gen Leaders",
    tag: "Next Generation",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    accentBorder: "group-hover:border-emerald-500/50",
    img: "/ministry/IMG-20231230-WA0000.jpg",
    view: ViewState.MINISTRIES,
    anchor: "youth-ministry",
    countLabel: "40+ Moments",
  },
  {
    id: "spiritual",
    title: "Spiritual Gatherings",
    subtitle: "Communion, Prayer & Truth",
    tag: "Sacred Assembly",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    accentBorder: "group-hover:border-amber-500/50",
    img: "/ministry/IMG-20231230-WA0001.jpg",
    view: ViewState.MINISTRIES,
    anchor: "spiritual-gatherings",
    countLabel: "Weekly Sabbath",
  },
  {
    id: "music",
    title: "Sacred Music & Praise",
    subtitle: "Levitical Hymns & Worship",
    tag: "Worship & Strings",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    accentBorder: "group-hover:border-cyan-500/50",
    img: "/ministry/IMG-20231230-WA0004.jpg",
    view: ViewState.MINISTRIES,
    anchor: "sacred-music",
    countLabel: "Live Choir",
  },
  {
    id: "helping-hands",
    title: "Helping Hands & Charity",
    subtitle: "Widow Aid & Community Care",
    tag: "Compassion Drive",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    accentBorder: "group-hover:border-rose-500/50",
    img: "/ministry/IMG-20231230-WA0008.jpg",
    view: ViewState.MINISTRIES,
    anchor: "helping-hands",
    countLabel: "Relief Projects",
  },
  {
    id: "healing",
    title: "Healing & Miracles",
    subtitle: "Faith Restoration & Prayer",
    tag: "Divine Power",
    badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    accentBorder: "group-hover:border-violet-500/50",
    img: "/ministry/IMG-20231230-WA0010.jpg",
    view: ViewState.MINISTRIES,
    anchor: "healing-miracles",
    countLabel: "Testimonies",
  },
  {
    id: "valparai",
    title: "Valparai Retreat Sanctuary",
    subtitle: "Cloud-Kissed Mountain Solitude",
    tag: "Mountain Prayer",
    badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    accentBorder: "group-hover:border-teal-500/50",
    img: "/valparai-grass-hills.jpg",
    view: ViewState.ABOUT_VALPARAI,
    countLabel: "Sacred Hills",
  },
  {
    id: "hebrew",
    title: "Ancient Hebrew Wisdom",
    subtitle: "Paleo Alphabet, Roots & Torah",
    tag: "Linguistic Truth",
    badgeColor: "bg-amber-400/10 text-amber-300 border-amber-400/30",
    accentBorder: "group-hover:border-amber-400/50",
    img: "/sacred-menorah.png",
    view: ViewState.HEBREW,
    countLabel: "22 Letters",
  },
  {
    id: "israel",
    title: "Eretz Israel Heritage",
    subtitle: "Sacred Geography & Holy Land",
    tag: "Promised Land",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    accentBorder: "group-hover:border-blue-500/50",
    img: "/menorah-flag.png",
    view: ViewState.HEBREW_ISRAEL,
    countLabel: "Historical Study",
  },
  {
    id: "downloads",
    title: "PDF Scripture Downloads",
    subtitle: "Spiritual Manuscripts & Books",
    tag: "Free Resources",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    accentBorder: "group-hover:border-indigo-500/50",
    img: "/brand-logo.png",
    view: ViewState.PDF_DOWNLOADS,
    countLabel: "Archive Library",
  },
];

interface HorizontalCategoryScrollerProps {
  setView?: (view: ViewState) => void;
  className?: string;
}

export function HorizontalCategoryScroller({
  setView,
  className = "",
}: HorizontalCategoryScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const checkScrollBounds = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScrollBounds();
    el.addEventListener("scroll", checkScrollBounds, { passive: true });
    window.addEventListener("resize", checkScrollBounds);
    return () => {
      el.removeEventListener("scroll", checkScrollBounds);
      window.removeEventListener("resize", checkScrollBounds);
    };
  }, [checkScrollBounds]);

  const scrollByAmount = (offset: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  // Drag-to-scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleCardClick = (card: CategoryCard) => {
    if (isDragging) return;
    if (card.view && setView) {
      setView(card.view);
      if (card.anchor) {
        setTimeout(() => {
          const anchorEl = document.getElementById(card.anchor!);
          if (anchorEl) {
            anchorEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 150);
      }
    }
  };

  return (
    <section
      className={`relative w-full py-16 bg-[#04060d] text-white border-t border-amber-500/10 select-none overflow-hidden ${className}`}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl">
        {/* Compact Infinite Horizontal Scrolling Emblems & Publications Ribbon */}
        <div className="mb-12 pb-10 border-b border-white/10">
          <InfiniteEmblemMarquee />
        </div>

        {/* Header with Dribbble-style explore title & Left/Right buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-[0.25em] mb-2.5">
              <Sparkles size={12} className="text-amber-400" />
              <span>Explore The Ministry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-white tracking-tight">
              Discover Wings, Studies & Media
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl font-light">
              Scroll through our featured ministries, sacred tools, retreat grounds, and scripture archives.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => scrollByAmount(-360)}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                canScrollLeft
                  ? "bg-white/10 hover:bg-amber-500 hover:text-black hover:border-amber-400 border-white/15 text-white active:scale-95 shadow-md"
                  : "bg-white/5 border-white/5 text-white/30 cursor-not-allowed"
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollByAmount(360)}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                canScrollRight
                  ? "bg-white/10 hover:bg-amber-500 hover:text-black hover:border-amber-400 border-white/15 text-white active:scale-95 shadow-md"
                  : "bg-white/5 border-white/5 text-white/30 cursor-not-allowed"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Dribbble-Style Horizontal Scrolling Row */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar cursor-grab active:cursor-grabbing scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {CATEGORY_CARDS.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className="group flex flex-col shrink-0 w-[240px] sm:w-[270px] cursor-pointer"
            >
              {/* Card Container */}
              <div
                className={`relative w-full aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#0a0d1d] shadow-lg transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_15px_35px_rgba(0,0,0,0.6)] ${card.accentBorder}`}
              >
                {/* Image */}
                <img
                  src={card.img}
                  alt={card.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Subtle top indicator strip (as seen in Dribbble top border glow) */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                {/* Gradient Shadow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#04060d] via-[#04060d]/20 to-transparent opacity-75 group-hover:opacity-60 transition-opacity" />

                {/* Top Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${card.badgeColor}`}
                  >
                    {card.tag}
                  </span>
                </div>

                {/* Top Right Arrow */}
                <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/70 group-hover:text-amber-400 group-hover:border-amber-400/40 group-hover:scale-110 transition-all">
                  <ArrowUpRight size={14} />
                </div>

                {/* Bottom Meta Overlay */}
                <div className="absolute bottom-2.5 left-3 right-3 z-10 flex items-center justify-between text-[11px] text-white/70 font-mono">
                  <span className="truncate">{card.countLabel}</span>
                  <span className="text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    Explore &rarr;
                  </span>
                </div>
              </div>

              {/* Title & Subtitle Underneath (matches Dribbble aesthetic) */}
              <div className="mt-3 px-1">
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400 truncate mt-0.5 font-light">
                  {card.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HorizontalCategoryScroller;
