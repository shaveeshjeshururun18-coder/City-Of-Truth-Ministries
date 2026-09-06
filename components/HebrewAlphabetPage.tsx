import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Scroll, Volume2, Sparkles, ArrowLeft, X, Download, PenTool, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioService } from '../services/audioService';
import { MouthPronunciationAnimator, HEBREW_LETTER_PHONEMES } from './MouthPronunciationAnimator';
import { AnimatedTeacherCharacter } from './AnimatedTeacherCharacter';
import { generateHebrewAlphabetPDF } from './HebrewAlphabetPDF';
import { LetterTracingModal } from './LetterTracingModal';

const PALEO_IMAGE_MAP: Record<string, string> = {
    ALEPH: "/paleo_letters/04_Aleph.png",
    BET: "/paleo_letters/03_Bet.png",
    GIMEL: "/paleo_letters/02_Gimel.png",
    DALET: "/paleo_letters/01_Dalet.png",
    HE: "/paleo_letters/08_He.png",
    VAV: "/paleo_letters/07_Waw.png",
    ZAYIN: "/paleo_letters/06_Zayin.png",
    CHET: "/paleo_letters/05_Het.png",
    TET: "/paleo_letters/12_Tet.png",
    YOD: "/paleo_letters/11_Yod.png",
    KAF: "/paleo_letters/10_Kaph.png",
    LAMED: "/paleo_letters/09_Lamed.png",
    MEM: "/paleo_letters/16_Mem.png",
    NUN: "/paleo_letters/15_Nun.png",
    SAMEKH: "/paleo_letters/14_Samekh.png",
    AYIN: "/paleo_letters/13_Ayin.png",
    PE: "/paleo_letters/20_Pe.png",
    TSADE: "/paleo_letters/19_Tsade.png",
    QOPH: "/paleo_letters/18_Qoph.png",
    RESH: "/paleo_letters/17_Resh.png",
    SHIN: "/paleo_letters/22_Shin.png",
    TAV: "/paleo_letters/21_Taw.png"
};

