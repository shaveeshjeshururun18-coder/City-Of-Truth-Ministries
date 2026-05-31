import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, MapPin, Sparkles } from 'lucide-react';

export interface TourStep {
    target: string;           // CSS selector e.g. '#some-id' or '.class-name'
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    action?: string;          // Optional: label for the action button
    scrollIntoView?: boolean; // Auto-scroll to the element
}

interface GuidedTourProps {
    steps: TourStep[];
    isActive: boolean;
    onComplete: () => void;
    onSkip: () => void;
    tourName: string;         // Used for localStorage key
    accentColor?: string;     // Default: '#4f46e5' (brand indigo)
}

const PADDING = 10; // px around highlighted element

const useElementRect = (selector: string, active: boolean) => {
    const [rect, setRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (!active || !selector) { setRect(null); return; }
        const update = () => {
            const el = document.querySelector(selector) as HTMLElement | null;
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                setTimeout(() => { setRect(el.getBoundingClientRect()); }, 300);
            } else {
                setRect(null);
            }
        };
        update();
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
        return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
    }, [selector, active]);

    return rect;
};

const TooltipArrow: React.FC<{ position: string; color: string }> = ({ position, color }) => {
    const base = 'absolute w-0 h-0';
    const styles: Record<string, React.CSSProperties> = {
        bottom: { top: '-8px', left: '50%', transform: 'translateX(-50%)', borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: `8px solid ${color}` },
        top:    { bottom: '-8px', left: '50%', transform: 'translateX(-50%)', borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: `8px solid ${color}` },
        right:  { left: '-8px', top: '50%', transform: 'translateY(-50%)', borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: `8px solid ${color}` },
        left:   { right: '-8px', top: '50%', transform: 'translateY(-50%)', borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: `8px solid ${color}` },
        center: {},
    };
    if (position === 'center') return null;
    return <div className={base} style={styles[position] || styles.bottom} />;
};

