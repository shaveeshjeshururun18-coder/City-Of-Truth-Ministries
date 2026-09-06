"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

// Inline Icons (Zero external dependencies)
const ChevronLeftIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export interface CarouselItem {
  tag?: string;
  titleLine1: string;
  titleLine2?: string;
  desc?: string;
  img: string;
  ctaText?: string;
  ctaUrl?: string;
  category?: string;
}

export interface CoverFlowCarouselProps {
  items?: CarouselItem[];
  sectionLabel?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
  onCtaClick?: (item: CarouselItem) => void;
}

export const defaultMinistries: CarouselItem[] = [
  {
    tag: "#SpiritualFoundation",
    titleLine1: "SPIRITUAL",
    titleLine2: "GATHERINGS",
    desc: "Deepening our divine connection with prayer, fellowship, and holy communion",
    img: "/ministry/IMG-20231230-WA0001.jpg",
    ctaText: "Explore Gatherings",
    ctaUrl: "#spiritual-gatherings",
    category: "Spiritual Gatherings",
  },
  {
    tag: "#NextGeneration",
    titleLine1: "YOUTH",
    titleLine2: "MINISTRY",
    desc: "Empowering young hearts and minds to walk boldly in biblical truth",
    img: "/ministry/IMG-20231230-WA0004.jpg",
    ctaText: "Explore Youth",
    ctaUrl: "#youth-ministry",
    category: "Youth Ministry",
  },
  {
    tag: "#WelfareAndLove",
    titleLine1: "HELPING",
    titleLine2: "HANDS",
    desc: "Charity in action, visiting widows and fatherless in their affliction",
    img: "/ministry/IMG-20231230-WA0007.jpg",
    ctaText: "Explore Charity",
    ctaUrl: "#helping-hands",
    category: "Helping Hands",
  },
  {
    tag: "#PraiseInTruth",
    titleLine1: "SACRED MUSIC",
    titleLine2: "& PRAISE",
    desc: "Exalting the Holy Name through inspired hymns, strings, and worship melodies",
    img: "/ministry/IMG-20231230-WA0010.jpg",
    ctaText: "Explore Worship",
    ctaUrl: "#sacred-music",
    category: "Sacred Music & Praise",
  },
  {
    tag: "#DivineRestoration",
    titleLine1: "HEALING &",
    titleLine2: "MIRACLES",
    desc: "Witnessing God's supernatural power and restoration through faithful prayers",
    img: "/ministry/IMG-20231230-WA0012.jpg",
    ctaText: "Explore Service",
    ctaUrl: "#healing-miracles",
    category: "Healing & Miracle Service",
  },
  {
    tag: "#CommunityOutreach",
    titleLine1: "COMMUNITY",
    titleLine2: "IMPACT",
    desc: "Bringing light into villages and towns through acts of kindness and truth",
    img: "/ministry/IMG-20231230-WA0015.jpg",
    ctaText: "Explore Outreach",
    ctaUrl: "#community-impact",
    category: "Community Impact",
  },
];

