"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";

export interface MultiSelectOption {
  value: string;
  text: string;
}

interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  defaultSelected?: string[];
  value?: string[];
  onChange?: (selected: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  defaultSelected = [],
  value,
  onChange,
  disabled = false,
  placeholder = "Select options...",
  className = "",
}) => {
  const isControlled = value !== undefined;
  const [internalSelected, setInternalSelected] = useState<string[]>(defaultSelected);
  const selectedOptions = isControlled ? value : internalSelected;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const toggleOption = (val: string) => {
    let newSelected: string[];
    if (selectedOptions.includes(val)) {
      newSelected = selectedOptions.filter((item) => item !== val);
    } else {
      newSelected = [...selectedOptions, val];
    }

    if (!isControlled) {
      setInternalSelected(newSelected);
    }
    onChange?.(newSelected);
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-10 w-full flex flex-wrap items-center justify-between gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-xs sm:text-sm text-left shadow-theme-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60 transition"
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          {selectedOptions.length === 0 ? (
            <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
          ) : (
            selectedOptions.map((val) => {
              const opt = options.find((o) => o.value === val);
              return (
                <span
                  key={val}
                  className="inline-flex items-center gap-1 rounded bg-brand-50 dark:bg-brand-500/15 px-2 py-0.5 text-xs font-medium text-brand-700 dark:text-brand-300"
                >
                  {opt?.text || val}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(val);
                    }}
                    className="cursor-pointer hover:text-brand-900 dark:hover:text-white"
                  >
                    &times;
                  </span>
                </span>
              );
            })
          )}
        </div>

        <svg
          className={`size-4 text-gray-500 shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full z-50 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-theme-lg max-h-56 overflow-y-auto p-1.5">
          {options.map((opt) => {
            const isSelected = selectedOptions.includes(opt.value);
            return (
              <div
                key={opt.value}
                onClick={() => toggleOption(opt.value)}
                className={`flex items-center justify-between px-3 py-2 text-xs rounded-md cursor-pointer transition ${
                  isSelected
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span>{opt.text}</span>
                {isSelected && (
                  <svg className="size-4 text-brand-600" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
