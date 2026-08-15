import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, X, Volume2, Download, Share2, Copy, Check, ArrowRight, ArrowLeft,
  Maximize2, Minimize2, Heart, Calendar, Image as ImageIcon, MessageSquare, Edit3, Send, Shield, FileText,
  Flame, HandHeart, Eye, Palette, Sun, Moon
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
  allowStudio?: boolean;
}

let welcomeAudio: HTMLAudioElement | null = null;

// --- HIGH-QUALITY MP3 WELCOME SOUND PLAYER ---
export const playWelcomeSound = () => {
  try {
    if (!welcomeAudio) {
      welcomeAudio = new Audio('/Bowfur and First speech .mp3');
    }
    welcomeAudio.currentTime = 0;
    welcomeAudio.play().catch(e => console.warn("Audio autoplay blocked by browser:", e));
  } catch (e) {
    console.error("Audio playback error:", e);
  }
};

export const stopWelcomeSound = () => {
  if (welcomeAudio) {
    welcomeAudio.pause();
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
    iconKey: 'shabbat',
    desc: 'Sabbath Peace & Divine Blessing',
    defaultPhrase: 'May your home be filled with divine peace, joy, and rest this Shabbat.',
    scripture: 'The LORD bless you and keep you; the LORD make His face shine upon you and give you peace. — Numbers 6:24-26',
  },
  {
    id: 'festival',
    title: 'Festival / Feast Day',
    hebrewTitle: 'חַג שָׂמֵחַ',
    iconKey: 'festival',
    desc: 'Rosh Hashanah, Pesach, Sukkot, Hanukkah',
    defaultPhrase: 'Shanah Tovah U’Metukah! Wishing you a sweet, fruitful, and blessed feast season in God’s presence.',
    scripture: 'You shall rejoice in your festival, you and your son and daughter, and the stranger among you. — Deuteronomy 16:14',
  },
  {
    id: 'birthday',
    title: 'Birthday & Joy',
    hebrewTitle: 'יוֹם הוּלֶדֶת שָׂמֵחַ',
    iconKey: 'birthday',
    desc: 'Life Celebration & Longevity Blessing',
    defaultPhrase: 'Happy Birthday! Celebrating God’s gracious hand upon your life today and always.',
    scripture: 'With long life I will satisfy him and show him My salvation. — Psalm 91:16',
  },
  {
    id: 'blessing',
    title: 'Divine Blessing',
    hebrewTitle: 'בִּרְכַּת שָׁלוֹם',
    iconKey: 'blessing',
    desc: 'Encouragement, Strength & Peace',
    defaultPhrase: 'May the peace of God which surpasses all understanding guard your heart and mind in Yeshua.',
    scripture: 'The LORD is my shepherd; I shall not want. He leads me beside still waters. — Psalm 23:1-2',
  },
  {
    id: 'gratitude',
    title: 'Fellowship & Gratitude',
    hebrewTitle: 'תּוֹדָה רַבָּה',
    iconKey: 'gratitude',
    desc: 'Ministry Thanksgiving & Friendship',
    defaultPhrase: 'Thanking God for your faithful heart, prayers, and dedicated fellowship in City of Truth Ministries.',
    scripture: 'I thank my God every time I remember you. In all my prayers for all of you, I always pray with joy. — Philippians 1:3-4',
  },
];

const OccasionIcon = ({ iconKey }: { iconKey: string }) => {
  switch (iconKey) {
    case 'shabbat':
      return <Flame className="w-6 h-6 text-amber-400" />;
    case 'festival':
      return <Sparkles className="w-6 h-6 text-amber-300" />;
    case 'birthday':
      return <Heart className="w-6 h-6 text-rose-400" />;
    case 'blessing':
      return <Shield className="w-6 h-6 text-cyan-400" />;
    case 'gratitude':
      return <HandHeart className="w-6 h-6 text-emerald-400" />;
    default:
      return <Sparkles className="w-6 h-6 text-amber-400" />;
  }
};

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

