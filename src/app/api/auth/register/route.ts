import { NextResponse } from "next/server";
import { findUserByIdentifier, registerNewUser } from "@/lib/auth-store";
import { normalizeGhanaPhone } from "@/lib/mnotify";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, referralCode } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Full name is required." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!phone || phone.trim().length < 9) {
      return NextResponse.json(
        { success: false, message: "A valid Ghanaian phone number is required." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeGhanaPhone(phone);

    // Check if email or phone already exists
    const existingByEmail = await findUserByIdentifier(email);
    if (existingByEmail) {
      return NextResponse.json(
        { success: false, message: "An account with this email address already exists." },
        { status: 400 }
      );
    }

    const existingByPhone = await findUserByIdentifier(normalizedPhone);
    if (existingByPhone) {
      return NextResponse.json(
        { success: false, message: "An account with this phone number already exists." },
        { status: 400 }
      );
    }

    const newUser = await registerNewUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: normalizedPhone,
      password,
      role: "CUSTOMER",
      referralCode: referralCode?.trim(),
    });

    return NextResponse.json({
      success: true,
      message: "Customer account created successfully. You can now sign in.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("[Register Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to register account.",
      },
      { status: 500 }
    );
  }
}
