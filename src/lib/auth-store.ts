import net from "net";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizeGhanaPhone } from "@/lib/mnotify";
import type { RoleType, StatusType } from "@/types/next-auth";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: RoleType;
  status: StatusType;
  createdAt: string;
  // Customer-specific fields
  customerCode?: string;
  bottlesHeld?: number;
  dispenserPlan?: string;
  deliveryArea?: string;
}

// Database reachability cache to prevent socket timeout lag
let dbReachability: { connected: boolean; checkedAt: number } | null = null;
const PROBE_INTERVAL_MS = 15000; // 15 seconds cache

function checkTcpPort(host = "127.0.0.1", port = 5432, timeoutMs = 80): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    socket.setTimeout(timeoutMs);

    socket.on("connect", () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(true);
      }
    });

    socket.on("timeout", () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.on("error", () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(false);
      }
    });

    try {
      socket.connect(port, host);
    } catch {
      resolve(false);
    }
  });
}

function getDatabaseHostAndPort(): { host: string; port: number } {
  try {
    const rawUrl = process.env.DATABASE_URL;
    if (rawUrl) {
      const parsed = new URL(rawUrl);
      return {
        host: parsed.hostname || "127.0.0.1",
        port: parsed.port ? parseInt(parsed.port, 10) : 5432,
      };
    }
  } catch {
    // Ignore URL parse error
  }
  return { host: "127.0.0.1", port: 5432 };
}

export async function isDatabaseConnected(): Promise<boolean> {
  // Never attempt database connection during Next.js build / CI
  if (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.IS_BUILD_TIME === "true" ||
    process.env.CI === "true"
  ) {
    return false;
  }

  const now = Date.now();
  if (dbReachability && now - dbReachability.checkedAt < PROBE_INTERVAL_MS) {
    return dbReachability.connected;
  }

  const { host, port } = getDatabaseHostAndPort();
  const isPortOpen = await checkTcpPort(host, port, 150);
  if (!isPortOpen) {
    dbReachability = { connected: false, checkedAt: now };
    return false;
  }

  try {
    const probe = prisma.$queryRaw`SELECT 1`;
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Database probe timeout")), 300)
    );
    await Promise.race([probe, timeout]);
    dbReachability = { connected: true, checkedAt: now };
    return true;
  } catch {
    dbReachability = { connected: false, checkedAt: now };
    return false;
  }
}

