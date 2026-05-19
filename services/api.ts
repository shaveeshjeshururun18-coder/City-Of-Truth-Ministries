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
import { User, Testimonial, DeletedUser } from '../types';

const USERS_COLLECTION = 'users';
const DELETED_USERS_COLLECTION = 'deleted_users';
const TESTIMONIALS_COLLECTION = 'testimonials';

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
        } catch (error) {
            console.error('Error creating user:', error);
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
        } catch (error) {
            console.error('Error updating user:', error);
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
            await batch.commit();

            return {
                ...mergedUserData,
                id: newUserId
            } as User;
        } catch (error) {
            console.error('Error reassigning user ID:', error);
            throw error;
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
        } catch (error) {
            console.error('Error deleting user:', error);
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

    // Fetch all ministries
    getMinistries: async (): Promise<any[]> => {
        try {
            const ministriesCollection = collection(db, 'ministries');
            const snapshot = await getDocs(ministriesCollection);
            return snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })).sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
        } catch (error: any) {
            console.error('Firestore Error (Ministries):', error);
            if (error.code === 'permission-denied') {
                try {
                    const localData = await import('../db.json');
                    if (localData.ministries) return localData.ministries as any[];

                    const response = await fetch('http://localhost:4000/ministries');
                    if (response.ok) return await response.json();
                } catch (e) { }
            }
            return [];
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
    }
};
