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
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

// Mock Firebase db
vi.mock('./firebase', () => ({
  db: {}
}));

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn()
}));

describe('Permission Service Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getCommunicationPermissions', () => {
    it('should return null when the permission document does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false
      } as any);

      const result = await getCommunicationPermissions('user-1');
      expect(result).toBeNull();
      expect(getDoc).toHaveBeenCalled();
    });

    it('should return permission details when the permission document exists', async () => {
      const mockData = {
        userId: 'user-1',
        permissions: {
          createAnnouncements: true,
          sendAnnouncements: false,
          manageContactLists: true
        },
        grantedBy: 'admin-1',
        grantedAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'user-1',
        data: () => mockData
      } as any);

      const result = await getCommunicationPermissions('user-1');
      expect(result).toEqual({
        id: 'user-1',
        ...mockData
      });
    });
  });

  describe('updateCommunicationPermissions', () => {
    it('should create a new permission document if it does not already exist', async () => {
      // getDoc returns non-existent
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false
      } as any);

      const result = await updateCommunicationPermissions(
        'user-123',
        { createAnnouncements: true },
        'admin-001'
      );

      expect(setDoc).toHaveBeenCalled();
      expect(result.userId).toBe('user-123');
      expect(result.permissions).toEqual({
        createAnnouncements: true,
        sendAnnouncements: false,
        manageContactLists: false
      });
      expect(result.grantedBy).toBe('admin-001');
    });

    it('should update existing permissions if document already exists', async () => {
      const existingData = {
        userId: 'user-123',
        permissions: {
          createAnnouncements: true,
          sendAnnouncements: false,
          manageContactLists: false
        },
        grantedBy: 'admin-001',
        grantedAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      };

      // getDoc returns existent document
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'user-123',
        data: () => existingData
      } as any);

      const result = await updateCommunicationPermissions(
        'user-123',
        { sendAnnouncements: true },
        'admin-002'
      );

      expect(updateDoc).toHaveBeenCalled();
      expect(result.permissions).toEqual({
        createAnnouncements: true,
        sendAnnouncements: true,
        manageContactLists: false
      });
    });
  });

  describe('checkPermission', () => {
    it('should return false if user has no permission document', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false
      } as any);

      const result = await checkPermission('user-1', 'createAnnouncements');
      expect(result).toBe(false);
    });

    it('should return correct permission status if document exists', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'user-1',
        data: () => ({
          userId: 'user-1',
          permissions: {
            createAnnouncements: true,
            sendAnnouncements: false,
            manageContactLists: false
          }
        })
      } as any);

      const hasCreate = await checkPermission('user-1', 'createAnnouncements');
      expect(hasCreate).toBe(true);

      // Reset mock for the next call inside checkPermission if needed, or getCommunicationPermissions is called again
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'user-1',
        data: () => ({
          userId: 'user-1',
          permissions: {
            createAnnouncements: true,
            sendAnnouncements: false,
            manageContactLists: false
          }
        })
      } as any);

      const hasSend = await checkPermission('user-1', 'sendAnnouncements');
      expect(hasSend).toBe(false);
    });
  });

  describe('getAllPermissions', () => {
    it('should return all permission documents in the collection', async () => {
      const mockDocs = [
        {
          id: 'user-1',
          data: () => ({ userId: 'user-1', permissions: { createAnnouncements: true } })
        },
        {
          id: 'user-2',
          data: () => ({ userId: 'user-2', permissions: { sendAnnouncements: true } })
        }
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: mockDocs
      } as any);

      const result = await getAllPermissions();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('user-1');
      expect(result[1].id).toBe('user-2');
    });
  });

  describe('hasAnyCommunicationPermission', () => {
    it('should return false if user has no permissions at all', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false
      } as any);

      const result = await hasAnyCommunicationPermission('user-1');
      expect(result).toBe(false);
    });

    it('should return true if user has at least one true permission', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'user-1',
        data: () => ({
          userId: 'user-1',
          permissions: {
            createAnnouncements: false,
            sendAnnouncements: false,
            manageContactLists: true
          }
        })
      } as any);

      const result = await hasAnyCommunicationPermission('user-1');
      expect(result).toBe(true);
    });

    it('should return false if all permissions are false', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'user-1',
        data: () => ({
          userId: 'user-1',
          permissions: {
            createAnnouncements: false,
            sendAnnouncements: false,
            manageContactLists: false
          }
        })
      } as any);

      const result = await hasAnyCommunicationPermission('user-1');
      expect(result).toBe(false);
    });
  });

  describe('grantPermission', () => {
    it('should set the specified permission to true', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'user-1',
        data: () => ({
          userId: 'user-1',
          permissions: {
            createAnnouncements: false,
            sendAnnouncements: false,
            manageContactLists: false
          }
        })
      } as any);

      await grantPermission('user-1', 'createAnnouncements', 'admin-001');
      expect(updateDoc).toHaveBeenCalledWith(undefined, {
        permissions: {
          createAnnouncements: true,
          sendAnnouncements: false,
          manageContactLists: false
        },
        updatedAt: expect.any(String)
      });
    });
  });

  describe('revokePermission', () => {
    it('should set the specified permission to false', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'user-1',
        data: () => ({
          userId: 'user-1',
          permissions: {
            createAnnouncements: true,
            sendAnnouncements: true,
            manageContactLists: true
          }
        })
      } as any);

      await revokePermission('user-1', 'manageContactLists', 'admin-001');
      expect(updateDoc).toHaveBeenCalledWith(undefined, {
        permissions: {
          createAnnouncements: true,
          sendAnnouncements: true,
          manageContactLists: false
        },
        updatedAt: expect.any(String)
      });
    });
  });
});
