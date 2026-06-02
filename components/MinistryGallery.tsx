import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Image as ImageIcon, Clock, Tag, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface MediaItem {
    type: 'image' | 'video';
    src: string;
    date?: string;
    duration?: string;
    category?: string;
    id: string;
}

interface MinistryGalleryProps {
    items: MediaItem[];
}

export const MinistryGallery: React.FC<MinistryGalleryProps> = ({ items = [] }) => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [failedMedia, setFailedMedia] = useState<Record<string, boolean>>({});
    const [lightboxIndex, setLightboxIndex] = useState<number>(0);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -350 : 350;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const openLightbox = useCallback((index: number) => {
        setLightboxIndex(index);
        setIsOpen(true);
    }, []);
    const closeLightbox = useCallback(() => setIsOpen(false), []);
    const prevItem = useCallback(() => setLightboxIndex(i => (i > 0 ? i - 1 : i)), []);
    const nextItem = useCallback(() => setLightboxIndex(i => (i < items.length - 1 ? i + 1 : i)), [items.length]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevItem();
            if (e.key === 'ArrowRight') nextItem();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, closeLightbox, prevItem, nextItem]);

    // Hide navigation menu when lightbox is open
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('lightbox-open');
        } else {
            document.body.classList.remove('lightbox-open');
        }
        return () => {
            document.body.classList.remove('lightbox-open');
        };
    }, [isOpen]);

    const activeLightboxItem = (lightboxIndex >= 0 && lightboxIndex < items.length) ? items[lightboxIndex] : null;

    return (
        <>
            <div className="relative w-full py-8 group">
                {/* Scroll Container */}
                <div
                    ref={scrollRef}
                    className="grid grid-cols-2 gap-3 md:flex md:overflow-x-auto md:gap-6 px-4 md:px-6 pb-8 md:pb-12 pt-4 no-scrollbar"
                    style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: (index % 5) * 0.1, duration: 0.5 }}
                            className="relative cursor-pointer"
                            onMouseEnter={() => setHoveredId(item.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={() => openLightbox(index)}
                        >
                            <div className={`relative overflow-hidden rounded-2xl md:rounded-[2.5rem] shadow-sm transition-all duration-700 bg-white border border-slate-100/50 ${
                                hoveredId === item.id ? 'scale-[1.02] shadow-2xl ring-1 ring-accent-400/30' : 'scale-100'
                            } aspect-square w-full md:size-80`}>

                                {item.type === 'image' && !failedMedia[item.id] ? (
                                    <img
                                        src={item.src}
                                        alt="Ministry Moment"
                                        className={`w-full h-full object-cover transition-all duration-1000 ${
                                            hoveredId === item.id ? 'scale-110' : 'scale-100'
                                        }`}
                                        loading="lazy"
                                        onError={() => setFailedMedia(prev => ({ ...prev, [item.id]: true }))}
                                    />
                                ) : item.type === 'video' && !failedMedia[item.id] ? (
                                    <video
                                        src={item.src}
                                        className="w-full h-full object-cover pointer-events-none"
                                        controls={false}
                                        muted
                                        loop
                                        autoPlay
                                        playsInline
                                        onError={() => setFailedMedia(prev => ({ ...prev, [item.id]: true }))}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-center bg-slate-100 text-slate-500 px-4">
                                        <ImageIcon size={24} className="mb-2" />
                                        <p className="text-xs font-bold uppercase tracking-wide">Media unavailable</p>
                                        <p className="text-[10px] mt-1">{item.date || 'Ministry Moment'}</p>
                                    </div>
                                )}

                                {/* Refined Overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/20 to-transparent transition-opacity duration-500 ${
                                    hoveredId === item.id ? 'opacity-90' : 'opacity-60'
                                }`} />

                                {/* Zoom / Play hint on hover */}
                                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                                    hoveredId === item.id ? 'opacity-100' : 'opacity-0'
                                }`}>
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-xl">
                                        {item.type === 'video'
                                            ? <Play size={22} className="text-white ml-1" fill="white" />
                                            : <ZoomIn size={22} className="text-white" />
                                        }
                                    </div>
                                </div>

                                {/* Content Overlays */}
                                <div className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20">
                                    {item.type === 'video' ? <Play size={16} fill="currentColor" /> : <ImageIcon size={16} />}
                                </div>
                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    {item.category && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-white/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                            <Tag size={12} /> {item.category}
                                        </span>
                                    )}
                                    {item.type === 'video' && item.duration && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-950/70 border border-white/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                            <Clock size={12} /> {item.duration}
                                        </span>
                                    )}
                                </div>

                                <div className={`absolute bottom-0 left-0 right-0 p-3 md:p-6 transition-all duration-500 ${
                                    hoveredId === item.id ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-90'
                                }`}>
                                    <div className="flex items-center gap-2 text-accent-400 mb-1 md:mb-2">
                                        <div className="w-4 h-[1px] bg-accent-400" />
                                        <span className="text-[8px] md:text-[10px] font-black tracking-[0.2em] uppercase">{item.type}</span>
                                    </div>
                                    <div className="text-sm md:text-lg font-serif font-bold text-white mb-1 md:mb-2 leading-tight">
                                        {item.date || 'Ministry Moment'}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Left Scroll Arrow */}
                <button
                    onClick={(e) => { e.stopPropagation(); scroll('left'); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/90 hover:bg-white backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/80 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
                    title="Scroll Left"
                    aria-label="Scroll gallery left"
                >
                    <ChevronLeft size={24} strokeWidth={2.5} className="text-[#C5A880]" />
                </button>

                {/* Right Scroll Arrow */}
                <button
                    onClick={(e) => { e.stopPropagation(); scroll('right'); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/90 hover:bg-white backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/80 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
                    title="Scroll Right"
                    aria-label="Scroll gallery right"
                >
                    <ChevronRight size={24} strokeWidth={2.5} className="text-[#C5A880]" />
                </button>

                {/* Subtle Gradient Fades */}
                <div className="absolute top-0 bottom-12 right-0 w-24 bg-gradient-to-l from-[#fdfcf0] to-transparent pointer-events-none z-10 hidden md:block" />
                <div className="absolute top-0 bottom-12 left-0 w-24 bg-gradient-to-r from-[#fdfcf0] to-transparent pointer-events-none z-10 hidden md:block" />
            </div>

            {/* ─── Lightbox Modal ─── */}
            <AnimatePresence>
                {isOpen && activeLightboxItem && (
                    <motion.div
                        key="lightbox-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/92 backdrop-blur-lg p-4"
                        onClick={closeLightbox}
                    >
                        {/* Close */}
                        <button
                            onClick={closeLightbox}
                            className="absolute top-5 right-5 z-10 w-11 h-11 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/25 transition-all backdrop-blur-sm shadow-lg"
                        >
                            <X size={20} />
                        </button>

                        {/* Counter */}
                        <div className="absolute top-5 left-5 z-10 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-[11px] font-black tracking-widest">
                            {lightboxIndex + 1} / {items.length}
                        </div>

                        {/* Prev */}
                        {lightboxIndex > 0 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); prevItem(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/30 border border-white/40 rounded-full flex items-center justify-center text-white hover:bg-white/50 transition-all backdrop-blur-sm shadow-lg"
                            >
                                <ChevronLeft size={26} />
                            </button>
                        )}

                        {/* Next */}
                        {lightboxIndex < items.length - 1 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); nextItem(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/30 border border-white/40 rounded-full flex items-center justify-center text-white hover:bg-white/50 transition-all backdrop-blur-sm shadow-lg"
                            >
                                <ChevronRight size={26} />
                            </button>
                        )}

                        {/* Media */}
                        <motion.div
                            key={lightboxIndex}
                            initial={{ scale: 0.88, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.88, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                            className="relative max-w-5xl w-full flex flex-col items-center gap-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {activeLightboxItem ? (
                                <>
                                    {activeLightboxItem.type === 'video' ? (
                                        <video
                                            src={activeLightboxItem.src}
                                            controls
                                            autoPlay
                                            playsInline
                                            className="w-full max-h-[78vh] rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] object-contain bg-black"
                                        />
                                    ) : (
                                        <img
                                            src={activeLightboxItem.src}
                                            alt="Ministry Moment"
                                            className="max-w-full max-h-[78vh] rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] object-contain"
                                        />
                                    )}

                                    {/* Caption bar */}
                                    <div className="flex items-center gap-3 flex-wrap justify-center">
                                        {activeLightboxItem.category && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                                                <Tag size={10} /> {activeLightboxItem.category}
                                            </span>
                                        )}
                                        {activeLightboxItem.type === 'video' && activeLightboxItem.duration && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                                                <Clock size={10} /> {activeLightboxItem.duration}
                                            </span>
                                        )}
                                        {activeLightboxItem.date && (
                                            <span className="text-white/60 text-sm font-medium">
                                                {activeLightboxItem.date}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-white/30 text-[11px] font-bold tracking-widest uppercase">
                                        Press Esc to close · ← → to navigate
                                    </p>
                                </>
                            ) : null}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
