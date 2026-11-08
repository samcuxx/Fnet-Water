# F NET WATER HUB — ENGINEERING RULES & QUALITY CONTRACT

This document defines the strict, binding operational rules for the engineering, architecture, design system, and user experience of **F Net Water Hub**. Every code change, component migration, state structure, and user interface element must strictly comply with these guidelines.

---

## 1. TECH STACK SPECIFICATION

The production tech stack is strictly defined as follows:

- **Framework**: **Next.js** (App Router, TypeScript, React 19)
- **Database**: **PostgreSQL 16** (Docker container locally & in production)
- **ORM & Data Layer**: **Prisma ORM** (type-safe queries, migrations, seeders)
- **Styling & UI**: **Tailwind CSS v4** + TailAdmin React v2.3.0 components (`ui_template`)
- **Authentication**: **NextAuth.js / Auth.js** (Credentials Provider with role-based JWT sessions & SMS OTP verification)
- **Payment Gateway**: **Paystack** (Ghana Mobile Money: MTN, Telecel, AirtelTigo, Cards, Bank Transfer + Webhook automation)
- **SMS & OTP Provider**: **mNotify Ghana** (`https://api.mnotify.com/api/sms/quick`)
  - Sender ID: `Fnet`, Project: `Fnet`
- **Data Visualizations**: **ApexCharts** (`react-apexcharts` loaded via `next/dynamic` with `ssr: false`)
- **Containerization & DevOps**: **Docker** (Multi-stage standalone build) + **Docker Compose**
- **Production Hosting Target**: Self-hosted via **Coolify** (developed locally via Docker first)

---

## 2. UI TEMPLATE ARCHETYPE & FIDELITY STANDARD (NON-NEGOTIABLE)

Never invent arbitrary layouts, flat card slabs, or random custom UI. Every single screen in the application must strictly derive from its verified archetype in `ui_template`:

### Rule 2.1: Authentication Archetype (`AuthPageLayout`)
All authentication pages (`/login`, `/register`, `/reset-password`, etc.) must use `AuthPageLayout`:
- **Desktop Split-Screen**:
  - **Left Column**: Clean form container with back navigation ("Back to Home"), title, subtitle, method tabs ("Password" | "SMS Code"), clean input fields matching `ui_template` (`InputField`, `Checkbox`, `Button`), and copyright footer.
  - **Right Column (Desktop `lg:block`)**: Dark brand surface (`bg-brand-950 dark:bg-white/5`) featuring `GridShape` vector grid patterns (`/images/shape/grid-01.svg`), the official brand logo, and concise product messaging.
  - **Floating Theme Toggler**: Fixed in the bottom-right corner (`fixed bottom-6 right-6 z-50`).

### Rule 2.2: Executive & Analytics Dashboard Archetype (`Ecommerce.tsx`)
Executive, Admin, and Business dashboards must follow the `Ecommerce.tsx` archetype from `ui_template`:
- **Top Row**: 4 KPI `EcommerceMetrics` cards with SVG icons, trend badges (+11.01% with up arrow), and high-contrast numbers.
- **Middle Row (7 / 5 column split)**:
  - Left (7 cols): `MonthlySalesChart` (interactive 12-month bar chart with rounded tops).
  - Right (5 cols): `MonthlyTarget` (semi-circular `radialBar` gauge tracking quota/target completion with financial breakdown).
- **Next Row (12 cols)**:
  - Full-width `StatisticsChart` (dual-series smooth area/line chart with gradient fills and tab filters).
- **Bottom Row**:
  - `RecentOrders` table with customer avatars/names, product tags, Paystack amounts, and status badges.

### Rule 2.3: Logistics, Fleet & Dispatch Archetype (`Logistics.tsx`)
Operations, Manager, and Dispatch dashboards must follow the `Logistics.tsx` archetype from `ui_template`:
- **Top Row**: `LogisticsMetrics` (Active Delivery Runs, On-Time Dispatch Rate, 1:1 Bottles Exchanged, Damaged Bottle Alerts).
- **Middle Row**:
  - `DeliveryStatisticsChart` (dual-series column chart comparing scheduled refills vs completed exchanges).
  - `DeliveryVehicle` (fleet cards displaying vehicle ID, license plate, driver, live bottle capacity, and route tags).
- **Bottom Row**:
  - `DeliveriesActivityTable` (real-time dispatch queue with order IDs, customer destinations, GPS digital addresses, and status badges).

