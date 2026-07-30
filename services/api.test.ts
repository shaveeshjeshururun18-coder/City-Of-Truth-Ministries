import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, BaruchVideo } from './api';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

vi.mock('./firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn()
}));

describe('api.getBaruchVideos Performance Benchmark', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should seed initial videos and measure performance', async () => {
    // Mock getDocs to return empty array so it triggers the seeding flow
    vi.mocked(getDocs).mockResolvedValueOnce({
      empty: true,
      docs: []
    } as any);

    // Mock doc to return dummy document ref
    vi.mocked(doc).mockReturnValue({} as any);

    // Mock setDoc with a small artificial latency to simulate I/O overhead (e.g. 10ms)
    vi.mocked(setDoc).mockImplementation(() => {
      return new Promise((resolve) => setTimeout(resolve, 10));
    });

    const start = performance.now();
    const result = await api.getBaruchVideos();
    const end = performance.now();

    const duration = end - start;
    console.log(`--- BENCHMARK --- Seeding initial videos took ${duration.toFixed(2)}ms`);

    expect(result).toHaveLength(22);
    expect(setDoc).toHaveBeenCalledTimes(22);
  });

  it('should update videos when missing default ids and measure performance', async () => {
    // Return videos that are missing youtubeIds to trigger update loop
    const partialVideos: BaruchVideo[] = Array.from({ length: 22 }, (_, i) => ({
      id: `baruch_${i + 1}`,
      part: i + 1,
      youtubeId: '' // missing youtubeId
    }));

    vi.mocked(getDocs).mockResolvedValueOnce({
      empty: false,
      docs: partialVideos.map(v => ({
        id: v.id,
        data: () => v
      }))
    } as any);

    vi.mocked(doc).mockReturnValue({} as any);

    vi.mocked(setDoc).mockImplementation(() => {
      return new Promise((resolve) => setTimeout(resolve, 10));
    });

    const start = performance.now();
    const result = await api.getBaruchVideos();
    const end = performance.now();

    const duration = end - start;
    console.log(`--- BENCHMARK --- Updating missing video IDs took ${duration.toFixed(2)}ms`);

    expect(result).toHaveLength(22);
    // Should update parts 1-12 (12 videos)
    expect(setDoc).toHaveBeenCalledTimes(12);
  });
});
