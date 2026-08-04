import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, PenTool, Check, Sparkles, Eye } from 'lucide-react';

interface LetterTracingModalProps {
  isOpen: boolean;
  onClose: () => void;
  letterName: string;
  hebrewSymbol: string;
  paleoImgSrc?: string;
  mode: 'modern' | 'paleo';
}

export const LetterTracingModal: React.FC<LetterTracingModalProps> = ({
  isOpen,
  onClose,
  letterName,
  hebrewSymbol,
  paleoImgSrc,
  mode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [strokeColor, setStrokeColor] = useState(mode === 'modern' ? '#38bdf8' : '#fbbf24');
  const [strokeWidth, setStrokeWidth] = useState(12);

  // Resize canvas according to device pixel ratio
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 360 * dpr;
    canvas.height = 360 * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [isOpen]);

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-lg bg-gradient-to-b ${
            mode === 'modern'
              ? 'from-slate-900 via-sky-950 to-slate-950 border-sky-500/40 shadow-[0_0_50px_rgba(56,189,248,0.25)]'
              : 'from-slate-900 via-amber-950 to-slate-950 border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)]'
          } border rounded-3xl p-6 shadow-2xl overflow-hidden select-none`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl ${
                  mode === 'modern' ? 'bg-sky-500/20 text-sky-300' : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                <PenTool size={18} />
              </div>
              <div>
                <h3 className="font-serif font-black text-lg text-white">
                  Trace {letterName} ({mode === 'modern' ? 'Modern Hebrew' : 'Paleo-Hebrew'})
                </h3>
                <p className="text-xs text-slate-400">Practice writing the stroke path with mouse or finger</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Canvas Tracing Box */}
          <div className="relative w-[360px] h-[360px] mx-auto bg-slate-950/80 rounded-3xl border-2 border-dashed border-white/20 overflow-hidden flex items-center justify-center">
            {/* Background Guide Letter */}
            {showGuide && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none opacity-30">
                {mode === 'modern' ? (
                  <span className="font-serif text-[180px] text-sky-400 font-normal leading-none drop-shadow-[0_0_25px_rgba(56,189,248,0.8)]">
                    {hebrewSymbol}
                  </span>
                ) : (
                  <img
                    src={paleoImgSrc}
                    alt={letterName}
                    className="w-56 h-56 object-contain"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.8)) brightness(1.5)' }}
                  />
                )}
              </div>
            )}

            {/* User Drawing Canvas */}
            <canvas
              ref={canvasRef}
              style={{ width: '360px', height: '360px' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="relative z-10 cursor-crosshair touch-none"
            />
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGuide(!showGuide)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  showGuide ? 'bg-white/15 text-white' : 'bg-white/5 text-slate-400'
                }`}
              >
                <Eye size={14} /> Guide Overlay
              </button>
              <button
                onClick={clearCanvas}
                className="px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <RotateCcw size={14} /> Clear
              </button>
            </div>

            <button
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                mode === 'modern'
                  ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/25'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25'
              }`}
            >
              <Check size={16} /> Done Tracing
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
