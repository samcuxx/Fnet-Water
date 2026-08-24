"use client";

import { useEffect, useState, type ReactNode } from "react";

import Link from "next/link";

import { Bell, Menu, X } from "lucide-react";

import { Logo } from "@/components/ui/logo";
import type { UserRole } from "@/lib/generated/prisma/enums";
import { cn } from "@/lib/utils/cn";

import { MobileBar } from "./mobile-bar";
import { MOBILE_BAR, navigationFor } from "./nav-config";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu, type MenuUser } from "./user-menu";

/**
 * The chrome around every authenticated portal: sidebar, header, mobile drawer
 * and (for phone-first roles) a bottom bar.
 *
 * A client component because it owns the drawer's open state, but `children`
 * are still rendered on the server and passed through untouched.
 */
export function AppShell({
  role,
  user,
  notificationCount = 0,
  children,
}: {
  role: UserRole;
  user: MenuUser;
  notificationCount?: number;
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sections = navigationFor(role);
  const mobileBarItems = MOBILE_BAR[role];

  // Prevent the page behind the drawer from scrolling while it is open.
  useEffect(() => {
    if (!drawerOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-sidebar lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-5">
          <Logo inverted />
        </div>

        <SidebarNav sections={sections} />

        <div className="border-t border-white/10 px-5 py-4 text-xs text-white/40">
          <p>F Net Water Hub</p>
          <p className="mt-0.5">© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-slate-900/60"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="relative flex h-full w-72 max-w-[85%] flex-col bg-sidebar shadow-xl"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
              <Logo inverted />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X className="size-5" aria-hidden />
                <span className="sr-only">Close navigation</span>
              </button>
            </div>

            <SidebarNav
              sections={sections}
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
            <span className="sr-only">Open navigation</span>
          </button>

          <Link href="/" className="lg:hidden" aria-label="F Net Water Hub home">
            <Logo showWordmark={false} />
          </Link>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/notifications"
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <Bell className="size-5" aria-hidden />
              {notificationCount > 0 && (
                <span
                  className={cn(
                    "absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full",
                    "bg-danger-600 px-1 text-[0.625rem] font-semibold leading-4 text-white",
                  )}
                >
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
              <span className="sr-only">
                Notifications
                {notificationCount > 0 ? ` (${notificationCount} unread)` : ""}
              </span>
            </Link>

            <UserMenu user={user} />
          </div>
        </header>

        <main
          className={cn(
            "px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
            // Clear the fixed bottom bar on the phone-first portals.
            mobileBarItems && "pb-24 lg:pb-8",
          )}
        >
          {children}
        </main>
      </div>

      {mobileBarItems && <MobileBar items={mobileBarItems} />}
    </div>
  );
}
