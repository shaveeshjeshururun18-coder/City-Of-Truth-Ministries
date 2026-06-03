import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Volume2, 
  Mic, 
  Check, 
  RefreshCw, 
  Info, 
  ChevronDown, 
  X,
  VolumeX,
  ArrowRight,
  HelpCircle,
  Award
} from 'lucide-react';

// ==========================================
// DETAILED BILINGUAL WORDS DATA
// ==========================================
const WORDS_DATA = {
  english: [
    {
      word: "Faithfully",
      phonetic: "fayth · fu · lee",
      tamilPhonetic: "ஃபேத் · ஃபு · லீ",
      meaning: "உண்மையுடன் (With loyalty and devotion)",
      tip: "Bite your lower lip for the 'F' sound, then slide your tongue forward between your teeth for 'TH'.",
      sequence: [
        { phoneme: "F", duration: 350, syllable: "fayth" },
        { phoneme: "AH", duration: 150, syllable: "fayth" },
        { phoneme: "EE", duration: 150, syllable: "fayth" },
        { phoneme: "TH", duration: 400, syllable: "fayth" },
        { phoneme: "F", duration: 250, syllable: "fu" },
        { phoneme: "OO", duration: 350, syllable: "fu" },
        { phoneme: "L", duration: 250, syllable: "lee" },
        { phoneme: "EE", duration: 500, syllable: "lee" }
      ]
    },
    {
      word: "Beautiful",
      phonetic: "byoo · ti · ful",
      tamilPhonetic: "பியூ · டி · ஃபுல்",
      meaning: "அழகான (Aesthetically pleasing)",
      tip: "Start with tightly closed lips for 'B', shift instantly to a wide smile for 'EE', then round into 'OO'.",
      sequence: [
        { phoneme: "P", duration: 250, syllable: "byoo" },
        { phoneme: "EE", duration: 200, syllable: "byoo" },
        { phoneme: "OO", duration: 500, syllable: "byoo" },
        { phoneme: "L", duration: 200, syllable: "ti" },
        { phoneme: "EE", duration: 300, syllable: "ti" },
        { phoneme: "F", duration: 250, syllable: "ful" },
        { phoneme: "OO", duration: 250, syllable: "ful" },
        { phoneme: "L", duration: 400, syllable: "ful" }
      ]
    },
    {
      word: "Sincerity",
      phonetic: "sin · ce · ri · ty",
      tamilPhonetic: "சின் · செ · ரி · டி",
      meaning: "நேர்மை (The quality of being honest and genuine)",
      tip: "Keep your teeth close together for the hissing 'S' sound, followed by a light alveolar tap for 'r'.",
      sequence: [
        { phoneme: "EE", duration: 250, syllable: "sin" },
        { phoneme: "L", duration: 300, syllable: "sin" },
        { phoneme: "EE", duration: 250, syllable: "ce" },
        { phoneme: "L", duration: 200, syllable: "ri" },
        { phoneme: "EE", duration: 250, syllable: "ri" },
        { phoneme: "L", duration: 200, syllable: "ty" },
        { phoneme: "EE", duration: 450, syllable: "ty" }
      ]
    }
  ],
  tamil: [
    {
      word: "தமிழ் (Tamizh)",
      phonetic: "ta · mizh",
      tamilPhonetic: "த · மிழ்",
      meaning: "The sweet, ancient Tamil language",
      tip: "To pronounce 'ழ' (zh), curl your tongue fully backward without touching the roof of your mouth.",
      sequence: [
        { phoneme: "TH", duration: 300, syllable: "ta" },
        { phoneme: "AH", duration: 350, syllable: "ta" },
        { phoneme: "P", duration: 250, syllable: "mizh" },
        { phoneme: "EE", duration: 250, syllable: "mizh" },
        { phoneme: "ZH", duration: 650, syllable: "mizh" }
      ]
    },
    {
      word: "வணக்கம் (Vanakkam)",
      phonetic: "va · nak · kam",
      tamilPhonetic: "வ · ணக் · கம்",
      meaning: "Traditional Tamil greeting / Hello",
      tip: "Start with soft lips for 'Va', tap the alveolar ridge for retroflex 'na', and finish with firmly closed lips.",
      sequence: [
        { phoneme: "OO", duration: 250, syllable: "va" },
        { phoneme: "AH", duration: 350, syllable: "va" },
        { phoneme: "L", duration: 250, syllable: "nak" },
        { phoneme: "AH", duration: 200, syllable: "nak" },
        { phoneme: "K", duration: 250, syllable: "nak" },
        { phoneme: "K", duration: 200, syllable: "kam" },
        { phoneme: "AH", duration: 250, syllable: "kam" },
        { phoneme: "P", duration: 500, syllable: "kam" }
      ]
    },
    {
      word: "நன்றி (Nandri)",
      phonetic: "nan · dri",
      tamilPhonetic: "நன் · றீ",
      meaning: "Thank you",
      tip: "Press the tongue tip flat behind your teeth for 'Nan', then pull back for the soft rolling flap 'dri'.",
      sequence: [
        { phoneme: "L", duration: 250, syllable: "nan" },
        { phoneme: "AH", duration: 200, syllable: "nan" },
        { phoneme: "L", duration: 250, syllable: "nan" },
        { phoneme: "L", duration: 250, syllable: "dri" },
        { phoneme: "ZH", duration: 200, syllable: "dri" },
        { phoneme: "EE", duration: 500, syllable: "dri" }
      ]
    }
  ]
};

