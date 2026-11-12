"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/tailgrids/core/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tailgrids/core/tooltip";
import { cn } from "@/utils/cn";
import { AltArrowUpIcon } from "@/utils/icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { isPathActive } from "./utils";

export interface NavItemProps {
  id?: string;
  icon?: React.ReactNode;
  label: string;
  href?: string;
  items?: Array<{ title: string; url?: string }>;
  collapsed?: boolean;
  onItemClick?: () => void;
}

export default function NavItem({
  id,
  icon,
  label,
  href,
  items,
  collapsed,
  onItemClick,
}: NavItemProps) {
  const pathname = usePathname();

  const isActive = href ? isPathActive(href, pathname) : false;
  const hasActiveChild = items?.some((item) => item.url && isPathActive(item.url, pathname));

  // Collapsed: icon-only button centered with tooltip
  if (collapsed) {
    return (
      <div className="flex justify-center">
        <Tooltip placement="right">
          <TooltipTrigger asChild>
            <Link
              href={href ?? items?.[0]?.url ?? "#"}
              onClick={onItemClick}
              className={cn(
                "flex size-10 items-center justify-center rounded-lg transition-colors duration-200",
                isActive || hasActiveChild
                  ? "bg-sidebar-navigation-nav-item-nav-hover-background text-primary"
                  : "text-icon-tertiary hover:bg-sidebar-navigation-nav-item-nav-hover-background hover:text-text-primary",
              )}
            >
              {icon}
            </Link>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>
            <p className="text-xs">{label}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  // Expanded with sub-items
  if (items && items.length > 0) {
    return (
      <Collapsible
        id={id}
        defaultOpen={hasActiveChild}
        className="border-none bg-transparent"
      >
        <CollapsibleTrigger
          className={cn(
            "group/collapsible flex w-full items-center justify-between gap-3 rounded-lg border-none bg-transparent px-3 py-2 text-sm font-medium transition-colors duration-200",
            hasActiveChild
              ? "bg-sidebar-navigation-nav-item-nav-hover-background text-text-primary"
              : "text-text-secondary hover:bg-sidebar-navigation-nav-item-nav-hover-background hover:text-text-primary",
          )}
        >
          <div className="flex flex-1 items-center gap-3">
            <span
              className={cn(
                "size-4.5 shrink-0 transition-colors duration-200",
                hasActiveChild
                  ? "text-primary"
                  : "text-icon-tertiary group-hover/collapsible:text-text-primary",
              )}
            >
              {icon}
            </span>
            <span className="truncate">{label}</span>
          </div>

          <AltArrowUpIcon className="size-4 shrink-0 rotate-180 text-icon-tertiary transition-transform duration-250 ease-out group-data-expanded:rotate-0 group-data-expanded/collapsible:rotate-0" />
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-1 space-y-1 pl-7">
          {items.map((item) => {
            const isChildActive = item.url ? isPathActive(item.url, pathname) : false;
            return (
              <Link
                key={item.title}
                href={item.url || "#"}
                onClick={onItemClick}
                className={cn(
                  "block rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150",
                  isChildActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-text-tertiary hover:bg-sidebar-navigation-nav-item-nav-hover-background hover:text-text-primary",
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Expanded: Single item
  return (
    <Link
      href={href || "#"}
      onClick={onItemClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
        isActive
          ? "bg-sidebar-navigation-nav-item-nav-hover-background text-primary font-semibold"
          : "text-text-secondary hover:bg-sidebar-navigation-nav-item-nav-hover-background hover:text-text-primary",
      )}
    >
      <span
        className={cn(
          "size-4.5 shrink-0 transition-colors duration-200",
          isActive ? "text-primary" : "text-icon-tertiary group-hover:text-text-primary",
        )}
      >
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}
