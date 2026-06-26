import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, CheckCircle, XCircle, ScanLine, X, LogIn, Flashlight, FlashlightOff, Maximize2, Minimize2, QrCode, Share2, Download, ArrowLeft, UploadCloud } from 'lucide-react';
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
    onClose?: () => void;
}

const VerifyIDPage: React.FC<VerifyIDPageProps> = ({ onProceedToDashboard, currentUser, onClose }) => {
    const navigate = useNavigate();
    const [scannedId, setScannedId] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scannerInitialized, setScannerInitialized] = useState(false);
    const [torchSupported, setTorchSupported] = useState(false);
    const [torchOn, setTorchOn] = useState(false);
    const [scannerExpanded, setScannerExpanded] = useState(false);
    const [autoScannerMode, setAutoScannerMode] = useState(true);
    const [showMyQr, setShowMyQr] = useState(false);
    const [hideScanBorder, setHideScanBorder] = useState(false);
    const [scannerFail, setScannerFail] = useState(false);
    const scannerRef = useRef<any>(null);
    const scannerTimeoutsRef = useRef<number[]>([]);

    const clearScannerTimeouts = () => {
        scannerTimeoutsRef.current.forEach(t => window.clearTimeout(t));
        scannerTimeoutsRef.current = [];
    };
    const autoStartRef = useRef(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const userAdjustedSizeRef = useRef(false);
    const userAdjustedTorchRef = useRef(false);
    const ambientSensorRef = useRef<{ stop: () => void } | null>(null);
    const autoMinimizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const AUTO_EXPAND_DURATION_MS = 3600;
    const isApprovedUser = user?.status === 'Active';

    const WEBSITE_URL = 'https://city-of-truth-ministries.vercel.app';
    const myQrUrl = currentUser
        ? `https://city-of-truth-ministries.vercel.app/verify/${encodeURIComponent(currentUser.id)}`
        : WEBSITE_URL;
    const myQrImage = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(myQrUrl)}&bgcolor=ffffff&color=1a1450&margin=1`;
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
            return true;
        } catch (_e) {
            if (!enabled) setTorchOn(false);
            return false;
        }
    };

    const clearAutoMinimizeTimer = () => {
        if (autoMinimizeTimerRef.current != null) {
            window.clearTimeout(autoMinimizeTimerRef.current);
            autoMinimizeTimerRef.current = null;
        }
    };

    const teardownAmbientSensor = () => {
        if (ambientSensorRef.current) {
            try { ambientSensorRef.current.stop(); } catch (_e) { /* ignore */ }
            ambientSensorRef.current = null;
        }
    };

    const setupAmbientSensor = () => {
        if (!autoScannerMode || userAdjustedTorchRef.current || ambientSensorRef.current) return;
        if (!('AmbientLightSensor' in window)) return;
        try {
            const sensor = new (window as any).AmbientLightSensor();
            sensor.addEventListener('reading', () => {
                if (!autoScannerMode || userAdjustedTorchRef.current) return;
                if (sensor.illuminance < 50) {
                    applyTorchToActiveTrack(true);
                } else if (sensor.illuminance > 120) {
                    applyTorchToActiveTrack(false);
                }
            });
            sensor.start();
            ambientSensorRef.current = sensor;
        } catch (_e) { /* sensor not available */ }
    };

    const tryDetectTorchSupport = (attemptsLeft = 5) => {
        const track = getActiveVideoTrack();
        const capabilities = ((track as any)?.getCapabilities?.() as any) || {};
        if (capabilities.torch) {
            setTorchSupported(true);
            if (autoScannerMode && !userAdjustedTorchRef.current) {
                applyTorchToActiveTrack(true);
            }
        } else if (attemptsLeft > 0) {
            window.setTimeout(() => tryDetectTorchSupport(attemptsLeft - 1), 600);
        } else {
            setTorchSupported(false);
        }
    };

    const runAutoSizeCycle = () => {
        if (!autoScannerMode || !isScanning || userAdjustedSizeRef.current) return;
        clearAutoMinimizeTimer();
        setScannerExpanded(true);
        if (torchSupported && !userAdjustedTorchRef.current) {
            applyTorchToActiveTrack(true);
        }
        autoMinimizeTimerRef.current = window.setTimeout(() => {
            if (!userAdjustedSizeRef.current) {
                setScannerExpanded(false);
            }
        }, AUTO_EXPAND_DURATION_MS);
    };

    const scannerStatusLine = useMemo(() => {
        if (loading) return 'Verifying member record…';
        if (!autoScannerMode) {
            if (torchOn) return 'Flashlight on · tap flash to turn off';
            return scannerExpanded
                ? 'Manual expanded · tap ⊖ to compact'
                : 'Manual compact · tap ⊕ to expand';
        }
        if (torchOn) return 'Auto light on · point camera at the QR code';
        if (scannerExpanded) return 'Auto expanded · will compact & recheck light shortly';
        if (torchSupported) return 'Scanner compact · auto flash ready · tap ⊕ to expand';
        return 'Scanner compact · tap ⊕ to expand · auto mode on';
    }, [loading, torchOn, torchSupported, scannerExpanded, autoScannerMode]);

    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        const prevHtmlOverflow = html.style.overflow;
        const prevBodyOverflow = body.style.overflow;
        const prevTouchAction = body.style.touchAction;
        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
        body.style.touchAction = 'none';
        return () => {
            html.style.overflow = prevHtmlOverflow;
            body.style.overflow = prevBodyOverflow;
            body.style.touchAction = prevTouchAction;
        };
    }, []);

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
            clearAutoMinimizeTimer();
            teardownAmbientSensor();
            if (scannerRef.current) {
                try { scannerRef.current.stop().catch(console.error); } catch (e) { console.error(e); }
            }
        };
    }, []);

    useEffect(() => {
        if (!isScanning || !autoScannerMode) return;
        runAutoSizeCycle();
        return () => clearAutoMinimizeTimer();
    }, [isScanning, autoScannerMode]);

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
        setHideScanBorder(false);
        setScannerFail(false);
        clearScannerTimeouts();

        userAdjustedSizeRef.current = false;
        userAdjustedTorchRef.current = false;
        if (autoScannerMode) {
            setScannerExpanded(true);
        }
        setTimeout(() => {
            const html5Qrcode = new window.Html5Qrcode('qr-reader');
            scannerRef.current = html5Qrcode;
            const readerEl = document.getElementById('qr-reader');
            const boxSize = Math.max(
                180,
                Math.min(
                    280,
                    Math.floor(Math.min(readerEl?.clientWidth ?? 280, readerEl?.clientHeight ?? 280) * 0.62)
                )
            );

            html5Qrcode.start(
                { facingMode: 'environment' },
                { fps: 12, qrbox: { width: boxSize, height: boxSize }, aspectRatio: 1 },
                (decodedText: string) => {
                    const extractedId = extractMemberId(decodedText);
                    if (extractedId) {
                        clearScannerTimeouts();
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
                window.setTimeout(() => tryDetectTorchSupport(), 800);
                if (autoScannerMode) {
                    runAutoSizeCycle();
                    setupAmbientSensor();
                }

                // Schedule scanner failure and zoom timeouts
                const t5 = window.setTimeout(async () => {
                    setHideScanBorder(true);
                    await applyTorchToActiveTrack(true);
                    const track = getActiveVideoTrack();
                    if (track) {
                        try {
                            const capabilities = track.getCapabilities?.() as any;
                            if (capabilities?.zoom) {
                                await track.applyConstraints({ advanced: [{ zoom: capabilities.zoom.max } as any] });
                            }
                        } catch (e) {
                            console.warn('Failed to apply zoom maximum constraint:', e);
                        }
                    }
                }, 5000);
                scannerTimeoutsRef.current.push(t5);

                const t7 = window.setTimeout(async () => {
                    const track = getActiveVideoTrack();
                    if (track) {
                        try {
                            const capabilities = track.getCapabilities?.() as any;
                            if (capabilities?.zoom) {
                                await track.applyConstraints({ advanced: [{ zoom: capabilities.zoom.min } as any] });
                            }
                        } catch (e) {
                            console.warn('Failed to apply zoom minimum constraint:', e);
                        }
                    }
                }, 7000);
                scannerTimeoutsRef.current.push(t7);

                const t10 = window.setTimeout(async () => {
                    await stopScanner();
                    setScannerFail(true);
                }, 10000);
                scannerTimeoutsRef.current.push(t10);

            }).catch((err: any) => {
                console.error('Scanner Error:', err);
                setError('Could not access camera. Please allow camera permissions or upload a picture.');
                setIsScanning(false);
                setTorchOn(false);
                setTorchSupported(false);
                clearScannerTimeouts();
            });
        }, 300);
    };

    useEffect(() => {
        if (!scannerInitialized || autoStartRef.current) return;
        autoStartRef.current = true;
        const timer = window.setTimeout(() => startScanner(), 450);
        return () => window.clearTimeout(timer);
    }, [scannerInitialized]);

    useEffect(() => {
        return () => {
            clearScannerTimeouts();
        };
    }, []);

    const stopScanner = (): Promise<void> => {
        clearScannerTimeouts();
        clearAutoMinimizeTimer();
        teardownAmbientSensor();
        const clearScannerState = () => {
            setIsScanning(false);
            setTorchOn(false);
            setTorchSupported(false);
            scannerRef.current = null;
        };

        const disableTorchIfPossible = async () => {
            await applyTorchToActiveTrack(false);
        };

        if (scannerRef.current) {
            return disableTorchIfPossible()
                .finally(() => {
                    if (scannerRef.current) {
                        return scannerRef.current.stop();
                    }
                })
                .then(clearScannerState)
                .catch((e: any) => {
                    console.error(e);
                    clearScannerState();
                });
        } else {
            clearScannerState();
            return Promise.resolve();
        }
    };

    const handleTorchToggle = async () => {
        if (!isScanning || !torchSupported) return;
        userAdjustedTorchRef.current = true;
        const next = !torchOn;
        const applied = await applyTorchToActiveTrack(next);
        if (!applied && next) {
            setError('Flashlight control is not supported on this device/browser.');
        }
    };

    const handleScannerSizeToggle = async () => {
        userAdjustedSizeRef.current = true;
        clearAutoMinimizeTimer();
        const nextExpanded = !scannerExpanded;
        setScannerExpanded(nextExpanded);
        if (autoScannerMode && torchSupported && !userAdjustedTorchRef.current) {
            await applyTorchToActiveTrack(true);
        }
    };

    const handleCloseScanner = () => {
        stopScanner().then(() => {
            if (onClose) {
                onClose();
            } else if (window.history.length > 1) {
                navigate(-1);
            } else {
                navigate('/');
            }
        });
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
                await page.render({ canvasContext: context, viewport } as any).promise;
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

    const showResultOverlay = loading || !!error || !!user;

    return (
        <div className="fixed inset-0 z-[200] h-[100dvh] bg-black overflow-hidden touch-none overscroll-none">
            <style>{`
                #qr-reader,
                #qr-reader video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                }
                #qr-reader__dashboard_section,
                #qr-reader__scan_region img,
                #qr-reader__status_span,
                #qr-reader img[alt="Info icon"] {
                    display: none !important;
                }
                #qr-reader__scan_region {
                    border: none !important;
                    box-shadow: none !important;
                }
            `}</style>
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
                        className="fixed inset-0 z-[250] bg-[#f2f2f7] text-slate-950 overflow-hidden flex flex-col w-full"
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
                            className="flex-1 min-h-0 h-[calc(100dvh-3.5rem)] px-4 py-5 flex flex-col items-center justify-between gap-4 w-full max-w-lg mx-auto"
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

            <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-black text-white">

                {/* ── CAMERA (flex — no page scroll) ── */}
                <div
                    className={`relative min-h-0 bg-black transition-[flex] duration-300 ease-out ${
                        scannerExpanded ? 'flex-[1_1_72%]' : 'flex-[1_1_52%]'
                    }`}
                >
                    <div id="qr-reader" className={`absolute inset-0 bg-black ${isScanning ? 'opacity-100' : 'opacity-0'}`} />

                    {scannerFail && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-slate-950 px-6 text-center">
                            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 animate-bounce">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-wide">QR Code Not Detected</h3>
                            <p className="text-xs text-white/50 max-w-[260px] leading-relaxed">
                                We couldn't recognize any QR code. Make sure the code is well-lit, not blurry, and centered.
                            </p>
                            <button
                                onClick={() => {
                                    setScannerFail(false);
                                    startScanner();
                                }}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-full shadow-lg transition-colors active:scale-95 cursor-pointer mt-2"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {!isScanning && !scannerFail && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black px-6">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                                <ScanLine className="text-[#d4a547]" size={32} />
                            </div>
                            <p className="text-sm text-white/60 text-center max-w-[260px]">Allow camera access to scan COT ID, Entrust Card, or member QR codes.</p>
                            <button
                                onClick={startScanner}
                                disabled={!scannerInitialized}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-bold rounded-full shadow-lg disabled:opacity-50"
                            >
                                <Camera size={18} /> {scannerInitialized ? 'Open camera' : 'Loading scanner…'}
                            </button>
                        </div>
                    )}

                    <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-4 pb-2 safe-area-top">
                        <button
                            type="button"
                            onClick={handleCloseScanner}
                            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center active:scale-95 transition-transform border border-white/10"
                            aria-label="Close scanner"
                        >
                            <X size={22} />
                        </button>
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={handleTorchToggle}
                                disabled={!torchSupported}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                                    torchOn
                                        ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/40'
                                        : torchSupported
                                            ? 'bg-black/40 backdrop-blur-md text-white border border-white/10'
                                            : 'bg-black/25 text-white/30 cursor-not-allowed border border-white/5'
                                }`}
                                aria-label={torchOn ? 'Turn off flashlight' : 'Turn on flashlight'}
                                title={torchSupported ? (torchOn ? 'Flashlight on' : 'Flashlight off') : 'Flashlight not available'}
                            >
                                {torchOn ? <Flashlight size={20} /> : <FlashlightOff size={20} />}
                            </button>
                            <button
                                type="button"
                                onClick={handleScannerSizeToggle}
                                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center active:scale-95 border border-white/10"
                                aria-label={scannerExpanded ? 'Minimize scanner' : 'Maximize scanner'}
                            >
                                {scannerExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowMyQr(true)}
                                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center active:scale-95 border border-white/10"
                                aria-label={currentUser ? 'Show my COT ID QR code' : 'Show ministry website QR code'}
                                title={currentUser ? 'My QR code' : 'Ministry website QR'}
                            >
                                <QrCode size={20} />
                            </button>
                        </div>
                    </div>

                    {!hideScanBorder && (
                        <div className="absolute left-1/2 top-1/2 z-10 w-[min(72vw,300px)] aspect-square -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                            <span className="absolute top-0 left-0 w-[22%] h-[22%] border-t-[5px] border-l-[5px] border-[#ff6b6b] rounded-tl-2xl" />
                            <span className="absolute top-0 right-0 w-[22%] h-[22%] border-t-[5px] border-r-[5px] border-[#ffb020] rounded-tr-2xl" />
                            <span className="absolute bottom-0 left-0 w-[22%] h-[22%] border-b-[5px] border-l-[5px] border-[#4f8cff] rounded-bl-2xl" />
                            <span className="absolute bottom-0 right-0 w-[22%] h-[22%] border-b-[5px] border-r-[5px] border-[#27c46b] rounded-br-2xl" />
                            <div className="absolute inset-0 border border-white/10 rounded-2xl" />
                        </div>
                    )}

                    {torchOn && (
                        <div className="absolute inset-0 z-[5] pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(255,240,100,0.08) 0%, transparent 70%)' }} />
                    )}

                    <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center px-4">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-lg active:scale-[0.98] transition-transform"
                        >
                            <UploadCloud size={18} />
                            Upload from gallery
                        </button>
                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" />
                    </div>
                </div>

                {/* ── INFO PANEL (fixed height) ── */}
                <section
                    className={`shrink-0 rounded-t-[28px] bg-[#232323] px-5 shadow-[0_-8px_32px_rgba(0,0,0,0.45)] transition-all duration-300 ${
                        scannerExpanded ? 'pt-3 pb-3' : 'pt-4 pb-4'
                    }`}
                >
                    <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-white/50" />
                    {!scannerExpanded && (
                        <>
                            <h1 className="text-center text-xl font-semibold leading-snug text-white">
                                Scan any QR code
                            </h1>
                            <p className="mt-1 text-center text-sm text-white/65">
                                COT ID · Entrust Card · Member QR
                            </p>
                        </>
                    )}
                    {scannerExpanded && (
                        <p className="text-center text-sm font-medium text-white/80">Scan any QR code</p>
                    )}
                    <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                        {scannerStatusLine}
                    </p>
                </section>

                {/* ── FOOTER (fixed) ── */}
                <footer className="shrink-0 bg-black border-t border-white/10 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                    <div className="flex items-center gap-2.5 mb-2.5">
                        <img src="/logo.png" alt="" className="w-7 h-7 object-contain rounded-full bg-white/10 p-0.5" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/90">
                            City of Truth Ministries © {new Date().getFullYear()}
                        </p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
                        <button type="button" className="hover:text-white transition-colors">Privacy Seal</button>
                        <button type="button" className="hover:text-white transition-colors">Digital Covenant</button>
                    </div>
                </footer>
            </div>

            {/* ── RESULT OVERLAY (modal — scanner stays fixed behind) ── */}
            <AnimatePresence>
                {showResultOverlay && (
                    <motion.div
                        key="verify-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
                        onClick={() => {
                            if (loading) return;
                            setUser(null);
                            setError(null);
                            setScannedId(null);
                            if (!isScanning && scannerInitialized) startScanner();
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 16 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-md max-h-[min(82dvh,640px)] overflow-y-auto no-scrollbar rounded-[24px] border border-white/10 bg-[#0d1635] shadow-2xl"
                        >
                <AnimatePresence mode="wait">
                    {loading && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            className="flex flex-col items-center gap-5 p-8 text-center"
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
                            className="p-6 text-center"
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

                            <div className="p-5 flex flex-col gap-5 items-center">
                                {/* Photo */}
                                <div className="relative shrink-0">
                                    <div className={`absolute -inset-2 rounded-full blur-xl opacity-30 ${
                                        user.status === 'Active' ? 'bg-green-400' : user.status === 'Rejected' ? 'bg-red-400' : 'bg-amber-400'
                                    }`} />
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative z-10">
                                        {user.photo
                                            ? <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                                            : <div className="w-full h-full bg-white/10 flex items-center justify-center text-3xl font-black text-white/50">{user.name.charAt(0).toUpperCase()}</div>
                                        }
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 z-20 p-2 rounded-full border-4 border-[#0d1635] ${
                                        user.status === 'Active' ? 'bg-green-500' : user.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-500'
                                    }`}>
                                        {user.status === 'Active' ? <CheckCircle className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="w-full text-center">
                                    <h4 className="text-xl font-black text-white tracking-tight mb-1">{user.name}</h4>
                                    <p className={`font-bold text-sm mb-3 ${
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
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

declare global {
    interface Window { Html5Qrcode: any; }
}

export default VerifyIDPage;
