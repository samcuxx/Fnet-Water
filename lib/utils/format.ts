import { format, formatDistanceToNowStrict, isToday, isYesterday } from "date-fns";

/** Presentation helpers. Safe on both server and client. */

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  return format(new Date(value), "d MMM yyyy");
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  return format(new Date(value), "d MMM yyyy, h:mm a");
}

export function formatTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  return format(new Date(value), "h:mm a");
}

/** "Today, 2:30 PM" / "Yesterday, 9:05 AM" / "12 Aug 2026, 4:15 PM" */
export function formatFriendlyDateTime(
  value: Date | string | null | undefined,
): string {
  if (!value) return "—";

  const date = new Date(value);

  if (isToday(date)) return `Today, ${format(date, "h:mm a")}`;
  if (isYesterday(date)) return `Yesterday, ${format(date, "h:mm a")}`;

  return format(date, "d MMM yyyy, h:mm a");
}

/** "3 hours ago" */
export function formatRelative(value: Date | string | null | undefined): string {
  if (!value) return "—";
  return `${formatDistanceToNowStrict(new Date(value))} ago`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-GH").format(value);
}

export function formatPercent(
  value: number | null | undefined,
  fractionDigits = 1,
): string {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("en-GH", {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** Converts an enum-ish constant into readable text: `OUT_FOR_DELIVERY` → `Out for delivery`. */
export function humanizeEnum(value: string | null | undefined): string {
  if (!value) return "—";

  const lowercaseWords = new Set(["for", "to", "of", "on", "at", "in", "and", "the"]);

  return value
    .toLowerCase()
    .split("_")
    .map((word, index) =>
      index > 0 && lowercaseWords.has(word)
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

/** Masks all but the last four digits of a phone number. */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  if (phone.length <= 4) return phone;
  return `${"•".repeat(phone.length - 4)}${phone.slice(-4)}`;
}

export function initials(fullName: string | null | undefined): string {
  if (!fullName) return "?";

  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return count === 1 ? singular : plural;
}

export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}
