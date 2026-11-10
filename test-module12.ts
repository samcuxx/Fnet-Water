import {
  getBusinessAnalytics,
  generateSalesCsv,
  generateDeliveriesCsv,
  generateInventoryCsv,
  DateRangeFilter,
} from "./src/lib/reports-store";

async function runModule12Tests() {
  console.log("=================================================");
  console.log("   MODULE 12: BUSINESS REPORTS & ANALYTICS TESTS  ");
  console.log("=================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${detail ? `-> ${detail}` : ""}`);
    }
  }

  try {
    // 1. Date Range Aggregation Tests
    console.log("--- 1. Analytics Aggregation Across Date Ranges ---");
    const ranges: DateRangeFilter[] = ["TODAY", "7_DAYS", "30_DAYS", "THIS_MONTH", "ALL_TIME"];

    for (const r of ranges) {
      const summary = await getBusinessAnalytics(r);
      assert(
        summary !== null && typeof summary.revenue.totalGrossGHS === "number",
        `getBusinessAnalytics (${r}) returns valid revenue structure`,
        `Revenue: ${summary?.revenue.totalGrossGHS}`
      );
      assert(
        summary.range === r,
        `getBusinessAnalytics (${r}) returns matching range tag`,
        `Range: ${summary?.range}`
      );
    }

    // 2. Sales & Revenue Calculation Tests
    console.log("\n--- 2. Sales & Revenue Accuracy ---");
    const analytics30 = await getBusinessAnalytics("30_DAYS");
    assert(
      analytics30.revenue.totalGrossGHS >= 0,
      "Total gross revenue is non-negative and formatted in GHS",
      `totalGrossGHS: ${analytics30.revenue.totalGrossGHS}`
    );
    assert(
      typeof analytics30.revenue.growthPercent === "number",
      "Revenue growth rate percentage is calculated",
      `growthPercent: ${analytics30.revenue.growthPercent}%`
    );
    assert(
      Array.isArray(analytics30.revenue.dailyTrend) && analytics30.revenue.dailyTrend.length > 0,
      "Daily revenue trend series is populated for chart visualization",
      `Days in trend: ${analytics30.revenue.dailyTrend.length}`
    );
    assert(
      Array.isArray(analytics30.revenue.monthlyTrend) && analytics30.revenue.monthlyTrend.length > 0,
      "Monthly revenue trend series is populated for bar chart comparison",
      `Months in trend: ${analytics30.revenue.monthlyTrend.length}`
    );

    // 3. Delivery Performance Metrics
    console.log("\n--- 3. Delivery Performance & Fleet Logistics ---");
    assert(
      typeof analytics30.deliveries.successRatePercent === "number" &&
      analytics30.deliveries.successRatePercent >= 0 &&
      analytics30.deliveries.successRatePercent <= 100,
      "Delivery success rate is a valid percentage (0 - 100%)",
      `successRatePercent: ${analytics30.deliveries.successRatePercent}%`
    );
    assert(
      analytics30.deliveries.bottlesDelivered >= 0,
      "Total delivered bottles count is non-negative",
      `Delivered: ${analytics30.deliveries.bottlesDelivered}`
    );
    assert(
      analytics30.deliveries.bottlesCollected >= 0,
      "Total collected empties count is non-negative",
      `Collected: ${analytics30.deliveries.bottlesCollected}`
    );
    assert(
      Array.isArray(analytics30.deliveries.driverRankings),
      "Driver logistics leaderboard array is provided",
      `Drivers count: ${analytics30.deliveries.driverRankings.length}`
    );

    // 4. Bottle Circulation & Assets
    console.log("\n--- 4. Asset Utilization (Bottles & Dispensers) ---");
    assert(
      typeof analytics30.inventory.circulationRatePercent === "number" &&
      analytics30.inventory.circulationRatePercent >= 0 &&
      analytics30.inventory.circulationRatePercent <= 100,
      "Bottle circulation rate is bounded (0 - 100%)",
      `circulationRatePercent: ${analytics30.inventory.circulationRatePercent}%`
    );
    assert(
      typeof analytics30.inventory.activeDispensers === "number",
      "Dispenser metrics track active deployed units",
      `Active: ${analytics30.inventory.activeDispensers}`
    );
    assert(
      typeof analytics30.inventory.dispenserRentalReceivablesGHS === "number",
      "Dispenser rental receivables tracked in GHS",
      `Receivables: ${analytics30.inventory.dispenserRentalReceivablesGHS}`
    );

    // 5. Product Category Distribution
    console.log("\n--- 5. Product Category Distribution Breakdown ---");
    assert(
      analytics30.products.categories.length === 3,
      "Product distribution covers all 3 core revenue categories",
      `Categories: ${analytics30.products.categories.map((p) => p.name).join(", ")}`
    );
    const totalPercentage = analytics30.products.categories.reduce((acc, p) => acc + p.percentage, 0);
    assert(
      Math.abs(totalPercentage - 100) < 1.0,
      "Category distribution percentages sum to ~100%",
      `Sum: ${totalPercentage}%`
    );

    // 6. CSV Data Export Tests
    console.log("\n--- 6. RFC-4180 CSV Export Generation ---");
    const salesCsv = await generateSalesCsv("30_DAYS");
    assert(
      salesCsv.startsWith('"Order Number","Date","Customer Name","Phone","Delivery Address"'),
      "generateSalesCsv contains correct RFC-4180 header row",
      `Header: ${salesCsv.split("\r\n")[0].slice(0, 70)}...`
    );
    assert(
      salesCsv.split("\r\n").length >= 1,
      "generateSalesCsv generates rows matching order data",
      `Rows: ${salesCsv.split("\r\n").length}`
    );

    const deliveriesCsv = await generateDeliveriesCsv();
    assert(
      deliveriesCsv.startsWith('"Order Number","Date","Driver Name","Van Number","Customer Name"'),
      "generateDeliveriesCsv contains correct logistics headers",
      `Header: ${deliveriesCsv.split("\r\n")[0].slice(0, 70)}...`
    );

    const inventoryCsv = await generateInventoryCsv();
    assert(
      inventoryCsv.startsWith('"Asset Category","Warehouse Balance","Customer Circulation","Damaged or Repair"'),
      "generateInventoryCsv contains comprehensive inventory audit headers",
      `Header: ${inventoryCsv.split("\r\n")[0].slice(0, 70)}...`
    );
    assert(
      inventoryCsv.includes("18.9L Refillable Bottles") && inventoryCsv.includes("Smart Water Dispensers"),
      "generateInventoryCsv includes rows for both bottles and dispensers"
    );

    // 7. Plain, Non-Technical Language & Anti-Slop Audit
    console.log("\n--- 7. Non-Technical UI Standards & Anti-Slop Audit ---");
    const forbiddenTerms = [
      "mnotify",
      "paystack",
      "prisma",
      "docker",
      "nextauth",
      "1:1 swap",
      "handover",
      "stepper",
      "allocation",
      "dual stock",
    ];

    let jargonFound = false;
    const csvJoined = `${salesCsv}\n${deliveriesCsv}\n${inventoryCsv}`.toLowerCase();
    for (const term of forbiddenTerms) {
      if (csvJoined.includes(term)) {
        console.warn(`[WARN] Found technical term "${term}" in CSV exports.`);
        jargonFound = true;
      }
    }
    assert(!jargonFound, "Exported reports & UI labels contain zero developer jargon");

    console.log("\n=================================================");
    console.log(`   MODULE 12 RESULTS: ${passed}/${total} TESTS PASSED`);
    console.log("=================================================\n");

    if (passed !== total) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution encountered an error:", err);
    process.exit(1);
  }
}

runModule12Tests();
