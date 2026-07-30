import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    getCommunicationPermissions,
    updateCommunicationPermissions,
    checkPermission,
    getAllPermissions,
    hasAnyCommunicationPermission,
    grantPermission,
    revokePermission
} from './permissionService';

// In-memory mock DB to simulate Firestore
let mockDb: Record<string, any> = {};

vi.mock('./firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'communicationPermissions'),
  doc: vi.fn((_db, _collection, id) => ({ id })),
  getDoc: vi.fn((docRef) => ({
    exists: () => !!mockDb[docRef.id],
    id: docRef.id,
    data: () => mockDb[docRef.id]
  })),
  getDocs: vi.fn(() => ({
    docs: Object.keys(mockDb).map(id => ({
      id,
      data: () => mockDb[id]
    }))
  })),
  setDoc: vi.fn((docRef, data) => {
    mockDb[docRef.id] = data;
    return Promise.resolve();
  }),
  updateDoc: vi.fn((docRef, data) => {
    mockDb[docRef.id] = {
      ...mockDb[docRef.id],
      ...data
    };
    return Promise.resolve();
  })
}));

describe('Permission Service Tests', () => {
    beforeEach(() => {
        mockDb = {};
    });

    it('getCommunicationPermissions returns null for user with no permissions', async () => {
        const result = await getCommunicationPermissions('user-1');
        expect(result).toBeNull();
    });

    it('updateCommunicationPermissions creates new permission document', async () => {
        const result = await updateCommunicationPermissions(
            'user-1',
            {
                createAnnouncements: true,
                sendAnnouncements: false,
                manageContactLists: true
            },
            'ADMIN-001'
        );

        expect(result.userId).toBe('user-1');
        expect(result.permissions.createAnnouncements).toBe(true);
        expect(result.permissions.sendAnnouncements).toBe(false);
        expect(result.permissions.manageContactLists).toBe(true);
        expect(result.grantedBy).toBe('ADMIN-001');
    });

    it('updateCommunicationPermissions updates existing permissions', async () => {
        await updateCommunicationPermissions(
            'user-1',
            { createAnnouncements: true },
            'ADMIN-001'
        );

        const result = await updateCommunicationPermissions(
            'user-1',
            { sendAnnouncements: true },
            'ADMIN-001'
        );

        expect(result.permissions.createAnnouncements).toBe(true);
        expect(result.permissions.sendAnnouncements).toBe(true);
    });

    it('checkPermission returns correct boolean values', async () => {
        await updateCommunicationPermissions(
            'user-1',
            { createAnnouncements: true },
            'ADMIN-001'
        );

        const hasCreate = await checkPermission('user-1', 'createAnnouncements');
        const hasSend = await checkPermission('user-1', 'sendAnnouncements');

        expect(hasCreate).toBe(true);
        expect(hasSend).toBe(false);
    });

    it('checkPermission returns false for non-existent user', async () => {
        const result = await checkPermission('user-nonexistent', 'createAnnouncements');
        expect(result).toBe(false);
    });

    it('hasAnyCommunicationPermission detects permissions correctly', async () => {
        await updateCommunicationPermissions(
            'user-1',
            { createAnnouncements: true },
            'ADMIN-001'
        );

        const hasPermissions = await hasAnyCommunicationPermission('user-1');
        const noPermissions = await hasAnyCommunicationPermission('user-2');

        expect(hasPermissions).toBe(true);
        expect(noPermissions).toBe(false);
    });

    it('grantPermission and revokePermission work correctly', async () => {
        await grantPermission('user-1', 'createAnnouncements', 'ADMIN-001');
        let hasPermission = await checkPermission('user-1', 'createAnnouncements');
        expect(hasPermission).toBe(true);

        await revokePermission('user-1', 'createAnnouncements', 'ADMIN-001');
        hasPermission = await checkPermission('user-1', 'createAnnouncements');
        expect(hasPermission).toBe(false);
    });

    it('getAllPermissions returns all permission documents', async () => {
        await updateCommunicationPermissions('user-1', { createAnnouncements: true }, 'ADMIN-001');
        await updateCommunicationPermissions('user-2', { sendAnnouncements: true }, 'ADMIN-001');

        const allPermissions = await getAllPermissions();
        expect(allPermissions).toHaveLength(2);
        expect(allPermissions.some(p => p.userId === 'user-1')).toBe(true);
        expect(allPermissions.some(p => p.userId === 'user-2')).toBe(true);
    });
});
