import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Church, RefreshCw, User, X, Phone, Mail, MapPin, UploadCloud, CheckCircle, ArrowRight, Download, Sparkles, Youtube, FileText } from 'lucide-react';
import { Button } from './Button';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface EntrustCardProps {
    name?: string;
    email?: string;
    dob?: string;
    location?: string;
    bloodGroup?: string;
    emergency?: string;
    memberSince?: string;
    role?: string;
    uniqueId?: string;
    photo?: string;
    gender?: string;
    className?: string;
    isBackSide?: boolean;
    isStatic?: boolean;
}

export const EntrustCard3D: React.FC<EntrustCardProps> = ({
    name = "John Doe",
    email = "john@example.com",
    dob = "01/01/1990",
    location = "Valparai",
    bloodGroup = "O+ve",
    emergency = "+91 80561 25478",
    memberSince = "2024",
    role = "Member",
    uniqueId = "COT-SAMPLE",
    gender = "Male",
    photo,
    className = "",
    isBackSide = false,
    isStatic = false
}) => {
    const [isFlipped, setIsFlipped] = useState(isBackSide);

    useEffect(() => {
        if (isStatic) setIsFlipped(isBackSide);
    }, [isBackSide, isStatic]);

    const fullDetails = `CITY OF TRUTH MINISTRIES\nID: ${uniqueId}\nName: ${name}\nRole: ${role}`.trim();
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullDetails)}&bgcolor=ffffff&color=2c298c&margin=2`;

    const FrontFace = () => (
        <div className="absolute inset-0 bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-2xl flex flex-col" style={{ backfaceVisibility: 'hidden' }}>
            <div className="bg-brand-900 text-white p-4 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent-400/20 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-2 relative z-10">
                    <img src="/brand-logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                    <div>
                        <h2 className="font-bold text-[10px] uppercase tracking-wider">City of Truth Ministries</h2>
                        <p className="text-[8px] text-accent-200 font-medium mt-0.5 whitespace-nowrap">சத்திய நகரம் ஊழியங்கள்</p>
                    </div>
                </div>
            </div>

            <div className="bg-accent-50 py-1.5 text-center border-b border-accent-100 shrink-0">
                <p className="text-accent-700 font-bold text-[10px] uppercase tracking-widest">ENTRUST CARD</p>
            </div>

            <div className="p-6 flex-1 flex flex-col relative">
                <div className="flex justify-between items-start mb-6">
                    <div className="text-[10px] font-mono font-bold text-brand-800 bg-brand-50 px-2 py-1 rounded border border-brand-100">
                        ID: {uniqueId}
                    </div>
                    <div className="w-20 h-24 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center text-slate-300 overflow-hidden shadow-inner">
                        {photo ? <img src={photo} alt="P" className="w-full h-full object-cover" /> : <User size={40} />}
                    </div>
                </div>

                <div className="space-y-4 flex-1">
                    <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Full Member Name</label>
                        <p className="text-sm font-bold text-brand-900 uppercase leading-tight">{name || '—'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Birth Date</label>
                            <p className="text-xs font-semibold text-slate-700">{dob || '—'}</p>
                        </div>
                        <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Blood Group</label>
                            <p className="text-xs font-semibold text-slate-700">{bloodGroup || '—'}</p>
                        </div>
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Location</label>
                        <p className="text-xs font-semibold text-slate-700">{location || '—'}</p>
                    </div>
                </div>

                <div className="mt-auto flex justify-between items-end pt-4 border-t border-slate-50">
                    <p className="text-[9px] text-slate-400 italic font-serif leading-tight">"Faith • Truth • Love"</p>
                    <div className="bg-white p-1 border border-slate-100 rounded-md">
                        <img src={qrCodeUrl} alt="QR" className="w-14 h-14" />
                    </div>
                </div>
            </div>

            <div className="bg-brand-950 p-2 text-center border-t-2 border-accent-400">
                <span className="text-[8px] font-bold tracking-widest text-accent-300 uppercase italic">Walking in Divine Light</span>
            </div>
        </div>
    );

    const BackFace = () => (
        <div
            className="absolute inset-0 bg-gradient-to-br from-brand-900 to-indigo-950 rounded-2xl overflow-hidden border border-brand-900 shadow-2xl flex flex-col p-8 text-center"
            style={{ backfaceVisibility: 'hidden', transform: isStatic ? 'none' : 'rotateY(180deg)' }}
        >
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
                <img src="/brand-logo.png" alt="Logo" className="w-16 h-16 object-contain mb-4 drop-shadow-2xl" />
                <h3 className="text-base font-serif font-bold text-white mb-2">Ministry Covenant</h3>
                <p className="text-indigo-100 text-sm italic font-serif leading-relaxed mb-8 px-2">
                    "But my servant Moses is not so; he is faithful in all mine house. With him will I speak mouth to mouth."
                    <span className="block mt-2 text-accent-400 font-sans font-bold not-italic text-[10px] tracking-widest uppercase">- Numbers 12:7-8</span>
                </p>
                <div className="w-full text-left space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3 text-indigo-100 text-[10px]">
                        <Phone size={14} className="text-accent-400" /> <span>+91 80561 25478</span>
                    </div>
                    <div className="flex items-center gap-3 text-indigo-100 text-[10px] shrink-0">
                        <Mail size={14} className="text-accent-400" /> <span className="truncate">faithfulfellowship8@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-indigo-100 text-[10px] shrink-0 pt-1">
                        <Youtube size={14} className="text-red-400" /> <span className="truncate">@cotministries</span>
                    </div>
                </div>
            </div>
            <p className="relative z-10 text-[9px] text-indigo-400 mt-4">Authorized for spiritual community access only.</p>
        </div>
    );

    if (isStatic) {
        return (
            <div className={`relative w-[320px] h-[480px] bg-slate-100 rounded-2xl`}>
                {isBackSide ? <BackFace /> : <FrontFace />}
            </div>
        );
    }

    return (
        <div
            className={`relative w-full max-w-[320px] h-[480px] cursor-pointer mx-auto ${className}`}
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ perspective: "1000px" }}
        >
            <motion.div
                className="w-full h-full relative"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
            >
                <FrontFace />
                <BackFace />
            </motion.div>
        </div>
    );
};

interface WorshipperIDCardProps {
    onRegister?: (data: any) => void;
}

export const WorshipperIDCard: React.FC<WorshipperIDCardProps> = ({ onRegister }) => {
    const [uniqueId, setUniqueId] = useState('');
    const [formData, setFormData] = useState({
        name: 'S. Shaveesh Jeshurun',
        email: 'shaveesh@example.com',
        dob: '1995-08-20',
        location: 'Valparai',
        bloodGroup: 'O+ve',
        emergency: '9876543210',
        memberSince: '2015',
        gender: 'Male',
        role: 'Media Team'
    });
    const [photo, setPhoto] = useState<string | undefined>(undefined);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        setUniqueId(`COT-${Math.floor(1000 + Math.random() * 9000)}`);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDownload = async () => {
        setIsProcessing(true);
        const frontNode = document.getElementById('capture-front');
        if (frontNode) {
            try {
                const dataUrl = await toPng(frontNode, { cacheBust: true, pixelRatio: 2 });
                const link = document.createElement('a');
                link.download = `ENTRUST-FRONT-${uniqueId}.png`;
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
                const frontDataUrl = await toPng(frontNode, { cacheBust: true, pixelRatio: 2 });
                const backDataUrl = await toPng(backNode, { cacheBust: true, pixelRatio: 2 });

                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                // Page 1: Front
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (480 * pdfWidth) / 320;
                const yPos = (pdf.internal.pageSize.getHeight() - pdfHeight) / 2;
                pdf.addImage(frontDataUrl, 'PNG', 0, yPos > 0 ? yPos : 0, pdfWidth, pdfHeight);

                // Page 2: Back
                pdf.addPage();
                pdf.addImage(backDataUrl, 'PNG', 0, yPos > 0 ? yPos : 0, pdfWidth, pdfHeight);

                pdf.save(`ENTRUST-CARD-FULL-${uniqueId}.pdf`);

                if (onRegister) {
                    onRegister({ ...formData, uniqueId, photo });
                }
            } catch (err) {
                console.error('PDF generation failed', err);
                alert("Failed to create PDF. Please try again.");
            }
        }
        setIsProcessing(false);
    };

    return (
        <section className="min-h-screen pt-24 md:pt-48 pb-32 bg-slate-50 relative overflow-hidden">
            {/* HIDDEN CAPTURE AREA */}
            <div className="fixed left-[-9999px] top-0 pointer-events-none">
                <div id="capture-front" className="bg-white">
                    <EntrustCard3D {...formData} uniqueId={uniqueId} photo={photo} isStatic={true} isBackSide={false} />
                </div>
                <div id="capture-back" className="bg-white">
                    <EntrustCard3D {...formData} uniqueId={uniqueId} photo={photo} isStatic={true} isBackSide={true} />
                </div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-950 mb-6 tracking-tight">Generate Your ID</h1>
                    <p className="text-xl text-gray-500 font-normal">Complete your profile to generate your official digital City of Truth Entrust Card.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
                    {/* Form Left */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
                    >
                        <h3 className="text-2xl font-bold text-brand-950 mb-10 flex items-center gap-4 font-serif relative z-10 underline decoration-accent-500 underline-offset-8">
                            Personal Information
                        </h3>

                        <div className="space-y-8 relative z-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Member Photo</label>
                                <div className="relative group">
                                    <input type="file" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer z-20" accept="image/*" />
                                    <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 transition-all group-hover:border-accent-400 group-hover:bg-accent-50/20 bg-slate-50/50 flex items-center gap-6">
                                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 overflow-hidden shrink-0">
                                            {photo ? <img src={photo} className="w-full h-full object-cover" /> : <UploadCloud size={30} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-700">{photo ? "Photo Selected" : "Click to select photo"}</p>
                                            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Visible on your ID</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                    <input name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none transition-all text-sm font-bold text-brand-950 focus:ring-2 focus:ring-accent-500/20" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                    <input name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none transition-all text-sm font-bold text-brand-950 focus:ring-2 focus:ring-accent-500/20" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">WhatsApp Number</label>
                                    <input name="emergency" value={formData.emergency} onChange={handleInputChange} type="tel" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none transition-all text-sm font-bold text-brand-950 focus:ring-2 focus:ring-accent-500/20" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Date of Birth</label>
                                    <input name="dob" value={formData.dob} onChange={handleInputChange} type="date" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none transition-all text-sm font-bold text-brand-950 focus:ring-2 focus:ring-accent-500/20" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Location</label>
                                    <input name="location" value={formData.location} onChange={handleInputChange} type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none transition-all text-sm font-bold text-brand-950 focus:ring-2 focus:ring-accent-500/20" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Blood Group</label>
                                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none transition-all text-sm font-bold text-brand-950 focus:ring-2 focus:ring-accent-500/20">
                                        {['O+ve', 'O-ve', 'A+ve', 'A-ve', 'B+ve', 'B-ve', 'AB+ve', 'AB-ve'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none transition-all text-sm font-bold text-brand-950 focus:ring-2 focus:ring-accent-500/20">
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Role / Ministry</label>
                                    <input name="role" value={formData.role} onChange={handleInputChange} type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none transition-all text-sm font-bold text-brand-950 focus:ring-2 focus:ring-accent-500/20" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Preview Right */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col items-center lg:sticky lg:top-40"
                    >
                        <div className="w-full max-w-[320px]">
                            <EntrustCard3D {...formData} uniqueId={uniqueId} photo={photo} className="mb-10" />

                            <div className="space-y-4">
                                <Button
                                    onClick={handleDownloadPDF}
                                    variant="primary"
                                    fullWidth
                                    className="py-5 text-sm bg-accent-600 shadow-xl shadow-accent-600/30 font-black tracking-widest"
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? "PROCESSING..." : <><FileText size={20} /> DOWNLOAD 2-PAGE PDF</>}
                                </Button>

                                <Button
                                    onClick={handleDownload}
                                    variant="secondary"
                                    fullWidth
                                    className="py-4 text-xs font-bold bg-white border-2 border-slate-200 text-slate-600"
                                    disabled={isProcessing}
                                >
                                    <Download size={18} /> DOWNLOAD FRONT (PNG)
                                </Button>

                                <Button
                                    onClick={() => setUniqueId(`COT-${Math.floor(1000 + Math.random() * 9000)}`)}
                                    variant="ghost"
                                    fullWidth
                                    className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={14} /> Regenerate ID Number
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};