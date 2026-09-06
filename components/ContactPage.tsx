"use client";
import React, { useRef } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  User as UserIcon,
  Briefcase,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Headset,
  ArrowUpRight,
  HeartHandshake,
  Compass,
} from "lucide-react";
import { User, ViewState } from "../types";
import { Cover } from "./ui/cover";
import { DottedGlowBackground } from "./ui/dotted-glow-background";
import { BackgroundRippleEffect } from "./ui/background-ripple-effect";
import { GlobeToMapTransform } from "./GlobeToMapTransform";
import { ContactCardStack } from "./ContactCardStack";
import { Button } from "./Button";

export interface ContactPageProps {
  currentUser?: User | null;
  contactForm: {
    name: string;
    email: string;
    subject: string;
    message: string;
  };
  setContactForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      email: string;
      subject: string;
      message: string;
    }>
  >;
  handleContactFormSubmit: (e: React.FormEvent) => void;
  setCurrentView?: (view: ViewState) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  currentUser,
  contactForm,
  setContactForm,
  handleContactFormSubmit,
  setCurrentView,
}) => {
  const formRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const scrollToForm = (prefillSubject?: string) => {
    if (prefillSubject) {
      setContactForm((prev) => ({ ...prev, subject: prefillSubject }));
    }
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToMap = () => {
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <DottedGlowBackground className="pt-24 md:pt-32 pb-24 min-h-screen">
      <BackgroundRippleEffect>
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          {/* ======================= HERO SECTION ======================= */}
          <header className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            {/* Top Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-[10px] md:text-xs font-black tracking-widest uppercase mb-6 backdrop-blur-md shadow-lg"
            >
              <Headset size={14} className="text-sky-400" /> DIRECT COMMUNION & PRAYER DESK
            </motion.div>

            {/* Main Headline with Aceternity Cover */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white tracking-tight leading-[1.15] mb-6"
            >
              Your Direct Sanctuary for Prayer, Truth &{" "}
              <Cover className="mt-1 md:mt-0">Divine Connection</Cover>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300/90 leading-relaxed font-normal mb-10 max-w-2xl mx-auto"
            >
              Whether seeking pastoral prayer, guidance for an in-person sanctuary visit to
              Valparai, or Hebrew biblical scholarship—our ministerial team is here for you.
            </motion.p>

            {/* Dual Glowing Pill Buttons (Screenshot 3 style) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12"
            >
              {/* Dark Glowing Pill Button */}
              <a
                href="https://wa.me/918056125478"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-950/90 hover:bg-slate-900 text-white font-bold text-sm tracking-wide border border-slate-700 shadow-[0_0_25px_rgba(30,41,59,0.9)] hover:shadow-[0_0_35px_rgba(99,102,241,0.5)] transition-all flex items-center justify-center gap-3 group cursor-pointer"
              >
                <span>Start WhatsApp Chat</span>
                <ChevronRight
                  size={18}
                  className="text-indigo-400 group-hover:translate-x-1 transition-transform"
                />
              </a>

              {/* Light Glowing Pill Button with Diffused Glow */}
              <button
                onClick={scrollToMap}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_40px_rgba(56,189,248,0.55)] hover:shadow-[0_0_55px_rgba(99,102,241,0.7)] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 group cursor-pointer"
              >
                <span>Browse Sanctuary Map</span>
                <ChevronRight
                  size={18}
                  className="text-sky-600 group-hover:translate-x-1 transition-transform"
                />
              </button>
            </motion.div>

            {/* Quick Channel Badges (Screenshot 3 bottom bar style) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 pt-4 text-xs font-semibold text-slate-400"
            >
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <MessageCircle size={14} className="text-emerald-400" /> WhatsApp Direct
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <Phone size={14} className="text-sky-400" /> +91 80561 25478
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <Mail size={14} className="text-rose-400" /> Verified Response
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <MapPin size={14} className="text-amber-400" /> Valparai, TN (3,500 ft)
              </span>
            </motion.div>
          </header>

          {/* ======================= TWO COLUMN CONTACT & FORM ======================= */}
          <div className="grid lg:grid-cols-12 gap-10 md:gap-12 items-start mb-24">
            {/* Left Column: Instant Channels & Pastoral Info */}
            <div className="lg:col-span-5 space-y-6 text-left">
              {/* Pastoral Sanctuary Direct Connect */}
              <div className="p-8 rounded-[2rem] bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full pointer-events-none" />

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                    COT
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">City of Truth Ministries</h3>
                    <p className="text-xs text-indigo-300 font-medium">Spiritual Altar in Valparai</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  Serving believers across India and the nations with scriptural clarity, Paleo-Hebrew
                  feasts, daily prayer intercession, and fellowship in the presence of Yahweh.
                </p>

                {/* Instant Actions List */}
                <div className="space-y-3">
                  <a
                    href="https://wa.me/918056125478"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-white shadow-lg transition-all group"
                  >
                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center mr-4 shrink-0 shadow-md">
                      <MessageCircle size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <strong className="block text-sm font-bold text-white">Chat on WhatsApp</strong>
                      <span className="text-[11px] text-emerald-300 block truncate">
                        Available 9:00 AM – 6:00 PM IST
                      </span>
                    </div>
                    <ArrowUpRight
                      size={18}
                      className="text-emerald-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all shrink-0"
                    />
                  </a>

                  <a
                    href="tel:+918056125478"
                    className="flex items-center p-4 rounded-2xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-white shadow-lg transition-all group"
                  >
                    <div className="w-10 h-10 bg-sky-500 text-white rounded-xl flex items-center justify-center mr-4 shrink-0 shadow-md">
                      <Phone size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <strong className="block text-sm font-bold text-white">Pastoral Calling Line</strong>
                      <span className="text-[11px] text-sky-300 block truncate">
                        +91 80561 25478 (Direct Support)
                      </span>
                    </div>
                    <ArrowUpRight
                      size={18}
                      className="text-sky-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all shrink-0"
                    />
                  </a>

                  <a
                    href="mailto:faithfulfellowship8@gmail.com"
                    className="flex items-center p-4 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-white shadow-lg transition-all group"
                  >
                    <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center mr-4 shrink-0 shadow-md">
                      <Mail size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <strong className="block text-sm font-bold text-white">Official Mailbox</strong>
                      <span className="text-[11px] text-rose-300 block truncate">
                        faithfulfellowship8@gmail.com
                      </span>
                    </div>
                    <ArrowUpRight
                      size={18}
                      className="text-rose-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all shrink-0"
                    />
                  </a>
                </div>
              </div>

              {/* Service Timings Mini Card */}
              <div className="p-6 rounded-[2rem] bg-slate-900/70 border border-slate-800 flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Clock size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Sanctuary Service Hours</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Sunday Sabbath: 9:30 AM • Wednesday Prayer: 6:30 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Modern Glassmorphic Contact & Prayer Form */}
            <div
              ref={formRef}
              className="lg:col-span-7 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-slate-800/90 p-8 sm:p-10 md:p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl relative overflow-hidden text-left"
            >
              {/* Corner Glow Accent */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="mb-8">
                <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <HeartHandshake size={15} /> DIRECT PETITION / INQUIRY
                </div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">
                  Send Your Prayer Petition or Message
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Every request is prayed over by our intercessory team and treated with confidentiality.
                </p>
              </div>

              <form className="space-y-6 relative z-10" onSubmit={handleContactFormSubmit}>
                {currentUser && (
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-400/30 rounded-xl px-4 py-3">
                    <ShieldCheck size={16} />
                    <span>
                      Submitting as {currentUser.name || "Registered Member"} ({currentUser.id})
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        readOnly={!!currentUser}
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className={`w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-700 outline-none text-sm font-medium transition-all ${
                          currentUser
                            ? "bg-slate-800/60 text-slate-400 cursor-not-allowed"
                            : "bg-slate-950/80 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        type="email"
                        placeholder="john@example.com"
                        readOnly={!!currentUser}
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className={`w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-700 outline-none text-sm font-medium transition-all ${
                          currentUser
                            ? "bg-slate-800/60 text-slate-400 cursor-not-allowed"
                            : "bg-slate-950/80 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Subject Selector */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Subject / Ministry Department
                  </label>
                  <div className="relative">
                    <Briefcase
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <select
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm((prev) => ({ ...prev, subject: e.target.value }))
                      }
                      className="w-full pl-11 pr-10 py-3.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm font-medium text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none cursor-pointer"
                    >
                      <option value="Prayer Request">Prayer Request (Pastoral Intercession)</option>
                      <option value="Ministry Testimony">Share Ministry Testimony / Praise Report</option>
                      <option value="Pastoral Counseling">Pastoral Counseling & Ministry</option>
                      <option value="Sanctuary Visit / Pilgrimage">
                        Sanctuary Visit & Travel Guidance (Valparai)
                      </option>
                      <option value="Hebrew Study / Word Hub">Hebrew Study & Gematria Resources</option>
                      <option value="General Inquiry">General Church Fellowship Inquiry</option>
                    </select>
                    <ChevronRight
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Message Textarea */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Your Message / Petition
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your prayer need, question, or how we may serve you..."
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm((prev) => ({ ...prev, message: e.target.value }))
                    }
                    className="w-full p-4 bg-slate-950/80 border border-slate-700 rounded-xl text-sm font-medium text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                  />
                </div>

                {/* Submit Glowing Button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:shadow-[0_0_45px_rgba(56,189,248,0.7)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Transmit Message to Sanctuary Desk</span>
                  <Send size={15} />
                </button>
              </form>
            </div>
          </div>

          {/* ======================= SCREENSHOT 1: 3D CARD CAROUSEL / TESTIMONIAL DECK ======================= */}
          <div className="mb-24">
            <ContactCardStack onCtaClick={() => scrollToForm("Prayer Request")} />
          </div>

          {/* ======================= v0 GLOBE TO MAP TRANSFORM (MAGIC UI GLOBE) ======================= */}
          <div ref={mapRef} className="mb-12">
            <GlobeToMapTransform />
          </div>
        </div>
      </BackgroundRippleEffect>
    </DottedGlowBackground>
  );
};
export default ContactPage;