### Rule 2.4: Customer Portal Archetype
Customer views must provide:
- Welcome banner with customer code (`CUST-XXXX`) and quick reorder trigger.
- 4 personal metric cards (Bottles Held, Free Referral Credits, Dispenser Plan Month, Next Scheduled Delivery).
- Monthly Water Consumption ApexChart (bar chart).
- Dispenser Rent-to-Own Installment Radial Gauge (`radialBar` showing % paid and remaining balance to ownership).
- Recent orders and 1-click reorder table.

---

## 3. MANDATORY DATA VISUALIZATIONS (NO FLAT TEXT OR LONE BARS)

Never present business metrics, progress, or performance as flat text boxes or lone progress bars when data visualization makes it professional:

### Rule 3.1: ApexCharts Visual Standards
- **RadialBar Gauge**: Mandatory for targets, goals, quota completion, and dispenser rent-to-own payoff progress.
- **Smooth Area/Line Chart**: Mandatory for daily/weekly trends, revenue comparisons, and temporal metrics.
- **Bar/Column Chart**: Mandatory for monthly sales volume, delivery comparisons, and consumption histories.
- **Donut/Pie Chart**: Mandatory for category distributions (MoMo vs Card, Residential vs Commercial, 19L vs Bulk).
- **SSR Safety**: All ApexCharts components must be dynamically imported with `{ ssr: false }` to avoid SSR hydration mismatches in Next.js.
- **Progress Bar Restriction**: Linear progress bars (`ProgressBar`) are reserved strictly for minor in-card inline progress (like 1-line table cell indicators), NEVER as the hero visualization of a dashboard section.

---

## 4. STRICT VENDOR & DEVELOPER JARGON BAN (END-USER UI)

Never leak internal vendor names, database terms, or developer acronyms into end-user customer/staff facing UI. Always use standard, clean, professional business terminology:

| Banned Jargon in User UI | Required Professional Label |
|---|---|
| `mNotify`, `mNotify SMS OTP` | **"SMS Code"** or **"Verification Code"** |
| `Ghana Phone`, `Ghana Phone Number` | **"Phone Number"** (placeholder: `024 123 4567`) |
| `Email Address` | **"Email"** or **"Email or Phone Number"** |
| `Paystack MoMo` | **"Mobile Money"** or **"MTN / Telecel / AT MoMo"** |
| `Paystack Card` | **"Debit / Credit Card"** |
| `PostgreSQL Database` | **"System Records"** or **"Order History"** |
| `Prisma / Docker / NextAuth` | Never mention in UI copy |
| `Account Secret Key` | **"Password"** |

---

## 5. PROGRESSIVE MULTI-STEP UX STANDARD

Never mash distinct interaction phases into one cluttered screen:

### Rule 5.1: Two-Step Progressive Flow
Multi-phase flows (SMS login, checkout, registration, password reset) must progress through sequential, dedicated steps:
- **Step 1 (Input)**: Clean field for identifier (e.g. Phone Number) with primary action ("Send Code").
- **Step 2 (Verification)**: Dedicated screen displaying *"Enter the 5-digit code sent to [phone]"* with a clear navigation link back (*"← Change number"*).

### Rule 5.2: 5-Box Digit Input Standard
All SMS verification and security codes must use the dedicated **5-Box Digit Input**:
- Exactly 5 individual square digit boxes.
- Auto-advance focus to the next box upon typing.
- Backspace key shifts focus to the preceding box.
- Full clipboard paste handling (auto-fills all 5 boxes when pasted).
- Resend cooldown timer (`Resend in 60s`).

---

## 6. ANTI-SLOP & PROFESSIONAL CRAFTSMANSHIP RULES

Following the principles of the **Anti-Slop Standard** (`https://github.com/miqdadbadjuber/anti-slop`), all output must feel designed by a focused human engineer:

### Rule 6.1: Word Bans & Character Ban
- **FORBIDDEN VOCABULARY**: Never use AI buzzwords or abstract inflation words:
  - *Banned*: `unlock`, `elevate`, `empower`, `seamless`, `cutting-edge`, `revolutionary`, `robust`, `delve`, `game-changer`, `next-level`, `testament`, `usher in`, `pivotal`, `groundbreaking`.
