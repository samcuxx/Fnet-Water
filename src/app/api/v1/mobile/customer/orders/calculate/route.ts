import { z } from "zod";
import { calculateOrderPricing } from "@/lib/order-store";
import { getCustomerProfile } from "@/lib/customer-store";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

const calculateSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(0),
      })
    )
    .default([]),
  hasEmptyBottleExchange: z.boolean().default(true),
  redeemFreeRefill: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request, ["CUSTOMER"]);
    if (!authResult.ok) return authResult.response;

    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parsed = calculateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return mobileError("VALIDATION_ERROR", "Invalid cart items.", 422, parsed.error.issues);
    }

    const profile = await getCustomerProfile(authResult.user.id);
    const pricing = await calculateOrderPricing(
      parsed.data.items,
      parsed.data.hasEmptyBottleExchange,
      parsed.data.redeemFreeRefill,
      profile.freeBottleBalance
    );

    return mobileSuccess(pricing, 200, "Order pricing calculated.");
  } catch (error) {
    console.error("[Mobile API customer/orders/calculate POST error]:", error);
    return mobileError("SERVER_ERROR", "Failed to calculate order total.", 500);
  }
}
