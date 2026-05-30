import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play, Image as ImageIcon, Clock, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

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

export const MinistryGallery: React.FC<MinistryGalleryProps> = ({ items }) => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [failedMedia, setFailedMedia] = useState<Record<string, boolean>>({});
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -350 : 350;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
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
                        className="relative"
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                    >
                        <div className={`relative overflow-hidden rounded-2xl md:rounded-[2.5rem] shadow-sm transition-all duration-700 bg-white border border-slate-100/50 ${hoveredId === item.id ? 'scale-[1.02] shadow-2xl ring-1 ring-accent-400/30' : 'scale-100'
                            } aspect-square w-full md:size-80`}>

                            {item.type === 'image' && !failedMedia[item.id] ? (
                                <img
                                    src={item.src}
                                    alt="Ministry Moment"
                                    className={`w-full h-full object-cover transition-all duration-1000 ${hoveredId === item.id ? 'scale-110' : 'scale-100'
                                        }`}
                                    loading="lazy"
                                    onError={() => setFailedMedia(prev => ({ ...prev, [item.id]: true }))}
                                />
                            ) : item.type === 'video' && !failedMedia[item.id] ? (
                                <video
                                    src={item.src}
                                    className="w-full h-full object-cover"
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
                            <div className={`absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/20 to-transparent transition-opacity duration-500 ${hoveredId === item.id ? 'opacity-90' : 'opacity-60'
                                }`} />

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

                            <div className={`absolute bottom-0 left-0 right-0 p-3 md:p-6 transition-all duration-500 ${hoveredId === item.id ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-90'
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
                onClick={() => scroll('left')}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/90 hover:bg-white backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/80 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
                title="Scroll Left"
                aria-label="Scroll gallery left"
            >
                <ChevronLeft size={24} strokeWidth={2.5} className="text-[#C5A880]" />
            </button>

            {/* Right Scroll Arrow */}
            <button
                onClick={() => scroll('right')}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/90 hover:bg-white backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/80 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
                title="Scroll Right"
                aria-label="Scroll gallery right"
            >
                <ChevronRight size={24} strokeWidth={2.5} className="text-[#C5A880]" />
            </button>

            {/* Subtle Gradient Fades for Scroll Indication */}
            <div className="absolute top-0 bottom-12 right-0 w-24 bg-gradient-to-l from-[#fdfcf0] to-transparent pointer-events-none z-10 hidden md:block" />
            <div className="absolute top-0 bottom-12 left-0 w-24 bg-gradient-to-r from-[#fdfcf0] to-transparent pointer-events-none z-10 hidden md:block" />
        </div>
    );
};
