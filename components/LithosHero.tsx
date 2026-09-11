import React, { useRef } from 'react';

export const BG_IMAGE_1 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=960&q=70';

export const BG_IMAGE_2 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=960&q=70';

export const SPOTLIGHT_R = 260;

export const RevealLayer: React.FC<{ image: string }> = ({ image }) => {
  return (
    <div
      className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
      style={{
        backgroundImage: `url(${image})`,
        maskImage: `radial-gradient(circle ${SPOTLIGHT_R}px at var(--spotlight-x, 50%) var(--spotlight-y, 50%), #fff 0%, #fff 40%, rgba(255,255,255,.75) 60%, rgba(255,255,255,.4) 75%, rgba(255,255,255,.12) 88%, transparent 100%)`,
        WebkitMaskImage: `radial-gradient(circle ${SPOTLIGHT_R}px at var(--spotlight-x, 50%) var(--spotlight-y, 50%), #fff 0%, #fff 40%, rgba(255,255,255,.75) 60%, rgba(255,255,255,.4) 75%, rgba(255,255,255,.12) 88%, transparent 100%)`,
      }}
    />
  );
};

export interface LithosHeroProps {
  onStartDigging?: () => void;
  className?: string;
}

export const LithosHero: React.FC<LithosHeroProps> = ({
  onStartDigging,
  className = '',
}) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const updateSpotlight = (event: React.PointerEvent<HTMLDivElement>) => {
    const hero = heroRef.current;
    if (!hero) return;
    const bounds = hero.getBoundingClientRect();
    hero.style.setProperty('--spotlight-x', `${event.clientX - bounds.left}px`);
    hero.style.setProperty('--spotlight-y', `${event.clientY - bounds.top}px`);
  };

  return (
    <div
      className={`min-h-screen bg-white tracking-[-0.02em] ${className}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Main Hero Section: relative w-full overflow-hidden h-screen bg-black, style={{ height: '100dvh' }} */}
      <section
        ref={heroRef}
        onPointerMove={updateSpotlight}
        className="relative w-full overflow-hidden h-screen bg-black"
        style={{ height: '100dvh' }}
      >
        {/* Layer 1: Base image (z-10) with hero-zoom slow Ken Burns */}
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat z-10 hero-zoom"
          style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
        />

        {/* Layer 2: Reveal layer (z-30) showing BG_IMAGE_2 via cursor spotlight */}
        <RevealLayer image={BG_IMAGE_2} />

        {/* Layer 3: Heading (z-50) */}
        <div className="absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
          <h1 className="text-white leading-[0.95] select-none">
            {/* Line 1: Layers hold */}
            <span
              className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
              style={{
                letterSpacing: '-0.05em',
                animationDelay: '0.25s',
              }}
            >
              Layers hold
            </span>

            {/* Line 2: tales of time */}
            <span
              className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
              style={{
                letterSpacing: '-0.08em',
                animationDelay: '0.42s',
              }}
            >
              tales of time
            </span>
          </h1>
        </div>

        {/* Layer 4: Bottom-left paragraph (z-50) */}
        <div
          className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] hero-anim hero-fade z-50"
          style={{ animationDelay: '0.7s' }}
        >
          <p className="text-sm text-white/80 leading-relaxed">
            Every layer of sediment records a chapter of our planet, from ancient seabeds to drifting ash, layered across millions of years beneath us.
          </p>
        </div>

        {/* Layer 5: Bottom-right block (z-50) */}
        <div
          className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[260px] flex flex-col items-start gap-4 sm:gap-5 hero-anim hero-fade z-50"
          style={{ animationDelay: '0.85s' }}
        >
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Our interactive maps let you peel back the crust to trace how stones, fossils, and deep time combine to shape the ground beneath your feet.
          </p>

          <button
            type="button"
            onClick={onStartDigging}
            className="bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30"
          >
            Start Digging
          </button>
        </div>
      </section>
    </div>
  );
};
