import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { calculateOrderPricing } from "@/lib/order-store";
import { getCustomerProfile } from "@/lib/customer-store";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id || "usr_customer_001";
    const profile = await getCustomerProfile(userId);

    const body = await request.json();
    const { items = [], hasEmptyBottleExchange = true, redeemFreeRefill = false } = body;

    const pricing = await calculateOrderPricing(
      items,
      Boolean(hasEmptyBottleExchange),
      Boolean(redeemFreeRefill),
      profile.freeBottleBalance
    );

    return NextResponse.json({
      success: true,
      pricing,
    });
  } catch (error) {
    console.error("[Orders Calculate Error]:", error);
    return NextResponse.json(
      { success: false, message: "Calculation failed." },
      { status: 500 }
    );
  }
}
