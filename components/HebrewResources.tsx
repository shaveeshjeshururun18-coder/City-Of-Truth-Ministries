import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Calculator, Calendar as CalendarIcon, Clock, Hash, ChevronLeft, ChevronRight, Flame, Sparkles, BookOpen, Heart, Type, Volume2, Loader2, Info, Fingerprint } from 'lucide-react';
import { analyzeHebrewWord } from '../services/openRouterService';
import { motion, AnimatePresence } from 'framer-motion';
import { HebrewYearDropdown } from './HebrewYearDropdown';
import { HebrewConverter } from './HebrewConverter';
import { HebrewWordHub } from './HebrewWordHub';
import { InteractiveMenorah } from './InteractiveMenorah';
import { PrintableHebrewCalendar } from './PrintableHebrewCalendar';
import { PrintableReferenceGuide, HEBREW_MONTHS_DATA, KEY_DETAILS } from './PrintableReferenceGuide';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { User } from '../types';
import { Download, Printer } from 'lucide-react';
import { getCalendarData5786 } from './CalendarLogic';
import { audioService } from '../services/audioService';


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
    { name: 'Pesach', date: '26 Mar - 25 Apr', desc: 'Passover (first of seven/eight days).', icon: <Flame className="text-red-600" /> },
    { name: 'Yom HaShoah', date: '8 Apr - 7 May', desc: 'Holocaust Remembrance Day.', icon: <Hash className="text-slate-600" /> },
    { name: 'Yom Ha\'atzmaut', date: '15 Apr - 15 May', desc: 'Israel Independence Day.', icon: <Hash className="text-blue-500" /> },
    { name: 'Lag B\'Omer', date: '28 Apr - 28 May', desc: 'Celebrating Jewish unity and the light of Torah.', icon: <Flame className="text-orange-400" /> },
    { name: 'Yom Yerushalayim', date: '8 May - 7 Jun', desc: 'Jerusalem Day, celebrating the reunification of Jerusalem.', icon: <Hash className="text-amber-500" /> },
    { name: 'Shavuot', date: '15 May - 14 Jun', desc: 'Feast of Weeks, commemorating the giving of the Torah.', icon: <BookOpen className="text-blue-600" /> },
    { name: 'Tzom Tammuz', date: '25 Jun - 25 Jul', desc: 'Fast of Tammuz, marking the breach of Jerusalem\'s walls.', icon: <Clock className="text-slate-500" /> },
    { name: 'Tisha B\'Av', date: '16 Jul - 15 Aug', desc: 'Fast of the Ninth of Av, mourning the destruction of the Temples.', icon: <Clock className="text-slate-800" /> },
    { name: 'Tu B\'Av', date: '22 Jul - 21 Aug', desc: 'Jewish day of love.', icon: <Heart className="text-red-500" /> },
    { name: 'Rosh Hashanah', date: '5 Sep - 5 Oct', desc: 'The Jewish New Year, a time of reflection and repentance.', icon: <Flame className="text-red-500" /> },
    { name: 'Yom Kippur', date: '14 Sep - 14 Oct', desc: 'Day of Atonement, the holiest day of the year.', icon: <Clock className="text-slate-500" /> },
    { name: 'Sukkot', date: '19 Sep - 19 Oct', desc: 'Feast of Tabernacles (first of seven days).', icon: <CalendarIcon className="text-green-600" /> },
    { name: 'Shemini Atzeret', date: '26 Sep - 26 Oct', desc: 'The Eighth Day of Assembly.', icon: <Hash className="text-amber-600" /> },
    { name: 'Simchat Torah', date: '27 Sep - 27 Oct', desc: 'Rejoicing in the Torah.', icon: <BookOpen className="text-blue-600" /> },
    { name: 'Hanukkah', date: '28 Nov - 27 Dec', desc: 'Festival of Lights (first of eight days).', icon: <Flame className="text-orange-500" /> },
    { name: 'Tu Bishvat', date: '15 Jan - 13 Feb', desc: 'New Year for Trees.', icon: <Sparkles className="text-green-500" /> },
    { name: 'Purim', date: '24 Feb - 26 Mar', desc: 'Commemorating the salvation of the Jewish people in ancient Persia.', icon: <Sparkles className="text-purple-500" /> },
    { name: 'Shushan Purim', date: '25 Feb - 27 Mar', desc: 'Celebrated in walled cities like Jerusalem.', icon: <Sparkles className="text-purple-600" /> }
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
            const calendarData = getCalendarData5786(); // Removed 'year' argument
        }
    } else {
        return (year + monthIdx) % 7; // Simple fallback
    }

    return (baseDay + totalDays) % 7;
};

// --- View Components ---

