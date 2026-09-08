import "server-only";

import { prisma } from "@/lib/db";

export async function listBottleBalances() {
  return prisma.customerBottleBalance.findMany({
    orderBy: { outstandingShortage: "desc" },
    take: 100,
    include: {
      customer: {
        select: {
          id: true,
          customerCode: true,
          user: { select: { fullName: true, phone: true } },
        },
      },
    },
  });
}

export async function listBottleLedger() {
  return prisma.customerBottleLedger.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      customer: {
        select: {
          customerCode: true,
          user: { select: { fullName: true } },
        },
      },
      performedByUser: { select: { fullName: true } },
    },
  });
}
