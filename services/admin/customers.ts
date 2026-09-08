import "server-only";

import { prisma } from "@/lib/db";

export async function listCustomers() {
  return prisma.customerProfile.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      customerCode: true,
      ghanaDigitalAddress: true,
      referralCode: true,
      createdAt: true,
      user: {
        select: {
          fullName: true,
          email: true,
          phone: true,
          status: true,
        },
      },
      bottleBalance: {
        select: { outstandingShortage: true, bottlesHeld: true },
      },
      _count: { select: { orders: true, addresses: true } },
    },
  });
}

export async function getCustomer(id: string) {
  return prisma.customerProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          phone: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
        },
      },
      bottleBalance: true,
      rewardBalance: true,
      registeredByAgent: {
        select: {
          agentCode: true,
          user: { select: { fullName: true } },
        },
      },
      addresses: {
        where: { isActive: true },
        orderBy: { isDefault: "desc" },
      },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          total: true,
          createdAt: true,
        },
      },
    },
  });
}
