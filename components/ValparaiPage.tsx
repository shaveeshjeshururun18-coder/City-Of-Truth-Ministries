import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mountain, History, Leaf, TrendingUp, CloudRain, Plane, Navigation, Sparkles, Scroll, ArrowRight, Video, Camera, Compass } from 'lucide-react';

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
        transition: { type: "spring", stiffness: 100 }
    }
};

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
            className="min-h-screen bg-slate-50 pt-32 pb-20 overflow-hidden"
        >
            <div className="container mx-auto px-6 max-w-4xl text-center mb-16 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/50 to-amber-100/50 rounded-full blur-[100px] -z-10 animate-pulse-slow"></div>

                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-3 border border-amber-200 bg-white/60 backdrop-blur-sm px-8 py-3 rounded-full mb-10 shadow-lg shadow-amber-500/10"
                >
                    <Sparkles size={16} className="text-amber-500 fill-amber-500 animate-pulse" />
                    <span className="uppercase tracking-[0.25em] font-bold text-xs text-amber-700">The 7th Heaven</span>
                    <Sparkles size={16} className="text-amber-500 fill-amber-500 animate-pulse" />
                </motion.div>

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
                            className="text-7xl md:text-9xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#1e3a8a] via-[#3b82f6] to-[#1e3a8a] tracking-tight drop-shadow-sm inline-block transition-colors duration-300"
                            style={{ textShadow: '0 10px 30px rgba(59, 130, 246, 0.2)' }}
                        >
                            {char}
                        </motion.span>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="bg-white/80 backdrop-blur-md px-10 py-3 rounded-2xl inline-block mb-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-100"
                >
                    <h2 className="text-3xl font-serif text-[#7e22ce] font-bold tracking-wide">வால்பாறை</h2>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-gray-600 font-serif text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto"
                >
                    A sanctuary in the clouds. <span className="italic font-bold text-brand-700">Valparai</span> is a scenic hill station in the Anaimalai Hills, offering a divine escape into nature's purest embrace. Located <span className="font-bold text-gray-900 bg-amber-100 px-2 py-0.5 rounded">3,474 feet</span> above sea level.
                </motion.p>
            </div>

            <div className="container mx-auto px-6 max-w-5xl mb-24">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid gap-6"
                >
                    {[
                        { icon: Mountain, title: "Geography", text: "Located on the Anaimalai Hills range of the Western Ghats at an elevation of 3,474 ft (1,059 m). A pollution-free haven.", color: "blue" },
                        { icon: History, title: "Heritage", text: "First coffee planted in 1846 by K. Ramasamy Mudaliar. In 1890, W. Wintil began large scale tea & coffee cultivation.", color: "amber" },
                        { icon: Leaf, title: "Nature & Wildlife", text: "Part of Anaimalai Tiger Reserve. Home to Leopards, Elephants, Lion-tailed Macaques, Gaur, and Great Hornbills.", color: "emerald" },
                        { icon: TrendingUp, title: "Economy", text: "Driven by Tea and Coffee estates. Surrounded by dams like Aliyar and Sholayar, and hydro-electric power plants.", color: "purple" },
                        { icon: CloudRain, title: "Climate", text: "Mild tropical monsoon climate. One of the wettest places in TN. Summer: 15°C - 25°C. Winter: 10°C - 15°C.", color: "cyan" },
                        { icon: Plane, title: "How to Reach", text: "64 km from Pollachi with 40 hairpin bends. Nearest Airport: Coimbatore (102 km). Connected to Kerala via Malakkappara.", color: "rose" }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm hover:shadow-xl flex flex-col md:flex-row items-start gap-8 border border-white transition-all duration-300 group"
                        >
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${item.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                    item.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                                        item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                            item.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                                                item.color === 'cyan' ? 'bg-cyan-50 text-cyan-600' :
                                                    'bg-rose-50 text-rose-600'
                                }`}>
                                <item.icon size={36} />
                            </div>
                            <div>
                                <h3 className={`text-3xl font-serif font-bold text-gray-900 mb-3 transition-colors ${item.color === 'blue' ? 'group-hover:text-blue-700' :
                                        item.color === 'amber' ? 'group-hover:text-amber-700' :
                                            item.color === 'emerald' ? 'group-hover:text-emerald-700' :
                                                item.color === 'purple' ? 'group-hover:text-purple-700' :
                                                    item.color === 'cyan' ? 'group-hover:text-cyan-700' :
                                                        'group-hover:text-rose-700'
                                    }`}>{item.title}</h3>
                                <p className="text-gray-600 text-lg leading-relaxed mb-4">{item.text}</p>
                                <span className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${item.color === 'blue' ? 'text-blue-500' :
                                        item.color === 'amber' ? 'text-amber-500' :
                                            item.color === 'emerald' ? 'text-emerald-500' :
                                                item.color === 'purple' ? 'text-purple-500' :
                                                    item.color === 'cyan' ? 'text-cyan-500' :
                                                        'text-rose-500'
                                    }`}>Read More <ArrowRight size={14} /></span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    );
};
