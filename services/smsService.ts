/**
 * SMS service to send text notifications using Twilio REST API.
 * Reads environment variables configured in Vite.
 */

export const sendSMS = async (
  to: string,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const isSmsEnabled = import.meta.env.VITE_ENABLE_SMS === 'true';

  if (!isSmsEnabled) {
    console.log("SMS service (VITE_ENABLE_SMS) is disabled. Mocking SMS dispatch:", { to, body });
    return { success: true, messageId: `MOCK-SMS-${Math.floor(Math.random() * 900000) + 100000}` };
  }

  const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
  const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
  const fromNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.error("Twilio SMS credentials are not fully configured in your environment.");
    return {
      success: false,
      error: "Missing Twilio configuration (Account SID, Auth Token, or Phone Number)."
    };
  }

  try {
    // Format recipient phone number to E.164 if not already formatted
    let formattedTo = to.trim();
    if (!formattedTo.startsWith('+')) {
      // Remove any non-digit chars
      const digits = formattedTo.replace(/\D/g, '');
      if (digits.length === 10) {
        // Prepend US/India default country code or format correctly
        formattedTo = `+91${digits}`; // Adjust default prefix based on user preference or leave digits
      } else {
        formattedTo = `+${digits}`;
      }
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const basicAuth = btoa(`${accountSid}:${authToken}`);

    const params = new URLSearchParams();
    params.append('To', formattedTo);
    params.append('From', fromNumber);
    params.append('Body', body);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, messageId: data.sid };
    } else {
      return { success: false, error: data.message || "Twilio API response error" };
    }
  } catch (err: any) {
    console.error("Twilio request network error:", err);
    return { success: false, error: err.message || "Network request failed" };
  }
};
