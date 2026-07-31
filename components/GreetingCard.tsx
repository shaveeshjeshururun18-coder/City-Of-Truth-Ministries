import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { User } from '../types';

interface GreetingCardProps {
  currentUser?: User | null;
  isAdmin?: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

let audioCtx: any = null;

// --- AUDIO SYNTHESIZER DISABLED AS PER USER REQUEST (MP3 EXCLUSIVE) ---
const playPreciousChime = () => {
  // Silent to ensure Bowfur and First speech .mp3 alone is played
};

// --- STYLES & ANIMATIONS ---
const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Playfair+Display:ital,wght=0,400;0,600;1,400&display=swap');

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

// --- ULTRA-ATTRACTIVE MAGIC PEN ---
const MagicPen = () => (
  <div className="absolute bottom-[-6px] left-[50%] z-[9999] pointer-events-none transform origin-bottom-left animate-pen w-24 h-24 md:w-32 md:h-32 overflow-visible">
    {/* Blinding Radiant Ink Sparks */}
    <div className="absolute bottom-0 left-0 w-[18px] h-[18px] bg-white rounded-full blur-[4px] shadow-[0_0_20px_6px_#38bdf8,0_0_50px_12px_#d4af37] mix-blend-screen animate-pulse"></div>
    <div className="absolute bottom-[3px] left-[3px] w-[6px] h-[6px] bg-[#fde047] rounded-full blur-[1px]"></div>

    {/* Majestic, Highly Detailed Pen Artifact */}
    <svg className="absolute bottom-0 left-0 w-full h-full origin-bottom-left -translate-y-[3px] -translate-x-[3px] filter drop-shadow-[6px_12px_15px_rgba(0,0,0,0.8)] overflow-visible" viewBox="-10 -10 120 120" fill="none">
      {/* Intricate Gold Nib */}
      <path d="M0 100 L 15 75 L 25 85 Z" fill="url(#pureGold)" />
      <path d="M5 95 L 15 75 L 20 80 Z" fill="rgba(0,0,0,0.4)" />
      <line x1="0" y1="100" x2="16" y2="84" stroke="#290f01" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="84" r="2" fill="#290f01" />
      <path d="M8 90 C 12 85, 18 85, 20 90" stroke="#78350F" strokeWidth="1" fill="none" />
      <path d="M10 85 C 14 80, 20 80, 22 85" stroke="#78350F" strokeWidth="1" fill="none" />

      {/* Deep Obsidian Grip */}
      <path d="M15 75 L 25 85 L 32 72 L 22 62 Z" fill="#030712" />
      <line x1="17" y1="73" x2="24" y2="60" stroke="#374151" strokeWidth="1.2" />
      <line x1="20" y1="76" x2="27" y2="63" stroke="#374151" strokeWidth="1.2" />
      <line x1="23" y1="79" x2="30" y2="66" stroke="#374151" strokeWidth="1.2" />

      {/* Royal Gold Multi-Bands */}
      <path d="M22 62 L 32 72 L 34 68 L 24 58 Z" fill="url(#pureGold)" />
      <path d="M25 56 L 35 66 L 38 60 L 28 50 Z" fill="url(#pureGold)" />
      <path d="M24 58 L 34 68 L 35 66 L 25 56 Z" fill="#000000" />

      {/* Glowing Sapphire Barrel with Sensual Curves */}
      <path d="M28 50 L 38 60 C 60 40, 80 20, 85 10 C 80 5, 60 20, 28 50 Z" fill="url(#royalSapphire)" />
      <path d="M32 50 C 50 35, 70 15, 80 8 C 75 8, 55 25, 34 52 Z" fill="rgba(255,255,255,0.4)" />

      {/* Elaborate Gold Filigree Overlay */}
      <path d="M32 45 Q 40 45, 45 35 T 55 25" stroke="url(#pureGold)" strokeWidth="1.5" fill="none" />
      <path d="M42 55 Q 50 55, 55 45 T 65 35" stroke="url(#pureGold)" strokeWidth="1.5" fill="none" />
      <path d="M52 38 Q 48 30, 60 25" stroke="url(#pureGold)" strokeWidth="1.5" fill="none" />

      {/* Crown Cap & Giant Crystal Diamond */}
      <path d="M85 10 L 80 5 L 85 0 L 92 8 Z" fill="url(#pureGold)" />
      <path d="M85 0 L 92 8 L 97 3 L 89 -5 Z" fill="url(#diamond)" />
      <circle cx="92" cy="2" r="7" fill="#38bdf8" filter="blur(4px)" opacity="0.9" />
      <circle cx="92" cy="2" r="2.5" fill="#FFF" />

      <defs>
         <linearGradient id="pureGold" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#451A03"/><stop offset="25%" stopColor="#D4AF37"/><stop offset="50%" stopColor="#FEF08A"/><stop offset="75%" stopColor="#D4AF37"/><stop offset="100%" stopColor="#92400E"/>
         </linearGradient>
         <linearGradient id="royalSapphire" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#020617"/><stop offset="35%" stopColor="#1E3A8A"/><stop offset="65%" stopColor="#0EA5E9"/><stop offset="100%" stopColor="#020617"/>
         </linearGradient>
         <linearGradient id="diamond" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#7DD3FC"/><stop offset="50%" stopColor="#FFFFFF"/><stop offset="100%" stopColor="#38BDF8"/>
         </linearGradient>
      </defs>
    </svg>
  </div>
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
  const shownText = safeText.slice(0, Math.min(Math.max(visibleCount, 0), safeText.length));
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
      {isTyping && shownText.length > 0 && <MagicPen />}
    </div>
  );
};

