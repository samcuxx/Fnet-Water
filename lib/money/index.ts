import { Prisma } from "@/lib/generated/prisma/client";

/**
 * Money handling for F Net Water Hub.
 *
 * Every monetary value is a `Prisma.Decimal` backed by a `Decimal(14, 2)`
 * column. Floating-point arithmetic is never used for money, because binary
 * floats cannot represent decimal fractions exactly and the error compounds
 * across order totals, installment schedules and payment ledgers.
 */

export const Decimal = Prisma.Decimal;
export type Money = Prisma.Decimal;

export const CURRENCY = "GHS" as const;
export const CURRENCY_SYMBOL = "GH\u20B5" as const;

/** Decimal places used for all monetary storage and rounding. */
const SCALE = 2;

export const ZERO: Money = new Decimal(0);

type MoneyInput = Prisma.Decimal | number | string;

/** Coerces any supported input into a Decimal. Rejects non-finite numbers. */
export function money(value: MoneyInput): Money {
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new TypeError(`Invalid monetary amount: ${value}`);
  }

  return new Decimal(value);
}

/** Rounds to the storable scale, half-up, matching how invoices are read. */
export function round(value: MoneyInput): Money {
  return money(value).toDecimalPlaces(SCALE, Decimal.ROUND_HALF_UP);
}

export function add(...values: MoneyInput[]): Money {
  return round(values.reduce<Money>((total, v) => total.add(money(v)), ZERO));
}

export function subtract(minuend: MoneyInput, ...values: MoneyInput[]): Money {
  return round(
    values.reduce<Money>((total, v) => total.sub(money(v)), money(minuend)),
  );
}

/** Multiplies money by a unitless quantity or rate. */
export function multiply(value: MoneyInput, factor: MoneyInput): Money {
  return round(money(value).mul(money(factor)));
}

export function isZero(value: MoneyInput): boolean {
  return money(value).isZero();
}

export function isNegative(value: MoneyInput): boolean {
  return money(value).isNegative();
}

export function isPositive(value: MoneyInput): boolean {
  return money(value).greaterThan(0);
}

export function equals(a: MoneyInput, b: MoneyInput): boolean {
  return money(a).equals(money(b));
}

export function greaterThan(a: MoneyInput, b: MoneyInput): boolean {
  return money(a).greaterThan(money(b));
}

export function greaterThanOrEqual(a: MoneyInput, b: MoneyInput): boolean {
  return money(a).greaterThanOrEqualTo(money(b));
}

export function lessThan(a: MoneyInput, b: MoneyInput): boolean {
  return money(a).lessThan(money(b));
}

/** Clamps at zero. Used where a balance must never go negative. */
export function clampAtZero(value: MoneyInput): Money {
  const amount = money(value);
  return amount.isNegative() ? ZERO : round(amount);
}

export function min(a: MoneyInput, b: MoneyInput): Money {
  const left = money(a);
  const right = money(b);
  return round(left.lessThan(right) ? left : right);
}

export function max(a: MoneyInput, b: MoneyInput): Money {
  const left = money(a);
  const right = money(b);
  return round(left.greaterThan(right) ? left : right);
}

export function negate(value: MoneyInput): Money {
  return round(money(value).negated());
}

export function sum(values: MoneyInput[]): Money {
  return add(...values);
}

/**
 * Splits a total into `parts` instalments that add back to exactly the total.
 * The remainder lands on the final instalment, so a GH¢1000 plan over 3
 * payments becomes 333.33 / 333.33 / 333.34 rather than losing a pesewa.
 */
export function splitEvenly(total: MoneyInput, parts: number): Money[] {
  if (!Number.isInteger(parts) || parts < 1) {
    throw new RangeError(`Instalment count must be a positive integer, got ${parts}`);
  }

  const amount = round(total);
  const base = amount.div(parts).toDecimalPlaces(SCALE, Decimal.ROUND_DOWN);
  const instalments = Array.from({ length: parts }, () => base);
  const distributed = base.mul(parts);
  const remainder = amount.sub(distributed);

  instalments[parts - 1] = round(base.add(remainder));

  return instalments;
}

/**
 * Serializes money for the Server → Client boundary. Decimal instances are not
 * plain objects, so they are passed as strings and formatted on the client.
 */
export function toAmountString(value: MoneyInput): string {
  return round(value).toFixed(SCALE);
}

export function toNumber(value: MoneyInput): number {
  return round(value).toNumber();
}

/** Formats for display, e.g. `GH₵ 1,234.50`. */
export function formatMoney(
  value: MoneyInput,
  options: { withSymbol?: boolean } = {},
): string {
  const { withSymbol = true } = options;

  const formatted = new Intl.NumberFormat("en-GH", {
    minimumFractionDigits: SCALE,
    maximumFractionDigits: SCALE,
  }).format(toNumber(value));

  return withSymbol ? `${CURRENCY_SYMBOL} ${formatted}` : formatted;
}

/** Compact form for dashboard tiles, e.g. `GH₵ 58.4K`. */
export function formatMoneyCompact(value: MoneyInput): string {
  const amount = toNumber(value);
  const abs = Math.abs(amount);

  if (abs < 1000) {
    return formatMoney(amount);
  }

  const formatted = new Intl.NumberFormat("en-GH", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);

  return `${CURRENCY_SYMBOL} ${formatted}`;
}
