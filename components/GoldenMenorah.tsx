
import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles, Book } from 'lucide-react';

export const GoldenMenorah: React.FC = () => {
  return (
    <section className="min-h-screen bg-brand-950 pt-32 pb-20 relative overflow-hidden">
      {/* Atmosphere effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full text-amber-400 mb-8">
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Spiritual Sanctuary</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight">
              The Golden <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">Menorah Temple</span>
            </h1>
            <p className="text-brand-100/70 text-lg leading-relaxed mb-10 max-w-xl">
              Symbolizing the eternal presence of God, the Menorah stands as a beacon of Truth. In the City of Truth Ministries, we walk in this divine light, illuminating the path for every seeker of grace.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: <Flame />, title: "Holy Presence", desc: "Walking in the spirit every day." },
                { icon: <Book />, title: "Wisdom", desc: "Understanding the deeper truths." }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                  <div className="text-amber-500 mb-4">{item.icon}</div>
                  <h3 className="text-white font-bold mb-2">{item.title}</h3>
                  <p className="text-brand-100/50 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="relative">
            {/* Menorah SVG with Animation */}
            <motion.svg
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              viewBox="0 0 200 160"
              className="w-full h-full max-w-md mx-auto drop-shadow-[0_0_50px_rgba(251,191,36,0.5)]"
            >
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FCD34D" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#FCD34D" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              
              <path d="M100 150 L100 40 M70 150 L130 150 L120 140 L80 140 Z" fill="url(#goldGradient)" stroke="#B45309" strokeWidth="1" />
              
              <path d="M100 110 C60 110 40 80 40 50" fill="none" stroke="url(#goldGradient)" strokeWidth="4" />
              <path d="M100 90 C70 90 60 70 60 50" fill="none" stroke="url(#goldGradient)" strokeWidth="4" />
              <path d="M100 70 C85 70 80 60 80 50" fill="none" stroke="url(#goldGradient)" strokeWidth="4" />
              
              <path d="M100 110 C140 110 160 80 160 50" fill="none" stroke="url(#goldGradient)" strokeWidth="4" />
              <path d="M100 90 C130 90 140 70 140 50" fill="none" stroke="url(#goldGradient)" strokeWidth="4" />
              <path d="M100 70 C115 70 120 60 120 50" fill="none" stroke="url(#goldGradient)" strokeWidth="4" />

              {[40, 60, 80, 100, 120, 140, 160].map((x, i) => (
                <g key={i}>
                  <rect x={x - 4} y="45" width="8" height="6" fill="#B45309" />
                  <motion.path
                    d={`M${x} 45 Q${x-2} 35 ${x} 25 Q${x+2} 35 ${x} 45`}
                    fill="#FEF3C7"
                    animate={{ 
                      d: [
                        `M${x} 45 Q${x-2} 35 ${x} 25 Q${x+2} 35 ${x} 45`,
                        `M${x} 45 Q${x-3} 32 ${x} 20 Q${x+3} 32 ${x} 45`,
                        `M${x} 45 Q${x-2} 35 ${x} 25 Q${x+2} 35 ${x} 45`
                      ],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ 
                      duration: 0.8 + Math.random() * 0.5, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                    filter="url(#glow)"
                  />
                  <motion.circle cx={x} cy="35" r="3" fill="orange" opacity="0.4" animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 0.3, repeat: Infinity }} />
                </g>
              ))}
            </motion.svg>
          </div>
        </div>
      </div>
    </section>
  );
};
