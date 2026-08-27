"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { LandingLogoMark } from "./landing-logo";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#products", label: "Products" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
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
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        ticking = false;
        setScrolled(window.scrollY > 8);

        const sections = NAV_LINKS.map(({ href }) => {
          const el = document.getElementById(href.slice(1));
          return el ? { href, el } : null;
        })
          .filter(
            (
              s,
            ): s is {
              href: (typeof NAV_LINKS)[number]["href"];
              el: HTMLElement;
            } => s !== null,
          )
          .sort((a, b) => a.el.offsetTop - b.el.offsetTop);

        if (sections.length === 0) return;

        const nearBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 80;

        let next: (typeof NAV_LINKS)[number]["href"] = "#home";
        if (nearBottom) {
          next = sections[sections.length - 1].href;
        } else {
          for (const { href, el } of sections) {
            if (el.getBoundingClientRect().top <= 120) next = href;
          }
        }

        setActive((prev) => (prev === next ? prev : next));
      });
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
      className={`sticky top-0 z-50 bg-[#f7f9fc] transition-[background-color,box-shadow] duration-300 ${
        scrolled ? "bg-white shadow-[0_10px_30px_-24px_rgba(10,25,49,0.45)]" : ""
      }`}
    >
      {/* Masthead — brand led */}
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <p className="hidden min-w-[9rem] text-[11px] leading-snug text-slate-500 lg:block">
          Pure water,
          <br />
          delivered with care
        </p>

        <Link
          href="/#home"
          aria-label="F Net Water Hub home"
          className="mx-auto flex min-w-0 items-center gap-3 sm:gap-3.5 lg:mx-0"
          onClick={() => setMenuOpen(false)}
        >
          <LandingLogoMark className="size-9 sm:size-11" />
          <span className="min-w-0 leading-none">
            <span className="block text-[1.35rem] font-bold tracking-[-0.03em] text-[#0A1931] sm:text-[1.65rem]">
              F Net
            </span>
            <span className="mt-1 block text-[0.65rem] font-medium tracking-[0.28em] text-[#0056D2] sm:text-[0.7rem]">
              WATER HUB
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:min-w-[11rem] sm:justify-end">
          {signedIn && dashboardHref ? (
            <Link
              href={dashboardHref}
              className="hidden items-center gap-2 border border-slate-300 bg-white px-3.5 py-2 text-[13px] font-medium text-[#0A1931] transition-colors hover:border-[#0056D2] hover:text-[#0056D2] sm:inline-flex"
            >
              <span
                aria-hidden
                className="size-1.5 rotate-45 bg-[#0056D2]"
              />
              Open dashboard
            </Link>
          ) : (
            <div className="hidden overflow-hidden border border-slate-300 bg-white sm:flex">
              <Link
                href="/login"
                className="inline-flex items-center px-3.5 py-2 text-[13px] font-medium text-[#0A1931]/80 transition-colors hover:bg-[#f7f9fc] hover:text-[#0056D2]"
              >
                Log in
              </Link>
              <span aria-hidden className="w-px self-stretch bg-slate-300" />
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#0056D2] px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#0047b0]"
              >
                Join us
                <span
                  aria-hidden
                  className="size-1 rotate-45 bg-white/80"
                />
              </Link>
            </div>
          )}

          {signedIn && dashboardHref ? (
            <Link
              href={dashboardHref}
              className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#0A1931] sm:hidden"
            >
              <span
                aria-hidden
                className="size-1.5 rotate-45 bg-[#0056D2]"
              />
              App
            </Link>
          ) : (
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 bg-[#0056D2] px-2.5 py-1.5 text-[12px] font-semibold text-white sm:hidden"
            >
              Join us
              <span
                aria-hidden
                className="size-1 rotate-45 bg-white/80"
              />
            </Link>
          )}

          <button
            type="button"
            className="inline-flex size-9 items-center justify-center border border-slate-300 bg-white text-[#0A1931] transition-colors hover:border-[#0056D2] hover:text-[#0056D2] lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X className="size-4" aria-hidden />
            ) : (
              <Menu className="size-4" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* Navigation rail */}
      <div className="border-y border-slate-200/90 bg-white">
        <nav
          aria-label="Primary"
          className="mx-auto hidden max-w-7xl items-center justify-center gap-1 px-6 lg:flex xl:gap-2"
        >
          {NAV_LINKS.map(({ href, label }, index) => {
            const isActive = active === href;
            return (
              <span key={href} className="flex items-center">
                {index > 0 && (
                  <span
                    aria-hidden
                    className="mx-1 size-1 rotate-45 bg-slate-300 xl:mx-2"
                  />
                )}
                <a
                  href={href}
                  onClick={() => setActive(href)}
                  className={`relative px-3 py-3.5 text-[0.9rem] transition-colors ${
                    isActive
                      ? "font-semibold text-[#0056D2]"
                      : "font-medium text-[#0A1931]/70 hover:text-[#0056D2]"
                  }`}
                >
                  {label}
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute inset-x-3 -bottom-px h-[2px] bg-[#0056D2]"
                    />
                  )}
                </a>
              </span>
            );
          })}
        </nav>

        {/* Compact mobile section cue */}
        <div className="flex h-10 items-center justify-center px-4 lg:hidden">
          <p className="truncate text-[11px] font-medium tracking-[0.18em] uppercase text-slate-500">
            {NAV_LINKS.find((l) => l.href === active)?.label ?? "Home"}
          </p>
        </div>
      </div>

      {menuOpen && (
        <div
          id="landing-mobile-nav"
          className="max-h-[calc(100dvh-7rem)] overflow-y-auto border-b border-slate-200 bg-white lg:hidden"
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
                  className={`flex items-center gap-3 border-b border-slate-100 py-3.5 text-[1.05rem] ${
                    isActive
                      ? "font-semibold text-[#0056D2]"
                      : "font-medium text-[#0A1931]"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`size-1.5 rotate-45 ${
                      isActive ? "bg-[#0056D2]" : "bg-slate-300"
                    }`}
                  />
                  {label}
                </a>
              );
            })}

            <div className="mt-4 overflow-hidden border border-slate-300 pb-2">
              {signedIn && dashboardHref ? (
                <Link
                  href={dashboardHref}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-[#0056D2] py-3.5 text-[13px] font-semibold text-white"
                >
                  <span
                    aria-hidden
                    className="size-1.5 rotate-45 bg-white/80"
                  />
                  Open dashboard
                </Link>
              ) : (
                <div className="grid grid-cols-2">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center border-r border-slate-300 bg-white py-3.5 text-[13px] font-medium text-[#0A1931]"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 bg-[#0056D2] py-3.5 text-[13px] font-semibold text-white"
                  >
                    Join us
                    <span
                      aria-hidden
                      className="size-1 rotate-45 bg-white/80"
                    />
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
