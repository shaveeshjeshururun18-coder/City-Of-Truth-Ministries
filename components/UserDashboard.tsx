import React, { useState } from 'react';
import { User, SubProfile } from '../types';
import { EntrustCard3D } from './WorshipperIDCard';
import { Download, Edit2, AlertCircle, CheckCircle, Save, X, FileText, QrCode, LogOut, UploadCloud, Camera, Calendar, Sparkles, Users, UserPlus, Trash2, ShieldCheck } from 'lucide-react';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [showFamilyModal, setShowFamilyModal] = useState(false);
    const [subProfileForm, setSubProfileForm] = useState<Partial<SubProfile>>({});
    const [activeProfileId, setActiveProfileId] = useState<string>(user.id);
    const [isGeneratingCalendar, setIsGeneratingCalendar] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    const [calendarRenderMode, setCalendarRenderMode] = useState<{ mode: 'cover' | 'month', monthData?: any } | null>(null);

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

    const handleCropComplete = (croppedImg: string) => { setFormData(prev => ({ ...prev, photo: croppedImg })); setCroppingImage(null); };
    const handleCropCurrent = () => { if (displayProfile.photo) setCroppingImage(displayProfile.photo); };

    const handleDownloadPDF = async () => {
        setIsProcessing(true);
        const frontNode = document.getElementById('capture-front');
        const backNode = document.getElementById('capture-back');
        if (frontNode && backNode) {
            try {
                const frontDataUrl = await toPng(frontNode, { pixelRatio: 4, quality: 1, backgroundColor: '#ffffff' });
                const backDataUrl = await toPng(backNode, { pixelRatio: 4, quality: 1, backgroundColor: '#ffffff' });
                const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (215 * pdfWidth) / 340;
                const yPos = (pdf.internal.pageSize.getHeight() - pdfHeight) / 2;
                pdf.addImage(frontDataUrl, 'PNG', 0, yPos > 0 ? yPos : 0, pdfWidth, pdfHeight, undefined, 'FAST');
                pdf.addPage();
                pdf.addImage(backDataUrl, 'PNG', 0, yPos > 0 ? yPos : 0, pdfWidth, pdfHeight, undefined, 'FAST');
                pdf.save(`ENTRUST-CARD-${user.id}.pdf`);
            } catch (err) { console.error('PDF generation failed', err); alert('Failed to generate PDF. Please try again.'); }
        } else { alert('Card generation elements not found. Please refresh.'); }
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
            let totalSteps = options.scope === 'full' ? 1 + calendarData.length : 1;
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
            alert(`Failed to generate PDF: ${e.message || 'Unknown error'}. Try generating fewer months or using a PC.`);
        } finally { setCalendarRenderMode(null); setIsGeneratingCalendar(false); }
    };

    const startEditing = () => { setFormData({ phone: user.phone, email: user.email, location: user.location, emergency: user.emergency, photo: user.photo }); setIsEditing(true); };
    const cancelEditing = () => { setIsEditing(false); setFormData({}); };
    const saveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.phone && formData.phone.length !== 10) { alert('Phone number must be exactly 10 digits.'); return; }
        if (formData.emergency && formData.emergency.length !== 10) { alert('Phone number must be exactly 10 digits.'); return; }
        onUpdate({ ...user, ...formData } as User); setIsEditing(false);
    };

    const handleAddSubProfile = (e: React.FormEvent) => {
        e.preventDefault();
        const newId = `${user.id}-${(user.linkedProfiles?.length || 0) + 1}`;
        const newProfile: SubProfile = { id: newId, name: subProfileForm.name || '', role: subProfileForm.role || 'Family Member', dob: subProfileForm.dob, bloodGroup: subProfileForm.bloodGroup };
        const updatedProfiles = [...(user.linkedProfiles || []), newProfile];
        onUpdate({ ...user, linkedProfiles: updatedProfiles } as User);
        setShowFamilyModal(false); setSubProfileForm({});
    };

    const handleDeleteSubProfile = (profileId: string) => {
        if (!confirm('Are you sure you want to remove this family member?')) return;
        const updatedProfiles = user.linkedProfiles?.filter(p => p.id !== profileId) || [];
        onUpdate({ ...user, linkedProfiles: updatedProfiles } as User);
        if (activeProfileId === profileId) setActiveProfileId(user.id);
    };

    return (
        <div className="min-h-screen pt-32 pb-20 bg-slate-950 text-white relative flex flex-col items-center overflow-x-hidden p-4 sm:p-6">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none z-0"></div>
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600 rounded-full blur-[150px] opacity-30 pointer-events-none z-0"></div>
            <div className="absolute top-40 -right-40 w-96 h-96 bg-accent-600 rounded-full blur-[150px] opacity-20 pointer-events-none z-0"></div>

            {croppingImage && (
                <div className="z-[100] relative">
                    <ImageCropper imageSrc={croppingImage} onCropComplete={handleCropComplete} onCancel={() => setCroppingImage(null)} />
                </div>
            )}
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

            <AnimatePresence>
                {showFamilyModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-900 border border-slate-700/50 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-accent-500"></div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold font-serif text-white">Add Member Details</h3>
                                <button onClick={() => setShowFamilyModal(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleAddSubProfile} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Full Name</label>
                                    <input required type="text" value={subProfileForm.name || ''} onChange={(e) => setSubProfileForm({ ...subProfileForm, name: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium text-sm" placeholder="John Doe" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Relation</label>
                                        <select required value={subProfileForm.role || 'Family Member'} onChange={(e) => setSubProfileForm({ ...subProfileForm, role: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm appearance-none">
                                            <option value="Spouse">Spouse</option>
                                            <option value="Son">Son</option>
                                            <option value="Daughter">Daughter</option>
                                            <option value="Parent">Parent</option>
                                            <option value="Family Member">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Blood Group</label>
                                        <select value={subProfileForm.bloodGroup || ''} onChange={(e) => setSubProfileForm({ ...subProfileForm, bloodGroup: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm appearance-none">
                                            <option value="">Select...</option>
                                            <option value="A+">A+</option><option value="A-">A-</option>
                                            <option value="B+">B+</option><option value="B-">B-</option>
                                            <option value="O+">O+</option><option value="O-">O-</option>
                                            <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Date of Birth</label>
                                    <input type="date" value={subProfileForm.dob || ''} onChange={(e) => setSubProfileForm({ ...subProfileForm, dob: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm" />
                                </div>
                                <div className="pt-4">
                                    <Button type="submit" variant="primary" fullWidth className="py-3 shadow-lg shadow-brand-500/20"><UserPlus size={18} className="mr-2" /> Add Member</Button>
                                    <p className="text-[10px] text-center text-slate-500 mt-3">You can set a photo for this member by switching to their profile after creation.</p>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="container mx-auto max-w-6xl relative z-10 w-full px-2 sm:px-6">
                <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/40 border border-slate-800/60 p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] backdrop-blur-xl mb-10 shadow-2xl">
                    <div className="flex items-center gap-6 mb-6 md:mb-0">
                        <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-brand-500 to-accent-600 p-1 hidden sm:block shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                            <img src={user.photo || `https://ui-avatars.com/api/?name=${user.name}&background=1e1b4b&color=fff`} alt="Profile" className="w-full h-full object-cover rounded-[1.2rem]" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mb-1">{user.name} <span className="text-brand-400 text-2xl">Dashboard</span></h1>
                            <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-black/40 border rounded-full backdrop-blur-sm ${user.status === 'Active' ? 'border-green-500/50 text-green-400' : 'border-amber-500/50 text-amber-400'}`}>
                                    {user.status === 'Active' ? <CheckCircle size={12} /> : <AlertCircle size={12} />} {user.status}
                                </span>
                                <span className="text-xs text-slate-400 font-mono tracking-wider">{user.id}</span>
                            </div>
                        </div>
                    </div>
                    <Button onClick={onLogout} variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300 transition-colors w-full sm:w-auto px-6 py-2.5">
                        <LogOut size={16} className="mr-2" /> Secure Logout
                    </Button>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-2 mb-10 flex gap-2 overflow-x-auto snap-x no-scrollbar backdrop-blur-xl shadow-xl w-[calc(100vw-32px)] sm:w-auto -mx-4 sm:mx-0 sm:px-2 px-4 shadow-black/40">
                    <button onClick={() => setActiveProfileId(user.id)} className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold text-[11px] sm:text-xs tracking-widest uppercase whitespace-nowrap snap-center transition-all ${activeProfileId === user.id ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-slate-400 hover:bg-slate-800'}`}>
                        <Users size={16} /> My Primary Card
                    </button>
                    {user.linkedProfiles?.map(pf => (
                        <button key={pf.id} onClick={() => setActiveProfileId(pf.id)} className={`flex justify-between items-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold text-[11px] sm:text-xs tracking-widest uppercase whitespace-nowrap snap-center transition-all ${activeProfileId === pf.id ? 'bg-accent-600 text-white shadow-lg shadow-accent-500/20' : 'text-slate-400 hover:bg-slate-800'}`}>
                            <span className="flex items-center gap-2"><Users size={16} /> {pf.name}</span>
                        </button>
                    ))}
                    <button onClick={() => setShowFamilyModal(true)} className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs tracking-widest uppercase bg-transparent text-slate-500 border border-slate-700 hover:bg-slate-800 hover:text-white transition-all whitespace-nowrap snap-center ml-auto">
                        <UserPlus size={16} /> Family Member
                    </button>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 w-full">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="lg:col-span-7 flex flex-col items-center">
                        <div className="relative group w-full max-w-[380px]">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[420px] bg-gradient-to-r from-brand-500/10 to-accent-500/10 rounded-[3rem] blur-2xl z-0"></div>
                            <div className="relative z-10 w-full flex justify-center">
                                <EntrustCard3D name={displayProfile.name} email={user.email} location={user.location} emergency={user.emergency} uniqueId={displayProfile.id} memberSince={user.memberSince} photo={displayProfile.photo} status={user.status} className={`${user.status === 'Pending Verification' ? 'opacity-90 grayscale-[0.2]' : ''}`} />
                            </div>
                            <div className="absolute top-10 left-6 sm:top-[44px] sm:left-[30px] w-20 sm:w-24 h-28 sm:h-[118px] z-30 group-hover:block transition-all duration-300">
                                <label className="absolute inset-0 bg-brand-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer rounded-lg border border-dashed border-white/50 backdrop-blur-md">
                                    <Camera size={20} className="mb-1 text-accent-400" />
                                    <span className="text-[7px] font-black uppercase tracking-widest text-center px-1">Upload<br/>Photo</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                </label>
                            </div>
                            <div className="mt-8 grid grid-cols-2 gap-4 w-full px-2">
                                <Button onClick={handleDownloadPDF} disabled={user.status !== 'Active' || isProcessing} className="col-span-1 rounded-2xl py-3.5 sm:py-4 px-2 sm:px-6 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] text-[10px] sm:text-[11px] font-black uppercase tracking-widest sm:tracking-[0.2em] transition-all bg-brand-600/90 hover:bg-brand-600 border border-brand-500 backdrop-blur-md">
                                    <FileText size={16} className="-ml-1 mr-1.5 sm:ml-0 sm:mr-2" /> {isProcessing ? 'Wait...' : 'Print ID'}
                                </Button>
                                {activeProfileId === user.id ? (
                                    <Button onClick={startEditing} variant="outline" className="col-span-1 rounded-2xl py-3.5 sm:py-4 px-2 sm:px-6 bg-slate-900/50 hover:bg-slate-800 border border-slate-700 text-[10px] sm:text-[11px] font-black uppercase tracking-widest sm:tracking-[0.2em] backdrop-blur-md">
                                        <Edit2 size={16} className="-ml-1 mr-1.5 sm:ml-0 sm:mr-2" /> Edit Info
                                    </Button>
                                ) : (
                                    <Button onClick={() => handleDeleteSubProfile(displayProfile.id)} variant="outline" className="col-span-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 rounded-2xl py-3.5 sm:py-4 px-2 sm:px-6 text-[10px] sm:text-[11px] font-black uppercase tracking-widest sm:tracking-[0.2em]">
                                        <Trash2 size={16} className="-ml-1 mr-1.5 sm:ml-0 sm:mr-2" /> Remove
                                    </Button>
                                )}
                            </div>
                            {user.status === 'Pending Verification' && (
                                <div className="mt-6 flex items-center justify-center gap-2 text-xs sm:text-sm text-amber-500 font-medium">
                                    <AlertCircle size={16} /> Downloads unlock after verification.
                                </div>
                            )}
                        </div>
                        {user.status === 'Active' && activeProfileId === user.id && (
                            <div className="mt-12 w-full max-w-[380px]">
                                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-700 shadow-2xl rounded-3xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full"></div>
                                    <div className="relative z-10">
                                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4 border border-amber-500/30 backdrop-blur-sm"><Calendar className="text-amber-400" size={20} /></div>
                                        <h4 className="font-serif font-bold text-xl mb-1 text-amber-100">Jewish Calendar 5786</h4>
                                        <p className="text-slate-400 text-xs mb-5 line-clamp-2">Get your high-resolution official calendar copy right here.</p>
                                        <Button onClick={() => setIsCalendarModalOpen(true)} className="w-full bg-gradient-to-r from-amber-600 to-amber-800 text-amber-50 shadow-xl border-amber-500/50 hover:from-amber-500 hover:to-amber-700 py-3 rounded-xl uppercase tracking-widest text-xs font-bold">
                                            <Download size={16} className="mr-2" /> Download Document
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-5 space-y-6 lg:space-y-8 w-full max-w-[400px] lg:max-w-none mx-auto lg:mx-0">
                        {isEditing ? (
                            <div className="bg-slate-900 border border-slate-700/60 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
                                <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2"><Edit2 size={18} className="text-brand-400" /> Essential Details</h3>
                                <div className="space-y-4">
                                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-xs text-amber-200">
                                        <AlertCircle size={14} className="inline mr-1 -mt-0.5" /> For ID security, contact admin to change locked fields.
                                    </div>
                                    <form onSubmit={saveChanges} className="space-y-4 mt-2">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</label>
                                            <input type="text" value={user.email} disabled className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed text-sm font-medium mt-1" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone / WA</label>
                                            <input type="text" value={user.phone} disabled className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed text-sm font-medium mt-1" />
                                        </div>
                                        <div className="flex gap-4 pt-4">
                                            <Button type="button" onClick={cancelEditing} variant="outline" className="flex-1 py-3 border-slate-700 text-slate-300 hover:bg-slate-800 text-xs tracking-widest">Close</Button>
                                            <Button disabled type="submit" variant="primary" className="flex-1 py-3 text-xs tracking-widest bg-brand-600/50 cursor-not-allowed">Saved</Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-brand-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                    <h3 className="text-lg font-serif font-bold text-white mb-2 flex flex-col justify-center items-center">
                                        <QrCode className="text-accent-400 mb-2" size={24} /> Official ID Scanner
                                    </h3>
                                    <p className="text-center text-xs text-slate-400 mb-5">Scan this to check validity &amp; auto-download ID card anytime.</p>
                                    {user.status === 'Active' ? (
                                        <div className="w-full flex justify-center transform transition-transform group-hover:scale-105 duration-500 p-2">
                                            <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-[0_0_40px_rgba(79,70,229,0.2)]">
                                                <img src={`https://quickchart.io/qr?text=${encodeURIComponent(`${window.location.origin}/card/${displayProfile.id}`)}&dark=0f172a&margin=2&size=300&centerImageUrl=${encodeURIComponent('https://city-of-truth-ministries.vercel.app/brand-logo.png')}`} alt="Official QR" className="w-40 sm:w-48 h-40 sm:h-48" crossOrigin="anonymous" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center">
                                            <ShieldCheck className="text-slate-500 mb-3" size={32} />
                                            <p className="text-sm font-bold text-slate-300">Pending Verification</p>
                                            <p className="text-xs text-slate-500 mt-1">QR generates upon approval</p>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-[#0f172a] border border-[#1e293b] p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden hover:border-[#334155] transition-all">
                                    <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-accent-600/20 blur-2xl rounded-full"></div>
                                    <h3 className="text-lg font-serif font-bold text-white mb-4">Ministry Actions</h3>
                                    <div className="space-y-3">
                                        <button onClick={() => setShowTestimonialModal(true)} className="w-full flex items-center justify-between p-4 sm:p-5 bg-slate-800/50 hover:bg-slate-800 rounded-2xl border border-slate-700/50 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors"><MessageSquare size={18} /></div>
                                                <div className="text-left">
                                                    <p className="font-bold text-white text-sm">Write Testimony</p>
                                                    <p className="text-[10px] sm:text-xs text-slate-400">Share your miracle</p>
                                                </div>
                                            </div>
                                            <Sparkles className="text-slate-500 group-hover:text-accent-400" size={16} />
                                        </button>
                                        <a href="/COT Ministries.apk" download className="w-full flex items-center justify-between p-4 sm:p-5 bg-slate-800/50 hover:bg-slate-800 rounded-2xl border border-slate-700/50 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-accent-500/20 text-accent-400 flex items-center justify-center group-hover:bg-accent-500 group-hover:text-white transition-colors"><Download size={18} /></div>
                                                <div className="text-left">
                                                    <p className="font-bold text-white text-sm">Android App</p>
                                                    <p className="text-[10px] sm:text-xs text-slate-400">Read news offline</p>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
