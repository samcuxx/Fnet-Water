import { getAgentDashboardPayload } from "@/lib/agent-store";
import { getUnreadNotificationCount } from "@/lib/notification-store";
import {
  getRequestOrigin,
  mobileError,
  mobileSuccess,
  verifyMobileAuth,
} from "@/lib/mobile-auth";

export async function GET(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request, ["AGENT"]);
    if (!authResult.ok) return authResult.response;

    const { searchParams } = new URL(request.url);
    const zone = searchParams.get("zone") || "All Zones";

    const [dashboard, unreadNotifications] = await Promise.all([
      getAgentDashboardPayload(authResult.user.id, zone, getRequestOrigin(request)),
      getUnreadNotificationCount(authResult.user.id, "AGENT"),
    ]);

    return mobileSuccess(
      {
        ...dashboard,
        unreadNotifications,
      },
      200,
      "Agent zone dashboard loaded successfully."
    );
  } catch (error) {
    console.error("[Mobile API agent/dashboard GET error]:", error);
    return mobileError("SERVER_ERROR", "Failed to load agent dashboard.", 500);
  }
}
