import type { Metadata } from "next";

import { Gift } from "lucide-react";

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
import { requireAgent } from "@/lib/auth/dal";
import { formatDate } from "@/lib/utils";
import { listAgentReferrals } from "@/services/agent";

export const metadata: Metadata = {
  title: "Referrals",
  description: "Referrals attached to customers you onboarded.",
};

export default async function AgentReferralsPage() {
  const actor = await requireAgent();
  const referrals = await listAgentReferrals(actor.agentId);

  return (
    <>
      <PageHeader
        title="Referrals"
        description="A referral qualifies only after the referred customer pays for an order."
      />

      <Card>
        <CardContent className="p-0">
          {referrals.length === 0 ? (
            <EmptyState
              icon={Gift}
              title="No referrals yet"
              description="Referrals created when you register a customer with a code appear here."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Referrer</TH>
                  <TH>Referred</TH>
                  <TH>Status</TH>
                  <TH>Qualifying order</TH>
                  <TH>When</TH>
                </TR>
              </THead>
              <TBody>
                {referrals.map((row) => (
                  <TR key={row.id}>
                    <TD>{row.referrerCustomer.user.fullName}</TD>
                    <TD>
                      {row.referredCustomer.user.fullName}
                      <span className="mt-0.5 block font-mono text-xs text-slate-400">
                        {row.referredCustomer.customerCode}
                      </span>
                    </TD>
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
