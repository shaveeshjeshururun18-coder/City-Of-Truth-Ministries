"use client";
import React, { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Sparkles } from "lucide-react";

export interface CoverProps {
  children?: React.ReactNode;
  className?: string;
}

export const Cover: React.FC<CoverProps> = ({ children, className }) => {
  const [hovered, setHovered] = useState(false);
  const id = useId();

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative inline-block px-3 py-1 transition-all duration-300 rounded-xl group/cover cursor-pointer",
        className
      )}
    >
      {/* Radiant Glowing Background */}
      <motion.span
        initial={{ opacity: 0.8, scale: 0.98 }}
        animate={{
          opacity: hovered ? 1 : 0.85,
          scale: hovered ? 1.02 : 1,
        }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 via-sky-400/25 to-amber-400/20 backdrop-blur-sm border border-indigo-400/40 shadow-[0_0_25px_rgba(99,102,241,0.35)]"
      />

      {/* Beam border animation */}
      <span className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <motion.span
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "linear",
          }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-sky-300/60 to-transparent blur-xs transform -skew-x-12"
        />
      </span>

      {/* Floating Sparkles */}
      <AnimatePresence>
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[
            { top: "-6px", left: "10%", delay: 0, size: 10 },
            { top: "-8px", right: "15%", delay: 0.6, size: 12 },
            { bottom: "-6px", left: "25%", delay: 1.2, size: 9 },
            { bottom: "-8px", right: "20%", delay: 1.8, size: 11 },
          ].map((spark, idx) => (
            <motion.div
              key={`${id}-spark-${idx}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.6, 1.2, 0.4],
                y: [0, -6, -12],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
                delay: spark.delay,
                ease: "easeInOut",
              }}
              style={{
                position: "absolute",
                top: spark.top,
                left: spark.left,
                right: spark.right,
                bottom: spark.bottom,
              }}
              className="text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]"
            >
              <Sparkles size={spark.size} />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Radiant Foreground Text */}
      <motion.span
        animate={{
          textShadow: hovered
            ? "0 0 16px rgba(129, 140, 248, 0.8), 0 0 30px rgba(56, 189, 248, 0.6)"
            : "0 0 10px rgba(129, 140, 248, 0.4)",
        }}
        className="relative z-10 font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-sky-200"
      >
        {children}
      </motion.span>
    </span>
  );
};
export default Cover;
