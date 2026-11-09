# F NET WATER HUB — MASTER DEVELOPMENT PLAN (FULL-STACK NEXT.JS, POSTGRESQL & MNOTIFY)

**Platform:** Web Application (Phase 1)  
**Tech Stack:** Next.js (App Router, React 19, TypeScript)  
**Database & ORM:** PostgreSQL 16 (Local Docker + Coolify Production) + Prisma ORM  
**Payment Gateway:** Paystack (Ghana Mobile Money: MTN, Telecel, AirtelTigo, Cards)  
**SMS & OTP Gateway:** mNotify Ghana (Sender ID: `Fnet`, Project: `Fnet`)  
**DevOps & Deployment:** Docker Compose (Offline local testing -> Coolify production)  
**UI Foundation:** `ui_template` (TailAdmin React v2.3.0 adapted for Next.js, Tailwind CSS v4)  
**Brand Identity:** Primary Blue `#0057B8`, Light Blue `#00AEEF`, White `#FFFFFF`  
**Currency:** Ghanaian Cedis (GH₵ / GHS)  

---

## 1. ARCHITECTURAL OVERVIEW & FULL-STACK TOPOLOGY

```mermaid
flowchart TD
    subgraph Client ["Frontend (Next.js App Router & TailAdmin)"]
        AdminUI["Admin Dashboard"]
        ManagerUI["Manager Portal"]
        DriverUI["Driver Mobile View"]
        AgentUI["Agent Portal"]
        CustomerUI["Customer Portal"]
    end

    subgraph Server ["Next.js Server (API Routes, Server Actions, Middleware)"]
        AuthMiddleware["Next.js Auth & Role Middleware"]
        APIOrders["/api/orders"]
        APIDeliveries["/api/deliveries"]
        APIInventory["/api/inventory"]
        APIDispensers["/api/dispensers"]
        PaystackWebhook["/api/webhooks/paystack (HMAC Verified)"]
        SMSDispatcher["/src/lib/mnotify.ts (SMS & OTP)"]
        APIAnalytics["/api/analytics"]
    end

    subgraph LocalDocker ["Local Docker Environment"]
        PostgresContainer[("PostgreSQL 16 Alpine")]
        Volume[("Persistent postgres_data Volume")]
        PostgresContainer --- Volume
    end

    subgraph External ["External Ghana Gateways"]
        Paystack["Paystack Gateway (GHS MoMo & Cards)"]
        mNotify["mNotify Ghana SMS API (Sender: Fnet)"]
        Coolify["Coolify Production (Future Target)"]
    end

    Client -->|Protected Requests| AuthMiddleware
    AuthMiddleware --> Server
    Server -->|Prisma ORM (port 5432)| PostgresContainer
    CustomerUI -->|Paystack Popup / Checkout| Paystack
    Paystack -->|charge.success Webhook| PaystackWebhook
    PaystackWebhook -->|Fulfill Order & Auto-Credit Referral| PostgresContainer
    Server -->|Dispatches OTPs & Delivery SMS| mNotify
    mNotify -->|Sends SMS to Customers & Drivers| Client
```

---

## MODULE 1: PROJECT SETUP, LOCAL DOCKER & DATABASE INFRASTRUCTURE

### 1. Objectives & Scope
- Initialize the production **Next.js (App Router)** fullstack project with TypeScript, React 19, and Tailwind CSS v4.
- Configure Tailwind v4 `@theme` with official F Net Water Hub brand colors:
  - Primary Blue: `#0057B8`
  - Light Blue: `#00AEEF`
  - Pure White: `#FFFFFF`
- Configure Next.js path alias (`@/*` pointing to `src/*`).
- Configure **Local Docker Compose**:
  - `docker-compose.yml` defining `db` (PostgreSQL 16 Alpine) with persistent volume `postgres_data` mapping port `5432:5432`.
  - Configured for local offline development.
- Configure **Prisma ORM & PostgreSQL Models**:
  - Define schema (`prisma/schema.prisma`) with models: `User`, `CustomerProfile`, `DeliveryAddress`, `Product`, `Order`, `OrderItem`, `Delivery`, `BottleExchange`, `BottleInventory`, `Dispenser`, `DispenserPlan`, `DispenserPayment`, `Referral`, `PaymentTransaction`, `Notification`, `AuditLog`, `OtpVerification`.
  - Enums: `UserRole` (`ADMIN`, `MANAGER`, `DRIVER`, `AGENT`, `CUSTOMER`), `OrderStatus`, `DeliveryStatus`, `PaymentStatus`, `DispenserStatus`, `AddressType`.
