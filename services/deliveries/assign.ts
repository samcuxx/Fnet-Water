import "server-only";

import { BusinessRuleError, NotFoundError } from "@/lib/errors";
import {
  BottleState,
  DeliveryStatus,
  InventoryMovementType,
  NotificationCategory,
  OrderStatus,
  StockHolderType,
  UserStatus,
} from "@/lib/generated/prisma/enums";
import { notify } from "@/lib/notifications";
import { deliveryNumber } from "@/lib/utils/reference";
import { parseOrThrow, assignDriverSchema } from "@/lib/validation";
import { AUDIT_ACTIONS, record as recordAudit } from "@/services/audit";
import { applyStockMove } from "@/services/inventory/move";
import { prisma } from "@/lib/db";

const ASSIGNABLE: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.FAILED,
];

function nextStatuses(from: OrderStatus): OrderStatus[] {
  if (from === OrderStatus.FAILED) return [OrderStatus.ASSIGNED];
  if (from === OrderStatus.PENDING) {
    return [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.ASSIGNED];
  }
  if (from === OrderStatus.CONFIRMED) {
    return [OrderStatus.PROCESSING, OrderStatus.ASSIGNED];
  }
  if (from === OrderStatus.PROCESSING) return [OrderStatus.ASSIGNED];
  return [];
}

export async function listAvailableDrivers() {
  return prisma.driverProfile.findMany({
    where: { user: { status: UserStatus.ACTIVE } },
    orderBy: { driverCode: "asc" },
    select: {
      id: true,
      driverCode: true,
      isAvailable: true,
      user: { select: { fullName: true, phone: true } },
    },
  });
}

export async function assignDriver(input: {
  orderId: string;
  driverId: string;
  scheduledFor: Date | string;
  actorId: string;
}) {
  const parsed = parseOrThrow(assignDriverSchema, input);

  return prisma.$transaction(async (tx) => {
    const [order, driver] = await Promise.all([
      tx.order.findUnique({
        where: { id: parsed.orderId },
        include: {
          items: true,
          customer: { select: { userId: true } },
          address: true,
          deliveries: { orderBy: { attemptNumber: "desc" }, take: 1 },
        },
      }),
      tx.driverProfile.findUnique({
        where: { id: parsed.driverId },
        include: { user: { select: { id: true, fullName: true } } },
      }),
    ]);

    if (!order) throw new NotFoundError("Order");
    if (!driver) throw new NotFoundError("Driver");
    if (!ASSIGNABLE.includes(order.status) && order.status !== OrderStatus.ASSIGNED) {
      throw new BusinessRuleError("This order cannot be assigned to a driver.");
    }

    const latest = order.deliveries[0];
    const attemptNumber = latest ? latest.attemptNumber + 1 : 1;
    const reuse =
      latest &&
      (latest.status === DeliveryStatus.PENDING ||
        latest.status === DeliveryStatus.ASSIGNED) &&
      !latest.requiresReconciliation;

    let deliveryId: string;
    let deliveryNumberValue: string;

    if (reuse && latest) {
      await tx.delivery.update({
        where: { id: latest.id },
        data: {
          driverId: driver.id,
          status: DeliveryStatus.ASSIGNED,
          scheduledFor: parsed.scheduledFor,
          assignedAt: new Date(),
          bottlesDispatched: order.expectedEmptyBottles,
          emptyBottlesExpected: order.expectedEmptyBottles,
        },
      });
      deliveryId = latest.id;
      deliveryNumberValue = latest.deliveryNumber;
    } else {
      const created = await tx.delivery.create({
        data: {
          deliveryNumber: deliveryNumber(),
          orderId: order.id,
          driverId: driver.id,
          attemptNumber,
          status: DeliveryStatus.ASSIGNED,
          scheduledFor: parsed.scheduledFor,
          assignedAt: new Date(),
          bottlesDispatched: order.expectedEmptyBottles,
          emptyBottlesExpected: order.expectedEmptyBottles,
          addressSnapshot: order.address
            ? {
                addressLine: order.address.addressLine,
                city: order.address.city,
                ghanaDigitalAddress: order.address.ghanaDigitalAddress,
                landmark: order.address.landmark,
              }
            : undefined,
        },
      });
      deliveryId = created.id;
      deliveryNumberValue = created.deliveryNumber;
    }

    await tx.deliveryStatusHistory.create({
      data: {
        deliveryId,
        toStatus: DeliveryStatus.ASSIGNED,
        changedByUserId: input.actorId,
        reason: `Assigned to ${driver.user.fullName}`,
      },
    });

    if (order.status !== OrderStatus.ASSIGNED) {
      let previous: OrderStatus = order.status;
      for (const next of nextStatuses(order.status)) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: previous,
            toStatus: next,
            changedByUserId: input.actorId,
            reason: next === OrderStatus.ASSIGNED ? "Driver assigned" : undefined,
          },
        });
        previous = next;
      }

      const updated = await tx.order.updateMany({
        where: { id: order.id, status: order.status },
        data: {
          status: OrderStatus.ASSIGNED,
          confirmedAt: order.confirmedAt ?? new Date(),
          scheduledFor: parsed.scheduledFor,
        },
      });

      if (updated.count !== 1) {
        throw new BusinessRuleError("The order changed while it was being assigned.");
      }
    }

    for (const item of order.items) {
      if (!item.requiresBottleExchange || item.quantity <= 0) continue;

      await applyStockMove(tx, {
        productId: item.productId,
        quantity: item.quantity,
        movementType: InventoryMovementType.FILLED_DISPATCHED,
        from: {
          state: BottleState.FILLED_WAREHOUSE,
          holderType: StockHolderType.WAREHOUSE,
        },
        to: {
          state: BottleState.ASSIGNED_TO_DRIVER,
          holderType: StockHolderType.DRIVER,
          holderId: driver.id,
        },
        driverId: driver.id,
        orderId: order.id,
        deliveryId,
        performedByUserId: input.actorId,
        reason: "Loaded for delivery",
      });
    }

    await recordAudit(
      {
        userId: input.actorId,
        action: AUDIT_ACTIONS.deliveryAssigned,
        entityType: "Delivery",
        entityId: deliveryId,
        newValues: {
          deliveryNumber: deliveryNumberValue,
          driverId: driver.id,
          orderId: order.id,
        },
      },
      tx,
    );

    await notify(
      {
        userId: driver.user.id,
        category: NotificationCategory.DELIVERY,
        title: "New delivery assigned",
        body: `${deliveryNumberValue} for ${order.orderNumber} is on your round.`,
        entityType: "Delivery",
        entityId: deliveryId,
        actionUrl: `/driver/assigned`,
      },
      tx,
    );

    await notify(
      {
        userId: order.customer.userId,
        category: NotificationCategory.DELIVERY,
        title: "Driver assigned",
        body: `${order.orderNumber} has been assigned to ${driver.user.fullName}.`,
        entityType: "Order",
        entityId: order.id,
        actionUrl: `/customer/orders/${order.id}`,
      },
      tx,
    );

    return { deliveryId, orderId: order.id };
  });
}
