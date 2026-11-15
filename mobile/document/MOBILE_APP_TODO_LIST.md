# F NET WATER HUB — MOBILE APPLICATION MASTER TO-DO LIST

> **Status Indicator Guide:**  
> - `[ ]` Pending  
> - `[/]` In Progress / Under Verification  
> - `[x]` Completed & Fully Verified  

---

## MODULE 1: MOBILE PROJECT FOUNDATIONS, TOOLING & REST API GATEWAY GROUNDWORK

### 1.1 Mobile Client Architecture & Tooling (React Native / Expo)
- [ ] Initialize Expo SDK 52+ project using blank TypeScript template.
- [ ] Configure `app.json` with app name (`F Net Water Hub`), bundle identifiers (`com.fnetwater.mobile`), and deep linking schemes (`fnetwater://`).
- [ ] Configure `@/*` path aliases in `tsconfig.json`.
- [ ] Install and configure **NativeWind v4** (Tailwind CSS for React Native):
  - [ ] Define brand color tokens in `tailwind.config.js`: Primary Blue (`#0057B8`), Light Blue (`#00AEEF`), Dark Slate (`#0F172A`), Pure White (`#FFFFFF`).
  - [ ] Configure typography scaling and font families.
- [ ] Install high-performance storage:
  - [ ] Configure `react-native-mmkv` for session tokens and user preferences.
  - [ ] Configure `expo-sqlite` for driver offline manifest sync storage.
- [ ] Install navigation and icons:
  - [ ] Configure `expo-router` v4 file-based routing.
  - [ ] Install `lucide-react-native` for clean SVG iconography.

### 1.2 REST API Gateway Client Layer (`src/services/`)
- [ ] Build unified API client (`src/services/apiClient.ts`):
  - [ ] Base URL configuration targeting Next.js server (`process.env.EXPO_PUBLIC_API_URL`).
  - [ ] Request interceptor: Automatically inject `Authorization: Bearer <accessToken>`.
  - [ ] Response interceptor: Detect `401 Unauthorized`, trigger token refresh via `/api/v1/mobile/auth/refresh-token`, and replay failed requests.
  - [ ] Network timeout and exponential backoff retry handler for flaky Ghanaian 3G/4G connections.
- [ ] Define shared TypeScript interfaces (`src/types/mobile.ts`) for:
  - [ ] `User`, `CustomerProfile`, `DriverProfile`, `AgentProfile`.
  - [ ] `Order`, `OrderItem`, `Delivery`, `BottleExchange`.
  - [ ] `Dispenser`, `DispenserPlan`, `ReferralReward`.
  - [ ] Standard API Response and Error envelopes.

### 1.3 Next.js Server-Side REST API Gateway Scaffolding
- [ ] Create `/src/app/api/v1/mobile/...` route hierarchy in the existing web repository.
- [ ] Implement JWT token generator and validator using `jose`:
  - [ ] Short-lived Access Token (15 minutes expiry) with role claims.
  - [ ] Long-lived Refresh Token (30 days expiry) stored in database.
- [ ] Implement mobile authorization guard middleware:
  - [ ] Bearer token extraction and cryptographic signature validation.
  - [ ] Role-Based Access Control (RBAC): Guard `/customer/*`, `/driver/*`, and `/agent/*`.
- [ ] Create standardized Zod input validation schemas for all mobile payloads.

### 1.4 Global State & App Providers (`app/_layout.tsx`)
- [ ] Setup `QueryClientProvider` (TanStack Query v5):
  - [ ] Configure 5-minute default stale time.
  - [ ] Setup offline mutation cache persistence.
- [ ] Setup `useAuthStore` (Zustand):
  - [ ] Manage user identity, role, active session, and biometric lock state.
- [ ] Setup `ThemeProvider`:
  - [ ] Enforce dark/light theme switching with zero screen flash.
- [ ] Setup Global Toast / Banner notification system for user feedback.

---

## MODULE 2: APP DEFAULT & UNIVERSAL CORE SCREENS (FIRST-TIME UX & SYSTEM SCREENS)

