import React, { useState } from 'react';
import { Scroll, Volume2, Sparkles, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { audioService } from '../services/audioService';

const HEBREW_LETTERS = [
    { letter: "א", name: "ALEPH", hebrewName: "אלף", number: 1, latinPronunciation: "Ah-lef", tamilPronunciation: "ஆலெஃப்", tamilGuide: "ஆலெஃப். வாயை திறந்து மெதுவாக ஆ ஒலி சொல்லி, பிறகு லெஃப் சொல்லுங்கள்." },
    { letter: "ב", name: "BET", hebrewName: "בית", number: 2, latinPronunciation: "Bet", tamilPronunciation: "பெத்", tamilGuide: "பெத். பே என்று தொடங்கி, முடிவில் த் ஒலியை மெதுவாக சேர்க்கவும்." },
    { letter: "ג", name: "GIMEL", hebrewName: "גימל", number: 3, latinPronunciation: "Gee-mel", tamilPronunciation: "கீமெல்", tamilGuide: "கீமெல். கீ என்று நீட்டி, பிறகு மெல் என்று மெதுவாக சொல்லுங்கள்." },
    { letter: "ד", name: "DALET", hebrewName: "דלת", number: 4, latinPronunciation: "Dah-let", tamilPronunciation: "தாலெத்", tamilGuide: "தாலெத். தா என்று தொடங்கி, லெத் என்று முடிக்கவும்." },
    { letter: "ה", name: "HE", hebrewName: "הא", number: 5, latinPronunciation: "Heh", tamilPronunciation: "ஹே", tamilGuide: "ஹே. மெதுவான மூச்சோசையுடன் ஹே என்று சொல்லுங்கள்." },
    { letter: "ו", name: "VAV", hebrewName: "וו", number: 6, latinPronunciation: "Vav", tamilPronunciation: "வாவ்", tamilGuide: "வாவ். வா ஒலியைத் தெளிவாக சொல்லி, இறுதியில் வ் ஒலி மெதுவாக முடிக்கவும்." },
    { letter: "ז", name: "ZAYIN", hebrewName: "זין", number: 7, latinPronunciation: "Zah-yin", tamilPronunciation: "சயின்", tamilGuide: "சயின். சா அல்லது ஸா ஒலியுடன் தொடங்கி, யின் என்று முடிக்கவும்." },
    { letter: "ח", name: "CHET", hebrewName: "חית", number: 8, latinPronunciation: "Khet", tamilPronunciation: "க்ஹெட்", tamilGuide: "க்ஹெட். தொண்டையில் இருந்து வரும் க்ஹ் ஒலியுடன் ஹெட் போல சொல்லுங்கள்." },
    { letter: "ט", name: "TET", hebrewName: "טית", number: 9, latinPronunciation: "Tet", tamilPronunciation: "டெட்", tamilGuide: "டெட். டெ என்று சொல்லி, இறுதியில் ட் ஒலி தெளிவாக முடிக்கவும்." },
    { letter: "י", name: "YOD", hebrewName: "יוד", number: 10, latinPronunciation: "Yod", tamilPronunciation: "யோத்", tamilGuide: "யோத். யோ என்று நீட்டி, மெதுவாகத் த் ஒலியில் முடிக்கவும்." },
    { letter: "כ", name: "KAF", hebrewName: "כף", number: 20, latinPronunciation: "Kaf", tamilPronunciation: "காஃப்", tamilGuide: "காஃப். கா ஒலியுடன் தொடங்கி, ஃப் ஒலி தெளிவாக சொல்லுங்கள்." },
    { letter: "ל", name: "LAMED", hebrewName: "למד", number: 30, latinPronunciation: "Lah-med", tamilPronunciation: "லாமெட்", tamilGuide: "லாமெட். லா என்று தொடங்கி, மெத் ஒலியில் மெதுவாக முடிக்கவும்." },
    { letter: "מ", name: "MEM", hebrewName: "מם", number: 40, latinPronunciation: "Mem", tamilPronunciation: "மேம்", tamilGuide: "மேம். மே என்று நீட்டி, ம் ஒலியில் முடிக்கவும்." },
    { letter: "נ", name: "NUN", hebrewName: "נון", number: 50, latinPronunciation: "Noon", tamilPronunciation: "நூன்", tamilGuide: "நூன். நூ என்று நீட்டி, ந் ஒலி மெதுவாக முடிக்கவும்." },
    { letter: "ס", name: "SAMEKH", hebrewName: "סמך", number: 60, latinPronunciation: "Sah-mekh", tamilPronunciation: "சாமெக்", tamilGuide: "சாமெக். சா என்று தொடங்கி, மெக் என்று மெதுவாக முடிக்கவும்." },
    { letter: "ע", name: "AYIN", hebrewName: "עין", number: 70, latinPronunciation: "Ah-yin", tamilPronunciation: "ஆயின்", tamilGuide: "ஆயின். ஆ என்று திறந்த ஒலியுடன் தொடங்கி, யின் என்று சொல்லுங்கள்." },
    { letter: "פ", name: "PE", hebrewName: "פה", number: 80, latinPronunciation: "Peh", tamilPronunciation: "பே", tamilGuide: "பே. உதட்டை சேர்த்து ப ஒலி தெளிவாக கூறி, ஏ ஒலியை நீட்டுங்கள்." },
    { letter: "צ", name: "TSADE", hebrewName: "צדי", number: 90, latinPronunciation: "Tsah-deh", tamilPronunciation: "ட்சாதே", tamilGuide: "ட்சாதே. ட்ஸ் ஒலியுடன் தொடங்கி, சாதே என்று மெதுவாக சொல்லுங்கள்." },
    { letter: "ק", name: "QOPH", hebrewName: "קוף", number: 100, latinPronunciation: "Qof", tamilPronunciation: "கோஃப்", tamilGuide: "கோஃப். தொண்டை ஒலியுடன் கோ என்று சொல்லி, ஃப் ஒலியில் முடிக்கவும்." },
    { letter: "ר", name: "RESH", hebrewName: "ריש", number: 200, latinPronunciation: "Resh", tamilPronunciation: "ரேஷ்", tamilGuide: "ரேஷ். ரே என்று தொடங்கி, ஷ் ஒலி மெதுவாக முடிக்கவும்." },
    { letter: "ש", name: "SHIN", hebrewName: "שין", number: 300, latinPronunciation: "Sheen", tamilPronunciation: "ஷீன்", tamilGuide: "ஷீன். ஷீ என்று நீட்டி, ந் ஒலியில் முடிக்கவும்." },
    { letter: "ת", name: "TAV", hebrewName: "תו", number: 400, latinPronunciation: "Tav", tamilPronunciation: "தாவ்", tamilGuide: "தாவ். தா என்று கூறி, வ் ஒலி மெதுவாக முடிக்கவும்." },
];

export interface HebrewAlphabetPageProps {
    onBack?: () => void;
}

export const HebrewAlphabetPage: React.FC<HebrewAlphabetPageProps> = ({ onBack }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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

                {selectedLetter && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10 rounded-3xl border border-[#F59E0B]/30 bg-gradient-to-br from-[#F59E0B]/10 to-white/[0.03] p-6 md:p-8"
                    >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-2">
                                <div className="text-[10px] uppercase tracking-[0.28em] text-[#F59E0B]/60 font-black">Selected Letter Teaching</div>
                                <div className="flex items-end gap-3">
                                    <span className="text-5xl md:text-6xl font-serif text-[#FBBF24]">{selectedLetter.letter}</span>
                                    <div className="space-y-0.5 pb-1">
                                        <div className="text-base md:text-lg font-black tracking-[0.14em] text-white">{selectedLetter.name}</div>
                                        <div className="text-sm text-[#F59E0B]/80">{selectedLetter.hebrewName}</div>
                                    </div>
                                </div>
                                <p className="text-sm text-white/80"><span className="text-[#F59E0B]/80 font-bold">English pronunciation:</span> {selectedLetter.latinPronunciation}</p>
                                <p className="text-sm text-white/80"><span className="text-[#F59E0B]/80 font-bold">தமிழ் உச்சரிப்பு:</span> {selectedLetter.tamilPronunciation}</p>
                                <p className="text-xs md:text-sm text-white/70 leading-relaxed">{selectedLetter.tamilGuide}</p>
                            </div>

                            <div className="flex flex-wrap gap-2 md:justify-end">
                                <button
                                    onClick={() => {
                                        if (selectedIndex === null) return;
                                        handlePlay(selectedIndex, selectedLetter.hebrewName);
                                    }}
                                    className="h-9 px-3 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#FBBF24] text-xs font-bold tracking-wide hover:bg-[#F59E0B]/25 transition-colors"
                                >
                                    Hebrew Audio
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedIndex === null) return;
                                        handlePlay(selectedIndex, selectedLetter.hebrewName, 0.55);
                                    }}
                                    className="h-9 px-3 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold tracking-wide hover:bg-white/20 transition-colors"
                                >
                                    Slow Audio
                                </button>
                                <button
                                    onClick={() => {
                                        if (!selectedLetter) return;
                                        audioService.playTamil(selectedLetter.tamilGuide, 0.78);
                                    }}
                                    className="h-9 px-3 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/40 text-[#86efac] text-xs font-bold tracking-wide hover:bg-[#22c55e]/20 transition-colors"
                                >
                                    தமிழ் Teaching Audio
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-7 max-w-6xl mx-auto">
                    {HEBREW_LETTERS.map((item, index) => (
                        <motion.div
                            key={item.letter}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setSelectedIndex(index);
                                handlePlay(index, item.hebrewName);
                            }}
                            className={`bg-gradient-to-br from-white/[0.04] to-white/[0.02] border rounded-[2rem] p-6 md:p-8 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden backdrop-blur-sm group
                                ${activeIndex === index
                                    ? 'border-white/30 bg-gradient-to-br from-white/10 to-white/5 shadow-[0_0_40px_rgba(255,255,255,0.2),inset_0_0_20px_rgba(255,255,255,0.08)]'
                                    : 'border-[#F59E0B]/40 bg-gradient-to-br from-[#F59E0B]/10 to-[#D97706]/5 shadow-[0_0_30px_rgba(245,158,11,0.12)] hover:border-white/30 hover:bg-gradient-to-br hover:from-white/10 hover:to-white/5 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                                }`}
                        >
                            <button
                                onClick={(event) => handleAudioButtonClick(event, index, item.hebrewName)}
                                className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 ${activeIndex === index ? 'opacity-100 bg-white/20 scale-110' : 'bg-[#F59E0B]/20 opacity-100 group-hover:bg-white/20'}`}
                                title={`Play ${item.name}`}
                                aria-label={`Play ${item.name} pronunciation`}
                            >
                                <Volume2 size={14} className="text-[#F59E0B]" />
                            </button>
                            <span className={`text-6xl md:text-[5rem] text-transparent bg-clip-text mb-5 font-serif transition-transform duration-500 drop-shadow-lg leading-none ${activeIndex === index ? 'bg-gradient-to-b from-white to-white/70 scale-110' : 'bg-gradient-to-b from-[#FBBF24] to-[#F59E0B] group-hover:from-white group-hover:to-white/70 group-hover:scale-110'}`}>
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
                    <p className="text-white/30 text-[11px] md:text-xs font-bold">Tap a letter card to learn pronunciation instantly.</p>
                </div>
            </div>
        </div>
    );
};
