import React, { useState, useEffect } from 'react';
import { COTPageId, COTNavigationStep } from './types';
import { ArrowLeft, ArrowRight, X, Sparkles, CheckCircle, Volume2, Target } from 'lucide-react';
import { isSameCOTPage } from './pagesInfo';

interface VisualSpotlightProps {
  steps: COTNavigationStep[];
  currentStepIndex: number;
  tourTitle: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  onExitTour: () => void;
  activePage?: string;
  onNavigate?: (page: string) => void;
}

export const VisualSpotlight: React.FC<VisualSpotlightProps> = ({
  steps,
  currentStepIndex,
  tourTitle,
  onNextStep,
  onPrevStep,
  onExitTour,
  activePage,
  onNavigate,
}) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [targetFound, setTargetFound] = useState(false);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (!currentStep) return;

    if (currentStep.targetPage && activePage && !isSameCOTPage(currentStep.targetPage, activePage) && onNavigate) {
      onNavigate(currentStep.targetPage);
    }

    const updatePosition = () => {
      const elem =
        document.getElementById(currentStep.targetElementId) ||
        document.getElementById('root') ||
        document.querySelector('main') ||
        document.querySelector('[role="main"]');

      if (elem) {
        setTargetFound(elem.id === currentStep.targetElementId);
        if (elem.id === currentStep.targetElementId) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        const rect = elem.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetFound(false);
        setTargetRect(null);
      }
    };

    const timer = setTimeout(updatePosition, 350);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [currentStepIndex, currentStep, activePage, onNavigate]);

  if (!currentStep) return null;

  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;
  const progressPercent = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <div className="fixed inset-0 z-[180] pointer-events-none transition-all duration-300">
      {/* Dimmed Backdrop */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] transition-opacity" />

      {/* Target Element Highlight Box (COT Gold Theme) */}
      {targetRect && targetFound && (
        <div
          style={{
            top: `${targetRect.top - 8}px`,
            left: `${targetRect.left - 8}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
          }}
          className="fixed border-4 border-amber-400 rounded-3xl shadow-[0_0_35px_rgba(245,158,11,0.85)] animate-pulse z-[190] pointer-events-none transition-all duration-300"
        >
          {/* Pointing Badge */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black px-4 py-1 rounded-full text-xs shadow-xl flex items-center gap-1.5 whitespace-nowrap border border-amber-300">
            <Target size={13} className="animate-spin" />
            <span>LOOK / TAP HERE</span>
          </div>
        </div>
      )}

      {/* Floating Bottom Step Guide Banner (COT Signature Gold & Navy Theme) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92vw] max-w-2xl bg-slate-900/95 text-white rounded-3xl shadow-2xl p-5 border-2 border-amber-400/50 backdrop-blur-xl pointer-events-auto z-[200] animate-slideUp">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black px-3 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-xs text-amber-200/90 font-bold truncate max-w-[220px]">
              {tourTitle}
            </span>
          </div>

          <button
            onClick={onExitTour}
            className="p-1.5 rounded-full bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-white/70 transition-all border border-white/10"
            title="Exit Tour"
          >
            <X size={15} />
          </button>
        </div>

        {/* Step Title & Instruction */}
        <div className="mb-4">
          <h4 className="text-base font-black text-white flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-amber-400" />
            {currentStep.title}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {currentStep.instruction}
          </p>

          {currentStep.tip && (
            <div className="mt-2 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
              <span>💡</span> {currentStep.tip}
            </div>
          )}

          {!targetFound && (
            <div className="mt-2 text-[11px] text-sky-200 bg-sky-500/10 border border-sky-400/20 rounded-xl px-3 py-1.5">
              This step is instruction-only because the exact button or section is not visible on this screen. Follow the text, or use the Back and Next buttons to continue.
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 h-1.5 rounded-full mb-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onPrevStep}
            disabled={isFirstStep}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <button
            onClick={onNextStep}
            className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-2"
          >
            {isLastStep ? (
              <>
                <CheckCircle size={14} /> Finish Tour
              </>
            ) : (
              <>
                Next Step <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
