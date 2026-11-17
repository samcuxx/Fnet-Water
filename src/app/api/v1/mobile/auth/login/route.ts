import bcrypt from "bcryptjs";
import { z } from "zod";
import { findUserByIdentifier } from "@/lib/auth-store";
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

const loginSchema = z.object({
  identifier: z.string().min(3, "Please enter your email or phone number."),
  password: z.string().min(1, "Please enter your password."),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parsed = loginSchema.safeParse(rawBody);
    if (!parsed.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message || "Invalid login details.",
        422,
        parsed.error.issues
      );
    }

    const { identifier, password } = parsed.data;
    const user = await findUserByIdentifier(identifier.trim());

    if (!user) {
      return mobileError(
        "INVALID_CREDENTIALS",
        "Invalid email, phone number, or password.",
        401
      );
    }

    if (user.status === "INACTIVE") {
      return mobileError(
        "ACCOUNT_DEACTIVATED",
        "Your account has been deactivated. Please contact support.",
        403
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return mobileError(
        "INVALID_CREDENTIALS",
        "Incorrect password. Please try again or use SMS verification code.",
        401
      );
    }

    // Strict 3-Role Boundary: Block ADMIN and MANAGER from mobile app
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
      "Sign in successful."
    );
  } catch (error) {
    console.error("[Mobile API auth/login error]:", error);
    return mobileError("SERVER_ERROR", "Unable to sign in right now. Please try again.", 500);
  }
}
