"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

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

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        disabled
        className={`inline-flex items-center justify-center text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg h-9 px-2.5 text-xs font-medium opacity-70 ${className}`}
      >
        <span className="size-4 inline-block" />
        {showLabel && <span className="ml-2">Theme</span>}
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`inline-flex items-center justify-center transition-colors rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 h-9 px-3 text-xs font-medium gap-2 focus:outline-hidden ${className}`}
    >
      {isDark ? (
        <>
          <svg
            className="size-4 text-amber-400"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10 1.54A.75.75 0 0 1 10.75 2.29v1.25a.75.75 0 0 1-1.5 0V2.29A.75.75 0 0 1 10 1.54ZM10 6.79a3.21 3.21 0 1 0 0 6.42 3.21 3.21 0 0 0 0-6.42ZM5.29 10a4.71 4.71 0 1 1 9.42 0 4.71 4.71 0 0 1-9.42 0ZM15.98 5.08a.75.75 0 0 0 0-1.06.75.75 0 0 0-1.06 0l-.88.88a.75.75 0 1 0 1.06 1.06l.88-.88ZM18.46 10a.75.75 0 0 1-.75.75h-1.25a.75.75 0 1 1 0-1.5h1.25a.75.75 0 0 1 .75.75ZM14.92 15.98a.75.75 0 0 0 1.06 0 .75.75 0 0 0 0-1.06l-.88-.88a.75.75 0 1 0-1.06 1.06l.88.88ZM10 15.71a.75.75 0 0 1 .75.75v1.25a.75.75 0 1 1-1.5 0v-1.25a.75.75 0 0 1 .75-.75ZM5.96 15.1a.75.75 0 0 1-1.06 0l-.88-.88a.75.75 0 1 1 1.06-1.06l.88.88a.75.75 0 0 1 0 1.06ZM4.29 10a.75.75 0 0 0-.75-.75H2.29a.75.75 0 1 0 0 1.5h1.25A.75.75 0 0 0 4.29 10ZM4.9 5.96a.75.75 0 0 1 0-1.06l.88-.88a.75.75 0 1 1 1.06 1.06l-.88.88a.75.75 0 0 1-1.06 0Z"
              fill="currentColor"
            />
          </svg>
          {showLabel && <span>Light Mode</span>}
        </>
      ) : (
        <>
          <svg
            className="size-4 text-gray-600 dark:text-gray-400"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M17.45 11.97l.73.19a.75.75 0 0 0-.34-.83.75.75 0 0 0-.89.09l.5.55ZM8.03 2.55l.55.51a.75.75 0 0 0-.12-.89.75.75 0 0 0-.85-.08l.42.46ZM12.92 13a5.92 5.92 0 0 1-5.92-5.92H5.5A7.42 7.42 0 0 0 12.92 14.5V13ZM16.94 11.42A5.9 5.9 0 0 1 12.92 13v1.5a7.4 7.4 0 0 0 5.05-1.98l-1.03-1.1ZM16.73 11.78a6.96 6.96 0 0 1-6.73 5.18v1.5a8.46 8.46 0 0 0 8.18-5.93l-1.45-.75ZM10 16.96A6.96 6.96 0 0 1 3.04 10H1.54a8.46 8.46 0 0 0 8.46 8.46v-1.5ZM3.04 10a6.96 6.96 0 0 1 5.18-6.73L7.84 1.82A8.46 8.46 0 0 0 1.54 10h1.5ZM7 7.09c0-1.56.6-2.98 1.58-4.03L7.48 2.04A7.47 7.47 0 0 0 5.5 7.09H7Z"
              fill="currentColor"
            />
          </svg>
          {showLabel && <span>Dark Mode</span>}
        </>
      )}
    </button>
  );
};

export default ThemeToggleButton;
