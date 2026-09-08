import "server-only";

import { BusinessRuleError, NotFoundError } from "@/lib/errors";
import {
  DeliveryFailureReason,
  DeliveryStatus,
  NotificationCategory,
  NotificationSeverity,
  OrderStatus,
} from "@/lib/generated/prisma/enums";
import { notify } from "@/lib/notifications";
import { parseOrThrow, failDeliverySchema } from "@/lib/validation";
import { AUDIT_ACTIONS, record as recordAudit } from "@/services/audit";
import { prisma } from "@/lib/db";

const FAILABLE: DeliveryStatus[] = [
  DeliveryStatus.ASSIGNED,
  DeliveryStatus.OUT_FOR_DELIVERY,
];

export async function failDelivery(input: {
  deliveryId: string;
  failureReason: DeliveryFailureReason;
  failureNotes?: string;
  actorId: string;
  driverId?: string | null;
}) {
  const parsed = parseOrThrow(failDeliverySchema, input);

  if (
    parsed.failureReason === DeliveryFailureReason.OTHER &&
    !parsed.failureNotes
  ) {
    throw new BusinessRuleError("Add a note when the failure reason is Other.");
  }

  return prisma.$transaction(async (tx) => {
    const delivery = await tx.delivery.findUnique({
      where: { id: parsed.deliveryId },
      include: {
        order: { include: { customer: { select: { userId: true } } } },
      },
    });

    if (!delivery) throw new NotFoundError("Delivery");
    if (input.driverId && delivery.driverId !== input.driverId) {
      throw new BusinessRuleError("This delivery is not assigned to you.");
    }
    if (!FAILABLE.includes(delivery.status)) {
      throw new BusinessRuleError("This delivery can no longer be marked failed.");
    }

    const updated = await tx.delivery.updateMany({
      where: { id: delivery.id, status: delivery.status },
      data: {
        status: DeliveryStatus.FAILED,
        failedAt: new Date(),
        failureReason: parsed.failureReason,
        failureNotes: parsed.failureNotes,
        requiresReconciliation: true,
      },
    });

    if (updated.count !== 1) {
      throw new BusinessRuleError("The delivery changed while it was being failed.");
    }

    await tx.deliveryStatusHistory.create({
      data: {
        deliveryId: delivery.id,
        fromStatus: delivery.status,
        toStatus: DeliveryStatus.FAILED,
        changedByUserId: input.actorId,
        reason: parsed.failureNotes ?? parsed.failureReason,
      },
    });

    await tx.order.update({
      where: { id: delivery.orderId },
      data: { status: OrderStatus.FAILED },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: delivery.orderId,
        fromStatus: delivery.order.status,
        toStatus: OrderStatus.FAILED,
        changedByUserId: input.actorId,
        reason: parsed.failureNotes ?? parsed.failureReason,
      },
    });

    await recordAudit(
      {
        userId: input.actorId,
        action: AUDIT_ACTIONS.deliveryFailed,
        entityType: "Delivery",
        entityId: delivery.id,
        newValues: {
          failureReason: parsed.failureReason,
          requiresReconciliation: true,
        },
        reason: parsed.failureNotes,
      },
      tx,
    );

    await notify(
      {
        userId: delivery.order.customer.userId,
        category: NotificationCategory.DELIVERY,
        severity: NotificationSeverity.WARNING,
        title: "Delivery could not be completed",
        body: `${delivery.deliveryNumber} failed and will be rescheduled.`,
        entityType: "Delivery",
        entityId: delivery.id,
      },
      tx,
    );

    return delivery.id;
  });
}
