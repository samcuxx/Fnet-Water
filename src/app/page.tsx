"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
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
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-gray-100 shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Logo size="md" href="/" />
            
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <a href="#products" className="hover:text-brand-600 transition-colors">
                Products
              </a>
              <a href="#partners" className="hover:text-brand-600 transition-colors">
                Bottle Exchange
              </a>
              <a href="#dispensers" className="hover:text-brand-600 transition-colors">
                Dispensers
              </a>
              <a href="#how-it-works" className="hover:text-brand-600 transition-colors">
                How It Works
              </a>
            </nav>
          </div>

          <div className="flex items-center">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-4.5 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 shadow-xs shadow-brand-500/20 transition-all cursor-pointer"
              >
                <span>Login</span>
                <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* =========================================================================
          2. HERO SECTION
      ========================================================================== */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 bg-gradient-to-b from-blue-50/50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7 flex flex-col justify-center text-left"
            >
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-brand-700 text-xs font-bold w-fit mb-4 sm:mb-5 shadow-xs">
                <span className="flex size-2 rounded-full bg-brand-500 animate-pulse" />
                <span>Fresh Mineral Water &amp; Dispensers Across Greater Accra</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-[1.12]">
                Fresh Mineral Water Delivered{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-sky-500">
                  to Your Doorstep.
                </span>
              </h1>

              {/* Concise Storytelling Copy */}
              <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-gray-600 max-w-xl leading-relaxed">
                Order sealed 19L refills for GH₵ 25, swap any brand of empty bottle for free, and enjoy hot or chilled water on tap at your home or office.
              </p>

              {/* Mobile Side-by-Side CTAs (Grid on mobile, flex on desktop) */}
              <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-4 max-w-sm sm:max-w-none">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                  <Link
                    href="/customer/order"
                    className="w-full h-12 sm:h-13 px-3 sm:px-6 rounded-xl sm:rounded-2xl text-xs sm:text-base font-bold text-white bg-brand-500 hover:bg-brand-600 active:scale-[0.99] shadow-md shadow-brand-500/20 transition cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 text-center"
                  >
                    <svg className="size-4 sm:size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                    <span>Order 19L Refill (GH₵ 25)</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                  <a
                    href="#dispensers"
                    className="w-full h-12 sm:h-13 px-3 sm:px-6 rounded-xl sm:rounded-2xl text-xs sm:text-base font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200/90 transition cursor-pointer flex items-center justify-center gap-1.5 text-center"
                  >
                    <span>Explore Dispensers</span>
                    <svg className="size-3.5 sm:size-4 shrink-0 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                </motion.div>
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
            </motion.div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative mt-4 lg:mt-0">
              <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                
                {/* Elevated Image Frame with Gentle Scale-In */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                  className="relative rounded-3xl overflow-hidden shadow-xl shadow-blue-900/10 border-4 border-white aspect-[4/3] sm:aspect-[16/11]"
                >
                  <Image
                    src="/images/landing/hero-commercial.jpg"
                    alt="F Net Water Pure Water Delivery Experience"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </motion.div>

                {/* Floating Badge 1: Live Delivery Fleet with Organic Float */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: [0, -6, 0],
                  }}
                  transition={{
                    opacity: { duration: 0.5, delay: 0.35 },
                    x: { duration: 0.5, delay: 0.35 },
                    y: { repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.35 },
                  }}
                  className="absolute -top-3 -left-2 sm:-top-4 sm:-left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-gray-100 flex items-center gap-2.5 z-10"
                >
                  <span className="flex size-2 rounded-full bg-emerald-500 animate-ping" />
                  <div>
                    <div className="text-[11px] font-bold text-gray-900">Live Delivery Fleet</div>
                    <div className="text-[10px] text-gray-500">Scheduled runs active today</div>
                  </div>
                </motion.div>

                {/* Floating Badge 2: Bottle Exchange Verified with Counter-Float */}
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: [0, 6, 0],
                  }}
                  transition={{
                    opacity: { duration: 0.5, delay: 0.45 },
                    x: { duration: 0.5, delay: 0.45 },
                    y: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.7 },
                  }}
                  className="absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-3 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-md border border-gray-100 flex items-center gap-2.5 z-10"
                >
                  <div className="flex size-7 items-center justify-center rounded-xl bg-blue-100 text-brand-600 font-bold text-xs">
                    19L
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Bottle Exchange</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Zero deposit on swap</div>
                  </div>
                </motion.div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          3. OPERATIONAL STATS BAR
      ========================================================================== */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.5 }}
        className="py-8 sm:py-10 bg-white border-y border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            
            <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 transition shadow-xs hover:shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-600">15,000+</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">Monthly Refills</div>
            </motion.div>

            <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 transition shadow-xs hover:shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-600">99.4%</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">On-Time Deliveries</div>
            </motion.div>

            <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 transition shadow-xs hover:shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">GH₵ 0</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">Empty Return Deposit</div>
            </motion.div>

            <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 transition shadow-xs hover:shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-600">12 Months</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">Rent-to-Own Payoff</div>
            </motion.div>

          </div>
        </div>
      </motion.section>

      {/* =========================================================================
          4. PRODUCT CATALOG SHOWCASE
      ========================================================================== */}
      <section id="products" className="py-14 sm:py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-xl mx-auto mb-10 sm:mb-14"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Clear Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
              Simple Refills. Zero Hidden Fees.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              Bottled under strict quality standards. Swap any standard bottle brand at delivery with zero deposit penalty.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* PRODUCT 1: 18.9L / 19L Refill Bottle */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
            >
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
                  Food-grade bottle with an ergonomic carry handle. Hand your empty bottle to our driver and pay only GH₵ 25 for fresh mineral water.
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

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/customer/order?product=19L"
                  className="w-full inline-block text-center py-2.5 sm:py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-brand-500 hover:bg-brand-600 transition shadow-sm cursor-pointer"
                >
                  Order 19L Refill (GH₵ 25)
                </Link>
              </motion.div>
            </motion.div>

            {/* PRODUCT 2: Smart Digital Dispenser */}
            <motion.div
              id="dispensers"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-brand-500 shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between relative group"
            >
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
                  Instant hot tea and chilled water on tap. Pay GH₵ 120 monthly and own the dispenser outright in 12 months with free maintenance included.
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

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/customer/dispenser"
                  className="w-full inline-block text-center py-2.5 sm:py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-brand-500 hover:bg-brand-600 transition shadow-sm cursor-pointer"
                >
                  Start Rent-to-Own Plan
                </Link>
              </motion.div>
            </motion.div>

            {/* PRODUCT 3: 24-Pack 500ml Bottled Water */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
            >
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
                  Case of 24 sealed 500ml bottles. Ideal for boardrooms, workouts, road trips, and family gatherings.
                </p>

                <ul className="space-y-1.5 text-xs text-gray-600 mb-5 border-t border-gray-100 pt-3.5">
                  <li className="flex items-center gap-2">
                    <svg className="size-3.5 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>BPA-free recyclable bottles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="size-3.5 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Crisp, refreshing mineral water</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="size-3.5 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Delivered directly with your refills</span>
                  </li>
                </ul>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/customer/order?product=PACK"
                  className="w-full inline-block text-center py-2.5 sm:py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-800 bg-gray-100 hover:bg-gray-200 transition border border-gray-200 cursor-pointer"
                >
                  Order 24-Pack Case (GH₵ 42)
                </Link>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

            {/* =========================================================================
          4.1 GHANA TOP WATER BRANDS AFFILIATION & SWAP NETWORK
      ========================================================================== */}
      <section id="partners" className="py-14 sm:py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-10 sm:mb-12"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-brand-700 text-xs font-bold mb-3">
              <span className="size-2 rounded-full bg-brand-500" />
              <span>Universal Bottle Exchange</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Swap Any Brand of Empty Bottle. Pay Zero Deposit.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Have empty 19L bottles from Voltic, Awake, Bel-Aqua, or Ice Cool? Our drivers exchange them at your doorstep with no brand restrictions and no deposit fees.
            </p>
          </motion.div>

          {/* Lineup Commercial Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden shadow-lg border-4 border-white mb-8 aspect-[21/7] sm:aspect-[21/7] mx-auto"
          >
            <Image
              src="/images/landing/water-partners-lineup.jpg"
              alt="Ghana Top Water Brands Bottle Exchange Lineup"
              fill
              sizes="(max-width: 1024px) 100vw, 75vw"
              className="object-cover object-center"
            />
          
          </motion.div>

         

        

        </div>
      </section>

      {/* =========================================================================
          5. HOW IT WORKS (3 SIMPLE STEPS)
      ========================================================================== */}
      <section id="how-it-works" className="py-14 sm:py-20 bg-gray-50/40 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-xl mx-auto mb-10 sm:mb-12"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              3-Step Doorstep Service
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
              How It Works
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-500">
              Reliable drinking water delivered in three simple steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 sm:p-7 rounded-3xl bg-white border border-gray-200/80 shadow-xs transition hover:shadow-md"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-500 text-white font-extrabold text-xs mb-4 shadow-sm">
                01
              </span>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">
                Order in 60 Seconds
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Choose your bottle quantity and pick your preferred morning, afternoon, or evening delivery slot.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.2 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 sm:p-7 rounded-3xl bg-white border border-gray-200/80 shadow-xs transition hover:shadow-md"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-500 text-white font-extrabold text-xs mb-4 shadow-sm">
                02
              </span>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">
                Doorstep Bottle Exchange
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Our driver delivers sealed, hygienic bottles to your door and collects your empties with zero deposit fees.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.3 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 sm:p-7 rounded-3xl bg-white border border-gray-200/80 shadow-xs transition hover:shadow-md"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-500 text-white font-extrabold text-xs mb-4 shadow-sm">
                03
              </span>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">
                Pay on Delivery
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Pay with Mobile Money, debit card, or cash after your bottles arrive, with an instant SMS receipt.
              </p>
            </motion.div>

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
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white aspect-[4/3] sm:aspect-[16/11]">
                <Image
                  src="/images/landing/dispenser-lifestyle.jpg"
                  alt="F Net Water Smart Dispenser Lifestyle"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
            </motion.div>

            {/* Right: Rent-to-Own Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-5"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Rent-to-Own Hardware
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Instant Hot Tea &amp; Chilled Water. Own Your Dispenser in 12 Months.
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Skip boiling kettles or chilling bottles in the fridge. For GH₵ 120 a month, we deliver and install a modern digital dispenser. After 12 monthly payments, you own it completely.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <motion.div whileHover={{ y: -2, transition: { duration: 0.15 } }} className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">Dual Hot & Cold Taps</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Instant tea and chilled water</div>
                </motion.div>

                <motion.div whileHover={{ y: -2, transition: { duration: 0.15 } }} className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">Digital LED Screen</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Live temperature status</div>
                </motion.div>

                <motion.div whileHover={{ y: -2, transition: { duration: 0.15 } }} className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">Free Sanitization</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Routine cleaning & maintenance</div>
                </motion.div>

                <motion.div whileHover={{ y: -2, transition: { duration: 0.15 } }} className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">Child-Safety Lock</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Safe hot water dispensing</div>
                </motion.div>
              </div>

              <div className="pt-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/customer/dispenser"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-brand-500 hover:bg-brand-600 shadow-sm transition active:scale-[0.99] cursor-pointer"
                  >
                    <span>Get Dispenser on Rent-to-Own</span>
                    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </motion.div>
              </div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          7. REFILL ESTIMATOR
      ========================================================================== */}
      <section id="calculator" className="py-14 sm:py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-xl mx-auto mb-10"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Usage Calculator
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
              Calculate Your Home or Office Water Needs
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Slide to find the right weekly quantity and see how much you save compared to single-use bottles.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="bg-gradient-to-br from-blue-50/60 to-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm"
          >
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

                <AnimatePresence>
                  {monthlySavings > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, height: 0 }}
                      animate={{ opacity: 1, scale: 1, height: "auto" }}
                      exit={{ opacity: 0, scale: 0.95, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold flex items-center justify-between">
                        <span>Monthly Savings:</span>
                        <span className="font-bold">GH₵ {monthlySavings}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href={`/customer/order?qty=${weeklyBottles}`}
                    className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-brand-500 hover:bg-brand-600 transition shadow-sm cursor-pointer mt-1"
                  >
                    Order {weeklyBottles} {weeklyBottles === 1 ? "Bottle" : "Bottles"} Weekly
                  </Link>
                </motion.div>
              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* =========================================================================
          8. DEDICATED LOGISTICS & FLEET
      ========================================================================== */}
      <section id="fleet" className="py-14 sm:py-20 bg-gray-50/60 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Photorealistic Fleet Photograph */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white aspect-[4/3] sm:aspect-[16/11]">
                <Image
                  src="/images/landing/logistics-fleet.jpg"
                  alt="F Net Water Delivery Fleet"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
            </motion.div>

            {/* Right: Fleet Operations Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-5"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Reliable Doorstep Logistics
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Dedicated Van Fleet Delivering Across Accra Daily.
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Our delivery vans cover East Legon, Cantonments, Osu, Airport, Ridge, and Spintex daily, with live SMS alerts before arrival.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <motion.div whileHover={{ y: -2, transition: { duration: 0.15 } }} className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">3 Delivery Slots</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Morning, afternoon, evening</div>
                </motion.div>

                <motion.div whileHover={{ y: -2, transition: { duration: 0.15 } }} className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">Gate Delivery</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Carried straight to your pantry</div>
                </motion.div>

                <motion.div whileHover={{ y: -2, transition: { duration: 0.15 } }} className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">SMS Tracking</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Alerts when driver is near</div>
                </motion.div>

                <motion.div whileHover={{ y: -2, transition: { duration: 0.15 } }} className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
                  <div className="text-xs font-bold text-gray-900">Accra Coverage</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">East Legon, Osu, Cantonments</div>
                </motion.div>
              </div>

              <div className="pt-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/customer/order"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-brand-500 hover:bg-brand-600 shadow-sm transition active:scale-[0.99] cursor-pointer"
                  >
                    <span>Book Your Delivery Slot</span>
                    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </motion.div>
              </div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          9. CUSTOMER EXPERIENCES / TESTIMONIALS
      ========================================================================== */}
      <section className="py-14 sm:py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-xl mx-auto mb-10 sm:mb-12"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Trusted in Ghana
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
              What Our Customers Say
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Real feedback from homes and offices across Greater Accra.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-3xl bg-gray-50/80 border border-gray-100 flex flex-col justify-between transition hover:shadow-md"
            >
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.2 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-3xl bg-gray-50/80 border border-gray-100 flex flex-col justify-between transition hover:shadow-md"
            >
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.3 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-3xl bg-gray-50/80 border border-gray-100 flex flex-col justify-between transition hover:shadow-md"
            >
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
            </motion.div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          10. FOOTER
      ========================================================================== */}
      <footer className="bg-gray-950 text-gray-400 py-12 border-t border-gray-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <Logo size="md" variant="dark" />
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
