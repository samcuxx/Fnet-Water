import type React from "react";
import type { FC } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  success?: boolean;
  error?: boolean;
  hint?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input: FC<InputProps> = ({
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
  className = "",
  disabled = false,
  success = false,
  error = false,
  hint,
  startIcon,
  endIcon,
  ...props
}) => {
  let inputClasses = `h-10.5 w-full rounded-2xl border appearance-none text-xs sm:text-sm shadow-2xs placeholder:text-gray-400 focus:outline-hidden focus:ring-2 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500 transition-all ${
    startIcon ? "pl-10" : "px-3.5"
  } ${endIcon ? "pr-10" : "px-3.5"} ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60`;
  } else if (error) {
    inputClasses += ` border-error-500 focus:border-error-500 focus:ring-error-500/20 text-error-900 dark:text-error-400`;
  } else if (success) {
    inputClasses += ` border-success-500 focus:border-success-500 focus:ring-success-500/20 text-success-900 dark:text-success-400`;
  } else {
    inputClasses += ` bg-white dark:bg-gray-900 text-gray-800 border-gray-300 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500/20 dark:focus:border-brand-400`;
  }

  return (
    <div className="relative w-full">
      {startIcon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none inline-flex items-center">
          {startIcon}
        </span>
      )}

      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />

      {endIcon && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none inline-flex items-center">
          {endIcon}
        </span>
      )}

      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : success
              ? "text-success-500"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;
export { Input };
