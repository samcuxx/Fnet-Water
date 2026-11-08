import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { startDeliveryRoute } from "@/lib/dispatch-store";

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
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required." },
        { status: 400 }
      );
    }

    const stop = await startDeliveryRoute(orderId);
    if (!stop) {
      return NextResponse.json(
        { success: false, message: "Stop not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Delivery route started. Order marked Out for Delivery.",
      stop,
    });
  } catch (error) {
    console.error("[Driver Start Route Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to start delivery route." },
      { status: 500 }
    );
  }
}
