"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

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
        className={`h-10.5 w-full appearance-none rounded-md border border-input bg-background px-3.5 pr-10 text-xs sm:text-sm shadow-2xs placeholder:text-muted-foreground focus:border-ring focus:outline-hidden focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60 transition-all cursor-pointer ${
          selectedValue
            ? "text-foreground"
            : "text-muted-foreground"
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

      <ChevronDown className="absolute text-gray-500 dark:text-gray-400 right-3.5 top-1/2 -translate-y-1/2 pointer-events-none size-4" />
    </div>
  );
};

export default Select;
export { Select };
