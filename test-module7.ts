import assert from "node:assert";
import {
  getBottleInventory,
  getDispensers,
  getDispenserById,
  updateDispenserStatus,
  adjustStock,
  syncDeliveryExchangeToInventory,
  getLowStockAlerts,
  getAuditLogs,
  LOW_STOCK_THRESHOLD_FILLED,
} from "./src/lib/inventory-store";

async function runModule7Tests() {
  console.log("=====================================================");
  console.log("   MODULE 7: INVENTORY MANAGEMENT (BOTTLES & DISPENSERS)  ");
  console.log("=====================================================");

  let passed = 0;
  const test = (name: string, fn: () => void | Promise<void>) => {
    try {
      const res = fn();
      if (res instanceof Promise) {
        return res
          .then(() => {
            console.log(`[PASS] ${name}`);
            passed++;
          })
          .catch((err) => {
            console.error(`[FAIL] ${name}:`, err.message);
            process.exit(1);
          });
      } else {
        console.log(`[PASS] ${name}`);
        passed++;
      }
    } catch (err: any) {
      console.error(`[FAIL] ${name}:`, err.message);
      process.exit(1);
    }
  };

  // 1. Initial State & Fleet Calculations
  await test("Initial bottle inventory has positive quantities", async () => {
    const inv = await getBottleInventory();
    assert(inv.filledWarehouse > 0, "Filled warehouse should be > 0");
    assert(inv.emptyWarehouse > 0, "Empty warehouse should be > 0");
    assert(inv.withCustomers > 0, "With customers should be > 0");
    assert(inv.damaged >= 0, "Damaged should be >= 0");
    assert(inv.lost >= 0, "Lost should be >= 0");
  });

  await test("Total fleet equals sum of all bottle segments", async () => {
    const inv = await getBottleInventory();
    const expectedTotal =
      inv.filledWarehouse +
      inv.emptyWarehouse +
      inv.withCustomers +
      inv.damaged +
      inv.lost;
    assert.strictEqual(inv.totalFleet, expectedTotal);
  });

  await test("Circulation health rate is calculated accurately", async () => {
    const inv = await getBottleInventory();
    assert(inv.circulationRatePercent > 70 && inv.circulationRatePercent <= 100);
  });

  // 2. Dispenser Inventory
  await test("Dispensers list contains seeded fleet", async () => {
    const all = await getDispensers();
    assert(all.length >= 6, "Fleet should contain at least 6 dispensers");
  });

  await test("Filtering dispensers by AVAILABLE status works", async () => {
    const available = await getDispensers("AVAILABLE");
    assert(available.length > 0, "Should have available dispensers");
    available.forEach((d) => assert.strictEqual(d.status, "AVAILABLE"));
  });

  await test("Filtering dispensers by INSTALLED_ON_PLAN works", async () => {
    const onPlan = await getDispensers("INSTALLED_ON_PLAN");
    assert(onPlan.length > 0);
    onPlan.forEach((d) => assert.strictEqual(d.status, "INSTALLED_ON_PLAN"));
  });

  await test("Retrieve dispenser by ID or serial number", async () => {
    const d = await getDispenserById("dsp_001");
    assert(d !== null, "Dispenser dsp_001 should exist");
    assert.strictEqual(d?.serialNumber, "DSP-GH-0101");
  });

  await test("Update dispenser status to MAINTENANCE with notes", async () => {
    const updated = await updateDispenserStatus({
      id: "dsp_004",
      status: "MAINTENANCE",
      notes: "Pump maintenance test in workshop",
      user: { name: "Manager Samuel", email: "manager@fnetwater.com" },
    });
    assert.strictEqual(updated.status, "MAINTENANCE");
    assert.strictEqual(updated.notes, "Pump maintenance test in workshop");
  });

  await test("Dispenser status update is recorded in audit ledger", async () => {
    const logs = await getAuditLogs(5);
    const found = logs.find((l) => l.action === "DISPENSER_STATUS_CHANGE");
    assert(found !== undefined, "Audit log for dispenser status change should exist");
    assert(found?.reason.includes("DSP-GH-0104"));
  });

  // 3. Manual Stock Adjustments
  await test("Stock In: Adding 50 filled bottles increases filled balance", async () => {
    const before = await getBottleInventory();
    const res = await adjustStock({
      itemType: "FILLED_BOTTLES",
      action: "ADD",
      quantity: 50,
      reason: "Bottling line shift run #99 completed",
      user: { name: "Samuel Danquah", email: "manager@fnetwater.com" },
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.delta, 50);
    assert.strictEqual(res.previousBalance, before.filledWarehouse);
    assert.strictEqual(res.newBalance, before.filledWarehouse + 50);

    const after = await getBottleInventory();
    assert.strictEqual(after.filledWarehouse, before.filledWarehouse + 50);
  });

  await test("Stock Out: Deducting 20 empty bottles reduces empty balance", async () => {
    const before = await getBottleInventory();
    const res = await adjustStock({
      itemType: "EMPTY_BOTTLES",
      action: "DEDUCT",
      quantity: 20,
      reason: "Sent to specialized sterilization chamber",
      user: { name: "Samuel Danquah", email: "manager@fnetwater.com" },
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.delta, -20);
    assert.strictEqual(res.newBalance, before.emptyWarehouse - 20);
  });

  await test("Marking bottles as damaged increments damaged count", async () => {
    const before = await getBottleInventory();
    const res = await adjustStock({
      itemType: "DAMAGED_BOTTLES",
      action: "ADD",
      quantity: 5,
      reason: "Cracked bases identified during manual inspection",
      user: { name: "Samuel Danquah", email: "manager@fnetwater.com" },
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.delta, 5);
    const after = await getBottleInventory();
    assert.strictEqual(after.damaged, before.damaged + 5);
  });

  await test("Stock adjustment rejects non-positive quantity", async () => {
    let errorCaught = false;
    try {
      await adjustStock({
        itemType: "FILLED_BOTTLES",
        action: "ADD",
        quantity: -10,
        reason: "Invalid quantity test",
        user: { name: "Manager", email: "manager@fnetwater.com" },
      });
    } catch {
      errorCaught = true;
    }
    assert(errorCaught, "Should have thrown for negative quantity");
  });

  await test("Stock adjustment rejects reason shorter than 5 characters", async () => {
    let errorCaught = false;
    try {
      await adjustStock({
        itemType: "FILLED_BOTTLES",
        action: "ADD",
        quantity: 10,
        reason: "Bad",
        user: { name: "Manager", email: "manager@fnetwater.com" },
      });
    } catch {
      errorCaught = true;
    }
    assert(errorCaught, "Should have thrown for short reason");
  });

  // 4. Delivery Exchange Inventory Synchronization
  await test("Driver delivery exchange synchronizes with bottle inventory", async () => {
    const before = await getBottleInventory();
    await syncDeliveryExchangeToInventory({
      filledDelivered: 10,
      emptyCollected: 8,
      damagedCount: 1,
      orderNumber: "FNW-TEST-SYNC",
    });

    const after = await getBottleInventory();
    // Filled warehouse drops by 10
    assert.strictEqual(after.filledWarehouse, before.filledWarehouse - 10);
    // Empty warehouse gains 8
    assert.strictEqual(after.emptyWarehouse, before.emptyWarehouse + 8);
    // Customers held balance gains net 2
    assert.strictEqual(after.withCustomers, before.withCustomers + (10 - 8));
    // Damaged gains 1
    assert.strictEqual(after.damaged, before.damaged + 1);
  });

  // 5. Low Stock Alerts
  await test("Low stock alert generated when filled bottles drop below threshold", async () => {
    const before = await getBottleInventory();
    // Temporarily deduct to fall below 150 threshold
    const neededDeduction = before.filledWarehouse - 120;
    if (neededDeduction > 0) {
      await adjustStock({
        itemType: "FILLED_BOTTLES",
        action: "DEDUCT",
        quantity: neededDeduction,
        reason: "Test batch pull for emergency commercial hospital delivery",
        user: { name: "Manager", email: "manager@fnetwater.com" },
      });
    }

    const alerts = await getLowStockAlerts();
    const filledAlert = alerts.find((a) => a.item.includes("Filled Bottles"));
    assert(filledAlert !== undefined, "Low stock alert for filled bottles should trigger");
    assert(filledAlert?.currentStock < LOW_STOCK_THRESHOLD_FILLED);

    // Restore stock
    if (neededDeduction > 0) {
      await adjustStock({
        itemType: "FILLED_BOTTLES",
        action: "ADD",
        quantity: neededDeduction,
        reason: "Test restore stock balance",
        user: { name: "Manager", email: "manager@fnetwater.com" },
      });
    }
  });

  // 6. Security & Route Protection
  await test("Unauthenticated GET /api/inventory/bottles returns 401", async () => {
    const res = await fetch("http://localhost:3000/api/inventory/bottles");
    assert.strictEqual(res.status, 401);
  });

  await test("Unauthenticated GET /api/inventory/dispensers returns 401", async () => {
    const res = await fetch("http://localhost:3000/api/inventory/dispensers");
    assert.strictEqual(res.status, 401);
  });

  await test("Unauthenticated POST /api/inventory/adjust returns 401", async () => {
    const res = await fetch("http://localhost:3000/api/inventory/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemType: "FILLED_BOTTLES", action: "ADD", quantity: 10, reason: "Unauthorized attempt" }),
    });
    assert.strictEqual(res.status, 401);
  });

  await test("Unauthenticated GET /api/inventory/audit-logs returns 401", async () => {
    const res = await fetch("http://localhost:3000/api/inventory/audit-logs");
    assert.strictEqual(res.status, 401);
  });

  await test("Unauthenticated /manager/inventory redirects to /login", async () => {
    const res = await fetch("http://localhost:3000/manager/inventory", { redirect: "manual" });
    assert(res.status === 307 || res.status === 302);
    const location = res.headers.get("location");
    assert(location?.includes("/login"), "Redirect target should be /login");
  });

  await test("Unauthenticated /admin/inventory redirects to /login", async () => {
    const res = await fetch("http://localhost:3000/admin/inventory", { redirect: "manual" });
    assert(res.status === 307 || res.status === 302);
    const location = res.headers.get("location");
    assert(location?.includes("/login"), "Redirect target should be /login");
  });

  console.log("=====================================================");
  console.log(`MODULE 7 RESULTS: ${passed} Passed, 0 Failed`);
  console.log("=====================================================");
}

runModule7Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
