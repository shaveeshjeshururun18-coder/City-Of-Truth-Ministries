import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { SpiritualAssistant } from './components/SpiritualAssistant';
import { WorshipperIDCard, EntrustCard3D } from './components/WorshipperIDCard';
import { GoldenMenorah } from './components/GoldenMenorah';
import { AIPage } from './components/AIPage';
import { HebrewPage } from './components/HebrewPage';
import { BaruchHashemPage } from './components/BaruchHashemPage';
import { UserDashboard } from './components/UserDashboard';

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
const TestimonialSection = () => {
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
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Your Name" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-brand-500 transition-colors text-brand-950 placeholder:text-slate-400" />
                <input type="text" placeholder="Location" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-brand-500 transition-colors text-brand-950 placeholder:text-slate-400" />
              </div>
              <textarea placeholder="Tell us about your encounter with God's truth..." className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-brand-500 transition-colors text-brand-950 placeholder:text-slate-400 h-40"></textarea>
              <Button variant="primary" fullWidth className="py-4 shadow-xl shadow-brand-500/20">
                Send Testimony <Send size={18} />
              </Button>
            </form>
          </motion.div>

          {/* Testimonials List Side - Light Theme */}
          <div className="space-y-6">
            {[
              { name: "Sarah J.", role: "Member", text: "This ministry has completely transformed my spiritual life. The community in Valparai is so welcoming and the teachings are profound.", rating: 5 },
              { name: "David K.", role: "Visitor", text: "A beautiful place to worship amidst the hills. The presence of God is tangible here from the first prayer.", rating: 5 },
              { name: "Priya M.", role: "Volunteer", text: "Wonderful service and amazing youth programs. Blessed to be part of this family and grow in His truth.", rating: 5 }
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
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load users from backend on mount
    api.getUsers().then(setUsers);
  }, []);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const getThemeClass = () => {
    switch (currentView) {
      case ViewState.HOME: return "bg-brand-950 text-white";
      case ViewState.ABOUT: return "bg-[#fdfcf0] text-brand-950";
      case ViewState.ABOUT_VALPARAI: return "bg-slate-50 text-brand-950";
      case ViewState.MINISTRIES: return "bg-[#f0f9ff] text-sky-950";
      case ViewState.HEBREW: return "bg-black text-amber-500";
      case ViewState.ID_CARD: return "bg-[#f8fafc] text-slate-950";
      case ViewState.CONTACT: return "bg-[#f5f3ff] text-indigo-950";
      case ViewState.MENORAH: return "bg-brand-950 text-white";
      case ViewState.AI: return "bg-slate-950 text-white";
      case ViewState.BARUCH_HASHEM: return "bg-slate-50 text-brand-950";
      case ViewState.USER_DASHBOARD: return "bg-slate-50 text-slate-900";
      case ViewState.ADMIN_DASHBOARD: return "bg-slate-50 text-slate-900";
      default: return "bg-white text-brand-950";
    }
  };

  const handleLogin = (identifier: string, pass: string) => {
    const user = users.find(u => (u.id === identifier || u.phone === identifier) && u.password === pass);
    if (user) {
      setCurrentUser(user);
      setIsAuthOpen(false);
      setCurrentView(ViewState.USER_DASHBOARD);
    } else {
      alert("Invalid Credentials.");
    }
  };

  const handleRegister = async (data: any) => {
    const newUser: User = {
      id: data.uniqueId,
      name: data.name,
      email: data.email,
      phone: data.emergency,
      password: 'password',
      role: 'Member',
      status: 'Pending Verification',
      dob: data.dob,
      location: data.location,
      bloodGroup: data.bloodGroup,
      emergency: data.emergency,
      memberSince: new Date().getFullYear().toString(),
      gender: data.gender,
      joinedDate: new Date().toISOString().split('T')[0],
      photo: data.photo
    };

    try {
      const savedUser = await api.createUser(newUser);
      setUsers([...users, savedUser]);
      setCurrentUser(savedUser);
      setIsAuthOpen(false);
      alert("Registration Successful! Your ID is " + savedUser.id + ". Please wait for verification.");
      setCurrentView(ViewState.USER_DASHBOARD);
    } catch (e) {
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

  const handleFindID = (phone: string) => {
    const user = users.find(u => u.phone === phone || u.emergency === phone);
    if (user) {
      alert(`Account Found! Your Member ID is: ${user.id}\nPlease use this to login.`);
    } else {
      alert("No account found with this phone number. Please register.");
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 ease-in-out font-sans ${getThemeClass()}`}>
      <Navbar
        currentView={currentView}
        setView={setCurrentView}
        onLoginClick={() => setIsAuthOpen(true)}
        currentUser={currentUser}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onFindID={handleFindID}
      />

      <main className="relative">
        <AnimatePresence mode="wait">
          {currentView === ViewState.HOME && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                    <div className="inline-block mb-6 px-6 py-2.5 rounded-full border border-accent-400/30 bg-black/40 backdrop-blur-xl shadow-lg">
                      <span className="text-accent-300 font-bold tracking-[0.25em] uppercase text-[10px] md:text-xs">Divine Grace Sanctuary</span>
                    </div>

                    <div className="flex flex-col items-center justify-center mb-10 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-accent-500/20 blur-[100px] rounded-full -z-10"></div>
                      <h2 className="text-lg md:text-3xl text-brand-100 font-serif italic tracking-wide mb-3 drop-shadow-md">City of Truth Ministries</h2>
                      <h1 className="font-bold tracking-tight leading-none py-4">
                        <span className="block text-5xl sm:text-8xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-brand-50 via-brand-100 to-brand-200 drop-shadow-2xl pb-4">சத்திய நகரம்</span>
                        <span className="block text-2xl sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-br from-white via-accent-100 to-brand-300 mt-2 tracking-tighter">ஊழியங்கள்</span>
                      </h1>
                    </div>

                    <p className="text-base md:text-xl text-brand-50/80 max-w-2xl mx-auto mb-12 leading-relaxed font-light font-serif italic px-6">"Then you will know the truth, and the truth will set you free." <br />— John 8:32</p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full px-6 sm:px-0">
                      <Button variant="accent" onClick={() => setCurrentView(ViewState.MINISTRIES)} className="w-full sm:w-auto px-12 py-5 text-sm uppercase tracking-[0.2em] font-black">
                        Explore Ministries <ArrowRight size={18} />
                      </Button>
                      <Button variant="glass" onClick={() => setCurrentView(ViewState.ID_CARD)} className="w-full sm:w-auto px-12 py-5 text-sm uppercase tracking-[0.2em] font-black">
                        Get Your ID Card
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

                      <div className="absolute -top-10 -left-10 w-40 h-40 bg-accent-500 rounded-full blur-[80px] opacity-20"></div>
                      <div className="absolute bottom-10 -left-10 z-30 bg-white p-6 rounded-2xl shadow-xl shadow-brand-900/10 animate-[bounce_3s_infinite] hidden sm:block">
                        <div className="flex items-center gap-4">
                          <div className="bg-brand-50 p-3 rounded-full text-brand-600"><Users size={24} /></div>
                          <div>
                            <p className="text-3xl font-bold text-slate-900 leading-none">500+</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Active Members</p>
                          </div>
                        </div>
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
                        City of Truth Ministries is more than just a building—it's a family. We are dedicated to creating a space where lives are transformed by the power of the Gospel. We believe in authenticity, community, and the move of the Holy Spirit.
                      </p>

                      <div className="space-y-4 mb-10">
                        {['Bible-Centered Teaching', 'Authentic Community', 'Spirit-Filled Worship'].map((item, i) => (
                          <div key={i} className="flex items-center gap-4 group cursor-default">
                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300">
                              <ChevronRight size={16} strokeWidth={3} />
                            </div>
                            <span className="font-semibold text-gray-800 text-lg">{item}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <Button onClick={() => setCurrentView(ViewState.ABOUT)} variant="primary" className="shadow-brand-500/30 px-8 py-4 text-base">Read Our Story</Button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </section>

              <section className="py-24 bg-brand-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>

                <div className="container mx-auto px-6 relative z-10">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-white/5 rounded-[3rem] p-8 md:p-12 border border-white/10 backdrop-blur-sm shadow-2xl">
                    <div className="flex-1 text-left">
                      <div className="inline-flex items-center gap-2 bg-accent-500/20 text-accent-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-accent-500/20">
                        <ShieldCheck size={16} />
                        <span>Official Member Access</span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Get Your Worshipper ID</h2>
                      <p className="text-brand-100/80 text-lg leading-relaxed mb-8 max-w-xl">
                        Verify your identity and generate your official City of Truth Ministries digital ID card. Access exclusive member resources, track your spiritual journey, and stay connected.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <Button
                          onClick={() => setCurrentView(ViewState.ID_CARD)}
                          variant="accent"
                          className="px-8 py-4 text-base shadow-lg shadow-accent-500/20"
                        >
                          Verify Identity & Get ID <ArrowRight size={18} />
                        </Button>
                      </div>
                    </div>

                    <motion.div
                      initial={{ rotate: -5, y: 20 }}
                      whileInView={{ rotate: 0, y: 0 }}
                      transition={{ duration: 0.8 }}
                      className="relative w-full max-w-sm"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-accent-500 to-brand-500 blur-[50px] opacity-40 rounded-full"></div>
                      <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        <div className="bg-white rounded-xl overflow-hidden shadow-xl">
                          <div className="bg-brand-900 h-16 relative overflow-hidden flex items-center px-4">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-accent-500/20 rounded-full blur-xl"></div>
                            <div className="flex items-center gap-2 z-10">
                              <div className="bg-white/10 p-1.5 rounded-lg"><Church size={16} className="text-amber-400" /></div>
                              <div>
                                <div className="text-[10px] text-white font-bold leading-none">CITY OF TRUTH</div>
                                <div className="text-[8px] text-amber-300 mt-0.5">Ministries</div>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 flex gap-4">
                            <div className="w-16 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300">
                              <UserIcon size={24} />
                            </div>
                            <div className="space-y-2 flex-1">
                              <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                              <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                              <div className="h-2 bg-gray-100 rounded w-full"></div>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
                            <div className="text-[8px] text-brand-600 font-bold tracking-widest uppercase">Verified Member</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </section>

              <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-gradient-to-br from-red-600 to-red-700 rounded-[3rem] p-10 md:p-16 text-white relative shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                    <div className="relative z-10 flex-1 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
                        <Youtube size={16} />
                        <span>Subscribe for Weekly Sermons</span>
                      </div>
                      <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 italic">Watch Us Live on YouTube</h2>
                      <p className="text-red-50/80 text-lg mb-10 max-w-xl font-light">Join our global community online. Subscribe to get notified whenever we go live with new messages, worship sessions, and special events.</p>
                      <a
                        href={youtubeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-white text-red-600 px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:bg-red-50 transition-all hover:scale-105 active:scale-95"
                      >
                        Visit Our Channel <ExternalLink size={18} />
                      </a>
                    </div>

                    <div className="relative z-10 flex-1 w-full max-w-md">
                      <div className="aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/20 relative group">
                        <img
                          src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=2670&auto=format&fit=crop"
                          alt="YouTube Preview"
                          className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl animate-pulse">
                            <Play size={32} fill="currentColor" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <TestimonialSection />
              <SpiritualAssistant />
            </motion.div>
          )}

          {currentView === ViewState.ABOUT && (
            <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-24 md:pt-48 pb-32">
              <div className="container mx-auto px-6 text-center">
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif font-bold text-brand-950 mb-8 tracking-tighter">Divine <span className="text-accent-600">Legacy</span></h1>
                <p className="text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed mb-16">Since 2010, City of Truth Ministries has been a lighthouse in the hills of Valparai, dedicated to teaching the Word of God with uncompromising truth and love.</p>

                <div className="grid md:grid-cols-3 gap-12 text-left max-w-6xl mx-auto">
                  {[
                    { title: "Empowerment", desc: "Equipping believers to walk in their divine calling through depth in scripture." },
                    { title: "Enlightenment", desc: "Revealing the mysteries of the Kingdom through prophetic teaching." },
                    { title: "Elevation", desc: "Raising a generation that worships in Spirit and in Truth." }
                  ].map((item, i) => (
                    <div key={i} className="p-10 bg-white rounded-[2.5rem] shadow-xl border border-slate-100">
                      <div className="w-12 h-1 h-brand-500 bg-brand-500 rounded-full mb-8"></div>
                      <h3 className="text-2xl font-serif font-bold mb-4">{item.title}</h3>
                      <p className="text-slate-600 leading-relaxed font-normal">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentView === ViewState.MINISTRIES && (
            <motion.div key="ministries" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-32 pb-20 bg-slate-50 min-h-screen">
              <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-20">
                  <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-accent-600 font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">Our Divine Calling</motion.span>
                  <h1 className="text-5xl md:text-7xl font-serif font-bold text-brand-950 mb-8">Sacred Ministries</h1>
                  <p className="text-xl text-slate-500 leading-relaxed">Serving the people of Valparai and the global community through dedicated spiritual outreach and community support.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { title: "Sunday Worship", icon: <Church size={30} />, desc: "Join us for our weekly celebration of faith, truth, and communal worship in the heart of Valparai." },
                    { title: "Youth Fellowship", icon: <Zap size={30} />, desc: "Empowering the next generation to lead with wisdom, integrity, and spiritual strength." },
                    { title: "Global Outreach", icon: <Globe size={30} />, desc: "Extending our hand to those in need through humanitarian missions and spiritual support worldwide." },
                    { title: "Bible Study", icon: <BookOpen size={30} />, desc: "Deep diving into the scriptures to discover profound truths for modern living." }
                  ].map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group"
                    >
                      <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand-600 group-hover:text-white transition-all">
                        {m.icon}
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-brand-950 mb-4">{m.title}</h3>
                      <p className="text-slate-500 leading-relaxed text-sm">{m.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentView === ViewState.ID_CARD && <WorshipperIDCard onRegister={handleRegister} />}
          {currentView === ViewState.ABOUT_VALPARAI && (
            <motion.div
              key="valparai"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="min-h-screen bg-slate-50 pt-32 pb-20"
            >
              <div className="container mx-auto px-6 max-w-4xl text-center mb-16 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/50 to-amber-100/50 rounded-full blur-[100px] -z-10 animate-pulse-slow"></div>

                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-3 border border-amber-200 bg-white/60 backdrop-blur-sm px-8 py-3 rounded-full mb-10 shadow-lg shadow-amber-500/10"
                >
                  <Sparkles size={16} className="text-amber-500 fill-amber-500 animate-pulse" />
                  <span className="uppercase tracking-[0.25em] font-bold text-xs text-amber-700">The 7th Heaven</span>
                  <Sparkles size={16} className="text-amber-500 fill-amber-500 animate-pulse" />
                </motion.div>

                <motion.div
                  variants={letterContainer}
                  initial="hidden"
                  animate="visible"
                  className="flex justify-center flex-wrap gap-1 md:gap-2 mb-6"
                >
                  {Array.from("VALPARAI").map((char, index) => (
                    <motion.span
                      key={index}
                      variants={letterChild}
                      whileHover={{ y: -10, color: '#2563eb' }}
                      className="text-7xl md:text-9xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#1e3a8a] via-[#3b82f6] to-[#1e3a8a] tracking-tight drop-shadow-sm inline-block transition-colors duration-300"
                      style={{ textShadow: '0 10px 30px rgba(59, 130, 246, 0.2)' }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="bg-white/80 backdrop-blur-md px-10 py-3 rounded-2xl inline-block mb-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-100"
                >
                  <h2 className="text-3xl font-tamil text-[#7e22ce] font-bold tracking-wide">வால்பாறை</h2>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-gray-600 font-serif text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto"
                >
                  A sanctuary in the clouds. <span className="italic font-bold text-brand-700">Valparai</span> is a scenic hill station in the Anaimalai Hills, offering a divine escape into nature's purest embrace. Located <span className="font-bold text-gray-900 bg-amber-100 px-2 py-0.5 rounded">3,474 feet</span> above sea level.
                </motion.p>
              </div>

              <div className="container mx-auto px-6 max-w-5xl mb-24">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className="grid gap-6"
                >
                  {[
                    { icon: Mountain, title: "Geography", text: "Located on the Anaimalai Hills range of the Western Ghats at an elevation of 3,474 ft (1,059 m). A pollution-free haven.", color: "blue" },
                    { icon: History, title: "Heritage", text: "First coffee planted in 1846 by K. Ramasamy Mudaliar. In 1890, W. Wintil began large scale tea & coffee cultivation.", color: "amber" },
                    { icon: Leaf, title: "Nature & Wildlife", text: "Part of Anaimalai Tiger Reserve. Home to Leopards, Elephants, Lion-tailed Macaques, Gaur, and Great Hornbills.", color: "emerald" },
                    { icon: TrendingUp, title: "Economy", text: "Driven by Tea and Coffee estates. Surrounded by dams like Aliyar and Sholayar, and hydro-electric power plants.", color: "purple" },
                    { icon: CloudRain, title: "Climate", text: "Mild tropical monsoon climate. One of the wettest places in TN. Summer: 15°C - 25°C. Winter: 10°C - 15°C.", color: "cyan" },
                    { icon: Plane, title: "How to Reach", text: "64 km from Pollachi with 40 hairpin bends. Nearest Airport: Coimbatore (102 km). Connected to Kerala via Malakkappara.", color: "rose" }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      whileHover={{ y: -10, scale: 1.02 }}
                      className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm hover:shadow-xl flex flex-col md:flex-row items-start gap-8 border border-white transition-all duration-300 group"
                    >
                      <div className={`w-20 h-20 rounded-2xl bg-${item.color}-50 flex items-center justify-center shrink-0 text-${item.color}-600`}>
                        <item.icon size={36} />
                      </div>
                      <div>
                        <h3 className={`text-3xl font-serif font-bold text-gray-900 mb-3 group-hover:text-${item.color}-700 transition-colors`}>{item.title}</h3>
                        <p className="text-gray-600 text-lg leading-relaxed mb-4">{item.text}</p>
                        <span className={`text-xs font-bold text-${item.color}-500 uppercase tracking-widest flex items-center gap-2`}>Read More <ArrowRight size={14} /></span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Detailed History Section */}
              <section className="py-24 bg-white relative overflow-hidden">
                <div className="container mx-auto px-6 max-w-5xl">
                  <div className="flex flex-col items-center text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">A Journey Through Time</h2>
                    <p className="text-gray-500 max-w-3xl text-lg italic">"Tracing the footsteps of pioneers in the sacred hills of Poonachimalai."</p>
                  </div>

                  <div className="space-y-12">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="flex flex-col md:flex-row gap-10 items-center bg-slate-50 p-10 rounded-[3rem]"
                    >
                      <div className="w-full md:w-1/3 text-6xl font-serif font-black text-brand-200">1846</div>
                      <div className="flex-1 text-left">
                        <h4 className="text-2xl font-bold text-gray-900 mb-4 font-serif">The First Coffee Pioneer</h4>
                        <p className="text-gray-600 leading-relaxed">The transformation of Valparai began when <b>K. Ramasamy Mudaliar</b> established the very first recorded coffee plantation. Before this, the region was an untouched, dense jungle known locally as <b>Poonachimalai</b>.</p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="flex flex-col md:flex-row-reverse gap-10 items-center border border-slate-100 p-10 rounded-[3rem]"
                    >
                      <div className="w-full md:w-1/3 text-6xl font-serif font-black text-amber-200 text-right">1890</div>
                      <div className="flex-1 text-left md:text-right">
                        <h4 className="text-2xl font-bold text-gray-900 mb-4 font-serif">The Era of Tea & Carver Marsh</h4>
                        <p className="text-gray-600 leading-relaxed">A significant turning point occurred when <b>W. Wintil</b> and <b>Nordan</b> acquired vast tracts of land. Wintil, alongside <b>Carver Marsh</b> (later known as the <i>"Father of Anamalais"</i>), deforested areas to clear the path for the massive tea and coffee estates we see today.</p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="flex flex-col md:flex-row gap-10 items-center bg-brand-900 p-10 rounded-[3rem] text-white"
                    >
                      <div className="w-full md:w-1/3 text-6xl font-serif font-black text-white/10">1875</div>
                      <div className="flex-1 text-left">
                        <h4 className="text-2xl font-bold mb-4 font-serif">Royal Infrastructure</h4>
                        <p className="text-white/70 leading-relaxed">In preparation for a visit by the <b>Prince of Wales</b> (later King Edward VII), specialized roads and guesthouses were constructed by colonial soldiers. Though the royal visit was cancelled, this infrastructure made the remote sanctuary accessible for the first time.</p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="bg-amber-50 p-12 rounded-[3.5rem] border border-amber-100 text-center"
                    >
                      <h4 className="text-2xl font-bold text-amber-900 mb-6 font-serif uppercase tracking-widest">Engineering Marvel</h4>
                      <p className="text-amber-800 leading-relaxed text-lg italic">
                        The legendary journey to Valparai involves climbing through <b>40 hairpin bends</b> starting from Pollachi, a feat of engineering that rises 3,474 feet into the clouds.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {currentView === ViewState.MENORAH && <GoldenMenorah />}
          {currentView === ViewState.HEBREW && <HebrewPage />}
          {currentView === ViewState.BARUCH_HASHEM && <BaruchHashemPage />}
          {currentView === ViewState.AI && <AIPage />}

          {currentView === ViewState.USER_DASHBOARD && currentUser && (
            <UserDashboard
              user={currentUser}
              onEdit={() => { }}
              onUpdate={async (updatedUser) => {
                await api.updateUser(updatedUser);
                setCurrentUser(updatedUser);
                setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
                alert("Profile Updated Successfully!");
              }}
            />
          )}



          {currentView === ViewState.CONTACT && (
            <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-24 md:pt-32 pb-20 bg-slate-50 min-h-screen">
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
                <div className="mt-24 relative h-[450px] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group">
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>

                  <div className="absolute top-8 left-8 z-20 bg-white p-5 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-100">
                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                      <MapPin size={24} />
                    </div>
                    <div className="text-left">
                      <strong className="block text-brand-950 text-sm font-bold">Locate Us</strong>
                      <span className="text-xs text-slate-500 font-medium">Valparai, Tamil Nadu</span>
                    </div>
                  </div>

                  <a
                    href="https://www.google.com/maps/@10.3275,76.9531,14z"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-8 right-8 z-20 bg-brand-950 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                  >
                    <Navigation size={18} /> Get Directions
                  </a>

                  <div className="absolute inset-0 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                    <img
                      src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2666&auto=format&fit=crop"
                      alt="Valparai Map Area"
                      className="w-full h-full object-cover"
                    />
                  </div>
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
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                  <Church size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-white leading-none">City of Truth</h3>
                  <p className="text-[10px] text-brand-200 uppercase tracking-widest mt-1">Ministries</p>
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
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-100/30">&copy; 2024 City of Truth Ministries • Valparai Sanctuary</p>

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
    </div>
  );
}

export default App;