export const GuidedTour: React.FC<GuidedTourProps> = ({
    steps, isActive, onComplete, onSkip, tourName, accentColor = '#4f46e5'
}) => {
    const [stepIndex, setStepIndex] = useState(0);
    const step = steps[stepIndex];
    const rect = useElementRect(step?.target, isActive);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => { if (isActive) setStepIndex(0); }, [isActive]);

    const next = useCallback(() => {
        if (stepIndex < steps.length - 1) setStepIndex(i => i + 1);
        else { localStorage.setItem(`cot_tour_${tourName}`, '1'); onComplete(); }
    }, [stepIndex, steps.length, onComplete, tourName]);

    const prev = useCallback(() => { if (stepIndex > 0) setStepIndex(i => i - 1); }, [stepIndex]);

    useEffect(() => {
        if (!isActive) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter') next();
            else if (e.key === 'ArrowLeft') prev();
            else if (e.key === 'Escape') { onSkip(); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isActive, next, prev, onSkip]);

    if (!isActive || !step) return null;

    // Compute spotlight position
    const spotX = rect ? rect.left - PADDING : -9999;
    const spotY = rect ? rect.top - PADDING : -9999;
    const spotW = rect ? rect.width + PADDING * 2 : 0;
    const spotH = rect ? rect.height + PADDING * 2 : 0;

    // Compute tooltip position
    const position = step.position || 'bottom';
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const TOOLTIP_W = Math.min(320, vw - 32);
    const TOOLTIP_MAX_H = 280;

    let tooltipStyle: React.CSSProperties = { width: TOOLTIP_W, maxWidth: TOOLTIP_W };
    if (!rect || position === 'center') {
        tooltipStyle = { ...tooltipStyle, left: '50%', top: '50%', transform: 'translate(-50%, -50%)', position: 'fixed' };
    } else {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        let left = Math.max(12, Math.min(centerX - TOOLTIP_W / 2, vw - TOOLTIP_W - 12));
        let top = 0;
        if (position === 'bottom') top = rect.bottom + PADDING + 12;
        else if (position === 'top') top = rect.top - PADDING - TOOLTIP_MAX_H - 12;
        else if (position === 'right') { left = rect.right + PADDING + 12; top = centerY - 80; }
        else if (position === 'left') { left = rect.left - PADDING - TOOLTIP_W - 12; top = centerY - 80; }
        top = Math.max(12, Math.min(top, vh - TOOLTIP_MAX_H - 12));
        tooltipStyle = { ...tooltipStyle, left, top, position: 'fixed' };
    }

    const progress = ((stepIndex + 1) / steps.length) * 100;

    return (
        <AnimatePresence>
            {isActive && (
                <>
                    {/* SVG Spotlight Overlay */}
                    <svg
                        className="fixed inset-0 z-[900] pointer-events-none"
                        width="100%"
                        height="100%"
                        style={{ position: 'fixed', top: 0, left: 0 }}
                    >
                        <defs>
                            <mask id="cot-tour-mask">
                                <rect width="100%" height="100%" fill="white" />
                                {rect && (
                                    <rect
                                        x={spotX} y={spotY}
                                        width={spotW} height={spotH}
                                        rx={12} ry={12}
                                        fill="black"
                                    />
                                )}
                            </mask>
                        </defs>
                        <rect
                            width="100%" height="100%"
                            fill="rgba(10,8,30,0.78)"
                            mask="url(#cot-tour-mask)"
                        />
                        {/* Animated spotlight border */}
                        {rect && (
                            <rect
                                x={spotX} y={spotY}
                                width={spotW} height={spotH}
                                rx={12} ry={12}
                                fill="none"
                                stroke={accentColor}
                                strokeWidth={2.5}
                                strokeDasharray="8 4"
                                style={{ animation: 'cot-dash 1.2s linear infinite' }}
                            />
                        )}
                    </svg>

                    {/* Pulse ring around the element */}
                    {rect && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.15, 1] }}
                            transition={{ duration: 1.8, repeat: Infinity }}
                            className="fixed z-[901] pointer-events-none rounded-xl border-2"
                            style={{
                                left: spotX - 4, top: spotY - 4,
                                width: spotW + 8, height: spotH + 8,
                                borderColor: accentColor,
                                boxShadow: `0 0 20px ${accentColor}55`,
                            }}
                        />
                    )}

                    {/* Backdrop click to skip */}
                    <div
                        className="fixed inset-0 z-[905] cursor-pointer"
                        style={{ mixBlendMode: 'normal' }}
                        onClick={onSkip}
                    />

                    {/* Tooltip Card */}
                    <motion.div
                        ref={tooltipRef}
                        key={stepIndex}
                        initial={{ opacity: 0, scale: 0.9, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -6 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        style={{ ...tooltipStyle, zIndex: 910 }}
                        onClick={(e) => e.stopPropagation()}
                        className="pointer-events-auto"
                    >
                        {/* Arrow */}
                        <div className="relative">
                            <TooltipArrow position={position} color="#1e1b4b" />
                            {/* Card */}
                            <div className="rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                                {/* Top accent bar */}
                                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${accentColor}, #a78bfa)` }} />

                                {/* Header */}
                                <div className="bg-[#1e1b4b] px-4 py-3 flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: accentColor + '33', border: `1px solid ${accentColor}55` }}>
                                            <MapPin size={13} style={{ color: accentColor }} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Step {stepIndex + 1} of {steps.length}</p>
                                            <h3 className="text-white font-black text-sm leading-tight">{step.title}</h3>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onSkip}
                                        className="shrink-0 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>

                                {/* Progress bar */}
                                <div className="h-0.5 bg-white/10">
                                    <motion.div
                                        className="h-full"
                                        style={{ background: accentColor }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>

                                {/* Body */}
                                <div className="bg-[#13112e] px-4 py-4">
                                    <p className="text-white/80 text-sm leading-relaxed">{step.description}</p>
                                </div>

                                {/* Footer */}
                                <div className="bg-[#1a1740] px-4 py-3 flex items-center justify-between gap-3">
                                    <button
                                        onClick={onSkip}
                                        className="text-[10px] font-bold text-white/30 hover:text-white/60 uppercase tracking-widest transition-colors"
                                    >
                                        Skip Tour
                                    </button>
                                    <div className="flex items-center gap-2">
                                        {stepIndex > 0 && (
                                            <button
                                                onClick={prev}
                                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
                                            >
                                                <ChevronLeft size={15} />
                                            </button>
                                        )}
                                        <button
                                            onClick={next}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-black text-[11px] uppercase tracking-wider text-white transition-all active:scale-95 shadow-lg"
                                            style={{ background: `linear-gradient(135deg, ${accentColor}, #7c3aed)` }}
                                        >
                                            {stepIndex === steps.length - 1 ? <><Sparkles size={12} /> Done!</> : <>Next <ChevronRight size={13} /></>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Dot indicators */}
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[915] flex items-center gap-1.5 pointer-events-none">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className="rounded-full transition-all duration-300"
                                style={{
                                    width: i === stepIndex ? 20 : 6,
                                    height: 6,
                                    background: i === stepIndex ? accentColor : 'rgba(255,255,255,0.25)',
                                }}
                            />
                        ))}
                    </div>

                    <style>{`@keyframes cot-dash { to { stroke-dashoffset: -24; } }`}</style>
                </>
            )}
        </AnimatePresence>
    );
};

