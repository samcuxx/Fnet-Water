"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import { requireCustomer } from "@/lib/auth/dal";
import { toSafeError } from "@/lib/errors";
import { OrderSource } from "@/lib/generated/prisma/enums";
import { itemsFromFormData } from "@/lib/orders/form";
import { placeOrder } from "@/services/orders/place";

import type { PlaceOrderState } from "@/components/orders/place-order-form";

export async function placeCustomerOrder(
  _state: PlaceOrderState,
  formData: FormData,
): Promise<PlaceOrderState> {
  const actor = await requireCustomer();

  try {
    const order = await placeOrder({
      customerId: actor.customerId,
      addressId: String(formData.get("addressId") ?? ""),
      items: itemsFromFormData(formData),
      redeemReward: formData.get("redeemReward") === "on",
      scheduledFor: String(formData.get("scheduledFor") ?? "") || undefined,
      placedByUserId: actor.userId,
      source: OrderSource.CUSTOMER_WEB,
    });

    revalidatePath("/customer");
    revalidatePath("/customer/orders");
    redirect(`/customer/orders/${order.id}`);
  } catch (error) {
    unstable_rethrow(error);
    return { ok: false, message: toSafeError(error).message };
  }
}
