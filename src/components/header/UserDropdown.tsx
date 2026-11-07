"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import Badge from "@/components/ui/badge/Badge";

interface UserDropdownProps {
  name?: string;
  role?: string;
  phone?: string;
}

export default function UserDropdown({
  name = "Samuel Tackie",
  role = "Admin",
  phone = "+233 24 000 0000",
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleDropdown}
        className="dropdown-toggle flex items-center gap-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition focus:outline-hidden"
      >
        <span className="flex items-center justify-center rounded-full size-9 bg-brand-500 text-white font-semibold text-xs shrink-0 ring-2 ring-brand-100 dark:ring-brand-900/40">
          {name.charAt(0)}
        </span>

        <div className="hidden text-left xl:block">
          <span className="block text-xs font-semibold text-gray-900 dark:text-white leading-tight">
            {name}
          </span>
          <span className="block text-[11px] text-gray-500 dark:text-gray-400 capitalize">
            {role.toLowerCase()}
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
        className="w-64 p-3 right-0 top-full mt-2"
      >
        <div className="pb-3 mb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <span className="block font-semibold text-xs text-gray-900 dark:text-white">
              {name}
            </span>
            <Badge size="sm" variant="light" color="primary">
              {role}
            </Badge>
          </div>
          <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
            {phone}
          </span>
        </div>

        <div className="space-y-1">
          <DropdownItem tag="a" href="/profile" onItemClick={closeDropdown}>
            <svg className="size-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>My Profile</span>
          </DropdownItem>

          <DropdownItem tag="a" href="/orders" onItemClick={closeDropdown}>
            <svg className="size-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span>Orders & Refills</span>
          </DropdownItem>

          <DropdownItem tag="a" href="/settings" onItemClick={closeDropdown}>
            <svg className="size-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <span>Account Settings</span>
          </DropdownItem>
        </div>

        <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
          <DropdownItem
            tag="a"
            href="/api/auth/signout"
            className="text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-500/10"
            onItemClick={closeDropdown}
          >
            <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            <span>Sign Out</span>
          </DropdownItem>
        </div>
      </Dropdown>
    </div>
  );
}
