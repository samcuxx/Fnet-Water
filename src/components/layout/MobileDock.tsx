"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
        icon: (
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        ),
      },
      {
        name: "Order",
        href: "/customer/order",
        icon: (
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        ),
      },
      {
        name: "Dispensers",
        href: "/customer/dispenser",
        icon: (
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        ),
      },
      {
        name: "Orders",
        href: "/customer/orders",
        icon: (
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.581.814L10 14.197l-4.419 2.617A1 1 0 014 16V4zm2 2v8.528l3.419-2.025a1 1 0 011.162 0L14 14.528V6H6z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        name: "Addresses",
        href: "/customer/addresses",
        icon: (
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        ),
      },
    ],
    DRIVER: [
      {
        name: "Today's Stops",
        href: "/driver",
        icon: (
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
        ),
      },
      {
        name: "Route Deliveries",
        href: "/driver/deliveries",
        icon: (
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        name: "Account",
        href: "/profile",
        icon: (
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        ),
      },
    ],
    MANAGER: [
      {
        name: "Overview",
        href: "/manager",
        icon: (
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        ),
      },
      {
        name: "Dispatch",
        href: "/manager/deliveries",
        icon: (
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
        ),
      },
      {
        name: "Inventory",
        href: "/manager/inventory",
        icon: (
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
        ),
      },
      {
        name: "Dispensers",
        href: "/manager/dispensers",
        icon: (
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        ),
      },
    ],
    ADMIN: [
      {
        name: "Dashboard",
        href: "/admin",
        icon: (
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 4.25A2.25 2.25 0 014.25 2h2.5A2.25 2.25 0 019 4.25v4.5A2.25 2.25 0 016.75 11h-2.5A2.25 2.25 0 012 8.75v-4.5zM2 13.25A2.25 2.25 0 014.25 11h2.5A2.25 2.25 0 019 13.25v2.5A2.25 2.25 0 016.75 18h-2.5A2.25 2.25 0 012 15.75v-2.5zM11 4.25A2.25 2.25 0 0113.25 2h2.5A2.25 2.25 0 0118 4.25v2.5A2.25 2.25 0 0115.75 9h-2.5A2.25 2.25 0 0111 6.75v-2.5zM11 11.25A2.25 2.25 0 0113.25 9h2.5A2.25 2.25 0 0118 11.25v4.5A2.25 2.25 0 0115.75 18h-2.5A2.25 2.25 0 0111 15.75v-4.5z" />
          </svg>
        ),
      },
      {
        name: "Dispatch",
        href: "/admin/deliveries",
        icon: (
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
        ),
      },
      {
        name: "Inventory",
        href: "/admin/inventory",
        icon: (
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
        ),
      },
      {
        name: "Finance",
        href: "/admin/finance/transactions",
        icon: (
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.75 2.75a.75.75 0 00-1.5 0v1.087a4.5 4.5 0 00-2.42 1.343.75.75 0 101.06 1.06 3 3 0 012.86-.74v4.54a4.5 4.5 0 00-2.42 1.343.75.75 0 101.06 1.06 3 3 0 011.5-.477v1.134a.75.75 0 001.5 0v-1.087a4.5 4.5 0 002.42-1.343.75.75 0 10-1.06-1.06 3 3 0 01-2.86.74v-4.54a4.5 4.5 0 002.42-1.343.75.75 0 10-1.06-1.06 3 3 0 01-1.5.477V2.75z" />
          </svg>
        ),
      },
      {
        name: "Users",
        href: "/admin/users",
        icon: (
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        ),
      },
    ],
  };

  const items = dockItemsByRole[role] || dockItemsByRole.CUSTOMER;

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 lg:hidden max-w-[92vw]"
    >
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/80 dark:border-gray-800 shadow-xl rounded-full px-2 py-1.5 flex items-center gap-1 sm:gap-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition active:scale-95 ${
                isActive
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-blue-light-400 shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
