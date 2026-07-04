import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Scroll, Volume2, Sparkles, ArrowLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioService } from '../services/audioService';
import { MouthPronunciationAnimator, HEBREW_LETTER_PHONEMES } from './MouthPronunciationAnimator';

const HEBREW_LETTERS = [
    { letter: "א", name: "ALEPH", hebrewName: "אלף", number: 1, latinPronunciation: "Ah-lef", tamilPronunciation: "ஆலெஃப்", tamilGuide: "ஆலெஃப். வாயை திறந்து மெதுவாக ஆ ஒலி சொல்லி, பிறகு லெஃப் சொல்லுங்கள்.", symbolic: "Ox, Strength, Leader" },
    { letter: "ב", name: "BET", hebrewName: "בית", number: 2, latinPronunciation: "Bet", tamilPronunciation: "பெத்", tamilGuide: "பெத். பே என்று தொடங்கி, முடிவில் த் ஒலியை மெதுவாக சேர்க்கவும்.", symbolic: "House, Family, Inside" },
    { letter: "ג", name: "GIMEL", hebrewName: "גימל", number: 3, latinPronunciation: "Gee-mel", tamilPronunciation: "கீமெல்", tamilGuide: "கீமெல். கீ என்று நீட்டி, பிறகு மெல் என்று மெதுவாக சொல்லுங்கள்.", symbolic: "Camel, Pride, To Lift Up" },
    { letter: "ד", name: "DALET", hebrewName: "דלת", number: 4, latinPronunciation: "Dah-let", tamilPronunciation: "தாலெத்", tamilGuide: "தாலெத். தா என்று தொடங்கி, லெத் என்று முடிக்கவும்.", symbolic: "Door, Pathway, To Enter" },
    { letter: "ה", name: "HE", hebrewName: "הא", number: 5, latinPronunciation: "Heh", tamilPronunciation: "ஹே", tamilGuide: "ஹே. மெதுவான மூச்சோசையுடன் ஹே என்று சொல்லுங்கள்.", symbolic: "Window, Breath, Revelation" },
    { letter: "ו", name: "VAV", hebrewName: "וו", number: 6, latinPronunciation: "Vav", tamilPronunciation: "வாவ்", tamilGuide: "வாவ். வா ஒலியைத் தெளிவாக சொல்லி, இறுதியில் வ் ஒலி மெதுவாக முடிக்கவும்.", symbolic: "Nail, Peg, Connection" },
    { letter: "ז", name: "ZAYIN", hebrewName: "זין", number: 7, latinPronunciation: "Zah-yin", tamilPronunciation: "சயின்", tamilGuide: "சயின். சா அல்லது ஸா ஒலியுடன் தொடங்கி, யின் என்று முடிக்கவும்.", symbolic: "Sword, Weapon, To Cut" },
    { letter: "ח", name: "CHET", hebrewName: "חית", number: 8, latinPronunciation: "Khet", tamilPronunciation: "க்ஹெட்", tamilGuide: "க்ஹெட். தொண்டையில் இருந்து வரும் க்ஹ் ஒலியுடன் ஹெட் போல சொல்லுங்கள்.", symbolic: "Fence, Enclosure, Protection" },
    { letter: "ט", name: "TET", hebrewName: "טית", number: 9, latinPronunciation: "Tet", tamilPronunciation: "டெட்", tamilGuide: "டெட். டெ என்று சொல்லி, இறுதியில் ட் ஒலி தெளிவாக முடிக்கவும்.", symbolic: "Basket, Snake, Surround" },
    { letter: "י", name: "YOD", hebrewName: "יוד", number: 10, latinPronunciation: "Yod", tamilPronunciation: "யோத்", tamilGuide: "யோத். யோ என்று நீட்டி, மெதுவாகத் த் ஒலியில் முடிக்கவும்.", symbolic: "Hand, Work, Deed" },
    { letter: "כ", name: "KAF", hebrewName: "כף", number: 20, latinPronunciation: "Kaf", tamilPronunciation: "காஃப்", tamilGuide: "காஃப். கா ஒலியுடன் தொடங்கி, ஃப் ஒலி தெளிவாக சொல்லுங்கள்.", symbolic: "Palm, Open Hand, To Cover" },
    { letter: "ל", name: "LAMED", hebrewName: "למד", number: 30, latinPronunciation: "Lah-med", tamilPronunciation: "லாமெட்", tamilGuide: "லாமெட். லா என்று தொடங்கி, மெத் ஒலியில் மெதுவாக முடிக்கவும்.", symbolic: "Staff, Goad, To Teach/Lead" },
    { letter: "מ", name: "MEM", hebrewName: "מם", number: 40, latinPronunciation: "Mem", tamilPronunciation: "மேம்", tamilGuide: "மேம். மே என்று நீட்டி, ம் ஒலியில் முடிக்கவும்.", symbolic: "Water, Chaos, Mighty" },
    { letter: "נ", name: "NUN", hebrewName: "נון", number: 50, latinPronunciation: "Noon", tamilPronunciation: "நூன்", tamilGuide: "நூன். நூ என்று நீட்டி, ந் ஒலி மெதுவாக முடிக்கவும்.", symbolic: "Fish, Seed, Life/Action" },
    { letter: "ס", name: "SAMEKH", hebrewName: "סמך", number: 60, latinPronunciation: "Sah-mekh", tamilPronunciation: "சாமெக்", tamilGuide: "சாமெக். சா என்று தொடங்கி, மெக் என்று மெதுவாக முடிக்கவும்.", symbolic: "Prop, Support, To Lean" },
    { letter: "ע", name: "AYIN", hebrewName: "עין", number: 70, latinPronunciation: "Ah-yin", tamilPronunciation: "ஆயின்", tamilGuide: "ஆயின். ஆ என்று திறந்த ஒலியுடன் தொடங்கி, யின் என்று சொல்லுங்கள்.", symbolic: "Eye, To See, Understand" },
    { letter: "פ", name: "PE", hebrewName: "פה", number: 80, latinPronunciation: "Peh", tamilPronunciation: "பே", tamilGuide: "பே. உதட்டை சேர்த்து ப ஒலி தெளிவாக கூறி, ஏ ஒலியை நீட்டுங்கள்.", symbolic: "Mouth, Word, To Speak" },
    { letter: "צ", name: "TSADE", hebrewName: "צדי", number: 90, latinPronunciation: "Tsah-deh", tamilPronunciation: "ட்சாதே", tamilGuide: "ட்சாதே. ட்ஸ் ஒலியுடன் தொடங்கி, சாதே என்று மெதுவாக சொல்லுங்கள்.", symbolic: "Fishhook, To Pull, Righteous" },
    { letter: "ק", name: "QOPH", hebrewName: "קוף", number: 100, latinPronunciation: "Qof", tamilPronunciation: "கோஃப்", tamilGuide: "கோஃப். தொண்டை ஒலியுடன் கோ என்று சொல்லி, ஃப் ஒலியில் முடிக்கவும்.", symbolic: "Sun on Horizon, Time, Circle" },
    { letter: "ר", name: "RESH", hebrewName: "ריש", number: 200, latinPronunciation: "Resh", tamilPronunciation: "ரேஷ்", tamilGuide: "ரேஷ். ரே என்று தொடங்கி, ஷ் ஒலி மெதுவாக முடிக்கவும்.", symbolic: "Head, Person, Highest" },
    { letter: "ש", name: "SHIN", hebrewName: "שין", number: 300, latinPronunciation: "Sheen", tamilPronunciation: "ஷீன்", tamilGuide: "ஷீன். ஷீ என்று நீட்டி, ந் ஒலியில் முடிக்கவும்.", symbolic: "Teeth, To Consume, Destroy" },
    { letter: "ת", name: "TAV", hebrewName: "תו", number: 400, latinPronunciation: "Tav", tamilPronunciation: "தாவ்", tamilGuide: "தாவ். தா என்று கூறி, வ் ஒலி மெதுவாக முடிக்கவும்.", symbolic: "Mark, Sign, Covenant" },
];

