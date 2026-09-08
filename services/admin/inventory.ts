import "server-only";

import { prisma } from "@/lib/db";

export async function listStockPositions() {
  return prisma.bottleStockPosition.findMany({
    orderBy: [{ product: { sortOrder: "asc" } }, { state: "asc" }],
    include: {
      product: { select: { sku: true, name: true } },
    },
  });
}

export async function listInventoryMovements() {
  return prisma.inventoryMovement.findMany({
    orderBy: { occurredAt: "desc" },
    take: 40,
    include: {
      product: { select: { sku: true, name: true } },
      performedByUser: { select: { fullName: true } },
    },
  });
}

export async function listInventoryAdjustments() {
  return prisma.inventoryAdjustment.findMany({
    orderBy: { requestedAt: "desc" },
    take: 40,
    include: {
      product: { select: { sku: true, name: true } },
      requestedByUser: { select: { fullName: true } },
      reviewedByUser: { select: { fullName: true } },
    },
  });
}
