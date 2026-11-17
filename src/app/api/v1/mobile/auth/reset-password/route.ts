import { z } from "zod";
import {
  findUserByIdentifier,
  storeOtp,
  updateUserPassword,
  verifyStoredOtp,
} from "@/lib/auth-store";
import { generateOtp, normalizeGhanaPhone, sendOtpSms } from "@/lib/mnotify";
import { isMobileAllowedRole, mobileError, mobileSuccess } from "@/lib/mobile-auth";

const resetSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("request"),
    identifier: z.string().min(3, "Please enter your registered email or phone number."),
  }),
  z.object({
    action: z.literal("verify"),
    phone: z.string().min(8, "Registered phone number is required."),
    otpCode: z.string().length(5, "Verification code must be 5 digits."),
  }),
  z.object({
    action: z.literal("reset"),
    phone: z.string().min(8, "Registered phone number is required."),
    otpCode: z.string().length(5, "Verification code must be 5 digits."),
    newPassword: z.string().min(6, "New password must be at least 6 characters."),
  }),
]);

function maskPhone(phone: string): string {
  if (phone.length < 7) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    // Backwards-compatible default: if phone + otpCode + newPassword provided without action
    const normalizedBody =
      !rawBody.action && rawBody.otpCode && rawBody.newPassword
        ? { action: "reset", ...rawBody }
        : !rawBody.action && (rawBody.identifier || rawBody.phone)
        ? { action: "request", identifier: rawBody.identifier || rawBody.phone }
        : rawBody;

    const parsed = resetSchema.safeParse(normalizedBody);
    if (!parsed.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message || "Invalid password reset input.",
        422,
        parsed.error.issues
      );
    }

    if (parsed.data.action === "request") {
      const user = await findUserByIdentifier(parsed.data.identifier.trim());
      if (!user) {
        return mobileError(
          "ACCOUNT_NOT_FOUND",
          "No account found with that email or phone number.",
          404
        );
      }

      if (!isMobileAllowedRole(user.role)) {
        return mobileError(
          "ROLE_NOT_ALLOWED_ON_MOBILE",
          "Please reset administrator or manager passwords on the web portal.",
          403
        );
      }

      const normalizedPhone = normalizeGhanaPhone(user.phone);
      const otpCode = generateOtp();
      await storeOtp(normalizedPhone, otpCode, 10);
      await sendOtpSms(normalizedPhone, otpCode);

      return mobileSuccess(
        {
          phone: normalizedPhone,
          maskedPhone: maskPhone(normalizedPhone),
          expiresInSeconds: 600,
          resendAvailableInSeconds: 60,
          ...(process.env.NODE_ENV !== "production" ? { devOtp: otpCode } : {}),
        },
        200,
        `Verification code sent to ${maskPhone(normalizedPhone)}.`
      );
    }

    if (parsed.data.action === "verify") {
      const normalizedPhone = normalizeGhanaPhone(parsed.data.phone);
      const isOtpValid = await verifyStoredOtp(normalizedPhone, parsed.data.otpCode, false);
      if (!isOtpValid) {
        return mobileError(
          "INVALID_OTP",
          "The verification code is invalid or has expired.",
          400
        );
      }

      return mobileSuccess(
        { verified: true },
        200,
        "Code verified successfully. Please enter your new password."
      );
    }

    // Action: reset password
    const normalizedPhone = normalizeGhanaPhone(parsed.data.phone);
    const isOtpValid = await verifyStoredOtp(normalizedPhone, parsed.data.otpCode);
    if (!isOtpValid) {
      return mobileError(
        "INVALID_OTP",
        "The verification code is invalid or has expired.",
        400
      );
    }

    const user = await findUserByIdentifier(normalizedPhone);
    if (!user) {
      return mobileError("ACCOUNT_NOT_FOUND", "Account not found.", 404);
    }

    const updated = await updateUserPassword(user.id, parsed.data.newPassword);
    if (!updated) {
      return mobileError("SERVER_ERROR", "Could not update password.", 500);
    }

    return mobileSuccess(
      { reset: true },
      200,
      "Password updated successfully. You can now sign in."
    );
  } catch (error) {
    console.error("[Mobile API auth/reset-password error]:", error);
    return mobileError("SERVER_ERROR", "Failed to process password reset.", 500);
  }
}
