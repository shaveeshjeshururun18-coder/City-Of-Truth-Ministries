import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './api';

// Mock Firebase
vi.mock('./firebase', () => ({
  db: {},
  storage: {}
}));

let mockItems: any[] = [];
let deleteCallTimes: number[] = [];
let deleteObjectCallsCount = 0;

vi.mock('firebase/storage', () => ({
  ref: vi.fn(() => ({})),
  listAll: vi.fn(() => Promise.resolve({
    items: mockItems,
    prefixes: []
  })),
  deleteObject: vi.fn((_item) => {
    deleteObjectCallsCount++;
    deleteCallTimes.push(Date.now());
    return new Promise<void>((resolve) => {
      // Simulate an asynchronous I/O delay to demonstrate concurrent execution
      setTimeout(resolve, 50);
    });
  })
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ empty: true, docs: [] })),
  doc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false })),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  writeBatch: vi.fn(() => ({
    delete: vi.fn(),
    set: vi.fn(),
    commit: vi.fn(() => Promise.resolve())
  }))
}));

describe('completeReboot performance & correctness tests', () => {
  beforeEach(() => {
    mockItems = [];
    deleteCallTimes = [];
    deleteObjectCallsCount = 0;
    vi.clearAllMocks();
  });

  it('fails with incorrect reboot password', async () => {
    const result = await api.completeReboot('wrong-password');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid reboot password');
  });

  it('correctly processes and counts deleted storage files with Promise.all', async () => {
    mockItems = [
      { fullPath: 'files/1.png' },
      { fullPath: 'files/2.png' },
      { fullPath: 'files/3.png' }
    ];

    const result = await api.completeReboot('steveharrington');

    expect(result.success).toBe(true);
    expect(result.details?.storageFiles).toBe(3);
    expect(deleteObjectCallsCount).toBe(3);
  });

  it('deletes storage files concurrently instead of sequentially', async () => {
    // Generate 10 mock files
    mockItems = Array.from({ length: 10 }, (_, i) => ({
      fullPath: `files/${i}.png`
    }));

    const startTime = Date.now();
    await api.completeReboot('steveharrington');
    const totalTime = Date.now() - startTime;

    // Because each deleteObject call has a 50ms simulated network delay:
    // - Sequential deletion of 10 files would take at least 500ms.
    // - Concurrent deletion (Promise.all) should complete in ~50-100ms.
    // Let's assert that the deletion is faster than sequential execution would be.
    expect(totalTime).toBeLessThan(400);
  });
});
