import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    BookOpen, GraduationCap, Globe, Heart, Award, Star, Volume2, MapPin, Calendar,
    FileText, Download, Eye, X, ChevronLeft, ChevronRight, Quote, Mountain, ShieldCheck, Send
} from 'lucide-react';
import { audioService } from '../services/audioService';

interface PastorPageProps {
    className?: string;
    onPlanVisit?: () => void;
    onWatchSermons?: () => void;
    navigate?: (path: string) => void;
    setCurrentView?: (view: any) => void;
    ViewState?: any;
}

/* ─── Colour tokens (matching Archival Profile PDF) ──────────────────── */
const C = {
    navy:      '#14213D',
    navyDeep:  '#0D1627',
    parchment: '#F6F1E4',
    sand:      '#ECE1C8',
    sandLight: '#F3EBD9',
    gold:      '#C68A2E',
    goldLight: '#DFC076',
    charcoal:  '#241F18',
    muted:     '#6B6252',
    border:    'rgba(198, 138, 46, 0.35)',
};

const PDF_URL = '/assets/City-of-Truth-Pastor-Lazarus-MS-Archival-Profile.pdf';
const PDF_PAGES = [
    { num: 1, title: 'Cover & Pastoral Seal', img: '/assets/archival_profile/page_1.webp' },
    { num: 2, title: 'I. Our Pastor: The Man Behind the Message', img: '/assets/archival_profile/page_2.webp' },
    { num: 3, title: 'II. Formation & Heart: The Call & The Training', img: '/assets/archival_profile/page_3.webp' },
    { num: 4, title: 'III. City of Truth Ministries: At a Glance', img: '/assets/archival_profile/page_4.webp' },
    { num: 5, title: 'Colophon & Gospel Proclamation', img: '/assets/archival_profile/page_5.webp' },
];

/* ─── Tiny reusable chip ─────────────────────────────────────────────── */
const Chip: React.FC<{ label: string; value: string; rotate?: number }> = ({ label, value, rotate = 0 }) => (
    <div style={{
        background: '#fff',
        borderRadius: 999,
        padding: '9px 18px',
        fontSize: 13,
        fontWeight: 600,
        color: C.charcoal,
        boxShadow: '0 14px 26px -10px rgba(20,20,20,.28)',
        whiteSpace: 'nowrap',
        transform: `rotate(${rotate}deg)`,
        display: 'inline-block',
    }}>
        <span style={{ display: 'block', fontSize: 9.5, fontWeight: 700, color: C.muted, letterSpacing: '0.08em', marginBottom: 2 }}>
            {label}
        </span>
        {value}
    </div>
);

