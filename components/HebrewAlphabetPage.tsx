import React, { useState, useRef, useCallback } from 'react';
import { Scroll, Sparkles, Volume2, X, Loader2, GripVertical, Trash2, Info, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { audioService } from '../services/audioService';
import { analyzeHebrewWord } from '../services/openRouterService';

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

interface LetterToken {
    id: string;
    letter: string;
}

interface WordAnalysis {
    pronunciation: string;
    pronunciationTa?: string;
    breakdownHe: string;
    breakdownEn: string;
    meaningEn: string;
    meaningTa: string;
    root?: string;
    description?: string;
}

let tokenCounter = 0;
const makeId = () => `tok-${++tokenCounter}-${Math.random().toString(36).slice(2, 6)}`;

export const HebrewAlphabetPage: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    // Word builder state
    const [tokens, setTokens] = useState<LetterToken[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<WordAnalysis | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [analysisWord, setAnalysisWord] = useState<string>('');
    const builderRef = useRef<HTMLDivElement>(null);

    const builtWord = tokens.map(t => t.letter).join('');

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

    // Add letter to the LEFT (prepend) — Hebrew reads right to left
    const addLetter = useCallback((letter: string) => {
        setTokens(prev => [{ id: makeId(), letter }, ...prev]);
        setAnalysis(null);
        setAnalysisError(null);
        // Scroll builder into view on mobile
        builderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, []);

    const removeToken = (id: string) => {
        setTokens(prev => prev.filter(t => t.id !== id));
        setAnalysis(null);
        setAnalysisError(null);
    };

    const clearBuilder = () => {
        setTokens([]);
        setAnalysis(null);
        setAnalysisError(null);
    };

    const handleAnalyze = async () => {
        if (!builtWord) return;
        setIsAnalyzing(true);
        setAnalysis(null);
        setAnalysisError(null);
        setAnalysisWord(builtWord);
        try {
            const result = await analyzeHebrewWord(builtWord);
            setAnalysis(result);
        } catch {
            setAnalysisError('AI analysis failed. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#000000] text-[#e5e5e5] pb-24 overflow-hidden relative">
            {/* Sticky Word Builder */}
            <div ref={builderRef} className="sticky top-[60px] z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#F59E0B]/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <div className="container mx-auto px-4 max-w-6xl py-3">
                    <div className="flex items-center gap-3">
                        {/* Label */}
                        <span className="shrink-0 text-[10px] font-black text-[#F59E0B]/60 uppercase tracking-[0.2em] hidden sm:block">Word Builder</span>

                        {/* Draggable letter tokens — displayed RTL so leftmost = first Hebrew letter */}
                        <div className="flex-1 min-h-[52px] flex items-center overflow-x-auto no-scrollbar">
                            {tokens.length === 0 ? (
                                <span className="text-[#444] text-sm italic px-2">Tap a letter below to start building…</span>
                            ) : (
                                <Reorder.Group
                                    axis="x"
                                    values={tokens}
                                    onReorder={setTokens}
                                    className="flex gap-2 items-center py-1"
                                    style={{ direction: 'ltr' }}
                                >
                                    {tokens.map((tok) => (
                                        <Reorder.Item
                                            key={tok.id}
                                            value={tok}
                                            className="relative flex flex-col items-center cursor-grab active:cursor-grabbing select-none"
                                            whileDrag={{ scale: 1.15, zIndex: 50 }}
                                        >
                                            <div className="w-11 h-11 bg-gradient-to-br from-[#F59E0B]/20 to-[#D97706]/10 border border-[#F59E0B]/50 rounded-xl flex items-center justify-center shadow-sm group">
                                                <span className="text-2xl font-serif text-[#FBBF24] leading-none">{tok.letter}</span>
                                            </div>
                                            <button
                                                onClick={() => removeToken(tok.id)}
                                                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#ef4444] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remove"
                                            >
                                                <X size={8} className="text-white" />
                                            </button>
                                            <GripVertical size={10} className="text-[#F59E0B]/30 mt-0.5" />
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            )}
                        </div>

                        {/* Word preview */}
                        {builtWord && (
                            <div className="shrink-0 flex items-center gap-1.5 bg-white/5 border border-[#F59E0B]/20 rounded-xl px-3 py-2">
                                <span className="text-xl font-serif text-[#FBBF24] tracking-widest" dir="rtl">{builtWord}</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="shrink-0 flex items-center gap-2">
                            {builtWord && (
                                <>
                                    <button
                                        onClick={() => audioService.playHebrew(builtWord)}
                                        className="w-9 h-9 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] hover:bg-[#F59E0B]/20 transition-colors"
                                        title="Listen"
                                    >
                                        <Volume2 size={16} />
                                    </button>
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing}
                                        className="h-9 px-3 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 hover:from-[#FBBF24] hover:to-[#F59E0B] transition-all disabled:opacity-50 shadow-[0_4px_12px_rgba(245,158,11,0.3)]"
                                    >
                                        {isAnalyzing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                                        Analyse
                                    </button>
                                    <button
                                        onClick={clearBuilder}
                                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                        title="Clear"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* AI Analysis Panel */}
                    <AnimatePresence>
                        {(analysis || analysisError) && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-3 pt-3 border-t border-[#F59E0B]/15">
                                    {analysisError ? (
                                        <div className="flex items-center gap-2 text-red-400 text-xs font-bold bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">
                                            <Info size={14} /> {analysisError}
                                        </div>
                                    ) : analysis && (
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                            {/* Pronunciation */}
                                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                                                <div className="text-[9px] font-black text-[#F59E0B]/60 uppercase tracking-[0.2em]">Pronunciation</div>
                                                <div className="text-base font-bold text-white">{analysis.pronunciation}</div>
                                                {analysis.pronunciationTa && <div className="text-xs text-white/50">{analysis.pronunciationTa}</div>}
                                            </div>
                                            {/* Root */}
                                            {analysis.root && (
                                                <div className="bg-white/5 border border-[#F59E0B]/20 rounded-xl p-3 space-y-1">
                                                    <div className="text-[9px] font-black text-[#F59E0B]/60 uppercase tracking-[0.2em] flex items-center gap-1"><Fingerprint size={10} /> Root (Shoresh)</div>
                                                    <div className="text-2xl font-serif text-[#FBBF24]" dir="rtl">{analysis.root}</div>
                                                </div>
                                            )}
                                            {/* Meaning */}
                                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                                                <div className="text-[9px] font-black text-[#F59E0B]/60 uppercase tracking-[0.2em]">Meaning</div>
                                                <div className="text-sm font-bold text-white/90">{analysis.meaningEn}</div>
                                                <div className="text-sm text-white/50">{analysis.meaningTa}</div>
                                            </div>
                                            {/* Description */}
                                            {analysis.description && (
                                                <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                                                    <div className="text-[9px] font-black text-[#F59E0B]/60 uppercase tracking-[0.2em]">Significance</div>
                                                    <div className="text-[11px] text-white/60 leading-relaxed italic">{analysis.description}</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-white/0 to-transparent pointer-events-none"></div>
            <div className="container mx-auto px-6 max-w-6xl relative z-10 pt-10">
                <header className="text-center mb-16 space-y-4">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center border border-white/15 shadow-[0_0_40px_rgba(255,255,255,0.08)] mb-6">
                        <Scroll size={36} strokeWidth={1.5} className="text-white/80" />
                    </motion.div>
                    <h1 className="font-serif text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-[#FBBF24] via-[#F59E0B] to-[#D97706] tracking-wider uppercase font-bold px-2 drop-shadow-xl">Lashon HaKodesh</h1>
                    <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#F59E0B]/50 to-transparent mx-auto mt-4 mb-4"></div>
                    <p className="text-xs md:text-sm tracking-[4px] md:tracking-[6px] text-[#F59E0B]/50 uppercase font-bold">The Holy Tongue: Hebrew Aleph-Bet · ஆலெஃப்-பேத்</p>
                    <p className="text-[11px] text-[#F59E0B]/40 italic">Tap any letter to play audio · Click letters to build words in the builder above</p>
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
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setSelectedIndex(index);
                                handlePlay(index, item.hebrewName);
                                addLetter(item.letter);
                            }}
                            className={`bg-gradient-to-br from-white/[0.04] to-white/[0.02] border rounded-[2rem] p-6 md:p-8 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden backdrop-blur-sm group
                                ${activeIndex === index
                                    ? 'border-white/30 bg-gradient-to-br from-white/10 to-white/5 shadow-[0_0_40px_rgba(255,255,255,0.2),inset_0_0_20px_rgba(255,255,255,0.08)]'
                                    : 'border-[#F59E0B]/40 bg-gradient-to-br from-[#F59E0B]/10 to-[#D97706]/5 shadow-[0_0_30px_rgba(245,158,11,0.12)] hover:border-white/30 hover:bg-gradient-to-br hover:from-white/10 hover:to-white/5 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                                }`}
                        >
                            <button
                                onClick={(e) => handleAudioButtonClick(e, index, item.hebrewName)}
                                className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 ${activeIndex === index ? 'opacity-100 bg-white/20 scale-110' : 'bg-[#F59E0B]/20 opacity-100 group-hover:bg-white/20'}`}
                                title={`Play ${item.name}`}
                                aria-label={`Play ${item.name} pronunciation`}
                            >
                                <Volume2 size={14} className="text-[#F59E0B]" />
                            </button>
                            <span className={`text-6xl md:text-[5rem] text-transparent bg-clip-text mb-5 font-serif transition-transform duration-500 drop-shadow-lg leading-none
                                ${activeIndex === index ? 'bg-gradient-to-b from-white to-white/70 scale-110' : 'bg-gradient-to-b from-[#FBBF24] to-[#F59E0B] group-hover:from-white group-hover:to-white/70 group-hover:scale-110'}`}>
                                {item.letter}
                            </span>
                            <div className="text-center space-y-1">
                                <strong className="block text-[#F59E0B] text-sm md:text-base tracking-[0.2em] font-bold uppercase group-hover:text-white/90 transition-colors">{item.name}</strong>
                                <span className="block text-[#F59E0B]/70 text-xs md:text-sm tracking-widest group-hover:text-white/50 transition-colors">{item.hebrewName}</span>
                                <div className="mt-3 inline-block bg-[#F59E0B]/10 group-hover:bg-white/10 px-3 py-1 rounded-full border border-[#F59E0B]/30 group-hover:border-white/25 transition-all">
                                    <span className="text-xs text-[#F59E0B]/80 group-hover:text-white/60 font-mono tracking-widest transition-colors">VALUE: {item.number}</span>
                                </div>
                            </div>
                            {/* Active pulse ring */}
                            {activeIndex === index && (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0.6 }}
                                    animate={{ scale: 1.4, opacity: 0 }}
                                    transition={{ duration: 1.2, repeat: Infinity }}
                                    className="absolute inset-0 rounded-[2rem] border border-[#F59E0B]/50 pointer-events-none"
                                />
                            )}
                        </motion.div>
                    ))}
                </div>

                <div className="mt-24 p-12 bg-gradient-to-b from-white/5 to-transparent rounded-[3rem] border border-white/8 text-center space-y-6 relative overflow-hidden backdrop-blur-md">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <Sparkles className="mx-auto text-white/30" size={36} />
                    <p className="font-serif italic text-2xl md:text-3xl text-white/80 leading-relaxed max-w-3xl mx-auto drop-shadow-md">
                        "For then will I turn to the people a pure language, that they may all call upon the name of the Lord, to serve him with one consent."
                    </p>
                    <div className="text-white/40 text-sm tracking-[0.3em] font-bold uppercase">Zephaniah 3:9</div>
                    <p className="text-white/30 text-xs">🔊 Click any card or audio icon to hear Hebrew pronunciation · Build words with the sticky Word Builder at the top</p>
                </div>
            </div>
        </div>
    );
};
