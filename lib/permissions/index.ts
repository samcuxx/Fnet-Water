import { UserRole } from "@/lib/generated/prisma/enums";

/**
 * Role-based access control for F Net Water Hub.
 *
 * This module answers one question only: *may this role perform this kind of
 * operation?* It deliberately does not answer *may this actor touch this
 * particular record?* — that ownership/scope question is settled in the
 * service layer, because a customer holding `order:read:own` must still be
 * prevented from reading someone else's order.
 *
 * The matrix mirrors docs/BUSINESS_RULES.md §9. Both must change together.
 */

export const PERMISSIONS = [
  // Users and accounts
  "user:read:any",
  "user:read:own",
  "user:create",
  "user:update:any",
  "user:update:own",
  "user:deactivate",

  // Customers
  "customer:read:any",
  "customer:read:scope",
  "customer:create",
  "customer:update:any",

  // Products
  "product:read",
  "product:manage",

  // Orders
  "order:read:any",
  "order:read:scope",
  "order:read:own",
  "order:create:own",
  "order:create:for-customer",
  "order:update-status",
  "order:cancel:own",
  "order:cancel:any",
  "order:assign-driver",

  // Deliveries
  "delivery:read:any",
  "delivery:read:assigned",
  "delivery:read:own",
  "delivery:update-status",
  "delivery:record-exchange",
  "delivery:record-failure",
  "delivery:reconcile",

  // Bottles and inventory
  "inventory:read",
  "inventory:read:assigned",
  "inventory:adjust",
  "inventory:adjust:approve",
  "bottle:balance:read:own",
  "bottle:shortage:resolve",
  "bottle:shortage:write-off",

  // Dispensers
  "dispenser:read:any",
  "dispenser:read:own",
  "dispenser:manage",
  "dispenser:install",
  "dispenser:report-fault",
  "dispenser:transfer-ownership",
  "installment:read:any",
  "installment:read:own",
  "installment:manage",

  // Payments
  "payment:read:any",
  "payment:read:own",
  "payment:create:own",
  "payment:record-cash",
  "payment:reconcile",
  "payment:reverse",
  "payment:refund",

  // Referrals and rewards
  "referral:read:any",
  "referral:read:scope",
  "referral:read:own",
  "reward:redeem:own",
  "reward:adjust",

  // Reports
  "report:operational",
  "report:financial",
  "report:agent:own",

  // System
  "settings:read",
  "settings:manage",
  "audit:read",
  "tracker:read",
  "tracker:acknowledge-alert",
  "notification:read:own",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** Permissions every authenticated user holds, whatever their role. */
const COMMON: Permission[] = [
  "user:read:own",
  "user:update:own",
  "product:read",
  "notification:read:own",
];

const CUSTOMER: Permission[] = [
  ...COMMON,
  "order:read:own",
  "order:create:own",
  "order:cancel:own",
  "delivery:read:own",
  "bottle:balance:read:own",
  "dispenser:read:own",
  "dispenser:report-fault",
  "installment:read:own",
  "payment:read:own",
  "payment:create:own",
  "referral:read:own",
  "reward:redeem:own",
];

const DRIVER: Permission[] = [
  ...COMMON,
  // Scoped to assigned deliveries only; enforced in services/deliveries.
  "customer:read:scope",
  "order:read:scope",
  "delivery:read:assigned",
  "delivery:update-status",
  "delivery:record-exchange",
  "delivery:record-failure",
  "inventory:read:assigned",
  "payment:record-cash",
];

const AGENT: Permission[] = [
  ...COMMON,
  "customer:read:scope",
  "customer:create",
  "order:read:scope",
  "order:create:for-customer",
  "referral:read:scope",
  "report:agent:own",
];

const MANAGER: Permission[] = [
  ...COMMON,
  "user:read:any",
  "customer:read:any",
  "customer:create",
  "customer:update:any",
  "product:manage",
  "order:read:any",
  "order:create:for-customer",
  "order:update-status",
  "order:cancel:any",
  "order:assign-driver",
  "delivery:read:any",
  "delivery:update-status",
  "delivery:record-exchange",
  "delivery:record-failure",
  "delivery:reconcile",
  "inventory:read",
  // Large adjustments are held for administrator approval; see
  // ADMIN_APPROVAL_REQUIRED below.
  "inventory:adjust",
  "bottle:shortage:resolve",
  "dispenser:read:any",
  "dispenser:manage",
  "dispenser:install",
  "dispenser:report-fault",
  "installment:read:any",
  "installment:manage",
  "payment:read:any",
  "payment:record-cash",
  "payment:reconcile",
  "payment:reverse",
  "payment:refund",
  "referral:read:any",
  "report:operational",
  "report:financial",
  "settings:read",
  "audit:read",
  "tracker:read",
  "tracker:acknowledge-alert",
];

const ADMINISTRATOR: Permission[] = [
  ...PERMISSIONS,
];

const MATRIX: Record<UserRole, ReadonlySet<Permission>> = {
  [UserRole.ADMINISTRATOR]: new Set(ADMINISTRATOR),
  [UserRole.MANAGER]: new Set(MANAGER),
  [UserRole.AGENT]: new Set(AGENT),
  [UserRole.DRIVER]: new Set(DRIVER),
  [UserRole.CUSTOMER]: new Set(CUSTOMER),
};

/**
 * Operations that only an administrator may finalise, even when a manager can
 * initiate them. Listed explicitly so the sensitive set is auditable in one
 * place rather than inferred from the matrix.
 */
export const ADMIN_ONLY_OPERATIONS: readonly Permission[] = [
  "user:create",
  "user:update:any",
  "user:deactivate",
  "inventory:adjust:approve",
  "bottle:shortage:write-off",
  "dispenser:transfer-ownership",
  "reward:adjust",
  "settings:manage",
];

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return MATRIX[role]?.has(permission) ?? false;
}

export function hasAnyPermission(
  role: UserRole,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(
  role: UserRole,
  permissions: readonly Permission[],
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

export function permissionsFor(role: UserRole): Permission[] {
  return [...(MATRIX[role] ?? [])];
}

/** Staff roles see operational dashboards; customers do not. */
export const STAFF_ROLES: readonly UserRole[] = [
  UserRole.ADMINISTRATOR,
  UserRole.MANAGER,
  UserRole.AGENT,
  UserRole.DRIVER,
];

export function isStaff(role: UserRole): boolean {
  return STAFF_ROLES.includes(role);
}

/** The portal a role lands on after signing in. */
export const ROLE_HOME: Record<UserRole, string> = {
  [UserRole.ADMINISTRATOR]: "/admin",
  [UserRole.MANAGER]: "/manager",
  [UserRole.AGENT]: "/agent",
  [UserRole.DRIVER]: "/driver",
  [UserRole.CUSTOMER]: "/customer",
};

/** Route prefix ownership, used by proxy.ts for optimistic gating. */
export const ROLE_ROUTE_PREFIX: Record<string, UserRole[]> = {
  "/admin": [UserRole.ADMINISTRATOR],
  "/manager": [UserRole.ADMINISTRATOR, UserRole.MANAGER],
  "/agent": [UserRole.ADMINISTRATOR, UserRole.AGENT],
  "/driver": [UserRole.ADMINISTRATOR, UserRole.DRIVER],
  "/customer": [UserRole.CUSTOMER],
};

export function canAccessPathname(role: UserRole, pathname: string): boolean {
  const entry = Object.entries(ROLE_ROUTE_PREFIX).find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!entry) return true;

  return entry[1].includes(role);
}
