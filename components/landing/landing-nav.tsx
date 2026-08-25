"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { LandingLogo } from "./landing-logo";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About Us" },
  { href: "#services", label: "Services" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact Us" },
] as const;

export function LandingNav({
  dashboardHref,
  signedIn,
}: {
  signedIn: boolean;
  dashboardHref?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#home");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);

      // Use document order (not nav order) so later page sections win correctly.
      const sections = NAV_LINKS.map(({ href }) => {
        const el = document.getElementById(href.slice(1));
        return el ? { href, el } : null;
      })
        .filter(
          (s): s is { href: (typeof NAV_LINKS)[number]["href"]; el: HTMLElement } =>
            s !== null,
        )
        .sort((a, b) => a.el.offsetTop - b.el.offsetTop);

      if (sections.length === 0) return;

      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 80;

      if (nearBottom) {
        setActive(sections[sections.length - 1].href);
        return;
      }

      let current: (typeof NAV_LINKS)[number]["href"] = "#home";
      for (const { href, el } of sections) {
        if (el.getBoundingClientRect().top <= 120) current = href;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? "shadow-[0_1px_0_0_rgba(15,23,42,0.08)]" : ""
      }`}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link
          href="/#home"
          aria-label="F Net Water Hub home"
          className="min-w-0 shrink"
          onClick={() => setMenuOpen(false)}
        >
          <LandingLogo />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-5 lg:flex xl:gap-7"
        >
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = active === href;
            return (
              <a
                key={href}
                href={href}
                onClick={() => setActive(href)}
                className={`relative pb-1 text-[0.95rem] font-semibold transition-colors ${
                  isActive
                    ? "text-[#0057B8]"
                    : "text-[#002060] hover:text-[#0057B8]"
                }`}
              >
                {label}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-0.5 mx-auto h-[2px] w-full rounded-full bg-[#4A90E2]"
                  />
                )}
              </a>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {/* Desktop auth */}
          {signedIn && dashboardHref ? (
            <Link
              href={dashboardHref}
              className="hidden h-10 items-center justify-center rounded-lg bg-[#0057B8] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#004794] lg:inline-flex"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden h-10 items-center justify-center rounded-lg border border-[#4A90E2] bg-transparent px-5 text-sm font-semibold text-[#4A90E2] transition-colors hover:bg-[#4A90E2]/10 sm:inline-flex"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="hidden h-10 items-center justify-center rounded-lg bg-[#0057B8] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#004794] sm:inline-flex sm:px-5"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Compact mobile primary action */}
          {signedIn && dashboardHref ? (
            <Link
              href={dashboardHref}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#0057B8] px-3 text-xs font-semibold text-white lg:hidden"
            >
              App
            </Link>
          ) : (
            <Link
              href="/register"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#0057B8] px-3 text-xs font-semibold text-white sm:hidden"
            >
              Sign Up
            </Link>
          )}

          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-lg text-[#002060] hover:bg-slate-50 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X className="size-5" aria-hidden />
            ) : (
              <Menu className="size-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="landing-mobile-nav"
          className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-slate-100 bg-white lg:hidden"
        >
          <nav
            aria-label="Mobile"
            className="mx-auto flex max-w-7xl flex-col px-4 py-2 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = active === href;
              return (
                <a
                  key={href}
                  href={href}
                  onClick={() => {
                    setActive(href);
                    setMenuOpen(false);
                  }}
                  className={`rounded-xl px-4 py-3.5 text-base font-semibold ${
                    isActive ? "bg-brand-50 text-[#0057B8]" : "text-[#002060]"
                  }`}
                >
                  {label}
                </a>
              );
            })}

            <div className="mt-3 grid gap-2 border-t border-slate-100 pt-4">
              {signedIn && dashboardHref ? (
                <Link
                  href={dashboardHref}
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0057B8] text-base font-semibold text-white"
                >
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0057B8] text-base font-semibold text-white"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-[#4A90E2] text-base font-semibold text-[#4A90E2]"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
