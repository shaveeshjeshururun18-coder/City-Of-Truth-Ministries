import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Zap, Sparkles, MessageCircle, User, Trash2, ChevronLeft } from 'lucide-react';
import { streamSpatulaAIResponse, generateSpatulaAIResponse } from '../services/openRouterService';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface AIPageProps {
    isWidget?: boolean;
    onBack?: () => void;
}

export const AIPage: React.FC<AIPageProps> = ({ isWidget = false, onBack }) => {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        try {
            const saved = localStorage.getItem('divine_ai_chat_history');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [useStreaming, setUseStreaming] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Persist messages to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('divine_ai_chat_history', JSON.stringify(messages));
        } catch (e) {
            console.error("Failed to save chat history", e);
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleClearChat = () => {
        setMessages([]);
        setPrompt("");
    };

    const handleAsk = async (e?: React.FormEvent, customPrompt?: string) => {
        if (e) e.preventDefault();
        const input = customPrompt || prompt;
        if (!input.trim()) return;

        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setPrompt("");
        setIsLoading(true);

        try {
            if (useStreaming) {
                // Add placeholder for streaming response
                setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

                await streamSpatulaAIResponse(input, (chunk) => {
                    setMessages(prev => {
                        const newMsg = [...prev];
                        const lastMsg = newMsg[newMsg.length - 1];
                        if (lastMsg.role === 'assistant') {
                            lastMsg.content += chunk;
                        }
                        return newMsg;
                    });
                });
            } else {
                const response = await generateSpatulaAIResponse(input);
                setMessages(prev => [...prev, { role: 'assistant', content: response }]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const commonQuestions = [
        "Meaning of Grace",
        "Short Prayer for Peace",
        "John 3:16 Explanation",
        "Psalm 23 for today",
        "How to forgive?"
    ];

    return (
        <div className={`flex flex-col h-[100dvh] ${isWidget ? 'bg-slate-50' : 'fixed inset-0 bg-slate-50 z-40'} text-slate-800 font-sans selection:bg-brand-100/50 overflow-hidden`}>

            {/* Header - Back Button for Mobile */}
            {!isWidget && (
                <header className="flex items-center gap-4 p-4 border-b border-slate-100 bg-white shadow-sm shrink-0">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-600"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 leading-none">Divine AI Assistant</span>
                        <span className="text-[10px] text-brand-600 font-bold uppercase tracking-widest mt-1">Satyar Margam Guidance</span>
                    </div>
                </header>
            )}

            {/* Main Chat Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative px-4 md:px-0 scroll-smooth">
                <div className={`max-w-3xl mx-auto flex flex-col min-h-full pb-32 ${messages.length === 0 ? 'justify-center' : 'pt-6'}`}>

                    {/* Welcome / Empty State */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center mb-6">
                                <Sparkles className="text-brand-600" size={32} />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Welcome to City of Truth AI</h2>
                            <p className="text-slate-500 mb-8 max-w-md">Ask any question about our ministry, faith, or the Bible.</p>

                            {/* Quick Questions Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                                {commonQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAsk(undefined, q)}
                                        className="text-left p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-200 hover:bg-brand-50/30 transition-all text-sm group"
                                    >
                                        <div className="font-semibold text-slate-700 group-hover:text-brand-700">{q}</div>
                                        <div className="text-xs text-slate-400 mt-1">Get spiritual insight</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages List */}
                    <div className="flex flex-col gap-6 px-2">
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-4 max-w-[85%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-brand-600' : 'bg-white border border-slate-100'}`}>
                                        {msg.role === 'user' ? (
                                            <User size={16} className="text-white" />
                                        ) : (
                                            <Sparkles size={16} className="text-brand-600" />
                                        )}
                                    </div>

                                    {/* Content bubble */}
                                    <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        {/* Name Label */}
                                        <span className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">
                                            {msg.role === 'user' ? 'You' : 'Divine AI'}
                                        </span>

                                        <div className={`text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-2xl rounded-tr-sm px-5 py-3' : 'bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-sm px-6 py-4'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex gap-4 max-w-[80%]">
                                <div className="w-8 h-8 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                                    <Sparkles size={16} className="text-brand-600" />
                                </div>
                                <div className="flex items-center gap-1.5 h-8 bg-white border border-slate-100 px-4 rounded-full shadow-sm">
                                    <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            {/* Input Area - Fixed Bottom */}
            <div className="shrink-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100">
                <div className="max-w-3xl mx-auto flex gap-3 items-center">
                    {/* Clear Chat Button */}
                    <button
                        onClick={handleClearChat}
                        className="p-3 rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Clear Chat History"
                    >
                        <Trash2 size={18} />
                    </button>

                    <form
                        onSubmit={handleAsk}
                        className="relative flex-1 bg-slate-50 rounded-[26px] border border-slate-200 focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100 transition-all shadow-inner"
                    >
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ask a question..."
                            className="w-full bg-transparent text-slate-800 px-5 py-4 pr-12 outline-none placeholder:text-slate-400 text-base"
                        />
                        <button
                            type="submit"
                            disabled={!prompt.trim() || isLoading}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${prompt.trim() ? 'bg-brand-600 text-white shadow-md hover:bg-brand-700 hover:scale-105' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                            <Send size={18} fill={prompt.trim() ? "currentColor" : "none"} />
                        </button>
                    </form>
                </div>
                <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
                    AI can make mistakes. Verify important information.
                </p>
            </div>

        </div>
    );
};
