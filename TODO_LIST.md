# F NET WATER HUB — MASTER DEVELOPMENT TO-DO LIST

> **Status Indicator Guide:**  
> - `[ ]` Pending  
> - `[/]` In Progress / Under Verification  
> - `[x]` Completed & Fully Verified  

---

## MODULE 1: PROJECT SETUP, LOCAL DOCKER & DATABASE INFRASTRUCTURE
- [x] **1.1 Next.js Fullstack & Tooling Setup**
  - [x] Initialize Next.js (App Router, React 19, TypeScript) project.
  - [x] Configure `@/*` path alias in `tsconfig.json`.
  - [x] Configure `next.config.ts` with `output: 'standalone'` for Docker and SVGR.
  - [x] Set up `src/app/layout.tsx` with metadata, "F Net Water Hub" title, and brand favicon.
- [x] **1.2 Brand Color & Styling Configuration**
  - [x] Configure Tailwind v4 `@theme` in `src/app/globals.css` with brand primary (`#0057B8`), light cyan (`#00AEEF`), and white (`#FFFFFF`).
  - [x] Import `Outfit` font and typography scales.
- [x] **1.3 Local Docker Compose & Environment Variables**
  - [x] Create `docker-compose.yml` with PostgreSQL 16 Alpine container (`db`) and persistent volume `postgres_data`.
  - [x] Create `.env.local` and `.env` configured with:
    - Database URL: `postgresql://fnet_user:fnet_secure_pass_2026@localhost:5432/fnet_water_db?schema=public`
    - Paystack Secret: `sk_test_e3dc4308aa829bb13669f66be490fadc1d120778`
    - Paystack Public: `pk_test_eb0b32c0bf50b5e00420d9d175e41a082e601be4`
    - mNotify API Key: `EpyJqPefIbrTOBWOfr5ifgQXn`, Sender ID: `Fnet`, Project: `Fnet`
    - NextAuth secret and base app URLs.
- [x] **1.4 PostgreSQL Database & Prisma ORM**
  - [x] Initialize Prisma ORM (`prisma/schema.prisma`).
  - [x] Define PostgreSQL models: `User`, `CustomerProfile`, `DeliveryAddress`, `Product`, `Order`, `OrderItem`, `Delivery`, `BottleExchange`, `BottleInventory`, `Dispenser`, `DispenserPlan`, `DispenserPayment`, `Referral`, `PaymentTransaction`, `Notification`, `AuditLog`, `OtpVerification`.
  - [x] Define enums: `UserRole` (`ADMIN`, `MANAGER`, `DRIVER`, `AGENT`, `CUSTOMER`), `OrderStatus`, `DeliveryStatus`, `PaymentStatus`, `DispenserStatus`, `AddressType`.
  - [x] Create Prisma singleton (`src/lib/prisma.ts`).
  - [x] Create mNotify helper library (`src/lib/mnotify.ts`) for SMS & OTP dispatch.
  - [x] Create Paystack helper library (`src/lib/paystack.ts`).
  - [x] Write database seed script (`prisma/seed.ts`) populating default accounts for 5 roles, products in GH₵, sample addresses, and initial inventory balances.
- [/] **1.5 Verification & Testing**
  - [x] Run `npm.cmd run build` — verified clean Next.js build with zero compile errors.
  - [x] Verify `docker compose config` is valid with zero errors.
  - [ ] Start local PostgreSQL via `docker compose up -d db` (Pending: Launch Docker Desktop).
  - [ ] Run `npx prisma db push` and `npm run prisma:seed`.
  - [ ] User Review: Verify initial page load and Prisma Studio data view.

---

