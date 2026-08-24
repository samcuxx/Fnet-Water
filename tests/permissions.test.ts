import { describe, expect, it } from "vitest";

import { UserRole } from "@/lib/generated/prisma/enums";
import {
  ADMIN_ONLY_OPERATIONS,
  canAccessPathname,
  hasPermission,
  isStaff,
  permissionsFor,
  ROLE_HOME,
} from "@/lib/permissions";

/**
 * The RBAC matrix is the difference between a driver recording a delivery and a
 * driver adjusting the company's stock. These tests assert the boundaries that
 * the requirements state explicitly.
 */
describe("role capabilities", () => {
  it("gives an administrator every permission", () => {
    const administrator = permissionsFor(UserRole.ADMINISTRATOR);

    for (const permission of ADMIN_ONLY_OPERATIONS) {
      expect(administrator).toContain(permission);
    }
  });

  it("denies a driver global financial and inventory control", () => {
    const denied = [
      "payment:read:any",
      "payment:reverse",
      "payment:refund",
      "inventory:adjust",
      "settings:manage",
      "order:cancel:any",
    ] as const;

    for (const permission of denied) {
      expect(hasPermission(UserRole.DRIVER, permission)).toBe(false);
    }
  });

  it("gives a driver exactly what a delivery round needs", () => {
    const allowed = [
      "delivery:read:assigned",
      "delivery:update-status",
      "delivery:record-exchange",
      "delivery:record-failure",
      "payment:record-cash",
    ] as const;

    for (const permission of allowed) {
      expect(hasPermission(UserRole.DRIVER, permission)).toBe(true);
    }
  });

  it("scopes a customer to their own records only", () => {
    expect(hasPermission(UserRole.CUSTOMER, "order:read:own")).toBe(true);
    expect(hasPermission(UserRole.CUSTOMER, "order:read:any")).toBe(false);
    expect(hasPermission(UserRole.CUSTOMER, "customer:read:any")).toBe(false);
    expect(hasPermission(UserRole.CUSTOMER, "payment:read:any")).toBe(false);
  });

  it("does not let a customer create an order for someone else", () => {
    expect(hasPermission(UserRole.CUSTOMER, "order:create:own")).toBe(true);
    expect(hasPermission(UserRole.CUSTOMER, "order:create:for-customer")).toBe(
      false,
    );
  });

  it("withholds administrator-only operations from a manager", () => {
    for (const permission of ADMIN_ONLY_OPERATIONS) {
      expect(hasPermission(UserRole.MANAGER, permission)).toBe(false);
    }
  });

  it("lets a manager run operations without administrator authority", () => {
    expect(hasPermission(UserRole.MANAGER, "order:assign-driver")).toBe(true);
    expect(hasPermission(UserRole.MANAGER, "delivery:reconcile")).toBe(true);
    expect(hasPermission(UserRole.MANAGER, "inventory:adjust")).toBe(true);
    // Requesting an adjustment is not approving one.
    expect(hasPermission(UserRole.MANAGER, "inventory:adjust:approve")).toBe(
      false,
    );
  });

  it("limits an agent to customer acquisition and referrals", () => {
    expect(hasPermission(UserRole.AGENT, "customer:create")).toBe(true);
    expect(hasPermission(UserRole.AGENT, "order:create:for-customer")).toBe(true);
    expect(hasPermission(UserRole.AGENT, "referral:read:scope")).toBe(true);

    expect(hasPermission(UserRole.AGENT, "inventory:adjust")).toBe(false);
    expect(hasPermission(UserRole.AGENT, "payment:read:any")).toBe(false);
    expect(hasPermission(UserRole.AGENT, "delivery:update-status")).toBe(false);
  });

  it("treats every role except customer as staff", () => {
    expect(isStaff(UserRole.ADMINISTRATOR)).toBe(true);
    expect(isStaff(UserRole.MANAGER)).toBe(true);
    expect(isStaff(UserRole.AGENT)).toBe(true);
    expect(isStaff(UserRole.DRIVER)).toBe(true);
    expect(isStaff(UserRole.CUSTOMER)).toBe(false);
  });
});

describe("route access", () => {
  it("routes each role to its own portal after signing in", () => {
    expect(ROLE_HOME[UserRole.ADMINISTRATOR]).toBe("/admin");
    expect(ROLE_HOME[UserRole.MANAGER]).toBe("/manager");
    expect(ROLE_HOME[UserRole.AGENT]).toBe("/agent");
    expect(ROLE_HOME[UserRole.DRIVER]).toBe("/driver");
    expect(ROLE_HOME[UserRole.CUSTOMER]).toBe("/customer");
  });

  it("keeps a customer out of every staff portal", () => {
    for (const path of ["/admin", "/manager", "/agent", "/driver"]) {
      expect(canAccessPathname(UserRole.CUSTOMER, path)).toBe(false);
    }

    expect(canAccessPathname(UserRole.CUSTOMER, "/customer")).toBe(true);
  });

  it("keeps staff out of the customer portal", () => {
    expect(canAccessPathname(UserRole.MANAGER, "/customer")).toBe(false);
    expect(canAccessPathname(UserRole.DRIVER, "/customer")).toBe(false);
    expect(canAccessPathname(UserRole.AGENT, "/customer")).toBe(false);
  });

  it("applies the prefix to nested routes, not just the root", () => {
    expect(canAccessPathname(UserRole.DRIVER, "/admin/settings")).toBe(false);
    expect(canAccessPathname(UserRole.DRIVER, "/driver/assigned")).toBe(true);
  });

  it("does not gate routes outside the role prefixes", () => {
    for (const path of ["/", "/login", "/register", "/notifications"]) {
      expect(canAccessPathname(UserRole.CUSTOMER, path)).toBe(true);
      expect(canAccessPathname(UserRole.DRIVER, path)).toBe(true);
    }
  });

  it("does not treat a lookalike prefix as a portal route", () => {
    // "/administration" must not match the "/admin" prefix.
    expect(canAccessPathname(UserRole.DRIVER, "/administration")).toBe(true);
  });
});
