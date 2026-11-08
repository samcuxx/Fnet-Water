import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getActiveDrivers } from "@/lib/dispatch-store";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const drivers = await getActiveDrivers();

    return NextResponse.json({
      success: true,
      drivers,
      total: drivers.length,
    });
  } catch (error) {
    console.error("[Dispatch Drivers GET Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load fleet drivers." },
      { status: 500 }
    );
  }
}
