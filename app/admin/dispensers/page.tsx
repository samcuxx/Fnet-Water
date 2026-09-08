import type { Metadata } from "next";

import Link from "next/link";

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
import { requireAdministrator } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { formatNumber } from "@/lib/utils";
import { listDispensers } from "@/services/admin/dispensers";

export const metadata: Metadata = {
  title: "Dispensers",
  description: "Dispenser assets, ownership and installment plans.",
};

export default async function AdminDispensersPage() {
  await requireAdministrator();
  const dispensers = await listDispensers();

  return (
    <>
      <PageHeader
        title="Dispensers"
        description={`${formatNumber(dispensers.length)} assets on the register.`}
      />

      <Card>
        <CardContent className="p-0">
          {dispensers.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No dispensers"
              description="Assets added to the register will appear here."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Asset</TH>
                  <TH>Customer</TH>
                  <TH>Status</TH>
                  <TH>Ownership</TH>
                  <TH>Plan</TH>
                </TR>
              </THead>
              <TBody>
                {dispensers.map((row) => {
                  const plan = row.paymentPlans[0];

                  return (
                    <TR key={row.id}>
                      <TD>
                        <Link
                          href={`/admin/dispensers/${row.id}`}
                          className="font-medium text-brand-600 hover:underline"
                        >
                          {row.assetTag}
                        </Link>
                        <span className="mt-0.5 block text-xs text-slate-400">
                          {row.model} · {row.serialNumber}
                        </span>
                      </TD>
                      <TD>
                        {row.customer ? (
                          <Link
                            href={`/admin/customers/${row.customer.id}`}
                            className="text-brand-600 hover:underline"
                          >
                            {row.customer.user.fullName}
                          </Link>
                        ) : (
                          "Unassigned"
                        )}
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
