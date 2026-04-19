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
    };
}

export const AdminIDCard: React.FC<AdminIDCardProps> = ({ user }) => {
    const qrData = `CITY OF TRUTH MINISTRIES\nID: ${user.id}\nName: ${user.name}\nRole: ${user.role}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}&bgcolor=dbeafe&color=1d4ed8&margin=2`;

    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="group relative w-full max-w-[380px] bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 rounded-3xl shadow-xl border border-sky-200 overflow-hidden"
        >
            {/* Top Header Bar */}
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 flex items-center justify-between">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-sky-100">City of Truth</p>
                    <p className="text-[11px] font-bold text-white uppercase tracking-widest leading-tight">Ministries</p>
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur px-2.5 py-1 rounded-full border border-white/30">
                    <ShieldCheck size={11} className="text-white" />
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">{user.role}</span>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex gap-4">
                {/* Photo */}
                <div className="shrink-0 flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-sky-100 flex items-center justify-center">
                        {user.photo ? (
                            <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon size={30} className="text-sky-300" />
                        )}
                    </div>
                    {/* QR Code */}
                    <div className="w-16 h-16 bg-white rounded-xl border border-sky-200 shadow-sm p-1 overflow-hidden">
                        <img src={qrCodeUrl} alt="QR" className="w-full h-full object-contain" />
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <h3 className="font-black text-blue-900 text-base leading-tight uppercase truncate">
                            {user.name}
                        </h3>
                        <div className="mt-1 text-[10px] font-mono text-sky-600 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-lg inline-block">
                            ID: {user.id.split('-').pop()}
                        </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-2">
                            <MapPin size={11} className="text-sky-500 shrink-0" />
                            <span className="text-[11px] font-semibold text-blue-800 truncate">{user.location || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={11} className="text-sky-500 shrink-0" />
                            <span className="text-[11px] font-semibold text-blue-800 truncate">{user.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={11} className="text-sky-500 shrink-0" />
                            <span className="text-[11px] font-semibold text-blue-800">Since {user.memberSince || '2024'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Strip */}
            <div className="mx-5 mb-4 bg-white/70 backdrop-blur border border-sky-200 rounded-xl px-3 py-2">
                <p className="text-[9px] font-mono text-sky-500 tracking-widest truncate">
                    {user.id}
                </p>
            </div>

            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-200/40 rounded-full pointer-events-none" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-sky-300/30 rounded-full pointer-events-none" />
        </motion.div>
    );
};
