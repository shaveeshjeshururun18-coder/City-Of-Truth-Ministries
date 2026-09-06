import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  isFirstVisit: boolean;
}

const STARS = [
  [8, 18, 3], [16, 31, 2], [24, 12, 2], [33, 24, 4], [42, 9, 2],
  [55, 19, 3], [63, 8, 2], [71, 28, 3], [81, 14, 2], [91, 34, 3],
  [12, 58, 2], [28, 69, 3], [47, 57, 2], [67, 66, 3], [86, 55, 2],
  [94, 72, 3], [5, 82, 2], [38, 84, 2], [59, 78, 2], [77, 88, 3],
];

/** A lightweight React version of the supplied cinematic splash designs. */
export default function SplashScreen({ onComplete, isFirstVisit }: SplashScreenProps) {
  const [closing, setClosing] = useState(false);
  // Keep the returning splash quick, but long enough for the title plaque and
  // location line to finish revealing before the app takes over.
  const holdMs = isFirstVisit ? 1800 : 1200;
  const exitMs = 450;

  useEffect(() => {
    const closeTimer = window.setTimeout(() => setClosing(true), holdMs);
    const completeTimer = window.setTimeout(onComplete, holdMs + exitMs);
    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(completeTimer);
    };
  }, [holdMs, onComplete]);

  return (
    <div aria-hidden="true" className={`cot-splash fixed inset-0 z-[999999] overflow-hidden ${closing ? 'cot-splash--closing' : ''}`}>
      <style>{`
        @keyframes cot-splash-in { from { opacity: 0; transform: translateY(16px) scale(.96); } to { opacity: 1; transform: none; } }
        @keyframes cot-splash-rise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
        @keyframes cot-splash-twinkle { 0%, 100% { opacity: .2; transform: scale(.65); } 50% { opacity: 1; transform: scale(1); } }
        @keyframes cot-splash-glow { 0%, 100% { transform: scale(.94); opacity: .55; } 50% { transform: scale(1.08); opacity: .95; } }
        @keyframes cot-splash-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes cot-splash-shoot { from { transform: translate(0, 0) rotate(-28deg); opacity: 0; } 15% { opacity: .9; } to { transform: translate(-180px, 130px) rotate(-28deg); opacity: 0; } }
        @keyframes cot-splash-out { to { opacity: 0; transform: translateY(100%); } }
        .cot-splash { background: radial-gradient(ellipse at 50% 16%, rgba(232,199,102,.13), transparent 48%), radial-gradient(ellipse at 8% 82%, rgba(47,191,131,.12), transparent 42%), linear-gradient(175deg, #020209 0%, #071124 48%, #0d1d34 100%); }
        .cot-splash--closing { animation: cot-splash-out 450ms cubic-bezier(.6,0,.3,1) forwards; }
        .cot-splash__dust { position: absolute; inset: 0; opacity: .45; background-image: radial-gradient(1px 1px at 15% 22%, #f7e3a3, transparent), radial-gradient(1px 1px at 44% 13%, #fff, transparent), radial-gradient(1px 1px at 75% 26%, #e8c766, transparent), radial-gradient(1px 1px at 86% 70%, #fff, transparent), radial-gradient(1px 1px at 31% 78%, #e8c766, transparent); background-size: 280px 280px; }
        .cot-splash__star { position: absolute; width: var(--star-size); height: var(--star-size); border-radius: 50%; background: #f7e3a3; box-shadow: 0 0 8px #e8c766; animation: cot-splash-twinkle 3s ease-in-out infinite; animation-delay: var(--star-delay); }
        .cot-splash__shoot { position: absolute; top: 21%; right: 18%; width: 3px; height: 3px; border-radius: 50%; background: #fff8e6; box-shadow: 0 0 8px #fff8e6; animation: cot-splash-shoot 1.4s ease-out 1.1s both; }
        .cot-splash__content { position: relative; z-index: 3; display: flex; width: min(92vw, 560px); flex-direction: column; align-items: center; text-align: center; animation: cot-splash-in 800ms cubic-bezier(.16,.9,.22,1) both; }
        .cot-splash__seal { position: relative; display: grid; place-items: center; width: clamp(142px, 30vw, 190px); aspect-ratio: 1; }
        .cot-splash__seal::before { content: ''; position: absolute; inset: -25%; border-radius: 50%; background: radial-gradient(circle, rgba(232,199,102,.28), rgba(94,163,224,.08) 45%, transparent 70%); animation: cot-splash-glow 4s ease-in-out infinite; }
        .cot-splash__logo { position: relative; width: 88%; height: 88%; object-fit: contain; filter: drop-shadow(0 10px 22px rgba(0,0,0,.55)); animation: cot-splash-float 4.6s ease-in-out 800ms infinite; }
        .cot-splash__title { margin-top: 20px; color: #f7e3a3; font-family: Georgia, serif; font-size: clamp(24px, 6vw, 38px); font-weight: 700; letter-spacing: .13em; text-shadow: 0 0 22px rgba(232,199,102,.3); animation: cot-splash-rise 750ms cubic-bezier(.16,.9,.22,1) 220ms both; }
        .cot-splash__english { margin-top: 18px; padding: 13px 25px; border: 1px solid rgba(232,199,102,.3); border-radius: 16px; background: linear-gradient(155deg, rgba(255,255,255,.1), rgba(255,255,255,.025)); box-shadow: 0 12px 30px rgba(0,0,0,.3), inset 0 1px rgba(255,255,255,.1); color: #f4ecd8; animation: cot-splash-rise 750ms cubic-bezier(.16,.9,.22,1) 420ms both; }
        .cot-splash__english strong { display: block; font-family: Georgia, serif; font-size: clamp(16px, 3.8vw, 22px); letter-spacing: .18em; text-transform: uppercase; }
        .cot-splash__english span { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 5px; color: #e8c766; font-size: 10px; font-weight: 800; letter-spacing: .32em; text-transform: uppercase; }
        .cot-splash__english span::before, .cot-splash__english span::after { content: ''; width: 18px; height: 1px; background: rgba(232,199,102,.65); }
        .cot-splash__location { display: flex; align-items: center; gap: 9px; margin-top: 14px; color: #6fe8ac; font-size: 13px; font-weight: 700; letter-spacing: .12em; animation: cot-splash-rise 750ms cubic-bezier(.16,.9,.22,1) 580ms both; }
        .cot-splash__location small { color: rgba(244,236,216,.7); font-size: 10px; letter-spacing: .22em; text-transform: uppercase; }
        .cot-splash__tag { margin-top: 20px; padding: 9px 20px; border: 1px solid rgba(192,132,252,.55); border-radius: 999px; background: rgba(76,29,149,.34); color: #e9d5ff; font-size: 11px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase; box-shadow: 0 8px 24px rgba(72,1,143,.25); animation: cot-splash-rise 750ms cubic-bezier(.16,.9,.22,1) 740ms both; }
        .cot-splash__mountains { position: absolute; inset: auto 0 0; z-index: 1; width: 100%; height: 25vh; }
        .cot-splash__loading { display: flex; gap: 7px; margin-top: 24px; animation: cot-splash-rise 500ms ease-out 850ms both; }
        .cot-splash__loading i { width: 5px; height: 5px; border-radius: 50%; background: #e8c766; animation: cot-splash-twinkle 1.2s ease-in-out infinite; }
        .cot-splash__loading i:nth-child(2) { background: #6fe8ac; animation-delay: 180ms; }
        .cot-splash__loading i:nth-child(3) { animation-delay: 360ms; }
        @media (prefers-reduced-motion: reduce) { .cot-splash *, .cot-splash::before { animation-duration: .01ms !important; animation-iteration-count: 1 !important; } }
      `}</style>

      <div className="cot-splash__dust" />
      {STARS.map(([left, top, size], index) => (
        <span key={index} className="cot-splash__star" style={{ left: `${left}%`, top: `${top}%`, '--star-size': `${size}px`, '--star-delay': `${(index % 7) * 260}ms` } as React.CSSProperties} />
      ))}
      <span className="cot-splash__shoot" />

      <svg className="cot-splash__mountains" viewBox="0 0 800 220" preserveAspectRatio="none" aria-hidden="true">
        <polygon points="0,220 0,140 60,110 130,150 200,95 270,135 340,80 410,125 480,70 560,120 630,85 700,130 760,100 800,140 800,220" fill="#0d1f3a" opacity=".6" />
        <polygon points="0,220 0,165 70,120 150,160 230,105 300,155 380,100 450,150 540,110 610,155 690,115 760,150 800,130 800,220" fill="#0a1730" opacity=".8" />
        <polygon points="0,220 0,180 90,150 170,175 260,140 340,170 430,135 520,172 610,145 700,175 800,155 800,220" fill="#050c1c" opacity=".96" />
      </svg>

      <main className="cot-splash__content">
        <div className="cot-splash__seal">
          <img className="cot-splash__logo" src="/logo.png" alt="City of Truth Ministries" draggable={false} />
        </div>
        <div className="cot-splash__title">சத்திய நகரம்</div>
        <div className="cot-splash__english"><strong>City of Truth</strong><span>Ministries</span></div>
        <div className="cot-splash__location"><span>வால்பாறை</span><b>•</b><small>Valparai</small></div>
        <div className="cot-splash__tag">✦ Building Discipleship ✦</div>
        <div className="cot-splash__loading"><i /><i /><i /></div>
      </main>
    </div>
  );
}
