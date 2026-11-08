import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDispensers } from "@/lib/inventory-store";

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
    const status = searchParams.get("status") || undefined;

    const dispensers = await getDispensers(status);

    const summary = {
      total: dispensers.length,
      available: dispensers.filter((d) => d.status === "AVAILABLE").length,
      onPlan: dispensers.filter((d) => d.status === "INSTALLED_ON_PLAN").length,
      owned: dispensers.filter((d) => d.status === "INSTALLED_OWNED").length,
      repair: dispensers.filter(
        (d) => d.status === "FAULTY" || d.status === "MAINTENANCE"
      ).length,
    };

    return NextResponse.json(
      {
        success: true,
        data: dispensers,
        summary,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Inventory Dispensers API Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve dispenser inventory." },
      { status: 500 }
    );
  }
}
