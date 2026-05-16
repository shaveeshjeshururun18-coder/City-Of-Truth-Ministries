import React, { useEffect, useState } from 'react';
import { User, SubProfile } from '../types';
import { EntrustCard3D } from './WorshipperIDCard';
import { Download, Edit2, AlertCircle, CheckCircle, X, FileText, QrCode, LogOut, Camera, Calendar, Users, UserPlus, Trash2, ShieldCheck, MessageSquare, Share2, PlusCircle, ScanLine, UploadCloud, LogIn, Flag } from 'lucide-react';
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
import { addCenteredCardPage, waitForNodeImages } from './pdfCardUtils';
import { CommunityProfileForm } from './CommunityProfileForm';

interface UserDashboardProps {
    user: User;
    onEdit: () => void;
    onUpdate: (updatedUser: User) => void;
    onLogout: () => void;
    onOpenScanner?: () => void;
    initialProfileId?: string;
    onGoToLogin?: () => void;
}

const FAMILY_RELATIONSHIP_OPTIONS = {
    immediate: ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister'],
    extended: ['Grandfather', 'Grandmother', 'Father-in-law', 'Mother-in-law', 'Uncle', 'Aunt', 'Cousin'],
    others: ['Guardian', 'Other']
};

const TAMIL_NADU_LOCATIONS = [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Erode', 'Tirunelveli',
    'Thoothukudi', 'Vellore', 'Dindigul', 'Thanjavur', 'Kancheepuram', 'Kanyakumari',
    'Namakkal', 'Karur', 'Nagapattinam', 'Cuddalore', 'Villupuram', 'Dharmapuri', 'Krishnagiri',
    'Sivaganga', 'Virudhunagar', 'Ramanathapuram', 'The Nilgiris', 'Tiruppur', 'Ariyalur',
    'Pudukkottai', 'Perambalur', 'Tenkasi', 'Ranipet', 'Tirupattur', 'Mayiladuthurai', 'Valparai'
];

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, onUpdate, onLogout, onOpenScanner, initialProfileId, onGoToLogin }) => {
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
    const [showCommunityProfileForm, setShowCommunityProfileForm] = useState(false);
    const [showDashboardIntro, setShowDashboardIntro] = useState(false);
    const [dashboardTourStepIndex, setDashboardTourStepIndex] = useState<number | null>(null);
    const [dashboardTourRect, setDashboardTourRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
    const [photoUpdateMode, setPhotoUpdateMode] = useState<'edit-existing' | 'add-new' | null>(null);
    const canAccessEntrustFeatures = user.status === 'Active';
    const DASHBOARD_TOUR_STEPS = [
        { selector: '#dashboard-edit-btn', title: 'Edit Details', text: 'Update your profile and submit changes for admin approval.' },
        { selector: '#dashboard-testimony-btn', title: 'Write Testimony', text: 'Share your testimony and track approval in admin review.' },
        { selector: '#dashboard-member-form-btn', title: 'User Book Member Form', text: 'Open the themed member form in the User Book column and submit your ministry profile details.' },
        { selector: '#dashboard-share-btn', title: 'Share Profile', text: 'Send your secure profile login link to family members.' },
        { selector: '#dashboard-login-btn', title: 'Profile Login', text: 'Quickly open login page to switch accounts.' },
    ];

    useEffect(() => {
        if (!initialProfileId) {
            setActiveProfileId(user.id);
            return;
        }
        const isPrimary = initialProfileId === user.id;
        const isLinked = !!user.linkedProfiles?.some(p => p.id === initialProfileId);
        setActiveProfileId((isPrimary || isLinked) ? initialProfileId : user.id);
    }, [initialProfileId, user.id, user.linkedProfiles]);

    useEffect(() => {
        const key = `cot_dashboard_tour_seen_${user.id}`;
        const seen = localStorage.getItem(key) === '1';
        if (!seen) setShowDashboardIntro(true);
    }, [user.id]);

    useEffect(() => {
        if (dashboardTourStepIndex === null) return;
        const step = DASHBOARD_TOUR_STEPS[dashboardTourStepIndex];
        const target = document.querySelector(step.selector) as HTMLElement | null;
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [dashboardTourStepIndex]);

    useEffect(() => {
        if (dashboardTourStepIndex === null) return;
        const updateRect = () => {
            const step = DASHBOARD_TOUR_STEPS[dashboardTourStepIndex];
            const target = document.querySelector(step.selector) as HTMLElement | null;
            if (!target) {
                setDashboardTourRect(null);
                return;
            }
            const rect = target.getBoundingClientRect();
            setDashboardTourRect({
                top: rect.top - 8,
                left: rect.left - 8,
                width: rect.width + 16,
                height: rect.height + 16
            });
        };
        const timer = setTimeout(updateRect, 220);
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect, true);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect, true);
        };
    }, [dashboardTourStepIndex]);

    const markDashboardTourSeen = () => {
        localStorage.setItem(`cot_dashboard_tour_seen_${user.id}`, '1');
    };

    const startDashboardTour = () => {
        markDashboardTourSeen();
        setShowDashboardIntro(false);
        setDashboardTourStepIndex(0);
    };

    const skipDashboardTour = () => {
        markDashboardTourSeen();
        setShowDashboardIntro(false);
        setDashboardTourStepIndex(null);
        setDashboardTourRect(null);
    };

    const getDisplayProfile = () => {
        if (activeProfileId === user.id) return user;
        const sub = user.linkedProfiles?.find(p => p.id === activeProfileId);
        if (sub) return { ...user, id: sub.id, name: sub.name, photo: sub.photo, bloodGroup: sub.bloodGroup, dob: sub.dob };
        return user;
    };
    const getSafePhotoSrc = (photo: string | undefined, name: string, size: number, bg = '1e1b4b') => {
        const candidate = (photo || '').trim();
        if (candidate.startsWith('data:image/')) return candidate;
        if (candidate.startsWith('blob:')) return candidate;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&bold=true&size=${size}`;
    };
    const getAvatarInitials = (name?: string) => {
        const parts = (name || '').trim().split(/\s+/).filter(Boolean);
        if (parts.length >= 2) return `${parts[0][0] || 'C'}${parts[1][0] || 'T'}`.toUpperCase();
        return ((parts[0] || 'CT').slice(0, 2)).toUpperCase();
    };
    const displayProfile = getDisplayProfile();


    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, mode: 'edit-existing' | 'add-new') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoUpdateMode(mode);
                setCroppingImage(reader.result as string);
                e.target.value = '';
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedImg: string) => {
        if (photoUpdateMode === 'add-new' && activeProfileId === user.id) {
            onUpdate({
                ...user,
                pendingProfileUpdate: {
                    ...(user.pendingProfileUpdate || {}),
                    photo: croppedImg
                }
            } as User);
            alert('New photo submitted for admin approval.');
        } else if (activeProfileId === user.id) {
            onUpdate({ ...user, photo: croppedImg, pendingProfileUpdate: { ...(user.pendingProfileUpdate || {}), photo: undefined } } as User);
            alert('Photo updated successfully.');
        } else {
            const updatedProfiles = user.linkedProfiles?.map(p => p.id === activeProfileId ? { ...p, photo: croppedImg } : p) || [];
            onUpdate({ ...user, linkedProfiles: updatedProfiles } as User);
            alert('Profile photo updated successfully.');
        }
        setPhotoUpdateMode(null);
        setCroppingImage(null);
    };

    const handleDownloadPDF = async () => {
        setIsProcessing(true);
        const frontNode = document.getElementById('capture-front');
        const backNode = document.getElementById('capture-back');
        if (frontNode && backNode) {
            try {
                await Promise.all([waitForNodeImages(frontNode), waitForNodeImages(backNode)]);
                await new Promise(r => setTimeout(r, 600));
                // Explicit dimensions ensure off-screen nodes render correctly in all browsers
                const opts = { pixelRatio: 3, quality: 1, backgroundColor: '#ffffff', cacheBust: true, width: 680, height: 430 };
                const frontDataUrl = await toPng(frontNode, opts);
                const backDataUrl = await toPng(backNode, opts);
                const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
                addCenteredCardPage(pdf, frontDataUrl, 'PNG', true);
                addCenteredCardPage(pdf, backDataUrl, 'PNG', false);
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
                    addCenteredCardPage(pdf2, frontDataUrl2, 'JPEG', true);
                    addCenteredCardPage(pdf2, backDataUrl2, 'JPEG', false);
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
        const pending = user.pendingProfileUpdate || {};
        setFormData({
            name: pending.name ?? user.name,
            phone: pending.phone ?? user.phone,
            email: pending.email ?? user.email,
            location: pending.location ?? user.location,
            emergency: pending.emergency ?? user.emergency,
            photo: user.photo
        });
        setIsEditing(true);
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
        if (activeProfileId === profileId) setActiveProfileId(user.id);
    };

    const handleShare = () => {
        const url = `${window.location.origin}/auth?view=login&identifier=${encodeURIComponent(displayProfile.id)}`;
        if (navigator.share) {
            navigator.share({
                title: `${displayProfile.name} — City of Truth Ministries`,
                text: `Login with this unique member profile link: ${displayProfile.id}`,
                url
            });
        } else {
            navigator.clipboard.writeText(url);
            alert('Profile login link copied!');
        }
    };

    const handleExportProfileDetailsPDF = () => {
        try {
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 14;
            const contentWidth = pageWidth - margin * 2;
            const familyProfiles = user.linkedProfiles || [];
            const generatedAt = new Date().toLocaleString();
            const formatValue = (value?: string, fallback = 'Not provided') => {
                const normalized = `${value || ''}`.trim();
                return normalized || fallback;
            };
            const getInitials = (name?: string) => {
                const parts = formatValue(name, 'City of Truth').split(/\s+/).filter(Boolean);
                return (parts[0]?.[0] || 'C') + (parts[1]?.[0] || parts[0]?.[1] || 'T');
            };

            let y = 0;
            let pageNumber = 1;

            const drawPageShell = (variant: 'hero' | 'standard') => {
                pdf.setFillColor(248, 250, 252);
                pdf.rect(0, 0, pageWidth, pageHeight, 'F');

                if (variant === 'hero') {
                    pdf.setFillColor(15, 23, 42);
                    pdf.rect(0, 0, pageWidth, 52, 'F');
                    pdf.setFillColor(79, 70, 229);
                    pdf.roundedRect(margin, 12, contentWidth, 26, 6, 6, 'F');
                    pdf.setFillColor(245, 158, 11);
                    pdf.circle(pageWidth - 26, 18, 7, 'F');
                    pdf.setTextColor(255, 255, 255);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(20);
                    pdf.text('Family Portfolio', margin + 6, 24);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(9.5);
                    pdf.text('City of Truth Ministries • Professional family profile summary', margin + 6, 31);
                    y = 60;
                    return;
                }

                pdf.setFillColor(15, 23, 42);
                pdf.rect(0, 0, pageWidth, 18, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(11);
                pdf.text('City of Truth Ministries', margin, 10.5);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(8);
                pdf.text(`Family Portfolio • ${user.id}`, margin, 15);
                pdf.setTextColor(71, 85, 105);
                y = 26;
            };

            const addNewPage = () => {
                pdf.addPage();
                pageNumber += 1;
                drawPageShell('standard');
            };

            const ensureSpace = (requiredHeight: number) => {
                if (y + requiredHeight <= pageHeight - 18) return;
                addNewPage();
            };

            const drawChip = (x: number, top: number, width: number, label: string, value: string) => {
                pdf.setFillColor(255, 255, 255);
                pdf.setDrawColor(226, 232, 240);
                pdf.roundedRect(x, top, width, 17, 4, 4, 'FD');
                pdf.setTextColor(100, 116, 139);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(7);
                pdf.text(label.toUpperCase(), x + 4, top + 5.2);
                pdf.setTextColor(15, 23, 42);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(10.5);
                pdf.text(pdf.splitTextToSize(value, width - 8), x + 4, top + 10.8);
            };

            const drawSectionTitle = (title: string, subtitle: string) => {
                ensureSpace(16);
                pdf.setTextColor(30, 41, 59);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(13);
                pdf.text(title, margin, y);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(8.5);
                pdf.setTextColor(100, 116, 139);
                pdf.text(subtitle, margin, y + 5);
                y += 10;
            };

            const drawProfileCard = (
                title: string,
                subtitle: string,
                accent: [number, number, number],
                profile: { name?: string; id?: string; role?: string; email?: string; phone?: string; emergency?: string; location?: string; bloodGroup?: string; dob?: string; status?: string },
                extraEntries: Array<[string, string]>
            ) => {
                const entries: Array<[string, string]> = [
                    ['Member ID', formatValue(profile.id)],
                    ['Role', formatValue(profile.role, 'Member')],
                    ['Email', formatValue(profile.email)],
                    ['Phone', formatValue(profile.phone)],
                    ['Emergency', formatValue(profile.emergency)],
                    ['Location', formatValue(profile.location)],
                    ['Blood Group', formatValue(profile.bloodGroup)],
                    ['Date of Birth', formatValue(profile.dob)],
                    ...extraEntries,
                ];
                const columns = 2;
                const columnGap = 8;
                const innerX = margin + 7;
                const colWidth = (contentWidth - 14 - columnGap) / columns;
                const topPadding = 22;
                const rowGap = 4;
                const bottomPadding = 8;
                const perColumn = Math.ceil(entries.length / columns);
                const measureColumnHeight = (columnEntries: Array<[string, string]>) => columnEntries.reduce((height, [label, value]) => {
                    const lines = pdf.splitTextToSize(value, colWidth);
                    const labelHeight = 4;
                    const valueHeight = Math.max(lines.length, 1) * 4.2;
                    return height + labelHeight + valueHeight + rowGap;
                }, 0);
                const leftEntries = entries.slice(0, perColumn);
                const rightEntries = entries.slice(perColumn);
                const bodyHeight = Math.max(measureColumnHeight(leftEntries), measureColumnHeight(rightEntries));
                const cardHeight = topPadding + bodyHeight + bottomPadding;

                ensureSpace(cardHeight + 8);

                pdf.setFillColor(255, 255, 255);
                pdf.setDrawColor(226, 232, 240);
                pdf.roundedRect(margin, y, contentWidth, cardHeight, 6, 6, 'FD');
                pdf.setFillColor(accent[0], accent[1], accent[2]);
                pdf.roundedRect(margin, y, contentWidth, 16, 6, 6, 'F');
                pdf.setFillColor(255, 255, 255);
                pdf.circle(margin + 11, y + 8, 5.5, 'F');
                pdf.setTextColor(accent[0], accent[1], accent[2]);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(10);
                pdf.text(getInitials(profile.name).toUpperCase(), margin + 8.2, y + 9.5);
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(11);
                pdf.text(title, margin + 20, y + 7);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(8);
                pdf.text(subtitle, margin + 20, y + 11.8);
                pdf.setTextColor(15, 23, 42);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(13);
                pdf.text(formatValue(profile.name), margin + 7, y + 24);

                const drawColumn = (columnEntries: Array<[string, string]>, x: number) => {
                    let columnY = y + 31;
                    columnEntries.forEach(([label, value]) => {
                        pdf.setTextColor(100, 116, 139);
                        pdf.setFont('helvetica', 'bold');
                        pdf.setFontSize(7);
                        pdf.text(label.toUpperCase(), x, columnY);
                        columnY += 4;
                        pdf.setTextColor(30, 41, 59);
                        pdf.setFont('helvetica', 'normal');
                        pdf.setFontSize(9);
                        const valueLines = pdf.splitTextToSize(value, colWidth);
                        pdf.text(valueLines, x, columnY);
                        columnY += Math.max(valueLines.length, 1) * 4.2 + rowGap;
                    });
                };

                drawColumn(leftEntries, innerX);
                drawColumn(rightEntries, innerX + colWidth + columnGap);
                y += cardHeight + 6;
            };

            const drawFamilyCards = () => {
                if (familyProfiles.length === 0) {
                    ensureSpace(28);
                    pdf.setFillColor(255, 255, 255);
                    pdf.setDrawColor(226, 232, 240);
                    pdf.roundedRect(margin, y, contentWidth, 22, 6, 6, 'FD');
                    pdf.setTextColor(71, 85, 105);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(11);
                    pdf.text('No linked family profiles yet', margin + 8, y + 10);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(8.5);
                    pdf.text('Add family members from the dashboard to include them in future portfolio exports.', margin + 8, y + 16);
                    y += 28;
                    return;
                }

                const gap = 6;
                const cardWidth = (contentWidth - gap) / 2;
                const drawFamilyCard = (profile: SubProfile, index: number, x: number, top: number) => {
                    const entries: Array<[string, string]> = [
                        ['Member ID', formatValue(profile.id)],
                        ['Relation', formatValue(profile.role, 'Family Member')],
                        ['Date of Birth', formatValue(profile.dob)],
                        ['Blood Group', formatValue(profile.bloodGroup)],
                    ];
                    const bodyStart = top + 21;
                    let localY = bodyStart;
                    pdf.setFillColor(255, 255, 255);
                    pdf.setDrawColor(226, 232, 240);
                    pdf.roundedRect(x, top, cardWidth, 43, 6, 6, 'FD');
                    pdf.setFillColor(59, 130, 246);
                    pdf.roundedRect(x, top, cardWidth, 14, 6, 6, 'F');
                    pdf.setTextColor(255, 255, 255);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(10);
                    pdf.text(`Family ${index + 1}`, x + 6, top + 7.5);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(7.5);
                    pdf.text(formatValue(profile.role, 'Family Member'), x + 6, top + 11.5);
                    pdf.setTextColor(15, 23, 42);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(11);
                    pdf.text(formatValue(profile.name), x + 6, localY);
                    localY += 5;
                    entries.forEach(([label, value]) => {
                        pdf.setTextColor(100, 116, 139);
                        pdf.setFont('helvetica', 'bold');
                        pdf.setFontSize(6.8);
                        pdf.text(label.toUpperCase(), x + 6, localY);
                        localY += 3.5;
                        pdf.setTextColor(30, 41, 59);
                        pdf.setFont('helvetica', 'normal');
                        pdf.setFontSize(8.5);
                        pdf.text(pdf.splitTextToSize(value, cardWidth - 12), x + 6, localY);
                        localY += 6;
                    });
                };

                for (let i = 0; i < familyProfiles.length; i += 2) {
                    ensureSpace(49);
                    drawFamilyCard(familyProfiles[i], i, margin, y);
                    if (familyProfiles[i + 1]) {
                        drawFamilyCard(familyProfiles[i + 1], i + 1, margin + cardWidth + gap, y);
                    }
                    y += 49;
                }
            };

            drawPageShell('hero');

            const chipGap = 6;
            const chipWidth = (contentWidth - chipGap) / 2;
            drawChip(margin, y, chipWidth, 'Primary Member', user.id);
            drawChip(margin + chipWidth + chipGap, y, chipWidth, 'Active Profile', `${displayProfile.name} • ${displayProfile.id}`);
            y += 21;
            drawChip(margin, y, chipWidth, 'Family Members', `${familyProfiles.length}`);
            drawChip(margin + chipWidth + chipGap, y, chipWidth, 'Generated', generatedAt);
            y += 26;

            drawSectionTitle('Primary member profile', 'Core contact and ministry details for the main account holder.');
            drawProfileCard('Primary Member', `Status • ${formatValue(user.status, 'Pending Verification')}`, [79, 70, 229], {
                name: user.name,
                id: user.id,
                role: user.role,
                email: user.email,
                phone: user.phone || user.emergency,
                emergency: user.emergency,
                location: user.location,
                bloodGroup: user.bloodGroup,
                dob: user.dob,
                status: user.status,
            }, [
                ['Member Since', formatValue(user.memberSince || user.joinedDate)],
                ['Status', formatValue(user.status)],
            ]);

            drawSectionTitle('Active profile spotlight', 'The profile currently selected inside the dashboard at export time.');
            drawProfileCard('Active Profile', displayProfile.id === user.id ? 'Primary account in focus' : 'Linked family account in focus', [14, 116, 144], {
                name: displayProfile.name,
                id: displayProfile.id,
                role: displayProfile.role || 'Family Member',
                phone: displayProfile.id === user.id ? (user.phone || user.emergency) : undefined,
                emergency: displayProfile.id === user.id ? user.emergency : undefined,
                location: displayProfile.id === user.id ? user.location : undefined,
                bloodGroup: displayProfile.bloodGroup,
                dob: displayProfile.dob,
            }, [
                ['Profile Type', displayProfile.id === user.id ? 'Primary Member' : 'Linked Family Profile'],
            ]);

            drawSectionTitle('Family member directory', 'Every linked family member included in this account.');
            drawFamilyCards();

            const footerText = `Confidential portfolio generated for ${user.name} • Page ${pageNumber}`;
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(7.5);
            pdf.setTextColor(148, 163, 184);
            pdf.text(footerText, margin, pageHeight - 8);

            pdf.save(`COT-Family-Portfolio-${user.id}.pdf`);
        } catch (error) {
            console.error('Profile details PDF export failed:', error);
            alert('Unable to export profile details PDF. Please try again.');
        }
    };

    const handleGoToLogin = () => {
        if (onGoToLogin) {
            onGoToLogin();
            return;
        }
        window.location.href = '/auth?view=login';
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
    const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrUrl)}&bgcolor=ffffff&color=1a237e&margin=5&format=png&cb=${encodeURIComponent(`${displayProfile.id}-${user.status}`)}`;

    /* ─────────────────────────────────────────────── */
    return (
        <div className="min-h-screen pt-28 pb-20 bg-[#f0f2f5] text-slate-900 relative flex flex-col items-center overflow-x-hidden px-3 sm:px-5">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.06] pointer-events-none z-0" />

            {/* Off-screen capture nodes */}
            {croppingImage && <div className="z-[100] relative"><ImageCropper imageSrc={croppingImage} onCropComplete={handleCropComplete} onCancel={() => setCroppingImage(null)} /></div>}
            <TestimonialModal isOpen={showTestimonialModal} onClose={() => setShowTestimonialModal(false)} user={user} />
            <CommunityProfileForm
                isOpen={showCommunityProfileForm}
                onClose={() => setShowCommunityProfileForm(false)}
                initialData={user.communityProfile}
                onSave={(communityData) => {
                    onUpdate({ ...user, communityProfile: communityData } as User);
                    alert('Member form submitted successfully. Admin can view it in dashboard.');
                }}
            />
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
                                            <select required value={subProfileForm.role || 'Spouse'} onChange={e => setSubProfileForm({ ...subProfileForm, role: e.target.value })} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-brand-500 text-sm appearance-none shadow-sm">
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
                            <div className="w-full h-full bg-gradient-to-br from-brand-600 to-violet-700 flex items-center justify-center text-white text-sm font-black tracking-[0.2em]">
                                {getAvatarInitials(displayProfile.name)}
                            </div>
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer transition-all">
                            <Camera size={14} className="text-white" />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, 'add-new')} />
                        </label>
                        {/* Active indicator */}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${user.status === 'Active' ? 'bg-green-500' : user.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-400'}`} />
                    </div>

                    {/* Family member avatars */}
                    {user.linkedProfiles?.map(pf => (
                        <button key={pf.id} onClick={() => setActiveProfileId(pf.id)} title={pf.name}
                            className={`relative shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${activeProfileId === pf.id ? 'border-brand-500 shadow-lg scale-110' : 'border-white/70 opacity-70 hover:opacity-100 hover:scale-105'}`}>
                            <div className="w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-700 flex items-center justify-center text-white text-[10px] font-black tracking-[0.2em]">
                                {getAvatarInitials(pf.name)}
                            </div>
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
                {activeProfileId === user.id && user.pendingProfileUpdate && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-4 py-3 text-xs font-semibold">
                        Your profile update request is pending admin approval.
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
                                    <img src={getSafePhotoSrc(user.photo, user.name, 80)} alt={user.name} className="w-full h-full object-cover" />
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
                                            <img src={getSafePhotoSrc(pf.photo, pf.name, 80, '5b47d0')} alt={pf.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 text-sm truncate">{pf.name}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">
                                                {(index === 0 ? 'First Family Member' : `Additional Member ${index}`)} · {pf.role || 'Family'}
                                            </p>
                                        </div>
                                        {activeProfileId === pf.id && <CheckCircle size={16} className="text-accent-500 shrink-0" />}
                                    </button>
                                    <button onClick={() => handleDeleteSubProfile(pf.id)} aria-label={`Remove ${pf.name}`} className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-all ml-2 shrink-0">
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
                                            <div className="w-full h-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white text-xs font-black tracking-[0.22em]">
                                                {getAvatarInitials(displayProfile.name)}
                                            </div>
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
                                        <img src={qrImgSrc} alt="QR Code" className="w-40 h-40 sm:w-48 sm:h-48 block mx-auto" crossOrigin="anonymous" />
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
                                    <p className={`text-[10px] mt-2 ${user.status === 'Rejected' ? 'text-red-500' : 'text-slate-400'}`}>
                                        {user.status === 'Rejected' ? 'Denied by admin. Please contact support.' : 'Pending admin verification'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Edit Details button below card + QR */}
                    <div className="flex justify-center pb-2">
                        <button id="dashboard-edit-btn" onClick={startEditing} className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-slate-500 hover:text-brand-600 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-sm">
                            <Edit2 size={13} /> Edit Details
                        </button>
                    </div>

                    {/* Action buttons row (mAadhaar style) */}
                    {user.status === 'Active' && (
                        <div className="grid grid-cols-5 gap-1 px-4 pb-5 pt-3">
                            {[
                                { icon: <Share2 size={20} />, label: 'Share', action: handleShare, id: 'dashboard-share-top-btn' },
                                { icon: <Download size={20} />, label: 'Download', action: handleDownloadPDF, loading: isProcessing },
                                { icon: <FileText size={20} />, label: 'Details PDF', action: handleExportProfileDetailsPDF },
                                { icon: <QrCode size={20} />, label: 'Open Scanner', action: () => onOpenScanner?.(), id: 'dashboard-scanner-btn' },
                                { icon: <LogIn size={20} />, label: 'Profile Login', action: handleGoToLogin, id: 'dashboard-login-top-btn' },
                            ].map(({ icon, label, action, loading, id }, i) => (
                                <button id={id} key={i} onClick={action} disabled={loading}
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
                            <p className={`text-[10px] ${user.status === 'Rejected' ? 'text-red-500' : 'text-slate-400'}`}>
                                {user.status === 'Rejected' ? 'Denied by admin' : 'Pending verification'}
                            </p>
                            <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase bg-slate-200 rounded-lg px-2.5 py-1.5 text-slate-400">
                                <AlertCircle size={11} /> Locked
                            </span>
                        </div>
                    )}

                    {/* Testimony */}
                    <button id="dashboard-testimony-btn" onClick={() => setShowTestimonialModal(true)}
                        className="bg-gradient-to-br from-brand-700 to-brand-900 text-white rounded-[22px] p-4 text-left shadow-lg hover:brightness-110 transition-all relative overflow-hidden group">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3"><MessageSquare size={18} /></div>
                        <p className="font-bold text-sm leading-tight mb-1">Write Testimony</p>
                        <p className="text-white/70 text-[10px]">Share what God has done</p>
                        <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-white/20 rounded-lg px-2.5 py-1.5">
                            <MessageSquare size={11} /> Write Now
                        </span>
                    </button>

                    {/* Share Profile Link */}
                    <button id="dashboard-share-btn" onClick={handleShare}
                        className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-[22px] p-4 text-left shadow-lg hover:brightness-110 transition-all relative overflow-hidden group">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3"><Share2 size={18} /></div>
                        <p className="font-bold text-sm leading-tight mb-1">Share Profile Link</p>
                        <p className="text-white/80 text-[10px]">Share unique login URL for this profile</p>
                        <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-white/20 rounded-lg px-2.5 py-1.5">
                            <Share2 size={11} /> Share
                        </span>
                    </button>

                    {/* Family Portfolio PDF */}
                    <button onClick={handleExportProfileDetailsPDF}
                        className="bg-gradient-to-br from-indigo-700 to-violet-800 text-white rounded-[22px] p-4 text-left shadow-lg hover:brightness-110 transition-all relative overflow-hidden group">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3"><FileText size={18} /></div>
                        <p className="font-bold text-sm leading-tight mb-1">Family Portfolio PDF</p>
                        <p className="text-white/80 text-[10px]">Download a polished member, family, and active-profile portfolio</p>
                        <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-white/20 rounded-lg px-2.5 py-1.5">
                            <Download size={11} /> Download PDF
                        </span>
                    </button>

                    {/* Member Form */}
                    <button id="dashboard-member-form-btn" onClick={() => setShowCommunityProfileForm(true)}
                        className="col-span-2 bg-gradient-to-br from-[#1a1b4b] to-[#2a2b6b] text-[#f0c040] rounded-[22px] p-5 text-left shadow-xl hover:brightness-110 transition-all relative overflow-hidden group border border-[#d4a547]/30">
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-[#d4a547]/15 border border-[#d4a547]/40 text-[9px] font-black uppercase tracking-widest text-[#f8e7b0]">
                            User Book
                        </div>
                        <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center mb-3"><Users size={22} /></div>
                        <p className="font-bold text-base leading-tight mb-1">Member Form Column</p>
                        <p className="text-[#f8e7b0] text-[11px] mb-3">Professional themed profile form for User Book. Submission is visible in Admin Dashboard.</p>
                        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 rounded-xl px-4 py-2">
                            <Edit2 size={12} /> Open Form
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

                    {/* Menorah Flag Download */}
                    <a href="/menorah-flag-image.png" download="COT-Menorah-Flag.png"
                        className="col-span-2 bg-gradient-to-br from-[#7c4d00] to-[#f59e0b] text-white rounded-[22px] p-5 text-left shadow-xl hover:brightness-110 transition-all relative overflow-hidden group block">
                        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-3"><Flag size={22} /></div>
                        <p className="font-bold text-base leading-tight mb-1">Download Menorah Flag</p>
                        <p className="text-white/80 text-[11px] mb-3">Save the official ministry flag image to your device.</p>
                        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 rounded-xl px-4 py-2">
                            <Download size={12} /> Download Flag
                        </span>
                    </a>

                    {/* Go To Login */}
                    <button id="dashboard-login-btn" onClick={handleGoToLogin}
                        className="col-span-2 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-[22px] p-5 text-left shadow-xl hover:brightness-110 transition-all relative overflow-hidden group">
                        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-3"><LogIn size={22} /></div>
                        <p className="font-bold text-base leading-tight mb-1">Profile Login</p>
                        <p className="text-white/80 text-[11px] mb-3">Open default login page to switch or sign in with another profile.</p>
                        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 rounded-xl px-4 py-2">
                            <LogIn size={12} /> Open Login
                        </span>
                    </button>
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
                                <button onClick={() => { handleDownloadPDF(); setShowCardPreview(false); }} disabled={isProcessing || !canAccessEntrustFeatures}
                                    className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-black uppercase tracking-widest text-sm py-4 rounded-2xl transition-all shadow-lg disabled:opacity-60">
                                    <FileText size={18} /> {!canAccessEntrustFeatures ? 'Awaiting Approval' : isProcessing ? 'Generating…' : 'Download Card'}
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

                        {/* Photo section */}
                        <div className="flex flex-col items-center gap-3 mb-6">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-lg">
                                <div className="w-full h-full bg-gradient-to-br from-brand-600 via-brand-700 to-violet-800 flex items-center justify-center text-white text-2xl font-black tracking-[0.22em]">
                                    {getAvatarInitials(displayProfile.name)}
                                </div>
                            </div>
                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!displayProfile.photo) {
                                            alert('No existing photo to crop. Use "Add New Photo" first.');
                                            return;
                                        }
                                        setPhotoUpdateMode('edit-existing');
                                        setCroppingImage(displayProfile.photo);
                                        setIsEditing(false);
                                    }}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                                >
                                    <Camera size={14} /> Edit/Crop Current Photo
                                </button>
                                <label className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 cursor-pointer">
                                    <UploadCloud size={14} /> Add New Photo (Approval)
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            handlePhotoUpload(e, 'add-new');
                                            setIsEditing(false);
                                        }}
                                    />
                                </label>
                            </div>
                            <p className="text-slate-400 text-xs text-center">Crop edits are instant. New uploads are sent for admin approval.</p>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const requestedChanges = {
                                name: (formData.name ?? user.name)?.trim(),
                                phone: formData.phone ?? user.phone,
                                email: (formData.email ?? user.email)?.trim(),
                                location: (formData.location ?? user.location)?.trim(),
                                emergency: formData.emergency ?? user.emergency,
                            };
                            onUpdate({ ...user, pendingProfileUpdate: requestedChanges } as User);
                            setIsEditing(false);
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
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Location</label>
                                <select
                                    value={formData.location ?? user.location}
                                    onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-brand-500"
                                >
                                    {!TAMIL_NADU_LOCATIONS.includes((formData.location ?? user.location) || '') && (
                                        <option value={formData.location ?? user.location}>{formData.location ?? user.location}</option>
                                    )}
                                    {TAMIL_NADU_LOCATIONS.map(location => (
                                        <option key={location} value={location}>{location}</option>
                                    ))}
                                </select>
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

            <AnimatePresence>
                {showDashboardIntro && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[170] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ y: 20, opacity: 0, scale: 0.96 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 12, opacity: 0 }}
                            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100"
                        >
                            <div className="text-[11px] font-black uppercase tracking-widest text-brand-500 mb-2">Dashboard Tour</div>
                            <h3 className="text-xl font-bold text-brand-950 mb-2">Quick Guide</h3>
                            <p className="text-sm text-slate-600 mb-5">Get a short walkthrough of key dashboard options, including the new User Book member form column. You can skip anytime.</p>
                            <div className="flex items-center justify-end gap-2">
                                <button onClick={skipDashboardTour} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">Skip</button>
                                <button onClick={startDashboardTour} className="px-4 py-2 rounded-xl text-sm font-bold bg-brand-600 text-white hover:bg-brand-700">Start Tour</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {dashboardTourStepIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[175] pointer-events-none"
                    >
                        <div className="absolute inset-0 bg-black/65" />
                        {dashboardTourRect && (
                            <div
                                className="absolute rounded-2xl border-2 border-amber-300 shadow-[0_0_0_9999px_rgba(2,6,23,0.72)]"
                                style={{
                                    top: dashboardTourRect.top,
                                    left: dashboardTourRect.left,
                                    width: dashboardTourRect.width,
                                    height: dashboardTourRect.height
                                }}
                            />
                        )}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-5 w-[calc(100%-1.5rem)] max-w-md bg-white rounded-3xl p-5 shadow-2xl pointer-events-auto">
                            <div className="text-[11px] uppercase tracking-widest font-black text-brand-500 mb-2">
                                Step {dashboardTourStepIndex + 1} of {DASHBOARD_TOUR_STEPS.length}
                            </div>
                            <h4 className="text-lg font-bold text-brand-950 mb-1">{DASHBOARD_TOUR_STEPS[dashboardTourStepIndex]?.title}</h4>
                            <p className="text-sm text-slate-600 mb-4">{DASHBOARD_TOUR_STEPS[dashboardTourStepIndex]?.text}</p>
                            <div className="flex items-center justify-between gap-2">
                                <button
                                    onClick={skipDashboardTour}
                                    className="px-4 py-2 text-sm font-bold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Skip Tour
                                </button>
                                <button
                                    onClick={() => {
                                        const isLastStep = dashboardTourStepIndex >= DASHBOARD_TOUR_STEPS.length - 1;
                                        if (isLastStep) {
                                            setDashboardTourStepIndex(null);
                                            setDashboardTourRect(null);
                                        } else {
                                            setDashboardTourStepIndex(dashboardTourStepIndex + 1);
                                        }
                                    }}
                                    className="px-4 py-2 text-sm font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                                >
                                    {dashboardTourStepIndex >= DASHBOARD_TOUR_STEPS.length - 1 ? 'Done' : 'Next'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
