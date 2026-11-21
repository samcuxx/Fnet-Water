"use client";

import React from "react";
import Link from "next/link";

export interface LogoIconProps {
  className?: string;
  variant?: "default" | "light" | "dark" | "transparent" | "white";
}

export function LogoIcon({
  className = "size-10",
  variant = "default",
}: LogoIconProps) {
  const src =
    variant === "white"
      ? "/logo/logo-white.png"
      : variant === "dark"
      ? "/logo/logo-dark.png"
      : "/logo/logo-transparent.png";

  return (
    <img
      src={src}
      alt="F-Net Water Hub"
      className={`${className} object-contain shrink-0`}
      loading="eager"
      decoding="async"
    />
  );
}

export interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  showTagline?: boolean;
  variant?: "default" | "light" | "dark" | "white";
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
    sm: { icon: "size-8 sm:size-9", text: "text-base sm:text-lg", sub: "text-[10px]" },
    md: { icon: "size-10 sm:size-11", text: "text-lg sm:text-xl", sub: "text-xs" },
    lg: { icon: "size-14 sm:size-16", text: "text-2xl sm:text-3xl", sub: "text-xs sm:text-sm" },
    xl: { icon: "size-20 sm:size-24", text: "text-3xl sm:text-4xl", sub: "text-sm sm:text-base" },
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
    <div className={`inline-flex items-center gap-2.5 sm:gap-3.5 ${className}`}>
      <LogoIcon
        className={`${selectedSize.icon} shrink-0 drop-shadow-xs`}
        variant={variant === "white" ? "white" : "transparent"}
      />
      {!iconOnly && (
        <div className="flex flex-col">
          <span
            className={`font-sans font-extrabold tracking-tight ${selectedSize.text} leading-none ${primaryTextColor}`}
          >
            F NET <span className={secondaryTextColor}>WATER HUB</span>
          </span>
          {showTagline && (
            <span
              className={`font-sans font-semibold tracking-widest uppercase ${selectedSize.sub} ${taglineColor} mt-1`}
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
