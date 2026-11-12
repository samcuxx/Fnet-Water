"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";
import MobileDock from "./MobileDock";
import { SkeletonAppShell } from "@/components/ui/skeleton";
import type { RoleType } from "@/types/next-auth";

interface AppLayoutProps {
  children: React.ReactNode;
  role?: RoleType | RoleType[];
}

const LayoutContent: React.FC<{
  children: React.ReactNode;
  role?: RoleType | RoleType[];
}> = ({ children, role = "ADMIN" }) => {
  const { data: session } = useSession();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const isSidebarVisible = isExpanded || isHovered;

  // Render sidebar according to the user's logged-in session role
  const sessionRole = (session?.user as { role?: RoleType })?.role;
  const activeRole: RoleType = sessionRole || (Array.isArray(role) ? role[0] : role);

  return (
    <div className="min-h-screen bg-[#071E3D] text-gray-900 dark:text-gray-100 flex p-0 sm:p-2.5 lg:p-3 xl:p-3.5 antialiased selection:bg-brand-500 selection:text-white">
      <AppSidebar role={activeRole} />
      <Backdrop />

      {/* Floating Island: Elevated white canvas with ultra-smooth rounded corners */}
      <motion.div
        initial={{ opacity: 0, scale: 0.995 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className={`flex-1 flex flex-col min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-1.5rem)] bg-white dark:bg-gray-950 rounded-none sm:rounded-[28px] lg:rounded-[36px] shadow-2xl shadow-black/35 overflow-hidden transition-all duration-300 ease-in-out ${
          isSidebarVisible ? "xl:ml-[270px]" : "xl:ml-[84px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto pb-24 lg:pb-8 overflow-y-auto">
          {children}
        </main>
      </motion.div>

      {/* Floating Mobile Dock for Task Navigation */}
      <MobileDock role={activeRole} />
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
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  // 3. Client Role Enforcement (ADMIN has oversight on ADMIN and MANAGER operations)
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userRole = (session.user as { role?: RoleType }).role;
      if (role && userRole) {
        const allowedRoles: RoleType[] = Array.isArray(role) ? role : [role];
        const isAllowed =
          userRole === "ADMIN" ||
          allowedRoles.includes(userRole);

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

  // If session is loading, show clean skeleton shell rather than raw spinner
  if (status === "loading") {
    return <SkeletonAppShell />;
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
