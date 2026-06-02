import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Church, RefreshCw, User, X, Phone, Mail, MapPin, UploadCloud, CheckCircle, ArrowRight, Download, Sparkles, Youtube, FileText, Lock, Eye, EyeOff, Users, Plus, Trash2, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { Button } from './Button';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import menorahBack from '/entrust-card-flag.png';
import { ImageCropper } from './ImageCropper';

// Utility function to format date to DD-MM-YYYY
const formatDateToDDMMYYYY = (dateStr?: string): string => {
    if (!dateStr) return '';
    
    // Handle various date formats
    let date: Date;
    
    // If it's just a year (like "2024")
    if (/^\d{4}$/.test(dateStr.trim())) {
        date = new Date(parseInt(dateStr), 0, 1); // January 1st of that year
    }
    // If it's already in YYYY-MM-DD format
    else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        date = new Date(dateStr);
    }
    // If it's in DD/MM/YYYY or DD-MM-YYYY format
    else if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(dateStr)) {
        const parts = dateStr.split(/[\/\-]/);
        date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    // Try to parse as a regular date string
    else {
        date = new Date(dateStr);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        return dateStr; // Return original if can't parse
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
};

type RegistrationType = 'individual' | 'family';

interface FamilyCardMember {
    name: string;
    relationship: string;
    photo?: string;
}

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
    registrationType?: RegistrationType;
    familyMembers?: FamilyCardMember[];
    cardThemeTone?: 'blue' | 'purple' | 'green' | 'red' | 'gold';
    cardLayoutMode?: 'classic' | 'compact' | 'wide';
    cardShapeMode?: 'rounded' | 'soft' | 'sharp';
    cardSizeMode?: 'sm' | 'md' | 'lg';
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
    isStatic = false,
    registrationType = 'individual',
    familyMembers = [],
    cardThemeTone = 'blue',
    cardLayoutMode = 'classic',
    cardShapeMode = 'rounded',
    cardSizeMode = 'md'
}) => {
    const [isFlipped, setIsFlipped] = useState(isBackSide);
    const [showQrFullScreen, setShowQrFullScreen] = useState(false);
    const qrModalTitle = 'Scan Entrust QR';
    const innerThemeFilterMap = {
        blue: 'none',
        purple: 'hue-rotate(42deg) saturate(1.1)',
        green: 'hue-rotate(115deg) saturate(1.2)',
        red: 'hue-rotate(185deg) saturate(1.2)',
        gold: 'hue-rotate(-30deg) saturate(1.12) contrast(1.05)',
    };
    const innerScaleClassMap = {
        sm: 'scale-[0.9]',
        md: 'scale-100',
        lg: 'scale-[1.08]',
    };
    const innerLayoutClassMap = {
        classic: '',
        compact: 'scale-[0.95] origin-center',
        wide: 'scale-x-[1.06] origin-center',
    };
    const innerShapeClassMap = {
        rounded: 'rounded-[1.25rem]',
        soft: 'rounded-[2rem]',
        sharp: 'rounded-md',
    };

    const finalShapeClass = cardShapeMode ? innerShapeClassMap[cardShapeMode] : '';
    const finalScaleClass = cardSizeMode ? innerScaleClassMap[cardSizeMode] : '';
    const finalLayoutClass = cardLayoutMode ? innerLayoutClassMap[cardLayoutMode] : '';
    const cardTransformClass = `${finalShapeClass} ${finalScaleClass} ${finalLayoutClass}`;
    const cardFilterStyle = { filter: 'none' };
    const formatIndianPhoneForCard = (value?: string) => {
        const raw = `${value || ''}`.trim();
        const digits = raw.replace(/\D/g, '');
        const local = digits.startsWith('91') && digits.length >= 12
            ? digits.slice(2, 12)
            : (digits.length >= 10 ? digits.slice(-10) : '');
        if (local.length === 10) {
            return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
        }
        return raw || '—';
    };
    const formattedEmergency = formatIndianPhoneForCard(emergency);

    const renderStatusPill = (cardStatus?: string) => {
        const normalized = (cardStatus || '').toLowerCase().trim();
        if (normalized === 'active' || normalized === 'approved') {
            return (
                <div className="relative inline-flex h-5 items-center justify-center rounded-full bg-emerald-500/10 px-2 text-[6px] font-black uppercase tracking-wider text-emerald-600 border border-emerald-500/20 overflow-hidden group shadow-[0_0_8px_rgba(16,185,129,0.15)] shrink-0">
                    <span className="relative z-10 flex items-center gap-1"><ShieldCheck size={8} className="animate-pulse" /> Approved</span>
                    <div className="absolute inset-0 bg-emerald-400/20 w-0 group-hover:w-full transition-all duration-500 ease-out z-0" />
                </div>
            );
        } else if (normalized === 'rejected' || normalized === 'disapproved') {
            return (
                <div className="relative inline-flex h-5 items-center justify-center rounded-full bg-rose-500/10 px-2 text-[6px] font-black uppercase tracking-wider text-rose-600 border border-rose-500/20 overflow-hidden group shadow-[0_0_8px_rgba(225,29,72,0.15)] shrink-0">
                    <span className="relative z-10 flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-rose-500" /> Disapproved</span>
                    <div className="absolute inset-0 bg-rose-400/20 w-0 group-hover:w-full transition-all duration-500 ease-out z-0" />
                </div>
            );
        } else {
            return (
                <div className="relative inline-flex h-5 items-center justify-center rounded-full bg-amber-500/10 px-2 text-[6px] font-black uppercase tracking-wider text-amber-600 border border-amber-500/20 overflow-hidden group shadow-[0_0_8px_rgba(245,158,11,0.15)] shrink-0">
                    <span className="relative z-10 flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-amber-500 animate-ping" /> Pending</span>
                    <div className="absolute inset-0 bg-amber-400/20 w-0 group-hover:w-full transition-all duration-500 ease-out z-0" />
                </div>
            );
        }
    };

    useEffect(() => {
        if (isStatic) setIsFlipped(isBackSide);
    }, [isBackSide, isStatic]);

    const safePhotoSrc = (() => {
        const candidate = (photo || '').trim();
        if (!candidate) return null;
        if (/^data:image\/(?:png|jpe?g|webp|gif|bmp);base64,/i.test(candidate)) return candidate;
        if (/^https?:\/\//i.test(candidate)) {
            try {
                const parsed = new URL(candidate);
                const allowedHosts = new Set([
                    'firebasestorage.googleapis.com',
                    'lh3.googleusercontent.com',
                    'avatars.githubusercontent.com',
                    'user-attachments.githubusercontent.com',
                    'raw.githubusercontent.com',
                    'ui-avatars.com',
                ]);
                if (allowedHosts.has(parsed.hostname)) return parsed.toString();
            } catch {
                return null;
            }
        }
        return null;
    })();
    const fullDetails = `CITY OF TRUTH MINISTRIES\nID: ${uniqueId}\nName: ${name}\nLocation: ${location}\nPhone: ${formattedEmergency}\nJoined Date: ${formatDateToDDMMYYYY(memberSince)}`.trim();
    const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://city-of-truth-ministries.vercel.app';
    const verifyUrl = `${appOrigin}/verify/${uniqueId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(verifyUrl)}&bgcolor=ffffff&color=2c298c&margin=0&format=png&cb=${encodeURIComponent(uniqueId || 'COT-SAMPLE')}`;
    const sanitizedFamilyMembers = familyMembers.filter(member => member.name.trim());
    const memberCount = sanitizedFamilyMembers.length + 1;
    const memberNames = sanitizedFamilyMembers
        .map(member => member.name.trim().split(/\s+/)[0])
        .slice(0, 6);
    const familyBadge = `${memberCount} Members`;

    const IndividualFrontFace = () => {
        return (
            <div className="absolute inset-0 bg-white rounded-[inherit] overflow-hidden border border-gray-200 shadow-2xl flex flex-col" style={{ backfaceVisibility: 'hidden' }}>
                {/* Header */}
                <div className="bg-brand-900 text-white px-3 py-2 flex items-center justify-between shrink-0 relative z-20">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
                        <div>
                            <h2 className="font-bold text-[8px] uppercase tracking-wider leading-none text-white drop-shadow-lg">City of Truth Ministries</h2>
                            <p className="text-[6px] text-accent-200 font-bold mt-0.5 drop-shadow-sm">
                                <span className="font-black text-amber-300 drop-shadow-[0_0_4px_rgba(245,158,11,0.8)]">சத்திய நகரம் ஊழியங்கள்</span>{' '}
                                <span className="font-extrabold text-white bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">வால்பாறை</span>
                            </p>
                        </div>
                    </div>
                    <div className="bg-accent-50 px-4 py-1 rounded-full whitespace-nowrap min-w-0">
                        <p className="text-accent-700 font-bold text-[7px] uppercase tracking-wider">வழிப்பாட்டாளர் அடையாள அட்டை</p>
                    </div>
                </div>

                {/* Watermark Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none z-0">
                    <img src="/logo.png" alt="" className="w-48 h-48 object-contain transform rotate-12" />
                </div>

                {/* Main Content - Horizontal Layout */}
                <div className="flex-1 flex p-2 gap-1.5 relative z-10">
                    {/* Left: Photo */}
                    <div className="w-24 h-28 bg-slate-50 rounded-lg border-2 border-slate-100 flex items-center justify-center text-slate-300 overflow-hidden shadow-sm shrink-0">
                        {safePhotoSrc ? <img src={safePhotoSrc} alt="P" className="w-full h-full object-cover" /> : <User size={32} />}
                    </div>

                    {/* Right: Details */}
                    <div className="flex-1 flex flex-col justify-start min-w-0 space-y-1 pt-0.5">
                        <div className="flex items-center justify-between gap-2">
                            <div className="text-[9px] font-mono font-black text-brand-800 bg-brand-50 px-2 py-0.5 rounded border border-brand-100 inline-block shadow-sm">
                                ID: {uniqueId}
                            </div>
                        </div>

                        <div>
                            <label className="text-[6px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                            <p className="text-[11px] font-black text-brand-950 leading-tight truncate">{name || '—'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-0.5">
                            <div>
                                <label className="text-[6px] font-bold text-slate-400 uppercase block">Joined Date</label>
                                <p className="text-[9px] font-bold text-slate-700">{formatDateToDDMMYYYY(memberSince) || '—'}</p>
                            </div>
                            <div>
                                <label className="text-[6px] font-bold text-slate-400 uppercase block">Location</label>
                                <p className="text-[9px] font-semibold text-slate-700 truncate">{location || '—'}</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-[6px] font-bold text-slate-400 uppercase block">Phone Number</label>
                            <p className="text-[9px] font-semibold text-slate-700">{formattedEmergency}</p>
                        </div>
                    </div>

                    {/* QR Code Absolute Positioned */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowQrFullScreen(true);
                        }}
                        className="absolute bottom-2 right-2 bg-white p-0.5 border border-slate-100 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        aria-label="Open QR code"
                    >
                        <div className="relative inline-block w-14 h-14">
                            <img src={qrCodeUrl} alt="QR" className="w-full h-full block" crossOrigin="anonymous" />
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
                <div className="bg-brand-950 px-3 py-1 flex justify-between items-center border-t-2 border-accent-400 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                    <span className="text-[5px] font-bold tracking-wider text-accent-300 uppercase italic z-10 shrink-0">தூய மனதால் இணைவோம்; உயிர்மெய் அருள் ஒளியை பெறுவோம்</span>
                    <div className="text-[5px] text-slate-300 font-medium tracking-tight z-10 flex flex-col items-end leading-tight">
                        <span>+91 805625478</span>
                        <span>@COTMINISTRIES</span>
                    </div>
                </div>
            </div>
        );
    };

    const FamilyFrontFace = () => {
        return (
            <div className="absolute inset-0 bg-white rounded-[inherit] overflow-hidden border border-gray-200 shadow-2xl flex flex-col" style={{ backfaceVisibility: 'hidden' }}>
                <div className="bg-brand-900 text-white px-3 py-1.5 flex items-center justify-between shrink-0 relative z-20">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                        <div>
                            <h2 className="font-bold text-[7px] uppercase tracking-wider leading-none text-white drop-shadow-lg">City of Truth Ministries</h2>
                            <p className="text-[6px] text-accent-200 font-bold mt-0.5 drop-shadow-sm">
                                <span className="font-black text-amber-300 drop-shadow-[0_0_4px_rgba(245,158,11,0.8)]">சத்திய நகரம் ஊழியங்கள்</span>
                            </p>
                        </div>
                    </div>
                    <div className="bg-accent-50 px-2 py-1 rounded-full">
                        <p className="text-accent-700 font-bold text-[6px] uppercase tracking-wider whitespace-nowrap">Family Entrust Card</p>
                    </div>
                </div>

                <div className="bg-brand-50/90 py-1 text-center border-b border-brand-100">
                    <span className="text-[6px] font-bold text-brand-900 tracking-wider uppercase">We walk together in truth</span>
                </div>

                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/subtle-white-feathers.png')] opacity-20 pointer-events-none z-0"></div>

                <div className="flex-1 p-2 relative z-10 flex gap-1.5">
                    <div className="w-[40%] flex flex-col">
                        <div className="flex-1 min-h-0 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                            {safePhotoSrc ? <img src={safePhotoSrc} alt="Family Head" className="w-full h-full object-cover" /> : <User size={30} className="text-slate-300" />}
                        </div>
                        <div className="mt-1 bg-white/90 rounded-md border border-slate-200 px-1.5 py-1">
                            <p className="text-[5px] uppercase tracking-wider text-slate-500 font-bold">Family Head</p>
                            <p className="text-[8px] font-black text-brand-950 leading-tight truncate">{name || '—'}</p>
                        </div>
                    </div>

                    <div className="w-[60%] min-w-0 flex flex-col justify-between">
                        <div className="space-y-0.5">
                            <div className="grid grid-cols-2 gap-0.5">
                                <div className="bg-white/90 border border-slate-200 rounded-md px-1.5 py-1">
                                    <p className="text-[5px] uppercase tracking-wider text-slate-500 font-bold">Family ID</p>
                                    <p className="text-[7px] font-black text-brand-900 truncate">{uniqueId}</p>
                                </div>
                                <div className="bg-white/90 border border-slate-200 rounded-md px-1.5 py-1">
                                    <p className="text-[5px] uppercase tracking-wider text-slate-500 font-bold">District</p>
                                    <p className="text-[7px] font-bold text-slate-700 truncate">{location || '—'}</p>
                                </div>
                                <div className="bg-white/90 border border-slate-200 rounded-md px-1.5 py-1">
                                    <p className="text-[5px] uppercase tracking-wider text-slate-500 font-bold">Members</p>
                                    <p className="text-[7px] font-bold text-slate-700">{memberCount}</p>
                                </div>
                                <div className="bg-white/90 border border-slate-200 rounded-md px-1.5 py-1">
                                    <p className="text-[5px] uppercase tracking-wider text-slate-500 font-bold">Joined</p>
                                    <p className="text-[7px] font-bold text-slate-700">{formatDateToDDMMYYYY(memberSince) || '—'}</p>
                                </div>
                            </div>
                            <div className="bg-white/90 border border-slate-200 rounded-md px-2 py-1">
                                <p className="text-[5px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Family Members</p>
                                {memberNames.length > 0 ? (
                                    <div className="space-y-0.5">
                                        {memberNames.map((memberName, index) => (
                                            <p key={`${uniqueId}-${memberName}-${index}`} className="text-[7px] text-slate-700 font-semibold truncate">• {memberName}</p>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[7px] text-slate-500">No additional members</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-end justify-between gap-1.5">
                            <div className="flex flex-col gap-0.5 items-start">
                                <span className="text-[6px] font-bold text-brand-700 bg-brand-100 border border-brand-200 rounded-full px-2 py-0.5 whitespace-nowrap" aria-label={`${memberCount} family members`}>👨‍👩‍👧 {familyBadge}</span>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowQrFullScreen(true);
                                }}
                                className="bg-white p-0.5 border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                aria-label="Open QR code"
                            >
                                <div className="relative inline-block w-12 h-12">
                                    <img src={qrCodeUrl} alt="QR" className="w-full h-full block" />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="bg-white rounded-full flex items-center justify-center p-0.5 shadow-sm" style={{ width: '14px', height: '14px' }}>
                                            <img src="/logo.png" alt="COT" className="w-full h-full object-contain rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const FrontFace = () => (registrationType === 'family' ? <FamilyFrontFace /> : <IndividualFrontFace />);

    const BackFace = () => {
        return (
            <div
                className="absolute inset-0 rounded-[inherit] overflow-hidden border border-brand-900 shadow-2xl"
                style={{ backfaceVisibility: 'hidden', transform: isStatic ? 'none' : 'rotateY(180deg)' }}
            >
                {registrationType === 'family' ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-white p-3 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-[8px] font-black uppercase tracking-widest">Family Members</h3>
                            <span className="text-[6px] bg-white/15 border border-white/20 rounded-full px-2 py-0.5">{memberCount} Total</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 flex-1">
                            {sanitizedFamilyMembers.slice(0, 4).map((member, index) => (
                                <div key={index} className="bg-white/10 border border-white/20 rounded-lg p-1.5 backdrop-blur-sm">
                                    <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 overflow-hidden flex items-center justify-center text-white/70 mb-1">
                                        {member.photo?.trim().startsWith('data:image/') ? <img src={member.photo} alt={member.name || 'member'} className="w-full h-full object-cover" /> : <User size={14} />}
                                    </div>
                                    <p className="text-[7px] font-bold truncate">{member.name || 'Member'}</p>
                                    <p className="text-[6px] text-white/75 truncate">{member.relationship || 'None'}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-1.5 pt-1.5 border-t border-white/20 flex items-end justify-between gap-1.5">
                            <div className="min-w-0">
                                <p className="text-[6px] uppercase tracking-widest text-accent-200 font-bold">Vision</p>
                                <p className="text-[6px] text-white/90 leading-tight">Households rooted in truth and grace.</p>
                                <p className="text-[5px] text-white/70 mt-0.5">Support: +91 805625478</p>
                            </div>
                            <img src={qrCodeUrl} alt="Family QR" className="w-12 h-12 bg-white p-1 rounded-md border border-white/20 shrink-0" />
                        </div>
                    </div>
                ) : (
                    <>
                        <img
                            src={menorahBack}
                            alt="Entrust Card Back"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </>
                )}
            </div>
        );
    };

    if (isStatic) {
        return (
            <>
                <div 
                    className={`relative w-[340px] h-[215px] bg-slate-100 overflow-hidden ${cardTransformClass}`} 
                    style={cardFilterStyle}
                >
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
                                <img src={qrCodeUrl} alt="Entrust QR Code" className="w-full max-w-[320px] mx-auto rounded-2xl border border-slate-200" crossOrigin="anonymous" />
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
                            <div 
                                style={{ width: '340px', height: '215px', ...cardFilterStyle }}
                                className={`overflow-hidden ${cardTransformClass}`}
                            >
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
                            <img src={qrCodeUrl} alt="Entrust QR Code" className="w-full max-w-[320px] mx-auto rounded-2xl border border-slate-200" crossOrigin="anonymous" />
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

interface FamilyMemberForm {
    id: string;
    name: string;
    relationship: string;
    photo?: string;
    isExpanded: boolean;
}

const RELATIONSHIP_OPTIONS = [
    'None',
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
    const [panelTab, setPanelTab] = useState<'register' | 'customize'>('register');
    const [cardThemeTone, setCardThemeTone] = useState<'blue' | 'purple' | 'green' | 'red' | 'gold'>('blue');
    const [cardLayoutMode, setCardLayoutMode] = useState<'classic' | 'compact' | 'wide'>('classic');
    const [cardShapeMode, setCardShapeMode] = useState<'rounded' | 'soft' | 'sharp'>('rounded');
    const [cardSizeMode, setCardSizeMode] = useState<'sm' | 'md' | 'lg'>('md');
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
    const [cropTarget, setCropTarget] = useState<{ type: 'primary' | 'family'; memberId?: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showEntrustIntro, setShowEntrustIntro] = useState(false);
    const [entrustTourStepIndex, setEntrustTourStepIndex] = useState<number | null>(null);
    const [entrustTourRect, setEntrustTourRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
    const ENTRUST_TOUR_STEPS = [
        { selector: '#entrust-name-field', title: 'Enter Full Name', text: 'Start by entering your name exactly as you want it on the Entrust card.' },
        { selector: '#entrust-phone-field', title: 'Enter WhatsApp Number', text: 'Use a valid 10-digit number to receive updates and login access.' },
        { selector: '#entrust-location-field', title: 'Choose District', text: 'Select your district from Tamil Nadu for registration records.' },
        { selector: '#entrust-register-btn', title: 'Complete Registration', text: 'Tap register to submit details and get your member ID.' },
    ];
    const secureRandomInt = (min: number, max: number) => {
        const range = max - min + 1;
        const values = new Uint32Array(1);
        window.crypto.getRandomValues(values);
        return min + (values[0] % range);
    };

    useEffect(() => {
        setUniqueId(`TEMP-${Date.now()}-${secureRandomInt(100, 999)}`);
    }, []);

    useEffect(() => {
        if (currentUser) return;
        const seen = localStorage.getItem('cot_entrust_tour_seen') === '1';
        if (!seen) setShowEntrustIntro(true);
    }, [currentUser]);

    useEffect(() => {
        if (entrustTourStepIndex === null) return;
        const step = ENTRUST_TOUR_STEPS[entrustTourStepIndex];
        const target = document.querySelector(step.selector) as HTMLElement | null;
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [entrustTourStepIndex]);

    useEffect(() => {
        if (entrustTourStepIndex === null) return;
        const updateRect = () => {
            const step = ENTRUST_TOUR_STEPS[entrustTourStepIndex];
            const target = document.querySelector(step.selector) as HTMLElement | null;
            if (!target) {
                setEntrustTourRect(null);
                return;
            }
            const rect = target.getBoundingClientRect();
            setEntrustTourRect({ top: rect.top - 8, left: rect.left - 8, width: rect.width + 16, height: rect.height + 16 });
        };
        const timer = setTimeout(updateRect, 220);
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect, true);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect, true);
        };
    }, [entrustTourStepIndex]);

    const markEntrustTourSeen = () => localStorage.setItem('cot_entrust_tour_seen', '1');
    const startEntrustTour = () => {
        markEntrustTourSeen();
        setShowEntrustIntro(false);
        setEntrustTourStepIndex(0);
    };
    const skipEntrustTour = () => {
        markEntrustTourSeen();
        setShowEntrustIntro(false);
        setEntrustTourStepIndex(null);
        setEntrustTourRect(null);
    };

    const cardThemeFilterMap: Record<typeof cardThemeTone, string> = {
        blue: 'none',
        purple: 'hue-rotate(42deg) saturate(1.1)',
        green: 'hue-rotate(115deg) saturate(1.2)',
        red: 'hue-rotate(185deg) saturate(1.2)',
        gold: 'hue-rotate(-30deg) saturate(1.12) contrast(1.05)',
    };
    const cardScaleClassMap: Record<typeof cardSizeMode, string> = {
        sm: 'scale-[0.9]',
        md: 'scale-100',
        lg: 'scale-[1.08]',
    };
    const cardLayoutClassMap: Record<typeof cardLayoutMode, string> = {
        classic: '',
        compact: 'scale-[0.95] origin-center',
        wide: 'scale-x-[1.06] origin-center',
    };
    const cardShapeClassMap: Record<typeof cardShapeMode, string> = {
        rounded: 'rounded-[1.25rem]',
        soft: 'rounded-[2rem]',
        sharp: 'rounded-md',
    };
    const previewWrapClass = `${cardShapeClassMap[cardShapeMode]} ${cardScaleClassMap[cardSizeMode]} ${cardLayoutClassMap[cardLayoutMode]}`;

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
                setCropTarget({ type: 'primary' });
                // Open cropper immediately
                setCroppingImage(reader.result as string);
                // Reset input
                e.target.value = '';
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedImg: string) => {
        if (cropTarget?.type === 'family' && cropTarget.memberId) {
            updateFamilyMember(cropTarget.memberId, 'photo', croppedImg);
            setCroppingImage(null);
            setCropTarget(null);
            return;
        }
        setPreviewPhoto(croppedImg);
        setCroppingImage(null);
        setCropTarget(null);
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
        id: `FM-${Date.now()}-${secureRandomInt(100, 999)}`,
        name: '',
        relationship: 'None',
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
            setCropTarget({ type: 'family', memberId });
            setCroppingImage(typeof reader.result === 'string' ? reader.result : '');
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
                    backgroundColor: '#ffffff',
                    width: 340,
                    height: 215
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
                const waitForNodeImages = async (node: HTMLElement) => {
                    const images = Array.from(node.querySelectorAll('img')) as HTMLImageElement[];
                    await Promise.all(images.map((img) => (
                        img.complete && img.naturalWidth > 0
                            ? Promise.resolve()
                            : new Promise<void>((resolve) => {
                                const done = () => resolve();
                                img.addEventListener('load', done, { once: true });
                                img.addEventListener('error', done, { once: true });
                                setTimeout(done, 3000);
                            })
                    )));
                };

                await Promise.all([waitForNodeImages(frontNode), waitForNodeImages(backNode)]);
                await new Promise(resolve => setTimeout(resolve, 300));

                const captureOptions = { pixelRatio: 4, quality: 1, backgroundColor: '#ffffff', cacheBust: true, width: 340, height: 215 };
                const frontDataUrl = await toPng(frontNode, captureOptions);
                const backDataUrl = await toPng(backNode, captureOptions);

                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4',
                    compress: true
                });

                const addCenteredCardPage = (dataUrl: string, format: 'PNG' | 'JPEG', isFirstPage: boolean) => {
                    if (!isFirstPage) {
                        pdf.addPage('a4', 'landscape');
                    }
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const pageHeight = pdf.internal.pageSize.getHeight();
                    const img = pdf.getImageProperties(dataUrl);
                    const margin = 8;
                    const maxWidth = pageWidth - (margin * 2);
                    const maxHeight = pageHeight - (margin * 2);
                    const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
                    const renderWidth = img.width * scale;
                    const renderHeight = img.height * scale;
                    const x = (pageWidth - renderWidth) / 2;
                    const y = (pageHeight - renderHeight) / 2;
                    pdf.addImage(dataUrl, format, x, y, renderWidth, renderHeight, undefined, 'FAST');
                };

                addCenteredCardPage(frontDataUrl, 'PNG', true);
                addCenteredCardPage(backDataUrl, 'PNG', false);

                pdf.save(`ENTRUST-CARD-HD-FULL-${uniqueId}.pdf`);

                if (onRegister) {
                    onRegister({ ...formData, uniqueId, photo, cardThemeTone, cardLayoutMode, cardShapeMode, cardSizeMode });
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
                    onCancel={() => {
                        setCroppingImage(null);
                        setCropTarget(null);
                    }}
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
                                <EntrustCard3D
                                    {...formData}
                                    uniqueId={uniqueId}
                                    photo={previewPhoto}
                                    status="Pending"
                                    registrationType={registrationType}
                                    familyMembers={familyMembers}
                                    isStatic={true}
                                    isBackSide={false}
                                    cardThemeTone={cardThemeTone}
                                    cardLayoutMode={cardLayoutMode}
                                    cardShapeMode={cardShapeMode}
                                    cardSizeMode={cardSizeMode}
                                />
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
                <div id="capture-front" className="bg-white inline-block w-[340px] h-[215px] overflow-hidden rounded-xl">
                    <EntrustCard3D {...formData} uniqueId={uniqueId} photo={photo} status="Pending" registrationType={registrationType} familyMembers={familyMembers} isStatic={true} isBackSide={false} cardThemeTone={cardThemeTone} cardLayoutMode={cardLayoutMode} cardShapeMode={cardShapeMode} cardSizeMode={cardSizeMode} />
                </div>
                <div id="capture-back" className="bg-white inline-block w-[340px] h-[215px] overflow-hidden rounded-xl">
                    <EntrustCard3D {...formData} uniqueId={uniqueId} photo={photo} status="Pending" registrationType={registrationType} familyMembers={familyMembers} isStatic={true} isBackSide={true} cardThemeTone={cardThemeTone} cardLayoutMode={cardLayoutMode} cardShapeMode={cardShapeMode} cardSizeMode={cardSizeMode} />
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
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-4 sm:p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl border border-slate-100 mb-4 md:mb-6"
                    >
                        <div className="grid grid-cols-2 bg-slate-100 rounded-2xl p-1 mb-4">
                            <button
                                type="button"
                                onClick={() => setPanelTab('register')}
                                className={`py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${panelTab === 'register' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'}`}
                            >
                                Register
                            </button>
                            <button
                                type="button"
                                onClick={() => setPanelTab('customize')}
                                className={`py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${panelTab === 'customize' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'}`}
                            >
                                Customize Card
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 pb-4 pt-2">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Front Side</span>
                                <div>
                                    <EntrustCard3D
                                        {...formData}
                                        uniqueId={uniqueId}
                                        photo={photo}
                                        status="Pending"
                                        registrationType={registrationType}
                                        familyMembers={familyMembers}
                                        isStatic={true}
                                        isBackSide={false}
                                        cardThemeTone={cardThemeTone}
                                        cardLayoutMode={cardLayoutMode}
                                        cardShapeMode={cardShapeMode}
                                        cardSizeMode={cardSizeMode}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Back Side</span>
                                <div>
                                    <EntrustCard3D
                                        {...formData}
                                        uniqueId={uniqueId}
                                        photo={photo}
                                        status="Pending"
                                        registrationType={registrationType}
                                        familyMembers={familyMembers}
                                        isStatic={true}
                                        isBackSide={true}
                                        cardThemeTone={cardThemeTone}
                                        cardLayoutMode={cardLayoutMode}
                                        cardShapeMode={cardShapeMode}
                                        cardSizeMode={cardSizeMode}
                                    />
                                </div>
                            </div>
                        </div>

                        {panelTab === 'customize' && (
                            <div className="space-y-4 border-t border-slate-100 pt-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 block mb-2">Layout</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(['classic', 'compact', 'wide'] as const).map((mode) => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => setCardLayoutMode(mode)}
                                                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold capitalize border ${cardLayoutMode === mode ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200'}`}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 block mb-2">Shape</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(['rounded', 'soft', 'sharp'] as const).map((mode) => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => setCardShapeMode(mode)}
                                                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold capitalize border ${cardShapeMode === mode ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200'}`}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 block mb-2">Size</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(['sm', 'md', 'lg'] as const).map((mode) => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => setCardSizeMode(mode)}
                                                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase border ${cardSizeMode === mode ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200'}`}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>

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
                                    <input id="entrust-name-field" required name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full px-4 md:px-6 py-3 md:py-4 bg-white border border-slate-300 rounded-xl md:rounded-2xl outline-none transition-all text-sm font-semibold text-brand-950 placeholder:text-slate-500 shadow-sm focus:ring-2 focus:ring-accent-500/20" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700 ml-1">WhatsApp Number</label>
                                    <div className="flex items-center w-full bg-white border border-slate-300 rounded-xl md:rounded-2xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-accent-500/20">
                                        <span className="px-3 py-3 md:py-4 text-sm font-bold text-slate-700 bg-slate-100 border-r border-slate-200 shrink-0">+91</span>
                                        <input id="entrust-phone-field" name="emergency" value={formData.emergency} onChange={handleInputChange} type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} placeholder="10-digit number" className="flex-1 px-3 md:px-4 py-3 md:py-4 bg-transparent outline-none text-sm font-semibold text-brand-950 placeholder:text-slate-500" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700 ml-1">Email Address</label>
                                    <input name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full px-4 md:px-6 py-3 md:py-4 bg-white border border-slate-300 rounded-xl md:rounded-2xl outline-none transition-all text-sm font-semibold text-brand-950 placeholder:text-slate-500 shadow-sm focus:ring-2 focus:ring-accent-500/20" placeholder="Enter your email (optional)" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700 ml-1">Tamil Nadu District</label>
                                    <select
                                        id="entrust-location-field"
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
                                                                    <span className="text-xs text-slate-600">{member.photo ? 'Photo cropped and ready' : 'Tap to upload & crop'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div className="space-y-1.5">
                                                                <label className="text-xs font-semibold text-slate-700">Name</label>
                                                                <input
                                                                    type="text"
                                                                    value={member.name}
                                                                    onChange={(e) => updateFamilyMember(member.id, 'name', e.target.value)}
                                                                    required
                                                                    aria-required="true"
                                                                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl outline-none text-sm text-brand-950 shadow-sm focus:ring-2 focus:ring-accent-500/20"
                                                                    placeholder="Enter member name"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-xs font-semibold text-slate-700">Relationship</label>
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
                                    id="entrust-register-btn"
                                    onClick={() => {
                                        if (onRegister) {
                                            const trimmedName = formData.name?.trim() || '';
                                            const trimmedEmergency = formData.emergency?.trim() || '';
                                            const trimmedLocation = formData.location?.trim() || '';
                                            // Validate all required fields (Email is now OPTIONAL, Password auto-set)
                                            if (!trimmedName || !trimmedEmergency || !trimmedLocation) {
                                                alert("Please fill in Name, Phone, and Location to register.");
                                                return;
                                            }
                                            if (registrationType === 'family' && !photo) {
                                                alert("Please upload Family Head photo to continue.");
                                                return;
                                            }
                                            if (registrationType === 'family') {
                                                const invalidMember = familyMembers.find(member => !member.name.trim() || member.relationship === 'None');
                                                if (invalidMember) {
                                                    alert("Please fill family member Name and Relationship.");
                                                    return;
                                                }
                                            }
                                            // Set password to phone number if not provided
                                            const finalPassword = trimmedEmergency;

                                            // Validate phone number length
                                            if (trimmedEmergency.length !== 10) {
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
                                                name: trimmedName,
                                                registrationType,
                                                familyMembers,
                                                emergency: `+91${trimmedEmergency}`,
                                                location: trimmedLocation,
                                                phone: `+91${trimmedEmergency}`,
                                                password: finalPassword,
                                                uniqueId,
                                                photo,
                                                cardThemeTone,
                                                cardLayoutMode,
                                                cardShapeMode,
                                                cardSizeMode
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
                <AnimatePresence>
                    {showEntrustIntro && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[170] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
                            <motion.div initial={{ y: 20, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 12, opacity: 0 }} className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
                                <div className="text-[11px] font-black uppercase tracking-widest text-brand-500 mb-2">Entrust Tour</div>
                                <h3 className="text-xl font-bold text-brand-950 mb-2">Quick Introduction</h3>
                                <p className="text-sm text-slate-600 mb-5">We will highlight each required field one by one. You can skip anytime.</p>
                                <div className="flex items-center justify-end gap-2">
                                    <button onClick={skipEntrustTour} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">Skip</button>
                                    <button onClick={startEntrustTour} className="px-4 py-2 rounded-xl text-sm font-bold bg-brand-600 text-white hover:bg-brand-700">Take Tour</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {entrustTourStepIndex !== null && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[175] pointer-events-none">
                            <div className="absolute inset-0 bg-black/65" />
                            {entrustTourRect && (
                                <div className="absolute rounded-2xl border-2 border-amber-300 shadow-[0_0_0_9999px_rgba(2,6,23,0.72)]" style={{ top: entrustTourRect.top, left: entrustTourRect.left, width: entrustTourRect.width, height: entrustTourRect.height }} />
                            )}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-5 w-[calc(100%-1.5rem)] max-w-md bg-white rounded-3xl p-5 shadow-2xl pointer-events-auto">
                                <div className="text-[11px] uppercase tracking-widest font-black text-brand-500 mb-2">Step {entrustTourStepIndex + 1} of {ENTRUST_TOUR_STEPS.length}</div>
                                <h4 className="text-lg font-bold text-brand-950 mb-1">{ENTRUST_TOUR_STEPS[entrustTourStepIndex]?.title}</h4>
                                <p className="text-sm text-slate-600 mb-4">{ENTRUST_TOUR_STEPS[entrustTourStepIndex]?.text}</p>
                                <div className="flex items-center justify-between gap-2">
                                    <button onClick={skipEntrustTour} className="px-4 py-2 text-sm font-bold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">Skip Tour</button>
                                    <button
                                        onClick={() => {
                                            const isLastStep = entrustTourStepIndex >= ENTRUST_TOUR_STEPS.length - 1;
                                            if (isLastStep) {
                                                setEntrustTourStepIndex(null);
                                                setEntrustTourRect(null);
                                            } else {
                                                setEntrustTourStepIndex(entrustTourStepIndex + 1);
                                            }
                                        }}
                                        className="px-4 py-2 text-sm font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                                    >
                                        {entrustTourStepIndex >= ENTRUST_TOUR_STEPS.length - 1 ? 'Done' : 'Next'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div >
        </section >
    );
};
