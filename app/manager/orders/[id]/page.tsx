import type { Metadata } from "next";
import type { ReactNode } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
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
import { requireManager } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import {
  formatDate,
  formatDateTime,
  formatNumber,
  humanizeEnum,
} from "@/lib/utils";
import { getOrder } from "@/services/admin/orders";
import { listAvailableDrivers } from "@/services/deliveries/assign";
import { OrderStatus } from "@/lib/generated/prisma/enums";

import { AssignDriverForm } from "../../deliveries/assign-form";

export const metadata: Metadata = {
  title: "Order",
  description: "Order items, status history, deliveries and assignment.",
};

const ASSIGNABLE = new Set<OrderStatus>([
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.FAILED,
]);

export default async function ManagerOrderDetailPage(
  props: PageProps<"/manager/orders/[id]">,
) {
  await requireManager();
  const { id } = await props.params;
  const [order, drivers] = await Promise.all([getOrder(id), listAvailableDrivers()]);

  if (!order) notFound();

  return (
    <>
      <PageHeader
        title={order.orderNumber}
        description={`${order.customer.user.fullName} · ${order.customer.customerCode}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Status">
              <StatusBadge status={order.status} />
            </Row>
            <Row label="Payment">
              <StatusBadge status={order.paymentStatus} />
            </Row>
            <Row label="Source">{humanizeEnum(order.source)}</Row>
            <Row label="Subtotal">{formatMoney(order.subtotal)}</Row>
            <Row label="Delivery fee">{formatMoney(order.deliveryFee)}</Row>
            <Row label="Discount">{formatMoney(order.discountTotal)}</Row>
            <Row label="Total">{formatMoney(order.total)}</Row>
            <Row label="Amount paid">{formatMoney(order.amountPaid)}</Row>
            <Row label="Expected empties">
              {formatNumber(order.expectedEmptyBottles)}
            </Row>
            <Row label="Scheduled">{formatDate(order.scheduledFor)}</Row>
            <Row label="Placed by">
              {order.placedByUser
                ? `${order.placedByUser.fullName} (${humanizeEnum(order.placedByUser.role)})`
                : "—"}
            </Row>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Line items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Product</TH>
                  <TH numeric>Qty</TH>
                  <TH numeric>Unit</TH>
                  <TH numeric>Line</TH>
                </TR>
              </THead>
              <TBody>
                {order.items.map((item) => (
                  <TR key={item.id}>
                    <TD>
                      {item.productName}
                      {item.isRewardItem ? (
                        <span className="ml-2 text-xs text-slate-400">
                          Reward
                        </span>
                      ) : null}
                    </TD>
                    <TD numeric>{item.quantity}</TD>
                    <TD numeric>{formatMoney(item.unitPrice)}</TD>
                    <TD numeric>{formatMoney(item.lineTotal)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {ASSIGNABLE.has(order.status) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Assign a driver</CardTitle>
            <CardDescription>
              Loads filled bottles onto the driver and moves the order to assigned.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AssignDriverForm
              orderId={order.id}
              drivers={drivers}
              defaultScheduled={order.scheduledFor?.toISOString().slice(0, 16)}
            />
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deliveries</CardTitle>
            <CardDescription>Attempts against this order.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Delivery</TH>
                  <TH>Driver</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {order.deliveries.map((delivery) => (
                  <TR key={delivery.id}>
                    <TD>
                      <Link
                        href={`/manager/deliveries/${delivery.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {delivery.deliveryNumber}
                      </Link>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        Attempt {delivery.attemptNumber}
                      </span>
                    </TD>
                    <TD>
                      {delivery.driver
                        ? delivery.driver.user.fullName
                        : "Unassigned"}
                    </TD>
                    <TD>
                      <StatusBadge status={delivery.status} />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Reference</TH>
                  <TH>Method</TH>
                  <TH numeric>Amount</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {order.payments.map((payment) => (
                  <TR key={payment.id}>
                    <TD className="font-mono text-xs">{payment.reference}</TD>
                    <TD>{humanizeEnum(payment.method)}</TD>
                    <TD numeric>{formatMoney(payment.amount)}</TD>
                    <TD>
                      <StatusBadge status={payment.status} />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
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
              {order.statusHistory.map((entry) => (
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
