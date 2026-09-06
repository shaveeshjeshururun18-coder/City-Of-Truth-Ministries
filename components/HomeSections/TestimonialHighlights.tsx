import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, MessageSquare } from 'lucide-react';
import { ViewState, User } from '../../types';
import { api } from '../../services/api';
import { TestimonialModal } from '../TestimonialModal';

interface SectionProps {
    setView: (view: ViewState) => void;
    currentUser?: User | null;
}

const TESTIMONIALS = [
    {
        id: 1,
        text: "The Hebrew Hub has completely transformed my understanding of the Scriptures. The depth of teaching and the warmth of community here is truly unlike anything I've experienced.",
        name: 'S. Shaveesh Jeshurun',
        role: 'Member',
        location: 'Valparai',
        avatar: 'S',
        color: '#6366f1'
    },
    {
        id: 2,
        text: "Valparai sanctuary is the most peaceful place for worship. Surrounded by the hills and His presence — I feel closer to God every single time I come here.",
        name: 'Sri Priya',
        role: 'Worshipper',
        location: 'Coimbatore',
        avatar: 'S',
        color: '#8b5cf6'
    },
    {
        id: 3,
        text: "The youth ministry has given me a family and a purpose. The teachings on Hebrew roots have opened a completely new dimension to my walk with God. Thank you COT!",
        name: 'Prasad R.',
        role: 'Youth Leader',
        location: 'Pollachi',
        avatar: 'P',
        color: '#a78bfa'
    },
    {
        id: 4,
        text: "City of Truth Ministries is a rare gem — a place where Scripture comes alive. The Baruch Hashem teachings are profound and life-changing. I am so grateful for this community.",
        name: 'Grace Thangam',
        role: 'Believer',
        location: 'Valparai',
        avatar: 'G',
        color: '#7c3aed'
    },
    {
        id: 5,
        text: "Pastor Lazarus's messages carry such anointing and clarity. Every service leaves me with a deeper hunger for the Word. This ministry is a true lighthouse in the hills.",
        name: 'Emmanuel J.',
        role: 'Regular Attendee',
        location: 'Munnar',
        avatar: 'E',
        color: '#5b21b6'
    }
];

export interface TestimonialItem {
    id: string | number;
    text: string;
    name: string;
    role: string;
    location: string;
    avatar: string;
    color: string;
}

