import type { Metadata } from "next";
import type { ReactNode } from "react";

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
import { requireAgent } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { formatDate, formatNumber, humanizeEnum } from "@/lib/utils";
import { getAgentOrder } from "@/services/agent";

export const metadata: Metadata = {
  title: "Order",
  description: "Order placed for one of your customers.",
};

export default async function AgentOrderDetailPage(
  props: PageProps<"/agent/orders/[id]">,
) {
  const actor = await requireAgent();
  const { id } = await props.params;
  const order = await getAgentOrder(actor.agentId, id);

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
            <Row label="Total">{formatMoney(order.total)}</Row>
            <Row label="Expected empties">
              {formatNumber(order.expectedEmptyBottles)}
            </Row>
            <Row label="Scheduled">{formatDate(order.scheduledFor)}</Row>
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
                    <TD>{item.productName}</TD>
                    <TD numeric>{item.quantity}</TD>
                    <TD numeric>{formatMoney(item.lineTotal)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </div>
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
