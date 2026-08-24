# F Net Water Hub

A water ordering, delivery, refillable-bottle, dispenser, payment, referral and
inventory management platform for F Net Water Hub.

Five roles, five purpose-built experiences: **Administrator**, **Manager**,
**Agent**, **Driver** and **Customer**. Authorization is enforced on the server,
refillable bottles are accounted for rather than counted, and money is a ledger
that is never rewritten.

## Technology

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| Database | PostgreSQL 17 |
| ORM | Prisma 7 with the `pg` driver adapter |
| Styling | Tailwind CSS 4 (CSS-first theme) |
| Validation | Zod 4 |
| Auth | Database-backed sessions, signed HTTP-only cookies, bcrypt hashing |
| Object storage | MinIO (S3-compatible) |
| Testing | Vitest |
| Containers | Docker and Docker Compose |

## Documentation

| Document | Contents |
| --- | --- |
| [`docs/FNET_WATER_HUB_REQUIREMENTS.md`](docs/FNET_WATER_HUB_REQUIREMENTS.md) | The approved requirements — the source of truth |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Layering, auth strategy, concurrency, provider abstractions |
| [`docs/DATABASE.md`](docs/DATABASE.md) | Schema design and the reasoning behind it |
| [`docs/BUSINESS_RULES.md`](docs/BUSINESS_RULES.md) | Business logic, the RBAC matrix, and documented assumptions |
| [`docs/API.md`](docs/API.md) | Server Actions, route handlers, error contract, mobile reuse |

## Getting started

### Requirements

- Node.js 20.9 or newer
- Docker Desktop (for PostgreSQL and MinIO)

### 1. Install and configure

```bash
npm install
cp .env.example .env
```

Generate a real session secret and put it in `.env` as `AUTH_SECRET`:

```bash
openssl rand -base64 32
# or, without openssl:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

`AUTH_SECRET` must be at least 32 characters — the app refuses to start
otherwise, rather than signing sessions with a weak key.

### 2. Start the dependencies

```bash
npm run docker:up          # postgres + minio + bucket creation
```

The database publishes on host port **5433** by default (`POSTGRES_PORT`). If a
PostgreSQL is already installed on your machine it will hold 5432 and silently
receive the connection, which then fails with an authentication error — hence
the different port.

Verify both are healthy before continuing:

```bash
docker compose ps
```

### 3. Create the schema and seed

```bash
npm run db:migrate         # applies prisma/migrations
npm run db:seed            # development demo data
```

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000.

## Demo credentials

> **Development only.** These accounts are created by `npm run db:seed` and must
> never exist in a production database. The seed truncates and rebuilds its
> tables on every run.

Password for every account below: `Fnet@2026` — the value of
`SEED_DEFAULT_PASSWORD` in `.env.example`. Change it there before seeding to use
something else.

| Role | Email | Lands on |
| --- | --- | --- |
| Administrator | `admin@fnetwaterhub.com` | `/admin` |
| Manager | `manager@fnetwaterhub.com` | `/manager` |
| Agent | `agent@fnetwaterhub.com` | `/agent` |
| Agent | `agent2@fnetwaterhub.com` | `/agent` |
| Driver | `driver@fnetwaterhub.com` | `/driver` |
| Driver | `driver2@fnetwaterhub.com` | `/driver` |
| Driver | `driver3@fnetwaterhub.com` | `/driver` |
| Customer | `customer@fnetwaterhub.com` | `/customer` |

Other seeded customers (same password): `kojo.ansah@example.com`,
`ama.serwaa@example.com`, `kofi.asante@example.com`, `akua.gyasi@example.com`,
`yaw.boakye@example.com`.

The seeded data is internally consistent by design — stock positions equal the
sum of their inventory movements, order totals equal subtotal + fee − discount,
bottle balances equal the sum of the bottle ledger, and reward balances equal
the sum of the reward ledger. A broken invariant in application code shows up
immediately instead of hiding behind implausible fixtures.

It also includes the scenarios that matter operationally: a completed delivery
with a one-bottle shortage, a failed delivery still awaiting reconciliation, a
reversed payment whose original entry is preserved, an overdue installment plan,
a fully paid customer-owned dispenser, and five qualified referrals that earned
exactly one reward.

## Environment variables

See `.env.example` for the full annotated list. The essentials:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `POSTGRES_PORT` | Host port the database container publishes (default 5433) |
| `APP_URL` | Public base URL, used in referral links |
| `AUTH_SECRET` | Session signing key, 32+ characters |
| `SESSION_MAX_AGE_DAYS` | Session lifetime (default 7) |
| `MINIO_ENDPOINT` / `MINIO_PORT` / `MINIO_USE_SSL` | Object storage location |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` / `MINIO_BUCKET` | Object storage credentials |
| `PAYMENT_PROVIDER` | `manual` records cash, bank transfer and staff-confirmed mobile money. Gateway drivers require real credentials and fail loudly rather than pretending to succeed |
| `NOTIFICATIONS_*_ENABLED` | External notification channels. All off in Phase 1 |

