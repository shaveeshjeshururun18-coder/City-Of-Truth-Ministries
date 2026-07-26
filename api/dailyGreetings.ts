import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MulticastMessage } from 'firebase-admin/messaging';
import { initFirebaseAdmin } from './_firebaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS & Header configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Verify CRON_SECRET configuration and request authorization header
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    console.error('CRON_SECRET environment variable is missing on server');
    return res.status(500).json({
      success: false,
      error: 'CRON_SECRET environment variable is not configured on Vercel.'
    });
  }

  const authHeader = req.headers.authorization || '';
  const querySecret = typeof req.query?.secret === 'string' ? req.query.secret : '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

  if (token !== expectedSecret && querySecret !== expectedSecret) {
    console.warn('Unauthorized cron attempt to /api/dailyGreetings');
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or missing authorization token' });
  }

  try {
    // 2. Initialize Firebase Admin safely
    let db, messaging;
    try {
      const fbAdmin = initFirebaseAdmin();
      db = fbAdmin.db;
      messaging = fbAdmin.messaging;
    } catch (fbErr: any) {
      console.error('Firebase Admin initialization failed:', fbErr.message);
      return res.status(500).json({
        success: false,
        error: `Firebase Admin configuration error: ${fbErr.message}`
      });
    }

    // 3. Check if daily greeting setting is enabled (defaults to enabled if doc doesn't exist yet)
    let settings = { enabled: true, imageUrl: undefined };
    try {
      const settingsDoc = await db.collection('settings').doc('dailyGreeting').get();
      if (settingsDoc.exists) {
        settings = settingsDoc.data() as any;
      }
    } catch (dbErr: any) {
      console.warn('Could not fetch dailyGreeting settings, using defaults:', dbErr.message);
    }

    if (settings && settings.enabled === false) {
      return res.status(200).json({ success: true, message: 'Daily greetings are currently disabled in settings.' });
    }

    // 4. Determine time of day and appropriate greeting
    // Handles UTC+2 (winter) and UTC+3 (summer) Israel Time offsets
    const force = req.query?.force === 'true' || req.query?.force === '1';
    const reqGreeting = req.query?.greeting as string | undefined;

    let jerusalemHour = 8; // Default to morning if calculation fails
    try {
      jerusalemHour = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' })).getHours();
    } catch (tzErr) {
      console.warn('Timezone calculation fallback used:', tzErr);
    }

    let title = 'City of Truth Ministries';
    let body = '';
    let greetingType = '';

    if (reqGreeting === 'boker' || (jerusalemHour >= 4 && jerusalemHour <= 9)) {
      greetingType = 'BOKER TOV';
      title = 'בוקר טוב (BOKER TOV)';
      body = 'May your day be filled with peace, wisdom, strength, and abundant blessings.';
    } else if (reqGreeting === 'tzoharaim' || (jerusalemHour >= 10 && jerusalemHour <= 15)) {
      greetingType = 'TZOHARAIM TOVIM';
      title = 'צהריים טובים (TZOHARAIM TOVIM)';
      body = "May your afternoon be productive, peaceful, and filled with God's favor.";
    } else if (reqGreeting === 'erev' || (jerusalemHour >= 16 && jerusalemHour <= 19)) {
      greetingType = 'EREV TOV';
      title = 'ערב טוב (EREV TOV)';
      body = 'May your evening bring peace, gratitude, and joyful fellowship.';
    } else if (reqGreeting === 'laila' || jerusalemHour >= 20 || jerusalemHour <= 3) {
      greetingType = 'LAILA TOV';
      title = 'לילה טוב (LAILA TOV)';
      body = 'May the Lord watch over you through the night and grant you peaceful rest.';
    }

    // Fallback if greeting type is undefined and not forced
    if (!greetingType && !force) {
      greetingType = 'BLESSING';
      title = 'ברכות (SHALOM & BLESSINGS)';
      body = 'May the Lord bless you and keep you, and make His face shine upon you today.';
    }

    // 5. Fetch all users who have FCM tokens
    const usersSnapshot = await db.collection('users').get();
    const allTokens: string[] = [];

    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.fcmTokens && Array.isArray(data.fcmTokens)) {
        data.fcmTokens.forEach((token: string) => {
          if (token && typeof token === 'string' && token.trim() !== '') {
            allTokens.push(token);
          }
        });
      }
    });

    if (allTokens.length === 0) {
      return res.status(200).json({
        success: true,
        greeting: greetingType,
        message: 'No users with active FCM tokens found in database.'
      });
    }

    // 6. Send push notifications (Chunked in batches of 500 max per Firebase limits)
    const maxChunkSize = 500;
    let totalSuccess = 0;
    let totalFailures = 0;

    for (let i = 0; i < allTokens.length; i += maxChunkSize) {
      const tokenChunk = allTokens.slice(i, i + maxChunkSize);

      const message: MulticastMessage = {
        tokens: tokenChunk,
        notification: {
          title: title,
          body: body,
          ...(settings?.imageUrl ? { imageUrl: settings.imageUrl } : {})
        },
        android: {
          priority: 'high'
        }
      };

      try {
        const response = await messaging.sendEachForMulticast(message);
        totalSuccess += response.successCount;
        totalFailures += response.failureCount;
      } catch (err: any) {
        console.error('Error sending daily greeting chunk:', err);
      }
    }

    return res.status(200).json({
      success: true,
      greeting: greetingType,
      message: `Daily greetings (${greetingType}) sent! Success: ${totalSuccess}, Failures: ${totalFailures}`
    });

  } catch (error: any) {
    console.error('Cron Job error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
}
