import type { ReactNode } from "react";

import {
  Banknote,
  Boxes,
  Droplets,
  Package,
  Receipt,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { AdminSummary } from "@/services/dashboard";
import { formatMoney } from "@/lib/money";
import { formatNumber, humanizeEnum, initials } from "@/lib/utils";
import { cn } from "@/lib/utils/cn";

const PERIODS = ["7 days", "30 days", "90 days", "All time"] as const;
const AVATAR_TONES = [
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
] as const;

/**
 * Admin home layout: header + period chips, six KPIs, three middle columns,
 * then a full-width strip. Period chips are presentational for now.
 */
export function AdminOverview({ summary }: { summary: AdminSummary }) {
  const filledWarehouse = summary.stock.FILLED_WAREHOUSE ?? 0;
  const attentionRows = [
    {
      label: "Delivery reconciliation",
      value:
        summary.attention.failedDeliveries > 0
          ? formatNumber(summary.attention.failedDeliveries)
          : "Clear",
      tone:
        summary.attention.failedDeliveries > 0
          ? ("warning" as const)
          : ("ok" as const),
    },
    {
      label: "Overdue installments",
      value:
        summary.attention.overdueInstallments > 0
          ? formatNumber(summary.attention.overdueInstallments)
          : "Clear",
      tone:
        summary.attention.overdueInstallments > 0
          ? ("warning" as const)
          : ("ok" as const),
    },
    {
      label: "Inventory adjustments",
      value:
        summary.attention.pendingAdjustments > 0
          ? formatNumber(summary.attention.pendingAdjustments)
          : "Clear",
      tone:
        summary.attention.pendingAdjustments > 0
          ? ("warning" as const)
          : ("ok" as const),
    },
    {
      label: "Tracker alerts",
      value:
        summary.attention.openTrackerAlerts > 0
          ? formatNumber(summary.attention.openTrackerAlerts)
          : "Clear",
      tone:
        summary.attention.openTrackerAlerts > 0
          ? ("warning" as const)
          : ("ok" as const),
    },
    {
      label: "Filled warehouse stock",
      value: formatNumber(filledWarehouse),
      tone: "neutral" as const,
    },
    {
      label: "Outstanding bottles",
      value: formatNumber(summary.bottleShortages.bottles),
      tone:
        summary.bottleShortages.bottles > 0
          ? ("warning" as const)
          : ("ok" as const),
    },
  ];

  const trendPoints = [...summary.recentOrders]
    .reverse()
    .map((order) => Number(order.total));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Operations overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Orders, deliveries, bottle positions, and payment health.
          </p>
        </div>

        <div className="inline-flex w-fit items-center rounded-lg border border-slate-200 bg-surface p-1 text-xs font-medium">
          <span className="px-2.5 py-1.5 text-slate-400">Period</span>
          {PERIODS.map((period) => {
            const active = period === "All time";

            return (
              <span
                key={period}
                className={cn(
                  "rounded-md px-2.5 py-1.5",
                  active
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-400",
                )}
              >
                {period}
              </span>
            );
          })}
        </div>
      </header>

      <section
        aria-label="Key figures"
        className="grid grid-cols-2 gap-3 xl:grid-cols-6"
      >
        <MetricCard
          label="Net revenue"
          value={formatMoney(summary.revenue)}
          hint="Payments less reversals"
          icon={Banknote}
        />
        <MetricCard
          label="Outstanding"
          value={formatMoney(summary.outstanding)}
          hint="Orders and installments"
          icon={Receipt}
        />
        <MetricCard
          label="Delivered today"
          value={formatNumber(summary.deliveredToday)}
          hint="Completed rounds"
          icon={Truck}
        />
        <MetricCard
          label="Total orders"
          value={formatNumber(summary.orders)}
          hint="All channels"
          icon={Package}
        />
        <MetricCard
          label="Active customers"
          value={formatNumber(summary.customers)}
          hint="Registered accounts"
          icon={Users}
        />
        <MetricCard
          label="Bottle shortages"
          value={formatNumber(summary.bottleShortages.bottles)}
          hint={`${formatNumber(summary.bottleShortages.customers)} customers`}
          icon={Droplets}
        />
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <Panel
          title="Order trend"
          subtitle="Recent · All time"
          action={
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
              Daily
            </span>
          }
        >
          <TrendChart points={trendPoints} />
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#0056D2]" />
              Order value
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-sky-400" />
              Deliveries
            </span>
          </div>
        </Panel>

        <Panel
          title="Recent orders"
          subtitle="Latest placements across channels"
        >
          {summary.recentOrders.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Orders will rank here once customers start placing them.
            </p>
          ) : (
            <ol className="divide-y divide-slate-100">
              {summary.recentOrders.map((order, index) => (
                <li
                  key={order.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="w-4 shrink-0 text-xs tabular-nums text-slate-400">
                    {index + 1}
                  </span>
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                      AVATAR_TONES[index % AVATAR_TONES.length],
                    )}
                  >
                    {initials(order.customer.user.fullName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {order.customer.user.fullName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {order.orderNumber} · {formatNumber(order._count.items)}{" "}
                      items · {humanizeEnum(order.status)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium tabular-nums text-slate-700">
                    {formatMoney(order.total)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Panel
          title="Operations"
          subtitle="Exceptions and live configuration"
          action={
            <span className="text-xs font-medium text-[#0056D2]">Status</span>
          }
        >
          <ul className="divide-y divide-slate-100">
            {attentionRows.map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="text-sm text-slate-600">{row.label}</span>
                <StatusChip tone={row.tone}>{row.value}</StatusChip>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <section className="rounded-xl border border-slate-200 bg-surface px-5 py-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Boxes className="size-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Bottle shortage follow-up
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-500">
              {summary.bottleShortages.bottles > 0 ? (
                <>
                  {formatNumber(summary.bottleShortages.bottles)} bottles are
                  outstanding across{" "}
                  {formatNumber(summary.bottleShortages.customers)} customers.
                  Shortages stay on the ledger until they are returned, charged,
                  or written off.
                </>
              ) : (
                <>
                  No outstanding shortages. When a delivery returns fewer
                  empties than expected, the shortage will appear here for
                  follow-up.
                </>
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-surface px-4 py-4 transition-colors hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
          {label}
        </p>
        <Icon className="size-4 text-[#0056D2]" aria-hidden />
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight text-slate-900 tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
      <p className="mt-3 text-xs font-medium text-emerald-600">↗ 0.0%</p>
    </article>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-surface px-5 py-5">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function StatusChip({
  tone,
  children,
}: {
  tone: "ok" | "warning" | "neutral";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium",
        tone === "ok" && "bg-emerald-50 text-emerald-700",
        tone === "warning" && "bg-amber-50 text-amber-700",
        tone === "neutral" && "bg-slate-100 text-slate-600",
      )}
    >
      {children}
    </span>
  );
}

function TrendChart({ points }: { points: number[] }) {
  if (points.length < 2) {
    return (
      <p className="flex h-40 items-center justify-center text-sm text-slate-500">
        A trend appears after two or more recent orders.
      </p>
    );
  }

  const width = 320;
  const height = 160;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;

  const coords = points.map((value, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - 12 - ((value - min) / span) * (height - 24);
    return { x, y };
  });

  const line = coords.map(({ x, y }) => `${x},${y}`).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-40 w-full"
      role="img"
      aria-label="Recent order values"
    >
      <polygon points={area} fill="url(#admin-trend-fill)" opacity="0.35" />
      <polyline
        points={line}
        fill="none"
        stroke="#0056D2"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {coords.map((point, index) => (
        <circle
          key={`${point.x}-${index}`}
          cx={point.x}
          cy={point.y}
          r="3"
          fill="#0056D2"
        />
      ))}
      <defs>
        <linearGradient id="admin-trend-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0056D2" />
          <stop offset="100%" stopColor="#0056D2" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
