import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle, XCircle, Search, ScanLine, X, LogIn, Flashlight, FlashlightOff, Maximize2, Minimize2 } from 'lucide-react';
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
}

const VerifyIDPage: React.FC<VerifyIDPageProps> = ({ onProceedToDashboard }) => {
    const [scannedId, setScannedId] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scannerInitialized, setScannerInitialized] = useState(false);
    const [torchSupported, setTorchSupported] = useState(false);
    const [torchOn, setTorchOn] = useState(false);
    const [scannerExpanded, setScannerExpanded] = useState(true);
    const scannerRef = useRef<any>(null);
    const isApprovedUser = user?.status === 'Active';

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
        if (!window.Html5Qrcode || !scannerInitialized) return;
        setIsScanning(true);
        setError(null);
        setScannedId(null);
        setUser(null);
        setScannerExpanded(true);
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
                    applyTorchToActiveTrack(true); // Auto-enable on start
                } else if (attemptsLeft > 0) {
                    setTimeout(() => tryDetectAndEnableTorch(attemptsLeft - 1), 600);
                } else {
                    setTorchSupported(false);
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

    const stopScanner = () => {
        const clearScannerState = () => {
            setIsScanning(false);
            setTorchOn(false);
            setTorchSupported(false);
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
        if (torchSupported) {
            await applyTorchToActiveTrack(nextExpanded);
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
        <div className="min-h-screen bg-gradient-to-br from-[#06080f] via-[#0d1635] to-[#1a237e] pb-20 relative overflow-x-hidden">
            {/* Hidden HTML5QrCode container */}
            <div id="qr-reader-hidden" style={{ display: 'none' }}></div>

            {/* Ambient glow spheres */}
            <div className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] rounded-full bg-[#d4a547]/10 blur-[90px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-60px] w-[260px] h-[260px] rounded-full bg-brand-600/10 blur-[80px] pointer-events-none" />

            {/* ── BRANDED HEADER ── */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/40 border-b border-white/8">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/20 bg-white/5 flex items-center justify-center">
                            <img src="/logo.png" alt="COT" className="w-7 h-7 object-contain" />
                        </div>
                        <div>
                            <p className="text-white font-black text-sm leading-none tracking-wide">City of Truth</p>
                            <p className="text-[#d4a547] text-xs font-bold uppercase tracking-[0.22em]">Ministries</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#d4a547]/15 border border-[#d4a547]/30 text-[#d4a547] text-xs font-black uppercase tracking-[0.2em]">
                            <ScanLine size={12} /> Verify Entrust ID
                        </span>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto pt-8 px-4">

                {/* ── PAGE TITLE ── */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-black uppercase tracking-[0.22em] mb-4">
                        <ScanLine size={11} /> QR Scanner
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                        Verify <span className="text-[#d4a547]">Entrust</span> ID
                    </h1>
                    <p className="text-white/50 text-sm font-medium">Scan or upload a member's QR code to verify their Entrust identity.</p>
                </div>

                {/* ── MAIN SCANNER PANEL ── */}
                <div className="bg-white/5 backdrop-blur-2xl rounded-[28px] border border-white/10 overflow-hidden mb-6 shadow-2xl shadow-black/40">
                    <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/8">

                        {/* LEFT — Camera Scanner */}
                        <div className="p-6 flex flex-col items-center justify-center min-h-[340px]">
                            {!isScanning ? (
                                <div className="text-center w-full">
                                    {/* Decorative viewfinder */}
                                    <div className="relative w-52 h-52 mx-auto mb-6">
                                        {/* Corner brackets */}
                                        <span className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-[#d4a547] rounded-tl-lg" />
                                        <span className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-[#d4a547] rounded-tr-lg" />
                                        <span className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-[#d4a547] rounded-bl-lg" />
                                        <span className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-[#d4a547] rounded-br-lg" />
                                        {/* Inner area */}
                                        <div className="absolute inset-4 flex items-center justify-center rounded-xl bg-white/5 border border-white/8">
                                            <ScanLine className="text-white/20 w-16 h-16" />
                                        </div>
                                        {/* Scan line animation */}
                                        <div
                                            className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-[#d4a547] to-transparent"
                                            style={{ top: '16px', animation: 'scan-line 2.4s ease-in-out infinite' }}
                                        />
                                    </div>
                                    <h3 className="font-black text-white text-lg mb-1">Camera Scanner</h3>
                                    <p className="text-white/50 text-xs mb-5 max-w-xs mx-auto">Point your device camera at a member's printed or digital QR code.</p>
                                    <button
                                        onClick={startScanner}
                                        disabled={!scannerInitialized}
                                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#d4a547] to-[#f0c040] text-[#1a0d00] font-black rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-[#d4a547]/25 disabled:opacity-50 text-sm uppercase tracking-widest"
                                    >
                                        <Camera size={18} /> Start Scanner
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full flex flex-col gap-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-red-400">
                                            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /> Live Scanning
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={handleScannerSizeToggle}
                                                className="p-2 rounded-xl bg-white/10 border border-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all"
                                                title={scannerExpanded ? 'Minimize scanner' : 'Maximize scanner'}
                                            >
                                                {scannerExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                                            </button>
                                            <button
                                                onClick={handleTorchToggle}
                                                disabled={!torchSupported}
                                                className="p-2 rounded-xl bg-white/10 border border-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all disabled:opacity-35 disabled:cursor-not-allowed"
                                                title={torchSupported ? (torchOn ? 'Turn flashlight off' : 'Turn flashlight on') : 'Flashlight not supported on this device'}
                                            >
                                                {torchOn ? <Flashlight size={15} /> : <FlashlightOff size={15} />}
                                            </button>
                                            <button
                                                onClick={stopScanner}
                                                className="p-2 rounded-xl bg-white/10 border border-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    {/* QR reader element with framed overlay */}
                                    <div className={`relative rounded-2xl overflow-hidden bg-black aspect-square w-full mx-auto transition-all duration-300 ${scannerExpanded ? 'max-w-[280px]' : 'max-w-[140px]'}`}>
                                        <div id="qr-reader" className="absolute inset-0 w-full h-full" />
                                        {/* Corner brackets overlay */}
                                        <div className="absolute inset-0 pointer-events-none">
                                            <span className="absolute top-3 left-3 w-7 h-7 border-t-2 border-l-2 border-[#d4a547] rounded-tl" />
                                            <span className="absolute top-3 right-3 w-7 h-7 border-t-2 border-r-2 border-[#d4a547] rounded-tr" />
                                            <span className="absolute bottom-3 left-3 w-7 h-7 border-b-2 border-l-2 border-[#d4a547] rounded-bl" />
                                            <span className="absolute bottom-3 right-3 w-7 h-7 border-b-2 border-r-2 border-[#d4a547] rounded-br" />
                                            {/* Scan sweep line */}
                                            <div
                                                className="absolute inset-x-6 h-0.5 bg-gradient-to-r from-transparent via-[#f0c040] to-transparent opacity-80"
                                                style={{ top: '50%', animation: 'scan-sweep 1.8s ease-in-out infinite' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Torch button — large, prominent, always visible */}
                                    <div className="flex items-center justify-center gap-3 mt-2">
                                        <button
                                            onClick={handleTorchToggle}
                                            disabled={!torchSupported}
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
                                                torchOn
                                                    ? 'bg-[#f0c040] text-[#1a0d00] shadow-[#f0c040]/50 scale-105'
                                                    : torchSupported
                                                        ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                                                        : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                                            }`}
                                            title={torchSupported ? (torchOn ? 'Turn flashlight off' : 'Turn flashlight on') : 'Flashlight not supported on this device'}
                                        >
                                            {torchOn ? <Flashlight size={16} /> : <FlashlightOff size={16} />}
                                            {torchOn ? 'Flash ON' : torchSupported ? 'Flash OFF' : 'No Flash'}
                                        </button>
                                        <button
                                            onClick={handleScannerSizeToggle}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 hover:text-white font-black text-xs uppercase tracking-widest transition-all"
                                            title={scannerExpanded ? 'Minimize scanner' : 'Maximize scanner'}
                                        >
                                            {scannerExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                            {scannerExpanded ? 'Minimize' : 'Maximize'}
                                        </button>
                                    </div>

                                    <p className="text-center text-white/60 text-xs font-bold uppercase tracking-wider">
                                        {scannerExpanded ? 'Align QR code within the frame' : 'Minimized — tap Maximize to expand'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* RIGHT — Upload & Manual */}
                        <div className="p-6 flex flex-col justify-center gap-5">
                            {/* Upload */}
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d4a547] mb-3 flex items-center gap-2">
                                    <Camera size={11} /> Upload QR / PDF
                                </p>
                                <label className="flex items-center gap-4 w-full p-4 border border-dashed border-white/15 rounded-2xl cursor-pointer hover:bg-white/8 hover:border-[#d4a547]/50 transition-all group bg-white/3">
                                    <div className="w-11 h-11 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#d4a547]/40 transition-all">
                                        <Camera size={20} className="text-white/50 group-hover:text-[#d4a547] transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="block text-white font-bold text-sm mb-0.5">Select Screenshot or File</span>
                                        <span className="block text-white/60 text-xs">QR image, PDF, or any file with a COT ID</span>
                                    </div>
                                    <input type="file" className="hidden" onChange={handleFileUpload} />
                                </label>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-px bg-white/10 flex-1" />
                                <span className="text-xs font-black text-white/60 uppercase tracking-[0.28em]">or</span>
                                <div className="h-px bg-white/10 flex-1" />
                            </div>

                            {/* Manual entry */}
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d4a547] mb-3 flex items-center gap-2">
                                    <Search size={11} /> Type COT ID
                                </p>
                                <form onSubmit={handleManualCheck} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="e.g. COT-1234"
                                        value={scannedId || ''}
                                        onChange={(e) => setScannedId(e.target.value)}
                                        className="flex-1 px-4 py-3 bg-white/5 border border-white/12 rounded-xl outline-none focus:border-[#d4a547]/60 focus:bg-white/8 transition-all font-mono text-white placeholder:text-white/40 text-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!scannedId || loading}
                                        className="px-5 py-3 bg-gradient-to-r from-[#d4a547] to-[#f0c040] text-[#1a0d00] font-black rounded-xl hover:brightness-110 transition-all disabled:opacity-40 text-sm"
                                    >
                                        Verify
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CSS for scan animations */}
                <style>{`
                    @keyframes scan-line {
                        0%   { top: 16px; opacity: 0; }
                        10%  { opacity: 1; }
                        90%  { opacity: 1; }
                        100% { top: calc(100% - 16px); opacity: 0; }
                    }
                    @keyframes scan-sweep {
                        0%   { top: 20%; opacity: 0.6; }
                        50%  { top: 80%; opacity: 1; }
                        100% { top: 20%; opacity: 0.6; }
                    }
                `}</style>

                {/* ── RESULT / STATUS AREA ── */}
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
                                onClick={() => { setError(null); setScannedId(null); }}
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
                                                <p className="text-xs font-black text-white/60 uppercase tracking-[0.2em] mb-0.5">Member Since</p>
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

                <p className="text-center text-white/60 text-xs font-bold uppercase tracking-[0.2em] pt-10 pb-4">
                    City of Truth Ministries · Secure Identity Verification
                </p>
            </div>
        </div>
    );
};

declare global {
    interface Window { Html5Qrcode: any; }
}

export default VerifyIDPage;
