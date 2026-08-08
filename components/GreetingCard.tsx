import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, X, Volume2, Download, Share2, Copy, Check, ArrowRight, ArrowLeft,
  Maximize2, Minimize2, Heart, Calendar, Image as ImageIcon, MessageSquare, Edit3, Send, Shield
} from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { addCenteredCardPage } from './pdfCardUtils';

interface GreetingCardProps {
  currentUser?: User | null;
  isAdmin?: boolean;
  onClose: () => void;
  onStartTour: () => void;
  initialMode?: 'welcome' | 'creator';
}

let audioCtx: any = null;

// --- AUDIO SYNTHESIZER: ROYAL TRUMPET FANFARE ---
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

    const notes = [
      { f: 261.63, t: 0.0, d: 0.25 }, // C4
      { f: 392.00, t: 0.28, d: 0.25 }, // G4
      { f: 523.25, t: 0.56, d: 0.35 }, // C5
      { f: 659.25, t: 0.95, d: 0.30 }, // E5
      { f: 783.99, t: 1.28, d: 0.35 }, // G5
      { f: 1046.50, t: 1.65, d: 0.85 }, // High C6 Flourish

      { f: 392.00, t: 3.0, d: 0.20 },
      { f: 523.25, t: 3.25, d: 0.20 },
      { f: 659.25, t: 3.50, d: 0.20 },
      { f: 783.99, t: 3.75, d: 0.80 },

      { f: 523.25, t: 6.0, d: 0.25 },
      { f: 659.25, t: 6.3, d: 0.25 },
      { f: 783.99, t: 6.6, d: 0.40 },
      { f: 1046.50, t: 7.05, d: 1.2 },
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

// --- STYLES & ANIMATIONS ---
const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Mukta+Malar:wght@400;600;700&display=swap');

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

  @keyframes floatEmber {
    0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
    20% { opacity: 0.6; }
    80% { opacity: 0.6; }
    100% { transform: translateY(-300px) translateX(var(--drift)) scale(0.5); opacity: 0; }
  }

  @keyframes penWrite {
    0% { transform: rotate(0deg) translate(0px, 0px); }
    25% { transform: rotate(-5deg) translate(-3px, -4px); }
    50% { transform: rotate(3deg) translate(4px, 2px); }
    75% { transform: rotate(-3deg) translate(1px, -3px); }
    100% { transform: rotate(0deg) translate(0px, 0px); }
  }
  .animate-pen { animation: penWrite 0.35s infinite cubic-bezier(0.4, 0, 0.2, 1); }

  .anim-royal-enter { animation: royalEnter 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; will-change: transform, opacity; }
  .anim-golden-erase { animation: goldenErase 0.65s cubic-bezier(0.4, 0, 1, 1) forwards; will-change: transform, opacity; }
  .hidden-state { opacity: 0; pointer-events: none; }
  .anim-backdrop-fadeout { animation: backdropFadeOut 0.65s cubic-bezier(0.4, 0, 1, 1) forwards; }

  /* Design Theme Frame Classes */
  .card-theme-golden {
    background: linear-gradient(135deg, #050b1a 0%, #010308 100%);
    border: 1px solid rgba(212, 175, 55, 0.4);
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85), inset 0 0 30px rgba(212, 175, 55, 0.15);
  }

  .card-theme-celestial {
    background: linear-gradient(135deg, #07152d 0%, #0369a1 50%, #0284c7 100%);
    border: 1px solid rgba(125, 211, 252, 0.5);
    box-shadow: 0 25px 60px rgba(7, 21, 45, 0.85), inset 0 0 30px rgba(56, 189, 248, 0.25);
  }

  .card-theme-crimson {
    background: linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #1c0505 100%);
    border: 1px solid rgba(253, 224, 71, 0.4);
    box-shadow: 0 25px 60px rgba(69, 10, 10, 0.9), inset 0 0 30px rgba(239, 68, 68, 0.2);
  }

  .card-theme-scroll {
    background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 60%, #fde68a 100%);
    border: 2px solid #b45309;
    box-shadow: 0 25px 60px rgba(180, 83, 9, 0.25), inset 0 0 30px rgba(217, 119, 6, 0.15);
  }

  .card-theme-emerald {
    background: linear-gradient(135deg, #064e3b 0%, #022c22 60%, #065f46 100%);
    border: 1px solid rgba(250, 204, 21, 0.5);
    box-shadow: 0 25px 60px rgba(6, 78, 59, 0.9), inset 0 0 30px rgba(52, 211, 153, 0.2);
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

// --- OCCASIONS PRESETS DATA ---
const OCCASIONS = [
  {
    id: 'shabbat',
    title: 'Shabbat Shalom',
    hebrewTitle: 'שַׁבָּת שָׁלוֹם',
    icon: '🕯️',
    desc: 'Sabbath Peace & Divine Blessing',
    defaultPhrase: 'May your home be filled with divine peace, joy, and rest this Shabbat.',
    scripture: 'The LORD bless you and keep you; the LORD make His face shine upon you and give you peace. — Numbers 6:24-26',
  },
  {
    id: 'festival',
    title: 'Festival / Feast Day',
    hebrewTitle: 'חַג שָׂמֵחַ',
    icon: '🍇',
    desc: 'Rosh Hashanah, Pesach, Sukkot, Hanukkah',
    defaultPhrase: 'Shanah Tovah U’Metukah! Wishing you a sweet, fruitful, and blessed feast season in God’s presence.',
    scripture: 'You shall rejoice in your festival, you and your son and daughter, and the stranger among you. — Deuteronomy 16:14',
  },
  {
    id: 'birthday',
    title: 'Birthday & Joy',
    hebrewTitle: 'יוֹם הוּלֶדֶת שָׂמֵחַ',
    icon: '🎂',
    desc: 'Life Celebration & Longevity Blessing',
    defaultPhrase: 'Happy Birthday! Celebrating God’s gracious hand upon your life today and always.',
    scripture: 'With long life I will satisfy him and show him My salvation. — Psalm 91:16',
  },
  {
    id: 'blessing',
    title: 'Divine Blessing',
    hebrewTitle: 'בִּרְכַּת שָׁלוֹם',
    icon: '✨',
    desc: 'Encouragement, Strength & Peace',
    defaultPhrase: 'May the peace of God which surpasses all understanding guard your heart and mind in Yeshua.',
    scripture: 'The LORD is my shepherd; I shall not want. He leads me beside still waters. — Psalm 23:1-2',
  },
  {
    id: 'gratitude',
    title: 'Fellowship & Gratitude',
    hebrewTitle: 'תּוֹדָה רַבָּה',
    icon: '🙏',
    desc: 'Ministry Thanksgiving & Friendship',
    defaultPhrase: 'Thanking God for your faithful heart, prayers, and dedicated fellowship in City of Truth Ministries.',
    scripture: 'I thank my God every time I remember you. In all my prayers for all of you, I always pray with joy. — Philippians 1:3-4',
  },
];

// --- DESIGN THEMES DATA ---
const DESIGN_THEMES = [
  {
    id: 'golden',
    name: 'Golden Temple',
    hebrewName: 'מִקְדָּשׁ זָהָב',
    class: 'card-theme-golden',
    bgPreview: 'from-slate-950 via-brand-950 to-slate-900',
    titleColor: 'text-amber-300',
    textColor: 'text-slate-100',
    accentColor: '#D4AF37',
  },
  {
    id: 'celestial',
    name: 'Jerusalem Celestial',
    hebrewName: 'יְרוּשָׁלַיִם שָׁמַיִם',
    class: 'card-theme-celestial',
    bgPreview: 'from-slate-900 via-sky-950 to-cyan-900',
    titleColor: 'text-cyan-200',
    textColor: 'text-slate-100',
    accentColor: '#38BDF8',
  },
  {
    id: 'crimson',
    name: 'Crimson Velvet',
    hebrewName: 'אַרְגָּמָן מַלְכוּת',
    class: 'card-theme-crimson',
    bgPreview: 'from-red-950 via-rose-900 to-amber-950',
    titleColor: 'text-amber-300',
    textColor: 'text-rose-100',
    accentColor: '#FDE047',
  },
  {
    id: 'scroll',
    name: 'Sacred Scroll',
    hebrewName: 'מְגִלָּה קְדוֹשָׁה',
    class: 'card-theme-scroll',
    bgPreview: 'from-amber-100 via-amber-50 to-amber-200',
    titleColor: 'text-amber-900',
    textColor: 'text-amber-950',
    accentColor: '#B45309',
  },
  {
    id: 'emerald',
    name: 'Emerald Hope',
    hebrewName: 'תִּקְוָה בָּרֶקֶת',
    class: 'card-theme-emerald',
    bgPreview: 'from-emerald-950 via-teal-900 to-slate-950',
    titleColor: 'text-emerald-300',
    textColor: 'text-emerald-50',
    accentColor: '#FACC15',
  },
];

export default function GreetingCard({ currentUser, isAdmin = false, onClose, onStartTour, initialMode = 'welcome' }: GreetingCardProps) {
  const [viewMode, setViewMode] = useState<'welcome' | 'creator'>(initialMode);
  
  // Wizard steps: 1: Occasion -> 2: Design -> 3: Message -> 4: Full Preview -> 5: Share
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Card Customization State
  const [selectedOccasion, setSelectedOccasion] = useState(OCCASIONS[0]);
  const [selectedTheme, setSelectedTheme] = useState(DESIGN_THEMES[0]);
  const [recipientName, setRecipientName] = useState('');
  const [messageText, setMessageText] = useState(OCCASIONS[0].defaultPhrase);
  const [scriptureText, setScriptureText] = useState(OCCASIONS[0].scripture);
  const [senderName, setSenderName] = useState(currentUser?.name || 'City of Truth Ministries Member');
  const [customHebrewTitle, setCustomHebrewTitle] = useState(OCCASIONS[0].hebrewTitle);

  // Full Screen Preview Mode
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Update occasion preset defaults when occasion changes
  const handleOccasionSelect = (occ: typeof OCCASIONS[0]) => {
    setSelectedOccasion(occ);
    setMessageText(occ.defaultPhrase);
    setScriptureText(occ.scripture);
    setCustomHebrewTitle(occ.hebrewTitle);
    setWizardStep(2);
  };

  const handleDownloadPNG = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, quality: 1 });
      const link = document.createElement('a');
      link.download = `COT-Greeting-Card-${selectedOccasion.id}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export greeting card PNG:', err);
      alert('Could not download image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, quality: 1 });
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      addCenteredCardPage(pdf, dataUrl, 'PNG', true);
      pdf.save(`COT-Greeting-Card-${selectedOccasion.id}-${Date.now()}.pdf`);
    } catch (err) {
      console.error('Failed to export greeting card PDF:', err);
      alert('Could not download PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleNativeShare = async () => {
    const textToShare = `${customHebrewTitle}\n\nDear ${recipientName || 'Beloved'},\n${messageText}\n\n"${scriptureText}"\n\nBlessings,\n${senderName}\n\nCity of Truth Ministries`;
    const shareUrl = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${selectedOccasion.title} — City of Truth Ministries`,
          text: textToShare,
          url: shareUrl,
        });
      } catch (e) {
        console.warn('Share cancelled', e);
      }
    } else {
      await navigator.clipboard.writeText(`${textToShare}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleWhatsAppShare = () => {
    const textToShare = encodeURIComponent(
      `✨ *${customHebrewTitle}* ✨\n\n*Dear ${recipientName || 'Beloved'},*\n${messageText}\n\n_${scriptureText}_\n\n*With Love & Blessings,*\n${senderName}\n\n📌 *City of Truth Ministries*\n${window.location.origin}`
    );
    window.open(`https://api.whatsapp.com/send?text=${textToShare}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto font-playfair select-none pointer-events-auto">
      <style>{customStyles}</style>

      {/* Top Header bar */}
      <div className="w-full max-w-5xl flex items-center justify-between py-2 px-4 mb-2 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold">
            🎁
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-cinzel font-bold text-white leading-none">
              Royal Greeting Cards
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Personalized Scriptural Blessing & Celebration Cards
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'welcome' ? (
            <button
              onClick={() => setViewMode('creator')}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-brand-950 font-black text-xs font-cinzel tracking-wider flex items-center gap-1.5 hover:scale-105 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Sparkles size={14} /> Create Card Studio
            </button>
          ) : (
            <button
              onClick={() => setViewMode('welcome')}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Welcome
            </button>
          )}

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
         MODE 1: WELCOME FANFARE CARD (Default View)
      ══════════════════════════════════════════════════════ */}
      {viewMode === 'welcome' && (
        <div className="relative max-w-[640px] w-full z-10 flex flex-col items-center py-4">
          <RoyalEmbers />

          {/* Postal Frame Card */}
          <div className="card-theme-golden postal-frame w-full max-w-[92vw] sm:max-w-[620px] px-4 sm:px-8 py-6 sm:py-10 flex flex-col justify-between min-h-[320px] rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="text-center space-y-4 relative z-10">
              <span className="text-xs font-black text-amber-400 tracking-[0.3em] uppercase block">
                City of Truth Ministries
              </span>
              <h1 className="font-cinzel text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-400 tracking-wider">
                בּוֹקֵר טוֹב · BOKER TOV
              </h1>
              <p className="italic text-slate-200 text-sm sm:text-base leading-relaxed max-w-lg mx-auto font-light">
                &quot;May your day be filled with peace, wisdom, strength, and abundant heavenly blessings.&quot;
              </p>
              <div className="pt-2">
                <span className="font-cinzel text-xl sm:text-3xl font-black text-amber-400 tracking-widest uppercase block">
                  {currentUser?.name || 'שלום (SHALOM)'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono tracking-wider mt-1 block">
                  COT ID: {currentUser?.id || 'MEMBER'} · {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Quick Actions at bottom */}
            <div className="mt-8 pt-4 border-t border-amber-400/20 flex flex-wrap items-center justify-between gap-3 relative z-10">
              <button
                onClick={playRoyalTrumpetSound}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Volume2 size={15} /> Play Trumpet Fanfare
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('creator')}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-brand-950 font-black text-xs rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 font-cinzel tracking-wider cursor-pointer"
                >
                  <Sparkles size={14} /> Design Your Card
                </button>
                <button
                  onClick={onStartTour}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Tour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
         MODE 2: 5-STEP GREETING CARD CREATOR & STUDIO
      ══════════════════════════════════════════════════════ */}
      {viewMode === 'creator' && (
        <div className="w-full max-w-5xl flex flex-col gap-6 relative z-10 pb-8">

          {/* Wizard Step Progress Indicator Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 backdrop-blur-xl shadow-xl">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-3 text-center">
              {[
                { step: 1, label: 'Occasion', icon: '🎁' },
                { step: 2, label: 'Design', icon: '🎨' },
                { step: 3, label: 'Message', icon: '✍️' },
                { step: 4, label: 'Preview', icon: '👁️' },
                { step: 5, label: 'Share', icon: '🚀' },
              ].map(s => {
                const isActive = wizardStep === s.step;
                const isCompleted = wizardStep > s.step;
                return (
                  <button
                    key={s.step}
                    onClick={() => setWizardStep(s.step as any)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 p-2 sm:p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-brand-950 font-black border-amber-300 shadow-md scale-[1.02]'
                        : isCompleted
                        ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                        : 'bg-slate-950/60 text-slate-500 border-slate-850 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span className="text-sm">{s.icon}</span>
                    <span className="hidden sm:inline font-bold uppercase tracking-wider text-[10px]">
                      {s.step}. {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 1: CHOOSE OCCASION */}
          {wizardStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-cinzel font-bold text-amber-300">
                  Step 1: Choose Occasion
                </h3>
                <p className="text-xs text-slate-400">
                  Select the type of celebration or blessing card you want to send
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {OCCASIONS.map(occ => {
                  const isSelected = selectedOccasion.id === occ.id;
                  return (
                    <motion.div
                      key={occ.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOccasionSelect(occ)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 relative overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 border-amber-400 shadow-xl shadow-amber-500/20'
                          : 'bg-slate-900/80 border-slate-800 hover:border-amber-400/50 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-3xl">{occ.icon}</span>
                        <span className="text-xs font-serif text-amber-400 font-bold" dir="rtl">
                          {occ.hebrewTitle}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{occ.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{occ.desc}</p>
                      </div>
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-amber-300 font-bold">
                        <span>Select Occasion</span>
                        <ArrowRight size={14} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: CHOOSE DESIGN THEME */}
          {wizardStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-cinzel font-bold text-amber-300">
                  Step 2: Choose Design Theme
                </h3>
                <p className="text-xs text-slate-400">
                  Select a stunning visual theme for your greeting card
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {DESIGN_THEMES.map(theme => {
                  const isSelected = selectedTheme.id === theme.id;
                  return (
                    <motion.div
                      key={theme.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedTheme(theme);
                        setWizardStep(3);
                      }}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-4 relative overflow-hidden ${
                        isSelected
                          ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-xl'
                          : 'border-slate-800 hover:border-amber-400/50'
                      }`}
                    >
                      <div className={`h-28 rounded-xl bg-gradient-to-br ${theme.bgPreview} p-3 flex flex-col justify-between border border-white/10`}>
                        <span className={`text-xs font-cinzel font-bold ${theme.titleColor}`} dir="rtl">
                          {theme.hebrewName}
                        </span>
                        <div className="text-center">
                          <span className={`text-sm font-bold ${theme.titleColor}`}>
                            {theme.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{theme.name}</span>
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          Apply Theme <ArrowRight size={12} />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CUSTOMIZE MESSAGE */}
          {wizardStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl"
            >
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-cinzel font-bold text-amber-300">
                  Step 3: Customize Message & Blessing
                </h3>
                <p className="text-xs text-slate-400">
                  Personalize the names, blessing text, and scriptural verse
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inputs Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-amber-300 uppercase tracking-widest block mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pastor Baruch & Family"
                      value={recipientName}
                      onChange={e => setRecipientName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-amber-400 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-amber-300 uppercase tracking-widest block mb-1">
                      Hebrew Title Phrase
                    </label>
                    <input
                      type="text"
                      value={customHebrewTitle}
                      onChange={e => setCustomHebrewTitle(e.target.value)}
                      dir="rtl"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-amber-300 outline-none focus:border-amber-400 text-lg font-serif text-right"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-amber-300 uppercase tracking-widest block mb-1">
                      Sender Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your Name / City of Truth Ministries Member"
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-amber-400 text-sm"
                    />
                  </div>
                </div>

                {/* Inputs Right Column (Message & Scripture) */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-amber-300 uppercase tracking-widest block mb-1">
                      Personal Message & Blessing
                    </label>
                    <textarea
                      rows={3}
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-400 text-sm leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-amber-300 uppercase tracking-widest block mb-1">
                      Scripture Verse / Quote
                    </label>
                    <textarea
                      rows={2}
                      value={scriptureText}
                      onChange={e => setScriptureText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-amber-200 outline-none focus:border-amber-400 text-xs italic leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <button
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  onClick={() => setWizardStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-brand-950 font-black text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-lg flex items-center gap-2 cursor-pointer font-cinzel"
                >
                  Full Card Preview <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: FULL-SCREEN CARD PREVIEW */}
          {(wizardStep === 4 || wizardStep === 5) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-cinzel font-bold text-amber-300">
                    {wizardStep === 4 ? 'Step 4: Full-Screen Card Preview' : 'Step 5: Share & Export Card'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Review your high-resolution card presentation below
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFullScreenPreview(!isFullScreenPreview)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    {isFullScreenPreview ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    {isFullScreenPreview ? 'Exit Fullscreen' : 'Fullscreen'}
                  </button>
                  <button
                    onClick={playRoyalTrumpetSound}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 size={14} /> Play Trumpet
                  </button>
                </div>
              </div>

              {/* CARD PREVIEW RENDER CONTAINER */}
              <div className="flex justify-center">
                <div
                  ref={cardRef}
                  className={`${selectedTheme.class} postal-frame w-full max-w-[92vw] sm:max-w-[620px] px-6 sm:px-10 py-8 sm:py-10 flex flex-col justify-between min-h-[340px] rounded-3xl relative overflow-hidden shadow-2xl`}
                >
                  <RoyalEmbers />

                  <div className="text-center space-y-4 relative z-10">
                    <span className="text-[10px] font-black text-amber-400 tracking-[0.3em] uppercase block">
                      City of Truth Ministries
                    </span>
                    <h2 className={`font-cinzel text-2xl sm:text-3xl font-black ${selectedTheme.titleColor}`} dir="rtl">
                      {customHebrewTitle}
                    </h2>

                    {recipientName && (
                      <div className="text-sm font-bold text-amber-200 tracking-wider">
                        Dear {recipientName},
                      </div>
                    )}

                    <p className={`italic text-xs sm:text-sm leading-relaxed max-w-lg mx-auto font-light ${selectedTheme.textColor}`}>
                      &quot;{messageText}&quot;
                    </p>

                    {scriptureText && (
                      <p className="text-[11px] text-amber-300/90 italic font-serif max-w-md mx-auto pt-1">
                        _{scriptureText}_
                      </p>
                    )}

                    <div className="pt-3 border-t border-white/10">
                      <span className="text-xs font-cinzel font-bold text-amber-300 tracking-wider block">
                        {senderName}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase block mt-0.5">
                        {new Date().toLocaleDateString()} · Official Ministry Card
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 5: SHARE & EXPORT CONTROLS */}
              {wizardStep === 4 && (
                <div className="flex justify-between items-center pt-4">
                  <button
                    onClick={() => setWizardStep(3)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-all flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} /> Edit Message
                  </button>
                  <button
                    onClick={() => setWizardStep(5)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-brand-950 font-black text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-lg flex items-center gap-2 cursor-pointer font-cinzel"
                  >
                    Proceed to Share & Download <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {wizardStep === 5 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl"
                >
                  <div className="text-center">
                    <h4 className="text-lg font-cinzel font-bold text-amber-300">
                      Export & Share Your Blessing Card
                    </h4>
                    <p className="text-xs text-slate-400">
                      Download high-resolution image/PDF or share directly via WhatsApp & social media
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      onClick={handleDownloadPNG}
                      disabled={isExporting}
                      className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl flex flex-col items-center gap-1.5 border border-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Download size={18} className="text-amber-400" />
                      <span>Download Image (PNG)</span>
                    </button>

                    <button
                      onClick={handleDownloadPDF}
                      disabled={isExporting}
                      className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl flex flex-col items-center gap-1.5 border border-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Download size={18} className="text-cyan-400" />
                      <span>Download PDF Card</span>
                    </button>

                    <button
                      onClick={handleWhatsAppShare}
                      className="p-3 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 rounded-2xl flex flex-col items-center gap-1.5 border border-emerald-800 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                    >
                      <Send size={18} className="text-emerald-400" />
                      <span>Share via WhatsApp</span>
                    </button>

                    <button
                      onClick={handleNativeShare}
                      className="p-3 bg-amber-950/80 hover:bg-amber-900 text-amber-200 rounded-2xl flex flex-col items-center gap-1.5 border border-amber-800 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                    >
                      {copied ? <Check size={18} className="text-green-400" /> : <Share2 size={18} className="text-amber-400" />}
                      <span>{copied ? 'Link Copied!' : 'Share / Copy Link'}</span>
                    </button>
                  </div>

                  <div className="flex justify-start pt-2">
                    <button
                      onClick={() => setWizardStep(4)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-all flex items-center gap-1.5"
                    >
                      <ArrowLeft size={14} /> Back to Preview
                    </button>
                  </div>
                </motion.div>
              )}

            </motion.div>
          )}

        </div>
      )}

    </div>
  );
}
