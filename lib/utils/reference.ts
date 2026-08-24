import { randomInt } from "node:crypto";

/**
 * Human-readable reference generators.
 *
 * Staff read these aloud on the phone, so the alphabet excludes characters that
 * are easily confused (I/1, O/0). Uniqueness is still enforced by database
 * constraints; these only reduce collisions and typos.
 */

const UNAMBIGUOUS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSuffix(length: number): string {
  let output = "";

  for (let i = 0; i < length; i += 1) {
    output += UNAMBIGUOUS[randomInt(UNAMBIGUOUS.length)];
  }

  return output;
}

function datePart(date = new Date()): string {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

/** e.g. `ORD-260824-K4M2XZ` */
export function orderNumber(date?: Date): string {
  return `ORD-${datePart(date)}-${randomSuffix(6)}`;
}

/** e.g. `DEL-260824-P7QW3T` */
export function deliveryNumber(date?: Date): string {
  return `DEL-${datePart(date)}-${randomSuffix(6)}`;
}

/** e.g. `PAY-260824-R9SD2K` */
export function paymentReference(date?: Date): string {
  return `PAY-${datePart(date)}-${randomSuffix(6)}`;
}

/** e.g. `PLN-260824-T3VB6M` */
export function planNumber(date?: Date): string {
  return `PLN-${datePart(date)}-${randomSuffix(6)}`;
}

/** e.g. `ADJ-260824-W5XC8N` */
export function adjustmentReference(date?: Date): string {
  return `ADJ-${datePart(date)}-${randomSuffix(6)}`;
}

/** e.g. `MOV-260824-Y2ZD4P` */
export function movementReference(date?: Date): string {
  return `MOV-${datePart(date)}-${randomSuffix(8)}`;
}

/** Sequential, zero-padded user code, e.g. `FNW-C-000123`. */
export function userCode(
  role: "ADMINISTRATOR" | "MANAGER" | "AGENT" | "DRIVER" | "CUSTOMER",
  sequence: number,
): string {
  const initial = role === "ADMINISTRATOR" ? "A" : role.charAt(0);
  return `FNW-${initial}-${String(sequence).padStart(6, "0")}`;
}

/** Customer-facing profile code, e.g. `CUS-000123`. */
export function customerCode(sequence: number): string {
  return `CUS-${String(sequence).padStart(6, "0")}`;
}

export function driverCode(sequence: number): string {
  return `DRV-${String(sequence).padStart(4, "0")}`;
}

export function agentCode(sequence: number): string {
  return `AGT-${String(sequence).padStart(4, "0")}`;
}

export function staffCode(sequence: number): string {
  return `STF-${String(sequence).padStart(4, "0")}`;
}

/** Shareable referral code, e.g. `FNET-K4M2XZ`. */
export function referralCode(): string {
  return `FNET-${randomSuffix(6)}`;
}

export function referralLink(code: string, appUrl?: string): string {
  const base = appUrl ?? process.env.APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/register?ref=${encodeURIComponent(code)}`;
}
