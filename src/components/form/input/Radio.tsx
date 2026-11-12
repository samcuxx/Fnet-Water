import React from "react";

interface RadioProps {
  id?: string;
  name: string;
  value: string;
  checked?: boolean;
  defaultChecked?: boolean;
  label?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  className?: string;
}

export const Radio: React.FC<RadioProps> = ({
  id,
  name,
  value,
  checked,
  defaultChecked,
  label,
  disabled = false,
  onChange,
  className = "",
}) => {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-2.5 text-xs sm:text-sm text-foreground select-none ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${className}`}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="size-4 border-input text-primary focus:ring-ring/20 bg-background"
      />
      {label && <span>{label}</span>}
    </label>
  );
};

export default Radio;
