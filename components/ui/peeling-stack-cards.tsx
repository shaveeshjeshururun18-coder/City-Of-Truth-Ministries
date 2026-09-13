import React, { useEffect, useRef } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';

export interface PeelingCardItem {
    id: string;
    stageBadge?: string;
    badgeIcon?: React.ReactNode;
    title: string;
    tamilTitle?: string;
    subtitle?: string;
    themeGradient: string;
    accentColor?: string;
    borderColor?: string;
    content: React.ReactNode;
    visualSide?: React.ReactNode;
    tabLabel?: string;
    tabIcon?: React.ReactNode;
}

export interface PeelingStackCardsProps {
    title?: string;
    tamilTitle?: string;
    subtitle?: string;
    badgeLabel?: string;
    items: PeelingCardItem[];
    defaultViewMode?: 'stack' | 'tab';
    defaultStackStyle?: 'cascade' | 'motion-peel' | 'antlion';
    minScale?: number;
    minBrightness?: number;
    className?: string;
    desktopOnlyStack?: boolean;
}

/**
 * Enhanced StackingCards Component (Clean Cascading Stack)
 * 
 * Features:
 * - Pure, smooth CSS sticky cascading deck
 * - Quick-jump pill navigation with active intersection observation
 * - Responsive layout without rigid scroll-locking
 */
