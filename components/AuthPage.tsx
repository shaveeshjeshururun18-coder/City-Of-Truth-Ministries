import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, ArrowLeft, ArrowRight, Phone, Shield, IdCard, CheckCircle, MapPin, QrCode, UploadCloud, X } from 'lucide-react';
import { Button } from './Button';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

interface AuthPageProps {
    onLogin: (identifier: string) => void;
    onNavigateToRegister: () => void;
    onAdminClick: () => void;
    onBack: () => void;
    users?: any[];
    initialView?: 'choice' | 'login' | 'register' | 'forgot-id';
}

export const AuthPage: React.FC<AuthPageProps> = ({
    onLogin,
    onNavigateToRegister,
    onAdminClick,
    onBack,
    users = [],
    initialView = 'login'
}) => {
    const [view, setView] = useState<'choice' | 'login' | 'register' | 'forgot-id'>(initialView);
    const [identifier, setIdentifier] = useState('');
    const [previewUser, setPreviewUser] = useState<any | null>(null);
    const [searching, setSearching] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [scanningFile, setScanningFile] = useState(false);
    const scannerRef = useRef<any>(null);

    const extractIdentifier = (value: string) => {
        const trimmed = (value || '').trim();
        if (trimmed.includes('/verify/')) return trimmed.split('/verify/')[1]?.split('?')[0]?.trim() || trimmed;
        if (trimmed.includes('/card/')) return trimmed.split('/card/')[1]?.split('?')[0]?.trim() || trimmed;
        try {
            const parsed = JSON.parse(trimmed);
            if (parsed?.id && typeof parsed.id === 'string') return parsed.id.trim();
        } catch (_e) {}
        return trimmed;
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.stop().then(() => {
                scannerRef.current = null;
            }).catch(() => {
                scannerRef.current = null;
            });
        }
    };

    const startLiveScanner = () => {
        const h5 = new (window as any).Html5Qrcode('qr-auth-page-reader');
        scannerRef.current = h5;
        h5.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 260, height: 260 } },
            (decodedText: string) => {
                const qrData = extractIdentifier(decodedText);
                setIdentifier(qrData);
                setShowScanner(false);
                handleSearch(qrData);
            },
            () => {}
        ).catch(() => {
            setShowScanner(false);
        });
    };

    useEffect(() => {
        if (!showScanner) {
            stopScanner();
            return;
        }
        if (!(window as any).Html5Qrcode) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/html5-qrcode';
            script.async = true;
            script.onload = () => startLiveScanner();
            document.body.appendChild(script);
            return;
        }

        const timer = setTimeout(() => {
            startLiveScanner();
        }, 200);

        return () => {
            clearTimeout(timer);
            stopScanner();
        };
    }, [showScanner]);

    const handleFileQRScan = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setScanningFile(true);

        const doScan = () => {
            const hiddenDiv = document.getElementById('qr-auth-page-hidden-reader');
            if (!hiddenDiv) return;
            const h5 = new (window as any).Html5Qrcode('qr-auth-page-hidden-reader');
            const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

            const scanImageFile = async (imageFile: File) => {
                const text = await h5.scanFile(imageFile, true);
                return extractIdentifier(text);
            };

            const scanPdfFile = async (pdfFile: File) => {
                const arrayBuffer = await pdfFile.arrayBuffer();
                const pdf = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: 2 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    if (!context) continue;
                    canvas.width = Math.ceil(viewport.width);
                    canvas.height = Math.ceil(viewport.height);
                    await page.render({ canvasContext: context, viewport }).promise;
                    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
                    if (!blob) continue;
                    try {
                        const pageImage = new File([blob], `page-${pageNum}.png`, { type: 'image/png' });
                        return await scanImageFile(pageImage);
                    } catch (_err) {
                        continue;
                    }
                }
                throw new Error('No valid QR code found in the uploaded PDF pages.');
            };

            (isPdf ? scanPdfFile(file) : scanImageFile(file))
                .then((qrData: string) => {
                    setIdentifier(qrData);
                    setScanningFile(false);

                    const q = qrData.toLowerCase();
                    const found = users.find((u: any) =>
                        (u.phone || '').trim() === qrData ||
                        (u.emergency || '').trim() === qrData ||
                        (u.id || '').toLowerCase() === q ||
                        (u.email || '').toLowerCase() === q ||
                        (u.name || '').toLowerCase() === q
                    );

                    if (found) {
                        setPreviewUser(found);
                    } else {
                        handleSearch(qrData);
                    }
                })
                .catch((err: any) => {
                    setScanningFile(false);
                    alert(err?.message || 'No QR code found in this file. Try a clearer Entrust Card image or PDF.');
                });
            e.target.value = '';
        };

        if ((window as any).Html5Qrcode) { doScan(); }
        else {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/html5-qrcode';
            script.onload = doScan;
            document.head.appendChild(script);
        }
    };

    const handleSearch = (searchVal?: any) => {
        const queryTerm = typeof searchVal === 'string' ? searchVal : identifier;
        if (!queryTerm.trim()) return;

        setSearching(true);
        setNotFound(false);
        setPreviewUser(null);

        const q = queryTerm.trim().toLowerCase();
        const found = users.find(u => {
            return (
                (u.phone || '').trim() === queryTerm.trim() ||
                (u.emergency || '').trim() === queryTerm.trim() ||
                (u.id || '').toLowerCase() === q ||
                (u.email || '').toLowerCase() === q ||
                (u.name || '').toLowerCase() === q
            );
        });

        setTimeout(() => {
            if (found) {
                setPreviewUser(found);
                setNotFound(false);
            } else {
                setNotFound(true);
            }
            setSearching(false);
        }, 400);
    };

    const handleProceed = () => {
        if (previewUser) {
            onLogin(previewUser.id);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative text-brand-900">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.05] pointer-events-none z-0" />

            {/* Header / Hero Area — Royal Navy Variant */}
            <div className="h-64 md:h-80 bg-gradient-to-br from-brand-900 to-brand-950 relative flex flex-col items-center justify-center overflow-hidden flex-shrink-0 px-6">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/30 to-transparent" />
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full scale-150" />
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-400/20 rounded-full scale-150" />

                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="absolute z-20 top-5 left-4 md:top-8 md:left-12 flex items-center gap-2 text-white/90 hover:text-white transition-all bg-white/10 hover:bg-white/20 px-4 md:px-5 py-2 md:py-2.5 rounded-full border border-white/20 group active:scale-95 shadow-lg"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] md:tracking-[0.3em]">Back to Menu</span>
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="z-10 text-center"
                >
                    <h1 className="text-5xl md:text-7xl font-serif text-white font-black tracking-tight mb-4 drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)]">
                        {view === 'choice' ? 'Ministry portal' : view === 'login' ? 'Identity Check' : view === 'register' ? 'Join Us' : 'Find Identity'}
                    </h1>
                    <div className="h-1 w-20 bg-white/30 mx-auto rounded-full mb-6" />
                    <p className="text-brand-50 text-base md:text-lg font-medium tracking-widest max-w-lg mx-auto opacity-80 uppercase">
                        {view === 'choice' ? 'Securing your sacred journey' : view === 'forgot-id' ? 'Retrieve your digital credentials' : 'City of Truth — Member Services'}
                    </p>
                </motion.div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 md:py-20 relative z-10">
                <AnimatePresence mode="wait">
                    {/* Choice Selection View */}
                    {view === 'choice' && (
                        <motion.div
                            key="choice"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10"
                        >
                            {[
                                { id: 'login', icon: <UserIcon size={48} />, title: 'Member Login', desc: 'Access your personal dashboard\nand profile settings', color: 'blue' },
                                { id: 'register', icon: <IdCard size={48} />, title: 'New Registration', desc: 'Apply for membership\nand Entrust Card', color: 'indigo' },
                                { id: 'admin', icon: <Shield size={48} />, title: 'Admin Access', desc: 'Manage users and\ndashboard content', color: 'blue-900' }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (item.id === 'login') setView('login');
                                        else if (item.id === 'register') onNavigateToRegister();
                                        else if (item.id === 'admin') onAdminClick();
                                    }}
                                    className={`group flex flex-col items-center justify-center p-12 bg-white/80 border-2 border-brand-50 hover:border-brand-400 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_100px_rgba(59,130,246,0.1)] hover:-translate-y-2 transition-all duration-500 text-center relative overflow-hidden`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br from-brand-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                                    <div className={`w-24 h-24 mb-8 rounded-[2rem] bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500 shadow-inner relative z-10`}>
                                        {item.icon}
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className={`font-black text-2xl text-brand-900 group-hover:text-brand-700 mb-4 tracking-tight`}>{item.title}</h3>
                                        <p className="text-brand-400/80 font-medium leading-relaxed opacity-80 whitespace-pre-line">{item.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {/* Identity Verification View */}
                    {view === 'login' && (
                        <motion.div
                            key="login"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="max-w-3xl mx-auto space-y-8 md:space-y-12"
                        >
                            <div className="bg-white/80 p-5 sm:p-8 md:p-16 rounded-[2rem] md:rounded-[4rem] border border-brand-50 shadow-[0_30px_100_rgba(59,130,246,0.05)] text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 to-brand-600 opacity-50" />

                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-brand-900 mb-2 md:mb-3 tracking-tight">Identity Verification</h3>
                                <p className="text-brand-400/60 mb-6 md:mb-12 text-sm sm:text-base md:text-lg font-light italic">Securely access your Ministry Dashboard</p>

                                <div className="relative mb-6 md:mb-12">
                                    <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-brand-300">
                                        <UserIcon size={20} className="md:w-7 md:h-7" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter Member ID, Phone, or Email"
                                        className="w-full pl-12 md:pl-16 pr-28 sm:pr-36 md:pr-44 py-4 md:py-7 text-base md:text-xl bg-brand-50/50 text-brand-950 border-2 border-brand-100 rounded-2xl md:rounded-3xl outline-none focus:bg-white focus:ring-8 focus:ring-brand-500/5 focus:border-brand-400/30 transition-all shadow-inner font-bold placeholder:text-brand-200"
                                        value={identifier}
                                        onChange={e => {
                                            let val = e.target.value;
                                            if (val.toLowerCase().startsWith('cot')) {
                                                val = val.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                                                if (val.startsWith('COT') && !val.startsWith('COT-') && val.length > 3) {
                                                    val = 'COT-' + val.substring(3).replace(/-/g, '');
                                                }
                                                if (val.length > 8) val = val.substring(0, 8);
                                            } else if (/^\d/.test(val)) {
                                                val = val.replace(/\D/g, '').substring(0, 10);
                                            }
                                            setIdentifier(val);
                                            setPreviewUser(null);
                                            setNotFound(false);
                                        }}
                                        onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                                    />
                                    <button
                                        onClick={() => handleSearch()}
                                        disabled={!identifier.trim() || searching}
                                        className="absolute right-2 md:right-3 top-2 md:top-3 bottom-2 md:bottom-3 px-4 sm:px-8 md:px-12 bg-brand-600 hover:bg-brand-700 text-white rounded-xl md:rounded-[1.5rem] font-black text-sm md:text-lg transition-all disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-brand-500/40 active:scale-[0.98]"
                                    >
                                        {searching ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <span>Verify</span>}
                                    </button>
                                </div>

                                {/* Smart Auth Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-12">
                                    <button
                                        onClick={() => setShowScanner(!showScanner)}
                                        className={`group flex flex-col items-center justify-center p-5 md:p-8 border-2 rounded-[1.5rem] md:rounded-[2.5rem] transition-all duration-500 ${showScanner ? 'bg-red-50 border-red-200 text-red-600 shadow-xl scale-[1.02]' : 'bg-white border-brand-50 hover:border-brand-200 hover:shadow-2xl shadow-sm'}`}
                                    >
                                        <div className={`w-14 h-14 md:w-20 md:h-20 mb-4 md:mb-6 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all duration-500 ${showScanner ? 'bg-red-100 text-red-600 rotate-90' : 'bg-brand-50 text-brand-400 group-hover:bg-brand-600 group-hover:text-white group-hover:rotate-6'}`}>
                                            {showScanner ? <X size={28} className="md:w-9 md:h-9" /> : <QrCode size={28} className="md:w-9 md:h-9" />}
                                        </div>
                                        <h4 className="font-black text-lg md:text-xl mb-1 md:mb-2 tracking-tight">{showScanner ? 'Close Scanner' : 'Use QR Scanner'}</h4>
                                        <p className="text-[10px] text-brand-300 font-black uppercase tracking-widest">Verify via Digital ID</p>
                                    </button>

                                    <label className="group flex flex-col items-center justify-center p-5 md:p-8 bg-white border-2 border-brand-50 hover:border-brand-200 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer">
                                        <div className="w-14 h-14 md:w-20 md:h-20 mb-4 md:mb-6 rounded-2xl md:rounded-3xl bg-brand-50 text-brand-400 group-hover:bg-brand-600 group-hover:text-white group-hover:-translate-y-1 transition-all duration-500 flex items-center justify-center">
                                            {scanningFile ? <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-brand-400 border-t-transparent rounded-full animate-spin" /> : <UploadCloud size={28} className="md:w-9 md:h-9" />}
                                        </div>
                                        <h4 className="font-black text-lg md:text-xl mb-1 md:mb-2 tracking-tight">Upload File</h4>
                                        <p className="text-[10px] text-brand-300 font-black uppercase tracking-widest">Verify via Document</p>
                                        <input type="file" accept="image/*,application/pdf,.pdf" className="hidden" onChange={handleFileQRScan} disabled={scanningFile} />
                                    </label>
                                </div>
                            </div>

                            {/* QR Scanner Panel */}
                            {showScanner && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] bg-slate-950">
                                    <div className="h-full flex flex-col">
                                        <div className="p-4 bg-slate-900 text-white text-xs text-center font-black uppercase tracking-[0.2em] flex justify-between items-center px-4 md:px-8 border-b border-white/5">
                                            <span className="flex items-center gap-2 font-serif italic"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live Scanner</span>
                                            <button onClick={() => setShowScanner(false)} className="text-white/60 hover:text-white transition-colors">Close ×</button>
                                        </div>
                                        <div className="flex-1 p-2 sm:p-4 relative">
                                            <div id="qr-auth-page-reader" className="w-full h-full min-h-[70vh] rounded-2xl overflow-hidden bg-black" />
                                            <div className="absolute inset-2 sm:inset-4 border-[40px] sm:border-[60px] border-slate-950/40 pointer-events-none rounded-2xl" />
                                            <div className="absolute inset-[48px] sm:inset-[72px] border-2 border-brand-500/40 rounded-3xl pointer-events-none animate-pulse" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Account Status / Preview */}
                            <AnimatePresence>
                                {previewUser && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-[115] bg-black/60 backdrop-blur-sm p-4 md:p-8 overflow-y-auto"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                            className="max-w-3xl mx-auto bg-gradient-to-br from-brand-50 via-white to-brand-100 border-4 border-brand-100 rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-14 shadow-2xl relative overflow-hidden group"
                                        >
                                            <button onClick={() => setPreviewUser(null)} className="absolute top-4 right-4 md:top-6 md:right-6 w-9 h-9 rounded-full bg-white border border-brand-100 text-brand-500 hover:text-brand-700 shadow-sm flex items-center justify-center">
                                                <X size={18} />
                                            </button>
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-400/10 to-transparent opacity-50" />
                                            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 relative z-10">
                                                <div className="relative">
                                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-brand-100 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3">
                                                        {previewUser.photo ? (
                                                            <img src={previewUser.photo} alt={previewUser.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-4xl md:text-5xl font-black text-brand-700">
                                                                {previewUser.name?.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="absolute -bottom-3 -right-3 bg-brand-500 text-white p-2 rounded-2xl shadow-lg border-4 border-white">
                                                        <CheckCircle size={20} className="md:w-6 md:h-6" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 text-center md:text-left">
                                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4 md:mb-6">
                                                        <span className="bg-brand-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-600/20">Verified Member</span>
                                                        <span className="bg-white/80 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-brand-400 border border-brand-100 font-bold">{previewUser.role || 'Member'}</span>
                                                    </div>
                                                    <h4 className="text-2xl md:text-4xl font-serif font-black text-brand-950 mb-3 tracking-tighter">{previewUser.name}</h4>
                                                    <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 text-brand-500 font-medium text-sm md:text-base">
                                                        <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-xl border border-brand-50 shadow-sm"><IdCard size={16} className="text-brand-500" /> {previewUser.id}</div>
                                                        {previewUser.location && <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-xl border border-brand-50 shadow-sm"><MapPin size={16} className="text-brand-500" /> {previewUser.location}</div>}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleProceed}
                                                className="mt-8 md:mt-12 w-full bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-700 hover:to-brand-900 text-white font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-xs sm:text-sm py-4 md:py-7 rounded-[1.2rem] md:rounded-[2rem] transition-all shadow-2xl shadow-brand-500/40 hover:shadow-brand-500/60 active:scale-[0.98] flex items-center justify-center gap-3 md:gap-4 group"
                                            >
                                                Proceed to Dashboard <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
                                            </button>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Not Found Error */}
                            {notFound && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-8 text-center shadow-lg">
                                    <div className="text-red-600 font-black text-lg mb-2">Membership Status: Unknown</div>
                                    <p className="text-red-400 font-medium">We couldn't find an account matching these details. <button onClick={onNavigateToRegister} className="underline font-black hover:text-red-700 transition-colors">Register for an ID Card</button></p>
                                </motion.div>
                            )}

                            {/* Footer Links */}
                            <div className="flex items-center justify-between px-10">
                                <button onClick={() => setView('forgot-id')} className="text-brand-600 hover:text-brand-800 font-black text-xs uppercase tracking-widest bg-brand-50/50 hover:bg-brand-100 px-6 py-3 rounded-2xl transition-all shadow-sm">Forgot Member ID?</button>
                                <div className="h-px flex-1 bg-brand-100/50 mx-10 hidden sm:block" />
                                <button onClick={() => setView('choice')} className="text-brand-300 hover:text-brand-600 font-black text-xs uppercase tracking-widest transition-colors flex items-center gap-2">← Principal Menu</button>
                            </div>
                        </motion.div>
                    )}

                    {/* Registration Choice (Quick View) */}
                    {view === 'register' && (
                        <motion.div key="register" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto py-20 text-center space-y-10">
                            <div className="w-32 h-32 bg-brand-50 text-brand-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner"><IdCard size={64} /></div>
                            <div className="space-y-4">
                                <h3 className="text-4xl font-serif font-black text-brand-900 tracking-tighter">Registration Hub</h3>
                                <p className="text-brand-400 font-light leading-relaxed text-lg">Acquire your official <strong>Entrust Card</strong> to finalize your membership within the COT family.</p>
                            </div>
                            <Button fullWidth onClick={onNavigateToRegister} className="py-7 rounded-[2rem] text-sm shadow-2xl shadow-brand-500/20 bg-brand-600 hover:bg-brand-700">
                                Start Digital Registration <ArrowRight size={20} className="ml-3" />
                            </Button>
                            <button onClick={() => setView('choice')} className="text-brand-400 font-black uppercase tracking-widest text-xs hover:text-brand-600 transition-colors">Back to Options</button>
                        </motion.div>
                    )}

                    {/* Help / Forgot ID View */}
                    {view === 'forgot-id' && (
                        <motion.div key="forgot" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
                            <div className="bg-gradient-to-br from-brand-700 to-brand-900 rounded-[4rem] p-16 text-center text-white shadow-[0_50px_100px_rgba(59,130,246,0.15)] relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full" />

                                <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-white/20 shadow-xl"><Phone size={44} /></div>
                                <h3 className="text-4xl font-serif font-black mb-6 tracking-tight leading-tight">Need Assistance?</h3>
                                <p className="text-brand-50 text-lg font-light mb-12 opacity-80 italic">Connect with our Ministry Support for manual account verification.</p>

                                <a href="tel:+918056125478" className="inline-flex items-center gap-4 px-12 py-6 bg-white text-brand-900 rounded-[2rem] font-black text-2xl shadow-2xl hover:scale-105 transition-all group active:scale-95">
                                    <Phone size={24} className="group-hover:rotate-12 transition-transform" /> +91 80561 25478
                                </a>

                                <div className="mt-12 pt-8 border-t border-white/10 text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Sacred Support Office</div>
                            </div>
                            <button onClick={() => setView('login')} className="block mt-12 mx-auto text-brand-600 hover:text-brand-800 font-black text-xs uppercase tracking-widest transition-all">← Back to Verification</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="py-12 border-t border-brand-50 relative z-10 bg-brand-50/10">
                <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <img src="/brand-logo.png" className="w-10 h-10 object-contain grayscale opacity-20" alt="Logo" />
                        <div className="text-[10px] font-black text-brand-200 uppercase tracking-[0.3em]">City of Truth Ministries © 2026</div>
                    </div>
                    <div className="flex gap-8 text-[10px] font-black text-brand-200 uppercase tracking-[0.3em]">
                        <span className="hover:text-brand-500 cursor-pointer transition-colors">Privacy Seal</span>
                        <span className="hover:text-brand-500 cursor-pointer transition-colors">Digital Covenant</span>
                    </div>
                </div>
            </footer>

            {/* Hidden QR Reader for File Uploads */}
            <div id="qr-auth-page-hidden-reader" style={{ display: 'none' }} />
        </div>
    );
};

declare global {
    interface Window { Html5Qrcode: any; }
}
