import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Globe, Heart, Award, Star, Volume2, MapPin, Calendar } from 'lucide-react';
import { audioService } from '../services/audioService';

interface PastorPageProps {
    className?: string;
}

/* ─── colour tokens (mirrors hero HTML) ─────────────────────────────── */
const C = {
    navy:      '#14213D',
    parchment: '#F6F1E4',
    sand:      '#ECE1C8',
    gold:      '#C68A2E',
    charcoal:  '#241F18',
    muted:     '#6B6252',
};

/* ─── tiny reusable chip ─────────────────────────────────────────────── */
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

/* ─── sparkle SVG ────────────────────────────────────────────────────── */
const Sparkle: React.FC<{ size?: number; opacity?: number }> = ({ size = 28, opacity = 0.55 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={C.gold} aria-hidden="true" style={{ opacity }}>
        <path d="M12 0 L14.2 9.8 L24 12 L14.2 14.2 L12 24 L9.8 14.2 L0 12 L9.8 9.8 Z"/>
    </svg>
);

/* ─── feature card ───────────────────────────────────────────────────── */
const Feature: React.FC<{ Icon: React.ComponentType<{ size: number; color: string }>; text: string; delay: number }> = ({ Icon, text, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.45, ease: 'easeOut' }}
        whileHover={{ y: -2 }}
        style={{
            background: 'rgba(246,241,228,0.7)',
            border: `1px solid ${C.sand}`,
            borderRadius: 20,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            backdropFilter: 'blur(6px)',
            cursor: 'default',
        }}
    >
        <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
            <Icon size={16} color={C.gold} />
        </div>
        <p style={{ margin: 0, fontSize: 14, color: C.charcoal, lineHeight: 1.55, fontWeight: 500 }}>{text}</p>
    </motion.div>
);

