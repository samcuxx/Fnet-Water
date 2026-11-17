import { getCustomerReferralStats } from "@/lib/referral-store";
import {
  getRequestOrigin,
  mobileError,
  mobileSuccess,
  verifyMobileAuth,
} from "@/lib/mobile-auth";

export async function GET(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request, ["CUSTOMER"]);
    if (!authResult.ok) return authResult.response;

    const stats = await getCustomerReferralStats(
      authResult.user.id,
      getRequestOrigin(request)
    );
    return mobileSuccess(stats, 200, "Referral stats loaded successfully.");
  } catch (error) {
    console.error("[Mobile API customer/referrals GET error]:", error);
    return mobileError("SERVER_ERROR", "Failed to load referral stats.", 500);
  }
}
