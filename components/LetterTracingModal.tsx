import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw, PenTool, Check, Eye, EyeOff, Play, Pause, Award, Undo2, Sparkles } from 'lucide-react';

/**
 * LetterTracingModal
 * -------------------
 * A finger/stylus/mouse tracing surface for practicing a single Hebrew letter
 * (modern square script or Paleo-Hebrew), with live approximate-accuracy
 * feedback, an animated stroke-order demonstration, and progressive guide
 * levels (trace -> faint -> free) modeled on how handwriting-practice
 * curricula scaffold learners from guided tracing to free recall.
 *
 * Notes on accuracy / authenticity, so nothing here overclaims precision:
 * - The accuracy score is an approximate pixel-overlap heuristic (with a
 *   small tolerance radius), not a certified handwriting assessment.
 * - The stroke-order demo animates real per-stroke geometry ONLY when the
 *   caller supplies `demoStrokePaths` (SVG path `d` strings, in writing
 *   order, in a 0-100 viewBox). Without real per-letter stroke data we
 *   cannot responsibly assert a specific stroke path for a specific Hebrew
 *   letter, so the component falls back to one generic right-to-left demo
 *   stroke rather than pretending false precision.
 */

export interface LetterTracingModalProps {
  isOpen: boolean;
  onClose: () => void;
  letterName: string;
  hebrewSymbol: string;
  paleoImgSrc?: string;
  mode: 'modern' | 'paleo';
  /**
   * Optional real stroke-order data: one SVG path `d` string per stroke, in
   * writing order, authored in a 0-100 viewBox. When omitted, the demo plays
   * a single generic right-to-left stroke instead of guessing this letter's
   * actual stroke path.
   */
  demoStrokePaths?: string[];
  /** Plays a short synthesized chime on a high-accuracy trace. Default: true. */
  soundEnabled?: boolean;
}

type GuideLevel = 'trace' | 'faint' | 'free';
type AccuracyTone = 'idle' | 'low' | 'good' | 'high';
type Point = { x: number; y: number };

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const GOLD_PALETTES = [
  { name: 'Divine Gold', color: '#fbbf24' },
  { name: 'Sun Amber', color: '#f59e0b' },
  { name: 'Sacred Honey', color: '#fef08a' },
  { name: 'Deep Bronze', color: '#d97706' },
] as const;

const STROKE_WIDTHS = [
  { label: 'Fine', value: 8 },
  { label: 'Medium', value: 14 },
  { label: 'Bold', value: 22 },
] as const;

const GUIDE_LEVELS: { id: GuideLevel; label: string; opacity: number }[] = [
  { id: 'trace', label: 'Trace', opacity: 0.4 },
  { id: 'faint', label: 'Faint', opacity: 0.15 },
  { id: 'free', label: 'Free', opacity: 0 },
];

const SCORE_SIZE = 96; // offscreen comparison resolution (px)
const SCORE_TOLERANCE_RADIUS = 2; // px of forgiveness at SCORE_SIZE resolution
const ALPHA_THRESHOLD = 40;
const MIN_INK_PIXELS = 15;
const HIGH_ACCURACY = 85;
const GOOD_ACCURACY = 65;
const MAX_UNDO_STEPS = 6;
const DEMO_SPEED_PX_PER_SEC = 70; // in 0-100 viewBox units
// A faithful port of the original demo's generic upper-right -> lower-left
// curve (kept as a deliberate, honest fallback — see file header).
const GENERIC_DEMO_PATH = 'M 72.2 30.6 Q 50 50 27.8 72.2';

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function getAccuracyFeedback(accuracy: number | null): { tone: AccuracyTone; message: string } {
  if (accuracy === null) {
    return { tone: 'idle', message: 'Draw along the letter to test accuracy' };
  }
  if (accuracy >= HIGH_ACCURACY) {
    return { tone: 'high', message: `${accuracy}% — Anointed Penmanship!` };
  }
  if (accuracy >= GOOD_ACCURACY) {
    return { tone: 'good', message: `${accuracy}% — Great accuracy, keep going` };
  }
  return { tone: 'low', message: `${accuracy}% — Trace closer to the golden lines` };
}

