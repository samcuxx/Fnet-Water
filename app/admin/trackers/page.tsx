import type { Metadata } from "next";

import Link from "next/link";

import { Radio } from "lucide-react";

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
import { requireAdministrator } from "@/lib/auth/dal";
import { formatDateTime, formatNumber, humanizeEnum } from "@/lib/utils";
import { listTrackerAlerts, listTrackerDevices } from "@/services/admin/trackers";

export const metadata: Metadata = {
  title: "Trackers",
  description: "Simulated and live tracker devices and their alerts.",
};

export default async function AdminTrackersPage() {
  await requireAdministrator();
  const [devices, alerts] = await Promise.all([
    listTrackerDevices(),
    listTrackerAlerts(),
  ]);

  return (
    <>
      <PageHeader
        title="Trackers"
        description={`${formatNumber(devices.length)} devices · ${formatNumber(alerts.filter((row) => !row.isResolved).length)} open alerts.`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Devices</CardTitle>
          <CardDescription>
            Phase 1 ships simulated devices; live hardware is not required.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {devices.length === 0 ? (
            <EmptyState
              icon={Radio}
              title="No trackers"
              description="Paired or simulated devices will appear here."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Device</TH>
                  <TH>Dispenser</TH>
                  <TH>Online</TH>
                  <TH numeric>Water</TH>
                  <TH numeric>Battery</TH>
                  <TH>Last seen</TH>
                </TR>
              </THead>
              <TBody>
                {devices.map((device) => (
                  <TR key={device.id}>
                    <TD className="font-mono text-xs">{device.deviceCode}</TD>
                    <TD>
                      {device.dispenser ? (
                        <Link
                          href={`/admin/dispensers/${device.dispenser.id}`}
                          className="text-brand-600 hover:underline"
                        >
                          {device.dispenser.assetTag}
                        </Link>
                      ) : (
                        "Unpaired"
                      )}
                    </TD>
                    <TD>{device.isOnline ? "Yes" : "No"}</TD>
                    <TD numeric>
                      {device.waterLevelPercent != null
                        ? `${device.waterLevelPercent}%`
                        : "—"}
                    </TD>
                    <TD numeric>
                      {device.batteryPercent != null
                        ? `${device.batteryPercent}%`
                        : "—"}
                    </TD>
                    <TD className="whitespace-nowrap text-slate-500">
                      {formatDateTime(device.lastSeenAt)}
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
          <CardTitle>Alerts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>When</TH>
                <TH>Device</TH>
                <TH>Type</TH>
                <TH>Severity</TH>
                <TH>Resolved</TH>
              </TR>
            </THead>
            <TBody>
              {alerts.map((alert) => (
                <TR key={alert.id}>
                  <TD className="whitespace-nowrap text-slate-500">
                    {formatDateTime(alert.createdAt)}
                  </TD>
                  <TD className="font-mono text-xs">{alert.device.deviceCode}</TD>
                  <TD>{humanizeEnum(alert.type)}</TD>
                  <TD>
                    <StatusBadge status={alert.severity} />
                  </TD>
                  <TD>{alert.isResolved ? "Yes" : "No"}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
