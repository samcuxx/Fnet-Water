/**
 * mNotify Ghana SMS & OTP Service
 * Handles SMS dispatches for order updates, driver assignments,
 * OTP verification, and operational alerts.
 */

const MNOTIFY_API_KEY = process.env.MNOTIFY_API_KEY || "EpyJqPefIbrTOBWOfr5ifgQXn";
const MNOTIFY_SENDER_ID = process.env.MNOTIFY_SENDER_ID || "Fnet";

export interface SendSmsResponse {
  status: "success" | "error";
  message: string;
  code?: string;
  data?: unknown;
}

/**
 * Normalizes phone numbers to standard Ghanaian format (e.g. 024XXXXXXX)
 */
export function normalizeGhanaPhone(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+233")) {
    return "0" + cleaned.slice(4);
  }
  if (cleaned.startsWith("233")) {
    return "0" + cleaned.slice(3);
  }
  return cleaned;
}

/**
 * Generates a random 5-digit numeric OTP
 */
export function generateOtp(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

/**
 * Sends an SMS message via mNotify Ghana API
 */
export async function sendSms(
  to: string | string[],
  message: string
): Promise<SendSmsResponse> {
  const recipients = Array.isArray(to)
    ? to.map(normalizeGhanaPhone)
    : [normalizeGhanaPhone(to)];

  // Log in development console for fast verification
  console.log(`[mNotify SMS] To: ${recipients.join(", ")} | Sender: ${MNOTIFY_SENDER_ID}`);
  console.log(`[mNotify SMS] Message: "${message}"`);

  if (!MNOTIFY_API_KEY || MNOTIFY_API_KEY === "mock_key") {
    console.log("[mNotify SMS] Mock mode: SMS simulated successfully.");
    return { status: "success", message: "Mock SMS dispatched successfully." };
  }

  try {
    const endpoint = `https://api.mnotify.com/api/sms/quick?key=${MNOTIFY_API_KEY}`;
    const payload = {
      recipient: recipients,
      sender: MNOTIFY_SENDER_ID,
      message,
      is_schedule: false,
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && (data.status === "success" || data.code === "1000" || data.status === "1000")) {
      return { status: "success", message: "SMS dispatched successfully", data };
    } else {
      console.warn("[mNotify SMS] API returned non-success response:", data);
      return {
        status: "error",
        message: data.message || "Failed to dispatch SMS",
        data,
      };
    }
  } catch (error) {
    console.error("[mNotify SMS] Network or API error:", error);
    // Don't crash caller if SMS fails (e.g. offline testing)
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown SMS dispatch error",
    };
  }
}

/**
 * Convenience helper to send an OTP
 */
export async function sendOtpSms(phone: string, otpCode: string): Promise<SendSmsResponse> {
  const message = `Your F Net Water Hub verification code is: ${otpCode}. Valid for 10 minutes. Do not share this code.`;
  return sendSms(phone, message);
}

/**
 * Convenience helper to send order confirmation SMS
 */
export async function sendOrderConfirmationSms(
  phone: string,
  orderNumber: string,
  totalAmount: number
): Promise<SendSmsResponse> {
  const message = `F Net Water Hub: Order #${orderNumber} confirmed! Total: GH₵ ${totalAmount.toFixed(
    2
  )}. We will notify you when a driver is dispatched.`;
  return sendSms(phone, message);
}

/**
 * Convenience helper to send driver dispatch SMS
 */
export async function sendDriverDispatchSms(
  customerPhone: string,
  driverName: string,
  orderNumber: string
): Promise<SendSmsResponse> {
  const message = `F Net Water Hub: Driver ${driverName} is on the way with your water delivery for Order #${orderNumber}.`;
  return sendSms(customerPhone, message);
}
