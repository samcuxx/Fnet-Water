import React, { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: "sm" | "md";
  variant?: "primary" | "outline";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  ...props
}) => {
  const sizeClasses = {
    sm: "px-3.5 py-2 text-xs font-medium",
    md: "px-5 py-2.5 text-sm font-medium",
  };

  const variantClasses = {
    primary:
      "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-300 dark:disabled:bg-brand-900/50",
    outline:
      "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800",
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-colors focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {startIcon && <span className="inline-flex items-center shrink-0">{startIcon}</span>}
      {children}
      {endIcon && <span className="inline-flex items-center shrink-0">{endIcon}</span>}
    </button>
  );
};

export default Button;
export { Button };
