import { z } from "zod";
import {
  AddressCategory,
  deleteCustomerAddress,
  isValidGhanaDigitalAddress,
  setDefaultCustomerAddress,
  updateCustomerAddress,
} from "@/lib/customer-store";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

const updateAddressSchema = z.object({
  action: z.enum(["edit", "default"]).default("edit"),
  category: z.enum(["HOME", "OFFICE", "SHOP", "SCHOOL", "WAREHOUSE", "OTHER"]).optional(),
  areaName: z.string().min(3).optional(),
  digitalAddress: z.string().min(6).optional(),
  deliveryInstructions: z.string().optional(),
  isDefault: z.boolean().optional(),
  gpsLatitude: z.coerce.number().optional(),
  gpsLongitude: z.coerce.number().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyMobileAuth(request, ["CUSTOMER"]);
    if (!authResult.ok) return authResult.response;

    const { id } = await params;
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parsed = updateAddressSchema.safeParse(rawBody);
    if (!parsed.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message || "Invalid update fields.",
        422
      );
    }

    if (parsed.data.action === "default") {
      const ok = await setDefaultCustomerAddress(id, authResult.user.id);
      if (!ok) return mobileError("NOT_FOUND", "Address not found.", 404);
      return mobileSuccess({ id, isDefault: true }, 200, "Default delivery location updated.");
    }

    if (parsed.data.digitalAddress && !isValidGhanaDigitalAddress(parsed.data.digitalAddress)) {
      return mobileError(
        "INVALID_DIGITAL_ADDRESS",
        "Please enter a valid Ghana Digital Address (e.g. GA-492-1029).",
        400
      );
    }

    const updated = await updateCustomerAddress(id, authResult.user.id, {
      category: parsed.data.category as AddressCategory | undefined,
      areaName: parsed.data.areaName,
      digitalAddress: parsed.data.digitalAddress,
      deliveryInstructions: parsed.data.deliveryInstructions,
      isDefault: parsed.data.isDefault,
      gpsLatitude: parsed.data.gpsLatitude,
      gpsLongitude: parsed.data.gpsLongitude,
    });

    if (!updated) {
      return mobileError("NOT_FOUND", "Address not found.", 404);
    }

    return mobileSuccess({ address: updated }, 200, "Delivery address updated.");
  } catch (error) {
    console.error("[Mobile API customer/addresses/[id] PATCH error]:", error);
    return mobileError("SERVER_ERROR", "Failed to update delivery address.", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyMobileAuth(request, ["CUSTOMER"]);
    if (!authResult.ok) return authResult.response;

    const { id } = await params;
    const ok = await deleteCustomerAddress(id, authResult.user.id);
    if (!ok) {
      return mobileError("NOT_FOUND", "Address not found or already removed.", 404);
    }

    return mobileSuccess({ deleted: true, id }, 200, "Delivery address removed.");
  } catch (error) {
    console.error("[Mobile API customer/addresses/[id] DELETE error]:", error);
    return mobileError("SERVER_ERROR", "Failed to delete delivery address.", 500);
  }
}
