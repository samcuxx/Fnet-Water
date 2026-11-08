import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  adjustStock,
  InventoryItemType,
  StockAction,
} from "@/lib/inventory-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!session || !session.user || (role !== "ADMIN" && role !== "MANAGER")) {
    return NextResponse.json(
      { error: "Unauthorized. Staff credentials required." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { itemType, action, quantity, reason } = body;

    const validItemTypes: InventoryItemType[] = [
      "FILLED_BOTTLES",
      "EMPTY_BOTTLES",
      "DAMAGED_BOTTLES",
      "LOST_BOTTLES",
      "DISPENSERS",
    ];

    if (!validItemTypes.includes(itemType)) {
      return NextResponse.json(
        { error: "Invalid item type specified." },
        { status: 400 }
      );
    }

    if (action !== "ADD" && action !== "DEDUCT") {
      return NextResponse.json(
        { error: "Action must be ADD or DEDUCT." },
        { status: 400 }
      );
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      return NextResponse.json(
        { error: "Quantity must be a positive whole number." },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== "string" || reason.trim().length < 5) {
      return NextResponse.json(
        { error: "A clear reason (at least 5 characters) is required for audit records." },
        { status: 400 }
      );
    }

    const result = await adjustStock({
      itemType,
      action: action as StockAction,
      quantity: qty,
      reason: reason.trim(),
      user: {
        name: session.user.name || "Manager",
        email: session.user.email || "manager@fnetwater.com",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Successfully adjusted ${itemType} by ${action === "ADD" ? "+" : "-"}${qty}`,
        data: result,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Inventory Adjust API Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to process stock adjustment.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