export const PastorPage: React.FC<PastorPageProps> = ({ className = '' }) => {
    const [imgError, setImgError] = useState(false);

    const features: { Icon: React.ComponentType<{ size: number; color: string }>; text: string }[] = [
        { Icon: BookOpen,      text: 'ஆழ்ந்த வேதஅறிவுடன் அர்ப்பணிப்பாக ஊழியம் செய்யும் தேவ ஊழியக்காரர்.' },
        { Icon: GraduationCap, text: 'Master of Divinity (ATA) · Bachelor of Divinity (NATA)' },
        { Icon: Globe,         text: 'Advanced Hebrew Studies at TPI – USA · தமிழ் & English ministry.' },
        { Icon: Heart,         text: '"בָּרוּךְ הַשֵׁם – ஆண்டவர் நாமம் பெருமை பெறுக" என்ற நம்பிக்கையில் நிலைத்துள்ளது.' },
        { Icon: Award,         text: 'போதனைகள் விசுவாசிகளுக்கு நன்றி, விசுவாசம் மற்றும் பரிசுத்த வாழ்வை ஊக்குவிக்கின்றன.' },
        { Icon: Star,          text: 'தேவவசனத்தை வருங்கால தலைமுறைகளுக்கு கொண்டு சேர்ப்பது அவர் வாழ்வின் முக்கிய பணி.' },
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
                    linear-gradient(150deg,#0B0F1A 0%, #16233F 42%, #2A2013 82%, #171008 100%)
                `,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                padding: '80px 20px 60px',
                fontFamily: "'Work Sans', 'Inter', sans-serif",
                overflowX: 'hidden',
            }}
        >
            {/* ── Parchment card ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 1180,
                    background: C.parchment,
                    borderRadius: 32,
                    padding: 'clamp(28px,4vw,56px) clamp(22px,4vw,60px) 48px',
                    boxShadow: '0 50px 90px -30px rgba(5,8,20,.6)',
                    overflow: 'hidden',
                }}
            >
                {/* ── Decorative corner sparkles ── */}
                <span style={{ position: 'absolute', top: 26, right: 34, opacity: 0.55, pointerEvents: 'none' }}><Sparkle /></span>
                <span style={{ position: 'absolute', bottom: 26, left: 34, opacity: 0.35, pointerEvents: 'none' }}><Sparkle size={18} /></span>

                {/* ── Section label ── */}
                <motion.p
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25, duration: 0.5 }}
                    style={{
                        margin: '0 0 clamp(18px,3vw,32px)',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        color: C.muted,
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                    }}
                >
                    <span style={{ width: 28, height: 2, background: C.gold, display: 'inline-block', borderRadius: 2 }} />
                    Our Pastor
                    <span style={{ width: 28, height: 2, background: C.gold, display: 'inline-block', borderRadius: 2 }} />
                </motion.p>

                {/* ── Hero layout: photo + content ── */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'clamp(28px,5vw,64px)',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                }}>

                    {/* ─── LEFT: arch photo ─────────────────────────────── */}
                    <div style={{ position: 'relative', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                        {/* Watermark word */}
                        <div
                            aria-hidden="true"
                            style={{
                                position: 'absolute',
                                top: -12,
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
                            transition={{ delay: 0.3, duration: 0.65, ease: 'easeOut' }}
                            style={{
                                position: 'relative',
                                zIndex: 1,
                                width: 'clamp(200px, 26vw, 300px)',
                                aspectRatio: '3/4',
                                borderRadius: '400px 400px 0 0',
                                background: `linear-gradient(200deg,#E3B45C 0%, ${C.gold} 24%, #6E4F24 58%, #172040 100%)`,
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                boxShadow: '0 30px 60px -20px rgba(20,33,61,.5)',
                            }}
                        >
                            {!imgError ? (
                                <img
                                    src="/assets/pastor-lazarus.png"
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
                                /* Fallback silhouette */
                                <svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: '60%' }}>
                                    <circle cx="50" cy="41" r="20" fill="#F6F1E4" opacity="0.92"/>
                                    <path d="M16 128 C16 90 30 59 50 59 C70 59 84 90 84 128 Z" fill="#F6F1E4" opacity="0.92"/>
                                </svg>
                            )}
                        </motion.div>

                        {/* Floating info chips */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.55, duration: 0.45 }}
                            style={{ position: 'absolute', top: 60, right: -18, zIndex: 2 }}
                        >
                            <Chip label="FOUNDED" value="2009" rotate={6} />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.65, duration: 0.45 }}
                            style={{ position: 'absolute', top: 200, left: -18, zIndex: 2 }}
                        >
                            <Chip label="SERVING" value="Chennai · Valparai" rotate={-7} />
                        </motion.div>

                        {/* Stat card below arch */}
                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.75, duration: 0.45 }}
                            style={{
                                marginTop: 28,
                                background: '#fff',
                                borderRadius: 20,
                                padding: '16px 28px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 18,
                                boxShadow: '0 20px 40px -18px rgba(20,20,20,.32)',
                            }}
                        >
                            <div>
                                <p style={{ margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.4 }}>Years of<br/>Ministry</p>
                            </div>
                            <span style={{
                                fontFamily: "'Source Serif 4', 'Georgia', serif",
                                fontSize: 34,
                                fontWeight: 700,
                                color: C.navy,
                                lineHeight: 1,
                            }}>17+</span>
                        </motion.div>
                    </div>

                    {/* ─── RIGHT: bio content ───────────────────────────── */}
                    <div style={{ flex: 1, minWidth: 'min(100%, 300px)' }}>

                        {/* Eyebrow */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            style={{ margin: '0 0 10px', fontSize: 15, color: C.muted }}
                        >
                            Hey, I'm <strong style={{ color: C.charcoal }}>Pastor Lazarus M.S.</strong>
                        </motion.p>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.55 }}
                            style={{
                                fontFamily: "'Source Serif 4', 'Georgia', serif",
                                fontWeight: 700,
                                color: C.charcoal,
                                fontSize: 'clamp(30px, 4vw, 50px)',
                                lineHeight: 1.1,
                                margin: '0 0 8px',
                            }}
                        >
                            Truth That<br/>Sets You Free
                        </motion.h1>

                        {/* Hebrew name + pronunciation */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.45 }}
                            style={{ margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}
                        >
                            <span style={{
                                fontFamily: "'Source Serif 4', 'Georgia', serif",
                                fontSize: 18,
                                color: C.navy,
                                opacity: 0.85,
                                direction: 'rtl',
                            }}>
                                רבי מַשָּׁל בן אל עצר
                            </span>
                            <button
                                onClick={() => audioService.playHebrew('רבי מַשָּׁל בן אל עצר')}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '6px 14px', borderRadius: 999,
                                    background: C.navy, border: 'none', cursor: 'pointer',
                                    color: C.gold, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                                    transition: 'transform 0.2s, background 0.2s',
                                    fontFamily: 'inherit',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                                aria-label="Listen to Hebrew pronunciation"
                            >
                                <Volume2 size={13} /> LISTEN
                            </button>
                        </motion.div>

                        {/* Tamil transliteration */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700, color: C.gold }}
                        >
                            ரப்பி மசால் பென் எல் எட்சர்
                        </motion.p>

                        {/* Gold divider */}
                        <div style={{ width: 48, height: 3, background: C.gold, borderRadius: 2, margin: '0 0 20px' }} />

                        {/* Bio blurb */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.55 }}
                            style={{
                                margin: '0 0 22px',
                                fontSize: 15,
                                color: C.muted,
                                lineHeight: 1.6,
                                maxWidth: 440,
                            }}
                        >
                            A ministry of faith, grace, and community — walking together in
                            Chennai and Valparai since 2009. Called to teach the truth of
                            God's Word in both Tamil and Hebrew, bridging ancient wisdom
                            with living faith.
                        </motion.p>

                        {/* Meta tags row */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}
                        >
                            {([
                                { Icon: MapPin,        label: 'Chennai & Valparai' },
                                { Icon: Calendar,      label: 'Est. 2009' },
                                { Icon: GraduationCap, label: 'M.Div · B.Div · TPI' },
                            ] as { Icon: React.ComponentType<{ size: number; color: string }>; label: string }[]).map(({ Icon, label }) => (
                                <div key={label} style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '7px 14px', borderRadius: 999,
                                    background: '#fff',
                                    boxShadow: '0 6px 18px -8px rgba(20,20,20,.2)',
                                    fontSize: 12.5, fontWeight: 600, color: C.charcoal,
                                }}>
                                    <Icon size={13} color={C.gold} /> {label}
                                </div>
                            ))}
                        </motion.div>

                        {/* Feature grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                            {features.map((f, i) => (
                                <Feature key={i} Icon={f.Icon} text={f.text} delay={0.65 + i * 0.08} />
                            ))}
                        </div>

                        {/* CTA buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1, duration: 0.45 }}
                            style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}
                        >
                            <button
                                style={{
                                    background: C.navy, color: C.parchment,
                                    border: 'none', padding: '13px 28px',
                                    borderRadius: 999, fontSize: 14.5, fontWeight: 700,
                                    cursor: 'pointer', transition: 'transform .2s, background .2s',
                                    fontFamily: 'inherit',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#1d2f5a'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = C.navy; }}
                            >
                                Plan a Visit
                            </button>
                            <button
                                style={{
                                    background: 'transparent', color: C.navy,
                                    border: `2px solid ${C.navy}`, padding: '11px 28px',
                                    borderRadius: 999, fontSize: 14.5, fontWeight: 700,
                                    cursor: 'pointer', transition: 'transform .2s, background .2s, color .2s',
                                    fontFamily: 'inherit',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = C.navy; e.currentTarget.style.color = C.parchment; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.navy; }}
                            >
                                Watch Sermons
                            </button>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
