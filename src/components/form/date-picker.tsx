"use client";

import React, { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: (selectedDates: Date[], dateStr: string) => void;
  defaultDate?: string | Date;
  label?: string;
  placeholder?: string;
  className?: string;
};

export default function DatePicker({
  id,
  mode = "single",
  onChange,
  label,
  defaultDate,
  placeholder = "YYYY-MM-DD",
  className = "",
}: PropsType) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    const fp = flatpickr(inputRef.current, {
      mode,
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      defaultDate,
      onChange: (selectedDates, dateStr) => {
        onChange?.(selectedDates, dateStr);
      },
    });

    return () => {
      if (fp && typeof fp.destroy === "function") {
        fp.destroy();
      }
    };
  }, [mode, onChange, defaultDate]);

  return (
    <div className={`w-full ${className}`}>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border appearance-none px-3.5 pr-10 text-xs sm:text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-white border-gray-300 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500/20 transition-colors"
        />

        <span className="absolute text-gray-400 right-3 top-1/2 -translate-y-1/2 pointer-events-none size-4 inline-flex items-center">
          <svg
            className="size-4"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="3" y="4" width="14" height="13" rx="2" strokeWidth="1.5" />
            <line x1="3" y1="8" x2="17" y2="8" strokeWidth="1.5" />
            <line x1="7" y1="2" x2="7" y2="4" strokeWidth="1.5" />
            <line x1="13" y1="2" x2="13" y2="4" strokeWidth="1.5" />
          </svg>
        </span>
      </div>
    </div>
  );
}
