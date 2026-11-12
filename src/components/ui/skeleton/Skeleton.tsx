import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base primitive Skeleton component with smooth shimmer effect
 */
export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer bg-muted rounded-md ${className}`}
      {...props}
    />
  );
}

/**
 * 4-card operational KPI metrics skeleton matching the AeuxGlobal dashboard design
 */
export function SkeletonMetrics({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-3 sm:gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 sm:p-6 rounded-xl border border-border bg-card shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-24 rounded-lg" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <Skeleton className="h-8 w-32 rounded-xl" />
          <Skeleton className="h-3 w-40 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/**
 * Table skeleton with headers and realistic row placeholders
 */
export function SkeletonTable({
  rows = 5,
  columns = 6,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
        <Skeleton className="h-4 w-36 rounded-lg" />
        <Skeleton className="h-7 w-24 rounded-md" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="py-3 px-4">
                  <Skeleton className="h-3 w-20 rounded-md" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: columns }).map((_, c) => (
                  <td key={c} className="py-3.5 px-4">
                    {c === 0 ? (
                      <Skeleton className="h-4 w-28 rounded-lg" />
                    ) : c === 1 ? (
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-24 rounded-md" />
                        <Skeleton className="h-2.5 w-16 rounded-md" />
                      </div>
                    ) : c === columns - 1 ? (
                      <div className="flex justify-end">
                        <Skeleton className="h-6 w-14 rounded-md" />
                      </div>
                    ) : (
                      <Skeleton className="h-3.5 w-16 rounded-lg" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Card skeleton with header and customizable content blocks
 */
export function SkeletonCard({
  lines = 4,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div
      className={`p-5 sm:p-6 rounded-xl border border-border bg-card text-card-foreground shadow-xs space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32 rounded-lg" />
          <Skeleton className="h-3 w-48 rounded-md" />
        </div>
        <Skeleton className="size-8 rounded-md" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={`h-4 rounded-xl ${
              i === lines - 1 ? "w-3/5" : i % 2 === 0 ? "w-full" : "w-4/5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Feed / List items skeleton (e.g. for delivery stops, addresses, or order history cards)
 */
export function SkeletonFeed({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-xl border border-border bg-card text-card-foreground shadow-xs flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Skeleton className="size-10 rounded-md shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-3.5 w-36 rounded-lg" />
              <Skeleton className="h-2.5 w-48 rounded-md" />
            </div>
          </div>
          <div className="space-y-1.5 text-right shrink-0">
            <Skeleton className="h-4 w-16 rounded-lg ml-auto" />
            <Skeleton className="h-5 w-20 rounded-full ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Tax Receipt & Order Invoice skeleton
 */
export function SkeletonReceipt() {
  return (
    <div className="p-6 sm:p-8 rounded-xl border border-border bg-card text-card-foreground shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-md" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36 rounded-lg" />
            <Skeleton className="h-3 w-48 rounded-md" />
          </div>
        </div>
        <div className="space-y-1.5 text-right">
          <Skeleton className="h-4 w-24 rounded-lg ml-auto" />
          <Skeleton className="h-3 w-28 rounded-md ml-auto" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-border">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20 rounded-md" />
          <Skeleton className="h-4 w-44 rounded-lg" />
          <Skeleton className="h-3 w-56 rounded-md" />
        </div>
        <div className="space-y-2 sm:text-right">
          <Skeleton className="h-3 w-20 rounded-md sm:ml-auto" />
          <Skeleton className="h-4 w-40 rounded-lg sm:ml-auto" />
          <Skeleton className="h-3 w-52 rounded-md sm:ml-auto" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <div className="w-56 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20 rounded-lg" />
            <Skeleton className="h-5 w-24 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * IoT Smart Dispenser Telemetry skeleton
 */
export function SkeletonTelemetry() {
  return (
    <div className="space-y-6">
      <SkeletonMetrics count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 p-6 rounded-xl border border-border bg-card text-card-foreground shadow-xs space-y-4">
          <Skeleton className="h-4 w-40 rounded-lg" />
          <div className="grid grid-cols-2 gap-4 pt-2">
            <Skeleton className="h-28 rounded-md" />
            <Skeleton className="h-28 rounded-md" />
            <Skeleton className="h-28 rounded-md" />
            <Skeleton className="h-28 rounded-md" />
          </div>
        </div>
        <div className="lg:col-span-5 p-6 rounded-xl border border-border bg-card text-card-foreground shadow-xs flex flex-col items-center justify-center space-y-4">
          <Skeleton className="h-4 w-32 rounded-lg" />
          <Skeleton className="size-44 rounded-full" />
          <Skeleton className="h-4 w-48 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Full layout preview shell used during initial authentication verification
 */
export function SkeletonAppShell() {
  return (
    <div className="min-h-screen bg-sidebar text-foreground flex p-0 sm:p-2.5 lg:p-3 xl:p-3.5">
      {/* Sidebar placeholder */}
      <aside className="hidden xl:flex flex-col w-[270px] h-screen bg-sidebar p-5 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-md bg-white/20" />
          <Skeleton className="h-4 w-32 rounded-lg bg-white/20" />
        </div>
        <div className="space-y-2 pt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md bg-white/10" />
          ))}
        </div>
        <div className="mt-auto pt-6 border-t border-white/10 flex items-center gap-3">
          <Skeleton className="size-9 rounded-full bg-white/20" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3 w-24 rounded-lg bg-white/20" />
            <Skeleton className="h-2 w-16 rounded-md bg-white/10" />
          </div>
        </div>
      </aside>

      {/* Floating Island canvas placeholder */}
      <div className="flex-1 flex flex-col min-h-[calc(100vh-1.5rem)] bg-background text-foreground rounded-none sm:rounded-xl lg:rounded-md p-5 sm:p-8 space-y-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded-xl" />
            <Skeleton className="h-3.5 w-64 rounded-lg" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
        <SkeletonMetrics count={4} />
        <div className="grid grid-cols-12 gap-5">
          <SkeletonCard className="col-span-12 lg:col-span-7 h-72" lines={4} />
          <SkeletonCard className="col-span-12 lg:col-span-5 h-72" lines={4} />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;

