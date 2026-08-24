"use client";

import { useEffect, useRef, useState } from "react";

import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";

import { logout } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/utils/format";

export type MenuUser = {
  fullName: string;
  email: string;
  roleLabel: string;
  code: string;
  /** Omitted for staff, who have no self-service profile page yet. */
  profileHref?: string;
};

/**
 * Account menu with sign-out.
 *
 * Sign-out posts to a Server Action rather than a client fetch, so the session
 * row is revoked server-side and the cookie is cleared in the same response.
 */
export function UserMenu({ user }: { user: MenuUser }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-lg p-1.5 text-left transition-colors hover:bg-slate-100"
      >
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white"
        >
          {initials(user.fullName)}
        </span>

        <span className="hidden min-w-0 sm:block">
          <span className="block truncate text-sm font-medium text-slate-900">
            {user.fullName}
          </span>
          <span className="block truncate text-xs text-slate-500">
            {user.roleLabel}
          </span>
        </span>

        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
        <span className="sr-only">Account menu</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-dropdown"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-medium text-slate-900">
              {user.fullName}
            </p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
            <p className="mt-1 font-mono text-xs text-slate-400">{user.code}</p>
          </div>

          <div className="p-1.5">
            {user.profileHref && (
              <a
                href={user.profileHref}
                role="menuitem"
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <UserIcon className="size-4 text-slate-400" aria-hidden />
                My profile
              </a>
            )}

            <form action={logout}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-danger-600 hover:bg-danger-50"
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
