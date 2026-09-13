import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Sparkles, Star, RefreshCw, Scroll, BookOpen } from 'lucide-react';
import { fetchHebrewDate, HebrewDateResult } from '../services/hebrewCalendarService';

interface HebrewCalendarWidgetProps {
    compact?: boolean;
    className?: string;
}

export const HebrewCalendarWidget: React.FC<HebrewCalendarWidgetProps> = ({
    compact = false,
    className = ''
}) => {
    const [data, setData] = useState<HebrewDateResult | null>(null);
    const [loading, setLoading] = useState(true);

    const loadDate = async () => {
        setLoading(true);
        try {
            const res = await fetchHebrewDate();
            setData(res);
        } catch {
            // Handled internally by service fallback
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDate();
    }, []);

    if (compact) {
        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#211b15]/90 border border-[#c9a227]/30 text-xs text-[#ede6d6] shadow-sm backdrop-blur-md ${className}`}>
                <Calendar size={13} className="text-[#e8c468]" />
                {loading ? (
                    <span className="text-[#a5927a] text-[11px] animate-pulse">Loading Hebrew date...</span>
                ) : data ? (
                    <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-[#e8c468]">{data.hebrewDay} {data.hebrewMonth} {data.hebrewYear}</span>
                        <span className="text-[10px] text-[#a5927a] border-l border-white/10 pl-2 font-hebrew">{data.hebrewFormatted}</span>
                    </div>
                ) : null}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`relative rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-[#211b15] to-[#14100c] border border-[#c9a227]/40 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden text-[#ede6d6] ${className}`}
        >
            {/* Top gold accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#e8c468] to-transparent opacity-80" />

            {/* Ambient Background Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#c9a227]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#e8c468]/10 border border-[#e8c468]/30 flex items-center justify-center text-[#e8c468]">
                        <Calendar size={18} />
                    </div>
                    <div>
                        <span className="text-[10px] tracking-widest text-[#c9a227] font-black uppercase block">
                            Biblical Sanctuary Calendar
                        </span>
                        <h4 className="font-serif text-lg font-bold text-white tracking-wide">
                            Lashon HaKodesh Date
                        </h4>
                    </div>
                </div>

                <button
                    onClick={loadDate}
                    title="Refresh Hebrew date"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#a5927a] hover:text-[#ede6d6] transition-colors cursor-pointer"
                    aria-label="Refresh Hebrew Date"
                >
                    <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {loading ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2 text-xs text-[#a5927a] animate-pulse">
                    <div className="w-8 h-8 rounded-full border-2 border-[#c9a227]/30 border-t-[#c9a227] animate-spin mb-1" />
                    <span>Synchronizing Biblical Hebrew calendar...</span>
                </div>
            ) : data ? (
                <div className="space-y-4">
                    {/* Primary Date Banner */}
                    <div className="p-4 rounded-2xl bg-[#17130f] border border-[#c9a227]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <div className="font-serif text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#f3d482] via-[#e8c468] to-[#c9a227]">
                                {data.hebrewDay} {data.hebrewMonth} {data.hebrewYear}
                            </div>
                            <div className="text-xs text-[#a5927a] mt-0.5 font-medium">
                                {data.hebrewMonthTamil}
                            </div>
                        </div>

                        {/* Traditional Hebrew Script */}
                        <div className="text-right sm:border-l sm:border-white/10 sm:pl-4">
                            <span className="text-xl sm:text-2xl font-serif text-[#ede6d6] font-medium tracking-wide">
                                {data.hebrewFormatted}
                            </span>
                            <span className="block text-[10px] text-[#a5927a] uppercase tracking-wider">
                                Sacred Hebrew Reckoning
                            </span>
                        </div>
                    </div>

                    {/* Upcoming Biblical Feast Banner */}
                    {data.upcomingFeast && (
                        <div className="p-3.5 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/30 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <Sparkles size={16} className="text-[#e8c468] shrink-0" />
                                <div>
                                    <span className="text-[10px] text-[#e8c468] font-black uppercase tracking-wider block">
                                        Upcoming Appointed Time (Moed)
                                    </span>
                                    <strong className="text-xs text-white font-bold">
                                        {data.upcomingFeast.name} — <span className="text-[#f3d482]">{data.upcomingFeast.tamilName}</span>
                                    </strong>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-[#c9a227]/20 text-[#f3d482] border border-[#c9a227]/40 shrink-0">
                                {data.upcomingFeast.season}
                            </span>
                        </div>
                    )}
                </div>
            ) : null}
        </motion.div>
    );
};
