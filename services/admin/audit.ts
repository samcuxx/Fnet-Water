import "server-only";

import { prisma } from "@/lib/db";

export async function listAuditLog() {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { fullName: true, role: true } },
    },
  });
}
