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


export const MemberInitialsSection: React.FC<{ users: User[] }> = ({ users }) => {
    const DEFAULT_INITIALS = 'CT';
    const visibleUsers = users.slice(0, 8);
    const fallbackUsers = ['Shaveesh Jeshurun', 'Sri Priya', 'Prasad Raj', 'Grace Mary'];
    const namesToRender = visibleUsers.length > 0 ? visibleUsers.map((u) => u.name) : fallbackUsers;

    const getInitials = (name: string) => {
        if (!name.trim()) return DEFAULT_INITIALS;
        const initials = name
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() || '')
            .join('');
        return initials.padEnd(2, DEFAULT_INITIALS[0]).slice(0, 2);
    };

    return (
        <section className="py-20 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-16 -right-10 w-56 h-56 bg-orange-300/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-6 w-52 h-52 bg-amber-300/30 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-orange-200">
                        <Users size={12} />
                        Our Members
                    </div>
                    <h2 className="mt-5 text-4xl md:text-5xl font-serif font-black text-orange-950 tracking-tight">
                        Names & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 italic font-light">Two-Letter Logos</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {namesToRender.map((name, index) => (
                        <motion.div
                            key={`${name}-${index}`}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="group bg-white/90 border border-orange-200 rounded-3xl p-5 shadow-lg shadow-orange-200/40 hover:shadow-xl hover:-translate-y-1 transition-all"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black text-lg tracking-wider flex items-center justify-center shadow-md shadow-orange-300/40 mb-4 group-hover:scale-105 transition-transform">
                                {getInitials(name)}
                            </div>
                            <p className="text-orange-950 font-bold leading-tight">{name}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
