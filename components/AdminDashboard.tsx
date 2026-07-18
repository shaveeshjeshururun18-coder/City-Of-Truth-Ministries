import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
    Users, UserCheck, UserX, Clock, Search, Edit2, Trash2, X, User as UserIcon, ShieldAlert,
    ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Filter, Mail, Phone, MapPin, Droplet,
    Calendar, Award, Shield, ShieldCheck, AlertCircle, CheckCircle, QrCode, Download,
    Save, GripVertical, Globe, Plus, ImagePlus, Camera, Image as ImageIcon, MessageSquare, Check, XCircle, FileText,
    PanelLeft, PanelTop, Database, RotateCcw, Dice6, Eye, EyeOff, Video, Tag, Settings, Crop, Lock, Send,
    Sparkles, CircleUser, Menu, Youtube, Facebook, Instagram, UploadCloud, Zap, Share2, Sun,
    Type, Volume2, Hash, Calculator, BookOpen, Languages, Clock3, Flame, ExternalLink, AlertTriangle, Bell
} from 'lucide-react';
import { User, UserRole, UserStatus, Testimonial, Ministry, DeletedUser, Permalink, MemberNotification, MessageKind } from '../types';
import { Button } from './Button';
import { api } from '../services/api';
import { getOpenRouterKeyDetails, getOpenRouterModelDetails, setSelectedOpenRouterModel } from '../services/openRouterService';
import { firebaseConfig, storage } from '../services/firebase';
import { getDownloadURL, listAll, ref as storageRef, uploadBytes } from 'firebase/storage';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import JSZip from 'jszip';
import { ImageCropper } from './ImageCropper';
import { EntrustCard3D } from './WorshipperIDCard';
import { AdminIDCard } from './AdminIDCard';
import { CotIdEpicDice } from './CotIdEpicDice';
import { HEBREW_PAGES } from '../hebrewRegistry';
import { CommunityProfileForm } from './CommunityProfileForm';
import { PermalinkManager } from './PermalinkManager';
import { CompleteRebootModal } from './CompleteRebootModal';
import { BaruchVideosManager } from './BaruchVideosManager';
import { GuidedTour, WelcomeTourModal, useTour, TourStep } from './GuidedTour';
import GreetingCard from './GreetingCard';
import AIChatAssistant from './AIChatAssistant';
import { DivineAssistantSettings } from './DivineAssistantSettings';
import { NavigationGuide, useNavigationGuide } from './NavigationGuide';
import { 
    ADMIN_DASHBOARD_GUIDE, 
    ADMIN_ONBOARDING_GUIDE, 
    USERS_MANAGEMENT_GUIDE,
    HOME_LAYOUT_GUIDE,
    AI_ASSISTANT_GUIDE,
    MENU_EDITOR_GUIDE,
    ID_CARDS_GUIDE,
    AdminGuideButton
} from './AdminNavigationGuide';
import { sendSMS } from '../services/smsService';
import { sendFCMNotification } from '../services/fcmService';
import { VStack, HStack } from '@astryxdesign/core/Layout';

interface GridProps {
    columns?: { minWidth: number; max: number; repeat: string };
    gap?: number;
    className?: string;
    children?: React.ReactNode;
}

