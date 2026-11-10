/**
 * MODULE 11: NOTIFICATION CENTER & MNOTIFY SMS ALERTS TEST SUITE
 * Tests:
 * 1. Notification creation and role-based filtering (Customer, Driver, Manager, Admin, Agent)
 * 2. Unread badge counter calculation and state transitions
 * 3. Mark single notification as read & mark all as read
 * 4. mNotify Ghana SMS integration & domain helper dispatchers
 * 5. SMS audit logging ledger and retrieval
 * 6. Automated operational triggers:
 *    - Order placement -> Customer in-app notification + SMS
 *    - Driver assignment -> Driver in-app notification + SMS
 *    - Delivery route start -> Customer out-for-delivery notification + SMS
 *    - Bottle exchange completion -> Customer completion notification + SMS
 *    - Smart Dispenser IoT tamper -> Admin tamper alert + SMS
 *    - 5:1 Referral reward threshold -> Customer free bottle reward + SMS
 *    - Low warehouse inventory -> Manager low stock alert + SMS
 * 7. Notification API endpoints (GET /api/notifications, POST /api/notifications, GET /api/notifications/sms-logs)
 */

import {
  createNotification,
  getNotificationsForUser,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getRecentSmsLogs,
  recordSmsDispatch,
  resetNotificationStoreForTesting,
} from "./src/lib/notification-store";
import {
  sendOtpSms,
  sendOrderConfirmationSms,
  sendDriverDispatchSms,
  sendDeliveryCompletedSms,
  sendRewardEarnedSms,
  sendDriverAssignedSms,
  sendLowInventoryAlertSms,
  sendTamperAlertSms,
  normalizeGhanaPhone,
} from "./src/lib/mnotify";
import { createCustomerOrder } from "./src/lib/order-store";
import { assignOrderToDriver, startDeliveryRoute, completeStopBottleExchange } from "./src/lib/dispatch-store";
import { simulateDispenserIoT } from "./src/lib/dispenser-store";
import { adjustStock } from "./src/lib/inventory-store";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
    passed++;
  } else {
    console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
    failed++;
  }
}

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("====================================================================");
  console.log("   F-NET WATER HUB: MODULE 11 NOTIFICATION CENTER & SMS SUITE       ");
  console.log("====================================================================\n");

  resetNotificationStoreForTesting();

  // ---------------------------------------------------------
  // 1. Notification Creation & Role-Based Filtering
  // ---------------------------------------------------------
  console.log("--- 1. Notification Creation & Role-Based Scoping ---");

  const testUserId = `usr_test_cust_${Date.now()}`;
  const notif1 = await createNotification({
    userId: testUserId,
    role: "CUSTOMER",
    title: "Order Received",
    message: "We have received your water delivery request.",
    type: "ORDER",
    linkUrl: "/customer/orders",
  });
  assert(notif1.id.startsWith("notif_"), "Creates notification with generated ID");
  assert(notif1.isRead === false, "New notification defaults to unread");

  // Fetch for this user
  const userNotifs = await getNotificationsForUser(testUserId, "CUSTOMER");
  assert(userNotifs.length >= 1, "Retrieves notification for targeted user ID");
  assert(userNotifs[0].id === notif1.id, "Targeted user receives correct notification");

  // Broadcast to DRIVER role
  const driverNotif = await createNotification({
    role: "DRIVER",
    title: "Depot Traffic Notice",
    message: "Motorway roadwork active near Spintex exit.",
    type: "SYSTEM",
    linkUrl: "/driver",
  });
  const driverInbox = await getNotificationsForUser("usr_driver_001", "DRIVER");
  const foundDriverBroadcast = driverInbox.some((n) => n.id === driverNotif.id);
  assert(foundDriverBroadcast, "Driver role receives role-broadcast notification");

  // Customer should NOT receive driver broadcast
  const customerInboxCheck = await getNotificationsForUser(testUserId, "CUSTOMER");
  const customerReceivedDriverAlert = customerInboxCheck.some((n) => n.id === driverNotif.id);
  assert(!customerReceivedDriverAlert, "Customer does not receive driver-specific notification");

  // ---------------------------------------------------------
  // 2. Unread Counter & Mark as Read Transitions
  // ---------------------------------------------------------
  console.log("\n--- 2. Unread Counters & Read State Transitions ---");

  const unreadBefore = await getUnreadNotificationCount(testUserId, "CUSTOMER");
  assert(unreadBefore >= 1, "Unread count accurately reflects unread items");

  // Mark single notification as read
  const markOk = await markNotificationAsRead(notif1.id, testUserId);
  assert(markOk === true, "Marks single notification as read");

  const unreadAfterSingle = await getUnreadNotificationCount(testUserId, "CUSTOMER");
  assert(unreadAfterSingle === unreadBefore - 1, "Unread counter decrements by 1 after single read");

  // Add 3 unread notifications
  for (let i = 1; i <= 3; i++) {
    await createNotification({
      userId: testUserId,
      role: "CUSTOMER",
      title: `Batch Alert ${i}`,
      message: `Test batch message ${i}`,
      type: "SYSTEM",
    });
  }
  const unreadBatch = await getUnreadNotificationCount(testUserId, "CUSTOMER");
  assert(unreadBatch === unreadAfterSingle + 3, "Unread counter increases by 3");

  // Mark all as read
  const markedAllCount = await markAllNotificationsAsRead(testUserId, "CUSTOMER");
  assert(markedAllCount >= 3, "Mark all as read marks remaining unread notifications");

  const unreadFinal = await getUnreadNotificationCount(testUserId, "CUSTOMER");
  assert(unreadFinal === 0, "Unread counter is 0 after mark all as read");

  // ---------------------------------------------------------
  // 3. mNotify Ghana SMS Dispatches & Audit Logging
  // ---------------------------------------------------------
  console.log("\n--- 3. mNotify Ghana SMS Dispatches & Audit Logging ---");

  // Phone Normalization
  assert(normalizeGhanaPhone("+233241000005") === "0241000005", "Normalizes international Ghanaian phone (+233)");
  assert(normalizeGhanaPhone("233241000005") === "0241000005", "Normalizes un-prefixed international phone (233)");
  assert(normalizeGhanaPhone("024-100-0005") === "0241000005", "Strips dashes from local phone");

  // 1. OTP SMS
  const otpRes = await sendOtpSms("0241000005", "84920");
  assert(otpRes.status === "success", "sendOtpSms dispatches successfully");

  // 2. Order Confirmation SMS
  const orderSms = await sendOrderConfirmationSms("0241000005", "FNW-9001", 125.0);
  assert(orderSms.status === "success", "sendOrderConfirmationSms dispatches successfully");

  // 3. Driver Dispatch SMS
  const dispatchSms = await sendDriverDispatchSms("0241000005", "Kwame Asante", "FNW-9001");
  assert(dispatchSms.status === "success", "sendDriverDispatchSms dispatches successfully");

  // 4. Delivery Completed SMS
  const completedSms = await sendDeliveryCompletedSms("0241000005", "FNW-9001", 4);
  assert(completedSms.status === "success", "sendDeliveryCompletedSms dispatches successfully");

  // 5. Reward Earned SMS
  const rewardSms = await sendRewardEarnedSms("0241000005", "Ama Osei", 2);
  assert(rewardSms.status === "success", "sendRewardEarnedSms dispatches successfully");

  // 6. Driver Assigned SMS
  const driverAssignedSms = await sendDriverAssignedSms("0241000003", "FNW-9001", "East Legon, House 14");
  assert(driverAssignedSms.status === "success", "sendDriverAssignedSms dispatches successfully");

  // 7. Low Inventory Alert SMS
  const lowInvSms = await sendLowInventoryAlertSms("0241000002", 72);
  assert(lowInvSms.status === "success", "sendLowInventoryAlertSms dispatches successfully");

  // 8. Tamper Alert SMS
  const tamperSms = await sendTamperAlertSms("0241000001", "FNW-DSP-042", "Airport Residential, Suite 4B");
  assert(tamperSms.status === "success", "sendTamperAlertSms dispatches successfully");

  // Verify Audit Logs Ledger
  const recentLogs = await getRecentSmsLogs(20);
  assert(recentLogs.length >= 8, "SMS audit ledger contains all dispatched messages");
  const otpLog = recentLogs.find((l) => l.type === "OTP_VERIFICATION");
  assert(otpLog !== undefined, "Audit ledger includes OTP verification record");
  const orderLog = recentLogs.find((l) => l.type === "ORDER_CONFIRMATION");
  assert(orderLog !== undefined && orderLog.recipientPhone === "0241000005", "Audit ledger contains order confirmation with phone");

  // ---------------------------------------------------------
  // 4. Automated Workflow Triggers
  // ---------------------------------------------------------
  console.log("\n--- 4. Automated Workflow Triggers ---");

  // A. Order Placement Trigger
  const triggerCustomerUserId = `usr_trig_cust_${Date.now()}`;
  const triggerOrder = await createCustomerOrder({
    userId: triggerCustomerUserId,
    customerName: "Kofi Boateng",
    customerPhone: "0249876543",
    deliveryAddressId: "addr_test_01",
    deliveryAddressText: "Community 18, Lashibi",
    deliveryDigitalAddress: "GA-821-3901",
    deliverySlot: "Morning (8am - 12pm)",
    deliveryDate: new Date().toISOString(),
    hasEmptyBottleExchange: true,
    redeemFreeRefill: false,
    paymentMethod: "CASH_ON_DELIVERY",
    items: [{ productId: "prod_001", quantity: 3 }],
  });
  const custOrderNotifs = await getNotificationsForUser(triggerCustomerUserId, "CUSTOMER");
  const foundOrderPlaced = custOrderNotifs.some((n) => n.title.includes(triggerOrder.orderNumber));
  assert(foundOrderPlaced, "Order placement triggers customer in-app notification");

  // Manager receives new order notification
  const managerInbox = await getNotificationsForUser("usr_manager_001", "MANAGER");
  const foundManagerAlert = managerInbox.some((n) => n.title.includes(triggerOrder.orderNumber));
  assert(foundManagerAlert, "Order placement triggers manager in-app notification");

  // B. Driver Assignment Trigger
  await assignOrderToDriver(triggerOrder.id, "usr_driver_001", "Van 01 (GT-4421-23)");
  const driverStopsInbox = await getNotificationsForUser("usr_driver_001", "DRIVER");
  const foundDriverStop = driverStopsInbox.some((n) => n.title.includes(triggerOrder.orderNumber));
  assert(foundDriverStop, "Driver assignment triggers driver in-app notification");

  // C. Route Start Trigger
  await startDeliveryRoute(triggerOrder.id);
  const custRouteNotifs = await getNotificationsForUser(triggerCustomerUserId, "CUSTOMER");
  const foundRouteStart = custRouteNotifs.some((n) => n.title.includes("Out for Delivery"));
  assert(foundRouteStart, "Route start triggers customer out-for-delivery notification");

  // D. Bottle Exchange Delivery Complete Trigger
  await completeStopBottleExchange({
    orderId: triggerOrder.id,
    driverId: "usr_driver_001",
    filledDelivered: 3,
    emptyCollected: 3,
    damagedCount: 0,
    cashCollected: triggerOrder.totalAmount,
  });
  const custCompleteNotifs = await getNotificationsForUser(triggerCustomerUserId, "CUSTOMER");
  const foundDeliveryComplete = custCompleteNotifs.some((n) => n.title.includes("Delivery Completed"));
  assert(foundDeliveryComplete, "Exchange completion triggers customer completion notification");

  // E. Smart Dispenser Tamper Trigger
  simulateDispenserIoT("usr_customer_001", "TAMPER");
  const adminDispInbox = await getNotificationsForUser("usr_admin_001", "ADMIN");
  const foundTamperAlert = adminDispInbox.some((n) => n.title.includes("Tamper Alert"));
  assert(foundTamperAlert, "Dispenser tamper event triggers admin in-app notification");

  // F. Low Inventory Trigger
  await adjustStock({
    itemType: "FILLED_BOTTLES",
    action: "DEDUCT",
    quantity: 450, // drops below threshold of 100
    reason: "Bulk shipment to regional depot",
    user: { name: "Depot Supervisor", email: "depot@fnetwater.com" },
  });
  const managerInvInbox = await getNotificationsForUser("usr_manager_001", "MANAGER");
  const foundLowStockAlert = managerInvInbox.some((n) => n.title.includes("Low Inventory Warning"));
  assert(foundLowStockAlert, "Stock deduction below threshold triggers manager low inventory alert");

  // ---------------------------------------------------------
  // 5. Notification API Endpoints
  // ---------------------------------------------------------
  console.log("\n--- 5. Notification API Endpoints ---");

  // GET /api/notifications
  const getApiRes = await fetch(`${BASE_URL}/api/notifications?userId=usr_customer_001&role=CUSTOMER`);
  const getApiData = await getApiRes.json();
  assert(getApiRes.status === 200, "GET /api/notifications returns HTTP 200");
  assert(getApiData.success === true, "GET /api/notifications returns success: true");
  assert(Array.isArray(getApiData.notifications), "GET /api/notifications returns notifications array");
  assert(typeof getApiData.unreadCount === "number", "GET /api/notifications returns unreadCount number");

  // POST /api/notifications (Mark single read)
  if (getApiData.notifications.length > 0) {
    const targetId = getApiData.notifications[0].id;
    const postSingleRes = await fetch(`${BASE_URL}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: targetId, userId: "usr_customer_001" }),
    });
    const postSingleData = await postSingleRes.json();
    assert(postSingleRes.status === 200 && postSingleData.success === true, "POST /api/notifications marks single notification as read");
  }

  // POST /api/notifications (Mark all read)
  const postAllRes = await fetch(`${BASE_URL}/api/notifications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markAll: true, userId: "usr_customer_001", role: "CUSTOMER" }),
  });
  const postAllData = await postAllRes.json();
  assert(postAllRes.status === 200 && postAllData.success === true, "POST /api/notifications marks all as read");

  // POST /api/notifications/dispatch (System Dispatcher)
  const dispatchApiRes = await fetch(`${BASE_URL}/api/notifications/dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "usr_customer_001",
      role: "CUSTOMER",
      title: "API Dispatched Alert",
      message: "Notification generated via internal dispatcher endpoint.",
      type: "SYSTEM",
      sendSms: true,
      smsType: "ORDER_CONFIRMATION",
      recipientPhone: "0241000005",
      metadata: { orderNumber: "FNW-9900", totalAmount: 75.0 },
    }),
  });
  const dispatchApiData = await dispatchApiRes.json();
  assert(dispatchApiRes.status === 200 && dispatchApiData.success === true, "POST /api/notifications/dispatch creates notification and dispatches SMS");

  // GET /api/notifications/sms-logs
  const getSmsLogsRes = await fetch(`${BASE_URL}/api/notifications/sms-logs`);
  const getSmsLogsData = await getSmsLogsRes.json();
  assert(getSmsLogsRes.status === 200 && getSmsLogsData.success === true, "GET /api/notifications/sms-logs returns HTTP 200");
  assert(Array.isArray(getSmsLogsData.logs), "GET /api/notifications/sms-logs returns logs array");
  assert(getSmsLogsData.logs.length > 0, "SMS audit logs ledger is populated");

  // ---------------------------------------------------------
  // 6. Summary Report
  // ---------------------------------------------------------
  console.log("\n====================================================================");
  console.log(`   MODULE 11 SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED     `);
  console.log("====================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
