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

// In-memory mock database
let mockDb: Record<string, any> = {};

// Mock Firebase
vi.mock('./firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn(),
    doc: vi.fn((_db, _collection, id) => ({ id })),
    getDoc: vi.fn(async (docRef) => {
      const id = docRef.id;
      return {
        exists: () => !!mockDb[id],
        id,
        data: () => mockDb[id]
      };
    }),
    getDocs: vi.fn(async () => {
      return {
        docs: Object.keys(mockDb).map(id => ({
          id,
          data: () => mockDb[id]
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
  };
});

describe('Permission Service - Automated Tests', () => {
  beforeEach(() => {
    // Reset our mock database before each test
    mockDb = {};
  });

  it('getCommunicationPermissions returns null for user with no permissions', async () => {
    const result = await getCommunicationPermissions('user-1');
    expect(result).toBeNull();
  });

  it('updateCommunicationPermissions creates new permission document', async () => {
    const userId = 'user-2';
    const grantedBy = 'ADMIN-001';

    const result = await updateCommunicationPermissions(
      userId,
      {
        createAnnouncements: true,
        sendAnnouncements: false,
        manageContactLists: true
      },
      grantedBy
    );

    expect(result.userId).toBe(userId);
    expect(result.permissions.createAnnouncements).toBe(true);
    expect(result.permissions.sendAnnouncements).toBe(false);
    expect(result.permissions.manageContactLists).toBe(true);
    expect(result.grantedBy).toBe(grantedBy);
  });

  it('updateCommunicationPermissions updates existing permissions', async () => {
    const userId = 'user-3';
    const grantedBy = 'ADMIN-001';

    // Create initial permissions
    await updateCommunicationPermissions(
      userId,
      { createAnnouncements: true },
      grantedBy
    );

    // Update permissions
    const result = await updateCommunicationPermissions(
      userId,
      { sendAnnouncements: true },
      grantedBy
    );

    expect(result.permissions.createAnnouncements).toBe(true);
    expect(result.permissions.sendAnnouncements).toBe(true);
    expect(result.permissions.manageContactLists).toBe(false);
  });

  it('checkPermission returns correct boolean values', async () => {
    const userId = 'user-4';
    const grantedBy = 'ADMIN-001';

    await updateCommunicationPermissions(
      userId,
      { createAnnouncements: true },
      grantedBy
    );

    const hasCreate = await checkPermission(userId, 'createAnnouncements');
    const hasSend = await checkPermission(userId, 'sendAnnouncements');

    expect(hasCreate).toBe(true);
    expect(hasSend).toBe(false);
  });

  it('checkPermission returns false for non-existent user', async () => {
    const result = await checkPermission('user-non-existent', 'createAnnouncements');
    expect(result).toBe(false);
  });

  it('hasAnyCommunicationPermission detects permissions correctly', async () => {
    const userId1 = 'user-5';
    const userId2 = 'user-6';
    const grantedBy = 'ADMIN-001';
    
    await updateCommunicationPermissions(
      userId1,
      { createAnnouncements: true },
      grantedBy
    );
    
    const hasPermissions = await hasAnyCommunicationPermission(userId1);
    const noPermissions = await hasAnyCommunicationPermission(userId2);
    
    expect(hasPermissions).toBe(true);
    expect(noPermissions).toBe(false);
  });

  it('grantPermission and revokePermission work correctly', async () => {
    const userId = 'user-7';
    const grantedBy = 'ADMIN-001';
    
    // Grant permission
    await grantPermission(userId, 'createAnnouncements', grantedBy);
    let hasPermission = await checkPermission(userId, 'createAnnouncements');
    expect(hasPermission).toBe(true);
    
    // Revoke permission
    await revokePermission(userId, 'createAnnouncements', grantedBy);
    hasPermission = await checkPermission(userId, 'createAnnouncements');
    expect(hasPermission).toBe(false);
  });

  it('getAllPermissions returns all permission documents', async () => {
    const userId1 = 'user-8';
    const userId2 = 'user-9';
    const grantedBy = 'ADMIN-001';

    await updateCommunicationPermissions(userId1, { createAnnouncements: true }, grantedBy);
    await updateCommunicationPermissions(userId2, { sendAnnouncements: true }, grantedBy);

    const allPermissions = await getAllPermissions();

    expect(allPermissions).toHaveLength(2);
    expect(allPermissions.some(p => p.id === userId1)).toBe(true);
    expect(allPermissions.some(p => p.id === userId2)).toBe(true);
  });
});
