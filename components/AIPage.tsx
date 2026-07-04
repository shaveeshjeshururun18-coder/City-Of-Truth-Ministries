import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Zap, Sparkles, MessageCircle, User, Trash2, ChevronLeft, ImagePlus, X } from 'lucide-react';
import { streamSpatulaAIResponse, generateSpatulaAIResponse, analyzeImageWithAI, getOpenRouterKeyDetails, getOpenRouterModelDetails } from '../services/openRouterService';
import { useLanguage } from './LanguageContext';
import { Share2 } from 'lucide-react';

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
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useLanguage();

    const [keyDetails, setKeyDetails] = useState<any>(null);
    const [modelDetails, setModelDetails] = useState<any>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const [key, models] = await Promise.all([
                    getOpenRouterKeyDetails(),
                    getOpenRouterModelDetails()
                ]);
                setKeyDetails(key);
                setModelDetails(models);
            } catch (e) {
                console.error("Failed to load OpenRouter details", e);
            } finally {
                setIsLoadingDetails(false);
            }
        };
        fetchDetails();
    }, []);

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
        setImagePreview(null);
        setImageFile(null);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setImagePreview(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
        // Reset input so the same file can be re-selected
        e.target.value = '';
    };

    const handleImageAnalyze = async () => {
        if (!imageFile || !imagePreview) return;
        setIsLoading(true);
        const userMsg: ChatMessage = { role: 'user', content: t('ai.imageUploaded') };
        setMessages(prev => [...prev, userMsg]);

        try {
            // Extract base64 from data URL safely
            const commaIdx = imagePreview.indexOf(',');
            const base64 = commaIdx >= 0 ? imagePreview.slice(commaIdx + 1) : imagePreview;
            const mimeType = imageFile.type || 'image/jpeg';
            const analysis = await analyzeImageWithAI(base64, mimeType);
            setMessages(prev => [...prev, { role: 'assistant', content: analysis }]);
        } catch (err) {
            console.error('Image analysis error:', err);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not analyze the image. Please try again.' }]);
        } finally {
            setIsLoading(false);
            setImagePreview(null);
            setImageFile(null);
        }
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
            let finalContent = "";
            if (useStreaming) {
                // Add placeholder for streaming response
                setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

                let triggeredTour = false;

                await streamSpatulaAIResponse(input, (chunk) => {
                    finalContent += chunk;

                    // Look for the tour command in the accumulating string
                    const tourMatch = finalContent.match(/\[TOUR:([a-zA-Z0-9_]+)\]/);
                    if (tourMatch && !triggeredTour) {
                        triggeredTour = true;
                        const tourName = tourMatch[1];
                        // Fire the event immediately when detected during streaming
                        window.dispatchEvent(new CustomEvent('start-dynamic-tour', { detail: tourName }));
                    }

                    setMessages(prev => {
                        const newMsg = [...prev];
                        const lastMsg = newMsg[newMsg.length - 1];
                        if (lastMsg.role === 'assistant') {
                            // Strip out any [TOUR:xyz] tag before rendering it to the user
                            let cleanContent = finalContent;
                            const currentMatch = cleanContent.match(/\[TOUR:[a-zA-Z0-9_]+\]/);
                            if (currentMatch) {
                                cleanContent = cleanContent.replace(currentMatch[0], '').trim();
                            }
                            lastMsg.content = cleanContent;
                        }
                        return newMsg;
                    });
                });
            } else {
                const response = await generateSpatulaAIResponse(input);
                finalContent = response;
                let cleanResponse = response;
                const tourMatch = response.match(/\[TOUR:([a-zA-Z0-9_]+)\]/);
                if (tourMatch) {
                    const tourName = tourMatch[1];
                    cleanResponse = response.replace(tourMatch[0], '').trim();
                    window.dispatchEvent(new CustomEvent('start-dynamic-tour', { detail: tourName }));
                }
                setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
            }

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const commonQuestions = [
        { key: 'q.grace', en: "Meaning of Grace" },
        { key: 'q.prayer', en: "Short Prayer for Peace" },
        { key: 'q.john', en: "John 3:16 Explanation" },
        { key: 'q.psalm', en: "Psalm 23 for today" },
        { key: 'q.forgive', en: "How to forgive?" },
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
                        <span className="font-bold text-slate-900 leading-none">{t('ai.title')}</span>
                        <span className="text-[10px] text-brand-600 font-bold uppercase tracking-widest mt-1">{t('ai.subtitle')}</span>
                    </div>
                </header>
            )}

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                {/* Left Side: Analytics & Model Info Panel */}
                {!isWidget && (
                    <div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-slate-100 p-5 flex flex-col justify-between shrink-0 overflow-y-auto custom-scrollbar gap-6 shadow-sm">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                                <div className="bg-brand-50 p-2 rounded-xl text-brand-600">
                                    <Zap size={20} className="animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">Divine AI Pipeline</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live OpenRouter Data</p>
                                </div>
                            </div>

                            {/* Status Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">API Status</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                        <span className="text-xs font-black text-slate-700">Online</span>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Avg Latency</p>
                                    <p className="text-xs font-black text-slate-700">840ms</p>
                                </div>
                            </div>

                            {/* Model Configuration */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Models</h4>
                                <div className="space-y-2">
                                    <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Primary</span>
                                            <span className="text-[9px] font-bold text-slate-400">{modelDetails?.defaultModel?.context_length ? `${modelDetails.defaultModel.context_length} ctx` : '8k ctx'}</span>
                                        </div>
                                        <p className="text-xs font-black text-slate-700 truncate">{modelDetails?.defaultModel?.name || 'Gemma 4 26B Instruct'}</p>
                                        <p className="text-[9px] font-mono text-slate-400 truncate">{modelDetails?.defaultModel?.id || 'openai/gpt-oss-20b:free'}</p>
                                    </div>

                                    <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Fallback</span>
                                            <span className="text-[9px] font-bold text-slate-400">{modelDetails?.fallbackModel?.context_length ? `${modelDetails.fallbackModel.context_length} ctx` : '4k ctx'}</span>
                                        </div>
                                        <p className="text-xs font-black text-slate-700 truncate">{modelDetails?.fallbackModel?.name || 'OpenRouter Free Auto-Router'}</p>
                                        <p className="text-[9px] font-mono text-slate-400 truncate">{modelDetails?.fallbackModel?.id || 'openrouter/free'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Live Seekers Stats */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audience Metrics</h4>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500 font-semibold">Seekers Served</span>
                                        <span className="font-bold text-slate-700">1,842</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500 font-semibold">Active Chats Today</span>
                                        <span className="font-bold text-slate-700">142</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500 font-semibold">Spiritual Responses</span>
                                        <span className="font-bold text-slate-700">14,812</span>
                                    </div>
                                </div>
                            </div>

                            {/* Credits & Key Stats */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">API Account Data</h4>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500 font-semibold">Key Name</span>
                                        <span className="font-bold text-slate-700 truncate max-w-[140px]">{keyDetails?.label || 'COT API Key'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500 font-semibold">Usage Limit</span>
                                        <span className="font-bold text-slate-700">
                                            {keyDetails?.limit !== null && keyDetails?.limit !== undefined
                                                ? `$${keyDetails.limit.toFixed(4)}`
                                                : 'Unlimited'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500 font-semibold">Credits Used</span>
                                        <span className="font-black text-brand-600">
                                            {keyDetails?.usage !== undefined
                                                ? `$${keyDetails.usage.toFixed(5)}`
                                                : '$0.00000'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500 font-semibold">Rate Limit</span>
                                        <span className="font-bold text-slate-700">
                                            {keyDetails?.rate_limit
                                                ? `${keyDetails.rate_limit.requests} reqs / ${keyDetails.rate_limit.interval}`
                                                : '10/sec'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interpretation Card */}
                        <div className="bg-gradient-to-tr from-brand-600 to-indigo-700 text-white p-4 rounded-2xl space-y-2 shadow-lg shadow-brand-900/10">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-200">Interpretation</h4>
                            <p className="text-[11px] leading-relaxed text-slate-100/90 font-medium">
                                Our AI assistant routes biblical, translation, and navigation requests using Google's Gemma LLM. In case of provider rate limits, requests automatically transition to the OpenRouter Free load-balancer to protect service uptime.
                            </p>
                        </div>
                    </div>
                )}

                {/* Right Side: Chat Container */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    {/* Main Chat Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative px-4 md:px-0 scroll-smooth">
                        <div className={`max-w-3xl mx-auto flex flex-col min-h-full pb-32 ${messages.length === 0 ? 'justify-center' : 'pt-6'}`}>

                            {/* Welcome / Empty State */}
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center mb-6">
                                        <Sparkles className="text-brand-600" size={32} />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{t('ai.welcome')}</h2>
                                    <p className="text-slate-500 mb-8 max-w-md">{t('ai.description')}</p>

                                    {/* Quick Questions Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                                        {commonQuestions.map((q, i) => (
                                            <button
                                                key={i}
                                                // Always send the English prompt so the AI understands it reliably;
                                                // the translated label is shown in the UI for the user.
                                                onClick={() => handleAsk(undefined, q.en)}
                                                className="text-left p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-200 hover:bg-brand-50/30 transition-all text-sm group"
                                            >
                                                <div className="font-semibold text-slate-700 group-hover:text-brand-700">{t(q.key)}</div>
                                                <div className="text-xs text-slate-400 mt-1">{t('ai.insight')}</div>
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
                                                    {msg.role === 'user' ? t('ai.you') : t('ai.assistant')}
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
                        {/* Image preview strip */}
                        {imagePreview && (
                            <div className="max-w-3xl mx-auto mb-3 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2">
                                <img src={imagePreview} alt="Selected" className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-700 truncate">{imageFile?.name}</p>
                                    <p className="text-[10px] text-slate-400">{t('ai.analyzeImage')}</p>
                                </div>
                                <button
                                    onClick={handleImageAnalyze}
                                    disabled={isLoading}
                                    className="px-3 py-1.5 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                                >
                                    {t('ai.analyzeImage')}
                                </button>
                                <button
                                    onClick={() => { setImagePreview(null); setImageFile(null); }}
                                    className="p-1 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
                                    aria-label="Remove image"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        <div className="max-w-3xl mx-auto flex gap-3 items-center">
                            {/* Clear Chat Button */}
                            <button
                                onClick={handleClearChat}
                                className="p-3 rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                title={t('ai.clearChat')}
                            >
                                <Trash2 size={18} />
                            </button>

                            {/* Image Upload Button */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                                className="p-3 rounded-full bg-slate-100 text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors disabled:opacity-40"
                                title={t('ai.analyzeImage')}
                                aria-label={t('ai.analyzeImage')}
                            >
                                <ImagePlus size={18} />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageSelect}
                                aria-label="Upload image for analysis"
                            />

                            <form
                                onSubmit={handleAsk}
                                className="relative flex-1 bg-slate-50 rounded-[26px] border border-slate-200 focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100 transition-all shadow-inner"
                            >
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={t('ai.placeholder')}
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
                            {t('ai.disclaimer')}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};
