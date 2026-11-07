import React, { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface LabelProps {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
}

const Label: FC<LabelProps> = ({ htmlFor, children, className, required = false }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={twMerge(
        "mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300",
        className
      )}
    >
      {children}
      {required && <span className="text-error-500 ml-1">*</span>}
    </label>
  );
};

export default Label;
export { Label };
