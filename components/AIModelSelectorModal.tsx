import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, BookOpen, Crown, Cpu, Check, Layers, Info } from 'lucide-react';

export interface AIModelSpec {
  id: string;
  name: string;
  provider: string;
  category: 'free' | 'pro' | 'scripture' | 'vision';
  categoryLabel: string;
  bgColor: string;
  beforeColor: string;
  logoBg: string;
  iconColor: string;
  textColor: string;
  tagline: string;
  badge: string;
  isFree?: boolean;
  isCustom?: boolean;
  svgIcon: React.ReactNode;
}

export const AI_MODELS_DATABASE: AIModelSpec[] = [
  // ⚡ FAST & FREE CATEGORY
  {
    id: 'gpt-omni',
    name: 'GPT-Omni',
    provider: 'OpenAI',
    category: 'free',
    categoryLabel: '⚡ Fast & Free',
    bgColor: '#1c3e34',
    beforeColor: '#2b5e4f',
    logoBg: '#0f1715',
    iconColor: '#10A37F',
    textColor: '#e2e8f0',
    tagline: 'High Speed Multimodal Omnipresent AI',
    badge: '100% FREE',
    isFree: true,
    svgIcon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10 transition-all duration-500">
        <path fill="#10A37F" d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5907 8.3829 14.6108 7.2144a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.3927-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
      </svg>
    ),
  },
  {
    id: 'gemini-2-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google AI',
    category: 'free',
    categoryLabel: '⚡ Fast & Free',
    bgColor: '#1e3a8a',
    beforeColor: '#2563eb',
    logoBg: '#0f172a',
    iconColor: '#38bdf8',
    textColor: '#e0f2fe',
    tagline: 'Ultra-Fast Real-Time Step Guidance',
    badge: '100% FREE',
    isFree: true,
    svgIcon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none">
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#38bdf8" />
        <path d="M12 6L13.5 10.5L18 12L13.5 13.5L12 18L10.5 13.5L6 12L10.5 10.5L12 6Z" fill="#7dd3fc" />
      </svg>
    ),
  },
  {
    id: 'llama-3-3',
    name: 'Llama 3.3 70B',
    provider: 'Meta AI',
    category: 'free',
    categoryLabel: '⚡ Fast & Free',
    bgColor: '#312e81',
    beforeColor: '#4338ca',
    logoBg: '#1e1b4b',
    iconColor: '#818cf8',
    textColor: '#e0e7ff',
    tagline: 'Open-Source Powerful Context Engine',
    badge: '100% FREE',
    isFree: true,
    svgIcon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none">
        <path d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7Z" fill="#818cf8" />
      </svg>
    ),
  },

  // 🔥 PRO & HIGH REASONING CATEGORY
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    category: 'pro',
    categoryLabel: 'Pro & Reasoning',
    bgColor: '#6b3e1f',
    beforeColor: '#8b4e26',
    logoBg: '#2a1608',
    iconColor: '#d97706',
    textColor: '#fde68a',
    tagline: 'Deep Conceptual Reasoning & Code Precision',
    badge: 'PRO MODEL',
    svgIcon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none">
        <path d="M12 2L15 9H22L16.5 13.5L18.5 21L12 16.5L5.5 21L7.5 13.5L2 9H9L12 2Z" fill="#fbbf24" />
      </svg>
    ),
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek AI',
    category: 'pro',
    categoryLabel: 'Pro & Reasoning',
    bgColor: '#1e3a8a',
    beforeColor: '#1d4ed8',
    logoBg: '#0f172a',
    iconColor: '#60a5fa',
    textColor: '#dbeafe',
    tagline: 'Chain-of-Thought Deep Logic & Analytics',
    badge: 'REASONING PRO',
    svgIcon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#60a5fa" strokeWidth="2.5" />
        <path d="M12 7V17M7 12H17" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },

  // 📖 SCRIPTURE & LASHON HAKODESH CATEGORY
  {
    id: 'lashon-hakodesh-ai',
    name: 'Lashon HaKodesh AI',
    provider: 'COT Ministries',
    category: 'scripture',
    categoryLabel: 'Sacred Scripture',
    bgColor: '#78350f',
    beforeColor: '#b45309',
    logoBg: '#1c0d02',
    iconColor: '#fbbf24',
    textColor: '#fef3c7',
    tagline: 'Sacred Hebrew Roots, Pictographs & Biblical Truth',
    badge: 'MINISTRY SPECIALIST',
    isCustom: true,
    svgIcon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none">
        <path d="M12 3L4 9V21H20V9L12 3Z" stroke="#fbbf24" strokeWidth="2" />
        <path d="M12 7L16 11H8L12 7Z" fill="#f59e0b" />
        <path d="M12 14V18" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'torah-scholar-pro',
    name: 'Torah Scholar Pro',
    provider: 'COT Ministries',
    category: 'scripture',
    categoryLabel: 'Sacred Scripture',
    bgColor: '#064e3b',
    beforeColor: '#047857',
    logoBg: '#022c22',
    iconColor: '#34d399',
    textColor: '#d1fae5',
    tagline: 'Tanakh Interlinear & Strong’s Concordance Specialist',
    badge: 'SCRIPTURE PRO',
    isCustom: true,
    svgIcon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none">
        <path d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z" stroke="#34d399" strokeWidth="2" />
        <path d="M12 7V17M8 12H16" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

interface AIModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryModelId: string;
  secondaryModelId: string;
  onSelectPrimaryModel: (modelId: string) => void;
  onSelectSecondaryModel: (modelId: string) => void;
}

