import React from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Calendar, MapPin, Phone, ShieldCheck } from 'lucide-react';

interface AdminIDCardProps {
    user: {
        id: string;
        name: string;
        role: string;
        photo?: string;
        location?: string;
        phone?: string;
        memberSince?: string;
        cardThemeTone?: 'blue' | 'purple' | 'green' | 'red' | 'gold';
        status?: 'Pending Verification' | 'Active' | 'Rejected';
    };
    onPhotoClick?: () => void;
    onCotIdClick?: () => void;
    onLocationClick?: () => void;
    onMemberSinceClick?: () => void;
    onThemeChange?: (tone: 'blue' | 'purple' | 'green' | 'red' | 'gold') => void;
}

export const AdminIDCard: React.FC<AdminIDCardProps> = ({ user, onPhotoClick, onCotIdClick, onLocationClick, onMemberSinceClick, onThemeChange }) => {
    const qrData = `CITY OF TRUTH MINISTRIES\nID: ${user.id}\nName: ${user.name}\nRole: ${user.role}`;
    const tone = user.cardThemeTone || 'blue';
    const qrColor = {
        blue: 'color=1d4ed8&bgcolor=dbeafe',
        purple: 'color=7e22ce&bgcolor=f3e8ff',
        green: 'color=0f766e&bgcolor=ccfbf1',
        red: 'color=be123c&bgcolor=ffe4e6',
        gold: 'color=b45309&bgcolor=fef3c7'
    }[tone];
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}&${qrColor}&margin=0`;

    const themeClasses = {
        blue: {
            header: "from-sky-500 to-blue-600",
            body: "from-sky-50 via-blue-50 to-sky-100",
            border: "border-sky-200",
            headerText: "text-sky-100",
            rolePill: "bg-white/20 border-white/30 text-white",
            photoBorder: "border-white bg-sky-100",
            photoIcon: "text-sky-300",
            qrBorder: "border-sky-200",
            name: "text-blue-900",
            idBtn: "text-sky-600 bg-sky-100 border-sky-200 hover:bg-sky-200 focus-visible:ring-sky-300",
            detailsBtn: "hover:bg-sky-100/70 focus-visible:ring-sky-300",
            icon: "text-sky-500",
            detailsText: "text-blue-800",
            footer: "bg-white/70 border-sky-200 text-sky-500",
            decor1: "bg-blue-200/40",
            decor2: "bg-sky-300/30"
        },
        purple: {
            header: "from-fuchsia-500 to-purple-600",
            body: "from-fuchsia-50 via-purple-50 to-fuchsia-100",
            border: "border-purple-200",
            headerText: "text-purple-100",
            rolePill: "bg-white/20 border-white/30 text-white",
            photoBorder: "border-white bg-purple-100",
            photoIcon: "text-purple-300",
            qrBorder: "border-purple-200",
            name: "text-purple-900",
            idBtn: "text-purple-600 bg-purple-100 border-purple-200 hover:bg-purple-200 focus-visible:ring-purple-300",
            detailsBtn: "hover:bg-purple-100/70 focus-visible:ring-purple-300",
            icon: "text-purple-500",
            detailsText: "text-purple-800",
            footer: "bg-white/70 border-purple-200 text-purple-500",
            decor1: "bg-purple-200/40",
            decor2: "bg-purple-300/30"
        },
        green: {
            header: "from-emerald-500 to-teal-600",
            body: "from-emerald-50 via-teal-50 to-emerald-100",
            border: "border-emerald-200",
            headerText: "text-emerald-100",
            rolePill: "bg-white/20 border-white/30 text-white",
            photoBorder: "border-white bg-emerald-100",
            photoIcon: "text-emerald-300",
            qrBorder: "border-emerald-200",
            name: "text-emerald-900",
            idBtn: "text-emerald-600 bg-emerald-100 border-emerald-200 hover:bg-emerald-200 focus-visible:ring-emerald-300",
            detailsBtn: "hover:bg-emerald-100/70 focus-visible:ring-emerald-300",
            icon: "text-emerald-500",
            detailsText: "text-emerald-800",
            footer: "bg-white/70 border-emerald-200 text-emerald-500",
            decor1: "bg-emerald-200/40",
            decor2: "bg-emerald-300/30"
        },
        red: {
            header: "from-rose-500 to-red-600",
            body: "from-rose-50 via-red-50 to-rose-100",
            border: "border-red-200",
            headerText: "text-red-100",
            rolePill: "bg-white/20 border-white/30 text-white",
            photoBorder: "border-white bg-red-100",
            photoIcon: "text-red-300",
            qrBorder: "border-red-200",
            name: "text-red-900",
            idBtn: "text-red-600 bg-red-100 border-red-200 hover:bg-red-200 focus-visible:ring-red-300",
            detailsBtn: "hover:bg-red-100/70 focus-visible:ring-red-300",
            icon: "text-red-500",
            detailsText: "text-red-800",
            footer: "bg-white/70 border-red-200 text-red-500",
            decor1: "bg-red-200/40",
            decor2: "bg-red-300/30"
        },
        gold: {
            header: "from-amber-500 to-orange-600",
            body: "from-amber-50 via-orange-50 to-amber-100",
            border: "border-amber-200",
            headerText: "text-amber-100",
            rolePill: "bg-white/20 border-white/30 text-white",
            photoBorder: "border-white bg-amber-100",
            photoIcon: "text-amber-300",
            qrBorder: "border-amber-200",
            name: "text-amber-950",
            idBtn: "text-amber-600 bg-amber-100 border-amber-200 hover:bg-amber-200 focus-visible:ring-amber-300",
            detailsBtn: "hover:bg-amber-100/70 focus-visible:ring-amber-300",
            icon: "text-amber-500",
            detailsText: "text-amber-900",
            footer: "bg-white/70 border-amber-200 text-amber-600",
            decor1: "bg-amber-200/40",
            decor2: "bg-amber-300/30"
        }
    }[tone];

    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className={`group relative w-full bg-gradient-to-br ${themeClasses.body} rounded-3xl shadow-xl border ${themeClasses.border} overflow-hidden`}
        >
            {/* Top Header Bar */}
            <div className={`bg-gradient-to-r ${themeClasses.header} px-5 py-3 flex items-center justify-between`}>
                <div>
                    <p className={`text-[9px] font-black uppercase tracking-[0.25em] ${themeClasses.headerText}`}>City of Truth</p>
                    <p className="text-[11px] font-bold text-white uppercase tracking-widest leading-tight">Ministries</p>
                </div>
                <div className={`flex items-center gap-1.5 backdrop-blur px-2.5 py-1 rounded-full border ${themeClasses.rolePill}`}>
                    <ShieldCheck size={11} className="text-white" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{user.role}</span>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex gap-4">
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
                            <span className={`text-[11px] font-semibold ${themeClasses.detailsText}`}>Joined {user.memberSince || '2024'}</span>
                        </button>
                    </div>

                    {/* Theme Customizer Dots */}
                    {onThemeChange && (
                        <div className="flex items-center gap-1.5 mt-2 pt-1 border-t border-slate-200/20">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest shrink-0">Theme:</span>
                            <div className="flex items-center gap-1">
                                {(['blue', 'purple', 'green', 'red', 'gold'] as const).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onThemeChange(t);
                                        }}
                                        className={`w-3.5 h-3.5 rounded-full border transition-all ${
                                            t === 'blue' ? 'bg-blue-500 border-blue-600' :
                                            t === 'purple' ? 'bg-purple-500 border-purple-600' :
                                            t === 'green' ? 'bg-emerald-500 border-emerald-600' :
                                            t === 'red' ? 'bg-rose-500 border-rose-600' :
                                            'bg-amber-400 border-amber-500'
                                        } ${tone === t ? 'ring-2 ring-slate-400 ring-offset-1 scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                                        title={`Set card theme to ${t}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Strip */}
            <div className={`mx-5 mb-4 backdrop-blur border rounded-xl px-3 py-2 flex items-center justify-between ${themeClasses.footer}`}>
                <p className="text-[9px] font-mono tracking-widest truncate">
                    {user.id}
                </p>
                {user.status && (
                    <div className="flex items-center shrink-0">
                        {user.status === 'Active' && (
                            <div className="relative inline-flex h-6 items-center justify-center rounded-full bg-emerald-500/20 px-3 text-[9px] font-black uppercase tracking-wider text-emerald-600 border border-emerald-500/30 overflow-hidden group shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                <span className="relative z-10 flex items-center gap-1.5"><ShieldCheck size={11} className="animate-pulse" /> Approved</span>
                                <div className="absolute inset-0 bg-emerald-400/20 w-0 group-hover:w-full transition-all duration-500 ease-out z-0" />
                            </div>
                        )}
                        {user.status === 'Pending Verification' && (
                            <div className="relative inline-flex h-6 items-center justify-center rounded-full bg-amber-500/20 px-3 text-[9px] font-black uppercase tracking-wider text-amber-600 border border-amber-500/30 overflow-hidden group shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                <span className="relative z-10 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" /> Pending</span>
                                <div className="absolute inset-0 bg-amber-400/20 w-0 group-hover:w-full transition-all duration-500 ease-out z-0" />
                            </div>
                        )}
                        {user.status === 'Rejected' && (
                            <div className="relative inline-flex h-6 items-center justify-center rounded-full bg-rose-500/20 px-3 text-[9px] font-black uppercase tracking-wider text-rose-600 border border-rose-500/30 overflow-hidden group shadow-[0_0_10px_rgba(225,29,72,0.2)]">
                                <span className="relative z-10 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Disapproved</span>
                                <div className="absolute inset-0 bg-rose-400/20 w-0 group-hover:w-full transition-all duration-500 ease-out z-0" />
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
