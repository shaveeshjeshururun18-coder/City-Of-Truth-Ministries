"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe as GlobeIcon, MapPin, Compass, Navigation, ExternalLink, Mountain, Clock, Sparkles } from "lucide-react";
import { Globe } from "./ui/globe";
import { Button } from "./Button";

export const GlobeToMapTransform: React.FC = () => {
  const [viewMode, setViewMode] = useState<"globe" | "map">("globe");

  return (
    <div className="w-full rounded-[2.5rem] bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl p-6 md:p-10 shadow-2xl relative overflow-hidden text-slate-100">
      {/* Radiant ambient background blur */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header with Mode Toggle Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-[11px] font-bold tracking-widest uppercase mb-2">
            <Compass size={14} className="animate-spin-slow" /> GLOBAL TO LOCAL PRESENCE
          </div>
          <h3 className="text-2xl md:text-3xl font-bold font-serif text-white flex items-center gap-2">
            {viewMode === "globe" ? "Worldwide Prayer Network" : "Valparai Sanctuary Sanctuary Grounds"}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {viewMode === "globe"
              ? "Connecting believers worldwide to the spiritual altar in Valparai, Tamil Nadu & Jerusalem."
              : "Located amidst the tranquil mist of Anamalai Hills, Western Ghats at 3,500 ft elevation."}
          </p>
        </div>

        {/* View Switcher Pill Buttons */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode("globe")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === "globe"
                ? "bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-lg shadow-indigo-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GlobeIcon size={14} /> 3D Globe
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === "map"
                ? "bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-lg shadow-indigo-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MapPin size={14} /> Sanctuary Map
          </button>
        </div>
      </div>

      {/* Dynamic Transform View */}
      <AnimatePresence mode="wait">
        {viewMode === "globe" ? (
          <motion.div
            key="globe-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="grid lg:grid-cols-12 gap-8 items-center relative z-10"
          >
            {/* Left Globe Details */}
            <div className="lg:col-span-5 space-y-5 text-left order-2 lg:order-1">
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-sky-400 font-bold uppercase tracking-wider">
                  <span>Primary Altar Node</span>
                  <span className="flex items-center gap-1"><Sparkles size={12} /> Active Beacon</span>
                </div>
                <h4 className="text-lg font-bold text-white">Valparai Sanctuary (Tamil Nadu)</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Coordinates: <span className="font-mono text-slate-300">10.3275° N, 76.9404° E</span>
                  <br />
                  Spiritual sanctuary nestled in the tea estates and misty heights of Anamalai Hills.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-400 font-bold uppercase tracking-wider">
                  <span>Hebrew Foundation</span>
                  <span>Mount Zion</span>
                </div>
                <h4 className="text-lg font-bold text-white">Jerusalem Connection</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ancient Paleo-Hebrew biblical scholarship, feasts of Yahweh, and prophetic revelation.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setViewMode("map")}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-sky-500/20 hover:scale-105 transition-all"
                >
                  <MapPin size={15} /> Zoom to Valparai Map
                </button>
                <a
                  href="https://maps.google.com/?q=Valparai,Tamil+Nadu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
                >
                  Open External GPS <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Right Magic UI Globe */}
            <div className="lg:col-span-7 flex items-center justify-center order-1 lg:order-2">
              <Globe />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="map-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="grid lg:grid-cols-12 gap-8 items-stretch relative z-10"
          >
            {/* Left Interactive Map Embed */}
            <div className="lg:col-span-7 h-[380px] md:h-[460px] rounded-3xl overflow-hidden border-2 border-slate-800 relative shadow-2xl">
              <iframe
                title="Valparai Sanctuary Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15685.83603417646!2d76.9404285871582!3d10.327499999999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba85d7d3f1d2b7f%3A0x6b0b8b0b8b0b8b0b!2sValparai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1710336000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "contrast(1.05) brightness(0.95)" }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
              <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono text-sky-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                10.3275° N, 76.9404° E • 3,500 ft
              </div>
            </div>

            {/* Right Location & Transit Guide */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4 text-left">
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase">
                    <Mountain size={16} /> Physical Address
                  </div>
                  <h4 className="text-base font-bold text-white">City of Truth Ministries</h4>
                  <p className="text-xs text-slate-300">
                    New Market, Valparai, Coimbatore District, Tamil Nadu – 642127, India
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase">
                    <Clock size={16} /> Sanctuary Services
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p><strong className="text-white">Sunday Sabbath:</strong> 9:30 AM – 1:00 PM</p>
                    <p><strong className="text-white">Midweek Word & Prayer:</strong> Wednesday 6:30 PM</p>
                    <p><strong className="text-white">Monthly Hebrew Feasts:</strong> Announced per Hebrew Calendar</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase">
                    <Navigation size={16} /> Transit Route Guide
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>From Pollachi:</strong> 64 km via 40 hair-pin bends (TNSTC bus every 30 mins).<br />
                    <strong>From Coimbatore:</strong> 105 km (Airport/Railway junction).
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Valparai,Tamil+Nadu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform"
                >
                  <Navigation size={16} /> Start Turn-by-Turn GPS Navigation
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default GlobeToMapTransform;