### 2.1 First-Time User Experience (FTUE) Screens
- [ ] **Screen S1: Native Animated Splash Screen (`app/index.tsx` & native splash)**
  - [ ] Display official F Net Water Hub logo with animated droplet pulse.
  - [ ] Check MMKV for existing refresh token.
  - [ ] Verify network connectivity status via NetInfo.
  - [ ] Auto-route to biometric lock, dashboard, or welcome screen.
- [ ] **Screen S2: Onboarding Walkthrough Carousel (`app/(public)/onboarding.tsx`)**
  - [ ] Slide 1: Pure mineral water refills delivered directly to your doorstep in Accra.
  - [ ] Slide 2: Smart Dispensers on Rent-to-Own plans with flexible Mobile Money installments.
  - [ ] Slide 3: Earn free water refills by referring neighbors and business colleagues.
  - [ ] Include "Skip" button and full-width "Get Started" primary CTA button.
  - [ ] Store first-launch flag in MMKV to prevent repeating for returning users.
- [ ] **Screen S3: Welcome Screen (`app/(public)/welcome.tsx`)**
  - [ ] Header banner with brand logo and water wave illustration.
  - [ ] Primary CTA: "Sign In / Register with Phone Number".
  - [ ] Secondary Action: "Browse Products as Guest".
  - [ ] Footer links: Terms of Service and Privacy Policy.

### 2.2 System Fallback & Network State Screens
- [ ] **Screen S4: Offline / No Connection Screen (`app/(public)/offline.tsx`)**
  - [ ] Clean illustration indicating lost cellular connection.
  - [ ] Headline: "No Internet Connection".
  - [ ] Subtext: "Please check your mobile data or Wi-Fi. We will reconnect automatically once your signal returns."
  - [ ] "Try Again" CTA button and background network change listener.
- [ ] **Screen S5: System Maintenance Screen (`app/(public)/maintenance.tsx`)**
  - [ ] Triggered when API returns `MAINTENANCE_MODE` status.
  - [ ] Expected return time display and emergency customer support hotline pill.
- [ ] **Screen S6: Force App Update Screen (`app/(public)/force-update.tsx`)**
  - [ ] Triggered when installed build version is below backend `minSupportedVersion`.
  - [ ] Primary CTA: Deep link to Apple App Store or Google Play Store listing.
- [ ] **Screen S7: 404 Route Not Found Screen (`app/+not-found.tsx`)**
  - [ ] Friendly fallback with "Return to Home" button.

---

## MODULE 3: AUTHENTICATION, SMS VERIFICATION & BIOMETRIC SECURITY

### 3.1 Progressive 2-Step Phone & SMS Verification
- [ ] **Screen A1: Phone Number Input Screen (`app/(auth)/phone-input.tsx`)**
  - [ ] Locked Ghana flag icon and `+233` country code prefix.
  - [ ] Numeric input formatting (`024 123 4567`).
  - [ ] Terms and Privacy acceptance checkbox.
  - [ ] Connect to `POST /api/v1/mobile/auth/request-otp`.
  - [ ] Handle rate limiting errors gracefully (e.g. "Too many requests. Please wait 15 minutes.").
- [ ] **Screen A2: 5-Box Digit SMS Verification Screen (`app/(auth)/verify-otp.tsx`)**
  - [ ] Navigation back link: "Change phone number".
  - [ ] Subtitle: "Enter the 5-digit verification code sent to +233 XX XXX XXXX".
  - [ ] **5-Box Digit Input Component:**
    - [ ] Exactly 5 high-contrast numeric boxes.
    - [ ] Auto-advance focus on digit entry.
    - [ ] Backspace focus shift to preceding box.
    - [ ] Clipboard paste handler: Auto-populates all 5 boxes when code is copied.
  - [ ] 60-second cooldown timer before activating "Resend Code via SMS".
  - [ ] Connect to `POST /api/v1/mobile/auth/verify-otp`.
  - [ ] Save issued `accessToken` and `refreshToken` in MMKV / Keychain.

