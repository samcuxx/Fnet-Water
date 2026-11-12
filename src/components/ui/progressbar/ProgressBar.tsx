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
    brand: "bg-primary",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-destructive",
  };

  const baseClasses =
    "relative w-full bg-muted rounded-full overflow-hidden";

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
        <span className="text-xs font-medium text-muted-foreground shrink-0">
          {clampedProgress}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
export { ProgressBar };
