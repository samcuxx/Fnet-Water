import { normalizeGhanaPhone } from "@/lib/mnotify";
import { findUserByIdentifier, verifyStoredOtp, registerNewUser } from "@/lib/auth-store";
import {
  mobileSuccess,
  mobileError,
  signMobileAccessToken,
  signMobileRefreshToken,
} from "@/lib/mobile-auth";
import { z } from "zod";

const verifyOtpSchema = z.object({
  phone: z.string().min(8, "Phone number is too short"),
  otpCode: z.string().length(5, "Verification code must be exactly 5 digits"),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parseResult = verifyOtpSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parseResult.error.issues[0]?.message || "Invalid input data.",
        422,
        parseResult.error.issues
      );
    }

    const { phone, otpCode } = parseResult.data;
    const normalizedPhone = normalizeGhanaPhone(phone);

    // Verify OTP code against memory/DB store
    const isValid = await verifyStoredOtp(normalizedPhone, otpCode);
    if (!isValid) {
      return mobileError(
        "INVALID_OTP",
        "The verification code is invalid or has expired. Please request a new code.",
        400
      );
    }

    // Find existing user in database or seed store
    const user = await findUserByIdentifier(normalizedPhone);
    if (!user) {
      return mobileError(
        "USER_NOT_FOUND",
        "No registered account was found with this phone number. Please register for a customer account.",
        404
      );
    }

    if (user.status === "INACTIVE") {
      return mobileError(
        "ACCOUNT_DEACTIVATED",
        "Your account has been deactivated. Please contact customer care.",
        403
      );
    }

    // Generate tokens
    const accessToken = signMobileAccessToken({
      id: user.id,
      role: user.role,
      phone: user.phone,
      name: user.name,
      email: user.email,
    });

    const refreshToken = signMobileRefreshToken({ id: user.id });

    return mobileSuccess(
      {
        accessToken,
        refreshToken,
        expiresIn: 86400,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          customerProfile:
            user.role === "CUSTOMER"
              ? {
                  customerCode: user.customerCode || "CUST-001",
                  bottlesHeld: user.bottlesHeld ?? 0,
                  freeBottleBalance: 0,
                  referralCode: `FNET-${user.phone.slice(-4)}`,
                }
              : undefined,
        },
      },
      200,
      "Authentication successful."
    );
  } catch (error) {
    console.error("[Mobile API verify-otp error]:", error);
    return mobileError(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to verify code.",
      500
    );
  }
}
