"use client";

import { cn } from "@/utils/cn";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import React from "react";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  placement = "bottom end",
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
  placement?: string;
}) {
  const align = placement.includes("end") ? "end" : placement.includes("start") ? "start" : "center";
  const side = placement.includes("top") ? "top" : "bottom";

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        side={side as any}
        align={align as any}
        className={cn(
          "z-50 min-w-48 overflow-hidden rounded-xl border border-card-border bg-card-background p-1.5 text-text-primary shadow-theme-lg animate-in fade-in-80",
          className,
        )}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-3 py-2 text-sm font-semibold text-text-primary", className)} {...props}>
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  className,
  children,
  href,
  render,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
  href?: string;
  render?: (props: any) => React.ReactNode;
}) {
  const content = (
    <DropdownMenuPrimitive.Item
      className={cn(
        "group flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-text-secondary outline-none transition-colors hover:bg-background-gray-primary hover:text-text-primary focus:bg-background-gray-primary focus:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  );

  if (render && href) {
    return <>{render({ href, children: content })}</>;
  }

  return content;
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("my-1 h-px bg-border-primary", className)}
      {...props}
    />
  );
}

export function DropdownMenuSection({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-0.5", className)} {...props}>
      {children}
    </div>
  );
}
