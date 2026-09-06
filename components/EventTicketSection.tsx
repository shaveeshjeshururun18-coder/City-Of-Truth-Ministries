import { useState } from "react";
import AdmitOneTicket, { remixTicketStyle, TICKET_STYLE, playShutterSound } from "@/components/ui/admit-one-ticket";

/**
 * EventTicketSection — showcases the AdmitOneTicket component
 * in the City of Truth Ministries context.
 *
 * Best placed inside:
 *  - MinistriesPage (upcoming events section)
 *  - Home page Hero section (for a "special event" callout)
 *  - EventsPage (if created in the future)
 *
 * Usage example (add to App.tsx or any page component):
 *   import EventTicketSection from "@/components/EventTicketSection";
 *   <EventTicketSection />
 */
export default function EventTicketSection() {
  const [style, setStyle] = useState(TICKET_STYLE);

  const handleRemix = () => {
    playShutterSound();
    setStyle((prev) => remixTicketStyle(prev));
  };

  return (
    <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-[#1a0a00] via-[#2c1200] to-[#0e0500]">
      {/* Subtle background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(239,103,28,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center mb-12">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-400 mb-3 font-semibold">
          City of Truth Ministries
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Upcoming <span className="text-orange-400">Event</span>
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto text-base">
          Join us for an evening of worship, prayer, and community. Your digital
          ticket is ready — hover to feel it come alive.
        </p>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Ticket — scales responsively */}
        <div className="w-full flex justify-center overflow-x-auto pb-4">
          <div style={{ transform: "scale(min(1, calc(100vw / 800px)))", transformOrigin: "top center" }}>
            <AdmitOneTicket
              name="Shabbat Service"
              presenter="City of Truth Ministries presents"
              event="Evening of Worship & Prayer"
              venue="COT Sanctuary, Valparai"
              dates="Every Friday · 6:00 PM"
              stubText="Admit one"
              watermark="COT"
              width={741}
              texture={style.texture}
              gradient={style.gradient}
            />
          </div>
        </div>

        {/* CTA row */}
        <div className="flex flex-wrap gap-4 justify-center mt-2">
          <button
            onClick={handleRemix}
            className="px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm tracking-wide transition-all duration-200 active:scale-95 shadow-lg shadow-orange-900/40"
          >
            🎲 Remix Design
          </button>
          <a
            href="#contact"
            className="px-6 py-3 rounded-full border border-orange-500/50 hover:border-orange-400 text-orange-300 hover:text-orange-200 font-semibold text-sm tracking-wide transition-all duration-200"
          >
            Register Free →
          </a>
        </div>

        <p className="text-xs text-gray-600 mt-1">
          Click &ldquo;Remix Design&rdquo; to generate a new animated shader pattern
        </p>
      </div>
    </section>
  );
}