- Create comprehensive database seed script (`prisma/seed.ts`) populating realistic Ghanaian water business data:
  - Default users for all 5 roles (Admin, Manager, Driver, Agent, Customer)
  - Water products with GH₵ pricing
  - Pre-configured Accra delivery addresses with Ghana Digital Addresses (`GA-183-9021`, etc.)
  - Sample orders, deliveries, dispensers, and initial stock balances
- Configure `.env.local` with development credentials:
  - Paystack: `sk_test_e3dc4308aa829bb13669f66be490fadc1d120778` / `pk_test_eb0b32c0bf50b5e00420d9d175e41a082e601be4`
  - mNotify: `MNOTIFY_API_KEY=EpyJqPefIbrTOBWOfr5ifgQXn`, Sender ID: `Fnet`, Project: `Fnet`
  - Database URL pointing to `localhost:5432`

### 2. UI Template Assets & Configuration
- Port Tailwind v4 configuration from `ui_template/src/index.css` to `src/app/globals.css`.
- Configure `Inter` font (professional typography) and standard typography rules.
- Set up root `src/app/layout.tsx` with metadata, favicon, and theme providers.

### 3. Technical Implementation
- Next.js config (`next.config.ts`) with `output: 'standalone'`.
- Prisma client singleton (`src/lib/prisma.ts`).
- mNotify helper library (`src/lib/mnotify.ts`) with OTP generation and message dispatch.
- Paystack helper library (`src/lib/paystack.ts`).

### 4. Self-Testing Protocol (AI Verification)
- Run `npm.cmd run build` — confirm clean Next.js build.
- Run `npx prisma db push` against local PostgreSQL.
- Run `npx prisma db seed` — verify seed data executes without errors.
- Test `src/lib/mnotify.ts` — verify connection and mock/live dispatch.

### 5. Reviewer Acceptance Testing (User UAT)
1. Ensure Docker Desktop is running and start the database: `docker compose up -d db`.
2. Run `npm.cmd run dev` and open `http://localhost:3000`.
3. Verify page loads with F Net Water Hub brand styling and metadata.
4. Run `npx prisma studio` to inspect the pre-seeded users and products.

---

## MODULE 2: DESIGN SYSTEM & CORE REUSABLE COMPONENT LIBRARY

### 1. Objectives & Scope
- Adapt all essential UI components from `ui_template` for Next.js App Router:
  - Buttons (`Button.tsx`), Badges (`Badge.tsx`), Content Cards (`Card.tsx`).
  - Form inputs (`Input.tsx`, `Label.tsx`, `Select.tsx`, `MultiSelect.tsx`, `Switch.tsx`).
  - Date Picker (`DatePicker.tsx`) wrapped with dynamic client-side loading to prevent SSR hydration mismatches.
  - Modals (`Modal.tsx`) with accessible backdrop and keyboard handlers.
  - Responsive Data Tables (`Table.tsx`, `Pagination.tsx`).
  - Progress Bars (`Progressbar.tsx`) for dispenser and referral progress.
  - Alert Banners (`Alert.tsx`) and Toast notifications.
  - Complete SVG icon set ported to `src/icons/index.tsx`.
- Master Application Shell:
  - `AppLayout.tsx` with responsive drawer sidebar (`AppSidebar.tsx`) and top header (`AppHeader.tsx`).
  - Role-aware dynamic navigation menus (custom tailored for Admin, Manager, Driver, Agent, Customer).
  - User profile menu (`UserDropdown.tsx`) and Notification drawer (`NotificationDropdown.tsx`).
  - Dark / Light theme toggle with `next-themes`.
- Create Component Showcase route (`/ui-showcase`) demonstrating all reusable UI elements in light and dark modes.

### 2. UI Template Assets Used
- `ui_template/src/components/ui/*`
- `ui_template/src/components/form/*`
- `ui_template/src/layout/*`
- `ui_template/src/icons/*`

### 3. Self-Testing Protocol (AI Verification)
- Run `npm.cmd run build` — verify zero hydration errors or compile failures.
- Verify modal transitions, mobile hamburger drawer, and theme toggling.

