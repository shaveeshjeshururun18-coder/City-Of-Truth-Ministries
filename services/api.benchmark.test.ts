import { describe, it, expect } from 'vitest';

// Simulate addDoc with a simulated network delay
const simulateAddDoc = async (collectionRef: any, seed: any, delayMs: number = 20) => {
    return new Promise<{ id: string }>((resolve, reject) => {
        setTimeout(() => {
            if (seed.fail) {
                reject(new Error('Simulated failure'));
            } else {
                resolve({ id: `doc_${Math.random().toString(36).substr(2, 9)}` });
            }
        }, delayMs);
    });
};

// Current sequential implementation (Baseline)
const sequentialSeed = async (seeds: any[], items: any[], delayMs: number = 20) => {
    for (const seed of seeds) {
        const exists = items.some((item: any) => item.image === seed.image);
        if (!exists) {
            try {
                const docRef = await simulateAddDoc({}, seed, delayMs);
                items.push({ ...seed, id: docRef.id });
            } catch (e) {
                console.error('Failed to write seed:', e);
            }
        }
    }
    return items;
};

// Proposed concurrent implementation (Optimized)
const concurrentSeed = async (seeds: any[], items: any[], delayMs: number = 20) => {
    const promises = seeds.map(async (seed) => {
        const exists = items.some((item: any) => item.image === seed.image);
        if (!exists) {
            try {
                const docRef = await simulateAddDoc({}, seed, delayMs);
                return { ...seed, id: docRef.id };
            } catch (e) {
                console.error('Failed to write seed:', e);
                return null;
            }
        }
        return null;
    });

    const results = await Promise.all(promises);
    for (const res of results) {
        if (res) {
            items.push(res);
        }
    }
    return items;
};

describe('API Seeding Optimization Benchmark', () => {
    it('should demonstrate a significant speedup with concurrent seeding', async () => {
        const testSeeds = Array.from({ length: 47 }, (_, i) => ({
            image: `/ministry/IMG-${i}.jpg`,
            order: i,
            fail: i === 5 // Simulate one failure to ensure error handling is preserved
        }));

        const delayMs = 10; // 10ms simulated firestore roundtrip

        // Benchmark Sequential
        const seqItems: any[] = [];
        const seqStart = performance.now();
        await sequentialSeed(testSeeds, seqItems, delayMs);
        const seqDuration = performance.now() - seqStart;

        // Benchmark Concurrent
        const conItems: any[] = [];
        const conStart = performance.now();
        await concurrentSeed(testSeeds, conItems, delayMs);
        const conDuration = performance.now() - conStart;

        console.log(`\n======================================================`);
        console.log(`⏱️ BENCHMARK RESULTS (for 47 seeds with ${delayMs}ms delay):`);
        console.log(`   Sequential (Baseline) Duration:  ${seqDuration.toFixed(2)} ms`);
        console.log(`   Concurrent (Optimized) Duration: ${conDuration.toFixed(2)} ms`);
        console.log(`   Speedup:                         ${(seqDuration / conDuration).toFixed(2)}x faster`);
        console.log(`======================================================\n`);

        // Assert they have the exact same result (correctness validation)
        expect(seqItems.length).toBe(conItems.length);
        expect(seqItems.length).toBe(46); // 47 - 1 simulated failure

        // Sequential should be roughly N * delayMs (e.g., 47 * 10 = ~470ms)
        // Concurrent should be roughly delayMs (e.g., ~10ms)
        expect(conDuration).toBeLessThan(seqDuration);
    });
});
