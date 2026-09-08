import type { Metadata } from "next";
import type { ReactNode } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/dashboard";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatusBadge,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { requireAdministrator } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { formatDateTime, formatNumber, humanizeEnum } from "@/lib/utils";
import { getDelivery } from "@/services/admin/deliveries";

export const metadata: Metadata = {
  title: "Delivery",
  description: "Exchange record, assignment and status history.",
};

export default async function AdminDeliveryDetailPage(
  props: PageProps<"/admin/deliveries/[id]">,
) {
  await requireAdministrator();
  const { id } = await props.params;
  const delivery = await getDelivery(id);

  if (!delivery) notFound();

  return (
    <>
      <PageHeader
        title={delivery.deliveryNumber}
        description={`${delivery.order.customer.user.fullName} · ${delivery.order.orderNumber}`}
        actions={
          delivery.requiresReconciliation ? (
            <Badge tone="warning">Needs reconciliation</Badge>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Status">
              <StatusBadge status={delivery.status} />
            </Row>
            <Row label="Attempt">{delivery.attemptNumber}</Row>
            <Row label="Order">
              <Link
                href={`/admin/orders/${delivery.order.id}`}
                className="text-brand-600 hover:underline"
              >
                {delivery.order.orderNumber}
              </Link>
            </Row>
            <Row label="Customer">
              <Link
                href={`/admin/customers/${delivery.order.customer.id}`}
                className="text-brand-600 hover:underline"
              >
                {delivery.order.customer.user.fullName}
              </Link>
            </Row>
            <Row label="Driver">
              {delivery.driver ? delivery.driver.user.fullName : "Unassigned"}
            </Row>
            <Row label="Scheduled">
              {formatDateTime(delivery.scheduledFor)}
            </Row>
            <Row label="Completed">
              {formatDateTime(delivery.completedAt)}
            </Row>
            <Row label="Failure">
              {delivery.failureReason
                ? humanizeEnum(delivery.failureReason)
                : "—"}
            </Row>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bottle exchange</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <Row label="Dispatched">
              {formatNumber(delivery.bottlesDispatched)}
            </Row>
            <Row label="Delivered">
              {formatNumber(delivery.bottlesDelivered)}
            </Row>
            <Row label="Empties expected">
              {formatNumber(delivery.emptyBottlesExpected)}
            </Row>
            <Row label="Empties collected">
              {formatNumber(delivery.emptyBottlesCollected)}
            </Row>
            <Row label="Damaged returned">
              {formatNumber(delivery.damagedBottlesReturned)}
            </Row>
            <Row label="Shortage">
              {formatNumber(delivery.shortageQuantity)}
            </Row>
            <Row label="Cash collected">
              {delivery.cashCollected != null
                ? formatMoney(delivery.cashCollected)
                : "—"}
            </Row>
            <Row label="Reconciled by">
              {delivery.reconciledByUser?.fullName ?? "—"}
            </Row>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Status history</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>When</TH>
                <TH>From</TH>
                <TH>To</TH>
                <TH>By</TH>
                <TH>Reason</TH>
              </TR>
            </THead>
            <TBody>
              {delivery.statusHistory.map((entry) => (
                <TR key={entry.id}>
                  <TD className="whitespace-nowrap text-slate-500">
                    {formatDateTime(entry.createdAt)}
                  </TD>
                  <TD>
                    {entry.fromStatus ? (
                      <StatusBadge status={entry.fromStatus} />
                    ) : (
                      "—"
                    )}
                  </TD>
                  <TD>
                    <StatusBadge status={entry.toStatus} />
                  </TD>
                  <TD>{entry.changedByUser?.fullName ?? "System"}</TD>
                  <TD className="text-slate-500">{entry.reason ?? "—"}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right text-slate-900">{children}</dd>
    </div>
  );
}
