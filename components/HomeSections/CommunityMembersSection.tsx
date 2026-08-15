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

export const CommunityMembersSection: React.FC<SectionProps & { users: User[] }> = ({ setView, users }) => {
    const activeUsers = users.filter(u => u.status === 'Active' && u.name);
    const displayUsers = activeUsers.length > 0 ? activeUsers : [
        { id: 'demo-1', name: 'Shaveesh Jeshurun' } as User,
        { id: 'demo-2', name: 'Sri Priya' } as User,
        { id: 'demo-3', name: 'Prasad R' } as User,
        { id: 'demo-4', name: 'Grace Thomas' } as User,
        { id: 'demo-5', name: 'Daniel Mark' } as User,
        { id: 'demo-6', name: 'Ruth Vijay' } as User,
    ];
    const showMobileGrid = displayUsers.length <= 8;

    return (
        <section className="py-20 bg-gradient-to-br from-orange-50 via-amber-50 to-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 border border-orange-200 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4"
                    >
                        <Users size={12} />
                        Our Community
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-serif font-black text-orange-900 tracking-tight leading-tight"
                    >
                        Meet Our{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 italic font-light">
                            Members
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-slate-500 mt-3 max-w-md mx-auto text-sm font-light"
                    >
                        A growing family walking together in truth and faith.
                    </motion.p>
                </div>

                <div
                    className={`max-w-5xl mx-auto pb-3 px-1 ${
                        showMobileGrid
                            ? 'grid grid-cols-4 gap-2 sm:flex sm:flex-row sm:flex-nowrap sm:overflow-x-auto sm:gap-6'
                            : 'flex flex-row flex-nowrap overflow-x-auto gap-3 sm:gap-6'
                    }`}
                >
                    {displayUsers.map((user, i) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, scale: 0.85, y: 20 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            viewport={{ once: true }}
                            className={`flex flex-col items-center gap-2 sm:gap-2.5 group cursor-default bg-white/70 border border-orange-100 rounded-3xl px-2.5 py-3 sm:px-4 sm:py-4 shadow-md shadow-orange-100/70 hover:shadow-lg hover:shadow-orange-200/70 transition-all duration-300 ${
                                showMobileGrid ? 'w-full min-w-0' : 'flex-shrink-0 basis-1/4 min-w-0 sm:basis-auto sm:w-[140px]'
                            }`}
                        >
                            <div
                                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]} flex items-center justify-center shadow-lg shadow-orange-300/40 group-hover:scale-110 group-hover:shadow-orange-400/50 transition-all duration-300 ring-2 ring-orange-100`}
                            >
                                <span className="text-white text-base sm:text-xl font-black tracking-wide select-none">
                                    {getInitials(user.name)}
                                </span>
                            </div>
                            <span className="text-[11px] sm:text-xs font-bold text-orange-800 text-center leading-tight w-full tracking-wide break-words">
                                {user.name}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {activeUsers.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        viewport={{ once: true }}
                        className="text-center mt-10"
                    >
                        <button
                            onClick={() => setView(ViewState.ID_CARD)}
                            className="group inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3.5 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg shadow-orange-400/30"
                        >
                            Join Our Community
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                )}
            </div>
        </section>
    );
};
