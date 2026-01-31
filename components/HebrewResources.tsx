import React, { useState, useMemo, useEffect } from 'react';
import { Search, Calculator, Calendar as CalendarIcon, Clock, Hash, ChevronLeft, ChevronRight, Flame, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HebrewYearDropdown } from './HebrewYearDropdown';
import { HebrewConverter } from './HebrewConverter';
import { InteractiveMenorah } from './InteractiveMenorah';

// --- Logic to convert numbers to Hebrew (Existing) ---
const toHebrew = (num: number): string => {
    if (num <= 0) return '';
    const units = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
    const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
    const hundreds = ['', 'ק', 'ר', 'ש', 'ת'];
    let result = '';
    if (num >= 1000) {
        const thousandDigit = Math.floor(num / 1000);
        result += toHebrew(thousandDigit) + "'";
        num %= 1000;
    }
    while (num >= 400) { result += 'ת'; num -= 400; }
    if (num >= 100) { result += hundreds[Math.floor(num / 100)]; num %= 100; }
    if (num === 15) return result + 'טו';
    if (num === 16) return result + 'טז';
    if (num >= 10) { result += tens[Math.floor(num / 10)]; num %= 10; }
    if (num > 0) { result += units[num]; }
    if (result.length > 1 && !result.includes("'")) {
        const last = result.slice(-1);
        const rest = result.slice(0, -1);
        return rest + '״' + last;
    }
    return result;
};

// --- Calendar Constants & Data ---

const BIBLICAL_FESTIVALS = [
    { name: 'Passover', date: '14 Nisan', desc: 'Commemorating the exodus from Egypt and redemption by the blood of the Lamb.', icon: <Flame className="text-red-500" /> },
    { name: 'Unleavened Bread', date: '15-22 Nisan', desc: 'Symbolizing the removal of sin (leaven) from our lives.', icon: <Hash className="text-amber-600" /> },
    { name: 'Firstfruits', date: '16 Nisan', desc: 'Celebrating the resurrection of Messiah, the firstfruits of those who slept.', icon: <Sparkles className="text-yellow-400" /> },
    { name: 'Pentecost', date: '50 Days after Firstfruits', desc: 'Commemorating the giving of the Law and the outpouring of the Holy Spirit.', icon: <Flame className="text-orange-500" /> },
    { name: 'Trumpets', date: '1 Tishrei', desc: 'The blowing of the Shofar, calling the people to repentance.', icon: <Hash className="text-blue-500" /> },
    { name: 'Day of Atonement', date: '10 Tishrei', desc: 'The most sacred day of the year, a day of fasting and reconciliation.', icon: <Clock className="text-slate-500" /> },
    { name: 'Tabernacles', date: '15-22 Tishrei', desc: 'Celebrating God\'s provision and dwelling with His people.', icon: <CalendarIcon className="text-green-600" /> }
];

const HEBREW_DAYS = [
    { name: 'Yom Rishon', english: 'Sunday', hebrew: 'יוֹם רִאשׁוֹן' },
    { name: 'Yom Sheni', english: 'Monday', hebrew: 'יוֹם שֵׁנִי' },
    { name: 'Yom Shlishi', english: 'Tuesday', hebrew: 'יוֹם שְׁלִישִׁי' },
    { name: 'Yom Revi\'i', english: 'Wednesday', hebrew: 'יוֹם רְבִיעִי' },
    { name: 'Yom Chamishi', english: 'Thursday', hebrew: 'יוֹם חֲמִישִׁי' },
    { name: 'Yom Shishi', english: 'Friday', hebrew: 'יוֹם שִׁשִׁי' },
    { name: 'Shabbat', english: 'Saturday', hebrew: 'שַׁבָּת' }
];

const MONTH_MEANINGS: Record<string, string> = {
    'Nisan': 'Month of Miracles / Redemption',
    'Iyar': 'Month of Healing',
    'Sivan': 'Month of Revelation',
    'Tammuz': 'Month of Sight',
    'Av': 'Month of Consolation',
    'Elul': 'Month of Repentance',
    'Tishrei': 'Month of Beginnings / Judgment',
    'Cheshvan': 'Month of Silence / Rain',
    'Kislev': 'Month of Dreams / Light',
    'Tevet': 'Month of Fasting / Hardship',
    'Shevat': 'Month of Resurrection / Trees',
    'Adar': 'Month of Joy',
    'Adar I': 'Month of Increase (Leap Year)',
    'Adar II': 'Month of Multiplied Joy (Leap Year)'
};

