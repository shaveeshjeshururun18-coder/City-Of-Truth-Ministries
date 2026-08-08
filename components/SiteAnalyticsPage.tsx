import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Globe, Clock, Activity, TrendingUp, Monitor, Smartphone,
    Tablet, UserCheck, UserX, RefreshCw, Eye, Timer
} from 'lucide-react';
import {
    subscribeToVisitorSessions,
    cleanupOldSessions,
    formatDuration,
    formatExactTime,
    VisitorSession
} from '../services/analyticsService';

const PAGE_LABELS: Record<string, string> = {
    '/': 'Home', '#home': 'Home', '#ministry': 'Ministry',
    '#hebrew': 'Hebrew Hub', '#admin': 'Admin', '#user-dashboard': 'Dashboard',
    '#auth': 'Login', '#id-card': 'Registration', '#valparai': 'Valparai', '#contact': 'Contact',
};

function getPageLabel(page: string): string {
    if (!page) return 'Home';
    for (const [key, label] of Object.entries(PAGE_LABELS)) {
        if (page.includes(key)) return label;
    }
    return page.length > 20 ? page.slice(0, 20) + '…' : page;
}

function DeviceIcon({ device }: { device: string }) {
    if (device === 'Mobile') return <Smartphone size={13} className="text-indigo-400" />;
    if (device === 'Tablet') return <Tablet size={13} className="text-purple-400" />;
    return <Monitor size={13} className="text-sky-400" />;
}

function LiveDot({ active }: { active: boolean }) {
    return active ? (
        <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
    ) : (
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300 inline-flex shrink-0" />
    );
}

