"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import ThemeToggleButton from "../common/ThemeToggleButton";
import Logo from "../brand/Logo";

export default function AuthPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative bg-white dark:bg-gray-950 min-h-screen selection:bg-sky-500 selection:text-white">
      <div className="relative flex flex-col justify-center w-full min-h-screen lg:flex-row">
        {/* Left Side: Auth Form Container */}
        <div className="flex flex-col flex-1 w-full lg:w-1/2 p-6 sm:p-10 lg:p-12 xl:p-16 justify-between min-h-screen z-10 bg-white dark:bg-gray-950">
          <div className="w-full max-w-md mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-500 transition-colors hover:text-brand-600 dark:text-gray-400 dark:hover:text-blue-light-400"
            >
              <svg
                className="size-4 stroke-current"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.5 15L7.5 10L12.5 5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to Home
            </Link>
          </div>

          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto my-8">
            {children}
          </div>

          <div className="w-full max-w-md mx-auto pt-4 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>© {new Date().getFullYear()} F Net Water Hub</span>
            <span>Ghana</span>
          </div>
        </div>

        {/* Right Side: Clean, High-Contrast Product Showcase */}
        <div className="hidden lg:flex w-full lg:w-1/2 min-h-screen relative overflow-hidden bg-gradient-to-br from-[#07132B] via-[#0B1D45] to-[#040C1E] items-center justify-center p-12">
          {/* Subtle Ambient Light Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-md text-center flex flex-col items-center">
            {/* Centered Product Visual Card */}
            <div className="relative size-64 sm:size-72 rounded-3xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl p-4 mb-8 flex items-center justify-center">
              <Image
                src="/images/product/fnet-18l-bottle.jpg"
                alt="F Net Purified Water Refill Jug"
                fill
                priority
                sizes="288px"
                className="object-contain p-4"
              />
            </div>

            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/25 text-sky-300 text-xs font-semibold mb-4">
              <span className="size-2 rounded-full bg-sky-400 animate-pulse" />
              Pure Mineral Water
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Pure Water, Delivered
            </h2>

            <p className="mt-2 text-sm text-gray-300 leading-relaxed max-w-sm">
              Doorstep 19L refills, empty bottle returns, and smart digital dispensers.
            </p>
          </div>
        </div>

        {/* Floating Theme Toggle */}
        <div className="fixed z-50 bottom-5 right-5 sm:bottom-6 sm:right-6">
          <ThemeToggleButton showLabel={false} />
        </div>
      </div>
    </div>
  );
}
