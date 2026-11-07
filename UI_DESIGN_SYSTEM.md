# F NET WATER HUB — UI DESIGN SYSTEM & NEXT.JS TEMPLATE COMPONENT GUIDE

This guide documents the design system and component usage rules derived directly from `ui_template` (TailAdmin React v2.3.0) and adapted for **Next.js (App Router)**. All developers and agents must adhere strictly to these patterns and components.

---

## 1. BRAND IDENTITY & COLOR SYSTEM

### 1.1 Official Color Palette
As specified in the PRD, the application uses the following primary colors:

| Token Name | Hex Code | Purpose | Tailwind Utility / CSS Var |
| :--- | :--- | :--- | :--- |
| **Brand Primary (Water Deep)** | `#0057B8` | Primary branding, primary buttons, active states, key accents | `bg-brand-600`, `text-brand-600`, `--color-brand-600` |
| **Brand Light (Water Cyan)** | `#00AEEF` | Highlights, progress bars, water wave accents, badges | `bg-blue-light-500`, `text-blue-light-500`, `--color-blue-light-500` |
| **Pure White** | `#FFFFFF` | Background cards, button text, clean contrast surfaces | `bg-white`, `text-white`, `--color-white` |
| **Brand Dark / Slate** | `#101828` | Main body headings, dark backgrounds | `text-gray-900`, `dark:text-white`, `bg-gray-900` |
| **Brand Surface / Light** | `#F2F7FF` | Light blue-tinted card backgrounds, hover states | `bg-brand-25`, `bg-brand-50` |

### 1.2 Functional & Status Colors (from `ui_template`)
- **Success (Delivered, Paid, Active)**:
  - Background: `bg-success-50` / `dark:bg-success-900/20`
  - Text: `text-success-700` / `dark:text-success-400`
  - Border: `border-success-200` / `dark:border-success-800`
- **Warning (Pending, Overdue, In-Transit)**:
  - Background: `bg-orange-50` / `dark:bg-orange-900/20`
  - Text: `text-orange-700` / `dark:text-orange-400`
  - Border: `border-orange-200` / `dark:border-orange-800`
- **Error / Danger (Damaged, Cancelled, Offline, Tampered)**:
  - Background: `bg-error-50` / `dark:bg-error-900/20`
  - Text: `text-error-700` / `dark:text-error-400`
  - Border: `border-error-200` / `dark:border-error-800`
- **Info (Assigned, Draft, Refill)**:
  - Background: `bg-blue-light-50` / `dark:bg-blue-light-900/20`
  - Text: `text-blue-light-700` / `dark:text-blue-light-400`
  - Border: `border-blue-light-200` / `dark:border-blue-light-800`

---

## 2. NEXT.JS APP ROUTER COMPONENT ADAPTATION RULES

1. **Client vs Server Boundary**:
   - Components using hooks (`useState`, `useEffect`, `useContext`, `usePathname`, `useRouter`) must declare `'use client'` at the top.
   - Layout shells (`AppHeader`, `AppSidebar`, `UserDropdown`, `NotificationDropdown`) require `'use client'`.
   - Modals, drawers, and form input components require `'use client'`.
   - Pure presentational components (static Badges, Cards, Table layouts, Icons) can remain Server Components for maximum rendering performance.
2. **Dynamic SSR-Disabled Imports**:
   - Browser-dependent libraries (such as `react-apexcharts` and `flatpickr`) must be wrapped using `next/dynamic` with `{ ssr: false }` to prevent hydration mismatches:
   ```tsx
   import dynamic from "next/dynamic";
   const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
   const Flatpickr = dynamic(() => import("react-flatpickr"), { ssr: false });
   ```
3. **Navigation Links**:
   - Replace React Router `<Link to="...">` with Next.js `<Link href="...">` from `next/link`.
   - Replace React Router `useNavigate()` with Next.js `useRouter()` from `next/navigation`.
   - Replace `useLocation().pathname` with `usePathname()` from `next/navigation`.

---

## 3. CORE COMPONENT CATALOG & USAGE

All components reside in `src/components/` and are derived from `ui_template`:

