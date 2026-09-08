"use server";

import { revalidatePath } from "next/cache";

import { requireCustomer } from "@/lib/auth/dal";
import { toSafeError } from "@/lib/errors";
import { formDataToObject } from "@/lib/validation";
import {
  deactivateCustomerAddress,
  upsertCustomerAddress,
} from "@/services/customer/account";

export type AddressFormState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | undefined;

export async function saveAddress(
  _state: AddressFormState,
  formData: FormData,
): Promise<AddressFormState> {
  const actor = await requireCustomer();

  try {
    await upsertCustomerAddress(
      actor.customerId,
      formDataToObject(formData),
      actor.userId,
    );
    revalidatePath("/customer/addresses");
    revalidatePath("/customer/order");
    return { ok: true, message: "Address saved." };
  } catch (error) {
    return { ok: false, message: toSafeError(error).message };
  }
}

export async function removeAddress(formData: FormData): Promise<void> {
  const actor = await requireCustomer();
  await deactivateCustomerAddress(
    actor.customerId,
    String(formData.get("id") ?? ""),
    actor.userId,
  );
  revalidatePath("/customer/addresses");
  revalidatePath("/customer/order");
}
