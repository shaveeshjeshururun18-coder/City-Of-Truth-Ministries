import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, LayoutList, ChevronRight, Sparkles, MoveUpRight } from 'lucide-react';

export interface PeelingCardItem {
    id: string;
    stageBadge?: string;
    badgeIcon?: React.ReactNode;
    title: string;
    tamilTitle?: string;
    subtitle?: string;
    themeGradient: string; // Tailwind gradient, e.g. "from-[#1c1917] via-[#292524] to-[#451a03]"
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
    const instanceId = useRef('psc_' + Math.random().toString(36).slice(2, 9)).current;
    
    // Swipe Stack Deck refs
    const trackRef = useRef<HTMLDivElement>(null);
    const deckCardRefs = useRef<(HTMLElement | null)[]>([]);
    
    // Cascade Stack refs
    const wrapperRefs = useRef<(HTMLElement | null)[]>([]);
    const innerRefs = useRef<(HTMLElement | null)[]>([]);
    const containerRef = useRef<HTMLElement>(null);

    // Keep refs arrays sized correctly
    deckCardRefs.current = items.map((_, i) => deckCardRefs.current[i] || null);
    wrapperRefs.current = items.map((_, i) => wrapperRefs.current[i] || null);
    innerRefs.current = items.map((_, i) => innerRefs.current[i] || null);