### 3.2 Dynamic Role-Based Routing Resolver
- [ ] Build `RoleRouter` component:
  - [ ] Inspect user role claim in decoded JWT.
  - [ ] Route `CUSTOMER` -> `app/(customer)/(tabs)/index.tsx`.
  - [ ] Route `DRIVER` -> `app/(driver)/(tabs)/manifest.tsx`.
  - [ ] Route `AGENT` -> `app/(agent)/(tabs)/index.tsx`.

### 3.3 Biometric Enrollment & Lock Screens
- [ ] **Screen A3: Biometric Setup Opt-In Screen (`app/(auth)/biometric-setup.tsx`)**
  - [ ] Check device hardware via `expo-local-authentication`.
  - [ ] Prompt user: "Enable Face ID / Fingerprint for quick login".
  - [ ] Save biometric preference flag in secure storage.
- [ ] **Screen A4: Biometric Unlock Resume Screen (`app/(auth)/biometric-unlock.tsx`)**
  - [ ] Prompts biometric authentication upon app resume.
  - [ ] Fallback button: "Use SMS Verification Code".

---

## MODULE 4: LEGAL, COMPLIANCE & STORE REVIEW APPROVAL SCREENS

### 4.1 Mandatory Apple App Store & Google Play Screens
- [ ] **Screen L1: Terms of Service Screen (`app/(legal)/terms.tsx`)**
  - [ ] Section on water refill delivery policies and bottle deposit swap conditions.
  - [ ] Section on smart dispenser rent-to-own lease contracts and payment schedules.
  - [ ] Refund and bottle return policies in plain language.
- [ ] **Screen L2: Privacy Policy Screen (`app/(legal)/privacy.tsx`)**
  - [ ] Explicit disclosure of data collected (phone, GPS location, Ghana Digital Address, photos).
  - [ ] Third-party disclosure (Paystack for PCI-DSS compliant payments, mNotify for SMS).
  - [ ] Data retention and security safeguards.
- [ ] **Screen L3: Account Deletion Screen (`app/(legal)/delete-account.tsx`) — Mandatory for Apple 5.1.1(v)**
  - [ ] Prominently accessible from Customer Profile settings.
  - [ ] Explanation of permanent data deletion (order history, free bottle referral balance).
  - [ ] 2-step confirmation with SMS OTP verification before purging account.
  - [ ] Connect to `DELETE /api/v1/mobile/customer/account`.
- [ ] **Screen L4: Permissions Disclosures & Pre-Prompt Dialogs (`src/components/modals/`)**
  - [ ] **Location Pre-Prompt:** Explains that location is needed to pin delivery addresses and calculate delivery fees.
  - [ ] **Camera Pre-Prompt:** Explains that camera is needed for driver proof-of-delivery photos and dispenser barcode scans.
  - [ ] **Notification Pre-Prompt:** Explains that notifications provide real-time driver tracking and water level reminders.
- [ ] **Screen L5: About FNet Water Hub & Licenses (`app/(legal)/about.tsx`)**
  - [ ] Display app version, build number, support contact, and open-source credits.

---

## MODULE 5: CUSTOMER MODULE — WATER ORDERING & PAYSTACK MOMO CHECKOUT

### 5.1 Customer Home Dashboard
- [ ] **Screen C1: Customer Home Dashboard (`app/(customer)/(tabs)/index.tsx`)**
  - [ ] Top bar: Location selector pill ("East Legon, GA-183-9021"), notification bell, profile avatar.
  - [ ] Active order hero card (visible when an order is in progress with live status stepper).
  - [ ] Quick 1-tap re-order widget pre-filling previous order items.
  - [ ] Dispenser Rent-to-Own Radial progress widget.
  - [ ] Referral perk meter: "Refer 2 more friends to earn 1 free refill".

