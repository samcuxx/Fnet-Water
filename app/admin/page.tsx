import type { Metadata } from "next";

import {
  Banknote,
  Boxes,
  Droplets,
  Package,
  Receipt,
  ShieldAlert,
  Truck,
  Users,
} from "lucide-react";

import { PageHeader, StatCard } from "@/components/dashboard";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  StatusBadge,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { requireAdministrator } from "@/lib/auth/dal";
import { BottleState } from "@/lib/generated/prisma/enums";
import { formatMoney } from "@/lib/money";
import { formatDate, formatNumber, humanizeEnum } from "@/lib/utils";
import { getAdminSummary } from "@/services/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Organisation-wide view of F Net Water Hub operations.",
};

export default async function AdminDashboardPage() {
  // Authorization is asserted again here, not inherited from the layout.
  await requireAdministrator();

  const summary = await getAdminSummary();
  const totalOrders = summary.statusBreakdown.reduce(
    (total, row) => total + row.count,
    0,
  );

  const attention = [
    {
      label: "Deliveries awaiting reconciliation",
      count: summary.attention.failedDeliveries,
      href: "/admin/deliveries",
    },
    {
      label: "Overdue dispenser installments",
      count: summary.attention.overdueInstallments,
      href: "/admin/dispensers",
    },
    {
      label: "Inventory adjustments awaiting approval",
      count: summary.attention.pendingAdjustments,
      href: "/admin/inventory",
    },
    {
      label: "Open tracker alerts",
      count: summary.attention.openTrackerAlerts,
      href: "/admin/trackers",
    },
  ].filter((item) => item.count > 0);

  const stockRows: { label: string; state: BottleState }[] = [
    { label: "Filled — warehouse", state: BottleState.FILLED_WAREHOUSE },
    { label: "Empty — warehouse", state: BottleState.EMPTY_WAREHOUSE },
    { label: "With drivers", state: BottleState.ASSIGNED_TO_DRIVER },
    { label: "In transit", state: BottleState.IN_TRANSIT },
    { label: "With customers", state: BottleState.WITH_CUSTOMER },
    { label: "Damaged", state: BottleState.DAMAGED },
    { label: "Lost", state: BottleState.LOST },
    { label: "Under investigation", state: BottleState.UNDER_INVESTIGATION },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Organisation-wide view of orders, deliveries, stock and money."
      />

      <section
        aria-label="Key figures"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        <StatCard
          label="Active customers"
          value={formatNumber(summary.customers)}
          icon={Users}
        />
        <StatCard
          label="Total orders"
          value={formatNumber(summary.orders)}
          icon={Package}
          tone="aqua"
        />
        <StatCard
          label="Delivered today"
          value={formatNumber(summary.deliveredToday)}
          icon={Truck}
          tone="success"
        />
        <StatCard
          label="Net revenue"
          value={formatMoney(summary.revenue)}
          icon={Banknote}
          tone="success"
          hint="Payments less reversals and refunds"
        />
        <StatCard
          label="Outstanding"
          value={formatMoney(summary.outstanding)}
          icon={Receipt}
          tone="warning"
          hint="Orders and installments"
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>
              The six most recently placed orders across all channels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary.recentOrders.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No orders yet"
                description="Orders placed by customers, agents or staff will appear here."
              />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Order</TH>
                    <TH>Customer</TH>
                    <TH numeric>Items</TH>
                    <TH numeric>Total</TH>
                    <TH>Status</TH>
                    <TH>Payment</TH>
                    <TH>Placed</TH>
                  </TR>
                </THead>
                <TBody>
                  {summary.recentOrders.map((order) => (
                    <TR key={order.id}>
                      <TD className="font-medium text-brand-700">
                        {order.orderNumber}
                      </TD>
                      <TD>
                        <span className="block text-slate-900">
                          {order.customer.user.fullName}
                        </span>
                        <span className="block font-mono text-xs text-slate-400">
                          {order.customer.customerCode}
                        </span>
                      </TD>
                      <TD numeric>{order._count.items}</TD>
                      <TD numeric>{formatMoney(order.total)}</TD>
                      <TD>
                        <StatusBadge status={order.status} />
                      </TD>
                      <TD>
                        <StatusBadge status={order.paymentStatus} />
                      </TD>
                      <TD className="whitespace-nowrap text-slate-500">
                        {formatDate(order.createdAt)}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders by status</CardTitle>
            <CardDescription>
              {formatNumber(totalOrders)} orders in total.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {totalOrders === 0 ? (
              <EmptyState
                icon={Package}
                title="Nothing to break down"
                description="Status distribution appears once orders exist."
              />
            ) : (
              <ul className="space-y-3">
                {summary.statusBreakdown.map((row) => {
                  const share = totalOrders > 0 ? row.count / totalOrders : 0;

                  return (
                    <li key={row.status}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-slate-600">
                          {humanizeEnum(row.status)}
                        </span>
                        <span className="font-medium text-slate-900 tabular-money">
                          {formatNumber(row.count)}
                        </span>
                      </div>
                      {/* A bar rather than a chart library: one dependency less
                          on a view that only needs proportions. */}
                      <div
                        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"
                        role="presentation"
                      >
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${Math.max(share * 100, row.count > 0 ? 2 : 0)}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bottle positions</CardTitle>
            <CardDescription>
              Derived from the inventory ledger, not from editable counters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stockRows.map((row) => (
                <div
                  key={row.state}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
                >
                  <dt className="text-xs font-medium text-slate-500">
                    {row.label}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-slate-900 tabular-money">
                    {formatNumber(summary.stock[row.state] ?? 0)}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-warning-50 px-4 py-3">
              <Droplets className="size-5 shrink-0 text-warning-600" aria-hidden />
              <p className="text-sm text-warning-700">
                <span className="font-semibold">
                  {formatNumber(summary.bottleShortages.bottles)}
                </span>{" "}
                bottles outstanding across{" "}
                <span className="font-semibold">
                  {formatNumber(summary.bottleShortages.customers)}
                </span>{" "}
                customers.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
            <CardDescription>
              Operational exceptions waiting on a decision.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attention.length === 0 ? (
              <EmptyState
                icon={Boxes}
                title="Nothing outstanding"
                description="Failed deliveries, overdue installments and pending adjustments will surface here."
              />
            ) : (
              <ul className="space-y-2.5">
                {attention.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3"
                  >
                    <span className="flex gap-2.5 text-sm text-slate-700">
                      <ShieldAlert
                        className="mt-0.5 size-4 shrink-0 text-danger-500"
                        aria-hidden
                      />
                      {item.label}
                    </span>
                    <Badge tone="danger">{formatNumber(item.count)}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