import { api } from '../services/api';

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
  const [hasInteracted, setHasInteracted] = useState(false);
  const [greetingSettings, setGreetingSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await api.getWebsiteGreetingSettings();
        setGreetingSettings(settings);

        const hour = new Date().getHours();
        let slotKey: 'morning' | 'noon' | 'evening' | 'night' = 'night';
        if (hour >= 5 && hour < 12) slotKey = 'morning';
        else if (hour >= 12 && hour < 17) slotKey = 'noon';
        else if (hour >= 17 && hour < 21) slotKey = 'evening';

        const slot = settings.slots?.[slotKey];

        // 1. Master enable/disable
        if (!settings.enabled) {
          onClose();
          return;
        }

        // 2. Slot enable/disable
        if (slot && !slot.enabled) {
          onClose();
          return;
        }

        // 3. Target group audience filtering
        const target = settings.targetGroup || 'all';
        if (target === 'active') {
          if (!currentUser || currentUser.status !== 'Active') {
            onClose();
            return;
          }
        } else if (target === 'pending') {
          if (!currentUser || currentUser.status !== 'Pending Verification') {
            onClose();
            return;
          }
        } else if (target === 'admin') {
          const isUserAdmin = isAdmin || currentUser?.role === 'Admin';
          if (!isUserAdmin) {
            onClose();
            return;
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to load greeting settings", err);
        setLoading(false);
      }
    };
    loadSettings();
  }, [currentUser, isAdmin, onClose]);

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

  // Names and labels calculated dynamically
  const nameStr = useMemo(() => {
    if (isAdmin) return "Admin";
    if (currentUser) return currentUser.name || "שלום (SHALOM)";
    return "שלום (SHALOM)"; // Guest replace shaveesh jeshurun with Shalom
  }, [currentUser, isAdmin]);

  const footerLStr = useMemo(() => {
    if (isAdmin || currentUser) return "שלום (SHALOM)";
    return ""; // Guest: remove another Shalom
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
      // Play chime audio first
      const chime = new Audio('/greeting_sound.mp3');
      chime.volume = 0.5;
      chime.play().catch(() => {});

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

  // Autoplay immediately on load
  useEffect(() => {
    if (!hasInteracted) {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      
      playVoiceFallback(currentData.greeting);
      setHasInteracted(true);
    }
  }, [hasInteracted, currentData]);

  // Animation Sequence
  useEffect(() => {
    if (!hasInteracted) return;
    let isActive = true;

    const runSequence = async () => {
      setCounts({ greeting: 0, phrase: 0, name: 0, footerL: 0, footerR: 0 });
      setActiveSection(null);
      await sleep(1000);
      if (!isActive) return;

      setPhase('writing');
      
      const typeSection = async (sectionName: 'greeting' | 'phrase' | 'name' | 'footerL' | 'footerR', text: string) => {
        if (!text) return;
        setActiveSection(sectionName);
        for (let i = 1; i <= text.length; i++) {
          if (!isActive) return;
          setCounts(prev => ({ ...prev, [sectionName]: i }));
          
          if (text[i - 1] !== ' ') playPreciousChime(); 
          
          const delay = text[i - 1] === ' ' ? 20 : (40 + Math.random() * 50);
          await sleep(delay);
        }
        await sleep(350); 
      };

      await typeSection('greeting', currentData.greeting);
      await typeSection('phrase', currentData.phrase);

      const shalomAudio = document.getElementById("voiceShalomAudio") as HTMLAudioElement;
      if (shalomAudio) {
        shalomAudio.volume = 0.9;
        shalomAudio.play().catch(e => console.log("Shalom audio blocked", e));
      }

      await typeSection('name', nameStr);
      if (footerLStr) await typeSection('footerL', footerLStr);
      if (footerRStr) await typeSection('footerR', footerRStr);

      setActiveSection(null);
      if (!isActive) return;

      setPhase('idle');
    };

    runSequence();
    return () => { isActive = false; };
  }, [hasInteracted, currentData, nameStr, footerLStr, footerRStr]);

  const handleClose = async () => {
    setPhase('erase');
    if (audioRef.current) {
      // Fade out audio gracefully
      const interval = setInterval(() => {
        if (audioRef.current && audioRef.current.volume > 0.05) {
          audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.08);
        } else {
          clearInterval(interval);
          if (audioRef.current) audioRef.current.pause();
        }
      }, 80);
    }
    await sleep(650);
    setPhase('hidden');
    await sleep(50);
    onClose();
  };

  const handleTakeTour = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPhase('hidden');
    onClose();
    onStartTour();
  };

  // Disappear after 3 seconds of typing completion (idle phase)
  useEffect(() => {
    if (phase === 'idle') {
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);
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
          
          {/* Subtle background embers in card itself */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg z-0 opacity-40">
            <RoyalEmbers />
          </div>

          <div className="flex-1 flex flex-col justify-center items-center w-full z-10 overflow-visible">
            
            <div className="min-h-10 sm:min-h-12 flex items-center justify-center w-full mb-2 overflow-visible px-2">
              <CinematicText 
                text={currentData.greeting} 
                type="icy-blue" 
                visibleCount={counts.greeting}
                isTyping={activeSection === 'greeting'}
                className="font-cinzel text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-wider sm:tracking-widest text-center max-w-full"
              />
            </div>

            <div className="relative mb-3 sm:mb-5 px-2 sm:px-4 py-2 max-w-full sm:max-w-lg w-full text-center overflow-visible">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/45 to-transparent"></div>
              
              <CinematicText 
                text={currentData.phrase} 
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
