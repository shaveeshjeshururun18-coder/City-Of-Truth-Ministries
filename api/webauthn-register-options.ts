import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRegistrationOptions, getUser, saveChallenge } from './_webauthn';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const userId = String(req.body?.userId || '').trim();
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const user = await getUser(userId);
    if (!user) return res.status(404).json({ error: 'Member account not found.' });
    if (user.status !== 'Active') return res.status(403).json({ error: 'Your member account is not active.' });
    if (user.biometrics?.credentialId) {
      return res.status(409).json({ error: 'Biometric login is already registered for this account.' });
    }

    const options = await createRegistrationOptions(user);
    await saveChallenge(user.id, 'registration', options);

    return res.status(200).json(options);
  } catch (error: any) {
    console.error('WebAuthn registration options error:', error);
    return res.status(500).json({ error: error?.message || 'Could not start biometric registration.' });
  }
}
