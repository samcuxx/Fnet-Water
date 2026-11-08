import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { reportDispenserFault } from "@/lib/dispenser-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  try {
    const body = await req.json();
    const { issueType, description, urgency } = body;

    const fault = await reportDispenserFault(userId, {
      issueType: issueType || "OTHER",
      description,
      urgency: urgency || "NORMAL",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your service request has been logged. Our technician will contact you shortly.",
        data: fault,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Dispenser Fault Report Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to submit fault report.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
