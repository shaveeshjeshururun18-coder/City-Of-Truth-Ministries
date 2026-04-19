import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestoreMocks = vi.hoisted(() => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
}));

vi.mock('firebase/firestore', () => firestoreMocks);
vi.mock('../firebase', () => ({ db: { __mockDb: true } }));

import { api } from '../api';

describe('services/api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('getUsers maps firestore docs into user models', async () => {
    firestoreMocks.collection.mockReturnValue('users-ref');
    firestoreMocks.getDocs.mockResolvedValue({
      docs: [
        { id: 'U1', data: () => ({ name: 'One', phone: '1' }) },
        { id: 'U2', data: () => ({ name: 'Two', phone: '2' }) },
      ],
    });

    const users = await api.getUsers();

    expect(firestoreMocks.collection).toHaveBeenCalled();
    expect(firestoreMocks.getDocs).toHaveBeenCalledWith('users-ref');
    expect(users).toEqual([
      { id: 'U1', name: 'One', phone: '1' },
      { id: 'U2', name: 'Two', phone: '2' },
    ]);
  });

  it('getUsers falls back to local server when firestore permission is denied', async () => {
    firestoreMocks.collection.mockReturnValue('users-ref');
    firestoreMocks.getDocs.mockRejectedValue({ code: 'permission-denied' });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 'F1', name: 'Fallback User' }],
    });
    vi.stubGlobal('fetch', fetchMock);

    const users = await api.getUsers();

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:4000/users');
    expect(users).toEqual([{ id: 'F1', name: 'Fallback User' }]);
  });

  it('findUserByPhone falls back to db.json when firestore permission is denied', async () => {
    firestoreMocks.collection.mockReturnValue('users-ref');
    firestoreMocks.query.mockReturnValue('phone-query');
    firestoreMocks.getDocs.mockRejectedValue({ code: 'permission-denied' });

    const user = await api.findUserByPhone('9876543210');

    expect(user).not.toBeNull();
    expect(user?.id).toBe('COT-8859');
    expect(user?.phone).toBe('9876543210');
  });

  it('getMinistries returns ministries sorted by order', async () => {
    firestoreMocks.collection.mockReturnValue('ministries-ref');
    firestoreMocks.getDocs.mockResolvedValue({
      docs: [
        { id: 'm3', data: () => ({ name: 'Third', order: 3 }) },
        { id: 'm1', data: () => ({ name: 'First', order: 1 }) },
        { id: 'm2', data: () => ({ name: 'Second', order: 2 }) },
      ],
    });

    const ministries = await api.getMinistries();

    expect(ministries.map((m) => m.id)).toEqual(['m1', 'm2', 'm3']);
  });
});
