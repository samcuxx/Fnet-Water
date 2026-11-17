import { z } from "zod";
import { onboardZoneCustomer } from "@/lib/agent-store";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

const onboardSchema = z.object({
  name: z.string().min(2, "Customer full name is required."),
  phone: z.string().min(9, "A valid phone number is required."),
  email: z.string().email("A valid email address is required."),
  zone: z.string().min(2, "Assigned delivery zone is required."),
  deliveryArea: z.string().min(2, "Street name or area landmark is required."),
  digitalAddress: z.string().optional(),
  gpsLatitude: z.coerce.number().optional(),
  gpsLongitude: z.coerce.number().optional(),
  ghanaCardNumber: z.string().optional(),
  dispenserStatus: z
    .enum(["Smart Rent-to-Own", "Customer Owned", "None (Refill Only)"])
    .default("None (Refill Only)"),
});

export async function POST(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request, ["AGENT"]);
    if (!authResult.ok) return authResult.response;

    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parsed = onboardSchema.safeParse(rawBody);
    if (!parsed.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message || "Please check customer registration fields.",
        422,
        parsed.error.issues
      );
    }

    const result = await onboardZoneCustomer(authResult.user.id, parsed.data);
    if (!result.success) {
      return mobileError(
        "ONBOARD_FAILED",
        result.error || "Customer onboarding failed.",
        400
      );
    }

    return mobileSuccess(
      {
        customer: result.customer,
        temporaryPassword: result.temporaryPassword,
      },
      201,
      `Customer ${result.customer?.customerName} registered in ${parsed.data.zone}.`
    );
  } catch (error) {
    console.error("[Mobile API agent/onboard POST error]:", error);
    return mobileError("SERVER_ERROR", "Failed to onboard customer.", 500);
  }
}
