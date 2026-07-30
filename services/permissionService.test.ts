import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getCommunicationPermissions,
    updateCommunicationPermissions,
    checkPermission,
    getAllPermissions,
    hasAnyCommunicationPermission,
    grantPermission,
    revokePermission
} from './permissionService';

// Mock Firebase
vi.mock('./firebase', () => ({
    db: {}
}));

const mockDb: Record<string, any> = {};

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    doc: vi.fn((_db, _col, id) => ({ id })),
    getDoc: vi.fn(async (docRef) => {
        const id = docRef.id;
        if (mockDb[id]) {
            return {
                id,
                exists: () => true,
                data: () => mockDb[id]
            };
        }
        return {
            id,
            exists: () => false,
            data: () => null
        };
    }),
    getDocs: vi.fn(async () => {
        return {
            docs: Object.entries(mockDb).map(([id, data]) => ({
                id,
                data: () => data
            }))
        };
    }),
    setDoc: vi.fn(async (docRef, data) => {
        mockDb[docRef.id] = data;
    }),
    updateDoc: vi.fn(async (docRef, data) => {
        if (mockDb[docRef.id]) {
            mockDb[docRef.id] = {
                ...mockDb[docRef.id],
                ...data
            };
        }
    }),
    serverTimestamp: vi.fn(() => new Date().toISOString())
}));

describe('Permission Service Tests', () => {
    beforeEach(() => {
        // Clear mock database before each test
        for (const key in mockDb) {
            delete mockDb[key];
        }
    });

    it('getCommunicationPermissions returns null for user with no permissions', async () => {
        const testUserId = 'user-new';
        const result = await getCommunicationPermissions(testUserId);
        expect(result).toBeNull();
    });

    it('updateCommunicationPermissions creates new permission document', async () => {
        const testUserId = 'user-create';
        const grantedBy = 'ADMIN-001';
        
        const result = await updateCommunicationPermissions(
            testUserId,
            {
                createAnnouncements: true,
                sendAnnouncements: false,
                manageContactLists: true
            },
            grantedBy
        );
        
        expect(result.userId).toBe(testUserId);
        expect(result.permissions.createAnnouncements).toBe(true);
        expect(result.permissions.sendAnnouncements).toBe(false);
        expect(result.permissions.manageContactLists).toBe(true);
        expect(result.grantedBy).toBe(grantedBy);
    });

    it('updateCommunicationPermissions updates existing permissions', async () => {
        const testUserId = 'user-update';
        const grantedBy = 'ADMIN-001';
        
        // Create initial permissions
        await updateCommunicationPermissions(
            testUserId,
            { createAnnouncements: true },
            grantedBy
        );
        
        // Update permissions
        const result = await updateCommunicationPermissions(
            testUserId,
            { sendAnnouncements: true },
            grantedBy
        );
        
        expect(result.permissions.createAnnouncements).toBe(true);
        expect(result.permissions.sendAnnouncements).toBe(true);
    });

    it('checkPermission returns correct boolean values', async () => {
        const testUserId = 'user-check';
        const grantedBy = 'ADMIN-001';
        
        await updateCommunicationPermissions(
            testUserId,
            { createAnnouncements: true },
            grantedBy
        );
        
        const hasCreate = await checkPermission(testUserId, 'createAnnouncements');
        const hasSend = await checkPermission(testUserId, 'sendAnnouncements');
        
        expect(hasCreate).toBe(true);
        expect(hasSend).toBe(false);
    });

    it('checkPermission returns false for non-existent user', async () => {
        const testUserId = 'user-none';
        const result = await checkPermission(testUserId, 'createAnnouncements');
        expect(result).toBe(false);
    });

    it('hasAnyCommunicationPermission detects permissions correctly', async () => {
        const testUserId1 = 'user-any-1';
        const testUserId2 = 'user-any-2';
        const grantedBy = 'ADMIN-001';
        
        await updateCommunicationPermissions(
            testUserId1,
            { createAnnouncements: true },
            grantedBy
        );
        
        const hasPermissions = await hasAnyCommunicationPermission(testUserId1);
        const noPermissions = await hasAnyCommunicationPermission(testUserId2);
        
        expect(hasPermissions).toBe(true);
        expect(noPermissions).toBe(false);
    });

    it('grantPermission and revokePermission work correctly', async () => {
        const testUserId = 'user-grant-revoke';
        const grantedBy = 'ADMIN-001';
        
        await grantPermission(testUserId, 'createAnnouncements', grantedBy);
        const hasPermissionAfterGrant = await checkPermission(testUserId, 'createAnnouncements');
        expect(hasPermissionAfterGrant).toBe(true);
        
        await revokePermission(testUserId, 'createAnnouncements', grantedBy);
        const hasPermissionAfterRevoke = await checkPermission(testUserId, 'createAnnouncements');
        expect(hasPermissionAfterRevoke).toBe(false);
    });

    it('getAllPermissions returns all permission documents', async () => {
        const testUserId1 = 'user-all-1';
        const testUserId2 = 'user-all-2';
        const grantedBy = 'ADMIN-001';
        
        await updateCommunicationPermissions(testUserId1, { createAnnouncements: true }, grantedBy);
        await updateCommunicationPermissions(testUserId2, { sendAnnouncements: true }, grantedBy);
        
        const allPermissions = await getAllPermissions();
        
        const hasTestUser1 = allPermissions.some(p => p.userId === testUserId1);
        const hasTestUser2 = allPermissions.some(p => p.userId === testUserId2);
        
        expect(hasTestUser1).toBe(true);
        expect(hasTestUser2).toBe(true);
        expect(allPermissions.length).toBeGreaterThanOrEqual(2);
    });
});