// --- TIME-BASED GREETING ---
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) return {
    hebrew: 'בּוֹקֵר טוֹב',
    transliteration: 'BOKER TOV',
    english: 'Good Morning',
    blessing: '"May your morning be filled with His mercies that are new every morning, great is His faithfulness."',
    scripture: '— Lamentations 3:23',
    emoji: '🌅',
  };
  if (hour >= 12 && hour < 17) return {
    hebrew: 'צָהֳרַיִם טוֹבִים',
    transliteration: 'TZOHARAIM TOVIM',
    english: 'Good Afternoon',
    blessing: '"The LORD bless you and keep you; the LORD make His face shine upon you and give you peace."',
    scripture: '— Numbers 6:24-26',
    emoji: '☀️',
  };
  if (hour >= 17 && hour < 21) return {
    hebrew: 'עֶרֶב טוֹב',
    transliteration: 'EREV TOV',
    english: 'Good Evening',
    blessing: '"Come to me, all you who are weary and burdened, and I will give you rest."',
    scripture: '— Matthew 11:28',
    emoji: '🌇',
  };
  return {
    hebrew: 'לַיְלָה טוֹב',
    transliteration: 'LAILA TOV',
    english: 'Good Night',
    blessing: '"He grants sleep to those He loves. May you rest in the shadow of the Almighty."',
    scripture: '— Psalm 127:2 & 91:1',
    emoji: '🌙',
  };
};

