import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
    Users, UserCheck, UserX, Clock, Search, Edit2, Trash2, X, User as UserIcon, ShieldAlert,
    ChevronLeft, ChevronRight, Filter, Mail, Phone, MapPin, Droplet,
    Calendar, Award, Shield, ShieldCheck, AlertCircle, CheckCircle, QrCode, Download,
    Save, GripVertical, Globe, Plus, ImagePlus, Camera, Image as ImageIcon, MessageSquare, Check, XCircle,
    PanelLeft, PanelTop, Database, RotateCcw
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
}

interface AdminDashboardProps {
    users: User[];
    deletedUsers?: DeletedUser[];
    contactMessages?: ContactMessage[];
    onDeleteContactMessage?: (messageId: string) => void;
    onUpdateUser: (user: User) => Promise<void>;
    onDeleteUser: (userId: string) => Promise<void>;
    onRestoreUser?: (userId: string) => Promise<void>;
    onCreateUser?: (user: User) => Promise<void>;
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
    valparai: { name: 'Valparai Presence', desc: 'Local impact and community', icon: MapPin, color: 'bg-emerald-500' },
    testimonials: { name: 'Voices of Faith', desc: 'Member stories and testimonies', icon: MessageSquare, color: 'bg-teal-500' },
    members: { name: 'Member Initials', desc: 'Names with two-letter identity logos', icon: Users, color: 'bg-orange-500' },
    preview: { name: 'Entrust Preview', desc: 'Quick overview of community card', icon: Phone, color: 'bg-violet-500' },
    donations: { name: 'Donations', desc: 'Support boxes and giving section', icon: CheckCircle, color: 'bg-orange-500' },
    verify: { name: 'Verify ID', desc: 'Security and verification portal', icon: CheckCircle, color: 'bg-slate-500' }
};



const TAB_ITEMS: { id: 'users' | 'testimonials' | 'ministries' | 'id-cards' | 'home-layout' | 'menu-editor' | 'messages' | 'firebase' | 'recycle-bin'; label: string; icon: React.ElementType }[] = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'recycle-bin', label: 'Recycle Bin', icon: RotateCcw },
    { id: 'firebase', label: 'Firebase', icon: Database },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'ministries', label: 'Ministries', icon: Globe },
    { id: 'id-cards', label: 'ID Cards', icon: QrCode },
    { id: 'home-layout', label: 'Home Layout', icon: GripVertical },
    { id: 'menu-editor', label: 'Menu Editor', icon: Filter },
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

