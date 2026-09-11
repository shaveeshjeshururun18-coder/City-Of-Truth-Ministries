import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export interface ExactStackCardItem {
  id: string | number;
  number: string;
  category: string;
  title: string;
  tamilTitle?: string;
  subtitle?: string;
  liveUrl?: string;
  buttonLabel?: string;
  col1Img1: string;
  col1Img2: string;
  col2Img: string;
}

export const JACK_PROJECTS: ExactStackCardItem[] = [
  {
    id: 'project-01',
    number: '01',
    category: 'Client',
    title: 'Nextlevel Studio',
    buttonLabel: 'Live Project',
    col1Img1: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png&w=1280&q=85',
    col1Img2: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png&w=1280&q=85',
    col2Img: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png&w=1280&q=85',
  },
  {
    id: 'project-02',
    number: '02',
    category: 'Personal',
    title: 'Aura Brand Identity',
    buttonLabel: 'Live Project',
    col1Img1: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png&w=1280&q=85',
    col1Img2: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png&w=1280&q=85',
    col2Img: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png&w=1280&q=85',
  },
  {
    id: 'project-03',
    number: '03',
    category: 'Client',
    title: 'Solaris Digital',
    buttonLabel: 'Live Project',
    col1Img1: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png&w=1280&q=85',
    col1Img2: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png&w=1280&q=85',
    col2Img: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png&w=1280&q=85',
  }
];

export const VALPARAI_DESTINATIONS_STACK: ExactStackCardItem[] = [
  {
    id: 'valparai-01',
    number: '01',
    category: 'UNESCO Heritage · 2,400m',
    title: 'Grass Hills National Park',
    tamilTitle: 'புல்வெளி தேசிய பூங்கா',
    subtitle: 'High-Altitude Shola & Nilgiri Tahr Sanctuary',
    buttonLabel: 'Explore Landmark',
    liveUrl: 'https://maps.google.com/?q=Grass+Hills+Valparai',
    col1Img1: '/valparai/grass-hills.png',
    col1Img2: '/valparai/dest1.png',
    col2Img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1280&auto=format&fit=crop',
  },
  {
    id: 'valparai-02',
    number: '02',
    category: 'Hydro Power · 20 km from town',
    title: 'Sholayar Dam & Reservoir',
    tamilTitle: 'சோலையாறு அணை',
    subtitle: 'Deep Mountain Engineering & Tea Panorama',
    buttonLabel: 'Explore Landmark',
    liveUrl: 'https://maps.google.com/?q=Sholayar+Dam+Valparai',
    col1Img1: '/valparai/sholayar.png',
    col1Img2: '/valparai/dest2.png',
    col2Img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1280&auto=format&fit=crop',
  },
  {
    id: 'valparai-03',
    number: '03',
    category: 'Rainforest · Cherrapunji of South',
    title: 'Chinnakallar Falls',
    tamilTitle: 'சின்னக்கல்லார் நீர்வீழ்ச்சி',
    subtitle: 'Hanging Bridge & Extreme Monsoon Rainfall',
    buttonLabel: 'Explore Landmark',
    liveUrl: 'https://maps.google.com/?q=Chinnakallar+Falls+Valparai',
    col1Img1: '/valparai/chinnakallar.png',
    col1Img2: '/valparai/dest3.png',
    col2Img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1280&auto=format&fit=crop',
  },
  {
    id: 'valparai-04',
    number: '04',
    category: 'Ghat Route · 9th Bend',
    title: "Loam's View Point & Hairpins",
    tamilTitle: 'லோம்ஸ் காட்சி முனை',
    subtitle: '40 Hairpin Ghat Panoramic View of Aliyar',
    buttonLabel: 'Explore Landmark',
    liveUrl: 'https://maps.google.com/?q=Loams+View+Point+Valparai',
    col1Img1: '/valparai/loams.png',
    col1Img2: '/valparai/dest4.png',
    col2Img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1280&auto=format&fit=crop',
  }
];

