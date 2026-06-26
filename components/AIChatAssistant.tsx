import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Maximize2, Minimize2, Loader, Sparkles, MessageCircle, Heart, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateSpatulaAIResponse } from '../services/openRouterService';

interface Message {
    id: string;
    text: string;
    sender: 'bot' | 'user';
    timestamp: Date;
    options?: string[];
}

export default function AIChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [widgetSettings, setWidgetSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('cot_widget_settings');
            const defaults = {
                aiVisible: true,
                aiSize: 1,
                aiLabelVisible: true,
                aiLabelText: 'Ask Divine AI Assistant',
            };
            return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
        } catch {
            return {
                aiVisible: true,
                aiSize: 1,
                aiLabelVisible: true,
                aiLabelText: 'Ask Divine AI Assistant',
            };
        }
    });

    useEffect(() => {
        const handleWidgetSettingsUpdate = () => {
            try {
                const saved = localStorage.getItem('cot_widget_settings');
                if (saved) setWidgetSettings(JSON.parse(saved));
            } catch (e) {}
        };
        window.addEventListener('widget-settings-updated', handleWidgetSettingsUpdate);
        return () => window.removeEventListener('widget-settings-updated', handleWidgetSettingsUpdate);
    }, []);

    const [messages, setMessages] = useState<Message[]>(() => {
        try {
            const saved = localStorage.getItem('divine_chat_widget_history');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const greetingTimerRef = useRef<number | null>(null);

    const seedGreeting = () => {
        // Always show a friendly starting point so "Clear chat" never leaves a blank panel.
        const greeting: Message = {
            id: `${Date.now()}-greeting`,
            text: "Hi! I'm your City of Truth assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date(),
            options: [
                "Learn about our ministry",
                "Service times & location",
                "Hebrew studies",
                "Contact information"
            ]
        };
        setMessages([greeting]);
        setIsTyping(false);
    };

    // Persist messages
    useEffect(() => {
        try {
            localStorage.setItem('divine_chat_widget_history', JSON.stringify(messages));
        } catch (e) {
            console.error("Failed to save widget chat history", e);
        }
    }, [messages]);

    const handleClearChat = () => {
        setInputValue('');
        setIsTyping(false);
        localStorage.removeItem('divine_chat_widget_history');
        // Immediately re-seed the greeting to avoid a blank/white chat area.
        seedGreeting();
    };

    const handleDeleteMessage = (id: string) => {
        setMessages(prev => prev.filter(m => m.id !== id));
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!isOpen) return;
        if (messages.length > 0) return;

        if (greetingTimerRef.current) window.clearTimeout(greetingTimerRef.current);
        greetingTimerRef.current = window.setTimeout(() => {
            seedGreeting();
        }, 150);

        return () => {
            if (greetingTimerRef.current) window.clearTimeout(greetingTimerRef.current);
            greetingTimerRef.current = null;
        };
    }, [isOpen, messages.length]);

    const addBotMessage = (text: string, options?: string[]) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            text,
            sender: 'bot',
            timestamp: new Date(),
            options
        };
        setMessages(prev => [...prev, newMessage]);
        setIsTyping(false);
    };

    const addUserMessage = (text: string) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const handleOptionClick = (option: string) => {
        addUserMessage(option);
        setIsTyping(true);

        setTimeout(() => {
            handleBotResponse(option);
        }, 1000);
    };

    const handleBotResponse = async (userMessage: string) => {
        try {
            // Convert app message format to history format for service
            const chatHistory = messages.map(m => ({
                role: m.sender === 'user' ? 'user' : 'model',
                content: m.text
            }));

            const responseText = await generateSpatulaAIResponse(userMessage);

            addBotMessage(responseText,
                // Contextual suggestions based on response (simple logic or randomized for now)
                ["Learn about ministry", "Service times", "Contact us"]
            );
        } catch (error) {
            console.error("Error getting AI response:", error);
            addBotMessage("I apologize, but I'm having trouble connecting right now. Please try again later.", ["Try again"]);
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            addUserMessage(inputValue);
            setInputValue('');
            setIsTyping(true);

            setTimeout(() => {
                handleBotResponse(inputValue);
            }, 1000);
        }
    };

    const formatTime = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            <AnimatePresence>
                {/* Floating Chat Button */}
                {!isOpen && widgetSettings.aiVisible !== false && (
                    <motion.button
                        key="launcher"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1 * (widgetSettings?.aiSize || 1), rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        whileHover={{ scale: 1.1 * (widgetSettings?.aiSize || 1), cursor: 'grab' }}
                        whileTap={{ scale: 0.9 * (widgetSettings?.aiSize || 1) }}
                        onClick={() => setIsOpen(true)}
                        className="pointer-events-auto fixed bottom-6 right-6 z-50 w-12 h-12 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border border-white/20 backdrop-blur-md group"
                        style={{ touchAction: 'none' }}
                        title={widgetSettings.aiLabelText || 'Ask Divine AI Assistant'}
                        aria-label={widgetSettings.aiLabelText || 'Ask Divine AI Assistant'}
                    >
                        {(widgetSettings.aiLabelVisible ?? true) && (
                            <motion.span
                                initial={{ opacity: 0, x: 42, scaleX: 0.25, scaleY: 0.82 }}
                                animate={{
                                    opacity: [0, 1, 1, 0],
                                    x: [42, 0, 0, 42],
                                    scaleX: [0.25, 1, 1, 0.25],
                                    scaleY: [0.82, 1, 1, 0.82],
                                }}
                                transition={{
                                    duration: 5.2,
                                    times: [0, 0.22, 0.7, 1],
                                    repeat: Infinity,
                                    repeatDelay: 0.8,
                                    ease: 'easeInOut',
                                }}
                                style={{ transformOrigin: 'right center' }}
                                className="absolute right-[calc(100%+14px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-2xl border border-violet-200/80 bg-white/95 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-violet-800 shadow-[0_18px_50px_-22px_rgba(124,58,237,0.85)] backdrop-blur-md sm:px-4 sm:py-2.5 sm:text-xs pointer-events-none overflow-hidden"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 shadow-[0_0_14px_rgba(124,58,237,0.75)]" />
                                    {widgetSettings.aiLabelText || 'Ask Divine AI Assistant'}
                                </span>
                                <span className="absolute top-1/2 -right-1.5 h-3 w-3 -translate-y-1/2 rotate-45 border-r border-t border-violet-200/80 bg-white/95" />
                            </motion.span>
                        )}
                        <div className="relative">
                            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white fill-white/20" />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                        </div>
                    </motion.button>
                )}

                {/* Chat Window */}
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            width: isExpanded ? 'calc(100vw - 32px)' : 'min(380px, calc(100vw - 32px))',
                            height: isExpanded ? 'calc(100vh - 32px)' : 'min(560px, calc(100dvh - 120px))',
                            right: isExpanded ? 16 : 16,
                            bottom: isExpanded ? 16 : 80
                        }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="pointer-events-auto fixed bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col border border-white/40 overflow-hidden"
                    >
                        {/* Header */}
                        <div
                            className="cursor-move bg-gradient-to-r from-violet-600 to-indigo-700 px-6 py-4 flex items-center justify-between shadow-lg"
                        >
                            <div className="flex items-center gap-3 select-none">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/10">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg leading-tight">Divine Help</h3>
                                    <p className="text-violet-100/80 text-xs flex items-center gap-1.5 font-medium">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleClearChat}
                                    className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"
                                    title="Clear Chat"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"
                                >
                                    {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-white/70 hover:text-red-400 hover:bg-white/10 p-2 rounded-xl transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Container */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-violet-50/50 to-white/50 scroll-smooth custom-scrollbar">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                                        {/* Avatar */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md mt-1
                                            ${message.sender === 'bot'
                                                ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white'
                                                : 'bg-gradient-to-br from-slate-700 to-slate-800 text-white'
                                            }`}
                                        >
                                            {message.sender === 'bot' ? <Sparkles size={14} /> : <div className="text-[10px] font-bold">YOU</div>}
                                        </div>

                                        <div className="flex flex-col gap-1 w-full">
                                            <div className="flex items-start gap-2 group/msg w-full">
                                                <div
                                                    className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed relative
                                                    ${message.sender === 'bot'
                                                            ? 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'
                                                            : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-none'
                                                        }`}
                                                >
                                                    {message.text}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteMessage(message.id)}
                                                    className="opacity-0 group-hover/msg:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-500 text-slate-300 rounded-full transition-all flex-shrink-0 mt-2"
                                                    title="Delete message"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                            <span className={`text-[10px] text-gray-400 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                                {formatTime(message.timestamp)}
                                            </span>

                                            {/* Option Buttons (Right Aligned for 'Reply' feel) */}
                                            {message.options && message.options.length > 0 && (
                                                <div className="flex flex-wrap justify-end gap-2 mt-2">
                                                    {message.options.map((option, optIndex) => (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            key={optIndex}
                                                            onClick={() => handleOptionClick(option)}
                                                            className="px-3 py-1.5 rounded-xl bg-white border border-violet-200 text-violet-600 text-xs font-semibold hover:bg-violet-50 hover:border-violet-300 transition-all shadow-sm"
                                                        >
                                                            {option}
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
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 text-gray-400 text-xs ml-12"
                                >
                                    <Loader className="animate-spin w-3 h-3" />
                                    <span>Assistant is typing...</span>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
                            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-full shadow-inner focus-within:ring-2 focus-within:ring-violet-200 transition-all">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask for guidance..."
                                    className="flex-1 px-4 py-2 bg-transparent text-gray-700 placeholder-gray-400 text-sm focus:outline-none"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:shadow-none transition-all"
                                >
                                    <Send size={16} className={inputValue.trim() ? "ml-0.5" : ""} />
                                </motion.button>
                            </form>
                            <div className="text-center mt-2.5">
                                <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                                    powered by <span className="text-violet-500">S.Shaveesh Jeshurun</span>
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
