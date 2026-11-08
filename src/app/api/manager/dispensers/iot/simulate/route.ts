import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { simulateDispenserIoT } from "@/lib/dispenser-store";

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
    const { userId, event } = body;

    const validEvents = ["LOW_WATER", "TAMPER", "OFFLINE", "RESET"];
    if (!validEvents.includes(event)) {
      return NextResponse.json(
        { error: "Invalid simulation event." },
        { status: 400 }
      );
    }

    const targetUser = userId || "usr_customer_001";
    const updated = simulateDispenserIoT(targetUser, event);

    return NextResponse.json(
      {
        success: true,
        message: `Simulation event '${event}' triggered for dispenser ${updated.serialNumber}`,
        data: updated,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Manager IoT Simulate Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to simulate IoT event.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
