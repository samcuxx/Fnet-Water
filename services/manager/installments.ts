import "server-only";

import { prisma } from "@/lib/db";
import { InstallmentPlanStatus, InstallmentStatus } from "@/lib/generated/prisma/enums";

export async function listInstallmentPlans() {
  return prisma.dispenserPaymentPlan.findMany({
    orderBy: [{ status: "asc" }, { nextPaymentDate: "asc" }],
    include: {
      customer: {
        select: {
          id: true,
          customerCode: true,
          user: { select: { fullName: true, phone: true } },
        },
      },
      dispenser: {
        select: { id: true, assetTag: true, model: true },
      },
      installments: {
        where: {
          status: {
            in: [
              InstallmentStatus.PENDING,
              InstallmentStatus.DUE_SOON,
              InstallmentStatus.OVERDUE,
              InstallmentStatus.PARTIALLY_PAID,
            ],
          },
        },
        orderBy: { dueDate: "asc" },
        take: 1,
      },
    },
  });
}

export async function listOverdueInstallments() {
  return prisma.dispenserInstallment.findMany({
    where: { status: InstallmentStatus.OVERDUE },
    orderBy: { dueDate: "asc" },
    include: {
      plan: {
        select: {
          id: true,
          planNumber: true,
          status: true,
          outstandingBalance: true,
          customer: {
            select: {
              id: true,
              customerCode: true,
              user: { select: { fullName: true } },
            },
          },
          dispenser: { select: { assetTag: true, model: true } },
        },
      },
    },
  });
}

export const OPEN_PLAN_STATUSES: InstallmentPlanStatus[] = [
  InstallmentPlanStatus.PENDING,
  InstallmentPlanStatus.ACTIVE,
  InstallmentPlanStatus.DUE_SOON,
  InstallmentPlanStatus.OVERDUE,
];