## MODULE 2: DESIGN SYSTEM & CORE REUSABLE COMPONENT LIBRARY
- [x] **2.1 Component Migration from `ui_template` to Next.js**
  - [x] Port Buttons (`Button.tsx`, primary `#0057B8`, secondary, danger, outline).
  - [x] Port Badges (`Badge.tsx`, success, warning, error, info, brand).
  - [x] Port Metric and Content Cards (`ComponentCard.tsx`).
  - [x] Port Modals & Dialogs (`Modal.tsx`, `'use client'`).
  - [x] Port Form Elements (`Input.tsx`, `Label.tsx`, `Select.tsx`, `MultiSelect.tsx`, `Switch.tsx`, `Checkbox.tsx`, `Radio.tsx`, `TextArea.tsx`).
  - [x] Port DatePicker (`date-picker.tsx`, wrapped Flatpickr with `'use client'`).
  - [x] Port Data Tables & Pagination (`Table.tsx`, `Pagination.tsx`).
  - [x] Port Progress Bars (`ProgressBar.tsx`).
  - [x] Port Alert Banners (`Alert.tsx`).
  - [x] Port SVG Icons catalog (`src/icons/index.ts`).
- [x] **2.2 Master Application Shell & Layout**
  - [x] Create unified `AppLayout.tsx` with responsive drawer sidebar and top header.
  - [x] Build role-aware navigation in `AppSidebar.tsx` (custom menus for Admin, Manager, Driver, Agent, Customer).
  - [x] Build `AppHeader.tsx` with search bar, theme toggle (dark/light via `next-themes`), notifications trigger, and user profile switcher.
  - [x] Build `ThemeToggleButton.tsx` and integrate light/dark mode switch in both the landing page footer and dashboard header.
- [x] **2.3 Component Showcase Route**
  - [x] Create `/ui-showcase` demonstrating all reusable components in light and dark modes.
- [x] **2.4 Verification & Testing**
  - [x] Verify clean Next.js build (`npm.cmd run build`) with zero compile or hydration errors.
  - [x] Test responsive layout, dark mode toggle, and modal opening/closing.
  - [x] User Review: Browse `/ui-showcase` and test responsive layout and light/dark theme toggle.

---

## MODULE 3: AUTHENTICATION, MNOTIFY OTP & RBAC (5 ROLES)
- [ ] **3.1 NextAuth.js Setup & Auth Pages**
  - [ ] Configure NextAuth / Auth.js with PostgreSQL credentials provider and `bcryptjs` password hashing.
  - [ ] Implement Sign In page (`/login`) with email/phone & password and demo one-click persona switcher.
  - [ ] Implement **mNotify SMS OTP** login & verification tab.
  - [ ] Implement Sign Up page (`/register`) with customer registration fields and referral code input.
  - [ ] Implement Password Reset page (`/reset-password`) with SMS OTP.
- [ ] **3.2 RBAC & Edge Route Protection**
  - [ ] Implement `src/middleware.ts` to protect routes:
    - `/admin/*` -> `ADMIN` only
    - `/manager/*` -> `ADMIN`, `MANAGER`
    - `/driver/*` -> `DRIVER` only
    - `/agent/*` -> `AGENT` only
    - `/customer/*` -> `CUSTOMER` only
  - [ ] Seed default accounts:
    - Admin (`admin@fnetwater.com` / `admin123`)
    - Manager (`manager@fnetwater.com` / `manager123`)
    - Driver (`driver@fnetwater.com` / `driver123`)
    - Agent (`agent@fnetwater.com` / `agent123`)
    - Customer (`customer@fnetwater.com` / `customer123`)
- [ ] **3.3 Admin User Management Module**
  - [ ] User list table in PostgreSQL with search, role filter, and status filter (`ACTIVE` / `INACTIVE`).
  - [ ] "Add User" modal to create staff accounts.
  - [ ] User actions: Activate / Deactivate account, Reset password.
- [ ] **3.4 Verification & Testing**
  - [ ] Verify unauthorized route blocking (Customer trying to access `/admin/users` is blocked).
  - [ ] Test creating a new Driver account in PostgreSQL.
  - [ ] Test mNotify OTP generation and verification.
  - [ ] User Review: Test demo login across all 5 roles and test SMS OTP login.

