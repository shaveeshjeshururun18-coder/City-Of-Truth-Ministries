import React from 'react';
import { Scroll } from 'lucide-react';
import { motion } from 'framer-motion';

const hebrewLetters = [
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

export const HebrewPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#050505] text-[#e5e5e5] font-['Poppins'] flex justify-center pt-32 pb-20">
            <div className="w-full max-w-[1100px] px-5">

                {/* Header Section */}
                <header className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[#c5a059] text-4xl mb-4 flex justify-center"
                    >
                        <Scroll size={48} strokeWidth={1.5} />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="font-['Cinzel'] text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] via-[#b38728] via-[#fbf5b7] to-[#aa771c] tracking-wider uppercase mb-3 font-bold"
                    >
                        Lashon HaKodesh
                    </motion.h1>
                    <div className="w-24 h-0.5 bg-[#c5a059] mx-auto mb-4"></div>
                    <p className="text-sm tracking-[3px] text-[#888] uppercase">The Holy Tongue: Hebrew & Aramaic</p>
                </header>

                {/* Intro Grid */}
                <div className="grid md:grid-cols-2 gap-10 mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="bg-white/5 p-8 rounded-lg border border-[#c5a059]/20 hover:border-[#c5a059]/60 hover:bg-white/10 transition-all duration-300"
                    >
                        <h3 className="font-['Cinzel'] text-[#c5a059] text-xl mb-4 border-b border-[#c5a059]/20 pb-2 inline-block">Hebrew (עִבְרִית)</h3>
                        <p className="text-sm leading-relaxed text-[#aaa] text-justify">
                            Hebrew is the original language of the Bible (Tanakh) and the language of creation. It is a Semitic language with a spiritual depth where every letter contains meaning, numerical value (Gematria), and creative power. Revived in modern times, it remains the eternal language of the Jewish people.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="bg-white/5 p-8 rounded-lg border border-[#c5a059]/20 hover:border-[#c5a059]/60 hover:bg-white/10 transition-all duration-300"
                    >
                        <h3 className="font-['Cinzel'] text-[#c5a059] text-xl mb-4 border-b border-[#c5a059]/20 pb-2 inline-block">Aramaic (אֲרָמִית)</h3>
                        <p className="text-sm leading-relaxed text-[#aaa] text-justify">
                            Aramaic was the common language of the Near East during the time of Jesus (Yeshua). Parts of the books of Daniel and Ezra were written in Aramaic. It is closely related to Hebrew and was the spoken language of the disciples, carrying the everyday words of the Messiah.
                        </p>
                    </motion.div>
                </div>

                {/* Alphabet Section */}
                <div className="text-center">
                    <h2 className="font-['Cinzel'] text-[#c5a059] text-4xl mb-10">
                        The Hebrew Alphabet <span className="text-xl text-[#888] font-['Poppins'] font-light">(Aleph-Bet)</span>
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
                        {hebrewLetters.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -5, boxShadow: '0 5px 15px rgba(197, 160, 89, 0.15)', borderColor: '#c5a059' }}
                                className="bg-[#0f0f0f] border border-[#c5a059]/30 rounded-lg p-6 flex flex-col items-center justify-center transition-all cursor-default"
                            >
                                <span className="text-5xl text-white mb-2 font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{item.letter}</span>
                                <div className="text-center">
                                    <strong className="block text-[#c5a059] text-xs tracking-widest uppercase mb-1">{item.name}</strong>
                                    <span className="text-[10px] text-[#666]">{item.number}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-20 text-center pt-8 border-t border-[#c5a059]/20">
                    <p className="font-['Cinzel'] italic text-[#aaa] text-lg max-w-2xl mx-auto mb-4 leading-relaxed">
                        "For then will I turn to the people a pure language, that they may all call upon the name of the Lord, to serve him with one consent."
                    </p>
                    <span className="text-[#c5a059] text-xs tracking-[2px] font-semibold">ZEPHANIAH 3:9</span>
                </footer>

            </div>
        </div>
    );
};