- **FORBIDDEN CHARACTER**: Never use the em dash (`—`) in UI copy or descriptions. Use commas, periods, colons, or parentheses instead.
- **Direct, Human Sentences**: State what the software does without fluff.
  - *Bad*: "Unlock the power of revolutionary water management with our cutting-edge platform."
  - *Good*: "Order water refills, schedule bulk deliveries, and manage dispenser plans."

### Rule 6.2: No Cluttered or Bombarded Card Grids
- **Never Bombard the Screen**: Avoid multi-paragraph cards, redundant badges, and wall-to-wall card grids where simple lists, clean tables, or quiet layouts belong.
- **Card Discipline**: A card must hold real, actionable operational data (such as a metric, an order summary, or an address record). Cards are never used as decorative text blocks.
- **Concise Descriptions**: Maximum 1 sentence for card or section descriptions. If a button says "Sign In", do not write a paragraph explaining that the button signs you in.

### Rule 6.3: Unified Brand Logo Standard (No Random Placeholders)
- Never generate temporary letters in gradient boxes (e.g. an "F" in a square).
- Always use the official F Net Water Hub logo component:
  - Component: `src/components/brand/Logo.tsx` (`<Logo />` or `<LogoIcon />`)
  - Static SVG assets: `public/images/logo/logo.svg`, `logo-dark.svg`, and `logo-icon.svg`.

### Rule 6.4: Zero Table Horizontal Scrolling
- Data tables must be balanced and responsive across viewports without requiring horizontal scrollbars.
- Columns must be consolidated to 4-5 high-value columns combining complementary details (e.g., Order ID & Product, Customer & Location, Amount, Status).

### Rule 6.5: Zero Theme Transition Glitches
- `disableTransitionOnChange` is mandatory on `<ThemeProvider>` in `src/app/layout.tsx`.
- Never place `transition-colors` on page roots or gradient stop containers that lag behind the `.dark` class mutation.

---

## 7. DUAL TESTING PROTOCOL (MANDATORY BEFORE HANDOVER)

### Stage 1: AI Developer Self-Verification
1. **Type Safety & Build Verification**:
   Execute `npx.cmd tsc --noEmit`. Ensure zero TypeScript compilation errors.
2. **Server Route Verification**:
   Verify modified routes compile and return HTTP 200 without hydration errors.
3. **Responsive Verification**:
   Ensure layouts adapt cleanly across desktop (`1280px+`), tablet (`768px - 1024px`), and mobile (`< 640px`) without overflow.

### Stage 2: User Acceptance Testing (UAT) Handover
Every completed module report must conclude with a structured **Reviewer Testing Guide** containing:
- **Test Persona**: Role to test as
- **Credentials / Access**: How to access the view
- **Step-by-Step Test Scenario**: Clear 1-2-3 actions
- **Expected Outcome**: What the user should see in the UI.

---

## 8. NON-TECHNICAL END-USER LANGUAGE & ZERO JARGON STANDARD

All applications and modules in F Net Water Hub are used by everyday Ghanaian consumers, logistics managers, and commercial van drivers. Technical jargon, developer shorthands, and robotic terminology are strictly forbidden in UI text.

### Rule 8.1: Strict Ban on Robotic Phrases
- Banned: `1:1 swap`, `1:1 bottle swap` -> Required: **"Bottle exchange"**, **"Returning empties"**, or **"Empty bottle return"**.
- Banned: `Complete Delivery & 1:1 Swap` -> Required: **"Complete Delivery"**.
- Banned: `Point-of-Delivery Handover` -> Required: **"Complete Delivery: [Order Number]"** or **"Delivery Details"**.
- Banned: `Filled 19L Handed Over` -> Required: **"Bottles Delivered"**.
- Banned: `Empty 19L Returned` -> Required: **"Empty Bottles Collected"**.
- Banned: `Damaged / Broken Bottles Handover` -> Required: **"Damaged Bottles"**.
- Banned: `Pending Allocation` / `Dispatch Allocation` -> Required: **"Unassigned Orders"** / **"Awaiting Driver Assignment"**.
- Banned: `Dual Stock` -> Required: **"Returns"** or **"Stock Level"**.
- Banned: `Remittance` -> Required: **"Cash Collected"** or **"Cash to Collect"**.

### Rule 8.2: Icons Over Raw HTML Characters
- Never place raw character entities like `&check;`, `&rarr;`, `&times;` in buttons or labels.
- Always use standard inline SVG icons with explicit `w-4 h-4` or `w-5 h-5` that scale cleanly and align across mobile viewports.
