import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, Volume2, X, Loader2, Trash2, Info, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { audioService } from '../services/audioService';
import { analyzeHebrewWord } from '../services/openRouterService';

const HEBREW_LETTERS = [
    { letter: "א", name: "ALEPH", hebrewName: "אלף", tamilName: "ஆலெஃப்", number: 1 },
    { letter: "ב", name: "BET", hebrewName: "בית", tamilName: "பேத்", number: 2 },
    { letter: "ג", name: "GIMEL", hebrewName: "גימל", tamilName: "கிமேல்", number: 3 },
    { letter: "ד", name: "DALET", hebrewName: "דלת", tamilName: "டாலேத்", number: 4 },
    { letter: "ה", name: "HE", hebrewName: "הא", tamilName: "ஹேய்", number: 5 },
    { letter: "ו", name: "VAV", hebrewName: "וו", tamilName: "வாவ்", number: 6 },
    { letter: "ז", name: "ZAYIN", hebrewName: "זין", tamilName: "ஜாயின்", number: 7 },
    { letter: "ח", name: "CHET", hebrewName: "חית", tamilName: "செத்", number: 8 },
    { letter: "ט", name: "TET", hebrewName: "טית", tamilName: "டேத்", number: 9 },
    { letter: "י", name: "YOD", hebrewName: "יוד", tamilName: "யோத்", number: 10 },
    { letter: "כ", name: "KAF", hebrewName: "כף", tamilName: "காஃப்", number: 20 },
    { letter: "ל", name: "LAMED", hebrewName: "למד", tamilName: "லாமேத்", number: 30 },
    { letter: "מ", name: "MEM", hebrewName: "מם", tamilName: "மேம்", number: 40 },
    { letter: "נ", name: "NUN", hebrewName: "נון", tamilName: "நூன்", number: 50 },
    { letter: "ס", name: "SAMEKH", hebrewName: "סמך", tamilName: "சாமேக்", number: 60 },
    { letter: "ע", name: "AYIN", hebrewName: "עין", tamilName: "ஆயின்", number: 70 },
    { letter: "פ", name: "PE", hebrewName: "פה", tamilName: "பேய்", number: 80 },
    { letter: "צ", name: "TSADE", hebrewName: "צדי", tamilName: "ஸாதே", number: 90 },
    { letter: "ק", name: "QOPH", hebrewName: "קוף", tamilName: "கோஃப்", number: 100 },
    { letter: "ר", name: "RESH", hebrewName: "ריש", tamilName: "ரேஷ்", number: 200 },
    { letter: "ש", name: "SHIN", hebrewName: "שין", tamilName: "ஷின்", number: 300 },
    { letter: "ת", name: "TAV", hebrewName: "תו", tamilName: "தாவ்", number: 400 },
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
    // Word builder state
    const [tokens, setTokens] = useState<LetterToken[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<WordAnalysis | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [analysisWord, setAnalysisWord] = useState<string>('');
    const builderRef = useRef<HTMLDivElement>(null);

    const builtWord = tokens.map(t => t.letter).join('');

    const handlePlay = async (index: number, hebrewText: string) => {
        setActiveIndex(index);
        try {
            await audioService.playHebrew(hebrewText);
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
        <div className="min-h-screen bg-[#000000] text-[#e5e5e5] pb-28 overflow-hidden relative">
            {/* Sticky Word Builder — compact, clean */}
            <div ref={builderRef} className="sticky top-[60px] z-40 bg-[#0d0d0d]/98 backdrop-blur-xl border-b border-white/8 shadow-[0_2px_16px_rgba(0,0,0,0.4)]">
                <div className="container mx-auto px-4 max-w-6xl py-2.5">
                    <div className="flex items-center gap-2.5">
                        {/* Label */}
                        <div className="shrink-0 hidden sm:block">
                            <span className="text-[9px] font-black text-[#F59E0B]/50 uppercase tracking-[0.18em] block leading-none">Word</span>
                            <span className="text-[9px] font-black text-[#F59E0B]/50 uppercase tracking-[0.18em] block leading-none">Builder</span>
                        </div>

                        {/* Draggable letter tokens */}
                        <div className="flex-1 min-h-[46px] flex items-center overflow-x-auto no-scrollbar">
                            {tokens.length === 0 ? (
                                <span className="text-[11px] text-white/20 italic pl-1">Tap a letter below to start building…</span>
                            ) : (
                                <Reorder.Group
                                    axis="x"
                                    values={tokens}
                                    onReorder={setTokens}
                                    className="flex gap-1.5 items-center py-1"
                                    style={{ direction: 'ltr' }}
                                >
                                    {tokens.map((tok) => (
                                        <Reorder.Item
                                            key={tok.id}
                                            value={tok}
                                            className="relative flex flex-col items-center cursor-grab active:cursor-grabbing select-none group"
                                            whileDrag={{ scale: 1.15, zIndex: 50 }}
                                        >
                                            <div className="w-10 h-10 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl flex items-center justify-center">
                                                <span className="text-xl font-serif text-[#FBBF24] leading-none">{tok.letter}</span>
                                            </div>
                                            <button
                                                onClick={() => removeToken(tok.id)}
                                                className="absolute -top-1 -right-1 w-4 h-4 bg-[#ef4444] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remove"
                                            >
                                                <X size={8} className="text-white" />
                                            </button>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            )}
                        </div>

                        {/* Word preview */}
                        {builtWord && (
                            <div className="shrink-0 px-3 py-1.5 bg-white/5 rounded-lg border border-[#F59E0B]/15">
                                <span className="text-lg font-serif text-[#FBBF24]" dir="rtl">{builtWord}</span>
                            </div>
                        )}

                        {/* Actions — clear button hierarchy */}
                        <div className="shrink-0 flex items-center gap-1.5">
                            {builtWord && (
                                <>
                                    {/* Primary: Play */}
                                    <button
                                        onClick={() => audioService.playHebrew(builtWord)}
                                        className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-black shadow-[0_4px_12px_rgba(245,158,11,0.35)] hover:shadow-[0_4px_16px_rgba(245,158,11,0.5)] transition-all"
                                        title="Play word"
                                    >
                                        <Volume2 size={15} />
                                    </button>
                                    {/* Secondary: Analyse */}
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing}
                                        className="h-9 px-3 rounded-xl border border-[#F59E0B]/40 text-[#F59E0B] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#F59E0B]/10 transition-all disabled:opacity-40"
                                    >
                                        {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                        <span className="hidden sm:inline">Analyse</span>
                                    </button>
                                    {/* Tertiary: Clear */}
                                    <button
                                        onClick={clearBuilder}
                                        className="text-white/25 hover:text-red-400 transition-colors px-1 py-1"
                                        title="Clear"
                                    >
                                        <Trash2 size={14} />
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
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-2.5 pt-2.5 border-t border-white/8">
                                    {analysisError ? (
                                        <div className="flex items-center gap-2 text-red-400 text-xs font-bold bg-red-500/8 px-3 py-2.5 rounded-xl">
                                            <Info size={13} /> {analysisError}
                                        </div>
                                    ) : analysis && (
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                            <div className="bg-white/4 rounded-xl p-3 space-y-1">
                                                <div className="text-[9px] font-bold text-[#F59E0B]/50 uppercase tracking-widest">Pronunciation</div>
                                                <div className="text-sm font-bold text-white">{analysis.pronunciation}</div>
                                                {analysis.pronunciationTa && <div className="text-xs text-white/40">{analysis.pronunciationTa}</div>}
                                            </div>
                                            {analysis.root && (
                                                <div className="bg-white/4 rounded-xl p-3 space-y-1">
                                                    <div className="text-[9px] font-bold text-[#F59E0B]/50 uppercase tracking-widest flex items-center gap-1"><Fingerprint size={9} /> Root</div>
                                                    <div className="text-2xl font-serif text-[#FBBF24]" dir="rtl">{analysis.root}</div>
                                                </div>
                                            )}
                                            <div className="bg-white/4 rounded-xl p-3 space-y-1">
                                                <div className="text-[9px] font-bold text-[#F59E0B]/50 uppercase tracking-widest">Meaning</div>
                                                <div className="text-sm font-medium text-white/85">{analysis.meaningEn}</div>
                                                <div className="text-xs text-white/40">{analysis.meaningTa}</div>
                                            </div>
                                            {analysis.description && (
                                                <div className="bg-white/4 rounded-xl p-3 space-y-1">
                                                    <div className="text-[9px] font-bold text-[#F59E0B]/50 uppercase tracking-widest">Significance</div>
                                                    <div className="text-[11px] text-white/50 leading-relaxed italic">{analysis.description}</div>
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

            <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10 pt-8">
                {/* Compact header */}
                <header className="text-center mb-10 space-y-2">
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="font-serif text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-[#FBBF24] to-[#D97706] tracking-wide font-bold">Lashon HaKodesh</h1>
                        <p className="text-[11px] tracking-[3px] text-[#F59E0B]/40 uppercase font-semibold mt-2">Hebrew Aleph-Bet · ஆலெஃப்-பேத்</p>
                        <p className="text-[10px] text-white/20 mt-1.5">Tap any letter to hear it · letters are added to the Word Builder above</p>
                    </motion.div>
                </header>

                {/* Alphabet grid — spacious cards, soft shadows, thin borders */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 max-w-6xl mx-auto">
                    {HEBREW_LETTERS.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.025 }}
                            whileHover={{ scale: 1.04, y: -3 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => {
                                handlePlay(index, item.hebrewName);
                                addLetter(item.letter);
                            }}
                            className={`relative rounded-2xl p-5 md:p-6 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden
                                ${activeIndex === index
                                    ? 'bg-white/10 border border-white/20 shadow-[0_0_24px_rgba(255,255,255,0.12)]'
                                    : 'bg-white/[0.03] border border-white/8 shadow-sm hover:bg-white/8 hover:border-white/15 hover:shadow-[0_4px_20px_rgba(245,158,11,0.08)]'
                                }`}
                        >
                            {/* Audio button — top-right, minimal */}
                            <button
                                onClick={(e) => handleAudioButtonClick(e, index, item.hebrewName)}
                                className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${activeIndex === index ? 'bg-white/20 text-white' : 'bg-white/5 text-[#F59E0B]/60 opacity-0 group-hover:opacity-100'}`}
                                title={`Play ${item.name}`}
                                aria-label={`Play ${item.name} pronunciation`}
                            >
                                <Volume2 size={12} />
                            </button>

                            {/* Hebrew letter — large, prominent */}
                            <span className={`text-5xl md:text-6xl font-serif mb-3 leading-none transition-all duration-300
                                ${activeIndex === index ? 'text-white scale-110 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'text-[#FBBF24] group-hover:text-white group-hover:scale-105'}`}>
                                {item.letter}
                            </span>

                            {/* Text info */}
                            <div className="text-center space-y-0.5 w-full">
                                <strong className={`block text-xs md:text-sm font-bold tracking-[0.15em] uppercase transition-colors ${activeIndex === index ? 'text-white' : 'text-[#F59E0B]/80 group-hover:text-white/80'}`}>
                                    {item.name}
                                </strong>
                                <span className={`block text-xs font-medium transition-colors ${activeIndex === index ? 'text-white/60' : 'text-[#F59E0B]/50 group-hover:text-white/40'}`}>
                                    {item.tamilName}
                                </span>
                                <span className={`inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded-full transition-colors ${activeIndex === index ? 'text-white/50 bg-white/10' : 'text-[#F59E0B]/40 bg-[#F59E0B]/5 group-hover:text-white/40 group-hover:bg-white/5'}`}>
                                    {item.number}
                                </span>
                            </div>

                            {/* Active pulse ring */}
                            {activeIndex === index && (
                                <motion.div
                                    initial={{ scale: 0.85, opacity: 0.5 }}
                                    animate={{ scale: 1.35, opacity: 0 }}
                                    transition={{ duration: 1.0, repeat: Infinity }}
                                    className="absolute inset-0 rounded-2xl border border-[#F59E0B]/30 pointer-events-none"
                                />
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Footer quote — spacious, clean */}
                <div className="mt-16 px-8 py-10 bg-white/[0.025] rounded-3xl border border-white/6 text-center space-y-4">
                    <Sparkles className="mx-auto text-[#F59E0B]/30" size={28} />
                    <p className="font-serif italic text-lg md:text-xl text-white/60 leading-relaxed max-w-2xl mx-auto">
                        "For then will I turn to the people a pure language, that they may all call upon the name of the Lord."
                    </p>
                    <div className="text-[#F59E0B]/30 text-xs tracking-[0.25em] font-bold uppercase">Zephaniah 3:9</div>
                </div>
            </div>
        </div>
    );
};
