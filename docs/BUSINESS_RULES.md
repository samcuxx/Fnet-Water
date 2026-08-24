# F Net Water Hub — Business Rules, RBAC Matrix, and Assumptions

Implementation reference for §29 of [`FNET_WATER_HUB_REQUIREMENTS.md`](./FNET_WATER_HUB_REQUIREMENTS.md), plus the authorization matrix, the operations that require database transactions, and the ambiguities that needed a decision.

Where the requirements leave a number or a policy open, the value is stored in `SystemSetting` and editable by an administrator rather than compiled into the code.

---

## 1. Configurable business values

Held in the `SystemSetting` table, seeded with these defaults, changeable without a deployment.

| Key | Default | Meaning |
| --- | --- | --- |
| `referral.successful_required_for_reward` | `5` | Successful referrals that earn one reward. |
| `referral.reward_product_sku` | `RB-18L` | Product issued as the free-bottle reward. |
| `referral.qualifying_min_order_total` | `0.00` | Minimum paid order total for a referral to qualify. |
| `bottle.shortage_charge_per_unit` | `80.00` | Charge applied per unreturned refillable bottle when management converts a shortage. |
| `bottle.shortage_grace_days` | `14` | Days before an outstanding shortage is flagged for follow-up. |
| `bottle.auto_charge_shortage` | `false` | Whether a shortage becomes a charge automatically. Default off — staff decide. |
| `order.cancellation_allowed_statuses` | `["PENDING","CONFIRMED","PROCESSING"]` | Statuses a customer may self-cancel from. |
| `order.default_delivery_fee` | `0.00` | Delivery fee applied to new orders. |
| `dispenser.installment_frequency_default` | `MONTHLY` | Default installment cadence. |
| `dispenser.overdue_grace_days` | `3` | Days past due before an installment is marked overdue. |
| `dispenser.due_soon_days` | `5` | Lead time for the "Due Soon" state. |
| `dispenser.ownership_requires_approval` | `true` | Whether ownership transfer needs explicit staff approval after full payment. |
| `inventory.adjustment_admin_threshold` | `50` | Adjustment magnitude above which administrator authorization is required. |
| `inventory.low_stock_threshold` | `100` | Filled-bottle level that raises a manager alert. |
| `payment.cod_enabled` | `true` | Whether cash-on-delivery may be selected. |
| `tracker.low_water_level_percent` | `20` | Water level that raises a tracker alert. |

---

## 2. Refillable bottle exchange (§29.1, §29.2, §8)

A refillable order is an exchange, not a sale of the container.

**Expected return** = sum of `quantity` over order items whose product has `requiresBottleExchange = true`. Recorded on the order at placement as `expectedEmptyBottles`.

At delivery the driver records: `bottlesDelivered`, `emptyBottlesCollected`, `damagedBottlesReturned`, and remarks.

```
shortage = expectedEmptyBottles − emptyBottlesCollected − damagedBottlesReturned
```

- `shortage > 0` → a `CustomerBottleLedger` entry of type `SHORTAGE_RECORDED` is appended and `CustomerBottleBalance.outstandingShortage` increases by that amount.
- `shortage < 0` (customer returned more than expected, e.g. clearing an old debt) → the surplus reduces any existing outstanding shortage, never below zero. Any remainder beyond the outstanding balance is recorded as `ADJUSTMENT` and flagged for manager review rather than silently discarded.
- Damaged returns count as *returned* for the customer's obligation but move to `DAMAGED` stock, not to available stock.

A shortage **persists after delivery**. It is closed only by one of:

| Resolution | Ledger type | Who |
| --- | --- | --- |
| Customer returns the bottle later | `RETURNED` | Driver or staff |
| Converted to a monetary charge | `CHARGED` | Manager or administrator |
| Written off | `WRITTEN_OFF` | Administrator only |
| Corrected clerical error | `ADJUSTMENT` | Manager or administrator, reason required |

`CustomerBottleLedger` is append-only. `CustomerBottleBalance` is a locked, materialized cache of it. Every resolution writes an `AuditLog` entry.

