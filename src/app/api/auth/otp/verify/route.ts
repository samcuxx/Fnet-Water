import { NextResponse } from "next/server";
import { normalizeGhanaPhone } from "@/lib/mnotify";
import { findUserByIdentifier, verifyStoredOtp } from "@/lib/auth-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawPhone = body.phone?.trim();
    const otpCode = body.otpCode?.trim();

    if (!rawPhone || !otpCode) {
      return NextResponse.json(
        { success: false, message: "Phone number and verification code are required." },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeGhanaPhone(rawPhone);
    const isValid = await verifyStoredOtp(normalizedPhone, otpCode);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired verification code. Please request a new one." },
        { status: 400 }
      );
    }

    const user = await findUserByIdentifier(normalizedPhone);

    return NextResponse.json({
      success: true,
      verified: true,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
          }
        : null,
      isNewUser: !user,
    });
  } catch (error) {
    console.error("[OTP Verify Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to verify OTP code.",
      },
      { status: 500 }
    );
  }
}
