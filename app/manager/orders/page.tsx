import type { Metadata } from "next";

import Link from "next/link";

import { Package } from "lucide-react";

import { PageHeader } from "@/components/dashboard";
import {
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
import { requireManager } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { formatDate, formatNumber, humanizeEnum } from "@/lib/utils";
import { listOrders } from "@/services/admin/orders";

export const metadata: Metadata = {
  title: "Orders",
  description: "Confirm, assign and track water orders.",
};

export default async function ManagerOrdersPage() {
  await requireManager();
  const orders = await listOrders();

  return (
    <>
      <PageHeader
        title="Orders"
        description={`${formatNumber(orders.length)} most recent orders across every channel.`}
      />

      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
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
                  <TH>Source</TH>
                  <TH>Placed</TH>
                </TR>
              </THead>
              <TBody>
                {orders.map((order) => (
                  <TR key={order.id}>
                    <TD>
                      <Link
                        href={`/manager/orders/${order.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
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