export const ISRAEL_REGIONS_STACK: ExactStackCardItem[] = [
  {
    id: 'israel-01',
    number: '01',
    category: 'Eternal Capital · Judean Mountains',
    title: 'Jerusalem (Yerushalayim)',
    tamilTitle: 'எருசலேம் (யெருசலாயீம்) · הַיְּרוּשָׁלַיִם',
    subtitle: 'Temple Mount, Western Wall & City of David',
    buttonLabel: 'View Region',
    liveUrl: 'https://maps.google.com/?q=Jerusalem+Israel',
    col1Img1: 'https://images.unsplash.com/photo-1544971587-b842c56b9147?q=80&w=1280&auto=format&fit=crop',
    col1Img2: 'https://images.unsplash.com/photo-1579618218290-25a2e5fa2760?q=80&w=1280&auto=format&fit=crop',
    col2Img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1280&auto=format&fit=crop',
  },
  {
    id: 'israel-02',
    number: '02',
    category: 'Northern Realm · Fresh Water & Snow',
    title: 'Galilee & Golan (HaGalil)',
    tamilTitle: 'கலிலேயா மற்றும் கோலான் · הַגָּלִיל',
    subtitle: 'Sea of Galilee (Kinneret) & Mount Hermon',
    buttonLabel: 'View Region',
    liveUrl: 'https://maps.google.com/?q=Sea+of+Galilee+Israel',
    col1Img1: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1280&auto=format&fit=crop',
    col1Img2: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1280&auto=format&fit=crop',
    col2Img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1280&auto=format&fit=crop',
  },
  {
    id: 'israel-03',
    number: '03',
    category: 'Biblical Heartland · Rugged Ridges',
    title: 'Judea & Samaria (Yehuda ve-Shomron)',
    tamilTitle: 'யூதேயா மற்றும் சமாரியா · יְהוּדָה וְשׁוֹமְרוֹன்',
    subtitle: 'Covenant Ground of Abraham, Isaac & Jacob',
    buttonLabel: 'View Region',
    liveUrl: 'https://maps.google.com/?q=Judea+Israel',
    col1Img1: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1280&auto=format&fit=crop',
    col1Img2: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1280&auto=format&fit=crop',
    col2Img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1280&auto=format&fit=crop',
  },
  {
    id: 'israel-04',
    number: '04',
    category: 'Mediterranean Coast · Ancient Ports',
    title: 'Coastal Plain (Mishor HaHof)',
    tamilTitle: 'கடற்கரை சமவெளி · מִישׁוֹר הַחוֹף',
    subtitle: 'Jaffa Port & Caesarea Roman Aqueduct',
    buttonLabel: 'View Region',
    liveUrl: 'https://maps.google.com/?q=Jaffa+Port+Israel',
    col1Img1: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1280&auto=format&fit=crop',
    col1Img2: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1280&auto=format&fit=crop',
    col2Img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1280&auto=format&fit=crop',
  },
  {
    id: 'israel-05',
    number: '05',
    category: 'Southern Wilderness · Makhteshim Craters',
    title: 'The Negev Desert (HaNegev)',
    tamilTitle: 'நெகேவ் பாலைவனம் · הַנֶּגֶב',
    subtitle: "Ramon Crater, Timna Valley & Abraham's Well",
    buttonLabel: 'View Region',
    liveUrl: 'https://maps.google.com/?q=Negev+Desert+Israel',
    col1Img1: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1280&auto=format&fit=crop',
    col1Img2: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=1280&auto=format&fit=crop',
    col2Img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1280&auto=format&fit=crop',
  }
];

export interface LiveProjectButtonProps {
  label?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export const LiveProjectButton: React.FC<LiveProjectButtonProps> = ({
  label = 'Live Project',
  href,
  onClick,
  className = '',
}) => {
  const content = (
    <>
      <span>{label}</span>
      <ArrowUpRight size={16} className="text-[#D7E2EA] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </>
  );

  const baseClasses = `group inline-flex items-center gap-2 rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest px-6 py-2.5 sm:px-8 sm:py-3 md:px-10 md:py-3.5 text-xs sm:text-sm md:text-base hover:bg-[#D7E2EA]/10 transition-all duration-200 shrink-0 ${className}`;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={baseClasses}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={baseClasses}>
      {content}
    </button>
  );
};