    // =========================================================================
    // 1. SWIPE AWAY CARD STACK SCROLL ENGINE (Physical Deck where cards swipe away)
    // =========================================================================
    useEffect(() => {
        if (viewMode !== 'stack' || stackStyle !== 'swipe') return;

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

            // Distance scrolled through the track once it reaches sticky position
            const scrolled = Math.max(0, Math.min(totalScroll, stickyTop - rect.top));

            const numCards = cards.length;
            const numTransitions = Math.max(numCards - 1, 1);
            const segmentLength = totalScroll / numTransitions;

            const currentFloatIndex = scrolled / segmentLength;
            const activeIndex = Math.min(Math.floor(currentFloatIndex), numTransitions - 1);
            const activeProgress = Math.max(0, Math.min(1, currentFloatIndex - activeIndex));

            cards.forEach((card, index) => {
                if (index < activeIndex) {
                    // Card has already swiped away
                    const swipeDir = index % 2 === 0 ? -1 : 1;
                    card.style.transform = `translate3d(${swipeDir * 90}px, -135%, 0) rotateZ(${swipeDir * 10}deg) rotateX(-16deg) scale(1.02)`;
                    card.style.opacity = '0';
                    card.style.pointerEvents = 'none';
                    card.style.zIndex = String((numCards - index) * 10);
                } else if (index === activeIndex) {
                    // Current active card swiping away with natural scroll velocity
                    const p = activeProgress;
                    const swipeDir = index % 2 === 0 ? -1 : 1;
                    const translateX = swipeDir * (p * 75);
                    const translateY = -(p * 128); // Swipes UP and away
                    const rotateZ = swipeDir * (p * 8); // Natural throw tilt
                    const rotateX = -(p * 14); // Curls forward towards viewer
                    const scale = 1 + (p * 0.02);
                    const opacity = p > 0.84 ? Math.max(0, 1 - (p - 0.84) / 0.16) : 1;
                    const shadowAlpha = (0.55 * (1 - p * 0.4)).toFixed(2);

                    card.style.transform = `translate3d(${translateX.toFixed(1)}px, ${translateY.toFixed(1)}%, 0) rotateZ(${rotateZ.toFixed(2)}deg) rotateX(${rotateX.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
                    card.style.opacity = `${opacity.toFixed(3)}`;
                    card.style.pointerEvents = p > 0.65 ? 'none' : 'auto';
                    card.style.filter = `brightness(1) drop-shadow(0 ${15 + p * 20}px ${30 + p * 15}px rgba(0,0,0,${shadowAlpha}))`;
                    card.style.zIndex = String((numCards - index) * 10 + 20);
                } else {
                    // Upcoming cards layered cleanly in the physical stack
                    const offset = (index - activeIndex) - activeProgress;
                    const clampedOffset = Math.max(0, offset);

                    // Offset tabs (22px peek for each card in the deck)
                    const y = clampedOffset * 22;
                    const scale = Math.max(0.82, 1 - (clampedOffset * 0.042));
                    const brightness = Math.max(0.68, 1 - (clampedOffset * 0.085));
                    const shadowAlpha = Math.max(0.25, 0.5 - (clampedOffset * 0.08));

                    card.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) rotateZ(0deg) rotateX(0deg) scale(${scale.toFixed(4)})`;
                    card.style.opacity = '1';
                    card.style.pointerEvents = clampedOffset < 0.25 ? 'auto' : 'none';
                    card.style.filter = `brightness(${brightness.toFixed(3)}) drop-shadow(0 ${Math.max(6, 14 - clampedOffset * 2)}px 25px rgba(0,0,0,${shadowAlpha.toFixed(2)}))`;
                    card.style.zIndex = String((numCards - index) * 10);
                }
            });

            // Update active navigation pill based on the front card
            const currentFront = activeProgress > 0.5 ? Math.min(activeIndex + 1, numCards - 1) : activeIndex;
            if (items[currentFront]) {
                setActiveTabId(items[currentFront].id);
            }
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateSwipeStack();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        updateSwipeStack();

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [viewMode, stackStyle, items]);

    // =========================================================================
    // 2. CASCADE STACK SCROLL ENGINE (Antlion sticky cascading tabs)
    // =========================================================================
    useEffect(() => {
        if (viewMode !== 'stack' || stackStyle !== 'cascade') return;

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
                        const distanceToNext = nextRect.top - nextStickyTop;
                        const maxDistance = viewportHeight - nextStickyTop;

                        progress = 1 - (distanceToNext / maxDistance);
                        progress = Math.max(0, Math.min(progress, 1));
                    }

                    const scale = 1 - (progress * 0.10);
                    const translateY = -(progress * 120);
                    const brightness = 1 - (progress * 0.40);

                    inner.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
                    inner.style.filter = `brightness(${brightness.toFixed(2)})`;
                } else {
                    inner.style.transform = 'translate3d(0, 0px, 0) scale(1)';
                    inner.style.filter = 'brightness(1)';
                }
            });
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateCascade();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        updateCascade();

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [viewMode, stackStyle, items]);

    // Smooth scroll to target card
    const handleTabClick = (id: string) => {
        setActiveTabId(id);
        const idx = items.findIndex(item => item.id === id);
        if (idx === -1) return;

        if (viewMode === 'stack' && stackStyle === 'swipe') {
            if (!trackRef.current) return;
            const rect = trackRef.current.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const viewportHeight = window.innerHeight;
            const totalScroll = rect.height - viewportHeight;
            const numTransitions = Math.max(items.length - 1, 1);
            const segmentLength = totalScroll / numTransitions;
            const stickyTop = Math.max(viewportHeight * 0.08, 80);

            const trackTopDoc = scrollTop + rect.top;
            const targetScroll = trackTopDoc - stickyTop + (idx * segmentLength) + 12;
            window.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
        } else if (viewMode === 'stack' && stackStyle === 'cascade') {
            if (wrapperRefs.current[idx]) {
                const wrapper = wrapperRefs.current[idx];
                const rect = wrapper!.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const baseStickyTop = Math.max(window.innerHeight * 0.10, 85);
                const targetStickyTop = baseStickyTop + (idx * 24);
                const targetY = scrollTop + rect.top - targetStickyTop;
                window.scrollTo({ top: targetY, behavior: 'smooth' });
            }
        }
    };

    const activeItem = items.find(item => item.id === activeTabId) || items[0];

    return (
        <section ref={containerRef} className={`relative max-w-6xl mx-auto px-4 sm:px-6 my-16 ${className}`}>
            {/* Header / Intro */}
            {(title || subtitle || badgeLabel) && (
                <div className="text-center max-w-2xl mx-auto mb-10">
                    {badgeLabel && (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black tracking-widest uppercase mb-3 shadow-sm">
                            <Sparkles size={12} className="text-amber-500 animate-pulse" />
                            <span>{badgeLabel}</span>
                        </div>
                    )}
                    {title && (
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-slate-900 tracking-tight mb-2">
                            {title}
                        </h2>
                    )}
                    {tamilTitle && (
                        <p className="text-xl sm:text-2xl font-serif text-purple-700 font-bold mb-3">
                            {tamilTitle}
                        </p>
                    )}
                    {subtitle && (
                        <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}

            {/* Navigation & Controls Bar */}
            <div className="sticky top-20 z-30 mb-8 backdrop-blur-xl bg-white/90 p-2 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-900/5 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Tab Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 flex-1">
                        {items.map((item) => {
                            const isActive = activeTabId === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleTabClick(item.id)}
                                    className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                                        isActive
                                            ? 'bg-slate-900 text-white shadow-md'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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

                    {/* View Mode Toggle: Swipe Away Stack vs Cascade Stack vs Tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 shrink-0">
                        <button
                            onClick={() => { setViewMode('stack'); setStackStyle('swipe'); }}
                            title="Swipe Away Stack (Stacked card deck, swiping away as you scroll)"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                viewMode === 'stack' && stackStyle === 'swipe'
                                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Sparkles size={13} className={viewMode === 'stack' && stackStyle === 'swipe' ? 'text-amber-500' : ''} />
                            <span className="hidden sm:inline">Swipe Stack</span>
                        </button>
                        <button
                            onClick={() => { setViewMode('stack'); setStackStyle('cascade'); }}
                            title="Cascade Sticky Stack"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                viewMode === 'stack' && stackStyle === 'cascade'
                                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Layers size={13} className={viewMode === 'stack' && stackStyle === 'cascade' ? 'text-blue-600' : ''} />
                            <span className="hidden sm:inline">Cascade</span>
                        </button>
                        <button
                            onClick={() => setViewMode('tab')}
                            title="Classic Tab View"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                viewMode === 'tab'
                                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <LayoutList size={13} className={viewMode === 'tab' ? 'text-blue-600' : ''} />
                            <span className="hidden sm:inline">Tabs</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Display: Swipe Away Stack vs Cascade Stack vs Tab Mode */}
            {viewMode === 'stack' && stackStyle === 'swipe' ? (
                /* 1. SWIPE AWAY CARD DECK STACK: All cards stacked in one deck, swiping away as you scroll */
                <div
                    ref={trackRef}
                    className="stack-scroll-track relative w-full"
                    style={{ height: `${Math.max(items.length * 80, 240)}vh` }}
                >
                    <div
                        className="sticky top-[80px] md:top-[90px] h-[calc(100vh-100px)] max-h-[720px] w-full flex flex-col justify-start overflow-visible pt-1 pb-4"
                        style={{ perspective: '1400px' }}
                    >
                        {/* Cards Stack Stage */}
                        <div className="relative w-full flex-1 min-h-[480px] max-h-[620px]">
                            {items.map((item, index) => (
                                <div
                                    key={item.id}
                                    ref={(el) => { deckCardRefs.current[index] = el; }}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        zIndex: (items.length - index) * 10,
                                        transformOrigin: 'top center',
                                        willChange: 'transform, opacity, filter',
                                        transformStyle: 'preserve-3d',
                                        transition: 'box-shadow 0.3s ease'
                                    }}
                                    className="w-full h-full flex flex-col"
                                >
                                    <article
                                        className={`card-inner h-full w-full rounded-[2.2rem] p-6 sm:p-8 md:p-10 text-white shadow-[0_-15px_50px_rgba(0,0,0,0.6)] border ${
                                            item.borderColor || 'border-white/10'
                                        } bg-gradient-to-br ${item.themeGradient} relative overflow-hidden flex flex-col justify-between`}
                                    >
                                        {/* Top specular line */}
                                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                                        {/* Ambient radial illumination */}
                                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                                        <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-10 items-stretch h-full">
                                            {/* Left Content Side */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    {item.stageBadge && (
                                                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-black tracking-widest uppercase mb-3 shadow-sm">
                                                            {item.badgeIcon || <Sparkles size={12} className="text-amber-400" />}
                                                            <span>{item.stageBadge}</span>
                                                        </div>
                                                    )}

                                                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black tracking-tight mb-1 text-white">
                                                        {item.title}
                                                    </h3>

                                                    {item.tamilTitle && (
                                                        <p className="text-lg sm:text-xl font-serif text-amber-300 font-bold mb-2">
                                                            {item.tamilTitle}
                                                        </p>
                                                    )}

                                                    {item.subtitle && (
                                                        <p className="text-white/70 text-xs sm:text-sm font-medium mb-4 leading-relaxed">
                                                            {item.subtitle}
                                                        </p>
                                                    )}

                                                    <div className="mt-2">
                                                        {item.content}
                                                    </div>
                                                </div>

                                                {/* Bottom Card Index Indicator */}
                                                <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50 font-mono">
                                                    <span>CARD 0{index + 1} OF 0{items.length}</span>
                                                    <span className="flex items-center gap-1 text-white/70">
                                                        {index === items.length - 1 ? 'Final Destination Card' : 'Scroll down to swipe away'}
                                                        {index < items.length - 1 && <ChevronRight size={12} className="rotate-90 animate-bounce" />}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Right Visual Side (Optional) */}
                                            {item.visualSide && (
                                                <div className="w-full lg:w-[360px] xl:w-[400px] flex items-center justify-center shrink-0">
                                                    {item.visualSide}
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : viewMode === 'stack' && stackStyle === 'cascade' ? (
                /* 2. CASCADE STACK: Individual sticky cards stacking on top of each other */
                <div
                    className="stack-area relative pt-4 pb-36 max-w-6xl mx-auto"
                    style={{ perspective: '1200px' }}
                >
                    {items.map((item, index) => {
                        const stickyTopOffset = `calc(10vh + ${index * 24}px)`;

                        return (
                            <div
                                key={item.id}
                                id={`peeling-card-${item.id}`}
                                ref={(el) => { wrapperRefs.current[index] = el; }}
                                style={{ top: stickyTopOffset }}
                                className="card-wrapper sticky mb-24 md:mb-32"
                            >
                                <article
                                    ref={(el) => { innerRefs.current[index] = el; }}
                                    style={{
                                        transformOrigin: 'top center',
                                        willChange: 'transform, opacity, filter',
                                        transformStyle: 'preserve-3d'
                                    }}
                                    className={`card-inner min-h-[480px] md:min-h-[520px] rounded-[2.2rem] p-6 sm:p-8 md:p-10 text-white shadow-[0_-15px_50px_rgba(0,0,0,0.6)] transition-[box-shadow] duration-300 border ${
                                        item.borderColor || 'border-white/10'
                                    } bg-gradient-to-br ${item.themeGradient} relative overflow-hidden flex flex-col justify-between`}
                                >
                                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                                    <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-10 items-stretch">
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                {item.stageBadge && (
                                                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-black tracking-widest uppercase mb-3 shadow-sm">
                                                        {item.badgeIcon || <Sparkles size={12} className="text-amber-400" />}
                                                        <span>{item.stageBadge}</span>
                                                    </div>
                                                )}

                                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black tracking-tight mb-1 text-white">
                                                    {item.title}
                                                </h3>

                                                {item.tamilTitle && (
                                                    <p className="text-lg sm:text-xl font-serif text-amber-300 font-bold mb-2">
                                                        {item.tamilTitle}
                                                    </p>
                                                )}

                                                {item.subtitle && (
                                                    <p className="text-white/70 text-xs sm:text-sm font-medium mb-4 leading-relaxed">
                                                        {item.subtitle}
                                                    </p>
                                                )}

                                                <div className="mt-2">
                                                    {item.content}
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50 font-mono">
                                                <span>CARD 0{index + 1} OF 0{items.length}</span>
                                                <span className="flex items-center gap-1 text-white/70">
                                                    Scroll to stack
                                                    <ChevronRight size={12} className="rotate-90 animate-bounce" />
                                                </span>
                                            </div>
                                        </div>

                                        {item.visualSide && (
                                            <div className="w-full lg:w-[360px] xl:w-[400px] flex items-center justify-center shrink-0">
                                                {item.visualSide}
                                            </div>
                                        )}
                                    </div>
                                </article>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* 3. TAB MODE: Single card display */
                <AnimatePresence mode="wait">
                    {activeItem && (
                        <motion.article
                            key={activeItem.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                            className={`rounded-[2.2rem] p-6 sm:p-8 md:p-10 text-white shadow-2xl border ${
                                activeItem.borderColor || 'border-white/10'
                            } bg-gradient-to-br ${activeItem.themeGradient} relative overflow-hidden`}
                        >
                            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch">
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        {activeItem.stageBadge && (
                                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-black tracking-widest uppercase mb-4 shadow-sm">
                                                {activeItem.badgeIcon || <Sparkles size={12} className="text-amber-400" />}
                                                <span>{activeItem.stageBadge}</span>
                                            </div>
                                        )}

                                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black tracking-tight mb-1 text-white">
                                            {activeItem.title}
                                        </h3>

                                        {activeItem.tamilTitle && (
                                            <p className="text-lg sm:text-xl font-serif text-amber-300 font-bold mb-3">
                                                {activeItem.tamilTitle}
                                            </p>
                                        )}

                                        {activeItem.subtitle && (
                                            <p className="text-white/70 text-xs sm:text-sm font-medium mb-6 leading-relaxed">
                                                {activeItem.subtitle}
                                            </p>
                                        )}

                                        <div className="mt-4">
                                            {activeItem.content}
                                        </div>
                                    </div>
                                </div>

                                {activeItem.visualSide && (
                                    <div className="w-full lg:w-[380px] xl:w-[420px] flex items-center justify-center shrink-0">
                                        {activeItem.visualSide}
                                    </div>
                                )}
                            </div>
                        </motion.article>
                    )}
                </AnimatePresence>
            )}
        </section>
    );
};

export default PeelingStackCards;