// --- Hebrew Calendar Utilities ---

const isLeapYear = (year: number): boolean => {
    return ((year * 12 + 17) % 19) < 7;
};

const getDaysInHebrewMonth = (year: number, monthIdx: number): number => {
    const standardLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30]; // Nisan to Shevat
    if (monthIdx < 11) return standardLengths[monthIdx];

    const leap = isLeapYear(year);
    if (!leap) return 29; // Adar
    return monthIdx === 11 ? 30 : 29; // Adar I=30, Adar II=29
};

const getHebrewMonthName = (year: number, monthIdx: number): { name: string, hebrew: string } => {
    const leap = isLeapYear(year);
    const months = [
        { name: 'Nisan', hebrew: 'נִיסָן' },
        { name: 'Iyar', hebrew: 'אִייָר' },
        { name: 'Sivan', hebrew: 'סִיוָן' },
        { name: 'Tammuz', hebrew: 'תַּמּוּז' },
        { name: 'Av', hebrew: 'אָב' },
        { name: 'Elul', hebrew: 'אֱלוּל' },
        { name: 'Tishrei', hebrew: 'תִּשְׁרֵי' },
        { name: 'Cheshvan', hebrew: 'חֶשְׁוָן' },
        { name: 'Kislev', hebrew: 'כִּסְלֵו' },
        { name: 'Tevet', hebrew: 'טֵבֵת' },
        { name: 'Shevat', hebrew: 'שְׁבָט' },
        ...(leap
            ? [{ name: 'Adar I', hebrew: 'אֲדָר א׳' }, { name: 'Adar II', hebrew: 'אֲדָר ב׳' }]
            : [{ name: 'Adar', hebrew: 'אֲדָר' }]
        )
    ];
    return months[monthIdx];
};

const getFirstDayOfWeek = (year: number, monthIdx: number): number => {
    const baseYear = 5785;
    const baseDay = 2; // Nisan 1, 5785 was Tuesday
    let totalDays = 0;

    if (year >= baseYear) {
        for (let y = baseYear; y < year; y++) {
            totalDays += isLeapYear(y) ? 384 : 354;
        }
        for (let m = 0; m < monthIdx; m++) {
            totalDays += getDaysInHebrewMonth(year, m);
        }
    } else {
        return (year + monthIdx) % 7; // Simple fallback
    }

    return (baseDay + totalDays) % 7;
};

// --- View Components ---

