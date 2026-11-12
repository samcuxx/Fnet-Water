import { cn } from "@/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

const badgeStyles = cva("inline-flex items-center gap-1.5 rounded-full font-medium [&>svg]:size-3", {
  variants: {
    size: {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-0.5 text-sm",
      lg: "px-3 py-1 text-sm",
    },
    color: {
      gray: "bg-badge-neutral-background text-badge-neutral-text [&>svg]:text-badge-neutral-icon-color",
      neutral: "bg-badge-neutral-background text-badge-neutral-text [&>svg]:text-badge-neutral-icon-color",
      primary:
        "bg-badge-primary-background text-badge-primary-text [&>svg]:text-badge-primary-icon-color",
      error: "bg-badge-error-background text-badge-error-text [&>svg]:text-badge-error-icon-color",
      warning:
        "bg-badge-warning-background text-badge-warning-text [&>svg]:text-badge-warning-icon-color",
      success:
        "bg-badge-success-background text-badge-success-text [&>svg]:text-badge-success-icon-color",
      cyan: "bg-badge-cyan-background text-badge-cyan-text [&>svg]:text-badge-cyan-icon-color",
      sky: "bg-badge-cyan-background text-badge-cyan-text [&>svg]:text-badge-cyan-icon-color",
      blue: "bg-badge-primary-background text-badge-primary-text [&>svg]:text-badge-primary-icon-color",
      violet:
        "bg-badge-violet-background text-badge-violet-text [&>svg]:text-badge-violet-icon-color",
      purple:
        "bg-badge-violet-background text-badge-violet-text [&>svg]:text-badge-violet-icon-color",
      orange:
        "bg-badge-warning-background text-badge-warning-text [&>svg]:text-badge-warning-icon-color",
    },
  },
  defaultVariants: {
    size: "sm",
    color: "primary",
  },
});

export type BadgeProps = ComponentProps<"span"> &
  VariantProps<typeof badgeStyles> & {
    prefixIcon?: React.ReactNode;
    suffixIcon?: React.ReactNode;
  };

export function Badge({
  color,
  size,
  className,
  prefixIcon,
  suffixIcon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeStyles({ color, size }), className)}
      {...props}
    >
      {prefixIcon}
      {children}
      {suffixIcon}
    </span>
  );
}
