import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Brain, MessageSquare, ArrowRight, Zap, Stars, Send, User, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { getSpiritualEncouragement } from '../services/geminiService';

interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
}

export const AIPage: React.FC = () => {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleAsk = async (e?: React.FormEvent, customPrompt?: string) => {
        if (e) e.preventDefault();
        const textToSubmit = customPrompt || prompt;
        if (!textToSubmit.trim() || isLoading) return;

        const userMsg: ChatMessage = { role: 'user', content: textToSubmit };
        setMessages(prev => [...prev, userMsg]);
        setPrompt("");
        setIsLoading(true);

        try {
            const response = await getSpiritualEncouragement(textToSubmit);
            const aiMsg: ChatMessage = { role: 'ai', content: response };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: "I apologize, but I'm having trouble connecting right now. God's word is always available: 'The Lord is my light and my salvation—whom shall I fear?' (Psalm 27:1)" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-24 md:pt-32 pb-20 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">

                <header className="text-center max-w-3xl mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 border border-indigo-500/30 bg-indigo-900/20 px-4 py-1.5 rounded-full text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md"
                    >
                        <Bot size={14} /> Spiritual Intelligence
                    </motion.div>

                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tight">
                        Divine <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300 italic">AI</span> Assistant
                    </h1>
                    <p className="text-indigo-200/60 text-lg leading-relaxed">Seek scripture, wisdom, and guidance powered by biblical truth.</p>
                </header>

                <div className="w-full max-w-4xl grid lg:grid-cols-[1fr_300px] gap-8">
                    {/* Chat Area */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900/60 border border-indigo-500/20 rounded-3xl overflow-hidden flex flex-col h-[600px] backdrop-blur-xl shadow-2xl"
                    >
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                        <Sparkles size={32} />
                                    </div>
                                    <p className="max-w-xs text-sm">Ask about a bible verse, seek encouragement, or explore theological questions.</p>
                                </div>
                            )}

                            <AnimatePresence initial={false}>
                                {messages.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-brand-600' : 'bg-indigo-600 shadow-lg shadow-indigo-600/20'}`}>
                                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                        </div>
                                        <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[80%] ${msg.role === 'user' ? 'bg-brand-900/40 text-brand-100 rounded-tr-none' : 'bg-slate-800/80 text-white rounded-tl-none border border-white/5'}`}>
                                            {msg.content}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {isLoading && (
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
                                        <Bot size={16} />
                                    </div>
                                    <div className="bg-slate-800/80 px-5 py-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleAsk} className="p-4 bg-black/40 border-t border-white/5">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Type your question..."
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 pr-16 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={!prompt.trim() || isLoading}
                                    className="absolute right-2 top-2 bottom-2 w-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Sidebar / Quick Actions */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/40 border border-indigo-500/10 rounded-3xl p-6">
                            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Common Questions</h3>
                            <div className="space-y-2">
                                {[
                                    'Meaning of Grace',
                                    'Short Prayer for Peace',
                                    'John 3:16 Explanation',
                                    'Psalm 23 for today',
                                    'How to forgive?'
                                ].map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => handleAsk(undefined, q)}
                                        className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium transition-colors flex items-center justify-between group"
                                    >
                                        {q} <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-900/40 to-violet-900/20 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden">
                            <div className="relative z-10">
                                <RefreshCw size={24} className="text-indigo-400 mb-4 opacity-50" />
                                <h4 className="text-sm font-bold mb-2">Clear Session</h4>
                                <p className="text-[10px] text-indigo-300/60 mb-4">Start a new spiritual conversation from scratch.</p>
                                <button
                                    onClick={() => setMessages([])}
                                    className="text-[10px] font-black uppercase tracking-widest text-white underline underline-offset-4"
                                >
                                    Reset Chat
                                </button>
                            </div>
                            <Stars size={100} className="absolute -bottom-8 -right-8 text-white/5 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
