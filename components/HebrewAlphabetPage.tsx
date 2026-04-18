import React, { useState } from 'react';
import { Scroll, Sparkles, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { audioService } from '../services/audioService';

const HEBREW_LETTERS = [
    { letter: "א", name: "ALEPH", tamil: "ஆலெஃப்", number: 1 },
    { letter: "ב", name: "BET", tamil: "பேத்", number: 2 },
    { letter: "ג", name: "GIMEL", tamil: "கிமெல்", number: 3 },
    { letter: "ד", name: "DALET", tamil: "தாலேத்", number: 4 },
    { letter: "ה", name: "HE", tamil: "ஹே", number: 5 },
    { letter: "ו", name: "VAV", tamil: "வாவ்", number: 6 },
    { letter: "ז", name: "ZAYIN", tamil: "சாயின்", number: 7 },
    { letter: "ח", name: "CHET", tamil: "ஹேத்", number: 8 },
    { letter: "ט", name: "TET", tamil: "தேத்", number: 9 },
    { letter: "י", name: "YOD", tamil: "யோத்", number: 10 },
    { letter: "כ", name: "KAF", tamil: "காஃப்", number: 20 },
    { letter: "ל", name: "LAMED", tamil: "லாமெத்", number: 30 },
    { letter: "מ", name: "MEM", tamil: "மேம்", number: 40 },
    { letter: "נ", name: "NUN", tamil: "நூன்", number: 50 },
    { letter: "ס", name: "SAMEKH", tamil: "சாமெக்", number: 60 },
    { letter: "ע", name: "AYIN", tamil: "அயின்", number: 70 },
    { letter: "פ", name: "PE", tamil: "பே", number: 80 },
    { letter: "צ", name: "TSADE", tamil: "சாதே", number: 90 },
    { letter: "ק", name: "QOPH", tamil: "கோஃப்", number: 100 },
    { letter: "ר", name: "RESH", tamil: "ரேஷ்", number: 200 },
    { letter: "ש", name: "SHIN", tamil: "ஷின்", number: 300 },
    { letter: "ת", name: "TAV", tamil: "தாவ்", number: 400 },
];

export const HebrewAlphabetPage: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const handlePlay = (index: number, tamil: string) => {
        setActiveIndex(index);
        audioService.playTamil(tamil);
        setTimeout(() => setActiveIndex(null), 2000);
    };

    return (
        <div className="min-h-screen bg-[#000000] text-[#e5e5e5] pt-32 pb-20 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-white/0 to-transparent pointer-events-none"></div>
            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <header className="text-center mb-16 space-y-4">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center border border-white/15 shadow-[0_0_40px_rgba(255,255,255,0.08)] mb-6">
                        <Scroll size={36} strokeWidth={1.5} className="text-white/80" />
                    </motion.div>
                    <h1 className="font-serif text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/50 tracking-wider uppercase font-bold px-2 drop-shadow-xl">Lashon HaKodesh</h1>
                    <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mt-4 mb-4"></div>
                    <p className="text-xs md:text-sm tracking-[4px] md:tracking-[6px] text-white/40 uppercase font-bold">The Holy Tongue: Hebrew Aleph-Bet · ஆலெஃப்-பேத்</p>
                </header>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-7 max-w-6xl mx-auto">
                    {HEBREW_LETTERS.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePlay(index, item.tamil)}
                            className={`bg-gradient-to-br from-white/[0.04] to-white/[0.02] border rounded-[2rem] p-6 md:p-8 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden backdrop-blur-sm group
                                ${activeIndex === index
                                    ? 'border-white/40 bg-gradient-to-br from-white/10 to-white/5 shadow-[0_0_40px_rgba(255,255,255,0.15),inset_0_0_20px_rgba(255,255,255,0.05)]'
                                    : 'border-white/8 hover:border-white/25 hover:bg-gradient-to-br hover:from-white/8 hover:to-transparent hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]'
                                }`}
                        >
                            <div className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 ${activeIndex === index ? 'opacity-100 bg-white/15 scale-110' : 'bg-white/5 opacity-0 group-hover:opacity-100'}`}>
                                <Volume2 size={14} className="text-white/70" />
                            </div>
                            <span className={`text-6xl md:text-[5rem] text-transparent bg-clip-text bg-gradient-to-b mb-5 font-serif transition-transform duration-500 drop-shadow-lg leading-none
                                ${activeIndex === index ? 'from-white to-white/90 scale-110' : 'from-white to-white/70 group-hover:scale-110'}`}>
                                {item.letter}
                            </span>
                            <div className="text-center space-y-1">
                                <strong className="block text-white/90 text-sm md:text-base tracking-[0.2em] font-bold uppercase">{item.name}</strong>
                                <span className="block text-white/50 text-xs md:text-sm tracking-widest">{item.tamil}</span>
                                <div className="mt-3 inline-block bg-white/5 px-3 py-1 rounded-full border border-white/8">
                                    <span className="text-xs text-white/40 font-mono tracking-widest">VALUE: {item.number}</span>
                                </div>
                            </div>
                            {/* Active pulse ring */}
                            {activeIndex === index && (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0.6 }}
                                    animate={{ scale: 1.4, opacity: 0 }}
                                    transition={{ duration: 1.2, repeat: Infinity }}
                                    className="absolute inset-0 rounded-[2rem] border border-white/30 pointer-events-none"
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
                    <p className="text-white/30 text-xs">🔊 Click any card to hear the Tamil pronunciation</p>
                </div>
            </div>
        </div>
    );
};
