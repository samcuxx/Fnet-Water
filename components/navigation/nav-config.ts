import { UserRole } from "@/lib/generated/prisma/enums";

/**
 * Navigation map per role.
 *
 * Icons are referenced by name rather than by component so this module stays
 * plain serialisable data and can be read from both server and client
 * components. `components/navigation/icons.ts` resolves the names.
 *
 * `soon: true` marks a section whose screens arrive in a later delivery phase.
 * Such items render as visible but inert, so the shape of the product is
 * apparent without the navigation linking to a route that does not exist.
 */

export type NavItem = {
  label: string;
  href: string;
  icon: IconName;
  soon?: boolean;
  /** Matched as a prefix, so nested routes keep the parent item active. */
  exact?: boolean;
};

export type NavSection = {
  /** Omitted for the first, unlabelled group. */
  title?: string;
  items: NavItem[];
};

export type IconName =
  | "activity"
  | "banknote"
  | "boxes"
  | "chart"
  | "clipboard"
  | "cog"
  | "droplets"
  | "gift"
  | "history"
  | "home"
  | "mapPin"
  | "package"
  | "radio"
  | "receipt"
  | "shieldCheck"
  | "truck"
  | "user"
  | "userCheck"
  | "userCog"
  | "users";

const ADMIN: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/admin", icon: "home", exact: true },
      { label: "Customers", href: "/admin/customers", icon: "users", soon: true },
      { label: "Orders", href: "/admin/orders", icon: "package", soon: true },
      { label: "Deliveries", href: "/admin/deliveries", icon: "truck", soon: true },
      { label: "Bottles", href: "/admin/bottles", icon: "droplets", soon: true },
      { label: "Inventory", href: "/admin/inventory", icon: "boxes", soon: true },
      { label: "Dispensers", href: "/admin/dispensers", icon: "clipboard", soon: true },
      { label: "Payments", href: "/admin/payments", icon: "banknote", soon: true },
      {
        label: "Referrals & Rewards",
        href: "/admin/referrals",
        icon: "gift",
        soon: true,
      },
      { label: "Reports", href: "/admin/reports", icon: "chart", soon: true },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Users", href: "/admin/users", icon: "userCog", soon: true },
      { label: "Drivers", href: "/admin/drivers", icon: "truck", soon: true },
      { label: "Agents", href: "/admin/agents", icon: "userCheck", soon: true },
      { label: "Trackers", href: "/admin/trackers", icon: "radio", soon: true },
      { label: "Audit log", href: "/admin/audit", icon: "shieldCheck", soon: true },
      { label: "System settings", href: "/admin/settings", icon: "cog", soon: true },
    ],
  },
];

const MANAGER: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/manager", icon: "home", exact: true },
      { label: "Orders", href: "/manager/orders", icon: "package", soon: true },
      { label: "Deliveries", href: "/manager/deliveries", icon: "truck", soon: true },
      { label: "Customers", href: "/manager/customers", icon: "users", soon: true },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Inventory", href: "/manager/inventory", icon: "boxes", soon: true },
      { label: "Bottles", href: "/manager/bottles", icon: "droplets", soon: true },
      {
        label: "Dispensers",
        href: "/manager/dispensers",
        icon: "clipboard",
        soon: true,
      },
      {
        label: "Installments",
        href: "/manager/installments",
        icon: "receipt",
        soon: true,
      },
      { label: "Payments", href: "/manager/payments", icon: "banknote", soon: true },
      { label: "Reports", href: "/manager/reports", icon: "chart", soon: true },
    ],
  },
];

const AGENT: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/agent", icon: "home", exact: true },
      { label: "My customers", href: "/agent/customers", icon: "users", soon: true },
      { label: "Orders", href: "/agent/orders", icon: "package", soon: true },
      { label: "Referrals", href: "/agent/referrals", icon: "gift", soon: true },
      {
        label: "Performance",
        href: "/agent/performance",
        icon: "chart",
        soon: true,
      },
    ],
  },
];

const DRIVER: NavSection[] = [
  {
    items: [
      { label: "Today", href: "/driver", icon: "home", exact: true },
      { label: "Assigned", href: "/driver/assigned", icon: "clipboard", soon: true },
      { label: "Completed", href: "/driver/completed", icon: "userCheck", soon: true },
      { label: "My stock", href: "/driver/stock", icon: "boxes", soon: true },
      { label: "History", href: "/driver/history", icon: "history", soon: true },
    ],
  },
];

const CUSTOMER: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/customer", icon: "home", exact: true },
      { label: "Order water", href: "/customer/order", icon: "droplets", soon: true },
      { label: "My orders", href: "/customer/orders", icon: "package", soon: true },
      { label: "Deliveries", href: "/customer/deliveries", icon: "truck", soon: true },
      {
        label: "Bottle balance",
        href: "/customer/bottles",
        icon: "activity",
        soon: true,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Dispensers",
        href: "/customer/dispensers",
        icon: "clipboard",
        soon: true,
      },
      { label: "Payments", href: "/customer/payments", icon: "banknote", soon: true },
      { label: "Rewards", href: "/customer/rewards", icon: "gift", soon: true },
      { label: "Referrals", href: "/customer/referrals", icon: "userCheck", soon: true },
      { label: "Addresses", href: "/customer/addresses", icon: "mapPin", soon: true },
      { label: "Profile", href: "/customer/profile", icon: "user", soon: true },
    ],
  },
];

export const NAVIGATION: Record<UserRole, NavSection[]> = {
  [UserRole.ADMINISTRATOR]: ADMIN,
  [UserRole.MANAGER]: MANAGER,
  [UserRole.AGENT]: AGENT,
  [UserRole.DRIVER]: DRIVER,
  [UserRole.CUSTOMER]: CUSTOMER,
};

export function navigationFor(role: UserRole): NavSection[] {
  return NAVIGATION[role] ?? [];
}

/**
 * The handful of destinations promoted to the mobile bottom bar.
 *
 * Drivers and customers work primarily from a phone, so their most frequent
 * destinations are reachable with a thumb rather than through the drawer.
 */
export const MOBILE_BAR: Partial<Record<UserRole, NavItem[]>> = {
  [UserRole.DRIVER]: [
    { label: "Today", href: "/driver", icon: "home", exact: true },
    { label: "Assigned", href: "/driver/assigned", icon: "clipboard", soon: true },
    { label: "Stock", href: "/driver/stock", icon: "boxes", soon: true },
    { label: "History", href: "/driver/history", icon: "history", soon: true },
  ],
  [UserRole.CUSTOMER]: [
    { label: "Home", href: "/customer", icon: "home", exact: true },
    { label: "Order", href: "/customer/order", icon: "droplets", soon: true },
    { label: "Orders", href: "/customer/orders", icon: "package", soon: true },
    { label: "Rewards", href: "/customer/rewards", icon: "gift", soon: true },
  ],
};

export function isActive(
  pathname: string,
  item: Pick<NavItem, "href" | "exact">,
): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
