import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { assignOrderToDriver } from "@/lib/dispatch-store";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, driverId, vanNumber, notes } = body;

    if (!orderId || !driverId) {
      return NextResponse.json(
        { success: false, message: "Order ID and Driver ID are required." },
        { status: 400 }
      );
    }

    const stop = await assignOrderToDriver(orderId, driverId, vanNumber, notes);
    if (!stop) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order assigned to ${stop.driverName}.`,
      stop,
    });
  } catch (error) {
    console.error("[Dispatch Assign POST Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to assign driver." },
      { status: 500 }
    );
  }
}