// Pre-hashed passwords for seed users ("admin123", "manager123", etc.)
const DEFAULT_SEED_USERS: StoredUser[] = [
  // STAFF MEMBERS
  {
    id: "usr_admin_001",
    name: "System Administrator",
    email: "admin@fnetwater.com",
    phone: "0241000001",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: "2026-01-10T08:00:00.000Z",
  },
  {
    id: "usr_manager_001",
    name: "Operations Manager",
    email: "manager@fnetwater.com",
    phone: "0241000002",
    passwordHash: bcrypt.hashSync("manager123", 10),
    role: "MANAGER",
    status: "ACTIVE",
    createdAt: "2026-01-15T09:30:00.000Z",
  },
  {
    id: "usr_driver_001",
    name: "Kwame Mensah",
    email: "driver@fnetwater.com",
    phone: "0241000003",
    passwordHash: bcrypt.hashSync("driver123", 10),
    role: "DRIVER",
    status: "ACTIVE",
    createdAt: "2026-02-01T10:00:00.000Z",
  },
  {
    id: "usr_driver_002",
    name: "Emmanuel Tetteh",
    email: "emmanuel@fnetwater.com",
    phone: "0241000006",
    passwordHash: bcrypt.hashSync("driver123", 10),
    role: "DRIVER",
    status: "ACTIVE",
    createdAt: "2026-02-10T11:15:00.000Z",
  },
  {
    id: "usr_agent_001",
    name: "Kofi Boateng",
    email: "agent@fnetwater.com",
    phone: "0241000004",
    passwordHash: bcrypt.hashSync("agent123", 10),
    role: "AGENT",
    status: "ACTIVE",
    createdAt: "2026-02-12T14:20:00.000Z",
  },
  {
    id: "usr_agent_002",
    name: "Abena Asantewaa",
    email: "abena@fnetwater.com",
    phone: "0241000007",
    passwordHash: bcrypt.hashSync("agent123", 10),
    role: "AGENT",
    status: "ACTIVE",
    createdAt: "2026-02-18T16:45:00.000Z",
  },

  // CUSTOMERS (Separated for dedicated Customer Directory)
  {
    id: "usr_customer_001",
    name: "Ama Osei",
    email: "customer@fnetwater.com",
    phone: "0241000005",
    passwordHash: bcrypt.hashSync("customer123", 10),
    role: "CUSTOMER",
    status: "ACTIVE",
    createdAt: "2026-02-20T12:00:00.000Z",
    customerCode: "CUST-2041",
    bottlesHeld: 3,
    dispenserPlan: "Smart Rent-to-Own",
    deliveryArea: "East Legon, Accra",
  },
  {
    id: "usr_customer_002",
    name: "Kwabena Appiah",
    email: "kwabena@example.com",
    phone: "0241000008",
    passwordHash: bcrypt.hashSync("customer123", 10),
    role: "CUSTOMER",
    status: "ACTIVE",
    createdAt: "2026-02-25T15:10:00.000Z",
    customerCode: "CUST-4119",
    bottlesHeld: 2,
    dispenserPlan: "Standard Hot/Cold",
    deliveryArea: "Cantonments, Accra",
  },
  {
    id: "usr_customer_003",
    name: "Nana Yeboah",
    email: "nana@example.com",
    phone: "0241000009",
    passwordHash: bcrypt.hashSync("customer123", 10),
    role: "CUSTOMER",
    status: "ACTIVE",
    createdAt: "2026-03-01T09:00:00.000Z",
    customerCode: "CUST-6892",
    bottlesHeld: 4,
    dispenserPlan: "None (Refill Only)",
    deliveryArea: "Ridge, Accra",
  },
  {
    id: "usr_customer_004",
    name: "Grace Darko",
    email: "grace@example.com",
    phone: "0241000010",
    passwordHash: bcrypt.hashSync("customer123", 10),
    role: "CUSTOMER",
    status: "ACTIVE",
    createdAt: "2026-03-05T13:40:00.000Z",
    customerCode: "CUST-1033",
    bottlesHeld: 2,
    dispenserPlan: "Smart Rent-to-Own",
    deliveryArea: "Dzorwulu, Accra",
  },
  {
    id: "usr_customer_005",
    name: "Samuel Annan",
    email: "samuel@example.com",
    phone: "0241000011",
    passwordHash: bcrypt.hashSync("customer123", 10),
    role: "CUSTOMER",
    status: "ACTIVE",
    createdAt: "2026-03-10T17:20:00.000Z",
    customerCode: "CUST-5510",
    bottlesHeld: 1,
    dispenserPlan: "None (Refill Only)",
    deliveryArea: "Osu, Accra",
  },
];

// In-memory OTP storage
interface OtpRecord {
  code: string;
  expiresAt: number;
  isVerified: boolean;
}

const globalForAuth = globalThis as unknown as {
  memoryUsers?: Map<string, StoredUser>;
  memoryOtps?: Map<string, OtpRecord>;
};

const memoryUsers: Map<string, StoredUser> = (() => {
  if (globalForAuth.memoryUsers) {
    for (const u of DEFAULT_SEED_USERS) {
      if (!globalForAuth.memoryUsers.has(u.id)) {
        globalForAuth.memoryUsers.set(u.id, { ...u });
      }
    }
    return globalForAuth.memoryUsers;
  }
  const map = new Map<string, StoredUser>(DEFAULT_SEED_USERS.map((u) => [u.id, { ...u }]));
  if (process.env.NODE_ENV !== "production") {
    globalForAuth.memoryUsers = map;
  }
  return map;
})();

const memoryOtps = globalForAuth.memoryOtps ?? new Map<string, OtpRecord>();

if (process.env.NODE_ENV !== "production") {
  globalForAuth.memoryUsers = memoryUsers;
  globalForAuth.memoryOtps = memoryOtps;
}

/**
 * Saves an OTP record
 */
export async function storeOtp(
  phone: string,
  code: string,
  ttlMinutes = 10
): Promise<void> {
  const normalized = normalizeGhanaPhone(phone);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  // Store in memory instantly
  memoryOtps.set(normalized, {
    code,
    expiresAt: expiresAt.getTime(),
    isVerified: false,
  });

  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      await prisma.otpVerification.create({
        data: {
          phone: normalized,
          otpCode: code,
          expiresAt,
          isVerified: false,
        },
      });
    } catch {
      // Fallback kept in memory
    }
  }
}

/**
 * Validates an OTP code
 */
