import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';
// import { collection, addDoc } from 'firebase/firestore'; // Removed Firebase mail collection usage
import { db, messaging } from './services/firebase';
import {
  Church,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  Youtube,
  Instagram,
  Facebook,
  Mail,
  Phone,
  Heart,
  Music,
  Users,
  User as UserIcon, AlertCircle, X,
  Star,
  Send,
  Mountain,
  History,
  Leaf,
  TrendingUp,
  CloudRain,
  Plane,
  BookOpen,
  ExternalLink,
  Camera,
  Droplets,
  Waves,
  Navigation,
  Sparkles,
  Scroll,
  MessageCircle,
  Briefcase,
  Headset,
  Cloud,
  Move,
  Zap,
  Flame,
  Award,
  Video,
  Play,
  ShieldCheck,
  ChevronRight,
  UploadCloud,
  CheckCircle,
  CreditCard,
  Globe
, HelpCircle } from 'lucide-react';
import { ViewState, User, UserRole, UserStatus, NavItem, DeletedUser, SubProfile, Permalink } from './types';
import { HEBREW_PAGES } from './hebrewRegistry';
import { Navbar } from './components/Navbar';
import { WebsiteBuilderManager } from './components/WebsiteBuilderManager';
import { WebsiteBuilderContext } from './components/WebsiteBuilderContext';
import { EditableText } from './components/EditableText';
import { PermalinkDisplay } from './components/PermalinkDisplay';
import { SharePageButton } from './components/SharePageButton';
import { Button } from './components/Button';
import { AuthPage } from './components/AuthPage';
// Removed SpiritualAssistant import
import { WorshipperIDCard, EntrustCard3D } from './components/WorshipperIDCard';
import { GoldenMenorah } from './components/GoldenMenorah';
import { GoldenMenorahPage } from './components/GoldenMenorahPage';
import { AIPage } from './components/AIPage';
import { DivineAssistant } from './components/DivineAssistant';
import AIChatAssistant from './components/AIChatAssistant';
import { MinistryHighlights, HebrewSanctuaryIntro, HebrewPagesPreviewSection, PastorBaruchPreviewSection, ValparaiPresence, EntrustCardPreview, LeaderMessageSection, DonationsHighlight, CommunityMembersSection, DailyPsalm119Section } from './components/HomeSections';
import { MessageFromLeader } from './components/MessageFromLeader';
import { HebrewAlphabetPage } from './components/HebrewAlphabetPage';
import { MinistriesPage } from './components/MinistriesPage';
import { BaruchHashemPage } from './components/BaruchHashemPage';
import { UserDashboard } from './components/UserDashboard';
import { ValparaiPage } from './components/ValparaiPage';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { AdminDashboard } from './components/AdminDashboard';
import { HebrewResources } from './components/HebrewResources';
import { QRVerifyPage } from './components/QRVerifyPage';
import { DonationModal } from './components/DonationModal';
import { PastorPage } from './components/PastorPage';
import { CommunityProfileForm } from './components/CommunityProfileForm';

import VerifyIDPage from './components/VerifyIDPage';
import { VisitingCard3D } from './components/VisitingCard3D';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BottomNav } from './components/BottomNav';
import GreetingCard from './components/GreetingCard';
import SplashScreen from './components/SplashScreen';

import { GlobalAnimatedCharacter } from './components/GlobalAnimatedCharacter';
import { GuidedTour, useTour } from './components/GuidedTour';
import { getHebrewDateInfo } from './components/CalendarLogic';
import { dynamicTours } from './components/dynamicTours';

import { api } from './services/api';
import { getAbsolutePagePermalink, getPagePath } from './services/routePaths';
import { getToken } from 'firebase/messaging';
import { sendFCMNotification } from './services/fcmService';
import { sendSMS } from './services/smsService';
import { startVisitorSession, updateSessionUser } from './services/analyticsService';

const youtubeLink = "https://youtube.com/@cotministries?si=A6179oNRuuJ9snjM";
const MAX_STORED_CONTACT_MESSAGES = 200;
const MESSAGE_RECYCLE_RETENTION_DAYS = 30;
const MESSAGE_RECYCLE_RETENTION_MS = MESSAGE_RECYCLE_RETENTION_DAYS * 24 * 60 * 60 * 1000;
const REJECTED_ACCESS_MESSAGE = 'Your account was rejected. Dashboard access is blocked. Please contact admin.';
const PAGE_PERMALINK_OVERRIDES_KEY = 'cot_page_permalink_overrides';
const HERO_VERSES = [
  { text: 'Then you will know the truth, and the truth will set you free.', ref: 'John 8:32' },
  { text: 'The Lord is my shepherd; I shall not want.', ref: 'Psalm 23:1' },
  { text: 'Fear not, for I am with you; be not dismayed, for I am your God.', ref: 'Isaiah 41:10' },
  { text: 'For I know the plans I have for you, declares the Lord.', ref: 'Jeremiah 29:11' },
];
const REGISTRATION_CLOSES_AT = new Date('2026-08-12T23:59:59+05:30').getTime();

const getPagePermalinkOverrides = (): Partial<Record<ViewState, string>> => {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(PAGE_PERMALINK_OVERRIDES_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};


const RevealText: React.FC<{ text: string; className?: string; delay?: number }> = ({ text, className = "", delay = 0 }) => {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.span
        initial={{ y: "100%" }}
        whileInView={{ y: 0 }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className="block"
      >
        {text}
      </motion.span>
    </div>
  );
};

const letterContainer = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.04 * i },
  }),
};

const letterChild = {
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
    },
  },
  hidden: {
    opacity: 0,
    y: 20,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};


// LIGHT THEMED TESTIMONIAL SECTION
interface TestimonialSectionProps {
  currentUser?: User;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  source: 'hero-widget' | 'contact-form';
  senderType: 'Registered' | 'Non-Registered';
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
  kind: 'message' | 'approved' | 'disapproved' | 'recycle' | 'recycle-removed' | 'leader';
  ctaView?: ViewState;
  read: boolean;
  deletedAt?: string;
  autoDeleteAt?: string;
  imageUrl?: string;
}

const normalizeDeletedMessageMeta = <T extends { createdAt?: string; deletedAt?: string; autoDeleteAt?: string }>(item: T): T => {
  const deletedAt = item.deletedAt || new Date().toISOString();
  const autoDeleteAt = item.autoDeleteAt || new Date(new Date(deletedAt).getTime() + MESSAGE_RECYCLE_RETENTION_MS).toISOString();
  return {
    ...item,
    deletedAt,
    autoDeleteAt
  };
};

const isRecycleMessageAlive = (item: { autoDeleteAt?: string }) => {
  const expiresAt = item.autoDeleteAt ? new Date(item.autoDeleteAt).getTime() : Number.POSITIVE_INFINITY;
  return Number.isFinite(expiresAt) ? expiresAt > Date.now() : true;
};

const HEBREW_RESOURCE_SUBMENU: NavItem[] = HEBREW_PAGES.filter(p => p.type === 'content' && !p.isStandalone).map(p => ({
  label: p.label,
  view: p.view
}));

const HEBREW_ALPHABET_NAV: NavItem = {
  label: 'ALPHABET',
  view: ViewState.HEBREW,
  href: '/hebrew-alphabet',
};

const HEBREW_TOOLS_SUBMENU: NavItem[] = HEBREW_PAGES.filter(p => p.type === 'tools').map(p => ({
  label: p.label,
  view: p.view
}));

const withHebrewResourceSubmenu = (items: NavItem[]): NavItem[] =>
  items
  .filter(item => {
    const label = String(item.label || '').toUpperCase().trim();
    return label !== 'ALPHABETS' && label !== 'ALPHABET';
  })
  .map(item => {
    const labelUpper = String(item.label || '').toUpperCase().trim();
    if (labelUpper === 'HEBREW CONTENT' || labelUpper === 'HEBREW RESOURCES' || labelUpper === 'HEBREW') {
      return { ...item, submenu: HEBREW_RESOURCE_SUBMENU };
    }
    if (labelUpper === 'HEBREW TOOLS') {
      return { ...item, submenu: HEBREW_TOOLS_SUBMENU };
    }
    return item;
  });

const VIEW_ALIASES: Record<string, ViewState> = {
  MENORAH: ViewState.GOLDEN_MENORAH,
  MENORAH_FLAG: ViewState.GOLDEN_MENORAH,
  GOLDEN_MENORAH_FLAG: ViewState.GOLDEN_MENORAH,
  GOLDENMENORAH: ViewState.GOLDEN_MENORAH,
  ENTRUST_CARD: ViewState.ID_CARD,
  ENTRUSTCARD: ViewState.ID_CARD,
  WORSHIPPER_CARD: ViewState.ID_CARD,
  WORSHIPPERCARD: ViewState.ID_CARD,
  WORSHIPPER_ID: ViewState.ID_CARD,
  HEBREW_CONTENT: ViewState.ABOUT,
  HEBREW_RESOURCES: ViewState.ABOUT,
  HEBREW_ALPHABET: ViewState.HEBREW,
  HEBREWALPHABET: ViewState.HEBREW,
  USER_DASHBOARD: ViewState.USER_DASHBOARD,
  USERDASHBOARD: ViewState.USER_DASHBOARD,
  ADMIN: ViewState.ADMIN_DASHBOARD,
  ADMIN_DASHBOARD: ViewState.ADMIN_DASHBOARD,
  FEAST_CALENDAR: ViewState.HEBREW_FESTIVALS,
  FEASTCALENDAR: ViewState.HEBREW_FESTIVALS,
  PRAYER_REQUESTS: ViewState.CONTACT,
  PRAYERREQUESTS: ViewState.CONTACT,
  GIVING: ViewState.CONTACT,
  BIBLE: ViewState.BARUCH_HASHEM,
  MEMBER_FORM: ViewState.MEMBER_FORM,
  MEMBERFORM: ViewState.MEMBER_FORM,
  MEMBER_PROFILE: ViewState.MEMBER_FORM,
  COMMUNITY_PROFILE: ViewState.MEMBER_FORM,
};


const normalizeViewState = (value: unknown, fallback: ViewState = ViewState.HOME): ViewState => {
  if (typeof value !== 'string') return fallback;
  const normalizedKey = value.trim().toUpperCase().replace(/[\s-]+/g, '_');
  const validView = Object.values(ViewState).find(v => v === normalizedKey);
  if (validView) return validView as ViewState;
  return VIEW_ALIASES[normalizedKey] || fallback;
};

const normalizeNavItems = (items: unknown): NavItem[] => {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item): item is { label?: unknown; view?: unknown; submenu?: unknown } => !!item && typeof item === 'object')
    .map((item) => {
      const label = typeof item.label === 'string' && item.label.trim() ? item.label : 'HOME';
      const view = normalizeViewState(item.view, ViewState.HOME);
      const href = typeof (item as { href?: unknown }).href === 'string' && (item as { href: string }).href.trim()
        ? (item as { href: string }).href.trim()
        : undefined;
      const submenu = Array.isArray(item.submenu)
        ? item.submenu
            .filter((sub): sub is { label?: unknown; view?: unknown; href?: unknown } => !!sub && typeof sub === 'object')
            .map((sub) => ({
              label: typeof sub.label === 'string' && sub.label.trim() ? sub.label : label,
              view: normalizeViewState(sub.view, view),
              href: typeof sub.href === 'string' && sub.href.trim() ? sub.href.trim() : undefined,
            }))
        : undefined;
      return { label, view, href, submenu };
    });
};

const ensureHebrewNavItems = (items: NavItem[]): NavItem[] => {
  const normalizedItems = withHebrewResourceSubmenu(items);
  const hasHebrewResources = normalizedItems.some(item => item.label === 'HEBREW RESOURCES' || item.label === 'HEBREW CONTENT' || item.label === 'HEBREW');
  const hasHebrewTools = normalizedItems.some(item => item.label === 'HEBREW TOOLS');

  const next = [...normalizedItems];
  if (!hasHebrewResources) {
    next.splice(1, 0, { label: 'HEBREW RESOURCES', view: ViewState.ABOUT, submenu: HEBREW_RESOURCE_SUBMENU });
  }
  if (!hasHebrewTools) {
    next.splice(2, 0, { label: 'HEBREW TOOLS', view: ViewState.HEBREW_TOOLS, submenu: HEBREW_TOOLS_SUBMENU });
  }
  const withMenus = withHebrewResourceSubmenu(next);
  const hasAlphabetNav = withMenus.some(item => item.href === '/hebrew-alphabet');
  if (!hasAlphabetNav) {
    const insertAt = Math.min(2, withMenus.length);
    withMenus.splice(insertAt, 0, HEBREW_ALPHABET_NAV);
  }
  return withMenus;
};

const DEFAULT_HOME_SECTIONS_ORDER = ['hero', 'dailyPsalm', 'about', 'menorah', 'highlights', 'leader', 'hebrew', 'hebrewPages', 'pastorBaruch', 'valparai', 'testimonials', 'members', 'preview', 'donations', 'verify'];

const normalizeHomeSectionsOrder = (sections: string[]): string[] => {
  // Preserve the INPUT order — only deduplicate and add genuinely missing sections
  const uniqueSections = Array.from(new Set(sections));
  const validSections = uniqueSections.filter(s => DEFAULT_HOME_SECTIONS_ORDER.includes(s));
  const missingSections = DEFAULT_HOME_SECTIONS_ORDER.filter(s => !validSections.includes(s));
  return [...validSections, ...missingSections];
};

