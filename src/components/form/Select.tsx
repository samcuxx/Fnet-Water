"use client";

import React, { useState } from "react";

export interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
  disabled = false,
  name,
  id,
}) => {
  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const selectedValue = value !== undefined ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value;
    if (value === undefined) {
      setInternalValue(newVal);
    }
    onChange?.(newVal);
  };

  return (
    <div className="relative w-full">
      <select
        id={id}
        name={name}
        disabled={disabled}
        value={selectedValue}
        onChange={handleChange}
        className={`h-10 w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 pr-10 text-xs sm:text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60 transition-colors ${
          selectedValue
            ? "text-gray-800 dark:text-white"
            : "text-gray-400 dark:text-gray-500"
        } ${className}`}
      >
        <option value="" disabled className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-gray-800 dark:bg-gray-900 dark:text-gray-200"
          >
            {option.label}
          </option>
        ))}
      </select>

      <svg
        className="absolute text-gray-500 dark:text-gray-400 right-3 top-1/2 -translate-y-1/2 pointer-events-none size-4"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default Select;
export { Select };
