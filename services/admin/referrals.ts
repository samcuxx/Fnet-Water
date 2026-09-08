import "server-only";

import { prisma } from "@/lib/db";

export async function listReferrals() {
  return prisma.referral.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      referrerCustomer: {
        select: {
          id: true,
          customerCode: true,
          user: { select: { fullName: true } },
        },
      },
      referredCustomer: {
        select: {
          id: true,
          customerCode: true,
          user: { select: { fullName: true } },
        },
      },
      agent: {
        select: {
          agentCode: true,
          user: { select: { fullName: true } },
        },
      },
      qualifyingOrder: { select: { id: true, orderNumber: true } },
    },
  });
}

export async function listRewardBalances() {
  return prisma.customerRewardBalance.findMany({
    orderBy: { available: "desc" },
    take: 50,
    include: {
      customer: {
        select: {
          id: true,
          customerCode: true,
          user: { select: { fullName: true } },
        },
      },
    },
  });
}
