import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
    Users, UserCheck, UserX, Clock, Search, Edit2, Trash2, X, User as UserIcon, ShieldAlert,
    ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Filter, Mail, Phone, MapPin, Droplet,
    Calendar, Award, Shield, ShieldCheck, AlertCircle, CheckCircle, QrCode, Download,
    Save, GripVertical, Globe, Plus, ImagePlus, Camera, Image as ImageIcon, MessageSquare, Check, XCircle, FileText,
    PanelLeft, PanelTop, Database, RotateCcw, Dice6, Eye, EyeOff, Play
} from 'lucide-react';
import { User, UserRole, UserStatus, Testimonial, Ministry, DeletedUser } from '../types';
import { Button } from './Button';
import { api } from '../services/api';
import { firebaseConfig, storage } from '../services/firebase';
import { listAll, ref as storageRef } from 'firebase/storage';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { ImageCropper } from './ImageCropper';
import { EntrustCard3D } from './WorshipperIDCard';
import { AdminIDCard } from './AdminIDCard';
import { CotIdEpicDice } from './CotIdEpicDice';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
    source: 'hero-widget' | 'contact-form';
    senderType?: 'Registered' | 'Non-Registered';
    senderId?: string;
    deletedAt?: string;
    autoDeleteAt?: string;
}

interface MemberNotification {
    id: string;
    userId: string;
    from: 'admin' | 'user';
    message: string;
    createdAt: string;
    read?: boolean;
    deletedAt?: string;
    autoDeleteAt?: string;
}

interface AdminDashboardProps {
    users: User[];
    deletedUsers?: DeletedUser[];
    contactMessages?: ContactMessage[];
    deletedContactMessages?: ContactMessage[];
    memberNotifications?: MemberNotification[];
    deletedMemberNotifications?: MemberNotification[];
    onSendMessageToUsers?: (targetUserIds: string[], message: string) => void;
    onDeleteContactMessage?: (messageId: string) => void;
    onRestoreContactMessage?: (messageId: string) => void;
    onDeleteMemberNotification?: (notificationId: string) => void;
    onRestoreMemberNotification?: (notificationId: string) => void;
    onUpdateUser: (user: User) => Promise<void>;
    onDeleteUser: (userId: string) => Promise<void>;
    onRestoreUser?: (userId: string) => Promise<void>;
    onPermanentlyDeleteUser?: (userId: string) => Promise<void>;
    onCreateUser?: (user: User) => Promise<void>;
    onReassignUserId?: (oldUserId: string, newUserId: string, updatedUser: User) => Promise<void>;
    onBack: () => void;
    homeSectionsOrder: string[];
    onUpdateHomeSectionsOrder: (newOrder: string[]) => Promise<void>;
    navItems?: any[];
    onUpdateNavItems?: (newItems: any[]) => Promise<void>;
}

const HOME_SECTIONS_INFO: Record<string, { name: string; desc: string; icon: any; color: string }> = {
    hero: { name: 'Hero Welcome', desc: 'Main entrance with video & primary CTA', icon: Globe, color: 'bg-brand-500' },
    about: { name: 'About Ministry', desc: 'Mission, vision and core values', icon: Users, color: 'bg-blue-500' },
    menorah: { name: 'Golden Menorah', desc: 'Spiritual significance and flag', icon: Award, color: 'bg-amber-500' },
    highlights: { name: 'Ministry Moments', desc: 'Global highlights and focus', icon: ImagePlus, color: 'bg-sky-500' },
    leader: { name: 'Leader Message', desc: 'Direct word from ministry leadership', icon: ShieldCheck, color: 'bg-indigo-500' },
    hebrew: { name: 'Hebrew Sanctuary', desc: 'Language and spiritual resources', icon: Mail, color: 'bg-rose-500' },
    hebrewPages: { name: 'All Page Previews', desc: 'Hebrew content, tools, and page preview cards', icon: Globe, color: 'bg-fuchsia-500' },
    pastorBaruch: { name: 'Pastor & Baruch', desc: 'Pastor page and worship preview', icon: Award, color: 'bg-amber-600' },
    valparai: { name: 'Valparai Presence', desc: 'Local impact and community', icon: MapPin, color: 'bg-emerald-500' },
    testimonials: { name: 'Voices of Faith', desc: 'Member stories and testimonies', icon: MessageSquare, color: 'bg-teal-500' },
    members: { name: 'Member Initials', desc: 'Names with two-letter identity logos', icon: Users, color: 'bg-orange-500' },
    preview: { name: 'Entrust Preview', desc: 'Quick overview of community card', icon: Phone, color: 'bg-violet-500' },
    donations: { name: 'Donations', desc: 'Support boxes and giving section', icon: CheckCircle, color: 'bg-orange-500' },
    verify: { name: 'Verify ID', desc: 'Security and verification portal', icon: CheckCircle, color: 'bg-slate-500' }
};



const TAB_ITEMS: { id: 'users' | 'edit-page' | 'testimonials' | 'ministries' | 'id-cards' | 'cot-id-manager' | 'reports' | 'home-layout' | 'menu-editor' | 'messages' | 'firebase' | 'recycle-bin'; label: string; icon: React.ElementType }[] = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'edit-page', label: 'Edit Page', icon: Edit2 },
    { id: 'recycle-bin', label: 'Recycle Bin', icon: RotateCcw },
    { id: 'firebase', label: 'Firebase', icon: Database },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'ministries', label: 'Ministries', icon: Globe },
    { id: 'id-cards', label: 'ID Cards', icon: QrCode },
    { id: 'cot-id-manager', label: 'COT ID Manager', icon: Dice6 },
    { id: 'reports', label: 'Monthly Reports', icon: FileText },
    { id: 'home-layout', label: 'Home Layout', icon: GripVertical },
    { id: 'menu-editor', label: 'Menu Editor', icon: Filter },
];

const COMMON_DISAPPROVE_REASONS = [
    'Incomplete or invalid profile information',
    'Entrust/verification document is unclear',
    'Duplicate account or conflicting member details',
    'Manual ministry review required before approval',
];

const TAMIL_NADU_DISTRICTS = [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
    'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram',
    'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
    'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
    'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
    'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
    'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
    'Vellore', 'Villupuram', 'Virudhunagar'
];
const MAX_SUGGESTED_COT_IDS = 200;
const ADMIN_PASSWORD_OVERRIDE_KEY = 'cot_admin_password_override';
const ADMIN_PASSWORD_CHANGE_PHRASE = 'king steve harrington';
const SAFE_IMAGE_HOSTS = new Set([
    'firebasestorage.googleapis.com',
    'lh3.googleusercontent.com',
    'avatars.githubusercontent.com',
    'user-attachments.githubusercontent.com',
    'raw.githubusercontent.com',
    'ui-avatars.com',
]);
const EDIT_PAGE_FIELDS: Array<{ key: keyof User; label: string }> = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'location', label: 'Location' },
    { key: 'emergency', label: 'Emergency Contact' },
    { key: 'memberSince', label: 'Member Since' },
    { key: 'joinedDate', label: 'Joined Date' },
    { key: 'photo', label: 'Profile Photo' },
];
type WebsiteChangeItem = { date: string; type: string; detail: string };

const getSafeImageSrc = (candidate?: string): string | null => {
    const value = `${candidate || ''}`.trim();
    if (!value) return null;
    if (/^data:image\/(?:png|jpe?g|webp|gif|bmp);base64,/i.test(value)) return value;
    if (!/^https?:\/\//i.test(value)) return null;
    try {
        const parsed = new URL(value);
        if ((parsed.protocol === 'https:' || parsed.protocol === 'http:') && SAFE_IMAGE_HOSTS.has(parsed.hostname)) {
            return parsed.toString();
        }
        return null;
    } catch {
        return null;
    }
};

const toMonthKey = (value?: string) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().slice(0, 7);
};

const formatMonthLabel = (monthKey: string) => {
    if (!monthKey) return 'Unknown Month';
    const [year, month] = monthKey.split('-');
    const parsed = new Date(Number(year), Number(month) - 1, 1);
    return parsed.toLocaleString(undefined, { month: 'long', year: 'numeric' });
};

const EMPTY_NEW_USER = {
    memberId: '',
    name: '',
    phone: '',
    email: '',
    location: 'Valparai',
    role: 'Member' as UserRole,
    photo: '',
    emergency: '',
    memberSince: new Date().getFullYear().toString(),
    joinedDate: new Date().toISOString().split('T')[0],
};

type UserQuickViewMode = 'photos' | 'ids' | 'cards' | 'locations' | 'join-dates';

