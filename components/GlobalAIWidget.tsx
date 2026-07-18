import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MessageCircle, Settings } from 'lucide-react';
import { AIPage } from './AIPage';

interface WidgetConfig {
    title: string;
    subtitle: string;
    prompt: string;
    isVisible: boolean;
}

const DEFAULT_CONFIG: WidgetConfig = {
    title: 'Divine',
    subtitle: 'Ask Scripture',
    prompt: 'Seek guidance ask about ministry',
    isVisible: true
};

export const GlobalAIWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showLabel, setShowLabel] = useState(true);
    const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>(DEFAULT_CONFIG);
    const [showSettings, setShowSettings] = useState(false);

    // Load widget config from localStorage
    useEffect(() => {
        const savedConfig = localStorage.getItem('cot_ai_widget_config');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                setWidgetConfig({ ...DEFAULT_CONFIG, ...config });
            } catch (e) {
                console.error('Failed to load widget config', e);
            }
        }
    }, []);

    // Save widget config to localStorage
    const updateWidgetConfig = (updates: Partial<WidgetConfig>) => {
        const newConfig = { ...widgetConfig, ...updates };
        setWidgetConfig(newConfig);
        localStorage.setItem('cot_ai_widget_config', JSON.stringify(newConfig));
        // Dispatch event so AIPage can update in real-time
        window.dispatchEvent(new CustomEvent('widget-config-updated', { detail: newConfig }));
    };

    // Auto-hide label after 6 seconds
    useEffect(() => {
        setShowLabel(true); // Always show label
    }, []);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        setShowSettings(false);
    };

    // Listen for widget config updates from AIPage
    useEffect(() => {
        const handleConfigUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            setWidgetConfig(customEvent.detail);
        };
        window.addEventListener('update-widget-config', handleConfigUpdate);
        return () => window.removeEventListener('update-widget-config', handleConfigUpdate);
    }, []);

    useEffect(() => {
        const handleTourStart = () => {
            setIsOpen(false);
        };
        window.addEventListener('start-dynamic-tour', handleTourStart);
        return () => window.removeEventListener('start-dynamic-tour', handleTourStart);
    }, []);

    if (!widgetConfig.isVisible) return null;

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
                        className="absolute pointer-events-auto cursor-pointer group"
                    >
                        {/* Label Tooltip - INCREASED SIZE & VISIBILITY */}
                        <AnimatePresence>
                            {(showLabel || isHovered) && (
                                <motion.div
                                    initial={{ opacity: 0, x: 10, scale: 0.8 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: 10, scale: 0.8 }}
                                    className="absolute right-[calc(100%+16px)] top-1/2 -translate-y-1/2 bg-white backdrop-blur-lg text-slate-900 text-sm md:text-base font-black px-6 sm:px-8 py-4 sm:py-5 rounded-3xl shadow-2xl border-2 border-white/90 whitespace-nowrap z-50 pointer-events-none"
                                >
                                    <span className="flex items-center gap-3">
                                        <Sparkles size={18} className="text-amber-600 flex-shrink-0" />
                                        {widgetConfig.subtitle}
                                    </span>
                                    <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white/98 rotate-45"></div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Button Container - Stable Structure */}
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                            {/* Outer Glow/Ripple */}
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-pulse opacity-40"></div>
                            <div className="absolute inset-2 bg-amber-400/20 rounded-full blur-lg animate-pulse opacity-30"></div>

                            {/* Main Circle - Stable */}
                            <motion.div 
                                onClick={toggleOpen}
                                className="relative w-full h-full rounded-full shadow-2xl shadow-amber-500/50 z-10 bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 border-2 sm:border-[3px] border-amber-400/80 overflow-hidden ring-2 sm:ring-4 ring-black/20 flex items-center justify-center"
                                whileHover={{ boxShadow: "0 0 30px rgba(251, 191, 36, 0.6)" }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {/* Sparkle Icon */}
                                <Sparkles className="w-7 h-7 sm:w-9 sm:h-9 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]" />
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Chat Modal - Stable & Attractive */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="pointer-events-auto fixed inset-4 md:inset-auto md:w-[520px] md:h-[680px] md:right-8 md:bottom-24 z-[200] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/80 backdrop-blur-xl"
                    >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/40 via-white to-blue-50/40 -z-10"></div>

                        {/* Modal Header - Professional */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100/80 shrink-0 bg-gradient-to-r from-white/80 to-blue-50/50 backdrop-blur-lg z-20">
                            <div className="flex items-center gap-3.5 select-none">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                                    <Sparkles size={18} className="text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-slate-900 font-serif font-bold text-lg leading-tight">{widgetConfig.title} Assistant</h3>
                                    <span className="text-[11px] text-brand-600 font-semibold tracking-wider flex items-center gap-1.5 mt-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        {widgetConfig.subtitle}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="p-2.5 hover:bg-white/60 rounded-full text-slate-600 hover:text-slate-800 transition-all duration-200 hover:rotate-90"
                                    title="Widget Settings"
                                >
                                    <Settings size={18} strokeWidth={1.5} />
                                </button>
                                <button
                                    onClick={toggleOpen}
                                    className="p-2.5 hover:bg-white/60 rounded-full text-slate-600 hover:text-slate-800 transition-all hover:rotate-90 duration-300"
                                >
                                    <X size={20} strokeWidth={2} />
                                </button>
                            </div>
                        </div>

                        {/* Settings Panel */}
                        <AnimatePresence>
                            {showSettings && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-6 py-4 bg-brand-50/40 border-b border-slate-100 space-y-3 shrink-0"
                                >
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Widget Title</label>
                                        <input
                                            type="text"
                                            value={widgetConfig.title}
                                            onChange={(e) => updateWidgetConfig({ title: e.target.value })}
                                            className="w-full mt-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                                            maxLength={20}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Subtitle/Status</label>
                                        <input
                                            type="text"
                                            value={widgetConfig.subtitle}
                                            onChange={(e) => updateWidgetConfig({ subtitle: e.target.value })}
                                            className="w-full mt-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                                            maxLength={30}
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={widgetConfig.isVisible}
                                                onChange={(e) => updateWidgetConfig({ isVisible: e.target.checked })}
                                                className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                            />
                                            Show Widget on Page
                                        </label>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden relative">
                            <AIPage isWidget={true} onConfigUpdate={updateWidgetConfig} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
