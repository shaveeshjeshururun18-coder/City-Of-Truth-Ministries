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
    where
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Testimonial } from '../types';

const USERS_COLLECTION = 'users';
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

    // Delete a user
    deleteUser: async (userId: string): Promise<void> => {
        try {
            const userDoc = doc(db, USERS_COLLECTION, userId);
            await deleteDoc(userDoc);
        } catch (error) {
            console.error('Error deleting user:', error);
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
    }
};
