import { z } from "zod";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

const telemetrySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  accuracyMeters: z.coerce.number().optional(),
  batteryLevel: z.coerce.number().min(0).max(100).optional(),
  timestamp: z.string().optional(),
});

const globalTelemetry = globalThis as unknown as {
  driverTelemetry?: Map<
    string,
    { latitude: number; longitude: number; accuracyMeters?: number; batteryLevel?: number; updatedAt: string }
  >;
};

const telemetryStore =
  globalTelemetry.driverTelemetry ??
  new Map<
    string,
    { latitude: number; longitude: number; accuracyMeters?: number; batteryLevel?: number; updatedAt: string }
  >();
if (process.env.NODE_ENV !== "production") {
  globalTelemetry.driverTelemetry = telemetryStore;
}

export async function POST(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request, ["DRIVER"]);
    if (!authResult.ok) return authResult.response;

    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parsed = telemetrySchema.safeParse(rawBody);
    if (!parsed.success) {
      return mobileError("VALIDATION_ERROR", "Invalid GPS telemetry coordinates.", 422);
    }

    const snapshot = {
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      accuracyMeters: parsed.data.accuracyMeters,
      batteryLevel: parsed.data.batteryLevel,
      updatedAt: parsed.data.timestamp || new Date().toISOString(),
    };
    telemetryStore.set(authResult.user.id, snapshot);

    return mobileSuccess(
      { recorded: true, ...snapshot },
      200,
      "Driver location updated."
    );
  } catch (error) {
    console.error("[Mobile API driver/telemetry POST error]:", error);
    return mobileError("SERVER_ERROR", "Failed to record location.", 500);
  }
}
