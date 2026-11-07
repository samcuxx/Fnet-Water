import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function LogoIcon({ className = "size-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="F Net Water Hub Icon"
    >
      <rect width="32" height="32" rx="8" fill="#0057B8" />
      <path
        d="M16 6C16 6 9 14.5 9 19C9 22.866 12.134 26 16 26C19.866 26 23 22.866 23 19C23 14.5 16 6 16 6Z"
        fill="#00AEEF"
      />
      <path
        d="M16 10C16 10 11.5 16 11.5 19.5C11.5 22 13.5 24 16 24C18.5 24 20.5 22 20.5 19.5C20.5 16 16 10 16 10Z"
        fill="white"
      />
      <circle cx="16" cy="19.5" r="2" fill="#0057B8" />
    </svg>
  );
}

export default function Logo({
  className = "",
  iconOnly = false,
  size = "md",
  href = "/",
}: LogoProps) {
  const sizeClasses = {
    sm: { icon: "size-7", text: "text-base" },
    md: { icon: "size-8", text: "text-lg" },
    lg: { icon: "size-10", text: "text-xl" },
  };

  const selectedSize = sizeClasses[size];

  const content = (
    <div className={`inline-flex items-center space-x-2.5 ${className}`}>
      <LogoIcon className={selectedSize.icon} />
      {!iconOnly && (
        <span
          className={`font-outfit font-extrabold tracking-tight ${selectedSize.text} leading-none text-gray-900 dark:text-white`}
        >
          F NET <span className="text-brand-600 dark:text-blue-light-400">WATER HUB</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-hidden">
        {content}
      </Link>
    );
  }

  return content;
}
