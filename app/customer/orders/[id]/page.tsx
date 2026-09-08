import type { Metadata } from "next";
import type { ReactNode } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/dashboard";
import {
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
import { requireCustomer } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { SETTING_KEYS, getStringArraySetting } from "@/lib/settings";
import { formatDate, formatNumber, humanizeEnum } from "@/lib/utils";
import { getCustomerOrder } from "@/services/customer/account";

import { CancelOrderForm } from "../cancel-form";

export const metadata: Metadata = {
  title: "Order",
  description: "Your order, items and delivery attempts.",
};

export default async function CustomerOrderDetailPage(
  props: PageProps<"/customer/orders/[id]">,
) {
  const actor = await requireCustomer();
  const { id } = await props.params;
  const [order, cancellable] = await Promise.all([
    getCustomerOrder(actor.customerId, id),
    getStringArraySetting(SETTING_KEYS.orderCancellationAllowedStatuses),
  ]);

  if (!order) notFound();

  return (
    <>
      <PageHeader
        title={order.orderNumber}
        description={`${humanizeEnum(order.source)} · ${formatDate(order.createdAt)}`}
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
            <Row label="Total">{formatMoney(order.total)}</Row>
            <Row label="Paid">{formatMoney(order.amountPaid)}</Row>
            <Row label="Empties expected">
              {formatNumber(order.expectedEmptyBottles)}
            </Row>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Product</TH>
                  <TH numeric>Qty</TH>
                  <TH numeric>Line</TH>
                </TR>
              </THead>
              <TBody>
                {order.items.map((item) => (
                  <TR key={item.id}>
                    <TD>
                      {item.productName}
                      {item.isRewardItem ? (
                        <span className="ml-2 text-xs text-slate-400">Reward</span>
                      ) : null}
                    </TD>
                    <TD numeric>{item.quantity}</TD>
                    <TD numeric>{formatMoney(item.lineTotal)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Deliveries</CardTitle>
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
                      href={`/customer/deliveries/${delivery.id}`}
                      className="font-medium text-brand-600 hover:underline"
                    >
                      {delivery.deliveryNumber}
                    </Link>
                  </TD>
                  <TD>
                    {delivery.driver ? delivery.driver.user.fullName : "Unassigned"}
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

      {cancellable.includes(order.status) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Cancel this order</CardTitle>
          </CardHeader>
          <CardContent>
            <CancelOrderForm orderId={order.id} />
          </CardContent>
        </Card>
      )}
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
