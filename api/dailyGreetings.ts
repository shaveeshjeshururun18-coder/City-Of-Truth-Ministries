import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify that the request is coming from Vercel Cron
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const db = getFirestore();
    
    // 1. Check if the setting is enabled
    const settingsDoc = await db.collection("settings").doc("dailyGreeting").get();
    if (!settingsDoc.exists) {
      return res.status(200).json({ message: "Daily greeting settings not found, aborting." });
    }
    const settings = settingsDoc.data();
    if (!settings?.enabled) {
      return res.status(200).json({ message: "Daily greetings are currently disabled in settings." });
    }

    // 2. Determine the time of day and appropriate greeting
    // The cron triggers exactly at 5am, 12pm, 6pm, 9pm Israel Time
    const jerusalemHour = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" })).getHours();
    
    let title = "City of Truth Ministries";
    let body = "";

    if (jerusalemHour === 5) {
      title = "בוקר טוב (BOKER TOV)";
      body = "May your day be filled with peace, wisdom, strength, and abundant blessings.";
    } else if (jerusalemHour === 12) {
      title = "צהריים טובים (TZOHARAIM TOVIM)";
      body = "May your afternoon be productive, peaceful, and filled with God's favor.";
    } else if (jerusalemHour === 18) {
      title = "ערב טוב (EREV TOV)";
      body = "May your evening bring peace, gratitude, and joyful fellowship.";
    } else if (jerusalemHour === 21) {
      title = "לילה טוב (LAILA TOV)";
      body = "May the Lord watch over you through the night and grant you peaceful rest.";
    } else {
      return res.status(200).json({ message: `Cron triggered at unexpected hour: ${jerusalemHour}. Aborting.` });
    }

    // 3. Fetch all users who have FCM tokens
    const usersSnapshot = await db.collection("users").get();
    const allTokens: string[] = [];

    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.fcmTokens && Array.isArray(data.fcmTokens)) {
        data.fcmTokens.forEach((token: string) => {
          if (token && token.trim() !== "") {
            allTokens.push(token);
          }
        });
      }
    });

    if (allTokens.length === 0) {
      return res.status(200).json({ message: "No users with FCM tokens found." });
    }

    // 4. Send the push notifications (Chunked in batches of 500 max per Firebase limits)
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
          ...(settings.imageUrl ? { imageUrl: settings.imageUrl } : {})
        },
        android: {
          priority: "high"
        }
      };

      try {
        const response = await getMessaging().sendEachForMulticast(message);
        totalSuccess += response.successCount;
        totalFailures += response.failureCount;
      } catch (err) {
        console.error("Error sending daily greeting chunk:", err);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: `Daily greetings sent! Success: ${totalSuccess}, Failures: ${totalFailures}` 
    });

  } catch (error: any) {
    console.error("Cron Job error:", error);
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}
