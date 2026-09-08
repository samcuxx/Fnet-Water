import type { Metadata } from "next";

import { Banknote, Truck, Users } from "lucide-react";

import { PageHeader, StatCard } from "@/components/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { formatNumber, humanizeEnum } from "@/lib/utils";
import { getAdminReports } from "@/services/admin/reports";

export const metadata: Metadata = {
  title: "Reports",
  description: "Operational and financial totals derived from committed records.",
};

export default async function ManagerReportsPage() {
  await requireManager();
  const report = await getAdminReports();

  return (
    <>
      <PageHeader
        title="Reports"
        description="Figures are summed from orders, deliveries and the payment ledger."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Net revenue"
          value={formatMoney(report.revenue)}
          icon={Banknote}
          tone="success"
        />
        <StatCard
          label="Outstanding"
          value={formatMoney(report.outstanding)}
          icon={Banknote}
          tone="warning"
        />
        <StatCard
          label="Delivered rounds"
          value={formatNumber(report.delivered)}
          icon={Truck}
          tone="aqua"
        />
        <StatCard
          label="Customers"
          value={formatNumber(report.customers)}
          icon={Users}
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Orders by status</CardTitle>
            <CardDescription>Count and invoiced value.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Status</TH>
                  <TH numeric>Orders</TH>
                  <TH numeric>Value</TH>
                </TR>
              </THead>
              <TBody>
                {report.ordersByStatus.map((row) => (
                  <TR key={row.status}>
                    <TD>
                      <StatusBadge status={row.status} />
                    </TD>
                    <TD numeric>{formatNumber(row.count)}</TD>
                    <TD numeric>{formatMoney(row.total)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Successful payments by method</CardTitle>
            <CardDescription>
              {formatNumber(report.agents)} agents · {formatNumber(report.drivers)}{" "}
              drivers · {formatNumber(report.failedDeliveries)} deliveries awaiting
              reconciliation
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Method</TH>
                  <TH numeric>Count</TH>
                  <TH numeric>Total</TH>
                </TR>
              </THead>
              <TBody>
                {report.paymentsByMethod.map((row) => (
                  <TR key={row.method}>
                    <TD>{humanizeEnum(row.method)}</TD>
                    <TD numeric>{formatNumber(row.count)}</TD>
                    <TD numeric>{formatMoney(row.total)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
