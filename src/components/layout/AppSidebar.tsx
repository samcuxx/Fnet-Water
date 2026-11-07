"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import Logo from "@/components/brand/Logo";
import SidebarWidget from "./SidebarWidget";

export interface NavItem {
  name: string;
  href?: string;
  icon: React.ReactNode;
  badge?: string;
  subItems?: {
    name: string;
    href: string;
    badge?: string;
  }[];
}

interface AppSidebarProps {
  role?: "ADMIN" | "MANAGER" | "DRIVER" | "AGENT" | "CUSTOMER";
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ role = "ADMIN" }) => {
  const pathname = usePathname();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } =
    useSidebar();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const isSidebarVisible = isExpanded || isHovered;

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu((prev) => (prev === name ? null : name));
  };

  // Nav menus configured for roles
  const navItemsByRole: Record<string, NavItem[]> = {
    ADMIN: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 4.25A2.25 2.25 0 014.25 2h2.5A2.25 2.25 0 019 4.25v4.5A2.25 2.25 0 016.75 11h-2.5A2.25 2.25 0 012 8.75v-4.5zM2 13.25A2.25 2.25 0 014.25 11h2.5A2.25 2.25 0 019 13.25v2.5A2.25 2.25 0 016.75 18h-2.5A2.25 2.25 0 012 15.75v-2.5zM11 4.25A2.25 2.25 0 0113.25 2h2.5A2.25 2.25 0 0118 4.25v2.5A2.25 2.25 0 0115.75 9h-2.5A2.25 2.25 0 0111 6.75v-2.5zM11 11.25A2.25 2.25 0 0113.25 9h2.5A2.25 2.25 0 0118 11.25v4.5A2.25 2.25 0 0115.75 18h-2.5A2.25 2.25 0 0111 15.75v-4.5z" />
          </svg>
        ),
      },
      {
        name: "Water Orders",
        icon: (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
            <path
              fillRule="evenodd"
              d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        ),
        subItems: [
          { name: "All Orders", href: "/admin/orders" },
          { name: "Deliveries & Dispatch", href: "/admin/deliveries" },
          { name: "Bottle Exchanges", href: "/admin/bottles" },
        ],
      },
      {
        name: "Inventory & Assets",
        icon: (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
        ),
        subItems: [
          { name: "Bottle Tracking", href: "/admin/inventory/bottles" },
          { name: "Smart Dispensers", href: "/admin/dispensers" },
          { name: "Products Catalog", href: "/admin/products" },
        ],
      },
      {
        name: "Finance & Payments",
        icon: (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.75 2.75a.75.75 0 00-1.5 0v1.087a4.5 4.5 0 00-2.42 1.343.75.75 0 101.06 1.06 3 3 0 012.86-.74v4.54a4.5 4.5 0 00-2.42 1.343.75.75 0 101.06 1.06 3 3 0 011.5-.477v1.134a.75.75 0 001.5 0v-1.087a4.5 4.5 0 002.42-1.343.75.75 0 10-1.06-1.06 3 3 0 01-2.86.74v-4.54a4.5 4.5 0 002.42-1.343.75.75 0 10-1.06-1.06 3 3 0 01-1.5.477V2.75z" />
          </svg>
        ),
        subItems: [
          { name: "MoMo & Card Transactions", href: "/admin/finance/transactions" },
          { name: "Installment Contracts", href: "/admin/finance/installments" },
        ],
      },
      {
        name: "Users & Fleet",
        icon: (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        ),
        subItems: [
          { name: "Staff Directory", href: "/admin/users" },
          { name: "Customer Directory", href: "/admin/customers" },
          { name: "Drivers & Routes", href: "/admin/drivers" },
          { name: "Field Agents", href: "/admin/agents" },
        ],
      },
      {
        name: "Component Library",
        href: "/ui-showcase",
        badge: "PRO",
        icon: (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 012 10z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
      {
        name: "My Profile",
        href: "/profile",
        icon: (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
    ],
    MANAGER: [
      {
        name: "Logistics Hub",
        href: "/manager",
        icon: (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 4.25A2.25 2.25 0 014.25 2h2.5A2.25 2.25 0 019 4.25v4.5A2.25 2.25 0 016.75 11h-2.5A2.25 2.25 0 012 8.75v-4.5zM2 13.25A2.25 2.25 0 014.25 11h2.5A2.25 2.25 0 019 13.25v2.5A2.25 2.25 0 016.75 18h-2.5A2.25 2.25 0 012 15.75v-2.5zM11 4.25A2.25 2.25 0 0113.25 2h2.5A2.25 2.25 0 0118 4.25v2.5A2.25 2.25 0 0115.75 9h-2.5A2.25 2.25 0 0111 6.75v-2.5zM11 11.25A2.25 2.25 0 0113.25 9h2.5A2.25 2.25 0 0118 11.25v4.5A2.25 2.25 0 0115.75 18h-2.5A2.25 2.25 0 0111 15.75v-4.5z" />
          </svg>
        ),
      },
      {
        name: "Deliveries Queue",
        href: "/manager/deliveries",
        icon: (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
        ),
      },
      {
        name: "My Profile",
        href: "/profile",
        icon: (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
    ],
    DRIVER: [
      {
        name: "Dispatch Dashboard",
        href: "/driver",
        icon: (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
        ),
      },
      {
        name: "My Profile",
        href: "/profile",
        icon: (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
    ],
    AGENT: [
      {
        name: "Agent Portal",
        href: "/agent",
        icon: (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        ),
      },
      {
        name: "My Profile",
        href: "/profile",
        icon: (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
    ],
    CUSTOMER: [
      {
        name: "My Portal",
        href: "/customer",
        icon: (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 4.25A2.25 2.25 0 014.25 2h2.5A2.25 2.25 0 019 4.25v4.5A2.25 2.25 0 016.75 11h-2.5A2.25 2.25 0 012 8.75v-4.5zM2 13.25A2.25 2.25 0 014.25 11h2.5A2.25 2.25 0 019 13.25v2.5A2.25 2.25 0 016.75 18h-2.5A2.25 2.25 0 012 15.75v-2.5zM11 4.25A2.25 2.25 0 0113.25 2h2.5A2.25 2.25 0 0118 4.25v2.5A2.25 2.25 0 0115.75 9h-2.5A2.25 2.25 0 0111 6.75v-2.5zM11 11.25A2.25 2.25 0 0113.25 9h2.5A2.25 2.25 0 0118 11.25v4.5A2.25 2.25 0 0115.75 18h-2.5A2.25 2.25 0 0111 15.75v-4.5z" />
          </svg>
        ),
      },
      {
        name: "Order Water",
        href: "/customer/order",
        icon: (
          <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        ),
      },
      {
        name: "My Orders",
        href: "/customer/orders",
        icon: (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
            <path
              fillRule="evenodd"
              d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
      {
        name: "Address Book",
        href: "/customer/addresses",
        icon: (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        name: "Smart Dispenser",
        href: "/customer/dispenser",
        icon: (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.993.883L4 8v8a2 2 0 001.85 1.995L6 18h8a2 2 0 001.995-1.85L16 16V8a1 1 0 00-.883-.993L15 7h-1V6a4 4 0 00-4-4zm0 2a2 2 0 012 2v1H8V6a2 2 0 012-2z" />
          </svg>
        ),
      },
      {
        name: "My Profile",
        href: "/profile",
        icon: (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
    ],
  };

  const navItems = navItemsByRole[role] || navItemsByRole.ADMIN;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed top-0 left-0 z-50 flex flex-col h-screen border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-all duration-300 ease-in-out ${
        isSidebarVisible ? "w-[270px]" : "w-[80px]"
      } ${
        isMobileOpen
          ? "translate-x-0 w-[270px]"
          : "-translate-x-full xl:translate-x-0"
      }`}
    >
      {/* Sidebar Header with Brand Logo */}
      <div
        className={`flex items-center h-16 border-b border-gray-200 dark:border-gray-800 transition-all duration-300 ${
          isSidebarVisible ? "justify-between px-5" : "justify-center px-0"
        }`}
      >
        <div className="flex items-center justify-center overflow-hidden">
          <Logo size="sm" iconOnly={!isSidebarVisible} />
        </div>

        {isSidebarVisible && isMobileOpen && (
          <button
            type="button"
            onClick={toggleMobileSidebar}
            aria-label="Close sidebar"
            className="xl:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 p-1"
          >
            <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isItemActive =
            (item.href && pathname === item.href) ||
            item.subItems?.some((sub) => pathname === sub.href);
          const isSubmenuOpen = openSubmenu === item.name || isItemActive;

          return (
            <div key={item.name} className="relative">
              {hasSubItems ? (
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSubmenu(item.name)}
                    className={`menu-item group ${
                      isItemActive ? "menu-item-active" : "menu-item-inactive"
                    } ${!isSidebarVisible ? "justify-center px-0" : ""}`}
                  >
                    <span
                      className={`shrink-0 ${
                        isItemActive
                          ? "text-brand-500 dark:text-brand-400"
                          : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                      }`}
                    >
                      {item.icon}
                    </span>

                    {isSidebarVisible && (
                      <>
                        <span className="flex-1 text-left text-xs font-medium">
                          {item.name}
                        </span>
                        <svg
                          className={`size-3.5 text-gray-400 transition-transform ${
                            isSubmenuOpen ? "rotate-180" : ""
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Submenu Accordion */}
                  {isSidebarVisible && isSubmenuOpen && (
                    <div className="pl-9 pr-2 py-1 space-y-1">
                      {item.subItems?.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            onClick={() => {
                              if (isMobileOpen) toggleMobileSidebar();
                            }}
                            className={`block py-1.5 px-2.5 rounded-lg text-xs font-medium transition ${
                              isSubActive
                                ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 font-semibold"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                          >
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href || "#"}
                  onClick={() => {
                    if (isMobileOpen) toggleMobileSidebar();
                  }}
                  className={`menu-item group ${
                    isItemActive ? "menu-item-active" : "menu-item-inactive"
                  } ${!isSidebarVisible ? "justify-center px-0" : ""}`}
                >
                  <span
                    className={`shrink-0 ${
                      isItemActive
                        ? "text-brand-500 dark:text-brand-400"
                        : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    }`}
                  >
                    {item.icon}
                  </span>

                  {isSidebarVisible && (
                    <>
                      <span className="flex-1 text-left text-xs font-medium">
                        {item.name}
                      </span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Support / Quick Hotline Widget */}
      {isSidebarVisible && <SidebarWidget />}
    </aside>
  );
};

export default AppSidebar;
