import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    MapPin, ArrowRight, Download, Check, Send, BookOpen, Globe, HandHeart, ScrollText,
    Flame, Cross, Mountain, Mail, IdCard, Landmark, Star, Smartphone, Leaf, Sparkles, type LucideIcon,
} from 'lucide-react';
import { ViewState } from '../types';

interface HeroFooterProps {
    onNavigate: (view: ViewState) => void;
    currentUser?: any;
}

export const HeroFooter: React.FC<HeroFooterProps> = ({ onNavigate, currentUser }) => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setTimeout(() => setSubscribed(false), 4000);
            setEmail('');
        }
    };

    return (
        <footer className="relative bg-[#050b1e] text-white pt-24 pb-16 overflow-hidden border-t-2 border-[#D4AF37]/30 shadow-2xl">
            {/* Floating Golden Dust & Star particle background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:32px_32px] opacity-20" />
            </div>

            <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-7xl space-y-16">

                {/* 1. HERO FOOTER HEADER */}
                <div className="text-center max-w-3xl mx-auto space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-[#D4AF37]/40 backdrop-blur-md shadow-lg shadow-[#D4AF37]/10"
                    >
                        <Star size={22} className="text-[#D4AF37] fill-[#D4AF37]/30" />
                        <span className="text-xs md:text-sm font-serif font-black tracking-[0.25em] text-[#D4AF37] uppercase">
                            City of Truth Ministries
                        </span>
                        <Star size={22} className="text-[#D4AF37] fill-[#D4AF37]/30" />
                    </motion.div>

                    <blockquote className="font-serif italic text-lg md:text-2xl text-blue-100/90 leading-relaxed drop-shadow">
                        "Let the Word of Christ dwell in you richly."
                        <cite className="block text-xs font-sans not-italic font-extrabold text-[#D4AF37] tracking-widest mt-2">
                            — COLOSSIANS 3:16
                        </cite>
                    </blockquote>

                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-300">
                        <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <Landmark size={14} className="text-[#D4AF37]" /> Valparai Sanctuary
                        </span>
                        <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <MapPin size={14} className="text-[#D4AF37]" /> Tamil Nadu, India
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <button
                            onClick={() => { onNavigate(ViewState.ABOUT_VALPARAI); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer flex items-center gap-2"
                        >
                            <Globe size={14} /> Visit Sanctuary
                        </button>
                        <button
                            onClick={() => { onNavigate(ViewState.CONTACT); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                        >
                            <Send size={14} className="text-blue-400" /> Contact Us
                        </button>
                    </div>
                </div>

                {/* QUICK ACCESS CHIPS */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto">
                    {([
                        { label: 'Ministries', view: ViewState.MINISTRIES, Icon: HandHeart },
                        { label: 'Hebrew Roots', view: ViewState.HEBREW, Icon: ScrollText },
                        { label: 'Menorah', view: ViewState.MENORAH, Icon: Flame },
                        { label: 'Pastor', view: ViewState.PASTOR, Icon: Cross },
                        { label: 'Valparai', view: ViewState.ABOUT_VALPARAI, Icon: Mountain },
                        { label: 'Contact', view: ViewState.CONTACT, Icon: Mail },
                        { label: 'Register Entrust', view: ViewState.ID_CARD, Icon: IdCard },
                    ] as { label: string; view: ViewState; Icon: LucideIcon }[]).map(chip => (
                        <button
                            key={chip.label}
                            onClick={() => { onNavigate(chip.view); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="px-4 py-2 rounded-full bg-white/5 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 hover:border-[#D4AF37] text-white/90 hover:text-[#D4AF37] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                            <chip.Icon size={14} className="text-[#D4AF37]" />
                            <span>{chip.label}</span>
                        </button>
                    ))}
                </div>

                {/* ANCIENT DIVIDER 1 */}
                <div className="flex items-center justify-center gap-4 text-[#D4AF37]/60 text-xs font-serif my-6">
                    <span className="h-[1px] w-24 bg-gradient-to-r from-transparent to-[#D4AF37]/40" />
                    <span className="inline-flex items-center gap-2"><Flame size={14} /> ───────────── <Flame size={14} /></span>
                    <span className="h-[1px] w-24 bg-gradient-to-l from-transparent to-[#D4AF37]/40" />
                </div>

                {/* 2. ANCIENT SCROLL SITE MAP */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Scroll 1: Explore Scripture */}
                    <div className="relative rounded-2xl bg-gradient-to-b from-[#161208] to-[#0a0803] p-6 border-2 border-[#D4AF37]/40 shadow-xl overflow-hidden group hover:border-[#D4AF37] transition-all">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#D4AF37]/10 rounded-bl-full pointer-events-none" />
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#D4AF37]/30">
                            <ScrollText size={20} className="text-[#D4AF37]" />
                            <h4 className="font-serif font-black text-[#D4AF37] text-base uppercase tracking-wider">Explore Scripture</h4>
                        </div>
                        <ul className="space-y-3 text-xs font-bold text-slate-300">
                            {[
                                { label: 'Hebrew Roots & Language', view: ViewState.HEBREW },
                                { label: 'Biblical Calendar', view: ViewState.HEBREW_CALENDAR },
                                { label: 'Menorah Lights', view: ViewState.MENORAH },
                                { label: 'Hebrew Grammar & Audio', view: ViewState.HEBREW_GRAMMAR }
                            ].map(item => (
                                <li key={item.label}>
                                    <button
                                        onClick={() => { onNavigate(item.view); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        className="hover:text-[#D4AF37] transition-colors flex items-center gap-2 text-left cursor-pointer group/link"
                                    >
                                        <span className="text-[#D4AF37] text-[10px] opacity-60 group-hover/link:opacity-100">◆</span>
                                        <span>{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Scroll 2: Ministries */}
                    <div className="relative rounded-2xl bg-gradient-to-b from-[#161208] to-[#0a0803] p-6 border-2 border-[#D4AF37]/40 shadow-xl overflow-hidden group hover:border-[#D4AF37] transition-all">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#D4AF37]/10 rounded-bl-full pointer-events-none" />
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#D4AF37]/30">
                            <HandHeart size={20} className="text-[#D4AF37]" />
                            <h4 className="font-serif font-black text-[#D4AF37] text-base uppercase tracking-wider">Ministries & Faith</h4>
                        </div>
                        <ul className="space-y-3 text-xs font-bold text-slate-300">
                            {[
                                { label: 'Valparai Sanctuary', view: ViewState.ABOUT_VALPARAI },
                                { label: 'Church Ministries', view: ViewState.MINISTRIES },
                                { label: 'Pastor Guidance', view: ViewState.PASTOR },
                                { label: 'AI Scripture Assistance', view: ViewState.AI }
                            ].map(item => (
                                <li key={item.label}>
                                    <button
                                        onClick={() => { onNavigate(item.view); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        className="hover:text-[#D4AF37] transition-colors flex items-center gap-2 text-left cursor-pointer group/link"
                                    >
                                        <span className="text-[#D4AF37] text-[10px] opacity-60 group-hover/link:opacity-100">◆</span>
                                        <span>{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Scroll 3: Members & Portal */}
                    <div className="relative rounded-2xl bg-gradient-to-b from-[#161208] to-[#0a0803] p-6 border-2 border-[#D4AF37]/40 shadow-xl overflow-hidden group hover:border-[#D4AF37] transition-all">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#D4AF37]/10 rounded-bl-full pointer-events-none" />
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#D4AF37]/30">
                            <IdCard size={20} className="text-[#D4AF37]" />
                            <h4 className="font-serif font-black text-[#D4AF37] text-base uppercase tracking-wider">Members & Covenant</h4>
                        </div>
                        <ul className="space-y-3 text-xs font-bold text-slate-300">
                            {[
                                { label: 'Register Worshipper', view: ViewState.ID_CARD },
                                { label: 'Member Login', view: ViewState.AUTH },
                                { label: 'User Dashboard', view: ViewState.USER_DASHBOARD },
                                { label: 'Admin Portal', view: ViewState.ADMIN_DASHBOARD }
                            ].map(item => (
                                <li key={item.label}>
                                    <button
                                        onClick={() => { onNavigate(item.view); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        className="hover:text-[#D4AF37] transition-colors flex items-center gap-2 text-left cursor-pointer group/link"
                                    >
                                        <span className="text-[#D4AF37] text-[10px] opacity-60 group-hover/link:opacity-100">◆</span>
                                        <span>{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 3. HEBREW BLESSING + APP DOWNLOAD + SUBSCRIBE GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                    
                    {/* HEBREW PRIESTLY BLESSING CARD */}
                    <div className="rounded-3xl bg-gradient-to-br from-amber-950/40 via-[#0a0d1d] to-[#030611] p-6 md:p-8 border border-[#D4AF37]/50 shadow-2xl flex flex-col justify-between space-y-6 text-center">
                        <div>
                            <span className="px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-black uppercase tracking-widest">
                                Birkat Kohanim · Priestly Blessing
                            </span>
                            <div className="text-3xl md:text-4xl font-serif font-black text-[#D4AF37] mt-4 mb-2 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]" dir="rtl">
                                יברכך יהוה וישמרך
                            </div>
                            <p className="text-white/90 text-sm font-serif italic">
                                "The Lord bless you and keep you."
                            </p>
                            <p className="text-[#D4AF37]/70 text-xs font-bold uppercase tracking-widest mt-1">
                                — NUMBERS 6:24
                            </p>
                        </div>

                        <div className="text-[11px] text-blue-200/70 border-t border-[#D4AF37]/20 pt-4 font-serif">
                            May the Light of Zion shine upon your home and guide your covenant journey.
                        </div>
                    </div>

                    {/* APP DOWNLOAD CARD */}
                    <div className="rounded-3xl bg-gradient-to-br from-[#0e1638] via-[#050b1e] to-[#02050f] p-6 md:p-8 border border-blue-500/40 shadow-2xl flex flex-col justify-between space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Smartphone size={22} className="text-blue-300" />
                                <h4 className="font-serif font-black text-white text-lg">Install Ministry App</h4>
                            </div>
                            <p className="text-xs text-blue-200/80 mb-4">Access biblical study tools anywhere, even offline.</p>
                            
                            <ul className="space-y-2 text-xs font-bold text-slate-300">
                                {[
                                    'Daily Hebrew Word & Audio',
                                    'Live Intercession & Prayer Requests',
                                    'Biblical Festival Calendar Reminders',
                                    'Instant Sanctuary Notifications'
                                ].map(feat => (
                                    <li key={feat} className="flex items-center gap-2">
                                        <Check size={14} className="text-emerald-400 shrink-0" />
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={() => { onNavigate(ViewState.ID_CARD); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#D4AF37] hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Download size={16} /> Download Ministry App
                        </button>
                    </div>

                    {/* WEEKLY BLESSING SUBSCRIPTION */}
                    <div className="rounded-3xl bg-gradient-to-br from-[#0c132c] via-[#050b1e] to-[#02050f] p-6 md:p-8 border border-white/10 shadow-2xl flex flex-col justify-between space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-serif font-black text-white text-lg flex items-center gap-2">
                                    <Leaf size={18} className="text-emerald-400" /> Receive Weekly Blessings
                                </h4>
                                <Leaf size={20} className="text-emerald-400" />
                            </div>
                            <p className="text-xs text-blue-200/80 mb-4">Receive inspirational scriptures and weekly sanctuary updates.</p>

                            <form onSubmit={handleSubscribe} className="space-y-3">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-xs font-semibold text-white outline-none focus:border-[#D4AF37] transition-all placeholder:text-white/40"
                                />
                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <Send size={14} /> Subscribe →
                                </button>
                            </form>

                            {subscribed && (
                                <p className="text-xs text-emerald-400 font-bold mt-2 text-center animate-fade-in">
                                    ✓ Thank you for subscribing to weekly blessings!
                                </p>
                            )}
                        </div>

                        <div className="text-[10px] text-slate-400 text-center font-mono">
                            Strict privacy • Zero spam • Unsubscribe anytime
                        </div>
                    </div>
                </div>

                {/* ANCIENT DIVIDER 2 */}
                <div className="flex items-center justify-center gap-4 text-[#D4AF37]/60 text-xs font-serif">
                    <span className="h-[1px] w-36 bg-gradient-to-r from-transparent to-[#D4AF37]/40" />
                    <span className="inline-flex items-center gap-2">════════ <Star size={14} className="text-[#D4AF37]" /> ════════</span>
                    <span className="h-[1px] w-36 bg-gradient-to-l from-transparent to-[#D4AF37]/40" />
                </div>

                {/* 4. COPYRIGHT & DEVELOPER CREDITS */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2 text-xs font-semibold text-slate-400">
                    <div className="text-center md:text-left space-y-1">
                        <p>© {new Date().getFullYear()} City of Truth Ministries • Valparai Sanctuary</p>
                        <p className="text-[10px] text-slate-500">Tamil Nadu, India • Dedicated to Hebrew Scripture & Covenant Truth</p>
                    </div>

                    {/* Developer Credit */}
                    <div className="text-center md:text-right border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Developed with Prayer</p>
                        <p className="text-sm font-bold text-white mt-0.5">Shaveesh Jeshurun</p>
                        <p className="text-[10px] text-slate-400">City of Truth Ministries</p>
                    </div>
                </div>

            </div>
        </footer>
    );
};
