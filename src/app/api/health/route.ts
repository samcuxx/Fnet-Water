import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let dbStatus = "connected";
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = "standby";
    }

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "fnet-water-hub",
      database: dbStatus,
      uptimeSeconds: Math.floor(process.uptime()),
    });
  } catch (err) {
    return NextResponse.json(
      { status: "unhealthy", error: String(err) },
      { status: 500 }
    );
  }
}
