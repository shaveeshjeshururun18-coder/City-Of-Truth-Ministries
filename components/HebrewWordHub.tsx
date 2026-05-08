import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Type, BookOpen, Sparkles, Volume2, Play, Loader2, Info, Fingerprint, History, Trash2, ChevronDown, ChevronUp, Clock, Download, FileImage, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeHebrewWord } from '../services/openRouterService';
import { audioService } from '../services/audioService';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

// Gematria letter values
const gematriaValues: { [key: string]: number } = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
    'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
    'ך': 20, 'ם': 40, 'ן': 50, 'ף': 80, 'ץ': 90
};

interface HebrewWordInfo {
    word: string;
    pronunciation: string;
    pronunciationTa?: string; // Tamil Phonetics
    breakdownHe: string;       // Hebrew Syllables
    breakdownEn: string;       // English Syllables
    meaningEn: string;
    meaningTa: string;
    root?: string;             // Hebrew Root (Shoresh)
    description?: string;
}

const HEBREW_DICTIONARY: HebrewWordInfo[] = [
    { word: 'שלום', pronunciation: 'Shalom', pronunciationTa: 'ஷாலோம்', breakdownHe: 'ஷா-லோம்', breakdownEn: 'Sha-lom', meaningEn: 'Peace, Completeness, Welfare', meaningTa: 'சமாதானம், முழுமை, நலம்', root: 'שׁלם', description: 'One of the names of God; represents wholeness and harmony.' },
    { word: 'אהבה', pronunciation: 'Ahava', pronunciationTa: 'அஹவா', breakdownHe: 'அ-ஹ-வா', breakdownEn: 'A-ha-va', meaningEn: 'Love', meaningTa: 'அன்பு', root: 'אהב', description: 'Expresses selfless, divine love (Agape).' },
    { word: 'אמת', pronunciation: 'Emet', pronunciationTa: 'எமேத்', breakdownHe: 'எ-மேத்', breakdownEn: 'E-met', meaningEn: 'Truth', meaningTa: 'சத்தியம்', root: 'אמת', description: 'Composed of the first, middle, and last letters of the alphabet.' },
    { word: 'אמונה', pronunciation: 'Emunah', pronunciationTa: 'எமுனா', breakdownHe: 'எ-மு-னா', breakdownEn: 'E-mu-nah', meaningEn: 'Faith, Trust', meaningTa: 'விசுவாசம், நம்பிக்கை', root: 'אמן', description: 'Firmness and steadiness in one\'s relationship with God.' },
    { word: 'חסד', pronunciation: 'Chesed', pronunciationTa: 'ஹெஸட்', breakdownHe: 'ஹெ-ஸட்', breakdownEn: 'Che-sed', meaningEn: 'Grace, Loving-kindness', meaningTa: 'கிருபை, தயவு', root: 'חסד', description: 'Covenantal love and mercy.' },
    { word: 'ישועה', pronunciation: 'Yeshuah', pronunciationTa: 'யெஷுவா', breakdownHe: 'யெ-ஷு-வா', breakdownEn: 'Ye-shu-ah', meaningEn: 'Salvation, Deliverance', meaningTa: 'இரட்சிப்பு', root: 'ישע', description: 'God\'s saving power; the name Yeshua (Jesus) is derived from this.' },
    { word: 'הללויה', pronunciation: 'Hallelujah', pronunciationTa: 'ஹல்லேலூயா', breakdownHe: 'ஹல்-லே-லூ-யா', breakdownEn: 'Hal-le-lu-yah', meaningEn: 'Praise Ya (God)', meaningTa: 'கர்த்தரைத் துதியுங்கள்', root: 'הלל', description: 'Universal cry of praise to the Creator.' },
    { word: 'תורה', pronunciation: 'Torah', pronunciationTa: 'தோரா', breakdownHe: 'தோ-ரா', breakdownEn: 'To-rah', meaningEn: 'Law, Instruction, Guidance', meaningTa: 'வேதம், போதனை', root: 'ירה', description: 'The first five books of the Bible; Divine instruction for life.' },
    { word: 'מצוה', pronunciation: 'Mitzvah', pronunciationTa: 'மிட்ஸ்வா', breakdownHe: 'மிட்ஸ்-வா', breakdownEn: 'Mitz-vah', meaningEn: 'Commandment, Good Deed', meaningTa: 'கட்டளை, நற்செயல்', root: 'צוה', description: 'A religious duty or act of kindness.' },
    { word: 'אדוני', pronunciation: 'Adonai', pronunciationTa: 'அதோனாய்', breakdownHe: 'அ-தோ-נாய்', breakdownEn: 'A-do-nai', meaningEn: 'Lord, Master', meaningTa: 'கர்த்தர், ஆண்டவர்', root: 'אדן', description: 'The spoken title for the Tetra-grammaton (YHWH).' },
    { word: 'אלוהים', pronunciation: 'Elohim', pronunciationTa: 'எலோஹิம்', breakdownHe: 'எ-லோ-ஹிம்', breakdownEn: 'E-lo-him', meaningEn: 'God (Mighty One)', meaningTa: 'தேவன்', root: 'אלה', description: 'Signifies God\'s power and justice as Creator.' },
    { word: 'רוח', pronunciation: 'Ruach', pronunciationTa: 'ரூஆக்', breakdownHe: 'ரூ-ஆக்', breakdownEn: 'Ru-ach', meaningEn: 'Spirit, Breath, Wind', meaningTa: 'ஆவி, சுவாசம்', root: 'רוח', description: 'The animating force of God.' },
    { word: 'שמע', pronunciation: 'Shema', pronunciationTa: 'ஷெமா', breakdownHe: 'ஷெ-மா', breakdownEn: 'She-ma', meaningEn: 'Hear, Listen, Obey', meaningTa: 'கேளுங்கள், கீழ்ப்படியுங்கள்', root: 'שׁמע', description: 'The central prayer of Judaism: "Hear O Israel".' },
    { word: 'משיח', pronunciation: 'Mashiach', pronunciationTa: 'மஷியாக்', breakdownHe: 'ம-ஷி-யாக்', breakdownEn: 'Ma-shi-ach', meaningEn: 'Messiah, Anointed One', meaningTa: 'மேசியா, அபிஷேகம் பண்ணப்பட்டவர்', root: 'משׁח', description: 'The chosen king who will redeem the world.' },
    { word: 'קדוש', pronunciation: 'Kadosh', pronunciationTa: 'கதோஷ்', breakdownHe: 'க-தோஷ்', breakdownEn: 'Ka-dosh', meaningEn: 'Holy, Set Apart', meaningTa: 'பரிசுத்தம்', root: 'קדשׁ', description: 'Signifies utter purity and separation from the mundane.' },
    { word: 'נביא', pronunciation: 'Navi', pronunciationTa: 'நவி', breakdownHe: 'ந-வி', breakdownEn: 'Na-vi', meaningEn: 'Prophet, Spokesman', meaningTa: 'தீர்க்கதரிசி', root: 'נבא', description: 'One who brings words from God to the people.' },
    { word: 'מלך', pronunciation: 'Melekh', pronunciationTa: 'மெலெக்', breakdownHe: 'மெ-லெக்', breakdownEn: 'Me-lekh', meaningEn: 'King, Ruler', meaningTa: 'ராஜா', root: 'מלך', description: 'Symbolizes divine sovereignty.' },
    { word: 'ברית', pronunciation: 'Berit', pronunciationTa: 'பெரித்', breakdownHe: 'பெ-ரித்', breakdownEn: 'Be-rit', meaningEn: 'Covenant, Agreement', meaningTa: 'உடன்படிக்கை', root: 'ברה', description: 'A sacred, binding spiritual contract.' },
    { word: 'מקדש', pronunciation: 'Mikdash', pronunciationTa: 'மிக்்தாஷ்', breakdownHe: 'மிக்-தாஷ்', breakdownEn: 'Mik-dash', meaningEn: 'Sanctuary, Holy Place', meaningTa: 'பரிசுத்த ஸ்தலம்', root: 'קדשׁ', description: 'The earthly residence of God\'s presence.' },
    { word: 'כבוד', pronunciation: 'Kavod', pronunciationTa: 'கவோத்', breakdownHe: 'க-வோத்', breakdownEn: 'Ka-vod', meaningEn: 'Glory, Honor, Weight', meaningTa: 'மகிமை, கனம்', root: 'כבד', description: 'The heavy, visible presence of God.' },
    { word: 'חיים', pronunciation: 'Chayim', pronunciationTa: 'ஹயீம்', breakdownHe: 'ஹ-யீம்', breakdownEn: 'Cha-yim', meaningEn: 'Life', meaningTa: 'ஜீவன்', root: 'חיה', description: 'Plural form, signifying life in both this world and the world to come.' },
    { word: 'אור', pronunciation: 'Or', pronunciationTa: 'ஓர்', breakdownHe: 'ஓர்', breakdownEn: 'Or', meaningEn: 'Light', meaningTa: 'ஒளி', root: 'אור', description: 'The first creation; symbol of divine presence.' },
    { word: 'ברכה', pronunciation: 'Berakhah', pronunciationTa: 'பெரகா', breakdownHe: 'பெ-ர-கா', breakdownEn: 'Be-ra-khah', meaningEn: 'Blessing', meaningTa: 'ஆசீர்வாதம்', root: 'ברך', description: 'Divine abundance and favor.' },
    { word: 'חכمة', pronunciation: 'Chokhmah', pronunciationTa: 'ஹோக்மா', breakdownHe: 'ஹோக்-மா', breakdownEn: 'Chokh-mah', meaningEn: 'Wisdom', meaningTa: 'ஞானம்', root: 'חכם', description: 'The flash of intuitive insight or skill.' },
    { word: 'בינה', pronunciation: 'Binah', pronunciationTa: 'பினா', breakdownHe: 'பி-னா', breakdownEn: 'Bi-nah', meaningEn: 'Understanding', meaningTa: 'புத்தி', root: 'בין', description: 'Analytical reasoning and deduction.' },
    { word: 'דעת', pronunciation: 'Daat', pronunciationTa: 'தாத்', breakdownHe: 'தாத்', breakdownEn: 'Da-at', meaningEn: 'Knowledge', meaningTa: 'அறிவு', root: 'ידע', description: 'Intimate, experiential knowledge.' },
    { word: 'גבורה', pronunciation: 'Gevurah', pronunciationTa: 'கெவுரா', breakdownHe: 'கெ-வு-ரா', breakdownEn: 'Ge-vu-rah', meaningEn: 'Strength, Might', meaningTa: 'வல்லமை', root: 'גבר', description: 'God\'s power and restraint.' },
    { word: 'שבת', pronunciation: 'Shabbat', pronunciationTa: 'ஷபாத்', breakdownHe: 'ஷ-பாத்', breakdownEn: 'Shab-bat', meaningEn: 'Sabbath, Rest', meaningTa: 'ஓய்வுநாள்', root: 'שׁבת', description: 'The day of cessation and spiritual restoration.' },
    { word: 'פסח', pronunciation: 'Pesach', pronunciationTa: 'பெசாக்', breakdownHe: 'பெ-சாக்', breakdownEn: 'Pe-sach', meaningEn: 'Passover', meaningTa: 'பஸ்கா', root: 'פסח', description: 'The festival of liberation and redemption.' },
    { word: 'סוכות', pronunciation: 'Sukkot', pronunciationTa: 'சுக்கோத்', breakdownHe: 'சு-க்கோத்', breakdownEn: 'Suk-kot', meaningEn: 'Tabernacles, Booths', meaningTa: 'கூடாரப்பண்டிகை', root: 'סכך', description: 'The festival of temporary dwellings and harvest joy.' },
    { word: 'חנוכה', pronunciation: 'Hanukkah', pronunciationTa: 'ஹனுக்கா', breakdownHe: 'ஹ-னு-க்கா', breakdownEn: 'Ha-nuk-kah', meaningEn: 'Dedication', meaningTa: 'பிரதிஷ்டை', root: 'חנך', description: 'The festival of lights and rededication of the Temple.' },
    { word: 'ירושלים', pronunciation: 'Yerushalayim', pronunciationTa: 'யெருஷலாயிம்', breakdownHe: 'யெ-ரு-ஷ-லா-யிம்', breakdownEn: 'Ye-ru-sha-la-yim', meaningEn: 'Jerusalem', meaningTa: 'எருசலேம்', root: 'שׁלם', description: 'City of Peace and God\'s dwelling.' },
    { word: 'ישראל', pronunciation: 'Yisrael', pronunciationTa: 'யிஸ்த்ராயெல்', breakdownHe: 'யிஸ்த்-ரா-யெல்', breakdownEn: 'Yis-ra-el', meaningEn: 'Israel', meaningTa: 'இஸ்ரவேல்', root: 'שׂרה', description: 'The one who prevails with God.' },
    { word: 'אמן', pronunciation: 'Amen', pronunciationTa: 'ஆமென்', breakdownHe: 'ஆ-மென்', breakdownEn: 'A-men', meaningEn: 'Truly, So be it', meaningTa: 'ஆமென்', root: 'אמן', description: 'Affirmation of truth and faithfulness.' },
    { word: 'צדקה', pronunciation: 'Tzedakah', pronunciationTa: 'செதக்கா', breakdownHe: 'செ-த-க்கா', breakdownEn: 'Tze-da-kah', meaningEn: 'Charity, Justice', meaningTa: 'தர்மம், நீதி', root: 'צדק', description: 'Doing what is right through giving.' },
    { word: 'רחמים', pronunciation: 'Rachamim', pronunciationTa: 'ரஹமீம்', breakdownHe: 'ர-ஹ-மீம்', breakdownEn: 'Ra-cha-mim', meaningEn: 'Mercy, Compassion', meaningTa: 'இரக்கம்', root: 'רחם', description: 'The womb-like compassion of God.' },
    { word: 'יום', pronunciation: 'Yom', pronunciationTa: 'யோம்', breakdownHe: 'யோம்', breakdownEn: 'Yom', meaningEn: 'Day', meaningTa: 'நாள்', root: 'יום', description: 'A period of light or a specific time of God\'s action.' },
    { word: 'מים', pronunciation: 'Mayim', pronunciationTa: 'மயீம்', breakdownHe: 'ம-யீம்', breakdownEn: 'Ma-yim', meaningEn: 'Water', meaningTa: 'தண்ணீர்', root: 'מים', description: 'Symbol of life, Torah, and cleansing.' },
    { word: 'אדם', pronunciation: 'Adam', pronunciationTa: 'ஆதாம்', breakdownHe: 'ஆ-தாம்', breakdownEn: 'A-dam', meaningEn: 'Man, Mankind', meaningTa: 'ஆதாம், மனிதன்', root: 'אדם', description: 'Connected to the earth (Adamah) from which he was formed.' },
    { word: 'ארץ', pronunciation: 'Eretz', pronunciationTa: 'எரெட்ஸ்', breakdownHe: 'எ-ரெட்ஸ்', breakdownEn: 'E-retz', meaningEn: 'Earth, Land', meaningTa: 'பூமி, தேசம்', root: 'ארץ', description: 'Often refers specifically to the Promised Land.' },
    { word: 'שמים', pronunciation: 'Shamayim', pronunciationTa: 'ஷமாயீம்', breakdownHe: 'ஷ-மா-யீம்', breakdownEn: 'Sha-ma-yim', meaningEn: 'Heavens, Sky', meaningTa: 'பரலோகம், வானம்', root: 'שׁמה', description: 'The dwelling place of God and the celestial realm.' },
    { word: 'תפילה', pronunciation: 'Tefillah', pronunciationTa: 'தெஃபిల్లా', breakdownHe: 'தெ-ஃபில்-லா', breakdownEn: 'Te-fil-lah', meaningEn: 'Prayer', meaningTa: 'ஜெபம்', root: 'פלל', description: 'Self-judgment and connection with the Divine.' },
    { word: 'תודה', pronunciation: 'Todah', pronunciationTa: 'தோதா', breakdownHe: 'தோ-தா', breakdownEn: 'To-dah', meaningEn: 'Thanks, Gratitude', meaningTa: 'நன்றி', root: 'ידה', description: 'The sacrifice of thanksgiving.' },
    { word: 'משפחה', pronunciation: 'Mishpachah', pronunciationTa: 'மிஷ்பக்கா', breakdownHe: 'மிஷ்-ப-க்கா', breakdownEn: 'Mish-pa-chah', meaningEn: 'Family, Clan', meaningTa: 'குடும்பம்', root: 'שׁפח', description: 'The fundamental unit of community and continuity.' },
    { word: 'תקוה', pronunciation: 'Tikvah', pronunciationTa: 'திக்வா', breakdownHe: 'திக்-வா', breakdownEn: 'Tik-vah', meaningEn: 'Hope, Expectation', meaningTa: 'நம்பிக்கை', root: 'קוה', description: 'Waiting expectantly for God\'s intervention.' },
    { word: 'שמחה', pronunciation: 'Simcha', pronunciationTa: 'ஸிம்கா', breakdownHe: 'ஸிம்-கா', breakdownEn: 'Sim-cha', meaningEn: 'Joy, Rejoicing', meaningTa: 'சந்தோஷம்', root: 'שׂמח', description: 'The inner gladness that comes from God\'s presence.' },
    { word: 'בית', pronunciation: 'Bayit', pronunciationTa: 'பயித்', breakdownHe: 'ப-யித்', breakdownEn: 'Ba-yit', meaningEn: 'House, Home', meaningTa: 'வீடு', root: 'בית', description: 'The inner space of life and family.' }
];

