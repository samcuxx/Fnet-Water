// test-module4.ts - Unit & Integration Test Suite for Module 4 (Customer & Ghana Address Book)

import {
  isValidGhanaDigitalAddress,
  formatGhanaDigitalAddress,
  getCustomerAddresses,
  createCustomerAddress,
  updateCustomerAddress,
  setDefaultCustomerAddress,
  deleteCustomerAddress,
  getCustomerProfile,
  updateCustomerProfileData,
} from "./src/lib/customer-store";

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
  console.log("\x1b[36m   MODULE 4: ADDRESS BOOK & CUSTOMER PROFILE TESTS   \x1b[0m");
  console.log("\x1b[36m=====================================================\x1b[0m");

  // 1. Ghana Digital Address Validation Tests
  assert("Valid Accra address (GA-183-9021)", isValidGhanaDigitalAddress("GA-183-9021"));
  assert("Valid Kumasi address (AK-039-1102)", isValidGhanaDigitalAddress("AK-039-1102"));
  assert("Valid unhyphenated lowercase address (ga1839021)", isValidGhanaDigitalAddress("ga1839021"));
  assert("Valid Western region address (WS-291-0021)", isValidGhanaDigitalAddress("WS-291-0021"));

  assert("Invalid address rejected (12345)", !isValidGhanaDigitalAddress("12345"));
  assert("Invalid address rejected (INVALID-CODE)", !isValidGhanaDigitalAddress("INVALID-CODE"));
  assert("Ghana Card not accepted as digital address", !isValidGhanaDigitalAddress("GHA-719204910-3"));

  // 2. Ghana Digital Address Formatting
  assert(
    "Formats lowercase unhyphenated to standard",
    formatGhanaDigitalAddress("ga1839021") === "GA-183-9021"
  );
  assert(
    "Preserves already formatted address",
    formatGhanaDigitalAddress("AK-039-1102") === "AK-039-1102"
  );

  // 3. Address Book Lifecycle
  const testUserId = `usr_test_cust_${Date.now()}`;

  // Create First Address (Default: true)
  const addr1 = await createCustomerAddress(testUserId, {
    category: "HOME",
    areaName: "House 24, Boundary Road, East Legon",
    digitalAddress: "GA-492-1029",
    deliveryInstructions: "Call gate phone on arrival",
    isDefault: true,
  });
  assert("First address created successfully", Boolean(addr1.id && addr1.areaName.includes("East Legon")));
  assert("First address marked as default", addr1.isDefault === true);

  // Create Second Address (Default: false)
  const addr2 = await createCustomerAddress(testUserId, {
    category: "OFFICE",
    areaName: "Floor 2, Stanbic Heights, Airport City",
    digitalAddress: "GA-102-3341",
    deliveryInstructions: "Leave with front desk",
    isDefault: false,
  });
  assert("Second address created successfully", Boolean(addr2.id && addr2.category === "OFFICE"));
  assert("Second address is not default", addr2.isDefault === false);

  // Retrieve addresses
  let list = await getCustomerAddresses(testUserId);
  assert("Address book lists 2 addresses", list.length === 2);

  // Set second address as default -> first address must automatically lose default
  const defaultUpdated = await setDefaultCustomerAddress(addr2.id, testUserId);
  assert("Setting default address succeeds", defaultUpdated === true);

  list = await getCustomerAddresses(testUserId);
  const updatedAddr1 = list.find((a) => a.id === addr1.id);
  const updatedAddr2 = list.find((a) => a.id === addr2.id);
  assert("Second address is now default", updatedAddr2?.isDefault === true);
  assert("First address is no longer default (Exclusivity check)", updatedAddr1?.isDefault === false);

  // Edit address
  const edited = await updateCustomerAddress(addr1.id, testUserId, {
    areaName: "House 24B, Updated Boundary Road, East Legon",
    deliveryInstructions: "Ring top bell",
  });
  assert("Address update succeeds", Boolean(edited?.areaName.includes("Updated Boundary Road")));
  assert("Updated instructions saved", edited?.deliveryInstructions === "Ring top bell");

  // Delete address
  const deleted = await deleteCustomerAddress(addr2.id, testUserId);
  assert("Address deletion succeeds", deleted === true);

  list = await getCustomerAddresses(testUserId);
  assert("Address book now has 1 address remaining", list.length === 1);
  assert("Remaining address is addr1", list[0].id === addr1.id);

  // 4. Customer Profile & 5:1 Referral Rules
  const profile = await getCustomerProfile(testUserId);
  assert("Customer profile generated", Boolean(profile.customerCode.startsWith("CUST-")));
  assert("Customer has referral code", Boolean(profile.referralCode.startsWith("FNW-")));

  // Update Ghana Card
  const updatedProfile = await updateCustomerProfileData(testUserId, {
    ghanaCardNumber: "GHA-719204910-3",
  });
  assert("Ghana Card number saved", updatedProfile.ghanaCardNumber === "GHA-719204910-3");

  console.log("\x1b[36m=====================================================\x1b[0m");
  console.log(
    `\x1b[1mMODULE 4 RESULTS: \x1b[32m${passed} Passed\x1b[0m, \x1b[31m${failed} Failed\x1b[0m`
  );
  console.log("\x1b[36m=====================================================\x1b[0m");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
