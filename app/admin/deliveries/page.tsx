import type { Metadata } from "next";

import Link from "next/link";

import { Truck } from "lucide-react";

import { PageHeader } from "@/components/dashboard";
import {
  Badge,
  Card,
  CardContent,
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
import { formatDate, formatNumber } from "@/lib/utils";
import { listDeliveries } from "@/services/admin/deliveries";

export const metadata: Metadata = {
  title: "Deliveries",
  description: "Delivery attempts, assignments and reconciliation.",
};

export default async function AdminDeliveriesPage() {
  await requireAdministrator();
  const deliveries = await listDeliveries();

  return (
    <>
      <PageHeader
        title="Deliveries"
        description={`${formatNumber(deliveries.length)} most recent delivery attempts.`}
      />

      <Card>
        <CardContent className="p-0">
          {deliveries.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="No deliveries yet"
              description="Assigned and completed rounds will appear here."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Delivery</TH>
                  <TH>Customer</TH>
                  <TH>Driver</TH>
                  <TH>Status</TH>
                  <TH numeric>Shortage</TH>
                  <TH>Scheduled</TH>
                </TR>
              </THead>
              <TBody>
                {deliveries.map((delivery) => (
                  <TR key={delivery.id}>
                    <TD>
                      <Link
                        href={`/admin/deliveries/${delivery.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {delivery.deliveryNumber}
                      </Link>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {delivery.order.orderNumber} · attempt{" "}
                        {delivery.attemptNumber}
                      </span>
                    </TD>
                    <TD>
                      {delivery.order.customer.user.fullName}
                      <span className="mt-0.5 block font-mono text-xs text-slate-400">
                        {delivery.order.customer.customerCode}
                      </span>
                    </TD>
                    <TD>
                      {delivery.driver
                        ? delivery.driver.user.fullName
                        : "Unassigned"}
                    </TD>
                    <TD>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={delivery.status} />
                        {delivery.requiresReconciliation && (
                          <Badge tone="warning">Reconcile</Badge>
                        )}
                      </div>
                    </TD>
                    <TD numeric>
                      {formatNumber(delivery.shortageQuantity)}
                    </TD>
                    <TD className="whitespace-nowrap text-slate-500">
                      {formatDate(delivery.scheduledFor)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
