import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  getCustomerAddresses,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
  isValidGhanaDigitalAddress,
  AddressCategory,
} from "@/lib/customer-store";

const VALID_CATEGORIES: AddressCategory[] = [
  "HOME",
  "OFFICE",
  "SHOP",
  "SCHOOL",
  "WAREHOUSE",
  "OTHER",
];

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
    const addresses = await getCustomerAddresses(userId);

    return NextResponse.json({
      success: true,
      addresses,
      total: addresses.length,
    });
  } catch (error) {
    console.error("[Customer Addresses GET Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load delivery addresses." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
    const {
      category = "HOME",
      areaName,
      digitalAddress,
      deliveryInstructions,
      isDefault = false,
      gpsLatitude,
      gpsLongitude,
    } = body;

    // 1. Validate Category
    if (!VALID_CATEGORIES.includes(category as AddressCategory)) {
      return NextResponse.json(
        { success: false, message: "Invalid location category." },
        { status: 400 }
      );
    }

    // 2. Validate Area Name
    if (!areaName || areaName.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: "Street name or area location is required (e.g. East Legon, Spintex)." },
        { status: 400 }
      );
    }

    // 3. Validate Ghana Digital Address or auto-derive from GPS
    let finalDigitalAddress = digitalAddress ? digitalAddress.trim().toUpperCase() : "";
    if (!finalDigitalAddress && gpsLatitude && gpsLongitude) {
      const lat = Math.abs(parseFloat(gpsLatitude));
      const lon = Math.abs(parseFloat(gpsLongitude));
      finalDigitalAddress = `GA-${Math.floor(lat * 100) % 900 + 100}-${Math.floor(lon * 10000) % 9000 + 1000}`;
    }

    if (!finalDigitalAddress || !isValidGhanaDigitalAddress(finalDigitalAddress)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid Ghana Digital Address (e.g. GA-492-1029) or select your current GPS location.",
        },
        { status: 400 }
      );
    }

    const created = await createCustomerAddress(userId, {
      category: category as AddressCategory,
      areaName: areaName.trim(),
      digitalAddress: finalDigitalAddress,
      deliveryInstructions: deliveryInstructions?.trim(),
      isDefault: Boolean(isDefault),
      gpsLatitude: gpsLatitude ? parseFloat(gpsLatitude) : undefined,
      gpsLongitude: gpsLongitude ? parseFloat(gpsLongitude) : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Delivery address saved to Address Book.",
      address: created,
    });
  } catch (error) {
    console.error("[Customer Addresses POST Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create delivery address." },
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
    const {
      addressId,
      action = "edit",
      category,
      areaName,
      digitalAddress,
      deliveryInstructions,
      isDefault,
    } = body;

    if (!addressId) {
      return NextResponse.json(
        { success: false, message: "Address ID is required." },
        { status: 400 }
      );
    }

    // Action A: Set Default Address
    if (action === "default") {
      const success = await setDefaultCustomerAddress(addressId, userId);
      if (!success) {
        return NextResponse.json(
          { success: false, message: "Address not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Default delivery location updated.",
      });
    }

    // Action B: Edit Address
    if (digitalAddress && !isValidGhanaDigitalAddress(digitalAddress)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid Ghana Digital Address (e.g. GA-492-1029).",
        },
        { status: 400 }
      );
    }

    const updated = await updateCustomerAddress(addressId, userId, {
      category: category as AddressCategory,
      areaName,
      digitalAddress,
      deliveryInstructions,
      isDefault: isDefault !== undefined ? Boolean(isDefault) : undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Address not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Delivery address updated.",
      address: updated,
    });
  } catch (error) {
    console.error("[Customer Addresses PATCH Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update delivery address." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id || "usr_customer_001";
    const { searchParams } = new URL(request.url);
    let addressId = searchParams.get("addressId");

    if (!addressId) {
      const body = await request.json().catch(() => ({}));
      addressId = body.addressId;
    }

    if (!addressId) {
      return NextResponse.json(
        { success: false, message: "Address ID is required." },
        { status: 400 }
      );
    }

    const success = await deleteCustomerAddress(addressId, userId);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Address not found or already removed." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Delivery address removed from Address Book.",
    });
  } catch (error) {
    console.error("[Customer Addresses DELETE Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete delivery address." },
      { status: 500 }
    );
  }
}
