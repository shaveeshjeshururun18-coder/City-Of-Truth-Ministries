import React, { useCallback, useEffect, useState } from 'react';

interface CotIdEpicDiceProps {
    isRolling: boolean;
    result: string;
}

interface Particle {
    id: number;
    translateX: number;
    translateY: number;
    size: number;
    rotation: number;
    type: number;
}

const PARTICLE_COUNT = 30;
const MIN_VELOCITY = 45;
const VELOCITY_RANGE = 90;
const MIN_PARTICLE_SIZE = 4;
const PARTICLE_SIZE_RANGE = 10;
const MAX_ROTATION_DEGREES = 1080;

export const CotIdEpicDice: React.FC<CotIdEpicDiceProps> = ({ isRolling, result }) => {
    const [showResult, setShowResult] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);

    const generateParticles = useCallback(() => {
        const newParticles = Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
            const angle = Math.random() * Math.PI * 2;
            const velocity = MIN_VELOCITY + Math.random() * VELOCITY_RANGE;
            return {
                id: i,
                translateX: Math.cos(angle) * velocity,
                translateY: Math.sin(angle) * velocity,
                size: MIN_PARTICLE_SIZE + Math.random() * PARTICLE_SIZE_RANGE,
                rotation: Math.random() * MAX_ROTATION_DEGREES,
                type: Math.floor(Math.random() * 3)
            };
        });
        setParticles(newParticles);
    }, []);

    useEffect(() => {
        if (isRolling) {
            setShowResult(false);
            setParticles([]);
            return;
        }
        if (result) {
            setShowResult(true);
            generateParticles();
        }
    }, [generateParticles, isRolling, result]);

    return (
        <div className={`cot-epic-dice relative min-w-[250px] h-[130px] overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-slate-100 via-indigo-50 to-violet-100 ${showResult ? 'epic-shake' : ''}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.95),rgba(238,242,255,0.45),transparent_70%)] pointer-events-none" />

            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${showResult ? 'opacity-0 scale-75 blur-sm' : 'opacity-100 scale-100'}`}>
                <div className="scene w-16 h-16">
                    <div className={`cube w-full h-full relative preserve-3d ${isRolling ? 'animate-ultra-roll' : 'rotate-isometric'}`}>
                        {['front', 'back', 'right', 'left', 'top', 'bottom'].map((face) => (
                            <div key={face} className={`cube-face ${face}`}>
                                {face === 'front' && <span className="dot center" />}
                                {face === 'back' && <><span className="dot top-left" /><span className="dot bottom-right" /></>}
                                {face === 'right' && <><span className="dot top-left" /><span className="dot center" /><span className="dot bottom-right" /></>}
                                {face === 'left' && <><span className="dot top-left" /><span className="dot top-right" /><span className="dot bottom-left" /><span className="dot bottom-right" /></>}
                                {face === 'top' && <><span className="dot top-left" /><span className="dot top-right" /><span className="dot center" /><span className="dot bottom-left" /><span className="dot bottom-right" /></>}
                                {face === 'bottom' && <><span className="dot top-left" /><span className="dot top-right" /><span className="dot middle-left" /><span className="dot middle-right" /><span className="dot bottom-left" /><span className="dot bottom-right" /></>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showResult && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <span className="font-mono text-2xl md:text-3xl font-black tracking-wider text-3d-extruded slam-down px-2">
                        {result}
                    </span>
                    {particles.map((p) => (
                        <div
                            key={p.id}
                            className="absolute top-1/2 left-1/2 z-30"
                            style={{
                                width: `${p.size}px`,
                                height: p.type === 2 ? `${p.size}px` : `${p.size * 1.35}px`,
                                background: p.type === 0 ? 'linear-gradient(135deg, #a855f7, #4c1d95)' :
                                    p.type === 1 ? 'linear-gradient(135deg, #ffffff, #cbd5e1)' : '#e9d5ff',
                                borderRadius: p.type === 2 ? '50%' : '2px',
                                clipPath: p.type !== 2 ? 'polygon(50% 0%, 100% 30%, 80% 100%, 20% 100%, 0% 30%)' : 'none',
                                ['--tx' as string]: `${p.translateX}px`,
                                ['--ty' as string]: `${p.translateY}px`,
                                ['--rot' as string]: `${p.rotation}deg`,
                                animation: 'explode-out 1.15s cubic-bezier(0.1, 1, 0.3, 1) forwards'
                            }}
                        />
                    ))}
                </div>
            )}

            <style>{`
                .cot-epic-dice .preserve-3d { transform-style: preserve-3d; }
                .cot-epic-dice .rotate-isometric { transform: rotateX(-20deg) rotateY(35deg); }
                .cot-epic-dice .cube-face {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 20%;
                    box-shadow: inset 0 0 16px rgba(147,51,234,0.08), inset -4px -4px 10px rgba(0,0,0,0.09), 0 8px 18px rgba(0,0,0,0.1);
                }
                .cot-epic-dice .front  { transform: rotateY(0deg) translateZ(32px); }
                .cot-epic-dice .back   { transform: rotateY(180deg) translateZ(32px); }
                .cot-epic-dice .right  { transform: rotateY(90deg) translateZ(32px); }
                .cot-epic-dice .left   { transform: rotateY(-90deg) translateZ(32px); }
                .cot-epic-dice .top    { transform: rotateX(90deg) translateZ(32px); }
                .cot-epic-dice .bottom { transform: rotateX(-90deg) translateZ(32px); }
                .cot-epic-dice .dot {
                    position: absolute;
                    width: 24%;
                    height: 24%;
                    background: radial-gradient(circle at 30% 30%, #a855f7, #4c1d95);
                    border-radius: 50%;
                    box-shadow: inset 0 3px 4px rgba(0,0,0,0.5), inset 0 -2px 3px rgba(255,255,255,0.35), 0 1px 8px rgba(147, 51, 234, 0.35);
                }
                .cot-epic-dice .center { top: 38%; left: 38%; }
                .cot-epic-dice .top-left { top: 12%; left: 12%; }
                .cot-epic-dice .top-right { top: 12%; right: 12%; }
                .cot-epic-dice .bottom-left { bottom: 12%; left: 12%; }
                .cot-epic-dice .bottom-right { bottom: 12%; right: 12%; }
                .cot-epic-dice .middle-left { top: 38%; left: 12%; }
                .cot-epic-dice .middle-right { top: 38%; right: 12%; }
                .cot-epic-dice .animate-ultra-roll { animation: ultra-roll 0.9s cubic-bezier(0.2, 0.9, 0.3, 1) forwards; }
                .cot-epic-dice .text-3d-extruded {
                    background: linear-gradient(to bottom, #ffffff, #e9d5ff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    text-shadow: 0 1px 0 #d8b4fe, 0 2px 0 #c084fc, 0 3px 0 #a855f7, 0 4px 0 #9333ea, 0 10px 16px rgba(88, 28, 135, 0.4);
                }
                .cot-epic-dice .slam-down { animation: slam-extruded 0.35s cubic-bezier(0.1, 0.9, 0.2, 1.4) forwards; }
                .cot-epic-dice.epic-shake { animation: epic-shake 0.45s cubic-bezier(.36,.07,.19,.97) both; }
                @keyframes ultra-roll {
                    0% { transform: translate3d(0, -120px, -100px) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
                    25% { transform: translate3d(22px, 10px, 15px) rotateX(380deg) rotateY(360deg) rotateZ(180deg); }
                    50% { transform: translate3d(-18px, -22px, 12px) rotateX(700deg) rotateY(550deg) rotateZ(360deg); }
                    75% { transform: translate3d(8px, -6px, 4px) rotateX(950deg) rotateY(790deg) rotateZ(540deg); }
                    100% { transform: translate3d(0, 0, 0) rotateX(1080deg) rotateY(980deg) rotateZ(700deg); }
                }
                @keyframes slam-extruded {
                    0% { transform: scale(2.8) translateY(-14px); opacity: 0; filter: blur(8px); }
                    40% { opacity: 1; filter: blur(0); }
                    100% { transform: scale(1) translateY(0); }
                }
                @keyframes epic-shake {
                    0%, 100% { transform: translate3d(0, 0, 0); }
                    15%, 50%, 85% { transform: translate3d(-5px, 4px, 0) rotate(-1deg); }
                    30%, 70% { transform: translate3d(5px, -4px, 0) rotate(1deg); }
                }
                @keyframes explode-out {
                    0% { transform: translate(0, 0) rotate(0deg) scale(0); opacity: 0; }
                    12% { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(1); }
                    100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0.2); opacity: 0; }
                }
            `}</style>
        </div>
    );
};
