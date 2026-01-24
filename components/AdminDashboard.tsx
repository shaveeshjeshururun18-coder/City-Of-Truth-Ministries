import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, UserCheck, UserX, Clock, Search, Edit2, Trash2, X, Save,
    ChevronLeft, ChevronRight, Filter, Mail, Phone, MapPin, Droplet,
    Calendar, Award, Shield, AlertCircle, CheckCircle, QrCode, Download
} from 'lucide-react';
import { User, UserRole, UserStatus, Testimonial } from '../types';
import { Button } from './Button';
import { api } from '../services/api';
import { MessageSquare, Check, XCircle } from 'lucide-react';
import { EntrustCard3D } from './WorshipperIDCard';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface AdminDashboardProps {
    users: User[];
    onUpdateUser: (user: User) => Promise<void>;
    onDeleteUser: (userId: string) => Promise<void>;
    onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    users,
    onUpdateUser,
    onDeleteUser,
    onBack
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<UserStatus | 'All'>('All');
    const [filterRole, setFilterRole] = useState<UserRole | 'All'>('All');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [viewingQrUser, setViewingQrUser] = useState<User | null>(null);
    const [viewingDetailsUser, setViewingDetailsUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Bulk delete state
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [downloadingCardUserId, setDownloadingCardUserId] = useState<string | null>(null);

    // Testimonials State
    const [activeTab, setActiveTab] = useState<'users' | 'testimonials'>('users');
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

    React.useEffect(() => {
        if (activeTab === 'testimonials') {
            api.getTestimonials().then(setTestimonials);
        }
    }, [activeTab]);

    const handleUpdateTestimonialStatus = async (testimonial: Testimonial, status: 'Approved' | 'Rejected') => {
        try {
            const updated = { ...testimonial, status };
            await api.updateTestimonial(updated);
            setTestimonials(prev => prev.map(t => t.id === testimonial.id ? updated : t));
        } catch (error) {
            console.error('Failed to update testimonial', error);
        }
    };

    const handleDeleteTestimonial = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
        try {
            await api.deleteTestimonial(id);
            setTestimonials(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error('Failed to delete testimonial', error);
        }
    };

    // Statistics
    const stats = useMemo(() => ({
        total: users.length,
        active: users.filter(u => u.status === 'Active').length,
        pending: users.filter(u => u.status === 'Pending Verification').length,
        rejected: users.filter(u => u.status === 'Rejected').length,
    }), [users]);

    // Filtered users
    const filteredUsers = useMemo(() => {
        const filtered = users.filter(user => {
            const matchesSearch = searchQuery === '' ||
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.phone.includes(searchQuery) ||
                user.id.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = filterStatus === 'All' || user.status === filterStatus;
            const matchesRole = filterRole === 'All' || user.role === filterRole;

            return matchesSearch && matchesStatus && matchesRole;
        });

        // Sort by status: Pending first, then Active, then Rejected
        return filtered.sort((a, b) => {
            const statusOrder = { 'Pending Verification': 0, 'Active': 1, 'Rejected': 2 };
            return statusOrder[a.status] - statusOrder[b.status];
        });
    }, [users, searchQuery, filterStatus, filterRole]);

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        setIsLoading(true);
        try {
            await onUpdateUser(editingUser);
            setEditingUser(null);
        } catch (error) {
            alert('Failed to update user');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingUser) return;
        setIsLoading(true);
        try {
            await onDeleteUser(deletingUser.id);
            setDeletingUser(null);
        } catch (error) {
            alert('Failed to delete user');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        setIsLoading(true);
        try {
            const deletePromises = Array.from(selectedUsers).map(userId => onDeleteUser(userId));
            await Promise.all(deletePromises);
            setSelectedUsers(new Set());
            setShowBulkDeleteConfirm(false);
        } catch (error) {
            alert('Failed to delete some users');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelectUser = (userId: string) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedUsers.size === filteredUsers.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const handleDownloadUserCard = async (user: User) => {
        setDownloadingCardUserId(user.id);
        const frontNode = document.getElementById(`admin-card-front-${user.id}`);
        const backNode = document.getElementById(`admin-card-back-${user.id}`);

        if (frontNode && backNode) {
            try {
                const frontDataUrl = await toPng(frontNode, { pixelRatio: 4, quality: 1, backgroundColor: '#ffffff' });
                const backDataUrl = await toPng(backNode, { pixelRatio: 4, quality: 1, backgroundColor: '#ffffff' });

                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4',
                    compress: true
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (215 * pdfWidth) / 340;
                const yPos = (pdf.internal.pageSize.getHeight() - pdfHeight) / 2;

                pdf.addImage(frontDataUrl, 'PNG', 0, yPos > 0 ? yPos : 0, pdfWidth, pdfHeight, undefined, 'FAST');
                pdf.addPage();
                pdf.addImage(backDataUrl, 'PNG', 0, yPos > 0 ? yPos : 0, pdfWidth, pdfHeight, undefined, 'FAST');

                pdf.save(`ENTRUST-CARD-${user.id}.pdf`);
            } catch (err) {
                console.error('PDF generation failed', err);
                alert("Failed to generate PDF. Please try again.");
            }
        }
        setDownloadingCardUserId(null);
    };

    const getStatusColor = (status: UserStatus) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-700 border-green-200';
            case 'Pending Verification': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
            {/* HIDDEN CARD RENDER AREA FOR PDF GENERATION */}
            <div className="fixed left-[-9999px] top-0 pointer-events-none">
                {users.map(user => (
                    <React.Fragment key={user.id}>
                        <div id={`admin-card-front-${user.id}`} className="bg-white">
                            <EntrustCard3D
                                name={user.name}
                                email={user.email}
                                location={user.location}
                                emergency={user.emergency}
                                uniqueId={user.id}
                                memberSince={user.memberSince}
                                photo={user.photo}
                                isStatic={true}
                                isBackSide={false}
                            />
                        </div>
                        <div id={`admin-card-back-${user.id}`} className="bg-white">
                            <EntrustCard3D
                                name={user.name}
                                email={user.email}
                                location={user.location}
                                emergency={user.emergency}
                                uniqueId={user.id}
                                memberSince={user.memberSince}
                                photo={user.photo}
                                isStatic={true}
                                isBackSide={true}
                            />
                        </div>
                    </React.Fragment>
                ))}
            </div>

            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={onBack}
                            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-950">Admin Dashboard</h1>
                            <p className="text-slate-500 mt-1">Manage users and testimonials</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'users'
                                ? 'bg-brand-600 text-white'
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Users size={16} /> Users
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('testimonials')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'testimonials'
                                ? 'bg-brand-600 text-white'
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <MessageSquare size={16} /> Testimonials
                            </div>
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                {activeTab === 'users' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[
                            { label: 'Total Users', value: stats.total, icon: Users, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
                            { label: 'Active Users', value: stats.active, icon: UserCheck, color: 'from-green-500 to-green-600', bg: 'bg-green-50', text: 'text-green-600' },
                            { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-600' },
                            { label: 'Rejected', value: stats.rejected, icon: UserX, color: 'from-red-500 to-red-600', bg: 'bg-red-50', text: 'text-red-600' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                                        <stat.icon size={24} className={stat.text} />
                                    </div>
                                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`}></div>
                                </div>
                                <div className="text-3xl font-bold text-brand-950 mb-1">{stat.value}</div>
                                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {activeTab === 'users' && (
                    <>
                        {/* Search and Filters */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Search */}
                                <div className="flex-1 relative">
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, phone, or ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 transition-colors"
                                    />
                                </div>

                                {/* Status Filter */}
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as UserStatus | 'All')}
                                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 transition-colors"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Pending Verification">Pending</option>
                                    <option value="Rejected">Rejected</option>
                                </select>

                                {/* Role Filter */}
                                <select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value as UserRole | 'All')}
                                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 transition-colors"
                                >
                                    <option value="All">All Roles</option>
                                    <option value="Member">Member</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Ministry Leader">Ministry Leader</option>
                                    <option value="Choir">Choir</option>
                                    <option value="Media Team">Media Team</option>
                                </select>
                            </div>

                            {/* Results count and bulk actions */}
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-slate-500">
                                    Showing {filteredUsers.length} of {users.length} users
                                    {selectedUsers.size > 0 && (
                                        <span className="ml-2 text-brand-600 font-bold">
                                            • {selectedUsers.size} selected
                                        </span>
                                    )}
                                </div>
                                {selectedUsers.size > 0 && (
                                    <button
                                        onClick={() => setShowBulkDeleteConfirm(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                        Delete Selected ({selectedUsers.size})
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Users List - Desktop Table */}
                {activeTab === 'users' && (
                    <div className="hidden lg:block bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-12">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                            />
                                        </th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                                            onClick={() => setViewingDetailsUser(user)}
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.has(user.id)}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSelectUser(user.id);
                                                    }}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold shrink-0">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-brand-950">{user.name}</div>
                                                        <div className="text-xs text-slate-500 font-mono">{user.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="text-sm text-slate-700 flex items-center gap-2">
                                                        <Mail size={14} className="text-slate-400" />
                                                        {user.email}
                                                    </div>
                                                    <div className="text-sm text-slate-700 flex items-center gap-2">
                                                        <Phone size={14} className="text-slate-400" />
                                                        {user.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-bold">
                                                    <Award size={12} />
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(user.status)}`}>
                                                    {user.status === 'Active' && <CheckCircle size={12} />}
                                                    {user.status === 'Pending Verification' && <Clock size={12} />}
                                                    {user.status === 'Rejected' && <AlertCircle size={12} />}
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {new Date(user.joinedDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-2">
                                                    {user.status === 'Pending Verification' && (
                                                        <>
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm(`Approve ${user.name}?`)) {
                                                                        await onUpdateUser({ ...user, status: 'Active' });
                                                                    }
                                                                }}
                                                                className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                                                                title="Approve User"
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm(`Reject ${user.name}?`)) {
                                                                        await onUpdateUser({ ...user, status: 'Rejected' });
                                                                    }
                                                                }}
                                                                className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors"
                                                                title="Reject User"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDownloadUserCard(user)}
                                                        className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors"
                                                        title="Download Entrust Card"
                                                        disabled={downloadingCardUserId === user.id}
                                                    >
                                                        {downloadingCardUserId === user.id ? (
                                                            <div className="animate-spin">⏳</div>
                                                        ) : (
                                                            <Download size={16} />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => setViewingQrUser(user)}
                                                        className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                                                        title="View QR Code"
                                                    >
                                                        <QrCode size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingUser(user)}
                                                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                                        title="Edit user"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingUser(user)}
                                                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                                        title="Delete user"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12">
                                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500 font-medium">No users found</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Users List - Mobile Cards */}
                {activeTab === 'users' && (
                    <div className="lg:hidden space-y-4">
                        {filteredUsers.map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-brand-950">{user.name}</div>
                                            <div className="text-xs text-slate-500 font-mono">{user.id}</div>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(user.status)}`}>
                                        {user.status === 'Active' && <CheckCircle size={10} />}
                                        {user.status}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Mail size={14} className="text-slate-400" />
                                        {user.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Phone size={14} className="text-slate-400" />
                                        {user.phone}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Award size={14} className="text-slate-400" />
                                        {user.role}
                                    </div>
                                </div>

                                {user.status === 'Pending Verification' && (
                                    <div className="flex gap-2 pb-4 mb-4 border-b border-slate-100">
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Approve ${user.name}?`)) {
                                                    await onUpdateUser({ ...user, status: 'Active' });
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl font-medium text-sm hover:bg-green-100 transition-colors"
                                        >
                                            <CheckCircle size={16} />
                                            Approve
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Reject ${user.name}?`)) {
                                                    await onUpdateUser({ ...user, status: 'Rejected' });
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl font-medium text-sm hover:bg-amber-100 transition-colors"
                                        >
                                            <XCircle size={16} />
                                            Reject
                                        </button>
                                    </div>
                                )}
                                <div className="flex gap-2 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => setViewingDetailsUser(user)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl font-medium text-sm hover:bg-green-100 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                        View
                                    </button>
                                    <button
                                        onClick={() => setViewingQrUser(user)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-medium text-sm hover:bg-indigo-100 transition-colors"
                                    >
                                        <QrCode size={16} />
                                        QR
                                    </button>
                                    <button
                                        onClick={() => handleDownloadUserCard(user)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-medium text-sm hover:bg-purple-100 transition-colors"
                                        disabled={downloadingCardUserId === user.id}
                                    >
                                        {downloadingCardUserId === user.id ? (
                                            <div className="animate-spin">⏳</div>
                                        ) : (
                                            <><Download size={16} /> Card</>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setEditingUser(user)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-medium text-sm hover:bg-blue-100 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setDeletingUser(user)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium text-sm hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
                                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500 font-medium">No users found</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Testimonials View */}
                {activeTab === 'testimonials' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {testimonials.map((t) => (
                                <div key={t.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs">
                                                {t.userName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-brand-950">{t.userName}</div>
                                                <div className="text-[10px] text-slate-400">{new Date(t.date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${t.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            t.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                            {t.status}
                                        </span>
                                    </div>

                                    <p className="text-slate-600 text-sm italic mb-6">"{t.content}"</p>

                                    <div className="flex gap-2 border-t border-slate-50 pt-4">
                                        {t.status === 'Pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateTestimonialStatus(t, 'Approved')}
                                                    className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <Check size={14} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateTestimonialStatus(t, 'Rejected')}
                                                    className="flex-1 py-2 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <XCircle size={14} /> Reject
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleDeleteTestimonial(t.id)}
                                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors ml-auto"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {testimonials.length === 0 && (
                                <div className="col-span-full text-center py-12 text-slate-500">
                                    No testimonials found.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingUser && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-brand-950">Edit User</h3>
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Photo Preview */}
                                <div className="flex justify-center mb-6">
                                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                        {editingUser.photo ? (
                                            <img src={editingUser.photo} alt={editingUser.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-bold text-slate-400">{editingUser.name.charAt(0)}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                                        <input
                                            type="text"
                                            value={editingUser.name}
                                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                                        <input
                                            type="email"
                                            value={editingUser.email}
                                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                                        <input
                                            type="tel"
                                            value={editingUser.phone}
                                            onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                                        <input
                                            type="text"
                                            value={editingUser.location}
                                            onChange={(e) => setEditingUser({ ...editingUser, location: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Member Since</label>
                                        <input
                                            type="text"
                                            value={editingUser.memberSince}
                                            onChange={(e) => setEditingUser({ ...editingUser, memberSince: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                                        <select
                                            value={editingUser.role}
                                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500"
                                        >
                                            <option value="Member">Member</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Ministry Leader">Ministry Leader</option>
                                            <option value="Choir">Choir</option>
                                            <option value="Media Team">Media Team</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                                        <select
                                            value={editingUser.status}
                                            onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as UserStatus })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Pending Verification">Pending Verification</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-6">
                                    <button
                                        onClick={() => setEditingUser(null)}
                                        className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={isLoading}
                                        className="flex-1 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} />
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deletingUser && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-brand-950 mb-2">Delete User?</h3>
                                <p className="text-slate-600">
                                    Are you sure you want to delete <strong>{deletingUser.name}</strong>? This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeletingUser(null)}
                                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={18} />
                                    {isLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* QR Code Modal */}
            <AnimatePresence>
                {viewingQrUser && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
                        >
                            <div className="flex justify-end mb-2">
                                <button onClick={() => setViewingQrUser(null)} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600">
                                <QrCode size={32} />
                            </div>

                            <h3 className="text-xl font-bold text-brand-950 mb-1">{viewingQrUser.name}</h3>
                            <p className="text-slate-500 font-mono text-xs mb-6">{viewingQrUser.id}</p>

                            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-slate-200 mb-6 flex justify-center">
                                <img
                                    src={`https://quickchart.io/qr?text=${encodeURIComponent(JSON.stringify({
                                        id: viewingQrUser.id,
                                        name: viewingQrUser.name,
                                        email: viewingQrUser.email,
                                        phone: viewingQrUser.phone,
                                        location: viewingQrUser.location,
                                        emergency: viewingQrUser.emergency || 'N/A',
                                        role: viewingQrUser.role,
                                        status: viewingQrUser.status
                                    }))}&dark=4c51f7&size=200`}
                                    alt="User QR Code"
                                    className="w-48 h-48"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.open(`https://quickchart.io/qr?text=${encodeURIComponent(JSON.stringify({
                                        id: viewingQrUser.id,
                                        name: viewingQrUser.name,
                                        email: viewingQrUser.email,
                                        phone: viewingQrUser.phone,
                                        location: viewingQrUser.location,
                                        emergency: viewingQrUser.emergency || 'N/A',
                                        role: viewingQrUser.role,
                                        status: viewingQrUser.status
                                    }))}&dark=4c51f7&size=400`, '_blank')}
                                    className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors"
                                >
                                    Download
                                </button>
                                <button
                                    onClick={() => setViewingQrUser(null)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Bulk Delete Confirmation Modal */}
            <AnimatePresence>
                {showBulkDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 size={32} className="text-red-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-brand-950 mb-2">Delete {selectedUsers.size} Users?</h3>
                                <p className="text-slate-600">
                                    Are you sure you want to delete {selectedUsers.size} selected user{selectedUsers.size > 1 ? 's' : ''}? This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowBulkDeleteConfirm(false)}
                                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={isLoading}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={18} />
                                    {isLoading ? 'Deleting...' : 'Delete All'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* View Details Modal */}
            <AnimatePresence>
                {viewingDetailsUser && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-brand-950">User Details</h3>
                                    <p className="text-sm text-slate-500 mt-1">Complete member information</p>
                                </div>
                                <button onClick={() => setViewingDetailsUser(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>

                            {/* Profile Section */}
                            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-slate-200">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white overflow-hidden">
                                    {viewingDetailsUser.photo ? (
                                        <img src={viewingDetailsUser.photo} alt={viewingDetailsUser.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-bold">{viewingDetailsUser.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-2xl font-bold text-brand-950 mb-2">{viewingDetailsUser.name}</h4>
                                    <p className="text-sm font-mono text-slate-500 mb-3">{viewingDetailsUser.id}</p>
                                    <div className="flex gap-2">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(viewingDetailsUser.status)}`}>
                                            {viewingDetailsUser.status === 'Active' && <CheckCircle size={12} />}
                                            {viewingDetailsUser.status}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                            <Award size={12} />
                                            {viewingDetailsUser.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <Mail size={16} className="text-slate-400" />
                                        <span className="text-sm text-slate-700">{viewingDetailsUser.email || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <Phone size={16} className="text-slate-400" />
                                        <span className="text-sm text-slate-700">{viewingDetailsUser.phone || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <MapPin size={16} className="text-slate-400" />
                                        <span className="text-sm text-slate-700">{viewingDetailsUser.location || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Member Since</label>
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <Calendar size={16} className="text-slate-400" />
                                        <span className="text-sm text-slate-700">{viewingDetailsUser.memberSince || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Emergency Contact</label>
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <AlertCircle size={16} className="text-slate-400" />
                                        <span className="text-sm text-slate-700">{viewingDetailsUser.emergency || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* QR Code Section in Details */}
                            <div className="mt-8 pt-6 border-t border-slate-200">
                                <h4 className="text-sm font-bold text-brand-950 mb-4 uppercase tracking-wider">Security QR Code</h4>
                                <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                                        <img
                                            src={`https://quickchart.io/qr?text=${encodeURIComponent(JSON.stringify({
                                                id: viewingDetailsUser.id,
                                                name: viewingDetailsUser.name,
                                                role: viewingDetailsUser.role
                                            }))}&dark=4c51f7&size=150`}
                                            alt="User QR Code"
                                            className="w-32 h-32"
                                        />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <p className="text-xs text-slate-500 mb-4">
                                            Scan this code at the sanctuary entrance for digital verification and attendance marking.
                                        </p>
                                        <button
                                            onClick={() => window.open(`https://quickchart.io/qr?text=${encodeURIComponent(JSON.stringify({
                                                id: viewingDetailsUser.id,
                                                name: viewingDetailsUser.name,
                                                email: viewingDetailsUser.email,
                                                phone: viewingDetailsUser.phone,
                                                location: viewingDetailsUser.location,
                                                emergency: viewingDetailsUser.emergency || 'N/A',
                                                role: viewingDetailsUser.role,
                                                status: viewingDetailsUser.status
                                            }))}&dark=4c51f7&size=400`, '_blank')}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-700 rounded-xl font-bold text-xs hover:bg-brand-200 transition-colors"
                                        >
                                            <Download size={14} /> Download HQ QR
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="mt-8 pt-6 border-t border-slate-200">
                                <button
                                    onClick={() => setViewingDetailsUser(null)}
                                    className="w-full px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
