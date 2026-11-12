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
  let inputClasses = `h-10.5 w-full rounded-md border appearance-none text-xs sm:text-sm shadow-2xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 transition-all ${
    startIcon ? "pl-10" : "px-3.5"
  } ${endIcon ? "pr-10" : "px-3.5"} ${className}`;

  if (disabled) {
    inputClasses += ` text-muted-foreground border-border bg-muted cursor-not-allowed opacity-60`;
  } else if (error) {
    inputClasses += ` border-destructive focus:border-destructive focus:ring-destructive/20 text-destructive`;
  } else if (success) {
    inputClasses += ` border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20 text-emerald-600 dark:text-emerald-400`;
  } else {
    inputClasses += ` bg-background text-foreground border-input focus:border-ring focus:ring-ring/20`;
  }

  return (
    <div className="relative w-full">
      {startIcon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none inline-flex items-center">
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
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none inline-flex items-center">
          {endIcon}
        </span>
      )}

      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-destructive"
              : success
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground"
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
