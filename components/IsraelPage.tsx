import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, MapPin, Sparkles, Scroll, Landmark, History, Compass, ArrowRight, Volume2, ShieldCheck, Heart, Download, Loader2 } from 'lucide-react';
import { audioService } from '../services/audioService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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

                {/* Interactive Map & Regional Discovery Section */}
                <section className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="text-center max-w-xl mx-auto mb-10">
                        <span className="px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black tracking-widest uppercase border border-amber-200 inline-block mb-3">
                            Interactive Regional Hub
                        </span>
                        <h2 className="text-3xl font-serif text-slate-900 font-bold">Discover Israel's Regions</h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">
                            Click or tap areas on the map outline to explore biblical significance, geographic details, and archaeological marvels.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8 items-stretch">

                        {/* Column 1: Interactive SVG Map (occupies 5 cols) */}
                        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-50 p-6 rounded-3xl border border-slate-150 relative min-h-[360px]">
                            {/* Map Labels Overlay */}
                            <div className="absolute top-4 left-4 text-[9px] text-slate-400 uppercase tracking-wider font-mono">
                                Map boundaries illustrative
                            </div>

                            <svg
                                className="w-full max-w-[260px] h-auto text-slate-300 drop-shadow-md"
                                viewBox="0 0 200 350"
                                fill="none"
                                stroke="#cbd5e1"
                                strokeWidth="2"
                            >
                                {/* Background Outline representing Jordan River / borders */}
                                <path d="M 140,25 C 130,60 133,130 115,148 C 110,160 110,240 80,320" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3,3" />

                                {REGIONS.map((region) => {
                                    const isSelected = selectedRegion.id === region.id;
                                    return (
                                        <g key={region.id} className="cursor-pointer">
                                            <motion.path
                                                d={region.coordinates}
                                                className="transition-all duration-300 outline-none"
                                                fill={isSelected ? '#d97706' : '#e2e8f0'}
                                                fillOpacity={isSelected ? 0.35 : 0.6}
                                                stroke={isSelected ? '#d97706' : '#94a3b8'}
                                                strokeWidth={isSelected ? 3.5 : 1.5}
                                                whileHover={{ scale: 1.02, fillOpacity: 0.8 }}
                                                onClick={() => setSelectedRegion(region)}
                                            />
                                        </g>
                                    );
                                })}

                                {/* Holy Cities Pins */}
                                {/* Jerusalem Pin */}
                                <circle cx="102" cy="139" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" className="animate-pulse" />
                                <text x="109" y="142" fill="#ef4444" fontSize="8" fontWeight="bold" fontFamily="sans-serif">Jerusalem</text>

                                {/* Sea of Galilee */}
                                <ellipse cx="132" cy="50" rx="6" ry="10" fill="#3b82f6" fillOpacity="0.8" stroke="#1d4ed8" strokeWidth="1" />
                                <text x="141" y="53" fill="#1d4ed8" fontSize="7" fontWeight="bold" fontFamily="sans-serif">Galilee</text>

                                {/* Dead Sea */}
                                <ellipse cx="112" cy="180" rx="5" ry="25" fill="#3b82f6" fillOpacity="0.8" stroke="#1d4ed8" strokeWidth="1" />
                                <text x="120" y="183" fill="#1e3a8a" fontSize="7" fontWeight="bold" fontFamily="sans-serif">Dead Sea</text>
                            </svg>

                            {/* Region quick selector buttons */}
                            <div className="flex flex-wrap justify-center gap-1.5 mt-6 w-full">
                                {REGIONS.map(r => (
                                    <button
                                        key={r.id}
                                        onClick={() => setSelectedRegion(r)}
                                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border ${selectedRegion.id === r.id
                                                ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                                            }`}
                                    >
                                        {r.name.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Column 2: Region Detail Display Card (occupies 7 cols) */}
                        <div className="lg:col-span-7">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedRegion.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full flex flex-col justify-between p-6 md:p-8 bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-150 shadow-sm relative overflow-hidden"
                                >
                                    {/* Glowing side accent */}
                                    <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${selectedRegion.color}`}></div>

                                    <div className="space-y-5">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-2xl font-serif text-slate-900 font-bold">{selectedRegion.name}</h3>
                                                <p className="text-[#d97706] font-bold text-sm tracking-wide flex items-center gap-2 mt-0.5">
                                                    <span>{selectedRegion.hebrew}</span> · <span>{selectedRegion.tamilName}</span>
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handlePlayAudio(selectedRegion.hebrew)}
                                                className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 transition-colors shadow-sm"
                                                title="Hear Hebrew pronunciation"
                                            >
                                                <Volume2 size={16} />
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Geographic Overview</span>
                                                <p className="text-slate-600 text-sm leading-relaxed">{selectedRegion.description}</p>
                                                <p className="text-slate-500 text-xs italic leading-relaxed mt-2 font-serif bg-amber-500/5 px-3 py-1.5 rounded-lg border-l border-amber-300">{selectedRegion.tamilDesc}</p>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-4 pt-2">
                                                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                                    <span className="text-[10px] font-black uppercase text-brand-600 tracking-wider block mb-1 flex items-center gap-1">
                                                        <Scroll size={11} /> Biblical History
                                                    </span>
                                                    <p className="text-slate-600 text-xs leading-relaxed">{selectedRegion.biblicalSignificance}</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                                    <span className="text-[10px] font-black uppercase text-[#1e3a8a] tracking-wider block mb-1 flex items-center gap-1">
                                                        <Landmark size={11} /> Archaeology
                                                    </span>
                                                    <p className="text-slate-600 text-xs leading-relaxed">{selectedRegion.archaeology}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-bold">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={12} className="text-[#d97706]" /> Eretz Covenant Boundary
                                        </span>
                                        <span className="uppercase text-[10px] tracking-widest text-[#d97706]">City of Truth Sanctuary Hub</span>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </section>

                {/* Wikipedia-Style Detailed Knowledge Hub */}
                <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    {/* Tab Navigation bar */}
                    <div className="flex border-b border-slate-100 bg-slate-50 flex-wrap">
                        {[
                            { id: 'overview', label: 'Overview & Facts', icon: <Landmark size={14} /> },
                            { id: 'history', label: 'History & Prophecy', icon: <History size={14} /> },
                            { id: 'geography', label: 'Wonders & Nature', icon: <Compass size={14} /> },
                            { id: 'archaeology', label: 'Archaeology & Relics', icon: <Scroll size={14} /> },
                            { id: 'language', label: 'Hebrew Connection', icon: <Heart size={14} /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-wider transition-all border-r border-slate-100 shrink-0 ${activeTab === tab.id
                                        ? 'bg-white text-slate-900 border-b-2 border-b-amber-500'
                                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/50'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content display box */}
                    <div className="p-6 md:p-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                {activeTab === 'overview' && (
                                    <div className="space-y-6 text-left">
                                        <div className="border-l-4 border-amber-500 pl-4">
                                            <h3 className="text-2xl font-serif text-slate-900 font-bold">General State & Biblical Land Profile</h3>
                                            <p className="text-slate-500 text-sm mt-1">Eretz Israel - A geography of divine covenants, history, and geographical diversity.</p>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-6">
                                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-[#d97706] mb-3">State Capitals & Center</h4>
                                                <div className="space-y-1.5 text-slate-600 text-sm">
                                                    <p><strong>Official Capital:</strong> Jerusalem (Yerushalayim)</p>
                                                    <p><strong>Judicial/Legal:</strong> Supreme Court of Israel</p>
                                                    <p><strong>Economic Hub:</strong> Tel Aviv-Yafo</p>
                                                </div>
                                            </div>

                                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-[#d97706] mb-3">Key State Demographics</h4>
                                                <div className="space-y-1.5 text-slate-600 text-sm">
                                                    <p><strong>Languages:</strong> Hebrew (עִבְרִית)</p>
                                                    <p><strong>Independence Day:</strong> 5th of Iyar (Yom Ha'atzmaut)</p>
                                                    <p><strong>National Flower:</strong> Cyclamen persicum (Rakefet)</p>
                                                </div>
                                            </div>

                                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-[#d97706] mb-3">National State Symbols</h4>
                                                <div className="space-y-1.5 text-slate-600 text-sm">
                                                    <p><strong>Emblem:</strong> Menorah flanked by olive branches</p>
                                                    <p><strong>Anthem:</strong> Hatikvah ("The Hope")</p>
                                                    <p><strong>National Bird:</strong> Hoopoe (Duchifat)</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-slate-600 text-sm leading-relaxed space-y-4 pt-2">
                                            <p className="text-justify">
                                                Geographically located in Western Asia, Israel borders Lebanon, Syria, Jordan, and Egypt. It sits at the absolute crossroads of Europe, Asia, and Africa. Eretz Israel contains multiple geographical ecosystems: green rolling hills in the north, Mediterranean coastlines in the west, high mountainous ridges in the center, and dry desert plains in the south.
                                            </p>
                                            <p className="text-justify">
                                                Throughout history, it has served as the anchor point of biblical history. From the early covenants with Abraham, to the kingship of David and Solomon, the birth of Yeshua (Jesus), and the prophecies of future restoration, this land remains central to scripture and modern biblical fulfillment.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'history' && (
                                    <div className="space-y-6 text-left">
                                        <div className="border-l-4 border-amber-500 pl-4">
                                            <h3 className="text-2xl font-serif text-slate-900 font-bold">Chronology of the Holy Land & Prophetic Restoration</h3>
                                            <p className="text-slate-500 text-sm mt-1">A timeline of covenant, exile, rebirth, and the fulfillment of ancient prophecy.</p>
                                        </div>

                                        {/* Timeline style list */}
                                        <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                                            {[
                                                { era: 'c. 2000 BC', title: 'The Abrahamic Covenant', text: 'God establishes a covenant with Abraham, promising the land of Canaan to his descendants as an everlasting heritage (Genesis 15:18).' },
                                                { era: 'c. 1000 BC', title: 'The Davidic Kingdom', text: 'King David unites the tribes of Israel, captures Jerusalem, and establishes it as the eternal capital. Solomon builds the First Temple.' },
                                                { era: '586 BC & AD 70', title: 'Exiles & Destruction', text: 'Destruction of the First Temple by Babylonians, followed by the Second Temple destruction by Romans in AD 70, scattering the Jewish people globally.' },
                                                { era: 'May 14, 1948', title: 'Rebirth of the Nation', text: 'Against all odds, the modern State of Israel declares independence, fulfilling Isaiah\'s prophecy: "Can a nation be born in a day?" (Isaiah 66:8).' },
                                                { era: 'Modern Era', title: 'Gathering of the Exiles (Aliyah)', text: 'Millions of Jewish people return from all four corners of the globe, as prophesied by Jeremiah and Ezekiel, restoring the land and reviving the Hebrew language.' }
                                            ].map((time, idx) => (
                                                <div key={idx} className="flex gap-4 relative">
                                                    <div className="w-9 h-9 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center text-[10px] font-black text-amber-700 z-10 shrink-0 shadow-sm">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider block">{time.era}</span>
                                                        <h4 className="font-bold text-slate-900 text-base mt-0.5">{time.title}</h4>
                                                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed mt-1">{time.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'geography' && (
                                    <div className="space-y-6 text-left">
                                        <div className="border-l-4 border-amber-500 pl-4">
                                            <h3 className="text-2xl font-serif text-slate-900 font-bold">Geographical Marvels of the Land</h3>
                                            <p className="text-slate-500 text-sm mt-1">Eretz Israel boasts highly diverse and unique ecosystems in a highly compact area.</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6 pt-2">
                                            {[
                                                { name: 'The Dead Sea (Yam HaMelah)', desc: 'The absolute lowest land elevation on Earth, sitting over 1,400 feet (430m) below sea level. Its high mineral concentrations allow effortless floating and carry ancient healing properties.' },
                                                { name: 'Sea of Galilee (Kinneret)', desc: 'Israel\'s largest freshwater lake, surrounded by rolling hills. This gorgeous basin provides water supply to the nation and was the beautiful canvas of Messiah Yeshua\'s miracles.' },
                                                { name: 'Mount Hermon (Har Hermon)', desc: 'The majestic snow-capped northern peak, representing the highest peak in Israel. Snowy waters melt and cascade southward to form the Jordan River.' },
                                                { name: 'The Jordan River (Nehar HaYarden)', desc: 'A deeply sacred river running from the north through the Jordan Rift Valley into the Dead Sea. The site of Joshua\'s crossing and Messiah Yeshua\'s baptism.' }
                                            ].map((geo, index) => (
                                                <div key={index} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex gap-4 items-start shadow-sm hover:scale-[1.01] transition-transform">
                                                    <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0 font-bold font-serif">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-base">{geo.name}</h4>
                                                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed mt-2">{geo.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'archaeology' && (
                                    <div className="space-y-6 text-left">
                                        <div className="border-l-4 border-amber-500 pl-4">
                                            <h3 className="text-2xl font-serif text-slate-900 font-bold">Archaeological Discoveries Confirming Scripture</h3>
                                            <p className="text-slate-500 text-sm mt-1">Archaeology in Israel serves as a tangible verification of biblical integrity.</p>
                                        </div>

                                        <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
                                            <p>
                                                Few places in the world have been excavated as thoroughly as Israel. Over 30,000 archaeological sites have been mapped, revealing massive historic proofs that confirm biblical narratives down to exact details, locations, and names.
                                            </p>

                                            <div className="grid md:grid-cols-2 gap-6 pt-2">
                                                <div className="p-5 rounded-2xl border border-slate-150 bg-gradient-to-br from-white to-slate-50 shadow-sm">
                                                    <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-amber-500" /> The Dead Sea Scrolls
                                                    </h4>
                                                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                                        Found in the Qumran caves in 1947. These ancient manuscripts contain parts of almost every book of the Hebrew Bible, dating back over 2,000 years, confirming that scripture remained perfectly unchanged over millennia.
                                                    </p>
                                                </div>
                                                <div className="p-5 rounded-2xl border border-slate-150 bg-gradient-to-br from-white to-slate-50 shadow-sm">
                                                    <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-amber-500" /> The Tel Dan Stele
                                                    </h4>
                                                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                                        A 9th-century BC stone inscription found in northern Israel. It contains the oldest extra-biblical reference to the "House of David" (Beit David), verifying David\'s actual historical dynasty.
                                                    </p>
                                                </div>
                                                <div className="p-5 rounded-2xl border border-slate-150 bg-gradient-to-br from-white to-slate-50 shadow-sm">
                                                    <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-amber-500" /> Temple Mount Wall (Kotel)
                                                    </h4>
                                                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                                        Massive limestone block structures built by Herod the Great around the Second Temple. They stand as a silent monument to the Temple where Yeshua Himself walked, preached, and drove out moneychangers.
                                                    </p>
                                                </div>
                                                <div className="p-5 rounded-2xl border border-slate-150 bg-gradient-to-br from-white to-slate-50 shadow-sm">
                                                    <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-amber-500" /> Pool of Siloam
                                                    </h4>
                                                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                                        The rock-cut pool in the City of David where Yeshua sent the blind man to wash, curing his sight (John 9:7). Excavated fully in 2004, confirming the gospel account\'s exact location.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'language' && (
                                    <div className="space-y-6 text-left">
                                        <div className="border-l-4 border-amber-500 pl-4">
                                            <h3 className="text-2xl font-serif text-slate-900 font-bold">The Resurrection of Hebrew (עִבְרִית)</h3>
                                            <p className="text-slate-500 text-sm mt-1">How a sacred language of antiquity was miraculously restored to common speech.</p>
                                        </div>

                                        <div className="text-slate-600 text-sm leading-relaxed space-y-4 text-justify">
                                            <p>
                                                Hebrew is the only historical language in human history that died out as a spoken everyday tongue for nearly 2,000 years, only to be resurrected as a fully functional, modern national language spoken by millions. This miraculous event aligns perfectly with Zephaniah 3:9, where God promises to "turn to the people a pure language."
                                            </p>
                                            <p>
                                                For generations, Hebrew was preserved exclusively as "Lashon HaKodesh" (The Holy Tongue) for prayer, liturgy, and sacred study. However, in the late 19th century, a visionary scholar named <strong>Eliezer Ben-Yehuda</strong> spearheaded a relentless campaign to revive Hebrew as a modern spoken language, inventing thousands of new words for modern objects while preserving ancient roots.
                                            </p>
                                        </div>

                                        <div className="p-6 rounded-[2rem] bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-[#d97706] mb-3 flex items-center gap-2">
                                                <Scroll size={14} className="text-amber-500" /> Sacred Roots and Power
                                            </h4>
                                            <p className="text-slate-700 text-xs md:text-sm leading-relaxed text-justify">
                                                In Hebrew, words are not random labels; they are formed by three-letter core roots (Shoresh) that carry intrinsic spiritual frequency. E.g., the word for hand is <strong>Yad (יד)</strong>, representing power; the word for love is <strong>Ahava (אהבה)</strong>, sharing a root that means "to give". By learning the holy tongue, we unlock deep biblical codes and ancient keys that bring us closer to the original message of the Bible.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>

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
