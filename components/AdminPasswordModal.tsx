import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';
import { Button } from './Button';

interface AdminPasswordModalProps {
    onSuccess: () => void;
}

const ADMIN_PASSWORD_OVERRIDE_KEY = 'cot_admin_password_override';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'ssj18';

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({ onSuccess }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const effectiveAdminPassword = React.useMemo(() => {
        try {
            const override = (localStorage.getItem(ADMIN_PASSWORD_OVERRIDE_KEY) || '').trim();
            if (override) return override;
        } catch {
            // Ignore localStorage access issues.
        }
        return ADMIN_PASSWORD;
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (password === effectiveAdminPassword) {
            setError('');
            onSuccess();
        } else {
            setError('Incorrect password. Please try again.');
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    x: isShaking ? [0, -10, 10, -10, 10, 0] : 0
                }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-2xl p-10 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-400 to-accent-600 rounded-3xl mb-6 shadow-lg shadow-accent-500/50"
                        >
                            <Shield size={40} className="text-white" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl md:text-4xl font-serif font-bold text-white mb-3"
                        >
                            Admin Access
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-white/60 text-sm"
                        >
                            Enter administrator password to continue
                        </motion.p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/80 uppercase tracking-wider ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="Enter admin password"
                                    className="w-full pl-14 pr-14 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder:text-white/30 outline-none focus:border-accent-400 focus:bg-white/10 transition-all"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-xl"
                                >
                                    <AlertCircle size={18} className="text-red-400 shrink-0" />
                                    <p className="text-sm text-red-200 font-medium">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button
                            type="submit"
                            variant="accent"
                            fullWidth
                            className="py-4 text-sm font-black uppercase tracking-wider shadow-xl shadow-accent-500/30"
                        >
                            <Lock size={18} />
                            Access Dashboard
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <p className="text-xs text-white/40">
                            City of Truth Ministries • Admin Portal
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
