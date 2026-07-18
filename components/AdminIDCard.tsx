import React from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Calendar, MapPin, Phone, ShieldCheck } from 'lucide-react';

// Utility function to format date to DD-MM-YYYY
const formatDateToDDMMYYYY = (dateStr?: string): string => {
    if (!dateStr) return '';
    
    // Try parsing as ISO format (YYYY-MM-DD)
    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) {
        // If not a valid date, return original string
        return dateStr;
    }
    
    const day = parsed.getDate().toString().padStart(2, '0');
    const month = (parsed.getMonth() + 1).toString().padStart(2, '0');
    const year = parsed.getFullYear();
    
    return `${day}-${month}-${year}`;
};

interface AdminIDCardProps {
    user: {
        id: string;
        name: string;
        role: string;
        photo?: string;
        location?: string;
        phone?: string;
        memberSince?: string;
        cardThemeTone?: 'blue' | 'purple' | 'green' | 'red' | 'gold' | 'lightblue';
        status?: 'Pending Verification' | 'Active' | 'Rejected';
    };
    onPhotoClick?: () => void;
    onCotIdClick?: () => void;
    onLocationClick?: () => void;
    onMemberSinceClick?: () => void;
    onThemeChange?: (tone: 'blue' | 'purple' | 'green' | 'red' | 'gold' | 'lightblue') => void;
    sizeVariation?: 'standard' | 'large' | 'extralarge' | 'compact';
}

