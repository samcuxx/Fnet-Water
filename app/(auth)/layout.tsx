import Link from "next/link";

import { LandingLogo } from "@/components/landing/landing-logo";

const PROMISES = [
  {
    title: "Every bottle traceable",
    body: "Filled, dispatched, delivered, returned — each movement is recorded, never overwritten.",
  },
  {
    title: "Deliveries built for the road",
    body: "Drivers record exchanges and collections from their phone as the round happens.",
  },
  {
    title: "Money you can audit",
    body: "Payments, reversals and refunds are ledger entries, so history is never rewritten.",
  },
] as const;

/**
 * Split layout for authentication pages: classic editorial form column on the
 * left, a navy brand panel on the right that collapses away on small screens.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fafbfc] lg:flex-row">
      <div className="flex w-full flex-col border-b border-slate-200 bg-white px-6 py-8 sm:px-10 lg:w-1/2 lg:border-b-0 lg:border-r lg:px-16">
        <header className="border-b border-slate-200 pb-6">
          <Link href="/" aria-label="F Net Water Hub home">
            <LandingLogo />
          </Link>
        </header>

        <main className="flex flex-1 items-start justify-center py-10 lg:items-center">
          <div className="w-full max-w-lg">{children}</div>
        </main>

        <footer className="border-t border-slate-200 pt-6 text-[11px] uppercase tracking-[0.14em] text-slate-400">
          © {new Date().getFullYear()} F Net Water Hub
        </footer>
      </div>

      {/* Decorative panel: hidden from assistive tech and from small screens. */}
      <aside
        aria-hidden
        className="relative hidden overflow-hidden bg-[#0A1931] lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-1/2 lg:shrink-0 lg:flex-col lg:justify-center lg:self-start lg:px-16"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent, transparent 48px, rgba(255,255,255,0.35) 48px, rgba(255,255,255,0.35) 49px)",
          }}
        />

        <div className="relative max-w-lg text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7eb8ff]">
            F Net Water Hub
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight">
            Water operations, fully accounted for.
          </h2>
          <div className="mt-5 h-px w-12 bg-white/30" aria-hidden />
          <p className="mt-5 text-base leading-relaxed text-white/75">
            Orders, deliveries, refillable bottle exchange, dispenser
            installments, payments and rewards — managed in one place.
          </p>

          <ul className="mt-10 space-y-6 border-t border-white/10 pt-8">
            {PROMISES.map(({ title, body }) => (
              <li key={title} className="flex gap-4">
                <span
                  className="mt-2 size-1.5 shrink-0 rotate-45 bg-[#0056D2]"
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.1em]">
                    {title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/65">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
