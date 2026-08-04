import React from 'react';
import {
    Apple,
    BookOpen,
    Bot,
    Camera,
    Check,
    ClipboardList,
    CloudRain,
    Crown,
    Database,
    Drama,
    Eye,
    Flame,
    Grape,
    Hash,
    Languages,
    Leaf,
    Link2,
    Megaphone,
    Moon,
    PenLine,
    Ruler,
    Search,
    Smartphone,
    Snowflake,
    Sparkles,
    Sun,
    TreeDeciduous,
    Triangle,
    Type,
    Users,
    Wheat,
    X,
    Star,
    type LucideIcon,
} from 'lucide-react';

export const HEBREW_MONTH_ICONS: LucideIcon[] = [
    Wheat, Leaf, Wheat, Sun, Grape, Apple, Megaphone, CloudRain, Flame, Snowflake, TreeDeciduous, Drama,
];

export type MoonPhaseKey =
    | 'new'
    | 'waxing-crescent'
    | 'first-quarter'
    | 'waxing-gibbous'
    | 'full'
    | 'waning-gibbous'
    | 'last-quarter'
    | 'waning-crescent';

const MOON_PHASE_FILL: Record<MoonPhaseKey, number> = {
    new: 0,
    'waxing-crescent': 0.25,
    'first-quarter': 0.5,
    'waxing-gibbous': 0.75,
    full: 1,
    'waning-gibbous': 0.75,
    'last-quarter': 0.5,
    'waning-crescent': 0.25,
};

const MOON_PHASE_WAXING: Record<MoonPhaseKey, boolean> = {
    new: true,
    'waxing-crescent': true,
    'first-quarter': true,
    'waxing-gibbous': true,
    full: true,
    'waning-gibbous': false,
    'last-quarter': false,
    'waning-crescent': false,
};

export const MoonPhaseIcon: React.FC<{ phase: MoonPhaseKey; size?: number; className?: string }> = ({
    phase,
    size = 24,
    className = '',
}) => {
    const fill = MOON_PHASE_FILL[phase];
    const waxing = MOON_PHASE_WAXING[phase];
    const r = size / 2 - 1;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className={className}
            aria-hidden
        >
            <circle cx={size / 2} cy={size / 2} r={r} fill="currentColor" opacity={0.15} stroke="currentColor" strokeWidth={1.2} />
            {fill > 0 && fill < 1 ? (
                <path
                    d={
                        waxing
                            ? `M ${size / 2} ${size / 2 - r} A ${r} ${r} 0 0 1 ${size / 2} ${size / 2 + r} A ${r * (1 - fill * 2)} ${r} 0 0 0 ${size / 2} ${size / 2 - r} Z`
                            : `M ${size / 2} ${size / 2 - r} A ${r} ${r} 0 0 0 ${size / 2} ${size / 2 + r} A ${r * (1 - fill * 2)} ${r} 0 0 1 ${size / 2} ${size / 2 - r} Z`
                    }
                    fill="currentColor"
                />
            ) : fill >= 1 ? (
                <circle cx={size / 2} cy={size / 2} r={r} fill="currentColor" />
            ) : null}
        </svg>
    );
};

export const BADGE_ICONS: Record<string, LucideIcon> = {
    'verified-member': Check,
    'scripture-reader': BookOpen,
    'prayer-warrior': Sparkles,
    'worship-leader': Flame,
    'volunteer-heart': Star,
    'faith-builder': Star,
    evangelist: Megaphone,
    'kingdom-builder': Crown,
    'light-bearer': Sun,
    shepherd: Leaf,
    disciple: BookOpen,
    overcomer: Crown,
};

export const BadgeIcon: React.FC<{ badgeId: string; size?: number; className?: string }> = ({
    badgeId,
    size = 14,
    className = '',
}) => {
    const Icon = BADGE_ICONS[badgeId] || Star;
    return <Icon size={size} className={className} />;
};

export const GematriaHint: React.FC<{ value: number }> = ({ value }) => {
    if (value % 7 === 0) {
        return (
            <span className="inline-flex items-center gap-1">
                <Star size={10} className="inline" /> Multiple of 7
            </span>
        );
    }
    if (value % 3 === 0) {
        return (
            <span className="inline-flex items-center gap-1">
                <Triangle size={10} className="inline" /> Multiple of 3
            </span>
        );
    }
    if (value % 10 === 0) {
        return (
            <span className="inline-flex items-center gap-1">
                <X size={10} className="inline" /> Round number
            </span>
        );
    }
    return <span>Standard value</span>;
};

export const BUG_FIX_ICONS: Record<string, LucideIcon> = {
    type: Type,
    bot: Bot,
    mobile: Smartphone,
    link: Link2,
    hash: Hash,
    pen: PenLine,
    ruler: Ruler,
    users: Users,
    camera: Camera,
    square: Eye,
    search: Search,
    alert: Triangle,
    clipboard: ClipboardList,
    sparkles: Sparkles,
    bell: Sparkles,
    eye: Eye,
    database: Database,
    book: BookOpen,
    moon: Moon,
    check: Check,
};

export const BugFixIcon: React.FC<{ iconKey: string; size?: number; className?: string }> = ({
    iconKey,
    size = 24,
    className = '',
}) => {
    const Icon = BUG_FIX_ICONS[iconKey] || Check;
    return <Icon size={size} className={className} />;
};
