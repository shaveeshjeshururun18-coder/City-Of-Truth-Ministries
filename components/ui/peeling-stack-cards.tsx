import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, LayoutList, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

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
    defaultStackStyle?: 'swipe' | 'cascade';
    minScale?: number;
    minBrightness?: number;
    className?: string;
}

export const PeelingStackCards: React.FC<PeelingStackCardsProps> = ({
    title,
    tamilTitle,
    subtitle,
    badgeLabel = "Interactive Knowledge Stacks",
    items,
    defaultViewMode = 'stack' as 'stack' | 'tab',
    defaultStackStyle = 'swipe' as 'swipe' | 'cascade',
    minScale = 0.88,
    minBrightness = 0.45,
    className = ""
}) => {
    const [viewMode, setViewMode] = useState<'stack' | 'tab'>(defaultViewMode);
    const [stackStyle, setStackStyle] = useState<'swipe' | 'cascade'>(defaultStackStyle);
    const [activeTabId, setActiveTabId] = useState<string>(items[0]?.id || '');
    const [isMobile, setIsMobile] = useState(false);
    const instanceId = useRef('psc_' + Math.random().toString(36).slice(2, 9)).current;

    // Mobile touch state
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const isDragging = useRef(false);
    const [dragOffset, setDragOffset] = useState(0);

    // Desktop scroll stack refs
    const trackRef = useRef<HTMLDivElement>(null);
    const deckCardRefs = useRef<(HTMLElement | null)[]>([]);
    const wrapperRefs = useRef<(HTMLElement | null)[]>([]);
    const innerRefs = useRef<(HTMLElement | null)[]>([]);
    const containerRef = useRef<HTMLElement>(null);

    deckCardRefs.current = items.map((_, i) => deckCardRefs.current[i] || null);
    wrapperRefs.current = items.map((_, i) => wrapperRefs.current[i] || null);
    innerRefs.current = items.map((_, i) => innerRefs.current[i] || null);

    // Detect mobile
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check, { passive: true });
        return () => window.removeEventListener('resize', check);
    }, []);

    const activeIndex = items.findIndex(item => item.id === activeTabId);

    const goToIndex = useCallback((idx: number) => {
        const clamped = Math.max(0, Math.min(idx, items.length - 1));
        setActiveTabId(items[clamped].id);
    }, [items]);

    // Touch handlers for mobile swipe
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        isDragging.current = true;
        setDragOffset(0);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current) return;
        const dx = e.touches[0].clientX - touchStartX.current;
        const dy = e.touches[0].clientY - touchStartY.current;
        if (Math.abs(dy) > Math.abs(dx) + 10) {
            isDragging.current = false;
            setDragOffset(0);
            return;
        }
        setDragOffset(dx * 0.4);
    };

    const onTouchEnd = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        const threshold = 55;
        if (dragOffset < -threshold) goToIndex(activeIndex + 1);
        else if (dragOffset > threshold) goToIndex(activeIndex - 1);
        setDragOffset(0);
    };

    // Desktop: Swipe stack scroll engine
    useEffect(() => {
        if (isMobile || viewMode !== 'stack' || stackStyle !== 'swipe') return;
        let ticking = false;

        const updateSwipeStack = () => {
            const track = trackRef.current;
            if (!track) return;
            const cards = deckCardRefs.current.filter(Boolean) as HTMLElement[];
            if (!cards.length) return;

            const rect = track.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const stickyTop = Math.max(viewportHeight * 0.08, 80);
            const totalScroll = rect.height - viewportHeight;
            if (totalScroll <= 0) return;

            const scrolled = Math.max(0, Math.min(totalScroll, stickyTop - rect.top));
            const numCards = cards.length;
            const numTransitions = Math.max(numCards - 1, 1);
            const segmentLength = totalScroll / numTransitions;
            const currentFloatIndex = scrolled / segmentLength;
            const activeIdx = Math.min(Math.floor(currentFloatIndex), numTransitions - 1);
            const activeProgress = Math.max(0, Math.min(1, currentFloatIndex - activeIdx));

            cards.forEach((card, index) => {
                if (index < activeIdx) {
                    const swipeDir = index % 2 === 0 ? -1 : 1;
                    card.style.transform = `translate3d(${swipeDir * 90}px, -135%, 0) rotateZ(${swipeDir * 10}deg) rotateX(-16deg) scale(1.02)`;
                    card.style.opacity = '0';
                    card.style.pointerEvents = 'none';
                    card.style.zIndex = String((numCards - index) * 10);
                } else if (index === activeIdx) {
                    const p = activeProgress;
                    const swipeDir = index % 2 === 0 ? -1 : 1;
                    const opacity = p > 0.84 ? Math.max(0, 1 - (p - 0.84) / 0.16) : 1;
                    card.style.transform = `translate3d(${(swipeDir * p * 75).toFixed(1)}px, ${-(p * 128).toFixed(1)}%, 0) rotateZ(${(swipeDir * p * 8).toFixed(2)}deg) rotateX(${-(p * 14).toFixed(2)}deg) scale(${(1 + p * 0.02).toFixed(4)})`;
                    card.style.opacity = `${opacity.toFixed(3)}`;
                    card.style.pointerEvents = p > 0.65 ? 'none' : 'auto';
                    card.style.filter = `brightness(1) drop-shadow(0 ${15 + p * 20}px ${30 + p * 15}px rgba(0,0,0,${(0.55 * (1 - p * 0.4)).toFixed(2)}))`;
                    card.style.zIndex = String((numCards - index) * 10 + 20);
                } else {
                    const clampedOffset = Math.max(0, (index - activeIdx) - activeProgress);
                    card.style.transform = `translate3d(0, ${(clampedOffset * 22).toFixed(1)}px, 0) rotateZ(0deg) rotateX(0deg) scale(${Math.max(0.82, 1 - clampedOffset * 0.042).toFixed(4)})`;
                    card.style.opacity = '1';
                    card.style.pointerEvents = clampedOffset < 0.25 ? 'auto' : 'none';
                    card.style.filter = `brightness(${Math.max(0.68, 1 - clampedOffset * 0.085).toFixed(3)}) drop-shadow(0 ${Math.max(6, 14 - clampedOffset * 2)}px 25px rgba(0,0,0,${Math.max(0.25, 0.5 - clampedOffset * 0.08).toFixed(2)}))`;
                    card.style.zIndex = String((numCards - index) * 10);
                }
            });

            const currentFront = activeProgress > 0.5 ? Math.min(activeIdx + 1, numCards - 1) : activeIdx;
            if (items[currentFront]) setActiveTabId(items[currentFront].id);
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => { updateSwipeStack(); ticking = false; });
                ticking = true;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        updateSwipeStack();
        return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
    }, [viewMode, stackStyle, items, isMobile]);

    // Desktop: Cascade scroll engine
    useEffect(() => {
        if (isMobile || viewMode !== 'stack' || stackStyle !== 'cascade') return;
        let ticking = false;

        const updateCascade = () => {
            const wrappers = wrapperRefs.current.filter(Boolean) as HTMLElement[];
            const inners = innerRefs.current.filter(Boolean) as HTMLElement[];
            if (!wrappers.length) return;
            const viewportHeight = window.innerHeight;
            const baseStickyTop = Math.max(viewportHeight * 0.10, 85);

            wrappers.forEach((wrapper, index) => {
                const inner = inners[index];
                if (!inner) return;
                wrapper.style.zIndex = String(index * 10 + 10);
                const STICKY_TOP = baseStickyTop + (index * 24);
                const rect = wrapper.getBoundingClientRect();
                if (rect.top <= STICKY_TOP + 2) {
                    const nextWrapper = wrappers[index + 1];
                    let progress = 0;
                    if (nextWrapper) {
                        const nextRect = nextWrapper.getBoundingClientRect();
                        const nextStickyTop = baseStickyTop + ((index + 1) * 24);
                        progress = Math.max(0, Math.min(1, 1 - (nextRect.top - nextStickyTop) / (viewportHeight - nextStickyTop)));
                    }
                    inner.style.transform = `translate3d(0, ${-(progress * 120).toFixed(1)}px, 0) scale(${(1 - progress * 0.10).toFixed(4)})`;
                    inner.style.filter = `brightness(${(1 - progress * 0.40).toFixed(2)})`;
                } else {
                    inner.style.transform = 'translate3d(0, 0px, 0) scale(1)';
                    inner.style.filter = 'brightness(1)';
                }
            });
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => { updateCascade(); ticking = false; });
                ticking = true;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        updateCascade();
        return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
    }, [viewMode, stackStyle, items, isMobile]);

    const handleTabClick = (id: string) => {
        setActiveTabId(id);
        if (isMobile) return;
        const idx = items.findIndex(item => item.id === id);
        if (idx === -1) return;
        if (viewMode === 'stack' && stackStyle === 'swipe' && trackRef.current) {
            const rect = trackRef.current.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const vh = window.innerHeight;
            const totalScroll = rect.height - vh;
            const segmentLength = totalScroll / Math.max(items.length - 1, 1);
            const stickyTop = Math.max(vh * 0.08, 80);
            window.scrollTo({ top: Math.max(0, scrollTop + rect.top - stickyTop + (idx * segmentLength) + 12), behavior: 'smooth' });
        } else if (viewMode === 'stack' && stackStyle === 'cascade' && wrapperRefs.current[idx]) {
            const wrapper = wrapperRefs.current[idx]!;
            const rect = wrapper.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const baseStickyTop = Math.max(window.innerHeight * 0.10, 85);
            window.scrollTo({ top: scrollTop + rect.top - (baseStickyTop + idx * 24), behavior: 'smooth' });
        }
    };

    const activeItem = items.find(item => item.id === activeTabId) || items[0];

    // Shared card body renderer
    const renderCardBody = (item: PeelingCardItem, index: number, mobile: boolean) => (
        <>
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col h-full gap-3">
                <div className="flex-1 min-h-0">
                    {item.stageBadge && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] font-black tracking-widest uppercase mb-3 shadow-sm">
                            {item.badgeIcon || <Sparkles size={11} className="text-amber-400" />}
                            <span>{item.stageBadge}</span>
                        </div>
                    )}
                    <h3 className={`font-serif font-black tracking-tight text-white leading-tight mb-1 ${mobile ? 'text-xl' : 'text-2xl sm:text-3xl md:text-4xl'}`}>
                        {item.title}
                    </h3>
                    {item.tamilTitle && (
                        <p className={`font-serif text-amber-300 font-bold mb-2 ${mobile ? 'text-base' : 'text-lg sm:text-xl'}`}>
                            {item.tamilTitle}
                        </p>
                    )}
                    {item.subtitle && (
                        <p className="text-white/70 text-xs sm:text-sm font-medium mb-3 leading-relaxed">{item.subtitle}</p>
                    )}
                    <div className="mt-2">{item.content}</div>
                </div>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50 font-mono shrink-0">
                    <span>CARD {String(index + 1).padStart(2,'0')} / {String(items.length).padStart(2,'0')}</span>
                    {mobile ? (
                        <span className="text-white/60 flex items-center gap-1">
                            {index < items.length - 1 ? <><span>Swipe</span><ChevronRight size={11}/></> : <span>Last card</span>}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-white/70">
                            {index === items.length - 1 ? 'Final Card' : 'Scroll to swipe'}
                            {index < items.length - 1 && <ChevronRight size={12} className="rotate-90 animate-bounce"/>}
                        </span>
                    )}
                </div>
            </div>
        </>
    );

    // =========================================================================
    // MOBILE RENDER
    // =========================================================================
    if (isMobile) {
        return (
            <section ref={containerRef} className={`relative w-full px-0 my-8 ${className}`}>
                {(title || subtitle || badgeLabel) && (
                    <div className="text-center max-w-sm mx-auto mb-5 px-4">
                        {badgeLabel && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[9px] font-black tracking-widest uppercase mb-3">
                                <Sparkles size={10} className="text-amber-500 animate-pulse" />
                                <span>{badgeLabel}</span>
                            </div>
                        )}
                        {title && <h2 className="text-2xl font-serif font-black text-slate-900 tracking-tight mb-1">{title}</h2>}
                        {tamilTitle && <p className="text-lg font-serif text-purple-700 font-bold mb-2">{tamilTitle}</p>}
                        {subtitle && <p className="text-slate-500 text-xs font-medium leading-relaxed">{subtitle}</p>}
                    </div>
                )}

                {/* Swipeable Card */}
                <div
                    className="relative w-full overflow-hidden select-none px-3"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {activeItem && (
                            <motion.article
                                key={activeItem.id}
                                initial={{ opacity: 0, x: dragOffset <= 0 ? 48 : -48 }}
                                animate={{ opacity: 1, x: dragOffset }}
                                exit={{ opacity: 0, x: dragOffset <= 0 ? -48 : 48 }}
                                transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                                className={`w-full rounded-3xl p-5 text-white shadow-2xl border ${activeItem.borderColor || 'border-white/10'} bg-gradient-to-br ${activeItem.themeGradient} relative overflow-hidden flex flex-col`}
                                style={{ minHeight: '380px', cursor: 'grab', touchAction: 'pan-y' }}
                            >
                                {renderCardBody(activeItem, activeIndex, true)}
                            </motion.article>
                        )}
                    </AnimatePresence>
                </div>

                {/* Dots + Arrows */}
                <div className="flex items-center justify-center gap-3 mt-4 px-4">
                    <button
                        onClick={() => goToIndex(activeIndex - 1)}
                        disabled={activeIndex === 0}
                        className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center disabled:opacity-30 active:scale-90 transition-all"
                    >
                        <ChevronLeft size={14} className="text-slate-700" />
                    </button>
                    <div className="flex items-center gap-1.5">
                        {items.map((item, i) => (
                            <button
                                key={item.id}
                                onClick={() => goToIndex(i)}
                                className={`rounded-full transition-all ${i === activeIndex ? 'w-5 h-2.5 bg-slate-800' : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'}`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={() => goToIndex(activeIndex + 1)}
                        disabled={activeIndex === items.length - 1}
                        className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center disabled:opacity-30 active:scale-90 transition-all"
                    >
                        <ChevronRight size={14} className="text-slate-700" />
                    </button>
                </div>

                {/* Tab pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-4 mt-3 pb-1">
                    {items.map((item, i) => (
                        <button
                            key={item.id}
                            onClick={() => goToIndex(i)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap shrink-0 transition-all ${
                                i === activeIndex ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 active:bg-slate-200'
                            }`}
                        >
                            {item.tabLabel || item.title}
                        </button>
                    ))}
                </div>
            </section>
        );
    }

    // =========================================================================
    // DESKTOP RENDER
    // =========================================================================
    return (
        <section ref={containerRef} className={`relative max-w-6xl mx-auto px-4 sm:px-6 my-16 ${className}`}>
            {(title || subtitle || badgeLabel) && (
                <div className="text-center max-w-2xl mx-auto mb-10">
                    {badgeLabel && (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black tracking-widest uppercase mb-3 shadow-sm">
                            <Sparkles size={12} className="text-amber-500 animate-pulse" />
                            <span>{badgeLabel}</span>
                        </div>
                    )}
                    {title && <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-slate-900 tracking-tight mb-2">{title}</h2>}
                    {tamilTitle && <p className="text-xl sm:text-2xl font-serif text-purple-700 font-bold mb-3">{tamilTitle}</p>}
                    {subtitle && <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">{subtitle}</p>}
                </div>
            )}

            {/* Nav Bar */}
            <div className="sticky top-20 z-30 mb-8 backdrop-blur-xl bg-white/90 p-2 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-900/5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 flex-1">
                        {items.map((item) => {
                            const isActive = activeTabId === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleTabClick(item.id)}
                                    className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                                        isActive ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    {item.tabIcon && <span className="opacity-80">{item.tabIcon}</span>}
                                    <span>{item.tabLabel || item.title}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId={`activePillGlow_${instanceId}`}
                                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 -z-10 pointer-events-none"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 shrink-0">
                        <button
                            onClick={() => { setViewMode('stack'); setStackStyle('swipe'); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                viewMode === 'stack' && stackStyle === 'swipe' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Sparkles size={13} className={viewMode === 'stack' && stackStyle === 'swipe' ? 'text-amber-500' : ''} />
                            <span className="hidden sm:inline">Swipe Stack</span>
                        </button>
                        <button
                            onClick={() => { setViewMode('stack'); setStackStyle('cascade'); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                viewMode === 'stack' && stackStyle === 'cascade' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Layers size={13} className={viewMode === 'stack' && stackStyle === 'cascade' ? 'text-blue-600' : ''} />
                            <span className="hidden sm:inline">Cascade</span>
                        </button>
                        <button
                            onClick={() => setViewMode('tab')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                viewMode === 'tab' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <LayoutList size={13} className={viewMode === 'tab' ? 'text-blue-600' : ''} />
                            <span className="hidden sm:inline">Tabs</span>
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'stack' && stackStyle === 'swipe' ? (
                <div ref={trackRef} className="stack-scroll-track relative w-full" style={{ height: `${Math.max(items.length * 80, 240)}vh` }}>
                    <div className="sticky top-[80px] md:top-[90px] h-[calc(100vh-100px)] max-h-[720px] w-full flex flex-col justify-start overflow-visible pt-1 pb-4" style={{ perspective: '1400px' }}>
                        <div className="relative w-full flex-1 min-h-[480px] max-h-[620px]">
                            {items.map((item, index) => (
                                <div
                                    key={item.id}
                                    ref={(el) => { deckCardRefs.current[index] = el; }}
                                    style={{ position: 'absolute', inset: 0, zIndex: (items.length - index) * 10, transformOrigin: 'top center', willChange: 'transform, opacity, filter', transformStyle: 'preserve-3d', transition: 'box-shadow 0.3s ease' }}
                                    className="w-full h-full flex flex-col"
                                >
                                    <article className={`card-inner h-full w-full rounded-[2.2rem] p-8 md:p-10 text-white shadow-[0_-15px_50px_rgba(0,0,0,0.6)] border ${item.borderColor || 'border-white/10'} bg-gradient-to-br ${item.themeGradient} relative overflow-hidden flex flex-col justify-between`}>
                                        {renderCardBody(item, index, false)}
                                        {item.visualSide && (
                                            <div className="absolute right-10 bottom-16 w-[320px] hidden lg:flex items-center justify-center">{item.visualSide}</div>
                                        )}
                                    </article>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : viewMode === 'stack' && stackStyle === 'cascade' ? (
                <div className="stack-area relative pt-4 pb-36 max-w-6xl mx-auto" style={{ perspective: '1200px' }}>
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            id={`peeling-card-${item.id}`}
                            ref={(el) => { wrapperRefs.current[index] = el; }}
                            style={{ top: `calc(10vh + ${index * 24}px)` }}
                            className="card-wrapper sticky mb-24 md:mb-32"
                        >
                            <article
                                ref={(el) => { innerRefs.current[index] = el; }}
                                style={{ transformOrigin: 'top center', willChange: 'transform, opacity, filter', transformStyle: 'preserve-3d' }}
                                className={`card-inner min-h-[480px] md:min-h-[520px] rounded-[2.2rem] p-8 md:p-10 text-white shadow-[0_-15px_50px_rgba(0,0,0,0.6)] border ${item.borderColor || 'border-white/10'} bg-gradient-to-br ${item.themeGradient} relative overflow-hidden flex flex-col justify-between`}
                            >
                                {renderCardBody(item, index, false)}
                                {item.visualSide && (
                                    <div className="w-full lg:w-[360px] flex items-center justify-center shrink-0 mt-4 lg:mt-0">{item.visualSide}</div>
                                )}
                            </article>
                        </div>
                    ))}
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    {activeItem && (
                        <motion.article
                            key={activeItem.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                            className={`rounded-[2.2rem] p-8 md:p-10 text-white shadow-2xl border ${activeItem.borderColor || 'border-white/10'} bg-gradient-to-br ${activeItem.themeGradient} relative overflow-hidden flex flex-col`}
                        >
                            {renderCardBody(activeItem, activeIndex, false)}
                            {activeItem.visualSide && (
                                <div className="w-full lg:w-[380px] flex items-center justify-center shrink-0 mt-4 lg:mt-0">{activeItem.visualSide}</div>
                            )}
                        </motion.article>
                    )}
                </AnimatePresence>
            )}
        </section>
    );
};

export default PeelingStackCards;