export const AIModelSelectorModal: React.FC<AIModelSelectorModalProps> = ({
  isOpen,
  onClose,
  primaryModelId,
  secondaryModelId,
  onSelectPrimaryModel,
  onSelectSecondaryModel,
}) => {
  const [activeTarget, setActiveTarget] = useState<'primary' | 'secondary'>('primary');
  const [activeCategory, setActiveCategory] = useState<'all' | 'free' | 'pro' | 'scripture'>('all');

  if (!isOpen) return null;

  const filteredModels = AI_MODELS_DATABASE.filter((m) => {
    if (activeCategory === 'all') return true;
    return m.category === activeCategory;
  });

  const selectedPrimary = AI_MODELS_DATABASE.find((m) => m.id === primaryModelId) || AI_MODELS_DATABASE[0];
  const selectedSecondary = AI_MODELS_DATABASE.find((m) => m.id === secondaryModelId) || AI_MODELS_DATABASE[1];

  return (
    <div className="fixed inset-0 z-[220] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* CSS Brutalist Styling */}
      <style>{`
        .brutalist-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 3.5px solid #000000;
          border-radius: 20px;
          padding: 12px;
          position: relative;
          box-shadow: 5px 5px 0px #000000;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          height: 155px;
          cursor: pointer;
        }

        .brutalist-card::before {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -150%;
          width: 300%;
          height: 300%;
          border-radius: 50%;
          transform: translateX(-50%) scale(0);
          transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);
          z-index: 1;
        }

        .brutalist-card:hover::before {
          transform: translateX(-50%) scale(1);
        }

        .brutalist-card:hover {
          transform: translate(-4px, -4px);
          box-shadow: 8px 8px 0px #000000;
        }

        .brutalist-card:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px #000000;
        }

        .brutalist-card.selected-primary {
          border-color: #f59e0b;
          box-shadow: 6px 6px 0px #f59e0b;
        }

        .brutalist-card.selected-secondary {
          border-color: #38bdf8;
          box-shadow: 6px 6px 0px #38bdf8;
        }

        .brand-logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
          width: 78px;
          height: 78px;
          border-radius: 50%;
          transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        @keyframes modelSpin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .brutalist-card:hover .brand-logo-container {
          animation: modelSpin 6s linear infinite;
          width: 48px;
          height: 48px;
          top: 26%;
        }

        .model-card-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 1.2;
          transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          text-align: center;
          opacity: 0;
          transform: translateY(20px);
          z-index: 2;
          position: absolute;
          bottom: 14px;
          left: 6px;
          right: 6px;
        }

        .brutalist-card:hover .model-card-text {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-5 sm:p-7 text-white shadow-2xl overflow-hidden relative backdrop-blur-xl"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-amber-400/20 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <Cpu size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-amber-100">AI Model Engine Selector</h2>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                  Uiverse Brutalist Edition
                </span>
              </div>
              <p className="text-xs text-slate-400">Choose Primary Reasoning Model & Secondary Fast Navigation Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Primary vs Secondary Target Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* Primary Model Active Pill */}
          <button
            type="button"
            onClick={() => setActiveTarget('primary')}
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between text-left ${
              activeTarget === 'primary'
                ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-2 ring-amber-400/40'
                : 'bg-slate-950/60 border-slate-800 hover:border-amber-400/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">Primary AI Model</span>
                <span className="text-sm font-black text-white">{selectedPrimary.name}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-300/80 bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20 whitespace-nowrap">
              {activeTarget === 'primary' ? 'Configuring Now' : 'Click to Set'}
            </span>
          </button>

          {/* Secondary Model Active Pill */}
          <button
            type="button"
            onClick={() => setActiveTarget('secondary')}
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between text-left ${
              activeTarget === 'secondary'
                ? 'bg-sky-950/40 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)] ring-2 ring-sky-400/40'
                : 'bg-slate-950/60 border-slate-800 hover:border-sky-400/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-sky-400 animate-pulse shrink-0" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 block">Secondary AI Model</span>
                <span className="text-sm font-black text-white">{selectedSecondary.name}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-sky-300/80 bg-sky-400/10 px-2 py-1 rounded-full border border-sky-400/20 whitespace-nowrap">
              {activeTarget === 'secondary' ? 'Configuring Now' : 'Click to Set'}
            </span>
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 no-scrollbar border-b border-slate-800">
          {[
            { id: 'all', label: 'All AI Engines', icon: <Layers size={13} /> },
            { id: 'free', label: 'Fast & Free', icon: <Zap size={13} /> },
            { id: 'pro', label: 'Pro & Reasoning', icon: <Crown size={13} /> },
            { id: 'scripture', label: 'Sacred Scripture', icon: <BookOpen size={13} /> },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all shrink-0 border ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-md'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Brutalist Model Cards Grid (Spacious Layout) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
          {filteredModels.map((model) => {
            const isPrimary = primaryModelId === model.id;
            const isSecondary = secondaryModelId === model.id;

            return (
              <div
                key={model.id}
                onClick={() => {
                  if (activeTarget === 'primary') {
                    onSelectPrimaryModel(model.id);
                  } else {
                    onSelectSecondaryModel(model.id);
                  }
                }}
                style={{ backgroundColor: model.bgColor }}
                className={`brutalist-card group ${
                  isPrimary ? 'selected-primary' : isSecondary ? 'selected-secondary' : ''
                }`}
              >
                {/* CSS Hover pseudo background */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-500 rounded-2xl"
                  style={{ backgroundColor: model.beforeColor, opacity: 0 }}
                />

                {/* Badge top right */}
                <div className="absolute top-2 right-2 z-10">
                  {isPrimary && (
                    <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-md">
                      PRIMARY
                    </span>
                  )}
                  {isSecondary && !isPrimary && (
                    <span className="bg-sky-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-md">
                      SECONDARY
                    </span>
                  )}
                  {!isPrimary && !isSecondary && (
                    <span className="bg-black/60 text-white/80 font-bold text-[8px] px-2 py-0.5 rounded-full">
                      {model.badge}
                    </span>
                  )}
                </div>

                {/* Animated Brand Logo Container */}
                <div
                  style={{ backgroundColor: model.logoBg }}
                  className="brand-logo-container border-2 border-white/20"
                >
                  {model.svgIcon}
                </div>

                {/* Model Text Overlay on Hover */}
                <div className="model-card-text">
                  <span className="text-[11px] font-bold text-slate-300">Powered By</span>
                  <span className="text-xs font-black uppercase tracking-wider text-white drop-shadow-md">
                    {model.name}
                  </span>
                  <span className="text-[9px] text-amber-200/90 font-medium truncate max-w-[110px] mt-0.5">
                    {model.provider}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Confirmation */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info size={14} className="text-amber-400 shrink-0" />
            <span>Click any card to assign as {activeTarget === 'primary' ? 'Primary' : 'Secondary'} Model.</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            Apply & Save Engines
          </button>
        </div>
      </motion.div>
    </div>
  );
};