export const HEBREW_LETTERS = [
    { letter: "א", name: "ALEPH", hebrewName: "אלף", number: 1, latinPronunciation: "Ah-lef", tamilPronunciation: "ஆலெஃப்", tamilGuide: "ஆலெஃப் உச்சரிப்பு: முதலில் வாயை திறந்து ஆ என்று சொல்லுங்கள். அடுத்தது நாக்கை மேலே தொட்டு லெ என்று சொல்லி, கடைசியில் கீழ் உதட்டை பற்களுக்கு அருகில் வைத்து ஃப் என்று மெதுவாக முடிக்கவும்.", symbolic: "Ox, Strength, Leader", meaning: "Ox, Strength, Leader", pictographNumber: "No.1 (Headship)" },
    { letter: "ב", name: "BET", hebrewName: "בית", number: 2, latinPronunciation: "Bet", tamilPronunciation: "பெத்", tamilGuide: "பெத். பே என்று தொடங்கி, முடிவில் த் ஒலியை மெதுவாக சேர்க்கவும்.", symbolic: "House, Family, Inside", meaning: "House, Family, Inside", pictographNumber: "No.2 (House)" },
    { letter: "ג", name: "GIMEL", hebrewName: "גימל", number: 3, latinPronunciation: "Gee-mel", tamilPronunciation: "கீமெல்", tamilGuide: "கீமெல். கீ என்று நீட்டி, பிறகு மெல் என்று மெதுவாக சொல்லுங்கள்.", symbolic: "Camel, Pride, To Lift Up", meaning: "Camel, Pride, To Lift Up", pictographNumber: "No.3 (Foot)" },
    { letter: "ד", name: "DALET", hebrewName: "דלת", number: 4, latinPronunciation: "Dah-let", tamilPronunciation: "தாலெத்", tamilGuide: "தாலெத். தா என்று தொடங்கி, லெத் என்று முடிக்கவும்.", symbolic: "Door, Pathway, To Enter", meaning: "Door, Pathway, To Enter", pictographNumber: "No.4 (Door)" },
    { letter: "ה", name: "HE", hebrewName: "הא", number: 5, latinPronunciation: "Heh", tamilPronunciation: "ஹே", tamilGuide: "ஹே. மெதுவான மூச்சோசையுடன் ஹே என்று சொல்லுங்கள்.", symbolic: "Window, Breath, Revelation", meaning: "Window, Breath, Revelation", pictographNumber: "No.5 (Arms Raised)" },
    { letter: "ו", name: "VAV", hebrewName: "וו", number: 6, latinPronunciation: "Vav", tamilPronunciation: "வாவ்", tamilGuide: "வாவ். வா ஒலியைத் தெளிவாக சொல்லி, இறுதியில் வ் ஒலி மெதுவாக முடிக்கவும்.", symbolic: "Nail, Peg, Connection", meaning: "Nail, Peg, Connection", pictographNumber: "No.6 (Tent Peg)" },
    { letter: "ז", name: "ZAYIN", hebrewName: "זין", number: 7, latinPronunciation: "Zah-yin", tamilPronunciation: "சயின்", tamilGuide: "சயின். சா அல்லது ஸா ஒலியுடன் தொடங்கி, யின் என்று முடிக்கவும்.", symbolic: "Sword, Weapon, To Cut", meaning: "Sword, Weapon, To Cut", pictographNumber: "No.7 (Plowing Tool)" },
    { letter: "ח", name: "CHET", hebrewName: "חית", number: 8, latinPronunciation: "Khet", tamilPronunciation: "க்ஹெட்", tamilGuide: "க்ஹெட். தொண்டையில் இருந்து வரும் க்ஹ் ஒலியுடன் ஹெட் போல சொல்லுங்கள்.", symbolic: "Fence, Enclosure, Protection", meaning: "Fence, Enclosure, Protection", pictographNumber: "No.8 (Fence)" },
    { letter: "ט", name: "TET", hebrewName: "טית", number: 9, latinPronunciation: "Tet", tamilPronunciation: "டெட்", tamilGuide: "டெட். டெ என்று சொல்லி, இறுதியில் ட் ஒலி தெளிவாக முடிக்கவும்.", symbolic: "Basket, Snake, Surround", meaning: "Basket, Snake, Surround", pictographNumber: "No.9 (Basket)" },
    { letter: "י", name: "YOD", hebrewName: "יוד", number: 10, latinPronunciation: "Yod", tamilPronunciation: "யோத்", tamilGuide: "யோத். யோ என்று நீட்டி, மெதுவாகத் த் ஒலியில் முடிக்கவும்.", symbolic: "Hand, Work, Deed", meaning: "Hand, Work, Deed", pictographNumber: "No.10 (Arm & Hand)" },
    { letter: "כ", name: "KAF", hebrewName: "כף", number: 20, latinPronunciation: "Kaf", tamilPronunciation: "காஃப்", tamilGuide: "காஃப். கா ஒலியுடன் தொடங்கி, ஃப் ஒலி தெளிவாக சொல்லுங்கள்.", symbolic: "Palm, Open Hand, To Cover", meaning: "Palm, Open Hand, To Cover", pictographNumber: "No.20 (Open Palm)" },
    { letter: "ל", name: "LAMED", hebrewName: "למד", number: 30, latinPronunciation: "Lah-med", tamilPronunciation: "லாமெட்", tamilGuide: "லாமெட். லா என்று தொடங்கி, மெத் ஒலியில் மெதுவாக முடிக்கவும்.", symbolic: "Staff, Goad, To Teach/Lead", meaning: "Staff, Goad, To Teach/Lead", pictographNumber: "No.30 (Staff)" },
    { letter: "מ", name: "MEM", hebrewName: "מם", number: 40, latinPronunciation: "Mem", tamilPronunciation: "மேம்", tamilGuide: "மேம். மே என்று நீட்டி, ம் ஒலியில் முடிக்கவும்.", symbolic: "Water, Chaos, Mighty", meaning: "Water, Chaos, Mighty", pictographNumber: "No.40 (Water)" },
    { letter: "נ", name: "NUN", hebrewName: "נון", number: 50, latinPronunciation: "Noon", tamilPronunciation: "நூன்", tamilGuide: "நூன். நூ என்று நீட்டி, ந் ஒலி மெதுவாக முடிக்கவும்.", symbolic: "Fish, Seed, Life/Action", meaning: "Fish, Seed, Life/Action", pictographNumber: "No.50 (Seed)" },
    { letter: "ס", name: "SAMEKH", hebrewName: "סמך", number: 60, latinPronunciation: "Sah-mekh", tamilPronunciation: "சாமெக்", tamilGuide: "சாமெக். சா என்று தொடங்கி, மெக் என்று மெதுவாக முடிக்கவும்.", symbolic: "Prop, Support, To Lean", meaning: "Prop, Support, To Lean", pictographNumber: "No.60 (Thorn)" },
    { letter: "ע", name: "AYIN", hebrewName: "עין", number: 70, latinPronunciation: "Ah-yin", tamilPronunciation: "ஆயின்", tamilGuide: "ஆயின். ஆ என்று திறந்த ஒலியுடன் தொடங்கி, யின் என்று சொல்லுங்கள்.", symbolic: "Eye, To See, Understand", meaning: "Eye, To See, Understand", pictographNumber: "No.70 (Eye)" },
    { letter: "פ", name: "PE", hebrewName: "פה", number: 80, latinPronunciation: "Peh", tamilPronunciation: "பே", tamilGuide: "பே. உதட்டை சேர்த்து ப ஒலி தெளிவாக கூறி, ஏ ஒலியை நீட்டுங்கள்.", symbolic: "Mouth, Word, To Speak", meaning: "Mouth, Word, To Speak", pictographNumber: "No.80 (Mouth)" },
    { letter: "צ", name: "TSADE", hebrewName: "צדי", number: 90, latinPronunciation: "Tsah-deh", tamilPronunciation: "ட்சாதே", tamilGuide: "ட்சாதே. ட்ஸ் ஒலியுடன் தொடங்கி, சாதே என்று மெதுவாக சொல்லுங்கள்.", symbolic: "Fishhook, To Pull, Righteous", meaning: "Fishhook, To Pull, Righteous", pictographNumber: "No.90 (Path)" },
    { letter: "ק", name: "QOPH", hebrewName: "קוף", number: 100, latinPronunciation: "Qof", tamilPronunciation: "கோஃப்", tamilGuide: "கோஃப். தொண்டை ஒலியுடன் கோ என்று சொல்லி, ஃப் ஒலியில் முடிக்கவும்.", symbolic: "Sun on Horizon, Time, Circle", meaning: "Sun on Horizon, Time, Circle", pictographNumber: "No.100 (Sun at the Horizon)" },
    { letter: "ר", name: "RESH", hebrewName: "ריש", number: 200, latinPronunciation: "Resh", tamilPronunciation: "ரேஷ்", tamilGuide: "ரேஷ். ரே என்று தொடங்கி, ஷ் ஒலி மெதுவாக முடிக்கவும்.", symbolic: "Head, Person, Highest", meaning: "Head, Person, Highest", pictographNumber: "No.200 (a Man's Head)" },
    { letter: "ש", name: "SHIN", hebrewName: "שין", number: 300, latinPronunciation: "Sheen", tamilPronunciation: "ஷீன்", tamilGuide: "ஷீன். ஷீ என்று நீட்டி, ந் ஒலியில் முடிக்கவும்.", symbolic: "Teeth, To Consume, Destroy", meaning: "Teeth, To Consume, Destroy", pictographNumber: "No.300 (Two front teeth)" },
    { letter: "ת", name: "TAV", hebrewName: "תו", number: 400, latinPronunciation: "Tav", tamilPronunciation: "தாவ்", tamilGuide: "தாவ். தா என்று கூறி, வ் ஒலி மெதுவாக முடிக்கவும்.", symbolic: "Mark, Sign, Covenant", meaning: "Mark, Sign, Covenant", pictographNumber: "No.400 (Crossed Sticks)" },
];

