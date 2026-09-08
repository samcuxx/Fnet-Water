"use server";

import { revalidatePath } from "next/cache";

import { requireManager } from "@/lib/auth/dal";
import { toSafeError } from "@/lib/errors";
import { assignDriver } from "@/services/deliveries/assign";
import { reconcileFailedDelivery } from "@/services/deliveries/reconcile";

export type DeliveryActionState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | undefined;

export async function assignDriverAction(
  _state: DeliveryActionState,
  formData: FormData,
): Promise<DeliveryActionState> {
  const actor = await requireManager();

  try {
    const result = await assignDriver({
      orderId: String(formData.get("orderId") ?? ""),
      driverId: String(formData.get("driverId") ?? ""),
      scheduledFor: String(formData.get("scheduledFor") ?? ""),
      actorId: actor.userId,
    });

    revalidatePath("/manager/orders");
    revalidatePath(`/manager/orders/${result.orderId}`);
    revalidatePath("/manager/deliveries");
    revalidatePath(`/manager/deliveries/${result.deliveryId}`);
    revalidatePath("/manager");
    return { ok: true, message: "Driver assigned and stock loaded." };
  } catch (error) {
    return { ok: false, message: toSafeError(error).message };
  }
}

export async function reconcileDeliveryAction(
  _state: DeliveryActionState,
  formData: FormData,
): Promise<DeliveryActionState> {
  const actor = await requireManager();

  try {
    const deliveryId = await reconcileFailedDelivery({
      deliveryId: String(formData.get("deliveryId") ?? ""),
      reason: String(formData.get("reason") ?? ""),
      actorId: actor.userId,
    });

    revalidatePath("/manager/deliveries");
    revalidatePath(`/manager/deliveries/${deliveryId}`);
    revalidatePath("/manager/inventory");
    revalidatePath("/manager");
    return { ok: true, message: "Failed delivery reconciled. Stock is back in the warehouse." };
  } catch (error) {
    return { ok: false, message: toSafeError(error).message };
  }
}
