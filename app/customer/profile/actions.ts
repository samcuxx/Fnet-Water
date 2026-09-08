"use server";

import { revalidatePath } from "next/cache";

import { requireCustomer } from "@/lib/auth/dal";
import { toSafeError } from "@/lib/errors";
import { formDataToObject } from "@/lib/validation";
import { updateCustomerProfile } from "@/services/customer/account";

export type ProfileFormState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | undefined;

export async function saveProfile(
  _state: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const actor = await requireCustomer();

  try {
    await updateCustomerProfile(
      actor.customerId,
      actor.userId,
      formDataToObject(formData),
    );
    revalidatePath("/customer/profile");
    return { ok: true, message: "Profile updated." };
  } catch (error) {
    return { ok: false, message: toSafeError(error).message };
  }
}
