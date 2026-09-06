"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

interface RipplePoint {
  id: number;
  x: number;
  y: number;
}

export interface BackgroundRippleEffectProps {
  className?: string;
  children?: React.ReactNode;
  maxRipples?: number;
}

export const BackgroundRippleEffect: React.FC<BackgroundRippleEffectProps> = ({
  className,
  children,
  maxRipples = 6,
}) => {
  const [ripples, setRipples] = useState<RipplePoint[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple: RipplePoint = {
      id: Date.now() + Math.random(),
      x,
      y,
    };
    setRipples((prev) => [...prev.slice(-maxRipples), newRipple]);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative w-full overflow-hidden select-none cursor-pointer",
        className
      )}
    >
      {/* Background Interactive Ripple Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Ambient Concentric Waves */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          {[0, 1, 2, 3].map((ring) => (
            <motion.div
              key={`ambient-ring-${ring}`}
              initial={{ scale: 0.8, opacity: 0.35 }}
              animate={{
                scale: [0.8, 1.8, 2.8],
                opacity: [0.35, 0.15, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 6,
                delay: ring * 1.5,
                ease: "easeOut",
              }}
              className="absolute -top-[250px] -left-[250px] w-[500px] h-[500px] rounded-full border border-sky-400/20 shadow-[0_0_40px_rgba(56,189,248,0.15)]"
            />
          ))}
        </div>

        {/* Dynamic Click Ripples */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <React.Fragment key={ripple.id}>
              {[0, 1, 2].map((waveIndex) => (
                <motion.div
                  key={`${ripple.id}-wave-${waveIndex}`}
                  initial={{ scale: 0, opacity: 0.7 }}
                  animate={{
                    scale: 3.5,
                    opacity: 0,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 1.8,
                    delay: waveIndex * 0.25,
                    ease: "easeOut",
                  }}
                  style={{
                    left: ripple.x - 100,
                    top: ripple.y - 100,
                    width: 200,
                    height: 200,
                  }}
                  className="absolute rounded-full border-2 border-indigo-400/50 bg-gradient-to-r from-sky-400/10 to-indigo-500/10 backdrop-blur-xs pointer-events-none shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                />
              ))}
            </React.Fragment>
          ))}
        </AnimatePresence>
      </div>

      {/* Children Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};
export default BackgroundRippleEffect;
