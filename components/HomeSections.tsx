import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight, BookOpen, MapPin, Globe, Sparkles, MessageSquare, QrCode, Heart, Users, Mountain, Leaf, CloudRain, Video, Sun, Music, FileText, Eye } from 'lucide-react';
import { ViewState, User } from '../types';
import { MessageFromLeader } from './MessageFromLeader';
import { HEBREW_PAGES } from '../hebrewRegistry';
import { LordIconWrapper } from './LordIconWrapper';
import { DeuteronomyCircleGraphic } from './DeuteronomyCircleGraphic';
import { PSALM_119_VERSES } from './psalm119';

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
        { name: 'Spiritual Gatherings', Icon: Sparkles, color: 'bg-blue-500' },
        { name: 'Youth Ministry', Icon: Star, color: 'bg-amber-500' },
        { name: 'Community Impact', Icon: Users, color: 'bg-green-500' },
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
                                <m.Icon size={28} className="text-white" />
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

            {/* Deuteronomy 4:35 Circular Sacred Graphic Section */}
            <div className="mt-16 container mx-auto px-6">
                <div className="bg-gradient-to-br from-amber-500/10 via-yellow-50/50 to-orange-50/30 rounded-[3rem] p-8 md:p-12 border-2 border-amber-300/60 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="max-w-xl space-y-4 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-amber-300">
                            📜 Sacred Truth Scripture
                        </div>
                        <h3 className="text-3xl md:text-5xl font-serif font-black text-slate-900 leading-tight">
                            EIN OD MIL'VADO <br />
                            <span className="text-amber-700">אין עוד מלבדו</span>
                        </h3>
                        <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                            "You have been shown these things to know that Yahweh He is God; there is nothing besides Him." — Deuteronomy 4:35. Discover the foundational truth of our faith and study the sacred Hebrew Scriptures.
                        </p>
                        <button
                            onClick={() => setView(ViewState.HEBREW)}
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-600/30 cursor-pointer active:scale-95"
                        >
                            Explore Hebrew Language & Study →
                        </button>
                    </div>

                    <div className="shrink-0">
                        <DeuteronomyCircleGraphic size={300} />
                    </div>
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
    const { name, desc } = useSectionInfo('hebrewPages', 'Pages', 'Manage all dynamic pages with visibility controls.');
    const navigate = useNavigate();

    const ALL_PAGES = [
        // Hebrew Content
        { id: 'HEBREW', label: 'Hebrew Hub', category: 'Hebrew Content', desc: 'Main Hebrew learning landing page' },
        { id: 'HEBREW_WORDS', label: 'Hebrew Words', category: 'Hebrew Content', desc: 'Interactive word explorer' },
        { id: 'HEBREW_LETTERS_AUDIO', label: 'Hebrew Letters Audio', category: 'Hebrew Content', desc: 'Pronunciation guide' },
        { id: 'HEBREW_GEMATRIA', label: 'Gematria Calculator', category: 'Hebrew Content', desc: 'Numerical value finder' },
        { id: 'HEBREW_FESTIVALS', label: 'Festivals', category: 'Hebrew Content', desc: 'Sacred calendar events' },
        { id: 'HEBREW_GRAMMAR', label: 'Grammar Guide', category: 'Hebrew Content', desc: 'Language structure lessons' },
        { id: 'HEBREW_REFERENCE', label: 'Quick Reference', category: 'Hebrew Content', desc: 'Essential resources' },
        { id: 'HEBREW_ISRAEL', label: 'Israel Guide', category: 'Hebrew Content', desc: 'Geographic & cultural info' },
        { id: 'PDF_DOWNLOADS', label: 'Download PDFs', category: 'Hebrew Content', desc: 'Resource PDFs & documents' },
        // Hebrew Tools
        { id: 'HEBREW_TOOLS', label: 'Tools Hub', category: 'Hebrew Tools', desc: 'Launch all Hebrew study tools' },
        { id: 'HEBREW_CALENDAR', label: 'Hebrew Calendar', category: 'Hebrew Tools', desc: 'Sacred calendar view' },
        { id: 'HEBREW_CLOCK', label: 'Hebrew Clock', category: 'Hebrew Tools', desc: 'Time display converter' },
        { id: 'HEBREW_NUMBERS', label: 'Hebrew Numbers', category: 'Hebrew Tools', desc: 'Numeric system converter' },
        // Ministry Pages
        { id: 'HOME', label: 'Home', category: 'Ministry Pages', desc: 'Main landing page' },
        { id: 'MINISTRIES', label: 'Ministries', category: 'Ministry Pages', desc: 'Service focus & areas' },
        { id: 'PASTOR', label: 'Pastor Page', category: 'Ministry Pages', desc: 'Meet the shepherd' },
        { id: 'ABOUT_VALPARAI', label: 'Valparai Sanctuary', category: 'Ministry Pages', desc: 'Hill-station presence' },
        { id: 'GOLDEN_MENORAH', label: 'Golden Menorah', category: 'Ministry Pages', desc: 'Sacred design & symbolism' },
        { id: 'BARUCH_HASHEM', label: 'Baruch Hashem', category: 'Ministry Pages', desc: 'Praise-centered worship' },
        { id: 'AI', label: 'AI Assistance', category: 'Ministry Pages', desc: 'Divine Assistant Q&A' },
        // Other Pages
        { id: 'ABOUT', label: 'About', category: 'Other Pages', desc: 'Organization information' },
        { id: 'MENORAH', label: 'Menorah', category: 'Other Pages', desc: 'Menorah visualization' },
        { id: 'MENORAH_FLAG', label: 'Menorah Flag', category: 'Other Pages', desc: 'Flag design view' },
        { id: 'DEVELOPER', label: 'Developer', category: 'Other Pages', desc: 'Development info' },
        { id: 'BUGS_FIXED', label: 'Bugs Fixed', category: 'Other Pages', desc: 'Changelog & fixes' },
    ];

    const handleOpenPage = (pageId: string) => {
        const pageMap: Record<string, ViewState | string> = {
            'HEBREW': ViewState.HEBREW,
            'HEBREW_WORDS': ViewState.HEBREW_WORDS,
            'HEBREW_LETTERS_AUDIO': ViewState.HEBREW_LETTERS_AUDIO,
            'HEBREW_GEMATRIA': ViewState.HEBREW_GEMATRIA,
            'HEBREW_FESTIVALS': ViewState.HEBREW_FESTIVALS,
            'HEBREW_GRAMMAR': ViewState.HEBREW_GRAMMAR,
            'HEBREW_REFERENCE': ViewState.HEBREW_REFERENCE,
            'HEBREW_ISRAEL': ViewState.HEBREW_ISRAEL,
            'HEBREW_TOOLS': ViewState.HEBREW_TOOLS,
            'HEBREW_CALENDAR': ViewState.HEBREW_CALENDAR,
            'HEBREW_CLOCK': ViewState.HEBREW_CLOCK,
            'HEBREW_NUMBERS': ViewState.HEBREW_NUMBERS,
            'HOME': ViewState.HOME,
            'MINISTRIES': ViewState.MINISTRIES,
            'PASTOR': ViewState.PASTOR,
            'ABOUT_VALPARAI': ViewState.ABOUT_VALPARAI,
            'GOLDEN_MENORAH': ViewState.GOLDEN_MENORAH,
            'BARUCH_HASHEM': ViewState.BARUCH_HASHEM,
            'AI': ViewState.AI,
            'ID_CARD': ViewState.ID_CARD,
            'CONTACT': ViewState.CONTACT,
            'VERIFY_ID': ViewState.VERIFY_ID,
        };

        const target = pageMap[pageId];
        if (target && typeof target === 'string') {
            setView(target as ViewState);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const categoryStyles = {
        'Hebrew Content': {
            wrapperClass: 'bg-gradient-to-br from-brand-50 to-white border-brand-100',
            headerClass: 'bg-gradient-to-r from-brand-600 to-brand-700',
            icon: <BookOpen size={24} />,
            iconColor: 'text-white',
            badge: 'bg-brand-100 text-brand-700',
            linkColor: 'text-slate-900 group-hover:text-brand-600',
            descColor: 'text-slate-500',
        },
        'Hebrew Tools': {
            wrapperClass: 'bg-gradient-to-br from-amber-50 to-white border-amber-100',
            headerClass: 'bg-gradient-to-r from-amber-600 to-amber-700',
            icon: <Sparkles size={24} />,
            iconColor: 'text-white',
            badge: 'bg-amber-100 text-amber-700',
            linkColor: 'text-slate-900 group-hover:text-amber-600',
            descColor: 'text-slate-500',
        },
        'Ministry Pages': {
            wrapperClass: 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100',
            headerClass: 'bg-gradient-to-r from-emerald-600 to-emerald-700',
            icon: <Globe size={24} />,
            iconColor: 'text-white',
            badge: 'bg-emerald-100 text-emerald-700',
            linkColor: 'text-slate-900 group-hover:text-emerald-600',
            descColor: 'text-slate-500',
        },

        'Other Pages': {
            wrapperClass: 'bg-gradient-to-br from-orange-50 to-white border-orange-100',
            headerClass: 'bg-gradient-to-r from-orange-600 to-orange-700',
            icon: <FileText size={24} />,
            iconColor: 'text-white',
            badge: 'bg-orange-100 text-orange-700',
            linkColor: 'text-slate-900 group-hover:text-orange-600',
            descColor: 'text-slate-500',
        }
    };

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
                        <Eye size={12} /> {name}
                    </span>
                    <h2 className="mt-5 text-4xl md:text-6xl font-serif font-black text-brand-950 tracking-tight">
                        {desc}
                    </h2>
                    <p className="mt-5 max-w-3xl mx-auto text-slate-500 text-base md:text-lg leading-relaxed">
                        Browse all {ALL_PAGES.length} pages organized by category. Click any page to explore the full content.
                    </p>
                </div>

                {/* Page Groups Grid */}
                <div className="grid xl:grid-cols-2 gap-6 mb-12">
                    {['Hebrew Content', 'Hebrew Tools', 'Ministry Pages', 'Other Pages'].map((category, catIdx) => {
                        const categoryPages = ALL_PAGES.filter(p => p.category === category);
                        const styles = categoryStyles[category as keyof typeof categoryStyles];

                        return (
                            <motion.div
                                key={category}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: catIdx * 0.08 }}
                                className="rounded-2xl border border-slate-200 shadow-md bg-white overflow-hidden"
                            >
                                {/* Category Header — matches live site style */}
                                <div className={`${styles.headerClass} px-6 py-5 flex items-center justify-between`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <div className={styles.iconColor}>{styles.icon}</div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white leading-tight">{category}</h3>
                                            <p className="text-white/70 text-xs">Preview the pages available from this section.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleOpenPage(categoryPages[0]?.id)}
                                        className="flex items-center gap-1 text-white/90 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                                    >
                                        OPEN <span className="text-base">→</span>
                                    </button>
                                </div>

                                {/* Pages as plain text links — matches live site */}
                                <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-4">
                                    {categoryPages.map((page) => (
                                        <button
                                            key={page.id}
                                            onClick={() => handleOpenPage(page.id)}
                                            className="text-left group"
                                        >
                                            <p className={`font-semibold text-sm transition-colors ${styles.linkColor}`}>{page.label}</p>
                                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{page.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export const DailyPsalm119Section: React.FC = () => {
    // Calculate the current verse based on the number of days since epoch, modulo 176
    const todayIndex = Math.floor(Date.now() / 86400000) % 176;
    const currentVerse = PSALM_119_VERSES[todayIndex];

    return (
        <section className="py-20 bg-gradient-to-br from-brand-950 to-brand-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-6 border border-amber-500/20"
                    >
                        <BookOpen size={14} /> Daily Psalm 119
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-serif font-black text-white leading-tight mb-8"
                    >
                        Verse {todayIndex + 1}
                    </motion.h2>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 border border-amber-500/30 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-sm"
                    >
                        <p className="text-xl md:text-3xl text-amber-100 font-serif leading-relaxed italic">
                            "{currentVerse}"
                        </p>
                    </motion.div>
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

                    {/* Baruch Hashem Showcase - ENLARGED */}
                    <motion.div 
                        initial={{ opacity: 0, y: 36 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                        className="group relative overflow-hidden rounded-[2.5rem] border border-amber-200 bg-[#fffaf0] shadow-[0_34px_90px_-52px_rgba(180,83,9,0.4)]"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(251,191,36,0.22),transparent_34%),radial-gradient(circle_at_84%_82%,rgba(248,113,113,0.18),transparent_30%)]" />
                        <div className="relative grid items-center min-h-[500px] lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-10">
                            <div className="relative order-2 h-[420px] lg:h-[500px] max-w-[420px] mx-auto w-full lg:order-2 p-5 sm:p-6 lg:p-8">
                                <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] border-[8px] border-white bg-amber-50 shadow-2xl ring-1 ring-amber-100">
                                    <img 
                                        src="/barch_hasem/New folder/ஆத்தும நன்றி பள்ளிகள் wrapper (1).jpg" 
                                        alt="Baruch Hashem Worship" 
                                        className="h-full w-full object-contain transform transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-amber-950/80 via-amber-900/20 to-transparent" />
                                    <div className="absolute inset-3 rounded-xl border border-white/20 pointer-events-none" />
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="mb-3 h-1.5 w-20 rounded-full bg-orange-400 transition-all duration-500 group-hover:w-40" />
                                        <h3 className="text-4xl font-serif font-black tracking-tight text-white drop-shadow md:text-5xl">Baruch Hashem</h3>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="relative order-1 flex flex-col justify-center px-6 pb-10 pt-8 sm:px-10 lg:px-14 lg:py-12">
                                <div className="mb-10 flex items-center justify-between">
                                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20">
                                        <Sparkles size={36} />
                                    </div>
                                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-800 px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] border border-amber-200">
                                        <Sparkles size={13} className="text-amber-600" /> Worship
                                    </span>
                                </div>
                                <p className="mb-5 text-sm font-black uppercase tracking-[0.25em] text-orange-600">Hebrew Tamil Praise</p>
                                <h4 className="mb-7 text-4xl font-serif font-black leading-tight tracking-tight text-brand-950 md:text-5xl">
                                    A majestic gallery for praise and devotion.
                                </h4>
                                <p className="mb-12 text-lg leading-relaxed text-slate-700">
                                    Immerse yourself in divine worship and experience the presence of God through pure praise.
                                </p>
                                <button onClick={() => setView(ViewState.BARUCH_HASHEM)} className="group/btn relative overflow-hidden inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-10 py-6 text-lg font-black text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] active:scale-95 sm:w-auto">
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
                                    <span className="relative z-10 flex items-center gap-2">
                                        Visit Baruch Hashem <ArrowRight size={20} className="transition-transform duration-300 group-hover/btn:translate-x-2 group-hover/btn:scale-125" />
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
        <section className="py-32 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-950 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-15 bg-[url('https://images.unsplash.com/photo-1542332213-31f87348057f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-accent-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
            <div className="absolute -bottom-32 right-20 w-96 h-96 bg-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 bg-white/10 text-white px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.25em] border border-accent-400/30 backdrop-blur-sm"
                        >
                            <MapPin size={14} className="text-accent-400" />
                            வால்பாறை புனிதத்தளம்
                        </motion.div>

                        <div className="space-y-6">
                            <h2 className="text-6xl md:text-7xl font-serif font-black text-white leading-[1.1] tracking-tight">
                                வால்பாறைப் <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-accent-300 to-accent-200">சரணம்</span>
                            </h2>
                            
                            <p className="text-lg text-white/70 font-light leading-relaxed max-w-2xl">
                                மூடுபனிப் புரவலஞ்சாலைகளுக்கு இடையே தனிமையாய் இருக்கும் எமது ஆன்மீக வாழ்க்கையின் மூலம் ஆண்டவரின் சரணத்தை அவிழ்ந்தெடுங்கள். இங்கு இயற்கையும் வழிபாடும் ஐக்கியமாய் திருமண்ணின் வேதத்தை கண்டறியங்கள்.
                            </p>

                            <div className="grid grid-cols-3 gap-4 pt-4">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-gradient-to-br from-white/10 to-white/5 border border-accent-400/30 rounded-2xl p-4 text-center backdrop-blur-md shadow-[0_0_15px_rgba(251,191,36,0.1)] relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-accent-400/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500"></div>
                                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-accent-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg relative z-10">
                                        <Mountain size={24} className="text-white drop-shadow-md" />
                                    </div>
                                    <p className="text-xs font-black text-white uppercase tracking-wider relative z-10 drop-shadow-sm">மலைக் கூடம்</p>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-gradient-to-br from-white/10 to-white/5 border border-emerald-400/30 rounded-2xl p-4 text-center backdrop-blur-md shadow-[0_0_15px_rgba(52,211,153,0.1)] relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500"></div>
                                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-lg relative z-10">
                                        <Leaf size={24} className="text-white drop-shadow-md" />
                                    </div>
                                    <p className="text-xs font-black text-white uppercase tracking-wider relative z-10 drop-shadow-sm">பசுமை நிலம்</p>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-gradient-to-br from-white/10 to-white/5 border border-cyan-400/30 rounded-2xl p-4 text-center backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.1)] relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500"></div>
                                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg relative z-10">
                                        <CloudRain size={24} className="text-white drop-shadow-md" />
                                    </div>
                                    <p className="text-xs font-black text-white uppercase tracking-wider relative z-10 drop-shadow-sm">பொழில் சோலை</p>
                                </motion.div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setView(ViewState.ABOUT_VALPARAI)}
                                className="group flex items-center justify-center gap-3 bg-gradient-to-r from-accent-400 to-accent-300 text-brand-950 px-10 py-4 rounded-full font-black text-sm hover:shadow-2xl hover:shadow-accent-400/50 transition-all uppercase tracking-widest"
                            >
                                புனிதத்தளத்திற்குச் செல்லுங்கள்
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group flex items-center justify-center gap-2 border-2 border-white/30 text-white px-10 py-4 rounded-full font-bold text-sm hover:border-accent-400 hover:bg-white/10 transition-all uppercase tracking-wide"
                            >
                                <Video size={18} />
                                பிரசாரங்கள்
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Right Visual Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-accent-400/20 rounded-3xl p-8 backdrop-blur-xl">
                            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                                <Sparkles size={20} className="text-accent-400" />
                                பரிசுத்த அனுபவங்கள்
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { icon: Sun, color: 'text-amber-400', title: 'நாள்தோறும் ஆராதனை', desc: 'சூரியோதயத்திலும் மாலையிலும்' },
                                    { icon: BookOpen, color: 'text-blue-400', title: 'வேத அத்யயனம்', desc: 'ஆண்டவரின் திருவாக்கைக் கேளுங்கள்' },
                                    { icon: Music, color: 'text-pink-400', title: 'ஆன்மீக பாடல்கள்', desc: 'நிலைத்த மெய்நிலை அனுபவங்கள்' },
                                    { icon: Users, color: 'text-emerald-400', title: 'சமுதாய சேவை', desc: 'ஒன்றாய் பணிபுரியும் குடும்பம்' }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex gap-4 items-start p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-accent-400/30 transition-all group"
                                    >
                                        <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all ${item.color}`}>
                                            <item.icon size={24} />
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <h4 className="text-white font-bold text-sm mb-1">{item.title}</h4>
                                            <p className="text-white/60 text-xs leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <motion.div
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="bg-gradient-to-br from-accent-400/20 to-transparent border border-accent-400/30 rounded-2xl p-6 text-center backdrop-blur-sm"
                            >
                                <p className="text-3xl font-black text-accent-300 mb-2">200+</p>
                                <p className="text-white/60 text-xs font-bold uppercase tracking-wide">குடும்பங்கள்</p>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="bg-gradient-to-br from-accent-400/20 to-transparent border border-accent-400/30 rounded-2xl p-6 text-center backdrop-blur-sm"
                            >
                                <p className="text-3xl font-black text-accent-300 mb-2">{new Date().getFullYear() - 2009} வருஷ்</p>
                                <p className="text-white/60 text-xs font-bold uppercase tracking-wide">சேவை கதை</p>
                            </motion.div>
                        </div>
                    </motion.div>
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
