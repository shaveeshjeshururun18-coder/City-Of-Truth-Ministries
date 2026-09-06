"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { ChevronLeft, ChevronRight, Heart, ArrowUpRight, Maximize2, X } from "lucide-react";

export interface FilmstripProject {
  id: string;
  title: string;
  subtitle: string;
  url?: string;
  img: string;
  tag?: string;
}

export const defaultHelpingHandsProjects: FilmstripProject[] = [
  {
    id: "widow-care",
    title: "Widows Care & Support",
    subtitle: "Provision & Comfort",
    tag: "Welfare & Charity",
    url: "#helping-hands",
    img: "/ministry/IMG-20231230-WA0007.jpg",
  },
  {
    id: "food-distribution",
    title: "Essential Food Relief",
    subtitle: "Nourishing Families",
    tag: "Compassion Drive",
    url: "#helping-hands",
    img: "/ministry/IMG-20231230-WA0008.jpg",
  },
  {
    id: "home-visits",
    title: "Pastoral Home Blessings",
    subtitle: "Prayer & Personal Care",
    tag: "Door-to-Door",
    url: "#helping-hands",
    img: "/ministry/IMG-20231230-WA0009.jpg",
  },
  {
    id: "children-welfare",
    title: "Orphan & Child Support",
    subtitle: "Education & Hope",
    tag: "Youth Care",
    url: "#helping-hands",
    img: "/ministry/IMG-20231230-WA0011.jpg",
  },
  {
    id: "elderly-shelter",
    title: "Elders Fellowship & Aid",
    subtitle: "Dignity & Health",
    tag: "Honor the Elders",
    url: "#helping-hands",
    img: "/ministry/IMG-20231230-WA0013.jpg",
  },
  {
    id: "community-relief",
    title: "Emergency Medical Relief",
    subtitle: "Healing & Restoration",
    tag: "Rapid Aid",
    url: "#helping-hands",
    img: "/ministry/IMG-20231230-WA0014.jpg",
  },
];

export interface ShaderFilmstripCarouselProps {
  projects?: FilmstripProject[];
  className?: string;
}

