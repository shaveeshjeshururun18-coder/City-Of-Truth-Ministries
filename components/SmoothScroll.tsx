"use client";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

export interface SmoothScrollProps {
  children: React.ReactNode;
  currentView?: string;
}

export const SmoothScroll: React.FC<SmoothScrollProps> = ({
  children,
  currentView,
}) => {
  const location = useLocation();

  useEffect(() => {
    let frameId = 0;
    let idleTimer = 0;
    const root = document.documentElement;

    const markScrolling = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        root.classList.add('is-scrolling');
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(() => root.classList.remove('is-scrolling'), 120);
      });
    };

    window.addEventListener('scroll', markScrolling, { passive: true });
    return () => {
      window.removeEventListener('scroll', markScrolling);
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(idleTimer);
      root.classList.remove('is-scrolling');
    };
  }, []);

  // Native browser scrolling stays on the compositor thread. The previous
  // virtual scroll loop intercepted every wheel event and kept a permanent
  // requestAnimationFrame loop alive, which made long pages feel resistant.
  // Keep only the route/view reset; links can still request smooth scrolling.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, currentView]);

  return <>{children}</>;
};

export default SmoothScroll;
