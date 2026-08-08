import { initFirebaseAdmin } from './_firebaseAdmin';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  isoBase64URL,
  isoUint8Array,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type WebAuthnCredential,
} from '@simplewebauthn/server';

export const RP_NAME = 'City of Truth Ministries';
export const RP_ID = process.env.WEBAUTHN_RP_ID || 'city-of-truth-ministries.vercel.app';
export const ORIGIN = process.env.WEBAUTHN_ORIGIN || 'https://city-of-truth-ministries.vercel.app';

export type StoredCredential = {
  id: string;
  publicKey: string;
  counter: number;
  transports?: string[];
  createdAt: string;
};

export function getDb() {
  return initFirebaseAdmin().db;
}

export async function getUser(userId: string) {
  const db = getDb();
  const snap = await db.collection('users').doc(userId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() || {}) } as any;
}

export async function saveChallenge(
  userId: string,
  kind: 'registration' | 'authentication',
  options: PublicKeyCredentialCreationOptionsJSON | PublicKeyCredentialRequestOptionsJSON,
) {
  await getDb().collection('webauthnChallenges').doc(userId).set({
    kind,
    challenge: options.challenge,
    createdAt: Date.now(),
  });
}

export async function consumeChallenge(userId: string, kind: 'registration' | 'authentication') {
  const ref = getDb().collection('webauthnChallenges').doc(userId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('No active WebAuthn challenge. Please try again.');

  const data = snap.data() as any;
  await ref.delete();

  if (data.kind !== kind) throw new Error('WebAuthn challenge type mismatch.');
  if (!data.createdAt || Date.now() - Number(data.createdAt) > 5 * 60 * 1000) {
    throw new Error('WebAuthn challenge expired. Please try again.');
  }

  return String(data.challenge);
}

export function credentialToWebAuthnCredential(credential: StoredCredential): WebAuthnCredential {
  return {
    id: credential.id,
    publicKey: Buffer.from(credential.publicKey, 'base64url'),
    counter: Number(credential.counter || 0),
    transports: credential.transports as any,
  };
}

export async function getStoredCredential(userId: string, credentialId?: string) {
  const user = await getUser(userId);
  const biometrics = user?.biometrics;
  if (!biometrics?.credentialId || !biometrics?.publicKey) return null;
  if (credentialId && biometrics.credentialId !== credentialId) return null;

  return {
    id: String(biometrics.credentialId),
    publicKey: String(biometrics.publicKey),
    counter: Number(biometrics.counter || 0),
    transports: Array.isArray(biometrics.transports) ? biometrics.transports : undefined,
    createdAt: String(biometrics.createdAt || ''),
  } satisfies StoredCredential;
}

export async function createRegistrationOptions(user: any) {
  const existing = user.biometrics?.credentialId
    ? [{
        id: user.biometrics.credentialId,
        transports: user.biometrics.transports,
      }]
    : [];

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userID: isoUint8Array.fromUTF8String(String(user.id)),
    userName: String(user.email || user.id),
    attestationType: 'none',
    excludeCredentials: existing,
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      residentKey: 'required',
      userVerification: 'required',
    },
    preferredAuthenticatorType: 'localDevice',
    supportedAlgorithmIDs: [-7, -257],
  });

  return options;
}

export async function createAuthenticationOptions(user: any) {
  const credential = await getStoredCredential(user.id);
  if (!credential) throw new Error('No biometric credential is registered for this account.');

  return generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: [{
      id: credential.id,
      transports: credential.transports as any,
    }],
    userVerification: 'required',
    preferredAuthenticatorType: 'localDevice',
  });
}

export function publicKeyToBase64url(publicKey: Uint8Array) {
  return Buffer.from(publicKey).toString('base64url');
}

export function credentialIdToString(id: Uint8Array | string) {
  return typeof id === 'string' ? id : isoBase64URL.fromBuffer(id);
}
