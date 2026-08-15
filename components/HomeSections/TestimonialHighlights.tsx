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


export const TestimonialHighlights: React.FC<SectionProps> = ({ setView }) => {
    return (
        <section className="py-24 bg-white overflow-hidden relative">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-6"
                    >
                        <MessageSquare size={14} /> Voices of the Community
                    </motion.div>
                    <h2 className="text-4xl md:text-6xl font-serif font-bold text-brand-950 mb-6 tracking-tight">Lives <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400 italic">Transformed</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { name: 'S.Shaveesh Jeshurun', text: 'The Hebrew Hub has opened my eyes to the depth of the Scriptures. Truly a blessing.', role: 'Member' },
                        { name: 'Sri Priya', text: 'Valparai sanctuary is the most peaceful place for worship. I feel closer to God there.', role: 'Worshipper' },
                        { name: 'Prasad R', text: 'The youth ministry has given me a family and a purpose. Thank you COT!', role: 'Youth Leader' }
                    ].map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all"
                        >
                            {/* Green 5-star rating */}
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, s) => (
                                    <svg key={s} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="#3aaa5a" stroke="#2e9048" strokeWidth="0.5">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                ))}
                                <span className="ml-1.5 text-[10px] font-black text-green-700 uppercase tracking-wider">5.0</span>
                            </div>
                            <p className="text-slate-600 italic mb-6">"{t.text}"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand-200 rounded-full flex items-center justify-center font-bold text-brand-700">{t.name[0]}</div>
                                <div>
                                    <h4 className="font-bold text-brand-950 text-sm">{t.name}</h4>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
