// Basic Hebrew Calendar Implementation
// Capable of generating calendar data for any year (approximate logic for demonstration if full library unavailable)

export interface CalendarDay {
    day: number | null;
    isShabbat: boolean;
    festivals: string[];
    gregorianDate?: string;
    gregorianYear?: number;
}

export interface HebrewMonth {
    name: string;
    hebrew: string;
    days: number;
    startDayOfWeek: number; // 0=Sun, 6=Sat
    index: number;
}

// Hebrew Month Definitions
const MONTH_NAMES = [
    { name: 'Tishrei', hebrew: 'תִּשְׁרֵי' },
    { name: 'Cheshvan', hebrew: 'חֶשְׁוָן' },
    { name: 'Kislev', hebrew: 'כִּסְלֵו' },
    { name: 'Tevet', hebrew: 'טֵבֵת' },
    { name: 'Shevat', hebrew: 'שְׁבָט' },
    { name: 'Adar', hebrew: 'אֲדָר' }, // Regular Adar
    { name: 'Adar I', hebrew: 'אֲדָר א׳' }, // Leap Adar I
    { name: 'Adar II', hebrew: 'אֲדָר ב׳' }, // Leap Adar II
    { name: 'Nisan', hebrew: 'נִיסָן' },
    { name: 'Iyar', hebrew: 'אִייָר' },
    { name: 'Sivan', hebrew: 'סִיוָן' },
    { name: 'Tammuz', hebrew: 'תַּמּוּז' },
    { name: 'Av', hebrew: 'אָב' },
    { name: 'Elul', hebrew: 'אֱלוּל' },
];

// Helper to determine if a Hebrew year is a leap year (19-year cycle)
const isHebrewLeapYear = (year: number): boolean => {
    return ((year * 12 + 17) % 19) < 7;
}

// Calculate the number of days in a Hebrew year (simplified for UI purposes)
// Actual logic involves complex Molad calculations.
// We will use a reference point: 5786 starts on Tue, Sep 23, 2025.
// We will estimate the start of other years based on average lunar year length.
const getYearStartOffset = (year: number): Date => {
    // Reference: 5786 Tishrei 1 = Sep 23, 2025
    const refYear = 5786;
    const refDate = new Date(2025, 8, 23); // Sep 23

    // Average Hebrew year is 354.37 days (regular) or 383.9 (leap)
    // Roughly shifting by difference in years
    let diffDays = 0;

    if (year >= refYear) {
        for (let y = refYear; y < year; y++) {
            diffDays += isHebrewLeapYear(y) ? 384 : 354;
        }
    } else {
        for (let y = year; y < refYear; y++) {
            diffDays -= isHebrewLeapYear(y) ? 384 : 354;
        }
    }

    const startDate = new Date(refDate);
    startDate.setDate(startDate.getDate() + diffDays);
    return startDate;
}

const getNisan1StartOffset = (year: number): Date => {
    const refYear = 5786;
    const refDate = new Date(2026, 2, 19); // March 19, 2026

    let diffDays = 0;
    if (year >= refYear) {
        for (let y = refYear; y < year; y++) {
            diffDays += isHebrewLeapYear(y) ? 384 : 354;
        }
    } else {
        for (let y = year; y < refYear; y++) {
            diffDays -= isHebrewLeapYear(y) ? 384 : 354;
        }
    }

    const startDate = new Date(refDate);
    startDate.setDate(startDate.getDate() + diffDays);
    return startDate;
};