const ACCURACY_TONE_STYLES: Record<AccuracyTone, { className: string; showSparkle: boolean }> = {
  idle: { className: 'text-slate-400 font-normal', showSparkle: false },
  low: { className: 'text-amber-400 font-semibold', showSparkle: false },
  good: { className: 'text-amber-300 font-black', showSparkle: true },
  high: { className: 'text-emerald-400 font-black', showSparkle: true },
};

/** Rasterizes the alpha channel of ImageData into a flat 0/1 mask. */
function toBinaryMask(alpha: Uint8ClampedArray, size: number, threshold: number): Uint8Array {
  const mask = new Uint8Array(size * size);
  for (let i = 0; i < size * size; i++) {
    mask[i] = alpha[i * 4 + 3] > threshold ? 1 : 0;
  }
  return mask;
}

/** Simple square dilation used to give scoring a few pixels of tolerance. */
function dilateMask(mask: Uint8Array, size: number, radius: number): Uint8Array {
  if (radius <= 0) return mask;
  const out = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let hit = 0;
      for (let dy = -radius; dy <= radius && !hit; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= size) continue;
        const row = ny * size;
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= size) continue;
          if (mask[row + nx]) {
            hit = 1;
            break;
          }
        }
      }
      out[y * size + x] = hit;
    }
  }
  return out;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

/** A short, bright three-note chime. Fails silently if Web Audio is unavailable/blocked. */
function playSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5 – E5 – G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = now + i * 0.09;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.16, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.55);
    });
    setTimeout(() => ctx.close(), 900);
  } catch {
    // Non-essential enhancement — never let audio failures affect tracing.
  }
}

function triggerHapticSuccess() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([15, 40, 15]);
  }
}

// ---------------------------------------------------------------------------
// Small presentational pieces
// ---------------------------------------------------------------------------

function AccuracyMeter({ accuracy }: { accuracy: number | null }) {
  const feedback = getAccuracyFeedback(accuracy);
  const style = ACCURACY_TONE_STYLES[feedback.tone];

  return (
    <div className="mb-3 px-4 py-2.5 rounded-2xl bg-black/60 border border-amber-400/25 flex items-center justify-between shadow-inner">
      <div className="flex items-center gap-2">
        <Award size={18} className="text-amber-400 shrink-0" aria-hidden="true" />
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-amber-200/70 block">
            Accuracy Score
          </span>
          <span className={`text-xs sm:text-sm flex items-center gap-1.5 ${style.className}`}>
            {style.showSparkle && <Sparkles size={13} aria-hidden="true" />}
            {feedback.message}
          </span>
        </div>
      </div>

      {accuracy !== null && (
        <div className="w-20 sm:w-24 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${accuracy}%` }}
            role="progressbar"
            aria-valuenow={accuracy}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}
    </div>
  );
}

function StrokeOrderDemo({ paths, reducedMotion }: { paths: string[]; reducedMotion: boolean }) {
  const activePaths = useMemo(() => (paths.length > 0 ? paths : [GENERIC_DEMO_PATH]), [paths]);
  const pathElRefs = useRef<(SVGPathElement | null)[]>([]);
  const [strokeIndex, setStrokeIndex] = useState(0);
  const [drawnFraction, setDrawnFraction] = useState(0);
  const [tip, setTip] = useState<Point | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setStrokeIndex(activePaths.length);
      setDrawnFraction(1);
      setTip(null);
      return;
    }

    let cancelled = false;
    let rafId = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    let i = 0;

    const playStroke = () => {
      if (cancelled) return;
      setStrokeIndex(i);
      setDrawnFraction(0);
      const el = pathElRefs.current[i];
      const total = el ? el.getTotalLength() : 60;
      const duration = Math.max(500, (total / DEMO_SPEED_PX_PER_SEC) * 1000);
      const start = performance.now();

      const tick = (now: number) => {
        if (cancelled) return;
        const t = Math.min(1, (now - start) / duration);
        setDrawnFraction(t);
        const pathEl = pathElRefs.current[i];
        if (pathEl) {
          setTip(pathEl.getPointAtLength(t * pathEl.getTotalLength()));
        }
        if (t < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          i += 1;
          if (i < activePaths.length) {
            playStroke();
          } else {
            setTip(null);
            timeoutId = setTimeout(() => {
              if (!cancelled) {
                i = 0;
                playStroke();
              }
            }, 900);
          }
        }
      };
      rafId = requestAnimationFrame(tick);
    };

    playStroke();
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [activePaths, reducedMotion]);

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-10" aria-hidden="true">
      {/* Hidden measurement layer: always mounted so getTotalLength/getPointAtLength are available
          for every stroke before it becomes the active one. */}
      <g style={{ opacity: 0 }}>
        {activePaths.map((d, i) => (
          <path
            key={`measure-${i}`}
            ref={(el: SVGPathElement | null) => {
              pathElRefs.current[i] = el;
            }}
            d={d}
            fill="none"
            stroke="black"
          />
        ))}
      </g>

      {activePaths.map((d, i) => {
        if (i > strokeIndex) return null;
        const isActive = i === strokeIndex;
        const total = pathElRefs.current[i]?.getTotalLength() ?? 0;
        const dashOffset = isActive ? total * (1 - drawnFraction) : 0;
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={isActive ? '#fde68a' : '#fbbf24'}
            strokeWidth={isActive ? 2.6 : 2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={isActive ? 0.95 : 0.55}
            strokeDasharray={isActive && total > 0 ? total : undefined}
            strokeDashoffset={isActive && total > 0 ? dashOffset : undefined}
            style={isActive ? { filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.85))' } : undefined}
          />
        );
      })}

      {tip && <circle cx={tip.x} cy={tip.y} r={2.6} fill="#fbbf24" style={{ filter: 'drop-shadow(0 0 3px rgba(245,158,11,0.9))' }} />}
    </svg>
  );
}

