"use client";

import { MenuIcon, SearchIcon } from "@/components/common/header/icons";
import { NotificationsButton } from "@/components/common/header/notifications";
import SearchBar, { openSearchModal } from "@/components/common/header/searchbar";
import ThemeToggle from "@/components/common/header/theme-toggle";
import { UserProfileButton } from "@/components/common/header/user-profile";
import { ThreeDots } from "@/components/common/sidebar/icon";
import { cn } from "@/utils/cn";
import Logo from "@/components/brand/Logo";
import Link from "next/link";
import React from "react";

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b-[0.5px] border-card-border bg-card-surface-area px-3 py-3.5 lg:px-6">
        {/* Mobile layout (< xl): 3-column grid */}
        <div className="flex items-center xl:hidden justify-between">
          {/* Left: Menu / Hamburger */}
          <div className="flex flex-1 justify-start">
            <button
              id="mobile-menu-toggle"
              onClick={onMenuClick}
              aria-label="Open sidebar menu"
              className="rounded-md p-1.5 text-icon-tertiary transition-colors hover:text-text-primary cursor-pointer"
            >
              <MenuIcon />
            </button>
          </div>

          {/* Center: Logo */}
          <Logo size="sm" href="/admin" />

          {/* Right: Three-dot quick toggle */}
          <div className="flex flex-1 justify-end">
            <button
              id="mobile-info-toggle"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              aria-label="Open quick access"
              className={cn(
                "rounded-md p-2 transition-colors cursor-pointer",
                isDrawerOpen
                  ? "bg-background-gray-secondary text-text-primary"
                  : "text-icon-tertiary hover:text-text-primary",
              )}
            >
              <ThreeDots />
            </button>
          </div>
        </div>

        {/* Desktop layout (xl+) */}
        <div className="hidden items-center justify-between xl:flex">
          {/* Left Side: Search */}
          <div className="max-w-xs flex-1">
            <SearchBar />
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <NotificationsButton />
            <UserProfileButton />
          </div>
        </div>
      </header>

      {/* Mobile Info Drawer */}
      <MobileInfoDrawer isOpen={isDrawerOpen} />
    </>
  );
}

function MobileInfoDrawer({ isOpen }: { isOpen: boolean }) {
  return (
    <div className={cn("xl:hidden border-b border-card-border bg-card-background px-4 py-3 transition-all", isOpen ? "block" : "hidden")}>
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <NotificationsButton />
          <ThemeToggle />
          <button
            onClick={openSearchModal}
            className="flex size-10 items-center justify-center rounded-lg border border-card-border bg-card-background text-icon-primary shadow-xs transition-colors outline-none hover:bg-background-gray-primary cursor-pointer"
            aria-label="Open search modal"
          >
            <SearchIcon />
          </button>
        </div>

        <UserProfileButton />
      </div>
    </div>
  );
}
