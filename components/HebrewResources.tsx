import React, { useState, useMemo, useEffect } from 'react';
import { Search, Calculator, Calendar as CalendarIcon, Clock, Hash, ChevronLeft, ChevronRight, Flame, Sparkles, BookOpen, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HebrewYearDropdown } from './HebrewYearDropdown';
import { HebrewConverter } from './HebrewConverter';
import { InteractiveMenorah } from './InteractiveMenorah';
import { PrintableHebrewCalendar } from './PrintableHebrewCalendar';
import { PrintableReferenceGuide, HEBREW_MONTHS_DATA, KEY_DETAILS } from './PrintableReferenceGuide';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { User } from '../types';
import { Download, Printer } from 'lucide-react';
import { getCalendarData5786 } from './CalendarLogic';


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
        <div className="relative h-[450px] flex items-center justify-center p-8 bg-brand-950 rounded-[3rem] overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent"></div>
            <div className="relative z-10 w-full max-w-md h-full flex flex-col items-center justify-center">
                <div className="w-full h-full scale-90 origin-center">
                    <InteractiveMenorah />
                </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
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
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-[0_20px_50px_-10px_rgba(217,119,6,0.2)] hover:border-amber-200 hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative cursor-pointer"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-bl-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150 group-hover:bg-amber-100/50" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300 shadow-inner group-hover:shadow-lg group-hover:scale-110 transform">
                                {f.icon}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-amber-700 uppercase tracking-widest transition-colors">{f.date}</span>
                        </div>
                        <h4 className="text-xl font-bold text-brand-950 mb-3 group-hover:text-amber-700 transition-colors">{f.name}</h4>
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
                                <h4 className="text-lg font-bold text-brand-950">{m.name}</h4>
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
    currentUser?: User;
}

export const HebrewResources: React.FC<HebrewResourcesProps> = ({ initialTab, currentUser }) => {
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
                                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30'
                                        : 'bg-white text-slate-400 hover:text-amber-600 hover:border-amber-200 border border-slate-200 shadow-sm'
                                        }`}
                                >
                                    {t.icon}
                                    <span>{t.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-pill"
                                            className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 -z-10 rounded-xl md:rounded-full"
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
                            {tab === 'calendar' && <HebrewCalendarView currentUser={currentUser} />}
                            {tab === 'numbers' && <HebrewConverter />}
                            {tab === 'reference' && <ReferenceView />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
