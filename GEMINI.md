# F NET WATER HUB — ACTIVE AGENT DIRECTIVE & CONTRACT

This file is automatically loaded by Antigravity and binds all coding, design, and architecture decisions in this repository.

---

## NON-NEGOTIABLE CORE CONTRACT

1. **Absolute Fidelity to `ui_template`**:
   - Never invent arbitrary layouts, flat card slabs, or custom UI patterns.
   - Always derive screens directly from verified archetypes in `ui_template`:
     - **Auth screens**: Must use `AuthPageLayout` (split-screen with left form, right dark brand panel with `GridShape`, floating theme toggle).
     - **Executive/Admin dashboards**: Must use `Ecommerce.tsx` archetype (4 KPI `EcommerceMetrics` cards with SVG icons and trend badges, 7/5 col split with bar chart and radial gauge, full-width area chart, high-fidelity table).
     - **Logistics/Operations dashboards**: Must use `Logistics.tsx` archetype (`LogisticsMetrics`, `DeliveryStatisticsChart`, `DeliveryVehicle` fleet cards, dispatch queue table).
     - **Customer portal**: Must use personal KPI cards, monthly consumption bar chart, rent-to-own radial gauge, and re-order table.

2. **Mandatory Rich Data Visualizations (No Flat Text or Lone Bars)**:
   - Always use rich, responsive **ApexCharts** (`react-apexcharts` loaded via `next/dynamic` with `ssr: false`):
     - **RadialBar Gauge**: Mandatory for targets, goals, quota completion, and dispenser rent-to-own payoff progress.
     - **Smooth Area/Line Chart**: Mandatory for daily/weekly revenue trends and temporal metrics.
     - **Bar/Column Chart**: Mandatory for monthly sales volume, delivery comparisons, and consumption histories.
     - **Donut/Pie Chart**: Mandatory for category distributions.
   - Lone progress bars are reserved strictly for small in-card inline progress (like 1-line table cell indicators), never as the hero visualization of a dashboard section.

3. **Strict Ban on Vendor & Developer Jargon in End-User UI**:
   - NEVER display internal vendor names, database terms, or developer acronyms anywhere in customer or staff-facing UI:
     - Banned in UI: `mNotify`, `mNotify SMS OTP`, `Paystack`, `Prisma`, `Docker`, `Docker Desktop`, `NextAuth`, `NextAuth.js`, `PostgreSQL`, `JWT`, `bcrypt`.
     - Required: **"SMS Code"** / **"Verification Code"**, **"Mobile Money"**, **"Phone Number"**, **"Email or Phone Number"**, **"Password"**.

4. **Plain, Natural Language (Non-Technical End-User Standard)**:
   - Target audience is everyday Ghanaian consumers, small business operators, and van drivers. Never write UI copy like a developer or engineer.
   - Strictly Banned Robotic Terms:
     - `1:1 swap` / `1:1 bottle swap` -> Use **"Bottle exchange"**, **"Returning empties"**, or **"Empty bottle return"**.
     - `Complete Delivery & 1:1 Swap` -> Use **"Complete Delivery"**.
     - `Handover` / `Point-of-Delivery Handover` -> Use **"Delivery Details"** or **"Complete Delivery"**.
     - `Filled 19L Handed Over` -> Use **"Bottles Delivered"**.
     - `Empty 19L Returned` -> Use **"Empty Bottles Collected"**.
     - `Damaged / Broken Bottles` -> Use **"Damaged Bottles"**.
     - `Pending Allocation` / `Dispatch Allocation` -> Use **"Unassigned Orders"** or **"Awaiting Driver Assignment"**.
     - `Remittance` -> Use **"Cash Collected"** or **"Cash to Collect"**.
     - `Dual Stock` -> Use **"Returns"** or **"Stock Level"**.
   - Zero raw HTML entities in buttons or labels (`&check;`, `&rarr;`, `&times;`). Always use clean, responsive SVGs.

5. **Progressive Multi-Step UX Standard**:
   - Never combine distinct interaction phases into a single cluttered card.
   - Multi-phase flows (SMS login, checkout, registration, password reset) must progress through sequential, dedicated steps:
     - Step 1: Input (e.g. Phone Number) $\rightarrow$ Action ("Send Code").
     - Step 2: Verification $\rightarrow$ Dedicated step displaying *"Enter the 5-digit code sent to [phone]"* with clear back navigation (*"← Change number"*).
   - All security codes must use the **5-Box Digit Input Standard** with auto-advance, backspace focus shifting, and full clipboard paste handling.

6. **Anti-Slop Craftsmanship**:
   - Zero AI buzzwords (`unlock`, `elevate`, `empower`, `seamless`, `cutting-edge`, `revolutionary`, `robust`, `delve`, `game-changer`, `testament`).
   - Zero em dashes (`—`) in UI copy or descriptions. Use commas, periods, colons, or parentheses instead.
   - Zero cluttered card bombardments: maximum 1 sentence for card descriptions. Cards must hold real, actionable operational data.
   - Zero table horizontal scrolling: all tables must be neatly balanced and responsive.
   - Zero theme transition glitches: `disableTransitionOnChange` mandatory on `<ThemeProvider>`.

7. **Self-Verification Before Handover**:
   - Always run `npx.cmd tsc --noEmit` and verify zero errors before reporting completion.
   - Test modified routes and ensure clean HTTP 200 responses with zero hydration errors.
