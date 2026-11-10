"use client";

import React, { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
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
    sm: "px-3.5 py-2 text-xs font-semibold",
    md: "px-5 py-2.5 text-sm font-semibold",
  };

  const variantClasses = {
    primary:
      "bg-brand-500 text-white shadow-xs hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-300 dark:disabled:bg-brand-900/50",
    outline:
      "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 active:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-800",
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.12 }}
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl transition-colors focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {startIcon && <span className="inline-flex items-center shrink-0">{startIcon}</span>}
      {children}
      {endIcon && <span className="inline-flex items-center shrink-0">{endIcon}</span>}
    </motion.button>
  );
};

export default Button;
export { Button };