### 5.2 Product Catalog & Ordering Flow
- [ ] **Screen C2: Water Order & Bottle Return Selector (`app/(customer)/order.tsx`)**
  - [ ] Product list fetched from `GET /api/v1/mobile/customer/products`.
  - [ ] Refillable 19L bottle item card with quantity stepper `[-] 2 [+]`.
  - [ ] Takeaway bottled water packs (500ml / 750ml).
  - [ ] **Empty Bottle Return Toggle (Plain Language Standard):**
    - [ ] Option 1: *"I am returning empty bottles"* -> Deposit fee: `GH₵ 0.00`.
    - [ ] Option 2: *"I do not have empty bottles to return"* -> Adds `GH₵ 35.00` deposit per bottle.
  - [ ] Free bottle credit redemption toggle (deducts GH₵ 18.00 if balance > 0).
- [ ] **Screen C3: Delivery Address & Time Slot Selector (`app/(customer)/address-picker.tsx`)**
  - [ ] Saved addresses dropdown with default address indicator.
  - [ ] "Add New Address with GPS" button.
  - [ ] Ghana Digital Address input with regex validation (`^[A-Z]{2}-\d{3,4}-\d{4}$`).
  - [ ] Time slot selector: Morning (8 AM - 12 PM) vs. Afternoon (1 PM - 5 PM).
  - [ ] Gate & landmark instructions text field.

### 5.3 Checkout & Paystack Mobile Money Integration
- [ ] **Screen C4: Checkout & Payment Modal (`app/(customer)/checkout.tsx`)**
  - [ ] Order summary breakdown: Water Refills, Bottle Deposits, Referral Credit, Delivery Fee.
  - [ ] Total payable amount in GH₵.
  - [ ] Payment method selector: Mobile Money (MTN, Telecel, AirtelTigo), Cards, Cash on Delivery.
  - [ ] Connect to `POST /api/v1/mobile/customer/orders` to create order.
  - [ ] Connect to `POST /api/v1/mobile/customer/orders/:id/pay` to initiate Paystack prompt.
- [ ] **Screen C5: Order Confirmation & Receipt (`app/(customer)/order-success.tsx`)**
  - [ ] Celebration animation with order number (`#FNW-2026-1042`).
  - [ ] Expected delivery window display.
  - [ ] CTA: "Track Driver in Real Time".

---

## MODULE 6: CUSTOMER MODULE — TRACKING, DISPENSERS & REWARDS HUB

### 6.1 Live Order Tracking
- [ ] **Screen C6: Live Delivery Tracking Screen (`app/(customer)/track-order.tsx`)**
  - [ ] Real-time progress stepper: Order Placed -> Driver Assigned -> Out for Delivery -> Delivered.
  - [ ] Driver identity card: Driver name, vehicle plate number, van photo.
  - [ ] Tap-to-call button triggering native phone dialer.
  - [ ] Map view showing driver's live GPS coordinates.

### 6.2 Dispenser Rent-to-Own Hub
- [ ] **Screen C7: Dispenser Rent-to-Own Hub (`app/(customer)/(tabs)/dispenser.tsx`)**
  - [ ] Smart water level wave animation gauge (e.g. `75% remaining`).
  - [ ] IoT connection indicator ("Connected Online").
  - [ ] Rent-to-Own financial breakdown: Total cost (GH₵ 1,800.00), amount paid, balance remaining.
  - [ ] Next monthly installment due date and amount (`GH₵ 150.00`).
  - [ ] CTA: "Pay Next Installment via MoMo".
  - [ ] "Report Dispenser Fault" form with photo upload.

### 6.3 Referral Rewards Hub & Order History
- [ ] **Screen C8: Referral Rewards Hub (`app/(customer)/(tabs)/rewards.tsx`)**
  - [ ] Personal referral code with 1-tap copy button (`FNET-KWAME-88`).
  - [ ] WhatsApp share button with pre-filled promotional message.
  - [ ] Full-screen high-contrast QR code for instant scanning.
  - [ ] Free bottle progress meter: Shows progress toward 5 qualified referrals.
  - [ ] Referral activity ledger with referee names and reward credit status.
