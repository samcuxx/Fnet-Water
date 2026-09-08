import "server-only";

import { prisma } from "@/lib/db";

export async function listDeliveries() {
  return prisma.delivery.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      deliveryNumber: true,
      status: true,
      attemptNumber: true,
      scheduledFor: true,
      requiresReconciliation: true,
      shortageQuantity: true,
      createdAt: true,
      driver: {
        select: {
          driverCode: true,
          user: { select: { fullName: true } },
        },
      },
      order: {
        select: {
          id: true,
          orderNumber: true,
          customer: {
            select: {
              customerCode: true,
              user: { select: { fullName: true } },
            },
          },
        },
      },
    },
  });
}

export async function getDelivery(id: string) {
  return prisma.delivery.findUnique({
    where: { id },
    include: {
      driver: {
        select: {
          id: true,
          driverCode: true,
          user: { select: { fullName: true, phone: true } },
        },
      },
      order: {
        select: {
          id: true,
          orderNumber: true,
          expectedEmptyBottles: true,
          customer: {
            select: {
              id: true,
              customerCode: true,
              user: { select: { fullName: true, phone: true } },
            },
          },
        },
      },
      reconciledByUser: { select: { fullName: true } },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        include: { changedByUser: { select: { fullName: true } } },
      },
    },
  });
}