Never commit `.env`. Only `.env.example` is tracked.

## Docker

```bash
npm run docker:up          # dependencies only, app runs on the host
npm run docker:app         # build and run everything, including the app
npm run docker:down        # stop
```

Named volumes (`postgres-data`, `minio-data`) persist across restarts. The app
image is a multi-stage build producing a Next.js `standalone` output that runs
as a non-root user.

Inside the compose network the app reaches the database at `postgres:5432` and
MinIO at `minio:9000`, so `POSTGRES_PORT` affects host access only.

## MinIO

The console is at http://localhost:9001 (credentials from `MINIO_ROOT_USER` /
`MINIO_ROOT_PASSWORD`).

The bucket is created **private** by `minio-init`. Files are never exposed by
making the bucket public: access goes through authorized route handlers or
time-limited presigned URLs, and only object metadata and keys are stored in
PostgreSQL.

## Commands

| Command | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Route typegen, then `tsc --noEmit` |
| `npm test` | Vitest, single run |
| `npm run test:watch` | Vitest, watch mode |
| `npm run db:migrate` | Create and apply a migration |
| `npm run db:deploy` | Apply committed migrations (CI, production) |
| `npm run db:seed` | Seed development data |
| `npm run db:reset` | Drop, re-migrate, re-seed |
| `npm run db:studio` | Browse the database |

## Project structure

```
app/
  (public)/      marketing landing page
  (auth)/        login, registration, auth server actions
  admin/         administrator portal
  manager/       manager portal
  agent/         agent portal
  driver/        driver portal (phone-first)
  customer/      customer portal
  notifications/ shared by every role
  api/           route handlers
components/
  ui/            design-system primitives
  navigation/    app shell, sidebar, mobile drawer and bottom bar
  dashboard/     page headers, stat cards, skeletons
lib/
  auth/          session management and the Data Access Layer
  db/            Prisma client
  permissions/   the RBAC matrix
  money/         Decimal-safe money helpers
  settings/      configurable business values
  storage/       MinIO service
  payments/      payment provider abstraction
  notifications/ notification channel abstraction
  validation/    Zod schemas
  utils/         formatting and reference generators
services/        business logic, one folder per domain
prisma/          schema, migrations, seed
docs/            requirements and design documentation
tests/           Vitest suites
```

## Security posture

- Passwords hashed with bcrypt at cost 12. Plaintext is never stored or logged.
- Sessions are database rows; only a SHA-256 hash of the token is persisted, and
  deactivating an account revokes access immediately rather than at token expiry.
- Cookies are `httpOnly`, `sameSite=lax`, and `secure` in production.
- Authorization is resolved server-side in the Data Access Layer on every page,
  action and handler. `proxy.ts` only redirects — it is not the boundary.
- Ownership is asserted per record, so holding `order:read:own` does not allow
  reading another customer's order.
- All input is validated server-side with Zod regardless of client validation.
- Uploads are validated for type and size, and the bucket is private.
- Sensitive actions write an `AuditLog` entry in the same transaction as the
  change.
- Errors return a safe message plus a logged correlation id; no stack traces,
  queries or connection details reach the client.

## Production considerations

Before a production deployment:

- Generate a fresh `AUTH_SECRET`; never reuse a development value.
- Replace all default database and MinIO credentials.
- Terminate TLS in front of the app and set `MINIO_USE_SSL=true` where
  applicable.
- Run `npm run db:deploy` rather than `db:migrate`; never run the seed.
- Take regular PostgreSQL backups and verify a restore. The ledgers are the
  financial and stock record.
- Configure the reverse proxy to set `x-forwarded-for` so audit entries record
  real client addresses.
- Enable a real payment provider only with genuine credentials; the `manual`
  driver is honest about being manual.
- Add rate limiting at the edge for the login and registration routes.
- Ship application logs somewhere durable, since error correlation ids are only
  useful if the corresponding log survives.

## Development status

Delivered so far: the foundation (schema, Docker environment, authentication,
RBAC, design system, portal shells, role dashboards, seed data) and the
supporting documentation. Navigation entries marked "Soon" belong to phases that
are still to be built — customer commerce, water operations, dispensers, growth
features and administration — and are shown inert rather than linking to routes
that do not exist yet.
