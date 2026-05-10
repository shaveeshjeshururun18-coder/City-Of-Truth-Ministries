import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Church, RefreshCw, User, X, Phone, Mail, MapPin, UploadCloud, CheckCircle, ArrowRight, Download, Sparkles, Youtube, FileText, Lock, Eye, EyeOff, Users, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './Button';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import menorahBack from '/entrust-card-flag.png';
import { ImageCropper } from './ImageCropper';

interface EntrustCardProps {
    name?: string;
    email?: string;
    location?: string;
    emergency?: string;
    memberSince?: string;
    uniqueId?: string;
    photo?: string;
    gender?: string;
    status?: string;
    className?: string;
    isBackSide?: boolean;
    isStatic?: boolean;
}

export const EntrustCard3D: React.FC<EntrustCardProps> = ({
    name = "John Doe",
    email = "john@example.com",
    location = "Valparai",
    emergency = "+91 80561 25478",
    memberSince = "2024",
    uniqueId = "COT-SAMPLE",
    gender = "Male",
    photo,
    status,
    className = "",
    isBackSide = false,
    isStatic = false
}) => {
    const [isFlipped, setIsFlipped] = useState(isBackSide);
    const [showQrFullScreen, setShowQrFullScreen] = useState(false);
    const qrModalTitle = 'Scan Entrust QR';

    useEffect(() => {
        if (isStatic) setIsFlipped(isBackSide);
    }, [isBackSide, isStatic]);

    const fullDetails = `CITY OF TRUTH MINISTRIES\nID: ${uniqueId}\nName: ${name}\nLocation: ${location}\nPhone: ${emergency}\nMember Since: ${memberSince}`.trim();
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://city-of-truth-ministries.vercel.app/verify/${uniqueId}`)}&bgcolor=ffffff&color=2c298c&margin=2`;

    const FrontFace = () => (
        <div className="absolute inset-0 bg-white rounded-xl overflow-hidden border border-gray-200 shadow-2xl flex flex-col" style={{ backfaceVisibility: 'hidden' }}>
            {/* Header */}
            <div className="bg-brand-900 text-white px-3 py-2 flex items-center justify-between shrink-0 relative z-20">
                <div className="flex items-center gap-2">
                    <img src="/brand-logo.png" alt="Logo" className="w-7 h-7 object-contain" />
                    <div>
                        <h2 className="font-bold text-[8px] uppercase tracking-wider leading-none">City of Truth Ministries</h2>
                        <p className="text-[6px] text-accent-200 font-medium mt-0.5">சத்திய நகரம் ஊழியங்கள் வால்பாறை</p>
                    </div>
                </div>
                <div className="bg-accent-50 px-4 py-1 rounded-full whitespace-nowrap min-w-0">
                    <p className="text-accent-700 font-bold text-[7px] uppercase tracking-wider">வழிப்பாட்டாளர் அடையாள அட்டை</p>
                </div>
            </div>

            {/* Watermark Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none z-0">
                <img src="/brand-logo.png" alt="" className="w-48 h-48 object-contain transform rotate-12" />
            </div>

            {/* Main Content - Horizontal Layout */}
            <div className="flex-1 flex p-2 gap-2 relative z-10">
                {/* Left: Photo */}
                <div className="w-24 h-28 bg-slate-50 rounded-lg border-2 border-slate-100 flex items-center justify-center text-slate-300 overflow-hidden shadow-sm shrink-0">
                    {photo ? <img src={photo} alt="P" className="w-full h-full object-cover" /> : <User size={32} />}
                </div>

                {/* Right: Details */}
                <div className="flex-1 flex flex-col justify-start min-w-0 space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                        <div className="text-[9px] font-mono font-black text-brand-800 bg-brand-50 px-2 py-0.5 rounded border border-brand-100 inline-block shadow-sm">
                            ID: {uniqueId}
                        </div>
                    </div>

                    <div>
                        <label className="text-[6px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                        <p className="text-[11px] font-black text-brand-950 leading-tight truncate">{name || '—'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-1">
                        <div>
                            <label className="text-[6px] font-bold text-slate-400 uppercase block">Member Since</label>
                            <p className="text-[9px] font-bold text-slate-700">{memberSince || '—'}</p>
                        </div>
                        <div>
                            <label className="text-[6px] font-bold text-slate-400 uppercase block">Location</label>
                            <p className="text-[9px] font-semibold text-slate-700 truncate">{location || '—'}</p>
                        </div>
                    </div>

                    <div>
                        <label className="text-[6px] font-bold text-slate-400 uppercase block">Phone Number</label>
                        <p className="text-[9px] font-semibold text-slate-700">{emergency || '—'}</p>
                    </div>
                </div>

                {/* QR Code Absolute Positioned */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowQrFullScreen(true);
                    }}
                    className="absolute bottom-2 right-2 bg-white p-1 border border-slate-100 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    aria-label="Open QR code"
                >
                    <div className="relative inline-block w-14 h-14">
                        <img src={qrCodeUrl} alt="QR" className="w-full h-full block" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-white rounded-full flex items-center justify-center p-0.5 shadow-sm" style={{ width: '16px', height: '16px' }}>
                                <img src="/logo.png" alt="COT" className="w-full h-full object-contain rounded-full" />
                            </div>
                        </div>
                    </div>
                </button>

                {/* Verified Member Badge */}
                {status === 'Active' && (
                    <div className="absolute right-2 top-0 transform translate-y-1">
                        <div className="relative">
                            <div className="absolute inset-0 bg-accent-500 blur-md opacity-20 rounded-full animate-pulse"></div>
                            <div className="bg-gradient-to-br from-accent-400 to-accent-600 p-1.5 rounded-full shadow-lg border-2 border-white/50 relative">
                                <CheckCircle size={12} className="text-white" strokeWidth={4} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-white px-1.5 py-0.5 rounded-full border border-accent-100 shadow-sm">
                                <p className="text-[5px] font-black text-accent-700 uppercase tracking-tighter whitespace-nowrap">Verified Member</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-brand-950 px-3 py-1.5 flex justify-between items-center border-t-2 border-accent-400 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                <span className="text-[5px] font-bold tracking-wider text-accent-300 uppercase italic z-10 shrink-0">தூய மனதால் இணைவோம்; உயிர்மெய் அருள் ஒளியை பெறுவோம்</span>
                <div className="text-[5px] text-slate-300 font-medium tracking-tight z-10 flex flex-col items-end leading-tight">
                    <span>+91 805625478</span>
                    <span>@COTMINISTRIES</span>
                </div>
            </div>
        </div>
    );

    const BackFace = () => (
        <div
            className="absolute inset-0 rounded-xl overflow-hidden border border-brand-900 shadow-2xl"
            style={{ backfaceVisibility: 'hidden', transform: isStatic ? 'none' : 'rotateY(180deg)' }}
        >
            {/* Background Image Only - New Backside Image with Menorah */}
            <img
                src={menorahBack}
                alt="Entrust Card Back"
                className="absolute inset-0 w-full h-full object-cover"
            />
        </div>
    );

    if (isStatic) {
        return (
            <>
                <div className={`relative w-[340px] h-[215px] bg-slate-100 rounded-xl`}>
                    {isBackSide ? <BackFace /> : <FrontFace />}
                </div>
                <AnimatePresence>
                    {showQrFullScreen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[140] bg-black/90 backdrop-blur-sm p-4 flex items-center justify-center"
                            onClick={() => setShowQrFullScreen(false)}
                        >
                            <motion.div
                                initial={{ y: 20, scale: 0.95 }}
                                animate={{ y: 0, scale: 1 }}
                                exit={{ y: 20, scale: 0.95 }}
                                className="bg-white rounded-3xl p-4 sm:p-6 w-full max-w-md text-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <p className="text-sm font-black text-brand-950 mb-4 uppercase tracking-widest">{qrModalTitle}</p>
                                <img src={qrCodeUrl} alt="Entrust QR Code" className="w-full max-w-[320px] mx-auto rounded-2xl border border-slate-200" />
                                <Button onClick={() => setShowQrFullScreen(false)} className="mt-5 w-full">
                                    Close
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        );
    }

    return (
        <>
            <div
                className={`relative w-[340px] sm:w-[380px] h-[215px] sm:h-[240px] cursor-pointer mx-auto ${className}`}
                onClick={() => setIsFlipped(!isFlipped)}
                style={{ perspective: "1500px" }}
            >
                <motion.div
                    className="w-full h-full relative"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    <div className="w-full h-full">
                        {/* Scale standard 340x215 card to fill 380x240 container if on sm+ screens */}
                        <div className="w-full h-full origin-top-left sm:scale-[1.117]">
                            <div style={{ width: '340px', height: '215px' }}>
                                <FrontFace />
                                <BackFace />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
            <AnimatePresence>
                {showQrFullScreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[140] bg-black/90 backdrop-blur-sm p-4 flex items-center justify-center"
                        onClick={() => setShowQrFullScreen(false)}
                    >
                        <motion.div
                            initial={{ y: 20, scale: 0.95 }}
                            animate={{ y: 0, scale: 1 }}
                            exit={{ y: 20, scale: 0.95 }}
                            className="bg-white rounded-3xl p-4 sm:p-6 w-full max-w-md text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <p className="text-sm font-black text-brand-950 mb-4 uppercase tracking-widest">{qrModalTitle}</p>
                            <img src={qrCodeUrl} alt="Entrust QR Code" className="w-full max-w-[320px] mx-auto rounded-2xl border border-slate-200" />
                            <Button onClick={() => setShowQrFullScreen(false)} className="mt-5 w-full">
                                Close
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

interface WorshipperIDCardProps {
    onRegister?: (data: any) => void;
    onLogin?: () => void;
    currentUser?: {
        displayName?: string;
        email?: string;
        status?: string;
    };
}

type RegistrationType = 'individual' | 'family';

interface FamilyMemberForm {
    id: string;
    name: string;
    relationship: string;
    photo?: string;
    isExpanded: boolean;
}

const RELATIONSHIP_OPTIONS = [
    'Spouse',
    'Son',
    'Daughter',
    'Father',
    'Mother',
    'Brother',
    'Sister',
    'Grandfather',
    'Grandmother',
    'Father-in-law',
    'Mother-in-law',
    'Son-in-law',
    'Daughter-in-law',
    'Grandson',
    'Granddaughter',
    'Uncle',
    'Aunt',
    'Cousin',
    'Guardian',
    'Other'
];

export const WorshipperIDCard: React.FC<WorshipperIDCardProps> = ({ onRegister, onLogin, currentUser }) => {
    const [uniqueId, setUniqueId] = useState('');
    const [registrationType, setRegistrationType] = useState<RegistrationType>('individual');
    const [formData, setFormData] = useState({
        name: currentUser?.displayName || '',
        email: currentUser?.email || '',
        location: '',
        emergency: '',
        password: ''
    });
    const [familyMembers, setFamilyMembers] = useState<FamilyMemberForm[]>([]);
    const [photo, setPhoto] = useState<string | undefined>(undefined);
    const [previewPhoto, setPreviewPhoto] = useState('');
    const [showPhotoPreview, setShowPhotoPreview] = useState(false);
    const [croppingImage, setCroppingImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setUniqueId(`COT-${Math.floor(1000 + Math.random() * 9000)}`);
    }, []);

    // Helper for cropping logic could go here, but for now relying on basic photo upload as per user request flow adjustment
    // The user mentioned "able to crop and edit their photo", so we might need a library or just a simple preview with scale.
    // For simplicity in this step, let's stick to the upload, and maybe later add reacting-image-crop if needed.
    // But they said "while the user abl eto crop and dit their photo", implying it IS happening or SHOULD happen.
    // Given the constraints, I will focus on the main request: No details on back, Email optional, No password field.


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Phone number validation: only allow digits and standard phone characters for emergency/whatsapp field
        // Phone number validation: only allow digits and max 10 characters
        if (name === 'emergency') {
            const cleaned = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: cleaned }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                // Open cropper immediately
                setCroppingImage(reader.result as string);
                // Reset input
                e.target.value = '';
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedImg: string) => {
        setPreviewPhoto(croppedImg);
        setCroppingImage(null);
        setShowPhotoPreview(true);
    };

    const handleConfirmPhoto = () => {
        setPhoto(previewPhoto);
        setShowPhotoPreview(false);
    };

    const handleRejectPhoto = () => {
        setShowPhotoPreview(false);
        setPreviewPhoto('');
    };

    const createFamilyMember = (): FamilyMemberForm => ({
        id: `FM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: '',
        relationship: 'Spouse',
        photo: '',
        isExpanded: true
    });

    const addFamilyMember = () => {
        setFamilyMembers(prev => [...prev.map(member => ({ ...member, isExpanded: false })), createFamilyMember()]);
    };

    const updateFamilyMember = (id: string, field: keyof Omit<FamilyMemberForm, 'id'>, value: string | boolean) => {
        setFamilyMembers(prev => prev.map(member => (
            member.id === id ? { ...member, [field]: value } : member
        )));
    };

    const removeFamilyMember = (id: string) => {
        setFamilyMembers(prev => prev.filter(member => member.id !== id));
    };

    const handleMemberPhotoUpload = (memberId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            updateFamilyMember(memberId, 'photo', typeof reader.result === 'string' ? reader.result : '');
            e.target.value = '';
        };
        reader.readAsDataURL(file);
    };

    const handleDownload = async () => {
        setIsProcessing(true);
        const frontNode = document.getElementById('capture-front');
        if (frontNode) {
            try {
                const dataUrl = await toPng(frontNode, {
                    cacheBust: true,
                    pixelRatio: 4,
                    quality: 1,
                    backgroundColor: '#ffffff'
                });
                const link = document.createElement('a');
                link.download = `ENTRUST-FRONT-HD-${uniqueId}.png`;
                link.href = dataUrl;
                link.click();
            } catch (err) {
                console.error('Front capture failed', err);
            }
        }
        setIsProcessing(false);
    };

    const handleDownloadPDF = async () => {
        setIsProcessing(true);
        const frontNode = document.getElementById('capture-front');
        const backNode = document.getElementById('capture-back');

        if (frontNode && backNode) {
            try {
                const frontDataUrl = await toPng(frontNode, { pixelRatio: 4, quality: 1 });
                const backDataUrl = await toPng(backNode, { pixelRatio: 4, quality: 1 });

                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4',
                    compress: true
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (215 * pdfWidth) / 340;
                const yPos = (pdf.internal.pageSize.getHeight() - pdfHeight) / 2;

                pdf.addImage(frontDataUrl, 'PNG', 0, yPos > 0 ? yPos : 0, pdfWidth, pdfHeight, undefined, 'FAST');
                pdf.addPage();
                pdf.addImage(backDataUrl, 'PNG', 0, yPos > 0 ? yPos : 0, pdfWidth, pdfHeight, undefined, 'FAST');

                pdf.save(`ENTRUST-CARD-HD-FULL-${uniqueId}.pdf`);

                if (onRegister) {
                    onRegister({ ...formData, uniqueId, photo });
                }
            } catch (err) {
                console.error('PDF generation failed', err);
                alert("Failed to create HD PDF. Please try again.");
            }
        }
        setIsProcessing(false);
    };

    return (
        <section className="min-h-screen pt-24 md:pt-48 pb-32 bg-slate-50 relative overflow-hidden">
            {/* Cropper Modal */}
            {croppingImage && (
                <ImageCropper
                    imageSrc={croppingImage}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setCroppingImage(null)}
                />
            )}
            {showPhotoPreview && (
                <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full">
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-brand-600 to-accent-600">
                            <h3 className="font-serif font-bold text-white text-xl">Preview Your Photo</h3>
                            <p className="text-white/80 text-sm mt-1">Does this look good on your ID card?</p>
                        </div>
                        <div className="p-8 bg-slate-50 flex justify-center">
                            <div className="transform scale-90">
                                <EntrustCard3D {...formData} uniqueId={uniqueId} photo={previewPhoto} status="Pending" isStatic={true} isBackSide={false} />
                            </div>
                        </div>
                        <div className="p-6 bg-white border-t border-gray-100 flex gap-3">
                            <Button onClick={handleRejectPhoto} variant="outline" className="flex-1">
                                <X size={18} className="mr-2" /> Try Again
                            </Button>
                            <Button onClick={handleConfirmPhoto} variant="primary" className="flex-1">
                                <CheckCircle size={18} className="mr-2" /> Looks Good!
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {/* HIDDEN CAPTURE AREA */}
            <div className="fixed left-[-9999px] top-0 pointer-events-none">
                <div id="capture-front" className="bg-white">
                    <EntrustCard3D {...formData} uniqueId={uniqueId} photo={photo} status="Pending" isStatic={true} isBackSide={false} />
                </div>
                <div id="capture-back" className="bg-white">
                    <EntrustCard3D {...formData} uniqueId={uniqueId} photo={photo} status="Pending" isStatic={true} isBackSide={true} />
                </div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
                    <div className="inline-flex items-center gap-2 bg-accent-100 text-accent-700 px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] mb-6">
                        <Sparkles size={14} /> Official Member Registration
                    </div>
                    <h1 className="text-3xl md:text-6xl font-serif font-bold text-brand-950 mb-4 md:mb-6 tracking-tight px-2">Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-600">Family</span></h1>
                    <p className="text-lg md:text-xl text-gray-500 font-normal mb-4 px-4">Register now to receive your official City of Truth Ministries Entrust Card.</p>
                    <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-md border border-slate-200 mb-6">
                        <CheckCircle className="text-green-600" size={20} />
                        <span className="text-sm font-bold text-slate-700">Instant Digital ID Card</span>
                    </div>

                    {onLogin && (
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-slate-500 text-sm">Already a member?</span>
                            <button onClick={onLogin} className="text-brand-600 font-bold hover:underline text-sm">Login Here</button>
                        </div>
                    )}
                </div>

                <div className="max-w-xl mx-auto">

                    {/* Form Left */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-4 sm:p-5 md:p-10 rounded-[1.5rem] md:rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
                    >
                        <div className="mb-6">
                            <p className="text-[11px] font-semibold text-slate-600 mb-3">Registration Type</p>
                            <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl">
                                <button
                                    type="button"
                                    onClick={() => setRegistrationType('individual')}
                                    className={`py-2.5 px-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${registrationType === 'individual' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600'}`}
                                >
                                    <User size={16} /> Individual
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRegistrationType('family')}
                                    className={`py-2.5 px-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${registrationType === 'family' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600'}`}
                                >
                                    <Users size={16} /> Family
                                </button>
                            </div>
                            {registrationType === 'family' && (
                                <p className="text-xs text-slate-500 mt-2">Register your household together. Add members if available.</p>
                            )}
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold text-brand-950 mb-5 md:mb-8 flex items-center gap-3 font-serif relative z-10 underline decoration-accent-500 underline-offset-8">
                            {registrationType === 'family' ? 'Family Head Details' : 'Personal Information'}
                        </h3>

                        <div className="space-y-5 md:space-y-8 relative z-10">
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-slate-600 ml-1">
                                    {registrationType === 'family' ? 'Family Head Photo' : 'Member Photo'}
                                </label>
                                <div className="relative group">
                                    <input type="file" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer z-20" accept="image/*" />
                                    <div className="border-2 border-dashed border-slate-300 rounded-2xl md:rounded-3xl p-4 md:p-6 transition-all group-hover:border-accent-400 bg-white shadow-sm flex items-center gap-4 md:gap-6">
                                        <div className="w-14 h-14 md:w-20 md:h-20 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-slate-500 shadow-sm border border-slate-200 overflow-hidden shrink-0">
                                            {photo ? <img src={photo} alt="Member photo" className="w-full h-full object-cover" /> : <UploadCloud size={24} className="md:w-[30px] md:h-[30px]" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-700">{photo ? "Photo Selected" : "Click to select photo"}</p>
                                            <p className="text-xs text-slate-500 mt-1">Visible on your ID</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700 ml-1">Full Name</label>
                                    <input name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full px-4 md:px-6 py-3 md:py-4 bg-white border border-slate-300 rounded-xl md:rounded-2xl outline-none transition-all text-sm font-semibold text-brand-950 placeholder:text-slate-500 shadow-sm focus:ring-2 focus:ring-accent-500/20" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700 ml-1">WhatsApp Number</label>
                                    <div className="flex items-center w-full bg-white border border-slate-300 rounded-xl md:rounded-2xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-accent-500/20">
                                        <span className="px-3 py-3 md:py-4 text-sm font-bold text-slate-700 bg-slate-100 border-r border-slate-200 shrink-0">+91</span>
                                        <input name="emergency" value={formData.emergency} onChange={handleInputChange} type="tel" placeholder="10-digit number" className="flex-1 px-3 md:px-4 py-3 md:py-4 bg-transparent outline-none text-sm font-semibold text-brand-950 placeholder:text-slate-500" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700 ml-1">Email Address</label>
                                    <input name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full px-4 md:px-6 py-3 md:py-4 bg-white border border-slate-300 rounded-xl md:rounded-2xl outline-none transition-all text-sm font-semibold text-brand-950 placeholder:text-slate-500 shadow-sm focus:ring-2 focus:ring-accent-500/20" placeholder="Enter your email (optional)" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700 ml-1">Tamil Nadu District</label>
                                    <select
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full px-4 md:px-6 py-3 md:py-4 bg-white border border-slate-300 rounded-xl md:rounded-2xl outline-none transition-all text-sm font-semibold text-brand-950 shadow-sm focus:ring-2 focus:ring-accent-500/20"
                                    >
                                        <option value="" disabled>Select District</option>
                                        {[
                                            'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
                                            'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Kanyakumari', 'Karur',
                                            'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal',
                                            'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet',
                                            'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi',
                                            'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur',
                                            'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
                                        ].map(district => (
                                            <option key={district} value={district}>{district}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {registrationType === 'family' && (
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-base font-bold text-brand-900">Family Members ({familyMembers.length})</h4>
                                        <Button type="button" onClick={addFamilyMember} variant="outline" className="!py-2 !px-3 text-xs">
                                            <Plus size={14} className="mr-1" /> Add Family Member
                                        </Button>
                                    </div>

                                    {familyMembers.length === 0 && (
                                        <p className="text-xs text-slate-500">No members added yet. You can continue now or add members.</p>
                                    )}

                                    <div className="space-y-3 mt-3">
                                        {familyMembers.map((member, index) => (
                                            <div key={member.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                                <button
                                                    type="button"
                                                    onClick={() => updateFamilyMember(member.id, 'isExpanded', !member.isExpanded)}
                                                    className="w-full px-4 py-3 flex items-center justify-between text-left"
                                                >
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {index === 0 ? 'First Family Member' : `Additional Member ${index}`}
                                                    </span>
                                                    {member.isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                                {member.isExpanded && (
                                                    <div className="px-4 pb-4 border-t border-slate-100 space-y-3">
                                                        <div className="space-y-2 pt-3">
                                                            <label className="text-xs font-semibold text-slate-700">Photo (optional)</label>
                                                            <div className="relative">
                                                                <input type="file" accept="image/*" onChange={(e) => handleMemberPhotoUpload(member.id, e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                                <div className="h-20 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center gap-3 px-3">
                                                                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center text-slate-500">
                                                                        {member.photo ? <img src={member.photo} alt="member" className="w-full h-full object-cover" /> : <UploadCloud size={16} />}
                                                                    </div>
                                                                    <span className="text-xs text-slate-600">{member.photo ? 'Photo selected' : 'Tap to upload'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div className="space-y-1.5">
                                                                <label className="text-xs font-semibold text-slate-700">Name (optional)</label>
                                                                <input
                                                                    type="text"
                                                                    value={member.name}
                                                                    onChange={(e) => updateFamilyMember(member.id, 'name', e.target.value)}
                                                                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl outline-none text-sm text-brand-950 shadow-sm focus:ring-2 focus:ring-accent-500/20"
                                                                    placeholder="Enter member name"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-xs font-semibold text-slate-700">Relationship (optional)</label>
                                                                <select
                                                                    value={member.relationship}
                                                                    onChange={(e) => updateFamilyMember(member.id, 'relationship', e.target.value)}
                                                                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl outline-none text-sm text-brand-950 shadow-sm focus:ring-2 focus:ring-accent-500/20"
                                                                >
                                                                    {RELATIONSHIP_OPTIONS.map(option => (
                                                                        <option key={option} value={option}>{option}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFamilyMember(member.id)}
                                                            className="text-xs text-red-600 font-semibold inline-flex items-center gap-1 hover:text-red-700"
                                                        >
                                                            <Trash2 size={13} /> Remove member
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col items-center mt-5 md:mt-8"
                    >
                        <div className="w-full max-w-[380px]">
                            <div className="space-y-4">
                                {/* Primary Registration Button */}
                                <Button
                                    onClick={() => {
                                        if (onRegister) {
                                            // Validate all required fields (Email is now OPTIONAL, Password auto-set)
                                            if (!formData.name || !formData.emergency || !formData.location) {
                                                alert("Please fill in Name, Phone, and Location to register.");
                                                return;
                                            }
                                            if (registrationType === 'family' && !photo) {
                                                alert("Please upload Family Head photo to continue.");
                                                return;
                                            }
                                            // Set password to phone number if not provided
                                            const finalPassword = formData.emergency;

                                            // Validate phone number length
                                            if (formData.emergency.length !== 10) {
                                                alert("Phone number must be exactly 10 digits.");
                                                return;
                                            }

                                            // Validate email if provided
                                            if (formData.email && !formData.email.includes('@')) {
                                                alert("Please enter a valid email address containing '@'.");
                                                return;
                                            }

                                            onRegister({
                                                ...formData,
                                                registrationType,
                                                familyMembers,
                                                emergency: `+91${formData.emergency}`,
                                                phone: `+91${formData.emergency}`,
                                                password: finalPassword,
                                                uniqueId,
                                                photo
                                            });
                                        }
                                    }}
                                    variant="primary"
                                    fullWidth
                                    className="py-4 md:py-6 text-sm md:text-base bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] hover:from-[#1E40AF] hover:to-[#1D4ED8] shadow-xl shadow-blue-600/40 font-black tracking-widest hover:shadow-2xl transition-all border-0"
                                    disabled={isProcessing}
                                >
                                    <CheckCircle size={22} /> {registrationType === 'family' ? 'REGISTER FAMILY' : 'COMPLETE REGISTRATION'}
                                </Button>

                                {/* Info Box */}
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                                    <div className="flex items-start gap-3">
                                        <Lock className="text-blue-600 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <p className="text-xs font-bold text-blue-900 mb-1">Register First</p>
                                            <p className="text-[10px] text-blue-700 leading-relaxed">
                                                Complete registration to access your account dashboard where you can download your Entrust Card anytime.
                                            </p>
                                        </div>
                                    </div>
                                </div>


                                {currentUser?.status === 'Active' && (
                                    <>
                                        <Button
                                            onClick={handleDownloadPDF}
                                            disabled={isProcessing}
                                            variant="secondary"
                                            fullWidth
                                            className="flex items-center justify-center gap-2 border-2 border-brand-200 text-brand-700 hover:bg-brand-50"
                                        >
                                            <Download size={18} />
                                            {isProcessing ? 'Generating...' : 'Download HD Card PDF'}
                                        </Button>
                                        <p className="text-[10px] text-center text-green-600 font-bold mt-2">
                                            <CheckCircle size={10} className="inline mr-1" />
                                            Verified Member - Download Access Granted
                                        </p>
                                    </>
                                )}

                                {!currentUser && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                                        <p className="text-[10px] text-amber-700 font-medium">Please login to access download.</p>
                                    </div>
                                )}

                                {currentUser && currentUser.status !== 'Active' && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                                        <p className="text-[10px] text-amber-700 font-medium mb-1">Account Pending Verification</p>
                                        <p className="text-[9px] text-amber-600/80">Download will be enabled once your membership is approved.</p>
                                    </div>
                                )}


                            </div>

                            {/* Regenerate ID button removed as requested */}
                        </div>
                    </motion.div>
                </div >
            </div >
        </section >
    );
};
