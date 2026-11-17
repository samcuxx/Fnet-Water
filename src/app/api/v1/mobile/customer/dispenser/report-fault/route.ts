import { z } from "zod";
import { reportDispenserFault } from "@/lib/dispenser-store";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

const faultSchema = z.object({
  issueType: z
    .enum([
      "COOLING_FAILURE",
      "HEATING_FAILURE",
      "LEAKAGE",
      "PUMP_NOISE",
      "SENSOR_ERROR",
      "OTHER",
    ])
    .default("OTHER"),
  description: z.string().min(5, "Please describe the issue (at least 5 characters)."),
  urgency: z.enum(["LOW", "NORMAL", "HIGH"]).default("NORMAL"),
});

export async function POST(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request, ["CUSTOMER"]);
    if (!authResult.ok) return authResult.response;

    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parsed = faultSchema.safeParse(rawBody);
    if (!parsed.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message || "Please provide issue details.",
        422,
        parsed.error.issues
      );
    }

    const fault = await reportDispenserFault(authResult.user.id, parsed.data);
    return mobileSuccess(
      { fault },
      201,
      "Your service request has been logged. Our technician will contact you shortly."
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to submit service request.";
    return mobileError("FAULT_REPORT_ERROR", msg, 400);
  }
}
