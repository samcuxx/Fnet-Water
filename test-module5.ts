// test-module5.ts - Comprehensive Verification for Module 5: Water Products & Ordering Workflow

import { getActiveProducts, getProductById } from "./src/lib/product-store";
import {
  calculateOrderPricing,
  createCustomerOrder,
  getCustomerOrders,
  getOrderById,
  updateOrderStatus,
} from "./src/lib/order-store";

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
  console.log("\x1b[36m   MODULE 5: WATER PRODUCTS & ORDER WORKFLOW TESTS   \x1b[0m");
  console.log("\x1b[36m=====================================================\x1b[0m");

  const BASE_URL = "http://localhost:3000";

  // 1. Product Catalog Store Tests
  const products = await getActiveProducts();
  assert("Catalog returns active products", products.length >= 3);

  const refillProd = products.find((p) => p.type === "REFILLABLE_BOTTLE");
  assert("Refillable 18.9L bottle is in catalog", Boolean(refillProd));
  assert("Refill price is GH₵ 25.00", refillProd?.price === 25.0);
  assert("Deposit fee is GH₵ 80.00", refillProd?.depositFee === 80.0);

  const takeawayProd = products.find((p) => p.type === "TAKEAWAY_BOTTLE");
  assert("Bottled water pack is in catalog", Boolean(takeawayProd));
  assert("Pack price is GH₵ 35.00", takeawayProd?.price === 35.0);

  // 2. Real-Time Pricing Calculations
  // Case A: 4 Refills with 1:1 empty bottle swap (subtotal >= 100 -> Free delivery, deposit = 0)
  const calcA = await calculateOrderPricing(
    [{ productId: refillProd!.id, quantity: 4 }],
    true, // hasEmptyBottleExchange
    false, // redeemFreeRefill
    1 // freeBottleBalance
  );
  assert("Case A subtotal is GH₵ 100.00", calcA.subtotal === 100.0);
  assert("Case A deposit waived (GH₵ 0.00)", calcA.depositFee === 0.0);
  assert("Case A delivery fee is FREE (GH₵ 0.00)", calcA.deliveryFee === 0.0);
  assert("Case A total is GH₵ 100.00", calcA.totalAmount === 100.0);

  // Case B: 2 Refills WITHOUT bottle swap (deposit applies, delivery fee GH₵ 10.00)
  const calcB = await calculateOrderPricing(
    [{ productId: refillProd!.id, quantity: 2 }],
    false, // NO empty bottles -> deposit = 2 * 80 = 160
    false,
    0
  );
  assert("Case B subtotal is GH₵ 50.00", calcB.subtotal === 50.0);
  assert("Case B deposit is GH₵ 160.00", calcB.depositFee === 160.0);
  assert("Case B delivery fee is GH₵ 10.00", calcB.deliveryFee === 10.0);
  assert("Case B total is GH₵ 220.00 (50 + 160 + 10)", calcB.totalAmount === 220.0);

  // Case C: Free Refill Reward Redeemed (-GH₵ 25.00)
  const calcC = await calculateOrderPricing(
    [{ productId: refillProd!.id, quantity: 2 }],
    true, // 1:1 swap
    true, // redeem free refill
    1 // has credit
  );
  assert("Case C discount is GH₵ 25.00", calcC.discountAmount === 25.0);
  assert("Case C total is GH₵ 35.00 (50 subtotal + 10 del - 25 discount)", calcC.totalAmount === 35.0);

  // 3. Customer Order Creation & Order Lifecycle
  const testUserId = `usr_order_test_${Date.now()}`;
  const createdOrder = await createCustomerOrder({
    userId: testUserId,
    customerName: "Kofi Mensah",
    customerPhone: "0241000005",
    deliveryAddressId: "addr_001",
    deliveryAddressText: "House 12, Boundary Road, East Legon",
    deliveryDigitalAddress: "GA-492-1029",
    deliverySlot: "Morning (8am - 12pm)",
    deliveryDate: new Date().toISOString(),
    deliveryInstructions: "Leave inside compound",
    hasEmptyBottleExchange: true,
    redeemFreeRefill: false,
    paymentMethod: "MOBILE_MONEY",
    items: [{ productId: refillProd!.id, quantity: 3 }],
  });

  assert("Order created with FNW order number", createdOrder.orderNumber.startsWith("FNW-"));
  assert("Order initial status is PENDING", createdOrder.status === "PENDING");
  assert("Payment status is PAID for Mobile Money", createdOrder.paymentStatus === "PAID");
  assert("Delivery fee is FREE for 3 refills", createdOrder.deliveryFee === 0.0);
  assert("Total amount is GH₵ 75.00", createdOrder.totalAmount === 75.0);

  // Retrieve user orders
  const userOrders = await getCustomerOrders(testUserId);
  assert("Customer orders list contains newly placed order", userOrders.length >= 1);
  assert("Order in list matches order number", userOrders[0].orderNumber === createdOrder.orderNumber);

  // Query order by ID
  const retrievedOrder = await getOrderById(createdOrder.id);
  assert("Order retrieved by ID matches", retrievedOrder?.id === createdOrder.id);

  // Update order status through lifecycle stepper
  const assignedOrder = await updateOrderStatus(
    createdOrder.id,
    "ASSIGNED",
    "drv_001",
    "Kwame Asante"
  );
  assert("Status transitioned to ASSIGNED", assignedOrder?.status === "ASSIGNED");
  assert("Driver assigned name recorded", assignedOrder?.assignedDriverName === "Kwame Asante");

  const outForDelivery = await updateOrderStatus(createdOrder.id, "OUT_FOR_DELIVERY");
  assert("Status transitioned to OUT_FOR_DELIVERY", outForDelivery?.status === "OUT_FOR_DELIVERY");

  const deliveredOrder = await updateOrderStatus(createdOrder.id, "DELIVERED");
  assert("Status transitioned to DELIVERED", deliveredOrder?.status === "DELIVERED");
  assert("Payment status verified as PAID on delivery", deliveredOrder?.paymentStatus === "PAID");

  // 4. HTTP API & Security Endpoint Verification
  try {
    // Products API
    const prodRes = await fetch(`${BASE_URL}/api/products`);
    const prodData = await prodRes.json();
    assert(
      "GET /api/products returns HTTP 200 with catalog",
      prodRes.status === 200 && prodData.products.length >= 3
    );

    // Calculate API
    const calcRes = await fetch(`${BASE_URL}/api/orders/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ productId: refillProd!.id, quantity: 2 }],
        hasEmptyBottleExchange: true,
      }),
    });
    const calcData = await calcRes.json();
    assert(
      "POST /api/orders/calculate returns HTTP 200 with pricing",
      calcRes.status === 200 && calcData.pricing.subtotal === 50.0
    );

    // Unauthenticated protection
    const unauthOrdersApi = await fetch(`${BASE_URL}/api/orders`);
    assert(
      "Unauthenticated GET /api/orders returns 401 Unauthorized",
      unauthOrdersApi.status === 401
    );

    const unauthPostOrderApi = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert(
      "Unauthenticated POST /api/orders returns 401 Unauthorized",
      unauthPostOrderApi.status === 401
    );

    const unauthOrderRoute = await fetch(`${BASE_URL}/customer/order`, { redirect: "manual" });
    const orderLoc = unauthOrderRoute.headers.get("location") || "";
    assert(
      "Unauthenticated /customer/order redirects to /login",
      (unauthOrderRoute.status === 307 || unauthOrderRoute.status === 302) && orderLoc.includes("/login")
    );

    const unauthOrdersListRoute = await fetch(`${BASE_URL}/customer/orders`, { redirect: "manual" });
    const ordersListLoc = unauthOrdersListRoute.headers.get("location") || "";
    assert(
      "Unauthenticated /customer/orders redirects to /login",
      (unauthOrdersListRoute.status === 307 || unauthOrdersListRoute.status === 302) && ordersListLoc.includes("/login")
    );
  } catch (err: any) {
    assert("HTTP API endpoint verification", false, err.message);
  }

  console.log("\x1b[36m=====================================================\x1b[0m");
  console.log(
    `\x1b[1mMODULE 5 RESULTS: \x1b[32m${passed} Passed\x1b[0m, \x1b[31m${failed} Failed\x1b[0m`
  );
  console.log("\x1b[36m=====================================================\x1b[0m");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
