import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight, BookOpen, MapPin, Globe, Sparkles, MessageSquare, QrCode, Heart, Users } from 'lucide-react';
import { ViewState, User } from '../types';
import { MessageFromLeader } from './MessageFromLeader';
import { HEBREW_PAGES } from '../hebrewRegistry';

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

export const MinistryHighlights: React.FC<SectionProps> = ({ setView }) => {
    const { name, desc } = useSectionInfo('highlights', 'Our Ministries', 'A Legacy of Service and Faith');
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
                            {name}
                        </motion.div>
                        <h2 className="text-4xl md:text-6xl font-serif font-black text-brand-950 leading-[0.9] tracking-tighter">
                            {desc}
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

export const HebrewPagesPreviewSection: React.FC<SectionProps> = ({ setView }) => {
    const { name, desc } = useSectionInfo('hebrewPages', 'All Page Previews', 'Every Page Preview on Home');
    const navigate = useNavigate();

    type PreviewItem = {
        name: string;
        description: string;
        view?: ViewState;
        href?: string;
    };

    const openPreviewItem = (item: PreviewItem) => {
        if (item.view) {
            setView(item.view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        if (item.href) {
            if (item.href.startsWith('/')) {
                navigate(item.href);
                return;
            }
            window.location.assign(item.href);
        }
    };

    const previewGroups = [
        {
            title: 'Hebrew Content',
            icon: <BookOpen size={18} />,
            wrapperClass: 'bg-gradient-to-br from-brand-50 to-white border-brand-100',
            titleClass: 'text-brand-950',
            actionClass: 'text-brand-600 hover:text-brand-700',
            itemClass: 'border-brand-100 hover:border-brand-300 hover:bg-brand-50/60',
            accentClass: 'text-brand-700',
            ctaView: ViewState.ABOUT,
            items: [
                { name: 'Hebrew Hub', view: ViewState.ABOUT, description: 'Main Hebrew learning landing page' },
                ...HEBREW_PAGES.filter(p => p.type === 'content').map(p => ({
                    name: p.label,
                    view: p.isStandalone ? undefined : p.view,
                    href: p.route,
                    description: p.description
                }))
            ],
        },
        {
            title: 'Hebrew Tools',
            icon: <Sparkles size={18} />,
            wrapperClass: 'bg-gradient-to-br from-amber-50 to-white border-amber-100',
            titleClass: 'text-brand-950',
            actionClass: 'text-amber-700 hover:text-amber-800',
            itemClass: 'border-amber-100 hover:border-amber-300 hover:bg-amber-50/70',
            accentClass: 'text-amber-800',
            ctaView: ViewState.HEBREW_TOOLS,
            items: [
                { name: 'Tools Hub', view: ViewState.HEBREW_TOOLS, description: 'Launch all Hebrew study tools' },
                ...HEBREW_PAGES.filter(p => p.type === 'tools').map(p => ({
                    name: p.label,
                    view: p.view,
                    description: p.description
                }))
            ],
        },
        {
            title: 'Ministry Pages',
            icon: <Globe size={18} />,
            wrapperClass: 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100',
            titleClass: 'text-brand-950',
            actionClass: 'text-emerald-700 hover:text-emerald-800',
            itemClass: 'border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/70',
            accentClass: 'text-emerald-800',
            ctaView: ViewState.MINISTRIES,
            items: [
                { name: 'Home', view: ViewState.HOME, description: 'Return to the main landing page' },
                { name: 'Ministries', view: ViewState.MINISTRIES, description: 'See ministry areas and service focus' },
                { name: 'Pastor Page', view: ViewState.PASTOR, description: 'Meet the shepherd and vision' },
                { name: 'Valparai Sanctuary', view: ViewState.ABOUT_VALPARAI, description: 'Visit the hill-station presence' },
                { name: 'Golden Menorah', view: ViewState.GOLDEN_MENORAH, description: 'Symbolism and sacred design' },
                { name: 'Baruch Hashem', view: ViewState.BARUCH_HASHEM, description: 'Praise-centered visual worship page' },
                { name: 'AI Assistance', view: ViewState.AI, description: 'Ask ministry and Bible questions' },
            ],
        },
        {
            title: 'Connect & Access',
            icon: <Users size={18} />,
            wrapperClass: 'bg-gradient-to-br from-violet-50 to-white border-violet-100',
            titleClass: 'text-brand-950',
            actionClass: 'text-violet-700 hover:text-violet-800',
            itemClass: 'border-violet-100 hover:border-violet-300 hover:bg-violet-50/70',
            accentClass: 'text-violet-800',
            ctaView: ViewState.ID_CARD,
            items: [
                { name: 'Entrust Card', view: ViewState.ID_CARD, description: 'Registration and digital identity card' },
                { name: 'Contact Page', view: ViewState.CONTACT, description: 'Reach the ministry directly' },
                { name: 'Verify ID', view: ViewState.VERIFY_ID, description: 'Member verification portal' },
                { name: 'Login Page', href: '/auth?view=login', description: 'Open member login route' },
                { name: 'Register Page', href: '/auth?view=register', description: 'Open member registration route' },
                { name: 'Forgot ID Page', href: '/auth?view=forgot-id', description: 'Recover your member ID route' },
                { name: 'Admin Dashboard', href: '/admin', description: 'Open protected admin dashboard route' },
            ],
        },
    ];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-14">
                    <span className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
                        <BookOpen size={12} /> {name}
                    </span>
                    <h2 className="mt-5 text-4xl md:text-6xl font-serif font-black text-brand-950 tracking-tight">
                        {desc}
                    </h2>
                    <p className="mt-5 max-w-3xl mx-auto text-slate-500 text-base md:text-lg leading-relaxed">
                        Browse Hebrew content, Hebrew tools, ministry highlights, and community access pages directly from the home section before opening the full page.
                    </p>
                </div>

                <div className="grid xl:grid-cols-2 gap-8">
                    {previewGroups.map((group, groupIndex) => (
                        <motion.div
                            key={group.title}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: groupIndex * 0.08 }}
                            className={`rounded-[2.5rem] border p-8 ${group.wrapperClass}`}
                        >
                            <div className="flex items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-white/80 flex items-center justify-center text-brand-700">
                                        {group.icon}
                                    </div>
                                    <div>
                                        <h3 className={`text-2xl font-bold ${group.titleClass}`}>{group.title}</h3>
                                        <p className="text-xs font-medium text-slate-500 mt-1">Preview the pages available from this section.</p>
                                    </div>
                                </div>
                                <button
                                    id={group.title === 'Hebrew Content' ? 'tour-hebrew-content-open' : group.title === 'Hebrew Tools' ? 'tour-hebrew-tools-open' : undefined}
                                    onClick={() => setView(group.ctaView)}
                                    className={`shrink-0 text-xs font-black uppercase tracking-wider ${group.actionClass}`}
                                >
                                    Open <ArrowRight size={14} className="inline ml-1" />
                                </button>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {group.items.map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => openPreviewItem(item)}
                                        className={`bg-white border rounded-2xl px-4 py-4 text-left transition-all hover:-translate-y-0.5 ${group.itemClass}`}
                                    >
                                        <div className={`text-sm font-black ${group.accentClass}`}>{item.name}</div>
                                        <div className="mt-1 text-xs leading-relaxed text-slate-500">{item.description}</div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

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

                    {/* Baruch Hashem Showcase */}
                    <motion.div 
                        initial={{ opacity: 0, y: 36 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                        className="group relative overflow-hidden rounded-[2rem] border border-amber-200 bg-[#fffaf0] shadow-[0_34px_90px_-52px_rgba(180,83,9,0.4)]"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(251,191,36,0.22),transparent_34%),radial-gradient(circle_at_84%_82%,rgba(248,113,113,0.18),transparent_30%)]" />
                        <div className="relative grid items-center min-h-[340px] lg:grid-cols-[1.5fr_0.5fr]">
                            <div className="relative order-2 h-[280px] lg:h-[320px] max-w-[260px] mx-auto w-full lg:order-2 p-4 sm:p-5 lg:p-6">
                                <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] border-[6px] border-white bg-amber-50 shadow-xl ring-1 ring-amber-100">
                                    <img 
                                        src="/barch_hasem/New folder/ஆத்தும நன்றி பள்ளிகள் wrapper (1).jpg" 
                                        alt="Baruch Hashem Worship" 
                                        className="h-full w-full object-contain transform transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-amber-950/80 via-amber-900/20 to-transparent" />
                                    <div className="absolute inset-3 rounded-xl border border-white/20 pointer-events-none" />
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="mb-3 h-1 w-16 rounded-full bg-orange-400 transition-all duration-500 group-hover:w-32" />
                                        <h3 className="text-3xl font-serif font-black tracking-tight text-white drop-shadow md:text-4xl">Baruch Hashem</h3>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="relative order-1 flex flex-col justify-center px-6 pb-8 pt-6 sm:px-8 lg:px-10 lg:py-8">
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20">
                                        <Sparkles size={24} />
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] border border-amber-200">
                                        <Sparkles size={10} className="text-amber-600" /> Worship
                                    </span>
                                </div>
                                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.25em] text-orange-600">Hebrew Tamil Praise</p>
                                <h4 className="mb-4 text-2xl font-serif font-black leading-tight tracking-tight text-brand-950 md:text-3xl">
                                    A majestic gallery for praise and devotion.
                                </h4>
                                <p className="mb-8 text-base leading-relaxed text-slate-700">
                                    Immerse yourself in divine worship and experience the presence of God through pure praise.
                                </p>
                                <button onClick={() => setView(ViewState.BARUCH_HASHEM)} className="group/btn relative overflow-hidden inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 text-[15px] font-black text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] active:scale-95 sm:w-auto">
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
                                    <span className="relative z-10 flex items-center gap-2">
                                        Visit Baruch Hashem <ArrowRight size={18} className="transition-transform duration-300 group-hover/btn:translate-x-2 group-hover/btn:scale-125" />
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
