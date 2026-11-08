import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllBottleExchanges } from "@/lib/dispatch-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!session || !session.user || (role !== "ADMIN" && role !== "MANAGER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exchanges = getAllBottleExchanges();
  const summary = {
    totalExchanges: exchanges.length,
    totalFilledDelivered: exchanges.reduce((acc, e) => acc + e.filledDelivered, 0),
    totalEmptyCollected: exchanges.reduce((acc, e) => acc + e.emptyCollected, 0),
    totalDamaged: exchanges.reduce((acc, e) => acc + e.damagedCount, 0),
    totalCashCollected: exchanges.reduce((acc, e) => acc + e.cashCollected, 0),
  };

  return NextResponse.json({
    success: true,
    data: exchanges,
    summary,
  });
}
