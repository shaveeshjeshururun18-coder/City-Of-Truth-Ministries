import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const InteractiveMenorah: React.FC = () => {
    const [litCandles, setLitCandles] = React.useState<number[]>([]);

    React.useEffect(() => {
        // Sequential lighting effect
        const sequence = [3, 2, 4, 1, 5, 0, 6]; // Center first, then outward
        let timeouts: NodeJS.Timeout[] = [];

        sequence.forEach((candleIndex, i) => {
            const timeout = setTimeout(() => {
                setLitCandles(prev => [...prev, candleIndex]);
            }, 1000 + (i * 800)); // Start after 1s, then every 800ms
            timeouts.push(timeout);
        });

        return () => timeouts.forEach(clearTimeout);
    }, []);

    return (
        <div className="relative w-full max-w-md mx-auto aspect-square flex items-end justify-center pb-0">
            {/* Menorah Base & Branches (SVG) */}
            <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#d97706" /> {/* amber-600 */}
                        <stop offset="50%" stopColor="#fbbf24" /> {/* amber-400 */}
                        <stop offset="100%" stopColor="#d97706" /> {/* amber-600 */}
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Central Stem */}
                <path d="M190 300 L210 300 L205 100 L195 100 Z" fill="url(#goldGradient)" />
                <rect x="180" y="280" width="40" height="20" rx="2" fill="url(#goldGradient)" />
                <rect x="160" y="290" width="80" height="10" rx="2" fill="url(#goldGradient)" />

                {/* Branches Left */}
                <path d="M195 180 Q140 180 140 100" fill="none" stroke="url(#goldGradient)" strokeWidth="8" strokeLinecap="round" />
                <path d="M195 210 Q100 210 100 100" fill="none" stroke="url(#goldGradient)" strokeWidth="8" strokeLinecap="round" />
                <path d="M195 240 Q60 240 60 100" fill="none" stroke="url(#goldGradient)" strokeWidth="8" strokeLinecap="round" />

                {/* Branches Right */}
                <path d="M205 180 Q260 180 260 100" fill="none" stroke="url(#goldGradient)" strokeWidth="8" strokeLinecap="round" />
                <path d="M205 210 Q300 210 300 100" fill="none" stroke="url(#goldGradient)" strokeWidth="8" strokeLinecap="round" />
                <path d="M205 240 Q340 240 340 100" fill="none" stroke="url(#goldGradient)" strokeWidth="8" strokeLinecap="round" />

                {/* Candle Holders */}
                {[60, 100, 140, 200, 260, 300, 340].map((x, i) => (
                    <g key={i}>
                        <rect x={x - 10} y="90" width="20" height="15" rx="2" fill="url(#goldGradient)" />
                        <rect x={x - 12} y="85" width="24" height="5" rx="1" fill="#fff" opacity="0.8" />
                    </g>
                ))}
            </svg>

            {/* Flames */}
            {[60, 100, 140, 200, 260, 300, 340].map((x, i) => (
                <AnimatePresence key={i}>
                    {litCandles.includes(i) && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.5, type: "spring" }}
                            className="absolute"
                            style={{
                                left: `${(x / 400) * 100}%`,
                                bottom: `${((300 - 85) / 300) * 100}%`, // Positioned at top of candle holder
                                transform: 'translateX(-50%)'
                            }}
                        >
                            {/* Flame Core */}
                            <div className="relative -ml-[10px] -mt-[30px] w-[20px] h-[30px]">
                                <div className="absolute inset-0 bg-gradient-to-t from-orange-500 via-yellow-400 to-white rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.6)]"></div>
                                <div className="absolute inset-0 bg-yellow-300 rounded-full blur-md opacity-50 animate-ping"></div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            ))}

            <div className="absolute bottom-0 text-amber-500/50 text-[10px] uppercase tracking-[0.3em] font-bold">
                Light of the World
            </div>
        </div>
    );
};
