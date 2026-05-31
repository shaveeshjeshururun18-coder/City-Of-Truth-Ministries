import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Mountain, History, Leaf, TrendingUp, CloudRain, Plane, Navigation, Sparkles, Scroll, ArrowRight, Video, Camera, Compass, Globe, Thermometer, ShieldCheck, Info } from 'lucide-react';

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

export const ValparaiPage: React.FC = () => {
    const [selectedDest, setSelectedDest] = useState<DestinationData | null>(DESTINATIONS[0]);
    const [activeTab, setActiveTab] = useState<'heritage' | 'biodiversity' | 'climate' | 'estate'>('heritage');

    return (
        <motion.div
            key="valparai"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 pt-24 pb-20 overflow-hidden font-sans text-slate-800"
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

            {/* Premium Parallax-like Hero Section */}
            <div className="container mx-auto px-6 max-w-5xl text-center mb-16 relative">
                {/* Ambient glow decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-r from-emerald-100/50 to-sky-100/50 rounded-full blur-[100px] -z-10 animate-pulse-slow"></div>

                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="inline-flex items-center gap-2 border border-emerald-200 bg-emerald-50/70 backdrop-blur-md px-5 py-2 rounded-full mb-8 shadow-sm"
                >
                    <Sparkles size={14} className="text-emerald-600 animate-pulse" />
                    <span className="uppercase tracking-[0.2em] font-black text-[10px] text-emerald-800">
                        THE 7TH HEAVEN · வால்பாறை
                    </span>
                    <Sparkles size={14} className="text-emerald-600 animate-pulse" />
                </motion.div>

                {/* Massive Title with Hover Letters */}
                <div className="flex justify-center flex-wrap gap-1 md:gap-2 mb-6">
                    {Array.from("VALPARAI").map((char, index) => (
                        <motion.span
                            key={index}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 80, delay: index * 0.05 }}
                            whileHover={{ y: -8, color: '#059669' }}
                            className="text-5xl sm:text-7xl md:text-8xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 tracking-tight drop-shadow-sm inline-block cursor-default transition-colors duration-300"
                        >
                            {char}
                        </motion.span>
                    ))}
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="bg-emerald-500/10 backdrop-blur-md px-6 py-2.5 rounded-2xl inline-block mb-8 border border-emerald-500/20"
                >
                    <h2 className="text-xl md:text-2xl font-serif text-emerald-800 font-bold tracking-widest">வால்பாறை மலைவாழிடம்</h2>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-slate-500 font-serif text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
                >
                    A glorious sanctuary in the clouds. Nestled in the Anaimalai Hills range of the Western Ghats, elevated beautifully at <span className="font-bold text-slate-800 bg-emerald-100/70 px-2 py-0.5 rounded">3,474 feet (1,059 m)</span> above sea level.
                </motion.p>
            </div>

            {/* Wikipedia-Style Fact Grid */}
            <div className="container mx-auto px-6 max-w-5xl mb-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { title: "Altitude", value: "3,474 ft (1,059 m)", desc: "High Elevation" },
                        { title: "District", value: "Coimbatore", desc: "Tamil Nadu, India" },
                        { title: "Primary Language", value: "Tamil (தமிழ்)", desc: "100% Local Tongue" },
                        { title: "Key Economy", value: "Tea & Coffee", desc: "Estates & Tourism" }
                    ].map((fact, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -4 }}
                            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col justify-center"
                        >
                            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider block mb-1">{fact.title}</span>
                            <span className="text-slate-900 font-bold text-base leading-tight block">{fact.value}</span>
                            <span className="text-slate-400 text-[10px] mt-1 block">{fact.desc}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Interactive Sightseeing Travel Hub */}
            <div className="container mx-auto px-6 max-w-5xl mb-24">
                <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="text-center max-w-xl mx-auto mb-10">
                        <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black tracking-widest uppercase border border-emerald-100 inline-block mb-3">
                            Scenic Explorations
                        </span>
                        <h3 className="text-3xl font-serif text-slate-950 font-bold">Interactive Destination Guide</h3>
                        <p className="text-slate-400 text-sm font-medium mt-1">
                            Click a scenic hot-spot in the sidebar to review detailed tourist guides, travel tips, and regional significance.
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
                                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-600 text-white shadow-md'
                                            : 'bg-slate-50 hover:bg-slate-100 border-slate-150 text-slate-700'
                                    }`}
                                >
                                    <div>
                                        <h4 className="font-bold text-sm">{dest.name}</h4>
                                        <p className={`text-[10px] font-medium mt-0.5 ${selectedDest?.name === dest.name ? 'text-emerald-100' : 'text-slate-400'}`}>
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
                                        className="h-full flex flex-col justify-between p-6 bg-slate-50 rounded-3xl border border-slate-150 relative overflow-hidden"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900">{selectedDest.name}</h3>
                                                    <p className="text-xs text-emerald-600 font-bold tracking-wide">{selectedDest.tamilName}</p>
                                                </div>
                                                <span className="px-3 py-1 bg-white text-slate-500 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                                    <MapPin size={11} className="text-emerald-500" /> {selectedDest.distance}
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                <p className="text-slate-600 text-xs md:text-sm leading-relaxed text-justify">{selectedDest.desc}</p>
                                                <p className="text-slate-500 text-xs italic font-serif leading-relaxed text-justify bg-emerald-500/5 px-3 py-2 rounded-lg border-l border-emerald-400">{selectedDest.tamilDesc}</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-slate-200">
                                            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider block mb-1 flex items-center gap-1">
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

            {/* Wikipedia-Style Detailed Knowledge Hub */}
            <div className="container mx-auto px-6 max-w-5xl mb-24">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
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
                                        ? 'bg-white text-slate-900 border-b-2 border-b-emerald-500'
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
                                        <div className="border-l-4 border-emerald-500 pl-4">
                                            <h3 className="text-2xl font-serif text-slate-900 font-bold">Historical Timeline of Valparai</h3>
                                            <p className="text-slate-500 text-sm mt-1">From initial commercial coffee in 1846 to the modern tea plantation era.</p>
                                        </div>

                                        <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 pt-2">
                                            {HISTORICAL_TIMELINE.map((time, idx) => (
                                                <div key={idx} className="flex gap-4 relative">
                                                    <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-400 flex items-center justify-center text-xs font-bold text-emerald-700 z-10 shrink-0 shadow-sm">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-black text-emerald-600 tracking-wider block">{time.year}</span>
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
                                        <div className="border-l-4 border-emerald-500 pl-4">
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
                                        <div className="border-l-4 border-emerald-500 pl-4">
                                            <h3 className="text-2xl font-serif text-slate-900 font-bold">Climate Dynamics & Monsoon Behavior</h3>
                                            <p className="text-slate-500 text-sm mt-1">One of the wettest mountainous hill stations in the Indian subcontinent.</p>
                                        </div>

                                        <div className="grid sm:grid-cols-3 gap-4">
                                            <div className="p-5 rounded-2xl bg-sky-50 border border-sky-100 text-center">
                                                <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest block mb-1">Cherrapunji of the South</span>
                                                <span className="text-slate-900 font-bold text-base block">Chinnakallar Basin</span>
                                                <span className="text-slate-500 text-[10px] block mt-1">Highest regional rainfall in TN</span>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Summer Climate</span>
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
                                        <div className="border-l-4 border-emerald-500 pl-4">
                                            <h3 className="text-2xl font-serif text-slate-900 font-bold">Plantation Economy & Hydro-Power Complex</h3>
                                            <p className="text-slate-500 text-sm mt-1">Industrial-scale tea cultivation and critical clean energy powerhouses.</p>
                                        </div>

                                        <p className="text-slate-600 text-sm leading-relaxed text-justify">
                                            The main driver of Valparai's economy is commercial tea manufacturing. Massive tracts of estates are owned by major tea conglomerates. The region also hosts the highly vital Parambikulam-Aliyar Project (PAP), bringing a complex network of reservoirs, dams, water channels, and deep mountain tunnels that generate massive amounts of clean hydroelectric energy for Tamil Nadu and Kerala.
                                        </p>

                                        <div className="p-6 rounded-[2rem] bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                                            <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wider mb-2">Sustainable Plantation Culture</h4>
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

            {/* City of Truth Ministries local Sanctuary Spotlight */}
            <div className="container mx-auto px-6 max-w-5xl mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-emerald-950 via-[#0e2a22] to-slate-950 text-white rounded-[2.5rem] p-8 md:p-12 border border-emerald-500/10 shadow-2xl text-left relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08)_0%,transparent_60%)] pointer-events-none" />
                    
                    <div className="max-w-2xl relative z-10 space-y-5">
                        <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-black tracking-widest uppercase border border-emerald-400/20 inline-block">
                            Spiritual Anchor
                        </span>
                        
                        <h3 className="text-3xl md:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-100 to-emerald-400">
                            Valparai Sanctuary
                        </h3>
                        
                        <p className="text-slate-300 text-sm md:text-base leading-relaxed text-justify font-light">
                            Experience the peaceful serenity of worship at our physical sanctuary nestled among the misty hills. We are dedicated to sharing the divine truth, establishing community outreach, and holding sacred services for spiritual growth.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4 pt-4 text-xs font-bold text-emerald-200">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block mb-1">Weekly Services</span>
                                <p className="text-white text-sm">Sunday Worship: 9:30 AM</p>
                                <p className="text-white text-sm">Wednesday Devotional: 6:30 PM</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-center">
                                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block mb-1">Sanctuary Address</span>
                                <p className="text-white text-sm">New Market Road, Valparai</p>
                                <p className="text-white text-xs opacity-75">Coimbatore, Tamil Nadu, 642127</p>
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
                    className="bg-white rounded-[2rem] border border-slate-200 shadow-md p-8"
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
                            className="group rounded-2xl border border-emerald-100 bg-emerald-50 p-5 hover:bg-emerald-100 transition-colors block text-left"
                        >
                            <div className="flex items-center gap-3 mb-2 text-emerald-700">
                                <Globe size={20} />
                                <h4 className="font-bold text-base">Valparai Tamil Wikipedia</h4>
                            </div>
                            <p className="text-xs text-emerald-900/70 leading-relaxed">Explore official administrative records and encyclopedic data in Tamil.</p>
                            <span className="inline-flex items-center gap-2 mt-3 text-xs font-black uppercase tracking-wider text-emerald-700">Open Wikipedia <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" /></span>
                        </a>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ValparaiPage;
