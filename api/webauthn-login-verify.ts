import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import {
  ORIGIN,
  RP_ID,
  consumeChallenge,
  credentialToWebAuthnCredential,
  getDb,
  getStoredCredential,
  getUser,
} from './_webauthn';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const userId = String(req.body?.userId || '').trim();
    const response = req.body?.response;
    if (!userId || !response) return res.status(400).json({ error: 'userId and WebAuthn response are required.' });

    const user = await getUser(userId);
    if (!user) return res.status(404).json({ error: 'Member account not found.' });
    if (user.status !== 'Active') return res.status(403).json({ error: 'Your member account is not active.' });

    const storedCredential = await getStoredCredential(user.id, String(response.id || ''));
    if (!storedCredential) return res.status(401).json({ verified: false, error: 'This biometric credential is not registered for this account.' });

    const expectedChallenge = await consumeChallenge(user.id, 'authentication');

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: credentialToWebAuthnCredential(storedCredential),
      requireUserVerification: true,
    });

    if (!verification.verified) {
      return res.status(401).json({ verified: false, error: 'Biometric verification failed.' });
    }

    const { authenticationInfo } = verification;

    await getDb().collection('users').doc(user.id).set({
      'biometrics.counter': authenticationInfo.newCounter,
      'biometrics.lastUsedAt': new Date().toISOString(),
    }, { merge: true });

    // Return only the member profile needed by the existing React app.
    // Never return the password or WebAuthn private material.
    const safeUser = { ...user };
    delete safeUser.password;
    delete safeUser.biometrics?.publicKey;

    return res.status(200).json({
      verified: true,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('WebAuthn authentication verification error:', error);
    return res.status(401).json({ verified: false, error: error?.message || 'Biometric login failed.' });
  }
}