const TestimonialSection: React.FC<TestimonialSectionProps> = ({ currentUser }) => {
  const [formData, setFormData] = useState({ name: currentUser?.name || '', location: currentUser?.location || '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    const trimmedText = formData.text.trim();
    const trimmedLocation = formData.location.trim();
    if (!trimmedName || !trimmedText) {
      alert("Please fill in your name and testimony.");
      return;
    }

    setIsSubmitting(true);
    try {
      const isRegistered = !!currentUser;
      const senderStatus = isRegistered ? currentUser.status : 'Guest';
      await api.createTestimonial({
        userId: isRegistered ? currentUser.id : 'NON_REGISTERED',
        userName: isRegistered ? (currentUser.name || trimmedName) : trimmedName,
        content: trimmedText,
        date: new Date().toISOString(),
        status: 'Pending',
        rating: 5,
        userPhoto: isRegistered ? currentUser.photo : undefined,
        location: isRegistered ? currentUser.location : trimmedLocation,
        role: isRegistered ? currentUser.role : 'Guest',
        senderType: isRegistered ? 'Registered' : 'Non-Registered',
        senderStatus
      });
      alert("Testimony sent successfully! It will be visible after approval.");
      setFormData({ name: '', location: '', text: '' });
    } catch (error) {
      console.error(error);
      alert("Failed to send testimony. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isApproved = currentUser?.status === 'Active';

  return (
    <section className="py-24 relative z-10 overflow-hidden bg-slate-50">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-950 mb-4">Voices of Faith</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg font-normal mb-8">Hear how City of Truth Ministries is impacting lives in Valparai and beyond.</p>
        </div>

        <div className={isApproved ? "grid lg:grid-cols-2 gap-16 items-start" : "max-w-3xl mx-auto w-full"}>
          {/* Integrated Form Side - Light Theme */}
          {isApproved && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-brand-600 p-3 rounded-2xl text-white shadow-lg">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-brand-950">Share Your Testimony</h3>
                  <p className="text-sm text-slate-500">Your story can be a beacon for someone else.</p>
                </div>
              </div>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 p-4 rounded-xl outline-none text-brand-950 cursor-not-allowed opacity-70"
                    value={formData.name}
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 p-4 rounded-xl outline-none text-brand-950 cursor-not-allowed opacity-70"
                    value={formData.location}
                  />
                </div>
                <textarea
                  placeholder="Tell us about your encounter with God's truth..."
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-brand-500 transition-colors text-brand-950 placeholder:text-slate-400 h-40"
                  value={formData.text}
                  onChange={e => setFormData({ ...formData, text: e.target.value })}
                ></textarea>
                <Button disabled={isSubmitting} variant="primary" fullWidth className="py-4 shadow-xl shadow-brand-500/20">
                  {isSubmitting ? "Sending..." : "Send Testimony"} <Send size={18} />
                </Button>
              </form>
            </motion.div>
          )}

          {/* Testimonials List Side - Light Theme */}
          <div className="space-y-6">
            {[
              { name: "S.Shaveesh Jeshurun", role: "Member", text: "This ministry has completely transformed my spiritual life. The community in Valparai is so welcoming and the teachings are profound.", rating: 5 },
              { name: "Sri Priya", role: "Visitor", text: "A beautiful place to worship amidst the hills. The presence of God is tangible here from the first prayer.", rating: 5 },
              { name: "Prasad R", role: "Volunteer", text: "Wonderful service and amazing youth programs. Blessed to be part of this family and grow in His truth.", rating: 5 }
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-3xl shadow-md border border-slate-100 hover:shadow-xl transition-all group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold border border-brand-100">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-950 leading-none">{t.name}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 mt-1 block">{t.role}</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, starI) => (
                      <Star key={starI} size={12} className={`${starI < Math.floor(t.rating) ? "text-amber-500 fill-amber-500" : "text-slate-200"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 italic leading-relaxed font-serif">"{t.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const App: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [dismissRecycleNotice, setDismissRecycleNotice] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [authInitialView] = useState<'choice' | 'login' | 'register' | 'forgot-id'>('login');
  const [selectedDashboardProfileId, setSelectedDashboardProfileId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLeaderMessage, setShowLeaderMessage] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMode, setCelebrationMode] = useState<'approval' | 'welcome'>('approval');
  const [statusNotice, setStatusNotice] = useState<{ type: 'approved' | 'rejected'; message: string } | null>(null);
  const [showWelcomeIntro, setShowWelcomeIntro] = useState(false);
  const [sessionGreeting, setSessionGreeting] = useState<string | null>(null);
  const [showGreetingCard, setShowGreetingCard] = useState(false);

  // Splash screen — first-visit detection via localStorage
  const isFirstVisit = (() => {
    try { return !localStorage.getItem('cot_has_visited'); } catch { return true; }
  })();
  const [showSplash, setShowSplash] = useState(true);
  const liveWebsiteTour = useTour('live_website');

  // Dynamic guided tour state
  const [activeDynamicTourName, setActiveDynamicTourName] = useState<string | null>(null);

  useEffect(() => {
    const handleStartDynamicTour = (e: CustomEvent<string>) => {
      const tourName = e.detail;
      if (dynamicTours[tourName]) {
        setActiveDynamicTourName(tourName);
      } else {
        console.warn(`Dynamic tour "${tourName}" not found.`);
      }
    };

    // @ts-ignore - custom event type
    window.addEventListener('start-dynamic-tour', handleStartDynamicTour);
    // @ts-ignore
    return () => window.removeEventListener('start-dynamic-tour', handleStartDynamicTour);
  }, []);

  const liveWebsiteTourSteps = [
    {
      target: '#nav-logo',
      title: 'City of Truth Ministries',
      description: 'Welcome to our sanctuary portal. Click here anytime to return to the home screen.',
      position: 'bottom' as const
    },
    {
      target: '#nav-hebrew-btn',
      title: 'Hebrew Word Hub & Resources',
      description: 'Explore ancient scripts, practice pronunciation with our interactive mouth animator, and learn Gematria.',
      position: 'bottom' as const
    },
    {
      target: '#nav-register-btn',
      title: 'Register & Member Cards',
      description: 'Register to receive your unique COT Member ID and generate a beautiful 3D printable Entrust Card.',
      position: 'bottom' as const
    },
    {
      target: '#ai-chat-launcher-btn',
      title: 'Spiritual AI Assistant',
      description: 'Have questions? Chat with our AI assistant for scriptural references, prayer guides, and page navigation help.',
      position: 'left' as const
    }
  ];
  const [tourStepIndex, setTourStepIndex] = useState<number | null>(null);
  const [tourRect, setTourRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [heroEmail, setHeroEmail] = useState('');
  const [heroVerseIndex, setHeroVerseIndex] = useState(0);
  const [heroNow, setHeroNow] = useState(Date.now());
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() => {
    try {
      const saved = localStorage.getItem('cot_contact_messages');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: 'Prayer Request',
    message: ''
  });
  // Load currentUser from localStorage on mount
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('cot_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [navigationItems, setNavigationItems] = useState<NavItem[]>(ensureHebrewNavItems([
    { label: 'HOME', view: ViewState.HOME },
    HEBREW_ALPHABET_NAV,
    {
      label: 'HEBREW RESOURCES',
      view: ViewState.ABOUT,
      submenu: HEBREW_RESOURCE_SUBMENU
    },
    {
      label: 'HEBREW TOOLS',
      view: ViewState.HEBREW_TOOLS,
      submenu: HEBREW_TOOLS_SUBMENU
    },
    { label: 'HEBREW GRAMMAR', view: ViewState.HEBREW_GRAMMAR },
    { label: 'ERETZ ISRAEL', view: ViewState.HEBREW_ISRAEL },
    { label: 'PDF DOWNLOADS', view: ViewState.PDF_DOWNLOADS },
    { label: 'VALPARAI', view: ViewState.ABOUT_VALPARAI },
    { label: 'PASTOR', view: ViewState.PASTOR },
    { label: 'MINISTRIES', view: ViewState.MINISTRIES },
    { label: 'MENORAH', view: ViewState.GOLDEN_MENORAH },
    { label: 'BARUCH HASHEM', view: ViewState.BARUCH_HASHEM },
    { label: 'AI ASSISTANCE', view: ViewState.AI },
    { label: 'ENTRUST CARD', view: ViewState.ID_CARD },
    { label: 'CONTACT', view: ViewState.CONTACT },
  ]));

  useEffect(() => {
    const verseTimer = window.setInterval(() => {
      setHeroVerseIndex(prev => (prev + 1) % HERO_VERSES.length);
    }, 6000);
    const countdownTimer = window.setInterval(() => setHeroNow(Date.now()), 1000);
    return () => {
      window.clearInterval(verseTimer);
      window.clearInterval(countdownTimer);
    };
  }, []);

  const heroVerse = HERO_VERSES[heroVerseIndex % HERO_VERSES.length];
  const registrationRemainingMs = Math.max(0, REGISTRATION_CLOSES_AT - heroNow);
  const countdown = {
    days: Math.floor(registrationRemainingMs / 86400000),
    hours: Math.floor((registrationRemainingMs % 86400000) / 3600000),
    minutes: Math.floor((registrationRemainingMs % 3600000) / 60000),
  };

  const [memberNotifications, setMemberNotifications] = useState<MemberNotification[]>(() => {
    try {
      const saved = localStorage.getItem('cot_member_notifications');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [dismissedFloatingNotificationId, setDismissedFloatingNotificationId] = useState<string | null>(null);
  const [deletedContactMessages, setDeletedContactMessages] = useState<ContactMessage[]>(() => {
    try {
      const saved = localStorage.getItem('cot_deleted_contact_messages');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed)
        ? parsed.map((item) => normalizeDeletedMessageMeta(item)).filter(isRecycleMessageAlive)
        : [];
    } catch {
      return [];
    }
  });
  const [deletedMemberNotifications, setDeletedMemberNotifications] = useState<MemberNotification[]>(() => {
    try {
      const saved = localStorage.getItem('cot_deleted_member_notifications');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed)
        ? parsed.map((item) => normalizeDeletedMessageMeta(item)).filter(isRecycleMessageAlive)
        : [];
    } catch {
      return [];
    }
  });

  const [homeSectionsOrder, setHomeSectionsOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cot_home_sections_order');
      return saved ? normalizeHomeSectionsOrder(JSON.parse(saved)) : DEFAULT_HOME_SECTIONS_ORDER;
    } catch (e) {
      return DEFAULT_HOME_SECTIONS_ORDER;
    }
  });

  const [homeSectionsHidden, setHomeSectionsHidden] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('cot_home_sections_hidden');
      const parsed = saved ? JSON.parse(saved) : {};
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  });

  const [permalinks, setPermalinks] = useState<Permalink[]>([]);

  useEffect(() => {
    const nextOrder = normalizeHomeSectionsOrder(homeSectionsOrder);
    if (JSON.stringify(nextOrder) === JSON.stringify(homeSectionsOrder)) return;
    setHomeSectionsOrder(nextOrder);
    localStorage.setItem('cot_home_sections_order', JSON.stringify(nextOrder));
  }, [homeSectionsOrder]);

  useEffect(() => {
    try {
      localStorage.setItem('cot_home_sections_hidden', JSON.stringify(homeSectionsHidden || {}));
    } catch {
      // ignore quota/storage errors
    }
  }, [homeSectionsHidden]);

  const isFrame = typeof window !== 'undefined' && window.self !== window.top && window.location.search.includes('preview=true');

  // Listen for admin preview messages (sections reordering and navigation)
  useEffect(() => {
    const handleAdminMessage = (event: MessageEvent) => {
      const { action, order, view, source } = event.data || {};
      if (source === 'admin-dashboard') {
        console.log('Received admin preview message:', event.data);
        if (action === 'admin-connected') {
          console.log('Admin dashboard connected in iframe mode');
        } else if (action === 'update-sections-order' && Array.isArray(order)) {
          setHomeSectionsOrder(order);
        } else if (action === 'navigate' && view) {
          setCurrentView(normalizeViewState(view));
        }
      }
    };

    window.addEventListener('message', handleAdminMessage);
    return () => window.removeEventListener('message', handleAdminMessage);
  }, []);

  useEffect(() => {
    if (currentView === ViewState.USER_DASHBOARD && !currentUser) {
      navigate('/auth?view=login');
    }
  }, [currentView, currentUser, navigate]);

  useEffect(() => {
    if (currentView === ViewState.HEBREW) {
      handleViewChange(ViewState.HOME);
      navigate('/hebrew-alphabet');
    }
  }, [currentView, navigate]);

  // Analytics: Track Site Visits
  const hasTrackedVisit = React.useRef(false);
  useEffect(() => {
    if (hasTrackedVisit.current) return;
    hasTrackedVisit.current = true;

    const trackVisit = async () => {
      try {
        let deviceId = localStorage.getItem('cot_device_id');
        let visitCountStr = localStorage.getItem('cot_visit_count');
        let isNewDevice = false;
        
        if (!deviceId) {
          deviceId = 'dev_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
          localStorage.setItem('cot_device_id', deviceId);
          isNewDevice = true;
        }

        let visitCount = visitCountStr ? parseInt(visitCountStr, 10) : 0;
        visitCount += 1;
        localStorage.setItem('cot_visit_count', visitCount.toString());

        const visitId = 'visit_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
        const userId = currentUser ? currentUser.id : 'Guest';

        const visit = {
          id: visitId,
          deviceId,
          userId,
          isNewDevice,
          visitCount,
          timestamp: new Date().toISOString()
        };

        await api.recordVisit(visit);
      } catch (err) {
        console.error('Failed to record site visit', err);
      }
    };

    trackVisit();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Live Analytics: Start visitor session on mount
  useEffect(() => {
    startVisitorSession(currentUser ? { id: currentUser.id, name: currentUser.name, role: currentUser.role } : null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live Analytics: Update session when user logs in/out
  useEffect(() => {
    if (currentUser) {
      updateSessionUser({ id: currentUser.id, name: currentUser.name, role: currentUser.role });
    }
  }, [currentUser?.id]);

  useEffect(() => {
    localStorage.setItem('cot_contact_messages', JSON.stringify(contactMessages));
  }, [contactMessages]);

  useEffect(() => {
    localStorage.setItem('cot_member_notifications', JSON.stringify(memberNotifications));
  }, [memberNotifications]);
  useEffect(() => {
    localStorage.setItem('cot_deleted_contact_messages', JSON.stringify(deletedContactMessages));
  }, [deletedContactMessages]);
  useEffect(() => {
    localStorage.setItem('cot_deleted_member_notifications', JSON.stringify(deletedMemberNotifications));
  }, [deletedMemberNotifications]);
  useEffect(() => {
    const purgeExpiredDeletedMessages = () => {
      setDeletedContactMessages(prev => prev.filter(isRecycleMessageAlive));
      setDeletedMemberNotifications(prev => prev.filter(isRecycleMessageAlive));
    };
    purgeExpiredDeletedMessages();
    const intervalId = window.setInterval(purgeExpiredDeletedMessages, 60 * 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, []);
  const [dashboardFocusSection, setDashboardFocusSection] = useState<'notifications' | null>(null);
  useEffect(() => {
    if (currentView !== ViewState.USER_DASHBOARD && dashboardFocusSection) {
      setDashboardFocusSection(null);
    }
  }, [currentView, dashboardFocusSection]);

  const TOUR_STEPS = [
    { selector: '#tour-register-btn', title: 'Start Here', text: 'Tap Register Now to create your member profile.' },
    { selector: '#tour-login-btn', title: 'Returning Member Login', text: 'Use Login if you already have an account.' },
    { selector: '#tour-verify-login-card', title: 'Verification Hub', text: 'Use this section to login and verify membership access.' },
    { selector: '#tour-hebrew-content-open', title: 'Hebrew Content', text: 'Open Hebrew content hub previews and learning pages from this card.' },
    { selector: '#tour-hebrew-tools-open', title: 'Hebrew Tools', text: 'Open Hebrew tools previews and jump into study tools directly.' },
  ];

  const markVisitorAsSeen = () => {
    try {
      localStorage.setItem('cot_visitor_seen', '1');
    } catch (error) {
      console.error('Failed to store visitor state', error);
    }
  };

  const closeTour = () => {
    setTourStepIndex(null);
    setTourRect(null);
  };

  const skipIntro = () => {
    markVisitorAsSeen();
    setShowWelcomeIntro(false);
  };

  const startTour = () => {
    markVisitorAsSeen();
    setShowWelcomeIntro(false);
    setTourStepIndex(0);
  };

  const saveContactMessage = (payload: Omit<ContactMessage, 'id' | 'createdAt'>) => {
    const next: ContactMessage = {
      ...payload,
      id: `MSG-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setContactMessages(prev => [next, ...prev].slice(0, MAX_STORED_CONTACT_MESSAGES));
  };

  const handleDeleteContactMessage = (messageId: string) => {
    setContactMessages(prev => {
      const target = prev.find(msg => msg.id === messageId);
      if (target) {
        setDeletedContactMessages(old => [normalizeDeletedMessageMeta(target), ...old.filter(item => item.id !== messageId)].slice(0, MAX_STORED_CONTACT_MESSAGES));
      }
      return prev.filter(msg => msg.id !== messageId);
    });
  };

  const handleRestoreContactMessage = (messageId: string) => {
    setDeletedContactMessages(prev => {
      const target = prev.find(msg => msg.id === messageId);
      if (target) {
        const { deletedAt, autoDeleteAt, ...restored } = target;
        setContactMessages(old => [restored, ...old.filter(item => item.id !== messageId)].slice(0, MAX_STORED_CONTACT_MESSAGES));
      }
      return prev.filter(msg => msg.id !== messageId);
    });
  };

  const handleAdminSendMessageToUsers = (targetUserIds: string[], message: string, imageUrl?: string, kind: MemberNotification['kind'] = 'message') => {
    const trimmed = message.trim();
    if (!trimmed || targetUserIds.length === 0) return;

    const createdAt = new Date().toISOString();
    const nextNotifications: MemberNotification[] = targetUserIds.map((userId, index) => ({
      id: `NTF-${Date.now()}-${index}-${userId}`,
      userId,
      from: 'admin',
      message: trimmed,
      createdAt,
      kind,
      ctaView: ViewState.USER_DASHBOARD,
      read: false,
      ...(imageUrl ? { imageUrl } : {})
    }));

    setMemberNotifications(prev => [...nextNotifications, ...prev].slice(0, 1000));
    nextNotifications.forEach(note => {
      api.saveNotification(note).catch(err => {
        console.error('Failed to save notification to cloud:', err);
      });
    });

    // Also push FCM + SMS for each targeted user
    targetUserIds.forEach(userId => {
      const targetUser = users.find(u => u.id === userId || u.id.toUpperCase() === userId.toUpperCase());
      if (targetUser) {
        if (targetUser.phone) {
          sendSMS(targetUser.phone, `COT Notification: ${trimmed}`).catch(err => {
            console.error('Failed to send SMS to', targetUser.name, err);
          });
        }
        if (targetUser.fcmTokens && targetUser.fcmTokens.length > 0) {
          sendFCMNotification(targetUser.fcmTokens, 'City of Truth Ministries', trimmed, imageUrl).catch(err => {
            console.error('Failed to send FCM to', targetUser.name, err);
          });
        }
      }
    });
  };

  const pushAdminNotification = (
    userId: string,
    message: string,
    kind: MemberNotification['kind'] = 'message',
    ctaView: ViewState = ViewState.USER_DASHBOARD,
    imageUrl?: string
  ) => {
    const trimmed = message.trim();
    if (!trimmed || !userId) return;
    const createdAt = new Date().toISOString();
    const next: MemberNotification = {
      id: `NTF-AUTO-${Date.now()}-${Math.floor(Math.random() * 1000)}-${userId}`,
      userId,
      from: 'admin',
      message: trimmed,
      createdAt,
      kind,
      ctaView,
      read: false,
      ...(imageUrl ? { imageUrl } : {})
    };
    setMemberNotifications(prev => [next, ...prev].slice(0, 1000));
    api.saveNotification(next).catch(err => {
      console.error('Failed to save auto-notification to cloud:', err);
    });

    // Send mobile notification (SMS) via Twilio if user has a registered phone number
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      if (targetUser.phone) {
        sendSMS(targetUser.phone, `COT Notification: ${trimmed}`).catch(err => {
          console.error("Failed to send mobile notification:", err);
        });
      }
      if (targetUser.fcmTokens && targetUser.fcmTokens.length > 0) {
        sendFCMNotification(targetUser.fcmTokens, "City of Truth Ministries", trimmed, imageUrl).catch(err => {
          console.error("Failed to send FCM push notification:", err);
        });
      }
    }
  };

  const notifyMemberFormRefillIfRejected = (prevUser: User | undefined, nextUser: User) => {
    if (!prevUser) return;

    const wasPrimaryRejected = prevUser.communityProfile?.status === 'Rejected';
    const isPrimaryRejected = nextUser.communityProfile?.status === 'Rejected';
    if (isPrimaryRejected && !wasPrimaryRejected) {
      pushAdminNotification(
        nextUser.id,
        'Your Member Form was rejected by admin. Please open your dashboard and refill the Member Form with corrected details.',
        'message',
        ViewState.MEMBER_FORM
      );
    }

    const previousLinkedProfiles = new Map((prevUser.linkedProfiles || []).map(profile => [profile.id, profile]));
    (nextUser.linkedProfiles || []).forEach(profile => {
      const wasLinkedFormRejected = previousLinkedProfiles.get(profile.id)?.communityProfile?.status === 'Rejected';
      const isLinkedFormRejected = profile.communityProfile?.status === 'Rejected';
      if (isLinkedFormRejected && !wasLinkedFormRejected) {
        pushAdminNotification(
          nextUser.id,
          `Member Form for ${profile.name || 'your additional member'} was rejected by admin. Please open your dashboard, select that profile, and refill the Member Form with corrected details.`,
          'message',
          ViewState.MEMBER_FORM
        );
      }
    });
  };

  const getRecycleDaysRemaining = (autoDeleteAt?: string) => {
    if (!autoDeleteAt) return 0;
    const diff = new Date(autoDeleteAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  };

  const handleUserReplyToAdmin = (userId: string, message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    const reply: MemberNotification = {
      id: `RPLY-${Date.now()}-${userId}`,
      userId,
      from: 'user',
      message: trimmed,
      createdAt: new Date().toISOString(),
      kind: 'message',
      read: false
    };
    setMemberNotifications(prev => [reply, ...prev].slice(0, 1000));
    api.saveNotification(reply).catch(err => {
      console.error('Failed to save user reply to cloud:', err);
    });
  };

  const handleMarkUserNotificationsRead = (userId: string) => {
    setMemberNotifications(prev => {
      const updated = prev.map(note => (
        note.userId === userId && note.from === 'admin' && !note.read
          ? { ...note, read: true }
          : note
      ));
      prev.forEach(note => {
        if (note.userId === userId && note.from === 'admin' && !note.read) {
          api.saveNotification({ ...note, read: true }).catch(err => {
            console.error('Failed to save read state to cloud:', err);
          });
        }
      });
      return updated;
    });
  };

  const handleUpdateMemberNotification = (updated: MemberNotification) => {
    setMemberNotifications(prev => prev.map(note => note.id === updated.id ? updated : note));
    api.saveNotification(updated).catch(err => {
      console.error('Failed to save updated notification to cloud:', err);
    });
  };

  const handleDeleteMemberNotification = (notificationId: string) => {
    setMemberNotifications(prev => {
      const target = prev.find(note => note.id === notificationId);
      if (target) {
        setDeletedMemberNotifications(old => [normalizeDeletedMessageMeta(target), ...old.filter(item => item.id !== notificationId)].slice(0, 1000));
        api.deleteNotification(notificationId).catch(err => {
          console.error('Failed to delete notification in cloud:', err);
        });
      }
      return prev.filter(note => note.id !== notificationId);
    });
  };

  const handleRestoreMemberNotification = (notificationId: string) => {
    setDeletedMemberNotifications(prev => {
      const target = prev.find(note => note.id === notificationId);
      if (target) {
        const { deletedAt, autoDeleteAt, ...restored } = target;
        setMemberNotifications(old => [restored, ...old.filter(item => item.id !== notificationId)].slice(0, 1000));
        api.saveNotification(restored).catch(err => {
          console.error('Failed to save restored notification to cloud:', err);
        });
      }
      return prev.filter(note => note.id !== notificationId);
    });
  };

  const handleDeleteUserNotification = (userId: string, notificationId: string) => {
    setMemberNotifications(prev => {
      const target = prev.find(note => note.id === notificationId && note.userId === userId && note.from === 'admin');
      if (target) {
        setDeletedMemberNotifications(old => [normalizeDeletedMessageMeta(target), ...old.filter(item => item.id !== notificationId)].slice(0, 1000));
        api.deleteNotification(notificationId).catch(err => {
          console.error('Failed to delete user notification in cloud:', err);
        });
      }
      return prev.filter(note => !(note.id === notificationId && note.userId === userId && note.from === 'admin'));
    });
  };

  const getContactSenderMeta = (fallbackName = '', fallbackEmail = '') => {
    const isRegistered = !!currentUser;
    const nonRegisteredName = fallbackName.trim() || 'Website Visitor';
    const nonRegisteredEmail = fallbackEmail.trim();

    return {
      senderType: isRegistered ? 'Registered' as const : 'Non-Registered' as const,
      senderId: isRegistered ? currentUser?.id : undefined,
      name: isRegistered ? (currentUser?.name?.trim() || nonRegisteredName) : nonRegisteredName,
      email: isRegistered ? (currentUser?.email?.trim() || nonRegisteredEmail) : nonRegisteredEmail
    };
  };

  const handleHeroSendMessage = () => {
    const message = heroEmail.trim();
    if (!message) return;
    const sender = getContactSenderMeta();
    saveContactMessage({
      name: sender.name,
      email: sender.email,
      subject: sender.senderId ? `Hero Quick Message (${sender.senderId})` : 'Hero Quick Message',
      message,
      source: 'hero-widget',
      senderType: sender.senderType,
      senderId: sender.senderId
    });
    setHeroEmail('');
    setShowLeaderMessage(true);
    alert('Message sent successfully. Admin will receive it in the dashboard.');
  };

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isRegistered = !!currentUser;
    if (!contactForm.message.trim() || (!isRegistered && (!contactForm.name.trim() || !contactForm.email.trim()))) {
      alert(isRegistered ? 'Please enter your message.' : 'Please fill in your name, email, and message.');
      return;
    }
    const sender = getContactSenderMeta(contactForm.name, contactForm.email);
    saveContactMessage({
      name: sender.name,
      email: sender.email,
      subject: sender.senderId
        ? `${contactForm.subject.trim() || 'General Inquiry'} (${sender.senderId})`
        : (contactForm.subject.trim() || 'General Inquiry'),
      message: contactForm.message.trim(),
      source: 'contact-form',
      senderType: sender.senderType,
      senderId: sender.senderId
    });
    setContactForm({ name: '', email: '', subject: 'Prayer Request', message: '' });
    alert('Message sent successfully. Admin will receive it in the dashboard.');
  };

  // Fetch home layout from Firestore on mount
  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const remoteLayout = await api.getHomeLayout();
        if (remoteLayout && remoteLayout.length > 0) {
          const normalizedLayout = normalizeHomeSectionsOrder(remoteLayout);
          setHomeSectionsOrder(normalizedLayout);
          localStorage.setItem('cot_home_sections_order', JSON.stringify(normalizedLayout));
        }
      } catch (error) {
        console.error('Failed to fetch remote home layout:', error);
      }

      try {
        if (api.getHomeSectionsHidden) {
          const remoteHidden = await api.getHomeSectionsHidden();
          if (remoteHidden) {
            setHomeSectionsHidden(remoteHidden);
            localStorage.setItem('cot_home_sections_hidden', JSON.stringify(remoteHidden));
          }
        }
      } catch (error) {
        console.error('Failed to fetch remote home sections hidden:', error);
      }
    };
    fetchLayout();
  }, []);

  useEffect(() => {
    if (location.pathname !== '/') return;
    try {
      const seen = localStorage.getItem('cot_visitor_seen') === '1';
      if (!seen) {
        setShowWelcomeIntro(true);
      }
    } catch {
      setShowWelcomeIntro(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Show horizontal postal greeting card on mount if not greeted in this session yet
    if (!sessionStorage.getItem('cot_session_greeted')) {
      setShowGreetingCard(true);
    }
  }, []);

  useEffect(() => {
    if (tourStepIndex === null || currentView !== ViewState.HOME) return;
    const step = TOUR_STEPS[tourStepIndex];
    const target = document.querySelector(step.selector) as HTMLElement | null;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [tourStepIndex, currentView]);

  useEffect(() => {
    if (!showCelebration) return;
    const delay = celebrationMode === 'approval' ? 7000 : 4500;
    const timer = setTimeout(() => setShowCelebration(false), delay);
    return () => clearTimeout(timer);
  }, [showCelebration, celebrationMode]);

  useEffect(() => {
    if (tourStepIndex === null || currentView !== ViewState.HOME) return;

    const updateRect = () => {
      const step = TOUR_STEPS[tourStepIndex];
      const target = document.querySelector(step.selector) as HTMLElement | null;
      if (!target) {
        setTourRect(null);
        return;
      }
      const rect = target.getBoundingClientRect();
      setTourRect({
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16
      });
    };

    const timer = window.setTimeout(updateRect, 260);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [tourStepIndex, currentView]);

  // Fetch navigation layout from Firestore on mount
  useEffect(() => {
    const fetchNavLayout = async () => {
      try {
        const remoteNav = await api.getNavigationLayout();
        if (remoteNav && remoteNav.length > 0) {
          setNavigationItems(ensureHebrewNavItems(normalizeNavItems(remoteNav)));
        }
      } catch (error) {
        console.error('Failed to fetch remote navigation layout:', error);
      }
    };
    fetchNavLayout();
  }, []);
  useEffect(() => {
    if (!currentUser) return;
    setContactForm(prev => ({
      ...prev,
      name: currentUser.name || prev.name,
      email: currentUser.email || prev.email
    }));
  }, [currentUser?.id, currentUser?.name, currentUser?.email]);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  // Re-fetch current user data when entering dashboard to ensure status is up-to-date
  useEffect(() => {
    if (currentView === ViewState.USER_DASHBOARD && currentUser) {
      const fetchLatestUser = async () => {
        try {
          const freshData = await api.getUsers();
          const me = freshData.find(u => u.id === currentUser.id);
          if (me && me.status !== currentUser.status) {
            setCurrentUser(me); // Auto-update local state if status changed
          }
        } catch (e) {
          console.error("Failed to refresh user status", e);
        }
      };
      fetchLatestUser();
    }
  }, [currentView, currentUser?.id]);
  // Check for newly approved users (admin turned status to 'Active')
  useEffect(() => {
    if (currentUser) {
      const checkApproval = async () => {
        try {
          const freshData = await api.getUsers();
          const me = freshData.find(u => u.id === currentUser.id);
          if (me) {
            const wasJustApproved =
              me.status === 'Active' &&
              currentUser.status !== 'Active' &&
              !localStorage.getItem(`cot_celebrated_${currentUser.id}`);
            const wasJustRejected =
              me.status === 'Rejected' &&
              currentUser.status !== 'Rejected';
            if (wasJustApproved) {
              setCurrentUser(me);
              setCelebrationMode('approval');
              setShowCelebration(true);
              setShowLeaderMessage(true);
              setStatusNotice({ type: 'approved', message: 'Your account has been approved by admin.' });
              setCurrentView(ViewState.HOME);
              localStorage.setItem(`cot_celebrated_${me.id}`, '1');
            } else if (wasJustRejected) {
              setCurrentUser(me);
              setStatusNotice({ type: 'rejected', message: 'Your account was denied. Please contact admin or update details.' });
              setCurrentView(ViewState.HOME);
            } else if (me.status !== currentUser.status) {
              setCurrentUser(me);
            }
          } else if (currentUser.role !== 'Admin') {
            console.warn("⚠️ Current logged-in user not found in active users during status polling. Checking deleted/recycle bin...");
            const removedUsers = await api.getDeletedUsers();
            const isDeleted = removedUsers.some(u => u.id === currentUser.id);
            
            setCurrentUser(null);
            setSelectedDashboardProfileId(null);
            setCurrentView(ViewState.HOME);
            localStorage.removeItem('cot_current_user');
            
            if (isDeleted) {
              alert("Your account was moved to the recycle bin by the administrative team. Access is restricted.");
            } else {
              alert("Your account has been deleted permanently. Access is restricted.");
            }
          }
        } catch (e) { /* silent */ }
      };
      const interval = setInterval(checkApproval, 15000);
      return () => clearInterval(interval);
    }
  }, [currentUser?.id, currentUser?.status]);

  // Ensure currentUser stays in sync with users list (e.g. after Admin updates)
  useEffect(() => {
    if (currentUser) {
      const updatedMe = users.find(u => u.id === currentUser.id);
      // Only update if there are actual changes to avoid loops
      if (updatedMe && JSON.stringify(updatedMe) !== JSON.stringify(currentUser)) {
        setCurrentUser(updatedMe);
      }
    }
  }, [users, currentUser]);
  useEffect(() => {
    if (currentView === ViewState.USER_DASHBOARD && currentUser?.status === 'Rejected') {
      // Keep this redirect silent to avoid repeated alert popups while status polling effects run.
      setCurrentView(ViewState.HOME);
    }
  }, [currentView, currentUser?.status]);

  const activeFloatingNotification = currentUser
    ? memberNotifications.find(note => note.userId === currentUser.id && note.from === 'admin' && !note.read)
    : null;

  useEffect(() => {
    if (!activeFloatingNotification) {
      setDismissedFloatingNotificationId(null);
      return;
    }
    if (dismissedFloatingNotificationId === activeFloatingNotification.id) return;
    const timer = window.setTimeout(() => {
      setDismissedFloatingNotificationId(activeFloatingNotification.id);
    }, 60_000);
    return () => window.clearTimeout(timer);
  }, [activeFloatingNotification?.id, dismissedFloatingNotificationId]);

  // Load users from backend on mount
  // Load users and perform dynamic session validation on mount/updates
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Load users and deleted users
        const [activeUsers, removedUsers, loadedNotifications] = await Promise.all([
          api.getUsers(),
          api.getDeletedUsers(),
          api.getNotifications().catch(err => {
            console.error('Failed to load notifications:', err);
            return [];
          })
        ]);
        
        setUsers(activeUsers);
        setDeletedUsers(removedUsers);
        setMemberNotifications(loadedNotifications);

        // Load permalinks separately with its own error handling
        try {
          const loadedPermalinks = await api.getPermalinks();
          setPermalinks(loadedPermalinks || []);
        } catch (permalinkError) {
          console.error('Failed to load permalinks:', permalinkError);
          setPermalinks([]); // Set empty array on error
        }

        // Dynamic session check: If a member is logged in, verify they still exist and are active in the database
        if (currentUser && currentUser.role !== 'Admin') {
          const stillExists = activeUsers.some(u => u.id === currentUser.id);
          const isDeleted = removedUsers.some(u => u.id === currentUser.id);
          const freshUser = activeUsers.find(u => u.id === currentUser.id);
          const isDisapproved = freshUser?.status === 'Rejected';

          if (!stillExists || isDeleted || isDisapproved) {
            console.warn("⚠️ Logged-in session user no longer exists in database, is deleted, or is disapproved. Logging out...");
            setCurrentUser(null);
            setSelectedDashboardProfileId(null);
            setCurrentView(ViewState.HOME);
            localStorage.removeItem('cot_current_user');
            if (isDisapproved) {
              alert("Your account verification has been disapproved by the administrative team. Access is restricted.");
            } else {
              alert("Your account has been deleted permanently. Access is restricted.");
            }
          }
        }
      } catch (err) {
        console.error("Failed to load users for session check:", err);
      }
    };
    loadUsers();
  }, [currentUser]);

  // Persist currentUser to localStorage whenever it changes
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('cot_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('cot_current_user');
      }
    } catch (e) {
      console.error('Failed to save user session', e);
    }
  }, [currentUser]);

  // Request notification permissions and register the FCM device token
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || !currentUser || !messaging) return;

    const registerFcmToken = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const vapidKey = import.meta.env.VITE_FCM_VAPID_KEY;
          if (!vapidKey) {
            console.warn("FCM VAPID key is missing (VITE_FCM_VAPID_KEY). Skipping device registration.");
            return;
          }
          const token = await getToken(messaging, { vapidKey });
          if (token) {
            const currentTokens = currentUser.fcmTokens || [];
            if (!currentTokens.includes(token)) {
              const updatedTokens = [...currentTokens, token];
              const updatedCurrentUser = { ...currentUser, fcmTokens: updatedTokens };
              
              setCurrentUser(updatedCurrentUser);
              setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedCurrentUser : u));
              await api.updateUser(updatedCurrentUser);
              console.log("FCM device registered successfully:", token);
            }
          }
        }
      } catch (error) {
        console.error("FCM registration token request failed:", error);
      }
    };

    registerFcmToken();
  }, [currentUser]);

  // Scheduled daily greetings: 5:00 AM, 12:00 PM, 6:00 PM, 9:00 PM
  useEffect(() => {
    const checkAndSendDailyGreetings = async () => {
      const settings = await api.getDailyGreetingSettings();
      if (!settings.enabled) return;

      const now = new Date();
      const hour = now.getHours();
      const todayStr = now.toDateString(); // e.g. "Fri Jul 03 2026"

      let slotKey = "";
      let hebrewGreeting = "";
      let englishGreeting = "";

      if (hour === 5) {
        slotKey = "cot_last_greeting_run_5am";
        hebrewGreeting = "Boker Tov";
        englishGreeting = "Good Morning";
      } else if (hour === 12) {
        slotKey = "cot_last_greeting_run_12pm";
        hebrewGreeting = "Tzoharaim Tovim";
        englishGreeting = "Good Afternoon";
      } else if (hour === 18) {
        slotKey = "cot_last_greeting_run_6pm";
        hebrewGreeting = "Erev Tov";
        englishGreeting = "Good Evening";
      } else if (hour === 21) {
        slotKey = "cot_last_greeting_run_9pm";
        hebrewGreeting = "Laila Tov";
        englishGreeting = "Good Night";
      }

      if (!slotKey) return; // Not in a scheduled hour slot

      const lastRun = localStorage.getItem(slotKey);
      if (lastRun === todayStr) return; // Already sent for this slot today

      console.log(`⏰ Scheduled Greeting Triggered for slot: ${slotKey}`);

      const hebrewDateInfo = getHebrewDateInfo(now);
      let dateString = "";
      if (hebrewDateInfo) {
        dateString = `Today's Hebrew date is ${hebrewDateInfo.hebrewDay} ${hebrewDateInfo.hebrewMonth} ${hebrewDateInfo.hebrewYear}.`;
      }

      const greetingTemplate = `Shalom [Name]! ${hebrewGreeting} (${englishGreeting}). ${dateString}`;

      // Collect all recipients
      const recipients: { name: string; phone: string; fcmTokens?: string[] }[] = [];
      const seenPhones = new Set<string>();

      // 1. Add registered users
      users.forEach(u => {
        if (u.phone) {
          const cleanPhone = u.phone.trim();
          if (cleanPhone && !seenPhones.has(cleanPhone)) {
            seenPhones.add(cleanPhone);
            recipients.push({ name: u.name || "Brother/Sister", phone: cleanPhone, fcmTokens: u.fcmTokens });
          }
        }
      });

      // 2. Add unregistered visitors from contactMessages
      contactMessages.forEach(msg => {
        if (msg.phone) {
          const cleanPhone = msg.phone.trim();
          if (cleanPhone && !seenPhones.has(cleanPhone)) {
            seenPhones.add(cleanPhone);
            recipients.push({ name: msg.name || "Shalom", phone: cleanPhone });
          }
        }
      });

      // Send to recipients
      for (const rec of recipients) {
        const personalizedMsg = greetingTemplate.replace("[Name]", rec.name);
        
        // Dispatch SMS
        sendSMS(rec.phone, personalizedMsg).catch(err => {
          console.error(`Scheduled SMS failed for ${rec.name}:`, err);
        });

        // Dispatch FCM Push if they have tokens
        if (rec.fcmTokens && rec.fcmTokens.length > 0) {
          sendFCMNotification(rec.fcmTokens, "City of Truth Ministries", personalizedMsg, settings.imageUrl || undefined).catch(err => {
            console.error(`Scheduled FCM failed for ${rec.name}:`, err);
          });
        }
      }

      // Mark slot as completed for today
      localStorage.setItem(slotKey, todayStr);
    };

    // Run check on mount and then every 1 minute
    checkAndSendDailyGreetings();
    const intervalId = window.setInterval(checkAndSendDailyGreetings, 60_000);
    return () => window.clearInterval(intervalId);
  }, [users, contactMessages]);

  // Check if on admin route
  const isAdminRoute = location.pathname === '/admin';
  // Check if on verify route (supports /verify/s/shareToken and /verify/memberId)
  const verifyMatch = location.pathname.match(/^\/verify\/(?:s\/)?(.+)$/);
  const isVerifyRoute = !!verifyMatch;
  const verifyUserId = verifyMatch ? verifyMatch[1] : null;
  const isAuthRoute = location.pathname === '/auth';
  const isVerifyScannerRoute = location.pathname === '/verify-id';
  const isHebrewAlphabetRoute = location.pathname === '/hebrew-alphabet';
  const isWebsiteBuilderMode = location.pathname === '/websitebuilder';

  const [pendingTextChanges, setPendingTextChanges] = useState<Record<string, string>>({});
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);

  const updateText = (id: string, text: string) => {
    setPendingTextChanges(prev => {
      const oldText = prev[id] !== undefined ? prev[id] : (JSON.parse(localStorage.getItem('cot_website_builder_texts') || '{}')[id] || '');
      if (oldText !== text) {
        setUndoStack(u => [...u, { type: 'TEXT', id, oldText, newText: text }]);
        setRedoStack([]);
      }
      return { ...prev, [id]: text };
    });
  };

  const undoAction = () => {
    if (undoStack.length === 0) return;
    const action = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, action]);

    if (action.type === 'TEXT') {
      setPendingTextChanges(prev => ({ ...prev, [action.id]: action.oldText }));
    } else if (action.type === 'NAV') {
      setNavigationItems(action.oldItems);
    } else if (action.type === 'HOME_SECTIONS') {
      setHomeSectionsOrder(action.oldOrder);
    }
  };

  const redoAction = () => {
    if (redoStack.length === 0) return;
    const action = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, action]);

    if (action.type === 'TEXT') {
      setPendingTextChanges(prev => ({ ...prev, [action.id]: action.newText }));
    } else if (action.type === 'NAV') {
      setNavigationItems(action.newItems);
    } else if (action.type === 'HOME_SECTIONS') {
      setHomeSectionsOrder(action.newOrder);
    }
  };

  const clearHistory = () => {
    setUndoStack([]);
    setRedoStack([]);
  };

  const publishAllChanges = async () => {
    try {
      await api.updateNavigationLayout(navigationItems);
      await api.updateHomeLayout(homeSectionsOrder);
    } catch(e) {}
  };
  const contextValue = {
    isEditMode: isWebsiteBuilderMode,
    pendingTextChanges,
    updateText,
    undoAction,
    redoAction,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    clearHistory,
    publishAllChanges
  };

  // Handle permalink/shareable URLs for pages
  useEffect(() => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const viewParam = searchParams.get('view');
    
    // Map URL paths to ViewStates
    const pathToViewMap: Record<string, ViewState> = {
      '/': ViewState.HOME,
      '/home': ViewState.HOME,
      '/about': ViewState.ABOUT,
      '/ministries': ViewState.MINISTRIES,
      '/contact': ViewState.CONTACT,
      '/valparai': ViewState.ABOUT_VALPARAI,
      '/hebrew': ViewState.HEBREW,
      '/hebrew-tools': ViewState.HEBREW_TOOLS,
      '/hebrew-calendar': ViewState.HEBREW_CALENDAR,
      '/hebrew-clock': ViewState.HEBREW_CLOCK,
      '/hebrew-numbers': ViewState.HEBREW_NUMBERS,
      '/hebrew-words': ViewState.HEBREW_WORDS,
      '/hebrew-letters-audio': ViewState.HEBREW_LETTERS_AUDIO,
      '/hebrew-gematria': ViewState.HEBREW_GEMATRIA,
      '/hebrew-festivals': ViewState.HEBREW_FESTIVALS,
      '/hebrew-grammar': ViewState.HEBREW_GRAMMAR,
      '/hebrew-reference': ViewState.HEBREW_REFERENCE,
      '/hebrew-israel': ViewState.HEBREW_ISRAEL,
      '/pdf-downloads': ViewState.PDF_DOWNLOADS,
      '/menorah': ViewState.GOLDEN_MENORAH,
      '/golden-menorah': ViewState.GOLDEN_MENORAH,
      '/menorah-flag': ViewState.MENORAH_FLAG,
      '/baruch-hashem': ViewState.BARUCH_HASHEM,
      '/ai': ViewState.AI,
      '/id-card': ViewState.ID_CARD,
      '/entrust-card': ViewState.ID_CARD,
      '/pastor': ViewState.PASTOR,
      '/member-form': ViewState.MEMBER_FORM,
      '/dashboard': ViewState.USER_DASHBOARD,
      '/admin': ViewState.ADMIN_DASHBOARD,
      '/verify-id': ViewState.VERIFY_ID,
      '/developer': ViewState.DEVELOPER,
      '/bugs-fixed': ViewState.BUGS_FIXED,
    };

    Object.entries(getPagePermalinkOverrides()).forEach(([view, path]) => {
      const targetView = normalizeViewState(view);
      if (targetView && typeof path === 'string' && path.startsWith('/')) {
        pathToViewMap[path] = targetView;
      }
    });
    
    if (isHebrewAlphabetRoute) {
      if (currentView !== ViewState.HEBREW) {
        setCurrentView(ViewState.HEBREW);
      }
      return;
    }

    // Skip permalink processing for special routes
    if (isAdminRoute || isVerifyRoute || isAuthRoute || isVerifyScannerRoute) {
      return;
    }
    
    // Check if path matches a permalink route
    if (pathToViewMap[path] && pathToViewMap[path] !== currentView) {
      handleViewChange(pathToViewMap[path]);
    } else if (viewParam) {
      // Support ?view=PAGE_NAME query parameter
      const targetView = normalizeViewState(viewParam);
      if (targetView !== currentView) {
        handleViewChange(targetView);
      }
    }
  }, [location.pathname, location.search, isAdminRoute, isVerifyRoute, isAuthRoute, isVerifyScannerRoute, isHebrewAlphabetRoute]);

  // Generate shareable URL for current view
  const getShareableURL = (view: ViewState): string => {
    return getAbsolutePagePermalink(view);
  };

  // Update browser URL when view changes (without page reload)
  const handleViewChange = (view: ViewState) => {
    setCurrentView(view);
    const path = getPagePath(view);
    if (location.pathname !== path) {
      navigate(path, { replace: true });
    }
  };

  const getThemeClass = () => {
    switch (currentView) {
      case ViewState.HOME: return "bg-brand-950 text-white";
      case ViewState.ABOUT: return "bg-[#fdfcf0] text-brand-950";
      case ViewState.ABOUT_VALPARAI: return "bg-slate-50 text-brand-950";
      case ViewState.MINISTRIES: return "bg-[#f0f9ff] text-sky-950";
      case ViewState.HEBREW: return "bg-black text-amber-500";
      case ViewState.HEBREW_ISRAEL: return "bg-[#fffdf6] text-brand-950";
      case ViewState.PDF_DOWNLOADS: return "bg-gradient-to-br from-[#fdfcf0] to-[#fff8e7] text-brand-950";
      case ViewState.HEBREW_TOOLS: return "bg-[#fdfcf0] text-brand-950";
      case ViewState.HEBREW_WORDS: return "bg-[#fdfcf0] text-brand-950";
      case ViewState.HEBREW_LETTERS_AUDIO: return "bg-[#fdfcf0] text-brand-950";
      case ViewState.HEBREW_GEMATRIA: return "bg-[#fdfcf0] text-brand-950";
      case ViewState.HEBREW_CLOCK: return "bg-[#fdfcf0] text-brand-950";
      case ViewState.ID_CARD: return "bg-[#f8fafc] text-slate-950";
      case ViewState.CONTACT: return "bg-[#f5f3ff] text-indigo-950";
      case ViewState.AI: return "bg-slate-950 text-white";
      case ViewState.GOLDEN_MENORAH: return "bg-brand-950 text-white";
      case ViewState.BARUCH_HASHEM: return "bg-slate-50 text-brand-950";
      case ViewState.USER_DASHBOARD: return "bg-slate-50 text-slate-900";
      case ViewState.ADMIN_DASHBOARD: return "bg-slate-50 text-slate-900";
      default: return "bg-white text-brand-950";
    }
  };

  const handleLogin = async (identifier: string) => {
    if (!identifier) {
      alert("Please enter your Member ID, Email, Phone, or Name.");
      return;
    }

    const normalizeText = (value: string) => value.trim().toLowerCase();
    const normalizePhone = (value: string) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length === 12 && digits.startsWith('91') && /^[6-9]/.test(digits.slice(2))) return digits.slice(2);
      return digits;
    };
    const normalizeMemberId = (value: string) => {
      const normalized = normalizeText(value).replace(/\s+/g, '');
      if (normalized.startsWith('cot') && !normalized.startsWith('cot-')) {
        return normalized.replace(/^cot/, 'cot-');
      }
      return normalized;
    };
    const hasPermanentCotId = (value: string) => /^COT-\d{4,}$/.test((value || '').trim().toUpperCase());

    const searchText = normalizeText(identifier);
    const searchPhone = normalizePhone(identifier);
    const searchMemberId = normalizeMemberId(identifier);

    // Multi-identifier login: Phone, Email, ID, or Name.
    // Direct user records must win over linked-profile aliases so a secondary
    // account status never mutates or impersonates the primary dashboard.
    const directMatches = users.map(u => {
      const uPhone = normalizePhone(u.phone || '');
      const uEmergency = normalizePhone(u.emergency || '');
      const uEmail = normalizeText(u.email || '');
      const uId = normalizeMemberId(u.id || '');
      const uName = normalizeText(u.name || '');
      const isMatch = (
        (searchPhone && (uPhone === searchPhone || uEmergency === searchPhone)) ||
        uId === searchMemberId ||
        uEmail === searchText ||
        uName === searchText
      );
      return isMatch ? { user: u, profileId: u.id } : null;
    }).filter(Boolean) as Array<{ user: User; profileId: string }>;

    const linkedMatches = users.map(u => {
      const linked = (u.linkedProfiles || []).find(sp => {
        const spId = normalizeMemberId(sp.id || '');
        const spName = normalizeText(sp.name || '');
        return spId === searchMemberId || spName === searchText;
      });
      return linked ? { user: u, profileId: linked.id } : null;
    }).filter(Boolean) as Array<{ user: User; profileId: string }>;

    const match = directMatches[0] || linkedMatches[0];
    const user = match?.user;

    if (user) {
      if (match.profileId !== user.id) {
        const linkedAccount = users.find(u => normalizeMemberId(u.id || '') === normalizeMemberId(match.profileId));
        if (linkedAccount && linkedAccount.status !== 'Active') {
          alert(`${linkedAccount.name || 'This linked account'} is ${linkedAccount.status.toLowerCase()}. The primary member account is still safe; please log in with the primary member's own details.`);
          return;
        }
        try {
          const removedUsers = await api.getDeletedUsers();
          const removedLinkedAccount = removedUsers.find(u => normalizeMemberId(u.id || '') === normalizeMemberId(match.profileId));
          if (removedLinkedAccount) {
            const isExpired = new Date(removedLinkedAccount.autoDeleteAt).getTime() <= Date.now();
            alert(isExpired
              ? 'This linked account has been permanently deleted. The primary member account is still safe; please log in with the primary member details.'
              : 'This linked account is in the recycle bin. The primary member account is still safe; please log in with the primary member details.');
            return;
          }
        } catch (error) {
          console.error('Failed to check linked account deletion status', error);
        }
      }
      if (user.status === 'Rejected') {
        alert(REJECTED_ACCESS_MESSAGE);
        setCurrentView(ViewState.HOME);
        navigate('/');
        return;
      }
      const isSwitchingToDifferentAccount = !!currentUser && currentUser.id !== user.id;
      if (isSwitchingToDifferentAccount && currentUser) {
        if (user.status !== 'Active') {
          alert(`${user.name || 'This user'} is not fully approved yet. Only active accounts can be added as linked profiles.`);
          return;
        }
        if (!hasPermanentCotId(user.id)) {
          alert(`${user.name || 'This user'} does not yet have a permanent COT ID. Only active accounts with permanent COT ID can be added as linked profiles.`);
          return;
        }
        const existingLinkedProfiles = currentUser.linkedProfiles || [];
        const alreadyLinked = existingLinkedProfiles.some(profile => profile.id === user.id);
        const linkedAccountProfile: SubProfile = {
          id: user.id,
          name: user.name,
          role: user.role || 'Member',
          photo: user.photo
        };
        const updatedCurrentUser: User = alreadyLinked
          ? currentUser
          : { ...currentUser, linkedProfiles: [...existingLinkedProfiles, linkedAccountProfile] };

        if (!alreadyLinked) {
          try {
            const savedCurrentUser = await api.updateUser(updatedCurrentUser);
            setUsers(prev => prev.map(u => (u.id === currentUser.id ? savedCurrentUser : u)));
            setCurrentUser(savedCurrentUser);
          } catch (error) {
            console.error('Failed to add logged-in account as dashboard profile', error);
            alert('Could not add this account as a new profile. Please try again.');
            return;
          }
        } else {
          setCurrentUser(updatedCurrentUser);
        }

        setSelectedDashboardProfileId(user.id);
        setCurrentView(ViewState.USER_DASHBOARD);
        navigate('/');
        alert(alreadyLinked
          ? `Profile ${user.id} is already available in your dashboard.`
          : `Logged in as ${user.id}. This account was added to your dashboard profiles.`);
        return;
      }

      try {
        localStorage.removeItem(`cot_dashboard_tour_seen_${user.id}`);
      } catch (error) {
        console.error('Failed to reset dashboard tour state', error);
      }
      setCurrentUser(user);
      setSelectedDashboardProfileId(match?.profileId || user.id);
      setCelebrationMode('welcome');
      setShowCelebration(true);
      setCurrentView(ViewState.USER_DASHBOARD);
      navigate('/');
    } else {
      alert("Account not found. Please check your Member ID, Email, Phone, or Name.");
    }
  };

  const handleRegister = async (data: any) => {
    const extractPhoneDigits = (value: string | undefined) => {
      const digits = (value || '').replace(/\D/g, '');
      if (digits.length === 12 && digits.startsWith('91')) {
        return digits.slice(2);
      }
      return digits;
    };
    const normalizeEmail = (value: string | undefined) => (value || '').trim().toLowerCase();
    const primaryPhoneDigits = extractPhoneDigits(data.emergency || data.phone);
    if (primaryPhoneDigits.length !== 10) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }
    const incomingPhones = [data.phone, data.emergency]
      .map(extractPhoneDigits)
      .filter(Boolean);
    const incomingEmails = [data.email]
      .map(normalizeEmail)
      .filter(Boolean);

    const existingByContact = users.find(u => {
      const userPhones = [u.phone, u.emergency]
        .map(extractPhoneDigits)
        .filter(Boolean);
      const userEmails = [u.email]
        .map(normalizeEmail)
        .filter(Boolean);
      const phoneMatch = incomingPhones.some(phone => userPhones.includes(phone));
      const emailMatch = incomingEmails.some(email => userEmails.includes(email));
      return phoneMatch || emailMatch;
    });

    if (existingByContact) {
      try {
        localStorage.removeItem(`cot_dashboard_tour_seen_${existingByContact.id}`);
      } catch (error) {
        console.error('Failed to reset dashboard tour state', error);
      }
      setCurrentUser(existingByContact);
      setSelectedDashboardProfileId(existingByContact.id);
      setCelebrationMode('welcome');
      setShowCelebration(true);
      setCurrentView(ViewState.HOME);
      navigate('/');
      alert(`Account already exists for these details. You are logged in as ${existingByContact.id}.`);
      return;
    }

    // Check if user already exists
    const existingUser = users.find(u =>
      u.id === data.uniqueId
    );

    if (existingUser) {
      alert("User already exists with this Member ID! Please login.");
      navigate('/auth?view=login');
      return;
    }

    const newUser: User = {
      id: data.uniqueId,
      name: data.name,
      email: data.email,
      phone: data.emergency,
      password: data.password || 'password', // Use provided password
      role: 'Member',
      status: 'Pending Verification',
      location: data.location,
      emergency: data.emergency,
      memberSince: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      joinedDate: new Date().toISOString().split('T')[0],
      photo: data.photo || '',
      registrationType: data.registrationType || 'individual',
      familyMembers: data.familyMembers || [],
      cardThemeTone: data.cardThemeTone || 'blue',
      cardLayoutMode: data.cardLayoutMode || 'classic',
      cardShapeMode: data.cardShapeMode || 'rounded',
      cardSizeMode: data.cardSizeMode || 'md'
    };

    try {
      const savedUser = await api.createUser(newUser);
      setUsers([...users, savedUser]);
      setCurrentUser(savedUser);
      setSelectedDashboardProfileId(savedUser.id);
      try {
        localStorage.removeItem(`cot_dashboard_tour_seen_${savedUser.id}`);
      } catch (error) {
        console.error('Failed to reset dashboard tour state', error);
      }

      // --- EMAILJS INTEGRATION (Using User Provided Keys) ---
      const EMAILJS_SERVICE_ID = 'service_wcxaetv';
      const EMAILJS_TEMPLATE_ID = 'template_qppd7b9';
      const EMAILJS_PUBLIC_KEY = 'GZKfv61R2DflsMVKX';

      // 1. Send Admin Notification
      emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          email: 'faithfulfellowship8@gmail.com',
          subject: `✨ New Member Alert: ${savedUser.name}`,
          message: `A new member has joined the ministry!\n\n👤 Name: ${savedUser.name}\n🆔 Registration Ref: ${savedUser.id}\n📞 Phone: ${savedUser.phone}\n📍 Location: ${savedUser.location}\n\nApprove this member to generate the final COT ID in Admin Dashboard: https://city-of-truth-ministries.vercel.app/admin`,
          from_name: 'City of Truth System'
        },
        EMAILJS_PUBLIC_KEY
      ).then(() => console.log('Admin alert sent'))
        .catch(err => console.error('Failed to send admin alert', err));

      // 2. Send User Welcome Email (if email provided)
      if (savedUser.email) {
        emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            email: savedUser.email,
            subject: 'Welcome to City of Truth Ministries! ✨',
            message: `Dear ${savedUser.name},\n\nWe are so blessed to have you join our ministry family! Your account has been received and is currently in verification.\n\n🆔 Your COT ID will be assigned by admin after approval.\n\nYou can now log in to your dashboard using your phone number to check your status.\n\nBlessings,\nCity of Truth Team`,
            from_name: 'City of Truth Ministries'
          },
          EMAILJS_PUBLIC_KEY
        ).then(() => console.log('Welcome email sent'))
          .catch(err => console.error('Failed to send welcome email', err));
      }

      alert("Registration successful! Your COT ID will be generated after admin approval.");
      setCelebrationMode('welcome');
      setShowCelebration(true);
      setCurrentView(ViewState.USER_DASHBOARD);
      navigate('/');
    } catch (e) {
      console.error(e);
      alert("Registration Failed. Please try again.");
    }
  };

  const handleUpdateStatus = async (userId: string, status: UserStatus) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (userToUpdate) {
      const updated = { ...userToUpdate, status };
      await api.updateUser(updated);
      setUsers(users.map(u => u.id === userId ? updated : u));
    }
  };

  const handleReassignUserId = async (oldUserId: string, newUserId: string, updatedUser: User) => {
    const reassigned = await api.reassignUserId(oldUserId, newUserId, updatedUser);
    setUsers(prev => {
      const withoutOld = prev.filter(u => u.id !== oldUserId);
      return [...withoutOld, reassigned];
    });
    if (currentUser?.id === oldUserId) {
      setCurrentUser(reassigned);
      setSelectedDashboardProfileId(reassigned.id);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const target = users.find(u => u.id === userId);
      await api.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      const removedUsers = await api.getDeletedUsers();
      setDeletedUsers(removedUsers);
      const deletedMeta = removedUsers.find(u => u.id === userId);
      if (target) {
        const daysLeft = getRecycleDaysRemaining(deletedMeta?.autoDeleteAt);
        pushAdminNotification(
          target.id,
          `Your account was moved to recycle bin by admin. It will be permanently deleted in ${daysLeft} day${daysLeft === 1 ? '' : 's'} unless restored.`,
          'recycle'
        );
      }
      if (currentUser?.id === userId) {
        handleLogout();
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  };

  const handleRestoreDeletedUser = async (userId: string) => {
    await api.restoreDeletedUser(userId);
    const [activeUsers, removedUsers] = await Promise.all([
      api.getUsers(),
      api.getDeletedUsers()
    ]);
    setUsers(activeUsers);
    setDeletedUsers(removedUsers);
  };

  const handlePermanentlyDeleteDeletedUser = async (userId: string) => {
    const target = deletedUsers.find(u => u.id === userId);
    await api.permanentlyDeleteDeletedUser(userId);
    setDeletedUsers(await api.getDeletedUsers());
    
    // Cleanup notifications in Firestore
    const notesToDelete = memberNotifications.filter(note => note.userId === userId);
    notesToDelete.forEach(note => {
      api.deleteNotification(note.id).catch(err => {
        console.error('Failed to delete notification for permanently deleted user:', err);
      });
    });

    setMemberNotifications(prev => prev.filter(note => note.userId !== userId));
    if (target) {
      setDeletedMemberNotifications(prev => prev.filter(note => note.userId !== target.id));
    }
    if (currentUser?.id === userId) {
      handleLogout();
    }
  };

  const handleAdminAuthenticated = () => {
    setIsAdminAuthenticated(true);
  };

  const handleBackFromAdmin = () => {
    navigate('/');
    setIsAdminAuthenticated(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedDashboardProfileId(null);
    setCurrentView(ViewState.HOME);
    alert("You have been logged out successfully.");
  };

  const handleFindID = (phone: string) => {
    const user = users.find(u => u.phone === phone || u.emergency === phone);
    if (user) {
      alert(`Account Found! Your Member ID is: ${user.id}\nPlease use this to login.`);
    } else {
      alert("No account found with this phone number. Please register.");
    }
  };

  const footerMainPages: Array<{ label: string; view?: ViewState; href?: string }> = [
    { label: 'Home', view: ViewState.HOME },
    { label: 'Hebrew Alphabet', href: '/hebrew-alphabet' },
    { label: 'Valparai', view: ViewState.ABOUT_VALPARAI },
    { label: 'Pastor', view: ViewState.PASTOR },
    { label: 'Ministries', view: ViewState.MINISTRIES },
    { label: 'Menorah', view: ViewState.GOLDEN_MENORAH },
    { label: 'Baruch Hashem', view: ViewState.BARUCH_HASHEM },
    { label: 'AI Assistance', view: ViewState.AI },
    { label: 'Entrust Card', view: ViewState.ID_CARD },
    { label: 'Contact', view: ViewState.CONTACT },
  ];

  const footerHebrewContentPages: Array<{ label: string; view?: ViewState; href?: string }> = [
    { label: 'Hebrew Alphabet', href: '/hebrew-alphabet' },
    { label: 'Hebrew Content Hub', view: ViewState.ABOUT },
    { label: 'Festivals & Holy Days', view: ViewState.HEBREW_FESTIVALS },
    { label: 'Biblical Calendar', view: ViewState.HEBREW_CALENDAR },
    { label: 'Hebrew Clock', view: ViewState.HEBREW_CLOCK },
    { label: 'Month/Year Reference', view: ViewState.HEBREW_REFERENCE },
  ];

  const footerHebrewGrammarPages: Array<{ label: string; view: ViewState }> = [
    { label: 'Hebrew Grammar', view: ViewState.HEBREW_GRAMMAR },
  ];

  const footerHebrewToolPages: Array<{ label: string; view: ViewState }> = [
    { label: 'Hebrew Tools Hub', view: ViewState.HEBREW_TOOLS },
    { label: 'Hebrew Words', view: ViewState.HEBREW_WORDS },
    { label: 'Letters Audio Lab', view: ViewState.HEBREW_LETTERS_AUDIO },
    { label: 'Hebrew Numbers', view: ViewState.HEBREW_NUMBERS },
    { label: 'Gematria Value', view: ViewState.HEBREW_GEMATRIA },
  ];

  const footerSubPartPages = [
    { label: 'Login', action: () => navigate('/auth?view=login'), dotClass: 'bg-blue-400/70' },
    { label: 'Register', action: () => navigate('/auth?view=register'), dotClass: 'bg-blue-300/70' },
    { label: 'Forgot Member ID', action: () => navigate('/auth?view=forgot-id'), dotClass: 'bg-blue-200/80' },
    { label: 'Verify ID Route', action: () => navigate('/verify-id'), dotClass: 'bg-violet-400/70' },
    {
      label: 'User Dashboard',
      action: () => {
        if (currentUser) {
          if (currentUser.status === 'Rejected') {
            alert(REJECTED_ACCESS_MESSAGE);
            navigate('/auth?view=login');
            return;
          }
          setCurrentView(ViewState.USER_DASHBOARD);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        navigate('/auth?view=login');
      },
      dotClass: 'bg-emerald-400/70'
    },
    { label: 'Admin Dashboard', action: () => navigate('/admin'), dotClass: 'bg-red-400/70' },
  ];

  // If on admin route, show admin interface
  if (isAdminRoute) {
    if (!isAdminAuthenticated) {
      return <AdminPasswordModal onSuccess={handleAdminAuthenticated} />;
    }
    return (
      <AdminDashboard
        users={users}
        deletedUsers={deletedUsers}
        contactMessages={contactMessages}
        deletedContactMessages={deletedContactMessages}
        memberNotifications={memberNotifications}
        deletedMemberNotifications={deletedMemberNotifications}
        onSendMessageToUsers={handleAdminSendMessageToUsers}
        onDeleteContactMessage={handleDeleteContactMessage}
        onRestoreContactMessage={handleRestoreContactMessage}
        onDeleteMemberNotification={handleDeleteMemberNotification}
        onRestoreMemberNotification={handleRestoreMemberNotification}
        onUpdateMemberNotification={handleUpdateMemberNotification}
        onUpdateUser={async (user) => {
          const prevUser = users.find(u => u.id === user.id);
          await api.updateUser(user);
          setUsers(prev => prev.map(u => u.id === user.id ? user : u));
          if (prevUser && prevUser.status !== user.status) {
            if (user.status === 'Active') {
              pushAdminNotification(
                user.id,
                "Approved! Welcome to City of Truth Ministries. Please fill your Member Form now to complete your profile.",
                'approved'
              );
              pushAdminNotification(
                user.id,
                "Leader Message: Congratulations! Please complete your Member Form beautifully to unlock all ministry features.",
                'leader'
              );
            } else if (user.status === 'Rejected') {
              pushAdminNotification(
                user.id,
                "Your account was disapproved by admin. Please review the disapproval reason, update details, and contact support.",
                'disapproved'
              );
            }
          }
          notifyMemberFormRefillIfRejected(prevUser, user);
        }}
        onCreateUser={async (user) => {
          const created = await api.createUser(user);
          setUsers(prev => [...prev, created]);
        }}
        onReassignUserId={handleReassignUserId}
        onDeleteUser={handleDeleteUser}
        onRestoreUser={handleRestoreDeletedUser}
        onPermanentlyDeleteUser={handlePermanentlyDeleteDeletedUser}
        onBack={handleBackFromAdmin}
        homeSectionsOrder={homeSectionsOrder}
        homeSectionsHidden={homeSectionsHidden}
        onUpdateHomeSectionsOrder={async (newOrder) => {
          setHomeSectionsOrder(newOrder);
          localStorage.setItem('cot_home_sections_order', JSON.stringify(newOrder));
          try {
            await api.updateHomeLayout(newOrder);
          } catch (error) {
            console.error('Failed to save layout to cloud:', error);
          }
        }}
        onUpdateHomeSectionsHidden={async (nextHidden) => {
          setHomeSectionsHidden(nextHidden);
          localStorage.setItem('cot_home_sections_hidden', JSON.stringify(nextHidden || {}));
          try {
            if (api.updateHomeSectionsHidden) {
              await api.updateHomeSectionsHidden(nextHidden);
            }
          } catch (error) {
            console.error('Failed to save hidden sections to cloud:', error);
          }
        }}
        navItems={navigationItems}
        onUpdateNavItems={async (newItems) => {
          const updatedNav = ensureHebrewNavItems(normalizeNavItems(newItems));
          setNavigationItems(updatedNav);
          try {
            await api.updateNavigationLayout(updatedNav);
          } catch (error) {
            console.error('Failed to save nav layout to cloud:', error);
          }
        }}
      />
    );
  }

  // If on verify route (QR code scan)
  if (isVerifyRoute && verifyUserId) {
    return <QRVerifyPage userId={verifyUserId} onBack={() => navigate('/')} onProceedToDashboard={handleLogin} />;
  }

  if (isAuthRoute) {
    const params = new URLSearchParams(location.search);
    const routeInitial = params.get('view');
    const routeIdentifier = params.get('identifier') || '';
    const routeAction = params.get('option');
    const initialView = routeInitial === 'login' || routeInitial === 'register' || routeInitial === 'forgot-id'
      ? routeInitial
      : 'login';

    return (
      <AuthPage
        onLogin={handleLogin}
        onNavigateToRegister={() => {
          navigate('/');
          setCurrentView(ViewState.ID_CARD);
        }}
        onAdminClick={() => navigate('/admin')}
        onBack={() => navigate('/')}
        users={users}
        sessionUser={currentUser ? { id: currentUser.id, name: currentUser.name, photo: currentUser.photo } : null}
        initialView={initialView}
        initialIdentifier={routeIdentifier}
        initialAction={routeAction === 'scan' || routeAction === 'upload' ? routeAction : undefined}
      />
    );
  }

  if (isVerifyScannerRoute) {
    return <VerifyIDPage onProceedToDashboard={handleLogin} currentUser={currentUser} />;
  }

  // Hebrew alphabet route rendering moved to main layout below

  return (
    <WebsiteBuilderContext.Provider value={contextValue}>
    <div className={`min-h-screen transition-colors duration-1000 ease-in-out font-sans ${getThemeClass()}`}>
      {/* Permalink Display Bar */}
      {!isFrame && Array.isArray(permalinks) && permalinks.length > 0 && (
        <React.Suspense fallback={null}>
          <PermalinkDisplay permalinks={permalinks} currentView={currentView} />
        </React.Suspense>
      )}
      
      {!isFrame && (
        <>
          <WebsiteBuilderManager
            isEditMode={isWebsiteBuilderMode}
            onExit={() => navigate('/')}
          />
          <Navbar
            currentView={currentView}
            setView={handleViewChange}
            onLoginClick={() => navigate('/auth?view=login')}
            onLogoutClick={handleLogout}
            currentUser={currentUser}
            navItems={navigationItems}
            isEditMode={isWebsiteBuilderMode}
            onUpdateNavItems={(newItems) => {
              const updatedNav = ensureHebrewNavItems(normalizeNavItems(newItems));
              setUndoStack(u => [...u, { type: 'NAV', oldItems: navigationItems, newItems: updatedNav }]);
              setRedoStack([]);
              setNavigationItems(updatedNav);
            }}
          />

          {activeFloatingNotification && dismissedFloatingNotificationId !== activeFloatingNotification.id && (
            <div className="fixed top-20 right-3 sm:right-6 z-[95] w-[min(92vw,420px)]">
              <button
                type="button"
                onClick={() => {
                  if (currentUser?.status === 'Rejected') {
                    alert(REJECTED_ACCESS_MESSAGE);
                    return;
                  }
                  setDashboardFocusSection('notifications');
                  setCurrentView(ViewState.USER_DASHBOARD);
                  setDismissedFloatingNotificationId(activeFloatingNotification.id);
                }}
                className="w-full text-left rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-violet-50 shadow-2xl px-4 py-3 hover:shadow-indigo-200/60 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    🔔
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-700">
                      {activeFloatingNotification.kind === 'approved' ? 'Account Approved' : activeFloatingNotification.kind === 'disapproved' ? 'Account Disapproved' : 'Admin Notification'}
                    </p>
                    <p className="text-sm font-semibold text-slate-800 whitespace-pre-wrap break-words">{activeFloatingNotification.message}</p>
                    <p className="text-[10px] mt-1 text-slate-500 uppercase tracking-[0.12em]">Tap to open dashboard • auto close in 1 min</p>
                  </div>
                  <span
                    onClick={(event) => {
                      event.stopPropagation();
                      setDismissedFloatingNotificationId(activeFloatingNotification.id);
                    }}
                    className="inline-flex w-6 h-6 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white"
                  >
                    ✕
                  </span>
                </div>
              </button>
            </div>
          )}
        </>
      )}

      <main className="relative pb-24 md:pb-0">
        {isHebrewAlphabetRoute ? (
          <AnimatePresence mode="wait">
            <motion.div key="hebrew-alphabet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HebrewAlphabetPage />
            </motion.div>
          </AnimatePresence>
        ) : (
          <AnimatePresence mode="wait">

          {currentView === ViewState.AUTH && (
            <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AuthPage
                onLogin={handleLogin}
                onNavigateToRegister={() => setCurrentView(ViewState.ID_CARD)}
                onAdminClick={() => navigate('/admin')}
                onBack={() => setCurrentView(ViewState.HOME)}
                users={users}
                sessionUser={currentUser ? { id: currentUser.id, name: currentUser.name, photo: currentUser.photo } : null}
                initialView={authInitialView}
                initialIdentifier=""
              />
            </motion.div>
          )}

          {currentView === ViewState.HOME && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            >
              {/* Recycle Bin Notice Floating Banner */}
              {!isFrame && deletedUsers && deletedUsers.length > 0 && !dismissRecycleNotice && (
                <motion.div 
                  initial={{ opacity: 0, y: -50, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="fixed top-24 left-1/2 z-50 w-[90%] max-w-lg"
                >
                  <div className="bg-gradient-to-r from-red-950/95 via-[#2a080c]/95 to-red-950/95 border border-red-500/40 text-white rounded-3xl p-4 sm:px-5 sm:py-3.5 shadow-[0_20px_50px_rgba(239,68,68,0.3)] backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-400 border border-red-500/40 shrink-0 mt-0.5 sm:mt-0">
                        <AlertCircle size={16} className="animate-pulse sm:w-[18px] sm:h-[18px]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-0.5">Recycle Bin Notice</p>
                        <p className="text-[10px] sm:text-[11px] font-bold text-red-100 leading-snug">
                          {deletedUsers.length} {deletedUsers.length === 1 ? 'member' : 'members'} scheduled for permanent deletion {deletedUsers.length > 0 ? `(starts in ${Math.max(0, Math.ceil((new Date([...deletedUsers].sort((a,b) => new Date(a.autoDeleteAt).getTime() - new Date(b.autoDeleteAt).getTime())[0].autoDeleteAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days).` : '.'}
                        </p>
                      </div>
                    </div>
                    {currentUser?.role === 'Admin' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setCurrentView(ViewState.ADMIN_DASHBOARD);
                            navigate('/admin');
                          }}
                          className="bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 active:scale-95 px-3 py-2 rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all shrink-0 shadow-lg shadow-red-500/25 border-none cursor-pointer"
                        >
                          Manage Bin
                        </button>
                        <button 
                          onClick={() => setDismissRecycleNotice(true)}
                          className="p-1 hover:bg-white/10 rounded-full transition-colors shrink-0 cursor-pointer text-red-200 hover:text-white"
                          title="Dismiss"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                        <button 
                          onClick={() => setDismissRecycleNotice(true)}
                          className="p-1 hover:bg-white/10 rounded-full transition-colors shrink-0 cursor-pointer text-red-200 hover:text-white"
                          title="Dismiss"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {homeSectionsOrder.map((sectionId, index) => {
                if (homeSectionsHidden?.[sectionId]) return null;

                const renderSectionContent = () => {
                switch (sectionId) {
                  case 'dailyPsalm':
                    return <DailyPsalm119Section key="dailyPsalm" />;
                  case 'hero':
                    return (
                      <section key="hero" className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden py-8 md:py-12">
                {/* Cinematic image background with subtle golden motion */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  {/* Desktop Background */}
                  <motion.img
                    className="hidden md:block absolute inset-0 w-full h-full object-cover scale-[1.03]"
                    src="/assets/landing-background.png"
                    alt="City of Truth Ministries worship background"
                    initial={{ scale: 1.02 }}
                    animate={{ scale: 1.07 }}
                    transition={{ duration: 18, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                  />
                  {/* Mobile Background */}
                  <motion.img
                    className="block md:hidden absolute inset-0 w-full h-full object-cover scale-[1.03]"
                    src="/assets/landing-background-mobile.png"
                    alt="City of Truth Ministries worship background mobile"
                    initial={{ scale: 1.02 }}
                    animate={{ scale: 1.07 }}
                    transition={{ duration: 18, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(5,4,12,0.76) 0%, rgba(20,14,5,0.7) 48%, rgba(5,4,12,0.94) 100%)' }} />
                  <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 45% at 50% 42%, rgba(212,160,0,0.18) 0%, transparent 70%)' }} />
                  <motion.div
                    className="absolute -left-1/4 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-amber-300/10 to-transparent blur-2xl"
                    animate={{ x: ['0%', '180%'], opacity: [0.08, 0.2, 0.08] }}
                    transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <motion.span
                      key={i}
                      className="absolute h-1.5 w-1.5 rounded-full bg-amber-200/70 shadow-[0_0_14px_rgba(251,191,36,0.85)]"
                      style={{ left: `${14 + i * 14}%`, bottom: `${8 + (i % 3) * 16}%` }}
                      animate={{ y: [-8, -46, -8], opacity: [0.15, 0.75, 0.15], scale: [0.8, 1.25, 0.8] }}
                      transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.7 }}
                    />
                  ))}
                </div>

                <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl mx-auto w-full pt-10 md:pt-16">
                  {/* Registration badge — minimal pill */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="inline-flex flex-wrap items-center justify-center gap-2 mb-6 px-5 py-2 rounded-full border border-yellow-400/40 bg-yellow-500/10 backdrop-blur-xl"
                    style={{ boxShadow: '0 0 24px rgba(251,191,36,0.28)' }}
                  >
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" style={{ boxShadow: '0 0 8px rgba(251,191,36,0.9)' }} />
                    <span className="text-yellow-200 font-semibold tracking-widest uppercase text-[11px]">✦ Registration Open ✦</span>
                    <span className="hidden sm:inline-block h-3 w-px bg-yellow-200/30" />
                    <span className="text-yellow-100/90 font-black tracking-widest uppercase text-[10px]">
                      Closes in {countdown.days}d {countdown.hours}h {countdown.minutes}m
                    </span>
                  </motion.div>

                  {/* Desktop Layout (md and larger) */}
                  <div className="hidden md:block">
                    {/* Main title */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 40 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                      className="mb-4 whitespace-nowrap overflow-visible w-full flex justify-center"
                    >
                      <h1 className="font-black tracking-wider leading-none whitespace-nowrap overflow-visible">
                        <span className="pure-gold-text inline-block text-5xl sm:text-7xl lg:text-[6.8rem] xl:text-[8rem] 2xl:text-[9.5rem] pb-2 md:pb-4 whitespace-nowrap">சத்திய நகரம்</span>
                      </h1>
                    </motion.div>

                    {/* Subtitle */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="mb-2"
                    >
                      <h2 className="text-xl md:text-2xl font-semibold tracking-[0.2em] uppercase" style={{ color: "rgba(253,230,138,0.85)", letterSpacing: "0.2em" }}>City of Truth Ministries • வால்பாறை</h2>
                    </motion.div>

                    {/* Support text */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.4 }}
                      className="mb-10"
                    >
                      <span className="text-lg md:text-xl font-medium md:font-bold tracking-[0.25em]" style={{ color: "rgba(251,191,36,0.65)" }}>ஊழியங்கள்</span>
                    </motion.div>
                  </div>

                  {/* Mobile Layout (less than md - Stacked title alignment) */}
                  <div className="block md:hidden mb-10 w-full overflow-hidden px-1">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1.0 }}
                      className="flex flex-col items-center justify-center w-full text-center"
                    >
                      <h1 className="font-serif font-black tracking-wide flex flex-col items-center justify-center leading-tight w-full">
                        <span className="pure-gold-text inline-block text-[clamp(1.75rem,8.5vw,2.85rem)] pt-2 pb-1 px-1 mb-1 max-w-full leading-tight whitespace-nowrap">
                          சத்திய நகரம்
                        </span>
                        <span className="pure-gold-text inline-block text-[clamp(1.65rem,8vw,2.65rem)] pt-1 pb-3 px-1 mb-1 max-w-full leading-tight whitespace-nowrap">
                          ஊழியங்கள்
                        </span>
                      </h1>
                      <h2 className="text-[clamp(0.6rem,3.2vw,0.8rem)] font-extrabold tracking-[0.16em] uppercase mt-1 px-2 whitespace-nowrap text-center" style={{ color: "rgba(253,230,138,0.88)" }}>
                        City of Truth Ministries • வால்பாறை
                      </h2>
                    </motion.div>
                  </div>

                  {/* Animated verse carousel */}
                  <div className="h-24 md:h-20 mb-8 flex items-center justify-center px-4">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={heroVerse.ref}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.55 }}
                        className="text-sm md:text-base max-w-xl mx-auto leading-relaxed font-light italic"
                        style={{ color: "rgba(253,230,138,0.68)" }}
                      >
                        "{heroVerse.text}"<br />
                        <span className="not-italic tracking-wider text-xs" style={{ color: "rgba(251,191,36,0.5)" }}>— {heroVerse.ref}</span>
                      </motion.p>
                    </AnimatePresence>
                  </div>

                   {/* Buttons */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="flex flex-col items-center justify-center w-full px-2 sm:px-0"
                  >
                    <div className="flex items-center justify-center gap-3 sm:gap-5 w-full max-w-[31rem]">
                      <button
                        id="tour-register-btn"
                        type="button"
                        onClick={() => setCurrentView(ViewState.ID_CARD)}
                        className="group relative h-10 sm:h-11 w-36 sm:w-44 overflow-hidden border border-amber-600/70 bg-gradient-to-r from-[#8b5a0f] via-[#f6c04d] to-[#7a4707] text-[#2a1500] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.14em] shadow-[0_0_18px_rgba(245,158,11,0.45),inset_0_0_16px_rgba(255,255,255,0.28)] transition-all hover:brightness-110 active:scale-95"
                        style={{ clipPath: 'polygon(9px 0, calc(100% - 9px) 0, 100% 9px, 100% calc(100% - 9px), calc(100% - 9px) 100%, 9px 100%, 0 calc(100% - 9px), 0 9px)' }}
                      >
                        <span className="absolute inset-x-3 top-1 h-px bg-yellow-100/55" />
                        <span className="relative z-10">Register Now</span>
                        <span className="absolute inset-y-0 -left-10 w-8 rotate-12 bg-white/50 blur-sm transition-transform duration-700 group-hover:translate-x-56" />
                      </button>
                      <button
                        id="tour-login-btn"
                        type="button"
                        onClick={() => navigate('/auth?view=login')}
                        className="relative h-10 sm:h-11 w-36 sm:w-44 overflow-hidden border border-amber-500/55 bg-black/35 text-amber-200 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] shadow-[inset_0_0_18px_rgba(245,158,11,0.12)] backdrop-blur-sm transition-all hover:bg-amber-500/10 hover:border-amber-300/75 active:scale-95"
                        style={{ clipPath: 'polygon(9px 0, calc(100% - 9px) 0, 100% 9px, 100% calc(100% - 9px), calc(100% - 9px) 100%, 9px 100%, 0 calc(100% - 9px), 0 9px)' }}
                      >
                        <span className="absolute inset-x-3 top-1 h-px bg-yellow-100/20" />
                        <span className="relative z-10">Login</span>
                      </button>
                    </div>
                    <div className="mt-3 flex w-full max-w-[31rem] items-center justify-center gap-2 text-amber-500/55">
                      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/45 to-amber-500/10" />
                      <span className="relative h-4 w-20">
                        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-amber-400/70 bg-amber-300/20" />
                        <span className="absolute left-[20%] top-1/2 h-px w-4 -translate-y-1/2 bg-amber-500/55" />
                        <span className="absolute right-[20%] top-1/2 h-px w-4 -translate-y-1/2 bg-amber-500/55" />
                      </span>
                      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-500/45 to-amber-500/10" />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.82 }}
                    className="mt-7 grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-xl mx-auto px-2"
                  >
                    {[
                      { icon: BookOpen, label: 'Alphabet', action: () => navigate('/hebrew-alphabet') },
                      { icon: Globe, label: 'Baruch Hashem', action: () => setCurrentView(ViewState.BARUCH_HASHEM) },
                      { icon: UserIcon, label: 'Pastor', action: () => setCurrentView(ViewState.PASTOR) },
                    ].map(({ icon: Icon, label, action }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={action}
                        className="group rounded-2xl border border-yellow-300/20 bg-black/24 px-2 py-3 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-yellow-300/45 hover:bg-yellow-400/10 active:scale-[0.98]"
                      >
                        <span className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-300/12 text-yellow-200 group-hover:bg-yellow-300/20">
                          <Icon size={15} />
                        </span>
                        <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-yellow-100/85">{label}</span>
                      </button>
                    ))}
                  </motion.div>

                  {/* Quick Message Widget */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.9 }}
                    className="mt-10 flex flex-col items-center gap-2 px-4 sm:px-0 w-full"
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-1" style={{ color: "rgba(251,191,36,0.45)" }}>✦ Send Us a Message ✦</p>
                    <div
                      className="flex w-full max-w-sm overflow-hidden rounded-2xl"
                      style={{ background: "rgba(251,191,36,0.05)", backdropFilter: "blur(14px)", border: "1px solid rgba(251,191,36,0.2)", boxShadow: "0 4px 24px rgba(0,0,0,0.25), 0 0 0 1px rgba(251,191,36,0.08)" }}
                    >
                      <input
                        type="text"
                        placeholder="Type your message or prayer request…"
                        value={heroEmail}
                        onChange={e => setHeroEmail(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && heroEmail.trim()) {
                            handleHeroSendMessage();
                          }
                        }}
                        className="flex-1 bg-transparent text-white placeholder:text-white/35 text-xs sm:text-sm px-4 py-3 outline-none font-light min-w-0"
                      />
                      <button
                        disabled={!heroEmail.trim()}
                        onClick={handleHeroSendMessage}
                        className="flex items-center gap-1.5 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-4 py-3 transition-all disabled:opacity-30 shrink-0"
                        style={{ background: "rgba(251,191,36,0.22)", borderLeft: "1px solid rgba(251,191,36,0.2)", color: "rgba(253,230,138,0.95)" }}
                      >
                        <Send size={13} />
                        Send
                      </button>
                    </div>
                    <p className="text-[10px] tracking-wide" style={{ color: "rgba(251,191,36,0.25)" }}>Your message will reach our Admin directly.</p>
                  </motion.div>
                  {currentUser && (() => {
                    const userNotes = memberNotifications.filter(note => note.userId === currentUser.id && note.from === 'admin');
                    const unreadCount = userNotes.filter(note => !note.read).length;
                    if (userNotes.length === 0) return null;
                    return (
                      <motion.button
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.05 }}
                        onClick={() => {
                          if (currentUser.status === 'Rejected') {
                            alert(REJECTED_ACCESS_MESSAGE);
                            return;
                          }
                          setDashboardFocusSection('notifications');
                          setCurrentView(ViewState.USER_DASHBOARD);
                        }}
                        className="mt-4 w-full max-w-sm rounded-2xl border border-yellow-300/40 bg-yellow-500/10 backdrop-blur-xl px-4 py-3 text-left hover:bg-yellow-500/20 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs sm:text-sm font-black text-yellow-100">Admin Notification{userNotes.length > 1 ? 's' : ''}</p>
                          <span className="px-2 py-0.5 rounded-full bg-yellow-300 text-brand-950 text-[10px] font-black">
                            {unreadCount > 0 ? `${unreadCount} New` : `${userNotes.length} Total`}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-yellow-50/90 line-clamp-2">{userNotes[0]?.message}</p>
                        <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-yellow-200/80">Tap to open dashboard messages</p>
                      </motion.button>
                    );
                  })()}
                </div>
                <motion.button
                  type="button"
                  onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                  className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 hidden sm:flex flex-col items-center gap-1 text-yellow-100/55 hover:text-yellow-100 transition-colors"
                  animate={{ y: [0, 7, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  aria-label="Scroll to explore"
                >
                  <span className="text-[9px] font-black uppercase tracking-[0.25em]">Scroll to Explore</span>
                  <ChevronRight size={18} className="rotate-90" />
                </motion.button>
              </section>
            );
                  case 'about':
                    return (
                      <section key="about" className="py-24 bg-gradient-to-br from-[#0c0813] via-[#060409] to-[#0f091a] text-white relative overflow-hidden">
                        {/* Background ambient glows */}
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.015),transparent_60%)] pointer-events-none" />
                        
                        <div className="container mx-auto px-6 relative z-10">
                          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                            {/* Left text & stats column */}
                            <motion.div
                              initial={{ opacity: 0, x: -40 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.8 }}
                              className="text-left"
                            >
                              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-6 backdrop-blur-xl">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-red-400">COT Broadcasting Hub</span>
                              </div>
                              
                              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black mb-6 leading-[1.1] tracking-tight">
                                Experience Divine Truth <br className="hidden md:inline" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">
                                  In Power & Glory
                                </span>
                              </h2>
                              
                              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                Step into a sanctuary of high-production spiritual broadcasts. Stream our anointed sermons, deep Hebrew mysteries, and divine worship songs directly on our official YouTube channel. Live every Sunday, archived for your spiritual growth.
                              </p>
                              
                              {/* Premium Stats Dashboard Grid */}
                              <div className="grid grid-cols-3 gap-4 mb-10">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                  <p className="text-3xl font-black text-red-500">100+</p>
                                  <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold mt-1">Sermons</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                  <p className="text-3xl font-black text-amber-500">Live</p>
                                  <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold mt-1">Broadcasts</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                  <p className="text-3xl font-black text-rose-500">Torah</p>
                                  <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold mt-1">Hebrew Hub</p>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-4">
                                <button
                                  onClick={() => window.open(youtubeLink, '_blank', 'noopener,noreferrer')}
                                  className="group flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-base hover:from-red-500 hover:to-rose-500 transition-all shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:scale-105 active:scale-95"
                                >
                                  <Youtube size={22} className="text-white" />
                                  Watch Live on YouTube
                                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                  onClick={() => setCurrentView(ViewState.ABOUT)}
                                  className="group flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 bg-white/5 font-extrabold text-base text-gray-200 hover:bg-white/10 hover:border-amber-400/40 hover:text-amber-300 transition-all"
                                >
                                  Explore Hebrew Tools
                                </button>
                              </div>
                            </motion.div>
                            
                            {/* Right interactive video player column */}
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, x: 40 }}
                              whileInView={{ opacity: 1, scale: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.8 }}
                              className="relative mx-auto lg:mx-0 w-full max-w-lg lg:max-w-none"
                            >
                              <div className="relative group rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(239,68,68,0.18)] border border-white/10 bg-white/5 backdrop-blur-xl p-3">
                                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-inner">
                                  <video
                                    src="/சத்திய_நகரம்_City_of_Truth_Min.mp4"
                                    poster="https://images.unsplash.com/photo-1510590337019-5ef2d39aa786?q=80&w=2670&auto=format&fit=crop"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                    style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)" }}
                                  />
                                </div>
                              </div>
                              
                              {/* Decorative back glow card */}
                              <div className="absolute -inset-1.5 rounded-[2rem] bg-gradient-to-r from-red-600 to-amber-500 opacity-25 blur-2xl -z-10 group-hover:opacity-40 transition-opacity duration-500" />
                            </motion.div>
                          </div>
                        </div>
                      </section>
                    );
          case 'menorah': return <GoldenMenorah key="menorah" onPreviewClick={() => handleViewChange(ViewState.GOLDEN_MENORAH)} />;
          case 'highlights': return <MinistryHighlights key="highlights" setView={handleViewChange} />;
          case 'leader': return null; // Leader message is now a fixed overlay triggered by email input
          case 'hebrew': return <HebrewSanctuaryIntro key="hebrew" setView={setCurrentView} />;
          case 'hebrewPages': return <HebrewPagesPreviewSection key="hebrewPages" setView={setCurrentView} />;
          case 'pastorBaruch': return <PastorBaruchPreviewSection key="pastorBaruch" setView={setCurrentView} />;
          case 'valparai': return <ValparaiPresence key="valparai" setView={setCurrentView} />;
          case 'testimonials': return <TestimonialSection key="testimonials" currentUser={currentUser || undefined} />;
          case 'members': return <CommunityMembersSection key="members" setView={setCurrentView} users={users} />;
          case 'preview': return <EntrustCardPreview key="preview" setView={setCurrentView} />;
          case 'donations': return <DonationsHighlight key="donations" setView={setCurrentView} onDonate={() => setShowDonationModal(true)} />;
          case 'verify':
            return (
              <section key="verify" className="py-24 bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-accent-500 to-brand-500" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.04)_0%,transparent_60%)] pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10">
                  <div className="text-center mb-16">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-brand-100">
                        <ShieldCheck size={14} /> Member Verification
                      </span>
                      <h2 className="text-4xl md:text-5xl font-serif font-black text-brand-950 mb-4">Verify Your Membership</h2>
                      <p className="text-slate-500 max-w-xl mx-auto font-medium">Confirm your City of Truth membership status through any of these official methods.</p>
                    </motion.div>
                  </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                      {[
                        { id: 'tour-verify-login-card', icon: UserIcon, label: 'Login to Account', desc: 'Access your personal dashboard with your Member ID, phone, or email.', color: 'from-brand-500 to-brand-700', light: 'bg-brand-50 text-brand-600', action: () => navigate('/auth?view=login'), cta: 'Login Now' },
                        { id: 'tour-verify-upload-card', icon: UploadCloud, label: 'Upload Entrust PDF', desc: 'Upload your Entrust Card PDF to verify your membership document.', color: 'from-accent-500 to-accent-700', light: 'bg-accent-50 text-accent-600', action: () => navigate('/auth?view=login&option=upload'), cta: 'Upload File' },
                      { id: 'tour-verify-card-view', icon: CreditCard, label: 'View Entrust Card', desc: 'Register or view your official digital ID card and QR code.', color: 'from-emerald-500 to-emerald-700', light: 'bg-emerald-50 text-emerald-600', action: () => setCurrentView(ViewState.ID_CARD), cta: 'View Card' },
                      { id: 'tour-verify-scan-card', icon: CheckCircle, label: 'Scan QR Code', desc: 'Scan any member\'s QR code to instantly verify their identity.', color: 'from-amber-500 to-orange-600', light: 'bg-amber-50 text-amber-600', action: () => navigate('/auth?view=login&option=scan'), cta: 'Open Scanner' },
                    ].map((item, i) => (
                      <motion.div
                        id={item.id}
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        onClick={item.action}
                        className="group bg-white border border-slate-100 rounded-3xl p-7 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500 from-brand-500 to-accent-500 rounded-3xl" />
                        <div className={`w-14 h-14 ${item.light} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                          <item.icon size={26} />
                        </div>
                        <h3 className="font-black text-brand-950 text-lg mb-2 leading-tight"><EditableText id={'footer-' + item.label} defaultText={item.label} /></h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-5">{item.desc}</p>
                        <div className={`inline-flex items-center gap-2 text-sm font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent group-hover:gap-3 transition-all`}>
                          {item.cta} <ChevronRight size={14} className={`text-brand-500`} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            );
          default: return null;
        }
                }; // end renderSectionContent

                if (!isWebsiteBuilderMode) return renderSectionContent();

                return (
                  <div
                    key={sectionId}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', index.toString());
                      e.dataTransfer.effectAllowed = 'move';
                      e.currentTarget.style.opacity = '0.5';
                    }}
                    onDragEnd={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const draggedIndexStr = e.dataTransfer.getData('text/plain');
                      if (!draggedIndexStr) return;
                      const draggedIndex = parseInt(draggedIndexStr, 10);
                      if (draggedIndex === index) return;

                      const newOrder = [...homeSectionsOrder];
                      const [draggedItem] = newOrder.splice(draggedIndex, 1);
                      newOrder.splice(index, 0, draggedItem);

                      setUndoStack(u => [...u, { type: 'HOME_SECTIONS', oldOrder: homeSectionsOrder, newOrder }]);
                      setRedoStack([]);
                      setHomeSectionsOrder(newOrder);
                    }}
                    className="relative group border-2 border-transparent hover:border-blue-400 transition-colors duration-200 cursor-move"
                  >
                    <div className="absolute top-2 left-2 z-50 bg-blue-500 text-white p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 flex items-center gap-2 pointer-events-none">
                      <Move size={16} /> Drag to Reorder Section
                    </div>
                    {renderSectionContent()}
                  </div>
                );
      })}
            </motion.div>
          )}

          {[ViewState.ABOUT, ViewState.HEBREW_CALENDAR, ViewState.HEBREW_CLOCK, ViewState.HEBREW_FESTIVALS, ViewState.HEBREW_REFERENCE, ViewState.HEBREW_GRAMMAR, ViewState.HEBREW_ISRAEL, ViewState.PDF_DOWNLOADS].includes(currentView) && (
            <div key="hebrew-hub-content">
              <HebrewResources mode="content" currentUser={currentUser || undefined} currentView={currentView} setView={setCurrentView} />
            </div>
          )}

          {[ViewState.HEBREW_TOOLS, ViewState.HEBREW_WORDS, ViewState.HEBREW_LETTERS_AUDIO, ViewState.HEBREW_NUMBERS, ViewState.HEBREW_GEMATRIA].includes(currentView) && (
            <div key="hebrew-hub-tools">
              <HebrewResources mode="tools" currentView={currentView} setView={setCurrentView} />
            </div>
          )}

          {currentView === ViewState.ABOUT_VALPARAI && (
            <motion.div key="valparai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <ValparaiPage setView={setCurrentView} />
            </motion.div>
          )}

          {currentView === ViewState.GOLDEN_MENORAH && (
            <motion.div key="menorah-page" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <GoldenMenorahPage onBack={() => setCurrentView(ViewState.HOME)} />
            </motion.div>
          )}

          {currentView === ViewState.MINISTRIES && (
            <motion.div key="ministries" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}>
              <MinistriesPage currentUser={currentUser} setView={setCurrentView} />
            </motion.div>
          )}

          {currentView === ViewState.ID_CARD && (
            <motion.div key="id-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <WorshipperIDCard onRegister={handleRegister} onLogin={() => navigate('/auth?view=login')} />
            </motion.div>
          )}

          {currentView === ViewState.PASTOR && (
            <motion.div key="pastor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <PastorPage />
            </motion.div>
          )}

          {currentView === ViewState.BARUCH_HASHEM && (
            <motion.div key="baruch" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <BaruchHashemPage />
            </motion.div>
          )}

          {currentView === ViewState.AI && (
            <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <AIPage onBack={() => setCurrentView(ViewState.HOME)} />
            </motion.div>
          )}

          {currentView === ViewState.ADMIN_DASHBOARD && currentUser && (
            <motion.div key="admin-dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <AdminDashboard
                users={users}
                deletedUsers={deletedUsers}
                contactMessages={contactMessages}
                deletedContactMessages={deletedContactMessages}
                memberNotifications={memberNotifications}
                deletedMemberNotifications={deletedMemberNotifications}
                onSendMessageToUsers={handleAdminSendMessageToUsers}
                onDeleteContactMessage={handleDeleteContactMessage}
                onRestoreContactMessage={handleRestoreContactMessage}
                onDeleteMemberNotification={handleDeleteMemberNotification}
                onRestoreMemberNotification={handleRestoreMemberNotification}
                onUpdateMemberNotification={handleUpdateMemberNotification}
                onUpdateUser={async (user) => {
                  const prevUser = users.find(u => u.id === user.id);
                  await api.updateUser(user);
                  setUsers(prev => prev.map(u => u.id === user.id ? user : u));
                  setCurrentUser(prev => prev && prev.id === user.id ? user : prev);
                  if (prevUser && prevUser.status !== user.status) {
                    if (user.status === 'Active') {
                      setShowCelebration(true);
                      setCelebrationMode('approval');
                      pushAdminNotification(
                        user.id,
                        "🎉 Congratulations! Your account has been officially Approved! Welcome to City of Truth Ministries! 🥳✨ Please fill your Member Form now to complete your profile.",
                        'approved'
                      );
                      pushAdminNotification(
                        user.id,
                        "Leader Message: Congratulations! Please complete your Member Form beautifully to unlock all ministry features.",
                        'leader'
                      );
                    } else if (user.status === 'Rejected') {
                      pushAdminNotification(
                        user.id,
                        "Your account was disapproved by admin. Please review the disapproval reason, update details, and contact support.",
                        'disapproved'
                      );
                    }
                  }
                  notifyMemberFormRefillIfRejected(prevUser, user);
                }}
                onDeleteUser={async (userId) => {
                  await handleDeleteUser(userId);
                }}
                onReassignUserId={handleReassignUserId}
                onRestoreUser={handleRestoreDeletedUser}
                onPermanentlyDeleteUser={handlePermanentlyDeleteDeletedUser}
                homeSectionsOrder={homeSectionsOrder}
                onUpdateHomeSectionsOrder={async (newOrder) => {
                  setHomeSectionsOrder(newOrder);
                  localStorage.setItem('cot_home_sections_order', JSON.stringify(newOrder));
                  try {
                    await api.updateHomeLayout(newOrder);
                  } catch (error) {
                    console.error('Failed to save layout to cloud:', error);
                  }
                }}
                navItems={navigationItems}
                onUpdateNavItems={async (newItems) => {
                  const updatedNav = ensureHebrewNavItems(normalizeNavItems(newItems));
                  setNavigationItems(updatedNav);
                  try {
                    await api.updateNavigationLayout(updatedNav);
                  } catch (error) {
                    console.error('Failed to save nav layout to cloud:', error);
                  }
                }}
                onBack={() => setCurrentView(ViewState.HOME)}
              />
            </motion.div>
          )}

          {currentView === ViewState.USER_DASHBOARD && currentUser && currentUser.status !== 'Rejected' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <UserDashboard
                user={currentUser}
                allUsers={users}
                initialProfileId={selectedDashboardProfileId || undefined}
                onEdit={() => { }}
                onLogout={handleLogout}
                onGoToLogin={() => navigate('/auth?view=login')}
                onOpenScanner={() => setCurrentView(ViewState.VERIFY_ID)}
                notifications={memberNotifications.filter(note => note.userId === currentUser.id && note.from === 'admin')}
                focusSection={dashboardFocusSection}
                onSendReply={(message) => handleUserReplyToAdmin(currentUser.id, message)}
                onMarkNotificationsRead={() => handleMarkUserNotificationsRead(currentUser.id)}
                onDeleteNotification={(notificationId) => handleDeleteUserNotification(currentUser.id, notificationId)}
                onDeleteAccount={async () => {
                  try {
                    await api.deleteUser(currentUser.id);
                    await api.permanentlyDeleteDeletedUser(currentUser.id);
                    setUsers(prev => prev.filter(u => u.id !== currentUser.id));
                    setDeletedUsers(prev => prev.filter(u => u.id !== currentUser.id));
                    handleLogout();
                    alert("Your account has been deleted permanently.");
                  } catch (err) {
                    console.error("Failed to delete account:", err);
                    alert("Failed to delete account. Please try again.");
                  }
                }}
                onUpdate={async (updatedUser) => {
                  const existingUserRecord = users.find(u => u.id === updatedUser.id) || currentUser;
                  const safeUpdatedUser = existingUserRecord && updatedUser.pendingProfileUpdate
                    ? {
                      ...existingUserRecord,
                      photo: updatedUser.photo !== undefined ? updatedUser.photo : existingUserRecord.photo,
                      linkedProfiles: updatedUser.linkedProfiles !== undefined ? updatedUser.linkedProfiles : existingUserRecord.linkedProfiles,
                      verificationDoc: updatedUser.verificationDoc !== undefined ? updatedUser.verificationDoc : existingUserRecord.verificationDoc,
                      communityProfile: updatedUser.communityProfile !== undefined ? updatedUser.communityProfile : existingUserRecord.communityProfile,
                      pendingProfileUpdate: updatedUser.pendingProfileUpdate
                    }
                    : updatedUser;

                  await api.updateUser(safeUpdatedUser);
                  setCurrentUser(safeUpdatedUser);
                  setUsers(prev => prev.map(u => u.id === safeUpdatedUser.id ? safeUpdatedUser : u));
                  if (safeUpdatedUser.pendingProfileUpdate) {
                    alert("✅ Edit request submitted. Changes will be reflected after admin approval.");
                  } else {
                    alert("Profile Updated Successfully!");
                  }
                  setDashboardFocusSection(null);
                }}
              />
            </motion.div>
          )}



          {currentView === ViewState.VERIFY_ID && (
            <VerifyIDPage 
              currentUser={currentUser} 
              onProceedToDashboard={handleLogin} 
              onClose={() => {
                if (currentUser) {
                  setCurrentView(ViewState.USER_DASHBOARD);
                } else {
                  setCurrentView(ViewState.HOME);
                }
              }}
            />
          )}

          {currentView === ViewState.MEMBER_FORM && currentUser && (
            <motion.div key="member-form-standalone" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-24 md:pt-32 pb-20 bg-slate-50 min-h-screen flex items-center justify-center">
              <div className="container mx-auto px-6 max-w-4xl relative z-10">
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center">
                  <span className="inline-block bg-[#d4a547]/10 text-[#d4a547] px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                    Official Ministry Registration
                  </span>
                  <h2 className="text-3xl font-serif font-black text-[#1a1b4b]">Member Profile Form</h2>
                  <p className="text-slate-500 mt-2 text-sm max-w-lg mx-auto">
                    Fill out your community, denomination, and ministry details. This is submitted for administrative review and linked to your official ID.
                  </p>
                  
                  <div className="mt-8 flex justify-center">
                    <button 
                      onClick={() => {
                        const btn = document.getElementById('standalone-form-trigger-btn');
                        if (btn) btn.click();
                      }}
                      className="px-8 py-4 bg-gradient-to-r from-brand-600 to-indigo-700 hover:from-brand-700 hover:to-indigo-850 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
                    >
                      Fill Out Form Now
                    </button>
                  </div>
                  
                  <div className="hidden">
                    <button id="standalone-form-trigger-btn" onClick={() => {}} />
                  </div>
                </div>
              </div>
              
              <CommunityProfileForm
                isOpen={true}
                onClose={() => {
                  if (currentUser.role === 'Admin') {
                    setCurrentView(ViewState.ADMIN_DASHBOARD);
                  } else {
                    setCurrentView(ViewState.USER_DASHBOARD);
                  }
                }}
                onSave={async (communityData) => {
                  const updatedUser = {
                    ...currentUser,
                    communityProfile: communityData,
                    pendingProfileUpdate: {
                      ...currentUser.pendingProfileUpdate,
                      communityProfile: communityData
                    }
                  };
                  await api.updateUser(updatedUser);
                  setCurrentUser(updatedUser);
                  setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
                  alert("✅ Your Member Profile Registration Form has been saved successfully and submitted for admin review!");
                  setCurrentView(ViewState.USER_DASHBOARD);
                }}
                initialData={currentUser.communityProfile}
              />
            </motion.div>
          )}

          {currentView === ViewState.MEMBER_FORM && !currentUser && (
            <motion.div key="member-form-guest" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-24 md:pt-32 pb-20 bg-slate-50 min-h-screen flex items-center justify-center">
              <div className="container mx-auto px-6 max-w-xl relative z-10">
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-500 via-amber-500 to-indigo-600" />
                  
                  <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-6 border border-amber-100 shadow-inner">
                    <Church size={32} />
                  </div>
                  
                  <span className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                    Worshipper Portal
                  </span>
                  
                  <h2 className="text-2xl font-serif font-black text-brand-950">Registration Required</h2>
                  
                  <p className="text-slate-500 mt-4 text-xs font-semibold leading-relaxed">
                    To complete your official **Member Profile Registration Form**, you need to have an active worshipper account. This ensures your profile and testimony are securely stored and linked to your custom **Worshipper ID Card**.
                  </p>
                  
                  <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => {
                        navigate('/auth?view=login');
                        setCurrentView(ViewState.AUTH);
                      }}
                      className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-slate-200"
                    >
                      Login to Account
                    </button>
                    <button
                      onClick={() => {
                        navigate('/auth?view=register');
                        setCurrentView(ViewState.AUTH);
                      }}
                      className="px-6 py-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-750 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md hover:shadow-lg"
                    >
                      Create Free Account
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setCurrentView(ViewState.HOME)}
                    className="mt-6 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-brand-600 transition-colors bg-transparent border-none outline-none cursor-pointer"
                  >
                    ← Return to Home
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === ViewState.CONTACT && (
            <motion.div key="contact" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-24 md:pt-32 pb-20 bg-slate-50 min-h-screen">
              <div className="container mx-auto px-6 max-w-7xl">
                {/* Header */}
                <header className="text-center mb-16 max-w-2xl mx-auto">
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-6"
                  >
                    <Headset size={14} /> WE'D LOVE TO HEAR FROM YOU
                  </motion.span>
                  <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-950 mb-6 tracking-tight">Get in Touch</h1>
                  <p className="text-lg text-slate-500 font-normal leading-relaxed">
                    Whether you have a prayer request, a question about our ministries, or just want to say hello, we are here for you.
                  </p>
                </header>

                <div className="grid lg:grid-cols-2 gap-16 items-start">
                  {/* Left Column */}
                  <div className="space-y-10 text-left">
                    <div className="flex flex-col gap-5">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6"
                      >
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                          <MapPin size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-brand-950 text-base">Visit Us</h3>
                          <p className="text-sm text-slate-500 leading-relaxed">New Market, Valparai<br />Tamil Nadu, 642127</p>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6"
                      >
                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                          <Clock size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-brand-950 text-base">Service Times</h3>
                          <p className="text-sm text-slate-500 leading-relaxed">Sunday: 9:30 AM<br />Wednesday: 6:30 PM</p>
                        </div>
                      </motion.div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="h-px bg-slate-200 flex-1"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Instant Connect</span>
                        <div className="h-px bg-slate-200 flex-1"></div>
                      </div>

                      <a href="https://wa.me/918056125478" target="_blank" rel="noopener noreferrer" className="flex items-center p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-transform hover:-translate-y-1 group">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-5">
                          <MessageCircle size={24} />
                        </div>
                        <div className="flex-1">
                          <strong className="block text-base">Chat on WhatsApp</strong>
                          <span className="text-xs opacity-80 font-medium">Available 9 AM - 6 PM</span>
                        </div>
                        <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                      </a>

                      <a href="mailto:faithfulfellowship8@gmail.com" className="flex items-center p-5 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20 transition-transform hover:-translate-y-1 group">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-5">
                          <Mail size={24} />
                        </div>
                        <div className="flex-1">
                          <strong className="block text-base">Send Message</strong>
                          <span className="text-xs opacity-80 font-medium">Replies within 24 hours</span>
                        </div>
                        <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                      </a>

                      <a href="tel:+918056125478" className="flex items-center p-5 rounded-2xl bg-white border border-slate-100 shadow-sm transition-transform hover:-translate-y-1 group">
                        <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mr-5">
                          <Phone size={24} />
                        </div>
                        <div className="flex-1 text-left">
                          <strong className="block text-base text-brand-950 font-bold">Call Support</strong>
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">+91 80561 25478</span>
                        </div>
                        <ChevronRight size={20} className="text-slate-300" />
                      </a>
                    </div>
                  </div>

                  {/* Right Column: Form */}
                  <div className="bg-white p-10 md:p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-brand-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
                    <form className="space-y-6 md:space-y-8 relative z-10 text-left" onSubmit={handleContactFormSubmit}>
                      {currentUser && (
                        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-700 bg-brand-50 border border-brand-100 rounded-xl px-3 py-2">
                          Sending as {currentUser.name || 'Registered User'} ({currentUser.id})
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Your Name</label>
                        <div className="relative">
                          <UserIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="text" placeholder="John Doe" readOnly={!!currentUser} className={`w-full pl-12 md:pl-14 pr-5 md:pr-6 py-3 md:py-4 border border-slate-100 rounded-2xl outline-none transition-all text-sm font-bold text-brand-950 ${currentUser ? 'bg-slate-100 text-slate-600 cursor-not-allowed' : 'bg-slate-50 hover:bg-white focus:bg-white focus:ring-4 focus:ring-brand-500/10'}`} value={contactForm.name} onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="email" placeholder="john@example.com" readOnly={!!currentUser} className={`w-full pl-12 md:pl-14 pr-5 md:pr-6 py-3 md:py-4 border border-slate-100 rounded-2xl outline-none transition-all text-sm font-bold text-brand-950 ${currentUser ? 'bg-slate-100 text-slate-600 cursor-not-allowed' : 'bg-slate-50 hover:bg-white focus:bg-white focus:ring-4 focus:ring-brand-500/10'}`} value={contactForm.email} onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Subject</label>
                        <div className="relative">
                          <Briefcase size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <select className="w-full pl-12 md:pl-14 pr-5 md:pr-6 py-3 md:py-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white focus:bg-white focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-sm font-bold text-brand-950 appearance-none" value={contactForm.subject} onChange={e => setContactForm(prev => ({ ...prev, subject: e.target.value }))}>
                            <option>Prayer Request</option>
                            <option>General Inquiry</option>
                            <option>Event Info</option>
                          </select>
                          <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Message</label>
                        <textarea placeholder="How can we help you today?" className="w-full p-4 md:p-6 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white focus:bg-white focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-sm font-bold text-brand-950 h-28 md:h-32 resize-none" value={contactForm.message} onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))}></textarea>
                      </div>

                      <Button type="submit" variant="primary" fullWidth className="py-4 md:py-6 text-xs sm:text-sm font-black uppercase tracking-[0.2em] rounded-2xl bg-brand-950 shadow-2xl shadow-brand-950/30">
                        Send Message <Send size={18} />
                      </Button>
                    </form>
                  </div>
                </div>

                {/* Map Section */}
                <div className="mt-24 h-[450px] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white relative z-10">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15685.83603417646!2d76.9404285871582!3d10.327499999999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba85d7d3f1d2b7f%3A0x6b0b8b0b8b0b8b0b!2sValparai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1710336000000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>
            </motion.div>
          )}

          </AnimatePresence>
        )}
      </main>
      {!isFrame && (
        <>
          {/* Bottom Navigation Bar (mobile) */}
          <BottomNav currentView={currentView} setView={setCurrentView} />

      {/* Fixed Leader Message Popup */}
      <AnimatePresence>
        {showLeaderMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-4 right-4 md:bottom-10 md:right-10 z-[100] w-[calc(100%-2rem)] md:w-full max-w-md md:max-w-lg"
          >
            <div className="bg-white/95 backdrop-blur-3xl rounded-[2.5rem] p-4 shadow-2xl shadow-brand-900/40 border-4 border-white">
              <MessageFromLeader onClose={() => setShowLeaderMessage(false)} className="!p-0 !m-0 !py-0" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWelcomeIntro && currentView === ViewState.HOME && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[170] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 24, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 16, scale: 0.98, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 md:p-7 shadow-2xl border border-slate-100"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-black tracking-wider uppercase mb-4">
                👋 Welcome
              </div>
              <h3 className="text-2xl font-serif font-bold text-brand-950 mb-2">City of Truth Ministries</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Explore ministries, register for your Entrust card, and verify membership from one place.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={skipIntro}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={startTour}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                >
                  Take a quick tour
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {tourStepIndex !== null && currentView === ViewState.HOME && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[180] pointer-events-none"
          >
            <div className="absolute inset-0 bg-black/65" />

            {tourRect && (
              <>
                <div
                  className="absolute rounded-2xl border-2 border-amber-300 shadow-[0_0_0_9999px_rgba(2,6,23,0.72)]"
                  style={{
                    top: tourRect.top,
                    left: tourRect.left,
                    width: tourRect.width,
                    height: tourRect.height
                  }}
                />
                <motion.div
                  initial={{ opacity: 0.75, y: -4 }}
                  animate={{ opacity: 1, y: 4 }}
                  transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.8 }}
                  className="absolute px-2.5 py-1 rounded-full bg-amber-400 text-brand-950 text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5"
                  style={{
                    top: Math.max(8, tourRect.top - 34),
                    left: tourRect.left + Math.max(8, tourRect.width / 2 - 62),
                  }}
                >
                  <ArrowRight size={12} className="rotate-90" />
                  Focus here
                </motion.div>
              </>
            )}

            <div className="absolute left-1/2 -translate-x-1/2 bottom-5 w-[calc(100%-1.5rem)] max-w-md bg-white rounded-3xl p-5 shadow-2xl pointer-events-auto">
              <div className="text-[11px] uppercase tracking-widest font-black text-brand-500 mb-2">
                Quick Tour • Step {tourStepIndex + 1} of {TOUR_STEPS.length}
              </div>
              <h4 className="text-lg font-bold text-brand-950 mb-1">{TOUR_STEPS[tourStepIndex]?.title}</h4>
              <p className="text-sm text-slate-600 mb-4">{TOUR_STEPS[tourStepIndex]?.text}</p>
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={closeTour}
                  className="px-4 py-2 text-sm font-bold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Skip tour
                </button>
                <button
                  onClick={() => {
                    const isLastStep = tourStepIndex >= TOUR_STEPS.length - 1;
                    if (isLastStep) {
                      closeTour();
                    } else {
                      setTourStepIndex(tourStepIndex + 1);
                    }
                  }}
                  className="px-4 py-2 text-sm font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                >
                  {tourStepIndex >= TOUR_STEPS.length - 1 ? 'Done' : 'Next'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Donation Modal */}
      <DonationModal isOpen={showDonationModal} onClose={() => setShowDonationModal(false)} />

      {/* Account Status Notice */}
      <AnimatePresence>
        {statusNotice && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[220] w-[calc(100%-1.5rem)] max-w-md"
          >
            <div className={`rounded-2xl border p-4 shadow-2xl ${statusNotice.type === 'approved'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
              }`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-xs font-black uppercase tracking-widest ${statusNotice.type === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
                    {statusNotice.type === 'approved' ? 'Approval Update' : 'Account Notice'}
                  </p>
                  <p className={`text-sm font-semibold mt-1 ${statusNotice.type === 'approved' ? 'text-green-900' : 'text-red-900'}`}>
                    {statusNotice.message}
                  </p>
                </div>
                <button onClick={() => setStatusNotice(null)} className="text-slate-500 hover:text-slate-700 font-bold">✕</button>
              </div>
              <button
                onClick={() => {
                  setCurrentView(ViewState.HOME);
                  setStatusNotice(null);
                }}
                className="mt-3 w-full py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
              >
                Go to Website Home
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✨ ADMIN APPROVAL FIREWORKS CELEBRATION ✨ */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            {/* Firework particles */}
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i / 24) * 360;
              const dist = 120 + ((i * 37) % 200);
              const x = Math.cos((angle * Math.PI) / 180) * dist;
              const y = Math.sin((angle * Math.PI) / 180) * dist;
              const colors = ['#fbbf24', '#f59e0b', '#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#fff'];
              const color = colors[i % colors.length];
              const size = 6 + ((i * 17) % 10);
              const delay = ((i * 13) % 5) / 10;
              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{ x, y, opacity: 0, scale: 1 }}
                  transition={{ duration: 1.5, delay, ease: 'easeOut', repeat: Infinity, repeatDelay: 2 }}
                  className="absolute rounded-full pointer-events-none"
                  style={{ width: size, height: size, background: color, top: '50%', left: '50%', marginTop: -size / 2, marginLeft: -size / 2 }}
                />
              );
            })}

            {/* Celebration card */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
              className="relative bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 rounded-[2.5rem] p-10 md:p-14 max-w-md w-[90%] text-center border border-amber-400/30 shadow-[0_0_80px_rgba(251,191,36,0.3)] mx-4"
            >
              {/* Glowing ring */}
              <motion.div
                animate={{ scale: [1, 1.06, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-[2.5rem] border-2 border-amber-400/40 pointer-events-none"
              />
              <motion.div
                animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute inset-0 rounded-[2.5rem] border border-amber-300/20 pointer-events-none"
              />

              {/* Close button */}
              <button
                onClick={() => setShowCelebration(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all"
                title="Close"
              >✕</button>

              {/* Content */}
              <div className="text-5xl mb-4">🎉</div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-serif text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 mb-3"
              >
                Shalom, {currentUser?.name?.split(' ')[0]}!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-amber-100/70 text-base leading-relaxed mb-6"
              >
                {celebrationMode === 'approval' ? (
                  <>
                    🙌 You have been <span className="text-amber-300 font-bold">verified & approved</span> by our ministry admin!<br />
                    Welcome to the family of City of Truth Ministries.
                  </>
                ) : (
                  <>
                    ✨ Welcome back to City of Truth Ministries.<br />
                    Explore your dashboard and stay connected in truth.
                  </>
                )}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-white/40 text-sm italic mb-8"
              >
                {celebrationMode === 'approval'
                  ? '"You are no longer strangers and foreigners, but fellow citizens" — Eph 2:19'
                  : '"Then you will know the truth, and the truth will set you free." — John 8:32'}
              </motion.p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCelebration(false)}
                className="bg-gradient-to-r from-amber-400 to-amber-600 text-brand-950 font-black py-4 px-10 rounded-full uppercase tracking-wider text-sm shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:shadow-[0_0_50px_rgba(251,191,36,0.6)] transition-all"
              >
                Enter the Kingdom 👑
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App-style Splash Screen — shown once per session */}
      {showSplash && (
        <SplashScreen
          isFirstVisit={isFirstVisit}
          onComplete={() => {
            setShowSplash(false);
            try { localStorage.setItem('cot_has_visited', '1'); } catch {}
          }}
        />
      )}

      {/* Session Greeting Overlay */}
      {showGreetingCard && (
        <GreetingCard
          currentUser={currentUser}
          isAdmin={false}
          onClose={() => {
            setShowGreetingCard(false);
            sessionStorage.setItem('cot_session_greeted', '1');
          }}
          onStartTour={() => {
            liveWebsiteTour.start();
          }}
        />
      )}


      {/* Global Question Mark Widget (Help Tour) */}
      {currentView !== ViewState.HOME && (
        <button
          onClick={() => liveWebsiteTour.start()}
          className="fixed bottom-24 left-6 z-30 w-12 h-12 bg-white rounded-full shadow-lg border border-slate-200 hidden md:flex items-center justify-center text-brand-600 hover:bg-brand-50 hover:scale-110 transition-all hover:shadow-brand-500/30 group"
          aria-label="Start Page Tour"
          title="How to use this page"
        >
          <HelpCircle size={24} className="group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Live Website Guided Tour */}
      <GuidedTour
        steps={liveWebsiteTourSteps}
        isActive={liveWebsiteTour.isActive}
        onComplete={liveWebsiteTour.stop}
        onSkip={liveWebsiteTour.stop}
        tourName="live_website"
        accentColor="#2563eb"
      />

      {/* Dynamic Guided Tour (from AI) */}
      <GuidedTour
        steps={activeDynamicTourName ? dynamicTours[activeDynamicTourName] : []}
        isActive={!!activeDynamicTourName}
        onComplete={() => setActiveDynamicTourName(null)}
        onSkip={() => setActiveDynamicTourName(null)}
        tourName={`dynamic_${activeDynamicTourName}`}
        accentColor="#10b981" // Emerald green for AI guidance
      />

      {/* Share Page Button - Floating */}
      {!isFrame && currentView !== ViewState.AUTH && currentView !== ViewState.ADMIN_DASHBOARD && currentView !== ViewState.VERIFY_ID && (
        <SharePageButton
          pageUrl={getShareableURL(currentView)}
          pageTitle={`City of Truth Ministries - ${currentView.replace(/_/g, ' ')}`}
          pageDescription="Discover the truth through our ministry, Hebrew resources, and community"
          variant="floating"
        />
      )}
      {/* Divine Assistant - Always Visible */}
      {!isFrame && (
        <DivineAssistant />
      )}
        </>
      )}
    </div >
    </WebsiteBuilderContext.Provider>
  );
}

export default App;
