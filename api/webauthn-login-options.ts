import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createAuthenticationOptions, getUser, saveChallenge } from './_webauthn';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const userId = String(req.body?.userId || '').trim();
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const user = await getUser(userId);
    if (!user) return res.status(404).json({ error: 'Member account not found.' });
    if (user.status !== 'Active') return res.status(403).json({ error: 'Your member account is not active.' });

    const options = await createAuthenticationOptions(user);
    await saveChallenge(user.id, 'authentication', options);

    return res.status(200).json(options);
  } catch (error: any) {
    console.error('WebAuthn authentication options error:', error);
    return res.status(400).json({ error: error?.message || 'Could not start biometric login.' });
  }
}
