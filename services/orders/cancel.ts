import "server-only";

import { BusinessRuleError, NotFoundError } from "@/lib/errors";
import {
  NotificationCategory,
  NotificationSeverity,
  OrderStatus,
  RewardLedgerType,
} from "@/lib/generated/prisma/enums";
import { notify } from "@/lib/notifications";
import { SETTING_KEYS, getStringArraySetting } from "@/lib/settings";
import { parseOrThrow, cancelOrderSchema } from "@/lib/validation";
import { AUDIT_ACTIONS, record as recordAudit } from "@/services/audit";
import { prisma } from "@/lib/db";

const TERMINAL = new Set<OrderStatus>([
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
]);

export async function cancelOrder(input: {
  orderId: string;
  reason: string;
  actorId: string;
  asCustomer: boolean;
}) {
  const parsed = parseOrThrow(cancelOrderSchema, input);
  const allowed = await getStringArraySetting(
    SETTING_KEYS.orderCancellationAllowedStatuses,
  );

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: parsed.orderId },
      include: {
        customer: { select: { userId: true } },
        rewardRedemption: true,
      },
    });

    if (!order) throw new NotFoundError("Order");
    if (TERMINAL.has(order.status)) {
      throw new BusinessRuleError("This order can no longer be cancelled.");
    }

    if (input.asCustomer && !allowed.includes(order.status)) {
      throw new BusinessRuleError(
        "This order has already been assigned and can only be cancelled by staff.",
      );
    }

    const updated = await tx.order.updateMany({
      where: {
        id: order.id,
        status: order.status,
      },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: parsed.reason,
      },
    });

    if (updated.count !== 1) {
      throw new BusinessRuleError("The order changed while it was being cancelled.");
    }

    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: OrderStatus.CANCELLED,
        changedByUserId: input.actorId,
        reason: parsed.reason,
      },
    });

    if (order.rewardRedemption) {
      await tx.customerRewardBalance.updateMany({
        where: { customerId: order.customerId },
        data: {
          redeemed: { decrement: 1 },
          available: { increment: 1 },
          version: { increment: 1 },
        },
      });

      await tx.rewardLedger.create({
        data: {
          customerId: order.customerId,
          type: RewardLedgerType.ADJUSTMENT,
          quantity: 1,
          orderId: order.id,
          redemptionId: order.rewardRedemption.id,
          performedByUserId: input.actorId,
          reason: "Reward restored after order cancellation",
        },
      });
    }

    await recordAudit(
      {
        userId: input.actorId,
        action: AUDIT_ACTIONS.orderCancelled,
        entityType: "Order",
        entityId: order.id,
        previousValues: { status: order.status },
        newValues: { status: OrderStatus.CANCELLED },
        reason: parsed.reason,
      },
      tx,
    );

    await notify(
      {
        userId: order.customer.userId,
        category: NotificationCategory.ORDER,
        severity: NotificationSeverity.WARNING,
        title: "Order cancelled",
        body: `${order.orderNumber} was cancelled. ${parsed.reason}`,
        entityType: "Order",
        entityId: order.id,
      },
      tx,
    );

    return order.id;
  });
}
