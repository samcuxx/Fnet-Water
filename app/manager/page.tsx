import type { Metadata } from "next";

import {
  CalendarClock,
  Droplets,
  Package,
  Receipt,
  Truck,
  TriangleAlert,
  UserRoundX,
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
import { requireManager } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { formatFriendlyDateTime, formatNumber } from "@/lib/utils";
import { getManagerSummary } from "@/services/dashboard";

export const metadata: Metadata = {
  title: "Operations",
  description: "Daily operational view of deliveries, stock and collections.",
};

export default async function ManagerDashboardPage() {
  await requireManager();

  const summary = await getManagerSummary();

  return (
    <>
      <PageHeader
        title="Operations"
        description="Today's deliveries, assignment gaps and the exceptions that need a decision."
      />

      <section
        aria-label="Today at a glance"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Scheduled today"
          value={formatNumber(summary.deliveries.scheduledToday)}
          icon={CalendarClock}
        />
        <StatCard
          label="Awaiting a driver"
          value={formatNumber(summary.deliveries.unassigned)}
          icon={UserRoundX}
          tone={summary.deliveries.unassigned > 0 ? "warning" : "success"}
          hint="Unassigned deliveries"
        />
        <StatCard
          label="Out for delivery"
          value={formatNumber(summary.deliveries.inProgress)}
          icon={Truck}
          tone="aqua"
        />
        <StatCard
          label="Completed today"
          value={formatNumber(summary.deliveries.completedToday)}
          icon={Truck}
          tone="success"
        />
      </section>

      <section
        aria-label="Exceptions"
        className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Needs reconciliation"
          value={formatNumber(summary.deliveries.needsReconciliation)}
          icon={TriangleAlert}
          tone={summary.deliveries.needsReconciliation > 0 ? "danger" : "success"}
          hint="Failed deliveries holding stock"
        />
        <StatCard
          label="Filled stock available"
          value={formatNumber(summary.filledStock)}
          icon={Droplets}
          tone="brand"
        />
        <StatCard
          label="Bottles with customers"
          value={formatNumber(summary.outstandingBottles)}
          icon={Package}
          tone="warning"
          hint="Outstanding shortages"
        />
        <StatCard
          label="Overdue installments"
          value={formatNumber(summary.overdueInstallments)}
          icon={Receipt}
          tone={summary.overdueInstallments > 0 ? "danger" : "success"}
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Deliveries in flight</CardTitle>
            <CardDescription>
              Pending, assigned and out-for-delivery jobs, soonest first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary.upcomingDeliveries.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="Nothing in flight"
                description="Deliveries appear here once orders are confirmed and scheduled."
              />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Delivery</TH>
                    <TH>Customer</TH>
                    <TH>Driver</TH>
                    <TH numeric>Bottles</TH>
                    <TH numeric>Order value</TH>
                    <TH>Scheduled</TH>
                    <TH>Status</TH>
                  </TR>
                </THead>
                <TBody>
                  {summary.upcomingDeliveries.map((delivery) => (
                    <TR key={delivery.id}>
                      <TD className="font-medium text-brand-700">
                        {delivery.deliveryNumber}
                      </TD>
                      <TD>
                        <span className="block text-slate-900">
                          {delivery.order.customer.user.fullName}
                        </span>
                        <span className="block font-mono text-xs text-slate-400">
                          {delivery.order.orderNumber}
                        </span>
                      </TD>
                      <TD>
                        {delivery.driver ? (
                          delivery.driver.user.fullName
                        ) : (
                          <Badge tone="warning">Unassigned</Badge>
                        )}
                      </TD>
                      <TD numeric>{delivery.bottlesDispatched}</TD>
                      <TD numeric>{formatMoney(delivery.order.total)}</TD>
                      <TD className="whitespace-nowrap text-slate-500">
                        {delivery.scheduledFor
                          ? formatFriendlyDateTime(delivery.scheduledFor)
                          : "Not scheduled"}
                      </TD>
                      <TD>
                        <StatusBadge status={delivery.status} />
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
            <CardTitle>Order pipeline</CardTitle>
            <CardDescription>Work in progress and money owed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-xs font-medium text-slate-500">Open orders</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 tabular-money">
                {formatNumber(summary.orders.open)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Pending through out-for-delivery
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-xs font-medium text-slate-500">
                Orders with money owed
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900 tabular-money">
                {formatNumber(summary.orders.unpaid)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Unpaid or partially paid
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
