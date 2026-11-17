import { prisma } from "@/lib/prisma";
import { isDatabaseConnected } from "@/lib/auth-store";

export interface StoredDevicePushToken {
  id: string;
  userId: string;
  token: string;
  platform: string;
  deviceModel?: string;
  appVersion?: string;
  updatedAt: string;
}

const globalForDevices = globalThis as unknown as {
  memoryPushTokens?: Map<string, StoredDevicePushToken>;
};

const memoryPushTokens: Map<string, StoredDevicePushToken> = (() => {
  if (globalForDevices.memoryPushTokens) return globalForDevices.memoryPushTokens;
  const map = new Map<string, StoredDevicePushToken>();
  if (process.env.NODE_ENV !== "production") {
    globalForDevices.memoryPushTokens = map;
  }
  return map;
})();

/**
 * Register or update a mobile push notification token for a user
 */
export async function registerDevicePushToken(data: {
  userId: string;
  token: string;
  platform?: string;
  deviceModel?: string;
  appVersion?: string;
}): Promise<StoredDevicePushToken> {
  const cleanToken = data.token.trim();
  const now = new Date().toISOString();

  const record: StoredDevicePushToken = {
    id: `pt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId: data.userId,
    token: cleanToken,
    platform: (data.platform || "UNKNOWN").toUpperCase(),
    deviceModel: data.deviceModel,
    appVersion: data.appVersion,
    updatedAt: now,
  };

  if (await isDatabaseConnected()) {
    try {
      const upserted = await prisma.devicePushToken.upsert({
        where: { token: cleanToken },
        create: {
          userId: data.userId,
          token: cleanToken,
          platform: record.platform,
          deviceModel: data.deviceModel,
          appVersion: data.appVersion,
        },
        update: {
          userId: data.userId,
          platform: record.platform,
          deviceModel: data.deviceModel,
          appVersion: data.appVersion,
        },
      });
      record.id = upserted.id;
      record.updatedAt = upserted.updatedAt.toISOString();
    } catch {
      // Fallback to memory store
    }
  }

  memoryPushTokens.set(cleanToken, record);
  return record;
}

/**
 * Remove a push token on logout
 */
export async function unregisterDevicePushToken(
  userId: string,
  token?: string
): Promise<boolean> {
  if (await isDatabaseConnected()) {
    try {
      if (token) {
        await prisma.devicePushToken.deleteMany({
          where: { userId, token: token.trim() },
        });
      } else {
        await prisma.devicePushToken.deleteMany({
          where: { userId },
        });
      }
    } catch {
      // Memory fallback
    }
  }

  if (token) {
    const existing = memoryPushTokens.get(token.trim());
    if (existing && existing.userId === userId) {
      memoryPushTokens.delete(token.trim());
      return true;
    }
    return false;
  }

  let removed = false;
  for (const [k, v] of memoryPushTokens.entries()) {
    if (v.userId === userId) {
      memoryPushTokens.delete(k);
      removed = true;
    }
  }
  return removed;
}

/**
 * Get registered push tokens for a user
 */
export async function getPushTokensForUser(userId: string): Promise<string[]> {
  if (await isDatabaseConnected()) {
    try {
      const rows = await prisma.devicePushToken.findMany({
        where: { userId },
        select: { token: true },
      });
      if (rows.length > 0) {
        return rows.map((r) => r.token);
      }
    } catch {
      // Memory fallback
    }
  }

  return Array.from(memoryPushTokens.values())
    .filter((t) => t.userId === userId)
    .map((t) => t.token);
}

/**
 * Non-blocking dispatch via Expo Push API for ExponentPushToken[...] devices
 */
export async function sendPushNotificationToUser(
  userId: string,
  payload: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    const tokens = await getPushTokensForUser(userId);
    const expoTokens = tokens.filter(
      (t) => t.startsWith("ExponentPushToken[") || t.startsWith("ExpoPushToken[")
    );
    if (expoTokens.length === 0) return;

    const messages = expoTokens.map((to) => ({
      to,
      sound: "default",
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
    }));

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });
  } catch (err) {
    console.warn("[device-store] Push dispatch skipped:", err);
  }
}
