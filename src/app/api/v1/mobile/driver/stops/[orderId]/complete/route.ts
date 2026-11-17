import { z } from "zod";
import { completeStopBottleExchange } from "@/lib/dispatch-store";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

const completeDeliverySchema = z.object({
  filledDelivered: z.coerce.number().int().min(0).default(0),
  emptyCollected: z.coerce.number().int().min(0).default(0),
  damagedCount: z.coerce.number().int().min(0).default(0),
  lostCount: z.coerce.number().int().min(0).default(0),
  cashCollected: z.coerce.number().min(0).default(0),
  customerNotes: z.string().optional(),
  proofOfDeliveryUrl: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const authResult = await verifyMobileAuth(request, ["DRIVER"]);
    if (!authResult.ok) return authResult.response;

    const { orderId } = await params;
    if (!orderId) {
      return mobileError("VALIDATION_ERROR", "Order ID is required.", 400);
    }

    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parsed = completeDeliverySchema.safeParse(rawBody);
    if (!parsed.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message || "Invalid delivery exchange values.",
        422,
        parsed.error.issues
      );
    }

    const result = await completeStopBottleExchange({
      orderId,
      driverId: authResult.user.id,
      filledDelivered: parsed.data.filledDelivered,
      emptyCollected: parsed.data.emptyCollected,
      damagedCount: parsed.data.damagedCount,
      lostCount: parsed.data.lostCount,
      cashCollected: parsed.data.cashCollected,
      customerNotes: parsed.data.customerNotes,
      proofOfDeliveryUrl: parsed.data.proofOfDeliveryUrl,
    });

    return mobileSuccess(
      {
        stop: result.stop,
        exchange: result.exchange,
      },
      200,
      "Delivery completed and bottle exchange recorded."
    );
  } catch (error) {
    console.error("[Mobile API driver/stops/[orderId]/complete POST error]:", error);
    return mobileError("SERVER_ERROR", "Failed to complete delivery.", 500);
  }
}
