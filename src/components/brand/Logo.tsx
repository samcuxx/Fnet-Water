"use client";

import React, { useId } from "react";
import Link from "next/link";

export interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  showTagline?: boolean;
  variant?: "default" | "light" | "dark";
}

export function LogoIcon({ className = "size-8" }: { className?: string }) {
  const id = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="F Net Water Hub Icon"
    >
      <defs>
        {/* Ocean Deep Gradient Base */}
        <linearGradient id={`bg_${id}`} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="45%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#0B1528" />
        </linearGradient>

        {/* Hydro Spine Gradient */}
        <linearGradient id={`spine_${id}`} x1="7" y1="7" x2="13" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F0F9FF" />
          <stop offset="100%" stopColor="#BAE6FD" />
        </linearGradient>

        {/* Top Wave Arm Gradient */}
        <linearGradient id={`top_${id}`} x1="10" y1="7" x2="25" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#E0F2FE" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>

        {/* Mid Wave Jet Gradient */}
        <linearGradient id={`mid_${id}`} x1="10" y1="15" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="100%" stopColor="#00D2FF" />
        </linearGradient>

        {/* Water Pearl Gradient */}
        <linearGradient id={`pearl_${id}`} x1="17" y1="21" x2="22" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        <filter id={`shadow_${id}`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* Container Badge with Subtle Sheen */}
      <rect width="32" height="32" rx="8" fill={`url(#bg_${id})`} />
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="7.5"
        stroke="#38BDF8"
        strokeOpacity="0.32"
        strokeWidth="1"
      />

      {/* The Monogram 'F' Water Motion */}
      <g filter={`url(#shadow_${id})`}>
        {/* 1. Left Vertical Hydro Spine */}
        <rect x="7.5" y="6.5" width="4.2" height="18.5" rx="2.1" fill={`url(#spine_${id})`} />

        {/* 2. Top Fluid Wave Arm */}
        <path
          d="M10 6.5 H 22.5 C 24.1569 6.5 25.5 7.84315 25.5 9.5 C 25.5 11.1569 24.1569 12.5 22.5 12.5 H 10 V 6.5 Z"
          fill={`url(#top_${id})`}
        />

        {/* 3. Mid Fluid Wave Jet */}
        <path
          d="M10 14.5 H 19 C 20.3807 14.5 21.5 15.6193 21.5 17 C 21.5 18.3807 20.3807 19.5 19 19.5 H 10 V 14.5 Z"
          fill={`url(#mid_${id})`}
        />

        {/* 4. Luminous Water Hub Pearl */}
        <circle cx="18.5" cy="23.2" r="2" fill={`url(#pearl_${id})`} />
        <circle cx="17.9" cy="22.6" r="0.65" fill="#FFFFFF" opacity="0.85" />
      </g>
    </svg>
  );
}

export default function Logo({
  className = "",
  iconOnly = false,
  size = "md",
  href = "/",
  showTagline = false,
  variant = "default",
}: LogoProps) {
  const sizeClasses = {
    sm: { icon: "size-7", text: "text-base", sub: "text-[9px]" },
    md: { icon: "size-8 sm:size-9", text: "text-lg sm:text-[19px]", sub: "text-[10px]" },
    lg: { icon: "size-10", text: "text-xl sm:text-2xl", sub: "text-xs" },
    xl: { icon: "size-12", text: "text-2xl sm:text-3xl", sub: "text-xs" },
  };

  const selectedSize = sizeClasses[size];

  // Dynamic text color styles based on variant
  const primaryTextColor =
    variant === "light"
      ? "text-gray-900"
      : variant === "dark"
      ? "text-white"
      : "text-gray-900 dark:text-white";

  const secondaryTextColor =
    variant === "light"
      ? "text-brand-600"
      : variant === "dark"
      ? "text-sky-400"
      : "text-brand-600 dark:text-sky-400";

  const taglineColor =
    variant === "light"
      ? "text-gray-500"
      : variant === "dark"
      ? "text-gray-400"
      : "text-gray-500 dark:text-gray-400";

  const content = (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <LogoIcon className={`${selectedSize.icon} shrink-0 drop-shadow-xs`} />
      {!iconOnly && (
        <div className="flex flex-col">
          <span
            className={`font-sans font-extrabold tracking-tight ${selectedSize.text} leading-none ${primaryTextColor}`}
          >
            F NET <span className={secondaryTextColor}>WATER HUB</span>
          </span>
          {showTagline && (
            <span
              className={`font-sans font-semibold tracking-widest uppercase ${selectedSize.sub} ${taglineColor} mt-0.5`}
            >
              Smart Hydration • Logistics
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus:outline-hidden hover:opacity-95 transition-opacity"
      >
        {content}
      </Link>
    );
  }

  return content;
}
