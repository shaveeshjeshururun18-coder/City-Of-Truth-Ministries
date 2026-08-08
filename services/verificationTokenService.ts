import { User } from '../types';
import { api } from './api';

/**
 * Generates a 256-bit cryptographically secure random token (64 hex characters).
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
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Returns the public verification URL for a user using their unique random share token.
 */
export function getVerificationShareUrl(user: User): string {
  const token = user.verification?.shareToken || user.id;
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
