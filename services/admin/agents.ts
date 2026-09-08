import "server-only";

import { prisma } from "@/lib/db";

export async function listAgents() {
  return prisma.agentProfile.findMany({
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
        select: { registeredCustomers: true, referrals: true },
      },
    },
  });
}
