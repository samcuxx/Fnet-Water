"use client";

import React, { useEffect, useRef } from "react";
import { useSidebar } from "@/context/SidebarContext";
import ThemeToggleButton from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";

export const AppHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1280) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex w-full border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm">
      <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Sidebar toggle + Global Quick Search */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-lg">
          <button
            type="button"
            onClick={handleToggle}
            aria-label="Toggle navigation menu"
            className="flex items-center justify-center size-9 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-hidden"
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

          {/* Quick Search Bar */}
          <div className="relative w-full max-w-xs hidden sm:block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg className="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path
                  d="M9 17A8 8 0 109 1a8 8 0 000 16zM15 15l4 4"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search orders, dispensers, routes... (Ctrl+K)"
              className="h-9 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 pl-9 pr-3 text-xs placeholder:text-gray-400 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-hidden transition"
            />
          </div>
        </div>

        {/* Right: Controls & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggleButton />
          <NotificationDropdown />
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block" />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
