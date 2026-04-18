import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, GraduationCap, Globe, Heart, Award, Star, Volume2 } from 'lucide-react';
import { audioService } from '../services/audioService';

interface PastorPageProps {
    className?: string;
}

export const PastorPage: React.FC<PastorPageProps> = ({
    className = ""
}) => {
    const [imageError, setImageError] = useState(false);

    // Staggered animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
    };

    const features = [
        { icon: BookOpen, text: "ஆழ்ந்த வேதஅறிவுடன் அர்ப்பணிப்பாக ஊழியம் செய்யும் தேவ ஊழியக்காரர்." },
        { icon: GraduationCap, text: "வேதாகமத்தை தெளிவாகவும் ஆன்மீக ஆழத்துடனும் கற்பிப்பவர்." },
        { icon: Heart, text: "அவரது ஊழியம் “בָּרוּךְ הַשֵׁם – ஆண்டவர் நாமம் பெருமை பெறுக” என்ற நம்பிக்கையில் நிலைத்துள்ளது." },
        { icon: Star, text: "“ஆத்தும நன்றி பலிகள் — நம் தேவனுக்கு நன்றி கூறுங்கள்” என்ற உண்மையை வலியுறுத்துபவர்." },
        { icon: Award, text: "அவரது போதனைகள் விசுவாசிகளுக்கு நன்றி, விசுவாசம் மற்றும் பரிசுத்த வாழ்வை ஊக்குவிக்கின்றன." },
        { icon: Globe, text: "தேவவசனத்தை வருங்கால தலைமுறைகளுக்கு கொண்டு சேர்ப்பது அவர் வாழ்வின் முக்கிய பணி." }
    ];

    return (
        <div className={`relative w-full min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 overflow-hidden pt-24 pb-20 ${className}`}>
            {/* Decorative background circles */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full bg-sky-200/40 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[600px] h-[600px] rounded-full bg-blue-200/30 blur-[100px] pointer-events-none"></div>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerVariants}
                className="w-full max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row gap-12 lg:gap-20 items-center justify-center pt-8"
            >
                    
                    {/* Left Column - Photo & Titles */}
                    <div className="flex flex-col items-center md:w-1/3 text-center shrink-0">
                        {/* Profile Image with Animated Border */}
                        <motion.div 
                            variants={itemVariants}
                            className="relative mb-8 group"
                        >
                            <div className="absolute -inset-2 bg-gradient-to-br from-sky-400 to-blue-600 blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 rounded-[2rem]"></div>
                            <div className="w-56 h-72 md:w-64 md:h-80 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl relative z-10 bg-sky-100 flex items-center justify-center">
                                {!imageError ? (
                                    <img 
                                        src="/assets/pastor.jpeg" 
                                        alt="Reverend Lazarus M.S." 
                                        className="w-full h-full object-cover object-top scale-105"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div className="text-sky-800 text-6xl font-serif">LM</div>
                                )}
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="mt-4">
                            <div className="flex flex-col items-center gap-3">
                                <h3 className="text-xl font-serif text-blue-900/80 mb-1 tracking-wide">רבי מַשָּׁל בן אל עצר</h3>
                                <button 
                                    onClick={() => audioService.playHebrew('רבי מַשָּׁל בן אל עצר')}
                                    className="flex items-center gap-2.5 px-6 py-3 bg-white border border-sky-100 rounded-full text-sky-600 hover:bg-sky-600 hover:text-white transition-all shadow-lg shadow-sky-900/5 hover:shadow-sky-500/20 group relative overflow-hidden active:scale-95"
                                >
                                    <div className="absolute inset-0 bg-sky-400/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                                    <span className="relative z-10 text-xs font-black uppercase tracking-widest">Listen Pronunciation</span>
                                    <div className="relative z-10">
                                        <Volume2 size={18} className="group-hover:scale-110 transition-transform animate-pulse" />
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Credentials & Bio */}
                    <div className="flex-1 flex flex-col justify-center">
                        
                        <motion.div variants={itemVariants} className="mb-8">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-sky-500 mb-4 flex items-center gap-2">
                                <span className="w-6 h-[2px] bg-sky-300"></span> ஆசிரியர் குறிப்பு <span className="w-6 h-[2px] bg-sky-300"></span>
                            </h3>

                            {/* Identity Block */}
                            <div className="mb-6 p-4 bg-brand-50/50 rounded-2xl border border-brand-100/50">
                                <div className="flex items-center justify-between gap-4 mb-2">
                                    <h3 className="font-bold text-brand-950 text-xl">Reverend Lazarus M.S.</h3>
                                    <button
                                        onClick={() => audioService.playHebrew("Rabbi Masal Ben El Etzar", 0.8)}
                                        className="p-2.5 bg-brand-600 text-white rounded-full hover:bg-brand-700 transition-all shadow-md hover:scale-110 active:scale-95 group"
                                        title="Hear Hebrew Pronunciation"
                                    >
                                        <Volume2 size={18} className="group-hover:animate-pulse" />
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[#d19b4b] font-black text-sm uppercase tracking-[0.1em]">Rabbi Masal Ben El Etzar</p>
                                    <p className="text-brand-900 font-bold text-lg font-tamil">ரப்பி மசால் பென் எல் எட்சர்</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <GraduationCap className="shrink-0 text-sky-500 mt-1" size={20} />
                                    <div>
                                        <p className="font-bold text-sky-900">Master of Divinity (ATA)</p>
                                        <p className="font-bold text-sky-900">Bachelor of Divinity (NATA)</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Globe className="shrink-0 text-sky-500 mt-1" size={20} />
                                    <p className="font-medium text-sky-800">
                                        USA-விலுள்ள TPI-யில் எபிரேயத்தில் மேம்பட்ட படிப்பு பெற்றவர். <br/>
                                        <span className="text-sm text-sky-600">(Advanced Hebrew Studies at TPI - USA)</span>
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Animated Grid of 6 Key Points */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {features.map((feature, i) => (
                                <motion.div 
                                    key={i}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.9)" }}
                                    className="bg-white/60 p-4 rounded-2xl border border-sky-100 shadow-sm flex items-start gap-3 transition-colors text-left"
                                >
                                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                                        <feature.icon size={16} className="text-sky-600" />
                                    </div>
                                    <p className="text-sm text-sky-900 font-medium leading-relaxed pt-1">
                                        {feature.text}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                    </div>
            </motion.div>
        </div>
    );
};

