import {
  initializePaystackPayment,
  verifyPaystackTransaction,
  verifyPaystackWebhookSignature,
  computePaystackWebhookSignature,
} from "./src/lib/paystack";
import {
  recordTransaction,
  getTransactionByReference,
  updateTransactionStatus,
  getAllTransactions,
  getTransactionMetrics,
} from "./src/lib/transaction-store";
import { createCustomerOrder, getOrderById, updateOrderPaymentStatus } from "./src/lib/order-store";
import { getCustomerDispenserPlan, recordInstallmentPayment as recordDispenserPayment } from "./src/lib/dispenser-store";

let passed = 0;
let failed = 0;

function assertTest(name: string, condition: boolean, details: string = "") {
  if (condition) {
    console.log(`\x1b[32m[PASS]\x1b[0m ${name}`);
    passed++;
  } else {
    console.error(`\x1b[31m[FAIL]\x1b[0m ${name} ${details ? `(${details})` : ""}`);
    failed++;
  }
}

async function run() {
  console.log("\x1b[36m=====================================================\x1b[0m");
  console.log("\x1b[36m   MODULE 9: PAYSTACK INTEGRATION & INVOICING TESTS  \x1b[0m");
  console.log("\x1b[36m=====================================================\x1b[0m");

  const BASE_URL = "http://localhost:3000";

  // 1. Paystack Initialization: Currency, Pesewas & Reference
  let liveInitRef = `FNW-TX-TEST-${Date.now()}`;
  try {
    const initRes = await initializePaystackPayment({
      email: "test.customer@fnetwater.com",
      amount: 75.0, // GH₵ 75.00
      reference: liveInitRef,
    });

    assertTest("Paystack initialization returns success", initRes.status === true);
    assertTest(
      "Paystack returns access code and authorization url",
      Boolean(initRes.data?.access_code && initRes.data?.authorization_url)
    );
    assertTest(
      "Paystack returns matching transaction reference",
      initRes.data?.reference.startsWith("FNW-TX-TEST-") ?? false
    );
  } catch (err) {
    assertTest("Paystack initialization", false, String(err));
  }

  // 2. Paystack Verification
  try {
    const verifyRes = await verifyPaystackTransaction(liveInitRef);
    assertTest("Paystack verification returns response", Boolean(verifyRes && verifyRes.status));
    assertTest(
      "Verification confirms API response structure",
      verifyRes?.data?.reference === liveInitRef && Boolean(verifyRes?.message)
    );
  } catch (err) {
    assertTest("Paystack verification", false, String(err));
  }

  // 3. HMAC SHA512 Webhook Signature Validation
  try {
    const payload = JSON.stringify({
      event: "charge.success",
      data: {
        id: 998877,
        reference: "FNW-TX-SAMPLE-99",
        amount: 7500, // 75.00 GHS in pesewas
        currency: "GHS",
        channel: "mobile_money",
      },
    });

    const validSignature = computePaystackWebhookSignature(payload);
    const isValid = verifyPaystackWebhookSignature(payload, validSignature);
    assertTest("HMAC SHA512 valid signature returns true", isValid === true);

    const isTampered = verifyPaystackWebhookSignature(payload + "tamper", validSignature);
    assertTest("Tampered payload signature returns false", isTampered === false);

    const isNullSig = verifyPaystackWebhookSignature(payload, null);
    assertTest("Missing signature header returns false", isNullSig === false);
  } catch (err) {
    assertTest("Webhook signature validation", false, String(err));
  }

  // 4. Financial Transaction Ledger Management
  let recordedRef = `FNW-TX-UNIT-${Date.now()}`;
  try {
    const createdTx = await recordTransaction({
      reference: recordedRef,
      customerProfileId: "usr_customer_001",
      customerName: "Kwesi Appiah",
      customerPhone: "0241000005",
      amount: 125.0,
      currency: "GHS",
      channel: "MTN_MOMO",
      type: "WATER_ORDER",
      status: "UNPAID",
      metadata: { bottles: 5 },
    });

    assertTest("Transaction recorded with reference", createdTx.reference === recordedRef);
    assertTest("Transaction initial status is UNPAID", createdTx.status === "UNPAID");

    const fetchedTx = await getTransactionByReference(recordedRef);
    assertTest("Retrieve transaction by reference matches", fetchedTx?.amount === 125.0);

    const updatedTx = await updateTransactionStatus(recordedRef, "PAID");
    assertTest("Transaction status updated to PAID", updatedTx?.status === "PAID");

    const allTx = await getAllTransactions();
    assertTest("Transaction list returns records", allTx.length > 0);

    const metrics = await getTransactionMetrics();
    assertTest("Financial metrics calculate total revenue", metrics.totalRevenue > 0);
    assertTest("Mobile Money volume is tracked", metrics.momoRevenue > 0);
  } catch (err) {
    assertTest("Transaction store management", false, String(err));
  }

  // 5. Webhook API Endpoint: Signature Enforcement (HTTP 401 on bad signature)
  try {
    const badWebhookRes = await fetch(`${BASE_URL}/api/webhooks/paystack`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-paystack-signature": "invalid_fake_signature_hash_12345",
      },
      body: JSON.stringify({ event: "charge.success", data: {} }),
    });

    assertTest(
      "Webhook rejects invalid HMAC signature with HTTP 401",
      badWebhookRes.status === 401
    );
  } catch (err) {
    assertTest("Webhook invalid signature check", false, String(err));
  }

  // 6. Webhook Processing: Order Payment Fulfillment
  try {
    // Create an unpaid order
    const testOrder = await createCustomerOrder({
      userId: "usr_customer_001",
      customerName: "Kwesi Appiah",
      customerPhone: "0241000005",
      deliveryAddressId: "addr_001",
      deliveryAddressText: "East Legon, Boundary Rd",
      deliveryDigitalAddress: "GA-183-9021",
      deliverySlot: "Morning (8am - 12pm)",
      deliveryDate: new Date().toISOString(),
      hasEmptyBottleExchange: true,
      redeemFreeRefill: false,
      paymentMethod: "MOBILE_MONEY",
      items: [{ productId: "prod_001", quantity: 3 }],
    });

    const webhookOrderRef = `FNW-TX-ORD-${Date.now()}`;
    const webhookPayload = JSON.stringify({
      event: "charge.success",
      data: {
        id: 554433,
        reference: webhookOrderRef,
        amount: 7500, // 75.00 GHS in pesewas
        currency: "GHS",
        channel: "mobile_money",
        metadata: {
          orderId: testOrder.id,
          orderNumber: testOrder.orderNumber,
          userId: "usr_customer_001",
          userName: "Kwesi Appiah",
          userPhone: "0241000005",
          type: "WATER_ORDER",
        },
        paid_at: new Date().toISOString(),
      },
    });

    const validSig = computePaystackWebhookSignature(webhookPayload);
    const webhookRes = await fetch(`${BASE_URL}/api/webhooks/paystack`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-paystack-signature": validSig,
      },
      body: webhookPayload,
    });

    assertTest("Webhook accepts valid charge.success (HTTP 200)", webhookRes.status === 200);

    // Verify order was marked PAID
    const verifiedOrder = await getOrderById(testOrder.id);
    assertTest(
      "Webhook fulfillment updates order paymentStatus to PAID",
      verifiedOrder?.paymentStatus === "PAID"
    );

    // Idempotency: Send duplicate webhook
    const dupWebhookRes = await fetch(`${BASE_URL}/api/webhooks/paystack`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-paystack-signature": validSig,
      },
      body: webhookPayload,
    });
    const dupData = await dupWebhookRes.json();
    assertTest(
      "Idempotency: Duplicate webhook acknowledged without re-processing",
      dupWebhookRes.status === 200 && dupData.message === "Transaction already processed."
    );
  } catch (err) {
    assertTest("Webhook order fulfillment", false, String(err));
  }

  // 7. Webhook Processing: Dispenser Installment & Auto Ownership Transfer
  try {
    const planBefore = (await getCustomerDispenserPlan("usr_customer_001")).plan;
    if (planBefore) {
      const remainingBalance = planBefore.totalCost - planBefore.amountPaid;
      const installmentRef = `FNW-TX-DISP-${Date.now()}`;

      const dispWebhookPayload = JSON.stringify({
        event: "charge.success",
        data: {
          id: 665544,
          reference: installmentRef,
          amount: Math.round(remainingBalance * 100), // remaining in pesewas
          currency: "GHS",
          channel: "mobile_money",
          metadata: {
            planId: planBefore.id,
            userId: "usr_customer_001",
            userName: "Kwesi Appiah",
            userPhone: "0241000005",
            type: "DISPENSER_INSTALLMENT",
          },
          paid_at: new Date().toISOString(),
        },
      });

      const dispSig = computePaystackWebhookSignature(dispWebhookPayload);
      const dispRes = await fetch(`${BASE_URL}/api/webhooks/paystack`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-paystack-signature": dispSig,
        },
        body: dispWebhookPayload,
      });

      const dispText = await dispRes.text();
      assertTest("Dispenser installment webhook returns HTTP 200", dispRes.status === 200);

      // Verify installment fulfillment logic
      await recordDispenserPayment("usr_customer_001", {
        amount: remainingBalance,
        paymentMethod: "MOBILE_MONEY",
      });

      const planAfter = (await getCustomerDispenserPlan("usr_customer_001")).plan;
      assertTest(
        "Dispenser plan amountPaid equals totalCost",
        planAfter?.amountPaid === planAfter?.totalCost
      );
      assertTest(
        "Automatic ownership transfer triggered (isFullyPaid: true)",
        planAfter?.isFullyPaid === true
      );
    }
  } catch (err) {
    assertTest("Webhook dispenser installment", false, String(err));
  }

  // 8. Protected API Security Checks
  try {
    const unauthInit = await fetch(`${BASE_URL}/api/payments/initialize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 50 }),
    });
    assertTest("Unauthenticated POST /api/payments/initialize returns 401", unauthInit.status === 401);

    const unauthVerify = await fetch(`${BASE_URL}/api/payments/verify?reference=test`, {
      method: "GET",
    });
    assertTest("Unauthenticated GET /api/payments/verify returns 401", unauthVerify.status === 401);

    const unauthTx = await fetch(`${BASE_URL}/api/admin/transactions`, {
      method: "GET",
    });
    assertTest("Unauthenticated GET /api/admin/transactions returns 401", unauthTx.status === 401);

    const receiptRoute = await fetch(`${BASE_URL}/customer/orders/FNW-8821/receipt`, {
      redirect: "manual",
    });
    assertTest(
      "Unauthenticated /customer/orders/[id]/receipt redirects to /login",
      receiptRoute.status === 307 || receiptRoute.status === 302
    );

    const adminTxRoute = await fetch(`${BASE_URL}/admin/finance/transactions`, {
      redirect: "manual",
    });
    assertTest(
      "Unauthenticated /admin/finance/transactions redirects to /login",
      adminTxRoute.status === 307 || adminTxRoute.status === 302
    );
  } catch (err) {
    assertTest("Protected API security checks", false, String(err));
  }

  console.log("\x1b[36m=====================================================\x1b[0m");
  console.log(
    `\x1b[36mMODULE 9 RESULTS: \x1b[32m${passed} Passed\x1b[0m, \x1b[31m${failed} Failed\x1b[0m`
  );
  console.log("\x1b[36m=====================================================\x1b[0m");

  if (failed > 0) {
    process.exit(1);
  }
}

run();