// ==========================================
// TARGET INTERPOLATION ANATOMY PRESETS
// ==========================================
const PHONEME_TARGETS = {
  REST: { 
    open: 0.0, 
    width: 0.0, 
    tongueY: 0.0, 
    tongueX: 0.0, 
    teethGap: 0.0, 
    lowerLipBite: 0.0,
    label: "Resting Position / இதழ் மூடுதல்"
  },
  AH: { 
    open: 0.85, 
    width: 0.15, 
    tongueY: -0.6, 
    tongueX: -0.1, 
    teethGap: 0.8, 
    lowerLipBite: 0.0,
    label: "Open Mouth Vowel / அ, ஆ"
  },
  EE: { 
    open: 0.22, 
    width: 0.75, 
    tongueY: 0.35, 
    tongueX: 0.0, 
    teethGap: 0.15, 
    lowerLipBite: 0.0,
    label: "Smile Stretched Vowel / இ, ஈ"
  },
  OO: { 
    open: 0.32, 
    width: -0.85, 
    tongueY: -0.1, 
    tongueX: -0.2, 
    teethGap: 0.3, 
    lowerLipBite: 0.0,
    label: "Pursed Rounded Lips / உ, ஊ"
  },
  F: { 
    open: 0.12, 
    width: 0.2, 
    tongueY: -0.2, 
    tongueX: 0.0, 
    teethGap: 0.1, 
    lowerLipBite: 0.95,
    label: "Labiodental (Teeth on Lip) / ஃ"
  },
  TH: { 
    open: 0.25, 
    width: 0.1, 
    tongueY: 0.15, 
    tongueX: 0.75, 
    teethGap: 0.18, 
    lowerLipBite: 0.0,
    label: "Dental Tongue Peek / த, Th"
  },
  L: { 
    open: 0.52, 
    width: 0.25, 
    tongueY: 0.9, 
    tongueX: 0.15, 
    teethGap: 0.45, 
    lowerLipBite: 0.0,
    label: "Alveolar Tongue Contact / ல, ந, ட"
  },
  P: { 
    open: 0.0, 
    width: -0.05, 
    tongueY: -0.1, 
    tongueX: 0.0, 
    teethGap: 0.0, 
    lowerLipBite: 0.0,
    label: "Bilabial (Closed Lips) / ப, ம"
  },
  K: { 
    open: 0.5, 
    width: 0.15, 
    tongueY: -0.2, 
    tongueX: -0.5, 
    teethGap: 0.4, 
    lowerLipBite: 0.0,
    label: "Velar (Throat Action) / க"
  },
  ZH: { 
    open: 0.38, 
    width: -0.25, 
    tongueY: 0.72, 
    tongueX: -0.8, 
    teethGap: 0.35, 
    lowerLipBite: 0.0,
    label: "Tamil Retroflex Curl / சிறப்பு ழகரம் (ழ)"
  }
};

