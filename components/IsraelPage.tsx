import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, MapPin, Sparkles, Scroll, Landmark, History, Compass, ArrowRight, Volume2, ShieldCheck, Heart, Download, Loader2 } from 'lucide-react';
import { audioService } from '../services/audioService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PeelingStackCards, PeelingCardItem } from './ui/peeling-stack-cards';

interface RegionData {
    id: string;
    name: string;
    hebrew: string;
    tamilName: string;
    color: string;
    coordinates: string; // SVG Path
    description: string;
    tamilDesc: string;
    biblicalSignificance: string;
    archaeology: string;
}

const REGIONS: RegionData[] = [
    {
        id: 'galilee',
        name: 'Galilee & Golan (HaGalil)',
        hebrew: 'הַגָּלִיל',
        tamilName: 'கலிலேயா மற்றும் கோலான்',
        color: 'from-emerald-500 to-green-600',
        coordinates: 'M 110,20 L 140,25 L 145,55 L 120,65 L 105,50 Z', // Top region
        description: 'Lush mountainous northern region of Israel. Home to the Sea of Galilee (Kinneret), ancient Mount Hermon, and picturesque valleys.',
        tamilDesc: 'இஸ்ரேலின் பசுமையான மலைப்பாங்கான வட பகுதி. கலிலேயா கடல் (கின்னரத்), எர்மோன் மலை மற்றும் எழில் கொஞ்சும் பள்ளத்தாக்குகள் இங்கு அமைந்துள்ளன.',
        biblicalSignificance: 'Where Yeshua (Jesus) spent most of His childhood and ministry. Walking on water, multiplication of loaves, and the Sermon on the Mount took place here.',
        archaeology: 'Ancient Synagogue of Capernaum, 1st-century Galilean fishing boat, and ruins of ancient Magdala.'
    },
    {
        id: 'judea-samaria',
        name: 'Judea & Samaria (Yehuda ve-Shomron)',
        hebrew: 'יְהוּדָה וְשׁוֹמְרוֹן',
        tamilName: 'யூதேயா மற்றும் சமாரியா',
        color: 'from-amber-500 to-amber-600',
        coordinates: 'M 100,65 L 125,70 L 130,130 L 95,135 L 90,90 Z', // Mid-right region
        description: 'The ancient heartland of Israel, stretching across rugged hills, deep gorges, and biblical cities like Hebron, Shechem, and Bethel.',
        tamilDesc: 'இஸ்ரேலின் பண்டைய மையப்பகுதி. கரடுமுரடான மலைகள், ஆழமான பள்ளத்தாக்குகள் மற்றும் எபிரோன், சீகேம், பெத்தேல் போன்ற விவிலிய நகரங்களைக் கொண்டது.',
        biblicalSignificance: 'Land promised to Abraham, Isaac, and Jacob. Kings of Judah ruled here. Tel Shiloh held the Tabernacle for over three centuries.',
        archaeology: 'Shiloh archaeological site, Tomb of the Patriarchs in Hebron, and Mt. Gerizim Samaritan ruins.'
    },
    {
        id: 'jerusalem',
        name: 'Jerusalem (Yerushalayim)',
        hebrew: 'יְרוּשָׁלַיִם',
        tamilName: 'எருசலேம் (யெருசலாயீம்)',
        color: 'from-yellow-500 to-yellow-600',
        coordinates: 'M 95,135 L 115,130 L 112,148 L 93,145 Z', // Small circular highlight in the center
        description: 'The eternal golden city, capital of Israel, and spiritual epicenter of the biblical world. Nestled in the Judean Mountains.',
        tamilDesc: 'இஸ்ரேலின் தலைநகரம் மற்றும் விவிலிய உலகின் ஆன்மீக மையம். Judean மலைகளில் அமைந்துள்ள நித்திய பொன்னகரம்.',
        biblicalSignificance: 'Built by King David as the capital. Site of Solomon\'s Temple, the Crucifixion, Resurrection, and the outpouring of the Holy Spirit on Pentecost.',
        archaeology: 'City of David excavations, Western Wall, Temple Mount, Pool of Siloam, and the ancient Mount of Olives.'
    },
    {
        id: 'coastal-plain',
        name: 'Coastal Plain (Mishor HaHof)',
        hebrew: 'מִישׁוֹר הַחוֹף',
        tamilName: 'கடற்கரை சமவெளி',
        color: 'from-blue-500 to-cyan-600',
        coordinates: 'M 75,55 L 105,65 L 90,140 L 70,145 Z', // Mid-left narrow strip
        description: 'Vibrant Mediterranean shoreline encompassing ancient ports like Jaffa and Caesarea, as well as modern economic hubs like Tel Aviv.',
        tamilDesc: 'யாப்பா, செசரியா போன்ற பழமையான துறைமுகங்கள் மற்றும் நவீன பொருளாதார மையமான டெல் அவீவ் உள்ளிட்ட மத்திய தரைக்கடல் கடற்கரைப் பகுதி.',
        biblicalSignificance: 'Apostle Peter\'s vision in Jaffa opening gospel to Gentiles. Paul\'s imprisonment and trials in Caesarea Maritima.',
        archaeology: 'Caesarea Roman Aqueduct & Theater, ancient port of Jaffa (dating back 4,000+ years).'
    },
    {
        id: 'negev',
        name: 'The Negev Desert (HaNegev)',
        hebrew: 'הַנֶּגֶב',
        tamilName: 'நெகேவ் பாலைவனம்',
        color: 'from-orange-400 to-amber-700',
        coordinates: 'M 70,145 L 92,140 L 105,170 L 110,250 L 80,320 L 50,220 Z', // Southern large triangle
        description: 'The vast southern desert occupying over half of Israel\'s landmass. Famous for unique geological craters (Makhteshim) and ancient trade routes.',
        tamilDesc: 'இஸ்ரேலின் பரப்பளவில் பாதிக்கும் மேலான தெற்குப் பாலைவனம். தனித்துவமான புவியியல் பள்ளங்கள் (மக்டேஷிம்) மற்றும் பண்டைய வர்த்தக வழிகளுக்குப் பெயர் பெற்றது.',
        biblicalSignificance: 'Where Abraham and Isaac dug wells in Beersheba. Moses sent the twelve spies to survey the land from the wilderness of Zin.',
        archaeology: 'Tel Beer Sheba (Abraham\'s Well), Nabataean Incense Route cities (Avdat, Shivta), and Solomon\'s copper mines at Timna.'
    }
];

