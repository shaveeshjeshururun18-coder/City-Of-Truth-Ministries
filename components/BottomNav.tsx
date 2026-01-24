import React from 'react';
import { Home, Hash, Calendar, Flame } from 'lucide-react';
import { ViewState } from '../types';
import { motion } from 'framer-motion';

interface BottomNavProps {
    currentView: ViewState;
    setView: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
    const items = [
        { label: 'Home', view: ViewState.HOME, icon: <Home size={20} /> },
        { label: 'Hub', view: ViewState.ABOUT, icon: <Hash size={20} /> },
        { label: 'Ministries', view: ViewState.MINISTRIES, icon: <Flame size={20} /> },
        { label: 'ID Card', view: ViewState.ID_CARD, icon: <Calendar size={20} /> },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 backdrop-blur-xl border-t border-slate-200 px-4 py-2 flex justify-around items-center shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            {items.map((item) => {
                const isActive = currentView === item.view;
                return (
                    <button
                        key={item.label}
                        onClick={() => setView(item.view)}
                        className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive ? 'text-[#5D5FEF]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                            {item.icon}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                        {isActive && (
                            <motion.div
                                layoutId="bottom-nav-active"
                                className="absolute -bottom-1 w-1 h-1 bg-[#5D5FEF] rounded-full"
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
};
