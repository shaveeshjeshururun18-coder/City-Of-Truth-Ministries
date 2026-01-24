import React, { useState, useMemo } from 'react';
import { Search, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

// Logic to convert numbers to Hebrew
const toHebrew = (num: number): string => {
    if (num <= 0) return '';

    // Gematria values
    const units = ['', 'א', 'b', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
    const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
    const hundreds = ['', 'ק', 'ר', 'ש', 'ת'];

    let result = '';

    // Handle thousands (dumb simple implementation for visual sake up to 5999 for now)
    // For more complex, usually ' is used.
    if (num >= 1000) {
        const thousandDigit = Math.floor(num / 1000);
        result += toHebrew(thousandDigit) + "'";
        num %= 1000;
    }

    // Handle hundreds
    while (num >= 400) {
        result += 'ת';
        num -= 400;
    }
    if (num >= 100) {
        result += hundreds[Math.floor(num / 100)];
        num %= 100;
    }

    // Handle tens
    // Special cases 15 (TU) and 16 (TZ)
    if (num === 15) return result + 'טו';
    if (num === 16) return result + 'טז';

    if (num >= 10) {
        result += tens[Math.floor(num / 10)];
        num %= 10;
    }

    // Handle units
    if (num > 0) {
        result += units[num];
    }

    // Add gershayim (") if length > 1, usually before last letter
    if (result.length > 1 && !result.includes("'")) {
        // Simple formatting: if ends with ', skip
        // A standard hebrew num usually has " before last letter if > 1 letter
        const last = result.slice(-1);
        const rest = result.slice(0, -1);
        return rest + '״' + last;
    }

    // If single letter and meant to be number, often ' is added, but for simple charts just the letter is fine.
    // Let's stick to simple letters for 1-9

    return result;
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


export const HebrewConverter: React.FC = () => {
    const [input, setInput] = useState<number | ''>('');
    const [search, setSearch] = useState('');

    const hebrewResult = useMemo(() => {
        if (!input) return '';
        return toHebrew(Number(input));
    }, [input]);

    const filteredReference = useMemo(() => {
        if (!search) return referenceNumbers.slice(0, 50); // Show first 50 by default
        return referenceNumbers.filter(item =>
            item.num.toString().includes(search) ||
            item.hebrew.includes(search)
        );
    }, [search]);

    return (
        <div className="min-h-screen pt-24 pb-20 container mx-auto px-6">
            <div className="max-w-4xl mx-auto space-y-16">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-brand-950">
                        Hebrew <span className="text-accent-600">Numerals</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-light">
                        Discover the divine numerical system of the Bible.
                    </p>
                </div>

                {/* Calculator Section */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 w-full space-y-6">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Calculator size={16} /> Enter a Number
                        </label>
                        <input
                            type="number"
                            placeholder="e.g. 2026"
                            className="w-full text-4xl md:text-5xl font-mono bg-transparent border-b-2 border-slate-200 py-4 outline-none focus:border-brand-500 transition-colors text-brand-950 placeholder:text-slate-200"
                            value={input}
                            onChange={(e) => setInput(e.target.valueAsNumber || '')}
                        />
                    </div>

                    <div className="hidden md:block w-px h-32 bg-slate-100"></div>

                    <div className="flex-1 w-full text-center md:text-right space-y-4">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block">
                            Hebrew Value
                        </label>
                        <div className="text-6xl md:text-8xl font-serif text-accent-600 min-h-[1.5em]">
                            {hebrewResult || '—'}
                        </div>
                    </div>
                </div>

                {/* Reference Grid */}
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <h2 className="text-3xl font-serif font-bold text-brand-950">Number Reference</h2>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search number..."
                                className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-full outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all shadow-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredReference.map((item) => (
                            <motion.div
                                key={item.num}
                                layout
                                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-2 text-center"
                            >
                                <span className="text-3xl text-brand-950 font-serif">{item.hebrew}</span>
                                <span className="text-sm font-bold text-slate-400 font-mono">{item.num}</span>
                            </motion.div>
                        ))}
                    </div>

                    {filteredReference.length === 0 && (
                        <div className="text-center py-20 text-slate-400">
                            No numbers found matching "{search}"
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
