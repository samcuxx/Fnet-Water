"use client";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted && resolvedTheme === "dark" ? "dark" : "light";

  return (
    <AnimatedThemeToggler
      theme={currentTheme}
      onThemeChange={(next) => setTheme(next)}
      variant="circle"
      duration={450}
      className="size-10 rounded-lg border border-card-border bg-card-background text-icon-primary shadow-xs outline-none hover:bg-background-gray-primary inline-flex items-center justify-center [&>svg]:size-4.5 transition-colors cursor-pointer"
      aria-label="Toggle color theme"
    />
  );
}
