import React from 'react';
import { Home, Languages, Heart, CreditCard, Scroll } from 'lucide-react';
import { ViewState } from '../types';
import { motion } from 'framer-motion';

interface BottomNavProps {
    currentView: ViewState;
    setView: (view: ViewState) => void;
}

const NAV_ITEMS = [
    { label: 'Home',       view: ViewState.HOME,       icon: Home,       size: 22 },
    { label: 'Hebrew',     view: ViewState.ABOUT,      icon: Languages,  size: 22 },
    { label: 'Ministries', view: ViewState.MINISTRIES, icon: Heart,      size: 22, center: true },
    { label: 'Aleph-Bet',  view: ViewState.HEBREW_LETTERS_AUDIO, icon: Scroll, size: 22 },
    { label: 'ID Card',    view: ViewState.ID_CARD,    icon: CreditCard, size: 22 },
];

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Glass bar */}
            <div className="mx-3 mb-3 bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.14)] border border-white/60 px-2 py-1.5 flex justify-around items-end">
                {NAV_ITEMS.map((item) => {
                    const isActive = currentView === item.view;
                    const Icon = item.icon;

                    if (item.center) {
                        return (
                            <button
                                key={item.label}
                                onClick={() => setView(item.view)}
                                className="relative flex flex-col items-center -mt-5"
                            >
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center shadow-lg transition-all duration-300 ${
                                        isActive
                                            ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/40 shadow-[0_8px_20px]'
                                            : 'bg-gradient-to-br from-blue-600 to-blue-800 shadow-blue-700/30 shadow-[0_6px_16px]'
                                    }`}
                                >
                                    <Icon size={26} strokeWidth={2} className="text-white" />
                                </motion.div>
                                <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    }

                    return (
                        <button
                            key={item.label}
                            onClick={() => setView(item.view)}
                            className="relative flex flex-col items-center gap-0.5 px-1 py-1 min-w-[52px]"
                        >
                            {/* Active pill background */}
                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-pill"
                                    className="absolute inset-0 rounded-2xl bg-blue-50"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <motion.div
                                whileTap={{ scale: 0.85 }}
                                className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 ${
                                    isActive ? 'text-blue-600' : 'text-slate-400'
                                }`}
                            >
                                <Icon size={item.size} strokeWidth={isActive ? 2.5 : 1.8} />
                            </motion.div>
                            <span className={`relative z-10 text-[9px] font-bold uppercase tracking-wide transition-colors duration-300 ${
                                isActive ? 'text-blue-600' : 'text-slate-400'
                            }`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-dot"
                                    className="relative z-10 w-1 h-1 rounded-full bg-blue-600 mt-0.5"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
            {/* Safe-area spacer */}
            <div className="h-safe-area-inset-bottom bg-transparent" />
        </div>
    );
};
