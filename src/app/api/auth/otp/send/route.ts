import { NextResponse } from "next/server";
import { generateOtp, normalizeGhanaPhone, sendOtpSms } from "@/lib/mnotify";
import { storeOtp } from "@/lib/auth-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawPhone = body.phone?.trim();

    if (!rawPhone) {
      return NextResponse.json(
        { success: false, message: "Ghana phone number is required." },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeGhanaPhone(rawPhone);

    // Ghana phone numbers typically have 10 digits (e.g. 0241234567)
    if (normalizedPhone.length < 9 || normalizedPhone.length > 12) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid phone number (e.g. 024 123 4567)." },
        { status: 400 }
      );
    }

    // Generate 5-digit code
    const otpCode = generateOtp();

    // Persist OTP record (valid for 10 minutes)
    await storeOtp(normalizedPhone, otpCode, 10);

    // Dispatch SMS via provider
    const smsResult = await sendOtpSms(normalizedPhone, otpCode);

    return NextResponse.json({
      success: true,
      message: "Verification code sent.",
      phone: normalizedPhone,
      ...(process.env.NODE_ENV !== "production" ? { devOtp: otpCode } : {}),
      smsResult,
    });
  } catch (error) {
    console.error("[OTP Send Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to dispatch SMS verification code.",
      },
      { status: 500 }
    );
  }
}
