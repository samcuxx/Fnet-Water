import "server-only";

import { prisma } from "@/lib/db";

export async function listDispensers() {
  return prisma.dispenser.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: {
        select: {
          id: true,
          customerCode: true,
          user: { select: { fullName: true } },
        },
      },
      paymentPlans: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          planNumber: true,
          status: true,
          outstandingBalance: true,
        },
      },
    },
  });
}

export async function getDispenser(id: string) {
  return prisma.dispenser.findFirst({
    where: { OR: [{ id }, { assetTag: id }] },
    include: {
      customer: {
        select: {
          id: true,
          customerCode: true,
          user: { select: { fullName: true, phone: true } },
        },
      },
      address: true,
      trackerDevice: {
        select: {
          deviceCode: true,
          isOnline: true,
          waterLevelPercent: true,
          batteryPercent: true,
        },
      },
      paymentPlans: {
        orderBy: { createdAt: "desc" },
        include: {
          installments: { orderBy: { sequence: "asc" } },
        },
      },
    },
  });
}
