import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedTeacherCharacter } from './AnimatedTeacherCharacter';
import { audioService } from '../services/audioService';

export const GlobalAnimatedCharacter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeakGreeting = async () => {
    setIsSpeaking(true);
    try {
      await audioService.playTamil("ஷாலோம்! எபிரேய மற்றும் தமிழ் வேத சத்தியங்களை கற்க உங்களை வரவேற்கிறோம்.", 0.85);
    } catch (e) {
      console.warn("Speech playback error:", e);
    } finally {
      setTimeout(() => setIsSpeaking(false), 3500);
    }
  };

  return (
    <>
      {/* Floating Animated Character Trigger Badge */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setIsOpen(true);
            handleSpeakGreeting();
          }}
          className="fixed bottom-6 left-6 z-[99998] flex items-center gap-3 bg-gradient-to-r from-slate-900/90 via-amber-950/80 to-slate-950/95 border border-amber-500/40 px-4 py-2.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.2)] backdrop-blur-xl cursor-pointer group"
          role="button"
          tabIndex={0}
          title="Open Interactive Animated Teacher"
        >
          {/* Miniature Character Avatar */}
          <div className="relative w-10 h-10 flex-shrink-0">
            <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-sm animate-pulse" />
            <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-md relative z-10">
              <ellipse cx="60" cy="50" rx="24" ry="26" fill="#fed7aa" stroke="#f97316" strokeWidth="2" />
              <circle cx="49" cy="45" r="4" fill="#0f172a" />
              <circle cx="71" cy="45" r="4" fill="#0f172a" />
              <line x1="45" y1="38" x2="53" y2="38" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
              <line x1="67" y1="38" x2="75" y2="38" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
              <path d="M 52 65 Q 60 72, 68 65" stroke="#991b1b" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="60" cy="30" r="30" fill="none" stroke="#F59E0B" strokeWidth="3" opacity="0.8" />
            </svg>
          </div>

          {/* Text Badge */}
          <div className="flex flex-col text-left pr-1">
            <span className="text-2xs font-black uppercase tracking-widest text-[#FDE047] font-cinzel">
              Animated Teacher
            </span>
            <span className="text-[11px] font-bold text-slate-200 font-tamil">
              ஆசிரியர் வழிகாட்டி 🗣️
            </span>
          </div>
        </motion.div>
      )}

      {/* Expanded Animated Teacher Panel */}
      <AnimatePresence>
        {isOpen && (
          <AnimatedTeacherCharacter
            letterName="Shalom Teacher"
            hebrewLetter="שָׁלוֹם"
            tamilText="ஷாலோம்! எபிரேய தமிழ் கற்றல் மையம் — உங்களை வரவேற்கிறது."
            englishText="Welcome to the Interactive Hebrew & Tamil Learning Center"
            tamilSyllables={['ஷா', 'லோ', 'ம்']}
            isPlaying={isSpeaking}
            onPlayTamil={handleSpeakGreeting}
            onPlayHebrew={() => audioService.playHebrew('Shalom')}
            onClose={() => setIsOpen(false)}
            inline={false}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalAnimatedCharacter;
