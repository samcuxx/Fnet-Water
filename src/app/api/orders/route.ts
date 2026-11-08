import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createCustomerOrder, getCustomerOrders, getAllOrders } from "@/lib/order-store";
import { getCustomerAddresses } from "@/lib/customer-store";
import { getUserById } from "@/lib/auth-store";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const role = (session.user as { role?: string }).role;
    const userId = (session.user as { id?: string }).id || "usr_customer_001";

    const orders =
      role === "ADMIN" || role === "MANAGER"
        ? await getAllOrders()
        : await getCustomerOrders(userId);

    return NextResponse.json({
      success: true,
      orders,
      total: orders.length,
    });
  } catch (error) {
    console.error("[Orders GET Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load orders." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in to place an order." },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id || "usr_customer_001";
    const user = await getUserById(userId);
    const body = await request.json();

    const {
      items,
      deliveryAddressId,
      deliverySlot = "Morning (8am - 12pm)",
      deliveryDate,
      deliveryInstructions,
      hasEmptyBottleExchange = true,
      redeemFreeRefill = false,
      paymentMethod = "MOBILE_MONEY",
    } = body;

    // 1. Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please select at least one water product." },
        { status: 400 }
      );
    }

    const validItems = items.filter((it: { productId?: string; quantity?: number }) => it.productId && (it.quantity || 0) > 0);
    if (validItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Item quantity must be greater than zero." },
        { status: 400 }
      );
    }

    // 2. Validate address
    const addresses = await getCustomerAddresses(userId);
    const selectedAddress =
      addresses.find((a) => a.id === deliveryAddressId) ||
      addresses.find((a) => a.isDefault) ||
      addresses[0];

    if (!selectedAddress) {
      return NextResponse.json(
        { success: false, message: "Please select or add a delivery address." },
        { status: 400 }
      );
    }

    // 3. Create Order
    const order = await createCustomerOrder({
      userId,
      customerName: user?.name || session.user.name || "Customer",
      customerPhone: user?.phone || "0241000005",
      deliveryAddressId: selectedAddress.id,
      deliveryAddressText: selectedAddress.areaName,
      deliveryDigitalAddress: selectedAddress.digitalAddress,
      deliverySlot,
      deliveryDate: deliveryDate || new Date().toISOString(),
      deliveryInstructions,
      hasEmptyBottleExchange: Boolean(hasEmptyBottleExchange),
      redeemFreeRefill: Boolean(redeemFreeRefill),
      paymentMethod,
      items: validItems,
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    console.error("[Orders POST Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to place order." },
      { status: 500 }
    );
  }
}
