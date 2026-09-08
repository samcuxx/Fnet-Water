"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils/cn";

import { useTheme } from "./theme-provider";
import { THEMES, type Theme } from "./theme";

const ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

const LABELS: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

/**
 * Cycles light → dark → system. The current mode is announced for
 * assistive tech; the icon shows what is active.
 */
export function ThemeToggle({
  className,
  inverted = false,
}: {
  className?: string;
  /** Light icon treatment for navy surfaces such as the portal header. */
  inverted?: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const Icon = ICONS[theme];

  function cycle() {
    const index = THEMES.indexOf(theme);
    setTheme(THEMES[(index + 1) % THEMES.length]);
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className={cn(
        "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg transition-colors",
        inverted
          ? "text-white/80 hover:bg-white/10 hover:text-white"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
        className,
      )}
      aria-label={`Theme: ${LABELS[theme]}. Click to switch`}
      title={`Theme: ${LABELS[theme]}`}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}
