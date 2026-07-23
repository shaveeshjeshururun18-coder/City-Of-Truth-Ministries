import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, Send, Maximize2, Minimize2, Loader, Sparkles, Trash2, Hand, Quote, Settings, Download, BookOpen, Clock, Zap, BarChart3, Volume2, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { streamSpatulaAIResponse } from '../services/openRouterService';
import { jsPDF } from 'jspdf';
import { LordIconWrapper } from './LordIconWrapper';
import 'jspdf-autotable';

declare global {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        trigger?: string;
        colors?: string;
        style?: React.CSSProperties;
      };
    }
  }
}

interface Message {
    id: string;
    text: string;
    sender: 'bot' | 'user';
    timestamp: Date;
    options?: string[];
    rating?: 'positive' | 'negative' | null;
    sources?: string[];
    keywords?: string[];
}

const AnimatedBotMessage = ({ text }: { text: string }) => {
    // Check if the text has the ancient format markers (e.g., 🏺, 📖, ❝, 🙏, 🕊)
    const isAncientFormat = text.includes('🏺') || text.includes('📖') || text.includes('❝') || text.includes('━━━━━━━━━━━━');
    
    if (!isAncientFormat) {
        return <div className="whitespace-pre-wrap">{text}</div>;
    }

    const sections = text.split('\n').filter(line => line.trim() !== '');
    
    return (
        <div className="space-y-4 font-serif text-brand-950">
            {sections.map((section, idx) => {
                if (section.includes('━━━━━━━━━━━━')) {
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ delay: idx * 0.7, duration: 0.8 }}
                            className="flex justify-center py-2"
                        >
                            <div className="w-16 h-px bg-amber-400"></div>
                        </motion.div>
                    );
                }
                
                // For quotes, make them italic and styled
                const isQuote = section.includes('❝');
                
                return (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.7, duration: 0.5 }}
                        className={`${isQuote ? 'italic text-amber-900 bg-amber-50/70 p-3 rounded-xl border border-amber-200/50 my-2 shadow-sm' : ''}`}
                    >
                        {section}
                    </motion.div>
                );
            })}
        </div>
    );
};

interface ConversationContext {
    topic?: string;
    subtopics: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    engagementLevel: number;
}

interface AssistantConfig {
    size: number;
    label: string;
    showAnimation: boolean;
    position: { x: number; y: number };
    theme: 'light' | 'dark' | 'spiritual';
    soundEnabled: boolean;
    analyticsEnabled: boolean;
}

const DEFAULT_CONFIG: AssistantConfig = {
    size: 80,
    label: 'Divine Help',
    showAnimation: true,
    position: { x: 0, y: 0 },
    theme: 'spiritual',
    soundEnabled: false,
    analyticsEnabled: true
};

