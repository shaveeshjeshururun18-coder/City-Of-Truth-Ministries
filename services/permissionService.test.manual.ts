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
import { getDoc, setDoc, updateDoc, getDocs } from 'firebase/firestore';

// Mock Firebase
vi.mock('./firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _seconds: Date.now() / 1000 }))
}));

describe('Permission Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCommunicationPermissions', () => {
    it('should return null if the document does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false
      } as any);

      const result = await getCommunicationPermissions('user123');
      expect(result).toBeNull();
    });

    it('should return permission data if the document exists', async () => {
      const mockData = {
        userId: 'user123',
        permissions: {
          createAnnouncements: true,
          sendAnnouncements: false,
          manageContactLists: true
        },
        grantedBy: 'admin123',
        grantedAt: '2023-01-01',
        updatedAt: '2023-01-01'
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'user123',
        data: () => mockData
      } as any);

      const result = await getCommunicationPermissions('user123');
      expect(result).toEqual({
        id: 'user123',
        ...mockData
      });
    });
  });

  describe('updateCommunicationPermissions', () => {
    it('should create new permission document if it does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false
      } as any);

      const result = await updateCommunicationPermissions(
        'user123',
        { createAnnouncements: true },
        'admin123'
      );

      expect(setDoc).toHaveBeenCalled();
      expect(result.permissions.createAnnouncements).toBe(true);
      expect(result.permissions.sendAnnouncements).toBe(false);
      expect(result.permissions.manageContactLists).toBe(false);
      expect(result.grantedBy).toBe('admin123');
    });

    it('should update existing permission document if it exists', async () => {
      const existingData = {
        userId: 'user123',
        permissions: {
          createAnnouncements: true,
          sendAnnouncements: false,
          manageContactLists: false
        },
        grantedBy: 'admin123',
        grantedAt: '2023-01-01',
        updatedAt: '2023-01-01'
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => existingData
      } as any);

      const result = await updateCommunicationPermissions(
        'user123',
        { sendAnnouncements: true },
        'admin123'
      );

      expect(updateDoc).toHaveBeenCalled();
      expect(result.permissions.createAnnouncements).toBe(true);
      expect(result.permissions.sendAnnouncements).toBe(true);
    });
  });

  describe('checkPermission', () => {
    it('should return false if user has no permissions document', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false
      } as any);

      const result = await checkPermission('user123', 'createAnnouncements');
      expect(result).toBe(false);
    });

    it('should return permission value if document exists', async () => {
      const mockData = {
        userId: 'user123',
        permissions: {
          createAnnouncements: true,
          sendAnnouncements: false,
          manageContactLists: false
        }
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'user123',
        data: () => mockData
      } as any);

      expect(await checkPermission('user123', 'createAnnouncements')).toBe(true);

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'user123',
        data: () => mockData
      } as any);
      expect(await checkPermission('user123', 'sendAnnouncements')).toBe(false);
    });
  });

  describe('getAllPermissions', () => {
    it('should return list of all permissions', async () => {
      const mockDocs = [
        { id: 'user1', data: () => ({ userId: 'user1', permissions: {} }) },
        { id: 'user2', data: () => ({ userId: 'user2', permissions: {} }) }
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

  describe('hasAnyCommunicationPermission', () => {
    it('should return false if no permissions document exists', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false
      } as any);

      const result = await hasAnyCommunicationPermission('user123');
      expect(result).toBe(false);
    });

    it('should return true if at least one permission is true', async () => {
      const mockData = {
        userId: 'user123',
        permissions: {
          createAnnouncements: false,
          sendAnnouncements: true,
          manageContactLists: false
        }
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'user123',
        data: () => mockData
      } as any);

      const result = await hasAnyCommunicationPermission('user123');
      expect(result).toBe(true);
    });
  });

  describe('grantPermission and revokePermission', () => {
    it('should grant permission properly', async () => {
      const existingData = {
        userId: 'user123',
        permissions: {
          createAnnouncements: false,
          sendAnnouncements: false,
          manageContactLists: false
        },
        grantedBy: 'admin123',
        grantedAt: '2023-01-01',
        updatedAt: '2023-01-01'
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          ...existingData,
          permissions: { ...existingData.permissions }
        })
      } as any);

      await grantPermission('user123', 'createAnnouncements', 'admin123');
      expect(updateDoc).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
        permissions: expect.objectContaining({ createAnnouncements: true })
      }));
    });

    it('should revoke permission properly', async () => {
      const existingData = {
        userId: 'user123',
        permissions: {
          createAnnouncements: true,
          sendAnnouncements: false,
          manageContactLists: false
        },
        grantedBy: 'admin123',
        grantedAt: '2023-01-01',
        updatedAt: '2023-01-01'
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          ...existingData,
          permissions: { ...existingData.permissions }
        })
      } as any);

      await revokePermission('user123', 'createAnnouncements', 'admin123');
      expect(updateDoc).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
        permissions: expect.objectContaining({ createAnnouncements: false })
      }));
    });
  });
});
