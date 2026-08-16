import React from 'react';
import { Flame, Calendar, Clock3, Type, Volume2, Hash, Calculator, BookOpen, Languages, Globe, LucideIcon, CreditCard, Download, Bell, User as UserIcon } from 'lucide-react';
import { ViewState } from '../types';
import { motion } from 'framer-motion';
import { HEBREW_PAGES } from '../hebrewRegistry';

interface BottomNavProps {
    currentView: ViewState;
    setView: (view: ViewState) => void;
}

const getBNavIconComponent = (iconName: string): LucideIcon => {
    switch (iconName) {
        case 'israel': return Globe;
        case 'festivals': return Flame;
        case 'calendar': return Calendar;
        case 'clock': return Clock3;
        case 'reference': return BookOpen;
        case 'grammar': return Languages;
        case 'alphabet': return BookOpen;
        case 'words': return Type;
        case 'lettersaudio': return Volume2;
        case 'numbers': return Hash;
        case 'gematria': return Calculator;
        default: return BookOpen;
    }
};

const HEBREW_RESOURCE_ITEMS = HEBREW_PAGES.filter(p => p.type === 'content' && !p.isStandalone).map(p => ({
    id: p.id,
    label: p.shortLabel || p.label,
    Icon: getBNavIconComponent(p.iconName),
    view: p.view
}));

const HEBREW_TOOL_ITEMS = HEBREW_PAGES.filter(p => p.type === 'tools').map(p => ({
    id: p.id,
    label: p.shortLabel || p.label,
    Icon: getBNavIconComponent(p.iconName),
    view: p.view
}));

const HEBREW_VIEWS = new Set<ViewState>([
    ...HEBREW_PAGES.map(p => p.view),
    ViewState.ABOUT,
    ViewState.HEBREW_TOOLS,
]);

const VIEW_TO_NAV_ID: Partial<Record<ViewState, string>> = {};
HEBREW_PAGES.forEach(p => {
    VIEW_TO_NAV_ID[p.view] = p.id;
});
VIEW_TO_NAV_ID[ViewState.ABOUT] = 'israel';
VIEW_TO_NAV_ID[ViewState.HEBREW_TOOLS] = 'words';

import { useState, useEffect, useRef } from 'react';

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollYRef = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            if (currentView === ViewState.HOME) {
                setIsVisible(true);
                return;
            }
            const currentScrollY = window.scrollY;
            const lastScrollY = lastScrollYRef.current;
            if (currentScrollY <= 12) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY + 6 && currentScrollY > 90) {
                setIsVisible(false);
            } else if (currentScrollY < lastScrollY - 6) {
                setIsVisible(true);
            }
            lastScrollYRef.current = Math.max(0, currentScrollY);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [currentView]);

    if (currentView === ViewState.HOME || currentView === ViewState.USER_DASHBOARD) {
        return null;
    }

    if (!HEBREW_VIEWS.has(currentView)) {
        const MAIN_NAV_ITEMS = [
            { id: ViewState.HOME, label: 'Home', icon: Globe },
            { id: ViewState.ID_CARD, label: 'My Card', icon: CreditCard },
            { id: ViewState.USER_DASHBOARD, label: 'Downloads', icon: Download },
            { id: ViewState.BARUCH_HASHEM, label: 'Updates', icon: Bell },
            { id: ViewState.USER_DASHBOARD, label: 'Profile', icon: UserIcon },
        ];

        return (
            <div className={`fixed bottom-4 left-0 right-0 z-30 md:hidden flex justify-center transition-transform duration-300 ${!isVisible ? 'translate-y-[150%]' : 'translate-y-0'}`}>
                <div className="w-[92%] max-w-md relative">
                    <div className="bg-slate-950/95 backdrop-blur-2xl rounded-[1.75rem] shadow-2xl border border-slate-800 px-2 py-2">
                        <div className="grid grid-cols-5 gap-1 text-center">
                            {MAIN_NAV_ITEMS.map((item, idx) => {
                                const Icon = item.icon;
                                const isActive = currentView === item.id && (idx !== 2 || currentView === ViewState.USER_DASHBOARD);
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => { setView(item.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        className={`flex flex-col items-center justify-center py-2 rounded-2xl transition-all cursor-pointer ${
                                            isActive
                                                ? 'bg-amber-400 text-slate-950 font-black shadow-md scale-105'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                        }`}
                                    >
                                        <Icon size={18} className={isActive ? 'text-slate-950' : 'text-slate-400'} />
                                        <span className="text-[9px] font-bold tracking-wider mt-1">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const activePage = HEBREW_PAGES.find(p => p.view === currentView);
    const viewType = activePage
        ? activePage.type
        : (currentView === ViewState.ABOUT ? 'content' : 'tools');

    const activeId = VIEW_TO_NAV_ID[currentView];

    const renderGroup = (
        title: string,
        items: ReadonlyArray<{ id: string; label: string; Icon: LucideIcon; view: ViewState }>,
        columns: string
    ) => (
        <div className="space-y-1.5">
            {title && (
                <div className="px-1.5 text-[8px] font-black uppercase tracking-[0.28em] text-slate-400">
                    {title}
                </div>
            )}
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
        <div className={`fixed bottom-4 left-0 right-0 z-30 md:hidden flex justify-center transition-transform duration-300 ${!isVisible ? 'translate-y-[150%]' : 'translate-y-0'}`}>
            <div className="w-[90%] max-w-sm relative">
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
                <div className="bg-white/96 backdrop-blur-3xl rounded-[1.75rem] shadow-[0_-2px_20px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.12)] border border-slate-100/80 px-2 py-2">
                    <div className="space-y-2.5">
                        {viewType === 'content' && renderGroup('', HEBREW_RESOURCE_ITEMS, `grid-cols-${HEBREW_RESOURCE_ITEMS.length}`)}
                        {viewType === 'tools' && renderGroup('', HEBREW_TOOL_ITEMS, `grid-cols-${HEBREW_TOOL_ITEMS.length}`)}
                    </div>
                </div>
            </div>
        </div>
    );
};
