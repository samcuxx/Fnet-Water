import { z } from "zod";
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/notification-store";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

const readSchema = z.object({
  id: z.string().optional(),
  markAll: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request);
    if (!authResult.ok) return authResult.response;

    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parsed = readSchema.safeParse(rawBody);
    if (!parsed.success || (!parsed.data.id && !parsed.data.markAll)) {
      return mobileError("VALIDATION_ERROR", "Provide either notification id or markAll: true.", 422);
    }

    const { user } = authResult;
    if (parsed.data.markAll) {
      const updatedCount = await markAllNotificationsAsRead(user.id, user.role);
      return mobileSuccess(
        { updatedCount },
        200,
        `Marked ${updatedCount} notifications as read.`
      );
    }

    const ok = await markNotificationAsRead(parsed.data.id!, user.id);
    return mobileSuccess(
      { updated: ok, id: parsed.data.id },
      200,
      ok ? "Notification marked as read." : "Notification not found."
    );
  } catch (error) {
    console.error("[Mobile API notifications/read POST error]:", error);
    return mobileError("SERVER_ERROR", "Failed to update notification.", 500);
  }
}
