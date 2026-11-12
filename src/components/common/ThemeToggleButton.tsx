"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { cn } from "@/utils/cn";

interface ThemeToggleButtonProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  className = "",
  showLabel = false,
}) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted && resolvedTheme === "dark" ? "dark" : "light";

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <AnimatedThemeToggler
        theme={currentTheme}
        onThemeChange={(next) => setTheme(next)}
        variant="circle"
        duration={450}
        className="size-9 rounded-lg border border-card-border bg-card-background text-icon-primary shadow-xs outline-none hover:bg-background-gray-primary inline-flex items-center justify-center [&>svg]:size-4 transition-colors cursor-pointer"
        aria-label="Toggle color theme"
      />
      {showLabel && (
        <span className="text-xs font-medium text-text-secondary select-none">
          {currentTheme === "dark" ? "Dark Mode" : "Light Mode"}
        </span>
      )}
    </div>
  );
};

export default ThemeToggleButton;
