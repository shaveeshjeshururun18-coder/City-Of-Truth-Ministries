import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Menu, X } from 'lucide-react';

interface TinyTrails404Props {
  onBackHome?: () => void;
}

export const TinyTrails404: React.FC<TinyTrails404Props> = ({ onBackHome }) => {
  const [scaleY, setScaleY] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  // Measure and dynamically calculate the vertical Y-scale for the background 404 text
  useEffect(() => {
    const updateScale = () => {
      if (textRef.current && textRef.current.offsetHeight > 0) {
        const measuredHeight = textRef.current.offsetHeight;
        const calculatedScaleY = (window.innerHeight / measuredHeight) * 1.4;
        setScaleY(calculatedScaleY);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    // Double check after fonts load
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateScale);
    }

    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Lock body scroll when mobile menu overlay is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Load Inter font from Google Fonts dynamically
  useEffect(() => {
    const fontId = 'google-font-inter-tinytrails';
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const handleHomeClick = (e?: React.MouseEvent) => {
    if (onBackHome) {
      e?.preventDefault();
      onBackHome();
    } else {
      window.location.href = '/';
    }
  };

  const navLinks = ['About Us', 'Programs', 'Reviews', 'FAQ', 'Contacts'];

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex flex-col select-none"
      style={{
        background: 'linear-gradient(to bottom, #FF8233 0%, #FDAC55 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* ---------------- BACKGROUND 404 TEXT EFFECT ---------------- */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
        style={{
          opacity: 0.8,
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 95%)',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 95%)'
        }}
      >
        <div
          ref={textRef}
          className="text-white font-black leading-none tracking-tighter whitespace-nowrap select-none will-change-transform"
          style={{
            fontSize: 'clamp(200px, 48vw, 800px)',
            transform: `scale(1.15, ${scaleY})`,
            transformOrigin: 'center'
          }}
        >
          404
        </div>

        {/* Centered White Oval over the 404 */}
        <div
          className="absolute rounded-full bg-white pointer-events-none select-none h-[22vh] sm:h-[26vh] md:h-[50vh] w-[clamp(120px,20vw,400px)] will-change-transform"
          style={{
            transform: `scale(1, ${scaleY})`,
            transformOrigin: 'center'
          }}
        />
      </div>

      {/* ---------------- NAVIGATION BAR ---------------- */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 sm:py-5 w-full">
        {/* Left: Brand Logo */}
        <a
          href="/"
          onClick={(e) => handleHomeClick(e)}
          className="flex items-center gap-2 cursor-pointer group"
        >
          {/* 2x2 grid of small white circles */}
          <div className="grid grid-cols-2 gap-0.5 sm:gap-1">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white transition-transform group-hover:scale-110" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white transition-transform group-hover:scale-110 delay-75" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white transition-transform group-hover:scale-110 delay-100" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white transition-transform group-hover:scale-110 delay-150" />
          </div>
          <span className="text-white font-bold text-lg sm:text-xl tracking-tight ml-1">
            TinyTrails
          </span>
        </a>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navLinks.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="px-4 py-1.5 text-sm font-medium rounded-full bg-white text-[#F16524] hover:opacity-90 hover:shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Right: Menu Button */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-white bg-[#F16524] hover:opacity-90 transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 border-none outline-none"
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4 text-white" />
          <span className="text-sm font-medium hidden sm:inline">Menu</span>
        </button>
      </header>

      {/* ---------------- CENTER VIDEO ---------------- */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        style={{ marginTop: 'calc(-6vh - 40px)' }}
      >
        <div className="w-[120vw] h-[85vh] sm:w-[70vw] sm:h-[70vh] md:w-[62vw] md:h-[78vh] flex items-center justify-center">
          <video preload="none"             autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain pointer-events-none mix-blend-darken"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260713_234424_b1332b69-2e69-4302-8dbc-40f86846afbd.mp4"
          />
        </div>
      </div>

      {/* ---------------- BOTTOM CONTENT ---------------- */}
      <div className="relative z-30 mt-auto pb-8 sm:pb-16 flex flex-col items-center text-center px-4">
        <h1 className="text-white text-lg sm:text-xl md:text-2xl font-medium tracking-tight mb-3 sm:mb-4 select-text">
          Oops, something went wrong!
        </h1>
        <a
          href="/"
          onClick={(e) => handleHomeClick(e)}
          className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-full text-white font-semibold text-sm sm:text-base bg-[#F16524] hover:scale-105 active:scale-95 shadow-lg transition-all duration-200 cursor-pointer no-underline"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          <span>Back to Home</span>
        </a>
      </div>

      {/* ---------------- MOBILE MENU OVERLAY ---------------- */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMenuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setIsMenuOpen(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Drawer Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-full sm:w-[380px] bg-gradient-to-br from-[#FF6B1A] to-[#FF9642] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col p-6 sm:p-8 z-10 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-2 gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight ml-1">
                TinyTrails
              </span>
            </div>

            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer border-none outline-none"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Drawer Navigation Links */}
          <div className="flex flex-col gap-3 my-auto py-8">
            {navLinks.map((item, idx) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setIsMenuOpen(false)}
                style={{
                  transitionDelay: `${isMenuOpen ? idx * 50 + 100 : 0}ms`
                }}
                className={`w-full text-left px-6 py-3.5 sm:py-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-98 transition-all text-white font-semibold text-lg cursor-pointer transform duration-300 ${
                  isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'
                }`}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Drawer Bottom CTA Button */}
          <div className="pt-4 border-t border-white/10 mt-auto">
            <button
              onClick={(e) => {
                setIsMenuOpen(false);
                handleHomeClick(e);
              }}
              className="w-full py-4 rounded-full bg-white font-semibold text-base text-[#F16524] hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg cursor-pointer border-none outline-none"
            >
              <ArrowLeft className="w-5 h-5 text-[#F16524]" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TinyTrails404;
