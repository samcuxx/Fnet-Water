"use server";

import { revalidatePath } from "next/cache";

import { requireActor } from "@/lib/auth/dal";
import { markAllAsRead, markAsRead } from "@/lib/notifications";
import { idSchema } from "@/lib/validation/common";

/**
 * Both actions resolve the actor themselves and scope the write to that user,
 * so a crafted request cannot mark another user's notifications as read.
 */

export async function markNotificationRead(formData: FormData): Promise<void> {
  const actor = await requireActor();
  const notificationId = idSchema.parse(formData.get("notificationId"));

  await markAsRead(notificationId, actor.userId);

  revalidatePath("/notifications");
}

export async function markAllNotificationsRead(): Promise<void> {
  const actor = await requireActor();

  await markAllAsRead(actor.userId);

  revalidatePath("/notifications");
}