- [ ] **Screen C9: Order History & Receipts (`app/(customer)/(tabs)/history.tsx`)**
  - [ ] List of past orders with dates, bottle counts, and payment status badges.
  - [ ] View detailed order receipt modal.
- [ ] **Screen C10: Saved Addresses Manager (`app/(customer)/(tabs)/profile.tsx`)**
  - [ ] CRUD interface for delivery addresses with default selection.

---

## MODULE 7: DELIVERY DRIVER MODULE — MANIFEST, NAVIGATION & BOTTLE EXCHANGE

### 7.1 Shift Start & Delivery Manifest
- [ ] **Screen D1: Shift Start & Vehicle Checklist (`app/(driver)/shift-start.tsx`)**
  - [ ] Vehicle selection and plate number verification (`GT-4281-24`).
  - [ ] Initial filled bottle inventory confirmation.
  - [ ] Duty switch: "Start Shift" activates background GPS telemetry.
- [ ] **Screen D2: Today's Delivery Manifest Queue (`app/(driver)/(tabs)/manifest.tsx`)**
  - [ ] Stop cards sorted in optimal sequence.
  - [ ] Card details: Stop #, customer name, area, Ghana Digital Address, items to deliver.
  - [ ] Payment status pill: `Paid via Mobile Money` or `Collect GH₵ 36.00 Cash`.
  - [ ] Tap-to-call customer button on each card.
  - [ ] Offline sync indicator banner when cellular reception is unavailable.

### 7.2 Native Navigation & Bottle Exchange
- [ ] **Screen D3: Stop Details & Native Navigation (`app/(driver)/stop-detail.tsx`)**
  - [ ] "Navigate" CTA: Launches Google Maps, Apple Maps, or Waze using native intent.
  - [ ] "Start Delivery" button: Sets status to `OUT_FOR_DELIVERY` and sends customer SMS.
- [ ] **Screen D4: Bottle Exchange & Proof of Delivery Modal (`app/(driver)/exchange-modal.tsx`)**
  - [ ] Large touch steppers strictly adhering to Plain Language Standards:
    - [ ] **Bottles Delivered** (`[-] 2 [+]`)
    - [ ] **Empty Bottles Collected** (`[-] 2 [+]`)
    - [ ] **Damaged Bottles** (`[-] 0 [+]`)
  - [ ] Cash collection confirmation checkbox (for cash-on-delivery orders).
  - [ ] Camera module: Capture delivery photo compressed locally to $<300\text{KB}$.
  - [ ] Customer screen signature pad.
  - [ ] "Complete Delivery" button commits to server or queues in local SQLite if offline.

### 7.3 Van Stock & Offline Sync Engine
- [ ] **Screen D5: Van Stock & Shift Reconciliation (`app/(driver)/(tabs)/van-stock.tsx`)**
  - [ ] Live van inventory: Morning stock, delivered, empties collected, damaged bottles.
  - [ ] Cash collected in hand ledger.
  - [ ] "Submit Shift Handover" generates QR code for warehouse check-in.
- [ ] **Offline Sync Background Engine (`src/services/offlineSync.ts`):**
  - [ ] SQLite `sync_queue` table storing delivery actions when offline.
  - [ ] NetInfo listener triggering automated FIFO queue replay when 4G/WiFi is restored.

---

## MODULE 8: FIELD SALES AGENT MODULE — ONBOARDING, QR SHARING & COMMISSION WALLET

### 8.1 Agent Dashboard & Fast Onboarding
- [ ] **Screen G1: Agent Performance Dashboard (`app/(agent)/(tabs)/index.tsx`)**
  - [ ] Agent code (`AGT-ACC-012`) and available commission balance.
  - [ ] RadialBar target gauge: Monthly customer acquisition quota (e.g. `22 of 30 Customers`).
  - [ ] Recent commissions feed (+GH₵ 3.00 per refill, +GH₵ 50.00 per dispenser plan).
