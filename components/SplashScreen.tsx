import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  isFirstVisit: boolean;
}

/**
 * Enhanced, magnificent splash screen for City of Truth Ministries.
 * Loads quickly and features a beautiful dynamic background.
 */
export default function SplashScreen({ onComplete, isFirstVisit }: SplashScreenProps) {
  const [closing, setClosing] = useState(false);

  // Fast durations for a quick, snappy experience
  const holdMs  = isFirstVisit ? 600 : 250;
  const fadeMs  = isFirstVisit ? 300 : 150;
  const totalMs = holdMs + fadeMs;

  useEffect(() => {
    const closeTimer   = setTimeout(() => setClosing(true), holdMs);
    const completeTimer = setTimeout(() => onComplete(),    totalMs);
    return () => {
      clearTimeout(closeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, holdMs, totalMs]);

  return (
    <>
      <style>{`
        @keyframes cot-bg-pan {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes cot-logo-pop {
          0%   { opacity: 0; transform: scale(0.85) translateY(10px); }
          60%  { opacity: 1; transform: scale(1.05) translateY(-5px); }
          100% { opacity: 1; transform: scale(1) translateY(0);    }
        }
        @keyframes cot-title-reveal {
          from { opacity: 0; transform: translateY(15px); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes cot-glow {
          0%, 100% { box-shadow: 0 0 20px 5px rgba(214,180,92,0.15), 0 0 40px 10px rgba(7,26,70,0.3); }
          50%       { box-shadow: 0 0 40px 10px rgba(214,180,92,0.35), 0 0 60px 15px rgba(7,26,70,0.5); }
        }

        .cot-splash-bg {
          background: linear-gradient(-45deg, #071A46, #0A2463, #040D26, #1A1025);
          background-size: 400% 400%;
          animation: cot-bg-pan 8s ease infinite;
          transition: opacity ${fadeMs}ms cubic-bezier(0.4, 0, 1, 1);
        }
        
        .cot-glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 2rem;
          padding: 2.5rem;
        }

        .cot-logo-wrap {
          animation: cot-logo-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both,
                     cot-glow 2.5s ease-in-out 0.6s infinite;
        }
        .cot-title {
          animation: cot-title-reveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${isFirstVisit ? '0.3' : '0.1'}s both;
        }
        .cot-subtitle {
          animation: cot-title-reveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${isFirstVisit ? '0.45' : '0.15'}s both;
        }
      `}</style>

      <div
        aria-hidden="true"
        className={`cot-splash-bg fixed inset-0 z-[999999] flex items-center justify-center ${closing ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="cot-glass-panel flex flex-col items-center select-none pointer-events-none shadow-2xl">
          {/* Logo */}
          <div
            className="cot-logo-wrap mb-8 rounded-full bg-white/5 p-2 overflow-hidden"
            style={{ willChange: 'transform, opacity, box-shadow' }}
          >
            <img
              src="/logo.png"
              alt="City of Truth Ministries logo"
              className="h-24 w-24 sm:h-28 sm:w-28 object-contain drop-shadow-xl"
              draggable={false}
            />
          </div>

          {/* Word-mark */}
          <div className="text-center overflow-hidden flex flex-col items-center">
            <h1 className="cot-title m-0 text-2xl sm:text-3xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-white via-[#f8fafc] to-white/80 leading-tight">
              CITY OF TRUTH
            </h1>
            <div className="cot-subtitle mt-3 flex items-center gap-3">
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#D6B45C]/60" />
              <p className="text-[11px] sm:text-sm tracking-[0.5em] text-[#D6B45C] font-bold uppercase">
                MINISTRIES
              </p>
              <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#D6B45C]/60" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

