import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Prisma 7 uses a driver adapter rather than a bundled Rust engine, so the
 * connection pool is owned by `pg` and configured here.
 */
function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and configure it.",
    );
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}

// Next.js dev servers hot-reload modules, which would otherwise open a new
// connection pool on every edit until Postgres refuses connections.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type { PrismaClient } from "@/lib/generated/prisma/client";
