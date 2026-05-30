import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Layers, ArrowRight, BookType, MessageCircleQuestion, Calculator, Hexagon } from 'lucide-react';

const VOWEL_CHART = [
  { mark: 'ָ', name: 'Kamatz', sound: 'AH (Long)', example: 'אָב (Av)' },
  { mark: 'ַ', name: 'Patach', sound: 'AH (Short)', example: 'בַּיִת (Bayit)' },
  { mark: 'ֶ', name: 'Segol', sound: 'EH (Short)', example: 'מֶלֶךְ (Melekh)' },
  { mark: 'ְ', name: 'Shva', sound: 'EH or STOP', example: 'סְפָרִים (Sfarim)' },
  { mark: 'ִ', name: 'Chirik', sound: 'EE (Short)', example: 'עִיר (Ir)' },
  { mark: 'וֹ', name: 'Cholam', sound: 'OH (Long)', example: 'שָׁלוֹם (Shalom)' },
  { mark: 'וּ', name: 'Shuruk', sound: 'OO (Long)', example: 'סוּס (Sus)' },
  { mark: 'ֵ', name: 'Tsere', sound: 'AY (Long)', example: 'סֵפֶר (Sefer)' },
];

const BINYANIM_MENORAH = [
  { id: 4, name: "Hitpa'el", type: 'Reflexive', active: true, desc: "Reflexive/Reciprocal (e.g. He dressed himself)", ex: "הִתְלַבֵּשׁ (Hitlabash)" },
  { id: 1, name: "Pa'al", type: 'Active', active: true, desc: "Simple Active (e.g. He wore)", ex: "לָבַשׁ (Lavash)" },
  { id: 7, name: "Nif'al", type: 'Passive', active: false, desc: "Simple Passive (e.g. It was worn)", ex: "נִלְבַּשׁ (Nilbash)" },
  { id: 2, name: "Pi'el", type: 'Active', active: true, desc: "Intensive Active (e.g. He spoke)", ex: "דִּבֵּר (Diber)" },
  { id: 6, name: "Pu'al", type: 'Passive', active: false, desc: "Intensive Passive (e.g. It was spoken)", ex: "דֻּבַּר (Dubar)" },
  { id: 3, name: "Hif'il", type: 'Active', active: true, desc: "Causative Active (e.g. He dressed someone)", ex: "הִלְבִּישׁ (Hilbish)" },
  { id: 5, name: "Huf'al", type: 'Passive', active: false, desc: "Causative Passive (e.g. He was dressed)", ex: "הֻלְבַּשׁ (Hulbash)" },
];

const GRAMMAR_SECTIONS = [
  {
    title: "1. Foundation: Aleph-Bet & Nikkud",
    icon: <BookType className="text-amber-500" size={24} />,
    content: "Hebrew is written right-to-left with 22 consonants. Vowels (Nikkud) are marks above, below, or inside letters, used mostly by beginners.",
    interactive: 'vowels'
  },
  {
    title: "2. The Skeleton: Root System (Shoresh)",
    icon: <Hexagon className="text-blue-500" size={24} />,
    content: "Almost every word is built on a 3-consonant root. E.g., כ-ת-ב (K-T-V) means Writing. Kotev (Writes), Mikhtav (Letter), Katav (Reporter).",
    interactive: 'roots'
  },
  {
    title: "3. The Engines: Verb System (Binyanim)",
    icon: <Sparkles className="text-amber-500" size={24} />,
    content: "Verbs are structured into 7 'buildings' (Binyanim) that shift the root's meaning to active, passive, reflexive, or causative.",
    interactive: 'menorah'
  },
  {
    title: "4. Building Blocks: Nouns & Gender",
    icon: <Layers className="text-emerald-500" size={24} />,
    content: "Every noun is Masculine or Feminine. Adjectives must strictly match the noun in both gender and number.",
    interactive: 'gender'
  },
  {
    title: "5. Forming Questions",
    icon: <MessageCircleQuestion className="text-purple-500" size={24} />,
    content: "Question words come at the beginning: Mi (Who), Ma (What), Eifo (Where), Matay (When), Lama (Why), Eikh (How).",
    interactive: 'questions'
  },
  {
    title: "6. Numbers and Gender",
    icon: <Calculator className="text-rose-500" size={24} />,
    content: "Numbers have masculine and feminine forms to match the noun. Interestingly, masculine numbers 3-10 end in a feminine-sounding '-a' (ה).",
    interactive: 'numbers'
  }
];