// Responsive column counts for breakpoints
const COLS_MAP = { default: 2, sm: 3, md: 4, lg: 5 };

export interface HebrewAlphabetPageProps {
    onBack?: () => void;
}

export const HebrewAlphabetPage: React.FC<HebrewAlphabetPageProps> = ({ onBack }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [cols, setCols] = useState(COLS_MAP.default);
    const panelRef = useRef<HTMLDivElement>(null);

    // Responsive column detection
    useEffect(() => {
        const updateCols = () => {
            const w = window.innerWidth;
            if (w >= 1024) setCols(COLS_MAP.lg);
            else if (w >= 768) setCols(COLS_MAP.md);
            else if (w >= 640) setCols(COLS_MAP.sm);
            else setCols(COLS_MAP.default);
        };
        updateCols();
        window.addEventListener('resize', updateCols);
        return () => window.removeEventListener('resize', updateCols);
    }, []);

    // Scroll to the expanded panel when it appears
    useEffect(() => {
        if (selectedIndex !== null && panelRef.current) {
            setTimeout(() => {
                panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 150);
        }
    }, [selectedIndex]);

    const handlePlay = async (index: number, hebrewText: string, rate: number = 0.8) => {
        setActiveIndex(index);
        try {
            await audioService.playHebrew(hebrewText, rate);
        } catch (error) {
            console.warn('Hebrew pronunciation playback failed:', error);
        } finally {
            setTimeout(() => setActiveIndex(null), 2000);
        }
    };

    const handleAudioButtonClick = (event: React.MouseEvent<HTMLButtonElement>, index: number, hebrewText: string) => {
        event.stopPropagation();
        handlePlay(index, hebrewText);
    };

    const selectedLetter = selectedIndex !== null ? HEBREW_LETTERS[selectedIndex] : null;
    const letterCount = HEBREW_LETTERS.length;

    // Determine which row the selected letter is in
    const selectedRow = selectedIndex !== null ? Math.floor(selectedIndex / cols) : -1;

    // Build rows of letter indices
    const rows: number[][] = useMemo(() => {
        const r: number[][] = [];
        for (let i = 0; i < HEBREW_LETTERS.length; i += cols) {
            r.push(HEBREW_LETTERS.slice(i, i + cols).map((_, j) => i + j));
        }
        return r;
    }, [cols]);

    return (
        <div className="min-h-[100dvh] w-full bg-[#000000] text-[#e5e5e5] pb-24 overflow-x-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-white/0 to-transparent pointer-events-none"></div>
            
            {onBack && (
                <button
                    onClick={onBack}
                    className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/15 hover:border-white/30 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-xl backdrop-blur-md cursor-pointer hover:scale-105"
                >
                    <ArrowLeft size={14} strokeWidth={2.5} />
                    <span>Back to Home</span>
                </button>
            )}

            <div className="w-full mx-auto px-4 sm:px-6 max-w-6xl relative z-10 pt-24 md:pt-28">
                <header className="text-center mb-16 space-y-4">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center border border-white/15 shadow-[0_0_40px_rgba(255,255,255,0.08)] mb-6">
                        <Scroll size={36} strokeWidth={1.5} className="text-white/80" />
                    </motion.div>
                    <h1 className="font-serif text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-[#FBBF24] via-[#F59E0B] to-[#D97706] tracking-wider uppercase font-bold px-2 drop-shadow-xl">Lashon HaKodesh</h1>
                    <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#F59E0B]/50 to-transparent mx-auto mt-4 mb-4"></div>
                    <p className="text-xs md:text-sm tracking-[4px] md:tracking-[6px] text-[#F59E0B]/50 uppercase font-bold">The Holy Tongue: Hebrew Aleph-Bet · ஆலெஃப்-பேத்</p>
                    <div className="flex items-center justify-center gap-3 md:gap-4 pt-2">
                        <div className="px-4 py-2 rounded-2xl border border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#FBBF24] text-xs md:text-sm font-black tracking-[0.15em] uppercase">
                            {letterCount} Letters
                        </div>
                        <div className="px-4 py-2 rounded-2xl border border-white/20 bg-white/10 text-white text-xs md:text-sm font-black tracking-[0.15em] uppercase">
                            3000+ Years Old
                        </div>
                    </div>
                </header>

                {/* LETTER GRID — rendered row by row to insert pronunciation panel between rows */}
                <div className="max-w-6xl mx-auto space-y-5 md:space-y-7">
                    {rows.map((rowIndices, rowIdx) => (
                        <React.Fragment key={rowIdx}>
                            {/* Letter cards for this row */}
                            <div className="grid gap-5 md:gap-7" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                                {rowIndices.map(index => {
                                    if (index >= HEBREW_LETTERS.length) return <div key={index} />;
                                    const item = HEBREW_LETTERS[index];
                                    return (
                                        <motion.div
                                            key={item.letter}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                if (selectedIndex === index) {
                                                    setSelectedIndex(null);
                                                } else {
                                                    setSelectedIndex(index);
                                                    handlePlay(index, item.hebrewName);
                                                }
                                            }}
                                            className={`bg-gradient-to-br from-white/[0.04] to-white/[0.02] border rounded-[2rem] p-6 md:p-8 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden backdrop-blur-sm group
                                                ${selectedIndex === index
                                                    ? 'border-[#FBBF24]/70 bg-gradient-to-br from-[#F59E0B]/15 to-[#D97706]/10 shadow-[0_0_50px_rgba(245,158,11,0.25),inset_0_0_20px_rgba(245,158,11,0.08)] ring-2 ring-[#F59E0B]/30'
                                                    : activeIndex === index
                                                        ? 'border-white/30 bg-gradient-to-br from-white/10 to-white/5 shadow-[0_0_40px_rgba(255,255,255,0.2),inset_0_0_20px_rgba(255,255,255,0.08)]'
                                                        : 'border-[#F59E0B]/40 bg-gradient-to-br from-[#F59E0B]/10 to-[#D97706]/5 shadow-[0_0_30px_rgba(245,158,11,0.12)] hover:border-white/30 hover:bg-gradient-to-br hover:from-white/10 hover:to-white/5 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                                                }`}
                                        >
                                            {/* Selection indicator arrow */}
                                            {selectedIndex === index && (
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#F59E0B]/10 border-l border-b border-[#F59E0B]/40 rotate-[-45deg] z-10" />
                                            )}
                                            <button
                                                onClick={(event) => handleAudioButtonClick(event, index, item.hebrewName)}
                                                className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 ${activeIndex === index ? 'opacity-100 bg-white/20 scale-110' : 'bg-[#F59E0B]/20 opacity-100 group-hover:bg-white/20'}`}
                                                title={`Play ${item.name}`}
                                                aria-label={`Play ${item.name} pronunciation`}
                                            >
                                                <Volume2 size={14} className="text-[#F59E0B]" />
                                            </button>
                                            <span className={`text-6xl md:text-[5rem] text-transparent bg-clip-text mb-5 font-serif transition-transform duration-500 drop-shadow-lg leading-none ${
                                                selectedIndex === index
                                                    ? 'bg-gradient-to-b from-[#FBBF24] to-[#F59E0B] scale-110'
                                                    : activeIndex === index
                                                        ? 'bg-gradient-to-b from-white to-white/70 scale-110'
                                                        : 'bg-gradient-to-b from-[#FBBF24] to-[#F59E0B] group-hover:from-white group-hover:to-white/70 group-hover:scale-110'
                                            }`}>
                                                {item.letter}
                                            </span>
                                            <div className="text-center space-y-1">
                                                <strong className="block text-[#F59E0B] text-sm md:text-base tracking-[0.2em] font-bold uppercase group-hover:text-white/90 transition-colors">{item.name}</strong>
                                                <span className="block text-[#F59E0B]/70 text-xs md:text-sm tracking-wide group-hover:text-white/60 transition-colors">{item.tamilPronunciation}</span>
                                                <div className="mt-3 inline-block bg-[#F59E0B]/10 group-hover:bg-white/10 px-3 py-1 rounded-full border border-[#F59E0B]/30 group-hover:border-white/25 transition-all">
                                                    <span className="text-xs text-[#F59E0B]/80 group-hover:text-white/60 font-mono tracking-widest transition-colors">VALUE: {item.number}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* INLINE PRONUNCIATION PANEL — appears after the row containing the selected letter */}
                            <AnimatePresence>
                                {selectedRow === rowIdx && selectedLetter && (
                                    <motion.div
                                        ref={panelRef}
                                        key={`panel-${selectedIndex}`}
                                        initial={{ opacity: 0, height: 0, scaleY: 0.9 }}
                                        animate={{ opacity: 1, height: 'auto', scaleY: 1 }}
                                        exit={{ opacity: 0, height: 0, scaleY: 0.9 }}
                                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                        className="overflow-hidden origin-top"
                                    >
                                        <div className="rounded-[2rem] border border-[#F59E0B]/30 bg-gradient-to-br from-[#0d0a00] to-[#000000] p-5 md:p-8 relative">
                                            {/* Decorative top connector line */}
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[2px] bg-gradient-to-r from-transparent via-[#F59E0B]/50 to-transparent" />

                                            {/* Close button */}
                                            <button
                                                onClick={() => setSelectedIndex(null)}
                                                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-white/40 hover:text-white/70 z-10"
                                            >
                                                <X size={14} />
                                            </button>

                                            <div className="text-[10px] uppercase tracking-[0.28em] text-[#F59E0B]/50 font-black mb-4">
                                                Pronunciation Guide · உச்சரிப்பு வழிகாட்டி
                                            </div>

                                            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                                                {/* LEFT: Letter info + details */}
                                                <div className="flex-1 min-w-0 space-y-4">
                                                    <div className="flex items-center gap-6">
                                                        <div className="relative w-36 h-36 md:w-40 md:h-40 flex-shrink-0 select-none">
                                                            {/* Grid Guidelines Background */}
                                                            <div className="absolute inset-0 rounded-[2rem] border border-sky-400/40 bg-sky-950/20 overflow-hidden shadow-[0_0_28px_rgba(125,211,252,0.42),inset_0_0_26px_rgba(250,204,21,0.15)]">
                                                                {/* Guidelines */}
                                                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-amber-400/25" />
                                                                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-sky-400/30" />
                                                            </div>
                                                            <span className="absolute inset-0 flex items-center justify-center font-serif text-7xl md:text-8xl text-white drop-shadow-[0_0_22px_rgba(125,211,252,0.95)]">
                                                                {selectedLetter.letter}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-2 pb-1">
                                                            <div className="text-3xl md:text-4xl lg:text-5xl font-black tracking-[0.14em] text-white leading-none">{selectedLetter.name}</div>
                                                            <div className="text-xl md:text-2xl text-[#F59E0B]/80 font-serif leading-none mt-1">{selectedLetter.hebrewName}</div>
                                                        </div>
                                                    </div>

                                                    {/* Pronunciation details */}
                                                    <div className="space-y-2.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-[#F59E0B]/50 uppercase tracking-widest w-20 shrink-0">English</span>
                                                            <span className="text-sm text-white/90 font-bold">{selectedLetter.latinPronunciation}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-[#F59E0B]/50 uppercase tracking-widest w-20 shrink-0">தமிழ்</span>
                                                            <span className="text-sm text-[#F59E0B]/80 font-bold">{selectedLetter.tamilPronunciation}</span>
                                                        </div>
                                                    </div>

                                                    {/* Tamil guide */}
                                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                                                        <div className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest mb-1.5">Tamil Pronunciation Guide</div>
                                                        <p className="text-xs text-white/60 leading-relaxed">{selectedLetter.tamilGuide}</p>
                                                    </div>

                                                    {/* Symbolic Meaning */}
                                                    {selectedLetter.symbolic && (
                                                        <div className="bg-amber-500/[0.05] border border-amber-500/[0.1] rounded-xl p-3">
                                                            <div className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                                <Sparkles size={10} />
                                                                Symbolic Meaning
                                                            </div>
                                                            <p className="text-xs text-amber-200/90 font-medium leading-relaxed">{selectedLetter.symbolic}</p>
                                                        </div>
                                                    )}

                                                    {/* Audio buttons */}
                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            onClick={() => {
                                                                if (selectedIndex === null) return;
                                                                handlePlay(selectedIndex, selectedLetter.hebrewName);
                                                            }}
                                                            className="h-9 px-3.5 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#FBBF24] text-xs font-bold tracking-wide hover:bg-[#F59E0B]/25 transition-colors flex items-center gap-1.5"
                                                        >
                                                            <Volume2 size={12} /> Hebrew Audio
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (selectedIndex === null) return;
                                                                // Strip vowels and space out letters to force spelling
                                                                const consonants = selectedLetter.hebrewName.replace(/[\u0591-\u05C7]/g, '');
                                                                handlePlay(selectedIndex, consonants.split('').join(' '), 0.55);
                                                            }}
                                                            className="h-9 px-3.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold tracking-wide hover:bg-white/20 transition-colors flex items-center gap-1.5"
                                                        >
                                                            <Volume2 size={12} /> Slow Audio
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (!selectedLetter) return;
                                                                audioService.playTamil(selectedLetter.tamilGuide, 0.78);
                                                            }}
                                                            className="h-9 px-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-wide hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
                                                        >
                                                            <Volume2 size={12} /> தமிழ் Teaching Audio
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* RIGHT: Mouth Pronunciation Animator */}
                                                <div className="flex-shrink-0 w-full md:w-auto flex justify-center">
                                                    <MouthPronunciationAnimator
                                                        phonemeSequence={HEBREW_LETTER_PHONEMES[selectedLetter.letter] || []}
                                                        wordText={selectedLetter.hebrewName}
                                                        phonetic={selectedLetter.latinPronunciation}
                                                        tamilPhonetic={selectedLetter.tamilPronunciation}
                                                        lang="he"
                                                        theme="blue"
                                                        autoPlay={true}
                                                        showControls={true}
                                                        size={180}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </React.Fragment>
                    ))}
                </div>

                <div className="mt-24 p-8 md:p-12 bg-gradient-to-b from-white/5 to-transparent rounded-[3rem] border border-white/8 text-center space-y-6 relative overflow-hidden backdrop-blur-md">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <Sparkles className="mx-auto text-white/30" size={36} />
                    <p className="text-[10px] md:text-xs uppercase tracking-[0.28em] text-white/40 font-black">Quick Snapshot</p>
                    <div className="grid sm:grid-cols-3 gap-3 md:gap-4 max-w-3xl mx-auto">
                        <div className="rounded-2xl border border-[#F59E0B]/35 bg-[#F59E0B]/12 px-4 py-4">
                            <div className="text-3xl md:text-4xl font-black text-[#FBBF24] leading-none">{letterCount}</div>
                            <p className="text-[10px] md:text-xs font-black tracking-[0.14em] uppercase text-[#F59E0B]/80 mt-2">Letters</p>
                        </div>
                        <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4">
                            <div className="text-3xl md:text-4xl font-black text-white leading-none">{letterCount}</div>
                            <p className="text-[10px] md:text-xs font-black tracking-[0.14em] uppercase text-white/70 mt-2">Name Words</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-400/35 bg-emerald-500/10 px-4 py-4">
                            <div className="text-3xl md:text-4xl font-black text-emerald-300 leading-none">5</div>
                            <p className="text-[10px] md:text-xs font-black tracking-[0.14em] uppercase text-emerald-200/80 mt-2">Final Forms</p>
                        </div>
                    </div>
                    <p className="text-white/30 text-[11px] md:text-xs font-bold">Tap a letter card to learn pronunciation with mouth animation.</p>
                </div>
            </div>
        </div>
    );
};
