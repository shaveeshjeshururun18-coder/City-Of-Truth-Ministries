import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './api';

// Mock Firebase module to avoid network requests
vi.mock('./firebase', () => ({
  db: {},
  storage: {},
  messaging: null,
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ empty: true, docs: [] })),
  doc: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  writeBatch: vi.fn(() => ({
    delete: vi.fn(),
    commit: vi.fn(() => Promise.resolve()),
  })),
}));

vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  listAll: vi.fn(() => Promise.resolve({ items: [], prefixes: [] })),
  deleteObject: vi.fn(),
}));

describe('Complete Reboot API Security Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Clear reboot password environment variable before each test
    vi.stubEnv('VITE_REBOOT_PASSWORD', '');
  });

  it('should fail securely if VITE_REBOOT_PASSWORD is not configured', async () => {
    // Ensure it's not set
    vi.stubEnv('VITE_REBOOT_PASSWORD', '');

    const result = await api.completeReboot('steveharrington');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Complete reboot is not configured on this server/environment.');
  });

  it('should fail securely if incorrect password is provided when configured', async () => {
    vi.stubEnv('VITE_REBOOT_PASSWORD', 'super-secret-reboot-phrase');

    const result = await api.completeReboot('incorrect-password');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid reboot password');
  });

  it('should successfully execute completeReboot when correct password is provided', async () => {
    vi.stubEnv('VITE_REBOOT_PASSWORD', 'super-secret-reboot-phrase');

    const result = await api.completeReboot('super-secret-reboot-phrase');
    expect(result.success).toBe(true);
    expect(result.message).toBe('Complete reboot successful');
  });
});
