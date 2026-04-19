import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ArrowRight, CheckCircle } from 'lucide-react';

interface DonationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DONATION_FUNDS = [
    { name: 'General Fund', label: 'GF', description: 'Support the overall ministry operations.' },
    { name: 'Building Fund', label: 'BF', description: 'Help build and maintain our sanctuary.' },
    { name: 'Youth Ministry', label: 'YM', description: 'Invest in the next generation.' },
    { name: 'Missions', label: 'MS', description: 'Support outreach and missions work.' },
    { name: 'Valparai Sanctuary', label: 'VS', description: 'Support our Valparai branch.' },
];

const AMOUNTS = [100, 250, 500, 1000];

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
    const [selectedFund, setSelectedFund] = useState(DONATION_FUNDS[0].name);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState('');
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleDonate = () => {
        const amount = selectedAmount ?? Number(customAmount);
        if (!amount || amount <= 0) return;
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setSelectedAmount(null);
            setCustomAmount('');
            setSelectedFund(DONATION_FUNDS[0].name);
            onClose();
        }, 2500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Heart size={20} className="text-white fill-white/50" />
                                <h2 className="text-white font-black text-lg tracking-tight">Give to the Ministry</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white/80 hover:text-white transition-colors rounded-full p-1"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {submitted ? (
                            <div className="flex flex-col items-center justify-center py-12 px-6 gap-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                >
                                    <CheckCircle size={56} className="text-green-500" />
                                </motion.div>
                                <p className="text-lg font-bold text-gray-800 text-center">Thank you for your generosity!</p>
                                <p className="text-sm text-gray-500 text-center">Your donation to <strong>{selectedFund}</strong> is being processed.</p>
                            </div>
                        ) : (
                            <div className="p-6 space-y-5">
                                {/* Fund selection */}
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Select Fund</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {DONATION_FUNDS.map((fund) => (
                                            <button
                                                key={fund.name}
                                                onClick={() => setSelectedFund(fund.name)}
                                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all text-sm font-semibold ${
                                                    selectedFund === fund.name
                                                        ? 'border-orange-400 bg-orange-50 text-orange-700'
                                                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-300'
                                                }`}
                                            >
                                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black ${
                                                    selectedFund === fund.name
                                                        ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white'
                                                        : 'bg-gray-200 text-gray-500'
                                                }`}>
                                                    {fund.label}
                                                </span>
                                                <span className="leading-tight">{fund.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Amount selection */}
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Amount (₹)</p>
                                    <div className="grid grid-cols-4 gap-2 mb-3">
                                        {AMOUNTS.map((amt) => (
                                            <button
                                                key={amt}
                                                onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                                                className={`py-2 rounded-xl border text-sm font-bold transition-all ${
                                                    selectedAmount === amt
                                                        ? 'border-orange-400 bg-orange-500 text-white'
                                                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-300'
                                                }`}
                                            >
                                                ₹{amt}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="Enter custom amount"
                                        value={customAmount}
                                        onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors"
                                        min={1}
                                    />
                                </div>

                                {/* Donate button */}
                                <button
                                    onClick={handleDonate}
                                    disabled={!selectedAmount && !customAmount}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3.5 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-100 transition-transform shadow-lg shadow-orange-400/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                                >
                                    <Heart size={16} className="fill-white/40" />
                                    Donate Now
                                    <ArrowRight size={16} />
                                </button>

                                <p className="text-[11px] text-gray-400 text-center">
                                    All donations support City of Truth Ministries.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
