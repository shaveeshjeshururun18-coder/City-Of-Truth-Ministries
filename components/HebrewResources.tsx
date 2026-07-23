import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Calculator, Calendar as CalendarIcon, Clock, Hash, ChevronLeft, ChevronRight, Flame, Sparkles, BookOpen, Heart, Type, Volume2, Loader2, Info, Fingerprint, FileImage, Download, Printer, Globe } from 'lucide-react';
import { analyzeHebrewWord } from '../services/openRouterService';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { HebrewYearDropdown } from './HebrewYearDropdown';
import { HebrewConverter } from './HebrewConverter';
import { HebrewWordHub } from './HebrewWordHub';
import { InteractiveMenorah } from './InteractiveMenorah';
import { PrintableHebrewCalendar } from './PrintableHebrewCalendar';
import { PrintableReferenceGuide, HEBREW_MONTHS_DATA, KEY_DETAILS } from './PrintableReferenceGuide';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { User, ViewState } from '../types';
import { HEBREW_PAGES } from '../hebrewRegistry';
import { getCalendarData5786 } from './CalendarLogic';
import { audioService } from '../services/audioService';
import { HebrewGrammar3D } from './HebrewGrammar3D';
import { IsraelPage } from './IsraelPage';
import { MouthPronunciationAnimator, type PhonemeStep } from './MouthPronunciationAnimator';

export const captureNodeToJpeg = async (
    sourceNode: HTMLElement,
    options: { backgroundColor: string; width?: number }
) => {
    const wrapper = document.createElement('div');
    const clone = sourceNode.cloneNode(true) as HTMLElement;
    const sourceRect = sourceNode.getBoundingClientRect();
    const targetWidth = options.width || Math.max(640, Math.ceil(sourceRect.width) || 640);

    wrapper.style.position = 'fixed';
    wrapper.style.left = '0';
    wrapper.style.top = '0';
    wrapper.style.opacity = '0';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.zIndex = '-1';
    wrapper.style.background = options.backgroundColor;
    wrapper.style.width = `${targetWidth}px`;
    wrapper.style.margin = '0';
    wrapper.style.padding = '0';

    clone.style.position = 'relative';
    clone.style.left = '0';
    clone.style.top = '0';
    clone.style.width = `${targetWidth}px`;
    clone.style.margin = '0';

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
        if ('fonts' in document) {
            await (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
        }
        await new Promise(resolve => setTimeout(resolve, 150));
        const pixelRatio = Math.min(2.5, Math.max(1.5, window.devicePixelRatio || 1));
        return await toJpeg(clone, {
            quality: 0.98,
            pixelRatio,
            backgroundColor: options.backgroundColor,
            cacheBust: true,
        });
    } finally {
        document.body.removeChild(wrapper);
    }
};

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

// --- Calendar Constants & Data ---

const BIBLICAL_FESTIVALS = [
    { name: 'Pesach', date: '26 Mar - 25 Apr', desc: 'Passover (first of seven/eight days).', tamil: 'பஸ்கா (பெஸாக்) - விடுதலையின் பண்டிகை', icon: <Flame className="text-red-600" /> },
    { name: 'Yom HaShoah', date: '8 Apr - 7 May', desc: 'Holocaust Remembrance Day.', tamil: 'யோம் ஹஷோவா - ஹோலோகாஸ்ட் நினைவு தினம்', icon: <Hash className="text-slate-600" /> },
    { name: "Yom Ha'atzmaut", date: '15 Apr - 15 May', desc: 'Israel Independence Day.', tamil: 'இஸ்ரேல் சுதந்திர தினம்', icon: <Hash className="text-blue-500" /> },
    { name: "Lag B'Omer", date: '28 Apr - 28 May', desc: 'Celebrating Jewish unity and the light of Torah.', tamil: 'லாக் பஓமர் - தோரா ஒளி பண்டிகை', icon: <Flame className="text-orange-400" /> },
    { name: 'Yom Yerushalayim', date: '8 May - 7 Jun', desc: 'Jerusalem Day, celebrating the reunification of Jerusalem.', tamil: 'யெருசலேம் தினம் - நகர ஒருங்கிணைப்பு', icon: <Hash className="text-amber-500" /> },
    { name: 'Shavuot', date: '15 May - 14 Jun', desc: 'Feast of Weeks, commemorating the giving of the Torah.', tamil: 'ஷாவுவோத் - வாரங்களின் பண்டிகை (தோரா வழங்கல்)', icon: <BookOpen className="text-blue-600" /> },
    { name: 'Tzom Tammuz', date: '25 Jun - 25 Jul', desc: "Fast of Tammuz, marking the breach of Jerusalem's walls.", tamil: 'யெருசலேம் மதில் உடைப்பு நினைவு நோன்பு', icon: <Clock className="text-slate-500" /> },
    { name: "Tisha B'Av", date: '16 Jul - 15 Aug', desc: 'Fast of the Ninth of Av, mourning the destruction of the Temples.', tamil: 'திஷா பஆவ் - ஆலயம் அழிந்த நோன்பு நாள்', icon: <Clock className="text-slate-800" /> },
    { name: "Tu B'Av", date: '22 Jul - 21 Aug', desc: 'Jewish day of love.', tamil: 'துவ் பஆவ் - அன்பின் நாள்', icon: <Heart className="text-red-500" /> },
    { name: 'Rosh Hashanah', date: '5 Sep - 5 Oct', desc: 'The Jewish New Year, a time of reflection and repentance.', tamil: 'ரோஷ் ஹஷானா - யூத புத்தாண்டு', icon: <Flame className="text-red-500" /> },
    { name: 'Yom Kippur', date: '14 Sep - 14 Oct', desc: 'Day of Atonement, the holiest day of the year.', tamil: 'யோம் கிப்பூர் - பரிகார நாள் (மிக புனிதமான நாள்)', icon: <Clock className="text-slate-500" /> },
    { name: 'Sukkot', date: '19 Sep - 19 Oct', desc: 'Feast of Tabernacles (first of seven days).', tamil: 'சுக்கோத் - கூடாரப் பண்டிகை (7 நாட்கள்)', icon: <CalendarIcon className="text-green-600" /> },
    { name: 'Shemini Atzeret', date: '26 Sep - 26 Oct', desc: 'The Eighth Day of Assembly.', tamil: 'ஷெமினி அஸெரெத் - எட்டாம் நாள் ஆராதனை', icon: <Hash className="text-amber-600" /> },
    { name: 'Simchat Torah', date: '27 Sep - 27 Oct', desc: 'Rejoicing in the Torah.', tamil: 'சிம்சாத் தோரா - தோரா மகிழ்ச்சி நாள்', icon: <BookOpen className="text-blue-600" /> },
    { name: 'Hanukkah', date: '28 Nov - 27 Dec', desc: 'Festival of Lights (first of eight days).', tamil: 'ஹனுக்கா - விளக்குகளின் பண்டிகை (8 நாட்கள்)', icon: <Flame className="text-orange-500" /> },
    { name: 'Tu Bishvat', date: '15 Jan - 13 Feb', desc: 'New Year for Trees.', tamil: 'து பிஷ்வாத் - மரங்களின் புத்தாண்டு', icon: <Sparkles className="text-green-500" /> },
    { name: 'Purim', date: '24 Feb - 26 Mar', desc: 'Commemorating the salvation of the Jewish people in ancient Persia.', tamil: 'புரிம் - யூத மக்களின் விடுதலை கொண்டாட்டம்', icon: <Sparkles className="text-purple-500" /> },
    { name: 'Shushan Purim', date: '25 Feb - 27 Mar', desc: 'Celebrated in walled cities like Jerusalem.', tamil: 'ஷுஷான் புரிம் - மதில் நகர புரிம்', icon: <Sparkles className="text-purple-600" /> }
];

