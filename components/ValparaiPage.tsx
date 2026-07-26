import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Mountain, History, Leaf, TrendingUp, CloudRain, Plane, Navigation, Sparkles, Scroll, ArrowRight, Video, Camera, Compass, Globe, Info, Download, Loader2 } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

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
        imgUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop"
    },
    {
        name: "Sholayar Dam",
        tamilName: "சோலையாறு அணை",
        distance: "20 km from town",
        desc: "One of the deepest and most vital dams in Asia, surrounded by massive hills and tea estates. It is a key constituent of the Aliyar-Parambikulam Hydroelectric project.",
        tamilDesc: "ஆசியாவின் மிக ஆழமான அணைகளில் ஒன்றான இது, பிரமாண்ட மலைகள் மற்றும் தேயிலை தோட்டங்களால் சூழப்பட்ட நீர்மின் திட்டத்தின் முக்கிய அங்கமாகும்.",
        tips: "Fabulous photography spot. Best visited post-monsoon when gates are opened.",
        imgUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop"
    },
    {
        name: "Chinnakallar Falls",
        tamilName: "சின்னக்கல்லார் நீர்வீழ்ச்சி",
        distance: "26 km from town",
        desc: "Known historically as the 'Cherrapunji of South India' due to its extreme annual rainfall. A hanging bridge spans across the roaring waterfall, surrounded by dense jungle.",
        tamilDesc: "தென்னிந்தியாவின் 'சிராபுஞ்சி' என்று அழைக்கப்படும் இந்த இடம், நாட்டின் அதிக மழைப்பொழிவு பெறும் பகுதிகளில் ஒன்றாகும். இங்கு அடர்ந்த காடுகளுக்கு இடையே தொங்கு பாலம் அமைந்துள்ளது.",
        tips: "Careful during heavy monsoons. Keep an eye out for elephant migrations.",
        imgUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600&auto=format&fit=crop"
    },
    {
        name: "Loam's View Point & Hairpins",
        tamilName: "லோம்ஸ் காட்சி முனை",
        distance: "Aliyar road (9th bend)",
        desc: "Located on the winding road from Pollachi to Valparai, which features 40 dramatic hairpin bends. Offers a breathtaking panoramic vista of the Aliyar Reservoir.",
        tamilDesc: "பொள்ளாச்சியிலிருந்து வால்பாறை செல்லும் 40 கொண்டைஊசி வளைவு பாதையின் 9வது வளைவில் அமைந்துள்ள ஆழியாறு அணையின் முழுமையான அழகை காட்டும் இடம்.",
        tips: "Ideal place to stop during the drive. Watch out for mischievous bonnet macaques.",
        imgUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop"
    },
    {
        name: "Balaji Temple",
        tamilName: "பாலாஜி கோவில்",
        distance: "10 km from town",
        desc: "A highly serene, beautifully manicured temple dedicated to Lord Venkateswara. Situated inside a private tea estate, it offers immense peace and spiritual solitude.",
        tamilDesc: "ஒரு தனியார் தேயிலைத் தோட்டத்திற்குள் அமைந்துள்ள இந்த வெங்கடேஸ்வரா கோவில், மிகவும் அமைதியான மற்றும் ஆன்மீக அதிர்வுகள் நிறைந்த வழிபாட்டுத் தலமாகும்.",
        tips: "Strict dress codes apply. Vehicles must be parked outside; requires a 500m walk.",
        imgUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=600&auto=format&fit=crop"
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

export const ValparaiPage: React.FC = () => {
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
            className="min-h-screen bg-slate-50 pt-32 pb-20 overflow-hidden font-sans text-slate-800 relative"
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

            {/* Interactive Sightseeing Travel Hub */}
            <div className="container mx-auto px-6 max-w-5xl mb-24">
                <div className="bg-white/70 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="text-center max-w-xl mx-auto mb-10">
                        <span className="px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black tracking-widest uppercase border border-blue-100 inline-block mb-3">
                            Scenic Explorations
                        </span>
                        <h3 className="text-3xl font-serif text-slate-950 font-bold">Interactive Destination Guide</h3>
                        <p className="text-slate-400 text-sm font-medium mt-1">
                            Click a scenic hot-spot in the sidebar to review detailed tourist guides, travel mists, and regional significance.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-12 gap-8 items-stretch">
                        {/* Left Side: Destination selector buttons */}
                        <div className="md:col-span-5 flex flex-col gap-2.5">
                            {DESTINATIONS.map((dest) => (
                                <button
                                    key={dest.name}
                                    onClick={() => setSelectedDest(dest)}
                                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                                        selectedDest?.name === dest.name
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-700 text-white shadow-md'
                                            : 'bg-white hover:bg-slate-50 border-slate-150 text-slate-700 shadow-sm'
                                    }`}
                                >
                                    <div>
                                        <h4 className="font-bold text-sm">{dest.name}</h4>
                                        <p className={`text-[10px] font-medium mt-0.5 ${selectedDest?.name === dest.name ? 'text-blue-100' : 'text-slate-450'}`}>
                                            {dest.tamilName}
                                        </p>
                                    </div>
                                    <ArrowRight size={14} className={`transition-transform ${selectedDest?.name === dest.name ? 'translate-x-1' : 'group-hover:translate-x-1 text-slate-400'}`} />
                                </button>
                            ))}
                        </div>

                        {/* Right Side: Destination detail preview panel */}
                        <div className="md:col-span-7">
                            <AnimatePresence mode="wait">
                                {selectedDest && (
                                    <motion.div
                                        key={selectedDest.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="h-full flex flex-col justify-between p-6 bg-slate-50/80 backdrop-blur-md rounded-3xl border border-slate-150 relative overflow-hidden"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900">{selectedDest.name}</h3>
                                                    <p className="text-xs text-blue-600 font-bold tracking-wide">{selectedDest.tamilName}</p>
                                                </div>
                                                <span className="px-3 py-1 bg-white text-slate-500 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                                    <MapPin size={11} className="text-blue-500" /> {selectedDest.distance}
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                <p className="text-slate-600 text-xs md:text-sm leading-relaxed text-justify">{selectedDest.desc}</p>
                                                <p className="text-slate-500 text-xs italic font-serif leading-relaxed text-justify bg-blue-500/5 px-3 py-2 rounded-lg border-l border-blue-400">{selectedDest.tamilDesc}</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-slate-200">
                                            <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider block mb-1 flex items-center gap-1">
                                                <Info size={11} /> Travel Tip & Safety
                                            </span>
                                            <p className="text-slate-500 text-xs leading-relaxed italic">{selectedDest.tips}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

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
                                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1"><MapPin size={12}/> {dest.distance}</p>
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

            {/* Wikipedia-Style Detailed Knowledge Hub */}
            <div className="container mx-auto px-6 max-w-5xl mb-24">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden shadow-lg shadow-blue-500/5">
                    {/* Tab Navigation header */}
                    <div className="flex border-b border-slate-100 bg-slate-50 flex-wrap">
                        {[
                            { id: 'heritage', label: 'History & Heritage', icon: <History size={14} /> },
                            { id: 'biodiversity', label: 'Ecology & Wildlife', icon: <Leaf size={14} /> },
                            { id: 'climate', label: 'Monsoons & Climate', icon: <CloudRain size={14} /> },
                            { id: 'estate', label: 'Estates & Infrastructure', icon: <TrendingUp size={14} /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-wider transition-all border-r border-slate-100 shrink-0 ${
                                    activeTab === tab.id
                                        ? 'bg-white text-slate-900 border-b-2 border-b-blue-600'
                                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/50'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab contents */}
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
                                {activeTab === 'heritage' && (
                                    <div className="space-y-6 text-left">
                                        <div className="border-l-4 border-blue-600 pl-4">
                                            <h3 className="text-2xl font-serif text-slate-900 font-bold">Historical Timeline of Valparai</h3>
                                            <p className="text-slate-500 text-sm mt-1">From initial commercial coffee in 1846 to the modern tea plantation era.</p>
                                        </div>

                                        <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 pt-2">
                                            {HISTORICAL_TIMELINE.map((time, idx) => (
                                                <div key={idx} className="flex gap-4 relative">
                                                    <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-400 flex items-center justify-center text-xs font-bold text-blue-700 z-10 shrink-0 shadow-sm">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-black text-blue-600 tracking-wider block">{time.year}</span>
                                                        <h4 className="font-bold text-slate-900 text-base mt-0.5">{time.title}</h4>
                                                        <p className="text-slate-500 text-xs md:text-sm leading-relaxed mt-1">{time.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'biodiversity' && (
                                    <div className="space-y-6 text-left">
                                        <div className="border-l-4 border-blue-600 pl-4">
                                            <h3 className="text-2xl font-serif text-slate-900 font-bold">Western Ghats Ecology & Anaimalai Wildlife</h3>
                                            <p className="text-slate-500 text-sm mt-1">The Anaimalai Sanctuary stands as a precious, highly protected ecological hotspot.</p>
                                        </div>

                                        <p className="text-slate-600 text-sm leading-relaxed text-justify">
                                            Valparai is entirely surrounded by the core boundaries of the Anaimalai Tiger Reserve. It contains extensive rain forest corridors that harbor highly unique and endangered species found nowhere else on earth. The core evergreen forests are heavily monitored to support seamless wildlife migration corridors.
                                        </p>

                                        <div className="grid sm:grid-cols-2 gap-6 pt-2">
                                            {[
                                                { name: "Lion-tailed Macaque (Macaque silenus)", status: "Endangered", desc: "A highly iconic arboreal old-world monkey with a striking silver-white mane. Over half of its global wild population lives in the shola forest patches of Valparai." },
                                                { name: "Nilgiri Tahr (Nilgiritragus hylocrius)", status: "Endangered", desc: "The official state animal of Tamil Nadu. An agile wild mountain ungulate residing on the steep high-altitude rocky crags of the surrounding Anaimalai range." },
                                                { name: "Indian Gaur (Bison)", status: "Vulnerable", desc: "The largest bovine species globally. Frequently seen walking peacefully through the tea bushes of private estates, grazing in massive herds." },
                                                { name: "Great Indian Hornbill (Buceros bicornis)", status: "Vulnerable", desc: "A massive, colorful canopy bird known for its roaring calls and majestic flight, fully dependent on tall, old-growth rainforest nesting trees." }
                                            ].map((animal, idx) => (
                                                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm relative overflow-hidden">
                                                    <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-md text-[8px] font-black uppercase tracking-widest absolute top-4 right-4 shadow-sm">
                                                        {animal.status}
                                                    </span>
                                                    <h4 className="font-bold text-slate-900 text-sm pr-16">{animal.name}</h4>
                                                    <p className="text-slate-500 text-xs mt-2.5 leading-relaxed text-justify">{animal.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'climate' && (
                                    <div className="space-y-6 text-left">
                                        <div className="border-l-4 border-blue-600 pl-4">
                                            <h3 className="text-2xl font-serif text-slate-900 font-bold">Climate Dynamics & Monsoon Behavior</h3>
                                            <p className="text-slate-500 text-sm mt-1">One of the wettest mountainous hill stations in the Indian subcontinent.</p>
                                        </div>

                                        <div className="grid sm:grid-cols-3 gap-4">
                                            <div className="p-5 rounded-2xl bg-sky-50 border border-sky-100 text-center">
                                                <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest block mb-1">Cherrapunji of the South</span>
                                                <span className="text-slate-900 font-bold text-base block">Chinnakallar Basin</span>
                                                <span className="text-slate-500 text-[10px] block mt-1">Highest regional rainfall in TN</span>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-purple-50 border border-purple-100 text-center">
                                                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest block mb-1">Summer Climate</span>
                                                <span className="text-slate-900 font-bold text-base block">15°C - 25°C</span>
                                                <span className="text-slate-500 text-[10px] block mt-1">Mild and pleasant weather</span>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">Winter Climate</span>
                                                <span className="text-slate-900 font-bold text-base block">10°C - 15°C</span>
                                                <span className="text-slate-500 text-[10px] block mt-1">Misty and chilly nights</span>
                                            </div>
                                        </div>

                                        <p className="text-slate-600 text-sm leading-relaxed text-justify pt-2">
                                            Valparai experiences a tropical monsoon climate. Because it stands directly in the pathway of the Western Ghats wind currents, it intercepts both the Southwest Monsoon (June to September) and the Northeast Monsoon (October to November). Heavy mists frequently settle across the tea valleys, giving the hill station its famous mystical, serene atmosphere.
                                        </p>
                                    </div>
                                )}

                                {activeTab === 'estate' && (
                                    <div className="space-y-6 text-left">
                                        <div className="border-l-4 border-blue-600 pl-4">
                                            <h3 className="text-2xl font-serif text-slate-900 font-bold">Plantation Economy & Hydro-Power Complex</h3>
                                            <p className="text-slate-500 text-sm mt-1">Industrial-scale tea cultivation and critical clean energy powerhouses.</p>
                                        </div>

                                        <p className="text-slate-600 text-sm leading-relaxed text-justify">
                                            The main driver of Valparai's economy is commercial tea manufacturing. Massive tracts of estates are owned by major tea conglomerates. The region also hosts the highly vital Parambikulam-Aliyar Project (PAP), bringing a complex network of reservoirs, dams, water channels, and deep mountain tunnels that generate massive amounts of clean hydroelectric energy for Tamil Nadu and Kerala.
                                        </p>

                                        <div className="p-6 rounded-[2rem] bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                                            <h4 className="text-xs font-black uppercase text-blue-800 tracking-wider mb-2">Sustainable Shade Culture</h4>
                                            <p className="text-slate-700 text-xs md:text-sm leading-relaxed text-justify">
                                                Due to the strict forest laws protecting surrounding reserve corridors, local tea estates practice unique shade-grown cultivation. Massive native rainforest trees are preserved directly within the plantations, allowing local wildlife herds (like gaur and birds) to live alongside humans, creating an extraordinary model of sustainable ecology.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

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
