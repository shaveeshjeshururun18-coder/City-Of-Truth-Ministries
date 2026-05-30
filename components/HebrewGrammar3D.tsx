import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Layers, BookType, MessageCircleQuestion, Calculator, Hexagon } from 'lucide-react';

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

const ALEPH_BET = [
  { letter: 'א', name: 'Aleph' },
  { letter: 'ב', name: 'Bet' },
  { letter: 'ג', name: 'Gimel' },
  { letter: 'ד', name: 'Dalet' },
  { letter: 'ה', name: 'Hey' },
  { letter: 'ו', name: 'Vav' },
  { letter: 'ז', name: 'Zayin' },
  { letter: 'ח', name: 'Chet' },
  { letter: 'ט', name: 'Tet' },
  { letter: 'י', name: 'Yod' },
  { letter: 'כ', name: 'Kaf', final: 'ך' },
  { letter: 'ל', name: 'Lamed' },
  { letter: 'מ', name: 'Mem', final: 'ם' },
  { letter: 'נ', name: 'Nun', final: 'ן' },
  { letter: 'ס', name: 'Samech' },
  { letter: 'ע', name: 'Ayin' },
  { letter: 'פ', name: 'Pey', final: 'ף' },
  { letter: 'צ', name: 'Tsadi', final: 'ץ' },
  { letter: 'ק', name: 'Kuf' },
  { letter: 'ר', name: 'Resh' },
  { letter: 'ש', name: 'Shin' },
  { letter: 'ת', name: 'Tav' },
];

const BINYANIM_MENORAH = [
  { id: 4, name: "Hitpa'el", type: 'Reflexive', active: true, desc: "Reflexive/Reciprocal", ex: "הִתְלַבֵּשׁ (Hitlabash)" },
  { id: 1, name: "Pa'al", type: 'Active', active: true, desc: "Simple Active", ex: "לָבַשׁ (Lavash)" },
  { id: 7, name: "Nif'al", type: 'Passive', active: false, desc: "Simple Passive", ex: "נִלְבַּשׁ (Nilbash)" },
  { id: 2, name: "Pi'el", type: 'Active', active: true, desc: "Intensive Active", ex: "דִּבֵּר (Diber)" },
  { id: 6, name: "Pu'al", type: 'Passive', active: false, desc: "Intensive Passive", ex: "דֻּבַּר (Dubar)" },
  { id: 3, name: "Hif'il", type: 'Active', active: true, desc: "Causative Active", ex: "הִלְבִּישׁ (Hilbish)" },
  { id: 5, name: "Huf'al", type: 'Passive', active: false, desc: "Causative Passive", ex: "הֻלְבַּשׁ (Hulbash)" },
];

const GRAMMAR_SECTIONS = [
  {
    title: "1. Foundation: Aleph-Bet & Nikkud",
    icon: <BookType className="text-amber-500" size={32} />,
    content: "Hebrew is written right-to-left with 22 consonants. Vowels (Nikkud) are marks above, below, or inside letters, used mostly by beginners.",
    interactive: 'vowels'
  },
  {
    title: "2. The Skeleton: Root System (Shoresh)",
    icon: <Hexagon className="text-blue-500" size={32} />,
    content: "Almost every word is built on a 3-consonant root. E.g., כ-ת-ב (K-T-V) means Writing. Kotev (Writes), Mikhtav (Letter), Katav (Reporter).",
    interactive: 'roots'
  },
  {
    title: "3. The Engines: Verb System (Binyanim)",
    icon: <Sparkles className="text-amber-500" size={32} />,
    content: "Verbs are structured into 7 'buildings' (Binyanim) that shift the root's meaning to active, passive, reflexive, or causative.",
    interactive: 'menorah'
  },
  {
    title: "4. Building Blocks: Nouns & Gender",
    icon: <Layers className="text-emerald-500" size={32} />,
    content: "Every noun is Masculine or Feminine. Adjectives must strictly match the noun in both gender and number.",
    interactive: 'gender'
  },
  {
    title: "5. Forming Questions",
    icon: <MessageCircleQuestion className="text-purple-500" size={32} />,
    content: "Question words come at the beginning: Mi (Who), Ma (What), Eifo (Where), Matay (When), Lama (Why), Eikh (How).",
    interactive: 'questions'
  },
  {
    title: "6. Numbers and Gender",
    icon: <Calculator className="text-rose-500" size={32} />,
    content: "Numbers have masculine and feminine forms to match the noun. Interestingly, masculine numbers 3-10 end in a feminine-sounding '-a' (ה).",
    interactive: 'numbers'
  }
];

