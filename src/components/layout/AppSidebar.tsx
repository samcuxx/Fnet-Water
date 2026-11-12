"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  RotateCcw,
  Boxes,
  Cpu,
  Layers,
  CreditCard,
  CalendarCheck,
  BarChart3,
  Users,
  UserCheck,
  Compass,
  Briefcase,
  Palette,
  Bell,
  LogOut,
  ChevronDown,
  X,
  Home,
  MapPin,
  Gift,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import Logo from "@/components/brand/Logo";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface NavItem {
  name: string;
  href?: string;
  icon: React.ReactNode;
  badge?: string;
  subItems?: {
    name: string;
    href: string;
    badge?: string;
  }[];
}

interface AppSidebarProps {
  role?: "ADMIN" | "MANAGER" | "DRIVER" | "AGENT" | "CUSTOMER";
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ role = "ADMIN" }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } =
    useSidebar();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const isSidebarVisible = isExpanded || isHovered || isMobileOpen;

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu((prev) => (prev === name ? null : name));
  };

  // Nav menus configured with official Lucide Icons for each role
  const navItemsByRole: Record<string, NavItem[]> = {
    ADMIN: [
      {
        name: "Dashboard",
        href: "/admin",
        icon: <LayoutDashboard className="size-5 shrink-0" />,
      },
      {
        name: "Water Orders",
        icon: <ShoppingBag className="size-5 shrink-0" />,
        subItems: [
          { name: "All Orders", href: "/admin/orders" },
          { name: "Deliveries & Dispatch", href: "/admin/deliveries" },
          { name: "Bottle Exchanges", href: "/admin/bottles" },
        ],
      },
      {
        name: "Inventory & Assets",
        icon: <Boxes className="size-5 shrink-0" />,
        subItems: [
          { name: "Inventory & Stock", href: "/admin/inventory" },
          { name: "Smart Dispensers", href: "/admin/dispensers" },
          { name: "Products Catalog", href: "/admin/products" },
        ],
      },
      {
        name: "Finance & Payments",
        icon: <CreditCard className="size-5 shrink-0" />,
        subItems: [
          { name: "MoMo & Card Transactions", href: "/admin/finance/transactions" },
          { name: "Installment Contracts", href: "/admin/finance/installments" },
        ],
      },
      {
        name: "Reports & Analytics",
        href: "/admin/reports",
        icon: <BarChart3 className="size-5 shrink-0" />,
      },
      {
        name: "Users & Fleet",
        icon: <Users className="size-5 shrink-0" />,
        subItems: [
          { name: "Staff Directory", href: "/admin/users" },
          { name: "Customer Directory", href: "/admin/customers" },
          { name: "Drivers & Routes", href: "/admin/drivers" },
          { name: "Field Agents", href: "/admin/agents" },
        ],
      },
      {
        name: "Component Library",
        href: "/ui-showcase",
        badge: "PRO",
        icon: <Palette className="size-5 shrink-0" />,
      },
      {
        name: "Notifications",
        href: "/notifications",
        icon: <Bell className="size-5 shrink-0" />,
      },
    ],
    MANAGER: [
      {
        name: "Logistics Hub",
        href: "/manager",
        icon: <LayoutDashboard className="size-5 shrink-0" />,
      },
      {
        name: "Deliveries Queue",
        href: "/manager/deliveries",
        icon: <Truck className="size-5 shrink-0" />,
      },
      {
        name: "Inventory & Stock",
        href: "/manager/inventory",
        icon: <Boxes className="size-5 shrink-0" />,
      },
      {
        name: "Smart Dispensers",
        href: "/manager/dispensers",
        icon: <Cpu className="size-5 shrink-0" />,
      },
      {
        name: "Operational Reports",
        href: "/admin/reports",
        icon: <BarChart3 className="size-5 shrink-0" />,
      },
      {
        name: "Notifications",
        href: "/notifications",
        icon: <Bell className="size-5 shrink-0" />,
      },
    ],
    DRIVER: [
      {
        name: "Dispatch Dashboard",
        href: "/driver",
        icon: <Truck className="size-5 shrink-0" />,
      },
      {
        name: "Notifications",
        href: "/notifications",
        icon: <Bell className="size-5 shrink-0" />,
      },
    ],
    AGENT: [
      {
        name: "Agent Portal",
        href: "/agent",
        icon: <Briefcase className="size-5 shrink-0" />,
      },
      {
        name: "Notifications",
        href: "/notifications",
        icon: <Bell className="size-5 shrink-0" />,
      },
    ],
    CUSTOMER: [
      {
        name: "My Portal",
        href: "/customer",
        icon: <Home className="size-5 shrink-0" />,
      },
      {
        name: "Order Water",
        href: "/customer/order",
        icon: <ShoppingBag className="size-5 shrink-0" />,
      },
      {
        name: "My Orders",
        href: "/customer/orders",
        icon: <Boxes className="size-5 shrink-0" />,
      },
      {
        name: "Address Book",
        href: "/customer/addresses",
        icon: <MapPin className="size-5 shrink-0" />,
      },
      {
        name: "Smart Dispenser",
        href: "/customer/dispenser",
        icon: <Cpu className="size-5 shrink-0" />,
      },
      {
        name: "Refer Friends",
        href: "/customer/referrals",
        icon: <Gift className="size-5 shrink-0" />,
      },
      {
        name: "Notifications",
        href: "/notifications",
        icon: <Bell className="size-5 shrink-0" />,
      },
    ],
  };

  const navItems = navItemsByRole[role] || navItemsByRole.ADMIN;

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 z-50 flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-xl transition-all duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0 w-[270px]" : isSidebarVisible ? "w-[270px]" : "w-[80px]"
        } ${
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full xl:translate-x-0"
        }`}
      >
        {/* Sidebar Header with Brand Logo */}
        <div
          className={`flex items-center h-18 border-b border-sidebar-border transition-all duration-300 ${
            isSidebarVisible ? "justify-between px-5" : "justify-center px-0"
          }`}
        >
          <div className="flex items-center justify-center overflow-hidden">
            <Logo size="sm" variant="dark" iconOnly={!isSidebarVisible} />
          </div>

          {isSidebarVisible && isMobileOpen && (
            <button
              type="button"
              onClick={toggleMobileSidebar}
              aria-label="Close sidebar"
              className="xl:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground p-1 rounded-lg hover:bg-sidebar-accent transition cursor-pointer"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Navigation Section Header */}
        {isSidebarVisible && (
          <div className="px-5 pt-5 pb-1 text-[10px] font-bold tracking-widest text-sidebar-foreground/50 uppercase select-none">
            Navigation
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 custom-scrollbar">
          {navItems.map((item) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isItemActive =
              (item.href && pathname === item.href) ||
              item.subItems?.some((sub) => pathname === sub.href);
            const isSubmenuOpen = openSubmenu === item.name || isItemActive;

            const buttonContent = (
              <span
                className={`shrink-0 transition-colors ${
                  isItemActive
                    ? "text-sky-400"
                    : "text-blue-200/70 group-hover:text-white"
                }`}
              >
                {item.icon}
              </span>
            );

            return (
              <div key={item.name} className="relative">
                {hasSubItems ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSubmenu(item.name)}
                      className={`flex items-center w-full gap-3 px-3.5 py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all group cursor-pointer ${
                        isItemActive
                          ? "bg-sidebar-accent text-sidebar-foreground font-semibold shadow-xs"
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      } ${!isSidebarVisible ? "justify-center px-0" : ""}`}
                    >
                      {!isSidebarVisible ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="p-2">{buttonContent}</span>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {item.name}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        buttonContent
                      )}

                      {isSidebarVisible && (
                        <>
                          <span className="flex-1 text-left text-xs font-medium">
                            {item.name}
                          </span>
                          <ChevronDown
                            className={`size-4 text-sidebar-foreground/60 transition-transform duration-200 ${
                              isSubmenuOpen ? "rotate-180 text-sidebar-foreground" : ""
                            }`}
                          />
                        </>
                      )}
                    </button>

                    {/* Submenu Accordion with Framer Motion */}
                    <AnimatePresence initial={false}>
                      {isSidebarVisible && isSubmenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="pl-9 pr-2 py-1 space-y-1 overflow-hidden"
                        >
                          {item.subItems?.map((sub) => {
                            const isSubActive = pathname === sub.href;
                            return (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                onClick={() => {
                                  if (isMobileOpen) toggleMobileSidebar();
                                }}
                                className={`block py-1.5 px-3 rounded-md text-xs font-medium transition ${
                                  isSubActive
                                    ? "bg-sidebar-accent text-sidebar-foreground font-semibold shadow-xs"
                                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                                }`}
                              >
                                {sub.name}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href={item.href || "#"}
                    onClick={() => {
                      if (isMobileOpen) toggleMobileSidebar();
                    }}
                    className={`flex items-center w-full gap-3 px-3.5 py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all group ${
                      isItemActive
                        ? "bg-sidebar-accent text-sidebar-foreground font-semibold shadow-xs"
                        : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    } ${!isSidebarVisible ? "justify-center px-0" : ""}`}
                  >
                    {!isSidebarVisible ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="p-2">{buttonContent}</span>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.name}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      buttonContent
                    )}

                    {isSidebarVisible && (
                      <>
                        <span className="flex-1 text-left text-xs font-medium">
                          {item.name}
                        </span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-400/20 text-sky-200 border border-sky-400/30">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* USER ACCOUNT Section at Bottom of Sidebar */}
        <div className="p-3.5 border-t border-sidebar-border">
          {isSidebarVisible ? (
            <div>
              <div className="text-[10px] font-bold tracking-widest text-sidebar-foreground/50 uppercase px-2 mb-2 select-none">
                User Account
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-sidebar-accent/70 hover:bg-sidebar-accent transition-colors">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 flex-1 min-w-0 group"
                  title="View Profile Settings"
                >
                  <Avatar className="size-9 ring-2 ring-primary/30 shrink-0">
                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                      {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-sidebar-foreground truncate group-hover:text-primary transition-colors">
                      {session?.user?.name || "Kwaku Frimpong"}
                    </div>
                    <div className="text-[10px] text-sidebar-foreground/70 truncate">
                      #{role.toLowerCase()}-2026
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  title="Sign out of account"
                  className="size-7 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground flex items-center justify-center transition shrink-0 cursor-pointer"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/profile"
                    title="View Profile Settings"
                    className="relative size-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shadow-xs hover:scale-105 transition"
                  >
                    {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
                    <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-400 ring-2 ring-sidebar" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {session?.user?.name || "Profile"} (#{role})
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default AppSidebar;
