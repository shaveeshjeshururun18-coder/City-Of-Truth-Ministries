import React from 'react';
import { Scroll, Sparkles, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { audioService } from '../services/audioService';

const HEBREW_LETTERS = [
    { letter: "א", name: "ALEPH", number: 1 },
    { letter: "ב", name: "BET", number: 2 },
    { letter: "ג", name: "GIMEL", number: 3 },
    { letter: "ד", name: "DALET", number: 4 },
    { letter: "ה", name: "HE", number: 5 },
    { letter: "ו", name: "VAV", number: 6 },
    { letter: "ז", name: "ZAYIN", number: 7 },
    { letter: "ח", name: "CHET", number: 8 },
    { letter: "ט", name: "TET", number: 9 },
    { letter: "י", name: "YOD", number: 10 },
    { letter: "כ", name: "KAF", number: 20 },
    { letter: "ל", name: "LAMED", number: 30 },
    { letter: "מ", name: "MEM", number: 40 },
    { letter: "נ", name: "NUN", number: 50 },
    { letter: "ס", name: "SAMEKH", number: 60 },
    { letter: "ע", name: "AYIN", number: 70 },
    { letter: "פ", name: "PE", number: 80 },
    { letter: "צ", name: "TSADE", number: 90 },
    { letter: "ק", name: "QOPH", number: 100 },
    { letter: "ר", name: "RESH", number: 200 },
    { letter: "ש", name: "SHIN", number: 300 },
    { letter: "ת", name: "TAV", number: 400 },
];

export const HebrewAlphabetPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#050505] text-[#e5e5e5] pt-32 pb-20 overflow-hidden relative">
            {/* Background Light Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none"></div>

            <div className="container mx-auto px-6 max-w-5xl relative z-10">
                {/* Header */}
                <header className="text-center mb-10 md:mb-16 space-y-4">
                    <div className="text-amber-500 flex justify-center mb-2">
                        <Scroll size={32} md:size={48} strokeWidth={1.5} />
                    </div>
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 tracking-wider uppercase font-bold px-2">
                        Lashon HaKodesh
                    </h1>
                    <div className="w-16 md:w-24 h-0.5 bg-amber-500/30 mx-auto"></div>
                    <p className="text-[10px] md:text-sm tracking-[2px] md:tracking-[4px] text-slate-500 uppercase font-bold">The Holy Tongue: Hebrew Aleph-Bet</p>
                </header>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 max-w-6xl mx-auto">
                    {HEBREW_LETTERS.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            onClick={() => audioService.playHebrew(item.letter)}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center transition-all hover:border-amber-500/50 hover:bg-white/10 group cursor-pointer shadow-xl relative overflow-hidden"
                        >
                            <div className="absolute top-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Volume2 size={12} className="text-amber-500/50" />
                            </div>
                            <span className="text-6xl md:text-7xl text-white mb-4 font-serif group-hover:scale-110 transition-transform duration-500">{item.letter}</span>
                            <div className="text-center space-y-1">
                                <strong className="block text-amber-500 text-sm md:text-lg tracking-[0.2em] uppercase">{item.name}</strong>
                                <span className="text-xs md:text-sm text-slate-500 font-bold font-mono tracking-widest">{item.number}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Scripture Section */}
                <div className="mt-20 p-10 bg-white/5 rounded-3xl border border-amber-500/20 text-center space-y-4">
                    <Sparkles className="mx-auto text-amber-500/50" size={32} />
                    <p className="font-serif italic text-xl md:text-2xl text-amber-100/80 leading-relaxed max-w-2xl mx-auto">
                        "For then will I turn to the people a pure language, that they may all call upon the name of the Lord, to serve him with one consent."
                    </p>
                    <div className="text-amber-500 text-xs tracking-widest font-bold uppercase">Zephaniah 3:9</div>
                </div>
            </div>
        </div>
    );
};