export const TestimonialHighlights: React.FC<SectionProps> = ({ setView, currentUser }) => {
    const [testimonials, setTestimonials] = useState<TestimonialItem[]>(TESTIMONIALS);
    const [active, setActive] = useState(0);
    const [direction, setDirection] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Fetch approved testimonials dynamically
    useEffect(() => {
        let mounted = true;
        api.getTestimonials().then(data => {
            if (!mounted || !data || data.length === 0) return;
            const approved: TestimonialItem[] = data
                .filter(t => t.status === 'Approved' && t.content)
                .map(t => ({
                    id: t.id,
                    text: t.content,
                    name: t.userName || 'Sanctuary Member',
                    role: t.role || 'Member',
                    location: t.location || 'Valparai',
                    avatar: (t.userName || 'M').charAt(0).toUpperCase(),
                    color: '#6366f1'
                }));
            if (approved.length > 0) {
                setTestimonials([...approved, ...TESTIMONIALS]);
            }
        }).catch(err => {
            console.error('Failed to load testimonials:', err);
        });
        return () => { mounted = false; };
    }, []);

    const go = useCallback((idx: number, dir: number) => {
        setDirection(dir);
        setActive(idx);
    }, []);

    const next = useCallback(() => {
        go((active + 1) % testimonials.length, 1);
    }, [active, go, testimonials.length]);

    const prev = useCallback(() => {
        go((active - 1 + testimonials.length) % testimonials.length, -1);
    }, [active, go, testimonials.length]);

    // Auto-scroll every 4s
    useEffect(() => {
        timerRef.current = setInterval(next, 4000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [next]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(next, 4000);
    }, [next]);

    const handlePrev = () => { prev(); resetTimer(); };
    const handleNext = () => { next(); resetTimer(); };

    const t = testimonials[active] || testimonials[0];

    return (
        <section className="relative py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #0f172a 40%, #1e1b4b 100%)' }}>
            {/* Radial glow — matches 2nd image */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(139,92,246,0.28) 0%, rgba(99,102,241,0.12) 45%, transparent 75%)'
            }} />
            {/* Subtle dot pattern */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />

            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white/70 text-[10px] font-black tracking-[0.2em] uppercase mb-8"
                >
                    TESTIMONIALS
                </motion.div>

                {/* Headline */}
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 leading-tight tracking-tight"
                >
                    Lives <span className="italic text-violet-300">Transformed</span><br />
                    <span className="text-white/80">by His Truth.</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-white/50 text-base md:text-lg mb-14 max-w-xl mx-auto leading-relaxed"
                >
                    Real voices from our community — people whose lives have been touched by the Word in Valparai and beyond.
                </motion.p>

                {/* Stacked Card Deck */}
                <div className="relative flex items-center justify-center mb-10" style={{ height: '300px' }}>
                    {/* Left arrow */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-0 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-sm flex items-center justify-center text-white transition-all active:scale-90"
                        aria-label="Previous"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {/* Card stack */}
                    <div className="relative w-full max-w-xl mx-12" style={{ height: '280px' }}>
                        {/* Background deck cards (static stacked layers) */}
                        {[2, 1].map((offset) => (
                            <div
                                key={offset}
                                className="absolute inset-x-0 mx-auto rounded-3xl border border-white/10"
                                style={{
                                    height: '240px',
                                    top: `${offset * 10}px`,
                                    left: `${offset * 10}px`,
                                    right: `${offset * 10}px`,
                                    background: `rgba(255,255,255,${0.04 - offset * 0.01})`,
                                    backdropFilter: 'blur(8px)',
                                    zIndex: 5 - offset,
                                    transform: `rotate(${offset * 1.5}deg)`
                                }}
                            />
                        ))}

                        {/* Active card */}
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, x: direction * 60, rotate: direction * 4 }}
                                animate={{ opacity: 1, x: 0, rotate: 0 }}
                                exit={{ opacity: 0, x: -direction * 60, rotate: -direction * 4 }}
                                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                                className="absolute inset-0 z-10 rounded-3xl p-8 flex flex-col justify-between text-left"
                                style={{
                                    background: 'rgba(255,255,255,0.07)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset'
                                }}
                            >
                                {/* Quote icon */}
                                <div className="absolute top-6 right-7 opacity-20">
                                    <Quote size={36} className="text-violet-300 fill-violet-300" />
                                </div>

                                {/* Quote text */}
                                <p className="text-white/90 text-base md:text-lg leading-relaxed font-medium italic flex-1">
                                    "{t.text}"
                                </p>

                                {/* Author */}
                                <div className="flex items-center gap-3 mt-6">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                                        style={{ background: `${t.color}55`, border: `1.5px solid ${t.color}88` }}
                                    >
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm leading-tight">{t.name}</p>
                                        <p className="text-white/50 text-[11px] uppercase font-black tracking-wider">{t.role} · {t.location}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right arrow */}
                    <button
                        onClick={handleNext}
                        className="absolute right-0 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-sm flex items-center justify-center text-white transition-all active:scale-90"
                        aria-label="Next"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Dot indicators */}
                <div className="flex items-center justify-center gap-2 mb-12">
                    {testimonials.slice(0, 10).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { go(i, i > active ? 1 : -1); resetTimer(); }}
                            className="rounded-full transition-all duration-300"
                            style={{
                                width: i === active ? '24px' : '8px',
                                height: '8px',
                                background: i === active ? '#a78bfa' : 'rgba(255,255,255,0.2)'
                            }}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>

                {/* CTA */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-white/40 text-sm mb-5"
                >
                    Join our growing community of believers in Valparai
                </motion.p>
                <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onClick={() => {
                        if (currentUser) {
                            setShowModal(true);
                        } else {
                            setView(ViewState.CONTACT);
                        }
                    }}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-white/25 bg-white/8 hover:bg-white/15 text-white text-xs font-black tracking-[0.15em] uppercase transition-all backdrop-blur-sm cursor-pointer active:scale-95"
                    style={{ letterSpacing: '0.12em' }}
                >
                    <MessageSquare size={15} />
                    SHARE YOUR TESTIMONY
                </motion.button>
            </div>

            {/* Testimonial Submission Modal for Logged-In Members */}
            {currentUser && (
                <TestimonialModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    user={currentUser}
                />
            )}
        </section>
    );
};
