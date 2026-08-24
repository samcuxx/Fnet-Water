import "server-only";

import { endOfDay, startOfDay } from "date-fns";

import { prisma } from "@/lib/db";
import {
  AdjustmentStatus,
  BottleState,
  DeliveryStatus,
  InstallmentPlanStatus,
  InstallmentStatus,
  OrderPaymentStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ReferralStatus,
  StockHolderType,
  TransactionStatus,
  UserRole,
  UserStatus,
} from "@/lib/generated/prisma/enums";
import { add, money, subtract, type Money, ZERO } from "@/lib/money";

/**
 * Dashboard summaries.
 *
 * Every figure here is derived from committed records — there are no seeded
 * placeholder metrics. Each function is a fixed, bounded set of aggregate
 * queries rather than a scan of rows into application memory, so the cost does
 * not grow with the size of the business.
 *
 * Order statuses that still represent live work. Used by several summaries.
 */
const OPEN_ORDER_STATUSES = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.ASSIGNED,
  OrderStatus.OUT_FOR_DELIVERY,
] as const;

const OPEN_DELIVERY_STATUSES = [
  DeliveryStatus.PENDING,
  DeliveryStatus.ASSIGNED,
  DeliveryStatus.OUT_FOR_DELIVERY,
] as const;

function todayRange(): { gte: Date; lte: Date } {
  const now = new Date();
  return { gte: startOfDay(now), lte: endOfDay(now) };
}

/**
 * Net cash recognised: successful payment entries less reversals and refunds.
 *
 * Reversals and refunds are stored as negative ledger entries, so a single sum
 * over the ledger is already the net position — no subtraction of separately
 * tracked totals, which could drift.
 */
async function netRevenue(): Promise<Money> {
  const result = await prisma.paymentTransaction.aggregate({
    _sum: { amount: true },
    where: { status: TransactionStatus.SUCCESSFUL },
  });

  return money(result._sum.amount ?? 0);
}

/** Invoiced but uncollected: order totals less what has been paid against them. */
async function outstandingOrderValue(): Promise<Money> {
  const result = await prisma.order.aggregate({
    _sum: { total: true, amountPaid: true },
    where: {
      status: { not: OrderStatus.CANCELLED },
      paymentStatus: {
        in: [
          OrderPaymentStatus.UNPAID,
          OrderPaymentStatus.PENDING,
          OrderPaymentStatus.PARTIALLY_PAID,
        ],
      },
    },
  });

  return subtract(result._sum.total ?? 0, result._sum.amountPaid ?? 0);
}

export type OrderStatusBreakdown = {
  status: OrderStatus;
  count: number;
}[];

async function ordersByStatus(): Promise<OrderStatusBreakdown> {
  const grouped = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  // Present every status, including the ones with no orders, so the chart
  // legend stays stable between refreshes.
  const counts = new Map(grouped.map((row) => [row.status, row._count._all]));

  return Object.values(OrderStatus).map((status) => ({
    status,
    count: counts.get(status) ?? 0,
  }));
}

export type BottleStateBreakdown = Partial<Record<BottleState, number>>;

async function bottlePositions(): Promise<BottleStateBreakdown> {
  const grouped = await prisma.bottleStockPosition.groupBy({
    by: ["state"],
    _sum: { quantity: true },
  });

  return Object.fromEntries(
    grouped.map((row) => [row.state, row._sum.quantity ?? 0]),
  );
}

// --- Administrator ---------------------------------------------------------

export type AdminSummary = Awaited<ReturnType<typeof getAdminSummary>>;

