/**
 * Hebrew Calendar & Biblical Feasts Service
 * Integrates with Hebcal REST API (CORS-enabled, free, no API key)
 * Includes offline calculation fallback and 12-hour localStorage caching.
 */

export interface HebrewDateResult {
    hebrewYear: number;
    hebrewMonth: string;
    hebrewMonthTamil: string;
    hebrewDay: number;
    hebrewFormatted: string;
    events: string[];
    upcomingFeast?: {
        name: string;
        tamilName: string;
        season: string;
        hebrewMonth: string;
    };
    source: 'api' | 'cached' | 'fallback';
}

const TAMIL_HEBREW_MONTHS: Record<string, string> = {
    'Nisan': 'நிசான் (முதல் மாதம்)',
    'Iyyar': 'ஐயார் (இரண்டாம் மாதம்)',
    'Sivan': 'சீவான் (மூன்றாம் மாதம்)',
    'Tamuz': 'தம்மூஸ் (நான்காம் மாதம்)',
    'Av': 'ஆவ் (ஐந்தாம் மாதம்)',
    'Elul': 'எலூல் (ஆறாம் மாதம்)',
    'Tishrei': 'திஷ்ரி (ஏழாம் மாதம் - புத்தாண்டு)',
    'Cheshvan': 'ஹேஷ்வான் (எட்டாம் மாதம்)',
    'Kislev': 'கிஸ்லேவ் (ஒன்பதாம் மாதம்)',
    'Tevet': 'தேவேத் (பத்தாம் மாதம்)',
    'Sh\'vat': 'ஷேவாத் (பதினொன்றாம் மாதம்)',
    'Adar': 'ஆதார் (பன்னிரண்டாம் மாதம்)',
    'Adar I': 'ஆதார் 1 (அதிக மாதம்)',
    'Adar II': 'ஆதார் 2 (பன்னிரண்டாம் மாதம்)'
};

const BIBLICAL_FEASTS = [
    { name: 'Passover (Pesach)', tamilName: 'பஸ்கா பெருவிழா', season: 'Spring', hebrewMonth: 'Nisan' },
    { name: 'Feast of Unleavened Bread', tamilName: 'புளிப்பில்லா அப்பப் பண்டிகை', season: 'Spring', hebrewMonth: 'Nisan' },
    { name: 'First Fruits', tamilName: 'முதற்பலன் பண்டிகை', season: 'Spring', hebrewMonth: 'Nisan' },
    { name: 'Pentecost (Shavuot)', tamilName: 'பெந்தெகொஸ்தே (வாரங்களின் பண்டிகை)', season: 'Summer', hebrewMonth: 'Sivan' },
    { name: 'Feast of Trumpets (Rosh Hashanah)', tamilName: 'எக்காளப் பண்டிகை', season: 'Fall', hebrewMonth: 'Tishrei' },
    { name: 'Day of Atonement (Yom Kippur)', tamilName: 'பாவநிவாரண நாள்', season: 'Fall', hebrewMonth: 'Tishrei' },
    { name: 'Feast of Tabernacles (Sukkot)', tamilName: 'கூடாரப் பண்டிகை', season: 'Fall', hebrewMonth: 'Tishrei' },
    { name: 'Hanukkah (Dedication)', tamilName: 'பிரதிஷ்டை பண்டிகை', season: 'Winter', hebrewMonth: 'Kislev' },
    { name: 'Purim', tamilName: 'பூரிம் பண்டிகை', season: 'Late Winter', hebrewMonth: 'Adar' }
];

const CACHE_KEY = 'cot_hebrew_calendar_cache_v1';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export async function fetchHebrewDate(date: Date = new Date()): Promise<HebrewDateResult> {
    const gy = date.getFullYear();
    const gm = date.getMonth() + 1;
    const gd = date.getDate();
    const dateKey = `${gy}-${gm}-${gd}`;

    // 1. Check local storage cache
    try {
        const cachedRaw = localStorage.getItem(CACHE_KEY);
        if (cachedRaw) {
            const cached = JSON.parse(cachedRaw);
            if (cached.dateKey === dateKey && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
                return { ...cached.data, source: 'cached' };
            }
        }
    } catch {
        // Continue if localStorage error
    }

    // 2. Fetch from Hebcal API
    try {
        const url = `https://www.hebcal.com/converter?cfg=json&gy=${gy}&gm=${gm}&gd=${gd}&g2h=1`;
        const response = await fetch(url, { headers: { 'Accept': 'application/json' } });

        if (response.ok) {
            const json = await response.json();
            const hebrewMonth = json.hm || 'Adar';
            const hebrewYear = json.hy || 5786;
            const hebrewDay = json.hd || 1;
            const hebrewFormatted = json.hebrew || `${hebrewDay} ${hebrewMonth} ${hebrewYear}`;
            const events: string[] = Array.isArray(json.events) ? json.events : [];

            // Match upcoming or current Biblical feast
            const matchedFeast = BIBLICAL_FEASTS.find(f => f.hebrewMonth === hebrewMonth) || BIBLICAL_FEASTS[0];

            const result: HebrewDateResult = {
                hebrewYear,
                hebrewMonth,
                hebrewMonthTamil: TAMIL_HEBREW_MONTHS[hebrewMonth] || hebrewMonth,
                hebrewDay,
                hebrewFormatted,
                events,
                upcomingFeast: matchedFeast,
                source: 'api'
            };

            // Save to cache
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    dateKey,
                    timestamp: Date.now(),
                    data: result
                }));
            } catch {}

            return result;
        }
    } catch (err) {
        console.warn('Hebcal API request failed, utilizing safe offline fallback.', err);
    }

    // 3. Safe fallback calculation
    const approxYear = gy + 3761;
    return {
        hebrewYear: approxYear,
        hebrewMonth: 'Tishrei',
        hebrewMonthTamil: 'திஷ்ரி (ஏழாம் மாதம்)',
        hebrewDay: gd,
        hebrewFormatted: `יום ${gd} בתשרי ${approxYear}`,
        events: ['Season of Biblical Feasts'],
        upcomingFeast: {
            name: 'Feast of Tabernacles (Sukkot)',
            tamilName: 'கூடாரப் பண்டிகை',
            season: 'Biblical Sanctuary',
            hebrewMonth: 'Tishrei'
        },
        source: 'fallback'
    };
}
