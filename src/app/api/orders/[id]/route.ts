import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getOrderById, updateOrderStatus, OrderStatus } from "@/lib/order-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("[Order Details GET Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load order details." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, driverId, driverName } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status is required." },
        { status: 400 }
      );
    }

    const updated = await updateOrderStatus(id, status as OrderStatus, driverId, driverName);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}.`,
      order: updated,
    });
  } catch (error) {
    console.error("[Order Details PATCH Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order." },
      { status: 500 }
    );
  }
}
