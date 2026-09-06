"use client";
import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useLocation } from "react-router-dom";

export interface SmoothScrollProps {
  children: React.ReactNode;
  currentView?: string;
}

export const SmoothScroll: React.FC<SmoothScrollProps> = ({
  children,
  currentView,
}) => {
  const lenisRef = useRef<Lenis | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Respect accessibility: don't enable smooth scroll if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchViewport =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(max-width: 767px)").matches);

    // Native scrolling is steadier on touch screens and avoids fighting the browser's URL-bar resize.
    if (prefersReducedMotion || isTouchViewport) return;

    // In nested editor iframe, allow parent native scrolling
    const isFrame =
      typeof window !== "undefined" &&
      window.self !== window.top &&
      window.location.search.includes("preview=true");

    if (isFrame) return;

    // Initialize snappy, buttery smooth Lenis momentum scroll
    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.0,
      wheelMultiplier: 1.0,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Provide safe global control hook for modals/drawers
    (window as any).__lenis = lenis;

    // Observe body class changes (e.g. lightbox-open, modal-open) to stop Lenis safely
    const observer = new MutationObserver(() => {
      const hasModal =
        document.body.classList.contains("lightbox-open") ||
        document.body.classList.contains("overflow-hidden") ||
        document.body.style.overflow === "hidden";

      if (hasModal) {
        lenis.stop();
      } else {
        lenis.start();
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as any).__lenis;
    };
  }, []);

  // Safely reset scroll position on view or route changes
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, currentView]);

  return <>{children}</>;
};

export default SmoothScroll;
