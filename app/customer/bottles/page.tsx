import type { Metadata } from "next";

import { Droplets } from "lucide-react";

import { PageHeader } from "@/components/dashboard";
import {
  Card,
  CardContent,
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
import { formatDateTime, formatNumber } from "@/lib/utils";
import { getCustomerBottles } from "@/services/customer/account";

export const metadata: Metadata = {
  title: "Bottle balance",
  description: "Bottles with you and the shortage ledger.",
};

export default async function CustomerBottlesPage() {
  const actor = await requireCustomer();
  const { balance, ledger } = await getCustomerBottles(actor.customerId);

  return (
    <>
      <PageHeader
        title="Bottle balance"
        description="Outstanding empties should come back on the next delivery."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Held</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold tabular-money">
            {formatNumber(balance?.bottlesHeld ?? 0)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Outstanding</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold tabular-money">
            {formatNumber(balance?.outstandingShortage ?? 0)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Returned</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold tabular-money">
            {formatNumber(balance?.lifetimeReturned ?? 0)}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Ledger</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ledger.length === 0 ? (
            <EmptyState
              icon={Droplets}
              title="No bottle movements yet"
              description="Shortages and returns appear after a refillable delivery."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>When</TH>
                  <TH>Type</TH>
                  <TH numeric>Qty</TH>
                </TR>
              </THead>
              <TBody>
                {ledger.map((entry) => (
                  <TR key={entry.id}>
                    <TD className="whitespace-nowrap text-slate-500">
                      {formatDateTime(entry.createdAt)}
                    </TD>
                    <TD>
                      <StatusBadge status={entry.entryType} />
                    </TD>
                    <TD numeric>{entry.quantity}</TD>
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
