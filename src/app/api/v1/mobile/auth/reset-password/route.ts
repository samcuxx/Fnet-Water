import { z } from "zod";
import {
  findUserByIdentifier,
  verifyStoredOtp,
  updateUserPassword,
} from "@/lib/auth-store";
import { mobileSuccess, mobileError } from "@/lib/mobile-auth";

const resetPasswordSchema = z.object({
  identifier: z.string().min(3, "Identifier is required"),
  code: z.string().length(5, "Verification code must be 5 digits"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parseResult = resetPasswordSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parseResult.error.issues[0]?.message || "Validation failed.",
        422,
        parseResult.error.issues
      );
    }

    const { identifier, code, newPassword } = parseResult.data;
    const cleanId = identifier.trim();

    // 1. Verify user exists
    const user = await findUserByIdentifier(cleanId);
    if (!user) {
      return mobileError(
        "USER_NOT_FOUND",
        "No registered account was found with this phone number or email address.",
        404
      );
    }

    // 2. Authoritatively verify the 5-digit OTP
    const isValidOtp = await verifyStoredOtp(user.phone, code);
    if (!isValidOtp) {
      return mobileError(
        "INVALID_OTP",
        "The verification code you entered is invalid or has expired. Please request a new code.",
        400
      );
    }

    // 3. Update the user password in database/store
    const updated = await updateUserPassword(user.id, newPassword);
    if (!updated) {
      return mobileError(
        "UPDATE_FAILED",
        "Failed to update password. Please try again.",
        500
      );
    }

    return mobileSuccess(
      { success: true, phone: user.phone },
      200,
      "Your password has been successfully reset. You can now sign in."
    );
  } catch (error) {
    console.error("[Mobile API reset-password error]:", error);
    return mobileError(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to reset password.",
      500
    );
  }
}
