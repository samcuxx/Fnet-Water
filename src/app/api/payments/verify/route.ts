import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyPaystackTransaction } from "@/lib/paystack";
import {
  getTransactionByReference,
  updateTransactionStatus,
  PaymentChannel,
} from "@/lib/transaction-store";
import { updateOrderPaymentStatus, getOrderById, getOrderByReference } from "@/lib/order-store";
import { recordInstallmentPayment } from "@/lib/dispenser-store";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Payment reference is required." },
        { status: 400 }
      );
    }

    // Check existing transaction
    const existing = await getTransactionByReference(reference);

    // Call official Paystack Verification
    const verifyResult = await verifyPaystackTransaction(reference);

    if (!verifyResult || !verifyResult.status || !verifyResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: verifyResult?.message || "Failed to reach Paystack payment verification.",
        },
        { status: 400 }
      );
    }

    const data = verifyResult.data;

    // Check if status on Paystack is successful
    if (data.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          status: data.status,
          error: data.gateway_response || "Payment was not completed. Please try again.",
        },
        { status: 400 }
      );
    }

    // Map Paystack channel
    const channel: PaymentChannel =
      data.channel === "card"
        ? "CARD"
        : data.channel === "bank"
        ? "BANK_TRANSFER"
        : "MTN_MOMO";

    // Idempotent update: mark transaction as PAID
    const updatedTx = await updateTransactionStatus(reference, "PAID", data);
    if (updatedTx) {
      updatedTx.channel = channel;
    }

    // Fulfill Order if linked
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

    // Fulfill Dispenser Plan if linked
    const targetPlanId = existing?.planId || (data.metadata?.planId as string | undefined);
    const userId = session.user.id || existing?.customerProfileId;
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
        console.warn("[Verify] Dispenser installment notice:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and reconciled with Paystack.",
      transaction: updatedTx || existing,
      order,
      dispenserResult,
    });
  } catch (error) {
    console.error("[API] Payment Verification Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during payment verification." },
      { status: 500 }
    );
  }
}
