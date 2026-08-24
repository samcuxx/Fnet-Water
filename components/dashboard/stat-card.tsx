import type { ReactNode } from "react";

import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

type Tone = "brand" | "aqua" | "success" | "warning" | "danger";

const ICON_TONES: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-600",
  aqua: "bg-aqua-50 text-aqua-600",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-danger-50 text-danger-600",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
  delta,
  hint,
  footer,
}: {
  label: string;
  /** Pre-formatted, so money keeps its currency and decimal handling. */
  value: string;
  icon: LucideIcon;
  tone?: Tone;
  /** Period-over-period change. Positive values are not always good news, so `goodWhenUp` is explicit. */
  delta?: { value: string; direction: "up" | "down"; goodWhenUp?: boolean };
  hint?: string;
  footer?: ReactNode;
}) {
  const goodWhenUp = delta?.goodWhenUp ?? true;
  const isFavourable = delta
    ? delta.direction === (goodWhenUp ? "up" : "down")
    : false;
  const DeltaIcon = delta?.direction === "up" ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-money">
              {value}
            </p>
          </div>

          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              ICON_TONES[tone],
            )}
          >
            <Icon className="size-5" aria-hidden />
          </span>
        </div>

        {(delta || hint) && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            {delta && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-medium",
                  isFavourable ? "text-success-600" : "text-danger-600",
                )}
              >
                <DeltaIcon className="size-3.5" aria-hidden />
                {delta.value}
              </span>
            )}
            {hint && <span className="text-slate-400">{hint}</span>}
          </div>
        )}

        {footer && <div className="mt-3">{footer}</div>}
      </CardContent>
    </Card>
  );
}
