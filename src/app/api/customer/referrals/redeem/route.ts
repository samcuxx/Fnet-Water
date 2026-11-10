import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redeemCustomerFreeBottle } from "@/lib/referral-store";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id || "usr_customer_001";

    const result = await redeemCustomerFreeBottle(userId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Cannot redeem free bottle." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "1 Free Refill Bottle Credit redeemed! GH₵ 25.00 applied.",
      remainingBalance: result.remainingBalance,
    });
  } catch (error) {
    console.error("[Redeem Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to redeem free bottle.",
      },
      { status: 500 }
    );
  }
}
