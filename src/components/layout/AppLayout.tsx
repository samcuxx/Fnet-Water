"use client";

import Header from "@/components/common/header";
import Sidebar from "@/components/common/sidebar";
import FloatingNavbar from "@/components/layout/FloatingNavbar";
import { SheetContent, SheetOverlay, SheetTitle } from "@/components/tailgrids/core/sheet";
import { SkeletonAppShell } from "@/components/ui/skeleton";
import type { RoleType } from "@/types/next-auth";
import { cn } from "@/utils/cn";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
  role?: RoleType | RoleType[];
}

const LayoutContent: React.FC<{
  children: React.ReactNode;
  role?: RoleType | RoleType[];
}> = ({ children, role }) => {
  const { data: session } = useSession();
  const sessionRole = (session?.user as { role?: RoleType })?.role;
  const activeRole: RoleType = sessionRole || (Array.isArray(role) ? role[0] : role) || "ADMIN";

  // XL+ desktop sidebar open/collapsed state (270px / 72px)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // Mobile drawer open state (< xl breakpoint)
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop sidebar (xl+) — smooth width transition */}
      <aside
        style={{
          width: isSidebarOpen ? "270px" : "72px",
          minWidth: isSidebarOpen ? "270px" : "72px",
          transition:
            "width 300ms cubic-bezier(0.4,0,0.2,1), min-width 300ms cubic-bezier(0.4,0,0.2,1)",
        }}
        className="hidden shrink-0 overflow-hidden xl:block bg-background"
      >
        <Sidebar
          role={activeRole}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      </aside>

      {/* Mobile sidebar drawer (< xl) */}
      <SheetOverlay isOpen={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-67.5! max-w-67.5! border-r border-card-border bg-card-surface-area p-0 shadow-2xl"
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <Sidebar
            role={activeRole}
            isSidebarOpen={true}
            toggleSidebar={() => setIsMobileSheetOpen(false)}
            onItemClick={() => setIsMobileSheetOpen(false)}
            isMobileSheet
          />
        </SheetContent>
      </SheetOverlay>

      {/* Main content column with floating elevated canvas */}
      <div
        className={cn(
          "min-w-0 flex-1 flex flex-col h-screen",
          isSidebarOpen ? "lg:p-4 xl:pr-4" : "lg:py-4 xl:px-4"
        )}
      >
        <div className="flex h-full flex-col overflow-hidden border-[0.5px] border-card-surface-border bg-card-surface-area lg:rounded-2xl lg:shadow-[0_3px_6px_-2px_rgba(0,0,0,0.02),0_1px_1px_0_rgba(0,0,0,0.04)]">
          <Header onMenuClick={() => setIsMobileSheetOpen(true)} />

          <main className="custom-scrollbar flex-1 min-h-0 overflow-y-auto">
            <div className="mx-auto w-full max-w-384 pb-20 md:pb-8">{children}</div>
          </main>

          {/* Floating Pill Navigation on Mobile Phones */}
          <FloatingNavbar
            role={activeRole}
            onOpenSidebar={() => setIsMobileSheetOpen(true)}
          />
        </div>
      </div>
    </div>
  );
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children, role = "ADMIN" }) => {
  const { data: session, status } = useSession();

  // 1. Client-Side Authentication Guard
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.replace("/login");
    }
  }, [status]);

  // 2. bfcache Defeater
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  // 3. Client Role Enforcement
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userRole = (session.user as { role?: RoleType }).role;
      if (role && userRole) {
        const allowedRoles: RoleType[] = Array.isArray(role) ? role : [role];
        const isAllowed = userRole === "ADMIN" || allowedRoles.includes(userRole);

        if (!isAllowed) {
          const dest =
            userRole === "MANAGER"
              ? "/manager"
              : userRole === "DRIVER"
              ? "/driver"
              : userRole === "AGENT"
              ? "/agent"
              : "/customer";
          window.location.replace(dest);
        }
      }
    }
  }, [status, session, role]);

  if (status === "loading") {
    return <SkeletonAppShell />;
  }

  if (status === "unauthenticated" || !session) {
    return null;
  }

  return <LayoutContent role={role}>{children}</LayoutContent>;
};

export default AppLayout;
