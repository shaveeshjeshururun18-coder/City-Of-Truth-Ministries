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
import { doc, getDoc, getDocs, setDoc, updateDoc, collection } from 'firebase/firestore';

// Mock Firebase
vi.mock('./firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _seconds: Date.now() / 1000 })),
  Timestamp: vi.fn()
}));

describe('Permission Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCommunicationPermissions', () => {
    it('returns null for user with no permissions', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
      } as any);

      const result = await getCommunicationPermissions('test-user-id');
      expect(result).toBeNull();
    });

    it('returns permissions object when it exists', async () => {
      const mockData = {
        userId: 'test-user-id',
        permissions: {
          createAnnouncements: true,
          sendAnnouncements: false,
          manageContactLists: true,
        },
        grantedBy: 'admin-id',
        grantedAt: '2023-01-01',
        updatedAt: '2023-01-01'
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'test-user-id',
        data: () => mockData
      } as any);

      const result = await getCommunicationPermissions('test-user-id');
      expect(result).toEqual({
        id: 'test-user-id',
        ...mockData
      });
    });
  });

  describe('updateCommunicationPermissions', () => {
    it('creates new permission document if none exists', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
      } as any);

      const result = await updateCommunicationPermissions(
        'test-user-id',
        { createAnnouncements: true },
        'admin-id'
      );

      expect(setDoc).toHaveBeenCalled();
      expect(result.userId).toBe('test-user-id');
      expect(result.permissions.createAnnouncements).toBe(true);
      expect(result.permissions.sendAnnouncements).toBe(false);
      expect(result.permissions.manageContactLists).toBe(false);
    });

    it('updates existing permissions while preserving existing values', async () => {
      const mockData = {
        userId: 'test-user-id',
        permissions: {
          createAnnouncements: true,
          sendAnnouncements: false,
          manageContactLists: true,
        },
        grantedBy: 'admin-id',
        grantedAt: '2023-01-01',
        updatedAt: '2023-01-01'
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockData
      } as any);

      const result = await updateCommunicationPermissions(
        'test-user-id',
        { sendAnnouncements: true },
        'admin-id'
      );

      expect(updateDoc).toHaveBeenCalled();
      expect(result.permissions.createAnnouncements).toBe(true);
      expect(result.permissions.sendAnnouncements).toBe(true);
      expect(result.permissions.manageContactLists).toBe(true);
    });
  });

  describe('checkPermission', () => {
    it('returns true if user has specific permission', async () => {
      const mockData = {
        userId: 'test-user-id',
        permissions: {
          createAnnouncements: true,
          sendAnnouncements: false,
          manageContactLists: false,
        }
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'test-user-id',
        data: () => mockData
      } as any);

      const result = await checkPermission('test-user-id', 'createAnnouncements');
      expect(result).toBe(true);
    });

    it('returns false if user does not have specific permission', async () => {
      const mockData = {
        userId: 'test-user-id',
        permissions: {
          createAnnouncements: false,
          sendAnnouncements: false,
          manageContactLists: false,
        }
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'test-user-id',
        data: () => mockData
      } as any);

      const result = await checkPermission('test-user-id', 'createAnnouncements');
      expect(result).toBe(false);
    });

    it('returns false for non-existent user', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
      } as any);

      const result = await checkPermission('test-user-id', 'createAnnouncements');
      expect(result).toBe(false);
    });
  });

  describe('hasAnyCommunicationPermission', () => {
    it('returns true if user has at least one permission', async () => {
      const mockData = {
        userId: 'test-user-id',
        permissions: {
          createAnnouncements: false,
          sendAnnouncements: false,
          manageContactLists: true,
        }
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'test-user-id',
        data: () => mockData
      } as any);

      const result = await hasAnyCommunicationPermission('test-user-id');
      expect(result).toBe(true);
    });

    it('returns false if user has no permissions', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
      } as any);

      const result = await hasAnyCommunicationPermission('test-user-id');
      expect(result).toBe(false);
    });
  });

  describe('grantPermission and revokePermission', () => {
    it('grants specific permission correctly', async () => {
      const mockData = {
        userId: 'test-user-id',
        permissions: {
          createAnnouncements: false,
          sendAnnouncements: false,
          manageContactLists: false,
        }
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockData
      } as any);

      await grantPermission('test-user-id', 'createAnnouncements', 'admin-id');
      expect(updateDoc).toHaveBeenCalled();
    });

    it('revokes specific permission correctly', async () => {
      const mockData = {
        userId: 'test-user-id',
        permissions: {
          createAnnouncements: true,
          sendAnnouncements: false,
          manageContactLists: false,
        }
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockData
      } as any);

      await revokePermission('test-user-id', 'createAnnouncements', 'admin-id');
      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('getAllPermissions', () => {
    it('returns all permission documents', async () => {
      const mockDocs = [
        { id: 'user1', data: () => ({ userId: 'user1', permissions: { createAnnouncements: true } }) },
        { id: 'user2', data: () => ({ userId: 'user2', permissions: { sendAnnouncements: true } }) }
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: mockDocs
      } as any);

      const result = await getAllPermissions();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('user1');
      expect(result[1].id).toBe('user2');
    });
  });
});
