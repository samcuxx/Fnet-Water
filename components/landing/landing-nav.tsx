"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { buttonClasses } from "@/components/ui";

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

      let current = "#home";
      for (const { href } of NAV_LINKS) {
        const el = document.getElementById(href.slice(1));
        if (!el) continue;
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
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? "shadow-[0_1px_0_0_rgba(15,23,42,0.06)]" : ""
      }`}
    >
      <div className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/#home"
          aria-label="F Net Water Hub home"
          className="shrink-0"
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

        <div className="flex shrink-0 items-center gap-2.5">
          {signedIn && dashboardHref ? (
            <Link
              href={dashboardHref}
              className={buttonClasses({
                size: "sm",
                className:
                  "h-10 rounded-lg bg-[#0057B8] px-5 text-sm font-semibold text-white hover:bg-[#004794]",
              })}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-[#4A90E2] bg-transparent px-5 text-sm font-semibold text-[#4A90E2] transition-colors hover:bg-[#4A90E2]/10"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#0057B8] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#004794]"
              >
                Sign Up
              </Link>
            </>
          )}

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg text-[#002060] hover:bg-slate-50 lg:hidden"
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
          className="border-t border-slate-100 bg-white lg:hidden"
        >
          <nav aria-label="Mobile" className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = active === href;
              return (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-3 py-3 text-base font-semibold ${
                    isActive ? "bg-brand-50 text-[#0057B8]" : "text-[#002060]"
                  }`}
                >
                  {label}
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