**Take-away bottles** (§9) carry `requiresBottleExchange = false`; ownership passes to the customer, so they create no return obligation and no shortage.

---

## 3. Bottle movement and the inventory ledger (§29.3, §14)

Canonical lifecycle:

```
FILLED_WAREHOUSE → ASSIGNED_TO_DRIVER → IN_TRANSIT → WITH_CUSTOMER
                                                          │
                        EMPTY_WAREHOUSE ←── empty collected┘
```

Terminal or exceptional states: `DAMAGED`, `LOST`, `UNDER_INVESTIGATION`.

Every stock change appends an `InventoryMovement` (append-only) and adjusts the corresponding `BottleStockPosition` rows inside the same transaction. Movement types: `FILLED_DISPATCHED`, `FILLED_DELIVERED`, `EMPTY_COLLECTED`, `EMPTY_RETURNED`, `BOTTLE_DAMAGED`, `BOTTLE_LOST`, `MOVED_TO_CUSTOMER`, `RETURNED_FROM_CUSTOMER`, `REFILL_PRODUCTION`, `FAILED_DELIVERY_RETURN`, `ADJUSTMENT`.

A movement that would drive a position negative is **rejected**. It is not clamped to zero, because clamping hides the underlying error.

### Driver responsibility (§29.4)

Drivers may record: bottles received for delivery, bottles delivered, empty bottles collected, damaged bottles, and missing bottles. Drivers hold no `inventory:adjust` permission and cannot alter aggregate stock directly.

### Manual adjustment (§29.17)

An adjustment always records item, previous quantity, new quantity, delta, reason, responsible user, and timestamp, as an `InventoryAdjustment` row plus an `AuditLog` entry. Adjustments with `|delta| > inventory.adjustment_admin_threshold` require administrator authorization; a manager's request is stored as `PENDING_APPROVAL` until an administrator approves it.

### Damaged and lost bottles (§29.18, §29.19)

Damaged bottles move to `DAMAGED` and leave available stock. Lost bottles move to `LOST` and leave operational inventory entirely, retaining links to the related customer, driver, and transaction where known.

---

## 4. Orders (§7, §29.7)

Legal status transitions — anything else is rejected by the service layer:

| From | Allowed next |
| --- | --- |
| `PENDING` | `CONFIRMED`, `CANCELLED` |
| `CONFIRMED` | `PROCESSING`, `CANCELLED` |
| `PROCESSING` | `ASSIGNED`, `CANCELLED` |
| `ASSIGNED` | `OUT_FOR_DELIVERY`, `CANCELLED` (staff only), `FAILED` |
| `OUT_FOR_DELIVERY` | `DELIVERED`, `FAILED` |
| `FAILED` | `ASSIGNED` (re-attempt), `CANCELLED` |
| `DELIVERED` | *terminal* |
| `CANCELLED` | *terminal* |

- A customer may self-cancel only while the status is in `order.cancellation_allowed_statuses`.
- Once assigned to a driver, cancellation requires staff action (`order:cancel:any`).
- `DELIVERED` orders can never be cancelled. A post-delivery correction is a refund or an adjustment, not a cancellation.
- Every transition appends an `OrderStatusHistory` row with actor and reason.

Order totals:

```
lineTotal = unitPrice × quantity           (Decimal, per item)
subtotal  = Σ lineTotal
total     = subtotal + deliveryFee − discountTotal
```

Unit prices are **copied onto the order item** at placement, so a later price change never rewrites historical orders. `total` is never allowed below zero.

---

## 5. Deliveries (§10, §13, §29.5, §29.6)

An order may have multiple delivery attempts; each `Delivery` carries an `attemptNumber`. Statuses: `PENDING`, `ASSIGNED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`, `CANCELLED`.

### Completion (§29.6)

A delivery reaches `DELIVERED` only when the required operational data is recorded: quantity delivered, empty bottles collected (for exchange orders), payment collected (when COD), any shortage, and remarks. In one transaction, completion:

1. Validates the status transition and the driver's assignment.
2. Records bottles delivered / collected / damaged.
3. Computes and records any shortage against the customer's balance.
4. Appends the inventory movements.
5. Records the COD payment when applicable.
6. Sets the order to `DELIVERED` and updates its payment status.
7. Evaluates referral qualification for the customer's first paid order.
8. Queues notifications and writes the audit entry.

### Failure (§29.5)

A failed delivery is **not a sale**. A reason is mandatory: `CUSTOMER_UNAVAILABLE`, `CUSTOMER_CANCELLED`, `INCORRECT_LOCATION`, `UNABLE_TO_CONTACT`, `VEHICLE_PROBLEM`, `PAYMENT_ISSUE`, `INSUFFICIENT_STOCK`, `OTHER` (free-text required).

Stock stays with the driver (`ASSIGNED_TO_DRIVER`) and the delivery is marked `requiresReconciliation = true`. It leaves that state only when a manager reconciles it — returning goods to the warehouse via `FAILED_DELIVERY_RETURN`, or authorizing a re-attempt. Unreconciled failed deliveries surface as a manager alert. No revenue is recognized.

---

## 6. Payments (§18, §29.8, §29.9)

`Payment` records intent and outcome; `PaymentTransaction` is the append-only ledger under it. Effective value of a payment = Σ of its transactions.

| Transaction type | Sign | Effect |
| --- | --- | --- |
| `PAYMENT` | `+` | Money received |
| `REVERSAL` | `−` | Cancels a mistaken or failed payment |
| `REFUND` | `−` | Returns money to the customer |
| `ADJUSTMENT` | `±` | Authorized correction, reason required |

Rules:

- **Nothing financial is deleted or edited in place** (§29.9). Corrections append compensating transactions.
- Reversal and refund require `payment:reverse` / `payment:refund` — manager or administrator only — plus a reason, and always write an `AuditLog` entry.
- A `SUCCESSFUL` payment cannot be reversed twice; the guard is a conditional status update, so a concurrent second attempt updates zero rows and fails.
- Provider callbacks are idempotent on `providerReference`.

### Cash-on-delivery (§29.8)

The driver records amount collected against the customer and order. The transaction stores `collectedByUserId` and the timestamp. The payment enters `PENDING_RECONCILIATION`; a manager or administrator reconciles it into `SUCCESSFUL`. Drivers hold no permission to modify a historical payment.

---

## 7. Dispensers and installments (§15, §16, §29.10–29.12)

**Physical status and ownership are separate columns.** Installing a dispenser at a customer's premises transfers no ownership.

Physical status: `AVAILABLE`, `RESERVED`, `INSTALLED`, `UNDER_MAINTENANCE`, `FAULTY`, `RETRIEVED`, `RETIRED`.
Ownership: `COMPANY_OWNED`, `COMPANY_OWNED_INSTALLMENT`, `CUSTOMER_OWNED`.

Plan statuses: `PENDING`, `ACTIVE`, `DUE_SOON`, `OVERDUE`, `FULLY_PAID`, `SUSPENDED`, `DEFAULTED`, `CANCELLED`.

A plan carries total cost, initial payment, installment amount, frequency, schedule, amount paid, outstanding balance, next payment date, and status. The schedule is generated as explicit `DispenserInstallment` rows so each due date has its own state and history.

```
outstandingBalance = totalCost − initialPayment − Σ (paid installment amounts)
```

Recomputed from the payment ledger inside the paying transaction, never incremented blindly.

### Overdue (§29.11)

Past due date + `dispenser.overdue_grace_days` → the installment becomes `OVERDUE`, `overdueDays` is recorded, the customer and the manager are notified, and the outstanding balance stands. **An overdue payment never deletes the plan.** Penalties, retrieval, and enforcement remain management decisions taken through the UI.

### Ownership transfer (§29.12)

