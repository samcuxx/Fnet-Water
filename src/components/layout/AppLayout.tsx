"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";
import type { RoleType } from "@/types/next-auth";

interface AppLayoutProps {
  children: React.ReactNode;
  role?: RoleType;
}

const LayoutContent: React.FC<{
  children: React.ReactNode;
  role?: RoleType;
}> = ({ children, role = "ADMIN" }) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const isSidebarVisible = isExpanded || isHovered;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <AppSidebar role={role} />
      <Backdrop />

      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarVisible ? "xl:ml-[270px]" : "xl:ml-[80px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children, role = "ADMIN" }) => {
  const { data: session, status } = useSession();

  // 1. Client-Side Authentication Guard: immediately redirect unauthenticated visitors
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.replace("/login");
    }
  }, [status]);

  // 2. Back-Forward Cache (bfcache) Defeater:
  // If user presses the Back button after logging out, browsers may attempt to restore
  // the frozen memory snapshot. Detecting event.persisted forces a clean network reload,
  // which hits middleware and redirects to /login.
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
      const userRole = (session.user as { role?: string }).role;
      if (role && userRole && userRole !== role) {
        // If an unauthorized role attempts to view this screen, boot to their proper portal
        const dest =
          userRole === "ADMIN"
            ? "/admin"
            : userRole === "MANAGER"
            ? "/manager"
            : userRole === "DRIVER"
            ? "/driver"
            : userRole === "AGENT"
            ? "/agent"
            : "/customer";
        window.location.replace(dest);
      }
    }
  }, [status, session, role]);

  // If session is loading, show clean loading placeholder rather than raw unauthenticated screen
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-3">
        <div className="size-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Verifying security session...
        </span>
      </div>
    );
  }

  // Never render protected children if unauthenticated
  if (status === "unauthenticated" || !session) {
    return null;
  }

  return (
    <SidebarProvider>
      <LayoutContent role={role}>{children}</LayoutContent>
    </SidebarProvider>
  );
};

export default AppLayout;
