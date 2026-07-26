import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Maximize2, Minimize2, Loader, Trash2, BookOpen, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { generateSpatulaAIResponse, streamSpatulaAIResponse } from '../services/openRouterService';
import LordIconWrapper from './LordIconWrapper';

interface Message {
    id: string;
    text: string;
    sender: 'bot' | 'user';
    timestamp: Date;
    options?: string[];
}

export default function AIChatAssistant({ isAdmin = false, onHelpHighlight }: { isAdmin?: boolean; onHelpHighlight?: (target: string, title: string, message: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    // Looping label visibility state: cycles between shown and hidden
    const [labelVisible, setLabelVisible] = useState(true);
    const labelCycleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const labelControls = useAnimation();
    // For admin, always start at origin — never use a saved drag offset that might be off-screen
    const [position, setPosition] = useState(() => {
        if (isAdmin) return { x: 0, y: 0 };
        try {
            const saved = localStorage.getItem('cot_chat_widget_position');
            return saved ? JSON.parse(saved) : { x: 0, y: 0 };
        } catch {
            return { x: 0, y: 0 };
        }
    });

    const handleDragEnd = (_event: any, info: any) => {
        const newPos = {
            x: position.x + info.offset.x,
            y: position.y + info.offset.y
        };
        setPosition(newPos);
        try {
            localStorage.setItem('cot_chat_widget_position', JSON.stringify(newPos));
        } catch {}
    };
    const [widgetSettings, setWidgetSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('cot_widget_settings');
            const defaults = {
                cotChatVisible: true,
                aiVisible: true,
                cotChatSize: 1,
                aiSize: 1,
                cotChatLabelVisible: true,
                cotChatLabelText: 'Ask Divine AI Assistant',
                aiLabelText: 'Ask Divine AI Assistant',
                aiPosition: 'right',
            };
            if (!saved) return defaults;
            const parsed = JSON.parse(saved);
            return {
                ...defaults,
                ...parsed,
                cotChatVisible: parsed.aiVisible !== false && parsed.cotChatVisible !== false,
                cotChatSize: parsed.aiSize || parsed.cotChatSize || 1,
                cotChatLabelText: parsed.aiLabelText || parsed.cotChatLabelText || 'Ask Divine AI Assistant',
                aiPosition: parsed.aiPosition || 'right',
            };
        } catch {
            return {
                cotChatVisible: true,
                aiVisible: true,
                cotChatSize: 1,
                aiSize: 1,
                cotChatLabelVisible: true,
                cotChatLabelText: 'Ask Divine AI Assistant',
                aiLabelText: 'Ask Divine AI Assistant',
                aiPosition: 'right',
            };
        }
    });

    useEffect(() => {
        const handleWidgetSettingsUpdate = () => {
            try {
                const saved = localStorage.getItem('cot_widget_settings');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    const defaults = {
                        cotChatVisible: true,
                        aiVisible: true,
                        cotChatSize: 1,
                        aiSize: 1,
                        cotChatLabelVisible: true,
                        cotChatLabelText: 'Ask Divine AI Assistant',
                        aiLabelText: 'Ask Divine AI Assistant',
                        aiPosition: 'right',
                    };
                    setWidgetSettings({
                        ...defaults,
                        ...parsed,
                        cotChatVisible: parsed.aiVisible !== false && parsed.cotChatVisible !== false,
                        cotChatSize: parsed.aiSize || parsed.cotChatSize || 1,
                        cotChatLabelText: parsed.aiLabelText || parsed.cotChatLabelText || 'Ask Divine AI Assistant',
                        aiPosition: parsed.aiPosition || 'right',
                    });
                }
            } catch (e) {}
        };
        window.addEventListener('widget-settings-updated', handleWidgetSettingsUpdate);
        return () => window.removeEventListener('widget-settings-updated', handleWidgetSettingsUpdate);
    }, []);

    // Looping label animation: appear for 3.5s, slide out, wait 2s, repeat
    useEffect(() => {
        if (isOpen) return;
        if (!(widgetSettings.cotChatLabelVisible ?? true)) return;

        let cancelled = false;
        const cycle = async () => {
            while (!cancelled) {
                // Slide IN
                await labelControls.start({ opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } });
                // Stay visible
                await new Promise(r => setTimeout(r, 3500));
                if (cancelled) break;
                // Slide OUT (goes inside/disappears)
                const outX = widgetSettings.aiPosition === 'left' ? -28 : 28;
                await labelControls.start({ opacity: 0, x: outX, transition: { duration: 0.45, ease: [0.4, 0, 1, 1] } });
                // Hidden pause
                await new Promise(r => setTimeout(r, 2000));
                if (cancelled) break;
            }
        };
        // Start hidden
        const outX = widgetSettings.aiPosition === 'left' ? -28 : 28;
        labelControls.set({ opacity: 0, x: outX });
        setTimeout(cycle, 800); // small initial delay
        return () => { cancelled = true; };
    }, [isOpen, widgetSettings.cotChatLabelVisible, widgetSettings.cotChatLabelText, widgetSettings.aiPosition, labelControls]);

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
            text: isAdmin
                ? "Shalom, Admin! I am your dashboard assistant. I can guide you through the management panels. Ask me how to do anything or select an option below!"
                : "Hi! I'm your City of Truth assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date(),
            options: isAdmin
                ? [
                    "Show me how to manage Users",
                    "How to update page content",
                    "How to manage ID cards",
                    "What is COT ID Manager?",
                    "How to use Firebase tab"
                ]
                : [
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

    const addBotMessage = (text: string, options?: string[]): string => {
        const id = Date.now().toString();
        const newMessage: Message = {
            id,
            text,
            sender: 'bot',
            timestamp: new Date(),
            options
        };
        setMessages(prev => [...prev, newMessage]);
        setIsTyping(false);
        return id;
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
            if (isAdmin && onHelpHighlight) {
                const text = option.toLowerCase();
                if (text.includes("users") || text.includes("manage users")) {
                    onHelpHighlight('#admin-tab-users', 'Users Management Panel', 'Review registered congregation members, verify their profiles, and update their status here.');
                    addBotMessage("I have highlighted the **Users** tab in the sidebar. Click on it to manage your members!");
                    return;
                } else if (text.includes("page content") || text.includes("edit page")) {
                    onHelpHighlight('#admin-tab-edit-page', 'Edit Page Content', 'Update sections, announcements, and headings of the homepage directly.');
                    addBotMessage("I have highlighted the **Edit Page** tab in the sidebar. This allows you to update the live website content.");
                    return;
                } else if (text.includes("id cards") || text.includes("manage id")) {
                    onHelpHighlight('#admin-tab-id-cards', 'Worshipper ID Cards', 'Batch export and download individual or group member cards along with their verification QR codes.');
                    addBotMessage("I have highlighted the **ID Cards** tab in the sidebar. You can manage card print sheets here.");
                    return;
                } else if (text.includes("cot id") || text.includes("allocator")) {
                    onHelpHighlight('#admin-tab-cot-id-manager', 'COT ID Allocator', 'Roll the epic dice or assign custom membership numbers to user accounts.');
                    addBotMessage("I have highlighted the **COT ID Manager** tab. Use this to assign church register numbers.");
                    return;
                } else if (text.includes("firebase")) {
                    onHelpHighlight('#admin-tab-firebase', 'Firebase Database Config', 'Inspect connection logs, clear test records, or restore repository defaults.');
                    addBotMessage("I have highlighted the **Firebase** tab. This panel details connection health and backups.");
                    return;
                }
            }
            handleBotResponse(option);
        }, 1000);
    };

    const handleBotResponse = async (userMessage: string) => {
        try {
            if (isAdmin && onHelpHighlight) {
                const text = userMessage.toLowerCase();
                if (text.includes("user") || text.includes("member")) {
                    onHelpHighlight('#admin-tab-users', 'Users Section', 'Manage and verify your registered church members here.');
                    addBotMessage("I found the Users section! I have highlighted the Users tab for you.", ["Show me how to manage Users", "How to manage ID cards", "What is COT ID Manager?"]);
                    return;
                } else if (text.includes("card") || text.includes("qr") || text.includes("pdf")) {
                    onHelpHighlight('#admin-tab-id-cards', 'ID Cards Section', 'Generate and download member ID cards and QR codes here.');
                    addBotMessage("I found the ID Cards section! I have highlighted it for you.", ["How to manage ID cards", "What is COT ID Manager?"]);
                    return;
                } else if (text.includes("edit") || text.includes("content") || text.includes("page") || text.includes("text")) {
                    onHelpHighlight('#admin-tab-edit-page', 'Edit Page Section', 'Update website headings, sections, and home page texts.');
                    addBotMessage("I found the Edit Page section! I have highlighted it for you.", ["How to update page content", "What is COT ID Manager?"]);
                    return;
                } else if (text.includes("firebase") || text.includes("db") || text.includes("database")) {
                    onHelpHighlight('#admin-tab-firebase', 'Firebase Section', 'Manage the Firestore database connection and settings.');
                    addBotMessage("I found the Firebase section! I have highlighted it for you.", ["How to use Firebase tab", "Show me how to manage Users"]);
                    return;
                } else if (text.includes("cot id") || text.includes("dice") || text.includes("register number")) {
                    onHelpHighlight('#admin-tab-cot-id-manager', 'COT ID Manager', 'Issue and allocate member IDs.');
                    addBotMessage("I found the COT ID Manager! I have highlighted it for you.", ["What is COT ID Manager?", "Show me how to manage Users"]);
                    return;
                }
            }

            // Stream the response word-by-word
            const botMsgId = addBotMessage('', isAdmin
                ? ["Show me how to manage Users", "How to manage ID cards", "What is COT ID Manager?", "How to use Firebase tab"]
                : ["Learn about ministry", "Service times", "Contact us"]
            );

            let fullText = '';
            await streamSpatulaAIResponse(userMessage, (chunk) => {
                fullText += chunk;
                setMessages(prev => prev.map(m =>
                    m.id === botMsgId ? { ...m, text: fullText } : m
                ));
            });
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
        <div ref={containerRef} className={`fixed inset-0 pointer-events-none ${isOpen ? 'z-[999999999]' : 'z-20'}`}>
            <AnimatePresence>
                {/* Floating Chat Button */}
                {!isOpen && (isAdmin || widgetSettings.cotChatVisible !== false) && (
                    <motion.button
                        key="launcher"
                        id="ai-chat-launcher-btn"
                        drag
                        dragMomentum={false}
                        dragElastic={0.08}
                        onDragEnd={handleDragEnd}
                        initial={{ scale: 0, rotate: -180, x: position.x, y: position.y }}
                        animate={{
                            scale: 1 * (widgetSettings?.cotChatSize || 1),
                            rotate: 0,
                            x: position.x,
                            y: isAdmin
                                ? [0, -7, 0, -4, 0]
                                : [position.y, position.y - 7, position.y, position.y - 4, position.y],
                        }}
                        transition={{
                            scale: { duration: 0.5, ease: 'backOut' },
                            rotate: { duration: 0.5, ease: 'backOut' },
                            y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }
                        }}
                        exit={{ scale: 0, rotate: 180 }}
                        whileHover={{ scale: 1.12 * (widgetSettings?.cotChatSize || 1), cursor: 'grab' }}
                        whileTap={{ scale: 0.88 * (widgetSettings?.cotChatSize || 1) }}
                        onClick={() => setIsOpen(true)}
                        className={`pointer-events-auto fixed bottom-6 ${widgetSettings.aiPosition === 'left' ? 'left-6' : 'right-6'} z-20 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center border-2 border-amber-400/60 group`}
                        style={{
                            touchAction: 'none',
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1e40af 100%)',
                            boxShadow: '0 0 0 0 rgba(251,191,36,0.5), 0 8px 32px rgba(15,23,42,0.7)'
                        }}
                        title={widgetSettings.cotChatLabelText || 'Ask Divine AI Assistant'}
                        aria-label={widgetSettings.cotChatLabelText || 'Ask Divine AI Assistant'}
                    >
                        <AnimatePresence>
                            {(widgetSettings.cotChatLabelVisible ?? true) && (
                                <motion.div
                                    animate={labelControls}
                                    initial={{ opacity: 0, x: widgetSettings.aiPosition === 'left' ? -28 : 28 }}
                                    style={{ transformOrigin: widgetSettings.aiPosition === 'left' ? 'left center' : 'right center' }}
                                    className={`absolute ${widgetSettings.aiPosition === 'left' ? 'left-[calc(100%+14px)]' : 'right-[calc(100%+14px)]'} top-1/2 -translate-y-1/2 whitespace-nowrap rounded-2xl border border-amber-300/60 bg-[#0f172a]/95 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-amber-300 shadow-[0_8px_32px_rgba(15,23,42,0.9)] backdrop-blur-md sm:px-4 sm:py-2.5 sm:text-xs z-0 pointer-events-none overflow-hidden`}
                                >
                                    <span className={`flex items-center gap-2 ${widgetSettings.aiPosition === 'left' ? 'flex-row-reverse' : ''}`}>
                                        <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
                                        {widgetSettings.cotChatLabelText || 'Ask Divine AI Assistant'}
                                    </span>
                                    <div className={`absolute top-1/2 -translate-y-1/2 ${widgetSettings.aiPosition === 'left' ? '-left-1.5' : '-right-1.5'} h-3 w-3 rotate-45 border-r border-t border-amber-300/60 bg-[#0f172a]/95`} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Pulse ring */}
                        <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 70%)' }} />

                        {/* COT Bible Icon — inline SVG, always renders */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#fde047"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="relative z-10 w-7 h-7 md:w-8 md:h-8 drop-shadow-[0_0_6px_rgba(253,224,71,0.8)]"
                        >
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>

                        {/* Online dot */}
                        <span className="absolute top-1 right-1 flex h-3 w-3 z-20">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white/50"></span>
                        </span>
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
                            width: isExpanded ? 'calc(100vw - 32px)' : 'min(400px, calc(100vw - 32px))',
                            height: isExpanded ? 'calc(100vh - 32px)' : 'min(580px, calc(100vh - 110px))',
                            right: isExpanded ? 16 : (widgetSettings.aiPosition === 'left' ? 'auto' : 16),
                            left: isExpanded ? 16 : (widgetSettings.aiPosition === 'left' ? 16 : 'auto'),
                            bottom: isExpanded ? 16 : 20
                        }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="pointer-events-auto fixed rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[99999]"
                        style={{
                            maxHeight: 'calc(100vh - 40px)',
                            border: '1px solid rgba(251,191,36,0.3)',
                            background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)',
                            boxShadow: '0 32px 80px rgba(15,23,42,0.45), 0 0 0 1px rgba(251,191,36,0.2)'
                        }}
                    >
                        {/* Header */}
                        <div className="relative flex items-center justify-between px-4 py-3 shadow-lg overflow-hidden"
                            style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2460 45%, #1e3a8a 100%)' }}
                        >
                            {/* Gold shimmer line at top */}
                            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, #FDE047, #D4AF37, transparent)' }} />

                            <div className="flex items-center gap-3 select-none">
                                {/* COT Logo avatar */}
                                <div className="relative w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(212,175,55,0.5)', boxShadow: '0 0 16px rgba(212,175,55,0.25)' }}
                                >
                                    <LordIconWrapper icon="bible" size={28} trigger="hover" colors={{ primary: '#FDE047', secondary: '#ffffff' }} />
                                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-[#0f2460]"></span>
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-base leading-tight" style={{ color: '#FDE047', textShadow: '0 0 12px rgba(253,224,71,0.4)', fontFamily: 'Georgia, serif', letterSpacing: '0.02em' }}>Ancient Wisdom</h3>
                                    <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'rgba(251,191,36,0.7)' }}>• Truth • Scripture • Prayer</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleClearChat}
                                    className="text-amber-300/60 hover:text-amber-300 hover:bg-white/10 p-2 rounded-xl transition-all"
                                    title="Clear Chat"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-amber-300/60 hover:text-amber-300 hover:bg-white/10 p-2 rounded-xl transition-all"
                                >
                                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-amber-300/60 hover:text-red-400 hover:bg-white/10 p-2 rounded-xl transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Scripture banner */}
                        <div className="px-4 py-2 flex items-center gap-2 text-[11px] font-medium" style={{ background: 'linear-gradient(90deg, #0f172a, #1e3a8a)', color: 'rgba(253,224,71,0.85)', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                            <BookOpen size={11} className="flex-shrink-0" style={{ color: '#D4AF37' }} />
                            <span className="italic truncate">"Thy word is a lamp unto my feet" — Psalm 119:105</span>
                            <ChevronRight size={11} className="flex-shrink-0 ml-auto opacity-50" />
                        </div>

                        {/* Messages Container */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth custom-scrollbar"
                            style={{ background: 'linear-gradient(180deg, #f0f4ff 0%, #fafbff 100%)' }}
                        >
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-2.5 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                                        {/* Avatar */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md mt-1 overflow-hidden ${
                                            message.sender === 'bot' ? '' : ''
                                        }`}
                                            style={message.sender === 'bot'
                                                ? { background: 'linear-gradient(135deg, #0a1628, #1e3a8a)', border: '1.5px solid rgba(212,175,55,0.45)', boxShadow: '0 0 10px rgba(212,175,55,0.2)' }
                                                : { background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1.5px solid rgba(255,255,255,0.15)' }
                                            }
                                        >
                                            {message.sender === 'bot'
                                                ? <LordIconWrapper icon="bible" size={20} trigger="hover" colors={{ primary: '#fbbf24', secondary: '#ffffff' }} />
                                                : <div className="text-[9px] font-black text-amber-300 tracking-tight">YOU</div>
                                            }
                                        </div>

                                        <div className="flex flex-col gap-1 w-full">
                                            <div className="flex items-start gap-2 group/msg w-full">
                                                <div
                                                    className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed relative ${
                                                        message.sender === 'bot'
                                                            ? 'rounded-tl-none text-gray-700'
                                                            : 'text-white rounded-tr-none'
                                                    }`}
                                                    style={message.sender === 'bot'
                                                        ? { background: '#ffffff', border: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 2px 12px rgba(15,23,42,0.08)' }
                                                        : { background: 'linear-gradient(135deg, #0f2460, #1e3a8a)', boxShadow: '0 4px 16px rgba(15,23,42,0.3)' }
                                                    }
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

                                            {/* Option Buttons */}
                                            {message.options && message.options.length > 0 && (
                                                <div className="flex flex-wrap justify-start gap-2 mt-2">
                                                    {message.options.map((option, optIndex) => (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            key={optIndex}
                                                            onClick={() => handleOptionClick(option)}
                                                            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm hover:border-amber-400 hover:bg-amber-50"
                                                            style={{ background: '#fff', border: '1px solid rgba(30,58,138,0.25)', color: '#1e3a8a', boxShadow: '0 2px 8px rgba(15,23,42,0.08)' }}
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
                                    className="flex items-center gap-2 text-xs ml-11"
                                    style={{ color: '#64748b' }}
                                >
                                    <Loader className="animate-spin w-3 h-3" style={{ color: '#D4AF37' }} />
                                    <span>Ancient Wisdom is pondering...</span>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.95)', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
                            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 p-1.5 rounded-full shadow-inner focus-within:ring-2 transition-all"
                                style={{ background: '#f1f5f9', border: '1px solid rgba(30,58,138,0.15)', boxShadow: 'inset 0 1px 4px rgba(15,23,42,0.07)' }}
                            >
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
                                    className="w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg disabled:opacity-40 disabled:shadow-none transition-all flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #D4AF37, #f0c93a)', boxShadow: '0 4px 16px rgba(212,175,55,0.45)' }}
                                >
                                    <Send size={15} className={inputValue.trim() ? 'ml-0.5 text-[#0f172a]' : 'text-[#0f172a]'} />
                                </motion.button>
                            </form>
                            <div className="text-center mt-2">
                                <span className="text-[10px] font-medium tracking-wide" style={{ color: '#94a3b8' }}>
                                    <LordIconWrapper icon="bible" size={14} trigger="hover" colors={{ primary: '#D4AF37', secondary: '#94a3b8' }} className="inline-block mr-1 align-middle opacity-80" />
                                    City of Truth Ministries
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