Reaching a zero balance sets the plan to `FULLY_PAID` and marks it eligible. When `dispenser.ownership_requires_approval` is `true` (the default), ownership changes to `CUSTOMER_OWNED` only after a user with `dispenser:transfer-ownership` approves it. The requirements say ownership transfers "according to the company's policy" and after "the required approval", so the system will not transfer an asset on arithmetic alone. The transfer records the approving user and writes an audit entry.

---

## 8. Referrals and rewards (§19, §21, §29.13–29.16)

Every customer gets a unique referral code and a shareable link.

A `Referral` becomes `QUALIFIED` only when all three hold (§29.13):

1. The referred customer has registered.
2. They have placed a qualifying order (total ≥ `referral.qualifying_min_order_total`).
3. That order's payment is complete.

Qualification is evaluated when a payment completes, inside that transaction. A unique constraint on `referredCustomerId` makes a customer count once, permanently.

### Earning (§29.14)

On each qualification the referrer's qualified count is recomputed and

```
rewardsEarned = floor(qualifiedReferrals / referral.successful_required_for_reward)
```

Any newly crossed threshold appends an `EARNED` entry to `RewardLedger`. The threshold is read from settings, so "5 referrals = 1 bottle" is data, not a constant buried in code.

### Redemption (§29.15)

`available = Σ EARNED − Σ REDEEMED + Σ ADJUSTMENT − Σ REVERSED`, computed from the ledger.

Redeeming, in one transaction: lock the customer's reward balance row, verify `available ≥ requested`, append `REDEEMED`, and attach the reward to the order. A unique constraint on `(orderId)` in the redemption record prevents applying a reward twice to one order. Over-redemption is impossible: the check and the write share a lock.

### Reversal (§29.16)

If the qualifying order is cancelled, refunded, reversed, or found invalid, the referral moves to `REVERSED` with a reason. If that drops the referrer below a threshold they had crossed, a `REVERSED` entry offsets the earlier `EARNED`. An already-redeemed reward is **not** clawed back automatically — the balance may go to zero but never negative, and the discrepancy is raised for management. Silently reclaiming a delivered benefit is a business decision, not a technical default.

---

## 9. RBAC permission matrix

`A` administrator · `M` manager · `AG` agent · `D` driver · `C` customer
`own` = limited to the actor's own records · `scope` = limited to assigned/registered records

