"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import Logo from "@/components/brand/Logo";

export default function HomePage() {
  const { setTheme } = useTheme();

  // Enforce strict light mode on the landing page
  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  // Consumption calculator state
  const [weeklyBottles, setWeeklyBottles] = useState<number>(3);
  const monthlyBottles = weeklyBottles * 4;
  const monthlyLiters = Math.round(monthlyBottles * 18.9);
  const refillPrice = 25; // GH₵
  const monthlyCost = monthlyBottles * refillPrice;
  const singleUseCost = Math.round(monthlyLiters * 3.5);
  const monthlySavings = Math.max(0, singleUseCost - monthlyCost);

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-brand-500 selection:text-white">
      {/* =========================================================================
          1. TOP NAVIGATION (STICKY)
      ========================================================================== */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo size="md" href="/" />
            
            <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-gray-600">
              <a href="#products" className="hover:text-brand-600 transition">
                Water Products
              </a>
              <a href="#partners" className="hover:text-brand-600 transition">
                Top Brands & Swap
              </a>
              <a href="#dispensers" className="hover:text-brand-600 transition">
                Smart Dispensers
              </a>
              <a href="#how-it-works" className="hover:text-brand-600 transition">
                How It Works
              </a>
              <a href="#calculator" className="hover:text-brand-600 transition">
                Refill Estimator
              </a>
              <a href="#fleet" className="hover:text-brand-600 transition">
                Delivery Fleet
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-bold text-gray-700 hover:text-brand-600 px-3 py-2 transition"
            >
              Sign In
            </Link>
            <Link
              href="/customer/order"
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 shadow-sm transition active:scale-[0.98]"
            >
              <span>Order Water</span>
              <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION
      ========================================================================== */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 bg-gradient-to-b from-blue-50/50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-brand-700 text-xs font-bold w-fit mb-4 sm:mb-5 shadow-xs">
                <span className="flex size-2 rounded-full bg-brand-500 animate-pulse" />
                <span>Ghana&apos;s Premium Pure Water & Dispenser Service</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-[1.12]">
                Pure Water Delivered{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-sky-500">
                  to Your Door.
                </span>
              </h1>

              {/* Concise Storytelling Copy */}
              <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-gray-600 max-w-xl leading-relaxed">
                Fresh 19L mineral refills, zero-deposit bottle exchanges, and modern hot and cold dispensers delivered directly to your home or office.
              </p>

              {/* Mobile Side-by-Side CTAs (Grid on mobile, flex on desktop) */}
              <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-4 max-w-sm sm:max-w-none">
                <Link
                  href="/customer/order"
                  className="h-12 sm:h-13 px-3 sm:px-6 rounded-xl sm:rounded-2xl text-xs sm:text-base font-bold text-white bg-brand-500 hover:bg-brand-600 active:scale-[0.99] shadow-md shadow-brand-500/20 transition cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 text-center"
                >
                  <svg className="size-4 sm:size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                  <span>Order Refill</span>
                </Link>

                <a
                  href="#dispensers"
                  className="h-12 sm:h-13 px-3 sm:px-6 rounded-xl sm:rounded-2xl text-xs sm:text-base font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200/90 transition cursor-pointer flex items-center justify-center gap-1.5 text-center"
                >
                  <span>Dispensers</span>
                  <svg className="size-3.5 sm:size-4 shrink-0 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>

              {/* Value Guarantees Row */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs font-semibold text-gray-600 border-t border-gray-100 pt-5">
                <div className="flex items-center gap-2">
                  <div className="flex size-5 sm:size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                    <svg className="size-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>GH₵ 25 per Refill</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex size-5 sm:size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                    <svg className="size-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Zero Deposit Swap</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex size-5 sm:size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                    <svg className="size-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Same-Day Slots</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex size-5 sm:size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                    <svg className="size-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Certified Pure</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative mt-4 lg:mt-0">
              <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                
                {/* Elevated Image Frame */}
                <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-blue-900/10 border-4 border-white aspect-[4/3] sm:aspect-[16/11]">
                  <Image
                    src="/images/landing/hero-commercial.jpg"
                    alt="F Net Water Pure Water Delivery Experience"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Floating Badge 1: Live Dispatch */}
                <div className="absolute -top-3 -left-2 sm:-top-4 sm:-left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-gray-100 flex items-center gap-2.5">
                  <span className="flex size-2 rounded-full bg-emerald-500 animate-ping" />
                  <div>
                    <div className="text-[11px] font-bold text-gray-900">Live Delivery Fleet</div>
                    <div className="text-[10px] text-gray-500">Scheduled runs active today</div>
                  </div>
                </div>

                {/* Floating Badge 2: Bottle Exchange Verified */}
                <div className="absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-3 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-md border border-gray-100 flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-xl bg-blue-100 text-brand-600 font-bold text-xs">
                    19L
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Bottle Exchange</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Zero deposit on swap</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          3. OPERATIONAL STATS BAR
      ========================================================================== */}
      <section className="py-8 sm:py-10 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            
            <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-600">15,000+</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">Monthly Refills</div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-600">99.4%</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">On-Time Deliveries</div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">GH₵ 0</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">Empty Return Deposit</div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-600">12 Months</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">Rent-to-Own Payoff</div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          4. PRODUCT CATALOG SHOWCASE
      ========================================================================== */}
      <section id="products" className="py-14 sm:py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Pure Drinking Solutions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
              Simple Products. Clear Pricing.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              Clean mineral water and smart dispensing hardware for homes and offices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* PRODUCT 1: 18.9L / 19L Refill Bottle */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div>
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-b from-blue-50/40 to-slate-50 mb-5 border border-gray-100/80 shadow-inner">
                  <Image
                    src="/images/product/fnet-18l-bottle.jpg"
                    alt="18.9L / 19L Refill Bottle"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-brand-500 text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-xs">
                    Most Popular
                  </div>
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    18.9L Refill Bottle
                  </h3>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl font-extrabold text-brand-600">GH₵ 25</span>
                    <span className="text-[11px] text-gray-400 block font-medium">per refill</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Food-grade shatter-proof bottle with handle. Hand over any empty bottle to pay zero deposit.
                </p>

                <ul className="space-y-1.5 text-xs text-gray-600 mb-5 border-t border-gray-100 pt-3.5">
                  <li className="flex items-center gap-2">
                    <svg className="size-3.5 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>100% sealed hygiene cap</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="size-3.5 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Free swap with any empty 19L bottle</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="size-3.5 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Optional new bottle: GH₵ 80 (one-time)</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/customer/order?product=19L"
                className="w-full text-center py-2.5 sm:py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-brand-500 hover:bg-brand-600 transition shadow-sm cursor-pointer"
              >
                Order Refill
              </Link>
            </div>

            {/* PRODUCT 2: Smart Digital Dispenser */}
            <div id="dispensers" className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-brand-500 shadow-md hover:shadow-lg transition flex flex-col justify-between relative group">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-sky-500 text-white text-[11px] font-bold px-3.5 py-0.5 rounded-full shadow-sm z-10 whitespace-nowrap">
                Rent-to-Own
              </div>

              <div>
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-b from-blue-50/40 to-slate-50 mb-5 border border-gray-100/80 shadow-inner">
                  <Image
                    src="/images/product/fnet-smart-dispenser.jpg"
                    alt="Smart Digital Dispenser"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Smart Dispenser
                  </h3>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl font-extrabold text-brand-600">GH₵ 120</span>
                    <span className="text-[11px] text-gray-400 block font-medium">/ month (or GH₵ 1,200)</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Dual hot/cold faucets with child lock. Pay monthly towards full ownership in 12 months.
                </p>

                <ul className="space-y-1.5 text-xs text-gray-600 mb-5 border-t border-gray-100 pt-3.5">
                  <li className="flex items-center gap-2">
                    <svg className="size-3.5 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>12 monthly payments = 100% yours</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="size-3.5 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Instant chilled and hot water</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="size-3.5 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Free sanitization and support</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/customer/dispenser"
                className="w-full text-center py-2.5 sm:py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-brand-500 hover:bg-brand-600 transition shadow-sm cursor-pointer"
              >
                Choose Dispenser
              </Link>
            </div>

            {/* PRODUCT 3: 24-Pack 500ml Bottled Water */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div>
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-b from-blue-50/40 to-slate-50 mb-5 border border-gray-100/80 shadow-inner">
                  <Image
                    src="/images/product/fnet-water-bottles-pack.jpg"
                    alt="24-Pack 500ml Bottled Water"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-gray-900 text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-xs">
                    Event Case
                  </div>
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    24-Pack (500ml) Case
                  </h3>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl font-extrabold text-brand-600">GH₵ 42</span>
                    <span className="text-[11px] text-gray-400 block font-medium">per case</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Case of 24 sealed 500ml bottles. Ideal for meetings, travel, workouts, and family gatherings.
                </p>

                <ul className="space-y-1.5 text-xs text-gray-600 mb-5 border-t border-gray-100 pt-3.5">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>BPA-free recyclable bottles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Crisp, refreshing mineral water</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Delivered directly with your refills</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/customer/order?product=PACK"
                className="w-full text-center py-2.5 sm:py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-800 bg-gray-100 hover:bg-gray-200 transition border border-gray-200 cursor-pointer"
              >
                Order Case Pack
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          4.1 GHANA TOP WATER BRANDS AFFILIATION & SWAP NETWORK
      ========================================================================== */}
      <section id="partners" className="py-14 sm:py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-brand-700 text-xs font-bold mb-3">
              <span className="size-2 rounded-full bg-brand-500" />
              <span>Universal Bottle Exchange</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Affiliated with Ghana&apos;s Top Water Producers
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              We supply and accept empty 19L bottle exchanges for Ghana&apos;s most trusted certified brands with zero deposit penalties.
            </p>
          </div>

          {/* Lineup Commercial Photo */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg border-4 border-white mb-10 aspect-[21/8]  mx-auto">
            <Image
              src="/images/landing/water-partners-lineup.jpg"
              alt="Ghana Top Water Brands Bottle Exchange Lineup"
              fill
              sizes="(max-width: 1024px) 100vw, 75vw"
              className="object-cover object-center"
            />
           
          </div>

       
      
        </div>
      </section>

      {/* =========================================================================
          5. HOW IT WORKS (3 SIMPLE STEPS)
      ========================================================================== */}
      <section id="how-it-works" className="py-14 sm:py-20 bg-gray-50/40 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Effortless Delivery
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
              How It Works
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-500">
              Get fresh drinking water in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Step 1 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-gray-200/80 shadow-xs">
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-500 text-white font-extrabold text-xs mb-4 shadow-sm">
                01
              </span>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">
                Order Online
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Pick your refills or cases online and select your preferred delivery time slot.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-gray-200/80 shadow-xs">
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-500 text-white font-extrabold text-xs mb-4 shadow-sm">
                02
              </span>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">
                Doorstep Bottle Swap
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Our driver delivers sealed bottles and collects your empties with zero deposit charge.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-gray-200/80 shadow-xs">
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-500 text-white font-extrabold text-xs mb-4 shadow-sm">
                03
              </span>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">
                Pay with Ease
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Pay easily via Mobile Money, Card, or Cash on Delivery with instant SMS receipts.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          6. SMART DISPENSER SPOTLIGHT
      ========================================================================== */}
      <section className="py-14 sm:py-20 bg-gradient-to-b from-blue-50/40 to-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Lifestyle Dispenser Photography */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white aspect-[4/3] sm:aspect-[16/11]">
                <Image
                  src="/images/landing/dispenser-lifestyle.jpg"
                  alt="F Net Water Smart Dispenser Lifestyle"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* Right: Rent-to-Own Details */}
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Own Your Smart Hardware
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Hot & cold water on demand. Pay monthly towards ownership.
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Our 12-month Rent-to-Own plan lets you enjoy a modern dispenser for GH₵ 120/month. After 12 payments, the dispenser is 100% yours.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">Dual Hot & Cold Taps</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Instant tea and chilled water</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">Digital LED Screen</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Live temperature status</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">Free Sanitization</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Routine cleaning & maintenance</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">Child-Safety Lock</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Safe hot water dispensing</div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/customer/dispenser"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-brand-500 hover:bg-brand-600 shadow-sm transition active:scale-[0.99] cursor-pointer"
                >
                  <span>Apply for Dispenser Plan</span>
                  <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          7. REFILL ESTIMATOR
      ========================================================================== */}
      <section id="calculator" className="py-14 sm:py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Interactive Estimator
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
              Estimate Your Monthly Usage
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Slide to calculate how much water you need and see your savings.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50/60 to-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              
              {/* Slider Control */}
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-600">Weekly usage:</span>
                    <span className="text-base font-extrabold text-brand-600">
                      {weeklyBottles} {weeklyBottles === 1 ? "bottle" : "bottles"} / week
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={weeklyBottles}
                    onChange={(e) => setWeeklyBottles(parseInt(e.target.value, 10))}
                    aria-label="Bottles per week"
                    className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                  
                  <div className="flex justify-between text-[11px] text-gray-400 mt-2 font-medium">
                    <span>1 bottle</span>
                    <span>5 bottles</span>
                    <span>15+ bottles</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center justify-between text-xs text-gray-600">
                  <span>Standard 500ml bottle equivalent:</span>
                  <span className="font-bold text-gray-900">{monthlyLiters * 2} bottles / month</span>
                </div>
              </div>

              {/* Output Summary Card */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-blue-200/80 shadow-xs space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Monthly Refills:</span>
                  <span className="font-bold text-gray-900">{monthlyBottles} bottles</span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Volume:</span>
                  <span className="font-bold text-gray-900">{monthlyLiters} Liters</span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Estimated Cost:</span>
                  <span className="text-base font-extrabold text-brand-600">
                    GH₵ {monthlyCost}
                  </span>
                </div>

                {monthlySavings > 0 && (
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold flex items-center justify-between">
                    <span>Monthly Savings:</span>
                    <span className="font-bold">GH₵ {monthlySavings}</span>
                  </div>
                )}

                <Link
                  href={`/customer/order?qty=${weeklyBottles}`}
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-brand-500 hover:bg-brand-600 transition shadow-sm cursor-pointer mt-1"
                >
                  Order This Quantity
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          8. DEDICATED LOGISTICS & FLEET
      ========================================================================== */}
      <section id="fleet" className="py-14 sm:py-20 bg-gray-50/60 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Photorealistic Fleet Photograph */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white aspect-[4/3] sm:aspect-[16/11]">
                <Image
                  src="/images/landing/logistics-fleet.jpg"
                  alt="F Net Water Delivery Fleet"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* Right: Fleet Operations Details */}
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Reliable Doorstep Logistics
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Dedicated Van Fleet Delivering Across Accra Daily.
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Scheduled morning, afternoon, and evening van routes with real-time SMS arrival alerts sent to your phone.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">3 Delivery Slots</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Morning, afternoon, evening</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">Gate Delivery</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Carried straight to your pantry</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">SMS Tracking</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Alerts when driver is near</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">Accra Coverage</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">East Legon, Osu, Cantonments</div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/customer/order"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-brand-500 hover:bg-brand-600 shadow-sm transition active:scale-[0.99] cursor-pointer"
                >
                  <span>Schedule Delivery</span>
                  <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          9. CUSTOMER EXPERIENCES / TESTIMONIALS
      ========================================================================== */}
      <section className="py-14 sm:py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Trusted in Ghana
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
              What Our Customers Say
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Real feedback from homes and offices across Greater Accra.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            <div className="p-6 rounded-3xl bg-gray-50/80 border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 gap-1 mb-2.5 text-xs">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                  &ldquo;I leave my empty bottle by the porch in the morning, and the driver swaps it with a sealed fresh bottle before noon. Zero deposit hassle.&rdquo;
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-gray-200/80">
                <div className="text-xs font-bold text-gray-900">Ama Osei</div>
                <div className="text-[11px] text-gray-500">Homeowner, East Legon</div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gray-50/80 border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 gap-1 mb-2.5 text-xs">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                  &ldquo;Ice-cold water in the afternoon and hot tea in the morning for our team. The rent-to-own plan is super convenient.&rdquo;
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-gray-200/80">
                <div className="text-xs font-bold text-gray-900">Kofi Antwi</div>
                <div className="text-[11px] text-gray-500">Agency Lead, Ridge</div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gray-50/80 border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 gap-1 mb-2.5 text-xs">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                  &ldquo;Clean taste and polite drivers who carry the heavy bottles straight up to our pantry. Paying with Mobile Money takes 10 seconds.&rdquo;
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-gray-200/80">
                <div className="text-xs font-bold text-gray-900">Dr. Naa Korsah</div>
                <div className="text-[11px] text-gray-500">Clinic Director, Osu</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          10. FOOTER
      ========================================================================== */}
      <footer className="bg-gray-950 text-gray-400 py-12 border-t border-gray-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <Logo size="md" />
            <p className="text-xs text-gray-400 leading-relaxed">
              Ghana&apos;s leading water supply, bottle exchange, and smart dispenser platform.
            </p>
            <div className="text-[11px] text-gray-500">
              Accra, Greater Accra Region, Ghana
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Products</h4>
            <ul className="space-y-1.5">
              <li><Link href="/customer/order?product=19L" className="hover:text-white transition">18.9L / 19L Refill Bottle</Link></li>
              <li><Link href="/customer/dispenser" className="hover:text-white transition">Smart Digital Dispenser</Link></li>
              <li><Link href="/customer/order?product=PACK" className="hover:text-white transition">500ml Bottled Water (24-Pack)</Link></li>
              <li><a href="#partners" className="hover:text-white transition">Voltic & Awake Bottle Swap</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Portals</h4>
            <ul className="space-y-1.5">
              <li><Link href="/customer" className="hover:text-white transition">Customer Portal</Link></li>
              <li><Link href="/driver" className="hover:text-white transition">Driver Delivery App</Link></li>
              <li><Link href="/manager" className="hover:text-white transition">Dispatch & Operations</Link></li>
              <li><Link href="/admin" className="hover:text-white transition">Executive Admin Overview</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Support</h4>
            <div className="space-y-1.5">
              <div>Phone: +233 24 000 0000</div>
              <div>Hours: Mon – Sat, 6:00 AM – 7:00 PM</div>
              <div className="pt-2 text-[11px] text-gray-500">
                &copy; {new Date().getFullYear()} F Net Water Hub. All rights reserved.
              </div>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
