import type { Metadata } from "next";

import Link from "next/link";

import { Gift } from "lucide-react";

import { PageHeader } from "@/components/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
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
import { requireAdministrator } from "@/lib/auth/dal";
import { formatDate, formatNumber } from "@/lib/utils";
import { listReferrals, listRewardBalances } from "@/services/admin/referrals";

export const metadata: Metadata = {
  title: "Referrals & Rewards",
  description: "Referral qualification and reward balances.",
};

export default async function AdminReferralsPage() {
  await requireAdministrator();
  const [referrals, rewards] = await Promise.all([
    listReferrals(),
    listRewardBalances(),
  ]);

  return (
    <>
      <PageHeader
        title="Referrals & Rewards"
        description={`${formatNumber(referrals.length)} referral records. A customer counts once, permanently.`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Referrals</CardTitle>
          <CardDescription>
            Qualification waits for registration, a qualifying order and full payment.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {referrals.length === 0 ? (
            <EmptyState
              icon={Gift}
              title="No referrals yet"
              description="Referral links used at registration will appear here."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Referrer</TH>
                  <TH>Referred</TH>
                  <TH>Code</TH>
                  <TH>Status</TH>
                  <TH>Order</TH>
                  <TH>Date</TH>
                </TR>
              </THead>
              <TBody>
                {referrals.map((row) => (
                  <TR key={row.id}>
                    <TD>
                      <Link
                        href={`/admin/customers/${row.referrerCustomer.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {row.referrerCustomer.user.fullName}
                      </Link>
                    </TD>
                    <TD>
                      <Link
                        href={`/admin/customers/${row.referredCustomer.id}`}
                        className="text-brand-600 hover:underline"
                      >
                        {row.referredCustomer.user.fullName}
                      </Link>
                    </TD>
                    <TD className="font-mono text-xs">{row.code}</TD>
                    <TD>
                      <StatusBadge status={row.status} />
                    </TD>
                    <TD>
                      {row.qualifyingOrder ? (
                        <Link
                          href={`/admin/orders/${row.qualifyingOrder.id}`}
                          className="text-brand-600 hover:underline"
                        >
                          {row.qualifyingOrder.orderNumber}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TD>
                    <TD className="whitespace-nowrap text-slate-500">
                      {formatDate(row.createdAt)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Reward balances</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Customer</TH>
                <TH numeric>Earned</TH>
                <TH numeric>Redeemed</TH>
                <TH numeric>Available</TH>
              </TR>
            </THead>
            <TBody>
              {rewards.map((row) => (
                <TR key={row.id}>
                  <TD>
                    <Link
                      href={`/admin/customers/${row.customer.id}`}
                      className="font-medium text-brand-600 hover:underline"
                    >
                      {row.customer.user.fullName}
                    </Link>
                  </TD>
                  <TD numeric>{formatNumber(row.earned)}</TD>
                  <TD numeric>{formatNumber(row.redeemed)}</TD>
                  <TD numeric>{formatNumber(row.available)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