export function CoverFlowCarousel({
  items = defaultMinistries,
  sectionLabel = "MINISTRY HIGHLIGHTS",
  autoplay = true,
  autoplayDelay = 4500,
  className = "",
  onCtaClick,
}: CoverFlowCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const containerRef = useRef<HTMLElement>(null);
  const total = items.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx % total);
  };

  useEffect(() => {
    if (!autoplay || isHovered || total <= 1) return;
    const interval = setInterval(nextSlide, autoplayDelay);
    return () => clearInterval(interval);
  }, [autoplay, autoplayDelay, isHovered, nextSlide, total]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 45) {
      if (diff < 0) nextSlide();
      else prevSlide();
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section
      ref={containerRef}
      className={`relative w-full min-h-[720px] flex items-center justify-center overflow-hidden py-14 select-none ${className}`}
      style={{
        backgroundColor: "#070a14",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <img
          src={items[currentIndex]?.img}
          alt="ambience background"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.20) blur(40px)",
            transform: "scale(1.2)",
            transition: "all 900ms ease",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, rgba(7,10,20,0.4) 0%, rgba(7,10,20,0.95) 100%)",
          }}
        />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 z-10 flex flex-col items-center">
        {/* Eyebrow */}
        {sectionLabel && (
          <div className="flex items-center gap-3 mb-8">
            <span style={{ width: "40px", height: "1px", background: "linear-gradient(90deg, transparent, #fbbf24)" }} />
            <h3
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "#fbbf24",
                margin: 0,
              }}
            >
              {sectionLabel}
            </h3>
            <span style={{ width: "40px", height: "1px", background: "linear-gradient(90deg, #fbbf24, transparent)" }} />
          </div>
        )}

        {/* 3D Coverflow Stage with Crav-Burgers Dynamic Angle Fan */}
        <div
          className="relative w-full h-[540px] flex justify-center items-center mb-8"
          style={{
            perspective: "1400px",
          }}
        >
          {items.map((item, idx) => {
            const offset = (idx - currentIndex + total) % total;

            // Center card is elevated; left and right cards follow (+5°, -5°, +8°) dynamic fan
            let transform = "translateX(0px) scale(0.4) rotateY(0deg) rotate(0deg)";
            let opacity = 0;
            let zIndex = 0;
            let filter = "brightness(0.35) blur(3px)";
            let isCenter = false;

            if (offset === 0) {
              isCenter = true;
              transform = "translateX(0px) translateY(-10px) scale(1.02) rotateY(0deg) rotate(0deg)";
              opacity = 1;
              zIndex = 30;
              filter = "brightness(1)";
            } else if (offset === 1) {
              // Right neighbor: tilted slightly right (+5deg) with natural fan drop
              transform = "translateX(300px) translateY(8px) scale(0.86) rotateY(-22deg) rotate(5deg)";
              opacity = 0.74;
              zIndex = 20;
              filter = "brightness(0.80)";
            } else if (offset === 2) {
              // Far right: tilted further right (+8deg) with playing card fan elevation
              transform = "translateX(530px) translateY(20px) scale(0.70) rotateY(-34deg) rotate(8deg)";
              opacity = 0.44;
              zIndex = 10;
              filter = "brightness(0.55) blur(1px)";
            } else if (offset === total - 1) {
              // Left neighbor: tilted slightly left (-5deg) with natural fan drop
              transform = "translateX(-300px) translateY(8px) scale(0.86) rotateY(22deg) rotate(-5deg)";
              opacity = 0.74;
              zIndex = 20;
              filter = "brightness(0.80)";
            } else if (offset === total - 2) {
              // Far left: tilted further left (-8deg) with playing card fan elevation
              transform = "translateX(-530px) translateY(20px) scale(0.70) rotateY(34deg) rotate(-8deg)";
              opacity = 0.44;
              zIndex = 10;
              filter = "brightness(0.55) blur(1px)";
            }

            return (
              <div
                key={idx}
                onClick={() => !isCenter && goToSlide(idx)}
                style={{
                  position: "absolute",
                  width: "330px",
                  height: "500px",
                  borderRadius: "26px",
                  overflow: "hidden",
                  backgroundColor: "#111625",
                  border: isCenter
                    ? "2px solid rgba(251, 191, 36, 0.4)"
                    : "1px solid rgba(255, 255, 255, 0.12)",
                  transform,
                  opacity,
                  zIndex,
                  filter,
                  transformOrigin: "bottom center",
                  transition: "all 750ms cubic-bezier(0.25, 1, 0.5, 1)",
                  boxShadow: isCenter
                    ? "0 30px 70px rgba(0,0,0,0.9), 0 0 40px rgba(251,191,36,0.25)"
                    : "0 18px 40px rgba(0,0,0,0.65)",
                  cursor: isCenter ? "default" : "pointer",
                }}
              >
                {/* Photo */}
                <img
                  src={item.img}
                  alt={item.titleLine1}
                  onError={(e) => {
                    // Fallback to placeholder if asset path is missing
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1510590337019-5ef2d39aa786?q=80&w=800&auto=format&fit=crop";
                  }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: isCenter ? "scale(1.02)" : "scale(1)",
                    transition: "transform 750ms ease",
                  }}
                />

                {/* Dark Vignette Overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(7,10,20,0.3) 0%, rgba(7,10,20,0.1) 25%, rgba(7,10,20,0.65) 60%, rgba(7,10,20,0.96) 100%)",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                />

                {/* Content Overlay */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    padding: "22px 20px 24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    textAlign: "center",
                    zIndex: 20,
                    opacity: isCenter ? 1 : 0,
                    transform: isCenter ? "translateY(0px)" : "translateY(16px)",
                    transition: "opacity 450ms ease, transform 450ms ease",
                    pointerEvents: isCenter ? "auto" : "none",
                  }}
                >
                  {/* Tag badge */}
                  <div style={{ textAlign: "right", width: "100%" }}>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        color: "#fbbf24",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        padding: "4px 10px",
                        borderRadius: "9999px",
                        backdropFilter: "blur(6px)",
                        border: "1px solid rgba(251,191,36,0.3)",
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      marginTop: "auto",
                      paddingBottom: "4px",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "1.75rem",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: "#ffffff",
                        margin: 0,
                        lineHeight: 1.1,
                        textShadow: "0 3px 12px rgba(0,0,0,0.95)",
                      }}
                    >
                      {item.titleLine1}
                    </h2>

                    {item.titleLine2 && (
                      <span
                        style={{
                          fontSize: "1.15rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "#fef3c7",
                          lineHeight: 1.2,
                          textShadow: "0 3px 10px rgba(0,0,0,0.9)",
                        }}
                      >
                        {item.titleLine2}
                      </span>
                    )}

                    <div
                      style={{
                        width: "36px",
                        height: "2px",
                        backgroundColor: "#fbbf24",
                        borderRadius: "2px",
                        margin: "6px auto 5px",
                        boxShadow: "0 0 10px rgba(251,191,36,0.8)",
                      }}
                    />

                    {item.desc && (
                      <p
                        style={{
                          fontSize: "0.82rem",
                          color: "rgba(255,255,255,0.9)",
                          maxWidth: "280px",
                          margin: "0 0 12px",
                          lineHeight: 1.35,
                          textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                        }}
                      >
                        {item.desc}
                      </p>
                    )}

                    <a
                      href={item.ctaUrl || "#"}
                      onClick={(e) => {
                        if (onCtaClick) {
                          e.preventDefault();
                          onCtaClick(item);
                        }
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 20px",
                        borderRadius: "9999px",
                        background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
                        color: "#0f172a",
                        fontSize: "0.72rem",
                        fontWeight: 900,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        textDecoration: "none",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.4), 0 0 20px rgba(251,191,36,0.4)",
                        cursor: "pointer",
                        transition: "transform 200ms ease, box-shadow 200ms ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      <span>{item.ctaText || "Explore"}</span>
                      <ArrowRightIcon />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          aria-label="Previous card"
          style={{
            position: "absolute",
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "rgba(15,23,42,0.75)",
            border: "1px solid rgba(251,191,36,0.3)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(10px)",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            zIndex: 40,
            transition: "all 200ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(251,191,36,0.2)";
            e.currentTarget.style.borderColor = "#fbbf24";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(15,23,42,0.75)";
            e.currentTarget.style.borderColor = "rgba(251,191,36,0.3)";
          }}
        >
          <ChevronLeftIcon />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next card"
          style={{
            position: "absolute",
            right: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "rgba(15,23,42,0.75)",
            border: "1px solid rgba(251,191,36,0.3)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(10px)",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            zIndex: 40,
            transition: "all 200ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(251,191,36,0.2)";
            e.currentTarget.style.borderColor = "#fbbf24";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(15,23,42,0.75)";
            e.currentTarget.style.borderColor = "rgba(251,191,36,0.3)";
          }}
        >
          <ChevronRightIcon />
        </button>

        {/* Pagination Dots */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", zIndex: 30 }}>
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                height: "8px",
                width: idx === currentIndex ? "28px" : "8px",
                borderRadius: "9999px",
                backgroundColor: idx === currentIndex ? "#fbbf24" : "rgba(255,255,255,0.25)",
                border: "none",
                cursor: "pointer",
                boxShadow: idx === currentIndex ? "0 0 12px rgba(251,191,36,0.8)" : "none",
                transition: "all 300ms ease",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export const Component = CoverFlowCarousel;
export default CoverFlowCarousel;
