import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Testimonial, DeletedUser, Permalink } from '../types';
import { ref as storageRef, listAll, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

const USERS_COLLECTION = 'users';
const DELETED_USERS_COLLECTION = 'deleted_users';
const TESTIMONIALS_COLLECTION = 'testimonials';
const PERMALINKS_COLLECTION = 'permalinks';
const BARUCH_VIDEOS_COLLECTION = 'baruch_videos';

export interface BaruchVideo {
    id: string;
    part: number;
    youtubeId: string;
}

export const api = {
    // Fetch all users
    getUsers: async (): Promise<User[]> => {
        try {
            const usersCollection = collection(db, USERS_COLLECTION);
            const snapshot = await getDocs(usersCollection);

            return snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            } as User));
        } catch (error: any) {
            console.error('Firestore Error (Users):', error);

            // Check for permission error (likely expired rules)
            if (error.code === 'permission-denied') {
                console.warn('⚠️ Firestore Permission Denied. Falling back to local db.json...');
                try {
                    const response = await fetch('http://localhost:4000/users');
                    if (response.ok) return await response.json();

                    // Offline fallback if json-server isn't running
                    const localData = await import('../db.json');
                    return (localData.users || []) as User[];
                } catch (e) {
                    console.error('Fallback to db.json failed:', e);
                }
            }
            return [];
        }
    },

    // Fetch Baruch Hashem Videos
    getBaruchVideos: async (): Promise<BaruchVideo[]> => {
        const DEFAULT_BARUCH_VIDEOS: Record<number, string> = {
            1: "4nFxzgqQ_8I",
            2: "1TrWrscz3A8",
            3: "fw61MENxsNQ",
            4: "wOAXgfWii6I",
            5: "_8RjHFb9OTE",
            6: "imGY37JZEUg",
            7: "9cPWFHUgHwk",
            8: "oFrLzVyEfFQ",
            9: "oPus0tBHpnQ",
            10: "sFi2y_w0KLQ",
            11: "Be6kqxrA1Wk",
            12: "OIrMG9VzGqs"
        };

        try {
            const videoCollection = collection(db, BARUCH_VIDEOS_COLLECTION);
            const snapshot = await getDocs(videoCollection);

            let videos = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            } as BaruchVideo));
            
            // If firestore is empty, seed it with defaults
            if (videos.length === 0) {
                const initialVideos: BaruchVideo[] = Array.from({ length: 22 }, (_, i) => {
                    const part = i + 1;
                    return {
                        id: `baruch_${part}`,
                        part,
                        youtubeId: DEFAULT_BARUCH_VIDEOS[part] || ""
                    };
                });
                
                // Seed Firestore in the background
                for (const v of initialVideos) {
                    try {
                        const videoRef = doc(db, BARUCH_VIDEOS_COLLECTION, v.id);
                        await setDoc(videoRef, v);
                    } catch (e) {
                        console.error('Failed to seed firestore video:', e);
                    }
                }
                return initialVideos;
            }
            
            // If firestore contains documents but they are missing the default YouTube IDs for parts 1-12, update them
            let needsUpdate = false;
            const updatedVideos = videos.map(v => {
                const defaultId = DEFAULT_BARUCH_VIDEOS[v.part];
                if (defaultId && !v.youtubeId) {
                    needsUpdate = true;
                    return { ...v, youtubeId: defaultId };
                }
                return v;
            });
            
            if (needsUpdate) {
                // Seed Firestore in the background with the missing default IDs
                for (const v of updatedVideos) {
                    const defaultId = DEFAULT_BARUCH_VIDEOS[v.part];
                    const original = videos.find(o => o.part === v.part);
                    if (defaultId && (!original || !original.youtubeId)) {
                        try {
                            const videoRef = doc(db, BARUCH_VIDEOS_COLLECTION, v.id);
                            await setDoc(videoRef, v);
                        } catch (e) {
                            console.error('Failed to update firestore video with default:', e);
                        }
                    }
                }
                return updatedVideos;
            }
            
            return videos;
        } catch (error: any) {
            console.error('Firestore Error (BaruchVideos):', error);
            // Fallback to local hardcoded defaults
            const fallbackVideos: BaruchVideo[] = Array.from({ length: 22 }, (_, i) => {
                const part = i + 1;
                return {
                    id: `baruch_${part}`,
                    part,
                    youtubeId: DEFAULT_BARUCH_VIDEOS[part] || ""
                };
            });
            return fallbackVideos;
        }
    },

    // Update Baruch Hashem Video
    updateBaruchVideo: async (video: BaruchVideo): Promise<boolean> => {
        try {
            // update in firestore
            const videoRef = doc(db, BARUCH_VIDEOS_COLLECTION, video.id);
            await setDoc(videoRef, video);
            
            // also try to update local json server
            try {
                await fetch(`http://localhost:4000/baruchVideos/${video.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(video)
                });
            } catch (e) {}

            return true;
        } catch (error) {
            console.error("Error updating baruch video:", error);
            
            // local update fallback
            try {
                const res = await fetch(`http://localhost:4000/baruchVideos/${video.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(video)
                });
                return res.ok;
            } catch (e) {}
            
            return false;
        }
    },

    // Create a new user
    createUser: async (user: User): Promise<User> => {
        try {
            const usersCollection = collection(db, USERS_COLLECTION);

            // Use setDoc to preserve the custom generated ID (COT-xxxx)
            const { id, ...userData } = user;
            await setDoc(doc(usersCollection, id), userData);

            return {
                ...userData,
                id: id
            } as User;
        } catch (error: any) {
            console.error('Error creating user:', error);
            if (error.code === 'permission-denied' || error.message?.includes('network')) {
                console.warn('⚠️ Firestore error. Falling back to local json-server...');
                try {
                    const response = await fetch('http://localhost:4000/users', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(user)
                    });
                    if (response.ok) return user;
                } catch (e) {
                    console.error('Fallback create failed:', e);
                }
            }
            throw error;
        }
    },

    // Update an existing user
    updateUser: async (user: User): Promise<User> => {
        try {
            const userDoc = doc(db, USERS_COLLECTION, user.id);

            // Remove id from the data to update
            const { id, ...userData } = user;

            await updateDoc(userDoc, userData);

            return user;
        } catch (error: any) {
            console.error('Error updating user:', error);
            if (error.code === 'permission-denied' || error.message?.includes('network')) {
                console.warn('⚠️ Firestore error. Falling back to local json-server...');
                try {
                    const response = await fetch(`http://localhost:4000/users/${user.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(user)
                    });
                    if (response.ok) return user;
                } catch (e) {
                    console.error('Fallback update failed:', e);
                }
            }
            throw error;
        }
    },

    // Reassign user document ID (e.g., TEMP-* -> COT-xxxx) while preserving data
    reassignUserId: async (oldUserId: string, newUserId: string, userDataOverride?: User): Promise<User> => {
        try {
            if (!oldUserId || !newUserId) {
                throw new Error('Both old and new user IDs are required.');
            }
            if (oldUserId === newUserId) {
                const existing = await api.getUserById(oldUserId);
                if (!existing) throw new Error('User not found.');
                return existing;
            }

            const oldUserDoc = doc(db, USERS_COLLECTION, oldUserId);
            const newUserDoc = doc(db, USERS_COLLECTION, newUserId);

            const [oldSnapshot, newSnapshot] = await Promise.all([
                getDoc(oldUserDoc),
                getDoc(newUserDoc)
            ]);

            if (!oldSnapshot.exists()) {
                throw new Error(`User ${oldUserId} not found.`);
            }
            if (newSnapshot.exists()) {
                throw new Error(`Target ID ${newUserId} is already in use.`);
            }

            const oldUserData = oldSnapshot.data() as Omit<User, 'id'>;
            const mergedUserData = userDataOverride
                ? ((() => {
                    const { id, ...rest } = userDataOverride;
                    return rest;
                })())
                : oldUserData;

            const batch = writeBatch(db);
            batch.set(newUserDoc, mergedUserData);
            batch.delete(oldUserDoc);

            // Log history
            const historyRef = doc(collection(db, 'cotIdHistory'));
            batch.set(historyRef, {
                oldUserId,
                newUserId,
                userName: mergedUserData.name || '',
                timestamp: new Date().toISOString()
            });

            await batch.commit();

            return {
                ...mergedUserData,
                id: newUserId
            } as User;
        } catch (error: any) {
            console.error('Error reassigning user ID:', error);
            if (error.code === 'permission-denied' || error.message?.includes('network') || error.message?.includes('not found') || error.message?.includes('permission')) {
                console.warn('⚠️ Firestore error during reassign. Falling back to local json-server...');
                try {
                    const getRes = await fetch(`http://localhost:4000/users/${oldUserId}`);
                    let oldUser: any;
                    if (getRes.ok) {
                        oldUser = await getRes.json();
                    } else {
                        if (userDataOverride) oldUser = userDataOverride;
                        else throw new Error(`User ${oldUserId} not found in json-server fallback.`);
                    }
                    const mergedData = userDataOverride || { ...oldUser, id: newUserId };

                    const createRes = await fetch(`http://localhost:4000/users`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...mergedData, id: newUserId })
                    });

                    if (createRes.ok) {
                        await fetch(`http://localhost:4000/users/${oldUserId}`, {
                            method: 'DELETE'
                        });

                        // Log history to local fallback
                        try {
                            await fetch(`http://localhost:4000/cotIdHistory`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    id: new Date().getTime().toString() + '_' + Math.random().toString(36).substring(2, 9),
                                    oldUserId,
                                    newUserId,
                                    userName: mergedData.name || '',
                                    timestamp: new Date().toISOString()
                                })
                            });
                        } catch (historyErr) {
                            console.error('Failed to log COT ID history to fallback database:', historyErr);
                        }

                        return { ...mergedData, id: newUserId } as User;
                    }
                } catch (e) {
                    console.error('Fallback reassignment failed:', e);
                }
            }
            throw error;
        }
    },

    getCotIdHistory: async (): Promise<any[]> => {
        try {
            const q = query(collection(db, 'cotIdHistory'));
            const snapshot = await getDocs(q);
            const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return history.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        } catch (error: any) {
            console.warn('⚠️ Firestore error fetching COT ID history. Falling back to local json-server...', error);
            try {
                const res = await fetch(`http://localhost:4000/cotIdHistory`);
                if (res.ok) {
                    const data = await res.json();
                    return data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                }
            } catch (e) {
                console.error('Fallback fetching COT ID history failed:', e);
            }
            return [];
        }
    },

    // Delete a user
    deleteUser: async (userId: string): Promise<void> => {
        try {
            const userDoc = doc(db, USERS_COLLECTION, userId);
            const deletedUserDoc = doc(db, DELETED_USERS_COLLECTION, userId);
            const snapshot = await getDoc(userDoc);
            const now = new Date();
            const autoDeleteAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            const batch = writeBatch(db);

            if (snapshot.exists()) {
                const userData = snapshot.data() as Omit<User, 'id'>;
                batch.set(deletedUserDoc, {
                    ...userData,
                    id: userId,
                    deletedAt: now.toISOString(),
                    autoDeleteAt: autoDeleteAt.toISOString()
                });
            }

            batch.delete(userDoc);
            await batch.commit();
        } catch (error: any) {
            console.error('Error deleting user:', error);
            if (error.code === 'permission-denied' || error.message?.includes('network')) {
                console.warn('⚠️ Firestore error. Falling back to local json-server...');
                try {
                    const response = await fetch(`http://localhost:4000/users/${userId}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) return;
                } catch (e) {
                    console.error('Fallback delete failed:', e);
                }
            }
            throw error;
        }
    },

    // Fetch deleted users and auto-purge expired items
    getDeletedUsers: async (): Promise<DeletedUser[]> => {
        try {
            const nowIso = new Date().toISOString();
            const deletedUsersCollection = collection(db, DELETED_USERS_COLLECTION);

            const expiredQuery = query(deletedUsersCollection, where('autoDeleteAt', '<=', nowIso));
            const expiredSnapshot = await getDocs(expiredQuery);
            if (!expiredSnapshot.empty) {
                const batch = writeBatch(db);
                expiredSnapshot.docs.forEach((expiredDoc) => {
                    batch.delete(doc(db, DELETED_USERS_COLLECTION, expiredDoc.id));
                });
                await batch.commit();
            }

            const snapshot = await getDocs(deletedUsersCollection);
            return snapshot.docs
                .map(doc => ({
                    ...doc.data(),
                    id: doc.id
                } as DeletedUser))
                .sort((a, b) => (b.deletedAt || '').localeCompare(a.deletedAt || ''));
        } catch (error) {
            console.error('Error fetching deleted users:', error);
            return [];
        }
    },

    // Restore user from recycle bin
    restoreDeletedUser: async (userId: string): Promise<void> => {
        try {
            const deletedUserDoc = doc(db, DELETED_USERS_COLLECTION, userId);
            const userDoc = doc(db, USERS_COLLECTION, userId);
            const snapshot = await getDoc(deletedUserDoc);
            if (!snapshot.exists()) return;

            const data = snapshot.data() as DeletedUser;
            const { deletedAt, autoDeleteAt, id, ...userData } = data;

            const batch = writeBatch(db);
            batch.set(userDoc, userData);
            batch.delete(deletedUserDoc);
            await batch.commit();
        } catch (error) {
            console.error('Error restoring deleted user:', error);
            throw error;
        }
    },

    // Permanently delete user from recycle bin
    permanentlyDeleteDeletedUser: async (userId: string): Promise<void> => {
        try {
            const deletedUserDoc = doc(db, DELETED_USERS_COLLECTION, userId);
            await deleteDoc(deletedUserDoc);
        } catch (error) {
            console.error('Error permanently deleting user from recycle bin:', error);
            throw error;
        }
    },

    // Find user by phone (for login)
    findUserByPhone: async (phone: string): Promise<User | null> => {
        try {
            const usersCollection = collection(db, USERS_COLLECTION);
            const q = query(usersCollection, where('phone', '==', phone));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                // Try fallback if empty but phone matches
                return null;
            }

            const doc = snapshot.docs[0];
            return {
                ...doc.data(),
                id: doc.id
            } as User;
        } catch (error: any) {
            console.error('Error finding user:', error);
            if (error.code === 'permission-denied') {
                try {
                    const localData = await import('../db.json');
                    const user = (localData.users as User[]).find((u: User) => u.phone === phone || u.emergency === phone);
                    return user || null;
                } catch (e) {
                    console.error('Fallback failed:', e);
                }
            }
            return null;
        }
    },

    // Find user by ID
    getUserById: async (userId: string): Promise<User | null> => {
        try {
            const userDoc = doc(db, USERS_COLLECTION, userId);
            const snapshot = await getDoc(userDoc);

            if (!snapshot.exists()) return null;

            return {
                ...snapshot.data(),
                id: snapshot.id
            } as User;
        } catch (error: any) {
            console.error('Error getting user:', error);
            if (error.code === 'permission-denied') {
                try {
                    const localData = await import('../db.json');
                    const user = (localData.users as User[]).find((u: User) => u.id === userId);
                    return user || null;
                } catch (e) {
                    console.error('Fallback failed:', e);
                }
            }
            return null;
        }
    },

    // --- Testimonials ---

    // Fetch all testimonials
    getTestimonials: async (): Promise<Testimonial[]> => {
        try {
            const testimonialsCollection = collection(db, TESTIMONIALS_COLLECTION);
            const snapshot = await getDocs(testimonialsCollection);

            return snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            } as Testimonial));
        } catch (error: any) {
            console.error('Firestore Error (Testimonials):', error);
            if (error.code === 'permission-denied') {
                try {
                    // Try local import first for speed and reliability
                    const localData = await import('../db.json');
                    if (localData.testimonials) return localData.testimonials as Testimonial[];

                    const response = await fetch('http://localhost:4000/testimonials');
                    if (response.ok) return await response.json();
                } catch (e) { }
            }
            return [];
        }
    },

    // Create a new testimonial
    createTestimonial: async (testimonial: Omit<Testimonial, 'id'>): Promise<Testimonial> => {
        try {
            const testimonialsCollection = collection(db, TESTIMONIALS_COLLECTION);
            const docRef = await addDoc(testimonialsCollection, testimonial);

            return {
                ...testimonial,
                id: docRef.id
            } as Testimonial;
        } catch (error) {
            console.error('Error creating testimonial:', error);
            throw error;
        }
    },

    // Update a testimonial (e.g., status)
    updateTestimonial: async (testimonial: Testimonial): Promise<Testimonial> => {
        try {
            const testimonialDoc = doc(db, TESTIMONIALS_COLLECTION, testimonial.id);
            const { id, ...data } = testimonial;
            await updateDoc(testimonialDoc, data);
            return testimonial;
        } catch (error) {
            console.error('Error updating testimonial:', error);
            throw error;
        }
    },

    // Delete a testimonial
    deleteTestimonial: async (testimonialId: string): Promise<void> => {
        try {
            const testimonialDoc = doc(db, TESTIMONIALS_COLLECTION, testimonialId);
            await deleteDoc(testimonialDoc);
        } catch (error) {
            console.error('Error deleting testimonial:', error);
            throw error;
        }
    },

    // --- Ministries ---

    // Fetch all ministries (with automatic self-healing database seeding for the 47 gallery assets)
    getMinistries: async (): Promise<any[]> => {
        const getSeedMinistries = () => {
            const assets: any[] = [];
            const categories = [
                'Spiritual Gatherings',
                'Youth Ministry',
                'Community Impact',
                'Helping Hands',
                'Sacred Music & Praise',
                'Healing & Miracle Service'
            ];
            const descriptions = [
                'Deepening our connection with the Divine through prayer and fellowship.',
                'Empowering the next generation to walk in the light of Truth.',
                'Transforming lives and building stronger communities together.',
                'Pure religion and undefiled before God and the Father is this, To visit the fatherless and widows in their affliction...',
                'Celebrating the Word through the beauty of song and worship.',
                'Witnessing the miraculous power of prayer and restoration.'
            ];

            // 40 images
            for (let i = 0; i < 40; i++) {
                const num = i.toString().padStart(4, '0');
                const catIndex = i % 6;
                assets.push({
                    name: `${categories[catIndex]} Moment ${i + 1}`,
                    image: `/ministry/IMG-20231230-WA${num}.jpg`,
                    date: '2023-12-30',
                    category: categories[catIndex],
                    description: descriptions[catIndex],
                    mediaType: 'image',
                    hidden: false,
                    order: i
                });
            }

            // 7 videos
            const videos = [
                'VID-20231226-WA0002.mp4',
                'VID-20231226-WA0005.mp4',
                'VID-20231230-WA0104.mp4',
                'VID-20231230-WA0105.mp4',
                'VID-20231230-WA0107.mp4',
                'VID-20231230-WA0112.mp4',
                'VID-20231230-WA0122.mp4'
            ];

            videos.forEach((vid, i) => {
                const dateStr = vid.split('-')[1];
                const y = dateStr.substring(0, 4);
                const m = dateStr.substring(4, 6);
                const d = dateStr.substring(6, 8);
                const dateVal = `${y}-${m}-${d}`;
                const index = 40 + i;
                const catIndex = index % 6;
                assets.push({
                    name: `${categories[catIndex]} Video ${i + 1}`,
                    image: `/ministry/${vid}`,
                    date: dateVal,
                    category: categories[catIndex],
                    description: descriptions[catIndex],
                    mediaType: 'video',
                    hidden: false,
                    order: index
                });
            });

            return assets;
        };

        try {
            const ministriesCollection = collection(db, 'ministries');
            const snapshot = await getDocs(ministriesCollection);
            let items = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }));
            
            // If database is new/empty (contains less than 5 items), seed all 47 items to Firestore!
            if (items.length <= 3) {
                const seeds = getSeedMinistries();
                for (const seed of seeds) {
                    const exists = items.some((item: any) => item.image === seed.image);
                    if (!exists) {
                        try {
                            const docRef = await addDoc(ministriesCollection, seed);
                            items.push({ ...seed, id: docRef.id });
                        } catch (e) {
                            console.error('Failed to write seed:', e);
                        }
                    }
                }
            }
            
            return items.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
        } catch (error: any) {
            console.error('Firestore Error (Ministries):', error);
            let items: any[] = [];
            try {
                const localData = await import('../db.json');
                if (localData.ministries) items = JSON.parse(JSON.stringify(localData.ministries));
            } catch (e) { }
            
            if (items.length <= 3) {
                const seeds = getSeedMinistries();
                items = [...items, ...seeds.map((s, idx) => ({ ...s, id: `seed-local-${idx}` }))];
            }
            return items.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
        }
    },

    // Create a new ministry
    createMinistry: async (ministry: any): Promise<any> => {
        try {
            const ministriesCollection = collection(db, 'ministries');
            const docRef = await addDoc(ministriesCollection, ministry);
            return { ...ministry, id: docRef.id };
        } catch (error) {
            console.error('Error creating ministry:', error);
            throw error;
        }
    },

    // Update an existing ministry
    updateMinistry: async (ministry: any): Promise<any> => {
        try {
            const ministryDoc = doc(db, 'ministries', ministry.id);
            const { id, ...data } = ministry;
            await updateDoc(ministryDoc, data);
            return ministry;
        } catch (error) {
            console.error('Error updating ministry:', error);
            throw error;
        }
    },

    // Delete a ministry
    deleteMinistry: async (ministryId: string): Promise<void> => {
        try {
            const ministryDoc = doc(db, 'ministries', ministryId);
            await deleteDoc(ministryDoc);
        } catch (error) {
            console.error('Error deleting ministry:', error);
            throw error;
        }
    },

    // Update bulk order of ministries
    updateMinistriesOrder: async (ministries: any[]): Promise<void> => {
        try {
            const batchPromises = ministries.map((m, index) => {
                const ministryDoc = doc(db, 'ministries', m.id);
                return updateDoc(ministryDoc, { order: index });
            });
            await Promise.all(batchPromises);
        } catch (error) {
            console.error('Error updating ministries order:', error);
            throw error;
        }
    },

    // --- Home Layout Configuration ---

    // Fetch the home page section order from Firestore
    getHomeLayout: async (): Promise<string[] | null> => {
        try {
            const layoutDoc = doc(db, 'config', 'home_layout');
            const snapshot = await getDoc(layoutDoc);
            
            if (snapshot.exists()) {
                const data = snapshot.data();
                return data.sections as string[];
            }
            return null;
        } catch (error) {
            console.error('Error fetching home layout:', error);
            return null;
        }
    },

    // Save the home page section order to Firestore
    updateHomeLayout: async (sections: string[]): Promise<void> => {
        try {
            const layoutDoc = doc(db, 'config', 'home_layout');
            await setDoc(layoutDoc, { 
                sections,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (error) {
            console.error('Error updating home layout:', error);
            throw error;
        }
    },

    // --- Navigation Layout Configuration ---

    // Fetch the navigation menu item order from Firestore
    getNavigationLayout: async (): Promise<any[] | null> => {
        try {
            const layoutDoc = doc(db, 'config', 'navigation_layout');
            const snapshot = await getDoc(layoutDoc);
            
            if (snapshot.exists()) {
                const data = snapshot.data();
                return data.items as any[];
            }
            return null;
        } catch (error) {
            console.error('Error fetching navigation layout:', error);
            return null;
        }
    },

    // Save the navigation menu item order to Firestore
    updateNavigationLayout: async (items: any[]): Promise<void> => {
        try {
            const layoutDoc = doc(db, 'config', 'navigation_layout');
            await setDoc(layoutDoc, { 
                items,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (error) {
            console.error('Error updating navigation layout:', error);
            throw error;
        }
    },

    // Fetch the admin dashboard sidebar tab items configuration
    getAdminTabsConfig: async (): Promise<any[]> => {
        try {
            const tabsDoc = doc(db, 'config', 'admin_tabs');
            const snapshot = await getDoc(tabsDoc);
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data.tabs) {
                    return (data.tabs as any[]).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                }
            }
        } catch (error) {
            console.error('Firestore Error (Admin Tabs):', error);
        }
        
        try {
            const saved = localStorage.getItem('cot_admin_tabs_config');
            if (saved) return JSON.parse(saved).sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
        } catch {}
        
        const defaults = [
            { id: 'users', label: 'Users', icon: 'Users', order: 0, hidden: false },
            { id: 'member-forms', label: 'Member Forms', icon: 'FileText', order: 1, hidden: false },
            { id: 'edit-page', label: 'Edit Page', icon: 'Edit2', order: 2, hidden: false },
            { id: 'recycle-bin', label: 'Recycle Bin', icon: 'RotateCcw', order: 3, hidden: false },
            { id: 'firebase', label: 'Firebase', icon: 'Database', order: 4, hidden: false },
            { id: 'messages', label: 'Messages', icon: 'MessageSquare', order: 5, hidden: false },
            { id: 'ministries', label: 'Tab TV + Ministry', icon: 'Globe', order: 6, hidden: false },
            { id: 'id-cards', label: 'ID Cards', icon: 'QrCode', order: 7, hidden: false },
            { id: 'cot-id-manager', label: 'COT ID Manager', icon: 'Dice6', order: 8, hidden: false },
            { id: 'reports', label: 'Monthly Reports', icon: 'FileText', order: 9, hidden: false },
            { id: 'home-layout', label: 'Pages & Sections', icon: 'GripVertical', order: 10, hidden: false },
            { id: 'menu-editor', label: 'Menu Editor', icon: 'Filter', order: 11, hidden: false },
            { id: 'admin-tabs', label: 'Admin Pages', icon: 'Settings', order: 12, hidden: false }
        ];
        return defaults;
    },

    // Save the admin dashboard sidebar tab items configuration
    updateAdminTabsConfig: async (tabs: any[]): Promise<void> => {
        try {
            const tabsDoc = doc(db, 'config', 'admin_tabs');
            await setDoc(tabsDoc, {
                tabs,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (error) {
            console.error('Error updating admin tabs:', error);
        }
        
        try {
            localStorage.setItem('cot_admin_tabs_config', JSON.stringify(tabs));
        } catch {}
    },

    // Fetch the home page sections hidden state from Firestore
    getHomeSectionsHidden: async (): Promise<Record<string, boolean> | null> => {
        try {
            const layoutDoc = doc(db, 'config', 'home_layout');
            const snapshot = await getDoc(layoutDoc);
            
            if (snapshot.exists()) {
                const data = snapshot.data();
                return data.hidden as Record<string, boolean> || null;
            }
            return null;
        } catch (error) {
            console.error('Error fetching home sections hidden:', error);
            return null;
        }
    },

    // Save the home page sections hidden state to Firestore
    updateHomeSectionsHidden: async (hidden: Record<string, boolean>): Promise<void> => {
        try {
            const layoutDoc = doc(db, 'config', 'home_layout');
            await setDoc(layoutDoc, { 
                hidden,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (error) {
            console.error('Error updating home sections hidden:', error);
            throw error;
        }
    },

    // --- Permalinks ---

    // Fetch all permalinks
    getPermalinks: async (): Promise<Permalink[]> => {
        try {
            const permalinksCollection = collection(db, PERMALINKS_COLLECTION);
            const snapshot = await getDocs(permalinksCollection);
            return snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            } as Permalink)).sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        } catch (error: any) {
            console.error('Firestore Error (Permalinks):', error);
            if (error.code === 'permission-denied') {
                try {
                    const saved = localStorage.getItem('cot_permalinks');
                    return saved ? JSON.parse(saved) : [];
                } catch (e) {
                    console.error('Fallback failed:', e);
                }
            }
            return [];
        }
    },

    // Create a new permalink
    createPermalink: async (permalink: Omit<Permalink, 'id' | 'createdAt' | 'updatedAt'>): Promise<Permalink> => {
        try {
            const now = new Date().toISOString();
            const permalinksCollection = collection(db, PERMALINKS_COLLECTION);
            const docRef = await addDoc(permalinksCollection, {
                ...permalink,
                createdAt: now,
                updatedAt: now
            });

            return {
                ...permalink,
                id: docRef.id,
                createdAt: now,
                updatedAt: now
            } as Permalink;
        } catch (error: any) {
            console.error('Error creating permalink:', error);
            if (error.code === 'permission-denied') {
                try {
                    const saved = localStorage.getItem('cot_permalinks');
                    const existing = saved ? JSON.parse(saved) : [];
                    const now = new Date().toISOString();
                    const newPermalink = {
                        ...permalink,
                        id: `PERM-${Date.now()}`,
                        createdAt: now,
                        updatedAt: now
                    };
                    localStorage.setItem('cot_permalinks', JSON.stringify([...existing, newPermalink]));
                    return newPermalink;
                } catch (e) {
                    console.error('Fallback create failed:', e);
                }
            }
            throw error;
        }
    },

    // Update an existing permalink
    updatePermalink: async (permalink: Permalink): Promise<Permalink> => {
        try {
            const permalinkDoc = doc(db, PERMALINKS_COLLECTION, permalink.id);
            const { id, createdAt, ...data } = permalink;
            await updateDoc(permalinkDoc, {
                ...data,
                updatedAt: new Date().toISOString()
            });
            return { ...permalink, updatedAt: new Date().toISOString() };
        } catch (error: any) {
            console.error('Error updating permalink:', error);
            if (error.code === 'permission-denied') {
                try {
                    const saved = localStorage.getItem('cot_permalinks');
                    const existing = saved ? JSON.parse(saved) : [];
                    const updated = existing.map((p: Permalink) => 
                        p.id === permalink.id ? { ...permalink, updatedAt: new Date().toISOString() } : p
                    );
                    localStorage.setItem('cot_permalinks', JSON.stringify(updated));
                    return { ...permalink, updatedAt: new Date().toISOString() };
                } catch (e) {
                    console.error('Fallback update failed:', e);
                }
            }
            throw error;
        }
    },

    // Delete a permalink
    deletePermalink: async (permalinkId: string): Promise<void> => {
        try {
            const permalinkDoc = doc(db, PERMALINKS_COLLECTION, permalinkId);
            await deleteDoc(permalinkDoc);
        } catch (error: any) {
            console.error('Error deleting permalink:', error);
            if (error.code === 'permission-denied') {
                try {
                    const saved = localStorage.getItem('cot_permalinks');
                    const existing = saved ? JSON.parse(saved) : [];
                    const filtered = existing.filter((p: Permalink) => p.id !== permalinkId);
                    localStorage.setItem('cot_permalinks', JSON.stringify(filtered));
                    return;
                } catch (e) {
                    console.error('Fallback delete failed:', e);
                }
            }
            throw error;
        }
    },

    // --- Complete Reboot ---

    // Complete system reboot - deletes all data from Firestore, Storage, and localStorage
    completeReboot: async (password: string): Promise<{ success: boolean; message: string; details?: any }> => {
        const REBOOT_PASSWORD = import.meta.env.VITE_REBOOT_PASSWORD;

        if (!REBOOT_PASSWORD) {
            console.error('Reboot password is not configured.');
            return { success: false, message: 'Reboot password is not configured on the server. Please contact support.' };
        }
        
        if (password !== REBOOT_PASSWORD) {
            return { success: false, message: 'Invalid reboot password' };
        }

        const details = {
            firestoreCollections: [] as string[],
            storageFiles: 0,
            localStorageKeys: [] as string[],
            errors: [] as string[]
        };

        try {
            // 1. Delete all Firestore collections
            const collectionsToDelete = [
                USERS_COLLECTION,
                DELETED_USERS_COLLECTION,
                TESTIMONIALS_COLLECTION,
                PERMALINKS_COLLECTION,
                'ministries',
                'config'
            ];

            for (const collectionName of collectionsToDelete) {
                try {
                    const colRef = collection(db, collectionName);
                    const snapshot = await getDocs(colRef);
                    
                    if (!snapshot.empty) {
                        const batch = writeBatch(db);
                        snapshot.docs.forEach(doc => {
                            batch.delete(doc.ref);
                        });
                        await batch.commit();
                        details.firestoreCollections.push(`${collectionName} (${snapshot.docs.length} documents)`);
                    }
                } catch (error) {
                    details.errors.push(`Failed to delete ${collectionName}: ${error}`);
                }
            }

            // 2. Delete all Firebase Storage files
            try {
                const deleteAllFiles = async (folder: ReturnType<typeof storageRef>) => {
                    const result = await listAll(folder);
                    
                    for (const item of result.items) {
                        try {
                            await deleteObject(item);
                            details.storageFiles++;
                        } catch (error) {
                            details.errors.push(`Failed to delete storage file ${item.fullPath}: ${error}`);
                        }
                    }
                    
                    for (const prefix of result.prefixes) {
                        await deleteAllFiles(prefix);
                    }
                };

                await deleteAllFiles(storageRef(storage, '/'));
            } catch (error) {
                details.errors.push(`Failed to delete storage files: ${error}`);
            }

            // 3. Clear all localStorage data
            try {
                const keysToDelete: string[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('cot_')) {
                        keysToDelete.push(key);
                    }
                }
                
                keysToDelete.forEach(key => {
                    localStorage.removeItem(key);
                    details.localStorageKeys.push(key);
                });
            } catch (error) {
                details.errors.push(`Failed to clear localStorage: ${error}`);
            }

            return {
                success: true,
                message: 'Complete reboot successful',
                details
            };
        } catch (error) {
            return {
                success: false,
                message: `Complete reboot failed: ${error}`,
                details
            };
        }
    }
};