export async function getAdminSummary() {
  const today = todayRange();

  const [
    customers,
    orders,
    deliveredToday,
    revenue,
    outstandingOrders,
    outstandingInstallments,
    statusBreakdown,
    stock,
    bottleShortages,
    overdueInstallments,
    failedDeliveries,
    pendingAdjustments,
    openTrackerAlerts,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count({
      where: { role: UserRole.CUSTOMER, status: UserStatus.ACTIVE },
    }),
    prisma.order.count(),
    prisma.delivery.count({
      where: { status: DeliveryStatus.DELIVERED, completedAt: today },
    }),
    netRevenue(),
    outstandingOrderValue(),
    prisma.dispenserPaymentPlan.aggregate({
      _sum: { outstandingBalance: true },
      where: {
        status: {
          in: [
            InstallmentPlanStatus.ACTIVE,
            InstallmentPlanStatus.DUE_SOON,
            InstallmentPlanStatus.OVERDUE,
          ],
        },
      },
    }),
    ordersByStatus(),
    bottlePositions(),
    prisma.customerBottleBalance.aggregate({
      _sum: { outstandingShortage: true },
      _count: { _all: true },
      where: { outstandingShortage: { gt: 0 } },
    }),
    prisma.dispenserInstallment.count({
      where: { status: InstallmentStatus.OVERDUE },
    }),
    prisma.delivery.count({ where: { requiresReconciliation: true } }),
    prisma.inventoryAdjustment.count({
      where: { status: AdjustmentStatus.PENDING_APPROVAL },
    }),
    prisma.trackerAlert.count({ where: { isResolved: false } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        total: true,
        scheduledFor: true,
        createdAt: true,
        customer: { select: { customerCode: true, user: { select: { fullName: true } } } },
        _count: { select: { items: true } },
      },
    }),
  ]);

  return {
    customers,
    orders,
    deliveredToday,
    revenue,
    outstanding: add(
      outstandingOrders,
      outstandingInstallments._sum.outstandingBalance ?? 0,
    ),
    outstandingOrders,
    outstandingInstallments: money(
      outstandingInstallments._sum.outstandingBalance ?? 0,
    ),
    statusBreakdown,
    stock,
    bottleShortages: {
      customers: bottleShortages._count._all,
      bottles: bottleShortages._sum.outstandingShortage ?? 0,
    },
    attention: {
      overdueInstallments,
      failedDeliveries,
      pendingAdjustments,
      openTrackerAlerts,
    },
    recentOrders,
  };
}

// --- Manager ---------------------------------------------------------------

export type ManagerSummary = Awaited<ReturnType<typeof getManagerSummary>>;

export async function getManagerSummary() {
  const today = todayRange();

  const [
    scheduledToday,
    unassigned,
    inProgress,
    completedToday,
    needsReconciliation,
    openOrders,
    unpaidOrders,
    lowStock,
    bottleShortages,
    overdueInstallments,
    upcomingDeliveries,
  ] = await Promise.all([
    prisma.delivery.count({ where: { scheduledFor: today } }),
    prisma.delivery.count({
      where: { status: DeliveryStatus.PENDING, driverId: null },
    }),
    prisma.delivery.count({
      where: { status: DeliveryStatus.OUT_FOR_DELIVERY },
    }),
    prisma.delivery.count({
      where: { status: DeliveryStatus.DELIVERED, completedAt: today },
    }),
    prisma.delivery.count({ where: { requiresReconciliation: true } }),
    prisma.order.count({ where: { status: { in: [...OPEN_ORDER_STATUSES] } } }),
    prisma.order.count({
      where: {
        status: { not: OrderStatus.CANCELLED },
        paymentStatus: {
          in: [OrderPaymentStatus.UNPAID, OrderPaymentStatus.PARTIALLY_PAID],
        },
      },
    }),
    prisma.bottleStockPosition.aggregate({
      _sum: { quantity: true },
      where: { state: BottleState.FILLED_WAREHOUSE },
    }),
    prisma.customerBottleBalance.aggregate({
      _sum: { outstandingShortage: true },
      where: { outstandingShortage: { gt: 0 } },
    }),
    prisma.dispenserInstallment.count({
      where: { status: InstallmentStatus.OVERDUE },
    }),
    prisma.delivery.findMany({
      where: { status: { in: [...OPEN_DELIVERY_STATUSES] } },
      orderBy: [{ scheduledFor: "asc" }, { createdAt: "asc" }],
      take: 6,
      select: {
        id: true,
        deliveryNumber: true,
        status: true,
        scheduledFor: true,
        bottlesDispatched: true,
        order: {
          select: {
            orderNumber: true,
            total: true,
            customer: {
              select: { customerCode: true, user: { select: { fullName: true } } },
            },
          },
        },
        driver: {
          select: { driverCode: true, user: { select: { fullName: true } } },
        },
      },
    }),
  ]);

  return {
    deliveries: {
      scheduledToday,
      unassigned,
      inProgress,
      completedToday,
      needsReconciliation,
    },
    orders: { open: openOrders, unpaid: unpaidOrders },
    filledStock: lowStock._sum.quantity ?? 0,
    outstandingBottles: bottleShortages._sum.outstandingShortage ?? 0,
    overdueInstallments,
    upcomingDeliveries,
  };
}

