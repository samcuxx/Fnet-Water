import { startDeliveryRoute } from "@/lib/dispatch-store";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

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

    const stop = await startDeliveryRoute(orderId);
    if (!stop) {
      return mobileError("NOT_FOUND", "Delivery stop not found.", 404);
    }

    return mobileSuccess(
      { stop },
      200,
      "Delivery is now out for delivery. Customer notified."
    );
  } catch (error) {
    console.error("[Mobile API driver/stops/[orderId]/start POST error]:", error);
    return mobileError("SERVER_ERROR", "Failed to start delivery.", 500);
  }
}
