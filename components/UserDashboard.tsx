import React, { useEffect, useState } from 'react';
import { User, SubProfile, UserRole } from '../types';
import { EntrustCard3D } from './WorshipperIDCard';
import { generateHebrewAlphabetPDF } from './HebrewAlphabetPDF';
import { Download, Edit2, AlertCircle, CheckCircle, X, FileText, QrCode, LogOut, Camera, Calendar, Users, UserPlus, Trash2, ShieldCheck, MessageSquare, Share2, PlusCircle, ScanLine, UploadCloud, LogIn, Flag, Copy, ExternalLink, Moon, Sun } from 'lucide-react';
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
import { GuidedTour, WelcomeTourModal, useTour } from './GuidedTour';

const MEMBER_FORM_LOGO_URL = '/assets/member-form-logo.png';
const MEMBER_FORM_STAMP_URL = '/assets/member-form-authorised-stamp-transparent.png';
const MEMBER_FORM_SIGNATURE_URL = '/assets/signature.png';

interface UserDashboardProps {
    user: User;
    onEdit: () => void;
    onUpdate: (updatedUser: User) => void;
    onLogout: () => void;
    onOpenScanner?: () => void;
    initialProfileId?: string;
    onGoToLogin?: () => void;
    notifications?: { id: string; message: string; createdAt: string; read?: boolean; kind?: 'message' | 'approved' | 'disapproved' | 'recycle' | 'recycle-removed' | 'leader'; ctaView?: string }[];
    onSendReply?: (message: string) => void;
    onMarkNotificationsRead?: () => void;
    onDeleteNotification?: (notificationId: string) => void;
    focusSection?: 'notifications' | null;
    onDeleteAccount?: () => Promise<void>;
    allUsers?: User[];
}