- [ ] **Screen G2: 60-Second Fast Customer Onboarding (`app/(agent)/(tabs)/onboard.tsx`)**
  - [ ] Customer full name and phone number input with instant duplicate check.
  - [ ] Ghana Card number input with format regex (`GHA-XXXXXXXXX-X`).
  - [ ] "Capture GPS Pin" button (records device latitude/longitude).
  - [ ] Ghana Digital Address input (`GA-492-1082`) and landmark notes.
  - [ ] First order toggle: Schedule initial 19L refill order immediately.
  - [ ] Primary CTA: "Register Customer and Activate Account".

### 8.2 Dynamic QR Sharing & Commission Wallet
- [ ] **Screen G3: Dynamic Referral QR Code Display (`app/(agent)/qr-share.tsx`)**
  - [ ] Full-screen high-contrast QR code pre-filled with agent's referral link.
  - [ ] "Share on WhatsApp" button with pre-written marketing copy.
- [ ] **Screen G4: Commission Wallet & Payout (`app/(agent)/(tabs)/wallet.tsx`)**
  - [ ] Available balance vs lifetime earnings summary cards.
  - [ ] Withdrawal form: Amount input, Mobile Money network selector (MTN, Telecel, AirtelTigo), MoMo number.
  - [ ] Connect to `POST /api/v1/mobile/agent/wallet/withdraw` (Paystack Transfer payout).
  - [ ] Itemized earnings and withdrawal transaction ledger.
- [ ] **Screen G5: Acquired Customers Directory (`app/(agent)/(tabs)/customers.tsx`)**
  - [ ] Directory of all registered clients with last order date.
  - [ ] "Send Re-order Reminder" tap-to-call or SMS nudge.

---

## MODULE 9: BACKEND NEXT.JS REST API GATEWAY IMPLEMENTATION

### 9.1 Authentication & Session API Routes (`/src/app/api/v1/mobile/auth/`)
- [ ] `POST /api/v1/mobile/auth/request-otp` — Generates 5-digit code, saves to `OtpVerification`, dispatches mNotify SMS.
- [ ] `POST /api/v1/mobile/auth/verify-otp` — Validates code, retrieves user & role, returns JWT access and refresh token pair.
- [ ] `POST /api/v1/mobile/auth/refresh-token` — Rotates tokens, issues new JWT pair.
- [ ] `POST /api/v1/mobile/auth/logout` — Invalidates active refresh token.
- [ ] `GET  /api/v1/mobile/auth/me` — Returns authenticated user profile and role details.

### 9.2 Customer API Routes (`/src/app/api/v1/mobile/customer/`)
- [ ] `GET  /api/v1/mobile/customer/home` — Returns active orders, dispenser status, and rewards summary.
- [ ] `GET  /api/v1/mobile/customer/products` — Returns product catalog with prices in GH₵.
- [ ] `POST /api/v1/mobile/customer/orders` — Creates order with bottle deposit and referral credit logic.
- [ ] `GET  /api/v1/mobile/customer/orders` — Returns paginated order history.
- [ ] `GET  /api/v1/mobile/customer/orders/:id` — Returns single order details and delivery status.
- [ ] `POST /api/v1/mobile/customer/orders/:id/pay` — Initiates Paystack Mobile Money prompt.
- [ ] `GET  /api/v1/mobile/customer/addresses` — Returns customer saved delivery addresses.
- [ ] `POST /api/v1/mobile/customer/addresses` — Saves new delivery address with GPS coordinates.
- [ ] `PUT  /api/v1/mobile/customer/addresses/:id` — Updates existing delivery address.
- [ ] `DELETE /api/v1/mobile/customer/addresses/:id` — Deletes delivery address.
- [ ] `GET  /api/v1/mobile/customer/dispenser` — Returns dispenser IoT status and rent-to-own breakdown.
- [ ] `POST /api/v1/mobile/customer/dispenser/installment-pay` — Processes dispenser installment payment.
- [ ] `POST /api/v1/mobile/customer/dispenser/report-issue` — Creates maintenance fault ticket.
- [ ] `GET  /api/v1/mobile/customer/rewards` — Returns referral code, referee list, and free bottle credit balance.
- [ ] `DELETE /api/v1/mobile/customer/account` — Deactivates account and purges personal data (Apple 5.1.1 compliance).

