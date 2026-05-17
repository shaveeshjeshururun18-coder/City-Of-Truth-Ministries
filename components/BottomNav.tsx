import React from 'react';
import { Flame, Calendar, Clock3, Type, Volume2, Hash, Calculator, BookOpen, Languages, LucideIcon } from 'lucide-react';
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
    ViewState.HEBREW_CLOCK,
    ViewState.HEBREW_GRAMMAR,
    ViewState.HEBREW_WORDS,
    ViewState.HEBREW_LETTERS_AUDIO,
    ViewState.HEBREW_NUMBERS,
    ViewState.HEBREW_GEMATRIA,
    ViewState.HEBREW_REFERENCE,
]);

const HEBREW_RESOURCE_ITEMS = [
    { id: 'festivals', label: 'Festivals', Icon: Flame, view: ViewState.HEBREW_FESTIVALS },
    { id: 'calendar', label: 'Calendar', Icon: Calendar, view: ViewState.HEBREW_CALENDAR },
    { id: 'clock', label: 'Clock', Icon: Clock3, view: ViewState.HEBREW_CLOCK },
    { id: 'grammar', label: 'Grammar', Icon: Languages, view: ViewState.HEBREW_GRAMMAR },
    { id: 'reference', label: 'Guide', Icon: BookOpen, view: ViewState.HEBREW_REFERENCE },
] as const;

const HEBREW_TOOL_ITEMS = [
    { id: 'words', label: 'Words', Icon: Type, view: ViewState.HEBREW_WORDS },
    { id: 'lettersaudio', label: 'Audio', Icon: Volume2, view: ViewState.HEBREW_LETTERS_AUDIO },
    { id: 'numbers', label: 'Numbers', Icon: Hash, view: ViewState.HEBREW_NUMBERS },
    { id: 'gematria', label: 'Gematria', Icon: Calculator, view: ViewState.HEBREW_GEMATRIA },
] as const;

const VIEW_TO_NAV_ID: Partial<Record<ViewState, string>> = {
    [ViewState.HEBREW_FESTIVALS]:     'festivals',
    [ViewState.ABOUT]:                'calendar',
    [ViewState.HEBREW_TOOLS]:         'words',
    [ViewState.HEBREW_CALENDAR]:      'calendar',
    [ViewState.HEBREW_CLOCK]:         'clock',
    [ViewState.HEBREW_WORDS]:         'words',
    [ViewState.HEBREW_LETTERS_AUDIO]: 'lettersaudio',
    [ViewState.HEBREW_NUMBERS]:       'numbers',
    [ViewState.HEBREW_GEMATRIA]:      'gematria',
    [ViewState.HEBREW_REFERENCE]:     'reference',
    [ViewState.HEBREW_GRAMMAR]:       'grammar',
};

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
    if (!HEBREW_VIEWS.has(currentView)) return null;

    const activeId = VIEW_TO_NAV_ID[currentView];
    const renderGroup = (
        title: string,
        items: ReadonlyArray<{ id: string; label: string; Icon: LucideIcon; view: ViewState }>,
        columns: string
    ) => (
        <div className="space-y-1.5">
            <div className="px-1.5 text-[8px] font-black uppercase tracking-[0.28em] text-slate-400">
                {title}
            </div>
            <div className={`grid ${columns} gap-1.5`}>
                {items.map((item) => {
                    const isActive = activeId === item.id;
                    const { Icon } = item;
                    return (
                        <button
                            key={item.id}
                            onClick={() => { setView(item.view); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="relative min-w-0 min-h-[58px] rounded-[1.1rem] px-1.5 py-2 transition-all duration-200 active:scale-95"
                            aria-label={item.label}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="bnav-active-bg"
                                    className="absolute inset-0 bg-gradient-to-b from-amber-400/20 to-amber-500/10 rounded-[1.1rem]"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                            {isActive && (
                                <motion.div
                                    layoutId="bnav-active-line"
                                    className="absolute top-0 left-2 right-2 h-[2px] bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                            <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
                                <div className="h-6 flex items-center justify-center">
                                    <Icon
                                        size={18}
                                        strokeWidth={isActive ? 2.3 : 1.7}
                                        className={`transition-all duration-200 ${
                                            isActive
                                                ? 'text-amber-600 drop-shadow-[0_1px_4px_rgba(217,119,6,0.35)]'
                                                : 'text-slate-400'
                                        }`}
                                    />
                                </div>
                                <span className={`text-[8px] font-bold uppercase tracking-wide leading-none text-center ${
                                    isActive ? 'text-amber-700' : 'text-slate-400'
                                }`}>
                                    {item.label}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
            <div className="mx-2 mb-2 mt-0 bg-white/96 backdrop-blur-3xl rounded-[1.75rem] shadow-[0_-2px_20px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.12)] border border-slate-100/80 px-2 py-2">
                <div className="space-y-2.5">
                    {renderGroup('Resources', HEBREW_RESOURCE_ITEMS, 'grid-cols-5')}
                    {renderGroup('Tools', HEBREW_TOOL_ITEMS, 'grid-cols-4')}
                </div>
            </div>
            <div className="h-safe-area-inset-bottom bg-transparent" />
        </div>
    );
};
