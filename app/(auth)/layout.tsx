import Link from "next/link";

import { Droplets, ShieldCheck, Truck } from "lucide-react";

import { Logo } from "@/components/ui";

/**
 * Split layout for the authentication pages: the form on the left, a branded
 * water-themed panel on the right that collapses away on small screens.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="flex w-full flex-col px-6 py-8 sm:px-10 lg:w-1/2 lg:px-16">
        <header className="flex items-center justify-between">
          <Link href="/" aria-label="F Net Water Hub home">
            <Logo />
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </main>

        <footer className="text-xs text-slate-400">
          © {new Date().getFullYear()} F Net Water Hub. All rights reserved.
        </footer>
      </div>

      {/* Decorative panel: hidden from assistive tech and from small screens. */}
      <aside
        aria-hidden
        className="relative hidden overflow-hidden bg-water-gradient lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-16"
      >
        <div className="absolute inset-0 bg-water-mesh opacity-60" />

        {/* Water-inspired wave, kept subtle so it never competes with content. */}
        <svg
          className="absolute bottom-0 left-0 w-full text-white/10"
          viewBox="0 0 1440 320"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path d="M0 224l60-10.7c60-10.6 180-32 300-26.6 120 5.3 240 37.3 360 42.6 120 5.4 240-16 360-37.3 120-21.3 240-42.7 300-53.3l60-10.7V320H0z" />
        </svg>

        <div className="relative max-w-lg text-white">
          <h2 className="text-3xl font-bold leading-tight">
            Water operations, fully accounted for.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/80">
            Orders, deliveries, refillable bottle exchange, dispenser
            installments, payments and rewards — managed in one place.
          </p>

          <ul className="mt-10 space-y-5">
            {[
              {
                icon: Droplets,
                title: "Every bottle traceable",
                body: "Filled, dispatched, delivered, returned — each movement is recorded, never overwritten.",
              },
              {
                icon: Truck,
                title: "Deliveries built for the road",
                body: "Drivers record exchanges and collections from their phone as the round happens.",
              },
              {
                icon: ShieldCheck,
                title: "Money you can audit",
                body: "Payments, reversals and refunds are ledger entries, so history is never rewritten.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-0.5 text-sm text-white/70">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
