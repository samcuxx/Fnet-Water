import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { completeStopBottleExchange } from "@/lib/dispatch-store";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const driverId = (session.user as { id?: string }).id || "usr_driver_001";
    const body = await request.json();
    const {
      orderId,
      filledDelivered = 0,
      emptyCollected = 0,
      damagedCount = 0,
      cashCollected = 0,
      customerNotes,
    } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required." },
        { status: 400 }
      );
    }

    const result = await completeStopBottleExchange({
      orderId,
      driverId,
      filledDelivered: Number(filledDelivered),
      emptyCollected: Number(emptyCollected),
      damagedCount: Number(damagedCount),
      cashCollected: Number(cashCollected),
      customerNotes,
    });

    return NextResponse.json({
      success: true,
      message: "Delivery completed and bottle exchange recorded.",
      stop: result.stop,
      exchange: result.exchange,
    });
  } catch (error) {
    console.error("[Driver Bottle Exchange Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to record bottle exchange." },
      { status: 500 }
    );
  }
}
