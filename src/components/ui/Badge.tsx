import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary border border-primary/20",
        primary:
          "bg-primary/10 text-primary border border-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground border border-border",
        destructive:
          "bg-destructive/10 text-destructive border border-destructive/20",
        error:
          "bg-destructive/10 text-destructive border border-destructive/20",
        success:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
        warning:
          "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
        info:
          "bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20",
        outline:
          "text-foreground border border-border",
        light:
          "bg-accent text-accent-foreground border border-primary/20",
        solid:
          "bg-primary text-primary-foreground",
      },
      size: {
        sm: "px-2 py-0.2 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "destructive"
    | "error"
    | "success"
    | "warning"
    | "info"
    | "outline"
    | "light"
    | "solid"
    | null;
  size?: "sm" | "md" | "lg" | null;
  color?: string; // support legacy color prop
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  className?: string;
}

function Badge({
  className,
  variant,
  size,
  color,
  startIcon,
  endIcon,
  children,
  ...props
}: BadgeProps) {
  // Resolve legacy color + variant styling
  let resolvedVariant: any = variant || "default";

  if (color) {
    if (color === "success") resolvedVariant = "success";
    else if (color === "warning") resolvedVariant = "warning";
    else if (color === "error" || color === "danger") resolvedVariant = "destructive";
    else if (color === "info") resolvedVariant = "info";
    else if (color === "primary") resolvedVariant = "primary";
    else if (color === "dark" || color === "secondary") resolvedVariant = "secondary";
  }

  // Handle solid overrides if variant === "solid"
  const solidStyles: Record<string, string> = {
    primary: "bg-primary text-primary-foreground",
    success: "bg-emerald-600 text-white",
    warning: "bg-amber-500 text-white",
    error: "bg-destructive text-destructive-foreground",
    info: "bg-sky-600 text-white",
    dark: "bg-secondary text-secondary-foreground",
  };

  const isSolid = variant === "solid";
  const solidClass = isSolid && color && solidStyles[color] ? solidStyles[color] : "";

  return (
    <div
      className={cn(
        badgeVariants({ variant: isSolid && color ? "solid" : resolvedVariant, size }),
        solidClass,
        className
      )}
      {...props}
    >
      {startIcon && <span className="inline-flex shrink-0">{startIcon}</span>}
      {children}
      {endIcon && <span className="inline-flex shrink-0">{endIcon}</span>}
    </div>
  );
}

export { Badge, badgeVariants };
export default Badge;
