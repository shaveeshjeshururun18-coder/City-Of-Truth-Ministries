import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Mountain, History, Leaf, TrendingUp, CloudRain, Plane, Navigation, Sparkles, Scroll, ArrowRight, Video, Camera, Compass, Globe, Info, Download, Loader2, ShieldCheck } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { PeelingStackCards, PeelingCardItem } from './ui/peeling-stack-cards';

interface DestinationData {
    name: string;
    tamilName: string;
    distance: string;
    desc: string;
    tamilDesc: string;
    tips: string;
    imgUrl: string;
}

const DESTINATIONS: DestinationData[] = [
    {
        name: "Grass Hills National Park",
        tamilName: "புல்வெளி மலைகள்",
        distance: "15 km from town",
        desc: "A stunning, highly protected high-altitude shola grassland. Located at an elevation of 2,400m, it is a designated UNESCO World Heritage Site with unparalleled scenic beauty.",
        tamilDesc: "யுனெஸ்கோ உலக பாரம்பரிய சின்னமான இந்த புல்வெளி, கடல் மட்டத்திலிருந்து 2,400 மீட்டர் உயரத்தில் அமைந்துள்ள பாதுகாக்கப்பட்ட சோலை புல்வெளி காடாகும்.",
        tips: "Prior forest department permit is strictly required. Best visited between January and May.",
        imgUrl: "/valparai/dest1.png"
    },
    {
        name: "Sholayar Dam",
        tamilName: "சோலையாறு அணை",
        distance: "20 km from town",
        desc: "One of the deepest and most vital dams in Asia, surrounded by massive hills and tea estates. It is a key constituent of the Aliyar-Parambikulam Hydroelectric project.",
        tamilDesc: "ஆசியாவின் மிக ஆழமான அணைகளில் ஒன்றான இது, பிரமாண்ட மலைகள் மற்றும் தேயிலை தோட்டங்களால் சூழப்பட்ட நீர்மின் திட்டத்தின் முக்கிய அங்கமாகும்.",
        tips: "Fabulous photography spot. Best visited post-monsoon when gates are opened.",
        imgUrl: "/valparai/dest2.png"
    },
    {
        name: "Chinnakallar Falls",
        tamilName: "சின்னக்கல்லார் நீர்வீழ்ச்சி",
        distance: "26 km from town",
        desc: "Known historically as the 'Cherrapunji of South India' due to its extreme annual rainfall. A hanging bridge spans across the roaring waterfall, surrounded by dense jungle.",
        tamilDesc: "தென்னிந்தியாவின் 'சிராபுஞ்சி' என்று அழைக்கப்படும் இந்த இடம், நாட்டின் அதிக மழைப்பொழிவு பெறும் பகுதிகளில் ஒன்றாகும். இங்கு அடர்ந்த காடுகளுக்கு இடையே தொங்கு பாலம் அமைந்துள்ளது.",
        tips: "Careful during heavy monsoons. Keep an eye out for elephant migrations.",
        imgUrl: "/valparai/dest3.png"
    },
    {
        name: "Loam's View Point & Hairpins",
        tamilName: "லோம்ஸ் காட்சி முனை",
        distance: "Aliyar road (9th bend)",
        desc: "Located on the winding road from Pollachi to Valparai, which features 40 dramatic hairpin bends. Offers a breathtaking panoramic vista of the Aliyar Reservoir.",
        tamilDesc: "பொள்ளாச்சியிலிருந்து வால்பாறை செல்லும் 40 கொண்டைஊசி வளைவு பாதையின் 9வது வளைவில் அமைந்துள்ள ஆழியாறு அணையின் முழுமையான அழகை காட்டும் இடம்.",
        tips: "Ideal place to stop during the drive. Watch out for mischievous bonnet macaques.",
        imgUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop"
    }
];

