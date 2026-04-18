import React, { useState } from 'react';
import { X, Calendar, Download, FileText, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { getCalendarData5786 } from './CalendarLogic';

interface CalendarCustomizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDownload: (options: CalendarOptions) => void;
    isProcessing: boolean;
}

export interface CalendarOptions {
    scope: 'full' | 'single';
    monthIndex?: number; // 0-12
    includeCover: boolean;
    customCoverText: string;
}

export const CalendarCustomizationModal: React.FC<CalendarCustomizationModalProps> = ({ isOpen, onClose, onDownload, isProcessing }) => {
    const [options, setOptions] = useState<CalendarOptions>({
        scope: 'full',
        monthIndex: 0, // Tishrei default? Or current month? Tishrei is 0 in our logic usually? Wait, Tishrei is usually index 6 in standard arrays if Nisan is 0, let's check logic.
        // In CalendarLogic, 5786 Tishrei is index 0 for the civil year start? 
        // Let's assume the dropdown will map correctly to the index needed by CalendarLogic.
        includeCover: true,
        customCoverText: ''
    });

    const calendarData = getCalendarData5786(); // Get months for dropdown

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="bg-brand-900 p-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg text-amber-500">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Customize Calendar</h3>
                            <p className="text-brand-200 text-xs">Year 5786 (2025-2026)</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 space-y-8 overflow-y-auto">

                    {/* Scope Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Download Scope</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setOptions({ ...options, scope: 'full' })}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${options.scope === 'full'
                                    ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-200 ring-offset-1'
                                    : 'border-slate-100 hover:border-brand-200 text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="w-8 h-8 rounded-full bg-current opacity-10 flex items-center justify-center mb-1">
                                    <FileText size={16} />
                                </div>
                                <span className="font-bold">Full Year 5786</span>
                                <span className="text-[10px] opacity-60">Cover + 12-13 Months</span>
                            </button>

                            <button
                                onClick={() => setOptions({ ...options, scope: 'single' })}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${options.scope === 'single'
                                    ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-200 ring-offset-1'
                                    : 'border-slate-100 hover:border-brand-200 text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="w-8 h-8 rounded-full bg-current opacity-10 flex items-center justify-center mb-1">
                                    <Calendar size={16} />
                                </div>
                                <span className="font-bold">Single Month</span>
                                <span className="text-[10px] opacity-60">Select Specific Month</span>
                            </button>
                        </div>
                    </div>

                    {/* Month Selector (Conditional) */}
                    <AnimatePresence>
                        {options.scope === 'single' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider block mb-2">Select Month</label>
                                <select
                                    value={options.monthIndex}
                                    onChange={(e) => setOptions({ ...options, monthIndex: Number(e.target.value) })}
                                    className="w-full p-4 rounded-xl border border-slate-200 font-serif text-lg font-bold text-brand-950 focus:border-brand-500 outline-none shadow-sm"
                                >
                                    {calendarData.map((m, i) => (
                                        <option key={i} value={i}>{m.name} ({m.hebrew})</option>
                                    ))}
                                </select>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Cover Page Options */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Cover Page</label>
                            <button
                                onClick={() => setOptions({ ...options, includeCover: !options.includeCover })}
                                className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${options.includeCover ? 'bg-brand-600 justify-end' : 'bg-slate-200 justify-start'
                                    }`}
                            >
                                <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4 shrink-0">
                    <Button onClick={onClose} variant="ghost" className="flex-1 text-slate-500">Cancel</Button>
                    <Button
                        onClick={() => onDownload(options)}
                        disabled={isProcessing}
                        className="flex-[2] py-4 shadow-xl shadow-brand-500/20"
                    >
                        {isProcessing ? (
                            <><span className="animate-spin mr-2">⏳</span> Generating PDF...</>
                        ) : (
                            <><Download size={18} className="mr-2" /> Download Calendar</>
                        )}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
