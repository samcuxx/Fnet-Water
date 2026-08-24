import Link from "next/link";

import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Gift,
  Droplets,
  Receipt,
  Truck,
  Users,
} from "lucide-react";

import { buttonClasses, Card, CardContent } from "@/components/ui";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-water-gradient">
        <div aria-hidden className="absolute inset-0 bg-water-mesh opacity-70" />

        {/* Wave divider sits at the section boundary, echoing the water theme. */}
        <svg
          aria-hidden
          className="absolute -bottom-1 left-0 w-full text-slate-50"
          viewBox="0 0 1440 140"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path d="M0 60l80 12c80 12 240 36 400 30s320-42 480-46 320 22 400 34l80 12v38H0z" />
        </svg>

        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide">
              <Droplets className="size-3.5" aria-hidden />
              F Net Water Hub
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Clean water, delivered and fully accounted for.
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-white/85">
              Order refillable bottles, take-away packs and bulk supply. Track
              every delivery, every bottle returned, every dispenser
              installment and every cedi collected — in one platform.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/register"
                className={buttonClasses({ size: "lg", className: "bg-white text-brand-700 hover:bg-white/90" })}
              >
                Create an account
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/login"
                className={buttonClasses({
                  size: "lg",
                  variant: "outline",
                  className: "border-white/40 bg-transparent text-white hover:bg-white/10",
                })}
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Built for the way a water business actually runs
          </h2>
          <p className="mt-3 text-slate-600">
            Refillable bottles are not ordinary stock, and cash collected on the
            road is not an afterthought. Every part of the platform is designed
            around that reality.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Droplets,
              title: "Bottle exchange accounting",
              body: "Filled bottles out, empties expected, empties returned. Shortages are tracked per customer instead of quietly disappearing.",
            },
            {
              icon: Boxes,
              title: "Inventory as a ledger",
              body: "Warehouse, driver, in transit, with customer, damaged, lost. Stock is derived from movements, never hand-edited.",
            },
            {
              icon: Truck,
              title: "Deliveries built for mobile",
              body: "Drivers start rounds, record exchanges, collect cash and report failed deliveries with a reason, from a phone.",
            },
            {
              icon: Receipt,
              title: "Dispenser installments",
              body: "Plans, due dates, outstanding balances and ownership handled as separate concerns, with full payment history.",
            },
            {
              icon: Gift,
              title: "Referrals and rewards",
              body: "Referrals qualify only after a paid order. Reward balances are a ledger, so reversals stay consistent.",
            },
            {
              icon: BadgeCheck,
              title: "Auditable money",
              body: "Refunds and reversals are new transactions. Financial history is preserved, never deleted to fix a mistake.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <Card key={title} className="transition-shadow hover:shadow-card-hover">
              <CardContent className="pt-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                One platform, five ways to work
              </h2>
              <p className="mt-3 text-slate-600">
                Each role gets the screens and permissions it needs — and
                nothing it does not. Access is enforced on the server, not
                hidden in the interface.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Users,
                  role: "Customers",
                  body: "Order, track deliveries, watch bottle balances, pay installments, redeem rewards.",
                },
                {
                  icon: Truck,
                  role: "Drivers",
                  body: "Today's round, delivery details, bottle exchange and cash collection.",
                },
                {
                  icon: Gift,
                  role: "Agents",
                  body: "Onboard customers, place orders on their behalf, follow referral progress.",
                },
                {
                  icon: Boxes,
                  role: "Managers",
                  body: "Assign deliveries, reconcile stock and cash, oversee installments.",
                },
                {
                  icon: BadgeCheck,
                  role: "Administrators",
                  body: "Staff accounts, business settings, financial controls, audit trail.",
                },
              ].map(({ icon: Icon, role, body }) => (
                <li
                  key={role}
                  className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                >
                  <Icon className="mt-0.5 size-5 shrink-0 text-aqua-600" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{role}</p>
                    <p className="mt-1 text-sm text-slate-600">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-slate-900 px-6 py-12 text-center sm:px-12">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ready to order your first delivery?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Create a customer account in a minute. Add a delivery address, pick
            your bottles, and choose how you would like to pay.
          </p>
          <Link
            href="/register"
            className={buttonClasses({ size: "lg", className: "mt-8" })}
          >
            Get started
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
