import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Calculator, Calendar as CalendarIcon, Clock, Hash, ChevronLeft, ChevronRight, Flame, Sparkles, BookOpen, Heart, Type, Volume2, Loader2, Info, Fingerprint, FileImage, Download, Printer, Globe, Star, Moon, Sun, MapPin, Share2, X, Mic } from 'lucide-react';
import { analyzeHebrewWord } from '../services/openRouterService';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { HebrewYearDropdown } from './HebrewYearDropdown';
import { HebrewConverter } from './HebrewConverter';
import { HebrewWordHub } from './HebrewWordHub';
import { InteractiveMenorah } from './InteractiveMenorah';
import { PrintableHebrewCalendar } from './PrintableHebrewCalendar';
import { PrintableReferenceGuide, HEBREW_MONTHS_DATA, KEY_DETAILS } from './PrintableReferenceGuide';

// Timezone constants - Define early to avoid hoisting issues
const JERUSALEM_TIMEZONE = 'Asia/Jerusalem';
const CHENNAI_TIMEZONE = 'Asia/Kolkata';
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

// --- Calendar Enrichment Data ---

const FAST_DAYS = ['Yom Kippur', "Tisha B'Av", 'Tzom Tammuz', 'Fast of Gedaliah', 'Fast of Esther', 'Fast of Tevet', '17 Tammuz'];
const NEW_MOON_DAYS = ['Rosh Chodesh'];
const FEAST_DAYS = ['Pesach', 'Shavuot', 'Sukkot', 'Rosh Hashanah', 'Simchat Torah', 'Shemini Atzeret', 'Hanukkah', 'Purim', "Tu B'Av", "Tu Bishvat", "Lag B'Omer"];

const TORAH_PORTIONS: Record<number, string> = {
    1: 'Bereishit', 2: 'Noach', 3: 'Lech Lecha', 4: 'Vayeira', 5: 'Chayei Sara',
    6: 'Toldot', 7: 'Vayetzei', 8: 'Vayishlach', 9: 'Vayeishev', 10: 'Miketz',
    11: 'Vayigash', 12: 'Vayechi', 13: 'Shemot', 14: 'Vaeira', 15: 'Bo',
    16: 'Beshalach', 17: 'Yitro', 18: 'Mishpatim', 19: 'Terumah', 20: 'Tetzaveh',
    21: 'Ki Tisa', 22: 'Vayakhel', 23: 'Pekudei', 24: 'Vayikra', 25: 'Tzav',
    26: 'Shemini', 27: 'Tazria', 28: 'Metzora', 29: 'Achrei Mot', 30: 'Kedoshim',
    31: 'Emor', 32: 'Behar', 33: 'Bechukotai', 34: 'Bamidbar', 35: 'Naso',
    36: "Beha'alotcha", 37: "Sh'lach", 38: 'Korach', 39: 'Chukat', 40: 'Balak',
    41: 'Pinchas', 42: 'Matot', 43: 'Masei', 44: 'Devarim', 45: "Va'etchanan",
    46: 'Eikev', 47: "Re'eh", 48: 'Shoftim', 49: 'Ki Teitzei', 50: 'Ki Tavo',
    51: 'Nitzavim', 52: 'Vayelech', 53: 'Haazinu', 54: "V'Zot HaBerachah"
};

const DAILY_PSALMS: Record<number, string> = {
    1: 'Psalm 1', 2: 'Psalm 2', 3: 'Psalm 23', 4: 'Psalm 46', 5: 'Psalm 90',
    6: 'Psalm 91', 7: 'Psalm 100', 8: 'Psalm 121', 9: 'Psalm 130', 10: 'Psalm 145',
    11: 'Psalm 150', 12: 'Psalm 51', 13: 'Psalm 8', 14: 'Psalm 19', 15: 'Psalm 24',
    16: 'Psalm 27', 17: 'Psalm 34', 18: 'Psalm 37', 19: 'Psalm 42', 20: 'Psalm 63',
    21: 'Psalm 103', 22: 'Psalm 119', 23: 'Psalm 133', 24: 'Psalm 136', 25: 'Psalm 139',
    26: 'Psalm 147', 27: 'Psalm 148', 28: 'Psalm 149', 29: 'Psalm 117', 30: 'Psalm 113'
};

const HISTORICAL_NOTES: Record<string, string> = {
    "Tisha B'Av": 'Destruction of both Temples, Expulsion from Spain (1492), many national tragedies.',
    'Pesach': 'Exodus from Egypt; the Passover Seder retells the story of liberation.',
    'Shavuot': 'Giving of the Torah at Mt. Sinai; also Pentecost in Christian tradition.',
    'Rosh Hashanah': 'Birthday of the World (Yom Harat Olam); Books of Life are opened.',
    'Yom Kippur': 'Moses descended with the second tablets; day of national atonement.',
    'Sukkot': 'Remembrance of 40 years in the wilderness; harvest festival.',
    'Hanukkah': 'Maccabean rededication of the Temple; miracle of the oil.',
    'Purim': 'Salvation of Jews in Persia through Queen Esther and Mordecai.',
};

const getDayType = (festivals: string[], isShabbat: boolean, dayOfWeek: number) => {
    if (isShabbat || dayOfWeek === 6) return 'shabbat';
    if (festivals.some(f => FAST_DAYS.some(fd => f.includes(fd)))) return 'fast';
    if (festivals.some(f => f.includes('Rosh Chodesh'))) return 'newmoon';
    if (festivals.some(f => FEAST_DAYS.some(fd => f.includes(fd)))) return 'feast';
    if (festivals.length > 0) return 'festival';
    return 'normal';
};

interface MoonPhaseInfo {
    emoji: string;
    name: string;
    hebrewName: string;
    illumination: number;
    lunarAge: number;
    jerusalemTimeStr: string;
    chennaiTimeStr: string;
    hebrewSignificance: string;
}