| Permission | A | M | AG | D | C |
| --- | :-: | :-: | :-: | :-: | :-: |
| **Users & accounts** | | | | | |
| `user:read:any` | ● | ● | | | |
| `user:create` (staff) | ● | | | | |
| `user:update:any` | ● | | | | |
| `user:deactivate` | ● | | | | |
| `user:read:own` | ● | ● | ● | ● | ● |
| `user:update:own` | ● | ● | ● | ● | ● |
| **Customers** | | | | | |
| `customer:read:any` | ● | ● | | | |
| `customer:read:scope` | | | ● | ● scope | |
| `customer:create` | ● | ● | ● | | |
| `customer:update:any` | ● | ● | | | |
| **Products** | | | | | |
| `product:read` | ● | ● | ● | ● | ● |
| `product:manage` | ● | ● | | | |
| **Orders** | | | | | |
| `order:read:any` | ● | ● | | | |
| `order:read:scope` | | | ● | ● scope | |
| `order:read:own` | | | | | ● |
| `order:create:own` | | | | | ● |
| `order:create:for-customer` | ● | ● | ● | | |
| `order:update-status` | ● | ● | | | |
| `order:cancel:own` | | | | | ● |
| `order:cancel:any` | ● | ● | | | |
| `order:assign-driver` | ● | ● | | | |
| **Deliveries** | | | | | |
| `delivery:read:any` | ● | ● | | | |
| `delivery:read:assigned` | | | | ● | |
| `delivery:read:own` | | | | | ● |
| `delivery:update-status` | ● | ● | | ● assigned | |
| `delivery:record-exchange` | ● | ● | | ● assigned | |
| `delivery:record-failure` | ● | ● | | ● assigned | |
| `delivery:reconcile` | ● | ● | | | |
| **Bottles & inventory** | | | | | |
| `inventory:read` | ● | ● | | | |
| `inventory:read:assigned` | | | | ● | |
| `bottle:balance:read:own` | | | | | ● |
| `bottle:shortage:resolve` | ● | ● | | | |
| `bottle:shortage:write-off` | ● | | | | |
| `inventory:adjust` | ● | ● † | | | |
| `inventory:adjust:approve` | ● | | | | |
| **Dispensers** | | | | | |
| `dispenser:read:any` | ● | ● | | | |
| `dispenser:read:own` | | | | | ● |
| `dispenser:manage` | ● | ● | | | |
| `dispenser:install` | ● | ● | | | |
| `dispenser:report-fault` | ● | ● | | | ● own |
| `dispenser:transfer-ownership` | ● | | | | |
| `installment:read:any` | ● | ● | | | |
| `installment:read:own` | | | | | ● |
| `installment:manage` | ● | ● | | | |
| **Payments** | | | | | |
| `payment:read:any` | ● | ● | | | |
| `payment:read:own` | | | | | ● |
| `payment:create:own` | | | | | ● |
| `payment:record-cash` | ● | ● | | ● assigned | |
| `payment:reconcile` | ● | ● | | | |
| `payment:reverse` | ● | ● | | | |
| `payment:refund` | ● | ● | | | |
| **Referrals & rewards** | | | | | |
| `referral:read:any` | ● | ● | | | |
| `referral:read:scope` | | | ● | | |
| `referral:read:own` | | | | | ● |
| `reward:redeem:own` | | | | | ● |
| `reward:adjust` | ● | | | | |
| **Reports** | | | | | |
| `report:operational` | ● | ● | | | |
| `report:financial` | ● | ● | | | |
| `report:agent:own` | | | ● | | |
| **System** | | | | | |
| `settings:read` | ● | ● | | | |
| `settings:manage` | ● | | | | |
| `audit:read` | ● | ● ‡ | | | |
| `tracker:read` | ● | ● | | | |
| `tracker:acknowledge-alert` | ● | ● | | | |
| `notification:read:own` | ● | ● | ● | ● | ● |

† Manager adjustments above `inventory.adjustment_admin_threshold` are held as `PENDING_APPROVAL` for an administrator.
‡ Managers see operational audit entries; account and settings audit entries are administrator-only.

Explicit denials worth stating, because they are requirements rather than oversights: a driver can never adjust aggregate inventory, reverse or edit a completed payment, or read organization-wide financials. An agent can never read another agent's customers or any financial ledger. A customer can never read another customer's anything.

---

## 10. Operations requiring database transactions

Each of these is atomic. A partial application would corrupt money, stock, or entitlement.

| # | Operation | Writes covered | Concurrency guard |
| --- | --- | --- | --- |
| 1 | **Place order** | order, items, status history, reward redemption, stock reservation, notification | Lock reward balance; assert stock availability |
| 2 | **Assign driver** | order status, delivery, stock `FILLED_WAREHOUSE → ASSIGNED_TO_DRIVER`, movement, notification | Conditional status update; lock positions |
| 3 | **Complete delivery** | delivery, order status, bottle exchange, shortage ledger, balance, movements, COD payment, referral qualification, reward earning, notifications, audit | Conditional status update; lock positions and balances |
| 4 | **Fail delivery** | delivery, reason, order status, reconciliation flag, notification, audit | Conditional status update |
| 5 | **Reconcile failed delivery** | movements, positions, delivery flag, audit | Lock positions; assert flag still set |
| 6 | **Record / confirm payment** | payment, transaction, order or installment balance, referral qualification, reward earning, notification | Unique provider reference; lock plan or order |
| 7 | **Reverse / refund payment** | transaction, order or installment balance, referral reversal, reward reversal, audit | Conditional status update; single-reversal guard |
| 8 | **Pay installment** | payment, transaction, installment, plan balance, next due date, eligibility, notification, audit | Lock plan row |
| 9 | **Transfer dispenser ownership** | dispenser ownership, plan, approval record, audit | Assert `FULLY_PAID` and approval |
| 10 | **Inventory adjustment** | adjustment, movement, positions, audit | Lock positions |
| 11 | **Resolve bottle shortage** | ledger, balance, optional charge payment, audit | Lock balance row |
| 12 | **Redeem reward** | ledger, balance, order linkage | Lock balance; unique per order |
| 13 | **Qualify referral** | referral, reward ledger, balance, notification | Unique on referred customer |
| 14 | **Register customer** | user, customer profile, referral link, bottle balance, reward balance, welcome notification | Unique email and phone |
| 15 | **Cancel order** | order status, history, stock release, reward restoration, audit | Conditional status update |

