import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mountain, History, Leaf, TrendingUp, CloudRain, Plane, Navigation, Sparkles, Scroll, ArrowRight } from 'lucide-react';

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
            className="min-h-screen bg-slate-50 pt-24 md:pt-32 pb-20"
        >
            <div className="container mx-auto px-6 max-w-7xl relative">
                {/* Glow Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/50 to-amber-100/50 rounded-full blur-[100px] -z-10 animate-pulse-slow"></div>

                <section className="text-center mb-24">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 text-brand-600 font-bold text-[10px] uppercase tracking-widest mb-8"
                    >
                        <MapPin size={14} className="text-accent-500" />
                        The Sanctuary in the Clouds
                    </motion.div>
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-8xl font-serif font-black text-brand-950 mb-8 tracking-tighter"
                    >
                        VALPARAI <span className="text-accent-600">DIVINE</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed"
                    >
                        A sacred sanctuary nestled 3,500 feet above sea level, where the breath of God meets the beauty of the Anamalai Hills.
                    </motion.p>
                </section>

                {/* Feature Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32"
                >
                    {[
                        { icon: <Mountain />, title: "3500 FT High", desc: "A literal mountain top experience of faith." },
                        { icon: <CloudRain />, title: "Tea Paradises", desc: "Surrounded by lush green tea plantations." },
                        { icon: <Leaf />, title: "Nature Sanctuary", desc: "Walking with God in His pristine creation." },
                        { icon: <Navigation />, title: "40 Hairpins", desc: "The legendary journey to the summit." }
                    ].map((item, i) => (
                        <motion.div key={i} variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group">
                            <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-all">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-serif font-bold text-brand-950 mb-2">{item.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Story Section */}
                <section className="bg-brand-950 rounded-[4rem] p-12 md:p-24 text-white relative overflow-hidden mb-32">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-800 rounded-full blur-[120px] opacity-20 -mr-64 -mt-64"></div>
                    <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-accent-400 font-black tracking-widest text-xs uppercase mb-6 block">Our History</span>
                            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8 italic">The Legacy of the Hills</h2>
                            <div className="space-y-6 text-brand-100/70 text-lg leading-relaxed font-light">
                                <p>Since the colonial era, Valparai has been a place of quiet reflection and divine purpose. The very roads that climb these hills were built with a royal visit in mind, yet they led to something much greater—a sanctuary for the Truth.</p>
                                <p>Our ministry here is a continuation of this legacy, bringing the light of the Gospel to every worker in the estates and every family in the hills.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
                                <img src="https://images.unsplash.com/photo-1598439210625-5067c578f3f6?q=80&w=2672&auto=format&fit=crop" className="w-full h-full object-cover" alt="Valparai 1" />
                            </div>
                            <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl translate-y-8">
                                <img src="https://images.unsplash.com/photo-1543739225-0453715c9298?q=80&w=2670&auto=format&fit=crop" className="w-full h-full object-cover" alt="Valparai 2" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Hairpin Section */}
                <section className="text-center py-24 border-y border-slate-100">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-4xl font-serif font-bold text-brand-950 mb-6">40 Hairpin Bends</h2>
                        <p className="text-slate-600 text-lg mb-12 italic leading-relaxed">"The narrow path that leads to the summit is filled with turns, much like the journey of faith. But at every bend, the view of God's glory becomes clearer."</p>
                        <div className="flex justify-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-accent-500"></div>
                            <div className="w-2 h-2 rounded-full bg-accent-400"></div>
                            <div className="w-2 h-2 rounded-full bg-accent-300"></div>
                        </div>
                    </div>
                </section>
            </div>
        </motion.div>
    );
};
