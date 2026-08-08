import React, { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { getHebrewDateInfo } from './CalendarLogic';
import { HStack, VStack } from '@astryxdesign/core/Layout';

export const HebrewNewYearBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState<boolean>(true);
    const [isRoshHashanah, setIsRoshHashanah] = useState<boolean>(false);
    const [hebrewYear, setHebrewYear] = useState<number>(5786);
    const [simulatedDate, setSimulatedDate] = useState<string | null>(null);

    useEffect(() => {
        // Check date logic
        const checkDate = () => {
            const today = simulatedDate ? new Date(simulatedDate) : new Date();
            const dateInfo = getHebrewDateInfo(today);
            
            if (dateInfo) {
                setHebrewYear(dateInfo.hebrewYear);
                const isRH = dateInfo.festivals.includes('Rosh Hashanah') || 
                             (dateInfo.hebrewMonth === 'Tishrei' && (dateInfo.hebrewDay === 1 || dateInfo.hebrewDay === 2));
                setIsRoshHashanah(isRH);
            } else {
                setIsRoshHashanah(false);
            }
        };

        checkDate();
    }, [simulatedDate]);

    // Handle simulation toggle for testing/showcasing
    const enableSimulation = () => {
        // Rosh Hashanah 5786 starts on Sep 12 2026 based on our calendar logic
        if (simulatedDate) {
            setSimulatedDate(null);
            setIsVisible(true);
        } else {
            setSimulatedDate('2026-09-12');
            setIsVisible(true);
        }
    };

    if (!isVisible) {
        // Return a floating simulation controller in the corner for testing if not visible
        return (
            <div className="fixed bottom-4 left-4 z-[999] opacity-40 hover:opacity-100 transition-opacity">
                <button
                    onClick={enableSimulation}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-md hover:bg-slate-800"
                >
                    {simulatedDate ? 'Disable Banner Simulation' : 'Simulate Rosh Hashanah Banner'}
                </button>
            </div>
        );
    }

    // Only show if it's Rosh Hashanah or if we are simulating it
    if (!isRoshHashanah && !simulatedDate) {
        return (
            <div className="fixed bottom-4 left-4 z-[999] opacity-40 hover:opacity-100 transition-opacity">
                <button
                    onClick={enableSimulation}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-md hover:bg-slate-800"
                >
                    Simulate Rosh Hashanah Banner
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full overflow-hidden bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white py-3.5 px-4 shadow-md border-b border-amber-400/30 z-[100] transition-all">
            {/* Shimmer overlay effect */}
            <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.15)_45%,rgba(255,255,255,0.15)_55%,rgba(255,255,255,0)_100%)] bg-[length:200%_100%] animate-pulse" />

            <div className="max-w-7xl mx-auto relative z-10">
                <HStack gap={3} align="center" justify="between" wrap="nowrap" className="w-full">
                    {/* Left & Center Content */}
                    <HStack gap={2} align="center" wrap="wrap" className="flex-1">
                        <span className="p-1 bg-white/20 rounded-lg animate-bounce hidden sm:inline-flex">
                            <Sparkles className="h-4.5 w-4.5 text-amber-100" />
                        </span>
                        
                        <VStack gap={0.5} align="start">
                            <h2 className="text-sm sm:text-base font-black tracking-wide font-serif">
                                L'Shanah Tovah U'Metukah! 🍎🍯
                            </h2>
                            <p className="text-xs sm:text-sm font-medium text-amber-50/90">
                                Shana Tova! Celebrating the Hebrew New Year {hebrewYear} (Rosh Hashanah). May you be inscribed for a good and sweet year.
                            </p>
                        </VStack>
                    </HStack>

                    {/* Simulation Info & Dismiss Button */}
                    <HStack gap={2.5 as any} align="center">
                        {simulatedDate && (
                            <span className="hidden md:inline-flex px-2 py-0.5 bg-amber-700/50 border border-amber-300/20 rounded text-[10px] font-bold tracking-wider uppercase text-yellow-100">
                                Simulated Date Active
                            </span>
                        )}
                        
                        <button
                            onClick={enableSimulation}
                            className="hidden sm:inline-flex text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 px-2.5 py-1 rounded-lg transition-all"
                            title="Toggle simulation mode"
                        >
                            {simulatedDate ? 'Stop Simulation' : 'Simulate'}
                        </button>
                        
                        <button
                            onClick={() => setIsVisible(false)}
                            className="p-1.5 hover:bg-white/15 text-white/95 hover:text-white rounded-lg transition-colors"
                            aria-label="Dismiss banner"
                        >
                            <X className="h-4.5 w-4.5" />
                        </button>
                    </HStack>
                </HStack>
            </div>
        </div>
    );
};
