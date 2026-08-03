import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface ToastProps {
  show: boolean;
  message: string;
  subMessage?: string;
}

export const AlignmentToast: React.FC<ToastProps> = ({ show, message, subMessage }) => {
  if (!show) return null;

  return (
    <div className="absolute bottom-6 inset-x-4 z-30 flex justify-center pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-3">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 text-white backdrop-blur-md shadow-lg max-w-sm">
        <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            {message}
          </span>
          {subMessage && (
            <span className="text-[10px] text-slate-300 font-medium leading-tight">
              {subMessage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
