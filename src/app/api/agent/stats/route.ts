import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAgentStats } from "@/lib/referral-store";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id || "usr_agent_001";

    const origin =
      typeof request.headers.get("origin") === "string"
        ? request.headers.get("origin")!
        : request.headers.get("host")
        ? `http://${request.headers.get("host")}`
        : "http://localhost:3000";

    const stats = await getAgentStats(userId, origin);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("[Agent Stats API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load agent statistics.",
      },
      { status: 500 }
    );
  }
}
