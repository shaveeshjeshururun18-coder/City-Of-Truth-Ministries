import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MessageCircle } from 'lucide-react';
import { AIPage } from './AIPage';

export const GlobalAIWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showLabel, setShowLabel] = useState(true);
    // Auto-hide label after 8 seconds
    useEffect(() => {
        const timer = setTimeout(() => setShowLabel(false), 8000);
        return () => clearTimeout(timer);
    }, []);

    const toggleOpen = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleTourStart = () => {
            // Close the widget when a dynamic tour starts
            setIsOpen(false);
        };
        window.addEventListener('start-dynamic-tour', handleTourStart);
        return () => window.removeEventListener('start-dynamic-tour', handleTourStart);
    }, []);

    return (
        <>
            <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
                {/* Draggable Widget Button */}
                {!isOpen && (
                    <motion.div
                        initial={{ bottom: 30, right: 30 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onHoverStart={() => setIsHovered(true)}
                        onHoverEnd={() => setIsHovered(false)}
                        onClick={toggleOpen}
                        className="absolute pointer-events-auto cursor-pointer group"
                    >
                        {/* Label Tooltip */}
                        <AnimatePresence>
                            {(showLabel || isHovered) && (
                                <motion.div
                                    initial={{ opacity: 0, x: 10, scale: 0.8 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: 10, scale: 0.8 }}
                                    className="absolute right-[calc(100%+16px)] top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-xl border border-white/50 whitespace-nowrap z-0 pointer-events-none"
                                >
                                    <span className="flex items-center gap-2">
                                        Need help? <span className="text-amber-600">Ask AI</span>
                                    </span>
                                    <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white/90 rotate-45"></div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Button Container - Magnificent Glow */}
                        <div className="relative w-14 h-14 sm:w-20 sm:h-20">
                            {/* Outer Glow/Ripple */}
                            <div className="absolute inset-0 bg-amber-500/30 rounded-full animate-ping"></div>
                            <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl animate-pulse"></div>

                            {/* Main Circle */}
                            <div className="relative w-full h-full rounded-full shadow-2xl shadow-amber-500/40 z-10 bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 border-2 sm:border-[3px] border-amber-400 overflow-hidden ring-2 sm:ring-4 ring-black/20">
                                {/* Sparkle Icon */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Chat Modal - Full Screen / Large Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="pointer-events-auto fixed inset-4 md:inset-auto md:w-[500px] md:h-[600px] md:right-10 md:bottom-24 z-[200] bg-brand-950/90 backdrop-blur-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-white/10"
                    >
                        {/* Background Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/90 via-brand-900/90 to-black/90 -z-10"></div>

                        {/* Modal Header - ChatGPT Style */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0 bg-white/5 backdrop-blur-xl z-20">
                            <div className="flex items-center gap-3 select-none">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center shadow-lg">
                                    <Sparkles size={16} className="text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-white font-serif font-bold text-lg leading-none">Divine AI Assistant</h3>
                                    <span className="text-[10px] text-accent-300 font-medium tracking-wider flex items-center gap-1 mt-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        Online & Ready
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={toggleOpen}
                                className="p-2 hover:bg-white/10 rounded-full text-brand-200 hover:text-white transition-all hover:rotate-90 duration-300"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden relative">
                            <AIPage isWidget={true} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