const HISTORICAL_TIMELINE = [
    {
        year: "1846",
        title: "K. Ramasamy Mudaliar's Coffee",
        desc: "The very first coffee plantation is established in the region by K. Ramasamy Mudaliar on the Karnatic Coffee Estate, marking the commercial birth of local agriculture."
    },
    {
        year: "1890",
        title: "W. Wintil & The Tea Era",
        desc: "W. Wintil, a pioneering British planter, along with associates, initiates massive, organized commercial tea cultivation, clearing dense jungles under leased forest lands."
    },
    {
        year: "1903",
        title: "Roadways & 40 Hairpins",
        desc: "Construction of the dramatic ghat road connecting Pollachi to Valparai begins, carving 40 precise hairpin bends to facilitate tea transport and connectivity."
    },
    {
        year: "1960s",
        title: "The Hydroelectric Boom",
        desc: "Establishment of the Parambikulam Aliyar Project (PAP), bringing massive hydrology dams, tunnels, and deep mountain powerhouse networks into full operation."
    },
    {
        year: "2007",
        title: "Anaimalai Tiger Reserve",
        desc: "The surrounding sanctuary is declared a Tiger Reserve, placing heavy focus on protecting the precious biodiversity, rainforest corridors, and rare fauna."
    }
];

const letterContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
};

const letterChild = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring" as const, stiffness: 100 }
    }
};

