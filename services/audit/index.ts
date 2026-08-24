import "server-only";

import { prisma } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Audit logging.
 *
 * Sensitive operations write an immutable record of who did what, to which
 * record, with the before and after values and a reason. The table is
 * append-only by policy: nothing in the application updates or deletes rows.
 *
 * `record` accepts a transaction client so the audit entry commits atomically
 * with the change it describes. An audit trail that can survive a rolled-back
 * mutation is worse than none, because it asserts something that never
 * happened.
 */

export const AUDIT_ACTIONS = {
  // Accounts
  userCreated: "user.created",
  userUpdated: "user.updated",
  userDeactivated: "user.deactivated",
  userReactivated: "user.reactivated",
  passwordChanged: "user.password_changed",
  loginSucceeded: "auth.login_succeeded",
  loginFailed: "auth.login_failed",
  logout: "auth.logout",

  // Orders and deliveries
  orderCreated: "order.created",
  orderStatusChanged: "order.status_changed",
  orderCancelled: "order.cancelled",
  deliveryAssigned: "delivery.assigned",
  deliveryCompleted: "delivery.completed",
  deliveryFailed: "delivery.failed",
  deliveryReconciled: "delivery.reconciled",

  // Inventory and bottles
  inventoryAdjustmentRequested: "inventory.adjustment_requested",
  inventoryAdjustmentApproved: "inventory.adjustment_approved",
  inventoryAdjustmentRejected: "inventory.adjustment_rejected",
  bottleShortageRecorded: "bottle.shortage_recorded",
  bottleShortageResolved: "bottle.shortage_resolved",
  bottleShortageWrittenOff: "bottle.shortage_written_off",

  // Money
  paymentRecorded: "payment.recorded",
  paymentConfirmed: "payment.confirmed",
  paymentReversed: "payment.reversed",
  paymentRefunded: "payment.refunded",
  installmentPaid: "installment.paid",

  // Dispensers
  dispenserInstalled: "dispenser.installed",
  dispenserOwnershipTransferred: "dispenser.ownership_transferred",
  dispenserStatusChanged: "dispenser.status_changed",

  // Rewards
  referralQualified: "referral.qualified",
  referralReversed: "referral.reversed",
  rewardRedeemed: "reward.redeemed",
  rewardAdjusted: "reward.adjusted",

  // System
  settingUpdated: "setting.updated",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export type AuditEntry = {
  userId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  previousValues?: Prisma.InputJsonValue | null;
  newValues?: Prisma.InputJsonValue | null;
  reason?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

/** Minimal Prisma surface shared by the client and a transaction client. */
type AuditWriter = Pick<typeof prisma, "auditLog">;

export async function record(
  entry: AuditEntry,
  tx: AuditWriter = prisma,
): Promise<void> {
  await tx.auditLog.create({
    data: {
      userId: entry.userId ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      previousValues: entry.previousValues ?? undefined,
      newValues: entry.newValues ?? undefined,
      reason: entry.reason ?? null,
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent ?? null,
    },
  });
}

/**
 * Records an audit entry without letting a logging failure abort the business
 * operation. Only for entries written outside the main transaction, such as a
 * failed login attempt where there is nothing to roll back.
 */
export async function recordSafely(entry: AuditEntry): Promise<void> {
  try {
    await record(entry);
  } catch (error) {
    console.error("Failed to write audit log entry", {
      action: entry.action,
      entityType: entry.entityType,
      error,
    });
  }
}
