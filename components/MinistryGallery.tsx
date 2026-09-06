import React, { useState, useEffect, useCallback } from 'react';
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

interface GalleryCardProps {
    item: MediaItem;
    index: number;
    failedMedia: Record<string, boolean>;
    setFailedMedia: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    onClick: () => void;
}

const GalleryCard: React.FC<GalleryCardProps> = ({
    item,
    index,
    failedMedia,
    setFailedMedia,
    onClick,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const tiltPattern = [-3.4, 2.6, -1.8, 3.2, -2.4, 1.5];
    const rotation = tiltPattern[index % tiltPattern.length];
    const staggerClass = index % 4 === 1
        ? 'md:translate-y-8'
        : index % 4 === 3
            ? 'md:-translate-y-6'
            : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 24, rotate: rotation * 0.65 }}
            whileInView={{ opacity: 1, y: 0, rotate: rotation }}
            viewport={{ once: true }}
            transition={{ delay: (index % 5) * 0.1, duration: 0.5 }}
            whileHover={{ y: -12, rotate: 0, scale: 1.035 }}
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
                style={{
                    transformStyle: 'preserve-3d',
                }}
                className={`group relative overflow-hidden rounded-[1.35rem] md:rounded-[2.25rem] bg-white border border-white/70 aspect-[4/5] w-full cursor-pointer shadow-[0_16px_35px_rgba(6,28,52,0.14)] transition-shadow duration-500 ${
                    isHovered
                        ? 'shadow-[0_28px_70px_rgba(6,28,52,0.32)] border-accent-300 ring-2 ring-accent-300/30'
                        : 'shadow-[0_16px_35px_rgba(6,28,52,0.14)]'
                }`}
            >
                {/* Media Item */}
                {item.type === 'image' && !failedMedia[item.id] ? (
                    <img
                        src={item.src}
                        alt="Ministry Moment"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out pointer-events-none group-hover:scale-110"
                        loading="lazy"
                        decoding="async"
                        onError={() => setFailedMedia(prev => ({ ...prev, [item.id]: true }))}
                    />
                ) : item.type === 'video' && !failedMedia[item.id] ? (
                    <video
                        src={item.src}
                        className="w-full h-full object-cover pointer-events-none"
                        controls={false}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        onError={() => setFailedMedia(prev => ({ ...prev, [item.id]: true }))}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center bg-slate-100 text-slate-500 px-4 pointer-events-none">
                        <ImageIcon size={24} className="mb-2" />
                        <p className="text-xs font-bold uppercase tracking-wide">Media unavailable</p>
                        <p className="text-[10px] mt-1">{item.date || 'Ministry Moment'}</p>
                    </div>
                )}

                {/* Refined Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-brand-950/95 via-brand-950/15 to-transparent transition-opacity duration-500 pointer-events-none ${
                    isHovered ? 'opacity-95' : 'opacity-75'
                }`} />

                {/* Zoom / Play hint on hover */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none ${
                    isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}>
                    <div className="w-14 h-14 bg-accent-300/95 backdrop-blur-md rounded-full flex items-center justify-center text-brand-950 shadow-xl border border-white/60">
                        {item.type === 'video'
                            ? <Play size={22} className="ml-1 fill-current" />
                            : <ZoomIn size={22} />
                        }
                    </div>
                </div>

                {/* Content Overlays */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-brand-950/35 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/25 shadow-md pointer-events-none">
                    {item.type === 'video' ? <Play size={16} fill="currentColor" /> : <ImageIcon size={16} />}
                </div>
                <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                    {item.category && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow">
                            <Tag size={12} /> {item.category}
                        </span>
                    )}
                    {item.type === 'video' && item.duration && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-950/80 backdrop-blur-md border border-white/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow">
                            <Clock size={12} /> {item.duration}
                        </span>
                    )}
                </div>

                <div className={`absolute bottom-0 left-0 right-0 p-3 md:p-6 transition-all duration-500 pointer-events-none ${
                    isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-90'
                }`}>
                    <div className="flex items-center gap-2 text-accent-400 mb-1 md:mb-2">
                        <div className="w-5 h-[2px] bg-accent-300" />
                        <span className="text-[8px] md:text-[10px] font-black tracking-[0.2em] uppercase">{item.type} archive</span>
                    </div>
                    <div className="text-sm md:text-lg font-serif font-bold text-white mb-1 md:mb-2 leading-tight">
                        {item.date || 'Ministry Moment'}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export const MinistryGallery: React.FC<MinistryGalleryProps> = ({ items = [] }) => {
    const [failedMedia, setFailedMedia] = useState<Record<string, boolean>>({});
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
            <div className="relative w-full py-8 md:py-12">
                <div className="pointer-events-none absolute inset-x-8 top-2 h-px bg-gradient-to-r from-transparent via-brand-200/70 to-transparent" />
                <div
                    className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-12 md:grid-cols-3 md:gap-x-7 md:gap-y-16 xl:grid-cols-4 px-4 sm:px-6 md:px-10 pb-4 pt-5"
                >
                    {items.map((item, index) => (
                        <GalleryCard
                            key={item.id}
                            item={item}
                            index={index}
                            failedMedia={failedMedia}
                            setFailedMedia={setFailedMedia}
                            onClick={() => openLightbox(index)}
                        />
                    ))}
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
