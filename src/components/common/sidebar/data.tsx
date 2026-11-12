import React from "react";
import {
  AuthIcon,
  ChatIcon,
  HomeIcon,
  InvoiceIcon,
  LetterIcon,
  PieChartIcon,
  TableIcon,
  TaskIcon,
  UserGroupIcon,
  UserIcon,
  Widget4Icon,
  WindowIcon,
} from "./icon";

export interface NavSubItem {
  title: string;
  url: string;
}

export interface NavItemType {
  title: string;
  url?: string;
  icon: React.ReactNode;
  items?: NavSubItem[];
}

export interface NavSection {
  label: string;
  items: NavItemType[];
}

// 1. ADMIN Navigation
export const ADMIN_NAV_DATA: NavSection[] = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Overview",
        url: "/admin",
        icon: <HomeIcon />,
      },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      {
        title: "Orders",
        url: "/admin/orders",
        icon: <TaskIcon />,
      },
      {
        title: "Bottle Exchanges",
        url: "/admin/bottles",
        icon: <TableIcon />,
      },
      {
        title: "Customers",
        url: "/admin/customers",
        icon: <UserGroupIcon />,
      },
      {
        title: "Drivers & Fleet",
        url: "/admin/drivers",
        icon: <Widget4Icon />,
      },
      {
        title: "Reports & Analytics",
        url: "/admin/reports",
        icon: <PieChartIcon />,
      },
    ],
  },
  {
    label: "FINANCE & ASSETS",
    items: [
      {
        title: "Financial Ledger",
        icon: <InvoiceIcon />,
        items: [
          { title: "Revenue & Sales", url: "/admin/finance/transactions" },
          { title: "Dispenser Installments", url: "/admin/finance/installments" },
        ],
      },
      {
        title: "Smart Dispensers",
        url: "/admin/dispensers",
        icon: <WindowIcon />,
      },
      {
        title: "Products Catalog",
        url: "/admin/products",
        icon: <TableIcon />,
      },
    ],
  },
  {
    label: "PORTALS",
    items: [
      {
        title: "Operations Manager",
        url: "/manager",
        icon: <WindowIcon />,
      },
      {
        title: "Driver Dispatch",
        url: "/driver",
        icon: <Widget4Icon />,
      },
      {
        title: "Agents & Supervisors",
        url: "/agent",
        icon: <UserGroupIcon />,
      },
      {
        title: "Customer Portal",
        url: "/customer",
        icon: <ChatIcon />,
      },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      {
        title: "Field Agents Directory",
        url: "/admin/agents",
        icon: <UserIcon />,
      },
      {
        title: "Staff & Users",
        url: "/admin/users",
        icon: <UserIcon />,
      },
      {
        title: "Notifications",
        url: "/notifications",
        icon: <LetterIcon />,
      },
      {
        title: "Profile & Account",
        url: "/profile",
        icon: <AuthIcon />,
      },
    ],
  },
];

// 2. CUSTOMER Navigation
export const CUSTOMER_NAV_DATA: NavSection[] = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "My Portal",
        url: "/customer",
        icon: <HomeIcon />,
      },
      {
        title: "Order Water",
        url: "/customer/order",
        icon: <TaskIcon />,
      },
      {
        title: "My Orders",
        url: "/customer/orders",
        icon: <TableIcon />,
      },
    ],
  },
  {
    label: "DELIVERY & ASSETS",
    items: [
      {
        title: "Address Book",
        url: "/customer/addresses",
        icon: <Widget4Icon />,
      },
      {
        title: "Smart Dispenser",
        url: "/customer/dispenser",
        icon: <WindowIcon />,
      },
      {
        title: "Refer Friends & Rewards",
        url: "/customer/referrals",
        icon: <ChatIcon />,
      },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      {
        title: "Notifications",
        url: "/notifications",
        icon: <LetterIcon />,
      },
      {
        title: "Profile & Settings",
        url: "/profile",
        icon: <AuthIcon />,
      },
    ],
  },
];

// 3. DRIVER Navigation
export const DRIVER_NAV_DATA: NavSection[] = [
  {
    label: "DISPATCH & RUNS",
    items: [
      {
        title: "Delivery Runs",
        url: "/driver",
        icon: <Widget4Icon />,
      },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      {
        title: "Notifications",
        url: "/notifications",
        icon: <LetterIcon />,
      },
      {
        title: "Profile & Account",
        url: "/profile",
        icon: <AuthIcon />,
      },
    ],
  },
];

// 4. AGENT & SUPERVISOR Navigation
export const AGENT_NAV_DATA: NavSection[] = [
  {
    label: "FIELD OPERATIONS",
    items: [
      {
        title: "Agent Portal",
        url: "/agent",
        icon: <HomeIcon />,
      },
      {
        title: "Customers Under Zones",
        url: "/agent#customers",
        icon: <UserGroupIcon />,
      },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      {
        title: "Notifications",
        url: "/notifications",
        icon: <LetterIcon />,
      },
      {
        title: "Profile & Settings",
        url: "/profile",
        icon: <AuthIcon />,
      },
    ],
  },
];

// 5. MANAGER Navigation
export const MANAGER_NAV_DATA: NavSection[] = [
  {
    label: "OPERATIONS",
    items: [
      {
        title: "Operations Overview",
        url: "/manager",
        icon: <HomeIcon />,
      },
      {
        title: "Orders & Dispatch",
        url: "/admin/orders",
        icon: <TaskIcon />,
      },
      {
        title: "Bottle Tracking",
        url: "/admin/bottles",
        icon: <TableIcon />,
      },
      {
        title: "Customers Directory",
        url: "/admin/customers",
        icon: <UserGroupIcon />,
      },
      {
        title: "Drivers & Fleet",
        url: "/admin/drivers",
        icon: <Widget4Icon />,
      },
      {
        title: "Operational Reports",
        url: "/admin/reports",
        icon: <PieChartIcon />,
      },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      {
        title: "Notifications",
        url: "/notifications",
        icon: <LetterIcon />,
      },
      {
        title: "Profile & Settings",
        url: "/profile",
        icon: <AuthIcon />,
      },
    ],
  },
];

export const NAV_DATA = ADMIN_NAV_DATA;

export function getNavDataByRole(role?: string): NavSection[] {
  switch (role) {
    case "CUSTOMER":
      return CUSTOMER_NAV_DATA;
    case "DRIVER":
      return DRIVER_NAV_DATA;
    case "AGENT":
      return AGENT_NAV_DATA;
    case "MANAGER":
      return MANAGER_NAV_DATA;
    case "ADMIN":
    default:
      return ADMIN_NAV_DATA;
  }
}
