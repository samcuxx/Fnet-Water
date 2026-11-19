import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { getUserById, type StoredUser } from "@/lib/auth-store";
import { getCustomerProfile } from "@/lib/customer-store";
import { getDriverProfile } from "@/lib/dispatch-store";
import { getAgentStats } from "@/lib/referral-store";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fnet-water-mobile-secret-dev-2026-very-secure";
export const ACCESS_TOKEN_TTL_SECONDS = 86400; // 24 hours
const ACCESS_TOKEN_TTL = "1d";
const REFRESH_TOKEN_TTL = "30d";

export type MobileRole = "CUSTOMER" | "DRIVER" | "AGENT";
export type AllRole = MobileRole | "ADMIN" | "MANAGER";

export const MOBILE_ALLOWED_ROLES: MobileRole[] = ["CUSTOMER", "DRIVER", "AGENT"];

export interface MobileJwtPayload {
  sub: string;
  id: string;
  role: AllRole;
  phone: string;
  name: string;
  email?: string;
  type?: "access" | "refresh";
}

export function isMobileAllowedRole(role?: string | null): role is MobileRole {
  return !!role && (MOBILE_ALLOWED_ROLES as string[]).includes(role);
}

/**
 * Standard Success Envelope
 */
export function mobileSuccess<T = unknown>(
  data: T,
  statusCode = 200,
  message = "Operation completed successfully."
) {
  return NextResponse.json(
    {
      success: true,
      statusCode,
      message,
      data,
    },
    { status: statusCode }
  );
}

/**
 * Standard Error Envelope
 */
export function mobileError(
  error: string,
  message: string,
  statusCode = 400,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      statusCode,
      error,
      message,
      ...(details !== undefined ? { details } : {}),
    },
    { status: statusCode }
  );
}

/**
 * Sign Mobile Access Token (JWT)
 */
export function signMobileAccessToken(user: {
  id: string;
  role: string;
  phone: string;
  name: string;
  email?: string;
}): string {
  const payload: MobileJwtPayload = {
    sub: user.id,
    id: user.id,
    role: user.role as AllRole,
    phone: user.phone,
    name: user.name,
    email: user.email,
    type: "access",
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

/**
 * Sign Mobile Refresh Token (JWT)
 */
export function signMobileRefreshToken(user: { id: string }): string {
  return jwt.sign(
    {
      sub: user.id,
      id: user.id,
      type: "refresh",
    },
    JWT_SECRET,
    {
      expiresIn: REFRESH_TOKEN_TTL,
    }
  );
}

/**
 * Verify and decode a JWT token
 */
export function verifyMobileToken(token: string): MobileJwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as MobileJwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Build consistent mobile user payload enriched with role-specific profile
 */
export async function buildMobileUserPayload(user: StoredUser, originUrl?: string) {
  const origin = originUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const avatarFullUrl = user.avatar
    ? user.avatar.startsWith("http://") ||
      user.avatar.startsWith("https://") ||
      user.avatar.startsWith("data:")
      ? user.avatar
      : `${origin.replace(/\/+$/, "")}${user.avatar.startsWith("/") ? "" : "/"}${user.avatar}`
    : null;

  const base = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    deliveryArea: user.deliveryArea || "East Legon, Accra",
    avatar: user.avatar || null,
    avatarUrl: avatarFullUrl || user.avatar || null,
    createdAt: user.createdAt,
  };

  if (user.role === "CUSTOMER") {
    const profile = await getCustomerProfile(user.id);
    return {
      ...base,
      customerCode: profile.customerCode,
      customerProfile: {
        id: profile.id,
        customerCode: profile.customerCode,
        ghanaCardNumber: profile.ghanaCardNumber || null,
        bottlesHeld: profile.bottlesHeld,
        freeBottleBalance: profile.freeBottleBalance,
        referralCode: profile.referralCode,
        totalReferrals: profile.totalReferrals,
        dispenserPlan: profile.dispenserPlan,
        dispenserPaidMonths: profile.dispenserPaidMonths,
        dispenserTotalMonths: profile.dispenserTotalMonths,
      },
    };
  }

  if (user.role === "DRIVER") {
    const driver = await getDriverProfile(user.id);
    return {
      ...base,
      driverProfile: {
        vanNumber: driver?.vanNumber || "Van 01",
        licensePlate: driver?.licensePlate || "GT-4421-23",
        isAvailable: driver?.isAvailable ?? true,
      },
    };
  }

  if (user.role === "AGENT") {
    const stats = await getAgentStats(user.id, originUrl);
    return {
      ...base,
      agentProfile: {
        agentCode: stats.agentCode,
        referralLink: stats.referralLink,
        commissionPerRefillGHS: 5.0,
      },
    };
  }

  return base;
}

/**
 * Guard utility for Next.js Route Handlers.
 * Extracts Bearer token, verifies signature, strictly enforces mobile-only roles (CUSTOMER, DRIVER, AGENT),
 * and checks active user status.
 */
export async function verifyMobileAuth(
  req: Request,
  allowedRoles: MobileRole[] = MOBILE_ALLOWED_ROLES
): Promise<
  | { ok: true; user: MobileJwtPayload; dbUser: StoredUser }
  | { ok: false; response: NextResponse }
> {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      ok: false,
      response: mobileError(
        "UNAUTHORIZED",
        "Missing or malformed Authorization header. Bearer token required.",
        401
      ),
    };
  }

  const token = authHeader.substring(7).trim();
  const payload = verifyMobileToken(token);

  if (!payload || payload.type !== "access") {
    return {
      ok: false,
      response: mobileError(
        "INVALID_TOKEN",
        "Access token is invalid or has expired. Please refresh your session.",
        401
      ),
    };
  }

  // Strictly block web-only roles (ADMIN / MANAGER) from mobile endpoints
  if (!isMobileAllowedRole(payload.role)) {
    return {
      ok: false,
      response: mobileError(
        "ROLE_NOT_ALLOWED_ON_MOBILE",
        "Admin and Manager accounts must use the web portal.",
        403
      ),
    };
  }

  // Check endpoint-specific role authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
    return {
      ok: false,
      response: mobileError(
        "FORBIDDEN",
        `Access denied. Role '${payload.role}' is not authorized for this action.`,
        403
      ),
    };
  }

  // Verify user still exists and is active
  const dbUser = await getUserById(payload.id || payload.sub);
  if (!dbUser) {
    return {
      ok: false,
      response: mobileError("USER_NOT_FOUND", "User account no longer exists.", 401),
    };
  }

  if (dbUser.status === "INACTIVE") {
    return {
      ok: false,
      response: mobileError(
        "ACCOUNT_DEACTIVATED",
        "Your account has been deactivated. Please contact support.",
        403
      ),
    };
  }

  return { ok: true, user: payload, dbUser };
}

/**
 * Helper to resolve request origin cleanly
 */
export function getRequestOrigin(request: Request): string {
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (host) {
    const proto =
      request.headers.get("x-forwarded-proto") ||
      (host.includes("localhost") || host.includes("127.0.0.1")
        ? "http"
        : "https");
    return `${proto}://${host}`;
  }
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}
