"use client";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export interface DottedGlowBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  dotSize?: number;
  gap?: number;
  glowColor?: string;
}

export const DottedGlowBackground: React.FC<DottedGlowBackgroundProps> = ({
  children,
  className,
  dotSize = 1.5,
  gap = 24,
  glowColor = "rgba(99, 102, 241, 0.22)",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: -1000,
    y: -1000,
  });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: -1000, y: -1000 });
      }}
      className={cn(
        "relative w-full overflow-hidden bg-[#070913] text-slate-100",
        className
      )}
    >
      {/* Ambient Central Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-blue-500/15 to-purple-600/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-20 left-10 w-[400px] h-[350px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* SVG Dotted Matrix Pattern */}
      <svg
        className="absolute inset-0 h-full w-full pointer-events-none opacity-40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dotted-glow-pattern"
            width={gap}
            height={gap}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={gap / 2}
              cy={gap / 2}
              r={dotSize}
              fill="rgba(148, 163, 184, 0.45)"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotted-glow-pattern)" />
      </svg>

      {/* Interactive Cursor Spotlight Glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(450px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 80%)`,
        }}
      />

      {/* Foreground Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};
export default DottedGlowBackground;