### 4. Reviewer Acceptance Testing (User UAT)
1. Open `/ui-showcase`.
2. Test Buttons, Badges, Modals, Form inputs, and Progress bars.
3. Toggle between Dark and Light mode.
4. Resize browser to mobile width (< 640px) and test responsive drawer.

---

## MODULE 3: AUTHENTICATION, MNOTIFY OTP & RBAC (5 ROLES)

### 1. Objectives & Scope
- Implement authentication using **NextAuth.js (Auth.js)** with Credentials Provider and PostgreSQL database adapter:
  - Sign In (`/login`): Email/phone & password authentication with instant demo role switcher buttons.
  - **mNotify OTP Login / Verification**: Option for customers and drivers to log in via 6-digit SMS OTP sent to their Ghanaian phone number.
  - Customer Registration (`/register`): Name, Ghanaian phone number (`024...`), email, password, and optional Referral Code with mNotify SMS confirmation.
  - Password Reset (`/reset-password`) with SMS OTP verification.
- Role-Based Access Control (RBAC):
  - Next.js Edge Middleware (`src/middleware.ts`) enforcing strict route guards for all 5 roles:
    - `/admin/*` -> `ADMIN` only
    - `/manager/*` -> `ADMIN`, `MANAGER`
    - `/driver/*` -> `DRIVER` only
    - `/agent/*` -> `AGENT` only
    - `/customer/*` -> `CUSTOMER` only
- Admin User Management (`/admin/users`):
  - Table of all system users with search, role filter, and status filter (`ACTIVE` / `INACTIVE`).
  - "Add User" modal to create staff accounts (Manager, Driver, Agent).
  - Actions: Deactivate / Reactivate account, Reset password.

### 2. UI Template Assets Used
- `AuthPageLayout.tsx`: Premium split-container with curved arch (`rounded-l-[240px]`), mobile bottom sheet overlay (`rounded-t-[40px]`), and rich monstera foliage clusters.
- `public/images/auth/auth-illustration.jpg`: Custom 3D claymorphism water logistics hero connecting glowing holographic badges (pure 19L water bottle, smart dispenser, rapid delivery van, growth analytics, phone).
- `login/page.tsx`, `register/page.tsx`, `reset-password/page.tsx`: Redesigned with soft `#F6F8FC` inputs, `#3B66FF` bold uppercase action buttons, password eye toggles, password/SMS login methods, and 5-box OTP verification standard.
- `BasicTables.tsx`, `Modal.tsx`, `Input.tsx`, `Select.tsx`, `Badge.tsx`, `Button.tsx`

### 3. Technical Implementation
- Password hashing with `bcryptjs`.
- `OtpVerification` model in PostgreSQL with 10-minute expiry and rate-limiting.
- Pre-seeded test accounts:
  - Admin: `admin@fnetwater.com` / `admin123`
  - Manager: `manager@fnetwater.com` / `manager123`
  - Driver: `driver@fnetwater.com` / `driver123`
  - Agent: `agent@fnetwater.com` / `agent123`
  - Customer: `customer@fnetwater.com` / `customer123`

### 4. Self-Testing Protocol (AI Verification)
- Test unauthorized route access: verify unauthenticated users are redirected to `/login`.
- Test role escalation: verify Customer cannot access `/admin/users` (403 Forbidden).
- Verify Admin can create a new staff account and toggle user active/inactive status in PostgreSQL.
- Test OTP dispatch via `mnotify.ts`: verify token generates, stores in DB, and validates successfully.

### 5. Reviewer Acceptance Testing (User UAT)
1. Visit `/login` and use the one-click demo login buttons to log in as each role.
2. Verify sidebar navigation updates dynamically to match the role.
3. Test OTP Login: enter your Ghanaian phone number, verify the SMS OTP is received (or logged in console for testing), and complete login.
4. As Admin, navigate to **User Management** (`/admin/users`), create a new Driver account, and verify it persists in PostgreSQL.

---

## MODULE 4: CUSTOMER PORTAL, PROFILES & GHANA ADDRESS MANAGEMENT

### 1. Objectives & Scope
- Customer Dashboard (`/customer/dashboard`):
  - Metric cards: Active Orders, Refillable Bottles Held, Dispenser Status, Free Bottle Reward Balance.
  - Quick action buttons: "Order Water", "Request Bottle Refill", "Apply for Dispenser", "Refer Friends".
  - Recent orders summary card with live status badges.
