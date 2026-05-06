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
    ViewState.HEBREW_FESTIVALS,
    ViewState.HEBREW_CALENDAR,
    ViewState.HEBREW_WORDS,
    ViewState.HEBREW_LETTERS_AUDIO,
    ViewState.HEBREW_NUMBERS,
    ViewState.HEBREW_GEMATRIA,
    ViewState.HEBREW_REFERENCE,
]);

const HEBREW_NAV_ITEMS = [
    { id: 'festivals',   label: 'Festivals', Icon: Flame,     view: ViewState.HEBREW_FESTIVALS },
    { id: 'calendar',    label: 'Calendar',  Icon: Calendar,  view: ViewState.HEBREW_CALENDAR },
    { id: 'words',       label: 'Words',     Icon: Type,      view: ViewState.HEBREW_WORDS },
    { id: 'lettersaudio',label: 'Letters',   Icon: Volume2,   view: ViewState.HEBREW_LETTERS_AUDIO },
    { id: 'numbers',     label: 'Numbers',   Icon: Hash,      view: ViewState.HEBREW_NUMBERS },
    { id: 'gematria',    label: 'Gematria',  Icon: Calculator,view: ViewState.HEBREW_GEMATRIA },
    { id: 'reference',   label: 'Ref. Guide',Icon: BookOpen,  view: ViewState.HEBREW_REFERENCE },
] as const;

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
    if (!HEBREW_VIEWS.has(currentView)) return null;

    const activeId = VIEW_TO_NAV_ID[currentView];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            <div className="mx-3 mb-3 bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.16)] border border-white/70 px-2 py-2">
                <div className="flex items-stretch justify-between gap-0.5">
                    {HEBREW_NAV_ITEMS.map((item) => {
                        const isActive = activeId === item.id;
                        const { Icon } = item;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { setView(item.view); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className={`relative flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-2xl flex-1 min-w-0 transition-all duration-300 ${
                                    isActive ? 'bg-amber-50' : 'hover:bg-slate-50'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="hebrew-bottom-pill"
                                        className="absolute inset-0 bg-amber-50 rounded-2xl"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <Icon
                                    size={18}
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                    className={`relative z-10 transition-colors ${isActive ? 'text-amber-600' : 'text-slate-400'}`}
                                />
                                <span className={`relative z-10 text-[8px] font-bold uppercase tracking-wide whitespace-nowrap transition-colors leading-tight ${
                                    isActive ? 'text-amber-600' : 'text-slate-400'
                                }`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="hebrew-nav-dot"
                                        className="relative z-10 w-1 h-1 rounded-full bg-amber-500 mt-0.5"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="h-safe-area-inset-bottom bg-transparent" />
        </div>
    );
};
