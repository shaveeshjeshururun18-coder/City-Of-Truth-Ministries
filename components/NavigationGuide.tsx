import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowDown, ArrowLeft, ArrowUp, X, Volume2, VolumeX, Menu } from 'lucide-react';

interface GuideStep {
    id: string;
    target: string; // CSS selector
    message: string;
    voiceText: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    arrow: 'right' | 'down' | 'left' | 'up';
}

interface NavigationGuideProps {
    steps: GuideStep[];
    autoStart?: boolean;
    enableVoice?: boolean;
}

export const NavigationGuide: React.FC<NavigationGuideProps> = ({ 
    steps, 
    autoStart = false,
    enableVoice = true 
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isActive, setIsActive] = useState(autoStart);
    const [targetPosition, setTargetPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const [voiceEnabled, setVoiceEnabled] = useState(enableVoice);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        if (!isActive || steps.length === 0) return;

        const step = steps[currentStep];
        const target = document.querySelector(step.target);

        if (target) {
            const rect = target.getBoundingClientRect();
            setTargetPosition({
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
                height: rect.height
            });

            // Highlight element
            target.classList.add('navigation-guide-highlight');

            // Speak message
            if (voiceEnabled && step.voiceText) {
                speakText(step.voiceText);
            }

            return () => {
                target.classList.remove('navigation-guide-highlight');
            };
        }
    }, [currentStep, isActive, voiceEnabled, steps]);

    const speakText = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    const stopSpeaking = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const nextStep = () => {
        stopSpeaking();
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            closeGuide();
        }
    };

    const prevStep = () => {
        stopSpeaking();
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const closeGuide = () => {
        stopSpeaking();
        setIsActive(false);
        setCurrentStep(0);
    };

    const getArrowComponent = (arrow: string) => {
        switch (arrow) {
            case 'right': return ArrowRight;
            case 'down': return ArrowDown;
            case 'left': return ArrowLeft;
            case 'up': return ArrowUp;
            default: return ArrowRight;
        }
    };

    const getMessagePosition = (position: string) => {
        switch (position) {
            case 'top':
                return {
                    top: `${targetPosition.top - 120}px`,
                    left: `${targetPosition.left + targetPosition.width / 2}px`,
                    transform: 'translateX(-50%)'
                };
            case 'bottom':
                return {
                    top: `${targetPosition.top + targetPosition.height + 20}px`,
                    left: `${targetPosition.left + targetPosition.width / 2}px`,
                    transform: 'translateX(-50%)'
                };
            case 'left':
                return {
                    top: `${targetPosition.top + targetPosition.height / 2}px`,
                    left: `${targetPosition.left - 320}px`,
                    transform: 'translateY(-50%)'
                };
            case 'right':
                return {
                    top: `${targetPosition.top + targetPosition.height / 2}px`,
                    left: `${targetPosition.left + targetPosition.width + 20}px`,
                    transform: 'translateY(-50%)'
                };
            default:
                return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        }
    };

    if (!isActive || steps.length === 0) return null;

    const step = steps[currentStep];
    const ArrowIcon = getArrowComponent(step.arrow);
    const messagePos = getMessagePosition(step.position);

    return (
        <>
            <style>{`
                .navigation-guide-highlight {
                    position: relative;
                    z-index: 10000;
                    box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.6), 0 0 0 8px rgba(251, 191, 36, 0.3) !important;
                    animation: pulse-highlight 2s infinite;
                    border-radius: 8px;
                }
                @keyframes pulse-highlight {
                    0%, 100% { box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.6), 0 0 0 8px rgba(251, 191, 36, 0.3); }
                    50% { box-shadow: 0 0 0 6px rgba(251, 191, 36, 0.8), 0 0 0 12px rgba(251, 191, 36, 0.4); }
                }
            `}</style>

            {/* Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]"
                onClick={nextStep}
            />

            {/* Spotlight on target */}
            <div
                className="fixed z-[99999] pointer-events-none"
                style={{
                    top: `${targetPosition.top - 8}px`,
                    left: `${targetPosition.left - 8}px`,
                    width: `${targetPosition.width + 16}px`,
                    height: `${targetPosition.height + 16}px`,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                    borderRadius: '12px'
                }}
            />

            {/* Arrow pointing to target */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="fixed z-[100000]"
                style={{
                    top: step.position === 'top' ? `${targetPosition.top - 60}px` :
                         step.position === 'bottom' ? `${targetPosition.top + targetPosition.height + 10}px` :
                         `${targetPosition.top + targetPosition.height / 2 - 20}px`,
                    left: step.position === 'left' ? `${targetPosition.left - 60}px` :
                          step.position === 'right' ? `${targetPosition.left + targetPosition.width + 10}px` :
                          `${targetPosition.left + targetPosition.width / 2 - 20}px`
                }}
            >
                <motion.div
                    animate={{ 
                        y: step.arrow === 'down' ? [0, 10, 0] : step.arrow === 'up' ? [0, -10, 0] : 0,
                        x: step.arrow === 'right' ? [0, 10, 0] : step.arrow === 'left' ? [0, -10, 0] : 0
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shadow-2xl"
                >
                    <ArrowIcon className="w-8 h-8 text-white" />
                </motion.div>
            </motion.div>

            {/* Message Box */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed z-[100001] max-w-sm"
                style={messagePos}
            >
                <div className="bg-white rounded-2xl shadow-2xl border-2 border-amber-400 p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Menu className="w-5 h-5 text-amber-600" />
                            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                                Step {currentStep + 1} of {steps.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setVoiceEnabled(!voiceEnabled)}
                                className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                            >
                                {voiceEnabled ? (
                                    <Volume2 className="w-4 h-4 text-amber-600" />
                                ) : (
                                    <VolumeX className="w-4 h-4 text-slate-400" />
                                )}
                            </button>
                            <button
                                onClick={closeGuide}
                                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                <X className="w-4 h-4 text-red-500" />
                            </button>
                        </div>
                    </div>

                    {/* Message */}
                    <p className="text-slate-900 font-medium text-sm mb-4">{step.message}</p>

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-2">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
                        >
                            Previous
                        </button>
                        <div className="flex gap-1">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full transition-colors ${
                                        idx === currentStep ? 'bg-amber-500' : 'bg-slate-300'
                                    }`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={nextStep}
                            className="px-3 py-2 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors"
                        >
                            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    </div>

                    {/* Voice indicator */}
                    {isSpeaking && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                            >
                                <Volume2 className="w-4 h-4" />
                            </motion.div>
                            <span className="font-medium">Speaking...</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
};

// Hook to use navigation guide
export const useNavigationGuide = () => {
    const [isGuideActive, setIsGuideActive] = useState(false);
    const [guideSteps, setGuideSteps] = useState<GuideStep[]>([]);

    const startGuide = (steps: GuideStep[]) => {
        setGuideSteps(steps);
        setIsGuideActive(true);
    };

    const stopGuide = () => {
        setIsGuideActive(false);
        setGuideSteps([]);
    };

    return {
        isGuideActive,
        guideSteps,
        startGuide,
        stopGuide
    };
};

// Predefined guide for main navigation
export const MAIN_NAVIGATION_GUIDE: GuideStep[] = [
    {
        id: 'home',
        target: '[href="/"]',
        message: 'Click HOME to go to the main page with all ministry highlights',
        voiceText: 'Click HOME to go to the main page with all ministry highlights',
        position: 'bottom',
        arrow: 'down'
    },
    {
        id: 'hebrew',
        target: '[href*="hebrew"]',
        message: 'Explore HEBREW section for language learning and biblical resources',
        voiceText: 'Explore HEBREW section for language learning and biblical resources',
        position: 'bottom',
        arrow: 'down'
    },
    {
        id: 'ministries',
        target: '[href*="ministries"]',
        message: 'Visit MINISTRIES to see our worship services and programs',
        voiceText: 'Visit MINISTRIES to see our worship services and programs',
        position: 'bottom',
        arrow: 'down'
    },
    {
        id: 'contact',
        target: '[href*="contact"]',
        message: 'Click CONTACT to send us a message or find our location',
        voiceText: 'Click CONTACT to send us a message or find our location',
        position: 'bottom',
        arrow: 'down'
    },
    {
        id: 'register',
        target: 'button:has-text("REGISTER"), a:has-text("REGISTER")',
        message: 'Click REGISTER to become a member of our community',
        voiceText: 'Click REGISTER to become a member of our community',
        position: 'bottom',
        arrow: 'down'
    }
];
