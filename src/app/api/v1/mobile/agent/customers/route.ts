import { getAgentZoneCustomers, OPERATIONAL_ZONES } from "@/lib/agent-store";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

export async function GET(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request, ["AGENT"]);
    if (!authResult.ok) return authResult.response;

    const { searchParams } = new URL(request.url);
    const zone = searchParams.get("zone") || "All Zones";
    const search = searchParams.get("search") || "";

    const customers = await getAgentZoneCustomers(authResult.user.id, { zone, search });

    return mobileSuccess(
      {
        customers,
        total: customers.length,
        selectedZone: zone,
        operationalZones: [...OPERATIONAL_ZONES],
      },
      200,
      "Zone customers loaded successfully."
    );
  } catch (error) {
    console.error("[Mobile API agent/customers GET error]:", error);
    return mobileError("SERVER_ERROR", "Failed to load zone customers.", 500);
  }
}
