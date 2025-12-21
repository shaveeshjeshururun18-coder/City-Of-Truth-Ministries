import React, { useState } from 'react';
import { User } from '../types';
import { EntrustCard3D } from './WorshipperIDCard';
import { Download, Edit2, AlertCircle, CheckCircle, Save, X } from 'lucide-react';
import { Button } from './Button';
import { motion } from 'framer-motion';

interface UserDashboardProps {
    user: User;
    onEdit: () => void; // Kept for legacy compatibility if needed, but primary logic is internal now
    onUpdate: (updatedUser: User) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({});

    const handleDownload = () => {
        alert("Downloading your card as a secure PDF...");
    };

    const startEditing = () => {
        setFormData({
            phone: user.phone,
            email: user.email,
            location: user.location,
            bloodGroup: user.bloodGroup,
            emergency: user.emergency,
            photo: user.photo
        });
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setFormData({});
    };

    const saveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate({ ...user, ...formData } as User);
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen pt-32 pb-20 bg-slate-50">
            <div className="container mx-auto px-6">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-serif font-bold text-brand-950">My Dashboard</h1>
                    <p className="text-slate-500 mt-2">Welcome back, {user.name}</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 items-start max-w-5xl mx-auto">

                    {/* Left Col: The Card */}
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <EntrustCard3D
                                name={user.name}
                                email={isEditing ? (formData.email || user.email) : user.email}
                                dob={user.dob}
                                location={isEditing ? (formData.location || user.location) : user.location}
                                bloodGroup={isEditing ? (formData.bloodGroup || user.bloodGroup) : user.bloodGroup}
                                emergency={isEditing ? (formData.emergency || user.emergency) : user.emergency}
                                uniqueId={user.id}
                                role={user.role}
                                memberSince={user.memberSince}
                                photo={isEditing ? (formData.photo || user.photo) : user.photo}
                                className={user.status === 'Pending Verification' ? 'opacity-80 blur-[1px]' : ''}
                            />

                            {user.status === 'Pending Verification' && (
                                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                    <div className="bg-amber-100 text-amber-800 px-6 py-3 rounded-xl border border-amber-200 shadow-xl font-bold uppercase tracking-widest text-sm flex items-center gap-3 transform -rotate-12">
                                        <AlertCircle size={20} /> Pending Verification
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex gap-4 w-full max-w-[320px]">
                            {!isEditing ? (
                                <>
                                    <Button
                                        onClick={handleDownload}
                                        disabled={user.status !== 'Active'}
                                        className="flex-1 py-3 text-xs uppercase tracking-widest shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Download size={16} /> Download
                                    </Button>
                                    <Button
                                        onClick={startEditing}
                                        variant="secondary"
                                        className="flex-1 py-3 text-xs uppercase tracking-widest shadow-sm"
                                    >
                                        <Edit2 size={16} /> Edit Profile
                                    </Button>
                                </>
                            ) : (
                                <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-xl text-center w-full border border-blue-100">
                                    Update your details below. Changes reflect on your card immediately.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Col: Status or Edit Form */}
                    <div className="space-y-8">
                        {isEditing ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-8 rounded-3xl border border-brand-100 shadow-lg"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-lg text-brand-950 flex items-center gap-2">
                                        <Edit2 size={18} className="text-brand-500" /> Edit Details
                                    </h3>
                                    <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-600 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                <form onSubmit={saveChanges} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-brand-500 transition-colors"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-brand-500 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alt. Phone</label>
                                            <input
                                                type="tel"
                                                value={formData.emergency}
                                                onChange={e => setFormData({ ...formData, emergency: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-brand-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-brand-500 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Blood Group</label>
                                            <select
                                                value={formData.bloodGroup}
                                                onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-brand-500 transition-colors"
                                            >
                                                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                                    <option key={bg} value={bg}>{bg}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Photo URL</label>
                                        <input
                                            type="text"
                                            value={formData.photo || ''}
                                            placeholder="https://..."
                                            onChange={e => setFormData({ ...formData, photo: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-brand-500 transition-colors"
                                        />
                                        <p className="text-[10px] text-slate-400">Ideally a square image.</p>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <Button type="button" onClick={cancelEditing} variant="outline" className="flex-1 py-3 text-xs border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700">Cancel</Button>
                                        <Button type="submit" variant="primary" className="flex-1 py-3 text-xs shadow-lg shadow-brand-500/20">
                                            <Save size={16} /> Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <>
                                <div className={`p-8 rounded-3xl border ${user.status === 'Active' ? 'bg-white border-brand-100 shadow-lg' : 'bg-amber-50 border-amber-100'}`}>
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        {user.status === 'Active' ? <CheckCircle className="text-green-500" /> : <AlertCircle className="text-amber-500" />}
                                        Account Status
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                                            <span className="text-sm text-slate-500 font-medium">Verification</span>
                                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-700' :
                                                user.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                                            <span className="text-sm text-slate-500 font-medium">Member ID</span>
                                            <span className="text-sm font-bold text-brand-900 font-mono">{user.id}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                                            <span className="text-sm text-slate-500 font-medium">Ministry Role</span>
                                            <span className="text-sm font-bold text-brand-900">{user.role}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Notifications / Ministry Updates Mock */}
                                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                                    <h3 className="font-bold text-lg mb-4">Ministry Updates</h3>
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-xs font-bold text-brand-500 uppercase mb-1">Upcoming Event</p>
                                            <p className="text-sm font-semibold text-slate-800">Worship Night this Friday at 6 PM.</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-xs font-bold text-brand-500 uppercase mb-1">Announcement</p>
                                            <p className="text-sm font-semibold text-slate-800">New volunteer schedules are out. Please check your email.</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
