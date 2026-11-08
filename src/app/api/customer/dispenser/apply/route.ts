import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { applyForDispenserPlan } from "@/lib/dispenser-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  try {
    const body = await req.json();
    const { modelName, deliveryAddressText, paymentMethod, momoNetwork, momoPhone } = body;

    if (!modelName || !deliveryAddressText) {
      return NextResponse.json(
        { error: "Model name and delivery address are required." },
        { status: 400 }
      );
    }

    const plan = await applyForDispenserPlan(userId, {
      modelName,
      deliveryAddressText,
      paymentMethod: paymentMethod || "MOBILE_MONEY",
      momoNetwork,
      momoPhone,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Dispenser rent-to-own plan activated successfully.",
        data: plan,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Dispenser Apply API Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to apply for dispenser.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
