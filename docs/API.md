# API and Server Interface

How the browser talks to the server today, and how a future mobile app will
reuse the same logic.

## Two entry points, one authorization boundary

| Entry point | Used for | Authorization |
| --- | --- | --- |
| Server Actions | Every mutation the web UI performs | Resolved inside the action via `lib/auth/dal` |
| Route Handlers (`app/api/**`) | Health checks, file streaming, future mobile/webhook endpoints | Resolved inside the handler via `lib/auth/dal` |

Both funnel through the same Data Access Layer and the same services. There is
no second implementation of a business rule for "the API" — a mobile client
calling a route handler gets the identical inventory, bottle and payment logic
the web UI gets, because both call the same functions in `services/`.

### The proxy is not the boundary

`proxy.ts` performs an optimistic cookie check and redirects, so an
unauthenticated visitor is sent to `/login` without a database round trip. It is
a routing convenience, not a security control:

- It verifies only the cookie's signature, not that the session still exists or
  that the account is still active.
- Server Actions are POSTs to the route that declared them, so a change to the
  proxy matcher could silently remove coverage.

Every page, action and handler therefore re-resolves the actor through the DAL.
Authorization is decided where the data is read, never in the interface layer.

## Server Actions

### Shape

Form-driven actions used with `useActionState` take the previous state and the
`FormData`, and return a serialisable result:

```ts
export type AuthFormState = {
  message?: string;
  fieldErrors?: Record<string, string[]>;
} | undefined;
```

That shape lets the client render a form-level message and per-field errors from
the *server's* validation, so the rules exist in exactly one place.

Actions invoked from a plain `<form action={...}>` with no UI feedback return
`void` and revalidate the affected path instead.

### Rules every action follows

1. **Validate its own input.** An action is an independently reachable POST
   endpoint. It never trusts that the form which called it enforced anything.
2. **Resolve the actor itself.** Via `requireActor`, `requireRole`,
   `requirePermission` or a role helper — not from a parameter.
3. **Assert record scope.** A capability such as `order:read:own` still needs
   `assertCustomerScope` to stop one customer passing another's order id.
4. **Call `redirect()` outside `try`/`catch`.** `redirect()` throws a control-flow
   signal; catching it would swallow the navigation. Where a `try` is
   unavoidable, `unstable_rethrow(error)` is called first in the `catch`.
5. **Return safe errors.** `toSafeError` maps a domain error to a user-facing
   message and hides anything else behind a generic message plus a logged
   reference id.

### Current actions

| Action | Location | Authorization |
| --- | --- | --- |
| `login` | `app/(auth)/actions.ts` | Public. Rejects non-active accounts; identical message for unknown account and wrong password |
| `register` | `app/(auth)/actions.ts` | Public. Always creates a `CUSTOMER`; the role is never accepted from the client |
| `logout` | `app/(auth)/actions.ts` | Any session. Revokes the session row server-side, then clears the cookie |
| `markNotificationRead` | `app/notifications/actions.ts` | Any session, scoped to the actor's own notifications |
| `markAllNotificationsRead` | `app/notifications/actions.ts` | Any session, scoped to the actor |

Anti-enumeration detail worth preserving: a login attempt against an unknown
identifier still burns a bcrypt comparison (`fakeVerify`) so response latency
does not reveal which emails are registered.

## Route Handlers

| Route | Method | Auth | Purpose |
| --- | --- | --- | --- |
| `/api/health` | `GET` | None | Liveness and database reachability for the Docker healthcheck. Returns `{ status }` only — no versions, no error text |

## Errors

`lib/errors.ts` defines the domain error types. Each maps to an HTTP status for
route handlers and to a user-facing message for actions:

| Error | Status | Meaning |
| --- | --- | --- |
| `ValidationError` | 400 | Input failed a schema or field rule; carries `fieldErrors` |
| `UnauthenticatedError` | 401 | No valid session |
| `ForbiddenError` | 403 | Authenticated but not permitted |
| `NotFoundError` | 404 | Absent, or deliberately indistinguishable from absent |
| `ConflictError` | 409 | Uniqueness or concurrent-update conflict |
| `BusinessRuleError` | 422 | Request is well-formed but violates a business invariant |

Anything else becomes a generic message with a logged correlation id. Raw
database errors, stack traces and connection strings never reach a response.

For pages, the DAL uses Next.js auth interrupts rather than manual redirects:
`unauthorized()` renders `app/unauthorized.tsx` and `forbidden()` renders
`app/forbidden.tsx` (enabled by `experimental.authInterrupts`).

## Validation

Zod 4 schemas in `lib/validation/`:

- `common.ts` — ids, email, Ghanaian phone numbers (normalised to the local `0`
  form so lookups are consistent), passwords, Ghana Digital Address, GPS
  coordinates, money as strings (so no precision is lost before `Decimal`),
  quantities, pagination with a capped page size, date ranges, upload limits.
- `auth.ts` — login, customer registration, staff creation, password change,
  profile update.

`parseOrThrow` applies a schema and raises `ValidationError`; `toFieldErrors`
flattens a Zod error into the per-field shape the forms consume.

## Money across the boundary

`Prisma.Decimal` is not a plain object and does not survive serialisation to a
client component. Money is either:

- formatted on the server with `formatMoney` for display, or
- passed as a string with `toAmountString` and formatted on the client.

It is never converted to a `number` in transit.

## Pagination

List endpoints and tables use server-side pagination through
`paginationSchema`, which caps `pageSize` at 100. Reports require an explicit
date range (`dateRangeSchema`) so no query is unbounded.

## Preparing for the mobile app

The service layer is transport-agnostic: `services/**` functions take plain
arguments and an actor, and know nothing about HTTP, `FormData` or React. A
mobile backend is therefore a set of route handlers that:

1. Resolve the actor through the DAL (a bearer-token variant of session
   resolution would slot in alongside the cookie path in `lib/auth/session.ts`).
2. Validate the body with the existing Zod schema.
3. Call the same service function the web UI calls.
4. Serialise the result, converting `Decimal` to a string.

No business rule needs to be reimplemented for that to work, which is the point
of keeping the rules out of the components.

## Conventions for new endpoints

- Name actions for the business operation (`recordBottleExchange`), not the
  table (`updateDelivery`).
- Wrap multi-record operations in `prisma.$transaction` — see
  `BUSINESS_RULES.md` for the operations that require it.
- Emit an `AuditLog` entry inside the same transaction for sensitive actions, so
  the trail cannot exist without the change or vice versa.
- Return the minimum the caller needs; never spread a full database row into a
  response.
