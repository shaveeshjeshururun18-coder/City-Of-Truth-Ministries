import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const password = String(req.body?.password || '').trim();
    const expectedPassword = (process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || 'COTAdmin2026!').trim();

    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    if (password.toLowerCase() === expectedPassword.toLowerCase()) {
      return res.status(200).json({ success: true, message: 'Admin access authorized' });
    } else {
      return res.status(401).json({ success: false, error: 'Incorrect password.' });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Server authentication error.' });
  }
}
