import { NextResponse } from "next/server";
import { getDispenserCatalog } from "@/lib/dispenser-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const catalog = getDispenserCatalog();
  return NextResponse.json(
    { success: true, data: catalog },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
