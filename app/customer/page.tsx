import type { Metadata } from "next";

import {
  CalendarClock,
  Droplets,
  Gift,
  Package,
  Receipt,
  TriangleAlert,
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
import { requireCustomer } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { formatDate, formatFriendlyDateTime, formatNumber, pluralize } from "@/lib/utils";
import { getCustomerSummary } from "@/services/dashboard";

export const metadata: Metadata = {
  title: "My account",
  description: "Your orders, deliveries, bottle balance and rewards.",
};

export default async function CustomerDashboardPage() {
  const actor = await requireCustomer();
  const summary = await getCustomerSummary(actor.customerId);

  return (
    <>
      <PageHeader
        title={`Hello, ${actor.fullName.split(" ")[0]}`}
        description="Your active orders, bottle balance, dispenser payments and rewards."
      />

      {summary.bottleShortage > 0 && (
        <div className="mb-5 flex gap-3 rounded-xl border border-warning-100 bg-warning-50 px-4 py-3">
          <TriangleAlert
            className="mt-0.5 size-5 shrink-0 text-warning-600"
            aria-hidden
          />
          <div className="text-sm text-warning-700">
            <p className="font-semibold">
              {formatNumber(summary.bottleShortage)}{" "}
              {pluralize(summary.bottleShortage, "bottle")} outstanding
            </p>
            <p className="mt-0.5">
              Please hand these empties back on your next delivery to avoid a
              bottle charge.
            </p>
          </div>
        </div>
      )}

      <section
        aria-label="My account at a glance"
        className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
      >
        <StatCard
          label="Active orders"
          value={formatNumber(summary.activeOrders)}
          icon={Package}
        />
        <StatCard
          label="Bottles with me"
          value={formatNumber(summary.bottlesHeld)}
          icon={Droplets}
          tone="aqua"
          hint={`${formatNumber(summary.bottlesReturned)} returned to date`}
        />
        <StatCard
          label="Rewards available"
          value={formatNumber(summary.rewardsAvailable)}
          icon={Gift}
          tone="success"
          hint={`${formatNumber(summary.rewardsEarned)} earned in total`}
        />
        <StatCard
          label="Amount due"
          value={formatMoney(summary.orderAmountDue)}
          icon={Receipt}
          tone="warning"
          hint="On unpaid orders"
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>Your five most recent orders.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.recentOrders.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No orders yet"
                description="Once you place your first order it will show up here with its delivery progress."
              />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Order</TH>
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Next delivery</CardTitle>
            </CardHeader>
            <CardContent>
              {summary.nextDelivery ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-slate-400">
                      {summary.nextDelivery.deliveryNumber}
                    </span>
                    <StatusBadge status={summary.nextDelivery.status} />
                  </div>

                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarClock className="size-4 text-slate-400" aria-hidden />
                    {summary.nextDelivery.scheduledFor
                      ? formatFriendlyDateTime(summary.nextDelivery.scheduledFor)
                      : "Awaiting a scheduled slot"}
                  </p>

                  {summary.nextDelivery.driver && (
                    <p className="text-sm text-slate-600">
                      Driver: {summary.nextDelivery.driver.user.fullName}
                    </p>
                  )}

                  {summary.nextDelivery.emptyBottlesExpected > 0 && (
                    <Badge tone="aqua">
                      Have {formatNumber(summary.nextDelivery.emptyBottlesExpected)}{" "}
                      {pluralize(summary.nextDelivery.emptyBottlesExpected, "empty")}{" "}
                      ready
                    </Badge>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={CalendarClock}
                  title="No delivery scheduled"
                  description="Place an order and we will schedule your delivery."
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dispenser payments</CardTitle>
              <CardDescription>
                {summary.installmentPlans.length === 0
                  ? "No active payment plan."
                  : `${formatMoney(summary.dispenserOutstanding)} outstanding.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summary.installmentPlans.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No payment plan"
                  description="Dispenser installment plans appear here once one is set up for you."
                />
              ) : (
                <ul className="space-y-3">
                  {summary.installmentPlans.map((plan) => (
                    <li
                      key={plan.id}
                      className="rounded-xl border border-slate-200 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {plan.dispenser.model}
                          </p>
                          <p className="font-mono text-xs text-slate-400">
                            {plan.dispenser.assetTag}
                          </p>
                        </div>
                        <StatusBadge status={plan.status} />
                      </div>

                      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <dt className="text-slate-500">Outstanding</dt>
                          <dd className="font-semibold text-slate-900 tabular-money">
                            {formatMoney(plan.outstandingBalance)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">Next payment</dt>
                          <dd className="font-semibold text-slate-900">
                            {plan.nextPaymentDate
                              ? formatDate(plan.nextPaymentDate)
                              : "—"}
                          </dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