---

## MODULE 4: CUSTOMER PORTAL, PROFILES & GHANA ADDRESS MANAGEMENT
- [ ] **4.1 Customer Dashboard**
  - [ ] Top metric cards: Active Orders, Bottles Held, Dispenser Status, Free Bottle Balance.
  - [ ] Quick action cards: "Order Water", "Request Bottle Refill", "Apply for Dispenser", "Refer Friends".
  - [ ] Recent Orders summary card with live status badges.
- [ ] **4.2 Customer Profile & Account Details**
  - [ ] View and edit profile: Full Name, Phone (+233 format), Email, Ghana Card Number.
  - [ ] Security tab: Change password and notification preferences.
- [ ] **4.3 Multi-Address Management (Address Book)**
  - [ ] Address list displaying saved delivery locations from PostgreSQL.
  - [ ] "Add / Edit Address" modal supporting:
    - Category: `HOME`, `OFFICE`, `SHOP`, `SCHOOL`, `WAREHOUSE`, `OTHER`
    - Street / Area Name (e.g. East Legon, Spintex, Osu)
    - Ghana Digital Address (e.g. `GA-183-9021`)
    - GPS Coordinates & Google Maps location link
    - Delivery Instructions (e.g. "Call upon arrival", "Leave with reception")
    - Default address toggle
  - [ ] Delete address with confirmation modal.
- [ ] **4.4 Verification & Testing**
  - [ ] Verify validation for Ghanaian phone numbers and Ghana Digital Address formats.
  - [ ] Verify address saves to PostgreSQL and default toggle functions properly.
  - [ ] User Review: Add a new address and verify it appears in Customer Profile.

---

## MODULE 5: WATER PRODUCTS & ORDERING WORKFLOW
- [ ] **5.1 Product Catalog Setup**
  - [ ] Store catalog items in PostgreSQL:
    - 18.9L / 20L Refillable Water Bottle (Refill GH₵ 25.00 / Bottle Deposit GH₵ 80.00)
    - Take-Away Bottled Water Pack (GH₵ 35.00 / pack)
    - Bulk Water Commercial Tanker Supply (GH₵ 450.00 / 1000L)
  - [ ] Admin/Manager product list and edit modal (update prices, description, stock status).
- [ ] **5.2 Customer Water Ordering Workflow**
  - [ ] Product selection grid with increment/decrement quantity counters.
  - [ ] Delivery address selector (from saved address book).
  - [ ] Delivery schedule picker (Date picker + Time slot: Morning / Afternoon / Evening).
  - [ ] Delivery instructions field.
  - [ ] Payment method selector (Paystack MoMo/Card, Bank Transfer, Cash on Delivery).
  - [ ] "Redeem Free Bottle Reward" toggle (if reward balance > 0).
  - [ ] Real-time price calculation: Subtotal + Bottle Deposit + Delivery Fee - Discount = Total in GH₵.
  - [ ] Order submission -> creates `Order` and `OrderItem` in PostgreSQL.
  - [ ] Dispatch order confirmation SMS via mNotify.
- [ ] **5.3 Order Confirmation & Tracking Screen**
  - [ ] Success confirmation page with generated Order ID (e.g. `FNW-2026-1042`).
  - [ ] Interactive order tracking stepper: `Pending` -> `Assigned` -> `Out for Delivery` -> `Delivered`.
- [ ] **5.4 Verification & Testing**
  - [ ] Place orders with single and multiple items in GH₵.
  - [ ] Verify order records persist in PostgreSQL with correct totals.
  - [ ] User Review: Place an order from start to finish and inspect the confirmation.

---

## MODULE 6: DELIVERY DISPATCH & DRIVER PORTAL
- [ ] **6.1 Manager & Admin Delivery Dispatch**
  - [ ] Delivery management table with status filtering (`Pending`, `Assigned`, `Out for Delivery`, `Delivered`, `Failed`).
  - [ ] One-click "Assign Driver" modal with driver workload preview.
  - [ ] Route overview and estimated dispatch time.
  - [ ] Dispatch SMS notification to driver upon assignment via mNotify.
