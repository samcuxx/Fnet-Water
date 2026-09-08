import type { Metadata } from "next";
import type { ReactNode } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/dashboard";
import {
  Card,
  CardContent,
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
import { requireAdministrator } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { formatDate, formatNumber } from "@/lib/utils";
import { getDispenser } from "@/services/admin/dispensers";

export const metadata: Metadata = {
  title: "Dispenser",
  description: "Dispenser asset, tracker and installment schedule.",
};

export default async function AdminDispenserDetailPage(
  props: PageProps<"/admin/dispensers/[id]">,
) {
  await requireAdministrator();
  const { id } = await props.params;
  const dispenser = await getDispenser(id);

  if (!dispenser) notFound();

  return (
    <>
      <PageHeader
        title={dispenser.assetTag}
        description={`${dispenser.model} · ${dispenser.serialNumber}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Asset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Status">
              <StatusBadge status={dispenser.status} />
            </Row>
            <Row label="Ownership">
              <StatusBadge status={dispenser.ownership} />
            </Row>
            <Row label="Maintenance">
              <StatusBadge status={dispenser.maintenanceStatus} />
            </Row>
            <Row label="Customer">
              {dispenser.customer ? (
                <Link
                  href={`/admin/customers/${dispenser.customer.id}`}
                  className="text-brand-600 hover:underline"
                >
                  {dispenser.customer.user.fullName}
                </Link>
              ) : (
                "—"
              )}
            </Row>
            <Row label="Sale price">{formatMoney(dispenser.salePrice)}</Row>
            <Row label="Installed">{formatDate(dispenser.installedAt)}</Row>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tracker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {dispenser.trackerDevice ? (
              <>
                <Row label="Device">
                  {dispenser.trackerDevice.deviceCode}
                </Row>
                <Row label="Online">
                  {dispenser.trackerDevice.isOnline ? "Yes" : "No"}
                </Row>
                <Row label="Water">
                  {dispenser.trackerDevice.waterLevelPercent != null
                    ? `${dispenser.trackerDevice.waterLevelPercent}%`
                    : "—"}
                </Row>
                <Row label="Battery">
                  {dispenser.trackerDevice.batteryPercent != null
                    ? `${dispenser.trackerDevice.batteryPercent}%`
                    : "—"}
                </Row>
              </>
            ) : (
              <p className="text-slate-500">No tracker paired.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            {dispenser.address
              ? `${dispenser.address.addressLine}, ${dispenser.address.city}`
              : "No installation address."}
          </CardContent>
        </Card>
      </div>

      {dispenser.paymentPlans.map((plan) => (
        <Card key={plan.id} className="mt-6">
          <CardHeader>
            <CardTitle>{plan.planNumber}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <Row label="Status">
                <StatusBadge status={plan.status} />
              </Row>
              <Row label="Paid">{formatMoney(plan.amountPaid)}</Row>
              <Row label="Outstanding">
                {formatMoney(plan.outstandingBalance)}
              </Row>
            </div>
            <Table>
              <THead>
                <TR>
                  <TH>#</TH>
                  <TH>Due</TH>
                  <TH numeric>Due amount</TH>
                  <TH numeric>Paid</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {plan.installments.map((item) => (
                  <TR key={item.id}>
                    <TD>{formatNumber(item.sequence)}</TD>
                    <TD>{formatDate(item.dueDate)}</TD>
                    <TD numeric>{formatMoney(item.amountDue)}</TD>
                    <TD numeric>{formatMoney(item.amountPaid)}</TD>
                    <TD>
                      <StatusBadge status={item.status} />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right text-slate-900">{children}</dd>
    </div>
  );
}
