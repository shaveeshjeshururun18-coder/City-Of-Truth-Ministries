import React, { useState } from 'react';
import { Flame, Calendar, Type, Volume2, Hash, Calculator, BookOpen, MoreHorizontal, X } from 'lucide-react';
import { ViewState } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomNavProps {
    currentView: ViewState;
    setView: (view: ViewState) => void;
}

const HEBREW_VIEWS = new Set<ViewState>([
    ViewState.ABOUT,
    ViewState.HEBREW_FESTIVALS,
    ViewState.HEBREW_CALENDAR,
    ViewState.HEBREW_WORDS,
    ViewState.HEBREW_LETTERS_AUDIO,
    ViewState.HEBREW_NUMBERS,
    ViewState.HEBREW_GEMATRIA,
    ViewState.HEBREW_REFERENCE,
]);

// 4 primary tabs always visible + "More"
const PRIMARY_NAV = [
    { id: 'calendar',     label: 'Calendar',  Icon: Calendar,   view: ViewState.HEBREW_CALENDAR },
    { id: 'words',        label: 'Words',     Icon: Type,       view: ViewState.HEBREW_WORDS },
    { id: 'lettersaudio', label: 'Letters',   Icon: Volume2,    view: ViewState.HEBREW_LETTERS_AUDIO },
    { id: 'numbers',      label: 'Numbers',   Icon: Hash,       view: ViewState.HEBREW_NUMBERS },
] as const;

// Overflow items shown in "More" sheet
const MORE_NAV = [
    { id: 'festivals',  label: 'Festivals',  Icon: Flame,      view: ViewState.HEBREW_FESTIVALS },
    { id: 'gematria',   label: 'Gematria',   Icon: Calculator, view: ViewState.HEBREW_GEMATRIA },
    { id: 'reference',  label: 'Ref. Guide', Icon: BookOpen,   view: ViewState.HEBREW_REFERENCE },
] as const;

const ALL_NAV = [...PRIMARY_NAV, ...MORE_NAV];

const VIEW_TO_NAV_ID: Partial<Record<ViewState, string>> = {
    [ViewState.HEBREW_FESTIVALS]:     'festivals',
    [ViewState.HEBREW_CALENDAR]:      'calendar',
    [ViewState.HEBREW_WORDS]:         'words',
    [ViewState.HEBREW_LETTERS_AUDIO]: 'lettersaudio',
    [ViewState.HEBREW_NUMBERS]:       'numbers',
    [ViewState.HEBREW_GEMATRIA]:      'gematria',
    [ViewState.HEBREW_REFERENCE]:     'reference',
};

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
    const [moreOpen, setMoreOpen] = useState(false);

    if (!HEBREW_VIEWS.has(currentView)) return null;

    const activeId = VIEW_TO_NAV_ID[currentView];
    const isMoreActive = MORE_NAV.some(n => n.id === activeId);

    const handleNav = (view: ViewState) => {
        setView(view);
        setMoreOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            {/* "More" sheet overlay */}
            <AnimatePresence>
                {moreOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMoreOpen(false)}
                            className="fixed inset-0 z-[48] bg-black/50 backdrop-blur-sm md:hidden"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed bottom-[72px] left-2 right-2 z-[49] bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 md:hidden"
                        >
                            <div className="flex items-center justify-between mb-3 px-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">More Tools</span>
                                <button onClick={() => setMoreOpen(false)} className="p-1 text-slate-300 hover:text-slate-500 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {MORE_NAV.map(({ id, label, Icon, view }) => {
                                    const isActive = activeId === id;
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => handleNav(view)}
                                            className={`flex flex-col items-center gap-2 py-4 rounded-2xl transition-all ${isActive ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                        >
                                            <Icon size={22} strokeWidth={isActive ? 2.2 : 1.6} />
                                            <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom navigation bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
                <div className="mx-2 mb-2 mt-0 bg-white/97 backdrop-blur-3xl rounded-[1.5rem] shadow-[0_-2px_16px_rgba(0,0,0,0.07),0_6px_24px_rgba(0,0,0,0.1)] border border-slate-100/80 px-2 py-1">
                    <div className="flex items-stretch justify-between" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
                        {/* Primary tabs */}
                        {PRIMARY_NAV.map(({ id, label, Icon, view }) => {
                            const isActive = activeId === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => handleNav(view)}
                                    className="relative flex flex-col items-center justify-center gap-[3px] py-2.5 px-1 rounded-2xl flex-1 min-w-0 transition-all duration-200 active:scale-95"
                                    aria-label={label}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="bnav-active-bg"
                                            className="absolute inset-0 bg-gradient-to-b from-amber-400/15 to-amber-500/8 rounded-2xl"
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    {isActive && (
                                        <motion.div
                                            layoutId="bnav-active-line"
                                            className="absolute top-0 left-3 right-3 h-[2px] bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <Icon
                                        size={19}
                                        strokeWidth={isActive ? 2.3 : 1.5}
                                        className={`relative z-10 transition-all duration-200 ${isActive ? 'text-amber-600' : 'text-slate-400'}`}
                                    />
                                    <span className={`relative z-10 text-[8px] font-bold uppercase tracking-wide whitespace-nowrap leading-none transition-all duration-200 ${isActive ? 'text-amber-700' : 'text-slate-400'}`}>
                                        {label}
                                    </span>
                                </button>
                            );
                        })}

                        {/* "More" tab */}
                        <button
                            onClick={() => setMoreOpen(v => !v)}
                            className="relative flex flex-col items-center justify-center gap-[3px] py-2.5 px-1 rounded-2xl flex-1 min-w-0 transition-all duration-200 active:scale-95"
                            aria-label="More"
                        >
                            {isMoreActive && (
                                <motion.div
                                    layoutId="bnav-active-bg"
                                    className="absolute inset-0 bg-gradient-to-b from-amber-400/15 to-amber-500/8 rounded-2xl"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                            <MoreHorizontal
                                size={19}
                                strokeWidth={1.5}
                                className={`relative z-10 transition-colors duration-200 ${isMoreActive || moreOpen ? 'text-amber-600' : 'text-slate-400'}`}
                            />
                            <span className={`relative z-10 text-[8px] font-bold uppercase tracking-wide leading-none transition-colors duration-200 ${isMoreActive || moreOpen ? 'text-amber-700' : 'text-slate-400'}`}>
                                More
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
