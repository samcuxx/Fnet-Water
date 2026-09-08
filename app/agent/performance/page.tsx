import type { Metadata } from "next";

import { Banknote, Gift, Package, Users } from "lucide-react";

import { PageHeader, StatCard } from "@/components/dashboard";
import { requireAgent } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { formatNumber, formatPercent } from "@/lib/utils";
import { getAgentPerformance } from "@/services/agent";
import { getAgentSummary } from "@/services/dashboard";

export const metadata: Metadata = {
  title: "Performance",
  description: "Your book, orders generated and referral progress.",
};

export default async function AgentPerformancePage() {
  const actor = await requireAgent();
  const [summary, performance] = await Promise.all([
    getAgentSummary(actor.agentId, actor.userId),
    getAgentPerformance(actor.agentId),
  ]);

  return (
    <>
      <PageHeader
        title="Performance"
        description="Indicative figures until finance settles commission."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Customers onboarded"
          value={formatNumber(performance.customers)}
          icon={Users}
        />
        <StatCard
          label="Orders placed"
          value={formatNumber(performance.ordersPlaced)}
          icon={Package}
          tone="aqua"
          hint={formatMoney(performance.orderValue)}
        />
        <StatCard
          label="Referrals qualified"
          value={formatNumber(performance.referralsQualified)}
          icon={Gift}
          tone="success"
          hint={`${formatNumber(performance.referralsPending)} pending`}
        />
        <StatCard
          label="Indicative commission"
          value={formatMoney(summary.indicativeCommission)}
          icon={Banknote}
          tone="brand"
          hint={`At ${formatPercent(Number(summary.commissionRate))}`}
        />
      </section>
    </>
  );
}
