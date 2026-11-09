import { NextResponse } from "next/server";
import {
  getCustomersList,
  registerNewUser,
  updateUserStatus,
  updateUserDetails,
  deleteUserRecord,
  findUserByIdentifier,
} from "@/lib/auth-store";
import { normalizeGhanaPhone } from "@/lib/mnotify";
import type { StatusType } from "@/types/next-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const statusFilter = searchParams.get("status") || "";

    let customers = await getCustomersList();

    if (search) {
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.phone.includes(search) ||
          c.customerCode?.toLowerCase().includes(search)
      );
    }

    if (statusFilter && statusFilter !== "ALL") {
      customers = customers.filter((c) => c.status === statusFilter);
    }

    const safeCustomers = customers.map(({ passwordHash: _, ...safe }) => safe);

    return NextResponse.json({
      success: true,
      customers: safeCustomers,
      total: safeCustomers.length,
    });
  } catch (error) {
    console.error("[Admin Customers GET Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to load customers.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password = "customer123", deliveryArea, dispenserPlan } = body;

    // 1. Validate required fields
    if (!name?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { success: false, message: "Customer name, email address, and phone number are required." },
        { status: 400 }
      );
    }

    // 2. Validate email
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // 3. Validate phone
    const normalizedPhone = normalizeGhanaPhone(phone.trim());
    if (normalizedPhone.length < 9) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid Ghanaian phone number." },
        { status: 400 }
      );
    }

    // 4. Check duplicate email
    const existingEmail = await findUserByIdentifier(trimmedEmail);
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // 5. Check duplicate phone
    const existingPhone = await findUserByIdentifier(normalizedPhone);
    if (existingPhone) {
      return NextResponse.json(
        { success: false, message: "An account with this phone number already exists." },
        { status: 409 }
      );
    }

    const created = await registerNewUser({
      name: name.trim(),
      email: trimmedEmail,
      phone: normalizedPhone,
      password,
      role: "CUSTOMER",
      deliveryArea: deliveryArea?.trim() || "Assigned Area",
      dispenserPlan: dispenserPlan?.trim() || "None (Refill Only)",
      bottlesHeld: 0,
    });

    return NextResponse.json({
      success: true,
      message: "Customer account registered successfully.",
      customer: {
        id: created.id,
        name: created.name,
        email: created.email,
        phone: created.phone,
        customerCode: created.customerCode,
        bottlesHeld: created.bottlesHeld,
        dispenserPlan: created.dispenserPlan,
        deliveryArea: created.deliveryArea,
        status: created.status,
        createdAt: created.createdAt,
      },
    });
  } catch (error) {
    console.error("[Admin Customers POST Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create customer.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { customerId, status, name, email, phone } = body;

    if (!customerId) {
      return NextResponse.json(
        { success: false, message: "Customer ID is required." },
        { status: 400 }
      );
    }

    // Update status
    if (status) {
      if (status !== "ACTIVE" && status !== "INACTIVE") {
        return NextResponse.json(
          { success: false, message: "Status must be 'ACTIVE' or 'INACTIVE'." },
          { status: 400 }
        );
      }

      const updated = await updateUserStatus(customerId, status as StatusType);
      if (!updated) {
        return NextResponse.json({ success: false, message: "Customer account not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: `Status updated to ${status}.` });
    }

    // Update details
    if (name || email || phone) {
      if (email) {
        const trimmedEmail = email.trim().toLowerCase();
        const existing = await findUserByIdentifier(trimmedEmail);
        if (existing && existing.id !== customerId) {
          return NextResponse.json(
            { success: false, message: "Another account is already using this email address." },
            { status: 409 }
          );
        }
      }

      if (phone) {
        const normalized = normalizeGhanaPhone(phone.trim());
        const existing = await findUserByIdentifier(normalized);
        if (existing && existing.id !== customerId) {
          return NextResponse.json(
            { success: false, message: "Another account is already using this phone number." },
            { status: 409 }
          );
        }
      }

      const updated = await updateUserDetails(customerId, { name, email, phone });
      if (!updated) {
        return NextResponse.json({ success: false, message: "Customer account not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: "Customer details updated successfully." });
    }

    return NextResponse.json({ success: false, message: "No update parameters provided." }, { status: 400 });
  } catch (error) {
    console.error("[Admin Customers PATCH Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update customer.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let customerId = searchParams.get("customerId");

    if (!customerId) {
      const body = await request.json().catch(() => ({}));
      customerId = body.customerId;
    }

    if (!customerId) {
      return NextResponse.json({ success: false, message: "Customer ID is required." }, { status: 400 });
    }

    const success = await deleteUserRecord(customerId);
    if (!success) {
      return NextResponse.json({ success: false, message: "Customer not found or already deleted." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Customer record removed successfully." });
  } catch (error) {
    console.error("[Admin Customers DELETE Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete customer.",
      },
      { status: 500 }
    );
  }
}
