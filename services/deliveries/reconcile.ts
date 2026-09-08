import "server-only";

import { BusinessRuleError, NotFoundError } from "@/lib/errors";
import {
  BottleState,
  InventoryMovementType,
  StockHolderType,
} from "@/lib/generated/prisma/enums";
import { parseOrThrow, reconcileDeliverySchema } from "@/lib/validation";
import { AUDIT_ACTIONS, record as recordAudit } from "@/services/audit";
import { applyStockMove } from "@/services/inventory/move";
import { prisma } from "@/lib/db";

export async function reconcileFailedDelivery(input: {
  deliveryId: string;
  reason: string;
  actorId: string;
}) {
  const parsed = parseOrThrow(reconcileDeliverySchema, input);

  return prisma.$transaction(async (tx) => {
    const delivery = await tx.delivery.findUnique({
      where: { id: parsed.deliveryId },
      include: { order: { include: { items: true } } },
    });

    if (!delivery) throw new NotFoundError("Delivery");
    if (!delivery.requiresReconciliation) {
      throw new BusinessRuleError("This delivery does not need reconciliation.");
    }
    if (!delivery.driverId) {
      throw new BusinessRuleError("A driver must be on the delivery before stock can return.");
    }

    for (const item of delivery.order.items) {
      if (!item.requiresBottleExchange || item.quantity <= 0) continue;

      await applyStockMove(tx, {
        productId: item.productId,
        quantity: item.quantity,
        movementType: InventoryMovementType.FAILED_DELIVERY_RETURN,
        from: {
          state: BottleState.ASSIGNED_TO_DRIVER,
          holderType: StockHolderType.DRIVER,
          holderId: delivery.driverId,
        },
        to: {
          state: BottleState.FILLED_WAREHOUSE,
          holderType: StockHolderType.WAREHOUSE,
        },
        driverId: delivery.driverId,
        orderId: delivery.orderId,
        deliveryId: delivery.id,
        performedByUserId: input.actorId,
        reason: parsed.reason,
      });
    }

    await tx.delivery.update({
      where: { id: delivery.id },
      data: {
        requiresReconciliation: false,
        reconciledAt: new Date(),
        reconciledByUserId: input.actorId,
      },
    });

    await recordAudit(
      {
        userId: input.actorId,
        action: AUDIT_ACTIONS.deliveryReconciled,
        entityType: "Delivery",
        entityId: delivery.id,
        reason: parsed.reason,
      },
      tx,
    );

    return delivery.id;
  });
}