- Customer Profile & Address Book (`/customer/profile` & `/customer/addresses`):
  - Personal Information: Full Name, Phone (+233 format), Email, Ghana Card / Customer ID.
  - Multi-address management backed by PostgreSQL `DeliveryAddress` model:
    - Category: `HOME`, `OFFICE`, `SHOP`, `SCHOOL`, `WAREHOUSE`, `OTHER`
    - Street / Area Name (e.g. East Legon, Spintex, Osu, Adum)
    - Ghana Digital Address (e.g. `GA-183-9021`)
    - GPS Coordinates & Google Maps location link
    - Delivery Instructions (e.g. "Call upon arrival", "Leave with reception", "Back gate")
    - Default address toggle

### 2. UI Template Assets Used
- `EcommerceMetrics.tsx`, `UserProfiles.tsx`, `Modal.tsx`, `Input.tsx`, `Select.tsx`, `Badge.tsx`

### 3. Technical Implementation
- Server actions / API endpoints for address CRUD (`/api/customer/addresses`).
- Validation for Ghanaian phone numbers (`+233...`) and Ghana Digital Address format (`^[A-Z]{2}-\d{3,4}-\d{4}$`).

### 4. Self-Testing Protocol (AI Verification)
- Test adding, editing, and deleting delivery addresses in PostgreSQL.
- Test setting a new default address: verify previous default address flag is cleared.

### 5. Reviewer Acceptance Testing (User UAT)
1. Log in as Customer (`customer@fnetwater.com`).
2. Go to **Delivery Addresses** and click **Add New Address**.
3. Fill in details (Office, Airport Residential, `GA-019-3321`, "Leave at reception") and save.
4. Verify address appears in the address list with default badge.

---

## MODULE 5: WATER PRODUCTS & ORDERING WORKFLOW

### 1. Objectives & Scope
- Water Products Catalog (PRD Section 7 & 14):
  - 18.9L / 20L Refillable Water Bottle (Refill GH₵ 25.00 / Bottle Deposit GH₵ 80.00)
  - Take-Away Bottled Water Pack (GH₵ 35.00 / pack)
  - Bulk Water Commercial Tanker Supply (GH₵ 450.00 / 1000L)
- Customer Ordering Workflow (PRD Section 7.2):
  - Product selection grid with increment/decrement quantity counters.
  - Saved address selector or quick address entry.
  - Delivery date picker (Flatpickr) and delivery time slot (Morning 8am-12pm, Afternoon 12pm-4pm, Evening 4pm-7pm).
  - Delivery instructions notes.
  - Payment method selector: Paystack (MoMo / Card), Bank Transfer, Cash on Delivery.
  - "Redeem Free Bottle Reward" toggle (if eligible from Module 10).
  - Real-time price breakdown: Subtotal + Bottle Deposit + Delivery Fee - Rewards Discount = Total in GH₵.
  - Order submission -> creates `Order` and `OrderItem` records in PostgreSQL.
  - Dispatches SMS confirmation via mNotify ("Your order #FNW-... has been received").
- Order Confirmation & Live Tracking Screen:
  - Success confirmation screen with generated Order ID (e.g. `FNW-2026-1042`).
  - Interactive delivery tracking stepper: `Pending` -> `Assigned` -> `Out for Delivery` -> `Delivered`.

### 2. UI Template Assets Used
- `ProductList.tsx`, `date-picker.tsx`, `Modal.tsx`, `Button.tsx`, `Badge.tsx`, `Success.tsx`

### 3. Technical Implementation
- API route `/api/orders` managing transaction creation, stock validation, and deposit logic.
- Paystack checkout initiation (Module 9 integration) for online orders.
- mNotify order confirmation SMS trigger.

### 4. Self-Testing Protocol (AI Verification)
- Create test orders with single and multiple items: verify subtotal, deposit, and total calculations in GH₵.
- Verify order records save in PostgreSQL and link correctly to customer and address models.

### 5. Reviewer Acceptance Testing (User UAT)
1. As Customer, navigate to **Order Water** (`/customer/order`).
2. Select 2 Refillable Bottles and 1 Take-Away Pack.
3. Select your saved delivery address and pick tomorrow morning's slot.
4. Submit order: verify the confirmation screen displays order details and Order ID.
5. Check **My Orders**: verify the order appears with status "Pending".

---

## MODULE 6: DELIVERY DISPATCH & DRIVER PORTAL

