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

interface InertiaGalleryCardProps {
    item: MediaItem;
    index: number;
    failedMedia: Record<string, boolean>;
    setFailedMedia: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    onClick: () => void;
}

const InertiaGalleryCard: React.FC<InertiaGalleryCardProps> = ({
    item,
    index,
    failedMedia,
    setFailedMedia,
    onClick,
}) => {
    const [physics, setPhysics] = useState({
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        scale: 1,
    });
    const [isHovered, setIsHovered] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const lastPos = useRef({ x: 0, y: 0, time: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animFrameRef = useRef<number | null>(null);
    const posRef = useRef({ x: 0, y: 0, rotateX: 0, rotateY: 0, rotateZ: 0 });
    const hasDragged = useRef(false);

    useEffect(() => {
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsHovered(true);
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        lastPos.current = { x: e.clientX, y: e.clientY, time: performance.now() };
        velocity.current = { x: 0, y: 0 };
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const now = performance.now();
        const dt = Math.max(now - lastPos.current.time, 10);
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;

        // Instant cursor velocity normalized to 60fps
        velocity.current = {
            x: (dx / dt) * 16,
            y: (dy / dt) * 16,
        };
        lastPos.current = { x: e.clientX, y: e.clientY, time: now };

        const rect = cardRef.current.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
        const normY = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

        // Direct interactive mouse momentum & 3D tilt
        const targetX = normX * 22 + velocity.current.x * 0.7;
        const targetY = normY * 22 + velocity.current.y * 0.7;
        const targetRotY = normX * 14 + velocity.current.x * 0.35;
        const targetRotX = -normY * 14 - velocity.current.y * 0.35;
        const targetRotZ = Math.max(Math.min(velocity.current.x * 0.3, 5), -5);

        posRef.current = {
            x: targetX,
            y: targetY,
            rotateX: targetRotX,
            rotateY: targetRotY,
            rotateZ: targetRotZ,
        };

        setPhysics({
            x: targetX,
            y: targetY,
            rotateX: targetRotX,
            rotateY: targetRotY,
            rotateZ: targetRotZ,
            scale: 1.035,
        });
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        lastPos.current = { x: 0, y: 0, time: 0 };

        // Crav-Burgers inertia impulse physics
        let curPos = { ...posRef.current };
        let vel = {
            x: Math.max(Math.min(velocity.current.x * 1.8, 45), -45),
            y: Math.max(Math.min(velocity.current.y * 1.8, 45), -45),
            rotateX: Math.max(Math.min(-velocity.current.y * 0.35, 12), -12),
            rotateY: Math.max(Math.min(velocity.current.x * 0.35, 12), -12),
            rotateZ: Math.max(Math.min(velocity.current.x * 0.25, 7), -7),
        };

        const springK = 0.085; // Hooke's spring return factor
        const damping = 0.78;  // Momentum friction resistance

        const runInertiaPhysics = () => {
            vel.x = (vel.x + (0 - curPos.x) * springK) * damping;
            vel.y = (vel.y + (0 - curPos.y) * springK) * damping;
            vel.rotateX = (vel.rotateX + (0 - curPos.rotateX) * springK) * damping;
            vel.rotateY = (vel.rotateY + (0 - curPos.rotateY) * springK) * damping;
            vel.rotateZ = (vel.rotateZ + (0 - curPos.rotateZ) * springK) * damping;

            curPos.x += vel.x;
            curPos.y += vel.y;
            curPos.rotateX += vel.rotateX;
            curPos.rotateY += vel.rotateY;
            curPos.rotateZ += vel.rotateZ;

            posRef.current = { ...curPos };

            const speed = Math.abs(vel.x) + Math.abs(vel.y) + Math.abs(vel.rotateZ);
            const dist = Math.abs(curPos.x) + Math.abs(curPos.y) + Math.abs(curPos.rotateZ);

            if (speed > 0.02 || dist > 0.05) {
                setPhysics({
                    ...curPos,
                    scale: 1,
                });
                animFrameRef.current = requestAnimationFrame(runInertiaPhysics);
            } else {
                setPhysics({
                    x: 0,
                    y: 0,
                    rotateX: 0,
                    rotateY: 0,
                    rotateZ: 0,
                    scale: 1,
                });
                posRef.current = { x: 0, y: 0, rotateX: 0, rotateY: 0, rotateZ: 0 };
                animFrameRef.current = null;
            }
        };

        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = requestAnimationFrame(runInertiaPhysics);
    };

    const handleClick = () => {
        if (!hasDragged.current) {
            onClick();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (index % 5) * 0.1, duration: 0.5 }}
            className="relative select-none"
            style={{ perspective: 1200 }}
        >
            <motion.div
                ref={cardRef}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.22}
                dragTransition={{ bounceStiffness: 350, bounceDamping: 22, power: 0.25 }}
                onDragStart={() => { hasDragged.current = true; }}
                onDragEnd={() => { setTimeout(() => { hasDragged.current = false; }, 60); }}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                animate={{
                    x: physics.x,
                    y: physics.y,
                    rotateX: physics.rotateX,
                    rotateY: physics.rotateY,
                    rotateZ: physics.rotateZ,
                    scale: physics.scale,
                }}
                transition={{
                    type: isHovered ? "tween" : "spring",
                    duration: isHovered ? 0.06 : 0.45,
                    ease: "easeOut",
                    stiffness: 300,
                    damping: 20,
                }}
                style={{
                    transformStyle: "preserve-3d",
                }}
                className={`relative overflow-hidden rounded-2xl md:rounded-[2.5rem] shadow-sm transition-shadow duration-500 bg-white border border-slate-100/60 aspect-square w-full md:size-80 cursor-grab active:cursor-grabbing ${
                    isHovered
                        ? 'shadow-[0_25px_60px_rgba(0,0,0,0.32)] border-amber-400/80 ring-2 ring-amber-400/30'
                        : 'shadow-sm border-slate-100/50'
                }`}
            >
                {/* Media Item */}
                {item.type === 'image' && !failedMedia[item.id] ? (
                    <img
                        src={item.src}
                        alt="Ministry Moment"
                        className={`w-full h-full object-cover transition-transform duration-700 ease-out pointer-events-none ${
                            isHovered ? 'scale-110' : 'scale-100'
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
                    <div className="w-full h-full flex flex-col items-center justify-center text-center bg-slate-100 text-slate-500 px-4 pointer-events-none">
                        <ImageIcon size={24} className="mb-2" />
                        <p className="text-xs font-bold uppercase tracking-wide">Media unavailable</p>
                        <p className="text-[10px] mt-1">{item.date || 'Ministry Moment'}</p>
                    </div>
                )}

                {/* Refined Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/20 to-transparent transition-opacity duration-500 pointer-events-none ${
                    isHovered ? 'opacity-90' : 'opacity-60'
                }`} />

                {/* Zoom / Play hint on hover */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none ${
                    isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}>
                    <div className="w-14 h-14 bg-amber-400/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-950 shadow-xl border border-white/50">
                        {item.type === 'video'
                            ? <Play size={22} className="ml-1 fill-current" />
                            : <ZoomIn size={22} />
                        }
                    </div>
                </div>

                {/* Content Overlays */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/15 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 shadow-md pointer-events-none">
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
                        <div className="w-4 h-[1px] bg-accent-400" />
                        <span className="text-[8px] md:text-[10px] font-black tracking-[0.2em] uppercase">{item.type}</span>
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
                        <InertiaGalleryCard
                            key={item.id}
                            item={item}
                            index={index}
                            failedMedia={failedMedia}
                            setFailedMedia={setFailedMedia}
                            onClick={() => openLightbox(index)}
                        />
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
