import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

export function initFirebaseAdmin() {
  if (getApps().length > 0) {
    return {
      db: getFirestore(),
      messaging: getMessaging(),
    };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  const missing: string[] = [];
  if (!projectId) missing.push('FIREBASE_PROJECT_ID');
  if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
  if (!rawPrivateKey) missing.push('FIREBASE_PRIVATE_KEY');

  if (missing.length > 0) {
    throw new Error(`Missing required Firebase Admin environment variable(s): ${missing.join(', ')}`);
  }

  // Clean the private key: strip wrapping quotes if present, replace escaped \\n with actual newlines
  const privateKey = rawPrivateKey
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\\n/g, '\n');

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return {
    db: getFirestore(),
    messaging: getMessaging(),
  };
}
