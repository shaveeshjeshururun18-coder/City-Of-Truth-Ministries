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
import { ViewState, User, UserRole, UserStatus } from './types';
import { Navbar } from './components/Navbar';
import { Button } from './components/Button';
import { AuthModal } from './components/AuthModal';
// Removed SpiritualAssistant import
import { WorshipperIDCard, EntrustCard3D } from './components/WorshipperIDCard';
import { GoldenMenorah } from './components/GoldenMenorah';
import { GoldenMenorahPage } from './components/GoldenMenorahPage';
import { AIPage } from './components/AIPage';
// import { GlobalAIWidget } from './components/GlobalAIWidget';
import { MinistryHighlights, HebrewSanctuaryIntro, ValparaiPresence, TestimonialHighlights, EntrustCardPreview } from './components/HomeSections';
import { HebrewAlphabetPage } from './components/HebrewAlphabetPage';
import { MinistriesPage } from './components/MinistriesPage';
import { BaruchHashemPage } from './components/BaruchHashemPage';
import { UserDashboard } from './components/UserDashboard';
import { ValparaiPage } from './components/ValparaiPage';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { AdminDashboard } from './components/AdminDashboard';
import { HebrewResources } from './components/HebrewResources';

import AIChatAssistant from './components/AIChatAssistant';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BottomNav } from './components/BottomNav';

import { api } from './services/api';

const youtubeLink = "https://youtube.com/@cotministries?si=A6179oNRuuJ9snjM";

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

