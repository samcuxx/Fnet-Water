import { z } from "zod";
import { registerDevicePushToken, unregisterDevicePushToken } from "@/lib/device-store";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

const registerPushSchema = z.object({
  deviceToken: z.string().min(10, "Valid push notification token is required."),
  platform: z.enum(["IOS", "ANDROID", "WEB", "UNKNOWN"]).default("UNKNOWN"),
  deviceModel: z.string().optional(),
  appVersion: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request);
    if (!authResult.ok) return authResult.response;

    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parsed = registerPushSchema.safeParse(rawBody);
    if (!parsed.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message || "Invalid device registration payload.",
        422
      );
    }

    const record = await registerDevicePushToken({
      userId: authResult.user.id,
      token: parsed.data.deviceToken,
      platform: parsed.data.platform,
      deviceModel: parsed.data.deviceModel,
      appVersion: parsed.data.appVersion,
    });

    return mobileSuccess(record, 200, "Push notification device registered.");
  } catch (error) {
    console.error("[Mobile API register-push POST error]:", error);
    return mobileError("SERVER_ERROR", "Failed to register push device.", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request);
    if (!authResult.ok) return authResult.response;

    const body = await request.json().catch(() => ({}));
    const token = typeof body?.deviceToken === "string" ? body.deviceToken : undefined;

    await unregisterDevicePushToken(authResult.user.id, token);
    return mobileSuccess({ unregistered: true }, 200, "Push device unregistered.");
  } catch (error) {
    console.error("[Mobile API register-push DELETE error]:", error);
    return mobileError("SERVER_ERROR", "Failed to unregister push device.", 500);
  }
}
