import bcrypt from "bcryptjs";
import { z } from "zod";
import { updateUserPassword } from "@/lib/auth-store";
import {
  mobileError,
  mobileSuccess,
  verifyMobileAuth,
} from "@/lib/mobile-auth";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
});

export async function POST(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request);
    if (!authResult.ok) return authResult.response;

    const currentUser = authResult.dbUser;
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parsed = changePasswordSchema.safeParse(rawBody);
    if (!parsed.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message || "Invalid password data.",
        400
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    const matches = await bcrypt.compare(currentPassword, currentUser.passwordHash);
    if (!matches) {
      return mobileError("INVALID_PASSWORD", "Incorrect current password.", 400);
    }

    await updateUserPassword(currentUser.id, newPassword);
    return mobileSuccess({ passwordUpdated: true }, 200, "Password updated successfully.");
  } catch (error) {
    console.error("[Mobile API change-password error]:", error);
    return mobileError("SERVER_ERROR", "Failed to update password.", 500);
  }
}
