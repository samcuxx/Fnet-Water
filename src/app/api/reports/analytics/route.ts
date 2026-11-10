import { NextRequest, NextResponse } from "next/server";
import { getBusinessAnalytics, DateRangeFilter } from "@/lib/reports-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rangeParam = (searchParams.get("range") || "30_DAYS").toUpperCase() as DateRangeFilter;

    const validRanges: DateRangeFilter[] = ["TODAY", "7_DAYS", "30_DAYS", "THIS_MONTH", "ALL_TIME"];
    const range = validRanges.includes(rangeParam) ? rangeParam : "30_DAYS";

    const analytics = await getBusinessAnalytics(range);

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("[api/reports/analytics GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load business analytics" },
      { status: 500 }
    );
  }
}
