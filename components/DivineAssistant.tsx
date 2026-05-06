import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Maximize2, Minimize2, Loader, Sparkles, MessageCircle, Trash2, ChevronDown, Hand, Quote } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { generateSpatulaAIResponse } from '../services/openRouterService';

interface Message {
    id: string;
    text: string;
    sender: 'bot' | 'user';
    timestamp: Date;
    options?: string[];
}

export const DivineAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
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
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragControls = useDragControls();

    // Persist messages
    useEffect(() => {
        try {
            localStorage.setItem('divine_assistant_history', JSON.stringify(messages));
        } catch (e) {
            console.error("Failed to save assistant history", e);
        }
    }, [messages]);

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
                    ["Service Times", "Hebrew Study", "Prayer Request", "About Valparai"]
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

    const handleBotResponse = async (userMessage: string) => {
        try {
            const responseText = await generateSpatulaAIResponse(userMessage);
            addBotMessage(responseText, ["More details", "New topic", "Contact Pastor"]);
        } catch (error) {
            console.error("Assistant Error:", error);
            addBotMessage("I apologize, but I am unable to connect to the divine knowledge base at this moment. Please try again later.", ["Retry"]);
        }
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

    const handleOptionClick = (option: string) => {
        addUserMessage(option);
        setIsTyping(true);
        setTimeout(() => handleBotResponse(option), 800);
    };

    const clearChat = () => {
        if (confirm("Clear our conversation history?")) {
            setMessages([]);
            localStorage.removeItem('divine_assistant_history');
        }
    };

    return (
        <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        key="launcher"
                        initial={{ scale: 0, opacity: 0, rotate: -45 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0, rotate: 45 }}
                        whileHover={{ scale: 1.1, boxShadow: "0 20px 40px rgba(91, 71, 208, 0.4)" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="pointer-events-auto fixed bottom-6 right-6 md:bottom-10 md:right-10 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 shadow-[0_15px_35px_-5px_rgba(37,30,121,0.5)] border border-white/20 flex items-center justify-center group pointer-events-auto"
                    >
                        <div className="relative">
                            <Sparkles className="w-8 h-8 text-white animate-pulse" />
                            <motion.div 
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-white rounded-full blur-xl -z-10"
                            />
                        </div>
                        {/* Tooltip */}
                        <div className="absolute right-full mr-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/40 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 hidden md:block">
                            <p className="text-brand-900 font-bold text-sm whitespace-nowrap">Divine Help</p>
                        </div>
                    </motion.button>
                )}

                {isOpen && (
                    <motion.div
                        drag={!isExpanded}
                        dragControls={dragControls}
                        dragListener={false}
                        dragMomentum={false}
                        dragElastic={0.05}
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
                        <div 
                            onPointerDown={(e) => !isExpanded && dragControls.start(e)}
                            className={`px-6 py-5 bg-gradient-to-r from-brand-700 via-brand-800 to-indigo-950 flex items-center justify-between shadow-lg relative shrink-0 ${!isExpanded ? 'cursor-move' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner relative overflow-hidden group">
                                    <Sparkles className="w-6 h-6 text-white relative z-10" />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-accent-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="select-none">
                                    <h3 className="text-white font-bold text-lg leading-tight tracking-tight">Divine Assistant</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                        <span className="text-brand-100/70 text-[10px] font-black uppercase tracking-widest">Spiritual Presence</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
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

                        {/* Chat Context / Quote */}
                        <div className="bg-brand-50/50 px-6 py-2 border-b border-brand-100 flex items-center gap-2">
                            <Quote size={12} className="text-brand-400" />
                            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-tighter italic whitespace-nowrap overflow-hidden">
                                "Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105
                            </span>
                        </div>

                        {/* Messages Body */}
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
