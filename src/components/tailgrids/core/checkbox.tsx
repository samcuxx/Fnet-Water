"use client";

import { cn } from "@/utils/cn";
import type { InputHTMLAttributes } from "react";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  isSelected?: boolean;
  onChange?: (checked: boolean) => void;
  isDisabled?: boolean;
}

export function Checkbox({
  isSelected,
  checked,
  onChange,
  isDisabled,
  className,
  disabled,
  ...props
}: CheckboxProps) {
  const isChecked = isSelected !== undefined ? isSelected : checked;
  const isInactive = isDisabled || disabled;

  return (
    <input
      type="checkbox"
      checked={isChecked}
      disabled={isInactive}
      onChange={(e) => onChange?.(e.target.checked)}
      className={cn(
        "size-4 rounded border-card-border text-primary focus:ring-primary/20 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 accent-primary",
        className,
      )}
      {...props}
    />
  );
}
