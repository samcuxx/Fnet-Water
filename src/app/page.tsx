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
  // Estimated comparison against buying 500ml single-use bottles (GH₵ 42 / pack of 24 = 12L => ~GH₵ 3.5 per liter)
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
              className="text-xs sm:text-sm font-bold text-gray-700 hover:text-brand-600 px-3.5 py-2 transition"
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
          2. HERO SECTION (12-COL ASYMMETRIC COMMERCIAL SHOWCASE)
      ========================================================================== */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28 bg-gradient-to-b from-blue-50/50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-brand-700 text-xs font-bold w-fit mb-6 shadow-xs">
                <span className="flex size-2 rounded-full bg-brand-500 animate-pulse" />
                <span>Ghana&apos;s Premium Pure Water & Dispenser Network</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-[1.12]">
                Pure, Crisp Water Delivered{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-sky-500">
                  Directly to Your Door.
                </span>
              </h1>

              {/* Natural Copy (Anti-Slop) */}
              <p className="mt-5 text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed">
                Enjoy 19L pure mineral water refills with zero deposit on empty bottle returns, modern hot and cold dispensers on rent-to-own plans, and scheduled doorstep delivery across Ghana.
              </p>

              {/* Primary Call to Action Row */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
                <Link
                  href="/customer/order"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm sm:text-base font-bold text-white bg-brand-500 hover:bg-brand-600 active:scale-[0.99] shadow-md shadow-brand-500/20 transition cursor-pointer"
                >
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                  <span>Order Refill (GH₵ 25)</span>
                </Link>

                <a
                  href="#dispensers"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm sm:text-base font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition cursor-pointer"
                >
                  <span>Explore Dispensers</span>
                  <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>

              {/* Value Guarantees Row */}
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-gray-600 border-t border-gray-100 pt-6">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                    <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>GH₵ 25 per 19L Refill</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                    <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Zero Deposit on Return</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                    <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Same-Day Scheduled</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                    <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>100% Certified Pure</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card (Realistic Commercial Photography) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                
                {/* Elevated Image Frame */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/15 border-4 border-white aspect-[4/3] sm:aspect-[16/11]">
                  <Image
                    src="/images/landing/hero-commercial.jpg"
                    alt="F Net Water Pure Water Delivery Experience"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover object-center"
                  />
                  {/* Gentle gradient vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Floating Glassmorphism Badge 1: Live Dispatch */}
                <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-3">
                  <span className="flex size-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <div>
                    <div className="text-[11px] font-bold text-gray-900">Live Van Dispatch</div>
                    <div className="text-[10px] text-gray-500">Delivering in your area today</div>
                  </div>
                </div>

                {/* Floating Glassmorphism Badge 2: Bottle Exchange Verified */}
                <div className="absolute -bottom-4 -right-3 sm:-bottom-5 sm:-right-4 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-blue-100 text-brand-600 font-bold text-xs">
                    19L
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Empty Bottle Return</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Zero deposit on 1:1 swap</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          3. OPERATIONAL STATS / PROOF BAR
      ========================================================================== */}
      <section className="py-10 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            
            <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-600">15,000+</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">Bottles Delivered Monthly</div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-600">99.4%</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">On-Time Scheduled Delivery</div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">GH₵ 0</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">Deposit Fee on Empty Swap</div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-600">12 Months</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">Dispenser Rent-to-Own Path</div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          4. PRODUCT CATALOG SHOWCASE (RE-DESIGNED FULL-FRAME COMMERCIAL IMAGES)
      ========================================================================== */}
      <section id="products" className="py-16 sm:py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Pure Drinking Solutions
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mt-1 tracking-tight">
              Simple Products. Clear Pricing.
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              Premium mineral drinking water and smart dispensing hardware for homes, offices, schools, and commercial organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* PRODUCT 1: 18.9L / 19L Refill Bottle */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div>
                {/* Full-Frame Seamless Studio Image Frame */}
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-b from-blue-50/40 to-slate-50 mb-6 border border-gray-100/80 shadow-inner">
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
                  <h3 className="text-lg font-bold text-gray-900">
                    18.9L / 19L Refill Bottle
                  </h3>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-brand-600">GH₵ 25</span>
                    <span className="text-xs text-gray-400 block font-medium">per refill</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                  Food-grade, shatter-proof polycarbonate bottle with integrated ergonomic handle. Return your empty bottle to pay zero deposit fee.
                </p>

                <ul className="space-y-2 text-xs text-gray-600 mb-6 border-t border-gray-100 pt-4">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>100% sealed hygiene cap</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>New bottle deposit: GH₵ 80 (one-time if no empty)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Free exchange with any standard 19L bottle</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/customer/order?product=19L"
                className="w-full text-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-brand-500 hover:bg-brand-600 transition shadow-sm cursor-pointer"
              >
                Order Refill Now
              </Link>
            </div>

            {/* PRODUCT 2: Smart Digital Dispenser */}
            <div id="dispensers" className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-brand-500 shadow-md hover:shadow-lg transition flex flex-col justify-between relative group">
              
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-sky-500 text-white text-[11px] font-bold px-4 py-1 rounded-full shadow-sm z-10">
                Rent-to-Own Available
              </div>

              <div>
                {/* Full-Frame Seamless Studio Image Frame */}
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-b from-blue-50/40 to-slate-50 mb-6 border border-gray-100/80 shadow-inner">
                  <Image
                    src="/images/product/fnet-smart-dispenser.jpg"
                    alt="Smart Digital Dispenser"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    Smart Digital Dispenser
                  </h3>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-brand-600">GH₵ 120</span>
                    <span className="text-xs text-gray-400 block font-medium">/ month (or GH₵ 1,200)</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                  Freestanding modern dispenser with digital LED temperature status and dual hot/cold faucets with child safety lock.
                </p>

                <ul className="space-y-2 text-xs text-gray-600 mb-6 border-t border-gray-100 pt-4">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>12 monthly payments = 100% ownership</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Instant chilled cold and piping hot water</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Free maintenance, filter check & sanitization</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/customer/dispenser"
                className="w-full text-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-brand-500 hover:bg-brand-600 transition shadow-sm cursor-pointer"
              >
                Choose Dispenser Plan
              </Link>
            </div>

            {/* PRODUCT 3: 24-Pack 500ml Bottled Water */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div>
                {/* Full-Frame Seamless Studio Image Frame */}
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-b from-blue-50/40 to-slate-50 mb-6 border border-gray-100/80 shadow-inner">
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
                  <h3 className="text-lg font-bold text-gray-900">
                    24-Pack (500ml) Bottled Water
                  </h3>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-brand-600">GH₵ 42</span>
                    <span className="text-xs text-gray-400 block font-medium">per case</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                  Case of 24 sealed 500ml portable mineral water bottles. Perfect for executive boardrooms, family trips, parties, and conferences.
                </p>

                <ul className="space-y-2 text-xs text-gray-600 mb-6 border-t border-gray-100 pt-4">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>BPA-free recyclable bottles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Crisp, refreshing taste on the go</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Delivered in bulk alongside 19L refills</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/customer/order?product=PACK"
                className="w-full text-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-800 bg-gray-100 hover:bg-gray-200 transition border border-gray-200 cursor-pointer"
              >
                Order Case Pack
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          4.1 GHANA TOP WATER BRANDS AFFILIATION & SWAP NETWORK (NEW DEDICATED SECTION)
      ========================================================================== */}
      <section id="partners" className="py-16 sm:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-brand-700 text-xs font-bold mb-4">
              <span className="size-2 rounded-full bg-brand-500" />
              <span>Certified Universal 19L Bottle Exchange Hub</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Affiliated with Ghana&apos;s Leading Water Producers
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
              We distribute, supply, and accept empty bottle exchanges for Ghana&apos;s most trusted certified mineral water brands. If you have an empty 19L bottle from Voltic, Awake, Bel-Aqua, or Special Ice, our doorstep delivery swaps it with zero deposit penalty.
            </p>
          </div>

          {/* Brand Partner Commercial Photography Lineup Showcase */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white mb-12 aspect-[16/9] max-w-5xl mx-auto">
            <Image
              src="/images/landing/water-partners-lineup.jpg"
              alt="Ghana Top Water Brands Bottle Exchange Lineup (Voltic, Awake, Bel-Aqua, Special Ice, F Net Water)"
              fill
              sizes="(max-width: 1024px) 100vw, 80vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
              <div className="text-xs uppercase tracking-wider font-bold text-sky-400 mb-1">
                Universal 19L Compatibility Standard
              </div>
              <h3 className="text-lg sm:text-2xl font-bold">
                Swap Any Certified Empty Bottle at Your Doorstep
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 max-w-2xl mt-1">
                Every bottle in our circulation passes through automated 7-stage pressure washing, ozone sterilization, and sealed tamper-evident capping.
              </p>
            </div>
          </div>

          {/* Grid of the 5 Major Water Brands in Ghana */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            
            {/* BRAND 1: Voltic */}
            <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-200/80 hover:border-brand-500 hover:bg-white transition hover:shadow-md flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#002D72] text-white font-black text-sm tracking-wider shadow-xs">
                    V
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    100% Swappable
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-brand-600 transition">
                  Voltic (GH) Limited
                </h4>
                <div className="text-[11px] font-semibold text-brand-600 mt-0.5">
                  Natural Mineral Water
                </div>
                <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
                  Ghana&apos;s pioneer mineral water brand. Voltic 19L dispenser bottles are fully accepted for 1:1 empty exchange.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200/60 text-[10px] text-gray-400 font-medium">
                FDA & GSA Certified
              </div>
            </div>

            {/* BRAND 2: Awake */}
            <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-200/80 hover:border-brand-500 hover:bg-white transition hover:shadow-md flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#00A3E0] text-white font-black text-sm tracking-wider shadow-xs">
                    A
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    100% Swappable
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-brand-600 transition">
                  Awake Purified Water
                </h4>
                <div className="text-[11px] font-semibold text-brand-600 mt-0.5">
                  Kasapreko • One4Life
                </div>
                <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
                  Produced under premium ultra-filtration standards. Hand over your Awake 19L empties for fresh sealed refills.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200/60 text-[10px] text-gray-400 font-medium">
                FDA & GSA Certified
              </div>
            </div>

            {/* BRAND 3: Bel-Aqua */}
            <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-200/80 hover:border-brand-500 hover:bg-white transition hover:shadow-md flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#0047AB] text-white font-black text-sm tracking-wider shadow-xs">
                    B
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    100% Swappable
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-brand-600 transition">
                  Bel-Aqua Mineral Water
                </h4>
                <div className="text-[11px] font-semibold text-brand-600 mt-0.5">
                  Blow Chem • Alkaline pH 7.5+
                </div>
                <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
                  Pure natural alkaline mineral water. Bel-Aqua 19L bottles are seamlessly swappable across all delivery zones.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200/60 text-[10px] text-gray-400 font-medium">
                FDA & GSA Certified
              </div>
            </div>

            {/* BRAND 4: Special Ice */}
            <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-200/80 hover:border-brand-500 hover:bg-white transition hover:shadow-md flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#0077BE] text-white font-black text-sm tracking-wider shadow-xs">
                    S
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    100% Swappable
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-brand-600 transition">
                  Special Ice Water
                </h4>
                <div className="text-[11px] font-semibold text-brand-600 mt-0.5">
                  Special Ice Co. Limited
                </div>
                <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
                  Naturally sourced mineral water from underground aquifers. Compatible with our standard 19L bottle exchange network.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200/60 text-[10px] text-gray-400 font-medium">
                FDA & GSA Certified
              </div>
            </div>

            {/* BRAND 5: Verna */}
            <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-200/80 hover:border-brand-500 hover:bg-white transition hover:shadow-md flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#00875A] text-white font-black text-sm tracking-wider shadow-xs">
                    V
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    100% Swappable
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-brand-600 transition">
                  Verna Mineral Water
                </h4>
                <div className="text-[11px] font-semibold text-brand-600 mt-0.5">
                  Twellium Industrial Ghana
                </div>
                <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
                  Award-winning pure mountain mineral water. Fully accepted on all morning, afternoon, and evening delivery runs.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200/60 text-[10px] text-gray-400 font-medium">
                FDA & GSA Certified
              </div>
            </div>

          </div>

          {/* Quality Assurance Strip */}
          <div className="mt-10 p-5 rounded-2xl bg-blue-50/70 border border-blue-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-brand-500 text-white font-bold shrink-0">
                ✓
              </div>
              <div>
                <div className="font-bold text-gray-900">100% Food and Drugs Authority (FDA) Ghana Compliant</div>
                <div className="text-gray-500 text-[11px]">Strict compliance with national potable drinking water safety and packaging standards.</div>
              </div>
            </div>

            <Link
              href="/customer/order"
              className="whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold text-brand-700 bg-white hover:bg-gray-50 border border-blue-200 shadow-xs transition"
            >
              Order & Exchange Empties →
            </Link>
          </div>

        </div>
      </section>

      {/* =========================================================================
          5. HOW IT WORKS (3-STEP PROGRESSION)
      ========================================================================== */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-gray-50/40 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Effortless Delivery
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
              How F Net Water Hub Works
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              Three simple steps from tap on your phone to pure water in your glass.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200/80 shadow-xs relative">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-brand-500 text-white font-extrabold text-sm mb-6 shadow-sm">
                01
              </span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Order Online in Seconds
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Select your 19L refills or bottled packs. Choose your preferred delivery time slot: Morning (8am–12pm), Afternoon (12pm–4pm), or Evening (4pm–7pm).
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200/80 shadow-xs relative">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-brand-500 text-white font-extrabold text-sm mb-6 shadow-sm">
                02
              </span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Doorstep Bottle Exchange
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Our delivery van arrives at your doorstep. The driver delivers full sealed 19L bottles and collects your empty bottles (F Net, Voltic, Awake, Bel-Aqua) with zero deposit charge.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200/80 shadow-xs relative">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-brand-500 text-white font-extrabold text-sm mb-6 shadow-sm">
                03
              </span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Pay With Total Ease
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Pay securely using Mobile Money (MTN, Telecel, AT), Debit Card, or Cash on Delivery. Receive instant SMS receipt on your phone.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          6. SMART DISPENSER SPOTLIGHT (BENTO FEATURE)
      ========================================================================== */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-blue-50/40 to-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left: Lifestyle Dispenser Photography */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] sm:aspect-[16/11]">
                <Image
                  src="/images/landing/dispenser-lifestyle.jpg"
                  alt="F Net Water Smart Dispenser Lifestyle"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* Right: Rent-to-Own Explanation */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Own Your Smart Hardware
              </span>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Get a Hot & Cold Dispenser with zero upfront stress.
              </h2>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Through our 12-month Rent-to-Own program, your monthly payment of GH₵ 120 builds equity. After 12 successful monthly payments, the dispenser belongs to you completely.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">Dual Hot & Cold Taps</div>
                  <div className="text-xs text-gray-500 mt-1">Instant hot tea & chilled cold water</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">Digital LED Indicators</div>
                  <div className="text-xs text-gray-500 mt-1">Live temperature & status alerts</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">Free Sanitization</div>
                  <div className="text-xs text-gray-500 mt-1">Routine cleaning and maintenance</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">Child-Safety Lock</div>
                  <div className="text-xs text-gray-500 mt-1">Safe hot water dispensing</div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/customer/dispenser"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-brand-500 hover:bg-brand-600 shadow-sm transition active:scale-[0.99] cursor-pointer"
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
          7. INTERACTIVE REFILL USAGE & SAVINGS ESTIMATOR
      ========================================================================== */}
      <section id="calculator" className="py-16 sm:py-24 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Interactive Estimator
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
              Estimate Your Monthly Water Consumption
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              Slide to see how much water you need and calculate your savings.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50/60 to-white rounded-3xl p-6 sm:p-10 border border-blue-100 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Slider Control */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-600">Weekly usage for home/office:</span>
                    <span className="text-lg font-extrabold text-brand-600">
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
                    <span>1 bottle (Small Family)</span>
                    <span>5 bottles (Active Home)</span>
                    <span>15+ bottles (Office/Clinic)</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-200/80 flex items-center justify-between text-xs text-gray-600">
                  <span>Equivalent in standard 500ml bottles:</span>
                  <span className="font-bold text-gray-900">{monthlyLiters * 2} bottles / month</span>
                </div>
              </div>

              {/* Output Summary Card */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-blue-200/80 shadow-xs space-y-3.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-medium">Monthly Refills:</span>
                  <span className="font-bold text-gray-900">{monthlyBottles} bottles</span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-medium">Total Volume:</span>
                  <span className="font-bold text-gray-900">{monthlyLiters} Liters</span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-medium">Estimated Monthly Cost:</span>
                  <span className="text-base font-extrabold text-brand-600">
                    GH₵ {monthlyCost}
                  </span>
                </div>

                {monthlySavings > 0 && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold flex items-center justify-between">
                    <span>Estimated Monthly Savings:</span>
                    <span className="font-bold">GH₵ {monthlySavings}</span>
                  </div>
                )}

                <Link
                  href={`/customer/order?qty=${weeklyBottles}`}
                  className="w-full inline-flex items-center justify-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-brand-500 hover:bg-brand-600 transition shadow-sm cursor-pointer mt-2"
                >
                  Order This Quantity
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          8. DEDICATED LOGISTICS & FLEET SECTION
      ========================================================================== */}
      <section id="fleet" className="py-16 sm:py-24 bg-gray-50/60 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left: Photorealistic Fleet Photograph */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] sm:aspect-[16/11]">
                <Image
                  src="/images/landing/logistics-fleet.jpg"
                  alt="F Net Water Delivery Fleet on Accra streets"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* Right: Fleet Operations Details */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Reliable Doorstep Logistics
              </span>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Dedicated Van Fleet Delivering Across Accra Daily.
              </h2>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Our custom water delivery vans run structured daily dispatch routes. You receive real-time SMS updates when your driver departs and when they arrive at your gate.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">3 Delivery Time Slots</div>
                  <div className="text-xs text-gray-500 mt-1">Morning, afternoon, or evening</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">Direct Gate Delivery</div>
                  <div className="text-xs text-gray-500 mt-1">Drivers carry bottles to your kitchen</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">Live SMS Tracking</div>
                  <div className="text-xs text-gray-500 mt-1">Notifications when van is nearby</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">Expanding Coverage</div>
                  <div className="text-xs text-gray-500 mt-1">East Legon, Cantonments, Osu & more</div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/customer/order"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-brand-500 hover:bg-brand-600 shadow-sm transition active:scale-[0.99] cursor-pointer"
                >
                  <span>Schedule Your First Delivery</span>
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
      <section className="py-16 sm:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Trusted by Homes and Businesses
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
              What Our Customers Say
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              Real feedback from households and offices across Greater Accra.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-7 rounded-3xl bg-gray-50/80 border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                  &ldquo;The bottle exchange is so straightforward. I leave my empty 19L bottle by the porch in the morning, and by 11am the driver has swapped it with a sealed fresh bottle. No hassle with deposit fees.&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200/80">
                <div className="text-xs font-bold text-gray-900">Ama Osei</div>
                <div className="text-[11px] text-gray-500">Homeowner, East Legon</div>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-gray-50/80 border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                  &ldquo;We signed up for the smart dispenser on rent-to-own for our design agency. The water is ice-cold on hot afternoons and hot for coffee in the mornings. Having automatic monthly deliveries keeps our staff productive.&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200/80">
                <div className="text-xs font-bold text-gray-900">Kofi Antwi</div>
                <div className="text-[11px] text-gray-500">Operations Lead, Ridge</div>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-gray-50/80 border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                  &ldquo;Clean taste and professional delivery staff. The driver carries the heavy bottles straight up to our pantry with a smile. Paying via Mobile Money takes literally 10 seconds.&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200/80">
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
      <footer className="bg-gray-950 text-gray-400 py-14 border-t border-gray-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-xs text-gray-400 leading-relaxed">
              Ghana&apos;s leading technology-driven water supply, bottle exchange, smart dispenser tracking, and scheduled delivery platform.
            </p>
            <div className="text-[11px] text-gray-500">
              Accra, Greater Accra Region, Ghana
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3.5">Water Products</h4>
            <ul className="space-y-2">
              <li><Link href="/customer/order?product=19L" className="hover:text-white transition">18.9L / 19L Refill Bottle</Link></li>
              <li><Link href="/customer/dispenser" className="hover:text-white transition">Smart Digital Dispenser</Link></li>
              <li><Link href="/customer/order?product=PACK" className="hover:text-white transition">500ml Bottled Water (24-Pack)</Link></li>
              <li><a href="#partners" className="hover:text-white transition">Voltic & Awake Bottle Swap</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3.5">Dedicated Portals</h4>
            <ul className="space-y-2">
              <li><Link href="/customer" className="hover:text-white transition">Customer Portal</Link></li>
              <li><Link href="/driver" className="hover:text-white transition">Driver Delivery App</Link></li>
              <li><Link href="/manager" className="hover:text-white transition">Dispatch & Operations</Link></li>
              <li><Link href="/admin" className="hover:text-white transition">Executive Admin Overview</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3.5">Customer Support</h4>
            <div className="space-y-2">
              <div>Phone: +233 24 000 0000</div>
              <div>Operating Hours: Mon – Sat, 6:00 AM – 7:00 PM</div>
              <div className="pt-3 text-[11px] text-gray-500">
                &copy; {new Date().getFullYear()} F Net Water Hub. All rights reserved.
              </div>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
