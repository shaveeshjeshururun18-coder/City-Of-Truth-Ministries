import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Download } from 'lucide-react';
import { InteractiveMenorah } from './InteractiveMenorah';

interface GoldenMenorahPageProps {
    onBack: () => void;
}

export const GoldenMenorahPage: React.FC<GoldenMenorahPageProps> = () => {
    const [flagImageSrc, setFlagImageSrc] = React.useState('/menorah-flag-image.png');
    const [isFlagUnavailable, setIsFlagUnavailable] = React.useState(false);

    const handleFlagImageError = () => {
        if (flagImageSrc === '/menorah-flag-image.png') {
            setFlagImageSrc('/menorah-flag.png');
            return;
        }
        if (flagImageSrc === '/menorah-flag.png') {
            setFlagImageSrc('/sacred-menorah.png');
            return;
        }
        setIsFlagUnavailable(true);
    };

    return (
        <div className="min-h-screen bg-black pt-32 pb-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black pointer-events-none"></div>
            <div className="container mx-auto px-4 text-center mb-16 relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight" style={{ fontFamily: 'serif' }}>
                    Divine Shrine <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">Golden Menorah Temple</span>
                    <span className="block text-3xl md:text-4xl mt-3 text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 font-bold drop-shadow-lg tracking-wide leading-relaxed py-1">
                        தெய்வீக அருள்மிகு பொன் குத்துவிளக்கு திருத்தலம்
                    </span>
                </h1>
                <div className="mb-12 space-y-4">
                    <p className="text-xl md:text-2xl text-amber-100/70 font-light tracking-wide italic font-serif">It is going to be established in Valparai</p>
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mx-auto my-4"></div>
                    <p className="text-2xl md:text-3xl text-amber-400 font-bold drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] tracking-wide">இது வால்பாறையில் நிறுவப்பட உள்ளது</p>
                </div>
            </div>
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-6xl mx-auto">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative flex items-center justify-center p-8 bg-gradient-to-tr from-white/[0.02] to-white/[0.05] border border-amber-500/20 rounded-[2.5rem] backdrop-blur-md shadow-[0_0_50px_rgba(245,158,11,0.05)] h-[550px] group overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <div className="absolute top-6 left-6 text-amber-500/50 text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2"><Sparkles size={14} /> Divine Light</div>
                        <div className="w-full max-w-sm relative z-10"><InteractiveMenorah /></div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative group h-[550px] flex items-center justify-center">
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-yellow-400 rounded-[2.6rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative w-full h-full bg-gradient-to-bl from-white/[0.05] to-white/[0.01] backdrop-blur-xl border border-amber-500/30 rounded-[2.5rem] p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col justify-center">
                            <div className="absolute top-6 right-6 flex items-center gap-2 text-amber-500/50 font-bold text-xs uppercase tracking-[0.3em]"><Sparkles size={14} /> Sacred Standard</div>
                            <div className="relative overflow-hidden rounded-2xl shadow-inner border border-amber-500/10 w-full max-w-md mx-auto h-full flex items-center justify-center">
                                {!isFlagUnavailable ? (
                                    <img
                                        src={flagImageSrc}
                                        alt="Sacred Menorah Flag with YHWH inscriptions"
                                        className="max-w-full max-h-full object-contain transform hover:scale-105 transition-transform duration-700"
                                        onError={handleFlagImageError}
                                    />
                                ) : (
                                    <div className="text-center px-6">
                                        <p className="text-amber-200 font-bold">Flag image could not be loaded.</p>
                                        <p className="text-amber-100/60 text-xs mt-1">Please refresh the page and try again.</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                            </div>
                            <div className="mt-8 text-center">
                                <h3 className="text-xl font-bold text-amber-200 mb-2 font-serif">YHWH (יהוה)</h3>
                                <p className="text-amber-100/60 text-sm italic">"I AM WHO I AM" — The Eternal Name</p>
                                {!isFlagUnavailable && (
                                    <a
                                        href={flagImageSrc}
                                        download="COT-Menorah-Flag.png"
                                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-colors"
                                    >
                                        <Download size={14} />
                                        Download Flag
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
