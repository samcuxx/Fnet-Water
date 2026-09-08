import "server-only";

import { BusinessRuleError, NotFoundError } from "@/lib/errors";
import {
  BottleLedgerEntryType,
  BottleState,
  DeliveryStatus,
  InventoryMovementType,
  NotificationCategory,
  NotificationSeverity,
  OrderPaymentStatus,
  OrderStatus,
  PaymentMethod,
  PaymentPurpose,
  PaymentStatus,
  ReferralStatus,
  RewardLedgerType,
  StockHolderType,
  TransactionStatus,
  TransactionType,
} from "@/lib/generated/prisma/enums";
import { add, greaterThanOrEqual, money, toAmountString } from "@/lib/money";
import { notify } from "@/lib/notifications";
import {
  SETTING_KEYS,
  getMoneySetting,
  getNumberSetting,
} from "@/lib/settings";
import { paymentReference } from "@/lib/utils/reference";
import { parseOrThrow, completeDeliverySchema } from "@/lib/validation";
import { AUDIT_ACTIONS, record as recordAudit } from "@/services/audit";
import { applyStockMove } from "@/services/inventory/move";
import { prisma } from "@/lib/db";

const COMPLETABLE: DeliveryStatus[] = [
  DeliveryStatus.ASSIGNED,
  DeliveryStatus.OUT_FOR_DELIVERY,
];

