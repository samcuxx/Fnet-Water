import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDriverStops } from "@/lib/dispatch-store";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const driverId = (session.user as { id?: string }).id || "usr_driver_001";
    const stops = await getDriverStops(driverId);

    return NextResponse.json({
      success: true,
      stops,
      total: stops.length,
    });
  } catch (error) {
    console.error("[Driver Stops GET Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load driver delivery stops." },
      { status: 500 }
    );
  }
}
