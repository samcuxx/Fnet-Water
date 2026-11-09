import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllTransactions, getTransactionMetrics } from "@/lib/transaction-store";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "ADMIN" && role !== "MANAGER") {
      return NextResponse.json(
        { success: false, error: "Forbidden. Administrative access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel") || "ALL";
    const type = searchParams.get("type") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const search = searchParams.get("search") || "";

    const [transactions, metrics] = await Promise.all([
      getAllTransactions({ channel, type, status, search }),
      getTransactionMetrics(),
    ]);

    return NextResponse.json({
      success: true,
      transactions,
      metrics,
    });
  } catch (error) {
    console.error("[API] Admin Transactions Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load transactions." },
      { status: 500 }
    );
  }
}
