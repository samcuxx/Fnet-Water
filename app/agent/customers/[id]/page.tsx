import type { Metadata } from "next";
import type { ReactNode } from "react";

import Link from "next/link";

import { PageHeader } from "@/components/dashboard";
import {
  buttonClasses,
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
import { formatDate, formatNumber } from "@/lib/utils";
import { getAgentCustomer } from "@/services/agent";

export const metadata: Metadata = {
  title: "Customer",
  description: "A customer you onboarded.",
};

export default async function AgentCustomerDetailPage(
  props: PageProps<"/agent/customers/[id]">,
) {
  const actor = await requireAgent();
  const { id } = await props.params;
  const customer = await getAgentCustomer(actor.agentId, id);

  return (
    <>
      <PageHeader
        title={customer.user.fullName}
        description={`${customer.customerCode} · ${customer.user.phone}`}
        actions={
          <Link
            href={`/agent/orders/new?customerId=${customer.id}`}
            className={buttonClasses()}
          >
            Place order
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Status">
              <StatusBadge status={customer.user.status} />
            </Row>
            <Row label="Email">{customer.user.email}</Row>
            <Row label="Referral">
              <span className="font-mono">{customer.referralCode}</span>
            </Row>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bottles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Held">
              {formatNumber(customer.bottleBalance?.bottlesHeld ?? 0)}
            </Row>
            <Row label="Shortage">
              {formatNumber(customer.bottleBalance?.outstandingShortage ?? 0)}
            </Row>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rewards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Available">
              {formatNumber(customer.rewardBalance?.available ?? 0)}
            </Row>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Order</TH>
                <TH numeric>Total</TH>
                <TH>Status</TH>
                <TH>Placed</TH>
              </TR>
            </THead>
            <TBody>
              {customer.orders.map((order) => (
                <TR key={order.id}>
                  <TD>
                    <Link
                      href={`/agent/orders/${order.id}`}
                      className="font-medium text-brand-600 hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </TD>
                  <TD numeric>{formatMoney(order.total)}</TD>
                  <TD>
                    <StatusBadge status={order.status} />
                  </TD>
                  <TD className="whitespace-nowrap text-slate-500">
                    {formatDate(order.createdAt)}
                  </TD>
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
