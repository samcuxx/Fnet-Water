import { getOrderById } from "@/lib/order-store";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyMobileAuth(request, ["CUSTOMER"]);
    if (!authResult.ok) return authResult.response;

    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return mobileError("NOT_FOUND", "Order not found.", 404);
    }

    if (order.userId !== authResult.user.id) {
      return mobileError("FORBIDDEN", "You do not have access to this order.", 403);
    }

    return mobileSuccess({ order }, 200, "Order details loaded.");
  } catch (error) {
    console.error("[Mobile API customer/orders/[id] GET error]:", error);
    return mobileError("SERVER_ERROR", "Failed to load order details.", 500);
  }
}
