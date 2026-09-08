import type { Metadata } from "next";

import Link from "next/link";

import { Gift } from "lucide-react";

import { PageHeader } from "@/components/dashboard";
import {
  buttonClasses,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { formatDateTime, formatNumber } from "@/lib/utils";
import { getCustomerRewards } from "@/services/customer/account";

export const metadata: Metadata = {
  title: "Rewards",
  description: "Referral bottles you can redeem on an order.",
};

export default async function CustomerRewardsPage() {
  const actor = await requireCustomer();
  const { balance, ledger, redemptions } = await getCustomerRewards(
    actor.customerId,
  );

  return (
    <>
      <PageHeader
        title="Rewards"
        description="Redeem a free bottle when you place your next order."
        actions={
          (balance?.available ?? 0) > 0 ? (
            <Link href="/customer/order" className={buttonClasses()}>
              Redeem on an order
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Available</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold tabular-money">
            {formatNumber(balance?.available ?? 0)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Earned</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold tabular-money">
            {formatNumber(balance?.earned ?? 0)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Redeemed</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold tabular-money">
            {formatNumber(balance?.redeemed ?? 0)}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ledger</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {ledger.length === 0 ? (
              <EmptyState
                icon={Gift}
                title="No reward activity"
                description="Rewards appear after enough successful referrals."
              />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>When</TH>
                    <TH>Type</TH>
                    <TH numeric>Qty</TH>
                  </TR>
                </THead>
                <TBody>
                  {ledger.map((entry) => (
                    <TR key={entry.id}>
                      <TD className="whitespace-nowrap text-slate-500">
                        {formatDateTime(entry.createdAt)}
                      </TD>
                      <TD>
                        <StatusBadge status={entry.type} />
                      </TD>
                      <TD numeric>{entry.quantity}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Redemptions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Order</TH>
                  <TH>Product</TH>
                </TR>
              </THead>
              <TBody>
                {redemptions.map((row) => (
                  <TR key={row.id}>
                    <TD>
                      <Link
                        href={`/customer/orders/${row.order.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {row.order.orderNumber}
                      </Link>
                    </TD>
                    <TD>{row.product.name}</TD>
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
