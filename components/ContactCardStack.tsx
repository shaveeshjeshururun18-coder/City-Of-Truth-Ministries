"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote, Send, ShieldCheck, Heart } from "lucide-react";

interface TestimonialCardItem {
  id: number;
  name: string;
  role: string;
  location: string;
  quote: string;
  rating: number;
  avatarText: string;
  category: string;
}

const CARDS: TestimonialCardItem[] = [
  {
    id: 1,
    name: "S. Shaveesh Jeshurun",
    role: "Member & Tech Contributor",
    location: "Valparai / Chennai",
    category: "Spiritual Breakthrough",
    rating: 5,
    avatarText: "SJ",
    quote:
      "This ministry and the Hebrew teachings under Pastor Baruch completely transformed my spiritual walk. The presence of God in Valparai is unlike anything I have ever experienced.",
  },
  {
    id: 2,
    name: "Sri Priya",
    role: "Worshipper & Visitor",
    location: "Tamil Nadu",
    category: "Answered Prayer",
    rating: 5,
    avatarText: "SP",
    quote:
      "Submitted a prayer request for healing during a difficult season. The pastoral intercession and continuous fellowship brought peace, divine intervention, and complete victory.",
  },
  {
    id: 3,
    name: "Prasad R",
    role: "Youth Volunteer",
    location: "Pollachi",
    category: "Community & Discipleship",
    rating: 5,
    avatarText: "PR",
    quote:
      "From the hill-top sanctuary to the worldwide Hebrew broadcasts, City of Truth is raising a generation rooted in the uncompromised scriptures. Blessed to serve here.",
  },
  {
    id: 4,
    name: "Dr. Jonathan David",
    role: "Global Believer",
    location: "United Kingdom",
    category: "Hebrew Word Hub",
    rating: 5,
    avatarText: "JD",
    quote:
      "The online Gematria, Paleo-Hebrew resources, and Sabbath livestreams connect our family from thousands of miles away as if we were sitting right inside the sanctuary.",
  },
];

export interface ContactCardStackProps {
  onCtaClick?: () => void;
}

export const ContactCardStack: React.FC<ContactCardStackProps> = ({ onCtaClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? CARDS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === CARDS.length - 1 ? 0 : prev + 1));
  };

  const activeCard = CARDS[currentIndex];

  return (
    <div className="w-full relative py-12 px-4 flex flex-col items-center justify-center">
      {/* Background Soft Indigo Radial Spotlight Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[400px] bg-gradient-to-r from-indigo-600/25 via-sky-500/20 to-purple-600/25 blur-[120px] rounded-full" />
      </div>

      {/* Pill Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-indigo-300 text-[10px] font-black tracking-widest uppercase mb-6 shadow-md backdrop-blur-md">
        <Heart size={12} className="text-rose-400 fill-rose-400" /> VOICES OF FAITH & TESTIMONY
      </div>

      {/* Title & Subtitle */}
      <h3 className="text-3xl md:text-5xl font-serif font-bold text-white text-center max-w-2xl mb-4 tracking-tight">
        Loved by worshippers and families worldwide.
      </h3>
      <p className="text-sm md:text-base text-slate-400 text-center max-w-xl mb-12">
        Real experiences from souls whose lives have been anchored in truth, prayer, and pastoral care.
      </p>

      {/* 3D Stacked Card Container with Navigation Chevrons */}
      <div className="relative w-full max-w-2xl flex items-center justify-center min-h-[260px] md:min-h-[290px]">
        {/* Left Chevron Button */}
        <button
          onClick={handlePrev}
          aria-label="Previous Testimonial"
          className="absolute -left-3 md:-left-12 z-30 w-11 h-11 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-600 flex items-center justify-center shadow-xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Right Chevron Button */}
        <button
          onClick={handleNext}
          aria-label="Next Testimonial"
          className="absolute -right-3 md:-right-12 z-30 w-11 h-11 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-600 flex items-center justify-center shadow-xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>

        {/* Layered Card 3 (Bottom) */}
        <div className="absolute w-[86%] h-[90%] rounded-[2rem] bg-white/20 border border-white/30 transform translate-y-6 scale-95 shadow-md pointer-events-none opacity-40 blur-xs" />

        {/* Layered Card 2 (Middle) */}
        <div className="absolute w-[93%] h-[95%] rounded-[2rem] bg-white/40 border border-white/50 transform translate-y-3 scale-98 shadow-lg pointer-events-none opacity-70" />

        {/* Top Active Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCard.id}
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative z-20 w-full bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900 rounded-[2.2rem] p-8 md:p-10 shadow-2xl border border-white/80"
          >
            {/* Card Category and Stars */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                {activeCard.category}
              </span>
              <div className="flex items-center gap-1">
                {[...Array(activeCard.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="text-amber-500 fill-amber-500"
                  />
                ))}
              </div>
            </div>

            {/* Quote Body */}
            <div className="relative mb-6">
              <Quote className="absolute -top-3 -left-3 text-indigo-200/50 w-8 h-8 pointer-events-none" />
              <p className="text-base md:text-lg font-serif italic text-slate-700 leading-relaxed pl-3">
                "{activeCard.quote}"
              </p>
            </div>

            {/* Author Profile */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-200/70">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
                {activeCard.avatarText}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base leading-tight">
                  {activeCard.name}
                </h4>
                <p className="text-xs text-slate-500">
                  {activeCard.role} • <span className="text-indigo-600 font-medium">{activeCard.location}</span>
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Subtext and Glowing Pill Button */}
      <div className="mt-10 flex flex-col items-center gap-4 text-center">
        <p className="text-xs md:text-sm text-slate-400 font-medium">
          Join 2,000+ believers and families who fellowship with us daily.
        </p>
        <button
          onClick={onCtaClick}
          className="relative group px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_35px_rgba(99,102,241,0.55)] cursor-pointer overflow-hidden"
        >
          {/* Glowing button background */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-600 rounded-full" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-sky-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-sm" />
          <span className="relative z-10 flex items-center gap-2">
            SEND PRAYER PETITION <Send size={14} />
          </span>
        </button>
      </div>
    </div>
  );
};
export default ContactCardStack;