export async function completeDelivery(input: {
  deliveryId: string;
  bottlesDelivered: number;
  emptyBottlesCollected: number;
  damagedBottlesReturned: number;
  cashCollected?: string;
  remarks?: string;
  actorId: string;
  driverId: string;
}) {
  const parsed = parseOrThrow(completeDeliverySchema, input);
  const qualifyingMin = await getMoneySetting(
    SETTING_KEYS.referralQualifyingMinOrderTotal,
  );
  const rewardEvery = await getNumberSetting(
    SETTING_KEYS.referralRequiredForReward,
  );

  return prisma.$transaction(async (tx) => {
    const delivery = await tx.delivery.findUnique({
      where: { id: parsed.deliveryId },
      include: {
        order: {
          include: {
            items: true,
            customer: {
              select: {
                id: true,
                userId: true,
                referredByCustomerId: true,
              },
            },
          },
        },
      },
    });

    if (!delivery) throw new NotFoundError("Delivery");
    if (delivery.driverId !== input.driverId) {
      throw new BusinessRuleError("This delivery is not assigned to you.");
    }
    if (!COMPLETABLE.includes(delivery.status)) {
      throw new BusinessRuleError("This delivery can no longer be completed.");
    }

    const expected = delivery.emptyBottlesExpected;
    const shortage =
      expected - parsed.emptyBottlesCollected - parsed.damagedBottlesReturned;

    const updated = await tx.delivery.updateMany({
      where: { id: delivery.id, status: delivery.status },
      data: {
        status: DeliveryStatus.DELIVERED,
        completedAt: new Date(),
        bottlesDelivered: parsed.bottlesDelivered,
        emptyBottlesCollected: parsed.emptyBottlesCollected,
        damagedBottlesReturned: parsed.damagedBottlesReturned,
        shortageQuantity: Math.max(shortage, 0),
        cashCollected: parsed.cashCollected
          ? toAmountString(parsed.cashCollected)
          : null,
        remarks: parsed.remarks,
      },
    });

    if (updated.count !== 1) {
      throw new BusinessRuleError("The delivery changed while it was being completed.");
    }

    await tx.deliveryStatusHistory.create({
      data: {
        deliveryId: delivery.id,
        fromStatus: delivery.status,
        toStatus: DeliveryStatus.DELIVERED,
        changedByUserId: input.actorId,
        reason: parsed.remarks,
      },
    });

    await tx.order.update({
      where: { id: delivery.orderId },
      data: {
        status: OrderStatus.DELIVERED,
        deliveredAt: new Date(),
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: delivery.orderId,
        fromStatus: delivery.order.status,
        toStatus: OrderStatus.DELIVERED,
        changedByUserId: input.actorId,
        reason: "Delivery completed",
      },
    });

    for (const item of delivery.order.items) {
      if (!item.requiresBottleExchange || item.quantity <= 0) continue;

      const delivered = Math.min(parsed.bottlesDelivered, item.quantity);

      if (delivered > 0) {
        await applyStockMove(tx, {
          productId: item.productId,
          quantity: delivered,
          movementType: InventoryMovementType.MOVED_TO_CUSTOMER,
          from: {
            state: BottleState.ASSIGNED_TO_DRIVER,
            holderType: StockHolderType.DRIVER,
            holderId: delivery.driverId ?? undefined,
          },
          to: {
            state: BottleState.WITH_CUSTOMER,
            holderType: StockHolderType.CUSTOMER,
            holderId: delivery.order.customerId,
          },
          driverId: delivery.driverId,
          customerId: delivery.order.customerId,
          orderId: delivery.orderId,
          deliveryId: delivery.id,
          performedByUserId: input.actorId,
          reason: "Delivered to customer",
        });
      }
    }

    const refillable = delivery.order.items.find(
      (item) => item.requiresBottleExchange,
    );

    if (refillable && parsed.emptyBottlesCollected > 0) {
      await applyStockMove(tx, {
        productId: refillable.productId,
        quantity: parsed.emptyBottlesCollected,
        movementType: InventoryMovementType.EMPTY_COLLECTED,
        from: {
          state: BottleState.WITH_CUSTOMER,
          holderType: StockHolderType.CUSTOMER,
          holderId: delivery.order.customerId,
        },
        to: {
          state: BottleState.EMPTY_WAREHOUSE,
          holderType: StockHolderType.WAREHOUSE,
        },
        driverId: delivery.driverId,
        customerId: delivery.order.customerId,
        orderId: delivery.orderId,
        deliveryId: delivery.id,
        performedByUserId: input.actorId,
        reason: "Empties collected on delivery",
      });
    }

    if (refillable && parsed.damagedBottlesReturned > 0) {
      await applyStockMove(tx, {
        productId: refillable.productId,
        quantity: parsed.damagedBottlesReturned,
        movementType: InventoryMovementType.BOTTLE_DAMAGED,
        from: {
          state: BottleState.WITH_CUSTOMER,
          holderType: StockHolderType.CUSTOMER,
          holderId: delivery.order.customerId,
        },
        to: {
          state: BottleState.DAMAGED,
          holderType: StockHolderType.WAREHOUSE,
        },
        driverId: delivery.driverId,
        customerId: delivery.order.customerId,
        orderId: delivery.orderId,
        deliveryId: delivery.id,
        performedByUserId: input.actorId,
        reason: "Damaged bottle returned",
      });
    }

    const bottlesHeldDelta =
      parsed.bottlesDelivered -
      parsed.emptyBottlesCollected -
      parsed.damagedBottlesReturned;

    await tx.customerBottleBalance.upsert({
      where: { customerId: delivery.order.customerId },
      create: {
        customerId: delivery.order.customerId,
        bottlesHeld: Math.max(bottlesHeldDelta, 0),
        outstandingShortage: Math.max(shortage, 0),
        lifetimeShortage: Math.max(shortage, 0),
        lifetimeReturned:
          parsed.emptyBottlesCollected + parsed.damagedBottlesReturned,
      },
      update: {
        bottlesHeld: { increment: bottlesHeldDelta },
        outstandingShortage: { increment: Math.max(shortage, 0) },
        lifetimeShortage: { increment: Math.max(shortage, 0) },
        lifetimeReturned: {
          increment: parsed.emptyBottlesCollected + parsed.damagedBottlesReturned,
        },
        version: { increment: 1 },
      },
    });

    if (shortage > 0) {
      await tx.customerBottleLedger.create({
        data: {
          customerId: delivery.order.customerId,
          entryType: BottleLedgerEntryType.SHORTAGE_RECORDED,
          quantity: shortage,
          deliveryId: delivery.id,
          orderId: delivery.orderId,
          performedByUserId: input.actorId,
          reason: `${shortage} empty bottle(s) not returned`,
        },
      });
    } else if (shortage < 0) {
      const surplus = Math.abs(shortage);
      const balance = await tx.customerBottleBalance.findUnique({
        where: { customerId: delivery.order.customerId },
      });
      const applied = Math.min(surplus, balance?.outstandingShortage ?? 0);

      if (applied > 0) {
        await tx.customerBottleBalance.update({
          where: { customerId: delivery.order.customerId },
          data: {
            outstandingShortage: { decrement: applied },
            version: { increment: 1 },
          },
        });
        await tx.customerBottleLedger.create({
          data: {
            customerId: delivery.order.customerId,
            entryType: BottleLedgerEntryType.RETURNED,
            quantity: -applied,
            deliveryId: delivery.id,
            orderId: delivery.orderId,
            performedByUserId: input.actorId,
            reason: "Surplus empties applied to an outstanding shortage",
          },
        });
      }
    }

    if (parsed.cashCollected) {
      const cash = money(parsed.cashCollected);
      const payment = await tx.payment.create({
        data: {
          reference: paymentReference(),
          customerId: delivery.order.customerId,
          purpose: PaymentPurpose.ORDER,
          orderId: delivery.orderId,
          deliveryId: delivery.id,
          amount: toAmountString(cash),
          method: PaymentMethod.CASH,
          status: PaymentStatus.PENDING_RECONCILIATION,
          collectedByUserId: input.actorId,
          notes: "Cash collected on delivery",
        },
      });

      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          type: TransactionType.PAYMENT,
          amount: toAmountString(cash),
          status: TransactionStatus.SUCCESSFUL,
          performedByUserId: input.actorId,
          reason: "COD collection",
        },
      });

      const paid = add(delivery.order.amountPaid, cash);
      await tx.order.update({
        where: { id: delivery.orderId },
        data: {
          amountPaid: toAmountString(paid),
          paymentStatus: greaterThanOrEqual(paid, delivery.order.total)
            ? OrderPaymentStatus.PAID
            : OrderPaymentStatus.PARTIALLY_PAID,
        },
      });
    }

    const refreshed = await tx.order.findUnique({
      where: { id: delivery.orderId },
    });

    if (
      refreshed &&
      refreshed.paymentStatus === OrderPaymentStatus.PAID &&
      greaterThanOrEqual(refreshed.total, qualifyingMin)
    ) {
      const referral = await tx.referral.findUnique({
        where: { referredCustomerId: delivery.order.customerId },
      });

      if (referral && referral.status === ReferralStatus.PENDING) {
        await tx.referral.update({
          where: { id: referral.id },
          data: {
            status: ReferralStatus.QUALIFIED,
            qualifyingOrderId: delivery.orderId,
            qualifiedAt: new Date(),
          },
        });

        const qualifiedCount = await tx.referral.count({
          where: {
            referrerCustomerId: referral.referrerCustomerId,
            status: ReferralStatus.QUALIFIED,
          },
        });
        const rewardsEarned = Math.floor(qualifiedCount / rewardEvery);
        const balance = await tx.customerRewardBalance.findUnique({
          where: { customerId: referral.referrerCustomerId },
        });
        const newlyEarned = rewardsEarned - (balance?.earned ?? 0);

        if (newlyEarned > 0) {
          await tx.customerRewardBalance.upsert({
            where: { customerId: referral.referrerCustomerId },
            create: {
              customerId: referral.referrerCustomerId,
              earned: newlyEarned,
              available: newlyEarned,
            },
            update: {
              earned: { increment: newlyEarned },
              available: { increment: newlyEarned },
              version: { increment: 1 },
            },
          });
          await tx.rewardLedger.create({
            data: {
              customerId: referral.referrerCustomerId,
              type: RewardLedgerType.EARNED,
              quantity: newlyEarned,
              referralId: referral.id,
              orderId: delivery.orderId,
              reason: "Referral threshold crossed",
            },
          });
        }
      }
    }

    await recordAudit(
      {
        userId: input.actorId,
        action: AUDIT_ACTIONS.deliveryCompleted,
        entityType: "Delivery",
        entityId: delivery.id,
        newValues: {
          bottlesDelivered: parsed.bottlesDelivered,
          emptyBottlesCollected: parsed.emptyBottlesCollected,
          shortage: Math.max(shortage, 0),
        },
      },
      tx,
    );

    await notify(
      {
        userId: delivery.order.customer.userId,
        category: NotificationCategory.DELIVERY,
        severity: NotificationSeverity.SUCCESS,
        title: "Delivery completed",
        body:
          shortage > 0
            ? `${delivery.deliveryNumber} was completed with ${shortage} bottle(s) still outstanding.`
            : `${delivery.deliveryNumber} was completed.`,
        entityType: "Delivery",
        entityId: delivery.id,
      },
      tx,
    );

    return delivery.id;
  });
}
