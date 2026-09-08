import type { Metadata } from "next";

import Link from "next/link";

import { Package } from "lucide-react";

import { PageHeader } from "@/components/dashboard";
import {
  buttonClasses,
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
import { requireAgent } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { formatDate, formatNumber, humanizeEnum } from "@/lib/utils";
import { listAgentOrders } from "@/services/agent";

export const metadata: Metadata = {
  title: "Orders",
  description: "Orders from customers you onboarded.",
};

export default async function AgentOrdersPage() {
  const actor = await requireAgent();
  const orders = await listAgentOrders(actor.agentId);

  return (
    <>
      <PageHeader
        title="Orders"
        description={`${formatNumber(orders.length)} orders from your customers.`}
        actions={
          <Link href="/agent/orders/new" className={buttonClasses()}>
            Place order
          </Link>
        }
      />

      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No orders yet"
              description="Orders you place for your customers will appear here."
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
                  <TH>Source</TH>
                  <TH>Placed</TH>
                </TR>
              </THead>
              <TBody>
                {orders.map((order) => (
                  <TR key={order.id}>
                    <TD>
                      <Link
                        href={`/agent/orders/${order.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </TD>
                    <TD>
                      {order.customer.user.fullName}
                      <span className="mt-0.5 block font-mono text-xs text-slate-400">
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
                    <TD className="text-slate-500">
                      {humanizeEnum(order.source)}
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
    </>
  );
}
