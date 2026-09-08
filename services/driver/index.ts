import "server-only";

import { prisma } from "@/lib/db";
import {
  BottleState,
  DeliveryStatus,
  StockHolderType,
} from "@/lib/generated/prisma/enums";
import { getDelivery } from "@/services/admin/deliveries";

const OPEN: DeliveryStatus[] = [
  DeliveryStatus.PENDING,
  DeliveryStatus.ASSIGNED,
  DeliveryStatus.OUT_FOR_DELIVERY,
];

const deliverySelect = {
  id: true,
  deliveryNumber: true,
  status: true,
  attemptNumber: true,
  scheduledFor: true,
  completedAt: true,
  bottlesDispatched: true,
  emptyBottlesExpected: true,
  shortageQuantity: true,
  cashCollected: true,
  failureReason: true,
  order: {
    select: {
      id: true,
      orderNumber: true,
      total: true,
      paymentStatus: true,
      instruction: true,
      customer: {
        select: {
          id: true,
          customerCode: true,
          user: { select: { fullName: true, phone: true } },
        },
      },
      address: true,
    },
  },
} as const;

export async function listDriverDeliveries(
  driverId: string,
  status: DeliveryStatus[] | DeliveryStatus,
) {
  return prisma.delivery.findMany({
    where: {
      driverId,
      status: Array.isArray(status) ? { in: status } : status,
    },
    orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }],
    select: deliverySelect,
  });
}

export async function listAssignedDeliveries(driverId: string) {
  return listDriverDeliveries(driverId, OPEN);
}

export async function listCompletedDeliveries(driverId: string) {
  return prisma.delivery.findMany({
    where: { driverId, status: DeliveryStatus.DELIVERED },
    orderBy: { completedAt: "desc" },
    take: 50,
    select: deliverySelect,
  });
}

export async function listDriverHistory(driverId: string) {
  return prisma.delivery.findMany({
    where: {
      driverId,
      status: {
        in: [
          DeliveryStatus.DELIVERED,
          DeliveryStatus.FAILED,
          DeliveryStatus.CANCELLED,
        ],
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 80,
    select: deliverySelect,
  });
}

export async function getDriverDelivery(driverId: string, deliveryId: string) {
  const delivery = await getDelivery(deliveryId);
  if (!delivery || delivery.driver?.id !== driverId) return null;
  return delivery;
}

export async function listDriverStock(driverId: string) {
  return prisma.bottleStockPosition.findMany({
    where: {
      holderType: StockHolderType.DRIVER,
      holderId: driverId,
      quantity: { gt: 0 },
    },
    include: {
      product: { select: { sku: true, name: true } },
    },
    orderBy: { state: "asc" },
  });
}

export { OPEN as OPEN_DRIVER_STATUSES, BottleState };
