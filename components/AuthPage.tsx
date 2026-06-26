import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, ArrowLeft, ArrowRight, Phone, Shield, IdCard, CheckCircle, MapPin, QrCode, UploadCloud, X, UserCheck, UserPlus, Flashlight, FlashlightOff, Maximize2, Minimize2, Share2, Download } from 'lucide-react';
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
    sessionUser?: { id: string; name: string; photo?: string } | null;
    initialView?: 'choice' | 'login' | 'register' | 'forgot-id';
    initialIdentifier?: string;
    initialAction?: 'scan' | 'upload';
}

const WEBSITE_URL = 'https://city-of-truth-ministries.vercel.app';

export const AuthPage: React.FC<AuthPageProps> = ({
    onLogin,
    onNavigateToRegister,
    onAdminClick,
    onBack,
    users = [],
    sessionUser = null,
    initialView = 'login',
    initialIdentifier = '',
    initialAction
}) => {
    const [view, setView] = useState<'choice' | 'login' | 'register' | 'forgot-id'>(initialView);
    const [identifier, setIdentifier] = useState('');
    const [previewUser, setPreviewUser] = useState<any | null>(null);
    const [previewProfileId, setPreviewProfileId] = useState<string | null>(null);
    const [searching, setSearching] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [showMyQr, setShowMyQr] = useState(false);
    const [scanningFile, setScanningFile] = useState(false);
    const [showLoginIntro, setShowLoginIntro] = useState(false);
    const [loginTourStepIndex, setLoginTourStepIndex] = useState<number | null>(null);
    const [loginTourRect, setLoginTourRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
    const [torchOn, setTorchOn] = useState(false);
    const [torchSupported, setTorchSupported] = useState(false);
    const [scannerExpanded, setScannerExpanded] = useState(false);
    const [autoScannerMode, setAutoScannerMode] = useState(true);
    const [authScannerNotice, setAuthScannerNotice] = useState('Auto mode: expand, light on, then compact.');
    const [hideScanBorder, setHideScanBorder] = useState(false);
    const [scannerFail, setScannerFail] = useState(false);
    const scannerRef = useRef<any>(null);
    const scannerTimeoutsRef = useRef<number[]>([]);

    const clearScannerTimeouts = () => {
        scannerTimeoutsRef.current.forEach(t => window.clearTimeout(t));
        scannerTimeoutsRef.current = [];
    };
    const uploadInputRef = useRef<HTMLInputElement | null>(null);
    const userAdjustedSizeRef = useRef(false);
    const userAdjustedTorchRef = useRef(false);
    const ambientSensorRef = useRef<{ stop: () => void } | null>(null);
    const autoMinimizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const AUTO_EXPAND_DURATION_MS = 3600;
    const handledInitialActionRef = useRef<string | null>(null);
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

    const registeredMemberForQr = useMemo(() => {
        if (sessionUser?.id) {
            return { id: sessionUser.id, name: sessionUser.name, photo: sessionUser.photo };
        }
        if (previewUser) {
            const memberId = previewProfileId || previewUser.id;
            const linked = (previewUser.linkedProfiles || []).find((sp: any) => sp.id === memberId);
            return {
                id: memberId,
                name: linked?.name || previewUser.name,
                photo: linked?.photo || previewUser.photo,
            };
        }
        const query = identifier.trim();
        if (query) {
            const match = findUserByQuery(query);
            if (match) {
                const u = match.user;
                const linked = (u.linkedProfiles || []).find((sp: any) => sp.id === match.profileId);
                return {
                    id: match.profileId,
                    name: linked?.name || u.name,
                    photo: linked?.photo || u.photo,
                };
            }
        }
        return null;
    }, [sessionUser, previewUser, previewProfileId, identifier, users]);

    const myQrUrl = registeredMemberForQr
        ? `${WEBSITE_URL}/verify/${encodeURIComponent(registeredMemberForQr.id)}`
        : WEBSITE_URL;
    const myQrImage = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(myQrUrl)}&bgcolor=ffffff&color=1a1450&margin=1`;
    const myQrTitle = registeredMemberForQr ? registeredMemberForQr.name : 'City of Truth Ministries';
    const myQrSubtitle = registeredMemberForQr ? `COT ID: ${registeredMemberForQr.id}` : 'Official ministry website';

    const handleShareMyQr = async () => {
        const shareData = {
            title: registeredMemberForQr
                ? `${registeredMemberForQr.name} — City of Truth Ministries`
                : 'City of Truth Ministries',
            text: registeredMemberForQr
                ? `Verify my Entrust ID: ${registeredMemberForQr.id}`
                : 'Visit City of Truth Ministries',
            url: myQrUrl,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(myQrUrl);
                alert('Link copied to clipboard!');
            }
        } catch (_e) {
            try {
                await navigator.clipboard.writeText(myQrUrl);
                alert('Link copied!');
            } catch (_err) { /* ignore */ }
        }
    };

    const openMyQrPanel = () => {
        setShowMyQr(true);
    };

    const closeMyQrPanel = () => {
        setShowMyQr(false);
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

    const getAuthVideoTrack = (): MediaStreamTrack | null => {
        const videoElement = document.querySelector<HTMLVideoElement>('#qr-auth-page-reader video');
        const stream = videoElement?.srcObject as MediaStream | null;
        return stream?.getVideoTracks?.()[0] || null;
    };

    const applyAuthTorch = async (enabled: boolean) => {
        const track = getAuthVideoTrack();
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

    const clearAuthAutoMinimizeTimer = () => {
        if (autoMinimizeTimerRef.current != null) {
            window.clearTimeout(autoMinimizeTimerRef.current);
            autoMinimizeTimerRef.current = null;
        }
    };

    const teardownAuthAmbientSensor = () => {
        if (ambientSensorRef.current) {
            try { ambientSensorRef.current.stop(); } catch (_e) { /* ignore */ }
            ambientSensorRef.current = null;
        }
    };

    const setupAuthAmbientSensor = () => {
        if (!autoScannerMode || userAdjustedTorchRef.current || ambientSensorRef.current) return;
        if (!('AmbientLightSensor' in window)) return;
        try {
            const sensor = new (window as any).AmbientLightSensor();
            sensor.addEventListener('reading', () => {
                if (!autoScannerMode || userAdjustedTorchRef.current) return;
                if (sensor.illuminance < 50) applyAuthTorch(true);
                else if (sensor.illuminance > 120) applyAuthTorch(false);
            });
            sensor.start();
            ambientSensorRef.current = sensor;
        } catch (_e) { /* ignore */ }
    };

    const runAuthAutoSizeCycle = () => {
        if (!autoScannerMode || userAdjustedSizeRef.current) return;
        clearAuthAutoMinimizeTimer();
        setScannerExpanded(true);
        setAuthScannerNotice('Auto expanded · turning on flashlight…');
        if (torchSupported && !userAdjustedTorchRef.current) {
            applyAuthTorch(true);
        }
        autoMinimizeTimerRef.current = window.setTimeout(() => {
            if (!userAdjustedSizeRef.current) {
                setScannerExpanded(false);
                setAuthScannerNotice('Scanner compact · tap ⊕ to expand');
            }
        }, AUTO_EXPAND_DURATION_MS);
    };

    const stopScanner = () => {
        clearScannerTimeouts();
        clearAuthAutoMinimizeTimer();
        teardownAuthAmbientSensor();
        applyAuthTorch(false).catch(() => {});
        setTorchOn(false);
        setTorchSupported(false);
        setScannerExpanded(true);
        setAuthScannerNotice(autoScannerMode ? 'Auto mode: expand, light on, then compact.' : 'Point camera at any QR code to scan.');
        if (scannerRef.current) {
            scannerRef.current.stop().then(() => {
                scannerRef.current = null;
            }).catch(() => {
                scannerRef.current = null;
            });
        }
    };

    const startLiveScanner = () => {
        setTorchOn(false);
        setTorchSupported(false);
        setHideScanBorder(false);
        setScannerFail(false);
        clearScannerTimeouts();
        userAdjustedSizeRef.current = false;
        userAdjustedTorchRef.current = false;
        if (autoScannerMode) {
            setScannerExpanded(true);
        }
        setAuthScannerNotice('Starting camera…');
        const h5 = new (window as any).Html5Qrcode('qr-auth-page-reader');
        scannerRef.current = h5;

        const tryDetectTorch = (attemptsLeft = 5) => {
            const track = getAuthVideoTrack();
            const caps = ((track as any)?.getCapabilities?.() as any) || {};
            if (caps.torch) {
                setTorchSupported(true);
                if (autoScannerMode && !userAdjustedTorchRef.current) {
                    applyAuthTorch(true);
                    setAuthScannerNotice('Auto light on · will compact shortly…');
                } else {
                    setAuthScannerNotice('Tap flash for light · point at QR code');
                }
            } else if (attemptsLeft > 0) {
                setTimeout(() => tryDetectTorch(attemptsLeft - 1), 600);
            } else {
                setTorchSupported(false);
                setAuthScannerNotice(autoScannerMode ? 'Auto compact soon · no flash on this device' : 'Point camera at any QR code to scan.');
            }
        };

        h5.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 260, height: 260 } },
            (decodedText: string) => {
                clearScannerTimeouts();
                const qrData = extractIdentifier(decodedText);
                applyAuthTorch(false).catch(() => {});
                setIdentifier(qrData);
                setShowScanner(false);
                handleSearch(qrData);
            },
            () => {}
        ).then(() => {
            setTimeout(() => tryDetectTorch(), 800);
            if (autoScannerMode) {
                runAuthAutoSizeCycle();
                setupAuthAmbientSensor();
            }

            // Schedule scanner failure and zoom timeouts
            const t5 = window.setTimeout(async () => {
                setHideScanBorder(true);
                await applyAuthTorch(true);
                const track = getAuthVideoTrack();
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
                const track = getAuthVideoTrack();
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

            const t10 = window.setTimeout(() => {
                stopScanner();
                setScannerFail(true);
            }, 10000);
            scannerTimeoutsRef.current.push(t10);

        }).catch(() => {
            setShowScanner(false);
            clearScannerTimeouts();
        });
    };

    useEffect(() => {
        return () => {
            clearScannerTimeouts();
        };
    }, []);

    useEffect(() => {
        if (!showScanner && !showMyQr) return;
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
    }, [showScanner, showMyQr]);

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
        if (!initialAction || handledInitialActionRef.current === initialAction) return;
        handledInitialActionRef.current = initialAction;
        localStorage.setItem('cot_auth_login_tour_seen', '1');
        setShowLoginIntro(false);
        setLoginTourStepIndex(null);
        setLoginTourRect(null);
        setView('login');

        const timer = window.setTimeout(() => {
            const targetId = initialAction === 'scan' ? 'auth-login-qr-btn' : 'auth-login-upload-btn';
            const target = document.getElementById(targetId);
            target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (initialAction === 'upload') uploadInputRef.current?.focus();
            else setShowScanner(true);
        }, 250);

        return () => window.clearTimeout(timer);
    }, [initialAction]);

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
        const files = Array.from(e.target.files || []) as File[];
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
                    await page.render({ canvasContext: context, viewport } as any).promise;
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
                    } catch (error: any) {
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
                                        id="auth-login-qr-btn"
                                        type="button"
                                        onClick={() => setShowScanner(!showScanner)}
                                        className={`group flex flex-col items-center justify-center p-5 md:p-8 border-2 rounded-[1.5rem] md:rounded-[2.5rem] transition-all duration-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300/40 ${showScanner ? 'bg-red-50 border-red-200 text-red-600 shadow-xl scale-[1.02]' : 'bg-white border-brand-50 hover:border-brand-200 hover:shadow-2xl shadow-sm'}`}
                                    >
                                        <div className={`w-14 h-14 md:w-20 md:h-20 mb-4 md:mb-6 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all duration-500 ${showScanner ? 'bg-red-100 text-red-600 rotate-90' : 'bg-brand-50 text-brand-400 group-hover:bg-brand-600 group-hover:text-white group-hover:rotate-6'}`}>
                                            {showScanner ? <X size={28} className="md:w-9 md:h-9" /> : <QrCode size={28} className="md:w-9 md:h-9" />}
                                        </div>
                                        <h4 className="font-black text-lg md:text-xl mb-1 md:mb-2 tracking-tight">{showScanner ? 'Close Scanner' : 'Use QR Scanner'}</h4>
                                        <p className="text-[10px] text-brand-300 font-black uppercase tracking-widest">Verify via Digital ID</p>
                                    </button>

                                    <label id="auth-login-upload-btn" className="group flex flex-col items-center justify-center p-5 md:p-8 bg-white border-2 border-brand-50 hover:border-brand-200 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer focus-within:ring-4 focus-within:ring-brand-300/40">
                                        <div className="w-14 h-14 md:w-20 md:h-20 mb-4 md:mb-6 rounded-2xl md:rounded-3xl bg-brand-50 text-brand-400 group-hover:bg-brand-600 group-hover:text-white group-hover:-translate-y-1 transition-all duration-500 flex items-center justify-center">
                                            {scanningFile ? <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-brand-400 border-t-transparent rounded-full animate-spin" /> : <UploadCloud size={28} className="md:w-9 md:h-9" />}
                                        </div>
                                        <h4 className="font-black text-lg md:text-xl mb-1 md:mb-2 tracking-tight">Upload Entrust Card</h4>
                                        <p className="text-[10px] text-brand-300 font-black uppercase tracking-widest">Any image/PDF, multiple files supported</p>
                                        <input ref={uploadInputRef} type="file" className="sr-only" onChange={handleFileQRScan} disabled={scanningFile} multiple accept="image/*,.pdf" />
                                    </label>
                                </div>
                            </div>

                            {/* My QR — member COT ID or ministry website */}
                            <AnimatePresence>
                                {showMyQr && (
                                    <motion.div
                                        key="auth-myqr"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-[10001] bg-[#f2f2f7] text-slate-950 overflow-hidden flex flex-col"
                                    >
                                        <div className="shrink-0 h-14 px-4 flex items-center justify-between border-b border-slate-200/80 bg-white">
                                            <button
                                                type="button"
                                                onClick={closeMyQrPanel}
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100"
                                                aria-label="Back to scanner"
                                            >
                                                <ArrowLeft size={22} />
                                            </button>
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-green-500 text-white">
                                                    <CheckCircle size={13} />
                                                </span>
                                                Secure Environment
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleShareMyQr}
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100"
                                                aria-label="Share QR code"
                                            >
                                                <Download size={22} />
                                            </button>
                                        </div>

                                        <div className="flex-1 min-h-0 flex flex-col items-center justify-between px-4 py-5 w-full max-w-lg mx-auto">
                                            <div className="w-full flex-1 flex flex-col justify-center">
                                                <div className="w-full bg-white rounded-3xl p-5 shadow-sm border border-slate-100 text-center">
                                                    <div className="flex items-center justify-center gap-3 mb-4">
                                                        {registeredMemberForQr ? (
                                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#e38200] text-white flex items-center justify-center text-xl font-semibold shrink-0">
                                                                {registeredMemberForQr.photo
                                                                    ? <img src={registeredMemberForQr.photo} alt="" className="w-full h-full object-cover" />
                                                                    : registeredMemberForQr.name.charAt(0).toUpperCase()
                                                                }
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                                                <img src="/logo.png" alt="" className="w-9 h-9 object-contain" />
                                                            </div>
                                                        )}
                                                        <div className="text-left min-w-0">
                                                            <h2 className="text-xl font-semibold text-slate-900 truncate">{myQrTitle}</h2>
                                                            <p className="text-sm text-slate-500 truncate">{myQrSubtitle}</p>
                                                        </div>
                                                    </div>

                                                    <div className="relative mx-auto w-[min(72vw,280px)] aspect-square bg-white p-2 rounded-2xl border border-slate-100">
                                                        <img src={myQrImage} alt="" className="w-full h-full object-contain" />
                                                        <div className="absolute left-1/2 top-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md flex items-center justify-center border border-slate-100">
                                                            <img src="/logo.png" alt="" className="w-8 h-8 object-contain" />
                                                        </div>
                                                    </div>

                                                    <p className="mt-4 text-base font-medium text-slate-800">
                                                        {registeredMemberForQr ? 'Scan to verify COT ID' : 'Scan to open City of Truth Ministries'}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500 break-all px-1">{myQrUrl}</p>
                                                </div>
                                            </div>

                                            <div className="w-full shrink-0 space-y-3 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={handleShareMyQr}
                                                    className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold flex items-center justify-center gap-2"
                                                >
                                                    <Share2 size={22} /> Share QR code
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={closeMyQrPanel}
                                                    className="w-full h-14 rounded-2xl bg-white border-2 border-slate-200 text-blue-700 text-lg font-semibold flex items-center justify-center gap-2"
                                                >
                                                    <QrCode size={22} /> Open scanner
                                                </button>
                                                <p className="text-center text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 pb-1">
                                                    Powered by City of Truth Ministries
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* QR Scanner — full-screen static layout (no page scroll) */}
                            {showScanner && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-[9999] bg-black text-white overflow-hidden touch-none overscroll-none"
                                >
                                    <style>{`
                                        #qr-auth-page-reader,
                                        #qr-auth-page-reader video {
                                            width: 100% !important;
                                            height: 100% !important;
                                            object-fit: cover !important;
                                        }
                                        #qr-auth-page-reader__dashboard_section,
                                        #qr-auth-page-reader__scan_region img,
                                        #qr-auth-page-reader__status_span,
                                        #qr-auth-page-reader img[alt="Info icon"] {
                                            display: none !important;
                                        }
                                        #qr-auth-page-reader__scan_region {
                                            border: none !important;
                                            box-shadow: none !important;
                                        }
                                    `}</style>

                                    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-black">
                                        {/* Camera — flex grows/shrinks with expand/compact */}
                                                        <div
                                            className={`relative min-h-0 bg-black transition-[flex] duration-300 ease-out ${
                                                scannerExpanded ? 'flex-[1_1_72%]' : 'flex-[1_1_52%]'
                                            }`}
                                        >
                                            <div id="qr-auth-page-reader" role="region" aria-label="QR code scanner" className="absolute inset-0 bg-black" />

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
                                                            startLiveScanner();
                                                        }}
                                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-full shadow-lg transition-colors active:scale-95 cursor-pointer mt-2"
                                                    >
                                                        Try Again
                                                    </button>
                                                </div>
                                            )}

                                            <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-4 pb-2">
                                                <button
                                                    type="button"
                                                    onClick={() => { stopScanner(); setShowScanner(false); }}
                                                    className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center active:scale-95 border border-white/10"
                                                    aria-label="Close scanner"
                                                >
                                                    <X size={22} />
                                                </button>
                                                <div className="flex items-center gap-2.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (!torchSupported) return;
                                                            userAdjustedTorchRef.current = true;
                                                            const next = !torchOn;
                                                            applyAuthTorch(next);
                                                            setAuthScannerNotice(next ? 'Flashlight on' : 'Flashlight off');
                                                        }}
                                                        disabled={!torchSupported}
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 ${
                                                            torchOn
                                                                ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/40'
                                                                : torchSupported
                                                                    ? 'bg-black/40 backdrop-blur-md text-white border border-white/10'
                                                                    : 'bg-black/25 text-white/30 cursor-not-allowed border border-white/5'
                                                        }`}
                                                        aria-label={torchOn ? 'Turn off flashlight' : 'Turn on flashlight'}
                                                        title={torchSupported ? (torchOn ? 'Flashlight on' : 'Flashlight off') : 'Flashlight not available on this device'}
                                                    >
                                                        {torchOn ? <Flashlight size={20} /> : <FlashlightOff size={20} />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            userAdjustedSizeRef.current = true;
                                                            clearAuthAutoMinimizeTimer();
                                                            const next = !scannerExpanded;
                                                            setScannerExpanded(next);
                                                            setAuthScannerNotice(
                                                                next ? 'Scanner expanded · tap ⊖ to compact' : 'Scanner compact · tap ⊕ to expand'
                                                            );
                                                            if (autoScannerMode && next && torchSupported && !userAdjustedTorchRef.current) {
                                                                applyAuthTorch(true);
                                                            }
                                                        }}
                                                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center active:scale-95 border border-white/10"
                                                        aria-label={scannerExpanded ? 'Minimize scanner' : 'Maximize scanner'}
                                                    >
                                                        {scannerExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={openMyQrPanel}
                                                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center active:scale-95 border border-white/10"
                                                        aria-label={registeredMemberForQr ? 'Show my COT ID QR code' : 'Show ministry website QR code'}
                                                        title={registeredMemberForQr ? 'My QR code' : 'Ministry website QR'}
                                                    >
                                                        <QrCode size={20} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Scan frame — centered in camera area only */}
                                            {!hideScanBorder && (
                                                <div className="absolute left-1/2 top-1/2 z-10 w-[min(68vw,280px)] aspect-square -translate-x-1/2 -translate-y-1/2 pointer-events-none">
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
                                                    onClick={() => uploadInputRef.current?.click()}
                                                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-lg active:scale-[0.98]"
                                                >
                                                    <UploadCloud size={18} />
                                                    Upload from gallery
                                                </button>
                                            </div>
                                        </div>

                                        {/* Info panel — fixed height, not overlapping camera */}
                                        <section
                                            className={`shrink-0 rounded-t-[28px] bg-[#232323] px-5 shadow-[0_-8px_32px_rgba(0,0,0,0.45)] transition-all duration-300 ${
                                                scannerExpanded ? 'pt-3 pb-3' : 'pt-4 pb-4'
                                            }`}
                                        >
                                            <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-white/50" />
                                            {!scannerExpanded && (
                                                <>
                                                    <p className="text-center text-xl font-semibold text-white leading-snug">Scan any QR code</p>
                                                    <p className="mt-1 text-center text-sm text-white/65">COT ID · Entrust Card · Member QR</p>
                                                </>
                                            )}
                                            {scannerExpanded && (
                                                <p className="text-center text-sm font-medium text-white/80">Scan any QR code</p>
                                            )}
                                            <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                                                {authScannerNotice}
                                            </p>
                                        </section>

                                        <footer className="shrink-0 bg-black border-t border-white/10 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                                            <div className="flex items-center gap-2.5 mb-2.5">
                                                <img src="/logo.png" alt="" className="w-7 h-7 object-contain rounded-full bg-white/10 p-0.5" />
                                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/90">
                                                    City of Truth Ministries © {new Date().getFullYear()}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
                                                <span className="hover:text-white transition-colors cursor-pointer">Privacy Seal</span>
                                                <span className="hover:text-white transition-colors cursor-pointer">Digital Covenant</span>
                                            </div>
                                        </footer>
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
