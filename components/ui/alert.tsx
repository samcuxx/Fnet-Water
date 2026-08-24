import * as React from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";

type AlertTone = "info" | "success" | "warning" | "danger";

const TONES: Record<
  AlertTone,
  { container: string; icon: React.ComponentType<{ className?: string }> }
> = {
  info: {
    container: "border-info-100 bg-info-50 text-info-600",
    icon: Info,
  },
  success: {
    container: "border-success-100 bg-success-50 text-success-700",
    icon: CheckCircle2,
  },
  warning: {
    container: "border-warning-100 bg-warning-50 text-warning-700",
    icon: AlertTriangle,
  },
  danger: {
    container: "border-danger-100 bg-danger-50 text-danger-700",
    icon: XCircle,
  },
};

/**
 * Inline feedback for form results and page-level notices.
 *
 * Errors use `role="alert"` so they are announced immediately; informational
 * notices use `role="status"` so they do not interrupt.
 */
export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: AlertTone;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const { container, icon: Icon } = TONES[tone];

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
        container,
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}
