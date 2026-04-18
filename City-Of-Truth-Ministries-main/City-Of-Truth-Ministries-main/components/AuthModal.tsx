import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight, Phone, Shield, IdCard, ChevronRight, Eye, EyeOff, ScanLine, UploadCloud } from 'lucide-react';
import { Button } from './Button';

type AuthMethod = 'details' | 'scan' | 'upload';
type AuthMode = 'login' | 'link-member';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (identifier: string) => void;
  onRegister: (data: any) => void;
  onFindID: (phone: string) => void;
  onNavigateToRegister: () => void;
  onAdminClick: () => void;
  initialView?: 'choice' | 'login' | 'register' | 'forgot-id';
  mode?: AuthMode;
  initialMethod?: AuthMethod;
  onLinkMember?: (identifierOrId: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onFindID,
  onNavigateToRegister,
  onAdminClick,
  initialView = 'choice',
  mode = 'login',
  initialMethod = 'details',
  onLinkMember
}) => {
  const [view, setView] = useState<'choice' | 'login' | 'register' | 'forgot-id'>(initialView);
  const [method, setMethod] = useState<AuthMethod>(initialMethod);

  const scannerRef = useRef<any>(null);
  const hasHandledScanRef = useRef(false);
  const [scannerReady, setScannerReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [methodError, setMethodError] = useState<string | null>(null);
  const [busyLabel, setBusyLabel] = useState<string | null>(null);

  function extractIdentifierFromQr(decodedText: string): string | null {
    const text = (decodedText || '').trim();
    if (!text) return null;

    const pathMatch = text.match(/\/(verify|card)\/([^?#/]+)/i);
    if (pathMatch?.[2]) return pathMatch[2].trim();

    const cotMatch = text.match(/\bCOT-[A-Z0-9-]+\b/i);
    if (cotMatch?.[0]) return cotMatch[0].trim();

    // Last resort: allow simple ID-like payloads
    if (/^[A-Z0-9-]{4,}$/i.test(text)) return text;
    return null;
  }

  function ensureScriptOnce(src: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[data-cot-script="${key}"]`)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.setAttribute('data-cot-script', key);
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.body.appendChild(script);
    });
  }

  async function ensureHtml5QrcodeReady() {
    if (window.Html5Qrcode) return;
    await ensureScriptOnce('https://unpkg.com/html5-qrcode', 'html5-qrcode');
  }

  async function ensurePdfJsReady() {
    if (window.pdfjsLib) return;
    await ensureScriptOnce('https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js', 'pdfjs');
    // The worker is fetched separately by PDF.js, so we point it at the matching CDN version.
    if (window.pdfjsLib?.GlobalWorkerOptions) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    }
  }

  async function stopScanner() {
    const scanner = scannerRef.current;
    if (!scanner) {
      setIsScanning(false);
      return;
    }
    try { await scanner.stop(); } catch { }
    try { await scanner.clear(); } catch { }
    scannerRef.current = null;
    setIsScanning(false);
  }

  function submitIdentifier(identifier: string) {
    const value = (identifier || '').trim();
    if (!value) {
      setMethodError('Please enter a valid Member ID, phone, email, or name.');
      return;
    }

    if (mode === 'link-member') {
      if (!onLinkMember) {
        setMethodError('This action is unavailable right now.');
        return;
      }
      onLinkMember(value);
      return;
    }

    onLogin(value);
  }

  async function startScanner() {
    try {
      setMethodError(null);
      setBusyLabel(null);
      hasHandledScanRef.current = false;
      await ensureHtml5QrcodeReady();
      setScannerReady(!!window.Html5Qrcode);
      if (!window.Html5Qrcode) {
        setMethodError('Scanner failed to load. Please try again or use upload.');
        return;
      }

      setIsScanning(true);
      const html5Qrcode = new window.Html5Qrcode('auth-qr-reader');
      scannerRef.current = html5Qrcode;

      await html5Qrcode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText: string) => {
          if (hasHandledScanRef.current) return;
          const extracted = extractIdentifierFromQr(decodedText);
          if (!extracted) {
            setMethodError('QR not recognized. Please try a different QR or use Enter Details.');
            return;
          }
          hasHandledScanRef.current = true;
          await stopScanner();
          submitIdentifier(extracted);
        },
        () => { }
      );
    } catch (err) {
      console.error('Scanner Error:', err);
      setMethodError('Could not access camera. Please allow camera permissions or use upload.');
      await stopScanner();
    }
  }

  async function scanFileForQr(file: File): Promise<string> {
    await ensureHtml5QrcodeReady();
    if (!window.Html5Qrcode) throw new Error('Scanner failed to load. Please try again.');

    const html5QrCode = new window.Html5Qrcode('auth-qr-reader-hidden');
    try {
      const decodedText: string = await html5QrCode.scanFile(file, true);
      const extracted = extractIdentifierFromQr(decodedText);
      if (!extracted) throw new Error('QR not recognized. Please upload a clearer image or try scanning.');
      return extracted;
    } finally {
      try { await html5QrCode.clear(); } catch { }
    }
  }

  async function scanPdfForQr(pdfFile: File): Promise<string> {
    await ensurePdfJsReady();
    if (!window.pdfjsLib?.getDocument) {
      throw new Error('PDF support failed to load. Please upload an image instead.');
    }

    const data = await pdfFile.arrayBuffer();
    const loadingTask = window.pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;

    const maxPages = Math.min(pdf.numPages || 0, 3);
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      await page.render({ canvasContext: ctx, viewport }).promise;

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) continue;

      const imgFile = new File([blob], `page-${pageNum}.png`, { type: 'image/png' });
      try {
        return await scanFileForQr(imgFile);
      } catch {
        // try next page
      }
    }

    throw new Error('No QR code found in the first 3 pages of that PDF.');
  }

  async function handleUploadFile(file: File) {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/');
    if (!isPdf && !isImage) {
      setMethodError('Unsupported file type. Please upload a PDF or an image (PNG/JPG/JPEG/WebP).');
      return;
    }

    setMethodError(null);
    setBusyLabel(isPdf ? 'Reading PDF…' : 'Reading image…');
    try {
      const identifier = isPdf ? await scanPdfForQr(file) : await scanFileForQr(file);
      submitIdentifier(identifier);
    } catch (err: any) {
      console.error('Upload scan error:', err);
      setMethodError(err?.message || 'Could not read a QR from that file. Please try a clearer file.');
    } finally {
      setBusyLabel(null);
    }
  }

  // Sync view + method when opening. Also clean up scanner when closing.
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setMethod(initialMethod);
      setMethodError(null);
      setBusyLabel(null);
      hasHandledScanRef.current = false;
      setScannerReady(!!window.Html5Qrcode);
      return;
    }
    stopScanner().catch(() => { });
  }, [isOpen, initialView, initialMethod]);

  // Stop camera when leaving scan mode / login view.
  useEffect(() => {
    setMethodError(null);
    if (view !== 'login' || method !== 'scan') {
      stopScanner().catch(() => { });
    }
    if (view === 'login' && (method === 'scan' || method === 'upload')) {
      ensureHtml5QrcodeReady()
        .then(() => setScannerReady(!!window.Html5Qrcode))
        .catch(() => setScannerReady(false));
    }
  }, [view, method]);

  const [formData, setFormData] = useState({ identifier: '', password: '', phone: '', email: '', firstName: '', lastName: '' });
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (view === 'login') {
      submitIdentifier(formData.identifier);
    } else if (view === 'register') {
      onRegister(formData);
    } else {
      onFindID(formData.phone);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.97, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0, y: 20 }}
        className="relative bg-white w-full h-full sm:h-[92vh] sm:max-w-6xl rounded-none sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="h-44 sm:h-52 bg-gradient-to-br from-brand-700 to-brand-900 relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/30 to-transparent"></div>
          <div className="absolute -bottom-16 -right-10 w-64 h-64 bg-accent-500/30 rounded-full blur-3xl"></div>

          <div className="z-10 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white font-bold tracking-tight drop-shadow">
              {view === 'choice'
                ? 'Welcome'
                : view === 'login'
                  ? (mode === 'link-member' ? 'Add Member' : 'Verify Membership')
                  : view === 'register'
                    ? 'Join the Family'
                    : 'Find Account'}
            </h2>
            <p className="text-brand-100 text-sm sm:text-base mt-2">
              {view === 'choice' ? 'Choose your path' : view === 'forgot-id' ? 'Retrieve your Member ID' : 'City of Truth Ministries'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/15 hover:bg-white/25 p-2 rounded-full text-white transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-gradient-to-b from-white to-slate-50">
          <AnimatePresence mode="wait">
            {view === 'choice' && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 gap-4"
              >
                <button
                  onClick={() => setView('login')}
                  className="group flex items-center justify-between w-full p-6 bg-white border-2 border-slate-100 hover:border-brand-500 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-brand-700">Verify Membership</h3>
                      <p className="text-xs text-slate-500 font-medium">Access your dashboard</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-brand-500 transform group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={onNavigateToRegister}
                  className="group flex items-center justify-between w-full p-6 bg-white border-2 border-slate-100 hover:border-accent-500 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent-50 flex items-center justify-center text-accent-600 group-hover:bg-accent-500 group-hover:text-white transition-colors">
                      <IdCard size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-accent-700">New Registration</h3>
                      <p className="text-xs text-slate-500 font-medium">Get your Entrust Card</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-accent-500 transform group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={onAdminClick}
                  className="group flex items-center justify-between w-full p-6 bg-white border-2 border-slate-100 hover:border-purple-500 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-purple-700">Admin Access</h3>
                      <p className="text-xs text-slate-500 font-medium">Dashboard Management</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-purple-500 transform group-hover:translate-x-1 transition-all" />
                </button>
              </motion.div>
            )}

            {view === 'login' && (
              <motion.div
                key="login"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="space-y-5"
              >
                {/* Promotional Banner */}
                <div className="bg-gradient-to-r from-brand-50 to-accent-50 rounded-2xl p-4 border border-brand-100 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-600 p-2 rounded-lg">
                      <IdCard className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-brand-900">Member Benefits</p>
                      <p className="text-[10px] text-brand-700">Digital ID Card • Dashboard Access • Exclusive Events</p>
                    </div>
                  </div>
                </div>

                {/* Method Selector */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-50 border border-slate-200 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setMethod('details')}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${method === 'details'
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <User size={16} className={method === 'details' ? 'text-brand-600' : 'text-slate-400'} />
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('scan')}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${method === 'scan'
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <ScanLine size={16} className={method === 'scan' ? 'text-brand-600' : 'text-slate-400'} />
                    Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('upload')}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${method === 'upload'
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <UploadCloud size={16} className={method === 'upload' ? 'text-brand-600' : 'text-slate-400'} />
                    Upload
                  </button>
                </div>

                {(busyLabel || methodError) && (
                  <div
                    className={`rounded-2xl p-4 border text-sm ${methodError
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                  >
                    <p className="font-bold">{methodError ? 'Verification Error' : 'Working...'}</p>
                    <p className="text-xs mt-1">{methodError || busyLabel}</p>
                  </div>
                )}

                {/* Hidden mount point for scanFile */}
                <div id="auth-qr-reader-hidden" className="hidden" />

                {method === 'details' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Member ID / Phone / Email / Name</label>
                    <div className="relative group">
                      <User className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                      <input
                        type="text"
                        placeholder="Enter Member ID, phone, email, or name"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        value={formData.identifier}
                        onChange={e => setFormData({ ...formData, identifier: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-slate-500 ml-1">Use any identifier already saved in the records.</p>

                    {mode !== 'link-member' && (
                      <div className="flex items-center justify-between text-sm">
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); setView('forgot-id'); }}
                          className="text-brand-600 hover:text-brand-800 font-medium ml-auto"
                        >
                          Forgot ID?
                        </a>
                      </div>
                    )}

                    <Button fullWidth onClick={handleSubmit} className="mt-4 shadow-brand-500/25">
                      {mode === 'link-member' ? 'Add Member' : 'Verify & Login'} <ArrowRight size={18} />
                    </Button>
                  </div>
                )}

                {method === 'scan' && (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
                      <div id="auth-qr-reader" className="w-full h-56" />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={startScanner}
                        className="flex-1 px-4 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] bg-brand-600 hover:bg-brand-700 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={isScanning}
                      >
                        {isScanning ? 'Scanning...' : 'Start Scanning'}
                      </button>
                      <button
                        type="button"
                        onClick={() => stopScanner()}
                        disabled={!isScanning}
                        className="px-4 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        Stop
                      </button>
                    </div>

                    <p className="text-xs text-slate-500">Tip: if camera permission fails, use Upload and select a QR image or a PDF.</p>
                  </div>
                )}

                {method === 'upload' && (
                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-sm font-semibold text-gray-700 ml-1">Upload QR Image or PDF</span>
                      <div className="mt-2 flex items-center justify-center gap-3 px-4 py-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white transition-colors cursor-pointer">
                        <UploadCloud size={20} className="text-brand-600" />
                        <span className="font-black text-[11px] uppercase tracking-widest text-slate-700">
                          Choose File (PDF / PNG / JPG / JPEG / WebP)
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          e.currentTarget.value = '';
                          if (file) await handleUploadFile(file);
                        }}
                      />
                    </label>
                    <p className="text-xs text-slate-500">PDF scanning checks pages 1-3 for a QR code.</p>
                  </div>
                )}

                <div className="mt-6 text-center">
                  <button onClick={() => setView('choice')} className="text-xs font-bold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-wider">
                    ← Back to Options
                  </button>
                </div>
              </motion.div>
            )}

            {view === 'register' && (
              <motion.div
                key="register"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-4 text-center py-8"
              >
                <div className="w-20 h-20 bg-accent-50 text-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IdCard size={40} />
                </div>
                <h3 className="text-xl font-bold text-brand-950">Registration Required</h3>
                <p className="text-sm text-slate-500 px-4">
                  All new members must generate their <strong>Entrust Card</strong> to join the family.
                </p>

                <Button fullWidth onClick={onNavigateToRegister} className="mt-4 shadow-brand-500/25">
                  Proceed to Registration <ArrowRight size={18} />
                </Button>

                <div className="text-center pt-2">
                  <button onClick={() => setView('choice')} className="text-sm font-bold text-brand-600">Back to Menu</button>
                </div>
              </motion.div>
            )}

            {view === 'forgot-id' && (
              <motion.div
                key="forgot"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="space-y-5 text-center"
              >
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <div className="w-16 h-16 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="text-white" size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-brand-950 mb-2">Need Help with Login?</h3>
                  <p className="text-sm text-slate-600 mb-4">Contact the ministry office for assistance</p>

                  <a
                    href="tel:+918056125478"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Phone size={20} />
                    +91 80561 25478
                  </a>

                  <p className="text-xs text-slate-500 mt-4">Office hours: 9 AM - 6 PM</p>
                </div>

                <div className="text-center">
                  <button onClick={() => setView('login')} className="text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors">← Back to Login</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div >
    </div >
  );
};

declare global {
  interface Window {
    Html5Qrcode?: any;
    pdfjsLib?: any;
  }
}
