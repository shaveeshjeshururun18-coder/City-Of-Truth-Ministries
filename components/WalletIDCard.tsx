import React, { useState } from 'react';
import { Eye, EyeOff, Share2, Download, Wallet, ShieldCheck, ShieldAlert } from 'lucide-react';

interface WalletIDCardProps {
    id: string; // e.g., 'COT-1932'
    status: 'Active' | 'Pending Verification' | 'Rejected';
    onDownload: () => void;
    onShare?: () => void;
    onAddToWallet?: () => void;
}

export const WalletIDCard: React.FC<WalletIDCardProps> = ({ id, status, onDownload, onShare, onAddToWallet }) => {
    const [showId, setShowId] = useState(false);

    // Extract the numeric part of the ID, assuming format 'COT-1234'
    const idParts = id.split('-');
    const numericPart = idParts.length > 1 ? idParts[1] : id;
    const prefix = idParts.length > 1 ? idParts[0] : 'COT';

    const maskedId = `${prefix} - xxxx xxxx ${numericPart.slice(-4)}`;
    const unmaskedId = id;

    // Use the same production QR URL pattern used everywhere else in the app
    const verificationUrl = `https://city-of-truth-ministries.vercel.app/verify/${id}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}&bgcolor=ffffff&color=${status === 'Active' ? '1e1b4b' : '94a3b8'}&margin=4&format=png`;

    return (
        <div className="w-full mx-auto bg-[#F9F7F5] rounded-3xl p-4 shadow-xl shadow-brand-900/10 flex flex-col gap-4 border border-brand-100">
            {/* Top Identity Card Visual */}
            <div className="relative w-full rounded-[1.25rem] bg-gradient-to-tr from-brand-100 via-white to-accent-50/50 shadow-inner overflow-hidden border border-brand-200" style={{ aspectRatio: '1.6' }}>
                {/* Decorative circles (background) */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-10">
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border-[20px] border-[#D7B56D]" />
                    <div className="absolute -bottom-20 -left-10 w-60 h-60 rounded-full border-[40px] border-brand-500" />
                </div>

                {/* Gold Header Bar with masked ID */}
                <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-r from-[#C9A444] to-[#E8D48A] flex items-center justify-between px-4 z-10 shadow-sm">
                    <span className="font-mono text-[13px] tracking-widest text-slate-800 font-bold truncate pr-2">
                        {showId ? unmaskedId : maskedId}
                    </span>
                    <button
                        onClick={() => setShowId(!showId)}
                        className="text-slate-700 hover:text-black transition-colors shrink-0"
                        title={showId ? "Hide ID" : "Reveal ID"}
                    >
                        {showId ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {/* Central QR / Sleeve Area */}
                <div className="absolute top-14 left-0 w-full h-[calc(100%-3.5rem)] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-3 gap-2 z-10">
                    {status === 'Active' ? (
                        <>
                            <p className="text-[10px] font-semibold text-slate-400 text-center">Scan to verify • Tap QR to reveal ID</p>
                            <div
                                className="relative bg-white p-1.5 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => setShowId(!showId)}
                            >
                                <img
                                    src={qrApiUrl}
                                    alt="Entrust Card QR Code"
                                    className="w-24 h-24 block"
                                    crossOrigin="anonymous"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <ShieldAlert size={32} className="text-amber-400" />
                            <p className="text-[11px] font-bold text-amber-600 text-center">Pending Verification</p>
                            <p className="text-[9px] text-slate-400 text-center">QR code generated after approval</p>
                        </>
                    )}
                </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between pt-1 pb-1 px-1">
                <button onClick={onShare} className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-brand-600 transition-colors group">
                    <div className="w-11 h-11 bg-white rounded-[1rem] flex items-center justify-center shadow-sm border border-slate-100 group-hover:bg-brand-50 group-hover:border-brand-200 transition-all">
                        <Share2 size={18} />
                    </div>
                    <span className="text-[9px] font-bold text-center leading-tight">Selective<br />Share</span>
                </button>

                <button
                    onClick={onDownload}
                    disabled={status !== 'Active'}
                    className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-brand-600 transition-colors group disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <div className="w-11 h-11 bg-white rounded-[1rem] flex items-center justify-center shadow-sm border border-slate-100 group-hover:bg-brand-50 group-hover:border-brand-200 transition-all">
                        <Download size={18} />
                    </div>
                    <span className="text-[9px] font-bold text-center leading-tight">Download<br />Card</span>
                </button>

                <button onClick={onAddToWallet} className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-brand-600 transition-colors group">
                    <div className="w-11 h-11 bg-white rounded-[1rem] flex items-center justify-center shadow-sm border border-slate-100 group-hover:bg-brand-50 group-hover:border-brand-200 transition-all">
                        <Wallet size={18} />
                    </div>
                    <span className="text-[9px] font-bold text-center leading-tight">Add to<br />Wallet</span>
                </button>

                <div className="flex flex-col items-center gap-1.5 cursor-default">
                    <div className={`w-11 h-11 bg-white rounded-[1rem] flex items-center justify-center shadow-sm border border-slate-100 ${status === 'Active' ? 'text-green-500' : 'text-amber-500'}`}>
                        {status === 'Active' ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                    </div>
                    <span className={`text-[9px] font-bold text-center leading-tight ${status === 'Active' ? 'text-green-600' : 'text-amber-600'}`}>
                        {status === 'Active' ? 'Verified' : 'Pending'}<br />Status
                    </span>
                </div>
            </div>
        </div>
    );
};