---

## 11. Assumptions and resolved ambiguities

Recorded per §43. Anything touching money, ownership, stock, accountability, security, or permissions is implemented as a **safe, configurable default** rather than an invented permanent policy.

| # | Ambiguity | Decision | Why it is safe |
| --- | --- | --- | --- |
| 1 | Currency and precision | GHS, `Decimal(14,2)` | Requirements quote GH₵ throughout. |
| 2 | Shortage → charge automatic? | No. `bottle.auto_charge_shortage = false`; staff convert explicitly | §8 lists conversion as one of several possible outcomes "according to company policy". Auto-charging invents a debt. |
| 3 | Bottle charge amount | Setting, default `80.00` | No figure is given. Configurable, not hard-coded. |
| 4 | Ownership transfer on zero balance | Requires approval by default | §29.12 requires "full payment **and** fulfillment of company requirements". §16 says do not auto-transfer on arithmetic alone. |
| 5 | Overdue enforcement (penalties, retrieval) | Not automated. Flag, notify, record overdue days, let staff act | §29.11 makes these explicitly policy-dependent. |
| 6 | Agent commission calculation | Recorded and reported; rate is a setting, default `0` | Requirements say "where applicable" without a formula. Zero default invents no liability. |
| 7 | Referral qualifying order minimum | Setting, default `0.00` | §29.13 requires "the required qualifying order" without defining it. |
| 8 | Reward clawback after redemption | Balance floors at zero; discrepancy raised for management | Reclaiming a delivered benefit is a business call. |
| 9 | Manager vs administrator profile tables | One `StaffProfile` discriminated by `User.role` | Identical attributes; §5 explicitly asks not to create a table per listed name. |
| 10 | `Refund` as its own table | Modelled as `PaymentTransaction` types `REFUND` / `REVERSAL` | Keeps one linear financial ledger; §19 requires traceability, not a specific table. |
| 11 | Delivery ↔ order cardinality | One order, many attempts, one active | §29.5 permits re-attempt after failure. |
| 12 | Partial delivery of a multi-item order | Not supported in Phase 1. Complete or fail, then re-attempt | Not in scope; a half-state would corrupt bottle accounting. |
| 13 | Session strategy | DB-backed sessions + signed cookie | Stateless JWT alone cannot honour the account-deactivation requirement. |
| 14 | Password policy | Min 8 chars, letter + number + symbol, bcrypt cost 12 | Matches the bundled Next.js auth guidance. |
| 15 | Bulk water unit | Priced per litre, `requiresBottleExchange = false` | No container obligation is described for bulk supply. |
| 16 | Tracker data in Phase 1 | Simulated rows flagged `isSimulated`, labelled in the UI | §23 forbids implying live hardware exists. |
| 17 | SMS / WhatsApp / email | Interfaces present, disabled by default | §31 excludes their per-message charges from Phase 1. |
| 18 | Ghana Digital Address validation | Format-checked (`^[A-Z]{2}-[0-9]{3,4}-[0-9]{3,4}$`), not verified against an external registry | No paid API is in scope; a soft warning avoids rejecting valid input. |
| 19 | Delivery fee | Setting, default `0.00` | No pricing rule is specified. |
| 20 | Free-bottle reward and delivery obligation | A redeemed refillable reward creates the same exchange expectation as a paid one | Otherwise rewards would leak bottles out of inventory. |