const FAMILY_RELATIONSHIP_OPTIONS = {
    immediate: ['None', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister'],
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

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, onUpdate, onLogout, onOpenScanner, initialProfileId, onGoToLogin, notifications = [], onSendReply, onMarkNotificationsRead, onDeleteNotification, focusSection = null, onDeleteAccount, allUsers = [] }) => {
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
    const [showQrPreview, setShowQrPreview] = useState(false);
    const [qrLinkCopied, setQrLinkCopied] = useState(false);
    const [qrImageUnavailable, setQrImageUnavailable] = useState(false);
    const [cardFlipped, setCardFlipped] = useState(false);
    const [showCommunityProfileForm, setShowCommunityProfileForm] = useState(false);
    const [cropTarget, setCropTarget] = useState<{ type: 'primary' | 'linked-profile' | 'new-family-member'; profileId?: string; isNewUpload?: boolean } | null>(null);
    const [adminReply, setAdminReply] = useState('');
    const [dismissedTopNotificationId, setDismissedTopNotificationId] = useState<string | null>(null);
    const [wasEditingBeforeCrop, setWasEditingBeforeCrop] = useState(false);
    const [showFormSubmittedBanner, setShowFormSubmittedBanner] = useState(false);
    const [showWhatsAppInviteModal, setShowWhatsAppInviteModal] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        try { return localStorage.getItem('cot_user_dashboard_theme') === 'dark'; } catch { return false; }
    });
    const toggleUserDarkMode = () => setIsDarkMode(prev => {
        const next = !prev;
        try { localStorage.setItem('cot_user_dashboard_theme', next ? 'dark' : 'light'); } catch {}
        return next;
    });
    const notificationsSectionRef = React.useRef<HTMLDivElement | null>(null);
    
    // Global Mobile Toast state
    const [mobileToast, setMobileToast] = useState<{ message: string, type: 'success' | 'error' | 'info', id: string } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setMobileToast({ message, type, id });
    };

    useEffect(() => {
        if (!mobileToast) return;
        const timer = setTimeout(() => {
            setMobileToast(null);
        }, 60000); // Disappear after 1 minute
        return () => clearTimeout(timer);
    }, [mobileToast]);

    const getDisplayProfile = () => {
        if (activeProfileId === user.id) return user;
        const sub = user.linkedProfiles?.find(p => p.id === activeProfileId);
        if (sub) {
            const realUser = allUsers?.find(u => u.id === sub.id);
            if (realUser) {
                return { 
                    ...user, 
                    id: realUser.id, 
                    name: realUser.name, 
                    photo: realUser.photo, 
                    bloodGroup: realUser.bloodGroup || sub.bloodGroup, 
                    dob: realUser.dob || sub.dob,
                    status: realUser.status, 
                    emergency: realUser.emergency || user.emergency,
                    phone: realUser.phone || user.phone,
                    location: realUser.location || user.location,
                    joinedDate: realUser.joinedDate || user.joinedDate,
                    memberSince: realUser.memberSince || user.memberSince
                };
            }
            return { ...user, id: sub.id, name: sub.name, photo: sub.photo, bloodGroup: sub.bloodGroup, dob: sub.dob, status: 'Pending Verification' as const };
        }
        return user;
    };
    const getAvatarInitials = (name?: string) => {
        const parts = (name || '').trim().split(/\s+/).filter(Boolean);
        if (parts.length >= 2) return `${parts[0][0] || 'C'}${parts[1][0] || 'T'}`.toUpperCase();
        return ((parts[0] || 'CT').slice(0, 2)).toUpperCase();
    };
    const renderAvatarContent = (
        photo: string | undefined,
        name: string,
        initialClass = 'text-sm',
        gradientClass = 'from-brand-600 to-violet-700'
    ) => {
        const candidate = (photo || '').trim();
        if (candidate) {
            if (/^data:image\/(?:png|jpe?g|webp|gif|bmp);base64,/i.test(candidate)) {
                return <img src={candidate} alt="Profile photo" className="w-full h-full object-cover" loading="lazy" />;
            }
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
                    if (allowedHosts.has(parsed.hostname)) {
                        return <img src={parsed.toString()} alt="Profile photo" className="w-full h-full object-cover" loading="lazy" />;
                    }
                } catch {
                }
            }
        }
        return (
            <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white ${initialClass} font-black tracking-[0.2em]`}>
                {getAvatarInitials(name)}
            </div>
        );
    };
    const displayProfile = getDisplayProfile();

    useEffect(() => {
        // Show rejection notification on mount if the active profile's form is rejected
        if (displayProfile?.communityProfile?.status === 'Rejected') {
            showToast('Your Member Form was rejected by Admin. Please review and fill it again.', 'error');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [displayProfile?.communityProfile?.status]);

    const hasPermanentCotId = /^COT-\d{4,}$/.test((displayProfile.id || '').trim());
    const canAccessEntrustFeatures = displayProfile.status === 'Active' && hasPermanentCotId;
    const hasMemberFormSubmitted = !!(displayProfile.communityProfile && (
        (displayProfile.communityProfile.denomination || '').trim() ||
        (displayProfile.communityProfile.churchName || '').trim() ||
        (displayProfile.communityProfile.role || '').trim() ||
        (displayProfile.communityProfile.bio || '').trim()
    ));

    useEffect(() => {
        if (canAccessEntrustFeatures) {
            try {
                const invited = localStorage.getItem(`cot_whatsapp_invited_${displayProfile.id}`);
                if (invited !== 'true') {
                    const timer = setTimeout(() => {
                        setShowWhatsAppInviteModal(true);
                    }, 2000);
                    return () => clearTimeout(timer);
                }
            } catch (e) {
                console.warn(e);
            }
        }
    }, [canAccessEntrustFeatures, displayProfile.id]);

    // ── Guided Tour ──
    const dashboardTour = useTour('user_dashboard');

    useEffect(() => {
        // Show welcome tour for first-time visitors
        const timer = setTimeout(() => dashboardTour.promptIfNew(), 1200);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const dashboardTourSteps = [
        {
            target: '#nav-hamburger-btn',
            title: '☰ Navigation Menu',
            description: 'Tap the hamburger menu to access all pages — Hebrew tools, Ministries, Pastor page, AI Assistant, and more.',
            position: 'bottom' as const,
        },
        {
            target: '#nav-my-dashboard-btn',
            title: '👤 My Dashboard',
            description: 'Inside the menu, tap "My Dashboard" to come back here anytime. Your profile, card, and all actions live here.',
            position: 'bottom' as const,
        },
        {
            target: '#dashboard-wallet-card',
            title: '🪪 Your Entrust Card',
            description: 'This is your digital Entrust Card with your unique COT ID. Tap the card to expand it, download as PDF, or share your profile.',
            position: 'top' as const,
        },
        {
            target: '#dashboard-edit-btn',
            title: '✏️ Edit Your Profile',
            description: 'Keep your details up to date — name, phone, location, blood group and more. Tap here to edit.',
            position: 'top' as const,
        },
        {
            target: '#dashboard-notifications-card',
            title: '🔔 Notifications',
            description: 'Admin messages and ministry updates appear here. You can also reply to admins directly from this card.',
            position: 'bottom' as const,
        },
        {
            target: '#dashboard-actions-row',
            title: '⚡ Quick Actions',
            description: 'Download your card PDF, share your profile link, download QR code, or export your details — all in one tap.',
            position: 'top' as const,
        },
        {
            target: '#dashboard-action-cards',
            title: '📋 Member Actions',
            description: 'Fill your Member Form, write a Testimony, download your Family Portfolio PDF, and access the Hebrew Calendar from here.',
            position: 'top' as const,
        },
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
        if (!notifications.some(note => !note.read)) return;
        onMarkNotificationsRead?.();
    }, [notifications, onMarkNotificationsRead]);

    useEffect(() => {
        if (focusSection !== 'notifications') return;
        const timer = window.setTimeout(() => {
            notificationsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
        return () => window.clearTimeout(timer);
    }, [focusSection]);

    const topNotification = notifications.length > 0 ? notifications[0] : null;
    const topToneClass = topNotification?.kind === 'approved'
        ? 'border-emerald-200 from-emerald-50 via-white to-green-50'
        : topNotification?.kind === 'disapproved'
            ? 'border-red-200 from-red-50 via-white to-rose-50'
            : topNotification?.kind === 'recycle'
                ? 'border-amber-200 from-amber-50 via-white to-orange-50'
                : 'border-indigo-200 from-indigo-50 via-white to-violet-50';

    useEffect(() => {
        if (!topNotification) {
            setDismissedTopNotificationId(null);
            return;
        }
        if (dismissedTopNotificationId && dismissedTopNotificationId !== topNotification.id) {
            setDismissedTopNotificationId(null);
        }
    }, [topNotification, dismissedTopNotificationId]);

    useEffect(() => {
        if (!topNotification) return;
        if (dismissedTopNotificationId === topNotification.id) return;
        const timer = window.setTimeout(() => {
            setDismissedTopNotificationId(topNotification.id);
        }, 60000);
        return () => window.clearTimeout(timer);
    }, [topNotification, dismissedTopNotificationId]);


    const handlePhotoUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        target: 'primary' | 'linked-profile' | 'new-family-member' = activeProfileId === user.id ? 'primary' : 'linked-profile'
    ) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setCropTarget(target === 'linked-profile'
                    ? { type: target, profileId: activeProfileId, isNewUpload: true }
                    : { type: target, isNewUpload: true });
                setCroppingImage(reader.result as string);
                e.target.value = '';
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedImg: string) => {
        const isAdminUser = user.role === 'Admin';
        const requiresApproval = cropTarget?.isNewUpload && !isAdminUser;

        if (cropTarget?.type === 'new-family-member') {
            setSubProfileForm(prev => ({ ...prev, photo: croppedImg }));
        } else if (cropTarget?.type === 'linked-profile' && cropTarget.profileId) {
            const updatedProfiles = user.linkedProfiles?.map(p => p.id === cropTarget.profileId ? { ...p, photo: croppedImg } : p) || [];
            if (requiresApproval) {
                onUpdate({
                    ...user,
                    pendingProfileUpdate: {
                        ...(user.pendingProfileUpdate || {}),
                        linkedProfiles: updatedProfiles
                    }
                } as User);
                alert('Linked profile photo update submitted for admin approval.');
            } else {
                onUpdate({
                    ...user,
                    linkedProfiles: updatedProfiles
                } as User);
                alert('Linked member photo cropped successfully.');
            }
        } else {
            if (requiresApproval) {
                onUpdate({
                    ...user,
                    pendingProfileUpdate: {
                        ...(user.pendingProfileUpdate || {}),
                        photo: croppedImg
                    }
                } as User);
                alert('Photo update submitted for admin approval.');
            } else {
                onUpdate({
                    ...user,
                    photo: croppedImg
                } as User);
                alert('Profile photo cropped successfully.');
            }
        }
        setCroppingImage(null);
        setCropTarget(null);
        if (wasEditingBeforeCrop) {
            setIsEditing(true);
            setWasEditingBeforeCrop(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!canAccessEntrustFeatures) {
            alert('Entrust card download is available only after admin approval.');
            return;
        }
        setIsProcessing(true);
        const frontNode = document.getElementById('capture-front');
        const backNode = document.getElementById('capture-back');
        if (frontNode && backNode) {
            try {
                // Reduced wait time for images and shorter overall timeout
                await Promise.all([waitForNodeImages(frontNode, 1500), waitForNodeImages(backNode, 1500)]);
                await new Promise(r => setTimeout(r, 300)); // Reduced from 600ms to 300ms
                
                // Optimized PNG export with balanced quality and speed
                const opts = { 
                    pixelRatio: 2.5, // Further reduced from 3 to 2.5 for faster processing
                    quality: 0.9, // Reduced from 0.95 to 0.9 for faster processing
                    backgroundColor: '#ffffff', 
                    cacheBust: true, 
                    width: 340, 
                    height: 215,
                    skipFonts: false,
                    style: {
                        transform: 'scale(1)',
                        transformOrigin: 'top left'
                    }
                };
                const frontDataUrl = await toPng(frontNode, opts);
                const backDataUrl = await toPng(backNode, opts);
                const pdf = new jsPDF({ 
                    orientation: 'landscape', 
                    unit: 'mm', 
                    format: 'a4', 
                    compress: true,
                    precision: 6 // Further reduced from 8 to 6 for faster processing
                });
                addCenteredCardPage(pdf, frontDataUrl, 'PNG', true);
                addCenteredCardPage(pdf, backDataUrl, 'PNG', false);
                pdf.save(`ENTRUST-CARD-${displayProfile.id}.pdf`);
            } catch (err: any) {
                console.error('PDF generation failed', err);
                // Fallback: try jpeg with even faster settings
                try {
                    const { toJpeg: toJpeg2 } = await import('html-to-image');
                    const opts2 = { 
                        pixelRatio: 2, // Further reduced from 2.5 to 2 for faster processing
                        quality: 0.85, // Reduced from 0.92 to 0.85 for faster processing
                        backgroundColor: '#ffffff', 
                        cacheBust: true, 
                        width: 340, 
                        height: 215,
                        skipFonts: false
                    };
                    const frontDataUrl2 = await toJpeg2(frontNode!, opts2);
                    const backDataUrl2 = await toJpeg2(backNode!, opts2);
                    const pdf2 = new jsPDF({ 
                        orientation: 'landscape', 
                        unit: 'mm', 
                        format: 'a4', 
                        compress: true,
                        precision: 6
                    });
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
            const pdf = new jsPDF({ 
                orientation: 'landscape', 
                unit: 'mm', 
                format: 'a4', 
                compress: true, // Re-enable compression for faster processing
                precision: 8 // Reduced from 16 to 8
            });
            const captureAndAddPage = async (isFirstPage: boolean) => {
                const node = document.getElementById('printable-calendar-dashboard');
                if (!node) throw new Error('Calendar element not found');
                await new Promise(resolve => setTimeout(resolve, 300));
                const dataUrl = await toJpeg(node, { 
                    width: 1122, 
                    height: 793, 
                    pixelRatio: 2.5, // Reduced from 4.0 to 2.5 for faster processing
                    quality: 0.9, // Reduced from 1.0 to 0.9 for faster processing
                    backgroundColor: '#ffffff', 
                    cacheBust: true,
                    skipFonts: false
                });
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
                        const refDataUrl = await toJpeg(refNode, { 
                            pixelRatio: 2.5, // Reduced from 4.0 to 2.5 for faster processing
                            quality: 0.9, // Reduced from 1.0 to 0.9 for faster processing
                            backgroundColor: '#ffffff', 
                            cacheBust: true, 
                            width: 800,
                            skipFonts: false
                        });
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
        if (activeProfileId === user.id) {
            const pending = user.pendingProfileUpdate || {};
            setFormData({
                name: pending.name ?? user.name,
                phone: pending.phone ?? user.phone,
                email: pending.email ?? user.email,
                location: pending.location ?? user.location,
                emergency: pending.emergency ?? user.emergency,
                photo: user.photo,
                dob: (pending as any).dob ?? (user as any).dob ?? '',
                memberSince: (pending as any).memberSince ?? user.memberSince ?? '',
                joinedDate: (pending as any).joinedDate ?? user.joinedDate ?? ''
            });
        } else {
            // It's a linked profile
            const sub = user.linkedProfiles?.find(p => p.id === activeProfileId);
            if (sub) {
                // If there's a pending update for this subprofile in user.pendingProfileUpdate... 
                // Currently, pending updates for linked profiles aren't structured well, so we just edit the original
                setFormData({
                    name: sub.name,
                    role: sub.role as UserRole,
                    photo: sub.photo,
                    dob: sub.dob,
                    bloodGroup: sub.bloodGroup
                });
            }
        }
        setIsEditing(true);
    };
    const cancelEditing = () => { setIsEditing(false); setFormData({}); };
    const saveChanges = (e: React.FormEvent) => { 
        e.preventDefault(); 
        if (activeProfileId === user.id) {
            onUpdate({ ...user, ...formData } as User); 
        } else {
            const updatedLinkedProfiles = (user.linkedProfiles || []).map(p => 
                p.id === activeProfileId ? { ...p, ...formData } : p
            );
            onUpdate({ ...user, linkedProfiles: updatedLinkedProfiles });
        }
        setIsEditing(false); 
    };
    const handleAddSubProfile = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = (subProfileForm.name || '').trim();
        const selectedRole = (subProfileForm.role || '').trim();
        if (!trimmedName) {
            alert('Please enter family member name.');
            return;
        }
        if (!selectedRole) {
            alert('Please select relationship.');
            return;
        }
        const newId = `${user.id}-${(user.linkedProfiles?.length || 0) + 1}`;
        const newProfile: SubProfile = {
            id: newId,
            name: trimmedName,
            role: selectedRole,
            photo: subProfileForm.photo,
            dob: subProfileForm.dob,
            bloodGroup: subProfileForm.bloodGroup
        };
        onUpdate({ ...user, linkedProfiles: [...(user.linkedProfiles || []), newProfile] } as User);
        setShowFamilyModal(false); setSubProfileForm({});
    };

    const handleDeleteSubProfile = (profileId: string) => {
        if (!confirm('Remove this family member?')) return;
        const updatedProfiles = user.linkedProfiles?.filter(p => p.id !== profileId) || [];

        // Ensure pending profile updates for the deleted member are also removed
        let newPendingUpdate = user.pendingProfileUpdate;
        if (newPendingUpdate && newPendingUpdate.linkedProfiles) {
            const newPendingLinkedProfiles = newPendingUpdate.linkedProfiles.filter((p: any) => p.id !== profileId);
            newPendingUpdate = { ...newPendingUpdate };
            if (newPendingLinkedProfiles.length > 0) {
                newPendingUpdate.linkedProfiles = newPendingLinkedProfiles;
            } else {
                delete newPendingUpdate.linkedProfiles;
            }
        }

        const updatedUser = { ...user, linkedProfiles: updatedProfiles };
        if (newPendingUpdate && Object.keys(newPendingUpdate).length === 0) {
            newPendingUpdate = null;
        }

        if (newPendingUpdate !== undefined) {
            updatedUser.pendingProfileUpdate = newPendingUpdate;
        } else {
            updatedUser.pendingProfileUpdate = null;
        }

        onUpdate(updatedUser);
        if (activeProfileId === profileId) setActiveProfileId(user.id);
    };

    const handleShare = () => {
        const url = `${window.location.origin}/verify/${encodeURIComponent(displayProfile.id)}`;
        if (navigator.share) {
            navigator.share({
                title: `${displayProfile.name} — City of Truth Ministries`,
                text: `Open this verified member link: ${displayProfile.id}`,
                url
            });
        } else {
            navigator.clipboard.writeText(url);
            alert('Profile login link copied!');
        }
    };

    const handleExportProfileDetailsPDF = () => {
        try {
            const pdf = new jsPDF({ 
                orientation: 'portrait', 
                unit: 'mm', 
                format: 'a4', 
                compress: true, // Re-enable compression for faster processing
                precision: 8 // Reduced from 16 to 8
            });
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

            const drawMemberFormThemeCard = () => {
                const memberForm = user.communityProfile;
                const entries: Array<[string, string]> = [
                    ['Denomination', formatValue(memberForm?.denomination)],
                    ['Church Name', formatValue(memberForm?.churchName)],
                    ['Role in Ministry', formatValue(memberForm?.role)],
                    ['District / Zone', formatValue(memberForm?.district)],
                    ['Testimony / Bio', formatValue(memberForm?.bio, 'No testimony submitted yet.')],
                ];
                const textWidth = contentWidth - 20;
                const bioLines = pdf.splitTextToSize(entries[4][1], textWidth);
                const dynamicBioHeight = Math.max(bioLines.length * 4.2, 12);
                const cardHeight = 78 + dynamicBioHeight;

                ensureSpace(cardHeight + 10);

                // Outer frame
                pdf.setFillColor(255, 255, 255);
                pdf.setDrawColor(212, 165, 71);
                pdf.roundedRect(margin, y, contentWidth, cardHeight, 7, 7, 'FD');

                // Hero band
                pdf.setFillColor(26, 27, 75);
                pdf.roundedRect(margin, y, contentWidth, 18, 7, 7, 'F');
                pdf.setFillColor(212, 165, 71);
                pdf.rect(margin, y + 15.5, contentWidth, 2.5, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(12);
                pdf.text('Member Form Submission', margin + 8, y + 8);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(8);
                pdf.text('Styled portfolio theme for submitted member form details', margin + 8, y + 12.6);

                // Primary detail rows
                let localY = y + 26;
                const drawEntry = (label: string, value: string) => {
                    pdf.setTextColor(148, 163, 184);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(7);
                    pdf.text(label.toUpperCase(), margin + 8, localY);
                    localY += 3.8;
                    pdf.setTextColor(15, 23, 42);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(10);
                    const valueLines = pdf.splitTextToSize(value, textWidth);
                    pdf.text(valueLines, margin + 8, localY);
                    localY += Math.max(valueLines.length, 1) * 4.3 + 2.3;
                };

                drawEntry(entries[0][0], entries[0][1]);
                drawEntry(entries[1][0], entries[1][1]);
                drawEntry(entries[2][0], entries[2][1]);
                drawEntry(entries[3][0], entries[3][1]);
                drawEntry(entries[4][0], entries[4][1]);

                y += cardHeight + 7;
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
                ['Joined Date', formatValue(user.joinedDate || user.memberSince)],
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

            if (y > 26) {
                addNewPage();
            }
            drawSectionTitle('Member form theme', 'Attractive PDF layout of the submitted member form details.');
            drawMemberFormThemeCard();

            if (y > pageHeight - 120) {
                addNewPage();
            }
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

    const handleExportMemberFormPDF = async () => {
        const profile = user.communityProfile || {};
        const hasFormSubmitted = !!(profile.denomination || profile.churchName || profile.role || profile.bio);
        if (!hasFormSubmitted) {
            alert('Please fill out the Member Form first to unlock this download.');
            return;
        }
        setIsProcessing(true);
        try {
            const pdf = new jsPDF({ 
                orientation: 'portrait', 
                unit: 'mm', 
                format: 'a4', 
                compress: true, // Re-enable compression for faster processing
                precision: 8 // Reduced from 16 to 8
            });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const navy = '#1B2A5E';
            const navyDark = '#0F1A3E';
            const gold = '#C9963A';
            const goldLight = '#E8C47A';
            const cream = '#F9F5EE';
            const ml = 16;
            const fieldWidth = pageWidth - (ml * 2);
            const fieldHeight = 11.0;
            const labelHeight = 4.0;
            const labelGap = 2.0;
            const verticalGap = 7.0;

            const loadImageDataUrl = async (url: string) => {
                try {
                    const response = await fetch(url);
                    if (!response.ok) return null;
                    const blob = await response.blob();
                    return await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = () => reject(reader.error);
                        reader.readAsDataURL(blob);
                    });
                } catch {
                    return null;
                }
            };

            const [logoDataUrl, stampDataUrl, signatureDataUrl] = await Promise.all([
                loadImageDataUrl(MEMBER_FORM_LOGO_URL),
                loadImageDataUrl(MEMBER_FORM_STAMP_URL),
                loadImageDataUrl(MEMBER_FORM_SIGNATURE_URL)
            ]);

            const valueOrBlank = (value?: string) => `${value || ''}`.trim();
            const drawBackground = () => {
                pdf.setFillColor(cream);
                pdf.rect(0, 0, pageWidth, pageHeight, 'F');
                pdf.setFillColor(navyDark);
                pdf.rect(0, 0, pageWidth, 58, 'F');
                pdf.setFillColor(gold);
                pdf.rect(0, 58, pageWidth, 3, 'F');
                pdf.setDrawColor('#D4C4A0');
                pdf.setLineWidth(0.4);
                pdf.line(10, 64, 10, pageHeight - 34);
                pdf.line(pageWidth - 10, 64, pageWidth - 10, pageHeight - 34);
                pdf.setFillColor(navyDark);
                pdf.rect(0, pageHeight - 24, pageWidth, 24, 'F');
                pdf.setFillColor(gold);
                pdf.rect(0, pageHeight - 26, pageWidth, 2, 'F');
            };

            const drawHeader = () => {
                if (logoDataUrl) {
                    pdf.addImage(logoDataUrl, 'PNG', 13, 8, 40, 40, undefined, 'FAST');
                }
                const tx = 58;
                pdf.setTextColor(255, 255, 255);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(16);
                pdf.text('CITY OF TRUTH MINISTRIES', tx, 24);
                pdf.setTextColor(gold);
                pdf.setFontSize(9);
                pdf.text('BUILDING DISCIPLESHIP', tx, 32);
                pdf.setDrawColor(gold);
                pdf.setLineWidth(0.8);
                pdf.line(tx, 35.5, pageWidth - 13, 35.5);
                pdf.setTextColor(goldLight);
                pdf.setFontSize(11);
                pdf.text('MEMBER PROFILE REGISTRATION FORM', tx, 43);
                pdf.setTextColor('#AAB8D8');
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(7.5);
                pdf.text('CONFIDENTIAL  -  LEADERSHIP REVIEW ONLY  -  DEDICATED FOR MINISTRY USE ONLY', tx, 49);
            };

            const drawFooter = () => {
                pdf.setTextColor(goldLight);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(7);
                pdf.text('CITY OF TRUTH MINISTRIES  *  BUILDING DISCIPLESHIP', pageWidth / 2, pageHeight - 16, { align: 'center' });
                pdf.setTextColor('#8899CC');
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(6.5);
                pdf.text('This form is strictly confidential - For internal ministry use only - Form Ref: COT-MPR-2025 v3.0', pageWidth / 2, pageHeight - 11, { align: 'center' });
                pdf.setTextColor('#667799');
                pdf.setFontSize(6);
                pdf.text('Dedicated for Ministry Use Only', pageWidth / 2, pageHeight - 7, { align: 'center' });
            };

            const sectionLabel = (label: string, x: number, y: number) => {
                pdf.setFillColor(gold);
                pdf.rect(x, y - 1, 3, 8.5, 'F');
                pdf.setTextColor(navyDark);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(7.6);
                pdf.text(label.toUpperCase(), x + 6, y + 1);
            };

            const fieldBox = (x: number, y: number, width: number, height: number, value = '', placeholder = '', isMultiline = false) => {
                const cleanValue = valueOrBlank(value);
                pdf.setFillColor('#D8D0C0');
                pdf.roundedRect(x + 1, y + 1.5, width, height, 4, 4, 'F');
                pdf.setFillColor(255, 255, 255);
                pdf.setDrawColor(navy);
                pdf.setLineWidth(1.2);
                pdf.roundedRect(x, y, width, height, 4, 4, 'FD');
                if (cleanValue) {
                    pdf.setTextColor(navyDark);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(isMultiline ? 9.2 : 9.5);
                    const lines = pdf.splitTextToSize(cleanValue, width - 10);
                    pdf.text(lines.slice(0, isMultiline ? 4 : 1), x + 5, y + (isMultiline ? 8 : height / 2 + 3.1));
                } else if (placeholder) {
                    pdf.setTextColor('#AAAAAA');
                    pdf.setFont('helvetica', 'italic');
                    pdf.setFontSize(9);
                    pdf.text(placeholder, x + 5, y + (isMultiline ? 8 : height / 2 + 3.1));
                }
            };

            const dropdownBox = (x: number, y: number, width: number, height: number, value = '', placeholder = '') => {
                fieldBox(x, y, width, height, value, placeholder);
                const arrowWidth = 8;
                pdf.setFillColor(gold);
                pdf.roundedRect(x + width - arrowWidth - 2, y + 2, arrowWidth, height - 4, 3, 3, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(9);
                pdf.text('v', x + width - arrowWidth / 2 - 3, y + height / 2 + 3, { align: 'center' });
            };

            const divider = (y: number) => {
                pdf.setDrawColor(goldLight);
                pdf.setLineWidth(0.6);
                pdf.line(16, y, pageWidth - 16, y);
            };

            const drawSignatureStamp = (x: number, y: number, width: number) => {
                const stampWidth = 40;
                const signatureWidth = width - stampWidth - 8;
                const blockHeight = 28;
                pdf.setFillColor('#D8D0C0');
                pdf.roundedRect(x + 1, y + 1.5, signatureWidth, blockHeight, 4, 4, 'F');
                pdf.setFillColor(255, 255, 255);
                pdf.setDrawColor(navy);
                pdf.setLineWidth(1.2);
                pdf.roundedRect(x, y, signatureWidth, blockHeight, 4, 4, 'FD');
                pdf.setFillColor(gold);
                pdf.rect(x, y, signatureWidth, 8, 'F');
                pdf.setTextColor(navyDark);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(8);
                pdf.text('AUTHORISED BY:', x + 4, y + 5.5);
                
                if (signatureDataUrl) {
                    pdf.addImage(signatureDataUrl, 'PNG', x + (signatureWidth - 45) / 2, y + 9.5, 45, 12, undefined, 'FAST');
                } else {
                    pdf.setTextColor('#0F6432');
                    pdf.setFont('times', 'italic');
                    pdf.setFontSize(21);
                    pdf.text('Shaveesh Jeshurun', x + signatureWidth / 2, y + 18, { align: 'center' });
                    pdf.setDrawColor('#0F6432');
                    pdf.setLineWidth(0.8);
                    pdf.line(x + 12, y + 20, x + signatureWidth - 12, y + 20);
                }
                
                pdf.setTextColor(navyDark);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(6.5);
                pdf.text('Senior Pastor  -  City of Truth Ministries', x + 4, y + 25.5);
                if (stampDataUrl) {
                    pdf.addImage(stampDataUrl, 'PNG', x + signatureWidth + 8, y - 8, stampWidth, stampWidth, undefined, 'FAST');
                }
            };

            drawBackground();
            drawHeader();
            drawFooter();

            let y = 66;
            sectionLabel('Member', ml, y);
            y += labelHeight + labelGap;
            fieldBox(ml, y, fieldWidth, fieldHeight, `${user.name}  -  ${user.id}`);
            y += fieldHeight + verticalGap;

            sectionLabel('Denomination', ml, y);
            y += labelHeight + labelGap;
            dropdownBox(ml, y, fieldWidth, fieldHeight, valueOrBlank(profile.denomination), 'Select denomination');
            y += fieldHeight + verticalGap;

            sectionLabel('Church Name', ml, y);
            y += labelHeight + labelGap;
            fieldBox(ml, y, fieldWidth, fieldHeight, valueOrBlank(profile.churchName), 'Enter your church name');
            y += fieldHeight + verticalGap;

            sectionLabel('Your Role in Ministry', ml, y);
            y += labelHeight + labelGap;
            dropdownBox(ml, y, fieldWidth, fieldHeight, valueOrBlank(profile.role), 'Select role');
            y += fieldHeight + verticalGap;

            sectionLabel('District / Zone', ml, y);
            y += labelHeight + labelGap;
            dropdownBox(ml, y, fieldWidth, fieldHeight, valueOrBlank(profile.district || user.location), 'Select your district or zone');
            y += fieldHeight + verticalGap;

            sectionLabel('Brief Testimony / Bio', ml, y);
            y += labelHeight + labelGap;
            fieldBox(ml, y, fieldWidth, 20, valueOrBlank(profile.bio), 'Share your testimony or brief bio here...', true);
            y += 20 + 6;

            divider(y);
            drawSignatureStamp(ml, 223, fieldWidth);

            pdf.save(`COT-MEMBER-FORM-${user.id}.pdf`);
        } catch (error) {
            console.error('Member form PDF generation failed', error);
            alert('Failed to generate Member Form PDF. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };


    const handleGoToLogin = () => {
        if (onGoToLogin) {
            onGoToLogin();
            return;
        }
        window.location.href = '/auth?view=choice';
    };

    const handleBlockedFeature = () => {
        alert('This feature requires admin approval and a permanent COT ID. Please contact support for assistance.');
    };

    const handleDownloadQrCode = async () => {
        if (!canAccessEntrustFeatures) {
            handleBlockedFeature();
            return;
        }
        try {
            const response = await fetch(qrImgSrc);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `COT-QR-${displayProfile.id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(objectUrl);
        } catch (error) {
            console.error('QR download failed:', error);
            alert('Unable to download QR code. Please try again.');
        }
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
    const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrUrl)}&bgcolor=ffffff&color=1a237e&margin=0&format=png&cb=${encodeURIComponent(displayProfile.id)}`;

    useEffect(() => {
        setQrImageUnavailable(false);
    }, [displayProfile.id, user.status]);

    const handleOpenQrPreview = () => {
        if (!canAccessEntrustFeatures) {
            handleBlockedFeature();
            return;
        }
        setQrLinkCopied(false);
        setShowQrPreview(true);
    };

    const handleCopyQrLink = async () => {
        if (!canAccessEntrustFeatures) {
            alert('Copying verification link is disabled for unverified, temporary, or restricted accounts.');
            return;
        }
        try {
            await navigator.clipboard.writeText(qrUrl);
            setQrLinkCopied(true);
            window.setTimeout(() => setQrLinkCopied(false), 1800);
        } catch (_e) {
            alert('Unable to copy verification link. Please copy it manually.');
        }
    };

    /* ─────────────────────────────────────────────── */
    return (
        <div className={`min-h-screen pt-28 pb-20 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-[#f0f2f5] text-slate-900'} relative flex flex-col items-center overflow-x-hidden px-3 sm:px-5 user-dashboard-root`}>
            {isDarkMode && (
                <style dangerouslySetInnerHTML={{ __html: `
                    .user-dashboard-root .bg-white { background-color: #1e293b !important; }
                    .user-dashboard-root .bg-slate-50 { background-color: #0f172a !important; }
                    .user-dashboard-root .text-slate-900, .user-dashboard-root .text-slate-800, .user-dashboard-root .text-slate-700 { color: #f1f5f9 !important; }
                    .user-dashboard-root .text-slate-600, .user-dashboard-root .text-slate-500 { color: #94a3b8 !important; }
                    .user-dashboard-root .border-slate-200, .user-dashboard-root .border-slate-100 { border-color: #334155 !important; }
                    .user-dashboard-root input, .user-dashboard-root select, .user-dashboard-root textarea { background-color: #0f172a !important; color: #f8fafc !important; border-color: #334155 !important; }
                ` }} />
            )}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.06] pointer-events-none z-0" />
            {topNotification && dismissedTopNotificationId !== topNotification.id && (
                <div className="sticky top-20 z-50 w-full max-w-md lg:max-w-7xl xl:max-w-[88rem] 2xl:max-w-[95rem] mb-3">
                    <button
                        type="button"
                        onClick={() => notificationsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                        className={`w-full text-left rounded-2xl border bg-gradient-to-r ${topToneClass} shadow-lg px-4 py-3 flex items-start gap-3`}
                    >
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <MessageSquare size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                                {topNotification.kind === 'approved' ? 'Approved Notification' : topNotification.kind === 'disapproved' ? 'Disapproved Notification' : topNotification.kind === 'recycle' ? 'Recycle Bin Notice' : 'New Admin Notification'}
                            </p>
                            <p className="text-sm font-semibold text-slate-700 whitespace-pre-wrap break-words">{topNotification.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">Auto closes in 1 minute</p>
                        </div>
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                setDismissedTopNotificationId(topNotification.id);
                            }}
                            className="inline-flex p-1.5 rounded-lg text-slate-500 hover:bg-white border border-slate-200 cursor-pointer"
                            title="Dismiss notification"
                        >
                            <X size={14} />
                        </span>
                    </button>
                </div>
            )}

            {showFormSubmittedBanner && (
                <div className="sticky top-20 z-50 w-full max-w-md lg:max-w-7xl xl:max-w-[88rem] 2xl:max-w-[95rem] mb-3">
                    <div className="rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 via-white to-emerald-50 shadow-lg px-4 py-3 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                                <FileText size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-wider text-green-700">Member Form Submitted</p>
                                <p className="text-sm text-slate-700">Your Member Profile Registration Form was submitted successfully! You can download your official form now.</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleExportMemberFormPDF();
                                    }}
                                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    <Download size={12} /> Download Member Form PDF
                                </button>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowFormSubmittedBanner(false)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-white border border-slate-200"
                            title="Dismiss notification"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Off-screen capture nodes */}
            {croppingImage && <div className="z-[100] relative"><ImageCropper imageSrc={croppingImage} onCropComplete={handleCropComplete} onCancel={() => { setCroppingImage(null); setCropTarget(null); if (wasEditingBeforeCrop) { setIsEditing(true); setWasEditingBeforeCrop(false); } }} /></div>}
            <TestimonialModal isOpen={showTestimonialModal} onClose={() => setShowTestimonialModal(false)} user={user} />
            <CommunityProfileForm
                isOpen={showCommunityProfileForm}
                onClose={() => setShowCommunityProfileForm(false)}
                initialData={displayProfile.communityProfile}
                onSave={(data) => {
                    if (activeProfileId === user.id) {
                        onUpdate({ ...user, communityProfile: { ...data, status: 'Pending' } } as User);
                    } else {
                        const updatedLinkedProfiles = (user.linkedProfiles || []).map(p => 
                            p.id === activeProfileId ? { ...p, communityProfile: { ...data, status: 'Pending' } } : p
                        );
                        onUpdate({ ...user, linkedProfiles: updatedLinkedProfiles } as User);
                    }
                    setShowFormSubmittedBanner(true);
                    setTimeout(() => setShowFormSubmittedBanner(false), 5000);
                    showToast('Member Form submitted successfully! Admin will review it shortly.', 'success');
                }}
            />
            <CalendarCustomizationModal isOpen={isCalendarModalOpen} onClose={() => setIsCalendarModalOpen(false)} onDownload={handleDownloadCalendar} isProcessing={isGeneratingCalendar} />

            <div className="fixed left-[-9999px] top-0 pointer-events-none z-0">
                <div id="capture-front" className="bg-white inline-block w-[340px] h-[215px] overflow-hidden rounded-xl">
                    <EntrustCard3D name={displayProfile.name} email={user.email} location={user.location} emergency={user.emergency} uniqueId={displayProfile.id} memberSince={user.joinedDate || user.memberSince} photo={displayProfile.photo} status={user.status} isStatic={true} isBackSide={false} cardThemeTone="blue" cardLayoutMode={user.cardLayoutMode} cardShapeMode={user.cardShapeMode} cardSizeMode={user.cardSizeMode} />
                </div>
                <div id="capture-back" className="bg-white inline-block w-[340px] h-[215px] overflow-hidden rounded-xl">
                    <EntrustCard3D name={displayProfile.name} email={user.email} location={user.location} emergency={user.emergency} uniqueId={displayProfile.id} memberSince={user.joinedDate || user.memberSince} photo={displayProfile.photo} status={user.status} isStatic={true} isBackSide={true} cardThemeTone="blue" cardLayoutMode={user.cardLayoutMode} cardShapeMode={user.cardShapeMode} cardSizeMode={user.cardSizeMode} />
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
                                        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Photo (optional)</label>
                                        <label className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center text-slate-400 shrink-0">
                                                {subProfileForm.photo
                                                    ? <img src={subProfileForm.photo} alt="Family member" className="w-full h-full object-cover" />
                                                    : <UploadCloud size={18} />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-700">
                                                    {subProfileForm.photo ? 'Photo ready' : 'Upload and crop family photo'}
                                                </p>
                                                <p className="text-[11px] text-slate-500">
                                                    {subProfileForm.photo ? 'You can still replace it before saving.' : 'Optional, but you can add it now instead of later.'}
                                                </p>
                                            </div>
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, 'new-family-member')} />
                                        </label>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Full Name</label>
                                        <input required type="text" value={subProfileForm.name || ''} onChange={e => setSubProfileForm({ ...subProfileForm, name: e.target.value })} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-brand-500 text-sm font-medium shadow-sm placeholder:text-slate-500" placeholder="John Doe" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Relationship</label>
                                            <select required value={subProfileForm.role || ''} onChange={e => setSubProfileForm({ ...subProfileForm, role: e.target.value })} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-brand-500 text-sm appearance-none shadow-sm">
                                                <option value="">None</option>
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
                                        <p className="text-[10px] text-center text-slate-400 mt-2">You can add the member with their photo already cropped and ready.</p>
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
            <div className={`w-full max-w-md lg:max-w-7xl xl:max-w-[88rem] 2xl:max-w-[95rem] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10`}>
                {/* ── LEFT COLUMN (Profile, Family, Actions, Logout on Desktop) ── */}
                <div className={`${user.linkedProfiles && user.linkedProfiles.length > 0 ? 'lg:col-span-4 xl:col-span-3' : 'lg:col-span-5 xl:col-span-4'} flex flex-col gap-5`}>

                <div className="flex items-center gap-3 mb-5 px-1">
                    {/* Primary profile + family avatars */}
                    <div className="relative group shrink-0">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-[3px] border-white shadow-lg bg-brand-100">
                            {renderAvatarContent(user.photo, user.name, 'text-sm', 'from-brand-600 to-violet-700')}
                        </div>
                        <div 
                            onClick={() => {
                                if (!user.photo) {
                                    alert('No existing photo to crop. Please use the "Add New Photo" button in Edit Details.');
                                    return;
                                }
                                setCropTarget({ type: 'primary', isNewUpload: false });
                                setCroppingImage(user.photo);
                                setIsEditing(false);
                            }}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer transition-all"
                            title="Crop Profile Photo"
                        >
                            <Camera size={14} className="text-white" />
                        </div>
                        {/* Active indicator */}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${user.status === 'Active' ? 'bg-green-500' : user.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-400'}`} />
                    </div>

                    {/* Family member avatars */}
                    {user.linkedProfiles?.map(pf => (
                        <button key={pf.id} onClick={() => setActiveProfileId(pf.id)} title={pf.name}
                            className={`relative shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${activeProfileId === pf.id ? 'border-brand-500 shadow-lg scale-110' : 'border-white/70 opacity-70 hover:opacity-100 hover:scale-105'}`}>
                            {renderAvatarContent(pf.photo, pf.name, 'text-[10px]', 'from-violet-600 to-fuchsia-700')}
                        </button>
                    ))}

                    {/* Add Profile button */}
                    <button onClick={handleGoToLogin} title="Add Family Member — Register or Login"
                        className="shrink-0 w-10 h-10 rounded-full border-2 border-dashed border-slate-300 bg-white hover:border-brand-400 hover:bg-brand-50 flex items-center justify-center transition-all text-slate-400 hover:text-brand-500">
                        <PlusCircle size={20} />
                    </button>

                    <div className="flex-1 min-w-0 ml-1">
                        <h1 className="font-bold text-slate-900 text-base leading-tight truncate">{displayProfile.name}</h1>
                        <p className="text-[11px] text-slate-500 font-medium">{activeProfileId !== user.id ? 'Family Member' : (user.role || 'Member')}</p>
                    </div>

                    {/* Dark mode toggle */}
                    <button onClick={toggleUserDarkMode} title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'} className="shrink-0 text-slate-400 hover:text-indigo-600 p-2 rounded-full hover:bg-white transition-all">
                        {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
                    </button>
                    {/* Edit button */}
                    <button onClick={startEditing} className="shrink-0 text-slate-400 hover:text-brand-600 p-2 rounded-full hover:bg-white transition-all">
                        <Edit2 size={18} />
                    </button>
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
                 {(() => {
                    const hasPrimaryPending = activeProfileId === user.id && user.pendingProfileUpdate && Object.keys(user.pendingProfileUpdate).filter(k => k !== 'linkedProfiles').length > 0;
                    const activeFamilyPending = activeProfileId !== user.id && user.pendingProfileUpdate?.linkedProfiles?.find(p => p.id === activeProfileId);
                    const hasFamilyPending = !!activeFamilyPending;

                    if (hasPrimaryPending) {
                        return (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-4 py-3 text-xs font-semibold flex items-center justify-between gap-3">
                                <span>Your profile update request is pending admin approval.</span>
                                <button 
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to cancel and reset your pending profile and photo updates?')) {
                                            const newPending = { ...(user.pendingProfileUpdate || {}) };
                                            Object.keys(newPending).forEach(k => {
                                                if (k !== 'linkedProfiles') {
                                                    delete (newPending as any)[k];
                                                }
                                            });
                                            onUpdate({ ...user, pendingProfileUpdate: newPending } as User);
                                        }
                                    }}
                                    className="shrink-0 px-2.5 py-1 bg-white border border-amber-300 text-amber-900 rounded-lg hover:bg-amber-100 transition-colors font-bold text-[10px] uppercase tracking-wider"
                                >
                                    Cancel & Reset
                                </button>
                            </div>
                        );
                    }

                    if (hasFamilyPending) {
                        return (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-4 py-3 text-xs font-semibold flex items-center justify-between gap-3">
                                <span>This family member's profile update request is pending admin approval.</span>
                                <button 
                                    onClick={() => {
                                        if (window.confirm("Are you sure you want to cancel and reset this family member's pending profile and photo updates?")) {
                                            let newPending: any = { ...(user.pendingProfileUpdate || {}) };
                                            if (newPending.linkedProfiles) {
                                                newPending.linkedProfiles = newPending.linkedProfiles.filter((p: any) => p.id !== activeProfileId);
                                                if (newPending.linkedProfiles.length === 0) {
                                                    delete newPending.linkedProfiles;
                                                }
                                            }
                                            if (Object.keys(newPending).length === 0) {
                                                newPending = null;
                                            }
                                            onUpdate({ ...user, pendingProfileUpdate: newPending } as User);
                                        }
                                    }}
                                    className="shrink-0 px-2.5 py-1 bg-white border border-amber-300 text-amber-900 rounded-lg hover:bg-amber-100 transition-colors font-bold text-[10px] uppercase tracking-wider"
                                >
                                    Cancel & Reset
                                </button>
                            </div>
                        );
                    }

                    return null;
                 })()}

                {/* ── FAMILY MEMBERS LIST ── */}
                {user.linkedProfiles && user.linkedProfiles.length > 0 && (
                    <div className="bg-white rounded-[24px] shadow-md overflow-hidden mt-8">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users size={16} className="text-brand-500" /> Family</h3>
                            <button onClick={handleGoToLogin} className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1">
                                <PlusCircle size={14} /> Add
                            </button>
                        </div>
                        <div className="p-4 space-y-3 bg-slate-50">
                            <button onClick={() => setActiveProfileId(user.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${activeProfileId === user.id ? 'bg-brand-50 border-brand-200' : 'bg-white border-slate-200 hover:border-brand-200'}`}>
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-100 shrink-0">
                                    {renderAvatarContent(user.photo, user.name, 'text-[10px]', 'from-brand-600 to-violet-700')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 text-sm truncate">{user.name}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{user.id} · Primary</p>
                                </div>
                                {activeProfileId === user.id && <CheckCircle size={16} className="text-brand-500 shrink-0" />}
                            </button>
                            {user.linkedProfiles.map((pf, index) => {
                                const pendingPf = user.pendingProfileUpdate?.linkedProfiles?.find(p => p.id === pf.id);
                                const isPending = !!pendingPf;
                                const displayPhoto = pendingPf?.photo || pf.photo;

                                return (
                                    <div key={pf.id} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all group ${activeProfileId === pf.id ? 'bg-accent-50 border-accent-200' : 'bg-white border-slate-200 hover:border-accent-200'} ${isPending ? 'ring-2 ring-amber-300 ring-offset-2' : ''}`}>
                                        <button onClick={() => setActiveProfileId(pf.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 shrink-0 relative">
                                                {renderAvatarContent(displayPhoto, pf.name, 'text-[10px]', 'from-violet-600 to-fuchsia-700')}
                                                {isPending && (
                                                    <div className="absolute inset-0 bg-amber-500/25 flex items-center justify-center">
                                                        <span className="text-[6px] bg-amber-500 text-white font-black px-1 rounded-full leading-none tracking-widest scale-75">PENDING</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-900 text-sm truncate">{pf.name}</p>
                                                <p className="text-[10px] text-slate-500 font-medium">
                                                    {(index === 0 ? 'First Family Member' : `Additional Member ${index}`)} · {pf.role || 'Family'}
                                                </p>
                                            </div>
                                            {activeProfileId === pf.id && <CheckCircle size={16} className="text-accent-500 shrink-0" />}
                                        </button>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteSubProfile(pf.id); }} aria-label={`Remove ${pf.name}`} className="opacity-100 p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all ml-2 shrink-0">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                {/* ── LOGOUT ── */}
                <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-white border border-red-100 text-red-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 rounded-2xl py-3.5 font-bold text-xs tracking-widest uppercase transition-all shadow-sm">
                    <LogOut size={15} /> Logout
                </button>
                </div>

                {/* ── RIGHT COLUMN (Wallet Card & Content on Desktop) ── */}
                <div className={`${user.linkedProfiles && user.linkedProfiles.length > 0 ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-7 xl:col-span-8'} flex flex-col gap-5`}>
                <div id="dashboard-notifications-card" ref={notificationsSectionRef} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-black text-brand-950">Notifications</h3>
                        <span className="text-[10px] font-bold text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full">{notifications.length}</span>
                    </div>
                    {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400">No admin notifications yet.</p>
                    ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {notifications.slice(0, 8).map(note => (
                                <div key={note.id} className={`rounded-xl border px-3 py-2 ${note.kind === 'message' ? 'border-indigo-200 bg-gradient-to-r from-indigo-50 to-white shadow-sm' : note.kind === 'approved' ? 'border-emerald-200 bg-emerald-50/70' : note.kind === 'disapproved' ? 'border-red-200 bg-red-50/70' : note.kind === 'recycle' ? 'border-amber-200 bg-amber-50/70' : 'border-slate-100 bg-slate-50'}`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`text-xs whitespace-pre-wrap break-words ${note.kind === 'message' ? 'text-indigo-900 font-bold' : 'text-slate-700'}`}>{note.message}</p>
                                        {onDeleteNotification && (
                                            <button
                                                type="button"
                                                onClick={() => onDeleteNotification(note.id)}
                                                className="shrink-0 p-1 rounded-lg text-red-600 hover:bg-red-100"
                                                title="Delete notification"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">{new Date(note.createdAt).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <input
                            value={adminReply}
                            onChange={(e) => setAdminReply(e.target.value)}
                            placeholder="Reply to admin..."
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-brand-500"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (!adminReply.trim()) return;
                                onSendReply?.(adminReply.trim());
                                setAdminReply('');
                            }}
                            className="px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold"
                        >
                            Send Reply
                        </button>
                        <button
                            type="button"
                            onClick={() => onSendReply?.('I request a new COT ID. Please review and reassign my ID.')}
                            className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold"
                        >
                            Request COT ID Change
                        </button>
                    </div>
                </div>

                {/* ════════════════════════════════════
                    mAadhaar-Style Wallet Card
                ════════════════════════════════════ */}
                <div id="dashboard-wallet-card" className="bg-white rounded-[28px] shadow-xl mb-5 overflow-hidden">
                    {/* Gold ID Number Header - show full ID, no masking */}
                    <div className="bg-gradient-to-r from-[#d4a547] via-[#f0c040] to-[#c8922a] px-5 py-3.5 flex items-center justify-between">
                        <span className="font-black text-[#3d2500] text-xl tracking-[3px] font-mono">
                            {displayProfile.id.toUpperCase()}
                        </span>
                        <span className="text-[#5a3500]/60 text-[10px] font-bold uppercase tracking-widest">COT ID</span>
                    </div>

                    {/* Desktop Content Row: 3D Preview + QR */}
                    <div className="flex flex-col xl:flex-row items-center xl:items-start justify-between p-4 md:p-6 lg:p-10 gap-6">

                        {/* Left: Card Preview */}
                        <div className="w-full xl:w-3/5">
                            {/* Card Preview (MOBILE) — shows real card scaled down */}
                            <div className="md:hidden relative cursor-pointer" onClick={canAccessEntrustFeatures ? handleDownloadPDF : handleBlockedFeature}>
                                <div className={`relative w-full flex justify-center origin-top ${!canAccessEntrustFeatures ? 'blur-[2px]' : ''}`}
                                    style={{ height: '220px', overflow: 'hidden' }}>
                                    <div style={{ transform: 'scale(0.92)', transformOrigin: 'top center', position: 'absolute', top: 0 }}>
                                        <EntrustCard3D
                                            name={displayProfile.name}
                                            email={user.email}
                                            location={user.location}
                                            emergency={user.emergency}
                                            uniqueId={displayProfile.id}
                                            memberSince={user.joinedDate || user.memberSince}
                                            photo={displayProfile.photo}
                                            status={user.status}
                                            isStatic={true}
                                            isBackSide={false}
                                            cardThemeTone="blue"
                                            cardLayoutMode={user.cardLayoutMode}
                                            cardShapeMode={user.cardShapeMode}
                                            cardSizeMode={user.cardSizeMode}
                                        />
                                    </div>
                                </div>
                                {!canAccessEntrustFeatures && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="bg-black/55 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">Awaiting Approval</span>
                                    </div>
                                )}
                                <p className="text-center text-slate-500 text-xs font-semibold mt-2 mb-1">Tap card to download instantly ✨</p>
                            </div>

                            {/* Real EntrustCard3D Preview (DESKTOP ONLY) */}
                            <div className="hidden md:block w-full cursor-pointer hover:scale-[1.01] transition-transform duration-300" onClick={canAccessEntrustFeatures ? handleDownloadPDF : handleBlockedFeature}>
                                <div className="w-full flex justify-center items-center py-6 md:py-10 lg:py-12 overflow-hidden relative">
                                    <div className={`transform origin-center transition-all scale-100 md:scale-[1.12] lg:scale-[1.22] xl:scale-[1.35] ${!canAccessEntrustFeatures ? 'blur-[2px]' : ''}`}>
                                        <EntrustCard3D
                                            name={displayProfile.name}
                                            email={user.email}
                                            location={user.location}
                                            emergency={user.emergency}
                                            uniqueId={displayProfile.id}
                                            memberSince={user.joinedDate || user.memberSince}
                                            photo={displayProfile.photo}
                                            status={user.status}
                                            isStatic={true}
                                            isBackSide={cardFlipped}
                                            cardThemeTone="blue"
                                            cardLayoutMode={user.cardLayoutMode}
                                            cardShapeMode={user.cardShapeMode}
                                            cardSizeMode={user.cardSizeMode}
                                        />
                                    </div>
                                    {!canAccessEntrustFeatures && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="bg-black/55 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">Awaiting Approval</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">✨ Click card to download instantly ✨</p>
                            </div>

                            {/* Edit Details Action (Directly below card preview to balance layout) */}
                            <div className="flex justify-center mt-6">
                                <button id="dashboard-edit-btn" onClick={startEditing} className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-slate-500 hover:text-brand-600 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-sm">
                                    <Edit2 size={13} /> Edit Details
                                </button>
                            </div>
                        </div>

                        {/* Right: Entrust card preview + QR download */}
                        <div className="w-full xl:w-2/5 flex flex-col items-center justify-center border-t xl:border-t-0 xl:border-l border-slate-100 pt-6 xl:pt-0 xl:pl-6">
                            {canAccessEntrustFeatures ? (
                                <div className="flex flex-col items-center w-full">
                                    <div className="w-full max-w-[320px] rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-md px-5 py-6 flex flex-col items-center text-center">
                                        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-brand-600 mb-4">
                                            <QrCode size={12} />
                                            Verify QR
                                        </div>
                                        {qrImageUnavailable ? (
                                            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-inner w-full">
                                                <p className="text-xs font-black text-slate-600 uppercase tracking-wider">QR unavailable</p>
                                                <p className="text-[11px] text-slate-500 mt-2 break-all">{qrUrl}</p>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleDownloadQrCode}
                                                className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-inner cursor-zoom-in hover:scale-[1.01] transition-transform relative overflow-hidden"
                                                title="Click to download QR code"
                                            >
                                                <img
                                                    src="/logo.png"
                                                    alt="Logo watermark"
                                                    className="absolute inset-0 w-full h-full object-contain p-8 opacity-20 pointer-events-none"
                                                />
                                                <img
                                                    src={qrImgSrc}
                                                    alt={`QR code for ${displayProfile.id}`}
                                                    className="w-44 h-44 md:w-52 md:h-52 object-contain relative z-10 mix-blend-multiply"
                                                    onError={() => setQrImageUnavailable(true)}
                                                />
                                            </button>
                                        )}
                                        <p className="mt-4 text-sm font-bold text-brand-950">{displayProfile.name}</p>
                                        <p className="text-[11px] text-slate-500 font-mono mt-1">{displayProfile.id.toUpperCase()}</p>
                                        <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                                            Scan this code to open the official verification page for this Entrust profile.
                                        </p>
                                        <p className="mt-3 text-[10px] text-slate-500 break-all">{qrUrl}</p>
                                        <button
                                            type="button"
                                            onClick={handleCopyQrLink}
                                            className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-brand-700 hover:text-brand-900 transition-colors"
                                        >
                                            <Copy size={12} /> {qrLinkCopied ? 'Copied' : 'Copy Website Link'}
                                        </button>
                                        {!qrImageUnavailable && (
                                            <>
                                            <button
                                                type="button"
                                                onClick={() => window.open(qrUrl, '_blank')}
                                                className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-brand-700 hover:text-brand-900 transition-colors"
                                            >
                                                <ExternalLink size={12} /> Click QR to view link
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => generateHebrewAlphabetPDF()}
                                                className="mt-4 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-700 hover:text-amber-900 transition-colors"
                                            >
                                                <Download size={12} /> Download Hebrew Alphabet PDF
                                            </button>
                                            </>

                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleDownloadQrCode}
                                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black uppercase tracking-wider transition-colors"
                                    >
                                        <QrCode size={14} /> Download QR Code
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-full max-w-[320px] rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-6">
                                        <div className="mx-auto w-fit rounded-full bg-slate-200 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 mb-4">
                                            QR Locked
                                        </div>
                                        <div className="relative mx-auto rounded-[24px] overflow-hidden border border-slate-200 shadow-md bg-white p-3 w-fit">
                                            <img
                                                src={qrImgSrc}
                                                alt={`QR code for ${displayProfile.id}`}
                                                className="w-44 h-44 md:w-52 md:h-52 object-contain blur-[3px] pointer-events-none select-none"
                                            />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 gap-2">
                                            <ShieldCheck size={28} className="text-amber-300" />
                                            <p className="font-black text-white text-xs uppercase tracking-widest">Not Verified</p>
                                        </div>
                                    </div>
                                    <p className={`text-[10px] mt-2 ${user.status === 'Rejected' ? 'text-red-500' : 'text-slate-400'}`}>
                                        {user.status === 'Rejected'
                                            ? 'Denied by admin. Please contact support.'
                                            : hasPermanentCotId
                                                ? 'Pending admin verification'
                                                : 'Temporary account. COT ID activation pending.'}
                                    </p>
                                    <p className="text-[10px] mt-2 text-slate-500 break-all">{qrUrl}</p>
                                    <button
                                        type="button"
                                        onClick={handleCopyQrLink}
                                        className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-brand-700 hover:text-brand-900 transition-colors"
                                    >
                                        <Copy size={12} /> {qrLinkCopied ? 'Copied' : 'Copy Website Link'}
                                    </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>



                    {/* Action buttons row (mAadhaar style) */}
                    {canAccessEntrustFeatures && (
                        <div id="dashboard-actions-row" className={`grid ${activeProfileId === user.id && hasMemberFormSubmitted ? 'grid-cols-5' : 'grid-cols-4'} gap-1 px-4 pb-5 pt-3`}>
                            {[
                                { icon: <Share2 size={20} />, label: 'Share', action: handleShare, id: 'dashboard-share-top-btn' },
                                { icon: <Download size={20} />, label: 'Download', action: handleDownloadPDF, loading: isProcessing },
                                { icon: <FileText size={20} />, label: 'Details PDF', action: handleExportProfileDetailsPDF },
                                { icon: <QrCode size={20} />, label: 'Download QR', action: handleDownloadQrCode, id: 'dashboard-scanner-btn' },
                                ...(activeProfileId === user.id && hasMemberFormSubmitted ? [{ icon: <FileText size={20} />, label: 'Member Form PDF', action: handleExportMemberFormPDF }] : []),
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
                    <div id="dashboard-action-cards" className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-5">

                    {/* QR Card (Mobile priority #1) */}
                    {canAccessEntrustFeatures ? (
                        <button onClick={handleDownloadQrCode}
                            className="bg-gradient-to-br from-[#1a237e] to-[#3949ab] text-white rounded-[22px] p-4 text-left shadow-lg hover:brightness-110 transition-all relative overflow-hidden group">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3"><QrCode size={18} /></div>
                            <p className="font-bold text-sm leading-tight mb-1">Download QR</p>
                            <p className="text-white/70 text-[10px] leading-snug">Official verification QR for your profile</p>
                            <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-white/20 rounded-lg px-2.5 py-1.5">
                                <QrCode size={11} /> Download QR
                            </span>
                        </button>
                    ) : (
                        <div className="bg-slate-100 rounded-[22px] p-4 border border-slate-200">
                            <div className="w-9 h-9 bg-slate-200 rounded-xl flex items-center justify-center mb-3"><QrCode size={18} className="text-slate-400" /></div>
                            <p className="font-bold text-sm text-slate-500 mb-1">Download QR</p>
                            <p className={`text-[10px] ${user.status === 'Rejected' ? 'text-red-500' : 'text-slate-400'}`}>
                                {user.status === 'Rejected'
                                    ? 'Denied by admin'
                                    : hasPermanentCotId
                                        ? 'Pending verification'
                                        : 'Temporary account'}
                            </p>
                            <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase bg-slate-200 rounded-lg px-2.5 py-1.5 text-slate-400">
                                <AlertCircle size={11} /> Locked
                            </span>
                        </div>
                    )}

                    {/* Interest / Member Form (Mobile priority #2) */}
                    {canAccessEntrustFeatures ? (
                        activeProfileId === user.id && hasMemberFormSubmitted ? (
                            <button onClick={handleExportMemberFormPDF}
                                className="rounded-[22px] p-4 text-left shadow-lg transition-all relative overflow-hidden group bg-gradient-to-br from-[#1a1b4b] to-[#2a2b6b] text-[#f0c040] hover:brightness-110 border border-[#d4a547]/30 cursor-pointer">
                                <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center mb-3"><FileText size={18} className="text-[#f0c040]" /></div>
                                <p className="font-bold text-sm leading-tight mb-1">Download Member Form</p>
                                <p className="text-[#f8e7b0] text-[10px]">Download your submitted member form details in themed PDF format.</p>
                                <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-white/20 rounded-lg px-2.5 py-1.5 text-[#f0c040]">
                                    <Download size={11} /> Download PDF
                                </span>
                            </button>
                        ) : (
                            <button onClick={() => setShowCommunityProfileForm(true)}
                                className="rounded-[22px] p-4 text-left shadow-lg transition-all relative overflow-hidden group bg-gradient-to-br from-[#1a1b4b] to-[#2a2b6b] text-[#f0c040] hover:brightness-110 border border-[#d4a547]/30 cursor-pointer">
                                <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center mb-3"><Users size={18} className="text-[#f0c040]" /></div>
                                <p className="font-bold text-sm leading-tight mb-1">Member Form Column</p>
                                <p className="text-[#f8e7b0] text-[10px]">Professional themed profile form for User Book.</p>
                                <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-white/20 rounded-lg px-2.5 py-1.5 text-[#f0c040]">
                                    <Edit2 size={11} /> Open Form
                                </span>
                            </button>
                        )
                    ) : (
                        <div className="bg-slate-100 rounded-[22px] p-4 border border-slate-200">
                            <div className="w-9 h-9 bg-slate-200 rounded-xl flex items-center justify-center mb-3"><Users size={18} className="text-slate-400" /></div>
                            <p className="font-bold text-sm text-slate-500 mb-1">Member Form Column</p>
                            <p className="text-slate-400 text-[10px]">Professional themed profile form for User Book.</p>
                            <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase bg-slate-200 rounded-lg px-2.5 py-1.5 text-slate-400">
                                <AlertCircle size={11} /> Locked
                            </span>
                        </div>
                    )}

                    {/* Testimony */}
                    {canAccessEntrustFeatures ? (
                        <button id="dashboard-testimony-btn" onClick={() => setShowTestimonialModal(true)}
                            className="rounded-[22px] p-4 text-left shadow-lg transition-all relative overflow-hidden group bg-gradient-to-br from-brand-700 to-brand-900 text-white hover:brightness-110 cursor-pointer">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3"><MessageSquare size={18} /></div>
                            <p className="font-bold text-sm leading-tight mb-1">Write Testimony</p>
                            <p className="text-white/70 text-[10px]">Share what God has done</p>
                            <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest rounded-lg px-2.5 py-1.5 bg-white/20">
                                <MessageSquare size={11} /> Write Now
                            </span>
                        </button>
                    ) : (
                        <div className="bg-slate-100 rounded-[22px] p-4 border border-slate-200">
                            <div className="w-9 h-9 bg-slate-200 rounded-xl flex items-center justify-center mb-3"><MessageSquare size={18} className="text-slate-400" /></div>
                            <p className="font-bold text-sm text-slate-500 mb-1">Write Testimony</p>
                            <p className="text-slate-400 text-[10px]">Share what God has done (Restricted)</p>
                            <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase bg-slate-200 rounded-lg px-2.5 py-1.5 text-slate-400">
                                <AlertCircle size={11} /> Locked
                            </span>
                        </div>
                    )}

                    {/* Share Profile Link */}
                    <button id="dashboard-share-btn" onClick={canAccessEntrustFeatures ? handleShare : handleBlockedFeature} disabled={!canAccessEntrustFeatures}
                        className={`rounded-[22px] p-4 text-left shadow-lg transition-all relative overflow-hidden group ${canAccessEntrustFeatures ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white hover:brightness-110' : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'}`}>
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3"><Share2 size={18} /></div>
                        <p className="font-bold text-sm leading-tight mb-1">Share Profile Link</p>
                        <p className={`${canAccessEntrustFeatures ? 'text-white/80' : 'text-slate-400'} text-[10px]`}>Share unique login URL for this profile</p>
                        <span className={`mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest rounded-lg px-2.5 py-1.5 ${canAccessEntrustFeatures ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>
                            <Share2 size={11} /> {canAccessEntrustFeatures ? 'Share' : 'Locked'}
                        </span>
                    </button>

                    {/* Family Portfolio PDF */}
                    <button onClick={canAccessEntrustFeatures ? handleExportProfileDetailsPDF : handleBlockedFeature} disabled={!canAccessEntrustFeatures}
                        className={`rounded-[22px] p-4 text-left shadow-lg transition-all relative overflow-hidden group ${canAccessEntrustFeatures ? 'bg-gradient-to-br from-indigo-700 to-violet-800 text-white hover:brightness-110' : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'}`}>
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3"><FileText size={18} /></div>
                        <p className="font-bold text-sm leading-tight mb-1">Family Portfolio PDF</p>
                        <p className={`${canAccessEntrustFeatures ? 'text-white/80' : 'text-slate-400'} text-[10px]`}>Download a polished member, family, and active-profile portfolio</p>
                        <span className={`mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest rounded-lg px-2.5 py-1.5 ${canAccessEntrustFeatures ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>
                            <Download size={11} /> {canAccessEntrustFeatures ? 'Download PDF' : 'Locked'}
                        </span>
                    </button>

                    {/* Jewish Calendar — amber (full width row) */}
                    {activeProfileId === user.id && (
                        <button onClick={canAccessEntrustFeatures ? () => setIsCalendarModalOpen(true) : handleBlockedFeature} disabled={!canAccessEntrustFeatures}
                            className={`col-span-2 lg:col-span-full rounded-[22px] p-5 text-left shadow-xl transition-all relative overflow-hidden group ${canAccessEntrustFeatures ? 'bg-gradient-to-br from-[#8B4500] via-[#C07000] to-[#D97706] text-white hover:brightness-110' : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'}`}>
                            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-3"><Calendar size={22} /></div>
                            <p className="font-bold text-base leading-tight mb-1">Jewish Calendar 5786</p>
                            <p className={`${canAccessEntrustFeatures ? 'text-white/80' : 'text-slate-400'} text-[11px] mb-0.5`}>Download the official City of Truth Ministries Jewish Calendar.</p>
                            <p className={`${canAccessEntrustFeatures ? 'text-white/60' : 'text-slate-400'} text-[10px] mb-3`}>Pro Max Quality Edition.</p>
                            <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 ${canAccessEntrustFeatures ? 'bg-[#fff8e8] text-[#7B3F00]' : 'bg-slate-200 text-slate-500'}`}>
                                <Download size={12} /> {canAccessEntrustFeatures ? 'DOWNLOAD PDF' : 'LOCKED'}
                            </span>
                            <div className="absolute right-4 bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Calendar size={64} />
                            </div>
                        </button>
                    )}

                    {/* Mobile App — navy (full width row) */}
                    <button type="button" onClick={() => {
                        if (!canAccessEntrustFeatures) {
                            handleBlockedFeature();
                            return;
                        }
                        const link = document.createElement('a');
                        link.href = '/COT Ministries.apk';
                        link.download = 'COT Ministries.apk';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }}
                        className={`col-span-2 lg:col-span-full rounded-[22px] p-5 text-left shadow-xl transition-all relative overflow-hidden group block ${canAccessEntrustFeatures ? 'bg-gradient-to-br from-[#1a237e] to-[#3949ab] text-white hover:brightness-110' : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'}`}>
                        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                            <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-white"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.38.07 2.33.76 3.13.8 1.18-.25 2.31-.94 3.56-.84 1.5.12 2.63.72 3.37 1.8-3.09 1.85-2.56 5.93.28 7.05-.55 1.5-1.27 2.98-2.34 4.07zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                        </div>
                        <p className="font-bold text-base leading-tight mb-1">Get the Mobile App</p>
                        <p className={`${canAccessEntrustFeatures ? 'text-white/80' : 'text-slate-400'} text-[11px] mb-3`}>Access your ID card offline and get instant ministry updates on your Android device.</p>
                        <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 ${canAccessEntrustFeatures ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>
                            <Download size={12} /> {canAccessEntrustFeatures ? 'Download Our App' : 'Locked'}
                        </span>
                        <div className="absolute right-4 bottom-4 opacity-10 group-hover:opacity-20 transition-opacity text-[64px] font-bold">
                            📱
                        </div>
                    </button>

                    {/* WhatsApp Community Group */}
                    <button type="button" onClick={() => {
                        if (!canAccessEntrustFeatures) {
                            handleBlockedFeature();
                            return;
                        }
                        window.open('https://chat.whatsapp.com/KyifBLN6FFzFj8lSfZFrQb?s=cl&p=a&ilr=1&amv=2', '_blank', 'noopener,noreferrer');
                    }}
                        className={`col-span-2 lg:col-span-full rounded-[22px] p-5 text-left shadow-xl transition-all relative overflow-hidden group block ${canAccessEntrustFeatures ? 'bg-gradient-to-br from-[#075e54] to-[#128c7e] text-white hover:brightness-110' : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'}`}>
                        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                            <MessageSquare size={22} className={canAccessEntrustFeatures ? 'text-white' : 'text-slate-400'} />
                        </div>
                        <p className="font-bold text-base leading-tight mb-1">Official WhatsApp Community</p>
                        <p className={`${canAccessEntrustFeatures ? 'text-white/80' : 'text-slate-400'} text-[11px] mb-3`}>Join our official WhatsApp group to connect with other registered members, share fellowship, and receive direct announcements.</p>
                        <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 ${canAccessEntrustFeatures ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            <ExternalLink size={12} /> {canAccessEntrustFeatures ? 'JOIN CHAT' : 'Locked'}
                        </span>
                        <div className="absolute right-4 bottom-4 opacity-10 group-hover:opacity-20 transition-opacity text-[64px] font-bold">
                            💬
                        </div>
                    </button>

                    {/* Menorah Flag Download */}
                    <button type="button" onClick={() => {
                        if (!canAccessEntrustFeatures) {
                            handleBlockedFeature();
                            return;
                        }
                        const link = document.createElement('a');
                        link.href = '/menorah-flag-image.png';
                        link.download = 'COT-Menorah-Flag.png';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }}
                        className={`col-span-2 lg:col-span-full rounded-[22px] p-5 text-left shadow-xl transition-all relative overflow-hidden group block ${canAccessEntrustFeatures ? 'bg-gradient-to-br from-[#7c4d00] to-[#f59e0b] text-white hover:brightness-110' : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'}`}>
                        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-3"><Flag size={22} /></div>
                        <p className="font-bold text-base leading-tight mb-1">Download Menorah Flag</p>
                        <p className={`${canAccessEntrustFeatures ? 'text-white/80' : 'text-slate-400'} text-[11px] mb-3`}>Save the official ministry flag image to your device.</p>
                        <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 ${canAccessEntrustFeatures ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>
                            <Download size={12} /> {canAccessEntrustFeatures ? 'Download Flag' : 'Locked'}
                        </span>
                    </button>

                    {/* Hebrew Alphabet Chart Download */}
                    <button type="button" onClick={() => {
                        if (!canAccessEntrustFeatures) {
                            handleBlockedFeature();
                            return;
                        }
                        const link = document.createElement('a');
                        link.href = '/downloads/Sacred_Alphabet_Gematria_Chart.pdf';
                        link.download = 'Sacred_Alphabet_Gematria_Chart.pdf';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }}
                        className={`col-span-2 lg:col-span-full rounded-[22px] p-5 text-left shadow-xl transition-all relative overflow-hidden group block ${canAccessEntrustFeatures ? 'bg-gradient-to-br from-[#064e3b] to-[#10b981] text-white hover:brightness-110' : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'}`}>
                        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-3"><Download size={22} /></div>
                        <p className="font-bold text-base leading-tight mb-1">Hebrew Alphabet Chart</p>
                        <p className={`${canAccessEntrustFeatures ? 'text-white/80' : 'text-slate-400'} text-[11px] mb-3`}>Sacred Alphabet & Gematria Chart PDF.</p>
                        <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 ${canAccessEntrustFeatures ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>
                            <Download size={12} /> {canAccessEntrustFeatures ? 'Download Chart' : 'Locked'}
                        </span>
                    </button>

                    {/* Entire Website PDFs Download */}
                    <button type="button" onClick={() => {
                        if (!canAccessEntrustFeatures) {
                            handleBlockedFeature();
                            return;
                        }
                        alert("Preparing entire website PDFs bundle... This feature will combine all PDFs into a single ZIP file.");
                    }}
                        className={`col-span-2 lg:col-span-full rounded-[22px] p-5 text-left shadow-xl transition-all relative overflow-hidden group block ${canAccessEntrustFeatures ? 'bg-gradient-to-br from-[#4c1d95] to-[#7c3aed] text-white hover:brightness-110' : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'}`}>
                        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-3"><FileText size={22} /></div>
                        <p className="font-bold text-base leading-tight mb-1">Entire Website PDFs</p>
                        <p className={`${canAccessEntrustFeatures ? 'text-white/80' : 'text-slate-400'} text-[11px] mb-3`}>Download a bundle of all official ministry PDFs.</p>
                        <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 ${canAccessEntrustFeatures ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>
                            <Download size={12} /> {canAccessEntrustFeatures ? 'Download All PDFs' : 'Locked'}
                        </span>
                    </button>

                </div>

                </div>
            </div>

            {/* ── CARD PREVIEW MODAL (Screenshot 3 style) ── */}
            <AnimatePresence>
                {showQrPreview && (
                    <div className="fixed inset-0 z-[82] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-black text-slate-900">My Entrust QR</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowQrPreview(false)}
                                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 mb-4">
                                {qrImageUnavailable ? (
                                    <div className="w-full max-w-[300px] mx-auto px-3 py-8 text-center">
                                        <p className="text-xs font-black text-slate-600 uppercase tracking-wider">QR unavailable</p>
                                        <p className="text-[11px] text-slate-500 mt-2 break-all">{qrUrl}</p>
                                    </div>
                                ) : (
                                        <>
                                            <img
                                                src="/logo.png"
                                                alt="Logo watermark"
                                                className="absolute inset-0 w-full h-full object-contain p-8 opacity-20 pointer-events-none"
                                            />
                                            <img src={qrImgSrc} alt={`QR preview for ${displayProfile.id}`} className="w-full max-w-[300px] mx-auto object-contain relative z-10 mix-blend-multiply" onError={() => setQrImageUnavailable(true)} />
                                        </>
                                )}
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Verification Link</p>
                            <p className="text-xs text-slate-700 break-all bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">{qrUrl}</p>
                            <button
                                type="button"
                                onClick={handleCopyQrLink}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black uppercase tracking-wider transition-colors"
                            >
                                <Copy size={14} /> {qrLinkCopied ? 'Copied' : 'Copy Link'}
                            </button>
                        </motion.div>
                    </div>
                )}
                {showCardPreview && (
                    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/70 backdrop-blur-md p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-2xl">
                            {/* Card preview */}
                            <div className="mb-6 w-full cursor-pointer" onClick={() => { handleDownloadPDF(); setShowCardPreview(false); }}>
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
                                    cardThemeTone="blue"
                                    cardLayoutMode={user.cardLayoutMode}
                                    cardShapeMode={user.cardShapeMode}
                                    cardSizeMode={user.cardSizeMode}
                                />
                                <p className="text-center text-white/60 text-xs mt-3">Tap card to download</p>
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
                <div className="fixed inset-0 z-[70] bg-slate-950/55 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
                    <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[2rem] p-5 sm:p-7 md:p-8 max-w-4xl w-full mx-auto shadow-2xl min-h-[calc(100vh-1rem)] sm:min-h-0 sm:max-h-[94vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl md:text-2xl font-serif font-bold flex items-center gap-2 text-brand-950">
                                <Edit2 size={20} className="text-brand-500" /> Edit Profile Page
                            </h3>
                            <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>

                        {/* Comparison and Photo Section */}
                        {(() => {
                            const pendingPhoto = activeProfileId === user.id
                                ? user.pendingProfileUpdate?.photo
                                : user.pendingProfileUpdate?.linkedProfiles?.find(p => p.id === activeProfileId)?.photo;

                            if (pendingPhoto) {
                                return (
                                    <div className="flex flex-col items-center gap-4 mb-7 bg-slate-50 border border-slate-100 p-5 rounded-[2rem] w-full">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Photo Update Comparison</span>
                                        <div className="flex items-center justify-center gap-8 sm:gap-12 w-full">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-slate-200 shadow-inner bg-slate-100">
                                                    {renderAvatarContent(displayProfile.photo, displayProfile.name, 'text-xl', 'from-slate-400 to-slate-500')}
                                                </div>
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Original</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold font-mono">→</div>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-amber-300 shadow-lg shadow-amber-500/10 ring-4 ring-amber-100/50 bg-amber-50">
                                                    {renderAvatarContent(pendingPhoto, displayProfile.name, 'text-xl', 'from-amber-500 to-orange-600')}
                                                </div>
                                                <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider">Proposed</span>
                                            </div>
                                        </div>
                                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!displayProfile.photo) {
                                                        alert('No existing photo to crop. Use "Add New Photo" first.');
                                                        return;
                                                    }
                                                    setWasEditingBeforeCrop(true);
                                                    setCropTarget(activeProfileId === user.id
                                                        ? { type: 'primary', isNewUpload: false }
                                                        : { type: 'linked-profile', profileId: activeProfileId, isNewUpload: false });
                                                    setCroppingImage(displayProfile.photo);
                                                    setIsEditing(false);
                                                }}
                                                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                                            >
                                                <Camera size={14} /> Recrop Original Photo
                                            </button>
                                            <label className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100 cursor-pointer">
                                                <UploadCloud size={14} /> Replace Proposed Photo
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        setWasEditingBeforeCrop(true);
                                                        handlePhotoUpload(e);
                                                        setIsEditing(false);
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-slate-400 text-[10px] text-center">Your photo update will take effect after admin approval.</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="flex flex-col items-center gap-3 mb-7">
                                    <div className="relative group">
                                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-lg relative">
                                            {renderAvatarContent(displayProfile.photo, displayProfile.name, 'text-2xl', 'from-brand-600 via-brand-700 to-violet-800')}
                                            {displayProfile.photo && (
                                                <a
                                                    href={displayProfile.photo}
                                                    download={`${displayProfile.name.replace(/\s+/g, '_')}_photo`}
                                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Download Photo"
                                                >
                                                    <Download size={24} className="text-white" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!displayProfile.photo) {
                                                    alert('No existing photo to crop. Use "Add New Photo" first.');
                                                    return;
                                                }
                                                setWasEditingBeforeCrop(true);
                                                setCropTarget(activeProfileId === user.id
                                                    ? { type: 'primary', isNewUpload: false }
                                                    : { type: 'linked-profile', profileId: activeProfileId, isNewUpload: false });
                                                setCroppingImage(displayProfile.photo);
                                                setIsEditing(false);
                                            }}
                                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                                        >
                                            <Camera size={14} /> Edit/Crop Current Photo
                                        </button>
                                        <label className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 cursor-pointer">
                                            <UploadCloud size={14} /> {user.role === 'Admin' ? 'Add New Photo (Direct)' : 'Add New Photo (Approval)'}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    setWasEditingBeforeCrop(true);
                                                    handlePhotoUpload(e);
                                                    setIsEditing(false);
                                                }}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-slate-400 text-xs text-center">All photo and profile changes are sent to admin for approval.</p>
                                </div>
                            );
                        })()}

                        {/* Details Comparison Section if there is a pending text detail */}
                        {user.pendingProfileUpdate && Object.keys(user.pendingProfileUpdate).filter(k => k !== 'photo' && k !== 'linkedProfiles').some(k => (user.pendingProfileUpdate as any)[k] !== (user as any)[k]) && (
                            <div className="mb-7 bg-amber-50/50 border border-amber-100/60 p-5 rounded-[2rem] w-full">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                    <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest">Pending Profile Changes Awaiting Approval</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium">
                                    {Object.entries(user.pendingProfileUpdate)
                                        .filter(([key]) => key !== 'photo' && key !== 'linkedProfiles')
                                        .map(([key, pendingVal]) => {
                                            const originalVal = (user as any)[key];
                                            if (pendingVal && pendingVal !== originalVal) {
                                                const label = key === 'emergency' ? 'Emergency Contact' : key.charAt(0).toUpperCase() + key.slice(1);
                                                return (
                                                    <div key={key} className="bg-white border border-amber-200/50 rounded-2xl p-3 shadow-sm flex flex-col">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">{label}</span>
                                                        <span className="text-slate-500 line-through">Original: {originalVal || 'Not provided'}</span>
                                                        <span className="text-amber-700 font-bold mt-0.5">Proposed: {pendingVal}</span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                </div>
                            </div>
                        )}

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const requestedChanges = {
                                name: (formData.name ?? user.name)?.trim(),
                                phone: formData.phone ?? user.phone,
                                email: (formData.email ?? user.email)?.trim(),
                                location: (formData.location ?? user.location)?.trim(),
                                emergency: formData.emergency ?? user.emergency,
                                dob: (formData as any).dob || '',
                                memberSince: (formData as any).memberSince || '',
                                joinedDate: (formData as any).joinedDate || '',
                            };
                            onUpdate({ ...user, pendingProfileUpdate: requestedChanges } as User);
                            setIsEditing(false);
                        }} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeProfileId === user.id ? (
                                <>
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
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Date of Birth</label>
                                        <input type="date" value={(formData as any).dob ?? (user as any).dob ?? ''} onChange={e => setFormData(p => ({ ...p, dob: e.target.value } as any))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-brand-500" />
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
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Joined Date</label>
                                        <input type="date" readOnly disabled value={(formData as any).joinedDate ?? user.joinedDate ?? ''} className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 outline-none cursor-not-allowed opacity-70" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Full Name</label>
                                        <input type="text" value={formData.name || ''} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-brand-500" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Role / Relationship</label>
                                        <select
                                            value={(formData as any).role || ''}
                                            onChange={e => setFormData(p => ({ ...p, role: e.target.value } as any))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-brand-500"
                                        >
                                            <option value="">Select Relationship</option>
                                            <option value="Spouse">Spouse</option>
                                            <option value="Child">Child</option>
                                            <option value="Parent">Parent</option>
                                            <option value="Sibling">Sibling</option>
                                            <option value="Relative">Relative</option>
                                            <option value="Dependent">Dependent</option>
                                            <option value="Guardian">Guardian</option>
                                            <option value="Ministry Partner">Ministry Partner</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Date of Birth</label>
                                        <input type="date" value={(formData as any).dob || ''} onChange={e => setFormData(p => ({ ...p, dob: e.target.value } as any))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-brand-500" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Blood Group</label>
                                        <select value={(formData as any).bloodGroup || ''} onChange={e => setFormData(p => ({ ...p, bloodGroup: e.target.value } as any))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-brand-500">
                                            <option value="">Select Blood Group</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 font-medium">
                                ⚠️ Detail changes require admin approval and will be reflected after review.
                            </div>

                            {onDeleteAccount && activeProfileId === user.id && (
                                <div className="mt-8 pt-6 border-t border-red-100">
                                    <h4 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-2">Danger Zone</h4>
                                    <p className="text-xs text-slate-500 mb-4">Once you delete your account, it is permanently deleted. This action is irreversible.</p>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (window.confirm("Are you absolutely sure you want to permanently delete your account? This action cannot be undone.")) {
                                                if (window.confirm("Confirming again: All your profile data and registration will be permanently erased. Do you wish to proceed?")) {
                                                    try {
                                                        setIsProcessing(true);
                                                        await onDeleteAccount();
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert("Failed to delete account. Please try again.");
                                                    } finally {
                                                        setIsProcessing(false);
                                                    }
                                                }
                                            }
                                        }}
                                        className="w-full sm:w-auto px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                    >
                                        Delete Account Permanently
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={cancelEditing} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-all shadow-lg shadow-brand-500/20">Submit for Approval</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* ── Dashboard Guided Tour ── */}
            <WelcomeTourModal
                isOpen={dashboardTour.showWelcome}
                onStartTour={dashboardTour.start}
                onSkip={() => { dashboardTour.setShowWelcome(false); localStorage.setItem('cot_tour_user_dashboard', '1'); }}
                userName={user.name}
            />
            <GuidedTour
                steps={dashboardTourSteps}
                isActive={dashboardTour.isActive}
                onComplete={dashboardTour.stop}
                onSkip={dashboardTour.stop}
                tourName="user_dashboard"
                accentColor="#4f46e5"
            />

            {/* Tour trigger button */}
            <button
                onClick={dashboardTour.start}
                title="Start guided tour"
                className="fixed bottom-20 right-4 z-50 w-10 h-10 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-lg flex items-center justify-center text-lg font-black transition-all hover:scale-110 active:scale-95"
                style={{ boxShadow: '0 4px 20px rgba(79,70,229,0.4)' }}
            >
                ?
            </button>

            {/* WhatsApp Invite Modal */}
            <AnimatePresence>
                {showWhatsAppInviteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setShowWhatsAppInviteModal(false);
                                try { localStorage.setItem(`cot_whatsapp_invited_${displayProfile.id}`, 'true'); } catch {}
                            }}
                            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-[32px] p-6 shadow-2xl border border-slate-100 overflow-hidden text-center z-10"
                        >
                            {/* Decorative background gradients */}
                            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#25D366]/10 rounded-full blur-3xl" />
                            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl" />

                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#075e54] to-[#25D366] rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-emerald-500/20">
                                <MessageSquare size={32} />
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2">
                                You are Approved! 🎉
                            </h3>
                            <p className="text-sm font-bold text-[#075e54] mb-3 uppercase tracking-widest">
                                Join the WhatsApp Community
                            </p>
                            
                            <p className="text-slate-600 text-xs font-semibold leading-relaxed mb-6 px-2">
                                Shalom, {displayProfile.name}! Your account has been officially approved. We invite you to join our official WhatsApp Community Group to stay connected, receive announcements, and grow in fellowship.
                            </p>

                            <div className="flex flex-col gap-2.5">
                                <button
                                    onClick={() => {
                                        window.open('https://chat.whatsapp.com/KyifBLN6FFzFj8lSfZFrQb?s=cl&p=a&ilr=1&amv=2', '_blank', 'noopener,noreferrer');
                                        setShowWhatsAppInviteModal(false);
                                        try { localStorage.setItem(`cot_whatsapp_invited_${displayProfile.id}`, 'true'); } catch {}
                                    }}
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#075e54] to-[#128c7e] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <ExternalLink size={14} /> Join WhatsApp Group
                                </button>
                                <button
                                    onClick={() => {
                                        setShowWhatsAppInviteModal(false);
                                        try { localStorage.setItem(`cot_whatsapp_invited_${displayProfile.id}`, 'true'); } catch {}
                                    }}
                                    className="w-full py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-slate-100"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};
