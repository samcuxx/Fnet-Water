import type { Metadata } from "next";

import Link from "next/link";

import { Receipt } from "lucide-react";

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
import { requireManager } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { formatDate, formatNumber } from "@/lib/utils";
import {
  listInstallmentPlans,
  listOverdueInstallments,
} from "@/services/manager/installments";

export const metadata: Metadata = {
  title: "Installments",
  description: "Dispenser payment plans and overdue collections.",
};

export default async function ManagerInstallmentsPage() {
  await requireManager();
  const [plans, overdue] = await Promise.all([
    listInstallmentPlans(),
    listOverdueInstallments(),
  ]);

  const outstanding = plans.reduce(
    (total, plan) => total + Number(plan.outstandingBalance),
    0,
  );

  return (
    <>
      <PageHeader
        title="Installments"
        description="Every dispenser plan, with overdue rows surfaced first."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Open plans"
          value={formatNumber(plans.length)}
          icon={Receipt}
        />
        <StatCard
          label="Overdue installments"
          value={formatNumber(overdue.length)}
          icon={Receipt}
          tone={overdue.length > 0 ? "danger" : "success"}
        />
        <StatCard
          label="Outstanding"
          value={formatMoney(outstanding)}
          icon={Receipt}
          tone="warning"
        />
      </section>

      {overdue.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Overdue</CardTitle>
            <CardDescription>
              Past due plus the configured grace period. Plans are never deleted.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Customer</TH>
                  <TH>Plan</TH>
                  <TH>Due</TH>
                  <TH numeric>Amount</TH>
                  <TH>Days late</TH>
                </TR>
              </THead>
              <TBody>
                {overdue.map((row) => (
                  <TR key={row.id}>
                    <TD>
                      <Link
                        href={`/manager/customers/${row.plan.customer.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {row.plan.customer.user.fullName}
                      </Link>
                    </TD>
                    <TD>
                      <span className="font-mono text-xs">
                        {row.plan.planNumber}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {row.plan.dispenser.assetTag} · {row.plan.dispenser.model}
                      </span>
                    </TD>
                    <TD>{formatDate(row.dueDate)}</TD>
                    <TD numeric>{formatMoney(row.amountDue)}</TD>
                    <TD>
                      <StatusBadge status={row.status} />
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {formatNumber(row.overdueDays)} days
                      </span>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All plans</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {plans.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No installment plans"
              description="Plans appear when a dispenser is sold on installment."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Plan</TH>
                  <TH>Customer</TH>
                  <TH>Status</TH>
                  <TH numeric>Outstanding</TH>
                  <TH>Next payment</TH>
                </TR>
              </THead>
              <TBody>
                {plans.map((plan) => (
                  <TR key={plan.id}>
                    <TD>
                      <Link
                        href={`/manager/dispensers/${plan.dispenser.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {plan.planNumber}
                      </Link>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {plan.dispenser.assetTag}
                      </span>
                    </TD>
                    <TD>
                      <Link
                        href={`/manager/customers/${plan.customer.id}`}
                        className="text-brand-600 hover:underline"
                      >
                        {plan.customer.user.fullName}
                      </Link>
                    </TD>
                    <TD>
                      <StatusBadge status={plan.status} />
                    </TD>
                    <TD numeric>{formatMoney(plan.outstandingBalance)}</TD>
                    <TD className="whitespace-nowrap text-slate-500">
                      {formatDate(plan.nextPaymentDate)}
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
