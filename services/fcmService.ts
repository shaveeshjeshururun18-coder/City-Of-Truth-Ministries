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

  try {
    const response = await fetch('/api/sendPush', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tokens: filteredTokens,
        title: title,
        body: body,
        imageUrl: imageUrl
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      return { success: true, results: [{ status: 'Sent via Vercel Function', successCount: data.successCount }] };
    } else {
      return { success: false, error: data.error || "Vercel function returned failure" };
    }
  } catch (err: any) {
    console.error("FCM push delivery Vercel Function error:", err);
    return { success: false, error: err.message || "Vercel Function request failed" };
  }
};
