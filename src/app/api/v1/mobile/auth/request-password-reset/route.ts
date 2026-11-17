import { z } from "zod";
import { findUserByIdentifier, storeOtp } from "@/lib/auth-store";
import { generateOtp, sendOtpSms } from "@/lib/mnotify";
import { mobileSuccess, mobileError } from "@/lib/mobile-auth";

const requestResetSchema = z.object({
  identifier: z.string().min(3, "Phone number or email is required"),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parseResult = requestResetSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parseResult.error.issues[0]?.message || "Invalid contact information provided.",
        422
      );
    }

    const { identifier } = parseResult.data;
    const cleanId = identifier.trim();

    // 1. Authoritative check: User MUST exist in database or seed store
    const user = await findUserByIdentifier(cleanId);
    if (!user) {
      return mobileError(
        "USER_NOT_FOUND",
        "No registered account was found with this phone number or email address.",
        404
      );
    }

    // 2. Generate 5-digit verification code
    const otpCode = generateOtp();

    // 3. Store OTP in database/memory (10 minute TTL)
    await storeOtp(user.phone, otpCode, 10);

    // 4. Dispatch SMS code via mNotify
    await sendOtpSms(user.phone, otpCode);

    // Mask phone for user privacy (e.g. 024 **** 005)
    const phone = user.phone;
    const maskedPhone =
      phone.length >= 10
        ? `${phone.slice(0, 3)} **** ${phone.slice(-3)}`
        : phone;

    return mobileSuccess(
      {
        phone: user.phone,
        maskedPhone,
        userId: user.id,
        expiresInSeconds: 600,
        resendAvailableInSeconds: 60,
        ...(process.env.NODE_ENV !== "production" ? { devOtp: otpCode } : {}),
      },
      200,
      `Verification code sent to ${maskedPhone}.`
    );
  } catch (error) {
    console.error("[Mobile API request-password-reset error]:", error);
    return mobileError(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to process password reset request.",
      500
    );
  }
}