### 3.1 Buttons (`src/components/ui/Button.tsx`)
```tsx
import Button from "@/components/ui/Button";

// Primary action (e.g. "Order Water", "Dispatch Delivery")
<Button size="md" variant="primary">Order Water</Button>

// Secondary action (e.g. "Cancel", "Filter")
<Button size="md" variant="outline">Filter Deliveries</Button>

// Danger action (e.g. "Report Tamper", "Deactivate User")
<Button size="sm" variant="danger">Deactivate</Button>
```

### 3.2 Status Badges (`src/components/ui/Badge.tsx`)
```tsx
import Badge from "@/components/ui/Badge";

// Delivery Status Badges
<Badge color="warning" size="sm">Pending</Badge>
<Badge color="info" size="sm">Out for Delivery</Badge>
<Badge color="success" size="sm">Delivered</Badge>
<Badge color="error" size="sm">Failed / Cancelled</Badge>

// Paystack & Payment Badges
<Badge color="success" size="sm">Paid (Paystack MoMo)</Badge>
<Badge color="warning" size="sm">Awaiting Payment</Badge>
```

### 3.3 Metric Cards (`src/components/dashboard/Metrics.tsx`)
Standard TailAdmin stat cards featuring:
- Icon container with light blue / brand background
- Big numeric value
- Subtitle / metric description
- Trend indicator badge (+12% vs last month)

### 3.4 Data Tables (`src/components/tables/`)
- Responsive table wrappers with horizontal scrolling on mobile.
- Sticky or cleanly styled headers (`bg-gray-50 dark:bg-gray-800/50`).
- Consistent padding (`px-4 py-3 sm:px-6 sm:py-4`).
- Integrated search bar, role filter dropdown, date-picker filter, and pagination at the footer.

### 3.5 Modals & Slide-overs (`src/components/ui/Modal.tsx`)
- Standard modal wrapper with backdrop, smooth entrance animation, escape key listener, and close button.
- Used for:
  - New Order Modal
  - Assign Driver Modal
  - Bottle Exchange Logging Modal
  - Apply for Dispenser Installment Modal
  - Report Dispenser Fault Modal
  - Add User Modal

### 3.6 Form Elements (`src/components/form/`)
- `Input`: with floating label, left/right icon slots, error message display.
- `Select`: accessible dropdown selection.
- `MultiSelect`: multi-checkbox dropdown.
- `DatePicker`: calendar date range selection via Flatpickr (`ssr: false`).
- `Switch`: toggles for active status, device online state, auto-refill triggers.

### 3.7 Progress Bars (`src/components/ui/Progressbar.tsx`)
- Used for:
  - Smart Dispenser Water Level (0% - 100% with color coding: Green > 50%, Orange 20-50%, Red < 20%)
  - Dispenser Installment Progress (`Amount Paid / Total Cost` %)
  - Referral Rewards Progress (e.g. `3 of 5 referrals completed towards next free bottle`)

---

## 4. ROLE-BASED DASHBOARD LAYOUTS (NEXT.JS)

The application implements tailored navigation and layouts based on user roles:

1. **Administrator / Manager Navigation**:
   - Sidebar with 5 main groups:
     - **Overview**: Dashboard, Operational Analytics
     - **Core Operations**: Orders, Deliveries, Bottle Inventory, Dispenser Inventory
     - **People & Fleet**: Customers, Drivers, Agents, Managers
     - **Finance & Growth**: Payments & Invoices, Dispenser Plans, Referrals & Rewards
     - **Hardware & System**: Smart Dispenser Trackers, Notifications, System Settings
2. **Customer Portal Navigation**:
   - Customer-centric sidebar / bottom-nav:
     - Dashboard / Home
     - Order Water / Refills
     - My Deliveries & Live Tracking
     - Dispenser Plans & Status
     - Referral & Free Bottles
     - Payment History & Invoices
     - Profile & Addresses
3. **Driver Portal (Mobile-First)**:
   - Optimized for touch screens and mobile browsers:
     - Today's Delivery Run
     - Assigned Orders & Navigation Links
     - Point-of-Delivery Bottle Exchange Tool
     - Payment Collection Logger
     - Delivery History
4. **Agent Portal**:
   - Agent Dashboard
   - Register New Customer
   - My Registered Customers
   - Referral Links & QR Code
   - Commission & Rewards
