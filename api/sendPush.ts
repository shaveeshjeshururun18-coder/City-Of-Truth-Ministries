import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MulticastMessage } from 'firebase-admin/messaging';
import { initFirebaseAdmin } from './_firebaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { tokens, title, body, imageUrl } = req.body || {};

  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
    return res.status(400).json({ success: false, error: 'No device tokens provided' });
  }

  try {
    const { messaging } = initFirebaseAdmin();

    const message: MulticastMessage = {
      tokens: tokens,
      notification: {
        title: title,
        body: body,
        ...(imageUrl ? { imageUrl: imageUrl } : {})
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default'
          }
        }
      }
    };

    const response = await messaging.sendEachForMulticast(message);
    return res.status(200).json({ 
      success: true, 
      successCount: response.successCount, 
      failureCount: response.failureCount 
    });
  } catch (error: any) {
    console.error("Error sending push notification:", error);
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}
