import type { Metadata } from "next";

import { ClipboardList } from "lucide-react";

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
import { requireCustomer } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { listCustomerDispensers } from "@/services/customer/account";

export const metadata: Metadata = {
  title: "Dispensers",
  description: "Your installed dispensers and payment plans.",
};

export default async function CustomerDispensersPage() {
  const actor = await requireCustomer();
  const dispensers = await listCustomerDispensers(actor.customerId);

  return (
    <>
      <PageHeader
        title="Dispensers"
        description="Physical installation does not transfer ownership by itself."
      />

      <Card>
        <CardContent className="p-0">
          {dispensers.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No dispenser on your account"
              description="Installed units and their installment plans will appear here."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Asset</TH>
                  <TH>Status</TH>
                  <TH>Ownership</TH>
                  <TH>Plan</TH>
                  <TH>Next payment</TH>
                </TR>
              </THead>
              <TBody>
                {dispensers.map((row) => {
                  const plan = row.paymentPlans[0];
                  return (
                    <TR key={row.id}>
                      <TD>
                        {row.assetTag}
                        <span className="mt-0.5 block text-xs text-slate-400">
                          {row.model}
                        </span>
                      </TD>
                      <TD>
                        <StatusBadge status={row.status} />
                      </TD>
                      <TD>
                        <StatusBadge status={row.ownership} />
                      </TD>
                      <TD>
                        {plan ? (
                          <>
                            <StatusBadge status={plan.status} />
                            <span className="mt-1 block text-xs text-slate-400">
                              {formatMoney(plan.outstandingBalance)} outstanding
                            </span>
                          </>
                        ) : (
                          "—"
                        )}
                      </TD>
                      <TD className="whitespace-nowrap text-slate-500">
                        {plan?.nextPaymentDate
                          ? formatDate(plan.nextPaymentDate)
                          : "—"}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
