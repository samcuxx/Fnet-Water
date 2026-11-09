import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recordInstallmentPayment } from "@/lib/dispenser-store";
import { recordTransaction, PaymentChannel } from "@/lib/transaction-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  try {
    const body = await req.json();
    const { amount, paymentMethod, momoNetwork, momoPhone } = body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "Payment amount must be greater than GH₵ 0.00." },
        { status: 400 }
      );
    }

    const result = await recordInstallmentPayment(userId, {
      amount: parsedAmount,
      paymentMethod: paymentMethod || "MOBILE_MONEY",
      momoNetwork,
      momoPhone,
    });

    // Record in global transactions ledger
    const userObj = session.user as { name?: string; phone?: string };
    const channel: PaymentChannel =
      paymentMethod === "CARD"
        ? "CARD"
        : momoNetwork === "Telecel"
        ? "TELECEL_CASH"
        : momoNetwork === "AT"
        ? "AT_MONEY"
        : "MTN_MOMO";

    await recordTransaction({
      reference: result.payment.referenceCode,
      planId: result.plan.id,
      customerProfileId: userId,
      customerName: userObj.name || "Customer",
      customerPhone: momoPhone || userObj.phone || "",
      amount: parsedAmount,
      currency: "GHS",
      channel,
      type: "DISPENSER_INSTALLMENT",
      status: "PAID",
      metadata: {
        isFullyPaid: result.plan.isFullyPaid,
        installmentsPaid: result.plan.installmentsPaidCount,
        totalInstallments: result.plan.totalInstallmentsCount,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: result.ownershipCelebration
          ? "Congratulations! Your smart dispenser is now 100% paid off and fully customer owned!"
          : `Payment of GH₵ ${parsedAmount.toFixed(2)} received successfully.`,
        data: result,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Dispenser Pay API Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to record payment.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
