import React, { useState, useMemo } from 'react';
import { Search, Calculator, Type, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { audioService } from '../services/audioService';

// Gematria letter values
const gematriaValues: { [key: string]: number } = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
    'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
    // Final forms (Sofit) - for simple Gematria, they usually map to the regular form's value.
    'ך': 20, 'ם': 40, 'ן': 50, 'ף': 80, 'ץ': 90
};

// Logic to convert numbers to Hebrew
const toHebrew = (num: number): string => {
    if (num <= 0) return '';
    const units = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
    const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
    const hundreds = ['', 'ק', 'ר', 'ש', 'ת'];

    const formatGroup = (n: number): string => {
        let res = '';
        let rem = n;
        while (rem >= 400) {
            res += 'ת';
            rem -= 400;
        }
        if (rem >= 100) {
            res += hundreds[Math.floor(rem / 100)];
            rem %= 100;
        }
        if (rem === 15) {
            res += 'טו';
        } else if (rem === 16) {
            res += 'טז';
        } else {
            if (rem >= 10) {
                res += tens[Math.floor(rem / 10)];
                rem %= 10;
            }
            if (rem > 0) {
                res += units[rem];
            }
        }
        
        if (res.length > 1) {
            const last = res.slice(-1);
            const rest = res.slice(0, -1);
            return rest + '״' + last;
        }
        return res;
    };

    const groups: number[] = [];
    let temp = num;
    while (temp > 0) {
        groups.push(temp % 1000);
        temp = Math.floor(temp / 1000);
    }

    const parts: string[] = [];
    for (let i = 0; i < groups.length; i++) {
        const val = groups[i];
        if (val === 0) continue;
        
        let formatted = formatGroup(val);
        if (formatted) {
            if (i > 0) {
                formatted += "'".repeat(i);
            }
            parts.unshift(formatted);
        }
    }
    
    return parts.join('');
};

// Function to calculate Gematria value of a word
const calculateGematriaWord = (word: string): number => {
    let total = 0;
    for (const char of word) {
        total += gematriaValues[char] || 0; // Add 0 if character not found
    }
    return total;
};

// Reference Data
const referenceNumbers = Array.from({ length: 400 }, (_, i) => i + 1).map(n => ({
    num: n,
    hebrew: toHebrew(n)
}));
// Add some notable larger numbers
[500, 600, 700, 800, 900, 1000, 2024, 2025, 2026, 5784, 5785, 5786].forEach(n => {
    referenceNumbers.push({ num: n, hebrew: toHebrew(n) });
});

// Hebrew Alphabet Reference Data
const hebrewAlphabetReference = [
    { letter: 'א', value: 1, name: 'Aleph' },
    { letter: 'ב', value: 2, name: 'Bet' },
    { letter: 'ג', value: 3, name: 'Gimel' },
    { letter: 'ד', value: 4, name: 'Dalet' },
    { letter: 'ה', value: 5, name: 'He' },
    { letter: 'ו', value: 6, name: 'Vav' },
    { letter: 'ז', value: 7, name: 'Zayin' },
    { letter: 'ח', value: 8, name: 'Chet' },
    { letter: 'ט', value: 9, name: 'Tet' },
    { letter: 'י', value: 10, name: 'Yod' },
    { letter: 'כ', value: 20, name: 'Kaf' },
    { letter: 'ל', value: 30, name: 'Lamed' },
    { letter: 'מ', value: 40, name: 'Mem' },
    { letter: 'נ', value: 50, name: 'Nun' },
    { letter: 'ס', value: 60, name: 'Samekh' },
    { letter: 'ע', value: 70, name: 'Ayin' },
    { letter: 'פ', value: 80, name: 'Pe' },
    { letter: 'צ', value: 90, name: 'Tsadi' },
    { letter: 'ק', value: 100, name: 'Qof' },
    { letter: 'ר', value: 200, name: 'Resh' },
    { letter: 'ש', value: 300, name: 'Shin' },
    { letter: 'ת', value: 400, name: 'Tav' },
    // Final forms
    { letter: 'ך', value: 20, name: 'Kaf Sofit' },
    { letter: 'ם', value: 40, name: 'Mem Sofit' },
    { letter: 'ן', value: 50, name: 'Nun Sofit' },
    { letter: 'ף', value: 80, name: 'Pe Sofit' },
    { letter: 'ץ', value: 90, name: 'Tsadi Sofit' },
].sort((a, b) => a.value - b.value);