### 1. Objectives & Scope
- Centralized Delivery Management (`/admin/deliveries` & `/manager/deliveries`):
  - Incoming orders dispatch board.
  - One-click "Assign Driver" modal with driver workload preview.
  - Status filters: `Pending`, `Assigned`, `Out for Delivery`, `Delivered`, `Failed`, `Cancelled`.
  - Dispatches SMS to Driver via mNotify upon assignment.
- Dedicated Mobile-Optimized Driver Portal (`/driver/dashboard` & `/driver/deliveries`):
  - Today's Delivery Run: ordered list of assigned delivery stops.
  - Delivery Card Details: Customer Name, Phone (clickable `tel:`), Ghana Digital Address, GPS map link, delivery instructions.
  - Status Progression Actions:
    - "Start Delivery" -> updates status to `Out for Delivery` and sends customer SMS ("Driver is on the way").
    - "Complete Delivery" -> opens Point-of-Delivery Bottle Exchange Tool.
- Point-of-Delivery Bottle Exchange Tool (PRD Section 8 & 11):
  - Filled bottles delivered counter.
  - Empty bottles collected from customer counter.
  - Damaged / broken bottles logged counter.
  - Cash / MoMo collected on site recorder.
  - Customer signature or confirmation note.
  - Atomic update of customer's "Bottles Held" count and warehouse stock in PostgreSQL.

### 2. UI Template Assets Used
- `Logistics.tsx`, `TrackingTimeline.tsx`, `DataTables.tsx`, `Modal.tsx`, `Badge.tsx`, `Button.tsx`

### 3. Technical Implementation
- API routes `/api/deliveries/assign` and `/api/deliveries/complete`.
- Database transaction: completing delivery updates order status, delivery status, bottle exchange ledger, and inventory stock in a single atomic commit.

### 4. Self-Testing Protocol (AI Verification)
- Assign order to driver as Manager.
- Progress order from Driver portal: submit bottle exchange (2 filled delivered, 2 empty collected).
- Verify database atomic transaction updates both order status and bottle balances.

### 5. Reviewer Acceptance Testing (User UAT)
1. Log in as Manager (`manager@fnetwater.com`), go to **Delivery Dispatch**, and assign pending order to a driver.
2. Switch to Driver (`driver@fnetwater.com`), view assigned order, and click **Start Delivery**.
3. Click **Complete Delivery**, log 2 filled delivered and 2 empty returned, and submit.
4. Verify order marks as "Delivered" and inventory updates.

---

## MODULE 7: INVENTORY MANAGEMENT (BOTTLES & DISPENSERS)

### 1. Objectives & Scope
- Dual Inventory System in PostgreSQL (PRD Section 8, 9, 14):
  - **Water Bottle Inventory**:
    - Filled Bottles in Warehouse
    - Empty Bottles in Warehouse
    - Bottles Currently with Customers
    - Returned Bottles (Awaiting cleaning)
    - Damaged Bottles
    - Lost / Missing Bottles
  - **Water Dispenser Inventory**:
    - Available in Stock
    - Installed with Customers
    - On Active Installment Plans
    - Fully Paid / Customer-Owned
    - Faulty / Maintenance
- Inventory Actions & Reconciliation:
  - Manual Stock In / Adjustment modal with mandatory reason code (factory delivery, supplier batch, write-off).
  - Persistent Audit Ledger (`AuditLog` model in PostgreSQL) recording timestamp, user, delta, reason, and new balance.
  - Low stock warning banner and SMS alert to Manager when warehouse stock drops below threshold.

### 2. UI Template Assets Used
- `Stocks.tsx`, `DataTables.tsx`, `Modal.tsx`, `Progressbar.tsx`, `Badge.tsx`, `Button.tsx`

### 3. Technical Implementation
- API routes `/api/inventory` and `/api/inventory/adjust`.
- Database consistency checks ensuring total bottle pool remains consistent (`Filled + Empty + With Customers + Damaged + Lost = Total Pool`).

### 4. Self-Testing Protocol (AI Verification)
- Test manual stock adjustment (+100 filled bottles): verify stock updates and audit log record is created.
- Verify stock decreases when orders are delivered and increases when empty bottles are collected.

### 5. Reviewer Acceptance Testing (User UAT)
1. Go to **Inventory Management** as Admin.
2. Inspect the Bottle and Dispenser inventory overview cards.
3. Click **Stock In / Adjust Stock**, add 50 filled bottles with reason "Supplier Batch Delivery", and submit.
4. Verify the updated count and inspect the new row in **Stock Movement History**.

