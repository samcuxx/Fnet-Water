import type { Metadata } from "next";

import { Banknote, Gift, Package, UserPlus, Users } from "lucide-react";

import { PageHeader, StatCard } from "@/components/dashboard";
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
import { requireAgent } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { formatDate, formatNumber, formatPercent } from "@/lib/utils";
import { getAgentSummary } from "@/services/dashboard";

export const metadata: Metadata = {
  title: "My performance",
  description: "Customers onboarded, orders generated and referral progress.",
};

export default async function AgentDashboardPage() {
  const actor = await requireAgent();
  const summary = await getAgentSummary(actor.agentId, actor.userId);

  return (
    <>
      <PageHeader
        title={`Welcome, ${actor.fullName.split(" ")[0]}`}
        description="Your customers, the orders you generated and how your referrals are progressing."
      />

      <section
        aria-label="My figures"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Customers onboarded"
          value={formatNumber(summary.registeredCustomers)}
          icon={Users}
        />
        <StatCard
          label="Orders placed"
          value={formatNumber(summary.ordersPlaced)}
          icon={Package}
          tone="aqua"
          hint={`${formatMoney(summary.totalOrderValue)} in value`}
        />
        <StatCard
          label="Referrals qualified"
          value={formatNumber(summary.referralsQualified)}
          icon={Gift}
          tone="success"
          hint={`${formatNumber(summary.referralsPending)} awaiting a paid order`}
        />
        <StatCard
          label="Indicative commission"
          value={formatMoney(summary.indicativeCommission)}
          icon={Banknote}
          tone="brand"
          hint={`At ${formatPercent(Number(summary.commissionRate))}`}
        />
      </section>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Customers I onboarded</CardTitle>
          <CardDescription>
            Most recent first. Commission figures are indicative until finance
            settles them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary.recentCustomers.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="No customers yet"
              description="Customers you register will appear here, along with the orders they place."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Customer</TH>
                  <TH>Code</TH>
                  <TH>Phone</TH>
                  <TH numeric>Orders</TH>
                  <TH>Account</TH>
                  <TH>Joined</TH>
                </TR>
              </THead>
              <TBody>
                {summary.recentCustomers.map((customer) => (
                  <TR key={customer.id}>
                    <TD className="font-medium text-slate-900">
                      {customer.user.fullName}
                    </TD>
                    <TD className="font-mono text-xs text-slate-500">
                      {customer.customerCode}
                    </TD>
                    <TD className="text-slate-600">{customer.user.phone}</TD>
                    <TD numeric>{customer._count.orders}</TD>
                    <TD>
                      <StatusBadge status={customer.user.status} />
                    </TD>
                    <TD className="whitespace-nowrap text-slate-500">
                      {formatDate(customer.createdAt)}
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
