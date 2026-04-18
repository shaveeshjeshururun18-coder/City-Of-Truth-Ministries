import React, { useState } from 'react';
import { User, SubProfile, ViewState } from '../types';
import { EntrustCard3D } from './WorshipperIDCard';
import { Download, Edit2, AlertCircle, CheckCircle, X, FileText, QrCode, LogOut, Camera, Calendar, Users, UserPlus, Trash2, ShieldCheck, MessageSquare, Share2, PlusCircle, ScanLine, Heart, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { TestimonialModal } from './TestimonialModal';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { ImageCropper } from './ImageCropper';
import confetti from 'canvas-confetti';
import { PrintableHebrewCalendar } from './PrintableHebrewCalendar';
import { PrintableReferenceGuide } from './PrintableReferenceGuide';
import { getCalendarData5786 } from './CalendarLogic';
import { CalendarCustomizationModal, CalendarOptions } from './CalendarCustomizationModal';

interface UserDashboardProps {
    user: User;
    onEdit: () => void;
    onUpdate: (updatedUser: User) => void;
    onLogout: () => void;
    setShowLeaderMessage?: (show: boolean) => void;
    setCurrentView?: (view: ViewState) => void;
    activeProfileId: string;
    onProfileSwitch: (id: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, onUpdate, onLogout, setShowLeaderMessage, setCurrentView, activeProfileId, onProfileSwitch }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showTestimonialModal, setShowTestimonialModal] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [croppingImage, setCroppingImage] = useState<string | null>(null);
    const [isNewPhoto, setIsNewPhoto] = useState(false);
    const [showFamilyModal, setShowFamilyModal] = useState(false);
    const [subProfileForm, setSubProfileForm] = useState<Partial<SubProfile>>({});
    const [isGeneratingCalendar, setIsGeneratingCalendar] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    const [calendarRenderMode, setCalendarRenderMode] = useState<{ mode: 'cover' | 'month'; monthData?: any } | null>(null);
    const [idRevealed, setIdRevealed] = useState(false);
    const [showCardPreview, setShowCardPreview] = useState(false);
    const [cardFlipped, setCardFlipped] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [editForm, setEditForm] = useState<{ name: string; email: string; phone: string; location: string; emergency: string }>({ name: '', email: '', phone: '', location: '', emergency: '' });


    const getDisplayProfile = () => {
        if (activeProfileId === user.id) return user;
        const sub = user.linkedProfiles?.find(p => p.id === activeProfileId);
        if (sub) return { ...user, id: sub.id, name: sub.name, photo: sub.photo, bloodGroup: sub.bloodGroup, dob: sub.dob };
        return user;
    };
    const displayProfile = getDisplayProfile();


    // ── PHOTO HANDLERS ──────────────────────────────────────────────────────
    // Crop existing photo → immediate, no approval needed
    const handleCropExisting = () => {
        const photo = displayProfile.photo;
        if (!photo) return;
        setCroppingImage(photo);
        setIsNewPhoto(false);
    };

    // Upload new photo → requires admin approval
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setCroppingImage(reader.result as string);
                setIsNewPhoto(true);
                e.target.value = '';
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedImg: string) => {
        if (isNewPhoto) {
            // New photo → pending admin approval
            if (activeProfileId === user.id) {
                onUpdate({ ...user, pendingPhoto: croppedImg, photoStatus: 'pending' } as User);
                alert('New photo submitted! Waiting for admin approval before it becomes your profile photo.');
            } else {
                // Sub-profile: also submit for approval on main user
                const updatedProfiles = user.linkedProfiles?.map(p =>
                    p.id === activeProfileId ? { ...p, pendingPhoto: croppedImg } : p
                ) || [];
                onUpdate({ ...user, linkedProfiles: updatedProfiles } as User);
                alert('New photo submitted for approval!');
            }
        } else {
            // Crop of existing photo → immediate, no approval
            if (activeProfileId === user.id) {
                onUpdate({ ...user, photo: croppedImg } as User);
            } else {
                const updatedProfiles = user.linkedProfiles?.map(p =>
                    p.id === activeProfileId ? { ...p, photo: croppedImg } : p
                ) || [];
                onUpdate({ ...user, linkedProfiles: updatedProfiles } as User);
            }
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

    const startEditing = () => {
        setEditForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            location: user.location || '',
            emergency: user.emergency || ''
        });
        setShowEditProfileModal(true);
    };

    const handleSubmitProfileEdit = (e: React.FormEvent) => {
        e.preventDefault();
        // Store as pendingEdit — admin must approve before it goes live
        onUpdate({
            ...user,
            pendingEdit: {
                name: editForm.name,
                email: editForm.email,
                phone: editForm.phone,
                location: editForm.location,
                emergency: editForm.emergency,
                submittedAt: new Date().toISOString()
            }
        } as User);
        setShowEditProfileModal(false);
        alert('Profile update submitted! Changes will go live after admin approval.');
    };

    const cancelEditing = () => { setIsEditing(false); setFormData({}); };
    const saveChanges = (e: React.FormEvent) => { e.preventDefault(); onUpdate({ ...user, ...formData } as User); setIsEditing(false); };

    const handleAddSubProfile = (e: React.FormEvent) => {
        e.preventDefault();
        const newId = `${user.id}-${(user.linkedProfiles?.length || 0) + 1}`;
        const newProfile: SubProfile = { id: newId, name: subProfileForm.name || '', role: subProfileForm.role || 'Family Member', dob: subProfileForm.dob, bloodGroup: subProfileForm.bloodGroup };
        onUpdate({ ...user, linkedProfiles: [...(user.linkedProfiles || []), newProfile] } as User);
        setShowFamilyModal(false); setSubProfileForm({});
    };

    const handleDeleteSubProfile = (profileId: string) => {
        if (!confirm('Remove this family member?')) return;
        const updatedProfiles = user.linkedProfiles?.filter(p => p.id !== profileId) || [];
        onUpdate({ ...user, linkedProfiles: updatedProfiles } as User);
        if (activeProfileId === profileId) onProfileSwitch(user.id);
    };

    const handleShare = () => {
        const url = `${window.location.origin}/verify/${displayProfile.id}`;
        if (navigator.share) { navigator.share({ title: `${displayProfile.name} — City of Truth Ministries`, text: 'Check my Entrust ID Card', url }); }
        else { navigator.clipboard.writeText(url); alert('Profile link copied!'); }
    };

    const qrUrl = `${window.location.origin}/verify/${displayProfile.id}`;
    const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrUrl)}&bgcolor=ffffff&color=1a237e&margin=5&format=png`;

    /* ─────────────────────────────────────────────── */
    return (
        <div className="min-h-screen pt-28 pb-20 bg-slate-50 text-brand-900 relative flex flex-col items-center overflow-x-hidden px-3 sm:px-5">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.08] pointer-events-none z-0" />

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
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-accent-500" />
                            <div className="p-6 md:p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold font-serif text-brand-950">Add Family Member</h3>
                                    <button onClick={() => setShowFamilyModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                                </div>
                                <form onSubmit={handleAddSubProfile} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Full Name</label>
                                        <input required type="text" value={subProfileForm.name || ''} onChange={e => setSubProfileForm({ ...subProfileForm, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-brand-500 text-sm font-medium" placeholder="John Doe" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Relation</label>
                                            <select required value={subProfileForm.role || 'Family Member'} onChange={e => setSubProfileForm({ ...subProfileForm, role: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-brand-500 text-sm appearance-none">
                                                <option>Spouse</option><option>Son</option><option>Daughter</option><option>Parent</option><option value="Family Member">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Blood Group</label>
                                            <select value={subProfileForm.bloodGroup || ''} onChange={e => setSubProfileForm({ ...subProfileForm, bloodGroup: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-brand-500 text-sm appearance-none">
                                                <option value="">Select…</option>
                                                <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widests block mb-1">Date of Birth</label>
                                        <input type="date" value={subProfileForm.dob || ''} onChange={e => setSubProfileForm({ ...subProfileForm, dob: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-brand-500 text-sm" />
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
            <div className={`w-full max-w-[98%] 2xl:max-w-[1400px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8`}>
                {/* ── LEFT COLUMN (Profile, Family, Actions, Logout on Desktop) ── */}
                <div className={`${isSidebarCollapsed ? 'hidden lg:hidden' : 'flex'} flex-col gap-5 ${user.linkedProfiles && user.linkedProfiles.length > 0 ? 'lg:col-span-3 lg:pr-4' : 'lg:col-span-4'}`}>

                    <div className="flex items-center gap-3 mb-5 px-1">
                        {/* Primary profile + family avatars */}
                        <div className="relative group shrink-0">
                            <button
                                onClick={() => onProfileSwitch(user.id)}
                                title={user.name}
                                className={`w-14 h-14 rounded-full overflow-hidden border-[3px] shadow-lg focus:outline-none transition-all ${activeProfileId === user.id ? 'border-brand-500 scale-105' : 'border-white hover:scale-105 bg-brand-100'}`}
                            >
                                <img src={user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff&bold=true&size=128`} alt={user.name} className="w-full h-full object-cover pointer-events-none" />
                            </button>
                            {/* Active indicator */}
                            {activeProfileId === user.id && (
                                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${user.status === 'Active' ? 'bg-green-500' : 'bg-amber-400'}`} />
                            )}
                        </div>

                        {/* Family member avatars */}
                        {user.linkedProfiles?.map(pf => (
                            <button key={pf.id} onClick={() => onProfileSwitch(pf.id)} title={pf.name}
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
                            <button onClick={() => onProfileSwitch(user.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-[11px] uppercase whitespace-nowrap transition-all shadow-sm ${activeProfileId === user.id ? 'bg-brand-600 text-white shadow-brand-400/30 shadow-md' : 'bg-white text-brand-400 border border-brand-100'}`}>
                                Me
                            </button>
                            {user.linkedProfiles.map(pf => (
                                <button key={pf.id} onClick={() => onProfileSwitch(pf.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-[11px] uppercase whitespace-nowrap transition-all shadow-sm ${activeProfileId === pf.id ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-brand-400 border border-brand-100'}`}>
                                    {pf.name.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ── FAMILY MEMBERS LIST ── */}
                    {user.linkedProfiles && user.linkedProfiles.length > 0 && (
                        <div className="bg-white/90 rounded-[24px] shadow-sm border border-brand-50 overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-50">
                                <h3 className="font-bold text-brand-900 flex items-center gap-2"><Users size={16} className="text-brand-500" /> Family</h3>
                                <button onClick={() => setShowFamilyModal(true)} className="text-xs font-black text-brand-600 hover:text-brand-800 flex items-center gap-1 uppercase tracking-tighter">
                                    <PlusCircle size={14} /> Add Member
                                </button>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {/* Primary (Me) row */}
                                <button onClick={() => onProfileSwitch(user.id)} className={`w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-all text-left ${activeProfileId === user.id ? 'bg-brand-50' : ''}`}>
                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-100 shrink-0">
                                        <img src={user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1e1b4b&color=fff&bold=true&size=80`} alt={user.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-900 text-sm truncate">{user.name}</p>
                                        <p className="text-[10px] text-slate-400 font-mono">{user.id} · Primary</p>
                                    </div>
                                    {activeProfileId === user.id && <CheckCircle size={16} className="text-brand-500 shrink-0" />}
                                </button>
                                {/* Sub-profiles */}
                                {user.linkedProfiles.map(pf => (
                                    <div key={pf.id} className={`flex items-center gap-3 px-5 py-3.5 group ${activeProfileId === pf.id ? 'bg-accent-50' : 'hover:bg-slate-50'} transition-all`}>
                                        <button onClick={() => onProfileSwitch(pf.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 shrink-0">
                                                <img src={pf.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(pf.name)}&background=5b47d0&color=fff&bold=true&size=80`} alt={pf.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-900 text-sm truncate">{pf.name}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">{pf.id} · {pf.role || 'Family'}</p>
                                            </div>
                                            {activeProfileId === pf.id && <CheckCircle size={16} className="text-accent-500 shrink-0" />}
                                        </button>
                                        <button onClick={() => handleDeleteSubProfile(pf.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-all ml-2 shrink-0">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── PENDING VERIFICATION NOTICE ── */}
                    {user.status === 'Pending Verification' && activeProfileId === user.id && (
                        <div className="flex items-start gap-2 bg-brand-50 border border-brand-200 rounded-2xl px-4 py-3 mb-1 animate-pulse">
                            <ShieldAlert size={14} className="text-brand-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-black text-brand-700 uppercase tracking-wide">Account Under Review</p>
                                <p className="text-[10px] text-brand-600 mt-0.5">Your membership is awaiting admin verification.</p>
                            </div>
                        </div>
                    )}

                    {/* ── PENDING EDIT NOTICE ── */}
                    {user.pendingEdit && activeProfileId === user.id && (
                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-1">
                            <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-black text-amber-700 uppercase tracking-wide">Profile Edit Pending</p>
                                <p className="text-[10px] text-amber-600 mt-0.5">Your update is awaiting admin approval.</p>
                            </div>
                        </div>
                    )}


                    {/* ── PROFILE & LOGOUT ── */}
                    <div className="flex flex-col gap-3 mt-4">
                        {/* Edit Profile — only for primary profile */}
                        {activeProfileId === user.id && (
                            <button
                                onClick={startEditing}
                                className="w-full flex items-center justify-center gap-2 bg-white border border-brand-200 text-brand-600 hover:bg-brand-50 hover:border-brand-400 rounded-2xl py-3.5 font-bold text-[10px] tracking-[0.3em] uppercase transition-all shadow-sm"
                            >
                                <Edit2 size={15} /> Edit Profile
                            </button>
                        )}
                        {/* Add another account */}
                        <button
                            onClick={() => setCurrentView && setCurrentView(ViewState.AUTH)}
                            className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-brand-200 hover:text-brand-600 rounded-2xl py-3.5 font-bold text-[10px] tracking-[0.3em] uppercase transition-all shadow-sm"
                        >
                            <UserPlus size={15} /> Add Account
                        </button>
                        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-white/50 border border-red-50 text-red-400 hover:bg-red-50/50 hover:border-red-100 hover:text-red-600 rounded-2xl py-3.5 font-bold text-[10px] tracking-[0.3em] uppercase transition-all shadow-sm">
                            <LogOut size={15} /> Terminate Session
                        </button>
                    </div>
                </div>

                {/* ── RIGHT COLUMN (Wallet Card & Content on Desktop) ── */}
                <div className={`${isSidebarCollapsed ? 'lg:col-span-12' : (user.linkedProfiles && user.linkedProfiles.length > 0 ? 'lg:col-span-9' : 'lg:col-span-8')} flex flex-col gap-5 transition-all duration-500 relative`}>

                    {/* Expand/Collapse Toggle Button for Desktop */}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        title={isSidebarCollapsed ? "Expand Sidebar" : "Minimize Sidebar"}
                        className="hidden lg:flex absolute -left-4 top-0 -translate-y-1/2 z-20 bg-white shadow-lg border border-brand-100 rounded-full p-2 text-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                    >
                        {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                    </button>

                    {/* ════════════════════════════════════
                    mAadhaar-Style Wallet Card
                ════════════════════════════════════ */}
                    <div className="bg-white/90 rounded-[28px] shadow-xl mb-5 overflow-hidden border border-brand-50">
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
                            <div className="w-full xl:w-1/2">
                                {/* Stacked card visual + tap to reveal (MOBILE ONLY) */}
                                <div className="md:hidden relative cursor-pointer" onClick={() => setShowCardPreview(true)}>
                                    <div className="absolute inset-x-4 top-2 h-10 bg-gradient-to-r from-brand-200 to-accent-200 rounded-2xl opacity-40 blur-sm" />
                                    <div className="absolute inset-x-2 top-1 h-10 bg-gradient-to-r from-brand-300 to-accent-300 rounded-2xl opacity-30" />
                                    <div className="relative bg-gradient-to-r from-brand-900 to-brand-700 rounded-2xl h-24 flex items-center justify-center overflow-hidden border border-white/20">
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
                                </div>
                            </div>

                            {/* Right: QR Code */}
                            <div className="w-full xl:w-1/2 flex flex-col items-center justify-center border-t xl:border-t-0 xl:border-l border-brand-50 pt-6 xl:pt-0 xl:pl-6">
                                {user.status === 'Active' ? (
                                    <div className="flex flex-col items-center">
                                        <div className="relative inline-block bg-white rounded-3xl p-4 border border-brand-100 shadow-xl shadow-brand-900/5 hover:scale-105 transition-all">
                                            <img src={qrImgSrc} alt="QR Code" className="w-56 h-56 block mx-auto" crossOrigin="anonymous" />
                                        </div>
                                        <p className="text-[10px] text-brand-300 font-bold uppercase tracking-widest mt-4">Scan to Verify</p>
                                    </div>
                                ) : (
                                    <div className="py-8 flex flex-col items-center text-center">
                                        <ShieldCheck size={48} className="text-brand-100 mb-4" />
                                        <p className="font-bold text-brand-400">QR Locked</p>
                                        <p className="text-xs text-brand-300 mt-1">Pending admin verification</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Photo action buttons — two distinct flows */}
                        <div className="flex flex-wrap justify-center gap-2 pb-3">
                            {/* Crop existing — no approval */}
                            {displayProfile.photo && (
                                <button
                                    onClick={handleCropExisting}
                                    className="flex items-center gap-1.5 bg-brand-50 hover:bg-brand-100 border border-brand-100 hover:border-brand-300 text-brand-500 hover:text-brand-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-sm"
                                >
                                    <Camera size={12} /> Crop Photo
                                </button>
                            )}
                            {/* Upload new — needs approval */}
                            <label className="flex items-center gap-1.5 cursor-pointer bg-amber-50 hover:bg-amber-100 border border-amber-100 hover:border-amber-300 text-amber-600 hover:text-amber-800 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-sm">
                                <UploadCloud size={12} /> Upload New Photo
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                            </label>
                        </div>
                        {/* Pending photo notice */}
                        {user.photoStatus === 'pending' && activeProfileId === user.id && (
                            <div className="mx-4 mb-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                                <AlertCircle size={14} className="text-amber-500 shrink-0" />
                                <p className="text-[10px] text-amber-700 font-bold">New photo pending admin approval</p>
                            </div>
                        )}

                        {/* Action buttons row (mAadhaar style) */}
                        {user.status === 'Active' && (
                            <div className="grid grid-cols-4 gap-1 px-4 pb-5 pt-3">
                                {[
                                    { icon: <Share2 size={20} />, label: 'Share', action: handleShare },
                                    { icon: <Download size={20} />, label: 'Download', action: handleDownloadPDF, loading: isProcessing },
                                    { icon: <QrCode size={20} />, label: 'QR Code', action: () => { const a = document.createElement('a'); a.href = qrImgSrc; a.download = `COT-QR-${displayProfile.id}.png`; a.target = '_blank'; a.click(); } },
                                    {
                                        icon: <div className="relative"><MessageSquare size={20} className="text-brand-500" /><div className="absolute inset-0 bg-brand-400 blur-sm rounded-full -z-10 animate-pulse" /></div>,
                                        label: "Leader Message",
                                        action: () => setShowLeaderMessage?.(true)
                                    },
                                    {
                                        icon: <div className="relative"><ShieldCheck size={20} className="text-emerald-500" /></div>,
                                        label: "Verify Membership",
                                        action: () => setCurrentView?.(ViewState.HOME)
                                    },
                                    {
                                        icon: <div className="relative"><CheckCircle size={20} className="text-amber-500" /><div className="absolute inset-0 bg-amber-400 blur-sm rounded-full -z-10 animate-pulse" /></div>,
                                        label: <span className="bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent font-black shadow-sm">VERIFIED MEMBER</span>,
                                        action: () => { }
                                    },
                                ].map(({ icon, label, action, loading }, i) => (
                                    <button key={i} onClick={action} disabled={loading}
                                        className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-2xl bg-white/40 hover:bg-white hover:text-brand-700 text-brand-400 transition-all disabled:opacity-60 border border-brand-50/10 hover:border-brand-400/20 shadow-sm hover:shadow-md">
                                        {loading ? <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /> : icon}
                                        <span className="text-[9px] font-black uppercase tracking-tight leading-tight text-center">{loading ? 'Wait…' : label}</span>
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
                            <p className="font-bold text-sm leading-tight mb-1 font-serif tracking-tight">Write Testimony</p>
                            <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Share the Light</p>
                            <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-white/20 rounded-lg px-2.5 py-1.5 backdrop-blur-md">
                                <MessageSquare size={11} /> Launch Form
                            </span>
                        </button>



                        {/* Jewish Calendar — brand-centric */}
                        {user.status === 'Active' && activeProfileId === user.id && (
                            <button onClick={() => setIsCalendarModalOpen(true)}
                                className="col-span-2 bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 text-white rounded-[22px] p-5 text-left shadow-xl hover:brightness-110 transition-all relative overflow-hidden group">
                                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-3"><Calendar size={22} /></div>
                                <p className="font-bold text-base leading-tight mb-1 font-serif tracking-tight">Jewish Calendar 5786</p>
                                <p className="text-white/80 text-[11px] mb-0.5 font-light">Official City of Truth Ministries Calendar Download.</p>
                                <p className="text-white/60 text-[10px] mb-3 font-black uppercase tracking-widest">Pro Max Quality Edition</p>
                                <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white text-brand-600 rounded-xl px-5 py-2.5 shadow-lg">
                                    <Download size={14} /> DOWNLOAD DOCUMENT
                                </span>
                                <div className="absolute right-4 bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Calendar size={64} />
                                </div>
                            </button>
                        )}

                        {/* Mobile App — light sky-brand */}
                        <a href="/COT Ministries.apk" download
                            className="col-span-2 bg-gradient-to-br from-brand-400 to-brand-700 text-white rounded-[22px] p-5 text-left shadow-xl hover:brightness-110 transition-all relative overflow-hidden group block">
                            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                                <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-white"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.38.07 2.33.76 3.13.8 1.18-.25 2.31-.94 3.56-.84 1.5.12 2.63.72 3.37 1.8-3.09 1.85-2.56 5.93.28 7.05-.55 1.5-1.27 2.98-2.34 4.07zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                            </div>
                            <p className="font-bold text-base leading-tight mb-1 font-serif tracking-tight">Android Application</p>
                            <p className="text-white/80 text-[11px] mb-3 font-light">Access your identity offline with the COT Android experience.</p>
                            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white text-brand-500 rounded-xl px-4 py-2 shadow-inner">
                                <Download size={12} /> Get official APK
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
                    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/80 p-4">
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
                                    className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-black uppercase tracking-widest text-sm py-5 rounded-2xl transition-all shadow-xl disabled:opacity-60">
                                    <Download size={18} /> {isProcessing ? 'Wait…' : 'Generate PDF'}
                                </button>
                                <button onClick={() => { startEditing(); setShowCardPreview(false); }}
                                    className="flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 hover:bg-white/20 font-black uppercase tracking-widest text-sm py-5 rounded-2xl transition-all shadow-lg">
                                    <Edit2 size={18} /> Modify Identity
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
                <div className="fixed inset-0 z-[200] bg-black/80 flex flex-col items-center justify-center">
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

            {/* ── EDIT PROFILE MODAL (with admin approval) ── */}
            <AnimatePresence>
                {showEditProfileModal && (
                    <div className="fixed inset-0 z-[70] flex flex-col justify-end sm:justify-center bg-black/60 p-4">
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white rounded-[2rem] p-7 max-w-md w-full mx-auto shadow-2xl">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-serif font-bold flex items-center gap-2 text-brand-950">
                                    <Edit2 size={18} className="text-brand-500" /> Edit Profile
                                </h3>
                                <button onClick={() => setShowEditProfileModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
                                <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700">
                                    Changes will be submitted for <strong>admin approval</strong> before going live. Your current details remain active until then.
                                </p>
                            </div>

                            <form onSubmit={handleSubmitProfileEdit} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Full Name</label>
                                    <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-brand-500 text-sm font-medium" placeholder="Your full name" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Email</label>
                                    <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-brand-500 text-sm font-medium" placeholder="your@email.com" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Phone</label>
                                        <input type="tel" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-brand-500 text-sm font-medium" placeholder="Phone number" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Location</label>
                                        <input type="text" value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-brand-500 text-sm font-medium" placeholder="City" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widests block mb-1">Emergency Contact</label>
                                    <input type="text" value={editForm.emergency} onChange={e => setEditForm({ ...editForm, emergency: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-brand-500 text-sm font-medium" placeholder="Emergency contact number" />
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <Button type="submit" variant="primary" fullWidth className="py-3 shadow-lg shadow-brand-500/20">
                                        <Send size={14} className="mr-2" /> Submit for Approval
                                    </Button>
                                    <button type="button" onClick={() => setShowEditProfileModal(false)} className="px-5 py-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm font-bold transition-all">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};