const HEBREW_DAYS = [
    { name: 'Yom Rishon', english: 'Sunday', hebrew: 'יוֹם רִאשׁוֹன்', tamil: 'யோம் ரிஷோன் (ஞாயிறு)' },
    { name: 'Yom Sheni', english: 'Monday', hebrew: 'יוֹם שֵׁנִי', tamil: 'யோம் ஷேனி (திங்கள்)' },
    { name: 'Yom Shlishi', english: 'Tuesday', hebrew: 'יוֹם שְׁלִישִׁי', tamil: 'யோம் ஷ்லிஷி (செவ்வாய்)' },
    { name: 'Yom Revi\'i', english: 'Wednesday', hebrew: 'יוֹם רְבִיעִי', tamil: 'யோம் ரெவிஈ (புதன்)' },
    { name: 'Yom Chamishi', english: 'Thursday', hebrew: 'יוֹם חֲמִישִׁי', tamil: 'யோம் ஹாமிஷி (வியாழன்)' },
    { name: 'Yom Shishi', english: 'Friday', hebrew: 'יוֹם שִׁשִׁי', tamil: 'யோம் ஷிஷி (வெள்ளி)' },
    { name: 'Shabbat', english: 'Saturday', hebrew: 'שַׁבָּת', tamil: 'ஷப்பாத் (சனி)' }
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
    const [isGeneratingCurrentMonth, setIsGeneratingCurrentMonth] = useState(false);
    const [calendarRenderMode, setCalendarRenderMode] = useState<{ mode: 'cover' | 'month', monthData?: any } | null>(null);

    // Use a safe fallback year if input is invalid
    const safeYear = (!year || isNaN(year) || year < 1 || year > 9999) ? 5786 : year;

    // Import logic helper - use safeYear
    const calendarData = React.useMemo(() => getCalendarData5786(safeYear), [safeYear]);

    // Derived state for current view
    const currentMonthData = calendarData[currentMonthIdx];
    const { name, hebrew } = currentMonthData;
    const monthDays = currentMonthData.weeks.flat().filter(d => d.day !== null);
    const firstGregorian = monthDays[0]?.gregorianDate;
    const firstGregorianYear = monthDays[0]?.gregorianYear;
    const lastGregorian = monthDays[monthDays.length - 1]?.gregorianDate;
    const lastGregorianYear = monthDays[monthDays.length - 1]?.gregorianYear;
    const today = new Date();
    const todayMonthShort = today.toLocaleString('en-US', { month: 'short' });
    const todayKey = `${todayMonthShort} ${today.getDate()}`;
    const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' });

    useEffect(() => {
        if (currentMonthIdx >= calendarData.length) setCurrentMonthIdx(0);
    }, [year, calendarData.length]);

    useEffect(() => {
        for (let m = 0; m < calendarData.length; m++) {
            const foundDay = calendarData[m].weeks.flat().find(d => d.day !== null && d.gregorianDate === todayKey);
            if (foundDay?.day) {
                setCurrentMonthIdx(m);
                setSelectedDay(foundDay.day);
                return;
            }
        }
        setSelectedDay(null);
        setCurrentMonthIdx(0);
    }, [calendarData, todayKey]);

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

    const handleDownloadCurrentMonth = async () => {
        setIsGeneratingCurrentMonth(true);
        try {
            const node = document.getElementById('active-calendar-card');
            if (!node) throw new Error("Active Calendar Card not found");

            const downloadButtonContainer = node.querySelector('.download-actions-container') as HTMLElement;
            const todayNotice = node.querySelector('.today-notice-container') as HTMLElement;
            if (downloadButtonContainer) downloadButtonContainer.style.display = 'none';
            if (todayNotice) todayNotice.style.display = 'none';

            await new Promise(resolve => setTimeout(resolve, 200));

            const dataUrl = await toPng(node, {
                pixelRatio: 2.0,
                quality: 0.95,
                backgroundColor: '#ffffff',
                cacheBust: true,
            });

            if (downloadButtonContainer) downloadButtonContainer.style.display = '';
            if (todayNotice) todayNotice.style.display = '';

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `COT-Hebrew-Calendar-${name}-${year}.png`;
            link.click();
        } catch (e) {
            console.error(e);
            alert("Failed to export month image. Please try again.");
        } finally {
            setIsGeneratingCurrentMonth(false);
        }
    };

    return (
        <div className="space-y-6 md:space-y-12 w-full max-w-none mx-auto px-0 md:px-2">
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

            <div id="active-calendar-card" className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 font-serif">
                <div className="flex flex-col xl:flex-row items-center justify-between gap-6 md:gap-8 mb-8 md:mb-12">
                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 bg-slate-50 p-2 md:p-3 rounded-2xl w-full xl:w-auto">
                        <HebrewYearDropdown
                            selectedYear={safeYear}
                            onYearChange={(selectedYear) => setYear(selectedYear)}
                        />
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-100 text-xs font-bold text-slate-500 shadow-sm">
                            Year {safeYear}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8">
                        <button
                            onClick={() => setCurrentMonthIdx(prev => Math.max(0, prev - 1))}
                            disabled={currentMonthIdx === 0}
                            className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-brand-900"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <div className="text-center min-w-[180px]">
                            <div className="text-2xl md:text-4xl xl:text-5xl font-bold text-brand-950 mb-1 leading-tight">{name}</div>
                            <div className="text-accent-600 text-lg md:text-2xl font-serif">{hebrew}</div>
                            {firstGregorian && lastGregorian && (
                                <div className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">
                                    {firstGregorianYear === lastGregorianYear
                                        ? `${firstGregorian} - ${lastGregorian}, ${firstGregorianYear}`
                                        : `${firstGregorian}, ${firstGregorianYear} - ${lastGregorian}, ${lastGregorianYear}`
                                    }
                                </div>
                            )}
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

                <div className="today-notice-container mb-6 rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-amber-700 font-black">Today</p>
                    <p className="text-sm md:text-base font-bold text-brand-950">
                        {todayDayName}, {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-slate-500">Current Hebrew month view: {name} ({hebrew})</p>
                </div>

                {/* PDF & PNG Actions */}
                <div className="download-actions-container flex flex-wrap justify-center gap-4 mb-8">
                    <button
                        onClick={handleDownloadCurrentMonth}
                        disabled={isGeneratingCurrentMonth}
                        className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-full hover:from-amber-500 hover:to-amber-600 font-black text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
                    >
                        {isGeneratingCurrentMonth ? (
                            <><span className="animate-spin text-xs">⏳</span> Exporting PNG...</>
                        ) : (
                            <><FileImage size={15} /> Download Current Month (Fast PNG)</>
                        )}
                    </button>

                    <button
                        onClick={handleDownloadFullCalendar}
                        disabled={isGeneratingPdf}
                        className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-full hover:from-orange-600 hover:to-amber-700 font-black text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
                    >
                        {isGeneratingPdf ? (
                            <><span className="animate-spin text-xs">⏳</span> Bulk Exporting PDF...</>
                        ) : (
                            <><Download size={15} /> Download Full Calendar (Bulk PDF)</>
                        )}
                    </button>
                </div>

                {/* Grid Header */}
                <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4 md:mb-6 text-center bg-brand-50 rounded-xl p-2 items-center">
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => {
                        const hebDay = HEBREW_DAYS[i];
                        return (
                            <div key={i} className="flex flex-col items-center justify-center gap-0.5">
                                <span className="text-[10px] md:text-xs font-black text-brand-900 tracking-widest leading-none">{d}</span>
                                <span className="text-[9px] md:text-[11px] font-bold text-amber-700 leading-none mt-0.5">{hebDay.hebrew}</span>
                                <span className="text-[8px] md:text-[9px] font-black text-blue-600 leading-none mt-0.5" title={hebDay.tamil}>
                                    {hebDay.tamil.split(' (')[0]}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5 md:gap-3">
                    {currentMonthData.weeks.map((week, wIdx) => (
                        <React.Fragment key={wIdx}>
                            {week.map((dayObj, dIdx) => (
                                <div key={`${wIdx}-${dIdx}`} className="aspect-square">
                                    {dayObj.day ? (
                                        (() => {
                                            const isSelected = selectedDay === dayObj.day;
                                            const isToday = dayObj.gregorianDate === todayKey;
                                            return (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedDay(dayObj.day)}
                                            className={`w-full h-full flex flex-col items-between justify-between p-1 md:p-2 rounded-xl md:rounded-2xl border transition-all relative overflow-hidden ${isSelected
                                                ? 'bg-brand-600 border-brand-600 text-white shadow-xl ring-2 ring-brand-200'
                                                : isToday
                                                    ? 'bg-amber-100 border-amber-400 text-brand-900 shadow-lg ring-2 ring-amber-200'
                                                : dayObj.isShabbat
                                                    ? 'bg-brand-50 border-brand-100 text-brand-900'
                                                    : 'bg-white border-slate-100 hover:border-brand-200 text-slate-500'
                                                }`}
                                        >
                                            <div className="w-full flex justify-between items-start">
                                                <span className={`text-base md:text-xl font-bold ${isSelected ? 'text-white' : 'text-brand-950'}`}>{dayObj.day}</span>
                                                {/* Friday/Saturday Symbols */}
                                                {dIdx === 5 && (
                                                    <img src="/assets/friday-symbol.png" alt="Friday" className="w-4 h-4 md:w-5 md:h-5 object-contain" />
                                                )}
                                                {dIdx === 6 && (
                                                    <img src="/assets/saturday-icon.png" alt="Saturday" className="w-4 h-4 md:w-5 md:h-5 object-contain" />
                                                )}
                                            </div>

                                            {isToday && !isSelected && (
                                                <div className="text-[8px] font-black uppercase tracking-wide text-amber-700">Today</div>
                                            )}

                                            {/* Festival Text Name */}
                                            {dayObj.festivals.length > 0 && (
                                                <div className="text-[8px] md:text-[10px] font-bold leading-tight text-center w-full mt-1">
                                                    {dayObj.festivals.map(f => (
                                                        <div key={f} className={`truncate ${isSelected ? 'text-white' : 'text-red-600'}`}>
                                                            {f}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.button>
                                            );
                                        })()
                                    ) : (
                                        <div className="w-full h-full" />
                                    )}
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>

                {/* Copyright Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <img src="/brand-logo.png" alt="COT Logo" className="w-7 h-7 object-contain opacity-70" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        <div>
                            <p className="text-[11px] font-black text-brand-950 uppercase tracking-[0.15em]">City of Truth Ministries</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Valparai · Tamil Nadu · India</p>
                        </div>
                    </div>
                    <div className="text-center flex flex-col items-center justify-center gap-1.5 py-2">
                        <p className="text-[11px] font-black text-amber-600 uppercase tracking-[0.2em] drop-shadow-sm">Hebrew Calendar {safeYear}</p>
                        <p className="text-[10px] text-slate-500 font-bold tracking-wide">© {new Date().getFullYear()} <span className="text-brand-800 font-black">City of Truth Ministries</span> · All rights reserved</p>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] text-slate-400 font-bold">
                        <span>📞 +91 8056125478</span>
                        <span>🌐 city-of-truth-ministries.vercel.app</span>
                    </div>
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
                                const selectedGregorian = dayObj?.gregorianDate;
                                if (dayObj && dayObj.festivals.length > 0) {
                                    return (
                                        <div className="space-y-3 mt-4">
                                            {selectedGregorian && (
                                                <div className="text-sm text-slate-500 font-semibold">
                                                    Gregorian date: {selectedGregorian}
                                                </div>
                                            )}
                                            <div className="flex flex-wrap gap-2">
                                                {dayObj.festivals.map(f => (
                                                    <span key={f} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-bold border border-red-100 flex items-center gap-2">
                                                        <Sparkles size={14} /> {f}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <div className="space-y-2">
                                        {selectedGregorian && <div className="text-sm text-slate-500 font-semibold">Gregorian date: {selectedGregorian}</div>}
                                        <div className="text-slate-400 italic">No major festivals on this date.</div>
                                    </div>
                                );
                            })()}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hebrew Calendar & Leap Year Facts Section */}
            <div className="bg-gradient-to-br from-slate-50 to-brand-50/30 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] space-y-6 md:space-y-8 font-serif">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
                    <div>
                        <h3 className="text-xl md:text-3xl font-bold text-brand-950 flex items-center gap-2 md:gap-3">
                            <Sparkles className="text-amber-500 w-5 h-5 md:w-7 md:h-7" /> Hebrew Calendar & Leap Year Facts
                        </h3>
                        <p className="text-xs md:text-sm text-slate-500 font-sans mt-1">Understanding the divine astronomical alignment of the Biblical calendar</p>
                    </div>
                    <div className="bg-amber-100 border border-amber-200 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black text-amber-800 uppercase tracking-widest self-start md:self-auto shadow-sm">
                        Lunisolar System • Shanah Me'uberet
                    </div>
                </div>

                {/* Stats Bar - MOVED TO TOP with animations and Hebrew New Year info */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-4"
                >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, type: "spring" }}
                            whileHover={{ scale: 1.05, rotate: 2 }}
                            className="p-3 md:p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="text-xl md:text-2xl font-black text-brand-900 leading-none">19 Years</div>
                            <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 mt-1.5 font-sans tracking-wider">Metonic Cycle</p>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            whileHover={{ scale: 1.05, rotate: -2 }}
                            className="p-3 md:p-4 bg-white rounded-xl border border-amber-100 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="text-xl md:text-2xl font-black text-amber-600 leading-none">7 Leap Years</div>
                            <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 mt-1.5 font-sans tracking-wider">Per Cycle</p>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                            whileHover={{ scale: 1.05, rotate: 2 }}
                            className="p-3 md:p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="text-xl md:text-2xl font-black text-brand-900 leading-none">383-385 Days</div>
                            <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 mt-1.5 font-sans tracking-wider">Leap Year Length</p>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, type: "spring" }}
                            whileHover={{ scale: 1.05, rotate: -2 }}
                            className="p-3 md:p-4 bg-white rounded-xl border border-amber-100 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="text-xl md:text-2xl font-black text-amber-600 leading-none">Passover</div>
                            <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 mt-1.5 font-sans tracking-wider">Anchored in Spring</p>
                        </motion.div>
                    </div>
                    
                    {/* Hebrew New Year Celebration Info */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-200 rounded-2xl p-4 md:p-5 text-center"
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <CalendarIcon className="text-amber-600 w-5 h-5" />
                            <h4 className="font-black text-brand-950 text-sm md:text-base uppercase tracking-wider">Hebrew New Year Celebration</h4>
                        </div>
                        <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-sans">
                            <strong className="text-amber-700">Rosh Hashanah (ראש השנה)</strong> - The Jewish New Year is celebrated on <strong>1st and 2nd of Tishrei</strong> (usually September/October). It marks the beginning of the High Holy Days and the civil new year, while Nisan remains the first month of the religious calendar.
                        </p>
                        <p className="text-[10px] text-amber-700 font-bold mt-2 uppercase tracking-widest">
                            தலை வருடம் - திஷ்ரே மாதம் 1 & 2
                        </p>
                    </motion.div>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                    {/* Left Column: Lunar/Solar Alignment */}
                    <div className="space-y-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                <Globe size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-brand-950 text-sm md:text-base">Lunisolar Alignment • சந்திர-சூரிய நாட்காட்டி</h4>
                                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans">
                                    Unlike the Gregorian calendar (purely solar) or the Islamic calendar (purely lunar), the Hebrew calendar is <strong>lunisolar</strong>. Months align with the moon cycles, but years adjust to align with the sun, keeping biblical festivals in their proper agricultural seasons.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                <BookOpen size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-brand-950 text-sm md:text-base">The Biblical Command • வேத கட்டளை</h4>
                                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans">
                                    Deuteronomy 16:1 commands: <em>"Observe the month of Aviv (Spring) and keep the Passover..."</em>. Since a standard lunar year is 11 days shorter than a solar year, Passover would drift backward into winter without intercalation. The leap month keeps it anchored in the spring.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: The Metonic Cycle */}
                    <div className="space-y-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                <Calculator size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-brand-950 text-sm md:text-base">The 19-Year Cycle (Metonic) • 19-ஆண்டு சுழற்சி</h4>
                                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans">
                                    To balance the solar and lunar cycles, the calendar uses a 19-year cycle. Every 19 years, a leap month is added 7 times to correct the drift. These leap years occur in the <strong>3rd, 6th, 8th, 11th, 14th, 17th, and 19th</strong> years of the cycle.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                <CalendarIcon size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-brand-950 text-sm md:text-base">Adar I & Adar II Structure • அதார் I மற்றும் II</h4>
                                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans">
                                    During a leap year, a 30-day month named <strong>Adar I (Adar Rishon)</strong> is inserted before the standard Adar. The regular month of Adar becomes <strong>Adar II (Adar Sheni)</strong> and is 29 days. Joyous festivals like Purim are celebrated in Adar II to stay close to Nisan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const FestivalsView: React.FC = () => {
    const exportRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleDownloadPDF = async () => {
        if (!exportRef.current) return;
        setIsExporting(true);
        try {
            const dataUrl = await captureNodeToJpeg(exportRef.current, { backgroundColor: '#0f0c29', width: 900 });
            const img = new Image();
            img.src = dataUrl;
            await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(); });
            const A4_W = 210;
            const pdfH = (img.height * A4_W) / img.width;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [A4_W, pdfH] });
            pdf.addImage(dataUrl, 'JPEG', 0, 0, A4_W, pdfH);
            pdf.save('COT-Hebrew-Festivals.pdf');
        } catch (e) {
            console.error(e);
            alert('Export failed, please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-16">
            {/* Hidden export card */}
            <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1, pointerEvents: 'none' }}>
                <div ref={exportRef} style={{ width: '900px', background: 'linear-gradient(135deg, #0f0c29 0%, #1a1450 50%, #0f0c29 100%)', padding: '48px', fontFamily: 'Georgia, serif', color: '#fff', borderRadius: '24px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: 900, color: '#f0c040', textTransform: 'uppercase', letterSpacing: '0.06em' }}>City of Truth Ministries</div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Valparai · India</div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '22px', fontWeight: 900, color: '#f0c040' }}>Divine Festivals</div>
                            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>தெய்வீக பண்டிகைகள்</div>
                        </div>
                    </div>
                    {/* Grid of festivals */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        {BIBLICAL_FESTIVALS.map((f, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ fontSize: '13px', fontWeight: 900, color: '#f0c040', marginBottom: '4px' }}>{f.name}</div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', letterSpacing: '0.1em' }}>{f.date}</div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: '6px' }}>{f.desc}</div>
                                <div style={{ fontSize: '11px', color: '#93c5fd', fontStyle: 'italic' }}>{f.tamil}</div>
                            </div>
                        ))}
                    </div>
                    {/* Footer */}
                    <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                        <span>© {new Date().getFullYear()} City of Truth Ministries · All rights reserved</span>
                        <span>+91 8056125478 · city-of-truth-ministries.vercel.app</span>
                    </div>
                </div>
            </div>

            <div className="relative h-[450px] flex items-center justify-center p-8 bg-white rounded-[3rem] overflow-hidden group border border-amber-100 shadow-[0_20px_50px_rgba(245,158,11,0.12)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-200/60 via-transparent to-transparent"></div>
                <div className="relative z-10 w-full max-w-md h-full flex flex-col items-center justify-center">
                    <div className="w-full h-full scale-90 origin-center">
                        <InteractiveMenorah />
                    </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-300/30 rounded-full blur-[80px] animate-pulse pointer-events-none" />
            </div>

            <div className="flex items-center justify-between -mt-8 mb-12 relative z-20">
                <div className="text-center flex-1">
                    <h3 className="text-4xl font-serif italic text-brand-950 font-bold tracking-widest drop-shadow-sm">Divine Festivals</h3>
                    <p className="text-amber-600 font-bold text-lg mt-1">தெய்வீக பண்டிகைகள்</p>
                    <div className="h-1 w-24 bg-amber-500 mx-auto mt-4 rounded-full" />
                </div>
                <button
                    onClick={handleDownloadPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-900 to-brand-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:from-brand-800 hover:to-brand-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
                >
                    {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    Download PDF
                </button>
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
                            <h4 className="text-xl font-bold text-brand-950 mb-1 group-hover:text-brand-700 transition-colors">{f.name}</h4>
                            <p className="text-sm font-bold text-blue-600 mb-3">{f.tamil}</p>
                            <p className="text-sm text-slate-500 leading-relaxed font-light group-hover:text-slate-600">{f.desc}</p>
                            <div className="mt-3 flex items-center gap-3">
                                <button
                                    onClick={(e) => { e.stopPropagation(); audioService.playHebrew(f.name); }}
                                    className="flex items-center gap-1 text-[10px] text-brand-600 hover:text-brand-800 font-bold transition-colors"
                                    title="Listen in Hebrew"
                                >
                                    <Volume2 size={12} /> Listen (Hebrew)
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); audioService.playTamil(f.tamil); }}
                                    className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-bold transition-colors"
                                    title="Listen in Tamil"
                                >
                                    <Volume2 size={12} /> கேள் (தமிழ்)
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const ReferenceView: React.FC = () => {
    const leap = isLeapYear(5786);
    const exportMonthsRef = useRef<HTMLDivElement>(null);
    const [isExportingMonths, setIsExportingMonths] = useState(false);

    const handleDownloadMonthsPDF = async () => {
        if (!exportMonthsRef.current) return;
        setIsExportingMonths(true);
        try {
            const dataUrl = await captureNodeToJpeg(exportMonthsRef.current, { backgroundColor: '#0f0c29', width: 900 });
            const img = new Image();
            img.src = dataUrl;
            await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(); });
            const A4_W = 210;
            const pdfH = (img.height * A4_W) / img.width;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [A4_W, pdfH] });
            pdf.addImage(dataUrl, 'JPEG', 0, 0, A4_W, pdfH);
            pdf.save('COT-Hebrew-Months-Days.pdf');
        } catch (e) {
            console.error(e);
            alert('Export failed, please try again.');
        } finally {
            setIsExportingMonths(false);
        }
    };

    return (
        <div className="space-y-16">
            {/* Hidden export card for Months & Days */}
            <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1, pointerEvents: 'none' }}>
                <div ref={exportMonthsRef} style={{ width: '900px', background: 'linear-gradient(135deg, #0f0c29 0%, #1a1450 50%, #0f0c29 100%)', padding: '48px', fontFamily: 'Georgia, serif', color: '#fff', borderRadius: '24px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 900, color: '#f0c040', textTransform: 'uppercase', letterSpacing: '0.06em' }}>City of Truth Ministries</div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Valparai · India</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '20px', fontWeight: 900, color: '#f0c040' }}>Hebrew Months & Days</div>
                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>எபிரேய மாதங்கள் மற்றும் நாட்கள்</div>
                        </div>
                    </div>
                    {/* Months grid */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#f0c040', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>Months · மாதங்கள்</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                            {HEBREW_MONTHS_DATA.map((m, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 900, color: '#f0c040' }}>{(i+1).toString().padStart(2,'0')}. {m.name}</div>
                                    <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', direction: 'rtl', margin: '4px 0' }}>{m.hebrewScript}</div>
                                    <div style={{ fontSize: '11px', color: '#93c5fd', marginBottom: '4px' }}>{m.tamil}</div>
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{m.gregorian}</div>
                                    {m.holidays && <div style={{ fontSize: '9px', color: '#fde68a', marginTop: '4px' }}>{m.holidays}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Days grid */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#f0c040', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>Days of the Week · வாரத்தின் நாட்கள்</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr', gap: '8px' }}>
                            {HEBREW_DAYS.map((d, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '10px', padding: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ fontSize: '16px', color: '#a78bfa', direction: 'rtl', marginBottom: '4px' }}>{d.hebrew}</div>
                                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#f0c040' }}>{d.name}</div>
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{d.english}</div>
                                    <div style={{ fontSize: '10px', color: '#93c5fd', marginTop: '3px' }}>{d.tamil}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Footer */}
                    <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                        <span>© {new Date().getFullYear()} City of Truth Ministries · All rights reserved</span>
                        <span>+91 8056125478 · city-of-truth-ministries.vercel.app</span>
                    </div>
                </div>
            </div>

            {/* Hebrew Months Section */}
            <div>
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-serif font-bold text-brand-950 flex items-center gap-3">
                        <BookOpen className="text-brand-600" /> Hebrew Months
                        <span className="text-amber-600 font-normal text-lg">· எபிரேய மாதங்கள்</span>
                    </h3>
                    <button
                        onClick={handleDownloadMonthsPDF}
                        disabled={isExportingMonths}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-900 to-brand-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:from-brand-800 hover:to-brand-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
                    >
                        {isExportingMonths ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        Download PDF
                    </button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {HEBREW_MONTHS_DATA.map((m, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-start gap-5 group hover:border-brand-200 transition-all hover:shadow-lg">
                            <div className="text-3xl font-serif text-slate-200 group-hover:text-brand-100 transition-colors shrink-0 w-10 text-center">{(i + 1).toString().padStart(2, '0')}</div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start gap-2 flex-wrap">
                                    <div>
                                        <h4 className="text-lg font-bold text-brand-950">{m.name}</h4>
                                        {m.hebrewScript && <p className="text-xl font-serif text-accent-700" dir="rtl">{m.hebrewScript}</p>}
                                        <p className="text-sm font-bold text-blue-600">{m.tamil}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-accent-600 font-bold mb-1 uppercase tracking-widest mt-2">{m.gregorian}</p>
                                {m.holidays && <p className="text-xs text-amber-700 font-bold">{m.holidays}</p>}
                                <p className="text-[10px] text-slate-400 italic">{m.notes}</p>
                                <div className="flex gap-3 mt-2">
                                    <button
                                        onClick={() => audioService.playHebrew(m.hebrewScript || m.name)}
                                        className="flex items-center gap-1 text-[10px] text-brand-600 hover:text-brand-800 font-bold transition-colors"
                                        title="Listen in Hebrew"
                                    >
                                        <Volume2 size={12} /> Listen (Hebrew)
                                    </button>
                                    <button
                                        onClick={() => audioService.playTamil(m.tamil)}
                                        className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-bold transition-colors"
                                        title="Listen in Tamil"
                                    >
                                        <Volume2 size={12} /> கேள் (தமிழ்)
                                    </button>
                                </div>
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
                    <span className="text-amber-600 font-normal text-lg">· வாரத்தின் நாட்கள்</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {HEBREW_DAYS.map((day, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-default">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors font-bold text-sm">
                                    {i + 1}
                                </div>
                            </div>
                            <h4 className="text-lg font-bold text-brand-950 mb-0.5">{day.name}</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">{day.english}</p>
                            <p className="text-sm font-bold text-blue-600 mb-3">{day.tamil}</p>
                            <div className="text-3xl font-serif text-accent-600 border-t border-slate-50 pt-4 mt-4" dir="rtl">{day.hebrew}</div>
                            <div className="flex gap-3 mt-3">
                                <button
                                    onClick={() => audioService.playHebrew(day.hebrew)}
                                    className="flex items-center gap-1 text-[10px] text-brand-600 hover:text-brand-800 font-bold transition-colors"
                                    title="Listen in Hebrew"
                                >
                                    <Volume2 size={12} /> Listen (Hebrew)
                                </button>
                                <button
                                    onClick={() => audioService.playTamil(day.tamil)}
                                    className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-bold transition-colors"
                                    title="Listen in Tamil"
                                >
                                    <Volume2 size={12} /> கேள் (தமிழ்)
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const CHENNAI_TIMEZONE = 'Asia/Kolkata';

const AnalogDial: React.FC<{
    label: string;
    hourAngle: number;
    minuteAngle: number;
    secondAngle: number;
    is24Hour: boolean;
}> = ({ label, hourAngle, minuteAngle, secondAngle, is24Hour }) => {
    const letters = is24Hour 
        ? ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'יא', 'יב', 'יג', 'יד', 'טו', 'טז', 'יז', 'יח', 'יט', 'כ', 'כא', 'כב', 'כג', 'כד'] 
        : ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל'];

    return (
        <div className="bg-[#0f1026] border border-white/10 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col items-center hover:border-[#C5A880]/30 transition-all relative group overflow-hidden w-full max-w-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-[#C5A880]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C5A880] text-center mb-6 relative z-10">{label}</p>
            
            {/* Clock Face Circle - Bigger and Bold! */}
            <div className="relative w-64 h-64 sm:w-76 sm:h-76 md:w-80 md:h-80 rounded-full border-[8px] border-double border-[#C5A880] bg-gradient-to-br from-[#121330] to-[#08091a] shadow-[0_0_35px_rgba(197,168,128,0.25),inset_0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center">
                {/* Dial numbers placed using polar trigonometry */}
                {letters.map((char, i) => {
                    const value = i + 1;
                    const angle = value * (is24Hour ? 15 : 30);
                    const angleRad = (angle * Math.PI) / 180;
                    const radiusPercent = 38; // Radius of letters placement
                    const left = 50 + radiusPercent * Math.sin(angleRad);
                    const top = 50 - radiusPercent * Math.cos(angleRad);
                    
                    return (
                        <div
                            key={value}
                            className="absolute flex flex-col items-center justify-center leading-none text-center select-none"
                            style={{
                                left: `${left}%`,
                                top: `${top}%`,
                                transform: 'translate(-50%, -50%)',
                            }}
                        >
                            <span className="text-[10px] sm:text-[12px] font-extrabold text-white">{value}</span>
                            <span className="text-[8px] sm:text-[9px] font-black text-[#C5A880] mt-0.5">{char}</span>
                        </div>
                    );
                })}

                {/* Hour Hand */}
                <div
                    className="absolute left-1/2 top-1/2 w-[5px] sm:w-[6px] h-[30%] bg-gradient-to-t from-[#C5A880] to-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                    style={{
                        transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
                        transformOrigin: '50% 100%',
                    }}
                />

                {/* Minute Hand */}
                <div
                    className="absolute left-1/2 top-1/2 w-[3px] sm:w-[4px] h-[38%] bg-gradient-to-t from-slate-300 to-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                    style={{
                        transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
                        transformOrigin: '50% 100%',
                    }}
                />

                {/* Second Hand */}
                <div
                    className="absolute left-1/2 top-1/2 w-[1.5px] h-[44%] bg-red-500 rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.3)]"
                    style={{
                        transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`,
                        transformOrigin: '50% 100%',
                    }}
                />

                {/* Center Pivot Point */}
                <div className="absolute left-1/2 top-1/2 w-4 h-4 bg-slate-950 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-[#C5A880] shadow-md flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-[#C5A880] rounded-full" />
                </div>
            </div>
        </div>
    );
};

const HebrewClockView: React.FC = () => {
    const [now, setNow] = useState(() => new Date());
    const clockRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    const digitalTime = useMemo(
        () =>
            now.toLocaleTimeString('en-IN', {
                timeZone: CHENNAI_TIMEZONE,
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }),
        [now]
    );

    const dateLine = useMemo(
        () =>
            now.toLocaleDateString('en-IN', {
                timeZone: CHENNAI_TIMEZONE,
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
        [now]
    );

    const [hour = 0, minute = 0, second = 0] = digitalTime.split(':').map((v) => Number(v));
    const hourAngle = ((hour % 12) + minute / 60 + second / 3600) * 30;
    const hour24Angle = (hour + minute / 60 + second / 3600) * 15;
    const minuteAngle = (minute + second / 60) * 6;
    const secondAngle = second * 6;
    const hebrewDigitalTime = `${toHebrew((hour % 12) || 12)}:${toHebrew(minute)}:${toHebrew(second)}`;
    const hebrewDigital24Time = `${toHebrew(hour)}:${toHebrew(minute)}:${toHebrew(second)}`;

    const handleDownloadClock = async () => {
        if (!clockRef.current) return;
        setIsExporting(true);
        try {
            const dataUrl = await captureNodeToJpeg(clockRef.current, { backgroundColor: '#020617', width: 900 });
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `COT-Hebrew-Clock-${Date.now()}.jpg`;
            link.click();
        } catch (e) {
            console.error('Failed to export clock:', e);
            alert('Failed to export clock. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div ref={clockRef} className="space-y-10 bg-slate-950 text-white rounded-[2.5rem] p-6 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

                <div className="text-center relative z-10 space-y-2">
                    <h3 className="text-3xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 drop-shadow-md">Hebrew Clock — Chennai Time</h3>
                    <p className="text-slate-400 max-w-xl mx-auto text-xs sm:text-sm">Synchronized to Chennai, India (Asia/Kolkata timezone)</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 relative z-10 justify-items-center">
                    {/* 12-Hour Clock */}
                    <AnalogDial
                        label="12-Hour Sacred Dial (Hebrew Letters + Numbers)"
                        hourAngle={hourAngle}
                        minuteAngle={minuteAngle}
                        secondAngle={secondAngle}
                        is24Hour={false}
                    />
                    {/* 24-Hour Clock */}
                    <AnalogDial
                        label="24-Hour Solar Dial (Full Day Cycle א - כד)"
                        hourAngle={hour24Angle}
                        minuteAngle={minuteAngle}
                        secondAngle={secondAngle}
                        is24Hour={true}
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 text-center shadow-lg hover:border-amber-500/20 transition-all flex flex-col justify-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 mb-2">Sacred 12H Time</p>
                        <div className="text-3xl sm:text-4xl font-black tracking-wider text-white drop-shadow-md" dir="rtl">{hebrewDigitalTime}</div>
                        <p className="text-[9px] text-slate-400 mt-2">Hebrew numerals (12H cycle)</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 text-center shadow-lg hover:border-amber-500/20 transition-all flex flex-col justify-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 mb-2">Solar 24H Time</p>
                        <div className="text-3xl sm:text-4xl font-black tracking-wider text-white drop-shadow-md" dir="rtl">{hebrewDigital24Time}</div>
                        <p className="text-[9px] text-slate-400 mt-2">Hebrew numerals (24H cycle)</p>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-amber-500/50 rounded-[2rem] p-8 text-center shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col justify-center items-center">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 mb-3 flex items-center gap-2"><Sparkles size={14} /> Standard Digital Time <Sparkles size={14} /></p>
                        <div className="text-5xl md:text-6xl font-black font-mono tracking-widest text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">{digitalTime}</div>
                        <p className="text-sm text-slate-300 mt-4 font-bold uppercase tracking-widest">{dateLine}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-6">
                <button
                    onClick={handleDownloadClock}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-brand-950 rounded-full hover:from-amber-400 hover:to-amber-500 font-black text-sm uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_15px_30px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 disabled:opacity-50"
                >
                    {isExporting ? (
                        <><span className="animate-spin text-sm">⏳</span> Exporting Image...</>
                    ) : (
                        <><Download size={18} /> Download and use it</>
                    )}
                </button>
            </div>
        </div>
    );
};

const GrammarView: React.FC = () => {
    const [sentence, setSentence] = useState('');
    const [correctedSentence, setCorrectedSentence] = useState('');
    const [correctionNotes, setCorrectionNotes] = useState<string[]>([]);
    const [isExportingGrammar, setIsExportingGrammar] = useState(false);
    const grammarExportRef = useRef<HTMLDivElement>(null);

    const grammarTopics = [
        {
            title: 'Hebrew Script & Direction',
            tamil: 'எபிரேய எழுத்து மற்றும் திசை (Hebrew Script & Direction)',
            points: [
                'Hebrew is written from right to left.',
                'The alphabet has 22 letters (Aleph to Tav).',
                'Five letters have final forms at word endings: ך ם ן ף ץ.',
                'Diacritics and punctuation should keep visual flow right-to-left for fluent reading.',
            ],
        },
        {
            title: 'Vowels (Nikkud)',
            tamil: 'உயிரெழுத்துக்கள் - நிக்குத் (Vowels - Nikkud)',
            points: [
                'Ancient Hebrew consonants are read with vowel marks called nikkud.',
                'Common marks include kamatz (ָ), patach (ַ), segol (ֶ), hiriq (ִ), and holam (ֹ).',
                'Modern Hebrew often omits nikkud in daily text, but biblical reading uses them for clarity.',
                'When learning, read each word first with nikkud and then without nikkud to build fluency.',
            ],
        },
        {
            title: 'Gender and Number',
            tamil: 'பாலினம் மற்றும் எண் (Gender and Number)',
            points: [
                'Nouns are masculine or feminine.',
                'Words change for singular and plural forms.',
                'Adjectives must agree with nouns in gender and number.',
                'Common plural endings include -ים (masculine) and -ות (feminine), with notable irregular nouns.',
            ],
        },
        {
            title: 'Verb Roots (Shoresh)',
            tamil: 'வினைச்சொல் வேர்கள் - ஷோரெஷ் (Verb Roots - Shoresh)',
            points: [
                'Most Hebrew words come from a 3-letter root.',
                'Verb patterns (binyanim) shape voice and meaning.',
                'Tense usage is often described as perfect (completed) and imperfect (ongoing/future).',
                'Tracking binyan changes helps identify active, passive, and reflexive meaning quickly.',
            ],
        },
        {
            title: 'Sentence Structure',
            tamil: 'வாக்கிய அமைப்பு (Sentence Structure)',
            points: [
                'Biblical Hebrew often uses verb-subject-object order, while modern usage can be more flexible.',
                'Construct state (smikhut) links nouns into possession-like phrases without extra particles.',
                'Particles such as את, גם, רק, and הנה add emphasis and structure to meaning.',
            ],
        },
        {
            title: 'Prefix & Suffix Meaning',
            tamil: 'முன்னொட்டு & பின்னொட்டு பொருள் (Prefix & Suffix Meaning)',
            points: [
                'ו can mean “and”, ב means “in”, ל means “to/for”, כ means “as/like”.',
                'Possessive endings attach to nouns (e.g., -י means “my”).',
                'Pronoun endings may attach to verbs and prepositions.',
                'A single Hebrew word can carry conjunction, preposition, root, and suffix together.',
            ],
        },
        {
            title: 'Biblical Reading Tips',
            tamil: 'விவிலிய வாசிப்பு குறிப்புகள் (Biblical Reading Tips)',
            points: [
                'Read slowly by syllable before speed reading.',
                'Track roots to understand related words across verses.',
                'Use both Hebrew and English context together for better learning.',
                'Mark repeated grammar patterns in a passage to improve long-term retention.',
            ],
        },
    ];

    const rectifySentence = () => {
        const trimmed = sentence.replace(/\s+/g, ' ').trim();
        if (!trimmed) {
            setCorrectedSentence('');
            setCorrectionNotes(['Please enter a sentence to rectify.']);
            return;
        }

        let next = trimmed;
        const notes: string[] = [];

        const punctuationSpaced = next
            .replace(/\s+([,.;:!?])/g, '$1')
            .replace(/([,.;:!?])(?!\s|$)/g, '$1 ');
        if (punctuationSpaced !== next) notes.push('Normalized spacing around punctuation.');
        next = punctuationSpaced;

        const finalToRegular: Record<string, string> = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' };
        const regularToFinal: Record<string, string> = { כ: 'ך', מ: 'ם', נ: 'ן', פ: 'ף', צ: 'ץ' };

        const normalizedWords = next.split(' ').map((word) => {
            const match = word.match(/^(.+?)([.,;:!?]*)$/);
            const core = match?.[1] || word;
            const suffix = match?.[2] || '';
            if (!core) return word;

            const chars = core.split('');
            for (let i = 0; i < chars.length - 1; i += 1) {
                const regularChar = finalToRegular[chars[i]];
                if (regularChar) chars[i] = regularChar;
            }
            const lastIdx = chars.length - 1;
            if (regularToFinal[chars[lastIdx]]) chars[lastIdx] = regularToFinal[chars[lastIdx]];
            return `${chars.join('')}${suffix}`;
        }).join(' ');

        if (normalizedWords !== next) notes.push('Adjusted Hebrew final-letter forms at word endings.');
        next = normalizedWords;

        const capitalized = next.replace(/^[a-z]/, (c) => c.toUpperCase());
        if (capitalized !== next) notes.push('Capitalized sentence beginning.');
        next = capitalized;

        if (!/[.!?]$/.test(next)) {
            next = `${next}.`;
            notes.push('Added sentence-ending punctuation.');
        }

        setCorrectedSentence(next);
        setCorrectionNotes(notes.length ? notes : ['No changes were needed.']);
    };

    const handleGrammarExport = async (format: 'pdf' | 'png') => {
        if (!grammarExportRef.current || !correctedSentence) return;
        setIsExportingGrammar(true);
        try {
            const image = await toPng(grammarExportRef.current, { pixelRatio: 2.5, cacheBust: true, backgroundColor: '#0f172a' });
            const fileBase = `COT-Hebrew-Grammar-Rectification-${Date.now()}`;
            if (format === 'png') {
                const link = document.createElement('a');
                link.href = image;
                link.download = `${fileBase}.png`;
                link.click();
            } else {
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                const width = pdf.internal.pageSize.getWidth();
                const img = new Image();
                img.src = image;
                await new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = () => reject(new Error('Failed to load grammar preview image for export.'));
                });
                const height = Math.min((img.height * width) / img.width, pdf.internal.pageSize.getHeight());
                pdf.addImage(image, 'PNG', 0, 0, width, height);
                pdf.save(`${fileBase}.pdf`);
            }
        } catch (error) {
            console.error('Grammar export failed:', error);
            alert('Could not export grammar result. Please try again.');
        } finally {
            setIsExportingGrammar(false);
        }
    };

    return (
        <div className="space-y-10 bg-slate-950 text-white rounded-[2.5rem] p-6 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto relative z-10 space-y-2">
                <h3 className="text-3xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 drop-shadow-md">Hebrew Grammar</h3>
                <p className="text-slate-400 text-xs sm:text-sm">A complete foundation for script, vowels, sentence flow, roots, and biblical reading mastery.</p>
            </div>

            {/* Sentence Rectifier (At the Top!) */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-xl space-y-5 relative z-10 hover:border-amber-500/10 transition-all">
                <div className="space-y-2">
                    <h4 className="text-2xl font-bold text-[#C5A880]">Sentence Rectifier</h4>
                    <p className="text-xs sm:text-sm text-slate-400">Paste a sentence and rectify spacing, punctuation, and Hebrew final-letter form mistakes instantly.</p>
                </div>
                <textarea
                    value={sentence}
                    onChange={(e) => setSentence(e.target.value)}
                    placeholder="Type Hebrew or transliterated sentence here..."
                    className="w-full min-h-28 rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-[#C5A880]/20 transition-all"
                />
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={rectifySentence}
                        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C5A880] to-[#E5C9A3] text-brand-950 font-extrabold text-sm hover:from-white hover:to-white transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                        Rectify Mistakes
                    </button>
                    {correctedSentence && (
                        <>
                            <button
                                onClick={() => handleGrammarExport('pdf')}
                                disabled={isExportingGrammar}
                                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500 text-white font-bold text-sm shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95"
                            >
                                {isExportingGrammar ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                Export PDF
                            </button>
                            <button
                                onClick={() => handleGrammarExport('png')}
                                disabled={isExportingGrammar}
                                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95"
                            >
                                {isExportingGrammar ? <Loader2 size={14} className="animate-spin" /> : <FileImage size={14} />}
                                Export Image
                            </button>
                        </>
                    )}
                </div>
                {correctedSentence && (
                    <div className="bg-[#0f1026] text-white rounded-[1.5rem] p-5 border border-white/10 space-y-3 shadow-inner">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#C5A880] font-black">Professional Export Preview</p>
                        <p className="text-xs text-slate-400 font-bold">Corrected Sentence</p>
                        <div className="text-2xl font-serif bg-white/5 rounded-xl p-4 border border-white/5 text-white" dir="rtl">{correctedSentence}</div>
                        <p className="text-xs text-slate-400 font-bold mt-2">Applied Rules & Details</p>
                        <ul className="space-y-1 text-xs text-slate-300 list-disc pl-5">
                            {correctionNotes.map((note) => <li key={note}>{note}</li>)}
                        </ul>
                    </div>
                )}
            </div>

            {/* Grammar Topics (Below the Rectifier!) */}
            <div className="grid md:grid-cols-2 gap-6 relative z-10">
                {grammarTopics.map((topic) => (
                    <div key={topic.title} className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-sm hover:border-[#C5A880]/20 transition-all">
                        <h4 className="text-lg font-bold text-[#C5A880] mb-1">{topic.title}</h4>
                        {topic.tamil && <p className="text-xs text-blue-400 font-bold mb-3">{topic.tamil}</p>}
                        <ul className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed list-disc pl-5">
                            {topic.points.map(point => (
                                <li key={point}>{point}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Hidden/offscreen premium render card for capture */}
            {correctedSentence && (
                <div
                    ref={grammarExportRef}
                    style={{ position: 'fixed', left: '-9999px', top: 0, width: '800px', pointerEvents: 'none', zIndex: -1 }}
                >
                    <div style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1450 50%, #0f0c29 100%)', padding: '48px', fontFamily: 'Georgia, serif', color: '#ffffff', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px', borderRadius: '24px' }} />
                        
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <img src="/logo.png" alt="COT Logo" style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', padding: '6px' }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '0.06em', color: '#f0c040', textTransform: 'uppercase' }}>City of Truth Ministries</div>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '3px' }}>Valparai &bull; India</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '3px' }}>Hebrew Grammar Study</div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>AI Sentence Rectifier</div>
                            </div>
                        </div>

                        {/* Rectified Sentence Hero */}
                        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>Rectified Sentence</div>
                            <div style={{ fontSize: '44px', fontWeight: 900, color: '#f0c040', letterSpacing: '0.04em', lineHeight: 1.3, direction: 'rtl', marginBottom: '16px' }}>{correctedSentence}</div>
                            {sentence !== correctedSentence && (
                                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', direction: 'rtl' }}>Original: {sentence}</div>
                            )}
                        </div>

                        {/* Corrections Badge */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                            <div style={{ background: 'rgba(240,192,64,0.15)', border: '1px solid rgba(240,192,64,0.3)', borderRadius: '40px', padding: '8px 24px', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '9px', fontWeight: 900, color: '#f0c040', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Rectification Report</span>
                            </div>
                        </div>

                        {/* Notes details as beautiful study blocks */}
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '18px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ fontSize: '11px', fontWeight: 900, color: '#93c5fd', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '14px' }}>Grammar Corrections & Rules Applied</div>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '20px', listStyleType: 'disc', color: '#f1f5f9', fontSize: '14px', lineHeight: '1.5' }}>
                                {correctionNotes.map((note, idx) => (
                                    <li key={idx} style={{ color: '#e2e8f0' }}>{note}</li>
                                ))}
                            </ul>
                        </div>

                        <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
                            Valparai, Tamil Nadu, India &bull; Study faithfully. May your eyes see the wonders of the Hebrew tongue.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════════
   PAGE 1: Number → Hebrew Numeral
══════════════════════════════════════════════════════ */
const HebrewConverterNumbers: React.FC = () => {
    const [input, setInput] = useState<number | ''>('');
    const [search, setSearch] = useState('');
    const [isExportingNumbers, setIsExportingNumbers] = useState(false);
    const numbersExportRef = useRef<HTMLDivElement>(null);



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

    const handleNumbersExport = async () => {
        if (!numbersExportRef.current || !input || !hebrewResult) return;
        setIsExportingNumbers(true);
        try {
            const dataUrl = await captureNodeToJpeg(numbersExportRef.current, { backgroundColor: '#020617', width: 900 });
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();

            const img = new Image();
            img.src = dataUrl;
            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error('Failed to load Numbers export image.'));
            });

            const footerH = 20;
            const maxImgH = pageH - footerH;
            const rawPdfH = (img.height * pdfW) / img.width;
            const pdfH = Math.min(rawPdfH, maxImgH);

            pdf.setFillColor(2, 6, 23);
            pdf.rect(0, 0, pdfW, pageH, 'F');

            const imgY = (maxImgH - pdfH) / 2;
            pdf.addImage(dataUrl, 'JPEG', 0, imgY, pdfW, pdfH);

            const footerY = pageH - footerH;
            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, footerY, pdfW, footerH, 'F');
            pdf.setDrawColor(217, 119, 6);
            pdf.setLineWidth(0.4);
            pdf.line(10, footerY + 0.6, pdfW - 10, footerY + 0.6);

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(8);
            pdf.setTextColor(251, 191, 36);
            pdf.text('CITY OF TRUTH MINISTRIES', pdfW / 2, footerY + 6.4, { align: 'center' });

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(6.4);
            pdf.setTextColor(148, 163, 184);
            pdf.text(`© ${new Date().getFullYear()} City of Truth Ministries. All rights reserved.`, pdfW / 2, footerY + 11.6, { align: 'center' });

            pdf.setFontSize(5.6);
            pdf.setTextColor(100, 116, 139);
            pdf.text('https://city-of-truth-ministries.vercel.app/', pdfW / 2, footerY + 16.2, { align: 'center', maxWidth: pdfW - 20 } as any);
            pdf.text('YouTube: City of Truth Ministries • வால்பாறை (Valparai)', pdfW / 2, footerY + 19.0, { align: 'center', maxWidth: pdfW - 20 } as any);

            const safeNum = String(input).replace(/[^0-9]/g, '') || 'number';
            pdf.save(`COT-Hebrew-Numbers-${safeNum}.pdf`);
        } catch (error) {
            console.error('Numbers export failed:', error);
            alert('Could not export Numbers result. Please try again.');
        } finally {
            setIsExportingNumbers(false);
        }
    };

    return (
        <div className="space-y-10 bg-slate-950 text-white rounded-[2.5rem] p-6 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="text-center relative z-10 space-y-2">
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 drop-shadow-md">Number → Hebrew Numeral</h2>
                <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">Convert any number to its sacred Hebrew representation</p>
            </div>

            {/* Sticky Hebrew numeral result — stays visible while scrolling */}
            {input !== '' && hebrewResult && (
                <div className="sticky top-[80px] md:top-[100px] z-30 flex justify-center pointer-events-none">
                    <div className="bg-slate-900/95 backdrop-blur-md border border-amber-500/30 rounded-full px-8 py-3 shadow-2xl shadow-amber-500/10 flex items-center gap-5 pointer-events-auto">
                        <span className="text-xl font-mono font-black text-white/80">{String(input)}</span>
                        <span className="text-amber-500/40 font-bold text-lg">→</span>
                        <span className="text-3xl font-serif font-black text-amber-400" dir="rtl">{hebrewResult}</span>
                    </div>
                </div>
            )}

            {/* Converter Card */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-xl relative z-10 hover:border-amber-500/20 transition-all">
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="flex-1 w-full space-y-4">
                        <label className="text-xs font-bold text-[#C5A880] uppercase tracking-widest flex items-center gap-2">
                            <Hash size={14} className="text-[#C5A880]" /> Enter Number
                        </label>
                        <input 
                            type="number" 
                            placeholder="e.g. 2026" 
                            className="w-full text-4xl md:text-6xl font-mono bg-transparent border-b-2 border-white/10 py-4 outline-none focus:border-[#C5A880] transition-colors text-white placeholder:text-slate-700" 
                            value={input} 
                            onChange={e => setInput(e.target.valueAsNumber || '')} 
                        />
                    </div>
                    <div className="hidden md:block w-px h-28 bg-white/10" />
                    <div className="flex-1 w-full text-center md:text-right space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Hebrew Numeral</label>
                        <div className={`${
                            hebrewResult.length > 15 ? 'text-xl md:text-5xl' :
                            hebrewResult.length > 10 ? 'text-2xl md:text-6xl' :
                            hebrewResult.length > 8 ? 'text-3xl md:text-7xl' :
                            hebrewResult.length > 5 ? 'text-4xl md:text-8xl' :
                            'text-6xl md:text-8xl'
                        } font-serif text-amber-400 font-black min-h-[1.5em] flex items-center justify-center md:justify-end drop-shadow-md`}>
                            {hebrewResult || '—'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Export PDF */}
            {input && hebrewResult && (
                <div className="relative z-10 -mt-2">
                    <button
                        onClick={handleNumbersExport}
                        disabled={isExportingNumbers}
                        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500 text-white font-bold text-sm shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                        {isExportingNumbers ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        Export PDF Study Card
                    </button>
                </div>
            )}

            {/* Hidden/offscreen premium render card for capture */}
            {input && hebrewResult && (
                <div style={{ position: 'fixed', left: '-9999px', top: 0, width: '900px', pointerEvents: 'none', zIndex: -1 }}>
                    <div
                        ref={numbersExportRef}
                        style={{
                            width: '900px',
                            background: 'linear-gradient(135deg, #0f0c29 0%, #1a1450 50%, #0f0c29 100%)',
                            padding: '48px',
                            fontFamily: 'Georgia, serif',
                            color: '#ffffff',
                            borderRadius: '24px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px', borderRadius: '24px' }} />

                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <img src="/logo.png" alt="COT Logo" style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', padding: '6px' }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '0.06em', color: '#f0c040', textTransform: 'uppercase' }}>City of Truth Ministries</div>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '3px' }}>வால்பாறை (Valparai) &bull; Tamil Nadu &bull; India</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '3px' }}>Hebrew Numbers Study</div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>Number → Hebrew Numeral</div>
                            </div>
                        </div>

                        {/* Hero */}
                        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>Number</div>
                            <div style={{ fontSize: '80px', fontWeight: 900, color: '#f0c040', letterSpacing: '0.04em', lineHeight: 1.05, marginBottom: '10px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace' }}>
                                {String(input)}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
                            <div style={{ width: '220px', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(240,192,64,0.9), transparent)' }} />
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '34px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>Hebrew Numeral</div>
                            <div style={{ fontSize: '92px', fontWeight: 900, color: '#f0c040', letterSpacing: '0.08em', lineHeight: 1.05, direction: 'rtl', fontFamily: 'serif' }}>
                                {hebrewResult}
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
                            City of Truth Ministries &bull; வால்பாறை (Valparai), Tamil Nadu, India &bull; https://city-of-truth-ministries.vercel.app/ &bull; YouTube: City of Truth Ministries
                        </div>
                    </div>
                </div>
            )}

            {/* Numeral Reference Guide */}
            <div className="space-y-6 relative z-10 pt-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <h3 className="text-lg font-serif font-bold text-[#C5A880]">Numeral Reference Guide</h3>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Find number or character…" 
                            className="w-full pl-11 pr-5 py-2.5 bg-white/5 border border-white/10 rounded-full outline-none focus:border-[#C5A880] text-sm text-white placeholder:text-slate-600 shadow-inner" 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filtered.map(item => (
                        <div key={item.num} className="bg-white/5 p-5 rounded-2xl border border-white/10 shadow-sm flex flex-col items-center gap-2 text-center hover:bg-white/10 hover:scale-105 hover:border-[#C5A880]/30 transition-all">
                            <span className="text-3xl text-amber-400 font-serif font-bold">{item.hebrew}</span>
                            <span className="text-xl font-bold text-white font-mono">{item.num}</span>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-full text-center py-16 text-slate-500 italic bg-white/5 border border-white/10 rounded-2xl">
                            No results for "{search}"
                        </div>
                    )}
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
    const [isExportingGematria, setIsExportingGematria] = useState(false);
    const gematriaExportRef = useRef<HTMLDivElement>(null);

    const total = useMemo(() => word.split('').reduce((sum, c) => sum + (GEMATRIA_VALUES[c] || 0), 0), [word]);

    const letterBreakdown = useMemo(() => {
        return word.split('').filter(c => c.trim()).map(c => ({ char: c, value: GEMATRIA_VALUES[c] || 0 }));
    }, [word]);

    const handleGematriaExport = async (format: 'pdf' | 'png') => {
        if (!gematriaExportRef.current || !word.trim()) return;
        setIsExportingGematria(true);
        try {
            const dataUrl = await captureNodeToJpeg(gematriaExportRef.current, { backgroundColor: '#020617', width: 900 });
            const safeWord = word.trim().replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '') || 'Hebrew-Word';
            const fileBase = `COT-Hebrew-Gematria-${safeWord}-${Date.now()}`;
            if (format === 'png') {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `${fileBase}.jpg`;
                link.click();
            } else {
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                const pdfW = pdf.internal.pageSize.getWidth();
                const pageH = pdf.internal.pageSize.getHeight();
                const img = new Image();
                img.src = dataUrl;
                await new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = () => reject(new Error('Failed to load Gematria image for PDF export.'));
                });

                // Reserve space for copyright/footer area
                const footerH = 20;
                const maxImgH = pageH - footerH;
                const rawPdfH = (img.height * pdfW) / img.width;
                const pdfH = Math.min(rawPdfH, maxImgH);

                // Fill background (avoid white gap)
                pdf.setFillColor(2, 6, 23);
                pdf.rect(0, 0, pdfW, pageH, 'F');

                // Center the study card in available area
                const imgY = (maxImgH - pdfH) / 2;
                pdf.addImage(dataUrl, 'JPEG', 0, imgY, pdfW, pdfH);

                // Footer background + divider
                const footerY = pageH - footerH;
                pdf.setFillColor(15, 23, 42);
                pdf.rect(0, footerY, pdfW, footerH, 'F');
                pdf.setDrawColor(217, 119, 6);
                pdf.setLineWidth(0.4);
                pdf.line(10, footerY + 0.6, pdfW - 10, footerY + 0.6);

                // Footer text
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(8);
                pdf.setTextColor(251, 191, 36);
                pdf.text('CITY OF TRUTH MINISTRIES', pdfW / 2, footerY + 6.4, { align: 'center' });

                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(6.4);
                pdf.setTextColor(148, 163, 184);
                pdf.text(`© ${new Date().getFullYear()} City of Truth Ministries. All rights reserved.`, pdfW / 2, footerY + 11.6, { align: 'center' });

                pdf.setFontSize(5.6);
                pdf.setTextColor(100, 116, 139);
                pdf.text('https://city-of-truth-ministries.vercel.app/', pdfW / 2, footerY + 16.2, { align: 'center', maxWidth: pdfW - 20 } as any);
                pdf.text('YouTube: City of Truth Ministries • வால்பாறை (Valparai)', pdfW / 2, footerY + 19.0, { align: 'center', maxWidth: pdfW - 20 } as any);
                pdf.save(`${fileBase}.pdf`);
            }
        } catch (error) {
            console.error('Gematria export failed:', error);
            alert('Could not export Gematria result. Please try again.');
        } finally {
            setIsExportingGematria(false);
        }
    };

    return (
        <div className="space-y-10 bg-slate-950 text-white rounded-[2.5rem] p-6 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="text-center relative z-10 space-y-2">
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 drop-shadow-md">Gematria Calculator</h2>
                <p className="text-slate-400 text-xs sm:text-sm">Type any Hebrew word to calculate its sacred numerical value</p>
            </div>

            {/* Sticky Gematria Total — always visible while scrolling */}
            {word.trim() && (
                <div className="sticky top-[80px] md:top-[100px] z-30 flex justify-center pointer-events-none">
                    <div className="bg-slate-900/95 backdrop-blur-md border border-amber-500/30 rounded-full px-8 py-3 shadow-2xl shadow-amber-500/10 flex items-center gap-4 pointer-events-auto">
                        <span className="text-[10px] font-black text-amber-400/70 uppercase tracking-widest">Gematria</span>
                        <span className="text-3xl font-black text-amber-400 font-mono">{total}</span>
                        <div className="text-xl font-serif text-white/60 font-bold" dir="rtl">{word}</div>
                    </div>
                </div>
            )}

            {/* Calculator card */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-xl relative z-10 hover:border-amber-500/20 transition-all">
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="flex-[1.5] w-full space-y-4">
                        <label className="text-xs font-bold text-[#C5A880] uppercase tracking-widest flex items-center gap-2">
                            <Search size={14} className="text-[#C5A880]" /> Type Hebrew Word
                        </label>
                        <input 
                            type="text" 
                            placeholder="Type any Hebrew word..." 
                            dir="rtl" 
                            className="w-full text-4xl sm:text-5xl md:text-6xl font-serif bg-transparent border-b-2 border-white/10 py-4 outline-none focus:border-[#C5A880] transition-colors text-white placeholder:text-slate-700 text-right" 
                            value={word} 
                            onChange={e => setWord(e.target.value)} 
                        />
                    </div>
                    <div className="hidden md:block w-px h-28 bg-white/10" />
                    <div className="flex-1 w-full text-center md:text-right space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Calculated Sum</label>
                        <div className="text-6xl sm:text-7xl md:text-8xl font-mono text-amber-400 font-black">{total || '0'}</div>
                    </div>
                </div>

                {word.trim() && (
                    <div className="pt-6 border-t border-white/15 mt-6 flex gap-3 flex-wrap">
                        <button
                            onClick={() => handleGematriaExport('pdf')}
                            disabled={isExportingGematria}
                            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500 text-white font-bold text-sm shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                            {isExportingGematria ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                            Export PDF Study Card
                        </button>
                        <button
                            onClick={() => handleGematriaExport('png')}
                            disabled={isExportingGematria}
                            className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                            {isExportingGematria ? <Loader2 size={14} className="animate-spin" /> : <FileImage size={14} />}
                            Save Image
                        </button>
                    </div>
                )}
            </div>

            {/* Letter breakdown */}
            {letterBreakdown.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 shadow-lg relative z-10">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Letter Breakdown</h3>
                    <div className="flex flex-wrap gap-2.5 items-center">
                        {letterBreakdown.map((item, i) => (
                            <React.Fragment key={i}>
                                <div className="flex flex-col items-center gap-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 min-w-[58px] shadow-sm">
                                    <span className="text-2xl font-serif text-white">{item.char}</span>
                                    <span className="text-xs font-bold text-amber-400 font-mono">{item.value}</span>
                                </div>
                                {i < letterBreakdown.length - 1 && (
                                    <span className="text-white/20 text-lg font-light">＋</span>
                                )}
                            </React.Fragment>
                        ))}
                        <span className="text-white/20 text-lg font-light mx-1">＝</span>
                        <div className="flex flex-col items-center justify-center gap-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl px-5 py-3 min-w-[62px] shadow-lg">
                            <span className="text-[9px] font-black uppercase text-brand-950 tracking-widest">Total</span>
                            <span className="text-2xl font-black text-brand-950 font-mono">{total}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Alphabet reference */}
            <div className="space-y-6 relative z-10 pt-4">
                <h3 className="text-lg font-serif font-bold text-[#C5A880] text-center">Alphabet Values Reference</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2.5 justify-center">
                    {ALPHABET_REF.map(item => (
                        <button 
                            key={item.letter} 
                            onClick={() => setWord(w => w + item.letter)} 
                            className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-sm flex flex-col items-center gap-1 text-center hover:bg-white/10 hover:scale-105 hover:border-[#C5A880]/30 transition-all cursor-pointer" 
                            title={`Add ${item.name}`}
                        >
                            <span className="text-3xl font-serif text-white">{item.letter}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{item.name}</span>
                            <span className="text-xs font-bold text-amber-400 font-mono mt-0.5">{item.value}</span>
                        </button>
                    ))}
                </div>
                <p className="text-center text-xs text-slate-400">👆 Click a letter to build your Hebrew word</p>
            </div>

            {/* Hidden/offscreen premium render card for capture */}
            {word.trim() && (
                <div
                    ref={gematriaExportRef}
                    style={{ position: 'fixed', left: '-9999px', top: 0, width: '800px', pointerEvents: 'none', zIndex: -1 }}
                >
                    <div style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1450 50%, #0f0c29 100%)', padding: '48px', fontFamily: 'Georgia, serif', color: '#ffffff', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px', borderRadius: '24px' }} />
                        
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <img src="/logo.png" alt="COT Logo" style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', padding: '6px' }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '0.06em', color: '#f0c040', textTransform: 'uppercase' }}>City of Truth Ministries</div>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '3px' }}>வால்பாறை (Valparai) &bull; Tamil Nadu &bull; India</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '3px' }}>Hebrew Gematria Study</div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>Numerical Calculator</div>
                            </div>
                        </div>

                        {/* Word Hero */}
                        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>Hebrew Word</div>
                            <div style={{ fontSize: '84px', fontWeight: 900, color: '#f0c040', letterSpacing: '0.08em', lineHeight: 1.1, direction: 'rtl', marginBottom: '16px' }}>{word}</div>
                        </div>

                        {/* Gematria Sum Badge */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                            <div style={{ background: 'rgba(240,192,64,0.15)', border: '1px solid rgba(240,192,64,0.3)', borderRadius: '40px', padding: '10px 32px', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <span style={{ fontSize: '9px', fontWeight: 900, color: '#f0c040', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Gematria Value</span>
                                <span style={{ fontSize: '36px', fontWeight: 900, color: '#f0c040' }}>{total}</span>
                            </div>
                        </div>

                        {/* Letter breakdown grid */}
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '18px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ fontSize: '11px', fontWeight: 900, color: '#93c5fd', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '14px', textAlign: 'center' }}>Letter-by-Letter Breakdown</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
                                {letterBreakdown.map((item, idx) => (
                                    <React.Fragment key={idx}>
                                        <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '12px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                                            <span style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff', fontFamily: 'serif' }}>{item.char}</span>
                                            <span style={{ fontSize: '12px', color: '#f0c040', fontWeight: 'bold', marginTop: '4px' }}>{item.value}</span>
                                        </div>
                                        {idx < letterBreakdown.length - 1 && (
                                            <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.3)' }}>+</span>
                                        )}
                                    </React.Fragment>
                                ))}
                                <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.3)' }}>=</span>
                                <div style={{ background: 'rgba(240,192,64,0.2)', border: '1px solid rgba(240,192,64,0.4)', borderRadius: '14px', padding: '12px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                                    <span style={{ fontSize: '10px', color: '#f0c040', fontWeight: 'bold', textTransform: 'uppercase' }}>Sum</span>
                                    <span style={{ fontSize: '26px', fontWeight: 900, color: '#f0c040', marginTop: '4px' }}>{total}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
                            City of Truth Ministries &bull; வால்பாறை (Valparai), Tamil Nadu, India &bull; https://city-of-truth-ministries.vercel.app/ &bull; YouTube: City of Truth Ministries
                        </div>
                    </div>
                </div>
            )}
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

const AUDIO_SYLLABLE_PHONEMES: Record<string, string> = {
    sha: 'SH', she: 'SH', shi: 'SH', sho: 'SH', shu: 'SH',
    ha: 'H', he: 'H', hi: 'H', ho: 'H', hu: 'H',
    va: 'V', ve: 'V', vi: 'V', vo: 'V', vu: 'V',
    la: 'L', le: 'L', li: 'L', lo: 'L', lu: 'L',
    ra: 'R', re: 'R', ri: 'R', ro: 'R', ru: 'R',
    ma: 'P', me: 'P', mi: 'P', mo: 'P', mu: 'P',
    na: 'N', ne: 'N', ni: 'N', no: 'N', nu: 'N',
    pa: 'P', pe: 'P', pi: 'P', po: 'P', pu: 'P',
    ba: 'P', be: 'P', bi: 'P', bo: 'P', bu: 'P',
    ta: 'TH', te: 'TH', ti: 'TH', to: 'TH', tu: 'TH',
    sa: 'S', se: 'S', si: 'S', so: 'S', su: 'S',
    a: 'AH', ah: 'AH', e: 'EE', ee: 'EE', i: 'EE', o: 'OO', oo: 'OO', u: 'OO',
};

const buildAudioMouthSequence = (breakdown?: string): PhonemeStep[] => {
    const syllables = (breakdown || '').toLowerCase().split(/[-·\s]+/).filter(Boolean);
    const steps = syllables.map((syllable) => {
        const clean = syllable.trim();
        const phoneme = AUDIO_SYLLABLE_PHONEMES[clean]
            || (clean.startsWith('sh') ? 'SH'
                : clean.startsWith('ch') || clean.endsWith('kh') ? 'K'
                    : clean.startsWith('ts') ? 'TS'
                        : clean.startsWith('th') ? 'TH'
                            : clean.endsWith('a') || clean.endsWith('ah') ? 'AH'
                                : clean.endsWith('i') || clean.endsWith('ee') ? 'EE'
                                    : clean.endsWith('u') || clean.endsWith('oo') ? 'OO'
                                        : 'AH');
        return { phoneme, duration: 360, syllable: clean };
    });
    return steps.length ? steps : [{ phoneme: 'AH', duration: 500, syllable: 'speak' }];
};

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
    const [isBuilderDragOver, setIsBuilderDragOver] = useState(false);
    const [builderSticky, setBuilderSticky] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [aiResult, setAiResult] = useState<any | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);
    const nextKey = React.useRef(0);
    const aiResultRef = useRef<HTMLDivElement>(null);

    const combinedWord = selectedLetters.map(l => l.letter).join('');
    const isBuilderStickyActive = builderSticky && !aiResult && !aiError && !isAnalyzing;

    const addLetter = (item: (typeof HEBREW_AUDIO_LETTERS)[number]) => {
        const entry = { ...item, key: nextKey.current++ };
        // Append so that in RTL layout the newest letter appears on the left
        setSelectedLetters(prev => [...prev, entry]);
        // Reset any previous AI result when the word changes
        setAiResult(null);
        setAiError(null);
        setBuilderSticky(true);
    };

    const removeLetterByKey = (key: number) => {
        setSelectedLetters(prev => prev.filter((item) => item.key !== key));
        setAiResult(null);
        setAiError(null);
        setBuilderSticky(true);
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
        setBuilderSticky(false);
        setIsAnalyzing(true);
        setAiError(null);
        try {
            const result = await analyzeHebrewWord(combinedWord);
            setAiResult({ ...result, word: combinedWord });
        } catch (err) {
            setAiError('Could not connect to the Word Analysis service. Please try again.');
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSourceLetterDragStart = (e: React.DragEvent, item: (typeof HEBREW_AUDIO_LETTERS)[number]) => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('application/json', JSON.stringify({ type: 'cot-hebrew-letter', payload: item }));
    };

    const handleBuilderDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setIsBuilderDragOver(prev => !prev ? true : prev);
    };

    const handleBuilderDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsBuilderDragOver(false);
        const payload = e.dataTransfer.getData('application/json');
        if (!payload) return;
        try {
            const parsed = JSON.parse(payload) as { type?: string; payload?: { letter: string; name: string; hebrewName: string } };
            if (parsed?.type === 'cot-hebrew-letter' && parsed?.payload?.letter && parsed?.payload?.name && parsed?.payload?.hebrewName) {
                addLetter(parsed.payload as any);
            }
        } catch (error) {
            console.warn('Invalid Hebrew letter drop payload format:', error);
        }
    };

    // NOTE: intentionally not auto-scrolling to AI result — user keeps control of scroll position

    const handleExportInsight = async (format: 'pdf' | 'jpeg') => {
        if (!aiResultRef.current || !combinedWord) return;
        setIsExporting(true);
        try {
            const dataUrl = await captureNodeToJpeg(aiResultRef.current, { backgroundColor: '#020617' });
            const safeWord = combinedWord.replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '') || 'Hebrew-Word';
            const filename = `COT-Hebrew-Insight-${safeWord}`;
            if (format === 'jpeg') {
                const link = document.createElement('a');
                link.download = `${filename}.jpg`;
                link.href = dataUrl;
                link.click();
            } else {
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                const pdfW = pdf.internal.pageSize.getWidth();
                const pageH = pdf.internal.pageSize.getHeight();
                const img = new Image();
                img.src = dataUrl;
                await new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = () => reject(new Error('Failed to load insight image for PDF export'));
                });

                // Reserve space for copyright footer
                const footerH = 18;
                const maxImgH = pageH - footerH;
                const rawPdfH = (img.height * pdfW) / img.width;
                const pdfH = Math.min(rawPdfH, maxImgH);

                // Dark background for entire page
                pdf.setFillColor(2, 6, 23); // slate-950
                pdf.rect(0, 0, pdfW, pageH, 'F');

                // Card image centered vertically in top area
                const imgY = (maxImgH - pdfH) / 2;
                pdf.addImage(dataUrl, 'JPEG', 0, imgY, pdfW, pdfH);

                // Copyright footer
                const footerY = pageH - footerH;
                pdf.setFillColor(15, 23, 42); // slate-900
                pdf.rect(0, footerY, pdfW, footerH, 'F');

                // Gold divider line
                pdf.setDrawColor(217, 119, 6);
                pdf.setLineWidth(0.4);
                pdf.line(10, footerY + 0.5, pdfW - 10, footerY + 0.5);

                // Website name
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(8);
                pdf.setTextColor(251, 191, 36); // amber-400
                pdf.text('CITY OF TRUTH MINISTRIES', pdfW / 2, footerY + 6, { align: 'center' });

                // Copyright line
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(6.5);
                pdf.setTextColor(148, 163, 184); // slate-400
                pdf.text(`© ${new Date().getFullYear()} City of Truth Ministries. All rights reserved.`, pdfW / 2, footerY + 11, { align: 'center' });

                // Website URL
                pdf.setFontSize(6);
                pdf.setTextColor(100, 116, 139); // slate-500
                pdf.text('www.cityoftruthministries.com', pdfW / 2, footerY + 15.5, { align: 'center' });

                pdf.save(`${filename}.pdf`);
            }
        } catch (error) {
            console.error('Insight export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const downloadInsightPdf = () => handleExportInsight('pdf');
    const downloadInsightImage = () => handleExportInsight('jpeg');

    return (
        <div className="space-y-8 py-8">
            <div className="text-center space-y-3">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-950">Hebrew <span className="text-accent-600">Letters Audio Lab</span></h2>
                <p className="text-slate-500 text-sm max-w-3xl mx-auto">
                    Tap any letter to add it to your word. Drag letters to reorder. Tap ✕ to remove. Drag from the grid to the builder.
                </p>
            </div>

            {/* ── WORD BUILDER (Always visible full-width at top, static on mobile, sticky on desktop alone) ── */}
            <div className={`bg-white border border-slate-200 shadow-md p-1 rounded-[2rem] z-20 ${isBuilderStickyActive ? 'sticky top-[5rem]' : ''}`}>
                <div className="bg-white rounded-[2rem] p-4 md:p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3 mb-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Word Builder — {selectedLetters.length} letter{selectedLetters.length !== 1 ? 's' : ''} (unlimited)</p>
                                <button
                                    onClick={() => setBuilderSticky((v) => !v)}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-colors ${isBuilderStickyActive ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                                >
                                    {isBuilderStickyActive ? 'Sticky On' : 'Sticky Off'}
                                </button>
                            </div>
                            {selectedLetters.length === 0 ? (
                                <div
                                    onDragOver={handleBuilderDragOver}
                                    onDrop={handleBuilderDrop}
                                    onDragLeave={() => setIsBuilderDragOver(false)}
                                    className={`text-sm italic rounded-2xl border-2 border-dashed p-4 transition-colors ${isBuilderDragOver ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-300'}`}
                                >
                                    Drag and drop letters here, or tap + Add below.
                                </div>
                            ) : (
                                <div
                                    className={`overflow-x-auto no-scrollbar pb-1 pr-1 rounded-xl transition-colors ${isBuilderDragOver ? 'bg-brand-50/70' : ''}`}
                                    dir="ltr"
                                    onDragOver={handleBuilderDragOver}
                                    onDrop={handleBuilderDrop}
                                    onDragLeave={() => setIsBuilderDragOver(false)}
                                >
                                    <Reorder.Group
                                        axis="x"
                                        values={selectedLetters}
                                        onReorder={(next) => {
                                            setSelectedLetters(next);
                                            setAiResult(null);
                                            setAiError(null);
                                            setBuilderSticky(true);
                                        }}
                                        className={`flex flex-wrap items-center gap-2 ${isBuilderDragOver ? 'py-1' : ''}`}
                                    >
                                        {selectedLetters.map((l) => (
                                            <Reorder.Item
                                                key={l.key}
                                                value={l}
                                                whileDrag={{ scale: 1.03, boxShadow: '0 10px 30px rgba(15,23,42,0.15)' }}
                                                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:border-brand-300 cursor-grab active:cursor-grabbing select-none transition-colors duration-200 touch-pan-x"
                                            >
                                                <span className="text-2xl font-serif text-brand-950 leading-none">{l.letter}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">{l.name}</span>
                                                <button
                                                    onClick={() => removeLetterByKey(l.key)}
                                                    className="w-5 h-5 rounded-full bg-slate-200 hover:bg-red-100 hover:text-red-500 text-slate-400 flex items-center justify-center transition-colors text-[10px] font-black ml-1"
                                                    title={`Remove ${l.name}`}
                                                >
                                                    ✕
                                                </button>
                                            </Reorder.Item>
                                        ))}
                                    </Reorder.Group>
                                </div>
                            )}
                            {selectedLetters.length > 0 && (
                                <div className="text-3xl md:text-4xl font-serif text-brand-950 mt-2 max-h-12 max-w-full overflow-x-auto overflow-y-hidden no-scrollbar leading-tight whitespace-nowrap" dir="rtl">{combinedWord}</div>
                            )}
                        </div>
                        <div className="flex gap-2 shrink-0 flex-wrap">
                            <button
                                onClick={playCombined}
                                disabled={!combinedWord}
                                className="px-5 py-2.5 rounded-full bg-brand-950 text-white font-bold text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-900 transition-colors cursor-pointer"
                            >
                                <Volume2 size={15} /> Play Word
                            </button>
                            {selectedLetters.length > 0 && !aiResult && (
                                <button
                                    onClick={handleDeepAnalysis}
                                    disabled={isAnalyzing}
                                    className="px-5 py-2.5 rounded-full bg-accent-500 text-brand-950 font-bold text-sm flex items-center gap-2 disabled:opacity-50 hover:bg-accent-400 transition-colors shadow-lg cursor-pointer"
                                >
                                    {isAnalyzing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                                    {isAnalyzing ? 'Analyzing…' : 'Word Analysis'}
                                </button>
                            )}
                            {selectedLetters.length > 0 && (
                                <button
                                    onClick={() => { setSelectedLetters([]); setAiResult(null); setAiError(null); setBuilderSticky(true); }}
                                    className="px-4 py-2.5 rounded-full border border-slate-200 text-slate-500 font-bold text-sm hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors cursor-pointer"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── AI ANALYSIS POSITIONED BETWEEN BUILDER AND LETTERS ── */}
            {(aiResult || aiError) && (
                <div className="space-y-6 mt-6 mb-6">
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
                                ref={aiResultRef}
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
                                        <div className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em]">AI Word Analysis</div>
                                        <div className="text-2xl font-black flex items-center gap-2 text-white flex-wrap">
                                            <span>{aiResult.pronunciation}</span>
                                            <button onClick={playCombined} className="shrink-0 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-accent-400 cursor-pointer">
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

                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300/80">
                                        <Volume2 size={13} />
                                        Mouth Pronunciation
                                    </div>
                                    <div className="flex justify-center">
                                        <MouthPronunciationAnimator
                                            phonemeSequence={buildAudioMouthSequence(aiResult.breakdownEn || aiResult.pronunciation)}
                                            isPlaying={false}
                                            animationState="idle"
                                            className="transform scale-110"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Meaning (EN)</p>
                                        <p className="text-base text-slate-100 font-medium leading-relaxed">{aiResult.meaningEn}</p>
                                    </div>
                                    {aiResult.meaningTa && (
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Meaning (TA)</p>
                                            <p className="text-base text-slate-100 font-medium leading-relaxed">{aiResult.meaningTa}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 mt-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-400 flex items-center gap-2">
                                        <Flame size={12} /> Deep Spiritual Insight
                                    </p>
                                    <p className="text-sm text-slate-300 leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/10 italic font-medium">
                                        "{aiResult.insight}"
                                    </p>
                                </div>

                                <div className="pt-2 flex flex-wrap gap-2 justify-end">
                                    <button
                                        onClick={downloadInsightPdf}
                                        disabled={isExporting}
                                        className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 disabled:opacity-50 transition-colors cursor-pointer"
                                    >
                                        {isExporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                                        PDF Guide
                                    </button>
                                    <button
                                        onClick={downloadInsightImage}
                                        disabled={isExporting}
                                        className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 disabled:opacity-50 transition-colors cursor-pointer"
                                    >
                                        {isExporting ? <Loader2 size={13} className="animate-spin" /> : <FileImage size={13} />}
                                        Save Image
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* ── LOWER GRID (Compact Hebrew Letters grid) ── */}
            <div className="grid gap-6 mt-6">
                {/* ── COMPACT HEBREW LETTERS GRID ("Short Below") ── */}
                <div className="bg-slate-950 rounded-[2.5rem] border border-white/10 p-5 sm:p-8 shadow-xl">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 text-center">Tap a letter to add it — or drag it to the builder above</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                        {HEBREW_AUDIO_LETTERS.map((item, index) => (
                            <div
                                key={item.letter}
                                draggable
                                onDragStart={(e) => handleSourceLetterDragStart(e, item)}
                                className={`rounded-2xl bg-gradient-to-br ${RAINBOW_GRADIENTS[index % RAINBOW_GRADIENTS.length]} p-[1.5px] hover:scale-105 active:scale-95 transition-transform duration-200 shadow-sm cursor-grab active:cursor-grabbing select-none`}
                                title={`Drag or tap to add ${item.name}`}
                            >
                                <div
                                    className="bg-slate-900 rounded-2xl p-2.5 flex flex-col items-center justify-between text-center h-full min-h-[120px]"
                                >
                                    <div className="flex flex-col items-center gap-0.5 pointer-events-none">
                                        <span className="text-3xl font-serif text-white font-bold leading-none">{item.letter}</span>
                                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 leading-none">{item.name}</span>
                                        <span className="text-[8px] font-bold text-slate-500 font-serif" dir="rtl">{item.hebrewName}</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-2 w-full justify-center">
                                        <button
                                            onClick={() => addLetter(item)}
                                            className="flex-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-sm cursor-pointer"
                                            title={`Add ${item.name}`}
                                        >
                                            + Add
                                        </button>
                                        <button
                                            onClick={() => playLetter(item.letter, item.hebrewName)}
                                            className="w-6 h-6 rounded-full bg-white/5 text-brand-400 hover:bg-brand-900 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                                            title={`Play ${item.hebrewName}`}
                                        >
                                            <Volume2 size={10} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── AI ANALYSIS & ERRORS COLUMN ── */}
                {(aiResult || aiError) && (
                <div className="space-y-6">
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
                                ref={aiResultRef}
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
                                        <div className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em]">AI Word Analysis</div>
                                        <div className="text-2xl font-black flex items-center gap-2 text-white flex-wrap">
                                            <span>{aiResult.pronunciation}</span>
                                            <button onClick={playCombined} className="shrink-0 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-accent-400 cursor-pointer">
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

                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300/80">
                                        <Volume2 size={13} />
                                        Mouth Pronunciation
                                    </div>
                                    <div className="flex justify-center">
                                        <MouthPronunciationAnimator
                                            phonemeSequence={buildAudioMouthSequence(aiResult.breakdownEn || aiResult.pronunciation)}
                                            wordText={aiResult.word || combinedWord}
                                            phonetic={aiResult.pronunciation}
                                            tamilPhonetic={aiResult.pronunciationTa}
                                            lang="he"
                                            theme="blue"
                                            autoPlay={false}
                                            showControls={true}
                                            size={170}
                                        />
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

                                {/* Re-analyze / Export actions */}
                                <div className="pt-2 flex flex-wrap gap-2">
                                    <button
                                        onClick={handleDeepAnalysis}
                                        disabled={isAnalyzing}
                                        className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 disabled:opacity-50 transition-colors cursor-pointer"
                                    >
                                        {isAnalyzing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                                        Re-analyze
                                    </button>
                                    <button
                                        onClick={() => handleExportInsight('pdf')}
                                        disabled={isExporting}
                                        className="px-4 py-2 rounded-full bg-accent-500 text-brand-950 hover:bg-accent-400 font-bold text-xs flex items-center gap-2 disabled:opacity-50 transition-colors cursor-pointer"
                                    >
                                        {isExporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                                        Download PDF
                                    </button>
                                    <button
                                        onClick={() => handleExportInsight('jpeg')}
                                        disabled={isExporting}
                                        className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 disabled:opacity-50 transition-colors cursor-pointer"
                                    >
                                        {isExporting ? <Loader2 size={13} className="animate-spin" /> : <FileImage size={13} />}
                                        Save Image
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                )}
            </div>
        </div>
    );
};

interface HebrewResourcesProps {
    initialTab?: 'numbers' | 'calendar' | 'clock' | 'festivals' | 'reference' | 'words' | 'gematria' | 'lettersaudio' | 'grammar' | 'israel';
    mode?: 'all' | 'content' | 'tools';
    currentUser?: User;
    currentView?: ViewState;
    setView?: (view: ViewState) => void;
}

type HebrewResourceTab = 'numbers' | 'calendar' | 'clock' | 'festivals' | 'reference' | 'words' | 'gematria' | 'lettersaudio' | 'grammar' | 'israel';

const getHebrewTabIcon = (iconName: string): React.ReactNode => {
    switch (iconName) {
        case 'israel': return <Globe size={16} />;
        case 'festivals': return <Flame size={16} />;
        case 'calendar': return <CalendarIcon size={16} />;
        case 'clock': return <Clock size={16} />;
        case 'reference': return <BookOpen size={16} />;
        case 'grammar': return <BookOpen size={16} />;
        case 'words': return <Type size={16} />;
        case 'lettersaudio': return <Volume2 size={16} />;
        case 'numbers': return <Hash size={16} />;
        case 'gematria': return <Calculator size={16} />;
        default: return <BookOpen size={16} />;
    }
};

// Filter out standalone pages (e.g. alphabet) for internal tab rendering
const tabbedPages = HEBREW_PAGES.filter(p => !p.isStandalone);

const HEBREW_RESOURCE_TABS: ReadonlyArray<{ id: HebrewResourceTab; label: string; icon: React.ReactNode }> = tabbedPages.map(p => ({
    id: p.id as HebrewResourceTab,
    label: p.label,
    icon: getHebrewTabIcon(p.iconName)
}));

const CONTENT_TAB_IDS: HebrewResourceTab[] = tabbedPages.filter(p => p.type === 'content').map(p => p.id as HebrewResourceTab);
const TOOLS_TAB_IDS: HebrewResourceTab[] = tabbedPages.filter(p => p.type === 'tools').map(p => p.id as HebrewResourceTab);

const viewToTabMap: Record<string, HebrewResourceTab> = {};
tabbedPages.forEach(p => {
    viewToTabMap[p.view] = p.id as HebrewResourceTab;
});
viewToTabMap[ViewState.ABOUT] = 'israel';
viewToTabMap[ViewState.HEBREW_TOOLS] = 'words';

const tabToViewMap: Record<HebrewResourceTab, ViewState> = {} as any;
tabbedPages.forEach(p => {
    tabToViewMap[p.id as HebrewResourceTab] = p.view;
});

export const HebrewResources: React.FC<HebrewResourcesProps> = ({ initialTab, mode = 'all', currentUser, currentView, setView }) => {
    const availableTabs = HEBREW_RESOURCE_TABS.filter(tabItem => {
        if (mode === 'content') return CONTENT_TAB_IDS.includes(tabItem.id);
        if (mode === 'tools') return TOOLS_TAB_IDS.includes(tabItem.id);
        return true;
    });

    const defaultTab = initialTab && availableTabs.some(t => t.id === initialTab)
        ? initialTab
        : (availableTabs[0]?.id || 'calendar');

    const [localTab, setLocalTab] = useState<HebrewResourceTab>(defaultTab);
    const tab = (currentView && viewToTabMap[currentView]) || localTab;

    const setTab = (newTab: HebrewResourceTab) => {
        if (setView && tabToViewMap[newTab]) {
            setView(tabToViewMap[newTab]);
        } else {
            setLocalTab(newTab);
        }
    };

    const [tabNavVisible, setTabNavVisible] = useState(true);
    useEffect(() => {
        let lastY = window.scrollY;
        const onScroll = () => {
            const current = window.scrollY;
            if (current <= 12) {
                setTabNavVisible(true);
            } else if (current > lastY + 6 && current > 110) {
                setTabNavVisible(false);
            } else if (current < lastY - 6) {
                setTabNavVisible(true);
            } else {
                return;
            }
            lastY = Math.max(0, current);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="min-h-screen pt-24 md:pt-32 pb-32 md:pb-20 w-full px-3 md:px-6 font-sans bg-[#fffdf6]">
            <div className={`mx-auto flex flex-col items-center ${tab === 'calendar' ? 'max-w-5xl' : 'max-w-7xl'}`}>
                
                {/* Desktop Horizontal navigation menu: Hide on scroll down, show on scroll up */}
                <motion.div 
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: tabNavVisible ? 0 : -140, opacity: tabNavVisible ? 1 : 0 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    className={`hidden md:block sticky top-[76px] z-30 w-full bg-[#fffdf6]/95 backdrop-blur-md py-5 mb-10 border-b border-amber-500/5 shadow-[0_4px_20px_-10px_rgba(217,119,6,0.05)] ${tabNavVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}
                >
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {availableTabs.map((t) => {
                            const isActive = tab === t.id;
                            return (
                                <motion.button
                                    key={t.id}
                                    onClick={() => { setTab(t.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`relative flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest transition-all duration-500 shadow-sm border ${
                                        isActive
                                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-600 text-white shadow-lg shadow-amber-500/25'
                                            : 'bg-white text-slate-400 hover:text-amber-600 hover:border-amber-200 border-slate-200 hover:bg-amber-50/10'
                                    }`}
                                >
                                    {t.icon}
                                    <span>{t.label}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Mobile Bottom navigation menu: Shows on scroll up, hides on scroll down */}
                <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-500/10 shadow-[0_-4px_20px_-10px_rgba(217,119,6,0.1)] transition-all duration-300 ${tabNavVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="flex overflow-x-auto items-center gap-2 px-3 py-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {availableTabs.map((t) => {
                            const isActive = tab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => { setTab(t.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-black text-[9px] uppercase tracking-widest transition-all duration-500 shadow-sm border ${
                                        isActive
                                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-600 text-white shadow-lg shadow-amber-500/25'
                                            : 'bg-white text-slate-400 hover:text-amber-600 hover:border-amber-200 border-slate-200'
                                    }`}
                                >
                                    {t.icon}
                                    <span>{t.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="w-full relative min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            {tab === 'israel' && <IsraelPage />}
                            {tab === 'festivals' && <FestivalsView />}
                            {tab === 'calendar' && <HebrewCalendarView currentUser={currentUser} />}
                            {tab === 'clock' && <HebrewClockView />}
                            {tab === 'words' && <HebrewWordHub />}
                            {tab === 'lettersaudio' && <HebrewLettersAudioLab />}
                            {tab === 'numbers' && <HebrewConverterNumbers />}
                            {tab === 'gematria' && <HebrewGematriaCalc />}
                            {tab === 'reference' && <ReferenceView />}
                            {tab === 'grammar' && <HebrewGrammar3D />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
