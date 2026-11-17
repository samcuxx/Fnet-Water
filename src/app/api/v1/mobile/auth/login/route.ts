import bcrypt from "bcryptjs";
import { z } from "zod";
import { findUserByIdentifier } from "@/lib/auth-store";
import { normalizeGhanaPhone } from "@/lib/mnotify";
import {
  mobileSuccess,
  mobileError,
  signMobileAccessToken,
  signMobileRefreshToken,
} from "@/lib/mobile-auth";

const loginSchema = z.object({
  identifier: z.string().min(3, "Phone number or email is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parseResult = loginSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parseResult.error.issues[0]?.message || "Invalid login credentials.",
        422,
        parseResult.error.issues
      );
    }

    const { identifier, password } = parseResult.data;

    // Search user by email or phone (with Ghana phone normalization)
    const normalizedIdentifier = identifier.includes("@")
      ? identifier.trim().toLowerCase()
      : normalizeGhanaPhone(identifier);

    const user = await findUserByIdentifier(normalizedIdentifier);

    if (!user) {
      return mobileError(
        "INVALID_CREDENTIALS",
        "The phone number, email, or password you entered is incorrect.",
        401
      );
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return mobileError(
        "INVALID_CREDENTIALS",
        "The phone number, email, or password you entered is incorrect.",
        401
      );
    }

    // Check account status
    if (user.status === "INACTIVE") {
      return mobileError(
        "ACCOUNT_DEACTIVATED",
        "Your account is inactive or has been suspended. Please contact customer support.",
        403
      );
    }

    // Generate JWT access & refresh tokens
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
    console.error("[Mobile API login error]:", error);
    return mobileError(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to sign in.",
      500
    );
  }
}