const getMoonPhaseInfo = (date: Date): MoonPhaseInfo => {
    const msDay = 86400000;
    const ref = new Date('2000-01-06T18:14:00Z').getTime();
    const diff = (date.getTime() - ref) / msDay;
    const cycle = (diff % 29.53058867 + 29.53058867) % 29.53058867;
    const illumination = Math.round((1 - Math.cos((cycle / 29.53058867) * 2 * Math.PI)) / 2 * 100);

    const jerusalemTimeStr = date.toLocaleTimeString('en-US', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const chennaiTimeStr = date.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let emoji = '🌑';
    let name = 'New Moon';
    let hebrewName = 'מולד הלבנה';
    let significance = 'Sanctification of the New Month (Rosh Chodesh). Biblical Renewal.';

    if (cycle < 1.85) {
        emoji = '🌑';
        name = 'New Moon (Rosh Chodesh)';
        hebrewName = 'מולד הלבנה';
        significance = 'Beginning of the Hebrew Month. Sanctification of the Crescent.';
    } else if (cycle < 7.38) {
        emoji = '🌒';
        name = 'Waxing Crescent';
        hebrewName = 'לבנה מתחדשת';
        significance = 'First light after New Moon; building momentum into the month.';
    } else if (cycle < 9.22) {
        emoji = '🌓';
        name = 'First Quarter';
        hebrewName = 'חצי לבנה ראשון';
        significance = 'Half moon illuminated; mid-waxing phase.';
    } else if (cycle < 14.77) {
        emoji = '🌔';
        name = 'Waxing Gibbous';
        hebrewName = 'לבנה כמעט מלאה';
        significance = 'Approaching peak illumination; biblical festival preparations.';
    } else if (cycle < 16.61) {
        emoji = '🌕';
        name = 'Full Moon (Milui HaLevana)';
        hebrewName = 'מילוא הלבנה';
        significance = 'Peak Lunar Illumination. Associated with Passover (15 Nisan) & Sukkot (15 Tishrei).';
    } else if (cycle < 22.15) {
        emoji = '🌖';
        name = 'Waning Gibbous';
        hebrewName = 'לבנה מתמעטת';
        significance = 'Lunar harvest reflection phase following peak festivals.';
    } else if (cycle < 23.99) {
        emoji = '🌗';
        name = 'Last Quarter';
        hebrewName = 'חצי לבנה אחרון';
        significance = 'Third quarter phase leading into quiet reflection.';
    } else {
        emoji = '🌘';
        name = 'Waning Crescent';
        hebrewName = 'חרמש לבנה אחרון';
        significance = 'Final silver sliver before the next Rosh Chodesh.';
    }

    return {
        emoji,
        name,
        hebrewName,
        illumination,
        lunarAge: Number(cycle.toFixed(1)),
        jerusalemTimeStr,
        chennaiTimeStr,
        hebrewSignificance: significance
    };
};

const getMoonPhase = (date: Date) => getMoonPhaseInfo(date);

const getDaysUntilShabbat = (today: Date): number => {
    const dow = today.getDay(); // 0=Sun
    if (dow === 5) return 0;
    if (dow === 6) return 6;
    return 6 - dow;
};

const CALENDAR_LEGEND = [
    { label: 'Feast Day', color: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50' },
    { label: 'New Moon', color: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50' },
    { label: 'Fast Day', color: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-200', bg: 'bg-orange-50' },
    { label: 'Shabbat', color: 'bg-violet-500', text: 'text-violet-700', border: 'border-violet-200', bg: 'bg-violet-50' },
    { label: 'Today', color: 'bg-amber-400', text: 'text-amber-700', border: 'border-amber-200', bg: 'bg-amber-50' },
];

export interface AllMoonPhaseDetail {
    id: string;
    name: string;
    hebrewName: string;
    transliteration: string;
    tamilName: string;
    tamilMeaning: string;
    emoji: string;
    lunarAge: string;
    illumination: string;
    hebrewCalendarDay: string;
    biblicalSignificance: string;
    scriptureRef?: string;
    bgGradient: string;
    badgeColor: string;
}

export const ALL_MOON_PHASES: AllMoonPhaseDetail[] = [
    {
        id: 'new-moon',
        name: 'New Moon',
        hebrewName: 'מֹלַד הַלְּבָנָה',
        transliteration: 'Molad HaLevana',
        tamilName: 'அமாவாசை / புதிய நிலவு',
        tamilMeaning: 'ரோஷ் ஹோதேஷ் - புதிய எபிரேய மாதத்தின் தொடக்கம் மற்றும் பிரதிஷ்டை நாள். பழைய மாதம் முடிந்து புதிய மாதம் உதயமாகும் பரிசுத்த நாள்.',
        emoji: '🌑',
        lunarAge: '0 – 1.85 Days',
        illumination: '0% – 2%',
        hebrewCalendarDay: 'Day 1 (Rosh Chodesh)',
        biblicalSignificance: 'Marks Rosh Chodesh (Head of the Month). Blowing of the Shofar, special offerings (Numbers 10:10, Psalm 81:3), and spiritual renewal for the new biblical month.',
        scriptureRef: 'Numbers 10:10 • Psalm 81:3',
        bgGradient: 'from-slate-900 via-indigo-950 to-slate-950',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30'
    },
    {
        id: 'waxing-crescent',
        name: 'Waxing Crescent',
        hebrewName: 'לְבָנָה מִתְחַדֶּשֶׁת',
        transliteration: 'Levana Mitkhadheshet',
        tamilName: 'வளர்பிறை முதல் பிறை',
        tamilMeaning: 'நிலவு வெளிச்சம் வளரும் பருவம் - ஆன்மீக வளர்ச்சி, புதுப்பித்தல் மற்றும் தேவ ஒளியில் நடத்தல்.',
        emoji: '🌒',
        lunarAge: '1.85 – 7.38 Days',
        illumination: '3% – 49%',
        hebrewCalendarDay: 'Days 2 – 7',
        biblicalSignificance: 'The first sliver of crescent light becomes visible in the evening sky over Jerusalem. Symbolizes spiritual growth, building divine momentum, and walking in increasing light.',
        scriptureRef: 'Proverbs 4:18',
        bgGradient: 'from-slate-900 via-slate-800 to-indigo-950',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30'
    },
    {
        id: 'first-quarter',
        name: 'First Quarter',
        hebrewName: 'חֲצִי לְבָנָה רִאשׁוֹן',
        transliteration: 'Chatzi Levana Rishon',
        tamilName: 'முதல் அரை நிலவு',
        tamilMeaning: 'பாதி நிலவு ஒளிபெறும் பருவம் - பலம், சமநிலை மற்றும் நடுமாத ஆசீர்வாதம்.',
        emoji: '🌓',
        lunarAge: '7.38 – 9.22 Days',
        illumination: '50%',
        hebrewCalendarDay: 'Days 8 – 9',
        biblicalSignificance: 'Exactly half of the lunar disc is illuminated. Represents spiritual equilibrium, steadfast foundation, and mid-month readiness for upcoming high holy feast days.',
        scriptureRef: 'Isaiah 40:29',
        bgGradient: 'from-indigo-950 via-slate-900 to-slate-950',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30'
    },
    {
        id: 'waxing-gibbous',
        name: 'Waxing Gibbous',
        hebrewName: 'לְבָנָה כִּמְעַט מְלֵאָה',
        transliteration: 'Levana Kemat Melea',
        tamilName: 'வளர்பிறை முக்கால் நிலவு',
        tamilMeaning: 'முழு நிலவுக்கு முந்தைய பருவம் - பரிசுத்த பண்டிகைகளுக்கான ஆயத்தம்.',
        emoji: '🌔',
        lunarAge: '9.22 – 14.77 Days',
        illumination: '51% – 99%',
        hebrewCalendarDay: 'Days 10 – 14',
        biblicalSignificance: 'Greater than half illuminated, rapidly building to full strength. Time of final sanctification and preparation before major pilgrimage festivals like Passover and Sukkot.',
        scriptureRef: 'Exodus 12:3–6',
        bgGradient: 'from-slate-900 via-amber-950/40 to-slate-950',
        badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
    },
    {
        id: 'full-moon',
        name: 'Full Moon',
        hebrewName: 'מִלּוּא הַלְּבָנָה',
        transliteration: 'Milui HaLevana',
        tamilName: 'பௌர்ணமி / முழு நிலவு',
        tamilMeaning: 'மிலுய் ஹலெவனா - பூரண ஒளி, பஸ்கா (15 நிசான்) மற்றும் கூடாரப் பண்டிகை (15 திஷ்ரே) பெருவிழா நாள்.',
        emoji: '🌕',
        lunarAge: '14.77 – 16.61 Days',
        illumination: '100%',
        hebrewCalendarDay: 'Day 15 (Mid-Month)',
        biblicalSignificance: 'Maximum celestial illumination. Associated directly with key Biblical appointed times: Pesach (Passover, 15 Nisan) & Sukkot (Feast of Tabernacles, 15 Tishrei). Symbolizes divine fullness, redemption, and holy joy.',
        scriptureRef: 'Leviticus 23:5-6 • Leviticus 23:34',
        bgGradient: 'from-amber-950/60 via-slate-900 to-slate-950',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
    },
    {
        id: 'waning-gibbous',
        name: 'Waning Gibbous',
        hebrewName: 'לְבָנָה מִתְמַעֶטֶת',
        transliteration: 'Levana Mitma\'etet',
        tamilName: 'தேய்பிறை முக்கால் நிலவு',
        tamilMeaning: 'அறுவடை மற்றும் தியானப் பருவம் - பண்டிகை ஆசீர்வாதங்களை வாழ்வில் கடைப்பிடித்தல்.',
        emoji: '🌖',
        lunarAge: '16.61 – 22.15 Days',
        illumination: '99% – 51%',
        hebrewCalendarDay: 'Days 16 – 21',
        biblicalSignificance: 'Light begins to gently diminish after the full moon. Represents gratitude, assimilating spiritual revelations received during festival days, and walking out the covenant in daily life.',
        scriptureRef: 'Deuteronomy 16:15',
        bgGradient: 'from-slate-900 via-indigo-950 to-slate-900',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30'
    },
    {
        id: 'last-quarter',
        name: 'Last Quarter',
        hebrewName: 'חֲצִי לְבָנָה אַחֲרוֹן',
        transliteration: 'Chatzi Levana Acharon',
        tamilName: 'கடைசி அரை நிலவு',
        tamilMeaning: 'இரண்டாவது பாதி நிலவு பருவம் - சுயபரிசோதனை, பாவ அறிக்கை மற்றும் ஆன்மீக தூய்மை.',
        emoji: '🌗',
        lunarAge: '22.15 – 23.99 Days',
        illumination: '50%',
        hebrewCalendarDay: 'Days 22 – 23',
        biblicalSignificance: 'The final half moon illuminated on the left. A season of introspection, releasing burdens, spiritual purification, and turning inward as the month nears its close.',
        scriptureRef: 'Psalm 51:10',
        bgGradient: 'from-slate-900 via-slate-950 to-indigo-950',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/30'
    },
    {
        id: 'waning-crescent',
        name: 'Waning Crescent',
        hebrewName: 'חֶרְמֵשׁ לְבָנָה אַחֲרוֹן',
        transliteration: 'Khermesh Levana Acharon',
        tamilName: 'தேய்பிறை இறுதிப் பிறை',
        tamilMeaning: 'கடைசி பிறை ஒளி - அடுத்த புதிய மாதத்திற்கான (ரோஷ் ஹோதேஷ்) ஜெப எதிர்பார்ப்பு.',
        emoji: '🌘',
        lunarAge: '23.99 – 29.53 Days',
        illumination: '49% – 1%',
        hebrewCalendarDay: 'Days 24 – 29/30',
        biblicalSignificance: 'The final delicate silver crescent before complete dark phase. Time of quiet prayer, deep meditation, fasting before Rosh Chodesh, and eager anticipation for the next new moon.',
        scriptureRef: 'Lamentations 3:22–23',
        bgGradient: 'from-slate-950 via-slate-900 to-slate-950',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-400/30'
    }
];

// --- View Components ---

const HebrewCalendarView: React.FC<{ currentUser?: User }> = ({ currentUser }) => {
    const [year, setYear] = useState(5786);
    const [currentMonthIdx, setCurrentMonthIdx] = useState(0);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [calendarScope, setCalendarScope] = useState<'day' | 'week' | 'month' | 'year' | 'decade'>('month');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isGeneratingCurrentMonth, setIsGeneratingCurrentMonth] = useState(false);
    const [calendarRenderMode, setCalendarRenderMode] = useState<{ mode: 'cover' | 'month', monthData?: any } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [now, setNow] = useState(new Date());
    const [selectedMoonPhase, setSelectedMoonPhase] = useState<AllMoonPhaseDetail | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const moonPhase = useMemo(() => getMoonPhase(now), [now]);
    const daysToShabbat = useMemo(() => getDaysUntilShabbat(now), [now]);

    // Jerusalem time (UTC+3)
    const jerusalemOffset = 3 * 60;
    const localOffset = -now.getTimezoneOffset();
    const diff = (jerusalemOffset - localOffset) * 60000;
    const jeruTime = new Date(now.getTime() + diff);
    const jeruH = jeruTime.getUTCHours();
    const jeruM = jeruTime.getUTCMinutes();
    const jeruS = jeruTime.getUTCSeconds();
    const jeruAMPM = jeruH >= 12 ? 'PM' : 'AM';
    const jeruH12 = jeruH % 12 || 12;
    const pad = (n: number) => String(n).padStart(2, '0');
    const jeruTimeStr = `${pad(jeruH12)}:${pad(jeruM)}:${pad(jeruS)}`;

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

    const nextFeast = useMemo(() => {
        for (let m = 0; m < calendarData.length; m++) {
            for (const w of calendarData[m].weeks) {
                for (const d of w) {
                    if (d.day && d.festivals.length > 0 && d.gregorianDate) {
                        return { day: d.day, month: calendarData[m].name, festivals: d.festivals };
                    }
                }
            }
        }
        return null;
    }, [calendarData, now]);

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        const results: { monthIdx: number; day: number; festivals: string[]; monthName: string }[] = [];
        calendarData.forEach((month, mIdx) => {
            month.weeks.flat().forEach(d => {
                if (d.day && d.festivals.some(f => f.toLowerCase().includes(q))) {
                    results.push({ monthIdx: mIdx, day: d.day, festivals: d.festivals, monthName: month.name });
                }
            });
        });
        return results.slice(0, 5);
    }, [searchQuery, calendarData]);

    return (
        <div className="space-y-0 w-full max-w-none mx-auto px-0">
            {/* ═══════════════════════════════════════════════════════
                 HIDDEN PRINT / PDF CAPTURE NODES
            ═══════════════════════════════════════════════════════ */}
            <div id="printable-calendar-resource" className="fixed left-0 top-0 pointer-events-none -z-50" style={{ opacity: 0.01 }}>
                {calendarRenderMode && (
                    <PrintableHebrewCalendar
                        mode={calendarRenderMode.mode}
                        year={year}
                        monthData={calendarRenderMode.monthData}
                        currentUser={currentUser}
                    />
                )}
            </div>
            <div className="fixed left-[-10000px] top-0 pointer-events-none -z-50 opacity-100">
                <PrintableReferenceGuide year={year} />
            </div>

            {/* ═══════════════════════════════════════════════════════
                 HERO SECTION — Jerusalem Royal Blue / Gold
            ═══════════════════════════════════════════════════════ */}
            <div className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] mb-6">
                {/* Deep blue + stars background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0c1445] via-[#1e1b4b] to-[#020617]" />
                <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #D4AF37 0%, transparent 50%), radial-gradient(circle at 80% 20%, #1E3A8A 0%, transparent 50%)' }} />
                {/* Twinkling stars */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(24)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-0.5 h-0.5 bg-white rounded-full"
                            style={{ left: `${(i * 37 + 11) % 100}%`, top: `${(i * 53 + 7) % 100}%` }}
                            animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
                            transition={{ duration: 2 + (i % 4), repeat: Infinity, delay: i * 0.3 }}
                        />
                    ))}
                </div>

                <div className="relative z-10 px-4 md:px-10 pt-8 pb-6 md:py-12">
                    {/* Top Bar: Location + Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5 md:mb-7">
                        <div className="flex items-center gap-2 text-[#D4AF37]/80 text-xs font-bold tracking-widest uppercase">
                            <MapPin size={12} className="text-[#D4AF37]" />
                            <span>Jerusalem Time · הזמן בירושלים</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 text-xs text-white font-bold">
                                <span className="text-base leading-none">{moonPhase.emoji}</span>
                                <span className="text-white/70 hidden sm:inline">{moonPhase.name}</span>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${daysToShabbat === 0
                                    ? 'bg-violet-500/30 border-violet-400/50 text-violet-200'
                                    : 'bg-white/10 border-white/20 text-white/80'
                                }`}>
                                <Star size={10} className="text-[#D4AF37]" />
                                {daysToShabbat === 0 ? 'Shabbat Shalom!' : `${daysToShabbat}d to Shabbat`}
                            </div>
                        </div>
                    </div>

                    {/* Main Hero Content */}
                    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">
                        {/* Left: Date Info */}
                        <div className="text-center lg:text-left flex-1">
                            <p className="text-[#D4AF37]/70 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-2">Today's Hebrew Date</p>
                            <div className="text-3xl md:text-5xl xl:text-6xl font-black text-white leading-tight mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                                {todayKey}
                            </div>
                            <div className="text-[#D4AF37] text-lg md:text-2xl font-bold mb-1">{name} {safeYear}</div>
                            <div className="text-white/60 text-sm font-semibold mb-4">
                                {todayDayName}, {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                            {/* Scripture Verse */}
                            <motion.blockquote
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="border-l-2 border-[#D4AF37]/60 pl-4 max-w-md mx-auto lg:mx-0"
                            >
                                <p className="text-white/70 text-xs md:text-sm italic leading-relaxed">
                                    "Teach us to number our days, that we may gain a heart of wisdom."
                                </p>
                                <cite className="text-[#D4AF37]/80 text-[10px] font-bold tracking-widest not-italic mt-1 block">— Psalm 90:12</cite>
                            </motion.blockquote>
                        </div>

                        {/* Right: Stats Widgets */}
                        <div className="flex flex-wrap lg:flex-col gap-3 justify-center lg:justify-start">
                            {/* Month Meaning */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 min-w-[160px]"
                            >
                                <p className="text-[#D4AF37]/70 text-[9px] font-black uppercase tracking-widest mb-0.5">Month Meaning</p>
                                <p className="text-white text-xs md:text-sm font-bold leading-snug">{MONTH_MEANINGS[name] || `Month of ${name}`}</p>
                                <p className="text-white/50 text-[9px] font-bold mt-0.5">{hebrew}</p>
                            </motion.div>

                            {/* Next Feast */}
                            {nextFeast && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.35 }}
                                    className="bg-emerald-500/20 backdrop-blur-xl border border-emerald-400/30 rounded-2xl px-4 py-3 min-w-[160px]"
                                >
                                    <p className="text-emerald-300/80 text-[9px] font-black uppercase tracking-widest mb-0.5">Next Feast</p>
                                    <p className="text-white text-xs font-bold leading-snug">{nextFeast.festivals[0]}</p>
                                    <p className="text-white/50 text-[9px] font-bold mt-0.5">{nextFeast.day} {nextFeast.month}</p>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════
                 CONTROLS: Year + Month Navigation + Search + Downloads
            ═══════════════════════════════════════════════════════ */}
            <div id="active-calendar-card" className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.07)] border border-slate-100 overflow-hidden font-serif mb-4">

                {/* Top Control Bar */}
                <div className="bg-gradient-to-r from-[#1E3A8A]/5 to-[#D4AF37]/5 border-b border-slate-100 px-4 md:px-8 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* Year Selector */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <HebrewYearDropdown
                                selectedYear={safeYear}
                                onYearChange={(selectedYear) => setYear(selectedYear)}
                            />
                            {/* Scope Selector: Day, Week, Month, Year, Decade */}
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                                {[
                                    { scope: 'day', label: 'Day' },
                                    { scope: 'week', label: 'Week' },
                                    { scope: 'month', label: 'Month' },
                                    { scope: 'year', label: 'Year' },
                                    { scope: 'decade', label: 'Decade' }
                                ].map(({ scope, label }) => (
                                    <button
                                        key={scope}
                                        onClick={() => setCalendarScope(scope as any)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                            calendarScope === scope
                                                ? 'bg-[#1E3A8A] text-white shadow-sm'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Month Nav */}
                        <div className="flex items-center gap-2 md:gap-4">
                            <button
                                onClick={() => setCurrentMonthIdx(prev => Math.max(0, prev - 1))}
                                disabled={currentMonthIdx === 0}
                                className="w-9 h-9 rounded-full flex items-center justify-center bg-[#1E3A8A]/10 hover:bg-[#1E3A8A]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[#1E3A8A] border border-[#1E3A8A]/20"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <div className="text-center min-w-[140px] md:min-w-[200px]">
                                <div className="text-lg md:text-2xl font-black text-[#1E3A8A] leading-tight">{name}</div>
                                <div className="text-[#D4AF37] text-base md:text-lg font-serif">{hebrew}</div>
                                {firstGregorian && lastGregorian && (
                                    <div className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                        {firstGregorianYear === lastGregorianYear
                                            ? `${firstGregorian} – ${lastGregorian}, ${firstGregorianYear}`
                                            : `${firstGregorian}, ${firstGregorianYear} – ${lastGregorian}, ${lastGregorianYear}`}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setCurrentMonthIdx(prev => Math.min(calendarData.length - 1, prev + 1))}
                                disabled={currentMonthIdx === calendarData.length - 1}
                                className="w-9 h-9 rounded-full flex items-center justify-center bg-[#1E3A8A]/10 hover:bg-[#1E3A8A]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[#1E3A8A] border border-[#1E3A8A]/20"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        {/* Today + Search + Download pills */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    for (let m = 0; m < calendarData.length; m++) {
                                        const found = calendarData[m].weeks.flat().find(d => d.day !== null && d.gregorianDate === todayKey);
                                        if (found) { setCurrentMonthIdx(m); setSelectedDay(found.day); break; }
                                    }
                                }}
                                className="px-3 py-1.5 rounded-full bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#1E3A8A] font-black text-[10px] uppercase tracking-widest border border-[#D4AF37]/40 transition-all"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setShowSearch(s => !s)}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all border border-slate-200"
                                title="Search festivals"
                            >
                                <Search size={14} />
                            </button>
                            <button
                                onClick={handleDownloadCurrentMonth}
                                disabled={isGeneratingCurrentMonth}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-100 hover:bg-amber-200 text-amber-700 transition-all border border-amber-200 disabled:opacity-50"
                                title="Download month as PNG"
                            >
                                {isGeneratingCurrentMonth ? <Loader2 size={13} className="animate-spin" /> : <FileImage size={13} />}
                            </button>
                            <button
                                onClick={handleDownloadFullCalendar}
                                disabled={isGeneratingPdf}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1E3A8A]/10 hover:bg-[#1E3A8A]/20 text-[#1E3A8A] transition-all border border-[#1E3A8A]/20 disabled:opacity-50"
                                title="Download full calendar as PDF"
                            >
                                {isGeneratingPdf ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <AnimatePresence>
                        {showSearch && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        autoFocus
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search festivals… (e.g. Pesach, Shabbat, Purim)"
                                        className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A]/50 placeholder:text-slate-300"
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="mt-2 rounded-xl border border-slate-100 bg-white shadow-lg overflow-hidden">
                                        {searchResults.map((r, i) => (
                                            <button
                                                key={i}
                                                onClick={() => { setCurrentMonthIdx(r.monthIdx); setSelectedDay(r.day); setShowSearch(false); setSearchQuery(''); }}
                                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#1E3A8A]/5 transition-colors border-b border-slate-50 last:border-0 text-left"
                                            >
                                                <div>
                                                    <p className="text-xs font-bold text-[#1E3A8A]">{r.festivals.join(', ')}</p>
                                                    <p className="text-[10px] text-slate-400 font-semibold">{r.day} {r.monthName} {safeYear}</p>
                                                </div>
                                                <ChevronRight size={14} className="text-slate-300" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {searchQuery && searchResults.length === 0 && (
                                    <p className="mt-2 text-xs text-slate-400 font-semibold text-center py-2">No festivals found for "{searchQuery}"</p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ═══ COLOR LEGEND ═══ */}
                <div className="px-4 md:px-8 py-3 bg-slate-50/70 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 justify-center md:justify-start">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">Legend:</span>
                        {CALENDAR_LEGEND.map(l => (
                            <div key={l.label} className="flex items-center gap-1.5">
                                <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                                <span className={`text-[10px] font-bold ${l.text}`}>{l.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ═══ CALENDAR GRID / SCOPE VIEWS ═══ */}
                <div className="px-3 md:px-8 py-4 md:py-6">

                    {/* ═══ MOON PHASE & CELESTIAL OBSERVER ═══ */}
                    <div className="mb-6 bg-gradient-to-r from-slate-950 via-[#0B132B] to-slate-950 rounded-2xl md:rounded-3xl p-5 md:p-7 text-white border border-[#D4AF37]/30 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                            {/* Left: Moon Phase Highlight */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-[#D4AF37]/40 flex items-center justify-center text-4xl md:text-5xl shadow-[0_0_20px_rgba(212,175,55,0.2)] shrink-0">
                                    {moonPhase.emoji}
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#D4AF37]">ASTRONOMICAL LUNAR PHASE</span>
                                        <span className="text-[9px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                                            {moonPhase.illumination}% Illuminated
                                        </span>
                                    </div>
                                    <h4 className="text-xl md:text-2xl font-black text-white mt-0.5">{moonPhase.name}</h4>
                                    <p className="text-sm font-serif text-[#D4AF37] font-semibold">{moonPhase.hebrewName}</p>
                                    <p className="text-xs text-slate-300 mt-1 max-w-lg">{moonPhase.hebrewSignificance}</p>
                                </div>
                            </div>

                            {/* Right: Dual Location Observation Readouts (Jerusalem & Chennai) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center sm:text-left">
                                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-400">
                                        <MapPin size={12} /> Jerusalem Observation
                                    </div>
                                    <div className="text-xs font-mono font-bold text-white mt-1">
                                        {moonPhase.jerusalemTimeStr} <span className="text-[9px] text-slate-400">(UTC+3)</span>
                                    </div>
                                    <p className="text-[9px] text-slate-300 font-semibold mt-1">Lunar Age: {moonPhase.lunarAge} Days</p>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center sm:text-left">
                                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-400">
                                        <MapPin size={12} /> Chennai Observation
                                    </div>
                                    <div className="text-xs font-mono font-bold text-white mt-1">
                                        {moonPhase.chennaiTimeStr} <span className="text-[9px] text-slate-400">(UTC+5:30)</span>
                                    </div>
                                    <p className="text-[9px] text-slate-300 font-semibold mt-1">Hebrew Calendar Sync</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SCOPE 1: DAY VIEW */}
                    {calendarScope === 'day' && (
                        <div className="bg-gradient-to-br from-[#0c1445] via-[#1e1b4b] to-[#020617] text-white p-6 md:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-2xl space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-5">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#D4AF37]">DAY VIEW · {name}</span>
                                    <h3 className="text-3xl sm:text-5xl font-black text-white mt-1">Day {selectedDay || 1}</h3>
                                    <p className="text-sm text-slate-300 font-serif">{name} {safeYear} · {hebrew}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedDay(prev => Math.max(1, (prev || 1) - 1))}
                                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all border border-white/10 cursor-pointer"
                                    >
                                        ← Prev Day
                                    </button>
                                    <button
                                        onClick={() => setSelectedDay(prev => Math.min(30, (prev || 1) + 1))}
                                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all border border-white/10 cursor-pointer"
                                    >
                                        Next Day →
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Jerusalem Time Sync</div>
                                    <div className="text-2xl font-mono font-bold text-white">{jeruTimeStr} {jeruAMPM}</div>
                                    <p className="text-xs text-slate-400">Synced to Israel (UTC+3)</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">Moon Phase & Cycle</div>
                                    <div className="text-xl font-bold text-white">{moonPhase.name} {moonPhase.emoji}</div>
                                    <p className="text-xs text-slate-400">Days to Shabbat: {daysToShabbat} days</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Daily Psalm Reading</div>
                                    <div className="text-xl font-bold text-white">{DAILY_PSALMS[(selectedDay || 1) % 30 || 30]}</div>
                                    <p className="text-xs text-slate-400">Spiritual Meditation</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SCOPE 2: WEEK VIEW */}
                    {calendarScope === 'week' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <h4 className="text-sm font-black uppercase tracking-widest text-[#1E3A8A]">7-Day Week Overview — {name}</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Shabbat'].map((dayName, idx) => {
                                    const dayNumber = ((selectedDay || 1) + idx) % 30 || 1;
                                    return (
                                        <div
                                            key={dayName}
                                            onClick={() => setSelectedDay(dayNumber)}
                                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                                idx === 6
                                                    ? 'bg-violet-950 text-white border-violet-500 shadow-lg'
                                                    : 'bg-white border-slate-200 hover:border-[#1E3A8A]'
                                            }`}
                                        >
                                            <div className="text-[10px] font-black uppercase tracking-widest text-amber-500">{dayName}</div>
                                            <div className="text-3xl font-black mt-1">{dayNumber}</div>
                                            <div className="text-xs font-bold opacity-75 mt-0.5">{name}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* SCOPE 3: MONTH VIEW (Standard Grid) */}
                    {calendarScope === 'month' && (
                        <>
                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-3 md:mb-4 text-center">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Shabbat'].map((d, i) => {
                                    const hebDay = HEBREW_DAYS[i];
                                    return (
                                        <div key={i} className={`flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg ${i === 6 ? 'bg-violet-50 border border-violet-100' : 'bg-slate-50'
                                            }`}>
                                            <span className={`text-[10px] md:text-xs font-black tracking-widest leading-none ${i === 6 ? 'text-violet-700' : 'text-[#1E3A8A]'
                                                }`}>{d}</span>
                                            <span className="text-[9px] md:text-[11px] font-bold text-[#D4AF37] leading-none mt-0.5">{hebDay.hebrew}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Days */}
                            <div className="grid grid-cols-7 gap-1 md:gap-2">
                                {currentMonthData.weeks.map((week, wIdx) => (
                                    <React.Fragment key={wIdx}>
                                        {week.map((dayObj, dIdx) => (
                                            <div key={`${wIdx}-${dIdx}`} className="aspect-square">
                                                {dayObj.day ? (() => {
                                                    const isSelected = selectedDay === dayObj.day;
                                                    const isToday = dayObj.gregorianDate === todayKey;
                                                    const dayType = getDayType(dayObj.festivals, dayObj.isShabbat, dIdx);

                                                    const cellClass = isSelected
                                                        ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white shadow-xl ring-2 ring-[#1E3A8A]/40'
                                                        : isToday
                                                            ? 'bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-200'
                                                            : dayType === 'shabbat'
                                                                ? 'bg-violet-50 border-violet-200 hover:border-violet-400'
                                                                : dayType === 'feast'
                                                                    ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-400'
                                                                    : dayType === 'fast'
                                                                        ? 'bg-orange-50 border-orange-200 hover:border-orange-400'
                                                                        : dayType === 'newmoon'
                                                                            ? 'bg-blue-50 border-blue-200 hover:border-blue-400'
                                                                            : dayType === 'festival'
                                                                                ? 'bg-red-50 border-red-100 hover:border-red-300'
                                                                                : 'bg-white border-slate-100 hover:border-[#1E3A8A]/30 hover:bg-[#1E3A8A]/5';

                                                    const dotColor = dayType === 'feast' ? 'bg-emerald-500'
                                                        : dayType === 'fast' ? 'bg-orange-500'
                                                            : dayType === 'newmoon' ? 'bg-blue-500'
                                                                : dayType === 'shabbat' ? 'bg-violet-500'
                                                                    : dayType === 'festival' ? 'bg-red-400'
                                                                        : null;

                                                    return (
                                                        <motion.button
                                                            whileHover={{ scale: 1.06, y: -2 }}
                                                            whileTap={{ scale: 0.96 }}
                                                            onClick={() => setSelectedDay(dayObj.day)}
                                                            className={`w-full h-full flex flex-col items-center justify-between p-1 md:p-2 rounded-xl md:rounded-2xl border-2 transition-all duration-200 relative overflow-hidden group ${cellClass}`}
                                                        >
                                                            {/* Day number */}
                                                            <span className={`text-sm md:text-xl font-black leading-none mt-0.5 ${isSelected ? 'text-white'
                                                                    : isToday ? 'text-amber-800'
                                                                        : dayType === 'shabbat' ? 'text-violet-800'
                                                                            : dayType === 'feast' ? 'text-emerald-800'
                                                                                : dayType === 'fast' ? 'text-orange-800'
                                                                                    : dayType === 'newmoon' ? 'text-blue-800'
                                                                                        : 'text-[#1E3A8A]'
                                                                }`}>{dayObj.day}</span>

                                                            {/* Center content */}
                                                            <div className="flex flex-col items-center gap-0.5 w-full">
                                                                {isToday && (
                                                                    <div className="text-[7px] md:text-[8px] font-black uppercase tracking-wide text-amber-700 bg-amber-200/60 rounded px-1">TODAY</div>
                                                                )}
                                                                {dotColor && !isSelected && (
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                                                                )}
                                                            </div>

                                                            {/* Festival label — tiny */}
                                                            {dayObj.festivals.length > 0 && (
                                                                <div className={`text-[7px] md:text-[9px] font-bold leading-tight text-center w-full truncate px-0.5 ${isSelected ? 'text-white/90' : 'text-slate-500'
                                                                    }`}>
                                                                    {dayObj.festivals[0].length > 10 ? dayObj.festivals[0].substring(0, 9) + '…' : dayObj.festivals[0]}
                                                                </div>
                                                            )}

                                                            {/* Shabbat icon top-right */}
                                                            {dIdx === 6 && !isSelected && (
                                                                <div className="absolute top-0.5 right-0.5">
                                                                    <Star size={8} className="text-violet-400 fill-violet-200" />
                                                                </div>
                                                            )}
                                                        </motion.button>
                                                    );
                                                })() : (
                                                    <div className="w-full h-full" />
                                                )}
                                            </div>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </div>
                        </>
                    )}

                    {/* SCOPE 4: YEAR VIEW (All 12-13 Months Grid) */}
                    {calendarScope === 'year' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {calendarData.map((mObj, mIdx) => (
                                <div
                                    key={mObj.name}
                                    onClick={() => { setCurrentMonthIdx(mIdx); setCalendarScope('month'); }}
                                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                        currentMonthIdx === mIdx
                                            ? 'bg-gradient-to-br from-[#1E3A8A] to-[#0c1445] text-white border-[#D4AF37] shadow-xl'
                                            : 'bg-white border-slate-200 hover:border-[#1E3A8A] hover:shadow-md'
                                    }`}
                                >
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Month {mIdx + 1}</div>
                                    <h4 className="text-lg font-black mt-1 leading-tight">{mObj.name}</h4>
                                    <p className="text-xs font-serif text-amber-500 font-bold">{mObj.hebrew}</p>
                                    <p className="text-[10px] opacity-60 mt-2 font-mono">30 Days · Open Month →</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* SCOPE 5: DECADE VIEW (10-Year Hebrew Timeline) */}
                    {calendarScope === 'decade' && (
                        <div className="space-y-4">
                            <div className="text-center space-y-1 mb-6">
                                <h4 className="text-2xl font-serif font-black text-[#1E3A8A]">10-Year Hebrew Decade Timeline (5780 – 5789)</h4>
                                <p className="text-xs text-slate-500 max-w-xl mx-auto">
                                    Explore Hebrew years across the decade, highlighting Shmita (Sabbatical Year) cycles and Biblical appointments.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                                {Array.from({ length: 10 }, (_, i) => 5780 + i).map((decadeYear) => {
                                    const isShmita = decadeYear % 7 === 2; // 5782 was Shmita
                                    const isSelectedYear = decadeYear === safeYear;
                                    return (
                                        <div
                                            key={decadeYear}
                                            onClick={() => { setYear(decadeYear); setCalendarScope('year'); }}
                                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                                isSelectedYear
                                                    ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 border-amber-300 shadow-xl'
                                                    : isShmita
                                                        ? 'bg-emerald-950 text-white border-emerald-500 shadow-md'
                                                        : 'bg-white border-slate-200 hover:border-[#1E3A8A] text-slate-900'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Year</span>
                                                {isShmita && <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-400 text-slate-950">Shmita</span>}
                                            </div>
                                            <div className="text-2xl font-black leading-tight">{decadeYear}</div>
                                            <p className="text-[10px] opacity-75 mt-1">Tap to inspect year</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Copyright Footer */}
                <div className="px-4 md:px-8 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <img src="/brand-logo.png" alt="COT" className="w-6 h-6 object-contain opacity-60" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        <p className="text-[10px] font-black text-[#1E3A8A] uppercase tracking-[0.15em]">City of Truth Ministries</p>
                    </div>
                    <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">Hebrew Calendar {safeYear}</p>
                    <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold">
                        <span>📞 +91 8056125478</span>
                        <span className="hidden sm:inline">🌐 city-of-truth-ministries.vercel.app</span>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════
                 SELECTED DATE — Premium Dark Glass Popup Card
            ═══════════════════════════════════════════════════════ */}
            <AnimatePresence mode="wait">
                {selectedDay && (() => {
                    const dayObj = currentMonthData.weeks.flat().find(d => d.day === selectedDay);
                    const dIdx = currentMonthData.weeks.flat().findIndex(d => d.day === selectedDay) % 7;
                    const dayType = dayObj ? getDayType(dayObj.festivals, dayObj.isShabbat, dIdx) : 'normal';
                    const isShabbatDay = dayType === 'shabbat';
                    const torahPortionKey = selectedDay % 54 === 0 ? 54 : selectedDay % 54;
                    const torahPortion = isShabbatDay ? (TORAH_PORTIONS[torahPortionKey] || 'Bereishit') : null;
                    const psalm = DAILY_PSALMS[selectedDay % 30 === 0 ? 30 : selectedDay % 30] || 'Psalm 23';
                    const historicalNote = dayObj?.festivals.map(f =>
                        Object.entries(HISTORICAL_NOTES).find(([k]) => f.includes(k))?.[1]
                    ).filter(Boolean)[0] || null;

                    const cardBg = dayType === 'shabbat' ? 'from-violet-900 via-indigo-900 to-[#1e1b4b]'
                        : dayType === 'feast' ? 'from-emerald-900 via-[#1e1b4b] to-[#020617]'
                            : dayType === 'fast' ? 'from-orange-900 via-[#1e1b4b] to-[#020617]'
                                : dayType === 'newmoon' ? 'from-blue-900 via-[#1e1b4b] to-[#020617]'
                                    : 'from-[#0c1445] via-[#1e1b4b] to-[#020617]';

                    return (
                        <motion.div
                            key={`${selectedDay}-${name}`}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className={`relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-gradient-to-br ${cardBg} shadow-2xl mb-4`}
                        >
                            {/* Glowing orb */}
                            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

                            <div className="relative z-10 p-5 md:p-8">
                                {/* Close button */}
                                <button
                                    onClick={() => setSelectedDay(null)}
                                    className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
                                >
                                    <X size={14} />
                                </button>

                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Left: Big Date Display */}
                                    <div className="flex flex-col items-start justify-center md:border-r md:border-white/10 md:pr-6 md:min-w-[200px]">
                                        <p className="text-[#D4AF37]/70 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Hebrew Date</p>
                                        <div className="text-5xl md:text-7xl font-black text-white leading-none mb-1">{selectedDay}</div>
                                        <div className="text-[#D4AF37] text-xl font-bold">{name}</div>
                                        <div className="text-white/50 text-sm font-semibold">{safeYear}</div>
                                        {dayObj?.gregorianDate && (
                                            <div className="mt-2 flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                                                <CalendarIcon size={11} className="text-[#D4AF37]" />
                                                <span className="text-white/70 text-xs font-bold">{dayObj.gregorianDate}{dayObj.gregorianYear ? `, ${dayObj.gregorianYear}` : ''}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Details */}
                                    <div className="flex-1 space-y-4">
                                        {/* Festivals */}
                                        {dayObj && dayObj.festivals.length > 0 && (
                                            <div>
                                                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-2">Events & Festivals</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {dayObj.festivals.map(f => (
                                                        <span key={f} className="px-3 py-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] rounded-full text-xs font-bold flex items-center gap-1.5">
                                                            <Sparkles size={10} /> {f}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Torah Portion (Shabbat only) */}
                                        {torahPortion && (
                                            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">📖 Torah Portion (Parasha)</p>
                                                <p className="text-white font-bold text-sm">{torahPortion}</p>
                                            </div>
                                        )}

                                        {/* Historical Note */}
                                        {historicalNote && (
                                            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">📜 Historical Significance</p>
                                                <p className="text-white/80 text-xs leading-relaxed">{historicalNote}</p>
                                            </div>
                                        )}

                                        {/* Day Type badge + Psalm */}
                                        <div className="flex flex-wrap gap-3">
                                            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-1 min-w-[120px]">
                                                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">📿 Day Type</p>
                                                <p className="text-white font-bold text-xs capitalize">{dayType === 'normal' ? 'Regular Day' : dayType.charAt(0).toUpperCase() + dayType.slice(1)}</p>
                                            </div>
                                            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-1 min-w-[120px]">
                                                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">📘 Psalm of the Day</p>
                                                <p className="text-white font-bold text-xs">{psalm}</p>
                                            </div>
                                        </div>

                                        {/* Prayer + Actions */}
                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl px-4 py-2 flex-1">
                                                <p className="text-[#D4AF37]/70 text-[9px] font-black uppercase tracking-widest mb-0.5">🙏 Daily Prayer</p>
                                                <p className="text-white/70 text-[10px] italic leading-relaxed">
                                                    {isShabbatDay
                                                        ? '"May this Shabbat restore your soul and draw you nearer to His throne."'
                                                        : dayType === 'feast'
                                                            ? '"Lord, may this appointed time renew my faith and deepen my covenant walk."'
                                                            : dayType === 'fast'
                                                                ? '"In fasting, may my heart be humbled and turned fully to You, O Lord."'
                                                                : '"Guide my steps today, O Lord; let Your Word be a lamp unto my path."'}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={handleDownloadCurrentMonth}
                                                    className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-[10px] font-bold transition-all"
                                                    title="Download month image"
                                                >
                                                    <Download size={11} /> Save
                                                </button>
                                                <button
                                                    onClick={() => { if (navigator.share) navigator.share({ title: `${selectedDay} ${name} ${safeYear}`, text: `Hebrew Date: ${selectedDay} ${name} ${safeYear}\n${dayObj?.gregorianDate || ''}\nCity of Truth Ministries` }).catch(() => { }); }}
                                                    className="flex items-center gap-1.5 px-3 py-2 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/40 rounded-xl text-[#D4AF37] text-[10px] font-bold transition-all"
                                                    title="Share this date"
                                                >
                                                    <Share2 size={11} /> Share
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>

            {/* ═══════════════════════════════════════════════════════
                 FACTS SECTION (preserved, lightly restyled)
            ═══════════════════════════════════════════════════════ */}
            <div className="bg-gradient-to-br from-slate-50 to-[#1E3A8A]/5 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] space-y-6 md:space-y-8 font-serif">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
                    <div>
                        <h3 className="text-xl md:text-3xl font-bold text-[#1E3A8A] flex items-center gap-2 md:gap-3">
                            <Sparkles className="text-[#D4AF37] w-5 h-5 md:w-7 md:h-7" /> Hebrew Calendar & Leap Year Facts
                        </h3>
                        <p className="text-xs md:text-sm text-slate-500 font-sans mt-1">Understanding the divine astronomical alignment of the Biblical calendar</p>
                    </div>
                    <div className="bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black text-[#1E3A8A] uppercase tracking-widest self-start md:self-auto shadow-sm">
                        Lunisolar System • Shanah Me'uberet
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-4"
                >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        {[{ val: '19 Years', label: 'Metonic Cycle', color: 'text-[#1E3A8A]', border: 'border-slate-100' },
                        { val: '7 Leap Years', label: 'Per Cycle', color: 'text-[#D4AF37]', border: 'border-[#D4AF37]/20' },
                        { val: '383–385 Days', label: 'Leap Year Length', color: 'text-[#1E3A8A]', border: 'border-slate-100' },
                        { val: 'Passover', label: 'Anchored in Spring', color: 'text-[#D4AF37]', border: 'border-[#D4AF37]/20' },
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * (i + 1), type: 'spring' }}
                                whileHover={{ scale: 1.05 }}
                                className={`p-3 md:p-4 bg-white rounded-xl border ${s.border} shadow-sm hover:shadow-md transition-all`}
                            >
                                <div className={`text-xl md:text-2xl font-black leading-none ${s.color}`}>{s.val}</div>
                                <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 mt-1.5 font-sans tracking-wider">{s.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gradient-to-r from-[#1E3A8A]/5 via-[#D4AF37]/10 to-[#1E3A8A]/5 border-2 border-[#D4AF37]/30 rounded-2xl p-4 md:p-5 text-center"
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <CalendarIcon className="text-[#D4AF37] w-5 h-5" />
                            <h4 className="font-black text-[#1E3A8A] text-sm md:text-base uppercase tracking-wider">Hebrew New Year Celebration</h4>
                        </div>
                        <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-sans">
                            <strong className="text-[#1E3A8A]">Rosh Hashanah (ראש השנה)</strong> — The Jewish New Year is celebrated on <strong>1st and 2nd of Tishrei</strong> (usually September/October). It marks the beginning of the High Holy Days and the civil new year, while Nisan remains the first month of the religious calendar.
                        </p>
                        <p className="text-[10px] text-[#D4AF37] font-bold mt-2 uppercase tracking-widest">தலை வருடம் - திஷ்ரே மாதம் 1 & 2</p>
                    </motion.div>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
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

            {/* ═══════════════════════════════════════════════════════
                 ALL 8 MOON PHASES CELESTIAL SPECTRUM GUIDE
            ═══════════════════════════════════════════════════════ */}
            <div className="mt-8 bg-gradient-to-br from-slate-950 via-[#0B132B] to-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-[#D4AF37]/30 shadow-2xl text-white space-y-8 font-sans relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                {/* Section Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-[#D4AF37]">
                            <Moon className="w-4 h-4 text-amber-400" /> Celestial Lunar Spectrum • சந்திர பருவங்களின் வழிகாட்டி
                        </div>
                        <h3 className="text-2xl md:text-4xl font-black text-white mt-1">
                            The 8 Moon Phases of the Biblical Hebrew Calendar
                        </h3>
                        <p className="text-xs md:text-sm text-slate-300 font-serif mt-1">
                            Comprehensive astronomical guide to the 8 stages of lunar illumination in Israel's Biblical calendar
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <span className="bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3.5 py-1.5 rounded-full text-xs font-black text-amber-300 uppercase tracking-wider">
                            29.53 Day Synodic Month
                        </span>
                        <span className="bg-blue-500/20 border border-blue-400/40 px-3.5 py-1.5 rounded-full text-xs font-black text-blue-300 uppercase tracking-wider">
                            8 Lunar Stages
                        </span>
                    </div>
                </div>

                {/* Live Moon Phase Banner */}
                <div className="bg-gradient-to-r from-amber-500/15 via-[#D4AF37]/10 to-amber-500/15 border border-[#D4AF37]/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl md:text-4xl bg-white/10 p-2 rounded-xl border border-white/20">{moonPhase.emoji}</span>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Live Jerusalem Moon Observation</div>
                            <div className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                                {moonPhase.name} <span className="text-xs font-mono text-amber-300">({moonPhase.illumination}% Illuminated)</span>
                            </div>
                            <div className="text-xs text-slate-300 font-serif">{moonPhase.hebrewName} • Lunar Age: {moonPhase.lunarAge} Days</div>
                        </div>
                    </div>
                    <div className="text-xs text-amber-200/90 bg-black/40 px-4 py-2 rounded-xl border border-amber-500/30 text-center sm:text-right">
                        <span className="font-bold">Jerusalem Time:</span> {moonPhase.jerusalemTimeStr} (UTC+3)
                    </div>
                </div>

                {/* Grid of All 8 Moon Phases */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                    {ALL_MOON_PHASES.map((phase) => {
                        const isCurrent = moonPhase.name.toLowerCase().includes(phase.name.toLowerCase().split(' ')[0]);
                        return (
                            <motion.div
                                key={phase.id}
                                whileHover={{ scale: 1.02, y: -4 }}
                                onClick={() => setSelectedMoonPhase(phase)}
                                className={`bg-gradient-to-b ${phase.bgGradient} rounded-2xl p-5 border ${isCurrent ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_25px_rgba(212,175,55,0.25)]' : 'border-white/10 hover:border-[#D4AF37]/50'} cursor-pointer transition-all flex flex-col justify-between space-y-4 group`}
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <span className="text-4xl md:text-5xl drop-shadow-md group-hover:scale-110 transition-transform">{phase.emoji}</span>
                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${phase.badgeColor}`}>
                                            {phase.illumination}
                                        </span>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="text-lg font-black text-white group-hover:text-[#D4AF37] transition-colors">{phase.name}</h4>
                                            {isCurrent && (
                                                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Current</span>
                                            )}
                                        </div>
                                        <p className="text-sm font-serif text-[#D4AF37] font-semibold">{phase.hebrewName}</p>
                                        <p className="text-[11px] font-mono text-slate-400 italic">{phase.transliteration}</p>
                                        <p className="text-xs font-bold text-amber-200/90 mt-1">{phase.tamilName}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 border-t border-white/10 pt-3 text-xs">
                                    <div className="flex justify-between text-[11px] text-slate-300">
                                        <span className="text-slate-400">Lunar Age:</span>
                                        <span className="font-mono font-bold text-white">{phase.lunarAge}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] text-slate-300">
                                        <span className="text-slate-400">Calendar Window:</span>
                                        <span className="font-semibold text-[#D4AF37]">{phase.hebrewCalendarDay}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 line-clamp-3 leading-snug font-serif">
                                        {phase.biblicalSignificance}
                                    </p>
                                </div>

                                <button
                                    className="w-full mt-2 py-1.5 rounded-xl bg-white/5 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/40 text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    <Info size={12} /> View Details & Tamil
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Selected Moon Phase Details Modal */}
                <AnimatePresence>
                    {selectedMoonPhase && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                            onClick={() => setSelectedMoonPhase(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className={`bg-gradient-to-br ${selectedMoonPhase.bgGradient} border-2 border-[#D4AF37] rounded-3xl p-6 md:p-8 max-w-2xl w-full text-white shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto`}
                            >
                                <button
                                    onClick={() => setSelectedMoonPhase(null)}
                                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
                                >
                                    <X size={16} />
                                </button>

                                <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                                    <span className="text-6xl md:text-7xl p-3 bg-white/10 rounded-2xl border border-white/20 shadow-inner">{selectedMoonPhase.emoji}</span>
                                    <div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${selectedMoonPhase.badgeColor}`}>
                                            Illumination: {selectedMoonPhase.illumination}
                                        </span>
                                        <h3 className="text-2xl md:text-3xl font-black text-white mt-1">{selectedMoonPhase.name}</h3>
                                        <div className="flex items-center gap-2 text-lg font-serif text-[#D4AF37]">
                                            <span>{selectedMoonPhase.hebrewName}</span>
                                            <span className="text-xs text-slate-300 font-sans font-normal">({selectedMoonPhase.transliteration})</span>
                                        </div>
                                        <p className="text-sm font-bold text-amber-300 mt-0.5">{selectedMoonPhase.tamilName}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
                                        <div className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37]">Lunar Cycle Age</div>
                                        <div className="text-xl font-bold font-mono text-white">{selectedMoonPhase.lunarAge}</div>
                                        <p className="text-xs text-slate-400">Synodic month cycle timestamp</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
                                        <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Hebrew Calendar Position</div>
                                        <div className="text-xl font-bold text-white">{selectedMoonPhase.hebrewCalendarDay}</div>
                                        <p className="text-xs text-slate-400">Approximate days of the Hebrew month</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-black uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
                                        <BookOpen size={16} /> Biblical & Spiritual Significance
                                    </h4>
                                    <p className="text-sm text-slate-200 leading-relaxed font-serif bg-white/5 border border-white/10 rounded-2xl p-4">
                                        {selectedMoonPhase.biblicalSignificance}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                                        <Globe size={16} /> தமிழ் விளக்கம் (Tamil Translation & Context)
                                    </h4>
                                    <p className="text-sm text-amber-100 leading-relaxed bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                                        {selectedMoonPhase.tamilMeaning}
                                    </p>
                                </div>

                                {selectedMoonPhase.scriptureRef && (
                                    <div className="bg-indigo-950/80 border border-indigo-400/30 rounded-2xl p-4 flex items-center justify-between gap-3">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Key Scripture References</span>
                                            <div className="text-sm font-bold text-white">{selectedMoonPhase.scriptureRef}</div>
                                        </div>
                                        <Sparkles className="text-indigo-400 w-6 h-6" />
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                                    <div style={{ fontSize: '12px', fontWeight: 900, color: '#f0c040' }}>{(i + 1).toString().padStart(2, '0')}. {m.name}</div>
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

const AnalogDial: React.FC<{
    label: string;
    hourAngle: number;
    minuteAngle: number;
    secondAngle: number;
    is24Hour: boolean;
    subtitle?: string;
}> = ({ label, hourAngle, minuteAngle, secondAngle, is24Hour, subtitle }) => {
    const letters = is24Hour
        ? ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'יא', 'יב', 'יג', 'יד', 'טו', 'טז', 'יז', 'יח', 'יט', 'כ', 'כא', 'כב', 'כג', 'כד']
        : ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'יא', 'יב'];

    return (
        <div className="bg-gradient-to-b from-[#0f1026] via-[#0b0c1e] to-[#050512] border-2 border-[#C5A880]/40 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col items-center hover:border-[#C5A880] transition-all relative group overflow-hidden w-full max-w-lg mx-auto">
            <div className="absolute inset-0 bg-gradient-to-b from-[#C5A880]/10 via-transparent to-black/50 pointer-events-none" />

            {/* Header Badge & Title with clear headroom */}
            <div className="flex flex-col items-center gap-1 mb-6 relative z-10 text-center">
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#C5A880] bg-[#C5A880]/15 px-4 py-1.5 rounded-full border border-[#C5A880]/40 shadow-sm">
                    {label}
                </span>
                {subtitle && <p className="text-xs text-slate-400 font-serif mt-1">{subtitle}</p>}
            </div>

            {/* Clock Face Circle - Grand, Big & Clear */}
            <div className="relative w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 lg:w-[420px] lg:h-[420px] rounded-full border-[10px] border-double border-[#C5A880] bg-gradient-to-br from-[#121330] via-[#0b0c20] to-[#040510] shadow-[0_0_50px_rgba(197,168,128,0.3),inset_0_0_35px_rgba(0,0,0,0.9)] flex items-center justify-center">
                {/* Outer Decorative Ring Ticks */}
                <div className="absolute inset-2 rounded-full border border-[#C5A880]/20 pointer-events-none" />

                {/* Dial numbers placed using polar trigonometry */}
                {letters.map((char, i) => {
                    const value = i + 1;
                    const totalSteps = is24Hour ? 24 : 12;
                    const angle = value * (360 / totalSteps);
                    const angleRad = (angle * Math.PI) / 180;
                    const radiusPercent = is24Hour ? 39 : 37;
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
                            <span className={`${is24Hour ? 'text-[9px] sm:text-[11px] md:text-[12px]' : 'text-[11px] sm:text-[13px] md:text-[15px]'} font-extrabold text-white tracking-tighter`}>{value}</span>
                            <span className={`${is24Hour ? 'text-[8px] sm:text-[9px] md:text-[10px]' : 'text-[10px] sm:text-[11px] md:text-[13px]'} font-black text-[#C5A880] mt-0.5 font-serif`}>{char}</span>
                        </div>
                    );
                })}

                {/* Hour Hand */}
                <div
                    className="absolute left-1/2 top-1/2 w-[6px] sm:w-[7px] md:w-[8px] h-[28%] bg-gradient-to-t from-[#C5A880] via-[#E5C890] to-white rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.7)] z-10"
                    style={{
                        transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
                        transformOrigin: '50% 100%',
                    }}
                />

                {/* Minute Hand */}
                <div
                    className="absolute left-1/2 top-1/2 w-[4px] sm:w-[5px] h-[38%] bg-gradient-to-t from-slate-300 via-slate-100 to-white rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.7)] z-20"
                    style={{
                        transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
                        transformOrigin: '50% 100%',
                    }}
                />

                {/* Second Hand */}
                <div
                    className="absolute left-1/2 top-1/2 w-[2px] h-[45%] bg-gradient-to-t from-red-600 via-red-500 to-amber-300 rounded-full shadow-[0_1px_6px_rgba(239,68,68,0.5)] z-30"
                    style={{
                        transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`,
                        transformOrigin: '50% 100%',
                    }}
                />

                {/* Center Pivot Point */}
                <div className="absolute left-1/2 top-1/2 w-5 h-5 bg-slate-950 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-[#C5A880] shadow-lg z-40 flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#C5A880] rounded-full shadow-inner" />
                </div>
            </div>
        </div>
    );
};

const HebrewClockView: React.FC = () => {
    const [now, setNow] = useState(() => new Date());
    const clockRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [dialMode, setDialMode] = useState<'both' | '12h' | '24h'>('both');

    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    // Jerusalem Time Telemetry (Asia/Jerusalem)
    const jerusalemDigitalTime12 = useMemo(
        () => now.toLocaleTimeString('en-US', { timeZone: JERUSALEM_TIMEZONE, hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        [now]
    );
    const jerusalemDigitalTime24 = useMemo(
        () => now.toLocaleTimeString('en-US', { timeZone: JERUSALEM_TIMEZONE, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        [now]
    );
    const jerusalemDateLine = useMemo(
        () => now.toLocaleDateString('en-US', { timeZone: JERUSALEM_TIMEZONE, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        [now]
    );

    // Chennai Time Telemetry (Asia/Kolkata)
    const chennaiDigitalTime12 = useMemo(
        () => now.toLocaleTimeString('en-IN', { timeZone: CHENNAI_TIMEZONE, hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        [now]
    );
    const chennaiDigitalTime24 = useMemo(
        () => now.toLocaleTimeString('en-IN', { timeZone: CHENNAI_TIMEZONE, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        [now]
    );
    const chennaiDateLine = useMemo(
        () => now.toLocaleDateString('en-IN', { timeZone: CHENNAI_TIMEZONE, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        [now]
    );

    // Angles for Analog Dial
    const [jHour = 0, jMinute = 0, jSecond = 0] = jerusalemDigitalTime24.split(':').map(Number);
    const hour12Angle = ((jHour % 12) + jMinute / 60 + jSecond / 3600) * 30;
    const hour24Angle = ((jHour % 24) + jMinute / 60 + jSecond / 3600) * 15;
    const minuteAngle = (jMinute + jSecond / 60) * 6;
    const secondAngle = jSecond * 6;

    const jeruHebrew12 = `${toHebrew((jHour % 12) || 12)}:${toHebrew(jMinute)}:${toHebrew(jSecond)}`;
    const jeruHebrew24 = `${toHebrew(jHour)}:${toHebrew(jMinute)}:${toHebrew(jSecond)}`;

    const [cHour = 0, cMinute = 0, cSecond = 0] = chennaiDigitalTime24.split(':').map(Number);
    const chennaiHebrew12 = `${toHebrew((cHour % 12) || 12)}:${toHebrew(cMinute)}:${toHebrew(cSecond)}`;

    const moonInfo = useMemo(() => getMoonPhaseInfo(now), [now]);

    const handleDownloadClock = async () => {
        if (!clockRef.current) return;
        setIsExporting(true);
        try {
            const dataUrl = await captureNodeToJpeg(clockRef.current, { backgroundColor: '#020617', width: 1200 });
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
        <div className="space-y-8 font-serif">
            <div ref={clockRef} className="space-y-10 bg-slate-950 text-white rounded-[2.5rem] p-6 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Background lighting */}
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#1E3A8A]/30 rounded-full blur-3xl pointer-events-none" />

                {/* Header */}
                <div className="text-center relative z-10 space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-black uppercase tracking-[0.25em]">
                        <Clock size={14} /> Sacred Astronomical Clock & Dual Timezone Sync
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 drop-shadow-md">
                        Jerusalem & Chennai Live Time
                    </h3>
                    <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm">
                        Synchronized live to Jerusalem, Israel (Asia/Jerusalem · UTC+3) and Chennai, India (Asia/Kolkata · UTC+5:30) with 12-Hour Sacred & 24-Hour Solar Hebrew Dials.
                    </p>
                </div>

                {/* ═══ ROW 1: DUAL DIGITAL TIME CARDS ═══ */}
                <div className="grid gap-6 md:grid-cols-2 relative z-10">
                    {/* JERUSALEM TIME (YERUSHALAYIM) */}
                    <div className="bg-gradient-to-b from-amber-950/40 via-slate-900/80 to-slate-950 border border-amber-500/40 rounded-[2rem] p-6 shadow-[0_0_30px_rgba(212,175,55,0.15)] flex flex-col justify-between relative overflow-hidden group hover:border-amber-400/60 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                                    <span className="text-xs font-black uppercase tracking-widest text-amber-400">Jerusalem Time (Yerushalayim)</span>
                                </div>
                                <span className="text-[10px] font-bold text-amber-300/80 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">Israel · UTC+3</span>
                            </div>

                            <div className="text-center py-4 bg-black/50 rounded-2xl border border-amber-500/30 shadow-inner">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/80 mb-1">Jerusalem Live Digital Time</p>
                                <div className="text-4xl sm:text-5xl font-black font-mono tracking-wider text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                                    {jerusalemDigitalTime12}
                                </div>
                                <p className="text-xs text-slate-300 font-bold mt-2 tracking-wide">{jerusalemDateLine}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-center">
                                    <p className="text-[9px] font-black text-amber-400/70 uppercase tracking-wider">Sacred 12H (Hebrew)</p>
                                    <div className="text-xl font-black text-white mt-1" dir="rtl">{jeruHebrew12}</div>
                                </div>
                                <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-center">
                                    <p className="text-[9px] font-black text-amber-400/70 uppercase tracking-wider">Solar 24H (Hebrew)</p>
                                    <div className="text-xl font-black text-white mt-1" dir="rtl">{jeruHebrew24}</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/10 text-center text-[10px] text-amber-200/80 font-bold flex items-center justify-center gap-1">
                            <MapPin size={12} className="text-amber-400" /> Capital of Israel · Temple Mount Astronomical Sync
                        </div>
                    </div>

                    {/* CHENNAI TIME (INDIA) */}
                    <div className="bg-gradient-to-b from-blue-950/40 via-slate-900/80 to-slate-950 border border-blue-500/40 rounded-[2rem] p-6 shadow-[0_0_30px_rgba(30,58,138,0.2)] flex flex-col justify-between relative overflow-hidden group hover:border-blue-400/60 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                                    <span className="text-xs font-black uppercase tracking-widest text-cyan-400">Chennai Time (India)</span>
                                </div>
                                <span className="text-[10px] font-bold text-cyan-300/80 uppercase tracking-widest bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">India · UTC+5:30</span>
                            </div>

                            <div className="text-center py-4 bg-black/50 rounded-2xl border border-blue-500/30 shadow-inner">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/80 mb-1">Chennai Live Digital Time</p>
                                <div className="text-4xl sm:text-5xl font-black font-mono tracking-wider text-cyan-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                                    {chennaiDigitalTime12}
                                </div>
                                <p className="text-xs text-slate-300 font-bold mt-2 tracking-wide">{chennaiDateLine}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-center">
                                    <p className="text-[9px] font-black text-cyan-400/70 uppercase tracking-wider">Sacred 12H (Hebrew)</p>
                                    <div className="text-xl font-black text-white mt-1" dir="rtl">{chennaiHebrew12}</div>
                                </div>
                                <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-center">
                                    <p className="text-[9px] font-black text-cyan-400/70 uppercase tracking-wider">Time Offset</p>
                                    <div className="text-sm font-black text-amber-300 mt-1">+2h 30m</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/10 text-center text-[10px] text-cyan-200/80 font-bold flex items-center justify-center gap-1">
                            <Sparkles size={12} className="text-cyan-400" /> +2 Hours 30 Minutes Ahead of Jerusalem
                        </div>
                    </div>
                </div>

                {/* ═══ ROW 2: GRAND SACRED & SOLAR ANALOG CLOCKS (BIG DIALS) ═══ */}
                <div className="bg-gradient-to-b from-[#090b1c] via-[#050612] to-slate-950 border border-[#D4AF37]/30 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative z-10 space-y-6">
                    {/* Dial Selector Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#D4AF37]">Sacred & Solar Analog Display</span>
                            <h4 className="text-xl md:text-2xl font-black text-white">Jerusalem Astronomical Dials</h4>
                        </div>

                        {/* Dial Mode Buttons */}
                        <div className="flex flex-wrap items-center bg-black/60 p-1.5 rounded-2xl border border-white/10 gap-1">
                            <button
                                onClick={() => setDialMode('both')}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${dialMode === 'both' ? 'bg-[#D4AF37] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                🌓 Dual Dials (12H & 24H)
                            </button>
                            <button
                                onClick={() => setDialMode('12h')}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${dialMode === '12h' ? 'bg-[#D4AF37] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                📜 12-Hour Sacred (א - יב)
                            </button>
                            <button
                                onClick={() => setDialMode('24h')}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${dialMode === '24h' ? 'bg-[#D4AF37] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                ☀️ 24-Hour Solar (א - כד)
                            </button>
                        </div>
                    </div>

                    {/* Analog Dials Rendering Container */}
                    <div className="pt-2">
                        {dialMode === 'both' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-items-center">
                                <AnalogDial
                                    label="12-Hour Sacred Dial"
                                    subtitle="Sacred Cycle (א - יב • 1 to 12)"
                                    hourAngle={hour12Angle}
                                    minuteAngle={minuteAngle}
                                    secondAngle={secondAngle}
                                    is24Hour={false}
                                />
                                <AnalogDial
                                    label="24-Hour Solar Dial"
                                    subtitle="Solar Full Cycle (א - כד • 1 to 24)"
                                    hourAngle={hour24Angle}
                                    minuteAngle={minuteAngle}
                                    secondAngle={secondAngle}
                                    is24Hour={true}
                                />
                            </div>
                        )}

                        {dialMode === '12h' && (
                            <div className="flex justify-center">
                                <AnalogDial
                                    label="12-Hour Sacred Dial"
                                    subtitle="Sacred Hebrew Cycle (א - יב • 1 to 12)"
                                    hourAngle={hour12Angle}
                                    minuteAngle={minuteAngle}
                                    secondAngle={secondAngle}
                                    is24Hour={false}
                                />
                            </div>
                        )}

                        {dialMode === '24h' && (
                            <div className="flex justify-center">
                                <AnalogDial
                                    label="24-Hour Solar Dial"
                                    subtitle="Solar Hebrew Cycle (א - כד • 1 to 24)"
                                    hourAngle={hour24Angle}
                                    minuteAngle={minuteAngle}
                                    secondAngle={secondAngle}
                                    is24Hour={true}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ ROW 3: DUAL TIMEZONE SUMMARY BANNER ═══ */}
                <div className="relative z-10 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/40 rounded-[2rem] p-6 text-center shadow-xl flex flex-col md:flex-row items-center justify-around gap-6">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{moonInfo.emoji}</span>
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Current Moon Phase</p>
                            <p className="text-sm font-bold text-white">{moonInfo.name} ({moonInfo.illumination}% Illuminated)</p>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden md:block" />
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Jerusalem 24H</p>
                        <p className="text-2xl font-black font-mono text-amber-300">{jerusalemDigitalTime24}</p>
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden md:block" />
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Chennai 24H</p>
                        <p className="text-2xl font-black font-mono text-cyan-300">{chennaiDigitalTime24}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-6">
                <button
                    onClick={handleDownloadClock}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-brand-950 rounded-full hover:from-amber-400 hover:to-amber-500 font-black text-sm uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_15px_30px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                >
                    {isExporting ? (
                        <><span className="animate-spin text-sm">⏳</span> Exporting Clock Image...</>
                    ) : (
                        <><Download size={18} /> Download High-Res Clock</>
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
                        <div className={`${hebrewResult.length > 15 ? 'text-xl md:text-5xl' :
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

            {/* ── WORD BUILDER (Space-Optimized, Compact & Sleek) ── */}
            <div className={`bg-white border border-slate-200 shadow-md p-0.5 rounded-2xl md:rounded-[2rem] z-20 ${isBuilderStickyActive ? 'sticky top-[4.5rem]' : ''}`}>
                <div className="bg-white rounded-2xl md:rounded-[2rem] p-2.5 sm:p-4 md:p-5">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0 w-full">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Word Builder — {selectedLetters.length} letter{selectedLetters.length !== 1 ? 's' : ''}</p>
                                <button
                                    onClick={() => setBuilderSticky((v) => !v)}
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-colors ${isBuilderStickyActive ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                                >
                                    {isBuilderStickyActive ? 'Sticky On' : 'Sticky Off'}
                                </button>
                            </div>
                            {selectedLetters.length === 0 ? (
                                <div
                                    onDragOver={handleBuilderDragOver}
                                    onDrop={handleBuilderDrop}
                                    onDragLeave={() => setIsBuilderDragOver(false)}
                                    className={`text-xs italic rounded-xl border border-dashed p-2.5 text-center transition-colors ${isBuilderDragOver ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-400'}`}
                                >
                                    Drag & drop letters here, or tap + ADD on letter cards.
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div
                                        className={`overflow-x-auto no-scrollbar pb-0.5 rounded-xl transition-colors max-w-full ${isBuilderDragOver ? 'bg-brand-50/70' : ''}`}
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
                                            className={`flex items-center gap-1.5 ${isBuilderDragOver ? 'py-0.5' : ''}`}
                                        >
                                            {selectedLetters.map((l) => (
                                                <Reorder.Item
                                                    key={l.key}
                                                    value={l}
                                                    whileDrag={{ scale: 1.03, boxShadow: '0 10px 30px rgba(15,23,42,0.15)' }}
                                                    className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-xl border border-slate-200 bg-slate-50 hover:border-brand-300 cursor-grab active:cursor-grabbing select-none transition-colors duration-200 touch-pan-x"
                                                >
                                                    <span className="text-xl font-serif text-brand-950 leading-none">{l.letter}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase">{l.name}</span>
                                                    <button
                                                        onClick={() => removeLetterByKey(l.key)}
                                                        className="w-4 h-4 rounded-full bg-slate-200 hover:bg-red-100 hover:text-red-500 text-slate-400 flex items-center justify-center transition-colors text-[9px] font-black ml-0.5"
                                                        title={`Remove ${l.name}`}
                                                    >
                                                        ✕
                                                    </button>
                                                </Reorder.Item>
                                            ))}
                                        </Reorder.Group>
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-serif text-brand-950 max-h-10 overflow-x-auto no-scrollbar leading-none whitespace-nowrap shrink-0" dir="rtl">{combinedWord}</div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-1.5 shrink-0 flex-wrap w-full md:w-auto justify-end">
                            <button
                                onClick={playCombined}
                                disabled={!combinedWord}
                                className="px-3.5 py-1.5 rounded-xl bg-brand-950 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-900 transition-colors cursor-pointer"
                            >
                                <Volume2 size={13} /> Play Word
                            </button>
                            {selectedLetters.length > 0 && !aiResult && (
                                <button
                                    onClick={handleDeepAnalysis}
                                    disabled={isAnalyzing}
                                    className="px-3.5 py-1.5 rounded-xl bg-accent-500 text-brand-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 hover:bg-accent-400 transition-colors shadow-md cursor-pointer"
                                >
                                    {isAnalyzing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                                    {isAnalyzing ? 'Analyzing…' : 'Word Analysis'}
                                </button>
                            )}
                            {selectedLetters.length > 0 && (
                                <button
                                    onClick={() => { setSelectedLetters([]); setAiResult(null); setAiError(null); setBuilderSticky(true); }}
                                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors cursor-pointer"
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

                    {/* ── AI ANALYSIS RESULT CARD (FULL FEATURED AS IN SCREENSHOT 2) ── */}
                    <AnimatePresence>
                        {aiResult && (
                            <motion.div
                                ref={aiResultRef}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.35 }}
                                className="bg-slate-950 text-white rounded-[2rem] p-6 md:p-8 flex flex-col space-y-5 shadow-2xl relative overflow-hidden border border-white/10"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-brand-950/40 pointer-events-none" />

                                {/* 1. Pronunciation Header Row */}
                                <div className="flex justify-between items-start gap-3 relative z-10">
                                    <div className="space-y-1 min-w-0">
                                        <div className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em]">PRONUNCIATION</div>
                                        <div className="text-2xl font-black flex items-center gap-2 text-white flex-wrap">
                                            <span>{aiResult.pronunciation}</span>
                                            <button
                                                onClick={playCombined}
                                                className="shrink-0 p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-accent-400 cursor-pointer"
                                                title="Listen in English"
                                            >
                                                <Volume2 size={16} />
                                            </button>
                                        </div>
                                        {aiResult.pronunciationTa && (
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <div className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                                    <div className="w-4 h-[1px] bg-slate-700" />
                                                    {aiResult.pronunciationTa} (தமிழ்)
                                                </div>
                                                <button
                                                    onClick={() => audioService.playTamil(aiResult.pronunciationTa)}
                                                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-accent-400 cursor-pointer"
                                                    title="Listen in Tamil"
                                                >
                                                    <Volume2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="shrink-0 bg-brand-500/20 p-2.5 rounded-xl border border-white/5">
                                        <Sparkles size={18} className="text-accent-400 animate-pulse" />
                                    </div>
                                </div>

                                {/* 2. Root Word (Shoresh) Section */}
                                {aiResult.root && (
                                    <div className="relative group/root cursor-default z-10">
                                        <div className="absolute inset-0 bg-accent-500/10 blur-2xl opacity-0 group-hover/root:opacity-100 transition-opacity duration-700"></div>
                                        <div className="relative bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3 group-hover/root:border-accent-500/30 transition-all">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="shrink-0 w-8 h-8 bg-accent-500/20 rounded-xl flex items-center justify-center text-accent-400">
                                                    <Fingerprint size={16} />
                                                </div>
                                                <div className="space-y-0.5 min-w-0">
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SHORESH (HEBREW ROOT)</div>
                                                    <div className="text-xs text-brand-400 font-bold">The spiritual foundation</div>
                                                </div>
                                            </div>
                                            <div className="text-2xl sm:text-3xl font-serif text-accent-400 tracking-[0.2em] shrink-0" dir="rtl">
                                                {aiResult.root}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 3. Syllables & Splitting Grid */}
                                <div className="grid grid-cols-2 gap-3 py-4 border-y border-white/10 relative z-10">
                                    <div className="space-y-1.5">
                                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">HEBREW SYLLABLES</div>
                                        <div className="text-sm sm:text-base font-serif tracking-widest text-white/90 break-words" dir="rtl">{aiResult.breakdownHe || aiResult.word}</div>
                                    </div>
                                    <div className="space-y-1.5 border-l border-white/10 pl-3">
                                        <div className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em]">ENGLISH SPLITTING</div>
                                        <div className="text-sm sm:text-base font-mono font-bold text-accent-200 tracking-tight break-words">{aiResult.breakdownEn || aiResult.pronunciation}</div>
                                    </div>
                                </div>

                                {/* 4. Meanings Section */}
                                <div className="space-y-4 relative z-10">
                                    {aiResult.meaningEn && (
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold text-amber-500 uppercase tracking-widest">ENGLISH MEANING</div>
                                            <div className="text-base sm:text-lg font-serif leading-relaxed text-slate-100 break-words">{aiResult.meaningEn}</div>
                                        </div>
                                    )}
                                    {aiResult.meaningTa && (
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold text-brand-400 uppercase tracking-widest">TAMIL MEANING (தமிழ்)</div>
                                            <div className="text-lg sm:text-xl font-serif leading-relaxed text-slate-100 break-words">{aiResult.meaningTa}</div>
                                        </div>
                                    )}
                                    {(aiResult.description || aiResult.insight) && (
                                        <div className="pt-2 italic text-[11px] text-slate-400 font-light leading-relaxed break-words border-t border-white/5">
                                            {aiResult.description || aiResult.insight}
                                        </div>
                                    )}
                                </div>

                                {/* 5. Mouth Pronunciation Guide */}
                                <div className="pt-4 border-t border-white/10 relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-7 h-7 bg-accent-500/20 rounded-lg flex items-center justify-center">
                                            <Mic size={14} className="text-accent-400" />
                                        </div>
                                        <span className="text-xs font-black text-accent-400 uppercase tracking-widest">PRONUNCIATION GUIDE</span>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex justify-center">
                                        <MouthPronunciationAnimator
                                            phonemeSequence={buildAudioMouthSequence(aiResult.breakdownEn || aiResult.pronunciation)}
                                            wordText={aiResult.word}
                                            phonetic={aiResult.breakdownEn || aiResult.pronunciation}
                                            tamilPhonetic={aiResult.pronunciationTa}
                                            lang="he"
                                            theme="blue"
                                            autoPlay={true}
                                            showControls={true}
                                            size={160}
                                        />
                                    </div>
                                </div>

                                {/* 6. Styled Export Buttons */}
                                <div className="pt-4 border-t border-white/10 flex gap-3 flex-wrap relative z-10">
                                    <button
                                        onClick={downloadInsightPdf}
                                        disabled={isExporting}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent-500 hover:bg-accent-400 text-brand-950 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                                    >
                                        {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                        Download PDF
                                    </button>
                                    <button
                                        onClick={downloadInsightImage}
                                        disabled={isExporting}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer border border-white/10"
                                    >
                                        {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileImage size={14} />}
                                        Save Image
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* ── LOWER GRID (Magnificent Royal Hebrew Letters Grid) ── */}
            <div className="grid gap-6 mt-6">
                {/* ── COMPACT HEBREW LETTERS GRID ("Short Below") ── */}
                <div className="bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#020617] rounded-[2.5rem] border border-[#F59E0B]/30 p-5 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FDE047] mb-6 text-center drop-shadow-md">
                        ✨ Tap any letter to add it — or drag it to the builder above ✨
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 relative z-10">
                        {HEBREW_AUDIO_LETTERS.map((item) => (
                            <div
                                key={item.letter}
                                draggable
                                onDragStart={(e) => handleSourceLetterDragStart(e, item)}
                                className="rounded-2xl bg-gradient-to-br from-[#F59E0B]/40 via-indigo-500/30 to-slate-800/80 p-[1.5px] hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg cursor-grab active:cursor-grabbing select-none hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]"
                                title={`Drag or tap to add ${item.name}`}
                            >
                                <div className="bg-gradient-to-b from-[#1e293b]/95 to-[#0f172a]/98 rounded-2xl p-3 flex flex-col items-center justify-between text-center h-full min-h-[130px] border border-white/5">
                                    <div className="flex flex-col items-center gap-0.5 pointer-events-none">
                                        <span className="text-3xl sm:text-4xl font-serif text-amber-300 font-bold leading-none drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">{item.letter}</span>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-200 leading-none mt-1">{item.name}</span>
                                        <span className="text-[9px] font-bold text-amber-400/80 font-serif" dir="rtl">{item.hebrewName}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2.5 w-full justify-center">
                                        <button
                                            onClick={() => addLetter(item)}
                                            className="flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition-all shadow-md active:scale-95 cursor-pointer font-bold"
                                            title={`Add ${item.name}`}
                                        >
                                            + Add
                                        </button>
                                        <button
                                            onClick={() => playLetter(item.letter, item.hebrewName)}
                                            className="w-7 h-7 rounded-xl bg-white/10 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-sm active:scale-95"
                                            title={`Play ${item.hebrewName}`}
                                        >
                                            <Volume2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
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
                    className={`hidden md:block sticky top-[76px] z-30 w-full bg-transparent py-4 mb-6 border-none shadow-none ${tabNavVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}
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
                                    className={`relative flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest transition-all duration-500 shadow-sm border ${isActive
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
                                    className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-black text-[9px] uppercase tracking-widest transition-all duration-500 shadow-sm border ${isActive
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
