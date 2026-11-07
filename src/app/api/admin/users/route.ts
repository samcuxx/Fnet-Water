import { NextResponse } from "next/server";
import {
  getStaffList,
  registerNewUser,
  updateUserStatus,
  updateUserDetails,
  updateUserPassword,
  deleteUserRecord,
  findUserByIdentifier,
} from "@/lib/auth-store";
import { normalizeGhanaPhone } from "@/lib/mnotify";
import type { RoleType, StatusType } from "@/types/next-auth";

const ALLOWED_STAFF_ROLES: RoleType[] = ["ADMIN", "MANAGER", "DRIVER", "AGENT"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const roleFilter = searchParams.get("role") || "";
    const statusFilter = searchParams.get("status") || "";

    // Staff management strictly returns staff roles (excludes CUSTOMER)
    let staff = await getStaffList();

    if (search) {
      staff = staff.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.phone.includes(search)
      );
    }

    if (roleFilter && roleFilter !== "ALL") {
      staff = staff.filter((u) => u.role === roleFilter);
    }

    if (statusFilter && statusFilter !== "ALL") {
      staff = staff.filter((u) => u.status === statusFilter);
    }

    const safeStaff = staff.map(({ passwordHash: _, ...safe }) => safe);

    return NextResponse.json({
      success: true,
      users: safeStaff,
      total: safeStaff.length,
    });
  } catch (error) {
    console.error("[Admin Staff GET Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to load staff list.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role } = body;

    // 1. Required fields
    if (!name?.trim() || !email?.trim() || !phone?.trim() || !password || !role) {
      return NextResponse.json(
        { success: false, message: "Full name, email, phone number, password, and role are required." },
        { status: 400 }
      );
    }

    // 2. Validate Role
    if (!ALLOWED_STAFF_ROLES.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: role === "CUSTOMER"
            ? "Customers must be registered through the Customer Directory."
            : "Invalid staff role selected.",
        },
        { status: 400 }
      );
    }

    // 3. Email format
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // 4. Phone validation
    const normalizedPhone = normalizeGhanaPhone(phone.trim());
    if (normalizedPhone.length < 9) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid Ghanaian phone number." },
        { status: 400 }
      );
    }

    // 5. Password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // 6. Check unique email
    const existingEmail = await findUserByIdentifier(trimmedEmail);
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: "A user account with this email address already exists." },
        { status: 409 }
      );
    }

    // 7. Check unique phone
    const existingPhone = await findUserByIdentifier(normalizedPhone);
    if (existingPhone) {
      return NextResponse.json(
        { success: false, message: "A user account with this phone number already exists." },
        { status: 409 }
      );
    }

    const created = await registerNewUser({
      name: name.trim(),
      email: trimmedEmail,
      phone: normalizedPhone,
      password,
      role: role as RoleType,
    });

    return NextResponse.json({
      success: true,
      message: `${role} staff member created successfully.`,
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        phone: created.phone,
        role: created.role,
        status: created.status,
        createdAt: created.createdAt,
      },
    });
  } catch (error) {
    console.error("[Admin Staff POST Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create staff member.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, action = "status", status, name, email, phone, role, password } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Staff user ID is required." },
        { status: 400 }
      );
    }

    // Action 1: Change Password
    if (action === "password") {
      if (!password || password.length < 6) {
        return NextResponse.json(
          { success: false, message: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      const success = await updateUserPassword(userId, password);
      if (!success) {
        return NextResponse.json(
          { success: false, message: "Staff user not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Staff password successfully updated.",
      });
    }

    // Action 2: Edit Staff Details
    if (action === "edit") {
      if (role && !ALLOWED_STAFF_ROLES.includes(role)) {
        return NextResponse.json(
          { success: false, message: "Invalid operational staff role." },
          { status: 400 }
        );
      }

      // If email changed, check uniqueness
      if (email) {
        const trimmedEmail = email.trim().toLowerCase();
        const existing = await findUserByIdentifier(trimmedEmail);
        if (existing && existing.id !== userId) {
          return NextResponse.json(
            { success: false, message: "Another user is already using this email address." },
            { status: 409 }
          );
        }
      }

      // If phone changed, check uniqueness
      if (phone) {
        const normalized = normalizeGhanaPhone(phone.trim());
        const existing = await findUserByIdentifier(normalized);
        if (existing && existing.id !== userId) {
          return NextResponse.json(
            { success: false, message: "Another user is already using this phone number." },
            { status: 409 }
          );
        }
      }

      const updated = await updateUserDetails(userId, { name, email, phone, role });
      if (!updated) {
        return NextResponse.json(
          { success: false, message: "Staff user not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Staff member details updated.",
        user: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          role: updated.role,
          status: updated.status,
        },
      });
    }

    // Action 3: Toggle Status
    if (!status || (status !== "ACTIVE" && status !== "INACTIVE")) {
      return NextResponse.json(
        { success: false, message: "Valid status ('ACTIVE' | 'INACTIVE') is required." },
        { status: 400 }
      );
    }

    // Protect primary administrator account from accidental deactivation
    if (userId === "usr_admin_001" && status === "INACTIVE") {
      return NextResponse.json(
        { success: false, message: "The primary System Administrator cannot be deactivated." },
        { status: 403 }
      );
    }

    const updated = await updateUserStatus(userId, status as StatusType);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Staff user not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Staff status updated to ${status}.`,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error("[Admin Staff PATCH Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update staff user.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get("userId");

    if (!userId) {
      const body = await request.json().catch(() => ({}));
      userId = body.userId;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Staff user ID is required for deletion." },
        { status: 400 }
      );
    }

    // Protect primary administrator account from deletion
    if (userId === "usr_admin_001") {
      return NextResponse.json(
        { success: false, message: "The primary System Administrator cannot be deleted." },
        { status: 403 }
      );
    }

    const success = await deleteUserRecord(userId);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Staff member not found or could not be removed." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Staff member removed successfully.",
    });
  } catch (error) {
    console.error("[Admin Staff DELETE Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete staff member.",
      },
      { status: 500 }
    );
  }
}