const USER_QUICK_VIEW_OPTIONS: { id: UserQuickViewMode; label: string; description: string; icon: React.ElementType; accent: string; bg: string }[] = [
    { id: 'photos', label: 'Images', description: 'Show only member photos', icon: ImageIcon, accent: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'ids', label: 'COT IDs', description: 'Show only member IDs', icon: Shield, accent: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'cards', label: 'Entrust Cards', description: 'Show member entrust cards', icon: QrCode, accent: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'locations', label: 'Locations', description: 'Show member locations', icon: MapPin, accent: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'join-dates', label: 'Join Dates', description: 'Show all member join dates', icon: Calendar, accent: 'text-amber-600', bg: 'bg-amber-50' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    users,
    deletedUsers = [],
    contactMessages = [],
    deletedContactMessages = [],
    memberNotifications = [],
    deletedMemberNotifications = [],
    onSendMessageToUsers,
    onDeleteContactMessage,
    onRestoreContactMessage,
    onDeleteMemberNotification,
    onRestoreMemberNotification,
    onUpdateUser,
    onDeleteUser,
    onRestoreUser,
    onPermanentlyDeleteUser,
    onCreateUser,
    onReassignUserId,
    onBack,
    homeSectionsOrder,
    onUpdateHomeSectionsOrder,
    navItems = [],
    onUpdateNavItems,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<UserStatus | 'All'>('All');
    const [filterRole, setFilterRole] = useState<UserRole | 'All'>('All');
    const [filterLocation, setFilterLocation] = useState<string>('All');
    const [userSortMode, setUserSortMode] = useState<'status' | 'cot-id' | 'member-since'>('status');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [viewingQrUser, setViewingQrUser] = useState<User | null>(null);
    const [viewingDetailsUser, setViewingDetailsUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Add New User state
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUserData, setNewUserData] = useState({ ...EMPTY_NEW_USER });
    const [newUserCropImage, setNewUserCropImage] = useState<string | null>(null);
    const [isNewUserCropping, setIsNewUserCropping] = useState(false);

    // Bulk delete state
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [selectedDeletedUsers, setSelectedDeletedUsers] = useState<Set<string>>(new Set());
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [downloadingCardUserId, setDownloadingCardUserId] = useState<string | null>(null);
    const [downloadingProfilePdfUserId, setDownloadingProfilePdfUserId] = useState<string | null>(null);
    const [downloadingMemberFormPdfUserId, setDownloadingMemberFormPdfUserId] = useState<string | null>(null);
    const [failedMinistryImages, setFailedMinistryImages] = useState<Record<string, boolean>>({});
    const [userQuickViewMode, setUserQuickViewMode] = useState<UserQuickViewMode | null>(null);

    const [activeTab, setActiveTab] = useState<'users' | 'edit-page' | 'testimonials' | 'ministries' | 'id-cards' | 'cot-id-manager' | 'reports' | 'home-layout' | 'menu-editor' | 'messages' | 'firebase' | 'recycle-bin'>('users');
    const [menuMode, setMenuMode] = useState<'horizontal' | 'vertical'>(() => {
        try {
            const stored = localStorage.getItem('adminMenuMode');
            return stored === 'vertical' ? 'vertical' : 'horizontal';
        } catch {
            return 'horizontal';
        }
    });

    const toggleMenuMode = () => {
        const next = menuMode === 'horizontal' ? 'vertical' : 'horizontal';
        setMenuMode(next);
        try {
            localStorage.setItem('adminMenuMode', next);
        } catch {
            // Ignore storage write failures (e.g., private mode restrictions)
        }
    };
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [ministries, setMinistries] = useState<Ministry[]>([]);
    const [editingMinistry, setEditingMinistry] = useState<Partial<Ministry> | null>(null);
    const [hasOrderChanges, setHasOrderChanges] = useState(false);
    const [isCropping, setIsCropping] = useState(false);
    const [cropImage, setCropImage] = useState<string | null>(null);
    const [croppingType, setCroppingType] = useState<'user' | 'ministry' | null>(null);
    const [storageFiles, setStorageFiles] = useState<string[]>([]);
    const [isLoadingStorage, setIsLoadingStorage] = useState(false);
    const [isStorageListTruncated, setIsStorageListTruncated] = useState(false);
    const [targetCotIdInput, setTargetCotIdInput] = useState('');
    const [selectedCotIds, setSelectedCotIds] = useState<string[]>([]);
    const [bulkAdminMessage, setBulkAdminMessage] = useState('');
    const [cotManagerQuery, setCotManagerQuery] = useState('');
    const [cotDraftIds, setCotDraftIds] = useState<Record<string, string>>({});
    const [cotManagerMode, setCotManagerMode] = useState<'manual' | 'random' | 'requests'>('manual');
    const [cotManagerSelectedUserId, setCotManagerSelectedUserId] = useState('');
    const [cotIdSearchInput, setCotIdSearchInput] = useState('');
    const [cotIdSearchFeedback, setCotIdSearchFeedback] = useState<{ type: 'occupied' | 'available' | 'invalid'; message: string } | null>(null);
    const [diceRolling, setDiceRolling] = useState(false);
    const [diceUserQuery, setDiceUserQuery] = useState('');
    const [diceTargetUserId, setDiceTargetUserId] = useState('');
    const [dicePickedCotId, setDicePickedCotId] = useState('');
    const [diceManualInput, setDiceManualInput] = useState('');
    const [messageRestoreUserFilter, setMessageRestoreUserFilter] = useState('');
    const [selectedMessageLocations, setSelectedMessageLocations] = useState<string[]>([]);
    const [selectedMessageYears, setSelectedMessageYears] = useState<string[]>([]);
    const [selectedMessageCategories, setSelectedMessageCategories] = useState<UserStatus[]>([]);
    const [isMessageComposerMinimized, setIsMessageComposerMinimized] = useState(false);
    const [isMessageComposerClosed, setIsMessageComposerClosed] = useState(false);
    const [selectedReportMonth, setSelectedReportMonth] = useState(() => new Date().toISOString().slice(0, 7));
    const [adminPasswordDraft, setAdminPasswordDraft] = useState('');
    const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');
    const [adminPasswordPhrase, setAdminPasswordPhrase] = useState('');
    const [showAdminPasswordDraft, setShowAdminPasswordDraft] = useState(false);
    const [showAdminPasswordConfirm, setShowAdminPasswordConfirm] = useState(false);
    const [showAdminPasswordPhrase, setShowAdminPasswordPhrase] = useState(false);
    const [adminPasswordMessage, setAdminPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [memberFormPageUser, setMemberFormPageUser] = useState<User | null>(null);
    const [hasAdminPasswordOverride, setHasAdminPasswordOverride] = useState(() => {
        try {
            return !!localStorage.getItem(ADMIN_PASSWORD_OVERRIDE_KEY);
        } catch {
            return false;
        }
    });

    React.useEffect(() => {
        if (activeTab === 'messages') {
            api.getTestimonials().then(setTestimonials);
        } else if (activeTab === 'ministries') {
            api.getMinistries().then((items) => {
                setMinistries(items);
                setFailedMinistryImages({});
            });
        }
    }, [activeTab]);

    React.useEffect(() => {
        if (activeTab !== 'firebase') return;

        const loadStorageFiles = async () => {
            setIsLoadingStorage(true);
            try {
                const MAX_FILES = 120;
                const files: string[] = [];
                let truncated = false;

                const walk = async (folder: ReturnType<typeof storageRef>) => {
                    if (files.length >= MAX_FILES) {
                        truncated = true;
                        return;
                    }
                    const result = await listAll(folder);
                    for (const item of result.items) {
                        files.push(item.fullPath);
                        if (files.length >= MAX_FILES) {
                            truncated = true;
                            break;
                        }
                    }
                    if (files.length >= MAX_FILES) return;
                    for (const childFolder of result.prefixes) {
                        await walk(childFolder);
                        if (files.length >= MAX_FILES) {
                            truncated = true;
                            return;
                        }
                    }
                };

                await walk(storageRef(storage, '/'));
                setStorageFiles(files);
                setIsStorageListTruncated(truncated);
            } catch (error) {
                console.error('Failed to list Firebase storage files', error);
                setStorageFiles([]);
                setIsStorageListTruncated(false);
            } finally {
                setIsLoadingStorage(false);
            }
        };

        loadStorageFiles();
    }, [activeTab]);

    const handleUpdateTestimonialStatus = async (testimonial: Testimonial, status: 'Approved' | 'Rejected') => {
        try {
            const updated = { ...testimonial, status };
            await api.updateTestimonial(updated);
            setTestimonials(prev => prev.map(t => t.id === testimonial.id ? updated : t));
        } catch (error) {
            console.error('Failed to update testimonial', error);
        }
    };

    const handleDeleteTestimonial = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
        try {
            await api.deleteTestimonial(id);
            setTestimonials(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error('Failed to delete testimonial', error);
        }
    };

    const detectDate = (filename: string): string => {
        const match = filename.match(/(\d{4})[-_]?(\d{2})[-_]?(\d{2})/);
        if (match) {
            return `${match[1]}-${match[2]}-${match[3]}`;
        }
        const compact = filename.match(/\b(\d{8})\b/);
        if (compact) {
            const value = compact[1];
            return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
        }
        const dayMonthYear = filename.match(/\b(\d{2})[-_](\d{2})[-_](\d{4})\b/);
        if (dayMonthYear) {
            const day = Number(dayMonthYear[1]);
            const month = Number(dayMonthYear[2]);
            const year = dayMonthYear[3];
            if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        }
        return new Date().toISOString().split('T')[0];
    };
    const inferMinistryMediaType = (media?: Pick<Ministry, 'mediaType' | 'image'>): 'image' | 'video' => {
        if (media?.mediaType === 'video' || media?.mediaType === 'image') return media.mediaType;
        const src = `${media?.image || ''}`.trim().toLowerCase();
        if (!src) return 'image';
        if (src.startsWith('data:video/')) return 'video';
        if (/\.(mp4|mov|webm|ogg|m4v)(\?.*)?$/.test(src)) return 'video';
        return 'image';
    };
    const formatMediaDuration = (seconds: number) => {
        if (!Number.isFinite(seconds) || seconds <= 0) return '';
        const rounded = Math.round(seconds);
        const hrs = Math.floor(rounded / 3600);
        const mins = Math.floor((rounded % 3600) / 60);
        const secs = rounded % 60;
        if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        return `${mins}:${String(secs).padStart(2, '0')}`;
    };
    const detectVideoDuration = (file: File): Promise<string> => new Promise((resolve) => {
        const objectUrl = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            const formatted = formatMediaDuration(video.duration);
            URL.revokeObjectURL(objectUrl);
            resolve(formatted);
        };
        video.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve('');
        };
        video.src = objectUrl;
    });


    const handleSaveMinistry = async () => {
        if (!editingMinistry?.image) {
            alert("Image is required.");
            return;
        }
        setIsLoading(true);
        try {
            const ministryData = {
                ...editingMinistry,
                date: editingMinistry.date || new Date().toISOString().split('T')[0],
                name: editingMinistry.name || '',
                description: editingMinistry.description || '',
                mediaType: inferMinistryMediaType(editingMinistry as Pick<Ministry, 'mediaType' | 'image'>),
                duration: (editingMinistry.duration || '').trim()
            };

            if (editingMinistry.id) {
                await api.updateMinistry(ministryData as Ministry);
                setMinistries(prev => prev.map(m => m.id === editingMinistry.id ? (ministryData as Ministry) : m));
                setFailedMinistryImages(prev => {
                    const next = { ...prev };
                    delete next[editingMinistry.id as string];
                    return next;
                });
            } else {
                const newMin = await api.createMinistry(ministryData as Omit<Ministry, 'id'>);
                setMinistries(prev => [...prev, newMin]);
                setFailedMinistryImages(prev => {
                    const next = { ...prev };
                    delete next[newMin.id];
                    return next;
                });
            }
            setEditingMinistry(null);
        } catch (error) {
            console.error('Failed to save ministry', error);
            alert("Failed to save ministry.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteMinistry = async (id: string) => {
        if (!window.confirm("Delete this ministry?")) return;
        try {
            await api.deleteMinistry(id);
            setMinistries(prev => prev.filter(m => m.id !== id));
            setHasOrderChanges(false); // Reset on delete
        } catch (error) {
            console.error('Failed to delete ministry', error);
        }
    };

    const handleSaveOrder = async () => {
        setIsLoading(true);
        try {
            await api.updateMinistriesOrder(ministries);
            setHasOrderChanges(false);
            alert("Order saved successfully!");
        } catch (error) {
            console.error('Failed to save order', error);
            alert("Failed to save order.");
        } finally {
            setIsLoading(false);
        }
    };

    // Statistics
    const stats = useMemo(() => ({
        total: users.length,
        active: users.filter(u => u.status === 'Active').length,
        pending: users.filter(u => u.status === 'Pending Verification').length,
        rejected: users.filter(u => u.status === 'Rejected').length,
    }), [users]);

    const locationStats = useMemo(() => {
        const counts = users.reduce<Record<string, number>>((acc, user) => {
            const key = user.location?.trim() || 'Unknown';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(counts)
            .map(([location, count]) => ({ location, count }))
            .sort((a, b) => b.count - a.count || a.location.localeCompare(b.location));
    }, [users]);
    const userLocationOptions = useMemo(
        () => Array.from(new Set(users.map(user => (user.location || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
        [users]
    );

    const selectedQuickView = useMemo(
        () => USER_QUICK_VIEW_OPTIONS.find(option => option.id === userQuickViewMode) || null,
        [userQuickViewMode]
    );
    const pendingEditUsers = useMemo(
        () => users.filter(user => !!user.pendingProfileUpdate && Object.keys(user.pendingProfileUpdate).length > 0),
        [users]
    );

    const formatDateValue = (value?: string) => {
        if (!value) return 'Not provided';
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
    };

    const formatCotId = (num: number) => `COT-${String(num).padStart(4, '0')}`;
    const normalizeCotIdInput = (value: string) => {
        const raw = (value || '').trim().toUpperCase();
        if (!raw) return '';
        if (/^COT-\d{1,}$/i.test(raw)) {
            const numeric = raw.replace(/^COT-/i, '');
            return formatCotId(Number(numeric));
        }
        const digits = raw.replace(/\D/g, '');
        if (!digits) return raw;
        return formatCotId(Number(digits));
    };
    const parseCotNumber = (id: string): number | null => {
        const match = /^COT-(\d{1,})$/i.exec((id || '').trim());
        if (!match) return null;
        const num = Number(match[1]);
        return Number.isFinite(num) && num > 0 ? num : null;
    };

    const existingCotIds = useMemo(() => {
        return new Set(
            users
                .map(user => `${user.id ?? ''}`.trim().toUpperCase())
                .filter(id => /^COT-\d{4,}$/i.test(id))
        );
    }, [users]);

    const maxOccupiedCotNumber = useMemo(() => {
        const max = users.reduce((acc, user) => {
            const parsed = parseCotNumber(user.id);
            return parsed && parsed > acc ? parsed : acc;
        }, 0);
        return Math.max(max, 0);
    }, [users]);

    const cotIdInventoryUpperBound = useMemo(
        () => Math.max(maxOccupiedCotNumber + 200, 1000),
        [maxOccupiedCotNumber]
    );

    const allAvailableCotIds = useMemo(() => {
        const ids: string[] = [];
        for (let idNum = 1; idNum <= cotIdInventoryUpperBound; idNum += 1) {
            const candidate = formatCotId(idNum);
            if (!existingCotIds.has(candidate)) ids.push(candidate);
        }
        return ids;
    }, [cotIdInventoryUpperBound, existingCotIds]);

    const suggestedCotIds = useMemo(() => {
        const shuffled = [...allAvailableCotIds];
        for (let i = shuffled.length - 1; i > 0; i -= 1) {
            const buffer = new Uint32Array(1);
            if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
                crypto.getRandomValues(buffer);
            } else {
                buffer[0] = i;
            }
            const j = buffer[0] % (i + 1);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, MAX_SUGGESTED_COT_IDS);
    }, [allAvailableCotIds]);

    const cotIdInventory = useMemo(
        () => Array.from({ length: maxOccupiedCotNumber }, (_, index) => formatCotId(index + 1)),
        [maxOccupiedCotNumber]
    );
    const cotIdOwnerById = useMemo(() => {
        const map = new Map<string, User>();
        users.forEach((user) => {
            const key = (user.id || '').toUpperCase();
            if (/^COT-\d{4,}$/.test(key)) map.set(key, user);
        });
        return map;
    }, [users]);
    const shuffledCotIdInventory = useMemo(() => {
        const items = [...cotIdInventory];
        for (let i = items.length - 1; i > 0; i -= 1) {
            const rand = Math.floor(Math.random() * (i + 1));
            [items[i], items[rand]] = [items[rand], items[i]];
        }
        return items;
    }, [cotIdInventory]);

    const getRandomAvailableCotId = () => {
        if (allAvailableCotIds.length === 0) return null;
        if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
            const randomBuffer = new Uint32Array(1);
            crypto.getRandomValues(randomBuffer);
            return allAvailableCotIds[randomBuffer[0] % allAvailableCotIds.length];
        }
        return allAvailableCotIds[0];
    };

    const getDayOfYear = (date: Date) => {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date.getTime() - start.getTime();
        return Math.floor(diff / (24 * 60 * 60 * 1000));
    };

    const getUserSignature = (value: string) =>
        (value || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const getDayMethodCotId = (userId: string) => {
        if (allAvailableCotIds.length === 0) return null;
        const now = new Date();
        const day = getDayOfYear(now);
        const year = now.getFullYear() % 100;
        const signature = getUserSignature(userId || 'COT');
        const preferredNumber = Number(`${year.toString().padStart(2, '0')}${(day % 366).toString().padStart(3, '0')}`) + (signature % 997);
        const preferredCotId = formatCotId(preferredNumber);
        if (!existingCotIds.has(preferredCotId)) return preferredCotId;
        const sortedAvailable = [...allAvailableCotIds].sort();
        const fallback = sortedAvailable.find((id) => parseCotNumber(id) && (parseCotNumber(id)! + signature + day) % 7 === 0);
        return fallback || getRandomAvailableCotId();
    };

    const isCotId = (id: string) => /^COT-\d{4,}$/i.test((id || '').trim());

    const cotUsers = useMemo(
        () => users.filter(user => isCotId(user.id)),
        [users]
    );

    const userReplies = useMemo(
        () => memberNotifications.filter(note => note.from === 'user').sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        [memberNotifications]
    );

    const cotIdChangeRequests = useMemo(() => {
        const idRequestPattern = /(change|new|different).*(cot|id)|(cot|id).*(change|new|different)|not.*like.*id/i;
        return userReplies
            .filter(note => idRequestPattern.test(note.message || ''))
            .map(note => ({
                ...note,
                user: users.find(user => user.id === note.userId) || null
            }));
    }, [userReplies, users]);

    const cotIdRequestInsights = useMemo(() => {
        const classifyRequest = (message: string) => {
            const value = (message || '').toLowerCase();
            if (/not.*like|dislike|don'?t.*like|change/.test(value)) return 'Dislike Current ID';
            if (/new|different|another|reassign/.test(value)) return 'Need New ID';
            return 'General ID Help';
        };
        const enhanced = cotIdChangeRequests.map(request => ({
            ...request,
            category: classifyRequest(request.message || ''),
            isPendingUser: request.user?.status === 'Pending Verification'
        }));
        const priorityRank = (category: string) => (category === 'Dislike Current ID' ? 0 : category === 'Need New ID' ? 1 : 2);
        const prioritized = [...enhanced].sort((a, b) => {
            const categoryDelta = priorityRank(a.category) - priorityRank(b.category);
            if (categoryDelta !== 0) return categoryDelta;
            return (b.createdAt || '').localeCompare(a.createdAt || '');
        });
        return {
            total: enhanced.length,
            pendingUsers: enhanced.filter(item => item.isPendingUser).length,
            categories: {
                dislike: enhanced.filter(item => item.category === 'Dislike Current ID').length,
                newId: enhanced.filter(item => item.category === 'Need New ID').length,
                help: enhanced.filter(item => item.category === 'General ID Help').length
            },
            items: prioritized
        };
    }, [cotIdChangeRequests]);

    const deletedMessageUserOptions = useMemo(() => {
        const userIds = new Set<string>();
        deletedContactMessages.forEach(msg => {
            if (msg.senderId) userIds.add(msg.senderId);
        });
        deletedMemberNotifications.forEach(note => {
            if (note.userId) userIds.add(note.userId);
        });
        return Array.from(userIds).sort();
    }, [deletedContactMessages, deletedMemberNotifications]);

    const filteredDeletedContactMessages = useMemo(
        () => deletedContactMessages.filter(msg => !messageRestoreUserFilter || msg.senderId === messageRestoreUserFilter),
        [deletedContactMessages, messageRestoreUserFilter]
    );

    const filteredDeletedMemberReplies = useMemo(
        () => deletedMemberNotifications.filter(note => !messageRestoreUserFilter || note.userId === messageRestoreUserFilter),
        [deletedMemberNotifications, messageRestoreUserFilter]
    );

    const resolveCotUserFromInput = (candidate: string) => {
        const raw = (candidate || '').trim();
        if (!raw) return null;
        const exactId = normalizeCotIdInput(raw);
        if (exactId) {
            const byId = cotUsers.find(user => (user.id || '').toUpperCase() === exactId);
            if (byId) return byId;
        }
        const normalizedRaw = raw.toLowerCase();
        return cotUsers.find(user => {
            const userId = (user.id || '').toUpperCase();
            const userName = (user.name || '').toLowerCase();
            return (
                userName === normalizedRaw ||
                userId === raw.toUpperCase() ||
                `${user.name} • ${userId}`.toLowerCase() === normalizedRaw
            );
        }) || null;
    };

    const cotRecipientSuggestions = useMemo(() => {
        const q = targetCotIdInput.trim().toLowerCase();
        if (!q) return [];
        return cotUsers
            .filter(user => {
                const userId = (user.id || '').toLowerCase();
                const userName = (user.name || '').toLowerCase();
                const userPhone = (user.phone || '').toLowerCase();
                return userId.includes(q) || userName.includes(q) || userPhone.includes(q);
            })
            .slice(0, 6);
    }, [cotUsers, targetCotIdInput]);

    const selectedCotUsers = useMemo(
        () => selectedCotIds
            .map(id => cotUsers.find(user => (user.id || '').toUpperCase() === id))
            .filter(Boolean) as User[],
        [selectedCotIds, cotUsers]
    );

    const highlightedMessageTarget = useMemo(
        () => resolveCotUserFromInput(targetCotIdInput) || cotRecipientSuggestions[0] || null,
        [targetCotIdInput, cotRecipientSuggestions]
    );

    const markCotIdForMessage = (candidate: string) => {
        const user = resolveCotUserFromInput(candidate);
        if (!user) return;
        const normalized = (user.id || '').toUpperCase();
        if (!isCotId(normalized)) return;
        setSelectedCotIds(prev => (prev.includes(normalized) ? prev : [...prev, normalized]));
        setTargetCotIdInput('');
    };

    const messageYearOptions = useMemo(() => {
        const years = new Set<string>();
        users.forEach(user => {
            const joinedYear = `${user.joinedDate || ''}`.slice(0, 4);
            const memberSinceYear = `${user.memberSince || ''}`.trim();
            if (/^\d{4}$/.test(joinedYear)) years.add(joinedYear);
            if (/^\d{4}$/.test(memberSinceYear)) years.add(memberSinceYear);
        });
        return Array.from(years).sort((a, b) => Number(b) - Number(a));
    }, [users]);

    const toggleMessageLocation = (location: string) => {
        setSelectedMessageLocations(prev =>
            prev.includes(location) ? prev.filter(item => item !== location) : [...prev, location]
        );
    };
    const toggleMessageYear = (year: string) => {
        setSelectedMessageYears(prev => prev.includes(year) ? prev.filter(item => item !== year) : [...prev, year]);
    };
    const toggleMessageCategory = (status: UserStatus) => {
        setSelectedMessageCategories(prev => prev.includes(status) ? prev.filter(item => item !== status) : [...prev, status]);
    };

    const handleSendAdminMessage = () => {
        const locationScopedCotUsers = selectedMessageLocations.length === 0
            ? cotUsers
            : cotUsers.filter(user => selectedMessageLocations.includes((user.location || '').trim()));
        const yearScopedCotUsers = selectedMessageYears.length === 0
            ? locationScopedCotUsers
            : locationScopedCotUsers.filter(user => {
                const joinedYear = `${user.joinedDate || ''}`.slice(0, 4);
                const memberSinceYear = `${user.memberSince || ''}`.trim();
                return selectedMessageYears.includes(joinedYear) || selectedMessageYears.includes(memberSinceYear);
            });
        const statusScopedCotUsers = selectedMessageCategories.length === 0
            ? yearScopedCotUsers
            : yearScopedCotUsers.filter(user => selectedMessageCategories.includes(user.status));
        const targetIds = selectedCotIds.length > 0 ? selectedCotIds : statusScopedCotUsers.map(user => user.id.toUpperCase());
        if (!onSendMessageToUsers) return;
        if (targetIds.length === 0) {
            alert('No COT users found for the selected location/year/category filters.');
            return;
        }
        if (!bulkAdminMessage.trim()) {
            alert('Please type a message first.');
            return;
        }
        onSendMessageToUsers(targetIds, bulkAdminMessage);
        setBulkAdminMessage('');
        setSelectedCotIds([]);
    };

    const getMessageUser = (message: ContactMessage) => {
        const senderId = (message.senderId || '').trim().toUpperCase();
        const senderEmail = (message.email || '').trim().toLowerCase();
        const senderName = (message.name || '').trim().toLowerCase();
        return users.find(user =>
            (senderId && (user.id || '').toUpperCase() === senderId) ||
            (senderEmail && (user.email || '').trim().toLowerCase() === senderEmail) ||
            (senderName && (user.name || '').trim().toLowerCase() === senderName)
        ) || null;
    };

    const reportMonthOptions = useMemo(() => {
        const keys = new Set<string>();
        keys.add(new Date().toISOString().slice(0, 7));
        users.forEach(user => keys.add(toMonthKey(user.joinedDate || user.memberSince)));
        deletedUsers.forEach(user => keys.add(toMonthKey(user.deletedAt)));
        memberNotifications.forEach(note => keys.add(toMonthKey(note.createdAt)));
        ministries.forEach(item => keys.add(toMonthKey(item.date)));
        testimonials.forEach(item => keys.add(toMonthKey(item.date)));
        contactMessages.forEach(msg => keys.add(toMonthKey(msg.createdAt)));
        return Array.from(keys).filter(Boolean).sort((a, b) => b.localeCompare(a));
    }, [users, deletedUsers, memberNotifications, ministries, testimonials, contactMessages]);

    React.useEffect(() => {
        if (!reportMonthOptions.includes(selectedReportMonth) && reportMonthOptions.length > 0) {
            setSelectedReportMonth(reportMonthOptions[0]);
        }
    }, [reportMonthOptions, selectedReportMonth]);

    const monthlyReportData = useMemo(() => {
        const month = selectedReportMonth;
        const monthlyRegisteredUsers = users.filter(user => toMonthKey(user.joinedDate || user.memberSince) === month);
        const monthlyAdxNotes = memberNotifications.filter(note => note.from === 'user' && toMonthKey(note.createdAt) === month && /adx/i.test(note.message || ''));
        const monthlyCotIdRequests = memberNotifications.filter(note => note.from === 'user' && toMonthKey(note.createdAt) === month && /(cot|card).*(id|change|request)|request.*(cot|id)|id.*request/i.test(note.message || ''));
        const monthlyDisapprovedUsers = users.filter(user => user.status === 'Rejected' && toMonthKey(user.joinedDate || user.memberSince) === month);
        const monthlyDeletedUsers = deletedUsers.filter(user => toMonthKey(user.deletedAt) === month);

        const websiteChanges: WebsiteChangeItem[] = [
            ...ministries
                .filter(item => toMonthKey(item.date) === month)
                .map(item => ({
                    date: item.date,
                    type: 'Ministry Content Update',
                    detail: item.name ? `Ministry item: ${item.name}` : 'Ministry image/content updated'
                })),
            ...testimonials
                .filter(item => toMonthKey(item.date) === month)
                .map(item => ({
                    date: item.date,
                    type: `Testimonial ${item.status}`,
                    detail: `${item.userName}: "${item.content.slice(0, 80)}${item.content.length > 80 ? '…' : ''}"`
                })),
            ...contactMessages
                .filter(msg => toMonthKey(msg.createdAt) === month)
                .map(msg => ({
                    date: msg.createdAt,
                    type: 'Contact Interaction',
                    detail: `${msg.name || 'Visitor'} sent "${msg.subject || 'No subject'}"`
                }))
        ].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

        return {
            month,
            monthlyRegisteredUsers,
            monthlyAdxNotes,
            monthlyCotIdRequests,
            monthlyDisapprovedUsers,
            monthlyDeletedUsers,
            websiteChanges,
        };
    }, [selectedReportMonth, users, memberNotifications, deletedUsers, ministries, testimonials, contactMessages]);

    const handleDownloadMonthlyReport = (month: string) => {
        const monthLabel = formatMonthLabel(month);
        const reportData = month === selectedReportMonth
            ? monthlyReportData
            : (() => {
                const monthlyRegisteredUsers = users.filter(user => toMonthKey(user.joinedDate || user.memberSince) === month);
                const monthlyAdxNotes = memberNotifications.filter(note => note.from === 'user' && toMonthKey(note.createdAt) === month && /adx/i.test(note.message || ''));
                const monthlyCotIdRequests = memberNotifications.filter(note => note.from === 'user' && toMonthKey(note.createdAt) === month && /(cot|card).*(id|change|request)|request.*(cot|id)|id.*request/i.test(note.message || ''));
                const monthlyDisapprovedUsers = users.filter(user => user.status === 'Rejected' && toMonthKey(user.joinedDate || user.memberSince) === month);
                const monthlyDeletedUsers = deletedUsers.filter(user => toMonthKey(user.deletedAt) === month);
                const websiteChanges: WebsiteChangeItem[] = [
                    ...ministries.filter(item => toMonthKey(item.date) === month).map(item => ({ date: item.date, type: 'Ministry Content Update', detail: item.name ? `Ministry item: ${item.name}` : 'Ministry image/content updated' })),
                    ...testimonials.filter(item => toMonthKey(item.date) === month).map(item => ({ date: item.date, type: `Testimonial ${item.status}`, detail: `${item.userName}: "${item.content.slice(0, 80)}${item.content.length > 80 ? '…' : ''}"` })),
                    ...contactMessages.filter(msg => toMonthKey(msg.createdAt) === month).map(msg => ({ date: msg.createdAt, type: 'Contact Interaction', detail: `${msg.name || 'Visitor'} sent "${msg.subject || 'No subject'}"` })),
                ].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
                return { month, monthlyRegisteredUsers, monthlyAdxNotes, monthlyCotIdRequests, monthlyDisapprovedUsers, monthlyDeletedUsers, websiteChanges };
            })();

        const pdf = new jsPDF('p', 'mm', 'a4');
        const margin = 14;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const contentWidth = pageWidth - margin * 2;
        let y = 18;
        const addSectionHeader = (title: string) => {
            if (y > 270) {
                pdf.addPage();
                y = 18;
            }
            pdf.setFillColor(36, 92, 191);
            pdf.roundedRect(margin, y, contentWidth, 9, 2, 2, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.text(title, margin + 3, y + 6);
            y += 12;
        };
        const addBodyLine = (text: string) => {
            if (y > 282) {
                pdf.addPage();
                y = 18;
            }
            pdf.setTextColor(20, 20, 20);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            const lines = pdf.splitTextToSize(text, contentWidth);
            pdf.text(lines, margin, y);
            y += lines.length * 4.3 + 1;
        };

        pdf.setFillColor(18, 35, 66);
        pdf.rect(0, 0, pageWidth, 32, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(15);
        pdf.text('City of Truth Ministries', margin, 14);
        pdf.setFontSize(11);
        pdf.text(`Professional Monthly Admin Report • ${monthLabel}`, margin, 22);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text(`Generated on ${new Date().toLocaleString()}`, margin, 28);
        y = 38;

        addSectionHeader('Executive Summary');
        addBodyLine(`Users Registered: ${reportData.monthlyRegisteredUsers.length}`);
        addBodyLine(`Users Sent ADX: ${reportData.monthlyAdxNotes.length}`);
        addBodyLine(`COT ID Requests: ${reportData.monthlyCotIdRequests.length}`);
        addBodyLine(`Users Disapproved: ${reportData.monthlyDisapprovedUsers.length}`);
        addBodyLine(`Users Deleted: ${reportData.monthlyDeletedUsers.length}`);
        addBodyLine(`Website Changes Tracked: ${reportData.websiteChanges.length}`);

        addSectionHeader('Registered Users');
        if (reportData.monthlyRegisteredUsers.length === 0) addBodyLine('No users were registered in this month.');
        reportData.monthlyRegisteredUsers.forEach(user => addBodyLine(`${user.id} • ${user.name} • ${user.phone} • ${user.location} • ${user.status}`));

        addSectionHeader('Users Who Sent ADX');
        if (reportData.monthlyAdxNotes.length === 0) addBodyLine('No ADX messages were found for this month.');
        reportData.monthlyAdxNotes.forEach(note => addBodyLine(`${note.userId} • ${new Date(note.createdAt).toLocaleString()} • ${note.message}`));

        addSectionHeader('Disapproved Users');
        if (reportData.monthlyDisapprovedUsers.length === 0) addBodyLine('No disapproved users tracked in this month.');
        reportData.monthlyDisapprovedUsers.forEach(user => addBodyLine(`${user.id} • ${user.name} • ${user.phone} • Joined ${user.joinedDate || user.memberSince}`));

        addSectionHeader('Deleted Users');
        if (reportData.monthlyDeletedUsers.length === 0) addBodyLine('No users were deleted in this month.');
        reportData.monthlyDeletedUsers.forEach(user => addBodyLine(`${user.id} • ${user.name} • Deleted ${new Date(user.deletedAt).toLocaleString()}`));

        addSectionHeader('Website Changes / Activity');
        if (reportData.websiteChanges.length === 0) addBodyLine('No tracked website changes found for this month in the available datasets.');
        reportData.websiteChanges.slice(0, 150).forEach(change => addBodyLine(`${new Date(change.date).toLocaleString()} • ${change.type} • ${change.detail}`));

        pdf.save(`COT-Monthly-Admin-Report-${month}.pdf`);
    };

    const handleRollRandomCotId = () => {
        if (suggestedCotIds.length === 0) {
            alert('No available COT IDs found.');
            return;
        }
        setDiceRolling(true);
        setDicePickedCotId('');
        window.setTimeout(() => {
            const pick = getRandomAvailableCotId();
            if (pick) setDicePickedCotId(pick);
            setDiceRolling(false);
        }, 900);
    };

    const applyCotIdToSelectedUser = async (candidateId: string) => {
        if (!onReassignUserId) {
            alert('ID reassignment is not available.');
            return;
        }
        const nextCotId = normalizeCotIdInput(candidateId);
        if (!diceTargetUserId || !nextCotId) {
            alert('Select user and provide a COT ID first.');
            return;
        }
        const user = users.find(u => u.id === diceTargetUserId);
        if (!user) {
            alert('Selected user not found.');
            return;
        }
        if (!isCotId(nextCotId)) {
            alert('Enter a valid COT ID format like COT-1960.');
            return;
        }
        if (nextCotId !== user.id.toUpperCase() && existingCotIds.has(nextCotId)) {
            alert('This COT ID is already used.');
            return;
        }
        try {
            await onReassignUserId(user.id, nextCotId, { ...user, id: nextCotId });
            setDicePickedCotId('');
            setDiceManualInput('');
        } catch (error) {
            console.error('Failed to assign COT ID', error);
            alert('Failed to assign COT ID.');
        }
    };

    const handleApplyDiceCotId = async () => {
        await applyCotIdToSelectedUser(dicePickedCotId);
    };

    const activateUserWithCotId = async (user: User) => {
        const approvedUserBase: User = {
            ...user,
            ...(user.pendingProfileUpdate || {}),
            pendingProfileUpdate: {},
            status: 'Active'
        };

        if (isCotId(approvedUserBase.id)) {
            await onUpdateUser(approvedUserBase);
            return;
        }

        const generatedCotId = getRandomAvailableCotId();
        if (!generatedCotId) {
            throw new Error('No available COT IDs left. Please add more ID capacity.');
        }

        const approvedWithCotId: User = { ...approvedUserBase, id: generatedCotId };
        if (onReassignUserId) {
            await onReassignUserId(user.id, generatedCotId, approvedWithCotId);
            return;
        }

        await onUpdateUser(approvedWithCotId);
    };

    // Filtered users
    const filteredUsers = useMemo(() => {
        const query = searchQuery.toLowerCase();
        const filtered = users.filter(user => {
            const name = `${user.name ?? ''}`.toLowerCase();
            const email = `${user.email ?? ''}`.toLowerCase();
            const phone = `${user.phone ?? ''}`.toLowerCase();
            const id = `${user.id ?? ''}`.toLowerCase();
            const matchesSearch = searchQuery === '' ||
                name.includes(query) ||
                email.includes(query) ||
                phone.includes(query) ||
                id.includes(query);

            const matchesStatus = filterStatus === 'All' || user.status === filterStatus;
            const matchesRole = filterRole === 'All' || user.role === filterRole;
            const matchesLocation = filterLocation === 'All' || (user.location || '').trim() === filterLocation;

            return matchesSearch && matchesStatus && matchesRole && matchesLocation;
        });

        if (userSortMode === 'cot-id') {
            return filtered.sort((a, b) => (a.id || '').localeCompare((b.id || ''), undefined, { numeric: true, sensitivity: 'base' }));
        }
        if (userSortMode === 'member-since') {
            return filtered.sort((a, b) => {
                const aDate = new Date(a.memberSince || a.joinedDate || '').getTime();
                const bDate = new Date(b.memberSince || b.joinedDate || '').getTime();
                const safeA = Number.isNaN(aDate) ? 0 : aDate;
                const safeB = Number.isNaN(bDate) ? 0 : bDate;
                return safeB - safeA;
            });
        }

        return filtered.sort((a, b) => {
            const statusOrder = { 'Pending Verification': 0, 'Active': 1, 'Rejected': 2 };
            return statusOrder[a.status] - statusOrder[b.status];
        });
    }, [users, searchQuery, filterStatus, filterRole, filterLocation, userSortMode]);

    const cotManagerBaseUsers = useMemo(() => {
        const query = cotManagerQuery.trim().toLowerCase();
        const requestPriorityByUser = new Map<string, { priority: number; createdAt: string }>();
        cotIdRequestInsights.items.forEach((item) => {
            const userId = item.user?.id || item.userId;
            if (!userId) return;
            const nextPriority = item.category === 'Dislike Current ID' ? 2 : 1;
            const previous = requestPriorityByUser.get(userId);
            if (!previous || nextPriority > previous.priority || (item.createdAt || '') > previous.createdAt) {
                requestPriorityByUser.set(userId, {
                    priority: Math.max(nextPriority, previous?.priority || 0),
                    createdAt: item.createdAt || ''
                });
            }
        });
        const ordered = [...users].sort((a, b) => {
            const aRequest = requestPriorityByUser.get(a.id);
            const bRequest = requestPriorityByUser.get(b.id);
            const aPriority = aRequest?.priority || 0;
            const bPriority = bRequest?.priority || 0;
            if (aPriority !== bPriority) return bPriority - aPriority;
            const aCreatedAt = aRequest?.createdAt || '';
            const bCreatedAt = bRequest?.createdAt || '';
            if (aCreatedAt !== bCreatedAt) return bCreatedAt.localeCompare(aCreatedAt);
            return a.name.localeCompare(b.name);
        });
        const filtered = !query ? ordered : ordered.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.id.toLowerCase().includes(query) ||
            (user.phone || '').toLowerCase().includes(query)
        );
        return filtered;
    }, [users, cotManagerQuery, cotIdRequestInsights.items]);
    const cotManagerUsers = useMemo(() => {
        if (!cotManagerSelectedUserId) return cotManagerBaseUsers;
        return cotManagerBaseUsers.filter(user => user.id === cotManagerSelectedUserId);
    }, [cotManagerBaseUsers, cotManagerSelectedUserId]);

    const cotManagerAssignableUsers = useMemo(() => cotManagerBaseUsers, [cotManagerBaseUsers]);
    const randomDiceUsers = useMemo(() => {
        const query = diceUserQuery.trim().toLowerCase();
        if (!query) return cotManagerAssignableUsers;
        return cotManagerAssignableUsers.filter((user) => {
            const haystack = `${user.name} ${user.id} ${user.phone || ''} ${user.email || ''} ${user.location || ''}`.toLowerCase();
            return haystack.includes(query);
        });
    }, [cotManagerAssignableUsers, diceUserQuery]);

    const handleSearchCotId = () => {
        const normalized = normalizeCotIdInput(cotIdSearchInput);
        if (!isCotId(normalized)) {
            setCotIdSearchFeedback({ type: 'invalid', message: 'Enter a valid COT ID (example: COT-0001).' });
            return;
        }
        const foundUser = users.find(user => user.id.toUpperCase() === normalized);
        if (!foundUser) {
            setCotManagerSelectedUserId('');
            setCotIdSearchFeedback({ type: 'available', message: `${normalized} is available.` });
            return;
        }
        setCotManagerSelectedUserId(foundUser.id);
        setCotManagerQuery(foundUser.name);
        setCotIdSearchFeedback({ type: 'occupied', message: `${normalized} is occupied by ${foundUser.name}.` });
    };

    const moveArrayItem = <T,>(arr: T[], from: number, to: number): T[] => {
        if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
        const next = [...arr];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        return next;
    };
    const moveNavItemByView = (view: string, direction: 'up' | 'down') => {
        if (!onUpdateNavItems || !navItems || navItems.length === 0) return;
        const idx = navItems.findIndex((nav: any) => nav.view === view);
        if (idx < 0) return;
        const target = direction === 'up' ? idx - 1 : idx + 1;
        if (target < 0 || target >= navItems.length) return;
        onUpdateNavItems(moveArrayItem(navItems, idx, target));
    };
    const renameNavItem = (index: number, nextLabel: string) => {
        if (!onUpdateNavItems || !navItems) return;
        const cleaned = nextLabel.trim();
        if (!cleaned) return;
        const next = navItems.map((item, idx) => idx === index ? { ...item, label: cleaned } : item);
        onUpdateNavItems(next);
    };
    const renameSubmenuItem = (parentIndex: number, submenuIndex: number, nextLabel: string) => {
        if (!onUpdateNavItems || !navItems) return;
        const cleaned = nextLabel.trim();
        if (!cleaned) return;
        const next = navItems.map((item, idx) => {
            if (idx !== parentIndex || !Array.isArray(item.submenu)) return item;
            const submenu = item.submenu.map((sub: any, sIdx: number) =>
                sIdx === submenuIndex ? { ...sub, label: cleaned } : sub
            );
            return { ...item, submenu };
        });
        onUpdateNavItems(next);
    };
    const moveSubmenuItem = (parentIndex: number, submenuIndex: number, direction: 'up' | 'down') => {
        if (!onUpdateNavItems || !navItems) return;
        const parent = navItems[parentIndex];
        if (!parent || !Array.isArray(parent.submenu) || parent.submenu.length === 0) return;
        const target = direction === 'up' ? submenuIndex - 1 : submenuIndex + 1;
        if (target < 0 || target >= parent.submenu.length) return;
        const next = navItems.map((item, idx) => {
            if (idx !== parentIndex || !Array.isArray(item.submenu)) return item;
            return { ...item, submenu: moveArrayItem(item.submenu, submenuIndex, target) };
        });
        onUpdateNavItems(next);
    };

    const handleSaveAdminPassword = () => {
        const nextPassword = adminPasswordDraft.trim();
        const authPhrase = adminPasswordPhrase.trim().toLowerCase();
        if (authPhrase !== ADMIN_PASSWORD_CHANGE_PHRASE) {
            setAdminPasswordMessage({ type: 'error', text: 'Password change phrase is incorrect.' });
            return;
        }
        if (!nextPassword) {
            setAdminPasswordMessage({ type: 'error', text: 'Please enter a new password.' });
            return;
        }
        if (nextPassword.length < 6) {
            setAdminPasswordMessage({ type: 'error', text: 'Password should be at least 6 characters.' });
            return;
        }
        if (nextPassword !== adminPasswordConfirm.trim()) {
            setAdminPasswordMessage({ type: 'error', text: 'Password confirmation does not match.' });
            return;
        }
        try {
            localStorage.setItem(ADMIN_PASSWORD_OVERRIDE_KEY, nextPassword);
            setHasAdminPasswordOverride(true);
            setAdminPasswordDraft('');
            setAdminPasswordConfirm('');
            setAdminPasswordPhrase('');
            setAdminPasswordMessage({ type: 'success', text: 'Admin dashboard password updated successfully.' });
        } catch {
            setAdminPasswordMessage({ type: 'error', text: 'Unable to save password in this browser/session.' });
        }
    };

    const handleResetAdminPassword = () => {
        try {
            localStorage.removeItem(ADMIN_PASSWORD_OVERRIDE_KEY);
            setHasAdminPasswordOverride(false);
            setAdminPasswordDraft('');
            setAdminPasswordConfirm('');
            setAdminPasswordPhrase('');
            setAdminPasswordMessage({ type: 'success', text: 'Custom admin password removed. Default password is active.' });
        } catch {
            setAdminPasswordMessage({ type: 'error', text: 'Unable to reset password in this browser/session.' });
        }
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        setIsLoading(true);
        try {
            await onUpdateUser(editingUser);
            setEditingUser(null);
        } catch (error) {
            alert('Failed to update user');
        } finally {
            setIsLoading(false);
        }
    };

    const runUserAction = async (task: () => Promise<void>, failMessage: string) => {
        setIsLoading(true);
        try {
            await task();
            return true;
        } catch (error) {
            console.error(failMessage, error);
            alert(failMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNewUser = async () => {
        if (!newUserData.name.trim()) { alert('Name is required.'); return; }
        if (!newUserData.phone.trim()) { alert('Phone number is required.'); return; }
        if (!newUserData.location) { alert('Please select a district.'); return; }

        setIsLoading(true);
        try {
            const rawRequestedId = `${newUserData.memberId || ''}`.trim();
            const normalizedIdBody = rawRequestedId.toUpperCase().replace(/^COT[-\s]*/i, '');
            let newId = normalizedIdBody ? `COT-${normalizedIdBody}` : '';
            if (newId && !/^COT-\d{4,}$/.test(newId)) {
                alert('Enter a valid Member ID with at least 4 digits (example: COT-1960).');
                setIsLoading(false);
                return;
            }
            if (newId && existingCotIds.has(newId)) {
                alert(`Member ID ${newId} is already in use. Please choose another ID.`);
                setIsLoading(false);
                return;
            }
            if (!newId) {
                const fallback = getRandomAvailableCotId();
                if (!fallback) {
                    alert('No available COT IDs left in the current range. Please enter a manual ID.');
                    setIsLoading(false);
                    return;
                }
                newId = fallback;
            }

            const user: User = {
                id: newId,
                name: newUserData.name.trim(),
                phone: newUserData.phone.trim(),
                email: newUserData.email.trim(),
                location: newUserData.location,
                emergency: newUserData.phone.trim(),
                role: newUserData.role,
                status: 'Active',
                photo: newUserData.photo || '',
                memberSince: newUserData.memberSince,
                joinedDate: newUserData.joinedDate || new Date().toISOString().split('T')[0],
            };
            if (onCreateUser) {
                await onCreateUser(user);
            } else {
                await api.createUser(user);
            }
            setShowAddUser(false);
            setNewUserData({ ...EMPTY_NEW_USER });
            alert(`User added successfully! ID: ${newId}`);
        } catch (error) {
            alert('Failed to add user. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewUserPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setNewUserCropImage(reader.result as string);
                setIsNewUserCropping(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDelete = async () => {
        if (!deletingUser) return;
        setIsLoading(true);
        try {
            await onDeleteUser(deletingUser.id);
            setDeletingUser(null);
        } catch (error) {
            alert('Failed to delete user');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        setIsLoading(true);
        try {
            const deletePromises = Array.from(selectedUsers).map(userId => onDeleteUser(userId));
            await Promise.all(deletePromises);
            setSelectedUsers(new Set());
            setShowBulkDeleteConfirm(false);
        } catch (error) {
            alert('Failed to delete some users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestoreDeletedUser = async (deletedUserId: string) => {
        if (!onRestoreUser) return;
        setIsLoading(true);
        try {
            await onRestoreUser(deletedUserId);
        } catch (error) {
            alert('Failed to restore user');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelectDeletedUser = (userId: string) => {
        const next = new Set(selectedDeletedUsers);
        if (next.has(userId)) next.delete(userId);
        else next.add(userId);
        setSelectedDeletedUsers(next);
    };

    const toggleSelectAllDeletedUsers = () => {
        if (selectedDeletedUsers.size === deletedUsers.length) {
            setSelectedDeletedUsers(new Set());
            return;
        }
        setSelectedDeletedUsers(new Set(deletedUsers.map(user => user.id)));
    };

    const handleBulkRestoreDeletedUsers = async () => {
        if (!onRestoreUser || selectedDeletedUsers.size === 0) return;
        setIsLoading(true);
        try {
            await Promise.all(Array.from(selectedDeletedUsers).map(userId => onRestoreUser(userId)));
            setSelectedDeletedUsers(new Set());
        } catch (error) {
            alert('Failed to restore some selected users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkPermanentlyDeleteDeletedUsers = async () => {
        if (!onPermanentlyDeleteUser || selectedDeletedUsers.size === 0) return;
        if (!window.confirm(`Permanently delete ${selectedDeletedUsers.size} selected user(s)? This cannot be undone.`)) return;
        setIsLoading(true);
        try {
            await Promise.all(Array.from(selectedDeletedUsers).map(userId => onPermanentlyDeleteUser(userId)));
            setSelectedDeletedUsers(new Set());
        } catch (error) {
            alert('Failed to permanently delete some selected users');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePermanentlyDeleteDeletedUser = async (deletedUserId: string) => {
        if (!onPermanentlyDeleteUser) return;
        if (!window.confirm('Delete this user permanently from recycle bin? This will permanently remove user profile data and cannot be undone.')) return;
        setIsLoading(true);
        try {
            await onPermanentlyDeleteUser(deletedUserId);
        } catch (error) {
            alert('Failed to permanently delete user');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkApprove = async () => {
        if (selectedUsers.size === 0) return;
        if (!window.confirm(`Approve ${selectedUsers.size} selected user(s)?`)) return;
        setIsLoading(true);
        try {
            const updatePromises = Array.from(selectedUsers).map(userId => {
                const user = users.find(u => u.id === userId);
                if (!user) return Promise.resolve();
                return activateUserWithCotId(user);
            });
            await Promise.all(updatePromises);
            setSelectedUsers(new Set());
        } catch (error) {
            alert('Failed to approve some users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkReject = async () => {
        if (selectedUsers.size === 0) return;
        if (!window.confirm(`Reject ${selectedUsers.size} selected user(s)?`)) return;
        setIsLoading(true);
        try {
            const updatePromises = Array.from(selectedUsers).map(userId => {
                const user = users.find(u => u.id === userId);
                if (!user) return Promise.resolve();
                const hasPendingEdit = !!user.pendingProfileUpdate && Object.keys(user.pendingProfileUpdate).length > 0;
                if (hasPendingEdit || user.status === 'Pending Verification' || user.status === 'Active') {
                    return disapproveUser(user);
                }
                return Promise.resolve();
            });
            await Promise.all(updatePromises);
            setSelectedUsers(new Set());
        } catch (error) {
            alert('Failed to reject some users');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelectUser = (userId: string) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    };
    const hasPendingProfileUpdate = (user: User) => !!user.pendingProfileUpdate && Object.keys(user.pendingProfileUpdate).length > 0;
    const approveUserOrPendingEdit = async (user: User) => {
        await runUserAction(() => activateUserWithCotId(user), 'Failed to approve user');
    };
    const disapproveUser = async (user: User) => {
        await runUserAction(() => onUpdateUser({ ...user, status: 'Rejected', pendingProfileUpdate: {} }), 'Failed to disapprove user');
    };
    const rejectPendingEdit = async (user: User) => {
        await runUserAction(() => onUpdateUser({ ...user, pendingProfileUpdate: {} }), 'Failed to reject pending edit');
    };

    const toggleSelectAll = () => {
        if (selectedUsers.size === filteredUsers.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const handleDownloadUserCard = async (user: User) => {
        if (user.status !== 'Active') {
            alert('Entrust card PDF is available only for approved users.');
            return;
        }
        setDownloadingCardUserId(user.id);
        const frontNode = document.getElementById(`admin-card-front-${user.id}`);
        const backNode = document.getElementById(`admin-card-back-${user.id}`);

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
        }
        setDownloadingCardUserId(null);
    };

    const handleOpenQrPreview = (user: User) => {
        if (user.status !== 'Active') {
            alert('QR code is available only for approved users.');
            return;
        }
        setViewingQrUser(user);
    };

    const handleDownloadUserDetailsPdf = async (member: User) => {
        if (member.status !== 'Active') {
            alert('Profile PDF is available only for approved users.');
            return;
        }
        setDownloadingProfilePdfUserId(member.id);
        try {
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 12;
            const contentWidth = pageWidth - margin * 2;
            let y = 18;

            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');

            pdf.setFillColor(30, 41, 59);
            pdf.roundedRect(margin, y, contentWidth, 40, 6, 6, 'F');
            pdf.setFillColor(245, 158, 11);
            pdf.circle(pageWidth - 24, y + 12, 5, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(17);
            pdf.text('Professional Member Portfolio', margin + 5, y + 12);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.text('City of Truth Ministries • Admin Generated Profile PDF', margin + 5, y + 19);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`Card ID: ${member.id}`, margin + 5, y + 27);
            pdf.text(`Generated: ${new Date().toLocaleString()}`, margin + 5, y + 33);

            if (member.photo) {
                try {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.src = member.photo;
                    await new Promise<void>((resolve, reject) => {
                        img.onload = () => resolve();
                        img.onerror = () => reject(new Error('photo-load-failed'));
                    });
                    pdf.addImage(member.photo, 'JPEG', pageWidth - 44, y + 4, 26, 30, undefined, 'FAST');
                    pdf.setDrawColor(255, 255, 255);
                    pdf.roundedRect(pageWidth - 44, y + 4, 26, 30, 4, 4, 'S');
                } catch {
                    // Keep PDF generation resilient when image loading fails.
                }
            }

            y += 50;
            const drawField = (label: string, value?: string) => {
                pdf.setFillColor(248, 250, 252);
                pdf.roundedRect(margin, y, contentWidth, 12, 3, 3, 'F');
                pdf.setTextColor(100, 116, 139);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(8);
                pdf.text(label.toUpperCase(), margin + 3, y + 4);
                pdf.setTextColor(15, 23, 42);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(10);
                const normalized = `${value || ''}`.trim() || 'Not provided';
                pdf.text(pdf.splitTextToSize(normalized, contentWidth - 6), margin + 3, y + 9);
                y += 15;
            };

            drawField('Member Name', member.name);
            drawField('Member ID / Card ID', member.id);
            drawField('Status', member.status);
            drawField('Role', member.role);
            drawField('Email', member.email);
            drawField('Phone', member.phone);
            drawField('Location', member.location);
            drawField('Emergency Contact', member.emergency);
            drawField('Member Since', member.memberSince);
            drawField('Joined Date', member.joinedDate ? new Date(member.joinedDate).toLocaleDateString() : '');

            if (member.communityProfile) {
                y += 2;
                pdf.setFillColor(79, 70, 229);
                pdf.roundedRect(margin, y, contentWidth, 10, 3, 3, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(9);
                pdf.text('MEMBER FORM DETAILS', margin + 3, y + 6.8);
                y += 13;
                drawField('Denomination', member.communityProfile.denomination);
                drawField('Church Name', member.communityProfile.churchName);
                drawField('Role in Ministry', member.communityProfile.role);

                const bio = `${member.communityProfile.bio || ''}`.trim() || 'Not provided';
                const bioLines = pdf.splitTextToSize(bio, contentWidth - 6);
                const bioHeight = Math.max(18, bioLines.length * 4 + 7);
                if (y + bioHeight > pageHeight - 20) {
                    pdf.addPage();
                    pdf.setFillColor(15, 23, 42);
                    pdf.rect(0, 0, pageWidth, 14, 'F');
                    pdf.setTextColor(255, 255, 255);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(10);
                    pdf.text(`Member Form Details • ${member.id}`, margin, 9.5);
                    y = 22;
                }
                pdf.setFillColor(248, 250, 252);
                pdf.roundedRect(margin, y, contentWidth, bioHeight, 3, 3, 'F');
                pdf.setTextColor(100, 116, 139);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(8);
                pdf.text('TESTIMONY / BIO', margin + 3, y + 4);
                pdf.setTextColor(15, 23, 42);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(10);
                pdf.text(bioLines, margin + 3, y + 9);
                y += bioHeight + 4;
            }

            pdf.save(`COT-PROFILE-DETAILS-${member.id}.pdf`);
        } catch (error) {
            console.error('Profile PDF generation failed', error);
            alert('Failed to generate profile PDF. Please try again.');
        } finally {
            setDownloadingProfilePdfUserId(null);
        }
    };

    const handleDownloadMemberFormPdf = async (member: User) => {
        if (member.status !== 'Active') {
            alert('Member Form PDF is available only for approved users.');
            return;
        }
        setDownloadingMemberFormPdfUserId(member.id);
        try {
            const profile = member.communityProfile || {};
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 14;
            const contentWidth = pageWidth - margin * 2;
            let y = 38;

            const addBlock = (label: string, value: string) => {
                const text = `${value || 'Not provided'}`.trim() || 'Not provided';
                const lines = pdf.splitTextToSize(text, contentWidth - 8);
                const blockHeight = Math.max(12, lines.length * 4 + 7);
                if (y + blockHeight > pageHeight - 14) {
                    pdf.addPage();
                    y = 20;
                }
                pdf.setFillColor(248, 250, 252);
                pdf.roundedRect(margin, y, contentWidth, blockHeight, 3, 3, 'F');
                pdf.setTextColor(100, 116, 139);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(8);
                pdf.text(label, margin + 4, y + 4.2);
                pdf.setTextColor(15, 23, 42);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(10);
                pdf.text(lines, margin + 4, y + 8.8);
                y += blockHeight + 3;
            };

            const phoneWithCountryCode = (value?: string) => {
                const digits = `${value || ''}`.replace(/\D/g, '');
                if (!digits) return '';
                if (digits.startsWith('91') && digits.length === 12) return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
                if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
                return value || '';
            };

            pdf.setFillColor(26, 27, 75);
            pdf.rect(0, 0, pageWidth, 34, 'F');
            pdf.setFillColor(212, 165, 71);
            pdf.rect(0, 31, pageWidth, 3, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.text('Member Form Submission', margin, 13.5);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.text('Themed ministry style • Admin Download', margin, 19.5);
            pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, 24.5);
            pdf.text(`Member: ${member.name} • ${member.id}`, margin, 29.5);

            addBlock('Member ID', member.id);
            addBlock('Name', member.name);
            addBlock('Phone', phoneWithCountryCode(member.phone || member.emergency));
            addBlock('Email', member.email);
            addBlock('Location', member.location);
            addBlock('Member Since', member.memberSince || member.joinedDate);
            addBlock('Denomination', profile.denomination || '');
            addBlock('Church Name', profile.churchName || '');
            addBlock('Role in Ministry', profile.role || '');
            addBlock('Testimony / Bio', profile.bio || '');

            pdf.save(`COT-MEMBER-FORM-${member.id}.pdf`);
        } catch (error) {
            console.error('Member form PDF generation failed', error);
            alert('Failed to generate Member Form PDF. Please try again.');
        } finally {
            setDownloadingMemberFormPdfUserId(null);
        }
    };

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setCropImage(reader.result as string);
                setCroppingType('user');
                setIsCropping(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMinistryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 1) {
            const readOne = (file: File) =>
                new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve((reader.result as string) || '');
                    reader.onerror = () => reject(new Error(`Failed reading ${file.name}`));
                    reader.readAsDataURL(file);
                });
            (async () => {
                setIsLoading(true);
                try {
                    for (const file of files) {
                        const image = await readOne(file);
                        if (!image) continue;
                        const mediaType: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';
                        const duration = mediaType === 'video' ? await detectVideoDuration(file) : '';
                        const payload = {
                            image,
                            date: detectDate(file.name),
                            name: file.name.replace(/\.[^/.]+$/, ''),
                            description: '',
                            mediaType,
                            duration
                        };
                        const newMinistry = await api.createMinistry(payload as Omit<Ministry, 'id'>);
                        setMinistries(prev => [...prev, newMinistry]);
                        setFailedMinistryImages(prev => {
                            const next = { ...prev };
                            delete next[newMinistry.id];
                            return next;
                        });
                    }
                } catch (error) {
                    console.error('Failed bulk upload for ministry images', error);
                    alert('Some ministry images failed to upload. Please retry.');
                } finally {
                    setIsLoading(false);
                }
            })();
            return;
        }
        const file = files[0];
        if (file) {
            const mediaType: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';
            const detectedDate = detectDate(file.name);
            const detectedName = file.name.split('.')[0];

            setEditingMinistry(prev => ({
                ...prev,
                date: prev?.date?.trim() || detectedDate,
                name: prev?.name?.trim() || detectedName,
                mediaType
            }));

            if (mediaType === 'video') {
                const reader = new FileReader();
                reader.onload = async () => {
                    const duration = await detectVideoDuration(file);
                    setEditingMinistry(prev => ({
                        ...prev,
                        image: (reader.result as string) || '',
                        mediaType: 'video',
                        duration: prev?.duration?.trim() || duration
                    }));
                };
                reader.readAsDataURL(file);
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                setCropImage(reader.result as string);
                setCroppingType('ministry');
                setIsCropping(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedImageUrl: string) => {
        if (croppingType === 'user' && editingUser) {
            setEditingUser({ ...editingUser, photo: croppedImageUrl });
        } else if (croppingType === 'ministry') {
            setEditingMinistry(prev => ({ ...prev, image: croppedImageUrl }));
            if (editingMinistry?.id) {
                setFailedMinistryImages(prev => {
                    const next = { ...prev };
                    delete next[editingMinistry.id as string];
                    return next;
                });
            }
        }
        setIsCropping(false);
        setCropImage(null);
        setCroppingType(null);
    };

    const getStatusColor = (status: UserStatus) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-700 border-green-200';
            case 'Pending Verification': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };
    const getStatusLabel = (status: UserStatus) => {
        switch (status) {
            case 'Active': return 'Approved';
            case 'Pending Verification': return 'Pending Approval';
            case 'Rejected': return 'Disapproved';
            default: return status;
        }
    };

    const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://city-of-truth-ministries.vercel.app';
    const getVerificationUrl = (memberId: string) => `${appOrigin}/verify/${encodeURIComponent(memberId)}`;
    const getQrImageUrl = (memberId: string, size = 220) =>
        `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(getVerificationUrl(memberId))}&bgcolor=ffffff&color=1a237e&margin=2&format=png&cb=${encodeURIComponent(memberId)}`;

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-24">
            {/* HIDDEN CARD RENDER AREA FOR PDF GENERATION */}
            <div className="fixed left-[-9999px] top-0 pointer-events-none">
                {users.map(user => (
                    <React.Fragment key={user.id}>
                        <div id={`admin-card-front-${user.id}`} className="bg-white">
                            <EntrustCard3D
                                name={user.name}
                                email={user.email}
                                location={user.location}
                                emergency={user.emergency}
                                uniqueId={user.id}
                                memberSince={user.memberSince}
                                photo={user.photo}
                                isStatic={true}
                                isBackSide={false}
                            />
                        </div>
                        <div id={`admin-card-back-${user.id}`} className="bg-white">
                            <EntrustCard3D
                                name={user.name}
                                email={user.email}
                                location={user.location}
                                emergency={user.emergency}
                                uniqueId={user.id}
                                memberSince={user.memberSince}
                                photo={user.photo}
                                isStatic={true}
                                isBackSide={true}
                            />
                        </div>
                    </React.Fragment>
                ))}
            </div>

            <div className="container mx-auto px-3 md:px-6">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={onBack}
                            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl md:text-3xl lg:text-4xl font-serif font-bold text-brand-950 truncate">Admin Dashboard</h1>
                            <p className="text-slate-500 mt-0.5 text-xs md:text-sm">Manage users, Firebase, approvals, and recycle bin</p>
                        </div>
                        <button
                            onClick={toggleMenuMode}
                            title={menuMode === 'horizontal' ? 'Switch to Sidebar Menu' : 'Switch to Top Menu'}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 transition-all text-xs font-bold shrink-0"
                        >
                            {menuMode === 'horizontal' ? (
                                <><PanelLeft size={14} /> <span className="hidden sm:inline">Sidebar</span></>
                            ) : (
                                <><PanelTop size={14} /> <span className="hidden sm:inline">Top Menu</span></>
                            )}
                        </button>
                    </div>

                    {(menuMode === 'horizontal' || menuMode === 'vertical') && (
                        <div className={`flex gap-1.5 flex-nowrap overflow-x-auto pb-1 scrollbar-none -mx-1 px-1 ${menuMode === 'vertical' ? 'lg:hidden' : ''}`}>
                            {TAB_ITEMS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-3 py-2 rounded-lg font-bold text-xs transition-colors whitespace-nowrap shrink-0 ${activeTab === tab.id
                                        ? 'bg-brand-600 text-white'
                                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <tab.icon size={14} /> {tab.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content Layout — flex when vertical sidebar mode */}
                <div className={menuMode === 'vertical' ? 'flex gap-6 items-start' : ''}>
                    {/* Vertical Sidebar */}
                    {menuMode === 'vertical' && (
                        <aside className="hidden lg:block w-56 shrink-0 sticky top-28">
                            <nav className="bg-white rounded-3xl border border-slate-100 shadow-sm p-3 space-y-1">
                                {TAB_ITEMS.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                                                : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <tab.icon size={18} />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </aside>
                    )}

                    {/* Main Content */}
                    <div className={menuMode === 'vertical' ? 'flex-1 min-w-0' : ''}>

                {/* Statistics Cards */}
                {activeTab === 'users' && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
                        {[
                            { label: 'Total Users', value: stats.total, icon: Users, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
                            { label: 'Active Users', value: stats.active, icon: UserCheck, color: 'from-green-500 to-green-600', bg: 'bg-green-50', text: 'text-green-600' },
                            { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-600' },
                            { label: 'Rejected', value: stats.rejected, icon: UserX, color: 'from-red-500 to-red-600', bg: 'bg-red-50', text: 'text-red-600' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-2 md:mb-4">
                                    <div className={`w-9 h-9 md:w-12 md:h-12 ${stat.bg} rounded-xl md:rounded-2xl flex items-center justify-center`}>
                                        <stat.icon size={18} className={stat.text} />
                                    </div>
                                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`}></div>
                                </div>
                                <div className="text-2xl md:text-3xl font-bold text-brand-950 mb-0.5 md:mb-1">{stat.value}</div>
                                <div className="text-xs md:text-sm text-slate-500 font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {activeTab === 'users' && pendingEditUsers.length > 0 && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-3xl p-4 md:p-5">
                        <div className="flex items-center justify-between gap-3 mb-3">
                            <div>
                                <h3 className="text-sm md:text-base font-black text-amber-900">Pending Edit Requests</h3>
                                <p className="text-[11px] text-amber-700 mt-1">Photo crop updates and profile edits can be reviewed, approved, rejected, or opened directly.</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-white border border-amber-200 text-[11px] font-black text-amber-800">
                                {pendingEditUsers.length}
                            </span>
                        </div>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {pendingEditUsers.map(user => (
                                <div key={user.id} className="rounded-2xl bg-white border border-amber-100 px-3 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-amber-900 truncate">{user.name}</p>
                                        <p className="text-[11px] text-amber-700 font-mono truncate">{user.id}</p>
                                        <p className="text-[10px] text-amber-700/80 mt-1">
                                            {user.pendingProfileUpdate?.photo ? 'Includes cropped photo update' : 'Profile data update pending'}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setViewingDetailsUser(user)}
                                            className="px-2.5 py-1.5 rounded-lg bg-white text-indigo-700 border border-indigo-200 text-[11px] font-bold hover:bg-indigo-50"
                                        >
                                            View User
                                        </button>
                                        <button
                                            onClick={() => setEditingUser(user)}
                                            className="px-2.5 py-1.5 rounded-lg bg-white text-brand-700 border border-brand-200 text-[11px] font-bold hover:bg-brand-50"
                                        >
                                            Open Edit
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Approve pending profile edits for ${user.name}?`)) {
                                                    await approveUserOrPendingEdit(user);
                                                }
                                            }}
                                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold hover:bg-emerald-100"
                                        >
                                            Approve Edit
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Reject pending profile edits for ${user.name}?`)) {
                                                    await rejectPendingEdit(user);
                                                }
                                            }}
                                            className="px-2.5 py-1.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-bold hover:bg-orange-100"
                                        >
                                            Reject Edit
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'id-cards' && (
                    <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 md:gap-4 mb-6">
                        {USER_QUICK_VIEW_OPTIONS.map(option => {
                            const Icon = option.icon;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => setUserQuickViewMode(prev => (prev === option.id ? null : option.id))}
                                    className={`bg-white p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all text-left ${userQuickViewMode === option.id ? 'border-brand-300 ring-2 ring-brand-100' : 'border-slate-100 hover:border-brand-200'}`}
                                >
                                    <div className={`w-11 h-11 rounded-2xl ${option.bg} ${option.accent} flex items-center justify-center mb-3`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="text-sm font-black text-brand-950">{option.label}</div>
                                    <div className="text-xs text-slate-500 mt-1">{option.description}</div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'id-cards' && (
                    <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                            <div>
                                <h3 className="font-bold text-brand-950 text-sm md:text-base">Location Registration Overview</h3>
                                <p className="text-xs text-slate-500 mt-1">Static state-wise count of how many members are registered in each location.</p>
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-xs font-bold border border-brand-100">
                                <MapPin size={13} />
                                {locationStats.length} Locations
                            </div>
                        </div>

                        <div className="space-y-3">
                            {locationStats.map(stat => {
                                const maxCount = locationStats[0]?.count || 1;
                                const barWidth = `${Math.max((stat.count / maxCount) * 100, 10)}%`;

                                return (
                                    <div key={stat.location} className="grid grid-cols-[minmax(0,140px)_1fr_auto] items-center gap-3">
                                        <div className="text-sm font-semibold text-slate-700 truncate">{stat.location}</div>
                                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500" style={{ width: barWidth }} />
                                        </div>
                                        <div className="min-w-[2.5rem] text-right text-sm font-black text-brand-950">{stat.count}</div>
                                    </div>
                                );
                            })}
                            {locationStats.length === 0 && (
                                <div className="text-sm text-slate-400 text-center py-4">No location data available yet.</div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'edit-page' && (
                    <div className="space-y-5 mb-8">
                        <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-lg md:text-xl font-black text-brand-950">Edit Page</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Review user edit requests with original vs edited values and user profile details.
                            </p>
                            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                                <Clock size={13} />
                                Pending Edit Requests: {pendingEditUsers.length}
                            </div>
                        </div>

                        {pendingEditUsers.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
                                <CheckCircle size={42} className="mx-auto text-emerald-500 mb-3" />
                                <p className="font-bold text-slate-700">No pending edit requests right now.</p>
                            </div>
                        ) : pendingEditUsers.map((user) => (
                            <div key={`edit-page-${user.id}`} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                                    <div className="lg:w-72 shrink-0">
                                        <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center text-lg font-black">
                                                    {user.name?.slice(0, 1)?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-brand-950 truncate">{user.name}</p>
                                                    <p className="text-xs text-slate-500 font-mono truncate">{user.id}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 space-y-1.5 text-xs">
                                                <p><span className="font-bold text-slate-600">Email:</span> <span className="text-slate-700 break-all">{user.email || '—'}</span></p>
                                                <p><span className="font-bold text-slate-600">Phone:</span> <span className="text-slate-700">{user.phone || '—'}</span></p>
                                                <p><span className="font-bold text-slate-600">Status:</span> <span className="text-slate-700">{user.status}</span></p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setViewingDetailsUser(user)}
                                                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-green-50 text-green-700 border border-green-200 text-xs font-black hover:bg-green-100 transition-colors"
                                            >
                                                <UserIcon size={14} />
                                                View Full Profile
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="overflow-x-auto rounded-2xl border border-slate-100">
                                            <table className="w-full text-xs md:text-sm">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left font-black text-slate-700">Field</th>
                                                        <th className="px-3 py-2 text-left font-black text-slate-700">Original</th>
                                                        <th className="px-3 py-2 text-left font-black text-slate-700">Edited</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {EDIT_PAGE_FIELDS
                                                        .filter(({ key }) => Object.prototype.hasOwnProperty.call(user.pendingProfileUpdate || {}, key))
                                                        .map(({ key, label }) => {
                                                            const originalRaw = `${(user as any)[key] ?? ''}`.trim();
                                                            const editedRaw = `${(user.pendingProfileUpdate as any)?.[key] ?? ''}`.trim();
                                                            if (editedRaw === '' || originalRaw === editedRaw) return null;
                                                            const isPhotoField = key === 'photo';
                                                            const safeOriginalPhoto = isPhotoField ? getSafeImageSrc(originalRaw) : null;
                                                            const safeEditedPhoto = isPhotoField ? getSafeImageSrc(editedRaw) : null;
                                                            return (
                                                                <tr key={`${user.id}-${String(key)}`} className="border-t border-slate-100 align-top">
                                                                    <td className="px-3 py-2.5 font-bold text-slate-700">{label}</td>
                                                                    <td className="px-3 py-2.5 text-slate-600">
                                                                        {isPhotoField ? (
                                                                            <span>{safeOriginalPhoto ? 'Photo available' : (originalRaw ? 'Invalid image source' : '—')}</span>
                                                                        ) : (originalRaw || '—')}
                                                                    </td>
                                                                    <td className="px-3 py-2.5 text-brand-700 font-semibold">
                                                                        {isPhotoField ? (
                                                                            <span>{safeEditedPhoto ? 'Photo update submitted' : (editedRaw ? 'Invalid image source' : '—')}</span>
                                                                        ) : (editedRaw || '—')}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm(`Approve pending profile edits for ${user.name}?`)) {
                                                        await approveUserOrPendingEdit(user);
                                                    }
                                                }}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black"
                                            >
                                                <CheckCircle size={14} />
                                                Approve Edit
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm(`Reject pending profile edits for ${user.name}?`)) {
                                                        await rejectPendingEdit(user);
                                                    }
                                                }}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black"
                                            >
                                                <XCircle size={14} />
                                                Reject Edit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'users' && (
                    <>
                        {/* Add New User + Search and Filters */}
                        <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
                            {/* Add New User button */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-brand-950 text-sm md:text-base">Manage Members</h3>
                                <button
                                    onClick={() => { setNewUserData({ ...EMPTY_NEW_USER }); setShowAddUser(true); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-blue-500/20"
                                >
                                    <Plus size={16} /> Add User
                                </button>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Search */}
                                <div className="flex-1 relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search name, email, phone, ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 transition-colors text-sm"
                                    />
                                </div>

                                {/* Status Filter */}
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as UserStatus | 'All')}
                                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 transition-colors text-sm"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Pending Verification">Pending</option>
                                    <option value="Rejected">Rejected</option>
                                </select>

                                {/* Role Filter */}
                                <select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value as UserRole | 'All')}
                                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 transition-colors text-sm"
                                >
                                    <option value="All">All Roles</option>
                                    <option value="Member">Member</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Ministry Leader">Ministry Leader</option>
                                    <option value="Choir">Choir</option>
                                    <option value="Media Team">Media Team</option>
                                </select>
                                <select
                                    value={filterLocation}
                                    onChange={(e) => setFilterLocation(e.target.value)}
                                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 transition-colors text-sm"
                                >
                                    <option value="All">All Locations</option>
                                    {userLocationOptions.map(location => (
                                        <option key={location} value={location}>{location}</option>
                                    ))}
                                </select>
                                <select
                                    value={userSortMode}
                                    onChange={(e) => setUserSortMode(e.target.value as 'status' | 'cot-id' | 'member-since')}
                                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 transition-colors text-sm"
                                >
                                    <option value="status">Sort: Status</option>
                                    <option value="cot-id">Sort: COT ID</option>
                                    <option value="member-since">Sort: Member Since</option>
                                </select>
                            </div>

                            {/* Results count and bulk actions */}
                            <div className="mt-3 flex items-center justify-between">
                                <div className="text-xs text-slate-500">
                                    Showing {filteredUsers.length} of {users.length} users
                                    {selectedUsers.size > 0 && (
                                        <span className="ml-2 text-brand-600 font-bold">
                                            • {selectedUsers.size} selected
                                        </span>
                                    )}
                                </div>
                                {selectedUsers.size > 0 && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            onClick={handleBulkApprove}
                                            disabled={isLoading}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-xl font-bold text-xs hover:bg-green-700 transition-colors disabled:opacity-60"
                                        >
                                            <CheckCircle size={13} />
                                            Approve ({selectedUsers.size})
                                        </button>
                                        <button
                                            onClick={handleBulkReject}
                                            disabled={isLoading}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-xl font-bold text-xs hover:bg-amber-700 transition-colors disabled:opacity-60"
                                        >
                                            <XCircle size={13} />
                                            Reject ({selectedUsers.size})
                                        </button>
                                        <button
                                            onClick={() => setShowBulkDeleteConfirm(true)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                            Delete ({selectedUsers.size})
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Users List - Desktop Table */}
                {activeTab === 'users' && (
                    <div className="hidden lg:block bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-12">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                            />
                                        </th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Member Since</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                                            onClick={() => setViewingDetailsUser(user)}
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.has(user.id)}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSelectUser(user.id);
                                                    }}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold shrink-0">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-brand-950">{user.name}</div>
                                                        <div className="text-xs text-slate-500 font-mono">{user.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="text-sm text-slate-700 flex items-center gap-2">
                                                        <Mail size={14} className="text-slate-400" />
                                                        {user.email}
                                                    </div>
                                                    <div className="text-sm text-slate-700 flex items-center gap-2">
                                                        <Phone size={14} className="text-slate-400" />
                                                        {user.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-bold">
                                                    <Award size={12} />
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {user.location || '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(user.status)}`}>
                                                        {user.status === 'Active' && <CheckCircle size={12} />}
                                                        {user.status === 'Pending Verification' && <Clock size={12} />}
                                                        {user.status === 'Rejected' && <AlertCircle size={12} />}
                                                        {getStatusLabel(user.status)}
                                                    </span>
                                                    {hasPendingProfileUpdate(user) && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-700 border border-amber-200">
                                                            <Clock size={10} />
                                                            Edit Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {new Date(user.memberSince || user.joinedDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-2">
                                                    {user.status === 'Pending Verification' && (
                                                        <>
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm(`Approve ${user.name}?`)) {
                                                                        await approveUserOrPendingEdit(user);
                                                                    }
                                                                }}
                                                                className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                                                                title="Approve User"
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm(`Disapprove ${user.name}?`)) {
                                                                        await disapproveUser(user);
                                                                    }
                                                                }}
                                                                className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors"
                                                                title="Disapprove User"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {user.status === 'Rejected' && (
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm(`Approve ${user.name} again?`)) {
                                                                    await approveUserOrPendingEdit(user);
                                                                }
                                                            }}
                                                            className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                                                            title="Approve Again"
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                    )}
                                                    {user.status === 'Active' && (
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm(`Disapprove ${user.name}?`)) {
                                                                    await disapproveUser(user);
                                                                }
                                                            }}
                                                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                                            title="Disapprove User"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    )}
                                                    {user.status !== 'Pending Verification' && hasPendingProfileUpdate(user) && (
                                                        <>
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm(`Approve pending profile edits for ${user.name}?`)) {
                                                                        await approveUserOrPendingEdit(user);
                                                                    }
                                                                }}
                                                                className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                                                                title="Approve Pending Edit"
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm(`Reject pending profile edits for ${user.name}?`)) {
                                                                        await rejectPendingEdit(user);
                                                                    }
                                                                }}
                                                                className="p-2 hover:bg-orange-50 text-orange-600 rounded-lg transition-colors"
                                                                title="Reject Pending Edit"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDownloadUserCard(user)}
                                                        className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors"
                                                        title="Download Entrust Card"
                                                        disabled={downloadingCardUserId === user.id}
                                                    >
                                                        {downloadingCardUserId === user.id ? (
                                                            <div className="animate-spin">⏳</div>
                                                        ) : (
                                                            <Download size={16} />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadUserDetailsPdf(user)}
                                                        className="p-2 hover:bg-teal-50 text-teal-600 rounded-lg transition-colors"
                                                        title="Download Profile Details PDF"
                                                        disabled={downloadingProfilePdfUserId === user.id}
                                                    >
                                                        {downloadingProfilePdfUserId === user.id ? (
                                                            <div className="animate-spin">⏳</div>
                                                        ) : (
                                                            <FileText size={16} />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadMemberFormPdf(user)}
                                                        className="p-2 hover:bg-amber-50 text-amber-700 rounded-lg transition-colors"
                                                        title="Download Member Form PDF"
                                                        disabled={downloadingMemberFormPdfUserId === user.id}
                                                    >
                                                        {downloadingMemberFormPdfUserId === user.id ? (
                                                            <div className="animate-spin">⏳</div>
                                                        ) : (
                                                            <FileText size={16} />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenQrPreview(user)}
                                                        className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                                                        title="View QR Code"
                                                    >
                                                        <QrCode size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingUser(user)}
                                                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                                        title="Edit user"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingUser(user)}
                                                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                                        title="Delete user"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12">
                                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500 font-medium">No users found</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Users List - Mobile Cards */}
                {activeTab === 'users' && (
                    <div className="lg:hidden space-y-4">
                        {filteredUsers.map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm"
                            >
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(user)}
                                    className="w-full flex items-start justify-between mb-3 text-left"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-brand-950 truncate">{user.name}</div>
                                            <div className="text-xs text-slate-500 font-mono">{user.id}</div>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(user.status)}`}>
                                        {user.status === 'Active' && <CheckCircle size={10} />}
                                        {getStatusLabel(user.status)}
                                    </span>
                                </button>
                                <p className="text-[10px] text-slate-400 font-semibold mb-4">Tap name/photo to edit details & photo</p>
                                {hasPendingProfileUpdate(user) && (
                                    <div className="mb-4">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-700 border border-amber-200">
                                            <Clock size={10} />
                                            Pending Profile Edit
                                        </span>
                                    </div>
                                )}

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Mail size={14} className="text-slate-400" />
                                        {user.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Phone size={14} className="text-slate-400" />
                                        {user.phone}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Award size={14} className="text-slate-400" />
                                        {user.role}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <MapPin size={14} className="text-slate-400" />
                                        {user.location || 'Unknown location'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Calendar size={14} className="text-slate-400" />
                                        Member since {new Date(user.memberSince || user.joinedDate).toLocaleDateString()}
                                    </div>
                                </div>

                                {user.status === 'Pending Verification' && (
                                    <div className="flex gap-2 pb-4 mb-4 border-b border-slate-100">
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Approve ${user.name}?`)) {
                                                    await approveUserOrPendingEdit(user);
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl font-medium text-sm hover:bg-green-100 transition-colors"
                                        >
                                            <CheckCircle size={16} />
                                            Approve
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Disapprove ${user.name}?`)) {
                                                    await disapproveUser(user);
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl font-medium text-sm hover:bg-amber-100 transition-colors"
                                        >
                                            <XCircle size={16} />
                                            Disapprove
                                        </button>
                                    </div>
                                )}
                                {user.status === 'Rejected' && (
                                    <div className="pb-4 mb-4 border-b border-slate-100">
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Approve ${user.name} again?`)) {
                                                    await approveUserOrPendingEdit(user);
                                                }
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl font-medium text-sm hover:bg-green-100 transition-colors"
                                        >
                                            <CheckCircle size={16} />
                                            Approve Again
                                        </button>
                                    </div>
                                )}
                                {user.status === 'Active' && (
                                    <div className="pb-4 mb-4 border-b border-slate-100">
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Disapprove ${user.name}?`)) {
                                                    await disapproveUser(user);
                                                }
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium text-sm hover:bg-red-100 transition-colors"
                                        >
                                            <XCircle size={16} />
                                            Disapprove
                                        </button>
                                    </div>
                                )}
                                {user.status !== 'Pending Verification' && hasPendingProfileUpdate(user) && (
                                    <div className="flex gap-2 pb-4 mb-4 border-b border-slate-100">
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Approve pending profile edits for ${user.name}?`)) {
                                                    await approveUserOrPendingEdit(user);
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-medium text-sm hover:bg-emerald-100 transition-colors"
                                        >
                                            <CheckCircle size={16} />
                                            Approve Edit
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Reject pending profile edits for ${user.name}?`)) {
                                                    await rejectPendingEdit(user);
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl font-medium text-sm hover:bg-orange-100 transition-colors"
                                        >
                                            <XCircle size={16} />
                                            Reject Edit
                                        </button>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setViewingDetailsUser(user); }}
                                        className="w-full min-w-0 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-xl font-medium text-sm hover:bg-green-100 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                        View
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleOpenQrPreview(user); }}
                                        className="w-full min-w-0 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-medium text-sm hover:bg-indigo-100 transition-colors"
                                    >
                                        <QrCode size={16} />
                                        QR
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDownloadUserCard(user); }}
                                        className="w-full min-w-0 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-xl font-medium text-sm hover:bg-purple-100 transition-colors"
                                        disabled={downloadingCardUserId === user.id}
                                    >
                                        {downloadingCardUserId === user.id ? (
                                            <div className="animate-spin">⏳</div>
                                        ) : (
                                            <><Download size={16} /> Card</>
                                        )}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDownloadUserDetailsPdf(user); }}
                                        className="w-full min-w-0 flex items-center justify-center gap-2 px-3 py-2 bg-teal-50 text-teal-600 rounded-xl font-medium text-sm hover:bg-teal-100 transition-colors"
                                        disabled={downloadingProfilePdfUserId === user.id}
                                    >
                                        {downloadingProfilePdfUserId === user.id ? (
                                            <div className="animate-spin">⏳</div>
                                        ) : (
                                            <><FileText size={16} /> PDF</>
                                        )}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDownloadMemberFormPdf(user); }}
                                        className="w-full min-w-0 flex items-center justify-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl font-medium text-sm hover:bg-amber-100 transition-colors"
                                        disabled={downloadingMemberFormPdfUserId === user.id}
                                    >
                                        {downloadingMemberFormPdfUserId === user.id ? (
                                            <div className="animate-spin">⏳</div>
                                        ) : (
                                            <><FileText size={16} /> Member Form PDF</>
                                        )}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditingUser(user); }}
                                        className="w-full min-w-0 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl font-medium text-sm hover:bg-blue-100 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDeletingUser(user); }}
                                        className="w-full min-w-0 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-xl font-medium text-sm hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
                                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500 font-medium">No users found</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ID Cards Section */}
                {(activeTab === 'id-cards' || activeTab === 'cot-id-manager') && (
                    <div className="space-y-8">
                        {activeTab === 'cot-id-manager' && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <h3 className="text-base font-black text-brand-950">COT ID Management</h3>
                                    <p className="text-xs text-slate-500 mt-1">Manage COT IDs with manual selection, random dice assignment, and user request tracking.</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold">
                                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">Used: {existingCotIds.size}</span>
                                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Available: {suggestedCotIds.length}+</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'manual', label: 'Manual Select' },
                                    { id: 'random', label: 'Random Dice' },
                                    { id: 'requests', label: `Requests (${cotIdChangeRequests.length})` }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            const nextMode = tab.id as 'manual' | 'random' | 'requests';
                                            setCotManagerMode(nextMode);
                                            if (nextMode === 'random') {
                                                setCotManagerSelectedUserId('');
                                                setCotIdSearchFeedback(null);
                                            }
                                        }}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${cotManagerMode === tab.id ? 'bg-brand-600 text-white border-brand-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[11px] font-bold">Pending Users: {cotIdRequestInsights.pendingUsers}</span>
                                <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-[11px] font-bold">Dislike ID: {cotIdRequestInsights.categories.dislike}</span>
                                <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px] font-bold">Need New ID: {cotIdRequestInsights.categories.newId}</span>
                            </div>

                            {cotManagerMode === 'manual' && (
                                <>
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
                                        <p className="text-xs font-bold text-slate-700">Search COT ID and check occupancy</p>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <input
                                                value={cotIdSearchInput}
                                                onChange={(e) => {
                                                    setCotIdSearchInput(e.target.value);
                                                    setCotIdSearchFeedback(null);
                                                }}
                                                placeholder="Type COT ID (e.g. COT-0001 or 1)"
                                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono outline-none focus:border-brand-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleSearchCotId}
                                                className="px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold"
                                            >
                                                Search COT ID
                                            </button>
                                        </div>
                                        {cotIdSearchFeedback && (
                                            <p className={`text-xs font-semibold ${cotIdSearchFeedback.type === 'occupied' ? 'text-amber-700' : cotIdSearchFeedback.type === 'available' ? 'text-emerald-700' : 'text-red-600'}`}>
                                                {cotIdSearchFeedback.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={cotManagerQuery}
                                            onChange={(e) => setCotManagerQuery(e.target.value)}
                                            placeholder="Search by name, COT ID, or phone..."
                                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-brand-500 text-sm"
                                        />
                                    </div>

                                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                                        {cotManagerUsers.map((user) => {
                                            const currentId = (user.id || '').toUpperCase();
                                            const draftId = cotDraftIds[user.id] ?? currentId;
                                            const normalizedDraft = normalizeCotIdInput(draftId);
                                            const duplicateId = normalizedDraft && normalizedDraft !== currentId && existingCotIds.has(normalizedDraft);
                                            const isAssignable = true;
                                            return (
                                                <div key={user.id} className={`grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_220px_auto] gap-2 items-center rounded-xl border px-3 py-2.5 ${cotManagerSelectedUserId === user.id ? 'border-brand-300 bg-brand-50/70' : 'border-slate-100 bg-slate-50'}`}>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-brand-950 truncate">{user.name}</p>
                                                        <p className="text-[11px] font-mono text-slate-500 truncate">{currentId}</p>
                                                    </div>
                                                    <input
                                                        list="manual-cot-id-options"
                                                        value={draftId}
                                                        onChange={(e) => setCotDraftIds(prev => ({ ...prev, [user.id]: e.target.value }))}
                                                        className={`w-full px-3 py-2 rounded-lg border bg-white text-xs font-mono outline-none ${duplicateId ? 'border-red-300' : 'border-slate-200 focus:border-brand-500'}`}
                                                        placeholder="COT-1960"
                                                    />
                                                    <button
                                                        onClick={async () => {
                                                            const nextId = normalizedDraft;
                                                            if (!onReassignUserId) {
                                                                alert('ID reassignment is not available in this environment.');
                                                                return;
                                                            }
                                                            if (!isCotId(nextId)) {
                                                                alert('Please enter a valid ID format like COT-1960.');
                                                                return;
                                                            }
                                                            if (duplicateId) {
                                                                alert('This COT ID is already used.');
                                                                return;
                                                            }
                                                            if (nextId === currentId) return;
                                                            try {
                                                                await onReassignUserId(user.id, nextId, { ...user, id: nextId });
                                                                setCotDraftIds(prev => ({ ...prev, [user.id]: nextId }));
                                                            } catch (error) {
                                                                console.error('Failed to reassign COT ID', error);
                                                                alert('Failed to reassign COT ID.');
                                                            }
                                                        }}
                                                        className="px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold disabled:opacity-60"
                                                        disabled={!onReassignUserId || !isAssignable}
                                                    >
                                                        Save ID
                                                    </button>
                                                    {duplicateId && (
                                                        <p className="xl:col-span-3 text-[11px] text-red-600 font-semibold">
                                                            {normalizedDraft} is already occupied. Choose a different COT ID.
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        <datalist id="manual-cot-id-options">
                                            {suggestedCotIds.slice(0, 500).map(id => <option key={id} value={id} />)}
                                        </datalist>
                                        {cotManagerUsers.length === 0 && (
                                            <div className="text-sm text-slate-400 text-center py-4">No users found.</div>
                                        )}
                                    </div>
                                    <details className="rounded-xl border border-slate-200 bg-white p-3 mt-2">
                                        <summary className="cursor-pointer text-xs font-bold text-slate-700">
                                            COT ID inventory (random sequence) • click occupied IDs to view profile
                                        </summary>
                                        <div className="mt-3 max-h-44 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pr-1">
                                            {shuffledCotIdInventory.length === 0 && (
                                                <p className="text-xs text-slate-400">No occupied COT IDs yet.</p>
                                            )}
                                            {shuffledCotIdInventory.map((id) => {
                                                const owner = cotIdOwnerById.get(id);
                                                const occupied = !!owner;
                                                return (
                                                    <button
                                                        key={id}
                                                        type="button"
                                                        onClick={() => {
                                                            setCotIdSearchInput(id);
                                                            setCotManagerSelectedUserId(owner?.id || '');
                                                            if (owner) {
                                                                setViewingDetailsUser(owner);
                                                                setCotIdSearchFeedback({ type: 'occupied', message: `${id} is occupied by ${owner.name}.` });
                                                            } else {
                                                                setCotIdSearchFeedback({ type: 'available', message: `${id} is available.` });
                                                            }
                                                        }}
                                                        className={`text-left px-2 py-1.5 rounded-lg border text-[11px] font-mono transition-colors ${occupied ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                                                    >
                                                        {id} • {occupied ? 'Occupied' : 'Free'}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </details>
                                </>
                            )}

                            {cotManagerMode === 'random' && (
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={diceUserQuery}
                                            onChange={(e) => setDiceUserQuery(e.target.value)}
                                            placeholder="Search user by name, ID, phone, email, or location..."
                                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-brand-500"
                                        />
                                    </div>
                                    <select
                                        value={diceTargetUserId}
                                        onChange={(e) => setDiceTargetUserId(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:border-brand-500"
                                    >
                                        <option value="">Select user for random COT ID assignment</option>
                                        {randomDiceUsers.slice(0, 500).map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.name} • {(user.id || '').toUpperCase()} • {user.status}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            onClick={handleRollRandomCotId}
                                            disabled={diceRolling}
                                            className={`px-4 py-2 rounded-xl text-sm font-black text-white transition-transform ${diceRolling ? 'bg-amber-500 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.03]'}`}
                                        >
                                            🎲 {diceRolling ? 'Rolling...' : 'Roll Dice'}
                                        </button>
                                        <CotIdEpicDice isRolling={diceRolling} result={dicePickedCotId || '— — — —'} />
                                        <button
                                            onClick={handleApplyDiceCotId}
                                            disabled={!dicePickedCotId || !diceTargetUserId || !onReassignUserId}
                                            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold disabled:opacity-60"
                                        >
                                            Use this COT ID
                                        </button>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            list="manual-cot-id-options"
                                            value={diceManualInput}
                                            onChange={(e) => setDiceManualInput(e.target.value)}
                                            placeholder="Type COT ID manually (example: COT-1960)"
                                            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-mono outline-none focus:border-brand-500"
                                        />
                                        <button
                                            onClick={() => applyCotIdToSelectedUser(diceManualInput)}
                                            disabled={!diceTargetUserId || !diceManualInput.trim() || !onReassignUserId}
                                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold disabled:opacity-60"
                                        >
                                            Apply Typed ID
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500">Roll to generate a random COT ID, then apply it to the selected user (active, pending, or rejected).</p>
                                </div>
                            )}

                            {cotManagerMode === 'requests' && (
                                <div className="space-y-3">
                                    <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2.5 flex flex-wrap items-center gap-2 text-[11px] font-bold text-amber-900">
                                        <span className="px-2 py-1 rounded-full bg-white border border-amber-200">Need New ID: {cotIdRequestInsights.categories.newId}</span>
                                        <span className="px-2 py-1 rounded-full bg-white border border-amber-200">Dislike ID: {cotIdRequestInsights.categories.dislike}</span>
                                        <span className="px-2 py-1 rounded-full bg-white border border-amber-200">Pending Users: {cotIdRequestInsights.pendingUsers}</span>
                                    </div>
                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                    {cotIdRequestInsights.items.map(note => (
                                        <div key={note.id} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <p className="text-xs font-black text-amber-900 truncate">{note.user?.name || note.userId}</p>
                                                    <span className="px-2 py-0.5 rounded-full bg-white border border-amber-200 text-[10px] font-black text-amber-800">{note.category}</span>
                                                    {note.isPendingUser && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[10px] font-black text-amber-700">Pending User</span>}
                                                </div>
                                                <p className="text-[11px] text-amber-900/90 whitespace-pre-wrap break-words">{note.message}</p>
                                                <p className="text-[10px] text-amber-700 mt-1">{new Date(note.createdAt).toLocaleString()}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setCotManagerMode('manual');
                                                    setCotManagerQuery((note.user?.name || note.userId || '').trim());
                                                    if (note.user?.id) setCotManagerSelectedUserId(note.user.id);
                                                }}
                                                className="shrink-0 px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 text-amber-800 text-[11px] font-bold hover:bg-amber-100"
                                            >
                                                Open User
                                            </button>
                                            {note.user && (
                                                <button
                                                    onClick={() => setViewingDetailsUser(note.user as User)}
                                                    className="shrink-0 px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 text-brand-700 text-[11px] font-bold hover:bg-brand-50"
                                                >
                                                    View Profile
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {cotIdRequestInsights.items.length === 0 && (
                                        <div className="text-sm text-slate-400 text-center py-4">No COT ID change requests from users.</div>
                                    )}
                                </div>
                                </div>
                            )}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <select
                                    value={cotManagerSelectedUserId}
                                    onChange={(e) => setCotManagerSelectedUserId(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                                >
                                    <option value="">All users</option>
                                    {users
                                        .slice()
                                        .sort((a, b) => a.name.localeCompare(b.name))
                                        .map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.name} • {user.id}
                                            </option>
                                        ))}
                                </select>
                                {cotManagerSelectedUserId && (
                                    <button
                                        onClick={() => setCotManagerSelectedUserId('')}
                                        className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                    >
                                        Clear selection
                                    </button>
                                )}
                            </div>
                        </div>
                        )}

                        {/* Search and Filters (Reusing the same logic) */}
                        {activeTab === 'id-cards' && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="flex-1 w-full relative">
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search member ID card..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 transition-colors"
                                    />
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value as UserStatus | 'All')}
                                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-sm font-bold"
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Active">Active</option>
                                        <option value="Pending Verification">Pending</option>
                                    </select>
                                    <select
                                        value={filterLocation}
                                        onChange={(e) => setFilterLocation(e.target.value)}
                                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-sm font-bold"
                                    >
                                        <option value="All">All Locations</option>
                                        {userLocationOptions.map(location => (
                                            <option key={location} value={location}>{location}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={userSortMode}
                                        onChange={(e) => setUserSortMode(e.target.value as 'status' | 'cot-id' | 'member-since')}
                                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-sm font-bold"
                                    >
                                        <option value="status">Status</option>
                                        <option value="cot-id">COT ID</option>
                                        <option value="member-since">Member Since</option>
                                    </select>
                                    <div className="px-4 py-3 bg-brand-50 text-brand-700 rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest whitespace-nowrap">
                                        <Users size={14} /> {filteredUsers.length} Cards
                                    </div>
                                </div>
                            </div>
                        </div>
                        )}

                        {/* ID Cards Grid */}
                        {activeTab === 'id-cards' && (
                        <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-8">
                            <AnimatePresence mode='popLayout'>
                                {filteredUsers.map((user, index) => (
                                    <motion.div
                                        key={user.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05, duration: 0.3 }}
                                        className="relative group w-full"
                                        onClick={() => setViewingDetailsUser(user)}
                                    >
                                        <div className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] w-full">
                                            <AdminIDCard
                                                user={{
                                                    id: user.id,
                                                    name: user.name,
                                                    role: user.role,
                                                    photo: user.photo,
                                                    location: user.location,
                                                    phone: user.phone,
                                                    memberSince: user.memberSince
                                                }}
                                            />
                                        </div>

                                        {/* Quick Actions Hover Overlay */}
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 z-20">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDownloadUserCard(user);
                                                }}
                                                className="w-8 h-8 bg-white/90 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition-all transform hover:scale-110"
                                            >
                                                <Download size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingUser(user);
                                                }}
                                                className="w-8 h-8 bg-white/90 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-inner">
                                <QrCode size={64} className="mx-auto text-slate-200 mb-6 animate-pulse" />
                                <h3 className="text-xl font-serif font-bold text-slate-400">No member IDs found matching filters</h3>
                                <p className="text-slate-400 text-sm mt-2 font-light">Try adjusting your search or filters to see more results.</p>
                            </div>
                        )}
                        </>
                        )}
                    </div>
                )}
                {activeTab === 'messages' && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-sm font-black text-brand-950">Send message by user name or COT/card ID</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsMessageComposerMinimized(prev => !prev)}
                                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                                    >
                                        {isMessageComposerMinimized ? 'Expand' : 'Minimize'}
                                    </button>
                                    <button
                                        onClick={() => setIsMessageComposerClosed(prev => !prev)}
                                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                                    >
                                        {isMessageComposerClosed ? 'Open' : 'Close'}
                                    </button>
                                </div>
                            </div>

                            {!isMessageComposerClosed && (
                                <>
                                    {!isMessageComposerMinimized && (
                                        <>
                                            <div className="space-y-2">
                                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 space-y-2">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Years</p>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setSelectedMessageYears(messageYearOptions)}
                                                                className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-100"
                                                            >
                                                                Select all
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedMessageYears([])}
                                                                className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-100"
                                                            >
                                                                All years
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {messageYearOptions.map(year => {
                                                            const selected = selectedMessageYears.includes(year);
                                                            return (
                                                                <button
                                                                    key={year}
                                                                    onClick={() => toggleMessageYear(year)}
                                                                    className={`px-2.5 py-1 rounded-full border text-[10px] font-bold transition-colors ${selected ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                                                                >
                                                                    {year}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 space-y-2">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Categories</p>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setSelectedMessageCategories(['Active', 'Pending Verification', 'Rejected'])}
                                                                className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-100"
                                                            >
                                                                Select all
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedMessageCategories([])}
                                                                className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-100"
                                                            >
                                                                All categories
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(['Active', 'Pending Verification', 'Rejected'] as UserStatus[]).map(status => {
                                                            const selected = selectedMessageCategories.includes(status);
                                                            return (
                                                                <button
                                                                    key={status}
                                                                    onClick={() => toggleMessageCategory(status)}
                                                                    className={`px-2.5 py-1 rounded-full border text-[10px] font-bold transition-colors ${selected ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                                                                >
                                                                    {status}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    Pick one or more locations, years, and categories. Leave any group unselected to include all from that group.
                                                </p>
                                            </div>
                                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 space-y-2">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Location Categories</p>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setSelectedMessageLocations(userLocationOptions)}
                                                            className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-100"
                                                        >
                                                            Select all
                                                        </button>
                                                        <button
                                                            onClick={() => setSelectedMessageLocations([])}
                                                            className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-100"
                                                        >
                                                            Clear
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {userLocationOptions.map(location => {
                                                        const selected = selectedMessageLocations.includes(location);
                                                        return (
                                                            <button
                                                                key={location}
                                                                onClick={() => toggleMessageLocation(location)}
                                                                className={`px-2.5 py-1 rounded-full border text-[10px] font-bold transition-colors ${selected ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                                                            >
                                                                {location}
                                                            </button>
                                                        );
                                                    })}
                                                    {userLocationOptions.length === 0 && (
                                                        <span className="text-xs text-slate-400">No location data available.</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <input
                                                    list="cot-id-targets"
                                                    value={targetCotIdInput}
                                                    onChange={(e) => setTargetCotIdInput(e.target.value)}
                                                    placeholder="Type user name or COT/card ID"
                                                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-brand-500"
                                                />
                                                <button
                                                    onClick={() => markCotIdForMessage(targetCotIdInput)}
                                                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                                                >
                                                    Add User
                                                </button>
                                                <button
                                                    onClick={() => setSelectedCotIds(
                                                        cotUsers
                                                            .filter(user => selectedMessageLocations.length === 0 || selectedMessageLocations.includes((user.location || '').trim()))
                                                            .filter(user => selectedMessageYears.length === 0 || selectedMessageYears.includes(`${user.joinedDate || ''}`.slice(0, 4)) || selectedMessageYears.includes(`${user.memberSince || ''}`.trim()))
                                                            .filter(user => selectedMessageCategories.length === 0 || selectedMessageCategories.includes(user.status))
                                                            .map(user => user.id.toUpperCase())
                                                    )}
                                                    className="px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold"
                                                >
                                                    Select All
                                                </button>
                                            </div>
                                            <datalist id="cot-id-targets">
                                                {cotUsers.map(user => (
                                                    <option key={user.id} value={`${user.name} • ${user.id.toUpperCase()}`} />
                                                ))}
                                            </datalist>

                                            {highlightedMessageTarget && (
                                                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-2 flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="w-9 h-9 rounded-full bg-white border border-indigo-100 overflow-hidden flex items-center justify-center text-[11px] font-black text-indigo-700 shrink-0">
                                                            {highlightedMessageTarget.photo ? (
                                                                <img src={highlightedMessageTarget.photo} alt={highlightedMessageTarget.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                (highlightedMessageTarget.name || 'U').slice(0, 1).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-black text-indigo-900 truncate">{highlightedMessageTarget.name}</p>
                                                            <p className="text-[11px] font-mono text-indigo-700/80 truncate">{highlightedMessageTarget.id}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => markCotIdForMessage(highlightedMessageTarget.id)}
                                                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            )}

                                            {cotRecipientSuggestions.length > 1 && (
                                                <div className="space-y-1">
                                                    {cotRecipientSuggestions.slice(0, 4).map(user => (
                                                        <button
                                                            key={user.id}
                                                            onClick={() => markCotIdForMessage(user.id)}
                                                            className="w-full text-left px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100"
                                                        >
                                                            <p className="text-xs font-bold text-slate-700 truncate">{user.name}</p>
                                                            <p className="text-[11px] font-mono text-slate-500">{user.id}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-2">
                                                {selectedCotUsers.map(user => (
                                                    <div
                                                        key={user.id}
                                                        className="px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px] font-bold flex items-center gap-2"
                                                    >
                                                        <span className="w-5 h-5 rounded-full bg-white border border-indigo-100 overflow-hidden flex items-center justify-center text-[10px] font-black">
                                                            {user.photo ? (
                                                                <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                (user.name || 'U').slice(0, 1).toUpperCase()
                                                            )}
                                                        </span>
                                                        <span className="max-w-[140px] truncate">{user.name} • {user.id}</span>
                                                        <button
                                                            onClick={() => setSelectedCotIds(prev => prev.filter(item => item !== user.id.toUpperCase()))}
                                                            className="w-4 h-4 rounded-full border border-indigo-200 bg-white text-[9px] leading-none hover:bg-indigo-100"
                                                            title="Remove recipient"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                                {selectedCotIds.length === 0 && (
                                                    <span className="text-xs text-slate-400">No user selected. Message will be sent by location/all-user scope.</span>
                                                )}
                                            </div>
                                            <textarea
                                                value={bulkAdminMessage}
                                                onChange={(e) => setBulkAdminMessage(e.target.value)}
                                                rows={3}
                                                placeholder="Type custom admin message..."
                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-brand-500"
                                            />
                                            <button
                                                onClick={handleSendAdminMessage}
                                                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black uppercase tracking-wide"
                                            >
                                                Send Message
                                            </button>
                                        </>
                                    )}
                                    {isMessageComposerMinimized && (
                                        <p className="text-xs text-slate-500">Composer minimized. Click Expand to continue typing and sending.</p>
                                    )}
                                </>
                            )}
                            {isMessageComposerClosed && (
                                <p className="text-xs text-slate-500">Composer is closed. Click Open to continue sending messages.</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-black text-brand-950">Contact Messages</h2>
                                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">{contactMessages.length}</span>
                                </div>
                                {contactMessages.length === 0 ? (
                                    <p className="text-sm text-slate-400">No contact messages yet.</p>
                                ) : (
                                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                                        {contactMessages.map((msg) => {
                                            const matchedUser = getMessageUser(msg);
                                            return (
                                            <div key={msg.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <p className="text-xs font-black text-brand-950 truncate">{msg.name || 'Website Visitor'}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                                        {matchedUser && (
                                                            <button
                                                                onClick={() => setViewingDetailsUser(matchedUser)}
                                                                className="px-2 py-1 rounded-lg text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100"
                                                                title="View user profile"
                                                            >
                                                                View User
                                                            </button>
                                                        )}
                                                        {onDeleteContactMessage && (
                                                            <button
                                                                onClick={() => onDeleteContactMessage(msg.id)}
                                                                className="p-1 rounded-lg text-red-600 hover:bg-red-50"
                                                                title="Delete message"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-[11px] font-bold text-brand-700">{msg.subject}</p>
                                                <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap break-words">{msg.message}</p>
                                            </div>
                                        )})}
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-black text-brand-950">Testimonials + User Replies</h2>
                                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">{testimonials.length + userReplies.length}</span>
                                </div>
                                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                                    {testimonials.map((t) => (
                                        <div key={t.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <p className="text-xs font-black text-brand-950 truncate">{t.userName}</p>
                                                <span className="text-[10px] text-slate-400">{new Date(t.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-slate-600 italic">"{t.content}"</p>
                                            {t.status === 'Pending' && (
                                                <div className="flex gap-2 mt-2">
                                                    <button onClick={() => handleUpdateTestimonialStatus(t, 'Approved')} className="px-2 py-1 text-[10px] font-bold rounded bg-green-50 text-green-700">Approve</button>
                                                    <button onClick={() => handleUpdateTestimonialStatus(t, 'Rejected')} className="px-2 py-1 text-[10px] font-bold rounded bg-amber-50 text-amber-700">Reject</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {userReplies.map((note) => (
                                        <div key={note.id} className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <p className="text-xs font-black text-blue-900">Reply from {note.userId}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-blue-700/60">{new Date(note.createdAt).toLocaleString()}</span>
                                                    {users.find(user => user.id === note.userId) && (
                                                        <button
                                                            onClick={() => {
                                                                const matched = users.find(user => user.id === note.userId);
                                                                if (matched) setViewingDetailsUser(matched);
                                                            }}
                                                            className="px-2 py-1 rounded-lg text-[10px] font-bold text-blue-700 bg-white border border-blue-200 hover:bg-blue-100"
                                                            title="View user profile"
                                                        >
                                                            View User
                                                        </button>
                                                    )}
                                                    {onDeleteMemberNotification && (
                                                        <button
                                                            onClick={() => onDeleteMemberNotification(note.id)}
                                                            className="p-1 rounded-lg text-red-600 hover:bg-red-100"
                                                            title="Delete reply"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-blue-900 whitespace-pre-wrap break-words">{note.message}</p>
                                        </div>
                                    ))}
                                    {testimonials.length === 0 && userReplies.length === 0 && (
                                        <p className="text-sm text-slate-400">No testimonials or replies yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <h3 className="text-xl font-black text-brand-950">Monthly Admin Reports</h3>
                                    <p className="text-xs text-slate-500 mt-1">Professional monthly report with registrations, ADX senders, disapproved users, deleted users, and tracked website changes.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <select
                                        value={selectedReportMonth}
                                        onChange={(e) => setSelectedReportMonth(e.target.value)}
                                        className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold outline-none focus:border-brand-500"
                                    >
                                        {reportMonthOptions.map(monthKey => (
                                            <option key={monthKey} value={monthKey}>{formatMonthLabel(monthKey)}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => handleDownloadMonthlyReport(selectedReportMonth)}
                                        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black uppercase tracking-wide"
                                    >
                                        Download This Month Report
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
                                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
                                    <p className="text-[11px] text-emerald-700 font-bold uppercase tracking-wide">Users Registered</p>
                                    <p className="text-2xl font-black text-emerald-900 mt-1">{monthlyReportData.monthlyRegisteredUsers.length}</p>
                                </div>
                                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3">
                                    <p className="text-[11px] text-sky-700 font-bold uppercase tracking-wide">Users Sent ADX</p>
                                    <p className="text-2xl font-black text-sky-900 mt-1">{monthlyReportData.monthlyAdxNotes.length}</p>
                                </div>
                                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3">
                                    <p className="text-[11px] text-amber-700 font-bold uppercase tracking-wide">Disapproved Users</p>
                                    <p className="text-2xl font-black text-amber-900 mt-1">{monthlyReportData.monthlyDisapprovedUsers.length}</p>
                                </div>
                                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3">
                                    <p className="text-[11px] text-rose-700 font-bold uppercase tracking-wide">Deleted Users</p>
                                    <p className="text-2xl font-black text-rose-900 mt-1">{monthlyReportData.monthlyDeletedUsers.length}</p>
                                </div>
                                <div className="rounded-2xl border border-violet-100 bg-violet-50 p-3">
                                    <p className="text-[11px] text-violet-700 font-bold uppercase tracking-wide">Website Changes</p>
                                    <p className="text-2xl font-black text-violet-900 mt-1">{monthlyReportData.websiteChanges.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                                <h4 className="text-sm font-black text-brand-950 mb-3">Registered Users ({monthlyReportData.monthlyRegisteredUsers.length})</h4>
                                <div className="max-h-[320px] overflow-y-auto pr-1 space-y-2">
                                    {monthlyReportData.monthlyRegisteredUsers.length === 0 && <p className="text-xs text-slate-400">No registered users in this month.</p>}
                                    {monthlyReportData.monthlyRegisteredUsers.map(user => (
                                        <div key={user.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                                            <p className="text-xs font-black text-brand-900">{user.name}</p>
                                            <p className="text-[11px] text-slate-600 font-mono">{user.id} • {user.phone} • {user.location}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                                <h4 className="text-sm font-black text-brand-950 mb-3">Users Who Sent ADX ({monthlyReportData.monthlyAdxNotes.length})</h4>
                                <div className="max-h-[320px] overflow-y-auto pr-1 space-y-2">
                                    {monthlyReportData.monthlyAdxNotes.length === 0 && <p className="text-xs text-slate-400">No ADX messages in this month.</p>}
                                    {monthlyReportData.monthlyAdxNotes.map(note => (
                                        <div key={note.id} className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2">
                                            <p className="text-xs font-black text-sky-900">{note.userId}</p>
                                            <p className="text-[11px] text-sky-900 whitespace-pre-wrap break-words">{note.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                                <h4 className="text-sm font-black text-brand-950 mb-3">Disapproved Users ({monthlyReportData.monthlyDisapprovedUsers.length})</h4>
                                <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2">
                                    {monthlyReportData.monthlyDisapprovedUsers.length === 0 && <p className="text-xs text-slate-400">No disapproved users in this month.</p>}
                                    {monthlyReportData.monthlyDisapprovedUsers.map(user => (
                                        <div key={user.id} className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
                                            <p className="text-xs font-black text-amber-900">{user.name}</p>
                                            <p className="text-[11px] text-amber-900">{user.id} • {user.phone}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                                <h4 className="text-sm font-black text-brand-950 mb-3">Deleted Users ({monthlyReportData.monthlyDeletedUsers.length})</h4>
                                <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2">
                                    {monthlyReportData.monthlyDeletedUsers.length === 0 && <p className="text-xs text-slate-400">No deleted users in this month.</p>}
                                    {monthlyReportData.monthlyDeletedUsers.map(user => (
                                        <div key={user.id} className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2">
                                            <p className="text-xs font-black text-rose-900">{user.name}</p>
                                            <p className="text-[11px] text-rose-900">{user.id} • {new Date(user.deletedAt).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                            <h4 className="text-sm font-black text-brand-950 mb-3">Website Changes / Activity ({monthlyReportData.websiteChanges.length})</h4>
                            <div className="max-h-[340px] overflow-y-auto pr-1 space-y-2">
                                {monthlyReportData.websiteChanges.length === 0 && (
                                    <p className="text-xs text-slate-400">No tracked website changes in this month from available data sources.</p>
                                )}
                                {monthlyReportData.websiteChanges.map((item, index) => (
                                    <div key={`${item.type}-${index}-${item.date}`} className="rounded-xl border border-violet-100 bg-violet-50 px-3 py-2">
                                        <p className="text-xs font-black text-violet-900">{item.type}</p>
                                        <p className="text-[11px] text-violet-900 whitespace-pre-wrap break-words">{item.detail}</p>
                                        <p className="text-[10px] text-violet-700/80 mt-1">{new Date(item.date).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-brand-950">Previous Reports</h4>
                                <span className="text-xs text-slate-500">{reportMonthOptions.length} months available</span>
                            </div>
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {reportMonthOptions.map(monthKey => (
                                    <button
                                        key={monthKey}
                                        onClick={() => handleDownloadMonthlyReport(monthKey)}
                                        className="text-left px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100"
                                    >
                                        <p className="text-xs font-black text-slate-800">{formatMonthLabel(monthKey)}</p>
                                        <p className="text-[11px] text-slate-500 mt-1">Download detailed PDF report</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Ministries View */}
                {activeTab === 'ministries' && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4 flex-wrap">
                                <h2 className="text-2xl font-black text-brand-950 tracking-tight">Ministry Gallery</h2>
                                {hasOrderChanges && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        onClick={handleSaveOrder}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-accent-500 text-brand-950 rounded-full font-black text-xs uppercase tracking-widest hover:bg-accent-600 transition-all shadow-xl shadow-accent-500/20 active:scale-95"
                                    >
                                        <Save size={16} /> Save Order
                                    </motion.button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setEditingMinistry({
                                        date: new Date().toISOString().split('T')[0],
                                        name: '',
                                        description: '',
                                        image: '',
                                        mediaType: 'image',
                                        duration: ''
                                    })}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-brand-700 rounded-full font-black text-xs uppercase tracking-widest border border-brand-200 hover:bg-brand-50 transition-all"
                                >
                                    <Plus size={16} /> Add Moment
                                </button>
                                <label className="flex items-center gap-2 px-8 py-4 bg-brand-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-900 transition-all cursor-pointer shadow-xl shadow-brand-950/20 active:scale-95 group">
                                    <ImagePlus size={20} className="group-hover:scale-110 transition-transform" /> Upload Photo
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*,video/*"
                                        multiple
                                        onChange={handleMinistryImageUpload}
                                    />
                                </label>
                            </div>
                        </div>

                        <Reorder.Group
                            axis="y"
                            values={ministries}
                            onReorder={(newOrder) => {
                                setMinistries(newOrder);
                                setHasOrderChanges(true);
                            }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8"
                        >
                            {ministries.map((m) => (
                                <Reorder.Item
                                    key={m.id}
                                    value={m}
                                    dragListener={true}
                                    dragControls={undefined}
                                    className="group relative aspect-square rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-white border border-slate-100 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-2xl transition-all duration-700"
                                >
                                    {m.image && !failedMinistryImages[m.id] ? (
                                        inferMinistryMediaType(m) === 'video' ? (
                                            <video
                                                src={m.image}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                                muted
                                                loop
                                                autoPlay
                                                playsInline
                                                onError={() => setFailedMinistryImages(prev => ({ ...prev, [m.id]: true }))}
                                            />
                                        ) : (
                                            <img
                                                src={m.image}
                                                alt={m.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                                onError={() => setFailedMinistryImages(prev => ({ ...prev, [m.id]: true }))}
                                            />
                                        )
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-500 text-center px-3">
                                            <ImageIcon size={22} className="mb-2" />
                                            <p className="text-[10px] font-bold uppercase tracking-wide">Media unavailable</p>
                                        </div>
                                    )}

                                    {/* Sync Overlay with MinistryGallery.tsx */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all md:translate-x-4 md:group-hover:translate-x-0 duration-300 z-20">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingMinistry(m); }}
                                            className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-brand-950 transition-all shadow-lg"
                                            title="Edit & Crop"
                                        >
                                            <Camera size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteMinistry(m.id); }}
                                            className="w-10 h-10 bg-red-400/10 backdrop-blur-xl border border-red-400/20 rounded-full flex items-center justify-center text-red-100 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const idx = ministries.findIndex(item => item.id === m.id);
                                                if (idx <= 0) return;
                                                setMinistries(prev => moveArrayItem(prev, idx, idx - 1));
                                                setHasOrderChanges(true);
                                            }}
                                            className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-brand-950 transition-all shadow-lg"
                                            title="Move Up"
                                        >
                                            <ChevronUp size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const idx = ministries.findIndex(item => item.id === m.id);
                                                if (idx < 0 || idx >= ministries.length - 1) return;
                                                setMinistries(prev => moveArrayItem(prev, idx, idx + 1));
                                                setHasOrderChanges(true);
                                            }}
                                            className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-brand-950 transition-all shadow-lg"
                                            title="Move Down"
                                        >
                                            <ChevronDown size={16} />
                                        </button>
                                    </div>

                                    <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 right-4 md:right-8 pointer-events-none group-hover:translate-y-[-4px] transition-transform duration-500">
                                        <div className="flex items-center gap-2 text-accent-400 mb-1 md:mb-2">
                                            <div className="w-4 h-[1px] bg-accent-400" />
                                            <span className="text-[8px] md:text-[10px] font-black tracking-[0.2em] uppercase">{inferMinistryMediaType(m) === 'video' ? 'Video Moment' : 'Ministry Moment'}</span>
                                        </div>
                                        <h3 className="text-white font-serif font-bold text-sm md:text-lg leading-tight drop-shadow-xl">
                                            {m.date ? new Date(m.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Nov 25, 2026'}
                                        </h3>
                                        {inferMinistryMediaType(m) === 'video' && m.duration && (
                                            <p className="text-[10px] md:text-xs text-white/80 mt-1 inline-flex items-center gap-1">
                                                <Play size={10} /> {m.duration}
                                            </p>
                                        )}
                                    </div>

                                    {/* Reorder Grip - Top Left */}
                                    <div className="absolute top-4 left-4 w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all border border-white/20 hover:bg-white hover:text-brand-950 shadow-lg cursor-grab active:cursor-grabbing z-20">
                                        <GripVertical size={18} />
                                    </div>

                                    <div className="absolute inset-0 border-2 border-transparent group-active:border-accent-500/50 rounded-2xl md:rounded-[2.5rem] transition-colors" />
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>

                        {ministries.length === 0 && (
                            <div className="text-center py-32 bg-slate-50 rounded-[3.5rem] border-2 border-dashed border-slate-200">
                                <ImageIcon size={48} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-400 font-medium">No ministry photos yet. Upload your first moment!</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'home-layout' && (
                    <div className="max-w-5xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-xl border-b-8 border-b-brand-600"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-3xl font-serif font-black text-brand-950">Visual Layout Editor</h2>
                                    <p className="text-slate-500 mt-2 text-sm font-medium">Reorder the home page "seamlessly" by dragging the cards below.</p>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => {
                                            if (window.confirm("Absolutely sure? This resets the home page for EVERYONE.")) {
                                                onUpdateHomeSectionsOrder(['hero', 'about', 'menorah', 'highlights', 'leader', 'hebrew', 'hebrewPages', 'pastorBaruch', 'valparai', 'testimonials', 'members', 'preview', 'donations', 'verify']);
                                            }
                                        }}
                                        className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[2px] text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-2xl transition-all border border-transparent hover:border-brand-100"
                                    >
                                        Factory Reset
                                    </button>
                                    <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-[1.25rem] flex items-center justify-center shadow-inner border border-brand-100">
                                        <GripVertical size={28} />
                                    </div>
                                </div>
                            </div>

                            <Reorder.Group
                                axis="y"
                                values={homeSectionsOrder}
                                onReorder={onUpdateHomeSectionsOrder}
                                className="space-y-4"
                            >
                                {homeSectionsOrder.map((sectionId) => {
                                    const info = HOME_SECTIONS_INFO[sectionId] || { name: sectionId, desc: 'Home component', icon: Globe, color: 'bg-brand-500' };
                                    const Icon = info.icon;
                                    
                                    return (
                                        <Reorder.Item
                                            key={sectionId}
                                            value={sectionId}
                                            dragListener={true}
                                            whileDrag={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                                            className="bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center gap-6 group hover:border-brand-300 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50/30 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150 pointer-events-none" />
                                            
                                            <div className="flex items-center gap-5 flex-1 relative z-10">
                                                <div
                                                    className="text-slate-300 group-hover:text-brand-500 transition-colors shrink-0 cursor-grab active:cursor-grabbing"
                                                    aria-label={`Drag to reorder ${info.name}`}
                                                >
                                                    <GripVertical size={24} />
                                                </div>
                                                
                                                <div className={`w-14 h-14 ${info.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                                                    <Icon size={24} strokeWidth={2.5} />
                                                </div>

                                                <div className="min-w-0">
                                                    <h3 className="font-black text-brand-950 text-lg leading-tight uppercase tracking-tight">
                                                        {info.name}
                                                    </h3>
                                                    <p className="text-slate-400 text-xs font-bold truncate pr-4">
                                                        {info.desc}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 relative z-10">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const idx = homeSectionsOrder.findIndex(item => item === sectionId);
                                                            if (idx <= 0) return;
                                                            onUpdateHomeSectionsOrder(moveArrayItem(homeSectionsOrder, idx, idx - 1));
                                                        }}
                                                        className="w-8 h-8 rounded-full border border-slate-200 text-slate-600 flex items-center justify-center"
                                                        aria-label="Move up"
                                                    >
                                                        <ChevronUp size={14} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const idx = homeSectionsOrder.findIndex(item => item === sectionId);
                                                            if (idx < 0 || idx >= homeSectionsOrder.length - 1) return;
                                                            onUpdateHomeSectionsOrder(moveArrayItem(homeSectionsOrder, idx, idx + 1));
                                                        }}
                                                        className="w-8 h-8 rounded-full border border-slate-200 text-slate-600 flex items-center justify-center"
                                                        aria-label="Move down"
                                                    >
                                                        <ChevronDown size={14} />
                                                    </button>
                                                </div>
                                                <div className="hidden sm:block text-[9px] font-black uppercase tracking-widest text-slate-300 group-hover:text-brand-400 transition-colors bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                                    {sectionId === 'hero' ? 'Top Section' : 'Live Section'}
                                                </div>
                                                <div className="w-8 h-8 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-brand-200 group-hover:text-brand-500 transition-all opacity-0 group-hover:opacity-100">
                                                    <ChevronRight size={16} />
                                                </div>
                                            </div>
                                        </Reorder.Item>
                                    );
                                })}
                            </Reorder.Group>

                            <div className="mt-12 p-8 bg-brand-950 rounded-[2.5rem] border border-brand-800 shadow-2xl flex items-start gap-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />
                                <div className="w-14 h-14 bg-brand-500/20 backdrop-blur-xl border border-brand-500/30 rounded-2xl flex items-center justify-center text-brand-400 shadow-xl shrink-0">
                                    <Globe size={28} className="animate-spin-slow" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-black text-white text-xl">Cloud Global Sync</h4>
                                        <div className="flex items-center gap-2 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
                                            <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Live Cloud Connection</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-brand-100/60 leading-relaxed font-medium">Any changes you make here are synchronized in real-time across all visitor devices worldwide. Precision engineering for a seamless experience.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {activeTab === 'menu-editor' && (
                    <div className="max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl border-b-8 border-b-brand-600"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-3xl font-serif font-black text-brand-950">Navigation Menu Editor</h2>
                                    <p className="text-slate-500 mt-2 text-sm font-medium">Reorder navigation links using drag-and-drop or the move buttons on each card.</p>
                                </div>
                                <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-[1.25rem] flex items-center justify-center shadow-inner border border-brand-100">
                                    <Filter size={26} />
                                </div>
                            </div>

                            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                <p className="text-xs font-black text-amber-900 mb-3">Quick position controls for Hebrew menus</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[{ label: 'HEBREW RESOURCES', view: 'ABOUT' }, { label: 'HEBREW TOOLS', view: 'HEBREW_TOOLS' }].map((item) => (
                                        <div key={item.view} className="rounded-xl border border-amber-200 bg-white p-3">
                                            <p className="text-xs font-black text-brand-950 mb-2">{item.label}</p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => moveNavItemByView(item.view, 'up')}
                                                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                                                >
                                                    Move Up
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveNavItemByView(item.view, 'down')}
                                                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                                                >
                                                    Move Down
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {navItems && navItems.length > 0 ? (
                                <Reorder.Group
                                    axis="y"
                                    values={navItems}
                                    onReorder={(newOrder) => onUpdateNavItems && onUpdateNavItems(newOrder)}
                                    className="space-y-4"
                                >
                                    {navItems.map((item, index) => (
                                        <Reorder.Item
                                            key={`${item.view || item.label}-${index}`}
                                            value={item}
                                            whileDrag={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                                            className="bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center gap-6 group hover:border-brand-300 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50/30 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150 pointer-events-none" />

                                            <div className="flex items-center gap-5 flex-1 relative z-10">
                                                <div className="text-slate-300 group-hover:text-brand-500 transition-colors shrink-0">
                                                    <GripVertical size={24} />
                                                </div>

                                                <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg text-lg font-black shrink-0">
                                                    {item.label.charAt(0)}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <input
                                                        type="text"
                                                        value={item.label}
                                                        onChange={(e) => renameNavItem(index, e.target.value)}
                                                        onBlur={(e) => renameNavItem(index, e.target.value)}
                                                        className="w-full font-black text-brand-950 text-lg leading-tight uppercase tracking-tight break-words bg-transparent border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-brand-500"
                                                    />
                                                    {item.submenu && item.submenu.length > 0 && (
                                                        <div className="mt-2 space-y-1.5 rounded-xl bg-slate-50 border border-slate-200 p-2">
                                                            {item.submenu.map((sub: any, subIndex: number) => (
                                                                <div key={`${sub.view || sub.label}-${subIndex}`} className="flex items-center gap-1.5">
                                                                    <input
                                                                        type="text"
                                                                        value={sub.label}
                                                                        onChange={(e) => renameSubmenuItem(index, subIndex, e.target.value)}
                                                                        onBlur={(e) => renameSubmenuItem(index, subIndex, e.target.value)}
                                                                        className="flex-1 text-[11px] font-bold text-brand-900 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-brand-500"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            moveSubmenuItem(index, subIndex, 'up');
                                                                        }}
                                                                        className="w-6 h-6 rounded-md border border-slate-200 text-slate-600 flex items-center justify-center"
                                                                        aria-label="Move submenu up"
                                                                    >
                                                                        <ChevronUp size={11} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            moveSubmenuItem(index, subIndex, 'down');
                                                                        }}
                                                                        className="w-6 h-6 rounded-md border border-slate-200 text-slate-600 flex items-center justify-center"
                                                                        aria-label="Move submenu down"
                                                                    >
                                                                        <ChevronDown size={11} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-slate-300 text-xs font-bold uppercase tracking-widest shrink-0 pr-4 text-right">
                                                <div className="hidden sm:block">
                                                    {item.submenu && item.submenu.length > 0 ? 'Has submenu' : 'Direct link'}
                                                </div>
                                                <div className="flex items-center gap-1 justify-end mt-2 sm:mt-1">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!onUpdateNavItems || !navItems) return;
                                                            const idx = index;
                                                            if (idx <= 0) return;
                                                            onUpdateNavItems(moveArrayItem(navItems, idx, idx - 1));
                                                        }}
                                                        className="w-7 h-7 rounded-full border border-slate-200 text-slate-600 flex items-center justify-center"
                                                        aria-label="Move up"
                                                    >
                                                        <ChevronUp size={12} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!onUpdateNavItems || !navItems) return;
                                                            const idx = index;
                                                            if (idx < 0 || idx >= navItems.length - 1) return;
                                                            onUpdateNavItems(moveArrayItem(navItems, idx, idx + 1));
                                                        }}
                                                        className="w-7 h-7 rounded-full border border-slate-200 text-slate-600 flex items-center justify-center"
                                                        aria-label="Move down"
                                                    >
                                                        <ChevronDown size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            ) : (
                                <div className="text-center py-16 text-slate-400">
                                    <Filter size={40} className="mx-auto mb-4 opacity-30" />
                                    <p className="font-medium">No navigation items found.</p>
                                </div>
                            )}

                            <div className="mt-12 p-8 bg-brand-950 rounded-[2.5rem] border border-brand-800 shadow-2xl flex items-start gap-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />
                                <div className="w-14 h-14 bg-brand-500/20 backdrop-blur-xl border border-brand-500/30 rounded-2xl flex items-center justify-center text-brand-400 shadow-xl shrink-0">
                                    <Globe size={28} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-black text-white text-xl">Cloud Global Sync</h4>
                                        <div className="flex items-center gap-2 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
                                            <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Live Cloud Connection</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-brand-100/60 leading-relaxed font-medium">Reordering menu links syncs instantly to Firestore. All visitors see the new menu order on their next page load.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {activeTab === 'recycle-bin' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-serif font-black text-brand-950">User Recycle Bin</h2>
                                <p className="text-slate-500 text-sm mt-1">Deleted users can be restored within 30 days. After that, they are removed automatically.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-brand-50 text-brand-600 border border-brand-100">
                                    {deletedUsers.length} in bin
                                </span>
                                <button
                                    onClick={toggleSelectAllDeletedUsers}
                                    className="px-3 py-1 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50"
                                >
                                    {selectedDeletedUsers.size === deletedUsers.length && deletedUsers.length > 0 ? 'Clear all' : 'Select all'}
                                </button>
                                <button
                                    onClick={handleBulkRestoreDeletedUsers}
                                    disabled={!onRestoreUser || selectedDeletedUsers.size === 0 || isLoading}
                                    className="px-3 py-1 rounded-xl text-xs font-bold border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50"
                                >
                                    Restore selected
                                </button>
                                <button
                                    onClick={handleBulkPermanentlyDeleteDeletedUsers}
                                    disabled={!onPermanentlyDeleteUser || selectedDeletedUsers.size === 0 || isLoading}
                                    className="px-3 py-1 rounded-xl text-xs font-bold border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                                >
                                    Delete selected
                                </button>
                            </div>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-3">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm font-black text-brand-950">Deleted Messages Recovery</h2>
                                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">{deletedContactMessages.length + filteredDeletedMemberReplies.length}</span>
                                </div>
                                <select
                                    value={messageRestoreUserFilter}
                                    onChange={(e) => setMessageRestoreUserFilter(e.target.value)}
                                    className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-brand-500"
                                >
                                    <option value="">All users</option>
                                    {deletedMessageUserOptions.map(userId => (
                                        <option key={userId} value={userId}>{userId}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                                    <p className="text-xs font-black text-slate-700">Deleted Contact Messages</p>
                                    {filteredDeletedContactMessages.length === 0 && <p className="text-xs text-slate-400">No deleted contact messages.</p>}
                                    {filteredDeletedContactMessages.map(msg => (
                                        <div key={msg.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                            <p className="text-[11px] font-black text-brand-900 truncate">{msg.name || 'Website Visitor'} {msg.senderId ? `• ${msg.senderId}` : ''}</p>
                                            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{msg.message}</p>
                                            <p className="text-[10px] text-slate-500 mt-1">
                                                Auto delete: {msg.autoDeleteAt ? new Date(msg.autoDeleteAt).toLocaleDateString() : 'Not set'} •
                                                {` ${Math.max(0, Math.ceil(((msg.autoDeleteAt ? new Date(msg.autoDeleteAt).getTime() : Date.now()) - Date.now()) / (24 * 60 * 60 * 1000)))} day(s) left`}
                                            </p>
                                            {onRestoreContactMessage && (
                                                <button
                                                    onClick={() => onRestoreContactMessage(msg.id)}
                                                    className="mt-2 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold hover:bg-emerald-100"
                                                >
                                                    Restore
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                                    <p className="text-xs font-black text-slate-700">Deleted Member Notifications</p>
                                    {filteredDeletedMemberReplies.length === 0 && <p className="text-xs text-slate-400">No deleted member notifications.</p>}
                                    {filteredDeletedMemberReplies.map(note => (
                                        <div key={note.id} className={`rounded-xl border p-3 ${note.from === 'admin' ? 'border-indigo-100 bg-indigo-50' : 'border-blue-100 bg-blue-50'}`}>
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={`text-[11px] font-black truncate ${note.from === 'admin' ? 'text-indigo-900' : 'text-blue-900'}`}>{note.userId}</p>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${note.from === 'admin' ? 'bg-white border-indigo-200 text-indigo-700' : 'bg-white border-blue-200 text-blue-700'}`}>
                                                    {note.from === 'admin' ? 'Admin Message' : 'User Reply'}
                                                </span>
                                            </div>
                                            <p className={`text-[11px] mt-1 line-clamp-2 ${note.from === 'admin' ? 'text-indigo-900' : 'text-blue-900'}`}>{note.message}</p>
                                            <p className={`text-[10px] mt-1 ${note.from === 'admin' ? 'text-indigo-700/70' : 'text-blue-700/70'}`}>
                                                Auto delete: {note.autoDeleteAt ? new Date(note.autoDeleteAt).toLocaleDateString() : 'Not set'} •
                                                {` ${Math.max(0, Math.ceil(((note.autoDeleteAt ? new Date(note.autoDeleteAt).getTime() : Date.now()) - Date.now()) / (24 * 60 * 60 * 1000)))} day(s) left`}
                                            </p>
                                            {onRestoreMemberNotification && (
                                                <button
                                                    onClick={() => onRestoreMemberNotification(note.id)}
                                                    className={`mt-2 px-2.5 py-1.5 rounded-lg bg-white text-[11px] font-bold ${note.from === 'admin' ? 'text-indigo-700 border border-indigo-200 hover:bg-indigo-100' : 'text-blue-700 border border-blue-200 hover:bg-blue-100'}`}
                                                >
                                                    Restore
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {deletedUsers.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 text-center">
                                <RotateCcw size={48} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500 font-medium">Recycle bin is empty.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Select</th>
                                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Deleted At</th>
                                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Auto Delete</th>
                                                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {deletedUsers.map((user) => {
                                                const daysLeft = Math.max(
                                                    0,
                                                    Math.ceil((new Date(user.autoDeleteAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
                                                );
                                                return (
                                                    <tr key={user.id} className="hover:bg-slate-50">
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedDeletedUsers.has(user.id)}
                                                                onChange={() => toggleSelectDeletedUser(user.id)}
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="font-bold text-brand-950">{user.name}</p>
                                                            <p className="text-xs text-slate-500 font-mono">{user.id}</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(user.deletedAt).toLocaleString()}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-slate-600">{new Date(user.autoDeleteAt).toLocaleDateString()}</div>
                                                            <div className="text-xs text-amber-600 font-bold">{daysLeft} day{daysLeft === 1 ? '' : 's'} left</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleRestoreDeletedUser(user.id)}
                                                                    disabled={isLoading || !onRestoreUser}
                                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors disabled:opacity-50"
                                                                >
                                                                    <RotateCcw size={14} />
                                                                    Restore
                                                                </button>
                                                                <button
                                                                    onClick={() => handlePermanentlyDeleteDeletedUser(user.id)}
                                                                    disabled={isLoading || !onPermanentlyDeleteUser}
                                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                                                                >
                                                                    <Trash2 size={14} />
                                                                    Delete Permanently
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'firebase' && (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                            <h2 className="text-2xl font-serif font-black text-brand-950 flex items-center gap-2 mb-2">
                                <Database size={24} className="text-brand-600" /> Firebase Details
                            </h2>
                            <p className="text-slate-500 text-sm">Live Firebase project and storage configuration used by this admin dashboard.</p>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-brand-600">Admin Dashboard Password</h3>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-wider ${hasAdminPasswordOverride ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                    {hasAdminPasswordOverride ? 'Custom Password Active' : 'Default Password Active'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mb-4">
                                Set a custom admin password for this browser/device. This updates access for the admin login modal.
                            </p>
                            <div className="grid md:grid-cols-2 gap-3">
                                <div className="relative">
                                    <input
                                        type={showAdminPasswordDraft ? 'text' : 'password'}
                                        placeholder="New admin password"
                                        value={adminPasswordDraft}
                                        onChange={(e) => {
                                            setAdminPasswordDraft(e.target.value);
                                            setAdminPasswordMessage(null);
                                        }}
                                        className="w-full px-3 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-brand-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowAdminPasswordDraft(prev => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                                    >
                                        {showAdminPasswordDraft ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showAdminPasswordConfirm ? 'text' : 'password'}
                                        placeholder="Confirm new password"
                                        value={adminPasswordConfirm}
                                        onChange={(e) => {
                                            setAdminPasswordConfirm(e.target.value);
                                            setAdminPasswordMessage(null);
                                        }}
                                        className="w-full px-3 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-brand-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowAdminPasswordConfirm(prev => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                                    >
                                        {showAdminPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="relative mt-3">
                                <input
                                    type={showAdminPasswordPhrase ? 'text' : 'password'}
                                    placeholder="Enter password-change phrase"
                                    value={adminPasswordPhrase}
                                    onChange={(e) => {
                                        setAdminPasswordPhrase(e.target.value);
                                        setAdminPasswordMessage(null);
                                    }}
                                    className="w-full px-3 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-brand-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowAdminPasswordPhrase(prev => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                                >
                                    {showAdminPasswordPhrase ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-2">Password-change phrase is required before saving.</p>
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                <button
                                    type="button"
                                    onClick={handleSaveAdminPassword}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black"
                                >
                                    <Save size={14} />
                                    Save Password
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResetAdminPassword}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black"
                                >
                                    <RotateCcw size={14} />
                                    Reset to Default
                                </button>
                            </div>
                            {adminPasswordMessage && (
                                <p className={`mt-3 text-xs font-bold ${adminPasswordMessage.type === 'success' ? 'text-emerald-700' : 'text-red-600'}`}>
                                    {adminPasswordMessage.text}
                                </p>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-brand-600 mb-4">Project</h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-bold text-slate-700">Project ID:</span> <span className="text-slate-600">{firebaseConfig.projectId}</span></p>
                                    <p><span className="font-bold text-slate-700">Auth Domain:</span> <span className="text-slate-600 break-all">{firebaseConfig.authDomain}</span></p>
                                    <p><span className="font-bold text-slate-700">App ID:</span> <span className="text-slate-600 break-all">{firebaseConfig.appId}</span></p>
                                    <p><span className="font-bold text-slate-700">Sender ID:</span> <span className="text-slate-600">{firebaseConfig.messagingSenderId}</span></p>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-brand-600 mb-4">Storage & Collections</h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-bold text-slate-700">Storage Bucket:</span> <span className="text-slate-600 break-all">{firebaseConfig.storageBucket}</span></p>
                                    <p><span className="font-bold text-slate-700">Storage Files Loaded:</span> <span className="text-slate-600">{isLoadingStorage ? 'Loading...' : storageFiles.length}</span></p>
                                    <p><span className="font-bold text-slate-700">Active Users:</span> <span className="text-slate-600">{users.length}</span></p>
                                    <p><span className="font-bold text-slate-700">Deleted Users:</span> <span className="text-slate-600">{deletedUsers.length}</span></p>
                                    <p><span className="font-bold text-slate-700">Testimonials Loaded:</span> <span className="text-slate-600">{testimonials.length}</span></p>
                                    <p><span className="font-bold text-slate-700">Ministry Items Loaded:</span> <span className="text-slate-600">{ministries.length}</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-brand-600 mb-4">Firebase Storage File Details</h3>
                            {isLoadingStorage ? (
                                <p className="text-sm text-slate-500">Loading storage details...</p>
                            ) : storageFiles.length === 0 ? (
                                <p className="text-sm text-slate-500">No files found or storage listing not accessible from this session.</p>
                            ) : (
                                <div className="max-h-72 overflow-auto border border-slate-100 rounded-2xl divide-y divide-slate-100">
                                    {storageFiles.map((filePath) => (
                                        <div key={filePath} className="px-4 py-2 text-xs text-slate-600 font-mono break-all">
                                            {filePath}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {isStorageListTruncated && (
                                <p className="text-xs text-amber-600 font-bold mt-3">
                                    Showing first 120 files only.
                                </p>
                            )}
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-brand-600">Firebase Raw Data (JSON)</h3>
                                <span className="text-[10px] px-2 py-1 rounded-full bg-brand-50 text-brand-700 font-black uppercase tracking-wider">
                                    Live Snapshot
                                </span>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { label: 'Config', value: firebaseConfig },
                                    { label: 'Storage Summary', value: { isLoadingStorage, isStorageListTruncated, loadedFileCount: storageFiles.length } },
                                    { label: 'Storage Files', value: storageFiles },
                                    { label: 'Users', value: users },
                                    { label: 'Deleted Users', value: deletedUsers },
                                    { label: 'Testimonials', value: testimonials },
                                    { label: 'Ministries', value: ministries },
                                ].map(section => (
                                    <details key={section.label} className="rounded-2xl border border-slate-100 bg-slate-950/95">
                                        <summary className="cursor-pointer px-4 py-3 text-xs font-black uppercase tracking-wider text-amber-300">
                                            {section.label}
                                        </summary>
                                        <pre className="max-h-80 overflow-auto border-t border-slate-800 text-slate-100 text-[11px] leading-relaxed p-4 font-mono whitespace-pre-wrap break-words">
                                            {JSON.stringify(section.value, null, 2)}
                                        </pre>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                    </div>{/* /Main Content */}
                </div>{/* /Content Layout */}

            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingUser && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-brand-950">Edit User</h3>
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {isCropping && cropImage ? (
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-brand-950">Crop Profile Photo</span>
                                            <button
                                                onClick={() => setIsCropping(false)}
                                                className="text-xs font-bold text-red-500 hover:text-red-600"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                            <ImageCropper
                                                imageSrc={cropImage}
                                                onCropComplete={handleCropComplete}
                                                onCancel={() => {
                                                    setIsCropping(false);
                                                    setCropImage(null);
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center mb-6">
                                        <div className="relative group">
                                            <div className="w-28 h-28 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg transition-transform group-hover:scale-105 relative">
                                                {editingUser.photo ? (
                                                    <>
                                                        <img src={editingUser.photo} alt={editingUser.name} className="w-full h-full object-cover" />
                                                        <div 
                                                            className="absolute inset-0 bg-brand-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white backdrop-blur-sm"
                                                            onClick={() => {
                                                                setCropImage(editingUser.photo!);
                                                                setIsCropping(true);
                                                            }}
                                                            title="Recrop Photo"
                                                        >
                                                            <ImageIcon size={20} className="mb-1" />
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-center">Crop</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="text-3xl font-bold text-slate-400">{editingUser.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <label className="absolute bottom-0 right-0 w-10 h-10 bg-brand-600 text-white rounded-full border-4 border-white flex items-center justify-center cursor-pointer hover:bg-brand-700 transition-colors shadow-lg" title="Change Photo">
                                                <Camera size={18} />
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handlePhotoSelect}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest text-center">
                                            Click camera to change<br/>or click photo to recrop
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                                        <input
                                            type="text"
                                            value={editingUser.name}
                                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                                        <input
                                            type="email"
                                            value={editingUser.email}
                                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                                        <input
                                            type="tel"
                                            value={editingUser.phone}
                                            onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                                        <input
                                            type="text"
                                            value={editingUser.location}
                                            onChange={(e) => setEditingUser({ ...editingUser, location: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Member Since</label>
                                        <input
                                            type="text"
                                            value={editingUser.memberSince}
                                            onChange={(e) => setEditingUser({ ...editingUser, memberSince: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Joined Date</label>
                                        <input
                                            type="date"
                                            value={(editingUser.joinedDate || '').slice(0, 10)}
                                            onChange={(e) => setEditingUser({ ...editingUser, joinedDate: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                                        <select
                                            value={editingUser.role}
                                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500"
                                        >
                                            <option value="Member">Member</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Ministry Leader">Ministry Leader</option>
                                            <option value="Choir">Choir</option>
                                            <option value="Media Team">Media Team</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                                        <select
                                            value={editingUser.status}
                                            onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as UserStatus })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Pending Verification">Pending Verification</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-6">
                                    <button
                                        onClick={() => setEditingUser(null)}
                                        className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={isLoading}
                                        className="flex-1 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} />
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deletingUser && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-brand-950 mb-2">Delete User?</h3>
                                <p className="text-slate-600">
                                    Move <strong>{deletingUser.name}</strong> to recycle bin? You can restore within 30 days.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeletingUser(null)}
                                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={18} />
                                    {isLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* QR Code Modal */}
            <AnimatePresence>
                {viewingQrUser && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
                        >
                            <div className="flex justify-end mb-2">
                                <button onClick={() => setViewingQrUser(null)} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600">
                                <QrCode size={32} />
                            </div>

                            <h3 className="text-xl font-bold text-brand-950 mb-1">{viewingQrUser.name}</h3>
                            <p className="text-slate-500 font-mono text-xs mb-6">{viewingQrUser.id}</p>

                            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-slate-200 mb-6 flex justify-center">
                                <img
                                    src={getQrImageUrl(viewingQrUser.id, 220)}
                                    alt="User QR Code"
                                    className="w-48 h-48"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.open(getQrImageUrl(viewingQrUser.id, 400), '_blank')}
                                    className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors"
                                >
                                    Download
                                </button>
                                <button
                                    onClick={() => setViewingQrUser(null)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Bulk Delete Confirmation Modal */}
            <AnimatePresence>
                {showBulkDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 size={32} className="text-red-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-brand-950 mb-2">Delete {selectedUsers.size} Users?</h3>
                                <p className="text-slate-600">
                                    Move {selectedUsers.size} selected user{selectedUsers.size > 1 ? 's' : ''} to recycle bin? You can restore within 30 days.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowBulkDeleteConfirm(false)}
                                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={isLoading}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={18} />
                                    {isLoading ? 'Deleting...' : 'Delete All'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {memberFormPageUser && (
                    <div className="fixed inset-0 bg-slate-100 z-50 overflow-y-auto">
                        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                            <div className="bg-[#fffdf9] rounded-[2rem] md:rounded-[3rem] border-2 border-[#d4a547]/30 shadow-xl overflow-hidden">
                                <div className="bg-[#1a1b4b] text-white px-6 md:px-8 py-5 border-b-4 border-[#d4a547]">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4a547]">Member Form Page</p>
                                            <h3 className="text-xl md:text-2xl font-black">{memberFormPageUser.name}</h3>
                                            <p className="text-xs text-white/80 mt-1">{memberFormPageUser.id}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setMemberFormPageUser(null)}
                                            className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black"
                                        >
                                            Back
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6 md:p-8 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-white rounded-2xl border border-[#d4a547]/20">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#d4a547] mb-1">Denomination</p>
                                            <p className="text-sm font-semibold text-slate-700">{memberFormPageUser.communityProfile?.denomination || 'N/A'}</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-2xl border border-[#d4a547]/20">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#d4a547] mb-1">Church Name</p>
                                            <p className="text-sm font-semibold text-slate-700">{memberFormPageUser.communityProfile?.churchName || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white rounded-2xl border border-[#d4a547]/20">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#d4a547] mb-1">Role in Ministry</p>
                                        <p className="text-sm font-semibold text-slate-700">{memberFormPageUser.communityProfile?.role || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-white rounded-2xl border border-[#d4a547]/20">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#d4a547] mb-1">Testimony / Bio</p>
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{memberFormPageUser.communityProfile?.bio || 'N/A'}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDownloadMemberFormPdf(memberFormPageUser)}
                                        disabled={downloadingMemberFormPdfUserId === memberFormPageUser.id}
                                        className="w-full mt-2 px-5 py-3 rounded-2xl bg-amber-600 text-white font-black hover:bg-amber-700 transition-colors"
                                    >
                                        {downloadingMemberFormPdfUserId === memberFormPageUser.id ? 'Generating Member Form PDF...' : 'Download Member Form PDF'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* View Details Modal */}
            <AnimatePresence>
                {viewingDetailsUser && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-brand-950">User Details</h3>
                                    <p className="text-sm text-slate-500 mt-1">Complete member information</p>
                                </div>
                                <button onClick={() => setViewingDetailsUser(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>

                            {/* Profile Section */}
                            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-slate-200">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white overflow-hidden">
                                    {viewingDetailsUser.photo ? (
                                        <img src={viewingDetailsUser.photo} alt={viewingDetailsUser.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-bold">{viewingDetailsUser.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-2xl font-bold text-brand-950 mb-2">{viewingDetailsUser.name}</h4>
                                    <p className="text-sm font-mono text-slate-500 mb-3">{viewingDetailsUser.id}</p>
                                    <div className="flex gap-2">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(viewingDetailsUser.status)}`}>
                                            {viewingDetailsUser.status === 'Active' && <CheckCircle size={12} />}
                                            {viewingDetailsUser.status}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                            <Award size={12} />
                                            {viewingDetailsUser.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <Mail size={16} className="text-slate-400" />
                                        <span className="text-sm text-slate-700">{viewingDetailsUser.email || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <Phone size={16} className="text-slate-400" />
                                        <span className="text-sm text-slate-700">{viewingDetailsUser.phone || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <MapPin size={16} className="text-slate-400" />
                                        <span className="text-sm text-slate-700">{viewingDetailsUser.location || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Member Since</label>
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <Calendar size={16} className="text-slate-400" />
                                        <span className="text-sm text-slate-700">{viewingDetailsUser.memberSince || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Joined Date</label>
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <Calendar size={16} className="text-slate-400" />
                                        <span className="text-sm text-slate-700">{formatDateValue(viewingDetailsUser.joinedDate)}</span>
                                    </div>
                                </div>


                            </div>

                            {viewingDetailsUser.communityProfile && (
                                <div className="mt-8 pt-6 border-t border-slate-200">
                                    <h4 className="text-sm font-bold text-brand-950 mb-3 uppercase tracking-wider">Member Form Submission</h4>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMemberFormPageUser(viewingDetailsUser);
                                            setViewingDetailsUser(null);
                                        }}
                                        className="w-full px-4 py-3 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 text-sm font-black hover:bg-amber-100 transition-colors"
                                    >
                                        Open Member Form on Separate Page
                                    </button>
                                </div>
                            )}

                            {/* QR Code Section in Details */}
                            <div className="mt-8 pt-6 border-t border-slate-200">
                                <h4 className="text-sm font-bold text-brand-950 mb-4 uppercase tracking-wider">Security QR Code</h4>
                                <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                                        <img
                                            src={getQrImageUrl(viewingDetailsUser.id, 180)}
                                            alt="User QR Code"
                                            className="w-32 h-32"
                                        />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <p className="text-xs text-slate-500 mb-4">
                                            Scan this code to open the current live verification page for this member ID.
                                        </p>
                                        <button
                                            onClick={() => window.open(getQrImageUrl(viewingDetailsUser.id, 400), '_blank')}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-700 rounded-xl font-bold text-xs hover:bg-brand-200 transition-colors"
                                        >
                                            <Download size={14} /> Download HQ QR
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="mt-8 pt-6 border-t border-slate-200">
                                <button
                                    onClick={() => handleDownloadUserDetailsPdf(viewingDetailsUser)}
                                    className="w-full mb-3 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                                    disabled={downloadingProfilePdfUserId === viewingDetailsUser.id}
                                >
                                    {downloadingProfilePdfUserId === viewingDetailsUser.id ? (
                                        <><span className="animate-spin">⏳</span> Generating Profile PDF...</>
                                    ) : (
                                        <><FileText size={16} /> Download Professional Profile PDF</>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleDownloadMemberFormPdf(viewingDetailsUser)}
                                    className="w-full mb-3 px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
                                    disabled={downloadingMemberFormPdfUserId === viewingDetailsUser.id}
                                >
                                    {downloadingMemberFormPdfUserId === viewingDetailsUser.id ? (
                                        <><span className="animate-spin">⏳</span> Generating Member Form PDF...</>
                                    ) : (
                                        <><FileText size={16} /> Download Member Form PDF</>
                                    )}
                                </button>
                                <button
                                    onClick={() => setViewingDetailsUser(null)}
                                    className="w-full px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* User Quick View Modal */}
            <AnimatePresence>
                {userQuickViewMode && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-6 md:p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-brand-950">{selectedQuickView?.label}</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {selectedQuickView?.description} • {filteredUsers.length} user{filteredUsers.length === 1 ? '' : 's'}
                                    </p>
                                </div>
                                <button onClick={() => setUserQuickViewMode(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0">
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>

                            {userQuickViewMode === 'photos' && (
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredUsers.map(user => (
                                        <div key={user.id} className="rounded-3xl overflow-hidden border border-slate-100 bg-slate-50">
                                            <div className="aspect-square bg-slate-100">
                                                {user.photo ? (
                                                    <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-300 bg-gradient-to-br from-slate-100 to-slate-200">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="px-4 py-3">
                                                <div className="font-bold text-sm text-brand-950 truncate">{user.name}</div>
                                                <div className="text-[11px] text-slate-500 font-mono">{user.id}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {userQuickViewMode === 'ids' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {filteredUsers.map(user => (
                                        <div key={user.id} className="px-4 py-4 rounded-2xl border border-slate-100 bg-slate-50">
                                            <div className="text-lg font-black text-brand-950 font-mono">{user.id}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {userQuickViewMode === 'cards' && (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    {filteredUsers.map(user => (
                                        <div key={user.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-4">
                                            <div className="mb-3">
                                                <div className="font-bold text-brand-950">{user.name}</div>
                                                <div className="text-xs font-mono text-slate-500">{user.id}</div>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <div className="min-w-[340px]">
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
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {userQuickViewMode === 'locations' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {filteredUsers.map(user => (
                                        <div key={user.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                                            <div className="flex items-center gap-2 text-emerald-600 font-bold mb-2">
                                                <MapPin size={16} />
                                                <span>{user.location || 'Unknown'}</span>
                                            </div>
                                            <div className="text-sm font-semibold text-brand-950">{user.name}</div>
                                            <div className="text-[11px] font-mono text-slate-500 mt-1">{user.id}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {userQuickViewMode === 'join-dates' && (
                                <div className="space-y-3">
                                    {filteredUsers.map(user => (
                                        <div key={user.id} className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50">
                                            <div>
                                                <div className="font-bold text-brand-950">{user.name}</div>
                                                <div className="text-[11px] font-mono text-slate-500">{user.id}</div>
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700">
                                                <Calendar size={14} className="text-slate-400" />
                                                {formatDateValue(user.joinedDate)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {filteredUsers.length === 0 && (
                                <div className="text-center text-slate-400 py-10">No users found for this view.</div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Ministry Edit Modal */}
            <AnimatePresence>
                {editingMinistry && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] p-8 max-w-xl w-full"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-bold text-brand-950">
                                    {editingMinistry.id ? 'Edit Moment' : 'Add New Moment'}
                                </h3>
                                <button
                                    onClick={() => setEditingMinistry(null)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Image Preview or Upload */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Moment Media</label>
                                    <div className="relative aspect-square bg-slate-100 rounded-[2rem] overflow-hidden group border-2 border-slate-100 shadow-inner">
                                        {editingMinistry.image ? (
                                            <>
                                                {inferMinistryMediaType(editingMinistry as Pick<Ministry, 'mediaType' | 'image'>) === 'video' ? (
                                                    <video
                                                        src={editingMinistry.image}
                                                        className="w-full h-full object-cover"
                                                        controls
                                                        playsInline
                                                    />
                                                ) : (
                                                    <img
                                                        src={editingMinistry.image}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-3">
                                                    <label className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-700 transition-colors shadow-lg">
                                                        <Camera size={24} />
                                                        <input type="file" className="hidden" accept="image/*,video/*" onChange={handleMinistryImageUpload} />
                                                    </label>
                                                    <span className="text-xs font-bold uppercase tracking-widest">Change / Crop</span>
                                                </div>
                                            </>
                                        ) : (
                                            <label className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-200 transition-all border-2 border-dashed border-slate-300 rounded-[2rem]">
                                                <ImagePlus size={48} className="mb-2" />
                                                <span className="font-bold">Select Photo</span>
                                                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleMinistryImageUpload} />
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic text-center">Upload image or video. For images, you can crop before saving.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Moment Name</label>
                                    <input
                                        type="text"
                                        value={editingMinistry.name || ''}
                                        onChange={(e) => setEditingMinistry({ ...editingMinistry, name: e.target.value })}
                                        placeholder="Enter ministry moment title"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-500 focus:bg-white transition-all text-brand-950 font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Description</label>
                                    <textarea
                                        value={editingMinistry.description || ''}
                                        onChange={(e) => setEditingMinistry({ ...editingMinistry, description: e.target.value })}
                                        placeholder="Optional notes for this image"
                                        rows={3}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-500 focus:bg-white transition-all text-brand-950 font-medium resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Duration</label>
                                    <input
                                        type="text"
                                        value={editingMinistry.duration || ''}
                                        onChange={(e) => setEditingMinistry({ ...editingMinistry, duration: e.target.value })}
                                        placeholder="e.g. 2:35"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-500 focus:bg-white transition-all text-brand-950 font-medium"
                                    />
                                    <p className="text-[10px] text-slate-400 italic">Useful for videos; auto-filled on upload and editable here.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Moment Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="date"
                                            value={editingMinistry.date || ''}
                                            onChange={(e) => setEditingMinistry({ ...editingMinistry, date: e.target.value })}
                                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-500 focus:bg-white transition-all text-brand-950 font-medium"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic">Dates are automatically detected from the filename if possible.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-10">
                                <button
                                    onClick={() => setEditingMinistry(null)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveMinistry}
                                    disabled={isLoading || !editingMinistry.image}
                                    className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <span className="animate-pulse">Saving...</span>
                                    ) : (
                                        <><Save size={18} /> Save Moment</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add New User Modal */}
            <AnimatePresence>
                {showAddUser && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-brand-950">Add New User</h3>
                                    <p className="text-xs text-slate-400 mt-1">Directly adds user as Active — no approval needed</p>
                                </div>
                                <button onClick={() => setShowAddUser(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X size={22} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Photo upload */}
                                {isNewUserCropping && newUserCropImage ? (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-brand-950">Crop Profile Photo</span>
                                            <button onClick={() => setIsNewUserCropping(false)} className="text-xs font-bold text-red-500">Cancel</button>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                            <ImageCropper
                                                imageSrc={newUserCropImage}
                                                onCropComplete={(url) => {
                                                    setNewUserData(d => ({ ...d, photo: url }));
                                                    setIsNewUserCropping(false);
                                                    setNewUserCropImage(null);
                                                }}
                                                onCancel={() => { setIsNewUserCropping(false); setNewUserCropImage(null); }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center mb-4">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                                {newUserData.photo ? (
                                                    <img src={newUserData.photo} alt="New user" className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon size={36} className="text-slate-300" />
                                                )}
                                            </div>
                                            <label className="absolute bottom-0 right-0 w-9 h-9 bg-blue-600 text-white rounded-full border-4 border-white flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg" title="Add Photo">
                                                <Camera size={16} />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleNewUserPhotoSelect} />
                                            </label>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Click camera to add photo</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Member ID (Optional Manual)</label>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <input
                                                list="available-cot-ids"
                                                type="text"
                                                placeholder="Leave empty for auto-generated ID, or enter COT-1960"
                                                value={newUserData.memberId}
                                                onChange={(e) => setNewUserData(d => ({ ...d, memberId: e.target.value }))}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                                            />
                                        </div>
                                        <datalist id="available-cot-ids">
                                            {suggestedCotIds.map(id => (
                                                <option key={id} value={id} />
                                            ))}
                                        </datalist>
                                        <p className="text-[10px] text-slate-400 font-medium">
                                            Admin can manually choose a COT ID from available options, or leave it empty for automatic assignment.
                                        </p>
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Full Name *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Shaveesh Jeshurun"
                                            value={newUserData.name}
                                            onChange={(e) => setNewUserData(d => ({ ...d, name: e.target.value }))}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Phone Number *</label>
                                        <input
                                            type="tel"
                                            placeholder="e.g. 9876543210"
                                            value={newUserData.phone}
                                            onChange={(e) => setNewUserData(d => ({ ...d, phone: e.target.value }))}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                                        <input
                                            type="email"
                                            placeholder="email@example.com"
                                            value={newUserData.email}
                                            onChange={(e) => setNewUserData(d => ({ ...d, email: e.target.value }))}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Tamil Nadu District *</label>
                                        <select
                                            value={newUserData.location}
                                            onChange={(e) => setNewUserData(d => ({ ...d, location: e.target.value }))}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                                        >
                                            {TAMIL_NADU_DISTRICTS.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                                        <select
                                            value={newUserData.role}
                                            onChange={(e) => setNewUserData(d => ({ ...d, role: e.target.value as UserRole }))}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                                        >
                                            <option value="Member">Member</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Joined Date</label>
                                        <input
                                            type="date"
                                            value={newUserData.joinedDate}
                                            onChange={(e) => setNewUserData(d => ({ ...d, joinedDate: e.target.value }))}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-bold mt-2">
                                    <CheckCircle size={16} className="text-green-600 shrink-0" />
                                    User will be set as <span className="text-green-900">Active</span> immediately — no approval needed
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowAddUser(false)}
                                        className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddNewUser}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-500/20"
                                    >
                                        <Plus size={18} />
                                        {isLoading ? 'Adding...' : 'Add User'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