export function ShaderFilmstripCarousel({
  projects = defaultHelpingHandsProjects,
  className = "",
}: ShaderFilmstripCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMaximized, setIsMaximized] = useState(false);

  const total = projects.length;
  const targetRotationYRef = useRef(0);
  const currentRotationYRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const lastTimeRef = useRef(0);

  const angleStep = (Math.PI * 2) / Math.max(total, 1);

  const rotateToIndex = useCallback(
    (index: number) => {
      const safeIndex = (index + total) % total;
      setCurrentIndex(safeIndex);
      targetRotationYRef.current = -safeIndex * angleStep;
    },
    [total, angleStep]
  );

  const nextSlide = useCallback(() => {
    rotateToIndex(currentIndex + 1);
  }, [currentIndex, rotateToIndex]);

  const prevSlide = useCallback(() => {
    rotateToIndex(currentIndex - 1);
  }, [currentIndex, rotateToIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 580;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050713, 0.045);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0.15, 7.0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // Create filmstrip texture on 2D canvas
    function createFilmstripTexture(imagePath: string, projectNumber: number) {
      const c = document.createElement("canvas");
      c.width = 1024;
      c.height = 512;
      const ctx = c.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(c);

      // Film background
      ctx.fillStyle = "#0a0c16";
      ctx.fillRect(0, 0, c.width, c.height);

      // Sprocket holes
      ctx.fillStyle = "#000000";
      const holeW = 20,
        holeH = 26,
        holeSpacing = 36;
      for (let x = 16; x < c.width; x += holeSpacing) {
        ctx.beginPath();
        ctx.roundRect(x, 10, holeW, holeH, 4);
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(x, c.height - holeH - 10, holeW, holeH, 4);
        ctx.fill();
      }

      // Frame border
      ctx.strokeStyle = "#272a3e";
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 48, c.width - 60, c.height - 96);

      // Placeholder
      ctx.fillStyle = "#12172b";
      ctx.fillRect(32, 50, c.width - 64, c.height - 100);

      // Film edge label
      ctx.font = "bold 13px 'Space Grotesk', sans-serif";
      ctx.fillStyle = "rgba(251, 191, 36, 0.85)";
      ctx.fillText(
        `HELPING HANDS • CHARITY ARCHIVE • FRAME ${projectNumber.toString().padStart(2, "0")}`,
        40,
        32
      );

      const texture = new THREE.CanvasTexture(c);
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, 32, 50, c.width - 64, c.height - 100);
        ctx.font = "bold 13px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "rgba(251, 191, 36, 0.9)";
        ctx.fillText(
          `HELPING HANDS • CHARITY ARCHIVE • FRAME ${projectNumber.toString().padStart(2, "0")}`,
          40,
          32
        );
        texture.needsUpdate = true;
      };
      img.src = imagePath;

      return texture;
    }

    // Cylindrical Carousel Group
    const carouselGroup = new THREE.Group();
    scene.add(carouselGroup);

    const radius = 4.4;
    const panelWidth = 2.45;
    const panelHeight = 1.38;

    const materials: THREE.MeshStandardMaterial[] = [];
    const geometries: THREE.PlaneGeometry[] = [];

    projects.forEach((proj, i) => {
      const angle = i * angleStep;
      const geometry = new THREE.PlaneGeometry(panelWidth, panelHeight, 16, 1);

      // Curve panel along the cylinder radius
      const pos = geometry.attributes.position;
      for (let j = 0; j < pos.count; j++) {
        const x = pos.getX(j);
        const zCurve = -(x * x) / (2 * radius);
        pos.setZ(j, zCurve);
      }
      geometry.computeVertexNormals();
      geometries.push(geometry);

      const texture = createFilmstripTexture(proj.img, i + 1);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        roughness: 0.35,
        metalness: 0.15,
      });
      materials.push(material);

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = Math.sin(angle) * radius;
      mesh.position.z = Math.cos(angle) * radius;
      mesh.rotation.y = angle;

      carouselGroup.add(mesh);
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xfff4d6, 2.6);
    spotLight.position.set(0, 4, 8);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.8;
    scene.add(spotLight);

    const backGlow = new THREE.PointLight(0xfbbf24, 2.2, 16);
    backGlow.position.set(0, -2, -2);
    scene.add(backGlow);

    const goldFill = new THREE.PointLight(0xffaa22, 1.8, 12);
    goldFill.position.set(0, 2, 4);
    scene.add(goldFill);

    // Pointer events for drag/swipe
    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      startXRef.current = e.clientX;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - startXRef.current;
      startXRef.current = e.clientX;
      targetRotationYRef.current += deltaX * 0.0035;
    };

    const onPointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      const rawIndex = Math.round(-targetRotationYRef.current / angleStep);
      const safeIndex = ((rawIndex % total) + total) % total;
      rotateToIndex(safeIndex);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    container.addEventListener("mousemove", onMouseMove);

    // Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth rotation interpolation
      currentRotationYRef.current +=
        (targetRotationYRef.current - currentRotationYRef.current) * 0.08;
      carouselGroup.rotation.y = currentRotationYRef.current;

      // Subtle float and mouse perspective tilt from shader-selected-work
      carouselGroup.rotation.x =
        Math.sin(clock.getElapsedTime() * 0.8) * 0.02 - mouseRef.current.y * 0.035;
      carouselGroup.rotation.z = -mouseRef.current.x * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 800;
      height = container.clientHeight || 580;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", handleResize);

      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
      renderer.dispose();
    };
  }, [projects, total, angleStep, rotateToIndex]);

  const activeProject = projects[currentIndex] || projects[0];

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[620px] sm:h-[660px] overflow-hidden rounded-3xl bg-[#04060f] text-white select-none ${className}`}
      style={{ touchAction: "none" }}
    >
      {/* Ambient background glow from shader-selected-work */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[50vh] rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.14)_0%,rgba(10,14,35,0)_70%)] blur-2xl" />
      </div>

      {/* CRT Vignette & Subtle Scanline Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-20 opacity-80"
        style={{
          background:
            "radial-gradient(circle at center, transparent 45%, rgba(4, 6, 15, 0.88) 100%), linear-gradient(rgba(10, 15, 30, 0) 50%, rgba(0, 0, 0, 0.35) 50%)",
          backgroundSize: "100% 100%, 100% 4px",
          boxShadow: "inset 0 0 80px rgba(0, 0, 0, 0.9)",
        }}
      />

      {/* Active Project Overlay Header */}
      <div className="absolute top-8 left-0 w-full flex flex-col items-center text-center z-30 pointer-events-none px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[11px] font-black uppercase tracking-[0.25em] mb-2 backdrop-blur-md">
          <Heart size={12} className="fill-current" />
          {activeProject.tag || "Helping Hands"}
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] transition-all duration-300">
          {activeProject.title}
        </h2>
        <div className="mt-2 flex items-center gap-3 text-xs sm:text-sm text-slate-300 uppercase tracking-widest font-semibold pointer-events-auto">
          <span>{activeProject.subtitle}</span>
          <span className="text-amber-400">•</span>
          <span className="text-amber-400/90 font-mono">
            FRAME {(currentIndex + 1).toString().padStart(2, "0")} / {total.toString().padStart(2, "0")}
          </span>
          <button
            onClick={() => setIsMaximized(true)}
            aria-label="Maximize photo"
            className="ml-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/40 text-amber-300 text-[11px] font-bold tracking-wider hover:scale-105 transition-all cursor-pointer"
          >
            <Maximize2 size={12} />
            <span>Maximize</span>
          </button>
        </div>
      </div>

      {/* WebGL Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10 block cursor-grab active:cursor-grabbing" />

      {/* Left Navigation Arrow */}
      <button
        onClick={prevSlide}
        aria-label="Previous Frame"
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-2xl bg-black/50 border border-amber-400/30 text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-amber-500 hover:text-black hover:border-amber-400 shadow-xl"
      >
        <ChevronLeft size={22} />
      </button>

      {/* Right Navigation Arrow */}
      <button
        onClick={nextSlide}
        aria-label="Next Frame"
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-2xl bg-black/50 border border-amber-400/30 text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-amber-500 hover:text-black hover:border-amber-400 shadow-xl"
      >
        <ChevronRight size={22} />
      </button>

      {/* Pagination Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30 pointer-events-auto">
        {projects.map((_, idx) => (
          <button
            key={idx}
            onClick={() => rotateToIndex(idx)}
            aria-label={`Jump to frame ${idx + 1}`}
            className={`transition-all duration-300 ${
              idx === currentIndex
                ? "w-8 h-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                : "w-2 h-2 rounded-full bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Maximized Lightbox Modal */}
      {isMaximized && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-black/95 backdrop-blur-2xl p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsMaximized(false)}
        >
          {/* Top Bar */}
          <div
            className="w-full max-w-6xl flex items-center justify-between z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-amber-400 text-xs font-black uppercase tracking-widest">
                {activeProject.tag || "Helping Hands"}
              </span>
              <span className="text-white/60 text-xs font-mono">
                {currentIndex + 1} / {total}
              </span>
            </div>

            <button
              onClick={() => setIsMaximized(false)}
              aria-label="Close maximized view"
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
            >
              <X size={22} />
            </button>
          </div>

          {/* Main Photo */}
          <div
            className="relative flex-1 w-full max-w-6xl flex items-center justify-center my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              aria-label="Previous Image"
              className="absolute left-2 sm:left-4 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-2xl"
            >
              <ChevronLeft size={28} />
            </button>

            <img
              src={activeProject.img}
              alt={activeProject.title}
              className="max-h-[78vh] max-w-[90vw] object-contain rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] border border-white/15 animate-in zoom-in-95 duration-200"
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              aria-label="Next Image"
              className="absolute right-2 sm:right-4 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-2xl"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Caption */}
          <div
            className="w-full max-w-3xl flex flex-col items-center gap-1 z-10 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base sm:text-lg font-serif font-black text-white">
              {activeProject.title}
            </h3>
            <p className="text-xs text-amber-300/80 uppercase tracking-widest">
              {activeProject.subtitle}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShaderFilmstripCarousel;
