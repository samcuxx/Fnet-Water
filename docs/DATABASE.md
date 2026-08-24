# Database Design

PostgreSQL 17 via Prisma ORM 7. The schema lives in `prisma/schema.prisma`; this
document explains *why* it is shaped the way it is. Where the two disagree, the
schema is authoritative and this document is a bug.

## Conventions

| Concern | Decision |
| --- | --- |
| Table names | `snake_case` via `@@map`; Prisma fields stay `camelCase` |
| Primary keys | `cuid()` strings — opaque, safe in URLs, no sequence to leak volume |
| Money | `Decimal(14, 2)`, never `Float`. See `lib/money` |
| Coordinates | `Decimal(10, 7)` — roughly 1 cm precision, enough for a delivery pin |
| Timestamps | `createdAt` / `updatedAt` on mutable rows; ledgers carry `createdAt` only |
| Enums | Native Postgres enums, so an invalid status cannot be written at all |

## Why decimals, not floats

`0.1 + 0.2 !== 0.3` in binary floating point. Applied to an installment
schedule, that error compounds until a plan that has been paid in full still
shows a balance of a fraction of a pesewa — and a customer's asset ownership
hinges on that balance reaching zero. Every monetary column is
`Decimal(14, 2)`, and all arithmetic goes through `lib/money`, which rounds
half-up at two places on every operation.

## Model clusters

### Identity and profiles

```
User ──1:1── CustomerProfile ──1:n── Address
     ├─1:1── DriverProfile
     ├─1:1── AgentProfile
     ├─1:1── StaffProfile        (administrators and managers)
     └─1:n── Session
```

`User` holds credentials, role and status; the profile tables hold role-specific
attributes. That split means a role's fields can grow without widening a table
every account shares, and `User.status` is the single switch that deactivates an
account regardless of role.

Administrators and managers share `StaffProfile` because they need identical
attributes (department, job title) and are distinguished by `User.role`. A
separate `ManagerProfile` would have been an empty copy.

`Session` stores a SHA-256 hash of the session token, never the token. A
database leak therefore yields no usable sessions. Sessions are rows rather
than self-contained JWTs specifically so that deactivating an account revokes
access immediately instead of at token expiry.

### Catalogue

`Product` is one table for every product type, discriminated by `ProductType`
and shaped by behavioural flags rather than by subclassing:

- `requiresBottleExchange` — true only for refillable containers. This is the
  flag that decides whether a delivered line item creates an empty-return
  obligation, so new refillable formats work without touching the exchange
  logic.
- `isRewardEligible` — whether the product can be issued as a referral reward.
- `capacityLitres`, `unit`, `lowStockThreshold` — presentation and alerting.

Adding a product type is a row, not a migration.

### Orders

```
Order ──1:n── OrderItem ──n:1── Product
      ├─1:n── OrderStatusHistory
      ├─1:n── Delivery
      └─1:n── Payment
```

`OrderItem` denormalises `productName` and `unitPrice` at the time of sale. A
later price change or product rename must not rewrite what a customer was
actually charged. `requiresBottleExchange` is copied for the same reason: the
bottle obligation is fixed by the terms at purchase.

`Order.expectedEmptyBottles` is stored rather than derived on read, because it
is the agreed obligation for that order and must not shift if a product's flags
change afterwards.

`OrderStatusHistory` records every transition with who made it. The permitted
transitions are enforced in the service layer (see `BUSINESS_RULES.md` §4), not
by the database, because legality depends on more than the two statuses — e.g.
whether stock has been dispatched.

### Deliveries

`Delivery` is a per-attempt record, uniquely keyed on
`(orderId, attemptNumber)`. A failed delivery does not get overwritten by the
retry: it stays as attempt 1 with its failure reason, and the retry becomes
attempt 2. Failed-delivery reconciliation depends on that history surviving.

The bottle counters on a delivery (`bottlesDispatched`, `bottlesDelivered`,
`emptyBottlesExpected`, `emptyBottlesCollected`, `damagedBottlesReturned`,
`shortageQuantity`) are the driver's field report. They are *inputs* to the
ledgers, not the accounting truth — the ledgers below are.

`requiresReconciliation` is a latch. A failed delivery sets it, and only an
authorized reconciliation clears it, so stock that went out on a van cannot
quietly vanish from the books.

### Inventory: ledger plus materialised position

This is the part of the schema that most resists being treated as ordinary
e-commerce stock.

```
InventoryMovement   (append-only; the truth)
        │
        └──► BottleStockPosition   (materialised cache; the lock target)
```

`InventoryMovement` is append-only: services insert, never update or delete.
Each row records a quantity moving between `BottleState`s, with the driver,
customer, order or delivery that caused it. The current stock position is
derivable by summing these rows, which means an error is corrected by a
compensating movement that remains visible, not by editing history.

`BottleStockPosition` exists because summing the entire ledger on every read
does not scale, and because concurrent stock writes need a single row to lock.
It is keyed `(productId, state, holderType, holderId)`. `holderId` defaults to
`""` rather than `NULL` for warehouse rows: Postgres treats `NULL`s as distinct
in a unique index, so a nullable holder would silently permit duplicate
warehouse rows for the same product and state.

`InventoryAdjustment` is the controlled path for correcting a discrepancy —
`PENDING_APPROVAL` → `APPROVED` → `APPLIED`, with the applying step emitting a
movement. Users never write a stock quantity directly.

### Bottle accountability

```
CustomerBottleLedger   (append-only; signed quantities)
        │
        └──► CustomerBottleBalance   (materialised; version column for locking)
```