const HebrewCalendarView: React.FC<{ currentUser?: User }> = ({ currentUser }) => {
    const [year, setYear] = useState(5786);
    const [currentMonthIdx, setCurrentMonthIdx] = useState(0); // Nisan (Default 0)
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [calendarRenderMode, setCalendarRenderMode] = useState<{ mode: 'cover' | 'month', monthData?: any } | null>(null);

    // Use a safe fallback year if input is invalid
    const safeYear = (!year || isNaN(year) || year < 1 || year > 9999) ? 5786 : year;

    // Import logic helper - use safeYear
    const calendarData = React.useMemo(() => getCalendarData5786(), [safeYear]);

    // Derived state for current view
    const currentMonthData = calendarData[currentMonthIdx];
    const { name, hebrew } = currentMonthData;
    const daysInMonth = currentMonthData.weeks.flat().filter(d => d.day !== null).length; // Approximate check

    useEffect(() => {
        if (currentMonthIdx >= calendarData.length) setCurrentMonthIdx(0);
    }, [year, calendarData.length]);




    const monthsList = calendarData.map(m => m.name);

    // PDF Download - Multi-page
    const handleDownloadFullCalendar = async () => {
        setIsGeneratingPdf(true);
        try {
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // We need a specific hidden container that renders `PrintableHebrewCalendar`
            const node = document.getElementById('printable-calendar-resource');
            if (!node) throw new Error("Calendar Node not found");

            // Helper to capture a page
            const captureAndAddPage = async (isFirstPage: boolean) => {
                // Ensure rendering is complete
                await new Promise(resolve => setTimeout(resolve, 300));

                const dataUrl = await toJpeg(node, {
                    pixelRatio: 3.0, // Pro Max Quality
                    quality: 1.0,
                    backgroundColor: '#ffffff',
                    cacheBust: true,
                    width: 1122, // Force dimensions
                    height: 793,
                    style: { visibility: 'visible' } // Ensure visibility for capture
                });

                if (!isFirstPage) pdf.addPage();
                pdf.addImage(dataUrl, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
            };

            // 1. Cover
            setCalendarRenderMode({ mode: 'cover' });
            await new Promise(resolve => setTimeout(resolve, 1500)); // Increased timeout to 1.5s
            await captureAndAddPage(true);

            // 2. Loop Months
            // Note: calendarData is now dynamic based on year
            for (const month of calendarData) {
                setCalendarRenderMode({ mode: 'month', monthData: month });
                await new Promise(resolve => setTimeout(resolve, 100));
                await captureAndAddPage(false);
            }

            // 3. Reference Guide (New)
            try {
                const refNode = document.getElementById('printable-reference-guide');
                if (refNode) {
                    const refDataUrl = await toJpeg(refNode, {
                        pixelRatio: 3.0,
                        quality: 1.0,
                        backgroundColor: '#ffffff',
                        cacheBust: true,
                        width: 800,
                    });

                    pdf.addPage('a4', 'portrait');
                    const portraitPageWidth = pdf.internal.pageSize.getWidth();
                    const imgProps = pdf.getImageProperties(refDataUrl);

                    const pdfImgWidth = portraitPageWidth;
                    const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;

                    pdf.addImage(refDataUrl, 'JPEG', 0, 0, pdfImgWidth, pdfImgHeight, undefined, 'FAST');
                }
            } catch (e) { console.warn("Ref guide capture failed", e); }


            pdf.save(`COT-Hebrew-Menorah-Calendar-${year}.pdf`);
        } catch (e) {
            console.error(e);
            alert("Failed to generate PDF. Please try again or check your device memory.");
        } finally {
            setCalendarRenderMode(null);
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div className="space-y-6 md:space-y-12 w-full max-w-5xl mx-auto px-4 md:px-6 scale-[0.95] origin-top">
            {/* Hidden Print Config */}
            {/* Hidden Print Config - Mounted on-screen for capture */}
            {/* Hidden Print Config - Mounted off-screen for capture but visible to DOM */}
            {/* Hidden Print Config - Mounted off-screen for capture but visible to DOM */}
            <div id="printable-calendar-resource" className="fixed left-0 top-0 pointer-events-none -z-50 " style={{ opacity: 0.01 }}>
                {calendarRenderMode && (
                    <PrintableHebrewCalendar
                        mode={calendarRenderMode.mode}
                        year={year}
                        monthData={calendarRenderMode.monthData}
                        currentUser={currentUser}
                    />
                )}
            </div>
            {/* Reference Guide for Capture */}
            <div className="fixed left-[-10000px] top-0 pointer-events-none -z-50 opacity-100">
                <PrintableReferenceGuide year={year} />
            </div>

            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 font-serif">
                <div className="flex flex-col xl:flex-row items-center justify-between gap-6 md:gap-8 mb-8 md:mb-12">
                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 bg-slate-50 p-2 md:p-3 rounded-2xl w-full xl:w-auto">
                        {/* Selector */}
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={year || ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '') {
                                        setYear(0); // Temporary state while typing
                                    } else {
                                        setYear(Number(val));
                                    }
                                }}
                                className="bg-slate-100 border text-center w-24 border-slate-200 rounded-lg font-bold text-brand-950 outline-none px-2 py-1.5 text-xs md:text-sm shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                placeholder="Year"
                                min="1"
                                max="9999"
                            />
                        </div>
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-100 text-xs font-bold text-slate-500 shadow-sm">
                            Year {year}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8">
                        <button
                            onClick={() => setCurrentMonthIdx(prev => Math.max(0, prev - 1))}
                            disabled={currentMonthIdx === 0}
                            className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-brand-900"
                        >
                            <ChevronLeft size={24} md:size={32} />
                        </button>

                        <div className="text-center min-w-[150px]">
                            <div className="text-2xl md:text-4xl xl:text-5xl font-bold text-brand-950 mb-1 leading-tight">{name}</div>
                            <div className="text-accent-600 text-lg md:text-2xl font-serif">{hebrew}</div>
                        </div>

                        <button
                            onClick={() => setCurrentMonthIdx(prev => Math.min(calendarData.length - 1, prev + 1))}
                            disabled={currentMonthIdx === calendarData.length - 1}
                            className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-brand-900"
                        >
                            <ChevronRight size={24} className="md:w-8 md:h-8" />
                        </button>

                    </div>
                </div>

                {/* PDF Action */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={handleDownloadFullCalendar}
                        disabled={isGeneratingPdf}
                        className="flex items-center gap-2 px-8 py-4 bg-amber-500 text-white rounded-full hover:bg-amber-600 font-bold text-sm uppercase tracking-widest transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                        {isGeneratingPdf ? (
                            <><span className="animate-spin text-xl">⏳</span> Generating PDF...</>
                        ) : (
                            <><Download size={18} /> Download Calendar</>
                        )}
                    </button>
                </div>

                {/* Grid Header */}
                <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4 md:mb-6 leading-none text-center bg-brand-50 rounded-xl p-2">
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
                        <div key={i} className="text-[10px] md:text-xs uppercase font-black text-brand-900 tracking-widest">{d}</div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5 md:gap-3">
                    {currentMonthData.weeks.map((week, wIdx) => (
                        <React.Fragment key={wIdx}>
                            {week.map((dayObj, dIdx) => (
                                <div key={`${wIdx}-${dIdx}`} className="aspect-square">
                                    {dayObj.day ? (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedDay(dayObj.day)}
                                            className={`w-full h-full flex flex-col items-between justify-between p-1 md:p-2 rounded-xl md:rounded-2xl border transition-all relative overflow-hidden ${selectedDay === dayObj.day
                                                ? 'bg-brand-600 border-brand-600 text-white shadow-xl ring-2 ring-brand-200'
                                                : dayObj.isShabbat
                                                    ? 'bg-brand-50 border-brand-100 text-brand-900'
                                                    : 'bg-white border-slate-100 hover:border-brand-200 text-slate-500'
                                                }`}
                                        >
                                            <div className="w-full flex justify-between items-start">
                                                <span className={`text-base md:text-xl font-bold ${selectedDay === dayObj.day ? 'text-white' : 'text-brand-950'}`}>{dayObj.day}</span>
                                                {/* Friday/Saturday Symbols */}
                                                {dIdx === 5 && (
                                                    <img src="/assets/friday-symbol.png" alt="Friday" className="w-4 h-4 md:w-5 md:h-5 object-contain" />
                                                )}
                                                {dIdx === 6 && (
                                                    <img src="/assets/saturday-icon.png" alt="Saturday" className="w-4 h-4 md:w-5 md:h-5 object-contain" />
                                                )}
                                            </div>

                                            {/* Festival Text Name */}
                                            {dayObj.festivals.length > 0 && (
                                                <div className="text-[8px] md:text-[10px] font-bold leading-tight text-center w-full mt-1">
                                                    {dayObj.festivals.map(f => (
                                                        <div key={f} className={`truncate ${selectedDay === dayObj.day ? 'text-white' : 'text-red-600'}`}>
                                                            {f}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.button>
                                    ) : (
                                        <div className="w-full h-full" />
                                    )}
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Selected Date Details */}
            <AnimatePresence mode="wait">
                {selectedDay && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-[100%] -mr-16 -mt-16 z-0" />
                        <div className="relative z-10">
                            <h4 className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-2">Selected Date</h4>
                            <div className="text-4xl font-black text-brand-950 mb-4">{selectedDay} {name}, {year}</div>

                            {/* Find festivals for this day */}
                            {(() => {
                                // Find the day object
                                const dayObj = currentMonthData.weeks.flat().find(d => d.day === selectedDay);
                                if (dayObj && dayObj.festivals.length > 0) {
                                    return (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {dayObj.festivals.map(f => (
                                                <span key={f} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-bold border border-red-100 flex items-center gap-2">
                                                    <Sparkles size={14} /> {f}
                                                </span>
                                            ))}
                                        </div>
                                    );
                                }
                                return <div className="text-slate-400 italic">No major festivals on this date.</div>;
                            })()}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


const FestivalsView: React.FC = () => (
    <div className="space-y-16">
        <div className="relative h-[450px] flex items-center justify-center p-8 bg-white rounded-[3rem] overflow-hidden group border border-amber-100 shadow-[0_20px_50px_rgba(245,158,11,0.12)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-200/60 via-transparent to-transparent"></div>
            <div className="relative z-10 w-full max-w-md h-full flex flex-col items-center justify-center">
                <div className="w-full h-full scale-90 origin-center">
                    <InteractiveMenorah />
                </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-300/30 rounded-full blur-[80px] animate-pulse pointer-events-none" />
        </div>

        <div className="text-center -mt-8 mb-12 relative z-20">
            <h3 className="text-4xl font-serif italic text-brand-950 font-bold tracking-widest drop-shadow-sm">Divine Festivals</h3>
            <div className="h-1 w-24 bg-amber-500 mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BIBLICAL_FESTIVALS.map((f, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-[0_20px_50px_-10px_rgba(79,70,229,0.15)] hover:border-brand-200 hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative cursor-pointer"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-brand-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-bl-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150 group-hover:bg-brand-100/50" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-transparent group-hover:text-brand-600 transition-colors duration-300 shadow-inner group-hover:shadow-lg group-hover:scale-110 transform">
                                {f.icon}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-brand-500 uppercase tracking-widest transition-colors">{f.date}</span>
                        </div>
                        <h4 className="text-xl font-bold text-brand-950 mb-3 group-hover:text-brand-700 transition-colors">{f.name}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed font-light group-hover:text-slate-600">{f.desc}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
);

const ReferenceView: React.FC = () => {
    // Standardize logic
    const leap = isLeapYear(5786);
    // ... logic for display ...

    return (
        <div className="space-y-16">
            {/* Note: The download button is now combined with the main calendar download in the Calendar tab */}

            {/* Hebrew Months Section */}
            <div>
                <h3 className="text-2xl font-serif font-bold text-brand-950 mb-8 flex items-center gap-3">
                    <BookOpen className="text-brand-600" /> Hebrew Months (Scriptural Order)
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {HEBREW_MONTHS_DATA.map((m, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-6 group hover:border-brand-200 transition-all hover:shadow-lg">
                            <div className="text-4xl font-serif text-slate-200 group-hover:text-brand-100 transition-colors">{(i + 1).toString().padStart(2, '0')}</div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-lg font-bold text-brand-950">{m.name}</h4>
                                </div>
                                <p className="text-xs text-accent-600 font-bold mb-1 uppercase tracking-widest">{m.gregorian}</p>
                                {m.holidays && <p className="text-xs text-amber-700 font-bold">{m.holidays}</p>}
                                <p className="text-[10px] text-slate-400 italic">{m.notes}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Key Details Section */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                <h3 className="text-xl font-serif font-bold text-brand-950 mb-6 flex items-center gap-3">
                    <Sparkles className="text-amber-500" /> Key Scriptural Details
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                    {KEY_DETAILS.map((d, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100">
                            <h4 className="font-bold text-amber-600 mb-2">{d.title}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{d.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sacred Days Section */}
            <div>
                <h3 className="text-2xl font-serif font-bold text-brand-950 mb-8 flex items-center gap-3">
                    <Clock className="text-brand-600" /> Sacred Days
                </h3>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {HEBREW_DAYS.map((day, i) => (
                        <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-default">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors font-bold">
                                    {i + 1}
                                </div>
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

const CHENNAI_TIMEZONE = 'Asia/Kolkata';

const getChennaiTimeParts = () => {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: CHENNAI_TIMEZONE,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).formatToParts(now);

    const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    const hour = Number(map.hour || '0');
    const minute = Number(map.minute || '0');
    const second = Number(map.second || '0');

    return {
        hour,
        minute,
        second,
        digital: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`,
        dateLabel: `${map.day} ${map.month} ${map.year}`
    };
};

const HebrewClockView: React.FC = () => {
    const [timeData, setTimeData] = useState(getChennaiTimeParts);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setTimeData(getChennaiTimeParts());
        }, 1000);

        return () => window.clearInterval(timer);
    }, []);

    const hourInTwelve = timeData.hour % 12 || 12;
    const hourAngle = (hourInTwelve + timeData.minute / 60) * 30;
    const minuteAngle = (timeData.minute + timeData.second / 60) * 6;
    const secondAngle = timeData.second * 6;

    return (
        <div className="space-y-8 md:space-y-10 py-6">
            <div className="text-center">
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-950">Chennai Time Clock</h2>
                <p className="text-slate-500 mt-3">Hebrew digital, standard digital, and quartz analog clock synced to Chennai (IST).</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
                <div className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 shadow-sm">
                    <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-3">Hebrew Digital</p>
                    <div className="text-4xl md:text-5xl font-serif text-accent-600 leading-tight">
                        {toHebrew(timeData.hour) || '—'}:{toHebrew(timeData.minute) || '—'}:{toHebrew(timeData.second) || '—'}
                    </div>
                    <p className="text-sm text-slate-500 mt-4">Time Zone: Asia/Kolkata (Chennai)</p>
                </div>

                <div className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 shadow-sm">
                    <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-3">Standard Digital</p>
                    <div className="text-4xl md:text-5xl font-mono font-bold text-brand-950 leading-tight">{timeData.digital}</div>
                    <p className="text-sm text-slate-500 mt-4">{timeData.dateLabel} · Chennai</p>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-10 shadow-sm flex flex-col items-center">
                <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-5">Quartz Analog Clock</p>
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-[10px] border-brand-100 bg-[radial-gradient(circle,_#ffffff_0%,_#f8fafc_70%,_#eef2ff_100%)] shadow-[inset_0_8px_30px_rgba(15,23,42,0.06)]">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute left-1/2 top-1/2 h-[40%] w-[2px] origin-bottom bg-brand-300"
                            style={{ transform: `translate(-50%, -100%) rotate(${i * 30}deg)` }}
                        />
                    ))}

                    <div className="absolute left-1/2 top-1/2 w-1.5 h-[26%] bg-brand-900 rounded-full origin-bottom" style={{ transform: `translate(-50%, -100%) rotate(${hourAngle}deg)` }} />
                    <div className="absolute left-1/2 top-1/2 w-1 h-[36%] bg-brand-600 rounded-full origin-bottom" style={{ transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)` }} />
                    <div className="absolute left-1/2 top-1/2 w-[2px] h-[40%] bg-red-500 rounded-full origin-bottom" style={{ transform: `translate(-50%, -100%) rotate(${secondAngle}deg)` }} />
                    <div className="absolute left-1/2 top-1/2 w-4 h-4 rounded-full bg-brand-900 -translate-x-1/2 -translate-y-1/2 border-2 border-white" />
                </div>
                <p className="text-sm text-slate-500 mt-6">Live IST (UTC+05:30) for Chennai city.</p>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════
   PAGE 1: Number → Hebrew Numeral
══════════════════════════════════════════════════════ */
const HebrewConverterNumbers: React.FC = () => {
    const [input, setInput] = useState<number | ''>('');
    const [search, setSearch] = useState('');

    const toHebrew = (num: number): string => {
        if (num <= 0) return '';
        const units = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
        const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
        const hundreds = ['', 'ק', 'ר', 'ש', 'ת'];
        let result = '';
        if (num >= 1000) { const t = Math.floor(num / 1000); result += toHebrew(t) + "'"; num %= 1000; }
        while (num >= 400) { result += 'ת'; num -= 400; }
        if (num >= 100) { result += hundreds[Math.floor(num / 100)]; num %= 100; }
        if (num === 15) return result + 'טו';
        if (num === 16) return result + 'טז';
        if (num >= 10) { result += tens[Math.floor(num / 10)]; num %= 10; }
        if (num > 0) { result += units[num]; }
        if (result.length > 1 && !result.includes("'")) { const last = result.slice(-1); const rest = result.slice(0, -1); return rest + '״' + last; }
        return result;
    };

    const hebrewResult = useMemo(() => input ? toHebrew(Number(input)) : '', [input]);

    const referenceNums = useMemo(() => {
        const arr = Array.from({ length: 400 }, (_, i) => ({ num: i + 1, hebrew: toHebrew(i + 1) }));
        [500, 600, 700, 800, 900, 1000, 2024, 2025, 2026, 5784, 5785, 5786].forEach(n => arr.push({ num: n, hebrew: toHebrew(n) }));
        return arr;
    }, []);

    const filtered = useMemo(() => {
        if (!search) return referenceNums.slice(0, 50);
        return referenceNums.filter(i => i.num.toString().includes(search) || i.hebrew.includes(search));
    }, [search, referenceNums]);

    return (
        <div className="space-y-12 py-8">
            <div className="text-center space-y-3">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-950">Number → <span className="text-accent-600">Hebrew Numeral</span></h2>
                <p className="text-slate-500 text-base max-w-xl mx-auto">Convert any number to its sacred Hebrew representation</p>
            </div>
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 w-full space-y-4">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Hash size={16} className="text-brand-500" /> Enter Number</label>
                    <input type="number" placeholder="e.g. 2026" className="w-full text-4xl md:text-6xl font-mono bg-transparent border-b-2 border-slate-100 py-4 outline-none focus:border-brand-500 transition-colors text-brand-950 placeholder:text-slate-100" value={input} onChange={e => setInput(e.target.valueAsNumber || '')} />
                </div>
                <div className="hidden md:block w-px h-32 bg-slate-100" />
                <div className="flex-1 w-full text-center md:text-right space-y-4">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block">Hebrew Numeral</label>
                    <div className="text-6xl md:text-8xl font-serif text-accent-600 min-h-[1.5em] flex items-center justify-center md:justify-end">{hebrewResult || '—'}</div>
                </div>
            </div>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <h3 className="text-2xl font-serif font-bold text-brand-950">Numeral Reference Guide</h3>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" placeholder="Find number or character…" className="w-full pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-full outline-none focus:border-brand-500 text-sm shadow-sm" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filtered.map(item => (
                        <div key={item.num} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 text-center hover:bg-brand-50 hover:scale-105 transition-all">
                            <span className="text-2xl text-slate-400 font-serif">{item.hebrew}</span>
                            <span className="text-3xl font-bold text-brand-950 font-mono">{item.num}</span>
                        </div>
                    ))}
                    {filtered.length === 0 && <div className="col-span-full text-center py-16 text-slate-400 italic">No results for "{search}"</div>}
                </div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════
   PAGE 2: Gematria Value Calculator
══════════════════════════════════════════════════════ */
const GEMATRIA_VALUES: { [key: string]: number } = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
    'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
    'ך': 20, 'ם': 40, 'ן': 50, 'ף': 80, 'ץ': 90
};

const ALPHABET_REF = [
    { letter: 'א', value: 1, name: 'Aleph' }, { letter: 'ב', value: 2, name: 'Bet' }, { letter: 'ג', value: 3, name: 'Gimel' },
    { letter: 'ד', value: 4, name: 'Dalet' }, { letter: 'ה', value: 5, name: 'He' }, { letter: 'ו', value: 6, name: 'Vav' },
    { letter: 'ז', value: 7, name: 'Zayin' }, { letter: 'ח', value: 8, name: 'Chet' }, { letter: 'ט', value: 9, name: 'Tet' },
    { letter: 'י', value: 10, name: 'Yod' }, { letter: 'כ', value: 20, name: 'Kaf' }, { letter: 'ל', value: 30, name: 'Lamed' },
    { letter: 'מ', value: 40, name: 'Mem' }, { letter: 'נ', value: 50, name: 'Nun' }, { letter: 'ס', value: 60, name: 'Samekh' },
    { letter: 'ע', value: 70, name: 'Ayin' }, { letter: 'פ', value: 80, name: 'Pe' }, { letter: 'צ', value: 90, name: 'Tsadi' },
    { letter: 'ק', value: 100, name: 'Qof' }, { letter: 'ר', value: 200, name: 'Resh' }, { letter: 'ש', value: 300, name: 'Shin' },
    { letter: 'ת', value: 400, name: 'Tav' },
].sort((a, b) => a.value - b.value);

const HebrewGematriaCalc: React.FC = () => {
    const [word, setWord] = useState('');
    const total = useMemo(() => word.split('').reduce((sum, c) => sum + (GEMATRIA_VALUES[c] || 0), 0), [word]);

    const letterBreakdown = useMemo(() => {
        return word.split('').filter(c => c.trim()).map(c => ({ char: c, value: GEMATRIA_VALUES[c] || 0 }));
    }, [word]);

    return (
        <div className="space-y-12 py-8">
            <div className="text-center space-y-3">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-950">Gematria <span className="text-accent-600">Calculator</span></h2>
                <p className="text-slate-500 text-base max-w-xl mx-auto">Type any Hebrew word to calculate its sacred numerical value</p>
            </div>

            {/* Calculator card */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden text-brand-950 border border-amber-100">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 to-transparent pointer-events-none" />
                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                    <div className="flex-1 w-full space-y-6">
                        <label className="text-xs font-bold text-amber-700 uppercase tracking-widest flex items-center gap-2">
                            <Search size={14} className="text-amber-500" /> Type Hebrew Word
                        </label>
                        <input type="text" placeholder="…Type any Hebrew word…" dir="rtl" className="w-full text-4xl md:text-6xl font-serif bg-transparent border-b-2 border-slate-200 py-4 outline-none focus:border-amber-500 transition-colors text-brand-950 placeholder:text-slate-300 text-right" value={word} onChange={e => setWord(e.target.value)} />
                    </div>
                    <div className="hidden md:block w-px h-32 bg-slate-200" />
                    <div className="flex-1 w-full text-center md:text-left space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Calculated Sum</label>
                        <div className="text-7xl md:text-9xl font-mono text-amber-500 font-black">{total || '0'}</div>
                    </div>
                </div>
            </div>

            {/* Letter breakdown */}
            {letterBreakdown.length > 0 && (
                <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-slate-100">
                    <h3 className="text-base font-bold text-slate-500 uppercase tracking-widest mb-5">Letter Breakdown</h3>
                    <div className="flex flex-wrap gap-3">
                        {letterBreakdown.map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 bg-brand-50 border border-brand-100 rounded-2xl px-4 py-3 min-w-[60px]">
                                <span className="text-2xl font-serif text-brand-950">{item.char}</span>
                                <span className="text-sm font-bold text-accent-600 font-mono">{item.value}</span>
                            </div>
                        ))}
                        <div className="flex flex-col items-center justify-center gap-1 bg-amber-500 rounded-2xl px-4 py-3 min-w-[60px] ml-auto">
                            <span className="text-[9px] font-black uppercase text-white/80 tracking-widest">Total</span>
                            <span className="text-2xl font-black text-white font-mono">{total}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Alphabet reference */}
            <div className="space-y-6">
                <h3 className="text-xl font-serif font-bold text-brand-950 text-center">Alphabet Values Reference</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-3">
                    {ALPHABET_REF.map(item => (
                        <button key={item.letter} onClick={() => setWord(w => w + item.letter)} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-1 text-center hover:bg-brand-50 hover:scale-105 hover:border-brand-200 transition-all cursor-pointer" title={`Add ${item.name}`}>
                            <span className="text-3xl font-serif text-brand-950">{item.letter}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">{item.name}</span>
                            <span className="text-sm font-bold text-accent-600 font-mono">{item.value}</span>
                        </button>
                    ))}
                </div>
                <p className="text-center text-xs text-slate-400">👆 Click a letter to add it to your word</p>
            </div>
        </div>
    );
};

const HEBREW_AUDIO_LETTERS = [
    { letter: 'א', name: 'Aleph', hebrewName: 'אלף' },
    { letter: 'ב', name: 'Bet', hebrewName: 'בית' },
    { letter: 'ג', name: 'Gimel', hebrewName: 'גימל' },
    { letter: 'ד', name: 'Dalet', hebrewName: 'דלת' },
    { letter: 'ה', name: 'He', hebrewName: 'הא' },
    { letter: 'ו', name: 'Vav', hebrewName: 'וו' },
    { letter: 'ז', name: 'Zayin', hebrewName: 'זין' },
    { letter: 'ח', name: 'Chet', hebrewName: 'חית' },
    { letter: 'ט', name: 'Tet', hebrewName: 'טית' },
    { letter: 'י', name: 'Yod', hebrewName: 'יוד' },
    { letter: 'כ', name: 'Kaf', hebrewName: 'כף' },
    { letter: 'ל', name: 'Lamed', hebrewName: 'למד' },
    { letter: 'מ', name: 'Mem', hebrewName: 'מם' },
    { letter: 'נ', name: 'Nun', hebrewName: 'נון' },
    { letter: 'ס', name: 'Samekh', hebrewName: 'סמך' },
    { letter: 'ע', name: 'Ayin', hebrewName: 'עין' },
    { letter: 'פ', name: 'Pe', hebrewName: 'פה' },
    { letter: 'צ', name: 'Tsade', hebrewName: 'צדי' },
    { letter: 'ק', name: 'Qof', hebrewName: 'קוף' },
    { letter: 'ר', name: 'Resh', hebrewName: 'ריש' },
    { letter: 'ש', name: 'Shin', hebrewName: 'שין' },
    { letter: 'ת', name: 'Tav', hebrewName: 'תו' },
] as const;

const RAINBOW_GRADIENTS = [
    'from-rose-500 to-red-500',
    'from-orange-500 to-amber-500',
    'from-amber-400 to-yellow-500',
    'from-lime-500 to-green-500',
    'from-emerald-500 to-teal-500',
    'from-cyan-500 to-sky-500',
    'from-blue-500 to-indigo-500',
    'from-violet-500 to-purple-500',
];

const HebrewLettersAudioLab: React.FC = () => {
    const [selectedLetters, setSelectedLetters] = useState<{ letter: string; name: string; hebrewName: string; key: number }[]>([]);
    const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
    const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<any | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);
    const nextKey = React.useRef(0);

    const combinedWord = selectedLetters.map(l => l.letter).join('');

    const addLetter = (item: (typeof HEBREW_AUDIO_LETTERS)[number]) => {
        const entry = { ...item, key: nextKey.current++ };
        // Append so that in RTL layout the newest letter appears on the left
        setSelectedLetters(prev => [...prev, entry]);
        // Reset any previous AI result when the word changes
        setAiResult(null);
        setAiError(null);
    };

    const removeLetter = (idx: number) => {
        setSelectedLetters(prev => prev.filter((_, i) => i !== idx));
        setAiResult(null);
        setAiError(null);
    };

    const playLetter = async (letterCharacter: string, hebrewName: string) => {
        try {
            await audioService.playHebrew(`${letterCharacter} ${hebrewName}`);
        } catch (error) {
            console.warn('Letter audio playback failed:', error);
        }
    };

    const playCombined = async () => {
        if (!combinedWord) return;
        try {
            await audioService.playHebrew(combinedWord);
        } catch (error) {
            console.warn('Combined audio playback failed:', error);
        }
    };

    const handleDeepAnalysis = async () => {
        if (!combinedWord) return;
        setIsAnalyzing(true);
        setAiError(null);
        try {
            const result = await analyzeHebrewWord(combinedWord);
            setAiResult({ ...result, word: combinedWord });
        } catch (err) {
            setAiError('Could not connect to the Deep Insight service. Please try again.');
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDragStart = (e: React.DragEvent, idx: number) => {
        setDraggingIdx(idx);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIdx(idx);
    };

    const handleDrop = (e: React.DragEvent, dropIdx: number) => {
        e.preventDefault();
        if (draggingIdx === null || draggingIdx === dropIdx) { setDraggingIdx(null); setDragOverIdx(null); return; }
        setSelectedLetters(prev => {
            const next = [...prev];
            const [removed] = next.splice(draggingIdx, 1);
            next.splice(dropIdx, 0, removed);
            return next;
        });
        setDraggingIdx(null);
        setDragOverIdx(null);
    };

    const handleDragEnd = () => { setDraggingIdx(null); setDragOverIdx(null); };

    return (
        <div className="space-y-8 py-8">
            <div className="text-center space-y-3">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-950">Hebrew <span className="text-accent-600">Letters Audio Lab</span></h2>
                <p className="text-slate-500 text-base max-w-3xl mx-auto">
                    Tap any letter to add it to your word. New letters appear on the left (Hebrew reads right-to-left). Drag to reorder. Tap ✕ to remove.
                </p>
            </div>

            {/* ── WORD BUILDER (always visible at top) ── */}
            <div className="bg-gradient-to-r from-fuchsia-500 via-sky-500 to-emerald-500 p-[2px] rounded-[2rem] sticky top-20 md:top-[7rem] z-20">
                <div className="bg-white rounded-[2rem] p-4 md:p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Word Builder — {selectedLetters.length} letter{selectedLetters.length !== 1 ? 's' : ''} (unlimited)</p>
                            {selectedLetters.length === 0 ? (
                                <p className="text-slate-300 text-sm italic">Tap letters below to build a word…</p>
                            ) : (
                                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto pr-1" dir="rtl">
                                    {selectedLetters.map((l, idx) => (
                                        <div
                                            key={l.key}
                                            draggable
                                            onDragStart={e => handleDragStart(e, idx)}
                                            onDragOver={e => handleDragOver(e, idx)}
                                            onDrop={e => handleDrop(e, idx)}
                                            onDragEnd={handleDragEnd}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-2xl border-2 cursor-grab active:cursor-grabbing select-none transition-all ${dragOverIdx === idx ? 'border-brand-400 bg-brand-50 scale-105' : 'border-slate-200 bg-slate-50 hover:border-brand-300'} ${draggingIdx === idx ? 'opacity-40' : ''}`}
                                        >
                                            <span className="text-2xl font-serif text-brand-950 leading-none">{l.letter}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{l.name}</span>
                                            <button
                                                onClick={() => removeLetter(idx)}
                                                className="ml-1 w-4 h-4 rounded-full bg-slate-200 hover:bg-red-100 hover:text-red-500 text-slate-400 flex items-center justify-center transition-colors text-[10px] font-black shrink-0"
                                                title={`Remove ${l.name}`}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {selectedLetters.length > 0 && (
                                <div className="text-3xl md:text-4xl font-serif text-brand-950 mt-2 max-h-12 overflow-hidden leading-tight" dir="rtl">{combinedWord}</div>
                            )}
                        </div>
                        <div className="flex gap-2 shrink-0 flex-wrap">
                            <button
                                onClick={playCombined}
                                disabled={!combinedWord}
                                className="px-5 py-2.5 rounded-full bg-brand-950 text-white font-bold text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-900 transition-colors"
                            >
                                <Volume2 size={15} /> Play Word
                            </button>
                            {selectedLetters.length > 0 && !aiResult && (
                                <button
                                    onClick={handleDeepAnalysis}
                                    disabled={isAnalyzing}
                                    className="px-5 py-2.5 rounded-full bg-accent-500 text-brand-950 font-bold text-sm flex items-center gap-2 disabled:opacity-50 hover:bg-accent-400 transition-colors shadow-lg"
                                >
                                    {isAnalyzing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                                    {isAnalyzing ? 'Analyzing…' : 'Deep Insight'}
                                </button>
                            )}
                            {selectedLetters.length > 0 && (
                                <button
                                    onClick={() => { setSelectedLetters([]); setAiResult(null); setAiError(null); }}
                                    className="px-4 py-2.5 rounded-full border border-slate-200 text-slate-500 font-bold text-sm hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── AI ERROR ── */}
            {aiError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-4 rounded-2xl border border-red-100">
                    <Info size={15} /> {aiError}
                </motion.div>
            )}

            {/* ── AI ANALYSIS RESULT ── */}
            <AnimatePresence>
                {aiResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.35 }}
                        className="bg-slate-950 text-white rounded-[2rem] p-6 md:p-8 flex flex-col space-y-5 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                        {/* Header row */}
                        <div className="flex justify-between items-start gap-3">
                            <div className="space-y-1 min-w-0">
                                <div className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em]">AI Deep Insight</div>
                                <div className="text-2xl font-black flex items-center gap-2 text-white flex-wrap">
                                    <span>{aiResult.pronunciation}</span>
                                    <button onClick={playCombined} className="shrink-0 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-accent-400">
                                        <Volume2 size={16} />
                                    </button>
                                </div>
                                {aiResult.pronunciationTa && (
                                    <div className="text-sm font-bold text-slate-400 flex items-center gap-2 mt-1">
                                        <div className="w-4 h-[1px] bg-slate-700" />
                                        {aiResult.pronunciationTa} (தமிழ்)
                                    </div>
                                )}
                            </div>
                            <div className="shrink-0 bg-brand-500/20 p-2.5 rounded-xl border border-white/5">
                                <Sparkles size={18} className="text-accent-400 animate-pulse" />
                            </div>
                        </div>

                        {/* Root (Shoresh) */}
                        {aiResult.root && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="shrink-0 w-7 h-7 bg-accent-500/20 rounded-lg flex items-center justify-center text-accent-400">
                                        <Fingerprint size={14} />
                                    </div>
                                    <div className="space-y-0.5 min-w-0">
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Shoresh (Hebrew Root)</div>
                                        <div className="text-xs text-brand-400 font-bold">The spiritual foundation</div>
                                    </div>
                                </div>
                                <div className="text-2xl font-serif text-accent-400 tracking-[0.2em] shrink-0" dir="rtl">{aiResult.root}</div>
                            </div>
                        )}

                        {/* Syllable breakdown */}
                        <div className="grid grid-cols-2 gap-3 py-4 border-y border-white/10">
                            <div className="space-y-1.5">
                                <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Hebrew Syllables</div>
                                <div className="text-base font-serif tracking-widest text-white/90 break-words" dir="rtl">{aiResult.breakdownHe}</div>
                            </div>
                            <div className="space-y-1.5 border-l border-white/10 pl-3">
                                <div className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em]">English Splitting</div>
                                <div className="text-base font-mono font-bold text-accent-200 tracking-tight break-words">{aiResult.breakdownEn}</div>
                            </div>
                        </div>

                        {/* Meanings */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <div className="text-xs font-bold text-amber-500 uppercase tracking-widest">English Meaning</div>
                                <div className="text-lg font-serif leading-relaxed text-slate-100 break-words">{aiResult.meaningEn}</div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="text-xs font-bold text-brand-400 uppercase tracking-widest">Tamil Meaning (தமிழ்)</div>
                                <div className="text-xl font-serif leading-relaxed text-slate-100 break-words">{aiResult.meaningTa}</div>
                            </div>
                        </div>

                        {/* Description */}
                        {aiResult.description && (
                            <div className="pt-4 border-t border-white/5 italic text-[11px] text-slate-500 font-light leading-relaxed break-words">
                                {aiResult.description}
                            </div>
                        )}

                        {/* Re-analyze button */}
                        <div className="pt-2">
                            <button
                                onClick={handleDeepAnalysis}
                                disabled={isAnalyzing}
                                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 disabled:opacity-50 transition-colors"
                            >
                                {isAnalyzing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                                Re-analyze
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 md:p-10 shadow-xl">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 text-center">Tap a letter to add it to your word</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {HEBREW_AUDIO_LETTERS.map((item, index) => (
                        <div key={item.letter} className={`rounded-3xl bg-gradient-to-br ${RAINBOW_GRADIENTS[index % RAINBOW_GRADIENTS.length]} p-[1px]`}>
                            <div className="bg-white rounded-3xl p-4 h-full flex flex-col items-center text-center gap-2">
                                <span className="text-4xl font-serif text-brand-950">{item.letter}</span>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{item.name}</span>
                                <div className="flex items-center gap-1 pt-1 w-full justify-center">
                                    <button
                                        onClick={() => addLetter(item)}
                                        className="flex-1 px-2 py-1.5 rounded-xl text-[10px] font-bold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
                                        title={`Add ${item.name}`}
                                    >
                                        + Add
                                    </button>
                                    <button
                                        onClick={() => playLetter(item.letter, item.hebrewName)}
                                        className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors flex items-center justify-center shrink-0"
                                        title={`Play ${item.hebrewName}`}
                                        aria-label={`Play ${item.hebrewName}`}
                                    >
                                        <Volume2 size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface HebrewResourcesProps {
    initialTab?: 'numbers' | 'calendar' | 'festivals' | 'reference' | 'words' | 'gematria' | 'lettersaudio' | 'clock';
    currentUser?: User;
}

type HebrewResourceTab = 'numbers' | 'calendar' | 'festivals' | 'reference' | 'words' | 'gematria' | 'lettersaudio' | 'clock';

const HEBREW_RESOURCE_TABS: ReadonlyArray<{ id: HebrewResourceTab; label: string; icon: React.ReactNode }> = [
    { id: 'festivals', label: 'Festivals', icon: <Flame size={16} /> },
    { id: 'calendar', label: 'Hebrew Calendar', icon: <CalendarIcon size={16} /> },
    { id: 'clock', label: 'Hebrew Clock', icon: <Clock size={16} /> },
    { id: 'words', label: 'Hebrew Word', icon: <Type size={16} /> },
    { id: 'lettersaudio', label: 'Letters Audio', icon: <Volume2 size={16} /> },
    { id: 'numbers', label: 'Numbers', icon: <Hash size={16} /> },
    { id: 'gematria', label: 'Gematria Value', icon: <Calculator size={16} /> },
    { id: 'reference', label: 'Month/Year', icon: <BookOpen size={16} /> }
];

export const HebrewResources: React.FC<HebrewResourcesProps> = ({ initialTab, currentUser }) => {
    const [tab, setTab] = useState<HebrewResourceTab>(initialTab || 'numbers');

    useEffect(() => {
        if (initialTab) {
            setTab(initialTab);
        }
    }, [initialTab]);


    return (
        <div className="min-h-screen pt-20 md:pt-28 pb-32 md:pb-20 container mx-auto px-6 font-sans bg-[#fffdf6]">
            <div className="max-w-7xl mx-auto md:flex md:items-start md:gap-8">
                <aside className="hidden md:block md:w-64 md:shrink-0 md:sticky md:top-[110px]">
                    <div className="flex flex-col gap-3">
                        {HEBREW_RESOURCE_TABS.map((t) => {
                            const isActive = tab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => { setTab(t.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    className={`relative w-full flex items-center justify-start gap-3 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300 ${isActive
                                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30'
                                        : 'bg-white text-slate-400 hover:text-amber-600 hover:border-amber-200 border border-slate-200 shadow-sm'
                                        }`}
                                >
                                    {t.icon}
                                    <span>{t.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-pill-desktop"
                                            className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 -z-10 rounded-2xl"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                <div className="flex-1 space-y-12">
                    <div className="text-center space-y-4 mb-4 md:mb-12">
                    <h1 className="text-4xl md:text-8xl font-serif font-bold text-brand-950 px-2">
                        Biblical <span className="text-accent-600">Hub</span>
                    </h1>
                    <p className="text-sm md:text-xl text-slate-500 font-light max-w-3xl mx-auto px-6">
                        A sanctuary of divine knowledge. Explore the sacred calendar, biblical festivals, and spiritual mathematics.
                    </p>
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
                            {tab === 'calendar' && <HebrewCalendarView currentUser={currentUser} />}
                            {tab === 'clock' && <HebrewClockView />}
                            {tab === 'words' && <HebrewWordHub />}
                            {tab === 'lettersaudio' && <HebrewLettersAudioLab />}
                            {tab === 'numbers' && <HebrewConverterNumbers />}
                            {tab === 'gematria' && <HebrewGematriaCalc />}
                            {tab === 'reference' && <ReferenceView />}
                        </motion.div>
                    </AnimatePresence>
                </div>
                </div>
            </div>
        </div>
    );
};
