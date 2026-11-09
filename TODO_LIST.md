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
  - [x] Import `Inter` font (professional typography) and typography scales.
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
- [x] **3.1 NextAuth.js Setup & Auth Pages**
  - [x] Configure NextAuth / Auth.js with PostgreSQL credentials provider and `bcryptjs` password hashing.
  - [x] Implement Sign In page (`/login`) with email/phone & password and demo one-click persona switcher.
  - [x] Implement **mNotify SMS OTP** login & verification tab.
  - [x] Implement Sign Up page (`/register`) with customer registration fields and referral code input.
  - [x] Implement Password Reset page (`/reset-password`) with SMS OTP.
  - [x] Redesign Auth Suite to High-Fidelity 3D Cyber Illustration Layout (Matching Mockup):
    - [x] Master Auth Container (`AuthPageLayout.tsx`): Split-container with deep curved arch (`rounded-l-[240px]`), mobile bottom sheet overlay, and corner monstera leaf clusters.
    - [x] Custom 3D Illustration (`/images/auth/auth-illustration.jpg`): 3D claymorphism water hero connecting floating glowing badges (pure 19L bottle, smart dispenser, delivery van, analytics, phone).
    - [x] Form Styling Standard: Soft rounded-2xl inputs in `#F6F8FC`, `#3B66FF` bold uppercase primary buttons, show/hide password eye toggles, password/SMS login methods, and 5-box OTP digit input standard.
- [x] **3.2 RBAC & Edge Route Protection**
  - [x] Implement `src/middleware.ts` to protect routes:
    - `/admin/*` -> `ADMIN` only
    - `/manager/*` -> `ADMIN`, `MANAGER`
    - `/driver/*` -> `DRIVER` only
    - `/agent/*` -> `AGENT` only
    - `/customer/*` -> `CUSTOMER` only
  - [x] Seed default accounts:
    - Admin (`admin@fnetwater.com` / `admin123`)
    - Manager (`manager@fnetwater.com` / `manager123`)
    - Driver (`driver@fnetwater.com` / `driver123`)
    - Agent (`agent@fnetwater.com` / `agent123`)
    - Customer (`customer@fnetwater.com` / `customer123`)
- [x] **3.3 Admin User Management Module**
  - [x] User list table in PostgreSQL with search, role filter, and status filter (`ACTIVE` / `INACTIVE`).
  - [x] "Add User" modal to create staff accounts.
  - [x] User actions: Activate / Deactivate account, Reset password.
- [x] **3.4 Verification & Testing**
  - [x] Verify unauthorized route blocking (Customer trying to access `/admin/users` is blocked).
  - [x] Test creating a new Driver account in PostgreSQL.
  - [x] Test mNotify OTP generation and verification.
  - [x] User Review: Test demo login across all 5 roles and test SMS OTP login.

---

## MODULE 4: CUSTOMER PORTAL, PROFILES & GHANA ADDRESS MANAGEMENT
- [x] **4.1 Customer Dashboard**
  - [x] Top metric cards: Active Orders, Bottles Held, Dispenser Status, Free Bottle Balance.
  - [x] Quick action cards: "Order 19L Refill", "Address Book", "Smart Dispenser", "Refer Friends (5:1 Rule)".
  - [x] Responsive ApexCharts: Monthly consumption bar chart and Rent-to-Own radialBar gauge.
  - [x] Primary Saved Delivery Address banner with quick manage shortcut.
  - [x] Recent Orders summary card with live status badges.
- [x] **4.2 Customer Profile & Account Details**
  - [x] View and edit profile: Full Name, Phone (+233 format), Email, Ghana Card Number.
  - [x] Security tab: Change password with bcrypt verification and update preferences.
  - [x] Profile links wired into UserDropdown and AppSidebar across all roles.
- [x] **4.3 Multi-Address Management (Address Book)**
  - [x] Address list displaying saved delivery locations with instant client-side search and category filtering.
  - [x] "Add / Edit Address" modal supporting:
    - Category: `HOME`, `OFFICE`, `SHOP`, `SCHOOL`, `WAREHOUSE`, `OTHER`
    - Street / Area Name (e.g. East Legon, Spintex, Osu)
    - Ghana Digital Address validation & auto-formatting (e.g. `GA-492-1029`)
    - GPS Coordinates & Google Maps location link
    - Delivery Instructions (e.g. "Call upon arrival", "Leave with reception")
    - Default address toggle with mutual exclusivity
  - [x] Delete address with confirmation modal.
