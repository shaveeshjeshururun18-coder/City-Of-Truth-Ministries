import React, { forwardRef } from 'react';
import { User } from '../types';
import { HebrewMonth, CalendarDay } from './CalendarLogic';
import { Flame, Star, Flag } from 'lucide-react';

// Month descriptions for cover page
const COVER_MONTH_DESCRIPTIONS = [
    { name: 'Nisan', period: 'March–April', desc: 'Features Passover' },
    { name: 'Iyar', period: 'April–May', desc: '' },
    { name: 'Sivan', period: 'May–June', desc: 'Features Shavuot' },
    { name: 'Tammuz', period: 'June–July', desc: '' },
    { name: 'Av', period: 'July–August', desc: "Features Tisha B'Av" },
    { name: 'Elul', period: 'August–September', desc: '' },
    { name: 'Tishrei', period: 'September–October', desc: 'High Holy Days (Rosh Hashanah, Yom Kippur)' },
    { name: 'Cheshvan', period: 'October–November', desc: '' },
    { name: 'Kislev', period: 'November–December', desc: 'Features Chanukah' },
    { name: 'Tevet', period: 'December–January', desc: '' },
    { name: 'Shevat', period: 'January–February', desc: 'Features Tu Bishvat' },
    { name: 'Adar', period: 'February–March', desc: 'Features Purim' },
];

interface PrintableHebrewCalendarProps {
    mode?: 'cover' | 'month';
    year?: number;
    monthData?: {
        name: string;
        hebrew: string;
        weeks: CalendarDay[][];
    };
    currentUser?: User;
    coverText?: string;
}