export const getCalendarData5786 = (year: number = 5786): any[] => {
    const isLeap = isHebrewLeapYear(year);
    const currentDate = getNisan1StartOffset(year);

    const monthsInYear = [
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
        ...(isLeap
            ? [{ name: 'Adar I', hebrew: 'אֲדָר א׳' }, { name: 'Adar II', hebrew: 'אֲדָר ב׳' }]
            : [{ name: 'Adar', hebrew: 'אֲדָר' }]
        )
    ];

    const getMonthLength = (mName: string) => {
        if (mName === 'Tishrei') return 30;
        if (mName === 'Cheshvan') return 29;
        if (mName === 'Kislev') return 30;
        if (mName === 'Tevet') return 29;
        if (mName === 'Shevat') return 30;
        if (mName === 'Adar') return 29;
        if (mName === 'Nisan') return 30;
        if (mName === 'Iyar') return 29;
        if (mName === 'Sivan') return 30;
        if (mName === 'Tammuz') return 29;
        if (mName === 'Av') return 30;
        if (mName === 'Elul') return 29;
        return 30;
    };

    return monthsInYear.map((m, idx) => {
        const daysCount = getMonthLength(m.name);
        const startDayOfWeek = currentDate.getDay(); // 0-6

        const weeks: CalendarDay[][] = [];
        let currentWeek: CalendarDay[] = Array(7).fill({ day: null, isShabbat: false, festivals: [] });

        // Fill initial empty days
        for (let i = 0; i < startDayOfWeek; i++) {
            currentWeek[i] = { day: null, isShabbat: false, festivals: [] };
        }

        for (let d = 1; d <= daysCount; d++) {
            const dayOfWeek = (startDayOfWeek + d - 1) % 7;
            const isShabbat = dayOfWeek === 6;

            const monthNameShort = currentDate.toLocaleString('default', { month: 'short' });
            const dayNum = currentDate.getDate();
            const gregorianDate = `${monthNameShort} ${dayNum}`;

            // Check festivals
            let festivals: string[] = [];

            if (m.name === 'Nisan' && (d === 15)) festivals.push("Pesach");
            if (m.name === 'Nisan' && (d === 21)) festivals.push("Pesach VII");
            if (m.name === 'Iyar' && (d === 14)) festivals.push("Pesach Sheni");
            if (m.name === 'Sivan' && d === 6) festivals.push("Shavuot");
            if (m.name === 'Tammuz' && d === 17) festivals.push("Fast of Tammuz");
            if (m.name === 'Av' && d === 9) festivals.push("Tisha B'Av");
            if (m.name === 'Elul' && d === 1) festivals.push("Elul 1");

            if (m.name === 'Tishrei') {
                if (d === 1 || d === 2) festivals.push("Rosh Hashanah");
                if (d === 10) festivals.push("Yom Kippur");
                if (d === 15) festivals.push("Sukkot");
                if (d === 22) festivals.push("Simchat Torah");
            }
            if (m.name === 'Kislev' && d === 25) festivals.push("Hanukkah");
            if (m.name === 'Shevat' && d === 15) festivals.push("Tu Bishvat");
            if (m.name === 'Adar' && d === 14) festivals.push("Purim");

            currentWeek[dayOfWeek] = {
                day: d,
                isShabbat,
                festivals,
                gregorianDate,
                gregorianYear: currentDate.getFullYear()
            };

            // Increment date for next loop
            currentDate.setDate(currentDate.getDate() + 1);

            if (dayOfWeek === 6 || d === daysCount) {
                weeks.push(currentWeek);
                currentWeek = Array(7).fill({ day: null, isShabbat: false, festivals: [] });
            }
        }

        return {
            name: m.name,
            hebrew: m.hebrew,
            days: daysCount,
            startDayOfWeek,
            index: idx,
            weeks
        };
    });
};

export interface HebrewDateInfo {
    hebrewYear: number;
    hebrewMonth: string;
    hebrewDay: number;
    festivals: string[];
}

export const getHebrewDateInfo = (gregorianDate: Date): HebrewDateInfo | null => {
    const gYear = gregorianDate.getFullYear();
    const candidateYears = [gYear + 3760, gYear + 3761];
    
    for (const hYear of candidateYears) {
        const months = getCalendarData5786(hYear);
        for (const month of months) {
            for (const week of month.weeks) {
                for (const day of week) {
                    if (day && day.day && day.gregorianYear === gYear) {
                        const [gMonStr, gDayStr] = day.gregorianDate.split(' ');
                        const gDayVal = parseInt(gDayStr, 10);
                        
                        const matchMonth = gregorianDate.toLocaleString('default', { month: 'short' }) === gMonStr;
                        const matchDay = gregorianDate.getDate() === gDayVal;
                        
                        if (matchMonth && matchDay) {
                            return {
                                hebrewYear: hYear,
                                hebrewMonth: month.name,
                                hebrewDay: day.day,
                                festivals: day.festivals
                            };
                        }
                    }
                }
            }
        }
    }
    return null;
};
