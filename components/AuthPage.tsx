import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, ArrowLeft, ArrowRight, Phone, Shield, IdCard, CheckCircle, MapPin, QrCode, UploadCloud, X, UserCheck, UserPlus } from 'lucide-react';
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
    initialIdentifier?: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({
    onLogin,
    onNavigateToRegister,
    onAdminClick,
    onBack,
    users = [],
    initialView = 'login',
    initialIdentifier = ''
}) => {
    const [view, setView] = useState<'choice' | 'login' | 'register' | 'forgot-id'>(initialView);
    const [identifier, setIdentifier] = useState('');
    const [previewUser, setPreviewUser] = useState<any | null>(null);
    const [previewProfileId, setPreviewProfileId] = useState<string | null>(null);
    const [searching, setSearching] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [scanningFile, setScanningFile] = useState(false);
    const [showLoginIntro, setShowLoginIntro] = useState(false);
    const [loginTourStepIndex, setLoginTourStepIndex] = useState<number | null>(null);
    const [loginTourRect, setLoginTourRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
    const scannerRef = useRef<any>(null);
    const LOGIN_TOUR_STEPS = [
        { selector: '#auth-login-identifier', title: 'Enter Member Detail', text: 'Type Member ID, phone, name, or email to find your account.' },
        { selector: '#auth-login-verify-btn', title: 'Verify Account', text: 'Click Verify to check your account quickly.' },
        { selector: '#auth-login-qr-btn', title: 'QR Scanner', text: 'Use live scanner when you have an Entrust QR code.' },
        { selector: '#auth-login-upload-btn', title: 'Upload Entrust Card', text: 'Upload an Entrust image/PDF and we will extract your details.' },
    ];
    const searchableKeys = ['id', 'name', 'email', 'phone', 'emergency', 'location', 'role', 'status', 'dob', 'memberSince', 'gender', 'joinedDate', 'bloodGroup'] as const;

    const normalizeValue = (value: unknown) => String(value ?? '').trim().toLowerCase();

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

    const findUserByQuery = (queryTerm: string): { user: any; profileId: string } | null => {
        const query = normalizeValue(queryTerm);
        if (!query) return null;
        // Exact match on top-level fields
        const exact = users.find((u: any) => searchableKeys.some((key) => normalizeValue(u?.[key]) === query));
        if (exact) return { user: exact, profileId: exact.id };
        // Exact match on linked profiles
        for (const u of users as any[]) {
            const linked = (u.linkedProfiles || []).find((sp: any) =>
                normalizeValue(sp.id) === query || normalizeValue(sp.name) === query
            );
            if (linked) return { user: u, profileId: linked.id };
        }
        if (query.length < 2) return null;
        // Partial match on top-level fields
        const partial = users.find((u: any) => searchableKeys.some((key) => normalizeValue(u?.[key]).includes(query)));
        if (partial) return { user: partial, profileId: partial.id };
        // Partial match on linked profile names
        for (const u of users as any[]) {
            const linked = (u.linkedProfiles || []).find((sp: any) =>
                normalizeValue(sp.name).includes(query)
            );
            if (linked) return { user: u, profileId: linked.id };
        }
        return null;
    };

    const extractIdentifierFromText = (text: string) => {
        if (!text) return '';
        const idMatch = text.match(/\bCOT-?[A-Z0-9]{3,}\b/i);
        if (idMatch?.[0]) return idMatch[0].toUpperCase().replace(/^COT(?!-)/, 'COT-');
        const phoneMatch = text.match(/\b\d{10}\b/);
        if (phoneMatch?.[0]) return phoneMatch[0];
        const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
        if (emailMatch?.[0]) return emailMatch[0];
        const verifyPathMatch = text.match(/\/(verify|card)\/[A-Z0-9-]+/i);
        if (verifyPathMatch?.[0]) return verifyPathMatch[0].split('/').pop() || '';
        return '';
    };

    const extractIdentifierFromFile = async (rawFile: File) => {
        const filenameMatch = extractIdentifierFromText(rawFile.name.replace(/_/g, ' '));
        if (filenameMatch) return filenameMatch;
        try {
            const fileText = await rawFile.text();
            const textMatch = extractIdentifierFromText(fileText);
            if (textMatch) return textMatch;
        } catch (_e) {}
        throw new Error('No usable member details found in this file. Upload an Entrust card image/PDF or a file that includes COT ID/phone/email.');
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

    useEffect(() => {
        const incoming = (initialIdentifier || '').trim();
        if (!incoming) return;
        setIdentifier(incoming);
        handleSearch(incoming);
    }, [initialIdentifier]);

    useEffect(() => {
        if (view !== 'login') return;
        const seen = localStorage.getItem('cot_auth_login_tour_seen') === '1';
        if (!seen) setShowLoginIntro(true);
    }, [view]);

    useEffect(() => {
        if (loginTourStepIndex === null || view !== 'login') return;
        const step = LOGIN_TOUR_STEPS[loginTourStepIndex];
        const target = document.querySelector(step.selector) as HTMLElement | null;
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [loginTourStepIndex, view]);

    useEffect(() => {
        if (loginTourStepIndex === null || view !== 'login') return;
        const updateRect = () => {
            const step = LOGIN_TOUR_STEPS[loginTourStepIndex];
            const target = document.querySelector(step.selector) as HTMLElement | null;
            if (!target) {
                setLoginTourRect(null);
                return;
            }
            const rect = target.getBoundingClientRect();
            setLoginTourRect({ top: rect.top - 8, left: rect.left - 8, width: rect.width + 16, height: rect.height + 16 });
        };
        const timer = setTimeout(updateRect, 220);
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect, true);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect, true);
        };
    }, [loginTourStepIndex, view]);

    const markLoginTourSeen = () => localStorage.setItem('cot_auth_login_tour_seen', '1');
    const startLoginTour = () => {
        markLoginTourSeen();
        setShowLoginIntro(false);
        setLoginTourStepIndex(0);
    };
    const skipLoginTour = () => {
        markLoginTourSeen();
        setShowLoginIntro(false);
        setLoginTourStepIndex(null);
        setLoginTourRect(null);
    };

    const handleFileQRScan = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setScanningFile(true);

        const doScan = () => {
            const hiddenDiv = document.getElementById('qr-auth-page-hidden-reader');
            if (!hiddenDiv) {
                setScanningFile(false);
                alert('Upload scanner is not ready. Please refresh and try again.');
                return;
            }
            const h5 = new (window as any).Html5Qrcode('qr-auth-page-hidden-reader');
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

            const scanSingleFile = async (fileToScan: File) => {
                const isPdf = fileToScan.type === 'application/pdf' || fileToScan.name.toLowerCase().endsWith('.pdf');
                const isImage = fileToScan.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(fileToScan.name);

                if (isPdf) {
                    try { return await scanPdfFile(fileToScan); } catch (error) { console.warn('PDF QR scan failed, falling back to text extraction.', error); }
                    return await extractIdentifierFromFile(fileToScan);
                }
                if (isImage) {
                    try { return await scanImageFile(fileToScan); } catch (error) { console.warn('Image QR scan failed, falling back to text extraction.', error); }
                    return await extractIdentifierFromFile(fileToScan);
                }
                return await extractIdentifierFromFile(fileToScan);
            };

            const scanTask = async () => {
                for (const file of files) {
                    try {
                        const foundId = await scanSingleFile(file);
                        if (foundId) return foundId;
                    } catch (error) {
                        console.warn(`Scan failed for file "${file.name}", trying next file.`, error);
                    }
                }
                throw new Error('No QR code or member details were found in uploaded files. Upload clear Entrust card image/PDF files with visible ID details.');
            };

            scanTask()
                .then((qrData: string) => {
                    setIdentifier(qrData);
                    setScanningFile(false);
                    handleSearch(qrData);
                })
                .catch((err: any) => {
                    setScanningFile(false);
                    alert(err?.message || 'No QR code or member details were found in this file. Try a clearer Entrust Card image/PDF or a file containing member details.');
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

    const handleSearch = useCallback((searchVal?: any) => {
        const queryTerm = typeof searchVal === 'string' ? searchVal : identifier;
        if (!queryTerm.trim()) return;

        setSearching(true);
        setNotFound(false);
        setPreviewUser(null);
        setPreviewProfileId(null);

        const result = findUserByQuery(queryTerm);

        setTimeout(() => {
            if (result) {
                setPreviewUser(result.user);
                setPreviewProfileId(result.profileId);
                setNotFound(false);
            } else {
                setNotFound(true);
            }
            setSearching(false);
        }, 400);
    }, [identifier, users]);

    const handleProceed = () => {
        if (previewUser) {
            const loginId = previewProfileId || previewUser.id || identifier.trim();
            if (!loginId) return;
            onLogin(loginId);
        }
    };
    const heroContainerClass = view === 'login' ? 'h-20 md:h-24 justify-center' : 'h-64 md:h-80 justify-center';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative text-brand-900">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.05] pointer-events-none z-0" />

            {/* Header / Hero Area — Royal Navy Variant */}
            <div className={`${heroContainerClass} bg-gradient-to-br from-brand-900 to-brand-950 relative flex flex-col items-center overflow-hidden flex-shrink-0 px-6`}>
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="absolute z-20 top-5 left-4 md:top-8 md:left-12 flex items-center gap-2 text-white/90 hover:text-white transition-all bg-white/10 hover:bg-white/20 px-4 md:px-5 py-2 md:py-2.5 rounded-full border border-white/20 group active:scale-95 shadow-lg"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] md:tracking-[0.3em]">Back to Menu</span>
                </button>

                {view !== 'login' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="z-10 text-center"
                    >
                        <h1 className="text-5xl md:text-7xl font-serif text-white font-black tracking-tight mb-4 drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)]">
                            {view === 'choice' ? 'Ministry portal' : view === 'register' ? 'Join Us' : 'Find Identity'}
                        </h1>
                        <div className="h-1 w-20 bg-white/30 mx-auto rounded-full mb-6" />
                        <p className="text-brand-50 text-base md:text-lg font-medium tracking-widest max-w-lg mx-auto opacity-80 uppercase">
                            {view === 'choice' ? 'Securing your sacred journey' : view === 'forgot-id' ? 'Retrieve your digital credentials' : 'Ministry member onboarding'}
                        </p>
                    </motion.div>
                )}
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
                            className="space-y-6 md:space-y-8"
                        >
                            <div className="bg-white border border-brand-100 rounded-[2rem] p-5 md:p-7 shadow-sm">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 mb-2">New Here?</p>
                                        <h3 className="text-xl md:text-2xl font-serif font-bold text-brand-950">Start with Entrust Registration</h3>
                                        <p className="text-sm text-slate-600 mt-2">Create your profile, receive your member ID, and unlock dashboard access.</p>
                                    </div>
                                    <button
                                        onClick={onNavigateToRegister}
                                        className="shrink-0 px-5 py-3 rounded-2xl bg-brand-600 text-white font-black text-xs uppercase tracking-wider hover:bg-brand-700 transition-colors"
                                    >
                                        Open Registration Page
                                    </button>
                                </div>
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                                    {['Digital Entrust Card', 'Dashboard Access', 'Ministry Updates'].map((benefit) => (
                                        <div key={benefit} className="rounded-xl border border-brand-100 bg-brand-50/40 px-3 py-2 text-brand-800 font-semibold text-center">
                                            {benefit}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
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
                            </div>
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
                            <div className="bg-gradient-to-br from-brand-700 to-brand-900 p-5 sm:p-8 md:p-16 rounded-[2rem] md:rounded-[4rem] border border-brand-600 shadow-[0_30px_100_rgba(59,130,246,0.2)] text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-white/50 to-white/20 opacity-60" />
                                <p className="text-brand-50/95 mb-6 md:mb-10 text-sm sm:text-base md:text-lg font-semibold relative z-10">Login with any one detail: Member ID, Phone Number, Name, or Email.</p>

                                <div className="mb-6 md:mb-12 z-10">
                                    <div className="mb-4 rounded-2xl bg-white/10 border border-white/15 p-3 md:p-4 text-left">
                                        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.18em] text-white/85 mb-1 flex items-center gap-2">
                                            <UserPlus size={14} /> Add Profile Support
                                        </p>
                                        <p className="text-[11px] md:text-sm text-white/85 font-semibold leading-relaxed">
                                            If you login with another account while already signed in, that account will be added as an extra profile in your dashboard.
                                        </p>
                                    </div>
                                    <p className="text-left text-[10px] md:text-xs font-black uppercase tracking-[0.18em] text-white/90 mb-2">Enter Member Detail</p>
                                    <div className="relative">
                                        <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-white/80">
                                            <UserIcon size={20} className="md:w-7 md:h-7" />
                                        </div>
                                        <input
                                            id="auth-login-identifier"
                                            type="text"
                                            placeholder="Try: COT ID, phone number, name, or email"
                                            className="w-full pl-12 md:pl-16 pr-28 sm:pr-36 md:pr-44 py-4 md:py-7 text-base md:text-xl bg-white/95 text-brand-950 border-2 border-white/50 rounded-2xl md:rounded-3xl outline-none focus:bg-white focus:ring-8 focus:ring-white/20 focus:border-white transition-all shadow-inner font-bold placeholder:text-brand-300"
                                            value={identifier}
                                            onChange={e => {
                                                let val = e.target.value;
                                                if (val.toLowerCase().startsWith('cot')) {
                                                    val = val.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                                                    if (val.startsWith('COT') && !val.startsWith('COT-') && val.length > 3) {
                                                        val = 'COT-' + val.substring(3).replace(/-/g, '');
                                                    }
                                                    if (val.length > 20) val = val.substring(0, 20);
                                                }
                                                setIdentifier(val);
                                                setPreviewUser(null);
                                                setPreviewProfileId(null);
                                                setNotFound(false);
                                            }}
                                            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                                        />
                                        <button
                                            id="auth-login-verify-btn"
                                            type="button"
                                            onClick={() => handleSearch()}
                                            disabled={!identifier.trim() || searching}
                                            className="absolute right-2 md:right-3 top-2 md:top-3 bottom-2 md:bottom-3 px-4 sm:px-8 md:px-12 bg-brand-900 hover:bg-brand-950 text-white rounded-xl md:rounded-[1.5rem] font-black text-sm md:text-lg transition-all disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-brand-900/40 active:scale-[0.98]"
                                        >
                                            {searching ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <span>Verify</span>}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] md:text-xs text-white/80 uppercase tracking-wider font-semibold">
                                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Example: COT-12345</span>
                                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Phone: 9876543210</span>
                                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Name: John</span>
                                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Email: john@mail.com</span>
                                </div>

                                <div className="hidden md:block mt-6 md:mt-8 bg-white/10 border border-white/15 rounded-2xl p-4 text-left">
                                    <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.18em] text-white/80 mb-2">New Member Advantages</p>
                                    <ul className="space-y-1.5 text-xs md:text-sm text-white/85 font-semibold">
                                        <li>• Get your official Entrust card and unique member ID</li>
                                        <li>• Access your user dashboard and account updates</li>
                                        <li>• Receive approval/denial and ministry status notifications</li>
                                    </ul>
                                    <button
                                        id="auth-login-qr-btn"
                                        type="button"
                                        onClick={onNavigateToRegister}
                                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-brand-900 font-black text-[11px] uppercase tracking-wider hover:bg-brand-50 transition-colors"
                                    >
                                        Register Now <ArrowRight size={14} />
                                    </button>
                                </div>

                                {/* Smart Auth Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-12 relative z-10">
                                    <button
                                        type="button"
                                        onClick={() => setShowScanner(!showScanner)}
                                        className={`group flex flex-col items-center justify-center p-5 md:p-8 border-2 rounded-[1.5rem] md:rounded-[2.5rem] transition-all duration-500 ${showScanner ? 'bg-red-50 border-red-200 text-red-600 shadow-xl scale-[1.02]' : 'bg-white border-brand-50 hover:border-brand-200 hover:shadow-2xl shadow-sm'}`}
                                    >
                                        <div className={`w-14 h-14 md:w-20 md:h-20 mb-4 md:mb-6 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all duration-500 ${showScanner ? 'bg-red-100 text-red-600 rotate-90' : 'bg-brand-50 text-brand-400 group-hover:bg-brand-600 group-hover:text-white group-hover:rotate-6'}`}>
                                            {showScanner ? <X size={28} className="md:w-9 md:h-9" /> : <QrCode size={28} className="md:w-9 md:h-9" />}
                                        </div>
                                        <h4 className="font-black text-lg md:text-xl mb-1 md:mb-2 tracking-tight">{showScanner ? 'Close Scanner' : 'Use QR Scanner'}</h4>
                                        <p className="text-[10px] text-brand-300 font-black uppercase tracking-widest">Verify via Digital ID</p>
                                    </button>

                                    <label id="auth-login-upload-btn" className="group flex flex-col items-center justify-center p-5 md:p-8 bg-white border-2 border-brand-50 hover:border-brand-200 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer">
                                        <div className="w-14 h-14 md:w-20 md:h-20 mb-4 md:mb-6 rounded-2xl md:rounded-3xl bg-brand-50 text-brand-400 group-hover:bg-brand-600 group-hover:text-white group-hover:-translate-y-1 transition-all duration-500 flex items-center justify-center">
                                            {scanningFile ? <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-brand-400 border-t-transparent rounded-full animate-spin" /> : <UploadCloud size={28} className="md:w-9 md:h-9" />}
                                        </div>
                                        <h4 className="font-black text-lg md:text-xl mb-1 md:mb-2 tracking-tight">Upload Entrust Card</h4>
                                        <p className="text-[10px] text-brand-300 font-black uppercase tracking-widest">Any image/PDF, multiple files supported</p>
                                        <input type="file" className="hidden" onChange={handleFileQRScan} disabled={scanningFile} multiple accept="image/*,.pdf" />
                                    </label>
                                </div>
                            </div>

                            {/* QR Scanner Panel */}
                            {showScanner && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] bg-slate-950">
                                    <div className="h-full flex flex-col">
                                        <div className="p-4 bg-slate-900 text-white text-xs text-center font-black uppercase tracking-[0.2em] flex justify-between items-center px-4 md:px-8 border-b border-white/5">
                                            <span className="flex items-center gap-2 font-serif italic"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live Scanner</span>
                                            <button type="button" onClick={() => setShowScanner(false)} className="text-white/60 hover:text-white transition-colors">Close ×</button>
                                        </div>
                                        <div className="flex-1 p-2 sm:p-4 relative">
                                            <div id="qr-auth-page-reader" role="region" aria-label="QR code scanner" className="w-full h-full min-h-[70vh] rounded-2xl overflow-hidden bg-black" />
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
                                        onClick={() => { setPreviewUser(null); setPreviewProfileId(null); }}
                                        className="fixed inset-0 z-[115] bg-black/60 backdrop-blur-sm p-4 md:p-8 overflow-y-auto"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="max-w-3xl mx-auto bg-gradient-to-br from-brand-50 via-white to-brand-100 border-2 border-brand-100 rounded-[1.8rem] md:rounded-[2.2rem] p-5 sm:p-7 md:p-8 shadow-2xl relative group"
                                        >
                                            {/* X Close button — large tap target, always on top */}
                                            <button
                                                type="button"
                                                onClick={() => { setPreviewUser(null); setPreviewProfileId(null); }}
                                                className="absolute -top-4 -right-4 z-[200] w-11 h-11 rounded-full bg-white border-2 border-brand-200 text-brand-600 hover:text-white hover:bg-brand-600 hover:border-brand-600 shadow-lg flex items-center justify-center transition-all active:scale-90"
                                                aria-label="Close preview"
                                            >
                                                <X size={20} />
                                            </button>
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-400/10 to-transparent opacity-50 rounded-[1.8rem] md:rounded-[2.2rem] pointer-events-none" />

                                            <div className="relative z-10 rounded-2xl bg-white/90 border border-brand-100 p-4 md:p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative shrink-0">
                                                        <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-brand-100 ${(previewUser.status || '') !== 'Active' ? 'blur-[2px]' : ''}`}>
                                                        {previewUser.photo ? (
                                                            <img src={previewUser.photo} alt={previewUser.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-2xl md:text-3xl font-black text-brand-700">
                                                                {previewUser.name?.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                        {(previewUser.status || '') === 'Active' ? (
                                                            <div className="absolute -bottom-2 -right-2 bg-brand-500 text-white p-1.5 rounded-xl shadow border-2 border-white">
                                                                <CheckCircle size={14} className="md:w-4 md:h-4" />
                                                            </div>
                                                        ) : (
                                                            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white px-2 py-1 rounded-xl shadow border-2 border-white text-[9px] font-black uppercase tracking-wider">
                                                                Pending
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                            <span className={`${(previewUser.status || '') === 'Active' ? 'bg-brand-600 text-white' : 'bg-amber-100 text-amber-800'} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em]`}>
                                                                {(previewUser.status || '') === 'Active' ? 'Verified Member' : 'Pending Approval'}
                                                            </span>
                                                            <span className="bg-white/90 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] text-brand-500 border border-brand-100">{previewUser.role || 'Member'}</span>
                                                        {previewProfileId && previewProfileId !== previewUser.id && (
                                                                <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border border-amber-200 flex items-center gap-1">
                                                                <UserCheck size={12} /> Linked Profile
                                                            </span>
                                                        )}
                                                    </div>
                                                        <h4 className="text-xl md:text-2xl font-serif font-black text-brand-950 leading-tight truncate">{previewUser.name}</h4>
                                                    </div>
                                                </div>
                                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                                                    <div className="bg-white border border-brand-100 rounded-xl px-3 py-2">
                                                        <p className="text-[10px] uppercase tracking-wide font-black text-brand-300">Member ID</p>
                                                        <p className="text-xs md:text-sm font-semibold text-brand-900 truncate">{previewProfileId || previewUser.id || '—'}</p>
                                                    </div>
                                                    <div className="bg-white border border-brand-100 rounded-xl px-3 py-2">
                                                        <p className="text-[10px] uppercase tracking-wide font-black text-brand-300">Phone</p>
                                                        <p className="text-xs md:text-sm font-semibold text-brand-900 truncate">{previewUser.phone || previewUser.emergency || '—'}</p>
                                                    </div>
                                                    <div className="bg-white border border-brand-100 rounded-xl px-3 py-2">
                                                        <p className="text-[10px] uppercase tracking-wide font-black text-brand-300">Status</p>
                                                        <p className="text-xs md:text-sm font-semibold text-brand-900 truncate">{previewUser.status || '—'}</p>
                                                    </div>
                                                    <div className="bg-white border border-brand-100 rounded-xl px-3 py-2">
                                                        <p className="text-[10px] uppercase tracking-wide font-black text-brand-300 flex items-center gap-1"><MapPin size={10} /> Location</p>
                                                        <p className="text-xs md:text-sm font-semibold text-brand-900 truncate">{previewUser.location || '—'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleProceed}
                                                className="mt-5 md:mt-6 w-full bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-700 hover:to-brand-900 text-white font-black uppercase tracking-[0.16em] md:tracking-[0.2em] text-[11px] sm:text-xs py-3.5 md:py-4 rounded-2xl transition-all shadow-2xl shadow-brand-500/40 hover:shadow-brand-500/60 active:scale-[0.98] flex items-center justify-center gap-2.5 group relative z-10"
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
                                <button onClick={onNavigateToRegister} className="text-brand-300 hover:text-brand-600 font-black text-xs uppercase tracking-widest transition-colors flex items-center gap-2">Open Registration</button>
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
                            <button onClick={() => setView('login')} className="text-brand-400 font-black uppercase tracking-widest text-xs hover:text-brand-600 transition-colors">Back to Login</button>
                        </motion.div>
                    )}

                    {/* Help / Forgot ID View */}
                    {view === 'forgot-id' && (
                        <motion.div key="forgot" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto px-2">
                            <div className="bg-gradient-to-br from-brand-700 to-brand-900 rounded-[2rem] sm:rounded-[4rem] p-6 sm:p-12 text-center text-white shadow-[0_50px_100px_rgba(59,130,246,0.15)] relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full" />

                                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mx-auto mb-6 sm:mb-10 border border-white/20 shadow-xl"><Phone size={32} className="sm:w-11 sm:h-11" /></div>
                                <h3 className="text-2xl sm:text-4xl font-serif font-black mb-4 sm:mb-6 tracking-tight leading-tight">Need Assistance?</h3>
                                <p className="text-brand-50 text-sm sm:text-lg font-light mb-8 sm:mb-12 opacity-80 italic">Connect with our Ministry Support for manual account verification.</p>

                                <a href="tel:+918056125478" className="inline-flex items-center gap-3 px-6 py-4 sm:py-6 bg-white text-brand-900 rounded-[1.5rem] sm:rounded-[2rem] font-black text-lg sm:text-2xl shadow-2xl hover:scale-105 transition-all group active:scale-95">
                                    <Phone size={20} className="group-hover:rotate-12 transition-transform shrink-0" /> <span className="break-all">+91 80561 25478</span>
                                </a>

                                <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Sacred Support Office</div>
                            </div>
                            <button onClick={() => setView('login')} className="block mt-8 sm:mt-12 mx-auto text-brand-600 hover:text-brand-800 font-black text-xs uppercase tracking-widest transition-all">← Back to Verification</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <AnimatePresence>
                {showLoginIntro && view === 'login' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[170] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div initial={{ y: 20, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 12, opacity: 0 }} className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
                            <div className="text-[11px] font-black uppercase tracking-widest text-brand-500 mb-2">Login Tour</div>
                            <h3 className="text-xl font-bold text-brand-950 mb-2">Soft Introduction</h3>
                            <p className="text-sm text-slate-600 mb-5">We will highlight login options one by one. You can skip anytime.</p>
                            <div className="flex items-center justify-end gap-2">
                                <button onClick={skipLoginTour} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">Skip</button>
                                <button onClick={startLoginTour} className="px-4 py-2 rounded-xl text-sm font-bold bg-brand-600 text-white hover:bg-brand-700">Take Tour</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {loginTourStepIndex !== null && view === 'login' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[175] pointer-events-none">
                        <div className="absolute inset-0 bg-black/65" />
                        {loginTourRect && (
                            <div className="absolute rounded-2xl border-2 border-amber-300 shadow-[0_0_0_9999px_rgba(2,6,23,0.72)]" style={{ top: loginTourRect.top, left: loginTourRect.left, width: loginTourRect.width, height: loginTourRect.height }} />
                        )}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-5 w-[calc(100%-1.5rem)] max-w-md bg-white rounded-3xl p-5 shadow-2xl pointer-events-auto">
                            <div className="text-[11px] uppercase tracking-widest font-black text-brand-500 mb-2">Step {loginTourStepIndex + 1} of {LOGIN_TOUR_STEPS.length}</div>
                            <h4 className="text-lg font-bold text-brand-950 mb-1">{LOGIN_TOUR_STEPS[loginTourStepIndex]?.title}</h4>
                            <p className="text-sm text-slate-600 mb-4">{LOGIN_TOUR_STEPS[loginTourStepIndex]?.text}</p>
                            <div className="flex items-center justify-between gap-2">
                                <button onClick={skipLoginTour} className="px-4 py-2 text-sm font-bold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">Skip Tour</button>
                                <button
                                    onClick={() => {
                                        const isLastStep = loginTourStepIndex >= LOGIN_TOUR_STEPS.length - 1;
                                        if (isLastStep) {
                                            setLoginTourStepIndex(null);
                                            setLoginTourRect(null);
                                        } else {
                                            setLoginTourStepIndex(loginTourStepIndex + 1);
                                        }
                                    }}
                                    className="px-4 py-2 text-sm font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                                >
                                    {loginTourStepIndex >= LOGIN_TOUR_STEPS.length - 1 ? 'Done' : 'Next'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
