import { prisma } from "@/lib/prisma";
import { isDatabaseConnected } from "@/lib/auth-store";

export type NotificationType =
  | "ORDER"
  | "DELIVERY"
  | "DISPENSER"
  | "INVENTORY"
  | "REWARD"
  | "SYSTEM"
  | "PAYMENT";

export type NotificationRole =
  | "ADMIN"
  | "MANAGER"
  | "DRIVER"
  | "AGENT"
  | "CUSTOMER"
  | "ALL";

export interface StoredNotification {
  id: string;
  userId?: string | null;
  role?: NotificationRole | null;
  title: string;
  message: string;
  type: NotificationType;
  linkUrl?: string | null;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface SmsLogRecord {
  id: string;
  recipientPhone: string;
  message: string;
  status: "DELIVERED" | "QUEUED" | "FAILED";
  type: string;
  sentAt: string;
}

export interface CreateNotificationInput {
  userId?: string | null;
  role?: NotificationRole | null;
  title: string;
  message: string;
  type: NotificationType;
  linkUrl?: string | null;
  metadata?: Record<string, unknown>;
}

const DEFAULT_SEED_NOTIFICATIONS: StoredNotification[] = [
  {
    id: "notif_001",
    userId: "usr_customer_001",
    role: "CUSTOMER",
    title: "Order Confirmed: FNW-8821",
    message: "Your order for 4x 18.9L Pure Refill Bottles has been received and scheduled for morning delivery.",
    type: "ORDER",
    linkUrl: "/customer/orders",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  },
  {
    id: "notif_002",
    userId: "usr_customer_001",
    role: "CUSTOMER",
    title: "Driver En Route with Your Water",
    message: "Driver Kwame Asante has left the depot and is heading to your address in East Legon.",
    type: "DELIVERY",
    linkUrl: "/customer/orders",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
  },
  {
    id: "notif_003",
    userId: "usr_customer_001",
    role: "CUSTOMER",
    title: "1 Free Bottle Reward Unlocked!",
    message: "5 of your invited friends have placed their first orders. You have earned 1 free refill bottle credit!",
    type: "REWARD",
    linkUrl: "/customer/referrals",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
  },
  {
    id: "notif_004",
    userId: "usr_driver_001",
    role: "DRIVER",
    title: "New Delivery Assigned: FNW-8824",
    message: "New delivery stop assigned at Cantonments (House 8B, 3rd Circular Road). 3 refills with exchange.",
    type: "DELIVERY",
    linkUrl: "/driver",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
  },
  {
    id: "notif_005",
    userId: "usr_manager_001",
    role: "MANAGER",
    title: "Low Inventory Warning: Warehouse Refills",
    message: "Warehouse stock of filled 18.9L bottles has dropped below 100 units. Please check bottling queue.",
    type: "INVENTORY",
    linkUrl: "/admin/inventory",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), // 1 hour ago
  },
  {
    id: "notif_006",
    userId: "usr_admin_001",
    role: "ADMIN",
    title: "Dispenser Sensor Alert: FNW-DSP-042",
    message: "Dispenser unit FNW-DSP-042 at Airport Residential reported a tilt alert. Technician has been alerted.",
    type: "DISPENSER",
    linkUrl: "/admin/dispensers",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "notif_007",
    userId: "usr_agent_001",
    role: "AGENT",
    title: "Commission Credited: GH₵ 25.00",
    message: "Your referee Kwame Mensah placed 5 refills. Commission of GH₵ 25.00 has been credited to your ledger.",
    type: "REWARD",
    linkUrl: "/agent",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
];

const DEFAULT_SEED_SMS_LOGS: SmsLogRecord[] = [
  {
    id: "sms_001",
    recipientPhone: "0241000005",
    message: "F Net Water Hub: Order #FNW-8821 confirmed! Total: GH₵ 100.00. We will notify you when a driver is dispatched.",
    status: "DELIVERED",
    type: "ORDER_CONFIRMATION",
    sentAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "sms_002",
    recipientPhone: "0241000005",
    message: "F Net Water Hub: Driver Kwame Asante is on the way with your water delivery for Order #FNW-8821.",
    status: "DELIVERED",
    type: "DELIVERY_DISPATCH",
    sentAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "sms_003",
    recipientPhone: "0241000003",
    message: "F Net Water Hub: New delivery assigned for Order #FNW-8824 at Cantonments. Please check your driver run.",
    status: "DELIVERED",
    type: "DRIVER_ASSIGNMENT",
    sentAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: "sms_004",
    recipientPhone: "0241000002",
    message: "F Net Water Hub ALERT: Warehouse filled bottle inventory has dropped to 85 units (below threshold).",
    status: "DELIVERED",
    type: "INVENTORY_ALERT",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
  },
];

// Persistent global stores for dev server HMR stability
const globalForNotifications = globalThis as unknown as {
  memoryNotifications?: Map<string, StoredNotification>;
  memorySmsLogs?: SmsLogRecord[];
};

const memoryNotifications: Map<string, StoredNotification> = (() => {
  if (globalForNotifications.memoryNotifications) {
    for (const notif of DEFAULT_SEED_NOTIFICATIONS) {
      if (!globalForNotifications.memoryNotifications.has(notif.id)) {
        globalForNotifications.memoryNotifications.set(notif.id, { ...notif });
      }
    }
    return globalForNotifications.memoryNotifications;
  }
  const map = new Map<string, StoredNotification>(
    DEFAULT_SEED_NOTIFICATIONS.map((n) => [n.id, { ...n }])
  );
  if (process.env.NODE_ENV !== "production") {
    globalForNotifications.memoryNotifications = map;
  }
  return map;
})();

const memorySmsLogs: SmsLogRecord[] = (() => {
  if (globalForNotifications.memorySmsLogs) {
    return globalForNotifications.memorySmsLogs;
  }
  const list = [...DEFAULT_SEED_SMS_LOGS];
  if (process.env.NODE_ENV !== "production") {
    globalForNotifications.memorySmsLogs = list;
  }
  return list;
})();

/**
 * Record an SMS dispatch in the audit ledger
 */
export function recordSmsDispatch(
  recipientPhone: string,
  message: string,
  type: string,
  status: "DELIVERED" | "QUEUED" | "FAILED" = "DELIVERED"
): SmsLogRecord {
  const record: SmsLogRecord = {
    id: `sms_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    recipientPhone,
    message,
    status,
    type,
    sentAt: new Date().toISOString(),
  };

  memorySmsLogs.unshift(record);
  if (memorySmsLogs.length > 100) {
    memorySmsLogs.pop();
  }

  return record;
}

/**
 * Get recent SMS dispatch logs
 */
export async function getRecentSmsLogs(limit: number = 30): Promise<SmsLogRecord[]> {
  return memorySmsLogs.slice(0, limit);
}

/**
 * Create a new notification (supports Prisma & memory fallback)
 */
export async function createNotification(
  data: CreateNotificationInput
): Promise<StoredNotification> {
  const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newRecord: StoredNotification = {
    id: notifId,
    userId: data.userId || null,
    role: data.role || null,
    title: data.title,
    message: data.message,
    type: data.type,
    linkUrl: data.linkUrl || null,
    isRead: false,
    createdAt: now,
    metadata: data.metadata,
  };

  if (await isDatabaseConnected()) {
    try {
      const typeMap: Record<NotificationType, "INFO" | "SUCCESS" | "WARNING" | "ERROR"> = {
        ORDER: "INFO",
        DELIVERY: "INFO",
        PAYMENT: "SUCCESS",
        REWARD: "SUCCESS",
        DISPENSER: "WARNING",
        INVENTORY: "WARNING",
        SYSTEM: "INFO",
      };

      const roleEnum = data.role && ["ADMIN", "MANAGER", "DRIVER", "AGENT", "CUSTOMER"].includes(data.role)
        ? (data.role as any)
        : null;

      const created = await prisma.notification.create({
        data: {
          id: notifId,
          userId: data.userId || undefined,
          role: roleEnum,
          title: data.title,
          message: data.message,
          type: typeMap[data.type] || "INFO",
          linkUrl: data.linkUrl || null,
          isRead: false,
        },
      });

      newRecord.id = created.id;
    } catch (err) {
      console.warn("[notification-store] Prisma create failed, fallback to memory:", err);
    }
  }

  memoryNotifications.set(newRecord.id, newRecord);
  return newRecord;
}

/**
 * Get all notifications relevant to a specific user and their role
 */
export async function getNotificationsForUser(
  userId: string,
  role?: string
): Promise<StoredNotification[]> {
  const normalizedRole = role ? (role.toUpperCase() as NotificationRole) : undefined;

  if (await isDatabaseConnected()) {
    try {
      const orClauses: any[] = [{ userId }];
      if (normalizedRole) {
        orClauses.push({ userId: null, role: normalizedRole });
      }

      const dbRecords = await prisma.notification.findMany({
        where: {
          OR: orClauses,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
      });

      if (dbRecords.length > 0) {
        return dbRecords.map((r) => ({
          id: r.id,
          userId: r.userId,
          role: r.role as NotificationRole,
          title: r.title,
          message: r.message,
          type: (r.type === "SUCCESS" ? "REWARD" : r.type === "WARNING" ? "INVENTORY" : "ORDER") as NotificationType,
          linkUrl: r.linkUrl,
          isRead: r.isRead,
          createdAt: r.createdAt.toISOString(),
        }));
      }
    } catch (err) {
      console.warn("[notification-store] Prisma query failed, fallback to memory:", err);
    }
  }

  // Memory fallback filtering
  const all = Array.from(memoryNotifications.values());
  const filtered = all.filter((n) => {
    // 1. Direct match on userId (user-specific notification)
    if (n.userId) {
      return n.userId === userId;
    }
    // 2. Broadcast to role or ALL (when userId is not explicitly set)
    if (n.role && (n.role === "ALL" || (normalizedRole && n.role === normalizedRole))) {
      return true;
    }
    return false;
  });

  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get unread notification count for a specific user and their role
 */
export async function getUnreadNotificationCount(
  userId: string,
  role?: string
): Promise<number> {
  const notifs = await getNotificationsForUser(userId, role);
  return notifs.filter((n) => !n.isRead).length;
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId?: string
): Promise<boolean> {
  if (await isDatabaseConnected()) {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
    } catch (err) {
      console.warn("[notification-store] Prisma update failed, fallback to memory:", err);
    }
  }

  const existing = memoryNotifications.get(notificationId);
  if (existing) {
    existing.isRead = true;
    memoryNotifications.set(notificationId, existing);
    return true;
  }

  return false;
}

/**
 * Mark all notifications for a user/role as read
 */
export async function markAllNotificationsAsRead(
  userId: string,
  role?: string
): Promise<number> {
  const userNotifs = await getNotificationsForUser(userId, role);
  let updatedCount = 0;

  for (const notif of userNotifs) {
    if (!notif.isRead) {
      notif.isRead = true;
      memoryNotifications.set(notif.id, notif);
      updatedCount++;
    }
  }

  if (await isDatabaseConnected()) {
    try {
      const orClauses: any[] = [{ userId }];
      if (role) {
        orClauses.push({ role: role.toUpperCase() as any });
      }
      await prisma.notification.updateMany({
        where: {
          OR: orClauses,
          isRead: false,
        },
        data: { isRead: true },
      });
    } catch (err) {
      console.warn("[notification-store] Prisma updateMany failed, fallback to memory:", err);
    }
  }

  return updatedCount;
}

/**
 * Clear test data (useful for test suites)
 */
export function resetNotificationStoreForTesting(): void {
  memoryNotifications.clear();
  for (const notif of DEFAULT_SEED_NOTIFICATIONS) {
    memoryNotifications.set(notif.id, { ...notif });
  }
}
