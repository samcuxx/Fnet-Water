import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCustomerDispenserPlan } from "@/lib/dispenser-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  try {
    const data = await getCustomerDispenserPlan(userId);
    return NextResponse.json(
      { success: true, ...data },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Customer Dispenser API Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve dispenser plan." },
      { status: 500 }
    );
  }
}
