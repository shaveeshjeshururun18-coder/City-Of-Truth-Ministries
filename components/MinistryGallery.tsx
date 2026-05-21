import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, Play, Image as ImageIcon } from 'lucide-react';

interface MediaItem {
    type: 'image' | 'video';
    src: string;
    date?: string;
    id: string;
}

interface MinistryGalleryProps {
    items: MediaItem[];
}

export const MinistryGallery: React.FC<MinistryGalleryProps> = ({ items }) => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [failedMedia, setFailedMedia] = useState<Record<string, boolean>>({});

    return (
        <div className="relative w-full py-8 group">
            {/* Scroll Container */}
            <div
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

            {/* Subtle Gradient Fades for Scroll Indication */}
            <div className="absolute top-0 bottom-12 right-0 w-24 bg-gradient-to-l from-[#fdfcf0] to-transparent pointer-events-none z-10 hidden md:block" />
            <div className="absolute top-0 bottom-12 left-0 w-24 bg-gradient-to-r from-[#fdfcf0] to-transparent pointer-events-none z-10 hidden md:block" />
        </div>
    );
};
