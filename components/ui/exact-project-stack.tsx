import React, { useState } from 'react';
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
  singleImage?: string;
  col1Img1?: string;
  col1Img2?: string;
  col2Img?: string;
}

export const JACK_PROJECTS: ExactStackCardItem[] = [
  {
    id: 'project-01',
    number: '01',
    category: 'Client',
    title: 'Nextlevel Studio',
    buttonLabel: 'Live Project',
    col1Img1: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.webp&w=1280&q=85',
    col1Img2: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.webp&w=1280&q=85',
    col2Img: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.webp&w=1280&q=85',
  },
  {
    id: 'project-02',
    number: '02',
    category: 'Personal',
    title: 'Aura Brand Identity',
    buttonLabel: 'Live Project',
    col1Img1: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.webp&w=1280&q=85',
    col1Img2: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.webp&w=1280&q=85',
    col2Img: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.webp&w=1280&q=85',
  },
  {
    id: 'project-03',
    number: '03',
    category: 'Client',
    title: 'Solaris Digital',
    buttonLabel: 'Live Project',
    col1Img1: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.webp&w=1280&q=85',
    col1Img2: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.webp&w=1280&q=85',
    col2Img: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.webp&w=1280&q=85',
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
    singleImage: '/valparai/grass-hills.webp',
    col1Img1: '/valparai/grass-hills.webp',
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
    singleImage: '/valparai/sholayar.webp',
    col1Img1: '/valparai/sholayar.webp',
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
    singleImage: '/valparai/chinnakallar.webp',
    col1Img1: '/valparai/chinnakallar.webp',
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
    singleImage: '/valparai/loams.webp',
    col1Img1: '/valparai/loams.webp',
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
    tamilTitle: 'யூதேயா மற்றும் சமாரியா · יְהוּדָה וְשׁוֹמְרוֹן',
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

export interface ExactProjectStackProps {
  heading?: string;
  badgeLabel?: string;
  tamilHeading?: string;
  subtitle?: string;
  items?: ExactStackCardItem[];
  allowJackToggle?: boolean;
  stackStyle?: 'peel' | 'antlion';
  className?: string;
}

/**
 * ExactProjectStack - Pure Antlion Sticky Stacking Cards
 * Directly based on antlion_stacking_cards (1).html:
 * - Native CSS position: sticky
 * - 100% solid, fully opaque card backgrounds (NO double-layer bleeding or ghost text)
 * - Zero lag, zero requestAnimationFrame overhead, 120fps hardware acceleration
 * - Cards stack cleanly over each other as user scrolls down
 */
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

  const isCustomItems = items !== JACK_PROJECTS;
  const activeItems = (isCustomItems && showJackDeck) ? JACK_PROJECTS : items;
  const activeHeading = (isCustomItems && showJackDeck) ? 'Project' : heading;
  const activeSubtitle = (isCustomItems && showJackDeck)
    ? 'Crafted 3D environments, spatial models & high-impact visual design systems.'
    : subtitle;
  const activeTamilHeading = (isCustomItems && showJackDeck) ? undefined : tamilHeading;

  return (
    <section
      className={`relative bg-[#0C0C0C] text-[#D7E2EA] font-kanit rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 z-10 pt-16 sm:pt-20 md:pt-24 pb-24 sm:pb-32 px-4 sm:px-6 md:px-10 overflow-x-clip ${className}`}
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto text-center mb-12 sm:mb-16 md:mb-20">
        {badgeLabel && (
          <div className="inline-block px-4 py-1 rounded-full border border-[#D7E2EA]/30 bg-white/5 text-[11px] sm:text-xs font-medium uppercase tracking-widest text-[#D7E2EA]/80 mb-4">
            {badgeLabel}
          </div>
        )}

        {/* Heading */}
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

        {/* Optional Deck Toggle */}
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

      {/* Pure Antlion CSS Sticky Stacking Cards Container */}
      <div className="max-w-6xl mx-auto relative">
        {activeItems.map((card, index) => {
          const isLast = index === activeItems.length - 1;
          const stickyTopOffset = `calc(68px + ${index * 16}px)`;
          const zIndexValue = 10 + index;

          return (
            <article
              key={card.id || index}
              id={`exact-card-${card.id || index}`}
              style={{
                top: stickyTopOffset,
                zIndex: zIndexValue,
              }}
              className={`sticky rounded-[24px] sm:rounded-[36px] md:rounded-[44px] border-2 border-[#D7E2EA]/70 bg-[#0C0C0C] p-4 sm:p-6 md:p-7 shadow-[0_-16px_50px_rgba(0,0,0,0.8)] font-kanit transition-all duration-300 ${
                isLast ? 'mb-6' : 'mb-12 sm:mb-16 md:mb-20'
              }`}
            >
              {/* TOP ROW: Number, Category, Project Name, Live Project Ghost Button */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-3 sm:pb-5 border-b border-[#D7E2EA]/15">
                <div className="flex items-center gap-3 sm:gap-5 md:gap-6 min-w-0">
                  {/* Number */}
                  <span className="font-black text-[#D7E2EA] text-[clamp(2.2rem,6vw,84px)] leading-none select-none tracking-tight shrink-0 drop-shadow-sm">
                    {card.number}
                  </span>

                  {/* Category label and Project Name */}
                  <div className="min-w-0">
                    <span className="text-[#D7E2EA]/70 text-[11px] sm:text-xs font-medium uppercase tracking-widest block mb-0.5">
                      {card.category}
                    </span>
                    <h3 className="text-[#D7E2EA] font-medium uppercase text-[clamp(1.05rem,1.8vw,1.75rem)] tracking-tight leading-tight truncate">
                      {card.title}
                    </h3>
                    {card.tamilTitle && (
                      <p className="text-amber-300 font-serif text-xs sm:text-sm font-medium mt-0.5 opacity-90">
                        {card.tamilTitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Live Project Button */}
                <LiveProjectButton
                  label={card.buttonLabel || 'Explore Landmark'}
                  href={card.liveUrl}
                />
              </div>

              {/* BOTTOM ROW: Image */}
              {card.singleImage || !card.col1Img2 ? (
                <div className="pt-3 sm:pt-4">
                  <div className="w-full h-[clamp(180px,22vw,300px)] rounded-[20px] sm:rounded-[28px] md:rounded-[34px] overflow-hidden bg-black/60 border border-[#D7E2EA]/20 relative group shadow-lg">
                    <img
                      src={card.singleImage || card.col1Img1 || card.col2Img}
                      alt={card.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />
                    {card.subtitle && (
                      <div className="absolute bottom-4 left-6 right-6 md:bottom-6 md:left-8 md:right-8 pointer-events-none">
                        <span className="text-white/90 text-sm md:text-base font-medium drop-shadow-md">
                          {card.subtitle}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="pt-4 sm:pt-6 flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-5">
                  <div className="w-full md:w-[40%] flex flex-col gap-3 sm:gap-4 md:gap-5">
                    <div className="w-full h-[clamp(130px,16vw,230px)] rounded-[28px] overflow-hidden bg-black/60 border border-[#D7E2EA]/20 relative group shadow-md">
                      <img
                        src={card.col1Img1}
                        alt={`${card.title} col1 img 1`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="w-full h-[clamp(160px,22vw,340px)] rounded-[28px] overflow-hidden bg-black/60 border border-[#D7E2EA]/20 relative group shadow-md">
                      <img
                        src={card.col1Img2}
                        alt={`${card.title} col1 img 2`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-[60%] h-[clamp(280px,36vw,590px)] md:h-auto rounded-[28px] overflow-hidden bg-black/60 border border-[#D7E2EA]/20 relative group shadow-md flex-1">
                    <img
                      src={card.col2Img}
                      alt={`${card.title} col2 tall`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ExactProjectStack;
