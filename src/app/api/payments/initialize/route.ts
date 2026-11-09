import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initializePaystackPayment } from "@/lib/paystack";
import { recordTransaction, PaymentChannel, TransactionType } from "@/lib/transaction-store";
import { updateOrderPaymentStatus } from "@/lib/order-store";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to make payments." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amount, type = "WATER_ORDER", orderId, orderNumber, planId, channel = "MTN_MOMO", callbackUrl } = body;

    const parsedAmount = typeof amount === "number" ? amount : parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid payment amount." },
        { status: 400 }
      );
    }

    const user = session.user as { id?: string; name?: string; email?: string; phone?: string };
    const email = user.email || `${user.phone || "customer"}@fnetwater.com`;
    const reference = `FNW-TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const origin =
      req.headers.get("origin") ||
      (req.headers.get("referer") ? req.headers.get("referer")!.split("/").slice(0, 3).join("/") : "") ||
      "http://localhost:3000";
    const defaultCallback = `${origin}/customer/payment-callback?reference=${reference}`;

    const paystackRes = await initializePaystackPayment({
      email,
      amount: parsedAmount,
      reference,
      callbackUrl: callbackUrl || defaultCallback,
      metadata: {
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        orderId,
        orderNumber,
        planId,
        type,
      },
    });

    if (!paystackRes.status || !paystackRes.data) {
      return NextResponse.json(
        { success: false, error: paystackRes.message || "Failed to initialize payment." },
        { status: 502 }
      );
    }

    // Record pending transaction
    await recordTransaction({
      reference,
      orderId,
      orderNumber,
      planId,
      customerProfileId: user.id || "unknown",
      customerName: user.name || "Customer",
      customerPhone: user.phone || "",
      amount: parsedAmount,
      currency: "GHS",
      channel: channel as PaymentChannel,
      type: type as TransactionType,
      status: "UNPAID",
      metadata: {
        accessCode: paystackRes.data.access_code,
      },
    });

    // Link reference to order
    if (orderId) {
      await updateOrderPaymentStatus(orderId, "UNPAID", reference);
    }

    return NextResponse.json({
      success: true,
      reference,
      authorizationUrl: paystackRes.data.authorization_url,
      accessCode: paystackRes.data.access_code,
      amount: parsedAmount,
    });
  } catch (error) {
    console.error("[API] Payment Initialization Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during payment initialization." },
      { status: 500 }
    );
  }
}
