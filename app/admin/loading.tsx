export default function Loading() {
  return (
    <div role="status" aria-label="Loading dashboard">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="h-7 w-56 rounded-md bg-slate-100" />
          <div className="h-4 w-80 max-w-full rounded-md bg-slate-100" />
        </div>
        <div className="h-9 w-72 rounded-lg bg-slate-100" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-32 rounded-xl border border-slate-200 bg-white"
          />
        ))}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-72 rounded-xl border border-slate-200 bg-white"
          />
        ))}
      </div>

      <div className="mt-3 h-24 rounded-xl border border-slate-200 bg-white" />

      <span className="sr-only">Loading…</span>
    </div>
  );
}
