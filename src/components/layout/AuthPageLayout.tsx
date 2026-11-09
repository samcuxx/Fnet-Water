"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import ThemeToggleButton from "../common/ThemeToggleButton";
import GridShape from "../common/GridShape";
import Logo from "../brand/Logo";

export default function AuthPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative bg-white dark:bg-gray-950 min-h-screen selection:bg-brand-500 selection:text-white">
      <div className="relative flex flex-col justify-center w-full min-h-screen lg:flex-row">
        {/* Left Side: Auth Form */}
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
            <span>&copy; {new Date().getFullYear()} F Net Water Hub</span>
            <span>Ghana</span>
          </div>
        </div>

        {/* Right Side: Brand Panel */}
        <div className="hidden lg:flex w-full lg:w-1/2 min-h-screen relative overflow-hidden bg-brand-950 dark:bg-white/[0.03] flex-col items-center justify-center p-12 z-0 border-l border-gray-100 dark:border-gray-800">
          {/* Vector Grid Pattern per Archetype Rule 2.1 */}
          <GridShape />

          <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
            <div className="relative size-60 xl:size-72 mb-6">
              <Image
                src="/images/product/fnet-18l-bottle.jpg"
                alt="F Net Purified Water Refill Jug"
                fill
                priority
                sizes="288px"
                className="object-contain drop-shadow-2xl"
              />
            </div>

            <Logo size="md" href="/" className="mb-3" />

            <p className="text-xs sm:text-sm text-gray-300 dark:text-gray-400 leading-relaxed">
              Ghana&apos;s smart drinking water network. Doorstep 19L refills, empty bottle returns, and rent-to-own dispensers.
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
