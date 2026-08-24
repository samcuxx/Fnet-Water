import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { prisma } from "@/lib/db";
import type { UserRole, UserStatus } from "@/lib/generated/prisma/enums";

/**
 * Session management.
 *
 * Strategy: a database-backed session plus a signed, HTTP-only cookie.
 *
 * A stateless JWT alone cannot satisfy the requirement that an administrator
 * may deactivate an account, because a deactivated user's token would stay
 * valid until it expired. Storing the session server-side makes revocation
 * immediate.
 *
 * Only a SHA-256 hash of the session token is persisted, so a database leak
 * does not hand an attacker usable sessions.
 */

export const SESSION_COOKIE = "fnet_session";

const ALGORITHM = "HS256";

function sessionMaxAgeDays(): number {
  const parsed = Number.parseInt(process.env.SESSION_MAX_AGE_DAYS ?? "7", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 7;
}

function encodedSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET must be set to at least 32 characters. Generate one with: openssl rand -base64 32",
    );
  }

  return new TextEncoder().encode(secret);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type SessionPayload = {
  /** Opaque session token; the database stores only its hash. */
  token: string;
  userId: string;
  role: UserRole;
};

async function sign(payload: SessionPayload, expiresAt: Date): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(encodedSecret());
}

/**
 * Verifies the cookie's signature and shape. Cheap: no database access, so it
 * is safe to call from the proxy on every request.
 */
export async function verifySessionCookie(
  value: string | undefined,
): Promise<SessionPayload | null> {
  if (!value) return null;

  try {
    const { payload } = await jwtVerify(value, encodedSecret(), {
      algorithms: [ALGORITHM],
    });

    const { token, userId, role } = payload as Partial<SessionPayload>;

    if (typeof token !== "string" || typeof userId !== "string" || !role) {
      return null;
    }

    return { token, userId, role };
  } catch {
    // Expired, tampered, or malformed. Treated as "no session".
    return null;
  }
}

export type ResolvedSession = {
  sessionId: string;
  userId: string;
  role: UserRole;
  status: UserStatus;
  fullName: string;
  email: string;
  phone: string;
  code: string;
};

/**
 * Authoritative session check: confirms the session row still exists, has not
 * expired or been revoked, and belongs to an active user.
 */
export async function resolveSession(
  payload: SessionPayload,
): Promise<ResolvedSession | null> {
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(payload.token) },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      revokedAt: true,
      user: {
        select: {
          id: true,
          code: true,
          role: true,
          status: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    return null;
  }

  // The cookie claims a user id; make sure it matches the stored session.
  const claimed = Buffer.from(payload.userId);
  const actual = Buffer.from(session.userId);

  if (
    claimed.length !== actual.length ||
    !timingSafeEqual(claimed, actual)
  ) {
    return null;
  }

  if (session.user.status !== "ACTIVE") {
    return null;
  }

  return {
    sessionId: session.id,
    userId: session.user.id,
    role: session.user.role,
    status: session.user.status,
    fullName: session.user.fullName,
    email: session.user.email,
    phone: session.user.phone,
    code: session.user.code,
  };
}

export type SessionRequestContext = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

/**
 * Issues a new session and writes the cookie.
 *
 * Must be called from a Server Action or Route Handler — Next.js does not
 * permit setting cookies while rendering.
 */
export async function createSession(
  user: { id: string; role: UserRole },
  context: SessionRequestContext = {},
): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() + sessionMaxAgeDays() * 24 * 60 * 60 * 1000,
  );

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt,
      ipAddress: context.ipAddress ?? null,
      userAgent: context.userAgent ?? null,
    },
  });

  const jwt = await sign({ token, userId: user.id, role: user.role }, expiresAt);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Revokes the current session server-side and clears the cookie. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const payload = await verifySessionCookie(
    cookieStore.get(SESSION_COOKIE)?.value,
  );

  if (payload) {
    await prisma.session.updateMany({
      where: { tokenHash: hashToken(payload.token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}

/** Revokes every active session for a user, e.g. on deactivation. */
export async function revokeAllSessions(userId: string): Promise<number> {
  const { count } = await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return count;
}

export async function touchSession(sessionId: string): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: { lastSeenAt: new Date() },
  });
}
