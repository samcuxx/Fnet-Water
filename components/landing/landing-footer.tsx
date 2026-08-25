import Link from "next/link";

import { LandingLogoMark } from "./landing-logo";

const COMPANY = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
] as const;

const ACCOUNT = [
  { href: "/register", label: "Join us" },
  { href: "/login", label: "Log in" },
  { href: "#contact", label: "Contact" },
] as const;

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-white/55">
        {title}
      </p>
      <div className="mt-3 h-px w-8 bg-[#4A90E2]/70" aria-hidden />
      <ul className="mt-5 space-y-3">
        {links.map(({ href, label }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-[15px] text-white/80 transition-colors hover:text-white"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0A1931] pb-[max(0px,env(safe-area-inset-bottom))] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        {/* Brand masthead */}
        <div className="flex flex-col items-center text-center">
          <Link
            href="/#home"
            aria-label="F Net Water Hub home"
            className="inline-flex items-center gap-3"
          >
            <LandingLogoMark className="size-10 sm:size-11" />
            <span className="leading-none">
              <span className="block text-[1.5rem] font-bold tracking-[-0.03em] text-white sm:text-[1.65rem]">
                F Net
              </span>
              <span className="mt-1 block text-[0.65rem] font-medium tracking-[0.28em] text-[#7EB6FF]">
                WATER HUB
              </span>
            </span>
          </Link>

          <div
            className="mt-6 flex w-full max-w-xs items-center gap-3"
            aria-hidden
          >
            <span className="h-px flex-1 bg-white/15" />
            <span className="size-1.5 rotate-45 bg-[#4A90E2]" />
            <span className="h-px flex-1 bg-white/15" />
          </div>

          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/65">
            Pure water delivered with care — refillable bottles, take-away packs,
            bulk supply and dispenser plans for homes and businesses.
          </p>
        </div>

        {/* Link columns */}
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 border-y border-white/10 py-10 sm:mt-14 sm:grid-cols-3 sm:gap-8 sm:py-12">
          <FooterColumn title="Company" links={COMPANY} />
          <FooterColumn title="Account" links={ACCOUNT} />

          <div className="col-span-2 sm:col-span-1">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-white/55">
              Promise
            </p>
            <div className="mt-3 h-px w-8 bg-[#4A90E2]/70" aria-hidden />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/70">
              Clean water. Clear pricing. Careful delivery — every time.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center gap-2 border border-white/25 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:border-[#4A90E2] hover:bg-white/5"
            >
              Start your order
              <span
                aria-hidden
                className="size-1 rotate-45 bg-[#4A90E2]"
              />
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center gap-2 py-6 text-center text-[13px] text-white/45 sm:flex-row sm:justify-between sm:text-left">
          <p>© {year} F Net Water Hub. All rights reserved.</p>
          <p className="tracking-[0.04em]">
            Pure Water. Delivered. Every Time.
          </p>
        </div>
      </div>
    </footer>
  );
}
