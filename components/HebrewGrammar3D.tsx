import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Layers,
  BookType,
  MessageCircleQuestion,
  Calculator,
  Hexagon,
  Download,
  Loader2,
  ChevronRight,
  Flame,
  Volume2
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { PeelingStackCards, PeelingCardItem } from './ui/peeling-stack-cards';

const VOWEL_CHART = [
  { mark: 'ָ', name: 'Kamatz', sound: 'AH (Long)', example: 'אָב (Av - Father)' },
  { mark: 'ַ', name: 'Patach', sound: 'AH (Short)', example: 'בַּיִת (Bayit - House)' },
  { mark: 'ֶ', name: 'Segol', sound: 'EH (Short)', example: 'מֶלֶךְ (Melekh - King)' },
  { mark: 'ְ', name: 'Shva', sound: 'EH or STOP', example: 'סְפָרִים (Sfarim - Books)' },
  { mark: 'ִ', name: 'Chirik', sound: 'EE (Short)', example: 'עִיר (Ir - City)' },
  { mark: 'וֹ', name: 'Cholam', sound: 'OH (Long)', example: 'שָׁלוֹם (Shalom - Peace)' },
  { mark: 'וּ', name: 'Shuruk', sound: 'OO (Long)', example: 'סוּס (Sus - Horse)' },
  { mark: 'ֵ', name: 'Tsere', sound: 'AY (Long)', example: 'סֵפֶר (Sefer - Book)' },
];

const BINYANIM_MENORAH = [
  { id: 1, name: "Pa'al", type: 'Active', active: true, desc: "Simple Active Stem", ex: "לָבַשׁ (Lavash - Wore)", formula: "Base 3-letter root" },
  { id: 2, name: "Pi'el", type: 'Active', active: true, desc: "Intensive Active Stem", ex: "דִּבֵּר (Diber - Spoke)", formula: "Dagesh doubling in 2nd radical" },
  { id: 3, name: "Hif'il", type: 'Active', active: true, desc: "Causative Active Stem", ex: "הִלְבִּישׁ (Hilbish - Dressed someone)", formula: "Prefix ה (He) + י (Yod)" },
  { id: 4, name: "Hitpa'el", type: 'Reflexive', active: true, desc: "Reflexive / Reciprocal", ex: "הִתְלַבֵּשׁ (Hitlabash - Dressed oneself)", formula: "Prefix הִת (Hit-)" },
  { id: 5, name: "Huf'al", type: 'Passive', active: false, desc: "Causative Passive Stem", ex: "הֻלְבַּשׁ (Hulbash - Was made to wear)", formula: "Prefix הֻ (Hu-) passive of Hif'il" },
  { id: 6, name: "Pu'al", type: 'Passive', active: false, desc: "Intensive Passive Stem", ex: "דֻּבַּר (Dubar - Was spoken)", formula: "Kubutz vowel in 1st radical" },
  { id: 7, name: "Nif'al", type: 'Passive', active: false, desc: "Simple Passive / Reciprocal", ex: "נִלְבַּשׁ (Nilbash - Was worn)", formula: "Prefix נ (Nun) passive of Pa'al" },
];

const QUESTION_WORDS = [
  { h: 'מִי', e: 'Who', phon: 'Mi', eg: 'מִי אַתָּה?', egTr: 'Mi atah? (Who are you?)' },
  { h: 'מָה', e: 'What', phon: 'Ma', eg: 'מָה שְׁמֶךָ?', egTr: 'Ma shimkha? (What is your name?)' },
  { h: 'אֵיפֹה', e: 'Where', phon: 'Eifo', eg: 'אֵיפֹה בֵּיתְךָ?', egTr: 'Eifo beitkha? (Where is your house?)' },
  { h: 'מָתַי', e: 'When', phon: 'Matay', eg: 'מָתַי תָּבוֹא?', egTr: 'Matay tavo? (When will you come?)' },
  { h: 'לָמָּה', e: 'Why', phon: 'Lama', eg: 'לָמָּה תִירָא?', egTr: 'Lama tira? (Why do you fear?)' },
  { h: 'אֵיךְ', e: 'How', phon: 'Eikh', eg: 'אֵיךְ זֶה יִהְיֶה?', egTr: 'Eikh zeh yihyeh? (How shall this be?)' }
];

