import React from 'react';
import { Flame, Calendar, Type, Volume2, Hash, Calculator, BookOpen } from 'lucide-react';
import { ViewState } from '../types';
import { motion } from 'framer-motion';

interface BottomNavProps {
    currentView: ViewState;
    setView: (view: ViewState) => void;
}

const HEBREW_VIEWS = new Set<ViewState>([
    ViewState.ABOUT,
    ViewState.HEBREW_TOOLS,
    ViewState.HEBREW_FESTIVALS,
    ViewState.HEBREW_CALENDAR,
    ViewState.HEBREW_WORDS,
    ViewState.HEBREW_LETTERS_AUDIO,
    ViewState.HEBREW_NUMBERS,
    ViewState.HEBREW_GEMATRIA,
    ViewState.HEBREW_REFERENCE,
]);

const HEBREW_NAV_ITEMS = [
    { id: 'festivals',    label: 'Festivals', Icon: Flame,      view: ViewState.HEBREW_FESTIVALS },
    { id: 'calendar',     label: 'Calendar',  Icon: Calendar,   view: ViewState.HEBREW_CALENDAR },
    { id: 'words',        label: 'Words',     Icon: Type,       view: ViewState.HEBREW_WORDS },
    { id: 'lettersaudio', label: 'Letters',   Icon: Volume2,    view: ViewState.HEBREW_LETTERS_AUDIO },
    { id: 'numbers',      label: 'Numbers',   Icon: Hash,       view: ViewState.HEBREW_NUMBERS },
    { id: 'gematria',     label: 'Gematria',  Icon: Calculator, view: ViewState.HEBREW_GEMATRIA },
    { id: 'reference',    label: 'Ref. Guide',Icon: BookOpen,   view: ViewState.HEBREW_REFERENCE },
] as const;

const VIEW_TO_NAV_ID: Partial<Record<ViewState, string>> = {
    [ViewState.HEBREW_FESTIVALS]:     'festivals',
    [ViewState.ABOUT]:                'calendar',
    [ViewState.HEBREW_TOOLS]:         'words',
    [ViewState.HEBREW_CALENDAR]:      'calendar',
    [ViewState.HEBREW_WORDS]:         'words',
    [ViewState.HEBREW_LETTERS_AUDIO]: 'lettersaudio',
    [ViewState.HEBREW_NUMBERS]:       'numbers',
    [ViewState.HEBREW_GEMATRIA]:      'gematria',
    [ViewState.HEBREW_REFERENCE]:     'reference',
    [ViewState.HEBREW_GRAMMAR]:       'reference',
};

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
    if (!HEBREW_VIEWS.has(currentView)) return null;

    const activeId = VIEW_TO_NAV_ID[currentView];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Gradient separator */}
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
            <div className="mx-2 mb-2 mt-0 bg-white/96 backdrop-blur-3xl rounded-[1.75rem] shadow-[0_-2px_20px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.12)] border border-slate-100/80 px-1.5 py-1.5">
                <div className="flex items-stretch justify-between">
                    {HEBREW_NAV_ITEMS.map((item) => {
                        const isActive = activeId === item.id;
                        const { Icon } = item;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { setView(item.view); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="relative flex flex-col items-center justify-center gap-[3px] py-2 px-0.5 rounded-[1.25rem] flex-1 min-w-0 transition-all duration-200 active:scale-95"
                                aria-label={item.label}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="bnav-active-bg"
                                        className="absolute inset-0 bg-gradient-to-b from-amber-400/20 to-amber-500/10 rounded-[1.25rem]"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                                {/* Top accent line for active tab */}
                                {isActive && (
                                    <motion.div
                                        layoutId="bnav-active-line"
                                        className="absolute top-0 left-2 right-2 h-[2px] bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <Icon
                                    size={20}
                                    strokeWidth={isActive ? 2.4 : 1.6}
                                    className={`relative z-10 transition-all duration-200 ${
                                        isActive
                                            ? 'text-amber-600 drop-shadow-[0_1px_4px_rgba(217,119,6,0.35)]'
                                            : 'text-slate-400'
                                    }`}
                                />
                                <span className={`relative z-10 text-[8.5px] font-bold uppercase tracking-wide whitespace-nowrap transition-all duration-200 leading-none ${
                                    isActive ? 'text-amber-700' : 'text-slate-400'
                                }`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="h-safe-area-inset-bottom bg-transparent" />
        </div>
    );
};
