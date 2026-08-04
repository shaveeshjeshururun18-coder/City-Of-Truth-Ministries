import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    BookOpen, Calendar, Clock, Download, Loader2, Mic, Sparkles, Star, Volume2,
} from 'lucide-react';
import { HEBREW_MONTH_ICONS } from './icons/modernIcons';
import { motion } from 'framer-motion';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { HEBREW_MONTHS_DATA, KEY_DETAILS } from './PrintableReferenceGuide';
import { audioService } from '../services/audioService';

const HEBREW_DAYS = [
    { name: 'Yom Rishon', english: 'Sunday', hebrew: 'יוֹם רִאשׁוֹן', tamil: 'யோம் ரிஷோன் (ஞாயிறு)', psalm: 'Ps. 24' },
    { name: 'Yom Sheni', english: 'Monday', hebrew: 'יוֹם שֵׁנִי', tamil: 'யோம் ஷேனி (திங்கள்)', psalm: 'Ps. 48' },
    { name: 'Yom Shlishi', english: 'Tuesday', hebrew: 'יוֹם שְׁלִישִׁי', tamil: 'யோம் ஷ்லிஷி (செவ்வாய்)', psalm: 'Ps. 82' },
    { name: 'Yom Revi\'i', english: 'Wednesday', hebrew: 'יוֹם רְבִיעִי', tamil: 'யோம் ரெவிஈ (புதன்)', psalm: 'Ps. 94' },
    { name: 'Yom Chamishi', english: 'Thursday', hebrew: 'יוֹם חֲמִישִׁי', tamil: 'யோம் ஹாமிஷி (வியாழன்)', psalm: 'Ps. 81' },
    { name: 'Yom Shishi', english: 'Friday', hebrew: 'יוֹם שִׁשִׁי', tamil: 'யோம் ஷிஷி (வெள்ளி)', psalm: 'Ps. 93' },
    { name: 'Shabbat', english: 'Saturday', hebrew: 'שַׁבָּת', tamil: 'ஷப்பாத் (சனி)', psalm: 'Ps. 92' },
];


const DETAIL_ICONS = [Calendar, Clock] as const;

const captureNodeToJpeg = async (
    sourceNode: HTMLElement,
    options: { backgroundColor: string; width?: number }
) => {
    const wrapper = document.createElement('div');
    const clone = sourceNode.cloneNode(true) as HTMLElement;
    const sourceRect = sourceNode.getBoundingClientRect();
    const targetWidth = options.width || Math.max(640, Math.ceil(sourceRect.width) || 640);

    wrapper.style.position = 'fixed';
    wrapper.style.left = '0';
    wrapper.style.top = '0';
    wrapper.style.opacity = '0';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.zIndex = '-1';
    wrapper.style.background = options.backgroundColor;
    wrapper.style.width = `${targetWidth}px`;
    wrapper.style.margin = '0';
    wrapper.style.padding = '0';

    clone.style.position = 'relative';
    clone.style.left = '0';
    clone.style.top = '0';
    clone.style.width = `${targetWidth}px`;
    clone.style.margin = '0';

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
        if ('fonts' in document) {
            await (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
        }
        await new Promise(resolve => setTimeout(resolve, 150));
        const pixelRatio = Math.min(2.5, Math.max(1.5, window.devicePixelRatio || 1));
        return await toJpeg(clone, {
            quality: 0.98,
            pixelRatio,
            backgroundColor: options.backgroundColor,
            cacheBust: true,
        });
    } finally {
        document.body.removeChild(wrapper);
    }
};

const StarWatermark = () => (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden>
        <span className="absolute -right-3 -bottom-3 text-5xl opacity-[0.05] select-none">✡</span>
    </div>
);

const FestivalBadge: React.FC<{ label: string }> = ({ label }) => (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#5B7F2A]/12 text-[#5B7F2A] border border-[#5B7F2A]/25">
        <Star size={9} className="fill-[#D4AF37] text-[#D4AF37]" />
        {label}
    </span>
);