const FlipCard: React.FC<{ front: React.ReactNode, back: React.ReactNode }> = ({ front, back }) => {
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
  return (
    <div className="w-full bg-[#f8f9fa] rounded-[2rem] md:rounded-[3rem] p-4 md:p-12 overflow-hidden shadow-inner border border-slate-200">
      
      {/* Header */}
      <div className="text-center mb-16 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-serif font-black text-brand-950 mb-6 tracking-tight drop-shadow-sm"
        >
          Hebrew Grammar Architecture
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-500 font-medium tracking-wide max-w-2xl mx-auto"
        >
          An interactive 3D exploration of the Holy Language. Scroll down to discover the foundations from top to bottom.
        </motion.p>
        <div className="h-1.5 w-32 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto mt-8 rounded-full" />
      </div>

      {/* Scrolling Sections */}
      <div className="max-w-5xl mx-auto space-y-24">
        {GRAMMAR_SECTIONS.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 80, rotateX: 10 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 80, damping: 15, duration: 0.8 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] relative"
          >
            
            {/* Section Header */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-10 text-center md:text-left">
              <motion.div 
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="p-5 bg-amber-50 rounded-2xl shadow-inner border border-amber-100"
              >
                {section.icon}
              </motion.div>
              <div>
                <h3 className="font-serif font-black text-3xl text-brand-950 mb-3">{section.title}</h3>
                <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
                  {section.content}
                </p>
              </div>
            </div>

            {/* Interactive Content */}
            <div className="mt-8 perspective-[2000px]">
              
              {/* Vowels and Aleph-Bet Interactive */}
              {section.interactive === 'vowels' && (
                <div className="space-y-12">
                  <div>
                    <h4 className="text-xl font-bold text-amber-500 mb-6 flex items-center gap-2">
                      <BookType size={20} /> The 22 Consonants (Aleph-Bet)
                    </h4>
                    <div className="flex flex-wrap gap-4 justify-end" dir="rtl">
                      {ALEPH_BET.map((a, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          viewport={{ once: true }}
                          whileHover={{ y: -5, scale: 1.1 }}
                          className="w-16 h-16 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center shadow-sm cursor-crosshair group hover:border-amber-400 hover:shadow-md transition-all relative"
                        >
                          <div className="text-3xl font-serif text-brand-950">{a.letter}</div>
                          {a.final && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-xs font-serif text-slate-500 shadow-sm">
                              {a.final}
                            </div>
                          )}
                          
                          {/* Tooltip */}
                          <div className="absolute -top-10 bg-slate-900 text-white px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none text-xs font-bold tracking-widest uppercase">
                            {a.name}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <h4 className="text-xl font-bold text-amber-500 mb-6 flex items-center gap-2">
                      <Sparkles size={20} /> The Vowels (Nikkud)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {VOWEL_CHART.slice(0, 4).map((v, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <FlipCard 
                            front={
                              <>
                                <div className="text-6xl font-serif text-brand-950 mb-4">{v.mark}</div>
                                <div className="font-bold text-slate-700 text-lg">{v.name}</div>
                              </>
                            }
                            back={
                              <>
                                <div className="text-xl font-black text-amber-400 mb-3">{v.sound}</div>
                                <div className="text-md text-slate-300 italic">{v.example}</div>
                              </>
                            }
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Roots Interactive */}
              {section.interactive === 'roots' && (
                <div className="flex flex-col items-center justify-center space-y-12 py-8">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="w-56 h-56 rounded-full border-[6px] border-dashed border-amber-300 flex items-center justify-center relative shadow-xl"
                  >
                    <div className="absolute text-6xl font-black text-brand-950" style={{ transform: "rotate(-360deg)" }}>
                      כ-ת-ב
                    </div>
                  </motion.div>
                  <div className="flex flex-wrap justify-center gap-6">
                    <motion.span whileHover={{ y: -5 }} className="px-6 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold border-2 border-blue-200 shadow-md text-lg">Kotev (Writes)</motion.span>
                    <motion.span whileHover={{ y: -5 }} className="px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold border-2 border-emerald-200 shadow-md text-lg">Mikhtav (Letter)</motion.span>
                    <motion.span whileHover={{ y: -5 }} className="px-6 py-3 bg-purple-50 text-purple-700 rounded-xl font-bold border-2 border-purple-200 shadow-md text-lg">Katav (Reporter)</motion.span>
                  </div>
                </div>
              )}

              {/* Binyanim Menorah 3D */}
              {section.interactive === 'menorah' && (
                <div className="flex justify-center items-end h-80 gap-3 md:gap-6 relative px-4 mt-12 pb-4">
                  <div className="absolute bottom-0 w-full h-6 bg-slate-900 rounded-2xl shadow-2xl" />
                  {BINYANIM_MENORAH.map((b, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0, opacity: 0 }}
                      whileInView={{ height: b.id === 4 ? '100%' : b.active ? '70%' : '50%', opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, type: "spring", stiffness: 60 }}
                      className={`w-14 md:w-20 rounded-t-xl relative group cursor-crosshair border-x-2 border-t-2 flex flex-col items-center justify-start pt-6 shadow-[0_0_25px_rgba(0,0,0,0.15)] ${
                        b.id === 4 ? 'bg-gradient-to-t from-brand-900 to-blue-600 border-blue-400 z-10 scale-[1.15]' : 
                        b.active ? 'bg-gradient-to-t from-slate-900 to-slate-800 border-slate-600' : 
                        'bg-gradient-to-t from-slate-200 to-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <div className="text-xs md:text-sm font-black rotate-[-90deg] whitespace-nowrap text-white mt-10 tracking-widest">{b.name}</div>
                      
                      {/* Tooltip */}
                      <div className="absolute -top-24 bg-slate-900 text-white p-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl pointer-events-none z-50">
                        <p className="font-bold text-amber-400 mb-2 text-sm">{b.type}</p>
                        <p className="text-sm text-slate-300 font-medium">{b.desc}</p>
                        <p className="text-xs text-slate-500 mt-1">{b.ex}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Nouns & Gender */}
              {section.interactive === 'gender' && (
                <div className="grid md:grid-cols-2 gap-10">
                  <motion.div 
                    whileHover={{ scale: 1.03 }}
                    className="bg-gradient-to-b from-blue-50 to-white border-2 border-blue-200 rounded-[2rem] p-8 text-center shadow-lg"
                  >
                    <div className="text-sm font-black uppercase tracking-[0.2em] text-blue-500 mb-6">Masculine (זָכָר)</div>
                    <div className="text-5xl font-serif text-brand-950 mb-3">יֶלֶד</div>
                    <div className="font-bold text-slate-700 text-xl">Yeled (Boy)</div>
                    <div className="mt-6 pt-6 border-t-2 border-blue-100">
                      <span className="text-sm text-slate-500 block mb-2 uppercase tracking-widest">Plural (+im)</span>
                      <div className="text-3xl font-black text-brand-900">יְלָדִים <span className="text-blue-500/50 text-xl font-medium">(Yeladim)</span></div>
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.03 }}
                    className="bg-gradient-to-b from-pink-50 to-white border-2 border-pink-200 rounded-[2rem] p-8 text-center shadow-lg"
                  >
                    <div className="text-sm font-black uppercase tracking-[0.2em] text-pink-500 mb-6">Feminine (נְקֵבָה)</div>
                    <div className="text-5xl font-serif text-brand-950 mb-3">יַלְדָּה</div>
                    <div className="font-bold text-slate-700 text-xl">Yalda (Girl)</div>
                    <div className="mt-6 pt-6 border-t-2 border-pink-100">
                      <span className="text-sm text-slate-500 block mb-2 uppercase tracking-widest">Plural (+ot)</span>
                      <div className="text-3xl font-black text-brand-900">יְלָדוֹת <span className="text-pink-500/50 text-xl font-medium">(Yeladot)</span></div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Questions */}
              {section.interactive === 'questions' && (
                <div className="flex flex-wrap justify-center gap-6">
                  {[
                    { h: 'מִי', e: 'Who', base: 'bg-purple-50', border: 'border-purple-200', text1: 'text-purple-600', text2: 'group-hover:text-purple-100', hoverBg: 'hover:bg-purple-500', hoverBorder: 'hover:border-purple-600' },
                    { h: 'מָה', e: 'What', base: 'bg-blue-50', border: 'border-blue-200', text1: 'text-blue-600', text2: 'group-hover:text-blue-100', hoverBg: 'hover:bg-blue-500', hoverBorder: 'hover:border-blue-600' },
                    { h: 'אֵיפֹה', e: 'Where', base: 'bg-emerald-50', border: 'border-emerald-200', text1: 'text-emerald-600', text2: 'group-hover:text-emerald-100', hoverBg: 'hover:bg-emerald-500', hoverBorder: 'hover:border-emerald-600' },
                    { h: 'מָתַי', e: 'When', base: 'bg-amber-50', border: 'border-amber-200', text1: 'text-amber-600', text2: 'group-hover:text-amber-100', hoverBg: 'hover:bg-amber-500', hoverBorder: 'hover:border-amber-600' },
                    { h: 'לָמָּה', e: 'Why', base: 'bg-rose-50', border: 'border-rose-200', text1: 'text-rose-600', text2: 'group-hover:text-rose-100', hoverBg: 'hover:bg-rose-500', hoverBorder: 'hover:border-rose-600' },
                    { h: 'אֵיךְ', e: 'How', base: 'bg-indigo-50', border: 'border-indigo-200', text1: 'text-indigo-600', text2: 'group-hover:text-indigo-100', hoverBg: 'hover:bg-indigo-500', hoverBorder: 'hover:border-indigo-600' }
                  ].map((q, i) => (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: i * 0.1, type: 'spring' }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.15, rotate: Math.random() * 12 - 6 }}
                      className={`w-32 h-32 ${q.base} rounded-[2rem] border-2 ${q.border} flex flex-col items-center justify-center shadow-lg cursor-pointer ${q.hoverBg} ${q.hoverBorder} transition-colors group`}
                    >
                      <div className="text-3xl font-black text-brand-950 group-hover:text-white mb-2">{q.h}</div>
                      <div className={`text-sm font-bold ${q.text1} ${q.text2} uppercase tracking-widest`}>{q.e}</div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Numbers */}
              {section.interactive === 'numbers' && (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-slate-900 to-brand-950 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border border-slate-800"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px]" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
                  
                  <h4 className="text-2xl font-black mb-8 text-amber-400 flex items-center gap-3">
                    <Calculator /> The Number Three (3)
                  </h4>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center bg-white/10 rounded-2xl p-6 border border-white/20 backdrop-blur-md">
                      <div className="mb-4 md:mb-0">
                        <div className="text-xs text-slate-400 uppercase tracking-[0.2em] mb-2">Masculine Nouns</div>
                        <div className="text-4xl font-serif mb-1">שְׁלוֹשָׁה יְלָדִים</div>
                        <div className="text-md font-bold text-amber-200">Shlosha yeladim</div>
                      </div>
                      <div className="text-center md:text-right">
                        <span className="inline-block bg-amber-500/20 px-4 py-2 rounded-full text-amber-300 font-black border border-amber-500/50 text-sm tracking-wide shadow-inner">
                          Ends in -a (ה)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-center bg-black/20 rounded-2xl p-6 border border-white/10 backdrop-blur-md">
                      <div className="mb-4 md:mb-0">
                        <div className="text-xs text-slate-400 uppercase tracking-[0.2em] mb-2">Feminine Nouns</div>
                        <div className="text-4xl font-serif mb-1">שָׁלוֹשׁ יְלָדוֹת</div>
                        <div className="text-md font-bold text-slate-300">Shalosh yeladot</div>
                      </div>
                      <div className="text-center md:text-right">
                        <span className="inline-block bg-slate-500/30 px-4 py-2 rounded-full text-slate-300 font-black border border-slate-500/50 text-sm tracking-wide shadow-inner">
                          No ending
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