### 9.3 Driver API Routes (`/src/app/api/v1/mobile/driver/`)
- [ ] `GET  /api/v1/mobile/driver/manifest/today` — Returns ordered delivery stops for driver's shift.
- [ ] `POST /api/v1/mobile/driver/deliveries/:id/start` — Updates status to `OUT_FOR_DELIVERY` and sends customer SMS.
- [ ] `POST /api/v1/mobile/driver/deliveries/:id/complete` — Logs bottle exchange (Delivered, Collected, Damaged), cash, and POD photo.
- [ ] `POST /api/v1/mobile/driver/telemetry` — Saves periodic driver GPS location pings.
- [ ] `GET  /api/v1/mobile/driver/vehicle/stock` — Returns live van inventory balance.
- [ ] `POST /api/v1/mobile/driver/shift/reconciliation` — Commits end-of-shift handover summary.

### 9.4 Agent API Routes (`/src/app/api/v1/mobile/agent/`)
- [ ] `GET  /api/v1/mobile/agent/dashboard` — Returns monthly quota, customer count, and wallet balance.
- [ ] `POST /api/v1/mobile/agent/onboard-customer` — Creates customer profile with Ghana Card and GPS coordinates.
- [ ] `GET  /api/v1/mobile/agent/customers` — Returns list of onboarded clients.
- [ ] `POST /api/v1/mobile/agent/wallet/withdraw` — Initiates Paystack Transfer to agent's Mobile Money wallet.

### 9.5 Shared Device API Routes (`/src/app/api/v1/mobile/device/`)
- [ ] `POST /api/v1/mobile/device/register-push` — Registers FCM / APNs device token.
- [ ] `POST /api/v1/mobile/device/upload-asset` — Handles multipart upload for POD photos.
- [ ] `GET  /api/v1/mobile/device/app-config` — Returns minimum supported build version and maintenance flag.

---

## MODULE 10: APP STORE & GOOGLE PLAY STORE PACKAGING, COMPLIANCE & RELEASE

### 10.1 App Assets & Visual Branding
- [ ] Generate 1024x1024px official app store icon (PNG, no transparency).
- [ ] Generate Android adaptive icon layers (foreground icon + `#0057B8` background).
- [ ] Capture high-resolution screenshots across standard device viewports:
  - [ ] 6.7" iPhone (iPhone 15 Pro Max) — 5 screenshots.
  - [ ] 6.5" iPhone (iPhone 11 Pro Max / XS Max) — 5 screenshots.
  - [ ] Android Phone (1080x2400px) — 5 screenshots.

### 10.2 EAS Build & Binary Generation
- [ ] Configure `eas.json` with build profiles: `development`, `preview`, `production`.
- [ ] Run `eas build --platform ios --profile production` to generate signed `.ipa`.
- [ ] Run `eas build --platform android --profile production` to generate signed `.aab`.
- [ ] Configure Expo EAS Update for over-the-air hotfixes.

### 10.3 Apple App Store Compliance & Review Preparation
- [ ] Provide reviewer test phone numbers with static OTPs (`84920`) in App Store Connect review notes.
- [ ] Verify in-app account deletion flow is fully functional (Guideline 5.1.1(v)).
- [ ] Complete App Privacy details declaring data types collected (Contact Info, Location, User Content).
- [ ] Submit for TestFlight external testing, followed by App Store review submission.

### 10.4 Google Play Store Compliance & Review Preparation
- [ ] Complete Google Play Data Safety form declaring collected data (Location, Phone, Photos).
- [ ] Target Android 14 (API level 34+).
- [ ] Provide prominent background location disclosure video for driver route tracking.
- [ ] Deploy to Google Play Internal Testing track, followed by Production track submission.

---

*This document serves as the master checklist for the F Net Water Hub Mobile Application development lifecycle.*