const EMPTY_NEW_USER = {
    name: '',
    phone: '',
    email: '',
    location: 'Valparai',
    role: 'Member' as UserRole,
    photo: '',
    emergency: '',
    memberSince: new Date().getFullYear().toString(),
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    users,
    deletedUsers = [],
    contactMessages = [],
    onDeleteContactMessage,
    onUpdateUser,
    onDeleteUser,
    onRestoreUser,
    onCreateUser,
    onBack,
    homeSectionsOrder,
    onUpdateHomeSectionsOrder,
    navItems = [],
    onUpdateNavItems,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<UserStatus | 'All'>('All');
    const [filterRole, setFilterRole] = useState<UserRole | 'All'>('All');
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
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [downloadingCardUserId, setDownloadingCardUserId] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<'users' | 'testimonials' | 'ministries' | 'id-cards' | 'home-layout' | 'menu-editor' | 'messages' | 'firebase' | 'recycle-bin'>('users');
    const [menuMode, setMenuMode] = useState<'horizontal' | 'vertical'>(() => {
        const stored = localStorage.getItem('adminMenuMode');
        return stored === 'vertical' ? 'vertical' : 'horizontal';
    });

    const toggleMenuMode = () => {
        const next = menuMode === 'horizontal' ? 'vertical' : 'horizontal';
        setMenuMode(next);
        localStorage.setItem('adminMenuMode', next);
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

    React.useEffect(() => {
        if (activeTab === 'testimonials') {
            api.getTestimonials().then(setTestimonials);
        } else if (activeTab === 'ministries') {
            api.getMinistries().then(setMinistries);
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
        return new Date().toISOString().split('T')[0];
    };


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
                description: editingMinistry.description || ''
            };

            if (editingMinistry.id) {
                await api.updateMinistry(ministryData as Ministry);
                setMinistries(prev => prev.map(m => m.id === editingMinistry.id ? (ministryData as Ministry) : m));
            } else {
                const newMin = await api.createMinistry(ministryData as Omit<Ministry, 'id'>);
                setMinistries(prev => [...prev, newMin]);
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

    // Filtered users
    const filteredUsers = useMemo(() => {
        const filtered = users.filter(user => {
            const matchesSearch = searchQuery === '' ||
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.phone.includes(searchQuery) ||
                user.id.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = filterStatus === 'All' || user.status === filterStatus;
            const matchesRole = filterRole === 'All' || user.role === filterRole;

            return matchesSearch && matchesStatus && matchesRole;
        });

        // Sort by status: Pending first, then Active, then Rejected
        return filtered.sort((a, b) => {
            const statusOrder = { 'Pending Verification': 0, 'Active': 1, 'Rejected': 2 };
            return statusOrder[a.status] - statusOrder[b.status];
        });
    }, [users, searchQuery, filterStatus, filterRole]);

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

    const handleAddNewUser = async () => {
        if (!newUserData.name.trim()) { alert('Name is required.'); return; }
        if (!newUserData.phone.trim()) { alert('Phone number is required.'); return; }
        if (!newUserData.location) { alert('Please select a district.'); return; }

        setIsLoading(true);
        try {
            const newId = `COT-${Math.floor(1000 + Math.random() * 9000)}`;
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
                joinedDate: new Date().toISOString().split('T')[0],
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

    const handleBulkApprove = async () => {
        if (selectedUsers.size === 0) return;
        if (!window.confirm(`Approve ${selectedUsers.size} selected user(s)?`)) return;
        setIsLoading(true);
        try {
            const updatePromises = Array.from(selectedUsers).map(userId => {
                const user = users.find(u => u.id === userId);
                if (!user) return Promise.resolve();
                const approvedUser: User = {
                    ...user,
                    ...(user.pendingProfileUpdate || {}),
                    pendingProfileUpdate: undefined,
                    status: 'Active'
                };
                return onUpdateUser(approvedUser);
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
                if (user.status === 'Pending Verification') {
                    return onUpdateUser({ ...user, status: 'Rejected', pendingProfileUpdate: undefined });
                }
                if (hasPendingEdit) {
                    return onUpdateUser({ ...user, pendingProfileUpdate: undefined });
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
        const approvedUser: User = {
            ...user,
            ...(user.pendingProfileUpdate || {}),
            pendingProfileUpdate: undefined,
            status: 'Active'
        };
        await onUpdateUser(approvedUser);
    };
    const rejectPendingEdit = async (user: User) => {
        await onUpdateUser({ ...user, pendingProfileUpdate: undefined });
    };

    const toggleSelectAll = () => {
        if (selectedUsers.size === filteredUsers.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const handleDownloadUserCard = async (user: User) => {
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
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setCropImage(reader.result as string);
                setCroppingType('ministry');
                setIsCropping(true);

                // Pre-detect date from filename
                if (!editingMinistry?.id) {
                    setEditingMinistry(prev => ({
                        ...prev,
                        date: detectDate(file.name),
                        name: file.name.split('.')[0]
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedImageUrl: string) => {
        if (croppingType === 'user' && editingUser) {
            setEditingUser({ ...editingUser, photo: croppedImageUrl });
        } else if (croppingType === 'ministry') {
            setEditingMinistry(prev => ({ ...prev, image: croppedImageUrl }));
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

                    {menuMode === 'horizontal' && (
                        <div className="flex gap-1.5 flex-nowrap overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
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
                        <aside className="w-56 shrink-0 sticky top-28">
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
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
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
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(user.status)}`}>
                                                        {user.status === 'Active' && <CheckCircle size={12} />}
                                                        {user.status === 'Pending Verification' && <Clock size={12} />}
                                                        {user.status === 'Rejected' && <AlertCircle size={12} />}
                                                        {user.status}
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
                                                {new Date(user.joinedDate).toLocaleDateString()}
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
                                                                    if (window.confirm(`Reject ${user.name}?`)) {
                                                                        await onUpdateUser({ ...user, status: 'Rejected', pendingProfileUpdate: undefined });
                                                                    }
                                                                }}
                                                                className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors"
                                                                title="Reject User"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {user.status === 'Rejected' && (
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm(`Approve ${user.name} again?`)) {
                                                                    await onUpdateUser({ ...user, status: 'Active' });
                                                                }
                                                            }}
                                                            className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                                                            title="Approve Again"
                                                        >
                                                            <CheckCircle size={16} />
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
                                                        onClick={() => setViewingQrUser(user)}
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
                                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-brand-950">{user.name}</div>
                                            <div className="text-xs text-slate-500 font-mono">{user.id}</div>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(user.status)}`}>
                                        {user.status === 'Active' && <CheckCircle size={10} />}
                                        {user.status}
                                    </span>
                                </div>
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
                                                if (window.confirm(`Reject ${user.name}?`)) {
                                                    await onUpdateUser({ ...user, status: 'Rejected', pendingProfileUpdate: undefined });
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl font-medium text-sm hover:bg-amber-100 transition-colors"
                                        >
                                            <XCircle size={16} />
                                            Reject
                                        </button>
                                    </div>
                                )}
                                {user.status === 'Rejected' && (
                                    <div className="pb-4 mb-4 border-b border-slate-100">
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Approve ${user.name} again?`)) {
                                                    await onUpdateUser({ ...user, status: 'Active' });
                                                }
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl font-medium text-sm hover:bg-green-100 transition-colors"
                                        >
                                            <CheckCircle size={16} />
                                            Approve Again
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
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => setViewingDetailsUser(user)}
                                        className="w-full min-w-0 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-xl font-medium text-sm hover:bg-green-100 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                        View
                                    </button>
                                    <button
                                        onClick={() => setViewingQrUser(user)}
                                        className="w-full min-w-0 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-medium text-sm hover:bg-indigo-100 transition-colors"
                                    >
                                        <QrCode size={16} />
                                        QR
                                    </button>
                                    <button
                                        onClick={() => handleDownloadUserCard(user)}
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
                                        onClick={() => setEditingUser(user)}
                                        className="w-full min-w-0 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl font-medium text-sm hover:bg-blue-100 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setDeletingUser(user)}
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
                {activeTab === 'id-cards' && (
                    <div className="space-y-8">
                        {/* Search and Filters (Reusing the same logic) */}
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
                                    <div className="px-4 py-3 bg-brand-50 text-brand-700 rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest whitespace-nowrap">
                                        <Users size={14} /> {filteredUsers.length} Cards
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ID Cards Grid */}
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
                    </div>
                )}
                {activeTab === 'messages' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-bold text-brand-950 flex items-center gap-2">
                                <MessageSquare size={18} className="text-brand-500" /> Contact Messages
                            </h2>
                            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                                {contactMessages.length} Total
                            </span>
                        </div>
                        {contactMessages.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
                                <MessageSquare size={40} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 font-medium">No messages yet.</p>
                                <p className="text-slate-300 text-sm mt-1">Messages from the landing page and contact form will appear here in real time.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {contactMessages.map((msg) => (
                                    <div key={msg.id} className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-5 flex flex-col gap-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                    {(msg.name || 'V').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-brand-950 truncate">{msg.name || 'Website Visitor'}</p>
                                                    {!!msg.email && <p className="text-[10px] text-slate-500 truncate">{msg.email}</p>}
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0 ${msg.source === 'hero-widget' ? 'bg-sky-100 text-sky-700' : 'bg-brand-50 text-brand-600'}`}>
                                                {msg.source === 'hero-widget' ? 'Hero' : 'Form'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                                            <span className={`px-2 py-0.5 rounded-full border ${msg.senderType === 'Registered' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                {msg.senderType || 'Non-Registered'}
                                            </span>
                                            {msg.senderId && <span className="text-slate-500 font-mono">{msg.senderId}</span>}
                                        </div>
                                        <p className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-1 rounded-lg truncate">{msg.subject}</p>
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap break-words flex-1">{msg.message}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleString()}</p>
                                            <button
                                                onClick={() => onDeleteContactMessage?.(msg.id)}
                                                className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 border border-red-100 rounded-lg px-2 py-1"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'testimonials' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {testimonials.map((t) => (
                                <div key={t.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs">
                                                {t.userName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-brand-950">{t.userName}</div>
                                                <div className="text-[10px] text-slate-400">{new Date(t.date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${t.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            t.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                            {t.status}
                                        </span>
                                    </div>
                                    <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                                        <span className={`px-2 py-0.5 rounded-full border ${t.senderType === 'Registered' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                            {t.senderType || 'Registered'}
                                        </span>
                                        {t.userId && <span className="text-slate-400 font-mono normal-case">{t.userId}</span>}
                                    </div>

                                    <p className="text-slate-600 text-sm italic mb-6">"{t.content}"</p>

                                    <div className="flex gap-2 border-t border-slate-50 pt-4">
                                        {t.status === 'Pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateTestimonialStatus(t, 'Approved')}
                                                    className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <Check size={14} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateTestimonialStatus(t, 'Rejected')}
                                                    className="flex-1 py-2 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <XCircle size={14} /> Reject
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleDeleteTestimonial(t.id)}
                                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors ml-auto"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {testimonials.length === 0 && (
                                <div className="col-span-full text-center py-12 text-slate-500">
                                    No testimonials found.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Ministries View */}
                {activeTab === 'ministries' && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-6">
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
                                <label className="flex items-center gap-2 px-8 py-4 bg-brand-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-900 transition-all cursor-pointer shadow-xl shadow-brand-950/20 active:scale-95 group">
                                    <ImagePlus size={20} className="group-hover:scale-110 transition-transform" /> Upload Photo
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
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
                                    <img src={m.image} alt={m.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />

                                    {/* Sync Overlay with MinistryGallery.tsx */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-300 z-20">
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
                                    </div>

                                    <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 right-4 md:right-8 pointer-events-none group-hover:translate-y-[-4px] transition-transform duration-500">
                                        <div className="flex items-center gap-2 text-accent-400 mb-1 md:mb-2">
                                            <div className="w-4 h-[1px] bg-accent-400" />
                                            <span className="text-[8px] md:text-[10px] font-black tracking-[0.2em] uppercase">Ministry Moment</span>
                                        </div>
                                        <h3 className="text-white font-serif font-bold text-sm md:text-lg leading-tight drop-shadow-xl">
                                            {m.date ? new Date(m.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Nov 25, 2026'}
                                        </h3>
                                    </div>

                                    {/* Reorder Grip - Top Left */}
                                    <div className="absolute top-4 left-4 w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white/60 opacity-0 group-hover:opacity-100 transition-all border border-white/20 hover:bg-white hover:text-brand-950 shadow-lg cursor-grab active:cursor-grabbing z-20">
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
                    <div className="max-w-3xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl border-b-8 border-b-brand-600"
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
                                                onUpdateHomeSectionsOrder(['hero', 'about', 'menorah', 'highlights', 'leader', 'hebrew', 'valparai', 'testimonials', 'members', 'preview', 'verify']);
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
                                                <div className="text-slate-300 group-hover:text-brand-500 transition-colors shrink-0">
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
                                    <p className="text-slate-500 mt-2 text-sm font-medium">Drag the cards below to reorder the top navigation links for all visitors.</p>
                                </div>
                                <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-[1.25rem] flex items-center justify-center shadow-inner border border-brand-100">
                                    <Filter size={26} />
                                </div>
                            </div>

                            {navItems && navItems.length > 0 ? (
                                <Reorder.Group
                                    axis="y"
                                    values={navItems}
                                    onReorder={(newOrder) => onUpdateNavItems && onUpdateNavItems(newOrder)}
                                    className="space-y-4"
                                >
                                    {navItems.map((item) => (
                                        <Reorder.Item
                                            key={item.label}
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

                                                <div className="min-w-0">
                                                    <h3 className="font-black text-brand-950 text-lg leading-tight uppercase tracking-tight">
                                                        {item.label}
                                                    </h3>
                                                    {item.submenu && item.submenu.length > 0 && (
                                                        <p className="text-slate-400 text-xs font-bold truncate pr-4 mt-0.5">
                                                            {item.submenu.length} sub-links
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-slate-300 text-xs font-bold uppercase tracking-widest shrink-0 pr-4">
                                                {item.submenu && item.submenu.length > 0 ? 'Has submenu' : 'Direct link'}
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
                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-brand-50 text-brand-600 border border-brand-100">
                                {deletedUsers.length} in bin
                            </span>
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
                                                            <p className="font-bold text-brand-950">{user.name}</p>
                                                            <p className="text-xs text-slate-500 font-mono">{user.id}</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(user.deletedAt).toLocaleString()}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-slate-600">{new Date(user.autoDeleteAt).toLocaleDateString()}</div>
                                                            <div className="text-xs text-amber-600 font-bold">{daysLeft} day{daysLeft === 1 ? '' : 's'} left</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => handleRestoreDeletedUser(user.id)}
                                                                disabled={isLoading || !onRestoreUser}
                                                                className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors disabled:opacity-50"
                                                            >
                                                                <RotateCcw size={14} />
                                                                Restore
                                                            </button>
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
                                    src={`https://quickchart.io/qr?text=${encodeURIComponent(JSON.stringify({
                                        id: viewingQrUser.id,
                                        name: viewingQrUser.name,
                                        email: viewingQrUser.email,
                                        phone: viewingQrUser.phone,
                                        location: viewingQrUser.location,
                                        emergency: viewingQrUser.emergency || 'N/A',
                                        role: viewingQrUser.role,
                                        status: viewingQrUser.status
                                    }))}&dark=4c51f7&size=200`}
                                    alt="User QR Code"
                                    className="w-48 h-48"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.open(`https://quickchart.io/qr?text=${encodeURIComponent(JSON.stringify({
                                        id: viewingQrUser.id,
                                        name: viewingQrUser.name,
                                        email: viewingQrUser.email,
                                        phone: viewingQrUser.phone,
                                        location: viewingQrUser.location,
                                        emergency: viewingQrUser.emergency || 'N/A',
                                        role: viewingQrUser.role,
                                        status: viewingQrUser.status
                                    }))}&dark=4c51f7&size=400`, '_blank')}
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


                            </div>

                            {/* QR Code Section in Details */}
                            <div className="mt-8 pt-6 border-t border-slate-200">
                                <h4 className="text-sm font-bold text-brand-950 mb-4 uppercase tracking-wider">Security QR Code</h4>
                                <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                                        <img
                                            src={`https://quickchart.io/qr?text=${encodeURIComponent(JSON.stringify({
                                                id: viewingDetailsUser.id,
                                                name: viewingDetailsUser.name,
                                                role: viewingDetailsUser.role
                                            }))}&dark=4c51f7&size=150`}
                                            alt="User QR Code"
                                            className="w-32 h-32"
                                        />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <p className="text-xs text-slate-500 mb-4">
                                            Scan this code at the sanctuary entrance for digital verification and attendance marking.
                                        </p>
                                        <button
                                            onClick={() => window.open(`https://quickchart.io/qr?text=${encodeURIComponent(JSON.stringify({
                                                id: viewingDetailsUser.id,
                                                name: viewingDetailsUser.name,
                                                email: viewingDetailsUser.email,
                                                phone: viewingDetailsUser.phone,
                                                location: viewingDetailsUser.location,
                                                emergency: viewingDetailsUser.emergency || 'N/A',
                                                role: viewingDetailsUser.role,
                                                status: viewingDetailsUser.status
                                            }))}&dark=4c51f7&size=400`, '_blank')}
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
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Moment Photo</label>
                                    <div className="relative aspect-square bg-slate-100 rounded-[2rem] overflow-hidden group border-2 border-slate-100 shadow-inner">
                                        {editingMinistry.image ? (
                                            <>
                                                <img src={editingMinistry.image} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-3">
                                                    <label className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-700 transition-colors shadow-lg">
                                                        <Camera size={24} />
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleMinistryImageUpload} />
                                                    </label>
                                                    <span className="text-xs font-bold uppercase tracking-widest">Change / Crop</span>
                                                </div>
                                            </>
                                        ) : (
                                            <label className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-200 transition-all border-2 border-dashed border-slate-300 rounded-[2rem]">
                                                <ImagePlus size={48} className="mb-2" />
                                                <span className="font-bold">Select Photo</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleMinistryImageUpload} />
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic text-center">Tip: Square photos look best in the gallery.</p>
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
