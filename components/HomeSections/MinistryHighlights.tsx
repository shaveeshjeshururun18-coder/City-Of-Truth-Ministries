import React from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { ViewState } from '../../types';
import { DeuteronomyCircleGraphic } from '../DeuteronomyCircleGraphic';
import { CoverFlowCarousel, CarouselItem } from '../ui/3-d-coverflow-carousel';

const useSectionInfo = (sectionId: string, defaultName: string, defaultDesc: string) => {
    return React.useMemo(() => {
        try {
            const saved = localStorage.getItem('cot_sections_info');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed[sectionId]) {
                    return {
                        name: parsed[sectionId].name || defaultName,
                        desc: parsed[sectionId].desc || defaultDesc
                    };
                }
            }
        } catch {}
        return { name: defaultName, desc: defaultDesc };
    }, [sectionId, defaultName, defaultDesc]);
};

interface SectionProps {
    setView: (view: ViewState) => void;
}

export const MinistryHighlights: React.FC<SectionProps> = ({ setView }) => {
    const { name, desc } = useSectionInfo('highlights', 'Our Ministries', 'A Legacy of Service and Faith');

    const handleCtaClick = (item: CarouselItem) => {
        setView(ViewState.MINISTRIES);
    };

    return (
        <section className="py-20 bg-[#070a14] text-white overflow-hidden relative border-y border-amber-500/10">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="container mx-auto px-6 mb-6">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 max-w-7xl mx-auto">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-300 border border-amber-400/20 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4 backdrop-blur-md"
                        >
                            <Star size={12} className="text-amber-400" fill="currentColor" />
                            {name}
                        </motion.div>
                        <h2 className="text-4xl md:text-6xl font-serif font-black text-white leading-[0.9] tracking-tighter">
                            {desc}
                        </h2>
                    </div>
                    <button
                        onClick={() => setView(ViewState.MINISTRIES)}
                        className="group flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-8 py-4 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-xl shadow-amber-500/25 cursor-pointer shrink-0"
                    >
                        Explore All Ministries
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* 3D CoverFlow Carousel Showcase */}
            <div className="w-full shadow-2xl">
                <CoverFlowCarousel
                    sectionLabel="MINISTRY WINGS SHOWCASE"
                    onCtaClick={handleCtaClick}
                />
            </div>

            {/* Deuteronomy 4:35 Circular Sacred Graphic Section */}
            <div className="mt-12 container mx-auto px-6 max-w-6xl">
                <div className="bg-gradient-to-br from-amber-500/10 via-slate-900/60 to-black/80 rounded-[3rem] p-8 md:p-12 border-2 border-amber-400/30 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10 backdrop-blur-xl">
                    <div className="max-w-xl space-y-4 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 bg-amber-400/10 text-amber-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-amber-400/30">
                            📜 Sacred Truth Scripture
                        </div>
                        <h3 className="text-3xl md:text-5xl font-serif font-black text-white leading-tight">
                            EIN OD MIL'VADO <br />
                            <span className="text-amber-400">אין עוד מלבדו</span>
                        </h3>
                        <p className="text-slate-300 text-sm md:text-base leading-relaxed font-normal">
                            "You have been shown these things to know that Yahweh He is God; there is nothing besides Him." — Deuteronomy 4:35. Discover the foundational truth of our faith and study the sacred Hebrew Scriptures.
                        </p>
                        <button
                            onClick={() => setView(ViewState.HEBREW)}
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/30 cursor-pointer active:scale-95"
                        >
                            Explore Hebrew Language & Study →
                        </button>
                    </div>

                    <div className="shrink-0">
                        <DeuteronomyCircleGraphic size={300} />
                    </div>
                </div>
            </div>
        </section>
    );
};