import React, { useState } from 'react';
import { CapturedPhoto } from '../types';
import { RotateCcw, Check, Sparkles, User, Calendar, Layers, Download, Loader2, Image as ImageIcon, FileText } from 'lucide-react';
import { downloadPhotoOnlyPng, downloadProfileCardPng } from '../utils/cardExporter';

interface CardPreviewProps {
  photo: CapturedPhoto;
  onRetake: () => void;
  onConfirm: () => void;
}

export const CardPreview: React.FC<CardPreviewProps> = ({ photo, onRetake, onConfirm }) => {
  const [downloadMode, setDownloadMode] = useState<'photo' | 'card' | null>(null);

  const handleDownloadPhoto = async () => {
    try {
      setDownloadMode('photo');
      await downloadPhotoOnlyPng(photo);
    } catch (err) {
      console.error('Failed to download photo PNG:', err);
    } finally {
      setDownloadMode(null);
    }
  };

  const handleDownloadCard = async () => {
    try {
      setDownloadMode('card');
      await downloadProfileCardPng(photo);
    } catch (err) {
      console.error('Failed to download profile card PNG:', err);
    } finally {
      setDownloadMode(null);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      {/* Profile Card Stage */}
      <div className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-5 shadow-xs overflow-hidden group space-y-4">
        {/* Card Header Tag */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold tracking-wider uppercase">
              <Sparkles className="w-3 h-3 mr-1" />
              Official ID Format
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">3:4 Card Crop</span>
        </div>

        {/* Cropped Photo Frame */}
        <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs transition-colors">
          <img
            src={photo.dataUrl}
            alt="Captured profile card photo"
            className="w-full h-full object-cover"
          />

          {/* Headroom / Alignment Overlay subtle guidelines */}
          <div className="absolute inset-0 border border-slate-200/50 rounded-2xl pointer-events-none" />

          {/* Resolution Badge */}
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200 text-[10px] font-mono text-slate-700 flex items-center gap-1.5 shadow-xs">
            <Layers className="w-3 h-3 text-indigo-600" />
            <span>{photo.width} × {photo.height} px</span>
          </div>
        </div>

        {/* Card Info Details */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Subject
            </span>
            <span className="font-semibold text-slate-800">{photo.cardName}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Timestamp
            </span>
            <span className="font-mono text-slate-600">{photo.timestamp}</span>
          </div>
        </div>

        {/* Primary Action: Download Clean Photo Alone */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleDownloadPhoto}
            disabled={downloadMode !== null}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            {downloadMode === 'photo' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Photo PNG...</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                <span>Download Photo Only (PNG)</span>
              </>
            )}
          </button>

          {/* Secondary Action: Download Full ID Card */}
          <button
            onClick={handleDownloadCard}
            disabled={downloadMode !== null}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] border border-slate-200 transition-all cursor-pointer"
          >
            {downloadMode === 'card' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                <span>Generating Full Card...</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Download Full ID Card (PNG)</span>
              </>
            )}
          </button>
        </div>

        {/* Retake / Confirm Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={onRetake}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Retake</span>
          </button>

          <button
            onClick={onConfirm}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Use Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

