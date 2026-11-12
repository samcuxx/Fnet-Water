"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import ThemeToggleButton from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import Logo from "@/components/brand/Logo";

export const AppHeader: React.FC = () => {
  const pathname = usePathname();
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  const getPortalLabel = () => {
    if (pathname.startsWith("/admin")) return "Executive Administration";
    if (pathname.startsWith("/manager")) return "Operations Management";
    if (pathname.startsWith("/driver")) return "Driver Dispatch Run";
    if (pathname.startsWith("/agent")) return "Agent Partner Portal";
    if (pathname.startsWith("/customer")) return "Customer Portal";
    if (pathname.startsWith("/notifications")) return "Notification Center";
    return "F Net Water Hub";
  };

  const isCustomerPortal = pathname.startsWith("/customer");

  return (
    <header className="sticky top-0 z-40 flex w-full border-b border-gray-100 dark:border-gray-800/80 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 items-center justify-between transition-colors">
      {/* Left: Mobile hamburger menu toggle + Logo | Desktop Section Title */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle button */}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          aria-label="Toggle navigation menu"
          className="xl:hidden flex items-center justify-center size-9 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-hidden cursor-pointer"
        >
          {isMobileOpen ? (
            <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Mobile Brand Logo */}
        <div className="xl:hidden">
          <Logo variant="default" size="sm" />
        </div>

        {/* Desktop Breadcrumb / Section indicator */}
        <div className="hidden xl:flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-brand-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {getPortalLabel()}
          </span>
        </div>
      </div>

      {/* Right: Actions, Notification Center & Theme Toggle */}
      <div className="flex items-center gap-2.5">
        {isCustomerPortal && (
          <Link
            href="/customer/order"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition shadow-xs dark:bg-white dark:text-gray-950"
          >
            <svg className="size-3" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Order Water</span>
          </Link>
        )}

        {/* The Notification Bell Dropdown */}
        <NotificationDropdown />

        {/* Theme Toggle Button */}
        <ThemeToggleButton />
      </div>
    </header>
  );
};

export default AppHeader;
