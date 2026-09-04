import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play, Info, ArrowRight, Share2, Phone, MessageCircle, Heart, Flame, Shield, Crown, Video, Clock } from 'lucide-react';
import { Button } from './Button';
import { api, BaruchVideo } from '../services/api';
import { CircularCarousel } from '@/components/ui/circular-carousel';
import { Footer } from '@/components/ui/footer-section';

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
    { part: 13, letter: "מ", name: "Mem", range: "97 - 104", theme: "கருணை (Mercy)", page: 117 },
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
        return `/barch_hasem/${partNum}.${ext}`;
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
        title: `${item.name} · Part ${item.part}`,
        description: item.theme,
        tag: item.letter
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
        // Attempt auto-play when entering page
        const timer = setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.play().then(() => {
                    setIsPlaying(true);
                }).catch(err => {
                    console.log("Autoplay blocked by browser. User interaction required.", err);
                });
            }
        }, 1500); // Small delay to ensure page is loaded

        // Listen for iframe clicks to pause audio
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
            clearTimeout(timer);
            window.removeEventListener('blur', handleBlur);
        };
    }, []);

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
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
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0b1121] text-white pt-24 md:pt-20">
                <motion.div
                    className="absolute -top-28 -left-24 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl pointer-events-none"
                    animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.1, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl pointer-events-none"
                    animate={{ opacity: [0.25, 0.55, 0.25], scale: [1.05, 1, 1.05] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(251,191,36,0.2),transparent_48%)] pointer-events-none" />
                {/* Background Menorah Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <Flame size={600} className="text-amber-500 animate-pulse-slow" />
                </div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex flex-col items-center justify-center">

                            <div className="max-w-4xl">
                                <p className="text-amber-500 font-bold uppercase tracking-[0.3em] mb-4 text-sm font-tamil">சத்திய நகர ஊழியங்கள்</p>
                                <h1 className="text-4xl sm:text-7xl lg:text-8xl font-serif font-bold mb-6 bg-gradient-to-b from-amber-100 to-amber-600 bg-clip-text text-transparent">
                                    הַקָּדוֹשׁ בָּרוּךְ הוּא
                                </h1>
                                <h2 className="text-2xl md:text-4xl font-serif text-amber-200 mb-2">Baruch Hashem</h2>
                                <p className="text-xl text-slate-400 mb-8 italic">"Holy One, Blessed be He"</p>

                                <div className="w-24 h-1 bg-amber-600 mx-auto mb-10 rounded-full"></div>

                                <h3 className="text-3xl md:text-6xl font-bold font-tamil mb-4 text-white leading-tight">ஆத்தும நன்றி பலிகள்</h3>
                                <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed">
                                    "Give thanks to our God" <br />
                                    <span className="text-amber-500 font-tamil">போற்றுதலுக்குரிய புனிதமான ஆண்டவரது திருப்பெயர் மகிமைப்படுவதாக</span>
                                </p>

                                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                     <div
                                        onClick={toggleAudio}
                                        className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 hover:bg-white/20 transition-all cursor-pointer group"
                                    >
                                        <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                            {isPlaying ? <span className="text-white font-bold animate-pulse">||</span> : <Play size={18} className="text-white ml-1 fill-white" />}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] text-amber-300 uppercase tracking-widest font-bold">{isPlaying ? 'Playing...' : 'Listen Sample'}</p>
                                            <p className="text-xs font-bold text-white">Baruch Hashem</p>
                                        </div>
                                        <audio ref={audioRef} className="hidden" src="/barch_hasem/sample_audio.mp3" onEnded={() => setIsPlaying(false)}></audio>
                                    </div>
                                    <Button
                                       variant="glass"
                                       className="px-6 py-3 text-sm"
                                       onClick={scrollToHighlights}
                                    >
                                       Explore 22 Parts <ArrowRight size={16} />
                                    </Button>
                                    <Button
                                       variant="accent"
                                       className="px-6 py-3 text-sm"
                                       onClick={scrollToContact}
                                    >
                                       Contact Ministry
                                    </Button>
                                </div>

                                <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                                   {[
                                       { icon: Crown, title: '22 Hebrew Parts', subtitle: 'Aleph to Tav praise flow' },
                                       { icon: Shield, title: '176 Praises', subtitle: 'Spiritual declarations' },
                                       { icon: Heart, title: 'Tamil Meaning', subtitle: 'Worship with understanding' }
                                   ].map((item) => (
                                       <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                                           <item.icon size={18} className="text-amber-300 mb-2" />
                                           <p className="text-sm font-semibold text-white">{item.title}</p>
                                           <p className="text-xs text-slate-300">{item.subtitle}</p>
                                       </div>
                                   ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <GallerySection onImageClick={scrollToChapter} videos={videos} />

            <section className="relative py-24 bg-[#070a16] text-white overflow-hidden border-y border-amber-500/15">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_55%)] pointer-events-none" />
                <div className="container mx-auto px-6 max-w-6xl relative z-10">
                    <div className="text-center mb-14">
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
                                            src={`/barch_hasem/${item.part}.${item.part === 1 ? 'jpg' : 'png'}`}
                                            alt={item.name}
                                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
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

            <section className="bg-[#050810] px-4 pb-0 pt-16">
                <Footer />
            </section>
        </div>
    );
};
