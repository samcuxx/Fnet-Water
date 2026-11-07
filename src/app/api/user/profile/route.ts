import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  getUserById,
  findUserByIdentifier,
  updateUserDetails,
  updateUserPassword,
} from "@/lib/auth-store";
import { normalizeGhanaPhone } from "@/lib/mnotify";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id;
    const userEmail = session.user.email;

    let user = userId ? await getUserById(userId) : null;
    if (!user && userEmail) {
      user = await findUserByIdentifier(userEmail);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User profile not found." },
        { status: 404 }
      );
    }

    const { passwordHash: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      profile: safeUser,
    });
  } catch (error) {
    console.error("[Profile GET Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id;
    const userEmail = session.user.email;

    let currentUser = userId ? await getUserById(userId) : null;
    if (!currentUser && userEmail) {
      currentUser = await findUserByIdentifier(userEmail);
    }

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User account not found." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { action = "details", name, email, phone, deliveryArea, currentPassword, newPassword } = body;

    // Action A: Change Password
    if (action === "password") {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, message: "Current password and new password are required." },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      const isCurrentValid = await bcrypt.compare(currentPassword, currentUser.passwordHash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { success: false, message: "Incorrect current password." },
          { status: 400 }
        );
      }

      await updateUserPassword(currentUser.id, newPassword);

      return NextResponse.json({
        success: true,
        message: "Password changed successfully.",
      });
    }

    // Action B: Update Personal Information / Address Details
    if (email) {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
        return NextResponse.json(
          { success: false, message: "Please provide a valid email address." },
          { status: 400 }
        );
      }

      const existingEmailUser = await findUserByIdentifier(trimmedEmail);
      if (existingEmailUser && existingEmailUser.id !== currentUser.id) {
        return NextResponse.json(
          { success: false, message: "Another account is already registered with this email address." },
          { status: 409 }
        );
      }
    }

    if (phone) {
      const normalizedPhone = normalizeGhanaPhone(phone.trim());
      if (normalizedPhone.length < 9) {
        return NextResponse.json(
          { success: false, message: "Please provide a valid Ghanaian phone number." },
          { status: 400 }
        );
      }

      const existingPhoneUser = await findUserByIdentifier(normalizedPhone);
      if (existingPhoneUser && existingPhoneUser.id !== currentUser.id) {
        return NextResponse.json(
          { success: false, message: "Another account is already registered with this phone number." },
          { status: 409 }
        );
      }
    }

    const updated = await updateUserDetails(currentUser.id, {
      name: name?.trim() || currentUser.name,
      email: email?.trim().toLowerCase() || currentUser.email,
      phone: phone ? normalizeGhanaPhone(phone.trim()) : currentUser.phone,
      deliveryArea: deliveryArea !== undefined ? deliveryArea.trim() : currentUser.deliveryArea,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Failed to update profile." },
        { status: 500 }
      );
    }

    const { passwordHash: _, ...safeUpdated } = updated;

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      profile: safeUpdated,
    });
  } catch (error) {
    console.error("[Profile PATCH Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update profile.",
      },
      { status: 500 }
    );
  }
}
