import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const InteractiveMenorah: React.FC = () => {
    const [litCandles, setLitCandles] = React.useState<number[]>([]);

    React.useEffect(() => {
        const sequence = [3, 2, 4, 1, 5, 0, 6]; // Center first, then outward
        const timeouts: NodeJS.Timeout[] = [];

        sequence.forEach((candleIndex, i) => {
            const timeout = setTimeout(() => {
                setLitCandles(prev => [...prev, candleIndex]);
            }, 800 + (i * 500));
            timeouts.push(timeout);
        });

        return () => timeouts.forEach(clearTimeout);
    }, []);

    // Flame positions aligned with menorah branches
    const flamePositions = [
        { x: 100, y: 120 },  // Left 1
        { x: 160, y: 100 },  // Left 2
        { x: 220, y: 85 },   // Left 3
        { x: 280, y: 75 },   // Center
        { x: 340, y: 85 },   // Right 3
        { x: 400, y: 100 },  // Right 2
        { x: 460, y: 120 },  // Right 1
    ];

    return (
        <div className="relative w-full max-w-lg mx-auto aspect-square flex flex-col items-center justify-center">
            <svg
                viewBox="0 0 560 500"
                className="w-full h-full"
                style={{ filter: 'drop-shadow(0 0 30px rgba(251, 146, 60, 0.3))' }}
            >
                {/* Menorah Base (Tiered) */}
                <g>
                    {/* Bottom tier */}
                    <rect x="230" y="450" width="100" height="20" fill="#E8930B" rx="3" />
                    <rect x="240" y="430" width="80" height="25" fill="#F59E0B" rx="2" />

                    {/* Center stem */}
                    <rect x="265" y="200" width="30" height="235" fill="#F59E0B" rx="2" />
                    <rect x="268" y="200" width="24" height="235" fill="#FBBF24" rx="2" />

                    {/* Branch 1 - Leftmost */}
                    <path
                        d="M 280 380 Q 120 380, 100 200 L 100 150"
                        stroke="#F59E0B"
                        strokeWidth="18"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 280 380 Q 120 380, 100 200 L 100 150"
                        stroke="#FBBF24"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                    />

                    {/* Branch 2 */}
                    <path
                        d="M 280 340 Q 180 340, 160 200 L 160 130"
                        stroke="#F59E0B"
                        strokeWidth="18"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 280 340 Q 180 340, 160 200 L 160 130"
                        stroke="#FBBF24"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                    />

                    {/* Branch 3 */}
                    <path
                        d="M 280 300 Q 230 300, 220 200 L 220 115"
                        stroke="#F59E0B"
                        strokeWidth="18"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 280 300 Q 230 300, 220 200 L 220 115"
                        stroke="#FBBF24"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                    />

                    {/* Branch 5 */}
                    <path
                        d="M 280 300 Q 330 300, 340 200 L 340 115"
                        stroke="#F59E0B"
                        strokeWidth="18"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 280 300 Q 330 300, 340 200 L 340 115"
                        stroke="#FBBF24"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                    />

                    {/* Branch 6 */}
                    <path
                        d="M 280 340 Q 380 340, 400 200 L 400 130"
                        stroke="#F59E0B"
                        strokeWidth="18"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 280 340 Q 380 340, 400 200 L 400 130"
                        stroke="#FBBF24"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                    />

                    {/* Branch 7 - Rightmost */}
                    <path
                        d="M 280 380 Q 440 380, 460 200 L 460 150"
                        stroke="#F59E0B"
                        strokeWidth="18"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 280 380 Q 440 380, 460 200 L 460 150"
                        stroke="#FBBF24"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                    />

                    {/* Candle cups */}
                    {flamePositions.map((pos, i) => (
                        <g key={i}>
                            <rect
                                x={pos.x - 10}
                                y={pos.y}
                                width="20"
                                height="25"
                                fill="#F59E0B"
                                rx="2"
                            />
                            <rect
                                x={pos.x - 8}
                                y={pos.y + 2}
                                width="16"
                                height="21"
                                fill="#FBBF24"
                                rx="1"
                            />
                        </g>
                    ))}
                </g>
            </svg>

            {/* Animated Flames */}
            <div className="absolute inset-0">
                {flamePositions.map((pos, i) => (
                    <AnimatePresence key={i}>
                        {litCandles.includes(i) && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.8, type: "spring" }}
                                className="absolute"
                                style={{
                                    left: `${(pos.x / 560) * 100}%`,
                                    top: `${((pos.y - 40) / 500) * 100}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                {/* Flame Container */}
                                <div className="relative w-8 h-12 md:w-10 md:h-16">
                                    {/* Outer Glow */}
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.3, 1, 1.2, 1],
                                            opacity: [0.4, 0.7, 0.5, 0.6, 0.4],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                        className="absolute inset-[-100%] bg-gradient-radial from-orange-400/60 via-yellow-500/40 to-transparent rounded-full blur-2xl"
                                    />

                                    {/* Main Flame Body (Oval) */}
                                    <motion.div
                                        animate={{
                                            scaleY: [1, 1.1, 0.95, 1.08, 1],
                                            scaleX: [1, 0.95, 1.05, 0.97, 1],
                                            y: [0, -3, 1, -2, 0]
                                        }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                        className="absolute inset-0"
                                        style={{
                                            background: 'linear-gradient(to top, #EA580C 0%, #F59E0B 30%, #FBBF24 60%, #FDE047 100%)',
                                            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                                            boxShadow: '0 0 20px rgba(251, 146, 60, 0.8), 0 0 40px rgba(251, 191, 36, 0.4)'
                                        }}
                                    >
                                        {/* White Hot Core */}
                                        <motion.div
                                            animate={{
                                                opacity: [0.6, 0.9, 0.7, 0.85, 0.6],
                                                scale: [1, 1.1, 0.95, 1.05, 1]
                                            }}
                                            transition={{
                                                duration: 0.8,
                                                repeat: Infinity,
                                            }}
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[50%] h-[60%] bg-gradient-radial from-white/80 via-yellow-100/50 to-transparent rounded-full blur-[2px]"
                                        />
                                    </motion.div>

                                    {/* Top Sparkle */}
                                    <motion.div
                                        animate={{
                                            opacity: [0, 1, 0],
                                            y: [-5, -10, -15],
                                            scale: [0.5, 1, 0]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            delay: Math.random() * 2,
                                        }}
                                        className="absolute -top-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full blur-[1px]"
                                        style={{ boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)' }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                ))}
            </div>

            {/* Inscription */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3, duration: 1.5 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center"
            >
                <div className="text-amber-500 font-serif text-lg md:text-2xl tracking-[0.5em] uppercase drop-shadow-[0_2px_8px_rgba(251,146,60,0.6)]">
                    Light of Truth
                </div>
                <div className="text-amber-300/50 text-[10px] uppercase tracking-widest mt-2">
                    Divine Awareness • Eternal Grace
                </div>
            </motion.div>
        </div>
    );
};