export const ValparaiPage: React.FC<{ setView?: any }> = () => {
    const [selectedDest, setSelectedDest] = useState<DestinationData | null>(DESTINATIONS[0]);
    const [activeTab, setActiveTab] = useState<'heritage' | 'biodiversity' | 'climate' | 'estate'>('heritage');
    const [isExporting, setIsExporting] = useState(false);
    const pdfRef = useRef<HTMLDivElement>(null);

    const handleDownloadPDF = async () => {
        if (!pdfRef.current) return;
        setIsExporting(true);
        const TABS: Array<'heritage' | 'biodiversity' | 'climate' | 'estate'> = ['heritage', 'biodiversity', 'climate', 'estate'];
        const savedTab = activeTab;
        const savedDest = selectedDest;
        try {
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            let isFirstPage = true;

            const captureAndAppend = async () => {
                if (!pdfRef.current) return;
                await new Promise(r => setTimeout(r, 400));
                const dataUrl = await toJpeg(pdfRef.current, {
                    quality: 0.97, backgroundColor: '#f8fafc',
                    cacheBust: true, pixelRatio: 2
                });
                const img = new Image();
                img.src = dataUrl;
                await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(); });
                const imgRatio = img.height / img.width;
                const imgHeight = pageWidth * imgRatio;
                let pos = 0, heightLeft = imgHeight;
                if (!isFirstPage) pdf.addPage(); else isFirstPage = false;
                pdf.addImage(dataUrl, 'JPEG', 0, pos, pageWidth, imgHeight);
                heightLeft -= pageHeight;
                while (heightLeft > 0) {
                    pos = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(dataUrl, 'JPEG', 0, pos, pageWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
            };

            // Capture each destination with each info tab — nothing omitted
            for (const dest of DESTINATIONS) {
                setSelectedDest(dest);
                for (const tab of TABS) {
                    setActiveTab(tab);
                    await captureAndAppend();
                }
            }

            pdf.save('COT-Valparai-Complete-Guide.pdf');
        } catch (error) {
            console.error('Failed to export PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setActiveTab(savedTab);
            setSelectedDest(savedDest);
            setIsExporting(false);
        }
    };


    return (
        <motion.div
            ref={pdfRef}
            key="valparai"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-slate-50 pt-32 pb-20 font-sans text-slate-800 relative"
        >
            <style>{`
                @keyframes pulseSlow {
                    0%, 100% { opacity: 0.3; transform: scale(1) translate(-50%, -50%); }
                    50% { opacity: 0.6; transform: scale(1.1) translate(-48%, -52%); }
                }
                .animate-pulse-slow {
                    animation: pulseSlow 12s ease-in-out infinite;
                }
            `}</style>

            {/* Premium Light Theme Hero Section matching the Screenshot */}
            <div className="container mx-auto px-6 max-w-4xl text-center mb-16 relative">
                {/* Ambient glow decoration from blue to amber */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/50 to-amber-100/50 rounded-full blur-[100px] -z-10 animate-pulse-slow"></div>

                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 md:gap-3 border border-amber-200 bg-white/60 backdrop-blur-sm px-4 md:px-8 py-2 md:py-3 rounded-full mb-8 md:mb-10 shadow-lg shadow-amber-500/10"
                >
                    <Sparkles size={14} className="text-amber-500 fill-amber-500 animate-pulse" />
                    <span className="uppercase tracking-[0.15em] md:tracking-[0.25em] font-bold text-[10px] md:text-xs text-amber-700">The 7th Heaven</span>
                    <Sparkles size={14} className="text-amber-500 fill-amber-500 animate-pulse" />
                </motion.div>

                {/* Massive Title in beautiful blue gradient */}
                <motion.div
                    variants={letterContainer}
                    initial="hidden"
                    animate="visible"
                    className="flex justify-center flex-wrap gap-1 md:gap-2 mb-6"
                >
                    {Array.from("VALPARAI").map((char, index) => (
                        <motion.span
                            key={index}
                            variants={letterChild}
                            whileHover={{ y: -10, color: '#2563eb' }}
                            className="text-5xl sm:text-7xl md:text-9xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#1e3a8a] via-[#3b82f6] to-[#1e3a8a] tracking-tight drop-shadow-sm inline-block transition-colors duration-300"
                            style={{ textShadow: '0 10px 30px rgba(59, 130, 246, 0.2)' }}
                        >
                            {char}
                        </motion.span>
                    ))}
                </motion.div>

                {/* Light purple sub-header card */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="bg-white/80 backdrop-blur-md px-6 md:px-10 py-2 md:py-3 rounded-2xl inline-block mb-10 md:mb-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-100"
                >
                    <h2 className="text-2xl md:text-3xl font-serif text-[#7e22ce] font-bold tracking-wide">வால்பாறை</h2>
                </motion.div>

                {/* Description text matching exact wording and style of the screenshot */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-gray-600 font-serif text-lg md:text-2xl leading-relaxed max-w-2xl mx-auto px-4 md:px-0"
                >
                    A sanctuary in the clouds. <span className="italic font-bold text-brand-700">Valparai</span> is a scenic hill station in the Anaimalai Hills. Located <span className="font-bold text-gray-900 bg-amber-100 px-2 py-0.5 rounded">3,474 feet</span> above sea level.
                </motion.p>
            </div>

            {/* Wikipedia-Style Fact Grid */}
            <div className="container mx-auto px-6 max-w-5xl mb-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { title: "Altitude", value: "3,474 ft (1,059 m)", desc: "High Elevation", color: "text-blue-600" },
                        { title: "District", value: "Coimbatore", desc: "Tamil Nadu, India", color: "text-purple-600" },
                        { title: "Primary Language", value: "Tamil (தமிழ்)", desc: "100% Local Tongue", color: "text-amber-600" },
                        { title: "Key Economy", value: "Tea & Coffee", desc: "Estates & Tourism", color: "text-indigo-600" }
                    ].map((fact, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -4 }}
                            className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col justify-center"
                        >
                            <span className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${fact.color}`}>{fact.title}</span>
                            <span className="text-slate-900 font-bold text-base leading-tight block">{fact.value}</span>
                            <span className="text-slate-400 text-[10px] mt-1 block">{fact.desc}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* 3D Peeling Stacking Cards - Scenic Explorations (Destinations) */}
            {(() => {
                const destinationCards: PeelingCardItem[] = DESTINATIONS.map((dest, index) => {
                    let themeGradient = 'from-[#052e16] via-[#064e3b] to-[#022c22]';
                    let borderColor = 'border-emerald-500/35';
                    let badgeText = `Destination 0${index + 1} · High-Altitude Shola`;
                    let badgeIcon = <Mountain size={12} className="text-emerald-400" />;

                    if (index === 1) {
                        themeGradient = 'from-[#082f49] via-[#075985] to-[#0c4a6e]';
                        borderColor = 'border-cyan-500/35';
                        badgeText = `Destination 0${index + 1} · Deep Mountain Reservoir`;
                        badgeIcon = <Compass size={12} className="text-cyan-400" />;
                    } else if (index === 2) {
                        themeGradient = 'from-[#1e1b4b] via-[#312e81] to-[#0f172a]';
                        borderColor = 'border-indigo-500/35';
                        badgeText = `Destination 0${index + 1} · South Indian Cherrapunji`;
                        badgeIcon = <CloudRain size={12} className="text-indigo-400" />;
                    } else if (index === 3) {
                        themeGradient = 'from-[#451a03] via-[#78350f] to-[#1c1917]';
                        borderColor = 'border-amber-500/35';
                        badgeText = `Destination 0${index + 1} · 40 Hairpin Ghat Bend`;
                        badgeIcon = <MapPin size={12} className="text-amber-400" />;
                    }

                    return {
                        id: `dest-${index}`,
                        tabLabel: dest.name.split(' (')[0].replace(' & Hairpins', ''),
                        tabIcon: <MapPin size={14} />,
                        stageBadge: badgeText,
                        badgeIcon,
                        title: dest.name,
                        tamilTitle: dest.tamilName,
                        subtitle: `${dest.distance} · ${dest.tips}`,
                        themeGradient,
                        borderColor,
                        content: (
                            <div className="space-y-4 text-left">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 text-white/90 text-xs font-mono font-bold">
                                    <MapPin size={13} className="text-amber-400" />
                                    <span>{dest.distance}</span>
                                </div>

                                <p className="text-white/85 text-xs sm:text-sm leading-relaxed text-justify">
                                    {dest.desc}
                                </p>

                                <div className="p-3.5 rounded-2xl bg-amber-500/10 border-l-4 border-amber-400 backdrop-blur-sm">
                                    <div className="text-[10px] font-black uppercase tracking-wider text-amber-300 mb-1">
                                        தமிழ் விளக்கம் (Tamil Summary)
                                    </div>
                                    <p className="text-amber-100/90 text-xs sm:text-sm font-serif leading-relaxed italic text-justify">
                                        {dest.tamilDesc}
                                    </p>
                                </div>

                                <div className="pt-2 flex items-center justify-between text-[11px] text-white/70 font-semibold border-t border-white/10">
                                    <span className="flex items-center gap-1.5 text-amber-300">
                                        <Info size={13} className="text-amber-400 shrink-0" />
                                        <span>{dest.tips}</span>
                                    </span>
                                </div>
                            </div>
                        ),
                        visualSide: (
                            <div className="w-full h-full min-h-[280px] sm:min-h-[340px] rounded-3xl overflow-hidden border-2 border-amber-400/40 shadow-2xl relative group/visual flex flex-col justify-end p-4">
                                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-400/80 z-20" />
                                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-400/80 z-20" />
                                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-400/80 z-20" />
                                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-400/80 z-20" />

                                <img
                                    src={dest.imgUrl}
                                    alt={dest.name}
                                    className="absolute inset-0 w-full h-full object-cover group-hover/visual:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                                <div className="relative z-10 flex items-center justify-between text-white text-xs font-serif">
                                    <span className="font-bold text-amber-300 text-sm drop-shadow">{dest.tamilName}</span>
                                    <span className="px-2.5 py-0.5 rounded-full bg-black/70 border border-white/25 text-[10px] font-sans font-bold">
                                        Full Color Archive
                                    </span>
                                </div>
                            </div>
                        )
                    };
                });

                return (
                    <PeelingStackCards
                        badgeLabel="Scenic Explorations"
                        title="Interactive Destination Guide"
                        tamilTitle="வால்பாறை முக்கிய சுற்றுலா இடங்கள்"
                        subtitle="Explore detailed tourist guides, scenic waterfalls, high-altitude grasslands, and mountain reservoirs across Valparai."
                        items={destinationCards}
                        className="mb-24"
                    />
                );
            })()}

            {/* Download PDF Button */}
            <div className="container mx-auto px-6 max-w-5xl mb-8 flex justify-end">
                <button
                    onClick={handleDownloadPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 font-black text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
                >
                    {isExporting ? (
                        <><Loader2 size={16} className="animate-spin" /> Generating PDF...</>
                    ) : (
                        <><Download size={16} /> Download Guide PDF</>
                    )}
                </button>
            </div>

            {/* Hidden Printable PDF Section */}
            <div className="fixed left-[-9999px] top-0 pointer-events-none opacity-100 z-[-50]">
                <div ref={pdfRef} className="w-[800px] bg-white p-12 text-slate-800 font-serif">
                    <div className="text-center mb-8 border-b-2 border-blue-100 pb-6">
                        <h1 className="text-4xl font-bold text-blue-900 mb-2">Valparai Travel Guide</h1>
                        <h2 className="text-xl text-blue-600 mb-4">City of Truth Ministries - Information Hub</h2>
                        <p className="text-slate-600 italic">A comprehensive guide to the ecology, history, and destinations of Valparai.</p>
                    </div>

                    <div className="space-y-10">
                        {/* Destinations */}
                        <div>
                            <h3 className="text-2xl font-bold text-blue-800 border-b border-blue-50 mb-4 pb-2">Top Destinations</h3>
                            {DESTINATIONS.map((dest, idx) => (
                                <div key={idx} className="mb-6">
                                    <h4 className="text-lg font-bold text-slate-900">{dest.name} <span className="text-sm font-normal text-blue-600">({dest.tamilName})</span></h4>
                                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1"><MapPin size={12} /> {dest.distance}</p>
                                    <p className="text-sm text-slate-700 mb-2 leading-relaxed">{dest.desc}</p>
                                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded border-l-2 border-slate-200">{dest.tips}</p>
                                </div>
                            ))}
                        </div>

                        {/* History */}
                        <div>
                            <h3 className="text-2xl font-bold text-blue-800 border-b border-blue-50 mb-4 pb-2">Historical Timeline</h3>
                            <div className="space-y-4 pl-4 border-l-2 border-blue-100">
                                {HISTORICAL_TIMELINE.map((time, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span className="text-xs font-bold text-blue-600">{time.year}</span>
                                        <h4 className="font-bold text-slate-900">{time.title}</h4>
                                        <p className="text-sm text-slate-700">{time.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ecology */}
                        <div>
                            <h3 className="text-2xl font-bold text-blue-800 border-b border-blue-50 mb-4 pb-2">Ecology & Wildlife</h3>
                            <p className="text-sm text-slate-700 mb-4">Valparai is surrounded by the Anaimalai Tiger Reserve, containing extensive rainforest corridors protecting unique and endangered species.</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 rounded">
                                    <h4 className="font-bold text-sm">Lion-tailed Macaque</h4>
                                    <p className="text-xs text-slate-600">Endangered. Iconic arboreal monkey with silver-white mane.</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded">
                                    <h4 className="font-bold text-sm">Nilgiri Tahr</h4>
                                    <p className="text-xs text-slate-600">Endangered. State animal of TN, mountain ungulate.</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded">
                                    <h4 className="font-bold text-sm">Indian Gaur (Bison)</h4>
                                    <p className="text-xs text-slate-600">Vulnerable. Largest bovine species.</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded">
                                    <h4 className="font-bold text-sm">Great Indian Hornbill</h4>
                                    <p className="text-xs text-slate-600">Vulnerable. Massive canopy bird.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-6 border-t border-slate-200 text-center">
                        <p className="text-sm font-bold text-blue-900 uppercase tracking-widest">City of Truth Ministries</p>
                        <p className="text-xs text-slate-500 mt-1">© {new Date().getFullYear()} City of Truth Ministries · All rights reserved · Valparai, TN, India</p>
                    </div>
                </div>
            </div>

            {/* 3D Peeling Stacking Cards - Detailed Knowledge Hub */}
            {(() => {
                const valparaiKnowledgeCards: PeelingCardItem[] = [
                    {
                        id: 'heritage',
                        tabLabel: 'History & Heritage',
                        tabIcon: <History size={14} />,
                        stageBadge: 'Stage 01 · 1846–2007 CE',
                        badgeIcon: <History size={12} className="text-amber-400" />,
                        title: 'Historical Timeline of Valparai',
                        tamilTitle: 'வரலாற்று காலவரிசை',
                        subtitle: 'From initial commercial coffee in 1846 to the modern tea plantation era.',
                        themeGradient: 'from-[#1c1917] via-[#292524] to-[#451a03]',
                        borderColor: 'border-amber-500/30',
                        content: (
                            <div className="space-y-4 text-left">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {HISTORICAL_TIMELINE.map((time, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-amber-500/20 hover:border-amber-500/40 transition-all group/item"
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30">
                                                    {time.year}
                                                </span>
                                                <span className="text-[10px] text-amber-200/60 uppercase tracking-widest font-mono">
                                                    MILESTONE 0{idx + 1}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-white text-sm group-hover/item:text-amber-200 transition-colors">
                                                {time.title}
                                            </h4>
                                            <p className="text-white/70 text-xs mt-1.5 leading-relaxed">
                                                {time.desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ),
                        visualSide: (
                            <div className="w-full h-full min-h-[260px] p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-amber-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden group/visual">
                                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400/60" />
                                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400/60" />
                                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400/60" />
                                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400/60" />

                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border-2 border-amber-400/40 flex items-center justify-center mb-4 shadow-xl group-hover/visual:scale-110 transition-transform duration-500">
                                    <Compass size={36} className="text-amber-400 animate-spin-slow" />
                                </div>

                                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold tracking-widest uppercase mb-2 border border-amber-500/30">
                                    40 Hairpin Ghats
                                </span>
                                <h5 className="font-serif font-bold text-base text-white">Pollachi · Valparai Corridor</h5>
                                <p className="text-amber-200/70 text-xs mt-1 max-w-[240px]">
                                    Engineered in 1903 to connect dense jungle plateaus with colonial trading hubs.
                                </p>
                            </div>
                        )
                    },
                    {
                        id: 'biodiversity',
                        tabLabel: 'Ecology & Wildlife',
                        tabIcon: <Leaf size={14} />,
                        stageBadge: 'Stage 02 · Western Ghats Bio-Corridor',
                        badgeIcon: <Leaf size={12} className="text-emerald-400" />,
                        title: 'Western Ghats Ecology & Anaimalai Wildlife',
                        tamilTitle: 'வனவிலங்கு மற்றும் சூழலியல்',
                        subtitle: 'The Anaimalai Sanctuary stands as a precious, highly protected ecological hotspot.',
                        themeGradient: 'from-[#022c22] via-[#064e3b] to-[#042f2e]',
                        borderColor: 'border-emerald-500/30',
                        content: (
                            <div className="space-y-4 text-left">
                                <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed text-justify">
                                    Valparai is entirely surrounded by the core boundaries of the Anaimalai Tiger Reserve. It contains extensive rainforest corridors that harbor highly unique and endangered species found nowhere else on earth.
                                </p>
                                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                                    {[
                                        { name: "Lion-tailed Macaque", status: "Endangered", tag: "Endemic Arboreal", desc: "Over half of the world's wild population thrives in Valparai's shola forest patches." },
                                        { name: "Nilgiri Tahr", status: "Endangered", tag: "TN State Animal", desc: "Mountain ungulates scaling the high-altitude rocky crags and grassy cliffs." },
                                        { name: "Indian Gaur (Bison)", status: "Vulnerable", tag: "Largest Bovine", desc: "Massive herds peacefully grazing among private tea estate bushes." },
                                        { name: "Great Indian Hornbill", status: "Vulnerable", tag: "Canopy Giant", desc: "Spectacular canopy bird nesting in tall, old-growth rainforest trees." }
                                    ].map((animal, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3.5 rounded-2xl bg-black/40 backdrop-blur-md border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-white text-xs">{animal.name}</span>
                                                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[9px] font-black uppercase tracking-wider">
                                                    {animal.status}
                                                </span>
                                            </div>
                                            <p className="text-emerald-300/70 text-[10px] font-mono mb-1">{animal.tag}</p>
                                            <p className="text-white/70 text-xs leading-relaxed">{animal.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ),
                        visualSide: (
                            <div className="w-full h-full min-h-[260px] p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-emerald-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden group/visual">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 border-2 border-emerald-400/40 flex items-center justify-center mb-4 shadow-xl group-hover/visual:scale-110 transition-transform duration-500">
                                    <Leaf size={36} className="text-emerald-400 animate-pulse" />
                                </div>

                                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold tracking-widest uppercase mb-2 border border-emerald-500/30">
                                    UNESCO World Heritage
                                </span>
                                <h5 className="font-serif font-bold text-base text-white">Anaimalai Tiger Reserve</h5>
                                <p className="text-emerald-200/70 text-xs mt-1 max-w-[240px]">
                                    Continuous evergreen rainforest canopy supporting seamless wildlife migrations.
                                </p>
                            </div>
                        )
                    },
                    {
                        id: 'climate',
                        tabLabel: 'Monsoons & Climate',
                        tabIcon: <CloudRain size={14} />,
                        stageBadge: 'Stage 03 · High Mist Elevation',
                        badgeIcon: <CloudRain size={12} className="text-sky-400" />,
                        title: 'Climate Dynamics & Monsoon Behavior',
                        tamilTitle: 'பருவமழை மற்றும் காலநிலை',
                        subtitle: 'One of the wettest mountainous hill stations in the Indian subcontinent.',
                        themeGradient: 'from-[#08121f] via-[#0c4a6e] to-[#07284b]',
                        borderColor: 'border-sky-500/30',
                        content: (
                            <div className="space-y-4 text-left">
                                <div className="grid sm:grid-cols-3 gap-3">
                                    <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-sky-500/20 text-center">
                                        <span className="text-[10px] font-black text-sky-300 uppercase tracking-widest block mb-1">Cherrapunji of the South</span>
                                        <span className="text-white font-bold text-base block">Chinnakallar Basin</span>
                                        <span className="text-white/60 text-[10px] block mt-1">Highest regional rainfall in TN</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-sky-500/20 text-center">
                                        <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest block mb-1">Summer Climate</span>
                                        <span className="text-white font-bold text-base block">15°C - 25°C</span>
                                        <span className="text-white/60 text-[10px] block mt-1">Mild and pleasant alpine air</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-sky-500/20 text-center">
                                        <span className="text-[10px] font-black text-sky-300 uppercase tracking-widest block mb-1">Winter Climate</span>
                                        <span className="text-white font-bold text-base block">10°C - 15°C</span>
                                        <span className="text-white/60 text-[10px] block mt-1">Misty and chilly nights</span>
                                    </div>
                                </div>
                                <p className="text-white/80 text-xs sm:text-sm leading-relaxed text-justify">
                                    Valparai experiences a tropical monsoon climate, intercepting both the Southwest Monsoon (June to September) and Northeast Monsoon (October to November). Heavy mists frequently settle across the tea valleys, giving the hill station its famous mystical atmosphere.
                                </p>
                            </div>
                        ),
                        visualSide: (
                            <div className="w-full h-full min-h-[260px] p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-sky-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden group/visual">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-400/20 to-sky-600/10 border-2 border-sky-400/40 flex items-center justify-center mb-4 shadow-xl group-hover/visual:scale-110 transition-transform duration-500">
                                    <CloudRain size={36} className="text-sky-400 animate-bounce" />
                                </div>

                                <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold tracking-widest uppercase mb-2 border border-sky-500/30">
                                    Dual Monsoon Hub
                                </span>
                                <h5 className="font-serif font-bold text-base text-white">Chinnakallar Precipitation</h5>
                                <p className="text-sky-200/70 text-xs mt-1 max-w-[240px]">
                                    Ranking among the top high-volume precipitation basins in the Indian subcontinent.
                                </p>
                            </div>
                        )
                    },
                    {
                        id: 'estate',
                        tabLabel: 'Estates & Infrastructure',
                        tabIcon: <TrendingUp size={14} />,
                        stageBadge: 'Stage 04 · Green Economy',
                        badgeIcon: <TrendingUp size={12} className="text-indigo-400" />,
                        title: 'Plantation Economy & Hydro-Power Complex',
                        tamilTitle: 'தேயிலை மற்றும் நீர்மின் திட்டம்',
                        subtitle: 'Industrial-scale tea cultivation and critical clean energy powerhouses.',
                        themeGradient: 'from-[#1e1b4b] via-[#1e3a8a] to-[#064e3b]',
                        borderColor: 'border-indigo-500/30',
                        content: (
                            <div className="space-y-4 text-left">
                                <p className="text-white/80 text-xs sm:text-sm leading-relaxed text-justify">
                                    The main driver of Valparai's economy is commercial tea manufacturing. The region also hosts the vital Parambikulam-Aliyar Project (PAP), bringing a complex network of reservoirs, dams, water channels, and deep mountain tunnels generating massive clean hydroelectric energy.
                                </p>
                                <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-indigo-500/25">
                                    <h4 className="text-xs font-black uppercase text-indigo-300 tracking-wider mb-1.5 flex items-center gap-1.5">
                                        <Leaf size={13} className="text-emerald-400" /> Sustainable Shade Culture
                                    </h4>
                                    <p className="text-white/75 text-xs sm:text-sm leading-relaxed text-justify">
                                        Due to strict reserve laws, local tea estates practice unique shade-grown cultivation, preserving massive native rainforest trees directly within the plantations so local wildlife herds can live alongside agriculture.
                                    </p>
                                </div>
                            </div>
                        ),
                        visualSide: (
                            <div className="w-full h-full min-h-[260px] p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-indigo-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden group/visual">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400/20 to-emerald-600/10 border-2 border-indigo-400/40 flex items-center justify-center mb-4 shadow-xl group-hover/visual:scale-110 transition-transform duration-500">
                                    <TrendingUp size={36} className="text-indigo-400" />
                                </div>

                                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold tracking-widest uppercase mb-2 border border-indigo-500/30">
                                    Hydro & Agro Synergy
                                </span>
                                <h5 className="font-serif font-bold text-base text-white">PAP Hydroelectric Complex</h5>
                                <p className="text-indigo-200/70 text-xs mt-1 max-w-[240px]">
                                    Sholayar Dam powerhouse and deep underground flume tunnels powering South India.
                                </p>
                            </div>
                        )
                    }
                ];

                return (
                    <PeelingStackCards
                        badgeLabel="Interactive Knowledge Stacks"
                        title="Detailed Knowledge Hub"
                        tamilTitle="வால்பாறை களஞ்சியம்"
                        subtitle="Scroll down to explore the 3D peeling stacking cards covering history, ecology, climate, and estate infrastructure."
                        items={valparaiKnowledgeCards}
                        defaultViewMode="stack"
                    />
                );
            })()}

            {/* City of Truth Ministries local Sanctuary Spotlight in Light Blue/Purple/Amber Gradient */}
            <div className="container mx-auto px-6 max-w-5xl mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-[2.5rem] p-8 md:p-12 border border-blue-500/10 shadow-2xl text-left relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08)_0%,transparent_60%)] pointer-events-none" />

                    <div className="max-w-2xl relative z-10 space-y-5">
                        <span className="px-3.5 py-1.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-black tracking-widest uppercase border border-blue-400/20 inline-block">
                            Spiritual Anchor
                        </span>

                        <h3 className="text-3xl md:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-100 to-blue-400">
                            Valparai Sanctuary
                        </h3>

                        <p className="text-slate-300 text-sm md:text-base leading-relaxed text-justify font-light">
                            Experience the peaceful serenity of worship at our physical sanctuary nestled among the misty hills. We are dedicated to sharing the divine truth, establishing community outreach, and holding sacred services for spiritual growth.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4 pt-4 text-xs font-bold text-blue-200">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider block mb-1">Weekly Services</span>
                                <p className="text-white text-sm">Sunday Worship: 9:30 AM</p>
                                <p className="text-white text-sm">Wednesday Devotional: 6:30 PM</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-center">
                                <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider block mb-1">Sanctuary Address</span>
                                <p className="text-white text-sm">New Market Road, Valparai</p>
                                <p className="text-white text-xs opacity-75">Coimbatore, Tamil Nadu, 642127</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10 mt-6">
                            <div className="flex justify-center">
                                <a
                                    href="/சத்திய_நகரம்_City_of_Truth_Min.mp4"
                                    download="City_of_Truth_Ministries_Valparai.mp4"
                                    className="group relative inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden"
                                >
                                    <span className="pointer-events-none absolute -inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-50 group-hover:animate-pulse" />
                                    <Video size={16} />
                                    Download Video
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Existing Preview Links Section */}
            <div className="container mx-auto px-6 max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-[2rem] border border-slate-200 shadow-md p-8 shadow-lg shadow-slate-100"
                >
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-serif font-bold text-slate-900">Valparai Reference Links</h3>
                        <p className="text-slate-500 text-sm mt-1">Connect with our official media and explore Tamil Wikipedia details.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a
                            href="https://youtube.com/@cotministries?si=A6179oNRuuJ9snjM"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group rounded-2xl border border-red-100 bg-red-50 p-5 hover:bg-red-100 transition-colors block text-left"
                        >
                            <div className="flex items-center gap-3 mb-2 text-red-700">
                                <Video size={20} />
                                <h4 className="font-bold text-base">COT Ministries YouTube</h4>
                            </div>
                            <p className="text-xs text-red-900/70 leading-relaxed">Watch COT ministries live streams, worship videos, and hill community news.</p>
                            <span className="inline-flex items-center gap-2 mt-3 text-xs font-black uppercase tracking-wider text-red-700">Open Channel <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" /></span>
                        </a>
                        <a
                            href="https://ta.wikipedia.org/wiki/%E0%AE%B5%E0%AE%BE%E0%AE%B%E0%AF%8D%E0%AE%AA%E0%AE%BE%E0%AE%B1%E0%AF%88"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group rounded-2xl border border-blue-100 bg-blue-50 p-5 hover:bg-blue-100 transition-colors block text-left"
                        >
                            <div className="flex items-center gap-3 mb-2 text-blue-700">
                                <Globe size={20} />
                                <h4 className="font-bold text-base">Valparai Tamil Wikipedia</h4>
                            </div>
                            <p className="text-xs text-blue-900/70 leading-relaxed">Explore official administrative records and encyclopedic data in Tamil.</p>
                            <span className="inline-flex items-center gap-2 mt-3 text-xs font-black uppercase tracking-wider text-blue-700">Open Wikipedia <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" /></span>
                        </a>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ValparaiPage;
