import type { Metadata } from "next";

import {
  Banknote,
  CircleCheck,
  ClipboardList,
  Droplets,
  MapPin,
  Phone,
  TriangleAlert,
  Truck,
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
} from "@/components/ui";
import { requireDriver } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { formatFriendlyDateTime, formatNumber, humanizeEnum } from "@/lib/utils";
import { getDriverSummary } from "@/services/dashboard";

export const metadata: Metadata = {
  title: "Today's round",
  description: "Your assigned deliveries, bottles on hand and cash collected.",
};

export default async function DriverDashboardPage() {
  const actor = await requireDriver();
  const summary = await getDriverSummary(actor.driverId);

  return (
    <>
      <PageHeader
        title="Today's round"
        description="Everything assigned to you, soonest first."
      />

      {/* Two columns on a phone: four tiles stay readable without scrolling past them. */}
      <section aria-label="My day" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Assigned"
          value={formatNumber(summary.assigned)}
          icon={ClipboardList}
        />
        <StatCard
          label="Out for delivery"
          value={formatNumber(summary.outForDelivery)}
          icon={Truck}
          tone="aqua"
        />
        <StatCard
          label="Completed today"
          value={formatNumber(summary.completedToday)}
          icon={CircleCheck}
          tone="success"
        />
        <StatCard
          label="Cash collected"
          value={formatMoney(summary.cashCollectedToday)}
          icon={Banknote}
          tone="brand"
          hint="Today, awaiting reconciliation"
        />
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <Droplets className="size-5 shrink-0 text-brand-600" aria-hidden />
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">
              {formatNumber(summary.bottlesOnHand)}
            </span>{" "}
            bottles currently on your vehicle
          </p>
        </div>

        {summary.failedToday > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3">
            <TriangleAlert className="size-5 shrink-0 text-danger-600" aria-hidden />
            <p className="text-sm text-danger-700">
              <span className="font-semibold">
                {formatNumber(summary.failedToday)}
              </span>{" "}
              failed {summary.failedToday === 1 ? "delivery" : "deliveries"} today
              — stock must be returned to the warehouse.
            </p>
          </div>
        )}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>My deliveries</CardTitle>
          <CardDescription>
            Open the delivery to record bottles exchanged and any cash collected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary.todaysDeliveries.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="Nothing assigned right now"
              description="When a manager assigns you a delivery it will appear here straight away."
            />
          ) : (
            /* Cards rather than a table: a delivery is read one at a time on a
               phone, and every field needs to stay legible without scrolling
               sideways. */
            <ul className="space-y-3">
              {summary.todaysDeliveries.map((delivery) => {
                const address = delivery.order.address;
                const customer = delivery.order.customer;

                return (
                  <li
                    key={delivery.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {customer.user.fullName}
                        </p>
                        <p className="font-mono text-xs text-slate-400">
                          {delivery.deliveryNumber} · {delivery.order.orderNumber}
                        </p>
                      </div>
                      <StatusBadge status={delivery.status} />
                    </div>

                    {address && (
                      <p className="mt-3 flex gap-2 text-sm text-slate-600">
                        <MapPin
                          className="mt-0.5 size-4 shrink-0 text-slate-400"
                          aria-hidden
                        />
                        <span>
                          {address.addressLine}, {address.city}
                          {address.landmark && ` — near ${address.landmark}`}
                          {address.ghanaDigitalAddress && (
                            <span className="block font-mono text-xs text-slate-400">
                              {address.ghanaDigitalAddress}
                            </span>
                          )}
                        </span>
                      </p>
                    )}

                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="size-4 shrink-0 text-slate-400" aria-hidden />
                      <a
                        href={`tel:${customer.user.phone}`}
                        className="font-medium text-brand-700 hover:underline"
                      >
                        {customer.user.phone}
                      </a>
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <Badge tone="brand">
                        {formatNumber(delivery.bottlesDispatched)} filled out
                      </Badge>
                      <Badge tone="aqua">
                        {formatNumber(delivery.emptyBottlesExpected)} empties
                        expected
                      </Badge>
                      <Badge tone={delivery.order.paymentStatus === "PAID" ? "success" : "warning"}>
                        {formatMoney(delivery.order.total)} ·{" "}
                        {humanizeEnum(delivery.order.paymentStatus)}
                      </Badge>
                      {delivery.order.instruction !== "NONE" && (
                        <Badge tone="neutral">
                          {humanizeEnum(delivery.order.instruction)}
                        </Badge>
                      )}
                    </div>

                    <p className="mt-3 text-xs text-slate-400">
                      {delivery.scheduledFor
                        ? `Scheduled ${formatFriendlyDateTime(delivery.scheduledFor)}`
                        : "No scheduled time"}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
