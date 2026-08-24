import { prisma } from "@/lib/db";

/**
 * Liveness and readiness probe, used by the Docker Compose healthcheck.
 *
 * Deliberately anonymous but deliberately uninformative: it confirms the
 * process is up and can reach the database, without disclosing versions,
 * connection details or error text that would help an attacker.
 */
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return Response.json({ status: "ok" });
  } catch (error) {
    console.error("Health check failed", error);

    return Response.json({ status: "degraded" }, { status: 503 });
  }
}
