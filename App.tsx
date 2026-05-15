import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';
// import { collection, addDoc } from 'firebase/firestore'; // Removed Firebase mail collection usage
import { db } from './services/firebase';
import {
  Church,
  MapPin,
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
  User as UserIcon,
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
} from 'lucide-react';
import { ViewState, User, UserRole, UserStatus, NavItem, DeletedUser } from './types';
import { Navbar } from './components/Navbar';
import { Button } from './components/Button';
import { AuthPage } from './components/AuthPage';
// Removed SpiritualAssistant import
import { WorshipperIDCard, EntrustCard3D } from './components/WorshipperIDCard';
import { GoldenMenorah } from './components/GoldenMenorah';
import { GoldenMenorahPage } from './components/GoldenMenorahPage';
import { AIPage } from './components/AIPage';
// import { GlobalAIWidget } from './components/GlobalAIWidget';
import { MinistryHighlights, HebrewSanctuaryIntro, HebrewPagesPreviewSection, PastorBaruchPreviewSection, ValparaiPresence, EntrustCardPreview, LeaderMessageSection, DonationsHighlight, CommunityMembersSection } from './components/HomeSections';
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

import AIChatAssistant from './components/AIChatAssistant';
import VerifyIDPage from './components/VerifyIDPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BottomNav } from './components/BottomNav';

import { api } from './services/api';

const youtubeLink = "https://youtube.com/@cotministries?si=A6179oNRuuJ9snjM";
const MAX_STORED_CONTACT_MESSAGES = 200;

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
  subject: string;
  message: string;
  createdAt: string;
  source: 'hero-widget' | 'contact-form';
  senderType: 'Registered' | 'Non-Registered';
  senderId?: string;
}

const HEBREW_RESOURCE_SUBMENU: NavItem[] = [
  { label: 'Festivals & Holy Days', view: ViewState.HEBREW_FESTIVALS },
  { label: 'Biblical Calendar', view: ViewState.HEBREW_CALENDAR },
  { label: 'Month/Year Reference', view: ViewState.HEBREW_REFERENCE },
  { label: 'Hebrew Grammar', view: ViewState.HEBREW_GRAMMAR },
];

const HEBREW_TOOLS_SUBMENU: NavItem[] = [
  { label: 'Hebrew Words', view: ViewState.HEBREW_WORDS },
  { label: 'Letters Audio Lab', view: ViewState.HEBREW_LETTERS_AUDIO },
  { label: 'Hebrew Numbers', view: ViewState.HEBREW_NUMBERS },
  { label: 'Gematria Value', view: ViewState.HEBREW_GEMATRIA },
];