export async function verifyStoredOtp(
  phone: string,
  code: string
): Promise<boolean> {
  const normalized = normalizeGhanaPhone(phone);

  // Check memory store instantly
  const record = memoryOtps.get(normalized);
  const now = Date.now();

  if (record && record.code === code && record.expiresAt > now) {
    record.isVerified = true;
    return true;
  }

  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const dbRecord = await prisma.otpVerification.findFirst({
        where: {
          phone: normalized,
          otpCode: code,
          expiresAt: { gt: new Date() },
          isVerified: false,
        },
        orderBy: { createdAt: "desc" },
      });

      if (dbRecord) {
        await prisma.otpVerification.update({
          where: { id: dbRecord.id },
          data: { isVerified: true },
        });
        return true;
      }
    } catch {
      // Database offline
    }
  }

  return false;
}

/**
 * Finds user by Email or Ghana Phone with instant response
 */
export async function findUserByIdentifier(identifier: string): Promise<StoredUser | null> {
  const trimmed = identifier.trim();
  const normalizedPhone = normalizeGhanaPhone(trimmed);

  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: trimmed, mode: "insensitive" } },
            { phone: trimmed },
            { phone: normalizedPhone },
          ],
        },
      });

      if (dbUser) {
        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          phone: dbUser.phone,
          passwordHash: dbUser.password,
          role: dbUser.role as RoleType,
          status: dbUser.status as StatusType,
          createdAt: dbUser.createdAt.toISOString(),
        };
      }
    } catch {
      // Fall through to memory
    }
  }

  // Fallback to memory store
  for (const user of memoryUsers.values()) {
    if (
      user.email.toLowerCase() === trimmed.toLowerCase() ||
      user.phone === trimmed ||
      user.phone === normalizedPhone
    ) {
      return user;
    }
  }

  return null;
}

/**
 * Creates a new user in database and memory
 */
