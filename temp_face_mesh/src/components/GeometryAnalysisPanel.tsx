import React, { useEffect, useRef, useState } from 'react';
import { GeometryAnalysis } from '../types';
import {
  Info,
  Sparkles,
  Scale,
  Eye,
  Expand,
  ShieldCheck,
  Activity,
  Sun,
  SunMedium,
  SunDim,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Sliders,
} from 'lucide-react';

interface GeometryAnalysisPanelProps {
  analysis: GeometryAnalysis;
  photoUrl: string;
}

export const GeometryAnalysisPanel: React.FC<GeometryAnalysisPanelProps> = ({
  analysis,
  photoUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [brightness, setBrightness] = useState<number | null>(null);
  const [lightingStatus, setLightingStatus] = useState<'underexposed' | 'optimal' | 'overexposed' | null>(null);
  const [lightingSuggestion, setLightingSuggestion] = useState<string>('');

  // Draw landmark overlay map on thumbnail canvas & analyze average image brightness
  useEffect(() => {
    if (!canvasRef.current || !analysis.rawLandmarks || analysis.rawLandmarks.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = photoUrl;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // 1. Draw pristine original image to measure image brightness
      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let totalLuminance = 0;
        let sampleCount = 0;

        // Sample every 4th pixel (step of 16 in RGBA buffer) for fast performance
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // ITU-R BT.601 perceived luminance formula
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLuminance += luminance;
          sampleCount++;
        }

        const avgLuminance = sampleCount > 0 ? totalLuminance / sampleCount : 128;
        const brightnessPct = Math.round((avgLuminance / 255) * 100);
        setBrightness(brightnessPct);

        if (brightnessPct < 35) {
          setLightingStatus('underexposed');
          setLightingSuggestion(
            'Face is underexposed. Face toward a window or increase front lighting to enhance landmark depth and contrast.'
          );
        } else if (brightnessPct > 75) {
          setLightingStatus('overexposed');
          setLightingSuggestion(
            'Face is overexposed. Reduce harsh overhead glare or step back from direct sunlight to restore facial details.'
          );
        } else {
          setLightingStatus('optimal');
          setLightingSuggestion(
            'Optimal lighting detected. Balanced highlights and shadows allow precise facial landmark mapping.'
          );
        }
      } catch (err) {
        console.warn('Unable to measure image brightness from canvas:', err);
      }

      // 2. Darken slightly for high landmark contrast
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 3. Draw key landmark points
      const pts = analysis.rawLandmarks;
      const keyIndices = [
        // Midline
        10, 168, 6, 1, 152,
        // Left Eye & Eyebrow
        33, 133, 70, 107,
        // Right Eye & Eyebrow
        263, 362, 300, 336,
        // Face outline & Jaw
        234, 454, 172, 397,
        // Nose & Mouth
        129, 358, 61, 291,
      ];

      // Draw connecting midline
      if (pts[168] && pts[152]) {
        ctx.beginPath();
        ctx.moveTo(pts[168].x * canvas.width, pts[168].y * canvas.height);
        ctx.lineTo(pts[152].x * canvas.width, pts[152].y * canvas.height);
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw landmark points
      keyIndices.forEach((idx) => {
        const pt = pts[idx];
        if (pt) {
          const x = pt.x * canvas.width;
          const y = pt.y * canvas.height;

          ctx.beginPath();
          ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
          ctx.fillStyle = '#38bdf8'; // Sky blue
          ctx.fill();
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    };
  }, [analysis, photoUrl]);

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Facial Geometry & Exposure Metrics</h3>
            <p className="text-[11px] text-slate-500">468-point 3D landmark geometric & lighting analysis</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-mono text-slate-600 border border-slate-200">
          Landmarks: {analysis.landmarksCount}
        </span>
      </div>

      {/* Main Grid: Headline Symmetry Gauge + Landmark Map Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
        {/* Headline Symmetry Score Card */}
        <div className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <div className="relative flex items-center justify-center w-32 h-32 my-2">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-slate-200"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-indigo-600 transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray="263.89"
                strokeDashoffset={263.89 - (263.89 * analysis.symmetryScore) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {analysis.symmetryScore}%
              </span>
              <span className="text-[10px] uppercase font-semibold text-indigo-600 tracking-widest mt-0.5">
                Symmetry
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-700 mt-2 font-semibold">
            Bilateral Facial Symmetry Index
          </p>
          <span className="mt-1 text-[11px] text-slate-500">
            Deviations mapped across 8 landmark pairs
          </span>
        </div>

        {/* Landmark Overlay Canvas Preview */}
        <div className="relative aspect-[3/4] w-full max-w-[200px] mx-auto rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
          <canvas ref={canvasRef} className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-white/90 backdrop-blur-md text-[9px] font-mono text-indigo-700 border border-indigo-200 shadow-xs">
            Landmark Vector Map
          </div>
        </div>
      </div>

      {/* Ratios & Brightness Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-1">
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span>Eye Spacing</span>
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">{analysis.eyeSpacingRatio}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Interocular / Width</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-1">
            <Expand className="w-3.5 h-3.5 text-emerald-600" />
            <span>Length / Width</span>
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">{analysis.faceLengthToWidthRatio}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Forehead to Chin</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-1">
            <Scale className="w-3.5 h-3.5 text-amber-600" />
            <span>Jaw / Cheek</span>
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">{analysis.jawToCheekboneRatio}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Gonion / Cheekbone</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Nose / Mouth</span>
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">{analysis.noseToMouthWidthRatio}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Nasal Base / Mouth</div>
        </div>

        {/* NEW Metric: Image Brightness */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-1">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Image Brightness</span>
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">
            {brightness !== null ? `${brightness}%` : '---'}
          </div>
          <div className="text-[10px] font-semibold mt-0.5">
            {lightingStatus === 'underexposed' ? (
              <span className="text-amber-600">Underexposed</span>
            ) : lightingStatus === 'overexposed' ? (
              <span className="text-amber-600">Overexposed</span>
            ) : lightingStatus === 'optimal' ? (
              <span className="text-emerald-600">Optimal</span>
            ) : (
              <span className="text-slate-400">Measuring...</span>
            )}
          </div>
        </div>
      </div>

      {/* Lighting Quality & Exposure Adjustment Card */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-900">Lighting Quality & Lighting Adjustment Suggestion</h4>
          </div>

          {/* Exposure Status Badge */}
          {lightingStatus === 'underexposed' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
              <SunDim className="w-3.5 h-3.5 text-amber-600" />
              Underexposed (&lt;35%)
            </span>
          )}
          {lightingStatus === 'overexposed' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
              <SunMedium className="w-3.5 h-3.5 text-amber-600" />
              Overexposed (&gt;75%)
            </span>
          )}
          {lightingStatus === 'optimal' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Optimal Lighting (35%–75%)
            </span>
          )}
        </div>

        {/* Visual Exposure Level Scale Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium px-0.5">
            <span className="text-amber-700">Dark (0%)</span>
            <span className="text-emerald-700 font-semibold">Optimal (35%–75%)</span>
            <span className="text-amber-700">Bright (100%)</span>
          </div>

          <div className="relative h-2.5 w-full rounded-full bg-slate-200 overflow-hidden flex">
            {/* Dark Range */}
            <div className="w-[35%] bg-amber-200/80" title="Underexposed Zone" />
            {/* Optimal Range */}
            <div className="w-[40%] bg-emerald-400" title="Optimal Zone" />
            {/* Bright Range */}
            <div className="w-[25%] bg-amber-200/80" title="Overexposed Zone" />

            {/* Current Brightness Marker */}
            {brightness !== null && (
              <div
                className="absolute top-0 bottom-0 w-1.5 bg-slate-900 border-x border-white shadow-xs rounded-full transform -translate-x-1/2 transition-all duration-500"
                style={{ left: `${Math.min(100, Math.max(0, brightness))}%` }}
              />
            )}
          </div>
        </div>

        {/* Lighting Adjustment Suggestion Box */}
        {lightingSuggestion && (
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs transition-colors ${
              lightingStatus === 'optimal'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            {lightingStatus === 'optimal' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5 leading-relaxed text-[11px]">
              <strong className="block font-semibold">
                {lightingStatus === 'underexposed'
                  ? 'Lighting Adjustment Recommended:'
                  : lightingStatus === 'overexposed'
                  ? 'Lighting Adjustment Recommended:'
                  : 'Lighting Status:'}
              </strong>
              <p>{lightingSuggestion}</p>
            </div>
          </div>
        )}
      </div>

      {/* Neutral Fun Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong className="text-slate-800">Approximate, for-fun geometric analysis.</strong> These neutral geometric & brightness metrics are computed purely client-side from 3D landmark point ratios and pixel luminance. This is not a medical or diagnostic assessment tool.
        </p>
      </div>
    </div>
  );
};

