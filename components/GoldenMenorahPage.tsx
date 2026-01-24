import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { InteractiveMenorah } from './InteractiveMenorah';
import { ViewState } from '../types';

interface GoldenMenorahPageProps {
    onBack: () => void;
}

export const GoldenMenorahPage: React.FC<GoldenMenorahPageProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-brand-950 pt-24 pb-12 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none"></div>

            {/* Header */}
            <div className="container mx-auto px-4 text-center mb-16 relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight" style={{ fontFamily: 'serif' }}>
                    Divine Shrine <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">Golden Menorah Temple</span>
                    <span className="block text-3xl md:text-4xl mt-3 text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 font-bold drop-shadow-lg tracking-wide leading-relaxed py-1">
                        தெய்வீக அருள்மிகு பொன் குத்துவிளக்கு திருத்தலம்
                    </span>
                </h1>
                <div className="mb-8 space-y-2">
                    <p className="text-xl text-amber-100/90 font-medium">
                        It is going to be established in Valparai
                    </p>
                    <p className="text-xl md:text-2xl text-amber-300 font-bold drop-shadow-md tracking-wide">
                        இது வால்பாறையில் நிறுவப்பட உள்ளது
                    </p>
                </div>

                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-amber-500/60 hover:text-amber-400 transition-colors uppercase tracking-widest text-xs font-bold"
                >
                    <ArrowLeft size={16} /> Return to Sanctuary
                </button>
            </div>

            {/* Main Split Content */}
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-6xl mx-auto">

                    {/* Left Column: Interactive Menorah */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative flex items-center justify-center p-8 bg-white/5 border border-amber-500/10 rounded-3xl backdrop-blur-sm shadow-2xl h-[500px]"
                    >
                        <div className="absolute top-4 left-4 text-amber-500/30 text-xs font-bold uppercase tracking-widest">Divine Light</div>
                        <div className="w-full max-w-sm">
                            <InteractiveMenorah />
                        </div>
                    </motion.div>

                    {/* Right Column: Sacred Flag */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative group h-[500px] flex items-center justify-center"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative w-full h-full bg-white/5 backdrop-blur-md border border-amber-500/20 rounded-3xl p-8 shadow-2xl flex flex-col justify-center">
                            <div className="absolute top-4 right-4 flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
                                <Sparkles size={14} /> Sacred Standard
                            </div>

                            <div className="relative overflow-hidden rounded-2xl shadow-inner border border-amber-500/10 w-full max-w-md mx-auto h-full flex items-center justify-center">
                                <img
                                    src="/menorah-flag-image.png"
                                    alt="Sacred Menorah Flag with YHWH inscriptions"
                                    className="max-w-full max-h-full object-contain transform hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                            </div>

                            <div className="mt-8 text-center">
                                <h3 className="text-xl font-bold text-amber-200 mb-2 font-serif">YHWH (יהוה)</h3>
                                <p className="text-amber-100/60 text-sm italic">
                                    "I AM WHO I AM" — The Eternal Name
                                </p>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};