export async function registerNewUser(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: RoleType;
  referralCode?: string;
  customerCode?: string;
  bottlesHeld?: number;
  dispenserPlan?: string;
  deliveryArea?: string;
}): Promise<StoredUser> {
  const normalizedPhone = normalizeGhanaPhone(data.phone);
  const passwordHash = await bcrypt.hash(data.password, 10);
  const role: RoleType = data.role || "CUSTOMER";
  const id = `usr_${Date.now()}`;

  const isCustomer = role === "CUSTOMER";
  const custCode = data.customerCode || (isCustomer ? `CUST-${Math.floor(1000 + Math.random() * 9000)}` : undefined);

  const newUser: StoredUser = {
    id,
    name: data.name,
    email: data.email.toLowerCase(),
    phone: normalizedPhone,
    passwordHash,
    role,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    customerCode: custCode,
    bottlesHeld: data.bottlesHeld ?? (isCustomer ? 0 : undefined),
    dispenserPlan: data.dispenserPlan ?? (isCustomer ? "None" : undefined),
    deliveryArea: data.deliveryArea,
  };

  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const created = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          phone: normalizedPhone,
          password: passwordHash,
          role,
          status: "ACTIVE",
          customerProfile:
            role === "CUSTOMER"
              ? {
                  create: {
                    customerCode: custCode!,
                    referralCode: `FNW-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
                    bottlesHeld: data.bottlesHeld ?? 0,
                  },
                }
              : undefined,
        },
      });

      newUser.id = created.id;
    } catch {
      // Memory fallback active
    }
  }

  memoryUsers.set(newUser.id, newUser);
  return newUser;
}

/**
 * Gets staff users only (ADMIN, MANAGER, DRIVER, AGENT)
 * Excludes customers so the staff table is strictly operational.
 */
export async function getStaffList(): Promise<StoredUser[]> {
  const staffRoles: RoleType[] = ["ADMIN", "MANAGER", "DRIVER", "AGENT"];

  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const dbUsers = await prisma.user.findMany({
        where: { role: { in: staffRoles } },
        orderBy: { createdAt: "desc" },
      });

      if (dbUsers.length > 0) {
        return dbUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          passwordHash: u.password,
          role: u.role as RoleType,
          status: u.status as StatusType,
          createdAt: u.createdAt.toISOString(),
        }));
      }
    } catch {
      // Memory fallback active
    }
  }

  return Array.from(memoryUsers.values()).filter((u) => staffRoles.includes(u.role));
}

/**
 * Gets customers only (CUSTOMER) with dedicated profile details
 */
export async function getCustomersList(): Promise<StoredUser[]> {
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const dbUsers = await prisma.user.findMany({
        where: { role: "CUSTOMER" },
        include: {
          customerProfile: true,
        },
        orderBy: { createdAt: "desc" },
      });

      if (dbUsers.length > 0) {
        return dbUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          passwordHash: u.password,
          role: "CUSTOMER",
          status: u.status as StatusType,
          createdAt: u.createdAt.toISOString(),
          customerCode: u.customerProfile?.customerCode || `CUST-${u.id.slice(-4)}`,
          bottlesHeld: u.customerProfile?.bottlesHeld ?? 0,
          dispenserPlan: "Refill Standard",
        }));
      }
    } catch {
      // Memory fallback
    }
  }

  return Array.from(memoryUsers.values()).filter((u) => u.role === "CUSTOMER");
}

/**
 * Legacy support for all users
 */
export async function getAllUsersList(): Promise<StoredUser[]> {
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const dbUsers = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
      });

      if (dbUsers.length > 0) {
        return dbUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          passwordHash: u.password,
          role: u.role as RoleType,
          status: u.status as StatusType,
          createdAt: u.createdAt.toISOString(),
        }));
      }
    } catch {
      // Database offline
    }
  }

  return Array.from(memoryUsers.values());
}

/**
 * Updates a user's status (ACTIVE / INACTIVE)
 */
export async function updateUserStatus(
  userId: string,
  status: StatusType
): Promise<StoredUser | null> {
  // Primary administrator account can never be deactivated
  if (userId === "usr_admin_001") {
    return null;
  }
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { status },
      });

      return {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        passwordHash: updated.password,
        role: updated.role as RoleType,
        status: updated.status as StatusType,
        createdAt: updated.createdAt.toISOString(),
      };
    } catch {
      // Memory fallback
    }
  }

  const user = memoryUsers.get(userId);
  if (user) {
    user.status = status;
    memoryUsers.set(userId, { ...user });
    return user;
  }

  return null;
}

/**
 * Updates user profile details (Name, Email, Phone, Role, Delivery/Office Area)
 */
export async function updateUserDetails(
  userId: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    role?: RoleType;
    deliveryArea?: string;
  }
): Promise<StoredUser | null> {
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          email: data.email?.toLowerCase(),
          phone: data.phone ? normalizeGhanaPhone(data.phone) : undefined,
          role: data.role,
        },
      });

      return {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        passwordHash: updated.password,
        role: updated.role as RoleType,
        status: updated.status as StatusType,
        createdAt: updated.createdAt.toISOString(),
        deliveryArea: data.deliveryArea,
      };
    } catch {
      // Memory fallback
    }
  }

  const user = memoryUsers.get(userId);
  if (user) {
    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email.toLowerCase();
    if (data.phone) user.phone = normalizeGhanaPhone(data.phone);
    if (data.role) user.role = data.role;
    if (data.deliveryArea !== undefined) user.deliveryArea = data.deliveryArea;
    memoryUsers.set(userId, { ...user });
    return user;
  }

  return null;
}

/**
 * Gets a user by their unique ID
 */
export async function getUserById(userId: string): Promise<StoredUser | null> {
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { customerProfile: true },
      });
      if (dbUser) {
        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          phone: dbUser.phone,
          passwordHash: dbUser.password,
          role: dbUser.role as RoleType,
          status: dbUser.status as StatusType,
          createdAt: dbUser.createdAt.toISOString(),
          customerCode: dbUser.customerProfile?.customerCode,
          bottlesHeld: dbUser.customerProfile?.bottlesHeld,
          dispenserPlan: "Refill Standard",
        };
      }
    } catch {
      // Fall through to memory
    }
  }

  const user = memoryUsers.get(userId);
  return user ? { ...user } : null;
}

/**
 * Updates a user's password
 */
export async function updateUserPassword(
  userId: string,
  plainPassword: string
): Promise<boolean> {
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { password: passwordHash },
      });
      return true;
    } catch {
      // Memory fallback
    }
  }

  const user = memoryUsers.get(userId);
  if (user) {
    user.passwordHash = passwordHash;
    memoryUsers.set(userId, { ...user });
    return true;
  }

  return false;
}

/**
 * Deletes a user
 */
export async function deleteUserRecord(userId: string): Promise<boolean> {
  // Primary administrator account can never be deleted
  if (userId === "usr_admin_001") {
    return false;
  }
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      await prisma.user.delete({
        where: { id: userId },
      });
      memoryUsers.delete(userId);
      return true;
    } catch {
      // Memory fallback
    }
  }

  if (memoryUsers.has(userId)) {
    memoryUsers.delete(userId);
    return true;
  }

  return false;
}
