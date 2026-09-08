import "server-only";

import { prisma } from "@/lib/db";
import {
  DeliveryStatus,
  OrderPaymentStatus,
  OrderStatus,
  PaymentStatus,
  TransactionStatus,
} from "@/lib/generated/prisma/enums";
import { add, money, subtract } from "@/lib/money";

export async function getAdminReports() {
  const [
    ordersByStatus,
    paymentsByMethod,
    revenue,
    outstandingOrders,
    delivered,
    failedDeliveries,
    customers,
    agents,
    drivers,
  ] = await Promise.all([
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.payment.groupBy({
      by: ["method"],
      _count: { _all: true },
      _sum: { amount: true },
      where: { status: PaymentStatus.SUCCESSFUL },
    }),
    prisma.paymentTransaction.aggregate({
      _sum: { amount: true },
      where: { status: TransactionStatus.SUCCESSFUL },
    }),
    prisma.order.aggregate({
      _sum: { total: true, amountPaid: true },
      where: {
        status: { not: OrderStatus.CANCELLED },
        paymentStatus: {
          in: [
            OrderPaymentStatus.UNPAID,
            OrderPaymentStatus.PENDING,
            OrderPaymentStatus.PARTIALLY_PAID,
          ],
        },
      },
    }),
    prisma.delivery.count({ where: { status: DeliveryStatus.DELIVERED } }),
    prisma.delivery.count({ where: { requiresReconciliation: true } }),
    prisma.customerProfile.count(),
    prisma.agentProfile.count(),
    prisma.driverProfile.count(),
  ]);

  return {
    ordersByStatus: ordersByStatus.map((row) => ({
      status: row.status,
      count: row._count._all,
      total: money(row._sum.total ?? 0),
    })),
    paymentsByMethod: paymentsByMethod.map((row) => ({
      method: row.method,
      count: row._count._all,
      total: money(row._sum.amount ?? 0),
    })),
    revenue: money(revenue._sum.amount ?? 0),
    outstanding: subtract(
      outstandingOrders._sum.total ?? 0,
      outstandingOrders._sum.amountPaid ?? 0,
    ),
    delivered,
    failedDeliveries,
    customers,
    agents,
    drivers,
    collected: add(0, revenue._sum.amount ?? 0),
  };
}
