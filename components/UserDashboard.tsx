import React, { useEffect, useState } from 'react';
import { User, SubProfile } from '../types';
import { EntrustCard3D } from './WorshipperIDCard';
import { Download, Edit2, AlertCircle, CheckCircle, X, FileText, QrCode, LogOut, Camera, Calendar, Users, UserPlus, Trash2, ShieldCheck, MessageSquare, Share2, PlusCircle, ScanLine, UploadCloud } from 'lucide-react';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { TestimonialModal } from './TestimonialModal';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { ImageCropper } from './ImageCropper';
import { PrintableHebrewCalendar } from './PrintableHebrewCalendar';
import { PrintableReferenceGuide } from './PrintableReferenceGuide';
import { getCalendarData5786 } from './CalendarLogic';
import { CalendarCustomizationModal, CalendarOptions } from './CalendarCustomizationModal';

interface UserDashboardProps {
    user: User;
    onEdit: () => void;
    onUpdate: (updatedUser: User) => void;
    onLogout: () => void;
    onOpenScanner?: () => void;
    initialProfileId?: string;
}

const FAMILY_RELATIONSHIP_OPTIONS = {
    immediate: ['None', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister'],
    extended: ['Grandfather', 'Grandmother', 'Father-in-law', 'Mother-in-law', 'Uncle', 'Aunt', 'Cousin'],
    others: ['Guardian', 'Other']
};

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, onUpdate, onLogout, onOpenScanner, initialProfileId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showTestimonialModal, setShowTestimonialModal] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [croppingImage, setCroppingImage] = useState<string | null>(null);
    const [showFamilyModal, setShowFamilyModal] = useState(false);
    const [subProfileForm, setSubProfileForm] = useState<Partial<SubProfile>>({});
    const [activeProfileId, setActiveProfileId] = useState<string>(initialProfileId || user.id);
    const [isGeneratingCalendar, setIsGeneratingCalendar] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    const [calendarRenderMode, setCalendarRenderMode] = useState<{ mode: 'cover' | 'month'; monthData?: any } | null>(null);
    const [idRevealed, setIdRevealed] = useState(false);
    const [showCardPreview, setShowCardPreview] = useState(false);
    const [cardFlipped, setCardFlipped] = useState(false);

    useEffect(() => {
        if (!initialProfileId) {
            setActiveProfileId(user.id);
            return;
        }
        const isPrimary = initialProfileId === user.id;
        const isLinked = !!user.linkedProfiles?.some(p => p.id === initialProfileId);
        setActiveProfileId((isPrimary || isLinked) ? initialProfileId : user.id);
    }, [initialProfileId, user.id, user.linkedProfiles]);

    const getDisplayProfile = () => {
        if (activeProfileId === user.id) return user;
        const sub = user.linkedProfiles?.find(p => p.id === activeProfileId);
        if (sub) return { ...user, id: sub.id, name: sub.name, photo: sub.photo, bloodGroup: sub.bloodGroup, dob: sub.dob };
        return user;
    };
    const displayProfile = getDisplayProfile();


    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => { setCroppingImage(reader.result as string); e.target.value = ''; };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedImg: string) => {
        if (activeProfileId === user.id) {
            onUpdate({ ...user, photo: croppedImg } as User);
        } else {
            const updatedProfiles = user.linkedProfiles?.map(p => p.id === activeProfileId ? { ...p, photo: croppedImg } : p) || [];
            onUpdate({ ...user, linkedProfiles: updatedProfiles } as User);
        }
        setCroppingImage(null);
    };

    const handleDownloadPDF = async () => {
        setIsProcessing(true);
        const frontNode = document.getElementById('capture-front');
        const backNode = document.getElementById('capture-back');
        if (frontNode && backNode) {
            try {
                await new Promise(r => setTimeout(r, 600));
                // Explicit dimensions ensure off-screen nodes render correctly in all browsers
                const opts = { pixelRatio: 3, quality: 1, backgroundColor: '#ffffff', cacheBust: true, width: 680, height: 430 };
                const frontDataUrl = await toPng(frontNode, opts);
                const backDataUrl = await toPng(backNode, opts);
                const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (215 * pdfWidth) / 340;
                const yPos = (pdf.internal.pageSize.getHeight() - pdfHeight) / 2;
                pdf.addImage(frontDataUrl, 'PNG', 0, yPos > 0 ? yPos : 0, pdfWidth, pdfHeight, undefined, 'FAST');
                pdf.addPage();
                pdf.addImage(backDataUrl, 'PNG', 0, yPos > 0 ? yPos : 0, pdfWidth, pdfHeight, undefined, 'FAST');
                pdf.save(`ENTRUST-CARD-${displayProfile.id}.pdf`);
            } catch (err: any) {
                console.error('PDF generation failed', err);
                // Fallback: try jpeg instead of png
                try {
                    const { toJpeg: toJpeg2 } = await import('html-to-image');
                    const opts2 = { pixelRatio: 2, quality: 0.95, backgroundColor: '#ffffff', cacheBust: true, width: 680, height: 430 };
                    const frontDataUrl2 = await toJpeg2(frontNode!, opts2);
                    const backDataUrl2 = await toJpeg2(backNode!, opts2);
                    const pdf2 = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
                    const pdfWidth2 = pdf2.internal.pageSize.getWidth();
                    const pdfHeight2 = (215 * pdfWidth2) / 340;
                    const yPos2 = (pdf2.internal.pageSize.getHeight() - pdfHeight2) / 2;
                    pdf2.addImage(frontDataUrl2, 'JPEG', 0, yPos2 > 0 ? yPos2 : 0, pdfWidth2, pdfHeight2, undefined, 'FAST');
                    pdf2.addPage();
                    pdf2.addImage(backDataUrl2, 'JPEG', 0, yPos2 > 0 ? yPos2 : 0, pdfWidth2, pdfHeight2, undefined, 'FAST');
                    pdf2.save(`ENTRUST-CARD-${displayProfile.id}.pdf`);
                } catch (err2) {
                    alert('PDF generation failed. Please try again or contact admin.');
                }
            }
        } else {
            alert('Card elements not ready. Please scroll down and try again.');
        }
        setIsProcessing(false);
    };

    const handleDownloadCalendar = async (options: CalendarOptions) => {
        setIsGeneratingCalendar(true); setGenerationProgress(0); setIsCalendarModalOpen(false);
        try {
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
            const captureAndAddPage = async (isFirstPage: boolean) => {
                const node = document.getElementById('printable-calendar-dashboard');
                if (!node) throw new Error('Calendar element not found');
                await new Promise(resolve => setTimeout(resolve, 300));
                const dataUrl = await toJpeg(node, { width: 1122, height: 793, pixelRatio: 3.0, quality: 1.0, backgroundColor: '#ffffff', cacheBust: true });
                const imgProps = pdf.getImageProperties(dataUrl);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                if (!isFirstPage) pdf.addPage('a4', 'landscape');
                pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            };
            const calendarData = getCalendarData5786();
            let isFirstPage = true;
            const totalSteps = options.scope === 'full' ? 1 + calendarData.length : 1;
            setTotalPages(totalSteps);
            if (options.scope === 'full') {
                setCalendarRenderMode({ mode: 'cover' });
                await new Promise(resolve => setTimeout(resolve, 100));
                await captureAndAddPage(true); isFirstPage = false; setGenerationProgress(1);
                let p = 1;
                for (const month of calendarData) {
                    setCalendarRenderMode({ mode: 'month', monthData: month });
                    await new Promise(resolve => setTimeout(resolve, 100));
                    await captureAndAddPage(false); p++; setGenerationProgress(p);
                }
            } else if (options.scope === 'single' && options.monthIndex !== undefined) {
                const month = calendarData[options.monthIndex];
                if (month) {
                    setCalendarRenderMode({ mode: 'month', monthData: month });
                    setGenerationProgress(1);
                    await new Promise(resolve => setTimeout(resolve, 50));
                    await captureAndAddPage(isFirstPage);
                    pdf.save(`COT-Hebrew-Menorah-Calendar-5786-${month.name}.pdf`);
                }
            }
            if (options.scope === 'full') {
                try {
                    const refNode = document.getElementById('printable-reference-guide-dashboard');
                    if (refNode) {
                        const refDataUrl = await toJpeg(refNode, { pixelRatio: 3.0, quality: 1.0, backgroundColor: '#ffffff', cacheBust: true, width: 800 });
                        pdf.addPage('a4', 'portrait');
                        const pW = pdf.internal.pageSize.getWidth();
                        const rp = pdf.getImageProperties(refDataUrl);
                        pdf.addImage(refDataUrl, 'JPEG', 0, 0, pW, (rp.height * pW) / rp.width, undefined, 'FAST');
                    }
                } catch (err) { console.error('Error adding reference guide:', err); }
                pdf.save('COT-Hebrew-Menorah-Calendar-5786.pdf');
            }
        } catch (e: any) {
            console.error(e);
            alert(`Failed to generate PDF: ${e.message || 'Unknown error'}.`);
        } finally { setCalendarRenderMode(null); setIsGeneratingCalendar(false); }
    };

    const startEditing = () => { setFormData({ phone: user.phone, email: user.email, location: user.location, emergency: user.emergency, photo: user.photo }); setIsEditing(true); };
    const cancelEditing = () => { setIsEditing(false); setFormData({}); };
    const saveChanges = (e: React.FormEvent) => { e.preventDefault(); onUpdate({ ...user, ...formData } as User); setIsEditing(false); };

    const handleAddSubProfile = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = (subProfileForm.name || '').trim();
        if (!trimmedName) {
            alert('Family member name is required.');
            return;
        }
        const newId = `${user.id}-${(user.linkedProfiles?.length || 0) + 1}`;
        const newProfile: SubProfile = { id: newId, name: trimmedName, role: subProfileForm.role || 'None', dob: subProfileForm.dob, bloodGroup: subProfileForm.bloodGroup };
        onUpdate({ ...user, linkedProfiles: [...(user.linkedProfiles || []), newProfile] } as User);
        setShowFamilyModal(false); setSubProfileForm({});
    };

    const handleDeleteSubProfile = (profileId: string) => {
        if (!confirm('Remove this family member?')) return;
        const updatedProfiles = user.linkedProfiles?.filter(p => p.id !== profileId) || [];
        onUpdate({ ...user, linkedProfiles: updatedProfiles } as User);
        if (activeProfileId === profileId) setActiveProfileId(user.id);
    };

    const handleShare = () => {
        const url = `${window.location.origin}/verify/${displayProfile.id}`;
        if (navigator.share) { navigator.share({ title: `${displayProfile.name} — City of Truth Ministries`, text: 'Check my Entrust ID Card', url }); }
        else { navigator.clipboard.writeText(url); alert('Profile link copied!'); }
    };

    const handleVerificationDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onUpdate({
            ...user,
            verificationDoc: {
                name: file.name,
                uploadedAt: new Date().toISOString()
            }
        } as User);
        e.target.value = '';
    };

    const qrUrl = `${window.location.origin}/verify/${displayProfile.id}`;
    const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrUrl)}&bgcolor=ffffff&color=1a237e&margin=5&format=png`;

    /* ─────────────────────────────────────────────── */
    return (
        <div className="min-h-screen pt-28 pb-20 bg-[#f0f2f5] text-slate-900 relative flex flex-col items-center overflow-x-hidden px-3 sm:px-5">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.06] pointer-events-none z-0" />

            {/* Off-screen capture nodes */}
            {croppingImage && <div className="z-[100] relative"><ImageCropper imageSrc={croppingImage} onCropComplete={handleCropComplete} onCancel={() => setCroppingImage(null)} /></div>}
            <TestimonialModal isOpen={showTestimonialModal} onClose={() => setShowTestimonialModal(false)} user={user} />
            <CalendarCustomizationModal isOpen={isCalendarModalOpen} onClose={() => setIsCalendarModalOpen(false)} onDownload={handleDownloadCalendar} />

            <div className="fixed left-[-9999px] top-0 pointer-events-none z-0">
                <div id="capture-front" className="bg-white">
                    <EntrustCard3D name={displayProfile.name} email={user.email} location={user.location} emergency={user.emergency} uniqueId={displayProfile.id} memberSince={user.memberSince} photo={displayProfile.photo} status={user.status} isStatic={true} isBackSide={false} />
                </div>
                <div id="capture-back" className="bg-white">
                    <EntrustCard3D name={displayProfile.name} email={user.email} location={user.location} emergency={user.emergency} uniqueId={displayProfile.id} memberSince={user.memberSince} photo={displayProfile.photo} status={user.status} isStatic={true} isBackSide={true} />
                </div>
            </div>
            <div className="fixed left-[-10000px] top-0 pointer-events-none opacity-100 z-0">
                <div id="printable-calendar-dashboard" className="w-[1122px] min-h-[793px] bg-white">
                    {calendarRenderMode && <PrintableHebrewCalendar mode={calendarRenderMode.mode} year={5786} monthData={calendarRenderMode.monthData} currentUser={user} />}
                </div>
                <div id="printable-reference-guide-dashboard" className="bg-white"><PrintableReferenceGuide year={5786} /></div>
            </div>

            {/* Add Family Member Modal */}
            <AnimatePresence>
                {showFamilyModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden border border-slate-100">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-accent-500" />
                            <div className="p-6 md:p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold font-serif text-brand-950">Add Family Member</h3>
                                    <button onClick={() => setShowFamilyModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                                </div>
                                <p className="text-xs text-slate-500 mb-5">Keep it simple: name and relationship first. You can update profile details later.</p>
                                <form onSubmit={handleAddSubProfile} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Full Name</label>
                                        <input required type="text" value={subProfileForm.name || ''} onChange={e => setSubProfileForm({ ...subProfileForm, name: e.target.value })} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-brand-500 text-sm font-medium shadow-sm placeholder:text-slate-500" placeholder="John Doe" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Relationship</label>
                                            <select required value={subProfileForm.role || 'None'} onChange={e => setSubProfileForm({ ...subProfileForm, role: e.target.value })} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-brand-500 text-sm appearance-none shadow-sm">
                                                <optgroup label="Immediate Family">
                                                    {FAMILY_RELATIONSHIP_OPTIONS.immediate.map(option => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="Extended Family">
                                                    {FAMILY_RELATIONSHIP_OPTIONS.extended.map(option => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="Others">
                                                    {FAMILY_RELATIONSHIP_OPTIONS.others.map(option => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </optgroup>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Blood Group (optional)</label>
                                            <select value={subProfileForm.bloodGroup || ''} onChange={e => setSubProfileForm({ ...subProfileForm, bloodGroup: e.target.value })} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-brand-500 text-sm appearance-none shadow-sm">
                                                <option value="">Select…</option>
                                                <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Date of Birth (optional)</label>
                                        <input type="date" value={subProfileForm.dob || ''} onChange={e => setSubProfileForm({ ...subProfileForm, dob: e.target.value })} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-brand-500 text-sm shadow-sm" />
                                    </div>
                                    <div className="pt-2">
                                        <Button type="submit" variant="primary" fullWidth className="py-3 shadow-lg shadow-brand-500/20"><UserPlus size={16} className="mr-2" /> Add Member</Button>
                                        <p className="text-[10px] text-center text-slate-400 mt-2">Switch to their profile after creation to set a photo.</p>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ══════════════════════════════════════
                MAIN CONTENT
            ══════════════════════════════════════ */}
            <div className={`w-full max-w-md lg:max-w-5xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10`}>
                {/* ── LEFT COLUMN (Profile, Family, Actions, Logout on Desktop) ── */}
                <div className={`${user.linkedProfiles && user.linkedProfiles.length > 0 ? 'lg:col-span-4' : 'lg:col-span-5'} flex flex-col gap-5`}>

                <div className="flex items-center gap-3 mb-5 px-1">
                    {/* Primary profile + family avatars */}
                    <div className="relative group shrink-0">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-[3px] border-white shadow-lg bg-brand-100">
                            <img src={displayProfile.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayProfile.name)}&background=1e1b4b&color=fff&bold=true&size=128`} alt={displayProfile.name} className="w-full h-full object-cover" />
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                            <Camera size={14} className="text-white" />
                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        </label>
                        {/* Active indicator */}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${user.status === 'Active' ? 'bg-green-500' : 'bg-amber-400'}`} />
                    </div>

                    {/* Family member avatars */}
                    {user.linkedProfiles?.map(pf => (
                        <button key={pf.id} onClick={() => setActiveProfileId(pf.id)} title={pf.name}
                            className={`relative shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${activeProfileId === pf.id ? 'border-brand-500 shadow-lg scale-110' : 'border-white/70 opacity-70 hover:opacity-100 hover:scale-105'}`}>
                            <img src={pf.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(pf.name)}&background=5b47d0&color=fff&bold=true&size=80`} alt={pf.name} className="w-full h-full object-cover" />
                        </button>
                    ))}

                    {/* Add Profile button */}
                    <button onClick={() => setShowFamilyModal(true)} title="Add Family Member"
                        className="shrink-0 w-10 h-10 rounded-full border-2 border-dashed border-slate-300 bg-white hover:border-brand-400 hover:bg-brand-50 flex items-center justify-center transition-all text-slate-400 hover:text-brand-500">
                        <PlusCircle size={20} />
                    </button>

                    <div className="flex-1 min-w-0 ml-1">
                        <h1 className="font-bold text-slate-900 text-base leading-tight truncate">{displayProfile.name}</h1>
                        <p className="text-[11px] text-slate-500 font-medium">{activeProfileId !== user.id ? 'Family Member' : (user.role || 'Member')}</p>
                    </div>

                    {/* Edit button */}
                    {activeProfileId === user.id && (
                        <button onClick={startEditing} className="shrink-0 text-slate-400 hover:text-brand-600 p-2 rounded-full hover:bg-white transition-all">
                            <Edit2 size={18} />
                        </button>
                    )}
                </div>

                {/* ── PROFILE SWITCHER TABS ── */}
                {(user.linkedProfiles && user.linkedProfiles.length > 0) && (
                    <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
                        <button onClick={() => setActiveProfileId(user.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-[11px] uppercase whitespace-nowrap transition-all shadow-sm ${activeProfileId === user.id ? 'bg-brand-700 text-white shadow-brand-400/30 shadow-md' : 'bg-white text-slate-500 border border-slate-200'}`}>
                            Me
                        </button>
                        {user.linkedProfiles.map(pf => (
                            <button key={pf.id} onClick={() => setActiveProfileId(pf.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-[11px] uppercase whitespace-nowrap transition-all shadow-sm ${activeProfileId === pf.id ? 'bg-accent-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'}`}>
                                {pf.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── FAMILY MEMBERS LIST ── */}
                {user.linkedProfiles && user.linkedProfiles.length > 0 && (
                    <div className="bg-white rounded-[24px] shadow-md overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users size={16} className="text-brand-500" /> Family</h3>
                            <button onClick={() => setShowFamilyModal(true)} className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1">
                                <PlusCircle size={14} /> Add
                            </button>
                        </div>
                        <div className="p-4 space-y-3 bg-slate-50">
                            <button onClick={() => setActiveProfileId(user.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${activeProfileId === user.id ? 'bg-brand-50 border-brand-200' : 'bg-white border-slate-200 hover:border-brand-200'}`}>
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-100 shrink-0">
                                    <img src={user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1e1b4b&color=fff&bold=true&size=80`} alt={user.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 text-sm truncate">{user.name}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{user.id} · Primary</p>
                                </div>
                                {activeProfileId === user.id && <CheckCircle size={16} className="text-brand-500 shrink-0" />}
                            </button>
                            {user.linkedProfiles.map((pf, index) => (
                                <div key={pf.id} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all group ${activeProfileId === pf.id ? 'bg-accent-50 border-accent-200' : 'bg-white border-slate-200 hover:border-accent-200'}`}>
                                    <button onClick={() => setActiveProfileId(pf.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 shrink-0">
                                            <img src={pf.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(pf.name)}&background=5b47d0&color=fff&bold=true&size=80`} alt={pf.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 text-sm truncate">{pf.name}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">
                                                {(index === 0 ? 'First Family Member' : `Additional Member ${index}`)} · {pf.role || 'Family'}
                                            </p>
                                        </div>
                                        {activeProfileId === pf.id && <CheckCircle size={16} className="text-accent-500 shrink-0" />}
                                    </button>
                                    <button onClick={() => handleDeleteSubProfile(pf.id)} className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-all ml-2 shrink-0">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* ── LOGOUT ── */}
                <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-white border border-red-100 text-red-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 rounded-2xl py-3.5 font-bold text-xs tracking-widest uppercase transition-all shadow-sm">
                    <LogOut size={15} /> Logout
                </button>
                </div>

                {/* ── RIGHT COLUMN (Wallet Card & Content on Desktop) ── */}
                <div className={`${user.linkedProfiles && user.linkedProfiles.length > 0 ? 'lg:col-span-8' : 'lg:col-span-7'} flex flex-col gap-5`}>

                {/* ════════════════════════════════════
                    mAadhaar-Style Wallet Card
                ════════════════════════════════════ */}
                <div className="bg-white rounded-[28px] shadow-xl mb-5 overflow-hidden">
                    {/* Gold ID Number Header - show full ID, no masking */}
                    <div className="bg-gradient-to-r from-[#d4a547] via-[#f0c040] to-[#c8922a] px-5 py-3.5 flex items-center justify-between">
                        <span className="font-black text-[#3d2500] text-xl tracking-[3px] font-mono">
                            {displayProfile.id.toUpperCase()}
                        </span>
                        <span className="text-[#5a3500]/60 text-[10px] font-bold uppercase tracking-widest">Member ID</span>
                    </div>

                    {/* Desktop Content Row: 3D Preview + QR */}
                    <div className="flex flex-col xl:flex-row items-center justify-between p-4 md:p-6 lg:p-10 gap-6">

                        {/* Left: Card Preview */}
                        <div className="w-full xl:w-3/5">
                            {/* Stacked card visual + tap to reveal (MOBILE ONLY) */}
                            <div className="md:hidden relative cursor-pointer" onClick={() => setShowCardPreview(true)}>
                                <div className="absolute inset-x-4 top-2 h-10 bg-gradient-to-r from-brand-200 to-accent-200 rounded-2xl opacity-40 blur-sm" />
                                <div className="absolute inset-x-2 top-1 h-10 bg-gradient-to-r from-brand-300 to-accent-300 rounded-2xl opacity-30" />
                                <div className="relative bg-gradient-to-r from-[#1a237e] to-[#3949ab] rounded-2xl h-24 flex items-center justify-center overflow-hidden border border-white/20">
                                    <div className="absolute left-4 flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50 bg-white/20 shrink-0">
                                            <img src={displayProfile.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayProfile.name)}&background=1e1b4b&color=fff&bold=true&size=96`} alt={displayProfile.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm leading-tight">{displayProfile.name}</p>
                                            <p className="text-white/70 text-[10px] font-mono mt-0.5">{displayProfile.id}</p>
                                        </div>
                                    </div>
                                    <div className="absolute right-4 text-white/30"><ScanLine size={32} /></div>
                                </div>
                                <p className="text-center text-slate-500 text-xs font-semibold mt-3 mb-1">Tap to preview your Entrust Card ↗</p>
                            </div>

                            {/* Real EntrustCard3D Preview (DESKTOP ONLY) */}
                            <div className="hidden md:block w-full cursor-pointer hover:scale-[1.01] transition-transform duration-300" onClick={() => setShowCardPreview(true)}>
                                <div className="w-full flex justify-center origin-center">
                                    <EntrustCard3D
                                        name={displayProfile.name}
                                        email={user.email}
                                        location={user.location}
                                        emergency={user.emergency}
                                        uniqueId={displayProfile.id}
                                        memberSince={user.memberSince}
                                        photo={displayProfile.photo}
                                        status={user.status}
                                        isStatic={true}
                                        isBackSide={cardFlipped}
                                    />
                                </div>
                                <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest mt-3">✨ Click card to Expand / Download ✨</p>
                            </div>
                        </div>

                        {/* Right: QR Code */}
                        <div className="w-full xl:w-2/5 flex flex-col items-center justify-center border-t xl:border-t-0 xl:border-l border-slate-100 pt-6 xl:pt-0 xl:pl-6">
                            {user.status === 'Active' ? (
                                <div className="flex flex-col items-center">
                                    <button
                                        type="button"
                                        onClick={() => onOpenScanner?.()}
                                        className="relative inline-block bg-white rounded-3xl p-4 border border-slate-100 shadow-lg shadow-brand-900/5"
                                    >
                                        <img src={qrImgSrc} alt="QR Code" className="w-48 h-48 block mx-auto" crossOrigin="anonymous" />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-md border border-slate-100">
                                                <img src="/logo.png" alt="COT" className="w-8 h-8 object-contain" />
                                            </div>
                                        </div>
                                    </button>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">Tap QR to open scanner</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                                        <div className="blur-[3px] pointer-events-none select-none" style={{ transform: 'scale(0.72)', transformOrigin: 'top center', height: '155px', width: '245px' }}>
                                            <EntrustCard3D
                                                name={displayProfile.name}
                                                email={user.email}
                                                location={user.location}
                                                emergency={user.emergency}
                                                uniqueId={displayProfile.id}
                                                memberSince={user.memberSince}
                                                photo={displayProfile.photo}
                                                status={user.status}
                                                isStatic={true}
                                                isBackSide={false}
                                            />
                                        </div>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 gap-2">
                                            <ShieldCheck size={28} className="text-amber-300" />
                                            <p className="font-black text-white text-xs uppercase tracking-widest">Not Verified</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2">Pending admin verification</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Edit Details button below card + QR */}
                    <div className="flex justify-center pb-2">
                        <button onClick={startEditing} className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-slate-500 hover:text-brand-600 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-sm">
                            <Edit2 size={13} /> Edit Details
                        </button>
                    </div>

                    {/* Action buttons row (mAadhaar style) */}
                    {user.status === 'Active' && (
                        <div className="grid grid-cols-4 gap-1 px-4 pb-5 pt-3">
                            {[
                                { icon: <Share2 size={20} />, label: 'Share', action: handleShare },
                                { icon: <Download size={20} />, label: 'Download', action: handleDownloadPDF, loading: isProcessing },
                                { icon: <QrCode size={20} />, label: 'Open Scanner', action: () => onOpenScanner?.() },
                                { 
                                    icon: <div className="relative"><CheckCircle size={20} className="text-amber-500" /><div className="absolute inset-0 bg-amber-400 blur-sm rounded-full -z-10 animate-pulse" /></div>, 
                                    label: <span className="bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent font-black shadow-sm">VERIFIED MEMBER</span>, 
                                    action: () => {}
                                },
                            ].map(({ icon, label, action, loading }, i) => (
                                <button key={i} onClick={action} disabled={loading}
                                    className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-2xl bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-600 transition-all disabled:opacity-60 border border-transparent hover:border-brand-100">
                                    {loading ? <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /> : icon}
                                    <span className="text-[9px] font-bold uppercase tracking-wide leading-tight text-center">{loading ? 'Wait…' : label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                </div>

                {/* ── ACTION CARDS GRID ── */}
                <div className="grid grid-cols-2 gap-4 mb-5">

                    {/* Entrust ID Card — brown */}
                    {user.status === 'Active' ? (
                        <button onClick={handleDownloadPDF} disabled={isProcessing}
                            className="bg-gradient-to-br from-[#7B3F00] to-[#C0652B] text-white rounded-[22px] p-4 text-left shadow-lg hover:brightness-110 transition-all disabled:opacity-70 relative overflow-hidden group">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3"><FileText size={18} /></div>
                            <p className="font-bold text-sm leading-tight mb-1">Entrust ID Card</p>
                            <p className="text-white/70 text-[10px] leading-snug">Official COT identity card</p>
                            <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-white/20 rounded-lg px-2.5 py-1.5">
                                <Download size={11} /> {isProcessing ? 'Wait…' : 'Download PDF'}
                            </span>
                        </button>
                    ) : (
                        <div className="bg-slate-100 rounded-[22px] p-4 border border-slate-200">
                            <div className="w-9 h-9 bg-slate-200 rounded-xl flex items-center justify-center mb-3"><FileText size={18} className="text-slate-400" /></div>
                            <p className="font-bold text-sm text-slate-500 mb-1">Entrust ID Card</p>
                            <p className="text-slate-400 text-[10px]">Pending verification</p>
                            <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase bg-slate-200 rounded-lg px-2.5 py-1.5 text-slate-400">
                                <AlertCircle size={11} /> Locked
                            </span>
                        </div>
                    )}

                    {/* Testimony */}
                    <button onClick={() => setShowTestimonialModal(true)}
                        className="bg-gradient-to-br from-brand-700 to-brand-900 text-white rounded-[22px] p-4 text-left shadow-lg hover:brightness-110 transition-all relative overflow-hidden group">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3"><MessageSquare size={18} /></div>
                        <p className="font-bold text-sm leading-tight mb-1">Write Testimony</p>
                        <p className="text-white/70 text-[10px]">Share what God has done</p>
                        <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-white/20 rounded-lg px-2.5 py-1.5">
                            <MessageSquare size={11} /> Write Now
                        </span>
                    </button>

                    {/* Jewish Calendar — amber (full width row) */}
                    {activeProfileId === user.id && (
                        <button onClick={() => setIsCalendarModalOpen(true)}
                            className="col-span-2 bg-gradient-to-br from-[#8B4500] via-[#C07000] to-[#D97706] text-white rounded-[22px] p-5 text-left shadow-xl hover:brightness-110 transition-all relative overflow-hidden group">
                            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-3"><Calendar size={22} /></div>
                            <p className="font-bold text-base leading-tight mb-1">Jewish Calendar 5786</p>
                            <p className="text-white/80 text-[11px] mb-0.5">Download the official City of Truth Ministries Jewish Calendar.</p>
                            <p className="text-white/60 text-[10px] mb-3">Pro Max Quality Edition.</p>
                            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-[#fff8e8] text-[#7B3F00] rounded-xl px-4 py-2">
                                <Download size={12} /> DOWNLOAD PDF
                            </span>
                            <div className="absolute right-4 bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Calendar size={64} />
                            </div>
                        </button>
                    )}

                    {/* Mobile App — navy (full width row) */}
                    <a href="/COT Ministries.apk" download
                        className="col-span-2 bg-gradient-to-br from-[#1a237e] to-[#3949ab] text-white rounded-[22px] p-5 text-left shadow-xl hover:brightness-110 transition-all relative overflow-hidden group block">
                        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                            <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-white"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.38.07 2.33.76 3.13.8 1.18-.25 2.31-.94 3.56-.84 1.5.12 2.63.72 3.37 1.8-3.09 1.85-2.56 5.93.28 7.05-.55 1.5-1.27 2.98-2.34 4.07zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                        </div>
                        <p className="font-bold text-base leading-tight mb-1">Get the Mobile App</p>
                        <p className="text-white/80 text-[11px] mb-3">Access your ID card offline and get instant ministry updates on your Android device.</p>
                        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 rounded-xl px-4 py-2">
                            <Download size={12} /> Download Our App
                        </span>
                        <div className="absolute right-4 bottom-4 opacity-10 group-hover:opacity-20 transition-opacity text-[64px] font-bold">
                            📱
                        </div>
                    </a>
                </div>

                </div>
            </div>

            {/* ── CARD PREVIEW MODAL (Screenshot 3 style) ── */}
            <AnimatePresence>
                {showCardPreview && (
                    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/70 backdrop-blur-md p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-2xl">
                            {/* Card preview */}
                            <div className="mb-6 w-full cursor-pointer" onClick={() => setCardFlipped(f => !f)}>
                                <EntrustCard3D
                                    name={displayProfile.name}
                                    email={user.email}
                                    location={user.location}
                                    emergency={user.emergency}
                                    uniqueId={displayProfile.id}
                                    memberSince={user.memberSince}
                                    photo={displayProfile.photo}
                                    status={user.status}
                                    isStatic={false}
                                    isBackSide={cardFlipped}
                                />
                                <p className="text-center text-white/60 text-xs mt-3">Tap card to flip</p>
                            </div>
                            {/* Action buttons */}
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => { handleDownloadPDF(); setShowCardPreview(false); }} disabled={isProcessing}
                                    className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-black uppercase tracking-widest text-sm py-4 rounded-2xl transition-all shadow-lg disabled:opacity-60">
                                    <FileText size={18} /> {isProcessing ? 'Generating…' : 'Download Card'}
                                </button>
                                <button onClick={() => { startEditing(); setShowCardPreview(false); }}
                                    className="flex items-center justify-center gap-2 bg-white text-slate-700 hover:bg-slate-50 font-black uppercase tracking-widest text-sm py-4 rounded-2xl transition-all shadow-lg border border-slate-200">
                                    <Edit2 size={18} /> Edit Profile
                                </button>
                            </div>
                            <button onClick={() => setShowCardPreview(false)} className="w-full mt-4 text-white/60 hover:text-white text-sm font-semibold transition-colors">
                                Close
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── CALENDAR GENERATION PROGRESS ── */}
            {isGeneratingCalendar && (
                <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center">
                        <Calendar size={32} className="text-amber-500 mx-auto mb-4" />
                        <h3 className="font-bold text-lg mb-2 text-slate-800">Generating Calendar…</h3>
                        <p className="text-slate-500 text-sm mb-4">Page {generationProgress} of {totalPages}</p>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-amber-500 h-2 rounded-full transition-all duration-300" style={{ width: `${totalPages > 0 ? (generationProgress / totalPages) * 100 : 0}%` }} />
                        </div>
                    </div>
                </div>
            )}

            {/* ── EDIT DETAILS MODAL ── */}
            {isEditing && (
                <div className="fixed inset-0 z-[70] flex flex-col justify-end sm:justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[2rem] p-7 max-w-md w-full mx-auto shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-serif font-bold flex items-center gap-2 text-brand-950">
                                <Edit2 size={18} className="text-brand-500" /> Edit Details
                            </h3>
                            <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>

                        {/* Photo section — no admin approval needed for crop/upload */}
                        <div className="flex flex-col items-center gap-3 mb-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-lg">
                                    <img
                                        src={displayProfile.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayProfile.name)}&background=1e1b4b&color=fff&bold=true&size=256`}
                                        alt={displayProfile.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                                    <Camera size={20} className="text-white" />
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { handlePhotoUpload(e); cancelEditing(); }} />
                                </label>
                            </div>
                            <p className="text-slate-400 text-xs text-center">Tap photo to update — no approval needed</p>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            // Flag that details edit requires admin approval
                            onUpdate({ ...user, ...formData, _pendingApproval: true } as User);
                            setIsEditing(false);
                            alert("✅ Edit request submitted. Changes will be reflected after admin approval.");
                        }} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Full Name</label>
                                <input type="text" value={formData.name ?? user.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-brand-500" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Phone / Contact</label>
                                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-brand-500">
                                    <span className="px-3 py-3 text-sm font-bold text-slate-500 bg-slate-100 border-r border-slate-200 shrink-0">+91</span>
                                    <input type="tel" value={((formData.emergency ?? user.emergency) || '').replace(/^\+91/, '')} onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setFormData(p => ({ ...p, emergency: `+91${v}`, phone: `+91${v}` })); }} className="flex-1 px-3 py-3 bg-transparent outline-none text-sm font-medium text-slate-800" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Email Address</label>
                                <input type="email" value={formData.email ?? user.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-brand-500" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widests block mb-1">Location</label>
                                <input type="text" value={formData.location ?? user.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-brand-500" />
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 font-medium">
                                ⚠️ Detail changes require admin approval and will be reflected after review.
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={cancelEditing} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-all shadow-lg shadow-brand-500/20">Submit for Approval</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

        </div>
    );
};
