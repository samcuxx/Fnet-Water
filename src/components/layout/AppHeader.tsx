"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Plus } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import ThemeToggleButton from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import Logo from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

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
    <header className="sticky top-0 z-40 flex w-full border-b border-border bg-background/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 items-center justify-between transition-colors">
      {/* Left: Mobile hamburger menu toggle + Logo | Desktop Section Title */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle button */}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          aria-label="Toggle navigation menu"
          className="xl:hidden flex items-center justify-center size-9 rounded-md border border-border text-foreground hover:bg-muted transition focus:outline-hidden cursor-pointer"
        >
          {isMobileOpen ? (
            <X className="size-4" />
          ) : (
            <Menu className="size-4" />
          )}
        </button>

        {/* Mobile Brand Logo */}
        <div className="xl:hidden">
          <Logo variant="default" size="sm" />
        </div>

        {/* Desktop Breadcrumb / Section indicator */}
        <div className="hidden xl:flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {getPortalLabel()}
          </span>
        </div>
      </div>

      {/* Right: Actions, Notification Center & Theme Toggle */}
      <div className="flex items-center gap-2.5">
        {isCustomerPortal && (
          <Button asChild size="sm" variant="default" className="gap-1.5 rounded-xl">
            <Link href="/customer/order">
              <Plus className="size-3.5" />
              <span>Order Water</span>
            </Link>
          </Button>
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
