// services/analyticsService.ts
// Real-time visitor tracking using Firestore

import { db } from './firebase';
import {
    collection, doc, setDoc, getDoc, getDocs, deleteDoc,
    onSnapshot, query, orderBy, limit, serverTimestamp,
    Timestamp, updateDoc, where
} from 'firebase/firestore';

export interface VisitorSession {
    sessionId: string;
    userId?: string;
    userName?: string;
    userRole?: string;
    isRegistered: boolean;
    currentPage: string;
    entryTime: string;       // ISO string
    lastSeen: string;        // ISO string
    durationSeconds: number;
    device: string;
    userAgent: string;
    isActive: boolean;
}

const SESSIONS_COLLECTION = 'site_visitor_sessions';
const SESSION_KEY = 'cot_visitor_session_id';
const HEARTBEAT_INTERVAL = 15000; // 15s
const SESSION_TIMEOUT = 60;       // 60s — if no heartbeat, mark inactive

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let currentSessionId: string | null = null;

function generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getDevice(): string {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'Mobile';
    if (/tablet|ipad/i.test(ua)) return 'Tablet';
    return 'Desktop';
}

function getCurrentPage(): string {
    const path = window.location.pathname + window.location.hash;
    return path || '/';
}

/**
 * Start a visitor session (call from App.tsx on mount)
 */
export async function startVisitorSession(user?: { id: string; name: string; role: string } | null): Promise<void> {
    try {
        let sessionId = sessionStorage.getItem(SESSION_KEY);
        if (!sessionId) {
            sessionId = generateSessionId();
            sessionStorage.setItem(SESSION_KEY, sessionId);
        }
        currentSessionId = sessionId;

        const sessionData: VisitorSession = {
            sessionId,
            userId: user?.id,
            userName: user?.name,
            userRole: user?.role,
            isRegistered: !!user,
            currentPage: getCurrentPage(),
            entryTime: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            durationSeconds: 0,
            device: getDevice(),
            userAgent: navigator.userAgent.slice(0, 200),
            isActive: true,
        };

        await setDoc(doc(db, SESSIONS_COLLECTION, sessionId), sessionData);

        // Start heartbeat
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        heartbeatTimer = setInterval(() => updateHeartbeat(sessionId!), HEARTBEAT_INTERVAL);

        // Track page changes
        window.addEventListener('hashchange', () => updateCurrentPage(sessionId!));
        window.addEventListener('popstate', () => updateCurrentPage(sessionId!));

        // Mark inactive on page leave
        window.addEventListener('beforeunload', () => endVisitorSession());
    } catch (e) {
        console.warn('Analytics: could not start session', e);
    }
}

async function updateHeartbeat(sessionId: string): Promise<void> {
    try {
        const ref = doc(db, SESSIONS_COLLECTION, sessionId);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;

        const data = snap.data() as VisitorSession;
        const entryTime = new Date(data.entryTime).getTime();
        const durationSeconds = Math.round((Date.now() - entryTime) / 1000);

        await updateDoc(ref, {
            lastSeen: new Date().toISOString(),
            durationSeconds,
            isActive: true,
            currentPage: getCurrentPage(),
        });
    } catch (e) {}
}

async function updateCurrentPage(sessionId: string): Promise<void> {
    try {
        await updateDoc(doc(db, SESSIONS_COLLECTION, sessionId), {
            currentPage: getCurrentPage(),
            lastSeen: new Date().toISOString(),
        });
    } catch (e) {}
}

export async function updateSessionUser(user: { id: string; name: string; role: string }): Promise<void> {
    if (!currentSessionId) return;
    try {
        await updateDoc(doc(db, SESSIONS_COLLECTION, currentSessionId), {
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            isRegistered: true,
        });
    } catch (e) {}
}

export async function endVisitorSession(): Promise<void> {
    if (!currentSessionId) return;
    try {
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        await updateDoc(doc(db, SESSIONS_COLLECTION, currentSessionId), {
            isActive: false,
            lastSeen: new Date().toISOString(),
        });
    } catch (e) {}
}

/**
 * Subscribe to live visitor sessions (admin use)
 */
export function subscribeToVisitorSessions(
    callback: (sessions: VisitorSession[]) => void
): () => void {
    const q = query(collection(db, SESSIONS_COLLECTION), orderBy('lastSeen', 'desc'), limit(200));
    return onSnapshot(q, (snap) => {
        const now = Date.now();
        const sessions: VisitorSession[] = snap.docs.map(d => {
            const data = d.data() as VisitorSession;
            // Mark sessions as inactive if no heartbeat for SESSION_TIMEOUT seconds
            const lastSeen = new Date(data.lastSeen).getTime();
            const secondsSinceLastSeen = (now - lastSeen) / 1000;
            return {
                ...data,
                isActive: secondsSinceLastSeen < SESSION_TIMEOUT,
                durationSeconds: Math.round((now - new Date(data.entryTime).getTime()) / 1000),
            };
        });
        callback(sessions);
    });
}

/**
 * Clean up sessions older than 24 hours
 */
export async function cleanupOldSessions(): Promise<void> {
    try {
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const q = query(
            collection(db, SESSIONS_COLLECTION),
            where('entryTime', '<', cutoff),
            where('isActive', '==', false)
        );
        const snap = await getDocs(q);
        await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    } catch (e) {}
}

export function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m < 60) return `${m}m ${s}s`;
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return `${h}h ${rm}m`;
}

export function formatExactTime(isoString: string): string {
    try {
        return new Date(isoString).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        });
    } catch {
        return isoString;
    }
}
