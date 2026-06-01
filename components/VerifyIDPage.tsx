import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle, XCircle, Search, ScanLine, X, LogIn, Flashlight, FlashlightOff, Maximize2, Minimize2, QrCode, Share2, Download, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { User } from '../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

interface VerifyIDPageProps {
    onProceedToDashboard?: (identifier: string) => void;
    currentUser?: { id: string; name: string; photo?: string; status?: string } | null;
}

const VerifyIDPage: React.FC<VerifyIDPageProps> = ({ onProceedToDashboard, currentUser }) => {
    const [scannedId, setScannedId] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scannerInitialized, setScannerInitialized] = useState(false);
    const [torchSupported, setTorchSupported] = useState(false);
    const [torchOn, setTorchOn] = useState(false);
    const [scannerExpanded, setScannerExpanded] = useState(true);
    const [autoScannerMode, setAutoScannerMode] = useState(true);
    const [scannerAutoNotice, setScannerAutoNotice] = useState('Auto mode expands first, then keeps scanning compact.');
    const [showMyQr, setShowMyQr] = useState(false);
    const scannerRef = useRef<any>(null);
    const autoStartRef = useRef(false);
    const isApprovedUser = user?.status === 'Active';

    const WEBSITE_URL = 'https://city-of-truth-ministries.vercel.app';
    const myQrUrl = currentUser
        ? `https://city-of-truth-ministries.vercel.app/verify/${encodeURIComponent(currentUser.id)}`
        : WEBSITE_URL;
    const myQrImage = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(myQrUrl)}&bgcolor=ffffff&color=1a1450&margin=10`;
    const myQrTitle = currentUser ? currentUser.name : 'City of Truth Ministries';
    const myQrSubtitle = currentUser ? `COT ID: ${currentUser.id}` : 'Official ministry website';

    const handleShareMyQr = async () => {
        const shareData = {
            title: currentUser ? `${currentUser.name} — City of Truth Ministries` : 'City of Truth Ministries',
            text: currentUser ? `Verify my Entrust ID: ${currentUser.id}` : 'Visit City of Truth Ministries',
            url: myQrUrl
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(myQrUrl);
                alert('Link copied to clipboard!');
            }
        } catch (_e) {
            try { await navigator.clipboard.writeText(myQrUrl); alert('Link copied!'); } catch (_) {}
        }
    };

    const normalizeCotId = (value: string) => value.trim().toUpperCase().replace(/^COT(?!-)/, 'COT-');
    const extractIdFromPath = (value: string) => value.match(/\/(?:verify|card)\/([A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)/i)?.[1] || null;

    const extractMemberId = (payload: string): string | null => {
        if (!payload) return null;
        const trimmed = payload.trim();
        const fromPath = extractIdFromPath(trimmed);
        if (fromPath) return normalizeCotId(fromPath);
        try {
            const parsed = JSON.parse(trimmed);
            if (parsed?.id && typeof parsed.id === 'string') return normalizeCotId(parsed.id);
        } catch (_e) {}
        if (/^COT-[A-Z0-9-]+$/i.test(trimmed)) return normalizeCotId(trimmed);
        return null;
    };

    const extractMemberIdFromText = (text: string): string | null => {
        if (!text) return null;
        const fromPath = extractIdFromPath(text);
        if (fromPath) return normalizeCotId(fromPath);
        const cotMatch = text.match(/\bCOT-?[A-Za-z0-9-]{3,}\b/i)?.[0];
        if (cotMatch) return normalizeCotId(cotMatch);
        return null;
    };

    const getActiveVideoTrack = (): MediaStreamTrack | null => {
        const videoElement = document.querySelector<HTMLVideoElement>('#qr-reader video');
        const stream = videoElement?.srcObject as MediaStream | null;
        return stream?.getVideoTracks?.()[0] || null;
    };

    const applyTorchToActiveTrack = async (enabled: boolean) => {
        const track = getActiveVideoTrack();
        if (!track) return false;
        try {
            await track.applyConstraints({ advanced: [{ torch: enabled } as any] });
            setTorchOn(enabled);
            if (enabled) {
                setScannerAutoNotice('Flashlight is on for brighter scanning.');
            }
            return true;
        } catch (_e) {
            if (!enabled) setTorchOn(false);
            return false;
        }
    };

    useEffect(() => {
        if (!isScanning || !autoScannerMode) return;
        setScannerExpanded(true);
        setScannerAutoNotice('Auto mode enlarged the scanner and is checking flashlight.');
        const minimizeTimer = window.setTimeout(() => {
            setScannerExpanded(false);
            setScannerAutoNotice('Auto minimized. Tap Maximize when you need a larger frame.');
        }, 3600);
        return () => window.clearTimeout(minimizeTimer);
    }, [isScanning, autoScannerMode]);

    useEffect(() => {
        const loadScript = () => {
            if (!window.Html5Qrcode) {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/html5-qrcode';
                script.async = true;
                script.onload = () => setScannerInitialized(true);
                document.body.appendChild(script);
            } else {
                setScannerInitialized(true);
            }
        };
        loadScript();
        return () => {
            if (scannerRef.current) {
                try { scannerRef.current.stop().catch(console.error); } catch (e) { console.error(e); }
            }
        };
    }, []);

    const verifyID = async (idToVerify: string) => {
        const normalizedId = normalizeCotId(idToVerify);
        setLoading(true); setError(null); setUser(null);
        try {
            const userRef = doc(db, 'users', normalizedId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setUser({ ...userSnap.data(), id: userSnap.id } as User);
            } else {
                const allUsers = await api.getUsers();
                let foundMatch = null;
                for (const u of allUsers) {
                    if (normalizeCotId(u.id) === normalizedId) { foundMatch = u; break; }
                    if (u.linkedProfiles) {
                        const subMatch = u.linkedProfiles.find(sp => normalizeCotId(sp.id) === normalizedId);
                        if (subMatch) {
                            foundMatch = { ...u, id: subMatch.id, name: subMatch.name, role: subMatch.role, photo: subMatch.photo || u.photo } as User;
                            break;
                        }
                    }
                }
                if (foundMatch) { setUser(foundMatch); } else { setError('Member ID not found in the records.'); }
            }
        } catch (err: any) {
            console.error('Verification Error:', err);
            setError('Failed to verify ID. Database error.');
        } finally { setLoading(false); }
    };

    const startScanner = () => {
        if (!window.Html5Qrcode || !scannerInitialized || isScanning) return;
        setIsScanning(true);
        setError(null);
        setScannedId(null);
        setUser(null);
        setScannerExpanded(true);
        setScannerAutoNotice('Starting camera. Auto mode will use flashlight when supported.');
        setTimeout(() => {
            const html5Qrcode = new window.Html5Qrcode('qr-reader');
            scannerRef.current = html5Qrcode;

            // Retry torch detection after camera fully initializes
            const tryDetectAndEnableTorch = (attemptsLeft = 4) => {
                const track = getActiveVideoTrack();
                const capabilities = ((track as any)?.getCapabilities?.() as any) || {};
                const supported = !!capabilities.torch;
                if (supported) {
                    setTorchSupported(true);
                    if (autoScannerMode) {
                        applyTorchToActiveTrack(true);
                    }
                } else if (attemptsLeft > 0) {
                    setTimeout(() => tryDetectAndEnableTorch(attemptsLeft - 1), 600);
                } else {
                    setTorchSupported(false);
                    setScannerAutoNotice('Flashlight is not available on this device/browser.');
                }
            };

            html5Qrcode.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText: string) => {
                    const extractedId = extractMemberId(decodedText);
                    if (extractedId) {
                        html5Qrcode.stop().then(() => {
                            const normalized = normalizeCotId(extractedId);
                            setIsScanning(false);
                            setScannerExpanded(false);
                            setScannedId(normalized);
                            verifyID(normalized);
                        });
                    }
                },
                (_errorMessage: string) => {}
            ).then(() => {
                // Start torch detection after 800ms delay
                setTimeout(() => tryDetectAndEnableTorch(), 800);

                // Ambient light sensor — auto torch when dark
                if ('AmbientLightSensor' in window) {
                    try {
                        const sensor = new (window as any).AmbientLightSensor();
                        sensor.addEventListener('reading', () => {
                            if (!autoScannerMode) return;
                            if (sensor.illuminance < 50) {
                                applyTorchToActiveTrack(true);
                            } else {
                                applyTorchToActiveTrack(false);
                            }
                        });
                        sensor.start();
                    } catch (_e) { /* sensor not available */ }
                }
            }).catch((err: any) => {
                console.error('Scanner Error:', err);
                setError('Could not access camera. Please allow camera permissions or upload a picture.');
                setIsScanning(false);
                setTorchOn(false);
                setTorchSupported(false);
            });
        }, 300);
    };

    useEffect(() => {
        if (!scannerInitialized || autoStartRef.current) return;
        autoStartRef.current = true;
        const timer = window.setTimeout(() => startScanner(), 450);
        return () => window.clearTimeout(timer);
    }, [scannerInitialized]);

    const stopScanner = () => {
        const clearScannerState = () => {
            setIsScanning(false);
            setTorchOn(false);
            setTorchSupported(false);
            setScannerAutoNotice('Auto mode expands first, then keeps scanning compact.');
            setScannerExpanded(true);
            scannerRef.current = null;
        };

        const disableTorchIfPossible = async () => {
            await applyTorchToActiveTrack(false);
        };

        if (scannerRef.current) {
            disableTorchIfPossible()
                .finally(() => scannerRef.current.stop())
                .then(clearScannerState)
                .catch((e: any) => {
                    console.error(e);
                    clearScannerState();
                });
        } else {
            clearScannerState();
        }
    };

    const handleTorchToggle = async () => {
        if (!isScanning || !torchSupported) return;
        const next = !torchOn;
        const applied = await applyTorchToActiveTrack(next);
        if (!applied && next) {
            if (next) setError('Flashlight control is not supported on this device/browser.');
        }
    };

    const handleScannerSizeToggle = async () => {
        const nextExpanded = !scannerExpanded;
        setScannerExpanded(nextExpanded);
        setScannerAutoNotice(nextExpanded ? 'Scanner maximized. Flashlight checked automatically.' : 'Scanner minimized. It will keep scanning.');
        if (torchSupported) {
            await applyTorchToActiveTrack(true);
        }
    };

    const handleAutoScannerToggle = async () => {
        const nextAutoMode = !autoScannerMode;
        setAutoScannerMode(nextAutoMode);
        if (nextAutoMode) {
            setScannerExpanded(true);
            setScannerAutoNotice('Auto mode on. Scanner maximizes first and turns on flashlight when supported.');
            if (torchSupported) await applyTorchToActiveTrack(true);
        } else {
            setScannerAutoNotice('Auto mode off. Use Flash and Maximize manually.');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !window.Html5Qrcode) return;
        setLoading(true); setError(null); setUser(null); setScannedId(null);
        const html5QrCode = new window.Html5Qrcode('qr-reader-hidden');
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        const scanImageFile = async (imageFile: File) => {
            const decodedText: string = await html5QrCode.scanFile(imageFile, true);
            const extractedId = extractMemberId(decodedText);
            if (!extractedId) throw new Error('Invalid QR Code payload.');
            return extractedId;
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
                const pageImage = new File([blob], `page-${pageNum}.png`, { type: 'image/png' });
                try {
                    return await scanImageFile(pageImage);
                } catch (_err) {
                    continue;
                }
            }
            throw new Error('No valid QR code found in the uploaded PDF pages.');
        };

        const scanTextLikeFile = async (rawFile: File) => {
            const filenameCandidate = extractMemberIdFromText(rawFile.name.replace(/_/g, ' '));
            if (filenameCandidate) return filenameCandidate;
            const fileText = await rawFile.text();
            const textCandidate = extractMemberIdFromText(fileText);
            if (!textCandidate) throw new Error('No readable member data found in this file. Upload an Entrust card with QR or include the COT ID in file content/name.');
            return textCandidate;
        };

        const scanTask = async () => {
            if (isPdf) {
                try { return await scanPdfFile(file); } catch (error) { console.warn('PDF QR scan failed, falling back to text extraction.', error); }
                return await scanTextLikeFile(file);
            }
            if (isImage) {
                try { return await scanImageFile(file); } catch (error) { console.warn('Image QR scan failed, falling back to text extraction.', error); }
                return await scanTextLikeFile(file);
            }
            return await scanTextLikeFile(file);
        };

        scanTask()
            .then((extractedId: string) => {
                const normalized = normalizeCotId(extractedId);
                setScannedId(normalized);
                verifyID(normalized);
            })
            .catch((err: any) => {
                setError(err?.message || 'No valid QR code found in the uploaded file.');
                setLoading(false);
            })
            .finally(() => { e.target.value = ''; });
    };

    const handleManualCheck = (e: React.FormEvent) => {
        e.preventDefault();
        if (scannedId) {
            const normalized = normalizeCotId(scannedId);
            setScannedId(normalized);
            verifyID(normalized);
        }
    };

    /* ── STATUS COLOUR HELPERS ── */
    const statusLabel = (s?: string) =>
        s === 'Active' ? 'Verified Member' : s === 'Rejected' ? 'Access Rejected' : 'Pending Approval';
    const statusIcon = (s?: string) =>
        s === 'Active' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />;

    return (
        <div className="h-screen bg-[#05070c] relative overflow-hidden">
            {/* Hidden HTML5QrCode container */}
            <div id="qr-reader-hidden" style={{ display: 'none' }}></div>

            {/* ── BRANDED HEADER ── */}
            <header className="hidden">
                <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 bg-white flex items-center justify-center">
                            <img src="/logo.png" alt="COT" className="w-7 h-7 object-contain" />
                        </div>
                        <div>
                            <p className="text-white font-black text-sm leading-none tracking-wide">City of Truth</p>
                            <p className="text-[#d4a547] text-xs font-bold uppercase tracking-[0.22em]">Ministries</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* My QR button */}
                        <button
                            onClick={() => setShowMyQr(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-slate-950 text-xs font-black uppercase tracking-[0.12em] hover:bg-slate-100 transition-all"
                            title="Show My QR Code"
                        >
                            <QrCode size={14} />
                            {currentUser ? 'My QR' : 'Site QR'}
                        </button>
                        <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-black uppercase tracking-[0.2em]">
                            <ScanLine size={12} /> Verify Entrust ID
                        </span>
                    </div>
                </div>
            </header>

            {/* ── MY QR CODE STATIC PANEL ── */}
            <AnimatePresence>
                {showMyQr && (
                    <motion.div
                        key="myqr-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-white text-slate-950 overflow-hidden"
                    >
                        <div className="h-14 px-5 flex items-center justify-between border-b border-slate-100">
                            <button
                                onClick={() => setShowMyQr(false)}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100"
                                aria-label="Back to scanner"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-green-500 text-white">
                                    <CheckCircle size={14} />
                                </span>
                                <span>Secure Environment</span>
                            </div>
                            <button
                                onClick={handleShareMyQr}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100"
                                aria-label="Share QR code"
                            >
                                <Download size={22} />
                            </button>
                        </div>
                        <motion.div
                            key="myqr-card"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="h-[calc(100vh-3.5rem)] px-5 py-5 flex flex-col items-center justify-between gap-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-full max-w-[620px] bg-slate-100 rounded-[1.75rem] p-5 sm:p-8 text-center">
                                <div className="flex items-center justify-center gap-4 mb-5">
                                    {currentUser ? (
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-600 text-white flex items-center justify-center text-2xl font-semibold border border-orange-200">
                                            {currentUser.photo
                                                ? <img src={currentUser.photo} alt={currentUser.name} className="w-full h-full object-cover" />
                                                : currentUser.name.charAt(0).toUpperCase()
                                            }
                                        </div>
                                    ) : (
                                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
                                            <img src="/logo.png" alt="City of Truth Ministries" className="w-11 h-11 object-contain" />
                                        </div>
                                    )}
                                    <div className="text-left">
                                        <h3 className="text-3xl sm:text-5xl font-medium tracking-normal leading-tight">{myQrTitle}</h3>
                                        <p className="text-sm sm:text-lg text-slate-600 mt-1">{myQrSubtitle}</p>
                                    </div>
                                </div>

                                <div className="relative mx-auto w-[min(68vw,380px)] aspect-square bg-white p-3 rounded-2xl">
                                    <img
                                        src={myQrImage}
                                        alt={currentUser ? `${currentUser.name} COT ID QR Code` : 'City of Truth website QR Code'}
                                        className="w-full h-full object-contain"
                                    />
                                    <div className="absolute left-1/2 top-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg flex items-center justify-center border border-slate-100">
                                        <img src="/logo.png" alt="" className="w-11 h-11 object-contain" />
                                    </div>
                                </div>

                                <p className="mt-4 text-xl sm:text-2xl font-medium">
                                    {currentUser ? 'Scan to verify COT ID' : 'Scan to open City of Truth Ministries'}
                                </p>
                                <p className="mt-2 text-sm sm:text-base text-slate-600 break-all">{myQrUrl}</p>
                            </div>

                            <div className="w-full max-w-[620px] space-y-4 pb-2">
                                <button
                                    onClick={handleShareMyQr}
                                    className="w-full h-16 rounded-[1.35rem] bg-blue-600 hover:bg-blue-700 text-white text-2xl font-semibold flex items-center justify-center gap-3"
                                >
                                    <Share2 size={26} /> Share QR code
                                </button>
                                <button
                                    onClick={() => setShowMyQr(false)}
                                    className="w-full h-16 rounded-[1.35rem] bg-white hover:bg-slate-50 border-2 border-slate-300 text-blue-700 text-2xl font-semibold flex items-center justify-center gap-3"
                                >
                                    <QrCode size={25} /> Open scanner
                                </button>
                                <p className="text-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Powered by City of Truth Ministries</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="h-screen max-w-[560px] mx-auto overflow-hidden flex flex-col bg-black text-white relative">

                {/* ── VERTICAL CAMERA SCANNER ── */}
                <div
                    className="relative bg-black transition-all duration-500 ease-in-out"
                    style={{ height: scannerExpanded ? '100vh' : '55vh' }}
                >
                    <div id="qr-reader" className={`absolute inset-0 bg-black ${isScanning ? 'opacity-100' : 'opacity-0'}`} />

                    {!isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black">
                            <button
                                onClick={startScanner}
                                disabled={!scannerInitialized}
                                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-black font-bold rounded-full shadow-lg disabled:opacity-50"
                            >
                                <Camera size={20} /> Open camera
                            </button>
                        </div>
                    )}

                    <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-5">
                        <button
                            onClick={stopScanner}
                            className="w-11 h-11 rounded-full bg-black/25 backdrop-blur-sm text-white flex items-center justify-center active:scale-95 transition-transform"
                            aria-label="Close scanner"
                        >
                            <X size={28} />
                        </button>
                        <div className="flex items-center gap-3">
                            {/* Flashlight toggle */}
                            <button
                                onClick={handleTorchToggle}
                                disabled={!torchSupported}
                                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                                    torchOn
                                        ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/50'
                                        : torchSupported
                                            ? 'bg-black/25 backdrop-blur-sm text-white hover:bg-white/20'
                                            : 'bg-black/15 text-white/30 cursor-not-allowed'
                                }`}
                                aria-label={torchOn ? 'Turn off flashlight' : 'Turn on flashlight'}
                                title={torchSupported ? (torchOn ? 'Tap to turn off flashlight' : 'Tap to turn on flashlight') : 'Flashlight not supported on this device'}
                            >
                                {torchOn ? <Flashlight size={25} /> : <FlashlightOff size={25} />}
                            </button>
                            {/* Minimize / Maximize */}
                            <button
                                onClick={handleScannerSizeToggle}
                                className="w-11 h-11 rounded-full bg-black/25 backdrop-blur-sm text-white flex items-center justify-center active:scale-95 transition-transform hover:bg-white/20"
                                aria-label={scannerExpanded ? 'Minimize scanner' : 'Maximize scanner'}
                            >
                                {scannerExpanded ? <Minimize2 size={22} /> : <Maximize2 size={22} />}
                            </button>
                            <button
                                onClick={() => setShowMyQr(true)}
                                className="w-11 h-11 rounded-full bg-black/25 backdrop-blur-sm text-white flex items-center justify-center active:scale-95 transition-transform hover:bg-white/20"
                                aria-label="Show QR code"
                            >
                                <QrCode size={27} />
                            </button>
                        </div>
                    </div>

                    <div className="absolute left-1/2 top-[37%] z-10 w-[min(78vw,430px)] aspect-square -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <span className="absolute top-0 left-0 w-[18%] h-[18%] border-t-[8px] border-l-[8px] border-[#ff6b6b] rounded-tl-[28px]" />
                        <span className="absolute top-0 right-0 w-[18%] h-[18%] border-t-[8px] border-r-[8px] border-[#ffb020] rounded-tr-[28px]" />
                        <span className="absolute bottom-0 left-0 w-[18%] h-[18%] border-b-[8px] border-l-[8px] border-[#4f8cff] rounded-bl-[28px]" />
                        <span className="absolute bottom-0 right-0 w-[18%] h-[18%] border-b-[8px] border-r-[8px] border-[#27c46b] rounded-br-[28px]" />
                    </div>

                    {/* Torch glow overlay */}
                    {torchOn && (
                        <div className="absolute inset-0 z-5 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(255,240,100,0.07) 0%, transparent 65%)' }} />
                    )}

                    <label className="absolute left-1/2 bottom-[clamp(230px,31vh,340px)] z-20 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-lg sm:text-xl font-medium text-slate-700 shadow-xl cursor-pointer whitespace-nowrap">
                        <Camera size={22} />
                        Upload from gallery
                        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" />
                    </label>

                    <div className="absolute inset-x-0 bottom-0 z-20 rounded-t-[34px] bg-[#232323] px-6 pt-5 pb-6 text-center shadow-2xl">
                        <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-white/70" />
                        <p className="text-3xl sm:text-4xl font-medium leading-tight text-white">
                            Scan any QR code
                        </p>
                        <p className="mt-2 text-xl sm:text-2xl font-medium leading-tight text-white/70">
                            COT ID · Entrust Card · Member QR
                        </p>
                        <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                            {scannerAutoNotice}
                        </p>
                    </div>
                </div>

                {/* ── RESULT / STATUS AREA ── */}
                <div className="absolute inset-x-4 top-20 z-40 pointer-events-auto">
                <AnimatePresence mode="wait">
                    {loading && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            className="flex flex-col items-center gap-5 py-16 text-center"
                        >
                            <div className="relative w-20 h-20">
                                <div className="absolute inset-0 rounded-full border-4 border-[#d4a547]/20 animate-pulse" />
                                <div className="absolute inset-0 rounded-full border-t-4 border-[#d4a547] animate-spin" />
                                <div className="absolute inset-3 rounded-full bg-white/5 flex items-center justify-center">
                                    <img src="/logo.png" alt="" className="w-9 h-9 object-contain" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">Verifying Identity…</h3>
                                <p className="text-white/40 text-sm mt-1">Querying central database</p>
                            </div>
                        </motion.div>
                    )}

                    {!loading && error && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 16, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -16 }}
                            className="bg-red-500/10 backdrop-blur-xl border border-red-400/25 rounded-[24px] p-8 text-center max-w-xl mx-auto shadow-2xl shadow-red-900/20"
                        >
                            <div className="w-16 h-16 bg-red-500/15 border border-red-400/30 rounded-full flex items-center justify-center mx-auto mb-5">
                                <XCircle className="text-red-400 w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Verification Failed</h3>
                            <p className="text-red-300/80 text-sm leading-relaxed mb-6">{error}</p>
                            <button
                                onClick={() => { setError(null); setScannedId(null); startScanner(); }}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/8 border border-white/15 text-white font-bold rounded-xl hover:bg-white/12 transition-all text-sm"
                            >
                                Try Again
                            </button>
                        </motion.div>
                    )}

                    {!loading && user && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`rounded-[28px] overflow-hidden border shadow-2xl max-w-3xl mx-auto ${
                                user.status === 'Active'
                                    ? 'bg-green-500/8 border-green-400/25 shadow-green-900/20'
                                    : user.status === 'Rejected'
                                        ? 'bg-red-500/8 border-red-400/25 shadow-red-900/20'
                                        : 'bg-amber-500/8 border-amber-400/25 shadow-amber-900/20'
                            }`}
                        >
                            {/* Status banner */}
                            <div className={`px-6 py-3 flex items-center gap-3 border-b ${
                                user.status === 'Active'
                                    ? 'bg-green-500/15 border-green-400/20'
                                    : user.status === 'Rejected'
                                        ? 'bg-red-500/15 border-red-400/20'
                                        : 'bg-amber-500/15 border-amber-400/20'
                            }`}>
                                <span className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest ${
                                    user.status === 'Active' ? 'text-green-400' : user.status === 'Rejected' ? 'text-red-400' : 'text-amber-400'
                                }`}>
                                    <span className={`w-2 h-2 rounded-full animate-pulse ${
                                        user.status === 'Active' ? 'bg-green-400' : user.status === 'Rejected' ? 'bg-red-400' : 'bg-amber-400'
                                    }`} />
                                    {statusLabel(user.status)}
                                </span>
                                <div className="ml-auto">{statusIcon(user.status)}</div>
                            </div>

                            <div className="p-6 flex flex-col md:flex-row gap-8 items-center">
                                {/* Photo */}
                                <div className="relative shrink-0">
                                    <div className={`absolute -inset-2 rounded-full blur-xl opacity-30 ${
                                        user.status === 'Active' ? 'bg-green-400' : user.status === 'Rejected' ? 'bg-red-400' : 'bg-amber-400'
                                    }`} />
                                    <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative z-10">
                                        {user.photo
                                            ? <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                                            : <div className="w-full h-full bg-white/10 flex items-center justify-center text-5xl font-black text-white/50">{user.name.charAt(0).toUpperCase()}</div>
                                        }
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 z-20 p-2 rounded-full border-4 border-[#0d1635] ${
                                        user.status === 'Active' ? 'bg-green-500' : user.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-500'
                                    }`}>
                                        {user.status === 'Active' ? <CheckCircle className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <h4 className="text-3xl font-black text-white tracking-tight mb-1">{user.name}</h4>
                                    <p className={`font-bold text-base mb-4 ${
                                        user.status === 'Active' ? 'text-green-400' : user.status === 'Rejected' ? 'text-red-400' : 'text-amber-400'
                                    }`}>{user.role || 'Worshipper'}</p>

                                    <div className="grid grid-cols-2 gap-3 mb-5">
                                        <div className="bg-white/5 border border-white/8 rounded-2xl p-3">
                                            <p className="text-xs font-black text-white/60 uppercase tracking-[0.2em] mb-0.5">COT ID</p>
                                            <p className="font-black text-white font-mono text-sm">{user.id}</p>
                                        </div>
                                        {user.location && (
                                            <div className="bg-white/5 border border-white/8 rounded-2xl p-3">
                                                <p className="text-xs font-black text-white/60 uppercase tracking-[0.2em] mb-0.5">Location</p>
                                                <p className="font-bold text-white text-sm truncate">{user.location}</p>
                                            </div>
                                        )}
                                        {user.memberSince && (
                                            <div className="bg-white/5 border border-white/8 rounded-2xl p-3">
                                                <p className="text-xs font-black text-white/60 uppercase tracking-[0.2em] mb-0.5">Joined Date</p>
                                                <p className="font-bold text-white text-sm">{user.memberSince}</p>
                                            </div>
                                        )}
                                        {user.phone && (
                                            <div className="bg-white/5 border border-white/8 rounded-2xl p-3">
                                                <p className="text-xs font-black text-white/60 uppercase tracking-[0.2em] mb-0.5">Phone</p>
                                                <p className="font-bold text-white text-sm">{user.phone}</p>
                                            </div>
                                        )}
                                    </div>

                                    {!isApprovedUser && (
                                        <p className={`text-xs font-medium mb-4 ${user.status === 'Rejected' ? 'text-red-400' : 'text-amber-400'}`}>
                                            {user.status === 'Rejected'
                                                ? 'This member has been rejected. Entrust card access is blocked.'
                                                : 'This member is awaiting admin approval. Entrust card access pending.'}
                                        </p>
                                    )}

                                    <div className="flex flex-col gap-2.5">
                                        <button
                                            onClick={() => { if (user?.id) window.location.href = `/verify/${encodeURIComponent(user.id)}`; }}
                                            className="w-full py-3 rounded-xl bg-white/8 border border-white/12 text-white font-bold text-sm hover:bg-white/14 transition-all"
                                        >
                                            Open Full Verify Page
                                        </button>
                                        {onProceedToDashboard && (
                                            <button
                                                onClick={() => onProceedToDashboard(user.id)}
                                                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4a547] to-[#f0c040] text-[#1a0d00] font-black text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
                                            >
                                                <LogIn size={16} /> Proceed to Dashboard
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { setUser(null); setScannedId(null); }}
                                            className="w-full py-3 rounded-xl bg-white/5 border border-white/8 text-white/60 font-bold text-sm hover:bg-white/10 transition-all"
                                        >
                                            Scan Another ID
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
        </div>
    );
};

declare global {
    interface Window { Html5Qrcode: any; }
}

export default VerifyIDPage;
