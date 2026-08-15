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

const PSALM_119_STANZAS = [
    { letter: 'Aleph', symbol: 'א', start: 1, end: 8 },
    { letter: 'Bet', symbol: 'ב', start: 9, end: 16 },
    { letter: 'Gimel', symbol: 'ג', start: 17, end: 24 },
    { letter: 'Dalet', symbol: 'ד', start: 25, end: 32 },
    { letter: 'He', symbol: 'ה', start: 33, end: 40 },
    { letter: 'Vav', symbol: 'ו', start: 41, end: 48 },
    { letter: 'Zayin', symbol: 'ז', start: 49, end: 56 },
    { letter: 'Chet', symbol: 'ח', start: 57, end: 64 },
    { letter: 'Tet', symbol: 'ט', start: 65, end: 72 },
    { letter: 'Yod', symbol: 'י', start: 73, end: 80 },
    { letter: 'Kaf', symbol: 'כ', start: 81, end: 88 },
    { letter: 'Lamed', symbol: 'ל', start: 89, end: 96 },
    { letter: 'Mem', symbol: 'מ', start: 97, end: 104 },
    { letter: 'Nun', symbol: 'נ', start: 105, end: 112 },
    { letter: 'Samekh', symbol: 'ס', start: 113, end: 120 },
    { letter: 'Ayin', symbol: 'ע', start: 121, end: 128 },
    { letter: 'Pe', symbol: 'פ', start: 129, end: 136 },
    { letter: 'Tsade', symbol: 'צ', start: 137, end: 144 },
    { letter: 'Qoph', symbol: 'ק', start: 145, end: 152 },
    { letter: 'Resh', symbol: 'ר', start: 153, end: 160 },
    { letter: 'Shin', symbol: 'ש', start: 161, end: 168 },
    { letter: 'Tav', symbol: 'ת', start: 169, end: 176 },
];