- [x] **4.4 Verification & Testing**
  - [x] Verify validation for Ghanaian phone numbers and Ghana Digital Address formats (`isValidGhanaDigitalAddress`).
  - [x] Verify address saves, updates, and default toggle functions with exclusivity.
  - [x] 63 automated tests passing (38 master E2E tests + 25 Module 4 unit/integration tests).
  - [x] TypeScript clean check (`npx.cmd tsc --noEmit`) with 0 errors.

---

## MODULE 5: WATER PRODUCTS & ORDERING WORKFLOW
- [x] **5.1 Product Catalog Setup**
  - [x] Catalog stored in PostgreSQL & in-memory fallback:
    - 18.9L / 20L Refillable Water Bottle (Refill GH₵ 25.00 / Bottle Deposit GH₵ 80.00)
    - Take-Away Bottled Water Pack of 24 x 500ml (GH₵ 35.00 / pack)
    - Premium 750ml Bottled Water Pack of 16 (GH₵ 40.00 / pack)
    - Commercial Bulk Water Tanker Supply (GH₵ 450.00 / 1000L)
  - [x] Product catalog API (`/api/products`).
- [x] **5.2 Customer Water Ordering Workflow**
  - [x] Progressive 3-step ordering flow (`/customer/order`):
    - Step 1: Water product selection with quantity controls and 1:1 bottle swap toggle.
    - Step 2: Delivery address picker (from Address Book), date, time slots, and instructions.
    - Step 3: Review receipt breakdown, free refill reward redemption toggle, and payment method selection.
  - [x] Real-time pricing calculations (`/api/orders/calculate`): Subtotal + Bottle Deposit + Delivery Fee - Discount = Total in GH₵.
  - [x] Order creation API (`POST /api/orders`) with validation and customer profile bottle tracking.
- [x] **5.3 Order Confirmation & Live Tracking Screen**
  - [x] Order confirmation page with generated Order ID (e.g. `FNW-2026-XXXX`).
  - [x] Interactive live tracking stepper: `Order Placed` -> `Driver Assigned` -> `Out for Delivery` -> `Delivered & Exchanged`.
  - [x] Customer orders history page (`/customer/orders`) with status filtering, search, and live tracking modal.
- [x] **5.4 Verification & Testing**
  - [x] Verify calculations (1:1 bottle swap deposit waiving, free refill reward discount, free delivery for subtotal >= GH₵ 100).
  - [x] 102 total automated tests passing (42 master E2E tests + 35 Module 5 tests + 25 Module 4 tests).
  - [x] Clean TypeScript check (`npx.cmd tsc --noEmit`) with 0 errors.

---

## MODULE 6: DELIVERY DISPATCH & DRIVER PORTAL
- [x] **6.1 Manager & Admin Delivery Dispatch**
  - [x] Delivery management table with status filtering (`Pending`, `Assigned`, `Out for Delivery`, `Delivered`, `Cancelled`).
  - [x] One-click "Assign Driver" modal with driver workload preview (`/manager/deliveries`).
  - [x] Dispatch queue integration in Manager portal and live driver workload counters.
  - [x] Dispatch and Driver APIs (`/api/dispatch/orders`, `/api/dispatch/drivers`, `/api/dispatch/assign`).
- [x] **6.2 Mobile-Optimized Driver Portal**
  - [x] Mobile-first Driver Dashboard (`/driver`): Today's Stops Left, Completed Stops, 1:1 Swaps, Cash Collected counter.
  - [x] Assigned Delivery Stop card: Customer Name, click-to-call link (`tel:`), Ghana Digital Address (`GA-492-1029`), GPS Google Maps navigation shortcut, Delivery Notes.
  - [x] Status progression button: "Start Route (Out for Delivery)" updates status in real time.
- [x] **6.3 Point-of-Delivery Bottle Exchange Tool**
  - [x] "Complete Delivery & 1:1 Swap" modal on Driver screen:
    - Filled bottles delivered counter (`-`/`+`).
    - Empty bottles collected from customer counter (`-`/`+`).
    - Damaged / broken bottles logged counter.
    - Cash collected verification for Cash on Delivery orders.
    - Customer sign-off note.
  - [x] Atomic update: updates order status to `DELIVERED`, payment status to `PAID`, updates customer's bottles held balance, and logs `BottleExchangeRecord`.
- [x] **6.4 Verification & Testing**
  - [x] Assign order -> open Driver portal -> start route -> complete delivery with 1:1 bottle exchange.
  - [x] Verified customer profile bottles balance updates accurately.
  - [x] 139 total automated tests passing (50 master E2E tests + 29 Module 6 tests + 35 Module 5 tests + 25 Module 4 tests).
  - [x] TypeScript clean check (`npx.cmd tsc --noEmit`) with 0 errors.

