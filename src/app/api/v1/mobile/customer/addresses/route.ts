import { z } from "zod";
import {
  AddressCategory,
  createCustomerAddress,
  getCustomerAddresses,
  isValidGhanaDigitalAddress,
} from "@/lib/customer-store";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

const createAddressSchema = z.object({
  category: z.enum(["HOME", "OFFICE", "SHOP", "SCHOOL", "WAREHOUSE", "OTHER"]).default("HOME"),
  areaName: z.string().min(3, "Street name or area location is required."),
  digitalAddress: z.string().min(6, "Ghana Digital Address is required."),
  deliveryInstructions: z.string().optional(),
  isDefault: z.boolean().default(false),
  gpsLatitude: z.coerce.number().optional(),
  gpsLongitude: z.coerce.number().optional(),
});

export async function GET(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request, ["CUSTOMER"]);
    if (!authResult.ok) return authResult.response;

    const addresses = await getCustomerAddresses(authResult.user.id);
    return mobileSuccess(
      {
        addresses,
        total: addresses.length,
      },
      200,
      "Addresses loaded successfully."
    );
  } catch (error) {
    console.error("[Mobile API customer/addresses GET error]:", error);
    return mobileError("SERVER_ERROR", "Failed to load delivery addresses.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request, ["CUSTOMER"]);
    if (!authResult.ok) return authResult.response;

    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parsed = createAddressSchema.safeParse(rawBody);
    if (!parsed.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message || "Invalid address details.",
        422,
        parsed.error.issues
      );
    }

    if (!isValidGhanaDigitalAddress(parsed.data.digitalAddress)) {
      return mobileError(
        "INVALID_DIGITAL_ADDRESS",
        "Please enter a valid Ghana Digital Address (e.g. GA-492-1029).",
        400
      );
    }

    const created = await createCustomerAddress(authResult.user.id, {
      category: parsed.data.category as AddressCategory,
      areaName: parsed.data.areaName,
      digitalAddress: parsed.data.digitalAddress,
      deliveryInstructions: parsed.data.deliveryInstructions,
      isDefault: parsed.data.isDefault,
      gpsLatitude: parsed.data.gpsLatitude,
      gpsLongitude: parsed.data.gpsLongitude,
    });

    return mobileSuccess({ address: created }, 201, "Delivery address saved.");
  } catch (error) {
    console.error("[Mobile API customer/addresses POST error]:", error);
    return mobileError("SERVER_ERROR", "Failed to save delivery address.", 500);
  }
}
