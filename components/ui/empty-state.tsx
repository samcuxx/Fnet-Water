import * as React from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Empty and loading states.
 *
 * An empty table should explain why it is empty and what to do next, rather
 * than leaving a blank panel that reads as a broken page.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-50">
          <Icon className="size-6 text-brand-600" />
        </div>
      )}

      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>

      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Shimmer placeholder. `aria-hidden` because the label lives on the region. */
export function Skeleton({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-slate-200/70", className)}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3 p-5" role="status" aria-label="Loading data">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <Skeleton
              key={columnIndex}
              className={cn("h-4 flex-1", columnIndex === 0 && "max-w-[8rem]")}
            />
          ))}
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-card border border-slate-200/70 bg-white p-5 shadow-card">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-32" />
      <Skeleton className="mt-3 h-3 w-20" />
    </div>
  );
}
