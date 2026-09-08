"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import { requireAgent } from "@/lib/auth/dal";
import { toSafeError } from "@/lib/errors";
import { OrderSource } from "@/lib/generated/prisma/enums";
import { itemsFromFormData } from "@/lib/orders/form";
import { getAgentCustomer } from "@/services/agent";
import { placeOrder } from "@/services/orders/place";

import type { PlaceOrderState } from "@/components/orders/place-order-form";

export async function placeAgentOrder(
  _state: PlaceOrderState,
  formData: FormData,
): Promise<PlaceOrderState> {
  const actor = await requireAgent();
  const customerId = String(formData.get("customerId") ?? "");

  try {
    await getAgentCustomer(actor.agentId, customerId);
    const order = await placeOrder({
      customerId,
      addressId: String(formData.get("addressId") ?? ""),
      items: itemsFromFormData(formData),
      redeemReward: formData.get("redeemReward") === "on",
      scheduledFor: String(formData.get("scheduledFor") ?? "") || undefined,
      placedByUserId: actor.userId,
      source: OrderSource.AGENT,
    });

    revalidatePath("/agent/orders");
    revalidatePath(`/agent/customers/${customerId}`);
    redirect(`/agent/orders/${order.id}`);
  } catch (error) {
    unstable_rethrow(error);
    return { ok: false, message: toSafeError(error).message };
  }
}
