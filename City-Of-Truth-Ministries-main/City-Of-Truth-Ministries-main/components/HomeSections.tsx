import React from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight, BookOpen, MapPin, Globe, Sparkles, MessageSquare, QrCode, ShieldCheck, User as UserIcon, UploadCloud, CreditCard, LogIn } from 'lucide-react';
import { ViewState, User as UserType } from '../types';
import { MessageFromLeader } from './MessageFromLeader';

interface SectionProps {
    setCurrentView: (view: ViewState) => void;
    onLoginClick?: () => void;
    users?: UserType[];
}

export const MinistryHighlights: React.FC<SectionProps> = ({ setCurrentView }) => {
    const ministries = [
        { name: 'Spiritual Gatherings', icon: <Sparkles size={24} />, color: 'bg-brand-500' },
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
                        onClick={() => setCurrentView(ViewState.MINISTRIES)}
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

export const HebrewSanctuaryIntro: React.FC<SectionProps> = ({ setCurrentView }) => {
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
                        <div className="absolute inset-x-8 bottom-8 p-10 bg-white/10 rounded-3xl border border-white/20">
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
                                onClick={() => setCurrentView(ViewState.ABOUT)}
                                className="bg-brand-950 text-white px-8 py-4 rounded-full font-bold text-sm flex items-center gap-3 hover:scale-105 transition-transform shadow-xl shadow-brand-500/20"
                            >
                                Start Learning
                                <ArrowRight size={18} />
                            </button>
                            <button
                                onClick={() => setCurrentView(ViewState.HEBREW)}
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

export const ValparaiPresence: React.FC<SectionProps> = ({ setCurrentView }) => {
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
                        onClick={() => setCurrentView(ViewState.ABOUT_VALPARAI)}
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

export const TestimonialHighlights: React.FC<SectionProps> = ({ setCurrentView }) => {
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

export const EntrustCardPreview: React.FC<SectionProps> = ({ setCurrentView }) => {
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
                            onClick={() => setCurrentView(ViewState.ID_CARD)}
                            className="group bg-accent-500 text-brand-950 px-12 py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-all shadow-[0_20px_40px_-10px_rgba(245,158,11,0.3)] flex items-center gap-4"
                        >
                            Claim Your Card Now
                            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>

                    <div className="relative group perspective-1000" onClick={() => setCurrentView(ViewState.ID_CARD)}>
                        <div className="absolute inset-x-8 bottom-8 p-4 bg-accent-500/20 rounded-full group-hover:bg-accent-500/40 transition-all duration-700" />
                        <motion.div
                            initial={{ rotateY: -30, rotateX: 10, y: 50, opacity: 0 }}
                            whileInView={{ rotateY: -15, rotateX: 5, y: 0, opacity: 1 }}
                            whileHover={{ rotateY: 0, rotateX: 0, scale: 1.05 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10 aspect-[1.6/1] bg-gradient-to-br from-brand-800 via-brand-900 to-black rounded-[2.5rem] border border-white/20 p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
                        >
                            <div className="absolute top-10 left-10 w-12 h-10 bg-gradient-to-br from-amber-200 to-amber-500 rounded-lg opacity-40" />

                            <div className="flex justify-between items-start ml-20">
                                <div>
                                    <h4 className="text-white text-2xl font-serif font-black leading-none tracking-tight">City of Truth</h4>
                                    <p className="text-[10px] text-accent-400 font-bold uppercase tracking-[0.4em] mt-1">Ministries</p>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
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

export const LeaderMessageSection: React.FC<SectionProps & { onClose?: () => void }> = ({ setCurrentView, onClose }) => {
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

export const VerifyMembershipSection: React.FC<SectionProps & {
    onLoginWithView?: (view: 'choice' | 'login' | 'register' | 'forgot-id') => void
}> = ({ setCurrentView, onLoginClick, onLoginWithView }) => {
    return (
        <section className="py-32 bg-gradient-to-b from-white via-slate-50 to-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-600 via-accent-400 to-brand-600" />
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="inline-flex items-center gap-3 px-6 py-2 bg-brand-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-8 shadow-xl shadow-brand-500/20">
                            <ShieldCheck size={14} className="text-white" /> Member Verification
                        </span>
                        <h2 className="text-6xl md:text-8xl font-serif font-black text-brand-900 leading-none tracking-tighter mb-8">
                            Confirm Your <span className="text-accent-500 italic font-light">Status</span>
                        </h2>
                        <p className="text-xl text-brand-400 max-w-2xl mx-auto font-light leading-relaxed">
                            Confirm your City of Truth membership status through our secure official methods.
                        </p>
                    </motion.div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                    {[
                        { icon: LogIn, label: 'Login to Account', desc: 'Access your personal dashboard with your Member ID, phone, or email.', color: 'from-brand-600 to-brand-900', action: () => onLoginWithView ? onLoginWithView('login') : (onLoginClick && onLoginClick()), cta: 'Login Now' },
                        { icon: UploadCloud, label: 'Upload Entrust PDF', desc: 'Upload your Entrust Card document to verify membership.', color: 'from-indigo-600 to-indigo-900', action: () => onLoginWithView ? onLoginWithView('login') : (onLoginClick && onLoginClick()), cta: 'Upload File' },
                        { icon: CreditCard, label: 'View Entrust Card', desc: 'Register or view your official digital ID card.', color: 'from-purple-600 to-purple-900', action: () => setCurrentView(ViewState.ID_CARD), cta: 'View Card' },
                        { icon: QrCode, label: 'Scan QR Code', desc: 'Scan a member\'s QR code to instantly verify.', color: 'from-amber-500 to-orange-600', action: () => setCurrentView(ViewState.VERIFY_ID), cta: 'Open Scanner' },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            onClick={item.action}
                            className="group bg-white border border-slate-100 rounded-[3rem] p-10 shadow-[0_25px_70px_rgba(15,23,42,0.08)] hover:shadow-[0_55px_140px_rgba(15,23,42,0.18)] hover:-translate-y-3 transition-all duration-500 cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-[0.08] transition-opacity duration-700 from-brand-500 to-accent-500" />
                            <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner bg-gradient-to-br ${item.color}`}>
                                <item.icon size={36} className="text-white" />
                            </div>
                            <h3 className="font-black text-brand-950 text-2xl mb-4 leading-tight tracking-tight">{item.label}</h3>
                            <p className="text-brand-400 text-sm leading-relaxed mb-8 font-medium">{item.desc}</p>
                            <div className={`inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-brand-700 group-hover:gap-5 transition-all`}>
                                {item.cta} <ArrowRight size={16} className="text-brand-300 group-hover:text-brand-700 transition-colors" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export const UserStatsSection: React.FC<SectionProps> = ({ users = [] }) => {
    return (
        <section className="py-12 bg-slate-50 border-t border-brand-100">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white/80 p-8 rounded-[2rem] border border-brand-50 shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-600/20">
                            <UserIcon size={32} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-brand-900 leading-none">{users.length}</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400 mt-2">Registered Members</p>
                        </div>
                    </div>

                    <div className="flex-1 w-full overflow-hidden">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles size={14} className="text-accent-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-900/40">Our Growing Community</span>
                        </div>
                        <div className="relative group">
                            <div className="flex animate-scroll hover:pause whitespace-nowrap gap-6 py-2">
                                {users.length > 0 ? (
                                    [...users, ...users].slice(0, 20).map((u, i) => (
                                        <div key={i} className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-brand-50 shadow-sm">
                                            <div className="w-2 h-2 rounded-full bg-brand-400" />
                                            <span className="text-xs font-bold text-brand-900">{u.name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-xs text-brand-400 italic">No members registered yet...</span>
                                )}
                            </div>
                            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />
                            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 40s linear infinite;
                    width: max-content;
                }
                .pause {
                    animation-play-state: paused;
                }
            `}} />
        </section>
    );
};