- [ ] **6.2 Mobile-Optimized Driver Portal**
  - [ ] Driver Dashboard: Today's Deliveries, Completed Deliveries, Cash Collected counter.
  - [ ] Assigned Delivery Stop card: Customer Name, Phone link (`tel:`), Ghana Digital Address, GPS map link, Delivery Instructions.
  - [ ] Status progression button: "Start Delivery" -> updates order to `Out for Delivery` and sends customer SMS.
- [ ] **6.3 Point-of-Delivery Bottle Exchange Tool**
  - [ ] "Complete Delivery" modal on Driver screen:
    - Filled bottles delivered counter.
    - Empty bottles collected from customer counter.
    - Damaged / broken bottles logged counter.
    - Payment collected on delivery (Cash / MoMo transaction ID).
    - Customer sign-off note.
  - [ ] Atomic PostgreSQL transaction: updates order status, customer bottles held count, and warehouse stock.
- [ ] **6.4 Verification & Testing**
  - [ ] Assign order -> open Driver portal -> complete delivery with bottle exchange.
  - [ ] Verify real-time database update of bottle balances and order status.
  - [ ] User Review: Test driver delivery completion flow on mobile view.

---

## MODULE 7: INVENTORY MANAGEMENT (BOTTLES & DISPENSERS)
- [ ] **7.1 Bottle Inventory Tracking in PostgreSQL**
  - [ ] Metric cards: Filled Bottles in Warehouse, Empty Bottles in Warehouse, Bottles with Customers, Returned Bottles, Damaged Bottles, Lost Bottles.
  - [ ] Real-time bottle circulation summary gauge.
- [ ] **7.2 Dispenser Inventory Tracking**
  - [ ] Metric cards: Available in Stock, Installed with Customers, On Installment Plans, Customer Owned, Faulty / Repair.
- [ ] **7.3 Manual Stock Adjustment & Audit Ledger**
  - [ ] "Stock In / Adjust Stock" modal (Item type, delta quantity, mandatory reason code).
  - [ ] Audit log table (`AuditLog` model in PostgreSQL): timestamp, user, item changed, delta, new balance, reason.
  - [ ] Low stock alert thresholds with automatic warning banners & SMS alert to manager.
- [ ] **7.4 Verification & Testing**
  - [ ] Verify automatic inventory sync on order placement and driver bottle exchange.
  - [ ] Perform manual adjustment and confirm transaction is recorded in audit log.
  - [ ] User Review: Check inventory metrics and perform a sample stock-in adjustment.

---

## MODULE 8: DISPENSER MANAGEMENT, INSTALLMENT PLANS & IOT TRACKER
- [ ] **8.1 Dispenser Catalog & Plans**
  - [ ] Dispenser models catalog (Hot & Cold, Bottom-load, Countertop).
  - [ ] Installment plan terms: Total Cost (GH₵ 1,800.00), Initial Deposit (GH₵ 300.00), Monthly installment (GH₵ 150.00 x 10 months).
- [ ] **8.2 Customer Dispenser Dashboard**
  - [ ] "Apply for Dispenser Installment Plan" form.
  - [ ] Active Dispenser Card: Serial Number, model, installation date.
  - [ ] Installment progress bar (`Amount Paid / Total Cost` %).
  - [ ] Outstanding balance and Next Payment Due Date badge.
  - [ ] "Make Installment Payment" modal (via Paystack).
  - [ ] "Report Dispenser Fault" modal (Issue description, urgency).
- [ ] **8.3 Admin Dispenser Fleet & Ownership Transfer**
  - [ ] Master dispenser table with payment status and maintenance logs.
  - [ ] Automatic status transition: Once paid 100%, dispenser marks as "Customer Owned" in PostgreSQL.
