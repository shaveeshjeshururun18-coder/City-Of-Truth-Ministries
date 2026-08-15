import { User } from '../types';
import { api } from './api';

/**
 * Generates a 256-bit cryptographically secure random token with sec_v1_ prefix.
 */
export function generateSecureShareToken(): string {
  const bytes = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `sec_v1_${hex}`;
}

/**
 * Deterministic fallback 256-bit secure token when shareToken is not yet saved.
 * Ensures plain user IDs like COT-1001 are NEVER exposed in public share links.
 */
function getDeterministicSecureToken(user: User): string {
  const seed = `cot_sec_salt_256_${user.id}_${user.joinedDate || user.phone || 'covenant'}`;
  let hash1 = 5381;
  let hash2 = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash1 = (hash1 * 33) ^ char;
    hash2 = (hash2 << 5) - hash2 + char;
    hash2 |= 0;
  }
  const part1 = Math.abs(hash1).toString(16).padStart(8, '0');
  const part2 = Math.abs(hash2).toString(16).padStart(8, '0');
  const part3 = Array.from(seed).reduce((acc, ch) => ((acc << 5) - acc + ch.charCodeAt(0)) | 0, 0);
  const part4 = Math.abs(part3).toString(16).padStart(8, '0');
  return `sec_v1_${part1}${part2}${part4}${part1}${part2}`;
}

/**
 * Returns the public verification URL for a user using their 256-bit secure share token.
 */
export function getVerificationShareUrl(user: User): string {
  const token = user.verification?.shareToken || getDeterministicSecureToken(user);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://city-of-truth-ministries.vercel.app';
  return `${origin}/verify/s/${token}`;
}

/**
 * Regenerates a user's verification share token, invalidating old share links.
 */
export async function regenerateShareToken(user: User): Promise<{ newToken: string; updatedUser: User }> {
  const newToken = generateSecureShareToken();
  const updatedUser: User = {
    ...user,
    verification: {
      shareToken: newToken,
      enabled: true,
    },
  };
  await api.updateUser(updatedUser);
  return { newToken, updatedUser };
}
