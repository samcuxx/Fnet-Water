import "server-only";

import { forbidden } from "next/navigation";

import { prisma } from "@/lib/db";
import { ReferralStatus } from "@/lib/generated/prisma/enums";
import { getOrder } from "@/services/admin/orders";

export async function listAgentCustomers(agentId: string) {
  return prisma.customerProfile.findMany({
    where: { registeredByAgentId: agentId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      customerCode: true,
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

export async function getAgentCustomer(agentId: string, customerId: string) {
  const customer = await prisma.customerProfile.findUnique({
    where: { id: customerId },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          phone: true,
          status: true,
          lastLoginAt: true,
        },
      },
      bottleBalance: true,
      rewardBalance: true,
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

  if (!customer || customer.registeredByAgentId !== agentId) {
    forbidden();
  }

  return customer;
}

export async function listAgentOrders(agentId: string) {
  return prisma.order.findMany({
    where: { customer: { registeredByAgentId: agentId } },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      source: true,
      total: true,
      createdAt: true,
      customer: {
        select: {
          id: true,
          customerCode: true,
          user: { select: { fullName: true } },
        },
      },
      _count: { select: { items: true } },
    },
  });
}

export async function getAgentOrder(agentId: string, orderId: string) {
  const order = await getOrder(orderId);
  if (!order) return null;

  const customer = await prisma.customerProfile.findUnique({
    where: { id: order.customer.id },
    select: { registeredByAgentId: true },
  });

  if (!customer || customer.registeredByAgentId !== agentId) {
    forbidden();
  }

  return order;
}

export async function listAgentReferrals(agentId: string) {
  return prisma.referral.findMany({
    where: { agentId },
    orderBy: { createdAt: "desc" },
    include: {
      referrerCustomer: {
        select: {
          customerCode: true,
          user: { select: { fullName: true } },
        },
      },
      referredCustomer: {
        select: {
          customerCode: true,
          user: { select: { fullName: true } },
        },
      },
      qualifyingOrder: { select: { id: true, orderNumber: true } },
    },
  });
}

export async function getAgentPerformance(agentId: string) {
  const [customers, orders, referrals] = await Promise.all([
    prisma.customerProfile.count({ where: { registeredByAgentId: agentId } }),
    prisma.order.aggregate({
      where: { customer: { registeredByAgentId: agentId } },
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.referral.groupBy({
      by: ["status"],
      where: { agentId },
      _count: { _all: true },
    }),
  ]);

  const referralCounts = Object.fromEntries(
    referrals.map((row) => [row.status, row._count._all]),
  ) as Partial<Record<ReferralStatus, number>>;

  return {
    customers,
    ordersPlaced: orders._count._all,
    orderValue: orders._sum.total ?? 0,
    referralsPending: referralCounts[ReferralStatus.PENDING] ?? 0,
    referralsQualified: referralCounts[ReferralStatus.QUALIFIED] ?? 0,
    referralsReversed: referralCounts[ReferralStatus.REVERSED] ?? 0,
  };
}
