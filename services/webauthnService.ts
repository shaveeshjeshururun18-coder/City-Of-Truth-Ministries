import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { User } from '../types';

/**
 * Registers Fingerprint biometric authentication for a user account.
 */
export async function registerBiometricPasskey(userId: string): Promise<{ verified: boolean; credentialId: string; message: string }> {
  // 1. Get registration options from backend
  const optionsRes = await fetch('/api/webauthn-register-options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });

  const optionsData = await optionsRes.json();
  if (!optionsRes.ok) {
    throw new Error(optionsData?.error || 'Failed to start Fingerprint registration.');
  }

  // 2. Trigger browser native Fingerprint prompt
  const attestationResponse = await startRegistration({ optionsJSON: optionsData });

  // 3. Send WebAuthn response to backend verification endpoint
  const verifyRes = await fetch('/api/webauthn-register-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      response: attestationResponse,
    }),
  });

  const verifyData = await verifyRes.json();
  if (!verifyRes.ok || !verifyData.verified) {
    throw new Error(verifyData?.error || 'Fingerprint verification failed.');
  }

  return {
    ...verifyData,
    message: 'Fingerprint registered successfully! You can now log in using your Fingerprint.',
  };
}

/**
 * Authenticates user via Fingerprint biometric verification.
 */
export async function loginWithBiometricPasskey(userId: string): Promise<User> {
  // 1. Get authentication options from backend
  const optionsRes = await fetch('/api/webauthn-login-options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });

  const optionsData = await optionsRes.json();
  if (!optionsRes.ok) {
    throw new Error(optionsData?.error || 'Failed to start Fingerprint login.');
  }

  // 2. Trigger browser native Fingerprint authentication prompt
  const assertionResponse = await startAuthentication({ optionsJSON: optionsData });

  // 3. Send WebAuthn assertion response to backend verification endpoint
  const verifyRes = await fetch('/api/webauthn-login-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      response: assertionResponse,
    }),
  });

  const verifyData = await verifyRes.json();
  if (!verifyRes.ok || !verifyData.verified || !verifyData.user) {
    throw new Error(verifyData?.error || 'Fingerprint authentication failed.');
  }

  return verifyData.user;
}