export const AdminIDCard: React.FC<AdminIDCardProps> = ({ user, onPhotoClick, onCotIdClick, onLocationClick, onMemberSinceClick, sizeVariation = 'standard' }) => {
    const qrData = `CITY OF TRUTH MINISTRIES\nID: ${user.id}\nName: ${user.name}\nRole: ${user.role}`;
    const tone = user.cardThemeTone || 'blue';
    const qrColor = {
        blue: 'color=1d4ed8&bgcolor=dbeafe',
        lightblue: 'color=1d4ed8&bgcolor=dbeafe',
        purple: 'color=7e22ce&bgcolor=f3e8ff',
        green: 'color=0f766e&bgcolor=ccfbf1',
        red: 'color=be123c&bgcolor=ffe4e6',
        gold: 'color=b45309&bgcolor=fef3c7'
    }[tone];
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}&${qrColor}&margin=0`;

    const themeClasses = {
        blue: {
            header: "from-slate-950 via-blue-900 to-sky-600",
            body: "from-slate-950 via-blue-950 to-sky-900",
            border: "border-sky-300/50",
            headerText: "text-sky-100",
            rolePill: "bg-white/10 border-sky-200/40 text-white",
            photoBorder: "border-sky-100 bg-sky-950",
            photoIcon: "text-sky-300",
            qrBorder: "border-sky-300/60",
            name: "text-white",
            idBtn: "text-sky-100 bg-sky-400/15 border-sky-300/40 hover:bg-sky-300/20 focus-visible:ring-sky-300",
            detailsBtn: "hover:bg-white/10 focus-visible:ring-sky-300",
            icon: "text-sky-300",
            detailsText: "text-sky-100",
            footer: "bg-white/10 border-sky-200/30 text-sky-100",
            footerIdText: "text-sky-50",
            copyrightText: "text-sky-100/70",
            decor1: "bg-sky-300/20",
            decor2: "bg-blue-400/15",
            foil: "from-sky-200/0 via-sky-100/20 to-transparent"
        },
        purple: {
            header: "from-[#1f1147] via-[#6d28d9] to-[#d946ef]",
            body: "from-[#180b35] via-[#34145f] to-[#6d28d9]",
            border: "border-fuchsia-300/50",
            headerText: "text-fuchsia-100",
            rolePill: "bg-white/10 border-fuchsia-100/40 text-white",
            photoBorder: "border-fuchsia-100 bg-purple-950",
            photoIcon: "text-fuchsia-200",
            qrBorder: "border-fuchsia-300/60",
            name: "text-white",
            idBtn: "text-fuchsia-100 bg-fuchsia-300/15 border-fuchsia-200/40 hover:bg-fuchsia-200/20 focus-visible:ring-fuchsia-300",
            detailsBtn: "hover:bg-white/10 focus-visible:ring-fuchsia-300",
            icon: "text-fuchsia-200",
            detailsText: "text-fuchsia-50",
            footer: "bg-white/10 border-fuchsia-200/30 text-fuchsia-100",
            footerIdText: "text-fuchsia-50",
            copyrightText: "text-fuchsia-100/70",
            decor1: "bg-fuchsia-300/20",
            decor2: "bg-violet-300/15",
            foil: "from-fuchsia-200/0 via-fuchsia-100/20 to-transparent"
        },
        green: {
            header: "from-emerald-950 via-emerald-800 to-teal-500",
            body: "from-[#052e24] via-emerald-950 to-teal-800",
            border: "border-emerald-300/50",
            headerText: "text-emerald-100",
            rolePill: "bg-white/10 border-emerald-100/40 text-white",
            photoBorder: "border-emerald-100 bg-emerald-950",
            photoIcon: "text-emerald-200",
            qrBorder: "border-emerald-300/60",
            name: "text-white",
            idBtn: "text-emerald-100 bg-emerald-300/15 border-emerald-200/40 hover:bg-emerald-200/20 focus-visible:ring-emerald-300",
            detailsBtn: "hover:bg-white/10 focus-visible:ring-emerald-300",
            icon: "text-emerald-200",
            detailsText: "text-emerald-50",
            footer: "bg-white/10 border-emerald-200/30 text-emerald-100",
            footerIdText: "text-emerald-50",
            copyrightText: "text-emerald-100/70",
            decor1: "bg-emerald-300/20",
            decor2: "bg-teal-300/15",
            foil: "from-emerald-200/0 via-emerald-100/20 to-transparent"
        },
        red: {
            header: "from-[#3f0713] via-[#8f1230] to-[#f43f5e]",
            body: "from-[#21040a] via-[#4c0718] to-[#9f1239]",
            border: "border-rose-300/55",
            headerText: "text-rose-100",
            rolePill: "bg-white/10 border-rose-100/40 text-white",
            photoBorder: "border-rose-100 bg-rose-950",
            photoIcon: "text-rose-200",
            qrBorder: "border-rose-300/60",
            name: "text-white",
            idBtn: "text-rose-100 bg-rose-300/15 border-rose-200/40 hover:bg-rose-200/20 focus-visible:ring-rose-300",
            detailsBtn: "hover:bg-white/10 focus-visible:ring-rose-300",
            icon: "text-rose-200",
            detailsText: "text-rose-50",
            footer: "bg-white/10 border-rose-200/35 text-rose-100",
            footerIdText: "text-rose-50",
            copyrightText: "text-rose-100/70",
            decor1: "bg-rose-200/20",
            decor2: "bg-red-300/15",
            foil: "from-rose-200/0 via-rose-100/20 to-transparent"
        },
        gold: {
            header: "from-[#2a1606] via-[#a16207] to-[#fbbf24]",
            body: "from-[#1f1305] via-[#4a2d07] to-[#d97706]",
            border: "border-amber-300/60",
            headerText: "text-amber-100",
            rolePill: "bg-white/10 border-amber-100/40 text-white",
            photoBorder: "border-amber-100 bg-amber-950",
            photoIcon: "text-amber-200",
            qrBorder: "border-amber-300/70",
            name: "text-white",
            idBtn: "text-amber-100 bg-amber-300/15 border-amber-200/40 hover:bg-amber-200/20 focus-visible:ring-amber-300",
            detailsBtn: "hover:bg-white/10 focus-visible:ring-amber-300",
            icon: "text-amber-200",
            detailsText: "text-amber-50",
            footer: "bg-white/10 border-amber-200/35 text-amber-100",
            footerIdText: "text-amber-50",
            copyrightText: "text-amber-100/75",
            decor1: "bg-amber-200/25",
            decor2: "bg-yellow-300/15",
            foil: "from-amber-200/0 via-amber-100/25 to-transparent"
        },
        lightblue: {
            header: "from-blue-400 via-sky-500 to-blue-500",
            body: "from-sky-100 via-blue-200 to-blue-400",
            border: "border-blue-300/70",
            headerText: "text-blue-900",
            rolePill: "bg-white/20 border-white/30 text-blue-900",
            photoBorder: "border-white bg-sky-50",
            photoIcon: "text-blue-700",
            qrBorder: "border-blue-300/60",
            name: "text-blue-950",
            idBtn: "text-blue-800 bg-blue-100/80 border-blue-300/60 hover:bg-blue-200 focus-visible:ring-blue-400",
            detailsBtn: "hover:bg-white/20 focus-visible:ring-blue-400",
            icon: "text-blue-700",
            detailsText: "text-blue-900",
            footer: "bg-white/40 border-blue-200 text-blue-800",
            footerIdText: "text-blue-950",
            copyrightText: "text-blue-900/65",
            decor1: "bg-blue-300/20",
            decor2: "bg-sky-300/15",
            foil: "from-white/0 via-white/40 to-transparent"
        }
    }[tone];

    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className={`group relative w-full bg-gradient-to-br ${themeClasses.body} rounded-3xl shadow-xl border ${themeClasses.border} overflow-hidden`}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${themeClasses.foil} opacity-80 pointer-events-none`} />
            <div className="absolute inset-[1px] rounded-[1.35rem] border border-white/10 pointer-events-none" />
            <div className="absolute left-5 right-5 top-[3.55rem] h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
            {/* Top Header Bar */}
            <div className={`relative z-10 bg-gradient-to-r ${themeClasses.header} px-5 py-3 flex items-center justify-between`}>
                <div>
                    <p className={`text-[9px] font-black uppercase tracking-[0.25em] ${themeClasses.headerText}`}>City of Truth</p>
                    <p className="text-[11px] font-bold text-white uppercase tracking-widest leading-tight">Ministries</p>
                    <p className="mt-0.5 text-[7px] font-black uppercase tracking-[0.22em] text-white/65">Official Entrust ID - Copyright 2026</p>
                </div>
                <div className={`flex items-center gap-1.5 backdrop-blur px-2.5 py-1 rounded-full border ${themeClasses.rolePill}`}>
                    <ShieldCheck size={11} className="text-white" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{user.role}</span>
                </div>
            </div>

            {/* Card Body */}
            <div className="relative z-10 p-5 flex gap-4">
                {/* Photo */}
                <div className="shrink-0 flex flex-col items-center gap-2">
                    <button
                        type="button"
                        onClick={(event) => {
                            if (!onPhotoClick) return;
                            event.stopPropagation();
                            onPhotoClick();
                        }}
                        className={`w-20 h-20 rounded-2xl border-4 ${themeClasses.photoBorder} shadow-lg overflow-hidden flex items-center justify-center transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60`}
                        title="Show image preview"
                    >
                        {user.photo ? (
                            <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon size={30} className={themeClasses.photoIcon} />
                        )}
                    </button>
                    {/* QR Code */}
                    <div className={`w-16 h-16 bg-white rounded-xl border ${themeClasses.qrBorder} shadow-sm p-1 overflow-hidden`}>
                        <img src={qrCodeUrl} alt="QR" className="w-full h-full object-contain" />
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <h3 className={`font-black ${themeClasses.name} text-base leading-tight uppercase truncate`}>
                            {user.name}
                        </h3>
                        <button
                            type="button"
                            onClick={(event) => {
                                if (!onCotIdClick) return;
                                event.stopPropagation();
                                onCotIdClick();
                            }}
                            className={`mt-1 text-[10px] font-mono px-2 py-0.5 rounded-lg inline-block transition-colors focus-visible:outline-none focus-visible:ring-2 ${themeClasses.idBtn}`}
                            title="Show COT ID preview"
                        >
                            ID: {user.id.split('-').pop()}
                        </button>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2">
                        <button
                            type="button"
                            onClick={(event) => {
                                if (!onLocationClick) return;
                                event.stopPropagation();
                                onLocationClick();
                            }}
                            className={`flex items-center gap-2 text-left rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 ${themeClasses.detailsBtn}`}
                            title="Show location preview"
                        >
                            <MapPin size={11} className={`${themeClasses.icon} shrink-0`} />
                            <span className={`text-[11px] font-semibold truncate ${themeClasses.detailsText}`}>{user.location || 'N/A'}</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <Phone size={11} className={`${themeClasses.icon} shrink-0`} />
                            <span className={`text-[11px] font-semibold truncate ${themeClasses.detailsText}`}>{user.phone || 'N/A'}</span>
                        </div>
                        <button
                            type="button"
                            onClick={(event) => {
                                if (!onMemberSinceClick) return;
                                event.stopPropagation();
                                onMemberSinceClick();
                            }}
                            className={`flex items-center gap-2 text-left rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 ${themeClasses.detailsBtn}`}
                            title="Show joined date preview"
                        >
                            <Calendar size={11} className={`${themeClasses.icon} shrink-0`} />
                            <span className={`text-[11px] font-semibold ${themeClasses.detailsText}`}>Joined {formatDateToDDMMYYYY(user.memberSince) || '2024'}</span>
                        </button>
                    </div>

                </div>
            </div>

            {/* Footer Strip */}
            <div className={`relative z-10 mx-5 mb-4 backdrop-blur border rounded-2xl px-3 py-2.5 flex items-center justify-between gap-3 ${themeClasses.footer}`}>
                <p className={`text-[9px] font-mono tracking-widest truncate ${themeClasses.footerIdText}`}>
                    {user.id}
                </p>
                <p className={`text-[7px] font-black uppercase tracking-[0.18em] truncate ${themeClasses.copyrightText}`}>
                    Copyright 2026 - City of Truth Ministries
                </p>
                {user.status && (
                    <div className="flex items-center shrink-0">
                        {user.status === 'Active' && (
                            <div className="relative inline-flex h-8 min-w-[112px] items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-teal-300 px-4 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-950 border border-white/70 overflow-hidden group shadow-[0_8px_24px_rgba(16,185,129,0.35)]">
                                <span className="relative z-10 flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-900" /> Approved</span>
                                <div className="absolute inset-0 bg-white/25 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700 ease-out rotate-12" />
                            </div>
                        )}
                        {user.status === 'Pending Verification' && (
                            <div className="relative inline-flex h-8 min-w-[104px] items-center justify-center rounded-full bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300 px-4 text-[10px] font-black uppercase tracking-[0.16em] text-amber-950 border border-white/70 overflow-hidden group shadow-[0_8px_24px_rgba(245,158,11,0.35)]">
                                <span className="relative z-10 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-900 animate-pulse" /> Pending</span>
                                <div className="absolute inset-0 bg-white/25 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700 ease-out rotate-12" />
                            </div>
                        )}
                        {user.status === 'Rejected' && (
                            <div className="relative inline-flex h-8 min-w-[128px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-400 px-4 text-[10px] font-black uppercase tracking-[0.16em] text-white border border-white/70 overflow-hidden group shadow-[0_8px_24px_rgba(225,29,72,0.35)]">
                                <span className="relative z-10 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-white" /> Disapproved</span>
                                <div className="absolute inset-0 bg-white/20 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700 ease-out rotate-12" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Decorative circles */}
            <div className={`absolute -top-6 -right-6 w-24 h-24 ${themeClasses.decor1} rounded-full pointer-events-none`} />
            <div className={`absolute -bottom-4 -left-4 w-16 h-16 ${themeClasses.decor2} rounded-full pointer-events-none`} />
        </motion.div>
    );
};