The ledger records every change to what a customer owes in empties: positive
increases the obligation, negative reduces it. The requirement's worked example
— 5 delivered, 4 returned, 1 outstanding — is two ledger rows (`+5`, `-4`) and
a balance of 1, not an overwritten counter. History is preserved, so a dispute
six months later can be reconstructed exactly.

`CustomerBottleBalance` carries `version` for optimistic concurrency, so two
simultaneous deliveries cannot both read a balance of 1 and both write 0.

### Dispensers

`Dispenser` deliberately separates three orthogonal facts:

- `status` — where the unit physically is (`AVAILABLE`, `INSTALLED`, `FAULTY`…)
- `ownership` — who owns it (`COMPANY_OWNED`, `COMPANY_OWNED_INSTALLMENT`,
  `CUSTOMER_OWNED`)
- `maintenanceStatus` — its service condition

Conflating these is the classic modelling error here: installing a unit at a
customer's premises transfers no ownership, and a faulty customer-owned unit is
a different situation from a faulty company-owned one.

```
DispenserPaymentPlan ──1:n── DispenserInstallment ──1:n── Payment
```

The plan holds the agreement (total, deposit, installment amount, frequency,
outstanding balance) and the installments are the schedule. `ownershipEligibleAt`
is set when the balance reaches zero, but `ownershipTransferredAt` and
`ownershipApprovedByUserId` require a human decision — the system will not
transfer an asset on arithmetic alone.

### Payments

```
Payment   (the intent and its current state)
    │
    └──1:n── PaymentTransaction   (append-only financial ledger)
```

A `Payment` is what someone intended to pay and how it currently stands.
`PaymentTransaction` is the money itself: `PAYMENT` entries are positive,
`REVERSAL` and `REFUND` entries are negative. Net cash is a sum over the
ledger, so a reversal is a new row rather than an edit — financial history is
never rewritten to correct a mistake.

`idempotencyKey` is unique, so a retried request cannot charge twice.
`(provider, providerReference)` is unique, so a replayed provider webhook
cannot post the same transaction again.

### Referrals and rewards

`Referral.referredCustomerId` is **unique**: a customer can be referred exactly
once, permanently, which closes off the obvious fraud of re-registering to farm
rewards. `status` moves `PENDING → QUALIFIED` only after a qualifying paid
order, and `QUALIFIED → REVERSED` if that order is later refunded.

```
RewardLedger   (append-only; signed)
        │
        └──► CustomerRewardBalance   (materialised; version column)
```

`RewardRedemption.orderId` is unique, so one order can carry at most one
redemption — the database, not application care, prevents double-spending a
reward.

The "5 referrals = 1 reward" threshold is **not** in the schema. It lives in
`SystemSetting` and is read through `lib/settings`, so an administrator can
change it without a deployment.

### Notifications, trackers, audit, settings, files

`Notification` is the in-app channel, with `channel` and `status` columns ready
for SMS, email, WhatsApp and push without a migration.

`TrackerDevice.isSimulated` defaults to `true`. Phase 1 ships no IoT hardware,
and this flag exists so no screen can present seeded demonstration data as live
telemetry.

`AuditLog` is append-only by policy, holding `previousValues` / `newValues` as
JSON. JSON rather than typed columns because the shape differs per entity, and
the audit trail must accommodate a new sensitive action without a migration.

`StoredFile` holds object metadata and the MinIO object key. Binaries live in
MinIO, never in Postgres.

`SystemSetting` stores each configurable business value with its `valueType`,
category and label, so the administration UI can render and validate it
generically.

## Indexing

Indexes follow the queries the portals actually make, not every column:

| Index | Serves |
| --- | --- |
| `Order (customerId, status)` | A customer's active orders |
| `Order (status, createdAt)` | Staff order queues |
| `Delivery (driverId, status)` | A driver's round |
| `Delivery (status, scheduledFor)` | The manager's day |
| `Delivery (requiresReconciliation)` | The exceptions queue |
| `InventoryMovement (productId, occurredAt)` | Ledger replay and stock reports |
| `CustomerBottleLedger (customerId, createdAt)` | A customer's bottle history |
| `DispenserInstallment (status, dueDate)` | Collections and overdue alerts |
| `Payment (status, createdAt)` | Reconciliation |
| `AuditLog (entityType, entityId)` | "What happened to this record?" |

## Constraints that carry business meaning

These are not mere hygiene — each one closes a specific failure mode:

| Constraint | Prevents |
| --- | --- |
| `Referral.referredCustomerId` unique | Farming rewards by re-referral |
| `RewardRedemption.orderId` unique | Spending one reward twice |
| `Payment.idempotencyKey` unique | Double charging on a retry |
| `Payment (provider, providerReference)` unique | Replayed provider webhooks |
| `Delivery (orderId, attemptNumber)` unique | Losing a failed attempt to its retry |
| `DispenserInstallment (planId, sequence)` unique | Duplicate installments in a schedule |
| `BottleStockPosition (productId, state, holderType, holderId)` unique | Divergent duplicate stock rows |

## Referential actions

Chosen per relationship rather than uniformly:

- `Restrict` where deletion would destroy financial or stock history — an order's
  customer, a movement's product, an audit-relevant actor.
- `Cascade` where the child has no meaning without the parent — a user's
  sessions, an order's items, a plan's installments.
- `SetNull` where the reference is contextual and the record must survive
  without it — the staff member who performed a movement, the address a
  delivery went to.

The pattern: nothing that represents money, stock or accountability is ever
removed as a side effect of deleting something else.

## Migrations

```bash
npm run db:migrate      # create and apply a migration in development
npm run db:deploy       # apply committed migrations (CI and production)
npm run db:reset        # drop, re-migrate and re-seed (development only)
npm run db:studio       # browse the data
```

Migrations are committed to `prisma/migrations/` and applied in order. Never
edit an applied migration; add a new one.
