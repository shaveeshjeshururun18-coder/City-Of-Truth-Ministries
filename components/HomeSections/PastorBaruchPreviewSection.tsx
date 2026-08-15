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


export const PastorBaruchPreviewSection: React.FC<SectionProps> = ({ setView }) => {
    return (
        <section className="py-24 bg-gradient-to-b from-slate-50 to-[#fdfcfb] relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-400/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-900/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] border border-amber-200/50 shadow-sm"
                    >
                        <Heart size={14} className="text-amber-600" /> Spiritual Highlights
                    </motion.span>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-6 text-5xl md:text-6xl lg:text-7xl font-serif font-black text-brand-950 tracking-tight leading-tight"
                    >
                        Pastor & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 italic font-light pr-2">Baruch Hashem</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 text-slate-500 text-lg"
                    >
                        Experience the heart of our ministry through dedicated pastoral leadership and deep, praise-centered worship.
                    </motion.p>
                </div>
                
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Pastor Showcase */}
                    <motion.div 
                        initial={{ opacity: 0, y: 36 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="group relative overflow-hidden rounded-[2rem] border border-sky-100 bg-[#f8fbff] shadow-[0_34px_90px_-52px_rgba(14,165,233,0.35)]"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(56,189,248,0.15),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(2,132,199,0.08),transparent_32%)]" />
                        <div className="relative grid items-center min-h-[340px] lg:grid-cols-[0.35fr_1.65fr]">
                            <div className="relative h-[280px] lg:h-[320px] max-w-[260px] mx-auto w-full p-4 sm:p-5 lg:p-6">
                                <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] border-[6px] border-white bg-sky-50 shadow-xl ring-1 ring-sky-100">
                                    <img 
                                        src="/assets/pastor.jpeg" 
                                        alt="Pastor Leadership" 
                                        className="h-full w-full object-cover object-top transform transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-sky-950/20 to-transparent" />
                                    <div className="absolute inset-3 rounded-xl border border-white/20 pointer-events-none" />
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="mb-3 h-1 w-16 rounded-full bg-sky-400 transition-all duration-500 group-hover:w-32" />
                                        <h3 className="text-3xl font-serif font-black tracking-tight text-white drop-shadow md:text-4xl">Pastor Section</h3>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="relative flex flex-col justify-center px-6 pb-8 pt-0 sm:px-8 lg:px-10 lg:py-8">
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-200 bg-sky-600 text-white shadow-lg shadow-sky-600/20">
                                        <BookOpen size={24} />
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 text-sky-700 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] border border-sky-200">
                                        <Star size={10} /> Leadership
                                    </span>
                                </div>
                                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.25em] text-sky-600">Shepherd's Vision</p>
                                <h4 className="mb-4 text-2xl font-serif font-black leading-tight tracking-tight text-slate-900 md:text-3xl">
                                    A dedicated room for guidance and growth.
                                </h4>
                                <p className="mb-8 text-base leading-relaxed text-slate-600">
                                    Discover the visionary leadership and profound biblical teachings guiding our spiritual journey.
                                </p>
                                <button onClick={() => setView(ViewState.PASTOR)} className="group/btn relative overflow-hidden inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-4 text-[15px] font-black text-white shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(14,165,233,0.6)] active:scale-95 sm:w-auto">
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
                                    <span className="relative z-10 flex items-center gap-2">
                                        Visit Pastor Page <ArrowRight size={18} className="transition-transform duration-300 group-hover/btn:translate-x-2 group-hover/btn:scale-125" />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Baruch Hashem Showcase - ENLARGED */}
                    <motion.div 
                        initial={{ opacity: 0, y: 36 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                        className="group relative overflow-hidden rounded-[2.5rem] border border-amber-200 bg-[#fffaf0] shadow-[0_34px_90px_-52px_rgba(180,83,9,0.4)]"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(251,191,36,0.22),transparent_34%),radial-gradient(circle_at_84%_82%,rgba(248,113,113,0.18),transparent_30%)]" />
                        <div className="relative grid items-center min-h-[500px] lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-10">
                            <div className="relative order-2 h-[420px] lg:h-[500px] max-w-[420px] mx-auto w-full lg:order-2 p-5 sm:p-6 lg:p-8">
                                <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] border-[8px] border-white bg-amber-50 shadow-2xl ring-1 ring-amber-100">
                                    <img 
                                        src="/barch_hasem/New folder/ஆத்தும நன்றி பள்ளிகள் wrapper (1).jpg" 
                                        alt="Baruch Hashem Worship" 
                                        className="h-full w-full object-contain transform transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-amber-950/80 via-amber-900/20 to-transparent" />
                                    <div className="absolute inset-3 rounded-xl border border-white/20 pointer-events-none" />
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="mb-3 h-1.5 w-20 rounded-full bg-orange-400 transition-all duration-500 group-hover:w-40" />
                                        <h3 className="text-4xl font-serif font-black tracking-tight text-white drop-shadow md:text-5xl">Baruch Hashem</h3>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="relative order-1 flex flex-col justify-center px-6 pb-10 pt-8 sm:px-10 lg:px-14 lg:py-12">
                                <div className="mb-10 flex items-center justify-between">
                                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20">
                                        <Sparkles size={36} />
                                    </div>
                                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-800 px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] border border-amber-200">
                                        <Sparkles size={13} className="text-amber-600" /> Worship
                                    </span>
                                </div>
                                <p className="mb-5 text-sm font-black uppercase tracking-[0.25em] text-orange-600">Hebrew Tamil Praise</p>
                                <h4 className="mb-7 text-4xl font-serif font-black leading-tight tracking-tight text-brand-950 md:text-5xl">
                                    A majestic gallery for praise and devotion.
                                </h4>
                                <p className="mb-12 text-lg leading-relaxed text-slate-700">
                                    Immerse yourself in divine worship and experience the presence of God through pure praise.
                                </p>
                                <button onClick={() => setView(ViewState.BARUCH_HASHEM)} className="group/btn relative overflow-hidden inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-10 py-6 text-lg font-black text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] active:scale-95 sm:w-auto">
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
                                    <span className="relative z-10 flex items-center gap-2">
                                        Visit Baruch Hashem <ArrowRight size={20} className="transition-transform duration-300 group-hover/btn:translate-x-2 group-hover/btn:scale-125" />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
