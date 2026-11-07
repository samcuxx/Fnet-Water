"use client";

import React from "react";
import Link from "next/link";
import GridShape from "../common/GridShape";
import ThemeToggleButton from "../common/ThemeToggleButton";
import Logo from "../brand/Logo";

export default function AuthPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative bg-white z-1 dark:bg-gray-900 min-h-screen">
      <div className="relative flex flex-col justify-center w-full min-h-screen lg:flex-row dark:bg-gray-900">
        {/* Left Side: Auth Form Container */}
        <div className="flex flex-col flex-1 w-full lg:w-1/2 p-6 sm:p-10 lg:p-14 xl:p-16 justify-between min-h-screen">
          <div className="w-full max-w-md mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg
                className="size-4 sm:size-5 stroke-current"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.5 15L7.5 10L12.5 5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to Home
            </Link>
          </div>

          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto my-6">
            {children}
          </div>

          <div className="w-full max-w-md mx-auto pt-4 text-xs text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} F Net Water Hub. All rights reserved.
          </div>
        </div>

        {/* Right Side: Premium Brand Showcase with GridShape */}
        <div className="items-center hidden w-full min-h-screen lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid relative overflow-hidden">
          <div className="relative flex items-center justify-center z-1 w-full h-full p-12">
            <GridShape />
            <div className="flex flex-col items-center max-w-sm text-center">
              <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <Logo size="lg" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Pure Water Delivery &amp; Smart Dispensers
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-gray-300 dark:text-gray-400 leading-relaxed">
                Streamlining 19L bottle exchanges, scheduled route dispatch, and IoT dispenser financing across Ghana.
              </p>
            </div>
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
