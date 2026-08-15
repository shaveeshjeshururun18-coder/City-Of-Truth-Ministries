import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight, BookOpen, MapPin, Globe, Sparkles, MessageSquare, QrCode, Heart, Users, Mountain, Leaf, CloudRain, Video, Sun, Music, FileText, Eye } from 'lucide-react';
import { ViewState, User } from '../../types';
import { MessageFromLeader } from '../MessageFromLeader';
import { LordIconWrapper } from '../LordIconWrapper';
import { DeuteronomyCircleGraphic } from '../DeuteronomyCircleGraphic';
import { PSALM_119_VERSES } from '../psalm119';

const useSectionInfo = (sectionId: string, defaultName: string, defaultDesc: string) => {
    return React.useMemo(() => {
        try {
            const saved = localStorage.getItem('cot_sections_info');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed[sectionId]) {
                    return {
                        name: parsed[sectionId].name || defaultName,
                        desc: parsed[sectionId].desc || defaultDesc
                    };
                }
            }
        } catch {}
        return { name: defaultName, desc: defaultDesc };
    }, [sectionId, defaultName, defaultDesc]);
};

interface SectionProps {
    setView: (view: ViewState) => void;
}


export const MinistryHighlights: React.FC<SectionProps> = ({ setView }) => {
    const { name, desc } = useSectionInfo('highlights', 'Our Ministries', 'A Legacy of Service and Faith');
    const ministries = [
        { name: 'Spiritual Gatherings', Icon: Sparkles, color: 'bg-blue-500' },
        { name: 'Youth Ministry', Icon: Star, color: 'bg-amber-500' },
        { name: 'Community Impact', Icon: Users, color: 'bg-green-500' },
    ];

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6"
                        >
                            <Star size={12} />
                            {name}
                        </motion.div>
                        <h2 className="text-4xl md:text-6xl font-serif font-black text-brand-950 leading-[0.9] tracking-tighter">
                            {desc}
                        </h2>
                    </div>
                    <button
                        onClick={() => setView(ViewState.MINISTRIES)}
                        className="group flex items-center gap-3 bg-brand-950 text-white px-8 py-4 rounded-full font-bold text-sm hover:scale-105 transition-transform"
                    >
                        Explore All Ministries
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {ministries.map((m, i) => (
                        <motion.div
                            key={m.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-brand-200 transition-colors"
                        >
                            <div className={`w-14 h-14 ${m.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand-500/10`}>
                                <m.Icon size={28} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-brand-950 mb-3">{m.name}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                Join our vibrant community as we walk together in truth and love, making a difference in the lives of those around us.
                            </p>
                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                <ArrowRight size={16} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Deuteronomy 4:35 Circular Sacred Graphic Section */}
            <div className="mt-16 container mx-auto px-6">
                <div className="bg-gradient-to-br from-amber-500/10 via-yellow-50/50 to-orange-50/30 rounded-[3rem] p-8 md:p-12 border-2 border-amber-300/60 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="max-w-xl space-y-4 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-amber-300">
                            📜 Sacred Truth Scripture
                        </div>
                        <h3 className="text-3xl md:text-5xl font-serif font-black text-slate-900 leading-tight">
                            EIN OD MIL'VADO <br />
                            <span className="text-amber-700">אין עוד מלבדו</span>
                        </h3>
                        <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                            "You have been shown these things to know that Yahweh He is God; there is nothing besides Him." — Deuteronomy 4:35. Discover the foundational truth of our faith and study the sacred Hebrew Scriptures.
                        </p>
                        <button
                            onClick={() => setView(ViewState.HEBREW)}
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-600/30 cursor-pointer active:scale-95"
                        >
                            Explore Hebrew Language & Study →
                        </button>
                    </div>

                    <div className="shrink-0">
                        <DeuteronomyCircleGraphic size={300} />
                    </div>
                </div>
            </div>
        </section>
    );
};
