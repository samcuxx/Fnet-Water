import {
  getNotificationsForUser,
  getRecentSmsLogs,
  getUnreadNotificationCount,
} from "@/lib/notification-store";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

export async function GET(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request);
    if (!authResult.ok) return authResult.response;

    const { user, dbUser } = authResult;
    const [notifications, unreadCount, allSmsLogs] = await Promise.all([
      getNotificationsForUser(user.id, user.role),
      getUnreadNotificationCount(user.id, user.role),
      getRecentSmsLogs(50),
    ]);

    // Filter SMS logs to this user's phone number for strict privacy isolation
    const userPhoneTail = dbUser.phone.replace(/\D/g, "").slice(-9);
    const smsLogs = allSmsLogs.filter((log) => {
      const logTail = log.recipientPhone.replace(/\D/g, "").slice(-9);
      return !userPhoneTail || logTail === userPhoneTail;
    });

    const operationalCount = notifications.filter(
      (n) => n.type === "ORDER" || n.type === "DELIVERY"
    ).length;

    return mobileSuccess(
      {
        notifications,
        smsLogs,
        metrics: {
          totalCount: notifications.length,
          unreadCount,
          operationalCount,
          totalSmsCount: smsLogs.length,
        },
      },
      200,
      "Notifications loaded successfully."
    );
  } catch (error) {
    console.error("[Mobile API notifications GET error]:", error);
    return mobileError("SERVER_ERROR", "Failed to load notifications.", 500);
  }
}
