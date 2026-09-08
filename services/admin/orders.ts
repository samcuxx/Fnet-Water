import "server-only";

import { prisma } from "@/lib/db";

export async function listOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      source: true,
      total: true,
      amountPaid: true,
      expectedEmptyBottles: true,
      scheduledFor: true,
      createdAt: true,
      customer: {
        select: {
          customerCode: true,
          user: { select: { fullName: true } },
        },
      },
      _count: { select: { items: true, deliveries: true } },
    },
  });
}

export async function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          customerCode: true,
          user: { select: { fullName: true, phone: true } },
        },
      },
      address: true,
      placedByUser: { select: { fullName: true, role: true } },
      items: { orderBy: { productName: "asc" } },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        include: { changedByUser: { select: { fullName: true } } },
      },
      deliveries: {
        orderBy: { attemptNumber: "desc" },
        select: {
          id: true,
          deliveryNumber: true,
          status: true,
          attemptNumber: true,
          scheduledFor: true,
          driver: { select: { driverCode: true, user: { select: { fullName: true } } } },
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          reference: true,
          method: true,
          status: true,
          amount: true,
          createdAt: true,
        },
      },
    },
  });
}
