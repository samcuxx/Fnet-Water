"use client";

import {
  GearIcon,
  LogoutIcon,
  UserCircleIcon,
} from "@/components/common/header/icons";
import { Avatar, AvatarFallback } from "@/components/tailgrids/core/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/tailgrids/core/dropdown";
import { AltArrowDownIcon } from "@/utils/icon";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";

export function UserProfileButton() {
  const { data: session } = useSession();
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
  const displayEmailOrPhone = user?.phone || user?.email || "fnetwater@hub.gh";

  const handleSignOut = async () => {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex items-center gap-2.5 rounded-lg border-0 p-1 transition-all outline-none hover:bg-background-gray-primary cursor-pointer">
          <Avatar size="sm">
            <AvatarFallback className="rounded-lg border border-card-border bg-primary/10 text-primary font-bold">
              {displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="hidden text-left sm:block">
            <span className="block text-xs font-semibold text-text-primary leading-tight">
              {displayName}
            </span>
            <span className="block text-[10px] text-text-tertiary uppercase">
              {displayRole}
            </span>
          </div>

          <AltArrowDownIcon className="text-icon-tertiary transition-transform duration-200 group-aria-expanded:-rotate-180" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent placement="bottom end" className="w-64 p-0 shadow-2xl">
        <DropdownMenuHeader className="flex items-center gap-2.5 border-b border-card-border px-4 py-3">
          <Avatar size="sm">
            <AvatarFallback className="border border-card-border bg-primary/10 text-primary font-bold">
              {displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-sm font-medium text-text-primary">
              {displayName}
            </span>
            <span className="truncate text-xs text-text-tertiary">
              {displayEmailOrPhone}
            </span>
          </div>
        </DropdownMenuHeader>

        <DropdownMenuSection className="p-1.5">
          <DropdownMenuItem asChild>
            <Link
              href={getDashboardHref(user?.role)}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-text-secondary hover:bg-background-gray-primary hover:text-text-primary"
            >
              <UserCircleIcon />
              <span>Portal Dashboard</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/profile"
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-text-secondary hover:bg-background-gray-primary hover:text-text-primary"
            >
              <GearIcon />
              <span>Profile Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuSection>

        <DropdownMenuSeparator />

        <div className="p-1.5">
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogoutIcon />
            <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
