"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import Logo from "../brand/Logo";

interface AuthPageLayoutProps {
  children: React.ReactNode;
}

export default function AuthPageLayout({ children }: AuthPageLayoutProps) {
  const { setTheme } = useTheme();

  // Enforce light mode on authentication pages
  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row selection:bg-brand-500 selection:text-white">
      
      {/* 1. HERO IMAGE: Prominent and well-framed on mobile, curved arch on desktop */}
      <div className="w-full lg:w-[50%] xl:w-[52%] h-72 sm:h-80 md:h-96 lg:h-auto lg:min-h-screen relative overflow-hidden bg-[#0A1435] flex items-center justify-center order-1 lg:order-2 lg:rounded-l-[180px] xl:rounded-l-[260px] shrink-0">
        <div className="absolute inset-0">
          <Image
            src="/images/auth/auth-illustration.jpg"
            alt="F Net Water Hub Pure Water Delivery"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 52vw"
            className="object-cover object-[center_28%] lg:object-center"
          />
          {/* Subtle photographic vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* 2. FORM CONTAINER: Bottom sheet on mobile, left column on desktop (Pure Light Mode) */}
      <div className="w-full lg:w-[50%] xl:w-[48%] bg-white order-2 lg:order-1 -mt-8 lg:mt-0 rounded-t-[32px] sm:rounded-t-[40px] lg:rounded-none relative z-20 px-6 pt-7 pb-10 sm:px-10 sm:py-12 lg:p-14 xl:p-16 lg:shadow-none flex flex-col justify-between lg:min-h-screen">
        <div className="w-full max-w-[440px] lg:max-w-[480px] mx-auto flex flex-col justify-between h-full">
          {/* Header Bar: Brand Logo & Back to Home */}
          <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
            <Logo size="sm" href="/" />

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#3B66FF] transition"
            >
              <svg
                className="size-3.5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M12.5 15L7.5 10L12.5 5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Form Content: Natural flow on mobile, vertically centered on desktop */}
          <div className="w-full lg:my-auto">
            {children}
          </div>

          {/* Copyright & Country Note */}
          <div className="pt-6 mt-8 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>&copy; {new Date().getFullYear()} F Net Water Hub</span>
            <span className="font-semibold text-gray-500">Ghana</span>
          </div>
        </div>
      </div>
    </div>
  );
}
