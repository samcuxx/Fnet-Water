import React from "react";

interface CheckboxProps {
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  defaultChecked,
  disabled = false,
  onChange,
  className = "",
  id,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 select-none ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${className}`}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={handleChange}
        className="size-4 rounded-sm border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500/20 dark:bg-gray-800"
      />
      {label && <span>{label}</span>}
    </label>
  );
};

export default Checkbox;
