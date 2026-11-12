"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Store,
  Menu,
  Home,
  Boxes,
  MapPin,
  Truck,
  Bell,
  Briefcase,
} from "lucide-react";
import { cn } from "@/utils/cn";
import type { RoleType } from "@/types/next-auth";

interface FloatingNavbarProps {
  role?: RoleType;
  onOpenSidebar: () => void;
}

interface NavItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  matches: (pathname: string) => boolean;
}

export default function FloatingNavbar({ role = "ADMIN", onOpenSidebar }: FloatingNavbarProps) {
  const pathname = usePathname();

  const navItems = useMemo<NavItem[]>(() => {
    switch (role) {
      case "CUSTOMER":
        return [
          {
            id: "customer-home",
            name: "Home",
            href: "/customer",
            icon: Home,
            matches: (p) => p === "/customer",
          },
          {
            id: "customer-order",
            name: "Order",
            href: "/customer/order",
            icon: ShoppingBag,
            matches: (p) => p.startsWith("/customer/order"),
          },
          {
            id: "customer-orders",
            name: "My Orders",
            href: "/customer/orders",
            icon: Boxes,
            matches: (p) => p.startsWith("/customer/orders"),
          },
          {
            id: "customer-addresses",
            name: "Addresses",
            href: "/customer/addresses",
            icon: MapPin,
            matches: (p) => p.startsWith("/customer/addresses"),
          },
        ];
      case "DRIVER":
        return [
          {
            id: "driver-runs",
            name: "Runs",
            href: "/driver",
            icon: Truck,
            matches: (p) => p.startsWith("/driver"),
          },
          {
            id: "driver-alerts",
            name: "Alerts",
            href: "/notifications",
            icon: Bell,
            matches: (p) => p.startsWith("/notifications"),
          },
        ];
      case "AGENT":
        return [
          {
            id: "agent-portal",
            name: "Agent Portal",
            href: "/agent",
            icon: Briefcase,
            matches: (p) => p === "/agent",
          },
          {
            id: "agent-alerts",
            name: "Alerts",
            href: "/notifications",
            icon: Bell,
            matches: (p) => p.startsWith("/notifications"),
          },
        ];
      case "MANAGER":
      case "ADMIN":
      default:
        return [
          {
            id: "dashboard",
            name: "Dashboard",
            href: role === "MANAGER" ? "/manager" : "/admin",
            icon: LayoutDashboard,
            matches: (p) => p === "/admin" || p === "/manager",
          },
          {
            id: "orders",
            name: "Orders",
            href: "/admin/orders",
            icon: ShoppingBag,
            matches: (p) => p.startsWith("/admin/orders"),
          },
          {
            id: "customers",
            name: "Customers",
            href: "/admin/customers",
            icon: Users,
            matches: (p) => p.startsWith("/admin/customers"),
          },
          {
            id: "customer-portal",
            name: "Portal",
            href: "/customer",
            icon: Store,
            matches: (p) => p.startsWith("/customer"),
          },
        ];
    }
  }, [role]);

  return (
    <nav
      aria-label="Mobile Floating Navigation"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden max-w-[94vw]"
    >
      <div className="flex items-center gap-1 rounded-full border border-card-border/80 bg-card-background/90 p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-card-surface-area/90 dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = item.matches(pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "relative flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 focus:outline-none",
                isActive
                  ? "bg-primary text-white shadow-xs px-3.5 py-2 font-medium"
                  : "p-2.5 text-text-secondary hover:text-text-primary hover:bg-muted/60"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                    animate={{ opacity: 1, width: "auto", marginLeft: 6 }}
                    exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                    transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden whitespace-nowrap text-xs font-semibold leading-none tracking-tight"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}

        {/* Subtle separator before hamburger */}
        <div className="my-auto mx-0.5 h-4 w-px bg-card-border/80 dark:bg-white/10" />

        {/* Hamburger menu trigger */}
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open sidebar menu"
          className="flex items-center justify-center rounded-full p-2.5 text-text-secondary transition-all hover:bg-muted/60 hover:text-text-primary active:scale-95 cursor-pointer focus:outline-none"
        >
          <Menu className="size-4 shrink-0" />
        </button>
      </div>
    </nav>
  );
}
