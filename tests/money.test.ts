import { describe, expect, it } from "vitest";

import {
  add,
  clampAtZero,
  formatMoney,
  money,
  multiply,
  splitEvenly,
  subtract,
  toAmountString,
} from "@/lib/money";

/**
 * Money is the highest-consequence arithmetic in the system: a dispenser's
 * ownership hinges on a plan balance reaching exactly zero.
 */
describe("money arithmetic", () => {
  it("does not accumulate binary floating-point error", () => {
    // 0.1 + 0.2 === 0.30000000000000004 in IEEE 754.
    expect(toAmountString(add("0.10", "0.20"))).toBe("0.30");
  });

  it("stays exact across many additions", () => {
    let total = money(0);

    for (let index = 0; index < 100; index += 1) {
      total = add(total, "0.07");
    }

    expect(toAmountString(total)).toBe("7.00");
  });

  it("rounds half-up at two places, the way an invoice reads", () => {
    expect(toAmountString(money("2.005").toDecimalPlaces(2))).toBe("2.01");
    expect(toAmountString(multiply("10.00", "0.0825"))).toBe("0.83");
  });

  it("computes an order total as subtotal plus fee less discount", () => {
    const subtotal = multiply("20.00", 5);
    const total = subtract(add(subtotal, "10.00"), "0.00");

    expect(toAmountString(total)).toBe("110.00");
  });

  it("clamps a balance at zero rather than going negative", () => {
    expect(toAmountString(clampAtZero(subtract("50.00", "80.00")))).toBe("0.00");
  });

  it("rejects a non-finite amount instead of silently producing NaN", () => {
    expect(() => money(Number.POSITIVE_INFINITY)).toThrow(TypeError);
    expect(() => money(Number.NaN)).toThrow(TypeError);
  });

  it("formats with the Ghana cedi symbol and two decimals", () => {
    expect(formatMoney("1234.5")).toBe("GH₵ 1,234.50");
    expect(formatMoney("1234.5", { withSymbol: false })).toBe("1,234.50");
  });
});

describe("splitEvenly", () => {
  it("distributes a remainder so instalments sum to the exact total", () => {
    const instalments = splitEvenly("1000.00", 3);

    expect(instalments.map(toAmountString)).toEqual([
      "333.33",
      "333.33",
      "333.34",
    ]);

    const sum = instalments.reduce((total, part) => add(total, part), money(0));
    expect(toAmountString(sum)).toBe("1000.00");
  });

  it("splits an evenly divisible total without a remainder", () => {
    const instalments = splitEvenly("1500.00", 12);

    expect(instalments.every((part) => toAmountString(part) === "125.00")).toBe(
      true,
    );
  });

  it("keeps the sum exact for an awkward total", () => {
    const instalments = splitEvenly("1400.00", 13);
    const sum = instalments.reduce((total, part) => add(total, part), money(0));

    expect(toAmountString(sum)).toBe("1400.00");
  });

  it("refuses a non-positive or fractional instalment count", () => {
    expect(() => splitEvenly("100.00", 0)).toThrow(RangeError);
    expect(() => splitEvenly("100.00", -1)).toThrow(RangeError);
    expect(() => splitEvenly("100.00", 2.5)).toThrow(RangeError);
  });
});