// --- Agent -----------------------------------------------------------------

export type AgentSummary = Awaited<ReturnType<typeof getAgentSummary>>;

export async function getAgentSummary(agentId: string, userId: string) {
  const [
    registeredCustomers,
    ordersPlaced,
    orderValue,
    referralsPending,
    referralsQualified,
    commissionRate,
    recentCustomers,
  ] = await Promise.all([
    prisma.customerProfile.count({ where: { registeredByAgentId: agentId } }),
    prisma.order.count({ where: { placedByUserId: userId } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        placedByUserId: userId,
        status: { not: OrderStatus.CANCELLED },
      },
    }),
    prisma.referral.count({
      where: { agentId, status: ReferralStatus.PENDING },
    }),
    prisma.referral.count({
      where: { agentId, status: ReferralStatus.QUALIFIED },
    }),
    prisma.agentProfile.findUnique({
      where: { id: agentId },
      select: { commissionRate: true },
    }),
    prisma.customerProfile.findMany({
      where: { registeredByAgentId: agentId },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        customerCode: true,
        createdAt: true,
        user: { select: { fullName: true, phone: true, status: true } },
        _count: { select: { orders: true } },
      },
    }),
  ]);

  const totalOrderValue = money(orderValue._sum.total ?? 0);
  const rate = commissionRate?.commissionRate ?? ZERO;

  return {
    registeredCustomers,
    ordersPlaced,
    totalOrderValue,
    // Indicative only: commission is a rate applied to the value the agent
    // generated. Settlement is a finance process, not a dashboard figure.
    indicativeCommission: money(totalOrderValue.mul(rate)),
    commissionRate: rate,
    referralsPending,
    referralsQualified,
    recentCustomers,
  };
}

// --- Driver ----------------------------------------------------------------

export type DriverSummary = Awaited<ReturnType<typeof getDriverSummary>>;

