import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  BadgeCheck,
  Check,
  CreditCard,
  Droplets,
  Headset,
  ShoppingCart,
  ShieldCheck,
  Smartphone,
  Star,
  Truck,
  Users,
} from "lucide-react";

const IMAGES = {
  /**
   * Full-bleed hero section background.
   * Source: public/landing/hero.jpg
   */
  hero: "/landing/hero.jpg",
  /**
   * Blue stats-band background (wave + product splash).
   * Source: public/landing/stats-bg.jpg
   */
  statsBg: "/landing/stats-bg.jpg",
  /**
   * Delivery person holding a jug for the CTA card.
   * Source: public/landing/cta-delivery-v2.jpg (white studio background)
   */
  ctaDelivery: "/landing/cta-delivery-v2.jpg",
  dispenser:
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=85",
} as const;

const HERO_TRUST = [
  { icon: Truck, label: "Fast Delivery" },
  { icon: ShieldCheck, label: "Secure Payments" },
  { icon: BadgeCheck, label: "Quality Guaranteed" },
] as const;

const FEATURES = [
  {
    icon: Droplets,
    title: "Pure & Safe Water",
    body: "We provide clean and purified water that meets the highest quality standards.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    body: "Quick and reliable delivery right to your doorstep when you need it.",
  },
  {
    icon: Smartphone,
    title: "Easy Ordering",
    body: "Order, track and manage deliveries easily from our web platform.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    body: "Multiple secure payment options for a smooth and safe experience.",
  },
  {
    icon: Headset,
    title: "24/7 Support",
    body: "Our support team is always available to assist you whenever you need help.",
  },
] as const;

const STEPS = [
  {
    no: "1",
    title: "Create Account",
    body: "Sign up or login to your account.",
    Icon: Smartphone,
    iconWrap: "bg-[#E8F1FF] text-[#0056D2]",
    badge: "bg-[#0056D2]",
  },
  {
    no: "2",
    title: "Place Your Order",
    body: "Select your water type, quantity and delivery time.",
    Icon: ShoppingCart,
    iconWrap: "bg-emerald-50 text-emerald-600",
    badge: "bg-emerald-500",
  },
  {
    no: "3",
    title: "We Deliver",
    body: "Our team delivers your order to your doorstep.",
    Icon: Truck,
    iconWrap: "bg-orange-50 text-orange-500",
    badge: "bg-orange-500",
  },
  {
    no: "4",
    title: "Enjoy & Repeat",
    body: "Enjoy pure water and order again anytime.",
    Icon: Check,
    iconWrap: "bg-[#E8F1FF] text-[#0056D2]",
    badge: "bg-[#0056D2]",
  },
] as const;

const STATS = [
  { value: "25,000+", label: "Happy Customers", icon: Users },
  { value: "120,000+", label: "Bottles Delivered", icon: Droplets },
  { value: "98%", label: "On-time Delivery", icon: Truck },
  { value: "4.8/5", label: "Customer Rating", icon: Star },
] as const;

const PRICING = [
  {
    name: "Refillable 20L",
    price: "GH₵ 25",
    unit: "per filled bottle",
    note: "Ideal for homes and small offices. Empties returned on the next delivery.",
    features: ["Bottle exchange tracking", "Scheduled delivery", "Mobile Money & cash"],
    featured: false,
  },
  {
    name: "Take-away pack",
    price: "From GH₵ 8",
    unit: "500ml & 1.5L packs",
    note: "Convenient packs for events, travel and everyday hydration.",
    features: ["Multiple pack sizes", "Same-day slots", "Easy reordering"],
    featured: true,
  },
  {
    name: "Bulk supply",
    price: "Custom",
    unit: "quote on request",
    note: "Reliable volume supply for institutions, estates and businesses.",
    features: ["Volume pricing", "Dedicated scheduling", "Account management"],
    featured: false,
  },
] as const;

