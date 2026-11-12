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
          background: isChecked ? "bg-primary" : "bg-muted",
          knob: isChecked ? "translate-x-5 bg-primary-foreground" : "translate-x-0 bg-background",
        }
      : {
          background: isChecked ? "bg-secondary-foreground" : "bg-muted",
          knob: isChecked ? "translate-x-5 bg-background" : "translate-x-0 bg-background",
        };

  return (
    <label
      id={id}
      className={`inline-flex items-center gap-3 text-xs sm:text-sm font-medium select-none ${
        disabled ? "text-muted-foreground/60 cursor-not-allowed opacity-60" : "text-foreground cursor-pointer"
      } ${className}`}
      onClick={handleToggle}
    >
      <div className="relative">
        <div
          className={`block transition duration-200 ease-in-out h-6 w-11 rounded-full ${
            disabled ? "bg-muted pointer-events-none opacity-50" : switchColors.background
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
