"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2, Sparkles } from "lucide-react";

export interface ImageData {
  title: string;
  url: string;
}

export const defaultImages: ImageData[] = [
  {
    title: "Mini canine",
    url: "https://cdn.21st.dev/assets/mirror/b1/b1ab68992eb01519f23a76b122d710baf7737e6fb5ba81fe0e6ce827c0adca53.jpg",
  },
  {
    title: "Wheely tent",
    url: "https://cdn.21st.dev/assets/mirror/5a/5a176462f7be28c9ee9b8feb93bdd78ae287f855e8d1abc19ca7614d124d0d63.jpg",
  },
  {
    title: "Red food things",
    url: "https://cdn.21st.dev/assets/mirror/59/59404a1cb0c461264e7c4a431db19a9562702ea0f8aa98183ea402b4fc36888d.jpg",
  },
  {
    title: "Sand boat",
    url: "https://cdn.21st.dev/assets/mirror/45/45f394d2aeb2dfaa436d09342f030468eb70bf8646e82c6e650c8302063aaded.jpg",
  },
  {
    title: "Screen thing",
    url: "https://cdn.21st.dev/assets/mirror/36/363360a8b7b8cbd8294000ce1b9131a30f69a81300d0830dc249d7ae0b045b34.jpg",
  },
  {
    title: "Horse tornado",
    url: "https://cdn.21st.dev/assets/mirror/c3/c309fef094d8c89f53ee1e530fc7b1d861a63bb4bfd276bc1d9f51ff69ebcddb.jpg",
  },
];

export interface ImageGalleryProps {
  images?: ImageData[];
  className?: string;
}

