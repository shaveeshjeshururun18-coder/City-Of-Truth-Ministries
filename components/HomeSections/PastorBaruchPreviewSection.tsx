import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Sparkles,
    Heart,
    ArrowRight,
    Phone,
    Mail,
    Play,
    Pause,
    Volume2,
    VolumeX,
    Award,
    GraduationCap,
    Music,
    Calendar,
    MapPin,
    ShieldCheck,
    Star,
    CheckCircle2,
    Sliders,
    ChevronRight,
    Headset,
    Share2,
    Compass,
    Radio,
    FileText
} from 'lucide-react';
import { ViewState } from '../../types';

interface SectionProps {
    setView: (view: ViewState) => void;
}

// 22 Hebrew Letters Praise Acrostic Data (Psalm 119)
const HEBREW_PRAISE_PARTS = [
    { part: 1, letter: "א", name: "Aleph", theme: "இறையாண்மை (Divine Sovereignty)", range: "Ps 119:1-8", desc: "The supreme sovereignty and undefiled path of God." },
    { part: 2, letter: "ב", name: "Bet", theme: "புனிதம் (Holiness & Purity)", range: "Ps 119:9-16", desc: "How a young person cleanses their path through the Word." },
    { part: 3, letter: "ג", name: "Gimel", theme: "தேவத்துவம் (Divine Bounty)", range: "Ps 119:17-24", desc: "Bountiful dealings of the Lord opening eyes to wonder." },
    { part: 4, letter: "ד", name: "Dalet", theme: "வல்லமை (Strengthening Power)", range: "Ps 119:25-32", desc: "Soul revived from the dust through everlasting truth." },
    { part: 5, letter: "ה", name: "Hey", theme: "மகிமை (Divine Glory & Guidance)", range: "Ps 119:33-40", desc: "Teach me, O LORD, the way of your sacred statutes." },
];

