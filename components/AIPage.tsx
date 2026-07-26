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
    onConfigUpdate?: (config: any) => void;
}

export const AIPage: React.FC<AIPageProps> = ({ isWidget = false, onBack, onConfigUpdate }) => {
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

    // Brutalist AI Button Component
    const BrutalistAIButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
        return (
            <button className="brutalist-button openai button-1" onClick={onClick}>
                <div className="openai-logo">
                    <svg className="openai-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5907 8.3829 14.6108 7.2144a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.3927-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
                            fill="#10A37F"
                        ></path>
                    </svg>
                </div>
                <div className="button-text">
                    <span>Powered By</span>
                    <span>GPT-Omni</span>
                </div>
                <style>{`
                    .brutalist-button {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        width: 142px;
                        height: 142px;
                        color: #e5dede;
                        font-weight: bold;
                        text-decoration: none;
                        position: relative;
                        cursor: pointer;
                        overflow: hidden;
                        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    }
                    .button-1 {
                        background-color: #063525;
                        border: 3px solid #42c498;
                        border-radius: 12px;
                        box-shadow: 4px 4px 1px #000000;
                    }
                    .button-1:hover {
                        background-color: #1a5c46;
                        border-color: #030504;
                        transform: translate(-6px, -6px) rotate(1deg);
                        box-shadow: 10px 10px 0 #000000, 15px 15px 20px rgba(64, 164, 122, 0.2);
                    }
                    .button-1::before,
                    .button-1::after {
                        content: "";
                        position: absolute;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                        transition: 0.6s;
                    }
                    .button-1::before {
                        left: -100%;
                    }
                    .button-1::after {
                        left: 100%;
                    }
                    .button-1:hover::before {
                        animation: swipeRight 1.5s infinite;
                    }
                    .button-1:hover::after {
                        animation: swipeLeft 1.5s infinite;
                    }
                    @keyframes swipeRight {
                        100% {
                            transform: translateX(200%) skew(-45deg);
                        }
                    }
                    @keyframes swipeLeft {
                        100% {
                            transform: translateX(-200%) skew(-45deg);
                        }
                    }
                    .brutalist-button:hover .openai-logo {
                        transform: translateY(-10px);
                    }
                    .brutalist-button:hover .openai-icon {
                        width: 40px;
                        height: 40px;
                    }
                    .brutalist-button:hover .button-text,
                    .brutalist-button:hover .openai-text {
                        opacity: 1;
                        max-height: 60px;
                        margin-top: 8px;
                    }
                    .openai-logo {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                        z-index: 3;
                    }
                    .openai-icon {
                        width: 64px;
                        height: 64px;
                        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    }
                    .openai-text {
                        font-size: 24px;
                        letter-spacing: 0.5px;
                        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                        opacity: 0;
                        max-height: 0;
                        overflow: hidden;
                    }
                    .button-text {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        line-height: 1.2;
                        text-align: center;
                        opacity: 0;
                        max-height: 0;
                        overflow: hidden;
                        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                        z-index: 3;
                    }
                    .button-text span:first-child {
                        font-size: 12px;
                        font-weight: normal;
                    }
                    .button-text span:last-child {
                        font-size: 16px;
                    }
                    @keyframes spin-and-zoom {
                        0% {
                            transform: rotate(0deg) scale(1);
                        }
                        50% {
                            transform: rotate(180deg) scale(1.1);
                        }
                        100% {
                            transform: rotate(360deg) scale(1);
                        }
                    }
                    .brutalist-button:hover .openai-icon {
                        animation: spin-and-zoom 4s cubic-bezier(0.25, 0.8, 0.25, 1) infinite;
                    }
                    .brutalist-button:hover .openai-text {
                        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
                    }
                    .brutalist-button:active .openai-icon,
                    .brutalist-button:active .openai-text,
                    .brutalist-button:active .button-text {
                        transform: scale(0.95);
                    }
                `}</style>
            </button>
        );
    };

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
        <div className={`flex flex-col h-[100dvh] ${isWidget ? 'bg-slate-50 pointer-events-auto' : 'fixed inset-0 bg-slate-50 z-40'} text-slate-800 font-sans selection:bg-brand-100/50 overflow-hidden`}>

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

            <div className={`flex-1 flex ${!isWidget ? 'flex-col lg:flex-row' : 'flex-col'} overflow-hidden relative`}>
                {/* Left Side: Analytics & Model Info Panel */}
                {!isWidget && (
                    <div className="hidden">
                        {/* Left panel removed */}
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

                                    {/* Brutalist AI Button */}
                                    <div className="mb-8">
                                        <BrutalistAIButton onClick={() => {}} />
                                    </div>

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
