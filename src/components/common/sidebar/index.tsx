"use client";

import { CollapsibleGroup } from "@/components/tailgrids/core/collapsible";
import { cn } from "@/utils/cn";
import Logo from "@/components/brand/Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { getNavDataByRole } from "./data";
import { CloseIcon, SidebarExpandedIcon, ThreeDots } from "./icon";
import NavItem from "./nav-item";
import { findActiveGroupKey } from "./utils";

export default function Sidebar({
  role = "ADMIN",
  isSidebarOpen,
  toggleSidebar,
  isMobileSheet = false,
  onItemClick,
}: {
  role?: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isMobileSheet?: boolean;
  onItemClick?: () => void;
}) {
  const pathname = usePathname();

  const navData = useMemo(() => getNavDataByRole(role), [role]);

  const activeGroupKey = useMemo(() => findActiveGroupKey(pathname), [pathname]);

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    () => new Set<string>(activeGroupKey ? [activeGroupKey] : [])
  );

  const homeHref = useMemo(() => {
    switch (role) {
      case "CUSTOMER":
        return "/customer";
      case "DRIVER":
        return "/driver";
      case "AGENT":
        return "/agent";
      case "MANAGER":
        return "/manager";
      default:
        return "/admin";
    }
  }, [role]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Header */}
      <div
        className={cn(
          "flex items-center px-4 pt-6 pb-2 text-text-primary",
          isSidebarOpen ? "justify-between" : "flex-col justify-center gap-4"
        )}
      >
        <Logo
          size="md"
          iconOnly={!isSidebarOpen}
          href={homeHref}
        />

        <button
          onClick={toggleSidebar}
          className={cn(
            "p-1.5 transition-colors cursor-pointer rounded-lg",
            isMobileSheet
              ? "text-icon-tertiary hover:bg-background-gray-primary hover:text-text-primary"
              : "text-icon-tertiary hover:text-text-primary hover:bg-background-gray-primary/60"
          )}
          aria-label={isMobileSheet ? "Close sidebar" : "Toggle sidebar"}
        >
          {isMobileSheet ? <CloseIcon /> : <SidebarExpandedIcon />}
        </button>
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          "flex-1 overflow-y-auto custom-scrollbar",
          isSidebarOpen ? "mt-4 space-y-6 px-4" : "mt-4 px-2"
        )}
      >
        <CollapsibleGroup
          expandedKeys={expandedKeys}
          onExpandedChange={setExpandedKeys}
        >
          {navData.map((section) => (
            <div key={section.label}>
              {/* Section Header or Divider */}
              {isSidebarOpen ? (
                <p className="mt-4 mb-2 px-2 text-[11px] font-semibold tracking-wider text-text-tertiary uppercase">
                  {section.label}
                </p>
              ) : (
                section.label && (
                  <span className="flex items-center justify-center pt-4 pb-2 text-icon-tertiary">
                    <ThreeDots />
                  </span>
                )
              )}

              <div className={cn("space-y-1", !isSidebarOpen && "space-y-1.5")}>
                {section.items.map((item) => (
                  <NavItem
                    key={item.title}
                    id={item.title}
                    icon={item.icon}
                    label={item.title}
                    href={item.url}
                    items={item.items}
                    collapsed={!isSidebarOpen}
                    onItemClick={onItemClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </CollapsibleGroup>
      </nav>

      {/* Footer Info Card — only visible when expanded */}
      {isSidebarOpen && (
        <div className="px-4 py-4">
          <div className="rounded-xl border border-card-border bg-card-surface-area p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-semibold text-text-primary">
                F Net Water Accra
              </p>
            </div>
            <p className="text-[11px] text-text-tertiary">
              Fleet & inventory synchronized
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
