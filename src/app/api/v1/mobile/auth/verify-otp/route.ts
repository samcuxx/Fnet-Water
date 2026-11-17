import { z } from "zod";
import { normalizeGhanaPhone } from "@/lib/mnotify";
import { findUserByIdentifier, verifyStoredOtp, registerNewUser } from "@/lib/auth-store";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  buildMobileUserPayload,
  getRequestOrigin,
  isMobileAllowedRole,
  mobileError,
  mobileSuccess,
  signMobileAccessToken,
  signMobileRefreshToken,
} from "@/lib/mobile-auth";

const verifyOtpSchema = z.object({
  phone: z.string().min(8, "Phone number is too short"),
  otpCode: z.string().length(5, "Verification code must be exactly 5 digits"),
  autoProvisionCustomer: z.boolean().optional(),
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

    const { phone, otpCode, autoProvisionCustomer = false } = parseResult.data;
    const normalizedPhone = normalizeGhanaPhone(phone);

    const isValid = await verifyStoredOtp(normalizedPhone, otpCode);
    if (!isValid) {
      return mobileError(
        "INVALID_OTP",
        "The verification code is invalid or has expired. Please request a new code.",
        400
      );
    }

    let user = await findUserByIdentifier(normalizedPhone);

    if (!user) {
      if (!autoProvisionCustomer) {
        return mobileError(
          "ACCOUNT_NOT_FOUND",
          "No account is registered with this phone number. Please create an account.",
          404
        );
      }

      const generatedEmail = `customer_${normalizedPhone.slice(-6)}_${Date.now().toString().slice(-4)}@fnetwater.com`;
      user = await registerNewUser({
        name: "Valued Customer",
        phone: normalizedPhone,
        email: generatedEmail,
        password: `otp_pass_${Date.now()}`,
        role: "CUSTOMER",
      });
    }

    if (user.status === "INACTIVE") {
      return mobileError(
        "ACCOUNT_DEACTIVATED",
        "Your account has been deactivated. Please contact support.",
        403
      );
    }

    // Strictly block ADMIN and MANAGER roles from mobile access
    if (!isMobileAllowedRole(user.role)) {
      return mobileError(
        "ROLE_NOT_ALLOWED_ON_MOBILE",
        `${user.role === "MANAGER" ? "Operations Manager" : "Administrator"} accounts are available on the web portal only.`,
        403,
        { role: user.role, webOnly: true }
      );
    }

    const accessToken = signMobileAccessToken({
      id: user.id,
      role: user.role,
      phone: user.phone,
      name: user.name,
      email: user.email,
    });
    const refreshToken = signMobileRefreshToken({ id: user.id });
    const enrichedUser = await buildMobileUserPayload(user, getRequestOrigin(request));

    return mobileSuccess(
      {
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
        user: enrichedUser,
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
