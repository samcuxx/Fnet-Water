"use server";

import { revalidatePath } from "next/cache";

import { requireCustomer } from "@/lib/auth/dal";
import { toSafeError } from "@/lib/errors";
import { getCustomerOrder } from "@/services/customer/account";
import { cancelOrder } from "@/services/orders/cancel";

export type CancelOrderState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | undefined;

export async function cancelCustomerOrder(
  _state: CancelOrderState,
  formData: FormData,
): Promise<CancelOrderState> {
  const actor = await requireCustomer();
  const orderId = String(formData.get("orderId") ?? "");

  try {
    const order = await getCustomerOrder(actor.customerId, orderId);
    if (!order) {
      return { ok: false, message: "That order could not be found." };
    }

    await cancelOrder({
      orderId,
      reason: String(formData.get("reason") ?? ""),
      actorId: actor.userId,
      asCustomer: true,
    });

    revalidatePath("/customer/orders");
    revalidatePath(`/customer/orders/${orderId}`);
    revalidatePath("/customer");
    return { ok: true, message: "Order cancelled." };
  } catch (error) {
    return { ok: false, message: toSafeError(error).message };
  }
}
