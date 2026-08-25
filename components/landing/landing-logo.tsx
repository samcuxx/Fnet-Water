import { cn } from "@/lib/utils/cn";

/**
 * Landing-header logo mark: circular ring with a water droplet,
 * matching the approved marketing header mockup.
 */
export function LandingLogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
      className={cn("size-10", className)}
    >
      {/* Open ring — gap at the top like the mockup */}
      <circle
        cx="20"
        cy="20"
        r="17"
        stroke="#0057B8"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeDasharray="92 16"
        strokeDashoffset="8"
      />
      <path
        d="M20 9.5c0 0-7.2 7.6-7.2 12.4a7.2 7.2 0 0 0 14.4 0c0-4.8-7.2-12.4-7.2-12.4Z"
        fill="#0057B8"
      />
      <path
        d="M16.6 22.2a3.4 3.4 0 0 0 3.4 3.4"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LandingLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LandingLogoMark />
      <span className="flex flex-col leading-none">
        <span className="text-[1.05rem] font-extrabold tracking-tight text-[#002060]">
          F NET
        </span>
        <span className="mt-0.5 text-[0.68rem] font-semibold tracking-[0.14em] text-[#002060]">
          WATER HUB
        </span>
      </span>
    </span>
  );
}
