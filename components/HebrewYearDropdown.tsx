import React, { useState, useMemo, useEffect } from 'react';
import { Search, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to convert number to Hebrew (simplified for year display)
const toHebrewYear = (num: number): string => {
    if (num <= 0) return '';
    const units = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
    const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
    const hundreds = ['', 'ק', 'ר', 'ש', 'ת'];

    let result = '';
    // Handle thousands (usually 5000 is implicitly 'Hey' but often omitted in short dates, 
    // but for full year we might show it or just the last digits. Standard is often without thousands or with 'Hey')
    // We will do a standard conversion.

    let n = num;
    if (n >= 1000) {
        // n %= 1000; // Common usage often omits the 5000
        // But let's keep it simple or just show the number if too complex.
        // Actually let's just stick to a basic mapping for 5700-5900 range if needed, 
        // or use the user's existing function logic if I had it. 
        // I'll reuse the logic I saw in HebrewResources roughly, but inline here for independence.
        const thousands = Math.floor(n / 1000);
        result += toHebrew(thousands) + "'";
        n %= 1000;
    }

    while (n >= 400) { result += 'ת'; n -= 400; }
    if (n >= 100) { result += hundreds[Math.floor(n / 100)]; n %= 100; }
    if (n === 15) return result + 'טו';
    if (n === 16) return result + 'טז';
    if (n >= 10) { result += tens[Math.floor(n / 10)]; n %= 10; }
    if (n > 0) { result += units[n]; }

    // Finalize
    if (result.length > 1 && !result.includes("'")) {
        const last = result.slice(-1);
        const rest = result.slice(0, -1);
        return rest + '״' + last;
    }
    return result;
};

const toHebrew = (num: number): string => {
    const units = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
    return units[num] || '';
}

interface HebrewYearDropdownProps {
    selectedYear: number;
    onYearChange: (year: number) => void;
}

export const HebrewYearDropdown: React.FC<HebrewYearDropdownProps> = ({ selectedYear, onYearChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    // Generate years 5700 to 5900
    const years = useMemo(() => {
        return Array.from({ length: 200 }, (_, i) => 5700 + i);
    }, []);

    const filteredYears = useMemo(() => {
        return years.filter(y =>
            y.toString().includes(search) ||
            toHebrewYear(y).includes(search)
        );
    }, [years, search]);

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };
        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('[data-hebrew-year-dropdown]')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isOpen]);

    return (
        <div className="relative w-full max-w-xs font-sans" data-hebrew-year-dropdown>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg cursor-pointer hover:bg-white transition-all group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Calendar size={18} />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Hebrew Year</div>
                        <div className="font-bold text-brand-950 text-lg flex gap-2">
                            <span>{selectedYear}</span>
                            <span className="text-accent-600 font-serif">{toHebrewYear(selectedYear)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 p-2"
                    >
                        <div className="px-2 pt-2 pb-1 flex items-center justify-between">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Select Hebrew Year</p>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 transition-colors"
                                aria-label="Close year list"
                                title="Close"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <div className="relative mb-2 px-2">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search year..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-sm font-bold text-brand-950 outline-none focus:ring-2 focus:ring-brand-200"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="max-h-[68vh] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            {filteredYears.map(y => (
                                <button
                                    key={y}
                                    onClick={() => { onYearChange(y); setIsOpen(false); }}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm ${selectedYear === y ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <span>{y}</span>
                                    <span className="font-serif text-base">{toHebrewYear(y)}</span>
                                </button>
                            ))}
                            {filteredYears.length === 0 && (
                                <div className="p-4 text-center text-xs text-slate-400 italic">No years found</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