const FlipCard: React.FC<{ front: React.ReactNode, back: React.ReactNode }> = ({ front, back }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full h-44 sm:h-48 relative select-none" style={{ perspective: 1000 }}>
      <motion.div
        className="w-full h-full absolute transition-all duration-700 cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className="absolute w-full h-full backface-hidden bg-slate-900/80 border border-amber-500/20 rounded-2xl sm:rounded-3xl shadow-lg flex flex-col items-center justify-center p-4 text-center hover:border-amber-400/50 hover:bg-slate-900 transition-all backdrop-blur-sm"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {front}
          <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-amber-400/70 font-black mt-2 absolute bottom-2.5">
            Click to Flip
          </p>
        </div>
        <div
          className="absolute w-full h-full backface-hidden bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col items-center justify-center p-4 text-center border border-amber-400/50 text-white"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
};

export const HebrewGrammar3D: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedBinyan, setSelectedBinyan] = useState<number>(4); // Hitpa'el selected by default
  const [selectedQuestion, setSelectedQuestion] = useState<number>(0);

  const handleDownloadPDF = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      const el = exportRef.current;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      const dataUrl = await toJpeg(el, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#0c0d14',
        cacheBust: true,
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(); });

      const ratio = img.height / img.width;
      const imgW = pdfW;
      const imgH = imgW * ratio;
      let heightLeft = imgH;
      let yPos = 0;
      pdf.addImage(dataUrl, 'JPEG', 0, yPos, imgW, imgH);
      heightLeft -= pdfH;
      while (heightLeft > 0) {
        yPos -= pdfH;
        pdf.addPage();
        pdf.addImage(dataUrl, 'JPEG', 0, yPos, imgW, imgH);
        heightLeft -= pdfH;
      }
      pdf.save('COT-Hebrew-Grammar-Architecture.pdf');
    } catch (e) {
      console.error(e);
      alert('PDF export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const currentBinyanData = BINYANIM_MENORAH.find(b => b.id === selectedBinyan) || BINYANIM_MENORAH[0];

  // Build the 6 interactive stacking cards for Hebrew Grammar Architecture
  const grammarCards: PeelingCardItem[] = [
    // CARD 1: Vowels & Nikkud
    {
      id: 'grammar-vowels',
      stageBadge: 'STAGE 01 • SCRIPT FOUNDATION',
      badgeIcon: <BookType className="text-amber-400" size={12} />,
      title: '1. Foundation: Aleph to Tav & Nikkud',
      tamilTitle: 'அடிப்படை: ஆலேப் முதல் தாவ் வரை & நிக்குட் (உயிரெழுத்து குறிகள்)',
      subtitle: 'Hebrew is written right-to-left with 22 sacred consonants. Vowels (Nikkud) are divine markings placed above, below, or inside letters to guide sacred pronunciation.',
      themeGradient: 'from-amber-950/95 via-yellow-950/90 to-[#0c0d14]',
      borderColor: 'border-amber-500/30',
      content: (
        <div className="mt-4 w-full">
          <p className="text-xs sm:text-sm text-amber-200/80 mb-4 leading-relaxed font-medium">
            Click any vowel tile below to flip and discover its phonetic sound, name, and biblical example word:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {VOWEL_CHART.map((v, i) => (
              <FlipCard
                key={i}
                front={
                  <>
                    <div className="text-4xl sm:text-5xl font-serif text-amber-300 font-bold mb-2 drop-shadow-md">
                      {v.mark}
                    </div>
                    <div className="font-bold text-white text-sm sm:text-base tracking-wide">
                      {v.name}
                    </div>
                    <span className="text-[11px] text-amber-400/80 font-mono mt-0.5">
                      {v.sound.split(' ')[0]}
                    </span>
                  </>
                }
                back={
                  <>
                    <div className="text-xs uppercase tracking-widest text-amber-200 font-bold mb-1">
                      Phonetic Sound
                    </div>
                    <div className="text-base sm:text-lg font-black text-white mb-2">
                      {v.sound}
                    </div>
                    <div className="text-xs text-amber-100 font-serif leading-tight">
                      {v.example}
                    </div>
                  </>
                }
              />
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs flex items-center justify-between">
            <span>💡 <strong>Biblical Tip:</strong> Modern Israeli texts omit Nikkud; native readers infer vowels through 3-letter roots.</span>
          </div>
        </div>
      )
    },

    // CARD 2: Root System (Shoresh)
    {
      id: 'grammar-roots',
      stageBadge: 'STAGE 02 • TRILITERAL ROOTS',
      badgeIcon: <Hexagon className="text-blue-400" size={12} />,
      title: '2. The Skeleton: Root System (Shoresh)',
      tamilTitle: 'எலும்புக்கூடு: 3 எழுத்து வேர் முறைமை (ஷோரேஷ்)',
      subtitle: 'Almost every Hebrew word is built from an immutable 3-consonant divine root (Shoresh). By changing vowels and prefixes, an entire tree of meaning blossoms from one root.',
      themeGradient: 'from-indigo-950/95 via-blue-950/90 to-[#060a14]',
      borderColor: 'border-blue-500/30',
      content: (
        <div className="mt-4 w-full flex flex-col md:flex-row items-center gap-6 lg:gap-10">
          {/* Rotating Root Visual */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-[3px] border-dashed border-cyan-400/50 flex items-center justify-center relative shadow-[0_0_35px_rgba(6,182,212,0.25)] bg-cyan-950/30 backdrop-blur-md"
            >
              <div
                className="absolute text-3xl sm:text-4xl font-black text-cyan-200 font-serif tracking-wider"
                style={{ transform: "rotate(-360deg)" }}
              >
                כ-ת-ב
              </div>
            </motion.div>
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-black mt-3">
              ROOT: K-T-V (Writing)
            </span>
          </div>

          {/* Word Family Branches */}
          <div className="flex-1 w-full">
            <h4 className="text-sm sm:text-base font-bold text-cyan-200 mb-2">
              Words sprouted from root כ-ת-ב (To Write):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {[
                { h: 'כּוֹתֵב', tr: 'Kotev', en: 'Writes (Active Present)', desc: 'Present masculine action' },
                { h: 'מִכְתָּב', tr: 'Mikhtav', en: 'A Letter (Noun)', desc: 'Written document / message' },
                { h: 'כַּתָּב', tr: 'Katav', en: 'Journalist / Reporter', desc: 'One who writes professionally' },
                { h: 'כְּתוּבִים', tr: 'Ketuvim', en: 'The Writings (Biblical)', desc: 'Third section of Tanakh' },
                { h: 'מִכְתָּבָה', tr: 'Miktavah', en: 'Writing Desk (Place)', desc: 'Physical station for writing' },
                { h: 'כְּתֹבֶת', tr: 'Ktovet', en: 'Address / Inscription', desc: 'Location written on letter' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 sm:p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 hover:border-cyan-400/50 hover:bg-blue-900/30 transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-white">{item.tr}</span>
                    <p className="text-[10px] text-cyan-300/80">{item.en}</p>
                  </div>
                  <span className="font-serif text-lg font-bold text-cyan-300">{item.h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },

    // CARD 3: Verb Stems (Binyanim Menorah)
    {
      id: 'grammar-binyanim',
      stageBadge: 'STAGE 03 • 7 VERBAL STEMS',
      badgeIcon: <Sparkles className="text-amber-400" size={12} />,
      title: '3. The Seven Engines: Verb Binyanim',
      tamilTitle: 'ஏழு இயந்திரங்கள்: வினைக் கட்டடங்கள் (பின்யானிம்)',
      subtitle: 'Hebrew verbs branch into 7 divine "buildings" (Binyanim) arranged like the Golden Menorah. They modulate the root into active, passive, causative, and reflexive forms.',
      themeGradient: 'from-amber-950/95 via-orange-950/90 to-[#0d0703]',
      borderColor: 'border-amber-400/40',
      content: (
        <div className="mt-4 w-full">
          <p className="text-xs sm:text-sm text-amber-200/80 mb-3 font-medium">
            Tap on any menorah branch to inspect its stem function, voice, and live biblical root demonstration:
          </p>

          {/* Menorah 3D Branches */}
          <div className="flex justify-center items-end h-56 sm:h-64 gap-2 sm:gap-4 relative px-2 pt-6 pb-3 my-3">
            <div className="absolute bottom-0 inset-x-0 h-4 bg-slate-900 rounded-xl border-t border-amber-500/40 shadow-xl" />
            {BINYANIM_MENORAH.map((b) => {
              const isSelected = selectedBinyan === b.id;
              const isCenter = b.id === 4;

              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBinyan(b.id)}
                  style={{
                    height: isCenter ? '95%' : b.active ? '75%' : '58%'
                  }}
                  className={`w-10 sm:w-16 md:w-20 rounded-t-xl relative cursor-pointer border-t-2 border-x transition-all duration-300 flex flex-col items-center justify-between pb-2 outline-none group ${
                    isSelected
                      ? 'bg-gradient-to-t from-amber-600 via-orange-500 to-yellow-400 border-yellow-200 shadow-[0_0_25px_rgba(245,158,11,0.5)] z-20 scale-105'
                      : isCenter
                      ? 'bg-gradient-to-t from-amber-900 to-amber-700 border-amber-400/80 hover:scale-102 z-10'
                      : b.active
                      ? 'bg-gradient-to-t from-slate-900 to-slate-800 border-slate-600 hover:border-amber-400/60'
                      : 'bg-gradient-to-t from-slate-900/60 to-slate-800/60 border-slate-700/60 hover:border-amber-400/40 opacity-80'
                  }`}
                >
                  {/* Flame on top */}
                  <Flame
                    size={14}
                    className={`transition-transform duration-200 ${
                      isSelected
                        ? 'text-yellow-200 animate-pulse scale-125'
                        : 'text-amber-400 group-hover:scale-110'
                    }`}
                  />

                  {/* Vertical Label */}
                  <div
                    className={`text-[10px] sm:text-xs font-black rotate-[-90deg] whitespace-nowrap tracking-wider ${
                      isSelected ? 'text-slate-950 font-extrabold' : 'text-white'
                    }`}
                  >
                    {b.name}
                  </div>

                  {/* Active/Passive indicator */}
                  <span
                    className={`text-[8px] sm:text-[9px] font-bold uppercase rounded px-1 ${
                      isSelected
                        ? 'bg-slate-950 text-amber-300'
                        : b.active
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {b.type[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Binyan Details Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base sm:text-lg font-black text-amber-300 font-serif">
                  {currentBinyanData.name}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {currentBinyanData.type} Voice
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {currentBinyanData.desc} • <span className="text-amber-400">{currentBinyanData.formula}</span>
              </p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl text-right shrink-0 border border-white/10">
              <span className="text-[10px] text-amber-300 font-mono block uppercase">Example</span>
              <span className="text-xs sm:text-sm font-bold text-white">{currentBinyanData.ex}</span>
            </div>
          </div>
        </div>
      )
    },

    // CARD 4: Nouns & Gender
    {
      id: 'grammar-gender',
      stageBadge: 'STAGE 04 • GENDER & NUMBER',
      badgeIcon: <Layers className="text-emerald-400" size={12} />,
      title: '4. Building Blocks: Nouns & Gender',
      tamilTitle: 'கட்டமைப்பு கற்கள்: பெயர்ச்சொற்கள் மற்றும் பால் (ஆண்பால் / பெண்பால்)',
      subtitle: 'Every Hebrew noun is intrinsically Masculine (זָכָר) or Feminine (נְקֵבָה). All adjectives, numbers, and verbs must strictly harmonize with the gender and count of the noun.',
      themeGradient: 'from-emerald-950/95 via-teal-950/90 to-[#040f0c]',
      borderColor: 'border-emerald-500/30',
      content: (
        <div className="mt-4 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Masculine Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-blue-950/60 to-slate-900/80 border border-blue-400/30 shadow-lg">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-400/20">
              <span className="text-xs font-black uppercase tracking-widest text-blue-400">
                Masculine (זָכָר • Zakhar)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold">
                Plural Suffix: -im (ים)
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-950/40 border border-blue-500/20">
                <div>
                  <span className="text-xs text-slate-400 block">Singular</span>
                  <span className="text-sm font-bold text-white">Yeled (Boy)</span>
                </div>
                <span className="text-2xl font-serif text-blue-300 font-bold">יֶלֶד</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-900/30 border border-blue-400/30">
                <div>
                  <span className="text-xs text-blue-300 block">Plural (+im)</span>
                  <span className="text-sm font-bold text-white">Yeladim (Boys)</span>
                </div>
                <span className="text-2xl font-serif text-blue-200 font-bold">יְלָדִים</span>
              </div>
            </div>
            <p className="text-[11px] text-blue-200/70 mt-3 italic leading-relaxed">
              Default form has no suffix. Plural adds ים- (eem). E.g., סוּס (Horse) → סוּסִים (Horses).
            </p>
          </div>

          {/* Feminine Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-pink-950/60 to-slate-900/80 border border-pink-400/30 shadow-lg">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-pink-400/20">
              <span className="text-xs font-black uppercase tracking-widest text-pink-400">
                Feminine (נְקֵבָה • Nekeivah)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono font-bold">
                Plural Suffix: -ot (ות)
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-pink-950/40 border border-pink-500/20">
                <div>
                  <span className="text-xs text-slate-400 block">Singular (ends in ָה or ת)</span>
                  <span className="text-sm font-bold text-white">Yalda (Girl)</span>
                </div>
                <span className="text-2xl font-serif text-pink-300 font-bold">יַלְדָּה</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-pink-900/30 border border-pink-400/30">
                <div>
                  <span className="text-xs text-pink-300 block">Plural (+ot)</span>
                  <span className="text-sm font-bold text-white">Yeladot (Girls)</span>
                </div>
                <span className="text-2xl font-serif text-pink-200 font-bold">יְלָדוֹת</span>
              </div>
            </div>
            <p className="text-[11px] text-pink-200/70 mt-3 italic leading-relaxed">
              Singular ends in ָה (-ah) or ת (-et/-it). Plural replaces it with וֹת- (-ot). E.g., סוּסָה → סוּסוֹת.
            </p>
          </div>
        </div>
      )
    },

    // CARD 5: Forming Questions
    {
      id: 'grammar-questions',
      stageBadge: 'STAGE 05 • INTERROGATIVE CLAUSES',
      badgeIcon: <MessageCircleQuestion className="text-purple-400" size={12} />,
      title: '5. The Interrogatives: Question Words',
      tamilTitle: 'வினாச் சொற்கள்: எபிரேயத்தில் கேள்விகள் உருவாக்குதல்',
      subtitle: 'Hebrew interrogatives are placed right at the beginning of clauses. Unravel the 6 fundamental question words of the Holy Scriptures.',
      themeGradient: 'from-purple-950/95 via-fuchsia-950/90 to-[#0d0414]',
      borderColor: 'border-purple-500/30',
      content: (
        <div className="mt-4 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3 mb-4">
            {QUESTION_WORDS.map((q, idx) => {
              const isSelected = selectedQuestion === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedQuestion(idx)}
                  className={`p-3 rounded-2xl border transition-all text-center cursor-pointer outline-none ${
                    isSelected
                      ? 'bg-purple-600 border-purple-300 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-105'
                      : 'bg-purple-950/40 border-purple-500/20 text-purple-200 hover:bg-purple-900/40 hover:border-purple-400/50'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl font-serif font-bold block mb-1">
                    {q.h}
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider block">
                    {q.e}
                  </span>
                  <span className="text-[10px] text-purple-300/80 font-mono">
                    {q.phon}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Question Example */}
          <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-400/30 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase text-purple-300 tracking-widest block mb-0.5">
                Selected Interrogative Pattern
              </span>
              <p className="text-base sm:text-lg font-bold text-white">
                {QUESTION_WORDS[selectedQuestion].h} ({QUESTION_WORDS[selectedQuestion].phon}) = {QUESTION_WORDS[selectedQuestion].e}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-900/50 border border-purple-400/40 text-center sm:text-right">
              <span className="text-xl font-serif font-bold text-amber-300 block">
                {QUESTION_WORDS[selectedQuestion].eg}
              </span>
              <span className="text-xs text-purple-200 font-medium">
                {QUESTION_WORDS[selectedQuestion].egTr}
              </span>
            </div>
          </div>
        </div>
      )
    },

    // CARD 6: Numbers & Gender Concordance
    {
      id: 'grammar-numbers',
      stageBadge: 'STAGE 06 • NUMERICAL AGREEMENT',
      badgeIcon: <Calculator className="text-rose-400" size={12} />,
      title: '6. Divine Concordance: Numbers & Gender',
      tamilTitle: 'எண்களும் பாலும்: எண்களின் விசித்திரமான எதிர் பாலின உடன்பாடு',
      subtitle: 'Biblical Hebrew features a fascinating inverted concord: Numbers 3 to 10 take a feminine-sounding ending (-ah) when counting masculine nouns, and no suffix when counting feminine nouns!',
      themeGradient: 'from-rose-950/95 via-red-950/90 to-[#120306]',
      borderColor: 'border-rose-500/30',
      content: (
        <div className="mt-4 w-full space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Masculine Nouns Rule */}
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-rose-300">
                  Counting Masculine Nouns
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 font-mono font-bold">
                  Number ends in -a (ה)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-rose-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Three Boys</span>
                  <span className="text-sm font-bold text-rose-200">Shlosha yeladim</span>
                </div>
                <span className="text-2xl font-serif text-white font-bold">שְׁלוֹשָׁה יְלָדִים</span>
              </div>
              <p className="text-[11px] text-rose-200/80 mt-2 italic">
                Notice: The number <strong>שְׁלוֹשָׁה</strong> takes the feminine suffix ָה!
              </p>
            </div>

            {/* Feminine Nouns Rule */}
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-rose-300">
                  Counting Feminine Nouns
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 font-mono font-bold">
                  Number has NO ending
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-rose-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Three Girls</span>
                  <span className="text-sm font-bold text-rose-200">Shalosh yeladot</span>
                </div>
                <span className="text-2xl font-serif text-white font-bold">שָׁלוֹשׁ יְלָדוֹת</span>
              </div>
              <p className="text-[11px] text-rose-200/80 mt-2 italic">
                Notice: The number <strong>שָׁלוֹשׁ</strong> has no suffix when counting girls!
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-200">
            <span>✨ <strong>Chiastic Agreement:</strong> This inversion (Chiasmus) in numbers 3-10 is a signature hallmark of classical biblical Hebrew literature.</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="w-full bg-[#0c0d14] text-white rounded-[2rem] md:rounded-[3rem] p-3 sm:p-6 md:p-10 shadow-2xl border border-amber-500/20 relative">
      <div ref={exportRef}>
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest mb-2">
              <Sparkles size={12} className="text-amber-400 animate-pulse" />
              <span>Interactive Holy Language Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-white tracking-tight">
              Hebrew Grammar Architecture
            </h2>
            <p className="text-base sm:text-lg font-bold text-amber-400 mt-0.5">
              எபிரேய இலக்கண கட்டமைப்பு
            </p>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer border-none outline-none"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span>Download Reference PDF</span>
          </button>
        </div>

        {/* Interactive Stacking Cards */}
        <PeelingStackCards
          badgeLabel="Hebrew Grammar Stacks"
          title="Hebrew Grammar Architecture"
          tamilTitle="எபிரேய இலக்கண கட்டமைப்பு"
          subtitle="Scroll down to explore the interactive stacking cards covering consonants, nikkud, roots, binyanim patterns, and suffixes."
          items={grammarCards}
        />
      </div>
    </div>
  );
};

export default HebrewGrammar3D;