// Main component for the Circular Morphing Image Gallery
export function ImageGallery({ images = defaultImages, className = "" }: ImageGalleryProps) {
  const [opened, setOpened] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [maximizedIndex, setMaximizedIndex] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayTimer = useRef<number | null>(null);
  const filmstripRef = useRef<HTMLDivElement>(null);

  const total = Math.max(images.length, 1);

  const goToIndex = useCallback(
    (index: number, newDirection?: number) => {
      if (index === opened) return;
      const safeIndex = (index + total) % total;
      const computedDir =
        newDirection !== undefined
          ? newDirection
          : safeIndex > opened
          ? 1
          : -1;
      setDirection(computedDir);
      setIsTransitioning(true);
      setOpened(safeIndex);
    },
    [opened, total]
  );

  const next = useCallback(() => {
    goToIndex((opened + 1) % total, 1);
  }, [opened, total, goToIndex]);

  const prev = useCallback(() => {
    goToIndex((opened - 1 + total) % total, -1);
  }, [opened, total, goToIndex]);

  // Autoplay logic (pauses on hover or when maximized)
  useEffect(() => {
    if (isHovered || maximizedIndex !== null) {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
      return;
    }

    autoplayTimer.current = window.setInterval(next, 5000);
    return () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    };
  }, [next, isHovered, maximizedIndex]);

  // Auto-scroll active filmstrip item horizontally within its own container only (never scrolling the window/page)
  useEffect(() => {
    const container = filmstripRef.current;
    if (!container) return;
    const thumb = document.getElementById(`filmstrip-thumb-${opened}`);
    if (thumb) {
      const containerRect = container.getBoundingClientRect();
      const thumbRect = thumb.getBoundingClientRect();
      const relativeLeft = thumbRect.left - containerRect.left + container.scrollLeft;
      const targetScroll = relativeLeft - (container.clientWidth / 2) + (thumbRect.width / 2);
      container.scrollTo({ left: Math.max(0, targetScroll), behavior: "smooth" });
    }
  }, [opened]);

  // Lightbox handlers
  const openMaximized = (index: number) => {
    setMaximizedIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeMaximized = useCallback(() => {
    setMaximizedIndex(null);
    document.body.style.overflow = "";
  }, []);

  const nextMaximized = useCallback(() => {
    setMaximizedIndex((curr) => {
      if (curr === null) return 0;
      return (curr + 1) % total;
    });
  }, [total]);

  const prevMaximized = useCallback(() => {
    setMaximizedIndex((curr) => {
      if (curr === null) return 0;
      return (curr - 1 + total) % total;
    });
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (maximizedIndex !== null) {
        if (e.key === "Escape") closeMaximized();
        if (e.key === "ArrowRight") nextMaximized();
        if (e.key === "ArrowLeft") prevMaximized();
      } else {
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [maximizedIndex, closeMaximized, nextMaximized, prevMaximized, next, prev]);

  const currentImage = images[opened] || images[0];

  return (
    <div
      className={`w-full flex flex-col items-center justify-center font-sans py-4 select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Centered Gallery Frame with Side Navigation Arrows */}
      <div className="relative flex items-center justify-center w-full max-w-[660px] px-8 sm:px-14">
        {/* Main Visual Display Frame */}
        <div className="relative w-[85vw] h-[85vw] max-w-[540px] max-h-[540px] overflow-hidden rounded-[28px] shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-amber-500/20 bg-[#070a16] group/frame">
          {/* Animated Image Layer with Circular Morph Iris Bloom */}
          <AnimatePresence
            initial={false}
            custom={direction}
            onExitComplete={() => setIsTransitioning(false)}
          >
            <motion.div
              key={`gallery-item-${opened}`}
              custom={direction}
              variants={{
                enter: (dir: number) => ({
                  clipPath: `circle(12px at ${50 + dir * 6}% 92%)`,
                  opacity: 0.3,
                  scale: 1.08,
                  filter: "brightness(1.15) contrast(1.05)",
                }),
                center: {
                  clipPath: "circle(150% at 50% 50%)",
                  opacity: 1,
                  scale: 1,
                  filter: "brightness(1) contrast(1)",
                  transition: {
                    clipPath: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: 0.35, ease: "easeOut" },
                    scale: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
                    filter: { duration: 0.5 },
                  },
                },
                exit: (dir: number) => ({
                  opacity: 0,
                  scale: 0.94,
                  filter: "blur(6px) brightness(0.7)",
                  transition: {
                    duration: 0.45,
                    ease: [0.4, 0, 0.2, 1],
                  },
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 cursor-zoom-in overflow-hidden"
              onClick={() => openMaximized(opened)}
              title="Click to maximize photo"
            >
              <img
                src={currentImage.url}
                alt={currentImage.title}
                className="w-full h-full object-cover pointer-events-none"
              />

              {/* Cinematic Vignette */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at center, transparent 40%, rgba(4, 7, 18, 0.7) 100%)",
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Morphing Circular Blooming Ring Effect during transition */}
          {isTransitioning && (
            <motion.div
              initial={{ scale: 0.2, opacity: 0.9 }}
              animate={{ scale: 28, opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-amber-400 pointer-events-none z-30"
            />
          )}

          {/* Top Title & Moment Badge */}
          <div className="absolute top-4 left-4 z-40 pointer-events-none flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-bold tracking-wide shadow-lg">
              <Sparkles size={11} className="text-amber-400" />
              <span className="max-w-[190px] sm:max-w-[260px] truncate">
                {currentImage.title || "Sacred Moment"}
              </span>
            </span>
          </div>

          {/* Click to Maximize Hint Overlay Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openMaximized(opened);
            }}
            className="absolute top-4 right-4 z-40 cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/65 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-lg transition-all opacity-90 hover:opacity-100 hover:scale-105"
          >
            <Maximize2 size={13} className="text-amber-400" />
            <span className="hidden sm:inline">Maximize</span>
          </button>

          {/* Bottom Circular Thumbnail Tabs (as specified in ooo.txt) */}
          <div className="absolute bottom-3 left-0 right-0 z-40 flex items-center justify-center gap-2 px-4 pointer-events-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 shadow-xl">
              {/* Sliding window of 7 thumbnails for collections larger than 7 */}
              {(() => {
                const windowRadius = 3;
                const visibleIndices: { idx: number; isCenter: boolean }[] = [];
                for (let d = -windowRadius; d <= windowRadius; d++) {
                  const idx = (opened + d + total) % total;
                  visibleIndices.push({ idx, isCenter: d === 0 });
                }

                return visibleIndices.map(({ idx, isCenter }) => {
                  const item = images[idx];
                  if (!item) return null;
                  const isActive = idx === opened;

                  return (
                    <button
                      key={`tab_dot_${idx}`}
                      onClick={() => goToIndex(idx)}
                      className={`group relative rounded-full transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-center ${
                        isActive
                          ? "w-7 h-7 sm:w-8 sm:h-8 ring-2 ring-amber-400 ring-offset-2 ring-offset-[#070a16] scale-110 shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                          : "w-4 h-4 sm:w-5 sm:h-5 opacity-60 hover:opacity-100 border border-white/30 hover:scale-105"
                      }`}
                      title={item.title}
                      aria-label={`Jump to ${item.title}`}
                    >
                      <img
                        src={item.url}
                        alt=""
                        className="w-full h-full object-cover pointer-events-none"
                      />
                      {isActive && (
                        <div className="absolute inset-0 bg-amber-400/25 pointer-events-none" />
                      )}
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Left Navigation Arrow */}
        <button
          className="absolute left-0 sm:left-1 top-1/2 z-50 flex h-11 w-11 sm:h-13 sm:w-13 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 border-white/20 bg-white/95 text-gray-800 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.35)] outline-none transition-all duration-300 hover:scale-110 hover:bg-white hover:border-white/40 active:scale-95"
          onClick={prev}
          aria-label="Previous Image"
        >
          <ChevronLeft size={22} className="stroke-[2.5]" />
        </button>

        {/* Right Navigation Arrow */}
        <button
          className="absolute right-0 sm:right-1 top-1/2 z-50 flex h-11 w-11 sm:h-13 sm:w-13 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 border-white/20 bg-white/95 text-gray-800 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.35)] outline-none transition-all duration-300 hover:scale-110 hover:bg-white hover:border-white/40 active:scale-95"
          onClick={next}
          aria-label="Next Image"
        >
          <ChevronRight size={22} className="stroke-[2.5]" />
        </button>
      </div>

      {/* Full collection scrollable thumbnail filmstrip beneath the frame */}
      {images.length > 1 && (
        <div className="w-full max-w-[540px] mt-6 flex flex-col items-center gap-2 z-10 px-4">
          <div className="flex items-center justify-between w-full text-xs text-slate-400 font-mono px-1">
            <span className="text-amber-300 font-sans font-bold truncate max-w-[340px]">
              {currentImage.title}
            </span>
            <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15 text-[11px] font-mono text-amber-200 shrink-0">
              {opened + 1} / {total}
            </span>
          </div>

          <div
            ref={filmstripRef}
            className="flex items-center gap-2 overflow-x-auto w-full py-2 px-1 no-scrollbar scroll-smooth"
            style={{ scrollbarWidth: "none" }}
          >
            {images.map((img, idx) => {
              const isSelected = opened === idx;
              return (
                <button
                  key={`strip_${img.url}_${idx}`}
                  id={`filmstrip-thumb-${idx}`}
                  onClick={() => goToIndex(idx)}
                  className={`relative shrink-0 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "w-14 h-14 ring-2 ring-amber-400 ring-offset-2 ring-offset-[#070a16] scale-105 shadow-[0_0_15px_rgba(251,191,36,0.6)]"
                      : "w-11 h-11 opacity-50 hover:opacity-90 hover:scale-100 border border-white/20"
                  }`}
                  title={img.title}
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover pointer-events-none"
                    loading="lazy"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-amber-400/20 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MAXIMIZED IMAGE LIGHTBOX MODAL */}
      {maximizedIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-black/95 backdrop-blur-2xl p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={closeMaximized}
        >
          {/* Top Bar with Title, Counter and Close Button */}
          <div
            className="w-full max-w-6xl flex items-center justify-between z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-amber-400 text-xs font-black uppercase tracking-widest">
                {images[maximizedIndex]?.title || "Gallery"}
              </span>
              <span className="text-white/60 text-xs font-mono">
                {maximizedIndex + 1} / {total}
              </span>
            </div>

            <button
              onClick={closeMaximized}
              aria-label="Close maximized view"
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
            >
              <X size={22} />
            </button>
          </div>

          {/* Main Maximized Photo Center Display */}
          <div
            className="relative flex-1 w-full max-w-6xl flex items-center justify-center my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={prevMaximized}
              aria-label="Previous Image"
              className="absolute left-2 sm:left-4 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-2xl"
            >
              <ChevronLeft size={28} />
            </button>

            <img
              src={images[maximizedIndex]?.url}
              alt={images[maximizedIndex]?.title || "Maximized photo"}
              className="max-h-[78vh] max-w-[90vw] object-contain rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] border border-white/15 animate-in zoom-in-95 duration-200"
            />

            <button
              onClick={nextMaximized}
              aria-label="Next Image"
              className="absolute right-2 sm:right-4 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-2xl"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Bottom Caption & Thumbnail Indicators */}
          <div
            className="w-full max-w-3xl flex flex-col items-center gap-3 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-serif font-bold text-white/90 text-center tracking-wide">
              {images[maximizedIndex]?.title}
            </p>

            <div className="flex items-center gap-2 max-w-full overflow-x-auto py-1 px-4 no-scrollbar">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setMaximizedIndex(idx)}
                  className={`transition-all duration-300 shrink-0 ${
                    idx === maximizedIndex
                      ? "w-8 h-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                      : "w-2 h-2 rounded-full bg-white/30 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