const ABOUT_PILLARS = [
  { label: "Our promise", text: "Clean, safe water — delivered with care every time." },
  { label: "Our platform", text: "Orders, bottles, payments and rewards in one place." },
  { label: "Our people", text: "Drivers, agents and managers working as one team." },
] as const;

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        id="home"
        className="relative min-h-[min(88dvh,40rem)] overflow-hidden bg-[#eaf3ff] sm:min-h-0"
      >
        <Image
          src={IMAGES.hero}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-[80%_center] sm:object-right"
          aria-hidden
        />
        {/* Stronger wash on phones so copy stays readable over the products */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/60 sm:bg-none"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-white/75 via-white/35 to-transparent sm:block"
        />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col justify-center px-4 py-12 pb-16 sm:px-6 sm:py-16 lg:px-8 lg:py-24 xl:py-28">
          <div className="max-w-xl">
            <h1 className="text-[2.15rem] font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              <span className="block text-[#0A1931]">Pure Water.</span>
              <span className="block text-[#0A1931]">Delivered.</span>
              <span className="block text-[#0056D2]">Every Time.</span>
            </h1>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#4A5568] sm:mt-5 sm:text-lg">
              F Net Water Hub provides clean, safe and reliable water delivery
              at your convenience. Order, track and manage all your water needs
              in one place.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <Link
                href="/register"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0056D2] px-6 text-base font-semibold text-white transition-colors hover:bg-[#0047b0] sm:w-auto sm:rounded-lg"
              >
                Order Water Now
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/register"
                className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#0056D2] bg-white/95 px-6 text-base font-semibold text-[#0056D2] transition-colors hover:bg-white sm:w-auto sm:rounded-lg"
              >
                Create Account
              </Link>
            </div>

            <ul className="mt-8 grid grid-cols-1 gap-3 sm:mt-9 sm:flex sm:flex-wrap sm:gap-x-7 sm:gap-y-3">
              {HERO_TRUST.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2.5 text-sm font-medium text-[#4A5568]"
                >
                  <Icon className="size-4 shrink-0 text-[#0056D2]" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────────────────────────────────── */}
      <section id="services" className="scroll-mt-20 bg-white py-12 sm:scroll-mt-24 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Why choose F Net Water Hub?
            </p>
            <h2 className="mt-3 text-[1.65rem] font-bold tracking-tight text-[#0A1931] sm:text-4xl">
              Quality Water. Exceptional Service.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-5 lg:gap-4 xl:gap-5">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200/80 bg-white px-5 py-6 text-center shadow-[0_4px_20px_-8px_rgba(15,23,42,0.12)] sm:py-8"
              >
                <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#E8F1FF] text-[#0056D2] sm:size-14">
                  <Icon className="size-5 stroke-[1.75] sm:size-6" aria-hidden />
                </span>
                <h3 className="mt-4 text-[0.95rem] font-bold leading-snug text-[#0A1931] sm:mt-5">
                  {title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-500 sm:mt-2.5">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="scroll-mt-20 bg-white py-12 sm:scroll-mt-24 sm:py-20 lg:py-24"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              How it works
            </p>
            <h2 className="mt-3 text-[1.65rem] font-bold tracking-tight text-[#0A1931] sm:text-4xl">
              Ordering water has never been this easy
            </h2>
          </div>

          <ol className="relative mt-10 grid gap-10 sm:mt-14 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4 lg:gap-4">
            <div
              aria-hidden
              className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-10 hidden items-center lg:flex"
            >
              <div className="h-0 flex-1 border-t-2 border-dashed border-slate-200" />
              <span className="mx-1 text-slate-300">›</span>
              <div className="h-0 flex-1 border-t-2 border-dashed border-slate-200" />
              <span className="mx-1 text-slate-300">›</span>
              <div className="h-0 flex-1 border-t-2 border-dashed border-slate-200" />
            </div>

            {STEPS.map(({ no, title, body, Icon, iconWrap, badge }) => (
              <li key={no} className="relative z-10 text-center">
                <span
                  className={`mx-auto flex size-16 items-center justify-center rounded-full sm:size-[4.75rem] ${iconWrap}`}
                >
                  <Icon className="size-7 stroke-[1.75] sm:size-8" aria-hidden />
                </span>
                <p
                  className={`mt-4 inline-flex size-7 items-center justify-center rounded-full text-xs font-bold text-white sm:mt-5 ${badge}`}
                >
                  {no}
                </p>
                <h3 className="mt-3 text-base font-bold text-[#0A1931] sm:text-lg">
                  {title}
                </h3>
                <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-slate-500">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Stats + CTA (mockup band) ─────────────────────────────────────── */}
      <section id="contact" className="scroll-mt-20 sm:scroll-mt-24">
        <div className="relative overflow-hidden bg-[#003A8C] py-12 text-white sm:py-20">
          <Image
            src={IMAGES.statsBg}
            alt=""
            fill
            unoptimized
            sizes="100vw"
            className="object-cover object-[70%_center] sm:object-right"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[#003A8C]/70 sm:bg-gradient-to-r sm:from-[#003A8C]/55 sm:via-[#0056D2]/25 sm:to-transparent"
            aria-hidden
          />

          <div className="relative mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85">
              Trusted by thousands
            </p>
            <h2 className="mt-3 text-[1.65rem] font-bold tracking-tight sm:text-4xl">
              Delivering Happiness Every Day
            </h2>

            <div className="mt-8 grid grid-cols-2 gap-y-8 sm:mt-12 sm:gap-y-10 lg:grid-cols-4 lg:gap-0">
              {STATS.map(({ value, label, icon: Icon }, index) => (
                <div
                  key={label}
                  className={`flex flex-col items-center px-2 sm:px-4 ${
                    index < STATS.length - 1
                      ? "lg:border-r lg:border-white/25"
                      : ""
                  }`}
                >
                  <Icon className="size-6 stroke-[1.5] text-white sm:size-7" aria-hidden />
                  <p className="mt-3 text-2xl font-bold tracking-tight sm:mt-4 sm:text-4xl">
                    {value}
                  </p>
                  <p className="mt-1 text-xs text-white/90 sm:text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/80 bg-[#fafbfc] py-14 sm:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0056D2]">
                  Get started
                </p>
                <h2 className="mt-3 text-[1.75rem] font-bold tracking-tight text-[#0A1931] sm:text-4xl">
                  Ready when you are
                </h2>
                <div className="mt-5 h-px w-12 bg-[#0056D2]/40" aria-hidden />
                <p className="mt-6 max-w-md text-[15px] leading-relaxed text-slate-600 sm:text-base sm:leading-8">
                  Open an account, place your first order, and let our team
                  handle the rest — clear pricing, reliable delivery, and
                  careful service from the first bottle onward.
                </p>

                <ul className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
                  <li className="grid gap-1 py-4 sm:grid-cols-[7.5rem_1fr] sm:gap-6 sm:py-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0056D2]">
                      Promise
                    </p>
                    <p className="text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                      100% satisfaction commitment on every delivery.
                    </p>
                  </li>
                  <li className="grid gap-1 py-4 sm:grid-cols-[7.5rem_1fr] sm:gap-6 sm:py-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0056D2]">
                      Support
                    </p>
                    <p className="text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                      Local team ready to help with orders, schedules and plans.
                    </p>
                  </li>
                </ul>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/register"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0056D2] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0047b0] sm:w-auto"
                  >
                    Create your account
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                  <Link
                    href="#about"
                    className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-slate-300 px-6 text-sm font-semibold text-[#0A1931] transition-colors hover:border-[#0056D2] hover:text-[#0056D2] sm:w-auto"
                  >
                    Learn more
                  </Link>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <Image
                  src={IMAGES.ctaDelivery}
                  alt="F Net delivery professional with a water jug"
                  width={720}
                  height={900}
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="h-auto w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────────── */}
      <section
        id="about"
        className="scroll-mt-20 border-t border-slate-200/80 bg-[#fafbfc] py-14 sm:scroll-mt-24 sm:py-24"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0056D2]">
              About us
            </p>
            <h2 className="mt-3 text-[1.75rem] font-bold tracking-tight text-[#0A1931] sm:text-4xl">
              A trusted water partner
            </h2>
            <div className="mx-auto mt-5 h-px w-12 bg-[#0056D2]/40" aria-hidden />
            <p className="mt-6 text-[15px] leading-relaxed text-slate-600 sm:text-lg">
              F Net Water Hub delivers purified water with the precision of a
              modern service and the care of a local partner — for homes,
              offices and institutions across Ghana.
            </p>
          </div>

          <div className="mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 sm:aspect-[5/4]">
              <Image
                src={IMAGES.dispenser}
                alt="Clean water service for the home and office"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-slate-900/5"
              />
            </div>

            <div>
              <p className="text-[15px] leading-7 text-slate-600 sm:text-base sm:leading-8">
                From your first order to every bottle returned, we keep
                deliveries, refillable exchange, dispenser plans and payments
                fully accounted for — so you always know where your water stands.
              </p>
              <p className="mt-4 text-[15px] leading-7 text-slate-600 sm:text-base sm:leading-8">
                Customers order from their phone. Drivers deliver with care.
                Our team keeps operations running smoothly behind the scenes.
              </p>

              <ul className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
                {ABOUT_PILLARS.map(({ label, text }) => (
                  <li
                    key={label}
                    className="grid gap-1 py-4 sm:grid-cols-[7.5rem_1fr] sm:gap-6 sm:py-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0056D2]">
                      {label}
                    </p>
                    <p className="text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                      {text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section
        id="pricing"
        className="scroll-mt-20 border-t border-slate-200/80 bg-[#fafbfc] py-14 sm:scroll-mt-24 sm:py-24"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0056D2]">
              Pricing
            </p>
            <h2 className="mt-3 text-[1.75rem] font-bold tracking-tight text-[#0A1931] sm:text-4xl">
              Clear packages. No surprises.
            </h2>
            <div className="mx-auto mt-5 h-px w-12 bg-[#0056D2]/40" aria-hidden />
            <p className="mt-6 text-[15px] leading-relaxed text-slate-600 sm:text-base">
              Choose the option that fits your household or business. Every
              package includes reliable delivery and transparent payment options.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:gap-7 lg:mt-16 lg:grid-cols-3 lg:gap-8">
            {PRICING.map(({ name, price, unit, note, features, featured }) => (
              <article
                key={name}
                className={`relative flex flex-col bg-white px-7 pb-8 pt-0 sm:px-8 sm:pb-9 ${
                  featured
                    ? "border-2 border-[#0056D2] shadow-[0_18px_40px_-28px_rgba(0,86,210,0.45)]"
                    : "border border-slate-300 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)]"
                }`}
              >
                {/* Classic top rail */}
                <div
                  className={`mx-auto h-1 w-16 ${
                    featured ? "bg-[#0056D2]" : "bg-slate-300"
                  }`}
                  aria-hidden
                />

                <div className="mt-7 text-center">
                  {featured ? (
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0056D2]">
                      Most popular
                    </p>
                  ) : (
                    <div className="mb-3 h-[15px]" aria-hidden />
                  )}

                  <h3 className="text-lg font-semibold tracking-tight text-[#0A1931]">
                    {name}
                  </h3>

                  <p className="mt-5 text-[2rem] font-bold tracking-tight text-[#0A1931] sm:text-[2.25rem]">
                    {price}
                  </p>
                  <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {unit}
                  </p>

                  <div
                    className="mx-auto mt-5 flex w-full max-w-[9rem] items-center gap-2"
                    aria-hidden
                  >
                    <span className="h-px flex-1 bg-slate-200" />
                    <span className="size-1 rotate-45 bg-[#0056D2]/50" />
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>

                  <p className="mx-auto mt-5 max-w-[16rem] text-sm leading-relaxed text-slate-500">
                    {note}
                  </p>
                </div>

                <ul className="mt-7 flex-1 space-y-3.5 border-t border-slate-200 pt-6">
                  {features.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-slate-600"
                    >
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-[#0056D2]"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`mt-8 inline-flex h-11 w-full items-center justify-center text-sm font-semibold tracking-wide transition-colors ${
                    featured
                      ? "bg-[#0056D2] text-white hover:bg-[#0047b0]"
                      : "border border-[#0A1931] text-[#0A1931] hover:border-[#0056D2] hover:text-[#0056D2]"
                  }`}
                >
                  {price === "Custom" ? "Request a quote" : "Order now"}
                </Link>
              </article>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-xl text-center text-sm text-slate-500">
            Prices may vary by location and delivery schedule. Sign up to see
            options available in your area.
          </p>
        </div>
      </section>
    </>
  );
}
