import { verifyPaystackTransaction } from "@/lib/paystack";
import {
  getTransactionByReference,
  PaymentChannel,
  updateTransactionStatus,
} from "@/lib/transaction-store";
import { getOrderByReference, updateOrderPaymentStatus } from "@/lib/order-store";
import { recordInstallmentPayment } from "@/lib/dispenser-store";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

export async function GET(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request, ["CUSTOMER"]);
    if (!authResult.ok) return authResult.response;

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference")?.trim();

    if (!reference) {
      return mobileError("VALIDATION_ERROR", "Payment reference is required.", 400);
    }

    const existing = await getTransactionByReference(reference);
    const verifyResult = await verifyPaystackTransaction(reference);

    if (!verifyResult || !verifyResult.status || !verifyResult.data) {
      return mobileError(
        "VERIFICATION_FAILED",
        verifyResult?.message || "Failed to verify payment with provider.",
        400
      );
    }

    const data = verifyResult.data;
    if (data.status !== "success") {
      return mobileError(
        "PAYMENT_NOT_COMPLETED",
        data.gateway_response || "Payment was not completed. Please try again.",
        400,
        { gatewayStatus: data.status }
      );
    }

    const channel: PaymentChannel =
      data.channel === "card"
        ? "CARD"
        : data.channel === "bank"
        ? "BANK_TRANSFER"
        : "MTN_MOMO";

    const updatedTx = await updateTransactionStatus(reference, "PAID", data);
    if (updatedTx) {
      updatedTx.channel = channel;
    }

    const targetOrderId = existing?.orderId || (data.metadata?.orderId as string | undefined);
    let order = null;
    if (targetOrderId) {
      order = await updateOrderPaymentStatus(targetOrderId, "PAID", reference);
    } else {
      order = await getOrderByReference(reference);
      if (order && order.paymentStatus !== "PAID") {
        order = await updateOrderPaymentStatus(order.id, "PAID", reference);
      }
    }

    const targetPlanId = existing?.planId || (data.metadata?.planId as string | undefined);
    const userId = authResult.user.id || existing?.customerProfileId;
    let dispenserResult = null;
    if (targetPlanId && userId) {
      try {
        const amountInGhs = data.amount / 100;
        dispenserResult = await recordInstallmentPayment(userId, {
          amount: amountInGhs,
          paymentMethod: channel === "CARD" ? "CARD" : "MOBILE_MONEY",
          referenceCode: reference,
        });
      } catch (err) {
        console.warn("[Mobile Verify] Dispenser installment notice:", err);
      }
    }

    return mobileSuccess(
      {
        reference,
        transaction: updatedTx || existing,
        order,
        dispenserResult,
      },
      200,
      "Payment verified and settled successfully."
    );
  } catch (error) {
    console.error("[Mobile API payments/verify GET error]:", error);
    return mobileError("SERVER_ERROR", "Internal error during payment verification.", 500);
  }
}
