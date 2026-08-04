import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';

interface GreetingCardProps {
  currentUser?: User | null;
  isAdmin?: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

let audioCtx: any = null;

// --- AUDIO SYNTHESIZER: ROYAL TRUMPET FANFARE (30 SECONDS) ---
const playRoyalTrumpetSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    const now = audioCtx.currentTime;

    // Royal Fanfare Notes (Hz): C4, G4, C5, E5, G5, C6 spanning 30 seconds
    const notes = [
      { f: 261.63, t: 0.0, d: 0.25 }, // C4
      { f: 392.00, t: 0.28, d: 0.25 }, // G4
      { f: 523.25, t: 0.56, d: 0.35 }, // C5
      { f: 659.25, t: 0.95, d: 0.30 }, // E5
      { f: 783.99, t: 1.28, d: 0.35 }, // G5
      { f: 1046.50, t: 1.65, d: 0.85 }, // High C6 Flourish

      // Repeat Fanfare Calls up to 30s
      { f: 392.00, t: 3.0, d: 0.20 },
      { f: 523.25, t: 3.25, d: 0.20 },
      { f: 659.25, t: 3.50, d: 0.20 },
      { f: 783.99, t: 3.75, d: 0.80 },

      { f: 523.25, t: 6.0, d: 0.25 },
      { f: 659.25, t: 6.3, d: 0.25 },
      { f: 783.99, t: 6.6, d: 0.40 },
      { f: 1046.50, t: 7.05, d: 1.2 },

      { f: 261.63, t: 10.0, d: 0.3 },
      { f: 392.00, t: 10.35, d: 0.3 },
      { f: 523.25, t: 10.7, d: 0.9 },

      { f: 523.25, t: 14.0, d: 0.25 },
      { f: 659.25, t: 14.3, d: 0.25 },
      { f: 783.99, t: 14.6, d: 0.5 },
      { f: 1046.50, t: 15.15, d: 1.5 },

      { f: 392.00, t: 19.0, d: 0.25 },
      { f: 523.25, t: 19.3, d: 0.25 },
      { f: 659.25, t: 19.6, d: 0.25 },
      { f: 783.99, t: 19.9, d: 1.0 },

      { f: 523.25, t: 24.0, d: 0.3 },
      { f: 659.25, t: 24.35, d: 0.3 },
      { f: 783.99, t: 24.7, d: 0.4 },
      { f: 1046.50, t: 25.15, d: 2.2 },
    ];

    notes.forEach(note => {
      const startTime = now + note.t;
      const duration = note.d;

      const osc = audioCtx.createOscillator();
      const subOsc = audioCtx.createOscillator();
      const filter = audioCtx.createBiquadFilter();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.f, startTime);

      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(note.f * 2, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(note.f * 3.2, startTime);
      filter.Q.setValueAtTime(2.5, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.12, startTime + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(startTime);
      subOsc.start(startTime);
      osc.stop(startTime + duration + 0.05);
      subOsc.stop(startTime + duration + 0.05);
    });
  } catch (e) {
    console.warn("Royal trumpet synth notice:", e);
  }
};

const playPreciousChime = () => {
  playRoyalTrumpetSound();
};