interface StickyCardItemProps {
  card: ExactStackCardItem;
  index: number;
  totalCards: number;
  progress: MotionValue<number>;
}

const StickyCardItem: React.FC<StickyCardItemProps> = ({
  card,
  index,
  totalCards,
  progress,
}) => {
  // Scale calculation as specified: targetScale = 1 - (totalCards - 1 - index) * 0.03
  const targetScale = 1 - (totalCards - 1 - index) * 0.03;
  
  // Progress range for this card to scale down as subsequent cards stack on top
  const step = 1 / Math.max(totalCards, 1);
  const startRange = index * step * 0.7;
  const endRange = 1;
  const scale = useTransform(progress, [startRange, endRange], [1, targetScale]);

  return (
    <div
      className="h-[85vh] sticky flex items-center justify-center pointer-events-auto"
      style={{
        // Each card offset by top: ${index * 28}px
        top: `calc(5.5rem + ${index * 28}px)`,
        zIndex: 10 + index,
      }}
    >
      <motion.div
        style={{ scale }}
        className="w-full max-w-6xl mx-auto rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden font-kanit transition-shadow duration-300 hover:border-white/80"
      >
        {/* TOP ROW: Number, Category, Project Name, Live Project Ghost Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-[#D7E2EA]/15">
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8 min-w-0">
            {/* Number (huge, same style as services, clamp(3rem, 10vw, 140px), font-black) */}
            <span className="font-black text-[#D7E2EA] text-[clamp(2.75rem,8vw,120px)] leading-none select-none tracking-tight shrink-0 drop-shadow-sm">
              {card.number}
            </span>

            {/* Category label and Project Name */}
            <div className="min-w-0">
              <span className="text-[#D7E2EA]/70 text-xs sm:text-sm font-medium uppercase tracking-widest block mb-0.5">
                {card.category}
              </span>
              <h3 className="text-[#D7E2EA] font-medium uppercase text-[clamp(1.15rem,2.2vw,2.1rem)] tracking-tight leading-tight truncate">
                {card.title}
              </h3>
              {card.tamilTitle && (
                <p className="text-amber-300 font-serif text-xs sm:text-sm font-medium mt-0.5 opacity-90">
                  {card.tamilTitle}
                </p>
              )}
            </div>
          </div>

          {/* Live Project Button (rounded-full, border-2 #D7E2EA, uppercase, tracking-widest) */}
          <LiveProjectButton
            label={card.buttonLabel || 'Live Project'}
            href={card.liveUrl}
          />
        </div>

        {/* BOTTOM ROW: Two-column image grid */}
        <div className="pt-4 sm:pt-6 flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-5">
          {/* Left Column (40% width) has 2 stacked images */}
          <div className="w-full md:w-[40%] flex flex-col gap-3 sm:gap-4 md:gap-5">
            {/* Left top image height: clamp(130px, 16vw, 230px) */}
            <div className="w-full h-[clamp(130px,16vw,230px)] rounded-[40px] sm:rounded-[50px] md:rounded-[60px] overflow-hidden bg-black/60 border border-[#D7E2EA]/20 relative group shadow-md">
              <img
                src={card.col1Img1}
                alt={`${card.title} col1 img 1`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Left bottom image height: clamp(160px, 22vw, 340px) */}
            <div className="w-full h-[clamp(160px,22vw,340px)] rounded-[40px] sm:rounded-[50px] md:rounded-[60px] overflow-hidden bg-black/60 border border-[#D7E2EA]/20 relative group shadow-md">
              <img
                src={card.col1Img2}
                alt={`${card.title} col1 img 2`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Right Column (60% width) has 1 tall image */}
          <div className="w-full md:w-[60%] h-[clamp(280px,36vw,590px)] md:h-auto rounded-[40px] sm:rounded-[50px] md:rounded-[60px] overflow-hidden bg-black/60 border border-[#D7E2EA]/20 relative group shadow-md flex-1">
            <img
              src={card.col2Img}
              alt={`${card.title} col2 tall`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export interface ExactProjectStackProps {
  heading?: string;
  badgeLabel?: string;
  tamilHeading?: string;
  subtitle?: string;
  items?: ExactStackCardItem[];
  allowJackToggle?: boolean;
  className?: string;
}

export const ExactProjectStack: React.FC<ExactProjectStackProps> = ({
  heading = 'Project',
  badgeLabel,
  tamilHeading,
  subtitle,
  items = JACK_PROJECTS,
  allowJackToggle = true,
  className = '',
}) => {
  const [showJackDeck, setShowJackDeck] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const isCustomItems = items !== JACK_PROJECTS;
  const activeItems = (isCustomItems && showJackDeck) ? JACK_PROJECTS : items;
  const activeHeading = (isCustomItems && showJackDeck) ? 'Project' : heading;
  const activeSubtitle = (isCustomItems && showJackDeck)
    ? 'Crafted 3D environments, spatial models & high-impact visual design systems.'
    : subtitle;
  const activeTamilHeading = (isCustomItems && showJackDeck) ? undefined : tamilHeading;

  return (
    <section
      ref={containerRef}
      className={`relative bg-[#0C0C0C] text-[#D7E2EA] font-kanit rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 z-10 pt-16 sm:pt-20 md:pt-24 pb-32 px-4 sm:px-6 md:px-10 overflow-x-clip ${className}`}
    >
      {/* Optional Badge & Header */}
      <div className="max-w-6xl mx-auto text-center mb-10 sm:mb-14 md:mb-16">
        {badgeLabel && (
          <div className="inline-block px-4 py-1 rounded-full border border-[#D7E2EA]/30 bg-white/5 text-[11px] sm:text-xs font-medium uppercase tracking-widest text-[#D7E2EA]/80 mb-4">
            {badgeLabel}
          </div>
        )}

        {/* Heading: "Project" (singular) using .hero-heading gradient, clamp(3rem, 12vw, 160px) */}
        <h2 className="hero-heading font-black uppercase tracking-tight leading-none text-center text-[clamp(3rem,12vw,160px)] select-none">
          {activeHeading}
        </h2>

        {activeTamilHeading && (
          <div className="text-xl sm:text-2xl md:text-3xl font-serif text-[#D7E2EA]/80 font-bold mt-2">
            {activeTamilHeading}
          </div>
        )}

        {activeSubtitle && (
          <p className="text-[#D7E2EA]/60 max-w-2xl mx-auto mt-4 text-sm sm:text-base leading-relaxed">
            {activeSubtitle}
          </p>
        )}

        {/* Optional Deck Toggle (allows switching between current section cards and Jack's 3D cards) */}
        {allowJackToggle && isCustomItems && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              type="button"
              onClick={() => setShowJackDeck(false)}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-medium transition-all ${
                !showJackDeck
                  ? 'bg-[#D7E2EA] text-[#0C0C0C] font-bold shadow-lg shadow-white/10'
                  : 'bg-white/5 text-[#D7E2EA]/70 hover:bg-white/10 border border-[#D7E2EA]/20'
              }`}
            >
              {heading} Deck
            </button>
            <button
              type="button"
              onClick={() => setShowJackDeck(true)}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-medium transition-all ${
                showJackDeck
                  ? 'bg-[#D7E2EA] text-[#0C0C0C] font-bold shadow-lg shadow-white/10'
                  : 'bg-white/5 text-[#D7E2EA]/70 hover:bg-white/10 border border-[#D7E2EA]/20'
              }`}
            >
              Jack 3D Project Deck
            </button>
          </div>
        )}
      </div>

      {/* 3 sticky-stacking project cards container */}
      <div className="relative max-w-6xl mx-auto">
        {activeItems.map((card, index) => (
          <StickyCardItem
            key={card.id || index}
            card={card}
            index={index}
            totalCards={activeItems.length}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
};