const calculateGematria = (word: string): number => {
    return word.split('').reduce((total, char) => total + (gematriaValues[char] || 0), 0);
};

interface HistoryEntry {
    word: string;
    pronunciation: string;
    meaningEn: string;
    meaningTa: string;
    gematria: number;
    timestamp: string; // ISO string
}

const HISTORY_KEY = 'cot_hebrew_word_history';
const MAX_HISTORY = 50;

const COT_PHONE = '+91 8056125478';
const COT_WEBSITE = 'https://city-of-truth-ministries.vercel.app';
const COT_LOCATION = 'Valparai, Tamil Nadu, India';

const sanitizeFilename = (text: string): string =>
    text
        .replace(/[^a-zA-Z0-9\-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'word';

export const HebrewWordHub: React.FC = () => {
    const [wordInput, setWordInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<HebrewWordInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [wordHistory, setWordHistory] = useState<HistoryEntry[]>(() => {
        try {
            const saved = localStorage.getItem(HISTORY_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [showHistory, setShowHistory] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const exportCardRef = useRef<HTMLDivElement>(null);

    const currentGematria = useMemo(() => calculateGematria(wordInput), [wordInput]);

    const wordDetails = useMemo(() => {
        const clean = wordInput.trim().replace(/[ְֱֲֳִֵֶַָֹֺֻּׁׂ]/g, '');
        const dictMatch = HEBREW_DICTIONARY.find(d => d.word === clean);
        if (dictMatch) return dictMatch;
        if (aiResult && aiResult.word === wordInput.trim()) return aiResult;
        return null;
    }, [wordInput, aiResult]);

    const handleDeepAnalysis = async () => {
        if (!wordInput.trim()) return;
        setIsAnalyzing(true);
        setError(null);
        try {
            const result = await analyzeHebrewWord(wordInput);
            setAiResult({
                ...result,
                word: wordInput.trim()
            });
        } catch (err) {
            setError('Could not connect to the Deep Insight service. Please try again.');
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const filteredDictionary = useMemo(() => {
        if (!searchQuery) return HEBREW_DICTIONARY;
        const low = searchQuery.toLowerCase();
        return HEBREW_DICTIONARY.filter(d =>
            d.word.includes(searchQuery) ||
            d.meaningEn.toLowerCase().includes(low) ||
            d.meaningTa.includes(searchQuery) ||
            d.pronunciation.toLowerCase().includes(low)
        );
    }, [searchQuery]);

    const playAudio = (text: string) => {
        audioService.playHebrew(text);
    };

    // Persist history to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(wordHistory));
        } catch { /* ignore quota errors */ }
    }, [wordHistory]);

    // Add to history whenever a word resolves to full details
    useEffect(() => {
        if (!wordDetails) return;
        const entry: HistoryEntry = {
            word: wordDetails.word,
            pronunciation: wordDetails.pronunciation,
            meaningEn: wordDetails.meaningEn,
            meaningTa: wordDetails.meaningTa,
            gematria: calculateGematria(wordDetails.word),
            timestamp: new Date().toISOString(),
        };
        setWordHistory(prev => {
            // Don't add duplicate back-to-back entries for the same word
            if (prev[0]?.word === entry.word) return prev;
            return [entry, ...prev].slice(0, MAX_HISTORY);
        });
    // Use the full memoized wordDetails object as the dependency so that a change
    // to any property of the same word is also captured correctly.
    }, [wordDetails]);

    const clearHistory = () => {
        setWordHistory([]);
        localStorage.removeItem(HISTORY_KEY);
    };

    const deleteHistoryEntry = (timestamp: string) => {
        setWordHistory(prev => prev.filter(e => e.timestamp !== timestamp));
    };

    const handleExport = async (format: 'pdf' | 'jpeg') => {
        if (!wordDetails || !exportCardRef.current) return;
        setIsExporting(true);
        try {
            if ('fonts' in document) {
                await (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
            }
            await new Promise(resolve => setTimeout(resolve, 120));
            const dataUrl = await toJpeg(exportCardRef.current, {
                quality: 0.97,
                pixelRatio: 3,
                backgroundColor: '#ffffff',
                cacheBust: true,
            });
            const filename = `COT-Hebrew-${sanitizeFilename(wordDetails.pronunciation)}`;
            if (format === 'jpeg') {
                const link = document.createElement('a');
                link.download = `${filename}.jpg`;
                link.href = dataUrl;
                link.click();
            } else {
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                const pdfW = pdf.internal.pageSize.getWidth();
                const img = new Image();
                img.src = dataUrl;
                await new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = () => reject(new Error('Failed to load export image'));
                });
                const pdfH = (img.height * pdfW) / img.width;
                const pageH = pdf.internal.pageSize.getHeight();
                pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfW, Math.min(pdfH, pageH));
                pdf.save(`${filename}.pdf`);
            }
        } catch (err) {
            console.error('Export failed:', err);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const loadFromHistory = (entry: HistoryEntry) => {
        setWordInput(entry.word);
        setAiResult(null);
        setShowHistory(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-10 py-4 md:py-8">
            {/* Header */}
            <div className="text-center space-y-3">
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-brand-950 px-2">
                    Hebrew <span className="text-accent-600">Word Study</span>
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-slate-500 font-light max-w-2xl mx-auto px-4">
                    Enter any Hebrew word for Gematria, pronunciation, and Deep AI Insight. Discover spiritual meanings for any word in the entire Hebrew language.
                </p>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-50 rounded-bl-full -mr-24 -mt-24 opacity-50 z-0"></div>

                <div className="relative z-10 flex flex-col lg:flex-row gap-6 md:gap-10">
                    {/* Left Section */}
                    <div className="flex-[1.5] min-w-0 space-y-6">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Type size={14} className="text-brand-500" /> Enter Hebrew Word
                            </label>
                            <input
                                dir="rtl"
                                type="text"
                                value={wordInput}
                                onChange={(e) => {
                                    setWordInput(e.target.value);
                                    if (aiResult && aiResult.word !== e.target.value) setAiResult(null);
                                }}
                                placeholder="e.g. שלום"
                                className="w-full text-4xl sm:text-5xl md:text-6xl font-serif bg-transparent border-b-2 border-slate-100 py-4 outline-none focus:border-brand-500 transition-all text-brand-950 placeholder:text-slate-100 text-right"
                            />
                        </div>

                        <AnimatePresence>
                            {wordInput && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Numerical Breakdown</div>
                                        <div className="flex gap-2 flex-wrap">
                                            <button
                                                onClick={() => playAudio(wordInput)}
                                                className="px-3 py-2 bg-brand-50 text-brand-900 rounded-full flex items-center gap-2 text-xs font-bold hover:bg-brand-100 transition-all active:scale-95"
                                            >
                                                <Volume2 size={14} /> Listen
                                            </button>
                                            {!wordDetails && (
                                                <button
                                                    onClick={handleDeepAnalysis}
                                                    disabled={isAnalyzing}
                                                    className="px-3 py-2 bg-accent-500 text-brand-950 rounded-full flex items-center gap-2 text-xs font-bold hover:bg-accent-400 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                                >
                                                    {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                                    Deep Insight
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center justify-start overflow-x-auto no-scrollbar py-1">
                                        {wordInput.split('').filter(ch => gematriaValues[ch]).map((ch, i) => (
                                            <React.Fragment key={i}>
                                                <div className="flex flex-col items-center bg-brand-50 border border-brand-100 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 min-w-[52px] sm:min-w-[62px] shadow-sm">
                                                    <span className="text-2xl sm:text-3xl font-serif text-brand-950 leading-none">{ch}</span>
                                                    <span className="text-xs font-bold text-accent-600 mt-1">{gematriaValues[ch]}</span>
                                                </div>
                                                {i < wordInput.split('').filter(ch => gematriaValues[ch]).length - 1 && (
                                                    <span className="text-slate-200 text-lg font-light">＋</span>
                                                )}
                                            </React.Fragment>
                                        ))}
                                        <span className="text-slate-200 text-lg font-light mx-1">＝</span>
                                        <div className="flex flex-col items-center bg-accent-500 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 min-w-[58px] sm:min-w-[70px] shadow-lg">
                                            <span className="text-[9px] font-bold text-brand-950 uppercase tracking-widest mb-0.5">Total</span>
                                            <span className="text-2xl sm:text-3xl font-black text-brand-950">{currentGematria}</span>
                                        </div>
                                    </div>
                                    {error && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">
                                            <Info size={14} /> {error}
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Section */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            {wordInput ? (
                                wordDetails ? (
                                    <motion.div
                                        key={wordDetails.word}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-slate-950 text-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-7 md:p-8 flex flex-col space-y-5 shadow-2xl relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="space-y-1 min-w-0">
                                                <div className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em]">Pronunciation</div>
                                                <div className="text-xl sm:text-2xl font-black flex items-center gap-2 text-white flex-wrap">
                                                    <span className="break-words">{wordDetails.pronunciation}</span>
                                                    <button onClick={() => playAudio(wordDetails.word)} className="shrink-0 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-accent-400">
                                                        <Volume2 size={16} />
                                                    </button>
                                                </div>
                                                {wordDetails.pronunciationTa && (
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        <div className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                                            <div className="w-4 h-[1px] bg-slate-700" />
                                                            {wordDetails.pronunciationTa} (தமிழ்)
                                                        </div>
                                                        <button 
                                                            onClick={() => audioService.playTamil(wordDetails.pronunciationTa!)} 
                                                            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-accent-500"
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

                                        {/* Root Word (Shoresh) Section */}
                                        {wordDetails.root && (
                                            <div className="relative group/root cursor-default">
                                                <div className="absolute inset-0 bg-accent-500/10 blur-2xl opacity-0 group-hover/root:opacity-100 transition-opacity duration-700"></div>
                                                <div className="relative bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3 group-hover/root:border-accent-500/30 transition-all">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="shrink-0 w-7 h-7 bg-accent-500/20 rounded-lg flex items-center justify-center text-accent-400">
                                                            <Fingerprint size={14} />
                                                        </div>
                                                        <div className="space-y-0.5 min-w-0">
                                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Shoresh (Hebrew Root)</div>
                                                            <div className="text-xs text-brand-400 font-bold">The spiritual foundation</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-2xl sm:text-3xl font-serif text-accent-400 tracking-[0.2em] shrink-0" dir="rtl">
                                                        {wordDetails.root}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3 py-4 border-y border-white/10">
                                            <div className="space-y-1.5">
                                                <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Hebrew Syllables</div>
                                                <div className="text-sm sm:text-base font-serif tracking-widest text-white/90 break-words" dir="rtl">{wordDetails.breakdownHe}</div>
                                            </div>
                                            <div className="space-y-1.5 border-l border-white/10 pl-3">
                                                <div className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em]">English Splitting</div>
                                                <div className="text-sm sm:text-base font-mono font-bold text-accent-200 tracking-tight break-words">{wordDetails.breakdownEn}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <div className="text-xs font-bold text-amber-500 uppercase tracking-widest">English Meaning</div>
                                                <div className="text-base sm:text-lg font-serif leading-relaxed text-slate-100 break-words">{wordDetails.meaningEn}</div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="text-xs font-bold text-brand-400 uppercase tracking-widest">Tamil Meaning (தமிழ்)</div>
                                                <div className="text-lg sm:text-xl font-serif leading-relaxed text-slate-100 break-words">{wordDetails.meaningTa}</div>
                                            </div>
                                        </div>

                                        {wordDetails.description && (
                                            <div className="pt-4 border-t border-white/5 italic text-[11px] text-slate-500 font-light leading-relaxed break-words">
                                                {wordDetails.description}
                                            </div>
                                        )}

                                        {/* Export Buttons */}
                                        <div className="pt-4 border-t border-white/10 flex gap-2 flex-wrap">
                                            <button
                                                onClick={() => handleExport('pdf')}
                                                disabled={isExporting}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-accent-500 hover:bg-accent-400 text-brand-950 rounded-xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                {isExporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                                                Export PDF
                                            </button>
                                            <button
                                                onClick={() => handleExport('jpeg')}
                                                disabled={isExporting}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                {isExporting ? <Loader2 size={13} className="animate-spin" /> : <FileImage size={13} />}
                                                Save Image
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-5"
                                    >
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl sm:rounded-3xl shadow-sm flex items-center justify-center text-brand-600 border border-slate-100">
                                            {isAnalyzing ? <Loader2 size={36} className="animate-spin" /> : <Sparkles size={36} />}
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                                                {isAnalyzing ? 'Analyzing Word...' : 'General Hebrew Word'}
                                            </h3>
                                            <p className="text-sm text-slate-500 leading-relaxed max-w-[220px]">
                                                {isAnalyzing ? 'Our AI is searching through ancient texts for deep meanings...' : 'Gematria and pronunciation for this word are active. Get deep AI insights for any word.'}
                                            </p>
                                        </div>
                                        {!isAnalyzing && (
                                            <button
                                                onClick={handleDeepAnalysis}
                                                className="w-full bg-brand-950 text-white rounded-xl sm:rounded-2xl py-3 sm:py-4 font-bold text-sm hover:bg-brand-900 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Sparkles size={16} className="text-accent-400" />
                                                Deep Insight with AI
                                            </button>
                                        )}
                                        <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm w-full">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gematria Value</div>
                                            <div className="text-2xl sm:text-3xl font-black text-brand-950">{currentGematria}</div>
                                        </div>
                                    </motion.div>
                                )
                            ) : (
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl sm:rounded-3xl shadow-sm flex items-center justify-center text-slate-200">
                                        <BookOpen size={36} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-slate-800">Sacred Dictionary</h3>
                                        <p className="text-sm text-slate-400">Enter a word on the left or select from the dictionary below to see details.</p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* History Panel */}
            {wordHistory.length > 0 && (
                <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    {/* Collapsible Header */}
                    <button
                        onClick={() => setShowHistory(v => !v)}
                        className="w-full flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-brand-50 rounded-xl text-brand-600">
                                <History size={18} />
                            </span>
                            <div className="text-left">
                                <h3 className="font-bold text-brand-950 text-base">Word History</h3>
                                <p className="text-xs text-slate-400">{wordHistory.length} word{wordHistory.length !== 1 ? 's' : ''} studied</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={(e) => { e.stopPropagation(); clearHistory(); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                title="Clear history"
                            >
                                <Trash2 size={13} /> Clear
                            </button>
                            {showHistory ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                        </div>
                    </button>

                    <AnimatePresence>
                        {showHistory && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                            >
                                <div className="px-3 sm:px-6 pb-4 sm:pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-h-[420px] overflow-y-auto">
                                    {wordHistory.map((entry, i) => (
                                        <motion.div
                                            key={`${entry.word}-${entry.timestamp}`}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="relative group/card"
                                        >
                                            <button
                                                onClick={() => loadFromHistory(entry)}
                                                className="flex items-center gap-3 bg-slate-50 hover:bg-brand-50 border border-slate-100 hover:border-brand-200 rounded-xl sm:rounded-2xl p-3 text-left transition-all group w-full"
                                            >
                                                {/* Hebrew word badge */}
                                                <div className="shrink-0 w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center group-hover:bg-brand-600 transition-colors">
                                                    <span className="text-xl font-serif text-brand-950 group-hover:text-white transition-colors" dir="rtl">
                                                        {entry.word}
                                                    </span>
                                                </div>
                                                {/* Details */}
                                                <div className="min-w-0 flex-1 pr-6">
                                                    <div className="font-bold text-slate-800 text-sm truncate">{entry.pronunciation}</div>
                                                    <div className="text-xs text-slate-500 truncate">{entry.meaningEn}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-bold text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full">
                                                            ג {entry.gematria}
                                                        </span>
                                                        <span
                                                            className="text-[10px] text-slate-400 flex items-center gap-1"
                                                            title={new Date(entry.timestamp).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        >
                                                            <Clock size={9} />
                                                            {new Date(entry.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                            {/* Per-entry delete button */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteHistoryEntry(entry.timestamp); }}
                                                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover/card:opacity-100 transition-all z-10"
                                                title="Remove this entry"
                                            >
                                                <X size={11} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Dictionary explorer */}
            <div className="space-y-6 sm:space-y-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1">
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-brand-950 flex items-center gap-3">
                        <span className="p-2 bg-brand-50 rounded-lg text-brand-600"><Search size={18} /></span>
                        Learn Biblical Vocabulary
                    </h3>
                    <div className="relative w-full sm:w-72 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Find word in Heb/En/Ta..."
                            className="w-full pl-11 pr-5 py-2.5 bg-white border border-slate-200 rounded-full outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-sm shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredDictionary.map((word, i) => (
                        <motion.button
                            key={i}
                            layout
                            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                            onClick={() => {
                                setWordInput(word.word);
                                playAudio(word.word);
                            }}
                            className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-[2rem] border border-slate-100 text-right group transition-all h-full flex flex-col shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-4 w-full">
                                <div className="p-1.5 bg-brand-50 rounded-xl text-brand-600 opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                                    <Play size={10} fill="currentColor" /> Study
                                </div>
                                <div className="text-3xl sm:text-4xl font-serif text-brand-950 group-hover:text-brand-600 transition-colors uppercase">{word.word}</div>
                            </div>
                            <div className="space-y-3 w-full">
                                <div className="pb-3 border-b border-slate-50">
                                    <div className="text-base font-bold text-slate-800">{word.pronunciation}</div>
                                    <div className="text-xs font-bold text-accent-600/60 uppercase tracking-widest mt-0.5">Gematria: {calculateGematria(word.word)}</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex flex-col items-end gap-0.5">
                                        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Meaning</div>
                                        <div className="text-sm text-slate-600 leading-tight line-clamp-2">{word.meaningEn}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-0.5">
                                        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Tamil (தமிழ்)</div>
                                        <div className="text-sm text-brand-700 font-medium leading-tight">{word.meaningTa}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {filteredDictionary.length === 0 && (
                    <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-2xl sm:rounded-[2rem] border border-dashed border-slate-200">
                        No words found matching "{searchQuery}"
                    </div>
                )}
            </div>

            {/* Hidden export card — rendered off-screen, captured via html-to-image */}
            {wordDetails && (
                <div
                    ref={exportCardRef}
                    style={{ position: 'fixed', left: '-9999px', top: 0, width: '800px', pointerEvents: 'none', zIndex: -1 }}
                >
                    <div style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1450 50%, #0f0c29 100%)', padding: '48px', fontFamily: 'Georgia, serif', color: '#ffffff', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                        {/* Subtle grid background */}
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
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '3px' }}>Hebrew Word Study</div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>AI Deep Insight</div>
                            </div>
                        </div>

                        {/* Hebrew word hero */}
                        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                            <div style={{ fontSize: '96px', fontWeight: 900, color: '#f0c040', letterSpacing: '0.08em', lineHeight: 1.1, direction: 'rtl', marginBottom: '8px' }}>{wordDetails.word}</div>
                            <div style={{ fontSize: '30px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.04em' }}>{wordDetails.pronunciation}</div>
                            {wordDetails.pronunciationTa && (
                                <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>{wordDetails.pronunciationTa} (தமிழ்)</div>
                            )}
                        </div>

                        {/* Gematria badge */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                            <div style={{ background: 'rgba(240,192,64,0.15)', border: '1px solid rgba(240,192,64,0.3)', borderRadius: '40px', padding: '10px 32px', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <span style={{ fontSize: '9px', fontWeight: 900, color: '#f0c040', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Gematria Value</span>
                                <span style={{ fontSize: '36px', fontWeight: 900, color: '#f0c040' }}>{calculateGematria(wordDetails.word)}</span>
                            </div>
                        </div>

                        {/* Root + syllables row */}
                        <div style={{ display: 'grid', gridTemplateColumns: wordDetails.root ? '1fr 1fr 1fr' : '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                            {wordDetails.root && (
                                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '8px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}>Shoresh (Root)</div>
                                    <div style={{ fontSize: '26px', color: '#a78bfa', direction: 'rtl', fontWeight: 700 }}>{wordDetails.root}</div>
                                </div>
                            )}
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '8px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}>Hebrew Syllables</div>
                                <div style={{ fontSize: '15px', color: '#fde68a', direction: 'rtl', fontWeight: 600 }}>{wordDetails.breakdownHe}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '8px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}>English Syllables</div>
                                <div style={{ fontSize: '15px', color: '#93c5fd', fontWeight: 700, fontFamily: 'monospace' }}>{wordDetails.breakdownEn}</div>
                            </div>
                        </div>

                        {/* Meaning grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '18px' }}>
                                <div style={{ fontSize: '8px', fontWeight: 900, color: '#f59e0b', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>English Meaning</div>
                                <div style={{ fontSize: '18px', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.45 }}>{wordDetails.meaningEn}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '18px' }}>
                                <div style={{ fontSize: '8px', fontWeight: 900, color: '#60a5fa', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>Tamil Meaning</div>
                                <div style={{ fontSize: '18px', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.45 }}>{wordDetails.meaningTa}</div>
                            </div>
                        </div>

                        {/* Spiritual insight */}
                        {wordDetails.description && (
                            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px 20px', marginBottom: '28px', borderLeft: '3px solid rgba(240,192,64,0.45)' }}>
                                <div style={{ fontSize: '12px', fontStyle: 'italic', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75 }}>{wordDetails.description}</div>
                            </div>
                        )}

                        {/* Footer */}
                        <div style={{ paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                                    <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>City of Truth Ministries</span> — {COT_LOCATION}
                                </div>
                                <div style={{ display: 'flex', gap: '18px', fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>
                                    <span>📞 {COT_PHONE}</span>
                                    <span>🌐 {COT_WEBSITE}</span>
                                </div>
                            </div>
                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', letterSpacing: '0.05em' }}>
                                © {new Date().getFullYear()} City of Truth Ministries · All rights reserved · Hebrew Word Study · AI Deep Insight
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