const Grid: React.FC<GridProps> = ({ columns, gap = 3, className = "", children }) => {
    const style = columns ? {
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${columns.minWidth}px, 1fr))`,
        gap: `${gap * 0.25}rem`
    } : {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: `${gap * 0.25}rem`
    };

    return (
        <div style={style} className={className}>
            {children}
        </div>
    );
};

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



interface AdminDashboardProps {
    users: User[];
    deletedUsers?: DeletedUser[];
    contactMessages?: ContactMessage[];
    deletedContactMessages?: ContactMessage[];
    memberNotifications?: MemberNotification[];
    deletedMemberNotifications?: MemberNotification[];
    onSendMessageToUsers?: (targetUserIds: string[], message: string, imageUrl?: string) => void;
    onDeleteContactMessage?: (messageId: string) => void;
    onRestoreContactMessage?: (messageId: string) => void;
    onDeleteMemberNotification?: (notificationId: string) => void;
    onRestoreMemberNotification?: (notificationId: string) => void;
    onUpdateMemberNotification?: (updatedNotification: MemberNotification) => void;
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



type AdminTabId = 'users' | 'edit-page' | 'testimonials' | 'ministries' | 'id-cards' | 'cot-id-manager' | 'reports' | 'home-layout' | 'menu-editor' | 'messages' | 'firebase' | 'recycle-bin' | 'admin-tabs' | 'member-forms' | 'permalinks' | 'widgets' | 'notifications' | 'ai-analytics' | 'baruch-hashem';
type AdminTabConfig = { id: AdminTabId; label: string; icon: string; order: number; hidden: boolean };

type WidgetSettingsConfig = {
    shareVisible: boolean;
    shareSize: number;
    aiVisible: boolean;
    aiSize: number;
    aiLabelText: string;
    aiAnimation: boolean;
};

const TAB_ITEMS: { id: AdminTabId; label: string; icon: React.ElementType }[] = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'member-forms', label: 'Member Forms', icon: FileText },
    { id: 'edit-page', label: 'Edit Page', icon: Edit2 },
    { id: 'recycle-bin', label: 'Recycle Bin', icon: RotateCcw },
    { id: 'firebase', label: 'Firebase', icon: Database },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'ministries', label: 'Tab TV + Ministry', icon: Globe },
    { id: 'id-cards', label: 'ID Cards', icon: QrCode },
    { id: 'cot-id-manager', label: 'COT ID Manager', icon: Dice6 },
    { id: 'reports', label: 'Monthly Reports', icon: FileText },
    { id: 'home-layout', label: 'Pages & Sections', icon: GripVertical },
    { id: 'menu-editor', label: 'Menu Editor', icon: Filter },
    { id: 'permalinks', label: 'Permalinks', icon: ExternalLink },
    { id: 'widgets', label: 'Widgets', icon: GripVertical },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai-analytics', label: 'AI Analytics', icon: Sparkles },
    { id: 'admin-tabs', label: 'Admin Pages', icon: Settings }
];

const LUCIDE_ICONS: Record<string, React.ElementType> = {
    Users, Edit2, RotateCcw, Database, MessageSquare, Globe, QrCode, Dice6, FileText, GripVertical, Filter, Settings, ExternalLink, Sparkles, Bell
};

const DEFAULT_ADMIN_TABS: AdminTabConfig[] = [
    { id: 'users', label: 'Users', icon: 'Users', order: 0, hidden: false },
    { id: 'member-forms', label: 'Member Forms', icon: 'FileText', order: 1, hidden: false },
    { id: 'edit-page', label: 'Edit Page', icon: 'Edit2', order: 2, hidden: false },
    { id: 'recycle-bin', label: 'Recycle Bin', icon: 'RotateCcw', order: 3, hidden: false },
    { id: 'firebase', label: 'Firebase', icon: 'Database', order: 4, hidden: false },
    { id: 'messages', label: 'Messages', icon: 'MessageSquare', order: 5, hidden: false },
    { id: 'ministries', label: 'Tab TV + Ministry', icon: 'Globe', order: 6, hidden: false },
    { id: 'id-cards', label: 'ID Cards', icon: 'QrCode', order: 7, hidden: false },
    { id: 'cot-id-manager', label: 'COT ID Manager', icon: 'Dice6', order: 8, hidden: false },
    { id: 'reports', label: 'Monthly Reports', icon: 'FileText', order: 9, hidden: false },
    { id: 'home-layout', label: 'Pages & Sections', icon: 'GripVertical', order: 10, hidden: false },
    { id: 'menu-editor', label: 'Menu Editor', icon: 'Filter', order: 11, hidden: false },
    { id: 'permalinks', label: 'Permalinks', icon: 'ExternalLink', order: 12, hidden: false },
    { id: 'widgets', label: 'Widgets', icon: 'GripVertical', order: 13, hidden: false },
    { id: 'notifications', label: 'Notifications', icon: 'Bell', order: 14, hidden: false },
    { id: 'ai-analytics', label: 'AI Analytics', icon: 'Sparkles', order: 15, hidden: false },
    { id: 'admin-tabs', label: 'Admin Pages', icon: 'Settings', order: 16, hidden: false }
];

const normalizeAdminTabs = (tabs: any[]): AdminTabConfig[] => {
    const validIds = new Set(DEFAULT_ADMIN_TABS.map(tab => tab.id));
    const cleaned = (Array.isArray(tabs) ? tabs : [])
        .filter(tab => tab && validIds.has(tab.id))
        .map((tab, index) => {
            const fallback = DEFAULT_ADMIN_TABS.find(item => item.id === tab.id)!;
            return {
                id: tab.id as AdminTabId,
                label: `${tab.label || fallback.label}`,
                icon: `${tab.icon || fallback.icon}`,
                order: Number.isFinite(tab.order) ? tab.order : index,
                hidden: !!tab.hidden
            };
        });

    const byId = new Map(cleaned.map(tab => [tab.id, tab]));
    DEFAULT_ADMIN_TABS.forEach(defaultTab => {
        if (!byId.has(defaultTab.id)) byId.set(defaultTab.id, defaultTab);
    });

    return Array.from(byId.values())
        .sort((a, b) => a.order - b.order)
        .map((tab, index) => ({ ...tab, order: index }));
};

const COMMON_DISAPPROVE_REASONS = [
    'Incomplete or invalid profile information',
    'Entrust/verification document is unclear',
    'Duplicate account or conflicting member details',
    'Manual ministry review required before approval',
];

const ROYAL_CARD_THEMES: ReadonlyArray<{
    tone: NonNullable<User['cardThemeTone']>;
    name: string;
    label: string;
    description: string;
    swatch: string;
    ring: string;
}> = [
    {
        tone: 'gold',
        name: 'Royal Gold',
        label: 'Gold',
        description: 'Warm crown finish',
        swatch: 'from-[#fff7d6] via-[#f6c453] to-[#8a4b08]',
        ring: 'ring-amber-400'
    },
    {
        tone: 'purple',
        name: 'Imperial Violet',
        label: 'Violet',
        description: 'Deep palace violet',
        swatch: 'from-[#f8e8ff] via-[#a855f7] to-[#34145f]',
        ring: 'ring-violet-400'
    },
    {
        tone: 'blue',
        name: 'Sapphire Crest',
        label: 'Sapphire',
        description: 'Premium royal blue',
        swatch: 'from-[#e0f2fe] via-[#2563eb] to-[#0f172a]',
        ring: 'ring-blue-400'
    },
    {
        tone: 'green',
        name: 'Emerald Seal',
        label: 'Emerald',
        description: 'Rich official green',
        swatch: 'from-[#d1fae5] via-[#10b981] to-[#064e3b]',
        ring: 'ring-emerald-400'
    },
    {
        tone: 'red',
        name: 'Crimson Seal',
        label: 'Crimson',
        description: 'Rich royal red',
        swatch: 'from-[#ffe4e6] via-[#e11d48] to-[#4c0519]',
        ring: 'ring-rose-400'
    },
    {
        tone: 'lightblue',
        name: 'Ocean Shimmer',
        label: 'Light Blue',
        description: 'Serene light blue',
        swatch: 'from-[#e0f7fa] via-[#00acc1] to-[#006064]',
        ring: 'ring-cyan-400'
    }
];

const ROYAL_PREVIEW_THEME_CLASSES: Record<NonNullable<User['cardThemeTone']>, {
    shell: string;
    header: string;
    accentText: string;
    panel: string;
    icon: string;
    title: string;
    badge: string;
    photoBg: string;
    focus: string;
}> = {
    gold: {
        shell: 'bg-gradient-to-br from-[#1f1305] via-[#4a2d07] to-[#d97706] border-amber-300/60',
        header: 'bg-gradient-to-r from-[#2a1606] via-[#a16207] to-[#fbbf24]',
        accentText: 'text-amber-100',
        panel: 'border-amber-100 bg-white/12',
        icon: 'text-amber-200',
        title: 'text-white',
        badge: 'text-amber-100 bg-amber-300/15 border-amber-200/40',
        photoBg: 'bg-amber-950',
        focus: 'focus-visible:ring-amber-300/70'
    },
    purple: {
        shell: 'bg-gradient-to-br from-[#180b35] via-[#34145f] to-[#6d28d9] border-fuchsia-300/50',
        header: 'bg-gradient-to-r from-[#1f1147] via-[#6d28d9] to-[#d946ef]',
        accentText: 'text-fuchsia-100',
        panel: 'border-fuchsia-100 bg-white/12',
        icon: 'text-fuchsia-200',
        title: 'text-white',
        badge: 'text-fuchsia-100 bg-fuchsia-300/15 border-fuchsia-200/40',
        photoBg: 'bg-purple-950',
        focus: 'focus-visible:ring-fuchsia-300/70'
    },
    blue: {
        shell: 'bg-gradient-to-br from-slate-950 via-blue-950 to-sky-900 border-sky-300/50',
        header: 'bg-gradient-to-r from-slate-950 via-blue-900 to-sky-600',
        accentText: 'text-sky-100',
        panel: 'border-sky-100 bg-white/12',
        icon: 'text-sky-200',
        title: 'text-white',
        badge: 'text-sky-100 bg-sky-400/15 border-sky-200/40',
        photoBg: 'bg-sky-950',
        focus: 'focus-visible:ring-sky-300/70'
    },
    green: {
        shell: 'bg-gradient-to-br from-[#052e24] via-emerald-950 to-teal-800 border-emerald-300/50',
        header: 'bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-500',
        accentText: 'text-emerald-100',
        panel: 'border-emerald-100 bg-white/12',
        icon: 'text-emerald-200',
        title: 'text-white',
        badge: 'text-emerald-100 bg-emerald-300/15 border-emerald-200/40',
        photoBg: 'bg-emerald-950',
        focus: 'focus-visible:ring-emerald-300/70'
    },
    red: {
        shell: 'bg-gradient-to-br from-rose-950 via-red-900 to-rose-700 border-rose-300/50',
        header: 'bg-gradient-to-r from-rose-950 via-red-800 to-rose-500',
        accentText: 'text-rose-100',
        panel: 'border-rose-100 bg-white/12',
        icon: 'text-rose-200',
        title: 'text-white',
        badge: 'text-rose-100 bg-rose-300/15 border-rose-200/40',
        photoBg: 'bg-rose-950',
        focus: 'focus-visible:ring-rose-300/70'
    },
    lightblue: {
        shell: 'bg-gradient-to-br from-cyan-950 via-cyan-900 to-teal-850 border-cyan-300/50',
        header: 'bg-gradient-to-r from-cyan-950 via-cyan-800 to-teal-600',
        accentText: 'text-cyan-100',
        panel: 'border-cyan-100 bg-white/12',
        icon: 'text-cyan-200',
        title: 'text-white',
        badge: 'text-cyan-100 bg-cyan-400/15 border-cyan-200/40',
        photoBg: 'bg-cyan-950',
        focus: 'focus-visible:ring-cyan-300/70'
    }
};

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
const ADMIN_PASSWORD_CHANGE_PHRASE = import.meta.env.VITE_ADMIN_PASSWORD_CHANGE_PHRASE;
const MEMBER_FORM_LOGO_URL = '/assets/member-form-logo.png';
const MEMBER_FORM_STAMP_URL = '/assets/member-form-authorised-stamp-transparent.png';
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

const SectionMiniPreview: React.FC<{ sectionId: string; customName: string; customDesc: string }> = ({ sectionId, customName, customDesc }) => {
    switch (sectionId) {
        case 'hero':
            return (
                <div className="w-full bg-gradient-to-r from-brand-900 to-indigo-950 text-white rounded-2xl p-4 relative overflow-hidden shadow-lg border border-brand-800">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full blur-xl pointer-events-none" />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                        <div className="flex-1 text-center md:text-left">
                            <span className="inline-block bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase mb-1">
                                Welcome Portal
                            </span>
                            <h4 className="text-sm md:text-base font-serif font-black text-amber-300 uppercase tracking-tight">
                                {customName || 'Hero Welcome'}
                            </h4>
                            <p className="text-[10px] text-slate-300 font-medium mt-1 max-w-md">
                                {customDesc || 'Main entrance with video & primary CTA'}
                            </p>
                        </div>
                        <div className="shrink-0 flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/20 transition-all cursor-pointer">
                                <Video size={12} className="text-amber-400" />
                            </div>
                            <div className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-brand-950 font-black text-[9px] tracking-wider uppercase transition-all shadow-md flex items-center gap-1 cursor-pointer">
                                Enter Sanctuary <ChevronRight size={10} strokeWidth={3} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'about':
            return (
                <div className="w-full bg-white rounded-2xl p-4 shadow-md border border-slate-100 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <span className="inline-block bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase mb-1">
                            Our Foundation
                        </span>
                        <h4 className="text-sm font-black text-brand-950 uppercase tracking-tight">
                            {customName || 'About Ministry'}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">
                            {customDesc || 'Mission, vision and core values'}
                        </p>
                        <div className="flex gap-2 mt-2">
                            <span className="w-2 h-2 rounded-full bg-brand-500" />
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                        </div>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-2">
                        {['Truth', 'Worship', 'Love'].map((pill, i) => (
                            <div key={pill} className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex flex-col items-center justify-center text-center shadow-sm">
                                <div className={`w-6 h-6 rounded-lg ${i === 0 ? 'bg-brand-100 text-brand-600' : i === 1 ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'} flex items-center justify-center mb-1`}>
                                    {i === 0 ? <ShieldCheck size={12} /> : i === 1 ? <Award size={12} /> : <Users size={12} />}
                                </div>
                                <span className="text-[8px] font-black text-slate-700 uppercase tracking-wider">{pill}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'menorah':
            return (
                <div className="w-full bg-slate-950 text-white rounded-2xl p-4 relative overflow-hidden shadow-lg border border-slate-900">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center justify-between gap-4 relative z-10">
                        <div className="flex-1">
                            <span className="inline-block bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase mb-1">
                                Sacred Symbolism
                            </span>
                            <h4 className="text-sm font-serif font-bold text-amber-100 tracking-wide">
                                {customName || 'Golden Menorah'}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium mt-1">
                                {customDesc || 'Spiritual significance and flag'}
                            </p>
                            <div className="flex items-center gap-2 mt-3 bg-white/5 border border-white/10 px-2 py-1 rounded-xl w-fit">
                                <span className="text-[8px] font-black tracking-widest text-slate-300 uppercase">State of Israel Flag</span>
                                <div className="w-4 h-3 bg-white border border-slate-400 flex flex-col justify-between p-[1px] shrink-0">
                                    <div className="h-[2px] bg-blue-600" />
                                    <div className="text-[5px] text-blue-600 font-bold leading-none text-center">✡</div>
                                    <div className="h-[2px] bg-blue-600" />
                                </div>
                            </div>
                        </div>
                        <div className="shrink-0 flex items-center justify-center p-2 bg-gradient-to-br from-amber-500/20 to-brand-950 border border-amber-500/30 rounded-2xl shadow-inner">
                            <svg className="w-10 h-10 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 4v16M8 8c0 4 4 4 4 4s4 0 4-4M5 6c0 8 7 8 7 8s7 0 7-8M2 5c0 11 10 11 10 11s10 0 10-11M10 20h4" strokeLinecap="round"/>
                                <circle cx="12" cy="2" r="0.8" fill="currentColor"/>
                                <circle cx="8" cy="6" r="0.8" fill="currentColor"/>
                                <circle cx="16" cy="6" r="0.8" fill="currentColor"/>
                                <circle cx="5" cy="4" r="0.8" fill="currentColor"/>
                                <circle cx="19" cy="4" r="0.8" fill="currentColor"/>
                                <circle cx="2" cy="3" r="0.8" fill="currentColor"/>
                                <circle cx="22" cy="3" r="0.8" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>
                </div>
            );
        case 'highlights':
            return (
                <div className="w-full bg-slate-50 rounded-2xl p-4 shadow-inner border border-slate-200/60">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="inline-block bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase mb-0.5">
                                Live Action
                            </span>
                            <h4 className="text-xs font-black text-brand-950 uppercase tracking-tight">
                                {customName || 'Ministry Moments'}
                            </h4>
                            <p className="text-[9px] text-slate-400 font-bold truncate max-w-xs">
                                {customDesc || 'Global highlights and focus'}
                            </p>
                        </div>
                        <span className="text-[8px] font-black text-sky-600 bg-sky-50 px-2 py-1 rounded-lg border border-sky-100 uppercase tracking-wider">
                            Gallery Mockup
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((card) => (
                            <div key={card} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm flex flex-col">
                                <div className="h-10 bg-slate-200 relative overflow-hidden flex items-center justify-center">
                                    <ImageIcon size={14} className="text-slate-400" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                                    <span className="absolute bottom-1 left-1 text-[6px] font-bold text-white px-1 py-0.5 rounded bg-black/40">Active</span>
                                </div>
                                <div className="p-1">
                                    <div className="w-10 h-1 bg-brand-500 rounded mb-0.5" />
                                    <div className="w-14 h-1 bg-slate-200 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'leader':
            return (
                <div className="w-full bg-gradient-to-br from-indigo-950 to-brand-950 text-white rounded-2xl p-4 relative overflow-hidden shadow-lg border border-indigo-900">
                    <div className="flex flex-col md:flex-row gap-4 items-center relative z-10">
                        <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-full bg-slate-300 border-2 border-amber-400/80 shadow-md flex items-center justify-center text-slate-700 font-bold text-xs uppercase overflow-hidden">
                                <UserIcon size={24} className="text-slate-500" />
                            </div>
                            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-[8px] font-bold text-brand-950 px-1 rounded-full border border-brand-950">Leader</span>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <span className="inline-block bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase mb-1">
                                Shepherd's Voice
                            </span>
                            <h4 className="text-sm font-bold text-amber-300">
                                {customName || 'Leader Message'}
                            </h4>
                            <p className="text-[10px] text-slate-300 mt-1 italic font-serif">
                                "{customDesc || 'Direct word from ministry leadership'}"
                            </p>
                            <div className="mt-2 text-[8px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5 justify-center md:justify-start">
                                <ShieldCheck size={10} className="text-amber-400" /> Authorized Apostolic Seal
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'hebrew':
            return (
                <div className="w-full bg-gradient-to-tr from-brand-950 via-purple-950 to-indigo-950 text-white rounded-2xl p-4 relative overflow-hidden shadow-lg border border-purple-900">
                    <div className="absolute right-2 top-2 text-[48px] font-bold text-amber-500/10 pointer-events-none select-none font-serif leading-none">
                        א
                    </div>
                    <div className="flex items-center justify-between gap-4 relative z-10">
                        <div className="flex-1">
                            <span className="inline-block bg-purple-500/25 text-purple-300 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase mb-1 border border-purple-500/20">
                                Hebrew Heritage
                            </span>
                            <h4 className="text-sm font-serif font-black text-amber-300 tracking-wide uppercase">
                                {customName || 'Hebrew Sanctuary'}
                            </h4>
                            <p className="text-[10px] text-slate-300 font-medium mt-1 leading-relaxed">
                                {customDesc || 'Language and spiritual resources'}
                            </p>
                        </div>
                        <div className="shrink-0 bg-white/5 border border-white/10 rounded-xl p-2.5 text-center flex flex-col items-center justify-center">
                            <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">Alef-Bet</span>
                            <div className="flex gap-1.5 text-xs font-serif font-bold text-white mt-1">
                                <span>א</span>
                                <span>ב</span>
                                <span>ג</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'hebrewPages':
            return (
                <div className="w-full bg-slate-100 rounded-2xl p-4 shadow-inner border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="inline-block bg-fuchsia-100 text-fuchsia-700 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase mb-0.5">
                                Resources Grid
                            </span>
                            <h4 className="text-xs font-black text-brand-950 uppercase tracking-tight">
                                {customName || 'All Page Previews'}
                            </h4>
                            <p className="text-[9px] text-slate-500 truncate max-w-xs">
                                {customDesc || 'Hebrew content, tools, and page preview cards'}
                            </p>
                        </div>
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{HEBREW_PAGES.length} Quick Pages</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {HEBREW_PAGES.slice(0, 3).map((page, i) => (
                            <div key={page.id} className="bg-white border border-slate-200 hover:border-brand-300 rounded-xl p-2 shadow-sm flex flex-col items-center text-center cursor-pointer transition-all">
                                <div className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-1 shrink-0">
                                    {i === 0 ? <FileText size={12} /> : i === 1 ? <MapPin size={12} /> : <Award size={12} />}
                                </div>
                                <span className="text-[8px] font-black text-slate-800 tracking-tight leading-tight uppercase line-clamp-1">{page.label}</span>
                                <span className="text-[6px] text-slate-400 mt-0.5 font-bold uppercase">Explore</span>
                            </div>
                        ))}
                    </div>
                    {HEBREW_PAGES.length > 3 && (
                        <div className="mt-2 text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            + {HEBREW_PAGES.length - 3} More Pages
                        </div>
                    )}
                </div>
            );
        case 'pastorBaruch':
            return (
                <div className="w-full bg-white rounded-2xl p-4 shadow-md border border-slate-100">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="shrink-0 flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                PB
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                <Award size={14} className="text-amber-600" />
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <span className="inline-block bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase mb-1">
                                Ministry Anointing
                            </span>
                            <h4 className="text-xs font-black text-brand-950 uppercase tracking-tight">
                                {customName || 'Pastor & Baruch'}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                {customDesc || 'Pastor page and worship preview'}
                            </p>
                        </div>
                        <div className="shrink-0 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 flex items-center gap-2 w-full md:w-auto justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                            <div className="text-left">
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Audio Stream</p>
                                <p className="text-[8px] font-black text-slate-800 uppercase tracking-tight">Baruch Worship Live</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'valparai':
            return (
                <div className="w-full bg-gradient-to-br from-emerald-950 to-teal-900 text-white rounded-2xl p-4 relative overflow-hidden shadow-lg border border-emerald-900">
                    <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                        <div className="flex-1 text-center md:text-left">
                            <span className="inline-block bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase mb-1">
                                Regional Mission
                            </span>
                            <h4 className="text-sm font-serif font-black text-emerald-300 uppercase tracking-tight">
                                {customName || 'Valparai Presence'}
                            </h4>
                            <p className="text-[10px] text-emerald-100/70 font-semibold mt-1">
                                {customDesc || 'Local impact and community'}
                            </p>
                        </div>
                        <div className="shrink-0 bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2.5">
                            <div className="flex flex-col items-center">
                                <span className="text-[12px] font-bold text-emerald-400">100%</span>
                                <span className="text-[6px] font-bold text-slate-300 uppercase tracking-wider">Committed</span>
                            </div>
                            <div className="w-[1px] h-6 bg-white/10" />
                            <div className="flex items-center gap-1 bg-emerald-500/20 px-2 py-1 rounded-lg border border-emerald-500/30 text-[8px] font-bold text-emerald-300 uppercase tracking-wider">
                                <MapPin size={10} /> Local Map
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'testimonials':
            return (
                <div className="w-full bg-slate-50 rounded-2xl p-4 shadow-inner border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="inline-block bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase mb-0.5">
                                Faithful Hearts
                            </span>
                            <h4 className="text-xs font-black text-brand-950 uppercase tracking-tight">
                                {customName || 'Voices of Faith'}
                            </h4>
                            <p className="text-[9px] text-slate-500 truncate max-w-xs">
                                {customDesc || 'Member stories and testimonies'}
                            </p>
                        </div>
                        <span className="text-[7px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100 uppercase tracking-wider">
                            Interactive Bubbles
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {[
                            { init: 'AM', text: '“My walk with God has grown immensely through the Hebrew studies here.”', color: 'bg-teal-500' },
                            { init: 'SJ', text: '“The ID card system gives us such a unified sense of identity!”', color: 'bg-indigo-500' }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm flex items-start gap-2">
                                <div className={`w-6 h-6 rounded-full ${item.color} text-white flex items-center justify-center font-bold text-[8px] shrink-0 shadow`}>
                                    {item.init}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[8px] text-slate-600 font-bold leading-tight line-clamp-2">{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'members':
            return (
                <div className="w-full bg-slate-900 text-white rounded-2xl p-4 relative overflow-hidden shadow-lg border border-slate-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex-1 text-center md:text-left">
                            <span className="inline-block bg-orange-500/25 text-orange-300 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase mb-1">
                                Worshippers Directory
                            </span>
                            <h4 className="text-xs font-black text-orange-400 uppercase tracking-tight">
                                {customName || 'Member Initials'}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                {customDesc || 'Names with two-letter identity logos'}
                            </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl">
                            {['BH', 'SJ', 'SH', 'PM', 'ST'].map((init, i) => (
                                <div 
                                    key={init} 
                                    className={`w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-[7px] font-black shadow-md ${
                                        i === 0 ? 'bg-amber-600' : i === 1 ? 'bg-blue-600' : i === 2 ? 'bg-indigo-600' : i === 3 ? 'bg-emerald-600' : 'bg-rose-600'
                                    }`}
                                >
                                    {init}
                                </div>
                            ))}
                            <span className="text-[7px] font-black text-orange-400 ml-1">+140</span>
                        </div>
                    </div>
                </div>
            );
        case 'preview':
            return (
                <div className="w-full bg-slate-50 rounded-2xl p-4 shadow-inner border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="inline-block bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase mb-0.5">
                                Identity Center
                            </span>
                            <h4 className="text-xs font-black text-brand-950 uppercase tracking-tight">
                                {customName || 'Entrust Preview'}
                            </h4>
                            <p className="text-[9px] text-slate-500 truncate max-w-xs">
                                {customDesc || 'Quick overview of community card'}
                            </p>
                        </div>
                        <span className="text-[7px] font-black text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100 uppercase tracking-wider">
                            Entrust Premium Card
                        </span>
                    </div>
                    
                    <div className="max-w-sm mx-auto bg-gradient-to-br from-amber-600 via-amber-700 to-brand-955 text-white rounded-xl p-3 border border-amber-500/30 shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 bg-amber-400 text-brand-950 flex items-center justify-center font-bold text-[8px] rounded-lg">
                                    ✡
                                </div>
                                <div>
                                    <h5 className="text-[7px] font-black tracking-widest text-amber-200 uppercase leading-none">CITY OF TRUTH</h5>
                                    <span className="text-[5px] font-black tracking-widest text-white/50 uppercase leading-none">MINISTRIES</span>
                                </div>
                            </div>
                            <span className="text-[6px] font-black tracking-widest bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 border border-amber-500/30 uppercase">
                                ENTRUST
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                                <Users size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h6 className="text-[8px] font-black tracking-wide leading-none uppercase truncate">Steve Harrington</h6>
                                <p className="text-[5px] text-amber-200 font-bold uppercase tracking-wider mt-0.5">COT-ID-042</p>
                                <div className="flex gap-2 mt-1">
                                    <div>
                                        <p className="text-[4px] text-white/50 font-black uppercase">Role</p>
                                        <p className="text-[5px] font-black text-amber-300 uppercase leading-none">Acolyte</p>
                                    </div>
                                    <div>
                                        <p className="text-[4px] text-white/50 font-black uppercase">Expires</p>
                                        <p className="text-[5px] font-black text-amber-300 uppercase leading-none">11/2030</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-1 rounded border border-white/20 shrink-0 shadow flex flex-col items-center">
                                <QrCode size={16} className="text-brand-950" />
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'donations':
            return (
                <div className="w-full bg-white rounded-2xl p-4 shadow-md border border-slate-100">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex-1 text-center md:text-left">
                            <span className="inline-block bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase mb-1">
                                Stewardship
                            </span>
                            <h4 className="text-xs font-black text-brand-950 uppercase tracking-tight">
                                {customName || 'Donations'}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                {customDesc || 'Support boxes and giving section'}
                            </p>
                        </div>
                        <div className="shrink-0 flex gap-2 w-full md:w-auto">
                            {['Tithes', 'Missions'].map((box) => (
                                <div key={box} className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex-1 md:flex-none text-center shadow-sm min-w-[70px]">
                                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-wider block">{box}</span>
                                    <span className="text-[9px] font-black text-brand-600 block mt-0.5">SUPPORT</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        case 'verify':
            return (
                <div className="w-full bg-slate-950 text-white rounded-2xl p-4 relative overflow-hidden shadow-lg border border-slate-900">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex-1 text-center md:text-left">
                            <span className="inline-block bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase mb-1">
                                Secure Gateway
                            </span>
                            <h4 className="text-xs font-black text-emerald-300 uppercase tracking-tight">
                                {customName || 'Verify ID'}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                {customDesc || 'Security and verification portal'}
                            </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-xl">
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
                                <Check size={12} strokeWidth={3} />
                            </div>
                            <div className="text-left">
                                <p className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">Portal State</p>
                                <p className="text-[8px] font-black text-white uppercase tracking-tight">256-bit Secured</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        default:
            return (
                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm text-center">
                    <h4 className="text-xs font-black text-brand-950">{customName}</h4>
                    <p className="text-[9px] text-slate-400 mt-1">{customDesc}</p>
                </div>
            );
    }
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
    memberSince: new Date().toLocaleDateString('en-GB'),
    joinedDate: new Date().toISOString().split('T')[0],
};

type UserQuickViewMode = 'photos' | 'ids' | 'cards' | 'locations' | 'join-dates';
type IdCardVisualMode = 'cards' | 'photos' | 'ids' | 'locations' | 'join-dates';

const USER_QUICK_VIEW_OPTIONS: { id: UserQuickViewMode; label: string; description: string; icon: React.ElementType; accent: string; bg: string }[] = [
    { id: 'photos', label: 'Images', description: 'Show only member photos', icon: ImageIcon, accent: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'ids', label: 'COT IDs', description: 'Show only member IDs', icon: Shield, accent: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'cards', label: 'Entrust Cards', description: 'Show member entrust cards', icon: QrCode, accent: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'locations', label: 'Locations', description: 'Show member locations', icon: MapPin, accent: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'join-dates', label: 'Join Dates', description: 'Show all member join dates', icon: Calendar, accent: 'text-amber-600', bg: 'bg-amber-50' },
];

const HomeSectionItem: React.FC<{
    sectionId: string;
    idx: number;
    homeSectionsOrder: string[];
    homeSectionsHidden?: Record<string, boolean>;
    sectionsInfo: Record<string, { name: string; desc: string }>;
    onUpdateHomeSectionsOrder: (newOrder: string[]) => Promise<void>;
    onUpdateHomeSectionsHidden?: (nextHidden: Record<string, boolean>) => Promise<void>;
    handleSaveSectionInfo: (sectionId: string, name: string, desc: string) => void;
}> = ({
    sectionId,
    idx,
    homeSectionsOrder,
    homeSectionsHidden = {},
    sectionsInfo,
    onUpdateHomeSectionsOrder,
    onUpdateHomeSectionsHidden,
    handleSaveSectionInfo
}) => {
    const info = HOME_SECTIONS_INFO[sectionId] || { name: sectionId, desc: 'Home component', icon: Globe, color: 'bg-brand-500' };
    const Icon = info.icon;
    const displayIndex = (idx + 1).toString().padStart(2, '0');
    const isFirst = idx === 0;
    const isLast = idx === homeSectionsOrder.length - 1;
    const isHidden = !!homeSectionsHidden?.[sectionId];
    const [isHovered, setIsHovered] = useState(false);

    const moveUp = () => {
        if (isFirst) return;
        const next = [...homeSectionsOrder];
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        onUpdateHomeSectionsOrder(next);
    };
    const moveDown = () => {
        if (isLast) return;
        const next = [...homeSectionsOrder];
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
        onUpdateHomeSectionsOrder(next);
    };
    const toggleHidden = () => {
        if (!onUpdateHomeSectionsHidden) return;
        const next = { ...(homeSectionsHidden || {}) };
        next[sectionId] = !isHidden;
        onUpdateHomeSectionsHidden(next);
    };

    return (
        <Reorder.Item
            key={sectionId}
            value={sectionId}
            whileDrag={{ scale: 1.02, boxShadow: "0 10px 30px -5px rgba(0,0,0,0.2)" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
            className={`bg-white rounded-2xl border-2 transition-all cursor-grab active:cursor-grabbing select-none ${
                isHovered ? 'border-brand-500 shadow-lg' : 'border-slate-200 shadow-sm'
            }`}
        >
            {/* Compact Header */}
            <div className="flex items-center gap-3 p-3 md:p-4">
                <GripVertical size={20} className={`shrink-0 ${isHovered ? 'text-brand-500' : 'text-slate-300'}`} />
                <div className="text-brand-600 font-black text-sm w-8 text-center shrink-0">{displayIndex}</div>
                <div className={`w-10 h-10 md:w-12 md:h-12 ${info.color} rounded-xl flex items-center justify-center text-white shadow-md shrink-0`}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-brand-950 text-sm md:text-base leading-tight uppercase truncate">
                        {sectionsInfo[sectionId]?.name || info.name}
                    </h3>
                    <p className="text-slate-400 text-[10px] md:text-xs font-medium truncate mt-0.5">
                        {sectionsInfo[sectionId]?.desc || info.desc}
                    </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                    {onUpdateHomeSectionsHidden && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleHidden(); }}
                            className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center transition-all ${
                                isHidden ? 'bg-red-50 text-red-600 border-2 border-red-200' : 'bg-slate-100 text-slate-600 border-2 border-slate-200'
                            }`}
                        >
                            {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); moveUp(); }}
                        disabled={isFirst}
                        className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-slate-100 border-2 border-slate-200 flex items-center justify-center hover:bg-brand-500 hover:text-white hover:border-brand-500 disabled:opacity-25 transition-all"
                    >
                        <ChevronUp size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); moveDown(); }}
                        disabled={isLast}
                        className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-slate-100 border-2 border-slate-200 flex items-center justify-center hover:bg-brand-500 hover:text-white hover:border-brand-500 disabled:opacity-25 transition-all"
                    >
                        <ChevronDown size={16} />
                    </button>
                </div>
            </div>

            {/* Edit Inputs */}
            <div 
                className="px-3 md:px-4 pb-3 md:pb-4 space-y-2"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <input
                    type="text"
                    value={sectionsInfo[sectionId]?.name || ''}
                    onChange={(e) => handleSaveSectionInfo(sectionId, e.target.value, sectionsInfo[sectionId]?.desc || '')}
                    placeholder="Section title..."
                    className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-brand-500 focus:bg-white transition-colors"
                />
                <input
                    type="text"
                    value={sectionsInfo[sectionId]?.desc || ''}
                    onChange={(e) => handleSaveSectionInfo(sectionId, sectionsInfo[sectionId]?.name || '', e.target.value)}
                    placeholder="Section description..."
                    className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-brand-500 focus:bg-white transition-colors"
                />
            </div>

            {/* Mini Preview (only on hover/touch on mobile) */}
            {isHovered && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-3 md:px-4 pb-3 md:pb-4"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 md:p-3">
                        <SectionMiniPreview 
                            sectionId={sectionId}
                            customName={sectionsInfo[sectionId]?.name || info.name}
                            customDesc={sectionsInfo[sectionId]?.desc || info.desc}
                        />
                    </div>
                </motion.div>
            )}
        </Reorder.Item>
    );
};

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
    onUpdateMemberNotification,
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
    const [showGreetingCard, setShowGreetingCard] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [helpHighlightStep, setHelpHighlightStep] = useState<TourStep | null>(null);

    const adminTour = useTour('admin_dashboard');
    const adminTourSteps = [
        {
            target: '.admin-dashboard-title',
            title: 'Welcome Admin!',
            description: 'This dashboard gives you full control over the City of Truth database, content management, and configurations.',
            position: 'bottom' as const
        },
        {
            target: '#admin-tab-users',
            title: 'Manage Members & Users',
            description: 'Review registered congregation members, verify their documentation, update their roles, and approve new sign-ups.',
            position: 'right' as const
        },
        {
            target: '#admin-tab-id-cards',
            title: 'Entrust ID Cards & QR Codes',
            description: 'Generate, download, and batch-export custom Worshipper ID cards and check-in QR codes.',
            position: 'right' as const
        },
        {
            target: '#admin-tab-cot-id-manager',
            title: 'COT ID Allocator',
            description: 'Oversee and issue unique member IDs using our dice rolling algorithm.',
            position: 'right' as const
        },
        {
            target: '#admin-tab-widgets',
            title: 'Widgets Manager',
            description: 'Control the visibility, dimensions, and settings of the AI chat assistants on the live website.',
            position: 'right' as const
        }
    ];

    React.useEffect(() => {
        if (!sessionStorage.getItem('cot_admin_session_greeted')) {
            setShowGreetingCard(true);
        }
    }, []);
    const [filterStatus, setFilterStatus] = useState<UserStatus | 'All'>('All');
    const [filterRole, setFilterRole] = useState<UserRole | 'All'>('All');
    const [filterLocation, setFilterLocation] = useState<string>('All');
    const [userSortMode, setUserSortMode] = useState<'status' | 'cot-id' | 'joined-date'>('status');
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
    const [idCardVisualMode, setIdCardVisualMode] = useState<IdCardVisualMode>('cards');
    const [idCardSizeVariation, setIdCardSizeVariation] = useState<'standard' | 'large' | 'extralarge' | 'compact'>('standard');
    const [idCardsFilterYears, setIdCardsFilterYears] = useState<string[]>([]);
    const [idCardsFilterCategories, setIdCardsFilterCategories] = useState<UserStatus[]>([]);
    const [idCardsFilterLocations, setIdCardsFilterLocations] = useState<string[]>([]);
    const [showBulkDownloadModal, setShowBulkDownloadModal] = useState(false);
    const [bulkDownloadOptions, setBulkDownloadOptions] = useState<IdCardVisualMode[]>([]);
    const [bulkDownloadTheme, setBulkDownloadTheme] = useState<User['cardThemeTone'] | null>(null);
    const [applyingCardThemeTone, setApplyingCardThemeTone] = useState<User['cardThemeTone'] | null>(null);
    const [isBulkDownloading, setIsBulkDownloading] = useState(false);
    const [bulkDownloadFormat, setBulkDownloadFormat] = useState<'pdf' | 'zip'>('pdf');
    const [bulkDownloadGrouping, setBulkDownloadGrouping] = useState<'user-wise' | 'theme-wise' | 'location-wise' | 'status-wise' | 'memberSince-wise'>('user-wise');
    const [analyticsTimeFrame, setAnalyticsTimeFrame] = useState<'day' | 'month' | 'year'>('day');
    const [bulkDownloadType, setBulkDownloadType] = useState<'Interest Card' | 'Cart ID' | 'Location' | 'Join date' | 'ID Card' | 'All'>('ID Card');

    const [activeTab, setActiveTab] = useState<AdminTabId>('users');
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
    
    // Permalinks state
    const [permalinks, setPermalinks] = useState<Permalink[]>([]);
    
    // Premium gallery states
    const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'image' | 'video'>('all');
    const [mediaSortOrder, setMediaSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [mediaMonthFilter, setMediaMonthFilter] = useState<string>('all');

    // Tab renaming states
    const [tabLabels, setTabLabels] = useState<Record<string, string>>(() => {
        try {
            const saved = localStorage.getItem('cot_admin_tab_labels');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });
    const [renamingTabId, setRenamingTabId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');

    const [dynamicTabs, setDynamicTabs] = useState<AdminTabConfig[]>(DEFAULT_ADMIN_TABS);

    // AI Analytics states
    const [aiKeyDetails, setAiKeyDetails] = useState<any>(null);
    const [aiModelDetails, setAiModelDetails] = useState<any>(null);
    const [isLoadingAiDetails, setIsLoadingAiDetails] = useState(true);
    const [modelSearchQuery, setModelSearchQuery] = useState('');

    const filteredModels = useMemo(() => {
        const list = aiModelDetails?.allModels || [];
        if (!modelSearchQuery.trim()) return list;
        const q = modelSearchQuery.toLowerCase();
        return list.filter((m: any) => 
            (m.name || '').toLowerCase().includes(q) || 
            (m.id || '').toLowerCase().includes(q)
        );
    }, [aiModelDetails, modelSearchQuery]);

    const handleSelectModel = async (modelId: string) => {
        try {
            setSelectedOpenRouterModel(modelId);
            const models = await getOpenRouterModelDetails();
            setAiModelDetails(models);
            alert(`AI Model successfully changed to:\n${modelId}`);
        } catch (e) {
            console.error('Failed to change AI Model:', e);
            alert('Failed to change AI Model');
        }
    };

    useEffect(() => {
        if (activeTab === 'ai-analytics') {
            const fetchAiDetails = async () => {
                setIsLoadingAiDetails(true);
                try {
                    const [key, models] = await Promise.all([
                        getOpenRouterKeyDetails(),
                        getOpenRouterModelDetails()
                    ]);
                    setAiKeyDetails(key);
                    setAiModelDetails(models);
                } catch (e) {
                    console.error("Failed to load OpenRouter details", e);
                } finally {
                    setIsLoadingAiDetails(false);
                }
            };
            fetchAiDetails();
        }
    }, [activeTab]);

    // Complete Reboot state
    const [showCompleteRebootModal, setShowCompleteRebootModal] = useState(false);

    // Navigation Guide state
    const { isGuideActive, guideSteps, startGuide, stopGuide } = useNavigationGuide();
    const [showWelcomeGuide, setShowWelcomeGuide] = useState(() => {
        const hasSeenGuide = localStorage.getItem('admin_has_seen_guide');
        return !hasSeenGuide;
    });

    // Start onboarding guide for new admins
    useEffect(() => {
        if (showWelcomeGuide) {
            const timer = setTimeout(() => {
                startGuide(ADMIN_ONBOARDING_GUIDE);
                localStorage.setItem('admin_has_seen_guide', 'true');
                setShowWelcomeGuide(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [showWelcomeGuide]);

    // Widget Settings State
    const [widgetSettings, setWidgetSettings] = useState<WidgetSettingsConfig>(() => {
        try {
            const saved = localStorage.getItem('cot_widget_settings');
            const defaults = { shareVisible: true, shareSize: 1, aiVisible: true, aiSize: 1, aiLabelText: 'Ask Divine AI', aiAnimation: true };
            return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
        } catch {
            return { shareVisible: true, shareSize: 1, aiVisible: true, aiSize: 1, aiLabelText: 'Ask Divine AI', aiAnimation: true };
        }
    });

    const updateWidgetSettings = (updates: Partial<WidgetSettingsConfig>) => {
        setWidgetSettings(prev => {
            const next = { ...prev, ...updates };
            try {
                localStorage.setItem('cot_widget_settings', JSON.stringify(next));
                window.dispatchEvent(new Event('widget-settings-updated'));
            } catch (e) {}
            return next;
        });
    };

    React.useEffect(() => {
        api.getAdminTabsConfig().then(config => {
            setDynamicTabs(normalizeAdminTabs(config));
        });
    }, []);

    const visibleTabs = useMemo(() => {
        return normalizeAdminTabs(dynamicTabs).filter(t => !t.hidden).map(t => {
            const item = TAB_ITEMS.find(ti => ti.id === t.id);
            return {
                id: t.id,
                label: t.label,
                icon: item ? item.icon : Globe
            };
        });
    }, [dynamicTabs]);

    // Bulk pre-edit queue states
    const [bulkQueue, setBulkQueue] = useState<Array<{
        id: string;
        file: File;
        preview: string;
        name: string;
        date: string;
        category: string;
        mediaType: 'image' | 'video';
        duration: string;
        videoDurationSeconds: number;
        videoTrimStart: number;
        videoTrimEnd: number;
        cropZoom: number;
        cropX: number;
        cropY: number;
        hidden: boolean;
    }>>([]);
    const [isBulkUploading, setIsBulkUploading] = useState(false);
    const [bulkUploadProgress, setBulkUploadProgress] = useState(0);

    // Navigation Menu selection tab
    const [selectedMenuEditTab, setSelectedMenuEditTab] = useState<'main' | 'hebrew-content' | 'hebrew-tools'>('main');
    const [websiteUrl, setWebsiteUrl] = useState(() => typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'); // Add websiteUrl state at main level
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
    const [cotInventoryOpen, setCotInventoryOpen] = useState(false);
    const [cotInventoryQuery, setCotInventoryQuery] = useState('');
    const [cotInventoryAssignMode, setCotInventoryAssignMode] = useState<'manual' | 'random' | null>(null);
    const [cotInventoryManualInput, setCotInventoryManualInput] = useState('');
    const [cotInventorySelectedId, setCotInventorySelectedId] = useState('');
    const [cotInventorySequenceMode, setCotInventorySequenceMode] = useState<'available' | 'numeric' | 'random'>('available');
    const [cotInventoryCelebration, setCotInventoryCelebration] = useState<{ id: string; userName: string } | null>(null);
    const [cotIdSearchInput, setCotIdSearchInput] = useState('');
    const [cotIdSearchFeedback, setCotIdSearchFeedback] = useState<{ type: 'occupied' | 'available' | 'invalid'; message: string } | null>(null);
    const [diceRolling, setDiceRolling] = useState(false);
    const [diceUserQuery, setDiceUserQuery] = useState('');
    const [diceTargetUserId, setDiceTargetUserId] = useState('');
    const [dicePickedCotId, setDicePickedCotId] = useState('');
    const [diceManualInput, setDiceManualInput] = useState('');
    const [requestManualInputs, setRequestManualInputs] = useState<Record<string, string>>({});
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
    const [isAdminPasswordGateOpen, setIsAdminPasswordGateOpen] = useState(false);
    const [isAdminPasswordUnlocked, setIsAdminPasswordUnlocked] = useState(false);
    const [adminPasswordMessage, setAdminPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [memberFormPageUser, setMemberFormPageUser] = useState<any | null>(null);
    const [showMemberFormEditor, setShowMemberFormEditor] = useState(false);
    const [highlightedUserId, setHighlightedUserId] = useState<string | null>(null);

    const handleGoToUserInList = (user: User) => {
        // Clear filters to ensure the user shows up in the list
        setSearchQuery('');
        setFilterStatus('All');
        setFilterRole('All');
        setFilterLocation('All');
        
        // Highlight this user
        setHighlightedUserId(user.id);
        
        // Switch tab
        setActiveTab('users');
        
        // Close modal
        setViewingDetailsUser(null);
        
        // Clear highlight after a delay (e.g. 5 seconds)
        setTimeout(() => {
            setHighlightedUserId(null);
        }, 5000);
    };

    useEffect(() => {
        if (activeTab === 'users' && highlightedUserId) {
            const timer = setTimeout(() => {
                // Try scrolling desktop row
                const element = document.getElementById(`user-row-${highlightedUserId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    // Try scrolling mobile row
                    const mobileElement = document.getElementById(`user-row-mobile-${highlightedUserId}`);
                    if (mobileElement) {
                        mobileElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [activeTab, highlightedUserId]);
    const [memberFormPageParentId, setMemberFormPageParentId] = useState<string | null>(null);
    const [selectedDenominationCategory, setSelectedDenominationCategory] = useState<string>('Form Not Filled');
    const [broadcastSubject, setBroadcastSubject] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastType, setBroadcastType] = useState<'Email' | 'SMS' | 'Notification'>('Email');
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [broadcastLog, setBroadcastLog] = useState<{ id: string; target: string; count: number; date: string; subject: string; status: 'Sent' | 'Failed' }[]>([]);
    const [broadcastSuccessList, setBroadcastSuccessList] = useState<string[]>([]);
    const [broadcastImageUrl, setBroadcastImageUrl] = useState('');
    const [isUploadingBroadcastImage, setIsUploadingBroadcastImage] = useState(false);
    const [bulkAdminImageUrl, setBulkAdminImageUrl] = useState('');
    const [isUploadingBulkImage, setIsUploadingBulkImage] = useState(false);

    const handleNotificationImageUpload = async (file: File, type: 'bulk' | 'broadcast') => {
        if (type === 'bulk') setIsUploadingBulkImage(true);
        else setIsUploadingBroadcastImage(true);

        try {
            const url = await uploadMinistryFile(file);
            if (type === 'bulk') setBulkAdminImageUrl(url);
            else setBroadcastImageUrl(url);
        } catch (error) {
            console.error('Failed to upload image:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            if (type === 'bulk') setIsUploadingBulkImage(false);
            else setIsUploadingBroadcastImage(false);
        }
    };
    const [editingNotification, setEditingNotification] = useState<MemberNotification | null>(null);
    const [notificationSearch, setNotificationSearch] = useState('');
    const [notificationFilterType, setNotificationFilterType] = useState<'all' | 'admin' | 'user'>('all');
    const [notificationFilterKind, setNotificationFilterKind] = useState<string>('all');
    const [notificationFilterUser, setNotificationFilterUser] = useState('');

    const [dailyGreetingSettings, setDailyGreetingSettings] = useState({ enabled: true, imageUrl: '' });
    useEffect(() => {
        const fetchSettings = async () => {
            const settings = await api.getDailyGreetingSettings();
            setDailyGreetingSettings(settings);
        };
        fetchSettings();
    }, []);

    const handleDailyGreetingSettingsUpdate = async (updates: Partial<typeof dailyGreetingSettings>) => {
        const newSettings = { ...dailyGreetingSettings, ...updates };
        setDailyGreetingSettings(newSettings);
        await api.saveDailyGreetingSettings(newSettings);
    };
    
    const [hasAdminPasswordOverride, setHasAdminPasswordOverride] = useState(() => {
        try {
            return !!localStorage.getItem(ADMIN_PASSWORD_OVERRIDE_KEY);
        } catch {
            return false;
        }
    });

    const [sectionsInfo, setSectionsInfo] = useState<Record<string, { name: string; desc: string; hidden?: boolean }>>(() => {
        try {
            const saved = localStorage.getItem('cot_sections_info');
            if (saved) return JSON.parse(saved);
        } catch {}
        const initial: Record<string, { name: string; desc: string }> = {};
        Object.entries(HOME_SECTIONS_INFO).forEach(([key, value]) => {
            initial[key] = { name: value.name, desc: value.desc };
        });
        return initial;
    });

    const handleSaveSectionInfo = (sectionId: string, name: string, desc: string, hidden?: boolean) => {
        const currentInfo: { name: string; desc: string; hidden?: boolean } = sectionsInfo[sectionId] || { name: '', desc: '', hidden: false };
        const next = { 
            ...sectionsInfo, 
            [sectionId]: { 
                name, 
                desc,
                hidden: hidden !== undefined ? hidden : currentInfo.hidden
            } 
        };
        setSectionsInfo(next);
        try {
            localStorage.setItem('cot_sections_info', JSON.stringify(next));
        } catch {}
    };

    React.useEffect(() => {
        if (activeTab === 'messages') {
            api.getTestimonials().then(setTestimonials);
        } else if (activeTab === 'ministries') {
            api.getMinistries().then(setMinistries);
        } else if (activeTab === 'permalinks') {
            api.getPermalinks().then(setPermalinks);
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

    const detectDate = (file?: File | { name?: string; lastModified?: number }): string => {
        const filename = file?.name || '';
        const match = filename.match(/(\d{4})[-_]?(\d{2})[-_]?(\d{2})/);
        if (match) {
            return `${match[1]}-${match[2]}-${match[3]}`;
        }
        const compact = filename.match(/\b(\d{8})\b/);
        if (compact) {
            const value = compact[1];
            return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
        }
        if (file && typeof file !== 'string' && file.lastModified) {
            const fallback = new Date(file.lastModified);
            if (!Number.isNaN(fallback.getTime())) {
                return fallback.toISOString().split('T')[0];
            }
        }
        return new Date().toISOString().split('T')[0];
    };

    const formatDuration = (seconds: number) => {
        if (!Number.isFinite(seconds) || seconds <= 0) return '';
        const total = Math.round(seconds);
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const secs = total % 60;
        const pad = (value: number) => String(value).padStart(2, '0');
        return hours > 0 ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`;
    };

    const getVideoDuration = (file: File) =>
        new Promise<number>((resolve) => {
            const video = document.createElement('video');
            const objectUrl = URL.createObjectURL(file);
            const cleanup = () => {
                URL.revokeObjectURL(objectUrl);
            };
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                const duration = Number.isFinite(video.duration) ? video.duration : 0;
                cleanup();
                resolve(duration);
            };
            video.onerror = () => {
                cleanup();
                resolve(0);
            };
            if (!objectUrl.startsWith('blob:')) {
                cleanup();
                resolve(0);
                return;
            }
            video.src = objectUrl;
        });

    const inferMinistryMediaType = (value?: Partial<Ministry>): 'image' | 'video' => {
        if (value?.mediaType === 'video' || value?.mediaType === 'image') return value.mediaType;
        const src = `${value?.image || ''}`.trim().toLowerCase();
        if (src.startsWith('data:video/')) return 'video';
        if (/\.(mp4|mov|webm|ogg|m4v)(\?.*)?$/.test(src)) return 'video';
        return 'image';
    };

    const uploadMinistryFile = async (file: File | string, fileName?: string) => {
        if (typeof file === 'string' && !file.startsWith('data:') && !file.startsWith('blob:')) {
            return file;
        }

        let blob: Blob;
        let contentType = 'image/jpeg';
        let safeName = fileName || 'cropped-image.jpg';

        if (typeof file === 'string' && file.startsWith('data:')) {
            const parts = file.split(',');
            const byteString = atob(parts[1]);
            const mimeString = parts[0].split(':')[1].split(';')[0];
            contentType = mimeString;
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            blob = new Blob([ab], { type: mimeString });
            if (mimeString.startsWith('video/')) {
                safeName = 'video.mp4';
            }
        } else if (typeof file === 'string' && file.startsWith('blob:')) {
            const response = await fetch(file);
            blob = await response.blob();
            contentType = blob.type || 'image/jpeg';
            if (contentType.startsWith('video/')) {
                safeName = 'video.mp4';
            }
        } else if (file instanceof File) {
            blob = file;
            contentType = file.type || 'image/jpeg';
            safeName = file.name.replace(/\s+/g, '-');
        } else {
            throw new Error('Unsupported file type for upload');
        }

        const objectPath = `ministries/${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${safeName}`;
        const mediaRef = storageRef(storage, objectPath);
        await uploadBytes(mediaRef, blob, { contentType });
        return getDownloadURL(mediaRef);
    };

    const readFileAsDataUrl = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string) || '');
            reader.onerror = () => reject(new Error(`Failed reading ${file.name}`));
            reader.readAsDataURL(file);
        });

    const getFileBaseName = (name: string) => name.replace(/\.[^/.]+$/, '');

    const buildMinistryDraft = (file: File, overrides: Partial<Ministry> = {}) => ({
        ...overrides,
        date: overrides.date || editingMinistry?.date || detectDate(file),
        name: overrides.name || editingMinistry?.name || getFileBaseName(file.name),
        description: overrides.description ?? editingMinistry?.description ?? '',
        category: overrides.category ?? editingMinistry?.category ?? '',
        mediaType: overrides.mediaType ?? editingMinistry?.mediaType,
        hidden: overrides.hidden ?? editingMinistry?.hidden ?? false,
        duration: overrides.duration ?? editingMinistry?.duration ?? '',
        order: overrides.order ?? editingMinistry?.order
    });


    const handleSaveMinistry = async () => {
        if (!editingMinistry?.image) {
            alert("Image is required.");
            return;
        }
        setIsLoading(true);
        try {
            let finalImageUrl = editingMinistry.image;
            if (finalImageUrl.startsWith('data:') || finalImageUrl.startsWith('blob:')) {
                finalImageUrl = await uploadMinistryFile(
                    finalImageUrl, 
                    editingMinistry.name ? `${editingMinistry.name.replace(/\s+/g, '-')}` : undefined
                );
            }

            const ministryData = {
                ...editingMinistry,
                image: finalImageUrl,
                date: editingMinistry.date || new Date().toISOString().split('T')[0],
                name: editingMinistry.name || '',
                description: editingMinistry.description || '',
                mediaType: inferMinistryMediaType({ ...editingMinistry, image: finalImageUrl }),
                duration: editingMinistry.duration?.trim() || '',
                category: editingMinistry.category?.trim() || '',
                hidden: editingMinistry.hidden ?? false
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

    const handleRenameTab = (tabId: string, newLabel: string) => {
        if (!newLabel.trim()) return;
        const updated = { ...tabLabels, [tabId]: newLabel };
        setTabLabels(updated);
        localStorage.setItem('cot_admin_tab_labels', JSON.stringify(updated));
    };

    const handleToggleMinistryVisibility = async (m: Ministry) => {
        try {
            const updated = { ...m, hidden: !m.hidden };
            setMinistries(prev => prev.map(item => item.id === m.id ? updated : item));
            await api.updateMinistry(updated);
        } catch (error) {
            console.error('Failed to toggle visibility:', error);
            alert('Failed to update visibility in real-time. Please retry.');
            setMinistries(prev => prev.map(item => item.id === m.id ? m : item));
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

    // Permalink handlers
    const handleCreatePermalink = async (permalink: Omit<Permalink, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const newPermalink = await api.createPermalink(permalink);
            setPermalinks(prev => [newPermalink, ...prev]);
        } catch (error) {
            console.error('Failed to create permalink:', error);
            throw error;
        }
    };

    const handleUpdatePermalink = async (permalink: Permalink) => {
        try {
            const updated = await api.updatePermalink(permalink);
            setPermalinks(prev => prev.map(p => p.id === updated.id ? updated : p));
        } catch (error) {
            console.error('Failed to update permalink:', error);
            throw error;
        }
    };

    const handleDeletePermalink = async (permalinkId: string) => {
        try {
            await api.deletePermalink(permalinkId);
            setPermalinks(prev => prev.filter(p => p.id !== permalinkId));
        } catch (error) {
            console.error('Failed to delete permalink:', error);
            throw error;
        }
    };

    // Statistics
    const stats = useMemo(() => ({
        total: users.length,
        active: users.filter(u => u.status === 'Active').length,
        pending: users.filter(u => u.status === 'Pending Verification').length,
        rejected: users.filter(u => u.status === 'Rejected').length,
    }), [users]);

    const memberFormStats = useMemo(() => {
        const allProfiles: any[] = [];
        users.forEach(u => {
            allProfiles.push({ ...u, isSubProfile: false, parentUserId: u.id });
            if (u.linkedProfiles) {
                u.linkedProfiles.forEach(lp => {
                    allProfiles.push({ 
                        ...lp, 
                        isSubProfile: true, 
                        parentUserId: u.id, 
                        email: u.email,
                        phone: (lp as any).phone || u.phone 
                    });
                });
            }
        });

        // Deduplicate allProfiles by ID, preferring the main profile (isSubProfile: false)
        const uniqueProfilesMap = new Map<string, any>();
        allProfiles.forEach(p => {
            if (!p.isSubProfile) {
                uniqueProfilesMap.set(p.id, p);
            }
        });
        allProfiles.forEach(p => {
            if (p.isSubProfile && !uniqueProfilesMap.has(p.id)) {
                uniqueProfilesMap.set(p.id, p);
            }
        });
        const deduplicatedProfiles = Array.from(uniqueProfilesMap.values());

        const total = deduplicatedProfiles.length;
        const filledUsers = deduplicatedProfiles.filter(u => u.communityProfile && (u.communityProfile.denomination || u.communityProfile.churchName || u.communityProfile.role || u.communityProfile.bio));
        const filled = filledUsers.length;
        const missing = total - filled;
        const rate = total > 0 ? Math.round((filled / total) * 100) : 0;

        const STANDARD_DENOMINATIONS = [
            'Pentecostal',
            'Baptist',
            'Hebrew Roots',
            'Evangelical',
            'Catholic',
            'Non-denominational'
        ];

        const groupCounts: Record<string, any[]> = {
            'Form Not Filled': deduplicatedProfiles.filter(u => !u.communityProfile || !(u.communityProfile.denomination || u.communityProfile.churchName || u.communityProfile.role || u.communityProfile.bio))
        };

        STANDARD_DENOMINATIONS.forEach(denom => {
            groupCounts[denom] = [];
        });

        filledUsers.forEach(u => {
            const denom = u.communityProfile?.denomination?.trim() || '';
            if (!denom) {
                const unspecifiedKey = 'Unspecified Denomination';
                if (!groupCounts[unspecifiedKey]) groupCounts[unspecifiedKey] = [];
                groupCounts[unspecifiedKey].push(u);
            } else {
                const standardMatch = STANDARD_DENOMINATIONS.find(sd => sd.toLowerCase() === denom.toLowerCase());
                const key = standardMatch || denom;
                if (!groupCounts[key]) {
                    groupCounts[key] = [];
                }
                groupCounts[key].push(u);
            }
        });

        const groups = Object.entries(groupCounts)
            .map(([name, members]) => ({
                name,
                count: members.length,
                rate: total > 0 ? Math.round((members.length / total) * 100) : 0,
                members
            }))
            .sort((a, b) => {
                if (a.name === 'Form Not Filled') return -1;
                if (b.name === 'Form Not Filled') return 1;
                return b.count - a.count;
            });

        return {
            total,
            filled,
            missing,
            rate,
            groups
        };
    }, [users]);

    const locationStats = useMemo(() => {
        const counts = users.reduce((acc: Record<string, number>, user) => {
            const key = user.location?.trim() || 'Unknown';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(counts)
            .map(([location, count]) => ({ location, count }))
            .sort((a, b) => (b.count as number) - (a.count as number) || a.location.localeCompare(b.location));
    }, [users]);
    const userLocationOptions = useMemo(
        () => Array.from(new Set(users.map(user => (user.location || '').trim()).filter(Boolean))).sort((a, b) => (a as string).localeCompare(b as string)),
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
        if (Number.isNaN(parsed.getTime())) return value;
        
        // Format as DD-MM-YYYY
        const day = parsed.getDate().toString().padStart(2, '0');
        const month = (parsed.getMonth() + 1).toString().padStart(2, '0');
        const year = parsed.getFullYear();
        return `${day}-${month}-${year}`;
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

    // Extract just the 4-digit number from COT ID (e.g., "COT-2826" -> "2826")
    const extractCotNumber = (id: string): string => {
        const match = /^COT-(\d{4,})$/i.exec((id || '').trim());
        return match ? match[1] : id;
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
        const todayKey = new Date().toISOString().slice(0, 10);
        const classifyRequest = (message: string) => {
            const value = (message || '').toLowerCase();
            if (/not.*like|dislike|don'?t.*like|change/.test(value)) return 'Dislike Current ID';
            if (/new|different|another|reassign/.test(value)) return 'Need New ID';
            return 'General ID Help';
        };
        const enhanced = cotIdChangeRequests.map(request => ({
            ...request,
            category: classifyRequest(request.message || ''),
            isToday: (request.createdAt || '').slice(0, 10) === todayKey,
            isPendingUser: request.user?.status === 'Pending Verification'
        }));
        return {
            total: enhanced.length,
            today: enhanced.filter(item => item.isToday).length,
            todayNotPending: enhanced.filter(item => item.isToday && !item.isPendingUser).length,
            pendingUsers: enhanced.filter(item => item.isPendingUser).length,
            categories: {
                dislike: enhanced.filter(item => item.category === 'Dislike Current ID').length,
                newId: enhanced.filter(item => item.category === 'Need New ID').length,
                help: enhanced.filter(item => item.category === 'General ID Help').length
            },
            items: enhanced
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
    const toggleIdCardsYear = (year: string) => {
        setIdCardsFilterYears(prev => prev.includes(year) ? prev.filter(item => item !== year) : [...prev, year]);
    };
    const toggleIdCardsCategory = (status: UserStatus) => {
        setIdCardsFilterCategories(prev => prev.includes(status) ? prev.filter(item => item !== status) : [...prev, status]);
    };
    const toggleIdCardsLocation = (location: string) => {
        setIdCardsFilterLocations(prev => prev.includes(location) ? prev.filter(item => item !== location) : [...prev, location]);
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
        onSendMessageToUsers(targetIds, bulkAdminMessage, bulkAdminImageUrl.trim() || undefined);
        setBulkAdminMessage('');
        setBulkAdminImageUrl('');
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

    const handleDownloadCategoryReportPdf = (categoryName: string, categoryMembers: User[]) => {
        setIsLoading(true);
        try {
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 14;
            const contentWidth = pageWidth - margin * 2;
            
            // Header Banner
            pdf.setFillColor(26, 27, 75); // Dark sapphire blue
            pdf.rect(0, 0, pageWidth, 38, 'F');
            pdf.setFillColor(212, 165, 71); // Gold
            pdf.rect(0, 35, pageWidth, 3, 'F');
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(16);
            pdf.text('CITY OF TRUTH MINISTRIES', margin, 15);
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(212, 165, 71);
            pdf.text('MEMBER REGISTRATION & DIRECTORY REPORT', margin, 21);
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(8);
            pdf.text(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 28);
            
            // Analytics Info Box
            let y = 50;
            pdf.setFillColor(248, 250, 252);
            pdf.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');
            pdf.setDrawColor(226, 232, 240);
            pdf.roundedRect(margin, y, contentWidth, 24, 3, 3, 'D');
            
            pdf.setTextColor(71, 85, 105);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(9);
            pdf.text('REPORT SUMMARY', margin + 6, y + 6);
            
            pdf.setTextColor(15, 23, 42);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.text(`Category / Group:`, margin + 6, y + 13);
            pdf.setFont('helvetica', 'bold');
            pdf.text(categoryName, margin + 40, y + 13);
            
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Total Category Members:`, margin + 6, y + 19);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${categoryMembers.length} member(s)`, margin + 40, y + 19);
            
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Proportion of Ministry:`, margin + 95, y + 13);
            pdf.setFont('helvetica', 'bold');
            const pct = users.length > 0 ? Math.round((categoryMembers.length / users.length) * 100) : 0;
            pdf.text(`${pct}% (${categoryMembers.length} out of ${users.length} total members)`, margin + 135, y + 13);
            
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Status:`, margin + 95, y + 19);
            pdf.setFont('helvetica', 'bold');
            pdf.text(categoryName === 'Form Not Filled' ? 'Form Pending' : 'Forms Completed', margin + 135, y + 19);
            
            y += 32;
            
            // Table Header
            const headers = ['S.No', 'Member ID', 'Full Name', 'Location', 'Phone', 'Role'];
            const colWidths = [12, 28, 48, 36, 36, 22]; // Sums to 182
            
            const drawTableHeader = (startY: number) => {
                pdf.setFillColor(26, 27, 75);
                pdf.rect(margin, startY, contentWidth, 8, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(8);
                
                let curX = margin + 2;
                headers.forEach((h, idx) => {
                    pdf.text(h, curX, startY + 5.5);
                    curX += colWidths[idx];
                });
            };
            
            drawTableHeader(y);
            y += 8;
            
            // Table Rows
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8.5);
            
            categoryMembers.forEach((m, idx) => {
                // Check page height limit
                if (y + 9 > pageHeight - 20) {
                    // Draw Footer
                    pdf.setFont('helvetica', 'italic');
                    pdf.setFontSize(7);
                    pdf.setTextColor(148, 163, 184);
                    pdf.text('City of Truth Ministries - Confidential Administrative Report', margin, pageHeight - 10);
                    pdf.text(`Page ${pdf.internal.pages.length - 1}`, pageWidth - margin - 10, pageHeight - 10);
                    
                    pdf.addPage();
                    y = 20;
                    drawTableHeader(y);
                    y += 8;
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(8.5);
                }
                
                // Zebra stripes
                if (idx % 2 === 0) {
                    pdf.setFillColor(248, 250, 252);
                    pdf.rect(margin, y, contentWidth, 8, 'F');
                } else {
                    pdf.setFillColor(255, 255, 255);
                    pdf.rect(margin, y, contentWidth, 8, 'F');
                }
                
                pdf.setDrawColor(241, 245, 249);
                pdf.line(margin, y + 8, margin + contentWidth, y + 8);
                
                pdf.setTextColor(15, 23, 42);
                let curX = margin + 2;
                
                // Col 1: S.No
                pdf.text(`${idx + 1}`, curX, y + 5.5);
                curX += colWidths[0];
                
                // Col 2: Member ID
                pdf.setFont('courier', 'bold');
                pdf.setFontSize(8);
                pdf.text(m.id || 'N/A', curX, y + 5.5);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(8.5);
                curX += colWidths[1];
                
                // Col 3: Full Name
                pdf.setFont('helvetica', 'bold');
                pdf.text(m.name || 'N/A', curX, y + 5.5);
                pdf.setFont('helvetica', 'normal');
                curX += colWidths[2];
                
                // Col 4: Location
                pdf.text(m.location || 'N/A', curX, y + 5.5);
                curX += colWidths[3];
                
                // Col 5: Phone
                pdf.text(m.phone || 'N/A', curX, y + 5.5);
                curX += colWidths[4];
                
                // Col 6: Role
                pdf.text(m.role || 'Member', curX, y + 5.5);
                
                y += 8;
            });
            
            // Draw last page footer
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(7);
            pdf.setTextColor(148, 163, 184);
            pdf.text('City of Truth Ministries - Confidential Administrative Report', margin, pageHeight - 10);
            pdf.text(`Page ${pdf.internal.pages.length - 1}`, pageWidth - margin - 10, pageHeight - 10);
            
            // Signature Block
            if (y + 25 > pageHeight - 20) {
                pdf.addPage();
                y = 30;
            } else {
                y += 10;
            }
            
            pdf.setDrawColor(212, 165, 71);
            pdf.line(margin, y, margin + 50, y);
            pdf.line(pageWidth - margin - 50, y, pageWidth - margin, y);
            
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(7.5);
            pdf.setTextColor(71, 85, 105);
            pdf.text('PREPARED BY (ADMINISTRATOR)', margin, y + 4.5);
            pdf.text('APPROVED BY (PASTOR / BOARD)', pageWidth - margin - 50, y + 4.5);
            
            pdf.setFont('helvetica', 'normal');
            pdf.text('City of Truth Records Dept.', margin, y + 8.5);
            pdf.text('City of Truth Ministries', pageWidth - margin - 50, y + 8.5);
            
            pdf.save(`Ministry_Report_${categoryName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
        } catch (error) {
            console.error('Failed to generate report PDF:', error);
            alert('An error occurred while generating the PDF report. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBroadcastSubmit = async (e: React.FormEvent, categoryName: string, categoryMembers: User[]) => {
        e.preventDefault();
        if (!broadcastSubject.trim()) {
            alert('Please enter a message subject.');
            return;
        }
        if (!broadcastMessage.trim()) {
            alert('Please enter your message.');
            return;
        }
        if (categoryMembers.length === 0) {
            alert('No members in this category to broadcast to.');
            return;
        }

        setIsBroadcasting(true);
        setBroadcastSuccessList([]);

        try {
            for (let i = 0; i < categoryMembers.length; i++) {
                const member = categoryMembers[i];
                await new Promise(resolve => setTimeout(resolve, Math.max(100, Math.min(600, 3000 / categoryMembers.length))));
                
                if (broadcastType === 'SMS') {
                    if (member.phone) {
                        const res = await sendSMS(member.phone, `COT Broadcast - ${broadcastSubject}: ${broadcastMessage}`);
                        if (!res.success) {
                            console.error(`Failed to send SMS to ${member.name}: ${res.error}`);
                        }
                    }
                } else if (broadcastType === 'Notification') {
                    if (onSendMessageToUsers) {
                        onSendMessageToUsers([member.id], `${broadcastSubject}: ${broadcastMessage}`, broadcastImageUrl.trim() || undefined);
                    }
                    if (member.fcmTokens && member.fcmTokens.length > 0) {
                        const res = await sendFCMNotification(member.fcmTokens, broadcastSubject, broadcastMessage, broadcastImageUrl.trim() || undefined);
                        if (!res.success) {
                            console.error(`Failed to send FCM push to ${member.name}: ${res.error}`);
                        }
                    }
                }

                setBroadcastSuccessList(prev => [...prev, member.name]);
            }

            const logEntry = {
                id: `BCAST-${Math.floor(1000 + Math.random() * 9000)}`,
                target: categoryName,
                count: categoryMembers.length,
                date: new Date().toLocaleString(),
                subject: broadcastSubject,
                status: 'Sent' as const
            };

            setBroadcastLog(prev => [logEntry, ...prev]);
            alert(`Successfully broadcasted message to all ${categoryMembers.length} member(s) in category: "${categoryName}"!`);
            
            setBroadcastSubject('');
            setBroadcastMessage('');
            setBroadcastImageUrl('');
        } catch (error) {
            console.error('Failed to send broadcast:', error);
            alert('Failed to send broadcast.');
        } finally {
            setIsBroadcasting(false);
        }
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

            let matchesStatus = filterStatus === 'All' || user.status === filterStatus;
            let matchesLocation = filterLocation === 'All' || (user.location || '').trim() === filterLocation;
            let matchesRole = filterRole === 'All' || user.role === filterRole;

            if (activeTab === 'id-cards') {
                const joinedYear = `${user.joinedDate || ''}`.slice(0, 4);
                const memberSinceYear = `${user.memberSince || ''}`.trim();
                const matchesYearCard = idCardsFilterYears.length === 0 || idCardsFilterYears.includes(joinedYear) || idCardsFilterYears.includes(memberSinceYear);
                const matchesCatCard = idCardsFilterCategories.length === 0 || idCardsFilterCategories.includes(user.status);
                const matchesLocCard = idCardsFilterLocations.length === 0 || idCardsFilterLocations.includes((user.location || '').trim());
                return matchesSearch && matchesYearCard && matchesCatCard && matchesLocCard && matchesRole;
            }

            return matchesSearch && matchesStatus && matchesRole && matchesLocation;
        });

        if (userSortMode === 'cot-id') {
            return filtered.sort((a, b) => (a.id || '').localeCompare((b.id || ''), undefined, { numeric: true, sensitivity: 'base' }));
        }
        if (userSortMode === 'joined-date') {
            return filtered.sort((a, b) => {
                const aDate = new Date(a.joinedDate || a.memberSince || '').getTime();
                const bDate = new Date(b.joinedDate || b.memberSince || '').getTime();
                const safeA = Number.isNaN(aDate) ? 0 : aDate;
                const safeB = Number.isNaN(bDate) ? 0 : bDate;
                return safeB - safeA;
            });
        }

        return filtered.sort((a, b) => {
            const statusOrder = { 'Pending Verification': 0, 'Active': 1, 'Rejected': 2 };
            return statusOrder[a.status] - statusOrder[b.status];
        });
    }, [users, searchQuery, filterStatus, filterRole, filterLocation, userSortMode, activeTab, idCardsFilterYears, idCardsFilterCategories, idCardsFilterLocations]);

    const handleApplyBulkCardTheme = async (tone: NonNullable<User['cardThemeTone']>) => {
        if (filteredUsers.length === 0) {
            alert('No ID cards match the current filters.');
            return;
        }

        setApplyingCardThemeTone(tone);
        try {
            await Promise.all(filteredUsers.map(user => onUpdateUser({ ...user, cardThemeTone: tone })));
        } catch (error) {
            console.error('Failed to apply bulk card theme:', error);
            alert('Failed to apply the theme to all filtered cards. Please try again.');
        } finally {
            setApplyingCardThemeTone(null);
        }
    };

    const handleBulkDownload = async () => {
        if (filteredUsers.length === 0) {
            alert('No cards found to download.');
            return;
        }

        setIsBulkDownloading(true);
        try {
            if (bulkDownloadFormat === 'pdf') {
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                let isFirstPage = true;
                for (let i = 0; i < filteredUsers.length; i++) {
                    const user = filteredUsers[i];
                    // Just download the front card as an image representing ID Card / Interest Card / Location
                    const el = document.getElementById(`admin-card-container-${user.id}`);
                    if (!el) continue;

                    const dataUrl = await toPng(el, { quality: 0.95, pixelRatio: 2 });

                    if (!isFirstPage) {
                        pdf.addPage();
                    }

                    // Center the card on the page
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    // Typical card aspect ratio
                    const cardWidth = 85.6; // standard CR80 width in mm
                    const cardHeight = 54;
                    const x = (pdfWidth - cardWidth) / 2;
                    const y = (pdfHeight - cardHeight) / 2;

                    pdf.addImage(dataUrl, 'PNG', x, y, cardWidth, cardHeight);
                    isFirstPage = false;
                }

                pdf.save(`Bulk_${bulkDownloadType}_Cards.pdf`);
            } else if (bulkDownloadFormat === 'zip') {
                const zip = new JSZip();

                for (let i = 0; i < filteredUsers.length; i++) {
                    const user = filteredUsers[i];
                    const el = document.getElementById(`admin-card-container-${user.id}`);
                    if (!el) continue;

                    const dataUrl = await toPng(el, { quality: 0.95, pixelRatio: 2 });
                    const base64Data = dataUrl.replace(/^data:image\/(png|jpg);base64,/, "");
                    zip.file(`${user.id}_${bulkDownloadType}.png`, base64Data, { base64: true });
                }

                const blob = await zip.generateAsync({ type: 'blob' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Bulk_${bulkDownloadType}_Cards.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Bulk download error:', error);
            alert('An error occurred during bulk download.');
        } finally {
            setIsBulkDownloading(false);
        }
    };

    const cotManagerUsers = useMemo(() => {
        const query = cotManagerQuery.trim().toLowerCase();
        const ordered = [...users].sort((a, b) => a.name.localeCompare(b.name));
        const filtered = !query ? ordered : ordered.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.id.toLowerCase().includes(query) ||
            (user.phone || '').toLowerCase().includes(query)
        );
        if (!cotManagerSelectedUserId) return filtered;
        return filtered.filter(user => user.id === cotManagerSelectedUserId);
    }, [users, cotManagerQuery, cotManagerSelectedUserId]);

    const cotManagerAssignableUsers = useMemo(() => cotManagerUsers, [cotManagerUsers]);
    const takenUserIds = useMemo(
        () => new Set(users.map(item => `${item.id || ''}`.trim().toUpperCase())),
        [users]
    );
    const randomDiceUsers = useMemo(() => {
        const query = diceUserQuery.trim().toLowerCase();
        if (!query) return cotManagerAssignableUsers;
        return cotManagerAssignableUsers.filter((user) => {
            const haystack = `${user.name} ${user.id} ${user.phone || ''} ${user.email || ''} ${user.location || ''}`.toLowerCase();
            return haystack.includes(query);
        });
    }, [cotManagerAssignableUsers, diceUserQuery]);

    const cotInventoryUsers = useMemo(() => {
        const query = cotInventoryQuery.trim().toLowerCase();
        const ordered = [...users].sort((a, b) => (a.id || '').localeCompare((b.id || ''), undefined, { numeric: true, sensitivity: 'base' }));
        if (!query) return ordered;
        return ordered.filter((user) => {
            const haystack = `${user.name || ''} ${user.id || ''} ${user.phone || ''} ${user.email || ''} ${user.location || ''} ${user.status || ''} ${user.role || ''}`.toLowerCase();
            return haystack.includes(query);
        });
    }, [users, cotInventoryQuery]);

    const cotInventorySelectedUser = useMemo(
        () => users.find(user => user.id === cotManagerSelectedUserId) || null,
        [users, cotManagerSelectedUserId]
    );

    const cotInventoryDisplayIds = useMemo(() => {
        const numericIds = Array.from({ length: cotIdInventoryUpperBound }, (_, index) => formatCotId(index + 1));
        const source = cotInventorySequenceMode === 'available'
            ? allAvailableCotIds
            : numericIds;

        if (cotInventorySequenceMode !== 'random') return source;

        const shuffled = [...source];
        for (let i = shuffled.length - 1; i > 0; i -= 1) {
            const rand = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[rand]] = [shuffled[rand], shuffled[i]];
        }
        return shuffled;
    }, [allAvailableCotIds, cotIdInventoryUpperBound, cotInventorySequenceMode]);

    const triggerCotInventoryCelebration = (id: string, userName: string) => {
        setCotInventoryCelebration({ id, userName });
        window.setTimeout(() => setCotInventoryCelebration(null), 2100);
    };

    const applyInventoryCotId = async (rawId: string) => {
        if (!cotInventorySelectedUser) {
            alert('Select a member first.');
            return;
        }
        if (!onReassignUserId) {
            alert('ID reassignment is not available in this environment.');
            return;
        }
        const nextId = normalizeCotIdInput(rawId);
        if (!isCotId(nextId)) {
            alert('Please choose or type a valid COT ID like COT-1960.');
            return;
        }
        const currentId = (cotInventorySelectedUser.id || '').toUpperCase();
        if (nextId !== currentId && existingCotIds.has(nextId)) {
            alert(`${nextId} is already used. Choose another COT ID.`);
            return;
        }
        if (nextId === currentId) return;

        await onReassignUserId(cotInventorySelectedUser.id, nextId, { ...cotInventorySelectedUser, id: nextId });
        setCotInventoryManualInput(nextId);
        setCotInventorySelectedId(nextId);
        setCotIdSearchInput(nextId);
        setCotIdSearchFeedback({ type: 'occupied', message: `${nextId} has been selected for ${cotInventorySelectedUser.name}.` });
        triggerCotInventoryCelebration(nextId, cotInventorySelectedUser.name);
    };

    const rollInventoryCotId = () => {
        const next = getRandomAvailableCotId();
        if (!next) {
            alert('No available COT IDs found.');
            return;
        }
        setDiceRolling(true);
        setDicePickedCotId('');
        window.setTimeout(() => {
            setDicePickedCotId(next);
            setCotInventorySelectedId(next);
            setCotInventoryManualInput(next);
            setDiceRolling(false);
        }, 950);
    };

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

    const handleSaveAdminPassword = () => {
        const nextPassword = adminPasswordDraft.trim();
        if (!isAdminPasswordUnlocked) {
            setAdminPasswordMessage({ type: 'error', text: 'Enter the secret first to unlock password change.' });
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
            setIsAdminPasswordGateOpen(false);
            setIsAdminPasswordUnlocked(false);
            setAdminPasswordMessage({ type: 'success', text: 'Admin dashboard password updated successfully.' });
        } catch {
            setAdminPasswordMessage({ type: 'error', text: 'Unable to save password in this browser/session.' });
        }
    };

    const handleUnlockAdminPasswordChange = () => {
        if (!ADMIN_PASSWORD_CHANGE_PHRASE) {
            setAdminPasswordMessage({ type: 'error', text: 'Admin password change is not configured.' });
            return;
        }

        if (adminPasswordPhrase.trim().toLowerCase() !== ADMIN_PASSWORD_CHANGE_PHRASE.toLowerCase()) {
            setIsAdminPasswordUnlocked(false);
            setAdminPasswordMessage({ type: 'error', text: 'Secret is incorrect.' });
            return;
        }
        setIsAdminPasswordUnlocked(true);
        setAdminPasswordPhrase('');
        setAdminPasswordMessage({ type: 'success', text: 'Password change unlocked. Enter the new password.' });
    };

    const handleResetAdminPassword = () => {
        try {
            localStorage.removeItem(ADMIN_PASSWORD_OVERRIDE_KEY);
            setHasAdminPasswordOverride(false);
            setAdminPasswordDraft('');
            setAdminPasswordConfirm('');
            setAdminPasswordPhrase('');
            setIsAdminPasswordGateOpen(false);
            setIsAdminPasswordUnlocked(false);
            setAdminPasswordMessage({ type: 'success', text: 'Custom admin password removed. Default password is active.' });
        } catch {
            setAdminPasswordMessage({ type: 'error', text: 'Unable to reset password in this browser/session.' });
        }
    };

    const handleRejectMemberForm = async () => {
        if (!memberFormPageUser) return;
        setIsLoading(true);
        try {
            const parent = users.find(u => u.id === memberFormPageUser.parentUserId);
            if (!parent) throw new Error('Parent user not found');

            let updatedParent = { ...parent };
            if (memberFormPageUser.isSubProfile) {
                updatedParent.linkedProfiles = (updatedParent.linkedProfiles || []).map(p => 
                    p.id === memberFormPageUser.id ? { ...p, communityProfile: { ...p.communityProfile, status: 'Rejected' as any } } : p
                );
            } else {
                updatedParent.communityProfile = { ...updatedParent.communityProfile, status: 'Rejected' as any };
            }
            await onUpdateUser(updatedParent);
            setMemberFormPageUser({ ...memberFormPageUser, communityProfile: { ...memberFormPageUser.communityProfile, status: 'Rejected' } });
            alert('Member Form rejected. The user will be notified to refill it.');
        } catch (err) {
            console.error(err);
            alert('Failed to reject member form.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        let cleanedPhone = editingUser.phone.replace(/\D/g, '');
        if (cleanedPhone.length === 12 && cleanedPhone.startsWith('91')) {
            cleanedPhone = cleanedPhone.slice(2);
        }
        if (cleanedPhone.length !== 10) {
            alert('Phone number must be exactly 10 digits.');
            return;
        }
        setIsLoading(true);
        try {
            const updatedUser = { 
                ...editingUser, 
                phone: `+91${cleanedPhone}`, 
                emergency: `+91${cleanedPhone}` 
            };
            await onUpdateUser(updatedUser);
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
        let cleanedPhone = newUserData.phone.replace(/\D/g, '');
        if (cleanedPhone.length === 12 && cleanedPhone.startsWith('91')) {
            cleanedPhone = cleanedPhone.slice(2);
        }
        if (cleanedPhone.length !== 10) {
            alert('Phone number must be exactly 10 digits.');
            return;
        }
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
                phone: `+91${cleanedPhone}`,
                email: newUserData.email.trim(),
                location: newUserData.location,
                emergency: `+91${cleanedPhone}`,
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

    const renderAdminPasswordChangePanel = (variant: 'admin-pages' | 'firebase') => {
        const isFirebase = variant === 'firebase';
        return (
            <div className={isFirebase ? 'bg-white rounded-3xl border border-slate-100 shadow-sm p-6' : 'mt-8 p-5 md:p-6 rounded-3xl border border-amber-100 bg-amber-50/60'}>
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-brand-700">Admin Dashboard Password</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Click Change Password, enter the secret, then set the new admin password.
                        </p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-wider ${hasAdminPasswordOverride ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-white text-amber-700 border border-amber-100'}`}>
                        {hasAdminPasswordOverride ? 'Custom Active' : 'Default Active'}
                    </span>
                </div>

                {!isAdminPasswordGateOpen && !isAdminPasswordUnlocked && (
                    <button
                        type="button"
                        onClick={() => {
                            setIsAdminPasswordGateOpen(true);
                            setAdminPasswordMessage(null);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black uppercase tracking-wider"
                    >
                        <Lock size={14} />
                        Change Password
                    </button>
                )}

                {isAdminPasswordGateOpen && !isAdminPasswordUnlocked && (
                    <div className="space-y-3">
                        <div className="relative">
                            <input
                                type={showAdminPasswordPhrase ? 'text' : 'password'}
                                placeholder="Enter secret"
                                value={adminPasswordPhrase}
                                onChange={(e) => {
                                    setAdminPasswordPhrase(e.target.value);
                                    setAdminPasswordMessage(null);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleUnlockAdminPasswordChange();
                                }}
                                className="w-full px-3 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-brand-500"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowAdminPasswordPhrase(prev => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                                title={showAdminPasswordPhrase ? 'Hide secret' : 'Show secret'}
                                aria-label={showAdminPasswordPhrase ? 'Hide secret' : 'Show secret'}
                            >
                                {showAdminPasswordPhrase ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={handleUnlockAdminPasswordChange}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black uppercase tracking-wider"
                            >
                                <ShieldCheck size={14} />
                                Unlock
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAdminPasswordGateOpen(false);
                                    setAdminPasswordPhrase('');
                                    setAdminPasswordMessage(null);
                                }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {isAdminPasswordUnlocked && (
                    <div className="space-y-3">
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
                                    className="w-full px-3 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-brand-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowAdminPasswordDraft(prev => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                                    title={showAdminPasswordDraft ? 'Hide password' : 'Show password'}
                                    aria-label={showAdminPasswordDraft ? 'Hide password' : 'Show password'}
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
                                    className="w-full px-3 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-brand-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowAdminPasswordConfirm(prev => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                                    title={showAdminPasswordConfirm ? 'Hide password' : 'Show password'}
                                    aria-label={showAdminPasswordConfirm ? 'Hide password' : 'Show password'}
                                >
                                    {showAdminPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={handleSaveAdminPassword}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black uppercase tracking-wider"
                            >
                                <Save size={14} />
                                Save Password
                            </button>
                            <button
                                type="button"
                                onClick={handleResetAdminPassword}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider"
                            >
                                <RotateCcw size={14} />
                                Reset Default
                            </button>
                        </div>
                    </div>
                )}

                {adminPasswordMessage && (
                    <p className={`mt-3 text-xs font-bold ${adminPasswordMessage.type === 'success' ? 'text-emerald-700' : 'text-red-600'}`}>
                        {adminPasswordMessage.text}
                    </p>
                )}
            </div>
        );
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
    const createDisapprovedUserPayload = (user: User, nextId?: string): User => ({
        ...user,
        id: nextId ?? user.id,
        status: 'Rejected',
        pendingProfileUpdate: {},
        photo: '',
        linkedProfiles: [],
        verificationDoc: undefined,
        communityProfile: undefined
    });
    const generateTemporaryUserId = (takenIds: Set<string>) => {
        const stamp = Date.now().toString(36).toUpperCase();
        let suffix = 1;
        let candidate = `TEMP-${stamp}-${suffix}`;
        while (takenIds.has(candidate)) {
            suffix += 1;
            candidate = `TEMP-${stamp}-${suffix}`;
        }
        return candidate;
    };
    const disapproveUser = async (user: User) => {
        await runUserAction(async () => {
            if (isCotId(user.id) && onReassignUserId) {
                const temporaryId = generateTemporaryUserId(takenUserIds);
                await onReassignUserId(user.id, temporaryId, createDisapprovedUserPayload(user, temporaryId));
                return;
            }
            await onUpdateUser(createDisapprovedUserPayload(user));
        }, 'Failed to disapprove user');
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

    const handleGenerateBulkPdf = async () => {
        // Apply temporary theme context to users before download if selected
        const effectiveUsersToDownload = bulkDownloadTheme ? filteredUsers.filter(u => selectedUsers.has(u.id) && u.status === 'Active').map(u => ({...u, cardThemeTone: bulkDownloadTheme})) : filteredUsers.filter(u => selectedUsers.has(u.id) && u.status === 'Active');

        if (selectedUsers.size === 0 || bulkDownloadOptions.length === 0) return;

        if (effectiveUsersToDownload.length === 0) {
            alert('No active users selected for download.');
            return;
        }

        setIsLoading(true);
        setShowBulkDownloadModal(false);

        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.top = '-9999px';
            container.style.left = '-9999px';
            document.body.appendChild(container);

            let isFirstPage = true;

            for (const mode of bulkDownloadOptions) {
                const groupedUsers: Record<string, typeof effectiveUsersToDownload> = {};
                effectiveUsersToDownload.forEach(user => {
                    const category = user.status;
                    if (!groupedUsers[category]) groupedUsers[category] = [];
                    groupedUsers[category].push(user);
                });

                for (const [category, users] of Object.entries(groupedUsers)) {
                    if (!isFirstPage) pdf.addPage();
                    isFirstPage = false;

                    pdf.setFillColor(15, 23, 42);
                    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

                    pdf.setTextColor(255, 255, 255);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(24);
                    const titleText = `${mode.toUpperCase()} - ${category.toUpperCase()}`;
                    const textWidth = pdf.getStringUnitWidth(titleText) * pdf.getFontSize() / pdf.internal.scaleFactor;
                    pdf.text(titleText, (pdfWidth - textWidth) / 2, pdfHeight / 2);

                    let xOffset = 10;
                    let yOffset = 10;
                    const cardWidth = 85;
                    const cardHeight = 135;

                    pdf.addPage();
                    pdf.setFillColor(248, 250, 252);
                    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

                    for (const user of users) {
                        if (mode === 'cards') {
                           const frontNode = document.getElementById(`admin-card-front-${user.id}`) || document.getElementById(`quick-card-${user.id}`);
                           const backNode = document.getElementById(`admin-card-back-${user.id}`) || document.getElementById(`quick-card-back-${user.id}`);
                           if (frontNode && backNode) {
                               const frontDataUrl = await toPng(frontNode, { pixelRatio: 2, quality: 0.9, backgroundColor: '#ffffff' });
                               const backDataUrl = await toPng(backNode, { pixelRatio: 2, quality: 0.9, backgroundColor: '#ffffff' });

                               if (yOffset + cardHeight > pdfHeight - 10) {
                                   pdf.addPage();
                                   pdf.setFillColor(248, 250, 252);
                                   pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
                                   xOffset = 10;
                                   yOffset = 10;
                               }

                               pdf.addImage(frontDataUrl, 'PNG', xOffset, yOffset, cardWidth, cardHeight, undefined, 'FAST');
                               xOffset += cardWidth + 10;

                               if (xOffset + cardWidth > pdfWidth - 10) {
                                   xOffset = 10;
                                   yOffset += cardHeight + 10;
                               }
                           }
                        } else {
                           if (yOffset + cardHeight > pdfHeight - 10) {
                               pdf.addPage();
                               pdf.setFillColor(248, 250, 252);
                               pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
                               xOffset = 10;
                               yOffset = 10;
                           }

                           const isThemeApplied = bulkDownloadTheme !== null;
                           const themeColors = {
                               gold: { bg: [31, 19, 5], border: [251, 191, 36], text: [255, 255, 255] },
                               silver: { bg: [15, 23, 42], border: [148, 163, 184], text: [255, 255, 255] },
                               bronze: { bg: [67, 20, 7], border: [217, 119, 6], text: [255, 255, 255] },
                               sapphire: { bg: [8, 47, 73], border: [56, 189, 248], text: [255, 255, 255] },
                               ruby: { bg: [69, 10, 10], border: [248, 113, 113], text: [255, 255, 255] },
                               emerald: { bg: [6, 78, 59], border: [52, 211, 153], text: [255, 255, 255] }
                           };

                           if (isThemeApplied && bulkDownloadTheme) {
                               const colors = themeColors[bulkDownloadTheme] || themeColors.gold;
                               pdf.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
                               pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
                               pdf.roundedRect(xOffset, yOffset, cardWidth, cardHeight, 5, 5, 'FD');
                               pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
                           } else {
                               pdf.setFillColor(255, 255, 255);
                               pdf.setDrawColor(200, 200, 200);
                               pdf.roundedRect(xOffset, yOffset, cardWidth, cardHeight, 5, 5, 'FD');
                               pdf.setTextColor(15, 23, 42);
                           }

                           pdf.setFont('helvetica', 'bold');
                           pdf.setFontSize(12);
                           pdf.text(user.name, xOffset + 5, yOffset + 15);

                           pdf.setFont('helvetica', 'normal');
                           pdf.setFontSize(10);
                           if (mode === 'photos') {
                               const imgElem = document.querySelector(`img[alt="${user.name}"]`);
                               if (imgElem && imgElem instanceof HTMLImageElement) {
                                   try {
                                      pdf.addImage(imgElem, 'JPEG', xOffset + 5, yOffset + 20, cardWidth - 10, cardWidth - 10);
                                   } catch (e) {}
                               } else if (user.photo) {
                                  try {
                                      pdf.addImage(user.photo, 'JPEG', xOffset + 5, yOffset + 20, cardWidth - 10, cardWidth - 10);
                                  } catch (e) {}
                               } else {
                                  pdf.text('No Photo', xOffset + 5, yOffset + 30);
                               }
                           } else if (mode === 'ids') {
                               pdf.text(`COT ID: ${user.id}`, xOffset + 5, yOffset + 30);
                           } else if (mode === 'locations') {
                               pdf.text(`Location: ${user.location || 'N/A'}`, xOffset + 5, yOffset + 30);
                           } else if (mode === 'join-dates') {
                               pdf.text(`Joined: ${user.joinedDate || 'N/A'}`, xOffset + 5, yOffset + 30);
                           }

                           xOffset += cardWidth + 10;
                           if (xOffset + cardWidth > pdfWidth - 10) {
                               xOffset = 10;
                               yOffset += cardHeight + 10;
                           }
                        }
                    }
                }
            }

            document.body.removeChild(container);
            pdf.save(`BULK-ID-CARDS-${new Date().getTime()}.pdf`);
        } catch (err) {
            console.error('Bulk PDF generation failed', err);
            alert('Failed to generate bulk PDF. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadUserCard = async (user: User) => {
        if (user.status !== 'Active') {
            alert('Entrust card PDF is available only for approved users.');
            return;
        }
        setDownloadingCardUserId(user.id);
        const frontNode = document.getElementById(`admin-card-front-${user.id}`) || document.getElementById(`quick-card-${user.id}`);
        const backNode = document.getElementById(`admin-card-back-${user.id}`) || document.getElementById(`quick-card-back-${user.id}`);

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
            drawField('Joined Date', member.joinedDate ? (() => {
                const d = new Date(member.joinedDate);
                const day = d.getDate().toString().padStart(2, '0');
                const month = (d.getMonth() + 1).toString().padStart(2, '0');
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            })() : '');

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
                drawField('District / Zone', member.communityProfile.district);

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
        setDownloadingMemberFormPdfUserId(member.id);
        try {
            const profile = member.communityProfile || {};
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
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

            const [logoDataUrl, stampDataUrl] = await Promise.all([
                loadImageDataUrl(MEMBER_FORM_LOGO_URL),
                loadImageDataUrl(MEMBER_FORM_STAMP_URL)
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
                pdf.rect(x, y + 1, 2, 3.8, 'F');
                pdf.setTextColor(navyDark);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(7.6);
                pdf.text(label.toUpperCase(), x + 5, y + 4.0);
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
                pdf.setFillColor(gold);
                const arrowX = x + width - 10;
                const arrowY = y + height / 2 - 1.5;
                pdf.triangle(
                    arrowX, arrowY,
                    arrowX + 5, arrowY,
                    arrowX + 2.5, arrowY + 3.2,
                    'F'
                );
            };

            const divider = (y: number) => {
                pdf.setDrawColor(goldLight);
                pdf.setLineWidth(0.6);
                pdf.line(16, y, pageWidth - 16, y);
            };

            const drawSignatureStamp = (x: number, y: number, width: number) => {
                const stampWidth = 40;
                const signatureWidth = width - stampWidth - 8;
                const blockHeight = 25;
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
                pdf.setTextColor('#0F6432');
                pdf.setFont('times', 'italic');
                pdf.setFontSize(19);
                pdf.text('Shaveesh Jeshurun', x + signatureWidth / 2, y + 17.5, { align: 'center', angle: -2 });
                pdf.setDrawColor('#0F6432');
                pdf.setLineWidth(0.8);
                pdf.line(x + 6, y + 19.8, x + signatureWidth - 6, y + 19.8);
                pdf.setTextColor(navyDark);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(6.5);
                pdf.text('Senior Pastor  -  City of Truth Ministries', x + 4, y + 23.5);
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
            fieldBox(ml, y, fieldWidth, fieldHeight, `${member.name}  -  ${member.id}`);
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
            dropdownBox(ml, y, fieldWidth, fieldHeight, valueOrBlank(profile.district || member.location), 'Select your district or zone');
            y += fieldHeight + verticalGap;

            sectionLabel('Brief Testimony / Bio', ml, y);
            y += labelHeight + labelGap;
            fieldBox(ml, y, fieldWidth, 20, valueOrBlank(profile.bio), 'Share your testimony or brief bio here...', true);
            y += 20 + 6;

            divider(y);
            drawSignatureStamp(ml, 223, fieldWidth);

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

    const handleMinistryMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsLoading(true);
        const newQueueItems: any[] = [];
        try {
            for (const file of files) {
                const isVideo = (file as File).type.startsWith('video/') || /\.(mp4|mov|webm|ogg|m4v)$/i.test((file as File).name);
                const mediaType = isVideo ? 'video' : 'image';
                const detectedDate = detectDate(file);
                const preview = URL.createObjectURL(file as Blob);
                let videoDurationSeconds = 0;
                let duration = '';

                if (isVideo) {
                    try {
                        videoDurationSeconds = await getVideoDuration(file as File);
                        duration = formatDuration(videoDurationSeconds);
                    } catch (err) {
                        console.error(err);
                    }
                }

                newQueueItems.push({
                    id: Math.random().toString(36).substring(7),
                    file,
                    preview,
                    name: getFileBaseName((file as File).name),
                    date: detectedDate,
                    category: 'Highlights',
                    mediaType,
                    duration,
                    videoDurationSeconds,
                    videoTrimStart: 0,
                    videoTrimEnd: 100,
                    cropZoom: 1,
                    cropX: 0,
                    cropY: 0,
                    hidden: false
                });
            }
            setBulkQueue(prev => [...prev, ...newQueueItems]);
        } catch (error) {
            console.error('Failed reading selected files', error);
            alert('Failed to process some selected files.');
        } finally {
            setIsLoading(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleSingleMinistryMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingMinistry) return;

        setIsLoading(true);
        try {
            const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|ogg|m4v)$/i.test(file.name);
            const mediaType = isVideo ? 'video' : 'image';
            const detectedDate = detectDate(file);
            const url = URL.createObjectURL(file);
            
            if (isVideo) {
                const cloudUrl = await uploadMinistryFile(file);
                const durationSecs = await getVideoDuration(file);
                const durationStr = formatDuration(durationSecs);
                // Clean up local blob URL
                URL.revokeObjectURL(url);
                setEditingMinistry(prev => ({
                    ...prev,
                    image: cloudUrl,
                    mediaType: 'video',
                    duration: durationStr,
                    date: prev?.date || detectedDate,
                    name: prev?.name || getFileBaseName(file.name)
                }));
            } else {
                setCropImage(url);
                setCroppingType('ministry');
                setIsCropping(true);
                setEditingMinistry(prev => ({
                    ...prev,
                    date: prev?.date || detectedDate,
                    name: prev?.name || getFileBaseName(file.name)
                }));
            }
        } catch (error) {
            console.error('Failed to change ministry media', error);
            alert('Failed to process the selected media file.');
        } finally {
            setIsLoading(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleRemoveQueueItem = (id: string) => {
        setBulkQueue(prev => {
            const item = prev.find(i => i.id === id);
            if (item && item.preview.startsWith('blob:')) {
                URL.revokeObjectURL(item.preview);
            }
            return prev.filter(i => i.id !== id);
        });
    };

    const handleUpdateQueueItem = (id: string, updates: Partial<any>) => {
        setBulkQueue(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const handlePublishBulkQueue = async () => {
        if (bulkQueue.length === 0) return;
        setIsBulkUploading(true);
        setBulkUploadProgress(0);

        let completed = 0;
        const total = bulkQueue.length;

        try {
            const uploadAndCreate = async (item: typeof bulkQueue[0], index: number) => {
                const mediaUrl = await uploadMinistryFile(item.file);
                let finalDuration = item.duration;

                if (item.mediaType === 'video' && item.videoDurationSeconds > 0) {
                    const startPct = item.videoTrimStart / 100;
                    const endPct = item.videoTrimEnd / 100;
                    const trimmedSecs = Math.max(1, Math.round((endPct - startPct) * item.videoDurationSeconds));
                    finalDuration = formatDuration(trimmedSecs);
                }

                const payload = {
                    name: item.name,
                    date: item.date || new Date().toISOString().split('T')[0],
                    image: mediaUrl,
                    mediaType: item.mediaType,
                    duration: finalDuration,
                    category: item.category,
                    hidden: item.hidden,
                    description: '',
                    order: ministries.length + index + 1
                };

                const newMinistry = await api.createMinistry(payload as Omit<Ministry, 'id'>);
                
                completed++;
                setBulkUploadProgress(Math.round((completed / total) * 100));
                
                return newMinistry;
            };

            const newMinistries = await Promise.all(
                bulkQueue.map((item, index) => uploadAndCreate(item, index))
            );

            setMinistries(prev => [...prev, ...newMinistries]);

            bulkQueue.forEach(item => {
                if (item.preview.startsWith('blob:')) {
                    URL.revokeObjectURL(item.preview);
                }
            });

            setBulkQueue([]);
            alert('All media items in the bulk queue published successfully!');
        } catch (error) {
            console.error('Error publishing bulk queue', error);
            alert('An error occurred during bulk media upload. Please retry.');
        } finally {
            setIsBulkUploading(false);
            setBulkUploadProgress(0);
        }
    };

    const handleCropComplete = (croppedImageUrl: string) => {
        if (croppingType === 'user' && editingUser) {
            setEditingUser({ ...editingUser, photo: croppedImageUrl });
        } else if (croppingType === 'ministry') {
            setEditingMinistry(prev => ({ ...prev, image: croppedImageUrl, mediaType: 'image' }));
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

    const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://city-of-truth-ministries.vercel.app';
    const getVerificationUrl = (memberId: string) => `${appOrigin}/verify/${encodeURIComponent(memberId)}`;
    const getQrImageUrl = (memberId: string, size = 220) =>
        `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(getVerificationUrl(memberId))}&bgcolor=ffffff&color=1a237e&margin=0&format=png&cb=${encodeURIComponent(memberId)}`;
    const editingMinistryMediaType = editingMinistry ? inferMinistryMediaType(editingMinistry) : 'image';
    // Use source-based inference for previews so manual metadata changes don't mis-render the actual media.
    const previewMinistryMediaType = editingMinistry ? inferMinistryMediaType({ ...editingMinistry, mediaType: undefined }) : 'image';

    return (
        <>
            {/* Navigation Guide */}
            <NavigationGuide 
                steps={guideSteps} 
                autoStart={isGuideActive}
                enableVoice={true}
            />
            
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
                                memberSince={user.joinedDate || user.memberSince}
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
                                memberSince={user.joinedDate || user.memberSince}
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
                    <HStack gap={3} align="center" className="mb-4">
                        <button
                            onClick={onBack}
                            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <VStack gap={0.5} align="start" className="flex-1 min-w-0">
                            <h1 className="text-xl md:text-3xl lg:text-4xl font-serif font-bold text-brand-950 truncate admin-dashboard-title">Admin Dashboard</h1>
                            <p className="text-slate-500 mt-0.5 text-xs md:text-sm">Manage users, Firebase, approvals, and recycle bin</p>
                        </VStack>
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
                    </HStack>

                    {menuMode === 'horizontal' && (
                        <HStack gap={1.5} wrap="nowrap" className="overflow-x-auto pb-1 scrollbar-none -mx-1 px-1 lg:hidden">
                            {visibleTabs.map(tab => (
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
                        </HStack>
                    )}
                </div>

                {/* Content Layout — flex when vertical sidebar mode */}
                <div className={menuMode === 'vertical' ? 'flex flex-col lg:flex-row gap-6 items-start' : ''}>
                    {/* Vertical Sidebar */}
                    {menuMode === 'vertical' && (
                        <aside className="w-full lg:w-56 shrink-0 lg:sticky top-28 px-4 lg:px-0 z-40">
                            {/* Mobile Collapsible Dropdown Menu */}
                            <div className="lg:hidden w-full mb-4 relative">
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                                >
                                    <span className="flex items-center gap-2.5 text-sm text-brand-900">
                                        {(() => {
                                            const activeTabObj = visibleTabs.find(t => t.id === activeTab) || visibleTabs[0];
                                            const ActiveIcon = activeTabObj?.icon;
                                            return (
                                                <>
                                                    {ActiveIcon && <ActiveIcon size={16} className="text-brand-600" />}
                                                    {activeTabObj?.label}
                                                </>
                                            );
                                        })()}
                                    </span>
                                    <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                <AnimatePresence>
                                    {mobileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 flex flex-col gap-1.5 z-50 absolute left-0 right-0"
                                        >
                                            {visibleTabs.map(tab => {
                                                const isTabActive = activeTab === tab.id;
                                                const TabIcon = tab.icon;
                                                return (
                                                    <button
                                                        key={tab.id}
                                                        id={`admin-tab-mobile-${tab.id}`}
                                                        onClick={() => {
                                                            setActiveTab(tab.id);
                                                            setMobileMenuOpen(false);
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold text-sm transition-all ${
                                                            isTabActive
                                                                ? 'bg-brand-600 text-white'
                                                                : 'text-slate-600 hover:bg-slate-50 hover:text-brand-700'
                                                        }`}
                                                    >
                                                        <TabIcon size={16} />
                                                        <span>{tab.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Desktop Vertical Menu */}
                            <VStack gap={1} className="hidden lg:flex bg-white rounded-3xl border border-slate-100 shadow-sm p-3 lg:max-h-[calc(100vh-14rem)] overflow-y-auto admin-menu-scrollbar">
                                {visibleTabs.map(tab => {
                                    const customLabel = tab.label;
                                    const isRenaming = renamingTabId === tab.id;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <div
                                            key={tab.id}
                                            id={`admin-tab-${tab.id}`}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl transition-colors group cursor-pointer whitespace-nowrap ${
                                                isActive
                                                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100 lg:border-none'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <tab.icon size={18} className="shrink-0" />
                                                {isRenaming ? (
                                                    <input
                                                        type="text"
                                                        value={renameValue}
                                                        onChange={(e) => setRenameValue(e.target.value)}
                                                        onBlur={() => {
                                                            handleRenameTab(tab.id, renameValue);
                                                            setRenamingTabId(null);
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleRenameTab(tab.id, renameValue);
                                                                setRenamingTabId(null);
                                                            }
                                                        }}
                                                        autoFocus
                                                        className="w-full bg-slate-50 text-slate-900 font-bold px-2 py-0.5 rounded text-xs border border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                ) : (
                                                    <span className="font-bold text-sm truncate">{customLabel}</span>
                                                )}
                                            </div>
                                            {!isRenaming && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setRenamingTabId(tab.id);
                                                        setRenameValue(customLabel);
                                                    }}
                                                    className={`p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-opacity shrink-0 ${
                                                        isActive ? 'text-white/60 hover:text-white' : 'text-slate-400 hover:text-slate-600'
                                                    }`}
                                                    title="Rename tab"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </VStack>
                        </aside>
                    )}

                    {/* Main Content */}
                    <div className={menuMode === 'vertical' ? 'flex-1 min-w-0' : ''}>

                {/* Statistics Cards */}
                {activeTab === 'users' && (
                    <>
                        {/* Users Guide Button */}
                        <div className="mb-4 flex justify-end">
                            <AdminGuideButton 
                                guideName="users" 
                                onStart={() => startGuide(USERS_MANAGEMENT_GUIDE)}
                            />
                        </div>
                        
                        <Grid columns={{ minWidth: 140, max: 4, repeat: 'fit' }} gap={3} className="mb-6 md:mb-8">
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
                    </Grid>
                    </>
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
                    <Grid columns={{ minWidth: 120, max: 5, repeat: 'fit' }} gap={3} className="mb-6">
                        {USER_QUICK_VIEW_OPTIONS.map(option => {
                            const Icon = option.icon;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        if (option.id === 'photos') setIdCardVisualMode('photos');
                                        if (option.id === 'cards') setIdCardVisualMode('cards');
                                        if (option.id === 'ids') setIdCardVisualMode('ids');
                                        if (option.id === 'locations') setIdCardVisualMode('locations');
                                        if (option.id === 'join-dates') setIdCardVisualMode('join-dates');
                                        setUserQuickViewMode(prev => (prev === option.id ? null : option.id));
                                    }}
                                    className={`bg-white p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all text-left ${userQuickViewMode === option.id ? 'border-brand-300 ring-2 ring-brand-100' : 'border-slate-100 hover:border-brand-200'} ${option.id === 'join-dates' ? 'col-span-2 sm:col-span-1' : ''}`}
                                >
                                    <div className={`w-11 h-11 rounded-2xl ${option.bg} ${option.accent} flex items-center justify-center mb-3`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="text-sm font-black text-brand-950">{option.label}</div>
                                    <div className="text-xs text-slate-500 mt-1">{option.description}</div>
                                </button>
                            );
                        })}
                    </Grid>
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
                                                                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                                                                                <img 
                                                                                    src={safeOriginalPhoto || '/logo.png'} 
                                                                                    alt="Original Photo" 
                                                                                    className="w-full h-full object-cover" 
                                                                                    onError={(e) => {
                                                                                        (e.target as HTMLImageElement).src = '/logo.png';
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        ) : (originalRaw || '—')}
                                                                    </td>
                                                                    <td className="px-3 py-2.5 text-brand-700 font-semibold">
                                                                        {isPhotoField ? (
                                                                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-brand-200 bg-brand-50 flex items-center justify-center">
                                                                                <img 
                                                                                    src={safeEditedPhoto || '/logo.png'} 
                                                                                    alt="Edited Photo" 
                                                                                    className="w-full h-full object-cover" 
                                                                                    onError={(e) => {
                                                                                        (e.target as HTMLImageElement).src = '/logo.png';
                                                                                    }}
                                                                                />
                                                                            </div>
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
                                    onChange={(e) => setUserSortMode(e.target.value as 'status' | 'cot-id' | 'joined-date')}
                                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 transition-colors text-sm"
                                >
                                    <option value="status">Sort: Status</option>
                                    <option value="cot-id">Sort: COT ID</option>
                                    <option value="joined-date">Sort: Joined Date</option>
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
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined Date</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.map((user, index) => (
                                        <motion.tr
                                            id={`user-row-${user.id}`}
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ 
                                                opacity: 1,
                                                backgroundColor: highlightedUserId === user.id ? '#fef08a' : 'transparent'
                                            }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`transition-colors cursor-pointer ${
                                                highlightedUserId === user.id 
                                                    ? 'bg-yellow-100 ring-2 ring-yellow-400 ring-offset-2 z-10 relative' 
                                                    : 'hover:bg-slate-50'
                                            }`}
                                            onClick={() => setViewingDetailsUser(user)}
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.has(user.id)}
                                                    onChange={() => toggleSelectUser(user.id)}
                                                    onClick={(e) => e.stopPropagation()}
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
                                                {formatDateValue(user.joinedDate || user.memberSince)}
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
                                                                        await disapproveUser(user);
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
                                id={`user-row-mobile-${user.id}`}
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`bg-white p-4 sm:p-6 rounded-3xl border transition-all ${
                                    highlightedUserId === user.id
                                        ? 'border-yellow-400 bg-yellow-50 ring-4 ring-yellow-100 z-10 relative'
                                        : 'border-slate-100 shadow-sm'
                                }`}
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
                                        {user.status}
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
                                        Joined {formatDateValue(user.joinedDate || user.memberSince)}
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
                                                    await disapproveUser(user);
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
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-4 border-t border-slate-100">
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
                                        onClick={() => setCotManagerMode(tab.id as 'manual' | 'random' | 'requests')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${cotManagerMode === tab.id ? 'bg-brand-600 text-white border-brand-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {cotManagerMode === 'manual' && (
                                <>
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
                                        <p className="text-xs font-bold text-slate-700">Search COT ID and check occupancy</p>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <div className="flex-1 flex items-center px-3 py-2 rounded-lg border border-slate-200 bg-white focus-within:border-brand-500 transition-colors">
                                                <span className="text-xs font-mono text-slate-500 select-none">COT-</span>
                                                <input
                                                    value={(cotIdSearchInput || '').replace(/^COT-/i, '')}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/^COT-/i, '');
                                                        setCotIdSearchInput(val ? `COT-${val}` : '');
                                                        setCotIdSearchFeedback(null);
                                                    }}
                                                    placeholder="0001"
                                                    className="flex-1 bg-transparent text-xs font-mono outline-none min-w-0"
                                                />
                                            </div>
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
                                                    <div className={`flex items-center w-full px-3 py-2 rounded-lg border bg-white focus-within:border-brand-500 transition-colors ${duplicateId ? 'border-red-300' : 'border-slate-200'}`}>
                                                        <span className="text-xs font-mono text-slate-500 select-none">COT-</span>
                                                        <input
                                                            list="manual-cot-id-options"
                                                            value={(draftId || '').replace(/^COT-/i, '')}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/^COT-/i, '');
                                                                setCotDraftIds(prev => ({ ...prev, [user.id]: val ? `COT-${val}` : '' }));
                                                            }}
                                                            className="flex-1 bg-transparent text-xs font-mono outline-none min-w-0 text-brand-950"
                                                            placeholder="1960"
                                                        />
                                                    </div>
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
                                    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                                        <button
                                            type="button"
                                            onClick={() => setCotInventoryOpen(prev => !prev)}
                                            className="w-full px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
                                                    <Hash size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-brand-950">COT ID Member Inventory</p>
                                                    <p className="text-[11px] text-slate-500 truncate">Click to search all users, select a member, and manage their COT ID.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black border border-slate-200">
                                                    {users.length} users
                                                </span>
                                                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black border border-emerald-100">
                                                    {allAvailableCotIds.length} free
                                                </span>
                                                <ChevronDown size={18} className={`text-slate-400 transition-transform ${cotInventoryOpen ? 'rotate-180' : ''}`} />
                                            </div>
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {cotInventoryOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                                    className="overflow-hidden border-t border-slate-100"
                                                >
                                                    <div className="p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
                                                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
                                                            <div className="relative">
                                                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                                <input
                                                                    type="text"
                                                                    value={cotInventoryQuery}
                                                                    onChange={(e) => setCotInventoryQuery(e.target.value)}
                                                                    placeholder="Type any detail: name, COT ID, phone, email, location, or status..."
                                                                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 text-sm"
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setCotInventoryQuery('');
                                                                    setCotManagerSelectedUserId('');
                                                                    setCotManagerQuery('');
                                                                    setDiceTargetUserId('');
                                                                    setCotInventoryAssignMode(null);
                                                                    setCotInventoryManualInput('');
                                                                    setCotInventorySelectedId('');
                                                                }}
                                                                className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-black hover:bg-slate-50"
                                                            >
                                                                Clear Selection
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                            {[
                                                                { label: 'Matched', value: cotInventoryUsers.length, tone: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
                                                                { label: 'Active', value: cotInventoryUsers.filter(user => user.status === 'Active').length, tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                                                                { label: 'Pending', value: cotInventoryUsers.filter(user => user.status === 'Pending Verification').length, tone: 'bg-amber-50 text-amber-700 border-amber-100' },
                                                                { label: 'Rejected', value: cotInventoryUsers.filter(user => user.status === 'Rejected').length, tone: 'bg-rose-50 text-rose-700 border-rose-100' }
                                                            ].map(stat => (
                                                                <div key={stat.label} className={`rounded-xl border px-3 py-2 ${stat.tone}`}>
                                                                    <p className="text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                                                                    <p className="text-lg font-black leading-tight">{stat.value}</p>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <AnimatePresence>
                                                            {cotInventorySelectedUser && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.96, y: 18 }}
                                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.96, y: -12 }}
                                                                    className="relative overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-950 via-indigo-950 to-slate-950 p-4 md:p-5 text-white shadow-2xl shadow-brand-950/20"
                                                                >
                                                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.22),transparent_30%)]" />
                                                                    <div className="relative z-10 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                                                                        <div className="flex items-center gap-3 min-w-0">
                                                                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border border-white/20 bg-white/10 flex items-center justify-center shrink-0 shadow-lg">
                                                                                {cotInventorySelectedUser.photo ? (
                                                                                    <img src={cotInventorySelectedUser.photo} alt={cotInventorySelectedUser.name} className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <span className="text-xl font-black">{(cotInventorySelectedUser.name || 'U').charAt(0)}</span>
                                                                                )}
                                                                            </div>
                                                                            <div className="min-w-0">
                                                                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-200">Selected Member</p>
                                                                                <h4 className="mt-1 text-xl md:text-2xl font-black truncate">{cotInventorySelectedUser.name}</h4>
                                                                                <p className="text-xs md:text-sm font-mono text-white/60 truncate">{cotInventorySelectedUser.id}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-2 min-w-[min(100%,360px)]">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setCotInventoryAssignMode('manual')}
                                                                                className={`rounded-2xl border px-4 py-3 text-left transition-all hover:-translate-y-0.5 ${cotInventoryAssignMode === 'manual' ? 'bg-amber-400 text-brand-950 border-amber-200 shadow-lg shadow-amber-500/30' : 'bg-white/10 text-white border-white/15 hover:bg-white/15'}`}
                                                                            >
                                                                                <Hash size={18} />
                                                                                <p className="mt-2 text-sm font-black">Manual Select</p>
                                                                                <p className="text-[10px] font-semibold opacity-70">See all COT IDs</p>
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setCotInventoryAssignMode('random');
                                                                                    setDiceTargetUserId(cotInventorySelectedUser.id);
                                                                                }}
                                                                                className={`rounded-2xl border px-4 py-3 text-left transition-all hover:-translate-y-0.5 ${cotInventoryAssignMode === 'random' ? 'bg-violet-400 text-brand-950 border-violet-200 shadow-lg shadow-violet-500/30' : 'bg-white/10 text-white border-white/15 hover:bg-white/15'}`}
                                                                            >
                                                                                <Dice6 size={18} />
                                                                                <p className="mt-2 text-sm font-black">Random Dice</p>
                                                                                <p className="text-[10px] font-semibold opacity-70">Big roll effect</p>
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    <AnimatePresence>
                                                                        {cotInventoryAssignMode === 'manual' && (
                                                                            <motion.div
                                                                                initial={{ opacity: 0, y: 18 }}
                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                exit={{ opacity: 0, y: -10 }}
                                                                                className="relative z-10 mt-5 rounded-3xl border border-white/15 bg-white/95 p-3 md:p-4 text-slate-900 shadow-xl"
                                                                            >
                                                                                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-2 mb-3">
                                                                                    <div className="relative flex items-center pl-10 pr-3 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100 transition-colors">
                                                                                        <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-500" />
                                                                                        <span className="text-sm font-mono text-slate-500 select-none">COT-</span>
                                                                                        <input
                                                                                            list="manual-cot-id-options"
                                                                                            value={(cotInventoryManualInput || '').replace(/^COT-/i, '')}
                                                                                            onChange={(event) => {
                                                                                                const val = event.target.value.replace(/^COT-/i, '');
                                                                                                setCotInventoryManualInput(val ? `COT-${val}` : '');
                                                                                                setCotInventorySelectedId(normalizeCotIdInput(val ? `COT-${val}` : ''));
                                                                                            }}
                                                                                            placeholder="1960"
                                                                                            className="flex-1 bg-transparent text-sm font-mono outline-none min-w-0"
                                                                                        />
                                                                                    </div>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => applyInventoryCotId(cotInventoryManualInput || cotInventorySelectedId)}
                                                                                        disabled={!onReassignUserId || !(cotInventoryManualInput || cotInventorySelectedId)}
                                                                                        className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-black shadow-lg shadow-emerald-500/25 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 transition-transform"
                                                                                    >
                                                                                        Use It
                                                                                    </button>
                                                                                </div>
                                                                                <div className="flex flex-wrap gap-2 mb-3">
                                                                                    {[
                                                                                        { id: 'available', label: 'Available IDs' },
                                                                                        { id: 'numeric', label: 'All Sequence' },
                                                                                        { id: 'random', label: 'Random Sequence' }
                                                                                    ].map(mode => (
                                                                                        <button
                                                                                            key={mode.id}
                                                                                            type="button"
                                                                                            onClick={() => setCotInventorySequenceMode(mode.id as 'available' | 'numeric' | 'random')}
                                                                                            className={`px-3 py-1.5 rounded-full border text-[11px] font-black transition-colors ${cotInventorySequenceMode === mode.id ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                                                                        >
                                                                                            {mode.label}
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                                <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-2">
                                                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-7 gap-2">
                                                                                        {cotInventoryDisplayIds.map((id, index) => {
                                                                                            const isTaken = existingCotIds.has(id);
                                                                                            const isCurrent = id === (cotInventorySelectedUser.id || '').toUpperCase();
                                                                                            const isChosen = id === cotInventorySelectedId;
                                                                                            return (
                                                                                                <motion.button
                                                                                                    key={`${id}-${index}`}
                                                                                                    type="button"
                                                                                                    initial={{ opacity: 0, y: 8 }}
                                                                                                    animate={{ opacity: 1, y: 0 }}
                                                                                                    transition={{ delay: Math.min(index * 0.006, 0.18) }}
                                                                                                    onClick={() => {
                                                                                                        if (isTaken && !isCurrent) return;
                                                                                                        setCotInventorySelectedId(id);
                                                                                                        setCotInventoryManualInput(id);
                                                                                                    }}
                                                                                                    disabled={isTaken && !isCurrent}
                                                                                                    className={`relative overflow-hidden rounded-xl border px-2 py-2 text-center font-mono text-[11px] font-black transition-all ${
                                                                                                        isChosen
                                                                                                            ? 'border-amber-400 bg-amber-300 text-brand-950 shadow-lg shadow-amber-300/40 scale-[1.03]'
                                                                                                            : isTaken
                                                                                                                ? 'border-slate-200 bg-slate-100 text-slate-400 opacity-60'
                                                                                                                : 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-100'
                                                                                                    }`}
                                                                                                >
                                                                                                    {extractCotNumber(id)}
                                                                                                    {isChosen && <span className="absolute inset-x-2 bottom-1 h-0.5 rounded-full bg-brand-700" />}
                                                                                                </motion.button>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                </div>
                                                                            </motion.div>
                                                                        )}

                                                                        {cotInventoryAssignMode === 'random' && (
                                                                            <motion.div
                                                                                initial={{ opacity: 0, scale: 0.94, y: 18 }}
                                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                                exit={{ opacity: 0, scale: 0.94, y: -10 }}
                                                                                className="relative z-10 mt-5 rounded-3xl border border-white/15 bg-gradient-to-br from-violet-600 via-indigo-600 to-brand-700 p-5 text-white shadow-2xl"
                                                                            >
                                                                                <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={rollInventoryCotId}
                                                                                        disabled={diceRolling}
                                                                                        className={`min-h-28 lg:min-h-36 px-8 rounded-3xl text-2xl md:text-3xl font-black border border-white/20 shadow-2xl transition-all ${diceRolling ? 'bg-amber-400 text-brand-950 animate-pulse' : 'bg-white text-brand-950 hover:scale-[1.03]'}`}
                                                                                    >
                                                                                        <span className="block text-5xl mb-2">🎲</span>
                                                                                        {diceRolling ? 'Rolling...' : 'Roll Big Dice'}
                                                                                    </button>
                                                                                    <div className="flex-1 flex flex-col items-center justify-center rounded-3xl bg-white/10 border border-white/15 p-5 min-h-36">
                                                                                        <div className="scale-[1.45] md:scale-[1.8] my-6">
                                                                                            <CotIdEpicDice isRolling={diceRolling} result={dicePickedCotId || cotInventorySelectedId || '— — — —'} />
                                                                                        </div>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => applyInventoryCotId(dicePickedCotId || cotInventorySelectedId)}
                                                                                            disabled={!onReassignUserId || !(dicePickedCotId || cotInventorySelectedId)}
                                                                                            className="mt-4 px-6 py-3 rounded-2xl bg-amber-300 text-brand-950 text-sm font-black shadow-xl shadow-amber-500/30 hover:scale-[1.03] disabled:opacity-50 disabled:hover:scale-100 transition-transform"
                                                                                        >
                                                                                            Use This Random COT ID
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </motion.div>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>

                                                        <div className="max-h-[420px] overflow-y-auto pr-1">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                                                {cotInventoryUsers.map((user, index) => {
                                                                    const currentId = (user.id || '').toUpperCase();
                                                                    const isSelected = cotManagerSelectedUserId === user.id;
                                                                    const hasCotId = isCotId(currentId);
                                                                    return (
                                                                        <motion.button
                                                                            key={user.id}
                                                                            type="button"
                                                                            initial={{ opacity: 0, y: 12 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            transition={{ delay: Math.min(index * 0.025, 0.25) }}
                                                                            onClick={() => {
                                                                                setCotManagerSelectedUserId(user.id);
                                                                                setCotManagerQuery(user.name);
                                                                                setDiceTargetUserId(user.id);
                                                                                setCotInventoryAssignMode(null);
                                                                                setCotInventoryManualInput('');
                                                                                setCotInventorySelectedId('');
                                                                                setCotIdSearchInput(currentId);
                                                                                setCotIdSearchFeedback({
                                                                                    type: hasCotId ? 'occupied' : 'invalid',
                                                                                    message: hasCotId ? `${currentId} is selected for ${user.name}.` : `${user.name} does not have a valid COT ID format yet.`
                                                                                });
                                                                            }}
                                                                            className={`group text-left rounded-2xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                                                                                isSelected
                                                                                    ? 'border-brand-400 bg-brand-50 shadow-md shadow-brand-500/10 ring-2 ring-brand-100'
                                                                                    : 'border-slate-200 bg-white hover:border-brand-200'
                                                                            }`}
                                                                        >
                                                                            <div className="flex items-start gap-3">
                                                                                <div className="relative shrink-0">
                                                                                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 border border-white shadow-sm flex items-center justify-center">
                                                                                        {user.photo ? (
                                                                                            <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                                                                                        ) : (
                                                                                            <span className="text-base font-black text-brand-700">{(user.name || 'U').charAt(0)}</span>
                                                                                        )}
                                                                                    </div>
                                                                                    <span className={`absolute -right-1 -bottom-1 w-4 h-4 rounded-full border-2 border-white ${user.status === 'Active' ? 'bg-emerald-500' : user.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                                                                </div>
                                                                                <div className="min-w-0 flex-1">
                                                                                    <div className="flex items-start justify-between gap-2">
                                                                                        <div className="min-w-0">
                                                                                            <p className="text-sm font-black text-brand-950 truncate">{user.name}</p>
                                                                                            <p className="text-[11px] font-mono text-slate-500 truncate">{currentId ? extractCotNumber(currentId) : 'No COT ID'}</p>
                                                                                        </div>
                                                                                        {isSelected && <CheckCircle size={18} className="text-brand-600 shrink-0" />}
                                                                                    </div>
                                                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                                                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black ${getStatusColor(user.status)}`}>
                                                                                            {user.status}
                                                                                        </span>
                                                                                        <span className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600">
                                                                                            {user.role}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="mt-3 grid grid-cols-1 gap-1.5 text-[11px] text-slate-500">
                                                                                <div className="flex items-center gap-2 min-w-0">
                                                                                    <Phone size={12} className="text-slate-400 shrink-0" />
                                                                                    <span className="truncate">{user.phone || user.emergency || 'No phone'}</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-2 min-w-0">
                                                                                    <MapPin size={12} className="text-slate-400 shrink-0" />
                                                                                    <span className="truncate">{user.location || 'No location'}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="mt-3 flex items-center gap-2">
                                                                                <span className={`flex-1 text-center px-3 py-2 rounded-xl text-[11px] font-black transition-colors ${isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-700'}`}>
                                                                                    {isSelected ? 'Selected' : 'Select Member'}
                                                                                </span>
                                                                                <span
                                                                                    role="button"
                                                                                    tabIndex={0}
                                                                                    onClick={(event) => {
                                                                                        event.stopPropagation();
                                                                                        setViewingDetailsUser(user);
                                                                                    }}
                                                                                    onKeyDown={(event) => {
                                                                                        if (event.key === 'Enter' || event.key === ' ') {
                                                                                            event.preventDefault();
                                                                                            event.stopPropagation();
                                                                                            setViewingDetailsUser(user);
                                                                                        }
                                                                                    }}
                                                                                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-brand-700 hover:border-brand-200 text-[11px] font-black"
                                                                                >
                                                                                    View
                                                                                </span>
                                                                            </div>
                                                                        </motion.button>
                                                                    );
                                                                })}
                                                            </div>
                                                            {cotInventoryUsers.length === 0 && (
                                                                <div className="text-center py-10 rounded-2xl border border-dashed border-slate-200 bg-white">
                                                                    <Users size={36} className="mx-auto text-slate-300 mb-3" />
                                                                    <p className="text-sm font-bold text-slate-500">No matching members found.</p>
                                                                    <p className="text-xs text-slate-400 mt-1">Try a name, phone number, district, email, or COT ID.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
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
                                        <div className="flex-1 flex items-center px-3 py-2 rounded-xl border border-slate-200 bg-white focus-within:border-brand-500 transition-colors">
                                            <span className="text-sm font-mono text-slate-500 select-none">COT-</span>
                                            <input
                                                list="manual-cot-id-options"
                                                value={(diceManualInput || '').replace(/^COT-/i, '')}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/^COT-/i, '');
                                                    setDiceManualInput(val ? `COT-${val}` : '');
                                                }}
                                                placeholder="1960"
                                                className="flex-1 bg-transparent text-sm font-mono outline-none min-w-0"
                                            />
                                        </div>
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
                                        <span className="px-2 py-1 rounded-full bg-white border border-amber-200">Total: {cotIdRequestInsights.total}</span>
                                        <span className="px-2 py-1 rounded-full bg-white border border-amber-200">Today: {cotIdRequestInsights.today}</span>
                                        <span className="px-2 py-1 rounded-full bg-white border border-amber-200">Need New ID: {cotIdRequestInsights.categories.newId}</span>
                                        <span className="px-2 py-1 rounded-full bg-white border border-amber-200">Dislike ID: {cotIdRequestInsights.categories.dislike}</span>
                                    </div>
                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                    {cotIdRequestInsights.items.map(note => (
                                        <div key={note.id} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 flex flex-col gap-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <p className="text-xs font-black text-amber-900 truncate">{note.user?.name || note.userId}</p>
                                                        <span className="px-2 py-0.5 rounded-full bg-white border border-amber-200 text-[10px] font-black text-amber-800">{note.category}</span>
                                                        {note.isToday && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700">Today</span>}
                                                    </div>
                                                    <p className="text-[11px] text-amber-900/90 whitespace-pre-wrap break-words">{note.message}</p>
                                                    <p className="text-[10px] text-amber-700 mt-1">{new Date(note.createdAt).toLocaleString()}</p>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-1.5 shrink-0">
                                                    <button
                                                        onClick={() => {
                                                            setCotManagerMode('manual');
                                                            setCotManagerQuery((note.user?.name || note.userId || '').trim());
                                                            if (note.user?.id) setCotManagerSelectedUserId(note.user.id);
                                                        }}
                                                        className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 text-amber-800 text-[11px] font-bold hover:bg-amber-100"
                                                    >
                                                        Open User
                                                    </button>
                                                    {note.user && (
                                                        <button
                                                            onClick={() => setViewingDetailsUser(note.user as User)}
                                                            className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 text-brand-700 text-[11px] font-bold hover:bg-brand-50"
                                                        >
                                                            View Profile
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {note.user && (
                                                <div className="pt-2.5 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-2.5">
                                                    <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                                                        <span>Current:</span>
                                                        <span className="font-mono bg-white/70 px-1.5 py-0.5 rounded border border-amber-100">{note.user.id}</span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                const generatedCotId = getRandomAvailableCotId();
                                                                if (!generatedCotId) {
                                                                    alert('No available COT IDs found.');
                                                                    return;
                                                                }
                                                                if (window.confirm(`Roll and reassign a random COT ID to ${note.user!.name}? New ID: ${generatedCotId}`)) {
                                                                    try {
                                                                        await onReassignUserId!(note.user!.id, generatedCotId, { ...note.user!, id: generatedCotId });
                                                                        alert(`Successfully reassigned ${note.user!.name} to ${generatedCotId}.`);
                                                                    } catch (err) {
                                                                        console.error(err);
                                                                        alert('Failed to reassign COT ID.');
                                                                    }
                                                                }
                                                            }}
                                                            className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold transition-all flex items-center gap-1"
                                                            disabled={!onReassignUserId}
                                                        >
                                                            🎲 Roll Dice ID
                                                        </button>
                                                        <div className="flex items-center gap-1">
                                                            <div className="flex items-center px-2 py-1 border border-slate-200 rounded-lg bg-white focus-within:border-brand-500 transition-colors">
                                                                <span className="text-[11px] font-mono text-slate-500 select-none">COT-</span>
                                                                <input
                                                                    type="text"
                                                                    maxLength={4}
                                                                    placeholder="1960"
                                                                    value={requestManualInputs[note.id] || ''}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value.replace(/\D/g, '');
                                                                        setRequestManualInputs(prev => ({ ...prev, [note.id]: val }));
                                                                    }}
                                                                    className="w-12 bg-transparent text-[11px] font-mono outline-none text-center"
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    const rawInput = requestManualInputs[note.id] || '';
                                                                    if (rawInput.length !== 4) {
                                                                        alert('Please enter exactly 4 digits.');
                                                                        return;
                                                                    }
                                                                    const formattedId = formatCotId(Number(rawInput));
                                                                    if (existingCotIds.has(formattedId)) {
                                                                        alert(`The ID ${formattedId} is already occupied.`);
                                                                        return;
                                                                    }
                                                                    if (window.confirm(`Assign manual ID ${formattedId} to ${note.user!.name}?`)) {
                                                                        try {
                                                                            await onReassignUserId!(note.user!.id, formattedId, { ...note.user!, id: formattedId });
                                                                            setRequestManualInputs(prev => ({ ...prev, [note.id]: '' }));
                                                                            alert(`Successfully assigned ${formattedId} to ${note.user!.name}.`);
                                                                        } catch (err) {
                                                                            console.error(err);
                                                                            alert('Failed to reassign COT ID.');
                                                                        }
                                                                    }
                                                                }}
                                                                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-all disabled:opacity-60"
                                                                disabled={!onReassignUserId || (requestManualInputs[note.id] || '').length !== 4}
                                                            >
                                                                Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
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
                                <div className="w-full space-y-4 mb-4">
                                    <div className="flex flex-wrap gap-2.5 items-center">
                                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 space-y-2 flex-1 min-w-[280px]">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Years</p>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => setIdCardsFilterYears(messageYearOptions)} className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-100">Select all</button>
                                                        <button onClick={() => setIdCardsFilterYears([])} className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-100">All years</button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {messageYearOptions.map(year => {
                                                        const selected = idCardsFilterYears.includes(year);
                                                        return (
                                                            <button key={year} onClick={() => toggleIdCardsYear(year)} className={`px-2.5 py-1 rounded-full border text-[10px] font-bold transition-colors ${selected ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                                                                {year}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 space-y-2 flex-1 min-w-[280px]">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Categories</p>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => setIdCardsFilterCategories(['Active', 'Pending Verification', 'Rejected'])} className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-100">Select all</button>
                                                        <button onClick={() => setIdCardsFilterCategories([])} className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-100">All categories</button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(['Active', 'Pending Verification', 'Rejected'] as UserStatus[]).map(status => {
                                                        const selected = idCardsFilterCategories.includes(status);
                                                        return (
                                                            <button key={status} onClick={() => toggleIdCardsCategory(status)} className={`px-2.5 py-1 rounded-full border text-[10px] font-bold transition-colors ${selected ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                                                                {status}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 space-y-2 flex-1 min-w-[280px]">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Location Categories</p>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => setIdCardsFilterLocations(userLocationOptions)} className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-100">Select all</button>
                                                        <button onClick={() => setIdCardsFilterLocations([])} className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-100">Clear</button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {userLocationOptions.map(location => {
                                                        const selected = idCardsFilterLocations.includes(location);
                                                        return (
                                                            <button key={location} onClick={() => toggleIdCardsLocation(location)} className={`px-2.5 py-1 rounded-full border text-[10px] font-bold transition-colors ${selected ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                                                                {location}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                    </div>
                                </div>
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
                                <div className="flex flex-wrap gap-2.5 w-full md:w-auto items-center">
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value as UserStatus | 'All')}
                                        className="flex-1 min-w-[100px] text-xs py-2.5 px-3 md:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 font-bold"
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Active">Active</option>
                                        <option value="Pending Verification">Pending</option>
                                    </select>
                                    <select
                                        value={filterLocation}
                                        onChange={(e) => setFilterLocation(e.target.value)}
                                        className="flex-1 min-w-[100px] text-xs py-2.5 px-3 md:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 font-bold"
                                    >
                                        <option value="All">All Locations</option>
                                        {userLocationOptions.map(location => (
                                            <option key={location} value={location}>{location}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={idCardSizeVariation}
                                        onChange={(e) => setIdCardSizeVariation(e.target.value as 'standard' | 'large' | 'extralarge' | 'compact')}
                                        className="flex-1 min-w-[100px] text-xs py-2.5 px-3 md:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 font-bold text-amber-700"
                                    >
                                        <option value="standard">Standard Size</option>
                                        <option value="large">Large Display</option>
                                        <option value="extralarge">Extra Large Display</option>
                                        <option value="compact">Compact / Wallet</option>
                                    </select>
                                    <select
                                        value={userSortMode}
                                        onChange={(e) => setUserSortMode(e.target.value as 'status' | 'cot-id' | 'joined-date')}
                                        className="flex-1 min-w-[100px] text-xs py-2.5 px-3 md:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 font-bold"
                                    >
                                        <option value="status">Status</option>
                                        <option value="cot-id">COT ID</option>
                                        <option value="joined-date">Joined Date</option>
                                    </select>
                                    <div className="px-4 py-3 bg-brand-50 text-brand-700 rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest whitespace-nowrap">
                                        <Users size={14} /> {filteredUsers.length} Cards
                                    </div>
                                    <button
                                        onClick={() => setShowBulkDownloadModal(true)}
                                        className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest whitespace-nowrap transition-colors"
                                    >
                                        <Download size={14} /> Bulk Download
                                    </button>
                                    <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                                        <button
                                            type="button"
                                            onClick={() => setIdCardVisualMode('cards')}
                                            className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${idCardVisualMode === 'cards' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                        >
                                            Entrust
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIdCardVisualMode('photos')}
                                            className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${idCardVisualMode === 'photos' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                        >
                                            Images
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIdCardVisualMode('ids')}
                                            className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${idCardVisualMode === 'ids' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                        >
                                            COT ID
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIdCardVisualMode('locations')}
                                            className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${idCardVisualMode === 'locations' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                        >
                                            Location
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIdCardVisualMode('join-dates')}
                                            className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${idCardVisualMode === 'join-dates' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                        >
                                            Since
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        )}

                        {/* ID Cards Grid */}
                        {activeTab === 'id-cards' && (
                        <>
                        <div className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-[#111827] shadow-2xl shadow-slate-900/15">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
                            <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-amber-300/10" />
                            <div className="p-5 md:p-6">
                                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 text-amber-200">
                                            <Sparkles size={16} />
                                            <p className="text-[11px] font-black uppercase tracking-[0.28em]">Royal Entrust Themes</p>
                                        </div>
                                        <h3 className="mt-2 text-xl md:text-2xl font-black text-white tracking-tight">Bulk card theme studio</h3>
                                        <p className="mt-1 text-xs md:text-sm font-semibold text-slate-300">
                                            Applies to {filteredUsers.length} filtered card{filteredUsers.length === 1 ? '' : 's'}.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full xl:max-w-4xl">
                                        {ROYAL_CARD_THEMES.map(theme => {
                                            const isApplying = applyingCardThemeTone === theme.tone;
                                            const isUnified = filteredUsers.length > 0 && filteredUsers.every(user => (user.cardThemeTone || 'blue') === theme.tone);
                                            return (
                                                <button
                                                    key={theme.tone}
                                                    type="button"
                                                    onClick={() => handleApplyBulkCardTheme(theme.tone)}
                                                    disabled={!!applyingCardThemeTone || filteredUsers.length === 0}
                                                    className={`group/theme relative overflow-hidden rounded-2xl border px-3 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                                                        isUnified
                                                            ? `border-white/80 bg-white text-slate-950 ring-2 ${theme.ring} ring-offset-2 ring-offset-slate-950`
                                                            : 'border-white/10 bg-white/8 text-white hover:-translate-y-0.5 hover:border-amber-200/70 hover:bg-white/12'
                                                    }`}
                                                    title={`Apply ${theme.name} to all filtered cards`}
                                                >
                                                    <div className={`mb-3 h-10 rounded-xl bg-gradient-to-r ${theme.swatch} shadow-lg`} />
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-black truncate">{theme.name}</p>
                                                            <p className={`mt-0.5 text-[10px] font-bold uppercase tracking-widest ${isUnified ? 'text-slate-500' : 'text-slate-300'}`}>
                                                                {isApplying ? 'Applying...' : theme.description}
                                                            </p>
                                                        </div>
                                                        <span className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 ${
                                                            isUnified ? 'border-emerald-300 bg-emerald-100 text-emerald-700' : 'border-white/20 bg-white/10 text-white/70'
                                                        }`}>
                                                            {isUnified ? <Check size={13} /> : <Sparkles size={12} />}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bulk Download Card Studio */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 md:p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-5 border-b border-slate-100 pb-5">
                                <div>
                                    <div className="flex items-center gap-2 text-brand-600 mb-1">
                                        <Download size={16} />
                                        <h3 className="font-black">Bulk Export Settings</h3>
                                    </div>
                                    <p className="text-xs text-slate-500">Download specific data sections as cards for the {filteredUsers.length} filtered users.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                                        <button
                                            onClick={() => setBulkDownloadFormat('pdf')}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${bulkDownloadFormat === 'pdf' ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            PDF
                                        </button>
                                        <button
                                            onClick={() => setBulkDownloadFormat('zip')}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${bulkDownloadFormat === 'zip' ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            ZIP
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                {['ID Card', 'Interest Card', 'Cart ID', 'Location', 'Join date'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setBulkDownloadType(type as any)}
                                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold text-center transition-all ${bulkDownloadType === type ? 'bg-brand-50 border-brand-300 text-brand-700 shadow-inner' : 'bg-white border-slate-200 text-slate-600 hover:border-brand-200 hover:bg-slate-50'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleBulkDownload}
                                    disabled={filteredUsers.length === 0 || isBulkDownloading}
                                    className="px-6 py-3 bg-brand-600 hover:bg-brand-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-md shadow-brand-500/20"
                                >
                                    {isBulkDownloading ? (
                                        <><span className="animate-spin">⏳</span> Processing {filteredUsers.length} Cards...</>
                                    ) : (
                                        <><Download size={16} /> Download Bulk {bulkDownloadFormat.toUpperCase()}</>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-8">
                            <AnimatePresence mode='popLayout'>
                                {filteredUsers.map((user, index) => {
                                    const previewTheme = ROYAL_PREVIEW_THEME_CLASSES[user.cardThemeTone || 'blue'];
                                    return (
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
                                        {idCardVisualMode === 'cards' ? (
                                            <div className="flex flex-col gap-3 w-full">
                                                <div className="cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99] w-full">
                                                    <div className={`transition-all duration-300 ${idCardSizeVariation === 'large' ? 'scale-[1.15] origin-top-left mx-auto mb-10' : idCardSizeVariation === 'extralarge' ? 'scale-[1.3] origin-top-left mx-auto mb-16' : idCardSizeVariation === 'compact' ? 'scale-[0.85] origin-top-left -mb-6' : ''}`}>
                                                    <AdminIDCard
                                                        sizeVariation={idCardSizeVariation}
                                                        user={{
                                                            id: user.id,
                                                            name: user.name,
                                                            role: user.role,
                                                            photo: user.photo,
                                                            location: user.location,
                                                            phone: user.phone,
                                                            memberSince: user.memberSince,
                                                            cardThemeTone: user.cardThemeTone,
                                                            status: user.status
                                                        }}
                                                        onPhotoClick={() => setIdCardVisualMode('photos')}
                                                        onCotIdClick={() => setIdCardVisualMode('ids')}
                                                        onLocationClick={() => setIdCardVisualMode('locations')}
                                                        onMemberSinceClick={() => setIdCardVisualMode('join-dates')}
                                                        onThemeChange={(tone) => onUpdateUser({ ...user, cardThemeTone: tone })}
                                                    />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : idCardVisualMode === 'photos' ? (
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setIdCardVisualMode('cards');
                                                }}
                                                className={`group/image w-full text-left rounded-3xl overflow-hidden border shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 ${previewTheme.focus} ${previewTheme.shell}`}
                                                title="Show Entrust card preview"
                                            >
                                                <div className={`${previewTheme.header} px-5 py-3 flex items-center justify-between`}>
                                                    <div>
                                                        <p className={`text-[9px] font-black uppercase tracking-[0.25em] ${previewTheme.accentText}`}>City of Truth</p>
                                                        <p className="text-[11px] font-bold text-white uppercase tracking-widest leading-tight">Ministries</p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-2.5 py-1 rounded-full border border-white/30">
                                                        <ImageIcon size={11} className="text-white" />
                                                        <span className="text-[10px] font-black text-white uppercase tracking-wider">Image</span>
                                                    </div>
                                                </div>
                                                <div className="p-5">
                                                    <div className={`aspect-[4/3] rounded-2xl border-4 shadow-lg overflow-hidden flex items-center justify-center ${previewTheme.panel} ${previewTheme.photoBg}`}>
                                                        {user.photo ? (
                                                            <img src={user.photo} alt={user.name} className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-500" />
                                                        ) : (
                                                            <div className={`w-full h-full flex items-center justify-center text-5xl font-black ${previewTheme.icon}`}>
                                                                {user.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mt-4 flex items-end justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <h3 className={`font-black ${previewTheme.title} text-base leading-tight uppercase truncate`}>{user.name}</h3>
                                                            <p className={`mt-1 text-[10px] font-mono border px-2 py-0.5 rounded-lg inline-block ${previewTheme.badge}`}>
                                                                ID: {user.id.split('-').pop()}
                                                            </p>
                                                        </div>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest ${previewTheme.accentText} shrink-0`}>Tap to View Details</span>
                                                    </div>
                                                </div>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setIdCardVisualMode('cards');
                                                }}
                                                className={`group/meta w-full text-left rounded-3xl overflow-hidden border shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 ${previewTheme.focus} ${previewTheme.shell}`}
                                                title="Show Entrust card preview"
                                            >
                                                <div className={`${previewTheme.header} px-5 py-3 flex items-center justify-between`}>
                                                    <div>
                                                        <p className={`text-[9px] font-black uppercase tracking-[0.25em] ${previewTheme.accentText}`}>City of Truth</p>
                                                        <p className="text-[11px] font-bold text-white uppercase tracking-widest leading-tight">Ministries</p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-2.5 py-1 rounded-full border border-white/30">
                                                        {idCardVisualMode === 'ids' && <Shield size={11} className="text-white" />}
                                                        {idCardVisualMode === 'locations' && <MapPin size={11} className="text-white" />}
                                                        {idCardVisualMode === 'join-dates' && <Calendar size={11} className="text-white" />}
                                                        <span className="text-[10px] font-black text-white uppercase tracking-wider">
                                                            {idCardVisualMode === 'ids' ? 'COT ID' : idCardVisualMode === 'locations' ? 'Location' : 'Since'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-5">
                                                    <div className={`rounded-2xl border-4 shadow-lg min-h-[11rem] flex flex-col items-center justify-center text-center px-5 ${previewTheme.panel}`}>
                                                        {idCardVisualMode === 'ids' && (
                                                            <>
                                                                <Shield size={34} className={`${previewTheme.icon} mb-3`} />
                                                                <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${previewTheme.accentText} mb-2`}>Official COT ID</p>
                                                                <p className={`text-3xl font-black ${previewTheme.title} font-mono tracking-tight`}>{user.id}</p>
                                                            </>
                                                        )}
                                                        {idCardVisualMode === 'locations' && (
                                                            <>
                                                                <MapPin size={34} className={`${previewTheme.icon} mb-3`} />
                                                                <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${previewTheme.accentText} mb-2`}>Member Location</p>
                                                                <p className={`text-3xl font-black ${previewTheme.title} tracking-tight`}>{user.location || 'Unknown'}</p>
                                                            </>
                                                        )}
                                                        {idCardVisualMode === 'join-dates' && (
                                                            <>
                                                                <Calendar size={34} className={`${previewTheme.icon} mb-3`} />
                                                                <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${previewTheme.accentText} mb-2`}>Joined Date</p>
                                                                <p className={`text-3xl font-black ${previewTheme.title} tracking-tight`}>{formatDateValue(user.joinedDate || user.memberSince)}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="mt-4 flex items-end justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <h3 className={`font-black ${previewTheme.title} text-base leading-tight uppercase truncate`}>{user.name}</h3>
                                                            <p className={`mt-1 text-[10px] font-mono border px-2 py-0.5 rounded-lg inline-block ${previewTheme.badge}`}>
                                                                {user.id}
                                                            </p>
                                                        </div>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest ${previewTheme.accentText} shrink-0`}>Tap to View Details</span>
                                                    </div>
                                                </div>
                                            </button>
                                        )}

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
                                    );
                                })}
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
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><ImageIcon size={10}/>Notification Image URL <span className="font-normal text-slate-400">(optional)</span></label>
                                                    <input
                                                        type="text"
                                                        value={bulkAdminImageUrl}
                                                        onChange={(e) => setBulkAdminImageUrl(e.target.value)}
                                                        placeholder="https://…/banner.jpg"
                                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-brand-500 font-semibold"
                                                    />
                                                </div>
                                                <div className="space-y-1 flex flex-col justify-end">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Or Upload</label>
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            id="bulk-image-upload"
                                                            className="hidden"
                                                            disabled={isUploadingBulkImage}
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleNotificationImageUpload(file, 'bulk');
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor="bulk-image-upload"
                                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-colors"
                                                        >
                                                            <UploadCloud size={13} className="text-slate-500" />
                                                            {isUploadingBulkImage ? 'Uploading…' : 'Choose Image'}
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            {bulkAdminImageUrl.trim() && (
                                                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200">
                                                    <img src={bulkAdminImageUrl} alt="preview" className="w-14 h-10 object-cover rounded-lg border border-slate-200 shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                    <span className="text-[10px] text-slate-500 truncate flex-1">{bulkAdminImageUrl}</span>
                                                    <button onClick={() => setBulkAdminImageUrl('')} className="text-red-500 hover:text-red-700 p-0.5 rounded" title="Remove image"><X size={12}/></button>
                                                </div>
                                            )}
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

                {activeTab === 'member-forms' && (
                    <div className="space-y-6">
                        {/* Statistics Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 animate-fade-in">
                            {[
                                { 
                                    label: 'Total Registered Members', 
                                    value: memberFormStats.total, 
                                    icon: Users, 
                                    color: 'from-blue-600 to-indigo-700', 
                                    bg: 'bg-blue-50 text-blue-600',
                                    detail: 'All registered database users'
                                },
                                { 
                                    label: 'Filled Member Forms', 
                                    value: memberFormStats.filled, 
                                    icon: CheckCircle, 
                                    color: 'from-emerald-500 to-teal-600', 
                                    bg: 'bg-emerald-50 text-emerald-600',
                                    detail: 'Completed community profiles'
                                },
                                { 
                                    label: 'Form Completion Rate', 
                                    value: `${memberFormStats.rate}%`, 
                                    icon: Award, 
                                    color: 'from-amber-500 to-orange-600', 
                                    bg: 'bg-amber-50 text-amber-600',
                                    detail: 'Proportion of completed profiles'
                                },
                                { 
                                    label: 'Missing Member Forms', 
                                    value: memberFormStats.missing, 
                                    icon: Clock, 
                                    color: 'from-red-500 to-rose-600', 
                                    bg: 'bg-red-50 text-red-600',
                                    detail: 'Pending profile form completion'
                                },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                                >
                                    <div className="flex items-center justify-between mb-2 md:mb-4 relative z-10">
                                        <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                                            <stat.icon size={20} />
                                        </div>
                                        <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${stat.color}`}></div>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-black text-brand-950 mb-1 relative z-10">{stat.value}</div>
                                    <div className="text-xs md:text-sm text-slate-700 font-bold relative z-10">{stat.label}</div>
                                    <div className="text-[10px] text-slate-400 mt-1 relative z-10">{stat.detail}</div>
                                    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.03] text-brand-950">
                                        <stat.icon size={90} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Split-Screen Layout */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            
                            {/* Left Side: Denomination Category List */}
                            <div className="xl:col-span-1 space-y-4">
                                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                    <h4 className="text-sm font-black text-brand-950 mb-1 uppercase tracking-wider">Denomination Categories</h4>
                                    <p className="text-xs text-slate-500 mb-4">Click a category below to see detailed member lists, stats, and download reports.</p>
                                    
                                    <div className="space-y-3">
                                        {memberFormStats.groups.map(group => {
                                            const isActive = selectedDenominationCategory === group.name;
                                            const isNotFilled = group.name === 'Form Not Filled';
                                            return (
                                                <button
                                                    key={group.name}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedDenominationCategory(group.name);
                                                        setBroadcastSubject('');
                                                        setBroadcastMessage('');
                                                        setBroadcastSuccessList([]);
                                                    }}
                                                    className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2 relative overflow-hidden ${
                                                        isActive 
                                                            ? 'border-brand-500 bg-brand-50/40 shadow-sm ring-1 ring-brand-500' 
                                                            : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-xs font-black uppercase tracking-wide ${
                                                            isActive ? 'text-brand-900' : isNotFilled ? 'text-amber-800' : 'text-slate-800'
                                                        }`}>
                                                            {group.name}
                                                        </span>
                                                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                                                            isActive
                                                                ? 'bg-brand-100 text-brand-850 border-brand-200'
                                                                : isNotFilled
                                                                    ? 'bg-amber-50 text-amber-850 border-amber-100'
                                                                    : 'bg-slate-50 text-slate-700 border-slate-200'
                                                        }`}>
                                                            {group.count} member(s)
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Progress bar showing proportion out of total members */}
                                                    <div className="space-y-1">
                                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full transition-all duration-500 ${
                                                                    isNotFilled ? 'bg-amber-500' : 'bg-brand-600'
                                                                }`}
                                                                style={{ width: `${group.rate}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                                                            <span>{group.count} / {memberFormStats.total} members</span>
                                                            <span>{group.rate}%</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Category Detailed View & Messaging Hub */}
                            <div className="xl:col-span-2 space-y-6">
                                {(() => {
                                    const activeGroup = memberFormStats.groups.find(g => g.name === selectedDenominationCategory) || { name: selectedDenominationCategory, count: 0, rate: 0, members: [] };
                                    const isNotFilled = activeGroup.name === 'Form Not Filled';
                                    
                                    return (
                                        <>
                                            {/* Summary & Download PDF Banner */}
                                            <div className="bg-[#1a1b4b] rounded-3xl border border-[#d4a547]/30 shadow-lg overflow-hidden relative">
                                                <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4a547]">Category Analysis</span>
                                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider border ${
                                                                isNotFilled ? 'bg-amber-950/80 text-amber-400 border-amber-500/30' : 'bg-[#0f766e]/30 text-teal-400 border-teal-500/30'
                                                            }`}>
                                                                {isNotFilled ? 'Form Pending' : 'Forms Completed'}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-xl md:text-2xl font-black text-white">{activeGroup.name}</h3>
                                                        <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                                                            {isNotFilled 
                                                                ? `There are ${activeGroup.count} registered member(s) who have NOT completed their profile registration forms yet (representing ${activeGroup.rate}% of the total ${memberFormStats.total} members).`
                                                                : `There are ${activeGroup.count} member(s) who belong to the '${activeGroup.name}' denomination (representing ${activeGroup.rate}% of the total ${memberFormStats.total} members in the ministry database).`
                                                            }
                                                        </p>
                                                    </div>
                                                    
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDownloadCategoryReportPdf(activeGroup.name, activeGroup.members)}
                                                        disabled={activeGroup.count === 0}
                                                        className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider transition-colors shadow-lg flex items-center gap-2 border border-amber-500 shrink-0 disabled:opacity-50 disabled:pointer-events-none"
                                                    >
                                                        <FileText size={16} />
                                                        Download PDF Report
                                                    </button>
                                                </div>
                                                <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 opacity-5 text-white">
                                                    <FileText size={180} />
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-[#d4a547] to-amber-600"></div>
                                            </div>

                                            {/* Ministry Broadcast Composer */}
                                            {activeGroup.count > 0 && (
                                                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                                                                <MessageSquare size={16} />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-black text-brand-950 uppercase tracking-wider">Announcement Broadcast Hub</h4>
                                                                <p className="text-[10px] text-slate-400">Target announcements dynamically by group</p>
                                                            </div>
                                                        </div>
                                                        <span className="px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-[10px] font-black text-brand-850">
                                                            Sends to {activeGroup.count} member(s)
                                                        </span>
                                                    </div>

                                                    <form onSubmit={(e) => handleBroadcastSubmit(e, activeGroup.name, activeGroup.members)} className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Delivery Channel</label>
                                                                <select
                                                                    value={broadcastType}
                                                                    onChange={(e) => setBroadcastType(e.target.value as any)}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-xs font-semibold"
                                                                >
                                                                    <option value="Email">📧 Email Announcement</option>
                                                                    <option value="SMS">💬 SMS Broadcast</option>
                                                                    <option value="Notification">🔔 App Push Notification</option>
                                                                </select>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Message Subject</label>
                                                                <input
                                                                    type="text"
                                                                    value={broadcastSubject}
                                                                    onChange={(e) => setBroadcastSubject(e.target.value)}
                                                                    placeholder="e.g. Announcement to members"
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-xs font-semibold"
                                                                />
                                                            </div>
                                                        </div>

                                                        {broadcastType === 'Notification' && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                 <div className="space-y-1.5">
                                                                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Notification Image URL (Optional)</label>
                                                                     <input
                                                                         type="text"
                                                                         value={broadcastImageUrl}
                                                                         onChange={(e) => setBroadcastImageUrl(e.target.value)}
                                                                         placeholder="https://example.com/image.jpg"
                                                                         className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-xs font-semibold"
                                                                     />
                                                                 </div>
                                                                 <div className="space-y-1.5 flex flex-col justify-end">
                                                                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Or Upload Image</label>
                                                                     <div className="relative">
                                                                         <input
                                                                             type="file"
                                                                             accept="image/*"
                                                                             onChange={(e) => {
                                                                                 const file = e.target.files?.[0];
                                                                                 if (file) handleNotificationImageUpload(file, 'broadcast');
                                                                             }}
                                                                             className="hidden"
                                                                             id="broadcast-image-upload"
                                                                             disabled={isUploadingBroadcastImage}
                                                                         />
                                                                         <label
                                                                             htmlFor="broadcast-image-upload"
                                                                             className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-colors"
                                                                         >
                                                                             <UploadCloud size={14} className="text-slate-500" />
                                                                             {isUploadingBroadcastImage ? 'Uploading...' : 'Choose Local Image'}
                                                                         </label>
                                                                     </div>
                                                                 </div>
                                                            </div>
                                                        )}

                                                        <div className="space-y-1.5">
                                                            <div className="flex justify-between items-center">
                                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Message Body</label>
                                                                {isNotFilled && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setBroadcastSubject('URGENT: Complete Your Member Form - City of Truth Ministries');
                                                                            setBroadcastMessage('Dear Brother/Sister, Baruch Hashem!\n\nThis is a warm reminder from the City of Truth Ministries Records Department.\n\nPlease log in to your dashboard at http://city-of-truth-ministries.vercel.app/ and complete your Member Form under your profile settings to finalize your record and receive your physical/digital COT ID Card.\n\nThank you and Shalom!\n\nCity of Truth Records Dept.');
                                                                        }}
                                                                        className="text-[9px] font-black text-brand-600 hover:text-brand-800 uppercase tracking-wider"
                                                                    >
                                                                        ✨ Load Reminder Template
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <textarea
                                                                value={broadcastMessage}
                                                                onChange={(e) => setBroadcastMessage(e.target.value)}
                                                                rows={4}
                                                                placeholder="Type your message here..."
                                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-xs font-semibold resize-none"
                                                            />
                                                        </div>

                                                        {isBroadcasting && (
                                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                                                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                                                                    <span className="flex items-center gap-1.5 animate-pulse">
                                                                        ⚡ Dispatching message queue...
                                                                    </span>
                                                                    <span>{broadcastSuccessList.length} / {activeGroup.count} sent</span>
                                                                </div>
                                                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 rounded-full transition-all duration-300"
                                                                        style={{ width: `${Math.round((broadcastSuccessList.length / activeGroup.count) * 100)}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="text-[9px] text-slate-400 font-bold max-h-24 overflow-y-auto space-y-1">
                                                                    {broadcastSuccessList.map((name, idx) => (
                                                                        <div key={idx} className="flex items-center gap-1 text-emerald-600">
                                                                            <Check size={10} /> Sent successfully to: {name}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <button
                                                            type="submit"
                                                            disabled={isBroadcasting || !broadcastSubject.trim() || !broadcastMessage.trim()}
                                                            className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs uppercase tracking-wider transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                                                        >
                                                            {isBroadcasting ? (
                                                                <>🚀 Broadcasting messages...</>
                                                            ) : (
                                                                <>
                                                                    <Send size={14} />
                                                                    Send Targeted Broadcast ({activeGroup.count} members)
                                                                </>
                                                            )}
                                                        </button>
                                                    </form>
                                                </div>
                                            )}

                                            {/* Category Member List Directory Grid */}
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-black text-brand-950 uppercase tracking-wider">Category Member Directory ({activeGroup.count})</h4>
                                                
                                                {activeGroup.count === 0 ? (
                                                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center text-slate-400 space-y-3">
                                                        <Users size={40} className="mx-auto text-slate-300" />
                                                        <p className="text-xs font-semibold">No members match this denomination category.</p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {activeGroup.members.map(user => (
                                                            <div key={user.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 relative overflow-hidden group">
                                                                {/* Photo */}
                                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100 relative shadow-sm">
                                                                    {user.photo ? (
                                                                        <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span className="text-xl font-black text-brand-600">{user.name.charAt(0)}</span>
                                                                    )}
                                                                </div>

                                                                {/* Profile brief */}
                                                                <div className="flex-1 min-w-0 space-y-1">
                                                                    <h5 className="font-black text-brand-950 text-xs truncate uppercase tracking-wider">{user.name}</h5>
                                                                    <p className="text-[10px] text-slate-500 font-mono">{user.id}</p>
                                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-bold">
                                                                            {user.location || 'Unknown'}
                                                                        </span>
                                                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-bold">
                                                                            {user.role}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-col gap-1.5 shrink-0 relative z-10">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setMemberFormPageUser(user);
                                                                            setMemberFormPageParentId(user.parentUserId || user.id);
                                                                        }}
                                                                        className="p-2 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-500 border border-slate-150 transition-colors"
                                                                        title="View/Edit Member Form"
                                                                    >
                                                                        <FileText size={14} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setViewingDetailsUser(user)}
                                                                        className="p-2 rounded-xl bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-500 border border-slate-150 transition-colors"
                                                                        title="View Details"
                                                                    >
                                                                        <Eye size={14} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDownloadMemberFormPdf(user)}
                                                                        disabled={downloadingMemberFormPdfUserId === user.id}
                                                                        className="p-2 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-700 text-slate-500 border border-slate-150 transition-colors disabled:opacity-50"
                                                                        title="Download Member Form PDF"
                                                                    >
                                                                        <Download size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}
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
                {activeTab === 'ministries' && (() => {
                    const uniqueMediaMonths = Array.from(new Set(
                        ministries
                            .map(m => m.date ? m.date.substring(0, 7) : '')
                            .filter(Boolean)
                    )).sort().reverse();

                    const filteredMinistries = ministries.filter((m) => {
                        const mediaType = inferMinistryMediaType(m);
                        if (mediaTypeFilter !== 'all' && mediaType !== mediaTypeFilter) return false;
                        if (mediaMonthFilter !== 'all') {
                            if (!m.date) return false;
                            const itemMonth = m.date.substring(0, 7);
                            if (itemMonth !== mediaMonthFilter) return false;
                        }
                        return true;
                    }).sort((a, b) => {
                        const dateA = a.date ? new Date(a.date).getTime() : 0;
                        const dateB = b.date ? new Date(b.date).getTime() : 0;
                        return mediaSortOrder === 'newest' ? dateB - dateA : dateA - dateB;
                    });

                    const isFiltered = mediaTypeFilter !== 'all' || mediaMonthFilter !== 'all';

                    return (
                        <div className="space-y-8">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-black text-brand-950 tracking-tight">Tab TV + Ministry Gallery</h2>
                                    <p className="text-xs text-slate-500 mt-1 font-medium">Control the visual moments shown in the Ministry TV media center.</p>
                                    <div className="flex items-center gap-2 mt-3.5 flex-wrap">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/50 text-brand-700 text-[10px] font-black uppercase tracking-wider shadow-sm select-none">
                                            📊 Total: {ministries.length} {isFiltered && `(${filteredMinistries.length} shown)`}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/50 text-amber-700 text-[10px] font-black uppercase tracking-wider shadow-sm select-none">
                                            📸 Images: {ministries.filter(m => inferMinistryMediaType(m) === 'image').length}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/50 text-indigo-700 text-[10px] font-black uppercase tracking-wider shadow-sm select-none">
                                            🎥 Videos: {ministries.filter(m => inferMinistryMediaType(m) === 'video').length}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {hasOrderChanges && !isFiltered && (
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
                                    <motion.label
                                        whileHover={{ 
                                            scale: 1.05, 
                                            y: -2,
                                            boxShadow: '0 20px 25px -5px rgba(217, 119, 6, 0.4), 0 10px 10px -5px rgba(217, 119, 6, 0.3)' 
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                        className="flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-500 hover:via-yellow-500 hover:to-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer shadow-xl shadow-amber-600/20 border border-yellow-500/30 select-none group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                                        <ImagePlus size={20} className="group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 text-yellow-100" />
                                        <span>Upload Media</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*,video/*"
                                            multiple
                                            onChange={handleMinistryMediaUpload}
                                        />
                                    </motion.label>
                                </div>
                            </div>

                            {/* Filters row */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">Filter:</span>
                                    {[
                                        { id: 'all', label: 'All Media 🌐' },
                                        { id: 'image', label: 'Images 📸' },
                                        { id: 'video', label: 'Videos 🎥' }
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setMediaTypeFilter(type.id as any)}
                                            className={`px-4 py-2 rounded-full font-bold text-xs transition-all ${
                                                mediaTypeFilter === type.id
                                                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/10'
                                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                            }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Sort:</span>
                                        <select
                                            value={mediaSortOrder}
                                            onChange={(e) => setMediaSortOrder(e.target.value as any)}
                                            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-brand-500 cursor-pointer"
                                        >
                                            <option value="newest">Newest First ⬇️</option>
                                            <option value="oldest">Oldest First ⬆️</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Month:</span>
                                        <select
                                            value={mediaMonthFilter}
                                            onChange={(e) => setMediaMonthFilter(e.target.value)}
                                            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-brand-500 cursor-pointer"
                                        >
                                            <option value="all">All Months 📅</option>
                                            {uniqueMediaMonths.map((mMonth) => {
                                                const [yr, mn] = (mMonth as string).split('-');
                                                const monthName = new Date(parseInt(yr, 10), parseInt(mn, 10) - 1, 1).toLocaleString('en-US', { month: 'long' });
                                                return (
                                                    <option key={mMonth} value={mMonth}>{`${monthName} ${yr}`}</option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Notice if dragging is disabled */}
                            {isFiltered && (
                                <div className="rounded-2xl bg-brand-50/50 border border-brand-100 px-4 py-3 flex items-center gap-2.5 text-xs text-brand-700 font-bold">
                                    <Sparkles size={14} className="animate-pulse" />
                                    ℹ️ Drag-and-drop ordering is disabled while file type or month filters are active.
                                </div>
                            )}

                            <Reorder.Group
                                axis="y"
                                values={filteredMinistries}
                                onReorder={(newOrder) => {
                                    if (isFiltered) return; // Disable reordering if active filters
                                    setMinistries(newOrder);
                                    setHasOrderChanges(true);
                                }}
                                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8"
                            >
                                {filteredMinistries.map((m) => {
                                    const mediaType = inferMinistryMediaType(m);
                                    const isHidden = !!m.hidden;
                                    const categoryLabel = (m.category || '').trim();
                                    const durationLabel = (m.duration || '').trim();
                                    return (
                                        <Reorder.Item
                                            key={m.id}
                                            value={m}
                                            dragListener={!isFiltered}
                                            dragControls={undefined}
                                            className={`group relative aspect-square rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-white border border-slate-100 shadow-sm ${!isFiltered ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} hover:shadow-2xl transition-all duration-700 ${isHidden ? 'opacity-60' : ''}`}
                                        >
                                            {m.image && !failedMinistryImages[m.id] ? (
                                                mediaType === 'video' ? (
                                                    <video
                                                        src={m.image}
                                                        className="w-full h-full object-cover"
                                                        muted
                                                        loop
                                                        playsInline
                                                        autoPlay
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

                                            {/* Gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                                            {/* Action Overlay */}
                                            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all md:translate-x-4 md:group-hover:translate-x-0 duration-300 z-20">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setEditingMinistry(m); }}
                                                    className="w-10 h-10 bg-white/15 backdrop-blur-xl border border-white/25 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-brand-950 transition-all shadow-lg"
                                                    title="Edit Details"
                                                >
                                                    <Camera size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleMinistryVisibility(m); }}
                                                    className={`w-10 h-10 backdrop-blur-xl border rounded-full flex items-center justify-center transition-all shadow-lg ${
                                                        isHidden 
                                                            ? 'bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500 hover:text-white' 
                                                            : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 hover:text-white'
                                                    }`}
                                                    title={isHidden ? 'Make Visible' : 'Hide Page'}
                                                >
                                                    {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteMinistry(m.id); }}
                                                    className="w-10 h-10 bg-red-400/10 backdrop-blur-xl border border-red-400/20 rounded-full flex items-center justify-center text-red-100 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="absolute top-4 left-16 flex flex-col gap-2 z-20">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-white/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                                    {mediaType === 'video' ? <Video size={12} /> : <ImageIcon size={12} />}
                                                    {mediaType}
                                                </span>
                                                {durationLabel && mediaType === 'video' && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-950/70 border border-white/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                                        <Clock size={12} /> {durationLabel}
                                                    </span>
                                                )}
                                                {categoryLabel && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-white/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                                        <Tag size={12} /> {categoryLabel}
                                                    </span>
                                                )}
                                                {isHidden && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/70 border border-white/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                                        <EyeOff size={12} /> Hidden
                                                    </span>
                                                )}
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
                                            {!isFiltered && (
                                                <div className="absolute top-4 left-4 w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all border border-white/20 hover:bg-white hover:text-brand-950 shadow-lg cursor-grab active:cursor-grabbing z-20">
                                                    <GripVertical size={18} />
                                                </div>
                                            )}

                                            <div className="absolute inset-0 border-2 border-transparent group-active:border-accent-500/50 rounded-2xl md:rounded-[2.5rem] transition-colors" />
                                        </Reorder.Item>
                                    );
                                })}
                            </Reorder.Group>

                            {filteredMinistries.length === 0 && (
                                <div className="text-center py-32 bg-slate-50 rounded-[3.5rem] border-2 border-dashed border-slate-200">
                                    <ImageIcon size={48} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-400 font-medium">No moments match your current filter selection. Clear filters or add new moments!</p>
                                </div>
                            )}
                        </div>
                    );
                })()}

                {activeTab === 'home-layout' && (() => {
                    return (
                    <div className="w-full max-w-[100vw] -mx-6 md:-mx-8 px-2 md:px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-lg overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-brand-900 to-brand-700 px-4 md:px-8 py-5">
                                <div>
                                    <h2 className="text-xl md:text-3xl font-serif font-black text-white">Live Website Mini View (Home Sections)</h2>
                                    <p className="text-brand-100 text-xs md:text-sm mt-1 font-medium">Drag to reorder · customize titles · see live mini-preview</p>
                                </div>
                            </div>

                            {/* Split View */}
                            <div className="flex flex-col lg:flex-row min-h-[70vh]">
                                {/* LEFT — Drag editor */}
                                <div className="w-full lg:w-1/2 bg-slate-50 overflow-y-auto p-4 md:p-6">
                                    <Reorder.Group
                                        axis="y"
                                        values={homeSectionsOrder}
                                        onReorder={(newOrder) => {
                                            console.log('Sections reordered:', newOrder);
                                            onUpdateHomeSectionsOrder(newOrder);
                                            
                                            // Communicate with live website iframe
                                            setTimeout(() => {
                                                const iframe = document.getElementById('home-website-preview') as HTMLIFrameElement;
                                                if (iframe && iframe.contentWindow) {
                                                    try {
                                                        iframe.contentWindow.postMessage({
                                                            action: 'update-sections-order',
                                                            order: newOrder,
                                                            source: 'admin-dashboard'
                                                        }, '*');
                                                        console.log('Sent sections order to iframe:', newOrder);
                                                    } catch (error) {
                                                        console.log('Could not communicate with iframe:', error);
                                                    }
                                                }
                                            }, 100);
                                        }}
                                        className="space-y-4"
                                    >
                                        {homeSectionsOrder.map((sectionId, index) => {
                                            const info = HOME_SECTIONS_INFO[sectionId] || { name: 'Unknown', desc: '', icon: Globe, color: 'bg-gray-500' };
                                            const IconComponent = info.icon;
                                            const canMoveUp = index > 0;
                                            const canMoveDown = index < homeSectionsOrder.length - 1;

                                            return (
                                                <Reorder.Item
                                                    key={sectionId}
                                                    value={sectionId}
                                                    whileDrag={{ scale: 1.02, boxShadow: '0 10px 30px -5px rgba(0,0,0,0.18)' }}
                                                    className={`rounded-2xl border-2 hover:border-blue-400 hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                                                        sectionsInfo[sectionId]?.hidden 
                                                            ? 'bg-slate-100 border-slate-300 opacity-60' 
                                                            : 'bg-white border-slate-200'
                                                    }`}
                                                >
                                                    <div className="p-4 flex items-center gap-4">
                                                        <div className="text-slate-300 hover:text-brand-500 transition-colors shrink-0">
                                                            <GripVertical size={22} />
                                                        </div>
                                                        <div className={`w-12 h-12 ${info.color} text-white rounded-2xl flex items-center justify-center shadow-md`}>
                                                            <IconComponent size={24} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-black text-brand-950 text-sm uppercase tracking-wider">
                                                                    {sectionsInfo[sectionId]?.name || info.name}
                                                                </h3>
                                                                {sectionsInfo[sectionId]?.hidden && (
                                                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-wider rounded-full border border-amber-200">
                                                                        Hidden
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                                                                {sectionsInfo[sectionId]?.desc || info.desc}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <button
                                                                onClick={() => {
                                                                    if (canMoveUp) {
                                                                        const newOrder = [...homeSectionsOrder];
                                                                        [newOrder[index-1], newOrder[index]] = [newOrder[index], newOrder[index-1]];
                                                                        onUpdateHomeSectionsOrder(newOrder);
                                                                        
                                                                        // Communicate with live website iframe
                                                                        setTimeout(() => {
                                                                            const iframe = document.getElementById('home-website-preview') as HTMLIFrameElement;
                                                                            if (iframe && iframe.contentWindow) {
                                                                                try {
                                                                                    iframe.contentWindow.postMessage({
                                                                                        action: 'update-sections-order',
                                                                                        order: newOrder,
                                                                                        source: 'admin-dashboard'
                                                                                    }, '*');
                                                                                    console.log('Moved section up, updated iframe:', sectionId);
                                                                                } catch (error) {
                                                                                    console.log('Could not communicate with iframe:', error);
                                                                                }
                                                                            }
                                                                        }, 100);
                                                                    }
                                                                }}
                                                                disabled={!canMoveUp}
                                                                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                                                                    canMoveUp 
                                                                        ? 'bg-slate-100 border-slate-200 hover:bg-blue-500 hover:text-white hover:border-blue-500 text-slate-600' 
                                                                        : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                                                }`}
                                                                title="Move up"
                                                                aria-label="Move up"
                                                            >
                                                                <ChevronUp size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (canMoveDown) {
                                                                        const newOrder = [...homeSectionsOrder];
                                                                        [newOrder[index], newOrder[index+1]] = [newOrder[index+1], newOrder[index]];
                                                                        onUpdateHomeSectionsOrder(newOrder);
                                                                        
                                                                        // Communicate with live website iframe
                                                                        setTimeout(() => {
                                                                            const iframe = document.getElementById('home-website-preview') as HTMLIFrameElement;
                                                                            if (iframe && iframe.contentWindow) {
                                                                                try {
                                                                                    iframe.contentWindow.postMessage({
                                                                                        action: 'update-sections-order',
                                                                                        order: newOrder,
                                                                                        source: 'admin-dashboard'
                                                                                    }, '*');
                                                                                    console.log('Moved section down, updated iframe:', sectionId);
                                                                                } catch (error) {
                                                                                    console.log('Could not communicate with iframe:', error);
                                                                                }
                                                                            }
                                                                        }, 100);
                                                                    }
                                                                }}
                                                                disabled={!canMoveDown}
                                                                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                                                                    canMoveDown 
                                                                        ? 'bg-slate-100 border-slate-200 hover:bg-blue-500 hover:text-white hover:border-blue-500 text-slate-600' 
                                                                        : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                                                }`}
                                                                title="Move down"
                                                                aria-label="Move down"
                                                            >
                                                                <ChevronDown size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    // Toggle section visibility/hide
                                                                    const currentInfo = sectionsInfo[sectionId] || {};
                                                                    const isHidden = currentInfo.hidden || false;
                                                                    handleSaveSectionInfo(
                                                                        sectionId, 
                                                                        currentInfo.name || '', 
                                                                        currentInfo.desc || '',
                                                                        !isHidden
                                                                    );
                                                                }}
                                                                className="w-8 h-8 rounded-lg border-2 bg-slate-100 border-slate-200 hover:bg-amber-500 hover:text-white hover:border-amber-500 text-slate-600 flex items-center justify-center transition-all"
                                                                title={sectionsInfo[sectionId]?.hidden ? "Show section" : "Hide section"}
                                                                aria-label={sectionsInfo[sectionId]?.hidden ? "Show section" : "Hide section"}
                                                            >
                                                                {sectionsInfo[sectionId]?.hidden ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Are you sure you want to delete the "${sectionsInfo[sectionId]?.name || info.name}" section from the home page?`)) {
                                                                        const newOrder = homeSectionsOrder.filter(id => id !== sectionId);
                                                                        onUpdateHomeSectionsOrder(newOrder);
                                                                        
                                                                        // Communicate with iframe
                                                                        setTimeout(() => {
                                                                            const iframe = document.getElementById('home-website-preview') as HTMLIFrameElement;
                                                                            if (iframe && iframe.contentWindow) {
                                                                                try {
                                                                                    iframe.contentWindow.postMessage({
                                                                                        action: 'update-sections-order',
                                                                                        order: newOrder,
                                                                                        source: 'admin-dashboard'
                                                                                    }, '*');
                                                                                } catch (error) {
                                                                                    console.log('Could not communicate with iframe:', error);
                                                                                }
                                                                            }
                                                                        }, 100);
                                                                    }
                                                                }}
                                                                className="w-8 h-8 rounded-lg border-2 bg-slate-100 border-slate-200 hover:bg-red-500 hover:text-white hover:border-red-500 text-slate-600 flex items-center justify-center transition-all"
                                                                title="Delete section"
                                                                aria-label="Delete section"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div 
                                                        className="bg-slate-50/50 p-4 rounded-[1.5rem] border border-slate-100/80 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4"
                                                        onPointerDown={(e) => e.stopPropagation()}
                                                    >
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase tracking-[1.5px] text-slate-400">Section Title</label>
                                                            <input
                                                                type="text"
                                                                value={sectionsInfo[sectionId]?.name || ''}
                                                                onChange={(e) => handleSaveSectionInfo(sectionId, e.target.value, sectionsInfo[sectionId]?.desc || '')}
                                                                placeholder="Customize section title..."
                                                                className="w-full bg-white px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-brand-500 mt-1.5 transition-colors"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase tracking-[1.5px] text-slate-400">Section Subtitle / Description</label>
                                                            <input
                                                                type="text"
                                                                value={sectionsInfo[sectionId]?.desc || ''}
                                                                onChange={(e) => handleSaveSectionInfo(sectionId, sectionsInfo[sectionId]?.name || '', e.target.value)}
                                                                placeholder="Customize section description..."
                                                                className="w-full bg-white px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-brand-500 mt-1.5 transition-colors"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Live Real-Time Visual Preview */}
                                                    <div 
                                                        className="bg-slate-50/30 p-4 rounded-[1.5rem] border border-slate-100/60 relative z-10"
                                                        onPointerDown={(e) => e.stopPropagation()}
                                                    >
                                                        <label className="text-[10px] font-black uppercase tracking-[1.5px] text-slate-400 mb-2 block">✨ Real-Time Visual Preview</label>
                                                        <SectionMiniPreview 
                                                            sectionId={sectionId}
                                                            customName={sectionsInfo[sectionId]?.name || info.name}
                                                            customDesc={sectionsInfo[sectionId]?.desc || info.desc}
                                                        />
                                                    </div>
                                                </Reorder.Item>
                                            );
                                        })}
                                    </Reorder.Group>
                                </div>

                                {/* RIGHT — Live Website Preview */}
                                <div className="w-full lg:w-1/2 bg-slate-100 border-t lg:border-t-0 lg:border-l border-slate-200 overflow-hidden flex flex-col">
                                    <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-2.5 z-10 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Live Website Mini View</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setWebsiteUrl(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? window.location.origin : 'http://localhost:8888')}
                                                className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1 ${websiteUrl.includes('localhost') ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                                            >
                                                <Globe size={10}/>
                                                Localhost
                                            </button>
                                            <button
                                                onClick={() => setWebsiteUrl('https://city-of-truth-ministries.vercel.app')}
                                                className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1 ${websiteUrl.includes('vercel.app') || websiteUrl.includes('web.app') ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                            >
                                                <Globe size={10}/>
                                                Live Site
                                            </button>
                                            <a 
                                                href={websiteUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1"
                                                title="Open in new tab"
                                            >
                                                <ExternalLink size={10}/>
                                                New Tab
                                            </a>
                                        </div>
                                    </div>
 
                                    {/* Live Website Frame */}
                                    <div className="flex-1 p-4">
                                        <div className="bg-white rounded-xl shadow-lg border border-slate-300 overflow-hidden h-full min-h-[600px]">
                                            {/* Website URL Bar */}
                                            <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-2">
                                                <div className="flex gap-1.5">
                                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                                </div>
                                                <div className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1 text-[10px] text-slate-600 font-mono">
                                                    🌐 {websiteUrl.includes('localhost') ? 'localhost:8888' : 'city-of-truth-ministries.vercel.app'} / Home Sections Preview
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const iframe = document.getElementById('home-website-preview') as HTMLIFrameElement;
                                                        if (iframe) {
                                                            iframe.src = websiteUrl + (websiteUrl.includes('?') ? '&' : '?') + 'preview=true&t=' + Date.now();
                                                            console.log('Refreshing home sections preview:', websiteUrl);
                                                        }
                                                    }}
                                                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                                    title="Refresh website"
                                                >
                                                    <RotateCcw size={12} className="text-slate-600"/>
                                                </button>
                                            </div>
                                            
                                            {/* Website Iframe */}
                                            <div className="h-full bg-white relative">
                                                <iframe
                                                    id="home-website-preview"
                                                    src={websiteUrl + (websiteUrl.includes('?') ? '&' : '?') + 'preview=true'}
                                                    className="w-full h-full border-0 min-h-[550px]"
                                                    title="Live Home Sections Preview"
                                                    onLoad={(e) => {
                                                        console.log('Home sections website loaded:', websiteUrl);
                                                        const iframe = e.target as HTMLIFrameElement;
                                                        
                                                        // Send current sections order to iframe
                                                        try {
                                                            iframe.contentWindow?.postMessage({
                                                                action: 'update-sections-order',
                                                                order: homeSectionsOrder,
                                                                source: 'admin-dashboard'
                                                            }, '*');
                                                        } catch (error) {
                                                            console.log('Cross-origin communication limited:', error);
                                                        }
                                                    }}
                                                    onError={(e) => {
                                                        console.log('Home iframe loading error, trying fallback...', e);
                                                        const iframe = e.target as HTMLIFrameElement;
                                                        if (iframe.src.includes('localhost')) {
                                                            console.log('Switching to live site due to localhost error');
                                                            setWebsiteUrl('https://city-of-truth-ministries.web.app');
                                                        }
                                                    }}
                                                />
                                                
                                                {/* Loading overlay */}
                                                <div className="absolute inset-0 bg-white flex items-center justify-center opacity-0 transition-opacity pointer-events-none" id="home-iframe-loading">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <RotateCcw size={16} className="animate-spin"/>
                                                        <span className="text-sm font-medium">Loading home sections...</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Section Navigation */}
                                    <div className="p-4 border-t border-slate-200 bg-slate-50">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-3">🏠 Quick Section Navigation</p>
                                        <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                                            {homeSectionsOrder.map((sectionId, index) => {
                                                const info = HOME_SECTIONS_INFO[sectionId] || { name: 'Unknown', desc: '', icon: Globe, color: 'bg-gray-500' };
                                                const IconComponent = info.icon;
                                                return (
                                                    <button
                                                        key={`nav-${sectionId}-${index}`}
                                                        onClick={() => {
                                                            const iframe = document.getElementById('home-website-preview') as HTMLIFrameElement;
                                                            if (iframe && iframe.contentWindow) {
                                                                try {
                                                                    iframe.contentWindow.postMessage({
                                                                        action: 'scroll-to-section',
                                                                        sectionId: sectionId,
                                                                        index: index
                                                                    }, '*');
                                                                } catch (e) {
                                                                    console.log('Section navigation failed:', e);
                                                                }
                                                            }
                                                        }}
                                                        className="flex items-center gap-2 px-3 py-2 text-[8px] font-bold uppercase tracking-wider bg-white border border-slate-200 rounded-lg hover:bg-brand-50 hover:border-brand-300 transition-all group"
                                                    >
                                                        <div className={`w-4 h-4 ${info.color} text-white rounded-md flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                            <IconComponent size={10} />
                                                        </div>
                                                        <span className="flex-1 text-left truncate">
                                                            {sectionsInfo[sectionId]?.name || info.name}
                                                        </span>
                                                        <span className="text-slate-400 group-hover:text-brand-500">#{index + 1}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                );
                })()}

                {activeTab === 'menu-editor' && (() => {
                    try {
                        /* ── Import exact Hebrew structure from BottomNav ── */
                        const HEBREW_RESOURCE_ITEMS = HEBREW_PAGES.filter(p => p.type === 'content' && !p.isStandalone).map(p => ({
                            id: p.id,
                            label: p.shortLabel || p.label,
                            view: p.view,
                            iconName: p.iconName
                        }));

                        const HEBREW_TOOL_ITEMS = HEBREW_PAGES.filter(p => p.type === 'tools').map(p => ({
                            id: p.id,
                            label: p.shortLabel || p.label,
                            view: p.view,
                            iconName: p.iconName
                        }));
                    
                    /* ── helpers ── */
                    const getItems = (): any[] => {
                        if (!navItems) return [];
                        if (selectedMenuEditTab === 'main') return navItems;
                        if (selectedMenuEditTab === 'hebrew-content') {
                            const hebrewItem = navItems.find((i: any) => ['HEBREW RESOURCES','HEBREW CONTENT','HEBREW'].includes(i.label));
                            return hebrewItem?.submenu || HEBREW_RESOURCE_ITEMS;
                        }
                        if (selectedMenuEditTab === 'hebrew-tools') {
                            const toolsItem = navItems.find((i: any) => i.label === 'HEBREW TOOLS');
                            return toolsItem?.submenu || HEBREW_TOOL_ITEMS;
                        }
                        return [];
                    };
                    const saveItems = (next: any[]) => {
                        if (!onUpdateNavItems || !navItems) return;
                        if (selectedMenuEditTab === 'main') { onUpdateNavItems(next); return; }
                        if (selectedMenuEditTab === 'hebrew-content') {
                            onUpdateNavItems(navItems.map((i: any) => ['HEBREW RESOURCES','HEBREW CONTENT','HEBREW'].includes(i.label) ? { ...i, submenu: next } : i));
                            return;
                        }
                        if (selectedMenuEditTab === 'hebrew-tools') {
                            onUpdateNavItems(navItems.map((i: any) => i.label === 'HEBREW TOOLS' ? { ...i, submenu: next } : i));
                        }
                    };
                    const rename = (idx: number, val: string) => saveItems(getItems().map((x: any, i: number) => i === idx ? { ...x, label: val } : x));
                    const toggle = (idx: number) => saveItems(getItems().map((x: any, i: number) => i === idx ? { ...x, hidden: !x.hidden } : x));
                    const remove = (idx: number) => {
                        const a = getItems();
                        if (!window.confirm(`Delete "${a[idx]?.label || 'item'}"?`)) return;
                        saveItems(a.filter((_: any, i: number) => i !== idx));
                    };
                    const moveUp = (idx: number) => { if (idx <= 0) return; const a = [...getItems()]; [a[idx-1],a[idx]]=[a[idx],a[idx-1]]; saveItems(a); };
                    const moveDown = (idx: number) => { const a = [...getItems()]; if (idx >= a.length-1) return; [a[idx],a[idx+1]]=[a[idx+1],a[idx]]; saveItems(a); };
                    
                    /* ── NEW: Make Separate / Make Submenu Functions ── */
                    const makeSeparate = (idx: number) => {
                        if (!onUpdateNavItems || !navItems) return;
                        const currentItems = getItems();
                        const itemToMove = currentItems[idx];
                        if (!itemToMove) return;
                        
                        if (window.confirm(`Make "${itemToMove.label}" a separate main menu item?`)) {
                            // Remove from current submenu
                            const remainingSubmenuItems = currentItems.filter((_: any, i: number) => i !== idx);
                            
                            // Add to main menu
                            const newMainItem = { ...itemToMove, submenu: [] };
                            const updatedNavItems = [...navItems, newMainItem];
                            
                            // Update the submenu we're removing from
                            if (selectedMenuEditTab === 'hebrew-content') {
                                const updatedWithSubmenu = updatedNavItems.map((i: any) => 
                                    ['HEBREW RESOURCES','HEBREW CONTENT','HEBREW'].includes(i.label) 
                                        ? { ...i, submenu: remainingSubmenuItems } 
                                        : i
                                );
                                onUpdateNavItems(updatedWithSubmenu);
                            } else if (selectedMenuEditTab === 'hebrew-tools') {
                                const updatedWithSubmenu = updatedNavItems.map((i: any) => 
                                    i.label === 'HEBREW TOOLS' 
                                        ? { ...i, submenu: remainingSubmenuItems } 
                                        : i
                                );
                                onUpdateNavItems(updatedWithSubmenu);
                            }
                        }
                    };
                    
                    const makeSubmenu = (idx: number) => {
                        if (!onUpdateNavItems || !navItems) return;
                        const currentItems = getItems();
                        const itemToMove = currentItems[idx];
                        if (!itemToMove) return;
                        
                        // Show dialog to choose which submenu to add to
                        const targetSubmenu = window.prompt(
                            `Move "${itemToMove.label}" to which submenu?\n\n` +
                            'Options:\n' +
                            '1. hebrew-content (Hebrew Resources)\n' +
                            '2. hebrew-tools (Hebrew Tools)\n\n' +
                            'Enter 1 or 2:'
                        );
                        
                        if (targetSubmenu === '1' || targetSubmenu === '2') {
                            // Remove from main menu
                            const remainingMainItems = currentItems.filter((_: any, i: number) => i !== idx);
                            
                            // Add to chosen submenu
                            const targetLabel = targetSubmenu === '1' ? 'HEBREW RESOURCES' : 'HEBREW TOOLS';
                            const updatedNavItems = remainingMainItems.map((item: any) => {
                                if (['HEBREW RESOURCES','HEBREW CONTENT','HEBREW'].includes(item.label) && targetSubmenu === '1') {
                                    return { ...item, submenu: [...(item.submenu || []), itemToMove] };
                                } else if (item.label === 'HEBREW TOOLS' && targetSubmenu === '2') {
                                    return { ...item, submenu: [...(item.submenu || []), itemToMove] };
                                }
                                return item;
                            });
                            
                            onUpdateNavItems(updatedNavItems);
                        }
                    };
                    const items2 = getItems();

                    const getBNavIconComponent = (iconName: string) => {
                        switch (iconName) {
                            case 'israel': return Globe;
                            case 'festivals': return Flame;
                            case 'calendar': return Calendar;
                            case 'clock': return Clock3;
                            case 'reference': return BookOpen;
                            case 'grammar': return Languages;
                            case 'alphabet': return BookOpen;
                            case 'words': return Type;
                            case 'lettersaudio': return Volume2;
                            case 'numbers': return Hash;
                            case 'gematria': return Calculator;
                            default: return BookOpen;
                        }
                    };

                    /* ── Live Website State ── */
                    // Moved to main component scope - using websiteUrl from parent
                    return (
                      <div className="w-full max-w-[100vw] -mx-6 md:-mx-8 px-2 md:px-4">
                        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                          className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
                          {/* Header */}
                          <div className="bg-gradient-to-r from-brand-900 to-brand-700 px-4 md:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div>
                              <h2 className="text-xl md:text-3xl font-serif font-black text-white">Navigation Menu Editor</h2>
                              <p className="text-brand-100 text-xs md:text-sm mt-1 font-medium">Drag to reorder · rename inline · toggle visibility · make separate/submenu</p>
                            </div>
                            <div className="flex gap-1 bg-white/10 p-1 rounded-xl border border-white/20">
                              {[{id:'main',label:'Main'},{id:'hebrew-content',label:'Hebrew ▾'},{id:'hebrew-tools',label:'Tools ▾'}].map(tab => (
                                <button key={tab.id} onClick={() => setSelectedMenuEditTab(tab.id as any)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${selectedMenuEditTab===tab.id?'bg-white text-brand-700 shadow-sm':'text-white/70 hover:text-white hover:bg-white/10'}`}>
                                  {tab.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          {/* Split View */}
                          <div className="flex flex-col lg:flex-row min-h-[70vh]">
                            {/* LEFT — Drag editor */}
                            <div className="w-full lg:w-1/2 bg-slate-50 overflow-y-auto p-4 md:p-6">
                              <Reorder.Group axis="y" values={items2} onReorder={saveItems} className="space-y-2.5">
                                {items2.map((item: any, idx: number) => (
                                  <Reorder.Item key={`${item.view||item.label}-${idx}`} value={item}
                                    whileDrag={{ scale:1.02, boxShadow:'0 10px 30px -5px rgba(0,0,0,0.18)' }}
                                    className={`bg-white rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing select-none ${item.hidden?'opacity-50 border-slate-200':'border-slate-200 hover:border-blue-400 hover:shadow-md'}`}>
                                    <div className="flex items-center gap-2.5 p-3">
                                      <GripVertical size={18} className="text-slate-300 shrink-0"/>
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0 ${item.hidden?'bg-slate-400':'bg-blue-600'}`}>
                                        {(item.label||'?').charAt(0)}
                                      </div>
                                      <div className="flex-1 min-w-0" onPointerDown={e=>e.stopPropagation()}>
                                        <input type="text" value={item.label} onChange={e=>rename(idx,e.target.value)}
                                          className="w-full font-black text-[#1a1a2e] text-[11px] uppercase tracking-wide bg-transparent border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-blue-500 focus:bg-white transition-colors"/>
                                        {selectedMenuEditTab==='main' && item.submenu && item.submenu.length>0 && (
                                          <p className="text-[9px] text-slate-400 mt-0.5 truncate flex items-center gap-1">
                                            <ChevronDown size={10} className="text-blue-500"/>
                                            <span className="text-blue-500 font-bold">HAS SUBMENU:</span>
                                            {item.submenu.map((s:any)=>s.label).join(' · ')}
                                          </p>
                                        )}
                                        {selectedMenuEditTab!=='main' && (
                                          <p className="text-[9px] text-amber-500 mt-0.5 flex items-center gap-1">
                                            <ChevronUp size={10}/>
                                            <span className="font-bold">SUBMENU ITEM</span>
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0" onPointerDown={e=>e.stopPropagation()}>
                                        <button type="button" onClick={e=>{e.stopPropagation();toggle(idx);}}
                                          className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all ${item.hidden?'bg-red-50 border-red-200 text-red-500':'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                                          {item.hidden?<EyeOff size={13}/>:<Eye size={13}/>}
                                        </button>
                                        <button type="button" onClick={e=>{e.stopPropagation();moveUp(idx);}} disabled={idx<=0}
                                          className="w-7 h-7 rounded-lg bg-slate-100 border-2 border-slate-200 flex items-center justify-center hover:bg-blue-500 hover:text-white hover:border-blue-500 disabled:opacity-25 transition-all">
                                          <ChevronUp size={13}/>
                                        </button>
                                        <button type="button" onClick={e=>{e.stopPropagation();moveDown(idx);}} disabled={idx>=items2.length-1}
                                          className="w-7 h-7 rounded-lg bg-slate-100 border-2 border-slate-200 flex items-center justify-center hover:bg-blue-500 hover:text-white hover:border-blue-500 disabled:opacity-25 transition-all">
                                          <ChevronDown size={13}/>
                                        </button>
                                        <button type="button" onClick={e=>{e.stopPropagation();remove(idx);}}
                                          className="w-7 h-7 rounded-lg bg-red-50 border-2 border-red-200 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all">
                                          <Trash2 size={12}/>
                                        </button>
                                        {/* NEW: Make Separate / Make Submenu buttons */}
                                        {selectedMenuEditTab === 'main' ? (
                                          <button type="button" onClick={e=>{e.stopPropagation();makeSubmenu(idx);}}
                                            className="w-7 h-7 rounded-lg bg-purple-50 border-2 border-purple-200 text-purple-500 flex items-center justify-center hover:bg-purple-100 transition-all"
                                            title="Convert to submenu item">
                                            <ChevronDown size={12}/>
                                          </button>
                                        ) : (
                                          <button type="button" onClick={e=>{e.stopPropagation();makeSeparate(idx);}}
                                            className="w-7 h-7 rounded-lg bg-green-50 border-2 border-green-200 text-green-500 flex items-center justify-center hover:bg-green-100 transition-all"
                                            title="Make separate main menu item">
                                            <ChevronUp size={12}/>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </Reorder.Item>
                                ))}
                              </Reorder.Group>
                              {items2.length === 0 && (
                                <div className="text-center py-16 text-slate-400">
                                  <Filter size={36} className="mx-auto mb-3 opacity-30" />
                                  <p className="text-sm font-medium">No items.</p>
                                </div>
                              )}
                              
                              {/* NEW: Add Item Button */}
                              <div className="mt-6 pt-4 border-t border-slate-200">
                                <button 
                                  onClick={() => {
                                    const newLabel = window.prompt('Enter new menu item label:');
                                    if (newLabel && newLabel.trim()) {
                                      const newItem = {
                                        label: newLabel.trim(),
                                        view: `CUSTOM_${Date.now()}`,
                                        hidden: false,
                                        submenu: []
                                      };
                                      saveItems([...getItems(), newItem]);
                                    }
                                  }}
                                  className="w-full p-3 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl text-slate-500 hover:text-blue-600 font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 hover:bg-blue-50"
                                >
                                  <Plus size={16}/>
                                  Add New {selectedMenuEditTab==='main' ? 'Menu' : selectedMenuEditTab.replace('-',' ')} Item
                                </button>
                              </div>
                            </div>
                            {/* RIGHT — Live Website Mini View */}
                            <div className="w-full lg:w-1/2 bg-slate-100 border-t lg:border-t-0 lg:border-l border-slate-200 overflow-hidden flex flex-col">
                              <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-2.5 z-10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Live Website Mini View</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setWebsiteUrl('http://localhost:5173')}
                                    className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1 ${websiteUrl.includes('localhost') ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                                  >
                                    <Globe size={10}/>
                                    Localhost
                                  </button>
                                  <button
                                    onClick={() => setWebsiteUrl('https://city-of-truth-ministries.web.app')}
                                    className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1 ${websiteUrl.includes('web.app') ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                  >
                                    <Globe size={10}/>
                                    Live Site
                                  </button>
                                  <a 
                                    href={websiteUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1"
                                    title="Open in new tab"
                                  >
                                    <ExternalLink size={10}/>
                                    New Tab
                                  </a>
                                </div>
                              </div>
                              
                              {/* Live Website Frame */}
                              <div className="flex-1 p-4">
                                <div className="bg-white rounded-xl shadow-lg border border-slate-300 overflow-hidden h-full min-h-[600px]">
                                  {/* Website URL Bar */}
                                  <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1 text-[10px] text-slate-600 font-mono">
                                      🌐 {websiteUrl.includes('localhost') ? 'localhost:5173' : 'city-of-truth-ministries.web.app'} / Live Website
                                    </div>
                                    <button
                                      onClick={() => {
                                        const iframe = document.getElementById('website-preview') as HTMLIFrameElement;
                                        if (iframe) {
                                          iframe.src = websiteUrl + (websiteUrl.includes('?') ? '&' : '?') + 'preview=true&t=' + Date.now(); // Refresh iframe with cache bust
                                          console.log('Refreshing website preview:', websiteUrl);
                                        }
                                      }}
                                      className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                      title="Refresh website"
                                    >
                                      <RotateCcw size={12} className="text-slate-600"/>
                                    </button>
                                  </div>
                                  
                                  {/* Website Iframe */}
                                  <div className="h-full bg-white relative">
                                    <iframe
                                      id="website-preview"
                                      src={websiteUrl + (websiteUrl.includes('?') ? '&' : '?') + 'preview=true'}
                                      className="w-full h-full border-0 min-h-[550px]"
                                      title="Live Website Preview"
                                      onLoad={(e) => {
                                        console.log('Website loaded successfully:', websiteUrl);
                                        const iframe = e.target as HTMLIFrameElement;
                                        
                                        // Try to communicate with the iframe for navigation
                                        try {
                                          iframe.contentWindow?.postMessage({
                                            action: 'admin-connected',
                                            source: 'admin-dashboard'
                                          }, '*');
                                        } catch (error) {
                                          console.log('Cross-origin communication limited:', error);
                                        }
                                      }}
                                      onError={(e) => {
                                        console.log('Iframe loading error, trying fallback...', e);
                                        const iframe = e.target as HTMLIFrameElement;
                                        if (iframe.src.includes('localhost')) {
                                          console.log('Switching to live site due to localhost error');
                                          setWebsiteUrl('https://city-of-truth-ministries.web.app');
                                        }
                                      }}
                                    />
                                    
                                    {/* Loading overlay */}
                                    <div className="absolute inset-0 bg-white flex items-center justify-center opacity-0 transition-opacity pointer-events-none" id="iframe-loading">
                                      <div className="flex items-center gap-2 text-slate-500">
                                        <RotateCcw size={16} className="animate-spin"/>
                                        <span className="text-sm font-medium">Loading website...</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Quick Nav Preview Tabs */}
                              <div className="p-4 border-t border-slate-200 bg-slate-50">
                                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-2">📱 Quick Navigation Test</p>
                                <div className="flex flex-wrap gap-2">
                                      {selectedMenuEditTab === 'main' && items2.filter((i:any)=>!i.hidden).slice(0,4).map((item:any, i:number) => (
                                    <button
                                      key={i}
                                      onClick={() => {
                                        const iframe = document.getElementById('website-preview') as HTMLIFrameElement;
                                        if (iframe && iframe.contentWindow) {
                                          try {
                                            iframe.contentWindow.postMessage({ action: 'navigate', view: item.view || item.label, source: 'admin-dashboard' }, '*');
                                          } catch (e) {
                                            console.log('Navigation message failed:', e);
                                          }
                                        }
                                      }}
                                      className="px-3 py-1.5 text-[8px] font-bold uppercase tracking-wider bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-brand-300 transition-all flex items-center gap-1"
                                    >
                                      <Globe size={10} className="text-blue-500"/>
                                      {item.label}
                                      <span className="text-[6px] text-blue-500 bg-blue-50 px-1 rounded">MAIN</span>
                                    </button>
                                  ))}
                                  
                                  {(selectedMenuEditTab === 'hebrew-content' || selectedMenuEditTab === 'hebrew-tools') && (
                                    <div className="w-full">
                                      <p className="text-[8px] font-bold text-slate-500 mb-2 uppercase">
                                        Hebrew {selectedMenuEditTab.replace('hebrew-', '').replace('-', ' ')} Submenu Items
                                      </p>
                                      <div className="grid grid-cols-2 gap-2">
                                        {items2.filter((i:any)=>!i.hidden).slice(0,4).map((item:any, i:number) => {
                                          const IconComponent = getBNavIconComponent(item.iconName || 'reference');
                                          return (
                                            <button
                                              key={i}
                                              onClick={() => {
                                                const iframe = document.getElementById('website-preview') as HTMLIFrameElement;
                                                if (iframe && iframe.contentWindow) {
                                                  try {
                                                    iframe.contentWindow.postMessage({ action: 'navigate', view: item.view || item.id, source: 'admin-dashboard' }, '*');
                                                  } catch (e) {
                                                    console.log('Hebrew navigation failed:', e);
                                                  }
                                                }
                                              }}
                                              className="flex items-center gap-2 px-2 py-1.5 text-[8px] font-bold uppercase tracking-wider bg-white border border-slate-200 rounded-lg hover:bg-amber-50 hover:border-amber-300 transition-all"
                                            >
                                              <IconComponent size={12} className="text-slate-500"/>
                                              {item.label}
                                              <span className="text-[6px] text-amber-600 bg-amber-50 px-1 rounded">SUB</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Footer */}
                          <div className="bg-gradient-to-r from-brand-950 to-brand-900 px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-brand-500/20 border border-brand-500/30 rounded-lg flex items-center justify-center">
                                <Globe size={16} className="text-brand-400"/>
                              </div>
                              <div>
                                <h4 className="font-black text-white text-xs md:text-sm">Cloud Global Sync</h4>
                                <p className="text-brand-200 text-[10px]">Changes reflect on all visitor devices instantly</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-brand-500/10 px-3 py-1.5 rounded-full border border-brand-500/20">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>
                              <span className="text-[10px] font-black text-brand-300 uppercase tracking-widest">Live</span>
                            </div>
                          </div>
                        </motion.div>
                        
                        {/* BOTTOM LIVE PREVIEW SECTION - Hebrew Menus with exact BottomNav theme */}
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          transition={{ delay: 0.2 }}
                          className="mt-6 bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-700 shadow-2xl overflow-hidden"
                        >
                          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 md:px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
                              <h3 className="font-black text-white text-sm md:text-base">📱 Hebrew Navigation - Live BottomNav Preview</h3>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exact Original Theme</span>
                          </div>
                          <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Hebrew Content Resources - exact BottomNav theme */}
                            {selectedMenuEditTab === 'hebrew-content' && (
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                                  <BookOpen size={12} className="text-amber-400"/>
                                  Hebrew Content Resources
                                </p>
                                <div className="bg-white/96 backdrop-blur-3xl rounded-[1.75rem] shadow-[0_-2px_20px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.12)] border border-slate-100/80 p-2">
                                  <div className="space-y-2.5">
                                    <div className="space-y-1.5">
                                      <div className="px-1.5 text-[8px] font-black uppercase tracking-[0.28em] text-slate-400">Resources</div>
                                      <Reorder.Group as="div" axis="x" values={items2.filter((i:any)=>!i.hidden)} onReorder={(newVisible) => { const hidden = items2.filter((i:any)=>i.hidden); saveItems([...newVisible, ...hidden]); }} className={`grid grid-cols-${Math.min(items2.filter((i:any)=>!i.hidden).length, 6)} gap-1.5`}>
                                        {items2.filter((i:any)=>!i.hidden).map((item:any, i:number) => {
                                          const IconComponent = getBNavIconComponent(item.iconName || 'reference');
                                          const isActive = i === 1; // Highlight second item for demo
                                          return (
                                            <Reorder.Item as="button" key={item.id || item.label || i} value={item} whileDrag={{ scale: 1.05, zIndex: 50, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} className="relative min-w-0 min-h-[58px] rounded-[1.1rem] px-1.5 py-2 transition-all duration-200 cursor-grab active:cursor-grabbing">
                                              {isActive && (
                                                <div className="absolute inset-0 bg-gradient-to-b from-amber-400/20 to-amber-500/10 rounded-[1.1rem]"/>
                                              )}
                                              {isActive && (
                                                <div className="absolute top-0 left-2 right-2 h-[2px] bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"/>
                                              )}
                                              <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1 pointer-events-none">
                                                <div className="h-6 flex items-center justify-center">
                                                  <IconComponent
                                                    size={18}
                                                    strokeWidth={isActive ? 2.3 : 1.7}
                                                    className={`transition-all duration-200 ${
                                                      isActive
                                                        ? 'text-amber-600 drop-shadow-[0_1px_4px_rgba(217,119,6,0.35)]'
                                                        : 'text-slate-400'
                                                    }`}
                                                  />
                                                </div>
                                                <span className={`text-[8px] font-bold uppercase tracking-wide leading-none text-center ${
                                                  isActive ? 'text-amber-700' : 'text-slate-400'
                                                }`}>
                                                  {item.label}
                                                </span>
                                              </div>
                                            </Reorder.Item>
                                          );
                                        })}
                                      </Reorder.Group>
                                    </div>
                                  </div>
                                  <div className="h-safe-area-inset-bottom bg-transparent"/>
                                </div>
                              </div>
                            )}

                            {/* Hebrew Tools - exact BottomNav theme */}
                            {selectedMenuEditTab === 'hebrew-tools' && (
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                                  <Zap size={12} className="text-amber-400"/>
                                  Hebrew Tools
                                </p>
                                <div className="bg-white/96 backdrop-blur-3xl rounded-[1.75rem] shadow-[0_-2px_20px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.12)] border border-slate-100/80 p-2">
                                  <div className="space-y-2.5">
                                    <div className="space-y-1.5">
                                      <div className="px-1.5 text-[8px] font-black uppercase tracking-[0.28em] text-slate-400">Tools</div>
                                      <Reorder.Group as="div" axis="x" values={items2.filter((i:any)=>!i.hidden)} onReorder={(newVisible) => { const hidden = items2.filter((i:any)=>i.hidden); saveItems([...newVisible, ...hidden]); }} className={`grid grid-cols-${Math.min(items2.filter((i:any)=>!i.hidden).length, 4)} gap-1.5`}>
                                        {items2.filter((i:any)=>!i.hidden).map((item:any, i:number) => {
                                          const IconComponent = getBNavIconComponent(item.iconName || 'words');
                                          const isActive = i === 1; // Highlight Audio for demo
                                          return (
                                            <Reorder.Item as="button" key={item.id || item.label || i} value={item} whileDrag={{ scale: 1.05, zIndex: 50, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} className="relative min-w-0 min-h-[58px] rounded-[1.1rem] px-1.5 py-2 transition-all duration-200 cursor-grab active:cursor-grabbing">
                                              {isActive && (
                                                <div className="absolute inset-0 bg-gradient-to-b from-amber-400/20 to-amber-500/10 rounded-[1.1rem]"/>
                                              )}
                                              {isActive && (
                                                <div className="absolute top-0 left-2 right-2 h-[2px] bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"/>
                                              )}
                                              <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1 pointer-events-none">
                                                <div className="h-6 flex items-center justify-center">
                                                  <IconComponent
                                                    size={18}
                                                    strokeWidth={isActive ? 2.3 : 1.7}
                                                    className={`transition-all duration-200 ${
                                                      isActive
                                                        ? 'text-amber-600 drop-shadow-[0_1px_4px_rgba(217,119,6,0.35)]'
                                                        : 'text-slate-400'
                                                    }`}
                                                  />
                                                </div>
                                                <span className={`text-[8px] font-bold uppercase tracking-wide leading-none text-center ${
                                                  isActive ? 'text-amber-700' : 'text-slate-400'
                                                }`}>
                                                  {item.label}
                                                </span>
                                              </div>
                                            </Reorder.Item>
                                          );
                                        })}
                                      </Reorder.Group>
                                    </div>
                                  </div>
                                  <div className="h-safe-area-inset-bottom bg-transparent"/>
                                </div>
                              </div>
                            )}

                            {/* Full Desktop Navbar (only when editing main menu) */}
                            {selectedMenuEditTab === 'main' && (
                              <div className="lg:col-span-2">
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                                  🖥️ Full Desktop Navigation Bar
                                </p>
                                <div className="bg-white rounded-xl shadow-lg border border-slate-600 overflow-hidden">
                                  <div className="px-6 py-4 flex items-center justify-between montserrat" style={{fontFamily:'Montserrat,sans-serif'}}>
                                    {/* Logo */}
                                    <div className="flex items-center gap-[10px]">
                                      <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                                        <img src="/logo.png" alt="COT Logo" className="w-full h-full object-contain"/>
                                      </div>
                                      <div className="flex flex-col justify-center">
                                        <span className="font-bold text-[1.1rem] leading-[1.1] tracking-[-0.5px] text-[#1a1a2e]">City of Truth</span>
                                        <span className="text-[0.65rem] font-bold tracking-[1px] uppercase text-[#5D5FEF]">MINISTRIES</span>
                                      </div>
                                    </div>
                                    
                                    {/* All nav items */}
                                    <div className="flex items-center gap-[3px] flex-wrap">
                                      {items2.filter((i:any)=>!i.hidden).map((item:any, i:number)=>{
                                        const hasSubmenu = item.submenu && item.submenu.filter((s:any)=>!s.hidden).length > 0;
                                        const isActive = i === 1;
                                        return (
                                          <div key={i} className="relative group">
                                            <div className={`text-[0.65rem] font-extrabold uppercase tracking-[0.5px] px-[12px] py-2 rounded-[20px] transition-all duration-300 whitespace-nowrap flex items-center gap-1 ${
                                              isActive
                                                ? 'bg-brand-50 text-brand-600 shadow-sm border border-brand-100'
                                                : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
                                            }`}>
                                              {item.label}
                                              {hasSubmenu && <ChevronDown size={10} className="transition-transform duration-300"/>}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    
                                    {/* Right actions */}
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-3 p-1.5 rounded-2xl backdrop-blur-md border bg-white/95 border-brand-200/80">
                                        <button className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 border border-blue-300/50 px-3.5 h-10 rounded-2xl shadow-[0_14px_24px_-12px_rgba(37,99,235,0.7)] flex items-center gap-2 transition-all duration-300">
                                          <CircleUser size={16} className="text-white"/>
                                          <span className="text-white text-[11px] font-black uppercase tracking-wide">Register</span>
                                        </button>
                                        <button className="w-11 h-11 rounded-2xl cursor-pointer flex items-center justify-center border border-blue-300/50 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white shadow-[0_12px_22px_-12px_rgba(37,99,235,0.75)]">
                                          <Menu size={18} strokeWidth={2.25} className="text-white"/>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    );
                    } catch (error) {
                        console.error('Menu editor error:', error);
                        return (
                            <div className="max-w-4xl mx-auto">
                                <div className="bg-white p-6 rounded-3xl border border-red-200 shadow-lg">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Filter size={32} className="text-red-500"/>
                                        </div>
                                        <h3 className="text-xl font-bold text-red-600 mb-2">Menu Editor Error</h3>
                                        <p className="text-slate-600 mb-4">There was an error loading the menu editor. Please refresh the page.</p>
                                        <button 
                                            onClick={() => window.location.reload()}
                                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Refresh Page
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                  })()}

                {activeTab === 'admin-tabs' && (
                    <div className="max-w-4xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-xl border-b-8 border-b-brand-600"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-3xl font-serif font-black text-brand-950">Admin Pages</h2>
                                    <p className="text-slate-500 mt-2 text-sm font-medium">Edit admin dashboard page names, show or hide pages, and change each page position.</p>
                                </div>
                                <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-[1.25rem] flex items-center justify-center shadow-inner border border-brand-100">
                                    <Settings size={28} />
                                </div>
                            </div>

                            <Reorder.Group
                                axis="y"
                                values={normalizeAdminTabs(dynamicTabs)}
                                onReorder={(nextTabs) => setDynamicTabs(nextTabs.map((tab, idx) => ({ ...tab, order: idx })))}
                                className="space-y-4"
                            >
                                {normalizeAdminTabs(dynamicTabs).map((tab, index) => {
                                    const IconComponent = LUCIDE_ICONS[tab.icon] || Globe;
                                    
                                    return (
                                        <Reorder.Item
                                            key={tab.id}
                                            value={tab}
                                            whileDrag={{ scale: 1.015, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.12), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                                            className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-grab active:cursor-grabbing"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="text-slate-300 hover:text-brand-500 transition-colors shrink-0" title="Drag page">
                                                    <GripVertical size={22} />
                                                </div>
                                                <div className="w-10 h-10 bg-brand-500 text-white rounded-xl flex items-center justify-center shadow-sm">
                                                    <IconComponent size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">System ID: {tab.id}</span>
                                                    <input 
                                                        type="text" 
                                                        value={tab.label}
                                                        onChange={(e) => {
                                                            const copy = normalizeAdminTabs(dynamicTabs);
                                                            copy[index] = { ...copy[index], label: e.target.value };
                                                            setDynamicTabs(copy);
                                                        }}
                                                        className="w-full bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-brand-500 mt-1"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-end gap-3 shrink-0">
                                                <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-wider text-slate-500">
                                                    Position
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={dynamicTabs.length}
                                                        value={index + 1}
                                                        onChange={(e) => {
                                                            const target = Math.max(1, Math.min(dynamicTabs.length, Number(e.target.value) || index + 1)) - 1;
                                                            const updated = moveArrayItem(normalizeAdminTabs(dynamicTabs), index, target).map((t, idx) => ({ ...t, order: idx }));
                                                            setDynamicTabs(updated);
                                                        }}
                                                        className="w-14 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-center text-xs font-black text-slate-700 outline-none focus:border-brand-500"
                                                        aria-label={`Position for ${tab.label}`}
                                                    />
                                                </label>

                                                <button
                                                    onClick={() => {
                                                        const copy = normalizeAdminTabs(dynamicTabs);
                                                        copy[index] = { ...copy[index], hidden: !copy[index].hidden };
                                                        setDynamicTabs(copy);
                                                    }}
                                                    className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                                        !tab.hidden 
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
                                                            : 'bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-100'
                                                    }`}
                                                >
                                                    {!tab.hidden ? <Eye size={12} /> : <EyeOff size={12} />}
                                                    {!tab.hidden ? 'Visible' : 'Hidden'}
                                                </button>

                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                    onClick={() => {
                                                        if (index === 0) return;
                                                            const copy = normalizeAdminTabs(dynamicTabs);
                                                            const temp = copy[index];
                                                            copy[index] = copy[index - 1];
                                                            copy[index - 1] = temp;
                                                            const updated = copy.map((t, idx) => ({ ...t, order: idx }));
                                                            setDynamicTabs(updated);
                                                        }}
                                                        disabled={index === 0}
                                                        className="w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-50 active:scale-95 disabled:opacity-30 transition-all"
                                                        aria-label="Move Up"
                                                    >
                                                        <ChevronUp size={16} />
                                                    </button>
                                                    <button
                                                    onClick={() => {
                                                        if (index === dynamicTabs.length - 1) return;
                                                            const copy = normalizeAdminTabs(dynamicTabs);
                                                            const temp = copy[index];
                                                            copy[index] = copy[index + 1];
                                                            copy[index + 1] = temp;
                                                            const updated = copy.map((t, idx) => ({ ...t, order: idx }));
                                                            setDynamicTabs(updated);
                                                        }}
                                                        disabled={index === dynamicTabs.length - 1}
                                                        className="w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-50 active:scale-95 disabled:opacity-30 transition-all"
                                                        aria-label="Move Down"
                                                    >
                                                        <ChevronDown size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </Reorder.Item>
                                    );
                                })}
                            </Reorder.Group>

                            {renderAdminPasswordChangePanel('admin-pages')}

                            <div className="flex flex-wrap gap-4 mt-10 pt-8 border-t border-slate-100">
                                <button
                                    onClick={async () => {
                                        try {
                                            const normalizedTabs = normalizeAdminTabs(dynamicTabs);
                                            setDynamicTabs(normalizedTabs);
                                            await api.updateAdminTabsConfig(normalizedTabs);
                                            alert("Admin pages configuration successfully saved globally to Firestore!");
                                        } catch (e) {
                                            alert("Failed to save configuration. Please try again.");
                                        }
                                    }}
                                    className="px-6 py-3 rounded-full bg-brand-600 text-white font-extrabold text-xs uppercase tracking-widest shadow-md hover:bg-brand-500 hover:scale-105 active:scale-95 transition-all"
                                >
                                    Save Config Globally
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm("Restore factory default sidebar tab layouts? This resets all tab names and ordering.")) {
                                            setDynamicTabs(DEFAULT_ADMIN_TABS);
                                        }
                                    }}
                                    className="px-6 py-3 rounded-full border border-slate-200 text-slate-500 font-extrabold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    Reset Defaults
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {activeTab === 'permalinks' && (
                    <PermalinkManager 
                        permalinks={permalinks}
                        onCreatePermalink={handleCreatePermalink}
                        onUpdatePermalink={handleUpdatePermalink}
                        onDeletePermalink={handleDeletePermalink}
                    />
                )}

                {activeTab === 'widgets' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                            <h2 className="text-2xl font-serif font-black text-brand-950 mb-2">Widget Settings</h2>
                            <p className="text-slate-500 text-sm mb-6">Manage the visibility and size of global floating widgets like the AI Assistant and Share button.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Share Button Settings */}
                                <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-brand-100 p-2 rounded-xl text-brand-600"><Share2 size={20} /></div>
                                            <h3 className="font-bold text-slate-800">Share Button</h3>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={widgetSettings.shareVisible} onChange={(e) => updateWidgetSettings({ shareVisible: e.target.checked })} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                                        </label>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Size Scale ({widgetSettings.shareSize.toFixed(1)}x)</label>
                                        <input type="range" min="0.5" max="2.0" step="0.1" value={widgetSettings.shareSize} onChange={(e) => updateWidgetSettings({ shareSize: parseFloat(e.target.value) })} className="w-full accent-brand-600" />
                                    </div>
                                    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 min-h-28 flex items-center justify-center overflow-hidden">
                                        {widgetSettings.shareVisible ? (
                                            <div
                                                className="bg-gradient-to-r from-brand-600 to-brand-700 text-white p-3 rounded-full shadow-2xl shadow-brand-500/30"
                                                style={{ transform: `scale(${0.85 * widgetSettings.shareSize})` }}
                                                title="Real Share Button Preview"
                                            >
                                                <Share2 size={20} />
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Hidden on website</span>
                                        )}
                                    </div>
                                </div>

                                {/* AI Assistant Settings */}
                                <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-violet-100 p-2 rounded-xl text-violet-600"><Sparkles size={20} /></div>
                                            <h3 className="font-bold text-slate-800">AI Assistant</h3>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={widgetSettings.aiVisible} onChange={(e) => updateWidgetSettings({ aiVisible: e.target.checked })} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
                                        </label>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Size Scale ({widgetSettings.aiSize.toFixed(1)}x)</label>
                                        <input type="range" min="0.5" max="2.0" step="0.1" value={widgetSettings.aiSize} onChange={(e) => updateWidgetSettings({ aiSize: parseFloat(e.target.value) })} className="w-full accent-violet-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Label Text</label>
                                        <input
                                            type="text"
                                            value={widgetSettings.aiLabelText || ''}
                                            onChange={(e) => updateWidgetSettings({ aiLabelText: e.target.value })}
                                            placeholder="e.g. Ask Divine AI"
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-xs font-semibold text-slate-800"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700">Pulse Animation</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={widgetSettings.aiAnimation !== false} onChange={(e) => updateWidgetSettings({ aiAnimation: e.target.checked })} />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-500"></div>
                                        </label>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-slate-200">
                                        <button
                                            onClick={() => {
                                                if (window.confirm("Clear all conversations and reset the AI Assistant to factory defaults?")) {
                                                    localStorage.removeItem('divine_assistant_history');
                                                    localStorage.removeItem('cot_widget_settings');
                                                    window.location.reload();
                                                }
                                            }}
                                            className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                        >
                                            Clear History & Reset
                                        </button>
                                    </div>
                                    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 min-h-28 flex flex-col items-center justify-center overflow-hidden gap-2">
                                        {widgetSettings.aiVisible ? (
                                            <>
                                                <div
                                                    className={`relative w-14 h-14 rounded-full shadow-2xl shadow-violet-500/30 flex items-center justify-center bg-gradient-to-tr from-violet-600 to-indigo-600 border border-white/20 ${widgetSettings.aiAnimation !== false ? 'animate-pulse' : ''}`}
                                                    style={{ transform: `scale(${widgetSettings.aiSize})` }}
                                                    title="Real AI Assistant Preview"
                                                >
                                                    <Sparkles className="w-6 h-6 text-white fill-white/20" />
                                                    <span className="absolute top-1 right-1 flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                    </span>
                                                </div>
                                                {widgetSettings.aiLabelText && (
                                                    <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest mt-1 bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100">{widgetSettings.aiLabelText}</span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Hidden on website</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}



                {activeTab === 'ai-analytics' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-900/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-white fill-white/20 animate-pulse" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-serif font-black">AI & OpenRouter Analytics</h2>
                                        <p className="text-violet-100 text-xs font-semibold uppercase tracking-wider mt-0.5">Live Pipeline Diagnostics</p>
                                    </div>
                                </div>
                                <div className="bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                                    <span>Pipeline Online</span>
                                </div>
                            </div>
                        </div>

                        {isLoadingAiDetails ? (
                            <div className="bg-white rounded-3xl border border-slate-100 p-12 flex flex-col items-center justify-center gap-3 shadow-sm min-h-[400px]">
                                <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Querying OpenRouter Data...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Left Side: Models Config */}
                                <div className="md:col-span-2 space-y-6">
                                    {/* Usage & Credit Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Credits Consumed</span>
                                            <div>
                                                <h3 className="text-4xl font-serif font-black text-violet-600">
                                                    {aiKeyDetails?.usage !== undefined
                                                        ? `$${aiKeyDetails.usage.toFixed(5)}`
                                                        : '$0.00000'}
                                                </h3>
                                                <p className="text-xs font-bold text-slate-400 mt-1">Total account API usage</p>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spending Limit</span>
                                            <div>
                                                <h3 className="text-4xl font-serif font-black text-slate-800">
                                                    {aiKeyDetails?.limit !== null && aiKeyDetails?.limit !== undefined
                                                        ? `$${aiKeyDetails.limit.toFixed(2)}`
                                                        : 'Unlimited'}
                                                </h3>
                                                <p className="text-xs font-bold text-slate-400 mt-1">Pre-configured spending cap</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Active Model Stack */}
                                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                                        <h3 className="text-lg font-serif font-black text-slate-800">Active Model Stack</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Primary Model</span>
                                                    <span className="text-[10px] font-bold text-slate-400">{aiModelDetails?.defaultModel?.context_length ? `${aiModelDetails.defaultModel.context_length} ctx` : '8k ctx'}</span>
                                                </div>
                                                <h4 className="font-extrabold text-slate-800">{aiModelDetails?.defaultModel?.name || 'Gemma 4 26B Instruct'}</h4>
                                                <p className="text-[10px] font-mono text-slate-400 truncate">{aiModelDetails?.defaultModel?.id || 'openai/gpt-oss-20b:free'}</p>
                                            </div>

                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Fallback Model</span>
                                                    <span className="text-[10px] font-bold text-slate-400">{aiModelDetails?.fallbackModel?.context_length ? `${aiModelDetails.fallbackModel.context_length} ctx` : '4k ctx'}</span>
                                                </div>
                                                <h4 className="font-extrabold text-slate-800">{aiModelDetails?.fallbackModel?.name || 'OpenRouter Free Auto-Router'}</h4>
                                                <p className="text-[10px] font-mono text-slate-400 truncate">{aiModelDetails?.fallbackModel?.id || 'openrouter/free'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Model Selector Panel */}
                                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div>
                                                <h3 className="text-lg font-serif font-black text-slate-800">Model Selector</h3>
                                                <p className="text-xs text-slate-400 font-semibold mt-0.5">Select the active LLM routing for COT AI Assistant</p>
                                            </div>
                                            <div className="text-[10px] font-black bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full uppercase tracking-wider self-start sm:self-center">
                                                {aiModelDetails?.allModels?.length || 0} Models Available
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Search input */}
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Search OpenRouter models (e.g. gemma, llama, claude)..."
                                                    value={modelSearchQuery}
                                                    onChange={(e) => setModelSearchQuery(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-500 font-semibold text-slate-700 placeholder-slate-400 text-sm transition-all"
                                                />
                                                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                                                {modelSearchQuery && (
                                                    <button
                                                        onClick={() => setModelSearchQuery('')}
                                                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 font-bold text-xs"
                                                    >
                                                        Clear
                                                    </button>
                                                )}
                                            </div>

                                            {/* Scrollable list of models */}
                                            <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-2xl divide-y divide-slate-100 bg-white">
                                                {filteredModels.length === 0 ? (
                                                    <div className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                        No models found matching "{modelSearchQuery}"
                                                    </div>
                                                ) : (
                                                    filteredModels.map((m: any) => {
                                                        const isActive = m.id === (aiModelDetails?.defaultModel?.id || 'google/gemma-4-26b-a4b-it:free');
                                                        return (
                                                            <button
                                                                key={m.id}
                                                                type="button"
                                                                onClick={() => handleSelectModel(m.id)}
                                                                className={`w-full text-left p-3.5 transition-all flex items-center justify-between ${
                                                                    isActive 
                                                                        ? 'bg-brand-50/50 hover:bg-brand-50' 
                                                                        : 'hover:bg-slate-50'
                                                                }`}
                                                            >
                                                                <div className="space-y-0.5 flex-1 min-w-0 pr-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-extrabold text-xs text-slate-800 truncate block">
                                                                            {m.name || m.id}
                                                                        </span>
                                                                        {isActive && (
                                                                            <span className="text-[8px] font-black text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                                                                Active
                                                                            </span>
                                                                        )}
                                                                        {m.id.includes(':free') && (
                                                                            <span className="text-[8px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                                                                Free
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span className="font-mono text-[9px] text-slate-400 truncate block">
                                                                        {m.id}
                                                                    </span>
                                                                </div>
                                                                <div className="text-right shrink-0">
                                                                    <span className="text-[10px] font-bold text-slate-400 block">
                                                                        {m.context_length ? `${m.context_length.toLocaleString()} ctx` : '8k ctx'}
                                                                    </span>
                                                                    {m.pricing && (
                                                                        <span className="text-[9px] font-semibold text-slate-500 block">
                                                                            {Number(m.pricing.prompt) === 0 && Number(m.pricing.completion) === 0
                                                                                ? 'Free tier'
                                                                                : `$${(Number(m.pricing.prompt) * 1000000).toFixed(2)}/M tokens`
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: API Key details & Interpretation */}
                                <div className="space-y-6">
                                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                                        <h3 className="text-lg font-serif font-black text-slate-800">Connection Details</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                                                <span className="text-slate-500 font-semibold">Label</span>
                                                <span className="font-bold text-slate-700">{aiKeyDetails?.label || 'COT Key'}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                                                <span className="text-slate-500 font-semibold">Active State</span>
                                                <span className="font-bold text-emerald-600 uppercase">Active</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                                                <span className="text-slate-500 font-semibold">Rate Limit</span>
                                                <span className="font-bold text-slate-700">
                                                    {aiKeyDetails?.rate_limit
                                                        ? `${aiKeyDetails.rate_limit.requests} reqs / ${aiKeyDetails.rate_limit.interval}`
                                                        : '10 / sec'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500 font-semibold">Total Queries Served</span>
                                                <span className="font-bold text-slate-700">14,812</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Interpretation card */}
                                    <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-3 shadow-md">
                                        <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-widest">
                                            <Zap size={14} />
                                            <span>Diag Interpretation</span>
                                        </div>
                                        <p className="text-xs leading-relaxed text-slate-300 font-medium">
                                            The COT AI assistant is powered by Google Gemma models. When Gemma's upstream free quota or rate limits are exhausted, OpenRouter automatically swaps to the fallback free router to keep the chat interface available for seekers.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Daily Greetings Settings */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Sun size={24} className="text-amber-500" />
                                Automated Daily Greetings
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">Configure the automatic daily Hebrew greetings sent via Push Notification and SMS to all users.</p>

                            <div className="space-y-6 max-w-2xl">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div>
                                        <p className="font-bold text-slate-800">Enable Daily Greetings</p>
                                        <p className="text-xs text-slate-500">Send automated messages at 5am, 12pm, 6pm, and 9pm.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={dailyGreetingSettings.enabled}
                                            onChange={(e) => handleDailyGreetingSettingsUpdate({ enabled: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 block">Notification Image URL (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="https://example.com/image.jpg"
                                        value={dailyGreetingSettings.imageUrl}
                                        onChange={(e) => setDailyGreetingSettings(prev => ({ ...prev, imageUrl: e.target.value }))}
                                        onBlur={(e) => handleDailyGreetingSettingsUpdate({ imageUrl: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-sm"
                                    />
                                    <p className="text-xs text-slate-500">This image will be attached to the push notifications.</p>
                                </div>
                            </div>
                        </div>

                        {/* Header card with notification metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Notifications</p>
                                    <p className="text-3xl font-black text-slate-900">{memberNotifications.length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                                    <Bell size={24} />
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sent by Admins</p>
                                    <p className="text-3xl font-black text-slate-900">{memberNotifications.filter(n => n.from === 'admin').length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <ShieldAlert size={24} />
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Read Status Rate</p>
                                    <p className="text-3xl font-black text-slate-900">
                                        {memberNotifications.length > 0
                                            ? `${Math.round((memberNotifications.filter(n => n.read).length / memberNotifications.length) * 100)}%`
                                            : '0%'}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <CheckCircle size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Search & Filters block */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
                            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        value={notificationSearch}
                                        onChange={(e) => setNotificationSearch(e.target.value)}
                                        placeholder="Search message text, ID, status..."
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-500 text-xs font-semibold"
                                    />
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <select
                                        value={notificationFilterType}
                                        onChange={(e) => setNotificationFilterType(e.target.value as any)}
                                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-brand-500"
                                    >
                                        <option value="all">All Sources</option>
                                        <option value="admin">Sent by Admin</option>
                                        <option value="user">User Replies</option>
                                    </select>
                                    <select
                                        value={notificationFilterKind}
                                        onChange={(e) => setNotificationFilterKind(e.target.value)}
                                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-brand-500"
                                    >
                                        <option value="all">All Kinds</option>
                                        <option value="message">Messages</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="alert">Alerts</option>
                                        <option value="update">Updates</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={notificationFilterUser}
                                        onChange={(e) => setNotificationFilterUser(e.target.value)}
                                        placeholder="Filter by User ID"
                                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-brand-500"
                                    />
                                    { (notificationSearch || notificationFilterType !== 'all' || notificationFilterKind !== 'all' || notificationFilterUser) && (
                                        <button
                                            onClick={() => {
                                                setNotificationSearch('');
                                                setNotificationFilterType('all');
                                                setNotificationFilterKind('all');
                                                setNotificationFilterUser('');
                                            }}
                                            className="px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 border border-red-200 rounded-xl transition-all"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="divide-y divide-slate-100">
                                {memberNotifications
                                    .filter(note => {
                                        if (notificationSearch) {
                                            const search = notificationSearch.toLowerCase();
                                            const matchesMsg = (note.message || '').toLowerCase().includes(search);
                                            const matchesUser = (note.userId || '').toLowerCase().includes(search);
                                            const matchesId = (note.id || '').toLowerCase().includes(search);
                                            const matchesKind = (note.kind || '').toLowerCase().includes(search);
                                            if (!matchesMsg && !matchesUser && !matchesId && !matchesKind) return false;
                                        }
                                        if (notificationFilterType !== 'all') {
                                            if (note.from !== notificationFilterType) return false;
                                        }
                                        if (notificationFilterKind !== 'all') {
                                            if (note.kind !== notificationFilterKind) return false;
                                        }
                                        if (notificationFilterUser.trim()) {
                                            const filterUser = notificationFilterUser.trim().toUpperCase();
                                            if ((note.userId || '').toUpperCase() !== filterUser) return false;
                                        }
                                        return true;
                                    })
                                    .map((note) => {
                                        const recipient = users.find(u => u.id === note.userId);
                                        return (
                                            <div key={note.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                                                <div className="flex items-start gap-4 min-w-0">
                                                    <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-sm bg-slate-100 text-slate-700`}>
                                                        {recipient?.photo ? (
                                                            <img src={recipient.photo} alt="" className="w-full h-full object-cover rounded-full" />
                                                        ) : (
                                                            (recipient?.name || note.userId || 'U').slice(0,1).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 space-y-1">
                                                        <div className="flex items-center flex-wrap gap-2">
                                                            <p className="text-xs font-black text-slate-800">
                                                                {note.from === 'admin' ? `To: ${recipient?.name || note.userId}` : `Reply from: ${recipient?.name || note.userId}`}
                                                            </p>
                                                            <span className="text-[10px] font-mono text-slate-400">({note.userId})</span>
                                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                                note.kind === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                                note.kind === 'disapproved' ? 'bg-red-100 text-red-700' :
                                                                note.kind === 'recycle' ? 'bg-amber-100 text-amber-700' :
                                                                note.kind === 'leader' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-slate-100 text-slate-700'
                                                            }`}>
                                                                {note.kind || 'message'}
                                                            </span>
                                                            <span className="text-[9px] text-slate-400">{new Date(note.createdAt).toLocaleString()}</span>
                                                        </div>
                                                        <p className="text-xs font-medium text-slate-600 whitespace-pre-wrap break-words leading-relaxed">{note.message}</p>
                                                        {note.imageUrl && (
                                                            <div className="mt-2 relative group max-w-[200px]">
                                                                <img src={note.imageUrl} alt="attachment" className="rounded-xl border border-slate-200 max-h-32 object-cover" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${note.read ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                                        {note.read ? '✓ Read' : '● Unread'}
                                                    </span>
                                                    <button
                                                        onClick={() => setEditingNotification(note)}
                                                        className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all"
                                                        title="Edit notification text / details"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    {onDeleteMemberNotification && (
                                                        <button
                                                            onClick={() => onDeleteMemberNotification(note.id)}
                                                            className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                                                            title="Delete notification"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                {memberNotifications.length === 0 && (
                                    <div className="p-8 text-center text-sm text-slate-400">
                                        No notifications found.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Inline Edit Modal */}
                        {editingNotification && (
                            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl w-full max-w-lg p-6 md:p-8 space-y-6"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Alter Notification</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID: {editingNotification.id}</p>
                                        </div>
                                        <button onClick={() => setEditingNotification(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                                            <X size={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Message Content</label>
                                            <textarea
                                                value={editingNotification.message}
                                                onChange={(e) => setEditingNotification({ ...editingNotification, message: e.target.value })}
                                                rows={4}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-xs font-semibold"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Image URL (Optional)</label>
                                            <input
                                                type="text"
                                                value={editingNotification.imageUrl || ''}
                                                onChange={(e) => setEditingNotification({ ...editingNotification, imageUrl: e.target.value })}
                                                placeholder="https://example.com/banner.jpg"
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-xs font-semibold"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kind</label>
                                                <select
                                                    value={editingNotification.kind || 'message'}
                                                    onChange={(e) => setEditingNotification({ ...editingNotification, kind: e.target.value as any })}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-xs font-semibold"
                                                >
                                                    <option value="message">Message</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="rejected">Rejected</option>
                                                    <option value="alert">Alert</option>
                                                    <option value="update">Update</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5 flex flex-col justify-end">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Read Status</label>
                                                <select
                                                    value={editingNotification.read ? 'read' : 'unread'}
                                                    onChange={(e) => setEditingNotification({ ...editingNotification, read: e.target.value === 'read' })}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-xs font-semibold"
                                                >
                                                    <option value="unread">Unread</option>
                                                    <option value="read">Read</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setEditingNotification(null)}
                                            className="flex-1 py-3 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold rounded-xl text-xs transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (onUpdateMemberNotification) {
                                                    onUpdateMemberNotification(editingNotification);
                                                }
                                                setEditingNotification(null);
                                            }}
                                            className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-black uppercase tracking-wider rounded-xl text-xs transition-all"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'recycle-bin' && (
                    <div className="space-y-6">
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

                        {renderAdminPasswordChangePanel('firebase')}

                        {/* Complete Reboot Section */}
                        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-red-700 flex items-center gap-2">
                                        <AlertTriangle size={18} className="text-red-600" />
                                        Complete Reboot
                                    </h3>
                                    <p className="text-xs text-red-600 mt-1">⚠️ Danger Zone - Irreversible Action</p>
                                </div>
                            </div>
                            <p className="text-sm text-red-800 mb-4">
                                This will permanently delete ALL data including users, member forms, contact messages, Firebase storage files, and all configuration. The admin dashboard will start from scratch.
                            </p>
                            <Button
                                variant="accent"
                                onClick={() => setShowCompleteRebootModal(true)}
                                className="w-full bg-red-600 hover:bg-red-700 text-white"
                            >
                                <Trash2 size={18} />
                                Initiate Complete Reboot
                            </Button>
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
                                    <p><span className="font-bold text-slate-700">Tab TV / Ministry Items Loaded:</span> <span className="text-slate-600">{ministries.length}</span></p>
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


                <AnimatePresence>
                    {activeTab === 'baruch-hashem' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-8"
                        >
                            <BaruchVideosManager />
                        </motion.div>
                    )}
                </AnimatePresence>
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
                                            onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                            maxLength={10}
                                            placeholder="10-digit number"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                                        <select
                                            value={editingUser.location}
                                            onChange={(e) => setEditingUser({ ...editingUser, location: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 font-semibold text-slate-800"
                                        >
                                            <option value="" disabled>Select District</option>
                                            {TAMIL_NADU_DISTRICTS.map(district => (
                                                <option key={district} value={district}>{district}</option>
                                            ))}
                                        </select>
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

                                {editingUser.linkedProfiles && editingUser.linkedProfiles.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t border-slate-100">
                                        <label className="text-xs font-bold text-slate-500 uppercase block">Linked Additional Members ({editingUser.linkedProfiles.length})</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                            {editingUser.linkedProfiles.map(profile => (
                                                <div key={profile.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        {profile.photo ? (
                                                            <img src={profile.photo} alt={profile.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs shrink-0">
                                                                {profile.name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-slate-800 truncate">{profile.name}</p>
                                                            <p className="text-[9px] font-mono text-slate-400 truncate">{profile.id}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (confirm(`Are you sure you want to remove linked profile ${profile.name}?`)) {
                                                                setEditingUser({
                                                                    ...editingUser,
                                                                    linkedProfiles: editingUser.linkedProfiles?.filter(p => p.id !== profile.id) || []
                                                                });
                                                            }
                                                        }}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors shrink-0"
                                                        title="Delete Linked Profile"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

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

            <AnimatePresence>
            {showBulkDownloadModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
                    >
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Bulk Download Configuration</h3>
                                <p className="text-xs text-slate-500 mt-1">Select options to include in your combined PDF for {selectedUsers.size} users.</p>
                            </div>
                            <button onClick={() => setShowBulkDownloadModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Inclusion Options</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'cards', label: 'Entrust Card' },
                                        { id: 'photos', label: 'Image' },
                                        { id: 'locations', label: 'Location' },
                                        { id: 'ids', label: 'COT ID' },
                                        { id: 'join-dates', label: 'Join Date' }
                                    ].map(opt => {
                                        const isSelected = bulkDownloadOptions.includes(opt.id as IdCardVisualMode);
                                        return (
                                            <button
                                                key={opt.id}
                                                onClick={() => setBulkDownloadOptions(prev => prev.includes(opt.id as IdCardVisualMode) ? prev.filter(x => x !== opt.id) : [...prev, opt.id as IdCardVisualMode])}
                                                className={`px-3 py-2.5 rounded-xl border-2 text-xs font-bold text-left transition-colors flex items-center gap-2 ${isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'}`}>
                                                    {isSelected && <Check size={10} />}
                                                </div>
                                                {opt.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {!bulkDownloadOptions.includes('cards') && bulkDownloadOptions.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Apply Royal Theme</h4>
                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                        <button
                                            onClick={() => setBulkDownloadTheme(null)}
                                            className={`px-3 py-2.5 rounded-xl border-2 text-xs font-bold text-left transition-colors flex items-center gap-2 ${bulkDownloadTheme === null ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'}`}
                                        >
                                            Current Themes
                                        </button>
                                        {ROYAL_CARD_THEMES.map(theme => (
                                            <button
                                                key={theme.tone}
                                                onClick={() => setBulkDownloadTheme(theme.tone)}
                                                className={`px-3 py-2.5 rounded-xl border-2 text-[10px] font-bold text-left transition-colors flex items-center gap-2 ${bulkDownloadTheme === theme.tone ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'}`}
                                            >
                                                <div className={`w-3 h-3 rounded-full shrink-0 bg-gradient-to-r ${theme.swatch}`} />
                                                <span className="truncate">{theme.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
                            <button onClick={() => setShowBulkDownloadModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200">Cancel</button>
                            <button
                                onClick={handleGenerateBulkPdf}
                                disabled={bulkDownloadOptions.length === 0 || isLoading}
                                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isLoading ? <><div className="animate-spin">⏳</div> Generating...</> : <><Download size={14} /> Download PDF</>}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            </AnimatePresence>

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
                                        <div className="p-4 bg-white rounded-2xl border border-[#d4a547]/20">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#d4a547] mb-1">Role in Ministry</p>
                                            <p className="text-sm font-semibold text-slate-700">{memberFormPageUser.communityProfile?.role || 'N/A'}</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-2xl border border-[#d4a547]/20">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#d4a547] mb-1">District / Zone</p>
                                            <p className="text-sm font-semibold text-slate-700">{memberFormPageUser.communityProfile?.district || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white rounded-2xl border border-[#d4a547]/20">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#d4a547] mb-1">Testimony / Bio</p>
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{memberFormPageUser.communityProfile?.bio || 'N/A'}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 mt-4">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowMemberFormEditor(true)}
                                                className="flex-1 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-colors shadow-lg"
                                            >
                                                {memberFormPageUser.communityProfile ? 'Edit Member Form' : 'Fill Member Form'}
                                            </button>
                                            {memberFormPageUser.communityProfile && memberFormPageUser.communityProfile.status !== 'Rejected' && (
                                                <button
                                                    type="button"
                                                    onClick={handleRejectMemberForm}
                                                    disabled={isLoading}
                                                    className="flex-1 px-5 py-3 rounded-2xl bg-red-100 text-red-600 font-black hover:bg-red-200 transition-colors"
                                                >
                                                    {isLoading ? 'Processing...' : 'Reject & Request Refill'}
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDownloadMemberFormPdf(memberFormPageUser)}
                                            disabled={downloadingMemberFormPdfUserId === memberFormPageUser.id}
                                            className="w-full px-5 py-3 rounded-2xl bg-amber-600 text-white font-black hover:bg-amber-700 transition-colors"
                                        >
                                            {downloadingMemberFormPdfUserId === memberFormPageUser.id ? 'Generating Member Form PDF...' : 'Download Member Form PDF'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            <CommunityProfileForm
                isOpen={showMemberFormEditor}
                onClose={() => setShowMemberFormEditor(false)}
                initialData={memberFormPageUser?.communityProfile}
                onSave={async (data) => {
                    if (!memberFormPageUser) return;
                    setIsLoading(true);
                    try {
                        const parent = users.find(u => u.id === memberFormPageUser.parentUserId);
                        if (!parent) throw new Error('Parent user not found');

                        let updatedParent = { ...parent };
                        if (memberFormPageUser.isSubProfile) {
                            updatedParent.linkedProfiles = (updatedParent.linkedProfiles || []).map(p => 
                                p.id === memberFormPageUser.id ? { ...p, communityProfile: { ...data, status: 'Approved' } as any } : p
                            );
                        } else {
                            updatedParent.communityProfile = { ...data, status: 'Approved' } as any;
                        }
                        await onUpdateUser(updatedParent);
                        setMemberFormPageUser({ ...memberFormPageUser, communityProfile: { ...data, status: 'Approved' } });
                        alert('Member Form updated successfully.');
                    } catch (err) {
                        console.error(err);
                        alert('Failed to update member form.');
                    } finally {
                        setIsLoading(false);
                    }
                }}
            />

            {/* View Details Modal */}
            <AnimatePresence>
                <AnimatePresence>
                    {cotInventoryCelebration && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[260] pointer-events-none flex items-center justify-center bg-slate-950/35 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ y: -260, rotate: -10, scale: 0.72, opacity: 0 }}
                                animate={{ y: 0, rotate: 0, scale: 1, opacity: 1 }}
                                exit={{ y: 180, rotate: 8, scale: 0.82, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 190, damping: 15 }}
                                className="relative overflow-hidden rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-300 via-yellow-200 to-white px-8 py-7 text-center shadow-[0_40px_100px_rgba(15,23,42,0.45)]"
                            >
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: 0.2, duration: 0.55 }}
                                    className="absolute inset-x-6 top-4 h-1 origin-left rounded-full bg-brand-700"
                                />
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-700">COT ID Selected</p>
                                <motion.div
                                    initial={{ scale: 0.85 }}
                                    animate={{ scale: [0.85, 1.12, 1] }}
                                    transition={{ delay: 0.15, duration: 0.5 }}
                                    className="mt-3 text-5xl md:text-7xl font-black font-mono text-brand-950 tracking-tight"
                                >
                                    {cotInventoryCelebration.id}
                                </motion.div>
                                <p className="mt-3 text-sm md:text-base font-black text-slate-700">
                                    assigned to {cotInventoryCelebration.userName}
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Joined Date</label>
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <Calendar size={16} className="text-slate-400" />
                                        <span className="text-sm text-slate-700">{formatDateValue(viewingDetailsUser.joinedDate || viewingDetailsUser.memberSince)}</span>
                                    </div>
                                </div>


                            </div>

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
                                    type="button"
                                    onClick={() => handleGoToUserInList(viewingDetailsUser)}
                                    className="w-full mb-3 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Users size={16} /> Locate in Users Tab
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
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => {
                                                setIdCardVisualMode('cards');
                                                setUserQuickViewMode('cards');
                                            }}
                                            className="rounded-3xl overflow-hidden border border-sky-200 bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 text-left shadow-sm hover:shadow-xl transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/60"
                                            title="Show Entrust card preview"
                                        >
                                            <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 flex items-center justify-between">
                                                <div className="text-[9px] font-black uppercase tracking-[0.22em] text-white leading-tight">City of Truth<br />Ministries</div>
                                                <span className="rounded-full bg-white/20 border border-white/30 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white">Image</span>
                                            </div>
                                            <div className="aspect-square bg-sky-100 m-4 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
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
                                                <div className="mt-2 text-[9px] font-black uppercase tracking-widest text-sky-500">Tap to View Details</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {userQuickViewMode === 'ids' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {filteredUsers.map(user => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => {
                                                setIdCardVisualMode('cards');
                                                setUserQuickViewMode('cards');
                                            }}
                                            className="px-5 py-5 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 text-left shadow-sm hover:shadow-xl transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/60"
                                            title="Show Entrust card preview"
                                        >
                                            <div className="flex items-center gap-3 text-sky-600 mb-3">
                                                <Shield size={18} />
                                                <span className="text-[10px] font-black uppercase tracking-[0.22em]">Official COT ID</span>
                                            </div>
                                            <div className="text-2xl font-black text-blue-900 font-mono">{user.id}</div>
                                            <div className="mt-2 text-sm font-bold text-blue-800 truncate">{user.name}</div>
                                            <div className="mt-3 text-[9px] font-black uppercase tracking-widest text-sky-500">Tap to View Details</div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {userQuickViewMode === 'cards' && (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    {filteredUsers.map(user => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => {
                                                setIdCardVisualMode('photos');
                                                setUserQuickViewMode('photos');
                                            }}
                                            className="bg-slate-50 border border-slate-100 rounded-3xl p-4 text-left hover:border-sky-200 hover:shadow-xl transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/60"
                                            title="Show image preview"
                                        >
                                            <div className="mb-3">
                                                <div className="font-bold text-brand-950">{user.name}</div>
                                                <div className="text-xs font-mono text-slate-500">{user.id}</div>
                                                <div className="mt-1 text-[9px] font-black uppercase tracking-widest text-sky-500">Tap to View Details</div>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <div className="min-w-[340px]">
                                                    <EntrustCard3D
                                                        name={user.name}
                                                        email={user.email}
                                                        location={user.location}
                                                        emergency={user.emergency}
                                                        uniqueId={user.id}
                                                        memberSince={user.joinedDate || user.memberSince}
                                                        photo={user.photo}
                                                        status={user.status}
                                                        isStatic={true}
                                                    />
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {userQuickViewMode === 'locations' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {filteredUsers.map(user => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => {
                                                setIdCardVisualMode('cards');
                                                setUserQuickViewMode('cards');
                                            }}
                                            className="p-5 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 text-left shadow-sm hover:shadow-xl transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/60"
                                            title="Show Entrust card preview"
                                        >
                                            <div className="flex items-center gap-2 text-sky-600 font-bold mb-2">
                                                <MapPin size={18} />
                                                <span>{user.location || 'Unknown'}</span>
                                            </div>
                                            <div className="text-sm font-semibold text-brand-950">{user.name}</div>
                                            <div className="text-[11px] font-mono text-slate-500 mt-1">{user.id}</div>
                                            <div className="mt-3 text-[9px] font-black uppercase tracking-widest text-sky-500">Tap to View Details</div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {userQuickViewMode === 'join-dates' && (
                                <div className="space-y-3">
                                    {filteredUsers.map(user => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => {
                                                setIdCardVisualMode('cards');
                                                setUserQuickViewMode('cards');
                                            }}
                                            className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 text-left shadow-sm hover:shadow-xl transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/60"
                                            title="Show Entrust card preview"
                                        >
                                            <div>
                                                <div className="font-bold text-brand-950">{user.name}</div>
                                                <div className="text-[11px] font-mono text-slate-500">{user.id}</div>
                                                <div className="mt-2 text-[9px] font-black uppercase tracking-widest text-sky-500">Tap to View Details</div>
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700">
                                                <Calendar size={14} className="text-slate-400" />
                                                {formatDateValue(user.memberSince || user.joinedDate)}
                                            </div>
                                        </button>
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
                        {/* ImageCropper overlay for ministry images */}
                        {isCropping && croppingType === 'ministry' && cropImage && (
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                                <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-bold text-brand-950">Crop Image</span>
                                        <button
                                            onClick={() => { setIsCropping(false); setCropImage(null); setCroppingType(null); }}
                                            className="text-xs font-bold text-red-500 hover:text-red-600"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                        <ImageCropper
                                            imageSrc={cropImage}
                                            onCropComplete={handleCropComplete}
                                            onCancel={() => { setIsCropping(false); setCropImage(null); setCroppingType(null); }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] p-5 sm:p-8 max-w-xl w-full max-h-[92vh] overflow-y-auto"
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
                                {/* Media Preview or Upload */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Moment Media</label>
                                    <div className="relative aspect-square bg-slate-100 rounded-[2rem] overflow-hidden group border-2 border-slate-100 shadow-inner">
                                        {editingMinistry.image ? (
                                            <>
                                                {previewMinistryMediaType === 'video' ? (
                                                    <video
                                                        src={editingMinistry.image}
                                                        className="w-full h-full object-cover"
                                                        controls
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
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                                                    <label className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-700 transition-colors shadow-lg" title="Upload New Media">
                                                        <Camera size={24} />
                                                        <input type="file" className="hidden" accept="image/*,video/*" onChange={handleSingleMinistryMediaSelect} />
                                                    </label>
                                                    <span className="text-xs font-bold uppercase tracking-widest">
                                                        {previewMinistryMediaType === 'video' ? 'Change Media' : 'Upload New'}
                                                    </span>
                                                    {previewMinistryMediaType !== 'video' && editingMinistry.image && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setCropImage(editingMinistry.image!);
                                                                setCroppingType('ministry');
                                                                setIsCropping(true);
                                                            }}
                                                            className="flex items-center gap-1.5 px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm transition-colors"
                                                            title="Crop Image"
                                                        >
                                                            <Crop size={13} /> Crop Image
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <label className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-200 transition-all border-2 border-dashed border-slate-300 rounded-[2rem]">
                                                <ImagePlus size={48} className="mb-2" />
                                                <span className="font-bold">Select Media</span>
                                                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleSingleMinistryMediaSelect} />
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic text-center">Tip: Photos are cropped to square; videos keep their original shape.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Media Type</label>
                                        <select
                                            value={editingMinistry.mediaType || editingMinistryMediaType}
                                            onChange={(e) => setEditingMinistry({ ...editingMinistry, mediaType: e.target.value as 'image' | 'video' })}
                                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 bg-slate-50"
                                        >
                                            <option value="image">Photo</option>
                                            <option value="video">Video</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Category</label>
                                        <div className="relative">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                value={editingMinistry.category || ''}
                                                onChange={(e) => setEditingMinistry({ ...editingMinistry, category: e.target.value })}
                                                placeholder="e.g., Outreach, Youth, Worship"
                                                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-500 focus:bg-white transition-all text-brand-950 font-medium"
                                            />
                                        </div>
                                    </div>
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
                                    <p className="text-[10px] text-slate-400 italic">Dates are automatically detected from the filename or file metadata.</p>
                                </div>

                                {editingMinistryMediaType === 'video' && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Video Duration</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                value={editingMinistry.duration || ''}
                                                onChange={(e) => setEditingMinistry({ ...editingMinistry, duration: e.target.value })}
                                                placeholder="mm:ss or hh:mm:ss"
                                                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-500 focus:bg-white transition-all text-brand-950 font-medium"
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-400 italic">Auto-detected from the video file when available.</p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <div>
                                        <p className="text-xs font-black text-slate-600 uppercase tracking-[0.2em]">Visibility</p>
                                        <p className="text-[11px] text-slate-500">Hide from the public gallery while keeping it saved.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEditingMinistry({ ...editingMinistry, hidden: !editingMinistry.hidden })}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${editingMinistry.hidden ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}
                                    >
                                        {editingMinistry.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                        {editingMinistry.hidden ? 'Hidden' : 'Visible'}
                                    </button>
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
                                            <div className="flex-1 flex items-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-colors">
                                                <span className="text-sm font-mono text-slate-500 select-none">COT-</span>
                                                <input
                                                    list="available-cot-ids"
                                                    type="text"
                                                    placeholder="Leave empty for auto, or enter 1960"
                                                    value={(newUserData.memberId || '').replace(/^COT-/i, '')}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/^COT-/i, '');
                                                        setNewUserData(d => ({ ...d, memberId: val ? `COT-${val}` : '' }));
                                                    }}
                                                    className="flex-1 bg-transparent text-sm font-mono outline-none min-w-0"
                                                />
                                            </div>
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
                                            onChange={(e) => setNewUserData(d => ({ ...d, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                                            maxLength={10}
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

            {/* Bulk Upload Pre-Edit Modal Workspace */}
            <AnimatePresence>
                {bulkQueue.length > 0 && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="bg-[#0e0b16] border border-white/10 rounded-[3rem] p-8 max-w-5xl w-full text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-6 border-b border-white/10 shrink-0">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-xs font-black text-yellow-300 uppercase tracking-widest mb-1.5">
                                        <Sparkles size={12} className="animate-pulse" />
                                        Advanced Media Studio
                                    </div>
                                    <h3 className="text-3xl font-serif font-black text-white">Bulk Pre-Edit Workspace</h3>
                                    <p className="text-gray-400 text-xs mt-1 font-medium">Detecting metadata, trimming timeline clips, adjusting image crops, and setting categories before publishing in batch.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (window.confirm("Discard all items in the upload queue?")) {
                                            bulkQueue.forEach(item => {
                                                if (item.mediaType === 'video' && item.preview.startsWith('blob:')) {
                                                    URL.revokeObjectURL(item.preview);
                                                }
                                            });
                                            setBulkQueue([]);
                                        }
                                    }}
                                    className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors shrink-0 cursor-pointer"
                                    title="Close workspace"
                                    disabled={isBulkUploading}
                                >
                                    <X size={20} className="text-gray-400 hover:text-white" />
                                </button>
                            </div>

                            {/* Queue Grid List */}
                            <div className="flex-1 overflow-y-auto my-6 pr-2 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {bulkQueue.map((item) => {
                                        const finalSecs = Math.max(1, Math.round(((item.videoTrimEnd - item.videoTrimStart) / 100) * item.videoDurationSeconds));
                                        const isHidden = item.hidden;
                                        return (
                                            <div key={item.id} className={`bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col gap-4 relative overflow-hidden transition-all hover:border-yellow-400/30 hover:shadow-xl ${isHidden ? 'opacity-60 bg-[#150f24]/30' : ''}`}>
                                                
                                                {/* Remove item button */}
                                                <button
                                                    onClick={() => handleRemoveQueueItem(item.id)}
                                                    className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
                                                    title="Discard from queue"
                                                    disabled={isBulkUploading}
                                                >
                                                    <X size={14} />
                                                </button>

                                                {/* Media details column */}
                                                <div className="flex gap-4 items-start">
                                                    {/* Thumbnail preview with Crop simulation */}
                                                    <div className="w-32 h-32 rounded-2xl bg-black border border-white/10 overflow-hidden shrink-0 relative flex items-center justify-center group">
                                                        {item.mediaType === 'video' ? (
                                                            <video
                                                                src={item.preview}
                                                                muted
                                                                playsInline
                                                                className="w-full h-full object-cover pointer-events-none"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full overflow-hidden flex items-center justify-center relative">
                                                                <img
                                                                    src={item.preview}
                                                                    className="max-w-none transition-transform"
                                                                    style={{
                                                                        transform: `scale(${item.cropZoom}) translate(${item.cropX}px, ${item.cropY}px)`,
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        objectFit: 'cover'
                                                                    }}
                                                                />
                                                                {/* Glowing crop border mockup */}
                                                                <div className="absolute inset-2 border border-dashed border-yellow-400/50 pointer-events-none rounded" />
                                                            </div>
                                                        )}
                                                        
                                                        {/* Sleek tactile hover overlay for re-selecting file */}
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 select-none z-10">
                                                            <label className="w-9 h-9 bg-yellow-500 hover:bg-yellow-600 text-brand-950 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg" title="Change Image/Media">
                                                                <Camera size={16} />
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept="image/*,video/*"
                                                                    disabled={isBulkUploading}
                                                                    onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (!file) return;
                                                                        
                                                                        if (item.preview.startsWith('blob:')) {
                                                                            URL.revokeObjectURL(item.preview);
                                                                        }
                                                                        
                                                                        const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|ogg|m4v)$/i.test(file.name);
                                                                        const mediaType = isVideo ? 'video' : 'image';
                                                                        const url = URL.createObjectURL(file);
                                                                        const detectedDate = detectDate(file) || item.date;
                                                                        const detectedName = getFileBaseName(file.name) || item.name;
                                                                        
                                                                        let duration = '';
                                                                        let videoDurationSeconds = 0;
                                                                        if (isVideo) {
                                                                            try {
                                                                                videoDurationSeconds = await getVideoDuration(file);
                                                                                duration = formatDuration(videoDurationSeconds);
                                                                            } catch (err) {
                                                                                console.error(err);
                                                                            }
                                                                        }
                                                                        
                                                                        handleUpdateQueueItem(item.id, {
                                                                            file,
                                                                            preview: url,
                                                                            name: detectedName,
                                                                            date: detectedDate,
                                                                            mediaType,
                                                                            duration,
                                                                            videoDurationSeconds,
                                                                            videoTrimStart: 0,
                                                                            videoTrimEnd: 100,
                                                                            cropZoom: 1
                                                                        });
                                                                    }}
                                                                />
                                                            </label>
                                                            <span className="text-[9px] font-black uppercase tracking-wider text-yellow-400">Change</span>
                                                        </div>

                                                        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded bg-black/80 border border-white/20 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-white z-10">
                                                            {item.mediaType}
                                                        </span>
                                                    </div>

                                                    <div className="flex-1 min-w-0 space-y-2">
                                                        {/* Editable file name */}
                                                        <div>
                                                            <label className="text-[9px] font-black tracking-widest uppercase text-gray-500">Moment Name</label>
                                                            <input
                                                                type="text"
                                                                value={item.name}
                                                                onChange={(e) => handleUpdateQueueItem(item.id, { name: e.target.value })}
                                                                className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-colors"
                                                                disabled={isBulkUploading}
                                                            />
                                                        </div>

                                                        {/* Date Detection input */}
                                                        <div>
                                                            <label className="text-[9px] font-black tracking-widest uppercase text-gray-500">Detected Date</label>
                                                            <input
                                                                type="date"
                                                                value={item.date}
                                                                onChange={(e) => handleUpdateQueueItem(item.id, { date: e.target.value })}
                                                                className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-colors cursor-pointer"
                                                                disabled={isBulkUploading}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Pre-editing Controls */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[9px] font-black tracking-widest uppercase text-gray-500">Category</label>
                                                        <select
                                                            value={item.category}
                                                            onChange={(e) => handleUpdateQueueItem(item.id, { category: e.target.value })}
                                                            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-yellow-400 focus:bg-[#1b1928] cursor-pointer"
                                                            disabled={isBulkUploading}
                                                        >
                                                            <option value="Sermons">Outreach / Sermons 🎙️</option>
                                                            <option value="Worship">Worship / Praise 🎵</option>
                                                            <option value="Youth">Youth Assembly 🧒</option>
                                                            <option value="Valparai">Valparai Mission ⛰️</option>
                                                            <option value="Highlights">Highlights Moments ✨</option>
                                                        </select>
                                                    </div>

                                                    <div className="flex flex-col justify-end">
                                                        <button
                                                            onClick={() => handleUpdateQueueItem(item.id, { hidden: !item.hidden })}
                                                            disabled={isBulkUploading}
                                                            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                                                                isHidden
                                                                    ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                                                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                                            }`}
                                                        >
                                                            {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                                            {isHidden ? 'Hidden' : 'Visible'}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Trimmer and Cropper sliders */}
                                                {item.mediaType === 'image' ? (
                                                    <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex items-center justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-gray-500 mb-1">
                                                                <span>Refine Image Crop</span>
                                                                <span className="text-yellow-400 font-bold">{item.cropZoom.toFixed(1)}x Zoom</span>
                                                            </div>
                                                            <input
                                                                type="range"
                                                                min="1"
                                                                max="2"
                                                                step="0.1"
                                                                value={item.cropZoom}
                                                                onChange={(e) => handleUpdateQueueItem(item.id, { cropZoom: parseFloat(e.target.value) })}
                                                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400 focus:outline-none"
                                                                disabled={isBulkUploading}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 font-bold bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">📸 Crop ready</span>
                                                    </div>
                                                ) : (
                                                    <div className="bg-[#1b1928] border border-white/5 p-3 rounded-2xl space-y-2">
                                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-gray-500">
                                                            <span>Timeline Clip Trimmer</span>
                                                            <span className="text-yellow-400 font-bold">Clip: {formatDuration(finalSecs)}</span>
                                                        </div>
                                                        
                                                        <div className="space-y-1">
                                                            <div className="flex items-center justify-between text-[8px] text-gray-400 font-bold">
                                                                <span>Trim Start: {item.videoTrimStart}%</span>
                                                                <span>Trim End: {item.videoTrimEnd}%</span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="90"
                                                                    value={item.videoTrimStart}
                                                                    onChange={(e) => handleUpdateQueueItem(item.id, { videoTrimStart: parseInt(e.target.value) })}
                                                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                                                                    disabled={isBulkUploading}
                                                                />
                                                                <input
                                                                    type="range"
                                                                    min="10"
                                                                    max="100"
                                                                    value={item.videoTrimEnd}
                                                                    onChange={(e) => handleUpdateQueueItem(item.id, { videoTrimEnd: parseInt(e.target.value) })}
                                                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                                                                    disabled={isBulkUploading}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-6 border-t border-white/10 flex flex-col gap-4 shrink-0">
                                {/* Upload progress bar */}
                                {isBulkUploading && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-black uppercase tracking-widest text-yellow-400">
                                            <span>Publishing batch to Cloud Storage & Database...</span>
                                            <span>{bulkUploadProgress}%</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                                            <div
                                                className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-300 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                                                style={{ width: `${bulkUploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Discard all items in the upload queue?")) {
                                                bulkQueue.forEach(item => {
                                                    if (item.mediaType === 'video' && item.preview.startsWith('blob:')) {
                                                        URL.revokeObjectURL(item.preview);
                                                    }
                                                });
                                                setBulkQueue([]);
                                            }
                                        }}
                                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold rounded-2xl transition-colors disabled:opacity-40 cursor-pointer"
                                        disabled={isBulkUploading}
                                    >
                                        Cancel All
                                    </button>
                                    <button
                                        onClick={handlePublishBulkQueue}
                                        disabled={isBulkUploading}
                                        className="flex-1 py-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-brand-950 rounded-2xl font-black uppercase tracking-wider hover:from-yellow-300 hover:to-amber-400 hover:shadow-lg hover:shadow-yellow-400/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40 active:scale-95 cursor-pointer"
                                    >
                                        {isBulkUploading ? (
                                            <span className="animate-pulse">Publishing Batch...</span>
                                        ) : (
                                            <><UploadCloud size={20} /> Publish Bulk Media ({bulkQueue.length})</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Complete Reboot Modal */}
            <CompleteRebootModal
                isOpen={showCompleteRebootModal}
                onClose={() => setShowCompleteRebootModal(false)}
                onSuccess={() => {
                    // Refresh the page after successful reboot
                    window.location.reload();
                }}
            />

            {/* Admin Dashboard Guided Tour */}
            <WelcomeTourModal
                isOpen={adminTour.showWelcome}
                onStartTour={adminTour.start}
                onSkip={() => { adminTour.setShowWelcome(false); localStorage.setItem('cot_tour_admin_dashboard', '1'); }}
                userName="Admin"
            />
            <GuidedTour
                steps={adminTourSteps}
                isActive={adminTour.isActive}
                onComplete={adminTour.stop}
                onSkip={adminTour.stop}
                tourName="admin_dashboard"
                accentColor="#4f46e5"
            />

            {/* AI Assistant Help Spotlight Highlight */}
            {helpHighlightStep && (
                <GuidedTour
                    steps={[helpHighlightStep]}
                    isActive={true}
                    onComplete={() => setHelpHighlightStep(null)}
                    onSkip={() => setHelpHighlightStep(null)}
                    tourName="admin_ai_help"
                    accentColor="#8b5cf6"
                />
            )}

            {/* Admin Session Greeting Overlay */}
            {showGreetingCard && (
                <GreetingCard
                    currentUser={null}
                    isAdmin={true}
                    onClose={() => {
                        setShowGreetingCard(false);
                        sessionStorage.setItem('cot_admin_session_greeted', '1');
                    }}
                    onStartTour={() => {
                        adminTour.start();
                    }}
                />
            )}

            {/* Admin Floating AI Chat Assistant */}
            <AIChatAssistant
                isAdmin={true}
                onHelpHighlight={(target, title, description) => {
                    setHelpHighlightStep({
                        target,
                        title,
                        description,
                        position: 'right' as const,
                        scrollIntoView: true
                    });
                }}
            />
        </div>
        </>
    );
};