- [ ] **8.4 Smart Dispenser IoT Tracking Simulator**
  - [ ] IoT telemetry panel: Dispenser ID, Water Level Gauge (0-100%), Daily Usage (L/day), Battery (%), Online/Offline status, GPS location.
  - [ ] Interactive Simulator triggers:
    - Simulate Low Water Level (< 15%) -> dispatches customer refill SMS
    - Simulate Dispenser Relocated (> 500m)
    - Simulate Device Offline
    - Simulate Tampering Alert -> triggers Admin warning SMS
- [ ] **8.5 Verification & Testing**
  - [ ] Apply for dispenser plan -> simulate payments -> verify ownership transfer flag.
  - [ ] Trigger simulated IoT alerts and verify alert banners display.
  - [ ] User Review: Inspect customer dispenser progress and trigger simulated IoT alerts.

---

## MODULE 9: PAYMENTS, PAYSTACK INTEGRATION & INVOICING
- [ ] **9.1 Paystack Payment Gateway Integration**
  - [ ] Paystack API service (`src/lib/paystack.ts`) supporting Ghana MoMo (MTN, Telecel, AirtelTigo) and Card payments in GHS (pesewas).
  - [ ] Paystack checkout initialization endpoint (`/api/paystack/initialize`).
  - [ ] Secure Paystack Webhook (`/api/webhooks/paystack`):
    - Verify `x-paystack-signature` using HMAC SHA512 with `PAYSTACK_SECRET_KEY`.
    - Process `charge.success` event: update order payment status to `PAID`, record transaction in DB, trigger referral qualification, and send SMS receipt.
- [ ] **9.2 Digital Invoices & Receipts**
  - [ ] Invoices list table with status badges (`Paid`, `Pending`, `Overdue`).
  - [ ] Single Invoice / Receipt view (`/invoice/:id`):
    - F Net Water Hub official header and Ghana Digital Address.
    - Customer details and itemized pricing in GH₵.
    - Paystack transaction reference code.
    - Print / Download PDF layout with `@media print` styling.
- [ ] **9.3 Outstanding Balance Tracking & Reminders**
  - [ ] Outstanding balances report by customer in PostgreSQL.
  - [ ] "Send Payment Reminder" action triggering in-app notification & mNotify SMS reminder.
- [ ] **9.4 Verification & Testing**
  - [ ] Test Paystack initialization with test keys.
  - [ ] Test webhook signature verification (accept valid HMAC, reject invalid).
  - [ ] User Review: Open and print a completed order invoice in GH₵.

---

## MODULE 10: REFERRAL & REWARD ENGINE (5:1 RULE)
- [ ] **10.1 Customer Referral Dashboard**
  - [ ] Unique Referral Code & shareable referral link generator.
  - [ ] One-click "Copy Link" and QR code card.
  - [ ] Stat widgets: Total Friends Invited, Qualified Referrals, Free Bottles Earned.
  - [ ] 5-Referral Progress Bar (e.g. "3 / 5 completed towards next free bottle").
  - [ ] Referral history table showing referees and qualification statuses.
- [ ] **10.2 Automated Qualification & Reward Logic**
  - [ ] Qualification condition: New user registers + places order + Paystack payment confirmed = Qualified.
  - [ ] Reward rule: Every 5 qualified referrals = +1 Free Bottle Credit in PostgreSQL.
  - [ ] Integration with checkout: Allows spending free bottle credit to zero out refill cost.
  - [ ] Congratulatory SMS via mNotify when a free bottle is earned.
- [ ] **10.3 Agent Portal & Commission Tracking**
  - [ ] Dedicated Agent Dashboard (`/agent/dashboard`):
    - Customers Registered on Ground counter.
    - Orders Generated through Agent referrals.
    - Commission Balance earned in GH₵.
  - [ ] "Register New Customer" direct form for field agents.