export const DivineAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [isVisible, setIsVisible] = useState(true); // Visibility control from widget settings
    const [messages, setMessages] = useState<Message[]>(() => {
        try {
            const saved = localStorage.getItem('divine_assistant_history');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [config, setConfig] = useState<AssistantConfig>(() => {
        try {
            const saved = localStorage.getItem('cot_widget_settings');
            const parsed = saved ? JSON.parse(saved) : {};
            return {
                ...DEFAULT_CONFIG,
                size: parsed.aiSize ? Math.round(56 * parsed.aiSize) : 56,
                label: parsed.aiLabelText || 'Ask Divine AI',
                showAnimation: parsed.aiAnimation !== false,
                position: { x: 0, y: 0 }
            };
        } catch (e) {
            return { ...DEFAULT_CONFIG, size: 56, label: 'Ask Divine AI', showAnimation: true, position: { x: 0, y: 0 } };
        }
    });
    const [conversationContext, setConversationContext] = useState<ConversationContext>({
        topic: undefined,
        subtopics: [],
        sentiment: 'neutral',
        engagementLevel: 0
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const labelControls = useAnimation();
    const shareLabelControls = useAnimation();

    useEffect(() => {
        const updateFromSettings = () => {
            try {
                const saved = localStorage.getItem('cot_widget_settings');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setConfig(prev => ({
                        ...prev,
                        size: parsed.aiSize ? Math.round(56 * parsed.aiSize) : 56,
                        label: parsed.aiLabelText || 'Ask Divine AI',
                        showAnimation: parsed.aiAnimation !== false
                    }));
                    // Update visibility
                    setIsVisible(parsed.aiVisible !== false);
                }
            } catch (e) {}
        };

        updateFromSettings();
        window.addEventListener('widget-settings-updated', updateFromSettings);
        return () => window.removeEventListener('widget-settings-updated', updateFromSettings);
    }, []);

    // Cycle animation for ONLY Ask Divine AI label
    // Slides out from inside the button to the left, stays for 5 seconds, slides back, and repeats.
    useEffect(() => {
        if (isOpen) return;

        let cancelled = false;
        const cycle = async () => {
            while (!cancelled) {
                // Hide share label completely
                shareLabelControls.set({ opacity: 0, x: 28 });
                // Slide in right label (appears)
                await labelControls.start({ opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } });
                
                // Stay visible
                await new Promise(r => setTimeout(r, 5000));
                if (cancelled) break;
                
                // Slide out right label (goes inside / disappears)
                await labelControls.start({ opacity: 0, x: 28, transition: { duration: 0.45, ease: [0.4, 0, 1, 1] } });
                
                // Pause before next loop
                await new Promise(r => setTimeout(r, 3000));
            }
        };

        // Initialize state as hidden (inside the button on the right)
        labelControls.set({ opacity: 0, x: 28 });
        shareLabelControls.set({ opacity: 0, x: 28 });
        
        const delayTimeout = setTimeout(cycle, 1000);
        return () => {
            cancelled = true;
            clearTimeout(delayTimeout);
        };
    }, [isOpen, config.showAnimation, labelControls, shareLabelControls]);
    
    // Debug logging
    useEffect(() => {
        console.log('🔥 Divine Assistant Loaded!');
    }, []);

    // Advanced analytics calculation
    const analytics = useMemo(() => {
        const totalMessages = messages.length;
        const userMessages = messages.filter(m => m.sender === 'user').length;
        const botMessages = messages.filter(m => m.sender === 'bot').length;
        const ratings = messages.filter(m => m.rating).length;
        const positiveRatings = messages.filter(m => m.rating === 'positive').length;
        const avgResponseTime = messages.reduce((acc, m, i) => {
            if (i > 0 && messages[i - 1].sender === 'user' && m.sender === 'bot') {
                return acc + (new Date(m.timestamp).getTime() - new Date(messages[i - 1].timestamp).getTime());
            }
            return acc;
        }, 0) / Math.max(botMessages - 1, 1);
        
        return {
            totalMessages,
            userMessages,
            botMessages,
            ratings,
            positiveRatings,
            positivePercentage: ratings > 0 ? Math.round((positiveRatings / ratings) * 100) : 0,
            avgResponseTime: Math.round(avgResponseTime / 1000)
        };
    }, [messages]);

    // Text-to-speech utility
    const speakMessage = useCallback((text: string) => {
        if (!config.soundEnabled || typeof window === 'undefined') return;
        
        if (audioRef.current) {
            audioRef.current.pause();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
    }, [config.soundEnabled]);

    // Extract keywords from message
    const extractKeywords = (text: string): string[] => {
        const keywords = text.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/g) || [];
        return [...new Set(keywords)].slice(0, 3);
    };

    // Persist messages
    useEffect(() => {
        try {
            localStorage.setItem('divine_assistant_history', JSON.stringify(messages));
        } catch (e) {
            console.error("Failed to save assistant history", e);
        }
    }, [messages]);

    // Persist config
    useEffect(() => {
        try {
            localStorage.setItem('divine_assistant_config', JSON.stringify(config));
        } catch (e) {
            console.error("Failed to save assistant config", e);
        }
    }, [config]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setTimeout(() => {
                addBotMessage(
                    "Welcome to City of Truth Ministries. I am your Divine Assistant, here to provide scriptural guidance and ministry information. How may I serve you today?",
                    ["Service Times", "Hebrew Study", "Need navigation help?", "About Valparai"]
                );
            }, 600);
        }
    }, [isOpen]);

    const addBotMessage = (text: string, options?: string[]) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            text,
            sender: 'bot',
            timestamp: new Date(),
            options,
            keywords: extractKeywords(text),
            sources: ['Divine Wisdom Database']
        };
        setMessages(prev => [...prev, newMessage]);
        setIsTyping(false);
        
        // Speak message if enabled
        if (config.soundEnabled) {
            setTimeout(() => speakMessage(text), 300);
        }
    };

    const addUserMessage = (text: string) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            timestamp: new Date(),
            keywords: extractKeywords(text)
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Update conversation context
        setConversationContext(prev => ({
            ...prev,
            engagementLevel: Math.min(prev.engagementLevel + 1, 100),
            subtopics: [...new Set([...prev.subtopics, ...extractKeywords(text)])]
        }));
    };

    const handleBotResponse = async (userMessage: string) => {
        try {
            // Check if user is asking for navigation help
            const navKeywords = ['navigate', 'navigation', 'menu', 'find page', 'where is', 'how to go', 'show me', 'guide me'];
            const isNavigationRequest = navKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));

            if (isNavigationRequest) {
                addBotMessage("I'll guide you through the website navigation. Watch for the highlighted areas and follow the arrows!", ["Start Guide", "Skip"]);
                return;
            }

            // Create a streaming message placeholder
            const botMsgId = Date.now().toString();
            setMessages(prev => [...prev, {
                id: botMsgId,
                text: '',
                sender: 'bot',
                timestamp: new Date(),
                options: []
            }]);
            setIsTyping(false);

            let fullText = '';
            await streamSpatulaAIResponse(userMessage, (chunk) => {
                fullText += chunk;
                setMessages(prev => prev.map(m =>
                    m.id === botMsgId ? { ...m, text: fullText } : m
                ));
            });

            // Finalize message with action options
            setMessages(prev => prev.map(m =>
                m.id === botMsgId ? { ...m, text: fullText, options: ["More details", "New topic", "Need navigation help?"] } : m
            ));

            // Update engagement metrics
            if (config.analyticsEnabled) {
                setConversationContext(prev => ({
                    ...prev,
                    sentiment: fullText.includes('help') || fullText.includes('support') ? 'positive' : 'neutral'
                }));
            }
        } catch (error) {
            console.error("Assistant Error:", error);
            addBotMessage("I apologize, but I am unable to connect to the divine knowledge base at this moment. Please try again later.", ["Retry"]);
        }
    };

    const handleOptionClick = (option: string) => {
        addUserMessage(option);
        
        // Handle special options
        if (option === "Start Guide") {
            // Navigation guide would be triggered here
            addBotMessage("Guide starting...", []);
            setIsOpen(false);
            return;
        }
        
        if (option === "Need navigation help?") {
            addBotMessage("I can show you how to navigate the website. Would you like me to start the interactive guide?", ["Start Guide", "No thanks"]);
            return;
        }
        
        setIsTyping(true);
        setTimeout(() => handleBotResponse(option), 800);
    };

    const handleSendMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (inputValue.trim()) {
            const text = inputValue.trim();
            addUserMessage(text);
            setInputValue('');
            setIsTyping(true);
            setTimeout(() => handleBotResponse(text), 1000);
        }
    };

    const clearChat = () => {
        if (confirm("Clear our conversation history?")) {
            const initialMessage: Message = {
                id: Date.now().toString(),
                text: "Shalom! The chat has been cleared. How may I assist you today on your spiritual journey?",
                sender: 'bot',
                timestamp: new Date(),
                options: ["About COT Ministries", "Prayer Request", "Navigation Help"]
            };
            setMessages([initialMessage]);
            localStorage.removeItem('divine_assistant_history');
            setConversationContext({
                topic: undefined,
                subtopics: [],
                sentiment: 'neutral',
                engagementLevel: 0
            });
        }
    };

    const exportConversation = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // --- Grandeur Theme Colors & Styles ---
        const royalNavy = [10, 25, 65] as [number, number, number];
        const gold = [218, 165, 32] as [number, number, number];
        const lightGold = [249, 241, 218] as [number, number, number];
        const textColor = [50, 50, 50] as [number, number, number];

        // 1. Header Background (Navy)
        doc.setFillColor(...royalNavy);
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        // 2. Gold Trim under Header
        doc.setFillColor(...gold);
        doc.rect(0, 40, pageWidth, 2, 'F');

        // 3. Header Title & Subtitle
        doc.setTextColor(255, 255, 255);
        doc.setFont("times", "bold");
        doc.setFontSize(24);
        doc.text("City of Truth Ministries", pageWidth / 2, 20, { align: "center" });

        doc.setFont("times", "italic");
        doc.setFontSize(14);
        doc.setTextColor(...gold);
        doc.text("Divine AI Conversation Log", pageWidth / 2, 30, { align: "center" });

        // 4. Metadata section
        doc.setTextColor(...textColor);
        doc.setFont("times", "normal");
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 50);
        doc.text(`Total Messages: ${messages.length}`, 14, 56);

        // 5. Build Table Data
        const tableBody = messages.map(m => [
            m.sender === 'bot' ? 'Divine AI' : 'User',
            m.text,
            new Date(m.timestamp).toLocaleTimeString()
        ]);

        (doc as any).autoTable({
            startY: 65,
            head: [['Sender', 'Message', 'Time']],
            body: tableBody,
            theme: 'grid',
            headStyles: {
                fillColor: royalNavy,
                textColor: [255, 255, 255],
                font: 'times',
                fontStyle: 'bold',
                fontSize: 12,
                halign: 'center'
            },
            bodyStyles: {
                font: 'times',
                fontSize: 11,
                textColor: textColor
            },
            alternateRowStyles: {
                fillColor: lightGold
            },
            columnStyles: {
                0: { cellWidth: 30, fontStyle: 'bold' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 30, halign: 'center' }
            },
            margin: { top: 65, bottom: 30 } // leave space for footer
        });

        // 6. Footer (Copyright & Page numbers)
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            // Gold trim above footer
            doc.setFillColor(...gold);
            doc.rect(0, pageHeight - 20, pageWidth, 1, 'F');

            doc.setFont("times", "italic");
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            const footerText = `© ${new Date().getFullYear()} City of Truth Ministries. All rights reserved. | Page ${i} of ${pageCount}`;
            doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" });
        }

        doc.save(`Divine-Conversation-${Date.now()}.pdf`);
    };

    const rateMessage = (messageId: string, rating: 'positive' | 'negative') => {
        setMessages(prev => prev.map(msg => 
            msg.id === messageId ? { ...msg, rating } : msg
        ));
    };

    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setConfig(prev => ({
            ...prev,
            position: { x: info.offset.x, y: info.offset.y }
        }));
    };

    // Expose config to window for admin dashboard access
    useEffect(() => {
        (window as any).divineAssistantConfig = {
            get: () => config,
            set: (newConfig: Partial<AssistantConfig>) => {
                setConfig(prev => ({ ...prev, ...newConfig }));
            }
        };
    }, [config]);

    // Don't render if visibility is disabled from admin dashboard
    if (!isVisible) return null;

    return (
        <>
            {/* Floating Launcher Button — standalone fixed, no container */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        key="launcher"
                        initial={{ scale: 0, opacity: 0, rotate: -45 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0, rotate: 45 }}
                        whileHover={{ scale: 1.1, boxShadow: "0 20px 40px rgba(251, 191, 36, 0.4)" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        style={{
                            width: `${config.size}px`,
                            height: `${config.size}px`,
                            position: 'fixed',
                            bottom: '1.5rem',
                            right: '1.5rem',
                            zIndex: 99999,
                        }}
                        className={`pointer-events-auto rounded-full bg-slate-950 shadow-[0_20px_50px_-5px_rgba(251,191,36,0.8)] border-3 border-amber-400 flex items-center justify-center group ring-4 ring-amber-400/50 cursor-pointer ${config.showAnimation ? 'animate-pulse' : ''}`}
                    >
                        {/* Inner container for background masking */}
                        <div className="absolute inset-0 rounded-full overflow-hidden">
                            {/* Golden Menorah Image */}
                            <div className="absolute inset-0 bg-[url('/menorah-flag.png')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
                            {/* Overlay Gradient for Depth */}
                            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 to-transparent"></div>
                        </div>

                        {/* Label */}
                        <motion.div
                            initial={{ opacity: 0, x: 28 }}
                            animate={labelControls}
                            className="absolute right-[calc(100%+16px)] whitespace-nowrap bg-white text-blue-700 text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-lg border border-slate-100 flex items-center gap-2 pointer-events-none"
                        >
                            <LordIconWrapper icon="bible" size={14} trigger="loop" colors={{ primary: '#2563EB', secondary: '#D4AF37' }} />
                            {config.label}
                        </motion.div>

                        <div className="relative z-10 flex items-center justify-center">
                            <LordIconWrapper
                                icon="bible"
                                size={Math.round(config.size * 0.55)}
                                trigger="loop"
                                colors={{ primary: '#FDE047', secondary: '#ffffff' }}
                            />
                            {config.showAnimation && (
                                <motion.div
                                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2.5, repeat: Infinity }}
                                    className="absolute inset-0 bg-amber-300 rounded-full blur-xl -z-10"
                                />
                            )}
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <div ref={containerRef} className="fixed inset-0 pointer-events-none z-40">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ 
                            opacity: 1, 
                            y: 0, 
                            scale: 1,
                            width: isExpanded ? 'calc(100vw - 40px)' : '420px',
                            height: isExpanded ? 'calc(100vh - 40px)' : '740px',
                            bottom: isExpanded ? 20 : 20,
                            right: isExpanded ? 20 : 20,
                            borderRadius: isExpanded ? '24px' : '20px'
                        }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        className="pointer-events-auto fixed shadow-2xl flex flex-col overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, #F8FAFF 0%, #F0F4FF 100%)',
                            zIndex: 99999,
                        }}
                    >
                        {/* Royal Blue Header */}
                        <div className="px-4 py-5 flex items-center justify-between shrink-0" style={{background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)'}}>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{background: '#D4AF37'}}>
                                    <LordIconWrapper icon="bible" size={32} trigger="hover" colors={{ primary: '#1E3A8A', secondary: '#ffffff' }} />
                                </div>
                                <div className="select-none">
                                    <h3 className="text-white font-serif text-base font-bold leading-tight tracking-tight">Ancient Wisdom</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="w-1.5 h-1.5 rounded-full" style={{background: '#D4AF37'}}></span>
                                        <span className="text-blue-100 text-[10px] uppercase tracking-wider font-light">Truth • Scripture</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => setShowSettings(!showSettings)} 
                                    className="p-2 rounded-lg transition-all hover:bg-white/20"
                                    style={{color: '#D4AF37'}}
                                    title="Settings"
                                >
                                    <Settings size={18} />
                                </button>
                                <button 
                                    onClick={() => setIsOpen(false)} 
                                    className="p-2 rounded-lg transition-all hover:bg-white/20"
                                    style={{color: '#D4AF37'}}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Settings Panel */}
                        <AnimatePresence>
                            {showSettings && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-6 py-5 space-y-4 overflow-hidden"
                                    style={{background: 'rgba(37, 99, 235, 0.06)'}}
                                >
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Sound Effects</label>
                                        <button
                                            onClick={() => setConfig(p => ({ ...p, soundEnabled: !p.soundEnabled }))}
                                            className={`w-11 h-6 rounded-full transition-all flex items-center`}
                                            style={{background: config.soundEnabled ? '#2563EB' : '#E5E7EB'}}
                                        >
                                            <motion.div 
                                                animate={{x: config.soundEnabled ? 20 : 2}}
                                                className="w-5 h-5 bg-white rounded-full"
                                            />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={exportConversation}
                                        className="w-full px-4 py-3 text-white text-xs font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                                        style={{background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)'}}
                                    >
                                        📜 Export Conversation
                                    </button>
                                    <button 
                                        onClick={clearChat}
                                        className="w-full px-4 py-3 text-slate-700 text-xs font-semibold rounded-lg transition-all border-2 border-slate-300 hover:bg-slate-100"
                                    >
                                        🗑️ Clear Chat
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Scripture Highlight */}
                        <div className="px-4 py-4 text-center" style={{background: 'rgba(212, 175, 55, 0.08)'}}>
                            <span className="text-xs font-serif text-slate-600" style={{lineHeight: '1.6'}}>
                                <span style={{color: '#D4AF37', fontSize: '1em'}}>✡️</span> <span style={{fontStyle: 'italic', fontWeight: '500'}}>"Thy word is a lamp unto my feet"</span> <span style={{color: '#D4AF37'}}>—</span> <span style={{color: '#1E3A8A', fontWeight: '600'}}>Psalm 119:105</span> <span style={{color: '#D4AF37', fontSize: '1em'}}>✡️</span>
                            </span>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" style={{background: 'linear-gradient(135deg, #F8FAFF 0%, #F0F4FF 100%)'}}>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-2 max-w-[90%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {/* Avatar */}
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-lg shadow-md ${
                                            msg.sender === 'bot' 
                                            ? 'text-white' 
                                            : 'text-white'
                                        }`}
                                        style={{background: msg.sender === 'bot' 
                                            ? 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)'
                                            : 'linear-gradient(135deg, #D4AF37 0%, #E8BC2F 100%)'
                                        }}
                                        >
                                            {msg.sender === 'bot' ? (
                                                <LordIconWrapper icon="bible" size={20} trigger="hover" colors={{ primary: '#ffffff', secondary: '#1E3A8A' }} />
                                            ) : '🙏'}
                                        </div>

                                        {/* Message Bubble */}
                                        <div className="space-y-2 flex-1">
                                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md transition-all ${
                                                msg.sender === 'bot'
                                                ? 'rounded-tl-none'
                                                : 'rounded-tr-none'
                                            }`}
                                            style={msg.sender === 'bot' ? {
                                                background: 'rgba(255, 255, 255, 0.95)',
                                                color: '#1F2937',
                                                backdropFilter: 'blur(10px)'
                                            } : {
                                                background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                                                color: '#FFFFFF',
                                            }}
                                            >
                                                {msg.sender === 'bot' ? <AnimatedBotMessage text={msg.text} /> : msg.text}
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            {msg.sender === 'bot' && (
                                                <div className="flex gap-2 pl-1">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => rateMessage(msg.id, 'positive')}
                                                        className="p-2 rounded-lg transition-all hover:shadow-md"
                                                        style={{background: msg.rating === 'positive' ? '#D4AF37' : 'rgba(212, 175, 55, 0.1)', color: msg.rating === 'positive' ? '#1E3A8A' : '#9CA3AF'}}
                                                        title="Helpful"
                                                    >
                                                        <ThumbsUp size={16} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => rateMessage(msg.id, 'negative')}
                                                        className="p-2 rounded-lg transition-all hover:shadow-md"
                                                        style={{background: msg.rating === 'negative' ? '#EF4444' : 'rgba(239, 68, 68, 0.1)', color: msg.rating === 'negative' ? '#FFFFFF' : '#9CA3AF'}}
                                                        title="Not helpful"
                                                    >
                                                        <ThumbsDown size={16} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => speakMessage(msg.text)}
                                                        className="p-2 rounded-lg transition-all hover:shadow-md"
                                                        style={{background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB'}}
                                                        title="Read aloud"
                                                    >
                                                        <Volume2 size={16} />
                                                    </motion.button>
                                                </div>
                                            )}
                                            
                                            {/* Option Buttons */}
                                            {msg.options && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {msg.options.map((opt, i) => (
                                                        <motion.button
                                                            key={i}
                                                            whileHover={{ y: -2, boxShadow: '0 8px 16px rgba(212, 175, 55, 0.2)' }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleOptionClick(opt)}
                                                            className="px-5 py-2.5 rounded-full text-xs font-semibold transition-all shadow-sm"
                                                            style={{
                                                                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.08) 100%)',
                                                                color: '#1E3A8A',
                                                                border: '1px solid rgba(212, 175, 55, 0.25)'
                                                            }}
                                                        >
                                                            {opt}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm shadow-md" style={{background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)'}}>
                                        <Loader className="w-5 h-5 animate-spin text-blue-200" />
                                    </div>
                                    <div className="h-10 px-5 rounded-xl flex items-center gap-2 shadow-md" style={{background: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(212, 175, 55, 0.2)'}}>
                                        <span className="text-sm font-serif font-semibold text-brand-900 flex items-center gap-2 animate-pulse">
                                            📜 Searching Scripture...
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 shrink-0" style={{background: 'linear-gradient(135deg, #F8FAFF 0%, #F0F4FF 100%)'}}>
                            <form onSubmit={handleSendMessage} className="relative">
                                <div className="relative flex items-center gap-2 px-4 py-3 rounded-2xl shadow-md" style={{background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)'}}>
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Ask for guidance..."
                                        className="flex-1 bg-transparent text-slate-700 placeholder-slate-400 text-sm focus:outline-none"
                                        style={{color: '#1F2937'}}
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.92 }}
                                        disabled={!inputValue.trim() || isTyping}
                                        type="submit"
                                        className="w-10 h-10 rounded-lg text-white flex items-center justify-center transition-all disabled:opacity-40 shadow-md"
                                        style={{background: 'linear-gradient(135deg, #D4AF37 0%, #E8BC2F 100%)'}}
                                    >
                                        <Send size={18} />
                                    </motion.button>
                                </div>
                            </form>
                            <p className="text-center mt-3 text-[10px] text-slate-500 font-light tracking-wide flex items-center justify-center gap-1.5" style={{color: '#94A3B8'}}>
                                <LordIconWrapper icon="bible" size={12} trigger="hover" colors={{ primary: '#D4AF37', secondary: '#94A3B8' }} />
                                City of Truth Ministries
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        </>
    );
};
