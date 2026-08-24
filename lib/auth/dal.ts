import "server-only";

import { cache } from "react";

import { cookies } from "next/headers";
import { forbidden, unauthorized } from "next/navigation";

import { prisma } from "@/lib/db";
import { UserRole } from "@/lib/generated/prisma/enums";
import { hasAllPermissions, hasPermission, type Permission } from "@/lib/permissions";

import {
  SESSION_COOKIE,
  resolveSession,
  verifySessionCookie,
  type ResolvedSession,
} from "./session";

/**
 * Data Access Layer.
 *
 * This is the authorization chokepoint. Pages, Server Actions and Route
 * Handlers all resolve the actor here, so no entry point can accidentally skip
 * the check. The proxy performs an optimistic cookie check for redirects, but
 * it is not a security boundary: Server Functions are POSTs to the route that
 * declares them, so a matcher change could silently remove proxy coverage.
 */

export type Actor = ResolvedSession & {
  /** Profile id for the actor's role, when one exists. */
  customerId: string | null;
  driverId: string | null;
  agentId: string | null;
  staffId: string | null;
};

/**
 * Resolves the current actor, or null when unauthenticated.
 *
 * Wrapped in React `cache()` so that a page which checks authorization in
 * several components still performs a single database round trip per request.
 */
export const getActor = cache(async (): Promise<Actor | null> => {
  const cookieStore = await cookies();
  const payload = await verifySessionCookie(
    cookieStore.get(SESSION_COOKIE)?.value,
  );

  if (!payload) return null;

  const session = await resolveSession(payload);
  if (!session) return null;

  const profiles = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      customerProfile: { select: { id: true } },
      driverProfile: { select: { id: true } },
      agentProfile: { select: { id: true } },
      staffProfile: { select: { id: true } },
    },
  });

  return {
    ...session,
    customerId: profiles?.customerProfile?.id ?? null,
    driverId: profiles?.driverProfile?.id ?? null,
    agentId: profiles?.agentProfile?.id ?? null,
    staffId: profiles?.staffProfile?.id ?? null,
  };
});

/** True when a valid session exists. Never used as an authorization decision. */
export async function isAuthenticated(): Promise<boolean> {
  return (await getActor()) !== null;
}

/**
 * Requires a signed-in actor. Triggers the 401 interrupt otherwise.
 *
 * `unauthorized()` throws, so callers must not wrap it in try/catch without
 * re-throwing via `unstable_rethrow`.
 */
export async function requireActor(): Promise<Actor> {
  const actor = await getActor();

  if (!actor) {
    unauthorized();
  }

  return actor;
}

/** Requires one of the given roles. Triggers the 403 interrupt otherwise. */
export async function requireRole(
  ...roles: readonly UserRole[]
): Promise<Actor> {
  const actor = await requireActor();

  if (!roles.includes(actor.role)) {
    forbidden();
  }

  return actor;
}

/** Requires a capability from the RBAC matrix. */
export async function requirePermission(
  ...permissions: readonly Permission[]
): Promise<Actor> {
  const actor = await requireActor();

  if (!hasAllPermissions(actor.role, permissions)) {
    forbidden();
  }

  return actor;
}

/** Non-throwing capability probe, for conditionally rendering UI affordances. */
export async function can(permission: Permission): Promise<boolean> {
  const actor = await getActor();
  return actor ? hasPermission(actor.role, permission) : false;
}

// --- Role-specific helpers -------------------------------------------------
// Each returns the actor together with the profile id that scoping needs, so a
// caller cannot forget to narrow queries to the actor's own records.

export async function requireCustomer(): Promise<Actor & { customerId: string }> {
  const actor = await requireRole(UserRole.CUSTOMER);

  if (!actor.customerId) {
    // A customer account without a profile is a data integrity fault, not a
    // routine authorization failure.
    throw new Error(
      `Customer user ${actor.userId} has no customer profile.`,
    );
  }

  return actor as Actor & { customerId: string };
}

export async function requireDriver(): Promise<Actor & { driverId: string }> {
  const actor = await requireRole(UserRole.DRIVER, UserRole.ADMINISTRATOR);

  if (!actor.driverId) {
    forbidden();
  }

  return actor as Actor & { driverId: string };
}

export async function requireAgent(): Promise<Actor & { agentId: string }> {
  const actor = await requireRole(UserRole.AGENT, UserRole.ADMINISTRATOR);

  if (!actor.agentId) {
    forbidden();
  }

  return actor as Actor & { agentId: string };
}

export async function requireManager(): Promise<Actor> {
  return requireRole(UserRole.ADMINISTRATOR, UserRole.MANAGER);
}

export async function requireAdministrator(): Promise<Actor> {
  return requireRole(UserRole.ADMINISTRATOR);
}

/**
 * Ownership assertion for customer-scoped records.
 *
 * A capability check alone leaves the IDOR class of bug open: a customer with
 * `order:read:own` could otherwise pass another customer's order id. Staff who
 * hold an `:any` capability bypass this narrowing.
 */
export function assertCustomerScope(
  actor: Actor,
  recordCustomerId: string,
): void {
  if (actor.role === UserRole.ADMINISTRATOR || actor.role === UserRole.MANAGER) {
    return;
  }

  if (actor.customerId && actor.customerId === recordCustomerId) {
    return;
  }

  forbidden();
}

/** Ownership assertion for driver-scoped records such as assigned deliveries. */
export function assertDriverScope(
  actor: Actor,
  recordDriverId: string | null,
): void {
  if (actor.role === UserRole.ADMINISTRATOR || actor.role === UserRole.MANAGER) {
    return;
  }

  if (actor.driverId && recordDriverId && actor.driverId === recordDriverId) {
    return;
  }

  forbidden();
}
