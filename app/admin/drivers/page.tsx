import type { Metadata } from "next";

import { Truck } from "lucide-react";

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
import { formatNumber } from "@/lib/utils";
import { listDriverOpenDeliveries, listDrivers } from "@/services/admin/drivers";

export const metadata: Metadata = {
  title: "Drivers",
  description: "Driver accounts, availability and assigned work.",
};

export default async function AdminDriversPage() {
  await requireAdministrator();
  const [drivers, openRows] = await Promise.all([
    listDrivers(),
    listDriverOpenDeliveries(),
  ]);
  const openByDriver = new Map(
    openRows.map((row) => [row.driverId, row._count._all]),
  );

  return (
    <>
      <PageHeader
        title="Drivers"
        description={`${formatNumber(drivers.length)} driver profiles.`}
      />

      <Card>
        <CardContent className="p-0">
          {drivers.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="No drivers"
              description="Driver accounts created by an administrator will appear here."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Driver</TH>
                  <TH>Vehicle</TH>
                  <TH>Status</TH>
                  <TH>Available</TH>
                  <TH numeric>Open</TH>
                  <TH numeric>All deliveries</TH>
                </TR>
              </THead>
              <TBody>
                {drivers.map((driver) => (
                  <TR key={driver.id}>
                    <TD>
                      {driver.user.fullName}
                      <span className="mt-0.5 block font-mono text-xs text-slate-400">
                        {driver.driverCode}
                      </span>
                    </TD>
                    <TD>
                      {driver.vehicleRegistration ?? "—"}
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {driver.vehicleType ?? "No vehicle type"}
                      </span>
                    </TD>
                    <TD>
                      <StatusBadge status={driver.user.status} />
                    </TD>
                    <TD>{driver.isAvailable ? "Yes" : "No"}</TD>
                    <TD numeric>
                      {formatNumber(openByDriver.get(driver.id) ?? 0)}
                    </TD>
                    <TD numeric>{formatNumber(driver._count.deliveries)}</TD>
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
