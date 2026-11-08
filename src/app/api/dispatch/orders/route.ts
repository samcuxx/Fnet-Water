import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getAllDispatchStops } from "@/lib/dispatch-store";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ALL";

    const stops = await getAllDispatchStops(status);

    return NextResponse.json({
      success: true,
      stops,
      total: stops.length,
    });
  } catch (error) {
    console.error("[Dispatch Orders GET Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load dispatch queue." },
      { status: 500 }
    );
  }
}
