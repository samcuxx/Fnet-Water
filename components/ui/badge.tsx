import * as React from "react";

import { cn } from "@/lib/utils/cn";
import { humanizeEnum } from "@/lib/utils/format";

export type BadgeTone =
  | "neutral"
  | "brand"
  | "aqua"
  | "success"
  | "warning"
  | "danger"
  | "info";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
  aqua: "bg-aqua-50 text-aqua-700 ring-aqua-200",
  success: "bg-success-50 text-success-700 ring-success-100",
  warning: "bg-warning-50 text-warning-700 ring-warning-100",
  danger: "bg-danger-50 text-danger-700 ring-danger-100",
  info: "bg-info-50 text-info-600 ring-info-100",
};

export function Badge({
  className,
  tone = "neutral",
  withDot = false,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"span"> & {
  tone?: BadgeTone;
  withDot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONES[tone],
        className,
      )}
      {...props}
    >
      {withDot && (
        <span
          className="size-1.5 rounded-full bg-current opacity-70"
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

/**
 * Maps every workflow status in the system to a colour tone, so a status reads
 * the same wherever it appears. Colour is never the only signal — the label is
 * always rendered too, for colour-blind users.
 */
const STATUS_TONES: Record<string, BadgeTone> = {
  // Orders
  PENDING: "warning",
  CONFIRMED: "info",
  PROCESSING: "info",
  ASSIGNED: "brand",
  OUT_FOR_DELIVERY: "aqua",
  DELIVERED: "success",
  FAILED: "danger",
  CANCELLED: "neutral",

  // Order / payment status
  UNPAID: "danger",
  PARTIALLY_PAID: "warning",
  PAID: "success",
  REFUNDED: "neutral",

  // Payments
  PROCESSING_PAYMENT: "info",
  PENDING_RECONCILIATION: "warning",
  SUCCESSFUL: "success",
  REVERSED: "danger",
  PARTIALLY_REFUNDED: "warning",

  // Accounts
  ACTIVE: "success",
  INACTIVE: "neutral",
  SUSPENDED: "danger",
  PENDING_ACTIVATION: "warning",

  // Dispensers
  AVAILABLE: "success",
  RESERVED: "info",
  INSTALLED: "brand",
  UNDER_MAINTENANCE: "warning",
  FAULTY: "danger",
  RETRIEVED: "neutral",
  RETIRED: "neutral",

  // Ownership
  COMPANY_OWNED: "neutral",
  COMPANY_OWNED_INSTALLMENT: "info",
  CUSTOMER_OWNED: "success",

  // Installment plans
  DUE_SOON: "warning",
  OVERDUE: "danger",
  FULLY_PAID: "success",
  DEFAULTED: "danger",

  // Referrals
  QUALIFIED: "success",
  INVALID: "danger",

  // Inventory adjustments
  PENDING_APPROVAL: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  APPLIED: "success",

  // Maintenance
  OK: "success",
  SERVICE_DUE: "warning",
  UNDER_REPAIR: "info",
  FAULT_REPORTED: "danger",
};

export function statusTone(status: string | null | undefined): BadgeTone {
  if (!status) return "neutral";
  return STATUS_TONES[status] ?? "neutral";
}

/** Renders any workflow status consistently across every portal. */
export function StatusBadge({
  status,
  className,
}: {
  status: string | null | undefined;
  className?: string;
}) {
  return (
    <Badge tone={statusTone(status)} withDot className={className}>
      {humanizeEnum(status)}
    </Badge>
  );
}
