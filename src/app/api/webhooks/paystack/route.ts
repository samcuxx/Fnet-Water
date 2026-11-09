import { NextResponse } from "next/server";
import { verifyPaystackWebhookSignature } from "@/lib/paystack";
import {
  getTransactionByReference,
  recordTransaction,
  updateTransactionStatus,
  PaymentChannel,
  TransactionType,
} from "@/lib/transaction-store";
import { updateOrderPaymentStatus, getOrderByReference } from "@/lib/order-store";
import { recordInstallmentPayment } from "@/lib/dispenser-store";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-paystack-signature");
    const rawBody = await req.text();

    // 1. Verify HMAC SHA512 Signature
    const isValid = verifyPaystackWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn("[Webhook] Invalid Paystack signature rejected.");
      return NextResponse.json(
        { error: "Invalid Paystack signature." },
        { status: 401 }
      );
    }

    // 2. Parse event payload
    const event = JSON.parse(rawBody);

    if (event.event === "charge.success" && event.data) {
      const data = event.data;
      const reference = data.reference;
      // Convert pesewas to GH₵
      const amount = data.amount ? data.amount / 100 : 0;
      const metadata = data.metadata || {};
      const channelRaw = data.channel || "mobile_money";

      const channel: PaymentChannel =
        channelRaw === "card"
          ? "CARD"
          : channelRaw.includes("telecel")
          ? "TELECEL_CASH"
          : channelRaw.includes("at_money")
          ? "AT_MONEY"
          : "MTN_MOMO";

      const type: TransactionType =
        metadata.type === "DISPENSER_INSTALLMENT"
          ? "DISPENSER_INSTALLMENT"
          : metadata.type === "DISPENSER_DEPOSIT"
          ? "DISPENSER_DEPOSIT"
          : "WATER_ORDER";

      // 3. Idempotency Check: if already processed and PAID, ignore duplicate webhook
      const existing = await getTransactionByReference(reference);
      if (existing && existing.status === "PAID") {
        return NextResponse.json({
          status: "success",
          message: "Transaction already processed.",
        });
      }

      // 4. Update or Record Transaction
      if (existing) {
        await updateTransactionStatus(reference, "PAID", data);
      } else {
        await recordTransaction({
          reference,
          orderId: metadata.orderId,
          orderNumber: metadata.orderNumber,
          planId: metadata.planId,
          customerProfileId: metadata.userId || data.customer?.id || "unknown",
          customerName: metadata.userName || data.customer?.first_name || "Customer",
          customerPhone: metadata.userPhone || data.customer?.phone || "",
          amount,
          currency: data.currency || "GHS",
          channel,
          type,
          status: "PAID",
          paystackPayload: data,
          metadata,
          paidAt: data.paid_at || new Date().toISOString(),
        });
      }

      // 5. Fulfill Order if linked
      const targetOrderId = metadata.orderId || existing?.orderId;
      if (targetOrderId) {
        await updateOrderPaymentStatus(targetOrderId, "PAID", reference);
      } else {
        const order = await getOrderByReference(reference);
        if (order && order.paymentStatus !== "PAID") {
          await updateOrderPaymentStatus(order.id, "PAID", reference);
        }
      }

      // 6. Fulfill Dispenser Installment if linked
      const targetPlanId = metadata.planId || existing?.planId;
      const targetUserId = metadata.userId || existing?.customerProfileId;
      if (targetPlanId && targetUserId) {
        try {
          await recordInstallmentPayment(targetUserId, {
            amount,
            paymentMethod: "MOBILE_MONEY",
            referenceCode: reference,
          });
        } catch (err) {
          console.warn("[Webhook] Dispenser installment update notice:", err);
        }
      }
    }

    return NextResponse.json({
      status: "success",
      received: true,
    });
  } catch (error) {
    console.error("[Webhook] Processing Error:", error);
    return NextResponse.json(
      { error: "Webhook internal server error." },
      { status: 500 }
    );
  }
}
