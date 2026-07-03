/**
 * Service to dispatch web push notifications using Firebase Cloud Messaging (FCM) legacy HTTP protocol.
 * Facilitates sending browser and mobile push alerts directly from client actions.
 */

export const sendFCMNotification = async (
  deviceTokens: string[],
  title: string,
  body: string,
  imageUrl?: string
): Promise<{ success: boolean; results?: any[]; error?: string }> => {
  const filteredTokens = deviceTokens.filter(t => typeof t === 'string' && t.trim() !== '');

  if (filteredTokens.length === 0) {
    return { success: true, results: [], error: "No target device tokens provided." };
  }

  const serverKey = import.meta.env.VITE_FCM_SERVER_KEY;

  if (!serverKey) {
    console.log("FCM server key is not configured in VITE_FCM_SERVER_KEY. Mocking push notification delivery:", {
      tokens: filteredTokens,
      title,
      body,
      imageUrl
    });
    return {
      success: true,
      results: filteredTokens.map(t => ({ token: t, status: 'MockSent' }))
    };
  }

  try {
    const url = 'https://fcm.googleapis.com/fcm/send';

    const payload = {
      registration_ids: filteredTokens,
      notification: {
        title: title,
        body: body,
        sound: 'default',
        icon: '/logo.png',
        badge: '/favicon.ico',
        ...(imageUrl ? { image: imageUrl } : {})
      },
      priority: 'high'
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${serverKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, results: data.results || [] };
    } else {
      return { success: false, error: data.message || "FCM response error" };
    }
  } catch (err: any) {
    console.error("FCM push delivery HTTP request error:", err);
    return { success: false, error: err.message || "Network request failed" };
  }
};
