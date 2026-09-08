"use server";

import { revalidatePath } from "next/cache";

import { requireAdministrator } from "@/lib/auth/dal";
import { updateSetting } from "@/services/admin/settings";

export type SettingFormState = { message?: string; ok?: boolean } | undefined;

export async function saveSetting(
  _state: SettingFormState,
  formData: FormData,
): Promise<SettingFormState> {
  const actor = await requireAdministrator();
  const id = String(formData.get("id") ?? "");
  const rawValue = String(formData.get("value") ?? "");

  try {
    await updateSetting({ id, rawValue, actorId: actor.userId });
    revalidatePath("/admin/settings");
    return { ok: true, message: "Setting saved." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not save the setting.",
    };
  }
}