const HebrewCalendarView: React.FC = () => {
    const [year, setYear] = useState(5786);
    const [currentMonthIdx, setCurrentMonthIdx] = useState(6); // Tishrei
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const leap = isLeapYear(year);
    const totalMonths = leap ? 13 : 12;

    useEffect(() => {
        if (currentMonthIdx >= totalMonths) setCurrentMonthIdx(0);
    }, [year, totalMonths]);

    const { name, hebrew } = getHebrewMonthName(year, currentMonthIdx);
    const daysInMonth = getDaysInHebrewMonth(year, currentMonthIdx);
    const firstDay = getFirstDayOfWeek(year, currentMonthIdx);

    const monthsList = useMemo(() => {
        const list = [];
        for (let i = 0; i < totalMonths; i++) {
            list.push(getHebrewMonthName(year, i).name);
        }
        return list;
    }, [year, totalMonths]);

    return (
        <div className="space-y-6 md:space-y-12 max-w-4xl mx-auto px-2 md:px-0">
            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 font-serif">
                <div className="flex flex-col xl:flex-row items-center justify-between gap-6 md:gap-8 mb-8 md:mb-12">
                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 bg-slate-50 p-2 md:p-3 rounded-2xl w-full xl:w-auto">
                        {/* Jump to Date Selector */}
                        <div className="flex items-center gap-1 md:gap-2">
                            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">Jump to:</span>
                            <select
                                value={selectedDay || 1}
                                onChange={(e) => setSelectedDay(Number(e.target.value))}
                                className="bg-white border border-slate-200 rounded-lg font-bold text-brand-950 outline-none px-2 py-1.5 cursor-pointer text-xs md:text-sm shadow-sm"
                            >
                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                                    <option key={d} value={d}>Day {d}</option>
                                ))}
                            </select>
                            <select
                                value={currentMonthIdx}
                                onChange={(e) => { setCurrentMonthIdx(Number(e.target.value)); setSelectedDay(1); }}
                                className="bg-white border border-slate-200 rounded-lg font-bold text-brand-950 outline-none px-2 py-1.5 cursor-pointer text-xs md:text-sm shadow-sm"
                            >
                                {monthsList.map((mName, i) => <option key={i} value={i}>{mName}</option>)}
                            </select>
                            <select
                                value={year}
                                onChange={(e) => { setYear(Number(e.target.value)); setSelectedDay(1); }}
                                className="bg-white border border-slate-200 rounded-lg font-bold text-brand-950 outline-none px-2 py-1.5 cursor-pointer text-xs md:text-sm shadow-sm"
                            >
                                {Array.from({ length: 21 }, (_, i) => 5780 + i).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <div className="w-px h-6 bg-slate-200 hidden xl:block"></div>

                        <select className="bg-transparent font-bold text-brand-950 outline-none px-2 md:px-4 py-2 cursor-pointer text-sm md:text-base">
                            <option value="standard">Standard View</option>
                            <option value="biblical">Biblical View</option>
                        </select>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl md:text-4xl xl:text-5xl font-bold text-brand-950 mb-1 leading-tight">{name} {year}</div>
                        <div className="text-accent-600 text-lg md:text-2xl">{hebrew} {toHebrew(year)}</div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                        <button onClick={() => setCurrentMonthIdx(prev => prev > 0 ? prev - 1 : totalMonths - 1)} className="p-3 bg-brand-50 rounded-full hover:bg-brand-600 hover:text-white text-brand-600 transition-all shadow-sm">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={() => setCurrentMonthIdx(prev => prev < totalMonths - 1 ? prev + 1 : 0)} className="p-3 bg-brand-50 rounded-full hover:bg-brand-600 hover:text-white text-brand-600 transition-all shadow-sm">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4 md:mb-6 leading-none text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-[9px] md:text-[10px] uppercase font-bold text-slate-400 tracking-widest">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5 md:gap-3">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                        <motion.button
                            key={day}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedDay(day)}
                            className={`aspect-square flex flex-col items-center justify-center rounded-lg md:rounded-2xl border transition-all relative overflow-hidden group ${selectedDay === day
                                ? 'bg-brand-600 border-brand-600 text-white shadow-lg'
                                : 'bg-white border-slate-50 hover:border-brand-100 hover:bg-brand-50/50 text-slate-400 font-bold'
                                }`}
                        >
                            <span className={`text-[10px] md:text-sm mb-0.5 md:mb-1 ${selectedDay === day ? 'text-white/80' : 'text-slate-400'}`}>{toHebrew(day)}</span>
                            <span className={`text-base md:text-xl font-bold ${selectedDay === day ? 'text-white' : 'text-brand-950'}`}>{day}</span>
                            {selectedDay === day && <motion.div layoutId="flare" className="absolute bottom-1 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" />}
                        </motion.button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {selectedDay && (
                        <motion.div
                            key={`${selectedDay}-${currentMonthIdx}-${year}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="mt-12 p-6 bg-brand-50 rounded-3xl text-center"
                        >
                            <span className="text-sm font-bold text-brand-400 uppercase tracking-widest block mb-2">Selected Date</span>
                            <span className="text-3xl font-bold text-brand-950">{selectedDay} {name}, {year}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const FestivalsView: React.FC = () => (
    <div className="space-y-16">
        <div className="relative h-[450px] flex items-center justify-center p-8 bg-brand-950 rounded-[3rem] overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent"></div>
            <div className="relative z-10 w-full max-w-md h-full">
                <InteractiveMenorah />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white font-serif italic text-2xl tracking-widest opacity-80">Divine Festivals</div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BIBLICAL_FESTIVALS.map((f, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                            {f.icon}
                        </div>
                        <span className="text-[10px] font-bold text-accent-600 uppercase tracking-widest">{f.date}</span>
                    </div>
                    <h4 className="text-xl font-bold text-brand-950 mb-3">{f.name}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-light">{f.desc}</p>
                </motion.div>
            ))}
        </div>
    </div>
);

const ReferenceView: React.FC = () => {
    const leap = isLeapYear(5786); // Reference year
    const months = useMemo(() => {
        const list = [];
        const total = leap ? 13 : 12;
        for (let i = 0; i < total; i++) {
            list.push(getHebrewMonthName(5786, i));
        }
        return list;
    }, [leap]);

    return (
        <div className="space-y-16">
            <div>
                <h3 className="text-2xl font-serif font-bold text-brand-950 mb-8 flex items-center gap-3">
                    <BookOpen className="text-brand-600" /> Biblical Months
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {months.map((m, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-6 group hover:border-brand-200 transition-all">
                            <div className="text-4xl font-serif text-slate-200 group-hover:text-brand-100 transition-colors">{(i + 1).toString().padStart(2, '0')}</div>
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-brand-950">{m.name}</h4>
                                <p className="text-xs text-accent-600 font-bold mb-1 uppercase tracking-widest">{m.hebrew}</p>
                                <p className="text-[10px] text-slate-400 italic">{MONTH_MEANINGS[m.name] || 'Sacred Month'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-serif font-bold text-brand-950 mb-8 flex items-center gap-3">
                    <Clock className="text-brand-600" /> Sacred Days
                </h3>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {HEBREW_DAYS.map((day, i) => (
                        <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                            <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                {i + 1}
                            </div>
                            <h4 className="text-xl font-bold text-brand-950 mb-1">{day.name}</h4>
                            <p className="text-sm text-slate-400 font-medium mb-4 uppercase tracking-widest">{day.english}</p>
                            <div className="text-3xl font-serif text-accent-600 border-t border-slate-50 pt-4 mt-4">{day.hebrew}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface HebrewResourcesProps {
    initialTab?: 'numbers' | 'calendar' | 'festivals' | 'reference';
}

export const HebrewResources: React.FC<HebrewResourcesProps> = ({ initialTab }) => {
    const [tab, setTab] = useState<'numbers' | 'calendar' | 'festivals' | 'reference'>(initialTab || 'numbers');

    useEffect(() => {
        if (initialTab) {
            setTab(initialTab);
        }
    }, [initialTab]);

    return (
        <div className="min-h-screen pt-20 md:pt-28 pb-20 container mx-auto px-6 font-sans bg-[#fdfcf0]">
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="text-center space-y-4 mb-4 md:mb-12">
                    <h1 className="text-4xl md:text-8xl font-serif font-bold text-brand-950 px-2">
                        Biblical <span className="text-accent-600">Hub</span>
                    </h1>
                    <p className="text-sm md:text-xl text-slate-500 font-light max-w-3xl mx-auto px-6">
                        A sanctuary of divine knowledge. Explore the sacred calendar, biblical festivals, and spiritual mathematics.
                    </p>
                </div>

                <div className="sticky top-[60px] md:top-[75px] z-30 py-2 bg-transparent">
                    <div className="grid grid-cols-2 md:flex md:flex-nowrap md:overflow-x-auto md:no-scrollbar gap-x-3 gap-y-2 md:gap-4 px-4 justify-center">
                        {[
                            { id: 'festivals', label: 'Festivals', icon: <Flame size={16} /> },
                            { id: 'calendar', label: 'Hebrew Calendar', icon: <CalendarIcon size={16} /> },
                            { id: 'numbers', label: 'Numbers', icon: <Hash size={16} /> },
                            { id: 'reference', label: 'Month/Year', icon: <BookOpen size={16} /> }
                        ].map((t) => {
                            const isActive = tab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setTab(t.id as any)}
                                    className={`relative flex items-center justify-center gap-2 md:gap-3 px-3 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-full font-bold text-[9px] md:text-xs uppercase tracking-widest transition-all duration-300 ${isActive
                                        ? 'bg-brand-600 text-white shadow-lg'
                                        : 'bg-white text-slate-400 hover:text-brand-600 border border-slate-200 shadow-sm'
                                        }`}
                                >
                                    {t.icon}
                                    <span>{t.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-pill"
                                            className="absolute inset-0 bg-brand-600 -z-10 rounded-xl md:rounded-full"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="relative mb-24 min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {tab === 'festivals' && <FestivalsView />}
                            {tab === 'calendar' && <HebrewCalendarView />}
                            {tab === 'numbers' && <HebrewConverter />}
                            {tab === 'reference' && <ReferenceView />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