export const PeelingStackCards: React.FC<PeelingStackCardsProps> = ({
    title,
    tamilTitle,
    subtitle,
    badgeLabel = "Interactive Knowledge Stacks",
    items,
    className = "",
    desktopOnlyStack = false
}) => {
    // ── Zero-re-render active index tracking ──────────────────────────────────
    const activeIndexRef = useRef<number>(0);
    const navPillsRef = useRef<(HTMLButtonElement | null)[]>([]);

    // IntersectionObserver for cascade mode active highlighting
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const idxStr = entry.target.getAttribute('data-card-index');
                        if (idxStr !== null) {
                            const newIdx = parseInt(idxStr, 10);
                            if (newIdx !== activeIndexRef.current) {
                                const prev = navPillsRef.current[activeIndexRef.current];
                                const next = navPillsRef.current[newIdx];
                                if (prev) {
                                    prev.classList.remove('bg-amber-500', 'text-slate-950', 'font-black', 'shadow-lg');
                                    prev.classList.add('text-slate-300');
                                }
                                if (next) {
                                    next.classList.remove('text-slate-300');
                                    next.classList.add('bg-amber-500', 'text-slate-950', 'font-black', 'shadow-lg');
                                }
                                activeIndexRef.current = newIdx;
                            }
                        }
                    }
                });
            },
            { rootMargin: '-15% 0px -40% 0px', threshold: 0.1 }
        );

        items.forEach((item) => {
            const el = document.getElementById(`cascade-card-${item.id}`);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [items]);

    // Smooth jump to target card
    const scrollToCard = (index: number) => {
        if (index !== activeIndexRef.current) {
            const prev = navPillsRef.current[activeIndexRef.current];
            const next = navPillsRef.current[index];
            if (prev) {
                prev.classList.remove('bg-amber-500', 'text-slate-950', 'font-black', 'shadow-lg');
                prev.classList.add('text-slate-300');
            }
            if (next) {
                next.classList.remove('text-slate-300');
                next.classList.add('bg-amber-500', 'text-slate-950', 'font-black', 'shadow-lg');
            }
            activeIndexRef.current = index;
        }

        const targetItem = items[index];
        if (!targetItem) return;
        const el = document.getElementById(`cascade-card-${targetItem.id}`);
        if (el) {
            const yOffset = -90;
            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <section className={`relative w-full ${className}`}>
            {/* Section Header */}
            {(title || subtitle || badgeLabel) && (
                <div className="text-center max-w-4xl mx-auto px-4 mb-8">
                    {badgeLabel && (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black tracking-widest uppercase mb-3 shadow-sm">
                            <Sparkles size={12} className="text-amber-400 animate-pulse" />
                            <span>{badgeLabel}</span>
                        </div>
                    )}
                    {title && (
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-slate-900 dark:text-white tracking-tight mb-2">
                            {title}
                        </h2>
                    )}
                    {tamilTitle && (
                        <p className="text-xl sm:text-2xl font-serif text-amber-600 dark:text-amber-400 font-bold mb-3">
                            {tamilTitle}
                        </p>
                    )}
                    {subtitle && (
                        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium leading-relaxed max-w-2xl mx-auto">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}

            {/* Sticky Navigation Bar */}
            <div className="sticky top-16 z-30 max-w-5xl mx-auto px-4 sm:px-6 mb-6">
                <div className="p-2 rounded-2xl bg-slate-950/90 border border-white/15 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3">
                    {/* Quick Navigation Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 max-w-full">
                        {items.map((item, idx) => (
                            <button
                                key={item.id}
                                ref={el => { navPillsRef.current[idx] = el; }}
                                onClick={() => scrollToCard(idx)}
                                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                                    idx === 0
                                        ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
                                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                                }`}
                                title={item.title}
                            >
                                {item.tabIcon && <span className="opacity-80">{item.tabIcon}</span>}
                                <span>{item.tabLabel || item.stageBadge || `0${idx + 1}`}</span>
                            </button>
                        ))}
                    </div>

                    <div className="hidden sm:flex items-center gap-2 text-[11px] text-white/50 font-mono shrink-0 ml-auto px-2">
                        <span>{items.length} CARDS</span>
                    </div>
                </div>
            </div>

            {/* Cascading Sticky Stacking Cards */}
            <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6">
                <div className="relative">
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1;
                        const stickyTopOffset = `calc(76px + ${index * 14}px)`;
                        const zIndexValue = 10 + index;

                        return (
                            <article
                                key={item.id}
                                id={`cascade-card-${item.id}`}
                                data-card-index={index}
                                style={{
                                    ...(desktopOnlyStack
                                        ? { '--stack-top': stickyTopOffset }
                                        : { top: stickyTopOffset }
                                    ),
                                    zIndex: zIndexValue,
                                } as React.CSSProperties}
                                className={`${
                                    desktopOnlyStack
                                        ? 'relative md:sticky top-auto md:top-[var(--stack-top)]'
                                        : 'sticky'
                                } rounded-[24px] sm:rounded-[28px] md:rounded-[32px] p-5 sm:p-7 md:p-8 text-white shadow-[0_-14px_40px_rgba(0,0,0,0.6)] border-t border-white/25 border-x border-b ${
                                    item.borderColor || 'border-white/10'
                                } bg-[#0c0d14] bg-gradient-to-br ${item.themeGradient} transition-all duration-300 ${
                                    isLast ? 'mb-8' : desktopOnlyStack ? 'mb-6 md:mb-20' : 'mb-12 sm:mb-16 md:mb-20'
                                }`}
                            >
                                {/* Shimmer line */}
                                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

                                <div className="flex flex-col lg:flex-row gap-6 lg:items-center w-full">
                                    <div className="flex-1 w-full min-w-0">
                                        {item.stageBadge && (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] font-black tracking-widest uppercase mb-2.5 shadow-sm text-amber-300">
                                                {item.badgeIcon || <Sparkles size={11} />}
                                                <span>{item.stageBadge}</span>
                                            </div>
                                        )}
                                        <h3 className="font-serif font-black tracking-tight text-white leading-tight mb-1 text-2xl sm:text-3xl md:text-4xl">
                                            {item.title}
                                        </h3>
                                        {item.tamilTitle && (
                                            <p className="font-serif text-amber-300 font-bold mb-2 text-base sm:text-lg">
                                                {item.tamilTitle}
                                            </p>
                                        )}
                                        {item.subtitle && (
                                            <p className="text-white/70 text-xs sm:text-sm font-medium mb-4 leading-relaxed">
                                                {item.subtitle}
                                            </p>
                                        )}
                                        <div className="text-white/90">
                                            {item.content}
                                        </div>
                                    </div>

                                    {item.visualSide && (
                                        <div className="w-full lg:w-[320px] flex items-center justify-center shrink-0">
                                            {item.visualSide}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-3 mt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-white/60 font-mono">
                                    <span className="font-bold tracking-wider">
                                        CARD {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-white/70">
                                        {isLast ? (
                                            'Final Card'
                                        ) : (
                                            <>
                                                <span>Scroll down to stack</span>
                                                <ChevronRight size={12} className="rotate-90 animate-bounce text-amber-400" />
                                            </>
                                        )}
                                    </span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default PeelingStackCards;
