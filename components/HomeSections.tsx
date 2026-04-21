import React from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight, BookOpen, MapPin, Globe, Sparkles, MessageSquare, QrCode, Heart, Users } from 'lucide-react';
import { ViewState, User } from '../types';
import { MessageFromLeader } from './MessageFromLeader';

interface SectionProps {
    setView: (view: ViewState) => void;
}

export const MinistryHighlights: React.FC<SectionProps> = ({ setView }) => {
    const ministries = [
        { name: 'Spiritual Gatherings', icon: <Sparkles size={24} />, color: 'bg-blue-500' },
        { name: 'Youth Ministry', icon: <Star size={24} />, color: 'bg-amber-500' },
        { name: 'Community Impact', icon: <Globe size={24} />, color: 'bg-green-500' },
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
                            Our Ministries
                        </motion.div>
                        <h2 className="text-4xl md:text-6xl font-serif font-black text-brand-950 leading-[0.9] tracking-tighter">
                            A Legacy of <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400 italic font-light">Service</span> and Faith
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
                                {m.icon}
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
        </section>
    );
};

export const HebrewSanctuaryIntro: React.FC<SectionProps> = ({ setView }) => {
    return (
        <section className="py-24 bg-[#fdfcf0]">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="aspect-square rounded-[3rem] bg-brand-950 relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1543722518-971c6dd64070?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white/20 text-[20vw] font-serif font-black select-none">אב</span>
                        </div>
                        <div className="absolute inset-x-8 bottom-8 p-10 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                            <BookOpen size={48} className="text-accent-400 mb-6" />
                            <h3 className="text-3xl font-serif text-white mb-4">The Language of Truth</h3>
                            <p className="text-white/70 text-sm leading-relaxed">
                                Unlock the deeper meanings of the Scriptures through the study of Biblical Hebrew.
                            </p>
                        </div>
                    </motion.div>

                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 bg-brand-950 text-brand-100 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6"
                        >
                            <BookOpen size={12} />
                            Hebrew Hub
                        </motion.div>
                        <h2 className="text-4xl md:text-6xl font-serif font-black text-brand-950 leading-[0.9] tracking-tighter mb-8">
                            Sacred <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-accent-400 italic font-light">Scriptures</span> Decoded
                        </h2>
                        <p className="text-xl text-slate-500 font-light leading-relaxed mb-10 max-w-xl">
                            From the Hebrew alphabet to the profound depth of the Biblical calendar, embark on a journey of spiritual discovery.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => setView(ViewState.ABOUT)}
                                className="bg-brand-950 text-white px-8 py-4 rounded-full font-bold text-sm flex items-center gap-3 hover:scale-105 transition-transform shadow-xl shadow-brand-500/20"
                            >
                                Start Learning
                                <ArrowRight size={18} />
                            </button>
                            <button
                                onClick={() => setView(ViewState.HEBREW)}
                                className="border-2 border-brand-950 text-brand-950 px-8 py-4 rounded-full font-bold text-sm hover:bg-brand-950 hover:text-white transition-all"
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

export const ValparaiPresence: React.FC<SectionProps> = ({ setView }) => {
    return (
        <section className="py-24 bg-brand-950 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[url('https://images.unsplash.com/photo-1542332213-31f87348057f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border border-white/10"
                    >
                        <MapPin size={12} className="text-accent-400" />
                        Valparai Sanctuary
                    </motion.div>
                    <h2 className="text-5xl md:text-8xl font-serif font-black text-white leading-[0.8] tracking-tighter mb-8">
                        A Haven in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-200 italic font-light whitespace-nowrap">Mist-Clad Hills</span>
                    </h2>
                    <p className="text-xl text-white/60 font-light leading-relaxed mb-12 max-w-2xl">
                        Experience the serenity of our spiritual home nestled among the tea estates of Valparai, where nature and worship meet.
                    </p>
                    <button
                        onClick={() => setView(ViewState.ABOUT_VALPARAI)}
                        className="group flex items-center gap-4 bg-white text-brand-950 px-10 py-5 rounded-full font-black text-sm hover:bg-accent-400 hover:text-brand-950 transition-all uppercase tracking-widest"
                    >
                        Visit the Sanctuary
                        <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    );
};

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
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-current" />)}
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
                            className="group w-full max-w-[19rem] sm:max-w-2xl bg-accent-500 text-brand-950 px-5 sm:px-10 py-4 sm:py-6 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.25em] hover:bg-white transition-all shadow-[0_20px_40px_-10px_rgba(245,158,11,0.3)] flex items-center justify-between gap-2 sm:gap-3 mx-auto sm:mx-0"
                        >
                            <span className="flex-1 text-center sm:text-left">Claim Your Card Now</span>
                            <ArrowRight size={18} className="shrink-0 group-hover:translate-x-2 transition-transform" />
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
export const LeaderMessageSection: React.FC<SectionProps & { onClose?: () => void }> = ({ setView, onClose }) => {
    return (
        <section className="py-24 bg-brand-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none"></div>
            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center"
                >
                    <MessageFromLeader onClose={onClose} />
                </motion.div>
            </div>
        </section>
    );
};

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
