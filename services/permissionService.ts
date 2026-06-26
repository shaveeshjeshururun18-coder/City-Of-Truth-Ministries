import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

const PERMISSIONS_COLLECTION = 'communicationPermissions';

/**
 * Permission Service for Advanced Communication System
 * 
 * Manages granular communication permissions for users:
 * - createAnnouncements: Allows user to create announcements
 * - sendAnnouncements: Allows user to send announcements
 * - manageContactLists: Allows user to manage contact lists
 */

// Type for the stored permission document structure
export interface CommunicationPermission {
    id: string;
    userId: string;
    permissions: {
        createAnnouncements: boolean;
        sendAnnouncements: boolean;
        manageContactLists: boolean;
    };
    grantedBy: string;
    grantedAt: string;
    updatedAt: string;
}

/**
 * Get communication permissions for a specific user
 * 
 * @param userId - The user ID to get permissions for
 * @returns CommunicationPermission object or null if no permissions exist
 */
export const getCommunicationPermissions = async (userId: string): Promise<CommunicationPermission | null> => {
    try {
        const permissionDoc = doc(db, PERMISSIONS_COLLECTION, userId);
        const snapshot = await getDoc(permissionDoc);

        if (!snapshot.exists()) {
            return null;
        }

        return {
            id: snapshot.id,
            ...snapshot.data()
        } as CommunicationPermission;
    } catch (error) {
        console.error('Error fetching communication permissions:', error);
        throw error;
    }
};

/**
 * Update communication permissions for a user
 * 
 * @param userId - The user ID to update permissions for
 * @param permissions - Partial permissions object with boolean values
 * @param grantedBy - The admin user ID granting these permissions
 * @returns Updated CommunicationPermission object
 */
export const updateCommunicationPermissions = async (
    userId: string,
    permissions: Partial<CommunicationPermission['permissions']>,
    grantedBy: string
): Promise<CommunicationPermission> => {
    try {
        const permissionDoc = doc(db, PERMISSIONS_COLLECTION, userId);
        const snapshot = await getDoc(permissionDoc);

        const now = new Date().toISOString();

        if (!snapshot.exists()) {
            // Create new permission document
            const newPermission: Omit<CommunicationPermission, 'id'> = {
                userId,
                permissions: {
                    createAnnouncements: permissions.createAnnouncements ?? false,
                    sendAnnouncements: permissions.sendAnnouncements ?? false,
                    manageContactLists: permissions.manageContactLists ?? false,
                },
                grantedBy,
                grantedAt: now,
                updatedAt: now,
            };

            await setDoc(permissionDoc, newPermission);

            return {
                id: userId,
                ...newPermission
            };
        } else {
            // Update existing permission document
            const existingData = snapshot.data() as Omit<CommunicationPermission, 'id'>;
            const updatedPermissions = {
                ...existingData.permissions,
                ...permissions
            };

            const updatedData: Omit<CommunicationPermission, 'id'> = {
                ...existingData,
                permissions: updatedPermissions,
                updatedAt: now,
            };

            await updateDoc(permissionDoc, {
                permissions: updatedPermissions,
                updatedAt: now,
            });

            return {
                id: userId,
                ...updatedData
            };
        }
    } catch (error) {
        console.error('Error updating communication permissions:', error);
        throw error;
    }
};

/**
 * Check if a user has a specific permission
 * 
 * @param userId - The user ID to check
 * @param permission - The permission key to check ('createAnnouncements', 'sendAnnouncements', 'manageContactLists')
 * @returns true if the user has the permission, false otherwise
 */
export const checkPermission = async (
    userId: string,
    permission: keyof CommunicationPermission['permissions']
): Promise<boolean> => {
    try {
        const permissions = await getCommunicationPermissions(userId);

        if (!permissions) {
            return false;
        }

        return permissions.permissions[permission] === true;
    } catch (error) {
        console.error('Error checking permission:', error);
        return false;
    }
};

/**
 * Get all communication permissions for admin view
 * 
 * @returns Array of all CommunicationPermission objects
 */
export const getAllPermissions = async (): Promise<CommunicationPermission[]> => {
    try {
        const permissionsCollection = collection(db, PERMISSIONS_COLLECTION);
        const snapshot = await getDocs(permissionsCollection);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as CommunicationPermission));
    } catch (error) {
        console.error('Error fetching all permissions:', error);
        throw error;
    }
};

/**
 * Check if a user has any communication permission
 * Useful for determining if a non-admin user should see communication features
 * 
 * @param userId - The user ID to check
 * @returns true if the user has at least one communication permission
 */
export const hasAnyCommunicationPermission = async (userId: string): Promise<boolean> => {
    try {
        const permissions = await getCommunicationPermissions(userId);

        if (!permissions) {
            return false;
        }

        return (
            permissions.permissions.createAnnouncements ||
            permissions.permissions.sendAnnouncements ||
            permissions.permissions.manageContactLists
        );
    } catch (error) {
        console.error('Error checking if user has any communication permission:', error);
        return false;
    }
};

/**
 * Grant a specific permission to a user
 * 
 * @param userId - The user ID to grant permission to
 * @param permission - The permission key to grant
 * @param grantedBy - The admin user ID granting the permission
 */
export const grantPermission = async (
    userId: string,
    permission: keyof CommunicationPermission['permissions'],
    grantedBy: string
): Promise<void> => {
    await updateCommunicationPermissions(userId, { [permission]: true }, grantedBy);
};

/**
 * Revoke a specific permission from a user
 * 
 * @param userId - The user ID to revoke permission from
 * @param permission - The permission key to revoke
 * @param grantedBy - The admin user ID revoking the permission
 */
export const revokePermission = async (
    userId: string,
    permission: keyof CommunicationPermission['permissions'],
    grantedBy: string
): Promise<void> => {
    await updateCommunicationPermissions(userId, { [permission]: false }, grantedBy);
};
