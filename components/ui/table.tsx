import * as React from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Table primitives.
 *
 * `Table` wraps in a horizontally scrollable container so wide operational
 * tables remain usable on a phone without breaking the layout.
 */
export function Table({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"table">) {
  return (
    <div className="-mx-4 overflow-x-auto scrollbar-slim sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <table
          className={cn("min-w-full border-collapse text-sm", className)}
          {...props}
        >
          {children}
        </table>
      </div>
    </div>
  );
}

export function THead({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"thead">) {
  return (
    <thead
      className={cn("border-b border-slate-200 text-left", className)}
      {...props}
    />
  );
}

export function TBody({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"tbody">) {
  return <tbody className={cn("divide-y divide-slate-100", className)} {...props} />;
}

export function TR({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"tr">) {
  return <tr className={cn("transition-colors hover:bg-slate-50/70", className)} {...props} />;
}

export function TH({
  className,
  numeric = false,
  ...props
}: React.ComponentPropsWithoutRef<"th"> & { numeric?: boolean }) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500",
        numeric && "text-right",
        className,
      )}
      {...props}
    />
  );
}

export function TD({
  className,
  numeric = false,
  ...props
}: React.ComponentPropsWithoutRef<"td"> & { numeric?: boolean }) {
  return (
    <td
      className={cn(
        "px-4 py-3 text-slate-700",
        numeric && "text-right tabular-money",
        className,
      )}
      {...props}
    />
  );
}
