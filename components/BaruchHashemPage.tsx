import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Play,
    Info,
    ArrowRight,
    Share2,
    Phone,
    MessageCircle,
    Heart,
    Flame,
    Shield,
    Crown,
    Video,
    Clock,
    Maximize2,
    X,
    Sparkles,
    Volume2,
    VolumeX,
    Eye
} from 'lucide-react';
import { Button } from './Button';
import { api, BaruchVideo } from '../services/api';
import { CircularCarousel } from '@/components/ui/circular-carousel';
import { HebrewSymbolCycler } from '@/components/ui/hebrew-symbol-cycler';

// Data from user request
const praiseData = [
    { part: 1, letter: "א", name: "Aleph", range: "1 - 8", theme: "இறையாண்மை (Sovereignty)", page: 9 },
    { part: 2, letter: "ב", name: "Bet", range: "9 - 16", theme: "புனிதம் (Holiness)", page: 18 },
    { part: 3, letter: "ג", name: "Gimel", range: "17 - 24", theme: "தேவத்துவம் (Divinity)", page: 27 },
    { part: 4, letter: "ד", name: "Dalet", range: "25 - 32", theme: "வல்லமை (Power)", page: 36 },
    { part: 5, letter: "ה", name: "Hey", range: "33 - 40", theme: "மகிமை (Glory)", page: 45 },
    { part: 6, letter: "ו", name: "Vav", range: "41 - 48", theme: "நற்குணம் (Goodness)", page: 54 },
    { part: 7, letter: "ז", name: "Zayin", range: "49 - 56", theme: "மகத்துவம் (Majesty)", page: 63 },
    { part: 8, letter: "ח", name: "Chet", range: "57 - 64", theme: "மாட்சிமை (Splendor)", page: 72 },
    { part: 9, letter: "ט", name: "Tet", range: "65 - 72", theme: "வலிமை (Strength)", page: 81 },
    { part: 10, letter: "י", name: "Yod", range: "73 - 80", theme: "மேன்மை (Excellence)", page: 90 },
    { part: 11, letter: "כ", name: "Kaf", range: "81 - 88", theme: "செம்மை (Uprightness)", page: 99 },
    { part: 12, letter: "ל", name: "Lamed", range: "89 - 96", theme: "பேரன்பு (Steadfast Love)", page: 108 },
    { part: 13, letter: "ம", name: "Mem", range: "97 - 104", theme: "கருணை (Mercy)", page: 117 },
    { part: 14, letter: "נ", name: "Nun", range: "105 - 112", theme: "சமாதானம் (Peace)", page: 126 },
    { part: 15, letter: "ס", name: "Samekh", range: "113 - 120", theme: "நீதிநியாயம் (Justice)", page: 135 },
    { part: 16, letter: "ע", name: "Ayin", range: "121 - 128", theme: "இரக்கம் (Compassion)", page: 144 },
    { part: 17, letter: "פ", name: "Pei", range: "129 - 136", theme: "மீட்பு (Redemption)", page: 153 },
    { part: 18, letter: "צ", name: "Tsade", range: "137 - 144", theme: "ஆளுகை (Dominion)", page: 162 },
    { part: 19, letter: "ק", name: "Qoph", range: "145 - 152", theme: "பேரரசாட்சி (Kingship)", page: 171 },
    { part: 20, letter: "ר", name: "Resh", range: "153 - 160", theme: "மேய்ப்புனரம் (Shepherding)", page: 180 },
    { part: 21, letter: "ש", name: "Shin", range: "161 - 168", theme: "மாண்பு (Dignity)", page: 189 },
    { part: 22, letter: "ת", name: "Tav", range: "169 - 176", theme: "புகழ்ச்சி (Praise)", page: 198 },
];

