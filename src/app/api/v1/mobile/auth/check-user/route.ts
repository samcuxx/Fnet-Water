import { z } from "zod";
import { findUserByIdentifier } from "@/lib/auth-store";
import { normalizeGhanaPhone } from "@/lib/mnotify";
import { mobileError, mobileSuccess } from "@/lib/mobile-auth";

const checkUserSchema = z.object({
  phone: z.string().optional(),
  email: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parsed = checkUserSchema.safeParse(rawBody);
    if (!parsed.success) {
      return mobileError("VALIDATION_ERROR", "Provide a phone number or email.", 422);
    }

    const { phone, email } = parsed.data;
    if (!phone && !email) {
      return mobileError("VALIDATION_ERROR", "Provide a phone number or email.", 422);
    }

    const byPhoneUser = phone
      ? await findUserByIdentifier(normalizeGhanaPhone(phone.trim()))
      : null;
    const byEmailUser = email
      ? await findUserByIdentifier(email.trim().toLowerCase())
      : null;

    const matchedUser = byPhoneUser || byEmailUser;

    return mobileSuccess(
      {
        exists: Boolean(matchedUser),
        byPhone: Boolean(byPhoneUser),
        byEmail: Boolean(byEmailUser),
        role: matchedUser?.role || null,
      },
      200,
      "User lookup complete."
    );
  } catch (error) {
    console.error("[Mobile API auth/check-user error]:", error);
    return mobileError("SERVER_ERROR", "Failed to verify account existence.", 500);
  }
}
