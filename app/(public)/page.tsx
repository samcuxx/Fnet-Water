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

import { buttonClasses } from "@/components/ui";

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
   * Source: public/landing/cta-delivery.jpg
   */
  ctaDelivery: "/landing/cta-delivery.jpg",
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
    note: "Per filled bottle · empties returned",
  },
  {
    name: "Take-away pack",
    price: "From GH₵ 8",
    note: "500ml & 1.5L packs available",
  },
  {
    name: "Bulk supply",
    price: "Custom",
    note: "Homes, offices & institutions",
  },
] as const;

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        id="home"
        className="relative overflow-hidden bg-[#eaf3ff]"
      >
        {/* Full-section background — replace public/landing/hero.png later */}
        <Image
          src={IMAGES.hero}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-[72%_center] sm:object-right"
          aria-hidden
        />
        {/* Soft left wash for text only — products stay sharp on the right */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-[min(100%,36rem)] bg-gradient-to-r from-white/70 via-white/35 to-transparent"
        />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24 xl:py-28">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              <span className="block text-[#0A1931]">Pure Water.</span>
              <span className="block text-[#0A1931]">Delivered.</span>
              <span className="block text-[#0056D2]">Every Time.</span>
            </h1>

            <p className="mt-5 max-w-md text-base leading-relaxed text-[#4A5568] sm:text-lg">
              F Net Water Hub provides clean, safe and reliable water delivery
              at your convenience. Order, track and manage all your water needs
              in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#0056D2] px-6 text-base font-semibold text-white transition-colors hover:bg-[#0047b0]"
              >
                Order Water Now
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-[#0056D2] bg-white/90 px-6 text-base font-semibold text-[#0056D2] backdrop-blur-sm transition-colors hover:bg-white"
              >
                Create Account
              </Link>
            </div>

            <ul className="mt-9 flex flex-wrap gap-x-7 gap-y-3">
              {HERO_TRUST.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 text-sm font-medium text-[#4A5568]"
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
      <section id="services" className="scroll-mt-24 bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Why choose F Net Water Hub?
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0A1931] sm:text-4xl">
              Quality Water. Exceptional Service.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4 xl:gap-5">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center shadow-[0_4px_20px_-8px_rgba(15,23,42,0.12)] transition-shadow hover:shadow-[0_12px_28px_-12px_rgba(0,86,210,0.22)]"
              >
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#E8F1FF] text-[#0056D2]">
                  <Icon className="size-6 stroke-[1.75]" aria-hidden />
                </span>
                <h3 className="mt-5 text-[0.95rem] font-bold leading-snug text-[#0A1931]">
                  {title}
                </h3>
                <p className="mt-2.5 text-[13px] leading-relaxed text-slate-500">
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
        className="scroll-mt-24 bg-white py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0A1931] sm:text-4xl">
              Ordering water has never been this easy
            </h2>
          </div>

          <ol className="relative mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {/* Dashed connector with arrow tips — desktop only */}
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
                  className={`mx-auto flex size-[4.75rem] items-center justify-center rounded-full ${iconWrap}`}
                >
                  <Icon className="size-8 stroke-[1.75]" aria-hidden />
                </span>
                <p
                  className={`mt-5 inline-flex size-7 items-center justify-center rounded-full text-xs font-bold text-white ${badge}`}
                >
                  {no}
                </p>
                <h3 className="mt-3 text-lg font-bold text-[#0A1931]">
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
      <section id="contact" className="scroll-mt-24">
        {/* Stats band — background is a replaceable image */}
        <div className="relative overflow-hidden bg-[#003A8C] pb-28 pt-16 text-white sm:pb-32 sm:pt-20">
          <Image
            src={IMAGES.statsBg}
            alt=""
            fill
            unoptimized
            sizes="100vw"
            className="object-cover object-right"
            aria-hidden
          />
          {/* Light left/center wash for white text — jug stays crisp on the right */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#003A8C]/55 via-[#0056D2]/25 to-transparent"
            aria-hidden
          />

          <div className="relative mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85">
              Trusted by thousands
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Delivering Happiness Every Day
            </h2>

            <div className="mt-12 grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:gap-0">
              {STATS.map(({ value, label, icon: Icon }, index) => (
                <div
                  key={label}
                  className={`flex flex-col items-center px-4 ${
                    index < STATS.length - 1
                      ? "lg:border-r lg:border-white/25"
                      : ""
                  }`}
                >
                  <Icon className="size-7 stroke-[1.5] text-white" aria-hidden />
                  <p className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                    {value}
                  </p>
                  <p className="mt-1 text-sm text-white/90">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overlapping CTA card */}
        <div className="relative z-10 -mt-20 bg-white pb-16 sm:-mt-24 sm:pb-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-t-[1.75rem] border border-slate-100 bg-white shadow-[0_24px_48px_-24px_rgba(15,23,42,0.28)] sm:rounded-[1.75rem]">
              <div className="grid items-stretch lg:grid-cols-[1.05fr_0.85fr_0.95fr]">
                <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
                  <h2 className="text-3xl font-bold tracking-tight text-[#0A1931] sm:text-4xl">
                    Ready to get started?
                  </h2>
                  <p className="mt-4 max-w-sm text-base leading-relaxed text-slate-500">
                    Join thousands of satisfied customers and experience the
                    best water delivery service.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href="/register"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#0056D2] px-6 text-base font-semibold text-white transition-colors hover:bg-[#0047b0]"
                    >
                      Create Your Account
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                    <Link
                      href="#about"
                      className="inline-flex h-12 items-center justify-center rounded-lg border border-[#0056D2] bg-white px-6 text-base font-semibold text-[#0056D2] transition-colors hover:bg-[#0056D2]/5"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>

                <div className="relative min-h-[280px] bg-black lg:min-h-[360px]">
                  <Image
                    src={IMAGES.ctaDelivery}
                    alt="F Net delivery professional with a water jug"
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 30vw"
                    className="object-cover object-center"
                  />
                </div>

                <div className="flex items-center justify-center p-8 sm:p-10">
                  <div className="w-full max-w-xs rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_12px_32px_-16px_rgba(15,23,42,0.25)]">
                    <span className="flex size-12 items-center justify-center rounded-full bg-[#E8F1FF] text-[#0056D2]">
                      <ShieldCheck className="size-6" aria-hidden />
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-[#0A1931]">
                      100% Satisfaction
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      We are committed to providing you the best water delivery
                      experience.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────────── */}
      <section id="about" className="scroll-mt-24 bg-white py-16 sm:py-20">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              About us
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0A1931] sm:text-4xl">
              Water delivery built for Ghana
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600">
              F Net Water Hub brings together ordering, refillable bottle
              exchange, dispenser installment plans, payments and rewards in one
              trusted platform — so every drop and every cedi is accounted for.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Customers order from their phone. Drivers deliver with mobile
              tools. Managers and administrators keep operations running
              smoothly.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-slate-100 shadow-lg ring-1 ring-slate-100">
            <Image
              src={IMAGES.dispenser}
              alt="Modern water dispenser setup"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="scroll-mt-24 border-t border-slate-100 bg-[#f7fbff] py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0A1931] sm:text-4xl">
              Simple packages for every need
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PRICING.map(({ name, price, note }) => (
              <article
                key={name}
                className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm"
              >
                <h3 className="text-lg font-semibold text-[#0A1931]">{name}</h3>
                <p className="mt-4 text-3xl font-bold text-[#0056D2]">{price}</p>
                <p className="mt-2 text-sm text-slate-500">{note}</p>
                <Link
                  href="/register"
                  className={buttonClasses({
                    className: "mt-6",
                    variant: "outline",
                    size: "sm",
                  })}
                >
                  Order now
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