export const HebrewCalendarGuide: React.FC = () => {
    const exportMonthsRef = useRef<HTMLDivElement>(null);
    const monthRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [isExportingMonths, setIsExportingMonths] = useState(false);
    const [activeMonth, setActiveMonth] = useState(0);

    useEffect(() => {
        const observers: IntersectionObserver[] = [];
        monthRefs.current.forEach((el, index) => {
            if (!el) return;
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) setActiveMonth(index);
                },
                { rootMargin: '-40% 0px -40% 0px', threshold: 0.1 }
            );
            observer.observe(el);
            observers.push(observer);
        });
        return () => observers.forEach(o => o.disconnect());
    }, []);

    const scrollToSection = useCallback((id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    const handleDownloadMonthsPDF = async () => {
        if (!exportMonthsRef.current) return;
        setIsExportingMonths(true);
        try {
            const dataUrl = await captureNodeToJpeg(exportMonthsRef.current, { backgroundColor: '#0f0c29', width: 900 });
            const img = new Image();
            img.src = dataUrl;
            await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(); });
            const A4_W = 210;
            const pdfH = (img.height * A4_W) / img.width;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [A4_W, pdfH] });
            pdf.addImage(dataUrl, 'JPEG', 0, 0, A4_W, pdfH);
            pdf.save('COT-Hebrew-Months-Days.pdf');
        } catch (e) {
            console.error(e);
            alert('Export failed, please try again.');
        } finally {
            setIsExportingMonths(false);
        }
    };

    return (
        <div className="relative pb-24">
            {/* Hidden PDF export */}
            <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1, pointerEvents: 'none' }}>
                <div ref={exportMonthsRef} style={{ width: '900px', background: 'linear-gradient(135deg, #0f0c29 0%, #1a1450 50%, #0f0c29 100%)', padding: '48px', fontFamily: 'Georgia, serif', color: '#fff', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 900, color: '#f0c040', textTransform: 'uppercase', letterSpacing: '0.06em' }}>City of Truth Ministries</div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Valparai · India</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '20px', fontWeight: 900, color: '#f0c040' }}>Hebrew Months & Days</div>
                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>எபிரேய மாதங்கள் மற்றும் நாட்கள்</div>
                        </div>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#f0c040', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>Months · மாதங்கள்</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                            {HEBREW_MONTHS_DATA.map((m, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 900, color: '#f0c040' }}>{(i + 1).toString().padStart(2, '0')}. {m.name}</div>
                                    <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', direction: 'rtl', margin: '4px 0' }}>{m.hebrewScript}</div>
                                    <div style={{ fontSize: '11px', color: '#93c5fd', marginBottom: '4px' }}>{m.tamil}</div>
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{m.gregorian}</div>
                                    {m.holidays && <div style={{ fontSize: '9px', color: '#fde68a', marginTop: '4px' }}>{m.holidays}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#f0c040', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>Days of the Week · வாரத்தின் நாட்கள்</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr', gap: '8px' }}>
                            {HEBREW_DAYS.map((d, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '10px', padding: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ fontSize: '16px', color: '#a78bfa', direction: 'rtl', marginBottom: '4px' }}>{d.hebrew}</div>
                                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#f0c040' }}>{d.name}</div>
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{d.english}</div>
                                    <div style={{ fontSize: '10px', color: '#93c5fd', marginTop: '3px' }}>{d.tamil}</div>
                                    <div style={{ fontSize: '10px', color: '#86efac', marginTop: '3px', fontWeight: 'bold' }}>{d.psalm}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                        <span>© {new Date().getFullYear()} City of Truth Ministries · All rights reserved</span>
                        <span>+91 8056125478 · city-of-truth-ministries.vercel.app</span>
                    </div>
                </div>
            </div>

            {/* Header */}
            <header id="guide-header" className="text-center mb-8 md:mb-10">
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E3A8A]/8 text-[#1E3A8A] text-[10px] font-black uppercase tracking-[0.2em] mb-3"
                >
                    <BookOpen size={12} /> Biblical Reference
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="text-3xl md:text-4xl font-serif font-bold text-[#1E3A8A] mb-1"
                >
                    Hebrew Biblical Calendar
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm text-slate-500 font-medium"
                >
                    12 Scriptural Months · எபிரேய மாதங்கள்
                </motion.p>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-1.5 mt-5 mb-4" aria-label="Month progress">
                    {HEBREW_MONTHS_DATA.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => monthRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                            className={`rounded-full transition-all duration-300 ${
                                i === activeMonth
                                    ? 'w-3 h-3 bg-[#D4AF37] shadow-sm shadow-[#D4AF37]/40'
                                    : i < activeMonth
                                        ? 'w-2 h-2 bg-[#1E3A8A]'
                                        : 'w-2 h-2 bg-slate-200'
                            }`}
                            aria-label={`Month ${i + 1}`}
                        />
                    ))}
                </div>

                {/* Download — below heading on mobile, inline on desktop */}
                <button
                    onClick={handleDownloadMonthsPDF}
                    disabled={isExportingMonths}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#1e40af] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                    {isExportingMonths ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                    Download PDF
                </button>
            </header>

            {/* Months timeline */}
            <section id="guide-months" className="relative mb-10 md:mb-12">
                <div className="hidden md:block absolute left-[27px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#D4AF37]/60 via-[#1E3A8A]/30 to-[#D4AF37]/60" />

                <div className="space-y-3 md:space-y-3.5">
                    {HEBREW_MONTHS_DATA.map((m, i) => (
                        <motion.div
                            key={m.name}
                            ref={el => { monthRefs.current[i] = el; }}
                            initial={{ opacity: 0, y: 16, scale: 0.97 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.15, delay: (i % 3) * 0.05 }}
                            className="relative md:pl-14"
                        >
                            {/* Timeline dot */}
                            <div className={`hidden md:flex absolute left-0 top-5 w-14 items-center justify-center`}>
                                <div className={`w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                                    i === activeMonth
                                        ? 'bg-[#D4AF37] border-[#D4AF37] shadow-md shadow-[#D4AF37]/30'
                                        : 'bg-[#FCFAF4] border-[#1E3A8A]/40'
                                }`} />
                            </div>

                            <article className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                                i === activeMonth
                                    ? 'border-[#D4AF37]/50 shadow-md shadow-[#D4AF37]/10'
                                    : 'border-[#D4AF37]/15 hover:border-[#D4AF37]/30 hover:shadow-sm'
                            } bg-gradient-to-br from-[#FFFDF8] via-[#FCFAF4] to-[#F5F0E6] p-3.5 md:p-4`}>
                                <StarWatermark />

                                <div className="relative flex items-start gap-3">
                                    {/* Month number badge */}
                                    <div className="shrink-0 flex flex-col items-center gap-0.5">
                                        <div className="w-11 h-11 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex flex-col items-center justify-center">
                                            {(() => { const MonthIcon = HEBREW_MONTH_ICONS[i]; return <MonthIcon size={11} className="text-[#D4AF37]" />; })()}
                                            <span className="text-xs font-black text-[#1E3A8A] leading-tight">{(i + 1).toString().padStart(2, '0')}</span>
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-[#D4AF37]/80 hidden sm:block">
                                            {m.name.slice(0, 5)}
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div>
                                                <h3 className="text-2xl font-bold text-[#1E3A8A] leading-tight">{m.name}</h3>
                                                <p className="text-lg font-serif text-[#1E3A8A]/80 leading-snug" dir="rtl">{m.hebrewScript}</p>
                                                <p className="text-[17px] font-semibold text-slate-600">{m.tamil}</p>
                                            </div>
                                        </div>

                                        <p className="text-[11px] font-black uppercase tracking-[0.15em] text-orange-600/90 mt-1.5">
                                            {m.gregorian.replace('/', ' • ')}
                                        </p>

                                        {m.holidays && (
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {m.holidays.split(/,\s*(?=[A-Z(])/).map(part => (
                                                    <FestivalBadge key={part} label={part.trim()} />
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400">
                                            <Calendar size={10} className="text-[#1E3A8A]/50" />
                                            <span className="italic">{m.notes}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-2.5">
                                            <button
                                                type="button"
                                                onClick={() => audioService.playHebrew(m.hebrewScript || m.name)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1E3A8A]/8 text-[#1E3A8A] text-[10px] font-bold hover:bg-[#1E3A8A]/15 transition-colors"
                                            >
                                                <Mic size={11} /> Hebrew
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => audioService.playTamil(m.tamil)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold hover:bg-blue-100 transition-colors"
                                            >
                                                <Volume2 size={11} /> Tamil
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Key Scriptural Details */}
            <section id="guide-details" className="mb-10 md:mb-12">
                <h3 className="text-xl font-serif font-bold text-[#1E3A8A] mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-[#D4AF37]" /> Key Scriptural Events
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                    {KEY_DETAILS.map((d, i) => (
                        <motion.div
                            key={d.title}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                            className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-br from-[#FFFDF8] to-[#F5F0E6] p-4"
                        >
                            <StarWatermark />
                            <div className="relative flex items-start gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 flex items-center justify-center text-[#1E3A8A] shrink-0">
                                    {i === 0 ? <Calendar size={18} /> : <Clock size={18} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#5B7F2A] text-sm mb-1">{d.title}</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">{d.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Sacred Days */}
            <section id="guide-sacred-days">
                <h3 className="text-xl font-serif font-bold text-[#1E3A8A] mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-[#1E3A8A]" /> Sacred Days
                    <span className="text-sm font-normal text-slate-400">· வாரத்தின் நாட்கள்</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {HEBREW_DAYS.map((day, i) => (
                        <motion.div
                            key={day.name}
                            initial={{ opacity: 0, y: 12, scale: 0.97 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.15, delay: (i % 4) * 0.04 }}
                            className={`relative overflow-hidden rounded-2xl border p-3.5 transition-all hover:shadow-md ${
                                i === 6
                                    ? 'border-[#D4AF37]/40 bg-gradient-to-br from-[#1E3A8A] to-[#1e3a6e] text-white'
                                    : 'border-[#D4AF37]/15 bg-gradient-to-br from-[#FFFDF8] to-[#FCFAF4]'
                            }`}
                        >
                            {i !== 6 && <StarWatermark />}
                            <div className="relative">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${i === 6 ? 'text-[#D4AF37]' : 'text-[#1E3A8A]/60'}`}>
                                        Day {i + 1}
                                    </span>
                                    {i === 6 && <Star size={12} className="text-[#D4AF37]" />}
                                </div>
                                <h4 className={`text-base font-bold leading-tight ${i === 6 ? 'text-white' : 'text-[#1E3A8A]'}`}>{day.name}</h4>
                                <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${i === 6 ? 'text-white/60' : 'text-slate-400'}`}>{day.english}</p>
                                <p className={`text-xs font-semibold mt-1 ${i === 6 ? 'text-blue-200' : 'text-blue-600'}`}>{day.tamil}</p>
                                <div className={`flex items-center gap-1 mt-2 text-[10px] font-bold ${i === 6 ? 'text-[#D4AF37]' : 'text-[#5B7F2A]'}`}>
                                    <BookOpen size={10} /> {day.psalm}
                                </div>
                                <p className={`text-2xl font-serif mt-2 pt-2 border-t ${i === 6 ? 'border-white/20 text-[#D4AF37]' : 'border-[#D4AF37]/10 text-[#1E3A8A]/70'}`} dir="rtl">{day.hebrew}</p>
                                <div className="flex gap-1.5 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => audioService.playHebrew(day.hebrew)}
                                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[9px] font-bold transition-colors ${
                                            i === 6 ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-[#1E3A8A]/8 text-[#1E3A8A] hover:bg-[#1E3A8A]/15'
                                        }`}
                                    >
                                        <Mic size={9} /> HE
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => audioService.playTamil(day.tamil)}
                                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[9px] font-bold transition-colors ${
                                            i === 6 ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                        }`}
                                    >
                                        <Volume2 size={9} /> TA
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Floating bottom navigation */}
            <nav className="fixed bottom-[72px] md:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 px-2 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#D4AF37]/25 shadow-lg shadow-[#1E3A8A]/10">
                {[
                    { id: 'guide-months', label: 'Months' },
                    { id: 'guide-details', label: 'Events' },
                    { id: 'guide-sacred-days', label: 'Days' },
                ].map(item => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => scrollToSection(item.id)}
                        className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#1E3A8A] hover:bg-[#1E3A8A]/8 transition-colors"
                    >
                        {item.label}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={handleDownloadMonthsPDF}
                    disabled={isExportingMonths}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-[#D4AF37]/15 text-[#1E3A8A] hover:bg-[#D4AF37]/25 transition-colors disabled:opacity-50"
                >
                    {isExportingMonths ? '…' : 'PDF'}
                </button>
            </nav>
        </div>
    );
};
