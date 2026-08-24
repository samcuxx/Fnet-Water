import "server-only";

import bcrypt from "bcryptjs";

/**
 * Password hashing.
 *
 * bcrypt at cost 12 is a deliberate choice over a native Argon2 binding: it is
 * pure JavaScript, so it builds identically on Windows development machines and
 * Alpine containers without a toolchain, and cost 12 keeps verification in the
 * ~250ms range that makes offline cracking expensive.
 *
 * Plaintext passwords are never stored, logged, or returned.
 */
const COST = 12;

export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, COST);
}

export async function verifyPassword(
  plaintext: string,
  hash: string,
): Promise<boolean> {
  // bcrypt.compare is constant-time with respect to the hash contents.
  return bcrypt.compare(plaintext, hash);
}

/**
 * Burns roughly the same time as a real verification when the account does not
 * exist, so response timing does not reveal which emails are registered.
 */
export async function fakeVerify(): Promise<void> {
  await bcrypt.compare(
    "timing-equalisation",
    "$2b$12$vJc8Y2wZ6nO7pQ1rS3tU5eW7xY9zA1bC3dE5fG7hI9jK1lM3nO5pQ",
  );
}