function CelebrationBurst() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const parent = canvas?.parentElement;
    if (!canvas || !ctx || !parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const colors = ['#fbbf24', '#f59e0b', '#fef08a', '#fde68a'];
    const particles = Array.from({ length: 26 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.4 + Math.random() * 3.2;
      return {
        x: w / 2,
        y: h / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.1,
        size: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    const duration = 900;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const life = Math.max(0, 1 - elapsed / duration);
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = life;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (elapsed < duration) {
        frame = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-30" style={{ width: '100%', height: '100%' }} />;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const LetterTracingModal: React.FC<LetterTracingModalProps> = ({
  isOpen,
  onClose,
  letterName,
  hebrewSymbol,
  paleoImgSrc,
  mode,
  demoStrokePaths,
  soundEnabled = true,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasBoxRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const logicalSizeRef = useRef(360);
  const pointsRef = useRef<Point[]>([]);
  const activePointerIdRef = useRef<number | null>(null);
  const isDrawingRef = useRef(false);
  const undoStackRef = useRef<ImageData[]>([]);
  const paleoImageRef = useRef<HTMLImageElement | null>(null);

  const [strokeColor, setStrokeColor] = useState<string>(GOLD_PALETTES[0].color);
  const [strokeWidth, setStrokeWidth] = useState<number>(STROKE_WIDTHS[1].value);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [guideLevel, setGuideLevel] = useState<GuideLevel>('trace');
  const [celebration, setCelebration] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  const activeGuide = GUIDE_LEVELS.find((g) => g.id === guideLevel) ?? GUIDE_LEVELS[0];

  // --- Preload the Paleo-Hebrew reference image for scoring (mirrors what's on screen). ---
  useEffect(() => {
    if (mode !== 'paleo' || !paleoImgSrc) {
      paleoImageRef.current = null;
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!cancelled) paleoImageRef.current = img;
    };
    img.onerror = () => {
      if (!cancelled) paleoImageRef.current = null;
    };
    img.src = paleoImgSrc;
    return () => {
      cancelled = true;
    };
  }, [mode, paleoImgSrc]);

  // --- Warm up the reference typeface. Best-effort; not a blocking gate. ---
  useEffect(() => {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.load('60px "Frank Ruhl Libre"').catch(() => {});
    }
  }, []);

  // --- Size the canvas to match how it's actually rendered, and keep it in sync on resize. ---
  useEffect(() => {
    if (!isOpen) return;
    const box = canvasBoxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;

    const applySize = () => {
      if (isDrawingRef.current) return; // don't wipe an in-progress stroke out from under the user
      const rect = box.getBoundingClientRect();
      const size = Math.max(1, Math.round(rect.width));
      logicalSizeRef.current = size;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
      undoStackRef.current = [];
      setCanUndo(false);
      setAccuracy(null);
    };

    applySize();
    const observer = new ResizeObserver(applySize);
    observer.observe(box);
    return () => observer.disconnect();
  }, [isOpen, mode, hebrewSymbol]);

  // --- Escape to close, Cmd/Ctrl+Z to undo, focus trap, and body scroll lock while open. ---
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key.toLowerCase() === 'z' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const list = Array.from(focusable);
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose]);

  // --- Approximate accuracy scoring: user ink vs. the same reference shown on screen. ---
  const computeAccuracy = useCallback(() => {
    const userCanvas = canvasRef.current;
    const userCtx = userCanvas?.getContext('2d');
    if (!userCanvas || !userCtx) return;

    const size = SCORE_SIZE;
    const guideCanvas = document.createElement('canvas');
    guideCanvas.width = size;
    guideCanvas.height = size;
    const gCtx = guideCanvas.getContext('2d');
    if (!gCtx) return;

    if (mode === 'paleo') {
      const img = paleoImageRef.current;
      if (!img) return; // reference still loading — skip this attempt rather than score against nothing
      const fit = Math.min(size / img.width, size / img.height) * 0.82;
      const dw = img.width * fit;
      const dh = img.height * fit;
      gCtx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);
    } else {
      gCtx.fillStyle = '#ffffff';
      gCtx.textAlign = 'center';
      gCtx.textBaseline = 'middle';
      gCtx.font = `${Math.floor(size * 0.65)}px "Frank Ruhl Libre", "Times New Roman", serif`;
      gCtx.fillText(hebrewSymbol, size / 2, size / 2 + size * 0.04);
    }

    let guideAlpha: Uint8ClampedArray;
    try {
      guideAlpha = gCtx.getImageData(0, 0, size, size).data;
    } catch {
      return; // e.g. a cross-origin paleo image tainted the canvas — skip scoring gracefully
    }

    const userScaled = document.createElement('canvas');
    userScaled.width = size;
    userScaled.height = size;
    const uCtx = userScaled.getContext('2d');
    if (!uCtx) return;
    uCtx.drawImage(userCanvas, 0, 0, size, size);
    const userAlpha = uCtx.getImageData(0, 0, size, size).data;

    const guideMask = toBinaryMask(guideAlpha, size, ALPHA_THRESHOLD);
    const userMask = toBinaryMask(userAlpha, size, ALPHA_THRESHOLD);
    const dilatedGuideMask = dilateMask(guideMask, size, SCORE_TOLERANCE_RADIUS);
    const dilatedUserMask = dilateMask(userMask, size, SCORE_TOLERANCE_RADIUS);

    let guidePixels = 0;
    let userPixels = 0;
    let coveredByUser = 0; // guide pixels with nearby user ink
    let userNearGuide = 0; // user pixels that land near the true letter shape

    for (let i = 0; i < size * size; i++) {
      if (guideMask[i]) {
        guidePixels++;
        if (dilatedUserMask[i]) coveredByUser++;
      }
      if (userMask[i]) {
        userPixels++;
        if (dilatedGuideMask[i]) userNearGuide++;
      }
    }

    if (userPixels < MIN_INK_PIXELS) {
      setAccuracy(null);
      return;
    }

    const coverage = guidePixels > 0 ? coveredByUser / guidePixels : 0;
    const precision = userPixels > 0 ? userNearGuide / userPixels : 0;
    const rawScore = (coverage * 0.7 + precision * 0.3) * 100;
    const normalizedScore = Math.min(100, Math.max(12, Math.round(rawScore * 1.35)));

    setAccuracy(normalizedScore);

    if (normalizedScore >= HIGH_ACCURACY) {
      if (!prefersReducedMotion) setCelebration((c) => c + 1);
      if (soundEnabled) playSuccessChime();
      triggerHapticSuccess();
    }
  }, [mode, hebrewSymbol, prefersReducedMotion, soundEnabled]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoStackRef.current = [];
    setCanUndo(false);
    setAccuracy(null);
  }, []);

  const handleUndo = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const previous = undoStackRef.current.pop();
    if (previous) {
      ctx.putImageData(previous, 0, 0);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setCanUndo(undoStackRef.current.length > 0);
    computeAccuracy();
  }, [computeAccuracy]);

  const getPoint = useCallback((clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width > 0 ? logicalSizeRef.current / rect.width : 1;
    return { x: (clientX - rect.left) * scale, y: (clientY - rect.top) * scale };
  }, []);

  const beginStroke = useCallback(
    (point: Point) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      try {
        const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        undoStackRef.current.push(snapshot);
        if (undoStackRef.current.length > MAX_UNDO_STEPS) undoStackRef.current.shift();
        setCanUndo(true);
      } catch {
        // Undo is a convenience, not essential — safe to skip on failure.
      }

      pointsRef.current = [point];
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.shadowColor = 'rgba(251, 191, 36, 0.6)';
      ctx.shadowBlur = 8;
    },
    [strokeColor, strokeWidth]
  );

  const extendStroke = useCallback((point: Point) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pts = pointsRef.current;
    pts.push(point);

    if (pts.length < 3) {
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      return;
    }

    const [p1, p2, p3] = pts.slice(-3);
    const midA = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    const midB = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };
    ctx.beginPath();
    ctx.moveTo(midA.x, midA.y);
    ctx.quadraticCurveTo(p2.x, p2.y, midB.x, midB.y);
    ctx.stroke();
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (isDemoPlaying) return; // don't let a live stroke collide with the demo
      (e.target as Element).setPointerCapture?.(e.pointerId);
      activePointerIdRef.current = e.pointerId;
      isDrawingRef.current = true;
      setIsDrawing(true);
      beginStroke(getPoint(e.clientX, e.clientY));
    },
    [beginStroke, getPoint, isDemoPlaying]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (activePointerIdRef.current !== e.pointerId) return;
      const native = e.nativeEvent as PointerEvent & { getCoalescedEvents?: () => PointerEvent[] };
      const events = native.getCoalescedEvents ? native.getCoalescedEvents() : [native];
      for (const ev of events) {
        extendStroke(getPoint(ev.clientX, ev.clientY));
      }
    },
    [extendStroke, getPoint]
  );

  const endStroke = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (activePointerIdRef.current !== e.pointerId) return;
      activePointerIdRef.current = null;
      isDrawingRef.current = false;
      setIsDrawing(false);
      computeAccuracy();
    },
    [computeAccuracy]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="letter-tracing-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="letter-tracing-title"
            tabIndex={-1}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: 'easeOut' }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-gradient-to-b from-slate-950 via-[#191307] to-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_60px_rgba(245,158,11,0.25)] overflow-hidden select-none outline-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 text-amber-300 border border-amber-400/30 shadow-inner">
                  <PenTool size={20} aria-hidden="true" />
                </div>
                <div>
                  <h3 id="letter-tracing-title" className="font-serif font-black text-lg sm:text-xl text-white flex items-center gap-2">
                    <span>Trace {letterName}</span>
                    <span className="text-amber-400 font-sans text-xs px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30">
                      {mode === 'modern' ? 'Modern Hebrew' : 'Paleo-Hebrew'}
                    </span>
                  </h3>
                  <p className="text-xs text-amber-200/70 mt-0.5">Learn stroke direction and practice sacred calligraphy</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <X size={18} />
              </button>
            </div>

            <AccuracyMeter accuracy={accuracy} />

            {/* Canvas tracing box */}
            <div
              ref={canvasBoxRef}
              className={`relative w-full max-w-[360px] aspect-square mx-auto bg-slate-950/90 rounded-3xl border-2 overflow-hidden flex items-center justify-center shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] transition-colors ${
                isDrawing ? 'border-amber-400/60' : 'border-dashed border-amber-400/30'
              }`}
            >
              {activeGuide.opacity > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none flex items-center justify-center select-none transition-opacity duration-300"
                  style={{ opacity: activeGuide.opacity }}
                >
                  {mode === 'modern' ? (
                    <span className="font-serif text-[180px] text-amber-300 font-normal leading-none drop-shadow-[0_0_35px_rgba(251,191,36,0.9)]">
                      {hebrewSymbol}
                    </span>
                  ) : paleoImgSrc ? (
                    <img
                      src={paleoImgSrc}
                      alt={letterName}
                      className="w-56 h-56 object-contain"
                      style={{ filter: 'drop-shadow(0 0 25px rgba(251, 191, 36, 0.95)) brightness(1.6)' }}
                    />
                  ) : (
                    <span className="text-amber-300/50 text-xs font-sans px-8 text-center">
                      No Paleo-Hebrew reference image was provided for this letter.
                    </span>
                  )}
                </div>
              )}

              {guideLevel !== 'free' && accuracy === null && !isDrawing && !isDemoPlaying && (
                <div className="absolute top-3 right-4 pointer-events-none flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400/70 bg-black/40 px-2 py-0.5 rounded-full border border-amber-400/20 z-20">
                  <span>Start · Right to Left</span>
                  <span className={`w-2 h-2 rounded-full bg-amber-400 ${prefersReducedMotion ? '' : 'animate-ping'}`} />
                </div>
              )}

              {isDemoPlaying && <StrokeOrderDemo paths={demoStrokePaths ?? []} reducedMotion={prefersReducedMotion} />}
              {celebration > 0 && <CelebrationBurst key={celebration} />}

              <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', touchAction: 'none' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endStroke}
                onPointerCancel={endStroke}
                className="relative z-10 cursor-crosshair w-full h-full"
                role="img"
                aria-label={`Tracing canvas for the letter ${letterName}`}
              />
            </div>

            {/* Ink color + nib width + demo toggle */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300/80">Ink Gold</span>
                  <div className="flex items-center gap-1.5">
                    {GOLD_PALETTES.map((p) => (
                      <button
                        key={p.color}
                        type="button"
                        onClick={() => setStrokeColor(p.color)}
                        aria-label={`Use ${p.name} ink`}
                        aria-pressed={strokeColor === p.color}
                        title={p.name}
                        className={`w-6 h-6 rounded-full border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                          strokeColor === p.color ? 'scale-110 border-white ring-2 ring-amber-400 shadow-md' : 'border-white/30 hover:scale-105 opacity-80'
                        }`}
                        style={{ backgroundColor: p.color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300/80">Nib</span>
                  <div className="flex items-center gap-1">
                    {STROKE_WIDTHS.map((w) => (
                      <button
                        key={w.value}
                        type="button"
                        onClick={() => setStrokeWidth(w.value)}
                        aria-label={`${w.label} nib`}
                        aria-pressed={strokeWidth === w.value}
                        title={w.label}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                          strokeWidth === w.value ? 'bg-amber-400/20 border-amber-400/60' : 'bg-white/5 border-white/10 hover:border-white/25'
                        }`}
                      >
                        <span className="rounded-full bg-amber-300" style={{ width: Math.max(3, w.value / 2.4), height: Math.max(3, w.value / 2.4) }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isDemoPlaying) clearCanvas();
                  setIsDemoPlaying((v) => !v);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  isDemoPlaying ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30' : 'bg-white/10 hover:bg-white/20 text-amber-300 border border-amber-400/30'
                }`}
              >
                {isDemoPlaying ? <Pause size={13} /> : <Play size={13} />}
                <span>{isDemoPlaying ? 'Stop Demo' : 'Watch Stroke Order'}</span>
              </button>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-amber-500/20">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const idx = GUIDE_LEVELS.findIndex((g) => g.id === guideLevel);
                    setGuideLevel(GUIDE_LEVELS[(idx + 1) % GUIDE_LEVELS.length].id);
                  }}
                  aria-label={`Guide level: ${activeGuide.label}. Tap to change.`}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    guideLevel !== 'free' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {guideLevel === 'free' ? <EyeOff size={14} /> : <Eye size={14} />}
                  {activeGuide.label}
                </button>
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  aria-label="Undo last stroke"
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    canUndo ? 'bg-white/10 hover:bg-white/20 text-slate-200 cursor-pointer' : 'bg-white/5 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Undo2 size={14} /> Undo
                </button>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  <RotateCcw size={14} /> Clear
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              >
                <Check size={16} /> Done Tracing
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