---

## MODULE 8: DISPENSER MANAGEMENT, INSTALLMENT PLANS & IOT TRACKER SIMULATION

### 1. Objectives & Scope
- Dispenser Catalog & Plans (PRD Section 15, 16):
  - Models: Floor Standing Hot & Cold, Countertop, Bottom-Loading Deluxe.
  - Pricing: Full outright price (GH₵ 1,800.00) vs Installment Plan (Initial deposit GH₵ 300.00 + GH₵ 150.00/month x 10 months).
- Customer Dispenser Portal (`/customer/dispensers`):
  - Apply for dispenser installment plan.
  - Active dispenser card: Model name, serial number, installation date.
  - Visual installment progress bar (`Amount Paid / Total Cost` %).
  - Outstanding balance and next payment due date badge.
  - "Make Installment Payment" (via Paystack) and "Report Dispenser Fault" modals.
- Admin Dispenser Management (`/admin/dispensers`):
  - Dispenser fleet overview table.
  - Automatic ownership transfer: when paid in full (GH₵ 1,800 / GH₵ 1,800), dispenser status automatically updates to "Customer Owned".
- Smart Dispenser IoT Tracking Simulator (PRD Section 17):
  - Live telemetry dashboard: Dispenser ID, Water Level Gauge (0-100%), Daily Usage (L/day), Battery (%), Device Online/Offline, GPS Location.
  - Interactive Simulator Triggers:
    - Low Water Level (< 15%) -> triggers auto-refill SMS prompt to customer.
    - Dispenser Relocated (> 500m) -> triggers security alert.
    - Device Offline -> triggers connection alert.
    - Tampering Alert -> triggers security warning banner & SMS alert to Admin.

### 2. UI Template Assets Used
- `Progressbar.tsx`, `DataTables.tsx`, `Modal.tsx`, `Alert.tsx`, `Switch.tsx`, `Logistics.tsx`

### 3. Technical Implementation
- Prisma models: `Dispenser`, `DispenserPlan`, `DispenserPayment`.
- Telemetry simulation API route `/api/dispensers/telemetry/simulate`.

### 4. Self-Testing Protocol (AI Verification)
- Apply for dispenser plan -> record installment payments until balance reaches 0.
- Verify status automatically updates to `OWNED` in PostgreSQL.
- Trigger simulated IoT tampering: verify alert appears in notification center and SMS triggers.

### 5. Reviewer Acceptance Testing (User UAT)
1. As Customer, navigate to **Dispensers** (`/customer/dispensers`).
2. View installment progress bar, click **Make Installment Payment**, and simulate a GH₵ 150.00 payment.
3. Log in as Admin, navigate to **Smart Tracker & Dispensers** (`/admin/dispensers`).
4. Click **Simulate Tamper Alert**: verify alert notification fires immediately.

---

## MODULE 9: PAYMENTS, PAYSTACK INTEGRATION & INVOICING

### 1. Objectives & Scope
- **Paystack Payment Gateway Integration** (PRD Section 18):
  - Configured with your development credentials:
    - Public Key: `pk_test_eb0b32c0bf50b5e00420d9d175e41a082e601be4`
    - Secret Key: `sk_test_e3dc4308aa829bb13669f66be490fadc1d120778`
  - Ghana Payment Channels: MTN Mobile Money, Telecel Cash, AirtelTigo Money, Cards (Visa/Mastercard), Bank Transfer.
  - Checkout initiation: API route `/api/paystack/initialize` generates Paystack authorization URL and reference code in GHS pesewas.
  - Secure Paystack Webhook (`/api/webhooks/paystack`):
    - Validates `x-paystack-signature` using HMAC SHA512 with `PAYSTACK_SECRET_KEY`.
    - Handles `charge.success`: updates order status to `PAID`, updates installment plan payments, triggers referral qualification, and dispatches mNotify receipt SMS.
- **Digital Invoices & Receipts**:
  - Itemized invoice view (`/invoice/:id`) based on `ui_template` SingleInvoice:
    - Official F Net Water Hub header, Ghana Digital Address, contact info.
    - Customer billing details.
    - Itemized breakdown in GH₵ (products, bottle deposit, delivery fee, discounts).
    - Paystack transaction reference code.
    - Print / Download PDF trigger with `@media print` styling.
