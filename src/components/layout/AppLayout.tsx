"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";

interface AppLayoutProps {
  children: React.ReactNode;
  role?: "ADMIN" | "MANAGER" | "DRIVER" | "AGENT" | "CUSTOMER";
}

const LayoutContent: React.FC<{
  children: React.ReactNode;
  role?: "ADMIN" | "MANAGER" | "DRIVER" | "AGENT" | "CUSTOMER";
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
  return (
    <SidebarProvider>
      <LayoutContent role={role}>{children}</LayoutContent>
    </SidebarProvider>
  );
};

export default AppLayout;
