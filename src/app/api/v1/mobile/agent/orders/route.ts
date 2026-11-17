import { z } from "zod";
import { createAgentQuickRefillOrder } from "@/lib/agent-store";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

const agentOrderSchema = z.object({
  zoneCustomerId: z.string().min(1, "Customer ID is required."),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1 bottle."),
  hasEmptyBottleExchange: z.boolean().default(true),
  deliverySlot: z
    .enum(["Morning (8am - 12pm)", "Afternoon (12pm - 4pm)", "Evening (4pm - 7pm)"])
    .default("Morning (8am - 12pm)"),
  deliveryInstructions: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request, ["AGENT"]);
    if (!authResult.ok) return authResult.response;

    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parsed = agentOrderSchema.safeParse(rawBody);
    if (!parsed.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message || "Invalid order details.",
        422,
        parsed.error.issues
      );
    }

    const result = await createAgentQuickRefillOrder(authResult.user.id, parsed.data);
    if (!result.success) {
      return mobileError("ORDER_FAILED", result.error || "Could not dispatch order.", 400);
    }

    return mobileSuccess(
      {
        order: result.order,
        customer: result.customer,
      },
      201,
      `Refill order ${result.order?.orderNumber} dispatched for ${result.customer?.customerName}.`
    );
  } catch (error) {
    console.error("[Mobile API agent/orders POST error]:", error);
    return mobileError("SERVER_ERROR", "Failed to dispatch quick refill order.", 500);
  }
}
