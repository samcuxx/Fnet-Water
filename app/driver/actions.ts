"use server";

import { revalidatePath } from "next/cache";

import { requireDriver } from "@/lib/auth/dal";
import { toSafeError } from "@/lib/errors";
import { DeliveryFailureReason } from "@/lib/generated/prisma/enums";
import { completeDelivery } from "@/services/deliveries/complete";
import { failDelivery } from "@/services/deliveries/fail";

export type DriverActionState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | undefined;

export async function completeDeliveryAction(
  _state: DriverActionState,
  formData: FormData,
): Promise<DriverActionState> {
  const actor = await requireDriver();

  try {
    const deliveryId = await completeDelivery({
      deliveryId: String(formData.get("deliveryId") ?? ""),
      bottlesDelivered: Number(formData.get("bottlesDelivered") ?? 0),
      emptyBottlesCollected: Number(formData.get("emptyBottlesCollected") ?? 0),
      damagedBottlesReturned: Number(formData.get("damagedBottlesReturned") ?? 0),
      cashCollected: String(formData.get("cashCollected") ?? "") || undefined,
      remarks: String(formData.get("remarks") ?? "") || undefined,
      actorId: actor.userId,
      driverId: actor.driverId,
    });

    revalidatePath("/driver");
    revalidatePath("/driver/assigned");
    revalidatePath("/driver/completed");
    revalidatePath("/driver/stock");
    revalidatePath("/driver/history");
    revalidatePath(`/driver/assigned/${deliveryId}`);
    return { ok: true, message: "Delivery completed." };
  } catch (error) {
    return { ok: false, message: toSafeError(error).message };
  }
}

export async function failDeliveryAction(
  _state: DriverActionState,
  formData: FormData,
): Promise<DriverActionState> {
  const actor = await requireDriver();

  try {
    const deliveryId = await failDelivery({
      deliveryId: String(formData.get("deliveryId") ?? ""),
      failureReason: String(
        formData.get("failureReason") ?? "",
      ) as DeliveryFailureReason,
      failureNotes: String(formData.get("failureNotes") ?? "") || undefined,
      actorId: actor.userId,
      driverId: actor.driverId,
    });

    revalidatePath("/driver");
    revalidatePath("/driver/assigned");
    revalidatePath("/driver/history");
    revalidatePath(`/driver/assigned/${deliveryId}`);
    return { ok: true, message: "Delivery marked failed. Stock stays with you until a manager reconciles." };
  } catch (error) {
    return { ok: false, message: toSafeError(error).message };
  }
}
