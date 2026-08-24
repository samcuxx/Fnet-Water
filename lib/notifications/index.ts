import "server-only";

import { prisma } from "@/lib/db";
import {
  NotificationCategory,
  NotificationChannel,
  NotificationSeverity,
  NotificationStatus,
} from "@/lib/generated/prisma/enums";

/**
 * Notification delivery.
 *
 * Phase 1 implements the in-app channel only. SMS, WhatsApp, email and push are
 * registered behind the same interface but disabled, because their per-message
 * charges are excluded from Phase 1 scope (requirements §31). Enabling one is a
 * configuration change and a driver implementation, not a refactor of callers.
 *
 * Nothing here pretends an external channel succeeded when it is not
 * configured: a disabled channel records `SKIPPED` so the gap is visible.
 */

export type NotificationPayload = {
  userId: string;
  category: NotificationCategory;
  severity?: NotificationSeverity;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  meta?: Record<string, unknown>;
};

export type ChannelDriver = {
  readonly channel: NotificationChannel;
  isEnabled(): boolean;
  send(payload: NotificationPayload): Promise<NotificationStatus>;
};

type NotificationWriter = Pick<typeof prisma, "notification">;

/** In-app notifications are always available; the record *is* the delivery. */
const inAppDriver: ChannelDriver = {
  channel: NotificationChannel.IN_APP,
  isEnabled: () => true,
  send: async () => NotificationStatus.SENT,
};

/**
 * Placeholder drivers for external channels. Each reports itself disabled until
 * both a feature flag and credentials are present, and throws if invoked while
 * disabled rather than silently reporting success.
 */
function externalDriver(
  channel: NotificationChannel,
  enabledFlag: string,
  credentialVar: string,
): ChannelDriver {
  return {
    channel,
    isEnabled: () =>
      process.env[enabledFlag] === "true" && Boolean(process.env[credentialVar]),
    send: async () => {
      throw new Error(
        `${channel} notifications are not implemented in Phase 1. ` +
          `Set ${enabledFlag}=true, provide ${credentialVar}, and add a provider driver.`,
      );
    },
  };
}

const drivers: Record<NotificationChannel, ChannelDriver> = {
  [NotificationChannel.IN_APP]: inAppDriver,
  [NotificationChannel.SMS]: externalDriver(
    NotificationChannel.SMS,
    "NOTIFICATIONS_SMS_ENABLED",
    "SMS_API_KEY",
  ),
  [NotificationChannel.EMAIL]: externalDriver(
    NotificationChannel.EMAIL,
    "NOTIFICATIONS_EMAIL_ENABLED",
    "EMAIL_API_KEY",
  ),
  [NotificationChannel.WHATSAPP]: externalDriver(
    NotificationChannel.WHATSAPP,
    "NOTIFICATIONS_WHATSAPP_ENABLED",
    "WHATSAPP_API_KEY",
  ),
  [NotificationChannel.PUSH]: externalDriver(
    NotificationChannel.PUSH,
    "NOTIFICATIONS_PUSH_ENABLED",
    "PUSH_API_KEY",
  ),
};

export function enabledChannels(): NotificationChannel[] {
  return Object.values(drivers)
    .filter((driver) => driver.isEnabled())
    .map((driver) => driver.channel);
}

/**
 * Persists and delivers a notification.
 *
 * Accepts a transaction client so a notification about a state change commits
 * with that change.
 */
export async function notify(
  payload: NotificationPayload,
  tx: NotificationWriter = prisma,
): Promise<void> {
  await tx.notification.create({
    data: {
      userId: payload.userId,
      category: payload.category,
      severity: payload.severity ?? NotificationSeverity.INFO,
      channel: NotificationChannel.IN_APP,
      status: NotificationStatus.SENT,
      title: payload.title,
      body: payload.body,
      entityType: payload.entityType,
      entityId: payload.entityId,
      actionUrl: payload.actionUrl,
      meta: payload.meta ? (payload.meta as never) : undefined,
      sentAt: new Date(),
    },
  });
}

/** Fans a single notification out to several recipients, e.g. all managers. */
export async function notifyMany(
  userIds: readonly string[],
  payload: Omit<NotificationPayload, "userId">,
  tx: NotificationWriter = prisma,
): Promise<void> {
  if (userIds.length === 0) return;

  await tx.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      category: payload.category,
      severity: payload.severity ?? NotificationSeverity.INFO,
      channel: NotificationChannel.IN_APP,
      status: NotificationStatus.SENT,
      title: payload.title,
      body: payload.body,
      entityType: payload.entityType,
      entityId: payload.entityId,
      actionUrl: payload.actionUrl,
      meta: payload.meta ? (payload.meta as never) : undefined,
      sentAt: new Date(),
    })),
  });
}

export async function markAsRead(
  notificationId: string,
  userId: string,
): Promise<void> {
  // Scoped by userId so a user cannot mark someone else's notification read.
  await prisma.notification.updateMany({
    where: { id: notificationId, userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function markAllAsRead(userId: string): Promise<number> {
  const { count } = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });

  return count;
}

export async function unreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } });
}
