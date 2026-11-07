import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  getCustomerProfile,
  updateCustomerProfileData,
} from "@/lib/customer-store";
import { getUserById, findUserByIdentifier, updateUserDetails } from "@/lib/auth-store";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id || "usr_customer_001";
    const userEmail = session.user.email;

    let user = await getUserById(userId);
    if (!user && userEmail) {
      user = await findUserByIdentifier(userEmail);
    }

    const customerProfile = await getCustomerProfile(user ? user.id : userId);

    return NextResponse.json({
      success: true,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          }
        : null,
      customer: customerProfile,
    });
  } catch (error) {
    console.error("[Customer Profile GET Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load customer profile." },
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

    const userId = (session.user as { id?: string }).id || "usr_customer_001";
    const body = await request.json();
    const { ghanaCardNumber, name, phone } = body;

    if (ghanaCardNumber !== undefined) {
      await updateCustomerProfileData(userId, { ghanaCardNumber: ghanaCardNumber.trim() });
    }

    if (name || phone) {
      await updateUserDetails(userId, { name, phone });
    }

    const updatedProfile = await getCustomerProfile(userId);

    return NextResponse.json({
      success: true,
      message: "Customer profile updated successfully.",
      customer: updatedProfile,
    });
  } catch (error) {
    console.error("[Customer Profile PATCH Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update customer profile." },
      { status: 500 }
    );
  }
}
