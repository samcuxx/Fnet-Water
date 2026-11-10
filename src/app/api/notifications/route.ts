import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getNotificationsForUser,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/notification-store";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);

    // Prefer session user, fallback to query params for API testing / SSR
    const userId = session?.user?.id || searchParams.get("userId") || "usr_customer_001";
    const role = (session?.user as any)?.role || searchParams.get("role") || "CUSTOMER";

    const notifications = await getNotificationsForUser(userId, role);
    const unreadCount = await getUnreadNotificationCount(userId, role);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("[api/notifications GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json().catch(() => ({}));
    const { id, markAll, userId: paramUserId, role: paramRole } = body;

    const userId = session?.user?.id || paramUserId || "usr_customer_001";
    const role = (session?.user as any)?.role || paramRole || "CUSTOMER";

    if (markAll) {
      const count = await markAllNotificationsAsRead(userId, role);
      return NextResponse.json({
        success: true,
        message: `Marked ${count} notifications as read`,
        updatedCount: count,
      });
    }

    if (id) {
      const ok = await markNotificationAsRead(id, userId);
      return NextResponse.json({
        success: ok,
        message: ok ? "Notification marked as read" : "Notification not found",
      });
    }

    return NextResponse.json(
      { success: false, error: "Missing notification id or markAll flag" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[api/notifications POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
