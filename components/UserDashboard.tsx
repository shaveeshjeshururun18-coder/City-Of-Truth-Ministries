import React, { useState } from 'react';
import { User } from '../types';
import { EntrustCard3D } from './WorshipperIDCard';
import { Download, Edit2, AlertCircle, CheckCircle, Save, X, FileText, QrCode, LogOut, UploadCloud, Camera, Calendar, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { motion } from 'framer-motion';
import { TestimonialModal } from './TestimonialModal';
import { MessageSquare } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { ImageCropper } from './ImageCropper';
import { PrintableHebrewCalendar } from './PrintableHebrewCalendar';
import { PrintableReferenceGuide } from './PrintableReferenceGuide';
import { getCalendarData5786, HebrewMonth } from './CalendarLogic';
import { CalendarCustomizationModal, CalendarOptions } from './CalendarCustomizationModal';

interface UserDashboardProps {
    user: User;
    onEdit: () => void;
    onUpdate: (updatedUser: User) => void;
    onLogout: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, onUpdate, onLogout }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showTestimonialModal, setShowTestimonialModal] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [croppingImage, setCroppingImage] = useState<string | null>(null);

    // Calendar States
    const [isGeneratingCalendar, setIsGeneratingCalendar] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    const [calendarRenderMode, setCalendarRenderMode] = useState<{ mode: 'cover' | 'month', monthData?: any } | null>(null);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setCroppingImage(reader.result as string);
                e.target.value = ''; // Reset input
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedImg: string) => {
        setFormData(prev => ({ ...prev, photo: croppedImg }));
        setCroppingImage(null);
    };

    const handleCropCurrent = () => {
        if (user.photo) {
            setCroppingImage(user.photo);
        }
    };

    const handleDownloadPDF = async () => {
        setIsProcessing(true);
        const frontNode = document.getElementById('capture-front');
        const backNode = document.getElementById('capture-back');

        if (frontNode && backNode) {
            try {
                const frontDataUrl = await toPng(frontNode, { pixelRatio: 4, quality: 1, backgroundColor: '#ffffff' });
                const backDataUrl = await toPng(backNode, { pixelRatio: 4, quality: 1, backgroundColor: '#ffffff' });

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

                pdf.save(`ENTRUST-CARD-${user.id}.pdf`);
            } catch (err) {
                console.error('PDF generation failed', err);
                alert("Failed to generate PDF. Please try again.");
            }
        } else {
            alert("Card generation elements not found. Please refresh.");
        }
        setIsProcessing(false);
    };

    const handleDownloadCalendar = async (options: CalendarOptions) => {
        setIsGeneratingCalendar(true);
        setGenerationProgress(0);
        setIsCalendarModalOpen(false); // Close modal

        try {
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            // Clean existing pages? jsPDF starts with one page.
            // We will edit the first page then add more.

            const captureAndAddPage = async (isFirstPage: boolean) => {
                const node = document.getElementById('printable-calendar-dashboard');
                if (!node) throw new Error('Calendar element not found');

                // Wait for render
                await new Promise(resolve => setTimeout(resolve, 300));

                const dataUrl = await toJpeg(node, {
                    width: 1122, // A4 at 96dpi approx is 1123. Ensure matches CSS
                    height: 793,
                    pixelRatio: 3.0, // Pro Max Quality
                    quality: 1.0,
                    backgroundColor: '#ffffff',
                    cacheBust: true
                });

                const imgProps = pdf.getImageProperties(dataUrl);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                if (!isFirstPage) {
                    pdf.addPage('a4', 'landscape');
                }
                pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            };

            const calendarData = getCalendarData5786();
            // Note: If you have dynamic year logic, replace getCalendarData5786() with appropriate fetch.
            // Currently UserDashboard seems to rely on 5786 static data from `CalendarLogic`.

            let isFirstPage = true;
            let totalSteps = 0;
            if (options.scope === 'full') totalSteps = 1 + calendarData.length;
            else totalSteps = 1;
            setTotalPages(totalSteps);

            // 1. Cover Page (Only for full)
            if (options.scope === 'full') {
                setCalendarRenderMode({ mode: 'cover' });
                await new Promise(resolve => setTimeout(resolve, 100)); // Wait for react render
                await captureAndAddPage(true);
                isFirstPage = false;
                setGenerationProgress(1);

                // 2. Loop Months
                let p = 1;
                for (const month of calendarData) {
                    setCalendarRenderMode({ mode: 'month', monthData: month });
                    await new Promise(resolve => setTimeout(resolve, 100));
                    await captureAndAddPage(false);
                    p++;
                    setGenerationProgress(p);
                }
            } else if (options.scope === 'single' && options.monthIndex !== undefined) {
                const month = calendarData[options.monthIndex];
                if (month) {
                    setCalendarRenderMode({ mode: 'month', monthData: month });
                    setGenerationProgress(1); // Just one month
                    await new Promise(resolve => setTimeout(resolve, 50));
                    await captureAndAddPage(isFirstPage);
                    pdf.save(`COT-Hebrew-Menorah-Calendar-5786-${month.name}.pdf`);
                }
            }

            // Reference Guide (Only for Full scope)
            if (options.scope === 'full') {
                try {
                    const refNode = document.getElementById('printable-reference-guide-dashboard');
                    if (refNode) {
                        const refDataUrl = await toJpeg(refNode, {
                            pixelRatio: 3.0, // Pro Max Quality
                            quality: 1.0,
                            backgroundColor: '#ffffff',
                            cacheBust: true,
                            width: 800,
                        });

                        pdf.addPage('a4', 'portrait');
                        const portraitPageWidth = pdf.internal.pageSize.getWidth();
                        const imgProps = pdf.getImageProperties(refDataUrl);
                        const pdfImgWidth = portraitPageWidth;
                        const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;

                        pdf.addImage(refDataUrl, 'JPEG', 0, 0, pdfImgWidth, pdfImgHeight, undefined, 'FAST');
                    }
                } catch (err) {
                    console.error("Error adding reference guide:", err);
                    // Continue to save even if reference fails
                }
            }

            if (options.scope === 'full') {
                pdf.save(`COT-Hebrew-Menorah-Calendar-5786.pdf`);
            }

        } catch (e: any) {
            console.error(e);
            alert(`Failed to generate PDF: ${e.message || "Unknown error"}. Try generating fewer months or using a PC.`);
        } finally {
            setCalendarRenderMode(null);
            setIsGeneratingCalendar(false);
        }
    };

    const startEditing = () => {
        setFormData({
            phone: user.phone,
            email: user.email,
            location: user.location,
            emergency: user.emergency,
            photo: user.photo
        });
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setFormData({});
    };

    const saveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        // Validate phone numbers
        if (formData.phone && formData.phone.length !== 10) {
            alert("Phone number must be exactly 10 digits.");
            return;
        }
        if (formData.emergency && formData.emergency.length !== 10) {
            alert("Phone number must be exactly 10 digits.");
            return;
        }
        onUpdate({ ...user, ...formData } as User);
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen pt-32 pb-20 bg-slate-50 relative">

            {/* Image Cropper Modal */}
            {croppingImage && (
                <ImageCropper
                    imageSrc={croppingImage}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setCroppingImage(null)}
                />
            )}
            {/* HIDDEN CAPTURE AREA */}
            <div className="fixed left-[-9999px] top-0 pointer-events-none">
                <div id="capture-front" className="bg-white">
                    <EntrustCard3D
                        name={user.name}
                        email={user.email}
                        location={user.location}
                        emergency={user.emergency}
                        uniqueId={user.id}
                        memberSince={user.memberSince}
                        photo={user.photo}
                        status={user.status}
                        isStatic={true}
                        isBackSide={false}
                    />
                </div>
                <div id="capture-back" className="bg-white">
                    <EntrustCard3D
                        name={user.name}
                        email={user.email}
                        location={user.location}
                        emergency={user.emergency}
                        uniqueId={user.id}
                        memberSince={user.memberSince}
                        photo={user.photo}
                        status={user.status}
                        isStatic={true}
                        isBackSide={true}
                    />
                </div>
            </div>

            <div className="container mx-auto px-6">
                <div className="mb-8 md:mb-12 text-center">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-950 uppercase tracking-tight">My Dashboard</h1>
                    <p className="text-slate-500 mt-2 text-sm md:text-base">Welcome back, {user.name}</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 items-start max-w-5xl mx-auto">
                    {/* Left Col: The Card */}
                    <div className={`flex flex-col items-center ${isEditing ? 'order-2 lg:order-1' : ''}`}>
                        <div className="relative">
                            <EntrustCard3D
                                name={user.name}
                                email={isEditing ? (formData.email || user.email) : user.email}
                                location={isEditing ? (formData.location || user.location) : user.location}
                                emergency={isEditing ? (formData.emergency || user.emergency) : user.emergency}
                                uniqueId={user.id}
                                memberSince={user.memberSince}
                                photo={isEditing ? (formData.photo || user.photo) : user.photo}
                                status={user.status}
                                className={user.status === 'Pending Verification' ? 'opacity-80 blur-[1px]' : ''}
                            />

                            {isEditing && (
                                <div className="absolute top-[35px] left-[15px] sm:top-[40px] sm:left-[21px] w-[82px] sm:w-[93px] h-[95px] sm:h-[105px] z-30 group/photo">
                                    <label className="absolute inset-0 bg-brand-950/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer rounded-xl border-2 border-dashed border-white/50 backdrop-blur-[2px]">
                                        <Camera size={24} className="mb-1" />
                                        <span className="text-[7px] font-black uppercase tracking-tighter text-center px-1">Change / Crop Photo</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                    </label>
                                </div>
                            )}

                            {user.status === 'Pending Verification' && !isEditing && (
                                <div className="absolute inset-0 bg-brand-900/40 backdrop-blur-[2px] opacity-100 flex items-center justify-center z-20 pointer-events-none rounded-[1.5rem] md:rounded-[2.5rem]">
                                    <div className="bg-amber-100 text-amber-800 px-6 py-3 rounded-xl border border-amber-200 shadow-xl font-bold uppercase tracking-widest text-sm flex items-center gap-3 transform -rotate-12">
                                        <AlertCircle size={20} /> Pending Verification
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-4 w-full max-w-full justify-center">
                            {!isEditing ? (
                                <>
                                    <Button
                                        onClick={handleDownloadPDF}
                                        disabled={user.status !== 'Active' || isProcessing}
                                        className="flex-1 py-3 text-xs uppercase tracking-widest shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FileText size={16} /> {isProcessing ? "Generating..." : "Download Card"}
                                    </Button>
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        variant="secondary"
                                        className="flex-1 py-3 text-xs uppercase tracking-widest shadow-sm group"
                                    >
                                        <Edit2 size={16} className="group-hover:rotate-12 transition-transform" /> Edit Profile
                                    </Button>
                                </>
                            ) : (
                                <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-xl text-center w-full border border-blue-100">
                                    Only your photo can be updated after approval.
                                </div>
                            )}
                        </div>



                        {/* Calendar Download Card - Only for Active Users */}
                        {user.status === 'Active' && !isEditing && (
                            <div className="mt-8 bg-gradient-to-r from-amber-700 to-amber-900 p-6 rounded-3xl border border-amber-600 shadow-xl w-full max-w-[380px] text-center relative overflow-hidden group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>

                                <div className="relative z-10">
                                    <div className="flex justify-center mb-3">
                                        <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-amber-400/30">
                                            <Calendar size={24} className="text-amber-100" />
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-xl text-white mb-2 font-serif text-shadow-sm">Jewish Calendar 5786</h3>
                                    <p className="text-amber-100 text-xs mb-5 font-light leading-relaxed">
                                        Download the official City of Truth Ministries Jewish Calendar. <br /> Pro Max Quality Edition.
                                    </p>
                                    <a
                                        href="/assets/COT-Hebrew-Menorah-Calendar-5786 (7).pdf"
                                        download="COT-Hebrew-Menorah-Calendar-5786.pdf"
                                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-b from-white to-amber-100 text-amber-950 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-white transition-colors w-full"
                                    >
                                        <Download size={16} /> Download PDF
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Download App Section */}
                        <div className="mt-8 bg-brand-900 p-6 rounded-3xl border border-brand-800 shadow-xl w-full max-w-[380px] text-center relative overflow-hidden group hover:shadow-2xl transition-all">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>

                            <div className="relative z-10">
                                <h3 className="font-bold text-lg text-white mb-2 font-serif">Get the Mobile App</h3>
                                <p className="text-brand-100 text-xs mb-4">Access your ID card offline and get instant ministry updates on your Android device.</p>
                                <a
                                    href="/COT Ministries.apk"
                                    download="COT Ministries.apk"
                                    className="inline-flex items-center justify-center gap-2 bg-white text-brand-950 px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-accent-50 transition-colors w-full"
                                >
                                    <Download size={18} className="text-brand-600" /> Download Our App
                                </a>
                            </div>
                        </div>

                    </div>

                    {/* Right Col: Status or Edit Form */}
                    <div className={`space-y-8 ${isEditing ? 'order-1 lg:order-2' : ''}`}>
                        {isEditing ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-8 rounded-3xl border border-brand-100 shadow-lg"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-lg text-brand-950 flex items-center gap-2">
                                        <Edit2 size={18} className="text-brand-500" /> Edit Details
                                    </h3>
                                    <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-600 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={saveChanges} className="space-y-4">
                                    {/* Editing Restricted Message */}
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 mb-4">
                                        <AlertCircle size={14} className="inline mr-1 -mt-0.5" />
                                        <strong>Note:</strong> To maintain ID integrity, only your photo can be updated. For other changes, please contact admin.
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Profile Photo</label>
                                        <div className="relative group aspect-square w-32 mx-auto">
                                            <div className="w-full h-full rounded-[2rem] bg-slate-50 border-2 border-slate-100 overflow-hidden shadow-inner group-hover:border-brand-200 transition-colors">
                                                <img
                                                    src={formData.photo || user.photo}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer rounded-[2rem] gap-2">
                                                    <label className="flex flex-col items-center justify-center cursor-pointer hover:text-accent-400 transition-colors">
                                                        <UploadCloud size={24} />
                                                        <span className="text-[8px] font-bold uppercase tracking-widest">Update</span>
                                                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                                    </label>
                                                    <div className="w-8 h-[1px] bg-white/20" />
                                                    <button
                                                        type="button"
                                                        onClick={handleCropCurrent}
                                                        className="flex flex-col items-center justify-center hover:text-accent-400 transition-colors"
                                                    >
                                                        <Camera size={24} />
                                                        <span className="text-[8px] font-bold uppercase tracking-widest">Crop Current</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 text-center mt-2 italic">Tip: Upload a new photo or crop the current one.</p>
                                    </div>

                                    {/* HIDDEN INPUTS TO PRESERVE LAYOUT BUT DISABLED */}
                                    <div className="opacity-50 pointer-events-none filter blur-[1px] select-none">
                                        <div className="space-y-1 mt-4">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address (Locked)</label>
                                            <input type="text" value={user.email} disabled className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5" />
                                        </div>
                                        <div className="space-y-1 mt-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone (Locked)</label>
                                            <input type="text" value={user.phone} disabled className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5" />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <Button type="button" onClick={cancelEditing} variant="outline" className="flex-1 py-3 text-xs border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700">Cancel</Button>
                                        <Button type="submit" variant="primary" className="flex-1 py-3 text-xs shadow-lg shadow-brand-500/20">
                                            <Save size={16} /> Save New Photo
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <>
                                <div className={`p-8 rounded-3xl border ${user.status === 'Active' ? 'bg-white border-brand-100 shadow-lg' : 'bg-amber-50 border-amber-100'}`}>
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        {user.status === 'Active' ? <CheckCircle className="text-green-500" /> : <AlertCircle className="text-amber-500" />}
                                        Account Status
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                                            <span className="text-sm text-slate-500 font-medium">Verification</span>
                                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-700' :
                                                user.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                                            <span className="text-sm text-slate-500 font-medium">Member ID</span>
                                            <span className="text-sm font-bold text-brand-900 font-mono">{user.id}</span>
                                        </div>
                                    </div>
                                </div>

                            </>
                        )}

                        {!isEditing && (
                            <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                        <MessageSquare size={20} /> Share Your Testimony
                                    </h3>
                                    <p className="text-brand-100 text-sm mb-4">
                                        Encourage others by sharing what God has done in your life.
                                    </p>
                                    <Button
                                        onClick={() => setShowTestimonialModal(true)}
                                        className="bg-white text-brand-900 hover:bg-brand-50 border-0 w-full"
                                    >
                                        Write Testimony
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* QR Code Section (Moved to Right) */}
                        {!isEditing && (
                            <div className="mt-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm w-full">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <QrCode className="text-brand-600" size={20} />
                                    My QR Code
                                </h3>
                                {user.status === 'Active' ? (
                                    <div className="flex flex-col items-center">
                                        <div className="bg-white p-4 rounded-xl border-2 border-dashed border-slate-200 mb-4">
                                            <img
                                                src={`https://quickchart.io/qr?text=${encodeURIComponent(JSON.stringify({
                                                    id: user.id,
                                                    name: user.name,
                                                    email: user.email,
                                                    phone: user.phone,
                                                    location: user.location,
                                                    emergency: user.emergency || 'N/A',
                                                    role: user.role,
                                                    status: user.status
                                                }))}&dark=4c51f7&size=200`}
                                                alt="My QR Code"
                                                className="w-40 h-40"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 text-center">
                                            This QR code contains all your registration details
                                        </p>
                                        <button
                                            onClick={() => window.open(`https://quickchart.io/qr?text=${encodeURIComponent(JSON.stringify({
                                                id: user.id,
                                                name: user.name,
                                                email: user.email,
                                                phone: user.phone,
                                                location: user.location,
                                                emergency: user.emergency || 'N/A',
                                                role: user.role,
                                                status: user.status
                                            }))}&dark=4c51f7&size=400`, '_blank')}
                                            className="mt-3 px-4 py-2 bg-brand-50 text-brand-600 rounded-lg text-xs font-bold hover:bg-brand-100 transition-colors"
                                        >
                                            Download QR Code
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center py-8 text-center bg-slate-50 rounded-2xl border border-slate-100 px-4">
                                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                                            <AlertCircle size={24} />
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-sm mb-1">QR Code Pending</h4>
                                        <p className="text-xs text-slate-500">
                                            Your personalized QR code will be generated once your account is verified and approved.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Logout Button (Moved to Right) */}
                        {!isEditing && (
                            <div className="w-full">
                                <Button
                                    onClick={onLogout}
                                    variant="outline"
                                    fullWidth
                                    className="border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 py-4 shadow-sm"
                                >
                                    <LogOut size={18} className="mr-2" /> Logout
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <TestimonialModal
                isOpen={showTestimonialModal}
                onClose={() => setShowTestimonialModal(false)}
                user={user}
            />

            <CalendarCustomizationModal
                isOpen={isCalendarModalOpen}
                onClose={() => setIsCalendarModalOpen(false)}
                onDownload={handleDownloadCalendar}
            />

            {/* Hidden Calendar Render for Capture */}
            <div className="fixed left-[-10000px] top-0 pointer-events-none -z-50 opacity-100">
                <div id="printable-calendar-dashboard" className="w-[1122px] min-h-[793px] bg-white">
                    {calendarRenderMode && (
                        <PrintableHebrewCalendar
                            mode={calendarRenderMode.mode}
                            year={5786}
                            monthData={calendarRenderMode.monthData}
                            currentUser={user}
                        />
                    )}
                </div>
            </div>

            {/* Hidden Reference Guide for Dashboard Capture */}
            <div className="fixed left-[-10000px] top-0 overflow-visible z-50 opacity-100 pointer-events-none">
                <div id="printable-reference-guide-dashboard" className="bg-white">
                    <PrintableReferenceGuide year={5786} />
                </div>
            </div>
        </div >
    );
};
