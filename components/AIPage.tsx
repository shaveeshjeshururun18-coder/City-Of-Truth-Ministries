import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Brain, Cpu, MessageSquare, ArrowRight, Zap, Stars } from 'lucide-react';
import { Button } from './Button';

export const AIPage: React.FC = () => {
    const [prompt, setPrompt] = useState("");

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-32 pb-20 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 flex flex-col items-center justify-center text-center">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 border border-indigo-500/30 bg-indigo-900/20 px-4 py-1.5 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                >
                    <Bot size={16} />
                    <span>Spiritual Intelligence</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-5xl md:text-7xl font-sans font-bold mb-6 tracking-tight"
                >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-violet-300">Divine</span> <span className="text-indigo-500">AI</span> Assistant
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg md:text-xl text-indigo-200/60 max-w-2xl mx-auto mb-16 leading-relaxed"
                >
                    Explore the intersection of faith and technology. Ask questions, seek scripture, and find spiritual clarity powered by advanced Biblical knowledge models.
                </motion.p>

                {/* Interactive AI Demo Card */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full max-w-4xl bg-slate-900/60 border border-indigo-500/20 rounded-[2rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden group"
                >
                    {/* Glowing border effect */}
                    <div className="absolute inset-0 rounded-[2rem] border border-indigo-500/0 group-hover:border-indigo-500/40 transition-colors duration-500 pointer-events-none"></div>

                    <div className="flex flex-col gap-6">
                        <div className="flex items-start gap-4 text-left">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                                <Sparkles size={20} className="text-white fill-white" />
                            </div>
                            <div className="bg-slate-800/50 p-6 rounded-2xl rounded-tl-none border border-white/5">
                                <p className="text-indigo-100 text-lg">Shalom! I am your spiritual assistant. How can I guide you in your walk of faith today?</p>
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Ask about a bible verse, topic, or prayer..."
                                className="w-full bg-slate-950/80 border border-indigo-500/20 rounded-2xl p-6 pr-32 text-white placeholder:text-indigo-400/30 focus:outline-none focus:border-indigo-500 text-lg transition-all shadow-inner"
                            />
                            <div className="absolute right-3 top-3 bottom-3">
                                <Button className="h-full px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-indigo-600/20">
                                    Ask <Send size={18} />
                                </Button>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-center flex-wrap mt-4">
                            {['Meaning of Grace', 'Psalm 23 Explanation', 'Prayer for Peace'].map((tag, i) => (
                                <button key={i} className="px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-xs font-semibold uppercase tracking-wider text-indigo-300 transition-colors">
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mt-24 text-left w-full max-w-6xl">
                    {[
                        { icon: Brain, title: "Biblical Wisdom", desc: "Trained on thousands of theological resources and scripture to provide accurate insights." },
                        { icon: MessageSquare, title: "Contextual Chat", desc: "Have deep, meaningful conversations that remember your spiritual journey." },
                        { icon: Zap, title: "Instant Answers", desc: "Get immediate scriptural references and guidance for life's pressing questions." }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + (i * 0.1) }}
                            className="bg-slate-900/40 p-10 rounded-[2rem] border border-white/5 hover:bg-slate-800/40 transition-all hover:-translate-y-2 group"
                        >
                            <div className="w-14 h-14 bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all mb-6">
                                <item.icon size={26} />
                            </div>
                            <h3 className="text-xl font-bold font-sans text-indigo-50 mb-4">{item.title}</h3>
                            <p className="text-indigo-200/50 leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

import { Send } from 'lucide-react';
