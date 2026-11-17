import { z } from "zod";
import { applyForDispenserPlan } from "@/lib/dispenser-store";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

const applySchema = z.object({
  modelName: z.string().min(2, "Dispenser model is required."),
  deliveryAddressText: z.string().min(3, "Installation address is required."),
  paymentMethod: z.enum(["MOBILE_MONEY", "CARD"]).default("MOBILE_MONEY"),
  momoNetwork: z.enum(["MTN", "TELECEL", "AT"]).optional(),
  momoPhone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request, ["CUSTOMER"]);
    if (!authResult.ok) return authResult.response;

    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parsed = applySchema.safeParse(rawBody);
    if (!parsed.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message || "Invalid dispenser application.",
        422,
        parsed.error.issues
      );
    }

    const plan = await applyForDispenserPlan(authResult.user.id, parsed.data);
    return mobileSuccess(
      { plan },
      201,
      "Dispenser rent-to-own plan activated successfully."
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to apply for dispenser.";
    return mobileError("DISPENSER_APPLY_ERROR", msg, 400);
  }
}