export const PastorBaruchPreviewSection: React.FC<SectionProps> = ({ setView }) => {
    // Audio Player State for Baruch Hashem Praise
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Pastor Dock Active Tab (matching screenshot's floating circle dock)
    const [activePastorTab, setActivePastorTab] = useState<'profile' | 'credentials' | 'hebrew' | 'schedule'>('profile');

    // Baruch Hashem Active Praise Part
    const [selectedPraiseIndex, setSelectedPraiseIndex] = useState(0);
    const currentPraise = HEBREW_PRAISE_PARTS[selectedPraiseIndex];

    // Toggle Audio Playback
    const toggleAudio = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch((err) => {
                console.error("Audio playback error:", err);
            });
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    // Format seconds into MM:SS
    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <section className="relative py-28 overflow-hidden bg-[#0c0c0e] text-white selection:bg-[#e85a22] selection:text-white">
            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                src="/audio/baruch-hashem.mp3"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleAudioEnded}
                preload="metadata"
            />

            {/* Ambient Warm Tangerine & Burnt Orange Radial Glows (Mirrors Screenshot 1 & Tangerine Theme) */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-br from-[#e85a22]/15 via-[#f97316]/10 to-transparent blur-[150px] pointer-events-none rounded-full" />
            <div className="absolute bottom-10 right-0 w-[600px] h-[500px] bg-gradient-to-tl from-[#ea580c]/12 via-[#ffd300]/8 to-transparent blur-[140px] pointer-events-none rounded-full" />
            
            {/* Subtle Editorial Grain Texture */}
            <div 
                className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
                
                {/* ========================================================================= */}
                {/* 1. EDITORIAL HEADER WITH TANGERINE PILL & HIGHLIGHTER BADGE */}
                {/* ========================================================================= */}
                <div className="text-center max-w-3xl mx-auto mb-20 md:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#e85a22]/15 border border-[#e85a22]/30 text-[#f97316] text-[11px] font-black uppercase tracking-[0.25em] mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(232,90,34,0.25)]"
                    >
                        <span className="w-2 h-2 rounded-full bg-[#ffd300] animate-pulse shadow-[0_0_8px_#ffd300]" />
                        SPIRITUAL LEADERSHIP & SACRED PRAISE
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-sans font-black tracking-tighter text-white leading-[1.05]"
                    >
                        Pastor &{' '}
                        <span className="bg-[#ffd300] text-[#111111] px-3.5 py-1 rounded-xl inline-block transform -rotate-1 shadow-xl mx-1 font-serif">
                            Baruch Hashem
                        </span>{' '}
                        Sanctuary
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 text-base sm:text-lg text-neutral-300 font-normal leading-relaxed max-w-2xl mx-auto"
                    >
                        Experience the ministerial heart of City of Truth: dedicated pastoral care under <strong className="text-white font-bold">Pastor Lazarus</strong> and the 22-part Hebrew praise treasury in the Valparai hills.
                    </motion.p>
                </div>

                {/* ========================================================================= */}
                {/* 2. DUAL INTERACTIVE BENTO SLABS IN TANGERINE / OBSIDIAN THEME */}
                {/* ========================================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
                    
                    {/* =================================================================== */}
                    {/* CARD 1: PASTOR LAZARUS - SHEPHERD'S DESK & MINISTERIAL PROFILE     */}
                    {/* =================================================================== */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="rounded-[2.5rem] bg-[#141418] border border-white/10 p-6 sm:p-8 md:p-10 flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-black/80 hover:border-[#e85a22]/40 transition-all group"
                    >
                        {/* Top Ambient Glow */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-b from-[#e85a22]/20 via-[#ea580c]/10 to-transparent blur-3xl pointer-events-none rounded-full" />
                        
                        {/* Top Meta Bar with "12 Parameters" style pill from screenshot */}
                        <div className="flex items-center justify-between gap-3 mb-8 relative z-10">
                            <div className="flex items-center gap-2">
                                <span className="text-[#e85a22] font-mono font-black text-xs md:text-sm tracking-wider">COT.PASTOR</span>
                                <span className="px-2.5 py-0.5 rounded-full bg-[#e85a22]/20 text-[#f97316] text-[10px] font-black uppercase tracking-widest border border-[#e85a22]/30">
                                    SENIOR SHEPHERD
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-bold uppercase tracking-wider">
                                <span className="text-[#ffd300] font-black">12</span> Ministry Pillars
                            </div>
                        </div>

                        {/* Top Scooped Notched Card (Directly reflecting Screenshot 1) */}
                        <div className="rounded-[2rem] bg-gradient-to-br from-[#e85a22] via-[#d14d1a] to-[#9a3412] p-6 sm:p-7 text-white shadow-xl shadow-[#e85a22]/20 relative overflow-hidden mb-6 z-10">
                            {/* Inner Specular Light */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/20 pointer-events-none" />

                            {/* Header inside scooped card */}
                            <div className="flex items-center justify-between mb-5 relative z-10">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 block mb-1">
                                        Shepherd of Valparai
                                    </span>
                                    <h3 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white">
                                        Pastor Lazarus
                                    </h3>
                                </div>
                                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/60 shadow-md shrink-0 bg-white/20">
                                    <img
                                        src="/assets/pastor.jpeg"
                                        alt="Pastor Lazarus"
                                        className="w-full h-full object-cover object-top"
                                    />
                                </div>
                            </div>

                            {/* Dynamic Details List (Mimics Isabella Castillo form in screenshot) */}
                            <div className="space-y-3 relative z-10">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                                            <ShieldCheck size={14} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-white/70 uppercase font-black block tracking-wider">Theological Degrees</span>
                                            <span className="text-xs sm:text-sm font-bold text-white">M.Div (ATA) · B.Div (NATA)</span>
                                        </div>
                                    </div>
                                    <CheckCircle2 size={16} className="text-[#ffd300] shrink-0" />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                                            <BookOpen size={14} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-white/70 uppercase font-black block tracking-wider">Biblical Roots</span>
                                            <span className="text-xs sm:text-sm font-bold text-white">Advanced Hebrew Studies (TPI USA)</span>
                                        </div>
                                    </div>
                                    <CheckCircle2 size={16} className="text-[#ffd300] shrink-0" />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                                            <MapPin size={14} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-white/70 uppercase font-black block tracking-wider">Sanctuary Location</span>
                                            <span className="text-xs sm:text-sm font-bold text-white">Valparai Hills, Tamil Nadu</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] uppercase font-black text-white/80 bg-white/15 px-2 py-0.5 rounded-md">
                                        Open Weekly
                                    </span>
                                </div>
                            </div>

                            {/* Floating Circular Bottom Dock inside card (Directly matching Screenshot 1 dock) */}
                            <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-around relative z-10">
                                <button
                                    onClick={() => setActivePastorTab('profile')}
                                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${
                                        activePastorTab === 'profile'
                                            ? 'bg-white text-[#111111] shadow-[0_0_15px_rgba(255,255,255,0.6)] scale-110'
                                            : 'bg-black/30 hover:bg-black/50 text-white border border-white/15'
                                    }`}
                                    title="Personal Calling"
                                >
                                    <Heart size={18} />
                                </button>

                                <button
                                    onClick={() => setActivePastorTab('credentials')}
                                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${
                                        activePastorTab === 'credentials'
                                            ? 'bg-white text-[#111111] shadow-[0_0_15px_rgba(255,255,255,0.6)] scale-110'
                                            : 'bg-black/30 hover:bg-black/50 text-white border border-white/15'
                                    }`}
                                    title="Degrees & Credentials"
                                >
                                    <GraduationCap size={18} />
                                </button>

                                <button
                                    onClick={() => setActivePastorTab('hebrew')}
                                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${
                                        activePastorTab === 'hebrew'
                                            ? 'bg-white text-[#111111] shadow-[0_0_15px_rgba(255,255,255,0.6)] scale-110'
                                            : 'bg-black/30 hover:bg-black/50 text-white border border-white/15'
                                    }`}
                                    title="Hebrew Studies"
                                >
                                    <BookOpen size={18} />
                                </button>

                                <button
                                    onClick={() => setActivePastorTab('schedule')}
                                    className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${
                                        activePastorTab === 'schedule'
                                            ? 'bg-white text-[#111111] shadow-[0_0_15px_rgba(255,255,255,0.6)] scale-110'
                                            : 'bg-black/30 hover:bg-black/50 text-white border border-white/15'
                                    }`}
                                    title="Sabbath Schedule"
                                >
                                    <Calendar size={18} />
                                    {/* Small notification badge '5' like in screenshot */}
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ffd300] text-[#111111] font-mono text-[9px] font-black flex items-center justify-center shadow">
                                        5
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Middle Bento Stat & Soundwave Meter (Mirrors "182cm Above Average" card in screenshot) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 relative z-10">
                            {/* Experience Card */}
                            <div className="p-5 rounded-2xl bg-white text-[#111111] shadow-lg flex flex-col justify-between">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 block mb-1">
                                        Sanctuary Ministry
                                    </span>
                                    <div className="text-3xl sm:text-4xl font-black font-sans tracking-tight text-[#111111]">
                                        28+ Years
                                    </div>
                                    <span className="text-xs font-bold text-[#e85a22] mt-1 inline-block">
                                        Faithful Pastoral Care
                                    </span>
                                </div>
                                {/* Orange Soundwave Equalizer Meter (Exact style of vertical bars in screenshot 1!) */}
                                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-end gap-1.5 h-10">
                                    {[35, 60, 45, 85, 70, 100, 65, 90, 50, 75, 95, 40, 60].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                height: [`${h * 0.4}%`, `${h}%`, `${h * 0.5}%`],
                                            }}
                                            transition={{
                                                duration: 1.2 + (i % 4) * 0.3,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: i * 0.08
                                            }}
                                            className="flex-1 bg-gradient-to-t from-[#e85a22] to-[#ffd300] rounded-full min-w-[3px]"
                                            style={{ height: `${h}%` }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Doctrine & Vision Card */}
                            <div className="p-5 rounded-2xl bg-neutral-900/90 border border-white/10 text-white flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                                            Teaching Pillar
                                        </span>
                                        <Star size={14} className="text-[#ffd300] fill-[#ffd300]" />
                                    </div>
                                    <h4 className="text-sm font-bold text-white leading-snug">
                                        ஆத்தும நன்றி பள்ளிகள்
                                    </h4>
                                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                                        "Then you will know the truth, and the truth will set you free." — John 8:32
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-[#f97316] pt-3 border-t border-white/5">
                                    <span>Tamil & Hebrew Exegesis</span>
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        </div>

                        {/* Bottom CTA Action Button */}
                        <button
                            onClick={() => setView(ViewState.PASTOR)}
                            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#e85a22] via-[#f97316] to-[#e85a22] text-white font-sans font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(232,90,34,0.4)] hover:shadow-[0_0_45px_rgba(249,115,22,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 relative overflow-hidden group cursor-pointer z-10"
                        >
                            <span>Enter Shepherd's Sanctuary Page</span>
                            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                    </motion.div>

                    {/* =================================================================== */}
                    {/* CARD 2: BARUCH HASHEM - 22 HEBREW LETTERS PRAISE TREASURY           */}
                    {/* =================================================================== */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="rounded-[2.5rem] bg-[#141418] border border-white/10 p-6 sm:p-8 md:p-10 flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-black/80 hover:border-[#ffd300]/40 transition-all group"
                    >
                        {/* Top Ambient Golden Glow */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-b from-[#ffd300]/15 via-[#f59e0b]/10 to-transparent blur-3xl pointer-events-none rounded-full" />
                        
                        {/* Top Meta Bar */}
                        <div className="flex items-center justify-between gap-3 mb-8 relative z-10">
                            <div className="flex items-center gap-2">
                                <span className="text-[#ffd300] font-mono font-black text-xs md:text-sm tracking-wider">COT.PRAISE</span>
                                <span className="px-2.5 py-0.5 rounded-full bg-[#ffd300]/15 text-[#ffd300] text-[10px] font-black uppercase tracking-widest border border-[#ffd300]/30">
                                    בָּרוּךְ הַשֵׁם
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-bold uppercase tracking-wider">
                                <span className="text-[#e85a22] font-black">22</span> Praise Parts
                            </div>
                        </div>

                        {/* Top Scooped Notched Card (Warm Burnt Obsidian & Gold Accent) */}
                        <div className="rounded-[2rem] bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#0c0a09] border border-white/15 p-6 sm:p-7 text-white shadow-xl shadow-black/60 relative overflow-hidden mb-6 z-10">
                            {/* Inner Specular Light */}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,211,0,0.15),transparent_60%)] pointer-events-none" />

                            {/* Header inside scooped card */}
                            <div className="flex items-center justify-between mb-5 relative z-10">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ffd300] block mb-1">
                                        Psalm 119 Acrostic Treasury
                                    </span>
                                    <h3 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white">
                                        Baruch Hashem
                                    </h3>
                                </div>
                                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#ffd300]/40 shadow-md shrink-0 bg-neutral-900 p-1 flex items-center justify-center text-3xl font-serif font-black text-[#ffd300]">
                                    {currentPraise.letter}
                                </div>
                            </div>

                            {/* Interactive 5-Letter Quick Selector (matching the screenshot parameters) */}
                            <div className="grid grid-cols-5 gap-2 mb-4 relative z-10">
                                {HEBREW_PRAISE_PARTS.map((p, idx) => (
                                    <button
                                        key={p.part}
                                        onClick={() => setSelectedPraiseIndex(idx)}
                                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                                            selectedPraiseIndex === idx
                                                ? 'bg-[#e85a22] border-[#ffd300] text-white shadow-md shadow-[#e85a22]/40 scale-105'
                                                : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <span className="text-base font-serif font-bold block">{p.letter}</span>
                                        <span className="text-[9px] uppercase font-black tracking-wider block opacity-80">{p.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Selected Praise Movement Information Box */}
                            <div className="p-3.5 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 relative z-10">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[#ffd300] mb-1">
                                    <span>Part {currentPraise.part} of 22</span>
                                    <span>{currentPraise.range}</span>
                                </div>
                                <div className="text-sm font-bold text-white mb-1">
                                    {currentPraise.theme}
                                </div>
                                <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                                    {currentPraise.desc}
                                </p>
                            </div>

                            {/* Floating Circular Bottom Dock for Praise (Matching Screenshot 1) */}
                            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-around relative z-10">
                                <button
                                    onClick={toggleAudio}
                                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${
                                        isPlaying
                                            ? 'bg-[#e85a22] text-white shadow-[0_0_20px_rgba(232,90,34,0.8)] scale-110'
                                            : 'bg-white text-[#111111] hover:bg-[#ffd300] shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                                    }`}
                                    title={isPlaying ? "Pause Praise Track" : "Play Praise Track"}
                                >
                                    {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                                </button>

                                <button
                                    onClick={() => setView(ViewState.BARUCH_HASHEM)}
                                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center justify-center transition-all active:scale-90"
                                    title="View 22-Part Songbook"
                                >
                                    <BookOpen size={18} />
                                </button>

                                <button
                                    onClick={() => setView(ViewState.BARUCH_HASHEM)}
                                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center justify-center transition-all active:scale-90"
                                    title="Praise Videos & Melodies"
                                >
                                    <Music size={18} />
                                </button>

                                <button
                                    onClick={() => window.open('https://youtube.com/@cotministries', '_blank')}
                                    className="relative w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center justify-center transition-all active:scale-90"
                                    title="YouTube Live Broadcast"
                                >
                                    <Radio size={18} />
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#e85a22] animate-ping" />
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#e85a22]" />
                                </button>
                            </div>
                        </div>

                        {/* Middle Bento Stat & Live Audio Visualizer (Mirrors screenshot soundwave) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 relative z-10">
                            {/* Live Audio Player Card */}
                            <div className="p-5 rounded-2xl bg-white text-[#111111] shadow-lg flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                                            Sacred Audio Praise
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isPlaying ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-neutral-100 text-neutral-600'}`}>
                                            {isPlaying ? 'STREAMING' : 'AUDIO READY'}
                                        </span>
                                    </div>
                                    <div className="text-xl sm:text-2xl font-black font-sans tracking-tight text-[#111111] truncate">
                                        Baruch Hashem
                                    </div>
                                    <span className="text-xs font-bold text-[#e85a22] mt-0.5 block">
                                        {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : '04:12'}
                                    </span>
                                </div>
                                {/* Soundwave bars that dance when playing */}
                                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-end gap-1.5 h-10">
                                    {[45, 90, 60, 100, 75, 85, 40, 95, 70, 60, 90, 50, 80].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            animate={isPlaying ? {
                                                height: [`${h * 0.2}%`, `${h}%`, `${h * 0.4}%`],
                                            } : {
                                                height: `${Math.max(15, h * 0.35)}%`
                                            }}
                                            transition={{
                                                duration: 0.6 + (i % 3) * 0.2,
                                                repeat: isPlaying ? Infinity : 0,
                                                ease: "easeInOut",
                                                delay: i * 0.05
                                            }}
                                            className={`flex-1 rounded-full min-w-[3px] transition-colors ${
                                                isPlaying 
                                                    ? 'bg-gradient-to-t from-[#e85a22] to-[#ffd300]' 
                                                    : 'bg-neutral-300'
                                            }`}
                                            style={{ height: `${h}%` }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Praise Treasury Artwork Card */}
                            <div className="p-5 rounded-2xl bg-neutral-900/90 border border-white/10 text-white flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                                            Hebrew Acrostic
                                        </span>
                                        <Sparkles size={14} className="text-[#ffd300]" />
                                    </div>
                                    <h4 className="text-sm font-bold text-white leading-snug">
                                        176 Verses of Praise
                                    </h4>
                                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                                        Complete 22 Hebrew alphabet sections woven into Tamil devotional hymns.
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-[#ffd300] pt-3 border-t border-white/5">
                                    <span>Download Songbook PDF</span>
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        </div>

                        {/* Bottom CTA Action Button */}
                        <button
                            onClick={() => setView(ViewState.BARUCH_HASHEM)}
                            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#ffd300] via-[#f59e0b] to-[#ffd300] text-[#111111] font-sans font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,211,0,0.3)] hover:shadow-[0_0_45px_rgba(255,211,0,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 relative overflow-hidden group cursor-pointer z-10"
                        >
                            <span>Explore 22 Praise Gallery</span>
                            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                    </motion.div>

                </div>

                {/* ========================================================================= */}
                {/* 3. EDITORIAL MARQUEE TICKER TAPE (Directly from Tangerine Theme HTML)     */}
                {/* ========================================================================= */}
                <div className="mt-16 md:mt-20 rounded-2xl bg-[#111111] border border-white/10 overflow-hidden shadow-2xl py-3.5 px-4">
                    <div className="flex w-full whitespace-nowrap items-center font-mono text-[10px] sm:text-xs font-bold tracking-widest text-neutral-400 overflow-hidden">
                        <div className="flex items-center shrink-0 animate-marquee gap-10">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#e85a22] animate-pulse" />
                                COT.PASTOR <span className="text-white">LAZARUS</span> <span className="text-emerald-400">ORDAINED</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#ffd300]" />
                                COT.BARUCH_HASHEM <span className="text-white">22 PARTS</span> <span className="text-emerald-400">100% PRAISE</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#e85a22]" />
                                VALPARAI SANCTUARY <span className="text-white">TAMIL NADU</span> <span className="text-[#ffd300]">642127</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                SABBATH GATHERING <span className="text-white">SUN 9:30 AM</span> <span className="text-sky-400">WED 6:30 PM</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#e85a22] animate-pulse" />
                                PSALM 119 <span className="text-white">HEBREW ACROSTIC</span> <span className="text-emerald-400">ACTIVE</span>
                            </span>
                            {/* Duplicate for smooth infinite marquee */}
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#e85a22] animate-pulse" />
                                COT.PASTOR <span className="text-white">LAZARUS</span> <span className="text-emerald-400">ORDAINED</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#ffd300]" />
                                COT.BARUCH_HASHEM <span className="text-white">22 PARTS</span> <span className="text-emerald-400">100% PRAISE</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#e85a22]" />
                                VALPARAI SANCTUARY <span className="text-white">TAMIL NADU</span> <span className="text-[#ffd300]">642127</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                SABBATH GATHERING <span className="text-white">SUN 9:30 AM</span> <span className="text-sky-400">WED 6:30 PM</span>
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};
export default PastorBaruchPreviewSection;
