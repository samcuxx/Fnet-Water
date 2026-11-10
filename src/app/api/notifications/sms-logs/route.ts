import { NextResponse } from "next/server";
import { getRecentSmsLogs } from "@/lib/notification-store";

export async function GET() {
  try {
    const logs = await getRecentSmsLogs(50);
    return NextResponse.json({
      success: true,
      logs,
      totalCount: logs.length,
    });
  } catch (error) {
    console.error("[api/notifications/sms-logs GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch SMS logs" },
      { status: 500 }
    );
  }
}
