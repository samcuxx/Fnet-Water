import type { Metadata } from "next";

import { UserCheck } from "lucide-react";

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
import { requireAdministrator } from "@/lib/auth/dal";
import { formatNumber, formatPercent } from "@/lib/utils";
import { listAgents } from "@/services/admin/agents";

export const metadata: Metadata = {
  title: "Agents",
  description: "Field agents, commission rates and registered customers.",
};

export default async function AdminAgentsPage() {
  await requireAdministrator();
  const agents = await listAgents();

  return (
    <>
      <PageHeader
        title="Agents"
        description={`${formatNumber(agents.length)} agent profiles.`}
      />

      <Card>
        <CardContent className="p-0">
          {agents.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title="No agents"
              description="Agent accounts created by an administrator will appear here."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Agent</TH>
                  <TH>Region</TH>
                  <TH>Commission</TH>
                  <TH>Status</TH>
                  <TH numeric>Customers</TH>
                  <TH numeric>Referrals</TH>
                </TR>
              </THead>
              <TBody>
                {agents.map((agent) => (
                  <TR key={agent.id}>
                    <TD>
                      {agent.user.fullName}
                      <span className="mt-0.5 block font-mono text-xs text-slate-400">
                        {agent.agentCode}
                      </span>
                    </TD>
                    <TD>{agent.region ?? "—"}</TD>
                    <TD>{formatPercent(Number(agent.commissionRate))}</TD>
                    <TD>
                      <StatusBadge status={agent.user.status} />
                    </TD>
                    <TD numeric>
                      {formatNumber(agent._count.registeredCustomers)}
                    </TD>
                    <TD numeric>{formatNumber(agent._count.referrals)}</TD>
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