export const PrintableHebrewCalendar = forwardRef<HTMLDivElement, PrintableHebrewCalendarProps>((props, ref) => {
    const { mode = 'month', year = 5786, monthData, currentUser, coverText } = props;

    // Cover Page Render
    if (mode === 'cover') {
        return (
            <div ref={ref} className="bg-[#FFFFFa] w-[1122px] min-h-[793px] relative overflow-hidden flex flex-col items-center justify-center text-center p-16 font-serif border-[16px] border-brand-900 double-border">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 bg-[url('/assets/stardust.png')]"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-10">
                    <img src="/brand-logo.png" alt="City of Truth" className="w-56 h-56 object-contain drop-shadow-2xl mb-4" />

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-7xl font-black text-brand-950 uppercase tracking-tighter drop-shadow-sm">City of Truth Ministries</h1>
                            <div className="flex items-center justify-center gap-4">
                                <span className="h-px w-20 bg-amber-500"></span>
                                <h2 className="text-5xl font-bold text-amber-600 drop-shadow-sm">சத்திய நகரம் ஊழியங்கள்</h2>
                                <span className="h-px w-20 bg-amber-500"></span>
                            </div>
                            <p className="text-2xl text-slate-500 font-medium tracking-widest uppercase">Valparai • India</p>
                        </div>
                    </div>

                    <div className="my-8 relative w-full max-w-4xl border-y-2 border-brand-100 py-12 bg-gradient-to-r from-transparent via-brand-50 to-transparent">
                        <div className="text-[180px] leading-none font-black text-brand-900/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">{year}</div>
                        <div className="relative z-10">
                            <div className="text-8xl font-black text-brand-900 tracking-widest mb-2">{year}</div>
                            <div className="text-4xl text-amber-600 font-bold uppercase tracking-[0.3em]">Hebrew Calendar</div>
                        </div>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-left text-xs bg-white/60 p-6 rounded-2xl border border-brand-100 shadow-sm">
                            {COVER_MONTH_DESCRIPTIONS.map((m) => (
                                <div key={m.name} className="flex gap-2">
                                    <span className="font-bold text-brand-900 w-16 shrink-0">{m.name}</span>
                                    <span className="text-slate-500 font-medium">({m.period}): {m.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <img src="/sacred-menorah.png" alt="Sacred Menorah" className="h-32 w-auto drop-shadow-lg opacity-90" />
                    </div>

                    <div className="mt-12 flex items-center justify-center gap-12 w-full">
                        {/* Flags */}
                        <div className="flex flex-col items-center gap-3 drop-shadow-md hover:scale-105 transition-transform">
                            <img src="/assets/israel-flag.png" alt="Israel" className="h-16 w-auto shadow-md rounded-md ring-2 ring-white" />
                            <span className="text-xs font-black tracking-widest text-brand-900 uppercase bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">ISRAEL</span>
                        </div>
                        <div className="h-12 w-px bg-brand-200"></div>
                        <div className="flex flex-col items-center gap-3 drop-shadow-md hover:scale-105 transition-transform">
                            <img src="/assets/india-flag.png" alt="India" className="h-16 w-auto shadow-md rounded-md ring-2 ring-white" />
                            <span className="text-xs font-black tracking-widest text-brand-900 uppercase bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">INDIA</span>
                        </div>
                    </div>
                </div>

                {/* Footer Deco */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-brand-900 flex items-center justify-between px-8">
                    <span className="text-amber-500/50 text-[10px] tracking-[0.5em] uppercase">City of Truth Ministries</span>
                    <span className="text-amber-500/50 text-[10px] tracking-[0.5em] uppercase">{year} / 2026-2027</span>
                </div>
            </div>
        );
    }

    // Month Page Render
    if (!monthData) return null;

    return (
        <div ref={ref} className="bg-white p-8 w-[1122px] min-h-[793px] text-brand-950 font-serif relative overflow-hidden flex flex-col border-8 border-brand-900">
            {/* Watermark Menorah */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[800px] h-[800px]">
                    <path d="M12 2C12 2 12 12 12 12M12 12H8C6.34315 12 5 13.3431 5 15V22H7V15C7 14.4477 7.44772 14 8 14H12M12 12H16C17.6569 12 19 13.3431 19 15V22H17V15C17 14.4477 16.5523 14 16 14H12M12 12V22M2 22H22" stroke="currentColor" strokeWidth="0.5" />
                </svg>
            </div>

            {/* Header */}
            <div className="w-full flex items-start justify-between mb-6 relative z-10 border-b-2 border-amber-500/30 pb-4">
                <div className="flex items-center gap-6 text-left"> {/* Added text-left for safety */}
                    <img src="/brand-logo.png" alt="Logo" className="w-24 h-24 object-contain drop-shadow-md" />
                    <div className="border-l-2 border-slate-200 pl-6 flex items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-black uppercase text-brand-950 leading-none tracking-tight">City of Truth Ministries</h1>
                            <p className="text-2xl font-bold text-amber-600 mt-1">சத்திய நகரம் ஊழியங்கள்</p>
                        </div>
                        <div className="relative">
                            {/* Menorah Flag - Updated for "Pro Max HD" look */}
                            <img
                                src="/menorah-flag-image.png"
                                className="w-32 h-24 object-contain drop-shadow-xl filter brightness-110 hover:scale-105 transition-transform"
                                alt="Menorah Flag"
                            />
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-6xl font-black text-brand-900">{monthData.name}</h2>
                    <p className="text-4xl text-amber-600 font-bold font-serif -mt-2">{monthData.hebrew}</p>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 w-full relative z-10 bg-white/50 backdrop-blur-sm rounded-lg overflow-hidden border border-brand-200 shadow-sm">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 bg-brand-900 text-amber-50 py-1">
                    {[
                        { eng: 'SUN', heb: 'ראשון', trans: 'Yom Rishon', tamil: 'யோம் ரிஷோன்', psalm: 'Ps. 24' },
                        { eng: 'MON', heb: 'שனி', trans: 'Yom Sheni', tamil: 'யோம் ஷேனி', psalm: 'Ps. 48' },
                        { eng: 'TUE', heb: 'שלישי', trans: 'Yom Shlishi', tamil: 'யோம் ஷ்லிஷி', psalm: 'Ps. 82' },
                        { eng: 'WED', heb: 'רביעי', trans: 'Yom Revi\'i', tamil: 'யோம் ரெவிஈ', psalm: 'Ps. 94' },
                        { eng: 'THU', heb: 'חמישי', trans: 'Yom Chamishi', tamil: 'யோம் ஹாமிஷி', psalm: 'Ps. 81' },
                        { eng: 'FRI', heb: 'שישי', trans: 'Yom Shishi', tamil: 'யோம் ஷிஷி', psalm: 'Ps. 93' },
                        { eng: 'SAT', heb: 'שבת', trans: 'Shabbat', tamil: 'ஷப்பாத்', psalm: 'Ps. 92' }
                    ].map(d => (
                        <div key={d.eng} className="py-1 text-center border-r border-brand-800 last:border-0 flex flex-col items-center justify-center">
                            <span className="text-[10px] font-black tracking-widest uppercase">{d.eng}</span>
                            <span className="text-[11px] font-bold text-amber-300 leading-none mt-0.5">{d.heb}</span>
                            <span className="text-[8px] font-medium text-amber-100/70 uppercase tracking-wider leading-none mt-0.5">{d.trans}</span>
                            <span className="text-[8px] font-semibold text-blue-200 leading-none mt-0.5">{d.tamil}</span>
                            <span className="text-[9px] font-bold text-green-300 mt-1">{d.psalm}</span>
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 auto-rows-fr h-full border-l border-b border-brand-200">
                    {monthData.weeks.map((week, wIdx) => (
                        <React.Fragment key={wIdx}>
                            {week.map((dayObj, dIdx) => {
                                const isFri = dIdx === 5;
                                const isSat = dIdx === 6;
                                return (
                                    <div key={dIdx} className={`min-h-[100px] border-r border-b border-brand-200 p-2 relative flex flex-col justify-between ${dayObj.des ? 'bg-amber-50/50' : 'bg-transparent'}`}>
                                        {/* Hebrew/Main Date Number */}
                                        {dayObj.day && (
                                            <div className="flex justify-between items-start z-10">
                                                <span className={`text-2xl font-bold ${isSat ? 'text-amber-600' : 'text-brand-900'}`}>{dayObj.day}</span>
                                            </div>
                                        )}

                                        {/* Icons for Friday (Candles) and Saturday (Symbol) */}
                                        {dayObj.day && isFri && (
                                            <div className="absolute top-2 right-2 w-8 h-8 opacity-90 z-20">
                                                <img src="/assets/friday-symbol.png" alt="Shabbat Candle" className="w-full h-full object-contain" />
                                            </div>
                                        )}
                                        {dayObj.day && isSat && (
                                            <div className="absolute top-2 right-2 w-8 h-8 opacity-90 z-20">
                                                <img src="/assets/saturday-icon.png" alt="Shabbat Symbol" className="w-full h-full object-contain" />
                                            </div>
                                        )}

                                        {/* Festival Names */}
                                        {dayObj.festivals && dayObj.festivals.length > 0 && (
                                            <div className="mt-1 z-10 relative">
                                                {dayObj.festivals.map(f => (
                                                    <div key={f} className="text-[10px] md:text-xs font-bold text-red-600 leading-tight uppercase bg-red-50 p-0.5 rounded mb-0.5 inline-block border border-red-100 shadow-sm">
                                                        {f}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Gregorian Date */}
                                        {dayObj.gregorianDate && (
                                            <div className="absolute bottom-1 right-1 text-[10px] text-slate-400 font-sans font-semibold tracking-wide z-10">
                                                {dayObj.gregorianDate}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-medium px-2 border-t border-slate-100 pt-2">
                <div>Property of City of Truth Ministries, Valparai</div>
                <div>Year {year} / {year - 3760}-{year - 3759}</div>
                <div className="flex gap-4 font-bold">
                    <span>@COTMINISTRIES</span>
                    <span>+91 8056125478</span>
                </div>
            </div>

        </div>
    );
});
