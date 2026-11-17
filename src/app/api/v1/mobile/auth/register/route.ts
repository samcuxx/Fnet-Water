import { z } from "zod";
import { findUserByIdentifier, registerNewUser } from "@/lib/auth-store";
import { normalizeGhanaPhone } from "@/lib/mnotify";
import { recordReferralSignup } from "@/lib/referral-store";
import {
  mobileSuccess,
  mobileError,
  signMobileAccessToken,
  signMobileRefreshToken,
} from "@/lib/mobile-auth";

const registerSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(8, "Valid phone number is required"),
  email: z.string().email("Valid email address is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  referralCode: z.string().optional(),
  deliveryArea: z.string().optional(),
  digitalAddress: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parseResult = registerSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parseResult.error.issues[0]?.message || "Invalid registration data.",
        422,
        parseResult.error.issues
      );
    }

    const { name, phone, email, password, referralCode, deliveryArea, digitalAddress } = parseResult.data;
    const normalizedPhone = normalizeGhanaPhone(phone);
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingByEmail = await findUserByIdentifier(normalizedEmail);
    if (existingByEmail) {
      return mobileError(
        "EMAIL_EXISTS",
        "An account with this email address already exists. Please sign in instead.",
        400
      );
    }

    const existingByPhone = await findUserByIdentifier(normalizedPhone);
    if (existingByPhone) {
      return mobileError(
        "PHONE_EXISTS",
        "An account with this phone number already exists. Please sign in instead.",
        400
      );
    }

    // Register user in store / DB
    const newUser = await registerNewUser({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
      role: "CUSTOMER",
    });

    // Record referral signup if referral code provided
    if (referralCode && referralCode.trim()) {
      try {
        await recordReferralSignup(
          newUser.id,
          newUser.name,
          newUser.phone,
          referralCode.trim()
        );
      } catch (refError) {
        console.warn("[Mobile API referral registration notice]:", refError);
      }
    }

    // Generate JWT access & refresh tokens
    const accessToken = signMobileAccessToken({
      id: newUser.id,
      role: newUser.role,
      phone: newUser.phone,
      name: newUser.name,
      email: newUser.email,
    });

    const refreshToken = signMobileRefreshToken({ id: newUser.id });

    return mobileSuccess(
      {
        accessToken,
        refreshToken,
        expiresIn: 86400,
        user: {
          id: newUser.id,
          name: newUser.name,
          phone: newUser.phone,
          email: newUser.email,
          role: newUser.role,
          customerProfile: {
            customerCode: newUser.customerCode || `CUST-${newUser.phone.slice(-4)}`,
            bottlesHeld: 0,
            freeBottleBalance: 0,
            referralCode: `FNET-${newUser.phone.slice(-4)}`,
            deliveryArea: deliveryArea || undefined,
            digitalAddress: digitalAddress || undefined,
          },
        },
      },
      201,
      "Customer account created successfully."
    );
  } catch (error) {
    console.error("[Mobile API register error]:", error);
    return mobileError(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to create account.",
      500
    );
  }
}
