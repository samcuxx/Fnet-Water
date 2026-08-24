import { cn } from "@/lib/utils/cn";

/**
 * Brand mark: a water droplet in the F Net blue.
 *
 * Inline SVG rather than an image file so it scales crisply, inherits colour,
 * and costs no extra request.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={cn("size-8", className)}
    >
      <rect width="32" height="32" rx="9" fill="url(#fnet-logo-gradient)" />
      <path
        d="M16 7.5c0 0-6 6.4-6 10.4a6 6 0 0 0 12 0c0-4-6-10.4-6-10.4Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M13.2 18.4a2.8 2.8 0 0 0 2.8 2.8"
        stroke="#0057B8"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient
          id="fnet-logo-gradient"
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0057B8" />
          <stop offset="1" stopColor="#00AEEF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({
  className,
  inverted = false,
  showWordmark = true,
}: {
  className?: string;
  /** Use on dark surfaces such as the sidebar. */
  inverted?: boolean;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "text-sm font-bold tracking-tight",
              inverted ? "text-white" : "text-slate-900",
            )}
          >
            F NET
          </span>
          <span
            className={cn(
              "text-[0.65rem] font-semibold tracking-[0.18em]",
              inverted ? "text-aqua-300" : "text-brand-600",
            )}
          >
            WATER HUB
          </span>
        </span>
      )}
    </span>
  );
}