// --- PEN WRITING ANIMATION COMPONENT ---
const PenWritingText = ({ text, className }: { text: string, className?: string }) => {
  return (
    <div className={`relative inline-block ${className || ''}`}>
      <motion.div
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        animate={{ clipPath: 'inset(0 0% 0 0)' }}
        transition={{ duration: 3, ease: 'linear', delay: 0.5 }}
        className="inline-block relative"
      >
        {text}
        <motion.div
          initial={{ left: '0%', opacity: 1 }}
          animate={{ left: '100%', opacity: 0 }}
          transition={{
            left: { duration: 3, ease: 'linear', delay: 0.5 },
            opacity: { delay: 3.5, duration: 0.2 }
          }}
          className="absolute top-0 -translate-y-1/2 -ml-1 text-amber-400"
          style={{ fontSize: '1.2em' }}
        >
          <i className="bi bi-pen"></i>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default function GreetingCard({ currentUser, isAdmin = false, onClose, onStartTour, initialMode = 'welcome', allowStudio = true }: GreetingCardProps) {
  const [viewMode, setViewMode] = useState<'welcome' | 'creator'>(initialMode);
  const timeGreeting = getTimeGreeting();

  // Play welcome greeting automatically on mount & auto-disappear
  useEffect(() => {
    if (viewMode === 'welcome') {
      playWelcomeSound();
      const autoCloseTimer = setTimeout(() => {
        onClose();
      }, 7500); // Auto-disappear after 7.5 seconds
      return () => {
        clearTimeout(autoCloseTimer);
        stopWelcomeSound();
      };
    }
  }, [viewMode, onClose]);
  
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
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 4, quality: 1, cacheBust: true });
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
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 4, quality: 1, cacheBust: true });
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: false, precision: 16 });
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
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, quality: 1, cacheBust: true });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `COT-Greeting-Card-${Date.now()}.png`, { type: 'image/png' });

      const textToShare = `${customHebrewTitle}\n\nDear ${recipientName || 'Beloved'},\n${messageText}\n\n"${scriptureText}"\n\nBlessings,\n${senderName}\n\nCity of Truth Ministries`;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${selectedOccasion.title} — City of Truth Ministries`,
          text: `Blessings from ${senderName}`,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: `${selectedOccasion.title} — City of Truth Ministries`,
          text: textToShare,
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(`${textToShare}\n${window.location.origin}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (e) {
      console.warn('Share cancelled or unavailable:', e);
    } finally {
      setIsExporting(false);
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

      {/* Fixed Top Right Close X Button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 sm:top-6 sm:right-8 z-[999999] p-2.5 rounded-full bg-red-600/90 hover:bg-red-600 text-white border-2 border-white/50 shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
        title="Close Studio"
        aria-label="Close"
      >
        <X size={20} className="stroke-[3]" />
      </button>

      {/* Top Header bar */}
      <div className="w-full max-w-5xl flex items-center justify-end py-2 px-4 mb-2 z-50 pr-12 sm:pr-16">
        {viewMode === 'creator' && (
          <button
            onClick={() => setViewMode('welcome')}
            className="px-4 py-2 rounded-full bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <ArrowLeft size={14} /> Back to Welcome
          </button>
        )}
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
              <span className="text-xs font-black text-amber-400 tracking-[0.3em] uppercase block flex items-center justify-center gap-2">
                <span>{timeGreeting.emoji}</span>
                City of Truth Ministries
                <span>{timeGreeting.emoji}</span>
              </span>
              <h1 className="font-cinzel text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-400 tracking-wider">
                {timeGreeting.hebrew} · {timeGreeting.transliteration}
              </h1>
              <p className="text-amber-300 font-bold text-sm tracking-widest uppercase">
                {timeGreeting.english}
              </p>
              <p className="italic text-slate-200 text-sm sm:text-base leading-relaxed max-w-lg mx-auto font-light">
                <PenWritingText text={timeGreeting.blessing} />
              </p>
              <p className="text-amber-400/70 text-xs tracking-wider">{timeGreeting.scripture}</p>
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
                onClick={playWelcomeSound}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Volume2 size={15} /> Play Welcome Message
              </button>

              <div className="flex items-center gap-2">
                {allowStudio && (
                  <button
                    onClick={() => setViewMode('creator')}
                    className="px-3.5 py-2 bg-white text-brand-950 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Edit3 size={14} /> Design Your Card
                  </button>
                )}
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
                { step: 1, label: 'Occasion', IconComponent: Calendar },
                { step: 2, label: 'Design', IconComponent: Palette },
                { step: 3, label: 'Message', IconComponent: Edit3 },
                { step: 4, label: 'Preview', IconComponent: Eye },
                { step: 5, label: 'Share', IconComponent: Share2 },
              ].map(s => {
                const isActive = wizardStep === s.step;
                const isCompleted = wizardStep > s.step;
                const Icon = s.IconComponent;
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
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-950' : isCompleted ? 'text-amber-300' : 'text-slate-400'}`} />
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
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 relative overflow-hidden group ${
                        isSelected
                          ? 'bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 border-amber-400 shadow-xl shadow-amber-500/20'
                          : 'bg-slate-900/80 border-slate-800 hover:border-amber-400/50 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-brand-950 to-slate-950 border border-amber-400/40 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <OccasionIcon iconKey={occ.iconKey} />
                        </div>
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

                    <div className={`italic text-xs sm:text-sm leading-relaxed max-w-lg mx-auto font-light ${selectedTheme.textColor}`}>
                      &quot;<PenWritingText text={messageText} />&quot;
                    </div>

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
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[10px] font-mono uppercase tracking-widest mb-1">
                      <span>✨ 4K Ultra High-Res Export Active</span>
                    </div>
                    <h4 className="text-lg font-cinzel font-bold text-amber-300">
                      Export &amp; Share Blessing Card
                    </h4>
                    <p className="text-xs text-slate-400">
                      Download 4K print-ready PNG/PDF or share the card directly to apps
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      onClick={handleDownloadPNG}
                      disabled={isExporting}
                      className="p-3.5 bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white rounded-2xl flex flex-col items-center gap-2 border border-amber-400/30 text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-md group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Download size={18} className="text-amber-400" />
                      </div>
                      <span className="text-[11px]">Download 4K PNG</span>
                    </button>

                    <button
                      onClick={handleDownloadPDF}
                      disabled={isExporting}
                      className="p-3.5 bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white rounded-2xl flex flex-col items-center gap-2 border border-cyan-400/30 text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-md group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText size={18} className="text-cyan-400" />
                      </div>
                      <span className="text-[11px]">Download PDF Card</span>
                    </button>

                    <button
                      onClick={handleWhatsAppShare}
                      className="p-3.5 bg-gradient-to-b from-emerald-950 to-slate-900 hover:from-emerald-900 hover:to-slate-800 text-emerald-200 rounded-2xl flex flex-col items-center gap-2 border border-emerald-500/40 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Send size={18} className="text-emerald-400" />
                      </div>
                      <span className="text-[11px]">WhatsApp Share</span>
                    </button>

                    <button
                      onClick={handleNativeShare}
                      disabled={isExporting}
                      className="p-3.5 bg-gradient-to-b from-amber-950 to-slate-900 hover:from-amber-900 hover:to-slate-800 text-amber-200 rounded-2xl flex flex-col items-center gap-2 border border-amber-500/40 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {isExporting ? (
                          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <img src="/assets/doodles/doodle-color-259-share-square-arrow-hover-pointing.gif" alt="Share" className="w-6 h-6 object-contain" />
                        )}
                      </div>
                      <span className="text-[11px]">{copied ? 'Link Copied!' : 'Share Image Card'}</span>
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
