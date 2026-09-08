import type { Metadata } from "next";

import Link from "next/link";

import { Droplets } from "lucide-react";

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
import { requireManager } from "@/lib/auth/dal";
import { formatDateTime, formatNumber } from "@/lib/utils";
import { listBottleBalances, listBottleLedger } from "@/services/admin/bottles";

export const metadata: Metadata = {
  title: "Bottles",
  description: "Customer bottle balances and the shortage ledger.",
};

export default async function ManagerBottlesPage() {
  await requireManager();
  const [balances, ledger] = await Promise.all([
    listBottleBalances(),
    listBottleLedger(),
  ]);

  const outstanding = balances.reduce(
    (total, row) => total + row.outstandingShortage,
    0,
  );

  return (
    <>
      <PageHeader
        title="Bottles"
        description={`${formatNumber(outstanding)} bottles outstanding across ${formatNumber(balances.filter((row) => row.outstandingShortage > 0).length)} customers.`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Customer balances</CardTitle>
          <CardDescription>
            Materialized from the append-only bottle ledger.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {balances.length === 0 ? (
            <EmptyState
              icon={Droplets}
              title="No balances yet"
              description="Balances appear after the first refillable delivery."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Customer</TH>
                  <TH numeric>Held</TH>
                  <TH numeric>Shortage</TH>
                  <TH numeric>Lifetime returned</TH>
                  <TH>Updated</TH>
                </TR>
              </THead>
              <TBody>
                {balances.map((row) => (
                  <TR key={row.id}>
                    <TD>
                      <Link
                        href={`/manager/customers/${row.customer.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {row.customer.user.fullName}
                      </Link>
                      <span className="mt-0.5 block font-mono text-xs text-slate-400">
                        {row.customer.customerCode}
                      </span>
                    </TD>
                    <TD numeric>{formatNumber(row.bottlesHeld)}</TD>
                    <TD numeric>
                      {formatNumber(row.outstandingShortage)}
                    </TD>
                    <TD numeric>{formatNumber(row.lifetimeReturned)}</TD>
                    <TD className="whitespace-nowrap text-slate-500">
                      {formatDateTime(row.updatedAt)}
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
          <CardTitle>Recent ledger</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>When</TH>
                <TH>Customer</TH>
                <TH>Type</TH>
                <TH numeric>Qty</TH>
                <TH>By</TH>
              </TR>
            </THead>
            <TBody>
              {ledger.map((entry) => (
                <TR key={entry.id}>
                  <TD className="whitespace-nowrap text-slate-500">
                    {formatDateTime(entry.createdAt)}
                  </TD>
                  <TD>{entry.customer.user.fullName}</TD>
                  <TD>
                    <StatusBadge status={entry.entryType} />
                  </TD>
                  <TD numeric>{entry.quantity}</TD>
                  <TD>{entry.performedByUser?.fullName ?? "System"}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
