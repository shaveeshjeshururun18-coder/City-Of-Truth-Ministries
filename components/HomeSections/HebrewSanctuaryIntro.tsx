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


export const HebrewSanctuaryIntro: React.FC<SectionProps> = ({ setView }) => {
    const navigate = useNavigate();
    const { name, desc } = useSectionInfo('hebrew', 'Hebrew Hub', 'Sacred Scriptures Decoded');
    return (
        <section className="py-12 md:py-20 bg-[#fdfcf0]">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="aspect-[4/3] md:aspect-square rounded-[2rem] bg-brand-950 relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1543722518-971c6dd64070?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white/20 text-[20vw] font-serif font-black select-none">אב</span>
                        </div>
                        <div className="absolute inset-x-6 bottom-6 p-6 md:p-10 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                            <BookOpen size={36} className="text-accent-400 mb-4" />
                            <h3 className="text-xl md:text-3xl font-serif text-white mb-2 md:mb-4">The Language of Truth</h3>
                            <p className="text-white/70 text-xs md:text-sm leading-relaxed">
                                Unlock the deeper meanings of the Scriptures through the study of Biblical Hebrew.
                            </p>
                        </div>
                    </motion.div>

                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 bg-brand-950 text-brand-100 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4 md:mb-6"
                        >
                            <BookOpen size={12} />
                            {name}
                        </motion.div>
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-black text-brand-950 leading-[0.9] tracking-tighter mb-4 md:mb-8">
                            {desc}
                        </h2>
                        <p className="text-base md:text-xl text-slate-500 font-light leading-relaxed mb-6 md:mb-10 max-w-xl">
                            From the Hebrew alphabet to the profound depth of the Biblical calendar, embark on a journey of spiritual discovery.
                        </p>
                        <div className="flex flex-wrap gap-3 md:gap-4">
                            <button
                                onClick={() => setView(ViewState.ABOUT)}
                                className="bg-brand-950 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-sm flex items-center gap-3 hover:scale-105 transition-transform shadow-xl shadow-brand-500/20"
                            >
                                Start Learning
                                <ArrowRight size={18} />
                            </button>
                            <button
                                onClick={() => navigate('/hebrew-alphabet')}
                                className="border-2 border-brand-950 text-brand-950 px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-sm hover:bg-brand-950 hover:text-white transition-all"
                            >
                                Alphabet Page
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