export const HebrewConverter: React.FC = () => {
    const [input, setInput] = useState<number | ''>('');
    const [search, setSearch] = useState('');
    const [gematriaWordInput, setGematriaWordInput] = useState<string>('');

    const hebrewResult = useMemo(() => {
        if (!input) return '';
        return toHebrew(Number(input));
    }, [input]);

    const calculatedGematriaValue = useMemo(() => {
        if (!gematriaWordInput) return 0;
        return calculateGematriaWord(gematriaWordInput);
    }, [gematriaWordInput]);

    const filteredReference = useMemo(() => {
        if (!search) return referenceNumbers.slice(0, 50); // Show first 50 by default
        return referenceNumbers.filter(item =>
            item.num.toString().includes(search) ||
            item.hebrew.includes(search)
        );
    }, [search]);

    return (
        <div className="space-y-16 py-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-brand-950">
                    Sacred <span className="text-accent-600">Numerals</span>
                </h2>
                <p className="text-sm md:text-lg text-slate-500 font-light max-w-2xl mx-auto px-6">
                    Calculate biblical numbers and explore the mathematical patterns of the Hebrew Aleph-Bet.
                </p>
            </div>

            {/* Number to Hebrew Calculator Section */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 w-full space-y-6">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Calculator size={16} className="text-brand-500" /> Number to Hebrew Numeral
                    </label>
                    <input
                        type="number"
                        placeholder="e.g. 2026"
                        className="w-full text-4xl md:text-6xl font-mono bg-transparent border-b-2 border-slate-100 py-4 outline-none focus:border-brand-500 transition-colors text-brand-950 placeholder:text-slate-100"
                        value={input}
                        onChange={(e) => setInput(e.target.valueAsNumber || '')}
                    />
                </div>

                <div className="hidden md:block w-px h-32 bg-slate-100"></div>

                <div className="flex-1 w-full text-center md:text-right space-y-4">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block">
                        Hebrew Representation
                    </label>
                    <div className={`${
                        hebrewResult.length > 15 ? 'text-xl md:text-5xl' :
                        hebrewResult.length > 10 ? 'text-2xl md:text-6xl' :
                        hebrewResult.length > 8 ? 'text-3xl md:text-7xl' :
                        hebrewResult.length > 5 ? 'text-4xl md:text-8xl' :
                        'text-6xl md:text-8xl'
                    } font-serif text-accent-600 min-h-[1.5em] flex items-center justify-center md:justify-end gap-4`}>
                        <span className={hebrewResult ? 'cursor-pointer hover:text-accent-500 transition-colors' : ''} onClick={() => hebrewResult && audioService.playHebrew(hebrewResult)}>
                            {hebrewResult || '—'}
                        </span>
                        {hebrewResult && (
                            <button
                                onClick={() => audioService.playHebrew(hebrewResult)}
                                className="p-2 bg-accent-50 rounded-full text-accent-600 hover:bg-accent-100 transition-colors"
                            >
                                <Volume2 size={24} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Simple Gematria Calc Section */}
            <div className="bg-brand-950 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100%] scale-150"></div>

                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                    <div className="flex-1 w-full space-y-6">
                        <label className="text-xs font-bold text-brand-400 uppercase tracking-widest flex items-center gap-2">
                            <Search size={14} className="text-amber-500" /> Quick Gematria Sum
                        </label>
                        <input
                            type="text"
                            placeholder="Type any word..."
                            className="w-full text-4xl md:text-6xl font-serif bg-transparent border-b-2 border-white/10 py-4 outline-none focus:border-amber-500 transition-colors text-white placeholder:text-white/10 text-right"
                            value={gematriaWordInput}
                            onChange={(e) => setGematriaWordInput(e.target.value)}
                            dir="rtl"
                        />
                    </div>

                    <div className="hidden md:block w-px h-32 bg-white/10"></div>

                    <div className="flex-1 w-full text-center md:text-left space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                            Calculated Sum
                        </label>
                        <div className="text-7xl md:text-9xl font-mono text-amber-500 font-black">
                            {calculatedGematriaValue || '0'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hebrew Alphabet Letter-Value Reference Table */}
            <div className="space-y-10">
                <div className="flex items-center gap-4">
                    <div className="h-0.5 flex-1 bg-slate-100"></div>
                    <h3 className="text-2xl font-serif font-bold text-brand-950 px-4">Alphabet Values</h3>
                    <div className="h-0.5 flex-1 bg-slate-100"></div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-4">
                    {hebrewAlphabetReference.map((item) => (
                        <div
                            key={item.letter}
                            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-1 text-center transition-all hover:scale-105 hover:border-brand-200"
                        >
                            <span className="text-4xl font-serif text-brand-950">{item.letter}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.name}</span>
                            <span className="text-lg font-bold text-accent-600 font-mono">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Number Reference Grid */}
            <div className="space-y-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                    <h3 className="text-2xl font-serif font-bold text-brand-950">Numeral Reference Guide</h3>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Find character or number..."
                            className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-full outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-sm shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredReference.map((item) => (
                        <motion.div
                            key={item.num}
                            layout
                            onClick={() => audioService.playHebrew(item.hebrew)}
                            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 text-center group transition-all hover:bg-brand-50 cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Volume2 size={12} className="text-brand-300" />
                            </div>
                            <span className="text-xl text-slate-400 font-serif mb-1 transition-colors group-hover:text-brand-600">{item.hebrew}</span>
                            <span className="text-4xl font-bold text-brand-950 font-mono transition-transform group-hover:scale-110">{item.num}</span>
                        </motion.div>
                    ))}
                </div>

                {filteredReference.length === 0 && (
                    <div className="text-center py-20 text-slate-400 italic">
                        No matches found for "{search}"
                    </div>
                )}
            </div>
        </div>
    );
};
