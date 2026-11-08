import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDispenserFaults } from "@/lib/dispenser-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!session || !session.user || (role !== "ADMIN" && role !== "MANAGER")) {
    return NextResponse.json(
      { error: "Unauthorized. Staff credentials required." },
      { status: 401 }
    );
  }

  try {
    const faults = getDispenserFaults();
    return NextResponse.json(
      { success: true, data: faults },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Manager Dispenser Faults API Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve dispenser faults." },
      { status: 500 }
    );
  }
}
