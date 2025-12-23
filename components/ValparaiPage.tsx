import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mountain, History, Leaf, TrendingUp, CloudRain, Plane, Navigation, Sparkles, Scroll, ArrowRight, Video, Camera, Compass } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100 }
    }
};

export const ValparaiPage: React.FC = () => {
    return (
        <motion.div
            key="valparai"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-white pt-24 md:pt-48 pb-32 overflow-hidden"
        >
            <div className="container mx-auto px-6 max-w-7xl relative">
                {/* LARGE BACKGROUND TEXT */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-0 select-none pointer-events-none opacity-[0.03]">
                    <h1 className="text-[20vw] font-serif font-black tracking-tighter whitespace-nowrap">VALPARAI HILLS</h1>
                </div>

                {/* Hero Section */}
                <div className="relative z-10 grid lg:grid-cols-[1fr_auto] gap-16 items-center mb-40">
                    <div className="text-left">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-3 text-accent-600 font-black tracking-[0.4em] uppercase text-xs mb-8"
                        >
                            <span className="w-12 h-1 bg-accent-600 rounded-full"></span>
                            The Sanctuary in the Clouds
                        </motion.div>
                        <motion.h1
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl md:text-9xl font-serif font-black text-brand-950 mb-10 tracking-tighter leading-[0.85]"
                        >
                            VALPARAI <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-600 to-indigo-600 italic">DIVINE</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl text-slate-500 max-w-2xl font-light leading-relaxed mb-12"
                        >
                            A sacred sanctuary nestled 3,500 feet above sea level, where the breath of God meets the majestic beauty of the Anamalai Hills.
                        </motion.p>
                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-3 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                                <Mountain className="text-brand-500" />
                                <span className="font-bold text-brand-950">3,500 FT Elevation</span>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                                <CloudRain className="text-blue-500" />
                                <span className="font-bold text-brand-950">Pristine Nature</span>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                        className="relative group hidden lg:block"
                    >
                        <div className="absolute inset-0 bg-brand-500/10 blur-[100px] rounded-full animate-pulse-slow"></div>
                        <div className="w-[450px] aspect-[4/5] rounded-[4rem] overflow-hidden border-[16px] border-white shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-700">
                            <img
                                src="https://images.unsplash.com/photo-1598439210625-5067c578f3f6?q=80&w=2672&auto=format&fit=crop"
                                className="w-full h-full object-cover"
                                alt="Valparai Hills"
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-40"
                >
                    {[
                        { icon: <Compass />, title: "The Journey", desc: "40 legendary hairpin bends leading to the summit of peace." },
                        { icon: <Leaf />, title: "Tea Gardens", desc: "Walking through emerald-green plantations under God's grace." },
                        { icon: <Sparkles />, title: "Divine Peace", desc: "Experience spiritual clarity amidst the mountain mist." },
                        { icon: <Video />, title: "Virtual Tour", desc: "Experience the sanctuary online from anywhere in the world." }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-brand-900/10 transition-all group"
                        >
                            <div className="w-16 h-16 bg-white text-brand-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-brand-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                                {React.cloneElement(feature.icon as React.ReactElement, { size: 30 })}
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-brand-950 mb-4">{feature.title}</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Second Content Area */}
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        className="space-y-10"
                    >
                        <h2 className="text-4xl md:text-6xl font-serif font-bold text-brand-950 italic leading-tight">
                            "A City Set on a <br />
                            <span className="text-accent-500">Hill</span> Cannot Be Hidden"
                        </h2>
                        <div className="h-1.5 w-32 bg-brand-500 rounded-full"></div>
                        <p className="text-xl text-slate-600 leading-relaxed font-light">
                            Our presence in Valparai is more than geographical—it is spiritual. We serve as a beacon of truth for the thousands who call these hills home, providing a sanctuary for worship, community, and divine transformation.
                        </p>
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center text-brand-600">
                                <History size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-brand-950">A Rich Legacy</h4>
                                <p className="text-sm text-slate-500">Founded in the heart of the Anamalai Hills with a vision for Truth.</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-2 gap-6"
                    >
                        <div className="space-y-6">
                            <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                                <img src="https://images.unsplash.com/photo-1543739225-0453715c9298?q=80&w=2670&auto=format&fit=crop" className="w-full h-full object-cover" />
                            </div>
                            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                                <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2670&auto=format&fit=crop" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="space-y-6 pt-12">
                            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                                <img src="https://images.unsplash.com/photo-1510590337019-5ef2d39aa786?q=80&w=2670&auto=format&fit=crop" className="w-full h-full object-cover" />
                            </div>
                            <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                                <img src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2673&auto=format&fit=crop" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};
