import "server-only";

import { prisma } from "@/lib/db";

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 150,
    select: {
      id: true,
      code: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
}