- Outstanding Balance Tracking & Payment Reminders:
  - Customer outstanding balance tracker in PostgreSQL.
  - "Send Payment Reminder" action triggering in-app notification & mNotify SMS reminder.

### 2. UI Template Assets Used
- `SingleInvoice.tsx`, `CreateInvoice.tsx`, `Transactions.tsx`, `Billing.tsx`, `Badge.tsx`, `Button.tsx`

### 3. Technical Implementation
- Paystack helper library (`src/lib/paystack.ts`).
- Webhook handler ensuring idempotent order and installment fulfillment.

### 4. Self-Testing Protocol (AI Verification)
- Test Paystack initialization endpoint with test keys.
- Send mock `charge.success` webhook payload with HMAC signature: verify order marks as `PAID` and payment record is stored in PostgreSQL.
- Test invalid signature: verify webhook returns 400 Bad Request.

### 5. Reviewer Acceptance Testing (User UAT)
1. Place an order and choose "Paystack (MoMo / Card)".
2. Complete payment via Paystack test mode (using standard Paystack test MoMo number `0551234987`).
3. Verify order instantly updates to "Paid" upon webhook execution and SMS receipt is logged/sent.
4. View and click **Print Receipt**: verify clean printable layout in GH₵.

---

## MODULE 10: REFERRAL & REWARD ENGINE (5:1 RULE)

### 1. Objectives & Scope
- Referral System Engine (PRD Section 19):
  - Unique Referral Code (e.g. `FNET-KWAME-82`) and shareable link (`https://fnetwater.com/register?ref=FNET-KWAME-82`).
  - One-click "Copy Link" and QR Code display.
- Strict Qualification Rule:
  - A referral becomes "Successful" **ONLY** when:
    1. A new customer registers using the referral code.
    2. The new customer places an order.
    3. Payment is confirmed via Paystack or cash receipt.
- **Reward Formula: Every 5 Successful Referrals = 1 Free Water Bottle Credit.**
- Customer Referral Dashboard (`/customer/referrals`):
  - Total Referrals, Successful Referrals count, Free Bottle Balance.
  - Visual 5-referral progress bar (`3 / 5 towards next free bottle`).
  - Referral history table with referee status (`Registered`, `First Order Placed`, `Qualified`).
  - "Apply 1 Free Bottle Credit (GH₵ 25.00 off)" during water checkout.
  - Dispatches congratulatory SMS via mNotify when a free bottle is earned.
- Agent Portal (`/agent/dashboard`):
  - Direct field registration form for agents onboarding customers.
  - Agent referral count, order volume, and commission balance in GH₵.

### 2. UI Template Assets Used
- `Marketing.tsx`, `Progressbar.tsx`, `Badge.tsx`, `Modal.tsx`, `Input.tsx`

### 3. Technical Implementation
- Prisma models: `Referral`, `AgentCommission`.
- Referral qualification service executing inside the Paystack webhook transaction.

### 4. Self-Testing Protocol (AI Verification)
- Register new customer with referral code.
- Fulfill first order: verify referee status changes to `QUALIFIED`.
- Simulate 5th referral: verify referrer's `freeBottleBalance` increments by 1 in PostgreSQL.
- Apply free bottle at checkout: verify total decreases by GH₵ 25.00 and balance decrements.

### 5. Reviewer Acceptance Testing (User UAT)
1. Log in as Customer, copy your referral code (`FNET-DEMO-01`).
2. Register a new customer with code `FNET-DEMO-01` and complete a water order.
3. Switch back to referrer: verify successful referral count increases by 1 and progress bar updates.

---

## MODULE 11: NOTIFICATION CENTER & MNOTIFY SMS ALERTS

### 1. Objectives & Scope
- Multi-Channel Notification System:
  - In-app notification center: header bell with unread badge (`NotificationDropdown.tsx`).
  - SMS notification channel via **mNotify Ghana** for critical customer, driver, and staff alerts.
  - Toast alerts on real-time UI interactions.
- Role-Specific Alert Triggers:
  - Customer: Order Confirmed (In-App + SMS), Out for Delivery (In-App + SMS), Delivered (In-App), Free Bottle Earned (In-App + SMS).
  - Driver: New Delivery Assigned (In-App + SMS).
  - Manager: Low Inventory Alert (In-App + SMS), Driver Delay.
  - Admin: Daily Revenue Summary, Smart Tracker Tampering Alert (In-App + SMS).
