import assert from "node:assert";
import {
  getDispenserCatalog,
  getCustomerDispenserPlan,
  applyForDispenserPlan,
  recordInstallmentPayment,
  reportDispenserFault,
  getDispenserFaults,
  getAllDispensersWithTelemetry,
  simulateDispenserIoT,
} from "./src/lib/dispenser-store";

async function runModule8Tests() {
  console.log("=====================================================");
  console.log("   MODULE 8: DISPENSER PLANS & IOT TRACKER TESTS    ");
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

  // 1. Catalog & Terms
  await test("Catalog returns 3 dispenser models with pricing in GH₵", () => {
    const catalog = getDispenserCatalog();
    assert.strictEqual(catalog.length, 3);
    const aquamaster = catalog.find((m) => m.name.includes("Aquamaster"));
    assert(aquamaster !== undefined);
    assert.strictEqual(aquamaster?.totalCost, 1800.0);
    assert.strictEqual(aquamaster?.initialDeposit, 300.0);
    assert.strictEqual(aquamaster?.monthlyDue, 150.0);
    assert.strictEqual(aquamaster?.installmentsCount, 10);
  });

  // 2. Active Customer Plan & Telemetry
  await test("Active customer plan exists for demo customer", async () => {
    const { plan, payments } = await getCustomerDispenserPlan("usr_customer_001");
    assert(plan !== null, "Demo customer should have an active plan");
    assert.strictEqual(plan?.serialNumber, "DSP-GH-0103");
    assert.strictEqual(plan?.amountPaid, 900.0);
    assert.strictEqual(plan?.outstandingBalance, 900.0);
    assert.strictEqual(plan?.totalCost, 1800.0);
    assert.strictEqual(plan?.isFullyPaid, false);
    assert.strictEqual(plan?.ownershipTransferred, false);
    assert(payments.length >= 4, "Should have logged payments");
  });

  // 3. Installment Payment
  await test("Customer makes GH₵ 150 installment payment", async () => {
    const before = (await getCustomerDispenserPlan("usr_customer_001")).plan!;
    const beforePaid = before.amountPaid;
    const beforeOutstanding = before.outstandingBalance;
    const beforeCount = before.installmentsPaidCount;

    const res = await recordInstallmentPayment("usr_customer_001", {
      amount: 150.0,
      paymentMethod: "MOBILE_MONEY",
      momoNetwork: "MTN",
      momoPhone: "0241000005",
    });

    assert.strictEqual(res.payment.amount, 150.0);
    assert.strictEqual(res.plan.amountPaid, beforePaid + 150.0);
    assert.strictEqual(res.plan.outstandingBalance, beforeOutstanding - 150.0);
    assert.strictEqual(res.plan.installmentsPaidCount, beforeCount + 1);
    assert.strictEqual(res.ownershipCelebration, false); // Still 750 remaining
  });

  // 4. Automatic Ownership Transfer at 100% Payoff
  await test("Paying remaining balance triggers automatic ownership transfer", async () => {
    const cur = (await getCustomerDispenserPlan("usr_customer_001")).plan!;
    const remaining = cur.outstandingBalance;

    const res = await recordInstallmentPayment("usr_customer_001", {
      amount: remaining,
      paymentMethod: "MOBILE_MONEY",
      momoNetwork: "MTN",
    });

    assert.strictEqual(res.plan.outstandingBalance, 0);
    assert.strictEqual(res.plan.amountPaid, res.plan.totalCost);
    assert.strictEqual(res.plan.isFullyPaid, true);
    assert.strictEqual(res.plan.ownershipTransferred, true);
    assert.strictEqual(res.ownershipCelebration, true);
  });

  await test("Attempting to pay on fully owned dispenser is blocked", async () => {
    let errorCaught = false;
    try {
      await recordInstallmentPayment("usr_customer_001", {
        amount: 150.0,
        paymentMethod: "MOBILE_MONEY",
      });
    } catch {
      errorCaught = true;
    }
    assert(errorCaught, "Should reject payment on already fully owned dispenser");
  });

  // 5. Apply for new plan
  await test("New customer applies for HydroPure rent-to-own plan", async () => {
    const testUserId = "usr_new_test_cust";
    const plan = await applyForDispenserPlan(testUserId, {
      modelName: "HydroPure Floor Standing",
      deliveryAddressText: "Airport Residential, Accra",
      paymentMethod: "MOBILE_MONEY",
      momoNetwork: "TELECEL",
      momoPhone: "0209998877",
    });

    assert(plan !== null);
    assert.strictEqual(plan.modelName, "HydroPure Floor Standing");
    assert.strictEqual(plan.totalCost, 1600.0);
    assert.strictEqual(plan.initialDeposit, 250.0);
    assert.strictEqual(plan.amountPaid, 250.0);
    assert.strictEqual(plan.outstandingBalance, 1350.0);
    assert.strictEqual(plan.isFullyPaid, false);
  });

  // 6. Fault Reporting
  await test("Customer reports cooling fault with description", async () => {
    const fault = await reportDispenserFault("usr_customer_001", {
      issueType: "COOLING_FAILURE",
      description: "Water compressor running continuously without cooling water",
      urgency: "HIGH",
    });

    assert(fault !== null);
    assert.strictEqual(fault.issueType, "COOLING_FAILURE");
    assert.strictEqual(fault.urgency, "HIGH");
    assert.strictEqual(fault.status, "OPEN");
  });

  await test("Dispenser fault appears in manager fault ledger", () => {
    const faults = getDispenserFaults();
    const found = faults.find((f) => f.issueType === "COOLING_FAILURE");
    assert(found !== undefined);
  });

  // 7. IoT Telemetry Simulator
  await test("IoT Simulator: Simulate Low Water (< 15%)", () => {
    const updated = simulateDispenserIoT("usr_customer_001", "LOW_WATER");
    assert.strictEqual(updated.waterLevelPercent, 12);
  });

  await test("IoT Simulator: Simulate Tamper / Tilt Alert", () => {
    const updated = simulateDispenserIoT("usr_customer_001", "TAMPER");
    assert.strictEqual(updated.tamperAlert, true);
  });

  await test("IoT Simulator: Simulate Device Offline", () => {
    const updated = simulateDispenserIoT("usr_customer_001", "OFFLINE");
    assert.strictEqual(updated.isOnline, false);
  });

  await test("IoT Simulator: Reset Telemetry to Normal", () => {
    const updated = simulateDispenserIoT("usr_customer_001", "RESET");
    assert.strictEqual(updated.waterLevelPercent, 85);
    assert.strictEqual(updated.tamperAlert, false);
    assert.strictEqual(updated.isOnline, true);
  });

  // 8. Security & Endpoint Guards
  await test("Public GET /api/dispensers/catalog returns HTTP 200", async () => {
    const res = await fetch("http://localhost:3000/api/dispensers/catalog");
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.length, 3);
  });

  await test("Unauthenticated GET /api/customer/dispenser returns 401", async () => {
    const res = await fetch("http://localhost:3000/api/customer/dispenser");
    assert.strictEqual(res.status, 401);
  });

  await test("Unauthenticated POST /api/customer/dispenser/apply returns 401", async () => {
    const res = await fetch("http://localhost:3000/api/customer/dispenser/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelName: "EcoStream Tabletop", deliveryAddressText: "Osu" }),
    });
    assert.strictEqual(res.status, 401);
  });

  await test("Unauthenticated POST /api/customer/dispenser/pay returns 401", async () => {
    const res = await fetch("http://localhost:3000/api/customer/dispenser/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 150 }),
    });
    assert.strictEqual(res.status, 401);
  });

  await test("Unauthenticated POST /api/customer/dispenser/report-fault returns 401", async () => {
    const res = await fetch("http://localhost:3000/api/customer/dispenser/report-fault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueType: "LEAKAGE", description: "Water leaking" }),
    });
    assert.strictEqual(res.status, 401);
  });

  await test("Unauthenticated GET /api/manager/dispensers/iot returns 401", async () => {
    const res = await fetch("http://localhost:3000/api/manager/dispensers/iot");
    assert.strictEqual(res.status, 401);
  });

  await test("Unauthenticated POST /api/manager/dispensers/iot/simulate returns 401", async () => {
    const res = await fetch("http://localhost:3000/api/manager/dispensers/iot/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "usr_customer_001", event: "LOW_WATER" }),
    });
    assert.strictEqual(res.status, 401);
  });

  await test("Unauthenticated /customer/dispenser redirects to /login", async () => {
    const res = await fetch("http://localhost:3000/customer/dispenser", { redirect: "manual" });
    assert(res.status === 307 || res.status === 302);
    const location = res.headers.get("location");
    assert(location?.includes("/login"));
  });

  await test("Unauthenticated /manager/dispensers redirects to /login", async () => {
    const res = await fetch("http://localhost:3000/manager/dispensers", { redirect: "manual" });
    assert(res.status === 307 || res.status === 302);
    const location = res.headers.get("location");
    assert(location?.includes("/login"));
  });

  await test("Unauthenticated /admin/dispensers redirects to /login", async () => {
    const res = await fetch("http://localhost:3000/admin/dispensers", { redirect: "manual" });
    assert(res.status === 307 || res.status === 302);
    const location = res.headers.get("location");
    assert(location?.includes("/login"));
  });

  console.log("=====================================================");
  console.log(`MODULE 8 RESULTS: ${passed} Passed, 0 Failed`);
  console.log("=====================================================");
}

runModule8Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
