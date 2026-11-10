# F NET WATER HUB — COMPLETE CLIENT HANDOVER & USER REVIEW GUIDE

Welcome to the **F Net Water Hub** platform, Ghana's premier automated water delivery, smart dispenser leasing, and logistics management system. This guide provides complete documentation, credentials, feature walkthroughs, and deployment instructions for executive stakeholders, operation managers, fleet drivers, field agents, and customers.

---

## 1. DEFAULT PERSONAS & PRODUCTION CREDENTIALS

The platform is pre-configured with dedicated accounts for each of the 5 role archetypes. For rapid testing, a **1-Click Persona Switcher** is provided on the Sign In page (`/login`).

| Role Archetype | Email Identifier | Phone Number | Password | Default Portal URL |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** (Executive) | `admin@fnetwater.com` | `0241000001` | `admin123` | [`/admin`](file:///admin) |
| **Manager** (Operations) | `manager@fnetwater.com` | `0241000002` | `manager123` | [`/manager`](file:///manager) |
| **Driver** (Fleet Delivery) | `driver@fnetwater.com` | `0241000003` | `driver123` | [`/driver`](file:///driver) |
| **Agent** (Field Sales) | `agent@fnetwater.com` | `0241000004` | `agent123` | [`/agent`](file:///agent) |
| **Customer** (End Consumer) | `customer@fnetwater.com` | `0241000005` | `customer123` | [`/customer`](file:///customer) |

> [!NOTE]
> All users can authenticate using either their **Email & Password** or their **Ghana Phone Number & 5-digit SMS Verification Code** on `/login`.

---

## 2. END-TO-END FEATURE WALKTHROUGHS

### Walkthrough 1: Customer Water Refill Order & Paystack Payment
1. Navigate to [`/login`](file:///login) and click the **Customer** quick switcher button.
2. From the Customer Portal home, click **"Order Water"** or navigate to [`/customer/order`](file:///customer/order).
3. Select the number of **18.9L Pure Water Refills** (GH₵ 25.00 each) or bottled water packs.
4. Toggle **"Returning empty bottles"** to waive the standard GH₵ 80.00 new bottle deposit fee.
5. Select or enter a valid **Ghana Digital Address** (e.g., `GA-183-9021`).
6. Select **"Pay with Paystack"** (supporting MTN Mobile Money, Telecel Cash, AT Money, Debit/Credit Cards, and Bank Transfer).
7. Upon completing payment in the test modal or callback, you are redirected to the order receipt page with live order tracking.

---

### Walkthrough 2: Operations Dispatch & Driver Assignment
1. Log in as **Manager** (`manager@fnetwater.com`) or **Admin** (`admin@fnetwater.com`).
2. Navigate to **"Deliveries Queue"** at [`/manager/deliveries`](file:///manager/deliveries) or [`/admin/deliveries`](file:///admin/deliveries).
3. View unassigned orders awaiting dispatch.
4. Click **"Assign Driver"** on any pending stop and select an available driver (e.g., *Kwame Asante - Van 01*).
5. The system automatically assigns the order, updates the dispatch queue, and dispatches an **SMS notification** to both the driver and the customer.

---

### Walkthrough 3: Driver Mobile Dispatch Run & Point-of-Delivery Exchange
1. Log in as **Driver** (`driver@fnetwater.com`).
2. The Driver Dashboard displays the driver's active run sheet, customer addresses, phone shortcuts, and bottle count totals.
3. Click **"Start Route"** to transition stops to `OUT_FOR_DELIVERY` (triggers customer SMS notification).
4. At customer doorstep, click **"Complete Delivery"**:
   - Confirm **Bottles Delivered** (e.g. 4 bottles).
   - Enter **Empty Bottles Collected** (e.g. 4 empties).
   - Record any **Damaged Bottles** (if applicable).
   - For cash orders, confirm **Cash Collected** in GH₵.
5. Tap **"Save & Finish Delivery"**:
   - Inventory is instantly reconciled in the central warehouse ledger.
   - The delivery stop transitions to `DELIVERED`.
   - The customer receives an instant delivery confirmation SMS.

---

### Walkthrough 4: Smart Dispenser Rent-to-Own & IoT Monitoring
1. In the Customer Portal, navigate to **"Smart Dispensers"** at [`/customer/dispenser`](file:///customer/dispenser).
2. Choose from the catalog:
   - **Tabletop Compressor Hot & Cold** (GH₵ 45.00/mo)
   - **Freestanding Bottom-Load Touchless** (GH₵ 75.00/mo)
   - **Executive Smart IoT UV Dispenser** (GH₵ 110.00/mo)
3. Select a contract plan (6, 12, or 24 months) and submit an application.
4. Review the dynamic **ApexCharts RadialBar Gauge** tracking your progress toward 100% equipment payoff.
5. Log in as **Manager** and visit [`/manager/dispensers`](file:///manager/dispensers):
   - Monitor real-time IoT sensor telemetry (Water Level %, Filter Life %, Tamper Status).
   - Test IoT simulations: trigger a low water or tamper alert to observe automated SMS notifications.

---

### Walkthrough 5: Agent Onboarding & Customer Referral Reward Loop
1. Log in as **Agent** (`agent@fnetwater.com`) at [`/agent`](file:///agent):
   - Review your unique referral link, total client signups, and commission balance in GH₵.
   - Use the **"Onboard Customer"** form to register households or corporate offices in the field.
2. In the Customer Portal at [`/customer/referrals`](file:///customer/referrals):
   - Share your personal referral code (e.g. `REF-KOF101`).
   - For every 5 qualifying customer orders referred, the customer automatically receives **1 Free 18.9L Water Refill** credited directly to their balance.

---

### Walkthrough 6: Executive Business Analytics & RFC-4180 CSV Data Exports
1. Log in as **Admin** (`admin@fnetwater.com`) or **Manager** (`manager@fnetwater.com`).
2. Navigate to **"Reports & Analytics"** at [`/admin/reports`](file:///admin/reports) or [`/manager/reports`](file:///manager/reports).
3. Switch between dynamic date range filters:
   - `Today`, `Last 7 Days`, `Last 30 Days`, `This Month`, `All Time`.
4. Review high-fidelity visual analytics:
   - **Revenue Trend**: Smooth gradient area chart with daily gross revenue in GH₵.
   - **Delivery Performance**: Bar chart comparing completed, pending, and in-transit dispatch stops.
   - **Fleet Circulation Gauge**: ApexCharts radialBar tracking bottle circulation % vs warehouse reserve.
   - **Product Distribution**: Donut chart detailing revenue across refills, bottled packs, and dispensers.
   - **Driver Fleet Leaderboard**: Performance table ranking drivers by delivery completion and cash collected.
5. Click any of the one-click export buttons to download clean RFC-4180 CSV spreadsheets:
   - **"Export Sales Orders"** (`/api/reports/export?type=SALES`)
   - **"Export Logistics"** (`/api/reports/export?type=DELIVERIES`)
   - **"Export Inventory"** (`/api/reports/export?type=INVENTORY`)

---

## 3. COOLIFY & DOCKER PRODUCTION DEPLOYMENT GUIDE

### Option A: Deployment via Coolify (Recommended)

Coolify is an open-source, self-hosted PaaS alternative to Heroku/Vercel that natively supports Docker and Next.js standalone applications.

#### Step 1: Create a PostgreSQL Service in Coolify
1. In your Coolify dashboard, select your Project and Environment.
2. Click **"+ New Service"** $\rightarrow$ select **PostgreSQL**.
3. Set the database name to `fnet_water_db`, user to `fnet_user`, and set a strong password.
4. Coolify will provide an internal database connection URL:
   ```
   postgresql://fnet_user:YOUR_SECURE_PASSWORD@postgres:5432/fnet_water_db?schema=public
   ```

#### Step 2: Deploy the Next.js Application from GitHub
1. In Coolify, click **"+ New Application"** $\rightarrow$ choose **Public or Private GitHub Repository**.
2. Select repository `samue/fnetWater` (or your production fork).
3. Set **Build Pack** to **Docker Compose** or **Dockerfile**.
4. In the Application **Configuration** tab, define the Environment Variables:

```ini
DATABASE_URL=postgresql://fnet_user:YOUR_SECURE_PASSWORD@postgres:5432/fnet_water_db?schema=public
NEXTAUTH_SECRET=fnet-water-hub-super-secret-jwt-key-2026
NEXTAUTH_URL=https://water.yourdomain.com
NEXT_PUBLIC_APP_URL=https://water.yourdomain.com
NODE_ENV=production
PORT=3000

# Paystack Payment Gateway
PAYSTACK_SECRET_KEY=sk_live_... (or sk_test_e3dc4308aa829bb13669f66be490fadc1d120778)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_... (or pk_test_eb0b32c0bf50b5e00420d9d175e41a082e601be4)

# mNotify SMS Alerts
MNOTIFY_API_KEY=EpyJqPefIbrTOBWOfr5ifgQXn
MNOTIFY_SENDER_ID=Fnet
MNOTIFY_PROJECT=Fnet
```

5. Set **Pre-deployment Command**:
   ```sh
   npx prisma db push --skip-generate && npx tsx prisma/seed.ts
   ```
6. Click **"Deploy"**. Coolify will execute the multi-stage build, configure the automated SSL certificate via Traefik/Let's Encrypt, and bring the application live.

---

### Option B: Local or VPS Deployment via Docker Compose

To deploy directly onto any Ubuntu/Debian server or local Docker Desktop environment:

```bash
# 1. Clone the repository
git clone https://github.com/samue/fnetWater.git
cd fnetWater

# 2. Copy the environment configuration template
cp .env.example .env

# 3. Spin up PostgreSQL and the Next.js standalone container
docker compose up -d --build

# 4. Initialize and seed the database inside the web container
docker compose exec web npx prisma db push
docker compose exec web npx tsx prisma/seed.ts

# 5. Access the application
# Open http://localhost:3000 in your browser
```

---

## 4. SYSTEM ARCHITECTURE & CODEBASE STRUCTURE

```
fnetWater/
├── prisma/
│   ├── schema.prisma            # PostgreSQL schemas (16 models, 6 enums)
│   └── seed.ts                  # Production Ghana seeding script
├── src/
│   ├── app/
│   │   ├── admin/               # Executive administration portals & reports
│   │   ├── manager/             # Operations & logistics supervision
│   │   ├── driver/              # Driver mobile dispatch run sheet
│   │   ├── agent/               # Field sales & onboarding portal
│   │   ├── customer/            # Customer refill ordering & dispenser portal
│   │   ├── api/                 # Secure REST endpoints & Paystack webhooks
│   │   ├── login/               # Split-screen auth with SMS OTP & demo switcher
│   │   ├── register/            # Customer signup with referral code
│   │   ├── reset-password/      # 2-step SMS OTP password reset
│   │   └── ui-showcase/         # Interactive design system & component library
│   ├── components/
│   │   ├── analytics/           # ApexCharts (Area, Bar, RadialBar, Donut)
│   │   ├── brand/               # Official SVG logo & brand marks
│   │   ├── layout/              # AppLayout shell, AppSidebar, MobileDock
│   │   └── ui/                  # Buttons, Badges, Modals, Tables, Forms
│   ├── lib/
│   │   ├── auth-store.ts        # NextAuth & phone OTP authentication
│   │   ├── order-store.ts       # Water pricing engine & order management
│   │   ├── dispatch-store.ts    # Delivery dispatch & driver run sheets
│   │   ├── inventory-store.ts   # Bottle inventory & stock audit logs
│   │   ├── dispenser-store.ts   # Smart dispenser rent-to-own & IoT engine
│   │   ├── referral-store.ts    # Customer referrals & agent commissions
│   │   ├── reports-store.ts     # Business analytics & RFC-4180 CSV generators
│   │   ├── notification-store.ts# In-app notifications & SMS audit ledger
│   │   ├── paystack.ts          # Ghana Mobile Money, Card & Bank checkout
│   │   └── mnotify.ts           # Ghana SMS dispatch & OTP generator
│   └── middleware.ts            # Edge RBAC route protection & cache headers
├── docker-compose.yml           # PostgreSQL 16 & Next.js production stack
├── Dockerfile                   # Multi-stage optimized standalone container
└── test-full-system-modules-1-to-12.ts # Full platform regression suite (224 tests)
```

---

## 5. RUNNING THE VERIFICATION TEST SUITE

The repository includes comprehensive automated test suites covering all 12 modules:

```bash
# 1. Run TypeScript compiler check (strictly 0 compile errors)
npx.cmd tsc --noEmit

# 2. Run the Full Platform Regression Suite (224/224 tests passing)
npx.cmd tsx test-full-system-modules-1-to-12.ts

# 3. Run individual module test suites:
npx.cmd tsx test-module12.ts       # Business Reports & Analytics
npx.cmd tsx test-module11.ts       # Notification Center & SMS Alerts
npx.cmd tsx test-module10.ts       # Customer Referrals & Agent Portal
npx.cmd tsx test-module9.ts        # Paystack MoMo, Card & Reconciliations
npx.cmd tsx test-module8.ts        # Smart Dispenser Rent-to-Own & IoT
npx.cmd tsx test-module7.ts        # Bottle Inventory & Stock Audits
```

---

## 6. CLIENT HANDOVER SIGN-OFF CHECKLIST

- [x] **Module 1**: PostgreSQL 16 Infrastructure, Prisma ORM, Docker Compose & Brand Styling.
- [x] **Module 2**: Design System & Reusable Component Library (`/ui-showcase`).
- [x] **Module 3**: Authentication Suite (Split-screen 3D arch, SMS OTP, Persona Switcher).
- [x] **Module 4**: Ghana Digital Address GPS Validation (`GA-183-9021`) & Customer Profiles.
- [x] **Module 5**: Water Catalog, Pricing Engine (Refill vs Deposit), Cart & Checkout.
- [x] **Module 6**: Delivery Dispatch Queue, Fleet Assignment & Driver Mobile Run Sheet.
- [x] **Module 7**: Warehouse Bottle Inventory, Stock Adjustments & Immutable Audit Logs.
- [x] **Module 8**: Smart Dispenser Rent-to-Own Financing, Contract Plans & IoT Telemetry.
- [x] **Module 9**: Paystack MoMo, Card & Bank Payments, Webhook Security & Reconciliations.
- [x] **Module 10**: Customer Referral Loop (5 orders = 1 free refill) & Agent Onboarding Portal.
- [x] **Module 11**: Real-Time Notification Center, Header Dropdown & mNotify SMS Alerts.
- [x] **Module 12**: Business Reports & Analytics Dashboard, ApexCharts & RFC-4180 CSV Exports.
- [x] **Module 13**: Multi-Stage Dockerfile, Coolify Deployment Readiness & Client Handover Package.
