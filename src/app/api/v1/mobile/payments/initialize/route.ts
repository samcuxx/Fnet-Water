import { z } from "zod";
import {
  initializePaystackPayment,
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
} from "@/lib/paystack";
import {
  PaymentChannel,
  recordTransaction,
  TransactionType,
} from "@/lib/transaction-store";
import { updateOrderPaymentStatus } from "@/lib/order-store";
import {
  getRequestOrigin,
  mobileError,
  mobileSuccess,
  verifyMobileAuth,
} from "@/lib/mobile-auth";

const initPaymentSchema = z.object({
  amount: z.coerce.number().positive("Payment amount must be greater than zero."),
  type: z
    .enum(["WATER_ORDER", "DISPENSER_INSTALLMENT", "DISPENSER_DEPOSIT", "TAKEAWAY_BOTTLES"])
    .default("WATER_ORDER"),
  orderId: z.string().optional(),
  orderNumber: z.string().optional(),
  planId: z.string().optional(),
  channel: z
    .enum(["MTN_MOMO", "TELECEL_CASH", "AT_MONEY", "CARD", "BANK_TRANSFER"])
    .default("MTN_MOMO"),
  callbackUrl: z.string().optional(),
  orderPayload: z
    .object({
      items: z.array(
        z.object({
          productId: z.string().min(1),
          quantity: z.coerce.number().int().positive(),
        })
      ),
      deliveryAddressId: z.string().optional(),
      deliverySlot: z.enum([
        "Morning (8am - 12pm)",
        "Afternoon (12pm - 4pm)",
        "Evening (4pm - 7pm)",
      ]).default("Morning (8am - 12pm)"),
      deliveryDate: z.string().optional(),
      deliveryInstructions: z.string().optional(),
      hasEmptyBottleExchange: z.boolean().default(true),
      redeemFreeRefill: z.boolean().default(false),
      paymentMethod: z.enum(["MOBILE_MONEY", "CARD", "CASH_ON_DELIVERY", "BANK_TRANSFER"]).default("MOBILE_MONEY"),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request, ["CUSTOMER"]);
    if (!authResult.ok) return authResult.response;

    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parsed = initPaymentSchema.safeParse(rawBody);
    if (!parsed.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message || "Invalid payment parameters.",
        422,
        parsed.error.issues
      );
    }

    const { amount, type, orderId, orderNumber, planId, channel, callbackUrl, orderPayload } = parsed.data;
    const user = authResult.dbUser;
    const email = user.email || `${user.phone}@fnetwater.com`;
    const reference = `FNW-TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const origin = getRequestOrigin(request);
    const resolvedCallback = callbackUrl || `${origin}/customer/payment-callback?reference=${reference}`;

    const paystackRes = await initializePaystackPayment({
      email,
      amount,
      reference,
      callbackUrl: resolvedCallback,
      metadata: {
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        orderId,
        orderNumber,
        planId,
        type,
        source: "mobile",
        orderPayload,
      },
    });

    if (!paystackRes.status || !paystackRes.data) {
      return mobileError(
        "PAYMENT_INIT_FAILED",
        paystackRes.message || "Could not connect to payment provider.",
        502
      );
    }

    await recordTransaction({
      reference,
      orderId,
      orderNumber,
      planId,
      customerProfileId: user.id,
      customerName: user.name,
      customerPhone: user.phone,
      amount,
      currency: "GHS",
      channel: channel as PaymentChannel,
      type: type as TransactionType,
      status: "UNPAID",
      metadata: {
        accessCode: paystackRes.data.access_code,
        source: "mobile",
        orderPayload,
      },
    });

    if (orderId) {
      await updateOrderPaymentStatus(orderId, "UNPAID", reference);
    }

    return mobileSuccess(
      {
        reference,
        authorizationUrl: paystackRes.data.authorization_url,
        accessCode: paystackRes.data.access_code,
        publicKey: NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email,
        amount,
        currency: "GHS",
      },
      200,
      "Payment initialized successfully."
    );
  } catch (error) {
    console.error("[Mobile API payments/initialize POST error]:", error);
    return mobileError("SERVER_ERROR", "Internal error during payment initialization.", 500);
  }
}
