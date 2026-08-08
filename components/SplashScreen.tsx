import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  isFirstVisit: boolean;
}

/**
 * App-style splash screen for City of Truth Ministries.
 * First visit: ~1.4 s full splash.
 * Returning visit: ~0.65 s compact flash.
 */
export default function SplashScreen({ onComplete, isFirstVisit }: SplashScreenProps) {
  const [closing, setClosing] = useState(false);

  // Durations: first visit is longer, returning is fast
  const holdMs  = isFirstVisit ? 1000 : 350;
  const fadeMs  = isFirstVisit ?  400 : 250;
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
      {/* Inline CSS — scoped, no external dependency */}
      <style>{`
        @keyframes cot-logo {
          0%   { opacity: 0; transform: scale(0.88); }
          50%  { opacity: 1; transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1);    }
        }
        @keyframes cot-title {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes cot-glow {
          0%, 100% { box-shadow: 0 0 18px 4px rgba(214,180,92,0.12); }
          50%       { box-shadow: 0 0 38px 8px rgba(214,180,92,0.28); }
        }

        .cot-splash-bg {
          transition: opacity ${fadeMs}ms cubic-bezier(0.4,0,1,1);
        }
        .cot-logo-wrap {
          animation: cot-logo 0.72s cubic-bezier(0.22,1,0.36,1) both,
                     cot-glow 2s ease-in-out 0.5s infinite;
        }
        .cot-title {
          animation: cot-title 0.5s ease-out ${isFirstVisit ? '0.38' : '0.15'}s both;
        }
        .cot-subtitle {
          animation: cot-title 0.5s ease-out ${isFirstVisit ? '0.52' : '0.22'}s both;
        }
      `}</style>

      <div
        aria-hidden="true"
        className={`cot-splash-bg fixed inset-0 z-[999999] flex items-center justify-center bg-[#071A46] ${closing ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="flex flex-col items-center select-none pointer-events-none">

          {/* Logo */}
          <div
            className="cot-logo-wrap mb-6 rounded-3xl overflow-hidden"
            style={{ willChange: 'transform, opacity, box-shadow' }}
          >
            <img
              src="/logo.png"
              alt="City of Truth Ministries logo"
              className="h-20 w-20 sm:h-24 sm:w-24 object-contain"
              draggable={false}
            />
          </div>

          {/* Word-mark */}
          <div className="text-center overflow-hidden">
            <h1 className="cot-title m-0 text-xl sm:text-2xl font-semibold tracking-[0.28em] text-white leading-tight">
              CITY OF TRUTH
            </h1>
            <p className="cot-subtitle mt-1.5 text-[10px] sm:text-xs tracking-[0.45em] text-[#D6B45C] font-medium">
              MINISTRIES
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
