import { getCustomerDispenserPlan } from "@/lib/dispenser-store";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request, ["CUSTOMER"]);
    if (!authResult.ok) return authResult.response;

    const data = await getCustomerDispenserPlan(authResult.user.id);
    return mobileSuccess(data, 200, "Dispenser details loaded successfully.");
  } catch (error) {
    console.error("[Mobile API customer/dispenser GET error]:", error);
    return mobileError("SERVER_ERROR", "Failed to load dispenser details.", 500);
  }
}
