import React from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Calendar, MapPin, Phone, ShieldCheck, QrCode } from 'lucide-react';

interface AdminIDCardProps {
    user: {
        id: string;
        name: string;
        role: string;
        photo?: string;
        location?: string;
        phone?: string;
        memberSince?: string;
    };
}

export const AdminIDCard: React.FC<AdminIDCardProps> = ({ user }) => {
    // Generate a QR code URL for the user's ID
    const qrData = `CITY OF TRUTH MINISTRIES\nID: ${user.id}\nName: ${user.name}\nRole: ${user.role}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}&bgcolor=ffffff&color=2c298c&margin=1`;

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative w-full max-w-[400px] aspect-[2/1] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex"
        >
            {/* Left Section (The "Stub") */}
            <div className="w-1/3 bg-brand-950 text-white p-4 flex flex-col items-center justify-between relative border-r-2 border-dashed border-white/20">
                {/* Perforation Circles */}
                <div className="absolute top-0 right-0 w-4 h-4 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 border border-slate-100 z-10"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-slate-50 rounded-full translate-x-1/2 translate-y-1/2 border border-slate-100 z-10"></div>

                <div className="text-center">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400 mb-1">Pass No.</div>
                    <div className="text-sm font-mono font-bold text-accent-400">#{user.id.split('-').pop()}</div>
                </div>

                <div className="w-16 h-16 bg-white rounded-lg p-1 shadow-inner">
                    <img src={qrCodeUrl} alt="QR" className="w-full h-full object-contain" />
                </div>

                <div className="rotate-[-90deg] whitespace-nowrap origin-center text-[10px] font-black uppercase tracking-[0.3em] text-white/40 absolute left-[-20px] top-1/2 -translate-y-1/2">
                    CITY OF TRUTH
                </div>
            </div>

            {/* Right Section (Main Ticket Body) */}
            <div className="flex-1 p-5 flex flex-col relative">
                {/* Branding Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-bl-full -mr-12 -mt-12 opacity-50"></div>

                <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl border-2 border-brand-100 shadow-sm overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                            {user.photo ? (
                                <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon size={24} className="text-slate-300" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-serif font-black text-brand-950 text-lg leading-tight uppercase truncate max-w-[150px]">
                                {user.name}
                            </h3>
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-accent-50 text-accent-700 rounded-md text-[10px] font-black uppercase tracking-wider mt-1 border border-accent-100">
                                <ShieldCheck size={10} /> {user.role}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-y-3 mt-auto relative z-10">
                    <div className="space-y-0.5">
                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Location</label>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <MapPin size={10} className="text-brand-500" />
                            <span className="truncate">{user.location || 'N/A'}</span>
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Contact</label>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <Phone size={10} className="text-brand-500" />
                            <span className="truncate">{user.phone || 'N/A'}</span>
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Full ID Number</label>
                        <div className="text-[10px] font-mono font-black text-brand-800 bg-brand-50 px-2 py-0.5 rounded border border-brand-100 inline-block">
                            {user.id}
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Member Since</label>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <Calendar size={10} className="text-brand-500" />
                            <span>{user.memberSince || '2024'}</span>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                    <QrCode size={100} />
                </div>
            </div>
        </motion.div>
    );
};