// --- STYLES & ANIMATIONS ---
const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');

  .font-cinzel { font-family: 'Cinzel Decorative', serif; }
  .font-playfair { font-family: 'Playfair Display', serif; }

  @keyframes royalEnter {
    0% { opacity: 0; transform: scale(0.96) translateY(20px); }
    100% { opacity: 1; transform: scale(1) translateY(0); box-shadow: 0 30px 80px rgba(0, 0, 0, 0.9), 0 0 50px rgba(212, 175, 55, 0.12), inset 0 0 50px rgba(15, 23, 42, 0.9); }
  }

  @keyframes goldenErase {
    0% { opacity: 1; transform: scale(1) translateY(0); }
    100% { opacity: 0; transform: scale(0.97) translateY(-18px); }
  }

  @keyframes backdropFadeOut {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes goldDustFly {
    0% { opacity: 0; transform: translate(0, 0) scale(0); }
    20% { opacity: 1; transform: translate(var(--tx-mid), var(--ty-mid)) scale(1.2); box-shadow: 0 0 15px var(--dust-color), 0 0 30px var(--dust-color); }
    100% { opacity: 0; transform: translate(var(--tx-end), var(--ty-end)) scale(0.2); box-shadow: 0 0 2px var(--dust-color); }
  }

  @keyframes floatEmber {
    0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
    20% { opacity: 0.6; }
    80% { opacity: 0.6; }
    100% { transform: translateY(-300px) translateX(var(--drift)) scale(0.5); opacity: 0; }
  }

  /* Sweeping cursive motion for the royal pen */
  @keyframes penWrite {
    0% { transform: rotate(0deg) translate(0px, 0px); }
    25% { transform: rotate(-5deg) translate(-3px, -4px); }
    50% { transform: rotate(3deg) translate(4px, 2px); }
    75% { transform: rotate(-3deg) translate(1px, -3px); }
    100% { transform: rotate(0deg) translate(0px, 0px); }
  }
  .animate-pen { animation: penWrite 0.35s infinite cubic-bezier(0.4, 0, 0.2, 1); }

  .writing-caret {
    display: inline-block;
    width: 0.5em;
    height: 1.05em;
    margin-left: 0.16em;
    vertical-align: -0.12em;
    border-radius: 999px;
    background: linear-gradient(180deg, #ffffff, #fde047 42%, #d4af37);
    box-shadow: 0 0 10px rgba(253, 224, 71, 0.65), 0 0 18px rgba(56, 189, 248, 0.25);
  }

  @keyframes cinematicReveal {
    0% { opacity: 0; filter: blur(6px); transform: translateY(3px) scale(1.05); }
    100% { opacity: 1; filter: blur(0px); transform: translateY(0) scale(1); }
  }
  .animate-text-draw { animation: cinematicReveal 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.1) forwards; }

  .anim-royal-enter { animation: royalEnter 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; will-change: transform, opacity; }
  .anim-golden-erase { animation: goldenErase 0.65s cubic-bezier(0.4, 0, 1, 1) forwards; will-change: transform, opacity; }
  .hidden-state { opacity: 0; pointer-events: none; }
  .anim-backdrop-fadeout { animation: backdropFadeOut 0.65s cubic-bezier(0.4, 0, 1, 1) forwards; }

  .postal-frame {
    background: linear-gradient(135deg, #050b1a 0%, #010308 100%);
    position: relative; border-radius: 8px;
  }
  .postal-frame::before {
    content: ''; position: absolute; top: 10px; left: 10px; right: 10px; bottom: 10px;
    border: 1px solid rgba(212, 175, 55, 0.4); pointer-events: none; border-radius: 4px;
    box-shadow: inset 0 0 20px rgba(212, 175, 55, 0.08);
  }
  .postal-frame::after {
    content: ''; position: absolute; top: 15px; left: 15px; right: 15px; bottom: 15px;
    border: 1px solid rgba(212, 175, 55, 0.15); pointer-events: none; border-radius: 2px;
  }
`;

// --- PERFORMANCE OPTIMIZED BACKGROUND PARTICLES ---
const RoyalEmbers = React.memo(() => {
  const embers = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => {
      const size = Math.random() * 4 + 2 + 'px';
      const left = Math.random() * 100 + '%';
      const delay = Math.random() * 5 + 's';
      const duration = Math.random() * 10 + 8 + 's';
      const drift = (Math.random() - 0.5) * 120 + 'px';
      return (
        <div key={i} className="absolute bottom-0 rounded-full bg-[#D4AF37] blur-[1px] opacity-0 mix-blend-screen pointer-events-none"
          style={{ width: size, height: size, left: left, boxShadow: '0 0 8px 1px #FDE047', '--drift': drift, animation: `floatEmber ${duration} linear ${delay} infinite` } as any}
        />
      );
    });
  }, []);
  return <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">{embers}</div>;
});
RoyalEmbers.displayName = 'RoyalEmbers';

const GoldDustSystem = React.memo<{ isErasing: boolean }>(({ isErasing }) => {
  const particles = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => {
      const txMid = (Math.random() - 0.5) * 350 + 'px';
      const tyMid = (Math.random() * -250) - 50 + 'px'; 
      const txEnd = (Math.random() - 0.5) * 700 + 'px';
      const tyEnd = (Math.random() * -500) - 150 + 'px'; 
      const colors = ['#D4AF37', '#FDE047', '#FFFFFF', '#FFF8D6'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const delay = Math.random() * 0.4 + 's';
      const size = Math.random() * 3 + 2 + 'px';
      return (
        <div key={i} className="absolute top-1/2 left-1/2 rounded-full pointer-events-none z-50 mix-blend-screen"
          style={{
            width: size, height: size, backgroundColor: color,
            '--tx-mid': txMid, '--ty-mid': tyMid, '--tx-end': txEnd, '--ty-end': tyEnd, '--dust-color': color,
            animation: `goldDustFly 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay} forwards`
          } as any}
        />
      );
    });
  }, []);

  if (!isErasing) return null;
  return <div className="absolute inset-0 overflow-visible pointer-events-none">{particles}</div>;
});
GoldDustSystem.displayName = 'GoldDustSystem';

// --- ACTIVE RED ROYAL PEN NIB AT WRITING TIP ---
const RedWritingPen: React.FC<{ isWriting?: boolean }> = ({ isWriting }) => (
  <span
    className={`inline-block relative z-30 align-middle pointer-events-none transition-transform duration-75 ${
      isWriting ? 'animate-pen scale-110' : 'opacity-90'
    }`}
    style={{
      width: '32px',
      height: '32px',
      margin: '0 2px',
      verticalAlign: '-4px',
    }}
  >
    <svg
      className="w-full h-full drop-shadow-[0_4px_12px_rgba(239,68,68,0.75)]"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <path d="M20 95 L36 75 L46 84 L27 101 Z" fill="url(#redPenGoldNibTip)" />
      <path d="M26 96 L37 80" stroke="#4a0f0f" strokeWidth="2" strokeLinecap="round" />
      <circle cx="37" cy="80" r="2.2" fill="#4a0f0f" />
      <path d="M38 72 L49 83 L56 73 L45 62 Z" fill="#13080a" />
      <path d="M47 60 L58 71 L88 35 C94 28 97 20 94 17 C91 14 83 17 76 24 L47 60 Z" fill="url(#redPenBarrelTip)" />
      <path d="M53 60 C66 47 80 30 91 18" stroke="rgba(255,255,255,0.45)" strokeWidth="3" strokeLinecap="round" />
      <path d="M58 71 L64 65" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
      <path d="M74 25 L86 37" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
      <path d="M91 18 L98 11 L106 19 L99 26 Z" fill="url(#redPenRubyTip)" />
      <circle cx="101" cy="15" r="4" fill="#fee2e2" />
      <path d="M17 101 C28 98 35 100 45 107" stroke="rgba(239,68,68,0.5)" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="redPenBarrelTip" x1="47" y1="71" x2="95" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#450a0a" />
          <stop offset="0.42" stopColor="#dc2626" />
          <stop offset="0.72" stopColor="#f87171" />
          <stop offset="1" stopColor="#7f1d1d" />
        </linearGradient>
        <linearGradient id="redPenGoldNibTip" x1="20" y1="101" x2="46" y2="75" gradientUnits="userSpaceOnUse">
          <stop stopColor="#713f12" />
          <stop offset="0.45" stopColor="#fde047" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="redPenRubyTip" x1="91" y1="26" x2="106" y2="11" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7f1d1d" />
          <stop offset="0.55" stopColor="#ef4444" />
          <stop offset="1" stopColor="#fecaca" />
        </linearGradient>
      </defs>
    </svg>
  </span>
);

// 3D Cinematic Text Reveal Engine
const CinematicText: React.FC<{
  text: string;
  type: 'gold-hp' | 'icy-blue' | 'standard';
  className?: string;
  visibleCount: number;
  isTyping: boolean;
}> = ({ text, type, className, visibleCount, isTyping }) => {
  const isHebrew = /[\u0590-\u05FF]/.test(text || '');
  const safeText = text || '';
  const count = Math.min(Math.max(visibleCount, 0), safeText.length);
  const shownText = safeText.slice(0, count);

  const styleClass = type === 'gold-hp'
    ? 'text-transparent bg-clip-text drop-shadow-[0_6px_18px_rgba(212,175,55,0.45)]'
    : type === 'icy-blue'
      ? 'text-transparent bg-clip-text drop-shadow-[0_0_18px_rgba(56,189,248,0.36)]'
      : 'text-slate-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]';
  const backgroundImage = type === 'gold-hp'
    ? 'linear-gradient(180deg, #FFFFFF 0%, #FDE047 35%, #D4AF37 62%, #FEF08A 100%)'
    : type === 'icy-blue'
      ? 'linear-gradient(180deg, #FFFFFF 0%, #7DD3FC 38%, #38BDF8 70%, #E0F2FE 100%)'
      : undefined;

  return (
    <div className={`relative max-w-full whitespace-normal break-words text-center ${className}`} dir={isHebrew ? "rtl" : "ltr"}>
      <span className={`inline ${styleClass}`} style={backgroundImage ? { backgroundImage } : undefined}>
        {shownText}
      </span>
      {isTyping && count < safeText.length && (
        <RedWritingPen isWriting={true} />
      )}
    </div>
  );
};

const DEFAULT_GREETING_DATA = [
  { key: 'morning', greeting: "בוקר טוב (BOKER TOV)",           audio: "boker_tov.mp3",       phrase: "May your day be filled with peace, wisdom, strength, and abundant blessings." },
  { key: 'noon',    greeting: "צהריים טובים (TZOHARAIM TOVIM)", audio: "tzoharaim_tovim.mp3", phrase: "May your afternoon be productive, peaceful, and filled with God's favor." },
  { key: 'evening', greeting: "ערב טוב (EREV TOV)",             audio: "erev_tov.mp3",        phrase: "May your evening bring peace, gratitude, and joyful fellowship." },
  { key: 'night',   greeting: "לילה טוב (LAILA TOV)",            audio: "laila_tov.mp3",       phrase: "May the Lord watch over you through the night and grant you peaceful rest." },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function GreetingCard({ currentUser, isAdmin = false, onClose, onStartTour }: GreetingCardProps) {
  const [phase, setPhase] = useState<'card-enter' | 'writing' | 'idle' | 'erase' | 'hidden'>('card-enter');
  const [activeSection, setActiveSection] = useState<'greeting' | 'phrase' | 'name' | 'footerL' | 'footerR' | null>(null);
  const [counts, setCounts] = useState({ greeting: 0, phrase: 0, name: 0, footerL: 0, footerR: 0 });
  const [greetingSettings, setGreetingSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const sequenceStartedRef = useRef(false);
  const sequenceFinishedRef = useRef(false);
  // Stable ref for onClose so it doesn't trigger useEffect re-runs
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const chimeAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopAllSounds = () => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (_e) {}

    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (_e) {}
    }

    if (chimeAudioRef.current) {
      try {
        chimeAudioRef.current.pause();
        chimeAudioRef.current.currentTime = 0;
      } catch (_e) {}
    }

    try {
      const voiceElem = document.getElementById("voiceGreetingAudio") as HTMLAudioElement;
      if (voiceElem) {
        voiceElem.pause();
        voiceElem.currentTime = 0;
      }
    } catch (_e) {}

    try {
      const shalomElem = document.getElementById("voiceShalomAudio") as HTMLAudioElement;
      if (shalomElem) {
        shalomElem.pause();
        shalomElem.currentTime = 0;
      }
    } catch (_e) {}
  };

  useEffect(() => {
    return () => {
      stopAllSounds();
    };
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await api.getWebsiteGreetingSettings();
        setGreetingSettings(settings);

        // Only close if settings explicitly disable the greeting AND the card hasn't already started showing
        // This prevents hiding the card after text is already visible
        if (sequenceStartedRef.current) return;

        const hour = new Date().getHours();
        let slotKey: 'morning' | 'noon' | 'evening' | 'night' = 'night';
        if (hour >= 5 && hour < 12) slotKey = 'morning';
        else if (hour >= 12 && hour < 17) slotKey = 'noon';
        else if (hour >= 17 && hour < 21) slotKey = 'evening';

        const slot = settings.slots?.[slotKey];

        // 1. Master enable/disable — only close if explicitly set to false (not undefined/null)
        if (settings.enabled === false) {
          onCloseRef.current();
          return;
        }

        // 2. Slot enable/disable — only close if explicitly set to false
        if (slot && slot.enabled === false) {
          onCloseRef.current();
          return;
        }

        // 3. Target group audience filtering
        const target = settings.targetGroup || 'all';
        if (target === 'active') {
          if (!currentUser || currentUser.status !== 'Active') {
            onCloseRef.current();
            return;
          }
        } else if (target === 'pending') {
          if (!currentUser || currentUser.status !== 'Pending Verification') {
            onCloseRef.current();
            return;
          }
        } else if (target === 'admin') {
          const isUserAdmin = isAdmin || currentUser?.role === 'Admin';
          if (!isUserAdmin) {
            onCloseRef.current();
            return;
          }
        }
      } catch (err) {
        // On API error, silently continue showing the greeting with defaults
        console.warn("Greeting settings API unavailable, using defaults", err);
      }
    };
    loadSettings();
  }, [currentUser, isAdmin]);

  // Specific time-of-day greeting data select
  const currentData = useMemo(() => {
    const hour = new Date().getHours();
    let slotKey: 'morning' | 'noon' | 'evening' | 'night' = 'night';
    if (hour >= 5 && hour < 12) slotKey = 'morning';
    else if (hour >= 12 && hour < 17) slotKey = 'noon';
    else if (hour >= 17 && hour < 21) slotKey = 'evening';

    const defaultSlot = DEFAULT_GREETING_DATA.find(d => d.key === slotKey)!;
    const dbSlot = greetingSettings?.slots?.[slotKey];

    return {
      greeting: dbSlot?.greeting || defaultSlot.greeting,
      phrase: dbSlot?.phrase || defaultSlot.phrase,
      audio: dbSlot?.audio || defaultSlot.audio,
    };
  }, [greetingSettings]);

  const greetingStr = currentData.greeting;
  const phraseStr = currentData.phrase;

  // Names and labels calculated dynamically
  const nameStr = useMemo(() => {
    if (isAdmin) return "Admin";
    if (currentUser) return currentUser.name || "שלום (SHALOM)";
    return "שלום (SHALOM)";
  }, [currentUser, isAdmin]);

  const footerLStr = useMemo(() => {
    if (isAdmin || currentUser) return "שלום (SHALOM)";
    return "";
  }, [currentUser, isAdmin]);

  const dateStr = useMemo(() => {
    try {
      const hebDate = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());
      const d = new Date();
      const engDate = `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
      return `${hebDate} | ${engDate}`;
    } catch {
      return new Date().toLocaleDateString();
    }
  }, []);

  const footerRStr = useMemo(() => {
    let base = "";
    if (!isAdmin && currentUser && currentUser.id) {
      base = currentUser.id + " • ";
    }
    return base + dateStr;
  }, [currentUser, isAdmin, dateStr]);

  const playVoiceFallback = (text: string) => {
    try {
      playRoyalTrumpetSound();

      const chime = new Audio('/greeting_sound.mp3');
      chime.volume = 0.6;
      chime.play().catch(() => {});
      chimeAudioRef.current = chime;

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const cleanText = (text || '').replace(/[\(\)]/g, '').trim();
        if (cleanText) {
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.rate = 0.9;
          utterance.pitch = 1.05;
          utterance.volume = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (e) {
      console.warn("Speech synthesis fallback error:", e);
    }
  };

  // Play audio on mount (non-blocking)
  useEffect(() => {
    if (!loading) {
      playVoiceFallback(greetingStr);
    }
  }, [loading, greetingStr]);

  // Fail-safe: if animation timing is interrupted or delayed for over 1.5s,
  // immediately show full text so visitors never see a blank card.
  useEffect(() => {
    if (loading) return;
    // If sequence already finished and text changed (e.g. API settings loaded), sync counts immediately
    if (sequenceFinishedRef.current) {
      setCounts({
        greeting: greetingStr.length,
        phrase: phraseStr.length,
        name: nameStr.length,
        footerL: footerLStr.length,
        footerR: footerRStr.length,
      });
      return;
    }
    const timer = window.setTimeout(() => {
      if (!sequenceFinishedRef.current) {
        sequenceFinishedRef.current = true;
        setCounts({
          greeting: greetingStr.length,
          phrase: phraseStr.length,
          name: nameStr.length,
          footerL: footerLStr.length,
          footerR: footerRStr.length,
        });
        setActiveSection(null);
        setPhase('idle');
      }
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [loading, greetingStr, phraseStr, nameStr, footerLStr, footerRStr]);


  // Fast typing sequence with Pen writing effect
  useEffect(() => {
    if (loading) return;
    if (sequenceFinishedRef.current) return;
    if (sequenceStartedRef.current) return;
    sequenceStartedRef.current = true;

    let isMounted = true;

    const runSequence = async () => {
      setPhase('writing');
      setActiveSection(null);
      setCounts({
        greeting: 0,
        phrase: 0,
        name: 0,
        footerL: footerLStr.length,
        footerR: footerRStr.length,
      });
      await sleep(30);
      if (!isMounted) return;

      const typeSection = async (
        sectionName: 'greeting' | 'phrase' | 'name',
        text: string,
        delayMs: number,
      ) => {
        if (!text || !isMounted) return;
        setActiveSection(sectionName);
        for (let i = 1; i <= text.length; i++) {
          if (!isMounted) return;
          setCounts(prev => ({ ...prev, [sectionName]: i }));
          await sleep(text[i - 1] === ' ' ? Math.max(6, delayMs - 4) : delayMs);
        }
        await sleep(60);
      };

      await typeSection('greeting', greetingStr, 12);
      await typeSection('phrase', phraseStr, 8);

      const shalomAudio = document.getElementById("voiceShalomAudio") as HTMLAudioElement;
      if (shalomAudio) {
        shalomAudio.volume = 0.9;
        shalomAudio.play().catch(() => {});
      }

      await typeSection('name', nameStr, 14);

      if (!isMounted) return;

      setActiveSection(null);
      sequenceFinishedRef.current = true;
      setPhase('idle');
    };

    runSequence();

    return () => {
      isMounted = false;
      if (!sequenceFinishedRef.current) {
        sequenceStartedRef.current = false;
      }
    };
  }, [loading, greetingStr, phraseStr, nameStr, footerLStr, footerRStr]);

  const handleClose = async () => {
    stopAllSounds();
    setPhase('erase');
    await sleep(650);
    setPhase('hidden');
    await sleep(50);
    onClose();
  };

  const handleTakeTour = () => {
    stopAllSounds();
    setPhase('hidden');
    onClose();
    onStartTour();
  };

  // Disappear after 30 seconds of typing completion (idle phase)
  useEffect(() => {
    if (phase === 'idle') {
      const timer = setTimeout(() => {
        handleClose();
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  let cardClass = "";
  if (phase === 'card-enter' || phase === 'writing' || phase === 'idle') cardClass = "anim-royal-enter";
  if (phase === 'erase') cardClass = "anim-golden-erase";
  if (phase === 'hidden') cardClass = "hidden-state";

  const backdropClass = phase === 'erase' || phase === 'hidden' ? 'anim-backdrop-fadeout' : '';

  if (loading) return null;

  return (
    <div className={`fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-4 overflow-hidden font-playfair select-none pointer-events-auto ${backdropClass}`}>
      <style>{customStyles}</style>

      {/* Pre-loads the audio greeting */}
      <audio ref={audioRef} src="/greeting_sound.mp3" loop preload="auto" />
      {/* Voice greetings dynamically loaded based on the time of day */}
      <audio id="voiceGreetingAudio" src={`/${currentData.audio}`} preload="auto" />
      <audio id="voiceShalomAudio" src="/shalom.mp3" preload="auto" />

      {/* Center card bounds */}
      <div className="relative max-w-[620px] w-full z-10 flex flex-col items-center">
        {/* Skip button at top right */}
        <button 
          onClick={handleClose} 
          className="absolute -top-9 right-2 text-white/60 hover:text-white transition-colors flex items-center gap-1 text-xs uppercase tracking-widest font-sans font-bold cursor-pointer"
        >
          Skip Greeting <X size={12} />
        </button>

        <GoldDustSystem isErasing={phase === 'erase'} />

        {/* Small horizontal card layout */}
        <div className={`postal-frame w-full max-w-[92vw] sm:max-w-[620px] px-3 sm:px-8 py-5 sm:py-8 flex flex-col justify-between min-h-[280px] shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-white/5 overflow-visible ${cardClass}`}>
          <div className="flex-1 flex flex-col justify-center items-center w-full z-10 overflow-visible">
            
            <div className="min-h-10 sm:min-h-12 flex items-center justify-center w-full mb-2 overflow-visible px-2">
              <CinematicText 
                text={greetingStr} 
                type="icy-blue" 
                visibleCount={counts.greeting}
                isTyping={activeSection === 'greeting'}
                className="font-cinzel text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-wider sm:tracking-widest text-center max-w-full"
              />
            </div>

            <div className="relative mb-3 sm:mb-5 px-2 sm:px-4 py-2 max-w-full sm:max-w-lg w-full text-center overflow-visible">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/45 to-transparent"></div>
              
              <CinematicText 
                text={phraseStr} 
                type="standard" 
                visibleCount={counts.phrase}
                isTyping={activeSection === 'phrase'}
                className="italic text-slate-100 text-[11px] sm:text-sm md:text-base leading-relaxed tracking-normal sm:tracking-wider font-light max-w-full"
              />
              
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/45 to-transparent"></div>
            </div>

            <div className="relative w-full flex justify-center py-1.5">
              <CinematicText 
                text={nameStr} 
                type="gold-hp" 
                visibleCount={counts.name}
                isTyping={activeSection === 'name'}
                className="font-cinzel text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-[0.1em] text-center"
              />
            </div>
          </div>

          <div className="flex items-center justify-between w-full mt-4 pt-3.5 z-30 relative border-t border-[#D4AF37]/15">
            {footerLStr ? (
              <CinematicText 
                  text={footerLStr} 
                  type="standard" 
                  visibleCount={counts.footerL}
                  isTyping={activeSection === 'footerL'}
                  className="font-cinzel text-lg sm:text-xl text-[#D4AF37] tracking-[0.3em] uppercase font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
              />
            ) : <div />}
            {footerRStr ? (
              <div dir="ltr" className="inline-block">
                <CinematicText 
                    text={footerRStr} 
                    type="standard" 
                    visibleCount={counts.footerR}
                    isTyping={activeSection === 'footerR'}
                    className="text-xs sm:text-sm text-slate-300 tracking-[0.25em] uppercase font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                />
              </div>
            ) : <div />}
          </div>
          
        </div>

        {/* CTA Buttons showing up in the idle phase */}
        {phase === 'idle' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-row gap-3 justify-center items-center mt-5 w-full z-[100]"
          >
            <button
              onClick={handleTakeTour}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-brand-950 font-black text-2xs sm:text-xs rounded-xl shadow-[0_4px_12px_rgba(245,158,11,0.25)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.4)] transition-all hover:scale-105 active:scale-95 font-cinzel tracking-widest uppercase flex items-center gap-1.5 border border-yellow-300 cursor-pointer"
            >
              <Sparkles size={12} className="animate-pulse" /> Tour
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 font-bold text-2xs sm:text-xs rounded-xl transition-all hover:scale-105 active:scale-95 font-cinzel tracking-widest uppercase cursor-pointer"
            >
              Explore
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
