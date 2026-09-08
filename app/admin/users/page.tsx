import type { Metadata } from "next";

import { UserCog } from "lucide-react";

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
import { formatDateTime, formatNumber, humanizeEnum } from "@/lib/utils";
import { listUsers } from "@/services/admin/users";

export const metadata: Metadata = {
  title: "Users",
  description: "Every account on F Net Water Hub.",
};

export default async function AdminUsersPage() {
  await requireAdministrator();
  const users = await listUsers();

  return (
    <>
      <PageHeader
        title="Users"
        description={`${formatNumber(users.length)} accounts across all roles.`}
      />

      <Card>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <EmptyState
              icon={UserCog}
              title="No users"
              description="Seeded and registered accounts will appear here."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Contact</TH>
                  <TH>Role</TH>
                  <TH>Status</TH>
                  <TH>Last login</TH>
                </TR>
              </THead>
              <TBody>
                {users.map((user) => (
                  <TR key={user.id}>
                    <TD>
                      {user.fullName}
                      <span className="mt-0.5 block font-mono text-xs text-slate-400">
                        {user.code}
                      </span>
                    </TD>
                    <TD>
                      <span className="block">{user.phone}</span>
                      <span className="block text-xs text-slate-400">
                        {user.email}
                      </span>
                    </TD>
                    <TD>{humanizeEnum(user.role)}</TD>
                    <TD>
                      <StatusBadge status={user.status} />
                    </TD>
                    <TD className="whitespace-nowrap text-slate-500">
                      {formatDateTime(user.lastLoginAt)}
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
