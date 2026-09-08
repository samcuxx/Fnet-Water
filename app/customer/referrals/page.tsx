import type { Metadata } from "next";

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
import { requireCustomer } from "@/lib/auth/dal";
import { formatDate } from "@/lib/utils";
import { referralLink } from "@/lib/utils/reference";
import { getCustomerReferrals } from "@/services/customer/account";

export const metadata: Metadata = {
  title: "Referrals",
  description: "Share your code. A referral qualifies after a paid order.",
};

export default async function CustomerReferralsPage() {
  const actor = await requireCustomer();
  const { referralCode, made } = await getCustomerReferrals(actor.customerId);
  const link = referralLink(referralCode);

  return (
    <>
      <PageHeader
        title="Referrals"
        description="Five successful referrals earn one free bottle by default."
      />

      <Card>
        <CardHeader>
          <CardTitle>Your code</CardTitle>
          <CardDescription>
            Share this with friends. It only counts after they pay for an order.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-mono text-xl font-semibold text-brand-700">
            {referralCode}
          </p>
          <p className="break-all text-sm text-slate-500">{link}</p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>People you referred</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {made.length === 0 ? (
            <EmptyState
              icon={Gift}
              title="No referrals yet"
              description="When someone registers with your code they will appear here."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Customer</TH>
                  <TH>Status</TH>
                  <TH>Qualifying order</TH>
                  <TH>Joined</TH>
                </TR>
              </THead>
              <TBody>
                {made.map((row) => (
                  <TR key={row.id}>
                    <TD>{row.referredCustomer.user.fullName}</TD>
                    <TD>
                      <StatusBadge status={row.status} />
                    </TD>
                    <TD className="text-slate-500">
                      {row.qualifyingOrder?.orderNumber ?? "—"}
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
    </>
  );
}
