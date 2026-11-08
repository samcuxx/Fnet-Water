import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAuditLogs } from "@/lib/inventory-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!session || !session.user || (role !== "ADMIN" && role !== "MANAGER")) {
    return NextResponse.json(
      { error: "Unauthorized. Staff credentials required." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const logs = await getAuditLogs(limit);

    return NextResponse.json(
      {
        success: true,
        data: logs,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Inventory Audit Logs API Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve inventory audit ledger." },
      { status: 500 }
    );
  }
}
