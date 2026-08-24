import { Skeleton, StatCardSkeleton, TableSkeleton } from "@/components/ui";

/** Loading placeholder shared by every portal dashboard. */
export function DashboardSkeleton({ tiles = 4 }: { tiles?: number }) {
  return (
    <div role="status" aria-label="Loading dashboard">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-2 h-4 w-80 max-w-full" />

      <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: tiles }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      <div className="mt-6 rounded-card border border-slate-200/70 bg-white shadow-card">
        <TableSkeleton rows={6} columns={6} />
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}
