// test-e2e.mjs - Comprehensive E2E Security, RBAC & API Test Suite

let passed = 0;
let failed = 0;

function assertTest(name, condition, details = "") {
  if (condition) {
    console.log(`\x1b[32m[PASS]\x1b[0m ${name}`);
    passed++;
  } else {
    console.error(`\x1b[31m[FAIL]\x1b[0m ${name} ${details ? `(${details})` : ""}`);
    failed++;
  }
}

async function run() {
  console.log("\x1b[36m============================================\x1b[0m");
  console.log("\x1b[36m   E2E SECURITY, RBAC & ACTION TEST SUITE   \x1b[0m");
  console.log("\x1b[36m============================================\x1b[0m");

  const BASE_URL = "http://localhost:3000";

  // 1. Check Unauthenticated Access to /admin -> Must redirect to /login
  try {
    const res = await fetch(`${BASE_URL}/admin`, { redirect: "manual" });
    const location = res.headers.get("location") || "";
    const status = res.status;
    assertTest(
      "Unauthenticated /admin redirects with 307/302",
      status === 307 || status === 302,
      `Status was ${status}`
    );
    assertTest(
      "Redirect target points to /login",
      location.includes("/login"),
      `Location: ${location}`
    );

    // 2. Anti-Cache Headers on Protected Route
    const cacheControl = res.headers.get("cache-control") || "";
    const pragma = res.headers.get("pragma") || "";
    assertTest(
      "Cache-Control contains 'no-store'",
      cacheControl.includes("no-store"),
      `Cache-Control: ${cacheControl}`
    );
    assertTest(
      "Pragma header set to 'no-cache'",
      pragma.includes("no-cache"),
      `Pragma: ${pragma}`
    );
  } catch (err) {
    assertTest("Unauthenticated /admin protection", false, err.message);
  }

  // 3. Check /manager, /driver, /agent, /customer without auth
  for (const path of ["/manager", "/driver", "/agent", "/customer"]) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, { redirect: "manual" });
      const location = res.headers.get("location") || "";
      assertTest(
        `Unauthenticated ${path} redirected to /login`,
        (res.status === 307 || res.status === 302) && location.includes("/login"),
        `Status: ${res.status}, Location: ${location}`
      );
    } catch (err) {
      assertTest(`Unauthenticated ${path} protection`, false, err.message);
    }
  }

  // 4. Registration: Valid customer registration
  const rand = Math.floor(100000 + Math.random() * 900000);
  const testEmail = `cust.test.${rand}@fnetwater.com`;
  const testPhone = `024${rand.toString().slice(0, 7)}`;

  try {
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Automated Test Customer",
        email: testEmail,
        phone: testPhone,
        password: "securePassword123",
      }),
    });
    const regData = await regRes.json();
    assertTest(
      "Valid customer registration succeeds (HTTP 200)",
      regRes.status === 200 && regData.success === true,
      JSON.stringify(regData)
    );
  } catch (err) {
    assertTest("Valid customer registration", false, err.message);
  }

  // 5. Registration: Duplicate email rejected
  try {
    const dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Duplicate Customer",
        email: testEmail,
        phone: `025${rand.toString().slice(0, 7)}`,
        password: "securePassword123",
      }),
    });
    assertTest(
      "Duplicate email registration rejected (HTTP 400/409)",
      dupRes.status === 400 || dupRes.status === 409,
      `Status was ${dupRes.status}`
    );
  } catch (err) {
    assertTest("Duplicate email rejection", false, err.message);
  }

  // 6. Registration: Duplicate phone rejected
  try {
    const dupPhoneRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Duplicate Phone",
        email: `unique.${rand}@fnetwater.com`,
        phone: testPhone,
        password: "securePassword123",
      }),
    });
    assertTest(
      "Duplicate phone registration rejected (HTTP 400/409)",
      dupPhoneRes.status === 400 || dupPhoneRes.status === 409,
      `Status was ${dupPhoneRes.status}`
    );
  } catch (err) {
    assertTest("Duplicate phone rejection", false, err.message);
  }

  // 7. Registration: Weak password rejected
  try {
    const weakRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Weak Pass",
        email: `weak.${rand}@fnetwater.com`,
        phone: `026${rand.toString().slice(0, 7)}`,
        password: "123",
      }),
    });
    assertTest(
      "Password < 6 chars rejected (HTTP 400)",
      weakRes.status === 400,
      `Status was ${weakRes.status}`
    );
  } catch (err) {
    assertTest("Weak password rejection", false, err.message);
  }

  // 8. Staff Management: Verify Customers are excluded from Staff API
  try {
    const staffRes = await fetch(`${BASE_URL}/api/admin/users`);
    const staffData = await staffRes.json();
    assertTest("Staff API returns users", staffData.success && staffData.users.length > 0);
    const hasCustomer = staffData.users.some((u) => u.role === "CUSTOMER");
    assertTest("Zero customers present in staff directory", !hasCustomer);
  } catch (err) {
    assertTest("Staff list query", false, err.message);
  }

  // 9. Staff Management: Role validation (CUSTOMER role blocked in staff creation)
  try {
    const custInStaffRes = await fetch(`${BASE_URL}/api/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Illegal Customer In Staff",
        email: `illegal.${rand}@fnetwater.com`,
        phone: `027${rand.toString().slice(0, 7)}`,
        password: "password123",
        role: "CUSTOMER",
      }),
    });
    assertTest(
      "Attempting to create CUSTOMER in staff API is rejected (HTTP 400)",
      custInStaffRes.status === 400
    );
  } catch (err) {
    assertTest("Staff role validation", false, err.message);
  }

  // 10. Staff Management: Duplicate email rejected with 409
  try {
    const dupStaffRes = await fetch(`${BASE_URL}/api/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Duplicate Admin",
        email: "admin@fnetwater.com",
        phone: `028${rand.toString().slice(0, 7)}`,
        password: "password123",
        role: "DRIVER",
      }),
    });
    assertTest(
      "Duplicate staff email rejected (HTTP 409)",
      dupStaffRes.status === 409,
      `Status was ${dupStaffRes.status}`
    );
  } catch (err) {
    assertTest("Duplicate staff email", false, err.message);
  }

  // 11. Staff Management: Protecting Super Admin from Deactivation (403)
  try {
    const deactRes = await fetch(`${BASE_URL}/api/admin/users`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "status",
        userId: "usr_admin_001",
        status: "INACTIVE",
      }),
    });
    assertTest(
      "Primary Administrator deactivation is strictly blocked (HTTP 403)",
      deactRes.status === 403,
      `Status was ${deactRes.status}`
    );
  } catch (err) {
    assertTest("Admin deactivation protection", false, err.message);
  }

  // 12. Staff Management: Protecting Super Admin from Deletion (403)
  try {
    const delAdminRes = await fetch(`${BASE_URL}/api/admin/users?userId=usr_admin_001`, {
      method: "DELETE",
    });
    assertTest(
      "Primary Administrator deletion is strictly blocked (HTTP 403)",
      delAdminRes.status === 403,
      `Status was ${delAdminRes.status}`
    );
  } catch (err) {
    assertTest("Admin deletion protection", false, err.message);
  }

  // 13. Staff Action Lifecycle (Add -> Edit -> Password -> Toggle -> Delete)
  let testStaffId = null;
  const staffEmail = `test.driver.${rand}@fnetwater.com`;
  const staffPhone = `023${rand.toString().slice(0, 7)}`;

  try {
    // Add
    const createRes = await fetch(`${BASE_URL}/api/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Lifecycle Driver",
        email: staffEmail,
        phone: staffPhone,
        password: "initialPassword123",
        role: "DRIVER",
      }),
    });
    const createData = await createRes.json();
    assertTest("Staff creation succeeds", createRes.status === 200 && createData.success);
    testStaffId = createData.user?.id;

    // Edit
    const editRes = await fetch(`${BASE_URL}/api/admin/users`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "edit",
        userId: testStaffId,
        name: "Lifecycle Driver Renamed",
        role: "DRIVER",
      }),
    });
    const editData = await editRes.json();
    assertTest(
      "Staff edit succeeds",
      editRes.status === 200 && editData.user?.name === "Lifecycle Driver Renamed"
    );

    // Password
    const passRes = await fetch(`${BASE_URL}/api/admin/users`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "password",
        userId: testStaffId,
        password: "newPassword999",
      }),
    });
    const passData = await passRes.json();
    assertTest("Staff password reset succeeds", passRes.status === 200 && passData.success);

    // Toggle Status
    const toggleRes = await fetch(`${BASE_URL}/api/admin/users`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "status",
        userId: testStaffId,
        status: "INACTIVE",
      }),
    });
    const toggleData = await toggleRes.json();
    assertTest(
      "Staff status toggle succeeds",
      toggleRes.status === 200 && toggleData.user?.status === "INACTIVE"
    );

    // Delete
    const delRes = await fetch(`${BASE_URL}/api/admin/users?userId=${testStaffId}`, {
      method: "DELETE",
    });
    const delData = await delRes.json();
    assertTest("Staff deletion succeeds", delRes.status === 200 && delData.success);
  } catch (err) {
    assertTest("Staff lifecycle execution", false, err.message);
  }

  // 14. Customer Management: Verify Dedicated Customer API
  let testCustId = null;
  const custEmail = `cust.life.${rand}@example.com`;
  const custPhone = `020${rand.toString().slice(0, 7)}`;

  try {
    // Add customer
    const createCustRes = await fetch(`${BASE_URL}/api/admin/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Lifecycle Customer",
        email: custEmail,
        phone: custPhone,
        deliveryArea: "Airport Residential",
        dispenserPlan: "Smart Rent-to-Own",
      }),
    });
    const createCustData = await createCustRes.json();
    assertTest(
      "Customer creation generates CUST code",
      createCustRes.status === 200 && createCustData.customer?.customerCode?.startsWith("CUST-")
    );
    testCustId = createCustData.customer?.id;

    // Duplicate customer email rejected
    const dupCustRes = await fetch(`${BASE_URL}/api/admin/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Duplicate Customer",
        email: custEmail,
        phone: `029${rand.toString().slice(0, 7)}`,
      }),
    });
    assertTest(
      "Duplicate customer email rejected with 409",
      dupCustRes.status === 409
    );

    // Toggle customer status
    const toggleCustRes = await fetch(`${BASE_URL}/api/admin/customers`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: testCustId,
        status: "INACTIVE",
      }),
    });
    assertTest("Customer status toggle succeeds", toggleCustRes.status === 200);

    // Delete customer
    const delCustRes = await fetch(`${BASE_URL}/api/admin/customers?customerId=${testCustId}`, {
      method: "DELETE",
    });
    assertTest("Customer deletion succeeds", delCustRes.status === 200);
  } catch (err) {
    assertTest("Customer lifecycle execution", false, err.message);
  }

  // 15. Profile Section Security & Endpoint Verification
  try {
    const unauthProfileRes = await fetch(`${BASE_URL}/profile`, { redirect: "manual" });
    const profileLocation = unauthProfileRes.headers.get("location") || "";
    assertTest(
      "Unauthenticated /profile redirects to /login",
      (unauthProfileRes.status === 307 || unauthProfileRes.status === 302) && profileLocation.includes("/login")
    );

    const profileCacheControl = unauthProfileRes.headers.get("cache-control") || "";
    assertTest(
      "Profile route contains 'no-store' anti-cache headers",
      profileCacheControl.includes("no-store")
    );

    const unauthApiRes = await fetch(`${BASE_URL}/api/user/profile`);
    assertTest(
      "Unauthenticated /api/user/profile returns 401 Unauthorized",
      unauthApiRes.status === 401
    );
  } catch (err) {
    assertTest("Profile security checks", false, err.message);
  }

  // 16. Module 4: Customer Address Book & Portal Security
  try {
    const unauthAddrRes = await fetch(`${BASE_URL}/customer/addresses`, { redirect: "manual" });
    const addrLocation = unauthAddrRes.headers.get("location") || "";
    assertTest(
      "Unauthenticated /customer/addresses redirects to /login",
      (unauthAddrRes.status === 307 || unauthAddrRes.status === 302) && addrLocation.includes("/login")
    );

    const addrCacheControl = unauthAddrRes.headers.get("cache-control") || "";
    assertTest(
      "Address Book route contains 'no-store' anti-cache headers",
      addrCacheControl.includes("no-store")
    );

    const unauthAddrApiRes = await fetch(`${BASE_URL}/api/customer/addresses`);
    assertTest(
      "Unauthenticated /api/customer/addresses returns 401 Unauthorized",
      unauthAddrApiRes.status === 401
    );

    const unauthCustProfApiRes = await fetch(`${BASE_URL}/api/customer/profile`);
    assertTest(
      "Unauthenticated /api/customer/profile returns 401 Unauthorized",
      unauthCustProfApiRes.status === 401
    );
  } catch (err) {
    assertTest("Customer address book security checks", false, err.message);
  }

  // 17. Landing Page Cleanliness & Anti-Clutter Verification
  try {
    const landingRes = await fetch(`${BASE_URL}/`);
    const landingHtml = await landingRes.text();
    assertTest(
      "Landing page returns HTTP 200",
      landingRes.status === 200
    );
    assertTest(
      "Landing page contains concise headline",
      landingHtml.includes("Water delivery")
    );
    assertTest(
      "Landing page does NOT contain 'Ghana Dispatch'",
      !landingHtml.includes("Ghana Dispatch")
    );
    assertTest(
      "Landing page contains single Sign In button action",
      landingHtml.includes('href="/login"')
    );
  } catch (err) {
    assertTest("Landing page checks", false, err.message);
  }

  // 18. Module 5: Water Products & Ordering Workflow Security
  try {
    const prodRes = await fetch(`${BASE_URL}/api/products`);
    const prodData = await prodRes.json();
    assertTest(
      "Products catalog API returns HTTP 200",
      prodRes.status === 200 && prodData.products.length >= 3
    );

    const unauthOrderRoute = await fetch(`${BASE_URL}/customer/order`, { redirect: "manual" });
    const orderLoc = unauthOrderRoute.headers.get("location") || "";
    assertTest(
      "Unauthenticated /customer/order redirects to /login",
      (unauthOrderRoute.status === 307 || unauthOrderRoute.status === 302) && orderLoc.includes("/login")
    );

    const unauthOrdersListRoute = await fetch(`${BASE_URL}/customer/orders`, { redirect: "manual" });
    const ordersListLoc = unauthOrdersListRoute.headers.get("location") || "";
    assertTest(
      "Unauthenticated /customer/orders redirects to /login",
      (unauthOrdersListRoute.status === 307 || unauthOrdersListRoute.status === 302) && ordersListLoc.includes("/login")
    );

    const unauthOrdersApi = await fetch(`${BASE_URL}/api/orders`);
    assertTest(
      "Unauthenticated /api/orders returns 401 Unauthorized",
      unauthOrdersApi.status === 401
    );
  } catch (err) {
    assertTest("Ordering workflow security checks", false, err.message);
  }

  // 19. Module 6: Delivery Dispatch & Driver Portal Security
  try {
    const unauthMgrDeliv = await fetch(`${BASE_URL}/manager/deliveries`, { redirect: "manual" });
    const mgrLoc = unauthMgrDeliv.headers.get("location") || "";
    assertTest(
      "Unauthenticated /manager/deliveries redirects to /login",
      (unauthMgrDeliv.status === 307 || unauthMgrDeliv.status === 302) && mgrLoc.includes("/login")
    );

    const unauthDriver = await fetch(`${BASE_URL}/driver`, { redirect: "manual" });
    const drvLoc = unauthDriver.headers.get("location") || "";
    assertTest(
      "Unauthenticated /driver redirects to /login",
      (unauthDriver.status === 307 || unauthDriver.status === 302) && drvLoc.includes("/login")
    );

    const unauthDispatchOrders = await fetch(`${BASE_URL}/api/dispatch/orders`);
    assertTest(
      "Unauthenticated /api/dispatch/orders returns 401 Unauthorized",
      unauthDispatchOrders.status === 401
    );

    const unauthDispatchDrivers = await fetch(`${BASE_URL}/api/dispatch/drivers`);
    assertTest(
      "Unauthenticated /api/dispatch/drivers returns 401 Unauthorized",
      unauthDispatchDrivers.status === 401
    );

    const unauthDispatchAssign = await fetch(`${BASE_URL}/api/dispatch/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assertTest(
      "Unauthenticated /api/dispatch/assign returns 401 Unauthorized",
      unauthDispatchAssign.status === 401
    );

    const unauthDriverStops = await fetch(`${BASE_URL}/api/driver/stops`);
    assertTest(
      "Unauthenticated /api/driver/stops returns 401 Unauthorized",
      unauthDriverStops.status === 401
    );

    const unauthDriverStart = await fetch(`${BASE_URL}/api/driver/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assertTest(
      "Unauthenticated /api/driver/start returns 401 Unauthorized",
      unauthDriverStart.status === 401
    );

    const unauthDriverExchange = await fetch(`${BASE_URL}/api/driver/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assertTest(
      "Unauthenticated /api/driver/exchange returns 401 Unauthorized",
      unauthDriverExchange.status === 401
    );
  } catch (err) {
    assertTest("Dispatch and Driver portal security checks", false, err.message);
  }

  console.log("\x1b[36m============================================\x1b[0m");
  console.log(
    `\x1b[1mRESULTS: \x1b[32m${passed} Passed\x1b[0m, \x1b[31m${failed} Failed\x1b[0m`
  );
  console.log("\x1b[36m============================================\x1b[0m");

  if (failed > 0) {
    process.exit(1);
  }
}

run();
