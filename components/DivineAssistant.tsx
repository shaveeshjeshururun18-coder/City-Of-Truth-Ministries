import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, Send, Maximize2, Minimize2, Loader, Sparkles, Trash2, Hand, Quote, Settings, Download, BookOpen, Clock, Zap, BarChart3, Volume2, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { generateSpatulaAIResponse } from '../services/openRouterService';

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
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const updateFromSettings = () => {
            try {
                const saved = localStorage.getItem('cot_widget_settings');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (typeof parsed.aiVisible === 'boolean') {
                        setIsVisible(parsed.aiVisible);
                    }
                    setConfig(prev => ({
                        ...prev,
                        size: parsed.aiSize ? Math.round(56 * parsed.aiSize) : 56,
                        label: parsed.aiLabelText || 'Ask Divine AI',
                        showAnimation: parsed.aiAnimation !== false
                    }));
                }
            } catch (e) {}
        };

        updateFromSettings();
        window.addEventListener('widget-settings-updated', updateFromSettings);
        return () => window.removeEventListener('widget-settings-updated', updateFromSettings);
    }, []);
    
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

            const responseText = await generateSpatulaAIResponse(userMessage);
            addBotMessage(responseText, ["More details", "New topic", "Need navigation help?"]);
            
            // Update engagement metrics
            if (config.analyticsEnabled) {
                setConversationContext(prev => ({
                    ...prev,
                    sentiment: responseText.includes('help') || responseText.includes('support') ? 'positive' : 'neutral'
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
            setMessages([]);
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
        const exportData = {
            timestamp: new Date().toISOString(),
            totalMessages: messages.length,
            conversation: messages.map(m => ({
                sender: m.sender,
                text: m.text,
                time: m.timestamp,
                keywords: m.keywords
            })),
            analytics
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `conversation-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
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

    if (!isVisible) return null;

    return (
        <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        key="launcher"
                        drag
                        dragConstraints={containerRef}
                        dragElastic={0.1}
                        dragMomentum={false}
                        onDragEnd={handleDragEnd}
                        initial={{ scale: 0, opacity: 0, rotate: -45 }}
                        animate={{ 
                            scale: 1, 
                            opacity: 1, 
                            rotate: 0,
                            x: config.position.x,
                            y: config.position.y
                        }}
                        exit={{ scale: 0, opacity: 0, rotate: 45 }}
                        whileHover={{ scale: 1.1, boxShadow: "0 20px 40px rgba(251, 191, 36, 0.4)" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        style={{
                            width: `${config.size}px`,
                            height: `${config.size}px`,
                            bottom: '2.5rem',
                            right: '7rem',
                        }}
                        className={`pointer-events-auto fixed rounded-full bg-slate-950 shadow-[0_20px_50px_-5px_rgba(251,191,36,0.8)] border-3 border-amber-400 flex items-center justify-center group overflow-hidden ring-4 ring-amber-400/50 cursor-grab active:cursor-grabbing ${config.showAnimation ? 'animate-pulse' : ''}`}
                    >
                        {/* Golden Menorah Image */}
                        <div className="absolute inset-0 bg-[url('/menorah-flag.png')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
                        
                        {/* Overlay Gradient for Depth */}
                        <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 to-transparent"></div>
                        
                        <div className="relative z-10 flex items-center justify-center">
                            <Sparkles 
                                className="text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" 
                                style={{ width: `${config.size * 0.4}px`, height: `${config.size * 0.4}px` }}
                            />
                            {config.showAnimation && (
                                <motion.div 
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-amber-300 rounded-full blur-xl -z-10"
                                />
                            )}
                        </div>
                        
                        {/* Always-On Gold Label */}
                        {config.label && (
                            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-950/90 backdrop-blur-md border border-amber-400/40 px-3.5 py-1.5 rounded-full shadow-2xl shadow-black/80 flex items-center gap-1.5 group-hover:border-amber-400 group-hover:scale-105 transition-all duration-300 pointer-events-none select-none">
                                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.25em] whitespace-nowrap">
                                    {config.label}
                                </span>
                            </div>
                        )}
                    </motion.button>
                )}

                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ 
                            opacity: 1, 
                            y: 0, 
                            scale: 1,
                            width: isExpanded ? 'calc(100vw - 40px)' : 'min(400px, calc(100vw - 32px))',
                            height: isExpanded ? 'calc(100vh - 40px)' : '650px',
                            bottom: isExpanded ? 20 : 32,
                            right: isExpanded ? 20 : 32,
                            borderRadius: isExpanded ? '32px' : '40px'
                        }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        className="pointer-events-auto fixed bg-white/95 backdrop-blur-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border border-white/50 flex flex-col overflow-hidden"
                    >
                        {/* Royal Header */}
                        <div className="px-6 py-5 bg-gradient-to-r from-brand-700 via-brand-800 to-indigo-950 flex items-center justify-between shadow-lg relative shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner relative overflow-hidden group">
                                    <Sparkles className="w-6 h-6 text-white relative z-10" />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-accent-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="select-none">
                                    <h3 className="text-white font-bold text-lg leading-tight tracking-tight">Divine Assistant</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                        <span className="text-brand-100/70 text-[10px] font-black uppercase tracking-widest">Spiritual Presence • {messages.length} Messages</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setShowAnalytics(!showAnalytics)} 
                                    className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all" 
                                    title="Analytics"
                                >
                                    <BarChart3 size={18} />
                                </button>
                                <button 
                                    onClick={() => setShowSettings(!showSettings)} 
                                    className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all" 
                                    title="Settings"
                                >
                                    <Settings size={18} />
                                </button>
                                <button onClick={clearChat} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all" title="Clear History">
                                    <Trash2 size={18} />
                                </button>
                                <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all hidden md:block">
                                    {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all">
                                    <X size={20} />
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
                                    className="px-6 py-4 bg-slate-50 border-b border-slate-200 space-y-3 overflow-hidden"
                                >
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-slate-700">Sound Effects</label>
                                        <button
                                            onClick={() => setConfig(p => ({ ...p, soundEnabled: !p.soundEnabled }))}
                                            className={`w-12 h-6 rounded-full transition-all ${config.soundEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${config.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-slate-700">Theme</label>
                                        <select 
                                            value={config.theme}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setConfig(p => ({ ...p, theme: e.target.value as any }))}
                                            className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                                        >
                                            <option value="light">Light</option>
                                            <option value="dark">Dark</option>
                                            <option value="spiritual">Spiritual</option>
                                        </select>
                                    </div>
                                    <button 
                                        onClick={exportConversation}
                                        className="w-full px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download size={14} /> Export Conversation
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Analytics Panel */}
                        <AnimatePresence>
                            {showAnalytics && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-6 py-4 bg-slate-50 border-b border-slate-200 space-y-3 overflow-hidden"
                                >
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                                            <p className="text-slate-500 font-semibold">Messages</p>
                                            <p className="text-lg font-bold text-brand-600">{analytics.totalMessages}</p>
                                        </div>
                                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                                            <p className="text-slate-500 font-semibold">Engagement</p>
                                            <p className="text-lg font-bold text-amber-600">{conversationContext.engagementLevel}%</p>
                                        </div>
                                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                                            <p className="text-slate-500 font-semibold">Satisfaction</p>
                                            <p className="text-lg font-bold text-emerald-600">{analytics.positivePercentage}%</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Chat Context / Quote */}
                        <div className="bg-brand-50/50 px-6 py-2 border-b border-brand-100 flex items-center gap-2">
                            <Quote size={12} className="text-brand-400" />
                            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-tighter italic whitespace-nowrap overflow-hidden">
                                "Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(91,71,208,0.03),transparent)]">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                                            msg.sender === 'bot' 
                                            ? 'bg-gradient-to-br from-brand-600 to-indigo-700 text-white' 
                                            : 'bg-slate-800 text-white'
                                        }`}>
                                            {msg.sender === 'bot' ? <Sparkles size={16} /> : <Hand size={16} />}
                                        </div>
                                        <div className="space-y-2 w-full">
                                            <div className={`px-5 py-4 rounded-3xl shadow-sm text-sm leading-relaxed ${
                                                msg.sender === 'bot'
                                                ? 'bg-white border border-brand-100 text-slate-700 rounded-tl-none'
                                                : 'bg-gradient-to-br from-brand-700 to-indigo-800 text-white rounded-tr-none shadow-brand-900/20'
                                            }`}>
                                                {msg.text}
                                            </div>
                                            
                                            {msg.options && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {msg.options.map((opt, i) => (
                                                        <motion.button
                                                            key={i}
                                                            whileHover={{ scale: 1.05, y: -2 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleOptionClick(opt)}
                                                            className="px-4 py-2 bg-white border border-brand-200 rounded-full text-brand-700 text-xs font-bold hover:bg-brand-50 hover:border-brand-400 transition-all shadow-sm"
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
                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center animate-pulse">
                                        <Loader className="w-4 h-4 text-brand-400 animate-spin" />
                                    </div>
                                    <div className="h-10 px-6 bg-brand-50 rounded-full flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-brand-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 bg-brand-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 bg-brand-300 rounded-full animate-bounce" />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Royal Footer */}
                        <div className="p-6 bg-white border-t border-brand-50">
                            <form onSubmit={handleSendMessage} className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-brand-400 to-indigo-500 rounded-[28px] blur opacity-10 group-focus-within:opacity-25 transition duration-1000 group-focus-within:duration-200"></div>
                                <div className="relative flex items-center gap-3 p-2 bg-slate-50/50 border border-slate-200 rounded-[24px] focus-within:bg-white focus-within:border-brand-500/50 transition-all">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Seek guidance or ask about ministry..."
                                        className="flex-1 px-4 py-3 bg-transparent text-slate-700 placeholder-slate-400 text-sm focus:outline-none"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={!inputValue.trim() || isTyping}
                                        type="submit"
                                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white flex items-center justify-center shadow-xl shadow-brand-900/20 disabled:grayscale disabled:opacity-50 transition-all"
                                    >
                                        <Send size={20} className={inputValue.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
                                    </motion.button>
                                </div>
                            </form>
                            <p className="text-center mt-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
                                Guided by the spirit · Powered by <span className="text-brand-400">S.Shaveesh Jeshurun</span>
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