export default function App() {
  const [accentMode, setAccentMode] = useState("english"); // "english" | "tamil"
  const [selectedWordIndex, setSelectedWordIndex] = useState(0);
  const [isSlow, setIsSlow] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePhonemeIdx, setActivePhonemeIdx] = useState(-1);
  const [activePhonemeName, setActivePhonemeName] = useState("REST");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Mic recognition state
  const [isListening, setIsListening] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState(null); // 'success' | 'retry' | null
  const [recognitionText, setRecognitionText] = useState("");

  // Smooth Interpolated Animation Physics
  const [animState, setAnimState] = useState({
    open: 0.0,
    width: 0.0,
    tongueY: 0.0,
    tongueX: 0.0,
    teethGap: 0.0,
    lowerLipBite: 0.0
  });

  const animationFrameRef = useRef(null);
  const timeoutsRef = useRef([]);
  const recognitionRef = useRef(null);

  const activeWordList = WORDS_DATA[accentMode];
  const currentWord = activeWordList[selectedWordIndex];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = accentMode === "tamil" ? "ta-IN" : "en-IN";

      rec.onstart = () => {
        setIsListening(true);
        setRecognitionResult(null);
        setRecognitionText("");
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        setRecognitionText(transcript);
        
        const cleanWord = currentWord.word.split('(')[0].replace(/[^\u0b80-\u0bffA-Za-z]/g, "").toLowerCase().trim();
        const cleanTranscript = transcript.replace(/[^\u0b80-\u0bffA-Za-z]/g, "").toLowerCase().trim();

        if (cleanTranscript.includes(cleanWord) || cleanWord.includes(cleanTranscript)) {
          setRecognitionResult("success");
        } else {
          setRecognitionResult("retry");
        }
      };

      rec.onerror = () => {
        setRecognitionResult("retry");
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [accentMode, selectedWordIndex]);

  // Clean-up animation loops and triggers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Frame Interpolator (Physics-based easing loop)
  useEffect(() => {
    const updatePhysicsFrame = () => {
      setAnimState(prev => {
        const target = PHONEME_TARGETS[activePhonemeName] || PHONEME_TARGETS.REST;
        const ease = 0.16; // Fluid transition speed

        return {
          open: prev.open + (target.open - prev.open) * ease,
          width: prev.width + (target.width - prev.width) * ease,
          tongueY: prev.tongueY + (target.tongueY - prev.tongueY) * ease,
          tongueX: prev.tongueX + (target.tongueX - prev.tongueX) * ease,
          teethGap: prev.teethGap + (target.teethGap - prev.teethGap) * ease,
          lowerLipBite: prev.lowerLipBite + (target.lowerLipBite - prev.lowerLipBite) * ease,
        };
      });

      animationFrameRef.current = requestAnimationFrame(updatePhysicsFrame);
    };

    animationFrameRef.current = requestAnimationFrame(updatePhysicsFrame);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [activePhonemeName]);

  const clearAllTimers = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  // Speaks audio using local synthesizer and runs the timeline
  const triggerPronunciation = () => {
    if (isPlaying) {
      clearAllTimers();
      setIsPlaying(false);
      setActivePhonemeIdx(-1);
      setActivePhonemeName("REST");
      return;
    }

    setIsPlaying(true);
    const speedFactor = isSlow ? 1.85 : 1.0;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanToSpeak = currentWord.word.split('(')[0].trim();
      const utterance = new SpeechSynthesisUtterance(cleanToSpeak);
      utterance.rate = isSlow ? 0.55 : 0.95;
      utterance.lang = accentMode === "tamil" ? "ta-IN" : "en-IN";
      window.speechSynthesis.speak(utterance);
    }

    let elapsed = 0;
    currentWord.sequence.forEach((step, idx) => {
      const stepDuration = step.duration * speedFactor;

      const t = setTimeout(() => {
        setActivePhonemeIdx(idx);
        setActivePhonemeName(step.phoneme);

        if (idx === currentWord.sequence.length - 1) {
          const tEnd = setTimeout(() => {
            setActivePhonemeName("REST");
            setIsPlaying(false);
            setActivePhonemeIdx(-1);
          }, stepDuration);
          timeoutsRef.current.push(tEnd);
        }
      }, elapsed);

      timeoutsRef.current.push(t);
      elapsed += stepDuration;
    });
  };

  const startMicrophonePractice = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        recognitionRef.current.stop();
      }
    } else {
      alert("Speech recognition is not fully supported in this browser environment. Try using Chrome or Safari.");
    }
  };

  // ==========================================
  // EXACT HIGH-FIDELITY GOOGLE SVG RENDER
  // ==========================================
  const renderExactGoogleMouthSVG = () => {
    const { open, width, tongueY, tongueX, teethGap, lowerLipBite } = animState;
    
    const cx = 150; // Horizontal center
    const cy = 160; // Vertical center
    
    // Width and opening parameters of the lips matching Google UI
    const w = 55 + width * 22;          // Horizontal stretch/smile width
    const openingH = open * 38;         // Maximum inner vertical opening height
    
    // Base static gap (in pixels) visible even when closed
    const baseGap = 3.5;

    // Enforced inner curves to always preserve the biconvex gap
    const hUpperInner = baseGap + (open * 14);
    const hLowerInner = baseGap + (open * 20) - (lowerLipBite * 10);
    
    // Safety thresholds to prevent collapsing/self-intersecting coordinates
    const hUpperOuter = 15 + open * 4;
    const hLowerOuter = 17 + open * 14 - (lowerLipBite * 8);
    
    // Enforce math rules so outer coordinates always exceed inner coordinates
    const safeLowerOuter = Math.max(hLowerOuter, hLowerInner + 6);
    const safeUpperOuter = Math.max(hUpperOuter, hUpperInner + 6);

    // Mouth Cavity Backing (Dark Inner Throat Space)
    const cavityPath = `
      M ${cx - w} ${cy}
      Q ${cx} ${cy - hUpperInner - 3} ${cx + w} ${cy}
      Q ${cx} ${cy + hLowerInner + 3} ${cx - w} ${cy}
      Z
    `;

    // Teeth Dimensions
    const upperTeethHeight = 11;
    const lowerTeethHeight = 9;
    const upperTeethY = cy - hUpperInner; // Sticks to upper inner lip lip line
    const lowerTeethY = cy + hLowerInner + (teethGap * 4); // Shifts down with jaw opening

    // Upper Teeth Path
    const upperTeethPath = `
      M ${cx - w * 0.6} ${upperTeethY}
      L ${cx + w * 0.6} ${upperTeethY}
      L ${cx + w * 0.5} ${upperTeethY + upperTeethHeight}
      Q ${cx} ${upperTeethY + upperTeethHeight + 1.5} ${cx - w * 0.5} ${upperTeethY + upperTeethHeight}
      Z
    `;

    // Lower Teeth Path
    const lowerTeethPath = `
      M ${cx - w * 0.55} ${lowerTeethY}
      L ${cx + w * 0.55} ${lowerTeethY}
      L ${cx + w * 0.45} ${lowerTeethY - lowerTeethHeight}
      Q ${cx} ${lowerTeethY - lowerTeethHeight - 1} ${cx - w * 0.45} ${lowerTeethY - lowerTeethHeight}
      Z
    `;

    // Tongue coordinates (interpolated curves)
    const tY = tongueY * 24;
    const tX = tongueX * 18;
    const tonguePath = `
      M ${cx - w * 0.62} ${cy + hLowerInner + 2}
      Q ${cx + tX} ${cy + (openingH * 0.1) - tY} ${cx + w * 0.62} ${cy + hLowerInner + 2}
      Q ${cx + tX} ${cy + hLowerInner + 16} ${cx - w * 0.62} ${cy + hLowerInner + 2}
      Z
    `;

    // PIXEL-PERFECT SEPARATE LIPS MORPHING PATHS
    // Generates a beautiful gap even when open is 0 (closed)
    const upperLipPath = `
      M ${cx - w} ${cy}
      Q ${cx} ${cy - safeUpperOuter} ${cx + w} ${cy}
      Q ${cx} ${cy - hUpperInner} ${cx - w} ${cy}
      Z
    `;

    const lowerLipPath = `
      M ${cx - w} ${cy}
      Q ${cx} ${cy + safeLowerOuter} ${cx + w} ${cy}
      Q ${cx} ${cy + hLowerInner} ${cx - w} ${cy}
      Z
    `;

    return (
      <svg viewBox="0 0 300 320" className="w-full h-full select-none">
        {/* Face Background - Clean uniform Google Pale Blue color (#E8F0FE) */}
        <rect width="300" height="320" rx="36" fill="#E8F0FE" />

        {/* 1. Exact Nose line: Blue, single smooth wide-cup line */}
        <path 
          d="M 112 42 C 132 88 168 88 188 42" 
          stroke="#4285F4" 
          strokeWidth="4.5" 
          strokeLinecap="round" 
          fill="none" 
        />

        {/* 2. Deep Mouth Cavity (rendered behind teeth/tongue when open) */}
        {open > 0.05 && (
          <path d={cavityPath} fill="#152C5B" />
        )}

        {/* 3. Tongue rendering */}
        {open > 0.05 && (
          <path d={tonguePath} fill="#FF8A9F" />
        )}

        {/* 4. Upper Teeth Vector */}
        {open > 0.1 && (
          <g>
            <path d={upperTeethPath} fill="#FFFFFF" stroke="#D2E3FC" strokeWidth="1" />
            <line x1={cx} y1={upperTeethY} x2={cx} y2={upperTeethY + upperTeethHeight + 0.5} stroke="#D2E3FC" strokeWidth="1" />
            <line x1={cx - 15} y1={upperTeethY} x2={cx - 15} y2={upperTeethY + upperTeethHeight - 1} stroke="#D2E3FC" strokeWidth="0.8" />
            <line x1={cx + 15} y1={upperTeethY} x2={cx + 15} y2={upperTeethY + upperTeethHeight - 1} stroke="#D2E3FC" strokeWidth="0.8" />
          </g>
        )}

        {/* 5. Lower Teeth Vector */}
        {open > 0.22 && (
          <g>
            <path d={lowerTeethPath} fill="#FFFFFF" stroke="#D2E3FC" strokeWidth="1" />
            <line x1={cx} y1={lowerTeethY - lowerTeethHeight} x2={cx} y2={lowerTeethY} stroke="#D2E3FC" strokeWidth="1" />
          </g>
        )}

        {/* 6. UPPER LIP - Filled with face background (#E8F0FE) to mask cavity lines */}
        <path 
          d={upperLipPath} 
          fill="#E8F0FE" 
          stroke="#4285F4" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />

        {/* 7. LOWER LIP */}
        <path 
          d={lowerLipPath} 
          fill="#E8F0FE" 
          stroke="#4285F4" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />

        {/* 8. CENTER DIVIDING LINE - Sits perfectly in the middle of the empty baseGap */}
        <line 
          x1={cx - w} 
          y1={cy} 
          x2={cx + w} 
          y2={cy} 
          stroke="#202124" 
          strokeWidth="4" 
          strokeLinecap="round" 
          opacity={Math.max(0, 1 - open * 4)} 
        />

        {/* 9. Jaw contour: Clean sweeping blue arc at the bottom */}
        <path 
          d="M 0,142 C 60,265 240,265 300,142" 
          stroke="#4285F4" 
          strokeWidth="4" 
          strokeLinecap="round" 
          fill="none" 
        />

        {/* 10. Chin crease: Soft crescent below lip */}
        <path 
          d="M 132,238 Q 150,246 168,238" 
          stroke="#BDD7FE" 
          strokeWidth="5" 
          strokeLinecap="round" 
          fill="none" 
          opacity="0.8"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800 font-sans antialiased">
      
      {/* HEADER BAR */}
      <header className="bg-white border-b border-slate-200 py-3 px-4 shadow-xs sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#4285F4] rounded-lg flex items-center justify-center text-white font-extrabold text-lg">
              G
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-slate-900">Google Pronunciation Lab</h1>
              <p className="text-[10px] text-slate-500 font-medium">Bilingual Tamil & English Speech Guide</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#4285F4] bg-[#E8F0FE] px-2.5 py-1 rounded-full">
              Exact Vector Rendering
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 flex flex-col justify-center">
        
        {/* ACCENT SELECTOR TABS & SEARCH CONTAINER */}
        <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            
            {/* Word Selection Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => {
                  setAccentMode("english");
                  setSelectedWordIndex(0);
                  clearAllTimers();
                  setIsPlaying(false);
                  setActivePhonemeIdx(-1);
                  setActivePhonemeName("REST");
                  setRecognitionResult(null);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  accentMode === "english" 
                    ? 'bg-white text-[#4285F4] shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                English Words
              </button>
              <button
                onClick={() => {
                  setAccentMode("tamil");
                  setSelectedWordIndex(0);
                  clearAllTimers();
                  setIsPlaying(false);
                  setActivePhonemeIdx(-1);
                  setActivePhonemeName("REST");
                  setRecognitionResult(null);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  accentMode === "tamil" 
                    ? 'bg-white text-[#4285F4] shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Tamil Words / தமிழ்
              </button>
            </div>

            {/* Accent Select Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between gap-2 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 transition-all"
              >
                <span>
                  {accentMode === "english" ? "Indian English pronunciation" : "Tamil pronunciation (தமிழ்)"}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg w-52 py-1 z-30">
                  <button 
                    onClick={() => {
                      setAccentMode("english");
                      setSelectedWordIndex(0);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 text-slate-700"
                  >
                    Indian English pronunciation
                  </button>
                  <button 
                    onClick={() => {
                      setAccentMode("tamil");
                      setSelectedWordIndex(0);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 text-slate-700"
                  >
                    Tamil pronunciation (தமிழ்)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Word Bank slider */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {WORDS_DATA[accentMode].map((w, index) => (
              <button
                key={w.word}
                onClick={() => {
                  setSelectedWordIndex(index);
                  clearAllTimers();
                  setIsPlaying(false);
                  setActivePhonemeIdx(-1);
                  setActivePhonemeName("REST");
                  setRecognitionResult(null);
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${
                  selectedWordIndex === index
                    ? 'bg-[#E8F0FE] border-[#4285F4]/30 text-[#1A73E8]'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                {w.word}
              </button>
            ))}
          </div>

          {/* MAIN TWO-COLUMN DISPLAY CARD */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white">
            
            {/* LEFT: SPELLING, PHONETICS, AUDIO ACTIONS */}
            <div className="md:col-span-7 space-y-6">
              
              <div>
                <h2 className="text-3xl font-bold text-slate-950 tracking-tight">
                  {currentWord.word}
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Meaning: {currentWord.meaning}
                </p>
              </div>

              {/* Syllables block matching Google UI exactly */}
              <div className="space-y-3">
                <span className="text-xs text-[#70757a] font-medium tracking-wide block">Sounds like</span>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {currentWord.phonetic.split(' · ').map((syllable, sIdx) => {
                      const isSyllableActive = activePhonemeIdx >= 0 && 
                        currentWord.sequence[activePhonemeIdx]?.syllable === syllable.trim();

                      return (
                        <React.Fragment key={sIdx}>
                          {sIdx > 0 && <span className="text-slate-300 text-lg font-light">•</span>}
                          <span 
                            className={`text-2xl font-black transition-all duration-150 ${
                              isSyllableActive 
                                ? 'text-[#1A73E8] scale-110' 
                                : 'text-slate-900'
                            }`}
                          >
                            {syllable}
                          </span>
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Google Blue Sound Speaker Button */}
                  <button
                    onClick={triggerPronunciation}
                    className="w-11 h-11 rounded-full bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#1A73E8] flex items-center justify-center shadow-xs transition-all flex-shrink-0"
                    title="Listen pronunciation"
                  >
                    <Volume2 className="w-5 h-5 fill-current" />
                  </button>
                </div>

                <div className="text-xs text-indigo-600 font-bold bg-indigo-50/50 border border-indigo-100/50 w-fit px-2.5 py-1 rounded">
                  Tamil phonetics: {currentWord.tamilPhonetic}
                </div>
              </div>

              {/* Slow-Motion control switch */}
              <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
                <button
                  onClick={() => setIsSlow(!isSlow)}
                  className={`w-11 h-6 rounded-full p-1 transition-all relative flex-shrink-0 ${
                    isSlow ? 'bg-[#1A73E8]' : 'bg-slate-200'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-xs transition-all ${
                    isSlow ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
                <span className="text-xs font-bold text-slate-700">Slow Mode</span>
              </div>

              {/* Mic Practice Block */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    <Award className="w-4 h-4 text-amber-500" />
                    Practice Pronouncing
                  </span>
                  {isListening && (
                    <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded animate-pulse font-bold">
                      Listening... Speak Now
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={startMicrophonePractice}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isListening 
                        ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-100' 
                        : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-800'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    {isListening ? "Listening..." : "Tap Mic to Practice Speaking"}
                  </button>
                </div>

                {/* Score results overlay */}
                {recognitionResult && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-start gap-2.5 ${
                    recognitionResult === 'success' 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                      : 'bg-amber-50 text-amber-800 border border-amber-100'
                  }`}>
                    {recognitionResult === 'success' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span>Excellent! You got it right.</span>
                          <span className="block text-[10px] font-normal text-emerald-600 mt-0.5">Detected: "{recognitionText}"</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0 animate-spin" />
                        <div>
                          <span>Let's try again! Try to match the lip movements.</span>
                          <span className="block text-[10px] font-normal text-amber-600 mt-0.5">Detected: "{recognitionText || 'No clear speech caught'}"</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT: THE EXACT GOOGLE VECTOR VISUALIZER CANVAS */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-[280px] aspect-square rounded-[36px] bg-[#E8F0FE] shadow-sm relative overflow-hidden border border-slate-200/50">
                {renderExactGoogleMouthSVG()}

                {/* State Tag overlay */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
                  {isPlaying ? `State: ${activePhonemeName}` : "Idle State"}
                </div>
              </div>

              <span className="text-[11px] text-slate-400 font-bold mt-3">
                Exact mouth anatomy vector illustration
              </span>
            </div>

          </div>

          {/* PRO-TIP EDUCATIONAL CONTENT */}
          <div className="border-t border-slate-100 pt-5 flex gap-3.5 items-start text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl">
            <Info className="w-5 h-5 text-[#4285F4] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block mb-0.5">Phonetic Placement Tip:</strong>
              {currentWord.tip}
            </div>
          </div>

        </div>

        {/* AI OVERVIEW ACCORDION */}
        <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <div className="w-5 h-5 rounded bg-indigo-50 flex items-center justify-center">
              <span className="text-xs text-indigo-600">✨</span>
            </div>
            AI Overview & Accent Guide
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-800">English vs Tamil Articulation</h4>
              <p className="leading-relaxed">
                English utilizes dental-fricatives (like 'th' in 'faith') and labiodental-fricatives (like 'f'). Tamil, conversely, relies on complex dental stops (த) and retroflexes (ழ, ள, ற) requiring the tongue to fold backward towards the palate.
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-800">Visualizing the Special ழ (zh)</h4>
              <p className="leading-relaxed">
                Notice the "ZH" state on the visualizer. The tongue retracts deeply to the back-left while the mouth opening narrows. This unique configuration is key to sounding native in Tamil.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Google Pronunciation UI replication in React</span>
          <div className="flex gap-4">
            <span className="hover:text-slate-800 transition-colors cursor-pointer">Feedback</span>
            <span className="hover:text-slate-800 transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-slate-800 transition-colors cursor-pointer">Terms</span>
          </div>
        </div>
      </footer>

    </div>
  );
}