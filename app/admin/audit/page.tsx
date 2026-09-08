import type { Metadata } from "next";

import { ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/dashboard";
import {
  Card,
  CardContent,
  EmptyState,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { requireAdministrator } from "@/lib/auth/dal";
import { formatDateTime, formatNumber, humanizeEnum } from "@/lib/utils";
import { listAuditLog } from "@/services/admin/audit";

export const metadata: Metadata = {
  title: "Audit log",
  description: "Append-only record of who changed what.",
};

export default async function AdminAuditPage() {
  await requireAdministrator();
  const entries = await listAuditLog();

  return (
    <>
      <PageHeader
        title="Audit log"
        description={`${formatNumber(entries.length)} most recent immutable entries.`}
      />

      <Card>
        <CardContent className="p-0">
          {entries.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="No audit entries"
              description="Sensitive operations write an append-only trail here."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>When</TH>
                  <TH>Actor</TH>
                  <TH>Action</TH>
                  <TH>Entity</TH>
                  <TH>Reason</TH>
                </TR>
              </THead>
              <TBody>
                {entries.map((entry) => (
                  <TR key={entry.id}>
                    <TD className="whitespace-nowrap text-slate-500">
                      {formatDateTime(entry.createdAt)}
                    </TD>
                    <TD>
                      {entry.user?.fullName ?? "System"}
                      {entry.user ? (
                        <span className="mt-0.5 block text-xs text-slate-400">
                          {humanizeEnum(entry.user.role)}
                        </span>
                      ) : null}
                    </TD>
                    <TD className="font-mono text-xs">{entry.action}</TD>
                    <TD>
                      {entry.entityType}
                      {entry.entityId ? (
                        <span className="mt-0.5 block font-mono text-xs text-slate-400">
                          {entry.entityId}
                        </span>
                      ) : null}
                    </TD>
                    <TD className="max-w-xs truncate text-slate-500">
                      {entry.reason ?? "—"}
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
