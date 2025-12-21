import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play, Info, ArrowRight, Share2, Phone, MessageCircle, Heart, Flame, Shield, Crown } from 'lucide-react';
import { Button } from './Button';

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

const GallerySection: React.FC = () => {
    const images = Array.from({ length: 22 }, (_, i) => {
        const num = i + 1;
        const ext = num === 1 ? 'jpg' : 'png';
        return `/barch_hasem/${num}.${ext}`;
    });

    return (
        <section className="py-24 bg-[#0b1121] overflow-hidden border-y border-white/5">
            <div className="container mx-auto px-6 mb-12 text-center">
                <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Visual Journey</span>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mt-2">Treasury of Grace</h2>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <div className="flex animate-marquee hover:pause-marquee gap-6 py-4">
                    {[...images, ...images].map((src, i) => (
                        <a
                            key={i}
                            href="https://youtube.com/@cotministries"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative w-[280px] md:w-[350px] aspect-video rounded-2xl overflow-hidden shrink-0 border border-white/10 hover:border-amber-500/50 transition-all duration-500 group/item active:scale-95"
                        >
                            <img src={src} alt={`Gallery ${i}`} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                <span className="text-white font-bold text-sm tracking-widest uppercase flex items-center gap-2">
                                    <Play size={16} className="fill-white" /> Watch on YouTube
                                </span>
                            </div>
                        </a>
                    ))}
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
    const audioRef = useRef<HTMLAudioElement>(null);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

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

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* 1. Hero Section (Blessing Page) */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0b1121] text-white pt-24 md:pt-20">
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
                                    <Button className="bg-amber-600 hover:bg-amber-700 text-white border-0 shadow-lg shadow-amber-900/40">
                                        Get the Digital Book
                                    </Button>
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
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <GallerySection />

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

            {/* 4. The 22 Parts (Praises Grid) */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">The 22 Pillars of Praise</h2>
                        <p className="text-slate-600">Explore the divine attributes categorized by the Hebrew Aleph-Bet.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {praiseData.map((item) => (
                            <motion.div
                                key={item.part}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-slate-100 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-serif text-6xl text-brand-900 pointer-events-none group-hover:scale-110 transition-transform">{item.letter}</div>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-lg border border-brand-100">
                                        {item.part}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 leading-none">{item.name}</h3>
                                        <span className="text-xs text-slate-500">{item.range}</span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Theme</p>
                                    <h4 className="text-lg font-bold text-brand-800 font-tamil">{item.theme}</h4>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                    <span className="text-xs text-slate-400 font-medium">Page {item.page}</span>
                                    <button
                                        onClick={() => copyToClipboard(`${item.name} - ${item.theme}`)}
                                        className="text-slate-400 hover:text-brand-600 transition-colors"
                                        title="Copy to Share"
                                    >
                                        <Share2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Contact Section */}
            <section className="py-16 bg-white border-t border-slate-100">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-serif font-bold text-slate-900 mb-8">Contact Us</h2>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">

                        {/* WhatsApp */}
                        <div className="bg-brand-50 p-8 rounded-2xl border border-brand-100 flex flex-col items-center min-w-[280px]">
                            <div className="bg-green-100 p-4 rounded-full text-green-600 mb-4">
                                <MessageCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">WhatsApp</h3>
                            <p className="text-slate-600 mb-4">Chat with us directly</p>
                            <a
                                href="https://wa.me/918056152478"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-2 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-colors"
                            >
                                Chat Now
                            </a>
                        </div>

                        {/* Email */}
                        <div className="bg-brand-50 p-8 rounded-2xl border border-brand-100 flex flex-col items-center min-w-[280px]">
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
