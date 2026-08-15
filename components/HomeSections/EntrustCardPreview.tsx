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


export const EntrustCardPreview: React.FC<SectionProps> = ({ setView }) => {
    return (
        <section className="py-24 bg-brand-950 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 bg-white/10 text-accent-400 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.3em] uppercase mb-8 border border-white/10"
                        >
                            <QrCode size={14} /> Official Identity
                        </motion.div>
                        <h2 className="text-5xl md:text-8xl font-serif font-black text-white leading-[0.85] tracking-tighter mb-10">
                            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-white to-accent-200 italic font-light">Entrust Card</span> Awaits
                        </h2>
                        <p className="text-xl text-brand-100/60 font-light leading-relaxed mb-12 max-w-xl">
                            Join our sacred community and receive your official digital identity card. Access ministries, events, and resources with your unique worshipper profile.
                        </p>
                        <button
                            onClick={() => setView(ViewState.ID_CARD)}
                            className="group relative w-full max-w-sm sm:max-w-xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white px-6 sm:px-8 py-4 rounded-2xl border border-blue-300/40 font-black text-[10px] sm:text-xs uppercase tracking-[0.24em] hover:-translate-y-0.5 transition-all duration-300 shadow-[0_20px_40px_-16px_rgba(37,99,235,0.7)] hover:shadow-[0_26px_50px_-14px_rgba(37,99,235,0.85)] flex items-center justify-between gap-3 sm:gap-4 mx-auto sm:mx-0 overflow-hidden"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-white/15 via-transparent to-white/10 opacity-80 pointer-events-none" />
                            <span className="flex-1 text-left leading-tight">Claim Your Card Now</span>
                            <span className="shrink-0 w-9 h-9 rounded-xl bg-white/20 border border-white/30 backdrop-blur-sm flex items-center justify-center">
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </div>

                    <div className="relative group perspective-1000" onClick={() => setView(ViewState.ID_CARD)}>
                        <div className="absolute inset-0 bg-accent-500/20 blur-[150px] rounded-full group-hover:bg-accent-500/40 transition-all duration-700" />
                        <motion.div
                            initial={{ rotateY: -30, rotateX: 10, y: 50, opacity: 0 }}
                            whileInView={{ rotateY: -15, rotateX: 5, y: 0, opacity: 1 }}
                            whileHover={{ rotateY: 0, rotateX: 0, scale: 1.05 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10 aspect-[1.6/1] bg-gradient-to-br from-brand-800 via-brand-900 to-black rounded-[2.5rem] border border-white/20 p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-xl"
                        >
                            {/* Card Chip Decoration */}
                            <div className="absolute top-10 left-10 w-12 h-10 bg-gradient-to-br from-amber-200 to-amber-500 rounded-lg opacity-40" />

                            <div className="flex justify-between items-start ml-20">
                                <div>
                                    <h4 className="text-white text-2xl font-serif font-black leading-none tracking-tight">City of Truth</h4>
                                    <p className="text-[10px] text-accent-400 font-bold uppercase tracking-[0.4em] mt-1">Ministries</p>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                                    <QrCode size={48} className="text-white/20" />
                                </div>
                            </div>

                            <div className="mt-16 space-y-6">
                                <div className="h-4 w-64 bg-white/10 rounded-full" />
                                <div className="h-3 w-40 bg-white/5 rounded-full" />
                            </div>

                            <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[8px] text-white/30 font-black uppercase tracking-[0.2em]">Validated Member</span>
                                    <div className="flex gap-1 mt-2">
                                        {[...Array(3)].map((_, i) => <div key={i} className="w-10 h-1 bg-accent-500/30 rounded-full" />)}
                                    </div>
                                </div>
                                <img src="/logo.png" className="w-12 h-12 opacity-20 grayscale" alt="COT Logo" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};