const TestimonialSection: React.FC<TestimonialSectionProps> = ({ currentUser }) => {
  const [formData, setFormData] = useState({ name: currentUser?.displayName || '', location: currentUser?.location || '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please login to share your testimony.");
      return;
    }
    if (currentUser.status !== 'Active') {
      alert("Only verified members can share testimonies. Please wait for your account approval.");
      return;
    }
    if (!formData.name || !formData.text) {
      alert("Please fill in your name and testimony.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createTestimonial({
        ...formData,
        userId: currentUser.id,
        userPhoto: currentUser.photo,
        role: 'Member', // Or use currentUser.role
        rating: 5,
        date: new Date().toISOString(),
        approved: false
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
              { name: "Priya", role: "Visitor", text: "A beautiful place to worship amidst the hills. The presence of God is tangible here from the first prayer.", rating: 5 },
              { name: "Prasad.R", role: "Volunteer", text: "Wonderful service and amazing youth programs. Blessed to be part of this family and grow in His truth.", rating: 5 }
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
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialView, setAuthInitialView] = useState<'choice' | 'login' | 'register'>('choice');
  const [users, setUsers] = useState<User[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Load currentUser from localStorage on mount
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('cot_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  // Load users from backend on mount
  useEffect(() => {
    api.getUsers().then(setUsers);
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

  const getThemeClass = () => {
    switch (currentView) {
      case ViewState.HOME: return "bg-brand-950 text-white";
      case ViewState.ABOUT: return "bg-[#fdfcf0] text-brand-950";
      case ViewState.ABOUT_VALPARAI: return "bg-slate-50 text-brand-950";
      case ViewState.MINISTRIES: return "bg-[#f0f9ff] text-sky-950";
      case ViewState.HEBREW: return "bg-black text-amber-500";
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

    const searchId = identifier.trim().toLowerCase();

    // Multi-identifier login: Phone, Email, ID, or Name
    const user = users.find(u => {
      const uPhone = (u.phone || '').trim();
      const uEmail = (u.email || '').trim().toLowerCase();
      const uId = (u.id || '').trim().toLowerCase();
      const uName = (u.name || '').trim().toLowerCase();
      const uEmergency = (u.emergency || '').trim();

      return (
        uPhone === identifier ||
        uEmergency === identifier ||
        uId === searchId ||
        uEmail === searchId ||
        uName === searchId
      );
    });

    if (user) {
      setCurrentUser(user);
      setIsAuthOpen(false);
      setCurrentView(ViewState.USER_DASHBOARD);
    } else {
      alert("Account not found. Please check your Member ID, Email, Phone, or Name.");
    }
  };

  const handleRegister = async (data: any) => {
    // Check if user already exists
    const existingUser = users.find(u =>
      u.phone === data.emergency ||
      u.email === data.email ||
      u.id === data.uniqueId
    );

    if (existingUser) {
      alert("User already exists with this phone, email, or ID! Please Login.");
      setIsAuthOpen(true);
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
      setIsAuthOpen(false);

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
      setCurrentView(ViewState.USER_DASHBOARD);
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
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
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
        onUpdateUser={async (user) => {
          await api.updateUser(user);
          setUsers(users.map(u => u.id === user.id ? user : u));
        }}
        onDeleteUser={handleDeleteUser}
        onBack={handleBackFromAdmin}
      />
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-1000 ease-in-out font-sans ${getThemeClass()}`}>
      <Navbar
        currentView={currentView}
        setView={setCurrentView}
        onLoginClick={() => setIsAuthOpen(true)}
        onLogoutClick={handleLogout}
        currentUser={currentUser}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onFindID={handleFindID}
        onNavigateToRegister={() => {
          setIsAuthOpen(false);
          setCurrentView(ViewState.ID_CARD);
        }}
        onAdminClick={() => {
          setIsAuthOpen(false);
          navigate('/admin');
        }}
        initialView={authInitialView}
      />

      <main className="relative">
        <AnimatePresence mode="wait">
          {currentView === ViewState.HOME && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            >
              <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden py-20">
                <div className="absolute inset-0 z-0">
                  <img
                    src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2673&auto=format&fit=crop"
                    alt="Worship Background"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-brand-900/95 via-brand-900/60 to-brand-900/95 mix-blend-multiply" />
                  <div className="absolute inset-0 bg-black/40" />
                </div>

                <div className="relative z-10 text-center px-4 md:px-6 max-w-7xl mx-auto w-full pt-10 md:pt-16">
                  <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                    <div className="inline-block mb-6 px-6 py-2.5 rounded-full border border-red-500/50 bg-red-900/40 backdrop-blur-xl shadow-lg animate-pulse">
                      <span className="text-red-300 font-bold tracking-[0.25em] uppercase text-[10px] md:text-xs">⚠️ Registration Open ⚠️</span>
                    </div>

                    <div className="flex flex-col items-center justify-center mb-10 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-accent-500/20 blur-[100px] rounded-full -z-10"></div>
                      <h2 className="text-lg md:text-3xl text-brand-100 font-serif italic tracking-wide mb-3 drop-shadow-md">City of Truth Ministries</h2>
                      <h1 className="font-bold tracking-tight leading-none py-2 md:py-4">
                        <span className="block text-5xl sm:text-8xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-brand-50 via-brand-100 to-brand-200 drop-shadow-2xl pb-2 md:pb-4">சத்திய நகரம்</span>
                        <span className="block text-2xl sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-br from-white via-accent-100 to-brand-300 mt-1 md:mt-2 tracking-tighter">ஊழியங்கள்</span>
                      </h1>
                    </div>

                    <p className="text-base md:text-xl text-brand-50/80 max-w-2xl mx-auto mb-12 leading-relaxed font-light font-serif italic px-6">"Then you will know the truth, and the truth will set you free." <br />— John 8:32</p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full px-6 sm:px-0">
                      <Button
                        onClick={() => setCurrentView(ViewState.ID_CARD)}
                        className="w-full sm:w-auto px-12 py-5 text-sm uppercase tracking-[0.2em] font-black text-white bg-gradient-to-r from-brand-600 via-accent-500 to-brand-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 border-none shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_50px_rgba(79,70,229,0.5)] hover:scale-105 active:scale-95 rounded-full ring-2 ring-white/20"
                      >
                        Register Now
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </section>

              <section className="py-24 bg-gray-50 overflow-hidden relative">
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

              <GoldenMenorah onPreviewClick={() => setCurrentView(ViewState.GOLDEN_MENORAH)} />

              <MinistryHighlights setView={setCurrentView} />
              <HebrewSanctuaryIntro setView={setCurrentView} />
              <ValparaiPresence setView={setCurrentView} />
              <TestimonialHighlights setView={setCurrentView} />
              <EntrustCardPreview setView={setCurrentView} />
            </motion.div>
          )}

          {currentView === ViewState.ABOUT && (
            <div key="hebrew-hub">
              <HebrewResources />
            </div>
          )}

          {currentView === ViewState.HEBREW_CALENDAR && (
            <div key="hebrew-calendar">
              <HebrewResources initialTab="calendar" />
            </div>
          )}

          {currentView === ViewState.HEBREW_NUMBERS && (
            <div key="hebrew-numbers">
              <HebrewResources initialTab="numbers" />
            </div>
          )}

          {currentView === ViewState.HEBREW_FESTIVALS && (
            <div key="hebrew-festivals">
              <HebrewResources initialTab="festivals" />
            </div>
          )}

          {currentView === ViewState.HEBREW_REFERENCE && (
            <div key="hebrew-reference">
              <HebrewResources initialTab="reference" />
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
              <WorshipperIDCard onRegister={handleRegister} onLogin={() => { setAuthInitialView('login'); setIsAuthOpen(true); }} />
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

          {currentView === ViewState.USER_DASHBOARD && currentUser && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <UserDashboard
                user={currentUser}
                onEdit={() => { }}
                onLogout={handleLogout}
                onUpdate={async (updatedUser) => {
                  await api.updateUser(updatedUser);
                  setCurrentUser(updatedUser);
                  setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
                  alert("Profile Updated Successfully!");
                }}
              />
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
                          <strong className="block text-base">Send an Email</strong>
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
                    <form className="space-y-8 relative z-10 text-left" onSubmit={e => e.preventDefault()}>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Your Name</label>
                        <div className="relative">
                          <UserIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="text" placeholder="John Doe" className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white focus:bg-white focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-sm font-bold text-brand-950" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="email" placeholder="john@example.com" className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white focus:bg-white focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-sm font-bold text-brand-950" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Subject</label>
                        <div className="relative">
                          <Briefcase size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <select className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white focus:bg-white focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-sm font-bold text-brand-950 appearance-none">
                            <option>Prayer Request</option>
                            <option>General Inquiry</option>
                            <option>Event Info</option>
                          </select>
                          <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Message</label>
                        <textarea placeholder="How can we help you today?" className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white focus:bg-white focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-sm font-bold text-brand-950 h-32 resize-none"></textarea>
                      </div>

                      <Button variant="primary" fullWidth className="py-6 text-sm font-black uppercase tracking-[0.2em] rounded-2xl bg-brand-950 shadow-2xl shadow-brand-950/30">
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
                <input type="email" placeholder="Your Email" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:bg-white/10 transition-colors w-full" />
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

      {/* AI Chat Assistant - Only show on non-AI pages to prevent duplication */}
      {
        currentView !== ViewState.AI && (
          <ErrorBoundary>
            <AIChatAssistant />
          </ErrorBoundary>
        )
      }
    </div >
  );
}

export default App;