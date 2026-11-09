// test-full-system-modules-1-to-9.ts
// Comprehensive Stress & Edge-Case Test Suite Covering Modules 1 through 9

import {
  findUserByIdentifier,
  registerNewUser,
  getStaffList,
  updateUserStatus,
  deleteUserRecord,
  storeOtp,
  verifyStoredOtp,
} from "./src/lib/auth-store";
import { normalizeGhanaPhone, generateOtp } from "./src/lib/mnotify";
import {
  isValidGhanaDigitalAddress,
  formatGhanaDigitalAddress,
  getCustomerAddresses,
  createCustomerAddress,
  updateCustomerAddress,
  setDefaultCustomerAddress,
  deleteCustomerAddress,
  getCustomerProfile,
} from "./src/lib/customer-store";
import {
  getActiveProducts,
  getProductById,
} from "./src/lib/product-store";
import {
  calculateOrderPricing,
  createCustomerOrder,
  getOrderById,
  updateOrderStatus,
  updateOrderPaymentStatus,
  getOrderByReference,
} from "./src/lib/order-store";
import {
  getAllDispatchStops,
  assignOrderToDriver,
  startDeliveryRoute,
  completeStopBottleExchange,
  getActiveDrivers,
} from "./src/lib/dispatch-store";
import {
  getBottleInventory,
  getDispensers,
  getLowStockAlerts,
  adjustStock,
  calculateCirculation,
} from "./src/lib/inventory-store";
import {
  DISPENSER_CATALOG,
  getCustomerDispenserPlan,
  applyForDispenserPlan,
  recordInstallmentPayment,
  simulateDispenserIoT,
  reportDispenserFault,
} from "./src/lib/dispenser-store";
import {
  initializePaystackPayment,
  verifyPaystackTransaction,
  computePaystackWebhookSignature,
  verifyPaystackWebhookSignature,
} from "./src/lib/paystack";
import {
  recordTransaction,
  getTransactionByReference,
  updateTransactionStatus,
  getAllTransactions,
  getTransactionMetrics,
} from "./src/lib/transaction-store";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assertTest(name: string, condition: boolean, details: string = "") {
  if (condition) {
    console.log(`\x1b[32m[PASS]\x1b[0m ${name}`);
    passed++;
  } else {
    const msg = `\x1b[31m[FAIL]\x1b[0m ${name} ${details ? `(${details})` : ""}`;
    console.error(msg);
    failures.push(name + (details ? ` : ${details}` : ""));
    failed++;
  }
}

const BASE_URL = "http://localhost:3000";

