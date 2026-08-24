import "server-only";

import type { ReactNode } from "react";

import { unreadCount } from "@/lib/notifications";
import { humanizeEnum } from "@/lib/utils/format";

import type { Actor } from "@/lib/auth/dal";

import { AppShell } from "./app-shell";

/**
 * Server-side wrapper that turns a resolved actor into the props the client
 * shell needs. Keeping the data fetch here means the shell itself never
 * touches the database.
 */
export async function PortalShell({
  actor,
  children,
}: {
  actor: Actor;
  children: ReactNode;
}) {
  const notifications = await unreadCount(actor.userId);

  return (
    <AppShell
      role={actor.role}
      notificationCount={notifications}
      user={{
        fullName: actor.fullName,
        email: actor.email,
        roleLabel: humanizeEnum(actor.role),
        code: actor.code,
      }}
    >
      {children}
    </AppShell>
  );
}
