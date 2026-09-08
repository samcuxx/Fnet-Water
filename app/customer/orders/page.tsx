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
import { requireCustomer } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { formatDate, formatNumber } from "@/lib/utils";
import { listCustomerOrders } from "@/services/customer/account";

export const metadata: Metadata = {
  title: "My orders",
  description: "Orders you have placed.",
};

export default async function CustomerOrdersPage() {
  const actor = await requireCustomer();
  const orders = await listCustomerOrders(actor.customerId);

  return (
    <>
      <PageHeader
        title="My orders"
        description={`${formatNumber(orders.length)} orders on your account.`}
        actions={
          <Link href="/customer/order" className={buttonClasses()}>
            Order water
          </Link>
        }
      />

      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No orders yet"
              description="Place your first order and it will show up here with its delivery progress."
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
                {orders.map((order) => (
                  <TR key={order.id}>
                    <TD>
                      <Link
                        href={`/customer/orders/${order.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
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
    </>
  );
}