const GallerySection: React.FC<{ 
    onImageClick: (index: number) => void;
    videos: Record<number, string>;
}> = ({ onImageClick, videos }) => {
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

    const handleImageError = (index: number) => {
        setFailedImages(prev => new Set(prev).add(index));
    };

    const getThumbnailSrc = (index: number) => {
        const partNum = index + 1;
        const ext = partNum === 1 ? 'jpg' : 'png';
        return `/images/baruch-hashem/parts/${partNum}.${ext}`;
    };

    return (
        <section className="py-24 bg-[#0b1121] overflow-hidden border-y border-white/5">
            <div className="container mx-auto px-6 mb-12 text-center">
                <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Visual Journey</span>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mt-2">Treasury of Grace</h2>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <div className="flex animate-marquee hover:pause-marquee gap-6 py-4">
                    {Array.from({ length: 44 }).map((_, i) => {
                        const index = i % 22;
                        const partNum = index + 1;
                        const src = getThumbnailSrc(index);
                        const hasVideo = !!videos[partNum];
                        
                        return (
                            <div
                                key={i}
                                onClick={() => hasVideo ? onImageClick(index) : window.open('https://youtube.com/@cotministries', '_blank')}
                                className="relative w-[280px] md:w-[350px] aspect-video rounded-2xl overflow-hidden shrink-0 border border-white/10 hover:border-amber-500/50 transition-all duration-500 group/item active:scale-95 cursor-pointer"
                            >
                                <img 
                                    src={src} 
                                    alt={`Gallery ${index}`} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110"
                                    onError={() => handleImageError(index)}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                    <span className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                                        Part {partNum} - {praiseData[index].letter} ({praiseData[index].name})
                                    </span>
                                    <span className="text-white font-bold text-sm tracking-widest uppercase flex items-center gap-2">
                                        {hasVideo ? (
                                            <a
                                                href={`https://www.youtube.com/watch?v=${videos[partNum]}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-2 hover:text-amber-400 transition-colors pointer-events-auto"
                                            >
                                                <Play size={16} className="fill-white text-red-500" /> Watch Video
                                            </a>
                                        ) : (
                                            <a
                                                href="https://youtube.com/@cotministries"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-2 hover:text-amber-400 transition-colors pointer-events-auto"
                                            >
                                                <Play size={16} className="fill-white text-slate-400" /> Visit Channel
                                            </a>
                                        )}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(calc(-350px * 22 - 1.5rem * 22)); }
                }
                .animate-marquee {
                    animation: marquee 60s linear infinite;
                }
                .hover\\:pause-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
};

export const BaruchHashemPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'hebrew' | 'tamil' | 'meaning'>('hebrew');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [wrapperModalOpen, setWrapperModalOpen] = useState(false);

    const formatTime = (secs: number) => {
        if (!secs || isNaN(secs)) return "0:00";
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const DEFAULT_VIDEOS: Record<number, string> = {
        1: "4nFxzgqQ_8I",
        2: "1TrWrscz3A8",
        3: "fw61MENxsNQ",
        4: "wOAXgfWii6I",
        5: "_8RjHFb9OTE",
        6: "imGY37JZEUg",
        7: "9cPWFHUgHwk",
        8: "oFrLzVyEfFQ",
        9: "oPus0tBHpnQ",
        10: "sFi2y_w0KLQ",
        11: "Be6kqxrA1Wk",
        12: "OIrMG9VzGqs"
    };

    const [videos, setVideos] = useState<Record<number, string>>(DEFAULT_VIDEOS);
    const audioRef = useRef<HTMLAudioElement>(null);
    const chapterSectionRef = useRef<HTMLElement>(null);
    const carouselItems = praiseData.map((item) => ({
        id: String(item.part),
        part: item.part,
        title: `${item.name} · Part ${item.part}`,
        description: item.theme,
        tag: item.letter,
        range: item.range,
        page: item.page,
        name: item.name,
        theme: item.theme,
        image: `/images/baruch-hashem/parts/${item.part}.${item.part === 1 ? 'jpg' : 'png'}`,
        onSelect: () => scrollToChapter(item.part - 1)
    }));

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const data = await api.getBaruchVideos();
                setVideos(prev => {
                    const next = { ...prev };
                    data.forEach(v => {
                        const partNum = Number(v.part);
                        if (v.youtubeId) {
                            next[partNum] = v.youtubeId;
                        } else {
                            if (!DEFAULT_VIDEOS[partNum]) {
                                next[partNum] = "";
                            }
                        }
                    });
                    return next;
                });
            } catch (e) {
                console.error("Error fetching videos:", e);
            }
        };
        fetchVideos();
    }, []);

    const scrollToChapter = (index: number) => {
        const partNum = index + 1;
        const element = document.getElementById(`part-card-${partNum}`);
        if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = elementPosition - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        let hasInteracted = false;

        const attemptPlay = () => {
            if (audioRef.current && audioRef.current.paused) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setIsPlaying(true);
                            removeInteractionListeners();
                        })
                        .catch((err) => {
                            console.log("[BaruchHashem] Autoplay waiting for interaction:", err?.message || err);
                        });
                }
            }
        };

        const onUserInteraction = () => {
            if (!hasInteracted) {
                hasInteracted = true;
                attemptPlay();
            }
        };

        const interactionEvents = ['click', 'touchstart', 'pointerdown', 'keydown', 'scroll'];

        const removeInteractionListeners = () => {
            interactionEvents.forEach((evt) => {
                window.removeEventListener(evt, onUserInteraction);
            });
        };

        // 1. Immediate attempt (succeeds if entered through click or supported browser state)
        attemptPlay();

        // 2. Short delays to catch when audio media buffer/ref is ready
        const timer1 = setTimeout(attemptPlay, 150);
        const timer2 = setTimeout(attemptPlay, 600);

        // 3. Fallback: play on first user interaction anywhere on the screen
        interactionEvents.forEach((evt) => {
            window.addEventListener(evt, onUserInteraction, { once: true, passive: true });
        });

        // 4. Pause audio if user focuses an embedded YouTube video iframe
        const handleBlur = () => {
            setTimeout(() => {
                if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
                    if (audioRef.current) {
                        audioRef.current.pause();
                        setIsPlaying(false);
                    }
                }
            }, 0);
        };

        window.addEventListener('blur', handleBlur);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            removeInteractionListeners();
            window.removeEventListener('blur', handleBlur);
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    const toggleAudio = () => {
        if (audioRef.current) {
            if (!audioRef.current.paused) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play().then(() => {
                    setIsPlaying(true);
                }).catch(err => {
                    console.warn("Audio play blocked:", err);
                });
            }
        }
    };

    const scrollToHighlights = () => {
        chapterSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const scrollToContact = () => {
        document.getElementById('baruch-contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* 1. Hero Section (Blessing Page) */}
            <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#060913] text-white pt-24 pb-20 md:py-24">
                {/* Ethereal Sacred Lighting, Ruby Sanctuary Tint & Radial Glows */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a1024] via-[#060913] to-[#03050a] pointer-events-none" />
                <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.25)_0%,rgba(159,18,57,0.18)_45%,transparent_75%)] blur-[75px] pointer-events-none" />
                
                <motion.div
                    className="absolute -top-28 -left-24 h-96 w-96 rounded-full bg-sky-500/12 blur-3xl pointer-events-none"
                    animate={{ opacity: [0.3, 0.65, 0.3], scale: [1, 1.1, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute -bottom-24 -right-16 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl pointer-events-none"
                    animate={{ opacity: [0.25, 0.55, 0.25], scale: [1.05, 1, 1.05] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Background Menorah Emblem Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none select-none">
                    <img src="/assets/golden_menorah.png" alt="Menorah Watermark" className="w-[600px] h-[600px] object-contain filter drop-shadow-[0_0_80px_rgba(245,158,11,0.5)]" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                        
                        {/* ─── Left Column: Sacred Revelation & Controls ─── */}
                        <motion.div
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6"
                        >
                            {/* Status Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 backdrop-blur-xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)]" />
                                </span>
                                <span className="text-amber-300 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
                                    BARUCH HASHEM · 22 HEBREW PILLARS OF PRAISE
                                </span>
                            </div>

                            {/* Grand Hebrew & English Title Calligraphy */}
                            <div className="space-y-2">
                                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight leading-none bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-200 bg-clip-text text-transparent drop-shadow-[0_4px_30px_rgba(245,158,11,0.4)]">
                                    הַקָּדוֹשׁ בָּרוּךְ הוּא
                                </h1>
                                <p className="text-lg sm:text-2xl font-serif font-bold tracking-[0.18em] text-amber-200/90 uppercase">
                                    Baruch Hashem <span className="text-amber-500 font-light">•</span> Blessed Be His Holy Name
                                </p>
                            </div>

                            {/* Tamil Grand Title & Scripture Affirmation */}
                            <div className="space-y-3 w-full max-w-xl">
                                <h2 className="text-3xl sm:text-5xl font-black font-tamil tracking-tight text-white leading-tight drop-shadow-[0_4px_25px_rgba(245,158,11,0.3)]">
                                    ஆத்தும நன்றி பலிகள்
                                </h2>
                                <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/10 backdrop-blur-md text-left space-y-1">
                                    <p className="text-sm sm:text-base font-serif italic text-amber-100/90">
                                        "Give thanks to our God"
                                    </p>
                                    <p className="text-xs sm:text-sm font-tamil text-amber-300 font-medium">
                                        நம் தேவனுக்கு நன்றி கூறுங்கள் · ஆண்டவரது திருப்பெயர் மகிமைப்படுவதாக
                                    </p>
                                </div>
                            </div>

                            {/* Sacred Hebrew Ark Symbol Cycler Pedestal */}
                            <div className="w-full max-w-lg py-1">
                                <div className="rounded-3xl p-4 bg-white/[0.03] border border-amber-400/30 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                                    <HebrewSymbolCycler />
                                </div>
                            </div>

                            {/* Unified Luxury Action Bar */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2 w-full">
                                {/* Live Audio Player Button */}
                                <div
                                    onClick={toggleAudio}
                                    className="group relative flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-black/55 hover:bg-black/75 border border-amber-400/40 hover:border-amber-300 backdrop-blur-xl transition-all duration-300 cursor-pointer shadow-lg active:scale-95"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                                        {isPlaying ? (
                                            <div className="flex items-center gap-0.5">
                                                {[14, 22, 12, 18].map((h, idx) => (
                                                    <motion.span
                                                        key={idx}
                                                        className="w-1 bg-brand-950 rounded-full"
                                                        animate={{ height: [`${h * 0.3}px`, `${h * 0.9}px`, `${h * 0.3}px`] }}
                                                        transition={{ duration: 0.8 + idx * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                                                        style={{ height: `${h * 0.6}px` }}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <Play size={18} className="text-brand-950 ml-0.5 fill-brand-950" />
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] text-amber-300 uppercase tracking-widest font-black flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                                            {isPlaying ? 'PLAYING SACRED AUDIO' : 'LISTEN SACRED CHANT'}
                                        </p>
                                        <p className="text-xs font-bold text-white">Baruch Hashem Praise</p>
                                        {duration > 0 && (
                                            <p className="text-[10px] text-slate-400 font-mono">
                                                {formatTime(currentTime)} / {formatTime(duration)}
                                            </p>
                                        )}
                                    </div>
                                    <audio
                                        ref={audioRef}
                                        className="hidden"
                                        src="/audio/baruch-hashem.mp3"
                                        preload="auto"
                                        autoPlay
                                        loop
                                        playsInline
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                        onTimeUpdate={() => {
                                            if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
                                        }}
                                        onLoadedMetadata={() => {
                                            if (audioRef.current) setDuration(audioRef.current.duration);
                                        }}
                                        onEnded={() => setIsPlaying(false)}
                                    />
                                </div>

                                {/* Explore 22 Parts CTA Button */}
                                <button
                                    type="button"
                                    onClick={scrollToHighlights}
                                    className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-brand-950 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden"
                                >
                                    <Sparkles size={15} className="shrink-0" />
                                    <span>Explore 22 Parts</span>
                                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                                    <div className="absolute inset-0 bg-white/30 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700 ease-out rotate-12" />
                                </button>

                                {/* Contact Ministry Button */}
                                <button
                                    type="button"
                                    onClick={scrollToContact}
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/20 bg-white/[0.04] hover:bg-amber-500/15 hover:border-amber-400/40 text-amber-200 font-bold text-xs uppercase tracking-wider backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-inner"
                                >
                                    <Phone size={13} className="text-amber-400" />
                                    <span>Contact Ministry</span>
                                </button>
                            </div>

                            {/* 3 Prestigious Sanctuary Metric Badges */}
                            <div className="grid grid-cols-3 gap-3 w-full max-w-xl pt-2 text-left">
                                {[
                                    { icon: Crown, title: '22 Parts', subtitle: 'Aleph to Tav', color: 'text-amber-300' },
                                    { icon: Shield, title: '176 Praises', subtitle: 'Psalm 119 Order', color: 'text-sky-300' },
                                    { icon: Heart, title: 'Tamil Meaning', subtitle: 'Full Revelation', color: 'text-rose-300' },
                                ].map((item) => (
                                    <div
                                        key={item.title}
                                        className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col items-start gap-1.5"
                                    >
                                        <item.icon size={16} className={item.color} />
                                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                                        <p className="text-[10px] text-slate-400 leading-tight">{item.subtitle}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* ─── Right Column: 3D Official Book Wrapper Showcase ─── */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.9, delay: 0.2 }}
                            className="lg:col-span-5 flex flex-col items-center justify-center relative"
                        >
                            {/* Ambient Divine Radiance Aura behind the Book */}
                            <div className="absolute -inset-8 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.32)_0%,rgba(159,18,57,0.22)_45%,transparent_75%)] blur-3xl pointer-events-none" />

                            {/* 3D Interactive Hardcover Book Container */}
                            <motion.div
                                whileHover={{ rotateY: -6, rotateX: 3, scale: 1.03 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
                                className="relative group cursor-pointer w-full max-w-md"
                                onClick={() => setWrapperModalOpen(true)}
                            >
                                {/* Hardcover Frame with Gilded Edges and Ruby Border */}
                                <div className="relative aspect-[1.418/1] rounded-2xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(245,158,11,0.35)] border-2 border-amber-400/70 ring-1 ring-amber-300/30 bg-gradient-to-br from-amber-950 via-slate-950 to-black">
                                    {/* Authentic Wrapper Artwork */}
                                    <img
                                        src="/images/baruch-hashem/athuma-nandri-wrapper.jpg"
                                        alt="ஆத்தும நன்றி பலிகள் Sacred Wrapper Cover"
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        onError={(e) => {
                                            // Fallback to wrapper.jpg
                                            (e.target as HTMLImageElement).src = '/images/baruch-hashem/wrapper.jpg';
                                        }}
                                    />

                                    {/* Specular Sheen Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                                        <div className="flex items-center justify-between">
                                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 text-brand-950 font-black text-xs uppercase tracking-wider shadow-lg">
                                                <Eye size={14} /> Zoom Full Wrapper
                                            </span>
                                            <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                                <Maximize2 size={16} />
                                            </span>
                                        </div>
                                    </div>

                                    {/* Official Sacred Edition Badge */}
                                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-amber-400/60 text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                                        <Sparkles size={11} className="text-amber-400" />
                                        Official Wrapper
                                    </div>
                                </div>

                                {/* 3D Gilded Shadow & Pages Thickness Simulation */}
                                <div className="absolute -bottom-3 left-4 right-4 h-3 bg-gradient-to-r from-amber-600/30 via-amber-400/50 to-amber-600/30 blur-md -z-10" />
                            </motion.div>

                            {/* Caption & Quick Buttons Under the Book */}
                            <div className="mt-4 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setWrapperModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/50 text-amber-200 text-xs font-bold transition-all shadow-sm cursor-pointer"
                                >
                                    <Maximize2 size={13} className="text-amber-400" />
                                    <span>Inspect Wrapper (HD)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={scrollToContact}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
                                >
                                    <Phone size={13} />
                                    <span>Order Book</span>
                                </button>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* ─── Full-Screen HD Sacred Wrapper Lightbox Modal ─── */}
            <AnimatePresence>
                {wrapperModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/90 backdrop-blur-2xl"
                        onClick={() => setWrapperModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="relative max-w-5xl w-full bg-[#0a0f1d] border border-amber-400/40 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(245,158,11,0.3)] flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
                                <div className="flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
                                    <div>
                                        <h3 className="text-sm sm:text-base font-serif font-bold text-white">
                                            ஆத்தும நன்றி பலிகள் · Official Sacred Book Wrapper
                                        </h3>
                                        <p className="text-[11px] text-amber-300 font-mono">
                                            בָּרוּךְ הַשֵּׁם · High Resolution Sacred Treasury Cover
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setWrapperModalOpen(false)}
                                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                                    aria-label="Close modal"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Body: High Resolution Image */}
                            <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-black/50">
                                <div className="relative rounded-2xl overflow-hidden border border-amber-400/30 shadow-2xl max-w-4xl">
                                    <img
                                        src="/images/baruch-hashem/athuma-nandri-wrapper.jpg"
                                        alt="Full Sacred Wrapper"
                                        className="w-full h-auto object-contain max-h-[60vh] select-none"
                                    />
                                </div>
                                
                                {/* Iconographic Guide */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 w-full max-w-4xl text-left">
                                    <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
                                        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Golden Cherubim</h4>
                                        <p className="text-[11px] text-slate-300 mt-1">Outstretched wings over the Mercy Seat facing the divine presence.</p>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
                                        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Sacred Name יהוה</h4>
                                        <p className="text-[11px] text-slate-300 mt-1">Radiant sunburst halo declaring the eternal name of the Almighty.</p>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
                                        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">7-Branched Menorah</h4>
                                        <p className="text-[11px] text-slate-300 mt-1">The perpetual golden lampstand flanked by fruitful olive branches.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-3.5 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs">
                                <span className="text-slate-400">City of Truth Ministries · Official Treasury</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setWrapperModalOpen(false);
                                        scrollToContact();
                                    }}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-brand-950 font-bold hover:brightness-110 transition-all cursor-pointer"
                                >
                                    Connect for Printed Copies
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <GallerySection onImageClick={scrollToChapter} videos={videos} />

            <section className="relative py-24 bg-[#070a16] text-white overflow-hidden border-y border-amber-500/15">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_55%)] pointer-events-none" />
                <div className="container mx-auto px-6 max-w-6xl relative z-10 flex flex-col items-center">
                    <div className="text-center mb-10 max-w-2xl mx-auto">
                        <span className="text-amber-400 font-bold uppercase tracking-[0.22em] text-xs">Magnificent Grandeur</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold mt-3 text-amber-50">Circle of Praise</h2>
                        <p className="text-slate-300 mt-4 max-w-2xl mx-auto">
                            Journey through the 22 pillars in a radiant flow and discover each divine attribute in worship.
                        </p>
                    </div>
                    <CircularCarousel items={carouselItems} />
                </div>
            </section>

            {/* 4. The 22 Parts (All Pre-shown in Grid) */}
            <section id="baruch-highlights" ref={chapterSectionRef} className="py-24 bg-slate-50 border-t border-slate-200">
                <div className="container mx-auto px-6 max-w-[1400px]">
                    <div className="text-center mb-16">
                        <span className="text-amber-600 font-bold uppercase tracking-widest text-xs">Divine Attributes</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-2 mb-4">The 22 Pillars of Praise</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">Explore all 22 parts of Aathuma Nandri Baligal. Watch the direct video teaching for each Hebrew letter.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {praiseData.map((item) => {
                            const hasVideo = !!videos[item.part];
                            const youtubeId = videos[item.part];
                            
                            return (
                                <div 
                                    key={item.part}
                                    id={`part-card-${item.part}`}
                                    className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-slate-100 flex flex-col transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Card Header Banner */}
                                    <div className="relative h-40 bg-slate-900 overflow-hidden shrink-0">
                                        <img 
                                            src={`/images/baruch-hashem/parts/${item.part}.${item.part === 1 ? 'jpg' : 'png'}`}
                                            alt={item.name}
                                            className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => { 
                                                (e.target as HTMLImageElement).src = `/barch_hasem/${item.part}.${item.part === 1 ? 'jpg' : 'png'}`; 
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 p-5 w-full flex items-end justify-between">
                                            <div>
                                                <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block shadow-md">
                                                    Part {item.part}
                                                </span>
                                                <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
                                                    <span className="text-amber-400 font-bold bg-white/10 w-8 h-8 rounded-full flex items-center justify-center text-base">{item.letter}</span>
                                                    <span>{item.name}</span>
                                                </h3>
                                            </div>
                                            <div className="text-right text-white">
                                                <p className="text-[10px] text-slate-300 uppercase">Praises</p>
                                                <p className="font-bold text-sm">{item.range}</p>
                                                <p className="text-[10px] text-amber-400">Page {item.page}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Body & Video */}
                                    <div className="p-6 flex-1 flex flex-col justify-between bg-slate-50/30">
                                        <div className="mb-4">
                                            <p className="text-amber-700 font-tamil font-bold text-base leading-relaxed mb-2">{item.theme}</p>
                                            <p className="text-xs text-slate-500 font-sans">
                                                {item.part <= 12 
                                                    ? `Teaching video for Part ${item.part} (${item.name}) is fully available. Watch directly below.` 
                                                    : `Teaching video for Part ${item.part} (${item.name}) is coming soon.`}
                                            </p>
                                        </div>

                                        <div className="w-full bg-white rounded-2xl p-1.5 shadow-inner border border-slate-200 aspect-video overflow-hidden relative">
                                            {hasVideo ? (
                                                <iframe 
                                                    width="100%" 
                                                    height="100%" 
                                                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                                                    title={`Part ${item.part} - ${item.name}`} 
                                                    frameBorder="0" 
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                                    allowFullScreen
                                                    loading="lazy"
                                                    className="rounded-xl absolute inset-0 w-full h-full p-1"
                                                ></iframe>
                                            ) : (
                                                <div className="w-full h-full rounded-xl bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center p-4 text-center absolute inset-0">
                                                    <Clock size={24} className="text-slate-400 mb-2 animate-pulse" />
                                                    <h4 className="text-sm font-bold text-slate-700">Video Coming Soon</h4>
                                                    <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] leading-tight">
                                                        விளக்க உரை விரைவில் பதிவேற்றப்படும்
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {hasVideo && (
                                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
                                                <a 
                                                    href={`https://www.youtube.com/watch?v=${youtubeId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={() => {
                                                        if (audioRef.current) {
                                                            audioRef.current.pause();
                                                            setIsPlaying(false);
                                                        }
                                                    }}
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors uppercase tracking-wider"
                                                >
                                                    <Video size={14} />
                                                    Watch on YouTube App
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 2. About the Book */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <BookOpen size={48} className="text-brand-600 mx-auto mb-6" />
                    <h2 className="text-4xl font-serif font-bold text-slate-900 mb-6">About the Book</h2>
                    <p className="text-slate-600 text-lg leading-relaxed mb-8">
                        <span className="font-bold text-brand-700">Aathuma Nandri Baligal</span> is a spiritual treasury containing <span className="font-bold">176 specific praises</span> organized into <span className="font-bold">22 parts</span>, corresponding to the Hebrew Aleph-Bet. Each section translates profound Hebrew praises into Tamil, guiding the believer into a deeper experience of worship through the names and attributes of God.
                    </p>
                    <div className="grid md:grid-cols-3 gap-8 text-left mt-12">
                        {[
                            { icon: Shield, title: "Spiritual Warfare", desc: "Equip yourself with the power of declaring God's names." },
                            { icon: Heart, title: "Deep Intimacy", desc: "Connect with the Father's heart through understanding His attributes." },
                            { icon: Crown, title: "Kingdom Authority", desc: "Align your prayers with the sovereignty of heaven." }
                        ].map((item, i) => (
                            <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <item.icon className="text-amber-600 mb-4" size={32} />
                                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. How to Read (Interactive) */}
            <section className="py-24 bg-brand-950 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container mx-auto px-6 max-w-5xl relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Reading Guide</span>
                        <h2 className="text-4xl font-serif font-bold mt-2">How to Read</h2>
                        <p className="text-slate-400 mt-4">Master the unique format connecting Hebrew and Tamil.</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/10">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <div className="relative group cursor-pointer" onMouseEnter={() => setActiveTab('hebrew')}>
                                    <div className={`absolute -left-4 top-0 bottom-0 w-1 bg-amber-500 transition-all ${activeTab === 'hebrew' ? 'opacity-100 h-full' : 'opacity-0 h-0'}`}></div>
                                    <h3 className="text-xl font-bold text-amber-400 mb-2 flex items-center gap-2">
                                        Step 1: Hebrew <ArrowRight size={16} className="rotate-180" />
                                    </h3>
                                    <p className="text-slate-300 text-sm">Read the Hebrew text from <span className="text-white font-bold">Right to Left</span>.</p>
                                    <div className="mt-4 p-4 bg-black/30 rounded-lg text-right font-serif text-2xl text-amber-100">
                                        אֱלֹהִים אֱמֶת
                                        <motion.div
                                            animate={{ x: [-20, 20, -20] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="h-0.5 bg-amber-500 mt-1 w-full opacity-50"
                                        />
                                    </div>
                                </div>

                                <div className="relative group cursor-pointer" onMouseEnter={() => setActiveTab('tamil')}>
                                    <div className={`absolute -left-4 top-0 bottom-0 w-1 bg-amber-500 transition-all ${activeTab === 'tamil' ? 'opacity-100 h-full' : 'opacity-0 h-0'}`}></div>
                                    <h3 className="text-xl font-bold text-amber-400 mb-2 flex items-center gap-2">
                                        Step 2: Pronunciation <ArrowRight size={16} className="rotate-180" />
                                    </h3>
                                    <p className="text-slate-300 text-sm">Read the Tamil phonetics from <span className="text-white font-bold">Right to Left</span>.</p>
                                    <div className="mt-4 p-4 bg-black/30 rounded-lg text-right font-tamil text-xl text-white">
                                        எ-மத் எலோ-யிம்
                                    </div>
                                </div>

                                <div className="relative group cursor-pointer" onMouseEnter={() => setActiveTab('meaning')}>
                                    <div className={`absolute -left-4 top-0 bottom-0 w-1 bg-amber-500 transition-all ${activeTab === 'meaning' ? 'opacity-100 h-full' : 'opacity-0 h-0'}`}></div>
                                    <h3 className="text-xl font-bold text-amber-400 mb-2 flex items-center gap-2">
                                        Step 3: Meaning <ArrowRight size={16} />
                                    </h3>
                                    <p className="text-slate-300 text-sm">Read the Tamil meaning from <span className="text-white font-bold">Left to Right</span>.</p>
                                    <div className="mt-4 p-4 bg-black/30 rounded-lg text-left font-tamil text-xl text-white">
                                        மெய்த் தேவனே Uumakku Nandri
                                    </div>
                                </div>
                            </div>

                            <div className="bg-black/40 rounded-2xl p-8 text-center border border-amber-500/20">
                                <div
                                    onClick={toggleAudio}
                                    className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-600/20 cursor-pointer hover:scale-110 transition-transform"
                                >
                                    {isPlaying ? <span className="text-white font-bold">||</span> : <Play size={28} className="text-white ml-1" />}
                                </div>
                                <p className="text-sm text-amber-200/60 uppercase tracking-widest mb-2">Audio Sample</p>
                                <h4 className="text-2xl font-bold text-white mb-1">Elohim Emet</h4>
                                <p className="text-slate-400">"True God"</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Contact Section */}
            <section id="baruch-contact" className="py-20 bg-gradient-to-b from-white to-amber-50/30 border-t border-slate-100">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-3">Connect With Us</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto mb-10">Join the worship movement, ask for prayer, and stay connected to the Baruch Hashem teachings.</p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">

                        {/* WhatsApp */}
                        <div className="bg-white p-8 rounded-3xl border border-amber-100/70 shadow-xl shadow-amber-100/40 flex flex-col items-center min-w-[280px] transition-transform duration-300 hover:-translate-y-1">
                            <div className="bg-green-100 p-4 rounded-full text-green-600 mb-4">
                                <MessageCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">WhatsApp</h3>
                            <p className="text-slate-600 mb-4">Chat with us directly</p>
                            <a
                                href="https://wa.me/918056152478"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-2 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-colors shadow-md shadow-green-400/25"
                            >
                                Chat Now
                            </a>
                        </div>

                        {/* Email */}
                        <div className="bg-white p-8 rounded-3xl border border-amber-100/70 shadow-xl shadow-amber-100/40 flex flex-col items-center min-w-[280px] transition-transform duration-300 hover:-translate-y-1">
                            <div className="bg-blue-100 p-4 rounded-full text-blue-600 mb-4">
                                <Info size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Email</h3>
                            <p className="text-slate-600 mb-4">Send us your queries</p>
                            <a
                                href="mailto:faithfulfellowship8@gmail.com"
                                className="text-brand-700 font-bold hover:underline break-all"
                            >
                                faithfulfellowship8@gmail.com
                            </a>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};
