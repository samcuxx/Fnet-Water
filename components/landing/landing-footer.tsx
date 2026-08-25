import Link from "next/link";

import { LandingLogo } from "./landing-logo";

const COLUMNS = {
  Company: [
    { href: "#about", label: "About Us" },
    { href: "#services", label: "Services" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#pricing", label: "Pricing" },
  ],
  Account: [
    { href: "/register", label: "Sign Up" },
    { href: "/login", label: "Login" },
    { href: "#contact", label: "Contact Us" },
  ],
} as const;

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white pb-[max(0px,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <LandingLogo />
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Pure water delivered with care — refillable bottles, take-away
              packs, bulk supply and dispenser plans for homes and businesses.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:contents">
            {Object.entries(COLUMNS).map(([title, links]) => (
              <div key={title}>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <ul className="mt-3 space-y-2.5 sm:mt-4">
                  {links.map(({ href, label }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="inline-flex min-h-10 items-center text-sm text-slate-500 transition-colors hover:text-brand-600"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-100 pt-6 text-sm text-slate-400 sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:pt-8">
          <p>© {year} F Net Water Hub. All rights reserved.</p>
          <p>Pure Water. Delivered. Every Time.</p>
        </div>
      </div>
    </footer>
  );
}
