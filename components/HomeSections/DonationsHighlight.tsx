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


export const DonationsHighlight: React.FC<SectionProps & { onDonate?: () => void }> = ({ setView, onDonate }) => {
    const donationBoxes = [
        { name: 'General Fund', label: 'GF' },
        { name: 'Building Fund', label: 'BF' },
        { name: 'Youth Ministry', label: 'YM' },
        { name: 'Missions', label: 'MS' },
        { name: 'Valparai Sanctuary', label: 'VS' },
    ];

    return (
        <section className="py-14 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-200/40 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-200/40 rounded-full blur-2xl -ml-12 -mb-12" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Left: Title */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-center md:text-left"
                    >
                        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 border border-orange-200 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                            <Heart size={11} className="fill-orange-400 text-orange-400" />
                            Support Us
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif font-black text-orange-900 leading-tight tracking-tight">
                            City of Truth<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 italic font-light">Ministries</span>
                        </h2>
                    </motion.div>

                    {/* Center: Donation Boxes as Logo Labels */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-wrap justify-center gap-3"
                    >
                        {donationBoxes.map((box, i) => (
                            <motion.div
                                key={box.name}
                                initial={{ opacity: 0, scale: 0.85 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.08 }}
                                viewport={{ once: true }}
                                className="flex flex-col items-center gap-1.5 cursor-default group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                                    <span className="text-white text-[13px] font-black tracking-wider">{box.label}</span>
                                </div>
                                <span className="text-[10px] font-bold text-orange-800 text-center leading-tight max-w-[70px] uppercase tracking-wide">{box.name}</span>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Right: CTA */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <button
                            onClick={() => onDonate ? onDonate() : setView(ViewState.ID_CARD)}
                            className="group flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-7 py-3.5 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg shadow-orange-400/30"
                        >
                            <Heart size={16} className="fill-white/40" />
                            Give Now
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

function getInitials(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) return '??';
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
}

const AVATAR_GRADIENTS = [
    'from-orange-400 to-amber-500',
    'from-orange-500 to-red-400',
    'from-amber-400 to-orange-500',
    'from-orange-400 to-orange-600',
    'from-amber-500 to-amber-700',
    'from-red-400 to-orange-500',
];
