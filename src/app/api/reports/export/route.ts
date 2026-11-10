import { NextRequest, NextResponse } from "next/server";
import {
  generateSalesCsv,
  generateDeliveriesCsv,
  generateInventoryCsv,
  DateRangeFilter,
} from "@/lib/reports-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "SALES").toUpperCase();
    const range = (searchParams.get("range") || "30_DAYS").toUpperCase() as DateRangeFilter;

    let csvContent = "";
    let filename = `fnet-report-${new Date().toISOString().split("T")[0]}.csv`;

    switch (type) {
      case "DELIVERIES":
        csvContent = await generateDeliveriesCsv();
        filename = `fnet-deliveries-report-${new Date().toISOString().split("T")[0]}.csv`;
        break;
      case "INVENTORY":
        csvContent = await generateInventoryCsv();
        filename = `fnet-inventory-report-${new Date().toISOString().split("T")[0]}.csv`;
        break;
      case "SALES":
      default:
        csvContent = await generateSalesCsv(range);
        filename = `fnet-sales-report-${new Date().toISOString().split("T")[0]}.csv`;
        break;
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[api/reports/export GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate CSV export" },
      { status: 500 }
    );
  }
}
