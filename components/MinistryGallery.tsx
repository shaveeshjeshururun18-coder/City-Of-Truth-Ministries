import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Image as ImageIcon, Clock, Tag, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { extractYouTubeId, getSafeEmbedUrl, getYouTubeThumbnails } from '../services/youtubeService';

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

interface GalleryCardProps {
    item: MediaItem;
    index: number;
    frameStyle: 'vintage' | 'polaroid';
    failedMedia: Record<string, boolean>;
    setFailedMedia: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    onClick: () => void;
}

const GalleryCard: React.FC<GalleryCardProps> = ({
    item,
    index,
    frameStyle,
    failedMedia,
    setFailedMedia,
    onClick,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const tiltPattern = [-2.5, 2.0, -1.8, 2.4, -2.0, 1.5];
    const rotation = tiltPattern[index % tiltPattern.length];
    const staggerClass = index % 4 === 1
        ? 'md:translate-y-6'
        : index % 4 === 3
            ? 'md:-translate-y-4'
            : '';

    const ytId = item.type === 'video' ? extractYouTubeId(item.src) : null;
    const ytThumbs = ytId ? getYouTubeThumbnails(ytId) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24, rotate: rotation * 0.6 }}
            whileInView={{ opacity: 1, y: 0, rotate: rotation }}
            viewport={{ once: true }}
            transition={{ delay: (index % 5) * 0.08, duration: 0.5 }}
            whileHover={{ y: -10, rotate: 0, scale: 1.035 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={`relative select-none ${staggerClass}`}
            style={{ perspective: 1200 }}
        >
            <motion.div
                onClick={onClick}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onClick();
                    }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Open ${item.category || 'ministry'} ${item.type}`}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="group relative w-full cursor-pointer"
            >
                {/* 1. Vintage Heirloom Frame */}
                {frameStyle === 'vintage' ? (
                    <div className="photo-frame-vintage">
                        <div className="bracket tl" />
                        <div className="bracket tr" />
                        <div className="bracket bl" />
                        <div className="bracket br" />

                        <div className="deckle-wrapper">
                            <div className="photo-inner">
                                {item.type === 'image' && !failedMedia[item.id] ? (
                                    <img
                                        src={item.src}
                                        alt={item.category || 'Ministry Moment'}
                                        className="vintage-img"
                                        loading="lazy"
                                        decoding="async"
                                        onError={() => setFailedMedia(prev => ({ ...prev, [item.id]: true }))}
                                    />
                                ) : item.type === 'video' && ytThumbs && !failedMedia[item.id] ? (
                                    <img
                                        src={ytThumbs.high}
                                        alt={item.category || 'Sermon Video'}
                                        className="vintage-img"
                                        loading="lazy"
                                        decoding="async"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = ytThumbs.medium;
                                        }}
                                    />
                                ) : item.type === 'video' && !failedMedia[item.id] ? (
                                    <video
                                        src={item.src}
                                        className="vintage-img"
                                        controls={false}
                                        muted
                                        loop
                                        playsInline
                                        preload="metadata"
                                        onError={() => setFailedMedia(prev => ({ ...prev, [item.id]: true }))}
                                    />
                                ) : (
                                    <div className="w-full aspect-[4/5] flex flex-col items-center justify-center text-center bg-[#251d16] text-[#dfc8a8] px-4 pointer-events-none">
                                        <ImageIcon size={24} className="mb-2" />
                                        <p className="text-xs font-bold uppercase tracking-wide">Archived Moment</p>
                                    </div>
                                )}
                                <div className="scratches-overlay" />
                            </div>
                        </div>

                        {/* Faded Ink Stamp */}
                        <div className="ink-stamp">
                            <div>Archived</div>
                            <div>★ COT ★</div>
                            <div>Original</div>
                        </div>

                        {/* Vintage Typewriter Caption */}
                        <div className="caption truncate px-1" title={item.date || 'Ministry Moment'}>
                            {item.date || 'Ministry Moment'}
                        </div>
                    </div>
                ) : (
                    /* 2. Polaroid SX-70 Instant Film Frame */
                    <div className="photo-frame-polaroid">
                        <div className="scotch-tape" />
                        <div className="frame-grain" />

                        <div className="photo-inner">
                            {item.type === 'image' && !failedMedia[item.id] ? (
                                <img
                                    src={item.src}
                                    alt={item.category || 'Ministry Moment'}
                                    className="polaroid-img"
                                    loading="lazy"
                                    decoding="async"
                                    onError={() => setFailedMedia(prev => ({ ...prev, [item.id]: true }))}
                                />
                            ) : item.type === 'video' && ytThumbs && !failedMedia[item.id] ? (
                                <img
                                    src={ytThumbs.high}
                                    alt={item.category || 'Sermon Video'}
                                    className="polaroid-img"
                                    loading="lazy"
                                    decoding="async"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = ytThumbs.medium;
                                    }}
                                />
                            ) : item.type === 'video' && !failedMedia[item.id] ? (
                                <video
                                    src={item.src}
                                    className="polaroid-img"
                                    controls={false}
                                    muted
                                    loop
                                    playsInline
                                    preload="metadata"
                                    onError={() => setFailedMedia(prev => ({ ...prev, [item.id]: true }))}
                                />
                            ) : (
                                <div className="w-full aspect-[4/5] flex flex-col items-center justify-center text-center bg-[#1c1815] text-[#ded6ce] px-4 pointer-events-none">
                                    <ImageIcon size={24} className="mb-2" />
                                    <p className="text-xs font-bold uppercase tracking-wide">Instant Memoir</p>
                                </div>
                            )}
                            <div className="emulsion-glare" />
                        </div>

                        {/* Handwritten Script Caption */}
                        <div className="caption truncate px-1" title={item.date || 'A sacred moment ♥'}>
                            {item.date || 'A sacred moment ♥'}
                        </div>
                    </div>
                )}

                {/* Refined Hover Badges & Zoom Hint */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none z-20 ${
                    isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}>
                    <div className="w-12 h-12 bg-amber-400/90 backdrop-blur-md rounded-full flex items-center justify-center text-black shadow-xl border border-white/60">
                        {item.type === 'video'
                            ? <Play size={20} className="ml-1 fill-current" />
                            : <ZoomIn size={20} />
                        }
                    </div>
                </div>

                {/* Top Corner Type Badges */}
                <div className="absolute top-2 right-2 z-20 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 shadow pointer-events-none">
                    {item.type === 'video' ? <Play size={13} fill="currentColor" /> : <ImageIcon size={13} />}
                </div>
                {item.category && (
                    <div className="absolute top-2 left-2 z-20 pointer-events-none">
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-200 shadow">
                            <Tag size={10} /> {item.category}
                        </span>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export const MinistryGallery: React.FC<MinistryGalleryProps> = ({ items = [] }) => {
    const [failedMedia, setFailedMedia] = useState<Record<string, boolean>>({});
    const [frameFilter, setFrameFilter] = useState<'all' | 'vintage' | 'polaroid'>('all');
    const [lightboxIndex, setLightboxIndex] = useState<number>(0);
    const [isOpen, setIsOpen] = useState<boolean>(false);
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
            <div className="relative w-full py-6 md:py-10">
                {/* Frame Style Filter Pills */}
                <div className="flex items-center justify-end gap-2 px-4 sm:px-6 md:px-10 mb-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mr-1 hidden sm:inline-block">Frame:</span>
                    <div className="inline-flex bg-black/40 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                        <button
                            onClick={() => setFrameFilter('all')}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                frameFilter === 'all'
                                    ? 'bg-amber-400 text-black shadow-md'
                                    : 'text-slate-300 hover:text-white'
                            }`}
                        >
                            Dual Mix
                        </button>
                        <button
                            onClick={() => setFrameFilter('vintage')}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                frameFilter === 'vintage'
                                    ? 'bg-amber-400 text-black shadow-md'
                                    : 'text-slate-300 hover:text-white'
                            }`}
                        >
                            🕰️ Vintage
                        </button>
                        <button
                            onClick={() => setFrameFilter('polaroid')}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                frameFilter === 'polaroid'
                                    ? 'bg-amber-400 text-black shadow-md'
                                    : 'text-slate-300 hover:text-white'
                            }`}
                        >
                            📸 Polaroid
                        </button>
                    </div>
                </div>

                <div className="pointer-events-none absolute inset-x-8 top-2 h-px bg-gradient-to-r from-transparent via-brand-200/70 to-transparent" />
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-12 sm:gap-x-7 sm:gap-y-16 px-4 sm:px-6 md:px-10 pb-4 pt-5"
                >
                    {items.map((item, index) => {
                        const style: 'vintage' | 'polaroid' = frameFilter === 'all'
                            ? (index % 2 === 0 ? 'vintage' : 'polaroid')
                            : frameFilter;

                        return (
                            <GalleryCard
                                key={item.id}
                                item={item}
                                index={index}
                                frameStyle={style}
                                failedMedia={failedMedia}
                                setFailedMedia={setFailedMedia}
                                onClick={() => openLightbox(index)}
                            />
                        );
                    })}
                </div>
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
                                        extractYouTubeId(activeLightboxItem.src) ? (
                                            <div className="w-full aspect-video max-h-[78vh] rounded-2xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.7)] bg-black">
                                                <iframe
                                                    src={getSafeEmbedUrl(activeLightboxItem.src, { autoplay: true }) || ''}
                                                    title="Ministry Sermon Video"
                                                    className="w-full h-full border-0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    allowFullScreen
                                                />
                                            </div>
                                        ) : (
                                            <video
                                                src={activeLightboxItem.src}
                                                controls
                                                autoPlay
                                                playsInline
                                                className="w-full max-h-[78vh] rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] object-contain bg-black"
                                            />
                                        )
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