const FlipCard = ({ front, back }: { front: React.ReactNode, back: React.ReactNode }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full h-48 relative" style={{ perspective: 1000 }}>
      <motion.div
        className="w-full h-full absolute transition-all duration-700 cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className="absolute w-full h-full backface-hidden bg-white border border-amber-100 rounded-3xl shadow-lg flex flex-col items-center justify-center p-6 text-center hover:border-amber-400 transition-colors"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {front}
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-4 absolute bottom-4">Click to Flip</p>
        </div>
        <div 
          className="absolute w-full h-full backface-hidden bg-gradient-to-br from-brand-900 to-slate-900 rounded-3xl shadow-xl flex flex-col items-center justify-center p-6 text-center border border-brand-700"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
};

export const HebrewGrammar3D: React.FC = () => {
  const [activeSection, setActiveSection] = useState(0);

  return (
    <div className="w-full bg-[#f8f9fa] rounded-[2rem] md:rounded-[3rem] p-4 md:p-12 overflow-hidden shadow-inner border border-slate-200">
      <div className="text-center mb-12 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-serif font-black text-brand-950 mb-4 tracking-tight drop-shadow-sm"
        >
          Hebrew Grammar Architecture
        </motion.h2>
        <p className="text-slate-500 font-medium tracking-wide">An interactive 3D exploration of the Holy Language.</p>
        <div className="h-1 w-24 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto mt-6 rounded-full" />
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
        
        {/* Left Side: Navigation / Sections */}
        <div className="lg:col-span-5 space-y-4">
          {GRAMMAR_SECTIONS.map((section, idx) => {
            const isActive = activeSection === idx;
            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSection(idx)}
                className={`w-full text-left p-6 rounded-2xl transition-all duration-300 border ${
                  isActive 
                    ? 'bg-white shadow-[0_20px_40px_rgba(0,0,0,0.08)] border-amber-200 ring-2 ring-amber-500/20' 
                    : 'bg-white/50 border-transparent hover:bg-white hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${isActive ? 'bg-amber-50 shadow-inner' : 'bg-slate-50'}`}>
                    {section.icon}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isActive ? 'text-brand-950' : 'text-slate-700'}`}>
                      {section.title}
                    </h3>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Right Side: 3D Interactive Display */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] relative min-h-[500px] flex flex-col justify-center perspective-[2000px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, rotateX: 20, z: -100, y: 30 }}
              animate={{ opacity: 1, rotateX: 0, z: 0, y: 0 }}
              exit={{ opacity: 0, rotateX: -20, z: -100, y: -30 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="w-full h-full"
            >
              <div className="text-center mb-8">
                <p className="text-slate-600 text-lg leading-relaxed font-serif">
                  {GRAMMAR_SECTIONS[activeSection].content}
                </p>
              </div>

              {/* Interactive Module based on Section */}
              <div className="mt-8">
                
                {/* Vowels Interactive */}
                {GRAMMAR_SECTIONS[activeSection].interactive === 'vowels' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {VOWEL_CHART.slice(0, 4).map((v, i) => (
                      <FlipCard 
                        key={i}
                        front={
                          <>
                            <div className="text-5xl font-serif text-brand-950 mb-2">{v.mark}</div>
                            <div className="font-bold text-slate-700">{v.name}</div>
                          </>
                        }
                        back={
                          <>
                            <div className="text-lg font-black text-amber-400 mb-2">{v.sound}</div>
                            <div className="text-sm text-slate-300 italic">{v.example}</div>
                          </>
                        }
                      />
                    ))}
                  </div>
                )}

                {/* Roots Interactive */}
                {GRAMMAR_SECTIONS[activeSection].interactive === 'roots' && (
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                      className="w-48 h-48 rounded-full border-4 border-dashed border-amber-300 flex items-center justify-center relative"
                    >
                      <div className="absolute text-5xl font-black text-brand-950" style={{ transform: "rotate(-360deg)" }}>
                        כ-ת-ב
                      </div>
                    </motion.div>
                    <div className="flex gap-4">
                      <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold border border-blue-200 shadow-sm">Kotev (Writes)</span>
                      <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-200 shadow-sm">Mikhtav (Letter)</span>
                      <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-bold border border-purple-200 shadow-sm">Katav (Reporter)</span>
                    </div>
                  </div>
                )}

                {/* Binyanim Menorah 3D */}
                {GRAMMAR_SECTIONS[activeSection].interactive === 'menorah' && (
                  <div className="flex justify-center items-end h-64 gap-2 md:gap-4 relative px-4">
                    <div className="absolute bottom-0 w-full h-4 bg-slate-900 rounded-t-xl" />
                    {BINYANIM_MENORAH.map((b, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: b.id === 4 ? '100%' : b.active ? '70%' : '50%', opacity: 1 }}
                        transition={{ delay: i * 0.1, type: "spring" }}
                        className={`w-12 md:w-16 rounded-t-lg relative group cursor-crosshair border-x border-t flex flex-col items-center justify-start pt-4 shadow-[0_0_15px_rgba(0,0,0,0.2)] ${
                          b.id === 4 ? 'bg-gradient-to-t from-brand-900 to-blue-600 border-blue-400 z-10 scale-110' : 
                          b.active ? 'bg-gradient-to-t from-slate-900 to-slate-800 border-slate-600' : 
                          'bg-gradient-to-t from-slate-200 to-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <div className="text-[10px] md:text-xs font-black rotate-[-90deg] whitespace-nowrap text-white mt-8">{b.name}</div>
                        
                        {/* Tooltip */}
                        <div className="absolute -top-20 bg-slate-900 text-white p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none z-50">
                          <p className="font-bold text-amber-400 mb-1">{b.type}</p>
                          <p className="text-xs text-slate-300">{b.ex}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Nouns & Gender */}
                {GRAMMAR_SECTIONS[activeSection].interactive === 'gender' && (
                  <div className="grid grid-cols-2 gap-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 text-center transform transition-transform hover:-translate-y-2 hover:shadow-xl">
                      <div className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4">Masculine (זָכָר)</div>
                      <div className="text-4xl font-serif text-brand-950 mb-2">יֶלֶד</div>
                      <div className="font-bold text-slate-700">Yeled (Boy)</div>
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <span className="text-xs text-slate-500 block mb-1">Plural (+im)</span>
                        <div className="text-xl font-bold text-brand-900">יְלָדִים (Yeladim)</div>
                      </div>
                    </div>
                    <div className="bg-pink-50 border border-pink-200 rounded-3xl p-6 text-center transform transition-transform hover:-translate-y-2 hover:shadow-xl">
                      <div className="text-xs font-black uppercase tracking-widest text-pink-500 mb-4">Feminine (נְקֵבָה)</div>
                      <div className="text-4xl font-serif text-brand-950 mb-2">יַלְדָּה</div>
                      <div className="font-bold text-slate-700">Yalda (Girl)</div>
                      <div className="mt-4 pt-4 border-t border-pink-200">
                        <span className="text-xs text-slate-500 block mb-1">Plural (+ot)</span>
                        <div className="text-xl font-bold text-brand-900">יְלָדוֹת (Yeladot)</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Questions */}
                {GRAMMAR_SECTIONS[activeSection].interactive === 'questions' && (
                  <div className="flex flex-wrap justify-center gap-4">
                    {[
                      { h: 'מִי', e: 'Who' }, { h: 'מָה', e: 'What' },
                      { h: 'אֵיפֹה', e: 'Where' }, { h: 'מָתַי', e: 'When' },
                      { h: 'לָמָּה', e: 'Why' }, { h: 'אֵיךְ', e: 'How' }
                    ].map((q, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ scale: 1.1, rotate: Math.random() * 10 - 5 }}
                        className="w-24 h-24 bg-purple-50 rounded-2xl border-2 border-purple-200 flex flex-col items-center justify-center shadow-md cursor-pointer hover:bg-purple-500 hover:text-white transition-colors group"
                      >
                        <div className="text-2xl font-black text-brand-950 group-hover:text-white mb-1">{q.h}</div>
                        <div className="text-xs font-bold text-purple-600 group-hover:text-purple-100 uppercase">{q.e}</div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Numbers */}
                {GRAMMAR_SECTIONS[activeSection].interactive === 'numbers' && (
                  <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl" />
                    <h4 className="text-xl font-bold mb-6 text-amber-400">The Number Three (3)</h4>
                    <div className="flex justify-between items-center bg-white/10 rounded-2xl p-4 mb-4 border border-white/20">
                      <div>
                        <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Masculine Nouns</div>
                        <div className="text-2xl font-serif">שְׁלוֹשָׁה יְלָדִים</div>
                        <div className="text-sm font-bold text-amber-200">Shlosha yeladim</div>
                      </div>
                      <div className="text-right text-xs bg-amber-500/20 px-3 py-1 rounded-full text-amber-300 font-black border border-amber-500/50">Ends in -a (ה)</div>
                    </div>
                    <div className="flex justify-between items-center bg-white/10 rounded-2xl p-4 border border-white/20">
                      <div>
                        <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Feminine Nouns</div>
                        <div className="text-2xl font-serif">שָׁלוֹשׁ יְלָדוֹת</div>
                        <div className="text-sm font-bold text-amber-200">Shalosh yeladot</div>
                      </div>
                      <div className="text-right text-xs bg-slate-500/20 px-3 py-1 rounded-full text-slate-300 font-black border border-slate-500/50">No ending</div>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
