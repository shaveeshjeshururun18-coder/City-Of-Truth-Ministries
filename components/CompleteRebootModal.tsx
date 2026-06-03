import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertTriangle, Shield, Trash2, Database, HardDrive, XCircle } from 'lucide-react';
import { Button } from './Button';
import { api } from '../services/api';

interface CompleteRebootModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CompleteRebootModal: React.FC<CompleteRebootModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isExecuting) return;

        setIsExecuting(true);
        setError('');
        setResult(null);

        try {
            const response = await api.completeReboot(password);
            
            if (response.success) {
                setResult(response);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 3000);
            } else {
                setError(response.message);
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 500);
                setPassword('');
            }
        } catch (error: any) {
            setError(`Reboot failed: ${error.message}`);
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
        } finally {
            setIsExecuting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-3xl">
                    <div className="flex items-center gap-3 mb-2">
                        <motion.div
                            animate={{ rotate: result?.success ? 360 : 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"
                        >
                            {result?.success ? (
                                <Shield size={24} className="text-white" />
                            ) : (
                                <AlertTriangle size={24} className="text-white" />
                            )}
                        </motion.div>
                        <div>
                            <h2 className="text-2xl font-black text-white">Complete Reboot</h2>
                            <p className="text-white/80 text-sm">⚠️ DANGER ZONE - Irreversible Action</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Warning Section */}
                    {!result && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-red-700 font-bold">
                                <AlertTriangle size={20} />
                                <span>WARNING: This action cannot be undone!</span>
                            </div>
                            <ul className="space-y-2 text-sm text-red-800">
                                <li className="flex items-start gap-2">
                                    <Database size={16} className="mt-0.5 shrink-0" />
                                    <span>All Firestore collections will be deleted (users, member forms, testimonials, etc.)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <HardDrive size={16} className="mt-0.5 shrink-0" />
                                    <span>All Firebase Storage files will be permanently deleted</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Trash2 size={16} className="mt-0.5 shrink-0" />
                                    <span>All contact messages and member notifications will be deleted</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <XCircle size={16} className="mt-0.5 shrink-0" />
                                    <span>All admin configuration will be reset to defaults</span>
                                </li>
                            </ul>
                        </div>
                    )}

                    {/* Result Display */}
                    {result && (
                        <div className={`rounded-2xl p-4 border-2 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className={`font-bold mb-3 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                                {result.success ? '✓ Reboot Successful!' : '✗ Reboot Failed'}
                            </div>
                            <p className="text-sm mb-3 text-gray-700">{result.message}</p>
                            {result.details && (
                                <div className="space-y-2 text-xs">
                                    <div className="font-bold text-gray-800">Details:</div>
                                    {result.details.firestoreCollections.length > 0 && (
                                        <div>
                                            <div className="font-semibold text-gray-700">Firestore Collections Deleted:</div>
                                            <ul className="list-disc list-inside text-gray-600 ml-2">
                                                {result.details.firestoreCollections.map((item: string, idx: number) => (
                                                    <li key={idx}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {result.details.storageFiles > 0 && (
                                        <div>
                                            <span className="font-semibold text-gray-700">Storage Files Deleted: </span>
                                            <span className="text-gray-600">{result.details.storageFiles}</span>
                                        </div>
                                    )}
                                    {result.details.localStorageKeys.length > 0 && (
                                        <div>
                                            <div className="font-semibold text-gray-700">LocalStorage Keys Cleared:</div>
                                            <ul className="list-disc list-inside text-gray-600 ml-2">
                                                {result.details.localStorageKeys.map((key: string, idx: number) => (
                                                    <li key={idx}>{key}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {result.details.errors.length > 0 && (
                                        <div>
                                            <div className="font-semibold text-red-700">Errors:</div>
                                            <ul className="list-disc list-inside text-red-600 ml-2">
                                                {result.details.errors.map((err: string, idx: number) => (
                                                    <li key={idx}>{err}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Password Form */}
                    {!result && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Reboot Password Phrase
                                </label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="Enter reboot password phrase"
                                        className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 outline-none focus:border-red-500 focus:bg-white transition-all"
                                        autoFocus
                                        disabled={isExecuting}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        disabled={isExecuting}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-3 p-3 bg-red-100 border border-red-300 rounded-xl"
                                >
                                    <AlertTriangle size={18} className="text-red-600 shrink-0" />
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </motion.div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="default"
                                    onClick={onClose}
                                    disabled={isExecuting}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="accent"
                                    disabled={isExecuting || !password.trim()}
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                >
                                    {isExecuting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Database size={18} />
                                            </motion.div>
                                            Executing Reboot...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Trash2 size={18} />
                                            Execute Complete Reboot
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Close button after result */}
                    {result && (
                        <Button
                            variant="default"
                            onClick={onClose}
                            fullWidth
                            className="mt-4"
                        >
                            Close
                        </Button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
