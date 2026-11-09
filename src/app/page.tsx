"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/brand/Logo";
import ThemeToggleButton from "@/components/common/ThemeToggleButton";

export default function HomePage() {
  const [weeklyBottles, setWeeklyBottles] = useState<number>(3);

  const monthlyBottles = weeklyBottles * 4;
  const monthlyLiters = Math.round(monthlyBottles * 18.9);
  const refillPrice = 25; // GHS
  const monthlyCost = monthlyBottles * refillPrice;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* 1. TOP NAVIGATION */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-gray-950/90 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo size="md" />
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
              <a href="#products" className="hover:text-brand-500 dark:hover:text-blue-light-400 transition">
                Water Products
              </a>
              <a href="#dispensers" className="hover:text-brand-500 dark:hover:text-blue-light-400 transition">
                Smart Dispensers
              </a>
              <a href="#how-it-works" className="hover:text-brand-500 dark:hover:text-blue-light-400 transition">
                How It Works
              </a>
              <a href="#calculator" className="hover:text-brand-500 dark:hover:text-blue-light-400 transition">
                Refill Calculator
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggleButton showLabel={false} />
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-brand-600 dark:text-gray-200 dark:hover:text-blue-light-400 px-3 py-2 transition"
            >
              Sign In
            </Link>
            <Link
              href="/customer/order"
              className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 shadow-sm transition active:scale-[0.98]"
            >
              Order Water
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.12]">
                Pure Water Delivered{" "}
                <span className="text-brand-500 dark:text-blue-light-400">to Your Door</span>
              </h1>

              <p className="mt-5 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed">
                Order 19L refills, return empty bottles with zero deposit fee, and manage smart dispensers from your phone.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href="/customer/order"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm sm:text-base font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 shadow-theme-xs transition"
                >
                  <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.2-1H3z" />
                    <path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Order Refill Now
                </Link>

                <a
                  href="#dispensers"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition"
                >
                  View Dispensers
                </a>
              </div>

              {/* Value Points */}
              <div className="mt-10 flex flex-wrap items-center gap-6 sm:gap-8 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="size-4 text-brand-500 dark:text-blue-light-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <span>GH₵ 25 per 19L refill</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="size-4 text-brand-500 dark:text-blue-light-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <span>Zero fee on empty returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="size-4 text-brand-500 dark:text-blue-light-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <span>100% pure, certified</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-sky-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 aspect-[4/5] sm:aspect-[3/4]">
                  <Image
                    src="/images/product/fnet-18l-bottle.jpg"
                    alt="F Net 18.9L Water Refill Jug"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT CATALOG */}
      <section id="products" className="py-16 sm:py-20 bg-gray-50/60 dark:bg-gray-900/40 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Water Products
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Clean mineral drinking water for homes, offices, and events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* PRODUCT 1: 18.9L Refill */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800/40 mb-4 flex items-center justify-center">
                  <Image
                    src="/images/product/fnet-18l-bottle.jpg"
                    alt="18.9L Refill Bottle"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain p-3"
                  />
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    18.9L Refill Bottle
                  </h3>
                  <div className="text-right">
                    <span className="text-lg font-bold text-brand-600 dark:text-blue-light-400">GH₵ 25</span>
                    <span className="text-xs text-gray-400 block">per refill</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                  Polycarbonate bottle with handle. Return your empty bottle to pay zero deposit fee.
                </p>
              </div>

              <Link
                href="/customer/order?product=19L"
                className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition shadow-sm"
              >
                Order Refill
              </Link>
            </div>

            {/* PRODUCT 2: Smart Dispenser */}
            <div id="dispensers" className="bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 border-brand-500/30 dark:border-brand-500/40 shadow-sm flex flex-col justify-between">
              <div>
                <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800/40 mb-4 flex items-center justify-center">
                  <Image
                    src="/images/product/fnet-smart-dispenser.jpg"
                    alt="Smart Digital Dispenser"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain p-3"
                  />
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Smart Digital Dispenser
                  </h3>
                  <div className="text-right">
                    <span className="text-lg font-bold text-brand-600 dark:text-blue-light-400">GH₵ 120</span>
                    <span className="text-xs text-gray-400 block">/ month</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                  Freestanding dispenser with digital LED temperature indicators and dual hot/cold faucets.
                </p>
              </div>

              <Link
                href="/customer/dispenser"
                className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition shadow-sm"
              >
                View Dispenser Plans
              </Link>
            </div>

            {/* PRODUCT 3: 24-Pack 500ml */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800/40 mb-4 flex items-center justify-center">
                  <Image
                    src="/images/product/fnet-water-bottles-pack.jpg"
                    alt="24-Pack 500ml Bottled Water"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain p-3"
                  />
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    24-Pack (500ml) Bottled Water
                  </h3>
                  <div className="text-right">
                    <span className="text-lg font-bold text-brand-600 dark:text-blue-light-400">GH₵ 42</span>
                    <span className="text-xs text-gray-400 block">per pack</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                  Case of 24 sealed bottles for meetings, conferences, family outings, and travel.
                </p>
              </div>

              <Link
                href="/customer/order?product=PACK"
                className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition shadow-sm"
              >
                Order Pack
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              How It Works
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Three simple steps to get water delivered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="text-sm font-bold text-brand-500 dark:text-blue-light-400 mb-3">01</div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
                Order Online
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Choose your refill bottles or bottled water packs and select your delivery schedule.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="text-sm font-bold text-brand-500 dark:text-blue-light-400 mb-3">02</div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
                Doorstep Bottle Exchange
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                The driver brings full sealed bottles to your door and collects your empties with no deposit charge.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="text-sm font-bold text-brand-500 dark:text-blue-light-400 mb-3">03</div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
                Pay with Ease
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Pay online using Mobile Money or Card, or pay cash on delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. REFILL CALCULATOR */}
      <section id="calculator" className="py-16 sm:py-20 bg-gray-50/60 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-10 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-blue-light-400">
                  Refill Estimator
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  Estimate Your Monthly Usage
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Slide to select your weekly bottle consumption.
                </p>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-600 dark:text-gray-300">Weekly usage:</span>
                    <span className="text-lg font-bold text-brand-600 dark:text-blue-light-400">
                      {weeklyBottles} bottles / week
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={weeklyBottles}
                    onChange={(e) => setWeeklyBottles(parseInt(e.target.value, 10))}
                    aria-label="Bottles per week"
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 mt-2">
                    <span>1 bottle</span>
                    <span>5 bottles</span>
                    <span>15+ bottles</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Monthly Refills:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{monthlyBottles} bottles</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Volume:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{monthlyLiters} Liters</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-semibold text-gray-900 dark:text-white">Estimated Cost:</span>
                  <span className="text-base font-bold text-brand-600 dark:text-blue-light-400">
                    GH₵ {monthlyCost}
                  </span>
                </div>
                <Link
                  href={`/customer/order?qty=${weeklyBottles}`}
                  className="mt-3 w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition"
                >
                  Order This Quantity
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LOGISTICS FLEET */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6">
              <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800">
                <Image
                  src="/images/logistics/delivery-van.jpg"
                  alt="F Net Water Delivery Fleet"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-blue-light-400">
                Reliable Logistics
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                Dedicated Fleet for Fast Delivery
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Our delivery vans are dispatched daily on scheduled morning, afternoon, and evening runs to bring sealed 19L bottles right to your home or office.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                  <div className="text-xs font-bold text-gray-900 dark:text-white">Scheduled Routes</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Morning, afternoon, evening</div>
                </div>
                <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                  <div className="text-xs font-bold text-gray-900 dark:text-white">Doorstep Exchange</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">We collect your empty bottles</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-gray-950 text-gray-400 py-12 border-t border-gray-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Logo size="md" />
            <p className="text-xs text-gray-400 leading-relaxed">
              Pure drinking water delivery and smart dispenser services.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-2.5">Products</h4>
            <ul className="space-y-1.5">
              <li><Link href="/customer/order?product=19L" className="hover:text-white transition">18.9L Refill Bottle</Link></li>
              <li><Link href="/customer/dispenser" className="hover:text-white transition">Smart Digital Dispenser</Link></li>
              <li><Link href="/customer/order?product=PACK" className="hover:text-white transition">500ml Bottled Water (24-Pack)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-2.5">Portals</h4>
            <ul className="space-y-1.5">
              <li><Link href="/customer" className="hover:text-white transition">Customer Portal</Link></li>
              <li><Link href="/driver" className="hover:text-white transition">Driver Delivery App</Link></li>
              <li><Link href="/manager" className="hover:text-white transition">Dispatch and Operations</Link></li>
              <li><Link href="/admin" className="hover:text-white transition">Admin Overview</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-2.5">Contact</h4>
            <div className="space-y-1.5">
              <div>Phone: +233 24 000 0000</div>
              <div>Mon - Sat: 6:00 AM - 7:00 PM</div>
              <div className="pt-2 text-[11px] text-gray-500">
                © {new Date().getFullYear()} F Net Water Hub. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
