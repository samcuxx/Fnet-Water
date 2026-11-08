// test-module6.ts - Unit & Integration Test Suite for Module 6: Delivery Dispatch & Driver Portal

import {
  getActiveDrivers,
  getAllDispatchStops,
  assignOrderToDriver,
  getDriverStops,
  startDeliveryRoute,
  completeStopBottleExchange,
} from "./src/lib/dispatch-store";
import { createCustomerOrder } from "./src/lib/order-store";
import { getCustomerProfile } from "./src/lib/customer-store";

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean, details = "") {
  if (condition) {
    console.log(`\x1b[32m[PASS]\x1b[0m ${name}`);
    passed++;
  } else {
    console.error(`\x1b[31m[FAIL]\x1b[0m ${name} ${details ? `(${details})` : ""}`);
    failed++;
  }
}

async function runTests() {
  console.log("\x1b[36m=====================================================\x1b[0m");
  console.log("\x1b[36m   MODULE 6: DELIVERY DISPATCH & DRIVER PORTAL TESTS \x1b[0m");
  console.log("\x1b[36m=====================================================\x1b[0m");

  const BASE_URL = "http://localhost:3000";

  // 1. Driver Fleet & Vehicle Query Tests
  const drivers = await getActiveDrivers();
  assert("Fleet returns active drivers", drivers.length >= 2);
  const kwame = drivers.find((d) => d.name.includes("Kwame"));
  assert("Kwame Asante is in fleet", Boolean(kwame));
  assert("Van number and license plate recorded", Boolean(kwame?.vanNumber && kwame?.licensePlate));

  // 2. Dispatch Stops Queue
  const allStops = await getAllDispatchStops("ALL");
  assert("Dispatch queue returns stops", allStops.length >= 3);

  const pendingStops = await getAllDispatchStops("PENDING");
  assert("Filter by PENDING status works", pendingStops.every((s) => s.status === "PENDING"));

  // 3. Driver Assignment Flow
  // Place a new order to assign
  const testUserId = `usr_dispatch_test_${Date.now()}`;
  const newOrder = await createCustomerOrder({
    userId: testUserId,
    customerName: "Kweku Baah",
    customerPhone: "0249876543",
    deliveryAddressId: "addr_001",
    deliveryAddressText: "House 10, Cantonments Road, Osu",
    deliveryDigitalAddress: "GA-041-9988",
    deliverySlot: "Morning (8am - 12pm)",
    deliveryDate: new Date().toISOString(),
    deliveryInstructions: "Leave with security",
    hasEmptyBottleExchange: true,
    redeemFreeRefill: false,
    paymentMethod: "CASH_ON_DELIVERY",
    items: [{ productId: "prod_001", quantity: 4 }],
  });
  assert("New test order created for dispatch", Boolean(newOrder.id));

  // Assign order to Kwame Asante
  const assigned = await assignOrderToDriver(
    newOrder.id,
    "usr_driver_001",
    "Van 01 (GT-4421-23)",
    "Urgent morning delivery"
  );
  assert("Order assigned to driver successfully", assigned !== null);
  assert("Assigned status is ASSIGNED", assigned?.status === "ASSIGNED");
  assert("Assigned driver name is Kwame Asante", assigned?.driverName === "Kwame Asante");
  assert("Van allocation recorded", Boolean(assigned?.vanNumber?.includes("Van 01")));

  // 4. Driver Portal Operations
  // Query driver's stops
  const driverStops = await getDriverStops("usr_driver_001");
  const stopInQueue = driverStops.find((s) => s.orderId === newOrder.id);
  assert("Assigned stop appears in driver's run", Boolean(stopInQueue));

  // Driver starts route (OUT_FOR_DELIVERY)
  const started = await startDeliveryRoute(newOrder.id);
  assert("Route started successfully", started !== null);
  assert("Stop transitioned to OUT_FOR_DELIVERY", started?.status === "OUT_FOR_DELIVERY");

  // Initial customer bottles held
  const initialProfile = await getCustomerProfile(testUserId);
  const initialHeld = initialProfile.bottlesHeld || 0;

  // Driver completes stop with Point-of-Delivery Bottle Exchange
  const exchangeResult = await completeStopBottleExchange({
    orderId: newOrder.id,
    driverId: "usr_driver_001",
    filledDelivered: 4,
    emptyCollected: 4,
    damagedCount: 0,
    cashCollected: 110.0,
    customerNotes: "Customer verified seal and paid cash",
  });

  assert("Point-of-Delivery exchange completed", Boolean(exchangeResult.stop));
  assert("Stop status is DELIVERED", exchangeResult.stop.status === "DELIVERED");
  assert("Payment status updated to PAID", exchangeResult.stop.paymentStatus === "PAID");
  assert("Bottle exchange record created", Boolean(exchangeResult.exchange.id));
  assert("Filled bottles delivered recorded as 4", exchangeResult.exchange.filledDelivered === 4);
  assert("Empty bottles collected recorded as 4", exchangeResult.exchange.emptyCollected === 4);
  assert("Cash remittance recorded as 110.00", exchangeResult.exchange.cashCollected === 110.0);

  // Verify Customer Profile bottles balance updated
  const updatedProfile = await getCustomerProfile(testUserId);
  assert(
    "Customer bottles balance updated accurately",
    updatedProfile.bottlesHeld === initialHeld + 4 - 4
  );

  // 5. HTTP API & Security Endpoint Verification
  try {
    // Dispatch Orders API
    const unauthDispatchOrders = await fetch(`${BASE_URL}/api/dispatch/orders`);
    assert(
      "Unauthenticated GET /api/dispatch/orders returns 401 Unauthorized",
      unauthDispatchOrders.status === 401
    );

    // Dispatch Drivers API
    const unauthDispatchDrivers = await fetch(`${BASE_URL}/api/dispatch/drivers`);
    assert(
      "Unauthenticated GET /api/dispatch/drivers returns 401 Unauthorized",
      unauthDispatchDrivers.status === 401
    );

    // Dispatch Assign API
    const unauthAssign = await fetch(`${BASE_URL}/api/dispatch/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert(
      "Unauthenticated POST /api/dispatch/assign returns 401 Unauthorized",
      unauthAssign.status === 401
    );

    // Driver Stops API
    const unauthDriverStops = await fetch(`${BASE_URL}/api/driver/stops`);
    assert(
      "Unauthenticated GET /api/driver/stops returns 401 Unauthorized",
      unauthDriverStops.status === 401
    );

    // Driver Start API
    const unauthDriverStart = await fetch(`${BASE_URL}/api/driver/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert(
      "Unauthenticated POST /api/driver/start returns 401 Unauthorized",
      unauthDriverStart.status === 401
    );

    // Driver Exchange API
    const unauthDriverExchange = await fetch(`${BASE_URL}/api/driver/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert(
      "Unauthenticated POST /api/driver/exchange returns 401 Unauthorized",
      unauthDriverExchange.status === 401
    );

    // Protected Route Redirections
    const unauthManagerDeliveries = await fetch(`${BASE_URL}/manager/deliveries`, {
      redirect: "manual",
    });
    const mgrLoc = unauthManagerDeliveries.headers.get("location") || "";
    assert(
      "Unauthenticated /manager/deliveries redirects to /login",
      (unauthManagerDeliveries.status === 307 || unauthManagerDeliveries.status === 302) &&
        mgrLoc.includes("/login")
    );

    const unauthDriverPortal = await fetch(`${BASE_URL}/driver`, { redirect: "manual" });
    const drvLoc = unauthDriverPortal.headers.get("location") || "";
    assert(
      "Unauthenticated /driver redirects to /login",
      (unauthDriverPortal.status === 307 || unauthDriverPortal.status === 302) &&
        drvLoc.includes("/login")
    );
  } catch (err: any) {
    assert("HTTP API endpoint verification", false, err.message);
  }

  console.log("\x1b[36m=====================================================\x1b[0m");
  console.log(
    `\x1b[1mMODULE 6 RESULTS: \x1b[32m${passed} Passed\x1b[0m, \x1b[31m${failed} Failed\x1b[0m`
  );
  console.log("\x1b[36m=====================================================\x1b[0m");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
