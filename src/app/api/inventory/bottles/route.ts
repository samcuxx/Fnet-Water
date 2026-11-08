import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBottleInventory, getLowStockAlerts } from "@/lib/inventory-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!session || !session.user || (role !== "ADMIN" && role !== "MANAGER")) {
    return NextResponse.json(
      { error: "Unauthorized. Staff credentials required." },
      { status: 401 }
    );
  }

  try {
    const bottles = await getBottleInventory();
    const alerts = await getLowStockAlerts();

    return NextResponse.json(
      {
        success: true,
        data: bottles,
        alerts,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Inventory Bottles API Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve bottle inventory." },
      { status: 500 }
    );
  }
}
