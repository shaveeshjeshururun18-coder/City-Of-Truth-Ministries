import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import {
  ORIGIN,
  RP_ID,
  consumeChallenge,
  getDb,
  getUser,
  publicKeyToBase64url,
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
    if (user.biometrics?.credentialId) return res.status(409).json({ error: 'Biometric login is already registered.' });

    const expectedChallenge = await consumeChallenge(user.id, 'registration');

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
      supportedAlgorithmIDs: [-7, -257],
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ verified: false, error: 'Biometric registration could not be verified.' });
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
    const credentialId = credential.id;
    const publicKey = publicKeyToBase64url(credential.publicKey);

    await getDb().collection('users').doc(user.id).set({
      biometrics: {
        credentialId,
        publicKey,
        counter: credential.counter,
        transports: response.response?.transports || credential.transports || [],
        credentialDeviceType,
        credentialBackedUp,
        userVerified: true,
        createdAt: new Date().toISOString(),
      },
    }, { merge: true });

    return res.status(200).json({
      verified: true,
      credentialId,
      message: 'Biometric login enabled successfully.',
    });
  } catch (error: any) {
    console.error('WebAuthn registration verification error:', error);
    return res.status(400).json({ verified: false, error: error?.message || 'Biometric registration failed.' });
  }
}