---

## MODULE 7: INVENTORY MANAGEMENT (BOTTLES & DISPENSERS)
- [x] **7.1 Bottle Inventory Tracking in PostgreSQL**
  - [x] Metric cards: Filled Bottles in Warehouse (520), Empties in Warehouse (280), Bottles with Customers (1,200), Damaged (18), Lost (6).
  - [x] Real-time bottle circulation summary gauge (`radialBar` chart tracking 89.0% active fleet circulation).
  - [x] Bottle fleet distribution bar chart (`BottleDistributionChart.tsx`).
- [x] **7.2 Dispenser Inventory Tracking**
  - [x] Metric cards: Available in Warehouse, On Installment Plans, Customer Owned, In Maintenance / Repair.
  - [x] Dispenser fleet management table with serial number search, status filter, and live sensor telemetry (water level, battery, online status).
  - [x] "Update Dispenser Status" modal with repair workshop notes and audit logging.
- [x] **7.3 Manual Stock Adjustment & Audit Ledger**
  - [x] "Adjust Stock" modal supporting Stock In / Stock Out across Filled, Empty, Damaged, Lost bottles and Dispensers with mandatory audit reason.
  - [x] Audit ledger table displaying timestamp, staff member, item type, delta quantity, and mandatory reason.
  - [x] Automatic inventory synchronization when driver completes delivery (`syncDeliveryExchangeToInventory`).
  - [x] Low stock threshold detection (<150 filled bottles or <5 available dispensers) with warning banners.
- [x] **7.4 Verification & Testing**
  - [x] 161 total automated tests passing (50 Master E2E + 22 Module 7 + 29 Module 6 + 35 Module 5 + 25 Module 4).
  - [x] Clean TypeScript compilation (`npx.cmd tsc --noEmit`) with 0 errors.
  - [x] Protected route redirection to `/login` with anti-cache headers.

---

## MODULE 8: DISPENSER MANAGEMENT, INSTALLMENT PLANS & IOT TRACKER
- [x] **8.1 Dispenser Catalog & Plans**
  - [x] Dispenser models catalog: `Aquamaster Pro Hot/Cold` (GH₵ 1,800.00), `HydroPure Floor Standing` (GH₵ 1,600.00), `EcoStream Tabletop` (GH₵ 1,200.00).
  - [x] Installment plan terms: Total Cost (GH₵ 1,800.00), Initial Deposit (GH₵ 300.00), Monthly installment (GH₵ 150.00 x 10 months).
  - [x] Catalog API (`GET /api/dispensers/catalog`).
- [x] **8.2 Customer Dispenser Dashboard**
  - [x] Active Dispenser Card: Serial Number (`DSP-GH-0103`), model name, installation date, and address.
  - [x] Rent-to-Own Payoff `radialBar` gauge (`DispenserPayoffGauge.tsx`) with percentage progress.
  - [x] Outstanding balance, amount paid, and Next Due Date metric cards.
  - [x] "Pay Monthly Installment" modal with Mobile Money (MTN, Telecel, AT) integration.
  - [x] "Report Issue / Request Service" modal with issue type, description, and urgency.
  - [x] "Apply for Rent-to-Own" form for customers without active dispensers.
- [x] **8.3 Admin Dispenser Fleet & Ownership Transfer**
  - [x] Master dispenser table with contract status and financial progress bars (`/manager/dispensers`).
  - [x] Automatic ownership transition: When payments reach 100% of total cost, status automatically changes to "Customer Owned" with celebration flag.
- [x] **8.4 Smart Dispenser IoT Tracking Simulator**
  - [x] IoT telemetry panel: Water Level in Bottle (% and Liters remaining), Daily Usage (L/day), Battery (%), Online/Offline status, and Tamper sensor state.
  - [x] Interactive Simulator triggers:
    - Simulate Low Water (< 15%) -> dispatches customer refill banner and doorstep order button.
    - Simulate Device Offline -> connection lost state.
    - Simulate Tampering Alert -> movement alert banner.
    - Reset Telemetry to Normal (85% water, online, secure).
- [x] **8.5 Verification & Testing**
  - [x] 183 total automated tests passing (50 Master E2E + 22 Module 8 + 22 Module 7 + 29 Module 6 + 35 Module 5 + 25 Module 4).
  - [x] Clean TypeScript compilation (`npx.cmd tsc --noEmit`) with 0 errors.
  - [x] Protected routes enforce authentication and redirect to `/login`.

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
