/**
 * MODULE 10: REFERRAL & REWARD ENGINE (5:1 RULE) TEST SUITE
 * Tests:
 * 1. Referral attribution on customer registration
 * 2. Order payment triggers referee qualification
 * 3. 5:1 threshold rule: 5 qualified referrals = +1 Free Bottle Credit
 * 4. Free bottle reward redemption in checkout
 * 5. Agent commission calculation & on-the-ground customer onboarding
 * 6. API endpoints for customer & agent referral stats
 */

import {
  findReferrerByCode,
  recordReferralSignup,
  qualifyReferralOnOrderPayment,
  redeemCustomerFreeBottle,
  getCustomerReferralStats,
  getAgentStats,
  agentOnboardCustomer,
} from "./src/lib/referral-store";
import { getCustomerProfile, updateCustomerProfileData } from "./src/lib/customer-store";
import { calculateOrderPricing } from "./src/lib/order-store";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`[PASS] ${msg}`);
    passed++;
  } else {
    console.error(`[FAIL] ${msg}`);
    failed++;
  }
}

async function runTests() {
  console.log("====================================================================");
  console.log("   F-NET WATER HUB: MODULE 10 REFERRAL & REWARD ENGINE SUITE        ");
  console.log("====================================================================\n");

  // ---------------------------------------------------------
  // 1. Referral Code Lookup & Attribution
  // ---------------------------------------------------------
  console.log("--- 1. Referral Code Lookup & Attribution ---");
  const referrerAma = await findReferrerByCode("FNW-AMA01");
  assert(referrerAma !== null && referrerAma.id === "usr_customer_001", "Finds referrer Ama Osei by code FNW-AMA01");

  const referrerAgent = await findReferrerByCode("FNW-AGENT-KOFI");
  assert(referrerAgent !== null && referrerAgent.id === "usr_agent_001", "Finds agent Kofi Mensah by code FNW-AGENT-KOFI");

  const invalidCode = await findReferrerByCode("INVALID-CODE-XYZ");
  assert(invalidCode === null, "Rejects non-existent referral code");

  // Self referral blocked
  const selfRef = await recordReferralSignup("usr_customer_001", "Ama Osei", "0241000005", "FNW-AMA01");
  assert(selfRef === null, "Self-referral is strictly prevented");

  // Valid referee registration
  const testRefereeId = `usr_test_referee_${Date.now()}`;
  const validRef = await recordReferralSignup(testRefereeId, "Kojo Antwi", "0249876543", "FNW-AMA01");
  assert(validRef !== null, "Successfully records new referee signup under FNW-AMA01");
  assert(validRef?.isQualified === false, "Newly registered referee is initially not qualified");
  assert(validRef?.qualifiedAt === null, "Qualified timestamp is null before first order");

  // Duplicate registration of same referee returns existing record without duplication
  const dupRef = await recordReferralSignup(testRefereeId, "Kojo Antwi", "0249876543", "FNW-AMA01");
  assert(dupRef?.id === validRef?.id, "Duplicate referee registration returns existing record");

  // ---------------------------------------------------------
  // 2. Referee Qualification on First Order Payment
  // ---------------------------------------------------------
  console.log("\n--- 2. Referee Qualification on First Order Payment ---");
  const qualResult = await qualifyReferralOnOrderPayment(testRefereeId);
  assert(qualResult.qualified === true, "First paid order qualifies referee");

  // Duplicate payment qualification on already qualified referee
  const dupQual = await qualifyReferralOnOrderPayment(testRefereeId);
  assert(dupQual.qualified === false, "Subsequent paid orders do not double-qualify referee");

  // ---------------------------------------------------------
  // 3. 5:1 Rule: 5 Qualified Referrals Award +1 Free Bottle
  // ---------------------------------------------------------
  console.log("\n--- 3. 5:1 Reward Rule Threshold ---");
  // Set up fresh test referrer
  const testReferrerId = `usr_test_referrer_${Date.now()}`;
  await updateCustomerProfileData(testReferrerId, { freeBottleBalance: 0 });

  // Add 4 qualified referrals
  for (let i = 1; i <= 4; i++) {
    const refId = `usr_batch_referee_${Date.now()}_${i}`;
    // Manually register under test referrer's custom code
    const r = await recordReferralSignup(refId, `Friend ${i}`, `02411100${i}`, "FNW-AMA01");
    // Change referrerId to testReferrerId for isolation
    if (r) r.referrerId = testReferrerId;
    const res = await qualifyReferralOnOrderPayment(refId);
    assert(res.qualified === true, `Referee ${i} of 5 qualified`);
    assert(res.freeBottleAwarded === false, `Referral ${i}/5 does not award free bottle yet`);
  }

  // 5th Referral qualifies -> triggers +1 Free Bottle award!
  const ref5Id = `usr_batch_referee_${Date.now()}_5`;
  const r5 = await recordReferralSignup(ref5Id, "Friend 5", "024111005", "FNW-AMA01");
  if (r5) r5.referrerId = testReferrerId;
  const res5 = await qualifyReferralOnOrderPayment(ref5Id);

  assert(res5.qualified === true, "5th referee qualified");
  assert(res5.freeBottleAwarded === true, "5th qualified referral automatically awards +1 Free Bottle Credit");
  assert(res5.newBalance === 1, "Referrer free bottle balance increments to 1");

  // Verify profile balance
  const testProf = await getCustomerProfile(testReferrerId);
  assert(testProf.freeBottleBalance === 1, "Profile free bottle balance updated in storage");

  // ---------------------------------------------------------
  // 4. Free Bottle Reward Redemption in Checkout
  // ---------------------------------------------------------
  console.log("\n--- 4. Free Bottle Reward Redemption in Checkout ---");
  // Customer with 1 free bottle buys 2 refills (GH₵ 50.00) with empty exchange
  // Discount of GH₵ 25.00 applied for 1 free bottle
  const pricingWithReward = await calculateOrderPricing(
    [{ productId: "prod_001", quantity: 2 }],
    true, // has bottle exchange
    true, // redeem free refill
    1     // available balance
  );

  assert(pricingWithReward.subtotal === 50.0, "Subtotal is GH₵ 50.00 for 2 refills");
  assert(pricingWithReward.discountAmount === 25.0, "Discount of GH₵ 25.00 applied for free bottle reward");
  assert(pricingWithReward.totalAmount === 35.0, "Total is GH₵ 35.00 (GH₵ 50 - GH₵ 25 discount + GH₵ 10 delivery)");

  // Redeem free bottle via store
  const redeemRes = await redeemCustomerFreeBottle(testReferrerId);
  assert(redeemRes.success === true, "Free bottle credit successfully redeemed");
  assert(redeemRes.remainingBalance === 0, "Remaining balance decrements to 0");

  // Attempt to redeem when balance is 0 fails
  const emptyRedeem = await redeemCustomerFreeBottle(testReferrerId);
  assert(emptyRedeem.success === false, "Cannot redeem free bottle when balance is 0");

  // ---------------------------------------------------------
  // 5. Customer Referral Stats Dashboard & Progress Gauge
  // ---------------------------------------------------------
  console.log("\n--- 5. Customer Referral Stats & Progress Gauge ---");
  const custStats = await getCustomerReferralStats("usr_customer_001");
  assert(custStats.referralCode === "FNW-AMA01", "Stats return correct referral code");
  assert(custStats.referralLink.includes("ref=FNW-AMA01"), "Shareable link contains referral code");
  assert(custStats.totalInvited >= 5, "Total invited reflects seeded referrals");
  assert(custStats.qualifiedCount >= 4, "Qualified count reflects paid referees");
  assert(custStats.progressTowardsNext >= 0 && custStats.progressTowardsNext <= 4, "Progress towards next is between 0 and 4");
  assert(custStats.progressPercent >= 0 && custStats.progressPercent <= 100, "Progress percentage is within 0-100%");
  assert(Array.isArray(custStats.referees), "Referees list returned as array");
  assert(custStats.referees.length > 0, "Referees array is populated");

  // ---------------------------------------------------------
  // 6. Agent Portal & Direct Customer Onboarding
  // ---------------------------------------------------------
  console.log("\n--- 6. Agent Portal & Direct Customer Onboarding ---");
  const agentStats = await getAgentStats("usr_agent_001");
  assert(agentStats.agentCode === "FNW-AGENT-KOFI", "Agent code is FNW-AGENT-KOFI");
  assert(agentStats.totalOnboarded >= 28, "Agent onboarded count matches expectation");
  assert(agentStats.totalCommissionGHS >= 725.0, "Commission calculated at GH₵ 5.00 per referee refill");
  assert(agentStats.referees.length > 0, "Agent referee ledger populated");

  // Agent onboards new customer on ground
  const groundCustEmail = `ground_cust_${Date.now()}@gmail.com`;
  const onboardRes = await agentOnboardCustomer("usr_agent_001", {
    name: "Kwame Asare",
    email: groundCustEmail,
    phone: `0245${Math.floor(100000 + Math.random() * 900000)}`,
    deliveryArea: "Spintex Road, Batsonaa",
  });

  assert(onboardRes.success === true, "Agent direct onboarding creates customer account");
  assert(onboardRes.customer !== undefined, "Onboarded customer record returned");

  // ---------------------------------------------------------
  // 7. Summary
  // ---------------------------------------------------------
  console.log("\n====================================================================");
  console.log(`   MODULE 10 SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED     `);
  console.log("====================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
