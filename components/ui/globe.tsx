"use client";
import React, { useEffect, useRef } from "react";
import createGlobe, { Globe as CobeGlobe } from "cobe";
import { cn } from "../../lib/utils";

export interface GlobeProps {
  className?: string;
  markers?: Array<{ location: [number, number]; size: number }>;
  arcs?: Array<{ from: [number, number]; to: [number, number]; color?: [number, number, number] }>;
}

export const Globe: React.FC<GlobeProps> = ({
  className,
  markers = [
    { location: [10.3275, 76.9404], size: 0.12 }, // Valparai Sanctuary, Tamil Nadu
    { location: [31.7683, 35.2137], size: 0.1 }, // Jerusalem, Israel
    { location: [13.0827, 80.2707], size: 0.06 }, // Chennai
    { location: [11.0168, 76.9558], size: 0.07 }, // Coimbatore
    { location: [51.5074, -0.1278], size: 0.05 }, // London
    { location: [40.7128, -74.006], size: 0.06 }, // New York
    { location: [1.3521, 103.8198], size: 0.05 }, // Singapore
    { location: [-33.8688, 151.2093], size: 0.05 }, // Sydney
  ],
  arcs = [
    {
      from: [31.7683, 35.2137], // Jerusalem
      to: [10.3275, 76.9404], // Valparai
      color: [0.96, 0.77, 0.34], // Sacred Amber / Gold
    },
    {
      from: [10.3275, 76.9404],
      to: [13.0827, 80.2707],
      color: [0.35, 0.6, 0.95],
    },
    {
      from: [10.3275, 76.9404],
      to: [51.5074, -0.1278],
      color: [0.35, 0.6, 0.95],
    },
  ],
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);

  useEffect(() => {
    let phi = 0;
    let width = 0;
    let currentGlobe: CobeGlobe | null = null;
    let animationFrameId: number;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };

    window.addEventListener("resize", onResize);
    onResize();

    const canvasWidth = width || 500;

    if (canvasRef.current) {
      currentGlobe = createGlobe(canvasRef.current, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 2, 2),
        width: canvasWidth * 2,
        height: canvasWidth * 2,
        phi: 0,
        theta: 0.25,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 18000,
        mapBrightness: 6,
        baseColor: [0.18, 0.22, 0.35],
        markerColor: [0.2, 0.85, 1], // Radiant Cyan / Celestial Blue
        glowColor: [0.25, 0.35, 0.9],
        markers,
        arcs,
        arcWidth: 1.5,
        arcHeight: 0.4,
      });

      const animate = () => {
        if (!pointerInteracting.current) {
          phi += 0.0035;
        }
        if (currentGlobe) {
          currentGlobe.update({
            phi: phi + pointerInteractionMovement.current,
            width: (width || canvasWidth) * 2,
            height: (width || canvasWidth) * 2,
          });
        }
        animationFrameId = requestAnimationFrame(animate);
      };

      animationFrameId = requestAnimationFrame(animate);

      // Soft fade in canvas
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1";
      }
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (currentGlobe) {
        currentGlobe.destroy();
      }
    };
  }, [markers, arcs]);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-full max-w-[560px] aspect-square mx-auto",
        className
      )}
    >
      {/* Radiant Glow Behind Globe */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 via-sky-500/15 to-transparent blur-3xl pointer-events-none" />

      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current =
            e.clientX - pointerInteractionMovement.current;
          if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = "grab";
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = "grab";
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta * 0.006;
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta * 0.006;
          }
        }}
        className="w-full h-full opacity-0 transition-opacity duration-1000 cursor-grab touch-none"
      />
    </div>
  );
};
export default Globe;
