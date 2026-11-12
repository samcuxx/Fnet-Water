"use client";

import React, { useState } from "react";

interface SwitchProps {
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  color?: "blue" | "gray";
  className?: string;
  id?: string;
}

const Switch: React.FC<SwitchProps> = ({
  label,
  checked,
  defaultChecked = false,
  disabled = false,
  onChange,
  color = "blue",
  className = "",
  id,
}) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = checked !== undefined ? checked : internalChecked;

  const handleToggle = () => {
    if (disabled) return;
    const newState = !isChecked;
    if (checked === undefined) {
      setInternalChecked(newState);
    }
    onChange?.(newState);
  };

  const switchColors =
    color === "blue"
      ? {
          background: isChecked ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700",
          knob: isChecked ? "translate-x-5 bg-white" : "translate-x-0 bg-white",
        }
      : {
          background: isChecked ? "bg-gray-800 dark:bg-gray-600" : "bg-gray-200 dark:bg-gray-700",
          knob: isChecked ? "translate-x-5 bg-white" : "translate-x-0 bg-white",
        };

  return (
    <label
      id={id}
      className={`inline-flex items-center gap-3 text-xs sm:text-sm font-medium select-none ${
        disabled ? "text-gray-400 cursor-not-allowed opacity-60" : "text-gray-700 dark:text-gray-300 cursor-pointer"
      } ${className}`}
      onClick={handleToggle}
    >
      <div className="relative">
        <div
          className={`block transition duration-200 ease-in-out h-6 w-11 rounded-full ${
            disabled ? "bg-gray-200 dark:bg-gray-800 pointer-events-none" : switchColors.background
          }`}
        />
        <div
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full shadow-theme-xs duration-200 ease-in-out transform ${switchColors.knob}`}
        />
      </div>
      {label && <span>{label}</span>}
    </label>
  );
};

export default Switch;
export { Switch };
