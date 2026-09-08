import "server-only";

import { prisma } from "@/lib/db";
import { DeliveryStatus } from "@/lib/generated/prisma/enums";

export async function listDrivers() {
  return prisma.driverProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          fullName: true,
          phone: true,
          email: true,
          status: true,
        },
      },
      _count: {
        select: {
          deliveries: true,
        },
      },
    },
  });
}

export async function listDriverOpenDeliveries() {
  return prisma.delivery.groupBy({
    by: ["driverId"],
    _count: { _all: true },
    where: {
      driverId: { not: null },
      status: {
        in: [
          DeliveryStatus.ASSIGNED,
          DeliveryStatus.OUT_FOR_DELIVERY,
          DeliveryStatus.PENDING,
        ],
      },
    },
  });
}
