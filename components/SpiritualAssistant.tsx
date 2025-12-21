
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, BookOpen, Stars } from 'lucide-react';
import { getSpiritualEncouragement } from '../services/geminiService';
import { Button } from './Button';

export const SpiritualAssistant: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setResponse(null);
    const result = await getSpiritualEncouragement(topic);
    setResponse(result);
    setLoading(false);
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-indigo-950"></div>

      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-500/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-brand-100 border border-white/10 mb-6 shadow-lg">
              <Sparkles size={16} className="text-accent-400" />
              <span className="text-sm font-medium tracking-wide">AI Spiritual Companion</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white tracking-tight">Need a Word of Encouragement?</h2>
            <p className="text-brand-100 mb-10 text-lg max-w-2xl mx-auto leading-relaxed">
              In moments of doubt or joy, finding the right scripture can be transformative. Enter a topic below to receive a personalized blessing.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleAsk}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto mb-12"
          >
            <div className="relative flex-1">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md"></div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Anxiety, Hope, Strength..."
                className="relative w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-brand-200 focus:outline-none focus:bg-white/15 focus:border-accent-400/50 backdrop-blur-sm transition-all shadow-inner"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              variant="accent"
              className="md:w-auto px-8 py-4 rounded-2xl"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Thinking...
                </span>
              ) : (
                <span className="flex items-center gap-2 font-bold">Receive <Send size={18} /></span>
              )}
            </Button>
          </motion.form>

          {response && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-accent-400 to-brand-400 rounded-3xl blur opacity-30"></div>
              <div className="bg-white/95 backdrop-blur-xl text-slate-900 p-10 rounded-3xl shadow-2xl max-w-2xl mx-auto relative border border-white/50">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-br from-brand-500 to-brand-600 text-white p-3 rounded-2xl shadow-lg shadow-brand-500/40">
                  <BookOpen size={28} />
                </div>
                <div className="pt-6">
                  <Stars className="w-6 h-6 text-accent-400 mx-auto mb-4 opacity-70" />
                  <p className="text-xl leading-relaxed whitespace-pre-wrap font-medium font-serif text-brand-900 italic">
                    {response}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
