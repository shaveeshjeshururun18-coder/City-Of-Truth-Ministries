import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Download } from 'lucide-react';
import { InteractiveMenorah } from './InteractiveMenorah';
import MenorahFlag from './MenorahFlag';

interface GoldenMenorahPageProps {
    onBack: () => void;
}

export const GoldenMenorahPage: React.FC<GoldenMenorahPageProps> = () => {
    const [showIntroFlag, setShowIntroFlag] = React.useState(true);

    React.useEffect(() => {
        const introTimeout = setTimeout(() => {
            setShowIntroFlag(false);
        }, 5000);

        return () => clearTimeout(introTimeout);
    }, []);

    const handleDownloadFlag = async () => {
        try {
            const response = await fetch('/menorah-flag-image.png');
            if (!response.ok) throw new Error(`Flag image not available: ${response.status} ${response.statusText}`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Menorah-Flag-HighResolution.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Flag download failed:', err);
            alert('Sorry, the flag image could not be downloaded. Please try again later.');
        }
    };

    return (
        <div className="min-h-screen bg-black pt-32 pb-20 relative overflow-hidden">
            <AnimatePresence>
                {showIntroFlag && (
                    <motion.div
                        initial={{ opacity: 1, scale: 1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.06, filter: 'blur(10px)' }}
                        transition={{ duration: 1.1, ease: 'easeInOut' }}
                        className="absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-b from-blue-900 via-blue-700 to-blue-900"
                    >
                        <div className="w-[92vw] h-[52vw] max-w-5xl max-h-[560px]">
                            <MenorahFlag width={1100} height={620} windSpeed={9} showControlsButton={false} className="w-full h-full" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
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
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-6xl mx-auto">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative flex items-center justify-center p-6 sm:p-8 bg-gradient-to-tr from-white/[0.02] to-white/[0.05] border border-amber-500/20 rounded-[2.5rem] backdrop-blur-md shadow-[0_0_50px_rgba(245,158,11,0.05)] h-[380px] sm:h-[480px] lg:h-[550px] group overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <div className="absolute top-6 left-6 text-amber-500/50 text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2"><Sparkles size={14} /> Divine Light</div>
                        <div className="w-full max-w-xs sm:max-w-sm relative z-10"><InteractiveMenorah /></div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative group flex items-center justify-center">
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-yellow-400 rounded-[2.6rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative w-full bg-gradient-to-bl from-white/[0.05] to-white/[0.01] backdrop-blur-xl border border-amber-500/30 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col justify-center">
                            <div className="absolute top-6 right-6 flex items-center gap-2 text-amber-500/50 font-bold text-xs uppercase tracking-[0.3em]"><Sparkles size={14} /> Sacred Standard</div>
                            <div className="relative overflow-hidden rounded-2xl shadow-inner border border-amber-500/10 w-full mx-auto flex items-center justify-center pt-8">
                                <div className="w-full max-h-80 transform hover:scale-[1.02] transition-transform duration-700 overflow-hidden rounded-xl">
                                    <MenorahFlag width={540} height={320} windSpeed={7.5} showControlsButton={false} className="mx-auto" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                            </div>
                            <div className="mt-6 text-center">
                                <h3 className="text-xl font-bold text-amber-200 mb-2 font-serif">YHWH (יהוה)</h3>
                                <p className="text-amber-100/60 text-sm italic mb-5">"I AM WHO I AM" — The Eternal Name</p>
                                <button
                                    onClick={handleDownloadFlag}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold px-5 py-3 rounded-full shadow-lg hover:from-amber-400 hover:to-yellow-300 active:scale-95 transition-all text-sm"
                                >
                                    <Download size={16} />
                                    Download Full Resolution Flag
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
