import { redeemCustomerFreeBottle } from "@/lib/referral-store";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

export async function POST(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request, ["CUSTOMER"]);
    if (!authResult.ok) return authResult.response;

    const result = await redeemCustomerFreeBottle(authResult.user.id);
    if (!result.success) {
      return mobileError(
        "REDEEM_FAILED",
        result.error || "Cannot redeem free bottle credit.",
        400
      );
    }

    return mobileSuccess(
      { remainingBalance: result.remainingBalance },
      200,
      "1 Free Refill Bottle Credit redeemed! GH₵ 25.00 applied."
    );
  } catch (error) {
    console.error("[Mobile API customer/referrals/redeem POST error]:", error);
    return mobileError("SERVER_ERROR", "Failed to redeem free bottle credit.", 500);
  }
}
