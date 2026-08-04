import React, { useState, useEffect } from 'react';
import { HelpCircle, Volume2, Sparkles, Send, Play, X, Compass, ChevronRight, CheckCircle2, Loader2, Target, ArrowRight, Cpu } from 'lucide-react';
import { COTPageId, COTCustomGuideResponse, COTNavigationStep } from './types';
import { COT_PAGES_DATA, normalizeCOTPageId } from './pagesInfo';
import { generateUniversalNavigationGuide } from '../../services/universalNavAiService';
import { AIModelSelectorModal } from '../AIModelSelectorModal';

interface UniversalHelpWidgetProps {
  currentPageId: COTPageId | string;
  onNavigate: (page: string) => void;
  onStartCustomTour: (steps: COTNavigationStep[], questionText: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const UniversalHelpWidget: React.FC<UniversalHelpWidgetProps> = ({
  currentPageId,
  onNavigate,
  onStartCustomTour,
  isOpen,
  onToggleOpen,
}) => {
  const [customQuestion, setCustomQuestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [guideResult, setGuideResult] = useState<COTCustomGuideResponse | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [showModelSelector, setShowModelSelector] = useState(false);
  const [primaryModelId, setPrimaryModelId] = useState(() => localStorage.getItem('cot_primary_ai_model') || 'gpt-omni');
  const [secondaryModelId, setSecondaryModelId] = useState(() => localStorage.getItem('cot_secondary_ai_model') || 'gemini-2-flash');

  useEffect(() => {
    const handleModelChange = () => {
      setPrimaryModelId(localStorage.getItem('cot_primary_ai_model') || 'gpt-omni');
      setSecondaryModelId(localStorage.getItem('cot_secondary_ai_model') || 'gemini-2-flash');
    };
    window.addEventListener('cot-ai-models-changed', handleModelChange);
    return () => window.removeEventListener('cot-ai-models-changed', handleModelChange);
  }, []);

  const normalizedPageId = normalizeCOTPageId(currentPageId);
  const pageData = COT_PAGES_DATA[normalizedPageId] || COT_PAGES_DATA['home'];

  const startPageOverviewTour = () => {
    const steps: COTNavigationStep[] = [
      {
        stepNumber: 1,
        title: `What this page is for`,
        instruction: pageData.simplePurpose,
        targetPage: pageData.id,
        targetElementId: 'main-content',
        actionType: 'view',
        elementLabel: pageData.title,
        tip: pageData.primaryGoal,
      },
      ...pageData.howToUseSteps.map((st, idx) => ({
        stepNumber: idx + 2,
        title: st.title,
        instruction: st.description,
        targetPage: pageData.id,
        targetElementId: st.targetElementId || 'main-content',
        actionType: 'click' as const,
        elementLabel: st.title,
        tip: 'Follow the highlighted area. If it is not visible, scroll slowly and use the instruction text.',
      })),
    ];
    onNavigate(pageData.id);
    onStartCustomTour(steps, `${pageData.title} onboarding`);
    onToggleOpen();
  };

  const handleAskQuestion = async () => {
    const q = customQuestion.trim();
    if (!q) return;

    setIsGenerating(true);
    setGuideResult(null);

    try {
      const result = await generateUniversalNavigationGuide(q, normalizedPageId);
      setGuideResult(result);
    } catch (err) {
      console.error('Error generating AI navigation guide:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) {
    return (
      <>
        <button
          onClick={onToggleOpen}
          id="universal-help-trigger"
          className="fixed bottom-6 left-6 z-[160] group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white border-2 border-amber-400/60 shadow-[0_10px_25px_-5px_rgba(245,158,11,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(245,158,11,0.7)] transition-all hover:scale-105 active:scale-95"
          title="Universal AI Navigation & Guidance"
        >
          <span className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md group-hover:rotate-12 transition-transform">
            <Compass size={18} />
          </span>
          <span className="text-xs font-black text-amber-200 tracking-wide pr-1">
            Universal Guide AI
          </span>
        </button>

        <AIModelSelectorModal
          isOpen={showModelSelector}
          onClose={() => setShowModelSelector(false)}
          primaryModelId={primaryModelId}
          secondaryModelId={secondaryModelId}
          onSelectPrimaryModel={(id) => {
            setPrimaryModelId(id);
            localStorage.setItem('cot_primary_ai_model', id);
            window.dispatchEvent(new CustomEvent('cot-ai-models-changed'));
          }}
          onSelectSecondaryModel={(id) => {
            setSecondaryModelId(id);
            localStorage.setItem('cot_secondary_ai_model', id);
            window.dispatchEvent(new CustomEvent('cot-ai-models-changed'));
          }}
        />
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:left-6 z-[165] w-full sm:w-[420px] max-h-[85vh] bg-slate-950/95 border-2 border-amber-400/60 text-white rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-fadeIn">
        {/* Header (COT Signature Theme) */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-b border-amber-400/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-amber-100">Universal Navigation AI</h3>
                <span className="text-[9px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">COT Model</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Ask any how-to question for step-by-step guidance</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModelSelector(true)}
              className="px-2.5 py-1 rounded-full bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
              title="Select AI Model Engine (GPT-Omni, Claude 3.5, Gemini, Lashon HaKodesh)"
            >
              <Cpu size={12} className="text-amber-400" />
              <span className="truncate max-w-[80px]">{primaryModelId}</span>
            </button>
            <button
              onClick={onToggleOpen}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* Ask Prompt Box */}
          <div className="bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 rounded-2xl p-4 border border-amber-400/30 space-y-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-400/90">You are on</p>
              <h4 className="text-base font-black text-white leading-tight mt-1">{pageData.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">{pageData.simplePurpose}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {pageData.keyFeatures.slice(0, 4).map((feature) => (
                <div key={feature} className="rounded-xl bg-white/5 border border-white/10 px-2.5 py-2">
                  <p className="text-[10px] font-bold text-slate-200 leading-snug">{feature}</p>
                </div>
              ))}
            </div>

            <button
              onClick={startPageOverviewTour}
              className="w-full py-2.5 rounded-xl bg-white text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all hover:bg-amber-100"
            >
              <Play size={14} fill="currentColor" /> Start Page Onboarding
            </button>
          </div>

          <div className="bg-slate-900/90 rounded-2xl p-3 border border-amber-400/20 space-y-2.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
              <Compass size={12} /> Custom Navigation Question
            </label>

            <div className="relative">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                placeholder="e.g. What is this page? How do I download PDF?"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all pr-10"
              />
              <button
                onClick={handleAskQuestion}
                disabled={isGenerating || !customQuestion.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition-all disabled:opacity-40"
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>

          {/* AI Result Box */}
          {guideResult && (
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-4 border border-amber-400/30 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">AI Step Guidance</span>
                {guideResult.directAnswer && (
                  <button
                    onClick={() => speakText(guideResult.directAnswer)}
                    className="text-slate-400 hover:text-amber-300 transition-colors p-1"
                    title="Read aloud"
                  >
                    <Volume2 size={14} className={isSpeaking ? 'text-amber-400 animate-pulse' : ''} />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {guideResult.directAnswer}
              </p>

              {/* Launch Visual Spotlight Tour Button */}
              <button
                onClick={() => {
                  onNavigate(guideResult.relevantPage);
                  onStartCustomTour(guideResult.steps, guideResult.userQuestion);
                  onToggleOpen();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Play size={14} fill="currentColor" /> Start Interactive Spotlight Tour ({guideResult.steps.length} Steps)
              </button>
            </div>
          )}

          {/* Current Page How-to Shortcut Steps */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">Quick Help For This Page</h4>
              <span className="text-[10px] text-amber-400/80 font-bold">{pageData.howToUseSteps.length} Quick Steps</span>
            </div>

            <div className="space-y-2">
              {pageData.howToUseSteps.map((st, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const singleStep: COTNavigationStep = {
                      stepNumber: 1,
                      title: st.title,
                      instruction: st.description,
                      targetPage: pageData.id,
                      targetElementId: st.targetElementId || 'main-content',
                      actionType: 'click',
                      elementLabel: st.title,
                    };
                    onNavigate(pageData.id);
                    onStartCustomTour([singleStep], st.title);
                    onToggleOpen();
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-900/60 hover:bg-amber-950/30 border border-slate-800 hover:border-amber-400/30 transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-200 group-hover:text-amber-300">{st.title}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[280px]">{st.description}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-500 group-hover:text-amber-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AIModelSelectorModal
        isOpen={showModelSelector}
        onClose={() => setShowModelSelector(false)}
        primaryModelId={primaryModelId}
        secondaryModelId={secondaryModelId}
        onSelectPrimaryModel={(id) => {
          setPrimaryModelId(id);
          localStorage.setItem('cot_primary_ai_model', id);
          window.dispatchEvent(new CustomEvent('cot-ai-models-changed'));
        }}
        onSelectSecondaryModel={(id) => {
          setSecondaryModelId(id);
          localStorage.setItem('cot_secondary_ai_model', id);
          window.dispatchEvent(new CustomEvent('cot-ai-models-changed'));
        }}
      />
    </>
  );
};
