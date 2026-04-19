import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle, XCircle, Search, ScanLine, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { User } from '../types';
import { Navbar } from './Navbar';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

const VerifyIDPage = () => {
    const [scannedId, setScannedId] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scannerInitialized, setScannerInitialized] = useState(false);
    const scannerRef = useRef<any>(null);

    const extractIdFromQr = (value: string) => {
        const qrData = value.trim();
        if (qrData.includes('/verify/')) {
            return qrData.split('/verify/')[1]?.split('?')[0]?.trim() || qrData;
        }
        return qrData;
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
        setLoading(true); setError(null); setUser(null);
        try {
            const userRef = doc(db, 'users', idToVerify);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setUser({ ...userSnap.data(), id: userSnap.id } as User);
            } else {
                const allUsers = await api.getUsers();
                let foundMatch = null;
                for (const u of allUsers) {
                    if (u.id === idToVerify) { foundMatch = u; break; }
                    if (u.linkedProfiles) {
                        const subMatch = u.linkedProfiles.find(sp => sp.id === idToVerify);
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
        setIsScanning(true); setError(null); setScannedId(null); setUser(null);
        setTimeout(() => {
            const html5Qrcode = new window.Html5Qrcode('qr-reader');
            scannerRef.current = html5Qrcode;
            html5Qrcode.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText: string) => {
                    const extractedId = extractIdFromQr(decodedText);
                    if (extractedId) {
                        html5Qrcode.stop().then(() => { setIsScanning(false); setScannedId(extractedId); verifyID(extractedId); });
                    }
                },
                (_errorMessage: string) => {}
            ).catch((err: any) => {
                console.error('Scanner Error:', err);
                setError('Could not access camera. Please allow camera permissions or upload a picture.');
                setIsScanning(false);
            });
        }, 300);
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.stop().then(() => { setIsScanning(false); scannerRef.current = null; }).catch(console.error);
        } else { setIsScanning(false); }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !window.Html5Qrcode) return;
        setLoading(true); setError(null); setUser(null); setScannedId(null);
        const html5QrCode = new window.Html5Qrcode('qr-reader-hidden');
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        const scanImageFile = async (imageFile: File) => {
            const decodedText: string = await html5QrCode.scanFile(imageFile, true);
            const extractedId = extractIdFromQr(decodedText);
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

        (isPdf ? scanPdfFile(file) : scanImageFile(file))
            .then((extractedId: string) => {
                setScannedId(extractedId);
                verifyID(extractedId);
            })
            .catch((err: any) => {
                setError(err?.message || 'No valid QR code found in the uploaded file.');
                setLoading(false);
            })
            .finally(() => { e.target.value = ''; });
    };

    const handleManualCheck = (e: React.FormEvent) => {
        e.preventDefault();
        if (scannedId) verifyID(scannedId.trim());
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Navbar />
            <div id="qr-reader-hidden" style={{ display: 'none' }}></div>
            <div className="max-w-5xl mx-auto pt-24 px-4">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-brand-950 mb-3 tracking-tight">Verify ID</h1>
                    <p className="text-slate-500 font-medium">Scan a Worshipper's QR Code or upload their ID to verify.</p>
                </div>
                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-brand-900/5 border border-slate-100 mb-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="grid md:grid-cols-2 gap-10 relative z-10">
                        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 min-h-[300px]">
                            {!isScanning ? (
                                <div className="text-center">
                                    <div className="w-24 h-24 bg-brand-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-brand-50">
                                        <ScanLine className="text-brand-600 w-12 h-12" />
                                    </div>
                                    <h3 className="font-bold text-xl text-slate-800 mb-2">Scan with Camera</h3>
                                    <p className="text-slate-500 mb-6 max-w-xs mx-auto text-sm">Use your device camera to quickly scan a digital or printed ID card.</p>
                                    <button onClick={startScanner} disabled={!scannerInitialized} className="px-8 py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2 mx-auto">
                                        <Camera size={20} /> Start Scanner
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-bold text-brand-600 flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-full">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Scanning Active
                                        </span>
                                        <button onClick={stopScanner} className="p-3 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded-full transition-colors"><X size={20} /></button>
                                    </div>
                                    <div className="flex-1 bg-black rounded-2xl overflow-hidden relative shadow-inner">
                                        <div id="qr-reader" className="absolute inset-0 w-full h-full"></div>
                                        <div className="absolute inset-0 pointer-events-none border-[12px] border-black/50" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col justify-center space-y-8">
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Camera size={20} className="text-brand-500" /> Upload QR Screenshot
                                </h3>
                                <label className="flex items-center gap-4 w-full p-5 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-100 hover:border-brand-300 transition-all font-medium text-slate-600 bg-white group">
                                    <div className="p-3 bg-slate-100 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors rounded-xl">
                                        <Camera size={24} className="text-slate-500 group-hover:text-brand-600" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="block text-slate-800 font-bold mb-1">Select Screenshot or Photo</span>
                                        <span className="block text-xs text-slate-400">Upload an image or PDF containing a valid Worshipper QR code.</span>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*,application/pdf,.pdf" onChange={handleFileUpload} />
                                </label>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-px bg-slate-200 flex-1" />
                                <span className="text-xs font-black text-slate-300 uppercase tracking-widest">OR</span>
                                <div className="h-px bg-slate-200 flex-1" />
                            </div>
                            <form onSubmit={handleManualCheck} className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Search size={20} className="text-brand-500" /> Manual ID Entry
                                </h3>
                                <div className="flex gap-3">
                                    <input type="text" placeholder="e.g. COT-1234" value={scannedId || ''} onChange={(e) => setScannedId(e.target.value)} className="flex-1 px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-mono text-lg placeholder:font-sans" />
                                    <button type="submit" disabled={!scannedId || loading} className="px-6 py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">Verify</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <AnimatePresence mode="wait">
                    {loading && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white p-12 rounded-[2.5rem] text-center shadow-2xl shadow-brand-900/5 border border-slate-100 flex flex-col items-center max-w-2xl mx-auto">
                            <Loader2 className="w-16 h-16 text-brand-500 animate-spin mb-6" />
                            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Verifying ID...</h3>
                            <p className="text-slate-500 mt-2">Checking central database</p>
                        </motion.div>
                    )}
                    {!loading && error && (
                        <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} className="bg-red-50 p-10 rounded-[2.5rem] text-center shadow-2xl shadow-red-500/10 border-2 border-red-100 flex flex-col items-center max-w-2xl mx-auto">
                            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <XCircle className="w-12 h-12 text-red-600" />
                            </div>
                            <h3 className="text-3xl font-black text-red-800 mb-3 tracking-tight">Verification Failed</h3>
                            <p className="text-red-600/80 font-medium text-lg max-w-md">{error}</p>
                            <button onClick={() => { setError(null); setScannedId(null); }} className="mt-8 px-8 py-4 bg-white text-red-600 font-bold rounded-2xl border border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors">Try Again</button>
                        </motion.div>
                    )}
                    {!loading && user && (
                        <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} className="bg-gradient-to-br from-green-50 to-emerald-50 p-10 rounded-[2.5rem] shadow-2xl shadow-green-900/10 border-2 border-green-200 relative overflow-hidden max-w-3xl mx-auto">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-green-400 rounded-full blur-[100px] opacity-20 pointer-events-none" />
                            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                                <div className="w-48 h-48 md:w-56 md:h-56 shrink-0 relative">
                                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20" />
                                    {user.photo ? (
                                        <img src={user.photo} alt={user.name} className="w-full h-full object-cover rounded-full border-8 border-white shadow-2xl relative z-10" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 rounded-full border-8 border-white shadow-2xl relative z-10 flex items-center justify-center text-6xl font-black text-slate-400">{user.name.charAt(0).toUpperCase()}</div>
                                    )}
                                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-3 rounded-full shadow-lg border-4 border-white z-20"><CheckCircle className="w-8 h-8" /></div>
                                </div>
                                <div className="text-center md:text-left flex-1">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-200/50 text-green-800 rounded-full text-sm font-bold uppercase tracking-widest mb-4 border border-green-300/50">
                                        <span className="w-2 h-2 rounded-full bg-green-600 opacity-75" /> Valid Member
                                    </div>
                                    <h4 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">{user.name}</h4>
                                    <p className="text-green-700 font-bold text-xl mb-6">{user.role || 'Worshipper'}</p>
                                    <div className="grid grid-cols-2 gap-4 text-left">
                                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-green-100 shadow-sm">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Member ID</span>
                                            <span className="font-bold text-slate-800 font-mono text-lg">{user.id}</span>
                                        </div>
                                        {user.bloodGroup && (
                                            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-green-100 shadow-sm">
                                                <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] block mb-1">Blood Group</span>
                                                <span className="font-bold text-red-600 text-lg">{user.bloodGroup}</span>
                                            </div>
                                        )}
                                        {user.phone && (
                                            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-green-100 shadow-sm col-span-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Phone Number</span>
                                                <span className="font-bold text-slate-800 text-lg">{user.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => { setUser(null); setScannedId(null); }} className="mt-8 px-6 py-3 w-full bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Scan Another ID</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

declare global {
    interface Window { Html5Qrcode: any; }
}

export default VerifyIDPage;
