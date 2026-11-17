import { z } from "zod";
import { createCustomerOrder, getCustomerOrders } from "@/lib/order-store";
import { getCustomerAddresses } from "@/lib/customer-store";
import { recordTransaction } from "@/lib/transaction-store";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().positive("Item quantity must be at least 1."),
      })
    )
    .min(1, "Please select at least one water product."),
  deliveryAddressId: z.string().optional(),
  deliverySlot: z
    .enum(["Morning (8am - 12pm)", "Afternoon (12pm - 4pm)", "Evening (4pm - 7pm)"])
    .default("Morning (8am - 12pm)"),
  deliveryDate: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  hasEmptyBottleExchange: z.boolean().default(true),
  redeemFreeRefill: z.boolean().default(false),
  paymentMethod: z
    .enum(["MOBILE_MONEY", "CARD", "CASH_ON_DELIVERY", "BANK_TRANSFER"])
    .default("MOBILE_MONEY"),
});

export async function GET(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request, ["CUSTOMER"]);
    if (!authResult.ok) return authResult.response;

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status")?.toUpperCase();
    const search = searchParams.get("search")?.trim().toLowerCase();

    let orders = await getCustomerOrders(authResult.user.id);

    if (statusFilter && statusFilter !== "ALL") {
      orders = orders.filter((o) => o.status === statusFilter);
    }

    if (search) {
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(search) ||
          o.deliveryAddressText.toLowerCase().includes(search) ||
          o.deliveryDigitalAddress.toLowerCase().includes(search) ||
          o.items.some((it) => it.productName.toLowerCase().includes(search))
      );
    }

    return mobileSuccess(
      {
        orders,
        total: orders.length,
      },
      200,
      "Orders loaded successfully."
    );
  } catch (error) {
    console.error("[Mobile API customer/orders GET error]:", error);
    return mobileError("SERVER_ERROR", "Failed to load customer orders.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request, ["CUSTOMER"]);
    if (!authResult.ok) return authResult.response;

    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parsed = createOrderSchema.safeParse(rawBody);
    if (!parsed.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message || "Please check your order details.",
        422,
        parsed.error.issues
      );
    }

    const user = authResult.dbUser;
    const addresses = await getCustomerAddresses(user.id);
    const selectedAddress =
      addresses.find((a) => a.id === parsed.data.deliveryAddressId) ||
      addresses.find((a) => a.isDefault) ||
      addresses[0];

    if (!selectedAddress) {
      return mobileError(
        "ADDRESS_REQUIRED",
        "Please add or select a delivery address before placing an order.",
        400
      );
    }

    const order = await createCustomerOrder({
      userId: user.id,
      customerName: user.name,
      customerPhone: user.phone,
      deliveryAddressId: selectedAddress.id,
      deliveryAddressText: selectedAddress.areaName,
      deliveryDigitalAddress: selectedAddress.digitalAddress,
      deliverySlot: parsed.data.deliverySlot,
      deliveryDate: parsed.data.deliveryDate || new Date().toISOString(),
      deliveryInstructions: parsed.data.deliveryInstructions,
      hasEmptyBottleExchange: parsed.data.hasEmptyBottleExchange,
      redeemFreeRefill: parsed.data.redeemFreeRefill,
      paymentMethod: parsed.data.paymentMethod,
      paymentStatus: "UNPAID",
      items: parsed.data.items,
    });

    if (parsed.data.paymentMethod === "CASH_ON_DELIVERY" || order.totalAmount === 0) {
      await recordTransaction({
        reference:
          order.paymentReference || `FNW-TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerProfileId: user.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        amount: order.totalAmount,
        currency: "GHS",
        channel: "CASH_ON_DELIVERY",
        type: "WATER_ORDER",
        status: order.totalAmount === 0 ? "PAID" : "UNPAID",
        metadata: {
          address: order.deliveryAddressText,
          digitalAddress: order.deliveryDigitalAddress,
          itemsCount: order.items.length,
          source: "mobile",
        },
      });
    }

    return mobileSuccess({ order }, 201, "Order placed successfully.");
  } catch (error) {
    console.error("[Mobile API customer/orders POST error]:", error);
    return mobileError("SERVER_ERROR", "Failed to place order.", 500);
  }
}
