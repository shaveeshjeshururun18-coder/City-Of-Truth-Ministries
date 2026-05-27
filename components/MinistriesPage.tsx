import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Globe, Heart, Music, Droplets } from 'lucide-react';
import { MinistryGallery } from './MinistryGallery';
import { api } from '../services/api';
import { Ministry } from '../types';

// Generate simulated data based on filenames
const generateAssets = () => {
    const assets: { type: 'image' | 'video', src: string, date: string, id: string }[] = [];
    for (let i = 0; i < 40; i++) {
        const num = i.toString().padStart(4, '0');
        assets.push({
            id: `img-${i}`,
            type: 'image',
            src: `/ministry/IMG-20231230-WA${num}.jpg`,
            date: 'December 30, 2023'
        });
    }
    const videos = [
        'VID-20231226-WA0002.mp4',
        'VID-20231226-WA0005.mp4',
        'VID-20231230-WA0104.mp4',
        'VID-20231230-WA0105.mp4',
        'VID-20231230-WA0107.mp4',
        'VID-20231230-WA0112.mp4',
        'VID-20231230-WA0122.mp4'
    ];
    videos.forEach((vid, i) => {
        const dateStr = vid.split('-')[1];
        const y = dateStr.substring(0, 4);
        const m = dateStr.substring(4, 6);
        const d = dateStr.substring(6, 8);
        const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        assets.push({ id: `vid-${i}`, type: 'video', src: `/ministry/${vid}`, date: formattedDate });
    });
    return assets.sort(() => Math.random() - 0.5);
};

