import "server-only";

import { prisma } from "@/lib/db";

export async function listTrackerDevices() {
  return prisma.trackerDevice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      dispenser: {
        select: {
          id: true,
          assetTag: true,
          customer: {
            select: { user: { select: { fullName: true } } },
          },
        },
      },
      _count: { select: { alerts: true } },
    },
  });
}

export async function listTrackerAlerts() {
  return prisma.trackerAlert.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      device: { select: { deviceCode: true } },
      acknowledgedByUser: { select: { fullName: true } },
    },
  });
}