/* ─── Sparkle SVG ────────────────────────────────────────────────────── */
const Sparkle: React.FC<{ size?: number; opacity?: number }> = ({ size = 28, opacity = 0.55 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={C.gold} aria-hidden="true" style={{ opacity }}>
        <path d="M12 0 L14.2 9.8 L24 12 L14.2 14.2 L12 24 L9.8 14.2 L0 12 L9.8 9.8 Z"/>
    </svg>
);

export const PastorPage: React.FC<PastorPageProps> = ({
    className = '',
    onPlanVisit,
    onWatchSermons,
    navigate,
    setCurrentView,
    ViewState,
}) => {
    const [imgError, setImgError] = useState(false);
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [currentPdfPage, setCurrentPdfPage] = useState(1);
    const [viewerMode, setViewerMode] = useState<'rendered' | 'native'>('rendered');
    const [activeAudio, setActiveAudio] = useState<string | null>(null);
    const [connectEmail, setConnectEmail] = useState('');
    const [connectSuccess, setConnectSuccess] = useState(false);
    const [isConnectHovered, setIsConnectHovered] = useState(false);
    const [isConnectFocused, setIsConnectFocused] = useState(false);

    const handleConnectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (connectEmail.trim()) {
            setConnectSuccess(true);
            setConnectEmail('');
            setTimeout(() => setConnectSuccess(false), 4500);
        }
    };

    // Close modal on Escape key & arrow navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!pdfModalOpen) return;
            if (e.key === 'Escape') setPdfModalOpen(false);
            if (e.key === 'ArrowRight' && currentPdfPage < 5) setCurrentPdfPage(p => p + 1);
            if (e.key === 'ArrowLeft' && currentPdfPage > 1) setCurrentPdfPage(p => p - 1);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pdfModalOpen, currentPdfPage]);

    const playHebrewAudio = (phrase: string) => {
        setActiveAudio(phrase);
        audioService.playHebrew(phrase);
        setTimeout(() => setActiveAudio(null), 3000);
    };

    const degrees = [
        {
            badge: 'HIGHEST DEGREE',
            degree: 'Master of Divinity',
            sub: 'M.Div',
            institution: 'Apostolic Theological Assembly (ATA)',
            icon: GraduationCap,
        },
        {
            badge: 'FOUNDATIONAL DEGREE',
            degree: 'Bachelor of Divinity',
            sub: 'B.Div',
            institution: 'Nagaland Associate Theological Assembly (NATA)',
            icon: BookOpen,
        },
        {
            badge: 'ADVANCED STUDIES',
            degree: 'Hebrew & Scriptures',
            sub: 'Biblical Languages',
            institution: 'Advanced Hebrew Studies — TPI, United States',
            icon: Globe,
        },
        {
            badge: 'LANGUAGES OF MINISTRY',
            degree: 'தமிழ் · English',
            sub: 'Bilingual Pulpit',
            institution: 'Grounded in the original Hebrew Scriptures',
            icon: Award,
        },
    ];

    const servantQuotes = [
        {
            tamil: 'ஆழ்ந்த வேதஅறிவுடன் அர்ப்பணிப்பாக ஊழியம் செய்யும் தேவ ஊழியக்காரர்.',
            english: 'A devoted worker of God, serving with deep knowledge of the Scriptures.',
            icon: BookOpen,
        },
        {
            tamil: '“בָּרוּךְ הַשֵׁם — ஆண்டவர் நாமம் பெருமை பெறுக” என்ற நம்பிக்கையில் நிலைத்துள்ளது.',
            english: 'His life stands on the confession: “Blessed be the Name — may the Lord’s name be exalted.”',
            icon: Heart,
            hebrewAudio: 'בָּרוּךְ הַשֵׁם',
        },
        {
            tamil: 'போதனைகள் விசுவாசிகளுக்கு நன்றி, விசுவாசம் மற்றும் பரிசுத்த வாழ்வை ஊக்குவிக்கின்றன.',
            english: 'His teaching stirs believers toward gratitude, faith, and a life of holiness.',
            icon: Award,
        },
        {
            tamil: 'தேவவசனத்தை வருங்கால தலைமுறைகளுக்கு கொண்டு சேர்ப்பது அவர் வாழ்வின் முக்கிய பணி.',
            english: 'Carrying the Word of God to the generations to come is the great work of his life.',
            icon: Star,
        },
    ];

    const timelineMilestones = [
        {
            year: '2009',
            title: 'The Seed',
            desc: 'City of Truth Ministries is founded — a divine calling to teach the uncompromised truth of God’s Word and build a community of faith, grace, and sacrificial love.',
        },
        {
            year: 'Two Congregations',
            title: 'Expanding Horizons',
            desc: 'The gospel work multiplies across the bustling metropolitan of Chennai and the scenic hill terrain of Valparai, serving bilingual congregations in Tamil and English.',
        },
        {
            year: 'Rooted in Original Texts',
            title: 'Biblical Depth',
            desc: 'Advanced Hebrew studies with TPI in the United States infuse the pulpit with the richness of ancient biblical contexts, bridging timeless scripture with modern discipleship.',
        },
        {
            year: 'Today · 17+ Years On',
            title: 'Generational Mandate',
            desc: 'An enduring and fruitful labour to shepherd believers, train disciples, and hand the eternal Word faithfully to the generations yet to come.',
        },
    ];

    return (
        <div
            className={className}
            style={{
                minHeight: '100vh',
                width: '100%',
                background: `
                    radial-gradient(circle at 18% 24%, rgba(198,138,46,0.16) 0%, transparent 42%),
                    radial-gradient(circle at 82% 78%, rgba(28,45,84,0.5) 0%, transparent 50%),
                    linear-gradient(150deg, #070B14 0%, #101B30 35%, #1C263F 65%, #0B0E17 100%)
                `,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '40px 16px 80px',
                fontFamily: "'Work Sans', 'Inter', sans-serif",
                color: C.charcoal,
                overflowX: 'hidden',
            }}
        >
            {/* ── TOP ARCHIVAL DOCUMENT BANNER & ACTION BAR ── */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    width: '100%',
                    maxWidth: 1180,
                    margin: '0 auto 28px',
                    marginTop: '80px', // Added margin to move below navbar
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    padding: '14px 22px',
                    background: 'rgba(20, 33, 61, 0.75)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 20,
                    border: `1px solid ${C.border}`,
                    boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        background: `linear-gradient(135deg, ${C.gold}, #9C6A1D)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        boxShadow: '0 6px 14px rgba(198,138,46,0.4)',
                    }}>
                        <FileText size={20} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: '0.15em',
                                color: C.goldLight,
                                textTransform: 'uppercase',
                            }}>
                                Official Archival Profile
                            </span>
                            <span style={{
                                padding: '2px 8px',
                                borderRadius: 99,
                                background: 'rgba(198,138,46,0.2)',
                                color: C.gold,
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                            }}>
                                5 PAGES · PDF
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: '#E2E8F0', fontWeight: 500 }}>
                            Pastor Lazarus M.S. · Historical Record (MMIX – MMXXVI)
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <button
                        onClick={() => {
                            setCurrentPdfPage(1);
                            setPdfModalOpen(true);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '9px 18px',
                            borderRadius: 999,
                            background: `linear-gradient(135deg, ${C.gold}, #A87120)`,
                            color: '#0D1627',
                            fontWeight: 700,
                            fontSize: 13,
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 8px 20px -6px rgba(198,138,46,0.6)',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        <Eye size={15} /> View Archival PDF
                    </button>

                    <a
                        href={PDF_URL}
                        download="City-of-Truth-Pastor-Lazarus-MS-Archival-Profile.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '9px 18px',
                            borderRadius: 999,
                            background: 'rgba(255,255,255,0.08)',
                            color: '#F6F1E4',
                            fontWeight: 600,
                            fontSize: 13,
                            border: `1px solid rgba(255,255,255,0.2)`,
                            textDecoration: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.18)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <Download size={15} /> Download PDF
                    </a>
                </div>
            </motion.div>

            {/* ── MAIN PARCHMENT CONTAINER (SECTIONS I - IV) ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 1180,
                    background: C.parchment,
                    borderRadius: 36,
                    padding: 'clamp(28px, 4vw, 56px) clamp(20px, 4vw, 56px)',
                    boxShadow: '0 50px 100px -30px rgba(5,8,20, 0.7)',
                    overflow: 'hidden',
                    border: `1px solid ${C.sand}`,
                }}
            >
                {/* Decorative sparkles */}
                <span style={{ position: 'absolute', top: 26, right: 34, opacity: 0.55, pointerEvents: 'none' }}><Sparkle /></span>
                <span style={{ position: 'absolute', bottom: 30, left: 34, opacity: 0.35, pointerEvents: 'none' }}><Sparkle size={20} /></span>

                {/* ── HEADER WATERMARK & HEBREW TITLE ── */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <p style={{
                        margin: '0 0 6px',
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: '0.28em',
                        color: C.muted,
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                    }}>
                        <span style={{ width: 24, height: 1.5, background: C.gold, display: 'inline-block' }} />
                        CITY OF TRUTH MINISTRIES · עִיר הָאֱמֶת
                        <span style={{ width: 24, height: 1.5, background: C.gold, display: 'inline-block' }} />
                    </p>
                    <p style={{ margin: 0, fontSize: 13.5, color: C.muted, letterSpacing: '0.08em', fontStyle: 'italic' }}>
                        A Ministry of Faith, Grace & Community · Chennai & Valparai
                    </p>
                </div>

                {/* ── SECTION 1: COVER & HERO (PDF PAGE 1 & 2) ── */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'clamp(28px, 5vw, 64px)',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingBottom: 48,
                    borderBottom: `1px solid ${C.sand}`,
                }}>
                    {/* LEFT: Arched Photo Frame with Plaque */}
                    <div style={{ position: 'relative', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* Watermark TRUTH */}
                        <div
                            aria-hidden="true"
                            style={{
                                position: 'absolute',
                                top: -14,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontFamily: "'Source Serif 4', 'Georgia', serif",
                                fontWeight: 700,
                                fontSize: 'clamp(52px, 9vw, 120px)',
                                color: C.sand,
                                letterSpacing: '0.02em',
                                whiteSpace: 'nowrap',
                                userSelect: 'none',
                                pointerEvents: 'none',
                                zIndex: 0,
                            }}
                        >
                            TRUTH
                        </div>

                        {/* Arch frame */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.25, duration: 0.65, ease: 'easeOut' }}
                            style={{
                                position: 'relative',
                                zIndex: 1,
                                width: 'clamp(210px, 26vw, 300px)',
                                aspectRatio: '3/4',
                                borderRadius: '400px 400px 0 0',
                                background: `linear-gradient(200deg, #E3B45C 0%, ${C.gold} 24%, #6E4F24 58%, #172040 100%)`,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                overflow: 'hidden',
                                boxShadow: '0 30px 60px -20px rgba(20,33,61,.5)',
                                border: `4px solid ${C.parchment}`,
                            }}
                        >
                            {!imgError ? (
                                <img
                                    src="/assets/pastor-lazarus.webp"
                                    alt="Reverend Lazarus M.S. – Senior Pastor"
                                    onError={() => setImgError(true)}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        objectPosition: 'top center',
                                        display: 'block',
                                    }}
                                />
                            ) : (
                                <div style={{
                                    height: '100%', width: '100%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: C.navy, color: C.gold, fontSize: 36, fontWeight: 700
                                }}>
                                    אֱמֶת
                                </div>
                            )}

                            {/* Hebrew Plaque at bottom of Arch (as in Page 1 of PDF) */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'linear-gradient(180deg, rgba(13,22,39,0) 0%, rgba(13,22,39,0.92) 30%, rgba(13,22,39,1) 100%)',
                                padding: '16px 0 8px',
                                textAlign: 'center',
                            }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '4px 18px',
                                    background: 'rgba(198,138,46,0.22)',
                                    border: `1px solid ${C.gold}`,
                                    borderRadius: 99,
                                    color: C.goldLight,
                                    fontSize: 14,
                                    fontWeight: 700,
                                    letterSpacing: '0.12em',
                                    direction: 'rtl',
                                }}>
                                    אֱמֶת
                                </span>
                            </div>
                        </motion.div>

                        {/* Floating info chips */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.45 }}
                            style={{ position: 'absolute', top: 55, right: -18, zIndex: 2 }}
                        >
                            <Chip label="FOUNDED" value="2009" rotate={6} />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35, duration: 0.45 }}
                            style={{ position: 'absolute', top: 180, left: -18, zIndex: 2 }}
                        >
                            <Chip label="SERVING" value="Chennai · Valparai" rotate={-6} />
                        </motion.div>

                        {/* Stat card below arch */}
                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.45 }}
                            style={{
                                marginTop: 24,
                                background: '#fff',
                                borderRadius: 20,
                                padding: '14px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                boxShadow: '0 20px 40px -18px rgba(20,20,20,.25)',
                                border: `1px solid ${C.sand}`,
                            }}
                        >
                            <div>
                                <p style={{ margin: 0, fontSize: 11.5, color: C.muted, lineHeight: 1.35, fontWeight: 600 }}>
                                    Faithful Years of<br/>Ministry
                                </p>
                            </div>
                            <span style={{
                                fontFamily: "'Source Serif 4', 'Georgia', serif",
                                fontSize: 32,
                                fontWeight: 800,
                                color: C.navy,
                                lineHeight: 1,
                            }}>
                                17+
                            </span>
                        </motion.div>
                    </div>

                    {/* RIGHT: Bio & Title Content */}
                    <div style={{ flex: 1, minWidth: 'min(100%, 320px)' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <span style={{
                                display: 'inline-block',
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: '0.22em',
                                color: C.gold,
                                textTransform: 'uppercase',
                                marginBottom: 6,
                            }}>
                                Section I · Our Pastor
                            </span>
                            <h2 style={{
                                margin: '0 0 4px',
                                fontFamily: "'Source Serif 4', 'Georgia', serif",
                                fontSize: 'clamp(28px, 4vw, 44px)',
                                fontWeight: 800,
                                color: C.charcoal,
                                lineHeight: 1.15,
                            }}>
                                Reverend Lazarus M.S.
                            </h2>
                            <p style={{
                                margin: '0 0 16px',
                                fontSize: 14,
                                color: C.muted,
                                fontWeight: 600,
                            }}>
                                Senior Pastor, City of Truth Ministries · teaching the truth of God’s Word in Tamil, English & Hebrew.
                            </p>
                        </motion.div>

                        {/* Hebrew Title with Audio Listen Button */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                flexWrap: 'wrap',
                                margin: '0 0 8px',
                            }}
                        >
                            <span style={{
                                fontFamily: "'Source Serif 4', 'Georgia', serif",
                                fontSize: 21,
                                fontWeight: 700,
                                color: C.navy,
                                direction: 'rtl',
                            }}>
                                רבי מַשָּׁל בן אל עצר
                            </span>

                            <button
                                onClick={() => playHebrewAudio('רבי מַשָּׁל בן אל עצר')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '6px 14px',
                                    borderRadius: 999,
                                    background: activeAudio === 'רבי מַשָּׁל בן אל עצר' ? C.gold : C.navy,
                                    color: activeAudio === 'רבי מַשָּׁל בן אל עצר' ? C.navy : C.gold,
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: '0.08em',
                                    transition: 'all 0.2s ease',
                                }}
                                title="Listen to Hebrew title pronunciation"
                            >
                                <Volume2 size={13} />
                                RABBI MESHAL BEN EL ETSAR
                            </button>
                        </motion.div>

                        {/* Tamil transliteration */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.35 }}
                            style={{
                                margin: '0 0 16px',
                                fontSize: 17,
                                fontWeight: 700,
                                color: C.gold,
                            }}
                        >
                            ரப்பி மசால் பென் எல் எட்சர்
                        </motion.p>

                        {/* Gold divider */}
                        <div style={{ width: 56, height: 3, background: C.gold, borderRadius: 2, margin: '0 0 18px' }} />

                        {/* Comprehensive Bio Paragraph */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            style={{
                                margin: '0 0 20px',
                                fontSize: 15.5,
                                color: C.charcoal,
                                lineHeight: 1.7,
                                maxWidth: 540,
                            }}
                        >
                            A ministry of <strong>faith, grace, and community</strong> — walking together in
                            Chennai and Valparai since 2009. He is called to teach the truth of God’s Word
                            in both Tamil and Hebrew, <strong>bridging ancient wisdom with living faith</strong>,
                            and to carry the Word faithfully to the generations yet to come.
                        </motion.p>

                        {/* Meta tags row */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.45 }}
                            style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 26 }}
                        >
                            {[
                                { Icon: MapPin, label: 'Chennai & Valparai' },
                                { Icon: Calendar, label: 'Est. 2009' },
                                { Icon: GraduationCap, label: 'M.Div · B.Div · TPI' },
                            ].map(({ Icon, label }) => (
                                <div key={label} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 7,
                                    padding: '7px 15px',
                                    borderRadius: 999,
                                    background: '#fff',
                                    boxShadow: '0 6px 18px -8px rgba(20,20,20,.18)',
                                    fontSize: 12.5,
                                    fontWeight: 600,
                                    color: C.charcoal,
                                    border: `1px solid ${C.sand}`,
                                }}>
                                    <Icon size={14} color={C.gold} /> {label}
                                </div>
                            ))}
                        </motion.div>

                        {/* ── HIS ANCHORING CONFESSION (PDF PAGE 2) ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            style={{
                                background: '#fff',
                                borderRadius: 22,
                                padding: '20px 24px',
                                border: `1px solid ${C.sand}`,
                                boxShadow: '0 14px 30px -12px rgba(20,20,20,0.12)',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                <span style={{
                                    fontSize: 10,
                                    fontWeight: 800,
                                    letterSpacing: '0.18em',
                                    color: C.muted,
                                    textTransform: 'uppercase',
                                }}>
                                    HIS ANCHORING CONFESSION
                                </span>
                                <button
                                    onClick={() => playHebrewAudio('בָּרוּךְ הַשֵׁם')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 5,
                                        padding: '4px 10px',
                                        borderRadius: 99,
                                        background: activeAudio === 'בָּרוּךְ הַשֵׁם' ? C.gold : 'rgba(20,33,61,0.06)',
                                        color: activeAudio === 'בָּרוּךְ הַשֵׁם' ? '#fff' : C.navy,
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: 11,
                                        fontWeight: 700,
                                    }}
                                >
                                    <Volume2 size={12} /> Baruch Hashem
                                </button>
                            </div>

                            <div style={{ textAlign: 'center', margin: '10px 0 8px' }}>
                                <span style={{
                                    fontFamily: "'Source Serif 4', 'Georgia', serif",
                                    fontSize: 26,
                                    fontWeight: 800,
                                    color: C.navy,
                                    letterSpacing: '0.04em',
                                    direction: 'rtl',
                                }}>
                                    בָּרוּךְ הַשֵׁם
                                </span>
                            </div>

                            <p style={{
                                margin: 0,
                                fontSize: 13.5,
                                fontStyle: 'italic',
                                textAlign: 'center',
                                color: C.muted,
                                lineHeight: 1.5,
                            }}>
                                “Blessed be the Name of the Lord” — the confession his life and labours are built upon.
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* ── SECTION II: FORMATION & HEART (PDF PAGE 3) ── */}
                <div style={{ padding: '48px 0', borderBottom: `1px solid ${C.sand}` }}>
                    <div style={{ textAlign: 'center', marginBottom: 36 }}>
                        <span style={{
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: '0.22em',
                            color: C.gold,
                            textTransform: 'uppercase',
                            display: 'block',
                            marginBottom: 4,
                        }}>
                            Section II · Formation & Heart
                        </span>
                        <h3 style={{
                            margin: 0,
                            fontFamily: "'Source Serif 4', 'Georgia', serif",
                            fontSize: 'clamp(24px, 3.5vw, 36px)',
                            fontWeight: 700,
                            color: C.charcoal,
                        }}>
                            The Call & The Training
                        </h3>
                    </div>

                    {/* 4 Degrees Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: 16,
                        marginBottom: 40,
                    }}>
                        {degrees.map((deg, idx) => {
                            const IconComponent = deg.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 * idx, duration: 0.4 }}
                                    style={{
                                        background: '#fff',
                                        borderRadius: 22,
                                        padding: '22px 20px',
                                        border: `1px solid ${C.sand}`,
                                        boxShadow: '0 12px 24px -10px rgba(20,20,20,0.08)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <span style={{
                                                fontSize: 9.5,
                                                fontWeight: 800,
                                                letterSpacing: '0.14em',
                                                color: C.muted,
                                                textTransform: 'uppercase',
                                            }}>
                                                {deg.badge}
                                            </span>
                                            <div style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                background: 'rgba(198,138,46,0.14)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: C.gold,
                                            }}>
                                                <IconComponent size={16} />
                                            </div>
                                        </div>

                                        <h4 style={{
                                            margin: '0 0 6px',
                                            fontFamily: "'Source Serif 4', 'Georgia', serif",
                                            fontSize: 19,
                                            fontWeight: 700,
                                            color: C.navy,
                                        }}>
                                            {deg.degree}
                                        </h4>
                                    </div>

                                    <p style={{
                                        margin: '12px 0 0',
                                        fontSize: 12.5,
                                        color: C.muted,
                                        lineHeight: 1.45,
                                        fontWeight: 500,
                                        borderTop: `1px dashed ${C.sand}`,
                                        paddingTop: 10,
                                    }}>
                                        {deg.institution}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Subsection: A Servant's Heart — In His Own Words */}
                    <div style={{ marginTop: 20 }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 12,
                            marginBottom: 24,
                        }}>
                            <span style={{ width: 30, height: 1, background: C.gold }} />
                            <span style={{
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: '0.2em',
                                color: C.charcoal,
                                textTransform: 'uppercase',
                            }}>
                                A Servant’s Heart — In His Own Words
                            </span>
                            <span style={{ width: 30, height: 1, background: C.gold }} />
                        </div>

                        <div
                            className="cot-servant-quotes-grid"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
                                gap: 16,
                            }}
                        >
                            <style>{`
                                @media (min-width: 960px) {
                                    .cot-servant-quotes-grid {
                                        grid-template-columns: repeat(3, 1fr) !important;
                                    }
                                    .cot-servant-quote-middle {
                                        grid-column: 2 !important;
                                    }
                                }
                            `}</style>
                            {servantQuotes.map((sq, idx) => {
                                const IconComp = sq.icon;
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.12 * idx, duration: 0.4 }}
                                        className={idx === 3 ? 'cot-servant-quote-middle' : ''}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.85)',
                                            borderRadius: 20,
                                            padding: '20px 22px',
                                            border: `1px solid ${C.sand}`,
                                            display: 'flex',
                                            gap: 14,
                                            boxShadow: '0 10px 20px -8px rgba(20,20,20,0.06)',
                                        }}
                                    >
                                        <div style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            background: C.navy,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: C.gold,
                                            flexShrink: 0,
                                            marginTop: 2,
                                        }}>
                                            <IconComp size={16} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{
                                                margin: '0 0 8px',
                                                fontSize: 14,
                                                color: C.charcoal,
                                                fontWeight: 600,
                                                lineHeight: 1.5,
                                            }}>
                                                {sq.tamil}
                                            </p>
                                            <p style={{
                                                margin: 0,
                                                fontSize: 12.5,
                                                color: C.muted,
                                                fontStyle: 'italic',
                                                lineHeight: 1.45,
                                            }}>
                                                {sq.english}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── SECTION III: CITY OF TRUTH MINISTRIES (PDF PAGE 4) ── */}
                <div style={{ padding: '48px 0', borderBottom: `1px solid ${C.sand}` }}>
                    <div style={{ textAlign: 'center', marginBottom: 36 }}>
                        <span style={{
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: '0.22em',
                            color: C.gold,
                            textTransform: 'uppercase',
                            display: 'block',
                            marginBottom: 4,
                        }}>
                            Section III · City of Truth Ministries
                        </span>
                        <h3 style={{
                            margin: 0,
                            fontFamily: "'Source Serif 4', 'Georgia', serif",
                            fontSize: 'clamp(24px, 3.5vw, 36px)',
                            fontWeight: 700,
                            color: C.charcoal,
                        }}>
                            The Ministry at a Glance
                        </h3>
                    </div>

                    {/* 3 Metric Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 16,
                        marginBottom: 40,
                    }}>
                        {[
                            { num: '17+', label: 'Years of Faithful Ministry', sub: 'Unbroken dedication since 2009' },
                            { num: '2009', label: 'The Founding Year', sub: 'Rooted in truth and prayer' },
                            { num: '2', label: 'Cities Served', sub: 'Chennai & Valparai congregations' },
                        ].map((metric, i) => (
                            <div
                                key={i}
                                style={{
                                    background: '#fff',
                                    borderRadius: 22,
                                    padding: '24px 20px',
                                    textAlign: 'center',
                                    border: `1px solid ${C.sand}`,
                                    boxShadow: '0 12px 26px -10px rgba(20,20,20,0.08)',
                                }}
                            >
                                <span style={{
                                    fontFamily: "'Source Serif 4', 'Georgia', serif",
                                    fontSize: 38,
                                    fontWeight: 800,
                                    color: C.navy,
                                    display: 'block',
                                    marginBottom: 6,
                                }}>
                                    {metric.num}
                                </span>
                                <span style={{
                                    fontSize: 11,
                                    fontWeight: 800,
                                    letterSpacing: '0.12em',
                                    color: C.charcoal,
                                    textTransform: 'uppercase',
                                    display: 'block',
                                    marginBottom: 4,
                                }}>
                                    {metric.label}
                                </span>
                                <span style={{ fontSize: 12, color: C.muted }}>
                                    {metric.sub}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* The Journey Timeline */}
                    <div style={{ marginBottom: 40 }}>
                        <h4 style={{
                            fontSize: 12,
                            fontWeight: 800,
                            letterSpacing: '0.2em',
                            color: C.muted,
                            textTransform: 'uppercase',
                            textAlign: 'center',
                            marginBottom: 24,
                        }}>
                            THE JOURNEY · CHRONOLOGICAL ARCHIVE
                        </h4>

                        <div style={{
                            position: 'relative',
                            maxWidth: 820,
                            margin: '0 auto',
                            paddingLeft: 28,
                            borderLeft: `2px solid ${C.gold}`,
                        }}>
                            {timelineMilestones.map((m, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -14 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 * idx }}
                                    style={{
                                        position: 'relative',
                                        marginBottom: idx === timelineMilestones.length - 1 ? 0 : 28,
                                    }}
                                >
                                    {/* Timeline dot */}
                                    <div style={{
                                        position: 'absolute',
                                        left: -35,
                                        top: 3,
                                        width: 14,
                                        height: 14,
                                        borderRadius: '50%',
                                        background: C.parchment,
                                        border: `3px solid ${C.gold}`,
                                        boxShadow: '0 0 0 4px rgba(198,138,46,0.2)',
                                    }} />

                                    <div style={{
                                        background: '#fff',
                                        borderRadius: 18,
                                        padding: '16px 20px',
                                        border: `1px solid ${C.sand}`,
                                        boxShadow: '0 8px 20px -8px rgba(20,20,20,0.06)',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                            <span style={{
                                                fontSize: 12,
                                                fontWeight: 800,
                                                color: C.gold,
                                                letterSpacing: '0.06em',
                                            }}>
                                                {m.year}
                                            </span>
                                            <span style={{ color: C.sand }}>•</span>
                                            <span style={{
                                                fontSize: 13.5,
                                                fontWeight: 700,
                                                color: C.navy,
                                            }}>
                                                {m.title}
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: 13.5, color: C.muted, lineHeight: 1.55 }}>
                                            {m.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Languages of the Pulpit */}
                    <div>
                        <h4 style={{
                            fontSize: 12,
                            fontWeight: 800,
                            letterSpacing: '0.2em',
                            color: C.muted,
                            textTransform: 'uppercase',
                            textAlign: 'center',
                            marginBottom: 20,
                        }}>
                            LANGUAGES OF THE PULPIT
                        </h4>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: 16,
                            maxWidth: 820,
                            margin: '0 auto',
                        }}>
                            {[
                                { lang: 'தமிழ்', label: 'TAMIL', desc: 'Mother Tongue · Local Outreach' },
                                { lang: 'English', label: 'ENGLISH', desc: 'Teaching · Global Communication' },
                                { lang: 'עִבְרִית', label: 'HEBREW', desc: 'Scriptures · Original Revelation' },
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: C.navy,
                                        borderRadius: 20,
                                        padding: '22px 18px',
                                        textAlign: 'center',
                                        color: '#fff',
                                        boxShadow: '0 14px 28px -10px rgba(13,22,39,0.5)',
                                    }}
                                >
                                    <span style={{
                                        fontFamily: "'Source Serif 4', 'Georgia', serif",
                                        fontSize: 26,
                                        fontWeight: 700,
                                        color: C.gold,
                                        display: 'block',
                                        marginBottom: 6,
                                    }}>
                                        {item.lang}
                                    </span>
                                    <span style={{
                                        fontSize: 11,
                                        fontWeight: 800,
                                        letterSpacing: '0.14em',
                                        color: '#E2E8F0',
                                        display: 'block',
                                        marginBottom: 4,
                                    }}>
                                        {item.label}
                                    </span>
                                    <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)' }}>
                                        {item.desc}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── SECTION IV: GOSPEL PROCLAMATION & CLOSING ARCHIVE (PDF PAGE 5) ── */}
                <div style={{
                    marginTop: 48,
                    background: `linear-gradient(135deg, ${C.navyDeep} 0%, #152445 60%, #0A111F 100%)`,
                    borderRadius: 28,
                    padding: 'clamp(32px, 5vw, 56px) 24px',
                    textAlign: 'center',
                    color: '#fff',
                    position: 'relative',
                    border: `1px solid ${C.gold}`,
                    boxShadow: '0 30px 70px -20px rgba(10,17,31,0.8)',
                    overflow: 'hidden',
                }}>
                    {/* Corner sparkles */}
                    <span style={{ position: 'absolute', top: 20, right: 24, opacity: 0.4 }}><Sparkle size={20} /></span>
                    <span style={{ position: 'absolute', bottom: 20, left: 24, opacity: 0.3 }}><Sparkle size={18} /></span>

                    {/* Gold quote symbol */}
                    <div style={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        background: 'rgba(198,138,46,0.18)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        color: C.gold,
                    }}>
                        <Quote size={26} />
                    </div>

                    <p style={{
                        margin: '0 0 10px',
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: '0.24em',
                        color: C.goldLight,
                        textTransform: 'uppercase',
                    }}>
                        CITY OF TRUTH MINISTRIES
                    </p>

                    <h3 style={{
                        margin: '0 auto 14px',
                        fontFamily: "'Source Serif 4', 'Georgia', serif",
                        fontSize: 'clamp(24px, 4vw, 38px)',
                        fontWeight: 700,
                        lineHeight: 1.3,
                        maxWidth: 680,
                        color: '#F6F1E4',
                    }}>
                        “And you will know the truth, and the truth will <span style={{ color: C.goldLight }}>set you free</span>.”
                    </h3>

                    <p style={{
                        margin: '0 0 28px',
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: '0.18em',
                        color: 'rgba(255,255,255,0.75)',
                    }}>
                        GOSPEL OF JOHN 8 : 32
                    </p>

                    {/* Action buttons */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 14,
                        flexWrap: 'wrap',
                        marginBottom: 32,
                    }}>
                        <button
                            onClick={onPlanVisit}
                            style={{
                                background: `linear-gradient(135deg, ${C.gold}, #B27B22)`,
                                color: '#0B0F1A',
                                border: 'none',
                                padding: '13px 30px',
                                borderRadius: 999,
                                fontSize: 14,
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 10px 24px -6px rgba(198,138,46,0.5)',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            Plan a Visit
                        </button>

                        <button
                            onClick={onWatchSermons}
                            style={{
                                background: 'transparent',
                                color: '#F6F1E4',
                                border: '2px solid rgba(255,255,255,0.4)',
                                padding: '11px 28px',
                                borderRadius: 999,
                                fontSize: 14,
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = C.gold;
                                e.currentTarget.style.color = C.goldLight;
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                                e.currentTarget.style.color = '#F6F1E4';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            Watch Sermons
                        </button>

                        <button
                            onClick={() => {
                                setCurrentPdfPage(1);
                                setPdfModalOpen(true);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                background: 'rgba(255,255,255,0.1)',
                                color: '#F6F1E4',
                                border: `1px solid ${C.border}`,
                                padding: '11px 24px',
                                borderRadius: 999,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <Eye size={15} /> Read Full PDF Profile
                        </button>
                    </div>

                    {/* Hebrew Confession Seal */}
                    <div style={{ marginBottom: 18 }}>
                        <span style={{
                            fontFamily: "'Source Serif 4', 'Georgia', serif",
                            fontSize: 22,
                            fontWeight: 700,
                            color: C.goldLight,
                            direction: 'rtl',
                            letterSpacing: '0.08em',
                        }}>
                            בָּרוּךְ הַשֵׁם
                        </span>
                    </div>

                    {/* Colophon */}
                    <div style={{
                        borderTop: '1px solid rgba(255,255,255,0.12)',
                        paddingTop: 20,
                        maxWidth: 700,
                        margin: '0 auto',
                    }}>
                        <p style={{
                            margin: '0 0 6px',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.14em',
                            color: 'rgba(255,255,255,0.6)',
                            textTransform: 'uppercase',
                        }}>
                            A PASTOR’S ARCHIVAL PROFILE · COMPILED FOR THE CITY OF TRUTH FAMILY
                        </p>
                        <p style={{
                            margin: 0,
                            fontSize: 10.5,
                            letterSpacing: '0.1em',
                            color: 'rgba(255,255,255,0.45)',
                        }}>
                            · REVEREND LAZARUS M.S. · SENIOR PASTOR · CHENNAI & VALPARAI, INDIA · ESTABLISHED MMIX – MMXXVI
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* ── 3 SACRED PILLARS & COVENANT CONNECT: Building Disciples With Purpose ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 1180,
                    margin: '60px auto 0',
                    padding: 'clamp(28px, 4vw, 56px) clamp(20px, 4vw, 56px)',
                    background: '#F3EFE7',
                    borderRadius: 36,
                    boxShadow: '0 50px 100px -30px rgba(5,8,20, 0.7)',
                    border: `1px solid ${C.sand}`,
                }}
            >
                {/* Header Badge & Title */}
                <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 44px' }}>
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 22px',
                        borderRadius: 999,
                        border: `1.5px solid rgba(198,138,46,0.35)`,
                        background: 'rgba(198,138,46,0.1)',
                        color: C.gold,
                        fontSize: 11.5,
                        fontWeight: 800,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        marginBottom: 14,
                    }}>
                        <Award size={14} /> Sacred Calling & Purpose
                    </span>
                    <h2 style={{
                        margin: '8px auto 0',
                        fontFamily: "'Source Serif 4', 'Georgia', serif",
                        fontSize: 'clamp(30px, 4.5vw, 48px)',
                        fontWeight: 800,
                        color: '#2A3B24',
                        lineHeight: 1.15,
                        letterSpacing: '-0.02em',
                    }}>
                        Building Disciples With Purpose
                    </h2>
                    <p style={{
                        margin: '14px auto 0',
                        fontSize: 15.5,
                        color: '#52664D',
                        lineHeight: 1.7,
                        maxWidth: 620,
                    }}>
                        At City of Truth Ministries, we are consecrated to the pure Gospel, the eternal Hebrew scriptures, and living worship at 2,400m altitude.
                    </p>
                </div>

                {/* 3 Pillars Grid - Meditix Deep Forest (#2A3B24) with Radiant Cream Text (#F3EFE7) */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 22,
                    marginBottom: 44,
                }}>
                    {/* Pillar 1: Sacred Hebrew Roots */}
                    <div
                        style={{
                            padding: 'clamp(26px, 4vw, 34px)',
                            borderRadius: 26,
                            background: '#2A3B24',
                            border: '1.5px solid #455A3D',
                            boxShadow: '0 16px 36px -12px rgba(20,35,18,0.35)',
                            transition: 'all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.boxShadow = '0 24px 44px -12px rgba(42,59,36,0.5)';
                            e.currentTarget.style.borderColor = '#C68A2E';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 16px 36px -12px rgba(20,35,18,0.35)';
                            e.currentTarget.style.borderColor = '#455A3D';
                        }}
                        onClick={() => navigate && navigate('/hebrew-alphabet')}
                    >
                        <div>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 16,
                                background: 'rgba(243,239,231,0.1)',
                                border: '1px solid rgba(226,220,207,0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#DFC076',
                                marginBottom: 20,
                            }}>
                                <BookOpen size={22} />
                            </div>
                            <p style={{
                                margin: '0 0 6px',
                                fontSize: 10.5,
                                fontFamily: 'mono, monospace',
                                fontWeight: 800,
                                color: '#DFC076',
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                            }}>
                                Pillar 01
                            </p>
                            <h3 style={{
                                margin: '0 0 12px',
                                fontFamily: "'Source Serif 4', 'Georgia', serif",
                                fontSize: 23,
                                fontWeight: 700,
                                color: '#F3EFE7',
                                letterSpacing: '-0.01em',
                            }}>
                                Sacred Hebrew Roots
                            </h3>
                            <p style={{
                                margin: '0 0 20px',
                                fontSize: 14.5,
                                color: '#D8E2D5',
                                lineHeight: 1.65,
                            }}>
                                Uncovering the ancient Hebrew codex, Aleph-Tav mysteries, and foundational truths for deep spiritual discernment.
                            </p>
                        </div>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 11.5,
                            fontWeight: 800,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#DFC076',
                        }}>
                            <span>Explore Hebrew Codex</span>
                            <ChevronRight size={14} />
                        </div>
                    </div>

                    {/* Pillar 2: Covenant Discipleship */}
                    <div
                        style={{
                            padding: 'clamp(26px, 4vw, 34px)',
                            borderRadius: 26,
                            background: '#2A3B24',
                            border: '1.5px solid #455A3D',
                            boxShadow: '0 16px 36px -12px rgba(20,35,18,0.35)',
                            transition: 'all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.boxShadow = '0 24px 44px -12px rgba(42,59,36,0.5)';
                            e.currentTarget.style.borderColor = '#C68A2E';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 16px 36px -12px rgba(20,35,18,0.35)';
                            e.currentTarget.style.borderColor = '#455A3D';
                        }}
                        onClick={() => setCurrentView && ViewState && setCurrentView(ViewState.ID_CARD)}
                    >
                        <div>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 16,
                                background: 'rgba(243,239,231,0.1)',
                                border: '1px solid rgba(226,220,207,0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#DFC076',
                                marginBottom: 20,
                            }}>
                                <ShieldCheck size={22} />
                            </div>
                            <p style={{
                                margin: '0 0 6px',
                                fontSize: 10.5,
                                fontFamily: 'mono, monospace',
                                fontWeight: 800,
                                color: '#DFC076',
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                            }}>
                                Pillar 02
                            </p>
                            <h3 style={{
                                margin: '0 0 12px',
                                fontFamily: "'Source Serif 4', 'Georgia', serif",
                                fontSize: 23,
                                fontWeight: 700,
                                color: '#F3EFE7',
                                letterSpacing: '-0.01em',
                            }}>
                                Covenant Discipleship
                            </h3>
                            <p style={{
                                margin: '0 0 20px',
                                fontSize: 14.5,
                                color: '#D8E2D5',
                                lineHeight: 1.65,
                            }}>
                                Devoted to raising genuine followers of Yeshua HaMashiach through prayer, covenant community, and Entrust member passes.
                            </p>
                        </div>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 11.5,
                            fontWeight: 800,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#DFC076',
                        }}>
                            <span>Entrust Membership</span>
                            <ChevronRight size={14} />
                        </div>
                    </div>

                    {/* Pillar 3: Mountain Sanctuary */}
                    <div
                        style={{
                            padding: 'clamp(26px, 4vw, 34px)',
                            borderRadius: 26,
                            background: '#2A3B24',
                            border: '1.5px solid #455A3D',
                            boxShadow: '0 16px 36px -12px rgba(20,35,18,0.35)',
                            transition: 'all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.boxShadow = '0 24px 44px -12px rgba(42,59,36,0.5)';
                            e.currentTarget.style.borderColor = '#C68A2E';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 16px 36px -12px rgba(20,35,18,0.35)';
                            e.currentTarget.style.borderColor = '#455A3D';
                        }}
                        onClick={() => setCurrentView && ViewState && setCurrentView(ViewState.ABOUT_VALPARAI)}
                    >
                        <div>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 16,
                                background: 'rgba(243,239,231,0.1)',
                                border: '1px solid rgba(226,220,207,0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#DFC076',
                                marginBottom: 20,
                            }}>
                                <Mountain size={22} />
                            </div>
                            <p style={{
                                margin: '0 0 6px',
                                fontSize: 10.5,
                                fontFamily: 'mono, monospace',
                                fontWeight: 800,
                                color: '#DFC076',
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                            }}>
                                Pillar 03
                            </p>
                            <h3 style={{
                                margin: '0 0 12px',
                                fontFamily: "'Source Serif 4', 'Georgia', serif",
                                fontSize: 23,
                                fontWeight: 700,
                                color: '#F3EFE7',
                                letterSpacing: '-0.01em',
                            }}>
                                Mountain Sanctuary (2,400m)
                            </h3>
                            <p style={{
                                margin: '0 0 20px',
                                fontSize: 14.5,
                                color: '#D8E2D5',
                                lineHeight: 1.65,
                            }}>
                                Set in the pristine hill-country heights of Valparai, Tamil Nadu, an altar of perpetual prayer and unceasing intercession.
                            </p>
                        </div>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 11.5,
                            fontWeight: 800,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#DFC076',
                        }}>
                            <span>Sanctuary History</span>
                            <ChevronRight size={14} />
                        </div>
                    </div>
                </div>

                {/* ── Signature Meditix Folder Shape Card: Discipleship & Covenant Connect ── */}
                <div 
                    className="relative w-full max-w-4xl mx-auto drop-shadow-2xl transition-all duration-500 ease-in-out hover:drop-shadow-[0_25px_35px_rgba(0,0,0,0.18)] mt-6"
                    style={{ position: 'relative' }}
                >
                    <style>{`
                        .cot-pastor-connect-input::placeholder {
                            color: #8A9C80 !important;
                            opacity: 0.85;
                        }
                    `}</style>

                    {/* Folder Shape SVG Background */}
                    <div className="absolute inset-0 z-0">
                        <svg 
                            viewBox="0 0 800 400" 
                            preserveAspectRatio="none" 
                            className="w-full h-full drop-shadow-xl rounded-3xl"
                            style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.12))' }}
                        >
                            <defs>
                                <filter id="pastorNoiseFilter">
                                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
                                </filter>
                                <pattern id="pastorNoise" width="100%" height="100%">
                                    <rect width="100%" height="100%" filter="url(#pastorNoiseFilter)" opacity="0.05"/>
                                </pattern>
                            </defs>
                            <path 
                                d="M 0,110 
                                   Q 0,70 40,70 
                                   L 500,70 
                                   Q 530,70 530,50 
                                   L 530,30 
                                   Q 530,0 560,0 
                                   L 760,0 
                                   Q 800,0 800,40 
                                   L 800,360 
                                   Q 800,400 760,400 
                                   L 40,400 
                                   Q 0,400 0,360 Z" 
                                fill="#2A3B24"
                            />
                            <path 
                                d="M 0,110 Q 0,70 40,70 L 500,70 Q 530,70 530,50 L 530,30 Q 530,0 560,0 L 760,0 Q 800,0 800,40 L 800,360 Q 800,400 760,400 L 40,400 Q 0,400 0,360 Z" 
                                fill="url(#pastorNoise)"
                            />
                        </svg>
                    </div>

                    <div className="relative z-10 flex flex-col h-full min-h-[400px]">
                        {/* Top Tab Content Area */}
                        <div 
                            className="h-[70px] w-full flex items-center justify-between px-8 sm:px-12"
                            style={{ height: 70 }}
                        >
                            <span 
                                className="text-base sm:text-lg font-semibold tracking-wide"
                                style={{ color: '#2A3B24', opacity: 0.95 }}
                            >
                                Welcome to City of Truth · Sanctuary Fellowship
                            </span>
                            <span 
                                className="hidden sm:inline-flex items-center text-xs font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                                style={{ 
                                    background: 'rgba(42,59,36,0.95)',
                                    color: '#DFC076',
                                    border: '1px solid rgba(223,192,118,0.3)',
                                }}
                            >
                                2,400M ALTITUDE
                            </span>
                        </div>

                        {/* Main Card Content Area */}
                        <div 
                            className="flex-1 px-8 py-10 sm:px-14 sm:py-14 md:px-18 flex flex-col justify-center gap-6 relative"
                            style={{ position: 'relative' }}
                        >
                            {/* Subtle background decoration (organic leaf watermark) */}
                            <div 
                                className="absolute -bottom-16 left-0 w-80 h-80 pointer-events-none transition-transform duration-1000 hover:rotate-6"
                                style={{ opacity: 0.05 }}
                            >
                                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="#F3EFE7" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18,97.1,-2.3C97.4,13.4,92,29.3,83.1,43.4C74.2,57.5,61.8,69.8,47.3,78.2C32.8,86.6,16.4,91.1,0.5,90.2C-15.4,89.3,-30.8,83,-44.6,73.8C-58.4,64.6,-70.6,52.5,-78.9,38.3C-87.2,24.1,-91.6,7.8,-89.9,-8C-88.2,-23.8,-80.4,-39.1,-70.2,-52.1C-60,-65.1,-47.4,-75.8,-33.4,-82.1C-19.4,-88.4,-4,-90.3,10.6,-88.7C25.2,-87.1,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
                                </svg>
                            </div>

                            <div className="relative z-30">
                                <h3 
                                    className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight max-w-2xl"
                                    style={{ 
                                        fontFamily: "'Playfair Display', 'Source Serif 4', 'Georgia', serif",
                                        color: '#F3EFE7',
                                        margin: 0,
                                    }}
                                >
                                    <span style={{ display: 'block', marginBottom: 6, color: '#F3EFE7' }}>
                                        Connect with Your
                                    </span>
                                    <span 
                                        style={{ 
                                            display: 'block', 
                                            fontStyle: 'italic', 
                                            fontWeight: 300, 
                                            letterSpacing: 'normal',
                                            color: '#E2DCCF',
                                        }}
                                    >
                                        Sacred Calling
                                    </span>
                                </h3>
                                <p 
                                    className="text-sm sm:text-base mt-3.5 max-w-xl leading-relaxed"
                                    style={{ 
                                        color: '#D8E2D5',
                                        lineHeight: 1.68,
                                        margin: '14px 0 0',
                                    }}
                                >
                                    Receive weekly Hebrew scripture teachings, pastoral letters, and prayer updates from the Valparai mountain altar.
                                </p>
                            </div>

                            {/* Subscription / Connect Form */}
                            <form 
                                onSubmit={handleConnectSubmit}
                                className="relative z-30 mt-3 w-full max-w-xl group"
                                onMouseEnter={() => setIsConnectHovered(true)}
                                onMouseLeave={() => setIsConnectHovered(false)}
                            >
                                <div 
                                    className="flex items-center rounded-full transition-all duration-300 ease-out"
                                    style={{
                                        padding: '6px 8px 6px 20px',
                                        background: isConnectFocused ? 'rgba(255,255,255,0.06)' : 'transparent',
                                        border: isConnectFocused ? '1.5px solid rgba(243,239,231,0.5)' : '1.5px solid #5C6E52',
                                        boxShadow: isConnectFocused ? '0 0 18px rgba(243,239,231,0.15)' : 'none',
                                    }}
                                >
                                    <input
                                        type="email"
                                        placeholder="Subscribe to pastoral letters..."
                                        value={connectEmail}
                                        onChange={(e) => setConnectEmail(e.target.value)}
                                        onFocus={() => setIsConnectFocused(true)}
                                        onBlur={() => setIsConnectFocused(false)}
                                        className="cot-pastor-connect-input w-full bg-transparent outline-none text-base sm:text-lg tracking-wide transition-all font-light"
                                        style={{
                                            color: '#F3EFE7',
                                            border: 'none',
                                            background: 'transparent',
                                            padding: '10px 0',
                                        }}
                                        required
                                    />
                                    
                                    <button
                                        type="submit"
                                        aria-label="Submit subscription"
                                        className="flex items-center justify-center transition-all duration-300 ease-out cursor-pointer"
                                        style={{
                                            minWidth: 48,
                                            width: 48,
                                            height: 48,
                                            borderRadius: '50%',
                                            background: isConnectHovered ? '#FFFFFF' : '#F3EFE7',
                                            color: '#2A3B24',
                                            border: 'none',
                                            marginLeft: 8,
                                            transform: isConnectHovered ? 'scale(1.05)' : 'scale(1)',
                                            boxShadow: isConnectHovered ? '0 8px 20px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.12)',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Send 
                                            size={20} 
                                            strokeWidth={2.2}
                                            style={{
                                                color: '#2A3B24',
                                                transform: isConnectHovered ? 'translate(2px, -2px)' : 'none',
                                                transition: 'transform 0.3s ease-out',
                                            }} 
                                        />
                                    </button>
                                </div>

                                {connectSuccess && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xs sm:text-sm mt-3 flex items-center gap-1.5"
                                        style={{ color: '#DFC076', fontWeight: 600 }}
                                    >
                                        <span>✦</span>
                                        <span>Blessings! You are now connected with the City of Truth fellowship. Baruch Hashem!</span>
                                    </motion.p>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── INTERACTIVE ARCHIVAL PDF DOCUMENT VIEWER MODAL ── */}
            <AnimatePresence>
                {pdfModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(7, 11, 20, 0.88)',
                            backdropFilter: 'blur(16px)',
                            zIndex: 9999,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '16px',
                        }}
                        onClick={() => setPdfModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ duration: 0.25 }}
                            style={{
                                width: '100%',
                                maxWidth: 1000,
                                maxHeight: '92vh',
                                background: '#0D1627',
                                border: `1px solid ${C.border}`,
                                borderRadius: 24,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                boxShadow: '0 40px 90px -20px rgba(0,0,0,0.85)',
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div style={{
                                padding: '14px 20px',
                                background: '#121D33',
                                borderBottom: '1px solid rgba(255,255,255,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 12,
                                flexWrap: 'wrap',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <FileText size={18} color={C.gold} />
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#F6F1E4' }}>
                                            City of Truth — Pastor Lazarus M.S. Archival Profile
                                        </h4>
                                        <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                                            Page {currentPdfPage} of 5 · {PDF_PAGES[currentPdfPage - 1].title}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {/* Viewer mode toggle */}
                                    <div style={{
                                        display: 'flex',
                                        background: 'rgba(0,0,0,0.3)',
                                        borderRadius: 99,
                                        padding: 2,
                                        border: '1px solid rgba(255,255,255,0.1)',
                                    }}>
                                        <button
                                            onClick={() => setViewerMode('rendered')}
                                            style={{
                                                padding: '4px 10px',
                                                borderRadius: 99,
                                                border: 'none',
                                                background: viewerMode === 'rendered' ? C.gold : 'transparent',
                                                color: viewerMode === 'rendered' ? '#0B0F1A' : 'rgba(255,255,255,0.7)',
                                                fontSize: 11,
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            HD Page View
                                        </button>
                                        <button
                                            onClick={() => setViewerMode('native')}
                                            style={{
                                                padding: '4px 10px',
                                                borderRadius: 99,
                                                border: 'none',
                                                background: viewerMode === 'native' ? C.gold : 'transparent',
                                                color: viewerMode === 'native' ? '#0B0F1A' : 'rgba(255,255,255,0.7)',
                                                fontSize: 11,
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Native PDF
                                        </button>
                                    </div>

                                    {/* Download button */}
                                    <a
                                        href={PDF_URL}
                                        download="City-of-Truth-Pastor-Lazarus-MS-Archival-Profile.pdf"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            padding: '6px 12px',
                                            borderRadius: 99,
                                            background: 'rgba(255,255,255,0.08)',
                                            color: '#fff',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            border: '1px solid rgba(255,255,255,0.15)',
                                        }}
                                        title="Download original PDF"
                                    >
                                        <Download size={13} /> Download
                                    </a>

                                    {/* Close button */}
                                    <button
                                        onClick={() => setPdfModalOpen(false)}
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.1)',
                                            border: 'none',
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                        }}
                                        title="Close viewer (Esc)"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content Body */}
                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#080D18',
                                position: 'relative',
                                minHeight: '65vh',
                                padding: '16px',
                            }}>
                                {viewerMode === 'rendered' ? (
                                    <div style={{
                                        position: 'relative',
                                        maxWidth: 620,
                                        width: '100%',
                                        boxShadow: '0 25px 60px -15px rgba(0,0,0,0.9)',
                                        borderRadius: 8,
                                        overflow: 'hidden',
                                    }}>
                                        <img
                                            src={PDF_PAGES[currentPdfPage - 1].img}
                                            alt={`Archival Profile Page ${currentPdfPage}`}
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                                display: 'block',
                                            }}
                                        />

                                        {/* Floating page nav arrows */}
                                        {currentPdfPage > 1 && (
                                            <button
                                                onClick={() => setCurrentPdfPage(p => Math.max(1, p - 1))}
                                                style={{
                                                    position: 'absolute',
                                                    left: 12,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '50%',
                                                    background: 'rgba(13,22,39,0.85)',
                                                    backdropFilter: 'blur(8px)',
                                                    border: `1px solid ${C.gold}`,
                                                    color: C.gold,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
                                                }}
                                                title="Previous page (Left arrow)"
                                            >
                                                <ChevronLeft size={22} />
                                            </button>
                                        )}

                                        {currentPdfPage < 5 && (
                                            <button
                                                onClick={() => setCurrentPdfPage(p => Math.min(5, p + 1))}
                                                style={{
                                                    position: 'absolute',
                                                    right: 12,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '50%',
                                                    background: 'rgba(13,22,39,0.85)',
                                                    backdropFilter: 'blur(8px)',
                                                    border: `1px solid ${C.gold}`,
                                                    color: C.gold,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
                                                }}
                                                title="Next page (Right arrow)"
                                            >
                                                <ChevronRight size={22} />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <iframe
                                        src={`${PDF_URL}#page=${currentPdfPage}`}
                                        title="Pastor Lazarus Archival Profile PDF"
                                        style={{
                                            width: '100%',
                                            height: '70vh',
                                            border: 'none',
                                            borderRadius: 8,
                                        }}
                                    />
                                )}
                            </div>

                            {/* Modal Footer / Page Selector Drawer */}
                            <div style={{
                                padding: '12px 16px',
                                background: '#101A2E',
                                borderTop: '1px solid rgba(255,255,255,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 12,
                                flexWrap: 'wrap',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <button
                                        onClick={() => setCurrentPdfPage(p => Math.max(1, p - 1))}
                                        disabled={currentPdfPage === 1}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: 8,
                                            border: 'none',
                                            background: currentPdfPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)',
                                            color: currentPdfPage === 1 ? 'rgba(255,255,255,0.3)' : '#fff',
                                            cursor: currentPdfPage === 1 ? 'not-allowed' : 'pointer',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                        }}
                                    >
                                        <ChevronLeft size={14} /> Prev
                                    </button>

                                    <span style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 600 }}>
                                        {currentPdfPage} / 5
                                    </span>

                                    <button
                                        onClick={() => setCurrentPdfPage(p => Math.min(5, p + 1))}
                                        disabled={currentPdfPage === 5}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: 8,
                                            border: 'none',
                                            background: currentPdfPage === 5 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)',
                                            color: currentPdfPage === 5 ? 'rgba(255,255,255,0.3)' : '#fff',
                                            cursor: currentPdfPage === 5 ? 'not-allowed' : 'pointer',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                        }}
                                    >
                                        Next <ChevronRight size={14} />
                                    </button>
                                </div>

                                {/* Thumbnail Selector */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', padding: '2px 0' }}>
                                    {PDF_PAGES.map(page => (
                                        <button
                                            key={page.num}
                                            onClick={() => setCurrentPdfPage(page.num)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                padding: '4px 10px',
                                                borderRadius: 8,
                                                border: `1px solid ${currentPdfPage === page.num ? C.gold : 'rgba(255,255,255,0.15)'}`,
                                                background: currentPdfPage === page.num ? 'rgba(198,138,46,0.2)' : 'rgba(255,255,255,0.05)',
                                                color: currentPdfPage === page.num ? C.goldLight : 'rgba(255,255,255,0.7)',
                                                fontSize: 11,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            <span>Page {page.num}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
