import { z } from "zod";
import { findUserByIdentifier, registerNewUser, verifyStoredOtp } from "@/lib/auth-store";
import { normalizeGhanaPhone } from "@/lib/mnotify";
import { recordReferralSignup } from "@/lib/referral-store";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  buildMobileUserPayload,
  getRequestOrigin,
  mobileError,
  mobileSuccess,
  signMobileAccessToken,
  signMobileRefreshToken,
} from "@/lib/mobile-auth";

const registerSchema = z.object({
  name: z.string().min(2, "Full name is required."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(9, "Please enter a valid phone number."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  referralCode: z.string().optional(),
  otpCode: z.string().length(5).optional(),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parsed = registerSchema.safeParse(rawBody);
    if (!parsed.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message || "Please check your registration details.",
        422,
        parsed.error.issues
      );
    }

    const { name, email, phone, password, referralCode, otpCode } = parsed.data;
    const normalizedPhone = normalizeGhanaPhone(phone);
    const normalizedEmail = email.trim().toLowerCase();

    if (otpCode) {
      const otpOk = await verifyStoredOtp(normalizedPhone, otpCode);
      if (!otpOk) {
        return mobileError(
          "INVALID_OTP",
          "The verification code is invalid or has expired.",
          400
        );
      }
    }

    const existingByEmail = await findUserByIdentifier(normalizedEmail);
    if (existingByEmail) {
      return mobileError(
        "EMAIL_EXISTS",
        "An account with this email address already exists.",
        409
      );
    }

    const existingByPhone = await findUserByIdentifier(normalizedPhone);
    if (existingByPhone) {
      return mobileError(
        "PHONE_EXISTS",
        "An account with this phone number already exists.",
        409
      );
    }

    const newUser = await registerNewUser({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
      role: "CUSTOMER",
      referralCode: referralCode?.trim() || undefined,
    });

    if (referralCode && referralCode.trim()) {
      await recordReferralSignup(
        newUser.id,
        newUser.name,
        newUser.phone,
        referralCode.trim()
      );
    }

    const accessToken = signMobileAccessToken({
      id: newUser.id,
      role: newUser.role,
      phone: newUser.phone,
      name: newUser.name,
      email: newUser.email,
    });
    const refreshToken = signMobileRefreshToken({ id: newUser.id });
    const enrichedUser = await buildMobileUserPayload(newUser, getRequestOrigin(request));

    return mobileSuccess(
      {
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
        user: enrichedUser,
      },
      201,
      "Account created successfully."
    );
  } catch (error) {
    console.error("[Mobile API auth/register error]:", error);
    return mobileError(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to register account.",
      500
    );
  }
}