export const MinistriesPage: React.FC = () => {
    const [dynamicMinistries, setDynamicMinistries] = useState<Ministry[]>([]);
    const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'image' | 'video'>('all');
    const [mediaDateFilter, setMediaDateFilter] = useState<'all' | string>('all');
    const assets = useMemo(() => generateAssets(), []);
    const visibleDynamicMinistries = useMemo(
        () => dynamicMinistries.filter((m) => !m.hidden),
        [dynamicMinistries]
    );
    const inferMediaType = (item: Ministry): 'image' | 'video' => {
        if (item.mediaType === 'video' || item.mediaType === 'image') return item.mediaType;
        const src = `${item.image || ''}`.trim().toLowerCase();
        if (src.startsWith('data:video/')) return 'video';
        if (/\.(mp4|mov|webm|ogg|m4v)(\?.*)?$/.test(src)) return 'video';
        return 'image';
    };
    const formatDisplayDate = (value?: string) => {
        if (!value) return 'Recent Moment';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return value;
        return parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };
    const dynamicMediaDateOptions = useMemo(() => {
        const uniqueDates = Array.from(
            new Set(
                visibleDynamicMinistries
                    .map((m) => (m.date || '').trim())
                    .filter(Boolean)
            )
        );
        return uniqueDates.sort((a, b) => {
            const aTime = new Date(a).getTime();
            const bTime = new Date(b).getTime();
            const safeATime = Number.isNaN(aTime) ? 0 : aTime;
            const safeBTime = Number.isNaN(bTime) ? 0 : bTime;
            return safeBTime - safeATime;
        });
    }, [visibleDynamicMinistries]);
    const filteredDynamicMinistries = useMemo(() => {
        return visibleDynamicMinistries
            .filter((m) => mediaTypeFilter === 'all' || inferMediaType(m) === mediaTypeFilter)
            .filter((m) => mediaDateFilter === 'all' || (m.date || '') === mediaDateFilter)
            .sort((a, b) => {
                const aTime = new Date(a.date || '').getTime();
                const bTime = new Date(b.date || '').getTime();
                const safeATime = Number.isNaN(aTime) ? 0 : aTime;
                const safeBTime = Number.isNaN(bTime) ? 0 : bTime;
                return safeBTime - safeATime;
            });
    }, [visibleDynamicMinistries, mediaTypeFilter, mediaDateFilter]);
    const filteredDynamicMediaItems = useMemo(
        () => filteredDynamicMinistries.map((m) => ({
            id: m.id,
            type: inferMediaType(m),
            src: m.image,
            date: formatDisplayDate(m.date)
        })),
        [filteredDynamicMinistries]
    );

    useEffect(() => {
        api.getMinistries().then(setDynamicMinistries);
    }, []);

    return (
        <div className="min-h-screen bg-[#fdfcf0] font-sans selection:bg-brand-200 selection:text-brand-950 overflow-x-hidden">

            {/* Header Section */}
            <div className="relative pt-32 pb-12 px-6 container mx-auto text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 bg-brand-950 text-brand-100 px-6 py-2 rounded-full text-xs font-bold tracking-[0.2em] uppercase mb-8 shadow-xl"
                >
                    <Star size={14} className="text-accent-500" fill="currentColor" />
                    Ministry Hub
                </motion.div>

                <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-serif font-black text-brand-950 mb-8 tracking-tighter leading-[1] md:leading-[0.9]">
                    Our <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-accent-400 italic font-light pr-4">Service</span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed mb-12">
                    Discover the diverse ways we serve our community and share the light of Truth.
                </p>
            </div>

            {/* Dynamic Ministries Section */}
            {visibleDynamicMinistries.length > 0 && (
                <div className="container mx-auto px-6 mb-32">
                    <div className="flex items-center gap-4 mb-16">
                        <div className="w-12 h-px bg-brand-950/20" />
                        <span className="text-xs font-bold text-brand-950 uppercase tracking-widest font-sans">All Ministry Media</span>
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-100 p-4 md:p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6">
                            <select
                                value={mediaTypeFilter}
                                onChange={(e) => setMediaTypeFilter(e.target.value as 'all' | 'image' | 'video')}
                                className="px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 bg-slate-50"
                            >
                                <option value="all">All Media</option>
                                <option value="image">Photos</option>
                                <option value="video">Videos</option>
                            </select>
                            <select
                                value={mediaDateFilter}
                                onChange={(e) => setMediaDateFilter(e.target.value)}
                                className="px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 bg-slate-50"
                            >
                                <option value="all">All Dates</option>
                                {dynamicMediaDateOptions.map((dateValue) => (
                                    <option key={dateValue} value={dateValue}>
                                        {formatDisplayDate(dateValue)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {filteredDynamicMediaItems.length > 0 ? (
                            <MinistryGallery items={filteredDynamicMediaItems} />
                        ) : (
                            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <Sparkles className="mx-auto mb-3 text-slate-300" />
                                <p className="text-slate-500 font-medium">No media found for this filter.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Specialized Ministry Sections */}
            <div className="space-y-0 pb-20">
                {/* Spiritual Gatherings */}
                <section className="bg-white py-24 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -skew-x-12 translate-x-20 pointer-events-none" />
                    <div className="relative z-10 pl-4 md:pl-12">
                        <div className="container mx-auto px-6 mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                                    <Sparkles size={20} />
                                </div>
                                <span className="text-[10px] font-black text-brand-950/40 uppercase tracking-[0.3em]">Foundation</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-serif font-black text-brand-950">Spiritual Gatherings</h2>
                            <p className="text-slate-500 mt-4 max-w-xl font-light">Deepening our connection with the Divine through prayer and fellowship.</p>
                        </div>
                        <MinistryGallery items={assets.filter((_, i) => i % 6 === 0)} />
                    </div>
                </section>

                {/* Youth Ministry */}
                <section className="bg-slate-50 py-24 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1/4 h-full bg-white/50 skew-x-12 -translate-x-20 pointer-events-none" />
                    <div className="relative z-10 pl-4 md:pl-12">
                        <div className="container mx-auto px-6 mb-12 text-right lg:text-left">
                            <div className="flex items-center lg:justify-start justify-end gap-3 mb-4">
                                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm">
                                    <Star size={20} />
                                </div>
                                <span className="text-[10px] font-black text-brand-950/40 uppercase tracking-[0.3em]">Future Leaders</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-serif font-black text-brand-950">Youth Ministry</h2>
                            <p className="text-slate-500 mt-4 max-w-xl font-light ml-auto lg:ml-0">Empowering the next generation to walk in the light of Truth.</p>
                        </div>
                        <MinistryGallery items={assets.filter((_, i) => i % 6 === 1)} />
                    </div>
                </section>

                {/* Community Impact */}
                <section className="bg-white py-24 relative overflow-hidden">
                    <div className="container mx-auto px-6 mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-sm">
                                <Globe size={20} />
                            </div>
                            <span className="text-[10px] font-black text-brand-950/40 uppercase tracking-[0.3em]">Outreach</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif font-black text-brand-950">Community Impact</h2>
                        <p className="text-slate-500 mt-4 max-w-xl font-light">Transforming lives and building stronger communities together.</p>
                    </div>
                    <div className="relative z-10 pl-4 md:pl-12">
                        <MinistryGallery items={assets.filter((_, i) => i % 6 === 2)} />
                    </div>
                </section>

                {/* Helping Hands - Charity */}
                <section className="bg-brand-950 py-32 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />
                    <div className="container mx-auto px-6 mb-16 relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 bg-white/10 text-accent-400 px-6 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-8 border border-white/10"
                        >
                            <Heart size={14} className="fill-current" /> Welfare & Charity
                        </motion.div>
                        <h2 className="text-4xl md:text-7xl font-serif font-black text-white mb-6 tracking-tighter">Helping <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-200">Hands</span></h2>
                        <p className="text-brand-100/60 max-w-2xl mx-auto text-lg font-light leading-relaxed">Pure religion and undefiled before God and the Father is this, To visit the fatherless and widows in their affliction...</p>
                    </div>
                    <div className="relative z-10 pl-4 md:pl-12">
                        <MinistryGallery items={assets.filter((_, i) => i % 6 === 3)} />
                    </div>
                </section>

                {/* Sacred Music & Praise */}
                <section className="bg-white py-24 relative overflow-hidden">
                    <div className="relative z-10 pl-4 md:pl-12">
                        <div className="container mx-auto px-6 mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                                    <Music size={20} />
                                </div>
                                <span className="text-[10px] font-black text-brand-950/40 uppercase tracking-[0.3em]">Worship Team</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-serif font-black text-brand-950">Sacred Music & Praise</h2>
                            <p className="text-slate-500 mt-4 max-w-xl font-light">Celebrating the Word through the beauty of song and worship.</p>
                        </div>
                        <MinistryGallery items={assets.filter((_, i) => i % 6 === 4)} />
                    </div>
                </section>

                {/* Healing & Miracle Service */}
                <section className="bg-slate-50 py-24 relative overflow-hidden">
                    <div className="container mx-auto px-6 mb-12 text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-sm">
                                <Droplets size={20} />
                            </div>
                            <span className="text-[10px] font-black text-brand-950/40 uppercase tracking-[0.3em]">Spiritual Power</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif font-black text-brand-950">Healing & Miracle Service</h2>
                        <p className="text-slate-600 mt-4 max-w-xl mx-auto font-light">Witnessing the miraculous power of prayer and restoration.</p>
                    </div>
                    <div className="relative z-10 pl-4 md:pl-12">
                        <MinistryGallery items={assets.filter((_, i) => i % 6 === 5)} />
                    </div>
                </section>
            </div>

            {/* Quote Area */}
            <div className="bg-white relative overflow-hidden">
                <div className="container mx-auto px-6 py-32 text-center relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <Sparkles className="w-12 h-12 text-accent-500 mx-auto mb-8 animate-pulse" />
                        <p className="text-3xl md:text-5xl font-serif italic text-brand-950 leading-tight mb-8">
                            "Let your light shine before others, that they may see your good deeds and glorify your Father in heaven."
                        </p>
                        <span className="text-xs font-black text-brand-400 uppercase tracking-[0.3em]">Matthew 5:16</span>
                    </div>
                </div>
            </div>

        </div>
    );
};
