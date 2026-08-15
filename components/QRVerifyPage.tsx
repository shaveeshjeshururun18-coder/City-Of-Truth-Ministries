import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Download, Shield, ArrowLeft, LogIn, Smartphone } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';
import { EntrustCard3D } from './WorshipperIDCard';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { addCenteredCardPage } from './pdfCardUtils';

interface QRVerifyPageProps {
    userId: string;
    onBack?: () => void;
    onProceedToDashboard?: (identifier: string) => void;
}

export const QRVerifyPage: React.FC<QRVerifyPageProps> = ({ userId, onBack, onProceedToDashboard }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSavingWallet, setIsSavingWallet] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const isApprovedUser = user?.status === 'Active' && !user.id.toUpperCase().startsWith('TEMP-');

    useEffect(() => {
        const loadUser = async () => {
            if (!userId) { setError('Invalid verification link.'); setLoading(false); return; }
            try {
                const found = await api.getUserByVerificationToken(userId);
                if (found) {
                    setUser(found);
                } else {
                    setError('This verification link is invalid or has expired.');
                }
            } catch (e) {
                setError('Failed to load member data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, [userId]);

    const handleDownloadPDF = async () => {
        if (!user || user.status !== 'Active') {
            alert('Entrust card download is available only after admin approval.');
            return;
        }
        if (user.id.toUpperCase().startsWith('TEMP-')) {
            alert('Temporary accounts are banned from downloading Entrust cards. Please contact admin for a permanent COT ID.');
            return;
        }
        setIsDownloading(true);
        try {
            const frontNode = document.getElementById('qr-verify-front');
            const backNode = document.getElementById('qr-verify-back');
            if (!frontNode || !backNode) {
                alert('Card elements not ready. Please wait a moment and try again.');
                setIsDownloading(false);
                return;
            }
            const opts = { pixelRatio: 3, quality: 1, backgroundColor: '#ffffff', cacheBust: true };
            const [frontDataUrl, backDataUrl] = await Promise.all([
                toPng(frontNode, opts),
                toPng(backNode, opts)
            ]);
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
            addCenteredCardPage(pdf, frontDataUrl, 'PNG', true);
            addCenteredCardPage(pdf, backDataUrl, 'PNG', false);
            pdf.save(`ENTRUST-CARD-${user?.id}.pdf`);
            setDownloaded(true);
        } catch (err: any) {
            console.error('Download failed', err);
            alert(`PDF generation failed: ${err?.message || 'Unknown error'}. Please try clicking the Download button manually.`);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleSaveToWallet = async () => {
        if (!user) return;
        setIsSavingWallet(true);
        try {
            const frontNode = document.getElementById('qr-verify-front');
            if (!frontNode) return;
            const opts = { pixelRatio: 3, quality: 1, backgroundColor: '#ffffff', cacheBust: true };
            const dataUrl = await toPng(frontNode, opts);
            
            const link = document.createElement('a');
            link.download = `COT-MOBILE-PASS-${user?.id}.png`;
            link.href = dataUrl;
            link.click();
            setDownloaded(true);
        } catch (err: any) {
            console.error('Wallet save failed', err);
            alert(`Mobile Pass generation failed: ${err?.message || 'Unknown error'}`);
        } finally {
            setIsSavingWallet(false);
        }
    };

    useEffect(() => {
        if (isApprovedUser && !downloaded && !isDownloading) {
            // Wait for all images in the hidden nodes to fully load before capturing
            const waitForImages = () => {
                const container = document.querySelector('#qr-verify-front, #qr-verify-back');
                if (!container) return Promise.resolve();
                const imgs = Array.from(document.querySelectorAll('#qr-verify-front img, #qr-verify-back img')) as HTMLImageElement[];
                const imgsToLoad = imgs.filter(img => !img.complete || img.naturalWidth === 0);
                if (imgsToLoad.length === 0) return Promise.resolve();

                return Promise.all(
                    imgsToLoad.map(img => new Promise<void>((resolve) => {
                        img.onload = () => resolve();
                        img.onerror = () => resolve(); // resolve on error too to avoid hanging
                        setTimeout(resolve, 3000); // max 3s wait per image
                    }))
                ).then(() => {});
            };

            const timer = setTimeout(async () => {
                await waitForImages();
                // Extra buffer for layout paint
                await new Promise(r => setTimeout(r, 500));
                handleDownloadPDF();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isApprovedUser, downloaded, isDownloading]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 flex flex-col items-center px-4 py-8">
            {/* Hidden capture nodes */}
            {user && isApprovedUser && (
                <div className="fixed left-[-9999px] top-0 pointer-events-none z-0">
                    <div id="qr-verify-front" className="bg-white">
                        <EntrustCard3D name={user.name} email={user.email} location={user.location} emergency={user.emergency} uniqueId={user.id} memberSince={user.joinedDate || user.memberSince} photo={user.photo} status={user.status} isStatic={true} isBackSide={false} cardThemeTone="blue" cardLayoutMode={user.cardLayoutMode} cardShapeMode={user.cardShapeMode} cardSizeMode={user.cardSizeMode} />
                    </div>
                    <div id="qr-verify-back" className="bg-white">
                        <EntrustCard3D name={user.name} email={user.email} location={user.location} emergency={user.emergency} uniqueId={user.id} memberSince={user.joinedDate || user.memberSince} photo={user.photo} status={user.status} isStatic={true} isBackSide={true} cardThemeTone="blue" cardLayoutMode={user.cardLayoutMode} cardShapeMode={user.cardShapeMode} cardSizeMode={user.cardSizeMode} />
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="w-full max-w-md mb-8 flex items-center justify-between">
                {onBack && (
                    <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors text-sm font-medium">
                        <ArrowLeft size={16} /> Back
                    </button>
                )}
                <div className="flex items-center gap-3 mx-auto">
                    <img src="/logo.png" alt="COT Logo" className="w-10 h-10 object-contain" />
                    <div>
                        <p className="font-bold text-slate-900 text-sm leading-none">City of Truth</p>
                        <p className="text-[10px] text-brand-600 font-bold uppercase tracking-widest">Ministries</p>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {loading && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6 mt-20">
                        <div className="relative w-20 h-20">
                            <div className="absolute inset-0 rounded-full border-4 border-brand-100 animate-pulse" />
                            <div className="absolute inset-0 rounded-full border-t-4 border-brand-600 animate-spin" />
                            <img src="/logo.png" alt="" className="absolute inset-2 w-12 h-12 object-contain" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-slate-800">Verifying Identity</h2>
                            <p className="text-slate-500 text-sm mt-1">Checking central records...</p>
                        </div>
                    </motion.div>
                )}

                {!loading && error && (
                    <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-red-100 text-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="text-red-500 w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h2>
                        <p className="text-slate-500 text-sm leading-relaxed">{error}</p>
                        <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-xs text-slate-400 font-medium">This QR code may be invalid, expired, or the member has not been verified yet.</p>
                        </div>
                    </motion.div>
                )}

                {!loading && user && (
                    <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-6">
                        {/* 256-Bit Cryptographic Security Badge */}
                        <div className="px-3.5 py-2 rounded-2xl bg-slate-900 text-amber-300 border border-slate-700 flex items-center justify-between text-xs shadow-md">
                            <div className="flex items-center gap-2 font-mono font-bold text-[11px] tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                <span>🔒 256-BIT CRYPTOGRAPHIC LINK</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">SEC-V1 ENCRYPTED</span>
                        </div>

                        {/* Status Banner */}
                        <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${
                            user.status === 'Active'
                                ? 'bg-green-50 border-green-200'
                                : user.status === 'Rejected'
                                    ? 'bg-red-50 border-red-200'
                                    : 'bg-amber-50 border-amber-200'
                        }`}>
                            {user.status === 'Active'
                                ? <CheckCircle className="text-green-500 shrink-0" size={22} />
                                : user.status === 'Rejected'
                                    ? <XCircle className="text-red-500 shrink-0" size={22} />
                                    : <Shield className="text-amber-500 shrink-0" size={22} />
                            }
                            <div>
                                <p className={`font-bold text-sm ${
                                    user.status === 'Active'
                                        ? 'text-green-800'
                                        : user.status === 'Rejected'
                                            ? 'text-red-800'
                                            : 'text-amber-800'
                                }`}>
                                    {user.status === 'Active'
                                        ? '✓ Verified Active Member'
                                        : user.status === 'Rejected'
                                            ? '✕ Verification Rejected'
                                            : '⏳ Pending Verification'}
                                </p>
                                <p className={`text-xs mt-0.5 ${
                                    user.status === 'Active'
                                        ? 'text-green-600'
                                        : user.status === 'Rejected'
                                            ? 'text-red-600'
                                            : 'text-amber-600'
                                }`}>
                                    {user.status === 'Active'
                                        ? 'This member is officially registered and active.'
                                        : user.status === 'Rejected'
                                            ? 'This member cannot download the entrust card because approval was rejected.'
                                            : 'This member is awaiting admin approval and cannot download the entrust card yet.'}
                                </p>
                            </div>
                        </div>

                        {/* Member Info Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 overflow-hidden shrink-0">
                                    {user.photo
                                        ? <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-brand-600">{user.name.charAt(0)}</div>
                                    }
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 leading-tight">{user.name}</h2>
                                    <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mt-0.5">{user.role || 'Member'}</p>
                                    <p className="text-xs font-mono text-slate-400 mt-1">{user.id}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Location', value: user.location },
                                    { label: 'Joined Date', value: user.memberSince },
                                ].map(item => item.value && (
                                    <div key={item.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                                        <p className="text-sm font-bold text-slate-700 truncate">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ID Card Preview */}
                        {isApprovedUser ? (
                            <div className="flex justify-center">
                                <EntrustCard3D
                                    name={user.name}
                                    email={user.email}
                                    location={user.location}
                                    emergency={user.emergency}
                                    uniqueId={user.id}
                                    memberSince={user.memberSince}
                                    photo={user.photo}
                                    status={user.status}
                                    cardThemeTone="blue"
                                    cardLayoutMode={user.cardLayoutMode}
                                    cardShapeMode={user.cardShapeMode}
                                    cardSizeMode={user.cardSizeMode}
                                />
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                                <Shield className="mx-auto text-slate-400 mb-3" size={30} />
                                <h3 className="text-base font-bold text-slate-800">Entrust card locked</h3>
                                <p className="text-sm text-slate-500 mt-2">
                                    Admin approval is required before this entrust card can be previewed or downloaded.
                                </p>
                            </div>
                        )}

                        {/* Download Buttons */}
                        {isApprovedUser && (
                            <div className="flex flex-col gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSaveToWallet}
                                    disabled={isSavingWallet || isDownloading}
                                    className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                                >
                                    {isSavingWallet ? (
                                        <><Loader2 className="animate-spin" size={20} /> Generating Pass...</>
                                    ) : (
                                        <><Smartphone size={20} /> Save to Mobile Wallet (Photos)</>
                                    )}
                                </motion.button>
                                
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleDownloadPDF}
                                    disabled={isDownloading || isSavingWallet}
                                    className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-brand-600 to-accent-600 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/30 hover:shadow-xl transition-all disabled:opacity-70"
                                >
                                    {isDownloading ? (
                                        <><Loader2 className="animate-spin" size={20} /> Generating PDF...</>
                                    ) : (
                                        <><Download size={20} /> Download PDF Version</>
                                    )}
                                </motion.button>
                            </div>
                        )}

                        {onProceedToDashboard && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onProceedToDashboard(user.id)}
                                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white text-brand-700 font-bold rounded-2xl shadow-sm border border-brand-200 hover:bg-brand-50 transition-all"
                            >
                                <LogIn size={20} />
                                Proceed to Dashboard
                            </motion.button>
                        )}

                        <p className="text-center text-xs text-slate-400 pb-4">
                            Verified by City of Truth Ministries System
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