- [ ] **10.4 Verification & Testing**
  - [ ] Test referral qualification triggered by Paystack webhook completion.
  - [ ] Test reaching 5 referrals: verify `freeBottleBalance` increments in PostgreSQL.
  - [ ] User Review: Test referral code sharing, simulate 5 referrals, and verify free bottle reward.

---

## MODULE 11: NOTIFICATION CENTER & MNOTIFY SMS ALERTS
- [ ] **11.1 Notification Infrastructure**
  - [ ] PostgreSQL `Notification` model with unread counter and read/unread state.
  - [ ] Header Notification Bell dropdown (`NotificationDropdown.tsx`) with category filters.
  - [ ] mNotify SMS dispatch service integration for high-priority operational alerts.
  - [ ] Floating Toast notifications on real-time state transitions.
- [ ] **11.2 Role-Tailored Alert Feeds**
  - [ ] Customer: Order updates (In-App + SMS), delivery tracking, payment receipts, free bottle earned.
  - [ ] Driver: New assigned deliveries (In-App + SMS), customer location changes.
  - [ ] Manager: Low inventory warnings (In-App + SMS), driver delays.
  - [ ] Admin: Daily revenue summaries, IoT device alerts (tamper/low water via SMS).
- [ ] **11.3 Verification & Testing**
  - [ ] Trigger notifications across all 5 roles and verify unread badge counters.
  - [ ] User Review: Trigger an action (e.g. order placed) and view notification in header.

---

## MODULE 12: BUSINESS REPORTS & ANALYTICS
- [ ] **12.1 Interactive Charts & Metrics**
  - [ ] Sales & Revenue Trends line chart (Daily, Weekly, Monthly, Annual in GH₵).
  - [ ] Delivery Performance bar chart (Completed vs Pending vs Cancelled).
  - [ ] Product Sales Distribution donut chart (Refillable vs Take-Away vs Bulk).
  - [ ] Bottle and Dispenser asset utilization charts.
  - [ ] Client-side dynamic ApexCharts loading (`ssr: false`) preventing hydration issues.
- [ ] **12.2 Filtering & Data Export**
  - [ ] Date range filter (Today, 7 Days, 30 Days, Custom range via Flatpickr).
  - [ ] One-click CSV Export for sales, deliveries, inventory, and customer reports.
- [ ] **12.3 Verification & Testing**
  - [ ] Verify chart series dynamically update upon changing date filters.
  - [ ] Download CSV export and confirm file contents are formatted properly in GH₵.
  - [ ] User Review: Inspect analytics dashboard and export a sample CSV report.

---

## MODULE 13: DOCKER COMPOSE, COOLIFY PRODUCTION DEPLOYMENT & HANDOVER
- [ ] **13.1 Docker Compose & Coolify Readiness**
  - [ ] Test multi-stage Docker build: verify image compiles with Next.js standalone output.
  - [ ] Test `docker compose up -d`: verify `web` and `db` spin up with health checks.
  - [ ] Verify automatic database migration and seed execution inside container.
- [ ] **13.2 Cross-Role End-to-End Audit**
  - [ ] Verify full customer lifecycle: Registration -> Ordering -> Paystack Payment -> Delivery -> Bottle Exchange -> Referral Reward -> Reports.
  - [ ] Verify Manager supervisory and Driver mobile actions.
- [ ] **13.3 Responsive & Accessibility Audit**
  - [ ] Mobile browser testing (375px - 425px).
  - [ ] Tablet testing (768px - 1024px).
  - [ ] Desktop testing (1280px+).
  - [ ] Dark / Light mode visual consistency check across all pages.
- [ ] **13.4 Build & Code Quality Gate**
  - [ ] Run `npm.cmd run build` — confirm clean production bundle with 0 errors.
  - [ ] Confirm 0 console errors and clean React key mappings.
- [ ] **13.5 Final Client Handover Package**
  - [ ] Create detailed `USER_REVIEW_GUIDE.md` with credentials, Coolify deployment guide, and step-by-step test scenarios.
  - [ ] Final project walkthrough presentation.
