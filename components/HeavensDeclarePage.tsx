import React from 'react';
import { ArrowLeft, ExternalLink, Calendar } from 'lucide-react';
import { ViewState } from '../types';

interface HeavensDeclarePageProps {
  onBack: () => void;
  onNavigateView?: (view: ViewState) => void;
}

export const HeavensDeclarePage: React.FC<HeavensDeclarePageProps> = ({ onBack, onNavigateView }) => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
      {/* Top Floating Ministry Nav Bar */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-auto">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 hover:bg-slate-800/90 transition-all text-xs font-semibold tracking-wider shadow-lg"
        >
          <ArrowLeft size={16} />
          <span>BACK TO SANCTUARY</span>
        </button>

        <div className="flex items-center gap-2">
          {onNavigateView && (
            <button
              type="button"
              onClick={() => onNavigateView(ViewState.HEBREW_CALENDAR)}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-500/30 text-amber-300 hover:text-white hover:border-amber-400 hover:bg-slate-800/90 transition-all text-xs font-semibold tracking-wider shadow-lg"
            >
              <Calendar size={15} />
              <span>HEBREW CALENDAR & FEASTS</span>
            </button>
          )}

          <a
            href="/heavens-declare.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-cyan-950/70 backdrop-blur-md border border-cyan-500/40 text-cyan-200 hover:bg-cyan-900/80 transition-all text-xs font-medium"
            title="Open Fullscreen in New Tab"
          >
            <span>Fullscreen</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Embedded Fullscreen Space Hero Section */}
      <iframe
        src="/heavens-declare.html"
        title="The Heavens Declare — Biblical Astronomy & Creation"
        className="w-full h-full border-0 absolute inset-0 z-0"
        allow="autoplay; encrypted-media; fullscreen"
      />
    </div>
  );
};