export const IsraelPage: React.FC = () => {
    const [selectedRegion, setSelectedRegion] = useState<RegionData>(REGIONS[2]); // Jerusalem default
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'geography' | 'archaeology' | 'language'>('overview');
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState('');
    const exportRef = useRef<HTMLDivElement>(null);

    const handlePlayAudio = (text: string) => {
        audioService.playHebrew(text);
    };

    const handleExportPDF = async () => {
        if (!exportRef.current) return;
        setIsExporting(true);
        setExportProgress('Preparing...');
        const TABS: Array<'overview' | 'history' | 'geography' | 'archaeology' | 'language'> = ['overview', 'history', 'geography', 'archaeology', 'language'];
        const savedRegion = selectedRegion;
        const savedTab = activeTab;
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfW = pdf.internal.pageSize.getWidth();
            const pdfH = pdf.internal.pageSize.getHeight();
            let firstPage = true;
            let pageNum = 0;
            const totalPages = 1 + (REGIONS.length * TABS.length); // 26 pages

            const capturePage = async () => {
                if (!exportRef.current) return;
                pageNum++;
                setExportProgress(`${pageNum}/${totalPages}`);
                await new Promise(r => setTimeout(r, 60));
                const canvas = await html2canvas(exportRef.current, {
                    scale: 1.2,
                    useCORS: true,
                    backgroundColor: '#fffdf6',
                    logging: false,
                    ignoreElements: (el: Element) => el.hasAttribute('data-html2canvas-ignore')
                });
                const imgData = canvas.toDataURL('image/jpeg', 0.82);
                const imgH = (canvas.height * pdfW) / canvas.width;
                let y = 0, heightLeft = imgH;
                if (!firstPage) pdf.addPage(); else firstPage = false;
                pdf.addImage(imgData, 'JPEG', 0, y, pdfW, imgH);
                heightLeft -= pdfH;
                while (heightLeft > 0) {
                    y -= pdfH; pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, y, pdfW, imgH);
                    heightLeft -= pdfH;
                }
            };
            // Cover page
            setSelectedRegion(REGIONS[2]);
            setActiveTab('overview');
            await capturePage();
            // Cycle all regions x all tabs
            for (const region of REGIONS) {
                setSelectedRegion(region);
                for (const tab of TABS) {
                    setActiveTab(tab);
                    await capturePage();
                }
            }
            pdf.save('COT-Eretz-Israel-Complete-Guide.pdf');
        } catch (error) {
            console.error('Export failed:', error);
            alert('Could not export PDF. Please try again.');
        } finally {
            setSelectedRegion(savedRegion);
            setActiveTab(savedTab);
            setIsExporting(false);
            setExportProgress('');
        }
    };

    return (
        <div ref={exportRef} className="bg-[#fffdf6] text-slate-800 min-h-screen py-10 px-4 md:px-8 font-sans">
            <style>{`
                @keyframes flagWave {
                    0% { transform: translate3d(0, 0, 0) rotate(0deg) skewY(0deg); }
                    25% { transform: translate3d(0, -3px, 0) rotate(0.5deg) skewY(-0.5deg); }
                    50% { transform: translate3d(0, 0, 0) rotate(0deg) skewY(0deg); }
                    75% { transform: translate3d(0, 3px, 0) rotate(-0.5deg) skewY(0.5deg); }
                    100% { transform: translate3d(0, 0, 0) rotate(0deg) skewY(0deg); }
                }
                .animate-flag-wave {
                    animation: flagWave 3.5s ease-in-out infinite;
                    transform-origin: left center;
                }
                .animate-spin-slow {
                    animation: spin 20s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header Block */}
                <header className="text-center relative py-8 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-brand-950 to-slate-950 text-white shadow-xl border border-white/5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.08)_0%,transparent_70%)] pointer-events-none" />



                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-400/20 to-amber-500/5 rounded-full flex items-center justify-center border border-amber-400/25 mb-4 shadow-[0_0_30px_rgba(245,158,11,0.15)]"
                    >
                        <Globe className="text-amber-400 animate-spin-slow" size={28} />
                    </motion.div>

                    <h1 className="font-serif text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 tracking-wider font-extrabold px-4 drop-shadow-md">
                        ERETZ ISRAEL
                    </h1>
                    <p className="text-xl md:text-2xl font-serif text-[#fdfcf0]/80 mt-1 italic">אֶרֶץ יִשְׂרָאֵל · இஸ்ரேல் தேசம்</p>
                    <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent mx-auto mt-4 mb-3"></div>
                    <p className="text-[10px] md:text-xs tracking-[4px] text-amber-400/60 uppercase font-black">
                        The Land of Promise, Covenant, and Eternal Heritage
                    </p>
                </header>

                {/* Flags Section - Attractive CSS Waving Flags */}
                <section className="grid md:grid-cols-2 gap-8 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Flag 1: State of Israel */}
                    <div className="flex flex-col items-center p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner group">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-blue-600" /> State Flag of Israel
                        </h3>

                        {/* Waving Israel Flag */}
                        <div className="relative w-full max-w-[280px] aspect-[3/2] overflow-hidden rounded-lg shadow-lg border border-slate-200 group-hover:scale-[1.02] transition-transform duration-500">
                            {/* Flag Canvas/CSS wave wrapper */}
                            <div className="w-full h-full bg-white relative flex flex-col justify-between py-[12%] px-[5%] animate-flag-wave overflow-hidden">
                                {/* Ambient shine */}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-black/10 z-10 pointer-events-none" />

                                {/* Top Blue Stripe */}
                                <div className="w-full h-[15%] bg-[#003399]" />

                                {/* Magen David Star */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <svg className="w-[30%] aspect-square text-[#003399]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8">
                                        {/* Dual overlapping triangles */}
                                        <polygon points="50,15 80,70 20,70" />
                                        <polygon points="50,85 80,30 20,30" />
                                    </svg>
                                </div>

                                {/* Bottom Blue Stripe */}
                                <div className="w-full h-[15%] bg-[#003399]" />
                            </div>
                        </div>
                        <p className="text-xs font-semibold text-slate-500 mt-4 text-center leading-relaxed">
                            Blue stripes symbolize the Tallit (prayer shawl); the Star of David represents traditional protection and unity.
                        </p>
                    </div>

                    {/* Flag 2: Golden Menorah YHWH Flag */}
                    <div className="flex flex-col items-center p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner group">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Sparkles size={14} className="text-amber-500" /> COT Golden Menorah Flag
                        </h3>

                        {/* Waving Golden Menorah Flag - Dynamic Video */}
                        <div className="relative w-full max-w-[280px] aspect-[3/2] overflow-hidden rounded-lg shadow-lg border border-slate-200 group-hover:scale-[1.02] transition-transform duration-500 bg-black">
                            <video
                                src="/gemini_generated_video_cf07149d.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <p className="text-xs font-semibold text-slate-500 mt-4 text-center leading-relaxed">
                            Our high-anointing royal flag, honoring the seven-branched golden menorah and the holy Hebrew name YHWH.
                        </p>
                    </div>
                </section>

                {/* 3D Peeling Stacking Cards - Discover Israel's Regions */}
                {(() => {
                    const regionCards: PeelingCardItem[] = REGIONS.map((region, index) => {
                        const isJerusalem = region.id === 'jerusalem';
                        const isGalilee = region.id === 'galilee';
                        const isJudeaSamaria = region.id === 'judea-samaria';
                        const isCoastal = region.id === 'coastal-plain';
                        const isNegev = region.id === 'negev';

                        let themeGradient = 'from-[#1c1917] via-[#27272a] to-[#713f12]';
                        let borderColor = 'border-amber-500/30';
                        let badgeLabel = `Region 0${index + 1} · Biblical Heartland`;
                        let badgeColor = 'text-amber-400';
                        let mapHighlightColor = '#d97706';

                        if (isGalilee) {
                            themeGradient = 'from-[#052e16] via-[#064e3b] to-[#022c22]';
                            borderColor = 'border-emerald-500/35';
                            badgeLabel = `Region 0${index + 1} · Northern Realm`;
                            badgeColor = 'text-emerald-400';
                            mapHighlightColor = '#10b981';
                        } else if (isJudeaSamaria) {
                            themeGradient = 'from-[#451a03] via-[#78350f] to-[#1c1917]';
                            borderColor = 'border-amber-500/35';
                            badgeLabel = `Region 0${index + 1} · Biblical Heartland`;
                            badgeColor = 'text-amber-400';
                            mapHighlightColor = '#f59e0b';
                        } else if (isJerusalem) {
                            themeGradient = 'from-[#422006] via-[#713f12] to-[#18181b]';
                            borderColor = 'border-yellow-500/45';
                            badgeLabel = `Region 0${index + 1} · Eternal Capital`;
                            badgeColor = 'text-yellow-400';
                            mapHighlightColor = '#fbbf24';
                        } else if (isCoastal) {
                            themeGradient = 'from-[#082f49] via-[#075985] to-[#0f172a]';
                            borderColor = 'border-cyan-500/35';
                            badgeLabel = `Region 0${index + 1} · Mediterranean Coast`;
                            badgeColor = 'text-cyan-400';
                            mapHighlightColor = '#06b6d4';
                        } else if (isNegev) {
                            themeGradient = 'from-[#431407] via-[#9a3412] to-[#1c1917]';
                            borderColor = 'border-orange-500/35';
                            badgeLabel = `Region 0${index + 1} · Southern Wilderness`;
                            badgeColor = 'text-orange-400';
                            mapHighlightColor = '#f97316';
                        }

                        return {
                            id: region.id,
                            tabLabel: region.name.split(' (')[0],
                            tabIcon: <MapPin size={14} />,
                            stageBadge: badgeLabel,
                            badgeIcon: <MapPin size={12} className={badgeColor} />,
                            title: region.name,
                            tamilTitle: `${region.hebrew} · ${region.tamilName}`,
                            subtitle: region.description,
                            themeGradient,
                            borderColor,
                            content: (
                                <div className="space-y-4 text-left">
                                    {/* Hebrew Pronunciation & Audio Bar */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10">
                                        <div>
                                            <div className="text-[10px] font-mono tracking-widest text-amber-300 uppercase font-bold">
                                                Hebrew Name & Audio
                                            </div>
                                            <div className="text-xl font-serif font-bold text-white tracking-wide">
                                                {region.hebrew}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handlePlayAudio(region.hebrew)}
                                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs flex items-center gap-2 hover:from-amber-600 hover:to-amber-700 transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
                                            title="Listen to authentic Hebrew pronunciation"
                                        >
                                            <Volume2 size={15} />
                                            <span>Listen ({region.hebrew})</span>
                                        </button>
                                    </div>

                                    {/* Tamil Description Callout Box */}
                                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border-l-4 border-amber-400 backdrop-blur-sm">
                                        <div className="text-[10px] font-black uppercase tracking-wider text-amber-300 mb-1">
                                            தமிழ் விளக்கம் (Tamil Summary)
                                        </div>
                                        <p className="text-amber-100/90 text-xs sm:text-sm font-serif leading-relaxed italic">
                                            {region.tamilDesc}
                                        </p>
                                    </div>

                                    {/* 2-Column Grid: Biblical History & Archaeology */}
                                    <div className="grid sm:grid-cols-2 gap-3.5">
                                        <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-md border border-white/10 space-y-1.5">
                                            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                                                <Scroll size={12} /> Biblical History & Covenants
                                            </span>
                                            <p className="text-white/80 text-xs leading-relaxed">
                                                {region.biblicalSignificance}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-md border border-white/10 space-y-1.5">
                                            <span className="text-[10px] font-black uppercase text-blue-300 tracking-wider flex items-center gap-1.5">
                                                <Landmark size={12} /> Archaeological Marvels
                                            </span>
                                            <p className="text-white/80 text-xs leading-relaxed">
                                                {region.archaeology}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bottom Covenant Indicator */}
                                    <div className="pt-2 flex items-center justify-between text-[11px] text-white/60 font-semibold">
                                        <span className="flex items-center gap-1 text-amber-300/80">
                                            <MapPin size={12} className="text-amber-400" /> Eretz Covenant Boundary
                                        </span>
                                        <span className="uppercase text-[9px] tracking-widest text-white/50">
                                            City of Truth Sanctuary Hub
                                        </span>
                                    </div>
                                </div>
                            ),
                            visualSide: (
                                <div className="w-full h-full min-h-[360px] p-5 rounded-3xl bg-black/45 backdrop-blur-xl border border-white/15 flex flex-col items-center justify-center text-center relative overflow-hidden group/map shadow-2xl">
                                    <div className="absolute top-3 left-4 text-[9px] text-amber-300/80 uppercase tracking-widest font-mono flex items-center gap-1">
                                        <Compass size={10} className="text-amber-400 animate-spin-slow" />
                                        <span>Territory Map · {region.name.split(' ')[0]}</span>
                                    </div>

                                    <div className="py-2 w-full flex items-center justify-center">
                                        <svg
                                            className="w-full max-w-[240px] h-auto text-slate-400 drop-shadow-2xl"
                                            viewBox="0 0 200 350"
                                            fill="none"
                                            stroke="#cbd5e1"
                                            strokeWidth="2"
                                        >
                                            {/* Jordan River & Border Outline */}
                                            <path d="M 140,25 C 130,60 133,130 115,148 C 110,160 110,240 80,320" stroke="#60a5fa" strokeWidth="1.2" strokeDasharray="3,3" opacity="0.6" />

                                            {/* Regions Polygons */}
                                            {REGIONS.map((r) => {
                                                const isCurrent = r.id === region.id;
                                                return (
                                                    <g key={r.id}>
                                                        <path
                                                            d={r.coordinates}
                                                            className="transition-all duration-500"
                                                            fill={isCurrent ? mapHighlightColor : '#475569'}
                                                            fillOpacity={isCurrent ? 0.75 : 0.25}
                                                            stroke={isCurrent ? '#ffffff' : '#64748b'}
                                                            strokeWidth={isCurrent ? 2.5 : 1}
                                                            style={{
                                                                filter: isCurrent ? `drop-shadow(0 0 8px ${mapHighlightColor})` : 'none'
                                                            }}
                                                        />
                                                    </g>
                                                );
                                            })}

                                            {/* Holy Cities Pins */}
                                            {/* Jerusalem Pin */}
                                            <circle cx="102" cy="139" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" className="animate-pulse" />
                                            <text x="109" y="142" fill="#fca5a5" fontSize="8" fontWeight="bold" fontFamily="sans-serif">Jerusalem</text>

                                            {/* Sea of Galilee */}
                                            <ellipse cx="132" cy="50" rx="6" ry="10" fill="#38bdf8" fillOpacity="0.9" stroke="#0284c7" strokeWidth="1" />
                                            <text x="141" y="53" fill="#93c5fd" fontSize="7" fontWeight="bold" fontFamily="sans-serif">Galilee</text>

                                            {/* Dead Sea */}
                                            <ellipse cx="112" cy="180" rx="5" ry="25" fill="#38bdf8" fillOpacity="0.8" stroke="#0284c7" strokeWidth="1" />
                                            <text x="120" y="183" fill="#93c5fd" fontSize="7" fontWeight="bold" fontFamily="sans-serif">Dead Sea</text>
                                        </svg>
                                    </div>

                                    <div className="w-full mt-2 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/70 font-mono">
                                        <span className="text-amber-400 font-bold">{region.hebrew}</span>
                                        <span className="text-white/50">{region.id.toUpperCase()} SECTOR</span>
                                    </div>
                                </div>
                            )
                        };
                    });

                    return (
                        <PeelingStackCards
                            badgeLabel="Interactive Regional Hub"
                            title="Discover Israel's Regions"
                            tamilTitle="இஸ்ரேலின் புனித மண்டலங்கள்"
                            subtitle="Explore the biblical significance, geographic wonder, and archaeological marvels across the five holy regions of the Promised Land."
                            items={regionCards}
                        />
                    );
                })()}

                {/* 3D Peeling Stacking Cards - Knowledge Hub */}
                {(() => {
                    const israelKnowledgeCards: PeelingCardItem[] = [
                        {
                            id: 'overview',
                            tabLabel: 'Overview & Facts',
                            tabIcon: <Landmark size={14} />,
                            stageBadge: 'Profile 01 · Eretz Israel',
                            badgeIcon: <Landmark size={12} className="text-amber-400" />,
                            title: 'General State & Biblical Land Profile',
                            tamilTitle: 'அரசு மற்றும் விவிலிய நில விவரம்',
                            subtitle: 'Eretz Israel - A geography of divine covenants, history, and geographical diversity.',
                            themeGradient: 'from-[#1c1917] via-[#27272a] to-[#713f12]',
                            borderColor: 'border-amber-500/30',
                            content: (
                                <div className="space-y-5 text-left">
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-amber-500/25">
                                            <h4 className="text-[11px] font-black uppercase tracking-widest text-[#fbbf24] mb-2">State Capitals & Center</h4>
                                            <div className="space-y-1 text-white/80 text-xs">
                                                <p><strong className="text-white">Official Capital:</strong> Jerusalem (Yerushalayim)</p>
                                                <p><strong className="text-white">Judicial/Legal:</strong> Supreme Court of Israel</p>
                                                <p><strong className="text-white">Economic Hub:</strong> Tel Aviv-Yafo</p>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-amber-500/25">
                                            <h4 className="text-[11px] font-black uppercase tracking-widest text-[#fbbf24] mb-2">Key State Demographics</h4>
                                            <div className="space-y-1 text-white/80 text-xs">
                                                <p><strong className="text-white">Languages:</strong> Hebrew (עִבְרִית)</p>
                                                <p><strong className="text-white">Independence Day:</strong> 5th of Iyar (Yom Ha'atzmaut)</p>
                                                <p><strong className="text-white">National Flower:</strong> Cyclamen persicum (Rakefet)</p>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-amber-500/25">
                                            <h4 className="text-[11px] font-black uppercase tracking-widest text-[#fbbf24] mb-2">National State Symbols</h4>
                                            <div className="space-y-1 text-white/80 text-xs">
                                                <p><strong className="text-white">Emblem:</strong> Menorah flanked by olive branches</p>
                                                <p><strong className="text-white">Anthem:</strong> Hatikvah ("The Hope")</p>
                                                <p><strong className="text-white">National Bird:</strong> Hoopoe (Duchifat)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-white/80 text-xs sm:text-sm leading-relaxed space-y-3 pt-1">
                                        <p className="text-justify">
                                            Geographically located in Western Asia, Israel borders Lebanon, Syria, Jordan, and Egypt. It sits at the absolute crossroads of Europe, Asia, and Africa. Eretz Israel contains multiple ecosystems: green rolling hills in the north, Mediterranean coastlines in the west, high mountainous ridges in the center, and dry desert plains in the south.
                                        </p>
                                        <p className="text-justify">
                                            Throughout history, it has served as the anchor point of biblical history. From the early covenants with Abraham, to the kingship of David and Solomon, the birth of Yeshua (Jesus), and the prophecies of future restoration, this land remains central to scripture.
                                        </p>
                                    </div>
                                </div>
                            ),
                            visualSide: (
                                <div className="w-full h-full min-h-[260px] p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-amber-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden group/visual">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400/25 to-amber-600/10 border-2 border-amber-400/50 flex items-center justify-center mb-4 shadow-xl group-hover/visual:scale-110 transition-transform duration-500">
                                        <Sparkles size={36} className="text-amber-400 animate-pulse" />
                                    </div>

                                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold tracking-widest uppercase mb-2 border border-amber-500/30">
                                        YHWH Covenant Land
                                    </span>
                                    <h5 className="font-serif font-bold text-base text-white">Eretz HaKodesh</h5>
                                    <p className="text-amber-200/70 text-xs mt-1 max-w-[240px]">
                                        Promised to Abraham and his descendants as an everlasting covenant inheritance.
                                    </p>
                                </div>
                            )
                        },
                        {
                            id: 'history',
                            tabLabel: 'History & Prophecy',
                            tabIcon: <History size={14} />,
                            stageBadge: 'Profile 02 · Prophetic Timeline',
                            badgeIcon: <History size={12} className="text-blue-400" />,
                            title: 'Chronology of the Holy Land & Prophecy',
                            tamilTitle: 'வரலாறு மற்றும் தீர்க்கதரிசனம்',
                            subtitle: 'A timeline of covenant, exile, rebirth, and the fulfillment of ancient prophecy.',
                            themeGradient: 'from-[#0f172a] via-[#1e293b] to-[#1e1b4b]',
                            borderColor: 'border-blue-500/30',
                            content: (
                                <div className="space-y-4 text-left">
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {[
                                            { era: 'c. 2000 BC', title: 'The Abrahamic Covenant', text: 'God establishes a covenant with Abraham, promising Canaan to his descendants forever (Genesis 15:18).' },
                                            { era: 'c. 1000 BC', title: 'The Davidic Kingdom', text: 'King David unites the tribes and establishes Jerusalem as eternal capital. Solomon builds First Temple.' },
                                            { era: '586 BC & AD 70', title: 'Exiles & Destruction', text: 'Destruction of First Temple by Babylonians, Second Temple by Romans, scattering Jewish people globally.' },
                                            { era: 'May 14, 1948', title: 'Rebirth of the Nation', text: 'Against all odds, modern Israel declares independence, fulfilling Isaiah 66:8: "Can a nation be born in a day?"' },
                                            { era: 'Modern Era', title: 'Gathering of Exiles (Aliyah)', text: 'Millions return from all four corners of the globe, restoring the land and reviving Hebrew language.' }
                                        ].map((time, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3.5 rounded-2xl bg-black/40 backdrop-blur-md border border-blue-500/20 hover:border-blue-500/40 transition-all"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold border border-blue-500/30">
                                                        {time.era}
                                                    </span>
                                                    <span className="text-[10px] text-blue-200/60 uppercase tracking-widest font-mono">
                                                        ERA 0{idx + 1}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-white text-xs mt-1">{time.title}</h4>
                                                <p className="text-white/70 text-xs mt-1 leading-relaxed">{time.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ),
                            visualSide: (
                                <div className="w-full h-full min-h-[260px] p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-blue-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden group/visual">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400/25 to-blue-600/10 border-2 border-blue-400/50 flex items-center justify-center mb-4 shadow-xl group-hover/visual:scale-110 transition-transform duration-500">
                                        <Scroll size={36} className="text-blue-400" />
                                    </div>

                                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold tracking-widest uppercase mb-2 border border-blue-500/30">
                                        Prophetic Fulfillment
                                    </span>
                                    <h5 className="font-serif font-bold text-base text-white">Isaiah 66:8</h5>
                                    <p className="text-blue-200/70 text-xs mt-1 max-w-[240px]">
                                        "Who has heard such a thing? Who has seen such things? Shall the earth be made to give birth in one day?"
                                    </p>
                                </div>
                            )
                        },
                        {
                            id: 'geography',
                            tabLabel: 'Wonders & Nature',
                            tabIcon: <Compass size={14} />,
                            stageBadge: 'Profile 03 · Sacred Topography',
                            badgeIcon: <Compass size={12} className="text-emerald-400" />,
                            title: 'Geographical Marvels of the Land',
                            tamilTitle: 'இயற்கை அதிசயங்கள்',
                            subtitle: 'Eretz Israel boasts highly diverse and unique ecosystems in a compact area.',
                            themeGradient: 'from-[#022c22] via-[#064e3b] to-[#0c4a6e]',
                            borderColor: 'border-emerald-500/30',
                            content: (
                                <div className="space-y-4 text-left">
                                    <div className="grid sm:grid-cols-2 gap-3 pt-1">
                                        {[
                                            { name: 'The Dead Sea (Yam HaMelah)', tag: 'Elevation: -430m', desc: 'The absolute lowest land elevation on Earth. High mineral concentration enables effortless floating and healing properties.' },
                                            { name: 'Sea of Galilee (Kinneret)', tag: 'Freshwater Basin', desc: 'Israel\'s largest freshwater lake, surrounded by rolling hills. The canvas of Yeshua\'s miracles, walking on water, and feeding 5,000.' },
                                            { name: 'Mount Hermon (Har Hermon)', tag: 'Highest Peak: 2,814m', desc: 'Majestic snow-capped northern peak. Snowmelt cascades southward to feed the Headwaters of the Jordan River.' },
                                            { name: 'The Jordan River (Nehar HaYarden)', tag: 'Sacred Waterway', desc: 'Sacred river coursing down the Rift Valley into the Dead Sea. Site of Joshua\'s crossing and Yeshua\'s baptism.' }
                                        ].map((geo, index) => (
                                            <div
                                                key={index}
                                                className="p-3.5 rounded-2xl bg-black/40 backdrop-blur-md border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-white text-xs">{geo.name}</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-500/30">
                                                        {geo.tag}
                                                    </span>
                                                </div>
                                                <p className="text-white/70 text-xs mt-1 leading-relaxed">{geo.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ),
                            visualSide: (
                                <div className="w-full h-full min-h-[260px] p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-emerald-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden group/visual">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400/25 to-emerald-600/10 border-2 border-emerald-400/50 flex items-center justify-center mb-4 shadow-xl group-hover/visual:scale-110 transition-transform duration-500">
                                        <Compass size={36} className="text-emerald-400 animate-spin-slow" />
                                    </div>

                                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold tracking-widest uppercase mb-2 border border-emerald-500/30">
                                        Mount Hermon to Dead Sea
                                    </span>
                                    <h5 className="font-serif font-bold text-base text-white">Vertical Ecosystem Range</h5>
                                    <p className="text-emerald-200/70 text-xs mt-1 max-w-[240px]">
                                        Spanning from snowy sub-alpine heights to the lowest topographical depression on Earth.
                                    </p>
                                </div>
                            )
                        },
                        {
                            id: 'archaeology',
                            tabLabel: 'Archaeology & Relics',
                            tabIcon: <Scroll size={14} />,
                            stageBadge: 'Profile 04 · Stones Crying Out',
                            badgeIcon: <Scroll size={12} className="text-amber-400" />,
                            title: 'Archaeological Discoveries Confirming Scripture',
                            tamilTitle: 'தொல்பொருள் சான்றுகள்',
                            subtitle: 'Over 30,000 mapped archaeological sites verifying biblical narratives.',
                            themeGradient: 'from-[#292524] via-[#451a03] to-[#1c1917]',
                            borderColor: 'border-amber-500/30',
                            content: (
                                <div className="space-y-4 text-left">
                                    <div className="grid sm:grid-cols-2 gap-3 pt-1">
                                        {[
                                            { title: 'The Dead Sea Scrolls', tag: 'Qumran Caves 1947', desc: 'Over 2,000-year-old manuscripts containing almost every book of Hebrew Scripture, proving text fidelity.' },
                                            { title: 'The Tel Dan Stele', tag: 'House of David Inscription', desc: '9th-century BC stone inscription containing the oldest extra-biblical reference to Beit David (House of David).' },
                                            { title: 'Western Wall (Kotel)', tag: 'Temple Mount Herodian Blocks', desc: 'Massive limestone megaliths of the Second Temple complex where Messiah Yeshua preached and walked.' },
                                            { title: 'Pool of Siloam', tag: 'City of David Excavation', desc: 'Rock-cut pool where Yeshua sent the blind man to wash and receive miraculous sight (John 9:7).' }
                                        ].map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3.5 rounded-2xl bg-black/40 backdrop-blur-md border border-amber-500/20 hover:border-amber-500/40 transition-all"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-white text-xs">{item.title}</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold border border-amber-500/30">
                                                        {item.tag}
                                                    </span>
                                                </div>
                                                <p className="text-white/70 text-xs mt-1 leading-relaxed">{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ),
                            visualSide: (
                                <div className="w-full h-full min-h-[260px] p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-amber-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden group/visual">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400/25 to-amber-600/10 border-2 border-amber-400/50 flex items-center justify-center mb-4 shadow-xl group-hover/visual:scale-110 transition-transform duration-500">
                                        <Landmark size={36} className="text-amber-400" />
                                    </div>

                                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold tracking-widest uppercase mb-2 border border-amber-500/30">
                                        Physical Verification
                                    </span>
                                    <h5 className="font-serif font-bold text-base text-white">Stones of Testimony</h5>
                                    <p className="text-amber-200/70 text-xs mt-1 max-w-[240px]">
                                        Confirming scriptural genealogies, monarchies, battles, and sacred worship sites.
                                    </p>
                                </div>
                            )
                        },
                        {
                            id: 'language',
                            tabLabel: 'Hebrew Connection',
                            tabIcon: <Heart size={14} />,
                            stageBadge: 'Profile 05 · Lashon HaKodesh',
                            badgeIcon: <Heart size={12} className="text-purple-400" />,
                            title: 'The Resurrection of Hebrew (עִבְரִית)',
                            tamilTitle: 'எபிரேய மொழி மறுமலர்ச்சி',
                            subtitle: 'How a sacred language of antiquity was miraculously restored to common speech.',
                            themeGradient: 'from-[#1e1b4b] via-[#4c1d95] to-[#2e1065]',
                            borderColor: 'border-purple-500/30',
                            content: (
                                <div className="space-y-4 text-left">
                                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed text-justify">
                                        Hebrew is the only language in human history that died out as an everyday spoken tongue for nearly 2,000 years, only to be resurrected as a vibrant national language, fulfilling Zephaniah 3:9 ("turn to the people a pure language").
                                    </p>
                                    <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-purple-500/25">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-[#d8b4fe] mb-1.5 flex items-center gap-2">
                                            <Scroll size={13} className="text-purple-300" /> Sacred Roots and Power
                                        </h4>
                                        <p className="text-white/75 text-xs sm:text-sm leading-relaxed text-justify">
                                            In Hebrew, words are built around three-letter root systems (Shoresh) carrying deep divine resonance. E.g., Yad (יד) signifies hand/power; Ahava (אהבה) embodies love from the root "to give".
                                        </p>
                                    </div>
                                </div>
                            ),
                            visualSide: (
                                <div className="w-full h-full min-h-[260px] p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-purple-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden group/visual">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400/25 to-purple-600/10 border-2 border-purple-400/50 flex items-center justify-center mb-4 shadow-xl group-hover/visual:scale-110 transition-transform duration-500">
                                        <span className="text-4xl font-serif text-purple-300 font-bold">ש</span>
                                    </div>

                                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold tracking-widest uppercase mb-2 border border-purple-500/30">
                                        Lashon HaKodesh
                                    </span>
                                    <h5 className="font-serif font-bold text-base text-white">The Holy Tongue</h5>
                                    <p className="text-purple-200/70 text-xs mt-1 max-w-[240px]">
                                        Language of Genesis creation, divine commandments, and prophetic redemption.
                                    </p>
                                </div>
                            )
                        }
                    ];

                    return (
                        <PeelingStackCards
                            badgeLabel="Holy Land Knowledge Stacks"
                            title="Eretz Israel Knowledge Hub"
                            tamilTitle="இஸ்ரேல் தேசக் களஞ்சியம்"
                            subtitle="Scroll through the 3D peeling stacking cards covering covenants, prophetic history, geography, archaeology, and the Hebrew language."
                            items={israelKnowledgeCards}
                            defaultViewMode="stack"
                        />
                    );
                })()}

                {/* Footer Scripture */}
                <footer className="mt-10 text-center py-8 border-t border-amber-500/10 max-w-2xl mx-auto space-y-3">
                    <p className="font-serif italic text-slate-500 text-lg leading-relaxed">
                        "For the Lord has chosen Zion; He has desired it for His dwelling place: 'This is My resting place forever; Here I will dwell, for I have desired it.'"
                    </p>
                    <span className="text-[#d97706] text-xs font-black tracking-[3px] block">PSALM 132:13-14</span>
                </footer>

            </div>
        </div>
    );
};

export default IsraelPage;