// ─── Welcome Modal ─────────────────────────────────────────────────────────────
interface WelcomeModalProps {
    isOpen: boolean;
    onStartTour: () => void;
    onSkip: () => void;
    userName?: string;
}

export const WelcomeTourModal: React.FC<WelcomeModalProps> = ({ isOpen, onStartTour, onSkip, userName }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[920] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md"
                onClick={onSkip}
            >
                <motion.div
                    initial={{ scale: 0.85, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
                >
                    {/* Gradient header */}
                    <div className="relative h-36 bg-gradient-to-br from-brand-900 via-brand-700 to-indigo-800 flex flex-col items-center justify-center">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
                        <div className="relative z-10 flex flex-col items-center gap-2">
                            <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center">
                                <Sparkles size={28} className="text-amber-300" />
                            </div>
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">City of Truth Ministries</p>
                        </div>
                    </div>
                    {/* Body */}
                    <div className="bg-white px-6 py-5">
                        <h2 className="text-2xl font-serif font-black text-brand-950 mb-1">
                            {userName ? `Welcome, ${userName.split(' ')[0]}! 👋` : 'Welcome! 👋'}
                        </h2>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4">
                            This is your ministry hub — explore the <strong>Hebrew tools</strong>, download your <strong>Entrust Card</strong>, and stay connected with your community.
                        </p>
                        <p className="text-xs text-slate-400 mb-5">Would you like a quick guided tour to get started?</p>
                        <button
                            onClick={onStartTour}
                            className="w-full py-3.5 bg-gradient-to-r from-brand-700 to-brand-900 text-white font-black text-sm rounded-2xl shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all active:scale-98 mb-2.5 flex items-center justify-center gap-2"
                        >
                            <Sparkles size={15} /> Take a Quick Tour
                        </button>
                        <button
                            onClick={onSkip}
                            className="w-full py-3 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest transition-colors"
                        >
                            Skip, I'll explore on my own
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

// ─── Tour hook ─────────────────────────────────────────────────────────────────
export const useTour = (tourName: string) => {
    const [isActive, setIsActive] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);

    const hasSeen = () => !!localStorage.getItem(`cot_tour_${tourName}`);

    const start = () => { setIsActive(true); setShowWelcome(false); };
    const stop = () => { setIsActive(false); localStorage.setItem(`cot_tour_${tourName}`, '1'); };
    const promptIfNew = () => { if (!hasSeen()) setShowWelcome(true); };

    return { isActive, showWelcome, setShowWelcome, start, stop, promptIfNew, hasSeen };
};