export const HEBREW_LETTERS_DATA = HEBREW_LETTERS;

const TAMIL_PRONUNCIATION_PARTS: Record<string, string[]> = {
    "א": ["ஆ", "லெஃப்"],
    "ב": ["பெத்"],
    "ג": ["கீ", "மெல்"],
    "ד": ["தா", "லெத்"],
    "ה": ["ஹே"],
    "ו": ["வாவ்"],
    "ז": ["ச", "யின்"],
    "ח": ["க்ஹெட்"],
    "ט": ["டெட்"],
    "י": ["யோத்"],
    "כ": ["காஃப்"],
    "ל": ["லா", "மெட்"],
    "מ": ["மேம்"],
    "נ": ["நூன்"],
    "ס": ["சா", "மெக்"],
    "ע": ["ஆ", "யின்"],
    "פ": ["பே"],
    "צ": ["ட்சா", "தே"],
    "ק": ["கோஃப்"],
    "ר": ["ரேஷ்"],
    "ש": ["ஷீன்"],
    "ת": ["தாவ்"],
};

export interface HebrewAlphabetPageProps {
    onBack?: () => void;
}

export const HebrewAlphabetPage: React.FC<HebrewAlphabetPageProps> = ({ onBack }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'modern' | 'paleo'>('modern');
    const [searchTerm, setSearchTerm] = useState('');
    const [pdfGenerating, setPdfGenerating] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);
    const [tracingModalOpen, setTracingModalOpen] = useState(false);
    const [tracingMode, setTracingMode] = useState<'modern' | 'paleo'>('modern');
    const [practiced, setPracticed] = useState<Record<string, boolean>>(() => {
        try {
            const saved = localStorage.getItem('cot_hebrew_practiced_map');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    const panelRef = useRef<HTMLDivElement>(null);
    const [isTeacherSpeaking, setIsTeacherSpeaking] = useState(false);

    // Scroll to the expanded panel smoothly when it appears between items
    useEffect(() => {
        if (selectedIndex !== null && panelRef.current) {
            const timer = setTimeout(() => {
                panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [selectedIndex]);

    const handleHebrewPlay = async (index: number, hebrewText: string, rate: number = 0.82) => {
        setActiveIndex(index);
        setIsTeacherSpeaking(true);
        try {
            await audioService.playHebrew(hebrewText, rate);
        } catch (error) {
            console.warn('Hebrew playback fallback synthesis:', error);
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                try {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance(hebrewText);
                    u.lang = 'he-IL';
                    u.rate = rate;
                    window.speechSynthesis.speak(u);
                } catch (e) {}
            }
        } finally {
            setTimeout(() => {
                setActiveIndex(null);
                setIsTeacherSpeaking(false);
            }, 2200);
        }
    };

    const handleTamilTeachingPlay = async (index: number, tamilText: string) => {
        setActiveIndex(index);
        setIsTeacherSpeaking(true);
        try {
            await audioService.playTamil(tamilText, 0.8);
        } catch (error) {
            console.warn('Tamil teaching playback fallback:', error);
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                try {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance(tamilText);
                    u.lang = 'ta-IN';
                    u.rate = 0.8;
                    window.speechSynthesis.speak(u);
                } catch (e) {}
            }
        } finally {
            setTimeout(() => {
                setActiveIndex(null);
                setIsTeacherSpeaking(false);
            }, 3000);
        }
    };

    // User clicked card: immediate pronunciation and inline expansion between items
    const handleCardClick = (index: number) => {
        const item = HEBREW_LETTERS[index];
        if (selectedIndex === index) {
            // Already open -> replay pronunciation
            handleHebrewPlay(index, item.hebrewName);
        } else {
            setSelectedIndex(index);
            // "se whiel clciked it slef hsodul prounce" -> immediately pronounce on click!
            handleHebrewPlay(index, item.hebrewName);
        }
    };

    const handleMarkPracticed = (letterName: string) => {
        setPracticed(prev => {
            const updated = { ...prev, [letterName]: true };
            try {
                localStorage.setItem('cot_hebrew_practiced_map', JSON.stringify(updated));
                // Also update cot_hebrew_learned_letters for test suite compatibility
                const learnedIndices = Object.keys(updated).map(name =>
                    HEBREW_LETTERS.findIndex(l => l.name === name)
                ).filter(idx => idx !== -1);
                localStorage.setItem('cot_hebrew_learned_letters', JSON.stringify(learnedIndices));
            } catch (e) {}
            return updated;
        });
    };

    const handleGeneratePDF = async () => {
        setPdfGenerating(true);
        setPdfError(null);
        try {
            await generateHebrewAlphabetPDF();
        } catch (error) {
            console.error('PDF generation error:', error);
            try {
                const link = document.createElement('a');
                link.href = '/downloads/ilovepdf_merged_organized.pdf';
                link.download = 'Hebrew_Alphabet_Guide.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (_err) {
                setPdfError('Failed to generate PDF. Please try again.');
                setTimeout(() => setPdfError(null), 5000);
            }
        } finally {
            setTimeout(() => setPdfGenerating(false), 500);
        }
    };

    // Filtered letters based on search term (name, meaning, latin, tamil)
    const filteredLetters = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return HEBREW_LETTERS;
        return HEBREW_LETTERS.filter(item => {
            const haystack = `${item.name} ${item.hebrewName} ${item.meaning} ${item.latinPronunciation} ${item.tamilPronunciation} ${item.tamilGuide}`.toLowerCase();
            return haystack.includes(q);
        });
    }, [searchTerm]);

    const practicedCount = Object.keys(practiced).length;
    const selectedLetter = selectedIndex !== null ? HEBREW_LETTERS[selectedIndex] : null;

    return (
        <div className="min-h-screen w-full bg-[#0f0d0a] text-[#ede6d6] pb-28 relative font-sans select-none">
            {/* Subtle ancient parchment vignette & radial lighting */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,162,39,0.14)_0%,transparent_60%)]" />
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

            {/* Back Button */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="fixed top-5 left-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-[#17130f]/80 hover:bg-[#211b15] border border-[#ede6d6]/15 hover:border-[#c9a227]/50 text-[#ede6d6] rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-xl backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95"
                >
                    <ArrowLeft size={14} />
                    <span>Back to Home</span>
                </button>
            )}

            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 pt-16 md:pt-20">
                {/* INFINITE RUNNING HEBREW MARQUEE GLYPHS */}
                <div className="overflow-hidden opacity-35 mb-4 select-none [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
                    <motion.div
                        animate={{ x: ['0%', '-50%'] }}
                        transition={{ ease: 'linear', duration: 45, repeat: Infinity }}
                        className="flex gap-10 whitespace-nowrap w-max"
                    >
                        {[...HEBREW_LETTERS, ...HEBREW_LETTERS].map((l, i) => (
                            <span key={i} className="font-serif text-4xl sm:text-5xl text-[#c9a227] select-none">
                                {l.letter}
                            </span>
                        ))}
                    </motion.div>
                </div>

                {/* HERO SECTION */}
                <header className="text-center mb-12 relative">
                    <p className="text-xs tracking-[0.25em] text-[#a5927a] font-semibold uppercase mb-3">
                        City of Truth Ministries · <strong className="text-[#ede6d6]/90 font-bold">Valparai, Tamil Nadu</strong>
                    </p>
                    <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-b from-[#e8c468] via-[#c9a227] to-[#9c7a1c] drop-shadow-md">
                        Lashon HaKodesh
                    </h1>
                    <p className="font-serif italic text-lg sm:text-xl text-[#ede6d6]/75 mb-6">
                        The Holy Tongue — ஆலெஃப் முதல் தாவ் வரை
                    </p>

                    {/* Metadata Badges (WITHOUT GEMATRIA RANGE) */}
                    <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap text-xs text-[#a5927a] mb-8 font-medium">
                        <div className="text-center">
                            <strong className="block font-serif text-2xl text-[#ede6d6] font-bold">22</strong>
                            <span>Letters (Aleph to Tav)</span>
                        </div>
                        <div className="text-center">
                            <strong className="block font-serif text-2xl text-[#ede6d6] font-bold">3</strong>
                            <span>Scripts (Modern, Paleo, Tamil)</span>
                        </div>
                        <div className="text-center">
                            <strong className="block font-serif text-2xl text-[#e8c468] font-bold">
                                {practicedCount}/22
                            </strong>
                            <span>Practiced this session</span>
                        </div>
                    </div>

                    {/* Download HD PDF Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={handleGeneratePDF}
                            disabled={pdfGenerating}
                            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#e8c468] to-[#c9a227] hover:from-[#f3d482] hover:to-[#e8c468] text-[#0f0d0a] font-extrabold text-xs uppercase tracking-widest shadow-[0_10px_25px_rgba(201,162,39,0.35)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 cursor-pointer"
                        >
                            <Download size={16} strokeWidth={2.5} />
                            <span>{pdfGenerating ? 'Generating HD PDF...' : 'Download the HD Guide'}</span>
                        </button>
                    </div>

                    {pdfError && (
                        <div className="mt-3 inline-block px-5 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-semibold">
                            {pdfError}
                        </div>
                    )}
                </header>

                {/* STICKY GLASS TOOLBAR */}
                <div className="sticky top-4 z-40 mb-8">
                    <div className="flex items-center gap-3 p-2.5 bg-[#17130f]/80 backdrop-blur-xl border border-[#ede6d6]/10 rounded-2xl shadow-[0_20px_45px_rgba(0,0,0,0.7)] flex-wrap">
                        {/* Search Input */}
                        <div className="flex-1 min-w-[220px] flex items-center gap-2.5 bg-black/30 border border-[#ede6d6]/10 focus-within:border-[#a5927a] rounded-xl px-3.5 py-2 transition-colors">
                            <Search size={15} className="text-[#a5927a]/70 shrink-0" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, meaning, or ஒலி…"
                                className="w-full bg-transparent border-none outline-none text-[#ede6d6] placeholder-[#a5927a]/60 text-xs sm:text-sm"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="text-[#a5927a] hover:text-[#ede6d6] text-xs">
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Modern / Paleo Toggle Switch */}
                        <div className="flex bg-black/30 border border-[#ede6d6]/10 rounded-xl p-1 shrink-0">
                            <button
                                onClick={() => setViewMode('modern')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                    viewMode === 'modern'
                                        ? 'bg-[#c9a227] text-[#0f0d0a] shadow-md'
                                        : 'text-[#a5927a] hover:text-[#ede6d6]'
                                }`}
                            >
                                Modern
                            </button>
                            <button
                                onClick={() => setViewMode('paleo')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                    viewMode === 'paleo'
                                        ? 'bg-[#c9a227] text-[#0f0d0a] shadow-md'
                                        : 'text-[#a5927a] hover:text-[#ede6d6]'
                                }`}
                            >
                                Paleo-Hebrew
                            </button>
                        </div>
                    </div>
                </div>

                {/* ALPHABET GRID WITH INLINE EXPANSION DIRECTLY BETWEEN THAT CARD AND NEXT CARD */}
                <main className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-4.5">
                    {filteredLetters.map((item, index) => {
                        const originalIndex = HEBREW_LETTERS.findIndex(l => l.name === item.name);
                        const isSelected = selectedIndex === originalIndex;
                        const isPlaying = activeIndex === originalIndex;
                        const isDone = !!practiced[item.name];

                        return (
                            <React.Fragment key={item.name}>
                                {/* Alphabet Card */}
                                <motion.div
                                    onClick={() => handleCardClick(originalIndex)}
                                    whileHover={{ y: -4 }}
                                    whileTap={{ scale: 0.96 }}
                                    className={`relative rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all duration-300 overflow-hidden select-none aspect-[1/1.1] group ${
                                        isSelected
                                            ? 'bg-[#211b15] border-2 border-[#c9a227] shadow-[0_0_35px_rgba(201,162,39,0.4)] ring-2 ring-[#c9a227]/30'
                                            : isPlaying
                                                ? 'bg-[#211b15] border-2 border-white/40 shadow-[0_0_25px_rgba(255,255,255,0.25)]'
                                                : isDone
                                                    ? 'bg-gradient-to-b from-[#1c1813] to-[#14100c] border border-[#c9a227]/40 hover:border-[#a5927a]'
                                                    : 'bg-gradient-to-b from-[#211b15] to-[#17130f] border border-[#ede6d6]/10 hover:border-[#a5927a]/60 hover:shadow-[0_8px_25px_rgba(0,0,0,0.6)]'
                                    }`}
                                >
                                    {/* Order index badge (GEMATRIA VALUE IS REMOVED) */}
                                    <span className="absolute top-2.5 left-3 font-mono text-[10px] sm:text-[11px] text-[#a5927a]/70 font-semibold">
                                        {String(originalIndex + 1).padStart(2, '0')}
                                    </span>

                                    {/* Audio Play Volume Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleHebrewPlay(originalIndex, item.hebrewName);
                                        }}
                                        className={`absolute top-2.5 right-2.5 p-1 rounded-full transition-all duration-200 ${
                                            isPlaying
                                                ? 'bg-[#c9a227] text-[#0f0d0a] scale-110'
                                                : 'text-[#a5927a]/50 hover:text-[#e8c468] hover:bg-white/5'
                                        }`}
                                        title={`Pronounce ${item.name}`}
                                    >
                                        <Volume2 size={13} />
                                    </button>

                                    {/* Practiced Done Checkmark badge */}
                                    {isDone && (
                                        <span className="absolute bottom-2.5 right-2.5 text-[#c9a227] opacity-90" title="Practiced">
                                            <Check size={14} strokeWidth={3} />
                                        </span>
                                    )}

                                    {/* Letter Glyph Display */}
                                    <div className="flex-1 flex items-center justify-center my-1 w-full">
                                        {viewMode === 'paleo' && PALEO_IMAGE_MAP[item.name] ? (
                                            <img
                                                src={PALEO_IMAGE_MAP[item.name]}
                                                alt={`Paleo ${item.name}`}
                                                className={`h-12 sm:h-14 md:h-16 object-contain transition-transform duration-300 drop-shadow-md ${
                                                    isSelected ? 'scale-110' : 'group-hover:scale-105'
                                                }`}
                                            />
                                        ) : (
                                            <span className="font-serif text-4xl sm:text-5xl md:text-5xl text-[#e8c468] leading-none transition-transform duration-300 drop-shadow-[0_4px_10px_rgba(201,162,39,0.25)]">
                                                {item.letter}
                                            </span>
                                        )}
                                    </div>

                                    {/* Name & Meaning & Tamil */}
                                    <div className="text-center w-full">
                                        <strong className="block text-xs sm:text-sm font-black text-[#ede6d6] tracking-wider uppercase truncate">
                                            {item.name}
                                        </strong>
                                        <span className="block text-[10px] text-[#a5927a] truncate">
                                            {(item.meaning || item.symbolic || '').split(',')[0]}
                                        </span>
                                        <span className="block text-[10px] text-[#e8c468]/80 font-medium truncate">
                                            {item.tamilPronunciation}
                                        </span>
                                    </div>

                                    {/* Downward indicator arrow if selected */}
                                    {isSelected && (
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#211b15] border-l-2 border-b-2 border-[#c9a227] rotate-[-45deg] z-20" />
                                    )}
                                </motion.div>

                                {/* APPEARING DETAIL SECTION — INSERTED IMMEDIATELY BETWEEN THIS ALPHABET AND NEXT ALPHABET */}
                                <AnimatePresence>
                                    {isSelected && (
                                        <motion.div
                                            ref={panelRef}
                                            key={`panel-${item.name}`}
                                            initial={{ opacity: 0, height: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                            exit={{ opacity: 0, height: 0, scale: 0.98 }}
                                            transition={{ duration: 0.35, ease: [0.22, 0.8, 0.28, 1] }}
                                            className="col-span-full w-full my-4 overflow-hidden origin-top z-10"
                                        >
                                            <div className="relative rounded-3xl border border-[#c9a227]/40 bg-gradient-to-b from-[#211b15] to-[#17130f] p-5 sm:p-7 md:p-9 shadow-[0_30px_70px_rgba(0,0,0,0.85)]">
                                                {/* Top gold accent line */}
                                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#e8c468] to-transparent opacity-80" />

                                                {/* Close Button */}
                                                <button
                                                    onClick={() => setSelectedIndex(null)}
                                                    className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#ede6d6]/70 hover:text-white transition-all z-20 cursor-pointer"
                                                    aria-label="Close detail"
                                                >
                                                    <X size={16} />
                                                </button>

                                                {/* Label */}
                                                <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[#c9a227] mb-6 flex items-center gap-2">
                                                    <Sparkles size={13} />
                                                    <span>Lashon HaKodesh · Pronunciation Guide · உச்சரிப்பு வழிகாட்டி</span>
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                                    {/* LEFT: Glyph Boxes & Letter Information (NO GEMATRIA VALUE) */}
                                                    <div className="lg:col-span-7 space-y-6">
                                                        <div className="flex flex-wrap items-center gap-5 sm:gap-6">
                                                            {/* Modern Letter Box */}
                                                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#c9a227]/10 border border-[#c9a227]/30 flex flex-col items-center justify-center select-none shadow-[0_0_25px_rgba(201,162,39,0.15)]">
                                                                <span className="font-serif text-4xl sm:text-5xl text-[#e8c468]">
                                                                    {item.letter}
                                                                </span>
                                                                <button
                                                                    onClick={() => { setTracingMode('modern'); setTracingModalOpen(true); }}
                                                                    className="absolute -bottom-2.5 bg-[#e8c468] hover:bg-[#c9a227] text-[#0f0d0a] text-[9px] font-black uppercase px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 shadow-md transition-all hover:scale-105 cursor-pointer"
                                                                >
                                                                    <PenTool size={10} /> Trace Modern
                                                                </button>
                                                            </div>

                                                            {/* Paleo-Hebrew Pictograph Box */}
                                                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#a5927a]/10 border border-[#a5927a]/30 flex flex-col items-center justify-center p-3 select-none">
                                                                {PALEO_IMAGE_MAP[item.name] ? (
                                                                    <img
                                                                        src={PALEO_IMAGE_MAP[item.name]}
                                                                        alt={`Paleo ${item.name}`}
                                                                        className="w-full h-full object-contain drop-shadow-md"
                                                                    />
                                                                ) : (
                                                                    <span className="text-2xl text-[#a5927a] font-bold">Paleo</span>
                                                                )}
                                                                <button
                                                                    onClick={() => { setTracingMode('paleo'); setTracingModalOpen(true); }}
                                                                    className="absolute -bottom-2.5 bg-[#a5927a] hover:bg-[#ede6d6] text-[#0f0d0a] text-[9px] font-black uppercase px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 shadow-md transition-all hover:scale-105 cursor-pointer"
                                                                >
                                                                    <PenTool size={10} /> Trace Paleo
                                                                </button>
                                                            </div>

                                                            {/* Title & Hebrew Name */}
                                                            <div className="space-y-1">
                                                                <h3 className="text-3xl sm:text-4xl font-serif font-black text-[#ede6d6] tracking-wide">
                                                                    {item.name}
                                                                </h3>
                                                                <p className="text-xl sm:text-2xl font-serif text-[#e8c468]">
                                                                    {item.hebrewName}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Structured Details (GEMATRIA IS REMOVED) */}
                                                        <div className="space-y-3 pt-2 text-sm">
                                                            <div className="flex border-t border-[#ede6d6]/10 pt-3">
                                                                <span className="w-28 sm:w-32 text-xs font-semibold text-[#a5927a] uppercase tracking-wider shrink-0">Meaning</span>
                                                                <span className="flex-1 text-[#ede6d6] font-medium">{item.meaning}</span>
                                                            </div>
                                                            <div className="flex border-t border-[#ede6d6]/10 pt-3">
                                                                <span className="w-28 sm:w-32 text-xs font-semibold text-[#a5927a] uppercase tracking-wider shrink-0">Pictograph</span>
                                                                <span className="flex-1 text-[#ede6d6]/90">{item.pictographNumber}</span>
                                                            </div>
                                                            <div className="flex border-t border-[#ede6d6]/10 pt-3">
                                                                <span className="w-28 sm:w-32 text-xs font-semibold text-[#a5927a] uppercase tracking-wider shrink-0">English</span>
                                                                <span className="flex-1 text-[#ede6d6] font-medium">{item.latinPronunciation}</span>
                                                            </div>
                                                            <div className="flex border-t border-[#ede6d6]/10 pt-3">
                                                                <span className="w-28 sm:w-32 text-xs font-semibold text-[#a5927a] uppercase tracking-wider shrink-0">தமிழ்</span>
                                                                <span className="flex-1 text-[#e8c468] font-bold text-base">{item.tamilPronunciation}</span>
                                                            </div>
                                                            <div className="flex border-t border-[#ede6d6]/10 pt-3">
                                                                <span className="w-28 sm:w-32 text-xs font-semibold text-[#a5927a] uppercase tracking-wider shrink-0">உச்சரிப்பு</span>
                                                                <span className="flex-1 text-[#ede6d6]/85 leading-relaxed text-xs sm:text-sm">{item.tamilGuide}</span>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex flex-wrap gap-3 pt-3">
                                                            <button
                                                                onClick={() => handleHebrewPlay(originalIndex, item.hebrewName)}
                                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c9a227] hover:bg-[#e8c468] text-[#0f0d0a] font-black text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 cursor-pointer"
                                                            >
                                                                <Volume2 size={15} />
                                                                <span>Listen Pronunciation</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleTamilTeachingPlay(originalIndex, item.tamilGuide)}
                                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-[#ede6d6] font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                                                            >
                                                                <Volume2 size={15} className="text-[#e8c468]" />
                                                                <span>Tamil Audio Guide</span>
                                                            </button>
                                                            <button
                                                                onClick={() => { setTracingMode('modern'); setTracingModalOpen(true); }}
                                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-[#ede6d6] font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                                                            >
                                                                <PenTool size={14} className="text-[#e8c468]" />
                                                                <span>Practice Tracing</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* RIGHT: Animated Teacher & Mouth Pronunciation Animator */}
                                                    <div className="lg:col-span-5 flex flex-col items-center gap-6 bg-black/40 border border-white/5 rounded-2xl p-5">
                                                        <div className="w-full">
                                                            <AnimatedTeacherCharacter
                                                                letterName={item.name}
                                                                hebrewLetter={item.letter}
                                                                tamilText={item.tamilGuide}
                                                                englishText={`${item.name} — ${item.symbolic}`}
                                                                tamilSyllables={TAMIL_PRONUNCIATION_PARTS[item.letter]}
                                                                isPlaying={isTeacherSpeaking || activeIndex === selectedIndex}
                                                                onPlayTamil={() => handleTamilTeachingPlay(selectedIndex!, item.tamilGuide)}
                                                                onPlayHebrew={() => handleHebrewPlay(selectedIndex!, item.hebrewName)}
                                                                inline={true}
                                                            />
                                                        </div>

                                                        <div className="w-full flex justify-center">
                                                            <MouthPronunciationAnimator
                                                                phonemeSequence={HEBREW_LETTER_PHONEMES[item.letter] || []}
                                                                wordText={item.hebrewName}
                                                                isPlaying={activeIndex === selectedIndex}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </React.Fragment>
                        );
                    })}
                </main>

                {filteredLetters.length === 0 && (
                    <div className="text-center py-20 text-[#a5927a] text-sm">
                        No letters match "{searchTerm}". Try a name, a meaning, or தமிழ் ஒலி.
                    </div>
                )}
            </div>

            {/* Canvas Tracing Modal */}
            {selectedLetter && (
                <LetterTracingModal
                    isOpen={tracingModalOpen}
                    onClose={() => {
                        setTracingModalOpen(false);
                        handleMarkPracticed(selectedLetter.name);
                    }}
                    letterName={selectedLetter.name}
                    hebrewSymbol={selectedLetter.letter}
                    paleoImgSrc={PALEO_IMAGE_MAP[selectedLetter.name]}
                    mode={tracingMode}
                />
            )}
        </div>
    );
};

export default HebrewAlphabetPage;
