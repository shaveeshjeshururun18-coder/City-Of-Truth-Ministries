import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight, BookOpen, MapPin, Globe, Sparkles, MessageSquare, QrCode, Heart, Users, Mountain, Leaf, CloudRain, Video, Sun, Music, FileText, Eye } from 'lucide-react';
import { ViewState, User } from '../../types';
import { MessageFromLeader } from '../MessageFromLeader';
import { LordIconWrapper } from '../LordIconWrapper';
import { DeuteronomyCircleGraphic } from '../DeuteronomyCircleGraphic';
import { PSALM_119_VERSES } from '../psalm119';

const useSectionInfo = (sectionId: string, defaultName: string, defaultDesc: string) => {
    return React.useMemo(() => {
        try {
            const saved = localStorage.getItem('cot_sections_info');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed[sectionId]) {
                    return {
                        name: parsed[sectionId].name || defaultName,
                        desc: parsed[sectionId].desc || defaultDesc
                    };
                }
            }
        } catch {}
        return { name: defaultName, desc: defaultDesc };
    }, [sectionId, defaultName, defaultDesc]);
};

interface SectionProps {
    setView: (view: ViewState) => void;
}


export const ValparaiPresence: React.FC<SectionProps> = ({ setView }) => {
    return (
        <section className="py-32 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-950 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-15 bg-[url('https://images.unsplash.com/photo-1542332213-31f87348057f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-accent-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
            <div className="absolute -bottom-32 right-20 w-96 h-96 bg-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 bg-white/10 text-white px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.25em] border border-accent-400/30 backdrop-blur-sm"
                        >
                            <MapPin size={14} className="text-accent-400" />
                            வால்பாறை புனிதத்தளம்
                        </motion.div>

                        <div className="space-y-6">
                            <h2 className="text-6xl md:text-7xl font-serif font-black text-white leading-[1.1] tracking-tight">
                                வால்பாறைப் <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-accent-300 to-accent-200">சரணம்</span>
                            </h2>
                            
                            <p className="text-lg text-white/70 font-light leading-relaxed max-w-2xl">
                                மூடுபனிப் புரவலஞ்சாலைகளுக்கு இடையே தனிமையாய் இருக்கும் எமது ஆன்மீக வாழ்க்கையின் மூலம் ஆண்டவரின் சரணத்தை அவிழ்ந்தெடுங்கள். இங்கு இயற்கையும் வழிபாடும் ஐக்கியமாய் திருமண்ணின் வேதத்தை கண்டறியங்கள்.
                            </p>

                            <div className="grid grid-cols-3 gap-4 pt-4">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-gradient-to-br from-white/10 to-white/5 border border-accent-400/30 rounded-2xl p-4 text-center backdrop-blur-md shadow-[0_0_15px_rgba(251,191,36,0.1)] relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-accent-400/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500"></div>
                                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-accent-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg relative z-10">
                                        <Mountain size={24} className="text-white drop-shadow-md" />
                                    </div>
                                    <p className="text-xs font-black text-white uppercase tracking-wider relative z-10 drop-shadow-sm">மலைக் கூடம்</p>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-gradient-to-br from-white/10 to-white/5 border border-emerald-400/30 rounded-2xl p-4 text-center backdrop-blur-md shadow-[0_0_15px_rgba(52,211,153,0.1)] relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500"></div>
                                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-lg relative z-10">
                                        <Leaf size={24} className="text-white drop-shadow-md" />
                                    </div>
                                    <p className="text-xs font-black text-white uppercase tracking-wider relative z-10 drop-shadow-sm">பசுமை நிலம்</p>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-gradient-to-br from-white/10 to-white/5 border border-cyan-400/30 rounded-2xl p-4 text-center backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.1)] relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500"></div>
                                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg relative z-10">
                                        <CloudRain size={24} className="text-white drop-shadow-md" />
                                    </div>
                                    <p className="text-xs font-black text-white uppercase tracking-wider relative z-10 drop-shadow-sm">பொழில் சோலை</p>
                                </motion.div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setView(ViewState.ABOUT_VALPARAI)}
                                className="group flex items-center justify-center gap-3 bg-gradient-to-r from-accent-400 to-accent-300 text-brand-950 px-10 py-4 rounded-full font-black text-sm hover:shadow-2xl hover:shadow-accent-400/50 transition-all uppercase tracking-widest"
                            >
                                புனிதத்தளத்திற்குச் செல்லுங்கள்
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group flex items-center justify-center gap-2 border-2 border-white/30 text-white px-10 py-4 rounded-full font-bold text-sm hover:border-accent-400 hover:bg-white/10 transition-all uppercase tracking-wide"
                            >
                                <Video size={18} />
                                பிரசாரங்கள்
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Right Visual Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-accent-400/20 rounded-3xl p-8 backdrop-blur-xl">
                            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                                <Sparkles size={20} className="text-accent-400" />
                                பரிசுத்த அனுபவங்கள்
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { icon: Sun, color: 'text-amber-400', title: 'நாள்தோறும் ஆராதனை', desc: 'சூரியோதயத்திலும் மாலையிலும்' },
                                    { icon: BookOpen, color: 'text-blue-400', title: 'வேத அத்யயனம்', desc: 'ஆண்டவரின் திருவாக்கைக் கேளுங்கள்' },
                                    { icon: Music, color: 'text-pink-400', title: 'ஆன்மீக பாடல்கள்', desc: 'நிலைத்த மெய்நிலை அனுபவங்கள்' },
                                    { icon: Users, color: 'text-emerald-400', title: 'சமுதாய சேவை', desc: 'ஒன்றாய் பணிபுரியும் குடும்பம்' }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex gap-4 items-start p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-accent-400/30 transition-all group"
                                    >
                                        <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all ${item.color}`}>
                                            <item.icon size={24} />
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <h4 className="text-white font-bold text-sm mb-1">{item.title}</h4>
                                            <p className="text-white/60 text-xs leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <motion.div
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="bg-gradient-to-br from-accent-400/20 to-transparent border border-accent-400/30 rounded-2xl p-6 text-center backdrop-blur-sm"
                            >
                                <p className="text-3xl font-black text-accent-300 mb-2">200+</p>
                                <p className="text-white/60 text-xs font-bold uppercase tracking-wide">குடும்பங்கள்</p>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="bg-gradient-to-br from-accent-400/20 to-transparent border border-accent-400/30 rounded-2xl p-6 text-center backdrop-blur-sm"
                            >
                                <p className="text-3xl font-black text-accent-300 mb-2">{new Date().getFullYear() - 2009} வருஷ்</p>
                                <p className="text-white/60 text-xs font-bold uppercase tracking-wide">சேவை கதை</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
