import * as React from "react";

import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";

type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300",
  secondary:
    "bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200 disabled:text-brand-400",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:text-slate-400",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200",
  danger:
    "bg-danger-600 text-white shadow-sm hover:bg-danger-700 active:bg-danger-700 disabled:bg-danger-500/50",
  success:
    "bg-success-600 text-white shadow-sm hover:bg-success-700 active:bg-success-700 disabled:bg-success-500/50",
};

const SIZES: Record<ButtonSize, string> = {
  // Minimum 40px tall so targets stay comfortable on a phone.
  sm: "h-9 gap-1.5 px-3 text-sm",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2 px-6 text-base",
  icon: "h-10 w-10",
};

const BASE =
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 " +
  "disabled:cursor-not-allowed";

/**
 * Button styling as a class string, for elements that must stay a link.
 * A navigation target needs to be an `<a>` for middle-click, copy-link and
 * keyboard behaviour, so it cannot reuse the `<button>` element itself.
 */
export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className);
}

export type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and blocks interaction. Pair with `useActionState` pending. */
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  fullWidth = false,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      // aria-busy lets assistive tech announce the pending state, which a
      // spinner alone does not convey.
      aria-busy={isLoading || undefined}
      disabled={disabled || isLoading}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {loadingText ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
