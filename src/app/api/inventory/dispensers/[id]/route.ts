import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateDispenserStatus, DispenserStatusType } from "@/lib/inventory-store";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!session || !session.user || (role !== "ADMIN" && role !== "MANAGER")) {
    return NextResponse.json(
      { error: "Unauthorized. Staff credentials required." },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, notes } = body;

    const validStatuses: DispenserStatusType[] = [
      "AVAILABLE",
      "INSTALLED_ON_PLAN",
      "INSTALLED_OWNED",
      "FAULTY",
      "MAINTENANCE",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid dispenser status." },
        { status: 400 }
      );
    }

    const updated = await updateDispenserStatus({
      id,
      status,
      notes,
      user: {
        name: session.user.name || "Manager",
        email: session.user.email || "manager@fnetwater.com",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updated,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Update Dispenser API Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to update dispenser.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
