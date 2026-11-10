import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { agentOnboardCustomer } from "@/lib/referral-store";
import { normalizeGhanaPhone } from "@/lib/mnotify";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const agentUserId = (session?.user as { id?: string })?.id || "usr_agent_001";

    const body = await request.json();
    const { name, email, phone, deliveryArea } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Customer full name is required." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!phone || phone.trim().length < 9) {
      return NextResponse.json(
        { success: false, error: "A valid phone number is required." },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeGhanaPhone(phone);

    const result = await agentOnboardCustomer(agentUserId, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: normalizedPhone,
      deliveryArea: deliveryArea?.trim() || "Assigned Area",
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Customer onboarding failed." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Customer ${name} successfully onboarded and tagged with your referral code!`,
      customer: result.customer,
    });
  } catch (error) {
    console.error("[Agent Onboard Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to onboard customer.",
      },
      { status: 500 }
    );
  }
}
