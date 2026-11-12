"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBag,
  Cpu,
  Boxes,
  Gift,
  Truck,
  LayoutDashboard,
  CreditCard,
  Users,
  Briefcase,
  Bell,
} from "lucide-react";
import type { RoleType } from "@/types/next-auth";

interface DockItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface MobileDockProps {
  role: RoleType;
}

export default function MobileDock({ role }: MobileDockProps) {
  const pathname = usePathname();

  const dockItemsByRole: Record<string, DockItem[]> = {
    CUSTOMER: [
      {
        name: "Home",
        href: "/customer",
        icon: <Home className="size-4 shrink-0" />,
      },
      {
        name: "Order",
        href: "/customer/order",
        icon: <ShoppingBag className="size-4 shrink-0" />,
      },
      {
        name: "Dispensers",
        href: "/customer/dispenser",
        icon: <Cpu className="size-4 shrink-0" />,
      },
      {
        name: "Orders",
        href: "/customer/orders",
        icon: <Boxes className="size-4 shrink-0" />,
      },
      {
        name: "Rewards",
        href: "/customer/referrals",
        icon: <Gift className="size-4 shrink-0" />,
      },
    ],
    DRIVER: [
      {
        name: "Runs",
        href: "/driver",
        icon: <Truck className="size-4 shrink-0" />,
      },
      {
        name: "Alerts",
        href: "/notifications",
        icon: <Bell className="size-4 shrink-0" />,
      },
    ],
    AGENT: [
      {
        name: "Portal",
        href: "/agent",
        icon: <Briefcase className="size-4 shrink-0" />,
      },
      {
        name: "Alerts",
        href: "/notifications",
        icon: <Bell className="size-4 shrink-0" />,
      },
    ],
    MANAGER: [
      {
        name: "Overview",
        href: "/manager",
        icon: <LayoutDashboard className="size-4 shrink-0" />,
      },
      {
        name: "Dispatch",
        href: "/manager/deliveries",
        icon: <Truck className="size-4 shrink-0" />,
      },
      {
        name: "Inventory",
        href: "/manager/inventory",
        icon: <Boxes className="size-4 shrink-0" />,
      },
      {
        name: "Dispensers",
        href: "/manager/dispensers",
        icon: <Cpu className="size-4 shrink-0" />,
      },
    ],
    ADMIN: [
      {
        name: "Dashboard",
        href: "/admin",
        icon: <LayoutDashboard className="size-4 shrink-0" />,
      },
      {
        name: "Dispatch",
        href: "/admin/deliveries",
        icon: <Truck className="size-4 shrink-0" />,
      },
      {
        name: "Inventory",
        href: "/admin/inventory",
        icon: <Boxes className="size-4 shrink-0" />,
      },
      {
        name: "Finance",
        href: "/admin/finance/transactions",
        icon: <CreditCard className="size-4 shrink-0" />,
      },
      {
        name: "Users",
        href: "/admin/users",
        icon: <Users className="size-4 shrink-0" />,
      },
    ],
  };

  const items = dockItemsByRole[role] || dockItemsByRole.CUSTOMER;

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 lg:hidden max-w-[92vw]"
    >
      <div className="bg-card/95 backdrop-blur-xl border border-border shadow-xl rounded-full px-2 py-1.5 flex items-center gap-1 sm:gap-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition active:scale-95 ${
                isActive
                  ? "bg-accent text-accent-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.icon}
              <span className={isActive ? "inline" : "hidden sm:inline"}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
