import type { Metadata } from "next";

import Link from "next/link";

import { Bell, CheckCheck } from "lucide-react";

import { PageHeader } from "@/components/dashboard";
import {
  Badge,
  Button,
  Card,
  CardContent,
  EmptyState,
} from "@/components/ui";
import { requireActor } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { NotificationSeverity } from "@/lib/generated/prisma/enums";
import type { BadgeTone } from "@/components/ui";
import { formatFriendlyDateTime, humanizeEnum } from "@/lib/utils";

import { markAllNotificationsRead, markNotificationRead } from "./actions";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Alerts and updates about your orders, deliveries and payments.",
};

const SEVERITY_TONES: Record<NotificationSeverity, BadgeTone> = {
  [NotificationSeverity.INFO]: "info",
  [NotificationSeverity.SUCCESS]: "success",
  [NotificationSeverity.WARNING]: "warning",
  [NotificationSeverity.CRITICAL]: "danger",
};

export default async function NotificationsPage() {
  const actor = await requireActor();

  // Scoped to the signed-in user and capped, so the query cost is bounded
  // however many notifications accumulate.
  const notifications = await prisma.notification.findMany({
    where: { userId: actor.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      category: true,
      severity: true,
      title: true,
      body: true,
      actionUrl: true,
      readAt: true,
      createdAt: true,
    },
  });

  const unread = notifications.filter((item) => item.readAt === null).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={
          unread > 0
            ? `${unread} unread of your ${notifications.length} most recent notifications.`
            : "You are all caught up."
        }
        actions={
          unread > 0 ? (
            <form action={markAllNotificationsRead}>
              <Button type="submit" variant="outline" size="sm">
                <CheckCheck className="size-4" aria-hidden />
                Mark all read
              </Button>
            </form>
          ) : undefined
        }
      />

      <Card>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No notifications yet"
              description="Updates about your orders, deliveries, payments and rewards will appear here."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {notifications.map((notification) => {
                const isUnread = notification.readAt === null;

                return (
                  <li
                    key={notification.id}
                    className={isUnread ? "bg-brand-50/40" : undefined}
                  >
                    <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-start sm:gap-4 sm:px-5">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {isUnread && (
                            <span
                              className="size-2 rounded-full bg-brand-600"
                              aria-label="Unread"
                            />
                          )}
                          <p className="font-medium text-slate-900">
                            {notification.title}
                          </p>
                          <Badge tone={SEVERITY_TONES[notification.severity]}>
                            {humanizeEnum(notification.category)}
                          </Badge>
                        </div>

                        <p className="mt-1 text-sm text-slate-600">
                          {notification.body}
                        </p>

                        <p className="mt-1.5 text-xs text-slate-400">
                          {formatFriendlyDateTime(notification.createdAt)}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {notification.actionUrl && (
                          <Link
                            href={notification.actionUrl}
                            className="text-sm font-medium text-brand-700 hover:underline"
                          >
                            View
                          </Link>
                        )}

                        {isUnread && (
                          <form action={markNotificationRead}>
                            <input
                              type="hidden"
                              name="notificationId"
                              value={notification.id}
                            />
                            <Button type="submit" variant="ghost" size="sm">
                              Mark read
                            </Button>
                          </form>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
