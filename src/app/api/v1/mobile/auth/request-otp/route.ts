import { generateOtp, normalizeGhanaPhone, sendOtpSms } from "@/lib/mnotify";
import { storeOtp } from "@/lib/auth-store";
import { mobileSuccess, mobileError } from "@/lib/mobile-auth";
import { z } from "zod";

const requestOtpSchema = z.object({
  phone: z.string().min(8, "Phone number is too short").max(16, "Phone number is too long"),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parseResult = requestOtpSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parseResult.error.issues[0]?.message || "Invalid phone number format.",
        422,
        parseResult.error.issues
      );
    }

    const normalizedPhone = normalizeGhanaPhone(parseResult.data.phone);

    // Ghana phone numbers: 024XXXXXXX (10 digits) or +23324XXXXXXX
    if (normalizedPhone.length < 9 || normalizedPhone.length > 13) {
      return mobileError(
        "INVALID_PHONE",
        "Please provide a valid Ghanaian phone number (e.g. 024 123 4567).",
        400
      );
    }

    // Generate 5-digit verification code
    const otpCode = generateOtp();

    // Store in DB / cache (10 minutes TTL)
    await storeOtp(normalizedPhone, otpCode, 10);

    // Dispatch SMS via mNotify
    await sendOtpSms(normalizedPhone, otpCode);

    return mobileSuccess(
      {
        phone: normalizedPhone,
        expiresInSeconds: 600,
        resendAvailableInSeconds: 60,
        ...(process.env.NODE_ENV !== "production" ? { devOtp: otpCode } : {}),
      },
      200,
      "Verification code sent successfully via SMS."
    );
  } catch (error) {
    console.error("[Mobile API request-otp error]:", error);
    return mobileError(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to dispatch SMS verification code.",
      500
    );
  }
}
