import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight, BookOpen, MapPin, Globe, Sparkles, MessageSquare, QrCode, Heart, Users, Mountain, Leaf, CloudRain, Video, Sun, Music, FileText, Eye } from 'lucide-react';
import { ViewState, User } from '../../types';
import { MessageFromLeader } from '../MessageFromLeader';
import { LordIconWrapper } from '../LordIconWrapper';
import { DeuteronomyCircleGraphic } from '../DeuteronomyCircleGraphic';
import { PSALM_119_VERSES, PSALM_119_STANZAS } from '../psalm119';

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


export const DailyPsalm119Section: React.FC = () => {
    // Calculate the current verse based on the number of days since epoch, modulo 176
    const todayIndex = Math.floor(Date.now() / 86400000) % 176;
    const todayStanzaIndex = Math.floor(todayIndex / 8);
    const [selectedStanzaIdx, setSelectedStanzaIdx] = useState(todayStanzaIndex);

    const activeStanza = PSALM_119_STANZAS[selectedStanzaIdx];
    const stanzaVerses = PSALM_119_VERSES.slice(activeStanza.start - 1, activeStanza.end);

    return (
        <section className="py-20 bg-gradient-to-br from-brand-950 via-slate-900 to-brand-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
            <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-6xl">
                <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border border-amber-500/20"
                    >
                        <BookOpen size={14} /> Daily Psalm 119 Meditation
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-serif font-black text-white leading-tight"
                    >
                        Psalm 119: All 22 Hebrew Letter Stanzas
                    </motion.h2>

                    <p className="text-slate-300 text-sm md:text-base">
                        Select any of the 22 sacred Hebrew alphabet stanzas to meditate on all 176 verses.
                    </p>
                </div>

                {/* 22 HEBREW LETTER STANZAS CAROUSEL / SELECTOR */}
                <div className="flex flex-nowrap gap-2 overflow-x-auto pb-4 mb-8 hide-scrollbar justify-start md:justify-center">
                    {PSALM_119_STANZAS.map((st, idx) => (
                        <button
                            key={st.letter}
                            onClick={() => setSelectedStanzaIdx(idx)}
                            className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${
                                selectedStanzaIdx === idx
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 scale-105 font-black'
                                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-amber-400/40'
                            }`}
                        >
                            <span className="font-serif text-sm">{st.symbol}</span>
                            <span>{st.letter}</span>
                            <span className="text-[10px] opacity-75 font-mono">v.{st.start}-{st.end}</span>
                            {todayStanzaIndex === idx && (
                                <span className="px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[8px] font-black uppercase">TODAY</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ACTIVE STANZA VERSES DISPLAY CARD */}
                <motion.div
                    key={activeStanza.letter}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/80 border border-amber-500/30 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-md space-y-6"
                >
                    <div className="flex flex-col sm:flex-row items-center justify-between border-b border-amber-500/20 pb-4 gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-serif text-2xl text-amber-300 font-bold">
                                {activeStanza.symbol}
                            </div>
                            <div>
                                <h3 className="font-serif font-bold text-2xl text-white">
                                    Stanza {activeStanza.letter} ({activeStanza.symbol})
                                </h3>
                                <p className="text-xs text-amber-300/80 font-mono">
                                    Psalm 119:{activeStanza.start}–{activeStanza.end}
                                </p>
                            </div>
                        </div>

                        {todayStanzaIndex === selectedStanzaIdx && (
                            <span className="px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                                🌟 Today's Featured Reading
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stanzaVerses.map((verseText, vIdx) => {
                            const verseNum = activeStanza.start + vIdx;
                            const isTodayVerse = todayIndex === verseNum - 1;
                            return (
                                <div
                                    key={verseNum}
                                    className={`p-4 rounded-2xl border transition-all ${
                                        isTodayVerse
                                            ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-400 shadow-md shadow-amber-500/10'
                                            : 'bg-white/5 border-white/10 hover:border-amber-400/30'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono">
                                            Psalm 119:{verseNum}
                                        </span>
                                        {isTodayVerse && (
                                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/30">
                                                Verse of the Day
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-100 text-sm font-serif leading-relaxed italic">
                                        "{verseText}"
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
