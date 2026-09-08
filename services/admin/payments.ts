import "server-only";

import { prisma } from "@/lib/db";

export async function listPayments() {
  return prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      reference: true,
      purpose: true,
      method: true,
      status: true,
      amount: true,
      createdAt: true,
      customer: {
        select: {
          id: true,
          customerCode: true,
          user: { select: { fullName: true } },
        },
      },
      order: { select: { id: true, orderNumber: true } },
    },
  });
}