export default function SiteAnalyticsPage({ users }: { users?: any[] } = {}) {
    const [sessions, setSessions] = useState<VisitorSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'registered' | 'unregistered'>('all');
    const [, setTick] = useState(0);
    const unsubRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        setLoading(true);
        unsubRef.current = subscribeToVisitorSessions((data) => {
            setSessions(data);
            setLoading(false);
        });
        cleanupOldSessions();
        const timer = setInterval(() => setTick(t => t + 1), 5000);
        return () => { unsubRef.current?.(); clearInterval(timer); };
    }, []);

    const activeSessions = sessions.filter(s => s.isActive);
    const registeredSessions = sessions.filter(s => s.isRegistered);
    const unregisteredSessions = sessions.filter(s => !s.isRegistered);
    const avgDuration = sessions.length > 0
        ? Math.round(sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / sessions.length) : 0;

    const deviceCounts = sessions.reduce((acc, s) => { acc[s.device] = (acc[s.device] || 0) + 1; return acc; }, {} as Record<string, number>);

    const topPages = Object.entries(
        sessions.reduce((acc, s) => {
            const label = getPageLabel(s.currentPage);
            acc[label] = (acc[label] || 0) + 1; return acc;
        }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const filtered = sessions.filter(s => {
        if (filter === 'active') return s.isActive;
        if (filter === 'registered') return s.isRegistered;
        if (filter === 'unregistered') return !s.isRegistered;
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Live Analytics</span>
                        </div>
                        <h2 className="text-2xl font-black">Site Visitor Analytics</h2>
                        <p className="text-slate-400 text-sm mt-1">Real-time tracking — registered &amp; guest visitors, session time, pages visited</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-2 text-center">
                            <p className="text-2xl font-black text-emerald-400">{activeSessions.length}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Online Now</p>
                        </div>
                        <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-2 text-center">
                            <p className="text-2xl font-black text-indigo-400">{sessions.length}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total Sessions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Active Registered', value: activeSessions.filter(s => s.isRegistered).length, icon: <UserCheck size={18} />, grad: 'from-emerald-500 to-teal-600' },
                    { label: 'Active Guests', value: activeSessions.filter(s => !s.isRegistered).length, icon: <UserX size={18} />, grad: 'from-amber-500 to-orange-500' },
                    { label: 'Avg. Session Time', value: formatDuration(avgDuration), icon: <Timer size={18} />, grad: 'from-indigo-500 to-blue-600' },
                    { label: 'Total Sessions', value: sessions.length, icon: <TrendingUp size={18} />, grad: 'from-violet-500 to-purple-600' },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.grad} text-white flex items-center justify-center shadow shrink-0`}>{stat.icon}</div>
                        <div>
                            <p className="text-lg font-black text-slate-900">{stat.value}</p>
                            <p className="text-[11px] text-slate-500 font-semibold leading-tight">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Top Pages + Device Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                    <h4 className="font-black text-slate-800 text-sm mb-4 flex items-center gap-2"><Globe size={15} className="text-indigo-500" /> Top Pages Visited</h4>
                    <div className="space-y-3">
                        {topPages.length === 0 ? <p className="text-slate-400 text-xs">No data yet — sessions appear as visitors browse</p> :
                            topPages.map(([page, count], i) => (
                                <div key={page} className="flex items-center gap-3">
                                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className="text-[11px] font-bold text-slate-700 truncate">{page}</span>
                                            <span className="text-[11px] font-black text-indigo-600 ml-2 shrink-0">{count}</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${(count / (topPages[0]?.[1] || 1)) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                    <h4 className="font-black text-slate-800 text-sm mb-4 flex items-center gap-2"><Monitor size={15} className="text-sky-500" /> Devices &amp; Breakdown</h4>
                    <div className="space-y-3 mb-4">
                        {Object.entries(deviceCounts).length === 0
                            ? <p className="text-slate-400 text-xs">No device data yet</p>
                            : Object.entries(deviceCounts).map(([device, count]) => (
                                <div key={device} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2"><DeviceIcon device={device} /><span className="text-[11px] font-bold text-slate-700">{device}</span></div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full" style={{ width: `${sessions.length ? (count / sessions.length) * 100 : 0}%` }} />
                                        </div>
                                        <span className="text-[11px] font-black text-slate-700 w-5 text-right">{count}</span>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Registered vs Guests</p>
                        <div className="flex h-3 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${sessions.length ? (registeredSessions.length / sessions.length) * 100 : 50}%` }} />
                            <div className="bg-gradient-to-r from-amber-400 to-orange-400 flex-1" />
                        </div>
                        <div className="flex justify-between mt-1.5">
                            <span className="text-[10px] font-bold text-emerald-600">✓ Registered: {registeredSessions.length}</span>
                            <span className="text-[10px] font-bold text-amber-600">Guests: {unregisteredSessions.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Session Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Activity size={15} className="text-brand-600" />
                        <h4 className="font-black text-slate-800 text-sm">Live Session Log</h4>
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">{filtered.length}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {(['all', 'active', 'registered', 'unregistered'] as const).map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${filter === f ? 'bg-brand-600 text-white border-brand-600' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-brand-300'}`}>
                                {f === 'all' ? 'All' : f === 'active' ? 'Live' : f === 'registered' ? 'Members' : 'Guests'}
                            </button>
                        ))}
                    </div>
                </div>
                {loading ? (
                    <div className="p-12 text-center"><RefreshCw size={26} className="mx-auto text-slate-300 animate-spin mb-2" /><p className="text-slate-400 text-xs font-semibold">Connecting to live feed...</p></div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center"><Eye size={38} className="mx-auto text-slate-200 mb-3" /><p className="text-slate-400 text-sm font-bold">No sessions yet</p><p className="text-slate-300 text-xs mt-1">Visitors appear here in real time</p></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-slate-50 text-left">
                                    {['Status', 'Visitor', 'Page', 'Entry Time', 'Duration', 'Device'].map(h => (
                                        <th key={h} className="px-4 py-3 font-black text-slate-400 uppercase tracking-wider text-[9px]">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s, idx) => (
                                    <tr key={s.sessionId} className={`border-t border-slate-50 hover:bg-slate-50/80 transition-colors ${s.isActive ? 'bg-emerald-50/20' : ''}`}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <LiveDot active={s.isActive} />
                                                <span className={`text-[9px] font-black uppercase ${s.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>{s.isActive ? 'Live' : 'Left'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${s.isRegistered ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {s.isRegistered ? (s.userName?.charAt(0)?.toUpperCase() || '?') : '?'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-[11px] leading-none mb-0.5">{s.isRegistered ? (s.userName || 'Member') : 'Guest Visitor'}</p>
                                                    <p className={`text-[9px] font-black uppercase ${s.isRegistered ? 'text-emerald-600' : 'text-amber-500'}`}>{s.isRegistered ? `✓ ${s.userRole || 'Member'}` : 'Unregistered'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                                                <Globe size={9} />{getPageLabel(s.currentPage)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-bold text-slate-700 text-[11px]">{formatExactTime(s.entryTime)}</p>
                                            <p className="text-[9px] text-slate-400">Last: {formatExactTime(s.lastSeen)}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <Clock size={9} className="text-slate-400" />
                                                <span className={`font-black text-[11px] ${s.durationSeconds > 300 ? 'text-emerald-600' : 'text-slate-600'}`}>{formatDuration(s.durationSeconds)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1"><DeviceIcon device={s.device} /><span className="text-[10px] text-slate-500 font-semibold">{s.device}</span></div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