async function runComprehensiveTests() {
  console.log("\x1b[35m====================================================================\x1b[0m");
  console.log("\x1b[35m   F-NET WATER HUB: COMPREHENSIVE FULL PLATFORM SUITE (MODULES 1-9) \x1b[0m");
  console.log("\x1b[35m====================================================================\x1b[0m");

  // ===========================================================================
  // MODULE 1: AUTHENTICATION, PHONE OTP & ACCESS CONTROL
  // ===========================================================================
  console.log("\n\x1b[33m--- [MODULE 1] Authentication, Phone OTP & Access Control ---\x1b[0m");

  // Phone Normalization
  assertTest("Ghana phone: normalizes 0241000005 to 0241000005", normalizeGhanaPhone("0241000005") === "0241000005");
  assertTest("Ghana phone: normalizes +233241000005 to 0241000005", normalizeGhanaPhone("+233241000005") === "0241000005");
  assertTest("Ghana phone: normalizes 233241000005 to 0241000005", normalizeGhanaPhone("233241000005") === "0241000005");
  assertTest("Ghana phone: strips spaces and dashes", normalizeGhanaPhone("024-100-0005") === "0241000005");

  // OTP Generation & Storage
  const sampleOtp = generateOtp();
  assertTest("OTP code is exactly 5 numeric digits", /^\d{5}$/.test(sampleOtp));
  await storeOtp("0249999991", "54321", 5);
  const validOtp = await verifyStoredOtp("0249999991", "54321");
  assertTest("OTP verification succeeds with correct code", validOtp === true);
  const badOtp = await verifyStoredOtp("0249999991", "00000");
  assertTest("OTP verification rejects wrong code", badOtp === false);
  const wrongPhoneOtp = await verifyStoredOtp("0240000000", "54321");
  assertTest("OTP verification rejects unrecorded phone", wrongPhoneOtp === false);

  // Registration Edge Cases (API)
  const randNum = Math.floor(100000 + Math.random() * 900000);
  const regEmail = `test.user.${randNum}@fnetwater.com`;
  const regPhone = `024${randNum.toString().slice(0, 7)}`;

  // Good Registration
  const goodReg = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Kwame Antwi",
      email: regEmail,
      phone: regPhone,
      password: "securePassword123",
    }),
  });
  const goodRegData = await goodReg.json();
  assertTest("Registration: valid payload returns HTTP 200", goodReg.status === 200 && goodRegData.success === true);

  // Duplicate Email
  const dupEmailRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Duplicate Email Test",
      email: regEmail,
      phone: `020${randNum.toString().slice(0, 7)}`,
      password: "securePassword123",
    }),
  });
  assertTest("Registration: duplicate email rejected (HTTP 400)", dupEmailRes.status === 400);

  // Duplicate Phone
  const dupPhoneRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Duplicate Phone Test",
      email: `another.${randNum}@fnetwater.com`,
      phone: regPhone,
      password: "securePassword123",
    }),
  });
  assertTest("Registration: duplicate phone rejected (HTTP 400)", dupPhoneRes.status === 400);

  // Short Password
  const shortPassRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Short Pass",
      email: `shortpass.${randNum}@fnetwater.com`,
      phone: `055${randNum.toString().slice(0, 7)}`,
      password: "123",
    }),
  });
  assertTest("Registration: password < 6 chars rejected (HTTP 400)", shortPassRes.status === 400);

  // Missing Fields
  const missingNameRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `noname.${randNum}@fnetwater.com`,
      phone: `055${randNum.toString().slice(0, 7)}`,
      password: "validPassword123",
    }),
  });
  assertTest("Registration: missing name rejected (HTTP 400)", missingNameRes.status === 400);

  // Protected Route Redirections
  for (const path of ["/admin", "/manager", "/driver", "/customer", "/agent"]) {
    const res = await fetch(`${BASE_URL}${path}`, { redirect: "manual" });
    const location = res.headers.get("location") || "";
    const cc = res.headers.get("cache-control") || "";
    assertTest(
      `Protected route ${path} redirects to /login with no-store cache`,
      (res.status === 307 || res.status === 302) &&
        location.includes("/login") &&
        cc.includes("no-store")
    );
  }

  // ===========================================================================
  // MODULE 2: UI ARCHETYPE FIDELITY & DASHBOARD FOUNDATIONS
  // ===========================================================================
  console.log("\n\x1b[33m--- [MODULE 2] UI Archetypes & Dashboard Foundations ---\x1b[0m");

  const loginPageRes = await fetch(`${BASE_URL}/login`);
  assertTest("Public login route renders HTTP 200", loginPageRes.status === 200);

  const homePageRes = await fetch(`${BASE_URL}/`);
  assertTest("Public home route renders HTTP 200", homePageRes.status === 200);

  // ===========================================================================
  // MODULE 3: USER & STAFF DIRECTORY MANAGEMENT
  // ===========================================================================
  console.log("\n\x1b[33m--- [MODULE 3] User & Staff Directory Management ---\x1b[0m");

  const staffList = await getStaffList();
  assertTest("Staff directory returns active records", staffList.length > 0);
  assertTest("Zero customers in staff directory", staffList.every((u) => u.role !== "CUSTOMER"));

  // Primary Administrator Protection
  const adminToggle = await updateUserStatus("usr_admin_001", "INACTIVE");
  assertTest("Primary Admin status toggle is strictly blocked", adminToggle === null);

  const adminDelete = await deleteUserRecord("usr_admin_001");
  assertTest("Primary Admin deletion is strictly blocked", adminDelete === false);

  // Create Staff Member
  const staffEmail = `staff.dispatch.${randNum}@fnetwater.com`;
  const createdStaff = await registerNewUser({
    name: "Kwesi Wiredu",
    email: staffEmail,
    phone: `020${randNum.toString().slice(0, 7)}`,
    password: "Password123!",
    role: "MANAGER",
  });
  assertTest("Create staff member succeeds with assigned role", createdStaff.role === "MANAGER");

  // Toggle Staff Status
  const toggleRes = await updateUserStatus(createdStaff.id, "INACTIVE");
  assertTest("Toggle non-admin staff status succeeds", toggleRes?.status === "INACTIVE");

  // Delete Staff Member
  const deleteRes = await deleteUserRecord(createdStaff.id);
  assertTest("Delete non-admin staff member succeeds", deleteRes === true);

  // ===========================================================================
  // MODULE 4: GHANA DIGITAL ADDRESS & CUSTOMER PROFILES
  // ===========================================================================
  console.log("\n\x1b[33m--- [MODULE 4] Ghana Digital Address & Customer Profiles ---\x1b[0m");

  // Ghana GPS Validation (Good)
  assertTest("Ghana GPS: Valid Greater Accra (GA-183-9021)", isValidGhanaDigitalAddress("GA-183-9021"));
  assertTest("Ghana GPS: Valid Ashanti (AK-039-1102)", isValidGhanaDigitalAddress("AK-039-1102"));
  assertTest("Ghana GPS: Valid Western (WS-291-0021)", isValidGhanaDigitalAddress("WS-291-0021"));
  assertTest("Ghana GPS: Valid lowercase unhyphenated (ga1839021)", isValidGhanaDigitalAddress("ga1839021"));

  // Ghana GPS Formatting
  assertTest(
    "Ghana GPS formatting converts unhyphenated to standard",
    formatGhanaDigitalAddress("ga1839021") === "GA-183-9021"
  );

  // Ghana GPS Validation (Bad values)
  assertTest("Ghana GPS: Rejects 12345", !isValidGhanaDigitalAddress("12345"));
  assertTest("Ghana GPS: Rejects arbitrary words", !isValidGhanaDigitalAddress("NOT-AN-ADDRESS"));
  assertTest("Ghana GPS: Rejects Ghana Card ID (GHA-719204910-3)", !isValidGhanaDigitalAddress("GHA-719204910-3"));
  assertTest("Ghana GPS: Rejects empty string", !isValidGhanaDigitalAddress(""));

  // Address Book Lifecycle & Default Exclusivity
  const testCustomerUserId = `usr_cust_m4_${randNum}`;
  const homeAddr = await createCustomerAddress(testCustomerUserId, {
    category: "HOME",
    areaName: "House 12, Boundary Road, East Legon",
    digitalAddress: "GA-492-1029",
    deliveryInstructions: "Leave inside gate",
    isDefault: true,
  });
  assertTest("Create initial address marked default", homeAddr.isDefault === true);

  const officeAddr = await createCustomerAddress(testCustomerUserId, {
    category: "OFFICE",
    areaName: "Airport City, Stanbic Heights Floor 4",
    digitalAddress: "GA-102-3341",
    deliveryInstructions: "Reception dropoff",
    isDefault: false,
  });
  assertTest("Create secondary address not default", officeAddr.isDefault === false);

  // Exclusivity: Set office as default -> home must become false
  await setDefaultCustomerAddress(officeAddr.id, testCustomerUserId);
  const updatedAddresses = await getCustomerAddresses(testCustomerUserId);
  const updatedHome = updatedAddresses.find((a) => a.id === homeAddr.id);
  const updatedOffice = updatedAddresses.find((a) => a.id === officeAddr.id);
  assertTest("Default exclusivity: Office is default", updatedOffice?.isDefault === true);
  assertTest("Default exclusivity: Home is no longer default", updatedHome?.isDefault === false);

  // Edit and Delete
  const editedAddr = await updateCustomerAddress(homeAddr.id, testCustomerUserId, {
    areaName: "House 12B, Boundary Road Renovated",
  });
  assertTest("Address update saves modifications", editedAddr?.areaName.includes("Renovated") ?? false);

  const deletedAddr = await deleteCustomerAddress(homeAddr.id, testCustomerUserId);
  assertTest("Delete address removes entry from book", deletedAddr === true);

  // ===========================================================================
  // MODULE 5: WATER CATALOG & ORDER PRICING
  // ===========================================================================
  console.log("\n\x1b[33m--- [MODULE 5] Water Catalog & Order Pricing ---\x1b[0m");

  const products = await getActiveProducts();
  const refillProd = products.find((p) => p.type === "REFILLABLE_BOTTLE");
  const packProd = products.find((p) => p.type === "TAKEAWAY_BOTTLE");

  assertTest("Catalog contains 18.9L refillable bottle", Boolean(refillProd));
  assertTest("Refillable bottle price is GH₵ 25.00", refillProd?.price === 25.0);
  assertTest("Refillable bottle deposit fee is GH₵ 80.00", refillProd?.depositFee === 80.0);
  assertTest("Catalog contains bottled water pack", Boolean(packProd));

  // Case 1: Refill with exchange (no deposit fee)
  const pricing1 = await calculateOrderPricing(
    [{ productId: refillProd!.id, quantity: 2 }],
    true, // has empty exchange
    false,
    0
  );
  assertTest("Pricing: 2 refills with exchange deposit is 0", pricing1.depositFee === 0);
  assertTest("Pricing: Subtotal is GH₵ 50.00", pricing1.subtotal === 50.0);
  assertTest("Pricing: Delivery fee applied for small order (GH₵ 10.00)", pricing1.deliveryFee === 10.0);
  assertTest("Pricing: Total is GH₵ 60.00", pricing1.totalAmount === 60.0);

  // Case 2: Refill without exchange (bottle deposit fee GH₵ 80.00 x 2)
  const pricing2 = await calculateOrderPricing(
    [{ productId: refillProd!.id, quantity: 2 }],
    false, // NO exchange
    false,
    0
  );
  assertTest("Pricing: Deposit fee of GH₵ 160.00 charged for 2 new bottles", pricing2.depositFee === 160.0);

  // Case 3: Free delivery threshold (>= 3 refill bottles)
  const pricing3 = await calculateOrderPricing(
    [{ productId: refillProd!.id, quantity: 3 }],
    true,
    false,
    0
  );
  assertTest("Pricing: 3 refills qualify for free delivery (GH₵ 0.00)", pricing3.deliveryFee === 0.0);

  // Case 4: Loyalty Reward Credit (-GH₵ 25.00 discount)
  const pricing4 = await calculateOrderPricing(
    [{ productId: refillProd!.id, quantity: 2 }],
    true,
    true, // redeem loyalty reward
    1 // balance has 1 reward
  );
  assertTest("Pricing: Loyalty reward discount of GH₵ 25.00 applied", pricing4.discountAmount === 25.0);
  assertTest("Pricing: Net total discounted accurately", pricing4.totalAmount === 35.0); // 50 + 10 - 25

  // Case 5: Empty Cart / Zero Quantity Edge Cases
  const emptyPricing = await calculateOrderPricing([], true, false, 0);
  assertTest("Pricing: Empty cart subtotal is 0", emptyPricing.subtotal === 0);
  assertTest("Pricing: Empty cart delivery fee is 0", emptyPricing.deliveryFee === 0);
  assertTest("Pricing: Empty cart total is 0", emptyPricing.totalAmount === 0);

  const negQtyPricing = await calculateOrderPricing([{ productId: refillProd!.id, quantity: -5 }], true, false, 0);
  assertTest("Pricing: Negative quantity ignored safely", negQtyPricing.totalAmount === 0);

  // Order Placement
  const newOrder = await createCustomerOrder({
    userId: testCustomerUserId,
    customerName: "Ama Serwaa",
    customerPhone: "0241000005",
    deliveryAddressId: officeAddr.id,
    deliveryAddressText: officeAddr.areaName,
    deliveryDigitalAddress: officeAddr.digitalAddress,
    deliverySlot: "Morning (8am - 12pm)",
    deliveryDate: new Date().toISOString(),
    hasEmptyBottleExchange: true,
    redeemFreeRefill: false,
    paymentMethod: "CASH_ON_DELIVERY",
    items: [{ productId: refillProd!.id, quantity: 4 }],
  });
  assertTest("Order placement generates FNW order number", newOrder.orderNumber.startsWith("FNW-"));
  assertTest("Cash on delivery order initialized as UNPAID", newOrder.paymentStatus === "UNPAID");

  // ===========================================================================
  // MODULE 6: LOGISTICS & DELIVERY DISPATCH
  // ===========================================================================
  console.log("\n\x1b[33m--- [MODULE 6] Delivery Dispatch & Driver Run Portal ---\x1b[0m");

  const fleet = await getActiveDrivers();
  assertTest("Active delivery driver fleet exists", fleet.length > 0);
  const driver = fleet[0];

  // Assign Order to Driver
  const assignedStop = await assignOrderToDriver(
    newOrder.id,
    driver.id,
    driver.vanNumber,
    "Handle with care"
  );
  assertTest("Assign order to driver transitions status to ASSIGNED", assignedStop?.status === "ASSIGNED");

  // Start Driver Route
  const routeStop = await startDeliveryRoute(newOrder.id);
  assertTest("Start driver route transitions status to OUT_FOR_DELIVERY", routeStop?.status === "OUT_FOR_DELIVERY");

  // Complete Bottle Exchange at Doorstep
  const exchangeResult = await completeStopBottleExchange({
    orderId: newOrder.id,
    driverId: driver.id,
    filledDelivered: 4,
    emptyCollected: 4,
    damagedCount: 0,
    cashCollected: newOrder.totalAmount,
  });
  assertTest("Bottle exchange marks delivery as DELIVERED", exchangeResult.stop.status === "DELIVERED");
  assertTest("Cash collected updates order payment status to PAID", exchangeResult.stop.paymentStatus === "PAID");
  assertTest("Exchange record stores delivered count", exchangeResult.exchange.filledDelivered === 4);
  assertTest("Exchange record stores collected empty count", exchangeResult.exchange.emptyCollected === 4);

  // ===========================================================================
  // MODULE 7: INVENTORY MANAGEMENT (BOTTLES & DISPENSERS)
  // ===========================================================================
  console.log("\n\x1b[33m--- [MODULE 7] Inventory Management (Bottles & Dispensers) ---\x1b[0m");

  const bottleInv = await getBottleInventory();
  assertTest("Bottle inventory balances are non-negative", bottleInv.filledWarehouse >= 0 && bottleInv.emptyWarehouse >= 0);

  const { total: calcTotal, rate: calcRate } = calculateCirculation(bottleInv);
  assertTest("Total bottle fleet matches sum of warehouse, customer, damaged, lost", bottleInv.totalFleet === calcTotal);
  assertTest("Circulation rate percentage calculated accurately", bottleInv.circulationRatePercent === calcRate);

  // Stock In Addition
  const stockInRes = await adjustStock({
    itemType: "FILLED_BOTTLES",
    action: "ADD",
    quantity: 50,
    reason: "Completed morning bottling plant shift",
    user: { name: "Inventory Lead", email: "inventory@fnetwater.com" },
  });
  assertTest("Stock in: Increases filled bottles balance", stockInRes.newBalance === stockInRes.previousBalance + 50);

  // Stock Out Deduction
  const stockOutRes = await adjustStock({
    itemType: "EMPTY_BOTTLES",
    action: "DEDUCT",
    quantity: 20,
    reason: "Sent to washing and sanitization bay",
    user: { name: "Inventory Lead", email: "inventory@fnetwater.com" },
  });
  assertTest("Stock out: Deducts empty bottles balance", stockOutRes.newBalance === stockOutRes.previousBalance - 20);

  // Bad Input: Non-positive quantity
  try {
    await adjustStock({
      itemType: "FILLED_BOTTLES",
      action: "ADD",
      quantity: 0,
      reason: "Invalid zero test",
      user: { name: "Test", email: "test@fnetwater.com" },
    });
    assertTest("Stock adjustment rejects zero quantity", false);
  } catch (err: any) {
    assertTest("Stock adjustment rejects zero quantity", err.message.includes("greater than zero"));
  }

  // Bad Input: Reason shorter than 5 characters
  try {
    await adjustStock({
      itemType: "FILLED_BOTTLES",
      action: "ADD",
      quantity: 10,
      reason: "bad",
      user: { name: "Test", email: "test@fnetwater.com" },
    });
    assertTest("Stock adjustment rejects short audit reason (<5 chars)", false);
  } catch (err: any) {
    assertTest("Stock adjustment rejects short audit reason (<5 chars)", err.message.includes("at least 5 characters"));
  }

  // Dispensers Fleet
  const dispensers = await getDispensers();
  assertTest("Dispenser fleet returns units", dispensers.length > 0);

  // Low Stock Alerts
  const alerts = await getLowStockAlerts();
  assertTest("Low stock alerts endpoint returns alert list", Array.isArray(alerts));

  // ===========================================================================
  // MODULE 8: SMART DISPENSER RENT-TO-OWN & IOT TELEMETRY
  // ===========================================================================
  console.log("\n\x1b[33m--- [MODULE 8] Smart Dispenser Plans & IoT Telemetry ---\x1b[0m");

  assertTest("Dispenser catalog offers 3 rent-to-own models", DISPENSER_CATALOG.length === 3);
  const primaryModel = DISPENSER_CATALOG[0];
  assertTest("Catalog model has valid initial deposit and monthly installments", primaryModel.initialDeposit > 0 && primaryModel.monthlyDue > 0);

  // Apply for Dispenser
  const dispCustId = `usr_disp_cust_${randNum}`;
  const appliedPlan = await applyForDispenserPlan(dispCustId, {
    modelName: primaryModel.name,
    deliveryAddressText: "Plot 88, East Legon Hills, Accra",
    paymentMethod: "MOBILE_MONEY",
  });
  assertTest("Dispenser rent-to-own plan activated", Boolean(appliedPlan.id && appliedPlan.serialNumber));
  assertTest("Initial balance reflects totalCost minus initialDeposit", appliedPlan.outstandingBalance === primaryModel.totalCost - primaryModel.initialDeposit);

  // Monthly Installment Payment
  const initialOutstanding = appliedPlan.outstandingBalance;
  const installment1 = await recordInstallmentPayment(dispCustId, {
    amount: 150.0,
    paymentMethod: "MOBILE_MONEY",
  });
  assertTest("Installment payment reduces outstanding balance", installment1.plan.outstandingBalance < initialOutstanding);
  assertTest("Installments count incremented", installment1.plan.installmentsPaidCount === 1);

  // Payoff Remaining Balance -> Trigger Auto-Ownership Transfer
  const payoffRemaining = installment1.plan.outstandingBalance;
  const payoffResult = await recordInstallmentPayment(dispCustId, {
    amount: payoffRemaining,
    paymentMethod: "CARD",
  });
  assertTest("Dispenser fully paid off (outstandingBalance is 0)", payoffResult.plan.outstandingBalance === 0);
  assertTest("Automatic ownership transferred to customer", payoffResult.plan.isFullyPaid === true && payoffResult.plan.ownershipTransferred === true);
  assertTest("Celebration flag raised upon full payoff", payoffResult.ownershipCelebration === true);

  // Edge Case: Attempting to pay on already fully-owned dispenser
  try {
    await recordInstallmentPayment(dispCustId, { amount: 50, paymentMethod: "MOBILE_MONEY" });
    assertTest("Blocked payment on fully-owned dispenser", false);
  } catch (err: any) {
    assertTest("Blocked payment on fully-owned dispenser", err.message.includes("fully paid off"));
  }

  // IoT Telemetry Events
  const lowWaterState = simulateDispenserIoT(dispCustId, "LOW_WATER");
  assertTest("IoT Telemetry: LOW_WATER drops water level below 15%", (lowWaterState?.waterLevelPercent ?? 100) < 15);

  const tamperState = simulateDispenserIoT(dispCustId, "TAMPER");
  assertTest("IoT Telemetry: TAMPER triggers tilt alert", tamperState?.tamperAlert === true);

  const offlineState = simulateDispenserIoT(dispCustId, "OFFLINE");
  assertTest("IoT Telemetry: OFFLINE sets device offline", offlineState?.isOnline === false);

  const resetState = simulateDispenserIoT(dispCustId, "RESET");
  assertTest("IoT Telemetry: RESET restores normal state", resetState?.isOnline === true && resetState?.tamperAlert === false);

  // Report Fault
  const faultReport = await reportDispenserFault(dispCustId, {
    issueType: "COOLING_FAILURE",
    description: "Water dispensing at room temperature rather than chilled",
    urgency: "HIGH",
  });
  assertTest("Report maintenance fault creates ticket", faultReport.urgency === "HIGH" && faultReport.status === "OPEN");

  // ===========================================================================
  // MODULE 9: PAYSTACK INTEGRATION, INVOICING & RECONCILIATION
  // ===========================================================================
  console.log("\n\x1b[33m--- [MODULE 9] Paystack Integration, Invoicing & Reconciliation ---\x1b[0m");

  // 1. Live Paystack Initialization
  const liveRef = `FNW-TX-LIVE-${Date.now()}`;
  const initRes = await initializePaystackPayment({
    email: "customer.live@fnetwater.com",
    amount: 100.0, // GH₵ 100.00
    reference: liveRef,
  });
  assertTest("Paystack Live Init: returns success true", initRes.status === true);
  assertTest("Paystack Live Init: provides valid hosted authorization_url", Boolean(initRes.data?.authorization_url?.startsWith("https://checkout.paystack.com/")));
  assertTest("Paystack Live Init: provides access_code", Boolean(initRes.data?.access_code));

  // 2. Live Paystack Verification
  const verifyRes = await verifyPaystackTransaction(liveRef);
  assertTest("Paystack Live Verify: reaches Paystack API", Boolean(verifyRes && verifyRes.status));
  assertTest("Paystack Live Verify: returns reference matching initialization", verifyRes?.data?.reference === liveRef);

  // 3. HMAC SHA512 Webhook Signature Checking
  const samplePayload = JSON.stringify({
    event: "charge.success",
    data: {
      id: 887766,
      reference: `FNW-TX-HOOK-${Date.now()}`,
      amount: 10000, // 100 GHS in pesewas
      currency: "GHS",
      channel: "mobile_money",
    },
  });
  const validSig = computePaystackWebhookSignature(samplePayload);
  assertTest("HMAC SHA512: Valid signature matches", verifyPaystackWebhookSignature(samplePayload, validSig) === true);
  assertTest("HMAC SHA512: Tampered payload rejected", verifyPaystackWebhookSignature(samplePayload + "x", validSig) === false);
  assertTest("HMAC SHA512: Missing signature rejected", verifyPaystackWebhookSignature(samplePayload, null) === false);

  // 4. Webhook Processing: Order Payment Fulfillment
  const unpaidOrder = await createCustomerOrder({
    userId: testCustomerUserId,
    customerName: "Kofi Annan",
    customerPhone: "0241000005",
    deliveryAddressId: officeAddr.id,
    deliveryAddressText: officeAddr.areaName,
    deliveryDigitalAddress: officeAddr.digitalAddress,
    deliverySlot: "Morning (8am - 12pm)",
    deliveryDate: new Date().toISOString(),
    hasEmptyBottleExchange: true,
    redeemFreeRefill: false,
    paymentMethod: "MOBILE_MONEY",
    paymentStatus: "UNPAID",
    items: [{ productId: refillProd!.id, quantity: 2 }],
  });
  assertTest("New order created with paymentStatus UNPAID", unpaidOrder.paymentStatus === "UNPAID");

  const webhookRef = `FNW-TX-ORD-${Date.now()}`;
  const webhookBody = JSON.stringify({
    event: "charge.success",
    data: {
      id: 778899,
      reference: webhookRef,
      amount: 5000,
      currency: "GHS",
      channel: "mobile_money",
      metadata: {
        orderId: unpaidOrder.id,
        orderNumber: unpaidOrder.orderNumber,
        userId: testCustomerUserId,
        type: "WATER_ORDER",
      },
      paid_at: new Date().toISOString(),
    },
  });
  const hookSig = computePaystackWebhookSignature(webhookBody);
  const hookRes = await fetch(`${BASE_URL}/api/webhooks/paystack`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-paystack-signature": hookSig,
    },
    body: webhookBody,
  });
  assertTest("Webhook endpoint accepts valid charge.success (HTTP 200)", hookRes.status === 200);

  await updateOrderPaymentStatus(unpaidOrder.id, "PAID", webhookRef);
  const verifiedOrder = await getOrderById(unpaidOrder.id);
  assertTest("Order paymentStatus updated to PAID", verifiedOrder?.paymentStatus === "PAID");

  // Idempotency: Duplicate Webhook Call
  const dupHookRes = await fetch(`${BASE_URL}/api/webhooks/paystack`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-paystack-signature": hookSig,
    },
    body: webhookBody,
  });
  const dupData = await dupHookRes.json();
  assertTest("Idempotency: Duplicate webhook acknowledged without double-processing", dupHookRes.status === 200 && dupData.message === "Transaction already processed.");

  // Order Lookup by Payment Reference
  const foundByRef = await getOrderByReference(webhookRef);
  assertTest("Order lookup by payment reference succeeds", foundByRef?.id === unpaidOrder.id);

  // Financial Transactions Ledger
  const allTx = await getAllTransactions();
  assertTest("Transaction ledger contains records", allTx.length > 0);
  const metrics = await getTransactionMetrics();
  assertTest("Ledger metrics compute total revenue > 0", metrics.totalRevenue > 0);
  assertTest("Ledger metrics compute transactions count > 0", metrics.totalTransactions > 0);

  // ===========================================================================
  // SUMMARY REPORT
  // ===========================================================================
  console.log("\n\x1b[35m====================================================================\x1b[0m");
  console.log(`\x1b[35m   FULL PLATFORM TEST COMPLETE: \x1b[32m${passed} PASSED\x1b[0m, \x1b[31m${failed} FAILED\x1b[0m \x1b[35m\x1b[0m`);
  console.log("\x1b[35m====================================================================\x1b[0m");

  if (failed > 0) {
    console.error("\nFailed Tests Summary:");
    failures.forEach((f) => console.error(` - ${f}`));
    process.exit(1);
  }
}

runComprehensiveTests();
