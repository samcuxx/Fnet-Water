import React from "react";

export type ProgressBarProps = {
  progress: number;
  size?: "sm" | "md" | "lg" | "xl";
  label?: "none" | "outside" | "inside";
  className?: string;
  color?: "brand" | "success" | "warning" | "error";
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = "sm",
  label = "none",
  className = "",
  color = "brand",
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
    xl: "h-5",
  };

  const colorClasses = {
    brand: "bg-brand-500",
    success: "bg-success-500",
    warning: "bg-warning-500",
    error: "bg-error-500",
  };

  const baseClasses =
    "relative w-full bg-gray-200 rounded-full dark:bg-gray-800 overflow-hidden";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${baseClasses} ${sizeClasses[size]}`}>
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-300 rounded-full flex items-center justify-center`}
          style={{ width: `${clampedProgress}%` }}
        >
          {label === "inside" && size !== "sm" && (
            <span className="text-white font-medium text-[10px] leading-none px-1">
              {clampedProgress}%
            </span>
          )}
        </div>
      </div>
      {label === "outside" && (
        <span className="text-xs font-medium text-gray-700 dark:text-gray-400 shrink-0">
          {clampedProgress}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
export { ProgressBar };
