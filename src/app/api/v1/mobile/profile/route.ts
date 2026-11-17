import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  findUserByIdentifier,
  updateUserDetails,
  updateUserPassword,
} from "@/lib/auth-store";
import { updateCustomerProfileData } from "@/lib/customer-store";
import { normalizeGhanaPhone } from "@/lib/mnotify";
import {
  buildMobileUserPayload,
  getRequestOrigin,
  mobileError,
  mobileSuccess,
  verifyMobileAuth,
} from "@/lib/mobile-auth";

const updateProfileSchema = z.object({
  action: z.enum(["details", "password"]).default("details"),
  name: z.string().min(2).optional(),
  email: z.string().email("Please enter a valid email address.").optional(),
  phone: z.string().min(9, "Please enter a valid phone number.").optional(),
  deliveryArea: z.string().optional(),
  ghanaCardNumber: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "New password must be at least 6 characters.").optional(),
});

export async function GET(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request);
    if (!authResult.ok) return authResult.response;

    const profile = await buildMobileUserPayload(authResult.dbUser, getRequestOrigin(request));
    return mobileSuccess(profile, 200, "Profile loaded successfully.");
  } catch (error) {
    console.error("[Mobile API profile GET error]:", error);
    return mobileError("SERVER_ERROR", "Failed to load profile.", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request);
    if (!authResult.ok) return authResult.response;

    const currentUser = authResult.dbUser;
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parsed = updateProfileSchema.safeParse(rawBody);
    if (!parsed.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message || "Invalid profile data.",
        422,
        parsed.error.issues
      );
    }

    const data = parsed.data;

    if (data.action === "password") {
      if (!data.currentPassword || !data.newPassword) {
        return mobileError(
          "VALIDATION_ERROR",
          "Current password and new password are required.",
          400
        );
      }

      const matches = await bcrypt.compare(data.currentPassword, currentUser.passwordHash);
      if (!matches) {
        return mobileError("INVALID_PASSWORD", "Incorrect current password.", 400);
      }

      await updateUserPassword(currentUser.id, data.newPassword);
      return mobileSuccess({ passwordUpdated: true }, 200, "Password changed successfully.");
    }

    if (data.email) {
      const cleanEmail = data.email.trim().toLowerCase();
      const existing = await findUserByIdentifier(cleanEmail);
      if (existing && existing.id !== currentUser.id) {
        return mobileError(
          "EMAIL_EXISTS",
          "Another account is already registered with this email address.",
          409
        );
      }
    }

    if (data.phone) {
      const normalizedPhone = normalizeGhanaPhone(data.phone);
      const existing = await findUserByIdentifier(normalizedPhone);
      if (existing && existing.id !== currentUser.id) {
        return mobileError(
          "PHONE_EXISTS",
          "Another account is already registered with this phone number.",
          409
        );
      }
    }

    const updated = await updateUserDetails(currentUser.id, {
      name: data.name?.trim() || currentUser.name,
      email: data.email?.trim().toLowerCase() || currentUser.email,
      phone: data.phone ? normalizeGhanaPhone(data.phone) : currentUser.phone,
      deliveryArea:
        data.deliveryArea !== undefined ? data.deliveryArea.trim() : currentUser.deliveryArea,
    });

    if (!updated) {
      return mobileError("SERVER_ERROR", "Failed to update profile.", 500);
    }

    if (currentUser.role === "CUSTOMER" && data.ghanaCardNumber !== undefined) {
      await updateCustomerProfileData(currentUser.id, {
        ghanaCardNumber: data.ghanaCardNumber.trim().toUpperCase(),
      });
    }

    const enriched = await buildMobileUserPayload(updated, getRequestOrigin(request));
    return mobileSuccess(enriched, 200, "Profile updated successfully.");
  } catch (error) {
    console.error("[Mobile API profile PATCH error]:", error);
    return mobileError("SERVER_ERROR", "Failed to update profile.", 500);
  }
}