export async function getDriverSummary(driverId: string) {
  const today = todayRange();

  const [
    assigned,
    outForDelivery,
    completedToday,
    failedToday,
    cashToday,
    stockOnHand,
    todaysDeliveries,
  ] = await Promise.all([
    prisma.delivery.count({
      where: { driverId, status: DeliveryStatus.ASSIGNED },
    }),
    prisma.delivery.count({
      where: { driverId, status: DeliveryStatus.OUT_FOR_DELIVERY },
    }),
    prisma.delivery.count({
      where: { driverId, status: DeliveryStatus.DELIVERED, completedAt: today },
    }),
    prisma.delivery.count({
      where: { driverId, status: DeliveryStatus.FAILED, failedAt: today },
    }),
    // Cash the driver is accountable for today: collected on their own
    // deliveries and not yet reconciled by management.
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        delivery: { driverId },
        method: PaymentMethod.CASH,
        status: {
          in: [PaymentStatus.SUCCESSFUL, PaymentStatus.PENDING_RECONCILIATION],
        },
        createdAt: today,
      },
    }),
    prisma.bottleStockPosition.aggregate({
      _sum: { quantity: true },
      where: { holderType: StockHolderType.DRIVER, holderId: driverId },
    }),
    prisma.delivery.findMany({
      where: {
        driverId,
        status: { in: [...OPEN_DELIVERY_STATUSES] },
      },
      orderBy: [{ scheduledFor: "asc" }, { createdAt: "asc" }],
      take: 10,
      select: {
        id: true,
        deliveryNumber: true,
        status: true,
        scheduledFor: true,
        bottlesDispatched: true,
        emptyBottlesExpected: true,
        order: {
          select: {
            orderNumber: true,
            total: true,
            amountPaid: true,
            paymentStatus: true,
            instruction: true,
            customer: {
              select: {
                customerCode: true,
                user: { select: { fullName: true, phone: true } },
              },
            },
            address: {
              select: {
                label: true,
                addressLine: true,
                city: true,
                landmark: true,
                ghanaDigitalAddress: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    assigned,
    outForDelivery,
    completedToday,
    failedToday,
    cashCollectedToday: money(cashToday._sum.amount ?? 0),
    bottlesOnHand: stockOnHand._sum.quantity ?? 0,
    todaysDeliveries,
  };
}

// --- Customer --------------------------------------------------------------

export type CustomerSummary = Awaited<ReturnType<typeof getCustomerSummary>>;

export async function getCustomerSummary(customerId: string) {
  const [
    activeOrders,
    bottleBalance,
    rewardBalance,
    installmentPlans,
    amountDue,
    nextDelivery,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({
      where: { customerId, status: { in: [...OPEN_ORDER_STATUSES] } },
    }),
    prisma.customerBottleBalance.findUnique({
      where: { customerId },
      select: {
        bottlesHeld: true,
        outstandingShortage: true,
        lifetimeReturned: true,
      },
    }),
    prisma.customerRewardBalance.findUnique({
      where: { customerId },
      select: { available: true, earned: true, redeemed: true },
    }),
    prisma.dispenserPaymentPlan.findMany({
      where: {
        customerId,
        status: {
          in: [
            InstallmentPlanStatus.ACTIVE,
            InstallmentPlanStatus.DUE_SOON,
            InstallmentPlanStatus.OVERDUE,
            InstallmentPlanStatus.PENDING,
          ],
        },
      },
      select: {
        id: true,
        planNumber: true,
        status: true,
        outstandingBalance: true,
        installmentAmount: true,
        nextPaymentDate: true,
        dispenser: { select: { assetTag: true, model: true } },
      },
      orderBy: { nextPaymentDate: "asc" },
    }),
    prisma.order.aggregate({
      _sum: { total: true, amountPaid: true },
      where: {
        customerId,
        status: { not: OrderStatus.CANCELLED },
        paymentStatus: {
          in: [OrderPaymentStatus.UNPAID, OrderPaymentStatus.PARTIALLY_PAID],
        },
      },
    }),
    prisma.delivery.findFirst({
      where: {
        order: { customerId },
        status: { in: [...OPEN_DELIVERY_STATUSES] },
      },
      orderBy: [{ scheduledFor: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        deliveryNumber: true,
        status: true,
        scheduledFor: true,
        emptyBottlesExpected: true,
        order: { select: { orderNumber: true } },
        driver: { select: { user: { select: { fullName: true } } } },
      },
    }),
    prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        total: true,
        createdAt: true,
        scheduledFor: true,
        _count: { select: { items: true } },
      },
    }),
  ]);

  return {
    activeOrders,
    bottlesHeld: bottleBalance?.bottlesHeld ?? 0,
    bottleShortage: bottleBalance?.outstandingShortage ?? 0,
    bottlesReturned: bottleBalance?.lifetimeReturned ?? 0,
    rewardsAvailable: rewardBalance?.available ?? 0,
    rewardsEarned: rewardBalance?.earned ?? 0,
    installmentPlans,
    dispenserOutstanding: installmentPlans.reduce<Money>(
      (total, plan) => add(total, plan.outstandingBalance),
      ZERO,
    ),
    orderAmountDue: subtract(
      amountDue._sum.total ?? 0,
      amountDue._sum.amountPaid ?? 0,
    ),
    nextDelivery,
    recentOrders,
  };
}