- Notification Actions: Mark as read, mark all as read, click to navigate to target record.

### 2. UI Template Assets Used
- `NotificationDropdown.tsx`, `Alert.tsx`, `Badge.tsx`, `Button.tsx`

### 3. Technical Implementation
- PostgreSQL `Notification` model with `userId`, `role`, `title`, `message`, `type`, `linkUrl`, `isRead`.
- `mnotify.ts` SMS dispatcher triggered alongside database notifications.

### 4. Self-Testing Protocol (AI Verification)
- Dispatch notifications across all 5 roles: verify only the target user/role receives them.
- Test "Mark as Read": verify unread counter decrements in the database.

### 5. Reviewer Acceptance Testing (User UAT)
1. As Customer, place an order.
2. Click the Notification Bell: verify order confirmation notification appears.
3. Verify mNotify SMS is dispatched/logged for the customer.

---

## MODULE 12: BUSINESS REPORTS & ANALYTICS

### 1. Objectives & Scope
- Centralized Analytics Dashboard (`/admin/reports` & `/manager/reports` per PRD Section 21):
  - **Sales & Revenue Reports**: Daily, weekly, monthly, and annual revenue trends in GH₵.
  - **Delivery Reports**: Completed vs Pending vs Cancelled delivery bar chart, driver rankings.
  - **Customer & Growth Reports**: Total customers, active customers, referral acquisition funnel.
  - **Inventory Reports**: Bottle circulation metrics (plant vs customers), loss/damage rate.
  - **Financial Reports**: Total payments, outstanding balances, dispenser installment receivables.
- Interactive Charts using **ApexCharts** (`ssr: false` dynamic import) styled with brand colors (`#0057B8`, `#00AEEF`, `#12B76A`, `#F79009`).
- Filters & Data Export:
  - Date range filters (Today, 7 Days, 30 Days, Custom Range via Flatpickr).
  - One-click CSV Export for all report datasets.

### 2. UI Template Assets Used
- `Analytics.tsx`, `LineChart.tsx`, `BarChart.tsx`, `PieChart.tsx`, `date-picker.tsx`, `DataTables.tsx`

### 3. Technical Implementation
- High-performance PostgreSQL aggregation queries via Prisma.
- CSV export utility converting JSON datasets to downloadable CSV files.

### 4. Self-Testing Protocol (AI Verification)
- Verify ApexCharts render cleanly on client side without SSR errors.
- Test date filtering: confirm metrics recalculate correctly from PostgreSQL.
- Test CSV export: verify downloaded file contains valid columns and rows.

### 5. Reviewer Acceptance Testing (User UAT)
1. Log in as Admin (`admin@fnetwater.com`), go to **Reports & Analytics**.
2. Inspect revenue and delivery charts. Change date filter to "Last 7 Days".
3. Click **Export CSV** on the Sales Summary table: verify spreadsheet downloads with GH₵ figures.

---

## MODULE 13: DOCKER COMPOSE, COOLIFY READINESS & HANDOVER

### 1. Objectives & Scope
- Containerization & Production Verification:
  - Multi-stage Next.js standalone build in `Dockerfile`.
  - Production `docker-compose.yml` with health checks, environment variable injection, and persistent volume for PostgreSQL.
  - Verified Coolify deployment compatibility (deployable via Docker Compose Git repository on Coolify).
- Cross-Role End-to-End Audit across all 5 roles.
- Responsive Optimization Audit (Mobile 375px-425px, Tablet 768px-1024px, Desktop 1280px+).
- Code Quality Gate: Zero TypeScript compilation errors (`tsc --noEmit`), clean production build (`npm run build`).
- Final Handover Package: Comprehensive `USER_REVIEW_GUIDE.md` with demo credentials, mNotify instructions, Paystack test numbers, and step-by-step walkthrough.

### 2. UI Template Assets Used
- Full codebase and responsive shell.

### 3. Technical Implementation
- Docker optimization ensuring container image size < 150MB.
- Health check endpoints (`/api/health`).

### 4. Self-Testing Protocol (AI Verification)
- Run `docker compose build` and `docker compose up -d`.
- Verify database migrations and seed script run on startup.
- Verify production Next.js standalone server starts and serves requests.

### 5. Reviewer Acceptance Testing (User UAT)
1. Follow the final Reviewer Guide to test full system end-to-end.
2. Confirm Phase 1 web application readiness for Coolify production deployment.
