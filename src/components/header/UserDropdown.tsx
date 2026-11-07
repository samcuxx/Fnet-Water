"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import Badge from "@/components/ui/badge/Badge";

export default function UserDropdown() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const user = session?.user as
    | {
        name?: string | null;
        email?: string | null;
        role?: string;
        phone?: string;
      }
    | undefined;

  const displayName = user?.name || "Operations User";
  const displayRole = user?.role || "STAFF";
  const displayPhone = user?.phone || user?.email || "Ghana Operational Account";

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleSignOut = async () => {
    closeDropdown();
    setIsSigningOut(true);
    try {
      await signOut({ callbackUrl: "/login", redirect: true });
    } catch {
      window.location.replace("/login");
    }
  };

  const getDashboardHref = (r?: string) => {
    switch (r) {
      case "ADMIN":
        return "/admin";
      case "MANAGER":
        return "/manager";
      case "DRIVER":
        return "/driver";
      case "AGENT":
        return "/agent";
      case "CUSTOMER":
        return "/customer";
      default:
        return "/admin";
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-label="User navigation menu"
        className="dropdown-toggle flex items-center gap-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:white transition focus:outline-hidden cursor-pointer"
      >
        <span className="flex items-center justify-center rounded-full size-9 bg-brand-500 text-white font-semibold text-xs shrink-0 ring-2 ring-brand-100 dark:ring-brand-900/40">
          {displayName.charAt(0).toUpperCase()}
        </span>

        <div className="hidden text-left xl:block">
          <span className="block text-xs font-semibold text-gray-900 dark:text-white leading-tight">
            {displayName}
          </span>
          <span className="block text-[11px] text-gray-500 dark:text-gray-400 capitalize">
            {displayRole.toLowerCase()}
          </span>
        </div>

        <svg
          className={`size-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="w-64 p-3 right-0 top-full mt-2 shadow-theme-lg"
      >
        <div className="pb-3 mb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <span className="block font-semibold text-xs text-gray-900 dark:text-white truncate max-w-[150px]">
              {displayName}
            </span>
            <Badge size="sm" variant="light" color="primary">
              {displayRole}
            </Badge>
          </div>
          <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
            {displayPhone}
          </span>
        </div>

        <div className="space-y-1">
          <DropdownItem tag="a" href="/profile" onItemClick={closeDropdown}>
            <svg className="size-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            <span>My Profile</span>
          </DropdownItem>

          <DropdownItem tag="a" href={getDashboardHref(displayRole)} onItemClick={closeDropdown}>
            <svg className="size-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span>Dashboard</span>
          </DropdownItem>
        </div>

        <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left cursor-pointer disabled:opacity-50"
          >
            <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{isSigningOut ? "Signing Out..." : "Sign Out"}</span>
          </button>
        </div>
      </Dropdown>
    </div>
  );
}
