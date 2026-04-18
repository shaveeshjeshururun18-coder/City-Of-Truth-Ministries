import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, CreditCard, Landmark, ArrowRight, CheckCircle2, Sparkles, QrCode } from 'lucide-react';
import { Button } from './Button';

interface DonationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<'amount' | 'method' | 'success'>('amount');
    const [amount, setAmount] = useState<string>('1000');
    const [method, setMethod] = useState<'card' | 'upi' | 'bank'>('upi');

    const handleDonate = () => {
        // Simulated payment flow
        setStep('success');
    };

    const reset = () => {
        setStep('amount');
        setAmount('1000');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={reset}
                        className="absolute inset-0 bg-brand-950/40 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-100"
                    >
                        {/* Premium Header */}
                        <div className="bg-gradient-to-br from-brand-600 to-indigo-900 p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                            <button onClick={reset} className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                            
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                    <Heart className="text-white fill-white/20" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-serif font-bold">Support Our Ministry</h2>
                                    <p className="text-white/60 text-xs font-black uppercase tracking-widest">City of Truth Ministries</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            {step === 'amount' && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                    <div>
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Select Amount</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['500', '1000', '5000'].map((val) => (
                                                <button
                                                    key={val}
                                                    onClick={() => setAmount(val)}
                                                    className={`py-3 rounded-xl border-2 font-bold transition-all ${
                                                        amount === val 
                                                        ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-lg shadow-brand-500/10' 
                                                        : 'border-slate-100 text-slate-500 hover:border-brand-200'
                                                    }`}
                                                >
                                                    ₹{val}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="Custom Amount"
                                            className="w-full pl-10 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-brand-950"
                                        />
                                    </div>

                                    <Button onClick={() => setStep('method')} fullWidth variant="primary" className="py-5 shadow-xl shadow-brand-500/20">
                                        Continue <ArrowRight size={18} />
                                    </Button>
                                    
                                    <p className="text-center text-[10px] text-slate-400 font-medium italic">
                                        "Each of you should give what you have decided in your heart to give." — 2 Cor 9:7
                                    </p>
                                </motion.div>
                            )}

                            {step === 'method' && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Choose Method</label>
                                    
                                    {[
                                        { id: 'upi', icon: QrCode, label: 'UPI / GPay / PhonePe', desc: 'Instant & Secure' },
                                        { id: 'card', icon: CreditCard, label: 'Credit / Debit Card', desc: 'Secure Payment Gateway' },
                                        { id: 'bank', icon: Landmark, label: 'Bank Transfer', desc: 'Direct Transfer to Ministry Account' }
                                    ].map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => setMethod(m.id as any)}
                                            className={`w-full p-5 rounded-2xl border-2 flex items-center gap-5 transition-all text-left ${
                                                method === m.id 
                                                ? 'border-brand-600 bg-brand-50 shadow-lg shadow-brand-500/5' 
                                                : 'border-slate-100 hover:border-brand-200'
                                            }`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method === m.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                <m.icon size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`font-bold text-sm ${method === m.id ? 'text-brand-900' : 'text-slate-600'}`}>{m.label}</h4>
                                                <p className="text-[10px] text-slate-400 font-medium">{m.desc}</p>
                                            </div>
                                            {method === m.id && <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-600"><CheckCircle2 size={14} /></div>}
                                        </button>
                                    ))}

                                    <div className="grid grid-cols-2 gap-4 mt-8">
                                        <Button onClick={() => setStep('amount')} variant="secondary" className="py-4">Back</Button>
                                        <Button onClick={handleDonate} variant="primary" className="py-4">Donate ₹{amount}</Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'success' && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 space-y-6">
                                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                        <CheckCircle2 size={48} className="relative z-10" />
                                        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-emerald-400 rounded-full blur-xl -z-0" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-serif font-bold text-brand-950 mb-2">Thank You for Your Gift!</h3>
                                        <p className="text-slate-500 text-sm max-w-xs mx-auto">Your generous support of ₹{amount} helps us continue spreading God's truth in Valparai.</p>
                                    </div>
                                    <div className="bg-brand-50 p-4 rounded-2xl border border-brand-100 flex items-center gap-3 justify-center">
                                        <Sparkles className="text-accent-500" size={18} />
                                        <span className="text-[10px] font-black text-brand-700 uppercase tracking-widest">Blessings from City of Truth</span>
                                    </div>
                                    <Button onClick={reset} fullWidth variant="secondary" className="py-4 rounded-xl">Close</Button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