const withHebrewResourceSubmenu = (items: NavItem[]): NavItem[] =>
  items.map(item =>
    item.label === 'HEBREW CONTENT' || item.label === 'HEBREW'
      ? { ...item, submenu: HEBREW_RESOURCE_SUBMENU }
      : item.label === 'HEBREW TOOLS'
        ? { ...item, submenu: HEBREW_TOOLS_SUBMENU }
      : item
  );

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

  return (
    <section className="py-24 relative z-10 overflow-hidden bg-slate-50">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-950 mb-4">Voices of Faith</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg font-normal mb-8">Hear how City of Truth Ministries is impacting lives in Valparai and beyond.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Integrated Form Side - Light Theme */}
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
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-brand-500 transition-colors text-brand-950 placeholder:text-slate-400"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-brand-500 transition-colors text-brand-950 placeholder:text-slate-400"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
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
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [authInitialView, setAuthInitialView] = useState<'choice' | 'login' | 'register' | 'forgot-id'>('choice');
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
  const [tourStepIndex, setTourStepIndex] = useState<number | null>(null);
  const [tourRect, setTourRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [heroEmail, setHeroEmail] = useState('');
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

  const [navigationItems, setNavigationItems] = useState<NavItem[]>(withHebrewResourceSubmenu([
    { label: 'HOME', view: ViewState.HOME },
    {
      label: 'HEBREW CONTENT',
      view: ViewState.ABOUT,
      submenu: HEBREW_RESOURCE_SUBMENU
    },
    {
      label: 'HEBREW TOOLS',
      view: ViewState.HEBREW_TOOLS,
      submenu: HEBREW_TOOLS_SUBMENU
    },
    { label: 'ALPHABETS', view: ViewState.HEBREW },
    { label: 'VALPARAI', view: ViewState.ABOUT_VALPARAI },
    { label: 'PASTOR', view: ViewState.PASTOR },
    { label: 'MINISTRIES', view: ViewState.MINISTRIES },
    { label: 'MENORAH', view: ViewState.GOLDEN_MENORAH },
    { label: 'BARUCH HASHEM', view: ViewState.BARUCH_HASHEM },
    { label: 'AI ASSISTANCE', view: ViewState.AI },
    { label: 'ENTRUST CARD', view: ViewState.ID_CARD },
    { label: 'CONTACT', view: ViewState.CONTACT },
  ]));

  const [homeSectionsOrder, setHomeSectionsOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cot_home_sections_order');
      return saved ? JSON.parse(saved) : ['hero', 'about', 'menorah', 'highlights', 'leader', 'hebrew', 'hebrewPages', 'pastorBaruch', 'valparai', 'testimonials', 'members', 'preview', 'donations', 'verify'];
    } catch (e) {
      return ['hero', 'about', 'menorah', 'highlights', 'leader', 'hebrew', 'hebrewPages', 'pastorBaruch', 'valparai', 'testimonials', 'members', 'preview', 'donations', 'verify'];
    }
  });

  useEffect(() => {
    if (homeSectionsOrder.includes('members')) return;
    const insertAt = homeSectionsOrder.indexOf('testimonials');
    const nextOrder =
      insertAt >= 0
        ? [...homeSectionsOrder.slice(0, insertAt + 1), 'members', ...homeSectionsOrder.slice(insertAt + 1)]
        : [...homeSectionsOrder, 'members'];
    setHomeSectionsOrder(nextOrder);
    localStorage.setItem('cot_home_sections_order', JSON.stringify(nextOrder));
  }, [homeSectionsOrder]);

  useEffect(() => {
    localStorage.setItem('cot_contact_messages', JSON.stringify(contactMessages));
  }, [contactMessages]);

  const TOUR_STEPS = [
    { selector: '#tour-register-btn', title: 'Start Here', text: 'Tap Register Now to create your member profile.' },
    { selector: '#tour-login-btn', title: 'Returning Member Login', text: 'Use Login if you already have an account.' },
    { selector: '#tour-verify-login-card', title: 'Verification Hub', text: 'Use this section to login and verify membership access.' },
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
    setContactMessages(prev => prev.filter(msg => msg.id !== messageId));
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
          setHomeSectionsOrder(remoteLayout);
          localStorage.setItem('cot_home_sections_order', JSON.stringify(remoteLayout));
        }
      } catch (error) {
        console.error('Failed to fetch remote home layout:', error);
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
          setNavigationItems(withHebrewResourceSubmenu(remoteNav));
        }
      } catch (error) {
        console.error('Failed to fetch remote navigation layout:', error);
      }
    };
    fetchNavLayout();
  }, []);


  // Load currentUser from localStorage on mount
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('cot_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

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

  // Load users from backend on mount
  useEffect(() => {
    const loadUsers = async () => {
      const [activeUsers, removedUsers] = await Promise.all([
        api.getUsers(),
        api.getDeletedUsers()
      ]);
      setUsers(activeUsers);
      setDeletedUsers(removedUsers);
    };
    loadUsers();
  }, []);

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

  // Check if on admin route
  const isAdminRoute = location.pathname === '/admin';
  // Check if on verify route
  const verifyMatch = location.pathname.match(/^\/verify\/(.+)$/);
  const isVerifyRoute = !!verifyMatch;
  const verifyUserId = verifyMatch ? verifyMatch[1] : null;
  const isAuthRoute = location.pathname === '/auth';
  const isVerifyScannerRoute = location.pathname === '/verify-id';

  const getThemeClass = () => {
    switch (currentView) {
      case ViewState.HOME: return "bg-brand-950 text-white";
      case ViewState.ABOUT: return "bg-[#fdfcf0] text-brand-950";
      case ViewState.ABOUT_VALPARAI: return "bg-slate-50 text-brand-950";
      case ViewState.MINISTRIES: return "bg-[#f0f9ff] text-sky-950";
      case ViewState.HEBREW: return "bg-black text-amber-500";
      case ViewState.HEBREW_TOOLS: return "bg-[#fdfcf0] text-brand-950";
      case ViewState.HEBREW_WORDS: return "bg-[#fdfcf0] text-brand-950";
      case ViewState.HEBREW_LETTERS_AUDIO: return "bg-[#fdfcf0] text-brand-950";
      case ViewState.HEBREW_GEMATRIA: return "bg-[#fdfcf0] text-brand-950";
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

  const handleLogin = (identifier: string) => {
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

    const searchText = normalizeText(identifier);
    const searchPhone = normalizePhone(identifier);
    const searchMemberId = normalizeMemberId(identifier);

    // Multi-identifier login: Phone, Email, ID, or Name
    const matches = users.map(u => {
      const uPhone = normalizePhone(u.phone || '');
      const uEmergency = normalizePhone(u.emergency || '');
      const uEmail = normalizeText(u.email || '');
      const uId = normalizeMemberId(u.id || '');
      const uName = normalizeText(u.name || '');
      const linked = (u.linkedProfiles || []).find(sp => {
        const spId = normalizeMemberId(sp.id || '');
        const spName = normalizeText(sp.name || '');
        return spId === searchMemberId || spName === searchText;
      });

      if (linked) {
        return { user: u, profileId: linked.id };
      }

      const isMatch = (
        (searchPhone && (uPhone === searchPhone || uEmergency === searchPhone)) ||
        uId === searchMemberId ||
        uEmail === searchText ||
        uName === searchText
      );
      return isMatch ? { user: u, profileId: u.id } : null;
    }).filter(Boolean) as Array<{ user: User; profileId: string }>;

    const match = matches[0];
    const user = match?.user;

    if (user) {
      try {
        localStorage.removeItem(`cot_dashboard_tour_seen_${user.id}`);
      } catch (error) {
        console.error('Failed to reset dashboard tour state', error);
      }
      setCurrentUser(user);
      setSelectedDashboardProfileId(match?.profileId || user.id);
      setCelebrationMode('welcome');
      setShowCelebration(true);
      setCurrentView(ViewState.HOME);
      navigate('/');
    } else {
      alert("Account not found. Please check your Member ID, Email, Phone, or Name.");
    }
  };

  const handleRegister = async (data: any) => {
    const extractPhoneDigits = (value: string | undefined) => (value || '').replace(/\D/g, '');
    const incomingPhoneDigits = extractPhoneDigits(data.phone || data.emergency);
    const incomingEmail = (data.email || '').trim().toLowerCase();

    const existingByContact = users.find(u => {
      const userPhoneDigits = extractPhoneDigits(u.phone || u.emergency);
      const userEmail = (u.email || '').trim().toLowerCase();
      const phoneMatch = !!incomingPhoneDigits && userPhoneDigits === incomingPhoneDigits;
      const emailMatch = !!incomingEmail && userEmail === incomingEmail;
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
      memberSince: new Date().getFullYear().toString(),
      joinedDate: new Date().toISOString().split('T')[0],
      photo: data.photo || ''
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
          message: `A new member has joined the ministry!\n\n👤 Name: ${savedUser.name}\n🆔 Member ID: ${savedUser.id}\n📞 Phone: ${savedUser.phone}\n📍 Location: ${savedUser.location}\n\nTo verify and approve this member, please visit the Admin Dashboard: https://city-of-truth-ministries.vercel.app/admin`,
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
            message: `Dear ${savedUser.name},\n\nWe are so blessed to have you join our ministry family! Your account has been received and is currently in verification.\n\n🆔 Your Member ID: ${savedUser.id}\n\nYou can now log in to your dashboard using your phone number to check your status.\n\nBlessings,\nCity of Truth Team`,
            from_name: 'City of Truth Ministries'
          },
          EMAILJS_PUBLIC_KEY
        ).then(() => console.log('Welcome email sent'))
          .catch(err => console.error('Failed to send welcome email', err));
      }

      alert("Registration Successful! Your ID is " + savedUser.id + ". Welcome to the family!");
      setCelebrationMode('welcome');
      setShowCelebration(true);
      setCurrentView(ViewState.HOME);
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

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setDeletedUsers(await api.getDeletedUsers());
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
        onDeleteContactMessage={handleDeleteContactMessage}
        onUpdateUser={async (user) => {
          await api.updateUser(user);
          setUsers(users.map(u => u.id === user.id ? user : u));
        }}
        onCreateUser={async (user) => {
          const created = await api.createUser(user);
          setUsers(prev => [...prev, created]);
        }}
        onDeleteUser={handleDeleteUser}
        onRestoreUser={handleRestoreDeletedUser}
        onBack={handleBackFromAdmin}
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
          const updatedNav = withHebrewResourceSubmenu(newItems);
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
    return <QRVerifyPage userId={verifyUserId} onBack={() => navigate('/')} />;
  }

  if (isAuthRoute) {
    const params = new URLSearchParams(location.search);
    const routeInitial = params.get('view');
    const routeIdentifier = params.get('identifier') || '';
    const initialView = routeInitial === 'login' || routeInitial === 'register' || routeInitial === 'forgot-id' || routeInitial === 'choice'
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
        initialView={initialView}
        initialIdentifier={routeIdentifier}
      />
    );
  }

  if (isVerifyScannerRoute) {
    return <VerifyIDPage />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-1000 ease-in-out font-sans ${getThemeClass()}`}>
      <Navbar
        currentView={currentView}
        setView={setCurrentView}
        onLoginClick={() => navigate('/auth?view=login')}
        onLogoutClick={handleLogout}
        currentUser={currentUser}
        navItems={navigationItems}
      />

      <main className="relative">
        <AnimatePresence mode="wait">
          {currentView === ViewState.AUTH && (
            <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AuthPage
                onLogin={handleLogin}
                onNavigateToRegister={() => setCurrentView(ViewState.ID_CARD)}
                onAdminClick={() => navigate('/admin')}
                onBack={() => setCurrentView(ViewState.HOME)}
                users={users}
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
              {homeSectionsOrder.map((sectionId) => {
                switch (sectionId) {
                  case 'hero':
                    return (
                      <section key="hero" className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden py-20">
                {/* Background with slow zoom animation */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <motion.img
                    src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2673&auto=format&fit=crop"
                    alt="Worship Background"
                    className="w-full h-full object-cover"
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.08 }}
                    transition={{ duration: 18, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,8,20,0.72) 0%, rgba(20,14,5,0.55) 50%, rgba(10,8,20,0.92) 100%)' }} />
                  <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 45% at 50% 42%, rgba(212,160,0,0.18) 0%, transparent 70%)' }} />
                </div>

                <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl mx-auto w-full pt-10 md:pt-16">
                  {/* Registration badge — minimal pill */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full border border-yellow-400/40 bg-yellow-500/10 backdrop-blur-xl"
                    style={{ boxShadow: '0 0 24px rgba(251,191,36,0.28)' }}
                  >
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" style={{ boxShadow: '0 0 8px rgba(251,191,36,0.9)' }} />
                    <span className="text-yellow-200 font-semibold tracking-widest uppercase text-[11px]">✦ Registration Open ✦</span>
                  </motion.div>

                  {/* Main title */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.15 }}
                    className="mb-4"
                  >
                    <h1 className="font-black tracking-tight leading-none" style={{ textShadow: '0 4px 32px rgba(212,160,0,0.55), 0 2px 8px rgba(0,0,0,0.6)' }}>
                      <span className="gold-shimmer-title block text-5xl sm:text-8xl md:text-9xl text-transparent bg-clip-text pb-2 md:pb-4">சத்திய நகரம்</span>
                    </h1>
                  </motion.div>

                  {/* Subtitle */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mb-2"
                  >
                    <h2 className="text-xl md:text-2xl font-semibold tracking-[0.2em] uppercase" style={{ color: "rgba(253,230,138,0.85)", letterSpacing: "0.2em" }}>City of Truth Ministries</h2>
                  </motion.div>

                  {/* Support text */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="mb-10"
                  >
                    <span className="text-lg md:text-xl font-medium tracking-[0.25em]" style={{ color: "rgba(251,191,36,0.65)" }}>ஊழியங்கள்</span>
                  </motion.div>

                  {/* Quote */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.55 }}
                    className="text-sm md:text-base max-w-md mx-auto mb-12 leading-relaxed font-light italic px-4" style={{ color: "rgba(253,230,138,0.5)" }}
                  >
                    "Then you will know the truth, and the truth will set you free."<br />
                    <span className="not-italic tracking-wider text-xs" style={{ color: "rgba(251,191,36,0.4)" }}>— John 8:32</span>
                  </motion.p>

                  {/* Buttons */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="flex items-center justify-center gap-3 w-full max-w-xs sm:max-w-none mx-auto px-2 sm:px-0"
                  >
                    <Button
                      id="tour-register-btn"
                      onClick={() => setCurrentView(ViewState.ID_CARD)}
                      className="flex-1 sm:flex-none sm:w-auto px-6 py-3 sm:px-12 sm:py-5 text-[11px] sm:text-sm uppercase tracking-[0.15em] font-black border-none hover:scale-105 active:scale-95 whitespace-nowrap"
                      style={{ background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 40%, #fde68a 65%, #d97706 100%)", color: "#3b1f00", borderRadius: "9999px", boxShadow: "0 0 0 2px rgba(251,191,36,0.4), 0 8px 28px rgba(212,160,0,0.55)", letterSpacing: "0.18em" }}
                    >
                      Register Now
                    </Button>
                    <Button
                      id="tour-login-btn"
                      onClick={() => navigate('/auth?view=login')}
                      className="flex-1 sm:flex-none sm:w-auto px-6 py-3 sm:px-10 sm:py-5 text-[11px] sm:text-sm uppercase tracking-[0.15em] font-black hover:scale-105 active:scale-95 rounded-full transition-all duration-300 whitespace-nowrap"
                      style={{ background: "rgba(251,191,36,0.08)", backdropFilter: "blur(10px)", border: "1px solid rgba(251,191,36,0.3)", color: "rgba(253,230,138,0.9)" }}
                    >
                      Login
                    </Button>
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
                </div>
              </section>
            );
                  case 'about':
                    return (
                      <section key="about" className="py-24 bg-gray-50 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[40%] h-full bg-white -skew-x-12 translate-x-32 z-0 hidden lg:block"></div>
                <div className="container mx-auto px-6 relative z-10">
                  <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="relative mx-auto lg:mx-0 max-w-lg lg:max-w-none"
                    >
                      <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl border-[6px] border-white">
                        <img
                          src="https://images.unsplash.com/photo-1510590337019-5ef2d39aa786?q=80&w=2670&auto=format&fit=crop"
                          alt="Community gathering"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-16 -right-16 w-3/4 rounded-2xl overflow-hidden shadow-2xl border-[6px] border-white z-20 hidden md:block">
                        <img
                          src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2670&auto=format&fit=crop"
                          alt="Worship Moment"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="text-left"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-12 h-1 bg-accent-500 rounded-full"></span>
                        <span className="text-brand-600 font-bold uppercase tracking-wider text-sm">Who We Are</span>
                      </div>
                      <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 mb-6 leading-[1.1]">
                        Walking in <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">Truth</span> & <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-500 to-accent-400">Love</span>
                      </h2>
                      <p className="text-gray-600 text-lg leading-relaxed mb-8">
                        City of Truth Ministries is more than just a building—it's a family. We are dedicated to creating a space where lives are transformed by the power of the Gospel.
                      </p>
                      <Button onClick={() => setCurrentView(ViewState.ABOUT)} variant="primary" className="shadow-brand-500/30 px-8 py-4 text-base">Read Our Story</Button>
                    </motion.div>
                  </div>
                </div>
              </section>
            );
          case 'menorah': return <GoldenMenorah key="menorah" onPreviewClick={() => setCurrentView(ViewState.GOLDEN_MENORAH)} />;
          case 'highlights': return <MinistryHighlights key="highlights" setView={setCurrentView} />;
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
                        { id: 'tour-verify-upload-card', icon: UploadCloud, label: 'Upload Entrust PDF', desc: 'Upload your Entrust Card PDF to verify your membership document.', color: 'from-accent-500 to-accent-700', light: 'bg-accent-50 text-accent-600', action: () => navigate('/verify-id'), cta: 'Upload File' },
                      { id: 'tour-verify-card-view', icon: CreditCard, label: 'View Entrust Card', desc: 'Register or view your official digital ID card and QR code.', color: 'from-emerald-500 to-emerald-700', light: 'bg-emerald-50 text-emerald-600', action: () => setCurrentView(ViewState.ID_CARD), cta: 'View Card' },
                      { id: 'tour-verify-scan-card', icon: CheckCircle, label: 'Scan QR Code', desc: 'Scan any member\'s QR code to instantly verify their identity.', color: 'from-amber-500 to-orange-600', light: 'bg-amber-50 text-amber-600', action: () => navigate('/verify-id'), cta: 'Open Scanner' },
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
                        <h3 className="font-black text-brand-950 text-lg mb-2 leading-tight">{item.label}</h3>
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
      })}
            </motion.div>
          )}

          {currentView === ViewState.ABOUT && (
            <div key="hebrew-hub">
              <HebrewResources mode="content" initialTab="calendar" currentUser={currentUser || undefined} />
            </div>
          )}

          {currentView === ViewState.HEBREW_TOOLS && (
            <div key="hebrew-tools">
              <HebrewResources mode="tools" initialTab="words" />
            </div>
          )}

          {currentView === ViewState.HEBREW_CALENDAR && (
            <div key="hebrew-calendar">
              <HebrewResources mode="content" initialTab="calendar" currentUser={currentUser || undefined} />
            </div>
          )}

          {currentView === ViewState.HEBREW_NUMBERS && (
            <div key="hebrew-numbers">
              <HebrewResources mode="tools" initialTab="numbers" />
            </div>
          )}

          {currentView === ViewState.HEBREW_WORDS && (
            <div key="hebrew-words">
              <HebrewResources mode="tools" initialTab="words" />
            </div>
          )}

          {currentView === ViewState.HEBREW_LETTERS_AUDIO && (
            <div key="hebrew-letters-audio">
              <HebrewResources mode="tools" initialTab="lettersaudio" />
            </div>
          )}

          {currentView === ViewState.HEBREW_GEMATRIA && (
            <div key="hebrew-gematria">
              <HebrewResources mode="tools" initialTab="gematria" />
            </div>
          )}

          {currentView === ViewState.HEBREW_FESTIVALS && (
            <div key="hebrew-festivals">
              <HebrewResources mode="content" initialTab="festivals" />
            </div>
          )}

          {currentView === ViewState.HEBREW_REFERENCE && (
            <div key="hebrew-reference">
              <HebrewResources mode="content" initialTab="reference" />
            </div>
          )}

          {currentView === ViewState.HEBREW_GRAMMAR && (
            <div key="hebrew-grammar">
              <HebrewResources mode="content" initialTab="grammar" />
            </div>
          )}

          {currentView === ViewState.HEBREW && (
            <div key="alphabet">
              <HebrewAlphabetPage />
            </div>
          )}

          {currentView === ViewState.ABOUT_VALPARAI && (
            <motion.div key="valparai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <ValparaiPage />
            </motion.div>
          )}

          {currentView === ViewState.GOLDEN_MENORAH && (
            <motion.div key="menorah-page" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <GoldenMenorahPage />
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
                onDeleteContactMessage={handleDeleteContactMessage}
                onUpdateUser={async (user) => {
                  await api.updateUser(user);
                  setUsers(users.map(u => u.id === user.id ? user : u));
                  if (currentUser.id === user.id) setCurrentUser(user);
                }}
                onDeleteUser={async (userId) => {
                  await handleDeleteUser(userId);
                }}
                onRestoreUser={handleRestoreDeletedUser}
                homeSectionsOrder={homeSectionsOrder}
                onUpdateHomeSectionsOrder={(newOrder) => {
                  setHomeSectionsOrder(newOrder);
                  localStorage.setItem('home_section_order', JSON.stringify(newOrder));
                }}
                navItems={navigationItems}
                onUpdateNavItems={async (newItems) => {
                  const updatedNav = withHebrewResourceSubmenu(newItems);
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

          {currentView === ViewState.USER_DASHBOARD && currentUser && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <UserDashboard
                user={currentUser}
                initialProfileId={selectedDashboardProfileId || undefined}
                onEdit={() => { }}
                onLogout={handleLogout}
                onGoToLogin={() => navigate('/auth?view=login')}
                onOpenScanner={() => setCurrentView(ViewState.VERIFY_ID)}
                onUpdate={async (updatedUser) => {
                  await api.updateUser(updatedUser);
                  setCurrentUser(updatedUser);
                  setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
                  if (updatedUser.pendingProfileUpdate) {
                    alert("✅ Edit request submitted. Changes will be reflected after admin approval.");
                  } else {
                    alert("Profile Updated Successfully!");
                  }
                }}
              />
            </motion.div>
          )}



          {currentView === ViewState.VERIFY_ID && (
            <motion.div key="verify-id" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <VerifyIDPage />
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
      </main>
      <footer className="bg-brand-950 text-white pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-black/80 to-transparent"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-4 mb-8">
                <img src="/logo.png" alt="COT Logo" className="w-16 h-16 object-contain" />
                <div>
                  <h3 className="text-2xl font-serif font-black text-white leading-none">City of Truth</h3>
                  <p className="text-[11px] text-accent-400 font-black uppercase tracking-[0.3em] mt-1">Ministries</p>
                </div>
              </div>
              <p className="text-brand-100/60 leading-relaxed text-sm mb-6">
                Valparai Sanctuary
                <br />Tamil Nadu, India
              </p>
              <div className="flex gap-3">
                {[
                  { Icon: Youtube, href: youtubeLink },
                  { Icon: Facebook, href: "https://facebook.com/cityoftruthministries" },
                  { Icon: Instagram, href: "https://instagram.com/cityoftruthministries" }
                ].map(({ Icon, href }, i) => (
                  <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-brand-950 transition-all border border-white/10">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div className="col-span-1">
              <h4 className="font-bold text-white mb-6">Ministries</h4>
              <ul className="space-y-4 text-sm text-brand-100/60">
                {['Sunday Worship', 'Bible Study', 'Youth Fellowship', 'Outreach', 'Counseling'].map(item => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent-500/50"></div>{item}</a></li>
                ))}
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="font-bold text-white mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm text-brand-100/60">
                {['About Us', 'Sermons', 'Events', 'Give', 'Contact'].map(item => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent-500/50"></div>{item}</a></li>
                ))}
                <li><a href="/admin" className="hover:text-white transition-colors flex items-center gap-2 pr-2 border-r border-white/10"><div className="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>Admin Dashboard</a></li>
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="font-bold text-white mb-6">Stay Connected</h4>

              <p className="text-sm text-brand-100/60 mb-4">Join our mailing list for weekly inspiration.</p>
              <div className="flex gap-2 mb-2">
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:bg-white/10 transition-colors w-full" 
                  onFocus={() => setShowLeaderMessage(true)}
                  onChange={(e) => {
                    if (e.target.value.length > 0) setShowLeaderMessage(true);
                  }}
                />
                <button className="bg-accent-600 hover:bg-accent-500 text-white rounded-lg px-3 py-2 transition-colors">
                  <ArrowRight size={16} />
                </button>
              </div>
              <p className="text-[10px] text-brand-100/40">We respect your privacy.</p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-100/30">&copy; 2026 City of Truth Ministries • Valparai Sanctuary</p>

              <div className="inline-flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.08] px-5 py-2.5 rounded-full border border-white/5 transition-colors cursor-default group backdrop-blur-sm">
                <Sparkles size={14} className="text-amber-300/60 group-hover:text-amber-400 group-hover:rotate-12 transition-all" />
                <span className="text-[10px] text-brand-100/40 uppercase tracking-widest font-medium">Designed by</span>
                <span className="text-sm font-serif font-bold bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-200 bg-clip-text text-transparent tracking-wide group-hover:from-amber-100 group-hover:via-white group-hover:to-amber-100 transition-all">S.Shaveesh Jeshurun</span>
              </div>
            </div>

            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-100/30">
              <a href="#" className="hover:text-white transition-colors relative group">Privacy Policy<span className="absolute -bottom-2 left-0 w-0 h-px bg-accent-500 transition-all group-hover:w-full"></span></a>
              <a href="#" className="hover:text-white transition-colors relative group">Terms of Service<span className="absolute -bottom-2 left-0 w-0 h-px bg-accent-500 transition-all group-hover:w-full"></span></a>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation Bar (mobile) */}
      <BottomNav currentView={currentView} setView={setCurrentView} />

      {/* AI Chat Assistant - Only show on non-AI pages to prevent duplication */}
      {
        currentView !== ViewState.AI && (
          <ErrorBoundary>
            <AIChatAssistant />
          </ErrorBoundary>
        )
      }

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
              <div
                className="absolute rounded-2xl border-2 border-amber-300 shadow-[0_0_0_9999px_rgba(2,6,23,0.72)]"
                style={{
                  top: tourRect.top,
                  left: tourRect.left,
                  width: tourRect.width,
                  height: tourRect.height
                }}
              />
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
    </div >
  );
}

export default App;
